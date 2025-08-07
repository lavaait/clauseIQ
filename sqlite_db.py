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

        #________ Draft template ___________
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS contract_drafts (
            contract_id INTEGER PRIMARY KEY,
            draft TEXT,
            rationale TEXT,
            FOREIGN KEY(contract_id) REFERENCES contracts(id) ON DELETE CASCADE
        )""")

        #________ Clause playbook ___________
        # Drop and recreate for clean dev testing
        cursor.execute("DROP TABLE IF EXISTS clause_playbook")
        cursor.execute("""
            CREATE TABLE clause_playbook (
        id INTEGER PRIMARY KEY,
        clause_type TEXT,
        standard_clause TEXT,
        risk_guidance TEXT
        )""")


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
        
        #____ user admin table _________
        cursor.execute("DROP TABLE IF EXISTS users")
        cursor.execute("""
        CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT NOT NULL,
        department TEXT NOT NULL,
        status TEXT NOT NULL,
        last_active TEXT,
        permissions TEXT,           -- store JSON string
        notifications TEXT,         -- store JSON string
        ai_explainability BOOLEAN DEFAULT FALSE
        )
        """)

        #_______ audit logs ______________
        # Drop and recreate for clean dev testing
        cursor.execute("DROP TABLE IF EXISTS audit_logs")
        cursor.execute("""
        CREATE TABLE audit_logs (
            id INTEGER PRIMARY KEY,
            timestamp TEXT,
            user TEXT,
            action TEXT,
            aiDecision TEXT,
            confidence INTEGER,
            details TEXT,
            category TEXT
        )
    """)

if __name__ == "__main__":
    init_db()