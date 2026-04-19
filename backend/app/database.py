"""
Database service for Life Context System.
Handles all SQLite operations with proper typing.
"""

import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Generator

from app.models import (
    Entity,
    Experiment,
    Metric,
    Observation,
    Project,
    Session,
)


DB_PATH = Path(__file__).parent.parent.parent / "context.db"


def dict_factory(cursor: sqlite3.Cursor, row: sqlite3.Row) -> dict[str, Any]:
    """Convert SQLite rows to dictionaries."""
    fields = [column[0] for column in cursor.description]
    return {field: row[idx] for idx, field in enumerate(fields)}


@contextmanager
def get_db() -> Generator[sqlite3.Connection, None, None]:
    """Get database connection with dict row factory."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = dict_factory
    try:
        yield conn
    finally:
        conn.close()


def parse_json_field(value: str | None) -> Any:
    """Parse JSON field from database, returning empty list/dict if None."""
    if value is None:
        return []
    try:
        return json.loads(value)
    except json.JSONDecodeError:
        return []


def serialize_json_field(value: Any) -> str:
    """Serialize value to JSON string."""
    return json.dumps(value)


# Entity operations
def get_entities(entity_type: str | None = None, status: str | None = None) -> list[Entity]:
    """Get entities with optional filtering."""
    with get_db() as conn:
        query = "SELECT * FROM entities WHERE 1=1"
        params: list[Any] = []

        if entity_type:
            query += " AND type = ?"
            params.append(entity_type)

        if status:
            query += " AND status = ?"
            params.append(status)

        query += " ORDER BY created_at DESC"

        cursor = conn.execute(query, params)
        rows = cursor.fetchall()

        return [
            Entity(
                id=row["id"],
                type=row["type"],
                name=row["name"],
                description=row["description"],
                status=row["status"],
                metadata=parse_json_field(row["metadata"]),
                created_at=datetime.fromisoformat(row["created_at"]),
                updated_at=datetime.fromisoformat(row["updated_at"]),
            )
            for row in rows
        ]


def get_entity(entity_id: str) -> Entity | None:
    """Get a single entity by ID."""
    with get_db() as conn:
        cursor = conn.execute("SELECT * FROM entities WHERE id = ?", (entity_id,))
        row = cursor.fetchone()

        if not row:
            return None

        return Entity(
            id=row["id"],
            type=row["type"],
            name=row["name"],
            description=row["description"],
            status=row["status"],
            metadata=parse_json_field(row["metadata"]),
            created_at=datetime.fromisoformat(row["created_at"]),
            updated_at=datetime.fromisoformat(row["updated_at"]),
        )


def create_entity(entity: dict[str, Any]) -> Entity:
    """Create a new entity."""
    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO entities (id, type, name, description, status, metadata, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                entity["id"],
                entity["type"],
                entity["name"],
                entity.get("description"),
                entity.get("status"),
                serialize_json_field(entity.get("metadata", {})),
                now,
                now,
            ),
        )
        conn.commit()

    result = get_entity(entity["id"])
    if result is None:
        raise ValueError("Failed to create entity")
    return result


def update_entity(entity_id: str, updates: dict[str, Any]) -> Entity:
    """Update an existing entity."""
    # First verify entity exists
    existing = get_entity(entity_id)
    if existing is None:
        raise ValueError(f"Entity {entity_id} not found")

    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    # Build update query dynamically based on provided fields
    update_fields: list[str] = []
    params: list[Any] = []

    if "name" in updates:
        update_fields.append("name = ?")
        params.append(updates["name"])

    if "description" in updates:
        update_fields.append("description = ?")
        params.append(updates["description"])

    if "status" in updates:
        update_fields.append("status = ?")
        params.append(updates["status"])

    if "metadata" in updates:
        update_fields.append("metadata = ?")
        params.append(serialize_json_field(updates["metadata"]))

    # Always update the updated_at timestamp
    update_fields.append("updated_at = ?")
    params.append(now)

    # Add entity_id for WHERE clause
    params.append(entity_id)

    query = f"UPDATE entities SET {', '.join(update_fields)} WHERE id = ?"

    with get_db() as conn:
        conn.execute(query, params)
        conn.commit()

    result = get_entity(entity_id)
    if result is None:
        raise ValueError("Failed to update entity")
    return result


def delete_entity(entity_id: str) -> None:
    """Delete an entity by ID."""
    # First verify entity exists
    existing = get_entity(entity_id)
    if existing is None:
        raise ValueError(f"Entity {entity_id} not found")

    with get_db() as conn:
        conn.execute("DELETE FROM entities WHERE id = ?", (entity_id,))
        conn.commit()


# Observation operations
def get_observations(
    status: str | None = None, obs_type: str | None = None, limit: int = 50
) -> list[Observation]:
    """Get observations with optional filtering."""
    with get_db() as conn:
        query = "SELECT * FROM observations WHERE 1=1"
        params: list[Any] = []

        if status:
            query += " AND status = ?"
            params.append(status)

        if obs_type:
            query += " AND type = ?"
            params.append(obs_type)

        query += " ORDER BY created_at DESC LIMIT ?"
        params.append(limit)

        cursor = conn.execute(query, params)
        rows = cursor.fetchall()

        return [
            Observation(
                id=row["id"],
                created_at=datetime.fromisoformat(row["created_at"]),
                session_id=row["session_id"],
                type=row["type"],
                content=row["content"],
                confidence=row["confidence"],
                evidence=parse_json_field(row["evidence"]),
                status=row["status"],
                related_entities=parse_json_field(row["related_entities"]),
                tags=parse_json_field(row["tags"]),
            )
            for row in rows
        ]


def create_observation(observation: dict[str, Any]) -> Observation:
    """Create a new observation."""
    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO observations (id, created_at, session_id, type, content, confidence, evidence, status, related_entities, tags)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                observation["id"],
                now,
                observation.get("session_id"),
                observation["type"],
                observation["content"],
                observation["confidence"],
                serialize_json_field(observation.get("evidence", [])),
                observation.get("status", "active"),
                serialize_json_field(observation.get("related_entities", [])),
                serialize_json_field(observation.get("tags", [])),
            ),
        )
        conn.commit()

    # Fetch and return the created observation
    cursor = conn.execute("SELECT * FROM observations WHERE id = ?", (observation["id"],))
    row = cursor.fetchone()

    return Observation(
        id=row["id"],
        created_at=datetime.fromisoformat(row["created_at"]),
        session_id=row["session_id"],
        type=row["type"],
        content=row["content"],
        confidence=row["confidence"],
        evidence=parse_json_field(row["evidence"]),
        status=row["status"],
        related_entities=parse_json_field(row["related_entities"]),
        tags=parse_json_field(row["tags"]),
    )


# Project operations
def get_projects(status: str | None = None) -> list[Project]:
    """Get projects with optional status filtering."""
    with get_db() as conn:
        query = "SELECT * FROM projects WHERE 1=1"
        params: list[Any] = []

        if status:
            query += " AND status = ?"
            params.append(status)

        query += " ORDER BY priority ASC, started_at DESC"

        cursor = conn.execute(query, params)
        rows = cursor.fetchall()

        return [
            Project(
                id=row["id"],
                name=row["name"],
                status=row["status"],
                priority=row["priority"],
                goal_alignment=parse_json_field(row["goal_alignment"]),
                started_at=datetime.fromisoformat(row["started_at"]),
                completed_at=datetime.fromisoformat(row["completed_at"]) if row["completed_at"] else None,
                current_phase=row["current_phase"],
                blockers=parse_json_field(row["blockers"]),
                next_action=row["next_action"],
                observations=parse_json_field(row["observations"]),
                notes=row["notes"],
            )
            for row in rows
        ]


# Session operations
def get_sessions(limit: int = 10) -> list[Session]:
    """Get recent sessions."""
    with get_db() as conn:
        cursor = conn.execute(
            "SELECT * FROM sessions ORDER BY started_at DESC LIMIT ?", (limit,)
        )
        rows = cursor.fetchall()

        return [
            Session(
                id=row["id"],
                started_at=datetime.fromisoformat(row["started_at"]),
                ended_at=datetime.fromisoformat(row["ended_at"]) if row["ended_at"] else None,
                summary=row["summary"],
                session_observations=row["session_observations"],
                action_items=parse_json_field(row["action_items"]),
                followup_needed=bool(row["followup_needed"]),
                followup_items=parse_json_field(row["followup_items"]),
            )
            for row in rows
        ]


def get_latest_session() -> Session | None:
    """Get the most recent session."""
    sessions = get_sessions(limit=1)
    return sessions[0] if sessions else None


# Experiment operations
def get_experiments(status: str | None = None) -> list[Experiment]:
    """Get experiments with optional status filtering."""
    with get_db() as conn:
        query = "SELECT * FROM experiments WHERE 1=1"
        params: list[Any] = []

        if status:
            query += " AND status = ?"
            params.append(status)

        query += " ORDER BY started_at DESC"

        cursor = conn.execute(query, params)
        rows = cursor.fetchall()

        return [
            Experiment(
                id=row["id"],
                hypothesis_id=row["hypothesis_id"],
                name=row["name"],
                started_at=datetime.fromisoformat(row["started_at"]),
                ended_at=datetime.fromisoformat(row["ended_at"]) if row["ended_at"] else None,
                status=row["status"],
                intervention=row["intervention"],
                success_criteria=row["success_criteria"],
                metrics_to_track=parse_json_field(row["metrics_to_track"]),
                outcome_summary=row["outcome_summary"],
                outcome_data=parse_json_field(row["outcome_data"]),
                related_projects=parse_json_field(row["related_projects"]),
            )
            for row in rows
        ]


# Metric operations
def get_metrics(
    metric_name: str | None = None, start_date: str | None = None, end_date: str | None = None
) -> list[Metric]:
    """Get metrics with optional filtering."""
    with get_db() as conn:
        query = "SELECT * FROM metrics WHERE 1=1"
        params: list[Any] = []

        if metric_name:
            query += " AND metric_name = ?"
            params.append(metric_name)

        if start_date:
            query += " AND date >= ?"
            params.append(start_date)

        if end_date:
            query += " AND date <= ?"
            params.append(end_date)

        query += " ORDER BY date DESC"

        cursor = conn.execute(query, params)
        rows = cursor.fetchall()

        return [
            Metric(
                date=row["date"],
                metric_name=row["metric_name"],
                value=row["value"],
                source=row["source"],
                metadata=parse_json_field(row["metadata"]),
            )
            for row in rows
        ]


