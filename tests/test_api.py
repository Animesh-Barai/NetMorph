import pytest
from pathlib import Path
from fastapi.testclient import TestClient

from core import database
from core.api import app, repo, traffic_repo, workspace_repo
from core.models import MatchType, ActionType

TEST_DB = Path("test_api.db")

@pytest.fixture(autouse=True)
def setup_test_db():
    # Set DB_PATH to a test database right before running tests in this file
    database.DB_PATH = TEST_DB
    
    # Re-route repository paths to the test database
    repo.db_path = TEST_DB
    traffic_repo.db_path = TEST_DB
    workspace_repo.db_path = TEST_DB

    # Clean up any residual db
    if TEST_DB.exists():
        try:
            TEST_DB.unlink()
        except OSError:
            pass
    
    # Initialize DB
    import asyncio
    asyncio.run(database.init_db())
    
    yield
    
    # Tear down
    if TEST_DB.exists():
        try:
            TEST_DB.unlink()
        except OSError:
            pass

def test_workspaces_endpoints():
    with TestClient(app) as client:
        # 1. Get workspaces (should have default)
        response = client.get("/workspaces")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert data[0]["id"] == "default"
        
        # 2. Create workspace
        response = client.post("/workspaces", json={"name": "Test Workspace", "description": "Desc"})
        assert response.status_code == 200
        assert response.json()["id"] == "test-workspace"
        
        # 3. Activate workspace
        response = client.post("/workspaces/test-workspace/activate")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"
        
        # Verify active workspace is now test-workspace
        response = client.get("/workspaces")
        workspaces = response.json()
        active = [w for w in workspaces if w["is_active"]]
        assert len(active) == 1
        assert active[0]["id"] == "test-workspace"

def test_rules_endpoints():
    with TestClient(app) as client:
        # 1. Create a rule in active workspace (default)
        rule_data = {
            "id": "rule-1",
            "name": "API Rule 1",
            "match_type": MatchType.EXACT.value,
            "pattern": "https://api.test.com/v1",
            "actions": [
                {
                    "type": ActionType.REDIRECT.value,
                    "config": {"to": "https://api.test.org/v1"},
                    "delay": 0
                }
            ],
            "is_active": True,
            "delay": 0
        }
        response = client.post("/rules", json=rule_data)
        assert response.status_code == 200
        assert response.json()["id"] == "rule-1"
        
        # 2. List rules (should return rule-1)
        response = client.get("/rules")
        assert response.status_code == 200
        rules = response.json()
        assert len(rules) == 1
        assert rules[0]["id"] == "rule-1"
        
        # 3. Toggle rule
        response = client.post("/rules/rule-1/toggle")
        assert response.status_code == 200
        assert response.json()["is_active"] is False
        
        # Verify it is still in the active workspace (default)
        response = client.get("/rules?workspace_id=default")
        rules_default_ws = response.json()
        assert len(rules_default_ws) == 1
        assert rules_default_ws[0]["is_active"] is False
        
        # 4. Delete rule
        response = client.delete("/rules/rule-1")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"
        
        # Verify rule is deleted
        response = client.get("/rules")
        assert len(response.json()) == 0

def test_logs_endpoints():
    with TestClient(app) as client:
        # 1. Push log
        log_payload = {
            "id": "flow-1",
            "method": "GET",
            "url": "https://example.com/api",
            "path": "/api",
            "status": 200,
            "type": "application/json",
            "latency": 0.05,
            "overhead": 1.2,
            "stage": "response",
            "rule_id": "rule-1",
            "request_headers": {"Accept": "application/json"},
            "response_headers": {"Content-Type": "application/json"}
        }
        response = client.post("/push-log", json=log_payload)
        assert response.status_code == 200
        assert response.json()["status"] == "ok"
        
        # Give async task a brief moment to write to database
        import time
        time.sleep(0.5)
        
        # 2. Get logs (verify content-type is mapped to type)
        response = client.get("/logs")
        assert response.status_code == 200
        logs = response.json()
        assert len(logs) >= 1
        matched_log = [l for l in logs if l["id"] == "flow-1"]
        assert len(matched_log) == 1
        assert matched_log[0]["type"] == "application/json"
        
        # 3. Clear logs
        response = client.delete("/logs")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"
        
        # Verify logs are cleared
        response = client.get("/logs")
        assert len(response.json()) == 0

def test_settings_endpoints():
    with TestClient(app) as client:
        # 1. Get settings
        response = client.get("/settings")
        assert response.status_code == 200
        settings = response.json()
        assert "proxy_port" in settings
        
        # 2. Post settings
        new_settings = {
            "proxy_port": 9090,
            "upstream_strategy": "SYSTEM",
            "theme": "LIGHT",
            "last_workspace": "test-workspace"
        }
        response = client.post("/settings", json=new_settings)
        assert response.status_code == 200
        assert response.json()["status"] == "ok"
        
        # Verify settings updated
        response = client.get("/settings")
        settings = response.json()
        assert settings["proxy_port"] == 9090
        assert settings["upstream_strategy"] == "SYSTEM"
        
        # Cleanup config.json if generated during test
        config_file = Path("config.json")
        if config_file.exists():
            try:
                response = client.post("/settings", json={
                    "proxy_port": 8080,
                    "upstream_strategy": "DIRECT",
                    "theme": "DARK",
                    "last_workspace": "default"
                })
            except Exception:
                pass
