from fastapi import FastAPI, WebSocket, WebSocketDisconnect, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Deque
import asyncio
import json
import logging
from collections import deque
from core.models import Rule, ActionType, MatchType, Action
from core.repository import RulesRepository, TrafficRepository, WorkspaceRepository
from core import database
from core.settings import SystemSettings, load_settings, save_settings

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("NetMorph-API")

app = FastAPI(title="NetMorph Control API")

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    await database.init_db()

# Add CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

repo = RulesRepository()
traffic_repo = TrafficRepository()
workspace_repo = WorkspaceRepository()

# Simple broadcaster for WebSockets
class Broadcaster:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.history: Deque[Dict[str, Any]] = deque(maxlen=100) # Keep last 100 logs in memory

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        # Send history to new client
        for log in self.history:
            await websocket.send_json(log)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        self.history.append(message)
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

broadcaster = Broadcaster()

# --- REST Endpoints ---

@app.get("/workspaces")
async def get_workspaces():
    return await workspace_repo.list_workspaces()

class WorkspaceCreate(BaseModel):
    name: str
    description: Optional[str] = ""

@app.post("/workspaces")
async def create_workspace(data: WorkspaceCreate):
    workspace_id = data.name.lower().replace(" ", "-")
    await workspace_repo.add_workspace(workspace_id, data.name, data.description or "")
    return {"id": workspace_id, "status": "ok"}

@app.post("/workspaces/{workspace_id}/activate")
async def activate_workspace(workspace_id: str):
    await workspace_repo.set_active_workspace(workspace_id)
    return {"status": "ok"}

@app.get("/workspaces/{workspace_id}/export")
async def export_workspace(workspace_id: str):
    """Export workspace and its rules as a JSON bundle."""
    bundle = await workspace_repo.get_bundle(workspace_id)
    if not bundle:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return bundle

@app.post("/workspaces/import")
async def import_workspace(bundle: Dict[str, Any]):
    """Import a workspace and its rules from a JSON bundle."""
    try:
        await workspace_repo.import_bundle(bundle)
        return {"status": "ok", "workspace": bundle["workspace"]["id"]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Import failed: {str(e)}")

@app.get("/rules", response_model=List[Rule])
async def get_rules(workspace_id: Optional[str] = None):
    # If no workspace_id provided, use the active one
    target_id = workspace_id or await workspace_repo.get_active_workspace_id()
    return await repo.list_rules(workspace_id=target_id)

@app.post("/rules")
async def create_rule(rule: Rule, workspace_id: Optional[str] = None):
    target_id = workspace_id or await workspace_repo.get_active_workspace_id()
    # Add Rule uses ID from the model (auto-generated if missing)
    await repo.add_rule(rule, workspace_id=target_id)
    return rule

@app.delete("/rules/{rule_id}")
async def delete_rule(rule_id: str):
    await repo.delete_rule(rule_id)
    return {"status": "ok"}

@app.post("/rules/{rule_id}/toggle")
async def toggle_rule(rule_id: str):
    rules = await repo.list_rules()
    rule = next((r for r in rules if r.id == rule_id), None)
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    rule.is_active = not rule.is_active
    await repo.add_rule(rule)
    return {"status": "ok", "is_active": rule.is_active}

@app.get("/logs")
async def get_logs(
    limit: int = 50, 
    offset: int = 0, 
    method: Optional[str] = None, 
    status: Optional[int] = None, 
    url: Optional[str] = None
):
    """Retrieve historical logs with advanced pagination and filtering."""
    return await traffic_repo.get_logs(
        limit=limit, 
        offset=offset, 
        method=method, 
        status=status, 
        url_pattern=url
    )

@app.delete("/logs")
async def clear_logs():
    """Wipe historical logs."""
    await traffic_repo.clear_history()
    return {"status": "ok"}

# --- Internal Push Endpoint (for mitmproxy addon) ---

@app.post("/push-log")
async def push_log(log: Dict[str, Any]):
    """Endpoint for proxy engine to push intercepted traffic logs."""
    # Persist to DB in the background
    asyncio.create_task(traffic_repo.add_log(log))
    # Stream to UI
    await broadcaster.broadcast(log)
    return {"status": "ok"}

@app.get("/settings")
async def get_settings():
    return load_settings()

@app.post("/settings")
async def update_settings(settings: SystemSettings):
    save_settings(settings)
    return {"status": "ok"}

# --- WebSocket ---

@app.websocket("/ws/logs")
async def websocket_endpoint(websocket: WebSocket):
    await broadcaster.connect(websocket)
    try:
        while True:
            await websocket.receive_text() # Just keep alive
    except WebSocketDisconnect:
        broadcaster.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
