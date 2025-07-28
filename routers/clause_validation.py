import os, json, uuid, datetime, re
from typing import List, Dict, Tuple
from pathlib import Path

from transformers import pipeline, AutoTokenizer
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import TokenTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.vectorstores import Chroma
from langchain_huggingface import HuggingFacePipeline
from langchain.chains import RetrievalQA
from langchain_core.runnables import RunnableSequence
import logging
logging.getLogger("langchain").setLevel(logging.ERROR)


EXPECTED_CLAUSES = [
    "Termination",
    "Payment",
    "Governing Law",
    "Confidentiality",
    "Indemnity",
]
MAX_TOKENS_QA = 512  # truncate for QA confidence
# ──────────────────────────────────────────────────────────────────


class ClauseValidation:
    def __init__(self, clause_folder: str, regulation_path:str, output_folder: str):
        self.clause_folder = clause_folder
        self.regulation_path = regulation_path
        self.output_folder = output_folder
        os.makedirs(output_folder, exist_ok=True)

        # 1) Text-generation LLM (Flan-T5) for RetrievalQA & risk prompts
        gen_pipe = pipeline("text2text-generation",
                            model="google/flan-t5-base",
                            max_length=256, device_map="auto")
        self.llm = HuggingFacePipeline(pipeline=gen_pipe)

        # 2) Confidence QA pipeline + tokenizer
        self.qa_conf_pipe = pipeline("question-answering",
                                     model="deepset/roberta-base-squad2",
                                     device_map="auto")
        self.qa_tokenizer = AutoTokenizer.from_pretrained("deepset/roberta-base-squad2")

        # 3) Build semantic retriever over FAR/DFARS
        loader = TextLoader(self.regulation_path, encoding="utf-8")
        docs = loader.load()

        splitter = TokenTextSplitter(
                    chunk_size=500,
                    chunk_overlap=50)
        doc_chunks = splitter.split_documents(docs)

        embedder = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        # chroma_dir = os.path.join(self.output_folder, "chroma_db")
        vectorstore = Chroma.from_documents(doc_chunks, embedder)
        retriever = vectorstore.as_retriever(search_type="similarity", k=3)

        self.qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            retriever=retriever,
            chain_type="stuff"
        )

    # ────────────── Utility: truncate long clause for QA score ─────────────
    def _truncate_for_qa(self, text: str) -> str:
        tokens = self.qa_tokenizer.encode(text, truncation=True, max_length=MAX_TOKENS_QA)
        return self.qa_tokenizer.decode(tokens, skip_special_tokens=True)

    # ─────────────── Compliance + confidence per clause ────────────────
    def evaluate_clause(self, clause: str) -> Dict[str, str]:
        query = (
            "Is the following clause compliant with FAR or DFARS? "
            "Answer Compliant or Non-Compliant and cite the section.\n\n"
            f"Clause: {clause}"
        )
        answer = self.qa_chain.invoke({"query": query})["result"]

        qa_result = self.qa_conf_pipe({
            "context": self._truncate_for_qa(clause),
            "question": "Which FAR or DFARS section is referenced?"
        })
        confidence = round(qa_result["score"], 3)

        return {"answer": answer, "confidence": confidence}

    # ────────────────────── Risk rating prompt ───────────────────────────
    def detect_risk(self, clause: str) -> Dict[str, str]:
        risk_prompt = (
            "Rate the following clause's risk level for a US government contract "
            "(Low, Medium, or High) and give one-sentence rationale.\n\n"
            f"Clause:\n{clause}"
        )
        risk_answer = self.llm.invoke(risk_prompt)
        return {"risk": risk_answer, "confidence": "N/A"}

    # ────────────── Simple rule classifier for clause type ───────────────
    @staticmethod
    def _classify_type(text: str) -> str:
        patterns = {
            "Termination": r"\bterminate|termination\b",
            "Payment": r"\bpayment|invoice|fee\b",
            "Governing Law": r"\bgoverning law|jurisdiction\b",
            "Confidentiality": r"\bconfidential|non[- ]disclosure\b",
            "Indemnity": r"\bindemnif(y|ication)|liability\b",
        }
        for label, pat in patterns.items():
            if re.search(pat, text, flags=re.I):
                return label
        return "Uncategorized"

    @staticmethod
    def _missing_misaligned(found: List[str], comp_map: Dict[str, str]) -> Tuple[List[str], List[str]]:
        missing = [c for c in EXPECTED_CLAUSES if c not in found]
        misaligned = [
            t for t in found
            if t in EXPECTED_CLAUSES and "non-compliant" in comp_map.get(t, "").lower()
        ]
        return missing, misaligned

    # ───────────────── Main batch driver ─────────────────────────
    def process_clauses(self):
        for fname in os.listdir(self.clause_folder):
            if not fname.endswith(".json"):
                continue

            with open(os.path.join(self.clause_folder, fname), encoding="utf-8") as f:
                clauses = json.load(f)

            if not isinstance(clauses, list):
                print(f" {fname} skipped (not list).")
                continue

            found_types, comp_map = [], {}
            outputs = []

            for cl in clauses:
                clause_txt = cl.get("text") or cl.get("clause_text", "")
                if not clause_txt:
                    continue

                ctype = self._classify_type(clause_txt)
                found_types.append(ctype)

                comp = self.evaluate_clause(clause_txt)
                comp_map[ctype] = comp["answer"]

                risk = self.detect_risk(clause_txt)

                closeout = (
                    "Passed"
                    if ("compliant" in comp["answer"].lower() and "low" in risk["risk"].lower())
                    else "Review Required"
                )

                outputs.append(
                    {
                        "clause_id": cl.get("clause_id"),
                        "title": ctype,
                        "clause_text": clause_txt,
                        "compliance_summary": comp["answer"],
                        "compliance_confidence": comp["confidence"],
                        "risk_assessment": risk["risk"],
                        "risk_confidence": risk["confidence"],
                        "closeout_status": closeout,
                        "trace": {
                            "trace_id": str(uuid.uuid4()),
                            "timestamp": datetime.datetime.now(
                                datetime.timezone.utc
                            ).isoformat(),
                        },
                    }
                )

            # file-level missing / mis-aligned
            missing, misaligned = self._missing_misaligned(found_types, comp_map)
            for o in outputs:
                o["missing_clauses"] = missing
                o["misaligned_clauses"] = misaligned

            out_path = os.path.join(
                self.output_folder, fname.replace(".json", "_validated.json")
            )
            with open(out_path, "w", encoding="utf-8") as out_f:
                json.dump(outputs, out_f, indent=2)
            print(f" {fname} → {out_path}")


if __name__ == "__main__":
    BASE_DIR = Path(__file__).resolve().parent
    clause_folder = BASE_DIR / "clause_output"
    regulation_path = BASE_DIR / "clause_compliance" / "far_dfars.txt"
    output_folder = BASE_DIR / "chroma_db"

    validator = ClauseValidation(
    clause_folder=str(clause_folder),
    regulation_path=str(regulation_path),
    output_folder=str(output_folder),
    )
    validator.process_clauses()