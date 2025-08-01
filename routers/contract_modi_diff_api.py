import os
from fastapi import FastAPI, HTTPException
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import difflib
from typing import List
import uuid
import json
import re

from dotenv import load_dotenv
load_dotenv()

from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain_openai import ChatOpenAI

router = APIRouter()

# router.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# -----------------------------
# Models
# -----------------------------
class VersionEntry(BaseModel):
    type: str
    description: str
    date: str
    user: str

class ModificationRequest(BaseModel):
    original_text: str
    modified_text: str

class ModificationAnalysis(BaseModel):
    modification_type: str  # scope, funding, schedule
    justification: str
    summary: str
    impact_analysis: str
    lifecycle_impact: str
    risk_score: float
    on_time_rate: str
    cost_impact: str
    full_diff: str
    health_score: float
    modified_by: str
    logged_by: str
    version_history: List[VersionEntry]

# -----------------------------
# Diff Logic
# -----------------------------
def compute_diff(original: str, modified: str) -> str:
    original_lines = original.strip().splitlines()
    modified_lines = modified.strip().splitlines()
    diff = difflib.unified_diff(original_lines, modified_lines, lineterm='')
    return "\n".join(diff)

# -----------------------------
# LLM: openai
# -----------------------------
def get_llm():
    temperature = float(os.getenv("LLM_TEMPERATURE", 0.3))
    api_key = os.getenv("OPENAI_API_KEY")  # Use OpenAI key

    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable not set")

    return ChatOpenAI(
        model_name="gpt-3.5-turbo",  # Or "gpt-4" if preferred
        temperature=temperature,
        openai_api_key=api_key
    )

# -----------------------------
# Prompt and Chain
# -----------------------------
prompt = PromptTemplate(
    input_variables=["diff"],
    template="""
You are a contracts AI assistant.
Given the following unified diff between two versions of a government contract:

{diff}

Respond in JSON with these fields:
- modification_type: one of ['scope', 'funding', 'schedule']
- justification: a sentence explaining the change
- impact_analysis: a short paragraph describing the impact on contract lifecycle
- summary: concise description of what changed
- risk_score: percentage increase/decrease or qualitative value (e.g., '5%' or 'medium')
- on_time_rate: % of obligations likely on time
- cost_impact: estimated financial impact ($)
- lifecycle_impact: one of ['Improving', 'Neutral', 'Declining']
- health_score: float between 0–10
- modified_by: name of the person who modified it
- logged_by: name of the person who logged the change
- version_history: list of objects with fields: type, description, date, user
"""
)

# -----------------------------
# Analysis Execution
# -----------------------------
def analyze_diff_with_llm(diff: str) -> ModificationAnalysis:
    llm = get_llm()
    chain = LLMChain(llm=llm, prompt=prompt)

    try:
        result = chain.run({"diff": diff}).strip()

        # Clean result before parsing
        result = re.sub(r"(?s)^.*?(\{)", r"\1", result)  # remove leading non-JSON text
        result = re.sub(r"```.*?```", "", result, flags=re.DOTALL).strip()
        result = result.split("```")[0].strip()

        print("LLM raw output:", result)  # debug log

        if not result:
            raise ValueError("Empty response from LLM.")

        parsed = json.loads(result)
        return ModificationAnalysis(
            modification_type=parsed["modification_type"],
            justification=parsed["justification"],
            impact_analysis=parsed["impact_analysis"],
            summary=parsed["summary"],
            lifecycle_impact=parsed["lifecycle_impact"],
            risk_score=float(parsed["risk_score"].replace('%', '').replace('high', '10').replace('medium', '5').replace('low', '1')),
            on_time_rate=parsed["on_time_rate"],
            cost_impact=parsed["cost_impact"],
            full_diff=diff,
            health_score=float(parsed["health_score"]),
            modified_by=parsed["modified_by"],
            logged_by=parsed["logged_by"],
            version_history=[VersionEntry(**entry) for entry in parsed["version_history"]]
        )
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse JSON. Raw output: {result}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM analysis failed: {e}")

@router.post("/analyze_modification", response_model=ModificationAnalysis)
def analyze_modification(req: ModificationRequest):
    """
    Analyze contract modification and return impact assessment and version history.
    Sample Request:
    {
        "original_text": "Contract ends on June 30, 2024. Value is $1,000,000.",
        "modified_text": "Contract ends on August 31, 2024. Value is $1,075,000."
    }
    """
    diff = compute_diff(req.original_text, req.modified_text)
    result = analyze_diff_with_llm(diff)
    return result
