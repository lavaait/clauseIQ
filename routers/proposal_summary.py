from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import fitz  # PyMuPDF - import name is 'fitz'
from pdfminer.high_level import extract_text
from io import BytesIO
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains.summarize import load_summarize_chain
from langchain_community.llms import HuggingFacePipeline
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
import logging
import os

logging.basicConfig(level=logging.INFO)
router = APIRouter()

@router.get("/")
def root():
    return {"message": "Server is running"}

# # -------- CORS (consider using env var for production) ------------------------
# router.add_middleware(
#     CORSMiddleware,
#     allow_origins=os.getenv("CORS_ALLOW_ORIGINS", "*").split(","),
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# -------- Summarizer model ----------------------------------------------------
MODEL_NAME = os.getenv("HF_SUM_MODEL", "t5-small")  # override via env
try:
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)
    summarizer = pipeline(
        "summarization",
        model=model,
        tokenizer=tokenizer,
        max_length=150,
        min_length=30,
        do_sample=False,
        truncation=True,
        device=0 if os.getenv("CUDA_VISIBLE_DEVICES") else -1,
    )
    llm = HuggingFacePipeline(pipeline=summarizer)
    logging.info("Loaded summarizer model '%s'", MODEL_NAME)
except Exception as exc:
    logging.exception("Failed to load HuggingFace model")
    llm = None

# ------------------------------------------------------------------------------
@router.post("/upload-and-summarize/", summary="Upload a PDF and get its summary")
async def upload_and_summarize_proposal(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(400, detail="Only PDF files are allowed.")

    if llm is None:
        raise HTTPException(500, detail="Language model not available.")

    try:
        pdf_bytes: bytes = await file.read()

        # -------- Extract text -------------------------------------------------
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        full_text = "\n".join(page.get_text() for page in doc)
        doc.close()

        if not full_text.strip():
            raise HTTPException(400, detail="Could not extract text from PDF.")

        # -------- Chunk & summarize -------------------------------------------
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=600,      # keep < model context
            chunk_overlap=100,
            length_function=len,
        )
        docs = splitter.create_documents([full_text])

        chain = load_summarize_chain(llm, chain_type="map_reduce")
        summary = chain.run(docs)

        return JSONResponse(
            status_code=200,
            content={"filename": file.filename, "summary": summary},
        )

    except HTTPException:
        raise  # re-throw FastAPI errors untouched
    except Exception as exc:
        logging.exception("Error during summarization")
        raise HTTPException(500, detail=f"Unexpected error: {exc}")

# To run the FastAPI app:
# Navigate to the 'backend' directory in your terminal and run:
# uvicorn main:app --reload
