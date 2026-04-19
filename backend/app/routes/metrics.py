"""
Metric routes.
"""

from fastapi import APIRouter

from app import database
from app.models import Metric

router = APIRouter(prefix="/metrics", tags=["metrics"])


@router.get("", response_model=list[Metric])
def list_metrics(
    metric_name: str | None = None, start_date: str | None = None, end_date: str | None = None
) -> list[Metric]:
    """List metrics with optional filtering by name and date range."""
    return database.get_metrics(metric_name=metric_name, start_date=start_date, end_date=end_date)
