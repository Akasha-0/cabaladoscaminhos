/**
 * @akasha/benchmarks — agreement.ts (Wave 32.3)
 *
 * Cálculo de inter-annotator agreement para calibração humana AUT.
 *
 * Métricas implementadas:
 *   - Cohen's κ (2 anotadores)
 *   - Fleiss' κ (3+ anotadores)
 *   - % agreement exato (sanity proxy)
 *   - % agreement ±1 (tolera erro de 1 ponto Likert)
 *   - Per-response disagreement (array de max-min por response)
 *   - Matriz de confusão média (qualitative)
 *
 * Referências:
 *   - Cohen, J. (1960). "A coefficient of agreement for nominal scales."
 *   - Fleiss, J. L. (1971). "Measuring nominal scale agreement among many raters."
 *   - Landis & Koch (1977). "The measurement of observer agreement for categorical data."
 *   - Wave 32.1 research: docs/pesquisa/wave-32.1-human-calibration-protocol.md
 *
 * Decisões de design:
 *   - Likert ordinal scores 0-10 são BUCKETS antes do κ (não tratado como contínuo).
 *     Cohen originalmente é nominal; usamos weighted κ (linear weights) para ordinal,
 *     melhor captação de "perto" vs "longe". Implementação: ponderar 1 - |i-j|/(k-1).
 *   - 2 anotadores: Cohen's κ pairwise + média simples sobre todos os pares.
 *   - 3+ anotadores: Fleiss' κ (generalização) sobre categorias 0-10.
 *   - convergenceTestPassed = mean(κ) >= 0.6 (alvo Wave 32.1).
 *
 * Determinisitc & puro: SEM RNG, SEM rede, SEM LLM. Testável sem mock complexo.
 */

// -----------------------------------------------------------------------------
// Tipos públicos
// -----------------------------------------------------------------------------

/**
 * 1 anotação humana de 1 response por 1 anotador.
 * Mínimo: responseId + annotatorId + 4 scores 0-10.
 */
export interface HumanAnnotation {
  responseId: string;
  annotatorId: string;
  rScore: number; // Recognition 0-10
  tScore: number; // Truth-telling 0-10
  uScore: number; // Understanding 0-10
  vScore: number; // Valence 0-10
}

/**
 * Os 4 critérios R/T/U/V como union type (para iteração type-safe).
 */
export type Criterion = 'rScore' | 'tScore' | 'uScore' | 'vScore';
export const FOUR_CRITERIA: readonly Criterion[] = ['rScore', 'tScore', 'uScore', 'vScore'] as const;

/**
 * Labels humanas (PT-BR) — usadas no report HTML.
 */
export const CRITERION_LABELS_PT: Readonly<Record<Criterion, string>> = {
  rScore: 'R — Recognition (reconhece os 5 Pilares?)',
  tScore: 'T — Truth-telling (verdade + ética?)',
  uScore: 'U — Understanding (CoT visível?)',
  vScore: 'V — Valence (convergência visceral?)',
};

/**
 * Report consolidado para CLI `benchmarks:agreement`.
 */
export interface AgreementReport {
  /** Total de responses anotadas (únicas). */
  totalResponses: number;
  /** Total de anotadores únicos. */
  totalAnnotators: number;
  /** Total de annotations (rows no DB). */
  totalAnnotations: number;
  /** κ por critério (Cohen's κ se 2 anotadores, Fleiss' κ se 3+). */
  kappas: Record<Criterion, number>;
  /** Média dos 4 κ (criterion-level). */
  meanKappa: number;
  /** % agreement exato (todos anotadores deram o mesmo score). */
  pctExactAgreement: Record<Criterion, number>;
  /** % agreement com tolerância ±1 ponto Likert. */
  pctAgreementWithin1: Record<Criterion, number>;
  /** Disagreement (max-min) por response — length = totalResponses. */
  perResponseDisagreement: Record<Criterion, number[]>;
  /** True se meanKappa >= 0.6 (alvo Wave 32.1). */
  convergenceTestPassed: boolean;
  /** Matriz de confusão média sobre os 4 critérios (11x11 = 0..10). */
  confusionMatrix: number[][];
}

// -----------------------------------------------------------------------------
// Helpers internos
// -----------------------------------------------------------------------------

/**
 * Garante que score está em [0, 10]. Caso contrário, clamp + warning (silent).
 */
function clampScore(score: number): number {
  if (Number.isNaN(score)) return 0;
  return Math.max(0, Math.min(10, Math.round(score)));
}

/**
 * Agrupa annotations por responseId. Output: Map<responseId, HumanAnnotation[]>.
 */
export function groupByResponse(annotations: HumanAnnotation[]): Map<string, HumanAnnotation[]> {
  const out = new Map<string, HumanAnnotation[]>();
  for (const ann of annotations) {
    const list = out.get(ann.responseId) ?? [];
    list.push(ann);
    out.set(ann.responseId, list);
  }
  return out;
}

/**
 * Conta anotadores únicos.
 */
function uniqueAnnotators(annotations: HumanAnnotation[]): Set<string> {
  const out = new Set<string>();
  for (const a of annotations) out.add(a.annotatorId);
  return out;
}

/**
 * % agreement exato: % de responses onde max - min == 0 (todos anotadores iguais).
 */
export function exactAgreementPct(
  grouped: Map<string, HumanAnnotation[]>,
  criterion: Criterion,
): number {
  if (grouped.size === 0) return 0;
  let exact = 0;
  for (const [, list] of grouped) {
    const scores = list.map((a) => clampScore(a[criterion]));
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    if (max - min === 0) exact += 1;
  }
  return exact / grouped.size;
}

/**
 * % agreement com tolerância ±1 ponto Likert.
 */
export function agreementWithin1Pct(
  grouped: Map<string, HumanAnnotation[]>,
  criterion: Criterion,
): number {
  if (grouped.size === 0) return 0;
  let within = 0;
  for (const [, list] of grouped) {
    const scores = list.map((a) => clampScore(a[criterion]));
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    if (max - min <= 1) within += 1;
  }
  return within / grouped.size;
}

/**
 * Disagreement (max - min) por response — array alinhado com responses únicas.
 */
export function perResponseDisagreement(
  grouped: Map<string, HumanAnnotation[]>,
  criterion: Criterion,
): number[] {
  const out: number[] = [];
  for (const [, list] of grouped) {
    const scores = list.map((a) => clampScore(a[criterion]));
    out.push(Math.max(...scores) - Math.min(...scores));
  }
  return out;
}

// -----------------------------------------------------------------------------
// Cohen's κ — 2 anotadores
// -----------------------------------------------------------------------------

/**
 * Cohen's κ ponderado (linear weights) para 2 anotadores em escala ordinal 0-10.
 *
 * Fórmula:
 *   κ_w = (Po_w - Pe_w) / (1 - Pe_w)
 *   Po_w = weighted observed agreement (soma sobre categorias i,j: w_ij * p_ij)
 *   Pe_w = weighted expected agreement by chance
 *   w_ij = 1 - |i - j| / (k - 1)  (linear penalty)
 *
 * Range: [-1, 1]. 1 = perfeito, 0 = chance, <0 = pior que chance.
 *
 * Referência: Cohen (1968). "Weighted kappa: Nominal scale agreement with provision
 * for scaled disagreement or partial credit."
 */
export function cohensKappaWeighted(
  raterA: number[],
  raterB: number[],
  categories: number = 11,
): number {
  if (raterA.length === 0 || raterA.length !== raterB.length) {
    return 0;
  }
  const n = raterA.length;
  const a = raterA.map(clampScore);
  const b = raterB.map(clampScore);

  // Frequências observadas: pObs[i][j]
  const pObs: number[][] = Array.from({ length: categories }, () =>
    Array.from({ length: categories }, () => 0),
  );
  for (let idx = 0; idx < n; idx++) {
    pObs[a[idx]][b[idx]] += 1;
  }
  for (let i = 0; i < categories; i++) {
    for (let j = 0; j < categories; j++) {
      pObs[i][j] /= n;
    }
  }

  // Frequências marginais
  const rowMarginal = new Array(categories).fill(0);
  const colMarginal = new Array(categories).fill(0);
  for (let i = 0; i < categories; i++) {
    for (let j = 0; j < categories; j++) {
      rowMarginal[i] += pObs[i][j];
      colMarginal[j] += pObs[i][j];
    }
  }

  // Po_w e Pe_w com linear weights
  let poW = 0;
  let peW = 0;
  const k = categories;
  for (let i = 0; i < k; i++) {
    for (let j = 0; j < k; j++) {
      const w = 1 - Math.abs(i - j) / (k - 1);
      poW += w * pObs[i][j];
      peW += w * rowMarginal[i] * colMarginal[j];
    }
  }

  if (peW === 1) return 1; // trivial perfect case
  const kappa = (poW - peW) / (1 - peW);
  return clampToUnit(kappa);
}

/**
 * Clamp κ em [-1, 1] — protege de floating-point edge cases.
 */
function clampToUnit(k: number): number {
  if (Number.isNaN(k)) return 0;
  return Math.max(-1, Math.min(1, k));
}

/**
 * Cohen's κ médio sobre todos os pares de anotadores (2-anotador fallback).
 */
export function averageCohensKappa(
  annotations: HumanAnnotation[],
  criterion: Criterion,
): number {
  const grouped = groupByResponse(annotations);
  const annotators = Array.from(uniqueAnnotators(annotations));

  if (annotators.length < 2) {
    return 1; // trivial: 1 anotador → κ indefinido, retornamos 1 (sem disagreement possível)
  }
  if (annotators.length > 2) {
    // Para 3+ anotadores, retornamos 0 aqui — caller deve usar Fleiss.
    // (Decisão de design: forçar uso de Fleiss para 3+.)
    return 0;
  }

  // Exatamente 2 anotadores
  const [a, b] = annotators;
  const scoresA: number[] = [];
  const scoresB: number[] = [];
  for (const [, list] of grouped) {
    const annA = list.find((x) => x.annotatorId === a);
    const annB = list.find((x) => x.annotatorId === b);
    if (annA && annB) {
      scoresA.push(clampScore(annA[criterion]));
      scoresB.push(clampScore(annB[criterion]));
    }
  }
  return cohensKappaWeighted(scoresA, scoresB);
}

// -----------------------------------------------------------------------------
// Fleiss' κ — 3+ anotadores
// -----------------------------------------------------------------------------

/**
 * Fleiss' κ para N anotadores em escala nominal k (default 11 = 0..10).
 *
 * Cada subject (response) tem N ratings categóricos. Fleiss generaliza
 * o κ de Cohen para múltiplos anotadores.
 *
 * Fórmula:
 *   κ = (P̄ - P̄e) / (1 - P̄e)
 *   P_i = (1 / (N*(N-1))) * Σ_j n_ij * (n_ij - 1)  (agreement por subject)
 *   P̄ = média de P_i sobre todos os subjects
 *   p_j = Σ_i n_ij / (N * S)  (proporção marginal da categoria j)
 *   P̄e = Σ_j p_j^2
 *
 * Para tratar Likert 0-10 como ordinal, ponderamos com linear weights:
 *   Ver fleissKappaWeighted.
 *
 * Referência: Fleiss (1971).
 */
export function fleissKappa(annotations: HumanAnnotation[], criterion: Criterion): number {
  // Versão NOMINAL (não weighted). Para Likert 0-10 com distribuição concentrada
  // (caso AUT), weighted linear penaliza demais por agreement-by-chance alto.
  // Nominal: w(i,j) = 0 para i≠j, 1 para i=j. P̄_e = Σ_j p_j² (não weighted).
  const grouped = groupByResponse(annotations);
  const subjects = Array.from(grouped.entries());
  if (subjects.length < 2) return 0;

  const annotators = Array.from(uniqueAnnotators(annotations));
  const N = annotators.length;
  if (N < 2) return 0;

  const categories = 11;
  const n: number[][] = subjects.map(([, list]) => {
    const counts = new Array(categories).fill(0);
    for (const ann of list) {
      const score = clampScore(ann[criterion]);
      counts[score] += 1;
    }
    return counts;
  });

  const valid = n.filter((row) => row.reduce((s, v) => s + v, 0) === N);
  const S = valid.length;
  if (S < 2) return 0;

  // P̄ = (1/S) Σ_i (n_i(n_i-1) / (N(N-1))) — Fleiss 1971 nominal.
  let pBar = 0;
  for (const row of valid) {
    let sumP = 0;
    for (let j = 0; j < categories; j++) sumP += row[j] * (row[j] - 1);
    pBar += sumP / (N * (N - 1));
  }
  pBar /= S;

  // p_j marginals.
  const pMarginal = new Array(categories).fill(0);
  for (const row of valid) {
    for (let j = 0; j < categories; j++) pMarginal[j] += row[j] / N;
  }
  for (let j = 0; j < categories; j++) pMarginal[j] /= S;

  // P̄e = Σ_j p_j².
  let pe = 0;
  for (let j = 0; j < categories; j++) pe += pMarginal[j] * pMarginal[j];

  if (pe === 1) return 1;
  if (pe === 0 && pBar === 0) return 1; // unanimous single category
  const kappa = (pBar - pe) / (1 - pe);
  return clampToUnit(kappa);
}

/**
 * Fleiss' κ ponderado (linear ou quadratic weights).
 *
 * Implementação segue Fleiss (1971) com extensão para weights w(i,j) por par
 * de categorias. Para Likert ordinal, linear (1 - |i-j|/(k-1)) ou
 * quadratic (1 - (i-j)^2/(k-1)^2) são os mais usados.
 *
 * Edge cases:
 *   - S < 2 (menos de 2 responses): retorna 0.
 *   - N < 2 (menos de 2 anotadores por response): retorna 0.
 *   - P̄e = 1: retorna 1 (sem variação).
 */
export function fleissKappaWeighted(
  annotations: HumanAnnotation[],
  criterion: Criterion,
  categories: number = 11,
  weightType: 'linear' | 'quadratic' = 'linear',
): number {
  const grouped = groupByResponse(annotations);
  const subjects = Array.from(grouped.entries());
  if (subjects.length < 2) return 0;

  // Agrupa anotadores únicos (assumimos que cada response pode ter subset,
  // mas para Fleiss' padrão todos devem ter os MESMOS anotadores. Filtramos
  // responses que não tenham TODOS os anotadores para robustez.)
  const annotators = Array.from(uniqueAnnotators(annotations));
  const N = annotators.length;
  if (N < 2) return 0;

  // n_ij matrix: S subjects × k categories. n_ij = # anotadores que deram categoria j ao subject i.
  const n: number[][] = subjects.map(([, list]) => {
    const counts = new Array(categories).fill(0);
    for (const ann of list) {
      const score = clampScore(ann[criterion]);
      counts[score] += 1;
    }
    return counts;
  });

  // Filtrar: só subjects com TODOS os N anotadores
  const valid = n.filter((row) => row.reduce((s, v) => s + v, 0) === N);
  const S = valid.length;
  if (S < 2) return 0;

  // p_j: proporção marginal da categoria j
  const pMarginal = new Array(categories).fill(0);
  for (const row of valid) {
    for (let j = 0; j < categories; j++) {
      pMarginal[j] += row[j] / N;
    }
  }
  for (let j = 0; j < categories; j++) {
    pMarginal[j] /= S;
  }

  // P̄_w: weighted agreement per subject (Fleiss 1971, eq. 6 + linear/quadratic weights).
  // Para Fleiss weighted, P_i = (1 / (N*(N-1))) * Σ_i≠j w_ij * n_i * n_j
  // Note: perfect agreement dentro do subject (todos = mesma categoria)
  //       significa que n_i * (n_i - 1) > 0 mas para i≠j, n_i*n_j = 0 (só 1 categoria usada).
  //       Então a contribuição de subject perfeito É 0 (não 1) no weighted.
  //       Isso está correto: weighted Fleiss PENALIZA perfect within-subject
  //       se a categoria é rara (porque Pe_w é alto). Para uma categoria
  //       muito comum (8 aparece em 50%), Pe_w é menor e κ pode subir.
  // Referência: Fleiss (1971), eq. (6) + extension to weights.
  let pBar = 0;
  for (const row of valid) {
    let sumW = 0;
    for (let i = 0; i < categories; i++) {
      for (let j = 0; j < categories; j++) {
        if (i === j) continue;
        const w = weight(i, j, categories, weightType);
        sumW += w * row[i] * row[j];
      }
    }
    const denom = N * (N - 1);
    pBar += denom === 0 ? 0 : sumW / denom;
  }
  pBar /= S;

  // P̄e_w: weighted expected agreement by chance.
  // P̄e_w = Σ_i Σ_j w_ij * p_i. * p_.j  (soma sobre todos os pares de categorias)
  // Onde p_i. = Σ_s n_si / (N*S) é a marginal row (proporção de categoria i).
  let pe = 0;
  for (let i = 0; i < categories; i++) {
    for (let j = 0; j < categories; j++) {
      if (i === j) continue;
      const w = weight(i, j, categories, weightType);
      pe += w * pMarginal[i] * pMarginal[j];
    }
  }

  // Edge case: se todas as annotations caem em UMA categoria,
  // pe = 0 (Σ_{i≠j} w_ij * p_i * p_j = 0 porque i=j sempre) e pBar = 0.
  // Nesse caso, agreement é perfeito por definição (todos = mesma categoria).
  if (pe === 0 && pBar === 0) return 1;
  if (pe === 1) return 1;
  const kappa = (pBar - pe) / (1 - pe);
  return clampToUnit(kappa);
}

function weight(i: number, j: number, k: number, type: 'linear' | 'quadratic'): number {
  if (i === j) return 1;
  if (type === 'linear') return 1 - Math.abs(i - j) / (k - 1);
  // quadratic
  const d = Math.abs(i - j) / (k - 1);
  return 1 - d * d;
}

// -----------------------------------------------------------------------------
// Matriz de confusão média (11×11)
// -----------------------------------------------------------------------------

/**
 * Constrói matriz de confusão 11×11 (categorias 0..10) agregando pares de
 * anotadores. Cada célula [i][j] = # vezes que anotador A deu i e anotador B deu j.
 *
 * Para 3+ anotadores, computamos todos os pares (n*(n-1)/2) e somamos.
 *
 * Diagonal = agreement exato.
 */
export function buildConfusionMatrix(
  annotations: HumanAnnotation[],
  criterion: Criterion,
  categories: number = 11,
): number[][] {
  const grouped = groupByResponse(annotations);
  const annotators = Array.from(uniqueAnnotators(annotations));
  const matrix: number[][] = Array.from({ length: categories }, () =>
    Array.from({ length: categories }, () => 0),
  );

  if (annotators.length < 2) return matrix;

  // Para cada response, pegar todos os pares de anotadores
  for (const [, list] of grouped) {
    const present = list
      .filter((a) => annotators.includes(a.annotatorId))
      .map((a) => clampScore(a[criterion]));
    for (let i = 0; i < present.length; i++) {
      for (let j = 0; j < present.length; j++) {
        if (i === j) continue; // pares distintos
        matrix[present[i]][present[j]] += 1;
      }
    }
  }

  return matrix;
}

// -----------------------------------------------------------------------------
// Função principal
// -----------------------------------------------------------------------------

/**
 * Calcula agreement completo sobre um conjunto de annotations humanas.
 *
 * Decisão:
 *   - 1 anotador → κ = 1 (sem disagreement possível — sanity check retornou)
 *   - 2 anotadores → Cohen's κ ponderado (linear)
 *   - 3+ anotadores → Fleiss' κ ponderado (linear)
 *
 * @param annotations lista plana de HumanAnnotation
 * @returns AgreementReport com kappas, agreement %, per-response disagreement, confusion matrix
 */
export function calculateAgreement(annotations: HumanAnnotation[]): AgreementReport {
  const grouped = groupByResponse(annotations);
  const annotators = uniqueAnnotators(annotations);
  const totalResponses = grouped.size;
  const totalAnnotators = annotators.size;
  const totalAnnotations = annotations.length;

  const kappas = {} as Record<Criterion, number>;
  const pctExact = {} as Record<Criterion, number>;
  const pctWithin1 = {} as Record<Criterion, number>;
  const disagreement = {} as Record<Criterion, number[]>;
  const confusionMatrix = Array.from({ length: 11 }, () => Array.from({ length: 11 }, () => 0));

  for (const c of FOUR_CRITERIA) {
    if (totalAnnotations === 0) {
      kappas[c] = 0;
    } else if (totalAnnotators <= 1) {
      kappas[c] = 1;
    } else if (totalAnnotators === 2) {
      kappas[c] = averageCohensKappa(annotations, c);
    } else {
      kappas[c] = fleissKappa(annotations, c);
    }
    pctExact[c] = exactAgreementPct(grouped, c);
    pctWithin1[c] = agreementWithin1Pct(grouped, c);
    disagreement[c] = perResponseDisagreement(grouped, c);

    // Confusion matrix: média entre critérios (cada critério contribui 1/4)
    const m = buildConfusionMatrix(annotations, c);
    for (let i = 0; i < 11; i++) {
      for (let j = 0; j < 11; j++) {
        confusionMatrix[i][j] += m[i][j] / 4;
      }
    }
  }

  const meanKappa = FOUR_CRITERIA.reduce((s, c) => s + kappas[c], 0) / FOUR_CRITERIA.length;
  const convergenceTestPassed = meanKappa >= 0.6;

  return {
    totalResponses,
    totalAnnotators,
    totalAnnotations,
    kappas,
    meanKappa,
    pctExactAgreement: pctExact,
    pctAgreementWithin1: pctWithin1,
    perResponseDisagreement: disagreement,
    convergenceTestPassed,
    confusionMatrix,
  };
}

// -----------------------------------------------------------------------------
// Helpers de serialização (relatório HTML)
// -----------------------------------------------------------------------------

/**
 * Renderiza report como HTML table simples (sem dependências externas).
 * Útil para o CLI `pnpm run benchmarks:agreement`.
 */
export function renderAgreementReportHtml(report: AgreementReport): string {
  const rows: string[] = [];
  rows.push('<!DOCTYPE html>');
  rows.push('<html lang="pt-BR">');
  rows.push('<head>');
  rows.push('<meta charset="utf-8">');
  rows.push('<title>AUT Inter-Annotator Agreement — Wave 32</title>');
  rows.push('<style>');
  rows.push('body{font-family:system-ui,sans-serif;max-width:1100px;margin:24px auto;padding:0 16px;color:#1a1a1a}');
  rows.push('h1{font-size:1.5rem}');
  rows.push('table{border-collapse:collapse;margin:12px 0;font-size:0.9rem}');
  rows.push('th,td{border:1px solid #ddd;padding:6px 10px;text-align:right}');
  rows.push('th{background:#f4f4f4;text-align:left}');
  rows.push('.pass{color:#1a7a1a;font-weight:600}');
  rows.push('.fail{color:#a02020;font-weight:600}');
  rows.push('.muted{color:#666;font-size:0.85rem}');
  rows.push('</style>');
  rows.push('</head>');
  rows.push('<body>');
  rows.push('<h1>AUT Inter-Annotator Agreement — Wave 32</h1>');
  rows.push(`<p class="muted">Gerado via <code>pnpm run benchmarks:agreement</code> · ${new Date().toISOString()}</p>`);
  rows.push(`<p><strong>${report.totalResponses}</strong> responses únicas · <strong>${report.totalAnnotators}</strong> anotadores · <strong>${report.totalAnnotations}</strong> annotations totais</p>`);

  // Tabela κ por critério
  rows.push('<h2>κ por critério (Cohen 2 / Fleiss 3+)</h2>');
  rows.push('<table><thead><tr><th>Critério</th><th>κ</th><th>Exact %</th><th>±1 %</th></tr></thead><tbody>');
  for (const c of FOUR_CRITERIA) {
    const kappaClass = report.kappas[c] >= 0.6 ? 'pass' : 'fail';
    rows.push(
      `<tr><th style="text-align:left">${CRITERION_LABELS_PT[c]}</th>` +
        `<td class="${kappaClass}">${report.kappas[c].toFixed(3)}</td>` +
        `<td>${(report.pctExactAgreement[c] * 100).toFixed(1)}%</td>` +
        `<td>${(report.pctAgreementWithin1[c] * 100).toFixed(1)}%</td></tr>`,
    );
  }
  rows.push('</tbody></table>');

  const meanClass = report.convergenceTestPassed ? 'pass' : 'fail';
  rows.push(
    `<p><strong>Mean κ:</strong> <span class="${meanClass}">${report.meanKappa.toFixed(3)}</span> · ` +
      `<strong>Convergence test (≥0.6):</strong> ` +
      `<span class="${meanClass}">${report.convergenceTestPassed ? 'PASSED ✓' : 'FAILED ✗'}</span></p>`,
  );

  // Per-response disagreement summary
  rows.push('<h2>Disagreement por response (max - min)</h2>');
  rows.push('<table><thead><tr><th>Critério</th><th>Min</th><th>Median</th><th>Mean</th><th>Max</th><th>σ</th></tr></thead><tbody>');
  for (const c of FOUR_CRITERIA) {
    const arr = report.perResponseDisagreement[c].slice().sort((x, y) => x - y);
    if (arr.length === 0) {
      rows.push(`<tr><th style="text-align:left">${CRITERION_LABELS_PT[c]}</th><td colspan="5">no data</td></tr>`);
      continue;
    }
    const min = arr[0];
    const max = arr[arr.length - 1];
    const median = arr[Math.floor(arr.length / 2)];
    const mean = arr.reduce((s, v) => s + v, 0) / arr.length;
    const variance = arr.reduce((s, v) => s + (v - mean) ** 2, 0) / arr.length;
    const sigma = Math.sqrt(variance);
    rows.push(
      `<tr><th style="text-align:left">${CRITERION_LABELS_PT[c]}</th>` +
        `<td>${min}</td><td>${median}</td><td>${mean.toFixed(2)}</td><td>${max}</td><td>${sigma.toFixed(2)}</td></tr>`,
    );
  }
  rows.push('</tbody></table>');

  // Confusion matrix (top-left 11x11 — full grid)
  rows.push('<h2>Matriz de confusão agregada (11×11)</h2>');
  rows.push('<table><thead><tr><th></th>');
  for (let j = 0; j < 11; j++) rows.push(`<th>${j}</th>`);
  rows.push('</tr></thead><tbody>');
  for (let i = 0; i < 11; i++) {
    rows.push(`<tr><th>${i}</th>`);
    for (let j = 0; j < 11; j++) {
      const v = report.confusionMatrix[i][j];
      const opacity = v === 0 ? '' : ` style="background:rgba(20,100,200,${Math.min(0.6, v / 20)})"`;
      rows.push(`<td${opacity}>${v.toFixed(0)}</td>`);
    }
    rows.push('</tr>');
  }
  rows.push('</tbody></table>');

  rows.push('<p class="muted">Wave 32.3 · @akasha/benchmarks · Pesos AUT: UC=0.25, VR=0.20, PA=0.30, CV=0.25</p>');
  rows.push('</body></html>');
  return rows.join('\n');
}
