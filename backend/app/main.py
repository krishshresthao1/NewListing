from fastapi import FastAPI

from app.config.connection import db
from app.routes.member import router as member_router
from app.routes.group import router as group_router
from app.routes.subgroup import router as subgroup_router
from app.routes.saving import router as saving_router
from app.routes.loan import router as loan_router
from app.routes.installment import router as installment_router
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI(title="Kachuli API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Kachuli API is running"}


@app.get("/db-test")
def db_test():
    collections = db.list_collection_names()

    return {
        "database": db.name,
        "collections": collections,
    }

app.include_router(group_router)

app.include_router(subgroup_router)

app.include_router(member_router)

app.include_router(saving_router)

app.include_router(loan_router)

app.include_router(installment_router)