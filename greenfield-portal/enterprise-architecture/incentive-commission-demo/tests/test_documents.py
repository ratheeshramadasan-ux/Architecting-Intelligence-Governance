from pathlib import Path
from backend.rag.documents import inspect_document,may_activate

ROOT=Path(__file__).resolve().parents[1]
def test_sensitive_sop_is_blocked():
    result=inspect_document(ROOT/"documents/original/SOP-INCENTIVE-001-v3-BLOCKED.md")
    assert result["status"]=="PII_REVIEW_REQUIRED"
    assert not may_activate(result["findings"],True,True)

def test_resolved_findings_need_both_approvals():
    findings=[{"severity":"HIGH","resolved":True}]
    assert not may_activate(findings,True,False)
    assert may_activate(findings,True,True)
