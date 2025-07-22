from __future__ import annotations

import io
from datetime import datetime
from typing import List, Literal

from fastapi import FastAPI
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse, StreamingResponse
from pydantic import BaseModel, Field
from reportlab.lib.pagesizes import LETTER
from reportlab.pdfgen import canvas

###############################################################################
# Pydantic models
###############################################################################

class ChecklistItem(BaseModel):
    id: int
    text: str
    checked: bool = Field(default=False)
    required: bool = Field(default=True)

class AICheck(BaseModel):
    id: int
    type: Literal["info", "warning", "error"]
    title: str
    description: str
    status: Literal["pending", "resolved"] = "pending"

class ChecklistTemplateResponse(BaseModel):
    checklist: List[ChecklistItem]

class ValidationRequest(BaseModel):
    checklist: List[ChecklistItem]
    ai_checks: List[AICheck]

class ValidationResponse(BaseModel):
    total_items: int
    completed_items: int
    pending_items: int
    required_items: int
    completed_required_items: int
    ai_issues: int
    ready_for_closeout: bool

class ReportRequest(ValidationRequest):
    """Reuse ValidationRequest schema for report generation"""

###############################################################################
# App init & CORS
###############################################################################

router = APIRouter()

# router.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # tighten in prod
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

###############################################################################
# In‑memory template & AI stubs
###############################################################################

_DEFAULT_CHECKLIST: List[ChecklistItem] = [
    ChecklistItem(id=1, text="All deliverables verified", required=True),
    ChecklistItem(id=2, text="Final invoices received", required=True),
    ChecklistItem(id=3, text="Outstanding obligations resolved", required=True),
    ChecklistItem(id=4, text="Property disposition completed", required=True),
    ChecklistItem(id=5, text="Final acceptance documented", required=True),
    ChecklistItem(id=6, text="Contractor performance evaluated", required=False),
]

###############################################################################
# Utility helpers
###############################################################################

def run_ai_checks() -> List[AICheck]:
    """Stub generator that simulates LLM‑based auto‑checks."""
    return [
        AICheck(
            id=1,
            type="warning",
            title="Subcontractor payment still pending",
            description="Review necessary for final closeout",
        ),
        AICheck(
            id=2,
            type="info",
            title="Performance evaluation period ending soon",
            description="Consider completing contractor performance evaluation",
        ),
    ]


def compute_validation(payload: ValidationRequest) -> ValidationResponse:
    total_items = len(payload.checklist)
    completed_items = sum(1 for i in payload.checklist if i.checked)
    pending_items = total_items - completed_items

    required_items = [i for i in payload.checklist if i.required]
    completed_required_items = sum(1 for i in required_items if i.checked)

    ai_issues = sum(1 for chk in payload.ai_checks if chk.status == "pending")

    ready = (
        completed_required_items == len(required_items)
        and all(chk.type != "error" for chk in payload.ai_checks)
    )

    return ValidationResponse(
        total_items=total_items,
        completed_items=completed_items,
        pending_items=pending_items,
        required_items=len(required_items),
        completed_required_items=completed_required_items,
        ai_issues=ai_issues,
        ready_for_closeout=ready,
    )


def build_report_content(payload: ReportRequest, stats: ValidationResponse) -> str:
    """Produce the plain‑text report body used for both TXT and PDF."""

    checklist_lines = [
        f"{'✓' if item.checked else '○'} {item.text}{' (Required)' if item.required else ''}"
        for item in payload.checklist
    ]

    ai_lines = [
        f"{chk.type.upper()}: {chk.title} - {chk.description}"
        for chk in payload.ai_checks
    ]

    content = (
        "CONTRACT CLOSEOUT REPORT\n"
        f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}\n\n"
        "CHECKLIST STATUS:\n" + "\n".join(checklist_lines) + "\n\n"  # noqa: E501
        "SUMMARY:\n"
        f"- Total Items: {stats.total_items}\n"
        f"- Completed: {stats.completed_items}\n"
        f"- Pending: {stats.pending_items}\n"
        f"- Required Items Complete: {stats.completed_required_items}/{stats.required_items}\n\n"
        "AI AUTO-CHECKS:\n" + ("\n".join(ai_lines) or "No AI checks") + "\n\n"
        "RECOMMENDATIONS:\n"
        + (
            "- Complete all pending checklist items before final closeout\n"
            if stats.pending_items > 0
            else "- All checklist items completed successfully\n"
        )
        + (
            "- Address all AI‑identified issues\n"
            if stats.ai_issues > 0
            else "- No outstanding issues identified\n"
        )
        + "\n\n"
        f"Contract ready for closeout: {'YES' if stats.ready_for_closeout else 'NO'}"
    )
    return content


def generate_pdf(content: str) -> bytes:
    """Render plain‑text content into a simple paginated PDF."""
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=LETTER)
    width, height = LETTER

    left_margin, top_margin = 72, height - 72  # 1‑inch margins
    line_height = 14
    y = top_margin

    for line in content.split("\n"):
        c.drawString(left_margin, y, line)
        y -= line_height
        if y < 72:  # start a new page
            c.showPage()
            y = top_margin

    c.save()
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes

###############################################################################
# Router
###############################################################################

@router.get("/checklist/default", response_model=ChecklistTemplateResponse)
async def get_default_checklist():
    """Return the server‑side checklist template."""
    return ChecklistTemplateResponse(checklist=_DEFAULT_CHECKLIST)


@router.post("/validate", response_model=ValidationResponse)
async def validate(payload: ValidationRequest):
    return compute_validation(payload)


@router.post("/report/pdf")
async def report_pdf(payload: ReportRequest):
    stats = compute_validation(payload)
    body = build_report_content(payload, stats)
    pdf_bytes = generate_pdf(body)

    filename = f"closeout-report-{datetime.utcnow().date()}.pdf"
    headers = {
        "Content-Disposition": f"attachment; filename={filename}",
        "Cache-Control": "no-store",
    }
    return StreamingResponse(io.BytesIO(pdf_bytes), media_type="application/pdf", headers=headers)