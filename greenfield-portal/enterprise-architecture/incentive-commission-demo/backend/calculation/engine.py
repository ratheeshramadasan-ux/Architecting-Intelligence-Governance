from datetime import date
from decimal import Decimal, ROUND_HALF_UP

CENT=Decimal("0.01")
def sop_for(effective_date: date) -> str:
    return "SOP-INCENTIVE-001-v1" if effective_date <= date(2026,6,30) else "SOP-INCENTIVE-001-v2"

def calculate(*,principal:Decimal,product:str,segment:str,new_to_bank:bool,campaign_id:str|None,prior_volume:Decimal,dealer_ids:list[str],effective_date:date)->dict:
    version=sop_for(effective_date)
    rates_v1={"MORTGAGE":Decimal("0.0038"),"LENDING":Decimal("0.0025"),"INVESTMENT":Decimal("0.0018")}
    rates_v2={"MORTGAGE":Decimal("0.0042"),"LENDING":Decimal("0.0027"),"INVESTMENT":Decimal("0.0020")}
    base=(rates_v1 if version.endswith("v1") else rates_v2).get(product.upper(),Decimal("0"))
    if not base: raise ValueError("Unsupported product")
    multiplier=Decimal("1")
    if segment.upper()=="PREMIUM": multiplier*=Decimal("1.06")
    if new_to_bank: multiplier+=Decimal("0.05")
    if prior_volume+principal>=Decimal("1000000"): multiplier+=Decimal("0.08")
    if campaign_id=="CMP-FALL-26": multiplier*=Decimal("1.10")
    gross=(principal*base*multiplier).quantize(CENT,rounding=ROUND_HALF_UP)
    final=min(max(gross,Decimal("25")),Decimal("25000"))
    share=(final/len(dealer_ids)).quantize(CENT,rounding=ROUND_HALF_UP)
    allocations={d:share for d in dealer_ids}; allocations[dealer_ids[-1]]+=final-sum(allocations.values())
    return {"sop_version":version,"base_rate":base,"gross_commission":gross,"final_commission":final,"allocations":allocations,"multiplier":multiplier}
