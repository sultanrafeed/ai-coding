-- Enable pgvector extension for embeddings (if using pgvector instead of Qdrant)
CREATE EXTENSION IF NOT EXISTS vector;

-- Users (synced from Clerk)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  username TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Problems
CREATE TABLE IF NOT EXISTS problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) NOT NULL,
  description_html TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  constraints JSONB DEFAULT '{}',
  examples JSONB DEFAULT '[]',
  test_cases JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submissions
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  problem_id UUID REFERENCES problems(id),
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  result JSONB,
  judge0_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI interactions (for logging + DPO data collection)
CREATE TABLE IF NOT EXISTS ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES submissions(id),
  interaction_type TEXT NOT NULL, -- hint, explain_error, complexity, code_review
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  model TEXT NOT NULL,
  latency_ms INTEGER,
  feedback SMALLINT, -- 1 thumbs up, -1 thumbs down, NULL no feedback
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skill assessments
CREATE TABLE IF NOT EXISTS skill_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tag TEXT NOT NULL, -- e.g. "dynamic-programming", "graphs", "two-pointers"
  score FLOAT DEFAULT 0.0,
  problems_attempted INTEGER DEFAULT 0,
  problems_solved INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS skill_assessments_user_tag ON skill_assessments(user_id, tag);
