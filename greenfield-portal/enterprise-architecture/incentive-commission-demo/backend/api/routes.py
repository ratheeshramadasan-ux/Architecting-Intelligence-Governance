from decimal import Decimal
from fastapi import APIRouter,HTTPException
from backend.models.schemas import TransactionRequest,CalculationResult
from backend.services.processing import process

router=APIRouter(prefix="/api/v1")
@router.get("/health")
def health(): return {"status":"healthy","mode":"synthetic","controls":14}
@router.post("/calculations",response_model=CalculationResult)
def run_calculation(request:TransactionRequest,llm_amount:Decimal|None=None):
    try:return process(request,llm_amount)
    except (ValueError,PermissionError) as exc: raise HTTPException(422,str(exc)) from exc
@router.get("/sops")
def sops():return [{"id":"SOP-INCENTIVE-001-v2","status":"ACTIVE","effective_from":"2026-07-01"},{"id":"SOP-INCENTIVE-001-v1","status":"SUPERSEDED","effective_from":"2025-01-01","effective_to":"2026-06-30"}]
