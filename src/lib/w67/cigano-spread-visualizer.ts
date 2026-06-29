// src/lib/w67/cigano-spread-visualizer.ts
// Cycle 67 Worker A — CIGANO SPREAD VISUALIZER (Mesa Real data layer)
// Pure data engine: builds 36-card 6x6 + 5 alternate layouts from a seed,
// emits deterministic grid positions, highlights sacred tags, builds pt-BR
// accessibility description, validates structural integrity, and seals the
// grid via HMAC-SHA256 chain. NO react, NO canvas, NO DOM.
//
// Per-cycle-67 brief + cross-cycle lessons:
//   - HMAC-SHA256 ONLY (cycle 60 lesson C-1)
//   - Lookaround regex `(?:^|\\W)…(?:$|\\W)` for Portuguese sacred terms (cycle 65 lesson 1)
//   - Branded types, no `as` user-cast, no `any`
//   - `emptyX()` factory, no shared mutable defaults (cycle 65 lesson 6)
//   - Sacred symbols NEVER in raw logs (cycle 60 lesson H-7)
//   - Default null for empty sacred hits (cycle 60 lesson H-9)
//   - Date.now() forbidden in id (cycle 60 lesson H-8) — use HMAC of seed + index
//   - Cross-runtime HMAC via process.getBuiltinModule (cycle 60 + 64)

// Minimal node type shims (no @types/node required for this isolated engine)
declare const process: {
  getBuiltinModule?(m: string): unknown;
};
type NodeRequire = (id: string) => unknown;
declare const require: NodeRequire;

// =====================================================================
// SECTION 1 — TYPES
// =====================================================================

/** Branded string type for Cigano card identifiers (1..36 string-encoded). */
export type CiganoCardId = string & { readonly __brand: "CiganoCardId" };

/** Branded string type for layout slugs (e.g. "STANDARD_6X6"). */
export type GridLayoutSlug = string & { readonly __brand: "GridLayoutSlug" };

/** Branded string type for grid seed (free-form, HMAC-normalized). */
export type GridSeed = string & { readonly __brand: "GridSeed" };

/** Sacred tag values (multi-tradition). */
export type SacredTag =
  | "oxala" | "ogum" | "oxossi" | "xango" | "iemanja" | "iansa"
  | "omolu" | "oxum" | "obaluae" | "nanã" | "ibezumi" | "exu"
  | "pomba-gira" | "oxumarê" | "logun-ede" | "iama-já"
  | "kether" | "chokmah" | "binah" | "chesed" | "gevurah" | "tiphereth"
  | "netzach" | "hod" | "yesod" | "malkuth"
  | "aries" | "taurus" | "gemini" | "cancer" | "leo" | "virgo"
  | "libra" | "scorpio" | "sagittarius" | "capricorn" | "aquarius" | "pisces"
  | "coroa" | "terceiro-olho" | "garganta" | "coracao" | "plexo-solar"
  | "sacral" | "raiz";

export type SacredTradition =
  | "orixas" | "sefirot" | "astrologia" | "chakras" | "cigano";

export type HighlightLevel = "none" | "soft" | "strong" | "primary";

/** Set of sacred tags the user is interested in (drawn from any tradition). */
export interface SacredTagSet {
  readonly tags: ReadonlyArray<SacredTag>;
  readonly tradition: SacredTradition;
}

export interface CiganoCard {
  readonly id: CiganoCardId;
  readonly name: string;
  readonly number: number; // 1..36
  readonly sacredTags: ReadonlyArray<SacredTag>;
  readonly shortMeaning: string;
  readonly longMeaning: string;
}

export interface GridPosition {
  readonly row: number; // 0-based
  readonly col: number; // 0-based
  readonly cardId: CiganoCardId;
  readonly slot: number; // 0-based slot index in layout
  readonly highlightLevel?: HighlightLevel;
}

export interface A11yGridDescription {
  readonly lines: ReadonlyArray<string>;
  readonly totalSlots: number;
  readonly layoutSlug: string;
}

export type GridValidation =
  | { readonly ok: true }
  | { readonly ok: false; readonly errors: ReadonlyArray<string> };

export interface SacredCoverageReport {
  readonly cigano: number;
  readonly orixas: number;
  readonly sefirot: number;
  readonly astrologia: number;
  readonly chakras: number;
  readonly total: number;
  readonly isFullCoverage: boolean;
  readonly uncoveredSymbols: ReadonlyArray<string>;
}

export interface ChainHashResult {
  readonly hash: string;
  readonly slot: number;
  readonly cardId: CiganoCardId;
}

export interface GridLayoutDef {
  readonly slug: GridLayoutSlug;
  readonly displayName: string;
  readonly slots: number; // expected slot count
  readonly rows: number;
  readonly cols: number;
  readonly slotCenters: ReadonlyArray<{ readonly row: number; readonly col: number }>;
}

// =====================================================================
// SECTION 2 — CRYPTO HELPERS (cycle 60 + 64 HMAC pattern)
// =====================================================================

interface NodeCryptoHandle {
  createHmac(alg: "sha256", key: string): { update(d: string): { digest(): string } };
  createHash(alg: "sha256"): { update(d: string): { digest(): string } };
}

function loadNodeCrypto(): NodeCryptoHandle {
  const proc = process as unknown as { getBuiltinModule?: (m: string) => unknown };
  if (typeof proc.getBuiltinModule === "function") {
    const mod = proc.getBuiltinModule("node:crypto") as NodeCryptoHandle;
    if (mod && typeof mod.createHmac === "function") return mod;
  }
  // Fallback: require via dynamic require (works in Node 18+ + Bun)
  const req = (Function("return require")()) as NodeRequire;
  return req("node:crypto") as NodeCryptoHandle;
}

function hmacSha256Hex(key: string, payload: string): string {
  const crypto = loadNodeCrypto();
  const out = crypto.createHmac("sha256", key).update(payload).digest();
  return typeof out === "string" ? out : (out as unknown as { toString(enc: string): string }).toString("hex");
}

function sha256Hex(payload: string): string {
  const crypto = loadNodeCrypto();
  const out = crypto.createHash("sha256").update(payload).digest();
  return typeof out === "string" ? out : (out as unknown as { toString(enc: string): string }).toString("hex");
}

/** Normalize seed by collapsing whitespace + clamping length. Deterministic. */
export function normalizeSeed(raw: string): GridSeed {
  const cleaned = raw.trim().slice(0, 256).replace(/\s+/g, "-");
  return cleaned as GridSeed;
}

// =====================================================================
// SECTION 3 — BRANDED CONSTRUCTORS
// =====================================================================

const CIGANO_ID_RE = /^c-([1-9]|[1-2][0-9]|3[0-6])$/;

export function toCiganoCardId(s: string): CiganoCardId {
  if (!CIGANO_ID_RE.test(s)) {
    throw new Error(`invalid CiganoCardId: ${s}`);
  }
  return s as CiganoCardId;
}

export function toCiganoCardIdFromNumber(n: number): CiganoCardId {
  if (!Number.isInteger(n) || n < 1 || n > 36) {
    throw new Error(`Cigano card number out of range: ${n}`);
  }
  return `c-${n}` as CiganoCardId;
}

export function toGridLayoutSlug(s: string): GridLayoutSlug {
  if (s.length === 0 || s.length > 64) {
    throw new Error(`invalid layout slug: length ${s.length}`);
  }
  return s as GridLayoutSlug;
}

export const GRID_LAYOUTS = {
  STANDARD_6X6: toGridLayoutSlug("STANDARD_6X6"),
  GRAND_TABLEAU_8X5: toGridLayoutSlug("GRAND_TABLEAU_8X5"),
  LINE_OF_5: toGridLayoutSlug("LINE_OF_5"),
  DIAMOND: toGridLayoutSlug("DIAMOND"),
  CASTLE_4X4: toGridLayoutSlug("CASTLE_4X4"),
  HORSESHOE: toGridLayoutSlug("HORSESHOE"),
} as const;

export type GridLayoutKey = keyof typeof GRID_LAYOUTS;

// =====================================================================
// SECTION 4 — LAYOUT GEOMETRY (5 alt + 1 standard)
// =====================================================================

const STANDARD_6X6_SLOTS: ReadonlyArray<{ row: number; col: number }> = (() => {
  const out: { row: number; col: number }[] = [];
  for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) out.push({ row: r, col: c });
  return out;
})();

const GRAND_TABLEAU_8X5_SLOTS: ReadonlyArray<{ row: number; col: number }> = (() => {
  // 8 cols × 5 rows = 40 slots; uses 36 + 4 indicators (significator + advice + sum + clef)
  const out: { row: number; col: number }[] = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) out.push({ row: r, col: c });
  return out;
})();

const LINE_OF_5_SLOTS: ReadonlyArray<{ row: number; col: number }> = [
  { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 },
  { row: 0, col: 3 }, { row: 0, col: 4 },
];

const DIAMOND_SLOTS: ReadonlyArray<{ row: number; col: number }> = [
  { row: 0, col: 2 },          // top
  { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 3 },
  { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 }, { row: 2, col: 3 }, { row: 2, col: 4 }, // middle
  { row: 3, col: 1 }, { row: 3, col: 2 }, { row: 3, col: 3 },
  { row: 4, col: 2 },          // bottom
];

const CASTLE_4X4_SLOTS: ReadonlyArray<{ row: number; col: number }> = (() => {
  // 4×4 = 16 cards, leaves 20 cards unplaced (used for cross-card reading)
  const out: { row: number; col: number }[] = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) out.push({ row: r, col: c });
  return out;
})();

const HORSESHOE_SLOTS: ReadonlyArray<{ row: number; col: number }> = [
  { row: 0, col: 0 }, { row: 0, col: 5 },
  { row: 1, col: 0 }, { row: 1, col: 5 },
  { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 4 }, { row: 2, col: 5 },
  { row: 3, col: 2 }, { row: 3, col: 3 },
];

export const LAYOUT_DEFINITIONS: ReadonlyArray<GridLayoutDef> = [
  {
    slug: GRID_LAYOUTS.STANDARD_6X6,
    displayName: "Grade 6×6 Padrão",
    slots: 36,
    rows: 6,
    cols: 6,
    slotCenters: STANDARD_6X6_SLOTS,
  },
  {
    slug: GRID_LAYOUTS.GRAND_TABLEAU_8X5,
    displayName: "Grande Tableau (8×5)",
    slots: 40,
    rows: 5,
    cols: 8,
    slotCenters: GRAND_TABLEAU_8X5_SLOTS,
  },
  {
    slug: GRID_LAYOUTS.LINE_OF_5,
    displayName: "Linha de 5",
    slots: 5,
    rows: 1,
    cols: 5,
    slotCenters: LINE_OF_5_SLOTS,
  },
  {
    slug: GRID_LAYOUTS.DIAMOND,
    displayName: "Diamante",
    slots: 13,
    rows: 5,
    cols: 5,
    slotCenters: DIAMOND_SLOTS,
  },
  {
    slug: GRID_LAYOUTS.CASTLE_4X4,
    displayName: "Castelo 4×4",
    slots: 16,
    rows: 4,
    cols: 4,
    slotCenters: CASTLE_4X4_SLOTS,
  },
  {
    slug: GRID_LAYOUTS.HORSESHOE,
    displayName: "Ferradura",
    slots: 10,
    rows: 4,
    cols: 6,
    slotCenters: HORSESHOE_SLOTS,
  },
];

export function getLayoutDef(slug: GridLayoutSlug): GridLayoutDef {
  const def = LAYOUT_DEFINITIONS.find((d) => d.slug === slug);
  if (!def) throw new Error(`unknown layout slug: ${slug}`);
  return def;
}

// =====================================================================
// SECTION 5 — 36 CIGANO CARD CATALOG (NO Lenormand "L'Homme/La Femme")
// =====================================================================
// Per user preference: 28=Cigano, 29=Cigana (NOT Lenormand's "L'Homme/La Femme")
// Each card carries multi-tradition sacred tags.

interface RawCard {
  number: number;
  name: string;
  short: string;
  long: string;
  tags: ReadonlyArray<SacredTag>;
}

const RAW_CIGANO_CARDS: ReadonlyArray<RawCard> = [
  { number: 1,  name: "Cavaleiro",       short: "O mensageiro, portador da notícia", long: "O Cavaleiro traz uma mensagem do plano espiritual; em leitura cigana indica movimento rápido, novidade e anúncio.", tags: ["ogum", "kether", "aries", "coroa"] },
  { number: 2,  name: "Trevo",           short: "Sorte passageira",                 long: "O Trevo mostra que a sorte está ao alcance, mas pede atenção para não desperdiçar a oportunidade.", tags: ["oxossi", "chokmah", "taurus", "terceiro-olho"] },
  { number: 3,  name: "Navio",           short: "Viagem e prosperidade",            long: "O Navio sinaliza uma viagem, um empreendimento distante ou comércio que traz ganhos materiais.", tags: ["iemanja", "binah", "cancer", "garganta"] },
  { number: 4,  name: "Casa",            short: "Lar, estabilidade",                long: "A Casa representa o lar, a família, a base emocional e a segurança construída ao longo do tempo.", tags: ["obaluae", "chesed", "leo", "coracao"] },
  { number: 5,  name: "Árvore",          short: "Saúde e crescimento",              long: "A Árvore fala de saúde, vitalidade e do crescimento lento e constante das raízes profundas.", tags: ["oxossi", "gevurah", "virgo", "raiz"] },
  { number: 6,  name: "Nuvens",          short: "Confusão passageira",              long: "As Nuvens mostram que algo está encoberto; é preciso paciência até a clareza retornar.", tags: ["iansa", "tiphereth", "libra", "plexo-solar"] },
  { number: 7,  name: "Cobra",           short: "Astúcia, falsidade",               long: "A Cobra aponta para alguém próximo com intenções traiçoeiras ou para padrões de auto-sabotagem.", tags: ["exu", "netzach", "scorpio", "sacral"] },
  { number: 8,  name: "Caixão",          short: "Fim e transformação",              long: "O Caixão indica o fim de um ciclo; a Cigana Ramiro lê como transformação energética, não morte.", tags: ["omolu", "hod", "sagittarius", "raiz"] },
  { number: 9,  name: "Flores",          short: "Alegria, contentamento",           long: "As Flores alegram a mesa; indicam contentamento, reconhecimento e bons fluidos ao redor.", tags: ["oxum", "yesod", "leo", "sacral"] },
  { number: 10, name: "Foice",           short: "Corte, decisão",                   long: "A Foice corta o que precisa ser cortado; pede uma decisão firme e corajosa.", tags: ["xango", "malkuth", "capricorn", "coracao"] },
  { number: 11, name: "Vassoura",        short: "Limpeza e cura",                   long: "A Vassoura varre energias estagnadas; pede uma limpeza espiritual ou física do ambiente.", tags: ["pomba-gira", "tiphereth", "virgo", "plexo-solar"] },
  { number: 12, name: "Corujas",         short: "Fofoca, escuta atenta",            long: "As Corujas avisam sobre fofocas ou sobre pessoas escutando conversas íntimas.", tags: ["exu", "hod", "scorpio", "garganta"] },
  { number: 13, name: "Criança",         short: "Inocência, início",                long: "A Criança traz a energia do novo; é o início de uma jornada marcada por curiosidade.", tags: ["ibezumi", "kether", "aries", "coroa"] },
  { number: 14, name: "Raposa",          short: "Auto-cuidado, astúcia",            long: "A Raposa sugere cautela com promessas; protege o consulente de intenções escondidas.", tags: ["exu", "chokmah", "gemini", "terceiro-olho"] },
  { number: 15, name: "Urso",            short: "Força e proteção",                 long: "O Urso é guardião; protege a casa e a família e pede firmeza nas decisões.", tags: ["ogum", "gevurah", "taurus", "raiz"] },
  { number: 16, name: "Estrelas",        short: "Esperança e orientação",           long: "As Estrelas abrem o caminho à noite; sinalizam que a espiritualidade guia o momento.", tags: ["oxala", "binah", "aquarius", "terceiro-olho"] },
  { number: 17, name: "Cegonha",         short: "Mudança e parto",                  long: "A Cegonha anuncia mudança importante, mudança de casa ou nascimento de projeto.", tags: ["iansa", "chesed", "cancer", "sacral"] },
  { number: 18, name: "Cachorro",        short: "Amizade fiel",                     long: "O Cachorro representa o amigo verdadeiro, a lealdade e o vínculo de proteção mútua.", tags: ["ogum", "tiphereth", "leo", "coracao"] },
  { number: 19, name: "Torre",           short: "Isolamento e força",               long: "A Torre aponta para a força solitária; pode ser um período de introspecção necessária.", tags: ["oxumarê", "netzach", "capricorn", "raiz"] },
  { number: 20, name: "Jardim",          short: "Comunidade, círculo",              long: "O Jardim mostra o círculo social, a comunidade e o reconhecimento público.", tags: ["oxum", "yesod", "libra", "sacral"] },
  { number: 21, name: "Montanha",        short: "Desafio e bloqueio",               long: "A Montanha ergue obstáculos; pede persistência e estratégia para atravessar.", tags: ["xango", "gevurah", "capricorn", "raiz"] },
  { number: 22, name: "Encruzilhada",    short: "Escolha, decisão",                 long: "A Encruzilhada mostra que há caminhos múltiplos; pede decisão consciente entre eles.", tags: ["exu", "chokmah", "gemini", "terceiro-olho"] },
  { number: 23, name: "Ratos",           short: "Perda gradual, erosão",            long: "Os Ratos corroem o que está sendo negligenciado; pedem atenção a pequenas perdas.", tags: ["omolu", "hod", "scorpio", "raiz"] },
  { number: 24, name: "Coração",         short: "Amor e afetividade",               long: "O Coração é o centro da mesa; aponta diretamente para o amor e a vida emocional.", tags: ["oxum", "tiphereth", "leo", "coracao"] },
  { number: 25, name: "Anel",            short: "Compromisso e aliança",            long: "O Anel selou pacto; significa casamento, sociedade ou acordo que precisa ser firmado.", tags: ["iama-já", "chokmah", "libra", "sacral"] },
  { number: 26, name: "Livro",           short: "Conhecimento, mistério",           long: "O Livro guarda saber oculto; pede estudo, leitura e abertura para o aprendizado.", tags: ["obaluae", "binah", "sagittarius", "terceiro-olho"] },
  { number: 27, name: "Carta",           short: "Comunicação, notícia",             long: "A Carta traz uma mensagem escrita; email, papel ou informação que chega.", tags: ["iansa", "hod", "gemini", "garganta"] },
  // 28=Cigano, 29=Cigana per user preference (NOT Lenormand "L'Homme"/"La Femme")
  { number: 28, name: "Cigano",          short: "O mestre cigano",                  long: "O Cigano é a carta do mestre; em leitura indica a figura masculina de autoridade espiritual.", tags: ["xango", "kether", "aries", "coroa"] },
  { number: 29, name: "Cigana",          short: "A mestra cigana",                  long: "A Cigana é a carta da mestra; em leitura indica a figura feminina de sabedoria e cura.", tags: ["nanã", "binah", "taurus", "coroa"] },
  { number: 30, name: "Lírio",           short: "Pureza e maturidade",              long: "O Lírio representa a maturidade, a sexualidade sagrada e a beleza da idade adulta.", tags: ["oxum", "logun-ede", "virgo", "sacral"] },
  { number: 31, name: "Sol",             short: "Clareza, sucesso",                 long: "O Sol ilumina a mesa; mostra que o caminho está claro e o sucesso vem com trabalho.", tags: ["oxala", "yesod", "leo", "coracao"] },
  { number: 32, name: "Lua",             short: "Intuição e recôndito",             long: "A Lua ilumina o inconsciente; pede atenção aos sonhos e ao que se esconde sob a superfície.", tags: ["iemanja", "hod", "cancer", "terceiro-olho"] },
  { number: 33, name: "Chave",           short: "A solução, abertura",              long: "A Chave abre o caminho bloqueado; mostra que a solução está ao alcance do consulente.", tags: ["ogum", "chokmah", "sagittarius", "sacral"] },
  { number: 34, name: "Peixes",          short: "Prosperidade material",            long: "Os Peixes nadam em abundância; sinalizam ganhos financeiros e fluxo de prosperidade.", tags: ["iemanja", "netzach", "pisces", "sacral"] },
  { number: 35, name: "Âncora",          short: "Estabilidade e firmeza",           long: "A Âncora firma o barco; mostra que há estabilidade para atravessar o temporal.", tags: ["iama-já", "malkuth", "aquarius", "raiz"] },
  { number: 36, name: "Cruz",            short: "Karma, fé, provação",              long: "A Cruz é o peso da experiência; pede fé e a aceitação do aprendizado trazido pela provação.", tags: ["xango", "malkuth", "capricorn", "raiz"] },
];

export const CIGANO_DECK: ReadonlyArray<CiganoCard> = RAW_CIGANO_CARDS.map((c) => ({
  id: toCiganoCardIdFromNumber(c.number),
  name: c.name,
  number: c.number,
  sacredTags: c.tags,
  shortMeaning: c.short,
  longMeaning: c.long,
}));

export function cardByNumber(n: number): CiganoCard | null {
  if (!Number.isInteger(n) || n < 1 || n > 36) return null;
  const card = CIGANO_DECK.find((c) => c.number === n);
  return card ?? null;
}

export function cardById(id: CiganoCardId): CiganoCard | null {
  return CIGANO_DECK.find((c) => c.id === id) ?? null;
}

// =====================================================================
// SECTION 6 — SACRED TAG REGISTRY (5 TRADITIONS, 81+ symbols)
// =====================================================================
// All references to Portuguese sacred terms in raw logs MUST go through
// the safeFirstSacredConcept helper (cycle 60 lesson H-7).

export const ORIXAS: ReadonlyArray<SacredTag> = [
  "oxala", "ogum", "oxossi", "xango", "iemanja", "iansa",
  "omolu", "oxum", "obaluae", "nanã", "ibezumi", "exu",
  "pomba-gira", "oxumarê", "logun-ede", "iama-já",
];

export const SEFIROT: ReadonlyArray<SacredTag> = [
  "kether", "chokmah", "binah", "chesed", "gevurah", "tiphereth",
  "netzach", "hod", "yesod", "malkuth",
];

export const ASTROLOGIA: ReadonlyArray<SacredTag> = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
];

export const CHAKRAS: ReadonlyArray<SacredTag> = [
  "coroa", "terceiro-olho", "garganta", "coracao", "plexo-solar",
  "sacral", "raiz",
];

export const SACRED_TAG_TO_TRADITION: ReadonlyMap<SacredTag, SacredTradition> = new Map([
  ...ORIXAS.map((t) => [t, "orixas" as const] as const),
  ...SEFIROT.map((t) => [t, "sefirot" as const] as const),
  ...ASTROLOGIA.map((t) => [t, "astrologia" as const] as const),
  ...CHAKRAS.map((t) => [t, "chakras" as const] as const),
]);

/** Total sacred-tag count across all 5 traditions. */
export const SACRED_SYM_TOTAL: number =
  CIGANO_DECK.length + ORIXAS.length + SEFIROT.length + ASTROLOGIA.length + CHAKRAS.length;

// =====================================================================
// SECTION 7 — TYPE GUARDS + SET HELPERS
// =====================================================================

const SACRED_TAG_SET: ReadonlySet<string> = new Set<string>([
  ...ORIXAS, ...SEFIROT, ...ASTROLOGIA, ...CHAKRAS,
]);

export function isSacredTag(s: string): s is SacredTag {
  return SACRED_TAG_SET.has(s);
}

export function toSacredTagSet(values: ReadonlyArray<string>): SacredTagSet {
  const accepted: SacredTag[] = [];
  let tradition: SacredTradition = "orixas";
  for (const v of values) {
    const t = SACRED_TAG_TO_TRADITION.get(v as SacredTag);
    if (!t) continue;
    tradition = t;
    accepted.push(v as SacredTag);
  }
  // Default to empty result; tradition defaults to "orixas" if no valid tags
  return Object.freeze({
    tags: Object.freeze(accepted) as ReadonlyArray<SacredTag>,
    tradition: accepted.length === 0 ? "orixas" : tradition,
  }) as SacredTagSet;
}

// =====================================================================
// SECTION 8 — HMAC-PRNG (Fisher-Yates seedable shuffle)
// =====================================================================
// HMAC counter mode PRNG. Deterministic from (seed, layout, salt).
// Returns pseudo-random uint32 in [0, 2^32).

function prngUint32(seed: GridSeed, salt: string, counter: number): number {
  // HMAC payload = seed + ":" + salt + ":" + counter (16-bit counter)
  const payload = `${seed}|${salt}|${(counter >>> 0).toString(16)}`;
  // HMAC chain: take first 8 hex chars (32 bits) and parse
  const hex = hmacSha256Hex(seed + "::PRNG_SALT_V1", payload).slice(0, 8);
  // Parse as unsigned 32-bit int (hex)
  return parseInt(hex, 16) >>> 0;
}

/** Fisher-Yates shuffle of provided cardIds using HMAC-PRNG seeded by seed+layout. */
export function shuffleForLayout(
  cardIds: ReadonlyArray<CiganoCardId>,
  layout: GridLayoutSlug,
  seed: GridSeed,
): CiganoCardId[] {
  const arr = cardIds.slice();
  const n = arr.length;
  if (n <= 1) return arr;

  const layoutKey = layout as unknown as string;
  for (let i = n - 1; i > 0; i--) {
    const j = prngUint32(seed, `fisher-yates|${layoutKey}`, n - i) % (i + 1);
    const tmp = arr[i] as CiganoCardId;
    arr[i] = arr[j] as CiganoCardId;
    arr[j] = tmp;
  }
  return arr;
}

// =====================================================================
// SECTION 9 — GRID BUILDERS (6 layouts)
// =====================================================================

/**
 * Build a grid of GridPosition entries for the chosen layout.
 * If cardIds are omitted, uses CIGANO_DECK and shuffles deterministically from seed.
 */
export function buildGrid(
  seed: string,
  layout: GridLayoutSlug,
  cardIds?: ReadonlyArray<CiganoCardId>,
): GridPosition[] {
  const normalizedSeed = normalizeSeed(seed);
  const def = getLayoutDef(layout);

  const defaultDeckIds: ReadonlyArray<CiganoCardId> = cardIds ?? CIGANO_DECK.map((c) => c.id);
  const shuffled = shuffleForLayout(defaultDeckIds, layout, normalizedSeed);

  const grid: GridPosition[] = [];
  const placeCount = Math.min(shuffled.length, def.slotCenters.length);

  for (let slot = 0; slot < placeCount; slot++) {
    const center = def.slotCenters[slot] as { row: number; col: number };
    const cardId = shuffled[slot] as CiganoCardId;
    grid.push({
      row: center.row,
      col: center.col,
      cardId,
      slot,
    });
  }

  return grid;
}

/** Return grid's cardIds in slot order (helper for chain). */
export function cardsInGridOrder(grid: ReadonlyArray<GridPosition>): CiganoCardId[] {
  const sorted = grid.slice().sort((a, b) => a.slot - b.slot);
  return sorted.map((p) => p.cardId);
}

// =====================================================================
// SECTION 10 — HIGHLIGHT SACRED (4-tier rule-based)
// =====================================================================

/**
 * Apply highlightLevel to each GridPosition based on intersection with
 * SacredTagSet:
 *   primary = 2+ traditions intersect
 *   strong  = 1 tradition intersect (with set tradition)
 *   soft    = 1 tradition intersect (off-tradition)
 *   none    = no intersect
 */
export function highlightSacred(
  grid: ReadonlyArray<GridPosition>,
  tags: SacredTagSet,
): GridPosition[] {
  const tagSet = new Set<string>(tags.tags);
  const setTradition = tags.tradition;

  return grid.map((pos) => {
    const card = cardById(pos.cardId);
    if (!card) {
      return { ...pos, highlightLevel: "none" as HighlightLevel };
    }

    let intersectCount = 0;
    let sameTraditionHit = false;
    for (const t of card.sacredTags) {
      if (tagSet.has(t)) {
        intersectCount++;
        const trad = SACRED_TAG_TO_TRADITION.get(t);
        if (trad === setTradition) sameTraditionHit = true;
      }
    }

    let level: HighlightLevel;
    if (intersectCount >= 2) level = "primary";
    else if (sameTraditionHit) level = "strong";
    else if (intersectCount >= 1) level = "soft";
    else level = "none";

    return { ...pos, highlightLevel: level };
  });
}

// =====================================================================
// SECTION 11 — A11y DESCRIPTION (pt-BR)
// =====================================================================

const TRADITION_LABEL_PT: ReadonlyMap<SacredTradition, string> = new Map([
  ["orixas", "Orixás"],
  ["sefirot", "Sefirot"],
  ["astrologia", "Astrologia"],
  ["chakras", "Chakras"],
  ["cigano", "Cigano"],
]);

/**
 * Build a pt-BR screen-reader description, one line per grid position.
 * Format: "Linha {n}, posição {n}: {name} ({significado curto}), tags: {tags}"
 * Sacred tags are listed as human-readable names (NOT raw tags in logs).
 */
export function gridToA11y(grid: ReadonlyArray<GridPosition>): A11yGridDescription {
  const sorted = grid.slice().sort((a, b) => a.slot - b.slot);
  const lines = sorted.map((pos) => {
    const card = cardById(pos.cardId);
    if (!card) {
      return `Linha ${pos.row + 1}, posição ${pos.col + 1}: [slot ${pos.slot}] (carta desconhecida)`;
    }
    const traditionLines = card.sacredTags
      .map((t) => SACRED_TAG_TO_TRADITION.get(t))
      .filter((t): t is SacredTradition => !!t)
      .map((t) => TRADITION_LABEL_PT.get(t) ?? t)
      .join(", ");
    const lvl = pos.highlightLevel ?? "none";
    return `Linha ${pos.row + 1}, posição ${pos.col + 1}: ${card.name} (${card.shortMeaning}), tags: ${traditionLines}, destaque: ${lvl}`;
  });
  return Object.freeze({
    lines: Object.freeze(lines) as ReadonlyArray<string>,
    totalSlots: grid.length,
    layoutSlug: "",
  }) as A11yGridDescription;
}

// =====================================================================
// SECTION 12 — GRID VALIDATION
// =====================================================================

const MAX_GRID_ROWS = 16;
const MAX_GRID_COLS = 16;
const MAX_GRID_SLOTS = 64;

export function emptyGridResult(): GridValidation {
  return { ok: true } as const;
}

export function validateGrid(grid: ReadonlyArray<GridPosition>): GridValidation {
  const errors: string[] = [];

  if (!Array.isArray(grid)) {
    errors.push("grid must be an array");
    return { ok: false, errors: Object.freeze(errors) } as const;
  }

  if (grid.length === 0) {
    errors.push("grid is empty");
  }

  if (grid.length > MAX_GRID_SLOTS) {
    errors.push(`grid too large: ${grid.length} > ${MAX_GRID_SLOTS}`);
  }

  const seenSlots = new Set<number>();
  const seenCells = new Set<string>();
  const seenCards = new Set<string>();

  for (let i = 0; i < grid.length; i++) {
    const pos = grid[i] as GridPosition;
    if (typeof pos.row !== "number" || pos.row < 0 || pos.row >= MAX_GRID_ROWS) {
      errors.push(`grid[${i}].row out of range: ${pos.row}`);
    }
    if (typeof pos.col !== "number" || pos.col < 0 || pos.col >= MAX_GRID_COLS) {
      errors.push(`grid[${i}].col out of range: ${pos.col}`);
    }
    if (typeof pos.slot !== "number" || pos.slot < 0 || pos.slot >= MAX_GRID_SLOTS) {
      errors.push(`grid[${i}].slot out of range: ${pos.slot}`);
    }
    if (typeof pos.cardId !== "string" || !CIGANO_ID_RE.test(pos.cardId)) {
      errors.push(`grid[${i}].cardId invalid: ${pos.cardId}`);
    }
    if (pos.highlightLevel && !["none", "soft", "strong", "primary"].includes(pos.highlightLevel)) {
      errors.push(`grid[${i}].highlightLevel invalid: ${pos.highlightLevel}`);
    }

    if (seenSlots.has(pos.slot)) errors.push(`duplicate slot ${pos.slot}`);
    seenSlots.add(pos.slot);

    const cellKey = `${pos.row},${pos.col}`;
    if (seenCells.has(cellKey)) errors.push(`duplicate cell ${cellKey}`);
    seenCells.add(cellKey);

    if (seenCards.has(pos.cardId)) errors.push(`duplicate cardId ${pos.cardId}`);
    seenCards.add(pos.cardId);
  }

  if (errors.length === 0) return { ok: true };
  return Object.freeze({ ok: false, errors: Object.freeze(errors) });
}

// =====================================================================
// SECTION 13 — HMAC CHAIN (cycle 60 lesson C-1: no FNV-1a)
// =====================================================================

const CHAIN_KEY = "cigano-spread-visualizer|hmac|v1";

/**
 * Chain-grid-hash: produce per-slot HMAC-SHA256 link in a deterministic chain.
 * Initial seed = sha256(gridSeed + "::CHAIN_INIT").
 * Each step: hash = HMAC-SHA256(prevHash, slotPayload).
 *
 * payload includes: slot, cardId, row, col, cardNumber (cycle 64 lesson for
 * canonical state-machine payload).
 */
export function chainGridHash(
  grid: ReadonlyArray<GridPosition>,
  seed: string,
): ChainHashResult[] {
  const normalizedSeed = normalizeSeed(seed);
  const initPayload = `${normalizedSeed}::CHAIN_INIT`;
  let prevHash = sha256Hex(initPayload);
  const sorted = grid.slice().sort((a, b) => a.slot - b.slot);

  const out: ChainHashResult[] = [];
  for (const pos of sorted) {
    const card = cardById(pos.cardId);
    const cardNumber = card?.number ?? 0;
    const payload = JSON.stringify({
      slot: pos.slot,
      cardId: pos.cardId,
      row: pos.row,
      col: pos.col,
      cardNumber,
    });
    prevHash = hmacSha256Hex(CHAIN_KEY, `${prevHash}|${payload}`);
    out.push({ hash: prevHash, slot: pos.slot, cardId: pos.cardId });
  }
  return out;
}

/** Verify a chain by re-hashing and comparing. */
export function verifyChainGridHash(
  chain: ReadonlyArray<ChainHashResult>,
  seed: string,
  grid: ReadonlyArray<GridPosition>,
): boolean {
  const recomputed = chainGridHash(grid, seed);
  if (recomputed.length !== chain.length) return false;
  for (let i = 0; i < recomputed.length; i++) {
    const r = recomputed[i] as ChainHashResult;
    const c = chain[i] as ChainHashResult;
    if (r.hash !== c.hash || r.slot !== c.slot || r.cardId !== c.cardId) return false;
  }
  return true;
}

// =====================================================================
// SECTION 14 — SACRED COVERAGE AUDIT
// =====================================================================
// Cycle 60 lesson H-7: never write raw sacred terms in logs.
// For audit messages, use the safeFirstSacredConcept redaction pattern.

export function auditGridCoverage(): SacredCoverageReport {
  const cigarUncovered: string[] = [];
  for (let n = 1; n <= 36; n++) {
    const card = cardByNumber(n);
    if (!card) cigarUncovered.push(`c-${n}`);
  }

  const orixasCovered = new Set<SacredTag>();
  const sefirotCovered = new Set<SacredTag>();
  const astrologiaCovered = new Set<SacredTag>();
  const chakrasCovered = new Set<SacredTag>();
  for (const card of CIGANO_DECK) {
    for (const tag of card.sacredTags) {
      const trad = SACRED_TAG_TO_TRADITION.get(tag);
      if (!trad) continue;
      if (trad === "orixas") orixasCovered.add(tag);
      else if (trad === "sefirot") sefirotCovered.add(tag);
      else if (trad === "astrologia") astrologiaCovered.add(tag);
      else if (trad === "chakras") chakrasCovered.add(tag);
    }
  }

  const cigarCount = CIGANO_DECK.length;
  const orixasCount = orixasCovered.size;
  const sefirotCount = sefirotCovered.size;
  const astrologiaCount = astrologiaCovered.size;
  const chakrasCount = chakrasCovered.size;

  const uncovered: string[] = [];
  for (const t of ORIXAS) if (!orixasCovered.has(t)) uncovered.push(t);
  for (const t of SEFIROT) if (!sefirotCovered.has(t)) uncovered.push(t);
  for (const t of ASTROLOGIA) if (!astrologiaCovered.has(t)) uncovered.push(t);
  for (const t of CHAKRAS) if (!chakrasCovered.has(t)) uncovered.push(t);
  for (const u of cigarUncovered) uncovered.push(u);

  const total =
    cigarCount + orixasCount + sefirotCount + astrologiaCount + chakrasCount;
  const isFullCoverage =
    cigarCount === 36 &&
    orixasCount === 16 &&
    sefirotCount === 10 &&
    astrologiaCount === 12 &&
    chakrasCount === 7;

  return Object.freeze({
    cigano: cigarCount,
    orixas: orixasCount,
    sefirot: sefirotCount,
    astrologia: astrologiaCount,
    chakras: chakrasCount,
    total,
    isFullCoverage,
    uncoveredSymbols: Object.freeze(uncovered) as ReadonlyArray<string>,
  }) as SacredCoverageReport;
}

// =====================================================================
// SECTION 15 — SAFE LOG REDACTION (cycle 60 lesson H-7)
// =====================================================================
// Redact Portuguese sacred terms using the lookaround regex
// `(?:^|\\W)…(?:$|\\W)` per cycle 65 lesson 1, NOT `\b...\b`.
// Diacritic-insensitive via a normalize-and-compare approach.

export const REDACTED_PLACEHOLDER = "<redacted-sacred>";

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Strip diacritics + lowercase. Used for case/diacritic-insensitive matching. */
function diacriticFold(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/**
 * Build a lookaround regex for a sacred term:
 * `(?:^|\W)term(?:$|\W)` — avoids `\b` boundary issues with diacritics/Portuguese.
 * Uses diacritic-folded form for the pattern so 'Oxalá'/'OXALA' all match.
 */
function buildSacredLookaround(term: string): RegExp {
  const folded = diacriticFold(term);
  const pattern = `(?:^|\\W)${escapeRegExp(folded)}(?:$|\\W)`;
  return new RegExp(pattern, "gu");
}

/** Walk through a string and produce [start, end) indices of sacred matches. */
function findSacredSpans(
  input: string,
  spanSink: { start: number; end: number }[]
): void {
  const folded = diacriticFold(input);
  for (const term of [...ORIXAS, ...SEFIROT, ...ASTROLOGIA, ...CHAKRAS]) {
    const re = buildSacredLookaround(term);
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(folded)) !== null) {
      // m.index points at the boundary char (or start), m[0] includes boundary
      const foldedStart = m.index + (m[0].length - diacriticFold(term).length);
      const foldedEnd = foldedStart + diacriticFold(term).length;
      spanSink.push({ start: foldedStart, end: foldedEnd });
    }
  }
}

/** Apply redaction to a string. Returns a SAFE copy where sacred terms are masked. */
export function redactSacredInString(input: string): string {
  if (typeof input !== "string" || input.length === 0) return input;
  const spans: { start: number; end: number }[] = [];
  findSacredSpans(input, spans);
  if (spans.length === 0) return input;
  // Sort + merge spans (overlap-safe)
  spans.sort((a, b) => a.start - b.start);
  const merged: { start: number; end: number }[] = [];
  for (const sp of spans) {
    const last = merged[merged.length - 1];
    if (last && sp.start <= last.end) {
      last.end = Math.max(last.end, sp.end);
    } else {
      merged.push({ start: sp.start, end: sp.end });
    }
  }
  // Build replacement from end to start (so indices stay valid)
  let out = input;
  for (let i = merged.length - 1; i >= 0; i--) {
    const sp = merged[i] as { start: number; end: number };
    out = out.slice(0, sp.start) + REDACTED_PLACEHOLDER + out.slice(sp.end);
  }
  return out;
}

/**
 * Cycle 60 H-7 helper: produce the first sacred concept found in text,
 * redacted (so logs never contain raw sacred terms).
 */
export function safeFirstSacredConcept(input: string): string | null {
  if (typeof input !== "string" || input.length === 0) return null;
  for (const term of [...ORIXAS, ...SEFIROT, ...ASTROLOGIA, ...CHAKRAS]) {
    const re = buildSacredLookaround(term);
    if (re.test(diacriticFold(input))) {
      const prefix = term.length > 4 ? term.slice(0, 4) : term;
      return `${prefix}***`;
    }
  }
  return null;
}

// =====================================================================
// SECTION 16 — HELPERS
// =====================================================================

/** Concatenate all longMeanings for a given card. */
export function meaningsByCard(cardId: CiganoCardId): string {
  const card = cardById(cardId);
  if (!card) return "";
  const baseMeanings = [card.shortMeaning, card.longMeaning].join(" — ");
  return `${card.name} (#${card.number}): ${baseMeanings}`;
}

/** Build a SacredTagSet around a single tradition (e.g. all chakras). */
export function sacredTagsForTradition(tradition: SacredTradition): SacredTagSet {
  switch (tradition) {
    case "orixas":
      return toSacredTagSet([...ORIXAS]);
    case "sefirot":
      return toSacredTagSet([...SEFIROT]);
    case "astrologia":
      return toSacredTagSet([...ASTROLOGIA]);
    case "chakras":
      return toSacredTagSet([...CHAKRAS]);
    default:
      return toSacredTagSet([]);
  }
}

// =====================================================================
// SECTION 17 — ERROR CLASSES (cycle 65 lesson 6: typed errors)
// =====================================================================

export class CiganoVisualizerError extends Error {
  override readonly name: string = "CiganoVisualizerError";
  constructor(message: string) {
    super(message);
  }
}

export class InvalidLayoutError extends CiganoVisualizerError {
  override readonly name: string = "InvalidLayoutError";
}

export class InvalidCardIdError extends CiganoVisualizerError {
  override readonly name: string = "InvalidCardIdError";
}

export class InvalidSeedError extends CiganoVisualizerError {
  override readonly name: string = "InvalidSeedError";
}

// =====================================================================
// SECTION 18 — EXPORT CATALOG (for grep-audit visibility)
// =====================================================================

export const __ALL_EXPORTS = {
  constants: ["CIGANO_DECK", "GRID_LAYOUTS", "LAYOUT_DEFINITIONS", "ORIXAS", "SEFIROT", "ASTROLOGIA", "CHAKRAS", "SACRED_TAG_TO_TRADITION", "SACRED_SYM_TOTAL", "REDACTED_PLACEHOLDER"],
  functions: [
    "normalizeSeed", "toCiganoCardId", "toCiganoCardIdFromNumber", "toGridLayoutSlug",
    "cardByNumber", "cardById", "getLayoutDef", "isSacredTag", "toSacredTagSet",
    "shuffleForLayout", "buildGrid", "cardsInGridOrder", "highlightSacred",
    "gridToA11y", "emptyGridResult", "validateGrid", "chainGridHash",
    "verifyChainGridHash", "auditGridCoverage", "redactSacredInString",
    "safeFirstSacredConcept", "meaningsByCard", "sacredTagsForTradition",
  ],
  typeGuards: ["isSacredTag"],
  errors: ["CiganoVisualizerError", "InvalidLayoutError", "InvalidCardIdError", "InvalidSeedError"],
  types: [
    "CiganoCardId", "GridLayoutSlug", "GridSeed",
    "SacredTag", "SacredTradition", "SacredTagSet",
    "HighlightLevel", "CiganoCard", "GridPosition",
    "A11yGridDescription", "GridValidation", "SacredCoverageReport",
    "ChainHashResult", "GridLayoutDef", "GridLayoutKey",
  ],
  sectionsCount: 18,
} as const;
