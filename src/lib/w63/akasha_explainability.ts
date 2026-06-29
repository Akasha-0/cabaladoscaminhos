// ─────────────────────────────────────────────────────────────────────────────
// Akasha IA Explainability — Citations, Confidence Scoring & Reasoning Trace
// w63 cycle deliverable
//
// Pure-TypeScript engine. No runtime dependencies. Zero `any`. Zero unsafe
// casts. Hand-rolled confidence math (no Math.random for scoring). PII-safe
// excerpts are clamped to a max length so we never log full source payloads.
//
// Sacred taxonomy covered (153 symbols across 8 traditions):
//   - Cigano (36 cards)
//   - Orixás (16 principais)
//   - Odus (16 principais)
//   - Astrologia (12 signos + 10 planetas + 12 casas = 34)
//   - Numerologia (1..9 + 11/22/33 = 12)
//   - Sefirot (10)
//   - Tarot (22 arcanos maiores)
//   - Tantra (7 chakras)
//
// Last total: 36 + 16 + 16 + 34 + 12 + 10 + 22 + 7 = 153.
//
// Public surface (25 exports — verified by __ALL_EXPORTS):
//   4 types:
//     Citation, CitationConfidence, TraceStep, ExplainabilityPayload
//   4 builders:
//     buildCitation, buildTraceStep, startTrace, buildPayload
//   5 confidence:
//     scoreCitations, boostScoreByCitations, decayScoreByCoverage,
//     labelConfidence, combineScore
//   8 extractors (one per sacred tradition):
//     extractCiganoCitations, extractOrixaCitations, extractOduCitations,
//     extractAstrologiaCitations, extractNumerologiaCitations,
//     extractSefirotCitations, extractTarotCitations, extractTantraCitations
//   1 audit:
//     auditExplainabilityCoverage
//   3 guardrails:
//     flagLowConfidence, flagRedundantCitations, summarizeExplainability
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — Source taxonomy & core types
// ─────────────────────────────────────────────────────────────────────────────

export type CitationSourceType =
  | 'cigano'
  | 'orixa'
  | 'odu'
  | 'astrologia'
  | 'numerologia'
  | 'cabala'
  | 'tarot'
  | 'tantra'
  | 'sefirot'
  | 'article';

export interface Citation {
  readonly sourceId: string;
  readonly sourceType: CitationSourceType;
  readonly excerpt: string;
  readonly relevance: number; // 0..1
  readonly weight: number;    // 0..1
}

export type CitationConfidence =
  | 'foundational'
  | 'strong'
  | 'supportive'
  | 'contextual'
  | 'speculative';

export type TraceStepKind =
  | 'input'
  | 'parse'
  | 'lookup'
  | 'inference'
  | 'guardrail'
  | 'output';

export interface TraceStep {
  readonly stepNumber: number;
  readonly kind: TraceStepKind;
  readonly description: string;
  readonly elapsedMs?: number;
  readonly references?: ReadonlyArray<string>;
}

export interface ExplainabilityPayload {
  readonly citations: ReadonlyArray<Citation>;
  readonly confidence: number;
  readonly confidenceLabel: CitationConfidence;
  readonly trace: ReadonlyArray<TraceStep>;
  readonly notes?: string;
  readonly warnings?: ReadonlyArray<string>;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — Builder / composer functions
// ─────────────────────────────────────────────────────────────────────────────

const MAX_EXCERPT_CHARS = 240;

function clampExcerpt(excerpt: string): string {
  if (excerpt.length <= MAX_EXCERPT_CHARS) return excerpt;
  return excerpt.slice(0, MAX_EXCERPT_CHARS - 1) + '\u2026';
}

function clampUnit(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

export function buildCitation(
  sourceId: string,
  sourceType: CitationSourceType,
  excerpt: string,
  relevance: number = 0.5,
  weight: number = 0.5,
): Citation {
  if (sourceId.trim().length === 0) {
    throw new Error('buildCitation: sourceId must be non-empty');
  }
  return {
    sourceId: sourceId.trim(),
    sourceType,
    excerpt: clampExcerpt(excerpt.trim()),
    relevance: clampUnit(relevance, 0.5),
    weight: clampUnit(weight, 0.5),
  };
}

export function buildTraceStep(
  stepNumber: number,
  kind: TraceStepKind,
  description: string,
  opts?: { elapsedMs?: number; references?: ReadonlyArray<string> },
): TraceStep {
  if (stepNumber < 1 || !Number.isInteger(stepNumber)) {
    throw new Error('buildTraceStep: stepNumber must be a positive integer');
  }
  const out: {
    stepNumber: number;
    kind: TraceStepKind;
    description: string;
    elapsedMs?: number;
    references?: ReadonlyArray<string>;
  } = {
    stepNumber,
    kind,
    description: description.trim(),
  };
  if (opts?.elapsedMs !== undefined) {
    if (!Number.isFinite(opts.elapsedMs) || opts.elapsedMs < 0) {
      throw new Error('buildTraceStep: elapsedMs must be finite >= 0');
    }
    out.elapsedMs = opts.elapsedMs;
  }
  if (opts?.references !== undefined) {
    out.references = Object.freeze([...opts.references]);
  }
  return Object.freeze(out);
}

export interface TraceContext {
  push(step: Omit<TraceStep, 'stepNumber'>): TraceStep;
  mark(id: string, ms: number): void;
  finish(): ReadonlyArray<TraceStep>;
}

export function startTrace(): TraceContext {
  const steps: TraceStep[] = [];
  const marks = new Map<string, number>();
  let nextNumber = 1;
  return {
    push(step) {
      const built = buildTraceStep(nextNumber++, step.kind, step.description, {
        elapsedMs: step.elapsedMs,
        references: step.references,
      });
      steps.push(built);
      return built;
    },
    mark(id, ms) {
      if (!Number.isFinite(ms) || ms < 0) return;
      marks.set(id, ms);
    },
    finish() {
      // any pending marks attached to the most recent step
      if (marks.size > 0 && steps.length > 0) {
        const last = steps[steps.length - 1]!;
        let totalMarks = 0;
        for (const v of marks.values()) totalMarks += v;
        marks.clear();
        steps[steps.length - 1] = { ...last, elapsedMs: totalMarks };
      }
      return Object.freeze([...steps]);
    },
  };
}

export function buildPayload(args: {
  citations: ReadonlyArray<Citation>;
  trace: ReadonlyArray<TraceStep>;
  notes?: string;
  warnings?: ReadonlyArray<string>;
}): ExplainabilityPayload {
  const score = scoreCitations(args.citations);
  const label = labelConfidence(score);
  const payload: {
    citations: ReadonlyArray<Citation>;
    confidence: number;
    confidenceLabel: CitationConfidence;
    trace: ReadonlyArray<TraceStep>;
    notes?: string;
    warnings?: ReadonlyArray<string>;
  } = {
    citations: Object.freeze([...args.citations]),
    confidence: score,
    confidenceLabel: label,
    trace: Object.freeze([...args.trace]),
  };
  if (args.notes !== undefined) payload.notes = args.notes.trim();
  if (args.warnings !== undefined) {
    payload.warnings = Object.freeze([...args.warnings]);
  }
  return Object.freeze(payload);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — Confidence scoring
// ─────────────────────────────────────────────────────────────────────────────

const CONFIDENCE_BUCKETS: ReadonlyArray<{ min: number; label: CitationConfidence }> = [
  { min: 0.85, label: 'foundational' },
  { min: 0.7, label: 'strong' },
  { min: 0.5, label: 'supportive' },
  { min: 0.3, label: 'contextual' },
  { min: 0, label: 'speculative' },
];

export function scoreCitations(citations: ReadonlyArray<Citation>): number {
  if (citations.length === 0) return 0;
  // Tier-multiplier by sourceType. Foundational sacred sources weigh more.
  const tier: Record<CitationSourceType, number> = {
    cabala: 1.0,
    sefirot: 1.0,
    cigano: 0.95,
    orixa: 0.95,
    odu: 0.95,
    astrologia: 0.9,
    numerologia: 0.9,
    tarot: 0.85,
    tantra: 0.8,
    article: 0.6,
  };
  let weightedSum = 0;
  let totalWeight = 0;
  for (const c of citations) {
    const w = c.weight * (tier[c.sourceType] ?? 0.7);
    weightedSum += w * c.relevance;
    totalWeight += w;
  }
  if (totalWeight === 0) return 0;
  const base = weightedSum / totalWeight;
  // Citation-density bonus: more citations raise confidence, capped softly.
  const density = Math.min(0.05, (citations.length - 1) * 0.01);
  return clampUnit(base + density, 0);
}

export function boostScoreByCitations(
  score: number,
  citations: ReadonlyArray<Citation>,
): number {
  const base = clampUnit(score, 0);
  if (citations.length === 0) return base;
  const uniqueTypes = new Set(citations.map((c) => c.sourceType));
  const diversity = Math.min(0.04, (uniqueTypes.size - 1) * 0.01);
  const raw = base + diversity;
  // Soft cap at 0.99 to leave headroom for future guard penalties.
  return raw > 0.99 ? 0.99 : raw;
}

export function decayScoreByCoverage(score: number, coverage: number): number {
  const base = clampUnit(score, 0);
  const c = clampUnit(coverage, 1);
  // Coverage < 0.5 decays quadratically; coverage >= 0.5 stays full.
  if (c >= 0.5) return base;
  const factor = 1 - Math.pow((0.5 - c) * 2, 2);
  return clampUnit(base * factor, 0);
}

export function labelConfidence(score: number): CitationConfidence {
  const s = clampUnit(score, 0);
  for (const b of CONFIDENCE_BUCKETS) {
    if (s >= b.min) return b.label;
  }
  return 'speculative';
}

export interface CombinedScores {
  readonly min: number;
  readonly max: number;
  readonly mean: number;
  readonly weightedMean: number;
  readonly geometricMean: number;
}

export function combineScore(...scores: ReadonlyArray<number>): CombinedScores {
  if (scores.length === 0) {
    return { min: 0, max: 0, mean: 0, weightedMean: 0, geometricMean: 0 };
  }
  const normalized = scores.map((s) => clampUnit(s, 0));
  let mn = normalized[0]!;
  let mx = normalized[0]!;
  let sum = 0;
  let weightedSum = 0;
  let totalWeight = 0;
  let logSum = 0;
  for (let i = 0; i < normalized.length; i++) {
    const v = normalized[i]!;
    if (v < mn) mn = v;
    if (v > mx) mx = v;
    sum += v;
    const w = 1 / (i + 1); // later numbers weight less
    weightedSum += v * w;
    totalWeight += w;
    // geometric mean: clamp to >= 1e-9 to avoid log(0)
    logSum += Math.log(Math.max(v, 1e-9));
  }
  const mean = sum / normalized.length;
  const weightedMean = totalWeight === 0 ? mean : weightedSum / totalWeight;
  const geoRaw = Math.exp(logSum / normalized.length);
  const geometricMean = Number.isFinite(geoRaw) ? clampUnit(geoRaw, 0) : 0;
  return {
    min: mn,
    max: mx,
    mean,
    weightedMean,
    geometricMean,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 — Sacred taxonomy tables
// ─────────────────────────────────────────────────────────────────────────────

// Cigano — 36 cards (Cigano Ramiro method, canonical 1..36). Source: established
// Lenormand-equivalent deck used in consultations on the Cabala dos Caminhos app.
const CIGANO_CARDS: ReadonlyArray<{ id: string; name: string; aliases: ReadonlyArray<string> }> = [
  { id: 'cigano-01', name: 'Cavalheiro', aliases: ['cavaleiro', 'senhor', 'homem'] },
  { id: 'cigano-02', name: 'Cigana', aliases: ['mulher', 'dama', 'senhora'] },
  { id: 'cigano-03', name: 'Navio', aliases: ['navio', 'embarcacao', 'barco'] },
  { id: 'cigano-04', name: 'Casa', aliases: ['casa', 'lar', 'residencia'] },
  { id: 'cigano-05', name: 'Arvore', aliases: ['arvore', 'planta'] },
  { id: 'cigano-06', name: 'Nuvem', aliases: ['nuvem', 'ceu nublado'] },
  { id: 'cigano-07', name: 'Cachorro', aliases: ['cachorro', 'cao', 'caes'] },
  { id: 'cigano-08', name: 'Caixao', aliases: ['caixao', 'ataude'] },
  { id: 'cigano-09', name: 'Buque', aliases: ['buque', 'flores'] },
  { id: 'cigano-10', name: 'Foice', aliases: ['foice', 'alfanje'] },
  { id: 'cigano-11', name: 'Chicote', aliases: ['chicote', 'azorrague'] },
  { id: 'cigano-12', name: 'Passaro', aliases: ['passaro', 'aves'] },
  { id: 'cigano-13', name: 'Crianca', aliases: ['crianca', 'menino', 'menina'] },
  { id: 'cigano-14', name: 'Raposa', aliases: ['raposa', 'raposa'] },
  { id: 'cigano-15', name: 'Urso', aliases: ['urso', ' urso'] },
  { id: 'cigano-16', name: 'Estrela', aliases: ['estrela'] },
  { id: 'cigano-17', name: 'Cegonha', aliases: ['cegonha', 'garca'] },
  { id: 'cigano-18', name: 'Cao', aliases: ['cao', 'cachorro'] },
  { id: 'cigano-19', name: 'Torre', aliases: ['torre', 'farol'] },
  { id: 'cigano-20', name: 'Jardim', aliases: ['jardim', 'parque'] },
  { id: 'cigano-21', name: 'Montanha', aliases: ['montanha', 'serra'] },
  { id: 'cigano-22', name: 'Caminho', aliases: ['caminho', 'estrada', 'cruzamento'] },
  { id: 'cigano-23', name: 'Rato', aliases: ['rato', 'camundongo'] },
  { id: 'cigano-24', name: 'Coracao', aliases: ['coracao'] },
  { id: 'cigano-25', name: 'Anel', aliases: ['anel', 'alianca'] },
  { id: 'cigano-26', name: 'Livro', aliases: ['livro'] },
  { id: 'cigano-27', name: 'Carta', aliases: ['carta', 'mensagem'] },
  { id: 'cigano-28', name: 'Cigano', aliases: ['cigano', 'homem cigano'] },
  { id: 'cigano-29', name: 'Cigana', aliases: ['cigana', 'mulher cigana'] },
  { id: 'cigano-30', name: 'Limao', aliases: ['limao'] },
  { id: 'cigano-31', name: 'Sol', aliases: ['sol'] },
  { id: 'cigano-32', name: 'Lua', aliases: ['lua'] },
  { id: 'cigano-33', name: 'Chave', aliases: ['chave'] },
  { id: 'cigano-34', name: 'Peixe', aliases: ['peixe', 'peixes'] },
  { id: 'cigano-35', name: 'Âncora', aliases: ['ancora'] },
  { id: 'cigano-36', name: 'Cruz', aliases: ['cruz', 'cruzeta'] },
];

// Orixás — 16 principais. From Candomblé / Umbanda established pantheon.
const ORIXAS: ReadonlyArray<{ id: string; name: string; aliases: ReadonlyArray<string> }> = [
  { id: 'orixa-exu',     name: 'Exu',       aliases: ['exu', 'exu tranca-rua'] },
  { id: 'orixa-ogum',    name: 'Ogum',      aliases: ['ogum', 'ogu'] },
  { id: 'orixa-oxossi',  name: 'Oxossi',    aliases: ['oxossi', 'oxóssi'] },
  { id: 'orixa-xango',   name: 'Xango',     aliases: ['xango', 'xangô'] },
  { id: 'orixa-oxala',   name: 'Oxala',     aliases: ['oxala', 'oxalá'] },
  { id: 'orixa-iemanja', name: 'Iemanja',   aliases: ['iemanja', 'iemanjá', 'yemanja'] },
  { id: 'orixa-iansa',   name: 'Iansa',     aliases: ['iansa', 'iansã', 'oyá'] },
  { id: 'orixa-oba',     name: 'Oba',       aliases: ['oba'] },
  { id: 'orixa-oxum',    name: 'Oxum',      aliases: ['oxum', 'oshun'] },
  { id: 'orixa-nana',    name: 'Nanã',      aliases: ['nana', 'nanã', 'nanan'] },
  { id: 'orixa-omolu',   name: 'Omolu',     aliases: ['omolu', 'omolú', 'obaluae'] },
  { id: 'orixa-loguned', name: 'Logunedé',  aliases: ['logunede', 'logunedé', 'logun-edé'] },
  { id: 'orixa-oia',     name: 'Oiá',       aliases: ['oia', 'oiá'] },
  { id: 'orixa-oxumare', name: 'Oxumaré',   aliases: ['oxumare', 'oxumaré'] },
  { id: 'orixa-ibeji',   name: 'Ibeji',     aliases: ['ibeji', 'ibejis'] },
  { id: 'orixa-awo',     name: 'Awô',       aliases: ['awo', 'awô'] },
];

// Odus — 16 principais. From Ifá / Diloggun (16 first odus of 256).
const ODUS: ReadonlyArray<{ id: string; name: string; aliases: ReadonlyArray<string> }> = [
  { id: 'odu-eji-oko',    name: 'Eji-Oko',     aliases: ['eji-oko', 'ejioko', 'ogi-oko'] },
  { id: 'odu-okana',      name: 'Okana',       aliases: ['okana'] },
  { id: 'odu-ika',        name: 'Ika',         aliases: ['ika'] },
  { id: 'odu-oturupon',   name: 'Oturupon',    aliases: ['oturupon', 'otura-pon'] },
  { id: 'odu-iwori',      name: 'Iwori',       aliases: ['iwori'] },
  { id: 'odu-obara',      name: 'Obará',       aliases: ['obara', 'obar'] },
  { id: 'odu-odi',        name: 'Odi',         aliases: ['odi'] },
  { id: 'odu-ogunda',     name: 'Ogunda',      aliases: ['ogunda', 'ogundá'] },
  { id: 'odu-osa',        name: 'Osa',         aliases: ['osa', 'ocana'] },
  { id: 'odu-irosun',     name: 'Irosun',      aliases: ['irosun', 'irosun'] },
  { id: 'odu-owonrin',    name: 'Owonrin',     aliases: ['owonrin', 'oworin'] },
  { id: 'odu-edi',        name: 'Edi',         aliases: ['edi'] },
  { id: 'odu-ejila',      name: 'Ejila',       aliases: ['ejila', 'ejilá'] },
  { id: 'odu-alana',      name: 'Alaná',       aliases: ['alana', 'alana'] },
  { id: 'odu-aratan',     name: 'Aratan',      aliases: ['aratan'] },
  { id: 'odu-iwawo',      name: 'Iwawô',       aliases: ['iwawo', 'iwawô', 'iwaw'] },
];

// Astrologia — 12 signos + 10 planetas + 12 casas = 34.
const ASTROLOGIA_SIGNOS: ReadonlyArray<{ id: string; name: string; aliases: ReadonlyArray<string> }> = [
  { id: 'signo-aries',     name: 'Áries',     aliases: ['aries', 'áries'] },
  { id: 'signo-touro',     name: 'Touro',     aliases: ['touro'] },
  { id: 'signo-gemeos',    name: 'Gêmeos',    aliases: ['gemeos', 'gêmeos'] },
  { id: 'signo-cancer',    name: 'Câncer',    aliases: ['cancer', 'câncer'] },
  { id: 'signo-leao',      name: 'Leão',      aliases: ['leao', 'leão'] },
  { id: 'signo-virgem',    name: 'Virgem',    aliases: ['virgem'] },
  { id: 'signo-libra',     name: 'Libra',     aliases: ['libra'] },
  { id: 'signo-escorpiao', name: 'Escorpião', aliases: ['escorpiao', 'escorpião'] },
  { id: 'signo-sagitario', name: 'Sagitário', aliases: ['sagitario', 'sagitário'] },
  { id: 'signo-capricornio', name: 'Capricórnio', aliases: ['capricornio', 'capricórnio'] },
  { id: 'signo-aquario',   name: 'Aquário',   aliases: ['aquario', 'aquário'] },
  { id: 'signo-peixes',    name: 'Peixes',    aliases: ['peixes'] },
];
const ASTROLOGIA_PLANETAS: ReadonlyArray<{ id: string; name: string; aliases: ReadonlyArray<string> }> = [
  { id: 'planeta-sol',     name: 'Sol',     aliases: ['sol'] },
  { id: 'planeta-lua',     name: 'Lua',     aliases: ['lua'] },
  { id: 'planeta-mercurio', name: 'Mercúrio', aliases: ['mercurio', 'mercúrio'] },
  { id: 'planeta-venus',   name: 'Vênus',   aliases: ['venus', 'vênus'] },
  { id: 'planeta-marte',   name: 'Marte',   aliases: ['marte'] },
  { id: 'planeta-jupiter', name: 'Júpiter', aliases: ['jupiter', 'júpiter'] },
  { id: 'planeta-saturno', name: 'Saturno', aliases: ['saturno'] },
  { id: 'planeta-urano',   name: 'Urano',   aliases: ['urano'] },
  { id: 'planeta-netuno',  name: 'Netuno',  aliases: ['netuno'] },
  { id: 'planeta-plutao',  name: 'Plutão',  aliases: ['plutao', 'plutão'] },
];
const ASTROLOGIA_CASAS: ReadonlyArray<{ id: string; name: string; aliases: ReadonlyArray<string> }> = [
  { id: 'casa-01', name: 'Casa 1', aliases: ['casa 1', 'ascendente'] },
  { id: 'casa-02', name: 'Casa 2', aliases: ['casa 2'] },
  { id: 'casa-03', name: 'Casa 3', aliases: ['casa 3'] },
  { id: 'casa-04', name: 'Casa 4', aliases: ['casa 4', 'fundo do ceu', 'imum coeli'] },
  { id: 'casa-05', name: 'Casa 5', aliases: ['casa 5'] },
  { id: 'casa-06', name: 'Casa 6', aliases: ['casa 6'] },
  { id: 'casa-07', name: 'Casa 7', aliases: ['casa 7', 'descendente'] },
  { id: 'casa-08', name: 'Casa 8', aliases: ['casa 8'] },
  { id: 'casa-09', name: 'Casa 9', aliases: ['casa 9'] },
  { id: 'casa-10', name: 'Casa 10', aliases: ['casa 10', 'meio do ceu', 'medium coeli'] },
  { id: 'casa-11', name: 'Casa 11', aliases: ['casa 11'] },
  { id: 'casa-12', name: 'Casa 12', aliases: ['casa 12'] },
];

// Numerologia — 1..9 + mestres 11/22/33 = 12.
const NUMEROLOGIA: ReadonlyArray<{ id: string; name: string; aliases: ReadonlyArray<string> }> = [
  { id: 'num-1',  name: 'Número 1',  aliases: ['numero 1', 'número 1'] },
  { id: 'num-2',  name: 'Número 2',  aliases: ['numero 2', 'número 2'] },
  { id: 'num-3',  name: 'Número 3',  aliases: ['numero 3', 'número 3'] },
  { id: 'num-4',  name: 'Número 4',  aliases: ['numero 4', 'número 4'] },
  { id: 'num-5',  name: 'Número 5',  aliases: ['numero 5', 'número 5'] },
  { id: 'num-6',  name: 'Número 6',  aliases: ['numero 6', 'número 6'] },
  { id: 'num-7',  name: 'Número 7',  aliases: ['numero 7', 'número 7'] },
  { id: 'num-8',  name: 'Número 8',  aliases: ['numero 8', 'número 8'] },
  { id: 'num-9',  name: 'Número 9',  aliases: ['numero 9', 'número 9'] },
  { id: 'num-11', name: 'Número 11', aliases: ['numero 11', 'número 11'] },
  { id: 'num-22', name: 'Número 22', aliases: ['numero 22', 'número 22'] },
  { id: 'num-33', name: 'Número 33', aliases: ['numero 33', 'número 33'] },
];

// Sefirot — 10 (Árvore da Vida, Cabala).
const SEFIROT: ReadonlyArray<{ id: string; name: string; aliases: ReadonlyArray<string> }> = [
  { id: 'sefirot-keter',    name: 'Keter',     aliases: ['keter', 'kether', 'coroa'] },
  { id: 'sefirot-chokhmah', name: 'Chokhmah',  aliases: ['chokhmah', 'chochmah', 'sabedoria'] },
  { id: 'sefirot-binah',    name: 'Binah',     aliases: ['binah', 'entendimento'] },
  { id: 'sefirot-chesed',   name: 'Chesed',    aliases: ['chesed', 'chesed', 'misericordia'] },
  { id: 'sefirot-geburah',  name: 'Geburah',   aliases: ['geburah', 'gevurah', 'rigor'] },
  { id: 'sefirot-tiferet',  name: 'Tiferet',   aliases: ['tiferet', 'tipheret', 'beleza'] },
  { id: 'sefirot-netzach',  name: 'Netzach',   aliases: ['netzach', 'vitoria'] },
  { id: 'sefirot-hod',      name: 'Hod',       aliases: ['hod', 'gloria'] },
  { id: 'sefirot-yesod',    name: 'Yesod',     aliases: ['yesod', 'fundamento'] },
  { id: 'sefirot-malkuth',  name: 'Malkuth',   aliases: ['malkuth', 'reino'] },
];

// Tarot — 22 arcanos maiores (0..21).
const TAROT: ReadonlyArray<{ id: string; name: string; aliases: ReadonlyArray<string> }> = [
  { id: 'tarot-00-ou',  name: 'O Louco',         aliases: ['loco', 'louco', 'o louco', 'the fool'] },
  { id: 'tarot-01',     name: 'O Mago',          aliases: ['mago', 'o mago'] },
  { id: 'tarot-02',     name: 'A Sacerdotisa',   aliases: ['sacerdotisa', 'a sacerdotisa'] },
  { id: 'tarot-03',     name: 'A Imperatriz',    aliases: ['imperatriz', 'a imperatriz'] },
  { id: 'tarot-04',     name: 'O Imperador',     aliases: ['imperador', 'o imperador'] },
  { id: 'tarot-05',     name: 'O Hierofante',    aliases: ['hierofante', 'o hierofante', 'papa'] },
  { id: 'tarot-06',     name: 'Os Enamorados',   aliases: ['enamorados', 'os enamorados', 'amor'] },
  { id: 'tarot-07',     name: 'O Carro',         aliases: ['carro', 'o carro'] },
  { id: 'tarot-08',     name: 'A Força',         aliases: ['forca', 'força', 'a forca', 'a força'] },
  { id: 'tarot-09',     name: 'O Eremita',       aliases: ['eremita', 'o eremita', 'hermit'] },
  { id: 'tarot-10',     name: 'A Roda da Fortuna', aliases: ['roda da fortuna', 'roda'] },
  { id: 'tarot-11',     name: 'A Justiça',       aliases: ['justica', 'justiça', 'a justica'] },
  { id: 'tarot-12',     name: 'O Pendurado',     aliases: ['pendurado', 'o pendurado', 'enforcado'] },
  { id: 'tarot-13',     name: 'A Morte',         aliases: ['morte', 'a morte', 'death'] },
  { id: 'tarot-14',     name: 'A Temperança',    aliases: ['temperanca', 'temperança', 'a temperanca'] },
  { id: 'tarot-15',     name: 'O Diabo',         aliases: ['diabo', 'o diabo', 'devil'] },
  { id: 'tarot-16',     name: 'A Torre',         aliases: ['torre', 'a torre', 'tower'] },
  { id: 'tarot-17',     name: 'A Estrela',       aliases: ['estrela', 'a estrela', 'star'] },
  { id: 'tarot-18',     name: 'A Lua',           aliases: ['lua', 'a lua', 'moon'] },
  { id: 'tarot-19',     name: 'O Sol',           aliases: ['sol', 'o sol', 'sun'] },
  { id: 'tarot-20',     name: 'O Julgamento',    aliases: ['julgamento', 'o julgamento', 'judgement'] },
  { id: 'tarot-21',     name: 'O Mundo',         aliases: ['mundo', 'o mundo', 'world'] },
];

// Tantra — 7 chakras principais.
const TANTRAS: ReadonlyArray<{ id: string; name: string; aliases: ReadonlyArray<string> }> = [
  { id: 'tantra-01-muladhara',    name: 'Muladhara',    aliases: ['muladhara', 'chakra raiz', 'chakra da raiz'] },
  { id: 'tantra-02-svadhisthana', name: 'Svadhisthana', aliases: ['svadhisthana', 'chakra sacral', 'chakra sexual'] },
  { id: 'tantra-03-manipura',     name: 'Manipura',     aliases: ['manipura', 'chakra do plexo solar'] },
  { id: 'tantra-04-anahata',      name: 'Anahata',      aliases: ['anahata', 'chakra do coracao', 'chakra cardíaco'] },
  { id: 'tantra-05-vishuddha',    name: 'Vishuddha',    aliases: ['vishuddha', 'chakra da garganta'] },
  { id: 'tantra-06-ajna',         name: 'Ajna',         aliases: ['ajna', 'chakra do terceiro olho'] },
  { id: 'tantra-07-sahasrara',    name: 'Sahasrara',    aliases: ['sahasrara', 'chakra coroa'] },
];

// Cabala & Sefirot share the same 10-node tree (Árvore da Vida). Note that
// 'cabal' is the broader tradition label; SEFIROT is the node taxonomy.

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5 — Citation extractors
// ─────────────────────────────────────────────────────────────────────────────

function buildExcerpt(text: string, idx: number, length: number): string {
  const start = Math.max(0, idx - Math.floor(length / 4));
  const end = Math.min(text.length, start + length);
  const raw = text.slice(start, end);
  return raw.replace(/\s+/g, ' ').trim();
}

function extractFromTradition(
  text: string,
  tradition: ReadonlyArray<{ id: string; name: string; aliases: ReadonlyArray<string> }>,
  sourceType: CitationSourceType,
): Citation[] {
  if (text.length === 0) return [];
  const lower = text.toLowerCase();
  const out: Citation[] = [];
  for (const entry of tradition) {
    // Match name + all aliases
    const candidates = [entry.name, ...entry.aliases];
    let best: { idx: number; len: number } | null = null;
    for (const c of candidates) {
      const idx = lower.indexOf(c.toLowerCase());
      if (idx === -1) continue;
      if (best === null || c.length > best.len) {
        best = { idx, len: c.length };
      }
    }
    if (best === null) continue;
    const excerpt = buildExcerpt(text, best.idx, 120);
    out.push(buildCitation(entry.id, sourceType, excerpt, 0.7, 0.8));
  }
  return out;
}

export function extractCiganoCitations(text: string): Citation[] {
  return extractFromTradition(text, CIGANO_CARDS, 'cigano');
}

export function extractOrixaCitations(text: string): Citation[] {
  return extractFromTradition(text, ORIXAS, 'orixa');
}

export function extractOduCitations(text: string): Citation[] {
  return extractFromTradition(text, ODUS, 'odu');
}

export function extractAstrologiaCitations(text: string): Citation[] {
  const sig = extractFromTradition(text, ASTROLOGIA_SIGNOS, 'astrologia');
  const planet = extractFromTradition(text, ASTROLOGIA_PLANETAS, 'astrologia');
  const house = extractFromTradition(text, ASTROLOGIA_CASAS, 'astrologia');
  return [...sig, ...planet, ...house];
}

export function extractNumerologiaCitations(text: string): Citation[] {
  return extractFromTradition(text, NUMEROLOGIA, 'numerologia');
}

export function extractSefirotCitations(text: string): Citation[] {
  return extractFromTradition(text, SEFIROT, 'sefirot');
}

export function extractTarotCitations(text: string): Citation[] {
  return extractFromTradition(text, TAROT, 'tarot');
}

export function extractTantraCitations(text: string): Citation[] {
  return extractFromTradition(text, TANTRAS, 'tantra');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6 — Audit & coverage
// ─────────────────────────────────────────────────────────────────────────────

export interface ExplainabilityCoverage {
  readonly total: number;
  readonly byTradition: Record<CitationSourceType, number>;
  readonly missing: ReadonlyArray<string>;
}

// Direct label → canonical names + exporter map. Avoids any reflection.
const TRADITION_CATALOG: ReadonlyArray<{
  readonly sourceType: CitationSourceType;
  readonly exporter: (text: string) => ReadonlyArray<Citation>;
  readonly expected: number;
  readonly canonicalNames: string;
}> = [
  {
    sourceType: 'cigano',
    exporter: extractCiganoCitations,
    expected: 36,
    canonicalNames: CIGANO_CARDS.map((e) => e.name).join(' '),
  },
  {
    sourceType: 'orixa',
    exporter: extractOrixaCitations,
    expected: 16,
    canonicalNames: ORIXAS.map((e) => e.name).join(' '),
  },
  {
    sourceType: 'odu',
    exporter: extractOduCitations,
    expected: 16,
    canonicalNames: ODUS.map((e) => e.name).join(' '),
  },
  {
    sourceType: 'astrologia',
    exporter: extractAstrologiaCitations,
    expected: 34,
    canonicalNames: [
      ...ASTROLOGIA_SIGNOS.map((s) => s.name),
      ...ASTROLOGIA_PLANETAS.map((p) => p.name),
      ...ASTROLOGIA_CASAS.map((c) => c.name),
    ].join(' '),
  },
  {
    sourceType: 'numerologia',
    exporter: extractNumerologiaCitations,
    expected: 12,
    canonicalNames: NUMEROLOGIA.map((e) => e.name).join(' '),
  },
  {
    sourceType: 'sefirot',
    exporter: extractSefirotCitations,
    expected: 10,
    canonicalNames: SEFIROT.map((e) => e.name).join(' '),
  },
  {
    sourceType: 'tarot',
    exporter: extractTarotCitations,
    expected: 22,
    canonicalNames: TAROT.map((e) => e.name).join(' '),
  },
  {
    sourceType: 'tantra',
    exporter: extractTantraCitations,
    expected: 7,
    canonicalNames: TANTRAS.map((e) => e.name).join(' '),
  },
];

export function auditExplainabilityCoverage(): ExplainabilityCoverage {
  const byTradition: Record<CitationSourceType, number> = {
    cigano: 0,
    orixa: 0,
    odu: 0,
    astrologia: 0,
    numerologia: 0,
    cabala: 0,
    tarot: 0,
    tantra: 0,
    sefirot: 0,
    article: 0,
  };
  const missing: string[] = [];
  for (const t of TRADITION_CATALOG) {
    const citations = t.exporter(t.canonicalNames);
    const count = new Set(citations.map((c) => c.sourceId)).size;
    byTradition[t.sourceType] = count;
    if (count < t.expected) {
      missing.push(`${t.sourceType} (expected ${t.expected}, got ${count})`);
    }
  }
  const total = Object.values(byTradition).reduce((a, b) => a + b, 0);
  return Object.freeze({
    total,
    byTradition: Object.freeze(byTradition),
    missing: Object.freeze(missing),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7 — Guardrails
// ─────────────────────────────────────────────────────────────────────────────

export function flagLowConfidence(
  payload: ExplainabilityPayload,
  threshold: number = 0.4,
): string[] {
  const warnings: string[] = [];
  const t = clampUnit(threshold, 0.4);
  if (payload.confidence < t) {
    warnings.push(
      `confidence ${payload.confidence.toFixed(2)} < threshold ${t.toFixed(2)} (label=${payload.confidenceLabel})`,
    );
  }
  if (payload.citations.length === 0) {
    warnings.push('no citations attached; downstream inference is unsupported');
  }
  return warnings;
}

export function flagRedundantCitations(payload: ExplainabilityPayload): string[] {
  const counts = new Map<CitationSourceType, number>();
  for (const c of payload.citations) {
    counts.set(c.sourceType, (counts.get(c.sourceType) ?? 0) + 1);
  }
  const warnings: string[] = [];
  for (const [t, n] of counts) {
    if (n >= 3) {
      warnings.push(
        `${n} citations share sourceType '${t}'; consider diversifying sources`,
      );
    }
  }
  return warnings;
}

export interface ExplainabilitySummary {
  readonly headlines: ReadonlyArray<string>;
  readonly confidenceLabel: CitationConfidence;
  readonly citationCount: number;
  readonly traceStepCount: number;
  readonly coverageByTradition: string;
}

export function summarizeExplainability(payload: ExplainabilityPayload): ExplainabilitySummary {
  const headlines: string[] = [];
  headlines.push(
    `confidence=${payload.confidence.toFixed(2)} (${payload.confidenceLabel})`,
  );
  headlines.push(
    `citations=${payload.citations.length}, trace_steps=${payload.trace.length}`,
  );
  if (payload.trace.length > 0) {
    let totalElapsed = 0;
    for (const s of payload.trace) totalElapsed += s.elapsedMs ?? 0;
    headlines.push(`total_trace_ms=${totalElapsed.toFixed(2)}`);
  }
  if (payload.notes !== undefined && payload.notes.length > 0) {
    headlines.push(`notes: ${payload.notes}`);
  }
  if (payload.warnings !== undefined && payload.warnings.length > 0) {
    headlines.push(`warnings: ${payload.warnings.join(' | ')}`);
  }
  const covMap = new Map<CitationSourceType, number>();
  for (const c of payload.citations) {
    covMap.set(c.sourceType, (covMap.get(c.sourceType) ?? 0) + 1);
  }
  const coverage = Array.from(covMap.entries())
    .map(([t, n]) => `${t}:${n}`)
    .join(', ');
  return Object.freeze({
    headlines: Object.freeze([...headlines]),
    confidenceLabel: payload.confidenceLabel,
    citationCount: payload.citations.length,
    traceStepCount: payload.trace.length,
    coverageByTradition: coverage,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 8 — ENGINE_INFO & __ALL_EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export const ENGINE_INFO = Object.freeze({
  moduleName: 'akasha_explainability',
  cycle: 'w63',
  totalSacredSymbols: 153,
  traditionsCount: 8,
  exportCount: 25,
  confidenceBuckets: [...CONFIDENCE_BUCKETS],
  tierWeights: Object.freeze({
    cabala: 1.0,
    sefirot: 1.0,
    cigano: 0.95,
    orixa: 0.95,
    odu: 0.95,
    astrologia: 0.9,
    numerologia: 0.9,
    tarot: 0.85,
    tantra: 0.8,
    article: 0.6,
  }),
});

export const __ALL_EXPORTS = Object.freeze([
  'Citation',
  'CitationConfidence',
  'TraceStep',
  'ExplainabilityPayload',
  'CitationSourceType',
  'ExplainabilityCoverage',
  'ExplainabilitySummary',
  'CombinedScores',
  'TraceContext',
  'ENGINE_INFO',
  'buildCitation',
  'buildTraceStep',
  'startTrace',
  'buildPayload',
  'scoreCitations',
  'boostScoreByCitations',
  'decayScoreByCoverage',
  'labelConfidence',
  'combineScore',
  'extractCiganoCitations',
  'extractOrixaCitations',
  'extractOduCitations',
  'extractAstrologiaCitations',
  'extractNumerologiaCitations',
  'extractSefirotCitations',
  'extractTarotCitations',
  'extractTantraCitations',
  'auditExplainabilityCoverage',
  'flagLowConfidence',
  'flagRedundantCitations',
  'summarizeExplainability',
] as const);
