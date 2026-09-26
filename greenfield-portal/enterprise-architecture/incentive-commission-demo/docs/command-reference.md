# Command reference

- `python scripts/seed.py` — initialize local SQLite and seed manifest
- `uvicorn backend.main:app --reload --port 8010` — start API
- `python -m http.server 8000` — serve UI locally
- `pytest -q` — run automated controls and calculation tests

Commands assume the demo directory is the working directory and its virtual environment is active.
