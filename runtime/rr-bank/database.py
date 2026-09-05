import os
import sqlite3
from pathlib import Path
from threading import Lock

DB_PATH = Path(os.getenv("RR_BANK_DB_PATH", "/tmp/rr-bank-demo.db"))
_DB_LOCK = Lock()

SCHEMA = """
CREATE TABLE IF NOT EXISTS accounts (
    account_id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    account_type TEXT NOT NULL,
    last4 TEXT NOT NULL,
    available_balance REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    currency TEXT NOT NULL DEFAULT 'CAD'
);
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    transaction_date TEXT NOT NULL,
    description TEXT NOT NULL,
    transaction_type TEXT NOT NULL,
    amount REAL NOT NULL,
    FOREIGN KEY(account_id) REFERENCES accounts(account_id)
);
CREATE TABLE IF NOT EXISTS credit_profiles (
    customer_id TEXT PRIMARY KEY,
    current_limit REAL NOT NULL,
    auto_approval_ceiling REAL NOT NULL,
    kyc_status TEXT NOT NULL,
    risk_rating TEXT NOT NULL,
    status TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS credit_limit_requests (
    request_id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    requested_limit REAL NOT NULL,
    current_limit REAL NOT NULL,
    status TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
"""

SEED = [
    ("INSERT OR IGNORE INTO accounts VALUES (?,?,?,?,?,?,?)", ("ACC200001","CUST100001","CHEQUING","4821",8420.32,"ACTIVE","CAD")),
    ("INSERT OR IGNORE INTO accounts VALUES (?,?,?,?,?,?,?)", ("ACC200002","CUST100001","SAVINGS","7714",31854.18,"ACTIVE","CAD")),
    ("INSERT OR IGNORE INTO accounts VALUES (?,?,?,?,?,?,?)", ("ACC200008","CUST100006","CHEQUING","9988",12590.60,"ACTIVE","CAD")),
    ("INSERT OR IGNORE INTO transactions VALUES (?,?,?,?,?,?)", ("TXN900001","ACC200001","2026-09-03T09:00:00","Payroll Deposit","CREDIT",4250.00)),
    ("INSERT OR IGNORE INTO transactions VALUES (?,?,?,?,?,?)", ("TXN900002","ACC200001","2026-09-02T18:22:00","Prairie Grocers","DEBIT",-126.47)),
    ("INSERT OR IGNORE INTO transactions VALUES (?,?,?,?,?,?)", ("TXN900003","ACC200001","2026-09-01T08:30:00","Evergreen Utilities","DEBIT",-184.73)),
    ("INSERT OR IGNORE INTO transactions VALUES (?,?,?,?,?,?)", ("TXN900004","ACC200001","2026-08-31T14:20:00","Online Transfer","DEBIT",-250.00)),
    ("INSERT OR IGNORE INTO transactions VALUES (?,?,?,?,?,?)", ("TXN900005","ACC200001","2026-08-30T10:42:00","Riverbend Coffee","DEBIT",-8.75)),
    ("INSERT OR IGNORE INTO credit_profiles VALUES (?,?,?,?,?,?)", ("CUST100001",10000.00,20000.00,"CURRENT","MEDIUM","ACTIVE")),
]


def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with _DB_LOCK:
        conn = connect()
        try:
            conn.executescript(SCHEMA)
            for sql, params in SEED:
                conn.execute(sql, params)
            conn.commit()
        finally:
            conn.close()


def fetch_all(sql: str, params=()):
    conn = connect()
    try:
        return [dict(r) for r in conn.execute(sql, params).fetchall()]
    finally:
        conn.close()


def fetch_one(sql: str, params=()):
    conn = connect()
    try:
        row = conn.execute(sql, params).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def execute(sql: str, params=()):
    with _DB_LOCK:
        conn = connect()
        try:
            cur = conn.execute(sql, params)
            conn.commit()
            return cur.rowcount
        finally:
            conn.close()
