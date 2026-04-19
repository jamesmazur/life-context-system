"""
Pydantic models for Life Context System API.
All models use strict typing for validation and serialization.
"""

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field, field_validator


# Enums for constrained fields
class EntityType(str, Enum):
    PERSON = "person"
    GOAL = "goal"
    SYSTEM = "system"
    VALUE = "value"
    DECISION = "decision"
    PRIORITY = "priority"
    TOOL = "tool"


class ObservationType(str, Enum):
    PATTERN = "pattern"
    CORRELATION = "correlation"
    HYPOTHESIS = "hypothesis"
    INSIGHT = "insight"
    PREFERENCE = "preference"


class ObservationStatus(str, Enum):
    ACTIVE = "active"
    VALIDATED = "validated"
    REFUTED = "refuted"
    OUTDATED = "outdated"


class ProjectStatus(str, Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class ExperimentStatus(str, Enum):
    RUNNING = "running"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


# Base models
class EntityBase(BaseModel):
    type: EntityType
    name: str
    description: str | None = None
    status: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class EntityCreate(EntityBase):
    id: str


class EntityUpdate(BaseModel):
    """Update model for entities. All fields optional except type which cannot be changed."""
    name: str | None = None
    description: str | None = None
    status: str | None = None
    metadata: dict[str, Any] | None = None


class Entity(EntityBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ObservationBase(BaseModel):
    type: ObservationType
    content: str
    confidence: float = Field(ge=0.0, le=1.0)
    evidence: list[str] = Field(default_factory=list)
    status: ObservationStatus = ObservationStatus.ACTIVE
    related_entities: list[str] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)


class ObservationCreate(ObservationBase):
    id: str
    session_id: str | None = None


class Observation(ObservationBase):
    id: str
    created_at: datetime
    session_id: str | None

    class Config:
        from_attributes = True


class ProjectBase(BaseModel):
    name: str
    status: ProjectStatus
    priority: int | None = Field(None, ge=1, le=5)
    goal_alignment: list[str] = Field(default_factory=list)
    current_phase: str | None = None
    blockers: list[str] = Field(default_factory=list)
    next_action: str | None = None
    observations: list[str] = Field(default_factory=list)
    notes: str | None = None


class ProjectCreate(ProjectBase):
    id: str


class Project(ProjectBase):
    id: str
    started_at: datetime
    completed_at: datetime | None

    class Config:
        from_attributes = True


class ExperimentBase(BaseModel):
    name: str
    intervention: str
    success_criteria: str
    status: ExperimentStatus = ExperimentStatus.RUNNING
    hypothesis_id: str | None = None
    metrics_to_track: list[str] = Field(default_factory=list)
    outcome_summary: str | None = None
    outcome_data: dict[str, Any] | None = None
    related_projects: list[str] = Field(default_factory=list)


class ExperimentCreate(ExperimentBase):
    id: str


class Experiment(ExperimentBase):
    id: str
    started_at: datetime
    ended_at: datetime | None

    class Config:
        from_attributes = True


class MetricBase(BaseModel):
    date: str  # ISO date string (YYYY-MM-DD)
    metric_name: str
    value: float
    source: str
    metadata: dict[str, Any] = Field(default_factory=dict)

    @field_validator("date")
    @classmethod
    def validate_date(cls, v: str) -> str:
        """Validate date format."""
        try:
            datetime.fromisoformat(v)
            return v
        except ValueError:
            raise ValueError("Date must be in ISO format (YYYY-MM-DD)")


class MetricCreate(MetricBase):
    pass


class Metric(MetricBase):
    class Config:
        from_attributes = True


class SessionBase(BaseModel):
    summary: str | None = None
    session_observations: str | None = None
    action_items: list[str] = Field(default_factory=list)
    followup_needed: bool = False
    followup_items: list[str] = Field(default_factory=list)


class SessionCreate(SessionBase):
    id: str


class Session(SessionBase):
    id: str
    started_at: datetime
    ended_at: datetime | None

    class Config:
        from_attributes = True


# Special response models
class SearchResult(BaseModel):
    """Result from full-text search."""
    type: str
    id: str
    content: str
    relevance: float
    metadata: dict[str, Any]
