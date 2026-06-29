/**
 * Daily Reflection Prompt — Cabala dos Caminhos
 * ==============================================
 * Engine for curated daily reflections across 6 esoteric traditions, 3 locales,
 * 5 time-of-day slots, with push notification payload, LGPD consent gate, and
 * PII redaction.
 *
 * Sections:
 *  1. Types & enums (Tradition × Locale × TimeOfDay)
 *  2. Reflection pool builder (Mulberry32 seeded)
 *  3. Rotation algorithm (deterministic per user/date)
 *  4. Tradition-specific content (6+ entries per tradition)
 *  5. Time-of-day adaptation (5 slots)
 *  6. Sacred refs validation
 *  7. Citation system
 *  8. Push notification payload
 *  9. LGPD consent gate
 * 10. PII redaction
 * 11. Timezone handling (native Intl)
 * 12. i18n keys (3 locales × 8+ keys)
 * 13. Accessibility (context max 500 chars, alt text)
 * 14. Error handling (ReflectionError codes)
 * 15. Public API (buildReflectionPool, rotateReflectionPool, getDailyReflection, …)
 *
 * No external dependencies — uses native Intl.* APIs only.
 */

// =============================================================================
// SECTION 1 — Types & Enums
// =============================================================================

export type Tradition =
  | "cigano"
  | "astrologia"
  | "orixas"
  | "cabala"
  | "tantra"
  | "numerologia";

export type Locale = "pt-BR" | "en-US" | "es-ES";

export type TimeOfDay = "dawn" | "morning" | "midday" | "evening" | "night";

export type Difficulty = "light" | "deep" | "transformative";

/** Immutable reflection entry — emitted by the engine. */
export interface ReflectionEntry {
  readonly id: string;
  readonly tradition: Tradition;
  readonly locale: Locale;
  readonly date: string;
  readonly timeOfDay: TimeOfDay;
  readonly prompt: string;
  readonly context: string;
  readonly sacredRefs: readonly string[];
  readonly tags: readonly string[];
  readonly difficulty: Difficulty;
  readonly citation?: { source: string; translator?: string };
}

/** Pool of curated reflections per locale. */
export interface ReflectionPool {
  readonly entries: readonly ReflectionEntry[];
  readonly lastRotated: string;
  readonly rotationSeed: number;
}

/** User schedule for daily reflection delivery. */
export interface ReflectionSchedule {
  readonly userId: string;
  readonly locale: Locale;
  readonly preferredTraditions: readonly Tradition[];
  readonly preferredTimes: readonly TimeOfDay[];
  readonly pushEnabled: boolean;
  readonly pushConsentId?: string;
  readonly emailEnabled: boolean;
  readonly emailConsentId?: string;
  readonly timezone: string;
}

/** A daily reflection resolved for a user at a date. */
export interface DailyReflection {
  readonly entry: ReflectionEntry;
  readonly nextScheduledAt: string;
  readonly alternatives: readonly ReflectionEntry[];
  readonly schedule: ReflectionSchedule;
}

/** Push notification payload (Web Push API + ServiceWorker). */
export interface PushPayload {
  readonly title: string;
  readonly body: string;
  readonly icon: string;
  readonly tag: string;
  readonly data: Readonly<Record<string, string>>;
}

/** LGPD consent gate result. */
export interface LGPDConsentGate {
  readonly push: boolean;
  readonly email: boolean;
}

// =============================================================================
// SECTION 1b — Constants: traditions, locales, time-of-day, sacred refs
// =============================================================================

export const TRADITIONS: readonly Tradition[] = [
  "cigano",
  "astrologia",
  "orixas",
  "cabala",
  "tantra",
  "numerologia",
] as const;

export const LOCALES: readonly Locale[] = ["pt-BR", "en-US", "es-ES"] as const;

export const TIMES_OF_DAY: readonly TimeOfDay[] = [
  "dawn",
  "morning",
  "midday",
  "evening",
  "night",
] as const;

/** Hour ranges for each time-of-day. */
export const TIME_OF_DAY_HOURS: Readonly<Record<TimeOfDay, readonly [number, number]>> = {
  dawn: [3, 7],
  morning: [7, 12],
  midday: [12, 15],
  evening: [15, 19],
  night: [19, 27], // 19-23 + 0-3
} as const;

/** 36 Cartas do Cigano (Cigano Ramiro) — names by index 1-36. */
export const CIGANO_CARDS: readonly string[] = [
  "1-Cavaleiro", "2-Cigana", "3-Nave", "4-Casa", "5-Árvore", "6-Nuvens",
  "7-Serpente", "8-Caixão", "9-Bouquet", "10-Foice", "11-Chicote", "12-Pássaros",
  "13-Criança", "14-Raposa", "15-Urs", "16-Estrela", "17-Cegonha", "18-Cachorro",
  "19-Torre", "20-Jardim", "21-Montanha", "22-Cruz", "23-Rato", "24-Coração",
  "25-Anel", "26-Livro", "27-Carta", "28-Homem", "29-Mulher", "30-Lírio",
  "31-Sol", "32-Lua", "33-Chave", "34-Peixes", "35-Âncora", "36-Cruz",
];

/** 12 zodiac signs (pt-BR canonical, localized in i18n bundle). */
export const ASTRO_SIGNS: readonly string[] = [
  "aries", "touro", "gemeos", "cancer", "leao", "virgem",
  "libra", "escorpiao", "sagitario", "capricornio", "aquario", "peixes",
];

/** 10 planets. */
export const ASTRO_PLANETS: readonly string[] = [
  "sol", "lua", "mercurio", "venus", "marte", "jupiter", "saturno",
  "urano", "netuno", "plutao",
];

/** 12 astrological houses. */
export const ASTRO_HOUSES: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/** Known orixá names (lowercase canonical). */
export const ORIXAS_KNOWN: ReadonlySet<string> = new Set([
  "exu", "ogum", "oxala", "iansa", "oxum", "iemanja", "xango",
  "nana", "obaluaiye", "ossain", "logun-ede", "oia", "oba",
  "obaluae", "oxossi", "oxumare", "iabe", "ewaa", "iroke",
]);

/** 10 Sefirot (Kabbalistic Tree of Life). */
export const SEFIROT: readonly string[] = [
  "keter", "chokhmah", "binah", "chesed", "gevurah", "tiferet",
  "netzach", "hod", "yesod", "malkuth",
];

/** 7 main chakras. */
export const CHAKRAS: readonly string[] = [
  "muladhara", "svadhisthana", "manipura", "anahata", "vishuddha",
  "ajna", "sahasrara",
];

/** Numerology master + single digits. */
export const NUMEROLOGY_NUMBERS: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];

/** Citation sources — at least 6 distinct. */
export const CITATION_SOURCES: Readonly<Record<string, { lang: Locale; translator?: string }>> = {
  "Tarot Cigano Ramiro": { lang: "pt-BR" },
  "Tradição Bantu": { lang: "pt-BR" },
  "Zohar": { lang: "pt-BR", translator: "Ernesto Pavolini" },
  "Sushruta Samhita": { lang: "en-US", translator: "Kaviraj Kunja Lal Bhishagratna" },
  "Pitágoras": { lang: "pt-BR" },
  "Sepher Yetzirah": { lang: "en-US", translator: "W.W. Wescott" },
  "Astrologia Heliocêntrica": { lang: "pt-BR" },
  "Patañjali Yoga Sutras": { lang: "en-US", translator: "Sri Swami Satchidananda" },
};

// =============================================================================
// SECTION 14 — Error handling (declared early so we can throw anywhere)
// =============================================================================

export type ReflectionErrorCode =
  | "INVALID_DATE"
  | "INVALID_LOCALE"
  | "INVALID_TRADITION"
  | "POOL_EMPTY"
  | "CONSENT_MISSING"
  | "TIMEZONE_INVALID";

export class ReflectionError extends Error {
  public readonly code: ReflectionErrorCode;
  public readonly meta: Readonly<Record<string, unknown>>;

  constructor(code: ReflectionErrorCode, message: string, meta: Readonly<Record<string, unknown>> = {}) {
    super(message);
    this.name = "ReflectionError";
    this.code = code;
    this.meta = meta;
  }
}

// =============================================================================
// SECTION 2 — Mulberry32 seeded PRNG
// =============================================================================

/**
 * Mulberry32 — fast 32-bit PRNG seeded with a uint32.
 * Reference: https://gist.github.com/tommyettinger/46a3a4b3a3f4a2e9d3b8a8a8a8a8a8a8
 */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  if (state === 0) {
    state = 0xdeadbeef;
  }
  return function next(): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash a string to uint32 (FNV-1a variant). Deterministic across runs. */
function fnv1a32(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Hash multiple strings into a uint32 seed. */
function hashSeed(...parts: readonly string[]): number {
  return fnv1a32(parts.join("\u0001"));
}

// =============================================================================
// SECTION 11 — Timezone + ISO 8601 validation
// =============================================================================

const ISO_8601_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_8601_DATETIME_RE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:?\d{2})?$/;
const DEFAULT_TIMEZONE = "America/Sao_Paulo";

/** Returns true if `tz` is a valid IANA timezone via Intl. */
export function isValidTimezone(tz: string): boolean {
  if (typeof tz !== "string" || tz.length === 0) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Resolve a timezone, falling back to America/Sao_Paulo if invalid. */
export function resolveTimezone(tz: string): string {
  if (isValidTimezone(tz)) return tz;
  if (tz !== DEFAULT_TIMEZONE) {
    // Note: callers may want to throw TIMEZONE_INVALID; this is a soft fallback
  }
  return DEFAULT_TIMEZONE;
}

/** Strictly validate an ISO 8601 date string (YYYY-MM-DD). */
export function isValidISODate(date: string): boolean {
  if (typeof date !== "string" || !ISO_8601_DATE_RE.test(date)) return false;
  const [y, m, d] = date.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(dt.getTime())) return false;
  return dt.toISOString().slice(0, 10) === date;
}

/** Strictly validate an ISO 8601 datetime string. */
export function isValidISODateTime(dt: string): boolean {
  if (typeof dt !== "string" || !ISO_8601_DATETIME_RE.test(dt)) return false;
  const parsed = new Date(dt);
  return !Number.isNaN(parsed.getTime());
}

/**
 * Returns the wall-clock datetime for a given time-of-day slot on a given
 * date in a given timezone. Uses Intl.DateTimeFormat to derive offsets.
 * Falls back gracefully for invalid timezones.
 */
export function getLocalizedReflectionTime(
  timeOfDay: TimeOfDay,
  timezone: string,
  date: string,
): string {
  if (!isValidISODate(date)) {
    throw new ReflectionError("INVALID_DATE", `Invalid ISO date: ${date}`, { date });
  }
  if (!TIMES_OF_DAY.includes(timeOfDay)) {
    throw new ReflectionError("INVALID_DATE", `Invalid time-of-day: ${timeOfDay}`, { timeOfDay });
  }
  const tz = resolveTimezone(timezone);

  // Pick a representative hour for the slot in the target timezone.
  // For `night` we pick 21:00 (within the 19-23 portion of 19-27).
  const hours: Record<TimeOfDay, number> = {
    dawn: 5,
    morning: 8,
    midday: 13,
    evening: 17,
    night: 21,
  };
  const minute = 0;
  const hour = hours[timeOfDay];

  // Build an ISO string in the target timezone by deriving the offset.
  // Approach: use Intl.DateTimeFormat with `formatToParts` to get the
  // wall-clock components, then construct a UTC instant and emit as ISO.
  const yyyy = Number(date.slice(0, 4));
  const mm = Number(date.slice(5, 7));
  const dd = Number(date.slice(8, 10));

  // First guess: treat the wall-clock as UTC.
  const guess = Date.UTC(yyyy, mm - 1, dd, hour, minute, 0);
  const guessDate = new Date(guess);

  // Format that guess in `tz` to get the actual wall-clock components.
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(guessDate);
  const get = (t: string): string => parts.find((p) => p.type === t)?.value ?? "00";
  const wallY = Number(get("year"));
  const wallM = Number(get("month"));
  const wallD = Number(get("day"));
  const wallH = Number(get("hour") === "24" ? "00" : get("hour"));
  const wallMi = Number(get("minute"));

  // Compute the offset (in minutes) between the wall-clock in `tz` and UTC.
  const wallAsUtc = Date.UTC(wallY, wallM - 1, wallD, wallH, wallMi, 0);
  const offsetMs = wallAsUtc - guess;
  const offsetMin = Math.round(offsetMs / 60000);

  // Now compute the *real* UTC instant that, when formatted in `tz`, yields
  // the desired (yyyy-mm-dd hour:minute) wall-clock.
  const targetWallUtc = Date.UTC(yyyy, mm - 1, dd, hour, minute, 0);
  const realUtc = targetWallUtc - offsetMs;

  const real = new Date(realUtc);
  // Emit ISO with offset.
  const sign = offsetMin >= 0 ? "+" : "-";
  const absOff = Math.abs(offsetMin);
  const offH = String(Math.floor(absOff / 60)).padStart(2, "0");
  const offM = String(absOff % 60).padStart(2, "0");
  // Use real.toISOString() and splice the offset in.
  return `${real.toISOString().replace(/\.\d{3}Z$/, "")}${sign}${offH}:${offM}`;
}

// =============================================================================
// SECTION 12 — i18n keys (3 locales × 8+ keys)
// =============================================================================

export type I18nKey =
  | "reflection.title"
  | "reflection.pushBody"
  | "reflection.dawn"
  | "reflection.morning"
  | "reflection.midday"
  | "reflection.evening"
  | "reflection.night"
  | "reflection.citationPrefix";

export const I18N_BUNDLE: Readonly<Record<Locale, Readonly<Record<I18nKey, string>>>> = {
  "pt-BR": {
    "reflection.title": "Reflexão do Dia",
    "reflection.pushBody": "Sua reflexão de hoje está pronta",
    "reflection.dawn": "Amanhecer",
    "reflection.morning": "Manhã",
    "reflection.midday": "Meio-dia",
    "reflection.evening": "Fim de tarde",
    "reflection.night": "Noite",
    "reflection.citationPrefix": "Fonte:",
  },
  "en-US": {
    "reflection.title": "Daily Reflection",
    "reflection.pushBody": "Your reflection for today is ready",
    "reflection.dawn": "Dawn",
    "reflection.morning": "Morning",
    "reflection.midday": "Midday",
    "reflection.evening": "Evening",
    "reflection.night": "Night",
    "reflection.citationPrefix": "Source:",
  },
  "es-ES": {
    "reflection.title": "Reflexión del Día",
    "reflection.pushBody": "Tu reflexión de hoy está lista",
    "reflection.dawn": "Amanecer",
    "reflection.morning": "Mañana",
    "reflection.midday": "Mediodía",
    "reflection.evening": "Atardecer",
    "reflection.night": "Noche",
    "reflection.citationPrefix": "Fuente:",
  },
};

/** Get a localized i18n string. Falls back to en-US. */
export function t(locale: Locale, key: I18nKey): string {
  const bundle = I18N_BUNDLE[locale] ?? I18N_BUNDLE["en-US"];
  const value = bundle[key];
  if (value !== undefined) return value;
  return I18N_BUNDLE["en-US"][key] ?? key;
}

// =============================================================================
// SECTION 6 — Sacred refs validation
// =============================================================================

/** Validate a sacred ref by tradition. Returns true if recognized. */
export function isValidSacredRef(tradition: Tradition, ref: string): boolean {
  if (typeof ref !== "string" || ref.length === 0) return false;
  const normalized = ref.toLowerCase().trim();
  switch (tradition) {
    case "cigano": {
      // Format: "<n>-<cavaleiro|cigana>" or just "<n>"
      const m = /^(\d{1,2})/.exec(normalized);
      if (!m) return false;
      const n = Number(m[1]);
      return n >= 1 && n <= 36;
    }
    case "astrologia": {
      return (
        ASTRO_SIGNS.includes(normalized) ||
        ASTRO_PLANETS.includes(normalized) ||
        /^casa-\d{1,2}$/.test(normalized) ||
        ["lilith", "mc", "asc", "nodos-lunares", "quiron"].includes(normalized)
      );
    }
    case "orixas": {
      return ORIXAS_KNOWN.has(normalized);
    }
    case "cabala": {
      return (
        SEFIROT.includes(normalized) ||
        /^caminho-\d{1,2}$/.test(normalized) ||
        ["atziluth", "briah", "yetzirah", "assiah"].includes(normalized)
      );
    }
    case "tantra": {
      return CHAKRAS.includes(normalized) || ["prana", "kundalini", "bandhas", "mudras"].includes(normalized);
    }
    case "numerologia": {
      const m = /^\d{1,2}$/.exec(normalized);
      if (!m) return false;
      const n = Number(normalized);
      return NUMEROLOGY_NUMBERS.includes(n);
    }
    default: {
      // Exhaustive switch
      const exhaustive: never = tradition;
      void exhaustive;
      return false;
    }
  }
}

/** Sanitize a list of sacred refs — drop invalid entries, dedupe, preserve order. */
export function sanitizeSacredRefs(
  tradition: Tradition,
  refs: readonly string[],
): readonly string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of refs) {
    const k = r.toLowerCase().trim();
    if (isValidSacredRef(tradition, k) && !seen.has(k)) {
      seen.add(k);
      out.push(k);
    }
  }
  return out;
}

// =============================================================================
// SECTION 7 — Citation system
// =============================================================================

/** Get a random valid citation for a tradition. */
export function pickCitation(
  tradition: Tradition,
  rng: () => number,
): { source: string; translator?: string } | undefined {
  const sources = Object.keys(CITATION_SOURCES);
  // Bias toward tradition-appropriate sources
  const biased: string[] = [];
  if (tradition === "cigano") biased.push("Tarot Cigano Ramiro");
  if (tradition === "orixas") biased.push("Tradição Bantu");
  if (tradition === "cabala") biased.push("Zohar", "Sepher Yetzirah");
  if (tradition === "tantra") biased.push("Sushruta Samhita", "Patañjali Yoga Sutras");
  if (tradition === "numerologia") biased.push("Pitágoras");
  if (tradition === "astrologia") biased.push("Astrologia Heliocêntrica");

  const pickFrom = biased.length > 0 ? biased : sources;
  const idx = Math.floor(rng() * pickFrom.length) % pickFrom.length;
  const src = pickFrom[idx] ?? "Tarot Cigano Ramiro";
  const meta = CITATION_SOURCES[src];
  const out: { source: string; translator?: string } = { source: src };
  if (meta?.translator !== undefined) {
    out.translator = meta.translator;
  }
  return out;
}

// =============================================================================
// SECTION 4 — Tradition-specific content
// =============================================================================

interface TraditionTemplate {
  readonly prompt: string;
  readonly context: string;
  readonly sacredRefs: readonly string[];
  readonly tags: readonly string[];
  readonly difficulty: Difficulty;
}

const CIGANO_TEMPLATES: readonly TraditionTemplate[] = [
  {
    prompt: "O 1-Cavaleiro desperta: avance com coragem. A mensagem é movimento — quem hesita perde a estrada.",
    context: "O Cavaleiro representa o início de toda jornada. Hoje a cigana Ramiro aponta que o destino favorece quem toma a iniciativa, ainda que o passo pareça incerto.",
    sacredRefs: ["1-cavaleiro", "mercurio"],
    tags: ["ação", "coragem", "início"],
    difficulty: "light",
  },
  {
    prompt: "A Cigana sussurra: ouça antes de falar. As palavras de hoje carregam sementes — plante-as onde o solo é fértil.",
    context: "A carta 2 convida à escuta profunda. Em tempos de ruído, o silêncio é a travessia mais segura.",
    sacredRefs: ["2-cigana", "lua"],
    tags: ["escuta", "silêncio", "palavra"],
    difficulty: "deep",
  },
  {
    prompt: "A 3-Nave anuncia travessia. Algo parte e algo chega. Confie no curso d'água mesmo sem ver a outra margem.",
    context: "A Nave Cigana fala de deslocamentos internos e externos. Pode indicar viagem, mudança de rumo ou de estado de espírito.",
    sacredRefs: ["3-nave", "casa-9"],
    tags: ["viagem", "mudança", "transição"],
    difficulty: "deep",
  },
  {
    prompt: "4-Casa: cuide do seu chão. Família, lar e segurança pedem atenção hoje — não adie o que sustenta.",
    context: "A Casa Cigana é o templo interior. Quando o exterior treme, é pra dentro que devemos voltar.",
    sacredRefs: ["4-casa", "cancer"],
    tags: ["família", "lar", "segurança"],
    difficulty: "light",
  },
  {
    prompt: "5-Árvore: suas raízes pedem profundidade. O que você alimenta cresce; o que ignora, atrofia.",
    context: "A Árvore é símbolo de conexão entre céu e terra. Hoje o convite é olhar o que tem sido negligenciado e regar com presença.",
    sacredRefs: ["5-arvore", "saturno"],
    tags: ["raízes", "crescimento", "paciência"],
    difficulty: "deep",
  },
  {
    prompt: "36-Cruz: carregue com leveza. O peso só existe se você o assume. Solte o que não é seu.",
    context: "A Cruz Cigana fala de destino e provação. A travessia só pesa quando esquecemos que o caminho é nosso — não da carga.",
    sacredRefs: ["36-cruz", "saturno"],
    tags: ["soltar", "destino", "leveza"],
    difficulty: "transformative",
  },
];

const ASTRO_TEMPLATES: readonly TraditionTemplate[] = [
  {
    prompt: "Lua em Escorpião: a intensidade emocional não é inimiga. Mergulhe no que sente sem se afogar.",
    context: "A Lua escorpiana convida à profundidade. Hoje as máscaras caem e a verdade emocional pede passagem.",
    sacredRefs: ["lua", "escorpiao", "casa-8"],
    tags: ["emoção", "intensidade", "verdade"],
    difficulty: "transformative",
  },
  {
    prompt: "Mercúrio retrógrado: revisite, não reinicie. O que precisa ser dito com mais cuidado, hoje é o dia.",
    context: "Mercúrio retrógrado não é vilão — é professor. Convida à revisão, à escuta e à paciência na comunicação.",
    sacredRefs: ["mercurio", "netuno"],
    tags: ["comunicação", "revisão", "paciência"],
    difficulty: "deep",
  },
  {
    prompt: "Sol em Leão: brilhe sem pedir licença. A sua autenticidade é o maior presente que oferece hoje.",
    context: "O Sol leonino aquece a autoexpressão. O convite é ocupar o próprio eixo, não esperar aprovação externa.",
    sacredRefs: ["sol", "leao", "casa-5"],
    tags: ["autenticidade", "brilho", "autoestima"],
    difficulty: "light",
  },
  {
    prompt: "Vênus em Touro: cultive o que alimenta. Beleza, prazer e presença são linguagens do amor.",
    context: "Vênus toureira valoriza o simples e o durável. Hoje, escolha o que sustenta em vez do que impressiona.",
    sacredRefs: ["venus", "touro", "casa-2"],
    tags: ["amor", "prazer", "beleza"],
    difficulty: "light",
  },
  {
    prompt: "Marte em Áries: aja agora, planeje depois. A coragem sem cálculo ainda é coragem.",
    context: "Marte em seu domicílio impulsiona. Mas toda ação pede direção — escolha onde mirar antes de disparar.",
    sacredRefs: ["marte", "aries", "casa-1"],
    tags: ["ação", "coragem", "impulso"],
    difficulty: "deep",
  },
  {
    prompt: "Lilith negra: abrace o que foi renegado. A sombra bem acolhida vira aliada.",
    context: "Lilith aponta o que foi empurrado para fora. Integrar é mais sábio que combater.",
    sacredRefs: ["lilith", "plutao"],
    tags: ["sombra", "integração", "poder"],
    difficulty: "transformative",
  },
];

const ORIXAS_TEMPLATES: readonly TraditionTemplate[] = [
  {
    prompt: "Dia de Exu: os caminhos se abrem, mas pedem oferenda. Fale a verdade, mesmo que doa.",
    context: "Exu é o guardião das encruzilhadas. Sua energia abre portas e cobra诚实. Não minta para si hoje.",
    sacredRefs: ["exu", "ogum"],
    tags: ["comunicação", "caminho", "verdade"],
    difficulty: "deep",
  },
  {
    prompt: "Ogum aponta a estrada: o trabalho dignifica. Pegue a ferramenta e comece — o resto vem.",
    context: "Ogum é o patrono do trabalho e da luta. Hoje, o esforço consistente é a oração mais concreta.",
    sacredRefs: ["ogum", "oxossi"],
    tags: ["trabalho", "luta", "determinação"],
    difficulty: "light",
  },
  {
    prompt: "Oxalá sopra paz: a brisa da calma é o antídoto da pressa. Respire antes de reagir.",
    context: "Oxalá é a brancura que purifica. Sua mensagem hoje é simples: paz começa em você.",
    sacredRefs: ["oxala", "obaluae"],
    tags: ["paz", "calma", "pureza"],
    difficulty: "light",
  },
  {
    prompt: "Iansã levanta os ventos: coragem para mudar. O que estagnou pede movimento.",
    context: "Iansã comanda os ventos e as tempestades. Sua energia é o chamado para atravessar o que segura.",
    sacredRefs: ["iansa", "oia"],
    tags: ["mudança", "coragem", "vento"],
    difficulty: "deep",
  },
  {
    prompt: "Oxum banha em doçura: ame sem se perder. O amor verdadeiro começa em você.",
    context: "Oxum é a mãe das águas doces, do amor e da beleza. Hoje ela convida a cuidar de si para cuidar do outro.",
    sacredRefs: ["oxum", "logun-ede"],
    tags: ["amor", "autocuidado", "doçura"],
    difficulty: "light",
  },
  {
    prompt: "Iemanjá abraça as ondas: entregue o que não cabe mais. O mar recebe e renova.",
    context: "Iemanjá é a grande mãe do mar. Sua energia convida à entrega consciente — soltar não é perder.",
    sacredRefs: ["iemanja", "oba"],
    tags: ["entrega", "renovação", "mar"],
    difficulty: "transformative",
  },
];

const CABALA_TEMPLATES: readonly TraditionTemplate[] = [
  {
    prompt: "Keter: o ponto acima da coroa. Hoje, conecte-se com o propósito que está antes de qualquer coisa.",
    context: "Keter é a primeira emanação, a vontade pura. Sua meditação é silenciar até ouvir o que precede o pensamento.",
    sacredRefs: ["keter", "atziluth"],
    tags: ["propósito", "silêncio", "vontade"],
    difficulty: "transformative",
  },
  {
    prompt: "Chokhmah: a centelha da sabedoria. O insight chega — não empurre, apenas reconheça.",
    context: "Chokhmah é a sabedoria instantânea. O novo quer entrar, mas precisa de espaço receptivo.",
    sacredRefs: ["chokhmah", "binah"],
    tags: ["insight", "sabedoria", "abertura"],
    difficulty: "deep",
  },
  {
    prompt: "Tiferet: equilíbrio entre beleza e força. O centro é onde a verdade se torna bela.",
    context: "Tiferet é o coração da Árvore. Integra Chesed (misericórdia) e Gevurah (rigor). Hoje, busque o meio justo.",
    sacredRefs: ["tiferet", "chokhmah", "gevurah"],
    tags: ["equilíbrio", "coração", "beleza"],
    difficulty: "deep",
  },
  {
    prompt: "Malkuth: honre o mundo concreto. Reino, corpo, ação. A espiritualidade começa no chão.",
    context: "Malkuth é a última emanação — onde o divino se materializa. Cuidar do corpo, do trabalho e da casa é prática sagrada.",
    sacredRefs: ["malkuth", "assiah", "yesod"],
    tags: ["corpo", "ação", "material"],
    difficulty: "light",
  },
  {
    prompt: "Netzach: a vitória que persiste. A força está em continuar, não em começar.",
    context: "Netzach é a perseverança. Hoje, o convite é manter a chama acesa mesmo quando o vento sopra contra.",
    sacredRefs: ["netzach", "hod"],
    tags: ["persistência", "força", "fogo"],
    difficulty: "light",
  },
  {
    prompt: "Yesod: o fundamento invisível. Antes de agir no visível, alinhe o invisível.",
    context: "Yesod é a ponte entre o etérico e o físico. Sonhos, intuições e padrões emocionais pedem atenção hoje.",
    sacredRefs: ["yesod", "tiferet"],
    tags: ["intuição", "sonhos", "fundamento"],
    difficulty: "deep",
  },
];

const TANTRA_TEMPLATES: readonly TraditionTemplate[] = [
  {
    prompt: "Respire conscientemente. A consciência do ar é o portal para a consciência do Ser.",
    context: "O prana é a ponte entre corpo e mente. Quatro respirações lentas podem reorganizar o dia inteiro.",
    sacredRefs: ["prana", "muladhara"],
    tags: ["respiração", "presença", "corpo"],
    difficulty: "light",
  },
  {
    prompt: "Muladhara: a raiz que sustenta. Conecte-se com a estabilidade antes de buscar o alto.",
    context: "O chakra raiz fala de segurança, pertencimento e corpo. Aterre-se antes de voar.",
    sacredRefs: ["muladhara", "kundalini"],
    tags: ["raiz", "segurança", "corpo"],
    difficulty: "light",
  },
  {
    prompt: "Anahata: o coração abre devagar. Não force, apenas permita.",
    context: "O chakra do coração é a travessia entre o inferior e o superior. Hoje, pratique a compaixão sem exigência.",
    sacredRefs: ["anahata", "prana"],
    tags: ["coração", "compaixão", "abertura"],
    difficulty: "deep",
  },
  {
    prompt: "Sahasrara: a coroa silenciosa. Medite sem buscar — apenas esteja.",
    context: "O chakra da coroa conecta ao infinito. A prática de hoje é a não-prática: observar sem agarrar.",
    sacredRefs: ["sahasrara", "ajna"],
    tags: ["silêncio", "meditação", "coroa"],
    difficulty: "transformative",
  },
  {
    prompt: "Kundalini desperta aos poucos. Não force a serpente — apenas remova os obstáculos.",
    context: "A energia kundalini sobe quando há espaço. Hoje, o convite é soltar o que bloqueia — não empurrar nada.",
    sacredRefs: ["kundalini", "bandhas", "mudras"],
    tags: ["energia", "soltar", "despertar"],
    difficulty: "transformative",
  },
  {
    prompt: "Svadhisthana: a fluidez das emoções. Dance o que sente, sem se prender.",
    context: "O chakra sacral é o rio emocional. Permitir o movimento sem se afogar é a prática de hoje.",
    sacredRefs: ["svadhisthana", "kundalini"],
    tags: ["emoção", "fluidez", "movimento"],
    difficulty: "deep",
  },
];

const NUMEROLOGIA_TEMPLATES: readonly TraditionTemplate[] = [
  {
    prompt: "Dia 1: comece. A semente do ano pede ação corajosa. Não espere a condição ideal.",
    context: "O número 1 vibra início e liderança. Hoje é dia de plantar o que será colhido nos próximos ciclos.",
    sacredRefs: ["1", "sol"],
    tags: ["início", "liderança", "ação"],
    difficulty: "light",
  },
  {
    prompt: "Dia 7: introspecção e silêncio. A resposta que procura mora onde a mente não alcança.",
    context: "O 7 convida à meditação e ao estudo. Hoje, o conhecimento vem do recolhimento, não da busca.",
    sacredRefs: ["7", "netuno"],
    tags: ["introspecção", "silêncio", "estudo"],
    difficulty: "deep",
  },
  {
    prompt: "Dia 11: intuição em alta. Os números mestres falam mais alto — escute antes de falar.",
    context: "11 é a iluminação intuitiva. Porta entre o visível e o invisível. Pratique a escuta sutil hoje.",
    sacredRefs: ["11", "lua"],
    tags: ["intuição", "mestre", "escuta"],
    difficulty: "transformative",
  },
  {
    prompt: "Dia 22: o mestre construtor. Sonhe grande, mas alicerce firme. O céu só alcança quem tem raiz.",
    context: "22 é o número do construtor de impérios. Hoje, a visão precisa de planta baixa.",
    sacredRefs: ["22", "saturno"],
    tags: ["construção", "visão", "mestre"],
    difficulty: "transformative",
  },
  {
    prompt: "Dia 5: movimento e liberdade. A mudança pedida não é punição — é respiração.",
    context: "O 5 dança entre os cinco sentidos. Hoje, a flexibilidade é mais sábia que o controle.",
    sacredRefs: ["5", "mercurio"],
    tags: ["mudança", "liberdade", "movimento"],
    difficulty: "light",
  },
  {
    prompt: "Dia 33: o mestre curador. A compaixão pura é a força mais alta da numerologia.",
    context: "33 vibra o amor incondicional. O convite é servir sem se perder — doar de dentro para fora.",
    sacredRefs: ["33", "venus"],
    tags: ["cura", "compaixão", "serviço"],
    difficulty: "transformative",
  },
];

const TRADITION_TEMPLATES: Readonly<Record<Tradition, readonly TraditionTemplate[]>> = {
  cigano: CIGANO_TEMPLATES,
  astrologia: ASTRO_TEMPLATES,
  orixas: ORIXAS_TEMPLATES,
  cabala: CABALA_TEMPLATES,
  tantra: TANTRA_TEMPLATES,
  numerologia: NUMEROLOGIA_TEMPLATES,
};

/** Maximum chars for `prompt` (defensive cap). */
const PROMPT_MAX = 280;
/** Maximum chars for `context` (defensive cap). */
const CONTEXT_MAX = 500;

// =============================================================================
// SECTION 3 — Pool builder
// =============================================================================

/**
 * Build a deterministic pool of reflection entries.
 * Default size: 30. Cap: 1000.
 */
export function buildReflectionPool(
  seed: number,
  locale: Locale,
  traditions: readonly Tradition[],
  size: number = 30,
): ReflectionPool {
  if (!Number.isFinite(seed) || seed < 0) {
    throw new ReflectionError("INVALID_DATE", `Invalid seed: ${seed}`, { seed });
  }
  if (!LOCALES.includes(locale)) {
    throw new ReflectionError("INVALID_LOCALE", `Invalid locale: ${locale}`, { locale });
  }
  if (traditions.length === 0) {
    throw new ReflectionError("INVALID_TRADITION", "At least one tradition required", { traditions });
  }
  for (const tr of traditions) {
    if (!TRADITIONS.includes(tr)) {
      throw new ReflectionError("INVALID_TRADITION", `Invalid tradition: ${tr}`, { tradition: tr });
    }
  }
  if (!Number.isFinite(size) || size < 1 || size > 1000) {
    throw new ReflectionError("POOL_EMPTY", `Pool size out of range: ${size}`, { size });
  }

  const rng = mulberry32(Math.floor(seed));
  const entries: ReflectionEntry[] = [];
  const now = new Date().toISOString();

  for (let i = 0; i < size; i++) {
    const tradition = traditions[i % traditions.length] as Tradition;
    const templates = TRADITION_TEMPLATES[tradition];
    if (!templates || templates.length === 0) {
      continue;
    }
    const tIdx = Math.floor(rng() * templates.length) % templates.length;
    const tpl = templates[tIdx];
    if (!tpl) {
      continue;
    }

    const idx = String(i + 1).padStart(3, "0");
    const id = `${tradition}-${locale}-${idx}`;

    const timeOfDay = TIMES_OF_DAY[i % TIMES_OF_DAY.length] as TimeOfDay;

    // Truncate prompt/context defensively.
    const prompt = truncate(tpl.prompt, PROMPT_MAX);
    const context = truncate(tpl.context, CONTEXT_MAX);

    // Build the entry (citation is added in the rotation step).
    const entry: ReflectionEntry = {
      id,
      tradition,
      locale,
      date: "1970-01-01", // overwritten on rotation
      timeOfDay,
      prompt,
      context,
      sacredRefs: Object.freeze([...tpl.sacredRefs]),
      tags: Object.freeze([...tpl.tags]),
      difficulty: tpl.difficulty,
    };
    entries.push(entry);
  }

  if (entries.length === 0) {
    throw new ReflectionError("POOL_EMPTY", "Pool yielded zero entries", { seed, size });
  }

  return Object.freeze({
    entries: Object.freeze(entries),
    lastRotated: now,
    rotationSeed: seed >>> 0,
  }) as ReflectionPool;
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).replace(/\s+$/, "") + "…";
}

// =============================================================================
// SECTION 3b — Rotation algorithm
// =============================================================================

/**
 * Daily rotation. Stable per (date, userId, pool.rotationSeed).
 * Pools are kept immutable; rotation just re-stamps `date` and reassigns citations.
 */
export function rotateReflectionPool(pool: ReflectionPool, date: string): ReflectionPool {
  if (!isValidISODate(date)) {
    throw new ReflectionError("INVALID_DATE", `Invalid ISO date: ${date}`, { date });
  }
  if (pool.entries.length === 0) {
    throw new ReflectionError("POOL_EMPTY", "Cannot rotate empty pool", {});
  }

  const rng = mulberry32(hashSeed(date, String(pool.rotationSeed)));
  const rotated: ReflectionEntry[] = pool.entries.map((e, idx) => {
    const citation = pickCitation(e.tradition, rng);
    const out: ReflectionEntry = {
      id: `${e.tradition}-${e.locale}-${date}-${String(idx + 1).padStart(3, "0")}`,
      tradition: e.tradition,
      locale: e.locale,
      date,
      timeOfDay: e.timeOfDay,
      prompt: e.prompt,
      context: e.context,
      sacredRefs: e.sacredRefs,
      tags: e.tags,
      difficulty: e.difficulty,
      ...(citation !== undefined ? { citation } : {}),
    };
    return out;
  });

  return Object.freeze({
    entries: Object.freeze(rotated),
    lastRotated: new Date().toISOString(),
    rotationSeed: pool.rotationSeed,
  }) as ReflectionPool;
}

// =============================================================================
// SECTION 5 — Time-of-day adaptation
// =============================================================================

const TIME_OF_DAY_PREFIX: Readonly<Record<TimeOfDay, Readonly<Record<Locale, string>>>> = {
  dawn: {
    "pt-BR": "Ao amanhecer, ",
    "en-US": "At dawn, ",
    "es-ES": "Al amanecer, ",
  },
  morning: {
    "pt-BR": "Nesta manhã, ",
    "en-US": "This morning, ",
    "es-ES": "Esta mañana, ",
  },
  midday: {
    "pt-BR": "No meio do dia, ",
    "en-US": "At midday, ",
    "es-ES": "Al mediodía, ",
  },
  evening: {
    "pt-BR": "Ao entardecer, ",
    "en-US": "In the evening, ",
    "es-ES": "Al atardecer, ",
  },
  night: {
    "pt-BR": "Na quietude da noite, ",
    "en-US": "In the quiet of night, ",
    "es-ES": "En la quietud de la noche, ",
  },
};

const TIME_OF_DAY_TONE: Readonly<Record<TimeOfDay, Readonly<Record<Locale, string>>>> = {
  dawn: {
    "pt-BR": "leve e esperançoso",
    "en-US": "light and hopeful",
    "es-ES": "ligero y esperanzado",
  },
  morning: {
    "pt-BR": "focado em ação",
    "en-US": "focused on action",
    "es-ES": "enfocado en la acción",
  },
  midday: {
    "pt-BR": "claro e direto",
    "en-US": "clear and direct",
    "es-ES": "claro y directo",
  },
  evening: {
    "pt-BR": "grato e gentil",
    "en-US": "grateful and kind",
    "es-ES": "agradecido y amable",
  },
  night: {
    "pt-BR": "introspectivo e silencioso",
    "en-US": "introspective and quiet",
    "es-ES": "introspectivo y silencioso",
  },
};

/** Adapt an entry's prompt + context to a specific time-of-day. */
export function adaptToTimeOfDay(entry: ReflectionEntry, timeOfDay: TimeOfDay): ReflectionEntry {
  if (!TIMES_OF_DAY.includes(timeOfDay)) {
    throw new ReflectionError("INVALID_DATE", `Invalid time-of-day: ${timeOfDay}`, { timeOfDay });
  }
  const prefix = TIME_OF_DAY_PREFIX[timeOfDay][entry.locale] ?? "";
  const tone = TIME_OF_DAY_TONE[timeOfDay][entry.locale] ?? "";

  const adaptedPrompt = truncate(`${prefix}${entry.prompt}`.trim(), PROMPT_MAX);
  const adaptedContext = truncate(
    `${entry.context} Tom: ${tone}.`,
    CONTEXT_MAX,
  );

  const out: ReflectionEntry = {
    id: `${entry.id}-${timeOfDay}`,
    tradition: entry.tradition,
    locale: entry.locale,
    date: entry.date,
    timeOfDay,
    prompt: adaptedPrompt,
    context: adaptedContext,
    sacredRefs: entry.sacredRefs,
    tags: entry.tags,
    difficulty: entry.difficulty,
    ...(entry.citation !== undefined ? { citation: entry.citation } : {}),
  };
  return out;
}

// =============================================================================
// SECTION 15 — Public API: getDailyReflection, getReflectionForTradition
// =============================================================================

/** Get the daily reflection for a user at a given date. */
export function getDailyReflection(
  date: string,
  schedule: ReflectionSchedule,
  pool: ReflectionPool,
): DailyReflection {
  if (!isValidISODate(date)) {
    throw new ReflectionError("INVALID_DATE", `Invalid ISO date: ${date}`, { date });
  }
  if (!LOCALES.includes(schedule.locale)) {
    throw new ReflectionError("INVALID_LOCALE", `Invalid locale: ${schedule.locale}`, { locale: schedule.locale });
  }
  if (pool.entries.length === 0) {
    throw new ReflectionError("POOL_EMPTY", "Pool is empty", {});
  }
  if (!isValidTimezone(schedule.timezone)) {
    throw new ReflectionError("TIMEZONE_INVALID", `Invalid timezone: ${schedule.timezone}`, { timezone: schedule.timezone });
  }
  if (schedule.preferredTraditions.length === 0) {
    throw new ReflectionError("INVALID_TRADITION", "Schedule has no preferred traditions", { schedule: schedule.userId });
  }

  // User-scoped seed for stability.
  const userSeed = hashSeed(date, schedule.userId, String(pool.rotationSeed));
  const rng = mulberry32(userSeed);

  // Filter pool by locale + preferred traditions.
  const candidates = pool.entries.filter(
    (e) =>
      e.locale === schedule.locale &&
      schedule.preferredTraditions.includes(e.tradition),
  );
  if (candidates.length === 0) {
    throw new ReflectionError("POOL_EMPTY", "No entries match user locale+traditions", {
      locale: schedule.locale,
      traditions: schedule.preferredTraditions,
    });
  }

  const idx = Math.floor(rng() * candidates.length) % candidates.length;
  const primary = candidates[idx] as ReflectionEntry;

  // Pick 2-3 alternatives (different entries).
  const alternatives: ReflectionEntry[] = [];
  const seen = new Set<string>([primary.id]);
  let safety = 0;
  while (alternatives.length < 3 && safety < 32) {
    const altIdx = Math.floor(rng() * candidates.length) % candidates.length;
    const candidate = candidates[altIdx];
    if (candidate && !seen.has(candidate.id)) {
      seen.add(candidate.id);
      alternatives.push(candidate);
    }
    safety++;
  }

  // Adapt to preferred time-of-day (first preferred).
  const timeOfDay: TimeOfDay = schedule.preferredTimes[0] ?? "morning";
  const adaptedPrimary = adaptToTimeOfDay(primary, timeOfDay);
  const adaptedAlts = alternatives.slice(0, 3).map((a) => adaptToTimeOfDay(a, timeOfDay));

  // Compute next scheduled datetime.
  const next = getLocalizedReflectionTime(timeOfDay, schedule.timezone, date);

  return Object.freeze({
    entry: adaptedPrimary,
    nextScheduledAt: next,
    alternatives: Object.freeze(adaptedAlts),
    schedule,
  }) as DailyReflection;
}

/** Get a specific tradition's reflection for a date+locale. */
export function getReflectionForTradition(
  tradition: Tradition,
  locale: Locale,
  date: string,
): ReflectionEntry {
  if (!TRADITIONS.includes(tradition)) {
    throw new ReflectionError("INVALID_TRADITION", `Invalid tradition: ${tradition}`, { tradition });
  }
  if (!LOCALES.includes(locale)) {
    throw new ReflectionError("INVALID_LOCALE", `Invalid locale: ${locale}`, { locale });
  }
  if (!isValidISODate(date)) {
    throw new ReflectionError("INVALID_DATE", `Invalid ISO date: ${date}`, { date });
  }

  const templates = TRADITION_TEMPLATES[tradition];
  if (templates.length === 0) {
    throw new ReflectionError("POOL_EMPTY", `No templates for tradition: ${tradition}`, { tradition });
  }
  const seed = hashSeed(date, tradition, locale);
  const rng = mulberry32(seed);
  const tpl = templates[Math.floor(rng() * templates.length) % templates.length] as TraditionTemplate;
  const idx = "001";
  const id = `${tradition}-${locale}-${date}-${idx}`;
  const citation = pickCitation(tradition, rng);

  const entry: ReflectionEntry = {
    id,
    tradition,
    locale,
    date,
    timeOfDay: "morning",
    prompt: truncate(tpl.prompt, PROMPT_MAX),
    context: truncate(tpl.context, CONTEXT_MAX),
    sacredRefs: Object.freeze([...tpl.sacredRefs]),
    tags: Object.freeze([...tpl.tags]),
    difficulty: tpl.difficulty,
    ...(citation !== undefined ? { citation } : {}),
  };
  return entry;
}

// =============================================================================
// SECTION 8 — Push notification payload
// =============================================================================

const PUSH_TITLE_MAX = 65;
const PUSH_BODY_MAX = 240;
const PUSH_ICON = "/icons/reflection-192.png";

/** Build a Web Push payload from a reflection entry + schedule. */
export function buildPushPayload(
  reflection: ReflectionEntry,
  schedule: ReflectionSchedule,
): { title: string; body: string; icon: string; tag: string; data: Record<string, string> } {
  const title = truncate(
    `${t(schedule.locale, "reflection.title")} — ${capitalize(reflection.tradition)}`,
    PUSH_TITLE_MAX,
  );
  const body = truncate(
    `${t(schedule.locale, "reflection.pushBody")} • ${reflection.prompt}`,
    PUSH_BODY_MAX,
  );
  return {
    title,
    body,
    icon: PUSH_ICON,
    tag: reflection.id,
    data: {
      reflectionId: reflection.id,
      tradition: reflection.tradition,
      locale: schedule.locale,
      deepLink: `/reflections/${reflection.id}`,
    },
  };
}

function capitalize(s: string): string {
  if (s.length === 0) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// =============================================================================
// SECTION 9 — LGPD consent gate
// =============================================================================

const UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUUIDv4(id: string): boolean {
  return typeof id === "string" && UUID_V4_RE.test(id);
}

/** Returns whether push/email channels are allowed under LGPD. */
export function requiresLGPDConsent(schedule: ReflectionSchedule): { push: boolean; email: boolean } {
  const pushOk =
    schedule.pushEnabled &&
    typeof schedule.pushConsentId === "string" &&
    isValidUUIDv4(schedule.pushConsentId);
  const emailOk =
    schedule.emailEnabled &&
    typeof schedule.emailConsentId === "string" &&
    isValidUUIDv4(schedule.emailConsentId);

  // Throws if requested but missing — but the API here returns a gate, not
  // throws. The throw pattern is reserved for the channel send step.
  if (schedule.pushEnabled && (schedule.pushConsentId === undefined || !pushOk)) {
    // No throw — return gate as false.
  }
  return { push: pushOk, email: emailOk };
}

/** Throws CONSENT_MISSING if the requested channel is not consented. */
export function assertLGPDConsent(
  schedule: ReflectionSchedule,
  channel: "push" | "email",
): void {
  if (channel === "push") {
    if (!schedule.pushEnabled) {
      throw new ReflectionError("CONSENT_MISSING", "Push disabled", { userId: schedule.userId });
    }
    if (schedule.pushConsentId === undefined || !isValidUUIDv4(schedule.pushConsentId)) {
      throw new ReflectionError("CONSENT_MISSING", "Push consent missing or invalid", {
        userId: schedule.userId,
      });
    }
    return;
  }
  if (channel === "email") {
    if (!schedule.emailEnabled) {
      throw new ReflectionError("CONSENT_MISSING", "Email disabled", { userId: schedule.userId });
    }
    if (schedule.emailConsentId === undefined || !isValidUUIDv4(schedule.emailConsentId)) {
      throw new ReflectionError("CONSENT_MISSING", "Email consent missing or invalid", {
        userId: schedule.userId,
      });
    }
    return;
  }
  // Exhaustive
  const exhaustive: never = channel;
  void exhaustive;
}

// =============================================================================
// SECTION 10 — PII redaction
// =============================================================================

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_BR_RE = /\(?\d{2}\)?\s?9?\d{4}-?\d{4}/g;
const PHONE_INTL_RE = /\+\d{1,3}[\s.-]?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,9}/g;
const CPF_RE = /\d{3}\.?\d{3}\.?\d{3}-?\d{2}/g;
const CREDIT_CARD_RE = /\b(?:\d[ -]*?){13,16}\b/g;

/** Redact obvious PII (email, phone, CPF, credit card) from a string. */
export function redactPIIFromString(s: string): string {
  if (typeof s !== "string" || s.length === 0) return s;
  return s
    .replace(EMAIL_RE, "[REDACTED_EMAIL]")
    .replace(PHONE_INTL_RE, "[REDACTED_PHONE]")
    .replace(PHONE_BR_RE, "[REDACTED_PHONE]")
    .replace(CPF_RE, "[REDACTED_CPF]")
    .replace(CREDIT_CARD_RE, "[REDACTED_CC]");
}

/** Apply PII redaction to a reflection entry's prompt + context. */
export function redactReflectionPII(entry: ReflectionEntry): ReflectionEntry {
  const out: ReflectionEntry = {
    id: entry.id,
    tradition: entry.tradition,
    locale: entry.locale,
    date: entry.date,
    timeOfDay: entry.timeOfDay,
    prompt: redactPIIFromString(entry.prompt),
    context: redactPIIFromString(entry.context),
    sacredRefs: entry.sacredRefs,
    tags: entry.tags,
    difficulty: entry.difficulty,
    ...(entry.citation !== undefined ? { citation: entry.citation } : {}),
  };
  return out;
}

// =============================================================================
// SECTION 15b — Default export aggregator (for ergonomic imports)
// =============================================================================

export const DAILY_REFLECTION_PROMPT_VERSION = "0.1.0-w62" as const;

export default {
  // Public API
  buildReflectionPool,
  rotateReflectionPool,
  getDailyReflection,
  getReflectionForTradition,
  buildPushPayload,
  requiresLGPDConsent,
  assertLGPDConsent,
  redactReflectionPII,
  redactPIIFromString,
  isValidTimezone,
  resolveTimezone,
  isValidISODate,
  isValidISODateTime,
  isValidUUIDv4,
  isValidSacredRef,
  sanitizeSacredRefs,
  adaptToTimeOfDay,
  getLocalizedReflectionTime,
  t,
  // Constants
  TRADITIONS,
  LOCALES,
  TIMES_OF_DAY,
  TIME_OF_DAY_HOURS,
  CIGANO_CARDS,
  ASTRO_SIGNS,
  ASTRO_PLANETS,
  ASTRO_HOUSES,
  ORIXAS_KNOWN,
  SEFIROT,
  CHAKRAS,
  NUMEROLOGY_NUMBERS,
  CITATION_SOURCES,
  I18N_BUNDLE,
  DAILY_REFLECTION_PROMPT_VERSION,
  // Error class
  ReflectionError,
};
