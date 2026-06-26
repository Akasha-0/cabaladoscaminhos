/**
 * Wave 31.5 — Long-term Memory Distillation (heuristic).
 *
 * Heurística determinística para agrupar memórias antigas (>30 dias)
 * em "insights consolidados", sem LLM real. Critérios de design:
 *
 * 1. Determinística: mesma entrada → mesma saída. Sem aleatoriedade,
 *    sem embeddings, sem rede neural. Permite testar com fixtures.
 * 2. Auditável: a `theme` do cluster é HUMAN-LEGÍVEL (top-2 keywords +
 *    pilar dominante). Não é um hash opaco.
 * 3. Idempotente em (userId, workspaceId, anchorMonth): rodando N vezes
 *    no mesmo mês, o conjunto de clusters é o mesmo (apenas sobrescreve).
 * 4. Substituível: a interface `distillClusters()` é estável. Uma wave
 *    futura pode trocar `distillHeuristic()` por `distillLLM()` sem
 *    mudar o consolidator.ts nem o storage.
 *
 * Limitações CONHECIDAS (declaradas honestamente):
 *   - "Tema" = top keywords por frequência TF, não semântica.
 *   - Sem desambiguação semântica ("Vida" como Cabala vs Tantra).
 *   - Sem ranking cross-cluster (clusters são ordenados por tamanho, não
 *     por "importância" psicológica).
 *   - Sem eviction/aging dentro do mês — tudo no anchorMonth vira insight.
 *   - Para o MVP, este é o ÚNICO caminho de destilação. Wave futura
 *     adiciona embeddings + UMAP + HDBSCAN (ver wave-30.7 §6).
 */

import type {
  ConsolidationSource,
  DistilledCluster,
  Pilar,
  PilarCounts,
} from './types.js';

// ─────────────────────────────────────────────────────────────────────
// Stopwords / normalização
// ─────────────────────────────────────────────────────────────────────

/**
 * Stopwords pt-BR mínimas (sem dependência de lib NLP). Foco: palavras
 * funcionais que NÃO carregam tema. Mantemos a lista CURTA (15 itens) —
 * mais do que isso prejudica clusters pequenos.
 */
const STOPWORDS_PT_BR: ReadonlySet<string> = new Set([
  'o',
  'a',
  'os',
  'as',
  'de',
  'do',
  'da',
  'em',
  'no',
  'na',
  'para',
  'com',
  'e',
  'ou',
  'que',
  'é',
  'um',
  'uma',
]);

/** Pilares canônicos do Akasha. */
export const KNOWN_PILARES: ReadonlyArray<Pilar> = [
  'cabala',
  'astrologia',
  'tantrica',
  'odus',
  'iching',
] as const;

/** Mapeia keywords livres → pilar canônico (heurística). */
const KEYWORD_TO_PILAR: ReadonlyMap<string, Pilar> = new Map([
  // Cabala — sefirot, Árvore da Vida, números
  ['cabala', 'cabala'],
  ['kabbalah', 'cabala'],
  ['keter', 'cabala'],
  ['chokhmah', 'cabala'],
  ['binah', 'cabala'],
  ['daat', 'cabala'],
  ['sefira', 'cabala'],
  ['sefirot', 'cabala'],
  ['tree', 'cabala'],
  ['life', 'cabala'],
  ['path', 'cabala'],
  // Astrologia — signos, planetas, casas
  ['astrologia', 'astrologia'],
  ['astrology', 'astrologia'],
  ['sol', 'astrologia'],
  ['lua', 'astrologia'],
  ['venus', 'astrologia'],
  ['marte', 'astrologia'],
  ['mercurio', 'astrologia'],
  ['jupiter', 'astrologia'],
  ['saturno', 'astrologia'],
  ['aries', 'astrologia'],
  ['touro', 'astrologia'],
  ['gemeos', 'astrologia'],
  ['cancer', 'astrologia'],
  ['leao', 'astrologia'],
  ['virgem', 'astrologia'],
  ['libra', 'astrologia'],
  ['escorpiao', 'astrologia'],
  ['sagitario', 'astrologia'],
  ['capricornio', 'astrologia'],
  ['aquario', 'astrologia'],
  ['peixes', 'astrologia'],
  // Tantra — chakras, kundalini, corpos sutis
  ['tantra', 'tantrica'],
  ['tantrica', 'tantrica'],
  ['chakra', 'tantrica'],
  ['kundalini', 'tantrica'],
  ['muladhara', 'tantrica'],
  ['svadhisthana', 'tantrica'],
  ['manipura', 'tantrica'],
  ['anahata', 'tantrica'],
  ['vishuddha', 'tantrica'],
  ['ajna', 'tantrica'],
  ['sahasrara', 'tantrica'],
  // Odus — Ifá, orixás, caminhos
  ['odu', 'odus'],
  ['odus', 'odus'],
  ['ifa', 'odus'],
  ['orixa', 'odus'],
  ['orixas', 'odus'],
  ['ogum', 'odus'],
  ['oxala', 'odus'],
  ['oxum', 'odus'],
  ['iansa', 'odus'],
  ['xango', 'odus'],
  // I Ching — hexagramas, trigramas, mutação
  ['iching', 'iching'],
  ['i-ching', 'iching'],
  ['hexagrama', 'iching'],
  ['trigrama', 'iching'],
  ['qian', 'iching'],
  ['kun', 'iching'],
]);

/**
 * Tokeniza + normaliza um texto para análise de frequência.
 * - lowercase + remoção de acentos via NFD (compat Node 20+).
 * - split em não-alfa.
 * - remove stopwords + tokens de 1 caractere.
 */
export function tokenize(text: string): string[] {
  if (!text) return [];
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
  const raw = normalized.split(/[^a-z0-9]+/u).filter(Boolean);
  const filtered: string[] = [];
  for (const t of raw) {
    if (t.length < 2) continue;
    if (STOPWORDS_PT_BR.has(t)) continue;
    filtered.push(t);
  }
  return filtered;
}

/**
 * Conta frequência de tokens. Retorna Map ordenado por frequência desc.
 * (Bônus por pilar canônico é calculado à parte em `computePilarCounts` —
 * aqui mantemos só TF puro para auditabilidade.)
 */
export function computeKeywordFrequencies(
  texts: ReadonlyArray<string>
): Map<string, number> {
  const freq = new Map<string, number>();
  for (const text of texts) {
    for (const token of tokenize(text)) {
      freq.set(token, (freq.get(token) ?? 0) + 1);
    }
  }
  return freq;
}

/**
 * Conta frequência de Pilares canônicos nas memórias.
 * Estratégia: para cada source, conta matches de KEYWORD_TO_PILAR
 * no title+content; soma por pilar. Memória que menciona 3 pilares
 * diferentes contribui 1 para cada.
 */
export function computePilarCounts(
  sources: ReadonlyArray<ConsolidationSource>
): PilarCounts {
  const counts: PilarCounts = {
    cabala: 0,
    astrologia: 0,
    tantrica: 0,
    odus: 0,
    iching: 0,
  };
  for (const src of sources) {
    const text = `${src.title} ${src.content ?? ''}`;
    const tokens = new Set(tokenize(text));
    const matchedPilares = new Set<Pilar>();
    for (const tok of tokens) {
      const pilar = KEYWORD_TO_PILAR.get(tok);
      if (pilar) matchedPilares.add(pilar);
    }
    for (const p of matchedPilares) {
      counts[p] += 1;
    }
  }
  return counts;
}

/**
 * Pilar dominante (maior contagem). Em empate, ordem canônica em
 * KNOWN_PILARES (Cabala primeiro — senciência clássica do projeto).
 */
export function dominantPilar(counts: PilarCounts): Pilar | null {
  let best: Pilar | null = null;
  let bestCount = 0;
  for (const p of KNOWN_PILARES) {
    const c = counts[p];
    if (c > bestCount) {
      bestCount = c;
      best = p;
    }
  }
  return bestCount > 0 ? best : null;
}

/**
 * Top-N keywords por frequência. Exclui palavras de 1 char (já feito
 * em tokenize) e keywords que são EXATAMENTE nomes próprios curtos.
 * Para o MVP, NÃO fazemos stemming (mantém auditabilidade).
 */
export function topKeywords(
  freq: ReadonlyMap<string, number>,
  n: number
): string[] {
  const sorted = [...freq.entries()]
    .filter(([k, v]) => v >= 2) // mínimo 2 ocorrências para ser "tema"
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      // tiebreak: alfabético (determinístico)
      return a[0].localeCompare(b[0]);
    })
    .slice(0, n)
    .map(([k]) => k);
  return sorted;
}

// ─────────────────────────────────────────────────────────────────────
// Clustering (heurístico, sem embeddings)
// ─────────────────────────────────────────────────────────────────────

/**
 * Agrupa sources em clusters por (pilar dominante + top-1 keyword compartilhada).
 *
 * Heurística MVP (NÃO semântica, mas auditável):
 *  1. Calcula PilarCounts por source.
 *  2. Agrupa sources por (pilar dominante da source).
 *  3. Dentro de cada grupo de Pilar, agrupa por top-1 keyword da source,
 *     exigindo freq do keyword entre sources >= minClusterSize.
 *  4. Se source não tem pilar dominante, vai para bucket "_misc".
 *  5. Cluster com < MIN_CLUSTER_SIZE members é descartado (ruído).
 *
 * Limitação conhecida: dois sources sobre o mesmo tema mas SEM nenhuma
 * keyword em comum como top-1 podem cair em clusters diferentes. Aceitável
 * para o MVP — é uma aproximação, não um classificador Bayesiano.
 */
export interface ClusterInput {
  minClusterSize?: number; // default 3
  maxClusters?: number;    // default 5 (top-N para exibir)
}

export const DEFAULT_MIN_CLUSTER_SIZE = 3;
export const DEFAULT_MAX_CLUSTERS = 5;

export function distillClusters(
  sources: ReadonlyArray<ConsolidationSource>,
  opts: ClusterInput = {}
): DistilledCluster[] {
  const minSize = opts.minClusterSize ?? DEFAULT_MIN_CLUSTER_SIZE;
  const maxClusters = opts.maxClusters ?? DEFAULT_MAX_CLUSTERS;

  if (sources.length === 0) return [];

  // Bucket por pilar dominante da source
  const byPilar = new Map<Pilar | '_misc', ConsolidationSource[]>();
  for (const src of sources) {
    const counts = computePilarCounts([src]);
    const dom = dominantPilar(counts);
    const bucket: Pilar | '_misc' = dom ?? '_misc';
    const arr = byPilar.get(bucket) ?? [];
    arr.push(src);
    byPilar.set(bucket, arr);
  }

  // Para cada Pilar, agrupa por top-2 keywords intersect
  const clusters: DistilledCluster[] = [];
  for (const [pilar, members] of byPilar.entries()) {
    if (members.length < minSize) continue; // pula Pilar com poucos members
    const subClusters = clusterByKeywords(members, minSize);
    for (const sub of subClusters) {
      const allSources = sub.members;
      const pilarCounts = computePilarCounts(allSources);
      const theme = buildTheme(pilar, sub.keywords);
      const content = synthesizeContent(allSources, sub.keywords, pilar);
      const confidence = computeConfidence(allSources, pilarCounts);
      clusters.push({
        theme,
        content,
        sources: allSources,
        pilarCounts,
        confidence,
      });
    }
  }

  // Ordena por: tamanho (members) desc, depois confidence desc.
  // Limita a maxClusters (top-N para o endpoint).
  clusters.sort((a, b) => {
    if (b.sources.length !== a.sources.length) {
      return b.sources.length - a.sources.length;
    }
    return b.confidence - a.confidence;
  });
  return clusters.slice(0, maxClusters);
}

// ─────────────────────────────────────────────────────────────────────
// Internals
// ─────────────────────────────────────────────────────────────────────

interface SubCluster {
  keywords: string[]; // top-2 keywords do cluster
  members: ConsolidationSource[];
}

/**
 * Sub-cluster dentro de um Pilar: agrupa pela top-1 keyword de cada
 * source que também seja compartilhada com >= minSize outras sources.
 *
 * Estratégia (mais simples e auditável que interseção de top-2):
 *  1. Pega o top-1 keyword de cada source (já tokenizada, freq >= 1).
 *  2. Conta frequência de cada top-1 keyword entre as sources.
 *  3. Para cada top-1 keyword com freq >= minSize, forma um cluster.
 *  4. Cada source entra no cluster da sua top-1 keyword (greedy: 1ª keyword
 *     que já tem cluster formado; não-duplica entre clusters).
 *  5. Sources sem cluster próprio vão para um cluster "_misc" se forem
 *     >= minSize.
 */
function clusterByKeywords(
  sources: ReadonlyArray<ConsolidationSource>,
  minSize: number
): SubCluster[] {
  // top-1 keyword por source
  const sourceTop1 = new Map<ConsolidationSource, string>();
  for (const src of sources) {
    const text = `${src.title} ${src.content ?? ''}`;
    const freq = computeKeywordFrequencies([text]);
    // Pega top-1 com freq >= 1 (todas passam aqui, incluindo Pilar keywords)
    const entries = [...freq.entries()].sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    });
    if (entries.length > 0 && entries[0] != null) {
      sourceTop1.set(src, entries[0][0]);
    }
  }

  // Conta quantas sources têm cada top-1 keyword
  const kwCount = new Map<string, number>();
  for (const kw of sourceTop1.values()) {
    kwCount.set(kw, (kwCount.get(kw) ?? 0) + 1);
  }

  // Keywords com >= minSize sources formam cluster
  const clusterKeywords = [...kwCount.entries()]
    .filter(([, v]) => v >= minSize)
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    });

  const used = new Set<ConsolidationSource>();
  const subClusters: SubCluster[] = [];

  for (const [kw, _count] of clusterKeywords) {
    const members = sources.filter((s) => {
      if (used.has(s)) return false;
      return sourceTop1.get(s) === kw;
    });
    if (members.length >= minSize) {
      for (const m of members) used.add(m);
      // Pega top-2 keywords (cross-source) para o theme do cluster.
      const crossFreq = computeKeywordFrequencies(
        members.map((s) => `${s.title} ${s.content ?? ''}`)
      );
      const topForTheme = topKeywords(crossFreq, 2);
      // Garante que a `kw` esteja na primeira posição do theme
      const themeKeywords = [kw, ...topForTheme.filter((k) => k !== kw)].slice(0, 2);
      subClusters.push({ keywords: themeKeywords, members });
    }
  }

  return subClusters;
}

function buildTheme(
  pilar: Pilar | '_misc',
  keywords: ReadonlyArray<string>
): string {
  const pillarLabel =
    pilar === '_misc'
      ? 'geral'
      : pilar === 'cabala'
        ? 'Cabala'
        : pilar === 'astrologia'
          ? 'Astrologia'
          : pilar === 'tantrica'
            ? 'Tantrica'
            : pilar === 'odus'
              ? 'Odus'
              : 'I-Ching';
  const kws = keywords.filter(Boolean).join('+');
  if (!kws) return pillarLabel;
  return `${pillarLabel} · ${kws}`;
}

/**
 * Síntese template-based (~1-2 frases). NÃO usa LLM. O template é
 * fixo para garantir auditabilidade — clientes sabem EXATAMENTE como
 * cada insight foi gerado.
 */
function synthesizeContent(
  sources: ReadonlyArray<ConsolidationSource>,
  keywords: ReadonlyArray<string>,
  pilar: Pilar | '_misc'
): string {
  const count = sources.length;
  const kws = keywords.filter(Boolean).join(', ');
  const headSamples = sources
    .slice(0, 2)
    .map((s) => s.title)
    .filter(Boolean);
  const sampleClause =
    headSamples.length > 0
      ? ` — incluindo "${headSamples.join('" e "')}"`
      : '';

  if (pilar === '_misc') {
    return `Agrupamento de ${count} memórias${kws ? ` em torno de ${kws}` : ''}${sampleClause}.`;
  }
  return `O pilar ${pilar} apareceu em ${count} memórias${kws ? `, com destaque para ${kws}` : ''}${sampleClause}.`;
}

/**
 * Confidence heurística (0..1):
 *   - 50% = PilarCounts densidade (algum pilar bem representado?)
 *   - 30% = tamanho do cluster (mais memórias → mais confiança)
 *   - 20% = interseção de keywords (cluster "focado" = mais confiança)
 */
function computeConfidence(
  sources: ReadonlyArray<ConsolidationSource>,
  pilarCounts: PilarCounts
): number {
  if (sources.length === 0) return 0;
  const totalPilarMentions =
    pilarCounts.cabala +
    pilarCounts.astrologia +
    pilarCounts.tantrica +
    pilarCounts.odus +
    pilarCounts.iching;
  const pilarDensity =
    totalPilarMentions === 0
      ? 0
      : Math.min(1, Math.max(...Object.values(pilarCounts)) / sources.length);

  const sizeScore = Math.min(1, sources.length / 10); // satura em 10 memórias

  // keyword overlap: quantas sources compartilham pelo menos 1 keyword
  // canônica com outra source do mesmo cluster.
  const tokenSets = sources.map((s) =>
    new Set(tokenize(`${s.title} ${s.content ?? ''}`))
  );
  let overlapPairs = 0;
  let totalPairs = 0;
  for (let i = 0; i < tokenSets.length; i++) {
    for (let j = i + 1; j < tokenSets.length; j++) {
      totalPairs++;
      const a = tokenSets[i];
      const b = tokenSets[j];
      if (!a || !b) continue;
      for (const t of a) {
        if (b.has(t)) {
          overlapPairs++;
          break;
        }
      }
    }
  }
  const overlapScore = totalPairs === 0 ? 0 : overlapPairs / totalPairs;

  const raw = 0.5 * pilarDensity + 0.3 * sizeScore + 0.2 * overlapScore;
  // Clamp 0..1 + 2 casas decimais
  return Math.round(Math.max(0, Math.min(1, raw)) * 100) / 100;
}
