from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from typing import List, Optional
import datetime, pdfkit, json, os
from jinja2 import Template

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Server is running"}

# ──────── CONFIG ──────────────────────────────
WKHTMLTOPDF_CMD = None  # e.g. "/usr/local/bin/wkhtmltopdf"
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
METADATA_PATH = os.path.join(SCRIPT_DIR, "clause_output", "metadata_summary.json")

PDFKIT_CFG = pdfkit.configuration(wkhtmltopdf=WKHTMLTOPDF_CMD) if WKHTMLTOPDF_CMD else None

# ──────── Load Metadata on Startup ────────────
if not os.path.exists(METADATA_PATH):
    raise RuntimeError(f"Missing metadata file at {METADATA_PATH}")
with open(METADATA_PATH, "r") as f:
    METADATA = json.load(f)
# ──────────────────────────────────────────────

# ──────── Data Models ─────────────────────────
class ChecklistItem(BaseModel):
    code: str
    description: str
    resolved: bool = False

class ChecklistSubmission(BaseModel):
    contract_number: str
    officer_name: str
    closeout_date: datetime.date
    items: List[ChecklistItem]

class ValidationError(BaseModel):
    code: str
    message: str

class ValidationResponse(BaseModel):
    unresolved: List[ValidationError]
# ──────────────────────────────────────────────

def load_contract_metadata(contract_number: str) -> Optional[dict]:
    for entry in METADATA.values():
        if entry.get("contract_number") == contract_number:
            return entry
    return None

@app.post("/closeout/validate", response_model=ValidationResponse)
def validate_closeout(payload: ChecklistSubmission):
    md = load_contract_metadata(payload.contract_number)
    if not md:
        raise HTTPException(status_code=404, detail="Contract metadata not found.")

    unresolved = []
    status_map = {item.code: item.resolved for item in payload.items}

    if md.get("contract_value") and not status_map.get("FINAL_INVOICE", False):
        unresolved.append(ValidationError(code="FINAL_INVOICE", message="Final invoice missing."))

    if md.get("vendor_name") and not status_map.get("RELEASE_OF_CLAIMS", False):
        unresolved.append(ValidationError(code="RELEASE_OF_CLAIMS", message="Release of Claims form missing."))

    return ValidationResponse(unresolved=unresolved)

@app.post("/closeout/report")
def generate_report(payload: ChecklistSubmission):
    validation = validate_closeout(payload)
    if validation.unresolved:
        raise HTTPException(status_code=400, detail="Cannot generate report: unresolved checklist items.")

    html_template = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <style>
            body { font-family: Arial, sans-serif; font-size: 12pt; }
            h1   { font-size: 18pt; }
            table { width: 100%; border-collapse: collapse; margin-top: 1em; }
            th, td { border: 1px solid #ccc; padding: 6px; }
            .ok   { color: green; }
            .fail { color: red; }
        </style>
    </head>
    <body>
        <h1>Contract Closeout Report</h1>
        <p><strong>Contract #:</strong> {{ checklist.contract_number }}</p>
        <p><strong>Officer:</strong> {{ checklist.officer_name }}</p>
        <p><strong>Closeout Date:</strong> {{ checklist.closeout_date }}</p>
        <p><strong>Generated:</strong> {{ generated }}</p>

        <h2>Checklist Summary</h2>
        <table>
            <thead>
              <tr><th>Item</th><th>Status</th></tr>
            </thead>
            <tbody>
            {% for item in checklist.items %}
              <tr>
                <td>{{ item.description }}</td>
                <td class="{{ 'ok' if item.resolved else 'fail' }}">
                  {{ "Resolved" if item.resolved else "Unresolved" }}
                </td>
              </tr>
            {% endfor %}
            </tbody>
        </table>
    </body>
    </html>
    """

    template = Template(html_template)
    html_content = template.render(
        checklist=payload,
        generated=datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
    )

    try:
        pdf_bytes = pdfkit.from_string(html_content, False, configuration=PDFKIT_CFG)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {e}")

    filename = f"Closeout_Report_{payload.contract_number}.pdf"
    headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
    return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)