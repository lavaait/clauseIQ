from fastapi import FastAPI
from routers.new_contract_request_api import router as new_contract_router
from routers.proposal_summary import router as proposal_summary_router
from routers.checklist_generator_api import router as checklist_validation_router
from routers.closeout_report_api import router as closeout_report_router
from routers.contract_modi_diff_api import router as contract_modi_diff_router
# from routers.external_api_data import router as external_data_router
from routers.document_ocr import router as ocr_router
from routers.clause_validation_router import router as clause_validator_router
from routers.clause_matching_router import router as clause_matching_router
from routers.dashboard_router import router as dashboard_router
from routers.export_router import router as export_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="ClauseIQ Full Backend")

# Define allowed origins — use ["*"] to allow all (not recommended for production)
origins = ["*"
    # "http://localhost"
    # "http://localhost:3000",  # React/Frontend dev server
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,              # Origins allowed to access the API
    allow_credentials=True,
    allow_methods=["*"],                # e.g., GET, POST, PUT, DELETE
    allow_headers=["*"],                # e.g., Authorization, Content-Type
)

app.include_router(new_contract_router, prefix="/api/new_contract_request", tags = ["New_Contract"])
app.include_router(proposal_summary_router, prefix="/api/proposal_summary", tags=["Proposal_Upload"])
app.include_router(checklist_validation_router, prefix="/api/checklist_validation", tags=["Checklist_Compliance"])
app.include_router(closeout_report_router, prefix="/api/closeout_report", tags=["Closeout_Report"])
app.include_router(contract_modi_diff_router, prefix="/api/contract_difference", tags=["Contract_Modification"])
# app.include_router(external_data_router, prefix="/api/external_data", tags=["external"])
app.include_router(ocr_router, prefix="/api/document_parsing", tags=["OCR"])
app.include_router(clause_validator_router, prefix="/api/clause_validator", tags=["Clause_Compliance"])
app.include_router(clause_matching_router, prefix="/api/clause_matching", tags=["Clause_Matching"])
app.include_router(dashboard_router,prefix="/api/dashboard",tags=["Compliance_Dashboard"])
app.include_router(export_router, prefix="/api/export_pdf",tags=["Export_Pdf"])


