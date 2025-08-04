# Objective
To develop a cloud-native, AI-powered Contract Management Solution (CMS) that: 
. Automates contract intake, evaluation, compliance, and closeout 
. Enhances efficiency via intelligent agents and proactive alerts 
. Integrates with federal systems (FPDS, Home | SAM.gov ) 
. Provides real-time dashboards and actionable insights 
. Ensures full traceability and auditability of AI outputs and user interactions

# Task involved in building the AI model
 OCR pipeline for document parsing
 AI/ML Engine for Clause Matching and Summarization
 Clause Compliance BERT Validation
 Proposal AI Summary Extraction
 External API Integration with FPDS/SAM.gov
 API Layer Development with FastAPI
 Portfolio Report Charts & Export
 AI-Powered Contract Modification Diff
 New Contract Request Backend API
 Checklist Generation Logic + PDF Export
 Closeout Final Report Generator
 AI Draft Generator backend engine
 Third party clause extraction and risk scoring engine
 Redline AI Model and Cause Fallback
 AI Powered Renewal Strategy generation
 Admin Log Viewer & CSV Export
 Azure Deployment with Secure Blob, DB, and CI/CD$

# Tech Stack
Backend APIs : Python FastAPI
Libraries: Pandas, Langchain, Huggingface, openai, tessaract, spacy, jinja2, uvicorn, Sqlite, PDFkit,transformer

# getting started
To run locally, enter commands in the terminal 
    cd OCC_Backend
    uvicorn app:app --reload --host 127.0.0.1 --port 8000
  