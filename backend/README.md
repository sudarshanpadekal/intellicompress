# Backend (Flask)

Flask API for IntelliCompress.

## Setup

```bat
cd backend
pip install -r requirements.txt
python app.py
```

Backend runs on:
- http://localhost:5000

## API endpoints

- `POST /api/analyze`
  - FormData: `file` (txt)
  - Returns: entropy/redundancy + recommended algorithm + Huffman tree (for visualization)

- `POST /api/compress`
  - FormData: `file`, `algorithm` (huffman|rle|lzw), optional `password`
  - Returns: a downloadable compressed file (or encrypted payload)

- `POST /api/decompress`
  - FormData: `file`, `algorithm`, optional `password`
  - Returns: `decompressed.txt`

- `POST /api/compare`
  - FormData: `file`
  - Returns: comparison (Huffman vs RLE vs LZW)

