-- Life Context System Database Schema
-- SQLite database for tracking life management, observations, and context

-- Sessions: Track context sessions over time
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,  -- UUID or timestamp-based ID
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  summary TEXT,  -- Brief summary of what was discussed
  session_observations TEXT,  -- Session observations/notes
  action_items TEXT,  -- JSON array of things decided to do
  followup_needed BOOLEAN DEFAULT FALSE,
  followup_items TEXT  -- JSON array of things to check next time
);

-- Observations: Learned patterns, correlations, and insights
CREATE TABLE observations (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP NOT NULL,
  session_id TEXT,  -- Which session generated this observation
  type TEXT NOT NULL CHECK(type IN ('pattern', 'correlation', 'hypothesis', 'insight', 'preference')),
  content TEXT NOT NULL,  -- The actual observation
  confidence REAL CHECK(confidence >= 0 AND confidence <= 1),  -- 0-1 scale of confidence
  evidence TEXT,  -- JSON array of references (e.g., ["session:xyz", "metric:sleep"])
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'validated', 'refuted', 'outdated')),
  related_entities TEXT,  -- JSON: entity IDs this relates to
  tags TEXT,  -- JSON array for easy filtering
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Experiments: Interventions being tested
CREATE TABLE experiments (
  id TEXT PRIMARY KEY,
  hypothesis_id TEXT,  -- Link to observation that prompted this experiment
  name TEXT NOT NULL,
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'running' CHECK(status IN ('running', 'completed', 'abandoned')),
  intervention TEXT NOT NULL,  -- What is being tried
  success_criteria TEXT NOT NULL,  -- How to measure success
  metrics_to_track TEXT,  -- JSON array of metric names
  outcome_summary TEXT,  -- Human-readable result
  outcome_data TEXT,  -- JSON with actual measurements
  related_projects TEXT,  -- JSON array of project IDs
  FOREIGN KEY (hypothesis_id) REFERENCES observations(id)
);

-- Projects: Active initiatives and work
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('active', 'paused', 'completed', 'abandoned')),
  priority INTEGER CHECK(priority >= 1 AND priority <= 5),  -- 1=highest priority
  goal_alignment TEXT,  -- JSON array of goal entity IDs
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  current_phase TEXT,
  blockers TEXT,  -- JSON array of blocker descriptions
  next_action TEXT,
  observations TEXT,  -- JSON array of observation IDs
  notes TEXT
);

-- Metrics: Time-series life data
CREATE TABLE metrics (
  date DATE NOT NULL,
  metric_name TEXT NOT NULL,
  value REAL NOT NULL,
  source TEXT NOT NULL,
  metadata TEXT,  -- JSON for additional context (e.g., {"note": "rough night"})
  PRIMARY KEY (date, metric_name)
);

-- Entities: People, goals, systems, values, decisions, priorities, tools
CREATE TABLE entities (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('person', 'goal', 'system', 'value', 'decision', 'priority', 'tool')),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT,  -- Meaning varies by type (e.g., 'active', 'achieved' for goals)
  metadata TEXT,  -- JSON, flexible per entity type
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Indexes for common query patterns
CREATE INDEX idx_observations_status ON observations(status);
CREATE INDEX idx_observations_type ON observations(type);
CREATE INDEX idx_observations_session ON observations(session_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_metrics_date ON metrics(date);
CREATE INDEX idx_metrics_name ON metrics(metric_name);
CREATE INDEX idx_entities_type ON entities(type);
CREATE INDEX idx_entities_status ON entities(status);
CREATE INDEX idx_experiments_status ON experiments(status);
