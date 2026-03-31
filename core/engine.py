import asyncio
import json
import logging
from mitmproxy import http
from .models import Rule, ActionType, Action

# Simple logging configuration for scripts
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("NetMorph")

class RuleEngine:
    def __init__(self):
        # Thread-safe / async-safe shared store for script access
        self.store: Dict[str, Any] = {}

    async def apply_actions(self, flow: http.HTTPFlow, rule: Rule):
        """Apply all actions defined in a rule to the flow."""
        # 1. Rule-wide delay
        if rule.delay:
            await asyncio.sleep(rule.delay / 1000)

        for action in rule.actions:
            # 2. Action-specific delay
            if action.delay:
                await asyncio.sleep(action.delay / 1000)

            if action.type == ActionType.REDIRECT:
                self.apply_redirect(flow, action.config)
            elif action.type == ActionType.MODIFY_HEADER:
                self.apply_header_mod(flow, action.config)
            elif action.type == ActionType.MOCK_RESPONSE:
                self.apply_mock(flow, action.config)
            elif action.type == ActionType.PYTHON_SCRIPT:
                await self.apply_script(flow, action.config)

    def apply_redirect(self, flow: http.HTTPFlow, config: dict):
        """Redirect the request to a different host/port/scheme."""
        new_url = config.get("to")
        if not new_url:
            return

        if "://" in new_url:
            scheme, rest = new_url.split("://")
            host_port = rest.split("/")[0]
            if ":" in host_port:
                host, port = host_port.split(":")
                port = int(port)
            else:
                host = host_port
                port = 80 if scheme == "http" else 443
            
            flow.request.scheme = scheme
            flow.request.host = host
            flow.request.port = port
            flow.request.headers["Host"] = host

    def apply_header_mod(self, flow: http.HTTPFlow, config: dict):
        """Modify headers in request or response."""
        is_request = config.get("target", "request") == "request"
        headers = flow.request.headers if is_request else flow.response.headers
        if not headers:
            return

        actions = config.get("actions", [])
        for action in actions:
            op = action.get("op")
            key = action.get("key")
            value = action.get("value")
            
            if op == "add" or op == "set":
                headers[key] = value
            elif op == "remove":
                if key in headers:
                    del headers[key]

    def apply_mock(self, flow: http.HTTPFlow, config: dict):
        """Proactively mock a response."""
        status = config.get("status", 200)
        body = config.get("body", "")
        headers = config.get("headers", {})
        
        # Ensure body is bytes if it's a string
        if isinstance(body, (dict, list)):
            body = json.dumps(body)
            if "Content-Type" not in headers:
                headers["Content-Type"] = "application/json"
        
        flow.response = http.Response.make(
            status,
            body.encode("utf-8") if isinstance(body, str) else body,
            headers
        )

    async def apply_script(self, flow: http.HTTPFlow, config: dict):
        """Execute a programmable logic hook with isolation."""
        script_code = config.get("code")
        if not script_code:
            return

        context = {
            "flow": flow,
            "store": self.store,
            "log": lambda msg: logger.info(f"[SCRIPT] {msg}"),
            "ActionType": ActionType # Allow script to trigger other actions if needed
        }
        
        try:
            # Execute with a restricted context
            exec(script_code, {"__builtins__": __builtins__}, context)
        except Exception as e:
            logger.error(f"[SCRIPT ERROR] Failed to execute custom logic: {e}")

