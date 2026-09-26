from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase,sessionmaker

DB_PATH=Path(__file__).resolve().parents[2]/"data"/"runtime"/"incentive_demo.db"
engine=create_engine(f"sqlite:///{DB_PATH}",connect_args={"check_same_thread":False})
SessionLocal=sessionmaker(bind=engine,autoflush=False,autocommit=False)
class Base(DeclarativeBase): pass
