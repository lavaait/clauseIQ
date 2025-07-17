import os
import cv2
import pytesseract
import numpy as np
from pdf2image import convert_from_path
from PIL import Image

class DocumentOCR:
    def __init__(self, tesseract_path=None, poppler_path=None, output_dir="ocr_output"):
        if tesseract_path:
            pytesseract.pytesseract.tesseract_cmd = tesseract_path
        self.poppler_path = poppler_path
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def _preprocess_image(self, image):
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)
        return thresh

    def _ocr_image(self, image):
        return pytesseract.image_to_string(image)

    def read_image_file(self, image_path):
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Unable to read image: {image_path}")
        preprocessed = self._preprocess_image(image)
        return self._ocr_image(preprocessed)

    def read_pdf_file(self, pdf_path, dpi=300):
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF not found: {pdf_path}")

        images = convert_from_path(pdf_path, dpi=dpi, poppler_path=self.poppler_path)
        full_text = []

        for idx, img in enumerate(images):
            print(f"🔍 Processing PDF page {idx+1}")
            cv_image = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
            preprocessed = self._preprocess_image(cv_image)
            page_text = self._ocr_image(preprocessed)
            print(f"\n📄 Text from page {idx+1}:\n{page_text.strip()}")
            full_text.append(page_text.strip())

        return "\n\n".join(full_text)

    def extract_from_path(self, path):
        ext = os.path.splitext(path)[1].lower()
        base_filename = os.path.splitext(os.path.basename(path))[0]
        output_file = os.path.join(self.output_dir, f"{base_filename}_ocr.txt")

        if ext in [".jpg", ".jpeg", ".png", ".bmp", ".tiff"]:
            text = self.read_image_file(path)
        elif ext == ".pdf":
            text = self.read_pdf_file(path)
        else:
            raise ValueError(f"Unsupported file type: {ext}")

        # Save to text file
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(text)

        print(f"\n✅ OCR text saved to: {output_file}")
        print(f"\n📄 Final OCR Text:\n{text.strip()}")
        return text
        
if __name__ == "__main__":
    ocr = DocumentOCR(
        tesseract_path = r"C:\Users\lavan\AppData\Local\Programs\Tesseract-OCR\tesseract.exe",
        poppler_path = r"C:\Program Files\poppler-24.07.0\Library\bin" 
    )
    file_path = r"E:\clauseIQ\OCC_Backend\data\sample_software_fds_contract.pdf"  # Can also be .jpg, .png, etc.
    ocr.extract_from_path(file_path)
