from datetime import date
from decimal import Decimal
import pytest
from backend.governance.contracts import ACTIVE_CONTRACT
from backend.models.schemas import TransactionRequest
from backend.privacy.gateway import TokenVault,apply_contract,detect_sensitive
from backend.security.rbac import authorize,enforce_sod
from backend.services.processing import process

def request(**overrides):
    values=dict(transaction_id="TXN-1",transaction_date=date(2026,9,9),product="MORTGAGE",principal=Decimal("100000"),dealer_ids=["D1"],customer_name="Synthetic Person")
    values.update(overrides);return TransactionRequest(**values)

def test_unclassified_field_fails_closed():
    with pytest.raises(ValueError,match="unclassified"): process(request(unknown_fields={"new_secret":"x"}))

def test_tokenization_preserves_financial_values():
    safe,evidence=apply_contract(request().model_dump(mode="json"),ACTIVE_CONTRACT,TokenVault())
    assert safe["customer_name"].startswith("tok_")
    assert Decimal(str(safe["principal"]))==Decimal("100000")
    assert any(x["handling"]=="TOKENIZE" for x in evidence)

def test_llm_variance_blocks_payment():
    result=process(request(),Decimal("999.99"))
    assert result["final_status"]=="BLOCKED"

def test_duplicate_requires_hitl():
    result=process(request(transaction_id="TXN-DUPLICATE-001"))
    assert result["hitl_required"] and result["final_status"]=="BLOCKED"

def test_sensitive_document_detection():
    assert detect_sensitive("Synthetic SIN 999 999 998")[0]["category"]=="SIN"

def test_rbac_and_segregation_of_duties():
    with pytest.raises(PermissionError): authorize("operations_analyst","approve_commission")
    with pytest.raises(PermissionError): enforce_sod("USR-012","USR-012")
