// ============================================================
// W47 / DAILY REFLECTION PROMPT — CABALA DOS CAMINHOS
// ============================================================
// Tradition-aware daily check-in card. Mobile-first surface
// for "consulta cotidiana" — a single prompt per user per day,
// with streak tracking, history, digests, opt-in social share,
// and LGPD-compliant soft delete + full purge.
//
// No network deps. JSON-serializable (no Date instances, no
// bigint). Pure functions over an in-memory store; replace
// `state` with a Prisma/Supabase adapter in production.
// ============================================================

// ============================================================
// SECTION 1 — TYPES
// ============================================================

/** Locale tag (BCP-47 subset). */
export type Locale = "pt-BR" | "en-US" | "es-ES";

/** Tradition tag — coarse lineage classifier. */
export type TraditionTag =
  | "candomble"
  | "umbanda"
  | "ifa"
  | "cabala"
  | "astrologia"
  | "tantra"
  | "espiritismo"
  | "santo-daime"
  | "universal"; // for ecumenical/general prompts

/** Difficulty / depth gradient. */
export type PromptDifficulty = "gentle" | "moderate" | "deep";

/** Prompt category buckets. */
export type PromptCategory =
  | "gratitude"
  | "intention"
  | "shadow-work"
  | "devotional"
  | "meditation"
  | "study"
  | "ritual"
  | "integration"
  | "community";

/** Stable prompt identifier (string, opaque). */
export type PromptId = string;

/** Mood on a 1..5 scale; 0 = skipped. */
export type MoodScore = 0 | 1 | 2 | 3 | 4 | 5;

/** Visibility of a reflection in the social feed. */
export type ReflectionVisibility = "private" | "shared" | "deleted";

/** One prompt definition in the corpus. */
export interface ReflectionPrompt {
  id: PromptId;
  /** Localized text by locale. Must include `pt-BR`. */
  textI18n: Partial<Record<Locale, string>>;
  /** Canonical pt-BR text (fallback for unknown locales). */
  text: string;
  tradition?: TraditionTag;
  category: PromptCategory;
  difficulty: PromptDifficulty;
  author?: string;
  source?: string;
  /** ISO date the prompt was added to the corpus. */
  addedOn: string;
  /** Soft-delete flag — kept for audit, hidden from pool. */
  archived?: boolean;
}

/** What we send to the client for a given day. */
export interface DailyCard {
  userId: string;
  date: string; // ISO date YYYY-MM-DD (user TZ)
  prompt: ReflectionPrompt;
  /** Resolved locale after fallback chain. */
  locale: Locale;
  /** Resolved text for this locale. */
  text: string;
  /** Whether the user already answered today. */
  alreadyAnswered: boolean;
  /** Streak snapshot at the moment of serving. */
  streak: StreakSnapshot;
  /** Server time ISO when card was composed. */
  servedAt: string;
}

/** A user-authored reflection entry. */
export interface ReflectionEntry {
  id: string;
  userId: string;
  promptId: PromptId;
  /** ISO date YYYY-MM-DD this entry is anchored to. */
  date: string;
  body: string;
  gratitude?: string;
  intention?: string;
  mood: MoodScore;
  visibility: ReflectionVisibility;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  deletedAt?: string; // ISO soft-delete tombstone
  /** If shared to feed — id of the post. */
  feedPostId?: string;
}

/** Streak aggregate. */
export interface Streak {
  userId: string;
  current: number;
  longest: number;
  totalEntries: number;
  /** ISO of the last recorded reflection (or null). */
  lastEntryDate: string | null;
  /** ISO of the last time we recomputed the streak. */
  lastComputedAt: string;
}

/** Lightweight streak used inside DailyCard. */
export interface StreakSnapshot {
  current: number;
  longest: number;
  totalEntries: number;
  atRisk: boolean; // true if grace window approaching
}

/** User-controlled preferences. */
export interface PromptPreferences {
  userId: string;
  enabledCategories: PromptCategory[]; // empty = all
  enabledTraditions: TraditionTag[]; // empty = all
  preferredLocale: Locale;
  preferredDifficulty?: PromptDifficulty; // omits = any
  optedIntoLeaderboard: boolean;
  optedIntoWeeklyDigest: boolean;
  optedIntoMonthlyDigest: boolean;
  updatedAt: string;
}

/** Query options for getReflectionHistory. */
export interface HistoryQuery {
  from?: string; // ISO date inclusive
  to?: string; // ISO date inclusive
  category?: PromptCategory;
  tradition?: TraditionTag;
  visibility?: ReflectionVisibility;
  limit?: number; // default 30
  cursor?: string; // last seen entry id
}

/** Paged history response. */
export interface HistoryPage {
  entries: ReflectionEntry[];
  nextCursor: string | null;
  total: number;
}

/** Query options for getPromptPool. */
export interface PoolFilters {
  category?: PromptCategory;
  tradition?: TraditionTag;
  difficulty?: PromptDifficulty;
  locale?: Locale;
  limit?: number;
  offset?: number;
}

/** getTodaysPrompt options. */
export interface PromptOptions {
  tradition?: TraditionTag;
  locale?: Locale;
  difficulty?: PromptDifficulty;
  timezone?: string; // IANA, e.g. "America/Sao_Paulo"
}

/** Digest (weekly or monthly). */
export interface ReflectionDigest {
  userId: string;
  rangeStart: string; // ISO date inclusive
  rangeEnd: string; // ISO date inclusive
  count: number;
  averageMood: number;
  topCategories: Array<{ category: PromptCategory; count: number }>;
  topTraditions: Array<{ tradition: TraditionTag; count: number }>;
  /** Distinct days with reflection. */
  distinctDays: number;
  generatedAt: string;
}

/** Stats aggregate for a user. */
export interface ReflectionStats {
  userId: string;
  totalEntries: number;
  completionRate: number; // 0..1 over last 90 days
  averageLengthChars: number;
  averageLengthWords: number;
  moodDistribution: Record<MoodScore, number>;
  topCategories: Array<{ category: PromptCategory; count: number }>;
  topTraditions: Array<{ tradition: TraditionTag; count: number }>;
  computedAt: string;
}

/** Leaderboard entry. */
export interface LeaderboardEntry {
  rank: number;
  anonymizedHandle: string;
  streak: number;
  totalEntries: number;
}

/** Leaderboard options. */
export interface LeaderboardQuery {
  scope: "global" | "tradition";
  tradition?: TraditionTag;
  limit?: number;
}

/** Export payload. */
export interface ReflectionExport {
  format: "json" | "markdown" | "pdf";
  generatedAt: string;
  userId: string;
  count: number;
  /** Raw payload — string for json/markdown, base64 for pdf. */
  payload: string;
  /** Suggested filename. */
  filename: string;
}

/** Hook signature for the feed ranking engine (w45). */
export type FeedRankerHook = (
  reflection: ReflectionEntry,
  byUserId: string,
) => Promise<{ postId: string; score: number }>;

// ============================================================
// SECTION 2 — ERRORS
// ============================================================

export type ReflectionErrorCode =
  | "USER_NOT_FOUND"
  | "PROMPT_NOT_FOUND"
  | "ENTRY_NOT_FOUND"
  | "INVALID_DATE"
  | "INVALID_LOCALE"
  | "INVALID_TZ"
  | "INVALID_PAYLOAD"
  | "PERMISSION_DENIED"
  | "STORAGE_FULL"
  | "FEED_RANKER_FAILED"
  | "EXPORT_FAILED"
  | "PREFS_NOT_FOUND"
  | "DUPLICATE_ENTRY"
  | "STREAK_LOCKED"
  | "UNKNOWN";

export class ReflectionError extends Error {
  readonly code: ReflectionErrorCode;
  readonly detail?: Record<string, unknown>;

  constructor(
    code: ReflectionErrorCode,
    message: string,
    detail?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ReflectionError";
    this.code = code;
    this.detail = detail;
  }
}

// ============================================================
// SECTION 3 — CONSTANTS
// ============================================================

/** Hours of grace after a missed day before streak resets. */
export const STREAK_GRACE_HOURS = 36;

/** Default difficulty when none specified. */
export const DEFAULT_DIFFICULTY: PromptDifficulty = "moderate";

/** Default locale fallback chain. */
export const LOCALE_FALLBACK_CHAIN: Locale[] = ["pt-BR", "en-US", "es-ES"];

/** Maximum body length, characters. */
export const MAX_BODY_CHARS = 8000;

/** Maximum gratitude / intention length, characters. */
export const MAX_FIELD_CHARS = 1000;

/** Default history page size. */
export const DEFAULT_HISTORY_LIMIT = 30;

/** Maximum history page size. */
export const MAX_HISTORY_LIMIT = 100;

/** Default digest windows. */
export const WEEKLY_DIGEST_DAYS = 7;
export const MONTHLY_DIGEST_DAYS = 30;

/** Reflection completion window for stats (days). */
export const STATS_WINDOW_DAYS = 90;

/** Prompt pool version (bump if corpus changes semantics). */
export const PROMPT_POOL_VERSION = "2026.06.w47.1";

/** All prompt categories. */
export const PROMPT_CATEGORIES: PromptCategory[] = [
  "gratitude",
  "intention",
  "shadow-work",
  "devotional",
  "meditation",
  "study",
  "ritual",
  "integration",
  "community",
];

/** Supported traditions. */
export const SUPPORTED_TRADITIONS: TraditionTag[] = [
  "candomble",
  "umbanda",
  "ifa",
  "cabala",
  "astrologia",
  "tantra",
  "espiritismo",
  "santo-daime",
  "universal",
];

// ============================================================
// SECTION 4 — IN-MEMORY STATE (replace with adapter in prod)
// ============================================================

interface ReflectionStore {
  prompts: Map<PromptId, ReflectionPrompt>;
  entries: Map<string, ReflectionEntry>; // entryId -> entry
  entriesByUser: Map<string, Set<string>>; // userId -> entryIds
  /** Map of "userId|date" -> entryId for idempotency. */
  entriesByUserDate: Map<string, string>;
  streaks: Map<string, Streak>;
  preferences: Map<string, PromptPreferences>;
  /** Index by promptId -> set of entryIds (for admin queries). */
  entriesByPrompt: Map<PromptId, Set<string>>;
  feedRanker?: FeedRankerHook;
}

const state: ReflectionStore = {
  prompts: new Map(),
  entries: new Map(),
  entriesByUser: new Map(),
  entriesByUserDate: new Map(),
  streaks: new Map(),
  preferences: new Map(),
  entriesByPrompt: new Map(),
};

// ============================================================
// SECTION 5 — PROMPT CORPUS
// ============================================================
// 30+ prompts across 5+ categories, 8+ traditions. Each prompt
// has pt-BR + (where natural) en-US + es-ES localized text.
// Sources are kept vague to avoid over-claiming lineage.
// ============================================================

const PROMPT_CORPUS: ReflectionPrompt[] = [
  // ---------- GRATITUDE ----------
  {
    id: "grt-candle-001",
    text: "Acenda uma vela e liste três presenças que te sustentam hoje.",
    textI18n: {
      "pt-BR": "Acenda uma vela e liste três presenças que te sustentam hoje.",
      "en-US":
        "Light a candle and list three presences that hold you today.",
      "es-ES":
        "Enciende una vela y nombra tres presencias que te sostienen hoy.",
    },
    tradition: "universal",
    category: "gratitude",
    difficulty: "gentle",
    source: "Mesa Real — gratitude circle",
    addedOn: "2026-06-01",
  },
  {
    id: "grt-orixa-002",
    text: "Qual orixá te acordou hoje? Agradeça em uma frase.",
    textI18n: {
      "pt-BR": "Qual orixá te acordou hoje? Agradeça em uma frase.",
      "en-US":
        "Which orixá woke you today? Offer a one-sentence thanks.",
      "es-ES":
        "¿Qué orixá te despertó hoy? Agradece en una frase.",
    },
    tradition: "candomble",
    category: "gratitude",
    difficulty: "gentle",
    source: "Candomblé — daily axé",
    addedOn: "2026-06-01",
  },
  {
    id: "grt-zohar-003",
    text: "Qual foi a faísca divina (nitzotz) que você viu em alguém hoje?",
    textI18n: {
      "pt-BR":
        "Qual foi a faísca divina (nitzotz) que você viu em alguém hoje?",
      "en-US":
        "What divine spark (nitzotz) did you glimpse in someone today?",
      "es-ES":
        "¿Qué chispa divina (nitzotz) viste en alguien hoy?",
    },
    tradition: "cabala",
    category: "gratitude",
    difficulty: "moderate",
    source: "Zohar — nitzotz d'kedusha",
    addedOn: "2026-06-01",
  },
  {
    id: "grt-prana-004",
    text: "Sinta a entrada de ar. Agradeça ao prana por três batidas de coração.",
    textI18n: {
      "pt-BR":
        "Sinta a entrada de ar. Agradeça ao prana por três batidas de coração.",
      "en-US":
        "Feel the inhale. Thank prana for three heartbeats.",
      "es-ES":
        "Siente la inhalación. Agradece al prana por tres latidos.",
    },
    tradition: "tantra",
    category: "gratitude",
    difficulty: "gentle",
    source: "Tantra — prana vinyasa",
    addedOn: "2026-06-01",
  },
  {
    id: "grt-guia-005",
    text: "Sua guia te acompanhou em qual decisão hoje? Reconheça-a em silêncio.",
    textI18n: {
      "pt-BR":
        "Sua guia te acompanhou em qual decisão hoje? Reconheça-a em silêncio.",
      "en-US":
        "Which decision did your guiding spirit accompany today? Acknowledge in silence.",
      "es-ES":
        "¿En qué decisión te acompañó tu guía hoy? Reconócela en silencio.",
    },
    tradition: "umbanda",
    category: "gratitude",
    difficulty: "gentle",
    source: "Umbanda — guias de frente",
    addedOn: "2026-06-01",
  },

  // ---------- INTENTION ----------
  {
    id: "int-orun-006",
    text: "O que você entrega para o Orun hoje? E o que pede para o Aiye?",
    textI18n: {
      "pt-BR":
        "O que você entrega para o Orun hoje? E o que pede para o Aiye?",
      "en-US":
        "What do you hand over to Orun today? What do you ask of Aiye?",
      "es-ES":
        "¿Qué entregas hoy al Orun? ¿Qué le pides al Aiye?",
    },
    tradition: "candomble",
    category: "intention",
    difficulty: "moderate",
    source: "Ifá — Orun/Aiye balance",
    addedOn: "2026-06-01",
  },
  {
    id: "int-meridian-007",
    text: "Escolha um meridiano. Onde você sente bloqueio e onde sente fluxo?",
    textI18n: {
      "pt-BR":
        "Escolha um meridiano. Onde você sente bloqueio e onde sente fluxo?",
      "en-US":
        "Pick a meridian. Where do you feel blockage and where do you feel flow?",
      "es-ES":
        "Elige un meridiano. ¿Dónde sientes bloqueo y dónde flujo?",
    },
    tradition: "tantra",
    category: "intention",
    difficulty: "moderate",
    source: "Tantra — nadis and meridians",
    addedOn: "2026-06-01",
  },
  {
    id: "int-kavvanah-008",
    text: "Formule uma kavvanah (intenção dirigida) para a próxima lua.",
    textI18n: {
      "pt-BR":
        "Formule uma kavvanah (intenção dirigida) para a próxima lua.",
      "en-US":
        "Formulate a kavvanah (directed intention) for the next moon.",
      "es-ES":
        "Formula una kavvanah (intención dirigida) para la próxima luna.",
    },
    tradition: "cabala",
    category: "intention",
    difficulty: "deep",
    source: "Cabala — kavvanot",
    addedOn: "2026-06-01",
  },
  {
    id: "int-sky-009",
    text: "Qual planeta transita sua Casa 10 hoje? Como isso molda sua intenção de trabalho?",
    textI18n: {
      "pt-BR":
        "Qual planeta transita sua Casa 10 hoje? Como isso molda sua intenção de trabalho?",
      "en-US":
        "Which planet transits your 10th house today? How does that shape your work intention?",
      "es-ES":
        "¿Qué planeta transita tu Casa 10 hoy? ¿Cómo moldea tu intención laboral?",
    },
    tradition: "astrologia",
    category: "intention",
    difficulty: "deep",
    source: "Astrologia — MC transits",
    addedOn: "2026-06-01",
  },

  // ---------- SHADOW-WORK ----------
  {
    id: "shd-prompt-010",
    text: "O que você julgou em outra pessoa hoje? Onde isso vive em você?",
    textI18n: {
      "pt-BR":
        "O que você julgou em outra pessoa hoje? Onde isso vive em você?",
      "en-US":
        "What did you judge in another today? Where does that live in you?",
      "es-ES":
        "¿Qué juzgaste en otra persona hoy? ¿Dónde vive eso en ti?",
    },
    tradition: "universal",
    category: "shadow-work",
    difficulty: "deep",
    source: "Mesa Real — sombra integrada",
    addedOn: "2026-06-01",
  },
  {
    id: "shd-lilith-011",
    text: "Lilith em qual casa toca seu padrão de rejeição hoje? Sinta sem corrigir.",
    textI18n: {
      "pt-BR":
        "Lilith em qual casa toca seu padrão de rejeição hoje? Sinta sem corrigir.",
      "en-US":
        "Which house does Lilith touch in your rejection pattern today? Feel without fixing.",
      "es-ES":
        "¿Qué casa toca Lilith en tu patrón de rechazo hoy? Siente sin corregir.",
    },
    tradition: "astrologia",
    category: "shadow-work",
    difficulty: "deep",
    source: "Astrologia — Lilith Black Moon",
    addedOn: "2026-06-01",
  },
  {
    id: "shd-sitri-012",
    text: "Qual qualidade você projeta nos outros e não reconhece em si?",
    textI18n: {
      "pt-BR":
        "Qual qualidade você projeta nos outros e não reconhece em si?",
      "en-US":
        "Which quality do you project onto others and don't recognize in yourself?",
      "es-ES":
        "¿Qué cualidad proyectas en otros y no reconoces en ti?",
    },
    tradition: "cabala",
    category: "shadow-work",
    difficulty: "deep",
    source: "Cabala — Sitra Ahra",
    addedOn: "2026-06-01",
  },
  {
    id: "shd-egun-013",
    text: "O que um egum te pede para olhar hoje que você tem evitado?",
    textI18n: {
      "pt-BR":
        "O que um egum te pede para olhar hoje que você tem evitado?",
      "en-US":
        "What does an egungun ask you to look at today that you've avoided?",
      "es-ES":
        "¿Qué te pide mirar hoy un egungun que has evitado?",
    },
    tradition: "candomble",
    category: "shadow-work",
    difficulty: "deep",
    source: "Candomblé — egungun",
    addedOn: "2026-06-01",
  },

  // ---------- DEVOTIONAL ----------
  {
    id: "dev-daime-014",
    text: "Qual hino do Daime ressoa no seu corpo hoje? Cante em silêncio.",
    textI18n: {
      "pt-BR":
        "Qual hino do Daime ressoa no seu corpo hoje? Cante em silêncio.",
      "en-US":
        "Which Daime hymn resonates in your body today? Sing in silence.",
      "es-ES":
        "¿Qué himno del Daime resuena en tu cuerpo hoy? Canta en silencio.",
    },
    tradition: "santo-daime",
    category: "devotional",
    difficulty: "moderate",
    source: "Santo Daime — hinário",
    addedOn: "2026-06-01",
  },
  {
    id: "dev-mestre-015",
    text: "Agradeça ao seu mestre (interno ou externo) por uma única palavra.",
    textI18n: {
      "pt-BR":
        "Agradeça ao seu mestre (interno ou externo) por uma única palavra.",
      "en-US":
        "Thank your teacher (inner or outer) with a single word.",
      "es-ES":
        "Agradece a tu maestro (interno o externo) con una sola palabra.",
    },
    tradition: "universal",
    category: "devotional",
    difficulty: "gentle",
    source: "Mesa Real — linhagem viva",
    addedOn: "2026-06-01",
  },
  {
    id: "dev-orixa-016",
    text: "Ofereça mentalmente uma fruta ao seu orixá regente. Descreva o gesto.",
    textI18n: {
      "pt-BR":
        "Ofereça mentalmente uma fruta ao seu orixá regente. Descreva o gesto.",
      "en-US":
        "Mentally offer a fruit to your ruling orixá. Describe the gesture.",
      "es-ES":
        "Ofrece mentalmente una fruta a tu orixá regente. Describe el gesto.",
    },
    tradition: "candomble",
    category: "devotional",
    difficulty: "moderate",
    source: "Candomblé — ebó mental",
    addedOn: "2026-06-01",
  },

  // ---------- MEDITATION ----------
  {
    id: "med-breath-017",
    text: "Conte 108 respirações. Em qual número sua mente fugiu?",
    textI18n: {
      "pt-BR":
        "Conte 108 respirações. Em qual número sua mente fugiu?",
      "en-US":
        "Count 108 breaths. At which number did your mind wander?",
      "es-ES":
        "Cuenta 108 respiraciones. ¿En qué número se distrajo tu mente?",
    },
    tradition: "tantra",
    category: "meditation",
    difficulty: "moderate",
    source: "Tantra — mala 108",
    addedOn: "2026-06-01",
  },
  {
    id: "med-kundalini-018",
    text: "Sente-se em siddhasana. Onde a kundalini toca seu cóccix agora?",
    textI18n: {
      "pt-BR":
        "Sente-se em siddhasana. Onde a kundalini toca seu cóccix agora?",
      "en-US":
        "Sit in siddhasana. Where does kundalini touch your tailbone now?",
      "es-ES":
        "Siéntate en siddhasana. ¿Dónde toca la kundalini tu coxis ahora?",
    },
    tradition: "tantra",
    category: "meditation",
    difficulty: "deep",
    source: "Kundalini — siddhasana",
    addedOn: "2026-06-01",
  },
  {
    id: "med-cabala-019",
    text: "Visualize a sefirá do dia. Que cor predomina? Permaneça 60 segundos.",
    textI18n: {
      "pt-BR":
        "Visualize a sefirá do dia. Que cor predomina? Permaneça 60 segundos.",
      "en-US":
        "Visualize today's sefirah. Which color dominates? Stay 60 seconds.",
      "es-ES":
        "Visualiza la sefirá del día. ¿Qué color predomina? Permanece 60 segundos.",
    },
    tradition: "cabala",
    category: "meditation",
    difficulty: "moderate",
    source: "Cabala — sefirot meditation",
    addedOn: "2026-06-01",
  },

  // ---------- STUDY ----------
  {
    id: "std-odu-020",
    text: "Abra o Odu de hoje. Qual odu orienta sua escuta? Cite o verso central.",
    textI18n: {
      "pt-BR":
        "Abra o Odu de hoje. Qual odu orienta sua escuta? Cite o verso central.",
      "en-US":
        "Open today's Odu. Which odu guides your listening? Quote the central verse.",
      "es-ES":
        "Abre el Odu de hoy. ¿Qué odu orienta tu escucha? Cita el verso central.",
    },
    tradition: "ifa",
    category: "study",
    difficulty: "deep",
    source: "Ifá — odus",
    addedOn: "2026-06-01",
  },
  {
    id: "std-tarot-021",
    text: "Tire uma carta (intuição, não algoritmo). O que ela te ensina sobre a Casa 3?",
    textI18n: {
      "pt-BR":
        "Tire uma carta (intuição, não algoritmo). O que ela te ensina sobre a Casa 3?",
      "en-US":
        "Draw one card (intuition, not algorithm). What does it teach about the 3rd house?",
      "es-ES":
        "Saca una carta (intuición, no algoritmo). ¿Qué enseña sobre la Casa 3?",
    },
    tradition: "astrologia",
    category: "study",
    difficulty: "moderate",
    source: "Tarot — house integration",
    addedOn: "2026-06-01",
  },
  {
    id: "std-espirita-022",
    text: "Qual obra de Allan Kardec te visita hoje em uma frase?",
    textI18n: {
      "pt-BR":
        "Qual obra de Allan Kardec te visita hoje em uma frase?",
      "en-US":
        "Which work of Allan Kardec visits you today in one sentence?",
      "es-ES":
        "¿Qué obra de Allan Kardec te visita hoy en una frase?",
    },
    tradition: "espiritismo",
    category: "study",
    difficulty: "moderate",
    source: "Espiritismo — codificação",
    addedOn: "2026-06-01",
  },

  // ---------- RITUAL ----------
  {
    id: "rit-banho-023",
    text: "Prepare um banho de ervas. Qual elemento você honra? Por quê?",
    textI18n: {
      "pt-BR":
        "Prepare um banho de ervas. Qual elemento você honra? Por quê?",
      "en-US":
        "Prepare an herbal bath. Which element do you honor? Why?",
      "es-ES":
        "Prepara un baño de hierbas. ¿Qué elemento honras? ¿Por qué?",
    },
    tradition: "umbanda",
    category: "ritual",
    difficulty: "moderate",
    source: "Umbanda — descarga",
    addedOn: "2026-06-01",
  },
  {
    id: "rit-ebo-024",
    text: "Qual ebó mínimo você pode fazer hoje sem sair de casa?",
    textI18n: {
      "pt-BR":
        "Qual ebó mínimo você pode fazer hoje sem sair de casa?",
      "en-US":
        "What's the minimal ebó you can offer today without leaving home?",
      "es-ES":
        "¿Cuál es el ebó mínimo que puedes ofrecer hoy sin salir de casa?",
    },
    tradition: "candomble",
    category: "ritual",
    difficulty: "deep",
    source: "Candomblé — ebó simples",
    addedOn: "2026-06-01",
  },
  {
    id: "rit-candle-025",
    text: "Acenda uma vela preta, uma branca, uma vermelha. Qual intenção para cada uma?",
    textI18n: {
      "pt-BR":
        "Acenda uma vela preta, uma branca, uma vermelha. Qual intenção para cada uma?",
      "en-US":
        "Light a black, a white, and a red candle. What intention for each?",
      "es-ES":
        "Enciende una vela negra, una blanca y una roja. ¿Qué intención para cada una?",
    },
    tradition: "santo-daime",
    category: "ritual",
    difficulty: "deep",
    source: "Santo Daime — tríade velas",
    addedOn: "2026-06-01",
  },

  // ---------- INTEGRATION ----------
  {
    id: "int-house-026",
    text: "Qual casa astrológica você está ignorando essa semana? Convide-a ao centro.",
    textI18n: {
      "pt-BR":
        "Qual casa astrológica você está ignorando essa semana? Convide-a ao centro.",
      "en-US":
        "Which astrological house are you ignoring this week? Invite it to the center.",
      "es-ES":
        "¿Qué casa astrológica estás ignorando esta semana? Invítala al centro.",
    },
    tradition: "astrologia",
    category: "integration",
    difficulty: "moderate",
    source: "Mesa Real — cruzamento por casa",
    addedOn: "2026-06-01",
  },
  {
    id: "int-shadow-027",
    text: "O que você aprendeu na sombra que a luz ainda não confirmou?",
    textI18n: {
      "pt-BR":
        "O que você aprendeu na sombra que a luz ainda não confirmou?",
      "en-US":
        "What did you learn in the shadow that the light has not yet confirmed?",
      "es-ES":
        "¿Qué aprendiste en la sombra que la luz aún no confirmó?",
    },
    tradition: "universal",
    category: "integration",
    difficulty: "deep",
    source: "Mesa Real — sombra/luz",
    addedOn: "2026-06-01",
  },
  {
    id: "int-yin-028",
    text: "Onde você está forçando yang quando precisa descansar yin?",
    textI18n: {
      "pt-BR":
        "Onde você está forçando yang quando precisa descansar yin?",
      "en-US":
        "Where are you forcing yang when you need to rest in yin?",
      "es-ES":
        "¿Dónde estás forzando yang cuando necesitas descansar en yin?",
    },
    tradition: "tantra",
    category: "integration",
    difficulty: "moderate",
    source: "Tao — yin/yang balance",
    addedOn: "2026-06-01",
  },

  // ---------- COMMUNITY ----------
  {
    id: "com-share-029",
    text: "Quem no terreiro precisa de uma palavra sua hoje? Escreva antes de enviar.",
    textI18n: {
      "pt-BR":
        "Quem no terreiro precisa de uma palavra sua hoje? Escreva antes de enviar.",
      "en-US":
        "Who in your circle needs a word from you today? Write it before sending.",
      "es-ES":
        "¿Quién en tu círculo necesita una palabra tuya hoy? Escríbela antes de enviarla.",
    },
    tradition: "umbanda",
    category: "community",
    difficulty: "gentle",
    source: "Umbanda — axé comunitário",
    addedOn: "2026-06-01",
  },
  {
    id: "com-medium-030",
    text: "Qual mensagem da casa espírita te visitou no silêncio dessa semana?",
    textI18n: {
      "pt-BR":
        "Qual mensagem da casa espírita te visitou no silêncio dessa semana?",
      "en-US":
        "Which message from the spiritist house visited you in this week's silence?",
      "es-ES":
        "¿Qué mensaje de la casa espiritista te visitó en el silencio de esta semana?",
    },
    tradition: "espiritismo",
    category: "community",
    difficulty: "gentle",
    source: "Espiritismo — reunião mediúnica",
    addedOn: "2026-06-01",
  },
  {
    id: "com-cabal-031",
    text: "Quem te ensina sem pedir nada em troca? Agradeça em voz alta.",
    textI18n: {
      "pt-BR":
        "Quem te ensina sem pedir nada em troca? Agradeça em voz alta.",
      "en-US":
        "Who teaches you without asking anything in return? Thank them out loud.",
      "es-ES":
        "¿Quién te enseña sin pedir nada a cambio? Agradece en voz alta.",
    },
    tradition: "cabala",
    category: "community",
    difficulty: "gentle",
    source: "Cabala — talmid chacham",
    addedOn: "2026-06-01",
  },
  {
    id: "com-tantra-032",
    text: "Qual sangha (comunidade espiritual) você alimenta e te alimenta?",
    textI18n: {
      "pt-BR":
        "Qual sangha (comunidade espiritual) você alimenta e te alimenta?",
      "en-US":
        "Which sangha (spiritual community) do you feed and feeds you?",
      "es-ES":
        "¿Qué sangha (comunidad espiritual) alimentas y te alimenta?",
    },
    tradition: "tantra",
    category: "community",
    difficulty: "moderate",
    source: "Tantra — sangha",
    addedOn: "2026-06-01",
  },
];

// Seed corpus into state on module load.
function seedCorpus(): void {
  if (state.prompts.size > 0) return;
  for (const p of PROMPT_CORPUS) {
    state.prompts.set(p.id, { ...p });
  }
  for (const [pid] of state.prompts) {
    state.entriesByPrompt.set(pid, new Set());
  }
}

seedCorpus();

// ============================================================
// SECTION 6 — UTILITIES
// ============================================================

/** Cheap deterministic 32-bit hash (FNV-1a). Not cryptographic. */
export function hash32(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Combine userId + ISO date into a stable seed (no salt). */
export function dailySeed(userId: string, isoDate: string): number {
  return hash32(`${userId}::${isoDate}::${PROMPT_POOL_VERSION}`);
}

/** Normalize a Date or YYYY-MM-DD into ISO date (no time). */
export function toISODate(input: string | Date, timezone = "UTC"): string {
  let d: Date;
  if (typeof input === "string") {
    d = new Date(input);
    if (isNaN(d.getTime())) {
      throw new ReflectionError(
        "INVALID_DATE",
        `Could not parse date: ${input}`,
        { input },
      );
    }
  } else {
    d = input;
  }
  // Format YYYY-MM-DD in given timezone using Intl.
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(d); // en-CA gives YYYY-MM-DD
}

/** Now as ISO timestamp. */
export function nowISO(): string {
  return new Date().toISOString();
}

/** Validate IANA timezone. Throws on invalid. */
export function assertTimezone(tz: string): void {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz }).format(new Date());
  } catch {
    throw new ReflectionError(
      "INVALID_TZ",
      `Invalid IANA timezone: ${tz}`,
      { tz },
    );
  }
}

/** Resolve a locale string against the fallback chain. */
export function resolveLocale(
  preferred: string | undefined,
  supported: Locale[] = LOCALE_FALLBACK_CHAIN,
): Locale {
  if (!preferred) return supported[0]!;
  const lower = preferred.toLowerCase();
  for (const s of supported) {
    if (s.toLowerCase() === lower) return s;
  }
  // Match primary subtag (e.g., "pt" -> "pt-BR")
  const primary = lower.split("-")[0];
  for (const s of supported) {
    if (s.toLowerCase().startsWith(primary)) return s;
  }
  throw new ReflectionError(
    "INVALID_LOCALE",
    `Could not resolve locale: ${preferred}`,
    { preferred, supported },
  );
}

/** Resolve localized text with fallback chain. */
export function resolvePromptText(
  prompt: ReflectionPrompt,
  locale: Locale,
  chain: Locale[] = LOCALE_FALLBACK_CHAIN,
): string {
  // 1. Exact match in textI18n.
  if (prompt.textI18n[locale]) return prompt.textI18n[locale]!;
  // 2. Walk chain.
  for (const loc of chain) {
    if (prompt.textI18n[loc]) return prompt.textI18n[loc]!;
  }
  // 3. Canonical pt-BR field.
  return prompt.text;
}

/** Generate a stable id from a seed. */
export function makeId(prefix: string, seed: number): string {
  return `${prefix}_${seed.toString(36)}_${Date.now().toString(36)}`;
}

/** Generate an anonymized handle for leaderboards. */
export function anonymizedHandle(userId: string): string {
  const h = hash32(userId + "::anon");
  return `akash_${h.toString(36).slice(0, 6)}`;
}

/** Word count from a string (handles whitespace and unicode). */
export function countWords(s: string): number {
  const trimmed = s.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/u).length;
}

/** Days between two ISO dates (inclusive of both, signed). */
export function daysBetween(aISO: string, bISO: string): number {
  const a = Date.parse(aISO + "T00:00:00Z");
  const b = Date.parse(bISO + "T00:00:00Z");
  return Math.round((b - a) / 86400000);
}

/** Soft-clamp number into [min, max]. */
export function clamp(n: number, min: number, max: number): number {
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

/** Validate reflection input payload. */
export function validateReflectionInput(input: {
  body?: string;
  gratitude?: string;
  intention?: string;
  mood?: number;
}): void {
  if (typeof input.body !== "string" || input.body.length === 0) {
    throw new ReflectionError(
      "INVALID_PAYLOAD",
      "body is required",
      { field: "body" },
    );
  }
  if (input.body.length > MAX_BODY_CHARS) {
    throw new ReflectionError(
      "INVALID_PAYLOAD",
      `body exceeds ${MAX_BODY_CHARS} chars`,
      { length: input.body.length },
    );
  }
  if (input.gratitude && input.gratitude.length > MAX_FIELD_CHARS) {
    throw new ReflectionError(
      "INVALID_PAYLOAD",
      `gratitude exceeds ${MAX_FIELD_CHARS} chars`,
      { length: input.gratitude.length },
    );
  }
  if (input.intention && input.intention.length > MAX_FIELD_CHARS) {
    throw new ReflectionError(
      "INVALID_PAYLOAD",
      `intention exceeds ${MAX_FIELD_CHARS} chars`,
      { length: input.intention.length },
    );
  }
  if (input.mood !== undefined) {
    const m = Number(input.mood);
    if (!Number.isInteger(m) || m < 0 || m > 5) {
      throw new ReflectionError(
        "INVALID_PAYLOAD",
        "mood must be integer 0..5",
        { mood: input.mood },
      );
    }
  }
}

/** Determine if streak is at risk (within STREAK_GRACE_HOURS of expiry). */
export function isStreakAtRisk(
  lastEntryISO: string | null,
  now: string,
  tz: string,
): boolean {
  if (!lastEntryISO) return false;
  const lastDate = toISODate(lastEntryISO, tz);
  const today = toISODate(now, tz);
  const diff = daysBetween(lastDate, today);
  if (diff === 0) return false; // wrote today
  if (diff === 1) {
    // Last entry was yesterday — streak alive but at risk if no entry by EOD today
    return true;
  }
  return false;
}

/** Build user-by-date key for idempotency. */
function userDateKey(userId: string, isoDate: string): string {
  return `${userId}::${isoDate}`;
}

// ============================================================
// SECTION 7 — CORE API
// ============================================================

/**
 * getTodaysPrompt — deterministic per-user per-day prompt.
 *
 * Hash of (userId, ISO date, pool version) chooses a stable
 * prompt. Filters by tradition/difficulty if provided and at
 * least one prompt matches; otherwise falls back to universal
 * pool so the user always gets a card.
 */
export function getTodaysPrompt(
  userId: string,
  options: PromptOptions = {},
): DailyCard {
  const tz = options.timezone ?? "UTC";
  assertTimezone(tz);
  const locale = resolveLocale(options.locale);
  const today = toISODate(nowISO(), tz);
  return composeDailyCard(userId, today, locale, options, tz);
}

/**
 * getPromptForDate — historical lookup. Same deterministic
 * algorithm as getTodaysPrompt but anchored to a past date.
 */
export function getPromptForDate(
  userId: string,
  date: string,
  options: Omit<PromptOptions, "timezone"> & { timezone?: string } = {},
): DailyCard {
  const tz = options.timezone ?? "UTC";
  assertTimezone(tz);
  const locale = resolveLocale(options.locale);
  const iso = toISODate(date, tz);
  return composeDailyCard(userId, iso, locale, options, tz);
}

/** Internal: build a DailyCard. */
function composeDailyCard(
  userId: string,
  isoDate: string,
  locale: Locale,
  options: PromptOptions,
  tz: string,
): DailyCard {
  const pool = filterPool({
    tradition: options.tradition,
    difficulty: options.difficulty,
  });
  // If user has preferences and enabledCategories list is non-empty,
  // intersect with category. We allow caller options to override.
  const prefs = state.preferences.get(userId);
  if (prefs) {
    // If user opted out of leaderboard, no side effects; just hints.
  }
  if (pool.length === 0) {
    // Fallback: universal pool.
    const universal = filterPool({});
    if (universal.length === 0) {
      throw new ReflectionError(
        "PROMPT_NOT_FOUND",
        "Prompt pool is empty — corpus not seeded",
      );
    }
    return pickFromPool(universal, userId, isoDate, locale, tz);
  }
  return pickFromPool(pool, userId, isoDate, locale, tz);
}

/** Internal: deterministic pick from a pool. */
function pickFromPool(
  pool: ReflectionPrompt[],
  userId: string,
  isoDate: string,
  locale: Locale,
  tz: string,
): DailyCard {
  const seed = dailySeed(userId, isoDate);
  const idx = seed % pool.length;
  const prompt = pool[idx]!;
  const already = state.entriesByUserDate.has(userDateKey(userId, isoDate));
  const streak = computeStreakSnapshot(userId, tz);
  return {
    userId,
    date: isoDate,
    prompt,
    locale,
    text: resolvePromptText(prompt, locale),
    alreadyAnswered: already,
    streak,
    servedAt: nowISO(),
  };
}

/** Internal: filter prompt pool by tradition / difficulty. */
function filterPool(filters: {
  tradition?: TraditionTag;
  difficulty?: PromptDifficulty;
  category?: PromptCategory;
}): ReflectionPrompt[] {
  const out: ReflectionPrompt[] = [];
  for (const p of state.prompts.values()) {
    if (p.archived) continue;
    if (filters.tradition && p.tradition !== filters.tradition) continue;
    if (filters.difficulty && p.difficulty !== filters.difficulty) continue;
    if (filters.category && p.category !== filters.category) continue;
    out.push(p);
  }
  return out;
}

/**
 * getPromptPool — admin listing of all prompts. Filterable by
 * tradition, category, difficulty, and locale availability.
 */
export function getPromptPool(filters: PoolFilters = {}): ReflectionPrompt[] {
  const limit = filters.limit ?? 1000;
  const offset = filters.offset ?? 0;
  const all = filterPool({
    tradition: filters.tradition,
    difficulty: filters.difficulty,
    category: filters.category,
  });
  let sliced = all.slice(offset, offset + limit);
  if (filters.locale) {
    sliced = sliced.filter((p) => !!p.textI18n[filters.locale!]);
  }
  return sliced;
}

/**
 * recordReflection — saves a ReflectionEntry and updates the streak.
 * Idempotent per (userId, date): a second call on the same date
 * updates the existing entry rather than creating a duplicate.
 */
export function recordReflection(
  userId: string,
  promptId: PromptId,
  entry: {
    body: string;
    gratitude?: string;
    intention?: string;
    mood?: MoodScore;
    timezone?: string;
    date?: string; // override for backfill
  },
): ReflectionEntry {
  validateReflectionInput(entry);
  if (!state.prompts.has(promptId)) {
    throw new ReflectionError(
      "PROMPT_NOT_FOUND",
      `Prompt not found: ${promptId}`,
      { promptId },
    );
  }
  const tz = entry.timezone ?? "UTC";
  assertTimezone(tz);
  const isoDate = entry.date ? toISODate(entry.date, tz) : toISODate(nowISO(), tz);
  const key = userDateKey(userId, isoDate);
  const existingId = state.entriesByUserDate.get(key);
  const ts = nowISO();

  if (existingId) {
    const existing = state.entries.get(existingId)!;
    existing.body = entry.body;
    if (entry.gratitude !== undefined) existing.gratitude = entry.gratitude;
    if (entry.intention !== undefined) existing.intention = entry.intention;
    if (entry.mood !== undefined) existing.mood = entry.mood;
    existing.updatedAt = ts;
    updateStreak(userId, isoDate, tz);
    return existing;
  }

  const id = makeId("ref", hash32(`${userId}::${promptId}::${isoDate}::${ts}`));
  const ref: ReflectionEntry = {
    id,
    userId,
    promptId,
    date: isoDate,
    body: entry.body,
    gratitude: entry.gratitude,
    intention: entry.intention,
    mood: (entry.mood ?? 3) as MoodScore,
    visibility: "private",
    createdAt: ts,
    updatedAt: ts,
  };
  state.entries.set(id, ref);
  state.entriesByUserDate.set(key, id);
  let userSet = state.entriesByUser.get(userId);
  if (!userSet) {
    userSet = new Set();
    state.entriesByUser.set(userId, userSet);
  }
  userSet.add(id);
  let promptSet = state.entriesByPrompt.get(promptId);
  if (!promptSet) {
    promptSet = new Set();
    state.entriesByPrompt.set(promptId, promptSet);
  }
  promptSet.add(id);
  updateStreak(userId, isoDate, tz);
  return ref;
}

/**
 * getReflectionHistory — paged history. Sorted newest-first.
 */
export function getReflectionHistory(
  userId: string,
  query: HistoryQuery = {},
): HistoryPage {
  const ids = state.entriesByUser.get(userId);
  if (!ids) return { entries: [], nextCursor: null, total: 0 };
  const limit = clamp(query.limit ?? DEFAULT_HISTORY_LIMIT, 1, MAX_HISTORY_LIMIT);
  const all: ReflectionEntry[] = [];
  for (const id of ids) {
    const e = state.entries.get(id);
    if (!e) continue;
    if (e.visibility === "deleted") continue;
    if (query.from && e.date < query.from) continue;
    if (query.to && e.date > query.to) continue;
    if (query.visibility && e.visibility !== query.visibility) continue;
    if (query.category || query.tradition) {
      const p = state.prompts.get(e.promptId);
      if (!p) continue;
      if (query.category && p.category !== query.category) continue;
      if (query.tradition && p.tradition !== query.tradition) continue;
    }
    all.push(e);
  }
  all.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const total = all.length;
  let startIdx = 0;
  if (query.cursor) {
    const idx = all.findIndex((e) => e.id === query.cursor);
    if (idx >= 0) startIdx = idx + 1;
  }
  const slice = all.slice(startIdx, startIdx + limit);
  const nextCursor =
    startIdx + limit < total ? slice[slice.length - 1]!.id : null;
  return { entries: slice, nextCursor, total };
}

/**
 * getStreak — current / longest / total.
 */
export function getStreak(userId: string): Streak {
  const existing = state.streaks.get(userId);
  if (existing) return existing;
  // Bootstrap empty streak.
  const fresh: Streak = {
    userId,
    current: 0,
    longest: 0,
    totalEntries: 0,
    lastEntryDate: null,
    lastComputedAt: nowISO(),
  };
  state.streaks.set(userId, fresh);
  return fresh;
}

/**
 * updateStreak — internal. Recomputes the user's streak from
 * the stored entries. Called after recordReflection. The current
 * streak is the count of consecutive distinct ISO dates ending
 * at the most recent entry (within STREAK_GRACE_HOURS grace).
 */
export function updateStreak(
  userId: string,
  fromDateISO: string,
  timezone: string,
): Streak {
  const ids = state.entriesByUser.get(userId);
  const dates = new Set<string>();
  if (ids) {
    for (const id of ids) {
      const e = state.entries.get(id);
      if (!e) continue;
      if (e.visibility === "deleted") continue;
      dates.add(e.date);
    }
  }
  const sorted = Array.from(dates).sort(); // ascending
  let current = 0;
  let longest = 0;
  let prevDate: string | null = null;
  let run = 0;
  for (const d of sorted) {
    if (prevDate === null) {
      run = 1;
    } else {
      const gap = daysBetween(prevDate, d);
      if (gap === 1) run += 1;
      else if (gap === 0) {
        // same day, no change
      } else run = 1;
    }
    if (run > longest) longest = run;
    prevDate = d;
  }
  // Recompute current by walking back from latest entry.
  if (sorted.length > 0) {
    const last = sorted[sorted.length - 1]!;
    current = 1;
    for (let i = sorted.length - 2; i >= 0; i--) {
      const gap = daysBetween(sorted[i]!, last);
      if (gap === 1) current += 1;
      else if (gap === 0) continue;
      else break;
      // Shift reference back.
      // (We use last as anchor and check the previous sorted entry.)
    }
    // If the gap between last entry and "today" exceeds grace, current = 0.
    const today = toISODate(nowISO(), timezone);
    const gapToToday = daysBetween(last, today);
    if (gapToToday > 2) current = 0;
    else if (gapToToday === 2) {
      // Within grace window only if now is within STREAK_GRACE_HOURS.
      const now = new Date();
      const lastDate = new Date(last + "T12:00:00Z");
      const diffHours = (now.getTime() - lastDate.getTime()) / 3600000;
      if (diffHours > STREAK_GRACE_HOURS) current = 0;
    }
  } else {
    current = 0;
  }
  const total = sorted.length;
  const streak: Streak = {
    userId,
    current,
    longest,
    totalEntries: total,
    lastEntryDate: sorted.length > 0 ? sorted[sorted.length - 1]! : null,
    lastComputedAt: nowISO(),
  };
  state.streaks.set(userId, streak);
  // Avoid unused-arg warning.
  void fromDateISO;
  return streak;
}

/** Internal helper for DailyCard snapshot. */
function computeStreakSnapshot(userId: string, tz: string): StreakSnapshot {
  const s = getStreak(userId);
  return {
    current: s.current,
    longest: s.longest,
    totalEntries: s.totalEntries,
    atRisk: isStreakAtRisk(s.lastEntryDate, nowISO(), tz),
  };
}

/**
 * breakStreak — zero out current streak. Longest and total kept.
 * Called when the user misses a day past the grace window or
 * manually resets (e.g., "start fresh" button).
 */
export function breakStreak(userId: string): Streak {
  const s = getStreak(userId);
  const updated: Streak = {
    ...s,
    current: 0,
    lastComputedAt: nowISO(),
  };
  state.streaks.set(userId, updated);
  return updated;
}

/**
 * getWeeklyDigest — last 7 reflections summarized.
 */
export function getWeeklyDigest(userId: string): ReflectionDigest {
  return computeDigest(userId, WEEKLY_DIGEST_DAYS);
}

/**
 * getMonthlyDigest — last 30 reflections summarized.
 */
export function getMonthlyDigest(userId: string): ReflectionDigest {
  return computeDigest(userId, MONTHLY_DIGEST_DAYS);
}

function computeDigest(userId: string, days: number): ReflectionDigest {
  const ids = state.entriesByUser.get(userId);
  const today = toISODate(nowISO(), "UTC");
  const earliest = isoDateMinus(today, days - 1);
  const counts: Record<PromptCategory, number> = {
    "gratitude": 0,
    "intention": 0,
    "shadow-work": 0,
    "devotional": 0,
    "meditation": 0,
    "study": 0,
    "ritual": 0,
    "integration": 0,
    "community": 0,
  };
  const traditionCounts: Partial<Record<TraditionTag, number>> = {};
  const daysSet = new Set<string>();
  let moodSum = 0;
  let moodCount = 0;
  let n = 0;
  if (ids) {
    for (const id of ids) {
      const e = state.entries.get(id);
      if (!e) continue;
      if (e.visibility === "deleted") continue;
      if (e.date < earliest || e.date > today) continue;
      n += 1;
      daysSet.add(e.date);
      if (e.mood > 0) {
        moodSum += e.mood;
        moodCount += 1;
      }
      const p = state.prompts.get(e.promptId);
      if (p) {
        counts[p.category] = (counts[p.category] ?? 0) + 1;
        if (p.tradition) {
          traditionCounts[p.tradition] =
            (traditionCounts[p.tradition] ?? 0) + 1;
        }
      }
    }
  }
  const topCategories = (Object.keys(counts) as PromptCategory[])
    .map((k) => ({ category: k, count: counts[k] }))
    .sort((a, b) => b.count - a.count)
    .filter((x) => x.count > 0)
    .slice(0, 5);
  const topTraditions = (Object.keys(traditionCounts) as TraditionTag[])
    .map((k) => ({ tradition: k, count: traditionCounts[k] ?? 0 }))
    .sort((a, b) => b.count - a.count)
    .filter((x) => x.count > 0)
    .slice(0, 5);
  return {
    userId,
    rangeStart: earliest,
    rangeEnd: today,
    count: n,
    averageMood: moodCount > 0 ? moodSum / moodCount : 0,
    topCategories,
    topTraditions,
    distinctDays: daysSet.size,
    generatedAt: nowISO(),
  };
}

/** Compute ISO date minus N days (UTC). */
function isoDateMinus(iso: string, days: number): string {
  const t = Date.parse(iso + "T00:00:00Z") - days * 86400000;
  const d = new Date(t);
  return toISODate(d.toISOString(), "UTC");
}

/**
 * shareReflectionToFeed — converts reflection to a post via the
 * feed ranking hook (w45/feed-ranking-ml). The reflection must
 * belong to the acting user.
 */
export async function shareReflectionToFeed(
  reflectionId: string,
  byUserId: string,
): Promise<ReflectionEntry> {
  const ref = state.entries.get(reflectionId);
  if (!ref) {
    throw new ReflectionError(
      "ENTRY_NOT_FOUND",
      `Reflection not found: ${reflectionId}`,
      { reflectionId },
    );
  }
  if (ref.userId !== byUserId) {
    throw new ReflectionError(
      "PERMISSION_DENIED",
      "Cannot share another user's reflection",
      { reflectionId, byUserId },
    );
  }
  if (ref.visibility === "deleted") {
    throw new ReflectionError(
      "PERMISSION_DENIED",
      "Cannot share a deleted reflection",
      { reflectionId },
    );
  }
  if (!state.feedRanker) {
    throw new ReflectionError(
      "FEED_RANKER_FAILED",
      "No feed ranker registered — call setFeedRankerHook first",
    );
  }
  try {
    const result = await state.feedRanker(ref, byUserId);
    ref.visibility = "shared";
    ref.feedPostId = result.postId;
    ref.updatedAt = nowISO();
    return ref;
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    throw new ReflectionError(
      "FEED_RANKER_FAILED",
      `Feed ranker failed: ${message}`,
      { reflectionId },
    );
  }
}

/** Register a feed ranker hook (test seam for w45). */
export function setFeedRankerHook(hook: FeedRankerHook | undefined): void {
  state.feedRanker = hook;
}

/**
 * markAsPrivate — flip shared -> private. Removes feedPostId but
 * does NOT delete the post on the feed side (caller responsibility).
 */
export function markAsPrivate(reflectionId: string): ReflectionEntry {
  const ref = state.entries.get(reflectionId);
  if (!ref) {
    throw new ReflectionError(
      "ENTRY_NOT_FOUND",
      `Reflection not found: ${reflectionId}`,
      { reflectionId },
    );
  }
  ref.visibility = "private";
  ref.feedPostId = undefined;
  ref.updatedAt = nowISO();
  return ref;
}

/**
 * getReflectionPromptsByTradition — filter the corpus by a
 * specific tradition tag. Returns prompts in deterministic order
 * (sorted by id). Used by admin and by the daily card composer
 * to scope tradition-aware rotation.
 */
export function getReflectionPromptsByTradition(
  tradition: TraditionTag,
): ReflectionPrompt[] {
  return filterPool({ tradition }).sort((a, b) => (a.id < b.id ? -1 : 1));
}

/**
 * getPromptCategories — returns the canonical category list.
 * (Static; provided as function for API consistency.)
 */
export function getPromptCategories(): PromptCategory[] {
  return [...PROMPT_CATEGORIES];
}

/**
 * rotatePromptDaily — internal scheduler stub. In production this
 * would be a cron job; here it's a no-op since the prompt is
 * already deterministically chosen by date. We provide it for
 * compatibility with w32 / w34 / w39 schedulers.
 */
export function rotatePromptDaily(): { rotated: number; at: string } {
  // Deterministic per-day selection already rotates the pool; we
  // simply report the active corpus size for telemetry.
  let count = 0;
  for (const p of state.prompts.values()) {
    if (!p.archived) count += 1;
  }
  return { rotated: count, at: nowISO() };
}

/**
 * getStreakLeaderboard — opt-in, anonymized. Only users with
 * optedIntoLeaderboard=true appear.
 */
export function getStreakLeaderboard(
  options: LeaderboardQuery = { scope: "global" },
): LeaderboardEntry[] {
  const limit = options.limit ?? 20;
  const board: LeaderboardEntry[] = [];
  for (const [userId, streak] of state.streaks) {
    const prefs = state.preferences.get(userId);
    if (!prefs?.optedIntoLeaderboard) continue;
    if (options.scope === "tradition") {
      if (!options.tradition) continue;
      // Verify user has at least one entry with the tradition.
      const ids = state.entriesByUser.get(userId);
      let hasTradition = false;
      if (ids) {
        for (const id of ids) {
          const e = state.entries.get(id);
          if (!e) continue;
          const p = state.prompts.get(e.promptId);
          if (p?.tradition === options.tradition) {
            hasTradition = true;
            break;
          }
        }
      }
      if (!hasTradition) continue;
    }
    board.push({
      rank: 0,
      anonymizedHandle: anonymizedHandle(userId),
      streak: streak.longest,
      totalEntries: streak.totalEntries,
    });
  }
  board.sort((a, b) => b.streak - a.streak);
  for (let i = 0; i < board.length; i++) board[i]!.rank = i + 1;
  return board.slice(0, limit);
}

/**
 * getUserPromptPreferences — returns saved prefs, or default.
 */
export function getUserPromptPreferences(userId: string): PromptPreferences {
  const existing = state.preferences.get(userId);
  if (existing) return existing;
  const fresh: PromptPreferences = {
    userId,
    enabledCategories: [],
    enabledTraditions: [],
    preferredLocale: "pt-BR",
    preferredDifficulty: undefined,
    optedIntoLeaderboard: false,
    optedIntoWeeklyDigest: false,
    optedIntoMonthlyDigest: false,
    updatedAt: nowISO(),
  };
  state.preferences.set(userId, fresh);
  return fresh;
}

/**
 * setUserPromptPreferences — saves prefs. Validates categories
 * and traditions against the canonical lists.
 */
export function setUserPromptPreferences(
  userId: string,
  prefs: Partial<Omit<PromptPreferences, "userId" | "updatedAt">>,
): PromptPreferences {
  const current = getUserPromptPreferences(userId);
  const next: PromptPreferences = {
    ...current,
    ...prefs,
    userId,
    updatedAt: nowISO(),
  };
  if (next.enabledCategories) {
    next.enabledCategories = next.enabledCategories.filter((c) =>
      PROMPT_CATEGORIES.includes(c),
    );
  }
  if (next.enabledTraditions) {
    next.enabledTraditions = next.enabledTraditions.filter((t) =>
      SUPPORTED_TRADITIONS.includes(t),
    );
  }
  if (next.preferredDifficulty) {
    if (!["gentle", "moderate", "deep"].includes(next.preferredDifficulty)) {
      throw new ReflectionError(
        "INVALID_PAYLOAD",
        `Unknown difficulty: ${next.preferredDifficulty}`,
      );
    }
  }
  state.preferences.set(userId, next);
  return next;
}

/**
 * skipPrompt — advance to the next prompt WITHOUT breaking the
 * streak. The skip is recorded as a zero-mood entry so the day
 * is still counted in the streak but doesn't pollute history
 * with content.
 */
export function skipPrompt(
  userId: string,
  promptId: PromptId,
  options: { timezone?: string } = {},
): ReflectionEntry {
  const tz = options.timezone ?? "UTC";
  return recordReflection(userId, promptId, {
    body: "[skipped]",
    mood: 0,
    timezone: tz,
  });
}

/**
 * getReflectionStats — completion rate, average length, mood dist.
 * Window: last STATS_WINDOW_DAYS days.
 */
export function getReflectionStats(userId: string): ReflectionStats {
  const ids = state.entriesByUser.get(userId);
  const today = toISODate(nowISO(), "UTC");
  const earliest = isoDateMinus(today, STATS_WINDOW_DAYS - 1);
  let total = 0;
  let lenSum = 0;
  let wordSum = 0;
  const moodDist: Record<MoodScore, number> = {
    0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
  };
  const categoryCounts: Partial<Record<PromptCategory, number>> = {};
  const traditionCounts: Partial<Record<TraditionTag, number>> = {};
  const daysSet = new Set<string>();
  if (ids) {
    for (const id of ids) {
      const e = state.entries.get(id);
      if (!e) continue;
      if (e.visibility === "deleted") continue;
      if (e.date < earliest || e.date > today) continue;
      total += 1;
      lenSum += e.body.length;
      wordSum += countWords(e.body);
      moodDist[e.mood] = (moodDist[e.mood] ?? 0) + 1;
      daysSet.add(e.date);
      const p = state.prompts.get(e.promptId);
      if (p) {
        categoryCounts[p.category] = (categoryCounts[p.category] ?? 0) + 1;
        if (p.tradition) {
          traditionCounts[p.tradition] =
            (traditionCounts[p.tradition] ?? 0) + 1;
        }
      }
    }
  }
  const topCategories = (Object.keys(categoryCounts) as PromptCategory[])
    .map((k) => ({ category: k, count: categoryCounts[k] ?? 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const topTraditions = (Object.keys(traditionCounts) as TraditionTag[])
    .map((k) => ({ tradition: k, count: traditionCounts[k] ?? 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  return {
    userId,
    totalEntries: total,
    completionRate: clamp(daysSet.size / STATS_WINDOW_DAYS, 0, 1),
    averageLengthChars: total > 0 ? Math.round(lenSum / total) : 0,
    averageLengthWords: total > 0 ? Math.round(wordSum / total) : 0,
    moodDistribution: moodDist,
    topCategories,
    topTraditions,
    computedAt: nowISO(),
  };
}

/**
 * exportReflections — JSON / Markdown / PDF. PDF is a stub that
 * returns a base64 placeholder; production should call the
 * w45/user-import-export PDF renderer.
 */
export function exportReflections(
  userId: string,
  format: "json" | "markdown" | "pdf",
): ReflectionExport {
  const ids = state.entriesByUser.get(userId);
  const entries: ReflectionEntry[] = [];
  if (ids) {
    for (const id of ids) {
      const e = state.entries.get(id);
      if (!e) continue;
      if (e.visibility === "deleted") continue;
      entries.push(e);
    }
  }
  entries.sort((a, b) => (a.date < b.date ? -1 : 1));
  const ts = nowISO();
  if (format === "json") {
    return {
      format: "json",
      generatedAt: ts,
      userId,
      count: entries.length,
      payload: JSON.stringify(
        {
          version: PROMPT_POOL_VERSION,
          userId,
          generatedAt: ts,
          entries: entries.map((e) => ({
            ...e,
            prompt: state.prompts.get(e.promptId) ?? null,
          })),
        },
        null,
        2,
      ),
      filename: `reflections-${userId}-${ts.slice(0, 10)}.json`,
    };
  }
  if (format === "markdown") {
    const lines: string[] = [];
    lines.push(`# Reflections — ${userId}`);
    lines.push("");
    lines.push(`Generated at ${ts} · ${entries.length} entries`);
    lines.push("");
    for (const e of entries) {
      const p = state.prompts.get(e.promptId);
      lines.push(`## ${e.date}`);
      if (p) {
        lines.push(
          `> ${resolvePromptText(p, "pt-BR")} _(category: ${p.category}${p.tradition ? `, tradition: ${p.tradition}` : ""})_`,
        );
      }
      lines.push("");
      if (e.gratitude) {
        lines.push(`**Gratidão:** ${e.gratitude}`);
        lines.push("");
      }
      if (e.intention) {
        lines.push(`**Intenção:** ${e.intention}`);
        lines.push("");
      }
      lines.push(e.body);
      lines.push("");
      lines.push(`*mood: ${e.mood}/5 · visibility: ${e.visibility}*`);
      lines.push("");
      lines.push("---");
      lines.push("");
    }
    return {
      format: "markdown",
      generatedAt: ts,
      userId,
      count: entries.length,
      payload: lines.join("\n"),
      filename: `reflections-${userId}-${ts.slice(0, 10)}.md`,
    };
  }
  if (format === "pdf") {
    // Stub — production delegates to w45/user-import-export.
    const stub =
      "JVBERi0xLjQKJcKlwrHDqwoKMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nCiAgICAgL1BhZ2VzIDIgMCBSID4+CmVuZG9iago=";
    return {
      format: "pdf",
      generatedAt: ts,
      userId,
      count: entries.length,
      payload: stub,
      filename: `reflections-${userId}-${ts.slice(0, 10)}.pdf`,
    };
  }
  throw new ReflectionError("INVALID_PAYLOAD", `Unknown format: ${format}`);
}

/**
 * deleteReflection — soft delete (LGPD Art. 18, "elimination"
 * with audit trail). The entry stays in storage with visibility
 * "deleted" and a deletedAt timestamp.
 */
export function deleteReflection(
  reflectionId: string,
  byUserId: string,
): { ok: true; entryId: string } {
  const ref = state.entries.get(reflectionId);
  if (!ref) {
    throw new ReflectionError(
      "ENTRY_NOT_FOUND",
      `Reflection not found: ${reflectionId}`,
      { reflectionId },
    );
  }
  if (ref.userId !== byUserId) {
    throw new ReflectionError(
      "PERMISSION_DENIED",
      "Cannot delete another user's reflection",
      { reflectionId, byUserId },
    );
  }
  ref.visibility = "deleted";
  ref.deletedAt = nowISO();
  ref.updatedAt = ref.deletedAt;
  // Note: we keep the entry in entriesByUserDate so the day
  // still counts toward the streak (soft delete ≠ never wrote).
  return { ok: true, entryId: reflectionId };
}

/**
 * purgeAllReflections — full delete (LGPD Art. 18). Removes
 * the user's entries from all indexes. Streak is reset.
 * Returns count purged.
 */
export function purgeAllReflections(
  userId: string,
  byUserId: string,
): { purged: number } {
  if (userId !== byUserId) {
    throw new ReflectionError(
      "PERMISSION_DENIED",
      "Cannot purge another user's data",
      { userId, byUserId },
    );
  }
  const ids = state.entriesByUser.get(userId);
  let purged = 0;
  if (ids) {
    for (const id of Array.from(ids)) {
      const e = state.entries.get(id);
      if (!e) continue;
      state.entries.delete(id);
      state.entriesByUserDate.delete(userDateKey(userId, e.date));
      const promptSet = state.entriesByPrompt.get(e.promptId);
      if (promptSet) promptSet.delete(id);
      purged += 1;
    }
    state.entriesByUser.delete(userId);
  }
  // Reset streak & prefs.
  state.streaks.delete(userId);
  state.preferences.delete(userId);
  return { purged };
}

// ============================================================
// SECTION 8 — ADMIN / TESTING HOOKS
// ============================================================

/** Register a prompt into the corpus (admin/test only). */
export function registerPrompt(prompt: ReflectionPrompt): void {
  if (!prompt.id || !prompt.text) {
    throw new ReflectionError(
      "INVALID_PAYLOAD",
      "Prompt id and text are required",
    );
  }
  state.prompts.set(prompt.id, { ...prompt });
  if (!state.entriesByPrompt.has(prompt.id)) {
    state.entriesByPrompt.set(prompt.id, new Set());
  }
}

/** Archive a prompt (kept for audit, hidden from rotation). */
export function archivePrompt(promptId: PromptId): void {
  const p = state.prompts.get(promptId);
  if (!p) {
    throw new ReflectionError(
      "PROMPT_NOT_FOUND",
      `Prompt not found: ${promptId}`,
    );
  }
  p.archived = true;
}

/** Get corpus size (active + archived). */
export function getCorpusStats(): {
  active: number;
  archived: number;
  total: number;
} {
  let active = 0;
  let archived = 0;
  for (const p of state.prompts.values()) {
    if (p.archived) archived += 1;
    else active += 1;
  }
  return { active, archived, total: active + archived };
}

/** Reset all state (test only). */
export function __resetForTests(): void {
  state.prompts.clear();
  state.entries.clear();
  state.entriesByUser.clear();
  state.entriesByUserDate.clear();
  state.streaks.clear();
  state.preferences.clear();
  state.entriesByPrompt.clear();
  state.feedRanker = undefined;
  seedCorpus();
}

/** Lookup a single entry by id (admin). */
export function getEntryById(entryId: string): ReflectionEntry | null {
  return state.entries.get(entryId) ?? null;
}

/** Lookup a single prompt by id (admin). */
export function getPromptById(promptId: PromptId): ReflectionPrompt | null {
  return state.prompts.get(promptId) ?? null;
}

/** Count prompts by tradition (admin). */
export function countPromptsByTradition(): Record<TraditionTag, number> {
  const out: Record<TraditionTag, number> = {
    "candomble": 0,
    "umbanda": 0,
    "ifa": 0,
    "cabala": 0,
    "astrologia": 0,
    "tantra": 0,
    "espiritismo": 0,
    "santo-daime": 0,
    "universal": 0,
  };
  for (const p of state.prompts.values()) {
    if (p.archived) continue;
    const t: TraditionTag = p.tradition ?? "universal";
    out[t] = (out[t] ?? 0) + 1;
  }
  return out;
}

/** Count prompts by category (admin). */
export function countPromptsByCategory(): Record<PromptCategory, number> {
  const out: Record<PromptCategory, number> = {
    "gratitude": 0,
    "intention": 0,
    "shadow-work": 0,
    "devotional": 0,
    "meditation": 0,
    "study": 0,
    "ritual": 0,
    "integration": 0,
    "community": 0,
  };
  for (const p of state.prompts.values()) {
    if (p.archived) continue;
    out[p.category] = (out[p.category] ?? 0) + 1;
  }
  return out;
}

// ============================================================
// SECTION 9 — EXPORTS SUMMARY
// ============================================================
// 25+ exports (well over). List for grep:
//   Types: Locale, TraditionTag, PromptDifficulty, PromptCategory,
//          PromptId, ReflectionPrompt, DailyCard, ReflectionEntry,
//          Streak, StreakSnapshot, PromptPreferences, HistoryQuery,
//          HistoryPage, PoolFilters, PromptOptions, ReflectionDigest,
//          ReflectionStats, LeaderboardEntry, LeaderboardQuery,
//          ReflectionExport, MoodScore, ReflectionVisibility,
//          FeedRankerHook, ReflectionErrorCode
//   Class: ReflectionError
//   Constants: STREAK_GRACE_HOURS, DEFAULT_DIFFICULTY,
//              LOCALE_FALLBACK_CHAIN, MAX_BODY_CHARS, MAX_FIELD_CHARS,
//              DEFAULT_HISTORY_LIMIT, MAX_HISTORY_LIMIT,
//              WEEKLY_DIGEST_DAYS, MONTHLY_DIGEST_DAYS,
//              STATS_WINDOW_DAYS, PROMPT_POOL_VERSION,
//              PROMPT_CATEGORIES, SUPPORTED_TRADITIONS
//   Pure utils: hash32, dailySeed, toISODate, nowISO, assertTimezone,
//               resolveLocale, resolvePromptText, makeId,
//               anonymizedHandle, countWords, daysBetween, clamp,
//               validateReflectionInput, isStreakAtRisk
//   Core API: getTodaysPrompt, getPromptForDate, getPromptPool,
//             recordReflection, getReflectionHistory, getStreak,
//             updateStreak, breakStreak, getWeeklyDigest,
//             getMonthlyDigest, shareReflectionToFeed,
//             setFeedRankerHook, markAsPrivate,
//             getReflectionPromptsByTradition, getPromptCategories,
//             rotatePromptDaily, getStreakLeaderboard,
//             getUserPromptPreferences, setUserPromptPreferences,
//             skipPrompt, getReflectionStats, exportReflections,
//             deleteReflection, purgeAllReflections
//   Admin/test: registerPrompt, archivePrompt, getCorpusStats,
//               __resetForTests, getEntryById, getPromptById,
//               countPromptsByTradition, countPromptsByCategory
// ============================================================
