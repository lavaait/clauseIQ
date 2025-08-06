# import os
# import uuid
# from typing import Dict
# from fastapi import APIRouter, Form, Request
# from fastapi.responses import FileResponse, JSONResponse
# from jinja2 import Environment, FileSystemLoader
# from fpdf import FPDF
# from enum import Enum
# from openai import OpenAI
# from fastapi.exceptions import HTTPException
# from dotenv import load_dotenv
# load_dotenv()

# # ----------- Initialization -----------
# router = APIRouter()
# client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
# env = Environment(loader=FileSystemLoader("templates"))
# UPLOAD_FOLDER = "generated_contracts"
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# # ----------- Constants -----------
# CONTRACT_TYPES = [
#     "Non-Disclosure Agreement",
#     "Service Agreement",
#     "Employment Contract",
#     "Purchase Agreement",
#     "Lease Agreement"
# ]

# TEMPLATE_MAPPING = {
#     "NDA Template - Standard": "nda_standard",
#     "NDA Template - Mutual": "nda_mutual",
#     "Service Agreement Template": "service_standard",
#     "Payment Contract Template": "payment_standard",
#     "Termination Agreement Template": "termination_standard"
# }

# TEMPLATES = {
#     "Non-Disclosure Agreement": ["NDA Template - Standard", "NDA Template - Mutual"],
#     "Service Agreement": ["Service Agreement Template"],
#     "Employment Contract": ["Employment Contract Template"],
#     "Purchase Agreement": ["Purchase Agreement Template"]
# }

# AGENCIES = [
#     "Department of Commerce",
#     "Department of Defense",
#     "Department of Justice",
#     "Department of Treasury"
# ]

# # ----------- Enums for Swagger UI Form -----------
# class ContractType(str, Enum):
#     nda = "Non-Disclosure Agreement"
#     service = "Service Agreement"
#     employment = "Employment Contract"
#     purchase = "Purchase Agreement"
#     lease = "Lease Agreement"

# class Template(str, Enum):
#     nda_standard = "NDA Template - Standard"
#     nda_mutual = "NDA Template - Mutual"
#     service_standard = "Service Agreement Template"
#     employment_standard = "Employment Contract Template"
#     purchase_standard = "Purchase Agreement Template"
#     lease_standard = "Lease Agreement Template"

# class Agency(str, Enum):
#     commerce = "Department of Commerce"
#     defense = "Department of Defense"
#     justice = "Department of Justice"
#     treasury = "Department of Treasury"

# # ----------- Utilities -----------
# def get_purpose_category(purpose: str) -> str:
#     p = purpose.lower()
#     if "data" in p:
#         return "Data Sharing"
#     elif "research" in p or "r&d" in p:
#         return "Research Collaboration"
#     elif "subcontract" in p:
#         return "Subcontracting"
#     elif "partnership" in p:
#         return "Strategic Partnership"
#     else:
#         return "General Purpose"

# def generate_llm_clause(purpose: str, category: str, agency: str, template: str, effective_date: str) -> str:
#     prompt = f"""
# You are a contract attorney AI. Draft a legal clause based on the following inputs and instructions:

# ## Inputs:
# - Agency: {agency}
# - Purpose: {purpose}
# - Clause Category: {category}
# - Template Type: {template}
# - Effective Date: {effective_date}

# ## Instructions:
# 1. Draft a clause that:
#    - Clearly identifies both the Agency and the Contractor (if contractor name is missing, use [Contractor])
#    - Includes the effective date and expiry date
#    - Mentions the scope or purpose of the contract, based on the provided purpose
#    - References that more details (amount, performance terms) are to be found in Exhibit A or will be mutually agreed

# 2. Use formal legal language appropriate for a U.S. federal contract.

# 3. Keep the clause 2–4 sentences long.

# 4. If any key detail (contractor name, contract amount, etc.) is not given, insert a placeholder such as [TBD] or [Contractor].

# 5. Output only the final clause text—no bullet points or headings.
# """

#     try:
#         response = client.chat.completions.create(
#             model="gpt-4",
#             messages=[{"role": "user", "content": prompt}],
#             max_tokens=300,
#             temperature=0.3,
#         )
#         return response.choices[0].message.content.strip()
#     except Exception as e:
#         return f"(LLM clause generation failed: {str(e)})"

# def render_clause(template_label: str, metadata: Dict) -> str:
#     template_key = TEMPLATE_MAPPING.get(template_label)
#     if not template_key:
#         return f"[No mapped clause template found for '{template_label}']"
#     try:
#         template = env.get_template(f"clauses/{template_key}.jinja")
#         return template.render(**metadata)
#     except Exception as e:
#         return f"[Error rendering clause '{template_key}': {str(e)}]"

# def build_single_clause_draft(template_label: str, metadata: Dict) -> str:
#     clause_text = render_clause(template_label, metadata)
#     return (
#         f"Contract Draft - {template_label}\n\n"
#         f"Effective Date: {metadata['effective_date']}\n"
#         f"Agency: {metadata['agency']}\n\n"
#         f"-------------------------------\n"
#         f"{template_label}\n"
#         f"-------------------------------\n"
#         f"{clause_text}\n\n"
#         f"-------------------------------\n"
#         f"Custom Clause (LLM Generated)\n"
#         f"-------------------------------\n"
#         f"{metadata['llm_clause']}"
#     )

# def save_draft_as_pdf(draft: str, draft_id: str) -> str:
#     pdf_filename = f"contract_{draft_id}.pdf"
#     pdf_path = os.path.join(UPLOAD_FOLDER, pdf_filename)

#     pdf = FPDF()
#     pdf.add_page()
#     pdf.set_font("Arial", size=12)
#     pdf.set_auto_page_break(auto=True, margin=15)
#     for line in draft.split('\n'):
#         pdf.multi_cell(0, 10, txt=line)

#     pdf.output(pdf_path)
#     return pdf_path

# # ----------- Endpoint: Submit Form and Generate Draft -----------
# @router.post("/contracts/ai-draft/submit", response_class=JSONResponse)
# def submit_ai_draft_form(
#     request: Request,
#     contract_type: ContractType = Form(...),
#     template: Template = Form(...),
#     agency: Agency = Form(...),
#     effective_date: str = Form(...),
#     purpose: str = Form(...)
# ):
#     category = get_purpose_category(purpose)
#     llm_clause = generate_llm_clause(purpose, category, agency, template, effective_date)

#     metadata = {
#         "template": template,
#         "agency": agency,
#         "effective_date": effective_date,
#         "purpose": purpose,
#         "llm_clause": llm_clause
#     }

#     draft = build_single_clause_draft(template, metadata)
#     draft_id = str(uuid.uuid4())
#     save_draft_as_pdf(draft, draft_id)

#     return {
#         "draft_id": draft_id,
#         "download_url": f"/contracts/pdf/{draft_id}",
#         "draft": draft,
#         "llm_clause": llm_clause,
#         "category": category,
#         "metadata": metadata
#     }

# # ----------- Endpoint: Download Generated PDF -----------
# @router.get("/contracts/pdf/{draft_id}")
# def download_pdf(draft_id: str):
#     path = os.path.join(UPLOAD_FOLDER, f"contract_{draft_id}.pdf")
#     if not os.path.exists(path):
#         raise HTTPException(status_code=404, detail="PDF not found")
#     return FileResponse(path, media_type="application/pdf", filename=f"contract_{draft_id}.pdf")

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
from dotenv import load_dotenv
load_dotenv()

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

def extract_contractor_from_purpose(purpose: str) -> str:
    prompt = f"""
You are an AI assistant that extracts the name of the contractor or firm mentioned in a government contract description.

Task: From the purpose statement below, extract ONLY the name of the contractor, vendor, or supplier involved. 
If no name is found, respond with "[Not found]".

Example:
Input: "This agreement is for cloud hosting services provided by CyberNetix Technologies for the Department of Energy."
Output: "CyberNetix Technologies"

Now extract from:
"{purpose}"
"""
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=50,
        temperature=0.0,
    )
    return response.choices[0].message.content.strip()

def generate_llm_clause(purpose: str, category: str, agency: str, template: str, effective_date: str, expiry_date: str = "[TBD]", contractor: str = "[Contractor]") -> str:
    prompt = f"""
You are a contract attorney AI. Draft a legal clause based on the following inputs and instructions:

## Inputs:
- Agency: {agency}
- Purpose: {purpose}
- Contractor: {contractor}
- Effective Date: {effective_date}
- Expiry Date: {expiry_date}
- Template: {template}
- Clause Category: {category}

## Instructions:
1. Draft a clause that:
   - Clearly identifies both the Agency and the Contractor
   - Includes the effective and expiry dates
   - Mentions the purpose
   - Refers to Exhibit A for scope, amount, duration, or fallback to mutual agreement

2. Use formal legal language appropriate for a U.S. federal contract.
3. Keep the clause 2–4 sentences long.
4. If any key detail is missing, insert [TBD] or standard fallback language.
5. Output only the final clause text.
"""
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
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
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
    from reportlab.lib.pagesizes import LETTER
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.pdfbase.cidfonts import UnicodeCIDFont
    from reportlab.pdfbase import pdfmetrics

    pdf_filename = f"contract_{draft_id}.pdf"
    pdf_path = os.path.join(UPLOAD_FOLDER, pdf_filename)

    # Register a Unicode font to support special characters
    pdfmetrics.registerFont(UnicodeCIDFont('HeiseiMin-W3'))
    styles = getSampleStyleSheet()
    style = styles["Normal"]
    style.fontName = 'HeiseiMin-W3'

    doc = SimpleDocTemplate(pdf_path, pagesize=LETTER)
    content = []

    for line in draft.split("\n"):
        if line.strip():
            content.append(Paragraph(line.strip(), style))
            content.append(Spacer(1, 10))

    doc.build(content)
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
    contractor = extract_contractor_from_purpose(purpose)
    llm_clause = generate_llm_clause(purpose, category, agency, template, effective_date, expiry_date="[TBD]", contractor=contractor)

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