import os
import sqlite3
import json
from fastapi import FastAPI, APIRouter,Query
from typing import List
from pydantic import BaseModel
from typing import List, Optional
from fastapi import Query, HTTPException
from typing import Literal
from datetime import datetime, timedelta
from config import DB_PATH, CLAUSE_FILE

router = APIRouter()

DB_PATH = "contracts.db"
file_location = CLAUSE_FILE 

# --- Load JSON data and insert into DB ---
def load_clauses_from_json():
    with open(CLAUSE_FILE) as f:
        data = json.load(f)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    for clause in data:
        cursor.execute("""
            INSERT INTO contract_compliance (
                contract_id,
                clause_id,
                title,
                compliance_summary,
                compliance_confidence,
                closeout_status,
                risk_assessment
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            "Contract_2",
            clause.get("clause_id"),
            clause.get("title"),
            clause.get("compliance_summary"),
            clause.get("compliance_confidence", 0.0),
            clause.get("closeout_status"),
            clause.get("risk_assessment")
        ))
    conn.commit()
    conn.close()

@router.on_event("startup")
def startup_event():
    load_clauses_from_json()

# --- Data Model for contract compliance response ---
class ClauseCompliance(BaseModel):
    contract_id: str
    clause_id: str
    title: str
    compliance_summary: str
    compliance_confidence: float
    closeout_status: str
    risk_assessment: str

# --- Data Model for contract activity response ---
class ActivityItem(BaseModel):
    id: int
    type: str
    title: str
    description: str
    timestamp: str
    user: str
    contract_id: str
    priority: str

class ActivityFeed(BaseModel):
    activities: List[ActivityItem]
    total_count: int

# --- Data Model for AI Recommendations ativity ----
class AIRecommendation(BaseModel):
    id: int
    type: str
    title: str
    description: str
    priority: str
    confidence_score: float
    contract_id: str
    created_at: str

class AIRecommendationResponse(BaseModel):
    recommendations: List[AIRecommendation]
    total_count: int

# ---- Data Model for Active tasks -----
class Task(BaseModel):
    id: int
    title: str
    description: str
    status: str
    priority: str
    due_date: str
    assigned_to: str
    assigned_by: str
    contract_id: str
    created_at: str

class TaskSummary(BaseModel):
    total_tasks: int
    pending_tasks: int
    in_progress_tasks: int
    completed_tasks: int
    high_priority_tasks: int

class TaskResponse(BaseModel):
    tasks: List[Task]
    summary: TaskSummary

# ----- Data Model for Quick stats -----
class QuickStats(BaseModel):
    total_contracts: int
    average_growth_percentage: float
    average_response_time_hours: int
    success_rate_percentage: float
    active_users: int
    pending_approvals: int

# ----- Data Model for dashboard Overview ----
class ContractSummary(BaseModel):
    intake: int
    evaluation: int
    performance: int
    closeout: int
    total: int

class ContractEvent(BaseModel):
    contract_id: int
    event_type: Literal["renewal", "action_item"]
    event_date: str  # ISO format: YYYY-MM-DD
    description: str


class ContractMetric(BaseModel):
    contract_id: int
    contract_value: float
    risk_flag: int  # 0 or 1
    ai_confidence_score: float
    renewal_date: str  # ISO format


class DashboardMetricsResponse(BaseModel):
    time_range: str
    urgent_renewals: int
    value_at_risk: float
    ai_confidence: str  # Percent formatted string
    action_items: int

class AuditLog(BaseModel):
    id: int
    timestamp: str
    user: str
    action: str
    aiDecision: str
    confidence: int
    details: str
    category: str

class UserIn(BaseModel):
    name: str
    email: str
    role: str
    department: str

class UserOut(UserIn):
    id: int
    status: str
    last_active: str
    permissions: List[str]
    notifications: dict
    ai_explainability: bool

# class DashboardOverview(BaseModel):
#     contracts_summary: ContractStageSummary
#     compliance_percentage: float
#     quick_stats: QuickStats
#     recent_activities_count: int
#     ai_recommendations_count: int
#     active_tasks_count: int
#     high_priority_tasks_count: int

# --- Endpoint to get clause compliance data ---
@router.get("/api/contract/compliance", response_model=List[ClauseCompliance])
def get_all_clauses():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT contract_id, clause_id, title, compliance_summary, compliance_confidence, closeout_status, risk_assessment
        FROM contract_compliance
    """)
    rows = cursor.fetchall()
    conn.close()

    return [
        ClauseCompliance(
            contract_id=row[0],
            clause_id=row[1],
            title=row[2],
            compliance_summary=row[3],
            compliance_confidence=row[4],
            closeout_status=row[5],
            risk_assessment=row[6]
        )
        for row in rows
    ]

# --- Optional Endpoint: Compliance Summary ---
@router.get("/api/contract/compliance/summary")
def get_contract_compliance_summary(contract_id: Optional[int] = Query(None)):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Apply filter by contract_id if provided
    if contract_id is not None:
        cursor.execute("""
            SELECT
                SUM(CASE WHEN LOWER(compliance_summary) = 'compliant' THEN 1 ELSE 0 END) AS compliant_count,
                COUNT(*) AS total_count
            FROM contract_compliance
            WHERE contract_id = ?
        """, (contract_id,))
    else:
        cursor.execute("""
            SELECT
                SUM(CASE WHEN LOWER(compliance_summary) = 'compliant' THEN 1 ELSE 0 END) AS compliant_count,
                COUNT(*) AS total_count
            FROM contract_compliance
        """)

    result = cursor.fetchone()
    conn.close()

    compliant_count = result[0] or 0
    total_count = result[1] or 0

    if total_count == 0:
        raise HTTPException(status_code=404, detail="No compliance data found for the given contract ID" if contract_id else "No compliance data found.")

    non_compliant_count = total_count - compliant_count
    compliance_percentage = int((compliant_count / total_count) * 100)
    non_compliance_percentage = 100 - compliance_percentage

    if compliance_percentage >= 90:
        status = "excellent"
    elif compliance_percentage >= 75:
        status = "good"
    elif compliance_percentage >= 50:
        status = "fair"
    else:
        status = "poor"

    return {
        "scope": f"contract_id: {contract_id}" if contract_id is not None else "overall",
        "compliance_percentage": compliance_percentage,
        "non_compliance_percentage": non_compliance_percentage,
        "status": status,
        "details": {
            "compliant_clauses": compliant_count,
            "non_compliant_clauses": non_compliant_count,
            "total_clauses": total_count
        }
    }

# ----- seed clause activity data ------
@router.post("/api/dashboard/activity/seed")
def seed_sample_activities():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 🛠️ Create table if missing
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS contract_activity (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT,
            title TEXT,
            description TEXT,
            timestamp TEXT,
            user TEXT,
            contract_id TEXT,
            priority TEXT
        )
    """)

    # Insert sample records
    sample_data = [
        (
            "contract_update",
            "Contract ABC-123 moved to Performance stage",
            "Contract evaluation completed successfully",
            "2024-01-15T10:30:00Z",
            "John Doe",
            "ABC-123",
            "normal"
        ),
        (
            "deadline_approaching",
            "Contract XYZ-456 deadline in 3 days",
            "Performance review deadline approaching",
            "2024-01-15T09:15:00Z",
            "System",
            "XYZ-456",
            "high"
        ),
         (
        "compliance_flag",
        "Compliance issue flagged for Contract JKL-987",
        "Missing required audit trail documentation",
        "2024-02-01T14:45:00Z",
        "Compliance Bot",
        "JKL-987",
        "critical"
    ),
    (
        "milestone_achieved",
        "Phase 1 completed for Contract DEF-789",
        "Vendor submitted deliverables ahead of schedule",
        "2024-01-28T11:00:00Z",
        "Alice Johnson",
        "DEF-789",
        "normal"
    ),
    (
        "contract_update",
        "Contract MNO-112 updated with Amendment #2",
        "Extension granted through Q3 2024",
        "2024-02-10T13:20:00Z",
        "Michael Lee",
        "MNO-112",
        "normal"
    ),
    (
        "risk_alert",
        "High-risk vendor identified for Contract GHI-654",
        "Contract flagged for financial instability",
        "2024-02-05T08:40:00Z",
        "Risk Engine",
        "GHI-654",
        "high"
    ),
    (
        "deadline_missed",
        "Compliance documentation overdue for Contract EFG-321",
        "Task assigned to Jane Smith remains incomplete",
        "2024-02-12T16:30:00Z",
        "System",
        "EFG-321",
        "critical"
    ),
    (
        "contract_renewed",
        "Contract TUV-555 successfully renewed",
        "Renewal approved through 2026",
        "2024-03-01T09:00:00Z",
        "Priya Patel",
        "TUV-555",
        "normal"
    ),
    (
        "payment_received",
        "Payment received for Contract PQR-808",
        "Invoice #INV-20240101 settled",
        "2024-02-20T12:00:00Z",
        "Finance Bot",
        "PQR-808",
        "low"
    ),
    (
        "escalation_notice",
        "Escalation triggered for Contract LMN-321",
        "Multiple missed deadlines in Q1",
        "2024-02-15T15:10:00Z",
        "System",
        "LMN-321",
        "high"
    )
    ]

    cursor.executemany("""
        INSERT INTO contract_activity (type, title, description, timestamp, user, contract_id, priority)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, sample_data)

    conn.commit()
    conn.close()

    return {
        "message": "Sample activity data inserted successfully",
        "inserted": len(sample_data)
    }


# ------------------------
# GET Endpoint for clause_activity
# ------------------------
@router.get("/api/dashboard/activity/recent", response_model=ActivityFeed)
def get_recent_activities(limit: int = Query(10, ge=1)):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, type, title, description, timestamp, user, contract_id, priority
        FROM contract_activity
        ORDER BY datetime(timestamp) DESC
        LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()

    cursor.execute("SELECT COUNT(*) FROM contract_activity")
    total_count = cursor.fetchone()[0]
    conn.close()

    activities = [
        ActivityItem(
            id=row[0],
            type=row[1],
            title=row[2],
            description=row[3],
            timestamp=row[4],
            user=row[5],
            contract_id=row[6],
            priority=row[7]
        )
        for row in rows
    ]
    return ActivityFeed(activities=activities, total_count=total_count)

# -- create table and seed data for AI recommendations
@router.post("/api/dashboard/recommendations/seed")
def seed_ai_recommendations():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("DROP TABLE IF EXISTS ai_recommendations")
    # ✅ Create table with correct schema
    cursor.execute("""
        CREATE TABLE ai_recommendations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT,
            title TEXT,
            description TEXT,
            priority TEXT,
            confidence_score REAL,
            contract_id TEXT,
            created_at TEXT
        )
    """)

    # Insert seed data
    sample_data = [
        (
            "performance_optimization",
            "Optimize Contract ABC-123 Performance",
            "Consider renegotiating terms to improve delivery timeline",
            "high",
            0.85,
            "ABC-123",
            "2024-01-15T08:00:00Z"
        ),
        (
            "compliance_alert",
            "Review Contract DEF-789 Compliance",
            "Potential compliance issues detected in recent submissions",
            "medium",
            0.72,
            "DEF-789",
            "2024-01-15T07:30:00Z"
        ),
        (
        "risk_warning",
        "Contract XYZ-456 Shows Elevated Risk",
        "Unusual payment schedule could indicate risk of non-fulfillment",
        "high",
        0.91,
        "XYZ-456",
        "2024-02-10T10:00:00Z"
    ),
    (
        "recommendation",
        "Add AI Clauses to Contract LMN-321",
        "Recommend including AI governance clauses to meet new regulations",
        "low",
        0.65,
        "LMN-321",
        "2024-03-22T11:15:00Z"
    ),
    (
        "performance_optimization",
        "Reduce Cost in Contract GHI-654",
        "Suggest shifting deliverables to fixed-fee model",
        "medium",
        0.78,
        "GHI-654",
        "2024-04-01T09:30:00Z"
    ),
    (
        "compliance_alert",
        "Contract JKL-987 Missing Clauses",
        "Missing required FAR clauses for small business participation",
        "high",
        0.88,
        "JKL-987",
        "2024-05-10T13:45:00Z"
    ),
    (
        "renewal_notice",
        "Contract TUV-555 Nearing Expiry",
        "Prepare documentation and evaluations ahead of renewal",
        "low",
        0.60,
        "TUV-555",
        "2024-06-05T08:45:00Z"
    ),
    (
        "amendment_suggestion",
        "Update Milestones in Contract MNO-112",
        "Project delays necessitate timeline updates in milestone section",
        "medium",
        0.74,
        "MNO-112",
        "2024-07-19T14:30:00Z"
    ),
    (
        "audit_flag",
        "Audit Contract PQR-808",
        "Audit team flagged inconsistencies in invoicing data",
        "high",
        0.92,
        "PQR-808",
        "2024-08-01T12:00:00Z"
    ),
    (
        "data_quality",
        "Validate Contract EFG-321 Metadata",
        "Inconsistent values found in contract type and signature date",
        "medium",
        0.69,
        "EFG-321",
        "2024-08-03T10:20:00Z"
    )
    ]

    cursor.executemany("""
        INSERT INTO ai_recommendations (
            type, title, description, priority, confidence_score, contract_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    """, sample_data)

    conn.commit()
    conn.close()

    return {"message": "Sample AI recommendations inserted", "inserted": len(sample_data)}

# -----------------------------------
# GET Endpoint for AI Recommendations
# ------------------------------------
@router.get("/api/dashboard/recommendations/ai", response_model=AIRecommendationResponse)
def get_ai_recommendations(limit: int = Query(5, ge=1)):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Fetch limited recommendations
    cursor.execute("""
        SELECT id, type, title, description, priority, confidence_score, contract_id, created_at
        FROM ai_recommendations
        ORDER BY datetime(created_at) DESC
        LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()

    # Get total count
    cursor.execute("SELECT COUNT(*) FROM ai_recommendations")
    total_count = cursor.fetchone()[0]
    conn.close()

    return {
        "recommendations": [
            AIRecommendation(
                id=row[0],
                type=row[1],
                title=row[2],
                description=row[3],
                priority=row[4],
                confidence_score=row[5],
                contract_id=row[6],
                created_at=row[7]
            )
            for row in rows
        ],
        "total_count": total_count
    } 

# --- create table and seed data for active tasks
@router.post("/api/dashboard/tasks/seed")
def seed_tasks():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Drop and recreate for clean dev testing
    cursor.execute("DROP TABLE IF EXISTS tasks")

    cursor.execute("""
        CREATE TABLE tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            description TEXT,
            status TEXT,
            priority TEXT,
            due_date TEXT,
            assigned_to TEXT,
            assigned_by TEXT, 
            contract_id TEXT,
            created_at TEXT
        )
    """)

    sample_tasks = [
        (
            "Review Contract Performance Metrics",
            "Quarterly performance review for Contract ABC-123",
            "pending",
            "high",
            "2024-01-20T17:00:00Z",
            "Phani",
            "John Doe",
            "ABC-123",
            "2024-01-10T09:00:00Z"
        ),
        (
            "Update Compliance Documentation",
            "Update compliance docs for Contract XYZ-456",
            "in_progress",
            "medium",
            "2024-01-25T12:00:00Z",
            "Phani",
            "Jane Smith",
            "XYZ-456",
            "2024-01-12T14:30:00Z"
        ),
        (
        "Schedule Vendor Review Meeting",
        "Set up a meeting with vendor for Contract DEF-789",
        "completed",
        "low",
        "2024-02-01T10:00:00Z",
        "Phani",
        "Alice Johnson",
        "DEF-789",
        "2024-01-18T08:00:00Z"
    ),
    (
        "Renew Contract Terms",
        "Initiate contract renewal process for Contract GHI-654",
        "pending",
        "high",
        "2024-02-15T16:00:00Z",
        "Phani",
        "Michael Lee",
        "GHI-654",
        "2024-01-20T13:00:00Z"
    ),
    (
        "Perform Risk Assessment",
        "Evaluate risk factors for Contract JKL-987",
        "in_progress",
        "high",
        "2024-02-05T09:30:00Z",
        "Phani",
        "Priya Patel",
        "JKL-987",
        "2024-01-22T11:15:00Z"
    ),
    (
        "Conduct Clause Review",
        "Legal review of critical clauses in Contract LMN-321",
        "completed",
        "medium",
        "2024-01-28T15:45:00Z",
        "Phani",
        "Daniel Kim",
        "LMN-321",
        "2024-01-14T10:20:00Z"
    ),
    (
        "Finalize Budget Allocation",
        "Review and finalize budget for Contract TUV-555",
        "pending",
        "medium",
        "2024-02-10T14:00:00Z",
        "Phani",
        "Rachel Green",
        "TUV-555",
        "2024-01-25T09:50:00Z"
    ),
    (
        "Draft Amendment",
        "Create draft for upcoming amendment to Contract MNO-112",
        "in_progress",
        "high",
        "2024-02-12T11:00:00Z",
        "Phani",
        "Chris Wang",
        "MNO-112",
        "2024-01-28T08:40:00Z"
    ),
    (
        "Verify Invoice Records",
        "Audit invoice submissions for Contract PQR-808",
        "completed",
        "low",
        "2024-01-30T13:30:00Z",
        "Phani",
        "Nina Brown",
        "PQR-808",
        "2024-01-16T10:10:00Z"
    ),
    (
        "Prepare Termination Report",
        "Compile findings for early termination of Contract EFG-321",
        "pending",
        "high",
        "2024-02-20T17:00:00Z",
        "Phani",
        "Tom Harris",
        "EFG-321",
        "2024-01-29T12:25:00Z"
    )
]


    cursor.executemany("""
        INSERT INTO tasks (title, description, status, priority, due_date, assigned_to,assigned_by, contract_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, sample_tasks)

    conn.commit()
    conn.close()

    return {"message": "Sample tasks inserted", "inserted": len(sample_tasks)}

# ----------------------------------
# GET Endpoint for the Active tasks
# ----------------------------------
@router.get("/api/dashboard/tasks/active", response_model=TaskResponse)
def get_active_tasks(
    status: Optional[str] = Query(None, regex="^(pending|in_progress|completed)$"),
    priority: Optional[str] = Query(None, regex="^(low|medium|high)$"),
    limit: int = Query(20, ge=1)
):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Build WHERE filters
    base_query = """
        SELECT id, title, description, status, priority, due_date, assigned_to, assigned_by, contract_id, created_at
        FROM tasks
        WHERE 1=1
    """
    values = []
    if status:
        base_query += " AND status = ?"
        values.append(status)
    if priority:
        base_query += " AND priority = ?"
        values.append(priority)
    base_query += " ORDER BY datetime(due_date) ASC LIMIT ?"
    values.append(limit)

    cursor.execute(base_query, values)
    task_rows = cursor.fetchall()

    # Summary counts
    cursor.execute("SELECT COUNT(*) FROM tasks")
    total_tasks = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM tasks WHERE status = 'pending'")
    pending = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM tasks WHERE status = 'in_progress'")
    in_progress = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM tasks WHERE status = 'completed'")
    completed = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM tasks WHERE priority = 'high'")
    high_priority = cursor.fetchone()[0]

    conn.close()

    return {
        "tasks": [
            Task(
                id=row[0],
                title=row[1],
                description=row[2],
                status=row[3],
                priority=row[4],
                due_date=row[5],
                assigned_to=row[6],
                assigned_by=row[7],
                contract_id=row[8],
                created_at=row[9]
            ) for row in task_rows
        ],
        "summary": {
            "total_tasks": total_tasks,
            "pending_tasks": pending,
            "in_progress_tasks": in_progress,
            "completed_tasks": completed,
            "high_priority_tasks": high_priority
        }
    }

# Create table and seed data for Quick stats
@router.post("/api/dashboard/stats/quick/compute", response_model=QuickStats)
def compute_and_store_quick_stats():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Step 1: Create table if not exists
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS quick_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        total_contracts INTEGER,
        average_growth_percentage REAL,
        average_response_time_hours INTEGER,
        success_rate_percentage REAL,
        active_users INTEGER,
        pending_approvals INTEGER,
        snapshot_time TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Step 2: Compute metrics live from other tables

    # Total contracts
    cursor.execute("SELECT COUNT(DISTINCT contract_id) FROM contract_compliance")
    total_contracts = cursor.fetchone()[0]

    # Pending approvals
    cursor.execute("SELECT COUNT(*) FROM tasks WHERE status = 'pending'")
    pending_approvals = cursor.fetchone()[0]

    # Active users (non-system)
    cursor.execute("SELECT COUNT(DISTINCT user) FROM contract_activity WHERE user IS NOT NULL AND user != 'System'")
    active_users = cursor.fetchone()[0]

    # Success rate = compliant / total
    cursor.execute("SELECT COUNT(*) FROM contract_compliance")
    total_clauses = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM contract_compliance WHERE LOWER(compliance_summary) = 'compliant'")
    compliant_clauses = cursor.fetchone()[0]
    success_rate = (compliant_clauses / total_clauses) * 100 if total_clauses else 0.0

    # Synthetic values (placeholders)
    avg_growth = 12.5
    avg_response_time = 24

    # Step 3: Insert snapshot
    cursor.execute("""
        INSERT INTO quick_stats (
            total_contracts,
            average_growth_percentage,
            average_response_time_hours,
            success_rate_percentage,
            active_users,
            pending_approvals
        ) VALUES (?, ?, ?, ?, ?, ?)
    """, (
        total_contracts,
        avg_growth,
        avg_response_time,
        round(success_rate, 2),
        active_users,
        pending_approvals
    ))

    conn.commit()
    conn.close()

    return {
        "total_contracts": total_contracts,
        "average_growth_percentage": avg_growth,
        "average_response_time_hours": avg_response_time,
        "success_rate_percentage": round(success_rate, 2),
        "active_users": active_users,
        "pending_approvals": pending_approvals
    }

@router.get("/api/dashboard/stats/quick", response_model=QuickStats)
def get_latest_quick_stats():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT total_contracts,
               average_growth_percentage,
               average_response_time_hours,
               success_rate_percentage,
               active_users,
               pending_approvals
        FROM quick_stats
        ORDER BY snapshot_time DESC
        LIMIT 1
    """)
    row = cursor.fetchone()
    conn.close()

    if not row:
        return QuickStats(
            total_contracts=0,
            average_growth_percentage=0.0,
            average_response_time_hours=0,
            success_rate_percentage=0.0,
            active_users=0,
            pending_approvals=0
        )

    return {
        "total_contracts": row[0],
        "average_growth_percentage": row[1],
        "average_response_time_hours": row[2],
        "success_rate_percentage": row[3],
        "active_users": row[4],
        "pending_approvals": row[5]
    }

# create table and seed data for contracts summary
@router.post("/api/dashboard/contracts/summary/seed")
def seed_contracts_summary():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create the table if it doesn't exist
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS contracts_summary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            intake INTEGER,
            evaluation INTEGER,
            performance INTEGER,
            closeout INTEGER,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Optional: clear previous rows for dev reset
    cursor.execute("DELETE FROM contracts_summary")

    # Insert example data
    cursor.execute("""
        INSERT INTO contracts_summary (intake, evaluation, performance, closeout)
        VALUES (?, ?, ?, ?)
    """, (12, 8, 15, 5))

    conn.commit()
    conn.close()

    return {"message": "contracts_summary seeded successfully"}


@router.get("/api/dashboard/contracts/summary", response_model=ContractSummary)
def get_contracts_summary():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT intake, evaluation, performance, closeout
        FROM contracts_summary
        ORDER BY created_at DESC
        LIMIT 1
    """)
    row = cursor.fetchone()
    conn.close()

    if row:
        intake, evaluation, performance, closeout = row
        total = intake + evaluation + performance + closeout
        return {
            "intake": intake,
            "evaluation": evaluation,
            "performance": performance,
            "closeout": closeout,
            "total": total
        }
    else:
        return {
            "intake": 0,
            "evaluation": 0,
            "performance": 0,
            "closeout": 0,
            "total": 0
        }
# endpoint for renewal recommender
@router.post("/api/renewal_recommender_table")
def create_tables():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS contract_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contract_id INTEGER NOT NULL,
        event_type TEXT NOT NULL CHECK (event_type IN ('renewal', 'action_item')),
        event_date DATE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS contract_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contract_id INTEGER NOT NULL,
        contract_value REAL NOT NULL,
        risk_flag INTEGER DEFAULT 0 CHECK (risk_flag IN (0, 1)),
        ai_confidence_score REAL,
        renewal_date DATE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()
    return {"message": "Tables created successfully."}


# ------------------------------
# 🌱 Endpoint 2: Seed Data
# ------------------------------
@router.post("/api/renewal_recommender/seed_data")
def seed_data():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Clear existing records
    cursor.execute("DELETE FROM contract_events")
    cursor.execute("DELETE FROM contract_metrics")

    today = datetime.utcnow().date()

    # Insert into contract_events
    events = [
        (1, 'renewal', today + timedelta(days=10), 'Contract 1 renewal'),
        (2, 'action_item', today + timedelta(days=5), 'Contract 2 action item'),
        (3, 'action_item', today + timedelta(days=45), 'Quarterly review task'),
    ]
    cursor.executemany("""
    INSERT INTO contract_events (contract_id, event_type, event_date, description)
    VALUES (?, ?, ?, ?)
    """, events)

    # Insert into contract_metrics
    metrics = [
        (1, 500000.00, 1, 88.5, today + timedelta(days=10)),
        (2, 475000.00, 1, 89.2, today + timedelta(days=30)),
        (3, 600000.00, 0, 91.3, today + timedelta(days=90)),
    ]
    cursor.executemany("""
    INSERT INTO contract_metrics (contract_id, contract_value, risk_flag, ai_confidence_score, renewal_date)
    VALUES (?, ?, ?, ?, ?)
    """, metrics)

    conn.commit()
    conn.close()
    return {"message": "Sample data seeded successfully."}


# ------------------------------
# 📊 Endpoint 3: Dashboard Metrics
# ------------------------------
@router.get("/api/renewal_recommender/metrics", response_model=DashboardMetricsResponse)
def get_dashboard_metrics(
    time_range: Literal["30days", "60days", "90days", "180days"] = Query("30days")
):
    days_map = {"30days": 30, "60days": 60, "90days": 90, "180days": 180}
    days = days_map[time_range]
    today = datetime.utcnow().date()
    end_date = today + timedelta(days=days)

    conn =sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Urgent Renewals
    cursor.execute("""
        SELECT COUNT(*) FROM contract_events
        WHERE event_type = 'renewal' AND event_date BETWEEN ? AND ?
    """, (today, end_date))
    urgent_renewals = cursor.fetchone()[0]

    # Value at Risk
    cursor.execute("""
        SELECT SUM(contract_value) FROM contract_metrics
        WHERE risk_flag = 1 AND renewal_date BETWEEN ? AND ?
    """, (today, end_date))
    value_at_risk = cursor.fetchone()[0] or 0

    # AI Confidence
    cursor.execute("""
        SELECT AVG(ai_confidence_score) FROM contract_metrics
        WHERE updated_at BETWEEN ? AND ?
    """, (today, end_date))
    ai_conf = round(cursor.fetchone()[0] or 0.0, 2)

    # Action Items
    cursor.execute("""
        SELECT COUNT(*) FROM contract_events
        WHERE event_type = 'action_item' AND event_date BETWEEN ? AND ?
    """, (today, end_date))
    action_items = cursor.fetchone()[0]

    conn.close()

    return DashboardMetricsResponse(
        time_range=time_range,
        urgent_renewals=urgent_renewals,
        value_at_risk=value_at_risk,
        ai_confidence=f"{ai_conf}%",
        action_items=action_items
    )

# endpoint for audit logs
@router.post("/api/audit_logs")
def seed_audit_logs():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    audit_log_records = [
    {
        "id": 1,
        "timestamp": "2025-01-20 14:30:22",
        "user": "John Doe",
        "action": "Contract Risk Assessment",
        "aiDecision": "High Risk - Recommend Legal Review",
        "confidence": 89,
        "details": "Unusual termination clauses detected",
        "category": "risk"
    },
    {
        "id": 2,
        "timestamp": "2025-01-20 13:45:11",
        "user": "Alice Smith",
        "action": "Document Classification",
        "aiDecision": "Category: Master Service Agreement",
        "confidence": 95,
        "details": "Standard MSA template identified",
        "category": "classification"
    },
    {
        "id": 3,
        "timestamp": "2025-01-20 12:15:33",
        "user": "Bob Johnson",
        "action": "Vendor Evaluation",
        "aiDecision": "Approved - Low Risk Vendor",
        "confidence": 78,
        "details": "Financial stability confirmed",
        "category": "approval"
    },
    {
        "id": 4,
        "timestamp": "2025-01-20 11:20:44",
        "user": "John Doe",
        "action": "Compliance Check",
        "aiDecision": "Non-compliant - GDPR Issues",
        "confidence": 92,
        "details": "Data processing clauses missing",
        "category": "compliance"
    },
    {
        "id": 5,
        "timestamp": "2025-01-20 10:30:15",
        "user": "Carol White",
        "action": "Price Analysis",
        "aiDecision": "15% Above Market Rate",
        "confidence": 82,
        "details": "Competitor pricing analysis completed",
        "category": "analysis"
    },
    {
        "id": 6,
        "timestamp": "2025-01-20 09:45:33",
        "user": "Alice Smith",
        "action": "Contract Risk Assessment",
        "aiDecision": "Medium Risk - Review Recommended",
        "confidence": 76,
        "details": "Payment terms require attention",
        "category": "risk"
    },
    {
        "id": 7,
        "timestamp": "2025-01-20 09:12:18",
        "user": "Bob Johnson",
        "action": "Document Classification",
        "aiDecision": "Category: Non-Disclosure Agreement",
        "confidence": 98,
        "details": "Standard NDA format detected",
        "category": "classification"
    },
    {
        "id": 8,
        "timestamp": "2025-01-20 08:55:07",
        "user": "John Doe",
        "action": "Vendor Evaluation",
        "aiDecision": "Pending Review - Insufficient Data",
        "confidence": 45,
        "details": "Missing financial documentation",
        "category": "pending"
    }
]
    # Convert list of dicts to list of tuples for bulk insert
    audit_log_tuples = [
        (
            r["id"],
            r["timestamp"],
            r["user"],
            r["action"],
            r["aiDecision"],
            r["confidence"],
            r["details"],
            r["category"]
        )
        for r in audit_log_records
    ]

    # Insert into DB
    cursor.executemany("""
        INSERT INTO audit_logs (id, timestamp, user, action, aiDecision, confidence, details, category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, audit_log_tuples)

    conn.commit()
    conn.close()

    return {
    "message": "Audit logs inserted",
    "total": len(audit_log_records)
}
@router.get("/api/audit_logs_details", response_model=List[AuditLog])
def get_audit_logs():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_logs")
    rows = cursor.fetchall()
    conn.close()

    return [
        AuditLog(
            id=row[0],
            timestamp=row[1],
            user=row[2],
            action=row[3],
            aiDecision=row[4],
            confidence=row[5],
            details=row[6],
            category=row[7]
        ) for row in rows
    ]


@router.post("/api/users/seed")
def seed_users():
    import json
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    permissions_map = {
        'Contract Manager': ['create_contract', 'edit_contract', 'view_contract', 'submit_for_approval'],
        'Legal': ['review_contract', 'approve_legal', 'add_legal_notes', 'reject_contract'],
        'Procurement Officer': ['approve_under_50k', 'approve_over_50k', 'final_approval', 'assign_vendor'],
        'Admin': ['view_all', 'manage_users', 'manage_workflows', 'executive_approval']
    }

    sample_users = [
        {"name": "Alice Smith", "email": "alice.smith@company.com", "role": "Legal", "department": "Legal"},
        {"name": "Bob Johnson", "email": "bob.johnson@company.com", "role": "Procurement Officer", "department": "Procurement"},
        {"name": "Carol White", "email": "carol.white@company.com", "role": "Admin", "department": "Operations"}
    ]

    inserted_users = []

    for user in sample_users:
        permissions = permissions_map.get(user["role"], [])
        notifications = {"email": False, "sms": False, "inApp": False}

        cursor.execute("""
            INSERT INTO users (name, email, role, department, status, last_active, permissions, notifications, ai_explainability)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user["name"], user["email"], user["role"], user["department"],
            "active", "Just now",
            json.dumps(permissions),
            json.dumps(notifications),
            False
        ))

        inserted_users.append({
            "id": cursor.lastrowid,
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "department": user["department"],
            "status": "active",
            "last_active": "Just now",
            "permissions": permissions,
            "notifications": notifications,
            "ai_explainability": False
        })

    conn.commit()
    conn.close()

    return {
        "message": f"{len(inserted_users)} users inserted",
        "users": inserted_users
    }

@router.get("/api/users", response_model=List[UserOut])
def get_users():
    import json
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.row_factory = sqlite3.Row

    rows = cursor.execute("SELECT * FROM users").fetchall()
    users = []

    for row in rows:
        users.append(UserOut(
            id=row["id"],
            name=row["name"],
            email=row["email"],
            role=row["role"],
            department=row["department"],
            status=row["status"],
            last_active=row["last_active"],
            permissions=json.loads(row["permissions"]),
            notifications=json.loads(row["notifications"]),
            ai_explainability=bool(row["ai_explainability"])
        ))

    conn.close()
    return users


@router.delete("/api/users/{user_id}")
def delete_user(user_id: int):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()
    return {"message": f"User {user_id} deleted"}


@router.put("/api/users/{user_id}")
def update_user(user_id: int, updates: dict):
    allowed_fields = {"role", "department"}
    set_clauses = []
    values = []

    for key, value in updates.items():
        if key in allowed_fields:
            set_clauses.append(f"{key} = ?")
            values.append(value)

    if not set_clauses:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    query = f"UPDATE users SET {', '.join(set_clauses)} WHERE id = ?"
    values.append(user_id)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(query, values)
    conn.commit()
    conn.close()
    return {"message": "User updated"}


@router.put("/api/users/{user_id}/toggle")
def toggle_feature(user_id: int, feature: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.row_factory = sqlite3.Row

    user = cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if feature == "ai_explainability":
        new_value = not bool(user["ai_explainability"])
        cursor.execute("UPDATE users SET ai_explainability = ? WHERE id = ?", (int(new_value), user_id))
    elif feature in ["email", "sms", "inApp"]:
        notif = json.loads(user["notifications"])
        notif[feature] = not notif[feature]
        cursor.execute("UPDATE users SET notifications = ? WHERE id = ?", (json.dumps(notif), user_id))
    else:
        raise HTTPException(status_code=400, detail="Invalid feature")

    conn.commit()
    conn.close()
    return {"message": f"{feature} toggled"}