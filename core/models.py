from typing import List, Optional, Dict, Any, Any as RegexType
from enum import Enum
from pydantic import BaseModel, Field, ConfigDict, field_validator, PrivateAttr
import uuid

class MatchType(str, Enum):
    EXACT = "exact"
    CONTAINS = "contains"
    REGEX = "regex"

class ActionType(str, Enum):
    REDIRECT = "redirect"
    MODIFY_HEADER = "modify_header"
    MOCK_RESPONSE = "mock_response"
    PYTHON_SCRIPT = "python_script"

class Action(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    type: ActionType
    config: Dict[str, Any] = Field(default_factory=dict)
    delay: Optional[int] = Field(None, ge=0, description="Delay in milliseconds")

class Rule(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str | None = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    match_type: MatchType
    pattern: str
    actions: List[Action]
    is_active: bool = True
    delay: Optional[int] = Field(None, ge=0, description="Rule-wide delay")
    
    _compiled_regex: Any = PrivateAttr(default=None)

class Workspace(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str | None = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = ""
    is_active: bool = False
    created_at: Optional[str] = None
