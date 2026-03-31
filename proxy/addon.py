import asyncio
import os
import httpx
import json
import logging
import time
from mitmproxy import http
from core.models import Rule, MatchType, Action, ActionType
from core.matcher import RuleMatcher
from core.engine import RuleEngine
from core.repository import RulesRepository
from core import database

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("NetMorph-Proxy")

API_URL = "http://localhost:8000/push-log"

class AsyncNetMorph:
    def __init__(self):
        self.repo = RulesRepository()
        self.matcher = RuleMatcher([])
        self.engine = RuleEngine()
        self.last_mtime = 0
        self.client = httpx.AsyncClient()

    async def running(self):
        """Called when proxy is up."""
        await database.init_db()
        await self._reload_rules()

    async def _reload_rules(self):
        """Load rules from DB into memory."""
        db_path = database.DB_PATH
        if not db_path.exists():
            return
            
        current_mtime = os.path.getmtime(db_path)
        if current_mtime > self.last_mtime:
            rules = await self.repo.get_all_active_rules()
            self.matcher = RuleMatcher(rules)
            self.last_mtime = current_mtime

    async def request(self, flow: http.HTTPFlow) -> None:
        await self._reload_rules()
        
        start_time = time.perf_counter()
        url = flow.request.pretty_url
        rule = self.matcher.match(url)
        
        if rule:
            await self.engine.apply_actions(flow, rule)
        
        overhead = (time.perf_counter() - start_time) * 1000 # in ms
        setattr(flow, "netmorph_overhead", overhead)
            
        await self.push_log(flow, "request")

    async def response(self, flow: http.HTTPFlow) -> None:
        await self.push_log(flow, "response")

    async def push_log(self, flow: http.HTTPFlow, stage: str):
        """Send log entry to the FastAPI control server with metadata."""
        try:
            # Capture matched rule and overhead if available
            rule_id = getattr(flow, "netmorph_rule_id", None)
            overhead = getattr(flow, "netmorph_overhead", 0)
            
            log_data = {
                "id": flow.id,
                "method": flow.request.method,
                "url": flow.request.pretty_url,
                "path": flow.request.path,
                "status": flow.response.status_code if flow.response else None,
                "type": flow.response.headers.get("Content-Type") if flow.response else None,
                "latency": (flow.response.timestamp_end - flow.request.timestamp_start) if (flow.response and flow.request) else 0,
                "overhead": overhead,
                "stage": stage,
                "rule_id": rule_id,
                "request_headers": dict(flow.request.headers),
                "response_headers": dict(flow.response.headers) if flow.response else {}
            }
            await self.client.post(API_URL, json=log_data)
        except Exception as e:
            logger.error(f"Failed to push log: {e}")

addons = [
    AsyncNetMorph()
]
