"""
Session routes.
"""

from fastapi import APIRouter

from app import database
from app.models import Session

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("", response_model=list[Session])
def list_sessions(limit: int = 10) -> list[Session]:
    """List recent sessions."""
    return database.get_sessions(limit=limit)
