from typing import Dict, List
from io import BytesIO

from fastapi import FastAPI, HTTPException, Query
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

router = APIRouter()

# # CORS (update allow_origins for production)
# router.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# ----------------------
# Data Models
# ----------------------
class ChecklistItem(BaseModel):
    id: int
    text: str
    checked: bool = True

class ChecklistResponse(BaseModel):
    contract_type: str
    agency_policy: str
    items: List[ChecklistItem]


# ----------------------
# In‑Memory Data Store
# ----------------------
CHECKLIST_DATA: Dict[str, Dict[str, List[ChecklistItem]]] = {
    "Firm-Fixed-Price": {
        "Agency A": [
            ChecklistItem(id=1, text="Correct contract structure"),
            ChecklistItem(id=2, text="Specified contract period"),
            ChecklistItem(id=3, text="Price includes all costs"),
            ChecklistItem(id=4, text="Inspection and acceptance terms"),
            ChecklistItem(id=5, text="Termination clauses"),
            ChecklistItem(id=6, text="Certifications and representations"),
            ChecklistItem(id=7, text="Payment and invoicing terms"),
            ChecklistItem(id=8, text="Applicable FAR clauses"),
        ],
        "Agency B": [
            ChecklistItem(id=1, text="Correct contract structure"),
            ChecklistItem(id=2, text="Specified contract period"),
            ChecklistItem(id=3, text="Price includes all costs"),
            ChecklistItem(id=4, text="Performance work statement"),
            ChecklistItem(id=5, text="Quality assurance surveillance plan"),
            ChecklistItem(id=6, text="Security requirements"),
            ChecklistItem(id=7, text="Data rights provisions"),
            ChecklistItem(id=8, text="Applicable DFARS clauses"),
        ],
    },
    "Cost-Plus-Fixed-Fee": {
        "Agency A": [
            ChecklistItem(id=1, text="Cost accounting standards compliance"),
            ChecklistItem(id=2, text="Allowable cost provisions"),
            ChecklistItem(id=3, text="Fee structure definition"),
            ChecklistItem(id=4, text="Cost monitoring requirements"),
            ChecklistItem(id=5, text="Audit and records access"),
            ChecklistItem(id=6, text="Termination for convenience"),
            ChecklistItem(id=7, text="Progress reporting requirements"),
            ChecklistItem(id=8, text="Applicable cost accounting clauses"),
        ],
        "Agency B": [
            ChecklistItem(id=1, text="Cost accounting standards compliance"),
            ChecklistItem(id=2, text="Allowable cost provisions"),
            ChecklistItem(id=3, text="Fee structure definition"),
            ChecklistItem(id=4, text="Enhanced audit requirements"),
            ChecklistItem(id=5, text="Security clearance provisions"),
            ChecklistItem(id=6, text="Intellectual property rights"),
            ChecklistItem(id=7, text="Export control compliance"),
            ChecklistItem(id=8, text="DCAA audit readiness"),
        ],
    },
    "Time-and-Materials": {
        "Agency A": [
            ChecklistItem(id=1, text="Labor hour limitations"),
            ChecklistItem(id=2, text="Material cost controls"),
            ChecklistItem(id=3, text="Ceiling price establishment"),
            ChecklistItem(id=4, text="Labor category definitions"),
            ChecklistItem(id=5, text="Invoicing procedures"),
            ChecklistItem(id=6, text="Quality control measures"),
            ChecklistItem(id=7, text="Government oversight provisions"),
            ChecklistItem(id=8, text="T&M specific FAR clauses"),
        ],
        "Agency B": [
            ChecklistItem(id=1, text="Labor hour limitations"),
            ChecklistItem(id=2, text="Material cost controls"),
            ChecklistItem(id=3, text="Ceiling price establishment"),
            ChecklistItem(id=4, text="Security labor requirements"),
            ChecklistItem(id=5, text="Contractor personnel screening"),
            ChecklistItem(id=6, text="Government facility access"),
            ChecklistItem(id=7, text="Subcontractor oversight"),
            ChecklistItem(id=8, text="Performance metrics tracking"),
        ],
    },
}

# ----------------------
# API Routes
# ----------------------
@router.get("/checklist_validation", response_model=ChecklistResponse, tags=["Checklist"])
async def get_checklist(
    contract_type: str = Query(..., description="Contract type, e.g. 'Firm-Fixed-Price'"),
    agency_policy: str = Query(..., description="Agency policy, e.g. 'Agency A'"),
):
    """Return checklist items for the specified contract & agency."""
    try:
        items = CHECKLIST_DATA[contract_type][agency_policy]
    except KeyError as exc:
        raise HTTPException(404, detail="Unsupported contract/agency combination") from exc

    return ChecklistResponse(
        contract_type=contract_type,
        agency_policy=agency_policy,
        items=items,
    )


@router.get("/checklist/pdf", tags=["Checklist"])
async def download_checklist_pdf(
    contract_type: str = Query(...),
    agency_policy: str = Query(...),
):
    """Generate a PDF rendition of the checklist for download."""
    try:
        items = CHECKLIST_DATA[contract_type][agency_policy]
    except KeyError as exc:
        raise HTTPException(404, detail="Unsupported contract/agency combination") from exc

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # Header
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(30, height - 40, f"Checklist – {contract_type} / {agency_policy}")

    # Body
    pdf.setFont("Helvetica", 11)
    y = height - 70
    for item in items:
        pdf.drawString(40, y, f"☐ {item.text}")
        y -= 18
        if y < 50:  # simple page-break logic
            pdf.showPage()
            y = height - 40

    pdf.save()
    buffer.seek(0)

    filename = f"checklist_{contract_type}_{agency_policy}.pdf".replace(" ", "_").lower()
    headers = {"Content-Disposition": f"attachment; filename={filename}"}
    return StreamingResponse(buffer, media_type="application/pdf", headers=headers)
