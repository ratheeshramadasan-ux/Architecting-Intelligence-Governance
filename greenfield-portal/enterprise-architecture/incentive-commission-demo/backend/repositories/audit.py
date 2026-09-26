import json
from datetime import datetime,timezone
from sqlalchemy import String,Text
from sqlalchemy.orm import Mapped,mapped_column
from .database import Base,SessionLocal,engine

class AuditEvent(Base):
    __tablename__="audit_events"
    trace_id:Mapped[str]=mapped_column(String,primary_key=True)
    created_at:Mapped[str]=mapped_column(String)
    evidence_json:Mapped[str]=mapped_column(Text)
    evidence_hash:Mapped[str]=mapped_column(String)

def initialize(): Base.metadata.create_all(engine)
def append(trace_id:str,evidence:dict,digest:str):
    initialize()
    with SessionLocal.begin() as db: db.add(AuditEvent(trace_id=trace_id,created_at=datetime.now(timezone.utc).isoformat(),evidence_json=json.dumps(evidence,sort_keys=True,default=str),evidence_hash=digest))
