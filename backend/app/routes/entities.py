"""
Entity CRUD routes.
"""

from fastapi import APIRouter, HTTPException

from app import database
from app.models import Entity, EntityCreate, EntityUpdate

router = APIRouter(prefix="/entities", tags=["entities"])


@router.get("", response_model=list[Entity])
def list_entities(type: str | None = None, status: str | None = None) -> list[Entity]:
    """List all entities with optional filtering by type and status."""
    return database.get_entities(entity_type=type, status=status)


@router.get("/{entity_id}", response_model=Entity)
def get_entity(entity_id: str) -> Entity:
    """Get a single entity by ID."""
    entity = database.get_entity(entity_id)
    if entity is None:
        raise HTTPException(status_code=404, detail=f"Entity {entity_id} not found")
    return entity


@router.post("", response_model=Entity, status_code=201)
def create_entity(entity: EntityCreate) -> Entity:
    """Create a new entity."""
    return database.create_entity(entity.model_dump())


@router.put("/{entity_id}", response_model=Entity)
def update_entity(entity_id: str, entity_update: EntityUpdate) -> Entity:
    """Update an existing entity."""
    # Filter out None values to only update provided fields
    updates = {k: v for k, v in entity_update.model_dump().items() if v is not None}

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    try:
        return database.update_entity(entity_id, updates)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{entity_id}", status_code=204)
def delete_entity(entity_id: str) -> None:
    """Delete an entity."""
    try:
        database.delete_entity(entity_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
