import uuid, tempfile, json
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, Body
from fastapi.responses import FileResponse

from routers.clause_validation import ClauseValidation
from pathlib import Path

# Explicitly set your project root folder
BASE_DIR = Path(__file__).resolve()
while BASE_DIR.name != "OCC_Backend":
    if BASE_DIR.parent == BASE_DIR:
        raise RuntimeError("Could not find 'occ_backend' in path hierarchy.")
    BASE_DIR = BASE_DIR.parent

# Now set your paths
CLAUSE_IN   = BASE_DIR / "clause_output"
REGS_FILE   = BASE_DIR / "clause_compliance" / "far_dfars.txt"
OUTPUT_DIR  = BASE_DIR / "clause_output"  # reuse input folder

validator = ClauseValidation(
    clause_folder=str(CLAUSE_IN),
    regulation_path=str(REGS_FILE),
    output_folder=str(OUTPUT_DIR),
)

router = APIRouter(prefix="/Clause_Validation", tags=["Clause_Validation"])
# ───────────────────────────────────────────────


@router.post("/validate-batch")
def validate_batch():
    """
    Run ClauseValidation.process_clauses() on every JSON file currently
    in `data/clause_output` and return a list of generated filenames.
    """
    validator.process_clauses()

    validated_files = sorted(
        p.name for p in OUTPUT_DIR.glob("*_validated.json")
    )
    return {"validated_files": validated_files}


@router.post("/validate-single")
def validate_single(clauses: list[dict] = Body(..., example=[
        {"clause_id": 1, "text": "This Agreement may be terminated by either party…"},
        {"clause_id": 2, "text": "All payments shall be made within thirty (30) days…"}
    ])):
    """
    Accept a JSON list of clause objects **in the request body**,
    run validation entirely in memory, and return the result JSON.
    Does NOT touch disk.
    """
    if not clauses:
        raise HTTPException(400, "Empty clause list")

    # Fake a filename for helper functions that expect a name
    tmp_name = f"{uuid.uuid4().hex}.json"
    tmp_path = Path(tempfile.gettempdir()) / tmp_name
    tmp_path.write_text(json.dumps(clauses, indent=2), encoding="utf-8")

    # Point the validator at the temp file only
    local_validator = ClauseValidation(
        clause_folder=str(tmp_path.parent),
        regulation_path=str(REGS_FILE),
        output_folder=str(OUTPUT_DIR),
    )
    local_validator.process_clauses()

    out_file = tmp_path.with_name(tmp_path.stem + "_validated.json")
    result = json.loads(out_file.read_text(encoding="utf-8"))

    # Clean up
    tmp_path.unlink(missing_ok=True)
    out_file.unlink(missing_ok=True)

    return result


@router.post("/validate-upload")
async def validate_upload(file: UploadFile = File(...)):
    """
    Upload a single `.json` file containing clauses; the endpoint stores it
    under `clause_output`, runs validation, then streams the validated JSON
    back to the client as a downloadable file.
    """
    if not file.filename.endswith(".json"):
        raise HTTPException(415, "Only .json files are supported")

    dest = CLAUSE_IN / f"{uuid.uuid4().hex}_{file.filename}"
    dest.write_bytes(await file.read())

    # Process just this file
    local_validator = ClauseValidation(
        clause_folder=str(CLAUSE_IN),
        regulation_path=str(REGS_FILE),
        output_folder=str(OUTPUT_DIR),
    )
    local_validator.process_clauses()

    validated_path = dest.with_name(dest.stem + "_validated.json")
    if not validated_path.exists():
        raise HTTPException(500, "Validation failed")

    return FileResponse(validated_path, media_type="application/json",
                        filename=validated_path.name)