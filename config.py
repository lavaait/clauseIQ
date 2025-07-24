# config.py
from dotenv import load_dotenv
from pathlib import Path
import os

# Load from .env file
load_dotenv()

# Access env vars
DB_PATH = Path(os.getenv("DB_PATH", "contracts.db"))
UPLOAD_FOLDER = Path(os.getenv("UPLOAD_FOLDER", "./new_contract_uploads"))
CLAUSE_FILE =Path(os.getenv("CLAUSE_FILE","./clause_output/Contract_2_ocr_enriched_validated.json"))

# Ensure folders exist
DB_PATH.parent.mkdir(parents=True, exist_ok=True)
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)