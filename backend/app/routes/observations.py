"""
Observation CRUD routes.
"""

from fastapi import APIRouter

from app import database
from app.models import Observation, ObservationCreate

router = APIRouter(prefix="/observations", tags=["observations"])


@router.get("", response_model=list[Observation])
def list_observations(
    status: str | None = None, obs_type: str | None = None, limit: int = 50
) -> list[Observation]:
    """List observations with optional filtering."""
    return database.get_observations(status=status, obs_type=obs_type, limit=limit)


@router.post("", response_model=Observation, status_code=201)
def create_observation(observation: ObservationCreate) -> Observation:
    """Create a new observation."""
    return database.create_observation(observation.model_dump())
