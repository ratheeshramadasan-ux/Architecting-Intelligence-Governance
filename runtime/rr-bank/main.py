import asyncio
import json
import os
import uuid
from typing import AsyncGenerator

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from agent_runtime import available_models, run_agent_stream
from database import execute, fetch_all, fetch_one, init_db
from security_context import get_demo_security_context

app = FastAPI(title="RR Bank Governed AI Runtime", version="1.0.0")

allowed_origins = [x.strip() for x in os.getenv(
    "ALLOWED_ORIGINS",
    "https://ai.rrlabs.ca,http://localhost:8787,http://127.0.0.1:8787",
).split(",") if x.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept"],
)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    model: str = "google:gemini-2.5-flash"
    session_id: str | None = None


class CreditLimitRequest(BaseModel):
    requested_limit: float = Field(gt=0, le=250000)


@app.on_event("startup")
def startup():
    init_db()


@app.get("/health")
def health():
    return {"status":"ok","service":"rr-bank-runtime"}


@app.get("/api/models")
def models():
    return {"models": available_models(), "default":"google:gemini-2.5-flash"}


def _authorized_account(account_id: str):
    ctx = get_demo_security_context()
    account = fetch_one("SELECT * FROM accounts WHERE account_id = ?", (account_id,))
    # Deliberately normalize not-found and ownership mismatch.
    if not account or account["customer_id"] != ctx.customer_id:
        raise HTTPException(
            status_code=404,
            detail={"status":"RESOURCE_NOT_ACCESSIBLE","message":"The requested account could not be accessed."},
        )
    return account, ctx


@app.get("/internal/me/accounts")
def my_accounts():
    ctx = get_demo_security_context()
    rows = fetch_all(
        "SELECT account_id, account_type, last4, available_balance, status, currency FROM accounts WHERE customer_id = ? ORDER BY account_type",
        (ctx.customer_id,),
    )
    return {"session_id":ctx.session_id,"accounts":rows}


@app.get("/internal/me/accounts/{account_id}/balance")
def my_balance(account_id: str):
    account, _ = _authorized_account(account_id)
    return {
        "account_id":account["account_id"],
        "account_type":account["account_type"],
        "last4":account["last4"],
        "available_balance":account["available_balance"],
        "status":account["status"],
        "currency":account["currency"],
    }


@app.get("/internal/me/accounts/{account_id}/transactions")
def my_transactions(account_id: str, limit: int = Query(default=5, ge=1, le=20)):
    account, _ = _authorized_account(account_id)
    rows = fetch_all(
        "SELECT transaction_id, transaction_date, description, transaction_type, amount FROM transactions WHERE account_id = ? ORDER BY transaction_date DESC LIMIT ?",
        (account_id, limit),
    )
    return {"account_id":account["account_id"],"transactions":rows}


@app.get("/internal/me/credit-limit")
def current_credit_limit():
    ctx = get_demo_security_context()
    profile = fetch_one("SELECT * FROM credit_profiles WHERE customer_id = ?", (ctx.customer_id,))
    if not profile:
        raise HTTPException(status_code=404, detail={"status":"RESOURCE_NOT_ACCESSIBLE"})
    return {
        "current_limit":profile["current_limit"],
        "auto_approval_ceiling":profile["auto_approval_ceiling"],
        "kyc_status":profile["kyc_status"],
        "risk_rating":profile["risk_rating"],
        "status":profile["status"],
        "currency":"CAD",
        "policy_id":"POL-CRD-017",
    }


@app.post("/internal/me/credit-limit-requests")
def create_credit_limit_request(body: CreditLimitRequest):
    ctx = get_demo_security_context()
    profile = fetch_one("SELECT * FROM credit_profiles WHERE customer_id = ?", (ctx.customer_id,))
    if not profile:
        raise HTTPException(status_code=404, detail={"status":"RESOURCE_NOT_ACCESSIBLE"})

    request_id = "CLR-" + uuid.uuid4().hex[:10].upper()
    requested = round(float(body.requested_limit), 2)

    # High-risk changes above the approved ceiling always require HITL.
    if requested > float(profile["auto_approval_ceiling"]):
        status = "PENDING_APPROVAL"
        reason = "Requested limit exceeds the automated approval ceiling. Human approval is required."
    else:
        # Even within the ceiling, this public demo records a governed request rather than directly mutating the account.
        status = "PENDING_APPROVAL"
        reason = "Demo deployment records the request for controlled approval; direct credit execution is disabled."

    execute(
        "INSERT INTO credit_limit_requests(request_id, customer_id, requested_limit, current_limit, status, reason) VALUES (?,?,?,?,?,?)",
        (request_id, ctx.customer_id, requested, profile["current_limit"], status, reason),
    )
    return {
        "status":status,
        "request_id":request_id,
        "current_limit":profile["current_limit"],
        "requested_limit":requested,
        "auto_approval_ceiling":profile["auto_approval_ceiling"],
        "policy_id":"POL-CRD-017",
        "reason":reason,
    }


def _sse(payload: dict) -> str:
    return f"data: {json.dumps(payload, separators=(',', ':'))}\n\n"


@app.post("/api/chat/stream")
async def chat_stream(body: ChatRequest):
    session_id = body.session_id or "web-" + uuid.uuid4().hex[:12]
    trace_id = "TRACE-" + uuid.uuid4().hex[:12].upper()

    async def events() -> AsyncGenerator[str, None]:
        yield _sse({"type":"trace","trace_id":trace_id,"session_id":session_id})
        try:
            async for event in run_agent_stream(body.message, session_id, body.model):
                event = {**event, "trace_id":trace_id, "session_id":session_id}
                yield _sse(event)
        except asyncio.CancelledError:
            raise
        except Exception as exc:
            yield _sse({
                "type":"error",
                "trace_id":trace_id,
                "session_id":session_id,
                "stage":"RUNTIME_ERROR",
                "message":"The governed AI runtime could not complete the request.",
                "detail": str(exc) if os.getenv("DEBUG_RUNTIME") == "1" else None,
            })

    return StreamingResponse(
        events(),
        media_type="text/event-stream",
        headers={
            "Cache-Control":"no-cache, no-transform",
            "X-Accel-Buffering":"no",
        },
    )


@app.post("/api/chat")
async def chat(body: ChatRequest):
    final = None
    trace_id = "TRACE-" + uuid.uuid4().hex[:12].upper()
    session_id = body.session_id or "web-" + uuid.uuid4().hex[:12]
    tools = []
    async for event in run_agent_stream(body.message, session_id, body.model):
        if event.get("type") == "tool_call":
            tools.append(event.get("tool"))
        if event.get("type") == "final":
            final = event
    if not final:
        raise HTTPException(status_code=503, detail="Agent runtime returned no final response.")
    return {
        "response":final["response"],
        "model":final.get("model"),
        "trace":{
            "trace_id":trace_id,
            "agent":"RR Bank Coordinator",
            "tools":[x for x in tools if x],
            "result":"SUCCESS",
        },
    }
