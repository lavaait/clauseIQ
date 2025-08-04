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
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Tuple
from jinja2 import Environment, FileSystemLoader
from fpdf import FPDF
from openai import OpenAI

# --- Initialization ---
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

env = Environment(loader=FileSystemLoader("templates"))
UPLOAD_FOLDER = "generated_contracts"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

router = APIRouter()

# --- Clause Mapping ---
TEMPLATE_TO_CLAUSE = {
    "NDA": "nda_standard",
    "GDPR": "gdpr",
    "Service Agreement": "service_level_agreement",
    "Termination": "termination",
    "Payment": "payment",
    "Dispute Resolution": "dispute_resolution",
    "Governing Law": "governing_law"
}

# --- Request Model ---
class DraftRequest(BaseModel):
    template: str         # e.g., "NDA"
    agency: str
    effective_date: str
    purpose: str

# --- Utility: Classify Purpose ---
def get_purpose_category(purpose: str) -> str:
    purpose = purpose.lower()
    if "data" in purpose:
        return "Data Sharing"
    elif "research" in purpose or "r&d" in purpose:
        return "Research Collaboration"
    elif "subcontract" in purpose:
        return "Subcontracting"
    elif "partnership" in purpose:
        return "Strategic Partnership"
    else:
        return "General Purpose"

# --- Utility: Generate LLM Clause ---
def generate_llm_clause(purpose: str, category: str, agency: str) -> str:
    prompt = (
        f"Based on the following, write a concise 2-3 sentence legal clause for a contract.\n"
        f"Focus on the specific rights and obligations of the parties for this purpose.\n\n"
        f"- Agency Name: {agency}\n"
        f"- Purpose: {purpose}\n"
        f"- Category: {category}\n"
        f"The clause should be legally sound, clear, and relevant to the purpose."
        f"**Response must be a single paragraph.**"
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

# --- Utility: Render Clause Template ---
def render_clause(clause_name: str, metadata: dict) -> str:
    try:
        template = env.get_template(f"clauses/{clause_name}.jinja")
        return template.render(**metadata)
    except Exception as e:
        return f"[Error rendering clause '{clause_name}': {str(e)}]"

# --- Utility: Build Final Draft (1 Clause + LLM) ---
def build_single_clause_draft(template_key: str, metadata: dict) -> Tuple[str, str]:
    clause_name = TEMPLATE_TO_CLAUSE.get(template_key)
    if not clause_name:
        return "", f"No clause mapping found for template '{template_key}'"

    try:
        clause_text = render_clause(clause_name, metadata)
        draft = (
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
        return draft, "Rendered single-clause draft"
    except Exception as e:
        return "", f"Error rendering clause: {str(e)}"

# --- Utility: Export to PDF ---
def save_draft_as_pdf(draft: str, draft_id: str) -> str:
    pdf_filename = f"contract_{draft_id}.pdf"
    pdf_path = os.path.join(UPLOAD_FOLDER, pdf_filename)

    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.set_font("Arial", size=12)
    for line in draft.split('\n'):
        pdf.multi_cell(0, 10, txt=line)

    pdf.output(pdf_path)
    return pdf_path

# --- API Endpoint ---
@router.post("/contract/draft")
def generate_contract_draft(request: DraftRequest):
    # Classify and Enhance
    category = get_purpose_category(request.purpose)
    llm_clause = generate_llm_clause(request.purpose, category,request.agency)

    metadata = {
        "template": request.template,
        "agency": request.agency,
        "effective_date": request.effective_date,
        "purpose": request.purpose,
        "llm_clause": llm_clause
    }

    # Generate Final Draft
    draft, rationale = build_single_clause_draft(request.template, metadata)
    if not draft:
        raise HTTPException(status_code=500, detail=f"Draft generation failed: {rationale}")

    # Save as PDF
    draft_id = str(uuid.uuid4())
    save_draft_as_pdf(draft, draft_id)

    # Respond
    return {
        "draft_id": draft_id,
        "download_url": f"/contracts/pdf/{draft_id}",
        "draft": draft,
        "rationale": rationale,
        "selected_clause": TEMPLATE_TO_CLAUSE.get(request.template),
        "purpose_category": category,
        "llm_clause": llm_clause
    }