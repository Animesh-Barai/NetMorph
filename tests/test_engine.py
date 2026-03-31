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
