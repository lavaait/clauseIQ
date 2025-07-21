from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import shutil, os, sqlite3
from sqlite_db import init_db

app = FastAPI()

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "new_contract_uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

init_db()

@app.post("/contracts/submit")
async def submit_contract(
    title: str = Form(...),
    agency: str = Form(...),
    contract_type: str = Form(...),
    value: float = Form(...),
    file: UploadFile = File(...)
):
    file_location = os.path.join(UPLOAD_FOLDER, file.filename)

    # Save file to uploads folder
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Save metadata to database
    with sqlite3.connect("contracts.db") as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO contracts (title, agency, contract_type, value, file_path)
            VALUES (?, ?, ?, ?, ?)
        """, (title, agency, contract_type, value, file_location))
        conn.commit()

    return {"message": "Contract submitted successfully"}