import os
import sqlite3
import json
from fastapi import FastAPI, APIRouter,Query
from typing import List
from pydantic import BaseModel
from typing import List, Optional
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
def get_compliance_summary():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT
            SUM(CASE WHEN LOWER(compliance_summary) = 'compliant' THEN 1 ELSE 0 END) AS compliant_contracts,
            COUNT(*) AS total_contracts
        FROM contract_compliance
    """)
    compliant_contracts, total_contracts = cursor.fetchone()
    conn.close()

    non_compliant_contracts = total_contracts - compliant_contracts
    compliance_percentage = int((compliant_contracts / total_contracts) * 100) if total_contracts > 0 else 0

    if compliance_percentage >= 90:
        status = "excellent"
    elif compliance_percentage >= 75:
        status = "good"
    elif compliance_percentage >= 50:
        status = "fair"
    else:
        status = "poor"

    return {
        "compliance_percentage": compliance_percentage,
        "status": status,
        "details": {
            "compliant_contracts": compliant_contracts,
            "total_contracts": total_contracts,
            "non_compliant_contracts": non_compliant_contracts
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
            "Jane Smith",
            "XYZ-456",
            "2024-01-12T14:30:00Z"
        )
    ]

    cursor.executemany("""
        INSERT INTO tasks (
            title, description, status, priority, due_date, assigned_to, contract_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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
        SELECT id, title, description, status, priority, due_date, assigned_to, contract_id, created_at
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
                contract_id=row[7],
                created_at=row[8]
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
