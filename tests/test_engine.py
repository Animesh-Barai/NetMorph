import pytest
from unittest.mock import MagicMock
from mitmproxy import http
from core.models import Rule, Action, MatchType, ActionType
from core.engine import RuleEngine

def test_apply_redirect():
    # Mock flow
    flow = MagicMock()
    flow.request = MagicMock()
    flow.request.headers = {}
    
    engine = RuleEngine()
    config = {"to": "https://example.org:8443"}
    
    engine.apply_redirect(flow, config)
    
    assert flow.request.scheme == "https"
    assert flow.request.host == "example.org"
    assert flow.request.port == 8443
    assert flow.request.headers["Host"] == "example.org"

def test_apply_header_mod_request():
    # Mock flow
    flow = MagicMock()
    flow.request = MagicMock()
    flow.request.headers = {"X-Old": "OldValue"}
    
    engine = RuleEngine()
    config = {
        "target": "request",
        "actions": [
            {"op": "set", "key": "X-New", "value": "NewValue"},
            {"op": "remove", "key": "X-Old"}
        ]
    }
    
    engine.apply_header_mod(flow, config)
    
    assert flow.request.headers["X-New"] == "NewValue"
    assert "X-Old" not in flow.request.headers

def test_apply_header_mod_response():
    # Mock flow
    flow = MagicMock()
    flow.response = MagicMock()
    flow.response.headers = {"X-Old": "OldValue"}
    
    engine = RuleEngine()
    config = {
        "target": "response",
        "actions": [
            {"op": "set", "key": "X-New", "value": "NewValue"},
            {"op": "remove", "key": "X-Old"}
        ]
    }
    
    engine.apply_header_mod(flow, config)
    
    assert flow.response.headers["X-New"] == "NewValue"
    assert "X-Old" not in flow.response.headers

@pytest.mark.asyncio
async def test_apply_actions_phase():
    flow = MagicMock()
    flow.request = MagicMock()
    flow.request.headers = {}
    flow.response = MagicMock()
    flow.response.headers = {}
    
    engine = RuleEngine()
    
    # Rule with request action and response action
    rule = Rule(
        id="test-phase",
        name="Phase Test",
        match_type=MatchType.EXACT,
        pattern="test.com",
        actions=[
            Action(type=ActionType.MODIFY_HEADER, config={
                "target": "request",
                "actions": [{"op": "set", "key": "X-Req", "value": "1"}]
            }),
            Action(type=ActionType.MODIFY_HEADER, config={
                "target": "response",
                "actions": [{"op": "set", "key": "X-Res", "value": "2"}]
            })
        ]
    )
    
    # Apply request phase
    await engine.apply_actions(flow, rule, phase="request")
    assert flow.request.headers.get("X-Req") == "1"
    assert "X-Res" not in flow.response.headers
    
    # Apply response phase
    await engine.apply_actions(flow, rule, phase="response")
    assert flow.response.headers.get("X-Res") == "2"
