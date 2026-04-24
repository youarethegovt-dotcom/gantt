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
    e.preventDefault(); setLoading(true); setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError('Invalid email or password.');
    else onLogin();
    setLoading(false);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f5f7', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      <div style={{ background: '#fff', border: '1px solid #e0e2e7', borderRadius: 10, padding: '40px 36px', width: 360, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.3px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4 }}>ESa Schedule</div>
          <div style={{ color: '#8b8fa3', fontSize: 13 }}>Sign in to continue</div>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', color: '#5a5e72', fontSize: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus style={{ width: '100%', padding: '10px 12px', background: '#f0f1f3', border: '1px solid #e0e2e7', borderRadius: 6, color: '#1a1d27', fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', color: '#5a5e72', fontSize: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px 12px', background: '#f0f1f3', border: '1px solid #e0e2e7', borderRadius: 6, color: '#1a1d27', fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
          </div>
          {error && <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 14, textAlign: 'center' }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '11px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none', borderRadius: 6, color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit' }}>{loading ? 'Signing in…' : 'Sign In'}</button>
        </form>
      </div>
    </div>
  );
}

export function AuthWrapper() {
  const [session, setSession] = useState(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);
  if (session === undefined) return null;
  if (!session) return <LoginScreen onLogin={() => {}} />;
  return <App />;
}


/* ═══════════════════════════════════════════════════════════
   BUILT-IN PHASES + HELPERS
   ═══════════════════════════════════════════════════════════ */

const BUILTIN_PHASES = [
  { code: 'PRE', name: 'Pre-Design', sort: 1, color: '#6366f1', builtin: true },
  { code: 'SD',  name: 'Schematic Design', sort: 2, color: '#8b5cf6', builtin: true },
  { code: 'DD',  name: 'Design Development', sort: 3, color: '#a855f7', builtin: true },
  { code: 'CD',  name: 'Construction Documents', sort: 4, color: '#d946ef', builtin: true },
  { code: 'BID', name: 'Bidding', sort: 5, color: '#ec4899', builtin: true },
  { code: 'CA',  name: 'Construction Administration', sort: 6, color: '#f43f5e', builtin: true },
];

const BUILTIN_PREFIX = { PRE: 'PD', SD: 'SD', DD: 'DD', CD: 'CD', BID: 'BD', CA: 'CA' };
const DEP_TYPES = ['FS', 'SS', 'FF', 'SF'];

function mergePhases(customPhases) {
  const all = [...BUILTIN_PHASES];
  (customPhases || []).forEach(cp => {
    all.push({ code: cp.code, name: cp.name, sort: cp.sort_order ?? 100, color: cp.color || '#9ca3af', builtin: false, id: cp.id });
  });
  return all.sort((a, b) => a.sort - b.sort);
}

function makePhaseMap(allPhases) { return Object.fromEntries(allPhases.map(p => [p.code, p])); }
function makePhaseSortMap(allPhases) { return Object.fromEntries(allPhases.map(p => [p.code, p.sort])); }

function getPhasePrefix(code, allPhases) {
  if (!code) return null;
  if (BUILTIN_PREFIX[code]) return BUILTIN_PREFIX[code];
  return code.substring(0, 2).toUpperCase();
}


/* ═══════════════════════════════════════════════════════════
   STYLES — Light theme matching deployed bundle
   ═══════════════════════════════════════════════════════════ */

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #f4f5f7; --surface: #fff; --surface2: #f0f1f3;
    --border: #e0e2e7; --border-hover: #c8cad1;
    --text: #1a1d27; --text-dim: #5a5e72; --text-muted: #8b8fa3;
    --accent: #3b82f6; --accent-light: rgba(59, 130, 246, 0.1);
    --accent-hover: #2563eb;
    --success: #22c55e; --warning: #f59e0b; --danger: #ef4444;
    --danger-light: rgba(239, 68, 68, 0.08);
    --critical: #ef4444;
    --today: #22c55e; --radius: 6px; --radius-lg: 10px;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
    --shadow: 0 2px 8px rgba(0,0,0,0.08);
    --font: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    --mono: 'JetBrains Mono', 'SF Mono', monospace;
  }
  body { font-family: var(--font); background: var(--bg); color: var(--text); line-height: 1.5; -webkit-font-smoothing: antialiased; }
  .app { max-width: 100%; margin: 0 auto; padding: 24px 40px; }

  /* Header */
  .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
  .header h1 { font-size: 22px; font-weight: 600; letter-spacing: -0.3px; display: flex; align-items: center; gap: 10px; }
  .header h1 .logo { background: linear-gradient(135deg, var(--accent), #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700; }
  .header-right { display: flex; align-items: center; gap: 16px; }
  .user-badge { display: inline-flex; align-items: center; gap: 8px; background: var(--surface); border: 1px solid var(--border); padding: 5px 12px; border-radius: 16px; font-size: 13px; color: var(--text-dim); }
  .role-tag { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; padding: 2px 6px; border-radius: 4px; font-weight: 700; background: var(--accent-light); color: var(--accent); }

  /* Sticky top section */
  .sticky-top { position: sticky; top: 0; z-index: 25; background: var(--bg); padding-bottom: 4px; }
  .gantt-toolbar-sticky { position: sticky; top: 0; z-index: 22; background: var(--surface); border-bottom: 1px solid var(--border); }

  /* Cards */
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; margin-bottom: 16px; box-shadow: var(--shadow-sm); }
  .card h2 { font-size: 14px; font-weight: 600; margin-bottom: 14px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px; }

  /* Selectors */
  .project-selector { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  .project-selector select, .project-selector .user-select {
    background: var(--surface2); border: 1px solid var(--border); color: var(--text);
    padding: 10px 14px; border-radius: var(--radius); font-family: var(--font); font-size: 14px;
    min-width: 280px; cursor: pointer; outline: none;
  }
  .project-selector select:focus { border-color: var(--accent); }

  /* Status bar */
  .status-bar { display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: var(--surface2); border-radius: var(--radius); font-size: 12px; color: var(--text-dim); margin-bottom: 16px; flex-wrap: wrap; }
  .status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

  /* Gantt wrapper + toolbar */
  .gantt-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); margin-bottom: 16px; box-shadow: var(--shadow-sm); overflow: visible; }
  .gantt-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 20; background: var(--surface); border-radius: var(--radius-lg) var(--radius-lg) 0 0; }
  .gantt-toolbar-left { display: flex; align-items: center; gap: 8px; }
  .gantt-toolbar-right { display: flex; align-items: center; gap: 8px; }
  .gantt-toggle { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-dim); cursor: pointer; user-select: none; }

  /* Gantt chart */
  .gantt-container { padding-bottom: 8px; }
  .gantt { position: relative; min-height: 200px; }
  .gantt-header { display: flex; border-bottom: 2px solid var(--border); position: sticky; top: 0; background: var(--surface); z-index: 4; }
  .gantt-month { text-align: center; font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; padding: 6px 0; border-right: 1px solid var(--border); }
  .gantt-month:last-child { border-right: none; }
  .gantt-body { position: relative; }
  .gantt-row { display: flex; align-items: center; border-bottom: 1px solid var(--border); position: relative; transition: background 0.1s; }
  .gantt-row:hover { background: rgba(59,130,246,0.02); }
  .gantt-row.phase-row { background: var(--surface2); }
  .gantt-row.dragging { opacity: 0.5; }
  .gantt-row.drag-over { border-top: 2px solid var(--accent); }
  .gantt-row:last-child { border-bottom: none; }
  .gantt-label { min-width: 120px; padding: 0 10px; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 6px; z-index: 1; background: inherit; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; border-right: 1px solid var(--border); flex-shrink: 0; }
  .gantt-label.task-label { font-size: 12px; font-weight: 400; padding-left: 16px; color: var(--text-dim); }
  .gantt-label .display-id { font-family: var(--mono); font-size: 10px; color: var(--accent); flex-shrink: 0; }
  .gantt-label .label-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .label-resize-handle { position: absolute; right: 0; top: 0; bottom: 0; width: 6px; cursor: col-resize; z-index: 5; background: transparent; }
  .label-resize-handle:hover { background: var(--accent-light); }
  .label-resize-handle:active { background: var(--accent); opacity: 0.3; }
  .drag-handle { cursor: grab; color: var(--text-muted); font-size: 12px; flex-shrink: 0; padding: 2px; opacity: 0.4; }
  .drag-handle:hover { opacity: 1; }
  .gantt-track { flex: 1; height: 100%; position: relative; }

  /* Gantt bars */
  .gantt-bar { position: absolute; height: 20px; top: 50%; transform: translateY(-50%); border-radius: 4px; }
  .gantt-bar-progress { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 4px; }
  .gantt-bar-label { position: absolute; left: 8px; top: 50%; transform: translateY(-50%); font-size: 10px; font-weight: 700; color: white; white-space: nowrap; text-shadow: 0 1px 2px rgba(0,0,0,0.2); overflow: hidden; text-overflow: ellipsis; max-width: calc(100% - 16px); }
  .gantt-task-bar { position: absolute; height: 14px; top: 50%; transform: translateY(-50%); border-radius: 3px; cursor: pointer; transition: box-shadow 0.15s; }
  .gantt-task-bar:hover { filter: brightness(1.1); box-shadow: 0 1px 4px rgba(0,0,0,0.15); }
  .gantt-task-bar.critical-bar { border: 2px solid var(--critical) !important; }
  .gantt-task-bar.selected { box-shadow: 0 0 0 2px var(--accent); }
  .gantt-task-bar-label { position: absolute; left: 4px; right: 4px; top: 50%; transform: translateY(-50%); font-size: 10px; font-weight: 500; color: rgba(255,255,255,0.95); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 1px 2px rgba(0,0,0,0.3); pointer-events: none; }
  .gantt-diamond { position: absolute; top: 50%; width: 10px; height: 10px; transform: translate(-50%, -50%) rotate(45deg); border: 2px solid var(--warning); background: var(--surface); z-index: 2; cursor: pointer; }
  .gantt-diamond.completed { background: var(--warning); }
  .gantt-diamond.critical-ms { border-color: var(--critical); }
  .gantt-diamond:hover { transform: translate(-50%, -50%) rotate(45deg) scale(1.3); }
  .gantt-gridline { position: absolute; top: 0; bottom: 0; width: 1px; background: var(--border); opacity: 0.4; pointer-events: none; }
  .gantt-today { position: absolute; top: 0; bottom: 0; width: 2px; background: var(--today); z-index: 3; pointer-events: none; }
  .gantt-today::before { content: 'TODAY'; position: absolute; top: -18px; left: 50%; transform: translateX(-50%); font-size: 9px; font-weight: 700; letter-spacing: 0.5px; color: var(--today); white-space: nowrap; }
  .gantt-resize-handle { position: absolute; top: 0; bottom: 0; width: 8px; cursor: ew-resize; z-index: 5; }
  .gantt-resize-handle.left { left: -4px; }
  .gantt-resize-handle.right { right: -4px; }
  .gantt-arrows { position: absolute; top: 0; left: 0; pointer-events: none; z-index: 2; }

  /* Tables */
  .phase-table { width: 100%; border-collapse: collapse; }
  .phase-table th { text-align: left; padding: 8px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); border-bottom: 1px solid var(--border); }
  .phase-table td { padding: 10px 12px; border-bottom: 1px solid var(--border); font-size: 14px; vertical-align: middle; }
  .phase-table tr:last-child td { border-bottom: none; }
  .phase-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 8px; vertical-align: middle; }
  .phase-table input[type="date"], .phase-table input[type="number"] {
    background: var(--surface2); border: 1px solid var(--border); color: var(--text);
    padding: 6px 10px; border-radius: 6px; font-family: var(--mono); font-size: 13px; outline: none;
  }
  .phase-table input:focus { border-color: var(--accent); }
  .phase-table input[type="number"] { width: 80px; text-align: center; }
  .phase-table input:disabled { opacity: 0.4; cursor: not-allowed; }
  .progress-cell { display: flex; align-items: center; gap: 6px; }
  .progress-track { flex: 1; height: 5px; background: var(--surface2); border-radius: 3px; overflow: hidden; min-width: 50px; }
  .progress-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
  .progress-label { font-size: 11px; color: var(--text-muted); font-family: var(--mono); min-width: 30px; }
  .duration-display { font-size: 12px; color: var(--text-muted); font-family: var(--mono); }

  /* Drawer */
  .drawer-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.2); z-index: 50; transition: opacity 0.25s; }
  .drawer { position: fixed; top: 0; right: 0; bottom: 0; width: 420px; background: var(--surface); border-left: 1px solid var(--border); box-shadow: -4px 0 24px rgba(0,0,0,0.1); z-index: 51; transform: translateX(0); transition: transform 0.25s ease; overflow-y: auto; display: flex; flex-direction: column; }
  .drawer-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 16px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
  .drawer-header h3 { font-size: 16px; font-weight: 600; }
  .drawer-close { width: 32px; height: 32px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); color: var(--text-muted); font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .drawer-close:hover { color: var(--text); background: var(--surface2); }
  .drawer-body { padding: 20px 24px; flex: 1; overflow-y: auto; }
  .drawer-field { margin-bottom: 16px; }
  .drawer-field label { display: block; font-size: 12px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
  .drawer-field input, .drawer-field select {
    width: 100%; padding: 8px 12px; background: var(--surface2); border: 1px solid var(--border);
    border-radius: 6px; color: var(--text); font-family: var(--font); font-size: 14px; outline: none;
  }
  .drawer-field input:focus, .drawer-field select:focus { border-color: var(--accent); }
  .drawer-field input:disabled, .drawer-field select:disabled { opacity: 0.4; cursor: not-allowed; }
  .drawer-row { display: flex; gap: 12px; }
  .drawer-row .drawer-field { flex: 1; }
  .drawer-anchor { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; background: var(--accent-light); color: var(--accent); padding: 3px 8px; border-radius: 4px; font-weight: 600; margin-bottom: 12px; }
  .drawer-summary { background: var(--surface2); border-radius: var(--radius); padding: 12px 14px; margin-bottom: 16px; font-size: 13px; color: var(--text-dim); line-height: 1.8; }
  .drawer-info { font-size: 12px; color: var(--accent); font-style: italic; margin-top: 4px; }
  .dep-type-row { display: flex; gap: 4px; margin-top: 4px; }
  .dep-type-btn { padding: 3px 8px; font-size: 11px; font-family: var(--mono); border: 1px solid var(--border); border-radius: 4px; background: var(--surface); color: var(--text-muted); cursor: pointer; }
  .dep-type-btn.active { background: var(--accent); color: white; border-color: var(--accent); }
  .drawer-footer { padding: 16px 24px; border-top: 1px solid var(--border); flex-shrink: 0; display: flex; gap: 8px; justify-content: flex-end; }

  /* Export / Modal dialog */
  .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.3); z-index: 200; display: flex; align-items: center; justify-content: center; }
  .modal { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 28px; width: 440px; max-height: 80vh; overflow-y: auto; box-shadow: var(--shadow); }
  .modal h3 { font-size: 18px; font-weight: 600; margin-bottom: 20px; }
  .modal-section { margin-bottom: 20px; }
  .modal-section label.section-title { font-size: 12px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 8px; }
  .modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 24px; }
  .phase-check { display: flex; align-items: center; gap: 8px; padding: 4px 0; font-size: 13px; cursor: pointer; }
  .phase-check input[type="checkbox"] { accent-color: var(--accent); width: 14px; height: 14px; }

  /* Buttons */
  .btn { display: inline-flex; align-items: center; gap: 5px; padding: 7px 14px; border-radius: var(--radius); font-family: var(--font); font-size: 13px; font-weight: 500; cursor: pointer; border: none; outline: none; transition: all 0.15s; }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-primary { background: var(--accent); color: white; }
  .btn-primary:hover:not(:disabled) { background: var(--accent-hover); }
  .btn-ghost { background: transparent; color: var(--text-dim); border: 1px solid var(--border); }
  .btn-ghost:hover:not(:disabled) { background: var(--surface2); color: var(--text); }
  .btn-danger { background: transparent; color: var(--danger); border: 1px solid var(--danger-light); }
  .btn-danger:hover:not(:disabled) { background: var(--danger-light); }
  .btn-sm { padding: 4px 10px; font-size: 12px; }
  .btn-group { display: flex; gap: 8px; }

  .checkbox-wrap { display: flex; align-items: center; cursor: pointer; gap: 8px; }
  .checkbox-wrap input { display: none; }
  .checkbox-box { width: 18px; height: 18px; border: 2px solid var(--border); border-radius: 4px; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
  .checkbox-wrap input:checked + .checkbox-box { background: var(--accent); border-color: var(--accent); }
  .check-icon { color: white; font-size: 11px; font-weight: 700; }

  .empty-state { text-align: center; padding: 48px 20px; color: var(--text-muted); }
  .empty-state p { font-size: 15px; margin-bottom: 8px; }
  .save-indicator { font-size: 12px; display: flex; align-items: center; gap: 4px; }
  .save-indicator.saving { color: var(--warning); }
  .save-indicator.saved { color: var(--success); }
  .save-indicator.error { color: var(--danger); }

  /* Custom phase form inline */
  .custom-phase-form { display: flex; gap: 8px; align-items: center; padding: 8px 0; }
  .custom-phase-form input { background: var(--surface2); border: 1px solid var(--border); color: var(--text); padding: 6px 10px; border-radius: 6px; font-size: 13px; outline: none; }
  .custom-phase-form input:focus { border-color: var(--accent); }
  .color-input { width: 32px; height: 32px; border: 1px solid var(--border); border-radius: 6px; padding: 2px; cursor: pointer; background: var(--surface2); }

  /* Search-select (project typeahead) */
  .selector-row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  .user-select-wrap { min-width: 240px; }
  .user-select-wrap select { width: 100%; padding: 9px 12px; background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius); font-family: var(--font); font-size: 14px; color: var(--text); outline: none; cursor: pointer; }
  .user-select-wrap select:focus { border-color: var(--accent); }
  .search-select { position: relative; min-width: 320px; flex: 1; max-width: 480px; }
  .search-select input { width: 100%; padding: 9px 12px; border: 1px solid var(--border); border-radius: var(--radius); font-family: var(--font); font-size: 14px; color: var(--text); background: var(--surface2); outline: none; }
  .search-select input::placeholder { color: var(--text-muted); }
  .search-select input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); }
  .search-select .dropdown { position: absolute; top: 100%; left: 0; right: 0; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); margin-top: 4px; max-height: 280px; overflow-y: auto; z-index: 30; box-shadow: var(--shadow); }
  .search-select .dropdown-item { padding: 8px 12px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 8px; }
  .search-select .dropdown-item:hover { background: var(--accent-light); }
  .search-select .dropdown-item .proj-num { font-family: var(--mono); font-size: 12px; color: var(--text-muted); min-width: 70px; }
  .search-select .dropdown-item .proj-name { color: var(--text); }
  .search-select .dropdown-item .proj-role { margin-left: auto; font-size: 10px; text-transform: uppercase; color: var(--accent); font-weight: 700; letter-spacing: 0.3px; }
  .search-select .no-results { padding: 12px; text-align: center; color: var(--text-muted); font-size: 13px; }

  /* Responsive */
  @media (max-width: 768px) {
    .app { padding: 16px; }
    .header { flex-direction: column; gap: 10px; align-items: flex-start; }
    .selector-row { flex-direction: column; }
    .search-select { min-width: 100%; max-width: 100%; }
    .user-select-wrap { min-width: 100%; }
    .gantt-label { width: 160px; min-width: 160px; }
    .drawer { width: 100%; }
    .modal { width: 90%; }
  }
`;


/* ═══════════════════════════════════════════════════════════
   UTILITY FUNCTIONS
   ═══════════════════════════════════════════════════════════ */

function daysBetween(d1, d2) { const a = new Date(d1+'T00:00:00'), b = new Date(d2+'T00:00:00'); return Math.round((b-a)/(864e5)); }
function addDays(s, d) { const dt = new Date(s+'T00:00:00'); dt.setDate(dt.getDate()+d); return dt.toISOString().split('T')[0]; }
function addBusinessDays(s, bd) { const d = new Date(s+'T00:00:00'); let a = 0; while (a < bd) { d.setDate(d.getDate()+1); if (d.getDay()!==0 && d.getDay()!==6) a++; } return d.toISOString().split('T')[0]; }
function formatShortDate(s) { if (!s) return ''; return new Date(s+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'}); }
function todayStr() { return new Date().toISOString().split('T')[0]; }
function hexToRGB(h) { return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]; }
function lightenColor(h, t) { const [r,g,b]=hexToRGB(h); return [Math.round(r*t+255*(1-t)),Math.round(g*t+255*(1-t)),Math.round(b*t+255*(1-t))]; }

function getMonthsBetween(s, e) {
  const months = [], start = new Date(s+'T00:00:00'), end = new Date(e+'T00:00:00'), cur = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cur <= end) { const ms = new Date(cur); cur.setMonth(cur.getMonth()+1); const me = new Date(cur); me.setDate(me.getDate()-1); months.push({ label: ms.toLocaleDateString('en-US',{month:'short',year:'2-digit'}), start: ms, end: me }); }
  return months;
}

function sortTasks(tasks, phaseSortMap) {
  return [...tasks].sort((a, b) => {
    if (a.sort_order !== b.sort_order) return (a.sort_order || 0) - (b.sort_order || 0);
    const pa = phaseSortMap[a.phase_code] ?? 99, pb = phaseSortMap[b.phase_code] ?? 99;
    if (pa !== pb) return pa - pb;
    if (a.start_date && b.start_date) return a.start_date.localeCompare(b.start_date);
    return 0;
  });
}

function assignDisplayIds(tasks, allPhases) {
  const counters = {};
  return tasks.map(t => {
    const prefix = getPhasePrefix(t.phase_code, allPhases) || 'PT';
    counters[prefix] = (counters[prefix] || 0) + 1;
    return { ...t, _displayId: `${prefix}-${counters[prefix]}` };
  });
}


/* ═══════════════════════════════════════════════════════════
   PROJECT SEARCH SELECT — Typeahead filtered by user
   ═══════════════════════════════════════════════════════════ */

function ProjectSearchSelect({ projects, currentUser, selectedProject, onSelect }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  // Filter projects to only those where currentUser is PM, DM, or Principal
  const userProjects = useMemo(() => {
    if (!currentUser) return [];
    const u = currentUser.toLowerCase();
    return projects.filter(p =>
      [p.pm, p.dm, p.principal].some(r => r && r.toLowerCase() === u)
    );
  }, [projects, currentUser]);

  // Further filter by search term
  const filtered = useMemo(() => {
    if (!search.trim()) return userProjects;
    const s = search.toLowerCase();
    return userProjects.filter(p =>
      p.project_number.toLowerCase().includes(s) ||
      (p.project_name && p.project_name.toLowerCase().includes(s))
    );
  }, [userProjects, search]);

  // Get user's role on a project
  const getRole = (proj) => {
    if (!currentUser) return '';
    const u = currentUser.toLowerCase();
    if (proj.principal && proj.principal.toLowerCase() === u) return 'Principal';
    if (proj.dm && proj.dm.toLowerCase() === u) return 'DM';
    if (proj.pm && proj.pm.toLowerCase() === u) return 'PM';
    return '';
  };

  // Click outside to close
  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Display value
  const selected = projects.find(p => p.project_number === selectedProject);
  const displayValue = open ? search : selected ? `${selected.project_number} — ${selected.project_name}` : '';

  return (
    <div className="search-select" ref={wrapRef}>
      <input
        ref={inputRef}
        type="text"
        placeholder={currentUser ? `Search ${userProjects.length} projects...` : 'Select your name first...'}
        value={displayValue}
        disabled={!currentUser}
        onChange={e => { setSearch(e.target.value); setOpen(true); }}
        onFocus={() => { setSearch(''); setOpen(true); }}
      />
      {open && currentUser && (
        <div className="dropdown">
          {filtered.length === 0 ? (
            <div className="no-results">No matching projects</div>
          ) : (
            filtered.map(p => (
              <div key={p.project_number} className="dropdown-item" onClick={() => {
                onSelect(p.project_number);
                setOpen(false);
                setSearch('');
                inputRef.current?.blur();
              }}>
                <span className="proj-num">{p.project_number}</span>
                <span className="proj-name">{p.project_name}</span>
                <span className="proj-role">{getRole(p)}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════
   CRITICAL PATH — Single Longest Dependency Chain
   Only the single longest path through connected dependency
   chains is marked as critical. All zero-float tasks within
   the longest-spanning connected component are included.
   ═══════════════════════════════════════════════════════════ */

function computeCriticalPath(tasks) {
  try {
    const dated = tasks.filter(t => t.start_date);
    if (dated.length < 2) return new Set();

    // Build adjacency maps
    const successors = {}, predecessors = {};
    dated.forEach(t => {
      if (t.depends_on) {
        if (!successors[t.depends_on]) successors[t.depends_on] = [];
        successors[t.depends_on].push(t.id);
        predecessors[t.id] = t.depends_on;
      }
    });

    // Only tasks that participate in at least one dependency
    const inChain = new Set();
    dated.forEach(t => { if (predecessors[t.id] || successors[t.id]) inChain.add(t.id); });
    const chainTasks = dated.filter(t => inChain.has(t.id));
    if (chainTasks.length < 2) return new Set();

    // Find connected components via BFS
    const visited = new Set(), components = [];
    function bfs(sid) {
      const c = new Set(), q = [sid];
      while (q.length) {
        const id = q.shift();
        if (c.has(id)) continue;
        c.add(id); visited.add(id);
        (successors[id]||[]).forEach(s => { if (inChain.has(s) && !c.has(s)) q.push(s); });
        if (predecessors[id] && inChain.has(predecessors[id]) && !c.has(predecessors[id])) q.push(predecessors[id]);
      }
      return c;
    }
    chainTasks.forEach(t => { if (!visited.has(t.id)) components.push(bfs(t.id)); });

    // For each component, compute forward/backward pass, find zero-float tasks
    let longestSpan = -1, longestCrit = new Set();

    for (const comp of components) {
      const ct = chainTasks.filter(t => comp.has(t.id));
      if (ct.length < 2) continue;

      const dur = {};
      ct.forEach(t => { dur[t.id] = t.end_date ? daysBetween(t.start_date, t.end_date) : 0; });

      // Topological sort
      const inDeg = {};
      ct.forEach(t => { inDeg[t.id] = 0; });
      ct.forEach(t => { if (predecessors[t.id] && comp.has(predecessors[t.id])) inDeg[t.id]++; });
      const q = ct.filter(t => inDeg[t.id] === 0).map(t => t.id);
      const topo = [], vis = new Set();
      while (q.length) {
        const id = q.shift();
        if (vis.has(id)) continue;
        vis.add(id); topo.push(id);
        (successors[id]||[]).forEach(s => {
          if (comp.has(s) && !vis.has(s)) { inDeg[s]--; if (inDeg[s] <= 0) q.push(s); }
        });
      }
      // Add any not yet visited (cycle fallback)
      ct.forEach(t => { if (!vis.has(t.id)) topo.push(t.id); });

      // Forward pass: earliest start / earliest finish
      const ES = {}, EF = {};
      for (const id of topo) {
        const tk = ct.find(t => t.id === id);
        if (!tk) continue;
        ES[id] = (predecessors[id] && comp.has(predecessors[id]))
          ? EF[predecessors[id]] + (tk.gap_business_days || 0)
          : 0;
        EF[id] = ES[id] + dur[id];
      }

      const compEnd = Math.max(...ct.map(t => EF[t.id]).filter(v => isFinite(v)));
      if (!isFinite(compEnd)) continue;

      // Backward pass: latest start / latest finish
      const LF = {}, LS = {};
      for (let i = topo.length - 1; i >= 0; i--) {
        const id = topo[i];
        const sc = (successors[id] || []).filter(s => comp.has(s));
        LF[id] = sc.length === 0
          ? compEnd
          : Math.min(...sc.map(s => {
              const st = ct.find(t => t.id === s);
              return LS[s] - (st ? (st.gap_business_days || 0) : 0);
            }));
        LS[id] = LF[id] - dur[id];
      }

      // Zero-float tasks = critical
      const crit = new Set();
      ct.forEach(t => { if (LS[t.id] - ES[t.id] <= 0) crit.add(t.id); });

      // Only keep the longest-spanning component's critical set
      if (compEnd > longestSpan) {
        longestSpan = compEnd;
        longestCrit = crit;
      }
    }

    return longestCrit;
  } catch (e) {
    console.warn('Critical path error:', e);
    return new Set();
  }
}


/* ═══════════════════════════════════════════════════════════
   GANTT CHART COMPONENT
   ═══════════════════════════════════════════════════════════ */

function GanttChart({ allPhases, phaseMap, schedulePhases, tasks, selectedTaskId, onSelectTask,
  criticalSet, showCritical, canEdit, onResizeEnd, onReorder, wrapRef, containerWidth }) {

  const phasesWithDates = schedulePhases.filter(p => p.phase_start && p.phase_end);
  const tasksWithDates = tasks.filter(t => t.start_date);
  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [labelWidth, setLabelWidth] = useState(220);

  // Draggable label column resize
  const handleLabelResize = useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = labelWidth;
    const onMove = (me) => {
      const newW = Math.max(120, Math.min(500, startW + (me.clientX - startX)));
      setLabelWidth(newW);
    };
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [labelWidth]);

  if (!phasesWithDates.length && !tasksWithDates.length) {
    return <div className="empty-state"><p>No phases scheduled yet</p></div>;
  }

  // Build rows: unphased first, then phase headers + tasks
  const finalRows = [];
  const usedPhaseCodes = new Set([...phasesWithDates.map(p => p.phase_code), ...tasksWithDates.map(t => t.phase_code).filter(Boolean)]);

  const unphasedTasks = tasksWithDates.filter(t => !t.phase_code);
  if (unphasedTasks.length) {
    finalRows.push({ type: 'phase-header', pDef: { code: '__none', name: 'Project Tasks', color: '#6b7280' }, phase: null });
    unphasedTasks.forEach(t => finalRows.push({ type: 'task', pDef: { color: '#6b7280' }, t }));
  }
  allPhases.forEach(pDef => {
    if (!usedPhaseCodes.has(pDef.code)) return;
    const phase = phasesWithDates.find(p => p.phase_code === pDef.code);
    finalRows.push({ type: 'phase-header', pDef, phase });
    tasksWithDates.filter(t => t.phase_code === pDef.code).forEach(t => finalRows.push({ type: 'task', pDef, t }));
  });

  // Timeline
  const allDates = phasesWithDates.flatMap(p => [p.phase_start, p.phase_end]);
  tasksWithDates.forEach(t => { allDates.push(t.start_date); if (t.end_date) allDates.push(t.end_date); });
  allDates.push(todayStr());
  const sorted = allDates.sort();
  const minDate = addDays(sorted[0], -14), maxDate = addDays(sorted[sorted.length-1], 14);
  const totalDays = daysBetween(minDate, maxDate);
  const trackWidth = Math.max(600, containerWidth - labelWidth - 2);
  const pxPerDay = trackWidth / totalDays;
  const totalWidth = trackWidth;
  const months = getMonthsBetween(minDate, maxDate);
  const getX = d => daysBetween(minDate, d) * pxPerDay;
  const today = todayStr(), todayX = getX(today);

  const PH = 40, TH = 32;
  const rowYs = {};
  let totalHeight = 0;
  finalRows.forEach(r => {
    const h = r.type === 'phase-header' ? PH : TH;
    const key = r.type === 'phase-header' ? `ph:${r.pDef.code}` : `t:${r.t.id}`;
    rowYs[key] = totalHeight + h/2;
    totalHeight += h;
  });

  // Dependency arrows
  const depArrows = [];
  tasksWithDates.forEach(t => {
    if (!t.depends_on) return;
    const from = tasksWithDates.find(s => s.id === t.depends_on);
    if (!from?.start_date) return;
    const dt = t.dependency_type || 'FS';
    const fE = from.end_date || from.start_date, fS = from.start_date, tS = t.start_date, tE = t.end_date || t.start_date;
    let fX, tX;
    switch(dt) {
      case 'SS': fX=labelWidth+getX(fS); tX=labelWidth+getX(tS); break;
      case 'FF': fX=labelWidth+getX(fE); tX=labelWidth+getX(tE); break;
      case 'SF': fX=labelWidth+getX(fS); tX=labelWidth+getX(tE); break;
      default:   fX=labelWidth+getX(fE); tX=labelWidth+getX(tS);
    }
    const fY = rowYs[`t:${from.id}`], tY = rowYs[`t:${t.id}`];
    if (fY === undefined || tY === undefined) return;
    depArrows.push({ fromX:fX, toX:tX, fromY:fY, toY:tY, isCrit: showCritical && criticalSet.has(t.id) && criticalSet.has(from.id) });
  });

  // Drag handlers
  const handleDragStart = (e, taskId) => { setDragId(taskId); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e, taskId) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverId(taskId); };
  const handleDrop = (e, targetId) => { e.preventDefault(); setDragOverId(null); if (dragId && dragId !== targetId && onReorder) onReorder(dragId, targetId); setDragId(null); };
  const handleDragEnd = () => { setDragId(null); setDragOverId(null); };

  // Resize
  const handleResizeStart = (e, taskId, side) => {
    e.stopPropagation(); e.preventDefault();
    const task = tasksWithDates.find(t => t.id === taskId); if (!task) return;
    const sX = e.clientX, oS = task.start_date, oE = task.end_date || task.start_date;
    const onMove = me => {
      const dd = Math.round((me.clientX - sX) / pxPerDay);
      if (side === 'right') { const ne = addDays(oE, dd); if (daysBetween(oS, ne) > 0) onResizeEnd(taskId, 'end_date', ne); }
      else { const ns = addDays(oS, dd); if (daysBetween(ns, oE) > 0) onResizeEnd(taskId, 'start_date', ns); }
    };
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
  };

  return (
    <div className="gantt-container">
      <div className="gantt" style={{ width: totalWidth + labelWidth }}>
        <div className="gantt-header">
          <div style={{ width: labelWidth, minWidth: labelWidth, padding: '6px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', borderRight: '1px solid var(--border)', position: 'relative', flexShrink: 0 }}>
            Task / Phase
            <div className="label-resize-handle" onMouseDown={handleLabelResize} />
          </div>
          <div style={{ flex: 1, display: 'flex' }}>
            {months.map((m,i) => {
              const ms = m.start.toISOString().split('T')[0], me = m.end.toISOString().split('T')[0];
              const w = daysBetween(ms<minDate?minDate:ms, me>maxDate?maxDate:me)*pxPerDay;
              return <div key={i} className="gantt-month" style={{width:w}}>{m.label}</div>;
            })}
          </div>
        </div>
        <div className="gantt-body" style={{ minHeight: totalHeight }}>
          {months.map((m,i) => { const ms = m.start.toISOString().split('T')[0]; return ms>=minDate&&ms<=maxDate ? <div key={`g${i}`} className="gantt-gridline" style={{left:labelWidth+getX(ms)}} /> : null; })}
          {today>=minDate&&today<=maxDate && <div className="gantt-today" style={{left:labelWidth+todayX}} />}

          <svg className="gantt-arrows" style={{ width:totalWidth+labelWidth, height:totalHeight }}>
            <defs>
              <marker id="arr" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 6 3 L 0 6 z" fill="var(--text-muted)" /></marker>
              <marker id="arr-c" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 6 3 L 0 6 z" fill="var(--critical)" /></marker>
            </defs>
            {depArrows.map((a,i) => {
              const mx = (a.fromX+a.toX)/2;
              return <path key={i} d={`M ${a.fromX} ${a.fromY} C ${mx} ${a.fromY}, ${mx} ${a.toY}, ${a.toX} ${a.toY}`}
                stroke={a.isCrit?'var(--critical)':'var(--text-muted)'} strokeWidth={a.isCrit?2:1.5} fill="none"
                markerEnd={a.isCrit?'url(#arr-c)':'url(#arr)'} />;
            })}
          </svg>

          {finalRows.map((row, ri) => {
            if (row.type === 'phase-header') {
              const { pDef, phase } = row;
              return (
                <div key={`ph-${pDef.code}`} className="gantt-row phase-row" style={{height:PH}}>
                  <div className="gantt-label" style={{width:labelWidth,minWidth:labelWidth}}><span className="phase-dot" style={{background:pDef.color}} /><span className="label-text" style={{fontWeight:600}}>{pDef.name}</span></div>
                  <div className="gantt-track">
                    {phase && <div className="gantt-bar" style={{ left: getX(phase.phase_start), width: Math.max(daysBetween(phase.phase_start, phase.phase_end)*pxPerDay, 4), background: `${pDef.color}44`, border: `1px solid ${pDef.color}` }}>
                      <div className="gantt-bar-progress" style={{ width: `${phase.percent_complete||0}%`, background: pDef.color, opacity: 0.35 }} />
                      {daysBetween(phase.phase_start, phase.phase_end)*pxPerDay > 80 && <span className="gantt-bar-label">{pDef.name} — {formatShortDate(phase.phase_start)} – {formatShortDate(phase.phase_end)}</span>}
                    </div>}
                  </div>
                </div>
              );
            }
            const { pDef, t } = row;
            const isMs = !t.end_date || t.start_date === t.end_date;
            const isCrit = showCritical && criticalSet.has(t.id);
            const isSel = selectedTaskId === t.id;
            const isDragging = dragId === t.id;
            const isDragOver = dragOverId === t.id;
            return (
              <div key={`t-${t.id}`}
                className={`gantt-row ${isDragging?'dragging':''} ${isDragOver?'drag-over':''}`}
                style={{ height: TH, background: isCrit ? 'rgba(239,68,68,0.04)' : undefined }}
                draggable={canEdit} onDragStart={e=>handleDragStart(e,t.id)} onDragOver={e=>handleDragOver(e,t.id)}
                onDrop={e=>handleDrop(e,t.id)} onDragEnd={handleDragEnd}
                onClick={() => onSelectTask(t.id)}
              >
                <div className="gantt-label task-label" style={{width:labelWidth,minWidth:labelWidth}}>
                  {canEdit && <span className="drag-handle" title="Drag to reorder">⋮⋮</span>}
                  <span className="display-id">{t._displayId||''}</span>
                  <span className="label-text">{t.milestone_name||'(unnamed)'}</span>
                </div>
                <div className="gantt-track">
                  {isMs ? (
                    <div className={`gantt-diamond ${t.is_completed?'completed':''} ${isCrit?'critical-ms':''}`} style={{left:getX(t.start_date)}} />
                  ) : (
                    <div className={`gantt-task-bar ${isCrit?'critical-bar':''} ${isSel?'selected':''}`}
                      style={{ left: getX(t.start_date), width: Math.max(daysBetween(t.start_date, t.end_date)*pxPerDay, 4), background: `${pDef.color}88`, border: `1px solid ${pDef.color}` }}>
                      {daysBetween(t.start_date, t.end_date)*pxPerDay > 30 && <span className="gantt-task-bar-label">{t.milestone_name||''}</span>}
                      {canEdit && <><div className="gantt-resize-handle left" onMouseDown={e=>handleResizeStart(e,t.id,'left')} /><div className="gantt-resize-handle right" onMouseDown={e=>handleResizeStart(e,t.id,'right')} /></>}
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

function TaskDrawer({ task, tasks, allPhases, phaseMap, canEdit, onUpdate, onDateChange, onClose, onDelete }) {
  if (!task) return null;
  const isTask = task.end_date && task.start_date !== task.end_date;
  const anchor = task.phase_anchor;
  const color = phaseMap[task.phase_code]?.color || '#6b7280';

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-header">
          <h3>
            <span style={{width:12,height:12,borderRadius:isTask?3:0,transform:isTask?'none':'rotate(45deg)',background:isTask?color:'transparent',border:isTask?'none':`2px solid ${color}`,display:'inline-block',marginRight:8,verticalAlign:'middle'}} />
            {isTask ? 'Edit Task' : 'Edit Milestone'}
          </h3>
          <button className="drawer-close" onClick={onClose}>✕</button>
        </div>
        <div className="drawer-body">
          {anchor && <div className="drawer-anchor">⊳ Locked to {phaseMap[anchor.split('_')[0]]?.name||''} {anchor.split('_')[1]?.toLowerCase()||''}</div>}
          <div className="drawer-summary">
            <span style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--accent)',marginRight:6}}>{task._displayId||''}</span>
            <strong style={{color:'var(--text)'}}>{task.milestone_name||'(unnamed)'}</strong><br/>
            {task.start_date && <span>{formatShortDate(task.start_date)}{isTask?` → ${formatShortDate(task.end_date)}`:''}<br/></span>}
            {task.duration_business_days ? <span>{task.duration_business_days} business days<br/></span> : null}
            {task.phase_code && <span>Phase: {phaseMap[task.phase_code]?.name||task.phase_code}</span>}
          </div>
          <div className="drawer-field"><label>Name</label><input type="text" value={task.milestone_name||''} disabled={!canEdit} onChange={e=>onUpdate(task.id,'milestone_name',e.target.value)} /></div>
          <div className="drawer-field"><label>Phase</label>
            <select value={task.phase_code||''} disabled={!canEdit||!!anchor} onChange={e=>onUpdate(task.id,'phase_code',e.target.value||null)}>
              <option value="">No phase</option>
              {allPhases.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
            </select>
          </div>
          <div className="drawer-row">
            <div className="drawer-field"><label>Start Date</label><input type="date" value={task.start_date||''} disabled={!canEdit||!!anchor} onChange={e=>onDateChange(task.id,'start_date',e.target.value)} /></div>
            <div className="drawer-field"><label>End Date</label><input type="date" value={task.end_date||''} disabled={!canEdit||(task.duration_business_days&&task.start_date)||!!anchor} onChange={e=>onDateChange(task.id,'end_date',e.target.value)} /></div>
          </div>
          <div className="drawer-field"><label>Duration (business days)</label>
            <input type="number" min="0" value={task.duration_business_days??''} disabled={!canEdit} onChange={e=>{const v=parseInt(e.target.value)||0; onUpdate(task.id,'duration_business_days',v||null); if(v&&task.start_date) onDateChange(task.id,'end_date',addBusinessDays(task.start_date,v));}} />
          </div>
          <div className="drawer-field"><label>Depends On</label>
            <select value={task.depends_on||''} disabled={!canEdit} onChange={e=>onUpdate(task.id,'depends_on',e.target.value||null)}>
              <option value="">None</option>
              {tasks.filter(t=>t.id!==task.id).map(t => <option key={t.id} value={t.id}>{t._displayId||''} {t.milestone_name||'(unnamed)'}</option>)}
            </select>
            {task.depends_on && <div className="dep-type-row">{DEP_TYPES.map(dt => <button key={dt} className={`dep-type-btn ${(task.dependency_type||'FS')===dt?'active':''}`} onClick={()=>canEdit&&onUpdate(task.id,'dependency_type',dt)}>{dt}</button>)}</div>}
          </div>
          {task.depends_on && <div className="drawer-field"><label>Gap (business days)</label><input type="number" min="0" value={task.gap_business_days??0} disabled={!canEdit} onChange={e=>onUpdate(task.id,'gap_business_days',parseInt(e.target.value)||0)} /></div>}
          <div className="drawer-field"><label className="checkbox-wrap">
            <input type="checkbox" checked={task.is_completed||false} disabled={!canEdit} onChange={e=>onUpdate(task.id,'is_completed',e.target.checked)} />
            <span className="checkbox-box">{task.is_completed&&<span className="check-icon">✓</span>}</span>
            <span style={{fontSize:14}}>Mark as completed</span>
          </label></div>
        </div>
        {canEdit && <div className="drawer-footer"><button className="btn btn-danger" onClick={()=>{onDelete(task.id);onClose();}}>Delete {isTask?'Task':'Milestone'}</button></div>}
      </div>
    </>
  );
}


/* ═══════════════════════════════════════════════════════════
   EXPORT DIALOG — Phase filtering + date range
   ═══════════════════════════════════════════════════════════ */

function ExportDialog({ allPhases, onExport, onClose }) {
  const [selectedPhases, setSelectedPhases] = useState(new Set(allPhases.map(p => p.code)));
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [exporting, setExporting] = useState(false);

  const togglePhase = (code) => {
    setSelectedPhases(prev => { const n = new Set(prev); if (n.has(code)) n.delete(code); else n.add(code); return n; });
  };
  const selectAll = () => setSelectedPhases(new Set(allPhases.map(p => p.code)));
  const selectNone = () => setSelectedPhases(new Set());

  const handleExport = async () => {
    setExporting(true);
    await onExport({ phases: selectedPhases, dateStart: dateStart || null, dateEnd: dateEnd || null });
    setExporting(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Export PDF</h3>

        <div className="modal-section">
          <label className="section-title">Phases to Include</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={selectAll}>All</button>
            <button className="btn btn-ghost btn-sm" onClick={selectNone}>None</button>
          </div>
          {allPhases.map(p => (
            <label key={p.code} className="phase-check">
              <input type="checkbox" checked={selectedPhases.has(p.code)} onChange={() => togglePhase(p.code)} />
              <span className="phase-dot" style={{ background: p.color }} />
              {p.name}
            </label>
          ))}
          <label className="phase-check">
            <input type="checkbox" checked={selectedPhases.has('__none')} onChange={() => togglePhase('__none')} />
            <span className="phase-dot" style={{ background: '#6b7280' }} />
            Unphased Tasks
          </label>
        </div>

        <div className="modal-section">
          <label className="section-title">Date Range (optional)</label>
          <div className="drawer-row">
            <div className="drawer-field"><label>From</label><input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} /></div>
            <div className="drawer-field"><label>To</label><input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} /></div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Leave blank to include full timeline</div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleExport} disabled={exporting || selectedPhases.size === 0}>
            {exporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </div>
    </div>
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
  await new Promise((r, j) => { s.onload = r; s.onerror = j; document.head.appendChild(s); });
  jspdfMod = window.jspdf;
  return jspdfMod;
}

async function exportPDF(project, allPhases, phaseMap, schedulePhases, tasks, criticalSet, opts) {
  const { jsPDF } = await loadJsPDF();
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: [792, 1224] });
  const W = 1224, H = 792, M = 36, CW = W - M*2;

  const selPhases = opts.phases || new Set();
  const filteredTasks = tasks.filter(t => {
    if (!t.phase_code) return selPhases.has('__none');
    return selPhases.has(t.phase_code);
  });
  const filteredSchedulePhases = schedulePhases.filter(p => selPhases.has(p.phase_code));

  // Header
  doc.setFontSize(20); doc.setFont('helvetica','bold'); doc.setTextColor(26,29,39);
  doc.text('ESa Schedule', M, M+16);
  doc.setFontSize(12); doc.setFont('helvetica','normal'); doc.setTextColor(90);
  doc.text(`${project.project_number} — ${project.project_name}`, M+140, M+16);
  doc.setFontSize(9); doc.setTextColor(120);
  doc.text(`PM: ${project.pm||'—'}  |  DM: ${project.dm||'—'}  |  Principal: ${project.principal||'—'}`, M, M+32);
  doc.text(`Exported: ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}`, W-M, M+32, {align:'right'});
  doc.setDrawColor(200); doc.setLineWidth(0.5); doc.line(M, M+40, W-M, M+40);

  // Build rows
  const pWD = filteredSchedulePhases.filter(p => p.phase_start && p.phase_end);
  const sT = filteredTasks.filter(t => t.start_date);
  const rows = [];
  const unphased = sT.filter(t => !t.phase_code);
  if (unphased.length && selPhases.has('__none')) {
    rows.push({ type: 'phase', pDef: { name: 'Project Tasks', color: '#6b7280' }, phase: null });
    unphased.forEach(t => rows.push({ type: 'task', pDef: { color: '#6b7280' }, t }));
  }
  allPhases.forEach(pd => {
    if (!selPhases.has(pd.code)) return;
    const ph = pWD.find(p => p.phase_code === pd.code);
    const phaseTasks = sT.filter(t => t.phase_code === pd.code);
    if (!ph && !phaseTasks.length) return;
    rows.push({ type: 'phase', pDef: pd, phase: ph });
    phaseTasks.forEach(t => rows.push({ type: 'task', pDef: pd, t }));
  });

  if (!rows.length) { doc.save(`ESa_Schedule_${project.project_number}.pdf`); return; }

  // Timeline
  const aD = pWD.flatMap(p => [p.phase_start, p.phase_end]);
  sT.forEach(t => { aD.push(t.start_date); if(t.end_date) aD.push(t.end_date); }); aD.push(todayStr()); aD.sort();

  let cMin = addDays(aD[0], -7), cMax = addDays(aD[aD.length-1], 7);
  if (opts.dateStart) cMin = opts.dateStart;
  if (opts.dateEnd) cMax = opts.dateEnd;

  const cDays = daysBetween(cMin, cMax);
  if (cDays <= 0) { doc.save(`ESa_Schedule_${project.project_number}.pdf`); return; }
  const lW = 160, cLeft = M+lW, cW2 = CW-lW, ppd = cW2/cDays;
  const gX = d => daysBetween(cMin, d)*ppd;

  const phH = 16, tkH = 12;
  const needed = rows.reduce((s,r)=>s+(r.type==='phase'?phH:tkH),0);
  const avail = H-M-80-50;
  const sc = needed>avail ? avail/needed : 1;
  const sPH = Math.max(10, Math.floor(phH*sc)), sTH = Math.max(8, Math.floor(tkH*sc));

  let y = M+56;
  const mos = getMonthsBetween(cMin, cMax);
  doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(120);
  mos.forEach(m => { const ms=m.start.toISOString().split('T')[0], me=m.end.toISOString().split('T')[0]; const cs=ms<cMin?cMin:ms, ce=me>cMax?cMax:me; const x=cLeft+gX(cs), w=daysBetween(cs,ce)*ppd; if(w>20) doc.text(m.label.toUpperCase(), x+w/2, y, {align:'center'}); });
  y+=6; doc.setDrawColor(180); doc.setLineWidth(1); doc.line(M,y,W-M,y); y+=2;
  const cTop=y, cBot=y+rows.reduce((s,r)=>s+(r.type==='phase'?sPH:sTH),0);

  // Grid
  doc.setDrawColor(230); doc.setLineWidth(0.3);
  mos.forEach(m => { const ms=m.start.toISOString().split('T')[0]; if(ms>=cMin&&ms<=cMax) doc.line(cLeft+gX(ms),cTop,cLeft+gX(ms),cBot); });
  doc.setDrawColor(200); doc.setLineWidth(0.5); doc.line(cLeft-4,cTop,cLeft-4,cBot);

  // Today
  const td=todayStr();
  if(td>=cMin&&td<=cMax) { const tx=cLeft+gX(td); doc.setDrawColor(34,197,94); doc.setLineWidth(1.5); doc.line(tx,cTop-8,tx,cBot); doc.setFontSize(5); doc.setTextColor(34,197,94); doc.text('TODAY',tx,cTop-2,{align:'center'}); }

  // Rows
  rows.forEach(row => {
    if(row.type==='phase') {
      const{pDef,phase}=row; const rH=sPH,mY=y+rH/2;
      const[r,g,b]=hexToRGB(pDef.color); const[lr,lg,lb]=lightenColor(pDef.color,0.08);
      doc.setFillColor(lr,lg,lb); doc.rect(M,y,CW,rH,'F');
      doc.setFillColor(r,g,b); doc.circle(M+6,mY,3,'F');
      doc.setFontSize(8); doc.setFont('helvetica','bold'); doc.setTextColor(40); doc.text(pDef.name,M+14,mY+3);
      if(phase) { const bx=cLeft+gX(phase.phase_start),bw=Math.max(daysBetween(phase.phase_start,phase.phase_end)*ppd,2); const[br,bg2,bb]=lightenColor(pDef.color,0.15); doc.setFillColor(br,bg2,bb); doc.setDrawColor(r,g,b); doc.setLineWidth(1); doc.roundedRect(bx,mY-5,bw,10,2,2,'FD'); if(phase.percent_complete>0){const pw=bw*(phase.percent_complete/100);const[pr,pg,pb]=lightenColor(pDef.color,0.4);doc.setFillColor(pr,pg,pb);doc.roundedRect(bx,mY-5,pw,10,2,2,'F');} doc.setFontSize(5);doc.setFont('helvetica','normal');doc.setTextColor(120);const dl=`${formatShortDate(phase.phase_start)} – ${formatShortDate(phase.phase_end)}`;if(bx+bw+4+doc.getTextWidth(dl)<W-M) doc.text(dl,bx+bw+4,mY+2); }
      y+=rH;
    } else {
      const{pDef,t}=row; const rH=sTH,mY=y+rH/2; const isCrit=criticalSet?.has(t.id); const isMs=!t.end_date||t.start_date===t.end_date;
      if(isCrit){doc.setFillColor(254,242,242);doc.rect(M,y,CW,rH,'F');}
      const nm=t.milestone_name||'(unnamed)'; const dn=nm.length>38?nm.substring(0,37)+'…':nm;
      doc.setFontSize(6.5); doc.setFont('helvetica',isCrit?'bold':'normal');
      const did=t._displayId||'';
      if(did){doc.setTextColor(59,130,246);doc.text(did,M+16,mY+2);doc.setTextColor(isCrit?180:80,isCrit?40:80,isCrit?40:80);doc.text(dn,M+16+doc.getTextWidth(did)+4,mY+2);}
      else{doc.setTextColor(80);doc.text(dn,M+16,mY+2);}
      if(isMs){const mx=cLeft+gX(t.start_date),sz=4;doc.setFillColor(isCrit?239:245,isCrit?68:158,isCrit?68:11);doc.triangle(mx,mY-sz,mx+sz,mY,mx,mY+sz,'F');doc.triangle(mx,mY-sz,mx,mY+sz,mx-sz,mY,'F');}
      else{const bx=cLeft+gX(t.start_date),bw=Math.max(daysBetween(t.start_date,t.end_date)*ppd,2);const[r,g,b]=hexToRGB(pDef.color);doc.setFillColor(r,g,b);doc.roundedRect(bx,mY-3,bw,6,1,1,'F');if(isCrit){doc.setDrawColor(239,68,68);doc.setLineWidth(1);doc.roundedRect(bx,mY-3,bw,6,1,1,'D');}}
      y+=rH;
    }
  });

  // Legend
  const legendY = Math.min(y + 16, H - 40);
  doc.setFontSize(6); doc.setFont('helvetica','bold'); doc.setTextColor(100); doc.text('LEGEND', M, legendY);
  let lx = M + 40;
  allPhases.filter(p => selPhases.has(p.code)).forEach(p => {
    const [r,g,b] = hexToRGB(p.color);
    doc.setFillColor(r,g,b); doc.roundedRect(lx, legendY-4, 12, 6, 1, 1, 'F');
    doc.setTextColor(80); doc.setFont('helvetica','normal'); doc.text(p.name, lx+16, legendY);
    lx += doc.getTextWidth(p.name) + 30;
  });
  if (criticalSet && criticalSet.size > 0) { doc.setDrawColor(239,68,68); doc.setLineWidth(1.5); doc.line(lx, legendY-1, lx+12, legendY-1); doc.setTextColor(239,68,68); doc.text('Critical Path', lx+16, legendY); }

  // Footer
  doc.setFontSize(7); doc.setFont('helvetica','normal'); doc.setTextColor(160);
  doc.text('Earl Swensson Associates | ESa Schedule ' + project.project_number + ' — ' + project.project_name, M, H-14);
  doc.text(new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}), W-M, H-14, {align:'right'});

  doc.save(`ESa_Schedule_${project.project_number.replace(/\./g,'-')}.pdf`);
}


/* ═══════════════════════════════════════════════════════════
   PHASE EDITOR
   ═══════════════════════════════════════════════════════════ */

function PhaseEditor({ allPhases, schedulePhases, customPhases, canEdit, onUpdate, onAddCustomPhase, onDeleteCustomPhase }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newColor, setNewColor] = useState('#9ca3af');

  const handleAdd = async () => {
    if (!newCode.trim() || !newName.trim()) return;
    await onAddCustomPhase({ code: newCode.trim().toUpperCase(), name: newName.trim(), color: newColor, sort_order: 50 + customPhases.length });
    setNewName(''); setNewCode(''); setNewColor('#9ca3af'); setShowAdd(false);
  };

  return (
    <>
      <table className="phase-table">
        <thead><tr><th>Phase</th><th>Start</th><th>End</th><th>Duration</th><th>Budgeted Hrs</th><th>Progress</th><th></th></tr></thead>
        <tbody>
          {allPhases.map(pDef => {
            const phase = schedulePhases.find(p => p.phase_code === pDef.code) || {};
            const dur = phase.start_date && phase.end_date ? daysBetween(phase.start_date, phase.end_date) : null;
            return (
              <tr key={pDef.code}>
                <td><span className="phase-dot" style={{background:pDef.color}} />{pDef.name}{!pDef.builtin && <span style={{fontSize:10,color:'var(--text-muted)',marginLeft:6}}>(custom)</span>}</td>
                <td><input type="date" value={phase.start_date||''} disabled={!canEdit} onChange={e=>onUpdate(pDef.code,'start_date',e.target.value||null)} /></td>
                <td><input type="date" value={phase.end_date||''} disabled={!canEdit} onChange={e=>onUpdate(pDef.code,'end_date',e.target.value||null)} /></td>
                <td><span className="duration-display">{dur!==null?`${dur}d (${(dur/7).toFixed(1)}w)`:'—'}</span></td>
                <td><input type="number" min="0" value={phase.budgeted_hours??''} disabled={!canEdit} onChange={e=>onUpdate(pDef.code,'budgeted_hours',parseInt(e.target.value)||null)} /></td>
                <td><div className="progress-cell">
                  <input type="number" min="0" max="100" value={phase.percent_complete??0} disabled={!canEdit} onChange={e=>onUpdate(pDef.code,'percent_complete',Math.min(100,Math.max(0,parseInt(e.target.value)||0)))} style={{width:56}} />
                  <div className="progress-track"><div className="progress-fill" style={{width:`${phase.percent_complete||0}%`,background:pDef.color}} /></div>
                  <span className="progress-label">{phase.percent_complete||0}%</span>
                </div></td>
                <td>{!pDef.builtin && canEdit && <button className="btn btn-danger btn-sm" onClick={()=>onDeleteCustomPhase(pDef.id, pDef.code)}>✕</button>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {canEdit && (
        <div style={{ marginTop: 12 }}>
          {!showAdd ? (
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAdd(true)}>+ Custom Phase</button>
          ) : (
            <div className="custom-phase-form">
              <input placeholder="Code (e.g. HR)" value={newCode} onChange={e => setNewCode(e.target.value)} style={{ width: 80 }} maxLength={6} />
              <input placeholder="Phase name" value={newName} onChange={e => setNewName(e.target.value)} style={{ flex: 1 }} />
              <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} className="color-input" />
              <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={!newCode.trim()||!newName.trim()}>Add</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          )}
        </div>
      )}
    </>
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
  const [schedulePhases, setSchedulePhases] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [customPhases, setCustomPhases] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showCritical, setShowCritical] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [loading, setLoading] = useState(true);

  const undoStack = useRef([]);
  const saveTimeout = useRef({});
  const ganttWrapRef = useRef(null);
  const [ganttWidth, setGanttWidth] = useState(1200);

  // Measure gantt wrapper width
  useEffect(() => {
    const measure = () => {
      if (ganttWrapRef.current) setGanttWidth(ganttWrapRef.current.clientWidth);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [selectedProject]);

  // Derived: merged phase list
  const allPhases = useMemo(() => mergePhases(customPhases), [customPhases]);
  const phaseMap = useMemo(() => makePhaseMap(allPhases), [allPhases]);
  const phaseSortMap = useMemo(() => makePhaseSortMap(allPhases), [allPhases]);

  // Sorted + display-id'd tasks
  const sortedTasks = useMemo(() => {
    const sorted = sortTasks(tasks, phaseSortMap);
    return assignDisplayIds(sorted, allPhases);
  }, [tasks, phaseSortMap, allPhases]);

  const pushUndo = useCallback(() => { undoStack.current.push({ phases: JSON.parse(JSON.stringify(schedulePhases)), tasks: JSON.parse(JSON.stringify(tasks)) }); if (undoStack.current.length > 30) undoStack.current.shift(); }, [schedulePhases, tasks]);
  const handleUndo = useCallback(() => { const prev = undoStack.current.pop(); if (prev) { setSchedulePhases(prev.phases); setTasks(prev.tasks); } }, []);

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
    if (proj.principal?.toLowerCase()===u) return 'PRINCIPAL';
    if (proj.dm?.toLowerCase()===u) return 'DM';
    if (proj.pm?.toLowerCase()===u) return 'PM';
    return null;
  }, [currentUser, selectedProject, projects]);

  // Load projects + employees
  useEffect(() => { (async () => { setLoading(true); const [pR,eR] = await Promise.all([supabase.from('projects').select('*').order('project_number'), supabase.from('employees').select('name').order('name')]); if(pR.data) setProjects(pR.data); if(eR.data) setEmployees(eR.data.map(e=>e.name).filter(Boolean)); setLoading(false); })(); }, []);

  // Load schedule data when project changes
  useEffect(() => {
    if (!selectedProject) { setSchedulePhases([]); setTasks([]); setCustomPhases([]); return; }
    (async () => {
      const [phR, tkR, cpR] = await Promise.all([
        supabase.from('schedule').select('*').eq('project_number', selectedProject),
        supabase.from('schedule_milestones').select('*').eq('project_number', selectedProject),
        supabase.from('custom_phases').select('*').eq('project_number', selectedProject).order('sort_order'),
      ]);

      setCustomPhases(cpR.data || []);
      const allP = mergePhases(cpR.data || []);

      let lp = (phR.data||[]).map(p => ({...p, phase_code: p.phase, start_date: p.phase_start, end_date: p.phase_end, sort_order: allP.findIndex(ph=>ph.code===p.phase)+1 }));
      const existing = new Set(lp.map(p=>p.phase_code));
      const missing = BUILTIN_PHASES.filter(p=>!existing.has(p.code));
      if (missing.length) {
        const ins = missing.map(p => ({project_number:selectedProject, phase:p.code, phase_start:null, phase_end:null, budgeted_hours:null, percent_complete:0, active:true}));
        const{data}=await supabase.from('schedule').insert(ins).select();
        if(data) lp=[...lp,...data.map(p=>({...p,phase_code:p.phase,start_date:p.phase_start,end_date:p.phase_end,sort_order:allP.findIndex(ph=>ph.code===p.phase)+1}))];
      }
      lp.sort((a,b)=>a.sort_order-b.sort_order);
      setSchedulePhases(lp);

      const loadedTasks = (tkR.data||[]).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
      setTasks(loadedTasks);
    })();
    setSelectedTaskId(null);
    undoStack.current = [];
  }, [selectedProject]);

  // Debounced save
  const debouncedSave = useCallback((table, id, updates) => {
    setSaveStatus('saving');
    const key = `${table}:${id}`;
    if (saveTimeout.current[key]) clearTimeout(saveTimeout.current[key]);
    saveTimeout.current[key] = setTimeout(async () => {
      delete saveTimeout.current[key];
      const{error}=await supabase.from(table).update(updates).eq('id',id);
      setSaveStatus(error?'error':'saved');
      if(!error) setTimeout(()=>setSaveStatus(p=>p==='saved'?'idle':p), 2000);
    }, 600);
  }, []);

  // Phase update
  const handlePhaseUpdate = useCallback((code, field, value) => {
    pushUndo();
    setSchedulePhases(prev => {
      const up = prev.map(p => p.phase_code===code ? {...p,[field]:value} : p);
      const ph = up.find(p=>p.phase_code===code);
      if(ph) debouncedSave('schedule', ph.id, {[field==='start_date'?'phase_start':field==='end_date'?'phase_end':field]:value});
      if(ph && (field==='start_date'||field==='end_date')) {
        setTasks(prev => prev.map(t => {
          if(!t.phase_anchor) return t;
          const[ap,ae]=t.phase_anchor.split('_');
          if(ap!==code||(ae==='START'?'start_date':'end_date')!==field) return t;
          const nt={...t,start_date:value};
          if(nt.duration_business_days) nt.end_date=addBusinessDays(nt.start_date,nt.duration_business_days);
          debouncedSave('schedule_milestones',nt.id,{start_date:nt.start_date,end_date:nt.end_date||null});
          return nt;
        }));
      }
      return up;
    });
  }, [debouncedSave, pushUndo]);

  // Task update (non-date)
  const handleTaskUpdate = useCallback((id, field, value) => {
    pushUndo();
    setTasks(prev => { const up = prev.map(t => t.id===id ? {...t,[field]:value} : t); debouncedSave('schedule_milestones', id, {[field]:value}); return up; });
  }, [debouncedSave, pushUndo]);

  // Task date change with propagation
  const handleTaskDateChange = useCallback((id, field, value) => {
    pushUndo();
    setTasks(prev => {
      let up = prev.map(t => { if(t.id!==id) return t; const n={...t,[field]:value}; if(field==='start_date'&&n.duration_business_days) n.end_date=addBusinessDays(value,n.duration_business_days); return n; });
      let changed=true;
      while(changed){changed=false;up=up.map(t=>{if(!t.depends_on)return t;const d=up.find(x=>x.id===t.depends_on);if(!d?.end_date)return t;const gap=t.gap_business_days||0;const ns=gap>0?addBusinessDays(d.end_date,gap):addDays(d.end_date,1);if(ns!==t.start_date){changed=true;const n={...t,start_date:ns};if(n.duration_business_days)n.end_date=addBusinessDays(ns,n.duration_business_days);return n;}return t;});}
      up.forEach(t=>{const o=prev.find(x=>x.id===t.id);if(o&&(o.start_date!==t.start_date||o.end_date!==t.end_date))debouncedSave('schedule_milestones',t.id,{start_date:t.start_date,end_date:t.end_date||null});});
      return up;
    });
  }, [debouncedSave, pushUndo]);

  // Add task/milestone
  const handleAddTask = useCallback(async (isTask) => {
    pushUndo();
    const maxSort = Math.max(0, ...tasks.map(t => t.sort_order || 0));
    const{data}=await supabase.from('schedule_milestones').insert({project_number:selectedProject,phase_code:null,milestone_name:'',start_date:todayStr(),end_date:isTask?addDays(todayStr(),7):null,duration_business_days:isTask?5:null,is_completed:false,depends_on:null,gap_business_days:0,dependency_type:'FS',phase_anchor:null,sort_order:maxSort+10}).select().single();
    if(data){setTasks(prev=>[...prev,data]);setSelectedTaskId(data.id);}
  }, [selectedProject, pushUndo, tasks]);

  // Delete task
  const handleDeleteTask = useCallback(async (id) => {
    pushUndo();
    await supabase.from('schedule_milestones').delete().eq('id',id);
    setTasks(prev=>prev.filter(t=>t.id!==id));
    if(selectedTaskId===id)setSelectedTaskId(null);
  }, [selectedTaskId, pushUndo]);

  // Reorder tasks (drag-drop)
  const handleReorder = useCallback((draggedId, targetId) => {
    pushUndo();
    setTasks(prev => {
      const items = [...prev];
      const dragIdx = items.findIndex(t => t.id === draggedId);
      const targetIdx = items.findIndex(t => t.id === targetId);
      if (dragIdx === -1 || targetIdx === -1) return prev;
      const [dragged] = items.splice(dragIdx, 1);
      items.splice(targetIdx, 0, dragged);
      const updated = items.map((t, i) => ({ ...t, sort_order: (i + 1) * 10 }));
      updated.forEach(t => {
        const orig = prev.find(o => o.id === t.id);
        if (orig && orig.sort_order !== t.sort_order) {
          debouncedSave('schedule_milestones', t.id, { sort_order: t.sort_order });
        }
      });
      return updated;
    });
  }, [debouncedSave, pushUndo]);

  // Custom phase management
  const handleAddCustomPhase = useCallback(async (phaseData) => {
    const{data,error}=await supabase.from('custom_phases').insert({project_number:selectedProject,...phaseData}).select().single();
    if(data) {
      setCustomPhases(prev=>[...prev,data]);
      await supabase.from('schedule').insert({project_number:selectedProject,phase:data.code,phase_start:null,phase_end:null,budgeted_hours:null,percent_complete:0,active:true}).select().single();
      const{data:sched}=await supabase.from('schedule').select('*').eq('project_number',selectedProject);
      if(sched) {
        const allP = mergePhases([...customPhases, data]);
        setSchedulePhases(sched.map(p=>({...p,phase_code:p.phase,start_date:p.phase_start,end_date:p.phase_end,sort_order:allP.findIndex(ph=>ph.code===p.phase)+1})).sort((a,b)=>a.sort_order-b.sort_order));
      }
    }
    if(error) console.error('Failed to create custom phase:', error);
  }, [selectedProject, customPhases]);

  const handleDeleteCustomPhase = useCallback(async (id, code) => {
    await supabase.from('custom_phases').delete().eq('id', id);
    await supabase.from('schedule').delete().eq('project_number', selectedProject).eq('phase', code);
    setTasks(prev => prev.map(t => t.phase_code === code ? { ...t, phase_code: null } : t));
    tasks.filter(t => t.phase_code === code).forEach(t => {
      debouncedSave('schedule_milestones', t.id, { phase_code: null });
    });
    setCustomPhases(prev => prev.filter(cp => cp.id !== id));
    setSchedulePhases(prev => prev.filter(p => p.phase_code !== code));
  }, [selectedProject, tasks, debouncedSave]);

  // Export handler
  const handleExportPDF = useCallback(async (opts) => {
    const proj = projects.find(p=>p.project_number===selectedProject);
    if(!proj) return;
    await exportPDF(proj, allPhases, phaseMap, schedulePhases, sortedTasks, showCritical ? criticalSet : null, opts);
  }, [projects, selectedProject, allPhases, phaseMap, schedulePhases, sortedTasks, showCritical]);

  // Critical path
  const criticalSet = useMemo(() => computeCriticalPath(sortedTasks), [sortedTasks]);

  // Current phase
  const currentPhase = useMemo(() => {
    const today = todayStr();
    for (const p of schedulePhases) { if(p.start_date&&p.end_date&&p.start_date<=today&&today<=p.end_date) return phaseMap[p.phase_code]; }
    return null;
  }, [schedulePhases, phaseMap]);

  const selectedProjectData = projects.find(p=>p.project_number===selectedProject);
  const selectedTask = sortedTasks.find(t=>t.id===selectedTaskId);

  // Keyboard shortcuts
  useEffect(() => { const h=e=>{if((e.ctrlKey||e.metaKey)&&e.key==='z'){e.preventDefault();handleUndo();}}; window.addEventListener('keydown',h); return()=>window.removeEventListener('keydown',h); }, [handleUndo]);

  if(loading) return <div className="app"><style>{CSS}</style><div className="empty-state"><p>Loading ESa Schedule...</p></div></div>;

  return (
    <div className="app">
      <style>{CSS}</style>

      {/* Sticky top section */}
      <div className="sticky-top">
        {/* Header */}
        <div className="header">
          <h1><span className="logo">ESa</span> Schedule</h1>
          <div className="header-right">
            {saveStatus!=='idle' && <div className={`save-indicator ${saveStatus}`}>{saveStatus==='saving'&&'● Saving...'}{saveStatus==='saved'&&'✓ Saved'}{saveStatus==='error'&&'✕ Save failed'}</div>}
            {currentUser && selectedProject && <div className="user-badge">{currentUser}{userRole ? <span className="role-tag">{userRole}</span> : <span className="role-tag" style={{background:'var(--danger-light)',color:'var(--danger)'}}>View Only</span>}</div>}
          </div>
        </div>

        {/* Project selector */}
        <div className="card" style={{marginBottom:8}}>
          <div className="selector-row">
            <div className="user-select-wrap">
              <select value={currentUser} onChange={e=>{setCurrentUser(e.target.value);setSelectedProject(null);}}><option value="">Select your name...</option>{employees.map(n=><option key={n} value={n}>{n}</option>)}</select>
            </div>
            <ProjectSearchSelect projects={projects} currentUser={currentUser} selectedProject={selectedProject} onSelect={setSelectedProject} />
          </div>
        </div>

        {selectedProject && (
          <div className="status-bar" style={{marginBottom:8}}>
            <span style={{fontWeight:600,color:'var(--text)'}}>{selectedProjectData?.project_name}</span>
            <span>|</span><span>PM: {selectedProjectData?.pm||'—'}</span><span>DM: {selectedProjectData?.dm||'—'}</span><span>Principal: {selectedProjectData?.principal||'—'}</span>
            {currentPhase && <><span>|</span><span className="status-dot" style={{background:currentPhase.color}} /><span style={{color:currentPhase.color,fontWeight:500}}>Currently in {currentPhase.name}</span></>}
          </div>
        )}
      </div>

      {!selectedProject ? (
        <div className="empty-state"><p>Select a project to view or edit its schedule</p></div>
      ) : (
        <>
          {/* Gantt Chart with sticky toolbar */}
          <div className="gantt-wrap" ref={ganttWrapRef}>
            <div className="gantt-toolbar">
              <div className="gantt-toolbar-left">
                {canEdit && <>
                  <button className="btn btn-ghost btn-sm" onClick={()=>handleAddTask(true)}>+ Task</button>
                  <button className="btn btn-ghost btn-sm" onClick={()=>handleAddTask(false)}>+ Milestone</button>
                </>}
              </div>
              <div className="gantt-toolbar-right">
                <label className="gantt-toggle">
                  <input type="checkbox" checked={showCritical} onChange={e=>setShowCritical(e.target.checked)} style={{accentColor:'var(--accent)', width:14, height:14}} />
                  <span>Critical Path</span>
                </label>
                <button className="btn btn-ghost btn-sm" onClick={handleUndo} disabled={!undoStack.current.length} title="Undo (Ctrl+Z)">↩ Undo</button>
                <button className="btn btn-ghost btn-sm" onClick={()=>setShowExport(true)}>↓ Export PDF</button>
              </div>
            </div>
            <GanttChart
              allPhases={allPhases} phaseMap={phaseMap} schedulePhases={schedulePhases} tasks={sortedTasks}
              selectedTaskId={selectedTaskId} onSelectTask={id=>setSelectedTaskId(id)}
              criticalSet={criticalSet} showCritical={showCritical} canEdit={canEdit}
              onResizeEnd={(id,f,v)=>handleTaskDateChange(id,f,v)} onReorder={handleReorder}
              containerWidth={ganttWidth}
            />
          </div>

          {/* Phases */}
          <div className="card">
            <h2>Phases</h2>
            <PhaseEditor allPhases={allPhases} schedulePhases={schedulePhases} customPhases={customPhases}
              canEdit={canEdit} onUpdate={handlePhaseUpdate}
              onAddCustomPhase={handleAddCustomPhase} onDeleteCustomPhase={handleDeleteCustomPhase} />
          </div>

          {/* Tasks table */}
          <div className="card">
            <h2>Project Tasks</h2>
            {!sortedTasks.length ? <div style={{padding:16,color:'var(--text-muted)',fontSize:13}}>No tasks yet{canEdit?' — add one above':''}</div> : (
              <table className="phase-table">
                <thead><tr><th>ID</th><th>Name</th><th>Phase</th><th>Start</th><th>End</th><th>Depends On</th><th>Status</th></tr></thead>
                <tbody>{sortedTasks.map(t => {
                  const isCrit = showCritical && criticalSet.has(t.id);
                  return (
                    <tr key={t.id} onClick={()=>setSelectedTaskId(t.id)} style={{cursor:'pointer',background:selectedTaskId===t.id?'var(--accent-light)':isCrit?'rgba(239,68,68,0.04)':undefined}}>
                      <td><span className="display-id" style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--accent)'}}>{t._displayId||''}</span></td>
                      <td>{t.milestone_name||<span style={{color:'var(--text-muted)'}}>(unnamed)</span>}</td>
                      <td>{t.phase_code&&<><span className="phase-dot" style={{background:phaseMap[t.phase_code]?.color}} />{phaseMap[t.phase_code]?.name}</>}</td>
                      <td style={{fontFamily:'var(--mono)',fontSize:12}}>{formatShortDate(t.start_date)}</td>
                      <td style={{fontFamily:'var(--mono)',fontSize:12}}>{formatShortDate(t.end_date)}</td>
                      <td>{t.depends_on&&(()=>{const d=sortedTasks.find(x=>x.id===t.depends_on);return d?<span style={{fontSize:12}}><span style={{fontFamily:'var(--mono)',color:'var(--accent)'}}>{d._displayId}</span> {t.dependency_type||'FS'}{t.gap_business_days?` +${t.gap_business_days}d`:''}</span>:null;})()}</td>
                      <td>{t.is_completed?<span style={{color:'var(--success)',fontSize:12,fontWeight:600}}>✓ Done</span>:isCrit?<span style={{color:'var(--critical)',fontSize:11,fontWeight:600}}>CRITICAL</span>:null}</td>
                    </tr>
                  );
                })}</tbody>
              </table>
            )}
          </div>

          {/* Task Drawer */}
          {selectedTask && <TaskDrawer task={selectedTask} tasks={sortedTasks} allPhases={allPhases} phaseMap={phaseMap} canEdit={canEdit} onUpdate={handleTaskUpdate} onDateChange={handleTaskDateChange} onClose={()=>setSelectedTaskId(null)} onDelete={handleDeleteTask} />}

          {/* Export Dialog */}
          {showExport && <ExportDialog allPhases={allPhases} onExport={handleExportPDF} onClose={()=>setShowExport(false)} />}
        </>
      )}
    </div>
  );
}
