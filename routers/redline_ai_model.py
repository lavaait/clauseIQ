# from fastapi import APIRouter,FastAPI, HTTPException
# from pydantic import BaseModel
# from typing import List, Optional
# from transformers import pipeline
# from uuid import uuid4
# import random
# import os
# from langchain_openai import ChatOpenAI

# router = APIRouter()

# # ------- Models --------

# class Clause(BaseModel):
#     text: str

# class RedlineRequest(BaseModel):
#     contract_text: str

# class RedlineSuggestion(BaseModel):
#     clause_text: str
#     issue: str
#     confidence: float
#     suggestion: str
#     rationale: str
#     highlight_span: List[int]

# class RedlineResponse(BaseModel):
#     redlines: List[RedlineSuggestion]


# # ------- LLM Setup --------
# def get_llm():
#     temperature = float(os.getenv("LLM_TEMPERATURE", 0.3))
#     api_key = os.getenv("OPENAI_API_KEY")
#     if not api_key:
#         raise ValueError("OPENAI_API_KEY environment variable not set")
#     return ChatOpenAI(
#         model_name="gpt-3.5-turbo",
#         temperature=temperature,
#         openai_api_key=api_key
#     )

# llm = get_llm()

# fallback_clauses = {
#     "confidentiality": [
#         {
#             "text": "Recipient shall use commercially reasonable efforts to protect disclosing party's confidential information.",
#             "rationale": "This fallback aligns with standard enforceability norms and avoids vague terms like 'best efforts'."
#         }
#     ],
#     "term": [
#         {
#             "text": "This Agreement shall remain in effect for a period of three (3) years.",
#             "rationale": "Three years is a typical, auditable term used across agencies."
#         }
#     ]
# }

# # ------- Core Utility Functions --------

# def mock_clause_splitter(contract_text: str) -> List[str]:
#     return [para.strip() for para in contract_text.split("\n") if para.strip() and len(para.strip().split()) > 3]

# def evaluate_clause_risk(clause: str) -> dict:
#     prompt = f"""
#     You are a legal AI assistant evaluating NDA clauses. For the clause:
#     \"{clause}\"
#     Provide:
#     - One key legal issue (e.g., ambiguous term, missing fallback)
#     - A confidence score between 0.0 and 1.0

#     Respond in JSON:
#     {{
#         "issue": "<identified issue>",
#         "confidence": <float>
#     }}
#     """
#     try:
#         result = llm.invoke(prompt)
#         return eval(result.content)
#     except Exception as e:
#         return {
#             "issue": "Could not analyze clause",
#             "confidence": 0.5
#         }

# def get_fallback_suggestion(clause: str) -> dict:
#     key = "confidentiality" if "confidential" in clause.lower() else "term" if "term" in clause.lower() else None
#     if key and key in fallback_clauses:
#         return fallback_clauses[key][0]
#     return {
#         "text": "[No fallback available]",
#         "rationale": "No fallback match found for this clause type."
#     }

# def locate_risky_phrase_span(clause: str) -> List[int]:
#     words = clause.split()
#     if len(words) < 5:
#         return [0, len(clause)]
#     start = clause.find(words[1])
#     end = clause.find(words[-2]) + len(words[-2])
#     return [start, end]

# # ------- API Route --------

# @router.post("/api/redline-analyze", response_model=RedlineResponse)
# def redline_analyze(request: RedlineRequest):
#     clauses = mock_clause_splitter(request.contract_text)
#     suggestions = []

#     for clause in clauses:
#         analysis = evaluate_clause_risk(clause)
#         fallback = get_fallback_suggestion(clause)
#         span = locate_risky_phrase_span(clause)

#         suggestions.append(RedlineSuggestion(
#             clause_text=clause,
#             issue=analysis['issue'],
#             confidence=round(analysis['confidence'], 2),
#             suggestion=fallback['text'],
#             rationale=fallback['rationale'],
#             highlight_span=span
#         ))

#     return RedlineResponse(redlines=suggestions)


from fastapi import APIRouter, FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from transformers import pipeline
from uuid import uuid4
import random
import os
from langchain_openai import ChatOpenAI

router = APIRouter()

# ------- Models --------

class Clause(BaseModel):
    text: str

class RedlineRequest(BaseModel):
    contract_text: str

class RedlineSuggestion(BaseModel):
    clause_text: str
    issue: str
    confidence: float
    suggestion: str
    rationale: str
    highlight_span: List[int]

# --- NEW: A model to hold both the suggestions and the modified text ---
class FinalContractResponse(BaseModel):
    redlines: List[RedlineSuggestion]
    modified_contract_text: str

# ------- LLM Setup --------
def get_llm():
    temperature = float(os.getenv("LLM_TEMPERATURE", 0.3))
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable not set")
    return ChatOpenAI(
        model_name="gpt-3.5-turbo",
        temperature=temperature,
        openai_api_key=api_key
    )

llm = get_llm()

fallback_clauses = {
    "confidentiality": [
        {
            "text": "Recipient shall use commercially reasonable efforts to protect disclosing party's confidential information.",
            "rationale": "This fallback aligns with standard enforceability norms and avoids vague terms like 'best efforts'."
        }
    ],
    "term": [
        {
            "text": "This Agreement shall remain in effect for a period of three (3) years.",
            "rationale": "Three years is a typical, auditable term used across agencies."
        }
    ],
    "liability": [
        {
            "text": "The service provider's liability for any damages arising from this agreement shall not exceed the total fees paid by the client in the preceding twelve (12) months.",
            "rationale": "This clause introduces a standard, defensible limitation of liability."
        }
    ],
    "indemnification": [
        {
            "text": "Each party shall indemnify and hold harmless the other party from and against any third-party claims arising from their own gross negligence or willful misconduct.",
            "rationale": "This provides for mutual indemnification based on clear standards of fault, which is a common and fair approach."
        },
        {
            "text": "Each party agrees to indemnify the other for any third-party claims arising from the indemnifying party's breach of its representations, warranties, or covenants under this Agreement.",
            "rationale": "This is a narrower indemnity clause, focusing only on claims stemming from breaches of the contract itself."
        }
    ],
    "governing_law": [
        {
            "text": "This Agreement and any dispute or claim arising out of or in connection with it or its subject matter or formation (including non-contractual disputes or claims) shall be governed by and construed in accordance with the laws of the State of California.",
            "rationale": "The laws of California are often used due to the state's legal precedent and technology-centric economy."
        },
        {
            "text": "This Agreement shall be governed by and construed in accordance with the laws of the Commonwealth of Massachusetts, without regard to its conflict of law principles.",
            "rationale": "Massachusetts is a common choice for contracts, known for its robust legal system."
        }
    ],
    "force_majeure": [
        {
            "text": "Neither party shall be liable for any failure or delay in performing its obligations under this Agreement to the extent that such failure or delay is caused by a Force Majeure Event, including but not limited to, acts of God, war, terrorism, pandemics, or natural disasters.",
            "rationale": "This clause is standard, including modern events like pandemics, and clearly defines the scope of excusable delay."
        }
    ]
}

# ------- Core Utility Functions --------

def mock_clause_splitter(contract_text: str) -> List[str]:
    return [para.strip() for para in contract_text.split("\n") if para.strip() and len(para.strip().split()) > 3]

def evaluate_clause_risk(clause: str) -> dict:
    prompt = f"""
    You are a legal AI assistant evaluating NDA clauses. For the clause:
    \"{clause}\"
    Provide:
    - One key legal issue (e.g., ambiguous term, missing fallback)
    - A confidence score between 0.0 and 1.0

    Respond in JSON:
    {{
        "issue": "<identified issue>",
        "confidence": <float>
    }}
    """
    try:
        result = llm.invoke(prompt)
        # Using ast.literal_eval is safer than eval() for parsing JSON-like strings
        import ast
        return ast.literal_eval(result.content)
    except Exception as e:
        return {
            "issue": "Could not analyze clause",
            "confidence": 0.5
        }

def get_fallback_suggestion(clause: str) -> dict:
    key = None
    if "confidential" in clause.lower():
        key = "confidentiality"
    elif "term" in clause.lower():
        key = "term"
    elif "liable" in clause.lower() or "liability" in clause.lower():
        key = "liability"
    elif "indemnify" in clause.lower():
        key = "indemnification"
    elif "governing" in clause.lower() or "law" in clause.lower():
        key = "governing_law"
    elif "force majeure" in clause.lower():
        key = "force_majeure"

    if key and key in fallback_clauses:
        # For clauses with multiple options, you might pick one or use a more complex logic.
        # Here, we'll just pick the first option.
        return fallback_clauses[key][0]
    return {
        "text": "[No fallback available]",
        "rationale": "No fallback match found for this clause type."
    }

def locate_risky_phrase_span(clause: str) -> List[int]:
    words = clause.split()
    if len(words) < 5:
        return [0, len(clause)]
    start = clause.find(words[1])
    end = clause.find(words[-2]) + len(words[-2])
    return [start, end]

# ------- API Route --------

# --- CHANGED: The response model is now FinalContractResponse ---
@router.post("/api/redline-analyze", response_model=FinalContractResponse)
def redline_analyze(request: RedlineRequest):
    clauses = mock_clause_splitter(request.contract_text)
    suggestions = []
    # --- NEW: List to hold the clauses after potential modification ---
    modified_clauses = []

    for clause in clauses:
        analysis = evaluate_clause_risk(clause)
        fallback = get_fallback_suggestion(clause)
        span = locate_risky_phrase_span(clause)

        # --- NEW LOGIC: Check for a valid fallback suggestion ---
        if fallback['text'] == "[No fallback available]":
            # If no fallback is available, keep the original clause
            modified_clauses.append(clause)
        else:
            # If a fallback exists, use it to replace the original clause
            modified_clauses.append(fallback['text'])

        suggestions.append(RedlineSuggestion(
            clause_text=clause,
            issue=analysis['issue'],
            confidence=round(analysis['confidence'], 2),
            suggestion=fallback['text'],
            rationale=fallback['rationale'],
            highlight_span=span
        ))

    # --- NEW: Join the modified clauses to create the final contract string ---
    modified_contract_text = "\n\n".join(modified_clauses)
    
    # --- CHANGED: Return the new FinalContractResponse model ---
    return FinalContractResponse(
        redlines=suggestions,
        modified_contract_text=modified_contract_text
    )