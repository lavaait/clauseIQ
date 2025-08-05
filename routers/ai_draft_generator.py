# import os
# import uuid
# from fastapi import APIRouter, HTTPException
# from pydantic import BaseModel
# from typing import Tuple
# from jinja2 import Environment, FileSystemLoader
# from fpdf import FPDF
# from openai import OpenAI

# # Setup OpenAI Key and Jinja2
# client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# env = Environment(loader=FileSystemLoader("templates/clauses"))
# UPLOAD_FOLDER = "generated_contracts"
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# router = APIRouter()


# # ----------- Pydantic Request Model -----------

# class DraftRequest(BaseModel):
#     template: str
#     agency: str
#     effective_date: str
#     contract_type: str
#     purpose: str


# # ----------- Template Utility -----------

# def to_template_filename(name: str) -> str:
#     name = name.lower().strip()
#     name = name.replace("template", "")
#     name = name.replace("-", "")
#     name = name.replace(" ", "_")
#     return f"{name}.jinja"


# # ----------- Purpose Categorization -----------

# def get_purpose_category(purpose: str) -> str:
#     if "data" in purpose.lower():
#         return "Data Sharing"
#     elif "research" in purpose.lower() or "r&d" in purpose.lower():
#         return "Research Collaboration"
#     elif "subcontract" in purpose.lower():
#         return "Subcontracting"
#     elif "partnership" in purpose.lower():
#         return "Strategic Partnership"
#     else:
#         return "General Purpose"


# # ----------- LLM Suggestion -----------

# def generate_llm_clauses(purpose: str, category: str) -> str:
#     prompt = (
#         f"Write a concise 2–3 sentence legal clause for a contract with the following purpose:\n"
#         f"Purpose: {purpose}\n"
#         f"Category: {category}\n"
#         f"The clause should be legally sound, clear, and relevant to the purpose."
#     )

#     try:
#         response = client.chat.completions.create(
#             model="gpt-4",
#             messages=[{"role": "user", "content": prompt}],
#             max_tokens=200,
#             temperature=0.3,
#         )
#         return response.choices[0].message.content.strip()
#     except Exception as e:
#         return f"(LLM clause generation failed: {str(e)})"


# # ----------- Template Renderer -----------

# def generate_contract_from_template(template_name: str, metadata: dict) -> Tuple[str, str]:
#     try:
#         template_file = to_template_filename(template_name)
#         template = env.get_template(template_file)
#         return template.render(**metadata), "Rendered from template"
#     except Exception as e:
#         return "", f"Error loading template: {str(e)}"


# # ----------- PDF Writer -----------

# def save_draft_as_pdf(draft: str, draft_id: str) -> str:
#     pdf_filename = f"contract_{draft_id}.pdf"
#     pdf_path = os.path.join(UPLOAD_FOLDER, pdf_filename)

#     pdf = FPDF()
#     pdf.add_page()
#     pdf.set_auto_page_break(auto=True, margin=15)
#     pdf.set_font("Arial", size=12)
#     for line in draft.split('\n'):
#         pdf.multi_cell(0, 10, txt=line)

#     pdf.output(pdf_path)
#     return pdf_path


# # ----------- API Endpoint -----------

# @router.post("/contract/draft")
# def generate_contract_draft(request: DraftRequest):
#     # Classify and enhance
#     category = get_purpose_category(request.purpose)
#     llm_clause = generate_llm_clauses(request.purpose, category)

#     metadata = {
#         "agency": request.agency,
#         "effective_date": request.effective_date,
#         "contract_type": request.contract_type,
#         "purpose": request.purpose,
#         "llm_clause": llm_clause
#     }

#     draft, rationale = generate_contract_from_template(request.template, metadata)

#     if not draft:
#         raise HTTPException(status_code=500, detail=f"Draft generation failed: {rationale}")

#     draft_id = str(uuid.uuid4())
#     save_draft_as_pdf(draft, draft_id)

#     return {
#         "draft_id": draft_id,
#         "download_url": f"/contracts/pdf/{draft_id}",
#         "draft": draft,
#         "rationale": rationale,
#         "purpose_category": category,
#         "llm_clause": llm_clause
#     }


# import os
# import uuid
# from fastapi import APIRouter, HTTPException
# from pydantic import BaseModel
# from typing import Tuple
# from jinja2 import Environment, FileSystemLoader
# from fpdf import FPDF
# from openai import OpenAI

# # --- Setup ---
# client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
# env = Environment(loader=FileSystemLoader("templates"))
# UPLOAD_FOLDER = "generated_contracts"
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# router = APIRouter()

# # --- Contract Type to Clause Mapping ---
# CONTRACT_TYPE_CLAUSES = {
#     "NDA": ["nda_standard", "termination", "dispute_resolution", "governing_law"],
#     "Service Agreement": ["service_level_agreement", "payment", "termination", "dispute_resolution"],
#     "Data Sharing": ["gdpr", "nda_standard", "termination", "dispute_resolution"],
#     "Research MOU": ["nda_standard", "gdpr", "governing_law", "termination"],
#     "Subcontract": ["payment", "service_level_agreement", "termination", "governing_law"]
# }

# # --- Request Model ---
# class DraftRequest(BaseModel):
#     contract_type: str
#     agency: str
#     effective_date: str
#     purpose: str

# # --- Clause Selector ---
# def get_clauses_for_contract_type(contract_type: str) -> list[str]:
#     return CONTRACT_TYPE_CLAUSES.get(contract_type, ["nda_standard", "termination","service_level_agreement","payment_terms","governing_laws","gdpr","intellectual_property","amendments","dispute_resolution"])

# # --- Purpose Category Classifier ---
# def get_purpose_category(purpose: str) -> str:
#     purpose = purpose.lower()
#     if "data" in purpose:
#         return "Data Sharing"
#     elif "research" in purpose or "r&d" in purpose:
#         return "Research Collaboration"
#     elif "subcontract" in purpose:
#         return "Subcontracting"
#     elif "partnership" in purpose:
#         return "Strategic Partnership"
#     else:
#         return "General Purpose"

# # --- LLM Clause Generator ---
# def generate_llm_clause(purpose: str, category: str) -> str:
#     prompt = (
#         f"Write a concise 2–3 sentence legal clause for a contract with the following purpose:\n"
#         f"Purpose: {purpose}\n"
#         f"Category: {category}\n"
#         f"The clause should be legally sound, clear, and relevant to the purpose."
#     )
#     try:
#         response = client.chat.completions.create(
#             model="gpt-4",
#             messages=[{"role": "user", "content": prompt}],
#             max_tokens=200,
#             temperature=0.3,
#         )
#         return response.choices[0].message.content.strip()
#     except Exception as e:
#         return f"(LLM clause generation failed: {str(e)})"

# # --- Render Individual Clause ---
# def render_clause(clause_name: str, metadata: dict) -> str:
#     try:
#         clause_template = env.get_template(f"clauses/{clause_name}.jinja")
#         return clause_template.render(**metadata)
#     except Exception as e:
#         return f"[Error rendering clause '{clause_name}': {str(e)}]"

# # --- Build All Clauses ---
# def build_contract_sections(clause_names: list[str], metadata: dict) -> dict:
#     sections = {}
#     for name in clause_names:
#         sections[name] = render_clause(name, metadata)
#     return sections

# # --- Render Final Document ---
# def render_full_contract(clause_names: list[str], metadata: dict) -> Tuple[str, str]:
#     try:
#         clause_sections = build_contract_sections(clause_names, metadata)
#         metadata.update({
#             "clause_sections": clause_sections,
#             "llm_clause": metadata["llm_clause"]
#         })
#         template = env.get_template("full_contract.jinja")
#         return template.render(**metadata), "Rendered full contract"
#     except Exception as e:
#         return "", f"Master template render failed: {str(e)}"

# # --- PDF Writer ---
# def save_draft_as_pdf(draft: str, draft_id: str) -> str:
#     pdf_filename = f"contract_{draft_id}.pdf"
#     pdf_path = os.path.join(UPLOAD_FOLDER, pdf_filename)

#     pdf = FPDF()
#     pdf.add_page()
#     pdf.set_auto_page_break(auto=True, margin=15)
#     pdf.set_font("Arial", size=12)
#     for line in draft.split('\n'):
#         pdf.multi_cell(0, 10, txt=line)

#     pdf.output(pdf_path)
#     return pdf_path

# # --- API Endpoint ---
# @router.post("/contract/draft")
# def generate_contract_draft(request: DraftRequest):
#     clause_list = get_clauses_for_contract_type(request.contract_type)
#     category = get_purpose_category(request.purpose)
#     llm_clause = generate_llm_clause(request.purpose, category)

#     metadata = {
#         "agency": request.agency,
#         "effective_date": request.effective_date,
#         "contract_type": request.contract_type,
#         "purpose": request.purpose,
#         "llm_clause": llm_clause
#     }

#     draft, rationale = render_full_contract(clause_list, metadata)

#     if not draft:
#         raise HTTPException(status_code=500, detail=f"Draft generation failed: {rationale}")

#     draft_id = str(uuid.uuid4())
#     save_draft_as_pdf(draft, draft_id)

#     return {
#         "draft_id": draft_id,
#         "download_url": f"/contracts/pdf/{draft_id}",
#         "draft": draft,
#         "rationale": rationale,
#         "clauses_used": clause_list,
#         "purpose_category": category,
#         "llm_clause": llm_clause
#     }


import os
import uuid
from typing import Dict
from fastapi import FastAPI, APIRouter, Form, Request
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from jinja2 import Environment, FileSystemLoader
from fpdf import FPDF
from enum import Enum
from openai import OpenAI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.exceptions import HTTPException

# ----------- Initialization -----------
router = APIRouter()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
env = Environment(loader=FileSystemLoader("templates"))
UPLOAD_FOLDER = "generated_contracts"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

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

# ----------- Utility Functions -----------

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

def render_clause(clause_name: str, metadata: Dict) -> str:
    try:
        template = env.get_template(f"clauses/{clause_name}.jinja")
        return template.render(**metadata)
    except Exception as e:
        return f"[Error rendering clause '{clause_name}': {str(e)}]"

def build_single_clause_draft(template_key: str, metadata: Dict) -> str:
    clause_text = render_clause(template_key, metadata)
    return (
        f"Contract Draft - {template_key}\n\n"
        f"Effective Date: {metadata['effective_date']}\n"
        f"Agency: {metadata['agency']}\n\n"
        f"-------------------------------\n"
        f"{template_key}\n"
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

# ----------- API Endpoints -----------
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

    # metadata.update({
    #     "available_contract_types": CONTRACT_TYPES,
    #     "available_templates": TEMPLATES,
    #     "template_mapping": TEMPLATE_MAPPING,
    #     "available_agencies": AGENCIES
    # })

    draft = build_single_clause_draft(template, metadata)
    draft_id = str(uuid.uuid4())
    pdf_path = save_draft_as_pdf(draft, draft_id)

    return {
        "draft_id": draft_id,
        "download_url": f"/contracts/pdf/{draft_id}",
        "draft": draft,
        "llm_clause": llm_clause,
        "category": category,
        "metadata": metadata
    }

@router.get("/contracts/pdf/{draft_id}")
def download_pdf(draft_id: str):
    path = os.path.join(UPLOAD_FOLDER, f"contract_{draft_id}.pdf")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="PDF not found")
    return FileResponse(path, media_type="application/pdf", filename=f"contract_{draft_id}.pdf")