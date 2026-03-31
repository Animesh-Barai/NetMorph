import pytest
from core.models import Rule, Action, MatchType, ActionType
from core.matcher import RuleMatcher

def test_exact_match():
    rule = Rule(id="1", name="Exact Test", match_type=MatchType.EXACT, pattern="https://example.com", actions=[])
    matcher = RuleMatcher([rule])
    assert matcher.match("https://example.com") == rule
    assert matcher.match("https://example.com/other") is None

def test_contains_match():
    rule = Rule(id="2", name="Contains Test", match_type=MatchType.CONTAINS, pattern="google.com", actions=[])
    matcher = RuleMatcher([rule])
    assert matcher.match("https://www.google.com/search") == rule
    assert matcher.match("https://bing.com") is None

def test_regex_match():
    rule = Rule(id="3", name="Regex Test", match_type=MatchType.REGEX, pattern=r".*\.net$", actions=[])
    matcher = RuleMatcher([rule])
    assert matcher.match("https://example.net") == rule
    assert matcher.match("https://example.com") is None

def test_inactive_rule():
    rule = Rule(id="4", name="Inactive Test", match_type=MatchType.EXACT, pattern="https://test.com", actions=[], is_active=False)
    matcher = RuleMatcher([rule])
    assert matcher.match("https://test.com") is None
