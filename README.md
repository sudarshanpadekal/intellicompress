# IntelliCompress Visualization Platform

A full-stack web app that visualizes and compares compression algorithms:
- **Huffman Coding** (with Huffman tree + bit visualization)
- **RLE** (Run-Length Encoding)
- **LZW** (Lempel–Ziv–Welch)

Frontend is **React (Vite)**.
Backend is **Flask**.

---

## Prerequisites

- Python 3.x
- Node.js + npm

---

## Run locally

### 1) Start the Flask backend
From the repo root (`c:/Users/Sudarshan P/Desktop/daa_final`):

```bat
cd "c:/Users/Sudarshan P/Desktop/daa_final"
python -m venv venv
venv\Scripts\activate
pip install -r backend\requirements.txt
python backend\app.py
```

Backend runs on: **http://localhost:5000**

Keep this terminal running.

---

### 2) Start the React frontend
Open another terminal and run:

```bat
cd "c:/Users/Sudarshan P/Desktop/daa_final\frontend"
npm install
npm run dev
```

Frontend runs on a Vite URL (typically **http://localhost:5173**).

---

## How it works (UI)

1. Upload a **.txt** file.
2. The app calls:
   - `POST /api/analyze` for entropy/redundancy + recommended algorithm
   - `POST /api/compress` to download compressed output
   - `POST /api/compare` to benchmark Huffman vs RLE vs LZW

---

## Notes

- The frontend expects the backend at **http://localhost:5000**.
- If you change the backend port, update the URLs in the frontend code.

