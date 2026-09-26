"""Create the local SQLite schema and copy the synthetic seed into audit-ready runtime storage."""
import json
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from backend.repositories.audit import initialize

ROOT=Path(__file__).resolve().parents[1]
def main():
    initialize()
    seed=json.loads((ROOT/"data/synthetic/enterprise-data.json").read_text(encoding="utf-8"))
    (ROOT/"data/runtime/seed-manifest.json").write_text(json.dumps({"synthetic":True,"tables":{k:len(v) for k,v in seed.items()}},indent=2),encoding="utf-8")
    print(f"Initialized {len(seed)} synthetic data domains at {ROOT/'data/runtime'}")
if __name__=="__main__":main()
