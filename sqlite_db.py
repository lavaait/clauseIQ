import sqlite3

def init_db():
    with sqlite3.connect("contracts.db") as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS contracts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                agency TEXT NOT NULL,
                contract_type TEXT NOT NULL,
                value REAL NOT NULL,
                file_path TEXT NOT NULL
            )
        """)
        conn.commit()