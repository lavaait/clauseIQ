from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import shutil, uuid, os

from routers.ocr_pipeline import DocumentOCR   # <-- your class file

# --- single, long-lived OCR helper ------------------------
ocr = DocumentOCR(
    tesseract_path=r"C:\Users\lavan\AppData\Local\Programs\Tesseract-OCR\tesseract.exe",
    poppler_path=r"C:\Program Files\poppler-24.07.0\Library\bin",
    output_dir="ocr_output",
)

router = APIRouter(prefix="/OCR", tags=["OCR"])

ALLOWED_EXTS = {".pdf", ".jpg", ".jpeg", ".png", ".bmp", ".tiff"}
TMP_UPLOADS   = Path("data")
TMP_UPLOADS.mkdir(exist_ok=True)
# ----------------------------------------------------------

@router.post("/extract")
async def extract(file: UploadFile = File(...)):
    """
    Upload a file and return its OCR text immediately.
    Saves both the original file and the OCR txt to disk.
    """
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTS:
        raise HTTPException(status_code=415, detail="Unsupported file type")

    # --- store upload with a unique name so we don't clash  ---
    safe_name = f"{uuid.uuid4().hex}{ext}"
    upload_path = TMP_UPLOADS / safe_name
    with upload_path.open("wb") as buf:
        shutil.copyfileobj(file.file, buf)

    # --- run OCR (this also writes the .txt into ocr_output) ---
    text = ocr.extract_from_path(str(upload_path))

    return {
        "original_filename": file.filename,
        "stored_basename":   upload_path.stem,
        "ocr_text": text,
    }


@router.get("/{basename}")
def get_text(basename: str):
    """
    Return the OCR text that was previously saved for *basename*.
    The client should pass the `stored_basename` returned by /extract.
    """
    txt_path = Path(ocr.output_dir) / f"{basename}_ocr.txt"
    if not txt_path.exists():
        raise HTTPException(status_code=404, detail="OCR result not found")

    return txt_path.read_text(encoding="utf-8")


@router.get("")
def list_processed():
    """
    List all successfully processed files that have a saved OCR txt.
    """
    return sorted(p.stem.replace("_ocr", "")
                  for p in Path(ocr.output_dir).glob("*_ocr.txt"))