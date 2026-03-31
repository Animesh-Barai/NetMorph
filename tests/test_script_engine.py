import pytest
from unittest.mock import MagicMock
from core.models import Rule, Action, MatchType, ActionType
from core.engine import RuleEngine

@pytest.mark.asyncio
async def test_apply_script_modify_header():
    flow = MagicMock()
    flow.request = MagicMock()
    flow.request.headers = {}
    
    engine = RuleEngine()
    config = {"code": "flow.request.headers['X-Scripted'] = 'yes'; log('Hello Script')"}
    
    await engine.apply_script(flow, config)
    
    assert flow.request.headers["X-Scripted"] == "yes"

@pytest.mark.asyncio
async def test_apply_script_store():
    flow = MagicMock()
    engine = RuleEngine()
    
    # Script 1 sets a value
    config1 = {"code": "store['last_id'] = 42"}
    await engine.apply_script(flow, config1)
    
    # Script 2 reads the value
    config2 = {"code": "flow.request.headers['X-Stored-ID'] = str(store['last_id'])"}
    flow.request.headers = {}
    await engine.apply_script(flow, config2)
    
    assert flow.request.headers["X-Stored-ID"] == "42"
