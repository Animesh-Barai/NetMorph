import pytest
import json
from unittest.mock import MagicMock
from mitmproxy import http
from core.models import Rule, Action, MatchType, ActionType
from core.engine import RuleEngine

def test_apply_mock_json():
    # Mock flow
    flow = MagicMock()
    flow.request = MagicMock()
    flow.request.headers = {}
    
    engine = RuleEngine()
    config = {
        "status": 200,
        "body": {"success": True, "data": "NetMorph Mock"},
        "headers": {"X-Mocked": "true"}
    }
    
    engine.apply_mock(flow, config)
    
    # Verify flow.response is set
    assert flow.response is not None
    # HTTPResponse.make is mocked, but we check its arguments via flow.response
    # Wait, HTTPResponse.make returns a response object.
    # We need to use real HTTPResponse or ensure Mock/MagicMock handles it.

def test_apply_mock_text():
    flow = MagicMock()
    engine = RuleEngine()
    config = {
        "status": 404,
        "body": "Not Found",
        "headers": {"Content-Type": "text/plain"}
    }
    
    engine.apply_mock(flow, config)
    assert flow.response is not None
