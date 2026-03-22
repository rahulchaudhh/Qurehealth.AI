"""
rag_engine.py — Phase 1 RAG Engine for Qurehealth.AI
======================================================
Loads all PDFs from /data/pdfs, chunks them,
embeds using Sentence Transformers, stores in FAISS,
and retrieves relevant chunks for a user query.

Called by chatController.js via python-shell
"""

import sys
import json
import os
import numpy as np
from pathlib import Path

# ── Graceful import error messages ──
try:
    from pypdf import PdfReader
except ImportError:
    print(json.dumps({"error": "pypdf not installed. Run: pip install pypdf"}))
    sys.exit(1)

try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    print(json.dumps({"error": "sentence-transformers not installed. Run: pip install sentence-transformers"}))
    sys.exit(1)

try:
    import faiss
except ImportError:
    print(json.dumps({"error": "faiss not installed. Run: pip install faiss-cpu"}))
    sys.exit(1)


# ─────────────────────────────────────────────
# Paths
# ─────────────────────────────────────────────
BASE_DIR   = Path(__file__).resolve().parent.parent          # backend/
PDF_FOLDER = BASE_DIR / "data" / "pdfs"
INDEX_PATH = BASE_DIR / "rag" / "faiss.index"
CHUNKS_PATH= BASE_DIR / "rag" / "chunks.json"


# ─────────────────────────────────────────────
# Embedding model (downloads ~80MB first time)
# all-MiniLM-L6-v2 → fast, accurate, free
# ─────────────────────────────────────────────
MODEL_NAME = "all-MiniLM-L6-v2"


# ─────────────────────────────────────────────
# RAGEngine class
# ─────────────────────────────────────────────
class RAGEngine:
    def __init__(self):
        self.chunks = []
        self.index  = None
        self.model  = None

    # ── Load embedding model ──
    def _load_model(self):
        if self.model is None:
            self.model = SentenceTransformer(MODEL_NAME)
        return self.model

    # ── Extract text from a single PDF ──
    def _extract_pdf_text(self, pdf_path: Path) -> str:
        try:
            reader = PdfReader(str(pdf_path))
            text = ""
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            return text.strip()
        except Exception as e:
            return ""

    # ── Split text into overlapping chunks ──
    def _chunk_text(self, text: str, chunk_size=500, overlap=50) -> list:
        chunks = []
        start = 0
        while start < len(text):
            end   = min(start + chunk_size, len(text))
            chunk = text[start:end].strip()
            if len(chunk) > 60:           # skip tiny fragments
                chunks.append(chunk)
            start += chunk_size - overlap
        return chunks

    # ── Build index from PDFs ──
    def build(self):
        if not PDF_FOLDER.exists():
            PDF_FOLDER.mkdir(parents=True)
            return {"status": "no_pdfs", "message": "PDF folder created. Add PDFs to backend/data/pdfs/"}

        pdf_files = list(PDF_FOLDER.glob("*.pdf"))
        if not pdf_files:
            return {"status": "no_pdfs", "message": "No PDFs found in backend/data/pdfs/"}

        all_chunks = []
        for pdf in pdf_files:
            text   = self._extract_pdf_text(pdf)
            chunks = self._chunk_text(text)
            all_chunks.extend(chunks)

        if not all_chunks:
            return {"status": "empty", "message": "PDFs found but could not extract text"}

        # Create embeddings
        model = self._load_model()
        embeddings = model.encode(all_chunks, show_progress_bar=False)
        embeddings = np.array(embeddings).astype("float32")

        # Build FAISS index
        dim   = embeddings.shape[1]
        index = faiss.IndexFlatL2(dim)
        index.add(embeddings)

        # Persist index + chunks
        faiss.write_index(index, str(INDEX_PATH))
        with open(CHUNKS_PATH, "w", encoding="utf-8") as f:
            json.dump(all_chunks, f, ensure_ascii=False)

        self.index  = index
        self.chunks = all_chunks

        return {
            "status":  "ok",
            "pdf_count": len(pdf_files),
            "chunk_count": len(all_chunks),
        }

    # ── Load existing index from disk ──
    def load(self):
        if INDEX_PATH.exists() and CHUNKS_PATH.exists():
            self.index = faiss.read_index(str(INDEX_PATH))
            with open(CHUNKS_PATH, "r", encoding="utf-8") as f:
                self.chunks = json.load(f)
            self.model = self._load_model()
            return True
        return False

    # ── Retrieve top-k relevant chunks for a query ──
    def retrieve(self, query: str, top_k=3) -> list:
        if not self.index or not self.chunks:
            return []

        query_vec = self.model.encode([query])
        query_vec = np.array(query_vec).astype("float32")

        distances, indices = self.index.search(query_vec, top_k)
        results = []
        for i, idx in enumerate(indices[0]):
            if idx < len(self.chunks):
                results.append({
                    "text":  self.chunks[idx],
                    "score": float(distances[0][i])
                })
        return results


# ─────────────────────────────────────────────
# CLI entry point — called by Node.js
# Usage:
#   python rag_engine.py build
#   python rag_engine.py query '{"q":"what are malaria symptoms?"}'
# ─────────────────────────────────────────────
if __name__ == "__main__":
    engine = RAGEngine()

    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python rag_engine.py build | query <json>"}))
        sys.exit(1)

    cmd = sys.argv[1]

    # ── BUILD: index all PDFs ──
    if cmd == "build":
        result = engine.build()
        print(json.dumps(result))

    # ── QUERY: retrieve relevant chunks ──
    elif cmd == "query":
        if len(sys.argv) < 3:
            print(json.dumps({"error": "Provide query JSON as 3rd argument"}))
            sys.exit(1)

        payload = json.loads(sys.argv[2])
        query   = payload.get("q", "")

        # Try loading existing index first
        loaded = engine.load()
        if not loaded:
            # Auto-build if no index yet
            build_result = engine.build()
            if build_result.get("status") != "ok":
                print(json.dumps({"chunks": [], "fallback": True, "reason": build_result.get("message", "No PDF data")}))
                sys.exit(0)

        chunks = engine.retrieve(query, top_k=3)
        print(json.dumps({"chunks": chunks, "fallback": False}))

    else:
        print(json.dumps({"error": f"Unknown command: {cmd}"}))
        sys.exit(1)
