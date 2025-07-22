import re
import os
import json
import uuid
import datetime
from pathlib import Path
from transformers import pipeline
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
from langchain_community.llms import HuggingFacePipeline

# === TextProcessor ===
class TextProcessor:
    def __init__(self):
        pass

    def preprocess_text(self, text):
        # 1. Handle common encoding/OCR misinterpretations (often seen in OCR output)
        text = text.replace("ﬁ", "fi").replace("ﬀ", "ff").replace("—", "--").replace("–", "-")
        text = text.replace("“", "\"").replace("”", "\"").replace("‘", "'").replace("’", "'")
        text = text.replace("…", "...")
        text = text.replace("®", "").replace("©", "") # Remove common symbols if not needed

        # 2. Remove source tags like from OCR output
        text = re.sub(r"\\", "", text)

        # 3. Collapse multiple whitespace characters into single spaces
        text = re.sub(r"\s+", " ", text)
        text = re.sub(r"(\w)-\s*(\w)", r"\1\2", text)
        text = re.sub(
            r"(?:(Section|Clause|Article)?\s*)?(\d+(?:\.\d+)*)[\.\)]?\s*[:-]?\s*(.*)",
            r"\n\1 \2: \3\n",
            text,
            flags=re.IGNORECASE
        )
        # Further normalization for specific top-level section headers found in your contract example:
        text = text.replace("1. Pre-Award", "\n1. Pre-Award:\n")
        text = text.replace("2. Award", "\n2. Award:\n")
        text = text.replace("3. Post-Award", "\n3. Post-Award:\n")
        text = text.replace("4. Closeout", "\n4. Closeout:\n")
        text = re.sub(r"Proprietary", "", text, flags=re.IGNORECASE)
        text = re.sub(r"\n\s*\n+", "\n\n", text)
        return text.strip()


# === ClauseSegmenter ===
class ClauseSegmenter:
    def __init__(self):
        self.clause_heading_pattern = re.compile(
            r'^\s*((Section|Clause|Article)\s*)?(\d+(\.\d+)*|[IVXLCDM]+)[\.\)]?\s+(.+)', re.IGNORECASE
        )

    def segment_clauses(self, text, source_file=None):
        lines = text.split('\n')
        segments = []
        current_clause = None

        for line in lines:
            line = line.strip()
            if not line:
                continue

            match = self.clause_heading_pattern.match(line)
            if match:
                if current_clause:
                    segments.append(current_clause)

                clause_id = match.group(3)
                clause_title = match.group(5)

                current_clause = {
                    "clause_id": clause_id,
                    "title": clause_title.strip(),
                    "text": "",
                    "section_path": clause_id,
                    "source_file": source_file
                }
            else:
                if current_clause:
                    current_clause["text"] += " " + line
                else:
                    current_clause = {
                        "clause_id": "0",
                        "title": "Preamble",
                        "text": line,
                        "section_path": "0",
                        "source_file": source_file
                    }

        if current_clause:
            segments.append(current_clause)

        return segments


# === ClauseProcessor ===
class ClauseProcessor:
    def __init__(self, metadata_extractor=None):
        self.rule_patterns = {
            "Confidentiality": re.compile(r'\bconfidential|non[- ]disclosure|nda\b', re.I),
            "Termination": re.compile(r'\bterminate|termination\b', re.I),
            "Payment": re.compile(r'\bpayment|invoice|fee\b', re.I),
            "Governing Law": re.compile(r'\blaw|jurisdiction\b', re.I),
            "Indemnity": re.compile(r'\bindemnif(y|ication)|liability\b', re.I),
        }

        self.classifier = pipeline("text-classification", model="roberta-large-mnli", truncation=True)

        summarizer_pipe = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6", max_length=100)
        self.llm = HuggingFacePipeline(pipeline=summarizer_pipe)
        self.summarizer = summarizer_pipe

        self.summary_prompt = PromptTemplate(
            input_variables=["text"],
            template="Summarize this clause in one sentence: {text}"
        )
        self.summary_chain = LLMChain(llm=self.llm, prompt=self.summary_prompt)

        self.validation_prompt = PromptTemplate(
            input_variables=["clause_text"],
            template="""You are a contract compliance assistant. For the following clause:
\"\"\"{clause_text}\"\"\"

Respond with:
- Validation Status (Compliant / Needs Revision)
- Risk Level (Low / Medium / High)
- Reason (1-2 lines)
"""
        )
        self.validation_chain = LLMChain(llm=self.llm, prompt=self.validation_prompt)

        self.metadata_extractor = metadata_extractor

    def rule_based_classify(self, text):
        for label, pattern in self.rule_patterns.items():
            if pattern.search(text):
                return label
        return "Uncategorized"

    def transformer_classify(self, text):
        return self.classifier(text[:512])[0]["label"]
    

    def summarize_clause(self, text):
        try:
            word_count = len(text.split())
            # Don't summarize short clauses
            if len(text) < 100 or word_count < 25:
                return text.strip()

            # Dynamically adjust max_length based on input
            max_len = min(40, int(word_count * 0.6))  # ~60% of input
            max_len = max(20, max_len)  # Ensure it's not too small

            return self.summarizer(text[:512], max_length=max_len, min_length=20, do_sample=False)[0]["summary_text"]

        except Exception as e:
            print(f"Summarization failed: {e}")
            return "Summary not available"

    def validate_clause(self, text):
        return self.validation_chain.run(clause_text=text)

    def enrich_clause(self, clause_dict, metadata=None):
        text = clause_dict["text"]
        enriched = {
            "clause_id": clause_dict.get("clause_id"),
            "title": clause_dict.get("title"),
            "text": text.strip(),
            "source_file": clause_dict.get("source_file"),
            "section_path": clause_dict.get("section_path"),
            "rule_based_type": self.rule_based_classify(text),
            "transformer_type": self.transformer_classify(text),
            "summary": self.summarize_clause(text),
            "validation": self.validate_clause(text),
            "trace": {
                "trace_id": str(uuid.uuid4()),
                "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
            },
            "status": "processed"
        }

        if metadata:
            enriched.update({
                "contract_number": metadata.get("contract_number"),
                "contract_type": metadata.get("contract_type"),
                "vendor_name": metadata.get("vendor_name"),
                "contract_value": metadata.get("contract_value"),
                "threshold": metadata.get("threshold"),
                "start_date": metadata.get("start_date"),
                "end_date": metadata.get("end_date"),
            })

        return enriched

    def process_document_with_metadata(self, full_text, clauses, source_file=None):
        metadata = self.metadata_extractor.extract_metadata(full_text) if self.metadata_extractor else {}
        enriched_clauses = []
        for clause in clauses:
            clause["source_file"] = source_file
            enriched = self.enrich_clause(clause, metadata=metadata)
            enriched_clauses.append(enriched)
        return enriched_clauses


# === Main Usage Example ===
if __name__ == "__main__":
    from metadata_extraction import ContractMetadataExtractor  # ← you must implement or import

    BASE_DIR = Path(__file__).resolve().parent
    input_folder = os.path.join(BASE_DIR, "ocr_output")
    output_folder = os.path.join(BASE_DIR, "clause_output")
    os.makedirs(output_folder, exist_ok=True)

    textpreprocessor = TextProcessor()
    segmenter = ClauseSegmenter()
    extractor = ContractMetadataExtractor()
    processor = ClauseProcessor(metadata_extractor=extractor)

    for filename in os.listdir(input_folder):
        if filename.endswith(".txt"):
            filepath = os.path.join(input_folder, filename)
            with open(filepath, "r", encoding="utf-8") as f:
                text = f.read()

            print(f"Processing file: {filename}")

            cleaned_text = textpreprocessor.preprocess_text(text) # Call the TextProcessor
            clauses = segmenter.segment_clauses(cleaned_text, source_file=filename) # Use cleaned_text here
            enriched_clauses = processor.process_document_with_metadata(cleaned_text, clauses, source_file=filename)

            output_path = os.path.join(output_folder, filename.replace(".txt", "_enriched.json"))
            with open(output_path, "w", encoding="utf-8") as out:
                json.dump(enriched_clauses, out, indent=2)
                print(f"Saved enriched output to {output_path}")