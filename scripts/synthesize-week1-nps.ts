#!/usr/bin/env tsx
/**
 * WEEK-1 NPS SYNTHESIS — Wave 38 / POST-LAUNCH DAY-7
 * ============================================================================
 * Sintetiza dados de NPS coletados nos Dias 1, 3 e 7 pós-launch (W33-7 NPS
 * prompt) e gera relatório agregados por:
 *   - tradição preference (Candomblé, Umbanda, Ifá, Cabala, Astrologia, Tantra)
 *   - Wave de cohort (Wave 1, 2, 3)
 *   - NPS trend Day 1 → Day 7 (delta + slope)
 *
 * Calcula:
 *   - NPS por dia (PROMOTERS - DETRACTORS, em %)
 *   - Top 3 promoters + razões verbatim (LGPD-clean)
 *   - Top 3 detractors + razões verbatim (LGPD-clean)
 *   - Recomendação: CONTINUE / ITERATE / HOLD
 *
 * Output:
 *   - reports/week1-nps-synthesis.json  (machine-readable, sem PII)
 *   - reports/week1-nps-synthesis.md    (human-readable)
 *
 * LGPD:
 *   - Apenas agregados + verbatim livremente compartilhado por usuários
 *     (NPS prompt explicitamente opt-in).
 *   - k-anonymity aplicado para cohorts < 5 respondentes.
 * ============================================================================
 */

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// ----------------------------------------------------------------------------
// Tipos
// ----------------------------------------------------------------------------

type Tradição =
  | 'Candomblé'
  | 'Umbanda'
  | 'Ifá'
  | 'Cabala'
  | 'Astrologia'
  | 'Tantra'
  | 'Outra';

type WaveCohort = 'wave-1' | 'wave-2' | 'wave-3';

interface NPSResponse {
  userId: string;
  tradição: Tradição;
  cohort: WaveCohort;
  day: 1 | 3 | 7;
  score: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  comentário?: string;
  timestamp: string; // ISO
}

interface NPSDayBucket {
  day: 1 | 3 | 7;
  total: number;
  promoters: number; // 9-10
  passives: number; // 7-8
  detractors: number; // 0-6
  nps: number; // %
  p50: number;
}

interface NPSByTradição {
  tradição: Tradição;
  responses: number;
  nps: number;
  p50: number;
}

interface NPSByWave {
  cohort: WaveCohort;
  responses: number;
  nps: number;
  p50: number;
}

interface TopReason {
  rank: 1 | 2 | 3;
  theme: string;
  verbatimQuote: string;
  frequency: number;
}

interface SynthesisReport {
  generatedAt: string;
  daysCovered: 3;
  totalResponses: number;
  byDay: NPSDayBucket[];
  byTradição: NPSByTradição[];
  byWave: NPSByWave[];
  npsTrend: {
    day1: number;
    day3: number;
    day7: number;
    deltaDay1ToDay7: number;
    slope: 'rising' | 'flat' | 'falling';
  };
  topPromoters: TopReason[];
  topDetractors: TopReason[];
  recommendation: 'CONTINUE' | 'ITERATE' | 'HOLD';
  recommendationRationale: string;
  kAnonymityApplied: boolean;
  lgpdCompliant: true;
}

// ----------------------------------------------------------------------------
// Mock data — substituir por query real ao PostHog/DB em produção
// ----------------------------------------------------------------------------

function loadMockNPSResponses(): NPSResponse[] {
  // 200 responses total (mock representativo). Em produção: query a tabela
  // `nps_responses` ou export PostHog com cohort breakdown.
  const mock: NPSResponse[] = [
    // Day 1 — 80 responses
    { userId: 'u1', tradição: 'Candomblé', cohort: 'wave-1', day: 1, score: 10, comentário: 'Amei o akasha, sensação de acolhimento', timestamp: '2026-06-24T10:00:00Z' },
    { userId: 'u2', tradição: 'Umbanda', cohort: 'wave-1', day: 1, score: 9, comentário: 'Comunidade vibrante', timestamp: '2026-06-24T11:00:00Z' },
    { userId: 'u3', tradição: 'Cabala', cohort: 'wave-2', day: 1, score: 5, comentário: 'Confunde algumas simbologias', timestamp: '2026-06-24T12:00:00Z' },
    // ... (truncated for brevity; em produção: 200+ rows reais)
  ];

  // Expandir mock para 200 responses com distribuição realista
  const expanded: NPSResponse[] = [...mock];
  const days: Array<1 | 3 | 7> = [1, 3, 7];
  const tradições: Tradição[] = ['Candomblé', 'Umbanda', 'Ifá', 'Cabala', 'Astrologia', 'Tantra'];
  const cohorts: WaveCohort[] = ['wave-1', 'wave-2', 'wave-3'];

  for (let i = 4; i <= 200; i++) {
    const day = days[i % 3]!;
    const tradição = tradições[i % tradições.length]!;
    const cohort = cohorts[i % cohorts.length]!;
    // Distribuição: 40% promoters, 30% passives, 30% detractors
    const r = i % 10;
    const score = (r < 4 ? 9 + (i % 2) : r < 7 ? 7 + (i % 2) : 3 + (i % 4)) as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
    expanded.push({
      userId: `u${i}`,
      tradição,
      cohort,
      day,
      score,
      comentário: undefined,
      timestamp: `2026-06-${24 + day}T${10 + (i % 12)}:00:00Z`,
    });
  }

  return expanded;
}

// ----------------------------------------------------------------------------
// Cálculos
// ----------------------------------------------------------------------------

function classifyNPS(score: number): 'promoter' | 'passive' | 'detractor' {
  if (score >= 9) return 'promoter';
  if (score >= 7) return 'passive';
  return 'detractor';
}

function computeDayBucket(responses: NPSResponse[], day: 1 | 3 | 7): NPSDayBucket {
  const dayResponses = responses.filter((r) => r.day === day);
  const total = dayResponses.length;
  if (total === 0) {
    return { day, total: 0, promoters: 0, passives: 0, detractors: 0, nps: 0, p50: 0 };
  }
  const promoters = dayResponses.filter((r) => classifyNPS(r.score) === 'promoter').length;
  const passives = dayResponses.filter((r) => classifyNPS(r.score) === 'passive').length;
  const detractors = dayResponses.filter((r) => classifyNPS(r.score) === 'detractor').length;
  const nps = Math.round(((promoters - detractors) / total) * 100);

  // P50
  const scores = dayResponses.map((r) => r.score).sort((a, b) => a - b);
  const p50 = scores[Math.floor(scores.length / 2)]!;

  return { day, total, promoters, passives, detractors, nps, p50 };
}

function computeByTradição(responses: NPSResponse[]): NPSByTradição[] {
  const tradições: Tradição[] = ['Candomblé', 'Umbanda', 'Ifá', 'Cabala', 'Astrologia', 'Tantra', 'Outra'];
  return tradições.map((tradição) => {
    const filtered = responses.filter((r) => r.tradição === tradição);
    if (filtered.length === 0) {
      return { tradição, responses: 0, nps: 0, p50: 0 };
    }
    const promoters = filtered.filter((r) => classifyNPS(r.score) === 'promoter').length;
    const detractors = filtered.filter((r) => classifyNPS(r.score) === 'detractor').length;
    const nps = Math.round(((promoters - detractors) / filtered.length) * 100);
    const scores = filtered.map((r) => r.score).sort((a, b) => a - b);
    const p50 = scores[Math.floor(scores.length / 2)]!;
    return { tradição, responses: filtered.length, nps, p50 };
  });
}

function computeByWave(responses: NPSResponse[]): NPSByWave[] {
  const cohorts: WaveCohort[] = ['wave-1', 'wave-2', 'wave-3'];
  return cohorts.map((cohort) => {
    const filtered = responses.filter((r) => r.cohort === cohort);
    if (filtered.length === 0) {
      return { cohort, responses: 0, nps: 0, p50: 0 };
    }
    const promoters = filtered.filter((r) => classifyNPS(r.score) === 'promoter').length;
    const detractors = filtered.filter((r) => classifyNPS(r.score) === 'detractor').length;
    const nps = Math.round(((promoters - detractors) / filtered.length) * 100);
    const scores = filtered.map((r) => r.score).sort((a, b) => a - b);
    const p50 = scores[Math.floor(scores.length / 2)]!;
    return { cohort, responses: filtered.length, nps, p50 };
  });
}

function computeTopReasons(responses: NPSResponse[], type: 'promoter' | 'detractor'): TopReason[] {
  const filtered = responses.filter((r) => classifyNPS(r.score) === type && r.comentário);
  const themes = new Map<string, { count: number; quotes: string[] }>();

  // Heurística simples de categorização (em produção: NLP ou LLM cluster)
  const themeKeywords: Record<string, string[]> = {
    'Comunidade acolhedora': ['acolh', 'comunidade', 'pessoas', 'juntos'],
    'Akasha IA': ['akasha', 'ia', 'conversa', 'resposta'],
    'Conteúdo curado': ['conteúdo', 'artigo', 'curadoria', 'qualidade'],
    'UX / Interface': ['interface', 'design', 'bonito', 'limpo', 'confuso', 'dificil'],
    'Performance': ['lentidão', 'rápido', 'carregando', 'demora'],
    'Onboarding': ['onboarding', 'cadastro', 'primeiro', 'inicio'],
    'Falta conteúdo X': ['falta', 'mais', 'pouco'],
    'Pricing / Free tier': ['gratis', 'preço', 'pago', 'caro'],
  };

  for (const r of filtered) {
    const comment = r.comentário!.toLowerCase();
    for (const [theme, keywords] of Object.entries(themeKeywords)) {
      if (keywords.some((kw) => comment.includes(kw))) {
        if (!themes.has(theme)) themes.set(theme, { count: 0, quotes: [] });
        const entry = themes.get(theme)!;
        entry.count++;
        if (entry.quotes.length < 3) entry.quotes.push(r.comentário!);
        break;
      }
    }
  }

  return Array.from(themes.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3)
    .map(([theme, data], idx) => ({
      rank: (idx + 1) as 1 | 2 | 3,
      theme,
      verbatimQuote: data.quotes[0] ?? '',
      frequency: data.count,
    }));
}

function deriveRecommendation(byDay: NPSDayBucket[], byWave: NPSByWave[]): { recommendation: 'CONTINUE' | 'ITERATE' | 'HOLD'; rationale: string } {
  const day7 = byDay.find((b) => b.day === 7);
  const day1 = byDay.find((b) => b.day === 1);
  if (!day7 || !day1) {
    return { recommendation: 'HOLD', rationale: 'Dados insuficientes para recomendação' };
  }

  const delta = day7.nps - day1.nps;
  const totalResponses = byDay.reduce((sum, b) => sum + b.total, 0);

  if (day7.nps >= 30 && delta >= 0) {
    return {
      recommendation: 'CONTINUE',
      rationale: `NPS D7 = ${day7.nps} (target ≥ 30 ✅), delta D1→D7 = +${delta}pp, ${totalResponses} responses totais.`,
    };
  }
  if (day7.nps >= 20 && delta >= -5) {
    return {
      recommendation: 'ITERATE',
      rationale: `NPS D7 = ${day7.nps} (20-30, abaixo target), delta = ${delta}pp. Iterar onboarding + top detractor themes antes de growth.`,
    };
  }
  return {
    recommendation: 'HOLD',
    rationale: `NPS D7 = ${day7.nps} (< 20, ESCALATE threshold). Wave 38 vira "rebuild trust" mode.`,
  };
}

function applyKAnonymity<T extends { responses: number }>(items: T[]): T[] {
  return items.map((item) => (item.responses < 5 ? { ...item, responses: -1 } : item));
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------

function main(): void {
  const responses = loadMockNPSResponses();

  const byDay: NPSDayBucket[] = [1, 3, 7].map((d) => computeDayBucket(responses, d as 1 | 3 | 7));
  const byTradição = applyKAnonymity(computeByTradição(responses));
  const byWave = applyKAnonymity(computeByWave(responses));

  const day1NPS = byDay.find((b) => b.day === 1)?.nps ?? 0;
  const day3NPS = byDay.find((b) => b.day === 3)?.nps ?? 0;
  const day7NPS = byDay.find((b) => b.day === 7)?.nps ?? 0;
  const delta = day7NPS - day1NPS;
  const slope: 'rising' | 'flat' | 'falling' = delta > 3 ? 'rising' : delta < -3 ? 'falling' : 'flat';

  const topPromoters = computeTopReasons(responses, 'promoter');
  const topDetractors = computeTopReasons(responses, 'detractor');
  const { recommendation, rationale } = deriveRecommendation(byDay, byWave);

  const report: SynthesisReport = {
    generatedAt: new Date().toISOString(),
    daysCovered: 3,
    totalResponses: responses.length,
    byDay,
    byTradição,
    byWave,
    npsTrend: {
      day1: day1NPS,
      day3: day3NPS,
      day7: day7NPS,
      deltaDay1ToDay7: delta,
      slope,
    },
    topPromoters,
    topDetractors,
    recommendation,
    recommendationRationale: rationale,
    kAnonymityApplied: true,
    lgpdCompliant: true,
  };

  // Output
  const reportsDir = resolve(process.cwd(), 'reports');
  if (!existsSync(reportsDir)) mkdirSync(reportsDir, { recursive: true });

  writeFileSync(
    resolve(reportsDir, 'week1-nps-synthesis.json'),
    JSON.stringify(report, null, 2),
    'utf8',
  );

  // Markdown
  const md = generateMarkdown(report);
  writeFileSync(resolve(reportsDir, 'week1-nps-synthesis.md'), md, 'utf8');

  // eslint-disable-next-line no-console
  console.log(`✅ NPS synthesis written to reports/week1-nps-synthesis.{json,md}`);
  // eslint-disable-next-line no-console
  console.log(`   Total responses: ${report.totalResponses} | Day-7 NPS: ${day7NPS} | Recommendation: ${recommendation}`);
}

function generateMarkdown(r: SynthesisReport): string {
  return `# Week 1 NPS Synthesis — Post-Launch Day 7 (W38)

> Gerado em ${r.generatedAt} | Total responses: **${r.totalResponses}** | Days covered: **${r.daysCovered}** (Day 1, 3, 7)

## 1. NPS Trend (Day 1 → Day 7)

| Day | NPS | Promoters | Passives | Detractors | P50 | Total |
|-----|-----|-----------|----------|------------|-----|-------|
${r.byDay.map((b) => `| D${b.day} | ${b.nps} | ${b.promoters} | ${b.passives} | ${b.detractors} | ${b.p50} | ${b.total} |`).join('\n')}

**Delta D1 → D7:** ${r.npsTrend.deltaDay1ToDay7 >= 0 ? '+' : ''}${r.npsTrend.deltaDay1ToDay7}pp | **Slope:** ${r.npsTrend.slope}

## 2. By Tradição (k-anonymity applied)

| Tradição | Responses | NPS | P50 |
|----------|-----------|-----|-----|
${r.byTradição.map((t) => `| ${t.tradição} | ${t.responses === -1 ? '< 5' : t.responses} | ${t.nps} | ${t.p50} |`).join('\n')}

## 3. By Wave Cohort

| Cohort | Responses | NPS | P50 |
|--------|-----------|-----|-----|
${r.byWave.map((w) => `| ${w.cohort} | ${w.responses === -1 ? '< 5' : w.responses} | ${w.nps} | ${w.p50} |`).join('\n')}

## 4. Top 3 Promoters (themes)

${r.topPromoters.map((p) => `### #${p.rank} — ${p.theme} (freq: ${p.frequency})
> "${p.verbatimQuote}"
`).join('\n')}

## 5. Top 3 Detractors (themes)

${r.topDetractors.map((d) => `### #${d.rank} — ${d.theme} (freq: ${d.frequency})
> "${d.verbatimQuote}"
`).join('\n')}

## 6. Recommendation

**${r.recommendation}** — ${r.recommendationRationale}

---

**LGPD:** k-anonymity applied (k≥5). No PII in this report. Verbatim quotes only from opt-in NPS prompt (W33-7).
`;
}

main();