from datetime import date
from decimal import Decimal
from enum import Enum
from pydantic import BaseModel, Field

class Handling(str, Enum):
    ALLOW="ALLOW"; TOKENIZE="TOKENIZE"; MASK="MASK"; GENERALIZE="GENERALIZE"; BLOCK="BLOCK"; DERIVE="DERIVE"

class TransactionRequest(BaseModel):
    scenario_id: str = "SCN-01"
    transaction_id: str
    transaction_date: date
    product: str
    principal: Decimal = Field(gt=0)
    dealer_ids: list[str]
    customer_name: str
    customer_segment: str = "STANDARD"
    new_to_bank: bool = False
    campaign_id: str | None = None
    prior_period_volume: Decimal = Decimal("0")
    compliance_eligible: bool = True
    submitted_by: str = "USR-012"
    unknown_fields: dict = {}

class CalculationResult(BaseModel):
    trace_id: str
    sop_version: str
    base_rate: Decimal
    gross_commission: Decimal
    final_commission: Decimal
    allocations: dict[str, Decimal]
    controls: list[dict]
    final_status: str
    hitl_required: bool
    evidence_hash: str

class DocumentFinding(BaseModel):
    category: str
    severity: str
    location: str
    sample_masked: str

class DocumentRecord(BaseModel):
    document_id: str
    version: str
    status: str
    findings: list[DocumentFinding] = []
