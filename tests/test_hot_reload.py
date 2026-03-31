import pytest
import asyncio
import os
import time
from pathlib import Path
from unittest.mock import MagicMock
from core.models import Rule, Action, MatchType, ActionType
from core.repository import RulesRepository
from proxy.addon import AsyncNetMorph

@pytest.mark.asyncio
async def test_hot_reload_detection():
    # Setup
    from core import database
    test_db = Path("test_reload_2.db")
    if test_db.exists(): test_db.unlink()
    database.DB_PATH = test_db
    await database.init_db()
    
    addon = AsyncNetMorph()
    addon.repo = RulesRepository(test_db)
    
    # 1. Initial load (Empty)
    await addon._reload_rules()
    assert len(addon.matcher.exact_matches) == 0
    
    # 2. Add rule via Repository
    rule = Rule(
        id="r1", name="R1", match_type=MatchType.EXACT, pattern="test.com", actions=[]
    )
    await addon.repo.add_rule(rule)
    
    # MANUALLY FORCE MTIME CHANGE (Windows resolution fix)
    future_time = time.time() + 10
    os.utime(test_db, (future_time, future_time))
    
    # 3. Request triggers reload
    flow = MagicMock()
    flow.request = MagicMock()
    flow.request.pretty_url = "https://other.com"
    
    await addon.request(flow)
    
    # Verify rule was loaded
    assert "test.com" in addon.matcher.exact_matches
    
    # Cleanup
    if test_db.exists(): test_db.unlink()
