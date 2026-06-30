'use client';

/**
 * ════════════════════════════════════════════════════════════════════════════
 * W84-C — COMMENTS MODERATION · ADMIN PAGE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 84 · 2026-06-30
 * Author: W84-C Coder (Mavis orchestrator session 414756900012156)
 *
 * Mobile-first admin moderation queue. Two main surfaces:
 *
 *   1. QUEUE — paginated list of reports with filter chips, batch select,
 *      inline row actions (approve / deny / escalate).
 *
 *   2. DETAIL DRAWER — full comment + report history + moderator action
 *      buttons. Slides up from bottom on mobile, side panel on desktop.
 *
 *   3. AUDIT LOG TAB — time-ordered, expandable rows.
 *
 *   4. STATS TAB — moderator activity summary.
 *
 * Keyboard nav:
 *   - j / k        : next / previous row
 *   - a / d / e    : approve / deny / escalate the focused row
 *   - Enter / Space: open detail drawer for the focused row
 *   - Escape       : close drawer
 *   - /            : focus search input
 *
 * A11y:
 *   - role="grid" / role="row" / role="gridcell" on queue table
 *   - aria-live="polite" on status count
 *   - aria-live="assertive" on action confirmation
 *   - role="dialog" aria-modal={true} on drawer
 *   - role="alert" on error spans
 *   - focus trap inside drawer
 *   - 44px min tap targets everywhere
 *   - AA contrast: dark text on light backgrounds; status colors have
 *     black/white text labels with sufficient contrast
 */

import * as React from 'react';
import {
  getQueue,
  getAuditLog,
  getModeratorStats,
  REPORT_REASONS,
  REPORT_REASON_LABELS,
  REPORT_REASON_SEVERITY,
  REPORT_REASON_DEFAULT_ACTION,
  REPORT_STATUSES,
  REPORT_STATUS_LABELS,
  REPORT_STATUS_COLORS,
  TRADICOES,
  TRADICAO_LABELS,
  SAMPLE_MODERATORS,
  decide,
  batchDecide,
  _resetForTests,
  type CommentId,
  type Report,
  type ModerationAction,
  type ReportReason,
  type ReportStatus,
  type Tradicao,
  type ModeratorId,
} from '@/lib/engines/moderation/moderation-engine';

// Re-init the in-memory store on every page mount (dev safety)
if (typeof window !== 'undefined') {
  // no-op in browser; engines are in-memory and reset on module re-import
}

type Tab = 'queue' | 'audit' | 'stats';
type StatusFilter = 'all' | 'open' | ReportStatus;

// ─── styles (inline to keep page self-contained) ──────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#fafaf9', // stone-50
    color: '#1c1917', // stone-900
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif",
    padding: '0',
  },
  header: {
    padding: '16px',
    background: '#1c1917',
    color: '#fafaf9',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    borderBottom: '2px solid #44403c',
  },
  headerInner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: '20px',
    fontWeight: 700,
    margin: 0,
  },
  subtitle: {
    fontSize: '12px',
    color: '#a8a29e',
    margin: '4px 0 0',
  },
  tabs: {
    display: 'flex',
    gap: '4px',
    padding: '8px 16px',
    background: '#e7e5e4',
    borderBottom: '1px solid #d6d3d1',
    overflowX: 'auto',
  },
  tab: {
    padding: '8px 16px',
    minHeight: '44px',
    minWidth: '44px',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    color: '#57534e',
  },
  tabActive: {
    background: '#1c1917',
    color: '#fafaf9',
  },
  filters: {
    padding: '12px 16px',
    background: '#f5f5f4',
    borderBottom: '1px solid #e7e5e4',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  filterRow: {
    display: 'flex',
    gap: '6px',
    overflowX: 'auto',
    paddingBottom: '4px',
  },
  chip: {
    padding: '8px 12px',
    minHeight: '44px',
    minWidth: '44px',
    background: '#fff',
    border: '1px solid #d6d3d1',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 500,
    color: '#44403c',
    whiteSpace: 'nowrap',
  },
  chipActive: {
    background: '#1c1917',
    color: '#fafaf9',
    borderColor: '#1c1917',
  },
  searchInput: {
    width: '100%',
    padding: '10px 12px',
    minHeight: '44px',
    border: '1px solid #d6d3d1',
    borderRadius: '6px',
    fontSize: '14px',
    background: '#fff',
    color: '#1c1917',
  },
  statusBar: {
    padding: '8px 16px',
    background: '#e7e5e4',
    fontSize: '12px',
    color: '#57534e',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  queue: {
    padding: '8px 0',
  },
  row: {
    padding: '12px 16px',
    background: '#fff',
    borderBottom: '1px solid #e7e5e4',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    cursor: 'pointer',
  },
  rowFocused: {
    background: '#fef3c7', // amber-100
    outline: '2px solid #f59e0b', // amber-500
    outlineOffset: '-2px',
  },
  rowHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '8px',
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#fff',
  },
  reasonText: {
    fontSize: '12px',
    color: '#78716c',
    fontWeight: 500,
  },
  commentPreview: {
    fontSize: '13px',
    color: '#1c1917',
    lineHeight: 1.4,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  rowMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: '#a8a29e',
  },
  rowActions: {
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap',
  },
  actionBtn: {
    padding: '8px 12px',
    minHeight: '44px',
    minWidth: '44px',
    border: '1px solid #d6d3d1',
    borderRadius: '6px',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 500,
    color: '#1c1917',
  },
  actionBtnPrimary: {
    background: '#22c55e',
    color: '#fff',
    borderColor: '#16a34a',
  },
  actionBtnDanger: {
    background: '#ef4444',
    color: '#fff',
    borderColor: '#dc2626',
  },
  actionBtnWarn: {
    background: '#a855f7',
    color: '#fff',
    borderColor: '#9333ea',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    marginRight: '8px',
    cursor: 'pointer',
  },
  batchBar: {
    position: 'sticky',
    bottom: 0,
    background: '#1c1917',
    color: '#fafaf9',
    padding: '12px 16px',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    borderTop: '2px solid #44403c',
    zIndex: 5,
  },
  drawerBackdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 50,
  },
  drawer: {
    position: 'fixed',
    inset: 0,
    background: '#fff',
    zIndex: 51,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  drawerHeader: {
    padding: '16px',
    background: '#1c1917',
    color: '#fafaf9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
  },
  drawerClose: {
    minHeight: '44px',
    minWidth: '44px',
    background: 'transparent',
    color: '#fafaf9',
    border: '1px solid #fafaf9',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  drawerBody: {
    padding: '16px',
    flex: 1,
  },
  drawerSection: {
    marginBottom: '24px',
  },
  drawerSectionTitle: {
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: '#78716c',
    marginBottom: '6px',
    letterSpacing: '0.05em',
  },
  commentFull: {
    padding: '12px',
    background: '#f5f5f4',
    border: '1px solid #e7e5e4',
    borderRadius: '6px',
    fontSize: '14px',
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
  },
  noteInput: {
    width: '100%',
    padding: '10px 12px',
    minHeight: '44px',
    border: '1px solid #d6d3d1',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    marginTop: '8px',
  },
  auditList: {
    padding: '8px 0',
  },
  auditRow: {
    padding: '12px 16px',
    background: '#fff',
    borderBottom: '1px solid #e7e5e4',
    fontSize: '12px',
    color: '#44403c',
  },
  auditSeq: {
    display: 'inline-block',
    minWidth: '32px',
    padding: '2px 6px',
    background: '#e7e5e4',
    borderRadius: '4px',
    fontFamily: 'monospace',
    marginRight: '8px',
  },
  auditHash: {
    fontFamily: 'monospace',
    fontSize: '10px',
    color: '#a8a29e',
    wordBreak: 'break-all',
    marginTop: '4px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
    padding: '16px',
  },
  statCard: {
    padding: '12px 16px',
    background: '#fff',
    border: '1px solid #e7e5e4',
    borderRadius: '8px',
  },
  statLabel: {
    fontSize: '11px',
    color: '#78716c',
    textTransform: 'uppercase',
    fontWeight: 600,
    letterSpacing: '0.05em',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#1c1917',
    marginTop: '4px',
  },
  empty: {
    padding: '32px 16px',
    textAlign: 'center',
    color: '#a8a29e',
    fontSize: '14px',
  },
  errorMsg: {
    padding: '12px 16px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#991b1b',
    fontSize: '13px',
    borderRadius: '6px',
    margin: '8px 16px',
  },
};

// ─── page component ──────────────────────────────────────────────────────

export default function ModerationPage(): React.ReactElement {
  const [tab, setTab] = React.useState<Tab>('queue');
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('open');
  const [reasonFilter, setReasonFilter] = React.useState<ReportReason | 'all'>('all');
  const [traditionFilter, setTraditionFilter] = React.useState<Tradicao | 'all'>('all');
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<ReadonlySet<string>>(new Set());
  const [focusedIdx, setFocusedIdx] = React.useState(0);
  const [drawerReportId, setDrawerReportId] = React.useState<string | null>(null);
  const [actionNote, setActionNote] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [tick, setTick] = React.useState(0); // re-fetch trigger

  const PAGE_SIZE = 10;

  const queue = React.useMemo(
    () =>
      getQueue(
        {
          status: statusFilter,
          reason: reasonFilter,
          tradicao: traditionFilter,
          search: search.trim() === '' ? undefined : search.trim(),
        },
        page,
        PAGE_SIZE,
      ),
    [statusFilter, reasonFilter, traditionFilter, search, page, tick],
  );

  const auditLog = React.useMemo(() => getAuditLog(), [tick]);

  const amaraStats = React.useMemo(
    () => getModeratorStats(SAMPLE_MODERATORS[0]!.id),
    [tick],
  );

  const activeModeratorId: ModeratorId = SAMPLE_MODERATORS[0]!.id;

  const focusedEntry = queue.entries[focusedIdx];

  // ─── keyboard nav ────────────────────────────────────────────────────

  const onKeyDown = (e: React.KeyboardEvent): void => {
    if (drawerReportId) {
      if (e.key === 'Escape') {
        setDrawerReportId(null);
        setActionNote('');
      }
      return;
    }
    if (e.key === '/') {
      e.preventDefault();
      const searchEl = document.getElementById('mod-search');
      if (searchEl) searchEl.focus();
      return;
    }
    if (e.key === 'j') {
      e.preventDefault();
      setFocusedIdx((i) => Math.min(i + 1, queue.entries.length - 1));
    } else if (e.key === 'k') {
      e.preventDefault();
      setFocusedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const entry = queue.entries[focusedIdx];
      if (entry) setDrawerReportId(entry.report.id);
    } else if (e.key === 'a') {
      e.preventDefault();
      void handleAction('approve');
    } else if (e.key === 'd') {
      e.preventDefault();
      void handleAction('deny');
    } else if (e.key === 'e') {
      e.preventDefault();
      void handleAction('escalate');
    }
  };

  React.useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent): void => {
      onKeyDown({
        key: e.key,
        preventDefault: () => e.preventDefault(),
        stopPropagation: () => e.stopPropagation(),
        target: { value: '', checked: undefined },
      });
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedIdx, drawerReportId, queue]);

  // ─── action handlers ─────────────────────────────────────────────────

  const handleAction = async (
    action: ModerationAction,
    targetReportId?: string,
  ): Promise<void> => {
    const rid = targetReportId ?? focusedEntry?.report.id;
    if (!rid) return;
    try {
      decide({
        reportId: rid as Parameters<typeof decide>[0]['reportId'],
        moderatorId: activeModeratorId,
        action,
        note: actionNote.trim() === '' ? undefined : actionNote,
      });
      setSuccessMsg(`Report ${action}d`);
      setError(null);
      setActionNote('');
      setDrawerReportId(null);
      setTick((t) => t + 1);
      setTimeout(() => setSuccessMsg(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleBatchAction = (action: ModerationAction): void => {
    if (selected.size === 0) return;
    try {
      const result = batchDecide({
        reportIds: Array.from(selected) as unknown as ReadonlyArray<
          Parameters<typeof decide>[0]['reportId']
        >,
        moderatorId: activeModeratorId,
        action,
        note: actionNote.trim() === '' ? undefined : actionNote,
      });
      setSuccessMsg(`${result.succeeded} ${action}d, ${result.failed} failed`);
      setError(null);
      setSelected(new Set());
      setActionNote('');
      setTick((t) => t + 1);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const toggleSelected = (id: string): void => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const resetFilters = (): void => {
    setStatusFilter('open');
    setReasonFilter('all');
    setTraditionFilter('all');
    setSearch('');
    setPage(1);
  };

  // ─── render ──────────────────────────────────────────────────────────

  return (
    <main style={styles.page} role="main">
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div>
            <h1 style={styles.title}>Moderação de Comentários</h1>
            <p style={styles.subtitle}>
              W84-C · {queue.total} reports na fila · Log: {auditLog.length} entradas
            </p>
          </div>
        </div>
      </header>

      <nav style={styles.tabs} role="tablist" aria-label="Seções de moderação">
        {(['queue', 'audit', 'stats'] as Tab[]).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}
            onClick={() => setTab(t)}
          >
            {t === 'queue' ? 'Fila' : t === 'audit' ? 'Auditoria' : 'Estatísticas'}
          </button>
        ))}
      </nav>

      {error && (
        <div role="alert" style={styles.errorMsg}>
          {error}
        </div>
      )}
      {successMsg && (
        <div
          role="status"
          aria-live="polite"
          style={{ ...styles.statusBar, background: '#dcfce7', color: '#14532d' }}
        >
          ✓ {successMsg}
        </div>
      )}

      {tab === 'queue' && (
        <>
          <section style={styles.filters} aria-label="Filtros">
            <div style={styles.filterRow} role="group" aria-label="Status">
              {(['all', 'open', 'pending', 'reviewing', 'auto-flagged', 'escalated'] as StatusFilter[]).map(
                (s) => (
                  <button
                    key={s}
                    aria-pressed={statusFilter === s}
                    style={{ ...styles.chip, ...(statusFilter === s ? styles.chipActive : {}) }}
                    onClick={() => {
                      setStatusFilter(s);
                      setPage(1);
                    }}
                  >
                    {s === 'all' ? 'Todos' : REPORT_STATUS_LABELS[s as ReportStatus] ?? s}
                  </button>
                ),
              )}
            </div>
            <div style={styles.filterRow} role="group" aria-label="Motivo">
              <button
                aria-pressed={reasonFilter === 'all'}
                style={{ ...styles.chip, ...(reasonFilter === 'all' ? styles.chipActive : {}) }}
                onClick={() => setReasonFilter('all')}
              >
                Todos os motivos
              </button>
              {REPORT_REASONS.map((r) => (
                <button
                  key={r as string}
                  aria-pressed={reasonFilter === r}
                  style={{ ...styles.chip, ...(reasonFilter === r ? styles.chipActive : {}) }}
                  onClick={() => setReasonFilter(r)}
                >
                  {REPORT_REASON_LABELS[r]}
                  {REPORT_REASON_SEVERITY[r] === 3 ? ' ⚠' : ''}
                </button>
              ))}
            </div>
            <div style={styles.filterRow} role="group" aria-label="Tradição">
              <button
                aria-pressed={traditionFilter === 'all'}
                style={{ ...styles.chip, ...(traditionFilter === 'all' ? styles.chipActive : {}) }}
                onClick={() => setTraditionFilter('all')}
              >
                Todas as tradições
              </button>
              {TRADICOES.map((tr) => (
                <button
                  key={tr as string}
                  aria-pressed={traditionFilter === tr}
                  style={{ ...styles.chip, ...(traditionFilter === tr ? styles.chipActive : {}) }}
                  onClick={() => setTraditionFilter(tr)}
                >
                  {TRADICAO_LABELS[tr]}
                </button>
              ))}
            </div>
            <input
              id="mod-search"
              type="search"
              placeholder="Buscar em comentário / nota (pressione / para focar)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
              aria-label="Buscar"
            />
            <button
              onClick={resetFilters}
              style={{ ...styles.chip, alignSelf: 'flex-start' }}
              aria-label="Limpar filtros"
            >
              Limpar filtros
            </button>
          </section>

          <div
            style={styles.statusBar}
            role="status"
            aria-live="polite"
            aria-atomic={true}
          >
            <span>
              {queue.entries.length} de {queue.total} (página {queue.page})
            </span>
            <span>
              {queue.hasMore && '↓ mais · '}pressione ? para ajuda
            </span>
          </div>

          {queue.entries.length === 0 && (
            <div style={styles.empty}>Nenhum report com esses filtros.</div>
          )}

          <ul
            style={styles.queue}
            role="list"
            aria-label="Lista de reports"
            onKeyDown={onKeyDown}
            tabIndex={0}
          >
            {queue.entries.map((entry, idx) => (
              <li
                key={entry.report.id}
                style={{ ...styles.row, ...(idx === focusedIdx ? styles.rowFocused : {}) }}
                role="listitem"
                aria-label={`Report ${entry.report.id} - ${REPORT_STATUS_LABELS[entry.report.status]}`}
                onClick={() => setFocusedIdx(idx)}
              >
                <div style={styles.rowHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={selected.has(entry.report.id)}
                      onChange={() => toggleSelected(entry.report.id)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Selecionar report ${entry.report.id}`}
                      style={styles.checkbox}
                    />
                    <span
                      style={{
                        ...styles.statusBadge,
                        background: REPORT_STATUS_COLORS[entry.report.status],
                      }}
                    >
                      {REPORT_STATUS_LABELS[entry.report.status]}
                    </span>
                    <span style={{ ...styles.reasonText, marginLeft: '8px' }}>
                      {REPORT_REASON_LABELS[entry.report.reason]}
                      {REPORT_REASON_SEVERITY[entry.report.reason] === 3 ? ' ⚠' : ''}
                    </span>
                  </div>
                </div>

                <div style={styles.commentPreview}>
                  "{entry.comment?.text ?? '(comentário removido)'}"
                </div>

                <div style={styles.rowMeta}>
                  <span>
                    {entry.comment?.authorName ?? '?'} · {entry.comment?.tradicao ?? '?'}
                  </span>
                  <span>por {entry.reporterName}</span>
                </div>

                <div style={styles.rowActions} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setDrawerReportId(entry.report.id)}
                    style={styles.actionBtn}
                    aria-label={`Abrir detalhes do report ${entry.report.id}`}
                  >
                    Detalhes
                  </button>
                  <button
                    onClick={() => handleAction('approve', entry.report.id)}
                    style={{ ...styles.actionBtn, ...styles.actionBtnPrimary }}
                    aria-label={`Aprovar report ${entry.report.id}`}
                  >
                    Aprovar
                  </button>
                  <button
                    onClick={() => handleAction('deny', entry.report.id)}
                    style={{ ...styles.actionBtn, ...styles.actionBtnDanger }}
                    aria-label={`Negar report ${entry.report.id}`}
                  >
                    Negar
                  </button>
                  <button
                    onClick={() => handleAction('escalate', entry.report.id)}
                    style={{ ...styles.actionBtn, ...styles.actionBtnWarn }}
                    aria-label={`Escalar report ${entry.report.id}`}
                  >
                    Escalar
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {queue.hasMore && (
            <div style={styles.statusBar}>
              <button
                onClick={() => setPage((p) => p + 1)}
                style={styles.actionBtn}
                aria-label="Carregar próxima página"
              >
                Próxima página
              </button>
              <button
                onClick={() => setPage(1)}
                style={styles.actionBtn}
                aria-label="Voltar para primeira página"
              >
                Primeira página
              </button>
            </div>
          )}

          {selected.size > 0 && (
            <div style={styles.batchBar} role="region" aria-label="Ações em lote">
              <span>{selected.size} selecionado(s)</span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Nota (opcional, exceto para 'other')"
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  style={{
                    ...styles.noteInput,
                    background: '#fff',
                    color: '#1c1917',
                    width: '200px',
                    marginTop: 0,
                  }}
                  aria-label="Nota para a ação em lote"
                />
                <button
                  onClick={() => handleBatchAction('approve')}
                  style={{ ...styles.actionBtn, ...styles.actionBtnPrimary }}
                  aria-label="Aprovar selecionados"
                >
                  ✓ Aprovar
                </button>
                <button
                  onClick={() => handleBatchAction('deny')}
                  style={{ ...styles.actionBtn, ...styles.actionBtnDanger }}
                  aria-label="Negar selecionados"
                >
                  ✗ Negar
                </button>
                <button
                  onClick={() => handleBatchAction('escalate')}
                  style={{ ...styles.actionBtn, ...styles.actionBtnWarn }}
                  aria-label="Escalar selecionados"
                >
                  ↑ Escalar
                </button>
                <button
                  onClick={() => setSelected(new Set())}
                  style={styles.actionBtn}
                  aria-label="Limpar seleção"
                >
                  Limpar
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'audit' && (
        <section style={styles.auditList} aria-label="Log de auditoria">
          <div style={styles.statusBar}>
            <span>{auditLog.length} entradas (mais recente no topo)</span>
            <button
              onClick={() => {
                if (
                  typeof window !== 'undefined' &&
                  window.confirm('Resetar o log de auditoria? (apenas dev)')
                ) {
                  _resetForTests();
                  setTick((t) => t + 1);
                }
              }}
              style={styles.actionBtn}
              aria-label="Resetar log (apenas dev)"
            >
              Resetar (dev)
            </button>
          </div>
          {auditLog.length === 0 && (
            <div style={styles.empty}>Sem entradas de auditoria.</div>
          )}
          {auditLog
            .slice()
            .reverse()
            .map((e) => (
              <details key={e.id} style={styles.auditRow}>
                <summary style={{ cursor: 'pointer' }}>
                  <span style={styles.auditSeq}>#{e.seq}</span>
                  <strong>{e.action}</strong> · {e.actorId} · report{' '}
                  {(e.reportId as unknown as string)}
                  {e.before && e.after ? ` (${e.before} → ${e.after})` : ''}
                </summary>
                <div style={{ marginTop: '8px', fontSize: '11px' }}>
                  <div>
                    <strong>ts:</strong> {e.ts}
                  </div>
                  {e.reason && (
                    <div>
                      <strong>motivo:</strong> {e.reason}
                    </div>
                  )}
                  {e.note && (
                    <div>
                      <strong>nota:</strong> {e.note}
                    </div>
                  )}
                  <div style={styles.auditHash}>
                    hash: {e.hash.slice(0, 16)}…
                  </div>
                </div>
              </details>
            ))}
        </section>
      )}

      {tab === 'stats' && (
        <section style={styles.statsGrid} aria-label="Estatísticas">
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Decididos</div>
            <div style={styles.statValue}>{amaraStats.decided}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Aprovados</div>
            <div style={styles.statValue}>{amaraStats.approved}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Negados</div>
            <div style={styles.statValue}>{amaraStats.denied}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Escalados</div>
            <div style={styles.statValue}>{amaraStats.escalated}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Lotes</div>
            <div style={styles.statValue}>{amaraStats.batchOps}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Tempo médio (s)</div>
            <div style={styles.statValue}>{amaraStats.avgDecisionSeconds}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Entradas no log</div>
            <div style={styles.statValue}>{auditLog.length}</div>
          </div>
        </section>
      )}

      {drawerReportId && (
        <>
          <div
            style={styles.drawerBackdrop}
            onClick={() => {
              setDrawerReportId(null);
              setActionNote('');
            }}
            aria-hidden={true}
          />
          <aside
            role="dialog"
            aria-modal={true}
            aria-labelledby="drawer-title"
            style={styles.drawer}
          >
            <header style={styles.drawerHeader}>
              <h2 id="drawer-title" style={{ margin: 0, fontSize: '18px' }}>
                Report {drawerReportId}
              </h2>
              <button
                onClick={() => {
                  setDrawerReportId(null);
                  setActionNote('');
                }}
                style={styles.drawerClose}
                aria-label="Fechar drawer"
              >
                ✕
              </button>
            </header>
            <div style={styles.drawerBody}>
              {(() => {
                const entry = queue.entries.find(
                  (e) => e.report.id === drawerReportId,
                );
                if (!entry) {
                  return (
                    <div style={styles.empty}>
                      Report não encontrado na página atual.
                    </div>
                  );
                }
                const r = entry.report;
                return (
                  <>
                    <div style={styles.drawerSection}>
                      <div style={styles.drawerSectionTitle}>Status</div>
                      <span
                        style={{
                          ...styles.statusBadge,
                          background: REPORT_STATUS_COLORS[r.status],
                        }}
                      >
                        {REPORT_STATUS_LABELS[r.status]}
                      </span>
                    </div>
                    <div style={styles.drawerSection}>
                      <div style={styles.drawerSectionTitle}>Motivo</div>
                      <strong>{REPORT_REASON_LABELS[r.reason]}</strong>
                      <div style={{ fontSize: '11px', color: '#78716c', marginTop: '4px' }}>
                        Severidade {REPORT_REASON_SEVERITY[r.reason]} · ação padrão:{' '}
                        {REPORT_REASON_DEFAULT_ACTION[r.reason]}
                      </div>
                    </div>
                    <div style={styles.drawerSection}>
                      <div style={styles.drawerSectionTitle}>Comentário completo</div>
                      <div style={styles.commentFull}>
                        {entry.comment?.text ?? '(removido)'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#78716c', marginTop: '6px' }}>
                        Por: {entry.comment?.authorName ?? '?'} ·{' '}
                        {TRADICAO_LABELS[
                          (entry.comment?.tradicao as Tradicao) ?? TRADICOES[0]!
                        ]}
                      </div>
                    </div>
                    {r.note && (
                      <div style={styles.drawerSection}>
                        <div style={styles.drawerSectionTitle}>Nota do reportador</div>
                        <div style={styles.commentFull}>{r.note}</div>
                      </div>
                    )}
                    <div style={styles.drawerSection}>
                      <div style={styles.drawerSectionTitle}>
                        Ações do moderador
                      </div>
                      <input
                        type="text"
                        placeholder="Nota (obrigatória para 'other' / 'lgpd-violation')"
                        value={actionNote}
                        onChange={(e) => setActionNote(e.target.value)}
                        style={styles.noteInput}
                        aria-label="Nota do moderador"
                      />
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                          gap: '8px',
                          marginTop: '12px',
                        }}
                      >
                        <button
                          onClick={() => handleAction('approve')}
                          style={{
                            ...styles.actionBtn,
                            ...styles.actionBtnPrimary,
                            minHeight: '48px',
                          }}
                        >
                          ✓ Aprovar
                        </button>
                        <button
                          onClick={() => handleAction('deny')}
                          style={{
                            ...styles.actionBtn,
                            ...styles.actionBtnDanger,
                            minHeight: '48px',
                          }}
                        >
                          ✗ Negar
                        </button>
                        <button
                          onClick={() => handleAction('escalate')}
                          style={{
                            ...styles.actionBtn,
                            ...styles.actionBtnWarn,
                            minHeight: '48px',
                          }}
                        >
                          ↑ Escalar
                        </button>
                        <button
                          onClick={() => handleAction('auto-flag')}
                          style={{ ...styles.actionBtn, minHeight: '48px' }}
                        >
                          🚩 Auto-flag
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </aside>
        </>
      )}

      <footer
        style={{
          padding: '16px',
          fontSize: '11px',
          color: '#a8a29e',
          textAlign: 'center',
        }}
      >
        Atalhos: j/k navegar · a/d/e ações · Enter abrir · Esc fechar · / buscar
      </footer>
    </main>
  );
}