from fastapi import APIRouter, UploadFile, File, Form
import shutil, os, sqlite3
from sqlite_db import init_db

router = APIRouter()

UPLOAD_FOLDER = "new_contract_uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

init_db()

@router.post("/contracts/submit")
async def submit_contract(
    title: str = Form(...),
    agency: str = Form(...),
    contract_type: str = Form(...),
    value: float = Form(...),
    file: UploadFile = File(...)
):
    file_location = os.path.join(UPLOAD_FOLDER, file.filename)

    # Save uploaded file
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Insert metadata into SQLite
    with sqlite3.connect("contracts.db") as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO contracts (title, agency, contract_type, value, file_path)
            VALUES (?, ?, ?, ?, ?)
        """, (title, agency, contract_type, value, file_location))
        conn.commit()

    return {"message": "Contract submitted successfully"}