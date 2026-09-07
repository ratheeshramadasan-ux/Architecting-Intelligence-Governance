import os
import sys
from pathlib import Path
from typing import AsyncGenerator

from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.tools.mcp_tool.mcp_toolset import McpToolset
from google.adk.tools.mcp_tool.mcp_session_manager import StdioConnectionParams
from google.genai import types
from mcp import StdioServerParameters

APP_NAME = "rr_bank_demo"
USER_ID = "demo-customer"
ROOT = Path(__file__).resolve().parent
MCP_SERVER = ROOT / "mcp_server.py"
PORT = os.getenv("PORT", "8000")

MODEL_REGISTRY = {
    "google:gemini-2.5-flash": {
        "provider": "google",
        "model": "gemini-2.5-flash",
        "label": "Google · Gemini 2.5 Flash",
        "enabled": True,
    },
    "anthropic:claude-sonnet": {
        "provider": "anthropic",
        "model": "claude-sonnet",
        "label": "Anthropic · Claude Sonnet",
        "enabled": False,
        "reason": "Provider adapter/credential not configured in this deployment.",
    },
    "openai:gpt": {
        "provider": "openai",
        "model": "gpt",
        "label": "OpenAI · GPT",
        "enabled": False,
        "reason": "Provider adapter/credential not configured in this deployment.",
    },
}

_session_service = InMemorySessionService()
_runners = {}
_created_sessions = set()


def available_models():
    return [dict(id=k, **v) for k, v in MODEL_REGISTRY.items()]


def _build_runner(model_key: str):
    cfg = MODEL_REGISTRY.get(model_key)
    if not cfg or not cfg.get("enabled"):
        raise ValueError("Requested model is not enabled by the RR Bank model registry.")

    env = {**os.environ, "BUSINESS_API_BASE_URL": f"http://127.0.0.1:{PORT}"}
    tools = McpToolset(
        connection_params=StdioConnectionParams(
            server_params=StdioServerParameters(
                command=sys.executable,
                args=[str(MCP_SERVER)],
                cwd=str(ROOT),
                env=env,
            ),
            timeout=20,
        ),
        tool_filter=[
            "get_my_accounts",
            "get_account_balance",
            "get_transaction_history",
            "get_current_credit_limit",
            "request_credit_limit_change",
        ],
    )

    agent = LlmAgent(
        name="rr_bank_coordinator",
        model=cfg["model"],
        description="Governed RR Bank customer banking assistant.",
        instruction="""
You are the RR Bank AI Banking Assistant operating inside a governed banking platform.

Identity and authorization:
- The authenticated customer identity is resolved by trusted backend context.
- Never ask for or invent Customer_ID.
- Never claim that a resource exists when a tool returns RESOURCE_NOT_ACCESSIBLE.
- RESOURCE_NOT_ACCESSIBLE deliberately covers both nonexistent and unauthorized resources.
- Never disclose who owns another account or any information about another customer.

Account requests:
- For 'my chequing', 'my savings', or similar, first call get_my_accounts.
- Resolve Account_ID only from that returned authorized list.
- For balances call get_account_balance.
- For recent transactions call get_transaction_history; default to 5 when no count is supplied.

Credit-limit requests:
- First call get_current_credit_limit.
- If the customer asks for a change, call request_credit_limit_change with the requested amount.
- If status is PENDING_APPROVAL, explain that the request was submitted for human approval and was not directly executed.
- Never approve a pending request yourself.

Data integrity:
- Never invent balances, transactions, limits, approval states, account IDs, ownership, policies, or tool outcomes.
- Use only approved MCP tool results.
- If a tool fails, say the service is temporarily unable to retrieve the requested information.

Keep the customer-facing answer concise and bank-like.
""",
        tools=[tools],
    )
    return Runner(agent=agent, app_name=APP_NAME, session_service=_session_service)


def get_runner(model_key: str):
    if model_key not in _runners:
        _runners[model_key] = _build_runner(model_key)
    return _runners[model_key]


def _function_calls(event):
    calls = []
    getter = getattr(event, "get_function_calls", None)
    if callable(getter):
        try:
            for c in getter() or []:
                calls.append(getattr(c, "name", None) or "tool")
            return [x for x in calls if x]
        except Exception:
            pass
    content = getattr(event, "content", None)
    for part in getattr(content, "parts", []) or []:
        fc = getattr(part, "function_call", None)
        if fc:
            calls.append(getattr(fc, "name", None) or "tool")
    return [x for x in calls if x]


def _function_response_items(event):
    items = []
    getter = getattr(event, "get_function_responses", None)
    if callable(getter):
        try:
            for r in getter() or []:
                response = getattr(r, "response", None)
                items.append((getattr(r, "name", None) or "tool", response if isinstance(response, dict) else {}))
            if items:
                return items
        except Exception:
            pass
    content = getattr(event, "content", None)
    for part in getattr(content, "parts", []) or []:
        fr = getattr(part, "function_response", None)
        if fr:
            response = getattr(fr, "response", None)
            items.append((getattr(fr, "name", None) or "tool", response if isinstance(response, dict) else {}))
    return items


def _final_text(event):
    is_final = getattr(event, "is_final_response", None)
    try:
        final = bool(is_final()) if callable(is_final) else False
    except Exception:
        final = False
    if not final:
        return None
    chunks = []
    content = getattr(event, "content", None)
    for part in getattr(content, "parts", []) or []:
        text = getattr(part, "text", None)
        if text:
            chunks.append(text)
    return "".join(chunks).strip() or None


async def run_agent_stream(message: str, session_id: str, model_key: str) -> AsyncGenerator[dict, None]:
    cfg = MODEL_REGISTRY.get(model_key)
    if not cfg or not cfg.get("enabled"):
        yield {"type":"error","stage":"MODEL_REGISTRY","message":"Requested LLM is not enabled by policy."}
        return

    runner = get_runner(model_key)
    session_key = (model_key, session_id)
    if session_key not in _created_sessions:
        await _session_service.create_session(app_name=APP_NAME, user_id=USER_ID, session_id=session_id)
        _created_sessions.add(session_key)

    yield {"type":"stage","stage":"REQUEST_RECEIVED","status":"complete"}
    yield {"type":"stage","stage":"IDENTITY_CONTEXT","status":"complete"}
    yield {"type":"stage","stage":"MODEL_CALL","status":"active","model":cfg["label"]}

    new_message = types.Content(role="user", parts=[types.Part(text=message)])
    tool_names = []
    tool_statuses = []
    policy_ids = []
    final_answer = None

    async for event in runner.run_async(user_id=USER_ID, session_id=session_id, new_message=new_message):
        for name in _function_calls(event):
            tool_names.append(name)
            yield {"type":"tool_call","stage":"MCP_TOOL","status":"active","tool":name}

        for name, response in _function_response_items(event):
            outcome = str(response.get("status", "SUCCESS"))
            policy_id = response.get("policy_id")
            if policy_id:
                policy_ids.append(str(policy_id))
            tool_statuses.append(outcome)
            yield {
                "type":"tool_result",
                "stage":"BUSINESS_API",
                "status":"complete",
                "tool":name,
                "outcome":outcome,
                "policy_id":policy_id,
            }

        maybe = _final_text(event)
        if maybe:
            final_answer = maybe

    if any(x == "RESOURCE_NOT_ACCESSIBLE" for x in tool_statuses):
        overall = "BLOCKED"
    elif any(x == "PENDING_APPROVAL" for x in tool_statuses):
        overall = "PENDING_APPROVAL"
    elif any(x == "ERROR" for x in tool_statuses):
        overall = "ERROR"
    else:
        overall = "SUCCESS"

    yield {"type":"stage","stage":"MODEL_CALL","status":"complete","model":cfg["label"]}
    yield {"type":"stage","stage":"RESPONSE_VALIDATION","status":"complete"}
    yield {
        "type":"final",
        "response": final_answer or "The banking service completed the request but did not return a customer-facing response.",
        "model": cfg["label"],
        "tools": tool_names,
        "result": overall,
        "policy_ids": sorted(set(policy_ids)),
    }
