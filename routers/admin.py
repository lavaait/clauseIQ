from fastapi import APIRouter
from fastapi import HTTPException
import sqlite3
import csv
from fastapi.responses import StreamingResponse
from io import StringIO

router = APIRouter(prefix="/admin", tags=["admin"])

DB_PATH = "contracts.db"

@router.put("/users/{user_id}/role")
def update_user_role(user_id: int, new_role: str):
    assert new_role in ("admin", "reviewer", "viewer")
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET role = ? WHERE id = ?", (new_role, user_id))
        conn.commit()
    return {"message": f"Role for user {user_id} updated to '{new_role}'"}

@router.get("/admin/audit-logs/export")
def export_logs_as_csv():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT users.username, audit_logs.action, audit_logs.ai_decision, audit_logs.status, audit_logs.timestamp
        FROM audit_logs JOIN users ON audit_logs.user_id = users.id
    """)
    rows = cursor.fetchall()
    conn.close()

    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["Username", "Action", "AI Decision", "Status", "Timestamp"])
    for row in rows:
        writer.writerow(row)

    output.seek(0)
    return StreamingResponse(output, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=audit_logs.csv"})