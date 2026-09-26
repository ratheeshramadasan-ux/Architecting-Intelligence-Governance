from datetime import date
from decimal import Decimal
from backend.calculation.engine import calculate,sop_for

def test_effective_date_selects_version():
    assert sop_for(date(2026,6,30)).endswith("v1")
    assert sop_for(date(2026,7,1)).endswith("v2")

def test_standard_v2_mortgage_is_deterministic():
    result=calculate(principal=Decimal("640000"),product="MORTGAGE",segment="PREMIUM",new_to_bank=False,campaign_id=None,prior_volume=Decimal("0"),dealer_ids=["DLR-1042"],effective_date=date(2026,9,9))
    assert result["final_commission"]==Decimal("2849.28")

def test_split_allocation_reconciles():
    result=calculate(principal=Decimal("100001"),product="LENDING",segment="STANDARD",new_to_bank=False,campaign_id=None,prior_volume=Decimal("0"),dealer_ids=["D1","D2","D3"],effective_date=date(2026,9,9))
    assert sum(result["allocations"].values())==result["final_commission"]
