-- ═══════════════════════════════════════════════════════════════
-- ESa Project Schedule — Supabase Schema
-- Database: cfyijoveheyznubkyool (staffing project)
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Project schedule phases (one row per phase per project)
CREATE TABLE IF NOT EXISTS schedule_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_number TEXT NOT NULL,
  phase_code TEXT NOT NULL CHECK (phase_code IN ('PRE', 'SD', 'DD', 'CD', 'BID', 'CA')),
  phase_name TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  start_date DATE,
  end_date DATE,
  percent_complete INTEGER DEFAULT 0 CHECK (percent_complete >= 0 AND percent_complete <= 100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_number, phase_code)
);

-- Custom milestones (user-defined per project, tied to a phase)
CREATE TABLE IF NOT EXISTS schedule_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_number TEXT NOT NULL,
  phase_code TEXT CHECK (phase_code IN ('PRE', 'SD', 'DD', 'CD', 'BID', 'CA')),
  milestone_name TEXT NOT NULL,
  milestone_date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_schedule_phases_project ON schedule_phases(project_number);
CREATE INDEX IF NOT EXISTS idx_schedule_milestones_project ON schedule_milestones(project_number);
CREATE INDEX IF NOT EXISTS idx_schedule_milestones_phase ON schedule_milestones(project_number, phase_code);

-- Enable RLS
ALTER TABLE schedule_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_milestones ENABLE ROW LEVEL SECURITY;

-- Open read/write policies (auth handled at app level via role check)
CREATE POLICY "Public read schedule_phases" ON schedule_phases FOR SELECT USING (true);
CREATE POLICY "Public insert schedule_phases" ON schedule_phases FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update schedule_phases" ON schedule_phases FOR UPDATE USING (true);
CREATE POLICY "Public delete schedule_phases" ON schedule_phases FOR DELETE USING (true);

CREATE POLICY "Public read schedule_milestones" ON schedule_milestones FOR SELECT USING (true);
CREATE POLICY "Public insert schedule_milestones" ON schedule_milestones FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update schedule_milestones" ON schedule_milestones FOR UPDATE USING (true);
CREATE POLICY "Public delete schedule_milestones" ON schedule_milestones FOR DELETE USING (true);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_schedule_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_schedule_phases_updated
  BEFORE UPDATE ON schedule_phases
  FOR EACH ROW EXECUTE FUNCTION update_schedule_timestamp();

CREATE TRIGGER trg_schedule_milestones_updated
  BEFORE UPDATE ON schedule_milestones
  FOR EACH ROW EXECUTE FUNCTION update_schedule_timestamp();
