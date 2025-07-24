import sqlite3
from fastapi import APIRouter, Response, HTTPException
from fastapi.responses import FileResponse
from routers.dashboard_router import get_connection
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import xlsxwriter
import tempfile
import os

router = APIRouter()


def fetch_contract_report_data(contract_id):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT title, stage, compliance_status, risk_level, validation_summary, amount
            FROM contract_metrics
            WHERE id = ?
        """, (contract_id,))
        contract = cursor.fetchone()

        if not contract:
            return None

        cursor.execute("""
            SELECT clause_name, status, confidence
            FROM clause_results
            WHERE contract_id = ?
        """, (contract_id,))
        clauses = cursor.fetchall()

    return {
        "title": contract[0],
        "stage": contract[1],
        "status": contract[2],
        "risk": contract[3],
        "summary": contract[4],
        "amount": contract[5],
        "clauses": clauses
    }


@router.get("/export/pdf", summary="Export contract validation report as PDF")
def export_pdf(contract_id: int):
    data = fetch_contract_report_data(contract_id)
    if not data:
        raise HTTPException(status_code=404, detail="Contract not found")

    tmp_path = tempfile.mktemp(suffix=".pdf")
    c = canvas.Canvas(tmp_path, pagesize=letter)
    width, height = letter

    y = height - 50
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, f"Contract Validation Report: {data['title']}")
    y -= 30

    c.setFont("Helvetica", 12)
    for label, value in [
        ("Stage", data["stage"]),
        ("Compliance", data["status"]),
        ("Risk Level", data["risk"]),
        ("Summary", data["summary"]),
        ("Total Amount", f"${data['amount']:,.2f}")
    ]:
        c.drawString(50, y, f"{label}: {value}")
        y -= 20

    y -= 10
    c.drawString(50, y, "Clause Validation Results:")
    y -= 20

    for clause, status, confidence in data["clauses"]:
        if y < 100:
            c.showPage()
            y = height - 50
        c.drawString(60, y, f"- {clause}: {status.upper()} (Confidence: {confidence:.2f})")
        y -= 16

    c.save()
    return FileResponse(tmp_path, media_type="application/pdf", filename="contract_report.pdf")


@router.get("/export/excel", summary="Export contract validation report as Excel")
def export_excel(contract_id: int):
    data = fetch_contract_report_data(contract_id)
    if not data:
        raise HTTPException(status_code=404, detail="Contract not found")

    tmp_path = tempfile.mktemp(suffix=".xlsx")
    workbook = xlsxwriter.Workbook(tmp_path)
    sheet = workbook.add_worksheet("Summary")

    sheet.write("A1", "Contract Title")
    sheet.write("B1", data["title"])
    sheet.write("A2", "Stage")
    sheet.write("B2", data["stage"])
    sheet.write("A3", "Compliance Status")
    sheet.write("B3", data["status"])
    sheet.write("A4", "Risk Level")
    sheet.write("B4", data["risk"])
    sheet.write("A5", "Validation Summary")
    sheet.write("B5", data["summary"])
    sheet.write("A6", "Total Amount")
    sheet.write("B6", data["amount"])

    clause_sheet = workbook.add_worksheet("Clauses")
    clause_sheet.write_row("A1", ["Clause Name", "Status", "Confidence"])

    for i, (clause, status, confidence) in enumerate(data["clauses"], start=2):
        clause_sheet.write(f"A{i}", clause)
        clause_sheet.write(f"B{i}", status)
        clause_sheet.write(f"C{i}", confidence)

    workbook.close()
    return FileResponse(tmp_path, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename="contract_report.xlsx")