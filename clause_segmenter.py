import os
import json
import re

class ClauseSegmenter:
    def __init__(self):
        # Regex patterns for numbered clauses/sections
        self.clause_heading_pattern = re.compile(
            r'^\s*((Section|Clause|Article)?\s*(\d+(\.\d+)*|[IVXLCDM]+))[\.\)]?\s+(.+)', re.IGNORECASE
        )

    def segment_clauses(self, text):
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
                    "id": clause_id,
                    "title": clause_title.strip(),
                    "text": ""
                }
            else:
                if current_clause:
                    current_clause["text"] += " " + line
                else:
                    current_clause = {
                        "id": "0",
                        "title": "Preamble",
                        "text": line
                    }

        if current_clause:
            segments.append(current_clause)

        return segments


if __name__ == "__main__":
    segmenter = ClauseSegmenter()
    ocr_folder = "ocr_output"
    clause_data = {}

    for filename in os.listdir(ocr_folder):
        if filename.endswith("_ocr.txt"):
            path = os.path.join(ocr_folder, filename)
            with open(path, "r", encoding="utf-8") as f:
                text = f.read()

            print(f"\n📂 Segmenting clauses in: {filename}")
            clauses = segmenter.segment_clauses(text)
            base_name = os.path.splitext(filename)[0]
            clause_data[base_name] = clauses

            # Preview first 3 clauses
            for clause in clauses[:3]:
                print(f"\n🔹 Clause {clause['id']}: {clause['title']}")
                print(f"{clause['text'][:200]}...")

    # Save all clause results to a JSON file
    output_file = "clause_segments.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(clause_data, f, indent=2)

    print(f"\n✅ All clause segments saved to {output_file}")