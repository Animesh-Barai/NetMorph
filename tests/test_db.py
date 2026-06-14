import pytest
import asyncio
from pathlib import Path
from core.models import Rule, Action, MatchType, ActionType
from core.database import init_db
from core.repository import RulesRepository

@pytest.mark.asyncio
async def test_rule_crud():
    # Setup
    test_db = Path("test_rules.db")
    if test_db.exists(): test_db.unlink()
    
    # Init DB
    from core import database
    database.DB_PATH = test_db
    await init_db()
    
    repo = RulesRepository(test_db)
    
    # Create
    rule = Rule(
        id="test-1",
        name="Test Rule",
        match_type=MatchType.EXACT,
        pattern="test.com",
        actions=[Action(type=ActionType.REDIRECT, config={"to": "bing.com"})]
    )
    await repo.add_rule(rule)
    
    # List
    rules = await repo.list_rules()
    assert len(rules) == 1
    assert rules[0].id == "test-1"
    assert rules[0].actions[0].type == ActionType.REDIRECT
    
    # Delete
    await repo.delete_rule("test-1")
    rules = await repo.list_rules()
    assert len(rules) == 0
    
    # Cleanup
    test_db.unlink()

@pytest.mark.asyncio
async def test_toggle_rule_preserves_workspace():
    # Setup
    test_db = Path("test_toggle.db")
    if test_db.exists(): test_db.unlink()
    
    from core import database
    database.DB_PATH = test_db
    await database.init_db()
    
    from core.repository import WorkspaceRepository, RulesRepository
    w_repo = WorkspaceRepository(test_db)
    r_repo = RulesRepository(test_db)
    
    # 1. Create a custom workspace
    await w_repo.add_workspace("custom-ws", "Custom Workspace", "Workspace for testing toggles")
    
    # 2. Add rule linked to custom workspace
    rule = Rule(
        id="rule-to-toggle",
        name="Test Toggle Workspace Rule",
        match_type=MatchType.EXACT,
        pattern="toggle.com",
        actions=[],
        is_active=True
    )
    await r_repo.add_rule(rule, workspace_id="custom-ws")
    
    # Verify initially in custom workspace
    rules = await r_repo.list_rules(workspace_id="custom-ws")
    assert len(rules) == 1
    assert rules[0].id == "rule-to-toggle"
    assert rules[0].is_active is True
    
    # 3. Toggle the rule
    new_status = await r_repo.toggle_rule("rule-to-toggle")
    assert new_status is False
    
    # Verify toggled status
    rules_custom = await r_repo.list_rules(workspace_id="custom-ws")
    assert len(rules_custom) == 1
    assert rules_custom[0].id == "rule-to-toggle"
    assert rules_custom[0].is_active is False
    
    # Verify it did not migrate to default workspace
    rules_default = await r_repo.list_rules(workspace_id="default")
    assert len(rules_default) == 0
    
    # Cleanup
    test_db.unlink()
