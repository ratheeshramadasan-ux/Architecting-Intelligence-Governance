from decimal import Decimal

def evaluate(*,request,calculation,existing_ids:set[str],llm_amount:Decimal|None=None)->tuple[list[dict],bool,str]:
    results=[]
    def add(name,passed,severity="HIGH"): results.append({"control":name,"result":"PASS" if passed else "FAIL","severity":severity})
    add("CTRL-DUP-001",request.transaction_id not in existing_ids,"CRITICAL")
    add("CTRL-COMP-001",request.compliance_eligible,"CRITICAL")
    add("CTRL-CAP-001",calculation["final_commission"]<=Decimal("25000"))
    add("CTRL-ALLOC-001",sum(calculation["allocations"].values())==calculation["final_commission"])
    if llm_amount is not None:add("CTRL-LLM-VAR-001",llm_amount==calculation["final_commission"],"CRITICAL")
    failed=[r for r in results if r["result"]=="FAIL"]
    return results,bool(failed),"BLOCKED" if any(r["severity"]=="CRITICAL" for r in failed) else ("REVIEW" if failed else "CALCULATED")
