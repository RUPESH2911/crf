import streamlit as st
import fitz  # PyMuPDF
import numpy as np
import easyocr
from transformers import pipeline
import time

# Cache PDF processing to avoid reprocessing on every interaction
@st.cache_data
def process_pdf(pdf_bytes):
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    pages = []
    for page in doc:
        pix = page.get_pixmap(dpi=300)
        img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
        if pix.n == 4:
            img = img[..., :3]
        pages.append(img)
    return pages

# Cache the summarizer model so it's loaded only once
@st.cache_resource
def get_summarizer():
    # Using MISTRAL AI model for summarization
    return pipeline("summarization", model="mistralai/Mistral-7B-v0.1", device=0)

def split_text(text, max_chars=2000):
    # Split text into larger chunks (fewer chunks) to reduce summarization calls
    return [text[i:i+max_chars] for i in range(0, len(text), max_chars)]

def main():
    st.title("GPU-Powered PDF OCR & Summarization")
    st.write("Upload a PDF file to process using your GPU.")

    uploaded_file = st.file_uploader("Choose a PDF file", type="pdf")
    
    if uploaded_file is not None:
        st.info("Processing PDF...")
        pages = process_pdf(uploaded_file.read())
        st.success(f"Converted PDF to {len(pages)} image(s).")
        
        st.info("Running OCR on pages (using GPU)...")
        reader = easyocr.Reader(['en'], gpu=True)
        extracted_text = ""
        for idx, page in enumerate(pages):
            page_text = reader.readtext(page, detail=0)
            extracted_text += " ".join(page_text) + "\n"
            st.write(f"OCR processed page {idx+1}")
        
        if extracted_text.strip() == "":
            st.warning("No text was extracted from the PDF.")
        else:
            # Display the extracted text before summarizing
            st.subheader("Extracted Text")
            st.write(extracted_text)
            
            st.info("Splitting and summarizing extracted text (using GPU)...")
            summarizer = get_summarizer()
            
            # Split the text into larger chunks to reduce overhead
            chunks = split_text(extracted_text, max_chars=2000)
            st.write(f"Text split into {len(chunks)} chunk(s).")
            
            # Process all chunks in batch mode to reduce overall time
            start_time = time.time()
            summaries = summarizer(chunks, max_length=100, min_length=50, do_sample=False)
            end_time = time.time()
            total_time = end_time - start_time

            # Combine the summaries; you may optionally summarize them further
            final_summary = " ".join([s['summary_text'] for s in summaries])
            st.subheader("Summary")
            st.write(final_summary)
            st.info(f"Total summarization time: {total_time:.2f} seconds.")

if __name__ == "__main__":
    main()
