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
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return null;
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
const PHASE_SORT = Object.fromEntries(PHASES.map(p => [p.code, p.sort]));
const PHASE_PREFIX = { PRE: 'PD', SD: 'SD', DD: 'DD', CD: 'CD', BID: 'BD', CA: 'CA' };
const DEP_TYPES = ['FS', 'SS', 'FF', 'SF'];

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
    --critical: #ef4444;
    --today: #22c55e;
    --radius: 8px;
    --radius-lg: 12px;
    --font: 'DM Sans', -apple-system, sans-serif;
    --mono: 'JetBrains Mono', monospace;
  }

  body { font-family: var(--font); background: var(--bg); color: var(--text); line-height: 1.5; -webkit-font-smoothing: antialiased; }

  .app { max-width: 1400px; margin: 0 auto; padding: 24px; }

  .header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 32px; padding-bottom: 20px; border-bottom: 1px solid var(--border);
  }
  .header h1 { font-size: 22px; font-weight: 600; letter-spacing: -0.3px; display: flex; align-items: center; gap: 10px; }
  .header h1 span.logo {
    background: linear-gradient(135deg, var(--accent), #d946ef);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700;
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

  .card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 24px; margin-bottom: 20px;
  }
  .card h2 {
    font-size: 15px; font-weight: 600; margin-bottom: 16px;
    color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px;
  }

  .project-selector { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  .project-selector select, .project-selector .user-select {
    background: var(--surface2); border: 1px solid var(--border);
    color: var(--text); padding: 10px 14px; border-radius: var(--radius);
    font-family: var(--font); font-size: 14px; min-width: 280px;
    cursor: pointer; outline: none; transition: border-color 0.15s;
  }
  .project-selector select:hover, .project-selector .user-select:hover { border-color: var(--border-hover); }
  .project-selector select:focus, .project-selector .user-select:focus { border-color: var(--accent); }

  .phase-table { width: 100%; border-collapse: collapse; }
  .phase-table th {
    text-align: left; padding: 8px 12px; font-size: 11px;
    text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted);
    border-bottom: 1px solid var(--border);
  }
  .phase-table td { padding: 10px 12px; border-bottom: 1px solid var(--border); font-size: 14px; vertical-align: middle; }
  .phase-table tr:last-child td { border-bottom: none; }
  .phase-table .phase-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 8px; vertical-align: middle; }

  .phase-table input[type="date"], .phase-table input[type="number"] {
    background: var(--surface2); border: 1px solid var(--border);
    color: var(--text); padding: 6px 10px; border-radius: 6px;
    font-family: var(--mono); font-size: 13px; outline: none; transition: border-color 0.15s;
  }
  .phase-table input:hover { border-color: var(--border-hover); }
  .phase-table input:focus { border-color: var(--accent); }
  .phase-table input[type="number"] { width: 80px; text-align: center; }
  .phase-table input:disabled { opacity: 0.4; cursor: not-allowed; }

  .progress-cell { display: flex; align-items: center; gap: 8px; }
  .progress-track { flex: 1; height: 6px; background: var(--surface2); border-radius: 3px; overflow: hidden; min-width: 60px; }
  .progress-fill { height: 100%; border-radius: 3px; transition: width 0.3s ease; }
  .progress-label { font-size: 12px; color: var(--text-dim); font-family: var(--mono); min-width: 32px; }
  .duration-display { font-size: 12px; color: var(--text-muted); font-family: var(--mono); }

  /* Gantt */
  .gantt-container { overflow-x: auto; position: relative; scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
  .gantt-container::-webkit-scrollbar { height: 8px; }
  .gantt-container::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
  .gantt { position: relative; min-height: 300px; }
  .gantt-header { display: flex; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: var(--surface); z-index: 2; }
  .gantt-month { text-align: center; font-size: 11px; font-weight: 500; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 0; border-right: 1px solid var(--border); }
  .gantt-month:last-child { border-right: none; }
  .gantt-body { position: relative; }
  .gantt-row { display: flex; align-items: center; height: 44px; border-bottom: 1px solid var(--border); position: relative; }
  .gantt-row.task-row { height: 32px; }
  .gantt-row:last-child { border-bottom: none; }
  .gantt-label { width: 200px; min-width: 200px; padding: 0 16px; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 8px; z-index: 1; background: var(--surface); }
  .gantt-label.task-label { font-size: 12px; font-weight: 400; padding-left: 32px; color: var(--text-dim); }
  .gantt-label .display-id { font-family: var(--mono); font-size: 10px; color: var(--accent); margin-right: 4px; }
  .gantt-track { flex: 1; height: 100%; position: relative; }
  .gantt-bar { position: absolute; height: 24px; top: 10px; border-radius: 4px; opacity: 0.85; transition: opacity 0.15s; cursor: pointer; }
  .gantt-bar:hover { opacity: 1; }
  .gantt-bar.critical-bar { border: 2px solid var(--critical) !important; }
  .gantt-bar-progress { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 4px; opacity: 0.4; }
  .gantt-bar-label { position: absolute; left: 8px; top: 50%; transform: translateY(-50%); font-size: 11px; font-weight: 600; color: white; white-space: nowrap; text-shadow: 0 1px 2px rgba(0,0,0,0.3); }
  .gantt-task-bar { position: absolute; height: 16px; top: 8px; border-radius: 3px; cursor: pointer; transition: opacity 0.15s; }
  .gantt-task-bar:hover { opacity: 1; filter: brightness(1.15); }
  .gantt-task-bar.critical-bar { border: 2px solid var(--critical) !important; }
  .gantt-task-bar.selected { box-shadow: 0 0 0 2px var(--accent); }
  .gantt-milestone { position: absolute; top: 50%; width: 14px; height: 14px; transform: translate(-50%, -50%) rotate(45deg); border: 2px solid #f59e0b; background: var(--surface); z-index: 2; cursor: pointer; transition: all 0.15s; }
  .gantt-milestone.completed { background: #f59e0b; border-color: #f59e0b; }
  .gantt-milestone.critical-ms { border-color: var(--critical); }
  .gantt-milestone:hover { transform: translate(-50%, -50%) rotate(45deg) scale(1.3); }
  .gantt-milestone-tooltip { position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%) rotate(-45deg); background: var(--surface2); border: 1px solid var(--border); padding: 6px 10px; border-radius: 6px; font-size: 11px; white-space: nowrap; pointer-events: none; opacity: 0; transition: opacity 0.15s; z-index: 10; }
  .gantt-milestone:hover .gantt-milestone-tooltip { opacity: 1; }
  .gantt-gridline { position: absolute; top: 0; bottom: 0; width: 1px; background: var(--border); opacity: 0.3; pointer-events: none; }
  .gantt-today { position: absolute; top: 0; bottom: 0; width: 2px; background: var(--today); z-index: 3; pointer-events: none; }
  .gantt-today::before { content: 'TODAY'; position: absolute; top: -22px; left: 50%; transform: translateX(-50%); font-size: 9px; font-weight: 700; letter-spacing: 0.5px; color: var(--today); white-space: nowrap; }
  .gantt-resize-handle { position: absolute; top: 0; bottom: 0; width: 8px; cursor: ew-resize; z-index: 5; }
  .gantt-resize-handle.left { left: -4px; }
  .gantt-resize-handle.right { right: -4px; }

  /* Drawer */
  .drawer-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); z-index: 100; }
  .drawer { position: fixed; top: 0; right: 0; bottom: 0; width: 400px; background: var(--surface); border-left: 1px solid var(--border); z-index: 101; display: flex; flex-direction: column; animation: slideIn 0.2s ease; }
  @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
  .drawer-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border); }
  .drawer-header h3 { font-size: 16px; font-weight: 600; }
  .drawer-close { background: none; border: none; color: var(--text-dim); font-size: 18px; cursor: pointer; padding: 4px 8px; }
  .drawer-close:hover { color: var(--text); }
  .drawer-body { flex: 1; overflow-y: auto; padding: 24px; }
  .drawer-field { margin-bottom: 16px; }
  .drawer-field label { display: block; font-size: 12px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
  .drawer-field input, .drawer-field select { width: 100%; padding: 8px 12px; background: var(--surface2); border: 1px solid var(--border); border-radius: 6px; color: var(--text); font-family: var(--font); font-size: 14px; outline: none; }
  .drawer-field input:focus, .drawer-field select:focus { border-color: var(--accent); }
  .drawer-field input:disabled, .drawer-field select:disabled { opacity: 0.4; cursor: not-allowed; }
  .drawer-row { display: flex; gap: 12px; }
  .drawer-row .drawer-field { flex: 1; }
  .drawer-anchor { padding: 8px 12px; background: var(--accent-dim); border-radius: 6px; font-size: 12px; color: var(--accent); margin-bottom: 16px; }
  .drawer-summary { padding: 12px; background: var(--surface2); border-radius: 8px; font-size: 13px; margin-bottom: 20px; line-height: 1.6; }
  .dep-type-row { display: flex; gap: 4px; margin-top: 8px; }
  .dep-type-btn { padding: 4px 10px; font-size: 11px; font-family: var(--mono); background: var(--surface2); border: 1px solid var(--border); color: var(--text-dim); border-radius: 4px; cursor: pointer; }
  .dep-type-btn.active { background: var(--accent); color: white; border-color: var(--accent); }
  .drawer-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 8px; }

  /* Buttons */
  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius); font-family: var(--font); font-size: 13px; font-weight: 500; cursor: pointer; border: none; transition: all 0.15s; outline: none; }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-primary { background: var(--accent); color: white; }
  .btn-primary:hover:not(:disabled) { background: #7c3aed; }
  .btn-ghost { background: transparent; color: var(--text-dim); border: 1px solid var(--border); }
  .btn-ghost:hover:not(:disabled) { background: var(--surface2); color: var(--text); }
  .btn-danger { background: transparent; color: var(--danger); border: 1px solid transparent; }
  .btn-danger:hover:not(:disabled) { background: rgba(239,68,68,0.1); }
  .btn-sm { padding: 4px 10px; font-size: 12px; }
  .btn-group { display: flex; gap: 8px; margin-top: 12px; }

  .checkbox-wrap { display: flex; align-items: center; gap: 8px; cursor: pointer; }
  .checkbox-wrap input { display: none; }
  .checkbox-box { width: 16px; height: 16px; border: 2px solid var(--border); border-radius: 4px; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
  .checkbox-wrap input:checked + .checkbox-box { background: var(--accent); border-color: var(--accent); }
  .check-icon { color: white; font-size: 11px; font-weight: 700; }

  .status-bar { display: flex; align-items: center; gap: 16px; padding: 10px 16px; background: var(--surface2); border-radius: var(--radius); font-size: 12px; color: var(--text-dim); margin-bottom: 20px; flex-wrap: wrap; }
  .status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .empty-state { text-align: center; padding: 60px 20px; color: var(--text-muted); }
  .empty-state p { font-size: 15px; margin-bottom: 8px; }
  .empty-state .sub { font-size: 13px; }
  .save-indicator { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted); }
  .save-indicator.saving { color: var(--warning); }
  .save-indicator.saved { color: var(--success); }
  .save-indicator.error { color: var(--danger); }
  .toolbar { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
  .toolbar-spacer { flex: 1; }

  @media (max-width: 768px) {
    .app { padding: 16px; }
    .header { flex-direction: column; gap: 12px; align-items: flex-start; }
    .project-selector { flex-direction: column; }
    .project-selector select, .project-selector .user-select { min-width: 100%; }
    .gantt-label { width: 140px; min-width: 140px; font-size: 12px; }
    .drawer { width: 100%; }
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

function addBusinessDays(dateStr, bdays) {
  const d = new Date(dateStr + 'T00:00:00');
  let added = 0;
  while (added < bdays) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) added++;
  }
  return d.toISOString().split('T')[0];
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
    months.push({ label: monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), start: monthStart, end: monthEnd });
  }
  return months;
}

function todayStr() { return new Date().toISOString().split('T')[0]; }

function getCurrentPhase(phases) {
  const today = todayStr();
  for (const p of phases) {
    if (p.start_date && p.end_date && p.start_date <= today && today <= p.end_date) return p.phase_code;
  }
  const withDates = phases.filter(p => p.end_date);
  if (withDates.length && withDates[withDates.length - 1].end_date < today) return withDates[withDates.length - 1].phase_code;
  return null;
}

function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    const pa = PHASE_SORT[a.phase_code] ?? 99;
    const pb = PHASE_SORT[b.phase_code] ?? 99;
    if (pa !== pb) return pa - pb;
    if (a.start_date && b.start_date) return a.start_date.localeCompare(b.start_date);
    return (a.start_date ? -1 : 1) - (b.start_date ? -1 : 1);
  });
}

function assignDisplayIds(tasks) {
  const sorted = sortTasks(tasks);
  const counters = {};
  return sorted.map(t => {
    const prefix = PHASE_PREFIX[t.phase_code] || 'PT';
    counters[prefix] = (counters[prefix] || 0) + 1;
    return { ...t, _displayId: `${prefix}-${counters[prefix]}` };
  });
}

function hexToRGB(hex) { return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]; }
function lightenColor(hex, t) { const [r, g, b] = hexToRGB(hex); return [Math.round(r * t + 255 * (1 - t)), Math.round(g * t + 255 * (1 - t)), Math.round(b * t + 255 * (1 - t))]; }


/* ═══════════════════════════════════════════════════════════
   CRITICAL PATH — FIXED ALGORITHM (proper CPM)

   Previous bugs:
   1. ES/EF were computed from calendar dates, not via forward pass
      through the dependency graph. This meant float was calculated
      based on where tasks were placed rather than where dependencies
      required them, causing random tasks to appear critical.
   2. Standalone tasks (no deps) were incorrectly included.
   3. Backward pass used array order instead of reverse topo order.

   Fix: Proper two-pass CPM. Forward pass computes ES/EF from
   dependency graph using durations (root tasks get ES=0). Backward
   pass computes LF/LS in reverse topological order. Float = LS - ES.
   Only tasks in dependency chains are candidates.
   ═══════════════════════════════════════════════════════════ */

function computeCriticalPath(tasks) {
  try {
    const dated = tasks.filter(t => t.start_date);
    if (dated.length < 2) return new Set();

    // Build adjacency
    const successors = {};
    const predecessors = {};
    dated.forEach(t => {
      if (t.depends_on) {
        if (!successors[t.depends_on]) successors[t.depends_on] = [];
        successors[t.depends_on].push(t.id);
        predecessors[t.id] = t.depends_on;
      }
    });

    // Only tasks in a dependency chain can be critical
    const inChain = new Set();
    dated.forEach(t => { if (predecessors[t.id] || successors[t.id]) inChain.add(t.id); });
    const chainTasks = dated.filter(t => inChain.has(t.id));
    if (chainTasks.length < 2) return new Set();

    // Duration in days for each task (milestones = 0)
    const duration = {};
    chainTasks.forEach(t => {
      duration[t.id] = t.end_date ? daysBetween(t.start_date, t.end_date) : 0;
    });

    // Topological sort (Kahn's algorithm)
    const inDeg = {};
    chainTasks.forEach(t => { inDeg[t.id] = 0; });
    chainTasks.forEach(t => { if (predecessors[t.id] && inChain.has(predecessors[t.id])) inDeg[t.id]++; });
    const q = chainTasks.filter(t => inDeg[t.id] === 0).map(t => t.id);
    const topo = [];
    const vis = new Set();
    while (q.length) {
      const id = q.shift();
      if (vis.has(id)) continue;
      vis.add(id);
      topo.push(id);
      (successors[id] || []).forEach(s => {
        if (inChain.has(s) && !vis.has(s)) { inDeg[s]--; if (inDeg[s] <= 0) q.push(s); }
      });
    }
    chainTasks.forEach(t => { if (!vis.has(t.id)) topo.push(t.id); });

    // FORWARD PASS: compute ES/EF from dependency graph, not calendar dates
    // ES = max(predecessor EF + gap); root tasks get ES = 0
    // EF = ES + duration
    const ES = {}, EF = {};
    for (const id of topo) {
      const task = chainTasks.find(t => t.id === id);
      if (!task) continue;
      if (predecessors[id] && inChain.has(predecessors[id])) {
        const gap = task.gap_business_days || 0;
        ES[id] = EF[predecessors[id]] + gap;
      } else {
        ES[id] = 0;
      }
      EF[id] = ES[id] + duration[id];
    }

    const projectEnd = Math.max(...chainTasks.map(t => EF[t.id]).filter(v => isFinite(v)));
    if (!isFinite(projectEnd)) return new Set();

    // BACKWARD PASS: compute LF/LS in reverse topological order
    // LF = min(successor LS - gap); leaf tasks get LF = projectEnd
    // LS = LF - duration
    const LF = {}, LS = {};
    for (let i = topo.length - 1; i >= 0; i--) {
      const id = topo[i];
      const succs = (successors[id] || []).filter(s => inChain.has(s));
      if (succs.length === 0) {
        LF[id] = projectEnd;
      } else {
        LF[id] = Math.min(...succs.map(s => {
          const succTask = chainTasks.find(t => t.id === s);
          const gap = succTask ? (succTask.gap_business_days || 0) : 0;
          return LS[s] - gap;
        }));
      }
      LS[id] = LF[id] - duration[id];
    }

    // Total Float = LS - ES. Critical when float = 0.
    const result = new Set();
    chainTasks.forEach(t => { if (LS[t.id] - ES[t.id] <= 0) result.add(t.id); });
    return result;
  } catch (err) {
    console.warn('Critical path calc error:', err);
    return new Set();
  }
}


/* ═══════════════════════════════════════════════════════════
   GANTT CHART COMPONENT
   ═══════════════════════════════════════════════════════════ */

function GanttChart({ phases, tasks, selectedTaskId, onSelectTask, onSelectPhase, criticalSet, showCritical, canEdit, onResizeEnd }) {
  const phasesWithDates = phases.filter(p => p.phase_start && p.phase_end);
  const tasksWithDates = tasks.filter(t => t.start_date);
  const containerRef = useRef(null);

  if (!phasesWithDates.length && !tasksWithDates.length) {
    return <div className="empty-state"><p>No phases scheduled yet</p><div className="sub">Add start and end dates below</div></div>;
  }

  // Interleaved rows
  const rows = [];
  PHASES.forEach(pDef => {
    const phase = phasesWithDates.find(p => p.phase_code === pDef.code);
    if (phase) rows.push({ type: 'phase', pDef, phase });
    tasksWithDates.filter(t => t.phase_code === pDef.code).forEach(t => rows.push({ type: 'task', pDef, t }));
  });
  tasksWithDates.filter(t => !t.phase_code).forEach(t => rows.push({ type: 'task', pDef: { color: '#9ca3af', name: '' }, t }));

  // Timeline
  const allDates = phasesWithDates.flatMap(p => [p.phase_start, p.phase_end]);
  tasksWithDates.forEach(t => { allDates.push(t.start_date); if (t.end_date) allDates.push(t.end_date); });
  allDates.push(todayStr());
  const sorted = allDates.sort();
  const minDate = addDays(sorted[0], -14);
  const maxDate = addDays(sorted[sorted.length - 1], 14);
  const totalDays = daysBetween(minDate, maxDate);
  const pxPerDay = Math.max(4, Math.min(12, 1200 / totalDays));
  const totalWidth = totalDays * pxPerDay;
  const labelWidth = 200;
  const months = getMonthsBetween(minDate, maxDate);
  const getX = d => daysBetween(minDate, d) * pxPerDay;
  const today = todayStr();
  const todayX = getX(today);

  const PHASE_H = 44, TASK_H = 32;
  const rowYs = {};
  let totalHeight = 0;
  rows.forEach(r => {
    const h = r.type === 'phase' ? PHASE_H : TASK_H;
    rowYs[r.type === 'phase' ? `phase:${r.pDef.code}` : `task:${r.t.id}`] = totalHeight + h / 2;
    totalHeight += h;
  });

  // Dependency arrows
  const depArrows = [];
  tasksWithDates.forEach(t => {
    if (!t.depends_on) return;
    const from = tasksWithDates.find(s => s.id === t.depends_on);
    if (!from?.start_date) return;
    const depType = t.dependency_type || 'FS';
    const fromEnd = from.end_date || from.start_date;
    const fromStart = from.start_date;
    const toStart = t.start_date;
    const toEnd = t.end_date || t.start_date;
    let fX, tX;
    switch (depType) {
      case 'SS': fX = labelWidth + getX(fromStart); tX = labelWidth + getX(toStart); break;
      case 'FF': fX = labelWidth + getX(fromEnd); tX = labelWidth + getX(toEnd); break;
      case 'SF': fX = labelWidth + getX(fromStart); tX = labelWidth + getX(toEnd); break;
      default:   fX = labelWidth + getX(fromEnd); tX = labelWidth + getX(toStart); break;
    }
    const fromY = rowYs[`task:${from.id}`];
    const toY = rowYs[`task:${t.id}`];
    if (fromY === undefined || toY === undefined) return;
    depArrows.push({ fromX: fX, toX: tX, fromY, toY, isCrit: showCritical && criticalSet.has(t.id) && criticalSet.has(from.id) });
  });

  const handleResizeStart = (e, taskId, side) => {
    e.stopPropagation(); e.preventDefault();
    const task = tasksWithDates.find(t => t.id === taskId);
    if (!task) return;
    const startX = e.clientX;
    const origStart = task.start_date;
    const origEnd = task.end_date || task.start_date;
    const onMove = me => {
      const dx = me.clientX - startX;
      const dd = Math.round(dx / pxPerDay);
      if (side === 'right') { const ne = addDays(origEnd, dd); if (daysBetween(origStart, ne) > 0) onResizeEnd(taskId, 'end_date', ne); }
      else { const ns = addDays(origStart, dd); if (daysBetween(ns, origEnd) > 0) onResizeEnd(taskId, 'start_date', ns); }
    };
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div className="gantt-container">
      <div className="gantt" ref={containerRef} style={{ width: totalWidth + labelWidth }}>
        <div className="gantt-header">
          <div style={{ width: labelWidth, minWidth: labelWidth, padding: '8px 16px', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Task / Phase</div>
          <div style={{ flex: 1, display: 'flex' }}>
            {months.map((m, i) => {
              const ms = m.start.toISOString().split('T')[0];
              const me = m.end.toISOString().split('T')[0];
              const w = daysBetween(ms < minDate ? minDate : ms, me > maxDate ? maxDate : me) * pxPerDay;
              return <div key={i} className="gantt-month" style={{ width: w }}>{m.label}</div>;
            })}
          </div>
        </div>

        <div className="gantt-body" style={{ minHeight: totalHeight }}>
          {months.map((m, i) => { const ms = m.start.toISOString().split('T')[0]; return ms >= minDate && ms <= maxDate ? <div key={`g-${i}`} className="gantt-gridline" style={{ left: labelWidth + getX(ms) }} /> : null; })}
          {today >= minDate && today <= maxDate && <div className="gantt-today" style={{ left: labelWidth + todayX }} />}

          <svg style={{ position: 'absolute', width: totalWidth + labelWidth, height: totalHeight, pointerEvents: 'none', zIndex: 1 }}>
            <defs>
              <marker id="arr" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 6 3 L 0 6 z" fill="var(--text-muted)" /></marker>
              <marker id="arr-c" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 6 3 L 0 6 z" fill="var(--critical)" /></marker>
            </defs>
            {depArrows.map((a, i) => {
              const mx = (a.fromX + a.toX) / 2;
              return <path key={i} d={`M ${a.fromX} ${a.fromY} C ${mx} ${a.fromY}, ${mx} ${a.toY}, ${a.toX} ${a.toY}`}
                stroke={a.isCrit ? 'var(--critical)' : 'var(--text-muted)'} strokeWidth={a.isCrit ? 2 : 1.5} fill="none"
                markerEnd={a.isCrit ? 'url(#arr-c)' : 'url(#arr)'} />;
            })}
          </svg>

          {rows.map((row, ri) => {
            if (row.type === 'phase') {
              const { pDef, phase } = row;
              return (
                <div key={`p-${pDef.code}`} className="gantt-row" onClick={() => onSelectPhase?.(pDef.code)}>
                  <div className="gantt-label"><span className="phase-dot" style={{ background: pDef.color }} />{pDef.name}</div>
                  <div className="gantt-track">
                    <div className="gantt-bar" style={{ left: getX(phase.phase_start), width: Math.max(daysBetween(phase.phase_start, phase.phase_end) * pxPerDay, 4), background: `${pDef.color}55`, border: `1px solid ${pDef.color}` }}>
                      <div className="gantt-bar-progress" style={{ width: `${phase.percent_complete || 0}%`, background: pDef.color }} />
                      {daysBetween(phase.phase_start, phase.phase_end) * pxPerDay > 60 && <span className="gantt-bar-label">{phase.percent_complete || 0}%</span>}
                    </div>
                  </div>
                </div>
              );
            }
            const { pDef, t } = row;
            const isMs = !t.end_date || t.start_date === t.end_date;
            const isCrit = showCritical && criticalSet.has(t.id);
            const isSel = selectedTaskId === t.id;
            return (
              <div key={`t-${t.id}`} className="gantt-row task-row" onClick={() => onSelectTask(t.id)}
                style={isCrit ? { background: 'rgba(239,68,68,0.05)' } : undefined}>
                <div className="gantt-label task-label"><span className="display-id">{t._displayId || ''}</span>{t.milestone_name || '(unnamed)'}</div>
                <div className="gantt-track">
                  {isMs ? (
                    <div className={`gantt-milestone ${t.is_completed ? 'completed' : ''} ${isCrit ? 'critical-ms' : ''}`} style={{ left: getX(t.start_date) }}>
                      <div className="gantt-milestone-tooltip">{t.milestone_name || '(unnamed)'} — {formatShortDate(t.start_date)}{t.is_completed ? ' ✓' : ''}</div>
                    </div>
                  ) : (
                    <div className={`gantt-task-bar ${isCrit ? 'critical-bar' : ''} ${isSel ? 'selected' : ''}`}
                      style={{ left: getX(t.start_date), width: Math.max(daysBetween(t.start_date, t.end_date) * pxPerDay, 4), background: `${pDef.color}88`, border: `1px solid ${pDef.color}` }}>
                      {canEdit && <>
                        <div className="gantt-resize-handle left" onMouseDown={e => handleResizeStart(e, t.id, 'left')} />
                        <div className="gantt-resize-handle right" onMouseDown={e => handleResizeStart(e, t.id, 'right')} />
                      </>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════
   TASK DRAWER
   ═══════════════════════════════════════════════════════════ */

function TaskDrawer({ task, tasks, canEdit, onUpdate, onDateChange, onClose, onDelete }) {
  if (!task) return null;
  const isTask = task.end_date && task.start_date !== task.end_date;
  const anchor = task.phase_anchor;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-header">
          <h3>{isTask ? 'Edit Task' : 'Edit Milestone'}</h3>
          <button className="drawer-close" onClick={onClose}>✕</button>
        </div>
        <div className="drawer-body">
          {anchor && <div className="drawer-anchor">⊳ Locked to {PHASE_MAP[anchor.split('_')[0]]?.name || ''} {anchor.split('_')[1]?.toLowerCase() || ''}</div>}
          <div className="drawer-summary">
            <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--accent)', marginRight: 6 }}>{task._displayId || ''}</span>
            <strong>{task.milestone_name || '(unnamed)'}</strong><br />
            {task.start_date && <span>{formatShortDate(task.start_date)}{isTask ? ` → ${formatShortDate(task.end_date)}` : ''}<br /></span>}
            {task.duration_business_days ? <span>{task.duration_business_days} business days<br /></span> : null}
            {task.phase_code && <span>Phase: {PHASE_MAP[task.phase_code]?.name || task.phase_code}</span>}
          </div>
          <div className="drawer-field"><label>Name</label><input type="text" value={task.milestone_name || ''} disabled={!canEdit} onChange={e => onUpdate(task.id, 'milestone_name', e.target.value)} /></div>
          <div className="drawer-field"><label>Phase</label>
            <select value={task.phase_code || ''} disabled={!canEdit || !!anchor} onChange={e => onUpdate(task.id, 'phase_code', e.target.value || null)}>
              <option value="">No phase</option>
              {PHASES.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
            </select>
          </div>
          <div className="drawer-row">
            <div className="drawer-field"><label>Start Date</label><input type="date" value={task.start_date || ''} disabled={!canEdit || !!anchor} onChange={e => onDateChange(task.id, 'start_date', e.target.value)} /></div>
            <div className="drawer-field"><label>End Date</label><input type="date" value={task.end_date || ''} disabled={!canEdit || (task.duration_business_days && task.start_date) || !!anchor} onChange={e => onDateChange(task.id, 'end_date', e.target.value)} /></div>
          </div>
          <div className="drawer-field"><label>Duration (business days)</label>
            <input type="number" min="0" value={task.duration_business_days ?? ''} disabled={!canEdit}
              onChange={e => { const v = parseInt(e.target.value) || 0; onUpdate(task.id, 'duration_business_days', v || null); if (v && task.start_date) onDateChange(task.id, 'end_date', addBusinessDays(task.start_date, v)); }} />
          </div>
          <div className="drawer-field"><label>Depends On</label>
            <select value={task.depends_on || ''} disabled={!canEdit} onChange={e => onUpdate(task.id, 'depends_on', e.target.value || null)}>
              <option value="">None</option>
              {tasks.filter(t => t.id !== task.id).sort((a, b) => (PHASE_SORT[a.phase_code] ?? 99) - (PHASE_SORT[b.phase_code] ?? 99)).map(t => (
                <option key={t.id} value={t.id}>{t._displayId || ''} {t.milestone_name || '(unnamed)'}</option>
              ))}
            </select>
            {task.depends_on && <div className="dep-type-row">{DEP_TYPES.map(dt => (
              <button key={dt} className={`dep-type-btn ${(task.dependency_type || 'FS') === dt ? 'active' : ''}`}
                onClick={() => canEdit && onUpdate(task.id, 'dependency_type', dt)}>{dt}</button>
            ))}</div>}
          </div>
          {task.depends_on && <div className="drawer-field"><label>Gap (business days)</label><input type="number" min="0" value={task.gap_business_days ?? 0} disabled={!canEdit} onChange={e => onUpdate(task.id, 'gap_business_days', parseInt(e.target.value) || 0)} /></div>}
          <div className="drawer-field"><label className="checkbox-wrap">
            <input type="checkbox" checked={task.is_completed || false} disabled={!canEdit} onChange={e => onUpdate(task.id, 'is_completed', e.target.checked)} />
            <span className="checkbox-box">{task.is_completed && <span className="check-icon">✓</span>}</span>
            <span style={{ fontSize: 14 }}>Mark as completed</span>
          </label></div>
        </div>
        {canEdit && <div className="drawer-footer"><button className="btn btn-danger" onClick={() => { onDelete(task.id); onClose(); }}>Delete {isTask ? 'Task' : 'Milestone'}</button></div>}
      </div>
    </>
  );
}


/* ═══════════════════════════════════════════════════════════
   PDF EXPORT
   ═══════════════════════════════════════════════════════════ */

let jspdfMod = null;
async function loadJsPDF() {
  if (jspdfMod) return jspdfMod;
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  await new Promise((res, rej) => { s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  jspdfMod = window.jspdf;
  return jspdfMod;
}

async function exportPDF(project, phases, tasks, criticalSet) {
  const { jsPDF } = await loadJsPDF();
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: [792, 1224] });
  const W = 1224, H = 792, M = 36, CW = W - M * 2;

  doc.setFontSize(20); doc.setFont('helvetica', 'bold'); doc.setTextColor(26, 29, 39);
  doc.text('ESa Schedule', M, M + 16);
  doc.setFontSize(12); doc.setFont('helvetica', 'normal'); doc.setTextColor(90);
  doc.text(`${project.project_number} — ${project.project_name}`, M + 140, M + 16);
  doc.setFontSize(9); doc.setTextColor(120);
  doc.text(`PM: ${project.pm || '—'}  |  DM: ${project.dm || '—'}  |  Principal: ${project.principal || '—'}`, M, M + 32);
  doc.text(`Exported: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, W - M, M + 32, { align: 'right' });
  doc.setDrawColor(200); doc.setLineWidth(0.5); doc.line(M, M + 40, W - M, M + 40);

  const pWD = phases.filter(p => p.phase_start && p.phase_end);
  const sT = sortTasks(tasks.filter(t => t.start_date));
  const rows = [];
  PHASES.forEach(pd => { const ph = pWD.find(p => p.phase_code === pd.code); if (ph) rows.push({ type: 'phase', pDef: pd, phase: ph }); sT.filter(t => t.phase_code === pd.code).forEach(t => rows.push({ type: 'task', pDef: pd, t })); });
  sT.filter(t => !t.phase_code).forEach(t => rows.push({ type: 'task', pDef: { color: '#9ca3af' }, t }));

  if (!rows.length) { doc.save(`ESa_Schedule_${project.project_number}.pdf`); return; }

  const aD = pWD.flatMap(p => [p.phase_start, p.phase_end]);
  sT.forEach(t => { aD.push(t.start_date); if (t.end_date) aD.push(t.end_date); }); aD.push(todayStr()); aD.sort();
  const cMin = addDays(aD[0], -7), cMax = addDays(aD[aD.length - 1], 7), cDays = daysBetween(cMin, cMax);
  const lW = 160, cLeft = M + lW, cW2 = CW - lW, ppd = cW2 / cDays;
  const gX = d => daysBetween(cMin, d) * ppd;

  const phH = 16, tkH = 12;
  const needed = rows.reduce((s, r) => s + (r.type === 'phase' ? phH : tkH), 0);
  const avail = H - M - 80 - 50;
  const sc = needed > avail ? avail / needed : 1;
  const sPH = Math.max(10, Math.floor(phH * sc)), sTH = Math.max(8, Math.floor(tkH * sc));

  let y = M + 56;
  const mos = getMonthsBetween(cMin, cMax);
  doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.setTextColor(120);
  mos.forEach(m => { const ms = m.start.toISOString().split('T')[0], me = m.end.toISOString().split('T')[0]; const cs = ms < cMin ? cMin : ms, ce = me > cMax ? cMax : me; const x = cLeft + gX(cs), w = daysBetween(cs, ce) * ppd; if (w > 20) doc.text(m.label.toUpperCase(), x + w / 2, y, { align: 'center' }); });
  y += 6; doc.setDrawColor(180); doc.setLineWidth(1); doc.line(M, y, W - M, y); y += 2;

  const cTop = y, cBot = y + rows.reduce((s, r) => s + (r.type === 'phase' ? sPH : sTH), 0);
  doc.setDrawColor(230); doc.setLineWidth(0.3);
  mos.forEach(m => { const ms = m.start.toISOString().split('T')[0]; if (ms >= cMin && ms <= cMax) doc.line(cLeft + gX(ms), cTop, cLeft + gX(ms), cBot); });
  doc.setDrawColor(200); doc.setLineWidth(0.5); doc.line(cLeft - 4, cTop, cLeft - 4, cBot);

  const td = todayStr();
  if (td >= cMin && td <= cMax) { const tx = cLeft + gX(td); doc.setDrawColor(34, 197, 94); doc.setLineWidth(1.5); doc.line(tx, cTop - 8, tx, cBot); doc.setFontSize(5); doc.setTextColor(34, 197, 94); doc.text('TODAY', tx, cTop - 2, { align: 'center' }); }

  rows.forEach(row => {
    if (row.type === 'phase') {
      const { pDef, phase } = row; const rH = sPH, mY = y + rH / 2;
      const [r, g, b] = hexToRGB(pDef.color); const [lr, lg, lb] = lightenColor(pDef.color, 0.08);
      doc.setFillColor(lr, lg, lb); doc.rect(M, y, CW, rH, 'F');
      doc.setFillColor(r, g, b); doc.circle(M + 6, mY, 3, 'F');
      doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(40); doc.text(pDef.name, M + 14, mY + 3);
      if (phase) {
        const bx = cLeft + gX(phase.phase_start), bw = Math.max(daysBetween(phase.phase_start, phase.phase_end) * ppd, 2);
        const [br, bg2, bb] = lightenColor(pDef.color, 0.15);
        doc.setFillColor(br, bg2, bb); doc.setDrawColor(r, g, b); doc.setLineWidth(1); doc.roundedRect(bx, mY - 5, bw, 10, 2, 2, 'FD');
        if (phase.percent_complete > 0) { const pw = bw * (phase.percent_complete / 100); const [pr, pg, pb] = lightenColor(pDef.color, 0.4); doc.setFillColor(pr, pg, pb); doc.roundedRect(bx, mY - 5, pw, 10, 2, 2, 'F'); }
        doc.setFontSize(5); doc.setFont('helvetica', 'normal'); doc.setTextColor(120);
        const dl = `${formatShortDate(phase.phase_start)} – ${formatShortDate(phase.phase_end)}`;
        if (bx + bw + 4 + doc.getTextWidth(dl) < W - M) doc.text(dl, bx + bw + 4, mY + 2);
      }
      y += rH;
    } else {
      const { pDef, t } = row; const rH = sTH, mY = y + rH / 2;
      const isCrit = criticalSet?.has(t.id);
      const isMs = !t.end_date || t.start_date === t.end_date;
      if (isCrit) { doc.setFillColor(254, 242, 242); doc.rect(M, y, CW, rH, 'F'); }
      const nm = t.milestone_name || '(unnamed)'; const dn = nm.length > 38 ? nm.substring(0, 37) + '…' : nm;
      doc.setFontSize(6.5); doc.setFont('helvetica', isCrit ? 'bold' : 'normal');
      const did = t._displayId || '';
      if (did) { doc.setTextColor(139, 92, 246); doc.text(did, M + 16, mY + 2); doc.setTextColor(isCrit ? 180 : 80, isCrit ? 40 : 80, isCrit ? 40 : 80); doc.text(dn, M + 16 + doc.getTextWidth(did) + 4, mY + 2); }
      else { doc.setTextColor(80); doc.text(dn, M + 16, mY + 2); }
      if (isMs) {
        const mx = cLeft + gX(t.start_date), sz = 4;
        doc.setFillColor(isCrit ? 239 : 245, isCrit ? 68 : 158, isCrit ? 68 : 11);
        doc.triangle(mx, mY - sz, mx + sz, mY, mx, mY + sz, 'F'); doc.triangle(mx, mY - sz, mx, mY + sz, mx - sz, mY, 'F');
      } else {
        const bx = cLeft + gX(t.start_date), bw = Math.max(daysBetween(t.start_date, t.end_date) * ppd, 2);
        const [r, g, b] = hexToRGB(pDef.color);
        doc.setFillColor(r, g, b); doc.roundedRect(bx, mY - 3, bw, 6, 1, 1, 'F');
        if (isCrit) { doc.setDrawColor(239, 68, 68); doc.setLineWidth(1); doc.roundedRect(bx, mY - 3, bw, 6, 1, 1, 'D'); }
      }
      y += rH;
    }
  });

  doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(160);
  doc.text('CONFIDENTIAL — Earl Swensson Associates', M, H - 20);
  doc.text(`Page 1 of 1  |  Generated ${new Date().toLocaleString()}`, W - M, H - 20, { align: 'right' });
  doc.save(`ESa_Schedule_${project.project_number.replace(/\./g, '-')}.pdf`);
}


/* ═══════════════════════════════════════════════════════════
   PHASE EDITOR
   ═══════════════════════════════════════════════════════════ */

function PhaseEditor({ phases, canEdit, onUpdate }) {
  return (
    <table className="phase-table">
      <thead><tr><th>Phase</th><th>Start</th><th>End</th><th>Duration</th><th>Budgeted Hrs</th><th>Progress</th></tr></thead>
      <tbody>
        {PHASES.map(pDef => {
          const phase = phases.find(p => p.phase_code === pDef.code) || {};
          const dur = phase.start_date && phase.end_date ? daysBetween(phase.start_date, phase.end_date) : null;
          return (
            <tr key={pDef.code}>
              <td><span className="phase-dot" style={{ background: pDef.color }} />{pDef.name}</td>
              <td><input type="date" value={phase.start_date || ''} disabled={!canEdit} onChange={e => onUpdate(pDef.code, 'start_date', e.target.value || null)} /></td>
              <td><input type="date" value={phase.end_date || ''} disabled={!canEdit} onChange={e => onUpdate(pDef.code, 'end_date', e.target.value || null)} /></td>
              <td><span className="duration-display">{dur !== null ? `${dur}d (${(dur / 7).toFixed(1)}w)` : '—'}</span></td>
              <td><input type="number" min="0" value={phase.budgeted_hours ?? ''} disabled={!canEdit} onChange={e => onUpdate(pDef.code, 'budgeted_hours', parseInt(e.target.value) || null)} /></td>
              <td><div className="progress-cell">
                <input type="number" min="0" max="100" value={phase.percent_complete ?? 0} disabled={!canEdit}
                  onChange={e => onUpdate(pDef.code, 'percent_complete', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))} />
                <div className="progress-track"><div className="progress-fill" style={{ width: `${phase.percent_complete || 0}%`, background: pDef.color }} /></div>
                <span className="progress-label">{phase.percent_complete || 0}%</span>
              </div></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}


/* ═══════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════ */

export default function App() {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentUser, setCurrentUser] = useState('');
  const [phases, setPhases] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showCritical, setShowCritical] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const undoStack = useRef([]);
  const saveTimeout = useRef({});

  const pushUndo = useCallback(() => {
    undoStack.current.push({ phases: JSON.parse(JSON.stringify(phases)), tasks: JSON.parse(JSON.stringify(tasks)) });
    if (undoStack.current.length > 30) undoStack.current.shift();
  }, [phases, tasks]);

  const handleUndo = useCallback(() => { const prev = undoStack.current.pop(); if (prev) { setPhases(prev.phases); setTasks(prev.tasks); } }, []);

  const canEdit = useMemo(() => {
    if (!currentUser || !selectedProject) return false;
    const proj = projects.find(p => p.project_number === selectedProject);
    if (!proj) return false;
    const u = currentUser.toLowerCase();
    return [proj.pm, proj.dm, proj.principal].some(r => r && r.toLowerCase() === u);
  }, [currentUser, selectedProject, projects]);

  const userRole = useMemo(() => {
    if (!currentUser || !selectedProject) return null;
    const proj = projects.find(p => p.project_number === selectedProject);
    if (!proj) return null;
    const u = currentUser.toLowerCase();
    if (proj.principal?.toLowerCase() === u) return 'Principal';
    if (proj.dm?.toLowerCase() === u) return 'DM';
    if (proj.pm?.toLowerCase() === u) return 'PM';
    return null;
  }, [currentUser, selectedProject, projects]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [pR, eR] = await Promise.all([
        supabase.from('projects').select('*').order('project_number'),
        supabase.from('employees').select('name').order('name'),
      ]);
      if (pR.data) setProjects(pR.data);
      if (eR.data) setEmployees(eR.data.map(e => e.name).filter(Boolean));
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!selectedProject) { setPhases([]); setTasks([]); return; }
    (async () => {
      const [phR, tkR] = await Promise.all([
        supabase.from('schedule').select('*').eq('project_number', selectedProject),
        supabase.from('schedule_milestones').select('*').eq('project_number', selectedProject).order('milestone_date'),
      ]);
      let lp = (phR.data || []).map(p => ({ ...p, phase_code: p.phase, start_date: p.phase_start, end_date: p.phase_end, sort_order: PHASES.findIndex(ph => ph.code === p.phase) + 1 }));
      const existing = new Set(lp.map(p => p.phase_code));
      const missing = PHASES.filter(p => !existing.has(p.code));
      if (missing.length) {
        const ins = missing.map(p => ({ project_number: selectedProject, phase: p.code, phase_start: null, phase_end: null, budgeted_hours: null, percent_complete: 0, active: true }));
        const { data } = await supabase.from('schedule').insert(ins).select();
        if (data) lp = [...lp, ...data.map(p => ({ ...p, phase_code: p.phase, start_date: p.phase_start, end_date: p.phase_end, sort_order: PHASES.findIndex(ph => ph.code === p.phase) + 1 }))];
      }
      lp.sort((a, b) => a.sort_order - b.sort_order);
      setPhases(lp);
      setTasks(assignDisplayIds(tkR.data || []));
    })();
    setSelectedTaskId(null);
    undoStack.current = [];
  }, [selectedProject]);

  const debouncedSave = useCallback((table, id, updates) => {
    setSaveStatus('saving');
    const key = `${table}:${id}`;
    if (saveTimeout.current[key]) clearTimeout(saveTimeout.current[key]);
    saveTimeout.current[key] = setTimeout(async () => {
      delete saveTimeout.current[key];
      const { error } = await supabase.from(table).update(updates).eq('id', id);
      setSaveStatus(error ? 'error' : 'saved');
      if (!error) setTimeout(() => setSaveStatus(p => p === 'saved' ? 'idle' : p), 2000);
    }, 600);
  }, []);

  const handlePhaseUpdate = useCallback((code, field, value) => {
    pushUndo();
    setPhases(prev => {
      const up = prev.map(p => p.phase_code === code ? { ...p, [field]: value } : p);
      const ph = up.find(p => p.phase_code === code);
      if (ph) debouncedSave('schedule', ph.id, { [field === 'start_date' ? 'phase_start' : field === 'end_date' ? 'phase_end' : field]: value });
      if (ph && (field === 'start_date' || field === 'end_date')) {
        setTasks(prev => prev.map(t => {
          if (!t.phase_anchor) return t;
          const [ap, ae] = t.phase_anchor.split('_');
          if (ap !== code || (ae === 'START' ? 'start_date' : 'end_date') !== field) return t;
          const nt = { ...t, start_date: value };
          if (nt.duration_business_days) nt.end_date = addBusinessDays(nt.start_date, nt.duration_business_days);
          debouncedSave('schedule_milestones', nt.id, { start_date: nt.start_date, end_date: nt.end_date || null });
          return nt;
        }));
      }
      return up;
    });
  }, [debouncedSave, pushUndo]);

  const handleTaskUpdate = useCallback((id, field, value) => {
    pushUndo();
    setTasks(prev => { const up = prev.map(t => t.id === id ? { ...t, [field]: value } : t); debouncedSave('schedule_milestones', id, { [field]: value }); return assignDisplayIds(up); });
  }, [debouncedSave, pushUndo]);

  const handleTaskDateChange = useCallback((id, field, value) => {
    pushUndo();
    setTasks(prev => {
      let up = prev.map(t => { if (t.id !== id) return t; const n = { ...t, [field]: value }; if (field === 'start_date' && n.duration_business_days) n.end_date = addBusinessDays(value, n.duration_business_days); return n; });
      let changed = true;
      while (changed) { changed = false; up = up.map(t => { if (!t.depends_on) return t; const d = up.find(x => x.id === t.depends_on); if (!d?.end_date) return t; const gap = t.gap_business_days || 0; const ns = gap > 0 ? addBusinessDays(d.end_date, gap) : addDays(d.end_date, 1); if (ns !== t.start_date) { changed = true; const n = { ...t, start_date: ns }; if (n.duration_business_days) n.end_date = addBusinessDays(ns, n.duration_business_days); return n; } return t; }); }
      up.forEach(t => { const o = prev.find(x => x.id === t.id); if (o && (o.start_date !== t.start_date || o.end_date !== t.end_date)) debouncedSave('schedule_milestones', t.id, { start_date: t.start_date, end_date: t.end_date || null }); });
      return assignDisplayIds(up);
    });
  }, [debouncedSave, pushUndo]);

  const handleAddTask = useCallback(async (isTask) => {
    pushUndo();
    const { data } = await supabase.from('schedule_milestones').insert({ project_number: selectedProject, phase_code: null, milestone_name: '', start_date: todayStr(), end_date: isTask ? addDays(todayStr(), 7) : null, duration_business_days: isTask ? 5 : null, is_completed: false, depends_on: null, gap_business_days: 0, dependency_type: 'FS', phase_anchor: null }).select().single();
    if (data) { setTasks(prev => assignDisplayIds([...prev, data])); setSelectedTaskId(data.id); }
  }, [selectedProject, pushUndo]);

  const handleDeleteTask = useCallback(async (id) => {
    pushUndo();
    await supabase.from('schedule_milestones').delete().eq('id', id);
    setTasks(prev => assignDisplayIds(prev.filter(t => t.id !== id)));
    if (selectedTaskId === id) setSelectedTaskId(null);
  }, [selectedTaskId, pushUndo]);

  const handleExportPDF = useCallback(async () => {
    const proj = projects.find(p => p.project_number === selectedProject);
    if (!proj) return;
    setExporting(true);
    try { await exportPDF(proj, phases, assignDisplayIds(tasks), showCritical ? criticalSet : null); } catch (e) { console.error('PDF export error:', e); }
    setExporting(false);
  }, [projects, selectedProject, phases, tasks, showCritical]);

  const criticalSet = useMemo(() => computeCriticalPath(tasks), [tasks]);
  const currentPhaseCode = useMemo(() => getCurrentPhase(phases), [phases]);
  const currentPhase = currentPhaseCode ? PHASE_MAP[currentPhaseCode] : null;
  const selectedProjectData = projects.find(p => p.project_number === selectedProject);
  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  useEffect(() => {
    const h = e => { if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); handleUndo(); } };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, [handleUndo]);

  if (loading) return <div className="app"><style>{CSS}</style><div className="empty-state"><p>Loading ESa Schedule...</p></div></div>;

  return (
    <div className="app">
      <style>{CSS}</style>
      <div className="header">
        <h1><span className="logo">ESa</span> Schedule</h1>
        <div className="header-right">
          {saveStatus !== 'idle' && <div className={`save-indicator ${saveStatus}`}>{saveStatus === 'saving' && '● Saving...'}{saveStatus === 'saved' && '✓ Saved'}{saveStatus === 'error' && '✕ Save failed'}</div>}
          {currentUser && selectedProject && <div className="user-badge">{currentUser}{userRole ? <span className="role-tag">{userRole} — Can Edit</span> : <span className="role-tag" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)' }}>View Only</span>}</div>}
        </div>
      </div>

      <div className="card">
        <div className="project-selector">
          <select value={currentUser} onChange={e => setCurrentUser(e.target.value)} className="user-select">
            <option value="">Select your name...</option>
            {employees.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <select value={selectedProject || ''} onChange={e => setSelectedProject(e.target.value || null)}>
            <option value="">Select a project...</option>
            {projects.map(p => <option key={p.project_number} value={p.project_number}>{p.project_number} — {p.project_name}</option>)}
          </select>
        </div>
      </div>

      {!selectedProject ? (
        <div className="empty-state"><p>Select a project to view or edit its schedule</p><div className="sub">{projects.length} projects available</div></div>
      ) : (
        <>
          <div className="status-bar">
            <span style={{ fontWeight: 600, color: 'var(--text)' }}>{selectedProjectData?.project_name}</span>
            <span>|</span><span>PM: {selectedProjectData?.pm || '—'}</span><span>DM: {selectedProjectData?.dm || '—'}</span><span>Principal: {selectedProjectData?.principal || '—'}</span>
            {currentPhase && <><span>|</span><span className="status-dot" style={{ background: currentPhase.color }} /><span style={{ color: currentPhase.color, fontWeight: 500 }}>Currently in {currentPhase.name}</span></>}
          </div>

          <div className="toolbar">
            <label className="checkbox-wrap" style={{ fontSize: 13 }}>
              <input type="checkbox" checked={showCritical} onChange={e => setShowCritical(e.target.checked)} />
              <span className="checkbox-box">{showCritical && <span className="check-icon">✓</span>}</span><span>Critical Path</span>
            </label>
            <div className="toolbar-spacer" />
            <button className="btn btn-ghost btn-sm" onClick={handleUndo} disabled={!undoStack.current.length} title="Undo (Ctrl+Z)">↩ Undo</button>
            <button className="btn btn-ghost btn-sm" onClick={handleExportPDF} disabled={exporting}>{exporting ? 'Exporting...' : '↓ Export PDF'}</button>
          </div>

          <div className="card">
            <h2>Project Timeline</h2>
            <GanttChart phases={phases} tasks={tasks} selectedTaskId={selectedTaskId}
              onSelectTask={id => { setSelectedTaskId(id); }} onSelectPhase={() => {}}
              criticalSet={criticalSet} showCritical={showCritical} canEdit={canEdit}
              onResizeEnd={(id, f, v) => handleTaskDateChange(id, f, v)} />
          </div>

          <div className="card">
            <h2>Phases</h2>
            <PhaseEditor phases={phases} canEdit={canEdit} onUpdate={handlePhaseUpdate} />
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>Project Tasks</h2>
              {canEdit && <div className="btn-group" style={{ margin: 0 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => handleAddTask(true)}>+ Task</button>
                <button className="btn btn-ghost btn-sm" onClick={() => handleAddTask(false)}>+ Milestone</button>
              </div>}
            </div>
            {!tasks.length ? <div style={{ padding: 16, color: 'var(--text-muted)', fontSize: 13 }}>No tasks yet{canEdit ? ' — add one above' : ''}</div> : (
              <table className="phase-table">
                <thead><tr><th>ID</th><th>Name</th><th>Phase</th><th>Start</th><th>End</th><th>Depends On</th><th>Status</th></tr></thead>
                <tbody>{sortTasks(tasks).map(t => {
                  const isCrit = showCritical && criticalSet.has(t.id);
                  return (
                    <tr key={t.id} onClick={() => setSelectedTaskId(t.id)} style={{ cursor: 'pointer', background: selectedTaskId === t.id ? 'var(--accent-dim)' : isCrit ? 'rgba(239,68,68,0.06)' : undefined }}>
                      <td><span className="display-id">{t._displayId || ''}</span></td>
                      <td>{t.milestone_name || <span style={{ color: 'var(--text-muted)' }}>(unnamed)</span>}</td>
                      <td>{t.phase_code && <><span className="phase-dot" style={{ background: PHASE_MAP[t.phase_code]?.color }} />{PHASE_MAP[t.phase_code]?.name}</>}</td>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{formatShortDate(t.start_date)}</td>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{formatShortDate(t.end_date)}</td>
                      <td>{t.depends_on && (() => { const d = tasks.find(x => x.id === t.depends_on); return d ? <span style={{ fontSize: 12 }}><span className="display-id">{d._displayId}</span> {t.dependency_type || 'FS'}{t.gap_business_days ? ` +${t.gap_business_days}d` : ''}</span> : null; })()}</td>
                      <td>{t.is_completed ? <span style={{ color: 'var(--success)', fontSize: 12, fontWeight: 600 }}>✓ Done</span> : isCrit ? <span style={{ color: 'var(--critical)', fontSize: 11, fontWeight: 600 }}>CRITICAL</span> : null}</td>
                    </tr>
                  );
                })}</tbody>
              </table>
            )}
          </div>

          {selectedTask && <TaskDrawer task={selectedTask} tasks={tasks} canEdit={canEdit} onUpdate={handleTaskUpdate} onDateChange={handleTaskDateChange} onClose={() => setSelectedTaskId(null)} onDelete={handleDeleteTask} />}
        </>
      )}
    </div>
  );
}
