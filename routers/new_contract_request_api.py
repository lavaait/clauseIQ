from config import DB_PATH, UPLOAD_FOLDER
import sqlite3, os, shutil
from fastapi import APIRouter, UploadFile, File, Form
from typing import Dict
from sqlite_db import init_db
from enum import Enum
from fastapi import Form
from collections import defaultdict
from calendar import month_abbr

class ContractStatus(str, Enum):
    intake = "intake"
    evaluation = "evaluation"
    approved = "approved"
    executed = "executed"

router = APIRouter()
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

init_db()

ALL_STATUSES = ["intake", "evaluation", "performance", "executed"]

@router.post("/contracts/submit")
async def submit_contract(
    title: str = Form(...),
    agency: str = Form(...),
    contract_type: str = Form(...),
    value: float = Form(...),
    file: UploadFile = File(...),
    status: ContractStatus = Form(...)
):
    file_location = UPLOAD_FOLDER / file.filename
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO contracts (title, agency, contract_type, value, file_path, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
        """, (
            title,
            agency,
            contract_type,
            value,
            str(file_location),
            status.value
        ))
        conn.commit()

    return {"message": "Contract submitted successfully"}



@router.get("/contracts/summary", response_model=Dict[str, int])
def get_contract_summary():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT status, COUNT(*) as count
        FROM contracts
        GROUP BY status
    """)
    rows = cursor.fetchall()
    conn.close()

    # Create summary with all known statuses
    summary = {status: 0 for status in ALL_STATUSES}
    for row in rows:
        status, count = row
        summary[status] = count
    return summary

@router.get("/api/dashboard/metrics/cycle-time")
def get_cycle_time_metrics():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            strftime('%m', created_at) as month_num,
            status,
            COUNT(*) as count
        FROM contracts
        GROUP BY month_num, status
        ORDER BY month_num
    """)
    rows = cursor.fetchall()
    conn.close()

    # Group results
    month_status_counts = defaultdict(lambda: {
        "intake": 0,
        "evaluation": 0,
        "performance": 0,
        "closeout": 0
    })

    for month_num, status, count in rows:
        month_abbr_name = month_abbr[int(month_num)]
        if status in month_status_counts[month_abbr_name]:
            month_status_counts[month_abbr_name][status] = count

    # Format result for frontend
    cycle_time_data = []
    for month in sorted(month_status_counts.keys(), key=lambda m: list(month_abbr).index(m)):
        entry = {"month": month}
        entry.update(month_status_counts[month])
        cycle_time_data.append(entry)

    return {"cycle_time_data": cycle_time_data}
