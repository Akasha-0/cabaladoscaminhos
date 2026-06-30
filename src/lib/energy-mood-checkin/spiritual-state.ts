/**
 * ════════════════════════════════════════════════════════════════════════════
 *  ENERGY + MOOD + SPIRITUAL-STATE DAILY CHECK-IN — Spiritual state
 *  Cabala dos Caminhos — wave 69, 2026-06-30
 *
 *  Free-text analysis of the `spiritualState` field on a check-in.
 *
 *  Provides:
 *   - extractSacredTags(text)  — bounded lookaround regex over the
 *     7-tradition sacred-symbol catalog (Cigano 1-36, Orixás 16, Sefirot
 *     10, Hebraic letters 22, planets 10, zodiac signs 12, houses 12,
 *     chakras 7, tarot majors 22) — returns deduplicated matches with
 *     position info
 *
 *   - classifyState(text)      — rule-based 5-state classifier:
 *     grounded | expansive | transformative | introspective | balanced
 *
 *   - linkToReading(checkin, history) — link a check-in to a reading
 *     recorded within ±6 hours (cross-corpus analysis hook)
 *
 *   - intentionQuality(text)   — heuristic scoring of a daily intention:
 *     detects coercive anti-patterns ("should", "must", "won't")
 *     vs growth-oriented framings ("I welcome", "I release", "I open")
 *
 *  Sacred-symbol coverage count: 9 traditions × 12+ each = 145+ symbols.
 * ════════════════════════════════════════════════════════════════════════════
 */

import type {
  Checkin,
  UserId,
} from './checkin.ts';

// ───────────────────────────────────────────────────────────────────────────
//  Sacred-symbol catalog (9 traditions, 145+ entries)
// ───────────────────────────────────────────────────────────────────────────

/**
 * Each catalog entry is `{tradition, symbol}` — the symbol is the literal
 * word/phrase that should match in user text. Order is irrelevant — the
 * regex is built with longest-first to prevent prefix shadowing.
 *
 * Traditions: Cigano (36), Orixás (16), Cabala — Sefirot (10), Hebraico (22),
 * Astrologia — Planetas (10), Astrologia — Signos (12), Astrologia — Casas (12),
 * Tantra — Chakras (7), Tarot — Arcanos Maiores (22).
 * Total: 36+16+10+22+10+12+12+7+22 = 147 symbols.
 */
interface CatalogEntry {
  tradition: string;
  symbol: string;
}

export const SACRED_CATALOG: readonly CatalogEntry[] = (
  [
    // 1. Cigano (Lenormand) — 36 cards, by name
    ...Array.from({ length: 36 }, (_, i) => {
      const names = [
        'Cavaleiro', 'Trevo', 'Navio', 'Casa', 'Árvore', 'Nuvens', 'Serpente',
        'Caixão', 'Buquês', 'Foice', 'Chicote', 'Pássaros', 'Criança', 'Raposa',
        'Urso', 'Estrela', 'Cegonha', 'Cachorro', 'Torre', 'Jardim', 'Montanha',
        'Caminhos', 'Rato', 'Coração', 'Anel', 'Livro', 'Carta', 'Cigano',
        'Cigana', 'Lírios', 'Sol', 'Lua', 'Chave', 'Peixes', 'Âncora', 'Cruz',
      ];
      return { tradition: 'Cigano', symbol: names[i]! };
    }),
    // 2. Orixás — 16
    { tradition: 'Orixás', symbol: 'Oxalá' },
    { tradition: 'Orixás', symbol: 'Iemanjá' },
    { tradition: 'Orixás', symbol: 'Ogum' },
    { tradition: 'Orixás', symbol: 'Oxum' },
    { tradition: 'Orixás', symbol: 'Xangô' },
    { tradition: 'Orixás', symbol: 'Oxóssi' },
    { tradition: 'Orixás', symbol: 'Obaluaiê' },
    { tradition: 'Orixás', symbol: 'Nanã' },
    { tradition: 'Orixás', symbol: 'Exu' },
    { tradition: 'Orixás', symbol: 'Pomba Gira' },
    { tradition: 'Orixás', symbol: 'Ibeji' },
    { tradition: 'Orixás', symbol: 'Oyá' },
    { tradition: 'Orixás', symbol: 'Omolu' },
    { tradition: 'Orixás', symbol: 'Oxalufan' },
    { tradition: 'Orixás', symbol: 'Iansã' },
    { tradition: 'Orixás', symbol: 'Obá' },
    // 3. Cabala — Sefirot (10)
    { tradition: 'Cabala', symbol: 'Kether' },
    { tradition: 'Cabala', symbol: 'Chokmah' },
    { tradition: 'Cabala', symbol: 'Binah' },
    { tradition: 'Cabala', symbol: 'Chesed' },
    { tradition: 'Cabala', symbol: 'Geburah' },
    { tradition: 'Cabala', symbol: 'Tiphereth' },
    { tradition: 'Cabala', symbol: 'Netzach' },
    { tradition: 'Cabala', symbol: 'Hod' },
    { tradition: 'Cabala', symbol: 'Yesod' },
    { tradition: 'Cabala', symbol: 'Malkuth' },
    // 4. Hebraico — 22 letras
    { tradition: 'Hebraico', symbol: 'Aleph' },
    { tradition: 'Hebraico', symbol: 'Beth' },
    { tradition: 'Hebraico', symbol: 'Gimel' },
    { tradition: 'Hebraico', symbol: 'Daleth' },
    { tradition: 'Hebraico', symbol: 'He' },
    { tradition: 'Hebraico', symbol: 'Vav' },
    { tradition: 'Hebraico', symbol: 'Zayin' },
    { tradition: 'Hebraico', symbol: 'Cheth' },
    { tradition: 'Hebraico', symbol: 'Teth' },
    { tradition: 'Hebraico', symbol: 'Yod' },
    { tradition: 'Hebraico', symbol: 'Kaph' },
    { tradition: 'Hebraico', symbol: 'Lamed' },
    { tradition: 'Hebraico', symbol: 'Mem' },
    { tradition: 'Hebraico', symbol: 'Nun' },
    { tradition: 'Hebraico', symbol: 'Samekh' },
    { tradition: 'Hebraico', symbol: 'Ayin' },
    { tradition: 'Hebraico', symbol: 'Pe' },
    { tradition: 'Hebraico', symbol: 'Tsade' },
    { tradition: 'Hebraico', symbol: 'Qoph' },
    { tradition: 'Hebraico', symbol: 'Resh' },
    { tradition: 'Hebraico', symbol: 'Shin' },
    { tradition: 'Hebraico', symbol: 'Tav' },
    // 5. Astrologia — Planetas (10)
    { tradition: 'Astrologia-Planetas', symbol: 'Sol' },
    { tradition: 'Astrologia-Planetas', symbol: 'Lua' },
    { tradition: 'Astrologia-Planetas', symbol: 'Mercúrio' },
    { tradition: 'Astrologia-Planetas', symbol: 'Vênus' },
    { tradition: 'Astrologia-Planetas', symbol: 'Terra' },
    { tradition: 'Astrologia-Planetas', symbol: 'Marte' },
    { tradition: 'Astrologia-Planetas', symbol: 'Júpiter' },
    { tradition: 'Astrologia-Planetas', symbol: 'Saturno' },
    { tradition: 'Astrologia-Planetas', symbol: 'Urano' },
    { tradition: 'Astrologia-Planetas', symbol: 'Netuno' },
    // 6. Astrologia — Signos (12)
    { tradition: 'Astrologia-Signos', symbol: 'Áries' },
    { tradition: 'Astrologia-Signos', symbol: 'Touro' },
    { tradition: 'Astrologia-Signos', symbol: 'Gêmeos' },
    { tradition: 'Astrologia-Signos', symbol: 'Câncer' },
    { tradition: 'Astrologia-Signos', symbol: 'Leão' },
    { tradition: 'Astrologia-Signos', symbol: 'Virgem' },
    { tradition: 'Astrologia-Signos', symbol: 'Libra' },
    { tradition: 'Astrologia-Signos', symbol: 'Escorpião' },
    { tradition: 'Astrologia-Signos', symbol: 'Sagitário' },
    { tradition: 'Astrologia-Signos', symbol: 'Capricórnio' },
    { tradition: 'Astrologia-Signos', symbol: 'Aquário' },
    { tradition: 'Astrologia-Signos', symbol: 'Peixes' },
    // 7. Astrologia — Casas (12)
    { tradition: 'Astrologia-Casas', symbol: 'Casa 1' },
    { tradition: 'Astrologia-Casas', symbol: 'Casa 2' },
    { tradition: 'Astrologia-Casas', symbol: 'Casa 3' },
    { tradition: 'Astrologia-Casas', symbol: 'Casa 4' },
    { tradition: 'Astrologia-Casas', symbol: 'Casa 5' },
    { tradition: 'Astrologia-Casas', symbol: 'Casa 6' },
    { tradition: 'Astrologia-Casas', symbol: 'Casa 7' },
    { tradition: 'Astrologia-Casas', symbol: 'Casa 8' },
    { tradition: 'Astrologia-Casas', symbol: 'Casa 9' },
    { tradition: 'Astrologia-Casas', symbol: 'Casa 10' },
    { tradition: 'Astrologia-Casas', symbol: 'Casa 11' },
    { tradition: 'Astrologia-Casas', symbol: 'Casa 12' },
    // 8. Tantra — Chakras (7)
    { tradition: 'Tantra', symbol: 'Muladhara' },
    { tradition: 'Tantra', symbol: 'Svadhisthana' },
    { tradition: 'Tantra', symbol: 'Manipura' },
    { tradition: 'Tantra', symbol: 'Anahata' },
    { tradition: 'Tantra', symbol: 'Vishuddha' },
    { tradition: 'Tantra', symbol: 'Ajna' },
    { tradition: 'Tantra', symbol: 'Sahasrara' },
    // 9. Tarot — Arcanos Maiores (22)
    { tradition: 'Tarot', symbol: 'O Louco' },
    { tradition: 'Tarot', symbol: 'O Mago' },
    { tradition: 'Tarot', symbol: 'A Sacerdotisa' },
    { tradition: 'Tarot', symbol: 'A Imperatriz' },
    { tradition: 'Tarot', symbol: 'O Imperador' },
    { tradition: 'Tarot', symbol: 'O Hierofante' },
    { tradition: 'Tarot', symbol: 'Os Enamorados' },
    { tradition: 'Tarot', symbol: 'O Carro' },
    { tradition: 'Tarot', symbol: 'A Força' },
    { tradition: 'Tarot', symbol: 'O Eremita' },
    { tradition: 'Tarot', symbol: 'A Roda da Fortuna' },
    { tradition: 'Tarot', symbol: 'A Justiça' },
    { tradition: 'Tarot', symbol: 'O Pendurado' },
    { tradition: 'Tarot', symbol: 'A Morte' },
    { tradition: 'Tarot', symbol: 'A Temperança' },
    { tradition: 'Tarot', symbol: 'O Diabo' },
    { tradition: 'Tarot', symbol: 'A Torre' },
    { tradition: 'Tarot', symbol: 'A Estrela' },
    { tradition: 'Tarot', symbol: 'A Lua' },
    { tradition: 'Tarot', symbol: 'O Sol' },
    { tradition: 'Tarot', symbol: 'O Julgamento' },
    { tradition: 'Tarot', symbol: 'O Mundo' },
  ] as const
);

// ───────────────────────────────────────────────────────────────────────────
//  Tag extraction
// ───────────────────────────────────────────────────────────────────────────

export interface SacredTag {
  tradition: string;
  symbol: string;
  position: number;
  length: number;
}

/**
 * Compile the sacred-symbol regex once at module load.
 *
 * Key lesson (cycle 68): trailing boundary MUST use lookahead `(?=$|\W)`,
 * NOT consumed `(?:$|\W)` — otherwise consecutive matches in the same string
 * get skipped because the engine advances past the consumed boundary.
 *
 * Symbols sorted by length DESC so longer symbols match before their prefix
 * (e.g. "Sol" inside "Solano") is avoided by the lookaround itself, but
 * longer-first guarantees correct nesting for compound names like "O Mundo".
 */
const SORTED_SYMBOLS = [...SACRED_CATALOG]
  .map((e) => ({ ...e, escaped: escapeRegex(e.symbol) }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

const SACRED_REGEX = new RegExp(
  SORTED_SYMBOLS.map((e) => `(?:${e.escaped})`).join('|'),
  'giu',
);

const BOUNDARY_LOOKAROUND = /[a-zA-ZÀ-ÿ]/.test('') ? /[\p{L}\p{N}_]/u : /[a-zA-Z0-9_]/;

/**
 * Extract sacred-tag mentions from text. Returns deduplicated, position-aware
 * matches. Cycle 68 lesson: trailing boundary uses zero-width lookahead so
 * consecutive matches are not skipped.
 */
export function extractSacredTags(text: string): readonly SacredTag[] {
  if (typeof text !== 'string' || text.length === 0) return [];
  SACRED_REGEX.lastIndex = 0;
  const out: SacredTag[] = [];
  const seen = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = SACRED_REGEX.exec(text)) !== null) {
    const found = match[0];
    const start = match.index;
    const len = found.length;
    // Word-boundary check on both sides using zero-width lookaround
    const before = start === 0 ? '' : text[start - 1];
    const after = text[start + len] ?? '';
    if (BOUNDARY_LOOKAROUND.test(before) || BOUNDARY_LOOKAROUND.test(after)) {
      // inside a longer word — skip
      continue;
    }
    const key = `${start}|${len}|${found.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    // Look up which tradition(s) own this symbol — first one wins
    const cat = SACRED_CATALOG.find((e) => e.symbol.toLowerCase() === found.toLowerCase());
    if (!cat) continue;
    out.push({
      tradition: cat.tradition,
      symbol: cat.symbol,
      position: start,
      length: len,
    });
    if (out.length >= 50) break; // defensive cap
  }
  return out;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ───────────────────────────────────────────────────────────────────────────
//  State classification
// ───────────────────────────────────────────────────────────────────────────

export type SpiritualStateClass =
  | 'grounded'
  | 'expansive'
  | 'transformative'
  | 'introspective'
  | 'balanced'
  | 'unmapped'; // 0 tags found

interface StateSignal {
  state: Exclude<SpiritualStateClass, 'unmapped' | 'balanced'>;
  signals: readonly RegExp[];
}

/**
 * Heuristic pattern table — each state has 3+ signal patterns in PT/EN.
 * A check-in is classified by the FIRST matching rule in priority order:
 *   transformative > introspective > grounded > expansive > balanced/unmapped.
 *
 * Patterns are intentionally conservative — a balance of 3+ tags from
 * different traditions lands in 'balanced'.
 */
const STATE_SIGNALS: readonly StateSignal[] = [
  {
    state: 'transformative',
    signals: [
      /\b(Caixão|Morte|Torre|Fogo|fogo|Fornalha|descarrego|banimento|cisão)\b/iu,
      /\b(transformação|crise|mudança radical|morte simbólica|renascimento)\b/iu,
    ],
  },
  {
    state: 'introspective',
    signals: [
      /\b(Lua|Binah|Anahata|Ajna|Água|Águas|reflexão|introspecção|silêncio|interior)\b/iu,
      /\b(escrita|diário|meditação profunda|contemplação)\b/iu,
    ],
  },
  {
    state: 'grounded',
    signals: [
      /\b(Árvore|Muladhara|Terra|Casa|Cigano|raiz|raízes|chão|banimento|raiz)\b/iu,
      /\b(aterramento|grounding|rooted)\b/iu,
    ],
  },
  {
    state: 'expansive',
    signals: [
      /\b(Sahasrara|Sol|Leão|Aquário|Ar|vento|leveza|alegria|expansão)\b/iu,
      /\b(abertura|voo|grand[e]?|vasta?)\b/iu,
    ],
  },
];

export interface ClassifyResult {
  state: SpiritualStateClass;
  matchedTags: readonly SacredTag[];
  signalHits: number;
}

export function classifyState(text: string): ClassifyResult {
  const tags = extractSacredTags(text);
  if (tags.length === 0) {
    return { state: 'unmapped', matchedTags: [], signalHits: 0 };
  }

  const distinctTraditions = new Set(tags.map((t) => t.tradition));

  // Balance heuristic: 3+ distinct traditions → 'balanced' OVERRIDES
  // single-signal match (a balanced daily check-in pulls from multiple lineages).
  if (distinctTraditions.size >= 3) {
    return { state: 'balanced', matchedTags: tags, signalHits: 0 };
  }

  // Priority walk: most distinctive first
  let signalHits = 0;
  for (const sig of STATE_SIGNALS) {
    for (const re of sig.signals) {
      if (re.test(text)) {
        signalHits++;
        return { state: sig.state, matchedTags: tags, signalHits };
      }
    }
  }

  // Fallback when no signal matches but tags exist: lean by majority tradition
  const majorityTradition = mode(Array.from(distinctTraditions));
  if (majorityTradition === 'Cigano' || majorityTradition === 'Tantra' || majorityTradition === 'Cabala') {
    return { state: 'introspective', matchedTags: tags, signalHits };
  }
  if (majorityTradition === 'Orixás' || majorityTradition === 'Astrologia-Planetas' || majorityTradition === 'Astrologia-Signos') {
    return { state: 'grounded', matchedTags: tags, signalHits };
  }
  return { state: 'balanced', matchedTags: tags, signalHits };
}

function mode(arr: readonly string[]): string {
  const counts = new Map<string, number>();
  for (const v of arr) counts.set(v, (counts.get(v) ?? 0) + 1);
  let best = '';
  let bestC = -1;
  for (const [k, c] of counts) {
    if (c > bestC) {
      bestC = c;
      best = k;
    }
  }
  return best;
}

// ───────────────────────────────────────────────────────────────────────────
//  Link check-in to reading history
// ───────────────────────────────────────────────────────────────────────────

export interface ReadingRecord {
  /** ISO timestamp of when the reading happened */
  readAt: string;
  /** Optional reading type (cigano/odu/orixa/etc) */
  type?: string;
  /** Free-text notes about the reading */
  notes?: string;
}

export interface ReadingLink {
  direction: 'before' | 'after' | 'exact';
  hoursDelta: number;
  matchedAt: string;
}

/**
 * Find the closest ReadingRecord to the check-in within ±6h.
 * Returns null if no reading falls in the window.
 */
export function linkToReading(
  checkin: Checkin,
  readingHistory: readonly ReadingRecord[],
  windowHours = 6,
): ReadingLink | null {
  const win = Math.max(1, Math.min(168, windowHours));
  const checkinMs = Date.parse(checkin.recordedAt);
  if (Number.isNaN(checkinMs)) return null;
  const winMs = win * 3600 * 1000;

  let best: ReadingLink | null = null;
  for (const r of readingHistory) {
    const t = Date.parse(r.readAt);
    if (Number.isNaN(t)) continue;
    const delta = t - checkinMs;
    if (Math.abs(delta) > winMs) continue;
    let direction: ReadingLink['direction'];
    if (delta === 0) direction = 'exact';
    else if (delta > 0) direction = 'after';
    else direction = 'before';
    const candidate: ReadingLink = {
      direction,
      hoursDelta: Math.abs(delta) / (3600 * 1000),
      matchedAt: r.readAt,
    };
    if (best === null || Math.abs(delta) < (best.hoursDelta * 3600 * 1000)) {
      best = candidate;
    }
  }
  return best;
}

// ───────────────────────────────────────────────────────────────────────────
//  Intention quality — heuristic
// ───────────────────────────────────────────────────────────────────────────

export type IntentionFlag = 'coercive' | 'growth' | 'open' | 'neutral';

export interface IntentionEvaluation {
  flag: IntentionFlag;
  /** -1 (coercive) … +1 (growth), 0 neutral */
  polarity: number;
  /** Specific markers detected (e.g. "should", "I welcome") */
  markers: readonly string[];
  /** 0..1 — confidence of the assessment */
  confidence: number;
}

const COERCIVE_PATTERNS: readonly RegExp[] = [
  /\b(devo|preciso|tem que|não posso|nunca devo)\b/iu,
  /\b(should|must|have to|can't never|won't|will not)\b/iu,
];

const GROWTH_PATTERNS: readonly RegExp[] = [
  /\b(eu abro|eu recebo|eu permito|eu celebro|eu agradeço)\b/iu,
  /\b(eu solto|eu solto|eu solto|eu libero|eu entrego|eu honro)\b/iu,
  /\b(aceito|acolho|deixo fluir|deixo ir)\b/iu,
  /\b(I welcome|I release|I open|I honor|I allow|I receive|gratidão)\b/iu,
];

const OPEN_PATTERNS: readonly RegExp[] = [
  /\b(que|para que|se|como)\b/iu, // sentence-openers (intentions phrased as prayer)
  /\b(may|let|allow)\b/iu,
];

export function intentionQuality(intention: string): IntentionEvaluation {
  if (typeof intention !== 'string' || intention.trim().length === 0) {
    return { flag: 'neutral', polarity: 0, markers: [], confidence: 0 };
  }
  const markers: string[] = [];
  let polarity = 0;
  let confidence = 0;

  for (const p of COERCIVE_PATTERNS) {
    const m = p.exec(intention);
    if (m) {
      polarity -= 1;
      markers.push(m[0].toLowerCase());
      confidence += 0.5;
    }
  }
  for (const p of GROWTH_PATTERNS) {
    const m = p.exec(intention);
    if (m) {
      polarity += 1;
      markers.push(m[0].toLowerCase());
      confidence += 0.4;
    }
  }

  let flag: IntentionFlag;
  if (polarity >= 1) flag = 'growth';
  else if (polarity <= -1) flag = 'coercive';
  else if (OPEN_PATTERNS.some((p) => p.test(intention))) flag = 'open';
  else flag = 'neutral';

  // Normalize polarity to [-1, 1]
  polarity = Math.max(-1, Math.min(1, polarity / 2));
  confidence = Math.min(1, confidence);

  return { flag, polarity: round2(polarity), markers, confidence: round2(confidence) };
}

function round2(x: number): number {
  return Math.round(x * 100) / 100;
}

// ───────────────────────────────────────────────────────────────────────────
//  Coverage validator (used at engine boundary + smoke)
// ───────────────────────────────────────────────────────────────────────────

/**
 * Assert that the sacred-symbol catalog spans ≥ 7 traditions and ≥ 84 entries.
 * Cycle 62 lesson: sacred-tag coverage count required.
 */
export function assertCatalogCoverage(): void {
  const byTrad = new Map<string, number>();
  for (const e of SACRED_CATALOG) byTrad.set(e.tradition, (byTrad.get(e.tradition) ?? 0) + 1);
  const distinct = byTrad.size;
  const total = SACRED_CATALOG.length;
  if (distinct < 7) {
    throw new Error(`Sacred catalog: ${distinct} traditions < 7 required`);
  }
  if (total < 84) {
    throw new Error(`Sacred catalog: ${total} symbols < 84 required`);
  }
  for (const [trad, count] of byTrad) {
    if (count < 5) {
      throw new Error(`Sacred catalog tradition "${trad}" only has ${count} symbols`);
    }
  }
}

// Re-exports for ergonomic consumption
export type { UserId, Checkin };
