import aiosqlite
import json
from typing import List, Optional
from pathlib import Path
from .models import Rule, Action, MatchType, ActionType, Workspace
from .database import DB_PATH

class RulesRepository:
    def __init__(self, db_path: Path = DB_PATH):
        self.db_path = db_path

    async def add_rule(self, rule: Rule, workspace_id: str = 'default'):
        """Insert a new rule into the database linked to a workspace."""
        async with aiosqlite.connect(self.db_path) as db:
            actions_json = json.dumps([a.model_dump() for a in rule.actions])
            await db.execute("""
                INSERT OR REPLACE INTO rules (id, name, match_type, pattern, actions, is_active, delay, workspace_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (rule.id, rule.name, rule.match_type.value, rule.pattern, actions_json, rule.is_active, rule.delay, workspace_id))
            await db.commit()

    async def list_rules(self, workspace_id: Optional[str] = None) -> List[Rule]:
        """Retrieve rules from the database, optionally filtered by workspace."""
        rules = []
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            query = "SELECT * FROM rules"
            params = []
            if workspace_id:
                query += " WHERE workspace_id = ?"
                params.append(workspace_id)
            
            async with db.execute(query, params) as cursor:
                async for row in cursor:
                    rule_data = dict(row)
                    rule_data["actions"] = json.loads(row["actions"])
                    rules.append(Rule.model_validate(rule_data))
        return rules

    async def delete_rule(self, rule_id: str):
        """Remove a rule by its ID."""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("DELETE FROM rules WHERE id = ?", (rule_id,))
            await db.commit()

    async def get_all_active_rules(self) -> List[Rule]:
        """Retrieve only active rules from the active workspace."""
        # This will be used by the proxy; it should only load rules from active workspaces
        active_rules = []
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("""
                SELECT rules.* FROM rules 
                JOIN workspaces ON rules.workspace_id = workspaces.id 
                WHERE workspaces.is_active = 1 AND rules.is_active = 1
            """) as cursor:
                async for row in cursor:
                    rule_data = dict(row)
                    rule_data["actions"] = json.loads(row["actions"])
                    active_rules.append(Rule.model_validate(rule_data))
        return active_rules

class WorkspaceRepository:
    def __init__(self, db_path: Path = DB_PATH):
        self.db_path = db_path

    async def list_workspaces(self) -> List[Workspace]:
        """Retrieve all workspaces."""
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM workspaces ORDER BY created_at ASC") as cursor:
                rows = await cursor.fetchall()
                return [Workspace.model_validate(dict(row)) for row in rows]

    async def add_workspace(self, workspace_id: str, name: str, description: str = ""):
        """Create a new workspace."""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                INSERT INTO workspaces (id, name, description, is_active)
                VALUES (?, ?, ?, 0)
            """, (workspace_id, name, description))
            await db.commit()

    async def set_active_workspace(self, workspace_id: str):
        """Set exactly one workspace as active."""
        async with aiosqlite.connect(self.db_path) as db:
            # First, deactivate all
            await db.execute("UPDATE workspaces SET is_active = 0")
            # Then, activate the selected one
            await db.execute("UPDATE workspaces SET is_active = 1 WHERE id = ?", (workspace_id,))
            await db.commit()

    async def get_bundle(self, workspace_id: str) -> dict:
        """Export workspace and its rules into a portable bundle."""
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            # Get workspace info
            async with db.execute("SELECT * FROM workspaces WHERE id = ?", (workspace_id,)) as cursor:
                workspace = await cursor.fetchone()
                if not workspace:
                    return {}
            
            # Get rules
            async with db.execute("SELECT * FROM rules WHERE workspace_id = ?", (workspace_id,)) as cursor:
                rules = await cursor.fetchall()
                
            return {
                "version": "1.0",
                "workspace": dict(workspace),
                "rules": [dict(r) for r in rules]
            }

    async def import_bundle(self, bundle: dict):
        """Import a workspace and its rules from a bundle."""
        async with aiosqlite.connect(self.db_path) as db:
            # Import workspace
            w = bundle["workspace"]
            await db.execute("""
                INSERT OR REPLACE INTO workspaces (id, name, description, is_active)
                VALUES (?, ?, ?, 0)
            """, (w["id"], w["name"], w.get("description", "")))
            
            # Import rules
            for r in bundle["rules"]:
                await db.execute("""
                    INSERT OR REPLACE INTO rules (id, name, match_type, pattern, actions, is_active, delay, workspace_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (r["id"], r["name"], r["match_type"], r["pattern"], r["actions"], r["is_active"], r.get("delay", 0), w["id"]))
            
            await db.commit()

    async def get_active_workspace_id(self) -> str:
        """Retrieve the currently active workspace ID."""
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT id FROM workspaces WHERE is_active = 1 LIMIT 1") as cursor:
                row = await cursor.fetchone()
                return row["id"] if row else 'default'

class TrafficRepository:
    def __init__(self, db_path: Path = DB_PATH):
        self.db_path = db_path

    async def add_log(self, log_data: dict):
        """Insert a traffic log entry into the database."""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                INSERT OR REPLACE INTO traffic_logs (
                    id, method, url, path, status, content_type, latency, 
                    request_headers, response_headers, rule_id, stage, overhead
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                log_data.get("id"),
                log_data.get("method"),
                log_data.get("url"),
                log_data.get("path"),
                log_data.get("status"),
                log_data.get("type"),
                log_data.get("latency", 0),
                json.dumps(log_data.get("request_headers", {})),
                json.dumps(log_data.get("response_headers", {})),
                log_data.get("rule_id"),
                log_data.get("stage"),
                log_data.get("overhead", 0)
            ))
            await db.commit()

    async def get_logs(self, limit: int = 50, offset: int = 0, method: str = None, status: int = None, url_pattern: str = None) -> List[dict]:
        """Retrieve historical logs with advanced filtering."""
        logs = []
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            
            query = "SELECT * FROM traffic_logs"
            conditions = []
            params = []
            
            if method:
                conditions.append("method = ?")
                params.append(method.upper())
            if status:
                conditions.append("status = ?")
                params.append(status)
            if url_pattern:
                conditions.append("url LIKE ?")
                params.append(f"%{url_pattern}%")
                
            if conditions:
                query += " WHERE " + " AND ".join(conditions)
                
            query += " ORDER BY timestamp DESC LIMIT ? OFFSET ?"
            params.extend([limit, offset])
            
            async with db.execute(query, params) as cursor:
                async for row in cursor:
                    log_item = dict(row)
                    log_item["request_headers"] = json.loads(row["request_headers"] or "{}")
                    log_item["response_headers"] = json.loads(row["response_headers"] or "{}")
                    logs.append(log_item)
        return logs

    async def clear_history(self):
        """Wipe all historical traffic logs."""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("DELETE FROM traffic_logs")
            await db.commit()
