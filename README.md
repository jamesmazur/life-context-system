# Life Context System

A local life-tracking system with a SQLite database, FastAPI backend, and Next.js web UI.

## Maintenance Mode

This project is currently in **maintenance mode** and is intended to be used through the web application.

- ✅ Use the web UI for day-to-day interaction
- ✅ Keep backend/frontend running locally

## Architecture

```
Life Context System
├── context.db              # SQLite data store
├── schema.sql              # Database schema
├── backend/                # FastAPI API layer
└── frontend/               # Next.js web app
```

## Run Locally

### Backend

```bash
cd backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
node ./node_modules/next/dist/bin/next dev -H 0.0.0.0 -p 3000
```

Open:
- Frontend: http://localhost:3000
- Backend docs: http://localhost:8000/docs

## Main API Endpoints Used by the UI

- Dashboard composes data from `projects`, `observations`, `experiments`, and `sessions` endpoints
- `GET /entities` - List entities
- `POST /entities` - Create entity
- `PUT /entities/{entity_id}` - Update entity
- `DELETE /entities/{entity_id}` - Delete entity
- `GET /observations`
- `GET /projects`
- `GET /experiments`
- `GET /metrics`
- `GET /sessions`

## Notes

- Data is local and private (`context.db` is gitignored).
