"""Plumbline API server for real authentication, OAuth connections and publishing."""
import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

ROOT = Path(__file__).resolve().parent
load_dotenv(ROOT / ".env")

from app.database.db import init_db
from app.routes.health import router as health_router
from app.routes.auth import router as auth_router
from app.routes.social import router as social_router
from app.routes.workspace import router as workspace_router
from app.routes.ai import router as ai_router

app = FastAPI(
    title="Plumbline API",
    description="Brand governance, OAuth account connections and social publishing API",
    version="2.0.0",
)

origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173",
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(social_router)
app.include_router(workspace_router)
app.include_router(ai_router)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def read_root():
    return {"name": "Plumbline API", "version": "2.0.0", "status": "healthy", "docs": "/docs"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=os.getenv("HOST", "127.0.0.1"), port=int(os.getenv("PORT", "8000")), reload=True)
