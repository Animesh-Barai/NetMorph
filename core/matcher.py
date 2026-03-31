import re
from typing import List, Optional, Dict
from .models import Rule, MatchType

class RuleMatcher:
    def __init__(self, rules: List[Rule]):
        self.exact_matches: Dict[str, Rule] = {}
        self.pattern_matches: List[Rule] = []
        self._load_rules(rules)

    def _load_rules(self, rules: List[Rule]):
        for rule in rules:
            if not rule.is_active:
                continue
            
            if rule.match_type == MatchType.EXACT:
                # O(1) fast path
                self.exact_matches[rule.pattern] = rule
            else:
                # Regex path
                if rule.match_type == MatchType.REGEX:
                    rule._compiled_regex = re.compile(rule.pattern)
                elif rule.match_type == MatchType.CONTAINS:
                    # Escape and compile for contains matching
                    rule._compiled_regex = re.compile(re.escape(rule.pattern))
                self.pattern_matches.append(rule)

    def match(self, url: str) -> Optional[Rule]:
        """Perform high-performance rule matching."""
        # 1. Exact Match (O(1))
        if url in self.exact_matches:
            return self.exact_matches[url]

        # 2. Pattern Match (Regex)
        for rule in self.pattern_matches:
            if rule._compiled_regex.search(url):
                return rule

        return None
