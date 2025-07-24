from pydantic import BaseModel, Field
from typing import Optional
from datetime import date


# ─────────────────────────────────────────────────────────────
# 1. Main Dashboard Metrics Table
# ─────────────────────────────────────────────────────────────

class ContractMetric(BaseModel):
    id: Optional[int] = None
    title: str
    contract_type: Optional[str] = None
    stage: str
    intake_date: date
    executed_date: Optional[date] = None
    compliance_status: str
    amount: Optional[float] = None


# ─────────────────────────────────────────────────────────────
# 2. Activity Feed – contract_events
# ─────────────────────────────────────────────────────────────

class ContractEvent(BaseModel):
    id: Optional[int] = None
    contract_id: int
    description: str
    timestamp: str  # ISO 8601 string, or use datetime if you're parsing


# ─────────────────────────────────────────────────────────────
# 3. AI Recommendations
# ─────────────────────────────────────────────────────────────

class AIRecommendation(BaseModel):
    id: Optional[int] = None
    contract_id: int
    text: str
    created_at: str  # ISO 8601


# ─────────────────────────────────────────────────────────────
# 4. Tasks Table
# ─────────────────────────────────────────────────────────────

class Task(BaseModel):
    id: Optional[int] = None
    contract_id: int
    title: str
    due_date: date
    assignee: Optional[str] = None
    status: str  # 'open' or 'closed'


# ─────────────────────────────────────────────────────────────
# 5. Lookup: Stages
# ─────────────────────────────────────────────────────────────

class Stage(BaseModel):
    id: Optional[int] = None
    name: str


# ─────────────────────────────────────────────────────────────
# 6. Lookup: Compliance Statuses
# ─────────────────────────────────────────────────────────────

class ComplianceStatus(BaseModel):
    id: Optional[int] = None
    name: str