import os
import uuid
from typing import Dict
from fastapi import APIRouter, Form, Request
from fastapi.responses import FileResponse, JSONResponse
from jinja2 import Environment, FileSystemLoader
from fpdf import FPDF
from enum import Enum
from openai import OpenAI
from fastapi.exceptions import HTTPException

# ----------- Initialization -----------
router = APIRouter()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
env = Environment(loader=FileSystemLoader("templates"))
UPLOAD_FOLDER = "generated_contracts"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ----------- Constants -----------
CONTRACT_TYPES = [
    "Non-Disclosure Agreement",
    "Service Agreement",
    "Employment Contract",
    "Purchase Agreement",
    "Lease Agreement"
]

TEMPLATE_MAPPING = {
    "NDA Template - Standard": "nda_standard",
    "NDA Template - Mutual": "nda_mutual",
    "Service Agreement Template": "service_standard",
    "Payment Contract Template": "payment_standard",
    "Termination Agreement Template": "termination_standard"
}

TEMPLATES = {
    "Non-Disclosure Agreement": ["NDA Template - Standard", "NDA Template - Mutual"],
    "Service Agreement": ["Service Agreement Template"],
    "Employment Contract": ["Employment Contract Template"],
    "Purchase Agreement": ["Purchase Agreement Template"]
}

AGENCIES = [
    "Department of Commerce",
    "Department of Defense",
    "Department of Justice",
    "Department of Treasury"
]

# ----------- Enums for Swagger UI Form -----------
class ContractType(str, Enum):
    nda = "Non-Disclosure Agreement"
    service = "Service Agreement"
    employment = "Employment Contract"
    purchase = "Purchase Agreement"
    lease = "Lease Agreement"

class Template(str, Enum):
    nda_standard = "NDA Template - Standard"
    nda_mutual = "NDA Template - Mutual"
    service_standard = "Service Agreement Template"
    employment_standard = "Employment Contract Template"
    purchase_standard = "Purchase Agreement Template"
    lease_standard = "Lease Agreement Template"

class Agency(str, Enum):
    commerce = "Department of Commerce"
    defense = "Department of Defense"
    justice = "Department of Justice"
    treasury = "Department of Treasury"

# ----------- Utilities -----------
def get_purpose_category(purpose: str) -> str:
    p = purpose.lower()
    if "data" in p:
        return "Data Sharing"
    elif "research" in p or "r&d" in p:
        return "Research Collaboration"
    elif "subcontract" in p:
        return "Subcontracting"
    elif "partnership" in p:
        return "Strategic Partnership"
    else:
        return "General Purpose"

def generate_llm_clause(purpose: str, category: str, agency: str) -> str:
    prompt = (
        f"Based on the following, write a concise 2-3 sentence legal clause for a contract.\n"
        f"Focus on the specific rights and obligations of the parties for this purpose.\n\n"
        f"- Agency Name: {agency}\n"
        f"- Purpose: {purpose}\n"
        f"- Category: {category}\n"
        f"The clause should be legally sound, clear, and relevant to the purpose.\n"
        f"**Response must be brief.**"
    )
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200,
            temperature=0.3,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"(LLM clause generation failed: {str(e)})"

def render_clause(template_label: str, metadata: Dict) -> str:
    template_key = TEMPLATE_MAPPING.get(template_label)
    if not template_key:
        return f"[No mapped clause template found for '{template_label}']"
    try:
        template = env.get_template(f"clauses/{template_key}.jinja")
        return template.render(**metadata)
    except Exception as e:
        return f"[Error rendering clause '{template_key}': {str(e)}]"

def build_single_clause_draft(template_label: str, metadata: Dict) -> str:
    clause_text = render_clause(template_label, metadata)
    return (
        f"Contract Draft - {template_label}\n\n"
        f"Effective Date: {metadata['effective_date']}\n"
        f"Agency: {metadata['agency']}\n\n"
        f"-------------------------------\n"
        f"{template_label}\n"
        f"-------------------------------\n"
        f"{clause_text}\n\n"
        f"-------------------------------\n"
        f"Custom Clause (LLM Generated)\n"
        f"-------------------------------\n"
        f"{metadata['llm_clause']}"
    )

def save_draft_as_pdf(draft: str, draft_id: str) -> str:
    pdf_filename = f"contract_{draft_id}.pdf"
    pdf_path = os.path.join(UPLOAD_FOLDER, pdf_filename)

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.set_auto_page_break(auto=True, margin=15)
    for line in draft.split('\n'):
        pdf.multi_cell(0, 10, txt=line)

    pdf.output(pdf_path)
    return pdf_path

# ----------- Endpoint: Submit Form and Generate Draft -----------
@router.post("/contracts/ai-draft/submit", response_class=JSONResponse)
def submit_ai_draft_form(
    request: Request,
    contract_type: ContractType = Form(...),
    template: Template = Form(...),
    agency: Agency = Form(...),
    effective_date: str = Form(...),
    purpose: str = Form(...)
):
    category = get_purpose_category(purpose)
    llm_clause = generate_llm_clause(purpose, category, agency)

    metadata = {
        "template": template,
        "agency": agency,
        "effective_date": effective_date,
        "purpose": purpose,
        "llm_clause": llm_clause
    }

    draft = build_single_clause_draft(template, metadata)
    draft_id = str(uuid.uuid4())
    save_draft_as_pdf(draft, draft_id)

    return {
        "draft_id": draft_id,
        "download_url": f"/contracts/pdf/{draft_id}",
        "draft": draft,
        "llm_clause": llm_clause,
        "category": category,
        "metadata": metadata
    }

# ----------- Endpoint: Download Generated PDF -----------
@router.get("/contracts/pdf/{draft_id}")
def download_pdf(draft_id: str):
    path = os.path.join(UPLOAD_FOLDER, f"contract_{draft_id}.pdf")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="PDF not found")
    return FileResponse(path, media_type="application/pdf", filename=f"contract_{draft_id}.pdf")