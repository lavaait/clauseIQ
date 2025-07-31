from fastapi import APIRouter,FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from transformers import pipeline
from uuid import uuid4
import random

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

class RedlineResponse(BaseModel):
    redlines: List[RedlineSuggestion]

# ------- Dummy Evaluators (Replace with LangChain/OpenAI for prod) --------

zero_shot = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
candidate_issues = [
    "Ambiguous term",
    "Vague legal obligation",
    "Missing fallback clause",
    "Non-compliant with standard practice",
    "Unenforceable language"
]

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
    ]
}

# ------- Core Utility Functions --------

def mock_clause_splitter(contract_text: str) -> List[str]:
    return [para.strip() for para in contract_text.split("\n") if para.strip() and len(para.strip().split()) > 3]

def evaluate_clause_risk(clause: str) -> dict:
    label = random.choice(candidate_issues)
    return {
        "issue": label,
        "confidence": round(random.uniform(0.6, 0.95), 2)
    }

def get_fallback_suggestion(clause: str) -> dict:
    key = "confidentiality" if "confidential" in clause.lower() else "term" if "term" in clause.lower() else None
    if key and key in fallback_clauses:
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

@router.post("/api/redline-analyze", response_model=RedlineResponse)
def redline_analyze(request: RedlineRequest):
    clauses = mock_clause_splitter(request.contract_text)
    suggestions = []

    for clause in clauses:
        analysis = evaluate_clause_risk(clause)
        fallback = get_fallback_suggestion(clause)
        span = locate_risky_phrase_span(clause)

        suggestions.append(RedlineSuggestion(
            clause_text=clause,
            issue=analysis['issue'],
            confidence=analysis['confidence'],
            suggestion=fallback['text'],
            rationale=fallback['rationale'],
            highlight_span=span
        ))

    return RedlineResponse(redlines=suggestions)
