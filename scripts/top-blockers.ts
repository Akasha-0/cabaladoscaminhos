#!/usr/bin/env tsx
/**
 * TOP BLOCKERS ANALYSIS — Wave 38 / POST-LAUNCH DAY-7
 * ============================================================================
 * Agrega sinais de "blocker" de 4 fontes:
 *   1. Support tickets (categorizados por tipo + severidade)
 *   2. Bug reports (count por severity P0/P1/P2/P3)
 *   3. Performance bottlenecks (p95 latency por rota)
 *   4. Conversion drop-offs (funnel analytics — drop-off rate por etapa)
 *
 * Output:
 *   - reports/top-blockers.json (machine-readable)
 *   - reports/top-blockers.md   (human-readable)
 *
 * Critério de priorização para Week 2 sprint:
 *   - P0 (must fix this week): severity P0 bugs OR > 10 tickets/dia OR conversion < 30%
 *   - P1 (should fix): severity P1 bugs OR 5-10 tickets/dia OR conversion 30-50%
 *   - P2 (nice to have): severity P2 OR < 5 tickets/dia
 *
 * LGPD: aggregate-only, no userIds.
 * ============================================================================
 */

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// ----------------------------------------------------------------------------
// Tipos
// ----------------------------------------------------------------------------

type Severity = 'P0' | 'P1' | 'P2' | 'P3';
type FixPriority = 'P0' | 'P1' | 'P2';

interface SupportTicket {
  ticketId: string;
  category: 'auth' | 'onboarding' | 'akasha' | 'community' | 'billing' | 'performance' | 'content' | 'other';
  severity: Severity;
  subject: string;
  openedAt: string;
  resolvedAt?: string;
  resolvedInHours?: number;
}

interface BugReport {
  bugId: string;
  title: string;
  severity: Severity;
  component: string;
  reportedAt: string;
}

interface PerfBottleneck {
  route: string;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  requestCount: number;
}

interface FunnelDropOff {
  step: string;
  entryCount: number;
  exitCount: number;
  conversionPct: number;
}

interface TopBlocker {
  rank: number;
  title: string;
  source: 'support' | 'bugs' | 'performance' | 'conversion';
  severity: Severity;
  fixPriority: FixPriority;
  impactMetric: string;
  frequency: number;
  suggestedFix: string;
  effort: 'S' | 'M' | 'L';
  owner: string;
}

interface BlockerReport {
  generatedAt: string;
  summary: {
    openTickets: number;
    openBugsP0: number;
    openBugsP1: number;
    perfRoutesOverP95: number;
    funnelStepsUnder30Conversion: number;
  };
  byCategory: Array<{
    category: string;
    ticketCount: number;
    p0Count: number;
    avgResolutionHours: number;
  }>;
  bySeverity: Record<Severity, number>;
  perfBottlenecks: PerfBottleneck[];
  funnelDropOffs: FunnelDropOff[];
  topBlockers: TopBlocker[];
  week2Fixes: TopBlocker[]; // P0 + P1 only
  lgpdCompliant: true;
}

// ----------------------------------------------------------------------------
// Mock data loaders (em produção: queries a Sentry, Helpdesk, PostHog)
// ----------------------------------------------------------------------------

function loadMockSupportTickets(): SupportTicket[] {
  // 47 tickets abertos na Week 1 (mock)
  return [
    { ticketId: 'T001', category: 'onboarding', severity: 'P1', subject: 'Não consigo completar cadastro', openedAt: '2026-06-24T08:00:00Z', resolvedAt: '2026-06-25T10:00:00Z', resolvedInHours: 26 },
    { ticketId: 'T002', category: 'akasha', severity: 'P0', subject: 'Akasha retorna erro 500', openedAt: '2026-06-26T14:00:00Z' },
    { ticketId: 'T003', category: 'auth', severity: 'P1', subject: 'Login com Google falha em Safari', openedAt: '2026-06-25T11:00:00Z', resolvedAt: '2026-06-26T09:00:00Z', resolvedInHours: 22 },
    { ticketId: 'T004', category: 'performance', severity: 'P1', subject: 'Feed demora 5+ segundos para carregar', openedAt: '2026-06-27T16:00:00Z' },
    { ticketId: 'T005', category: 'community', severity: 'P2', subject: 'Como denunciar um post?', openedAt: '2026-06-28T09:00:00Z', resolvedAt: '2026-06-28T11:00:00Z', resolvedInHours: 2 },
    // ... em produção: 47+ tickets
  ];
}

function loadMockBugReports(): BugReport[] {
  return [
    { bugId: 'B001', title: 'Crash ao abrir akasha sem internet', severity: 'P0', component: 'mobile/akasha', reportedAt: '2026-06-25T14:00:00Z' },
    { bugId: 'B002', title: 'Imagens não carregam em posts > 5MB', severity: 'P1', component: 'community/posts', reportedAt: '2026-06-26T10:00:00Z' },
    { bugId: 'B003', title: 'Comentários duplicados após retry', severity: 'P2', component: 'community/comments', reportedAt: '2026-06-27T08:00:00Z' },
    { bugId: 'B004', title: 'Stripe webhook timeout intermitente', severity: 'P0', component: 'billing/stripe-webhook', reportedAt: '2026-06-28T18:00:00Z' },
    { bugId: 'B005', title: 'A11y: focus trap ausente em modal de convite', severity: 'P2', component: 'admin/modals', reportedAt: '2026-06-29T09:00:00Z' },
    { bugId: 'B006', title: 'Onboarding pular etapa causa user sem tradição', severity: 'P1', component: 'onboarding/flow', reportedAt: '2026-06-29T15:00:00Z' },
  ];
}

function loadMockPerfBottlenecks(): PerfBottleneck[] {
  return [
    { route: '/feed', p50Ms: 120, p95Ms: 1850, p99Ms: 3200, requestCount: 45200 },
    { route: '/api/akasha/chat', p50Ms: 340, p95Ms: 2100, p99Ms: 4500, requestCount: 8900 },
    { route: '/api/community/posts', p50Ms: 85, p95Ms: 420, p99Ms: 1100, requestCount: 23400 },
    { route: '/admin/insights', p50Ms: 280, p95Ms: 1900, p99Ms: 3800, requestCount: 320 },
    { route: '/api/billing/checkout', p50Ms: 220, p95Ms: 980, p99Ms: 2100, requestCount: 1240 },
  ];
}

function loadMockFunnelDropOffs(): FunnelDropOff[] {
  return [
    { step: 'visitor → landing view', entryCount: 12000, exitCount: 9600, conversionPct: 80 },
    { step: 'landing → signup start', entryCount: 9600, exitCount: 2880, conversionPct: 30 },
    { step: 'signup start → signup complete', entryCount: 2880, exitCount: 2304, conversionPct: 80 },
    { step: 'signup complete → tradição select', entryCount: 2304, exitCount: 1843, conversionPct: 80 },
    { step: 'tradição select → first post', entryCount: 1843, exitCount: 553, conversionPct: 30 },
    { step: 'first post → akasha chat', entryCount: 553, exitCount: 332, conversionPct: 60 },
  ];
}

// ----------------------------------------------------------------------------
// Aggregations
// ----------------------------------------------------------------------------

function aggregateByCategory(tickets: SupportTicket[]): BlockerReport['byCategory'] {
  const categories = ['auth', 'onboarding', 'akasha', 'community', 'billing', 'performance', 'content', 'other'] as const;
  return categories.map((category) => {
    const filtered = tickets.filter((t) => t.category === category);
    const p0Count = filtered.filter((t) => t.severity === 'P0').length;
    const resolved = filtered.filter((t) => t.resolvedInHours !== undefined);
    const avgResolutionHours = resolved.length > 0 ? resolved.reduce((sum, t) => sum + (t.resolvedInHours ?? 0), 0) / resolved.length : 0;
    return {
      category,
      ticketCount: filtered.length,
      p0Count,
      avgResolutionHours: Math.round(avgResolutionHours * 10) / 10,
    };
  });
}

function aggregateBySeverity(tickets: SupportTicket[], bugs: BugReport[]): Record<Severity, number> {
  const out: Record<Severity, number> = { P0: 0, P1: 0, P2: 0, P3: 0 };
  for (const t of tickets) out[t.severity]++;
  for (const b of bugs) out[b.severity]++;
  return out;
}

function deriveTopBlockers(
  tickets: SupportTicket[],
  bugs: BugReport[],
  perf: PerfBottleneck[],
  funnels: FunnelDropOff[],
): TopBlocker[] {
  const blockers: TopBlocker[] = [];

  // Support-driven
  const ticketByCategory = aggregateByCategory(tickets);
  for (const cat of ticketByCategory) {
    if (cat.p0Count > 0 || cat.ticketCount >= 5) {
      blockers.push({
        rank: 0,
        title: `Alto volume de tickets: ${cat.category}`,
        source: 'support',
        severity: cat.p0Count > 0 ? 'P0' : 'P1',
        fixPriority: cat.p0Count > 0 ? 'P0' : 'P1',
        impactMetric: `${cat.ticketCount} tickets, ${cat.p0Count} P0, ${cat.avgResolutionHours}h avg resolution`,
        frequency: cat.ticketCount,
        suggestedFix: cat.category === 'onboarding' ? 'Adicionar tooltips + checklist visual nas etapas 2-3' :
                      cat.category === 'akasha' ? 'Adicionar fallback + retry exponential backoff' :
                      cat.category === 'auth' ? 'Implementar OAuth flow específico para Safari' :
                      'Investigar UX do fluxo + adicionar FAQ in-app',
        effort: 'M',
        owner: cat.category === 'onboarding' ? 'Designer (Lina)' : cat.category === 'akasha' ? 'Coder + AI' : 'Coder',
      });
    }
  }

  // Bug-driven
  for (const bug of bugs) {
    if (bug.severity === 'P0' || bug.severity === 'P1') {
      blockers.push({
        rank: 0,
        title: bug.title,
        source: 'bugs',
        severity: bug.severity,
        fixPriority: bug.severity,
        impactMetric: `Severity ${bug.severity} em ${bug.component}`,
        frequency: 1,
        suggestedFix: bug.component.startsWith('mobile') ? 'Adicionar offline cache + retry pattern' :
                      bug.component.includes('stripe') ? 'Implementar webhook idempotency keys + retry queue' :
                      'Code review + fix targeted',
        effort: bug.severity === 'P0' ? 'S' : 'M',
        owner: 'Coder + QA',
      });
    }
  }

  // Performance-driven (p95 > 1000ms)
  for (const p of perf) {
    if (p.p95Ms > 1000) {
      blockers.push({
        rank: 0,
        title: `p95 latency alta em ${p.route}`,
        source: 'performance',
        severity: p.p95Ms > 2000 ? 'P0' : 'P1',
        fixPriority: p.p95Ms > 2000 ? 'P0' : 'P1',
        impactMetric: `p95 = ${p.p95Ms}ms (target < 800ms), ${p.requestCount.toLocaleString('pt-BR')} req`,
        frequency: p.requestCount,
        suggestedFix: 'Adicionar cache layer (Redis) + otimizar queries Prisma + revisar N+1',
        effort: 'M',
        owner: 'Coder + DevOps',
      });
    }
  }

  // Conversion drop-offs (< 50% AND high volume)
  for (const f of funnels) {
    if (f.conversionPct < 50 && f.entryCount > 500) {
      blockers.push({
        rank: 0,
        title: `Drop-off alto em: ${f.step}`,
        source: 'conversion',
        severity: f.conversionPct < 30 ? 'P0' : 'P1',
        fixPriority: f.conversionPct < 30 ? 'P0' : 'P1',
        impactMetric: `Conversion ${f.conversionPct}% (${f.exitCount} lost de ${f.entryCount})`,
        frequency: f.exitCount,
        suggestedFix: f.step.includes('signup') ? 'Simplificar form + social login + auto-fill' :
                      f.step.includes('tradição') ? 'Reduzir opções + adicionar preview visual' :
                      'A/B test copy + CTA + reduzir friction',
        effort: 'M',
        owner: 'Designer + PM',
      });
    }
  }

  // Sort by severity (P0 first), then by frequency desc
  const severityRank: Record<Severity, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };
  blockers.sort((a, b) => {
    const s = severityRank[a.severity] - severityRank[b.severity];
    if (s !== 0) return s;
    return b.frequency - a.frequency;
  });

  return blockers.map((b, idx) => ({ ...b, rank: idx + 1 }));
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------

function main(): void {
  const tickets = loadMockSupportTickets();
  const bugs = loadMockBugReports();
  const perf = loadMockPerfBottlenecks();
  const funnels = loadMockFunnelDropOffs();

  const byCategory = aggregateByCategory(tickets);
  const bySeverity = aggregateBySeverity(tickets, bugs);

  const topBlockers = deriveTopBlockers(tickets, bugs, perf, funnels);
  const week2Fixes = topBlockers.filter((b) => b.fixPriority === 'P0' || b.fixPriority === 'P1');

  const summary = {
    openTickets: tickets.filter((t) => !t.resolvedAt).length,
    openBugsP0: bugs.filter((b) => b.severity === 'P0').length,
    openBugsP1: bugs.filter((b) => b.severity === 'P1').length,
    perfRoutesOverP95: perf.filter((p) => p.p95Ms > 1000).length,
    funnelStepsUnder30Conversion: funnels.filter((f) => f.conversionPct < 30).length,
  };

  const report: BlockerReport = {
    generatedAt: new Date().toISOString(),
    summary,
    byCategory,
    bySeverity,
    perfBottlenecks: perf,
    funnelDropOffs: funnels,
    topBlockers,
    week2Fixes,
    lgpdCompliant: true,
  };

  const reportsDir = resolve(process.cwd(), 'reports');
  if (!existsSync(reportsDir)) mkdirSync(reportsDir, { recursive: true });

  writeFileSync(
    resolve(reportsDir, 'top-blockers.json'),
    JSON.stringify(report, null, 2),
    'utf8',
  );
  writeFileSync(resolve(reportsDir, 'top-blockers.md'), generateMarkdown(report), 'utf8');

  // eslint-disable-next-line no-console
  console.log(`✅ Top blockers written to reports/top-blockers.{json,md}`);
  // eslint-disable-next-line no-console
  console.log(`   Summary: ${summary.openTickets} open tickets | ${summary.openBugsP0} P0 bugs | ${summary.perfRoutesOverP95} perf routes > p95`);
  // eslint-disable-next-line no-console
  console.log(`   Top ${topBlockers.length} blockers | ${week2Fixes.length} for Week 2 sprint`);
}

function generateMarkdown(r: BlockerReport): string {
  return `# Top Blockers Analysis — Post-Launch Day 7 (W38)

> Gerado em ${r.generatedAt}

## 1. Summary

| Metric | Value |
|--------|-------|
| Open tickets | ${r.summary.openTickets} |
| Open P0 bugs | ${r.summary.openBugsP0} |
| Open P1 bugs | ${r.summary.openBugsP1} |
| Perf routes > p95 (1000ms) | ${r.summary.perfRoutesOverP95} |
| Funnel steps < 30% conversion | ${r.summary.funnelStepsUnder30Conversion} |

## 2. Support Tickets by Category

| Category | Tickets | P0 | Avg Resolution (h) |
|----------|---------|----|--------------------|
${r.byCategory.map((c) => `| ${c.category} | ${c.ticketCount} | ${c.p0Count} | ${c.avgResolutionHours} |`).join('\n')}

## 3. Bugs by Severity

| Severity | Count |
|----------|-------|
${Object.entries(r.bySeverity).map(([sev, count]) => `| ${sev} | ${count} |`).join('\n')}

## 4. Performance Bottlenecks (p95 > 1000ms highlighted)

| Route | p50 (ms) | p95 (ms) | p99 (ms) | Requests |
|-------|----------|----------|----------|----------|
${r.perfBottlenecks.map((p) => `| ${p.route} | ${p.p50Ms} | ${p.p95Ms} | ${p.p99Ms} | ${p.requestCount.toLocaleString('pt-BR')} |`).join('\n')}

## 5. Funnel Drop-offs

| Step | Entry | Exit | Conversion |
|------|-------|------|------------|
${r.funnelDropOffs.map((f) => `| ${f.step} | ${f.entryCount} | ${f.exitCount} | ${f.conversionPct}% |`).join('\n')}

## 6. Top Blockers (ranked by severity + frequency)

| # | Title | Source | Severity | Fix Priority | Impact | Owner |
|---|-------|--------|----------|--------------|--------|-------|
${r.topBlockers.map((b) => `| ${b.rank} | ${b.title} | ${b.source} | ${b.severity} | ${b.fixPriority} | ${b.impactMetric} | ${b.owner} |`).join('\n')}

## 7. Week 2 Sprint Fixes (P0 + P1)

${r.week2Fixes.map((b) => `### #${b.rank} — ${b.title}
- **Severity:** ${b.severity} | **Effort:** ${b.effort} | **Owner:** ${b.owner}
- **Impact:** ${b.impactMetric}
- **Suggested fix:** ${b.suggestedFix}
`).join('\n')}

---

**LGPD:** Aggregate-only, no userIds. Tickets categorized by team-tagged labels, not PII.
`;
}

main();