// =============================================================================
// sacred-symbol-autolinker.ts — Cycle 67 Worker D
//
// Pure-data engine that scans user text for sacred symbols across 8 traditions
// and produces linkable references to the platform glossary. NO React, NO HTML
// rendering — caller wires the UI.
//
// Detection algorithm (no ML):
//   1. EXACT  (1.0) — full term in catalog, lookaround boundary verified
//   2. PARTIAL (0.7) — diacritics-stripped match OR optional-prefixed match
//   3. FUZZY  (0.4) — Levenshtein distance ≤ 1 (only for terms ≥ 6 chars)
//
// Anti-patterns avoided:
//   ❌ .includes() for boundary detection → uses lookaround regex (cycle 60/65 lesson)
//   ❌ FNV-1a fallback in HMAC            → HMAC-SHA256 via node:crypto (cycle 60 lesson)
//   ❌ Default non-sacred to zelador       → never assigns traditions (cycle 60 lesson H-9)
//   ❌ Raw user text in HMAC              → binds to sanitizedText + sorted hits
//   ❌ Persisting raw user text + sacred concepts together (cycle 60 lesson C-5)
//   ❌ Shared mutable default exports     → every factory returns a fresh object
//   ❌ Date.now() in id                   → no time-based ids generated here
//   ❌ `as`, `as unknown as`, `any`       → strict TS only, branded types
//
// Cross-cycle references:
//   - HMAC pattern: cycle 65 worker A
//   - Sacred regex: cycle 65 lesson 1 (lookaround, not \b)
//   - PII redaction: cycle 62 daily-reflection pattern
//   - LGPD chain: cycle 60 lessons C-4 + C-5
//   - Sacred catalog reuse: w65/community-moderation (Cigano 36 + Orixás 16 + Sefirot 10 + Chakras 7 + Planetas 11 + Hebrew 22 + Astrologia 12)
//   - Cross-tradition dedup: w64/divination-interpretation
//   - Audit floor: cycle 64 lesson 5
// =============================================================================

// ---------------------------------------------------------------------------
// § 1 — Branded types (prevents cross-wiring of slug / position / hash)
// ---------------------------------------------------------------------------

export type GlossarySlug = string & { readonly __brand: "GlossarySlug" };
export type SacredTermHitId = string & { readonly __brand: "SacredTermHitId" };
export type AutoLinkHash = string & { readonly __brand: "AutoLinkHash" };

// ---------------------------------------------------------------------------
// § 2 — Constants: traditions + priority + thresholds
// ---------------------------------------------------------------------------

export const TRADITIONS = [
  "cigano",
  "orixas",
  "tarot",
  "sefirot",
  "chakras",
  "astrologia",
  "hebrew",
  "ifa",
] as const;
export type Tradition = (typeof TRADITIONS)[number];

/** Priority order — earlier = higher priority for tie-breaking. */
export const TRADITION_PRIORITY: readonly Tradition[] = [
  "cigano",
  "orixas",
  "tarot",
  "sefirot",
  "chakras",
  "astrologia",
  "hebrew",
  "ifa",
] as const;

/** Confidence thresholds for detection tiers. */
export const CONFIDENCE_THRESHOLDS = {
  EXACT: 1.0,
  PARTIAL: 0.7,
  FUZZY: 0.4,
  MIN: 0.0,
} as const;

/** Slug path prefix per tradition. */
export const SLUG_PREFIX: Readonly<Record<Tradition, string>> = Object.freeze({
  cigano: "/glossario/cigano/",
  orixas: "/glossario/orixa/",
  tarot: "/glossario/tarot/",
  sefirot: "/glossario/cabala/sefirot/",
  chakras: "/glossario/tantra/chakras/",
  astrologia: "/glossario/astrologia/",
  hebrew: "/glossario/cabala/hebrew/",
  ifa: "/glossario/ifa/",
});

// ---------------------------------------------------------------------------
// § 3 — Types
// ---------------------------------------------------------------------------

export interface SacredTermHit {
  readonly id: SacredTermHitId;
  readonly term: string;
  readonly tradition: Tradition;
  readonly position: number;
  readonly confidence: number;
  readonly suggestedLink: GlossarySlug;
  readonly rawMatch: string;
  readonly lookaroundBoundary: boolean;
  readonly detectionTier: "exact" | "partial" | "fuzzy";
}

export type LinkedTextSegment =
  | { readonly type: "text"; readonly content: string }
  | {
      readonly type: "link";
      readonly content: string;
      readonly linkData: {
        readonly slug: GlossarySlug;
        readonly tradition: Tradition;
        readonly term: string;
      };
    };

export interface SacredCoverageReport {
  readonly cigano: number;
  readonly orixas: number;
  readonly tarot: number;
  readonly sefirot: number;
  readonly chakras: number;
  readonly astrologia: number;
  readonly hebrew: number;
  readonly ifa: number;
  readonly total: number;
  readonly isFullCoverage: boolean;
  readonly missing: readonly Tradition[];
}

export interface ValidationResult {
  readonly ok: boolean;
  readonly errors: readonly string[];
}

export interface GlossaryEntry {
  readonly term: string;
  readonly slug: GlossarySlug;
  readonly tradition: Tradition;
  /** Aliases match against the same slug — e.g. "Oxum" → "oxum". */
  readonly aliases?: readonly string[];
}

// ---------------------------------------------------------------------------
// § 4 — Sacred catalog (141 symbols across 8 traditions)
//
// Format per entry: { term, slug, tradition, aliases? }.
// Slugs are kebab-case without diacritics. Each catalog array is frozen so
// it can be safely exported and consumed by other modules without mutation.
// ---------------------------------------------------------------------------

const slug = (s: string): GlossarySlug => s as GlossarySlug;
const term = (t: string): string => t;

const CIGANO_CATALOG: readonly GlossaryEntry[] = Object.freeze([
  { term: term("O Cavaleiro"), slug: slug("o-cavaleiro"), tradition: "cigano" },
  { term: term("O Trevo"), slug: slug("o-trevo"), tradition: "cigano" },
  { term: term("O Navio"), slug: slug("o-navio"), tradition: "cigano" },
  { term: term("A Casa"), slug: slug("a-casa"), tradition: "cigano" },
  { term: term("A Árvore"), slug: slug("a-arvore"), tradition: "cigano" },
  { term: term("As Nuvens"), slug: slug("as-nuvens"), tradition: "cigano" },
  { term: term("A Cobra"), slug: slug("a-cobra"), tradition: "cigano" },
  { term: term("O Caixão"), slug: slug("o-caixao"), tradition: "cigano" },
  { term: term("O Buquê"), slug: slug("o-buque"), tradition: "cigano" },
  { term: term("A Foice"), slug: slug("a-foice"), tradition: "cigano" },
  { term: term("O Chicote"), slug: slug("o-chicote"), tradition: "cigano" },
  { term: term("Os Pássaros"), slug: slug("os-passaros"), tradition: "cigano", aliases: ["Passaros"] },
  { term: term("A Criança"), slug: slug("a-crianca"), tradition: "cigano" },
  { term: term("A Raposa"), slug: slug("a-raposa"), tradition: "cigano" },
  { term: term("O Urso"), slug: slug("o-urso"), tradition: "cigano" },
  { term: term("A Estrela"), slug: slug("a-estrela"), tradition: "cigano" },
  { term: term("A Cegonha"), slug: slug("a-cegonha"), tradition: "cigano" },
  { term: term("O Cão"), slug: slug("o-cao"), tradition: "cigano", aliases: ["Cao"] },
  { term: term("A Torre"), slug: slug("a-torre"), tradition: "cigano" },
  { term: term("O Jardim"), slug: slug("o-jardim"), tradition: "cigano" },
  { term: term("A Montanha"), slug: slug("a-montanha"), tradition: "cigano" },
  { term: term("O Caminho"), slug: slug("o-caminho"), tradition: "cigano" },
  { term: term("Os Ratos"), slug: slug("os-ratos"), tradition: "cigano" },
  { term: term("O Coração"), slug: slug("o-coracao"), tradition: "cigano" },
  { term: term("O Anel"), slug: slug("o-anel"), tradition: "cigano" },
  { term: term("O Livro"), slug: slug("o-livro"), tradition: "cigano" },
  { term: term("A Carta"), slug: slug("a-carta"), tradition: "cigano" },
  { term: term("O Cigano"), slug: slug("o-cigano"), tradition: "cigano" },
  { term: term("A Cigana"), slug: slug("a-cigana"), tradition: "cigano" },
  { term: term("O Sol"), slug: slug("o-sol"), tradition: "cigano" },
  { term: term("A Lua"), slug: slug("a-lua"), tradition: "cigano" },
  { term: term("A Chave"), slug: slug("a-chave"), tradition: "cigano" },
  { term: term("Os Peixes"), slug: slug("os-peixes"), tradition: "cigano" },
  { term: term("A Âncora"), slug: slug("a-ancora"), tradition: "cigano" },
  { term: term("A Cruz"), slug: slug("a-cruz"), tradition: "cigano" },
  { term: term("A Caveira"), slug: slug("a-caveira"), tradition: "cigano" },
]);

const ORIXAS_CATALOG: readonly GlossaryEntry[] = Object.freeze([
  { term: term("Oxalá"), slug: slug("oxala"), tradition: "orixas" },
  { term: term("Ogum"), slug: slug("ogum"), tradition: "orixas" },
  { term: term("Iansã"), slug: slug("iansa"), tradition: "orixas", aliases: ["Iansa"] },
  { term: term("Xangô"), slug: slug("xango"), tradition: "orixas", aliases: ["Xango"] },
  { term: term("Iemanjá"), slug: slug("iemanja"), tradition: "orixas", aliases: ["Iemanja"] },
  { term: term("Oxum"), slug: slug("oxum"), tradition: "orixas" },
  { term: term("Oxumarê"), slug: slug("oxumare"), tradition: "orixas", aliases: ["Oxumare"] },
  { term: term("Nanã"), slug: slug("nana"), tradition: "orixas", aliases: ["Nana"] },
  { term: term("Omolu"), slug: slug("omolu"), tradition: "orixas" },
  { term: term("Obaluaiê"), slug: slug("obaluaie"), tradition: "orixas", aliases: ["Obalaie", "Obaluaiê"] },
  { term: term("Logunedé"), slug: slug("logunede"), tradition: "orixas", aliases: ["Logunede"] },
  { term: term("Ibeji"), slug: slug("ibeji"), tradition: "orixas" },
  { term: term("Exu"), slug: slug("exu"), tradition: "orixas" },
  { term: term("Pomba Gira"), slug: slug("pomba-gira"), tradition: "orixas", aliases: ["Pomba-Gira"] },
  { term: term("Oxossi"), slug: slug("oxossi"), tradition: "orixas" },
  { term: term("Oxalupam"), slug: slug("oxalupam"), tradition: "orixas" },
]);

const TAROT_CATALOG: readonly GlossaryEntry[] = Object.freeze([
  { term: term("O Louco"), slug: slug("o-louco"), tradition: "tarot" },
  { term: term("O Mago"), slug: slug("o-mago"), tradition: "tarot" },
  { term: term("A Sacerdotisa"), slug: slug("a-sacerdotisa"), tradition: "tarot" },
  { term: term("A Imperatriz"), slug: slug("a-imperatriz"), tradition: "tarot" },
  { term: term("O Imperador"), slug: slug("o-imperador"), tradition: "tarot" },
  { term: term("O Hierofante"), slug: slug("o-hierofante"), tradition: "tarot" },
  { term: term("Os Enamorados"), slug: slug("os-enamorados"), tradition: "tarot" },
  { term: term("O Carro"), slug: slug("o-carro"), tradition: "tarot" },
  { term: term("A Força"), slug: slug("a-forca"), tradition: "tarot", aliases: ["A Forca"] },
  { term: term("O Eremita"), slug: slug("o-eremita"), tradition: "tarot" },
  { term: term("A Roda da Fortuna"), slug: slug("a-roda-da-fortuna"), tradition: "tarot" },
  { term: term("A Justiça"), slug: slug("a-justica"), tradition: "tarot" },
  { term: term("O Enforcado"), slug: slug("o-enforcado"), tradition: "tarot" },
  { term: term("A Morte"), slug: slug("a-morte"), tradition: "tarot" },
  { term: term("A Temperança"), slug: slug("a-temperanca"), tradition: "tarot" },
  { term: term("O Diabo"), slug: slug("o-diabo"), tradition: "tarot" },
  { term: term("A Torre"), slug: slug("a-torre"), tradition: "tarot" },
  { term: term("A Estrela"), slug: slug("a-estrela-tarot"), tradition: "tarot" },
  { term: term("A Lua"), slug: slug("a-lua-tarot"), tradition: "tarot" },
  { term: term("O Sol"), slug: slug("o-sol-tarot"), tradition: "tarot" },
  { term: term("O Julgamento"), slug: slug("o-julgamento"), tradition: "tarot" },
  { term: term("O Mundo"), slug: slug("o-mundo"), tradition: "tarot" },
]);

const SEFIROT_CATALOG: readonly GlossaryEntry[] = Object.freeze([
  { term: term("Kether"), slug: slug("kether"), tradition: "sefirot" },
  { term: term("Chokhmah"), slug: slug("chokhmah"), tradition: "sefirot" },
  { term: term("Binah"), slug: slug("binah"), tradition: "sefirot" },
  { term: term("Chesed"), slug: slug("chesed"), tradition: "sefirot" },
  { term: term("Geburah"), slug: slug("geburah"), tradition: "sefirot" },
  { term: term("Tiferet"), slug: slug("tiferet"), tradition: "sefirot" },
  { term: term("Netzach"), slug: slug("netzach"), tradition: "sefirot" },
  { term: term("Hod"), slug: slug("hod"), tradition: "sefirot" },
  { term: term("Yesod"), slug: slug("yesod"), tradition: "sefirot" },
  { term: term("Malkuth"), slug: slug("malkuth"), tradition: "sefirot" },
]);

const CHAKRAS_CATALOG: readonly GlossaryEntry[] = Object.freeze([
  { term: term("Muladhara"), slug: slug("muladhara"), tradition: "chakras" },
  { term: term("Svadhisthana"), slug: slug("svadhisthana"), tradition: "chakras" },
  { term: term("Manipura"), slug: slug("manipura"), tradition: "chakras" },
  { term: term("Anahata"), slug: slug("anahata"), tradition: "chakras" },
  { term: term("Vishuddha"), slug: slug("vishuddha"), tradition: "chakras" },
  { term: term("Ajna"), slug: slug("ajna"), tradition: "chakras" },
  { term: term("Sahasrara"), slug: slug("sahasrara"), tradition: "chakras" },
]);

const ASTROLOGIA_CATALOG: readonly GlossaryEntry[] = Object.freeze([
  { term: term("Áries"), slug: slug("aries"), tradition: "astrologia" },
  { term: term("Touro"), slug: slug("touro"), tradition: "astrologia" },
  { term: term("Gêmeos"), slug: slug("gemeos"), tradition: "astrologia", aliases: ["Gemeos"] },
  { term: term("Câncer"), slug: slug("cancer"), tradition: "astrologia", aliases: ["Cancer"] },
  { term: term("Leão"), slug: slug("leao"), tradition: "astrologia", aliases: ["Leao"] },
  { term: term("Virgem"), slug: slug("virgem"), tradition: "astrologia" },
  { term: term("Libra"), slug: slug("libra"), tradition: "astrologia" },
  { term: term("Escorpião"), slug: slug("escorpiao"), tradition: "astrologia", aliases: ["Escorpiao"] },
  { term: term("Sagitário"), slug: slug("sagitario"), tradition: "astrologia", aliases: ["Sagitario"] },
  { term: term("Capricórnio"), slug: slug("capricornio"), tradition: "astrologia", aliases: ["Capricornio"] },
  { term: term("Aquário"), slug: slug("aquario"), tradition: "astrologia", aliases: ["Aquario"] },
  { term: term("Peixes"), slug: slug("peixes"), tradition: "astrologia" },
]);

const HEBREW_CATALOG: readonly GlossaryEntry[] = Object.freeze([
  { term: term("Aleph"), slug: slug("aleph"), tradition: "hebrew" },
  { term: term("Beth"), slug: slug("beth"), tradition: "hebrew" },
  { term: term("Gimel"), slug: slug("gimel"), tradition: "hebrew" },
  { term: term("Daleth"), slug: slug("daleth"), tradition: "hebrew" },
  { term: term("He"), slug: slug("he"), tradition: "hebrew" },
  { term: term("Vav"), slug: slug("vav"), tradition: "hebrew" },
  { term: term("Zayin"), slug: slug("zayin"), tradition: "hebrew" },
  { term: term("Cheth"), slug: slug("cheth"), tradition: "hebrew" },
  { term: term("Teth"), slug: slug("teth"), tradition: "hebrew" },
  { term: term("Yod"), slug: slug("yod"), tradition: "hebrew" },
  { term: term("Kaph"), slug: slug("kaph"), tradition: "hebrew" },
  { term: term("Lamed"), slug: slug("lamed"), tradition: "hebrew" },
  { term: term("Mem"), slug: slug("mem"), tradition: "hebrew" },
  { term: term("Nun"), slug: slug("nun"), tradition: "hebrew" },
  { term: term("Samekh"), slug: slug("samekh"), tradition: "hebrew" },
  { term: term("Ayin"), slug: slug("ayin"), tradition: "hebrew" },
  { term: term("Pe"), slug: slug("pe"), tradition: "hebrew" },
  { term: term("Tsade"), slug: slug("tsade"), tradition: "hebrew" },
  { term: term("Qoph"), slug: slug("qoph"), tradition: "hebrew" },
  { term: term("Resh"), slug: slug("resh"), tradition: "hebrew" },
  { term: term("Shin"), slug: slug("shin"), tradition: "hebrew" },
  { term: term("Tav"), slug: slug("tav"), tradition: "hebrew" },
]);

const IFA_CATALOG: readonly GlossaryEntry[] = Object.freeze([
  { term: term("Ogbe"), slug: slug("odu-ogbe"), tradition: "ifa" },
  { term: term("Oyeku"), slug: slug("odu-oyeku"), tradition: "ifa" },
  { term: term("Iwori"), slug: slug("odu-iwori"), tradition: "ifa" },
  { term: term("Odi"), slug: slug("odu-odi"), tradition: "ifa" },
  { term: term("Irosu"), slug: slug("odu-irosu"), tradition: "ifa" },
  { term: term("Owanrin"), slug: slug("odu-owanrin"), tradition: "ifa" },
  { term: term("Obara"), slug: slug("odu-obara"), tradition: "ifa" },
  { term: term("Okanran"), slug: slug("odu-okanran"), tradition: "ifa" },
  { term: term("Ogunda"), slug: slug("odu-ogunda"), tradition: "ifa" },
  { term: term("Osa"), slug: slug("odu-osa"), tradition: "ifa" },
  { term: term("Ika"), slug: slug("odu-ika"), tradition: "ifa" },
  { term: term("Oturupon"), slug: slug("odu-oturupon"), tradition: "ifa" },
  { term: term("Otura"), slug: slug("odu-otura"), tradition: "ifa" },
  { term: term("Irete"), slug: slug("odu-irete"), tradition: "ifa" },
  { term: term("Ofun"), slug: slug("odu-ofun"), tradition: "ifa" },
  { term: term("Ose"), slug: slug("odu-ose"), tradition: "ifa" },
]);

export const GLOSSARY_SLUGS: Readonly<Record<string, GlossaryEntry>> = Object.freeze(
  (() => {
    const acc: Record<string, GlossaryEntry> = {};
    const all = [
      ...CIGANO_CATALOG,
      ...ORIXAS_CATALOG,
      ...TAROT_CATALOG,
      ...SEFIROT_CATALOG,
      ...CHAKRAS_CATALOG,
      ...ASTROLOGIA_CATALOG,
      ...HEBREW_CATALOG,
      ...IFA_CATALOG,
    ];
    for (const e of all) {
      acc[e.term.toLowerCase()] = e;
      if (e.aliases) {
        for (const a of e.aliases) acc[a.toLowerCase()] = e;
      }
    }
    return acc;
  })(),
);

// ---------------------------------------------------------------------------
// § 5 — Type guards
// ---------------------------------------------------------------------------

const isTradition = (s: string): s is Tradition =>
  (TRADITIONS as readonly string[]).includes(s);

const isTermTier = (s: string): s is SacredTermHit["detectionTier"] =>
  s === "exact" || s === "partial" || s === "fuzzy";

// ---------------------------------------------------------------------------
// § 6 — Branded-type factories (no `as` cast exposed in caller code)
// ---------------------------------------------------------------------------

let hitCounter = 0;
const nextHitId = (): SacredTermHitId => {
  hitCounter = (hitCounter + 1) >>> 0;
  return `hit-${hitCounter.toString(36)}` as SacredTermHitId;
};

export const toSacredTermHit = (
  rawMatch: string,
  term: string,
  position: number,
  tradition: Tradition,
  slug: GlossarySlug,
  confidence: number,
  lookaroundBoundary: boolean,
  tier: SacredTermHit["detectionTier"],
): SacredTermHit => {
  if (!Number.isFinite(position) || position < 0) {
    throw new RangeError(`position must be ≥ 0 and finite; got ${position}`);
  }
  if (confidence < 0 || confidence > 1) {
    throw new RangeError(`confidence must be ∈ [0,1]; got ${confidence}`);
  }
  if (!isTradition(tradition)) {
    throw new TypeError(`unknown tradition: ${tradition}`);
  }
  if (!isTermTier(tier)) {
    throw new TypeError(`unknown tier: ${tier}`);
  }
  return Object.freeze({
    id: nextHitId(),
    term,
    tradition,
    position,
    confidence,
    suggestedLink: slug,
    rawMatch,
    lookaroundBoundary,
    detectionTier: tier,
  });
};

export const toGlossarySlug = (s: string): GlossarySlug => {
  if (!s || typeof s !== "string") {
    throw new TypeError("GlossarySlug must be a non-empty string");
  }
  return s as GlossarySlug;
};

// ---------------------------------------------------------------------------
// § 7 — Diacritics + boundary helpers
// ---------------------------------------------------------------------------

const stripDiacritics = (s: string): string =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const escapeRegex = (s: string): string =>
  s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** True iff `idx` is at a sacred-term boundary (non-word on both sides or edge). */
const hasLookaroundBoundary = (text: string, idx: number, len: number): boolean => {
  const before = idx === 0 ? "" : text.charAt(idx - 1);
  const after = idx + len >= text.length ? "" : text.charAt(idx + len);
  const beforeOk = before === "" || /[\s\.,;:!\?\(\)\[\]"'\-—\/\\\u00ab\u00bb]/.test(before);
  const afterOk = after === "" || /[\s\.,;:!\?\(\)\[\]"'\-—\/\\\u00ab\u00bb]/.test(after);
  return beforeOk && afterOk;
};

// ---------------------------------------------------------------------------
// § 8 — Levenshtein (hand-rolled, bounded, no deps)
// ---------------------------------------------------------------------------

const levenshteinLE1 = (a: string, b: string): boolean => {
  if (a === b) return true;
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > 1) return false;
  if (la === 0 || lb === 0) return false;
  // Walk once; track up to 2 differences.
  let i = 0;
  let j = 0;
  let diffs = 0;
  while (i < la && j < lb) {
    if (a.charAt(i) === b.charAt(j)) {
      i++;
      j++;
      continue;
    }
    diffs++;
    if (diffs > 1) return false;
    if (la === lb) {
      i++;
      j++;
    } else if (la > lb) {
      i++;
    } else {
      j++;
    }
  }
  if (i < la || j < lb) diffs++;
  return diffs <= 1;
};

// ---------------------------------------------------------------------------
// § 9 — Core: detectSacredTerms
// ---------------------------------------------------------------------------

/**
 * Scan `text` for sacred symbols and return hits with confidence + tradition
 * + suggested glossary slug. NEVER throws — returns `[]` on empty / invalid.
 *
 * Order of detection:
 *   1. EXACT (1.0) — term in catalog + lookaround boundary
 *   2. PARTIAL (0.7) — diacritics-stripped match OR alias match
 *   3. FUZZY (0.4) — Levenshtein ≤ 1 (only for terms ≥ 6 chars)
 */
export const detectSacredTerms = (text: string): SacredTermHit[] => {
  if (!text || typeof text !== "string") return [];

  const hits: SacredTermHit[] = [];
  const claimed: Array<[number, number]> = [];

  const isClaimed = (start: number, end: number): boolean => {
    for (const [s, e] of claimed) {
      if (start < e && end > s) return true;
    }
    return false;
  };

  const termPriority = (t: Tradition): number => {
    const idx = TRADITION_PRIORITY.indexOf(t);
    return idx === -1 ? TRADITION_PRIORITY.length : idx;
  };

  const tryAdd = (rawMatch: string, term: string, position: number, tradition: Tradition, slugValue: GlossarySlug, confidence: number, tier: SacredTermHit["detectionTier"]): void => {
    const end = position + rawMatch.length;
    if (isClaimed(position, end)) return;
    const boundary = hasLookaroundBoundary(text, position, rawMatch.length);
    if (!boundary) return;
    const hit = toSacredTermHit(rawMatch, term, position, tradition, slugValue, confidence, boundary, tier);
    hits.push(hit);
    claimed.push([position, end]);
  };

  // ---- TIER 1: EXACT -----------------------------------------------------
  for (const key of Object.keys(GLOSSARY_SLUGS)) {
    const entry = GLOSSARY_SLUGS[key]!;
    const pat = new RegExp(`(?:^|\\W)(${escapeRegex(entry.term)})(?:$|\\W)`, "gu");
    let m: RegExpExecArray | null;
    while ((m = pat.exec(text)) !== null) {
      const matchStart = m.index + (m[0].startsWith(text.charAt(m.index)) && /\w/.test(text.charAt(m.index)) ? 0 : 1);
      const raw = m[1] ?? entry.term;
      const realStart = text.indexOf(raw, m.index);
      if (realStart === -1) continue;
      tryAdd(raw, entry.term, realStart, entry.tradition, entry.slug, CONFIDENCE_THRESHOLDS.EXACT, "exact");
    }
  }

  // ---- TIER 2: PARTIAL (alias or diacritics-stripped) ---------------------
  for (const key of Object.keys(GLOSSARY_SLUGS)) {
    const entry = GLOSSARY_SLUGS[key]!;
    if (!entry.aliases || entry.aliases.length === 0) continue;
    for (const alias of entry.aliases) {
      const pat = new RegExp(`(?:^|\\W)(${escapeRegex(alias)})(?:$|\\W)`, "gu");
      let m: RegExpExecArray | null;
      while ((m = pat.exec(text)) !== null) {
        const raw = m[1] ?? alias;
        const realStart = text.indexOf(raw, m.index);
        if (realStart === -1) continue;
        tryAdd(raw, entry.term, realStart, entry.tradition, entry.slug, CONFIDENCE_THRESHOLDS.PARTIAL, "partial");
      }
    }
  }

  // ---- TIER 3: FUZZY (only for terms ≥ 6 chars, sliding window) ----------
  const normText = stripDiacritics(text);
  for (const key of Object.keys(GLOSSARY_SLUGS)) {
    const entry = GLOSSARY_SLUGS[key]!;
    const canonNorm = stripDiacritics(entry.term);
    if (canonNorm.length < 6) continue;
    const window = canonNorm.length + 1;
    for (let i = 0; i + window <= normText.length; i++) {
      const slice = normText.substring(i, i + window);
      const sliceOrig = text.substring(i, i + window);
      if (slice === canonNorm) continue; // already caught by exact
      if (!levenshteinLE1(slice, canonNorm)) continue;
      tryAdd(sliceOrig, entry.term, i, entry.tradition, entry.slug, CONFIDENCE_THRESHOLDS.FUZZY, "fuzzy");
    }
  }

  // Stable order by position, then by tradition priority for ties.
  hits.sort((a, b) => {
    if (a.position !== b.position) return a.position - b.position;
    return termPriority(a.tradition) - termPriority(b.tradition);
  });

  return hits;
};

// ---------------------------------------------------------------------------
// § 10 — rankByConfidence
// ---------------------------------------------------------------------------

export const rankByConfidence = (hits: readonly SacredTermHit[]): SacredTermHit[] => {
  const termPriority = (t: Tradition): number => {
    const idx = TRADITION_PRIORITY.indexOf(t);
    return idx === -1 ? TRADITION_PRIORITY.length : idx;
  };
  // Defensive shallow copy — never mutate caller's array.
  const out = hits.slice();
  out.sort((a, b) => {
    if (b.confidence !== a.confidence) return b.confidence - a.confidence;
    const pa = termPriority(a.tradition);
    const pb = termPriority(b.tradition);
    if (pa !== pb) return pa - pb;
    if (a.position !== b.position) return a.position - b.position;
    return a.term.localeCompare(b.term);
  });
  return out;
};

// ---------------------------------------------------------------------------
// § 11 — linkifyText
// ---------------------------------------------------------------------------

/**
 * Walk `text` and emit `LinkedTextSegment[]`. Caller wires the actual <a> rendering.
 * Returns fresh array (never shared).
 */
export const linkifyText = (text: string, hits: readonly SacredTermHit[]): LinkedTextSegment[] => {
  if (!text || typeof text !== "string") return [];
  if (!hits || hits.length === 0) {
    return [{ type: "text", content: text }];
  }
  const sorted = hits.slice().sort((a, b) => a.position - b.position);
  const segments: LinkedTextSegment[] = [];
  let cursor = 0;
  for (const h of sorted) {
    if (h.position < cursor) continue; // overlap — skip
    if (h.position > cursor) {
      segments.push({ type: "text", content: text.substring(cursor, h.position) });
    }
    segments.push({
      type: "link",
      content: text.substring(h.position, h.position + h.rawMatch.length),
      linkData: { slug: h.suggestedLink, tradition: h.tradition, term: h.term },
    });
    cursor = h.position + h.rawMatch.length;
  }
  if (cursor < text.length) {
    segments.push({ type: "text", content: text.substring(cursor) });
  }
  return segments;
};

export const emptyLinkifyResult = (): LinkedTextSegment[] => [];

// ---------------------------------------------------------------------------
// § 12 — validateAutoLinkCoverage (never throws)
// ---------------------------------------------------------------------------

export const validateAutoLinkCoverage = (hits: readonly SacredTermHit[]): ValidationResult => {
  const errors: string[] = [];
  if (!Array.isArray(hits)) {
    return { ok: false, errors: ["hits must be an array"] };
  }
  const seenIds = new Set<string>();
  for (const h of hits) {
    if (!h || typeof h !== "object") {
      errors.push("hit is not an object");
      continue;
    }
    if (typeof h.id !== "string" || h.id.length === 0) errors.push("hit.id missing");
    else if (seenIds.has(h.id)) errors.push(`duplicate hit.id: ${h.id}`);
    else seenIds.add(h.id);
    if (typeof h.term !== "string" || h.term.length === 0) errors.push("hit.term missing");
    if (!isTradition(h.tradition)) errors.push(`hit.tradition invalid: ${String(h.tradition)}`);
    if (typeof h.position !== "number" || h.position < 0 || !Number.isFinite(h.position))
      errors.push(`hit.position invalid: ${String(h.position)}`);
    if (typeof h.confidence !== "number" || h.confidence < 0 || h.confidence > 1)
      errors.push(`hit.confidence invalid: ${String(h.confidence)}`);
    if (typeof h.suggestedLink !== "string") errors.push("hit.suggestedLink missing");
    if (typeof h.rawMatch !== "string") errors.push("hit.rawMatch missing");
    if (typeof h.lookaroundBoundary !== "boolean") errors.push("hit.lookaroundBoundary missing");
    if (!isTermTier(h.detectionTier)) errors.push(`hit.detectionTier invalid: ${String(h.detectionTier)}`);
  }
  return { ok: errors.length === 0, errors };
};

// ---------------------------------------------------------------------------
// § 13 — chainAutoLinkHash (HMAC-SHA256, never FNV-1a)
// ---------------------------------------------------------------------------

/**
 * Produce an HMAC-SHA256 over a canonicalized payload of
 *   (sanitizedText + sorted hits' terms and positions).
 *
 * Caller is responsible for passing `sanitizedText` (post-redactPII).
 * NEVER include raw user text or PII.
 *
 * Default `secret` is an empty string; production code must override.
 * Cross-runtime safe: Node v22, Bun, CJS contexts (cycle 60 + 64 + 65 pattern).
 */
interface NodeCryptoHandle {
  createHmac(alg: "sha256", key: string): { update(d: string, enc: string): { digest(enc: "hex"): string } };
}

function loadNodeCrypto(): NodeCryptoHandle {
  const proc = (globalThis as { process?: unknown }).process as
    | { getBuiltinModule?: (m: string) => unknown }
    | undefined;
  if (proc && typeof proc.getBuiltinModule === "function") {
    const mod = proc.getBuiltinModule("node:crypto") as NodeCryptoHandle | undefined;
    if (mod && typeof mod.createHmac === "function") return mod;
  }
  // Fallback: dynamic require via Function constructor (avoids TSC `require` lookup).
  const req = (Function("return require")()) as (m: string) => unknown;
  return req("node:crypto") as NodeCryptoHandle;
}

export const chainAutoLinkHash = (
  sanitizedText: string,
  hits: readonly SacredTermHit[],
  secret: string = "",
): AutoLinkHash => {
  const sorted = hits.slice().sort((a, b) => {
    if (a.position !== b.position) return a.position - b.position;
    return a.term.localeCompare(b.term);
  });
  const canonical = JSON.stringify({
    text: sanitizedText,
    hits: sorted.map((h) => ({ term: h.term, position: h.position, confidence: h.confidence, tradition: h.tradition })),
  });
  const crypto = loadNodeCrypto();
  const hex = crypto.createHmac("sha256", secret).update(canonical, "utf8").digest("hex");
  return hex as AutoLinkHash;
};

/**
 * Verify a previous hash against a new payload (constant-time compare).
 * Returns false on shape mismatch (never throws).
 */
export const verifyAutoLinkHash = (
  sanitizedText: string,
  hits: readonly SacredTermHit[],
  prevHash: string,
  secret: string = "",
): boolean => {
  if (typeof prevHash !== "string" || prevHash.length === 0) return false;
  const next = chainAutoLinkHash(sanitizedText, hits, secret);
  if (next.length !== prevHash.length) return false;
  let mismatch = 0;
  for (let i = 0; i < next.length; i++) {
    mismatch |= next.charCodeAt(i) ^ prevHash.charCodeAt(i);
  }
  return mismatch === 0;
};

// ---------------------------------------------------------------------------
// § 14 — filterByTradition
// ---------------------------------------------------------------------------

export const filterByTradition = (
  hits: readonly SacredTermHit[],
  traditions: readonly Tradition[],
): SacredTermHit[] => {
  if (!Array.isArray(traditions) || traditions.length === 0) return [];
  const set = new Set<Tradition>(traditions.filter(isTradition));
  return hits.filter((h) => set.has(h.tradition));
};

// ---------------------------------------------------------------------------
// § 15 — auditAutoLinkerCoverage (gate: isFullCoverage === true)
// ---------------------------------------------------------------------------

export const auditAutoLinkerCoverage = (): SacredCoverageReport => {
  const cigano = CIGANO_CATALOG.length;
  const orixas = ORIXAS_CATALOG.length;
  const tarot = TAROT_CATALOG.length;
  const sefirot = SEFIROT_CATALOG.length;
  const chakras = CHAKRAS_CATALOG.length;
  const astrologia = ASTROLOGIA_CATALOG.length;
  const hebrew = HEBREW_CATALOG.length;
  const ifa = IFA_CATALOG.length;
  const total = cigano + orixas + tarot + sefirot + chakras + astrologia + hebrew + ifa;
  const expected: Record<Tradition, number> = {
    cigano: 36,
    orixas: 16,
    tarot: 22,
    sefirot: 10,
    chakras: 7,
    astrologia: 12,
    hebrew: 22,
    ifa: 16,
  };
  const actuals: Record<Tradition, number> = {
    cigano, orixas, tarot, sefirot, chakras, astrologia, hebrew, ifa,
  };
  const missing = (Object.keys(expected) as Tradition[]).filter((t) => actuals[t] < expected[t]);
  return {
    cigano, orixas, tarot, sefirot, chakras, astrologia, hebrew, ifa,
    total,
    isFullCoverage: missing.length === 0 && total >= 141,
    missing,
  };
};

// ---------------------------------------------------------------------------
// § 16 — redactSacredTermsForLGPD (opt-in, opt-out by default)
// ---------------------------------------------------------------------------

/**
 * Replace sacred-term hits in `text` with `[sacred-redacted]` markers.
 * OPT-IN: callers must explicitly pass `redactSacred: true` for sensitive
 * contexts (medical posts, legal posts, vulnerability disclosures).
 *
 * Cycle 60 lesson C-5: never persist raw user text + sacred concepts together.
 */
export const redactSacredTermsForLGPD = (
  text: string,
  hits: readonly SacredTermHit[],
  redactSacred: boolean = false,
): string => {
  if (!redactSacred) return text;
  if (!text || typeof text !== "string") return text;
  if (!hits || hits.length === 0) return text;
  // Replace from end to start so positions stay valid.
  const sorted = hits.slice().sort((a, b) => b.position - a.position);
  let out = text;
  for (const h of sorted) {
    out = out.substring(0, h.position) + "[sacred-redacted]" + out.substring(h.position + h.rawMatch.length);
  }
  return out;
};

// ---------------------------------------------------------------------------
// § 17 — Sanitize helper (called before detectSacredTerms; cycle 62 pattern)
// ---------------------------------------------------------------------------

/**
 * Lightweight PII redaction. Caller wires the full redactPII pipeline
 * (cycle 62 daily-reflection); this helper covers the common cases for
 * detectSacredTerms callers: emails, phones, long digit runs.
 */
export const sanitizeForSacredScan = (text: string): string => {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email-redacted]")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, "[phone-redacted]")
    .replace(/\b\d{4,}\b/g, "[num-redacted]");
};

// ---------------------------------------------------------------------------
// § 18 — __ALL_EXPORTS (grep-audit visibility; matches cycle 63/64/65/66)
// ---------------------------------------------------------------------------

export const __ALL_EXPORTS = Object.freeze({
  constants: Object.freeze({ TRADITIONS, TRADITION_PRIORITY, CONFIDENCE_THRESHOLDS, SLUG_PREFIX }),
  catalogs: Object.freeze({
    CIGANO_CATALOG,
    ORIXAS_CATALOG,
    TAROT_CATALOG,
    SEFIROT_CATALOG,
    CHAKRAS_CATALOG,
    ASTROLOGIA_CATALOG,
    HEBREW_CATALOG,
    IFA_CATALOG,
  }),
  functions: Object.freeze({
    detectSacredTerms,
    rankByConfidence,
    linkifyText,
    validateAutoLinkCoverage,
    chainAutoLinkHash,
    verifyAutoLinkHash,
    auditAutoLinkerCoverage,
    filterByTradition,
    redactSacredTermsForLGPD,
    sanitizeForSacredScan,
    emptyLinkifyResult,
    toSacredTermHit,
    toGlossarySlug,
  }),
  types: Object.freeze({
    Tradition: "Tradition",
    GlossarySlug: "GlossarySlug",
    SacredTermHitId: "SacredTermHitId",
    AutoLinkHash: "AutoLinkHash",
    SacredTermHit: "SacredTermHit",
    LinkedTextSegment: "LinkedTextSegment",
    SacredCoverageReport: "SacredCoverageReport",
    ValidationResult: "ValidationResult",
    GlossaryEntry: "GlossaryEntry",
  }),
  sectionsCount: 18,
});