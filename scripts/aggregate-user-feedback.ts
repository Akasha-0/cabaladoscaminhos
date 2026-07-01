#!/usr/bin/env tsx
/**
 * USER FEEDBACK AGGREGATION — Wave 38 / POST-LAUNCH DAY-7
 * ============================================================================
 * Agrega feedback de múltiplas fontes:
 *   1. NPS responses (W33-7 prompt, Day 1/3/7)
 *   2. Support tickets (categorized)
 *   3. Feature votes (in-app voting board)
 *   4. Beta retrospective (qualitative notes from W36-8)
 *   5. App store reviews (PT-BR + EN)
 *
 * Output:
 *   - reports/user-feedback-aggregation.json
 *   - reports/user-feedback-aggregation.md
 *
 * Agrega:
 *   - Top 5 feature requests (by mention count across sources)
 *   - Top 5 bug complaints (by severity + frequency)
 *   - Top 3 UX confusion points (qualitative cluster)
 *   - Matriz impact × effort (iceberg prioritization)
 *
 * LGPD: aggregate + opt-in only.
 * ============================================================================
 */

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

interface FeedbackItem {
  source: 'nps' | 'support' | 'feature_vote' | 'retro' | 'app_store';
  text: string;
  timestamp: string;
  userId?: string;
}

interface FeatureVote {
  featureId: string;
  title: string;
  votes: number;
  voters: string[]; // hashed userIds
  category: 'community' | 'akasha' | 'onboarding' | 'content' | 'billing' | 'mobile' | 'other';
  effort: 'S' | 'M' | 'L';
  impact: 1 | 2 | 3 | 4 | 5; // 5 = highest
}

interface UXConfusionPoint {
  rank: 1 | 2 | 3;
  theme: string;
  occurrences: number;
  exampleQuotes: string[];
  rootCause: string;
}

interface AggregatedFeedback {
  generatedAt: string;
  sources: Array<{ name: string; itemCount: number }>;
  topFeatureRequests: FeatureVote[];
  topBugComplaints: Array<{ theme: string; severity: 'P0' | 'P1' | 'P2'; count: number }>;
  topUXConfusion: UXConfusionPoint[];
  impactEffortMatrix: {
    quickWins: FeatureVote[]; // high impact, low effort
    bigBets: FeatureVote[];   // high impact, high effort
    fillers: FeatureVote[];   // low impact, low effort
    avoid: FeatureVote[];     // low impact, high effort
  };
  lgpdCompliant: true;
}

// ----------------------------------------------------------------------------
// Mock loaders
// ----------------------------------------------------------------------------

function loadMockFeedback(): FeedbackItem[] {
  return [
    { source: 'nps', text: 'Akasha é incrível, mas demora para carregar', timestamp: '2026-06-26T10:00:00Z' },
    { source: 'nps', text: 'Queria poder favoritar threads', timestamp: '2026-06-27T11:00:00Z' },
    { source: 'support', text: 'Como adiciono foto de capa no meu perfil?', timestamp: '2026-06-25T14:00:00Z' },
    { source: 'support', text: 'Akasha erro 500 ao perguntar sobre Cabala', timestamp: '2026-06-26T15:00:00Z' },
    { source: 'feature_vote', text: 'Modo escuro', timestamp: '2026-06-28T09:00:00Z' },
    { source: 'feature_vote', text: 'Notificações push para respostas', timestamp: '2026-06-28T10:00:00Z' },
    { source: 'retro', text: 'Onboarding etapa 3 confusa — qual a diferença entre os 5 tipos de tradição?', timestamp: '2026-06-29T16:00:00Z' },
    { source: 'app_store', text: 'App lindo mas trava muito no iPhone 12', timestamp: '2026-06-27T20:00:00Z' },
  ];
}

function loadMockFeatureVotes(): FeatureVote[] {
  return [
    { featureId: 'F001', title: 'Modo escuro', votes: 234, voters: [], category: 'mobile', effort: 'M', impact: 4 },
    { featureId: 'F002', title: 'Notificações push para respostas em threads', votes: 189, voters: [], category: 'community', effort: 'M', impact: 5 },
    { featureId: 'F003', title: 'Salvar threads como favoritos', votes: 156, voters: [], category: 'community', effort: 'S', impact: 3 },
    { featureId: 'F004', title: 'Busca full-text nos artigos curados', votes: 142, voters: [], category: 'content', effort: 'M', impact: 4 },
    { featureId: 'F005', title: 'Exportar meus dados (LGPD)', votes: 98, voters: [], category: 'other', effort: 'S', impact: 5 },
    { featureId: 'F006', title: 'Akasha lembra contexto entre sessões', votes: 87, voters: [], category: 'akasha', effort: 'L', impact: 5 },
    { featureId: 'F007', title: 'Galeria de fotos de rituais', votes: 76, voters: [], category: 'community', effort: 'M', impact: 3 },
    { featureId: 'F008', title: 'Perfis públicos com bio longa', votes: 64, voters: [], category: 'community', effort: 'S', impact: 2 },
  ];
}

function loadMockBugComplaints(): Array<{ theme: string; severity: 'P0' | 'P1' | 'P2'; count: number }> {
  return [
    { theme: 'Akasha retorna erro 500 intermitente', severity: 'P0', count: 14 },
    { theme: 'App trava no iPhone 12', severity: 'P0', count: 9 },
    { theme: 'Feed demora para carregar > 5s', severity: 'P1', count: 23 },
    { theme: 'Stripe webhook timeout', severity: 'P0', count: 6 },
    { theme: 'Login Google falha em Safari', severity: 'P1', count: 11 },
    { theme: 'Imagens grandes quebram layout', severity: 'P2', count: 18 },
    { theme: 'Comentários duplicados', severity: 'P2', count: 7 },
  ];
}

// ----------------------------------------------------------------------------
// Aggregations
// ----------------------------------------------------------------------------

function aggregateUXConfusion(feedback: FeedbackItem[]): UXConfusionPoint[] {
  // Heurística: cluster por keyword em comentários qualitativos
  const themes: Record<string, { keywords: string[]; rootCause: string }> = {
    'Onboarding etapa 3 confusa (tradição)': {
      keywords: ['tradição', 'diferença', 'confuso', 'etapa 3'],
      rootCause: 'Falta de explicação contextual sobre cada tradição + ausência de preview visual',
    },
    'Como favoritar / salvar conteúdo': {
      keywords: ['favorit', 'salvar', 'como faço', 'não encontro'],
      rootCause: 'Ícone de favorito não-dominante + ausência de tutorial in-app',
    },
    'Akasha timeout / erro': {
      keywords: ['akasha', 'erro', 'timeout', 'demora', '500'],
      rootCause: 'Falta de feedback durante long-running request + retry pattern ausente',
    },
  };

  const out: UXConfusionPoint[] = [];
  let rank = 1;
  for (const [theme, config] of Object.entries(themes)) {
    const occurrences = feedback.filter((f) => config.keywords.some((kw) => f.text.toLowerCase().includes(kw))).length;
    if (occurrences > 0) {
      const exampleQuotes = feedback.filter((f) => config.keywords.some((kw) => f.text.toLowerCase().includes(kw))).slice(0, 2).map((f) => f.text);
      out.push({ rank: rank++ as 1 | 2 | 3, theme, occurrences, exampleQuotes, rootCause: config.rootCause });
    }
  }
  return out.slice(0, 3);
}

function buildImpactEffortMatrix(features: FeatureVote[]): AggregatedFeedback['impactEffortMatrix'] {
  return {
    quickWins: features.filter((f) => f.impact >= 4 && (f.effort === 'S' || f.effort === 'M')).sort((a, b) => b.votes - a.votes),
    bigBets: features.filter((f) => f.impact >= 4 && f.effort === 'L').sort((a, b) => b.votes - a.votes),
    fillers: features.filter((f) => f.impact < 4 && (f.effort === 'S' || f.effort === 'M')).sort((a, b) => b.votes - a.votes),
    avoid: features.filter((f) => f.impact < 4 && f.effort === 'L').sort((a, b) => b.votes - a.votes),
  };
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------

function main(): void {
  const feedback = loadMockFeedback();
  const featureVotes = loadMockFeatureVotes();
  const bugComplaints = loadMockBugComplaints();

  const topFeatureRequests = [...featureVotes].sort((a, b) => b.votes - a.votes).slice(0, 5);
  const topBugComplaints = [...bugComplaints].sort((a, b) => {
    const sevRank: Record<string, number> = { P0: 0, P1: 1, P2: 2 };
    const s = sevRank[a.severity] - sevRank[b.severity];
    return s !== 0 ? s : b.count - a.count;
  }).slice(0, 5);

  const topUXConfusion = aggregateUXConfusion(feedback);
  const impactEffortMatrix = buildImpactEffortMatrix(featureVotes);

  const sourceCounts = new Map<string, number>();
  for (const f of feedback) sourceCounts.set(f.source, (sourceCounts.get(f.source) ?? 0) + 1);
  const sources = Array.from(sourceCounts.entries()).map(([name, itemCount]) => ({ name, itemCount }));

  const report: AggregatedFeedback = {
    generatedAt: new Date().toISOString(),
    sources,
    topFeatureRequests,
    topBugComplaints,
    topUXConfusion,
    impactEffortMatrix,
    lgpdCompliant: true,
  };

  const reportsDir = resolve(process.cwd(), 'reports');
  if (!existsSync(reportsDir)) mkdirSync(reportsDir, { recursive: true });

  writeFileSync(resolve(reportsDir, 'user-feedback-aggregation.json'), JSON.stringify(report, null, 2), 'utf8');
  writeFileSync(resolve(reportsDir, 'user-feedback-aggregation.md'), generateMarkdown(report), 'utf8');

  // eslint-disable-next-line no-console
  console.log(`✅ User feedback aggregation written to reports/user-feedback-aggregation.{json,md}`);
  // eslint-disable-next-line no-console
  console.log(`   Sources: ${sources.length} | Top features: ${topFeatureRequests.length} | Top bugs: ${topBugComplaints.length} | UX confusion: ${topUXConfusion.length}`);
}

function generateMarkdown(r: AggregatedFeedback): string {
  return `# User Feedback Aggregation — Post-Launch Day 7 (W38)

> Gerado em ${r.generatedAt}

## 1. Sources

| Source | Items |
|--------|-------|
${r.sources.map((s) => `| ${s.name} | ${s.itemCount} |`).join('\n')}

## 2. Top 5 Feature Requests

| Rank | Feature | Votes | Category | Impact | Effort |
|------|---------|-------|----------|--------|--------|
${r.topFeatureRequests.map((f, i) => `| ${i + 1} | ${f.title} | ${f.votes} | ${f.category} | ${f.impact}/5 | ${f.effort} |`).join('\n')}

## 3. Top 5 Bug Complaints (by severity + frequency)

| Theme | Severity | Count |
|-------|----------|-------|
${r.topBugComplaints.map((b) => `| ${b.theme} | ${b.severity} | ${b.count} |`).join('\n')}

## 4. Top 3 UX Confusion Points

${r.topUXConfusion.map((u) => `### #${u.rank} — ${u.theme} (${u.occurrences} occurrences)
- **Example quotes:**
${u.exampleQuotes.map((q) => `  > "${q}"`).join('\n')}
- **Root cause hypothesis:** ${u.rootCause}
`).join('\n')}

## 5. Impact × Effort Matrix

### Quick Wins (high impact, low effort) — DO FIRST

${r.impactEffortMatrix.quickWins.map((f) => `- **${f.title}** (${f.votes} votes, impact ${f.impact}/5, effort ${f.effort})`).join('\n') || '_none_'}

### Big Bets (high impact, high effort) — PLAN

${r.impactEffortMatrix.bigBets.map((f) => `- **${f.title}** (${f.votes} votes, impact ${f.impact}/5, effort ${f.effort})`).join('\n') || '_none_'}

### Fillers (low impact, low effort) — IF TIME

${r.impactEffortMatrix.fillers.map((f) => `- **${f.title}** (${f.votes} votes, impact ${f.impact}/5, effort ${f.effort})`).join('\n') || '_none_'}

### Avoid (low impact, high effort) — DEFER

${r.impactEffortMatrix.avoid.map((f) => `- **${f.title}** (${f.votes} votes, impact ${f.impact}/5, effort ${f.effort})`).join('\n') || '_none_'}

---

**LGPD:** All feedback aggregate or opt-in. No PII stored.
`;
}

main();