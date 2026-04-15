import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from './supabase.js';

/* ═══════════════════════════════════════════════════════════
   AUTH WRAPPER
   ═══════════════════════════════════════════════════════════ */

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('Invalid email or password.');
    } else {
      onLogin();
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0f1117', fontFamily: "'DM Sans', -apple-system, sans-serif"
    }}>
      <div style={{
        background: '#1a1d27', border: '1px solid #2e3340', borderRadius: 12,
        padding: '40px 36px', width: 360,
      }}>
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <div style={{
            fontSize: 22, fontWeight: 700, letterSpacing: '-0.3px',
            background: 'linear-gradient(135deg, #8b5cf6, #d946ef)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 4
          }}>ESa Schedule</div>
          <div style={{ color: '#8b8fa3', fontSize: 13 }}>Sign in to continue</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', color: '#8b8fa3', fontSize: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              required autoFocus
              style={{
                width: '100%', padding: '10px 12px', background: '#232733',
                border: '1px solid #2e3340', borderRadius: 8, color: '#e8eaed',
                fontSize: 14, outline: 'none'
              }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', color: '#8b8fa3', fontSize: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%', padding: '10px 12px', background: '#232733',
                border: '1px solid #2e3340', borderRadius: 8, color: '#e8eaed',
                fontSize: 14, outline: 'none'
              }}
            />
          </div>

          {error && (
            <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 14, textAlign: 'center' }}>{error}</div>
          )}

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '11px', background: 'linear-gradient(135deg, #8b5cf6, #d946ef)',
              border: 'none', borderRadius: 8, color: '#fff', fontSize: 14,
              fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export function AuthWrapper() {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return null; // still checking session
  if (!session) return <LoginScreen onLogin={() => {}} />;
  return <App />;
}


/* ═══════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════ */

const PHASES = [
  { code: 'PRE', name: 'Pre-Design', sort: 1, color: '#6366f1' },
  { code: 'SD',  name: 'Schematic Design', sort: 2, color: '#8b5cf6' },
  { code: 'DD',  name: 'Design Development', sort: 3, color: '#a855f7' },
  { code: 'CD',  name: 'Construction Documents', sort: 4, color: '#d946ef' },
  { code: 'BID', name: 'Bidding', sort: 5, color: '#ec4899' },
  { code: 'CA',  name: 'Construction Administration', sort: 6, color: '#f43f5e' },
];

const PHASE_MAP = Object.fromEntries(PHASES.map(p => [p.code, p]));

/* ═══════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════ */

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0f1117;
    --surface: #1a1d27;
    --surface2: #232733;
    --border: #2e3340;
    --border-hover: #3d4255;
    --text: #e8eaed;
    --text-dim: #8b8fa3;
    --text-muted: #5a5e72;
    --accent: #8b5cf6;
    --accent-dim: rgba(139, 92, 246, 0.15);
    --success: #22c55e;
    --warning: #f59e0b;
    --danger: #ef4444;
    --today: #22c55e;
    --radius: 8px;
    --radius-lg: 12px;
    --font: 'DM Sans', -apple-system, sans-serif;
    --mono: 'JetBrains Mono', monospace;
  }

  body {
    font-family: var(--font);
    background: var(--bg);
    color: var(--text);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  /* Layout */
  .app { max-width: 1400px; margin: 0 auto; padding: 24px; }

  .header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 32px; padding-bottom: 20px;
    border-bottom: 1px solid var(--border);
  }
  .header h1 {
    font-size: 22px; font-weight: 600; letter-spacing: -0.3px;
    display: flex; align-items: center; gap: 10px;
  }
  .header h1 span.logo {
    background: linear-gradient(135deg, var(--accent), #d946ef);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    font-weight: 700;
  }
  .header-right { display: flex; align-items: center; gap: 16px; }

  .user-badge {
    display: flex; align-items: center; gap: 8px;
    background: var(--surface); border: 1px solid var(--border);
    padding: 6px 14px; border-radius: 20px; font-size: 13px;
  }
  .user-badge .role-tag {
    font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px;
    padding: 2px 6px; border-radius: 4px; font-weight: 600;
    background: var(--accent-dim); color: var(--accent);
  }

  /* Cards */
  .card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 24px; margin-bottom: 20px;
  }
  .card h2 {
    font-size: 15px; font-weight: 600; margin-bottom: 16px;
    color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px;
  }

  /* Project Selector */
  .project-selector {
    display: flex; gap: 12px; align-items: center; flex-wrap: wrap;
  }
  .project-selector select, .project-selector .user-select {
    background: var(--surface2); border: 1px solid var(--border);
    color: var(--text); padding: 10px 14px; border-radius: var(--radius);
    font-family: var(--font); font-size: 14px; min-width: 280px;
    cursor: pointer; outline: none; transition: border-color 0.15s;
  }
  .project-selector select:hover, .project-selector .user-select:hover {
    border-color: var(--border-hover);
  }
  .project-selector select:focus, .project-selector .user-select:focus {
    border-color: var(--accent);
  }

  /* Phase Editor Table */
  .phase-table { width: 100%; border-collapse: collapse; }
  .phase-table th {
    text-align: left; padding: 8px 12px; font-size: 11px;
    text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted);
    border-bottom: 1px solid var(--border);
  }
  .phase-table td {
    padding: 10px 12px; border-bottom: 1px solid var(--border);
    font-size: 14px; vertical-align: middle;
  }
  .phase-table tr:last-child td { border-bottom: none; }
  .phase-table .phase-dot {
    width: 10px; height: 10px; border-radius: 50%; display: inline-block;
    margin-right: 8px; vertical-align: middle;
  }

  .phase-table input[type="date"], .phase-table input[type="number"] {
    background: var(--surface2); border: 1px solid var(--border);
    color: var(--text); padding: 6px 10px; border-radius: 6px;
    font-family: var(--mono); font-size: 13px; outline: none;
    transition: border-color 0.15s;
  }
  .phase-table input:hover { border-color: var(--border-hover); }
  .phase-table input:focus { border-color: var(--accent); }
  .phase-table input[type="number"] { width: 60px; text-align: center; }
  .phase-table input:disabled {
    opacity: 0.4; cursor: not-allowed;
  }

  /* Progress bar in table */
  .progress-cell { display: flex; align-items: center; gap: 8px; }
  .progress-track {
    flex: 1; height: 6px; background: var(--surface2);
    border-radius: 3px; overflow: hidden; min-width: 60px;
  }
  .progress-fill {
    height: 100%; border-radius: 3px; transition: width 0.3s ease;
  }
  .progress-label { font-size: 12px; color: var(--text-dim); font-family: var(--mono); min-width: 32px; }

  /* Duration display */
  .duration-display {
    font-size: 12px; color: var(--text-muted); font-family: var(--mono);
  }

  /* Gantt Chart */
  .gantt-container {
    overflow-x: auto; position: relative;
    scrollbar-width: thin; scrollbar-color: var(--border) transparent;
  }
  .gantt-container::-webkit-scrollbar { height: 8px; }
  .gantt-container::-webkit-scrollbar-track { background: transparent; }
  .gantt-container::-webkit-scrollbar-thumb {
    background: var(--border); border-radius: 4px;
  }

  .gantt {
    position: relative; min-height: 300px;
  }

  .gantt-header {
    display: flex; border-bottom: 1px solid var(--border);
    position: sticky; top: 0; background: var(--surface); z-index: 2;
  }
  .gantt-month {
    text-align: center; font-size: 11px; font-weight: 500;
    color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px;
    padding: 8px 0; border-right: 1px solid var(--border);
  }
  .gantt-month:last-child { border-right: none; }

  .gantt-body { position: relative; }

  .gantt-row {
    display: flex; align-items: center; height: 44px;
    border-bottom: 1px solid var(--border); position: relative;
  }
  .gantt-row:last-child { border-bottom: none; }
  .gantt-label {
    width: 200px; min-width: 200px; padding: 0 16px;
    font-size: 13px; font-weight: 500; display: flex;
    align-items: center; gap: 8px; z-index: 1;
    background: var(--surface);
  }
  .gantt-track {
    flex: 1; height: 100%; position: relative;
  }
  .gantt-bar {
    position: absolute; height: 24px; top: 10px;
    border-radius: 4px; opacity: 0.85;
    transition: opacity 0.15s;
    cursor: default;
  }
  .gantt-bar:hover { opacity: 1; }
  .gantt-bar-progress {
    position: absolute; left: 0; top: 0; bottom: 0;
    border-radius: 4px; opacity: 0.4;
  }
  .gantt-bar-label {
    position: absolute; left: 8px; top: 50%; transform: translateY(-50%);
    font-size: 11px; font-weight: 600; color: white;
    white-space: nowrap; text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  }

  /* Today line */
  .gantt-today {
    position: absolute; top: 0; bottom: 0; width: 2px;
    background: var(--today); z-index: 3;
    pointer-events: none;
  }
  .gantt-today::before {
    content: 'TODAY'; position: absolute; top: -22px;
    left: 50%; transform: translateX(-50%);
    font-size: 9px; font-weight: 700; letter-spacing: 0.5px;
    color: var(--today); white-space: nowrap;
  }

  /* Milestone diamond */
  .gantt-milestone {
    position: absolute; top: 50%; width: 14px; height: 14px;
    transform: translate(-50%, -50%) rotate(45deg);
    border: 2px solid #f59e0b; background: var(--surface);
    z-index: 2; cursor: default; transition: all 0.15s;
  }
  .gantt-milestone.completed {
    background: #f59e0b; border-color: #f59e0b;
  }
  .gantt-milestone:hover { transform: translate(-50%, -50%) rotate(45deg) scale(1.3); }

  .gantt-milestone-tooltip {
    position: absolute; bottom: calc(100% + 8px); left: 50%;
    transform: translateX(-50%); background: var(--surface2);
    border: 1px solid var(--border); padding: 6px 10px;
    border-radius: 6px; font-size: 11px; white-space: nowrap;
    pointer-events: none; opacity: 0; transition: opacity 0.15s;
    z-index: 10;
  }
  .gantt-milestone:hover .gantt-milestone-tooltip { opacity: 1; }

  /* Grid lines */
  .gantt-gridline {
    position: absolute; top: 0; bottom: 0; width: 1px;
    background: var(--border); opacity: 0.3; pointer-events: none;
  }

  /* Milestones Editor */
  .milestone-list { display: flex; flex-direction: column; gap: 8px; }
  .milestone-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; background: var(--surface2);
    border: 1px solid var(--border); border-radius: var(--radius);
  }
  .milestone-item input[type="text"] {
    flex: 1; background: transparent; border: none;
    color: var(--text); font-family: var(--font); font-size: 14px;
    outline: none;
  }
  .milestone-item input[type="text"]::placeholder { color: var(--text-muted); }
  .milestone-item input[type="date"] {
    background: var(--surface); border: 1px solid var(--border);
    color: var(--text); padding: 4px 8px; border-radius: 6px;
    font-family: var(--mono); font-size: 13px; outline: none;
  }
  .milestone-item select {
    background: var(--surface); border: 1px solid var(--border);
    color: var(--text); padding: 4px 8px; border-radius: 6px;
    font-family: var(--font); font-size: 13px; outline: none;
  }
  .milestone-item input:disabled, .milestone-item select:disabled {
    opacity: 0.4; cursor: not-allowed;
  }

  .milestone-diamond {
    width: 12px; height: 12px; transform: rotate(45deg);
    border: 2px solid #f59e0b; flex-shrink: 0;
  }
  .milestone-diamond.completed { background: #f59e0b; }

  /* Buttons */
  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: var(--radius);
    font-family: var(--font); font-size: 13px; font-weight: 500;
    cursor: pointer; border: none; transition: all 0.15s;
    outline: none;
  }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-primary {
    background: var(--accent); color: white;
  }
  .btn-primary:hover:not(:disabled) { background: #7c3aed; }
  .btn-ghost {
    background: transparent; color: var(--text-dim);
    border: 1px solid var(--border);
  }
  .btn-ghost:hover:not(:disabled) {
    background: var(--surface2); color: var(--text);
  }
  .btn-danger {
    background: transparent; color: var(--danger);
    border: 1px solid transparent;
  }
  .btn-danger:hover:not(:disabled) { background: rgba(239,68,68,0.1); }
  .btn-sm { padding: 4px 10px; font-size: 12px; }

  .btn-group { display: flex; gap: 8px; margin-top: 12px; }

  /* Checkbox */
  .checkbox-wrap {
    display: flex; align-items: center; cursor: pointer;
  }
  .checkbox-wrap input { display: none; }
  .checkbox-box {
    width: 16px; height: 16px; border: 2px solid var(--border);
    border-radius: 4px; display: flex; align-items: center;
    justify-content: center; transition: all 0.15s;
  }
  .checkbox-wrap input:checked + .checkbox-box {
    background: var(--accent); border-color: var(--accent);
  }
  .checkbox-wrap input:disabled + .checkbox-box {
    opacity: 0.4; cursor: not-allowed;
  }
  .check-icon { color: white; font-size: 11px; font-weight: 700; }

  /* Status bar */
  .status-bar {
    display: flex; align-items: center; gap: 16px; padding: 10px 16px;
    background: var(--surface2); border-radius: var(--radius);
    font-size: 12px; color: var(--text-dim); margin-bottom: 20px;
  }
  .status-dot {
    width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
  }

  /* Empty state */
  .empty-state {
    text-align: center; padding: 60px 20px; color: var(--text-muted);
  }
  .empty-state p { font-size: 15px; margin-bottom: 8px; }
  .empty-state .sub { font-size: 13px; }

  /* Saving indicator */
  .save-indicator {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px; color: var(--text-muted);
  }
  .save-indicator.saving { color: var(--warning); }
  .save-indicator.saved { color: var(--success); }
  .save-indicator.error { color: var(--danger); }

  /* Responsive */
  @media (max-width: 768px) {
    .app { padding: 16px; }
    .header { flex-direction: column; gap: 12px; align-items: flex-start; }
    .project-selector { flex-direction: column; }
    .project-selector select, .project-selector .user-select { min-width: 100%; }
    .gantt-label { width: 140px; min-width: 140px; font-size: 12px; }
  }
`;

/* ═══════════════════════════════════════════════════════════
   UTILITY FUNCTIONS
   ═══════════════════════════════════════════════════════════ */

function daysBetween(d1, d2) {
  const a = new Date(d1 + 'T00:00:00');
  const b = new Date(d2 + 'T00:00:00');
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getMonthsBetween(startDate, endDate) {
  const months = [];
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cursor <= end) {
    const monthStart = new Date(cursor);
    cursor.setMonth(cursor.getMonth() + 1);
    const monthEnd = new Date(cursor);
    monthEnd.setDate(monthEnd.getDate() - 1);
    months.push({
      label: monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      start: monthStart,
      end: monthEnd,
    });
  }
  return months;
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function getCurrentPhase(phases) {
  const today = todayStr();
  for (const p of phases) {
    if (p.start_date && p.end_date && p.start_date <= today && today <= p.end_date) {
      return p.phase_code;
    }
  }
  // If past all phases, return last one with dates
  const withDates = phases.filter(p => p.end_date);
  if (withDates.length && withDates[withDates.length - 1].end_date < today) {
    return withDates[withDates.length - 1].phase_code;
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════
   GANTT CHART COMPONENT
   ═══════════════════════════════════════════════════════════ */

function GanttChart({ phases, milestones }) {
  const phasesWithDates = phases.filter(p => p.start_date && p.end_date);

  if (phasesWithDates.length === 0) {
    return (
      <div className="empty-state">
        <p>No phases scheduled yet</p>
        <div className="sub">Add start and end dates to see the Gantt chart</div>
      </div>
    );
  }

  // Calculate timeline range — pad 2 weeks on each side
  const allDates = phasesWithDates.flatMap(p => [p.start_date, p.end_date]);
  milestones.forEach(m => { if (m.milestone_date) allDates.push(m.milestone_date); });
  allDates.push(todayStr());

  const minDate = addDays(allDates.sort()[0], -14);
  const maxDate = addDays(allDates.sort()[allDates.length - 1], 14);
  const totalDays = daysBetween(minDate, maxDate);
  const pxPerDay = Math.max(4, Math.min(12, 1200 / totalDays));
  const totalWidth = totalDays * pxPerDay;
  const months = getMonthsBetween(minDate, maxDate);

  const getX = (dateStr) => {
    return daysBetween(minDate, dateStr) * pxPerDay;
  };

  const today = todayStr();
  const todayX = getX(today);

  return (
    <div className="gantt-container">
      <div className="gantt" style={{ width: totalWidth + 200 }}>
        {/* Month headers */}
        <div className="gantt-header">
          <div style={{ width: 200, minWidth: 200 }} />
          <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
            {months.map((m, i) => {
              const mStartDate = m.start.toISOString().split('T')[0];
              const mEndDate = m.end.toISOString().split('T')[0];
              const clampedStart = mStartDate < minDate ? minDate : mStartDate;
              const clampedEnd = mEndDate > maxDate ? maxDate : mEndDate;
              const w = daysBetween(clampedStart, clampedEnd) * pxPerDay;
              return (
                <div key={i} className="gantt-month" style={{ width: w }}>
                  {m.label}
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="gantt-body">
          {/* Grid lines (month boundaries) */}
          {months.map((m, i) => {
            const mStartDate = m.start.toISOString().split('T')[0];
            if (mStartDate >= minDate && mStartDate <= maxDate) {
              return (
                <div key={`grid-${i}`} className="gantt-gridline"
                  style={{ left: 200 + getX(mStartDate) }} />
              );
            }
            return null;
          })}

          {/* Today line */}
          {today >= minDate && today <= maxDate && (
            <div className="gantt-today" style={{ left: 200 + todayX }} />
          )}

          {/* Phase rows */}
          {PHASES.map(pDef => {
            const phase = phasesWithDates.find(p => p.phase_code === pDef.code);
            const phaseMilestones = milestones.filter(m =>
              m.phase_code === pDef.code && m.milestone_date
            );

            return (
              <div key={pDef.code} className="gantt-row">
                <div className="gantt-label">
                  <span className="phase-dot" style={{ background: pDef.color }} />
                  {pDef.name}
                </div>
                <div className="gantt-track">
                  {phase && (
                    <div className="gantt-bar"
                      style={{
                        left: getX(phase.start_date),
                        width: Math.max(daysBetween(phase.start_date, phase.end_date) * pxPerDay, 4),
                        background: `${pDef.color}55`,
                        border: `1px solid ${pDef.color}`,
                      }}
                    >
                      {/* Progress fill */}
                      <div className="gantt-bar-progress"
                        style={{
                          width: `${phase.percent_complete || 0}%`,
                          background: pDef.color,
                        }}
                      />
                      {daysBetween(phase.start_date, phase.end_date) * pxPerDay > 60 && (
                        <span className="gantt-bar-label">
                          {phase.percent_complete || 0}%
                        </span>
                      )}
                    </div>
                  )}
                  {/* Milestones in this phase */}
                  {phaseMilestones.map(m => (
                    <div key={m.id} className={`gantt-milestone ${m.is_completed ? 'completed' : ''}`}
                      style={{ left: getX(m.milestone_date) }}
                    >
                      <div className="gantt-milestone-tooltip">
                        {m.milestone_name} — {formatShortDate(m.milestone_date)}
                        {m.is_completed ? ' ✓' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Unphased milestones row */}
          {milestones.filter(m => !m.phase_code && m.milestone_date).length > 0 && (
            <div className="gantt-row">
              <div className="gantt-label" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                ◆ Project Milestones
              </div>
              <div className="gantt-track">
                {milestones.filter(m => !m.phase_code && m.milestone_date).map(m => (
                  <div key={m.id} className={`gantt-milestone ${m.is_completed ? 'completed' : ''}`}
                    style={{ left: getX(m.milestone_date) }}
                  >
                    <div className="gantt-milestone-tooltip">
                      {m.milestone_name} — {formatShortDate(m.milestone_date)}
                      {m.is_completed ? ' ✓' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PHASE EDITOR COMPONENT
   ═══════════════════════════════════════════════════════════ */

function PhaseEditor({ phases, canEdit, onUpdate }) {
  const handleChange = (phaseCode, field, value) => {
    onUpdate(phaseCode, field, value);
  };

  return (
    <table className="phase-table">
      <thead>
        <tr>
          <th>Phase</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th>Duration</th>
          <th>Progress</th>
        </tr>
      </thead>
      <tbody>
        {PHASES.map(pDef => {
          const phase = phases.find(p => p.phase_code === pDef.code) || {};
          const duration = phase.start_date && phase.end_date
            ? daysBetween(phase.start_date, phase.end_date)
            : null;
          const weeks = duration !== null ? (duration / 7).toFixed(1) : null;

          return (
            <tr key={pDef.code}>
              <td>
                <span className="phase-dot" style={{ background: pDef.color }} />
                {pDef.name}
              </td>
              <td>
                <input type="date"
                  value={phase.start_date || ''}
                  disabled={!canEdit}
                  onChange={e => handleChange(pDef.code, 'start_date', e.target.value || null)}
                />
              </td>
              <td>
                <input type="date"
                  value={phase.end_date || ''}
                  disabled={!canEdit}
                  onChange={e => handleChange(pDef.code, 'end_date', e.target.value || null)}
                />
              </td>
              <td>
                <span className="duration-display">
                  {duration !== null ? `${duration}d (${weeks}w)` : '—'}
                </span>
              </td>
              <td>
                <div className="progress-cell">
                  <input type="number" min="0" max="100"
                    value={phase.percent_complete ?? 0}
                    disabled={!canEdit}
                    onChange={e => handleChange(pDef.code, 'percent_complete',
                      Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                    )}
                  />
                  <div className="progress-track">
                    <div className="progress-fill"
                      style={{
                        width: `${phase.percent_complete || 0}%`,
                        background: pDef.color,
                      }}
                    />
                  </div>
                  <span className="progress-label">{phase.percent_complete || 0}%</span>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/* ═══════════════════════════════════════════════════════════
   MILESTONE EDITOR COMPONENT
   ═══════════════════════════════════════════════════════════ */

function MilestoneEditor({ milestones, canEdit, onAdd, onUpdate, onDelete }) {
  return (
    <div>
      <div className="milestone-list">
        {milestones.map(m => (
          <div key={m.id} className="milestone-item">
            <div className={`milestone-diamond ${m.is_completed ? 'completed' : ''}`} />
            <input type="text"
              value={m.milestone_name}
              placeholder="Milestone name..."
              disabled={!canEdit}
              onChange={e => onUpdate(m.id, 'milestone_name', e.target.value)}
            />
            <select value={m.phase_code || ''}
              disabled={!canEdit}
              onChange={e => onUpdate(m.id, 'phase_code', e.target.value || null)}
            >
              <option value="">No phase</option>
              {PHASES.map(p => (
                <option key={p.code} value={p.code}>{p.name}</option>
              ))}
            </select>
            <input type="date"
              value={m.milestone_date || ''}
              disabled={!canEdit}
              onChange={e => onUpdate(m.id, 'milestone_date', e.target.value)}
            />
            <label className="checkbox-wrap">
              <input type="checkbox"
                checked={m.is_completed || false}
                disabled={!canEdit}
                onChange={e => onUpdate(m.id, 'is_completed', e.target.checked)}
              />
              <span className="checkbox-box">
                {m.is_completed && <span className="check-icon">✓</span>}
              </span>
            </label>
            {canEdit && (
              <button className="btn btn-danger btn-sm"
                onClick={() => onDelete(m.id)}>✕</button>
            )}
          </div>
        ))}
        {milestones.length === 0 && (
          <div style={{ padding: 16, color: 'var(--text-muted)', fontSize: 13 }}>
            No milestones yet{canEdit ? ' — add one below' : ''}
          </div>
        )}
      </div>
      {canEdit && (
        <div className="btn-group">
          <button className="btn btn-ghost" onClick={onAdd}>+ Add Milestone</button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════ */

export default function App() {
  // State
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentUser, setCurrentUser] = useState('');
  const [phases, setPhases] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved | error
  const [loading, setLoading] = useState(true);

  const saveTimeout = useRef(null);

  // Derived: can edit?
  const canEdit = useMemo(() => {
    if (!currentUser || !selectedProject) return false;
    const proj = projects.find(p => p.project_number === selectedProject);
    if (!proj) return false;
    const userLower = currentUser.toLowerCase();
    return [proj.pm, proj.dm, proj.principal].some(
      role => role && role.toLowerCase() === userLower
    );
  }, [currentUser, selectedProject, projects]);

  const userRole = useMemo(() => {
    if (!currentUser || !selectedProject) return null;
    const proj = projects.find(p => p.project_number === selectedProject);
    if (!proj) return null;
    const userLower = currentUser.toLowerCase();
    if (proj.principal && proj.principal.toLowerCase() === userLower) return 'Principal';
    if (proj.dm && proj.dm.toLowerCase() === userLower) return 'DM';
    if (proj.pm && proj.pm.toLowerCase() === userLower) return 'PM';
    return null;
  }, [currentUser, selectedProject, projects]);

  // Load projects & employees on mount
  useEffect(() => {
    async function load() {
      setLoading(true);
      const [projRes, empRes] = await Promise.all([
        supabase.from('projects').select('*').order('project_number'),
        supabase.from('employees').select('name').order('name'),
      ]);
      if (projRes.data) setProjects(projRes.data);
      if (empRes.data) setEmployees(empRes.data.map(e => e.name).filter(Boolean));
      setLoading(false);
    }
    load();
  }, []);

  // Load schedule when project changes
  useEffect(() => {
    if (!selectedProject) {
      setPhases([]);
      setMilestones([]);
      return;
    }

    async function loadSchedule() {
      const [phaseRes, msRes] = await Promise.all([
        supabase.from('schedule_phases')
          .select('*')
          .eq('project_number', selectedProject)
          .order('sort_order'),
        supabase.from('schedule_milestones')
          .select('*')
          .eq('project_number', selectedProject)
          .order('milestone_date'),
      ]);

      let loadedPhases = phaseRes.data || [];

      // Ensure all 6 phases exist for this project
      const existingCodes = new Set(loadedPhases.map(p => p.phase_code));
      const missingPhases = PHASES.filter(p => !existingCodes.has(p.code));

      if (missingPhases.length > 0) {
        const toInsert = missingPhases.map(p => ({
          project_number: selectedProject,
          phase_code: p.code,
          phase_name: p.name,
          sort_order: p.sort,
          percent_complete: 0,
        }));
        const { data: inserted } = await supabase
          .from('schedule_phases')
          .insert(toInsert)
          .select();
        if (inserted) loadedPhases = [...loadedPhases, ...inserted];
      }

      loadedPhases.sort((a, b) => a.sort_order - b.sort_order);
      setPhases(loadedPhases);
      setMilestones(msRes.data || []);
    }

    loadSchedule();
  }, [selectedProject]);

  // Auto-save with debounce
  const debouncedSave = useCallback((table, id, updates) => {
    setSaveStatus('saving');
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      const { error } = await supabase.from(table).update(updates).eq('id', id);
      setSaveStatus(error ? 'error' : 'saved');
      if (!error) {
        setTimeout(() => setSaveStatus(prev => prev === 'saved' ? 'idle' : prev), 2000);
      }
    }, 600);
  }, []);

  // Phase update handler
  const handlePhaseUpdate = useCallback((phaseCode, field, value) => {
    setPhases(prev => {
      const updated = prev.map(p =>
        p.phase_code === phaseCode ? { ...p, [field]: value } : p
      );
      const phase = updated.find(p => p.phase_code === phaseCode);
      if (phase) debouncedSave('schedule_phases', phase.id, { [field]: value });
      return updated;
    });
  }, [debouncedSave]);

  // Milestone handlers
  const handleAddMilestone = useCallback(async () => {
    const newMs = {
      project_number: selectedProject,
      phase_code: null,
      milestone_name: '',
      milestone_date: todayStr(),
      is_completed: false,
    };
    const { data, error } = await supabase
      .from('schedule_milestones')
      .insert(newMs)
      .select()
      .single();
    if (data) setMilestones(prev => [...prev, data]);
  }, [selectedProject]);

  const handleMilestoneUpdate = useCallback((id, field, value) => {
    setMilestones(prev =>
      prev.map(m => m.id === id ? { ...m, [field]: value } : m)
    );
    debouncedSave('schedule_milestones', id, { [field]: value });
  }, [debouncedSave]);

  const handleMilestoneDelete = useCallback(async (id) => {
    await supabase.from('schedule_milestones').delete().eq('id', id);
    setMilestones(prev => prev.filter(m => m.id !== id));
  }, []);

  // Current phase indicator
  const currentPhaseCode = useMemo(() => getCurrentPhase(phases), [phases]);
  const currentPhase = currentPhaseCode ? PHASE_MAP[currentPhaseCode] : null;

  const selectedProjectData = projects.find(p => p.project_number === selectedProject);

  if (loading) {
    return (
      <div className="app">
        <style>{CSS}</style>
        <div className="empty-state">
          <p>Loading ESa Schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <style>{CSS}</style>

      {/* Header */}
      <div className="header">
        <h1>
          <span className="logo">ESa</span> Schedule
        </h1>
        <div className="header-right">
          {saveStatus !== 'idle' && (
            <div className={`save-indicator ${saveStatus}`}>
              {saveStatus === 'saving' && '● Saving...'}
              {saveStatus === 'saved' && '✓ Saved'}
              {saveStatus === 'error' && '✕ Save failed'}
            </div>
          )}
          {currentUser && selectedProject && (
            <div className="user-badge">
              {currentUser}
              {userRole ? (
                <span className="role-tag">{userRole} — Can Edit</span>
              ) : (
                <span className="role-tag" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)' }}>
                  View Only
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Project & User Selection */}
      <div className="card">
        <div className="project-selector">
          <select value={currentUser}
            onChange={e => setCurrentUser(e.target.value)}
            className="user-select"
          >
            <option value="">Select your name...</option>
            {employees.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <select value={selectedProject || ''}
            onChange={e => setSelectedProject(e.target.value || null)}
          >
            <option value="">Select a project...</option>
            {projects.map(p => (
              <option key={p.project_number} value={p.project_number}>
                {p.project_number} — {p.project_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedProject ? (
        <div className="empty-state">
          <p>Select a project to view or edit its schedule</p>
          <div className="sub">{projects.length} projects available</div>
        </div>
      ) : (
        <>
          {/* Status Bar */}
          <div className="status-bar">
            <span style={{ fontWeight: 600, color: 'var(--text)' }}>
              {selectedProjectData?.project_name}
            </span>
            <span>|</span>
            <span>PM: {selectedProjectData?.pm || '—'}</span>
            <span>DM: {selectedProjectData?.dm || '—'}</span>
            <span>Principal: {selectedProjectData?.principal || '—'}</span>
            {currentPhase && (
              <>
                <span>|</span>
                <span className="status-dot" style={{ background: currentPhase.color }} />
                <span style={{ color: currentPhase.color, fontWeight: 500 }}>
                  Currently in {currentPhase.name}
                </span>
              </>
            )}
          </div>

          {/* Gantt Chart */}
          <div className="card">
            <h2>Project Timeline</h2>
            <GanttChart phases={phases} milestones={milestones} />
          </div>

          {/* Phase Editor */}
          <div className="card">
            <h2>Phases</h2>
            <PhaseEditor
              phases={phases}
              canEdit={canEdit}
              onUpdate={handlePhaseUpdate}
            />
          </div>

          {/* Milestones */}
          <div className="card">
            <h2>Milestones</h2>
            <MilestoneEditor
              milestones={milestones}
              canEdit={canEdit}
              onAdd={handleAddMilestone}
              onUpdate={handleMilestoneUpdate}
              onDelete={handleMilestoneDelete}
            />
          </div>
        </>
      )}
    </div>
  );
}
