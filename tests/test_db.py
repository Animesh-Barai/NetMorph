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
