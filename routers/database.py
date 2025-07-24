import sqlite3

DB_PATH = "contracts.db"

def get_connection():
    return sqlite3.connect(DB_PATH)