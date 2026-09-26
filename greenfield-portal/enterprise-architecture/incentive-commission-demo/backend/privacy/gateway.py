import hashlib
import re
from dataclasses import dataclass, field
from backend.governance.contracts import DataContract, require_active
from backend.models.schemas import Handling

@dataclass
class TokenVault:
    _values: dict[str, str] = field(default_factory=dict)
    def tokenize(self, value: str) -> str:
        token=f"tok_{hashlib.sha256(value.encode()).hexdigest()[:12]}"
        self._values[token]=value
        return token
    def rehydrate(self, token: str, *, authorized: bool) -> str:
        if not authorized or token not in self._values: raise PermissionError("Rehydration denied")
        return self._values[token]

PATTERNS={"SIN":re.compile(r"\b\d{3}[ -]?\d{3}[ -]?\d{3}\b"),"EMAIL":re.compile(r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}"),"BANK_ACCOUNT":re.compile(r"\b(?:acct|account)\s*[:#]?\s*\d{7,12}\b",re.I)}

def detect_sensitive(text: str) -> list[dict]:
    return [{"category":k,"severity":"CRITICAL" if k in {"SIN","BANK_ACCOUNT"} else "HIGH","start":m.start(),"sample_masked":"***"+m.group()[-3:]} for k,p in PATTERNS.items() for m in p.finditer(text)]

def apply_contract(payload: dict, contract: DataContract, vault: TokenVault) -> tuple[dict,list[dict]]:
    require_active(contract); safe={}; evidence=[]
    for key,value in payload.items():
        if key=="unknown_fields" and value: raise ValueError("LLM invocation blocked: unclassified field")
        if key not in contract.fields:
            if key!="unknown_fields": raise ValueError(f"LLM invocation blocked: unclassified field {key}")
            continue
        action=contract.fields[key]
        if action==Handling.BLOCK and value not in (None,"",[]): raise ValueError(f"LLM invocation blocked: {key}")
        if action==Handling.TOKENIZE: safe[key]=vault.tokenize(str(value))
        elif action==Handling.MASK: safe[key]="***"
        elif action==Handling.GENERALIZE: safe[key]="GENERALIZED"
        elif action==Handling.DERIVE: safe[key]=hashlib.sha256(str(value).encode()).hexdigest()[:8]
        else: safe[key]=value
        evidence.append({"field":key,"handling":action.value})
    return safe,evidence
