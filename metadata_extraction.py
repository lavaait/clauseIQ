import re
import os
import json
import spacy
from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline

class ContractMetadataExtractor:
    def __init__(self, spacy_model="en_core_web_sm", hf_model="dslim/bert-base-NER"):
        self.nlp = spacy.load(spacy_model)
        self.ner_pipeline = pipeline("ner", model=hf_model, tokenizer=hf_model, aggregation_strategy="simple")

    def clean_text(self, text):
        # Normalize spacing and remove artifacts
        text = re.sub(r"\s+", " ", text).strip()
        return text

    def extract_dates(self, text):
        # Match common date formats
        date_pattern = r"\b(?:\d{1,2}[-/th\s\.]?)?(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[-/\s]?\d{2,4}\b|\b\d{4}[-/]\d{2}[-/]\d{2}\b"
        return re.findall(date_pattern, text, flags=re.IGNORECASE)

    def extract_money(self, text):
        money_pattern = r"\$\s?\d{1,3}(?:,\d{3})*(?:\.\d{2})?"
        return re.findall(money_pattern, text)

    def extract_keywords(self, text):
        # Simple contract type detection
        contract_keywords = ["service agreement", "nda", "purchase order", "mou", "sow", "contract"]
        found = [k.title() for k in contract_keywords if k in text.lower()]
        return found[0] if found else None

    def extract_entities(self, text):
        doc = self.nlp(text)
        spacy_entities = {ent.label_: ent.text for ent in doc.ents if ent.label_ in ["ORG", "DATE", "PERSON", "MONEY"]}

        hf_entities = self.ner_pipeline(text)
        hf_entity_map = {}
        for ent in hf_entities:
            label = ent["entity_group"]
            if label in ["ORG", "PER", "DATE", "MISC"]:
                hf_entity_map[label] = ent["word"]

        return {**spacy_entities, **hf_entity_map}
    
    def extract_contract_number(self, text):
        # This pattern captures full IDs like CN-2023-001, AGMT123456, CON2021/55
        contract_number_pattern = r"\b(?:CN|CTR|AGMT|CON)[-/ ]?\d{3,}(?:[-/]\d+)?\b"
        matches = re.findall(contract_number_pattern, text, flags=re.IGNORECASE)
        return matches[0] if matches else None
    
    def extract_metadata(self, text):
        text = self.clean_text(text)
        entities = self.extract_entities(text)
        dates = self.extract_dates(text)
        money_values = self.extract_money(text)

        metadata = {
            "contract_type": self.extract_keywords(text),
            "contract_number":self.extract_contract_number(text),
            "vendor_name": entities.get("ORG") or entities.get("PER"),
            "contract_value": money_values[0] if money_values else None,
            "threshold": money_values[1] if len(money_values) > 1 else None,
            "start_date": dates[0] if dates else None,
            "end_date": dates[1] if len(dates) > 1 else None,
        }
        return metadata
    

if __name__ == "__main__":
    extractor = ContractMetadataExtractor()

    ocr_folder = "ocr_output"
    txt_files = [f for f in os.listdir(ocr_folder) if f.endswith("_ocr.txt")]

    metadata_dict = {}  # ✅ Step 1: Initialize dictionary

    if not txt_files:
        print("⚠️ No OCR output files found in 'ocr_output' folder.")
    else:
        for filename in txt_files:
            file_path = os.path.join(ocr_folder, filename)
            print(f"\n📂 Processing: {filename}")

            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read()

            metadata = extractor.extract_metadata(text)

            print("📊 Extracted Contract Metadata:")
            for key, value in metadata.items():
                print(f"  {key}: {value if value else 'Not found'}")

            base_name = os.path.splitext(filename)[0]
            metadata_dict[base_name] = metadata  # ✅ Step 2: Store in dictionary

        # ✅ Step 3: Save full dictionary to JSON file
        output_file = "metadata_summary.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(metadata_dict, f, indent=2)

        print(f"\n✅ All metadata saved to: {output_file}")
