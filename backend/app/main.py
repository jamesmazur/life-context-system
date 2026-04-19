"""
Main FastAPI application for Life Context System.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import (
    entities,
    experiments,
    metrics,
    observations,
    projects,
    sessions,
)

app = FastAPI(
    title="Life Context API",
    description="API for Life Operating System - manage personal context, observations, and experiments",
    version="0.1.0",
)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(entities.router)
app.include_router(observations.router)
app.include_router(projects.router)
app.include_router(experiments.router)
app.include_router(metrics.router)
app.include_router(sessions.router)


@app.get("/")
def root() -> dict[str, str]:
    """Root endpoint."""
    return {"message": "Life Context API", "docs": "/docs"}


@app.get("/health")
def health() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy"}
