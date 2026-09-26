from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes import router

app=FastAPI(title="RR Bank Governed Incentive API",version="0.1.0",description="Synthetic prototype. LLM interpretation is advisory; financial execution is deterministic.")
app.add_middleware(CORSMiddleware,allow_origins=["http://localhost:8000","http://127.0.0.1:8000"],allow_methods=["*"],allow_headers=["*"])
app.include_router(router)
