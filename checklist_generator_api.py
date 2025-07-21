"""Unified Checklist Builder
- Base rules by contract type & agency
- Exposed via build_unified_checklist()
"""
from typing import List, Dict, Optional

# ────────────────────────────────────────────────────────────────────────────────
# Unified checklist builder
# ────────────────────────────────────────────────────────────────────────────────

def build_unified_checklist(contract_type: str, agency: str, options: Optional[dict] = None) -> List[str]:
    """Generate a checklist based only on contract type and agency policy."""
    options = options or {}
    checklist: list[str] = []

    # Contract-type rules
    contract_rules: dict[str, list[str]] = {
        "Mobile Device Procurement": [
            "Develop Acquisition Plan",
            "Conduct Market Research",
            "Define Contract Type & Justification (Time & Materials)",
            "Establish Competition Strategy",
            "Set Milestone Schedule",
            "Perform Risk Assessment",
            "Award Summary & Justification",
            "Define Roles: CO, COR, PM",
            "Monthly Deliverables & Reports",
            "Track KPIs and conduct Quarterly Reviews",
        ],
    }


    # Agency overlays
    agency_overrides: dict[str, list[str]] = {
    "R&D": [
        "Ensure Funding Certification",
        "Track Performance Metrics",
        "Archive Contract File at Closeout",
        "Verify Final Performance Evaluation",
        "Obtain Signed Release of Claims",
    ],
    "NASA": [
        "Conduct Export Control Review",
        "Include NASA FAR Supplement Clauses",
        "Review Technology Transfer and IP Provisions",
        "Include Cybersecurity Plan (per NPR 2810.1)",
        "Verify ITAR/EAR compliance forms are complete"
    ],
    "DoD": [
        "Apply DFARS Compliance Clauses",
        "Validate Contractor Security Clearance",
        "Include CMMC Self-Assessment or Certification",
        "Initiate Defense Contract Audit Agency (DCAA) Review",
        "Submit Anti-Terrorism Level I Training Verification"
    ],
    "DOE": [
        "Ensure Environmental Impact Acknowledgement",
        "Confirm Conflict of Interest Disclosure",
        "Verify Performance Milestone Reporting",
        "Ensure Energy Efficiency Clauses Included",
        "Review Proprietary Research Safeguards"
    ],
    "NIH": [
        "Check Human Subjects Compliance (IRB Protocol)",
        "Ensure ClinicalTrials.gov Registration",
        "Apply Public Access Policy Requirements",
        "Submit Financial Conflict of Interest Forms",
        "Confirm Informed Consent Documentation Requirements"
    ]
    }

    checklist.extend(contract_rules.get(contract_type, ["General Contract Review"]))
    checklist.extend(agency_overrides.get(agency, []))

    if options.get("value", 0) > 500_000:
        checklist.append("Executive Review for High‑Value Contract")
    if options.get("risk_level", "").lower() == "high":
        checklist.append("Initiate Formal Risk Mitigation Review")

    return list(dict.fromkeys(checklist))  # Deduplicate while preserving order

# ==============================================================================
# FastAPI server with PDF export
# ==============================================================================

"""server.py – API surface for checklist generation & PDF export.
Run with:
    uvicorn server:app --reload
Requirements:
    pip install fastapi uvicorn python-multipart pdfkit jinja2
    # And ensure wkhtmltopdf is installed & on PATH for pdfkit.
"""

import os, pdfkit
from fastapi import FastAPI, Form
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from jinja2 import Template

app = FastAPI(title="Checklist Generator API")

@app.get("/")
def root():
    return {"message": "Server is running"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple HTML template used for PDF rendering
HTML_TEMPLATE = """
<!doctype html>
<html lang=\"en\"><head><meta charset=\"utf-8\"><title>Checklist</title></head>
<body>
    <h2>Checklist – {{ contract_type }} ({{ agency }})</h2>
    <ol>
    {% for item in checklist %}
        <li>{{ item }}</li>
    {% endfor %}
    </ol>
</body></html>
"""

def _render_pdf(contract_type: str, agency: str, checklist: list[str], out_path: str) -> str:
    """Render checklist → PDF with pdfkit."""
    html = Template(HTML_TEMPLATE).render(contract_type=contract_type, agency=agency, checklist=checklist)
    pdfkit.from_string(html, out_path)
    return out_path

# ────────────────────────────────────────────────────────────────────────────────
# API Endpoints
# ────────────────────────────────────────────────────────────────────────────────

@app.post("/checklist/generate")
async def generate_checklist(
    contract_type: str = Form(...),
    agency: str         = Form(...),
    value: float        = Form(...),
    risk_level: str     = Form(...),
):
    """Return checklist as JSON."""
    options = {"value": value, "risk_level": risk_level}
    checklist = build_unified_checklist(contract_type, agency, options)
    return JSONResponse({"checklist": checklist})

@app.post("/checklist/pdf")
async def generate_checklist_pdf(
    contract_type: str = Form(...),
    agency: str         = Form(...),
    value: float        = Form(...),
    risk_level: str     = Form(...),
):
    """Generate checklist and return as downloadable PDF."""
    options = {"value": value, "risk_level": risk_level}
    checklist = build_unified_checklist(contract_type, agency, options)

    os.makedirs("pdf_export_output", exist_ok=True)
    pdf_path = _render_pdf(contract_type, agency, checklist, out_path="pdf_export_output/checklist.pdf")
    return FileResponse(pdf_path, media_type="application/pdf", filename="checklist.pdf")
