from dataclasses import dataclass


@dataclass(frozen=True)
class SecurityContext:
    customer_id: str
    user_type: str
    authentication_level: str
    session_id: str


def get_demo_security_context() -> SecurityContext:
    # Demo identity is established server-side. The browser/LLM cannot override it.
    return SecurityContext(
        customer_id="CUST100001",
        user_type="STANDARD",
        authentication_level="MFA",
        session_id="SESSION-DEMO-001",
    )
