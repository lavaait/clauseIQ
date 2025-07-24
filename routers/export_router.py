import os
import sqlite3
import pdfkit
from jinja2 import Template
from fastapi import APIRouter

router = APIRouter()
DB_PATH = "contracts.db"

# Optional: full path to wkhtmltopdf binary (required on Windows)
WKHTMLTOPDF_PATH = r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe"
config = pdfkit.configuration(wkhtmltopdf=WKHTMLTOPDF_PATH)

EXPORT_FOLDER = "dashboard_exports"
os.makedirs(EXPORT_FOLDER, exist_ok=True)  # ✅ ensure folder exists

@router.post("/api/dashboard/export/pdf/save")
def generate_and_save_pdf():
    # ---- Fetch data as before ----
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("SELECT intake, evaluation, performance, closeout FROM contracts_summary ORDER BY created_at DESC LIMIT 1")
    intake, evaluation, performance, closeout = cursor.fetchone()
    total = intake + evaluation + performance + closeout

    cursor.execute("SELECT COUNT(*) FROM contract_compliance WHERE LOWER(compliance_summary) = 'compliant'")
    compliant = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM contract_compliance")
    total_clauses = cursor.fetchone()[0]
    compliance_percentage = round((compliant / total_clauses) * 100, 2) if total_clauses else 0.0

    cursor.execute("SELECT total_contracts, average_growth_percentage, average_response_time_hours, success_rate_percentage FROM quick_stats ORDER BY snapshot_time DESC LIMIT 1")
    qs = cursor.fetchone()
    conn.close()

    quick_stats = {
        "total_contracts": qs[0],
        "average_growth_percentage": qs[1],
        "average_response_time_hours": qs[2],
        "success_rate_percentage": qs[3]
    }

    # ---- Inline HTML Template ----
    template_str = """
    <html>
    <head><style>
        body { font-family: Arial; margin: 40px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ccc; padding: 8px; }
        th { background-color: #f0f0f0; }
    </style></head>
    <body>
        <h1>Dashboard PDF Report</h1>
        <h2>Contract Summary</h2>
        <table>
            <tr><th>Stage</th><th>Count</th></tr>
            <tr><td>Intake</td><td>{{ intake }}</td></tr>
            <tr><td>Evaluation</td><td>{{ evaluation }}</td></tr>
            <tr><td>Performance</td><td>{{ performance }}</td></tr>
            <tr><td>Closeout</td><td>{{ closeout }}</td></tr>
            <tr><td><strong>Total</strong></td><td><strong>{{ total }}</strong></td></tr>
        </table>

        <h2>Compliance</h2>
        <p><strong>Compliance Percentage:</strong> {{ compliance_percentage }}%</p>

        <h2>Quick Stats</h2>
        <table>
            <tr><td>Total Contracts</td><td>{{ quick_stats.total_contracts }}</td></tr>
            <tr><td>Growth %</td><td>{{ quick_stats.average_growth_percentage }}</td></tr>
            <tr><td>Response Time (hrs)</td><td>{{ quick_stats.average_response_time_hours }}</td></tr>
            <tr><td>Success Rate %</td><td>{{ quick_stats.success_rate_percentage }}</td></tr>
        </table>
    </body>
    </html>
    """
    template = Template(template_str)
    rendered_html = template.render(
        intake=intake,
        evaluation=evaluation,
        performance=performance,
        closeout=closeout,
        total=total,
        compliance_percentage=compliance_percentage,
        quick_stats=quick_stats
    )

    # ---- Write to file ----
    filename = f"dashboard_report.pdf"
    filepath = os.path.join(EXPORT_FOLDER, filename)
    pdfkit.from_string(rendered_html, filepath, configuration=config)

    return {"message": "PDF exported successfully", "file_path": filepath}