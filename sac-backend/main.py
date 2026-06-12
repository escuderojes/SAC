import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth import router as auth_router
from database import create_db_and_tables
from routers import catalogos, export, historial, plan, sac, stats

load_dotenv()

app = FastAPI(
    title="Sistema SAC API",
    description="Backend FastAPI para Solicitudes de Accion Correctiva UCV",
    version="1.0.0",
)

origins = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://127.0.0.1:5500,http://localhost:5500").split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.get("/")
def root():
    return {"app": "Sistema SAC API", "docs": "/docs"}


@app.get("/health")
def health():
    return {"ok": True}


app.include_router(auth_router)
app.include_router(stats.router)
app.include_router(catalogos.router)
app.include_router(export.router)
app.include_router(plan.router)
app.include_router(historial.router)
app.include_router(sac.router)
