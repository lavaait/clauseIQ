from fastapi import FastAPI,APIRouter
from pydantic import BaseModel
from typing import Dict
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.chat_models import ChatOpenAI
import os
from dotenv import load_dotenv
import pandas as pd
import sqlite3

load_dotenv()

router = APIRouter()
# ------------------------------
# 1. LangChain setup
# ------------------------------
template = PromptTemplate(
    input_variables=["status_text", "vendor_name", "contract_summary", "action"],
    template="""
You are a senior contract analyst.

Vendor: {vendor_name}

RAG status:
{status_text}

Contract Summary:
{contract_summary}

Recommended action: {action}

Write:
1. A short justification (1–2 sentences).
2. A professional renewal/renegotiation/termination clause.
"""
)

llm = ChatOpenAI(temperature=0)
chain = LLMChain(prompt=template, llm=llm)

# ------------------------------
# 2. KPI Computation from SQLite
# ------------------------------
def compute_kpis_from_sqlite(contract_id: str, db_path="contracts.db"):
    conn = sqlite3.connect(db_path)
    df = pd.read_sql_query(
        f"SELECT * FROM tasks WHERE contract_id = ?", conn, params=(contract_id,)
    )
    conn.close()

    if df.empty:
        return {"term_length": 0, "usage_percent": 0.0, "delivery_score": 0.0}

    today = pd.Timestamp.now()
    df['created_at'] = pd.to_datetime(df['created_at']).dt.tz_localize(None)
    df['due_date'] = pd.to_datetime(df['due_date']).dt.tz_localize(None)
    today = pd.Timestamp.now()

    # Term length
    first_task_date = df['created_at'].min()
    term_length = (today.year - first_task_date.year) * 12 + (today.month - first_task_date.month)

    # Usage
    total_tasks = len(df)
    completed_tasks = len(df[df['status'].str.lower() == 'completed'])
    usage_percent = (completed_tasks / total_tasks) * 100

    # Delivery score (simple lateness penalty)
    overdue = df[(df['status'].str.lower() != 'completed') & (df['due_date'] < today)]
    late_penalty = len(overdue) / total_tasks
    delivery_score = max(0, min(100, 100 - (late_penalty * 100)))

    return {
        "term_length": round(term_length, 2),
        "usage_percent": round(usage_percent, 2),
        "delivery_score": round(delivery_score, 2)
    }

# ------------------------------
# 3. RAG logic
# ------------------------------
def rag_status(term_length: float, usage_percent: float, delivery_score: float) -> Dict[str, str]:
    status = {"Term": "Green", "Usage": "Green", "Delivery": "Green"}

    if term_length < 6:
        status["Term"] = "Red"
    elif term_length < 12:
        status["Term"] = "Amber"

    if usage_percent < 40:
        status["Usage"] = "Red"
    elif usage_percent < 80:
        status["Usage"] = "Amber"

    if delivery_score < 60:
        status["Delivery"] = "Red"
    elif delivery_score < 85:
        status["Delivery"] = "Amber"

    return status

# ------------------------------
# 4. Action recommender
# ------------------------------
def recommend_action(rag: Dict[str, str]) -> str:
    red_count = list(rag.values()).count("Red")
    amber_count = list(rag.values()).count("Amber")

    if red_count >= 2:
        return "terminate"
    elif red_count == 1 or amber_count >= 2:
        return "renegotiate"
    else:
        return "renew"
    
# ------------------------------
# 5. Confidence Score Calculator
# ------------------------------
def compute_confidence_score(rag: Dict[str, str]) -> float:
    weights = {"Green": 1.0, "Amber": 0.6, "Red": 0.2}
    weighted = [weights[color] for color in rag.values()]
    avg_score = sum(weighted) / len(weighted)
    return round(avg_score * 100, 2)

# ------------------------------
# 6. API Endpoint
# ------------------------------
@router.get("/api/renewal/recommend/{contract_id}")
def recommend_from_db(contract_id: str):
    kpis = compute_kpis_from_sqlite(contract_id)

    # Placeholder vendor and summary (replace with real data if needed)
    vendor_name = "Vendor for " + contract_id
    contract_summary = f"Contract {contract_id} involves delivery of services/tasks as per timeline."

    rag = rag_status(kpis["term_length"], kpis["usage_percent"], kpis["delivery_score"])
    action = recommend_action(rag)
    confidence = compute_confidence_score(rag)

    status_text = (
        f"- Term: {rag['Term']}\n"
        f"- Usage: {rag['Usage']}\n"
        f"- Delivery: {rag['Delivery']}"
    )

    llm_response = chain.run(
        status_text=status_text,
        vendor_name=vendor_name,
        contract_summary=contract_summary,
        action=action.upper()
    )

    return {
        "contract_id": contract_id,
        "kpis": kpis,
        "rag_status": rag,
        "recommended_action": action,
        "confidence_score": confidence,
        "llm_response": llm_response
    }

# 90–100%: High confidence in recommended action (all KPIs Green) - renew
# 60–80%: Medium confidence (some Amber) - renegotiate
# <50%: Low confidence (one or more Red flags) - terminate

# RAG Status	                                            Score	Action
# {"Term": "Green", "Usage": "Green", "Delivery": "Green"}	100.0	- renew
# {"Term": "Amber", "Usage": "Amber", "Delivery": "Amber"}	60.0	 - renegotiate
# {"Term": "Red", "Usage": "Red", "Delivery": "Red"}	    20.0	 - terminate
# {"Term": "Green", "Usage": "Amber", "Delivery": "Red"}	60.0	- renegotiate