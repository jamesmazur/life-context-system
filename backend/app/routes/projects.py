"""
Project CRUD routes.
"""

from fastapi import APIRouter

from app import database
from app.models import Project

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[Project])
def list_projects(status: str | None = None) -> list[Project]:
    """List projects with optional status filtering."""
    return database.get_projects(status=status)
