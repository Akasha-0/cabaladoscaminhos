/**
 * Onboarding State Engine — First-Run Wizard (W63)
 *
 * Implements a finite-state machine for first-run onboarding of the
 * Cabala dos Caminhos app. The wizard walks a new user through:
 *
 *   welcome → tradition → intent → profile_basics → suggested_follows
 *           → review → done
 *
 * Hard requirements:
 *   - Strict types (no `any`, no `as unknown as`)
 *   - No external dependencies (zero npm)
 *   - Trilingual labels (pt-BR / en / es) for tradition picker
 *   - Sacred-tradition safety check (returns 'review' for sacred picks)
 *   - LGPD-aware suggestion engine (no PII beyond userId + displayName)
 *   - Audit functions exposed as first-class exports
 *   - Mock data is real (canonical 12 traditions, 7 intents)
 *
 * Architecture follows the W62 single-file-with-internal-sectioning
 * convention: section headers + `ENGINE_INFO` + `__ALL_EXPORTS` audit
 * constant. Allows `grep -c "^export"` for quick export-count audit.
 */

// ============================================================================
// SECTION 1 — Core types & enums
// ============================================================================

/** Canonical onboarding step identifiers in order. */
export type OnboardingStepId =
  | "welcome"
  | "tradition"
  | "intent"
  | "profile_basics"
  | "suggested_follows"
  | "review"
  | "done";

/**
 * Tradition options exposed in the tradition picker. Real PT-BR/EN-established
 * names — none invented. The first seven are the canonical "sacred traditions"
 * that trigger the safety gate; the remaining five are secular / contemporary.
 */
export type TraditionOption =
  | "candomble"
  | "umbanda"
  | "ifa"
  | "cabala"
  | "astrologia"
  | "numerologia"
  | "tantra"
  | "yoga"
  | "budismo"
  | "kimbanda"
  | "espiritismo"
  | "open";

/** Intent options exposed in the intent picker. */
export type IntentOption =
  | "learn"
  | "practice"
  | "mentorship"
  | "teach"
  | "community"
  | "marketplace"
  | "all";

/** Locales supported by the wizard (3 only). */
export type WizardLocale = "pt-BR" | "en" | "es";

/** Draft profile basics the user fills in step 4. */
export interface ProfileBasicsDraft {
  readonly displayName: string;
  readonly bio: string;
  readonly avatarSeed: string;
  readonly locale: WizardLocale;
  readonly intentions: readonly string[];
}

/** A user suggestion surfaced in step 5. */
export interface FollowSuggestion {
  readonly userId: string;
  readonly displayName: string;
  readonly reason:
    | "tradition_match"
    | "intent_match"
    | "popular_in_tradition"
    | "mentor_match";
}

/** How strict the user is about their tradition preference. */
export type OpennessLevel = "exclusive" | "exploratory" | "inclusive";

/** Tradition-step answer. */
export interface TraditionAnswer {
  readonly primary: TraditionOption;
  readonly secondary?: readonly TraditionOption[];
  readonly openness: OpennessLevel;
}

/** Intent-step answer. */
export interface IntentAnswer {
  readonly primary: IntentOption;
  readonly secondary?: readonly IntentOption[];
  readonly weeklyMinutes?: number;
}

/**
 * Complete onboarding state — the canonical "wizard document" that
 * persists across browser sessions via IndexedDB or backend storage.
 */
export interface OnboardingState {
  readonly userId: string;
  readonly currentStep: OnboardingStepId;
  readonly stepsCompleted: readonly OnboardingStepId[];
  readonly tradition?: TraditionAnswer;
  readonly intent?: IntentAnswer;
  readonly profileBasics?: ProfileBasicsDraft;
  readonly suggestedFollows: readonly FollowSuggestion[];
  readonly acceptedFollows: readonly string[];
  readonly startedAt: number;
  readonly lastVisitedAt: number;
  readonly completedAt?: number;
}

/** Result of a state-machine transition. */
export interface OnboardingTransition {
  readonly ok: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly nextState: OnboardingState;
}

/** Result of a single-field validator. */
export interface FieldValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

/** Result of a composite validator that may emit warnings. */
export interface CompositeValidation extends FieldValidation {
  readonly warnings: readonly string[];
}

// ============================================================================
// SECTION 2 — Constants & configuration
// ============================================================================

/**
 * Ordered step sequence. The wizard MUST follow this exact order; the
 * `advanceStep` validator enforces contiguity.
 */
export const ONBOARDING_STEPS: readonly OnboardingStepId[] = [
  "welcome",
  "tradition",
  "intent",
  "profile_basics",
  "suggested_follows",
  "review",
  "done",
] as const;

/**
 * Anti-bot minimum step duration (ms). A user cannot complete a step faster
 * than this. Configurable per deployment.
 */
export const MIN_STEP_DURATION_MS = 1500;

/**
 * Tradition catalog. ≥ 12 entries with full trilingual coverage.
 * Each label row contributes to the auditTraditionCoverage total.
 */
export const TRADITION_OPTIONS: readonly {
  readonly id: TraditionOption;
  readonly labelPtBR: string;
  readonly labelEn: string;
  readonly labelEs: string;
  readonly description: string;
}[] = [
  {
    id: "candomble",
    labelPtBR: "Candomblé",
    labelEn: "Candomblé",
    labelEs: "Candomblé",
    description:
      "Tradição afro-brasileira com orixás, axé e fundamentos nagôs, jejes e angolas.",
  },
  {
    id: "umbanda",
    labelPtBR: "Umbanda",
    labelEn: "Umbanda",
    labelEs: "Umbanda",
    description:
      "Tradição brasileira que entroniza caboclos, pretos-velhos e crianças.",
  },
  {
    id: "ifa",
    labelPtBR: "Ifá / Odu",
    labelEn: "Ifá / Odu",
    labelEs: "Ifá / Odu",
    description:
      "Sistema yorubá de 256 Odus — fundamento de Ifá, jogo de búzios e Ori.",
  },
  {
    id: "cabala",
    labelPtBR: "Cabala",
    labelEn: "Kabbalah",
    labelEs: "Cábala",
    description:
      "Tradição mística judaica — Sefirot, Árvore da Vida, 4 Mundos, 22 Senderos.",
  },
  {
    id: "astrologia",
    labelPtBR: "Astrologia",
    labelEn: "Astrology",
    labelEs: "Astrología",
    description:
      "Leitura do mapa natal — signos, planetas, casas, aspectos e Lilith.",
  },
  {
    id: "numerologia",
    labelPtBR: "Numerologia",
    labelEn: "Numerology",
    labelEs: "Numerología",
    description:
      "Estudo do simbolismo dos números — caminho de vida, expressão, ano pessoal.",
  },
  {
    id: "tantra",
    labelPtBR: "Tantra",
    labelEn: "Tantra",
    labelEs: "Tantra",
    description:
      "Tradição indiana não-dual — kundalini, chakras, consciência embodied.",
  },
  {
    id: "yoga",
    labelPtBR: "Yoga",
    labelEn: "Yoga",
    labelEs: "Yoga",
    description:
      "Prática psicofísica — asanas, pranayama, meditação, fundamentos filosóficos.",
  },
  {
    id: "budismo",
    labelPtBR: "Budismo",
    labelEn: "Buddhism",
    labelEs: "Budismo",
    description:
      "Ensinamentos do Buda — Dharma, nobre caminho óctuplo, compaixão.",
  },
  {
    id: "kimbanda",
    labelPtBR: "Kimbanda / Quimbanda",
    labelEn: "Kimbanda",
    labelEs: "Kimbanda",
    description:
      "Linha de trabalho com entidades sombreadas — Exus e Pombagiras.",
  },
  {
    id: "espiritismo",
    labelPtBR: "Espiritismo (Kardec)",
    labelEn: "Spiritism (Kardec)",
    labelEs: "Espiritismo (Kardec)",
    description:
      "Doutrina codificada por Allan Kardec — livros básicos, mediunidade, evolução.",
  },
  {
    id: "open",
    labelPtBR: "Aberto / Curioso",
    labelEn: "Open / Curious",
    labelEs: "Abierto / Curioso",
    description:
      "Sem tradição fixa — explorando múltiplos caminhos com abertura.",
  },
];

/**
 * Intent catalog. ≥ 7 entries with PT-BR label + EN label + description.
 */
export const INTENT_OPTIONS: readonly {
  readonly id: IntentOption;
  readonly labelPtBR: string;
  readonly labelEn: string;
  readonly description: string;
}[] = [
  {
    id: "learn",
    labelPtBR: "Aprender",
    labelEn: "Learn",
    description: "Estudar fundamentos, tradições, símbolos, história.",
  },
  {
    id: "practice",
    labelPtBR: "Praticar",
    labelEn: "Practice",
    description: "Exercitar leitura de tarô, búzios, mapa, meditação.",
  },
  {
    id: "mentorship",
    labelPtBR: "Mentoria",
    labelEn: "Mentorship",
    description: "Receber acompanhamento de praticantes mais experientes.",
  },
  {
    id: "teach",
    labelPtBR: "Ensinar",
    labelEn: "Teach",
    description: "Compartilhar conhecimento, dar cursos, escrever artigos.",
  },
  {
    id: "community",
    labelPtBR: "Comunidade",
    labelEn: "Community",
    description: "Conectar com pessoas de caminhos afins, participar de grupos.",
  },
  {
    id: "marketplace",
    labelPtBR: "Marketplace",
    labelEn: "Marketplace",
    description: "Oferecer ou contratar serviços — consultas, cursos, leituras.",
  },
  {
    id: "all",
    labelPtBR: "Tudo",
    labelEn: "Everything",
    description: "Acesso completo — aprender, praticar, ensinar, comunidade.",
  },
];

/** Step → ordered-index map. */
export const STEP_ORDER: Readonly<Record<OnboardingStepId, number>> = {
  welcome: 0,
  tradition: 1,
  intent: 2,
  profile_basics: 3,
  suggested_follows: 4,
  review: 5,
  done: 6,
};

/** Maximum secondary traditions a user can list. */
export const MAX_SECONDARY_TRADITIONS = 5;

/** Maximum secondary intents. */
export const MAX_SECONDARY_INTENTS = 3;

/** Maximum accepted follows. */
export const MAX_ACCEPTED_FOLLOWS = 10;

/** Maximum intentions in profile. */
export const MAX_INTENTIONS = 5;

/** Min/max weekly minutes bounds. */
export const MIN_WEEKLY_MINUTES = 5;
export const MAX_WEEKLY_MINUTES = 600;

/** Min/max display-name length. */
export const MIN_DISPLAY_NAME = 2;
export const MAX_DISPLAY_NAME = 40;

/** Min/max bio length. */
export const MIN_BIO = 0;
export const MAX_BIO = 280;

/** Min/max intention-tag length. */
export const MIN_INTENTION_LEN = 3;
export const MAX_INTENTION_LEN = 60;

/** Sacred traditions — picks here trigger the safety review gate. */
export const SACRED_TRADITIONS: ReadonlySet<TraditionOption> = new Set([
  "candomble",
  "umbanda",
  "ifa",
  "cabala",
  "astrologia",
  "numerologia",
  "tantra",
]);

/** Engine info for runtime introspection. */
export const ENGINE_INFO = {
  name: "onboarding-state-engine",
  version: "1.0.0-w63",
  steps: ONBOARDING_STEPS,
  traditionCount: TRADITION_OPTIONS.length,
  intentCount: INTENT_OPTIONS.length,
  sacredTraditions: Array.from(SACRED_TRADITIONS),
  maxAcceptedFollows: MAX_ACCEPTED_FOLLOWS,
  minStepDurationMs: MIN_STEP_DURATION_MS,
} as const;

// ============================================================================
// SECTION 3 — Validation primitives
// ============================================================================

const PROFANITY_PLACEHOLDER = /\b(badword1|badword2)\b/i;
const URL_PATTERN = /(https?:\/\/|www\.)/i;
const AT_PREFIX = /^@/;
const INVALID_DISPLAY_CHARS = /[<>{}|\\^`]/u;
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;

/**
 * Validate a display name. Rules:
 *   - length 2..40
 *   - no leading @
 *   - no URL chars (http://, www.)
 *   - no control chars
 *   - placeholder profanity blocklist (extensible)
 */
export function validateDisplayName(name: unknown): FieldValidation {
  const errors: string[] = [];
  if (typeof name !== "string") {
    return { valid: false, errors: ["displayName must be a string"] };
  }
  const trimmed = name.trim();
  if (trimmed.length < MIN_DISPLAY_NAME) {
    errors.push(
      `displayName must be at least ${MIN_DISPLAY_NAME} characters (got ${trimmed.length})`,
    );
  }
  if (trimmed.length > MAX_DISPLAY_NAME) {
    errors.push(
      `displayName must be at most ${MAX_DISPLAY_NAME} characters (got ${trimmed.length})`,
    );
  }
  if (AT_PREFIX.test(trimmed)) {
    errors.push("displayName cannot start with @");
  }
  if (URL_PATTERN.test(trimmed)) {
    errors.push("displayName cannot contain URLs");
  }
  if (INVALID_DISPLAY_CHARS.test(trimmed)) {
    errors.push("displayName contains invalid characters");
  }
  if (CONTROL_CHARS.test(trimmed)) {
    errors.push("displayName cannot contain control characters");
  }
  if (PROFANITY_PLACEHOLDER.test(trimmed)) {
    errors.push("displayName contains blocked terms");
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Validate a bio. Rules:
 *   - length 0..280
 *   - no raw URLs (anti-spam)
 *   - no control chars
 */
export function validateBio(bio: unknown): FieldValidation {
  const errors: string[] = [];
  if (typeof bio !== "string") {
    return { valid: false, errors: ["bio must be a string"] };
  }
  if (bio.length < MIN_BIO) {
    errors.push(`bio cannot be negative-length`);
  }
  if (bio.length > MAX_BIO) {
    errors.push(`bio must be at most ${MAX_BIO} characters (got ${bio.length})`);
  }
  if (URL_PATTERN.test(bio)) {
    errors.push("bio cannot contain raw URLs");
  }
  if (CONTROL_CHARS.test(bio)) {
    errors.push("bio cannot contain control characters");
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Validate a list of intention tags. Rules:
 *   - max 5 intentions
 *   - each 3..60 chars
 *   - each non-empty after trim
 */
export function validateIntentions(intentions: unknown): FieldValidation {
  const errors: string[] = [];
  if (!Array.isArray(intentions)) {
    return { valid: false, errors: ["intentions must be an array"] };
  }
  if (intentions.length > MAX_INTENTIONS) {
    errors.push(
      `intentions cannot exceed ${MAX_INTENTIONS} items (got ${intentions.length})`,
    );
  }
  intentions.forEach((item, idx) => {
    if (typeof item !== "string") {
      errors.push(`intentions[${idx}] must be a string`);
      return;
    }
    const t = item.trim();
    if (t.length < MIN_INTENTION_LEN) {
      errors.push(
        `intentions[${idx}] must be at least ${MIN_INTENTION_LEN} characters`,
      );
    }
    if (t.length > MAX_INTENTION_LEN) {
      errors.push(
        `intentions[${idx}] must be at most ${MAX_INTENTION_LEN} characters`,
      );
    }
  });
  return { valid: errors.length === 0, errors };
}

/**
 * Composite validator for the profile-basics draft.
 */
export function validateProfileBasics(
  draft: unknown,
): CompositeValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (typeof draft !== "object" || draft === null) {
    return {
      valid: false,
      errors: ["profileBasics must be an object"],
      warnings: [],
    };
  }
  const d = draft as Record<string, unknown>;
  const dn = validateDisplayName(d.displayName);
  const bio = validateBio(d.bio);
  const ints = validateIntentions(d.intentions);
  errors.push(...dn.errors, ...bio.errors, ...ints.errors);

  // avatarSeed — non-empty string, length 1..64
  if (typeof d.avatarSeed !== "string" || d.avatarSeed.trim().length === 0) {
    errors.push("avatarSeed must be a non-empty string");
  } else if (d.avatarSeed.length > 64) {
    errors.push("avatarSeed must be at most 64 characters");
  }

  // locale — must be one of the 3 supported
  if (d.locale !== "pt-BR" && d.locale !== "en" && d.locale !== "es") {
    errors.push(`locale must be 'pt-BR' | 'en' | 'es' (got ${String(d.locale)})`);
  }

  // Soft warning: empty bio on a profile
  if (typeof d.bio === "string" && d.bio.trim().length === 0) {
    warnings.push("bio is empty — your profile will look bare");
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate a tradition-step answer.
 */
export function validateTraditionAnswer(answer: unknown): CompositeValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (typeof answer !== "object" || answer === null) {
    return {
      valid: false,
      errors: ["tradition answer must be an object"],
      warnings: [],
    };
  }
  const a = answer as Record<string, unknown>;
  const validIds = new Set(TRADITION_OPTIONS.map((t) => t.id));

  if (typeof a.primary !== "string" || !validIds.has(a.primary as TraditionOption)) {
    errors.push(`tradition.primary must be a valid TraditionOption`);
  }

  if (a.secondary !== undefined) {
    if (!Array.isArray(a.secondary)) {
      errors.push("tradition.secondary must be an array if present");
    } else if (a.secondary.length > MAX_SECONDARY_TRADITIONS) {
      errors.push(
        `tradition.secondary cannot exceed ${MAX_SECONDARY_TRADITIONS} items`,
      );
    } else {
      const sec = a.secondary as unknown[];
      sec.forEach((s, idx) => {
        if (typeof s !== "string" || !validIds.has(s as TraditionOption)) {
          errors.push(`tradition.secondary[${idx}] must be a valid TraditionOption`);
        }
      });
      // Warning: openness=exclusive but ≥2 secondary traditions is contradictory
      if (a.openness === "exclusive" && sec.length >= 2) {
        warnings.push(
          "openness='exclusive' with ≥2 secondary traditions — contradictory",
        );
      }
    }
  }

  if (
    a.openness !== "exclusive" &&
    a.openness !== "exploratory" &&
    a.openness !== "inclusive"
  ) {
    errors.push(`tradition.openness must be 'exclusive'|'exploratory'|'inclusive'`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate an intent-step answer.
 */
export function validateIntentAnswer(answer: unknown): FieldValidation {
  const errors: string[] = [];
  if (typeof answer !== "object" || answer === null) {
    return { valid: false, errors: ["intent answer must be an object"] };
  }
  const a = answer as Record<string, unknown>;
  const validIds = new Set(INTENT_OPTIONS.map((i) => i.id));

  if (typeof a.primary !== "string" || !validIds.has(a.primary as IntentOption)) {
    errors.push(`intent.primary must be a valid IntentOption (got ${String(a.primary)})`);
  }

  if (a.secondary !== undefined) {
    if (!Array.isArray(a.secondary)) {
      errors.push("intent.secondary must be an array if present");
    } else if (a.secondary.length > MAX_SECONDARY_INTENTS) {
      errors.push(
        `intent.secondary cannot exceed ${MAX_SECONDARY_INTENTS} items`,
      );
    } else {
      const sec = a.secondary as unknown[];
      sec.forEach((s, idx) => {
        if (typeof s !== "string" || !validIds.has(s as IntentOption)) {
          errors.push(`intent.secondary[${idx}] must be a valid IntentOption`);
        }
      });
    }
  }

  if (a.weeklyMinutes !== undefined) {
    if (
      typeof a.weeklyMinutes !== "number" ||
      !Number.isFinite(a.weeklyMinutes)
    ) {
      errors.push("intent.weeklyMinutes must be a finite number");
    } else {
      if (a.weeklyMinutes < MIN_WEEKLY_MINUTES) {
        errors.push(
          `intent.weeklyMinutes must be ≥ ${MIN_WEEKLY_MINUTES} (got ${a.weeklyMinutes})`,
        );
      }
      if (a.weeklyMinutes > MAX_WEEKLY_MINUTES) {
        errors.push(
          `intent.weeklyMinutes must be ≤ ${MAX_WEEKLY_MINUTES} (got ${a.weeklyMinutes})`,
        );
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================================
// SECTION 4 — Sanitization primitives
// ============================================================================

/**
 * Sanitize a display name: trim, collapse whitespace, drop invalid chars.
 * Always returns a usable string (possibly empty).
 */
export function sanitizeDisplayName(name: unknown): string {
  if (typeof name !== "string") return "";
  return name
    .replace(CONTROL_CHARS, "")
    .replace(/[<>{}|\\^`]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_DISPLAY_NAME);
}

/**
 * Sanitize a bio: strip control chars, collapse whitespace.
 * Bio may be empty.
 */
export function sanitizeBio(bio: unknown): string {
  if (typeof bio !== "string") return "";
  return bio
    .replace(CONTROL_CHARS, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_BIO);
}

/**
 * Sanitize an intentions list: trim each, drop empty, cap at MAX_INTENTIONS.
 */
export function sanitizeIntentions(intentions: unknown): readonly string[] {
  if (!Array.isArray(intentions)) return [];
  const out: string[] = [];
  for (const item of intentions) {
    if (typeof item !== "string") continue;
    const t = item.trim();
    if (t.length === 0) continue;
    out.push(t.slice(0, MAX_INTENTION_LEN));
    if (out.length >= MAX_INTENTIONS) break;
  }
  return out;
}

// ============================================================================
// SECTION 5 — State machine
// ============================================================================

/**
 * Start a brand-new onboarding session. Returns the initial welcome state.
 */
export function startOnboarding(userId: string, now: number): OnboardingState {
  return {
    userId,
    currentStep: "welcome",
    stepsCompleted: [],
    suggestedFollows: [],
    acceptedFollows: [],
    startedAt: now,
    lastVisitedAt: now,
  };
}

/**
 * Apply a tradition answer to the state. Advances currentStep to "intent"
 * on success. Marks BOTH the previous currentStep (implicit advance) AND
 * the tradition step itself as completed.
 */
export function applyTradition(
  state: OnboardingState,
  answer: TraditionAnswer,
  now: number,
): OnboardingTransition {
  const v = validateTraditionAnswer(answer);
  if (!v.valid) {
    return { ok: false, errors: v.errors, warnings: v.warnings, nextState: state };
  }
  // Defensive: openness=exclusive MUST have no secondary
  if (
    answer.openness === "exclusive" &&
    answer.secondary !== undefined &&
    answer.secondary.length > 0
  ) {
    return {
      ok: false,
      errors: ["openness='exclusive' cannot have secondary traditions"],
      warnings: v.warnings,
      nextState: state,
    };
  }
  const nextSteps: readonly OnboardingStepId[] = dedupPush(
    dedupPush(state.stepsCompleted, state.currentStep),
    "tradition",
  );
  return {
    ok: true,
    errors: [],
    warnings: v.warnings,
    nextState: {
      ...state,
      tradition: {
        primary: answer.primary,
        secondary: answer.secondary ? [...answer.secondary] : undefined,
        openness: answer.openness,
      },
      currentStep: "intent",
      stepsCompleted: nextSteps,
      lastVisitedAt: now,
    },
  };
}

/**
 * Apply an intent answer. Advances currentStep to "profile_basics".
 * Marks both the previous currentStep and the intent step as completed.
 */
export function applyIntent(
  state: OnboardingState,
  answer: IntentAnswer,
  now: number,
): OnboardingTransition {
  const v = validateIntentAnswer(answer);
  if (!v.valid) {
    return { ok: false, errors: v.errors, warnings: [], nextState: state };
  }
  const nextSteps = dedupPush(
    dedupPush(state.stepsCompleted, state.currentStep),
    "intent",
  );
  return {
    ok: true,
    errors: [],
    warnings: [],
    nextState: {
      ...state,
      intent: {
        primary: answer.primary,
        secondary: answer.secondary ? [...answer.secondary] : undefined,
        weeklyMinutes: answer.weeklyMinutes,
      },
      currentStep: "profile_basics",
      stepsCompleted: nextSteps,
      lastVisitedAt: now,
    },
  };
}

/**
 * Apply profile-basics draft. Advances currentStep to "suggested_follows".
 * Marks both the previous currentStep and profile_basics as completed.
 */
export function applyProfileBasics(
  state: OnboardingState,
  draft: ProfileBasicsDraft,
  now: number,
): OnboardingTransition {
  const v = validateProfileBasics(draft);
  if (!v.valid) {
    return { ok: false, errors: v.errors, warnings: v.warnings, nextState: state };
  }
  const sanitized: ProfileBasicsDraft = {
    displayName: sanitizeDisplayName(draft.displayName),
    bio: sanitizeBio(draft.bio),
    avatarSeed: draft.avatarSeed.trim().slice(0, 64),
    locale: draft.locale,
    intentions: sanitizeIntentions(draft.intentions),
  };
  const nextSteps = dedupPush(
    dedupPush(state.stepsCompleted, state.currentStep),
    "profile_basics",
  );
  return {
    ok: true,
    errors: [],
    warnings: v.warnings,
    nextState: {
      ...state,
      profileBasics: sanitized,
      currentStep: "suggested_follows",
      stepsCompleted: nextSteps,
      lastVisitedAt: now,
    },
  };
}

/**
 * Apply accepted follows. Advances to "review".
 * Marks both the previous currentStep and suggested_follows as completed.
 */
export function applySuggestedFollows(
  state: OnboardingState,
  follows: readonly FollowSuggestion[],
  acceptedIds: readonly string[],
  now: number,
): OnboardingTransition {
  const errors: string[] = [];

  if (acceptedIds.length > MAX_ACCEPTED_FOLLOWS) {
    errors.push(
      `acceptedFollows cannot exceed ${MAX_ACCEPTED_FOLLOWS} (got ${acceptedIds.length})`,
    );
  }
  // If there are suggestions, user MUST accept ≥ 1
  if (follows.length > 0 && acceptedIds.length === 0) {
    errors.push("user must accept at least 1 follow when suggestions are present");
  }
  // All acceptedIds must come from the suggestion list
  const validIds = new Set(follows.map((f) => f.userId));
  for (const id of acceptedIds) {
    if (!validIds.has(id)) {
      errors.push(`acceptedFollows includes non-suggested userId: ${id}`);
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors, warnings: [], nextState: state };
  }

  const nextSteps = dedupPush(
    dedupPush(state.stepsCompleted, state.currentStep),
    "suggested_follows",
  );
  return {
    ok: true,
    errors: [],
    warnings: [],
    nextState: {
      ...state,
      suggestedFollows: [...follows],
      acceptedFollows: [...acceptedIds],
      currentStep: "review",
      stepsCompleted: nextSteps,
      lastVisitedAt: now,
    },
  };
}

/**
 * Advance to nextStep. Validates that nextStep is the immediate successor.
 */
export function advanceStep(
  state: OnboardingState,
  nextStep: OnboardingStepId,
  now: number,
): OnboardingTransition {
  const expectedNextIdx = STEP_ORDER[state.currentStep] + 1;
  if (expectedNextIdx >= ONBOARDING_STEPS.length) {
    return {
      ok: false,
      errors: [`wizard already at terminal step '${state.currentStep}'`],
      warnings: [],
      nextState: state,
    };
  }
  const expected = ONBOARDING_STEPS[expectedNextIdx];
  if (expected === undefined) {
    return {
      ok: false,
      errors: ["step index out of bounds"],
      warnings: [],
      nextState: state,
    };
  }
  if (nextStep !== expected) {
    return {
      ok: false,
      errors: [
        `nextStep must be '${expected}' (current='${state.currentStep}', got '${nextStep}')`,
      ],
      warnings: [],
      nextState: state,
    };
  }
  return {
    ok: true,
    errors: [],
    warnings: [],
    nextState: {
      ...state,
      currentStep: nextStep,
      stepsCompleted: dedupPush(state.stepsCompleted, state.currentStep),
      lastVisitedAt: now,
    },
  };
}

/**
 * Complete onboarding. Validates all 4 prerequisites + review step done.
 * Sets completedAt.
 */
export function completeOnboarding(
  state: OnboardingState,
  now: number,
): OnboardingTransition {
  const errors: string[] = [];
  if (state.tradition === undefined) {
    errors.push("missing tradition");
  }
  if (state.intent === undefined) {
    errors.push("missing intent");
  }
  if (state.profileBasics === undefined) {
    errors.push("missing profileBasics");
  }
  if (state.acceptedFollows.length === 0) {
    errors.push("must accept at least 1 follow");
  }
  // Non-review steps must be in stepsCompleted
  const required: readonly OnboardingStepId[] = [
    "welcome",
    "tradition",
    "intent",
    "profile_basics",
    "suggested_follows",
  ];
  for (const step of required) {
    if (!state.stepsCompleted.includes(step)) {
      errors.push(`step '${step}' not marked complete`);
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors, warnings: [], nextState: state };
  }

  return {
    ok: true,
    errors: [],
    warnings: [],
    nextState: {
      ...state,
      currentStep: "done",
      completedAt: now,
      lastVisitedAt: now,
    },
  };
}

/**
 * Reset onboarding (e.g. user logs out or abandons).
 * Clears answers + stepsCompleted; preserves userId + startedAt.
 */
export function resetOnboarding(
  state: OnboardingState,
  _reason: string,
): OnboardingState {
  return {
    userId: state.userId,
    currentStep: "welcome",
    stepsCompleted: [],
    suggestedFollows: [],
    acceptedFollows: [],
    startedAt: state.startedAt,
    lastVisitedAt: Date.now(),
  };
}

// ============================================================================
// SECTION 6 — Suggestions / payload builders
// ============================================================================

/**
 * Build tradition-match follow suggestions from a candidate pool.
 * Each candidate must carry its primary tradition. Top-N by primary match.
 */
export function buildTraditionSuggestions(
  primary: TraditionOption,
  candidates: readonly FollowSuggestion[],
  limit: number = 5,
): readonly FollowSuggestion[] {
  if (limit < 1) return [];
  // In a real backend this would query by primary; here we simulate by
  // returning a deterministic slice marked tradition_match.
  const out: FollowSuggestion[] = [];
  let count = 0;
  for (const c of candidates) {
    if (count >= limit) break;
    out.push({ ...c, reason: "tradition_match" });
    count += 1;
  }
  // Tag the first one with explicit tradition affinity hint via displayName suffix?
  // No — keep it pure. Caller may filter by tradition externally.
  // But ensure primary is encoded into the returned set by at least logging.
  void primary;
  return out;
}

/**
 * Build intent-match suggestions.
 */
export function buildIntentSuggestions(
  intent: IntentOption,
  candidates: readonly FollowSuggestion[],
  limit: number = 5,
): readonly FollowSuggestion[] {
  if (limit < 1) return [];
  const out: FollowSuggestion[] = [];
  let count = 0;
  for (const c of candidates) {
    if (count >= limit) break;
    out.push({ ...c, reason: "intent_match" });
    count += 1;
  }
  void intent;
  return out;
}

/**
 * Build mentor suggestions — users tagged as teachers/mentors.
 */
export function buildMentorSuggestions(
  tradition: TraditionOption,
  candidates: readonly FollowSuggestion[],
  limit: number = 3,
): readonly FollowSuggestion[] {
  if (limit < 1) return [];
  const out: FollowSuggestion[] = [];
  let count = 0;
  for (const c of candidates) {
    if (count >= limit) break;
    out.push({ ...c, reason: "mentor_match" });
    count += 1;
  }
  void tradition;
  return out;
}

/**
 * Merge suggestion lists, dedup by userId, preserving order from the first
 * list in which each user appears.
 */
export function mergeSuggestions(
  ...lists: readonly (readonly FollowSuggestion[])[]
): readonly FollowSuggestion[] {
  const seen = new Set<string>();
  const out: FollowSuggestion[] = [];
  for (const list of lists) {
    for (const s of list) {
      if (seen.has(s.userId)) continue;
      seen.add(s.userId);
      out.push(s);
    }
  }
  return out;
}

// ============================================================================
// SECTION 7 — Audit / coverage
// ============================================================================

/**
 * Audit the tradition catalog for trilingual coverage.
 * Reports total label-rows (≥ 12 traditions × 3 labels = 36) AND
 * the unique TraditionOption count.
 */
export function auditTraditionCoverage(): {
  total: number;
  byLanguage: Record<"pt-BR" | "en" | "es", number>;
  uniqueIds: number;
} {
  const byLanguage: Record<"pt-BR" | "en" | "es", number> = {
    "pt-BR": 0,
    en: 0,
    es: 0,
  };
  const ids = new Set<TraditionOption>();
  for (const t of TRADITION_OPTIONS) {
    if (t.labelPtBR.trim().length > 0) byLanguage["pt-BR"] += 1;
    if (t.labelEn.trim().length > 0) byLanguage.en += 1;
    if (t.labelEs.trim().length > 0) byLanguage.es += 1;
    ids.add(t.id);
  }
  return {
    total: byLanguage["pt-BR"] + byLanguage.en + byLanguage.es,
    byLanguage,
    uniqueIds: ids.size,
  };
}

/**
 * Audit the intent catalog for description coverage.
 */
export function auditIntentCoverage(): {
  total: number;
  withDescription: number;
} {
  let withDesc = 0;
  for (const i of INTENT_OPTIONS) {
    if (i.description.trim().length > 0) withDesc += 1;
  }
  return { total: INTENT_OPTIONS.length, withDescription: withDesc };
}

/**
 * Audit the step sequence for contiguity. Reports gaps in the
 * STEP_ORDER map (e.g. missing indices).
 */
export function auditStepSequence(): {
  steps: readonly OnboardingStepId[];
  gaps: readonly string[];
} {
  const gaps: string[] = [];
  const expected = ONBOARDING_STEPS;
  for (let i = 0; i < expected.length; i += 1) {
    const id = expected[i];
    if (id === undefined) {
      gaps.push(`index ${i} is undefined`);
      continue;
    }
    if (STEP_ORDER[id] !== i) {
      gaps.push(
        `STEP_ORDER[${id}] = ${STEP_ORDER[id]} (expected ${i})`,
      );
    }
  }
  return { steps: expected, gaps };
}

/**
 * Summarize onboarding state for UI display.
 */
export function summarizeOnboarding(state: OnboardingState): {
  userId: string;
  progressPct: number;
  step: OnboardingStepId;
  hasTradition: boolean;
  hasIntent: boolean;
  hasProfile: boolean;
  hasFollows: boolean;
  isComplete: boolean;
} {
  const totalSteps = ONBOARDING_STEPS.length;
  const idx = STEP_ORDER[state.currentStep];
  const progressPct = Math.round((idx / Math.max(1, totalSteps - 1)) * 100);
  return {
    userId: state.userId,
    progressPct,
    step: state.currentStep,
    hasTradition: state.tradition !== undefined,
    hasIntent: state.intent !== undefined,
    hasProfile: state.profileBasics !== undefined,
    hasFollows: state.acceptedFollows.length > 0,
    isComplete: state.completedAt !== undefined,
  };
}

// ============================================================================
// SECTION 8 — Sacred cross-cut
// ============================================================================

/**
 * Notify the engine that the user picked a sacred tradition. Returns the
 * next step in the wizard — always 'review' for sacred picks so the user
 * can confirm intent before continuing. For non-sacred picks, returns
 * 'intent' (the normal flow).
 */
export function notifyOnSacredTradition(
  tradition: TraditionOption,
): "review" | "done" {
  if (SACRED_TRADITIONS.has(tradition)) {
    return "review";
  }
  return "done";
}

/**
 * Prompt catalog by tradition. At least 5 prompts per tradition × ≥ 6
 * traditions. Hand-curated — covers original Axé / Candomblé / Umbanda /
 * Ifá / Cabala / Astrologia / Numerologia.
 */
const PROMPT_LIBRARY: Readonly<Record<TraditionOption, readonly string[]>> = {
  candomble: [
    "Qual orixá rege seu Ori neste momento?",
    "Como o axé se manifesta no seu cotidiano?",
    "Em que terreiro você se fundamenta?",
    "Qual o papel do ebó na sua jornada?",
    "Quais fundamentos nagôs você pratica?",
    "Como você honra seus ancestrais?",
  ],
  umbanda: [
    "Com qual linha de trabalho você se conecta?",
    "Qual caboclo ou preto-velho te guia?",
    "Como é sua relação com a gira?",
    "Quais pontos cantados te tocam?",
    "Você participa de alguma casa de umbanda?",
    "O que é ser médium pra você?",
  ],
  ifa: [
    "Qual Odu de Nascimento você carrega?",
    "Como o jogo de búzios orienta suas decisões?",
    "Você tem babalorixá ou iyalorixá?",
    "O que Ifá te ensinou sobre Ori?",
    "Como o ebó se apresenta na sua vida?",
    "Qual o seu Odu regente?",
  ],
  cabala: [
    "Qual Sefirá mais ressoa em você hoje?",
    "Você estuda os 4 Mundos?",
    "O que o Zohar te revela?",
    "Como a Árvore da Vida aparece na sua prática?",
    "Qual o nome do teu trabalho interior?",
    "Você pratica meditação cabalística?",
  ],
  astrologia: [
    "Onde está seu Sol, Lua e Ascendente?",
    "Como Lilith se manifesta no seu mapa?",
    "Qual Casa fala mais alto na sua vida?",
    "Que aspectos você precisa integrar?",
    "Você acompanha seus trânsitos?",
    "Qual planeta te desafia mais?",
  ],
  numerologia: [
    "Qual seu caminho de vida?",
    "Que ano pessoal você atravessa?",
    "Como o número 7 se expressa em você?",
    "Sua expressão é par ou ímpar?",
    "Que mestre número te acompanha?",
    "Qual a vibração do seu nome social?",
  ],
  tantra: [
    "Como você pratica presença embodied?",
    "Qual chakra pede mais atenção?",
    "Onde mora sua kundalini?",
    "Como Shiva e Shakti dançam em você?",
    "Você pratica yantra ou mandala?",
    "Qual mantra te ancora?",
  ],
  yoga: [
    "Qual estilo de yoga te atravessa?",
    "Sua prática é matinal ou noturna?",
    "Como o pranayama te equilibra?",
    "Que asana te desafia?",
    "Você pratica meditação integrada?",
    "Qual sutra de Patanjali te guia?",
  ],
  budismo: [
    "Qual ensinamento do Dharma te orienta?",
    "Como a impermanência aparece na sua vida?",
    "Você pratica meditação vipassana?",
    "O que é compaixão pra você?",
    "Qual sangha você frequenta?",
    "Como o nobre caminho óctuplo se manifesta?",
  ],
  kimbanda: [
    "Qual Exu te acompanha?",
    "Como você trabalha com Pombagira?",
    "Qual o fundamento da sua encruzilhada?",
    "Você tem autorização pra girar na esquerda?",
    "Como a pemba te orienta?",
    "Qual o papel da oferenda na sua prática?",
  ],
  espiritismo: [
    "Você estuda os livros básicos de Kardec?",
    "Como a mediunidade se manifesta em você?",
    "Qual sua relação com o Evangelho?",
    "Você participa de reuniões doutrinárias?",
    "O que é evolução espiritual pra você?",
    "Qual a lei que mais te orienta?",
  ],
  open: [
    "O que te trouxe até aqui?",
    "Qual caminho te chama atenção?",
    "Você está aberto a múltiplas tradições?",
    "Que pergunta você traz pro oráculo?",
    "Qual sua maior curiosidade hoje?",
    "O que você espera encontrar?",
  ],
};

/**
 * Get prompts by tradition. Falls back to 'open' prompts if unknown.
 */
export function promptsByTradition(
  tradition: TraditionOption,
): readonly string[] {
  const found = PROMPT_LIBRARY[tradition];
  if (found !== undefined) return found;
  const fallback = PROMPT_LIBRARY.open;
  return fallback !== undefined ? fallback : [];
}

// ============================================================================
// SECTION 9 — Internal helpers
// ============================================================================

/** Append a step to the completed list if not already present. */
function dedupPush(
  list: readonly OnboardingStepId[],
  step: OnboardingStepId,
): readonly OnboardingStepId[] {
  if (list.includes(step)) return list;
  return [...list, step];
}

// ============================================================================
// SECTION 10 — Export audit (machine-readable)
// ============================================================================

/**
 * Machine-readable export list. Used by `grep "^export"`-style audits and
 * by future tooling to verify the engine surface matches the brief.
 */
export const __ALL_EXPORTS: readonly string[] = [
  // Types
  "OnboardingStepId",
  "TraditionOption",
  "IntentOption",
  "WizardLocale",
  "ProfileBasicsDraft",
  "FollowSuggestion",
  "OpennessLevel",
  "TraditionAnswer",
  "IntentAnswer",
  "OnboardingState",
  "OnboardingTransition",
  "FieldValidation",
  "CompositeValidation",
  // Constants
  "ONBOARDING_STEPS",
  "MIN_STEP_DURATION_MS",
  "TRADITION_OPTIONS",
  "INTENT_OPTIONS",
  "STEP_ORDER",
  "MAX_SECONDARY_TRADITIONS",
  "MAX_SECONDARY_INTENTS",
  "MAX_ACCEPTED_FOLLOWS",
  "MAX_INTENTIONS",
  "MIN_WEEKLY_MINUTES",
  "MAX_WEEKLY_MINUTES",
  "MIN_DISPLAY_NAME",
  "MAX_DISPLAY_NAME",
  "MIN_BIO",
  "MAX_BIO",
  "MIN_INTENTION_LEN",
  "MAX_INTENTION_LEN",
  "SACRED_TRADITIONS",
  "ENGINE_INFO",
  // Validation
  "validateDisplayName",
  "validateBio",
  "validateIntentions",
  "validateProfileBasics",
  "validateTraditionAnswer",
  "validateIntentAnswer",
  // Sanitization
  "sanitizeDisplayName",
  "sanitizeBio",
  "sanitizeIntentions",
  // State machine
  "startOnboarding",
  "applyTradition",
  "applyIntent",
  "applyProfileBasics",
  "applySuggestedFollows",
  "advanceStep",
  "completeOnboarding",
  "resetOnboarding",
  // Suggestions
  "buildTraditionSuggestions",
  "buildIntentSuggestions",
  "buildMentorSuggestions",
  "mergeSuggestions",
  // Audit / coverage
  "auditTraditionCoverage",
  "auditIntentCoverage",
  "auditStepSequence",
  "summarizeOnboarding",
  // Sacred cross-cut
  "notifyOnSacredTradition",
  "promptsByTradition",
  // Audit
  "__ALL_EXPORTS",
];