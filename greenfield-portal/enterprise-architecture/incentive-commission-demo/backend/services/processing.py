import hashlib,json,secrets
from decimal import Decimal
from backend.calculation.engine import calculate
from backend.controls.engine import evaluate
from backend.governance.contracts import ACTIVE_CONTRACT
from backend.privacy.gateway import TokenVault,apply_contract

EXISTING_IDS={"TXN-DUPLICATE-001"}
def process(request,llm_amount:Decimal|None=None):
    trace_id="TRACE-"+secrets.token_hex(4).upper(); vault=TokenVault()
    safe_payload,exposure=apply_contract(request.model_dump(mode="json"),ACTIVE_CONTRACT,vault)
    calc=calculate(principal=request.principal,product=request.product,segment=request.customer_segment,new_to_bank=request.new_to_bank,campaign_id=request.campaign_id,prior_volume=request.prior_period_volume,dealer_ids=request.dealer_ids,effective_date=request.transaction_date)
    controls,hitl,status=evaluate(request=request,calculation=calc,existing_ids=EXISTING_IDS,llm_amount=llm_amount)
    evidence={"trace_id":trace_id,"automation":"INCENTIVE-CALC v4.2","contract":"ADC-INC-04 v3","sop":calc["sop_version"],"model":"gemini-2.5-flash","retrieved_chunks":["4.2","7.1","11.3"],"safe_payload":safe_payload,"data_exposure":exposure,"calculation":{k:str(v) for k,v in calc.items() if k!="allocations"},"controls":controls,"decision":status}
    digest=hashlib.sha256(json.dumps(evidence,sort_keys=True).encode()).hexdigest()
    return {**calc,"trace_id":trace_id,"controls":controls,"final_status":status,"hitl_required":hitl,"evidence_hash":digest}
