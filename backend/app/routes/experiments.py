"""
Experiment routes.
"""

from fastapi import APIRouter

from app import database
from app.models import Experiment

router = APIRouter(prefix="/experiments", tags=["experiments"])


@router.get("", response_model=list[Experiment])
def list_experiments(status: str | None = None) -> list[Experiment]:
    """List experiments with optional status filtering."""
    return database.get_experiments(status=status)
