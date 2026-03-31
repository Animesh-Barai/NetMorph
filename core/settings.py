import json
import os
from pathlib import Path
from pydantic import BaseModel, Field

SETTINGS_FILE = Path("config.json")

class SystemSettings(BaseModel):
    proxy_port: int = 8080
    upstream_strategy: str = "DIRECT"
    theme: str = "DARK"
    last_workspace: str = "default"

def load_settings() -> SystemSettings:
    if not SETTINGS_FILE.exists():
        settings = SystemSettings()
        save_settings(settings)
        return settings
    
    try:
        with open(SETTINGS_FILE, "r") as f:
            data = json.load(f)
            return SystemSettings.model_validate(data)
    except Exception:
        return SystemSettings()

def save_settings(settings: SystemSettings):
    with open(SETTINGS_FILE, "w") as f:
        json.dump(settings.model_dump(), f, indent=4)
