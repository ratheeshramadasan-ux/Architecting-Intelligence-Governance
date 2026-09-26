# RR Bank Governed AI Incentive & Commission Demo

An independently maintainable, synthetic-only prototype beside the existing Banking Agent demo. It demonstrates governed document retrieval and LLM interpretation while keeping financial calculation, controls, approval, and execution deterministic and outside model authority.

## Quick start

From this directory:

```powershell
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe scripts\seed.py
.venv\Scripts\python.exe -m uvicorn backend.main:app --reload --port 8010
```

In a second terminal, run `python -m http.server 8000` and open `http://localhost:8000/`. API documentation is at `http://localhost:8010/docs`.

Run tests with `.venv\Scripts\python.exe -m pytest -q`. No production deployment is required or performed.

## Structure

- `frontend/` — self-contained operational UI assets
- `backend/` — API, services, repositories, models, governance, privacy, RAG, calculation, controls, and security
- `data/` — master policy, runtime SQLite, synthetic source data, and golden scenarios
- `documents/` — originals, approved RAG-safe forms, and generated outputs
- `tests/` — deterministic and governance acceptance tests
- `docs/` — architecture, API, security, runbook, and deployment notes
