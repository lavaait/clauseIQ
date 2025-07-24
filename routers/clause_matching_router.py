from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Dict, Any
import datetime, uuid

from routers.clause_matching import TextProcessor, ClauseSegmenter, ClauseProcessor
from routers.metadata_extraction import ContractMetadataExtractor

router = APIRouter()

# Initialize components
textpreprocessor = TextProcessor()
segmenter = ClauseSegmenter()
metadata_extractor = ContractMetadataExtractor()
processor = ClauseProcessor(metadata_extractor=metadata_extractor)

# ---------- helpers ----------
def _enrich_output(base: Dict[str, Any], metadata: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Ensure the response dict includes all expected fields in consistent order.
    """
    enriched = {
        "clause_id":        base.get("clause_id"),
        "title":            base.get("title"),
        "text":             base.get("text", "").strip(),
        "source_file":      base.get("source_file"),
        "section_path":     base.get("section_path"),
        "rule_based_type":  base.get("rule_based_type"),
        "transformer_type": base.get("transformer_type"),
        "summary":          base.get("summary"),
        "validation":       base.get("validation"),
        "trace":            base.get("trace"),
        "status":           base.get("status", "processed"),
    }

    if metadata:
        enriched.update({
            "contract_number": metadata.get("contract_number"),
            "contract_type":   metadata.get("contract_type"),
            "vendor_name":     metadata.get("vendor_name"),
            "contract_value":  metadata.get("contract_value"),
            "threshold":       metadata.get("threshold"),
            "start_date":      metadata.get("start_date"),
            "end_date":        metadata.get("end_date"),
        })

    return enriched

# ---------- routes ----------
@router.post("/clause/match", summary="Upload a .txt contract and get enriched clauses")
async def process_contract(file: UploadFile = File(...)) -> Dict[str, List[Dict[str, Any]]]:
    if not file.filename.endswith(".txt"):
        raise HTTPException(status_code=400, detail="Only .txt files are supported")

    try:
        text = (await file.read()).decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File must be UTF-8 encoded")

    cleaned = textpreprocessor.preprocess_text(text)
    raw_clauses = segmenter.segment_clauses(cleaned, source_file=file.filename)

    # Extract metadata
    metadata = metadata_extractor.extract_metadata(cleaned)

    # Enrich clauses
    enriched_clauses = []
    for clause in raw_clauses:
        enriched = processor.enrich_clause(clause_dict=clause, metadata=metadata)
        enriched_clauses.append(_enrich_output(enriched, metadata=metadata))

    return {"clauses": enriched_clauses}


@router.post("/clause/classify", summary="Classify, summarise & validate a single clause")
async def classify_clause(clause_text: str) -> Dict[str, Any]:
    """
    Return the full enriched-clause schema (same fields as /clause/match) for a single clause.
    No metadata is included since only a clause is provided.
    """
    base_dict = {
        "clause_id":        "N/A",
        "title":            "Provided Clause",
        "text":             clause_text.strip(),
        "source_file":      None,
        "section_path":     None,
        "rule_based_type":  processor.rule_based_classify(clause_text),
        "transformer_type": processor.transformer_classify(clause_text),
        "summary":          processor.summarize_clause(clause_text),
        "validation":       processor.validate_clause(clause_text),
        "trace": {
            "trace_id": str(uuid.uuid4()),
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
        },
        "status":   "processed",
    }

    return _enrich_output(base_dict, metadata=None)