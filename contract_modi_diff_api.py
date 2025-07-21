from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from typing import List, Literal
from difflib import unified_diff
from datetime import date, datetime
from uuid import uuid4
from pathlib import Path

from langchain_community.llms import HuggingFaceEndpoint
import os
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title="AI Powered Contract Modification API")

# In-memory store for modification history
MOD_HISTORY = {}

# --- Input schema ---
class ContractModification(BaseModel):
    contract_id: str
    version: int
    mod_type: Literal["Scope", "Funding", "Schedule", "Other"]
    justification: str
    effective_date: date
    end_date: date
    original_clause: str
    modified_clause: str

# --- Diff Generator ---
def generate_clause_diff(original: str, modified: str) -> str:
    diff = unified_diff(
        original.splitlines(),
        modified.splitlines(),
        fromfile="Original",
        tofile="Modified",
        lineterm=""
    )
    return "\n".join(diff)

# --- AI Impact Analysis ---
def analyze_modification(diff_text: str, mod_type: str, justification: str) -> dict:
    llm = HuggingFaceEndpoint(
    repo_id="mistralai/Mistral-7B-Instruct-v0.1",
    temperature=0,
    max_new_tokens=512,
    huggingfacehub_api_token=os.getenv("HUGGINGFACEHUB_API_TOKEN")
    )
    prompt = PromptTemplate(
        input_variables=["diff", "mod_type", "justification"],
        template="""
You are a contract compliance advisor.
A user submitted a contract modification with the following details:

Type: {mod_type}
Justification: {justification}

Here is the diff between the original and modified clause:
{diff}

Analyze the impact on the contract lifecycle. Indicate affected areas (schedule, cost, scope, performance). Estimate:
- Risk trend: Improving or Worsening
- Risk increase percent
- Cost variance in dollars (positive = overrun, negative = savings)
- Obligations on-time (%)
- Severity level: Low / Moderate / High
Return a JSON object with keys:
affected, severity, summary, trend, risk_increase_pct, cost_variance, on_time_pct.
"""
    )
    chain = LLMChain(llm=llm, prompt=prompt)
    response = chain.run(diff=diff_text, mod_type=mod_type, justification=justification)
    return response

# --- Main Analysis Endpoint ---
@app.post("/analyze-modification")
def analyze(mod: ContractModification):
    diff = generate_clause_diff(mod.original_clause, mod.modified_clause)
    impact = analyze_modification(diff, mod.mod_type, mod.justification)

    entry = {
        "id": str(uuid4()),
        "contract_id": mod.contract_id,
        "version": mod.version,
        "type": mod.mod_type,
        "justification": mod.justification,
        "effective_date": str(mod.effective_date),
        "end_date": str(mod.end_date),
        "diff": diff,
        "ai_impact": impact,
        "timestamp": datetime.utcnow().isoformat()
    }
    MOD_HISTORY.setdefault(mod.contract_id, []).append(entry)

    return entry

# --- Version History Lookup ---
@app.get("/modification-history/{contract_id}")
def get_history(contract_id: str):
    return MOD_HISTORY.get(contract_id, [])

# --- File Upload Support ---
@app.post("/upload-modification-file/{contract_id}")
async def upload_file(contract_id: str, file: UploadFile = File(...)):
    save_path = Path("uploads") / contract_id
    save_path.mkdir(parents=True, exist_ok=True)
    file_path = save_path / file.filename
    with open(file_path, "wb") as f:
        f.write(await file.read())
    return {"message": "File uploaded", "path": str(file_path)}