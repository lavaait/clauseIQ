import sqlite3

def init_db():
    with sqlite3.connect("contracts.db") as conn:
        cursor = conn.cursor()

        # ── Contracts table ───────────────
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS contracts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        agency TEXT NOT NULL,
        contract_type TEXT NOT NULL,
        value REAL NOT NULL,
        file_path TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('intake', 'evaluation', 'approved', 'executed')),
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
        """)

        #______ contracts complaince table ________
        cursor.execute("""
            CREATE TABLE if not exists contract_compliance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contract_id TEXT,
        clause_id TEXT,
        title TEXT,
        compliance_summary TEXT,
        compliance_confidence REAL,
        closeout_status TEXT,
        risk_assessment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)

        #______ contracts activity table ___________
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS contract_activity (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT,
        title TEXT,
        description TEXT,
        timestamp TEXT,
        user TEXT,
        contract_id TEXT,
        priority TEXT
        )
        """)
        # ______ AI Recommendations table _________


        # ───────────────────────────────────────────────
        # 1. Main dashboard metrics table
        # ───────────────────────────────────────────────
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS contract_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                contract_type TEXT,
                stage TEXT NOT NULL,                -- e.g. 'Intake', 'Evaluation'
                intake_date TEXT NOT NULL,          -- ISO format 'YYYY-MM-DD'
                executed_date TEXT,                 -- nullable
                compliance_status TEXT NOT NULL,    -- e.g. 'Compliant' or 'Non-Compliant'
                amount REAL                         -- optional value

            )
        """)

        # ───────────────────────────────────────────────
        # 2. Activity Feed – contract_events
        # ───────────────────────────────────────────────
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS contract_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                contract_id INTEGER NOT NULL,
                description TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                FOREIGN KEY (contract_id) REFERENCES contract_metrics(id)
            )
        """)

        # ───────────────────────────────────────────────
        # 3. (Optional) Lookup: Stages
        # ───────────────────────────────────────────────
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS stages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL
            )
        """)
        cursor.executemany(
            "INSERT OR IGNORE INTO stages (name) VALUES (?)",
            [("Intake",), ("Evaluation",), ("Performance",), ("Closeout",)]
        )



if __name__ == "__main__":
    init_db()