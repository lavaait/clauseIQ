from config import DB_PATH, UPLOAD_FOLDER
import sqlite3, os, shutil
from fastapi import APIRouter, UploadFile, File, Form
from typing import Dict,List
from sqlite_db import init_db
from enum import Enum
from fastapi import Form
from collections import defaultdict
from calendar import month_abbr
from pydantic import BaseModel
from datetime import datetime
from routers.template_engine import generate_contract_from_template
from fastapi.responses import FileResponse
from fastapi import HTTPException
import uuid
from fpdf import FPDF

class ContractStatus(str, Enum):
    intake = "intake"
    evaluation = "evaluation"
    approved = "approved"
    executed = "executed"

class ContractRequestItem(BaseModel):
    id: int
    title: str
    agency: str
    contract_type: str
    value: float
    file_path: str
    status: str
    date: str 

class ContractEditRequest(BaseModel):
    title: str
    agency: str
    contract_type: str
    value: float
    status: str

class DraftRequest(BaseModel):
    contract_type: str
    template: str
    agency: str
    effective_date: str

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
        """, (title, agency, contract_type, value, str(file_location), status.value))
        conn.commit()

    return {"message": "Contract submitted successfully"}


#----Endpoint to get the contract request lists APIs -----
@router.get("/api/contracts_request_list", response_model=List[ContractRequestItem])
def get_contract_request_list():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            rowid,  -- This is the unique identifier
            title, 
            agency, 
            contract_type, 
            value, 
            file_path, 
            status, 
            created_at as date
        FROM contracts
        ORDER BY created_at DESC
    """)
    rows = cursor.fetchall()
    conn.close()

    contract_items = []
    for row in rows:
        contract_items.append(ContractRequestItem(
            id=row[0],
            title=row[1],
            agency=row[2],
            contract_type=row[3],
            value=row[4],
            file_path=row[5],
            status=row[6],
            date=row[7]
        ))
    return contract_items

#----- endpoint to create the contract draft -----
@router.post("/contract/draft")
def generate_contract_draft(request: DraftRequest):
    metadata = {
        "agency": request.agency,
        "effective_date": request.effective_date,
        "contract_type": request.contract_type
    }

    draft, rationale = generate_contract_from_template(request.template, metadata)

    if not draft:
        return {"message": "Draft generation failed", "error": rationale}, 500

    # Save draft as PDF
    draft_id = str(uuid.uuid4())
    pdf_filename = f"contract_{draft_id}.pdf"
    pdf_path = os.path.join(UPLOAD_FOLDER, pdf_filename)

    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.set_font("Arial", size=12)
    for line in draft.split('\n'):
        pdf.multi_cell(0, 10, txt=line)

    pdf.output(pdf_path)

    return {
    "draft_id": draft_id,
    "download_url": f"/contracts/pdf/{draft_id}",
    "draft": draft,
    "rationale": rationale
}
        
        
@router.get("/contracts/pdf/{draft_id}")
def download_contract_pdf(draft_id: str):
    pdf_filename = f"contract_{draft_id}.pdf"
    pdf_path = os.path.join(UPLOAD_FOLDER, pdf_filename)

    if os.path.exists(pdf_path):
        return FileResponse(
            path=pdf_path,
            media_type="application/pdf",
            filename=pdf_filename
        )
    raise HTTPException(status_code=404, detail="PDF not found")


@router.put("/api/contracts/{contract_id}/edit")
def edit_contract_request(contract_id: int, request: ContractEditRequest):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE contracts
        SET title = ?, agency = ?, contract_type = ?, value = ?, status = ?
        WHERE rowid = ?
    """, (request.title, request.agency, request.contract_type, request.value, request.status, contract_id))
    conn.commit()
    conn.close()
    return {"message": "Contract request updated successfully"}


@router.delete("/api/contracts/{contract_id}/delete")
def delete_contract_request(contract_id: int):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM contracts WHERE rowid = ?", (contract_id,))
    conn.commit()
    conn.close()
    return {"message": "Contract request deleted successfully"}


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
