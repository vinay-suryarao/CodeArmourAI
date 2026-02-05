from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ..utils.config import settings
from ..utils.logger import logger
from .routes import detection, feedback, health


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting CodeArmour API...")
    yield
    logger.info("Shutting down...")


app = FastAPI(
    title="CodeArmour AI",
    description="AI-powered SAST tool",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/v1")
app.include_router(detection.router, prefix="/api/v1")
app.include_router(feedback.router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "CodeArmour AI API"}
