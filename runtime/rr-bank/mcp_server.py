import os
import requests
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("RR Bank MCP Server")
BASE_URL = os.getenv("BUSINESS_API_BASE_URL", "http://127.0.0.1:8000")


def _safe_json(response):
    try:
        return response.json()
    except Exception:
        return {}


@mcp.tool()
def get_my_accounts() -> dict:
    """Return only accounts owned by the authenticated demo customer."""
    try:
        r = requests.get(f"{BASE_URL}/internal/me/accounts", timeout=10)
        if r.status_code != 200:
            return {"status":"ERROR","message":"Unable to retrieve accounts."}
        data = r.json()
        return {"status":"SUCCESS","accounts":data.get("accounts",[])}
    except requests.RequestException:
        return {"status":"ERROR","message":"Banking service is unavailable."}


@mcp.tool()
def get_account_balance(account_id: str) -> dict:
    """Return balance for an account only if accessible to the authenticated customer."""
    try:
        r = requests.get(f"{BASE_URL}/internal/me/accounts/{account_id}/balance", timeout=10)
        if r.status_code in (403,404):
            return {"status":"RESOURCE_NOT_ACCESSIBLE","message":"The requested account could not be accessed."}
        if r.status_code != 200:
            return {"status":"ERROR","message":"Unable to retrieve account balance."}
        d = r.json()
        return {
            "status":"SUCCESS",
            "account_id":d["account_id"],
            "account_type":d["account_type"],
            "last4":d["last4"],
            "available_balance":d["available_balance"],
            "currency":d["currency"],
            "account_status":d["status"],
        }
    except requests.RequestException:
        return {"status":"ERROR","message":"Banking service is unavailable."}


@mcp.tool()
def get_transaction_history(account_id: str, limit: int = 5) -> dict:
    """Return recent transactions for an accessible account."""
    limit = max(1, min(int(limit or 5), 20))
    try:
        r = requests.get(
            f"{BASE_URL}/internal/me/accounts/{account_id}/transactions",
            params={"limit":limit}, timeout=10)
        if r.status_code in (403,404):
            return {"status":"RESOURCE_NOT_ACCESSIBLE","message":"The requested account could not be accessed."}
        if r.status_code != 200:
            return {"status":"ERROR","message":"Unable to retrieve transactions."}
        d = r.json()
        return {"status":"SUCCESS","account_id":d["account_id"],"transactions":d.get("transactions",[])}
    except requests.RequestException:
        return {"status":"ERROR","message":"Banking service is unavailable."}


@mcp.tool()
def get_current_credit_limit() -> dict:
    """Return the authenticated customer's current credit limit and approved automation ceiling."""
    try:
        r = requests.get(f"{BASE_URL}/internal/me/credit-limit", timeout=10)
        if r.status_code != 200:
            return {"status":"ERROR","message":"Unable to retrieve credit profile."}
        return {"status":"SUCCESS", **r.json()}
    except requests.RequestException:
        return {"status":"ERROR","message":"Banking service is unavailable."}


@mcp.tool()
def request_credit_limit_change(requested_limit: float) -> dict:
    """Create a governed credit-limit request. The tool never self-approves above policy thresholds."""
    try:
        r = requests.post(
            f"{BASE_URL}/internal/me/credit-limit-requests",
            json={"requested_limit":float(requested_limit)}, timeout=10)
        if r.status_code in (403,404):
            return {"status":"RESOURCE_NOT_ACCESSIBLE","message":"The requested resource could not be accessed."}
        if r.status_code != 200:
            return {"status":"ERROR","message":"Unable to create the credit-limit request."}
        return r.json()
    except requests.RequestException:
        return {"status":"ERROR","message":"Banking service is unavailable."}


if __name__ == "__main__":
    mcp.run()
