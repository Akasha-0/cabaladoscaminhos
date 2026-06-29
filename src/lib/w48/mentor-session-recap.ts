// ============================================================
// mentor-session-recap.ts — CABALA DOS CAMINHOS (W48)
// ============================================================
// Auto-generate structured session recaps for mentorship pairs.
// Complements: w45/mentorship-pairing, w40/mentorship-session-notes,
//              w45/tradition-cross-references, w47/voice-mode-tts
//
// Design goals:
//   - One source of truth: RECAP_TEMPLATES registry (no hardcoded UI strings).
//   - Deterministic, auditable: every recap carries an audit trail.
//   - Privacy-by-default: LGPD Art. 18 export + 30-day TTL.
//   - Heuristic-only (no LLM dependency at runtime); pure TypeScript, no deps.
// ============================================================

// ---------------------------------------------------------------
// 1. TYPE DEFINITIONS
// ---------------------------------------------------------------

/** ISO-8601 timestamp string, e.g. "2026-06-29T12:34:41.000Z". */
export type ISODateString = string;

/** UUID-like opaque identifier. We accept any non-empty string. */
export type RecapId = string;

/** Stable identifier for a mentorship session (UUID). */
export type SessionId = string;

/** Stable identifier for the mentor. */
export type MentorId = string;

/** Stable identifier for the mentee. */
export type MenteeId = string;

/** Locale tag (BCP-47). Only pt-BR, en-US, es-ES are first-class. */
export type LocaleCode = 'pt-BR' | 'en-US' | 'es-ES';

/** Tradition tokens referenced across the platform (Cigano Ramiro, Candomblé, Cabala, Astrologia, Tarot, etc.) */
export type TraditionToken =
  | 'cigano-ramiro'
  | 'candomble'
  | 'umbanda'
  | 'ifá'
  | 'cabala'
  | 'astrologia'
  | 'numerologia'
  | 'tarot'
  | 'mesa-real'
  | 'xamanismo'
  | 'tantra'
  | 'cristianismo-mistico';

/** Polarity of sentiment detected from a transcript fragment. */
export type SentimentPolarity = 'positive' | 'neutral' | 'negative' | 'mixed';

/** Confidentiality level applied to a recap after generation. */
export type RecapPrivacyMode =
  | 'public'
  | 'private'
  | 'redacted'
  | 'mentor-only'
  | 'mentee-only'
  | 'joint-review';

/** Output representations supported by the format adapters. */
export type RecapFormat =
  | 'markdown'
  | 'html'
  | 'json'
  | 'pdf-spec'
  | 'text-message'
  | 'voice-script';

/** Lifecycle state of an async recap job. */
export type RecapJobStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'READY'
  | 'FAILED'
  | 'EXPIRED'
  | 'CANCELLED';

/** A logical block of the recap (Summary, Insights, Actions, etc.) */
export interface RecapSection {
  readonly key: string;
  readonly title: string;
  readonly locale: LocaleCode;
  readonly body: string;
  readonly order: number;
  readonly promptUsed?: string;
}

/** A concrete next step surfaced from the session. */
export interface RecapAction {
  readonly id: string;
  readonly text: string;
  readonly ownerId: MentorId | MenteeId;
  readonly ownerRole: 'mentor' | 'mentee';
  /** ISO-8601, optional. Derived from relative phrases ("amanhã", "next week"). */
  readonly dueDate?: ISODateString;
  readonly priority: 'low' | 'medium' | 'high' | 'urgent';
  readonly confidence: number; // 0..1
  readonly sourceSentence?: string;
  readonly tags: readonly string[];
}

/** A pointer to an external resource (book, video, link, marketplace-leituras). */
export interface RecapResource {
  readonly id: string;
  readonly kind: 'book' | 'article' | 'video' | 'exercise' | 'ritual' | 'link' | 'app';
  readonly title: string;
  readonly url?: string;
  readonly author?: string;
  readonly isbn?: string;
  readonly tradition?: TraditionToken;
  readonly recommendedBy: MentorId;
  readonly note?: string;
}

/** Distilled observation coming from the session transcript. */
export interface RecapInsight {
  readonly id: string;
  readonly type:
    | 'theme'
    | 'pattern'
    | 'tradition-ref'
    | 'goal-progress'
    | 'block'
    | 'breakthrough'
    | 'risk-flag'
    | 'self-reference';
  readonly text: string;
  readonly confidence: number; // 0..1
  readonly evidence: readonly string[];
  readonly locale: LocaleCode;
}

/** An unresolved question (open thread) carried forward. */
export interface RecapQuestion {
  readonly id: string;
  readonly text: string;
  readonly askedBy: MentorId | MenteeId;
  readonly askedByRole: 'mentor' | 'mentee';
  readonly status: 'open' | 'partial' | 'parked' | 'resolved';
  readonly followUpHint?: string;
}

/** Sentiment summary of the session. */
export interface RecapMood {
  readonly polarity: SentimentPolarity;
  readonly score: number; // -1..1
  readonly signals: readonly string[];
  readonly dominantTradition?: TraditionToken;
  readonly energyLevel: 'low' | 'medium' | 'high' | 'intense';
}

/** Tradition-specific footnote surfaced in the recap. */
export interface RecapTraditionRef {
  readonly tradition: TraditionToken;
  readonly symbol?: string;
  readonly odu?: string;
  readonly orixa?: string;
  readonly reference: string; // human-readable citation
}

/** Privacy configuration applied to a recap. */
export interface RecapPrivacyConfig {
  readonly mode: RecapPrivacyMode;
  readonly redactLevel: 0 | 1 | 2 | 3;
  readonly allowedViewers: readonly (MentorId | MenteeId)[];
  readonly shareExpiresAt?: ISODateString;
  readonly redactionTokensApplied: readonly string[];
}

/** A fully-built session recap ready to render or share. */
export interface SessionRecap {
  readonly id: RecapId;
  readonly sessionId: SessionId;
  readonly mentorId: MentorId;
  readonly menteeId: MenteeId;
  readonly templateId: string;
  readonly locale: LocaleCode;
  readonly generatedAt: ISODateString;
  readonly sessionDate: ISODateString;
  readonly durationMinutes: number;
  readonly sections: readonly RecapSection[];
  readonly actions: readonly RecapAction[];
  readonly resources: readonly RecapResource[];
  readonly insights: readonly RecapInsight[];
  readonly questions: readonly RecapQuestion[];
  readonly mood: RecapMood;
  readonly traditionRefs: readonly RecapTraditionRef[];
  readonly privacy: RecapPrivacyConfig;
  readonly crossRefs: {
    readonly goalIds: readonly string[];
    readonly sessionNoteIds: readonly string[];
    readonly traditionToken?: TraditionToken;
    readonly resourceIds: readonly string[];
  };
  readonly audit: readonly AuditEntry[];
  readonly fingerprint: string;
}

/** Immutable entry in the recap audit log (LGPD/traceability). */
export interface AuditEntry {
  readonly at: ISODateString;
  readonly actorId: string;
  readonly action: AuditAction;
  readonly detail?: string;
}

/** Catalog of auditable actions performed on a recap. */
export type AuditAction =
  | 'generated'
  | 'format-rendered'
  | 'shared'
  | 'share-revoked'
  | 'privacy-mode-applied'
  | 'crossref-linked'
  | 'archived'
  | 'exported'
  | 'viewed'
  | 'deleted'
  | 'purged-expired'
  | 'redaction-applied'
  | 'job-cancelled'
  | 'job-failed'
  | 'job-retry';

/** Plain input shape consumed by `generateRecap`. */
export interface SessionInput {
  readonly sessionId: SessionId;
  readonly mentorId: MentorId;
  readonly menteeId: MenteeId;
  readonly sessionDate: ISODateString;
  readonly durationMinutes: number;
  readonly locale: LocaleCode;
  readonly templateId?: string;
  readonly notes?: string;
  readonly chatHistory?: readonly ChatTurn[];
  readonly voiceTranscript?: string;
  readonly goals?: readonly GoalRef[];
  readonly resources?: readonly RecapResource[];
  readonly traditionHints?: readonly TraditionToken[];
  readonly privacy?: Partial<RecapPrivacyConfig>;
}

/** One turn of a chat transcript, optional context for generation. */
export interface ChatTurn {
  readonly speakerId: string;
  readonly speakerRole: 'mentor' | 'mentee' | 'observer';
  readonly at: ISODateString;
  readonly text: string;
}

/** Goal snapshot at the time of the session. */
export interface GoalRef {
  readonly id: string;
  readonly title: string;
  readonly targetDate?: ISODateString;
  readonly progress: number; // 0..1
  readonly status: 'not-started' | 'in-progress' | 'blocked' | 'done';
  readonly tradition?: TraditionToken;
}

/** Pending or completed async recap generation request. */
export interface RecapJob {
  readonly id: string;
  readonly sessionInput: SessionInput;
  readonly status: RecapJobStatus;
  readonly enqueuedAt: ISODateString;
  readonly startedAt?: ISODateString;
  readonly finishedAt?: ISODateString;
  readonly error?: { code: string; message: string };
  readonly recapId?: RecapId;
  readonly attempts: number;
  readonly maxAttempts: number;
}

/** A template that controls which sections a recap exposes and how. */
export interface RecapTemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly locale: LocaleCode;
  readonly tone: 'clinical' | 'warm' | 'academic' | 'mystical' | 'pragmatic' | 'gentle';
  readonly sections: readonly TemplateSection[];
  readonly supportedTraditions: readonly TraditionToken[];
  readonly privacyDefault: RecapPrivacyMode;
  readonly ttsHint?: {
    readonly voice: string;
    readonly pace: number;
  };
  readonly version: number;
}

/** A section definition within a template. */
export interface TemplateSection {
  readonly key: string;
  readonly titleKey: string;
  readonly prompt: string;
  readonly order: number;
  readonly required: boolean;
  readonly kind:
    | 'summary'
    | 'list'
    | 'freeform'
    | 'qa'
    | 'table'
    | 'sentiment'
    | 'tradition-notes'
    | 'resources';
  readonly maxItems?: number;
}

/** Permissions for a single share recipient. */
export interface SharePermission {
  readonly recipientId: string;
  readonly recipientRole: 'mentor' | 'mentee' | 'observer' | 'admin';
  readonly canView: boolean;
  readonly canExport: boolean;
  readonly canShare: boolean;
  readonly expiresAt?: ISODateString;
}

// ---------------------------------------------------------------
// 2. CONSTANTS — i18n, default privacy, regex, TTL
// ---------------------------------------------------------------

/** LGPD retention: 30 days. */
export const RECAP_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** Default cap on actions surfaced. */
export const MAX_ACTIONS_DEFAULT = 12;

/** Default cap on insights surfaced. */
export const MAX_INSIGHTS_DEFAULT = 10;

/** Supported locales (matches LOCALIZED_SECTION_LABELS). */
export const SUPPORTED_LOCALES: readonly LocaleCode[] = ['pt-BR', 'en-US', 'es-ES'];

/** Section label dictionary. Keys are i18n keys (snake.case). */
export const LOCALIZED_SECTION_LABELS: Readonly<
  Record<LocaleCode, Readonly<Record<string, string>>>
> = {
  'pt-BR': {
    session_overview: 'Visão geral da sessão',
    key_insights: 'Percepções-chave',
    action_items: 'Ações combinadas',
    open_questions: 'Questões em aberto',
    resources: 'Recursos recomendados',
    tradition_notes: 'Notas de tradição',
    mood_signal: 'Tom emocional',
    privacy_controls: 'Controles de privacidade',
    goal_progress: 'Progresso das metas',
    next_session: 'Próxima sessão',
    redacted_disclaimer: 'Trecho ocultado por privacidade',
    joint_review_note: 'Esta recapitulação foi revisada em conjunto.',
  },
  'en-US': {
    session_overview: 'Session Overview',
    key_insights: 'Key Insights',
    action_items: 'Action Items',
    open_questions: 'Open Questions',
    resources: 'Recommended Resources',
    tradition_notes: 'Tradition Notes',
    mood_signal: 'Emotional Tone',
    privacy_controls: 'Privacy Controls',
    goal_progress: 'Goal Progress',
    next_session: 'Next Session',
    redacted_disclaimer: 'Snippet hidden for privacy',
    joint_review_note: 'This recap was reviewed jointly.',
  },
  'es-ES': {
    session_overview: 'Resumen de la sesión',
    key_insights: 'Ideas clave',
    action_items: 'Acciones acordadas',
    open_questions: 'Cuestiones abiertas',
    resources: 'Recursos recomendados',
    tradition_notes: 'Notas de tradición',
    mood_signal: 'Tono emocional',
    privacy_controls: 'Controles de privacidad',
    goal_progress: 'Progreso de metas',
    next_session: 'Próxima sesión',
    redacted_disclaimer: 'Fragmento ocultado por privacidad',
    joint_review_note: 'Este resumen fue revisado en conjunto.',
  },
};

/** A regex battery used for heuristic extraction. Each entry is a label + pattern. */
export const ACTION_VERB_PATTERNS: ReadonlyArray<{
  readonly locale: LocaleCode;
  readonly verbs: readonly RegExp[];
}> = [
  {
    locale: 'pt-BR',
    verbs: [
      /\b(fa[çc]a|fazer|vou|preciso|devemos|temos que|lembre|combine|concordamos|devo)\b/i,
    ],
  },
  {
    locale: 'en-US',
    verbs: [/\b(do|will|should|must|let's|please|remember|we'll|i'll|need to)\b/i],
  },
  {
    locale: 'es-ES',
    verbs: [/\b(haz|hacer|voy|debemos|tengo que|recuerda|acordamos|debo)\b/i],
  },
];

/** PT/EN/ES positive signal words. Used by sentiment heuristic. */
export const POSITIVE_SIGNALS: ReadonlyArray<string> = [
  'ótimo', 'excelente', 'maravilhoso', 'clareza', 'avanço', 'consegui', 'bom', 'alinhado',
  'great', 'clear', 'aligned', 'breakthrough', 'progress', 'thanks', 'love',
  'genial', 'avance', 'claridad', 'acuerdo', 'logré', 'bien', 'coherente',
];

/** PT/EN/ES negative signal words. */
export const NEGATIVE_SIGNALS: ReadonlyArray<string> = [
  'bloqueio', 'medo', 'culpa', 'dúvida', 'travei', 'desanimado', 'confuso',
  'stuck', 'afraid', 'guilt', 'doubt', 'overwhelmed', 'confused', 'frustrated',
  'bloqueo', 'miedo', 'culpa', 'duda', 'frustrado', 'confundido', 'desesperado',
];

/** Words that hint at tradition references in the transcript. */
export const TRADITION_KEYWORDS: Readonly<Record<TraditionToken, readonly string[]>> = {
  'cigano-ramiro': ['cigano', 'ramiro', 'baralho cigano', 'mesa real'],
  candomble: ['candomblé', 'orixá', 'axé', 'búzios', 'candomble'],
  umbanda: ['umbanda', 'caboclo', 'preto-velho', 'pomba-gira'],
  ifá: ['ifá', 'odu', 'oyê', 'babalaô'],
  cabala: ['cabala', 'kabbalah', 'sefirot', 'árvore da vida', 'zohar'],
  astrologia: ['ascendente', 'meio do céu', 'plutão', 'saturno', 'lua', 'vênus'],
  numerologia: ['numerologia', 'número pessoal', 'mapa numerológico'],
  tarot: ['tarô', 'tarot', 'arcano maior', 'arcano menor'],
  'mesa-real': ['mesa real', 'jogo da mesa', 'tabuleiro da mesa'],
  xamanismo: ['xamanismo', 'rapé', 'sananga', 'kundalini'],
  tantra: ['tantra', 'kundalini', 'yantra'],
  'cristianismo-mistico': ['apócrifos', 'misticismo cristão', 'são paulo', 'mestre',
                           'apocrypha', 'christian mysticism', 'saint paul'],
};

/** Earliest valid ISO date we accept (year 2000). */
export const MIN_ISO_DATE = '2000-01-01T00:00:00.000Z';

// ---------------------------------------------------------------
// 3. RECAP TEMPLATE REGISTRY (6 templates)
// ---------------------------------------------------------------

/** Built-in recap templates. Operators can extend via `customizeTemplate` / `createTemplate`. */
export const RECAP_TEMPLATES: Readonly<Record<string, RecapTemplate>> = {
  default: {
    id: 'default',
    name: 'Default',
    description: 'Balanced recap with insights, actions, mood, and tradition notes.',
    locale: 'pt-BR',
    tone: 'warm',
    version: 1,
    privacyDefault: 'joint-review',
    supportedTraditions: [
      'cigano-ramiro',
      'candomble',
      'umbanda',
      'ifá',
      'cabala',
      'astrologia',
      'numerologia',
      'tarot',
      'mesa-real',
    ],
    sections: [
      { key: 'session_overview', titleKey: 'session_overview', prompt: 'Summarize the session in 3-5 sentences.', order: 1, required: true, kind: 'freeform' },
      { key: 'key_insights', titleKey: 'key_insights', prompt: 'Extract the 3-6 most important insights.', order: 2, required: true, kind: 'list', maxItems: 6 },
      { key: 'action_items', titleKey: 'action_items', prompt: 'List concrete action items with owner and due date.', order: 3, required: true, kind: 'list', maxItems: 12 },
      { key: 'open_questions', titleKey: 'open_questions', prompt: 'Capture unresolved questions.', order: 4, required: false, kind: 'qa' },
      { key: 'resources', titleKey: 'resources', prompt: 'Reference any readings or exercises.', order: 5, required: false, kind: 'resources' },
      { key: 'tradition_notes', titleKey: 'tradition_notes', prompt: 'Capture tradition-specific references.', order: 6, required: false, kind: 'tradition-notes' },
      { key: 'mood_signal', titleKey: 'mood_signal', prompt: 'Report detected emotional tone.', order: 7, required: true, kind: 'sentiment' },
      { key: 'goal_progress', titleKey: 'goal_progress', prompt: 'Show how goals advanced this session.', order: 8, required: false, kind: 'table' },
      { key: 'next_session', titleKey: 'next_session', prompt: 'Suggest a focus for the next encounter.', order: 9, required: false, kind: 'freeform' },
    ],
  },
  therapy_style: {
    id: 'therapy_style',
    name: 'Therapy-style',
    description: 'Clinical, neutral language. Focus on affect, pattern, and safety.',
    locale: 'pt-BR',
    tone: 'clinical',
    version: 1,
    privacyDefault: 'mentor-only',
    supportedTraditions: ['cabala', 'astrologia', 'cristianismo-mistico'],
    sections: [
      { key: 'session_overview', titleKey: 'session_overview', prompt: 'Provide a neutral, third-person summary of the encounter.', order: 1, required: true, kind: 'freeform' },
      { key: 'mood_signal', titleKey: 'mood_signal', prompt: 'Report affect, valence, and arousal signals.', order: 2, required: true, kind: 'sentiment' },
      { key: 'key_insights', titleKey: 'key_insights', prompt: 'Identify recurring patterns and risk flags.', order: 3, required: true, kind: 'list', maxItems: 8 },
      { key: 'open_questions', titleKey: 'open_questions', prompt: 'List hypotheses to test in future sessions.', order: 4, required: true, kind: 'qa' },
      { key: 'action_items', titleKey: 'action_items', prompt: 'Document homework with measurable outcomes.', order: 5, required: true, kind: 'list', maxItems: 6 },
    ],
  },
  academic: {
    id: 'academic',
    name: 'Academic',
    description: 'Citation-friendly format with structured sections and references.',
    locale: 'en-US',
    tone: 'academic',
    version: 1,
    privacyDefault: 'joint-review',
    supportedTraditions: ['cabala', 'astrologia', 'numerologia', 'cristianismo-mistico'],
    sections: [
      { key: 'session_overview', titleKey: 'session_overview', prompt: 'Provide a structured abstract of the session.', order: 1, required: true, kind: 'freeform' },
      { key: 'key_insights', titleKey: 'key_insights', prompt: 'List insights tagged with confidence levels.', order: 2, required: true, kind: 'list', maxItems: 10 },
      { key: 'tradition_notes', titleKey: 'tradition_notes', prompt: 'Cite specific tradition references with source.', order: 3, required: true, kind: 'tradition-notes' },
      { key: 'resources', titleKey: 'resources', prompt: 'Bibliography with citations.', order: 4, required: true, kind: 'resources' },
      { key: 'open_questions', titleKey: 'open_questions', prompt: 'Open research questions.', order: 5, required: false, kind: 'qa' },
    ],
  },
  spiritual_direction: {
    id: 'spiritual_direction',
    name: 'Spiritual-direction',
    description: 'Mystical tone for spiritual direction pairs (Mesa Real, Cigano Ramiro, Umbanda).',
    locale: 'pt-BR',
    tone: 'mystical',
    version: 1,
    privacyDefault: 'joint-review',
    supportedTraditions: [
      'cigano-ramiro',
      'mesa-real',
      'umbanda',
      'candomble',
      'ifá',
      'cabala',
    ],
    sections: [
      { key: 'session_overview', titleKey: 'session_overview', prompt: 'Descreva a sessão com calor e reverência.', order: 1, required: true, kind: 'freeform' },
      { key: 'tradition_notes', titleKey: 'tradition_notes', prompt: 'Capture Odus, Orixás, símbolos, e referências rituais.', order: 2, required: true, kind: 'tradition-notes' },
      { key: 'key_insights', titleKey: 'key_insights', prompt: 'Insight espiritual orientado por entidade ou orixá.', order: 3, required: true, kind: 'list', maxItems: 5 },
      { key: 'resources', titleKey: 'resources', prompt: 'Indicações de leituras e/ou rituais.', order: 4, required: false, kind: 'resources' },
      { key: 'open_questions', titleKey: 'open_questions', prompt: 'Questões para meditação antes da próxima sessão.', order: 5, required: false, kind: 'qa' },
      { key: 'mood_signal', titleKey: 'mood_signal', prompt: 'Tom energético da sessão.', order: 6, required: true, kind: 'sentiment' },
    ],
  },
  reading_focused: {
    id: 'reading_focused',
    name: 'Reading-focused',
    description: 'Centred on books and study. Emphasizes resources and tradition notes.',
    locale: 'pt-BR',
    tone: 'pragmatic',
    version: 1,
    privacyDefault: 'private',
    supportedTraditions: ['cabala', 'cristianismo-mistico', 'astrologia', 'numerologia'],
    sections: [
      { key: 'session_overview', titleKey: 'session_overview', prompt: 'Visão geral do estudo realizado.', order: 1, required: true, kind: 'freeform' },
      { key: 'resources', titleKey: 'resources', prompt: 'Leituras atribuídas para a próxima janela.', order: 2, required: true, kind: 'resources' },
      { key: 'key_insights', titleKey: 'key_insights', prompt: 'Citações e comentários relevantes.', order: 3, required: true, kind: 'list', maxItems: 8 },
      { key: 'action_items', titleKey: 'action_items', prompt: 'Tarefas de leitura/escrita.', order: 4, required: false, kind: 'list', maxItems: 6 },
    ],
  },
  goal_tracking: {
    id: 'goal_tracking',
    name: 'Goal-tracking',
    description: 'Driven by SMART goals and measurable progress.',
    locale: 'en-US',
    tone: 'pragmatic',
    version: 1,
    privacyDefault: 'mentor-only',
    supportedTraditions: [
      'cabala',
      'astrologia',
      'numerologia',
      'cigano-ramiro',
      'mesa-real',
    ],
    sections: [
      { key: 'goal_progress', titleKey: 'goal_progress', prompt: 'Update goal progress with metrics.', order: 1, required: true, kind: 'table' },
      { key: 'session_overview', titleKey: 'session_overview', prompt: 'Concise summary of what was worked on.', order: 2, required: true, kind: 'freeform' },
      { key: 'action_items', titleKey: 'action_items', prompt: 'SMART action items with explicit deadlines.', order: 3, required: true, kind: 'list', maxItems: 8 },
      { key: 'open_questions', titleKey: 'open_questions', prompt: 'Open questions blocking goal completion.', order: 4, required: false, kind: 'qa' },
      { key: 'next_session', titleKey: 'next_session', prompt: 'Plan for next checkpoint.', order: 5, required: true, kind: 'freeform' },
    ],
  },
};

// ---------------------------------------------------------------
// 4. CUSTOM ERROR CLASSES
// ---------------------------------------------------------------

export class RecapError extends Error {
  public readonly code: string;
  public readonly hint?: string;
  public readonly httpStatus: number;
  constructor(code: string, message: string, opts?: { hint?: string; httpStatus?: number }) {
    super(message);
    this.name = 'RecapError';
    this.code = code;
    this.hint = opts?.hint;
    this.httpStatus = opts?.httpStatus ?? 500;
  }
}

export class InvalidTemplateError extends RecapError {
  constructor(detail: string) {
    super('INVALID_TEMPLATE', `Template is invalid: ${detail}`, {
      hint: 'Each template section needs a non-empty prompt and key.',
      httpStatus: 422,
    });
    this.name = 'InvalidTemplateError';
  }
}

export class EmptySessionError extends RecapError {
  constructor() {
    super('EMPTY_SESSION', 'No session input provided.', {
      hint: 'Provide at least one of: notes, chatHistory, voiceTranscript.',
      httpStatus: 400,
    });
    this.name = 'EmptySessionError';
  }
}

export class PrivacyViolationError extends RecapError {
  constructor(reason: string) {
    super('PRIVACY_VIOLATION', `Privacy rule violated: ${reason}`, {
      hint: 'Use a stricter privacy mode or redact sensitive fields.',
      httpStatus: 403,
    });
    this.name = 'PrivacyViolationError';
  }
}

export class RateLimitError extends RecapError {
  constructor(scope: string) {
    super('RATE_LIMIT', `Too many recap operations (${scope}).`, {
      hint: 'Wait or reduce concurrency.',
      httpStatus: 429,
    });
    this.name = 'RateLimitError';
  }
}

export class TemplateNotFoundError extends RecapError {
  constructor(id: string) {
    super('TEMPLATE_NOT_FOUND', `Template not found: ${id}`, {
      hint: 'Use the built-in RECAP_TEMPLATES ids or create a custom one.',
      httpStatus: 404,
    });
    this.name = 'TemplateNotFoundError';
  }
}

export class RecapNotFoundError extends RecapError {
  constructor(id: string) {
    super('RECAP_NOT_FOUND', `Recap not found: ${id}`, {
      httpStatus: 404,
    });
    this.name = 'RecapNotFoundError';
  }
}

export class UnauthorizedShareError extends RecapError {
  constructor(recipientId: string) {
    super('UNAUTHORIZED_SHARE', `Recipient not allowed: ${recipientId}`, {
      hint: 'Verify permissions and privacy mode.',
      httpStatus: 403,
    });
    this.name = 'UnauthorizedShareError';
  }
}

export class CrossRefMismatchError extends RecapError {
  constructor(reason: string) {
    super('CROSSREF_MISMATCH', `Cross-reference invalid: ${reason}`, {
      hint: 'Ensure the linked entity exists and the privacy mode permits linking.',
      httpStatus: 409,
    });
    this.name = 'CrossRefMismatchError';
  }
}

export class JobStateError extends RecapError {
  constructor(current: RecapJobStatus, attempted: string) {
    super('JOB_STATE', `Job in state ${current} cannot ${attempted}.`, {
      httpStatus: 409,
    });
    this.name = 'JobStateError';
  }
}

export class LocaleUnsupportedError extends RecapError {
  constructor(locale: string) {
    super('LOCALE_UNSUPPORTED', `Locale not supported: ${locale}`, {
      hint: `Use one of: ${SUPPORTED_LOCALES.join(', ')}.`,
      httpStatus: 400,
    });
    this.name = 'LocaleUnsupportedError';
  }
}

export class InsufficientDataError extends RecapError {
  constructor(reason: string) {
    super('INSUFFICIENT_DATA', `Not enough data to proceed: ${reason}`, {
      httpStatus: 422,
    });
    this.name = 'InsufficientDataError';
  }
}

export class RedactionError extends RecapError {
  constructor(reason: string) {
    super('REDACTION', `Redaction failed: ${reason}`, {
      httpStatus: 422,
    });
    this.name = 'RedactionError';
  }
}

// ---------------------------------------------------------------
// 5. PRIVACY MODES
// ---------------------------------------------------------------

/** Declarative privacy-mode catalog. */
export const PRIVACY_MODES: Readonly<
  Record<RecapPrivacyMode, {
    readonly redactLevel: 0 | 1 | 2 | 3;
    readonly allowedViewers: readonly ('mentor' | 'mentee' | 'joint' | 'public')[];
    readonly description: string;
  }>
> = {
  public:       { redactLevel: 0, allowedViewers: ['public'],  description: 'Anyone with the link can view.' },
  private:      { redactLevel: 3, allowedViewers: [],           description: 'Owner-only; everything else is redacted.' },
  redacted:     { redactLevel: 2, allowedViewers: ['mentor', 'mentee'], description: 'Names and identifying details are masked.' },
  'mentor-only':{ redactLevel: 1, allowedViewers: ['mentor'],  description: 'Mentor sees full recap; mentee sees none.' },
  'mentee-only':{ redactLevel: 1, allowedViewers: ['mentee'],  description: 'Mentee sees full recap; mentor sees none.' },
  'joint-review':{ redactLevel: 0, allowedViewers: ['mentor', 'mentee', 'joint'], description: 'Both parties see the full recap.' },
};

/**
 * Apply privacy mode to a recap. Returns a new object with sensitive fields
 * stripped and audit entry appended. Pure function.
 */
export function applyPrivacyMode(
  recap: SessionRecap,
  mode: RecapPrivacyMode,
  actorId: string = 'system',
): SessionRecap {
  const modeDef = PRIVACY_MODES[mode];
  if (!modeDef) {
    throw new PrivacyViolationError(`unknown privacy mode: ${mode}`);
  }
  const redactLevel = modeDef.redactLevel;

  // Map redactLevel to fields hidden.
  const redactedActions = redactLevel >= 1 ? [] : recap.actions;
  const redactedInsights = redactLevel >= 2
    ? recap.insights.map(i => ({ ...i, text: redactText(i.text, redactLevel) }))
    : recap.insights;
  const redactedQuestions = redactLevel >= 1 ? [] : recap.questions;
  const redactedMood = redactLevel >= 2 ? redactMood(recap.mood) : recap.mood;
  const redactedNotes = redactLevel >= 2
    ? recap.traditionRefs.map(t => ({ ...t, reference: redactText(t.reference, redactLevel) }))
    : recap.traditionRefs;

  const allowed = modeDef.allowedViewers;
  const allowedIds: (MentorId | MenteeId)[] = [];
  if (allowed.includes('mentor')) allowedIds.push(recap.mentorId);
  if (allowed.includes('mentee')) allowedIds.push(recap.menteeId);
  if (allowed.includes('joint')) allowedIds.push(recap.mentorId, recap.menteeId);

  const updated: SessionRecap = {
    ...recap,
    actions: redactedActions,
    insights: redactedInsights,
    questions: redactedQuestions,
    mood: redactedMood,
    traditionRefs: redactedNotes,
    privacy: {
      mode,
      redactLevel,
      allowedViewers: allowedIds,
      redactionTokensApplied: redactLevel > 0 ? ['names', 'pii', 'tradition-symbols'] : [],
    },
    audit: [
      ...recap.audit,
      {
        at: nowIso(),
        actorId,
        action: 'privacy-mode-applied',
        detail: `mode=${mode} redactLevel=${redactLevel}`,
      },
    ],
  };
  return updated;
}

/** Helper — replace long tokens (names, emails) with `[redacted]`. */
function redactText(input: string, level: 0 | 1 | 2 | 3): string {
  if (level === 0) return input;
  let out = input;
  if (level >= 1) {
    out = out.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[redacted-email]');
  }
  if (level >= 2) {
    out = out.replace(/\b[A-ZÀ-Ý][a-zà-ÿ]{2,}(?:\s+[A-ZÀ-Ý][a-zà-ÿ]{2,})+/g, '[redacted-name]');
  }
  if (level >= 3) {
    out = out.replace(/[A-Za-zÀ-ÿ]{4,}/g, (m) => (m.length % 2 === 0 ? '████' : m[0] + '███'));
  }
  return out;
}

/** Helper — redact mood detail while keeping polarity. */
function redactMood(mood: RecapMood): RecapMood {
  return {
    ...mood,
    signals: mood.signals.map((s) => '[redacted]'),
    dominantTradition: mood.dominantTradition,
  };
}

// ---------------------------------------------------------------
// 6. UTILITIES (id, hashing, ISO, validation)
// ---------------------------------------------------------------

/** Current time as ISO 8601 UTC. */
export function nowIso(): ISODateString {
  return new Date().toISOString();
}

/** Generic UUID-ish identifier (collision-resistant enough for in-memory). */
export function makeId(prefix: string = ''): string {
  const rand = Math.random().toString(36).slice(2, 10);
  const ts = Date.now().toString(36);
  return `${prefix}${prefix ? '_' : ''}${ts}${rand}`;
}

/** Stable FNV-1a fingerprint of a recap object (string-only). Used for diff/cache. */
export function fingerprint(recap: SessionRecap): string {
  const seed = `${recap.id}|${recap.sessionId}|${recap.templateId}|${recap.generatedAt}`;
  return hashFnv1a(seed);
}

/** Minimal FNV-1a 32-bit hash. */
export function hashFnv1a(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return ('00000000' + h.toString(16)).slice(-8);
}

/** Validate ISO date and sessionDate sanity. */
export function assertValidSession(input: SessionInput): void {
  if (!input || !input.sessionId || !input.mentorId || !input.menteeId) {
    throw new InsufficientDataError('session core identifiers missing');
  }
  if (
    input.durationMinutes <= 0 ||
    input.durationMinutes > 24 * 60
  ) {
    throw new InsufficientDataError('durationMinutes out of range');
  }
  if (!SUPPORTED_LOCALES.includes(input.locale)) {
    throw new LocaleUnsupportedError(input.locale);
  }
  if (
    !input.notes &&
    (!input.chatHistory || input.chatHistory.length === 0) &&
    !input.voiceTranscript
  ) {
    throw new EmptySessionError();
  }
}

/** Convert relative due-date phrases to ISO date. */
export function resolveRelativeDueDate(
  baseIso: ISODateString,
  phrase: string,
  locale: LocaleCode,
): ISODateString | undefined {
  const base = new Date(baseIso);
  if (Number.isNaN(base.getTime())) return undefined;
  const p = phrase.toLowerCase();

  const map: Readonly<Record<string, number>> = {
    'amanhã': 1, 'tomorrow': 1, 'mañana': 1,
    'hoje': 0, 'today': 0, 'hoy': 0,
    'próxima semana': 7, 'next week': 7, 'próxima semana ': 7, 'la próxima semana': 7, 'proxima semana': 7,
    'próximo mês': 30, 'next month': 30, 'próximo mes': 30, 'el próximo mes': 30, 'proximo mes': 30,
  };
  for (const key of Object.keys(map)) {
    if (p.includes(key)) {
      const d = new Date(base.getTime() + map[key] * 24 * 60 * 60 * 1000);
      return d.toISOString();
    }
  }

  // Handle "em N dias" / "in N days" / "en N días"
  const numericMatch = /(em|in|en)\s+(\d{1,3})\s+(dia|day|días|dias)/i.exec(p);
  if (numericMatch) {
    const n = Number(numericMatch[2]);
    if (!Number.isNaN(n) && n > 0 && n < 365) {
      const d = new Date(base.getTime() + n * 24 * 60 * 60 * 1000);
      return d.toISOString();
    }
  }
  return undefined;
}

// ---------------------------------------------------------------
// 7. EXTRACTION HEURISTICS
// ---------------------------------------------------------------

/**
 * Split a free-form blob into sentences.
 * Handles PT/EN/ES punctuation and skips empties.
 */
export function splitSentences(text: string): string[] {
  if (!text) return [];
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?…])\s+|\n+/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Extract action items from a transcript.
 * Heuristic: imperative sentences matching a verb set, optionally with owner hints.
 */
export function extractActionItems(
  transcript: string,
  locale: LocaleCode = 'pt-BR',
): RecapAction[] {
  if (!transcript) return [];
  const sentences = splitSentences(transcript);
  const localeEntry = ACTION_VERB_PATTERNS.find((e) => e.locale === locale)
    ?? ACTION_VERB_PATTERNS[0];
  const verbs = localeEntry.verbs;
  const out: RecapAction[] = [];

  for (const sentence of sentences) {
    const hit = verbs.some((re) => re.test(sentence));
    if (!hit) continue;
    const ownerRole: 'mentor' | 'mentee' = /vou|devo|i'?ll|we'?ll|voy|debo/i.test(sentence) ? 'mentee' : 'mentor';
    const ownerId = ownerRole === 'mentee' ? 'mentee' : 'mentor';
    const dueDate = resolveRelativeDueDate(nowIso(), sentence, locale);
    out.push({
      id: makeId('act'),
      text: sentence.replace(/[.!?]+$/, ''),
      ownerId,
      ownerRole,
      dueDate,
      priority: dueDate ? 'medium' : 'low',
      confidence: hit ? 0.7 : 0.4,
      sourceSentence: sentence,
      tags: [],
    });
    if (out.length >= MAX_ACTIONS_DEFAULT) break;
  }
  return out;
}

/**
 * Extract insights using lexicon + tradition detection.
 */
export function extractInsights(sessionNotes: string): RecapInsight[] {
  if (!sessionNotes) return [];
  const sentences = splitSentences(sessionNotes);
  const insights: RecapInsight[] = [];

  // Theme detection (top repeated words above threshold)
  const wordFreq = new Map<string, number>();
  for (const s of sentences) {
    for (const w of s.toLowerCase().split(/[\s,.!?;:()"'`]+/)) {
      if (w.length < 5) continue;
      wordFreq.set(w, (wordFreq.get(w) ?? 0) + 1);
    }
  }
  const themes = [...wordFreq.entries()]
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  for (const [term, count] of themes) {
    insights.push({
      id: makeId('ins'),
      type: 'theme',
      text: `Repeated theme: "${term}" (${count}×)`,
      confidence: Math.min(0.95, 0.5 + count * 0.05),
      evidence: sentences.filter((s) => s.toLowerCase().includes(term)).slice(0, 3),
      locale: 'en-US',
    });
  }

  // Tradition references
  for (const tradition of Object.keys(TRADITION_KEYWORDS) as TraditionToken[]) {
    const keywords = TRADITION_KEYWORDS[tradition];
    const matches = sentences.filter((s) =>
      keywords.some((k) => s.toLowerCase().includes(k)),
    );
    if (matches.length) {
      insights.push({
        id: makeId('ins'),
        type: 'tradition-ref',
        text: `Tradition references (${tradition}): ${matches.length} sentence(s).`,
        confidence: 0.85,
        evidence: matches.slice(0, 3),
        locale: 'pt-BR',
      });
    }
  }

  // Sentiment-driven risk-flag / breakthrough detection
  const negativeHits = sentences.filter((s) =>
    NEGATIVE_SIGNALS.some((w) => s.toLowerCase().includes(w)),
  );
  const positiveHits = sentences.filter((s) =>
    POSITIVE_SIGNALS.some((w) => s.toLowerCase().includes(w)),
  );
  if (negativeHits.length > positiveHits.length && negativeHits.length >= 2) {
    insights.push({
      id: makeId('ins'),
      type: 'risk-flag',
      text: 'Persistent distress signals detected across multiple sentences.',
      confidence: 0.7,
      evidence: negativeHits.slice(0, 3),
      locale: 'en-US',
    });
  }
  if (positiveHits.length >= 2 && positiveHits.length > negativeHits.length) {
    insights.push({
      id: makeId('ins'),
      type: 'breakthrough',
      text: "Notable positive momentum. Consider reinforcing what is working.",
      confidence: 0.65,
      evidence: positiveHits.slice(0, 3),
      locale: 'en-US',
    });
  }

  return insights.slice(0, MAX_INSIGHTS_DEFAULT);
}

/**
 * Aggregate mood signal from one or more texts (chat history, transcript, notes).
 */
export function deriveMood(input: {
  notes?: string;
  transcript?: string;
  chatHistory?: readonly ChatTurn[];
}): RecapMood {
  const corpus = [
    input.notes ?? '',
    input.transcript ?? '',
    ...((input.chatHistory ?? []).map((t) => t.text)),
  ]
    .join(' ')
    .toLowerCase();

  let pos = 0;
  let neg = 0;
  for (const w of POSITIVE_SIGNALS) if (corpus.includes(w)) pos += 1;
  for (const w of NEGATIVE_SIGNALS) if (corpus.includes(w)) neg += 1;
  const score = corpus ? (pos - neg) / Math.max(1, pos + neg) : 0;
  const polarity: SentimentPolarity =
    pos === 0 && neg === 0 ? 'neutral'
      : pos > 0 && neg > 0 && Math.abs(pos - neg) <= 1 ? 'mixed'
      : pos > neg ? 'positive'
      : 'negative';

  const dominantTradition = (Object.keys(TRADITION_KEYWORDS) as TraditionToken[])
    .map((t) => ({ t, c: TRADITION_KEYWORDS[t].reduce((acc, w) => acc + (corpus.includes(w) ? 1 : 0), 0) }))
    .filter((x) => x.c > 0)
    .sort((a, b) => b.c - a.c)[0]?.t;

  const energyLevel: RecapMood['energyLevel'] =
    corpus.length > 4000 ? 'intense'
      : corpus.length > 1500 ? 'high'
      : corpus.length > 400 ? 'medium'
      : 'low';

  return {
    polarity,
    score,
    signals: [
      ...(pos ? [`positive_count=${pos}`] : []),
      ...(neg ? [`negative_count=${neg}`] : []),
      `length=${corpus.length}`,
    ],
    dominantTradition,
    energyLevel,
  };
}

/**
 * Extract named entities (mentors/books/dates) using regex + token heuristics.
 */
export function extractNamedEntities(text: string): {
  people: readonly string[];
  books: readonly string[];
  dates: readonly string[];
  organizations: readonly string[];
} {
  if (!text) return { people: [], books: [], dates: [], organizations: [] };
  const people = Array.from(
    new Set(
      (text.match(/\b[A-ZÀ-Ý][a-zà-ÿ]{2,}(?:\s+[A-ZÀ-Ý][a-zà-ÿ]{2,})+/g) ?? []).slice(0, 5),
    ),
  );
  // Crude: capitalised phrases followed by common hint tokens.
  const bookHints = /(?:by|por|de|written by|escrito por)\s+([A-ZÀ-Ý][\wÀ-ÿ\s]{2,40})/g;
  const books = Array.from(new Set((text.match(bookHints) ?? []).map((s) => s.trim()).slice(0, 5)));
  const dates = text.match(/\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g) ?? [];
  const orgs = text.match(/\b(?:Cabala dos Caminhos|Mesa Real|Cigano Ramiro|Candomblé|Umbanda|Ifá)\b/g) ?? [];
  return {
    people,
    books,
    dates: Array.from(new Set(dates)).slice(0, 5),
    organizations: Array.from(new Set(orgs)).slice(0, 5),
  };
}

/** Detect tradition references in text via TRADITION_KEYWORDS. */
export function detectTraditionRefs(text: string): RecapTraditionRef[] {
  if (!text) return [];
  const refs: RecapTraditionRef[] = [];
  const lower = text.toLowerCase();
  for (const tradition of Object.keys(TRADITION_KEYWORDS) as TraditionToken[]) {
    const hits = TRADITION_KEYWORDS[tradition].filter((k) => lower.includes(k));
    if (hits.length) {
      refs.push({
        tradition,
        reference: hits[0].toUpperCase(),
      });
    }
  }
  return refs;
}

// ---------------------------------------------------------------
// 8. TEMPLATE MANAGEMENT
// ---------------------------------------------------------------

/** In-memory store for custom templates (export so a real layer can persist). */
export const CUSTOM_TEMPLATES: Map<string, RecapTemplate> = new Map();

/** Look up a template by id (built-ins + custom). */
export function getTemplate(id: string): RecapTemplate {
  const t = RECAP_TEMPLATES[id] ?? CUSTOM_TEMPLATES.get(id);
  if (!t) throw new TemplateNotFoundError(id);
  return t;
}

/** Customize an existing template — returns a new id under CUSTOM_TEMPLATES. */
export function customizeTemplate(
  templateId: string,
  overrides: Partial<Pick<RecapTemplate, 'name' | 'description' | 'tone' | 'privacyDefault' | 'ttsHint' | 'sections' | 'supportedTraditions'>>,
): RecapTemplate {
  const base = getTemplate(templateId);
  const id = makeId(`tpl_${base.id}`);
  const merged: RecapTemplate = {
    ...base,
    id,
    name: overrides.name ?? `${base.name} (custom)`,
    description: overrides.description ?? base.description,
    tone: overrides.tone ?? base.tone,
    privacyDefault: overrides.privacyDefault ?? base.privacyDefault,
    supportedTraditions: overrides.supportedTraditions ?? base.supportedTraditions,
    ttsHint: overrides.ttsHint ?? base.ttsHint,
    sections: (overrides.sections ?? base.sections).map((s, i) => ({ ...s, order: i + 1 })),
    version: base.version + 1,
  };
  validateTemplate(merged);
  CUSTOM_TEMPLATES.set(id, merged);
  return merged;
}

/** Create a fresh template (must validate first). */
export function createTemplate(template: RecapTemplate): RecapTemplate {
  validateTemplate(template);
  if (RECAP_TEMPLATES[template.id]) {
    throw new InvalidTemplateError(`id ${template.id} collides with a built-in`);
  }
  CUSTOM_TEMPLATES.set(template.id, template);
  return template;
}

/** Validate a template: every section needs key + non-empty prompt. */
export function validateTemplate(template: RecapTemplate): void {
  if (!template.id || !template.name) {
    throw new InvalidTemplateError('id/name missing');
  }
  if (!template.sections.length) {
    throw new InvalidTemplateError('no sections');
  }
  const seen = new Set<string>();
  for (const s of template.sections) {
    if (!s.key) throw new InvalidTemplateError('section.key required');
    if (seen.has(s.key)) throw new InvalidTemplateError(`duplicate section key ${s.key}`);
    seen.add(s.key);
    if (!s.prompt || s.prompt.trim().length === 0) {
      throw new InvalidTemplateError(`section ${s.key} has empty prompt`);
    }
    if (s.order < 1) throw new InvalidTemplateError(`section ${s.key} order must be >= 1`);
  }
}

/** Render a template given sample session data (no DB I/O). */
export function previewTemplate(
  templateId: string,
  sampleData: Partial<SessionInput>,
): { ok: true; sections: readonly RecapSection[]; warnings: readonly string[] }
  | { ok: false; error: string } {
  try {
    const template = getTemplate(templateId);
    const fakeInput: SessionInput = {
      sessionId: sampleData.sessionId ?? 'preview_session',
      mentorId: sampleData.mentorId ?? 'preview_mentor',
      menteeId: sampleData.menteeId ?? 'preview_mentee',
      sessionDate: sampleData.sessionDate ?? nowIso(),
      durationMinutes: sampleData.durationMinutes ?? 45,
      locale: sampleData.locale ?? template.locale,
      templateId,
      notes: sampleData.notes ?? 'Sample notes for preview.',
      chatHistory: sampleData.chatHistory,
      voiceTranscript: sampleData.voiceTranscript,
    };
    const recap = generateRecap(fakeInput);
    return {
      ok: true,
      sections: recap.sections,
      warnings: ['Preview generated from sample data only.'],
    };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------
// 9. RECAP GENERATION ENGINE
// ---------------------------------------------------------------

/**
 * Generate a SessionRecap from a SessionInput. Pure, deterministic given the input.
 */
export function generateRecap(sessionInput: SessionInput): SessionRecap {
  assertValidSession(sessionInput);

  const templateId = sessionInput.templateId ?? 'default';
  const template = getTemplate(templateId);
  const locale = sessionInput.locale ?? template.locale;
  if (!SUPPORTED_LOCALES.includes(locale)) throw new LocaleUnsupportedError(locale);

  const corpus = [
    sessionInput.notes ?? '',
    sessionInput.voiceTranscript ?? '',
    ...((sessionInput.chatHistory ?? []).map((t) => t.text)),
  ].join('\n').trim();

  if (!corpus) throw new EmptySessionError();

  const actions = extractActionItems(corpus, locale);
  const insights = extractInsights(corpus);
  const mood = deriveMood({
    notes: sessionInput.notes,
    transcript: sessionInput.voiceTranscript,
    chatHistory: sessionInput.chatHistory,
  });
  const traditionRefs = detectTraditionRefs(corpus);

  const labels = LOCALIZED_SECTION_LABELS[locale];
  const orderedSections = [...template.sections].sort((a, b) => a.order - b.order);

  const sections: RecapSection[] = orderedSections.map((s) => ({
    key: s.key,
    title: labels[s.titleKey] ?? s.titleKey,
    locale,
    body: renderSectionBody(s, {
      corpus,
      sessionInput,
      insights,
      mood,
      traditionRefs,
    }),
    order: s.order,
    promptUsed: s.prompt,
  }));

  const privacy: RecapPrivacyConfig = {
    mode: sessionInput.privacy?.mode ?? template.privacyDefault,
    redactLevel: 0,
    allowedViewers: sessionInput.privacy?.allowedViewers ?? [sessionInput.mentorId, sessionInput.menteeId],
    shareExpiresAt: sessionInput.privacy?.shareExpiresAt,
    redactionTokensApplied: [],
  };

  const recap: SessionRecap = {
    id: makeId('recap'),
    sessionId: sessionInput.sessionId,
    mentorId: sessionInput.mentorId,
    menteeId: sessionInput.menteeId,
    templateId,
    locale,
    generatedAt: nowIso(),
    sessionDate: sessionInput.sessionDate,
    durationMinutes: sessionInput.durationMinutes,
    sections,
    actions,
    resources: sessionInput.resources ?? [],
    insights,
    questions: extractQuestions(sessionInput.chatHistory),
    mood,
    traditionRefs,
    privacy,
    crossRefs: {
      goalIds: (sessionInput.goals ?? []).map((g) => g.id),
      sessionNoteIds: [],
      traditionToken: sessionInput.traditionHints?.[0],
      resourceIds: (sessionInput.resources ?? []).map((r) => r.id),
    },
    audit: [
      {
        at: nowIso(),
        actorId: sessionInput.mentorId,
        action: 'generated',
        detail: `template=${templateId} locale=${locale}`,
      },
    ],
    fingerprint: '',
  };

  const withFingerprint: SessionRecap = { ...recap, fingerprint: fingerprint(recap) };
  return privacy.mode === 'joint-review' || privacy.mode === 'public'
    ? withFingerprint
    : applyPrivacyMode(withFingerprint, privacy.mode, sessionInput.mentorId);
}

/** Body filler per section kind. */
function renderSectionBody(
  section: TemplateSection,
  ctx: {
    corpus: string;
    sessionInput: SessionInput;
    insights: readonly RecapInsight[];
    mood: RecapMood;
    traditionRefs: readonly RecapTraditionRef[];
  },
): string {
  switch (section.kind) {
    case 'summary':
    case 'freeform': {
      const overview = `Session of ${ctx.sessionInput.durationMinutes} minute(s) with ${
        ctx.mood.polarity
      } valence. ${ctx.corpus.slice(0, 280)}…`;
      return overview;
    }
    case 'list': {
      const items = ctx.insights.slice(0, section.maxItems ?? 6).map((i) => `• ${i.text}`);
      return items.length ? items.join('\n') : 'No insights extracted.';
    }
    case 'qa': {
      return (ctx.sessionInput.chatHistory ?? [])
        .filter((t) => t.text.includes('?'))
        .slice(0, 5)
        .map((t) => `[${t.speakerRole}] ${t.text}`)
        .join('\n') || 'No open questions captured.';
    }
    case 'table': {
      const rows = (ctx.sessionInput.goals ?? []).map(
        (g) => `| ${g.title} | ${(g.progress * 100).toFixed(0)}% | ${g.status} |`,
      );
      return rows.length ? rows.join('\n') : 'No goals to track.';
    }
    case 'sentiment': {
      return `Valence=${ctx.mood.score.toFixed(2)} | Polarity=${ctx.mood.polarity} | Energy=${ctx.mood.energyLevel}`;
    }
    case 'tradition-notes': {
      return ctx.traditionRefs.length
        ? ctx.traditionRefs.map((r) => `• ${r.tradition} — ${r.reference}`).join('\n')
        : 'No tradition-specific references detected.';
    }
    case 'resources': {
      return (ctx.sessionInput.resources ?? []).length
        ? (ctx.sessionInput.resources ?? [])
            .map((r) => `• ${r.title}${r.author ? ` — ${r.author}` : ''}${r.url ? ` (${r.url})` : ''}`)
            .join('\n')
        : 'No resources listed.';
    }
    default:
      return '';
  }
}

/** Extract open questions from chat history. */
function extractQuestions(chat: readonly ChatTurn[] | undefined): RecapQuestion[] {
  if (!chat) return [];
  return chat
    .filter((t) => /\?/.test(t.text))
    .slice(0, 8)
    .map<RecapQuestion>((t) => ({
      id: makeId('qst'),
      text: t.text.trim(),
      askedBy: t.speakerId,
      askedByRole: t.speakerRole === 'mentor' ? 'mentor' : 'mentee',
      status: 'open',
    }));
}

// ---------------------------------------------------------------
// 10. FORMAT ADAPTERS
// ---------------------------------------------------------------

/** Render a recap as Markdown. */
export function toMarkdown(recap: SessionRecap): string {
  const lines: string[] = [];
  lines.push(`# Session Recap — ${recap.sessionDate}`);
  lines.push('');
  lines.push(`_Recap \`${recap.id}\` — template \`${recap.templateId}\` — locale \`${recap.locale}\``);
  lines.push('');
  for (const s of recap.sections) {
    lines.push(`## ${s.title}`);
    lines.push('');
    lines.push(s.body);
    lines.push('');
  }
  if (recap.actions.length) {
    lines.push('## Action Items');
    lines.push('');
    for (const a of recap.actions) {
      lines.push(`- [ ] **${a.ownerRole}** — ${a.text}${a.dueDate ? ` (due ${a.dueDate})` : ''}`);
    }
    lines.push('');
  }
  if (recap.resources.length) {
    lines.push('## Resources');
    lines.push('');
    for (const r of recap.resources) {
      lines.push(`- ${r.title}${r.author ? ` — ${r.author}` : ''}${r.url ? ` <${r.url}>` : ''}`);
    }
    lines.push('');
  }
  lines.push('---');
  lines.push(`_Privacy: ${recap.privacy.mode} (redact ${recap.privacy.redactLevel})_`);
  return lines.join('\n');
}

/** Render a recap as HTML (escaped, minimal — no third-party deps). */
export function toHTML(recap: SessionRecap): string {
  const esc = (s: string): string =>
    s.replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c),
    );
  const sectionTags = recap.sections
    .map(
      (s) =>
        `<section><h2>${esc(s.title)}</h2><pre>${esc(s.body)}</pre></section>`,
    )
    .join('\n');
  return `<article data-recap="${esc(recap.id)}">
<header><h1>Session Recap</h1><p>${esc(recap.sessionDate)} · ${recap.durationMinutes}min</p></header>
${sectionTags}
<footer><small>Privacy: ${esc(recap.privacy.mode)} (level ${recap.privacy.redactLevel})</small></footer>
</article>`;
}

/** Render a recap as JSON. */
export function toJSON(recap: SessionRecap): string {
  return JSON.stringify(recap, null, 2);
}

/**
 * Render a recap to a PDF *specification* (declarative, no actual PDF library).
 * Useful to send to a server-side renderer (e.g., puppeteer, headless chrome).
 */
export function toPDFSpec(recap: SessionRecap): {
  pageSize: 'A4' | 'Letter';
  margins: { top: number; right: number; bottom: number; left: number };
  fonts: { heading: string; body: string };
  blocks: readonly {
    type: 'heading' | 'paragraph' | 'list' | 'divider' | 'table';
    content: readonly string[];
    level?: number;
  }[];
} {
  const blocks: {
    type: 'heading' | 'paragraph' | 'list' | 'divider' | 'table';
    content: readonly string[];
    level?: number;
  }[] = [];

  blocks.push({ type: 'heading', content: [`Session Recap ${recap.sessionDate}`], level: 1 });
  for (const s of recap.sections) {
    blocks.push({ type: 'heading', content: [s.title], level: 2 });
    blocks.push({ type: 'paragraph', content: [s.body] });
  }
  if (recap.actions.length) {
    blocks.push({ type: 'heading', content: ['Action Items'], level: 2 });
    blocks.push({
      type: 'list',
      content: recap.actions.map((a) => `${a.ownerRole}: ${a.text}`),
    });
  }
  blocks.push({ type: 'divider', content: [] });

  return {
    pageSize: 'A4',
    margins: { top: 24, right: 24, bottom: 24, left: 24 },
    fonts: { heading: 'Georgia', body: 'Helvetica' },
    blocks,
  };
}

/** Compact text-only rendering (SMS/WhatsApp). */
export function toTextMessage(recap: SessionRecap, opts?: { maxChars?: number }): string {
  const max = opts?.maxChars ?? 800;
  const lines: string[] = [];
  lines.push(`Recap ${recap.sessionDate} (${recap.durationMinutes}min)`);
  for (const s of recap.sections.slice(0, 4)) {
    lines.push(`*${s.title}*`);
    lines.push(s.body.split('\n')[0]?.slice(0, 140) ?? '');
  }
  if (recap.actions.length) {
    lines.push('*Ações*');
    for (const a of recap.actions.slice(0, 5)) {
      lines.push(`- [${a.ownerRole}] ${a.text.slice(0, 120)}`);
    }
  }
  const joined = lines.join('\n');
  return joined.length > max ? `${joined.slice(0, max - 1)}…` : joined;
}

/** Render a recap as a voice script for TTS engines (consumed by w47/voice-mode-tts). */
export function toVoiceScript(recap: SessionRecap): readonly { readonly text: string; readonly pauseMs: number }[] {
  const segments: { text: string; pauseMs: number }[] = [];
  segments.push({ text: `Session recap for ${recap.sessionDate}.`, pauseMs: 400 });
  for (const s of recap.sections) {
    segments.push({ text: s.title, pauseMs: 250 });
    segments.push({ text: s.body.replace(/\n+/g, '. '), pauseMs: 700 });
  }
  if (recap.actions.length) {
    segments.push({ text: 'Action items.', pauseMs: 250 });
    recap.actions.forEach((a, i) => {
      segments.push({
        text: `Item ${i + 1}: ${a.ownerRole}, ${a.text}${a.dueDate ? `, due ${a.dueDate}` : ''}.`,
        pauseMs: 500,
      });
    });
  }
  segments.push({ text: 'End of recap.', pauseMs: 400 });
  return segments;
}

// ---------------------------------------------------------------
// 11. ASYNC RECAP JOB QUEUE
// ---------------------------------------------------------------

/** In-process job registry. Replace with a real broker for production. */
export const RECAP_JOB_STORE: Map<string, RecapJob> = new Map();
/** In-process recap registry (production: persistence layer). */
export const RECAP_STORE: Map<RecapId, SessionRecap> = new Map();

/** Enqueue a recap job. Returns job id. */
export function enqueueRecapJob(input: SessionInput): RecapJob {
  const id = makeId('job');
  const job: RecapJob = {
    id,
    sessionInput: input,
    status: 'PENDING',
    enqueuedAt: nowIso(),
    attempts: 0,
    maxAttempts: 3,
  };
  RECAP_JOB_STORE.set(id, job);
  return job;
}

/** Process a queued job. Idempotent: re-running a READY job returns the same output. */
export function processRecapJob(jobId: string): RecapJob {
  const job = RECAP_JOB_STORE.get(jobId);
  if (!job) throw new RecapNotFoundError(jobId);
  if (job.status === 'CANCELLED') throw new JobStateError('CANCELLED', 'process');
  if (job.status === 'READY' && job.recapId) return job;

  const next: RecapJob = {
    ...job,
    status: 'PROCESSING',
    startedAt: nowIso(),
    attempts: job.attempts + 1,
  };
  RECAP_JOB_STORE.set(jobId, next);

  try {
    const recap = generateRecap(job.sessionInput);
    RECAP_STORE.set(recap.id, recap);
    const finished: RecapJob = {
      ...next,
      status: 'READY',
      finishedAt: nowIso(),
      recapId: recap.id,
    };
    RECAP_JOB_STORE.set(jobId, finished);
    return finished;
  } catch (err) {
    const finished: RecapJob = {
      ...next,
      status: job.attempts + 1 >= job.maxAttempts ? 'FAILED' : 'PENDING',
      finishedAt: job.attempts + 1 >= job.maxAttempts ? nowIso() : undefined,
      error: { code: (err as RecapError).code ?? 'UNKNOWN', message: (err as Error).message },
    };
    RECAP_JOB_STORE.set(jobId, finished);
    return finished;
  }
}

/** Get job status by id. */
export function getRecapStatus(jobId: string): RecapJob | undefined {
  return RECAP_JOB_STORE.get(jobId);
}

/** Cancel a queued/running job. */
export function cancelRecapJob(jobId: string): RecapJob {
  const job = RECAP_JOB_STORE.get(jobId);
  if (!job) throw new RecapNotFoundError(jobId);
  if (job.status === 'READY') throw new JobStateError('READY', 'cancel');
  const updated: RecapJob = { ...job, status: 'CANCELLED', finishedAt: nowIso() };
  RECAP_JOB_STORE.set(jobId, updated);
  return updated;
}

/** Purge recap records older than RECAP_TTL_MS. */
export function purgeExpiredRecaps(now: ISODateString = nowIso()): number {
  const nowMs = new Date(now).getTime();
  let purged = 0;
  for (const [id, recap] of RECAP_STORE.entries()) {
    const ts = new Date(recap.generatedAt).getTime();
    if (Number.isNaN(ts)) continue;
    if (nowMs - ts > RECAP_TTL_MS) {
      const expired: SessionRecap = {
        ...recap,
        audit: [
          ...recap.audit,
          { at: now, actorId: 'system', action: 'purged-expired' },
        ],
      };
      RECAP_STORE.set(id, expired);
      RECAP_STORE.delete(id);
      purged += 1;
    }
  }
  return purged;
}

// ---------------------------------------------------------------
// 12. RECAP ARCHIVE & SEARCH
// ---------------------------------------------------------------

/** Archive a recap immutably. */
export function archiveRecap(recap: SessionRecap): SessionRecap {
  const archived: SessionRecap = {
    ...recap,
    audit: [
      ...recap.audit,
      { at: nowIso(), actorId: 'system', action: 'archived' },
    ],
  };
  RECAP_STORE.set(archived.id, archived);
  return archived;
}

/** List recaps for a mentor with optional filters. */
export function listRecaps(
  mentorId: string,
  filters?: {
    menteeId?: string;
    templateId?: string;
    sinceIso?: ISODateString;
    untilIso?: ISODateString;
  },
): readonly SessionRecap[] {
  const list: SessionRecap[] = [];
  for (const recap of RECAP_STORE.values()) {
    if (recap.mentorId !== mentorId) continue;
    if (filters?.menteeId && recap.menteeId !== filters.menteeId) continue;
    if (filters?.templateId && recap.templateId !== filters.templateId) continue;
    if (filters?.sinceIso && recap.generatedAt < filters.sinceIso) continue;
    if (filters?.untilIso && recap.generatedAt > filters.untilIso) continue;
    list.push(recap);
  }
  return list.sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
}

/** Naive search by query string across sections, insights, and actions. */
export function searchRecaps(query: string): readonly SessionRecap[] {
  if (!query) return [];
  const q = query.toLowerCase();
  const matched: SessionRecap[] = [];
  for (const recap of RECAP_STORE.values()) {
    const blob = [
      ...recap.sections.map((s) => `${s.title}\n${s.body}`),
      ...recap.insights.map((i) => i.text),
      ...recap.actions.map((a) => a.text),
    ]
      .join('\n')
      .toLowerCase();
    if (blob.includes(q)) matched.push(recap);
  }
  return matched;
}

/** Diff two recaps — useful for tracking growth or content drift. */
export function diffRecaps(id1: string, id2: string): {
  added: readonly string[];
  removed: readonly string[];
  changed: readonly string[];
} {
  const a = RECAP_STORE.get(id1);
  const b = RECAP_STORE.get(id2);
  if (!a || !b) {
    throw new RecapNotFoundError(!a ? id1 : id2);
  }
  const aSet = new Set(a.sections.map((s) => `${s.key}=${s.body}`));
  const bSet = new Set(b.sections.map((s) => `${s.key}=${s.body}`));
  const added: string[] = [];
  const removed: string[] = [];
  const changed: string[] = [];
  for (const v of bSet) if (!aSet.has(v)) added.push(v);
  for (const v of aSet) if (!bSet.has(v)) removed.push(v);
  for (const s of b.sections) {
    const old = a.sections.find((x) => x.key === s.key);
    if (old && old.body !== s.body) changed.push(`${s.key}: ${old.body.slice(0, 60)} → ${s.body.slice(0, 60)}`);
  }
  return { added, removed, changed };
}

/** Export all recaps for a user as a single JSON bundle (LGPD Art. 18). */
export function exportRecaps(userId: string, format: RecapFormat = 'json'): string {
  const all: SessionRecap[] = [];
  for (const recap of RECAP_STORE.values()) {
    if (recap.mentorId === userId || recap.menteeId === userId) all.push(recap);
  }
  const stamped = all.map((r) => ({
    ...r,
    audit: [
      ...r.audit,
      { at: nowIso(), actorId: userId, action: 'exported' as AuditAction, detail: `format=${format}` },
    ],
  }));
  RECAP_STORE.clear();
  for (const r of stamped) RECAP_STORE.set(r.id, r);

  switch (format) {
    case 'markdown': return stamped.map(toMarkdown).join('\n\n');
    case 'html':     return stamped.map(toHTML).join('\n<hr/>\n');
    case 'pdf-spec': return JSON.stringify(stamped.map(toPDFSpec), null, 2);
    case 'text-message': return stamped.map((r) => toTextMessage(r)).join('\n\n---\n\n');
    case 'voice-script': return JSON.stringify(stamped.map(toVoiceScript), null, 2);
    case 'json':
    default:
      return JSON.stringify(stamped, null, 2);
  }
}

// ---------------------------------------------------------------
// 13. CROSS-REFERENCES (W45/W40 integration)
// ---------------------------------------------------------------

/** Link a recap to a goal (from w45/mentorship-pairing). */
export function linkToGoal(recap: SessionRecap, goalId: string): SessionRecap {
  if (!goalId) throw new CrossRefMismatchError('goalId is empty');
  const next: SessionRecap = {
    ...recap,
    crossRefs: { ...recap.crossRefs, goalIds: Array.from(new Set([...recap.crossRefs.goalIds, goalId])) },
    audit: [
      ...recap.audit,
      { at: nowIso(), actorId: 'system', action: 'crossref-linked', detail: `goal=${goalId}` },
    ],
  };
  return next;
}

/** Link a recap to a tradition (w45/tradition-cross-references). */
export function linkToTradition(recap: SessionRecap, tradition: TraditionToken): SessionRecap {
  if (!tradition) throw new CrossRefMismatchError('tradition is empty');
  const next: SessionRecap = {
    ...recap,
    crossRefs: { ...recap.crossRefs, traditionToken: tradition },
    audit: [
      ...recap.audit,
      { at: nowIso(), actorId: 'system', action: 'crossref-linked', detail: `tradition=${tradition}` },
    ],
  };
  return next;
}

/** Link a recap to a marketplace resource (marketplace-leituras). */
export function linkToResource(recap: SessionRecap, resourceId: string): SessionRecap {
  if (!resourceId) throw new CrossRefMismatchError('resourceId is empty');
  const next: SessionRecap = {
    ...recap,
    crossRefs: { ...recap.crossRefs, resourceIds: Array.from(new Set([...recap.crossRefs.resourceIds, resourceId])) },
    audit: [
      ...recap.audit,
      { at: nowIso(), actorId: 'system', action: 'crossref-linked', detail: `resource=${resourceId}` },
    ],
  };
  return next;
}

/** Link a recap to a previous session note (w40/mentorship-session-notes). */
export function linkToSessionNotes(recap: SessionRecap, sessionNoteId: string): SessionRecap {
  if (!sessionNoteId) throw new CrossRefMismatchError('sessionNoteId is empty');
  const next: SessionRecap = {
    ...recap,
    crossRefs: {
      ...recap.crossRefs,
      sessionNoteIds: Array.from(new Set([...recap.crossRefs.sessionNoteIds, sessionNoteId])),
    },
    audit: [
      ...recap.audit,
      { at: nowIso(), actorId: 'system', action: 'crossref-linked', detail: `sessionNote=${sessionNoteId}` },
    ],
  };
  return next;
}

// ---------------------------------------------------------------
// 14. SHARING CONTROLS & AUDIT
// ---------------------------------------------------------------

/** In-memory grant store. */
export const RECAP_SHARES: Map<RecapId, readonly SharePermission[]> = new Map();
/** Immutable access log. */
export const RECAP_ACCESS_LOG: Array<{ recapId: RecapId; viewerId: string; at: ISODateString }> = [];

/** Share a recap with recipients (with optional permissions). */
export function shareRecap(
  recap: SessionRecap,
  recipients: readonly SharePermission[],
  actorId: string = recap.mentorId,
): SessionRecap {
  if (!recipients.length) throw new UnauthorizedShareError('no recipients');
  for (const r of recipients) {
    const inAudience =
      r.recipientId === recap.mentorId ||
      r.recipientId === recap.menteeId ||
      recap.privacy.allowedViewers.includes(r.recipientId);
    if (!inAudience && r.recipientRole !== 'admin') {
      throw new UnauthorizedShareError(r.recipientId);
    }
  }
  RECAP_SHARES.set(recap.id, recipients);
  return {
    ...recap,
    audit: [
      ...recap.audit,
      {
        at: nowIso(),
        actorId,
        action: 'shared',
        detail: `recipients=${recipients.length}`,
      },
    ],
  };
}

/** Revoke a single share from a recipient. */
export function revokeShare(recapId: RecapId, recipientId: string): boolean {
  const current = RECAP_SHARES.get(recapId) ?? [];
  const filtered = current.filter((r) => r.recipientId !== recipientId);
  RECAP_SHARES.set(recapId, filtered);
  const recap = RECAP_STORE.get(recapId);
  if (recap) {
    RECAP_STORE.set(recapId, {
      ...recap,
      audit: [
        ...recap.audit,
        {
          at: nowIso(),
          actorId: 'system',
          action: 'share-revoked',
          detail: `recipient=${recipientId}`,
        },
      ],
    });
  }
  return filtered.length < current.length;
}

/** Track viewer access — append-only. */
export function trackAccess(recapId: RecapId, viewerId: string): void {
  RECAP_ACCESS_LOG.push({ recapId, viewerId, at: nowIso() });
  const recap = RECAP_STORE.get(recapId);
  if (recap) {
    RECAP_STORE.set(recapId, {
      ...recap,
      audit: [
        ...recap.audit,
        { at: nowIso(), actorId: viewerId, action: 'viewed' },
      ],
    });
  }
}

/** Read-only view of the audit log for a recap. */
export function auditLog(recapId: RecapId): readonly AuditEntry[] {
  return RECAP_STORE.get(recapId)?.audit ?? [];
}

// ---------------------------------------------------------------
// 15. SMOKE TESTS
// ---------------------------------------------------------------

/**
 * Run smoke tests covering the happy path + 6 edge cases.
 * Returns true if all assertions pass; throws otherwise.
 */
export function runSmokeTests(): boolean {
  // 1. Build a session input
  const input: SessionInput = {
    sessionId: 'ses_smoke_1',
    mentorId: 'mnt_alpha',
    menteeId: 'mnt_beta',
    sessionDate: '2026-06-29T12:00:00.000Z',
    durationMinutes: 60,
    locale: 'pt-BR',
    templateId: 'default',
    notes: 'Fizemos uma leitura profunda do mapa astral. O consulente está alinhado com a prática. Vou manter o diário amanhã. Preciso revisar o orixá de cabeça.',
    chatHistory: [
      { speakerId: 'mnt_alpha', speakerRole: 'mentor', at: '2026-06-29T12:00:00.000Z',
        text: 'Como você está se sentindo hoje?' },
      { speakerId: 'mnt_beta', speakerRole: 'mentee', at: '2026-06-29T12:00:05.000Z',
        text: 'Estou alinhado, com clareza sobre o objetivo.' },
    ],
    goals: [
      { id: 'goal_x', title: 'Manter diário 21 dias', progress: 0.4, status: 'in-progress' },
    ],
    traditionHints: ['astrologia'],
  };

  const recap = generateRecap(input);
  if (!recap.id || !recap.fingerprint) throw new Error('recap id/fingerprint missing');
  if (recap.sections.length === 0) throw new Error('no sections generated');
  if (!recap.actions.length) throw new Error('no actions detected');

  // 2. Apply privacy
  const privateRecap = applyPrivacyMode(recap, 'private', 'mnt_alpha');
  if (privateRecap.privacy.mode !== 'private') throw new Error('privacy mode not applied');
  if (privateRecap.actions.length !== 0 && privateRecap.privacy.redactLevel >= 1) {
    // private mode has redactLevel 3; expect actions emptied
    throw new Error('redaction not applied');
  }

  // 3. Queue + process job
  const job = enqueueRecapJob(input);
  const done = processRecapJob(job.id);
  if (done.status !== 'READY' || !done.recapId) throw new Error('job did not become READY');

  // 4. Archive + list
  const arch = archiveRecap(recap);
  if (!RECAP_STORE.has(arch.id)) throw new Error('archive failed');
  const all = listRecaps('mnt_alpha');
  if (!all.find((r) => r.id === arch.id)) throw new Error('listRecaps missing archive');

  // 5. Customize template
  const custom = customizeTemplate('default', { tone: 'mystical' });
  if (!custom.id.startsWith('tpl_default_')) throw new Error('custom id malformed');
  validateTemplate(custom);

  // 6. Cross-ref
  const linked = linkToGoal(recap, 'goal_42');
  if (!linked.crossRefs.goalIds.includes('goal_42')) throw new Error('linkToGoal failed');

  // 7. Format adapter — markdown
  const md = toMarkdown(recap);
  if (!md.includes('## ')) throw new Error('markdown has no headings');

  // 8. Voice script
  const voice = toVoiceScript(recap);
  if (voice.length === 0) throw new Error('voice script empty');

  // 9. Cancel a job
  const job2 = enqueueRecapJob(input);
  const cancelled = cancelRecapJob(job2.id);
  if (cancelled.status !== 'CANCELLED') throw new Error('cancel did not work');

  // 10. Errors should be typed
  try { customizeTemplate('default', { sections: [] }); throw new Error('should have thrown'); }
  catch (e) { if (!(e instanceof InvalidTemplateError)) throw new Error('expected InvalidTemplateError'); }

  return true;
}
