from dataclasses import dataclass
from backend.models.schemas import Handling

@dataclass(frozen=True)
class DataContract:
    contract_id: str
    version: int
    status: str
    fields: dict[str, Handling]

ACTIVE_CONTRACT = DataContract("ADC-INC-04", 3, "ACTIVE", {
    "scenario_id": Handling.ALLOW,
    "transaction_id": Handling.ALLOW, "transaction_date": Handling.ALLOW,
    "product": Handling.ALLOW, "principal": Handling.ALLOW,
    "dealer_ids": Handling.ALLOW, "customer_name": Handling.TOKENIZE,
    "customer_segment": Handling.DERIVE, "new_to_bank": Handling.ALLOW,
    "campaign_id": Handling.ALLOW, "prior_period_volume": Handling.ALLOW,
    "compliance_eligible": Handling.ALLOW, "submitted_by": Handling.TOKENIZE,
})

def require_active(contract: DataContract) -> None:
    if contract.status != "ACTIVE":
        raise ValueError("LLM invocation blocked: AI Data Contract is not ACTIVE")
