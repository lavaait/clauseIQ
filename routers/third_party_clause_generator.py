from fastapi import APIRouter, UploadFile, File
import pdfplumber, pytesseract, io, sqlite3
from docx import Document
import spacy
from transformers import pipeline
from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import os
import warnings
warnings.warn("This feature will be removed soon.", PendingDeprecationWarning)

router = APIRouter()

# ───────────────────────── NLP/ML MODELS ─────────────────────────
nlp = spacy.load("en_core_web_sm")
classifier = pipeline("text-classification", model="typeform/distilbert-base-uncased-mnli")
llm = ChatOpenAI(temperature=0)

prompt = PromptTemplate.from_template(
    "Given this clause: \"{clause}\", and standard: \"{standard}\", does the clause meet expectations? Return YES or NO and briefly justify."
)
reason_chain = LLMChain(llm=llm, prompt=prompt)

# ───────────────────────── UTILITIES ─────────────────────────────

def extract_text(file_bytes: bytes, filename: str) -> str:
    if filename.endswith(".pdf"):
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            text = ""
            for page in pdf.pages:
                text += page.extract_text() or pytesseract.image_to_string(page.to_image().original)
        return text
    elif filename.endswith(".docx"):
        doc = Document(io.BytesIO(file_bytes))
        return "\n".join([p.text for p in doc.paragraphs])
    return ""

def segment_clauses(text: str):
    doc = nlp(text)
    return [sent.text.strip() for sent in doc.sents if len(sent.text.strip()) > 20]

def classify_clause(text: str):
    labels = ["Indemnity", "Non-Disclosure", "Payment Terms", "Confidentiality", "Termination"]
    result = classifier(text)
    return result[0]['label'], result[0]['score']

def reason_clause_alignment(clause: str, standard: str):
    return reason_chain.run(clause=clause, standard=standard)

def get_or_create_standard_clause(clause_type: str) -> tuple:
    conn = sqlite3.connect("contracts.db")
    cursor = conn.cursor()
    cursor.execute("SELECT standard_clause, risk_guidance FROM clause_playbook WHERE clause_type = ?", (clause_type,))
    row = cursor.fetchone()

    # Insert default template if missing
    if not row:
        default_clause = f"Standard clause for {clause_type} needs to be defined."
        default_guidance = f"Missing standard for {clause_type}. Insert to reduce compliance gaps."
        cursor.execute(
            "INSERT INTO clause_playbook (clause_type, standard_clause, risk_guidance) VALUES (?, ?, ?)",
            (clause_type, default_clause, default_guidance)
        )
        conn.commit()
        conn.close()
        return default_clause, default_guidance
    else:
        conn.close()
        return row

# ───────────────────────── API ROUTE ─────────────────────────────

@router.post("/api/analyze")
async def analyze_contract(file: UploadFile = File(...)):
    content = await file.read()
    text = extract_text(content, file.filename)
    clauses = segment_clauses(text)

    ai_highlights = []
    reasoning_blocks = []
    results = []

    for clause_text in clauses:
        label, confidence = classify_clause(clause_text)
        standard, guidance = get_or_create_standard_clause(label)

        # LLM reasoning
        reasoning = reason_clause_alignment(clause_text, standard) if standard else "No standard available"
        risk_status = "OK" if "YES" in reasoning.upper() else ("Misaligned" if standard else "Missing")

        # Add highlights
        if risk_status != "OK":
            ai_highlights.append(f"{label} clause {risk_status.lower()}")

            reasoning_blocks.append({
                "clause_type": label,
                "reasoning": f"RULE: {label} Clause Guidelines\n\n{reasoning.strip()}"
            })

        results.append({
            "clause_text": clause_text,
            "clause_type": label,
            "confidence": round(confidence, 2),
            "standard_clause": standard,
            "risk_guidance": guidance,
            "reasoning": reasoning,
            "risk_status": risk_status
        })

    return {
        "filename": file.filename,
        "num_clauses": len(results),
        "results": results,
        "ai_highlights": ai_highlights,
        "reasoning_blocks": reasoning_blocks,
        "total_flagged": len(ai_highlights)
    }