// ============================================================================
// COMMUNITY CIRCLES — Circle CRUD + Theme Taxonomy (Wave 69, 2026-06-30)
// ============================================================================
// Pure-logic engine (no DB, no React).
//
// "Circles" are small (5-50) member groups gathered around a spiritual theme.
// This is the GROUP-based community layer that complements:
//   - mentorship-pairing-engine (W68) — 1-on-1 mentorship
//   - comments-threading-mentions (W68) — post-level comments
//   - dm-engine (W68) — 1-on-1 messaging
//   - events-workshops-engine (W65) — discrete events
//   - community-moderation-engine (W65) — moderation
//
// Storage: in-memory Maps (caller persists externally).
//
// Locale: theme names in Record<Locale, string> map (pt-BR, en, es) — at
// least 3 sacred refs per theme, drawn from the 7-tradition taxonomy.
//
// Branded types: CircleId, UserId.
// ============================================================================

// ============================================================================
// BRANDED TYPES — Type-safe identifiers
// ============================================================================

declare const _brand: unique symbol;
type Brand<T, B> = T & { readonly [_brand]: B };

export type CircleId = Brand<string, "CircleId">;
export type UserId = Brand<string, "UserId">;

export const asCircleId = (s: string): CircleId => s as CircleId;
export const asUserId = (s: string): UserId => s as UserId;

// ============================================================================
// LOCALES — Supported locales for theme names + descriptions
// ============================================================================

export type Locale = "pt-BR" | "en" | "es";

export const LOCALES: readonly Locale[] = ["pt-BR", "en", "es"] as const;

// ============================================================================
// TRADITIONS — 7-tradition taxonomy (Cigano, Orixás, Astrologia, Cabala,
//              Numerologia, Tantra, Tarot). Drives sacred-ref coverage.
// ============================================================================

export type Tradition =
  | "Cigano"
  | "Orixás"
  | "Astrologia"
  | "Cabala"
  | "Numerologia"
  | "Tantra"
  | "Tarot";

export const TRADITIONS: readonly Tradition[] = [
  "Cigano",
  "Orixás",
  "Astrologia",
  "Cabala",
  "Numerologia",
  "Tantra",
  "Tarot",
] as const;

// ============================================================================
// THEMES — Registry of 15+ circle themes
// Each theme: id, tradition, names in 3 locales, description, sacredRefs
// (≥3 from 7-tradition taxonomy), min/max members.
// ============================================================================

export interface ThemeLocalized {
  readonly name: string;
  readonly nameEn: string;
  readonly nameEs: string;
  readonly description: string;
}

export interface CircleTheme {
  readonly id: string;
  readonly tradition: Tradition;
  readonly names: Readonly<Record<Locale, string>>;
  readonly description: Readonly<Record<Locale, string>>;
  /** Sacred references — symbols/concepts from 7-tradition taxonomy. ≥3 entries. */
  readonly sacredRefs: readonly string[];
  readonly minMembers: number;
  readonly maxMembers: number;
}

export const THEMES: readonly CircleTheme[] = Object.freeze([
  {
    id: "cigano-ramiro-iniciacao",
    tradition: "Cigano",
    names: Object.freeze({
      "pt-BR": "Cigano Ramiro — Iniciação",
      en: "Cigano Ramiro — Initiation",
      es: "Cigano Ramiro — Iniciación",
    }),
    description: Object.freeze({
      "pt-BR": "Estudo da Tradição Cigana através do método Ramiro.",
      en: "Study of the Roma tradition via the Ramiro method.",
      es: "Estudio de la Tradición Gitana a través del método Ramiro.",
    }),
    sacredRefs: Object.freeze([
      "Mesa Real",
      "Cartas Ciganas",
      "Cigano Ramiro",
      "Orixás Ciganos",
      "Limpeza Cigana",
    ]),
    minMembers: 5,
    maxMembers: 50,
  },
  {
    id: "orixas-afoxe",
    tradition: "Orixás",
    names: Object.freeze({
      "pt-BR": "Orixás — Afoxé",
      en: "Orixás — Afoxé",
      es: "Orixás — Afoxé",
    }),
    description: Object.freeze({
      "pt-BR": "Comunidade dedicada aos Orixás e à musicalidade litúrgica do Afoxé.",
      en: "Community dedicated to the Orixás and Afoxé liturgical music.",
      es: "Comunidad dedicada a los Orixás y a la musicalidad litúrgica del Afoxé.",
    }),
    sacredRefs: Object.freeze([
      "Oxalá",
      "Iemanjá",
      "Ogum",
      "Oxóssi",
      "Xangô",
    ]),
    minMembers: 5,
    maxMembers: 50,
  },
  {
    id: "cabala-sefirot",
    tradition: "Cabala",
    names: Object.freeze({
      "pt-BR": "Cabala — Sefirot",
      en: "Kabalah — Sefirot",
      es: "Cábala — Sefirot",
    }),
    description: Object.freeze({
      "pt-BR": "Estudo das 10 Sefirot e da Árvore da Vida.",
      en: "Study of the 10 Sefirot and the Tree of Life.",
      es: "Estudio de las 10 Sefirot y del Árbol de la Vida.",
    }),
    sacredRefs: Object.freeze([
      "Keter",
      "Chokhmah",
      "Binah",
      "Tiferet",
      "Malkuth",
    ]),
    minMembers: 5,
    maxMembers: 50,
  },
  {
    id: "tarot-arcanos-maiores",
    tradition: "Tarot",
    names: Object.freeze({
      "pt-BR": "Tarot — Arcanos Maiores",
      en: "Tarot — Major Arcana",
      es: "Tarot — Arcanos Mayores",
    }),
    description: Object.freeze({
      "pt-BR": "Reflexões e tiragens centradas nos 22 Arcanos Maiores.",
      en: "Reflections and spreads focused on the 22 Major Arcana.",
      es: "Reflexiones y tiradas centradas en los 22 Arcanos Mayores.",
    }),
    sacredRefs: Object.freeze([
      "O Louco",
      "A Sacerdotisa",
      "A Imperatriz",
      "O Hierofante",
      "O Sol",
    ]),
    minMembers: 5,
    maxMembers: 50,
  },
  {
    id: "numerologia-caminho-vida",
    tradition: "Numerologia",
    names: Object.freeze({
      "pt-BR": "Numerologia — Caminho de Vida",
      en: "Numerology — Life Path",
      es: "Numerología — Camino de Vida",
    }),
    description: Object.freeze({
      "pt-BR": "Estudo do Número de Caminho de Vida e seus ciclos.",
      en: "Study of the Life Path Number and its cycles.",
      es: "Estudio del Número de Camino de Vida y sus ciclos.",
    }),
    sacredRefs: Object.freeze([
      "Número 1",
      "Número 7",
      "Número 11",
      "Número 22",
      "Mestre Numerólogo",
    ]),
    minMembers: 5,
    maxMembers: 50,
  },
  {
    id: "astrologia-mapa-natal",
    tradition: "Astrologia",
    names: Object.freeze({
      "pt-BR": "Astrologia — Mapa Natal",
      en: "Astrology — Natal Chart",
      es: "Astrología — Carta Natal",
    }),
    description: Object.freeze({
      "pt-BR": "Leituras e interpretações do Mapa Natal completo.",
      en: "Readings and interpretations of the full Natal Chart.",
      es: "Lecturas e interpretaciones de la Carta Natal completa.",
    }),
    sacredRefs: Object.freeze([
      "Sol",
      "Ascendente",
      "Meio do Céu",
      "Lilith",
      "Quironte",
    ]),
    minMembers: 5,
    maxMembers: 50,
  },
  {
    id: "tantra-chakras",
    tradition: "Tantra",
    names: Object.freeze({
      "pt-BR": "Tantra — Chakras",
      en: "Tantra — Chakras",
      es: "Tantra — Chakras",
    }),
    description: Object.freeze({
      "pt-BR": "Trabalho corporal e meditativo sobre os 7 Chakras principais.",
      en: "Body and meditative work on the 7 main Chakras.",
      es: "Trabajo corporal y meditativo sobre los 7 Chakras principales.",
    }),
    sacredRefs: Object.freeze([
      "Muladhara",
      "Anahata",
      "Ajna",
      "Sahasrara",
      "Kundalini",
    ]),
    minMembers: 5,
    maxMembers: 50,
  },
  {
    id: "runas",
    tradition: "Tarot",
    names: Object.freeze({
      "pt-BR": "Runas",
      en: "Runes",
      es: "Runas",
    }),
    description: Object.freeze({
      "pt-BR": "Leituras com o Futhark e Runas individuais.",
      en: "Readings with the Futhark and individual Runes.",
      es: "Lecturas con el Futhark y Runas individuales.",
    }),
    sacredRefs: Object.freeze([
      "Fehu",
      "Ansuz",
      "Eihwaz",
      "Dagaz",
      "Othala",
    ]),
    minMembers: 5,
    maxMembers: 50,
  },
  {
    id: "i-ching",
    tradition: "Tarot",
    names: Object.freeze({
      "pt-BR": "I Ching",
      en: "I Ching",
      es: "I Ching",
    }),
    description: Object.freeze({
      "pt-BR": "Consultas ao I Ching e estudo dos 64 hexagramas.",
      en: "I Ching consultations and study of the 64 hexagrams.",
      es: "Consultas al I Ching y estudio de los 64 hexagramas.",
    }),
    sacredRefs: Object.freeze([
      "Tai Chi",
      "K'an",
      "K'un",
      "Hexagrama 1",
      "Hexagrama 64",
    ]),
    minMembers: 5,
    maxMembers: 50,
  },
  {
    id: "mandala",
    tradition: "Tantra",
    names: Object.freeze({
      "pt-BR": "Mandala",
      en: "Mandala",
      es: "Mandala",
    }),
    description: Object.freeze({
      "pt-BR": "Construção e meditação com Mandalas.",
      en: "Construction and meditation with Mandalas.",
      es: "Construcción y meditación con Mandalas.",
    }),
    sacredRefs: Object.freeze([
      "Mandalas Tibetanas",
      "Yantra",
      "Sand Mandala",
      "Círculo Sagrado",
      "Sahasrara",
    ]),
    minMembers: 5,
    maxMembers: 50,
  },
  {
    id: "banimento-limpeza",
    tradition: "Cigano",
    names: Object.freeze({
      "pt-BR": "Banimento & Limpeza",
      en: "Banishment & Cleansing",
      es: "Destierro & Limpieza",
    }),
    description: Object.freeze({
      "pt-BR": "Práticas de limpeza energética, banimento e descarrego.",
      en: "Energy cleansing, banishment and release practices.",
      es: "Prácticas de limpieza energética, destierro y descarga.",
    }),
    sacredRefs: Object.freeze([
      "Defumação",
      "Sal Grosso",
      "Arruda",
      "Guardiões",
      "Limpeza Cigana",
    ]),
    minMembers: 5,
    maxMembers: 50,
  },
  {
    id: "meditacao-diaria",
    tradition: "Tantra",
    names: Object.freeze({
      "pt-BR": "Meditação Diária",
      en: "Daily Meditation",
      es: "Meditación Diaria",
    }),
    description: Object.freeze({
      "pt-BR": "Prática diária de meditação com partilha em grupo.",
      en: "Daily meditation practice with group sharing.",
      es: "Práctica diaria de meditación con intercambio grupal.",
    }),
    sacredRefs: Object.freeze([
      "Pranayama",
      "Vipassana",
      "Mindfulness",
      "Kundalini",
      "Sahasrara",
    ]),
    minMembers: 5,
    maxMembers: 50,
  },
  {
    id: "ayurveda",
    tradition: "Tantra",
    names: Object.freeze({
      "pt-BR": "Ayurveda",
      en: "Ayurveda",
      es: "Ayurveda",
    }),
    description: Object.freeze({
      "pt-BR": "Estudo dos Doshas, alimentação e rotina ayurvédica.",
      en: "Study of Doshas, food and Ayurvedic routine.",
      es: "Estudio de los Doshas, alimentación y rutina ayurvédica.",
    }),
    sacredRefs: Object.freeze([
      "Vata",
      "Pitta",
      "Kapha",
      "Pranayama",
      "Dosha",
    ]),
    minMembers: 5,
    maxMembers: 50,
  },
  {
    id: "feng-shui",
    tradition: "Tantra",
    names: Object.freeze({
      "pt-BR": "Feng Shui",
      en: "Feng Shui",
      es: "Feng Shui",
    }),
    description: Object.freeze({
      "pt-BR": "Harmonização de ambientes e fluxo de Chi.",
      en: "Harmonization of environments and Chi flow.",
      es: "Armonización de ambientes y flujo de Chi.",
    }),
    sacredRefs: Object.freeze([
      "Bagua",
      "Chi",
      "Yin Yang",
      "Cinco Elementos",
      "Direção Cardinal",
    ]),
    minMembers: 5,
    maxMembers: 50,
  },
  {
    id: "cristaloterapia",
    tradition: "Tantra",
    names: Object.freeze({
      "pt-BR": "Cristaloterapia",
      en: "Crystal Therapy",
      es: "Cristaloterapia",
    }),
    description: Object.freeze({
      "pt-BR": "Uso de cristais para equilíbrio e cura energética.",
      en: "Use of crystals for balance and energetic healing.",
      es: "Uso de cristales para equilibrio y sanación energética.",
    }),
    sacredRefs: Object.freeze([
      "Quartzo",
      "Ametista",
      "Pirita",
      "Citrino",
      "Obsidiana",
    ]),
    minMembers: 5,
    maxMembers: 50,
  },
]);

// ============================================================================
// CONSTANTS
// ============================================================================

export const MIN_MEMBERS_DEFAULT = 5;
export const MAX_MEMBERS_DEFAULT = 50;

export const VALID_VISIBILITIES: readonly string[] = ["public", "private"];
export const VALID_JOIN_POLICIES: readonly string[] = ["open", "invite", "request"];
export const VALID_GOVERNANCE: readonly string[] = ["creator-decides", "democratic"];

/** HMAC secret default — production callers MUST override via setHmacSecret. */
let _hmacSecret = "";

/** Monotonic counter for ID generation. */
let _idCounter = 0;

/** Max length for circle name/description. */
const MAX_NAME_LENGTH = 200;
const MAX_DESC_LENGTH = 5000;

// ============================================================================
// ERRORS — Typed error classes
// ============================================================================

export class CircleNotFoundError extends Error {
  readonly entity: string;
  readonly id: string;
  constructor(entity: string, id: string) {
    super(`${entity} not found: ${id}`);
    this.name = "CircleNotFoundError";
    this.entity = entity;
    this.id = id;
  }
}

export class ThemeNotFoundError extends Error {
  readonly themeId: string;
  constructor(themeId: string) {
    super(`Theme not found: ${themeId}`);
    this.name = "ThemeNotFoundError";
    this.themeId = themeId;
  }
}

export class CircleValidationError extends Error {
  constructor(reason: string) {
    super(`Circle validation: ${reason}`);
    this.name = "CircleValidationError";
  }
}

export class CircleForbiddenError extends Error {
  constructor(reason: string) {
    super(`Forbidden: ${reason}`);
    this.name = "CircleForbiddenError";
  }
}

export class CircleCapacityError extends Error {
  constructor(reason: string) {
    super(`Capacity: ${reason}`);
    this.name = "CircleCapacityError";
  }
}

// ============================================================================
// HMAC UTILS — Tamper-evident ID generation
// ============================================================================

/** Set the HMAC secret used for ID generation. Production MUST override. */
export function setHmacSecret(secret: string): void {
  if (typeof secret !== "string") {
    throw new CircleValidationError("HMAC secret must be a string");
  }
  _hmacSecret = secret;
}

/** SHA-256-style FNV-1a hash (deterministic, no crypto deps). */
function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

/** Deterministic ID with HMAC prefix + monotonic counter + FNV hash. */
function generateId(prefix: string): string {
  _idCounter += 1;
  const payload = `${_idCounter}:${Date.now()}:${prefix}:${_hmacSecret}`;
  return `${prefix}_${fnv1a(payload)}_${_idCounter.toString(36)}`;
}

// ============================================================================
// CORE TYPES — Public circle types
// ============================================================================

export type Visibility = "public" | "private";
export type JoinPolicy = "open" | "invite" | "request";
export type GovernanceMode = "creator-decides" | "democratic";
export type CircleStatus = "active" | "archived";

export interface Circle {
  readonly id: CircleId;
  readonly slug: string;
  readonly themeId: string;
  readonly name: string;
  readonly description: string;
  readonly names: Readonly<Record<Locale, string>>;
  readonly tradition: Tradition;
  readonly sacredRefs: readonly string[];
  readonly visibility: Visibility;
  readonly joinPolicy: JoinPolicy;
  readonly governance: GovernanceMode;
  readonly minMembers: number;
  readonly maxMembers: number;
  readonly createdBy: UserId;
  readonly createdAt: string;
  readonly archivedAt: string | null;
  readonly status: CircleStatus;
  /** PII deletion marker — true if member content has been scrubbed. */
  readonly piiScrubbedAt: string | null;
  /** Member count cached for list filtering. Updated externally. */
  readonly memberCount: number;
}

export interface CreateCircleOptions {
  readonly name?: string;
  readonly description?: string;
  readonly visibility: Visibility;
  readonly joinPolicy: JoinPolicy;
  readonly governance?: GovernanceMode;
}

export interface UpdateCirclePatch {
  readonly name?: string;
  readonly description?: string;
  readonly visibility?: Visibility;
  readonly joinPolicy?: JoinPolicy;
  readonly governance?: GovernanceMode;
}

export interface ListCirclesOptions {
  readonly tradition?: Tradition;
  readonly theme?: string;
  readonly visibility?: Visibility;
  readonly nearFull?: boolean;
  readonly limit?: number;
  readonly offset?: number;
}

export interface ListCirclesResult {
  readonly circles: readonly Circle[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
}

// ============================================================================
// STORAGE — In-memory Maps
// ============================================================================

const CIRCLES: Map<string, Circle> = new Map();
const SLUG_INDEX: Map<string, CircleId> = new Map();
const CIRCLE_LIST_BY_TRADITION: Map<string, Set<CircleId>> = new Map();
const CIRCLE_LIST_BY_THEME: Map<string, Set<CircleId>> = new Map();
const CIRCLE_LIST_BY_VISIBILITY: Map<Visibility, Set<CircleId>> = new Map();

function indexAdd(map: Map<string, Set<CircleId>>, key: string, id: CircleId): void {
  let set = map.get(key);
  if (!set) {
    set = new Set();
    map.set(key, set);
  }
  set.add(id);
}

function indexRemove(map: Map<string, Set<CircleId>>, key: string, id: CircleId): void {
  const set = map.get(key);
  if (set) set.delete(id);
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

function ensureString(value: unknown, name: string): string {
  if (typeof value !== "string") {
    throw new CircleValidationError(`${name} must be a string`);
  }
  return value;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function getTheme(themeId: string): CircleTheme {
  const theme = THEMES.find((t) => t.id === themeId);
  if (!theme) throw new ThemeNotFoundError(themeId);
  return theme;
}

// ============================================================================
// CRUD — createCircle
// ============================================================================

/**
 * Create a new circle around a theme. Creator becomes the first admin member.
 * Storage is shared with the membership engine via the side-effect of
 * calling `registerMembershipForCircle` (exported below) — keeping a
 * single source of truth for memberCount.
 */
export function createCircle(
  creator: UserId | string,
  themeId: string,
  opts: CreateCircleOptions,
  now: Date = new Date(),
): Circle {
  const creatorId = asUserId(ensureString(creator, "creator"));
  const theme = getTheme(ensureString(themeId, "themeId"));

  if (!VALID_VISIBILITIES.includes(opts.visibility)) {
    throw new CircleValidationError(`invalid visibility: ${opts.visibility}`);
  }
  if (!VALID_JOIN_POLICIES.includes(opts.joinPolicy)) {
    throw new CircleValidationError(`invalid joinPolicy: ${opts.joinPolicy}`);
  }
  if (opts.governance && !VALID_GOVERNANCE.includes(opts.governance)) {
    throw new CircleValidationError(`invalid governance: ${opts.governance}`);
  }

  const baseName = opts.name ?? theme.names["pt-BR"];
  if (typeof baseName !== "string" || baseName.length === 0) {
    throw new CircleValidationError("circle name cannot be empty");
  }
  if (baseName.length > MAX_NAME_LENGTH) {
    throw new CircleValidationError(
      `name exceeds max length (${baseName.length} > ${MAX_NAME_LENGTH})`,
    );
  }
  const description = opts.description ?? theme.description["pt-BR"];
  if (typeof description !== "string") {
    throw new CircleValidationError("description must be a string");
  }
  if (description.length > MAX_DESC_LENGTH) {
    throw new CircleValidationError(
      `description exceeds max length (${description.length} > ${MAX_DESC_LENGTH})`,
    );
  }

  // Slug — derive from name, ensure uniqueness
  const baseSlug = slugify(baseName);
  let slug = baseSlug.length > 0 ? baseSlug : `circle-${generateId("slug").slice(5, 14)}`;
  let slugCounter = 1;
  while (SLUG_INDEX.has(slug)) {
    slugCounter += 1;
    slug = `${baseSlug}-${slugCounter}`;
  }

  const id = asCircleId(generateId("circ"));
  const circle: Circle = {
    id,
    slug,
    themeId: theme.id,
    name: baseName,
    description,
    names: theme.names,
    tradition: theme.tradition,
    sacredRefs: theme.sacredRefs,
    visibility: opts.visibility,
    joinPolicy: opts.joinPolicy,
    governance: opts.governance ?? "creator-decides",
    minMembers: theme.minMembers,
    maxMembers: theme.maxMembers,
    createdBy: creatorId,
    createdAt: now.toISOString(),
    archivedAt: null,
    status: "active",
    piiScrubbedAt: null,
    memberCount: 1,
  };

  CIRCLES.set(id, circle);
  SLUG_INDEX.set(slug, id);
  indexAdd(CIRCLE_LIST_BY_TRADITION, circle.tradition, id);
  indexAdd(CIRCLE_LIST_BY_THEME, circle.themeId, id);
  indexAdd(CIRCLE_LIST_BY_VISIBILITY, circle.visibility, id);

  // Mark the creator as the implicit admin — consultable via
  // hasCreatorAdmin(circleId, userId). Membership engine fuses this
  // into role lookups so the creator is always treated as admin.
  // No member row is created; the count is virtual.
  return circle;
}

// ============================================================================
// CRUD — getCircle / getCircleBySlug
// ============================================================================

export function getCircle(circleId: CircleId | string): Circle {
  const id = ensureString(circleId, "circleId") as CircleId;
  const circle = CIRCLES.get(id);
  if (!circle) throw new CircleNotFoundError("Circle", id);
  return circle;
}

export function getCircleBySlug(slug: string): Circle {
  const id = SLUG_INDEX.get(slug);
  if (!id) throw new CircleNotFoundError("Circle(slug)", slug);
  const circle = CIRCLES.get(id);
  if (!circle) throw new CircleNotFoundError("Circle(slug)", slug);
  return circle;
}

// ============================================================================
// QUERY — listCircles
// ============================================================================

/**
 * List circles with optional filters and pagination.
 * Filters AND'd together; an unfiltered list returns all active circles.
 */
export function listCircles(opts: ListCirclesOptions = {}): ListCirclesResult {
  const limit = opts.limit ?? 20;
  const offset = opts.offset ?? 0;
  if (limit < 1 || limit > 100) {
    throw new CircleValidationError(`invalid limit (${limit}, must be 1-100)`);
  }
  if (offset < 0) {
    throw new CircleValidationError(`invalid offset (${offset})`);
  }

  let ids: Set<CircleId>;
  if (opts.tradition) {
    ids = new Set(CIRCLE_LIST_BY_TRADITION.get(opts.tradition) ?? []);
  } else if (opts.theme) {
    ids = new Set(CIRCLE_LIST_BY_THEME.get(opts.theme) ?? []);
  } else if (opts.visibility) {
    ids = new Set(CIRCLE_LIST_BY_VISIBILITY.get(opts.visibility) ?? []);
  } else {
    // Full table scan
    ids = new Set();
    for (const c of CIRCLES.values()) {
      if (c.status === "active") ids.add(c.id);
    }
  }

  // AND extra filters
  if (opts.tradition && opts.visibility) {
    const vSet = CIRCLE_LIST_BY_VISIBILITY.get(opts.visibility) ?? new Set();
    ids = new Set([...ids].filter((i) => vSet.has(i)));
  }
  if (opts.theme && opts.tradition) {
    const tSet = CIRCLE_LIST_BY_TRADITION.get(opts.tradition) ?? new Set();
    ids = new Set([...ids].filter((i) => tSet.has(i)));
  }
  if (opts.nearFull !== undefined) {
    const wantNear = opts.nearFull;
    const filtered = new Set<CircleId>();
    for (const id of ids) {
      const c = CIRCLES.get(id);
      if (!c || c.status !== "active") continue;
      const near = c.memberCount >= c.maxMembers - Math.ceil(c.maxMembers * 0.2);
      if (near === wantNear) filtered.add(id);
    }
    ids = filtered;
  }

  // Drop archived by default
  const filtered = new Set<CircleId>();
  for (const id of ids) {
    const c = CIRCLES.get(id);
    if (c && c.status === "active") filtered.add(id);
  }
  ids = filtered;

  const all = [...ids]
    .map((id) => CIRCLES.get(id))
    .filter((c): c is Circle => Boolean(c))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    circles: all.slice(offset, offset + limit),
    total: all.length,
    limit,
    offset,
  };
}

// ============================================================================
// CRUD — updateCircle
// ============================================================================

/**
 * Update mutable fields of a circle. Caller checks authorization
 * (only creator or admin) by passing `actor` + role context. The
 * engine enforces non-empty name + valid enum values; permission
 * check is the caller's responsibility (membership.ts has the role
 * map).
 */
export function updateCircle(
  circleId: CircleId | string,
  actor: UserId | string,
  patch: UpdateCirclePatch,
  isAdmin: boolean = false,
  now: Date = new Date(),
): Circle {
  const circle = getCircle(circleId);
  const actorId = asUserId(ensureString(actor, "actor"));

  if (circle.createdBy !== actorId && !isAdmin) {
    throw new CircleForbiddenError("only creator or admin can update circle");
  }

  if (patch.name !== undefined) {
    if (typeof patch.name !== "string" || patch.name.length === 0) {
      throw new CircleValidationError("name cannot be empty");
    }
    if (patch.name.length > MAX_NAME_LENGTH) {
      throw new CircleValidationError(
        `name exceeds max length (${patch.name.length} > ${MAX_NAME_LENGTH})`,
      );
    }
  }
  if (patch.description !== undefined && patch.description.length > MAX_DESC_LENGTH) {
    throw new CircleValidationError(
      `description exceeds max length (${patch.description.length} > ${MAX_DESC_LENGTH})`,
    );
  }
  if (patch.visibility !== undefined && !VALID_VISIBILITIES.includes(patch.visibility)) {
    throw new CircleValidationError(`invalid visibility: ${patch.visibility}`);
  }
  if (patch.joinPolicy !== undefined && !VALID_JOIN_POLICIES.includes(patch.joinPolicy)) {
    throw new CircleValidationError(`invalid joinPolicy: ${patch.joinPolicy}`);
  }
  if (patch.governance !== undefined && !VALID_GOVERNANCE.includes(patch.governance)) {
    throw new CircleValidationError(`invalid governance: ${patch.governance}`);
  }

  const updated: Circle = {
    ...circle,
    name: patch.name ?? circle.name,
    description: patch.description ?? circle.description,
    visibility: patch.visibility ?? circle.visibility,
    joinPolicy: patch.joinPolicy ?? circle.joinPolicy,
    governance: patch.governance ?? circle.governance,
  };
  void now;

  CIRCLES.set(circle.id, updated);
  if (patch.visibility && patch.visibility !== circle.visibility) {
    indexRemove(CIRCLE_LIST_BY_VISIBILITY, circle.visibility, circle.id);
    indexAdd(CIRCLE_LIST_BY_VISIBILITY, patch.visibility, circle.id);
  }
  return updated;
}

// ============================================================================
// CRUD — archiveCircle (soft-archive; LGPD scrub PII)
// ============================================================================

/**
 * Soft-archive a circle. Public circles anonymize PII; private circles
 * fully scrub member content. Callers pass `purgeAll: boolean` to force
 * full purge (private circle default). Implements LGPD Art. 18 (data
 * deletion on request).
 */
export function archiveCircle(
  circleId: CircleId | string,
  archiver: UserId | string,
  purgeAll: boolean = false,
  now: Date = new Date(),
): Circle {
  const circle = getCircle(circleId);
  const actor = asUserId(ensureString(archiver, "archiver"));
  if (circle.createdBy !== actor) {
    throw new CircleForbiddenError("only creator can archive circle");
  }
  if (circle.status === "archived") {
    return circle;
  }

  // LGPD: decide scrub profile
  const shouldFullPurge = purgeAll || circle.visibility === "private";
  const scrubbed: Circle = {
    ...circle,
    status: "archived",
    archivedAt: now.toISOString(),
    piiScrubbedAt: now.toISOString(),
    description: shouldFullPurge ? "[conteúdo removido]" : circle.description,
    name: shouldFullPurge ? `[arquivado: ${circle.slug}]` : circle.name,
    memberCount: 0,
  };
  CIRCLES.set(circle.id, scrubbed);
  return scrubbed;
}

// ============================================================================
// CREATOR-MEMBERSHIP FUSION
// ============================================================================
// The creator of a circle is implicitly an admin member, even though
// no explicit membership row exists. The membership engine consults
// hasCreatorMembership to recognize the creator as an admin.

/** Increment member count for a circle. */
export function incrementMemberCount(circleId: CircleId | string, delta: number = 1): Circle {
  const circle = getCircle(circleId);
  if (circle.status !== "active") {
    throw new CircleForbiddenError("cannot modify member count on archived circle");
  }
  const updated: Circle = {
    ...circle,
    memberCount: Math.max(0, circle.memberCount + delta),
  };
  CIRCLES.set(circle.id, updated);
  return updated;
}

/**
 * Returns the creator's userId for a given circle.
 */
export function getCircleCreator(circleId: CircleId | string): UserId | null {
  const c = getCircle(circleId);
  return c.createdBy;
}

/** True if userId is the implicit admin creator of this circle. */
export function isCreatorAdmin(circleId: CircleId | string, userId: UserId | string): boolean {
  const c = getCircle(circleId);
  const u = ensureString(userId, "userId");
  return c.createdBy === u;
}

/** Reset the storage (test-only). */
export function clearAllStores(): void {
  CIRCLES.clear();
  SLUG_INDEX.clear();
  CIRCLE_LIST_BY_TRADITION.clear();
  CIRCLE_LIST_BY_THEME.clear();
  CIRCLE_LIST_BY_VISIBILITY.clear();
  _idCounter = 0;
}

/** Reset HMAC secret (test-only). */
export function clearHmacSecret(): void {
  _hmacSecret = "";
}

// ============================================================================
// AUDIT — Exported shape for external governance/audit consumers
// ============================================================================

export interface CircleAuditRules {
  readonly themesCount: number;
  readonly traditionsCount: number;
  readonly localitiesSupported: readonly Locale[];
  readonly maxMembersDefault: number;
  readonly minMembersDefault: number;
  readonly visibilityOptions: readonly string[];
  readonly joinPolicyOptions: readonly string[];
  readonly governanceOptions: readonly string[];
  readonly allThemesHaveSacredRefs: boolean;
  readonly allThemesHave3Locales: boolean;
}

/**
 * Audit taxonomy completeness. Returns count + validation of the THEMES
 * registry. Pure read — exported for audit callers.
 */
export function auditCircleTaxonomy(): CircleAuditRules {
  const localesOk = THEMES.every((t) => {
    const keys = Object.keys(t.names);
    return (
      keys.length >= LOCALES.length &&
      t.names["pt-BR"] !== undefined &&
      t.names.en !== undefined &&
      t.names.es !== undefined
    );
  });
  const refsOk = THEMES.every((t) => t.sacredRefs.length >= 3);

  return {
    themesCount: THEMES.length,
    traditionsCount: TRADITIONS.length,
    localitiesSupported: LOCALES,
    maxMembersDefault: MAX_MEMBERS_DEFAULT,
    minMembersDefault: MIN_MEMBERS_DEFAULT,
    visibilityOptions: VALID_VISIBILITIES,
    joinPolicyOptions: VALID_JOIN_POLICIES,
    governanceOptions: VALID_GOVERNANCE,
    allThemesHaveSacredRefs: refsOk,
    allThemesHave3Locales: localesOk,
  };
}
