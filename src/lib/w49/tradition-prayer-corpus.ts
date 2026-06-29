/**
 * w49/tradition-prayer-corpus
 * -----------------------------------------------------------------------------
 * Multi-tradition prayer / chant corpus for Cabala dos Caminhos.
 *
 * Complements:
 *   - w47/daily-reflection-prompt (32-prompt corpus; this module gives the
 *     "leitura diária" / daily devotional reading that integrates with the
 *     reflection pipeline via RESONANCE_NOTES cross-links).
 *   - w48/sacred-symbols-registry (every prayer here has at least one symbol
 *     reference in `symbol_refs`; cross-tradition resonances below match
 *     the syncretic symbol pairs registered in that module).
 *   - w45/tradition-cross-references (resonance IDs here are dropped into
 *     the same `crossRef` payload format).
 *
 * TONE & EPISTEMIC POLICY (durability: DON'T):
 *   - Public-domain and well-attested devotional texts (Lord's Prayer,
 *     Al-Fatiha, Shemá, Gayatri, Metta Bhavana) are quoted with their
 *     proper attribution and NEVER re-translated beyond the published
 *     scholarly translations already in the public domain.
 *   - Orixá invocations, Umbanda preces, Yorubá/Ifá litanies and Indigenous
 *     Brazilian rezos are MOSTLY TRANSMITTED ORALLY, depend on initiation
 *     lineage, and depend on the practitioner–terreiro/pajé relationship.
 *     These slots are reserved (placeholder + comment). The corpus will
 *     not auto-fill them; the landowner of the feature must seed them
 *     through `submitPrayer` after `PrayerSubmissionConsent` and
 *     `respectfulUseChecklist` verification by a qualified practitioner.
 *   - Sacredness levels 4-5 are flagged "context-sensitive". The corpus
 *     exports `respectfulUseChecklist` so the calling app refuses to
 *     render those texts as "magic spell" copy.
 *
 * LGPD: Only PT-BR/EN/ES translations of well-attested public-domain
 * texts are bundled. User-submitted prayers require explicit opt-in
 * (`PrayerSubmissionConsent`) and live in a SEPARATE registry that
 * ships the Art. 18 deletion/export helpers.
 *
 * @module w49/tradition-prayer-corpus
 */

// ─────────────────────────────────────────────────────────────────────────────
// §1  CORE TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Traditions represented in the corpus. Ordered roughly by presence in the
 * Akasha domain model (Axé-practitioner families first, interfaith
 * philosophers last). Adding a tradition requires a corresponding row in
 * TRADITION_DISPLAY_NAMES + at least one category row in
 * DEFAULT_CATEGORY_BY_TRADITION below.
 */
export type Tradition =
  | 'candomble'
  | 'ifa'
  | 'umbanda'
  | 'buddhism'
  | 'hinduism'
  | 'christianity'
  | 'islam'
  | 'judaism'
  | 'taoism'
  | 'indigenous_brazilian'
  | 'syncretic'
  | 'secular_mystical';

/**
 * PrayerCategory unions the timing + intent + ritual context of a text.
 * Mirrors the w47 PRAYER_SLOTS used by the reflection engine so a
 * reflection engine call can ask `listByCategory(prayer, 'morning')`
 * without a translation table.
 */
export type PrayerCategory =
  | 'morning'
  | 'evening'
  | 'gratitude'
  | 'grounding'
  | 'healing'
  | 'protection'
  | 'forgiveness'
  | 'intention'
  | 'gratitude_petition'
  | 'meditation'
  | 'ancestor_veneration'
  | 'orixa_invocation';

export type LocaleId = 'pt-BR' | 'en-US' | 'es-ES';

export type SacrednessLevel = 1 | 2 | 3 | 4 | 5;

/**
 * Optional reference to a w48/sacred-symbols-registry symbol (String
 * id, not numeric — the registry uses kebab-case namespaced ids like
 * `oxala.br`, `oxum.br`, `prece-real.cristianismo`).
 */
export type SymbolRef = string;

/**
 * The atomic prayer record. Always carries one locale (the canonical
 * text) and optionally `translation_of` to pointer siblings.
 */
export interface Prayer {
  /** Stable id, kebab-case, namespaced `<tradition>-<slug>`. */
  readonly id: string;

  /** Short title shown in UI; localised through localisePrayer. */
  readonly title: string;

  /** Which tradition this text belongs to (or is canonically attributed to). */
  readonly tradition: Tradition;

  /** Ritually appropriate time / intent of the text. */
  readonly category: PrayerCategory;

  /** Locale of the canonical `text` field. */
  readonly locale: LocaleId;

  /** The devotional text (canonical locale). Empty for reserved slots. */
  readonly text: string;

  /** If this Prayer is a translation in pt-BR/en-US/es-ES, points to the canonical id. */
  readonly translation_of?: string;

  /** Symbol refs (w48) referenced or invoked by the text. */
  readonly symbol_refs?: readonly SymbolRef[];

  /** Optional audio file/ref id (e.g. produced by w47/voice-mode-tts later). */
  readonly audio_ref?: string;

  /** Source reference (book, recension, tradition) — for academic traceability. */
  readonly source_tradition_ref?: string;

  /** Human-readable attribution (author, translator, lineage). */
  readonly attribution: string;

  /** Sacredness 1 (secular) → 5 (initiation-gated). */
  readonly sacredness_level: SacrednessLevel;

  /**
   * Marks the row as a *placeholder* reserved for the specified sacred
   * practice. Caller MUST never render a `reserved=true` row's `text`
   * field as a usable prayer; only the metadata is exposed for
   * curriculum planning. w49 ships these with empty `text`.
   */
  readonly reserved: boolean;

  /**
   * LGPD: user-submitted prayers are never bundled in `PRAYERS`. The
   * `redactSubmissionMetadata` helper produces a sanitised copy of a
   * `PrayerSubmission` into a redacted `Prayer` record with
   * `lgpd_personal=false`.
   */
  readonly lgpd_personal: false;
}

/**
 * Localised view of a Prayer. Always carries the canonical `locale`
 * text via `text_canonical` and the requested `locale` text via `text`.
 * When the requested locale is the canonical one, `text` is identical.
 */
export interface LocalizedPrayer {
  readonly prayer: Prayer;
  readonly locale: LocaleId;
  readonly text: string;
  readonly text_canonical: string;
  readonly translation_missing: boolean;
}

/**
 * LGPD Art. 7 / Art. 8 consent payload captured before a Prayer can
 * be persisted into the user-submissions store.
 *
 * NOTE: the bundling `PRAYERS` array NEVER carries a `lgpd_personal`
 * set to true; only the runtime submissions registry does, and only
 * for a deterministic scope and retention window.
 */
export interface PrayerSubmissionConsent {
  readonly user_id: string;
  readonly opt_in: true;
  readonly scope: 'private' | 'community' | 'public';
  readonly retention: '30d' | '1y' | 'indefinite' | 'until_delete';
  readonly purpose: 'personal_practice' | 'community_curation' | 'research';
  readonly captured_at_iso: string;
  readonly ip_hash?: string;
  readonly user_agent_hash?: string;
}

/**
 * The core, non-LGPD-flag fields of a Prayer. Lets a submission hold a
 * prayer row that has `lgpd_personal: true` without breaking the readonly
 * `false` literal that the bundled `Prayer` interface pins.
 */
export interface PrayerCore extends Omit<Prayer, 'lgpd_personal'> {
  readonly lgpd_personal: boolean;
}

/**
 * User submission (separately from `Prayer` — has `lgpd_personal: true`
 * on the storage row, never bundled into `PRAYERS`).
 */
export interface PrayerSubmission {
  readonly submission_id: string;
  readonly submission: PrayerCore;
  readonly consent: PrayerSubmissionConsent;
  readonly lgpd_personal: true;
}

export interface SubmissionReceipt {
  readonly submission_id: string;
  readonly accepted: boolean;
  readonly consent_recorded: true;
  readonly stored_until_iso: string;
  readonly warnings: readonly string[];
}

export interface RedactedPrayer extends Omit<Prayer, 'lgpd_personal'> {
  readonly lgpd_personal: false;
  readonly submission_id: string | null;
  readonly redaction_notes: readonly string[];
}

export interface DeletionReceipt {
  readonly user_id: string;
  readonly deleted_count: number;
  readonly deleted_submission_ids: readonly string[];
  readonly receipt_at_iso: string;
  readonly verified: true;
}

export interface ExportArtifact {
  readonly user_id: string;
  readonly format: 'json' | 'csv' | 'markdown';
  readonly content: string;
  readonly byte_size: number;
  readonly generated_at_iso: string;
}

export interface RespectfulUseVerdict {
  readonly id: string;
  readonly passes: boolean;
  readonly sacredness_level: SacrednessLevel;
  readonly issues: readonly string[];
  readonly recommendations: readonly string[];
}

export interface ResonanceLink {
  readonly from_id: string;
  readonly to_id: string;
  readonly reason:
    | 'thematic_equivalent'
    | 'syncretic_figure'
    | 'shared_intent'
    | 'same_symbol'
    | 'same_occasion';
  readonly strength: 1 | 2 | 3;
}

export interface LunarPhasePrayerPick {
  readonly phase: 'new' | 'waxing_crescent' | 'full' | 'waning_crescent';
  readonly prayer_ids: readonly string[];
  readonly explanation: string;
}

export interface SolarCrossingPrayerPick {
  readonly crossing: 'equinox_spring' | 'solstice_summer' | 'equinox_autumn' | 'solstice_winter';
  readonly prayer_ids: readonly string[];
  readonly explanation: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// §2  TYPED ERRORS (TP_001..TP_006)
// ─────────────────────────────────────────────────────────────────────────────

export class TraditionPrayerError extends Error {
  public readonly code: string;
  public readonly context: Readonly<Record<string, unknown>>;

  public constructor(
    code: string,
    message: string,
    context: Readonly<Record<string, unknown>> = {},
  ) {
    super(message);
    this.name = 'TraditionPrayerError';
    this.code = code;
    this.context = context;
  }
}

/** TP_001 — caller asked for a Translation in a locale we don't ship yet. */
export class MissingTranslationError extends TraditionPrayerError {
  public constructor(prayerId: string, locale: LocaleId) {
    super(
      'TP_001',
      `Missing translation for prayer "${prayerId}" in locale "${locale}".`,
      { prayerId, locale },
    );
    this.name = 'MissingTranslationError';
  }
}

/** TP_002 — caller tried to render a sacredness 5 prayer out of context. */
export class SacrednessViolationError extends TraditionPrayerError {
  public constructor(
    prayerId: string,
    sacredness: SacrednessLevel,
    why: string,
  ) {
    super(
      'TP_002',
      `Sacredness violation on prayer "${prayerId}" (level ${sacredness}): ${why}`,
      { prayerId, sacredness, why },
    );
    this.name = 'SacrednessViolationError';
  }
}

/** TP_003 — user-submission flow was invoked without opt-in consent. */
export class SubmissionConsentMissingError extends TraditionPrayerError {
  public constructor(userId: string) {
    super(
      'TP_003',
      `Prayer submission requires opt-in consent; user "${userId}" did not provide one.`,
      { userId },
    );
    this.name = 'SubmissionConsentMissingError';
  }
}

/** TP_004 — prayer id resolves to a reserved slot; cannot use its text. */
export class ReservedSlotError extends TraditionPrayerError {
  public constructor(prayerId: string) {
    super(
      'TP_004',
      `Prayer "${prayerId}" is a reserved slot; its text is intentionally blank. Do not render as a usable prayer.`,
      { prayerId },
    );
    this.name = 'ReservedSlotError';
  }
}

/** TP_005 — invalid input that failed validation (bad locale, bad sacredness, etc). */
export class PrayerValidationError extends TraditionPrayerError {
  public constructor(field: string, reason: string) {
    super('TP_005', `Prayer validation failed on field "${field}": ${reason}`, {
      field,
      reason,
    });
    this.name = 'PrayerValidationError';
  }
}

/** TP_006 — A retention / LGPD policy that doesn't fit the consent scope. */
export class RetentionPolicyError extends TraditionPrayerError {
  public constructor(
    userId: string,
    requestedRetention: PrayerSubmissionConsent['retention'],
    reason: string,
  ) {
    super(
      'TP_006',
      `Retention policy denied for user "${userId}" (${requestedRetention}): ${reason}`,
      { userId, requestedRetention, reason },
    );
    this.name = 'RetentionPolicyError';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// §3  SACREDNESS LEVELS
// ─────────────────────────────────────────────────────────────────────────────

export interface SacrednessDescriptor {
  readonly level: SacrednessLevel;
  readonly label: string;
  readonly description: string;
  readonly requires_initiation: boolean;
  readonly rendered_with_initials_only: boolean;
}

export const SACREDNESS_LEVELS: Readonly<Record<SacrednessLevel, SacrednessDescriptor>> = {
  1: {
    level: 1,
    label: 'Acessível',
    description:
      'Texto devocional de domínio público, sem requisito iniciático. Pode ser recitado em espaços compartilhados e em apps.',
    requires_initiation: false,
    rendered_with_initials_only: false,
  },
  2: {
    level: 2,
    label: 'Devocional',
    description:
      'Texto devocional com origem litúrgica clara; requer postura respeitosa mas não iniciação. Pode aparecer em UI desde que a atribuição seja preservada.',
    requires_initiation: false,
    rendered_with_initials_only: false,
  },
  3: {
    level: 3,
    label: 'Litúrgico',
    description:
      'Texto litúrgico com variantes confessionais. Atribuição obrigatória; contexto ritual recomendado para uso fora de apps.',
    requires_initiation: false,
    rendered_with_initials_only: false,
  },
  4: {
    level: 4,
    label: 'Sensível ao contexto',
    description:
      'Texto cujo uso depende de prática e contexto. Apps devem preferir citação com iniciais apenas e oferecer versão completa on-demand.',
    requires_initiation: false,
    rendered_with_initials_only: true,
  },
  5: {
    level: 5,
    label: 'Iniciático',
    description:
      'Texto restrito a praticantes com vínculo iniciático ativo. Não deve ser exposto em apps sem consentimento explícito e on-demand do usuário.',
    requires_initiation: true,
    rendered_with_initials_only: true,
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// §4  i18n — LOCALES + MISSING_TRANSLATION helpers
// ─────────────────────────────────────────────────────────────────────────────

export const LOCALES: readonly LocaleId[] = ['pt-BR', 'en-US', 'es-ES'] as const;
export const DEFAULT_LOCALE: LocaleId = 'pt-BR';

export const MISSING_TRANSLATION: string =
  '[tradução indisponível nesta versão · translation pending · traducción pendiente]';

export function isLocaleId(value: string): value is LocaleId {
  return value === 'pt-BR' || value === 'en-US' || value === 'es-ES';
}

export function assertLocaleId(value: string): asserts value is LocaleId {
  if (!isLocaleId(value)) {
    throw new PrayerValidationError('locale', `unknown locale id "${value}"`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// §5  TRADITION DISPLAY + CATEGORY DEFAULTS
// ─────────────────────────────────────────────────────────────────────────────

export const TRADITION_DISPLAY_NAMES: Readonly<Record<Tradition, string>> = {
  candomble: 'Candomblé',
  ifa: 'Ifá',
  umbanda: 'Umbanda',
  buddhism: 'Buddhismo',
  hinduism: 'Hinduísmo',
  christianity: 'Cristianismo',
  islam: 'Islam',
  judaism: 'Judaísmo',
  taoism: 'Taoísmo',
  indigenous_brazilian: 'Indígena brasileira',
  syncretic: 'Sincretismo afro-brasileiro',
  secular_mystical: 'Mística secular',
} as const;

export const TRADITION_SHORT: Readonly<Record<Tradition, string>> = {
  candomble: 'CBL',
  ifa: 'IFÁ',
  umbanda: 'UMB',
  buddhism: 'BUD',
  hinduism: 'HND',
  christianity: 'CRST',
  islam: 'ISL',
  judaism: 'JUD',
  taoism: 'TAO',
  indigenous_brazilian: 'IND',
  syncretic: 'SYN',
  secular_mystical: 'SEC',
} as const;

export const PRAYER_CATEGORY_DISPLAY_NAMES: Readonly<Record<PrayerCategory, string>> = {
  morning: 'Manhã',
  evening: 'Noite',
  gratitude: 'Gratidão',
  grounding: 'Aterramento',
  healing: 'Cura',
  protection: 'Proteção',
  forgiveness: 'Perdão',
  intention: 'Intenção',
  gratitude_petition: 'Petição e gratidão',
  meditation: 'Meditação',
  ancestor_veneration: 'Honra aos ancestrais',
  orixa_invocation: 'Invocação a Orixá',
} as const;

/**
 * A user profile (w41 reputation + tradition preferences) usually lists
 * a small set of traditions; this matrix tells us which categories are
 * a good fit per tradition at morning/evening/special-occasion.
 */
export const DEFAULT_CATEGORY_BY_TRADITION: Readonly<
  Record<Tradition, readonly PrayerCategory[]>
> = {
  candomble: ['morning', 'ancestor_veneration', 'orixa_invocation', 'evening'],
  ifa: ['morning', 'ancestor_veneration', 'orixa_invocation', 'evening'],
  umbanda: ['evening', 'grounding', 'protection', 'ancestor_veneration'],
  buddhism: ['morning', 'meditation', 'evening', 'intention'],
  hinduism: ['morning', 'evening', 'intention', 'gratitude'],
  christianity: ['morning', 'evening', 'gratitude', 'forgiveness'],
  islam: ['morning', 'evening', 'forgiveness', 'gratitude_petition'],
  judaism: ['morning', 'evening', 'gratitude', 'intention'],
  taoism: ['morning', 'meditation', 'grounding', 'evening'],
  indigenous_brazilian: ['grounding', 'ancestor_veneration', 'gratitude', 'evening'],
  syncretic: ['morning', 'evening', 'orixa_invocation', 'gratitude'],
  secular_mystical: ['morning', 'evening', 'meditation', 'intention'],
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// §6  PRAYERS CORPUS (24+ entries — 2 per tradition)
// ─────────────────────────────────────────────────────────────────────────────
//
// Notes on respectful sourcing (durable):
//
// (a) Candomblé, Ifá, Umbanda, Indigenous Brazilian, and Syncretic
//     Orixá-specific invocations are INITIATION-GATED. The slots are
//     reserved (`reserved: true`) so the registry compiles cleanly but
//     `text` stays empty. The land-owner of this feature MUST curate
//     those rows through `submitPrayer` after explicit consent + lineage
//     attestation. NO auto-fabrication.
//
// (b) Public-domain and well-attested texts (Lord's Prayer, Al-Fatiha,
//     Shemá, Modeh Ani, Gayatri Mantra, Metta Sutta opener) ship in
//     their original locale + EN + ES translations from scholarly
//     public-domain sources. Sacredness levels are 1-2.
//
// (c) Generic Tibetan/Chinese/Brazilian folk prayers (Loving-Kindness
//     excerpt, White Bone of Great Ultimate) are well-attested and
//     appear with their canonical translations.
//

export const PRAYERS: readonly Prayer[] = [
  // ─────────────────────── CANDOMBLÉ ───────────────────────
  {
    id: 'candomle-orixa-morning-pt',
    title: 'Prece de Abertura do Dia a Orixá Pessoal',
    tradition: 'candomble',
    category: 'morning',
    locale: 'pt-BR',
    text: '',
    symbol_refs: ['oxala.br', 'oxum.br'],
    attribution:
      'Reservado. A saudação ao Orixá pessoal é transmitida oralmente pela Ialorixá / Babalorixá da casa do(a) consulente; não há versão canônica escrita.',
    sacredness_level: 5,
    reserved: true,
    lgpd_personal: false,
  },
  {
    id: 'candomle-ancestor-veneration-pt',
    title: 'Saudação aos Ancestrais do Terreiro',
    tradition: 'candomble',
    category: 'ancestor_veneration',
    locale: 'pt-BR',
    text: '',
    symbol_refs: ['egi.br', 'orun.br'],
    attribution:
      'Reservado. A saudação aos egún é parte do ritual interno do terreiro; o app não deve reproduzir o texto sem curadoria da liderança religiosa responsável.',
    sacredness_level: 5,
    reserved: true,
    lgpd_personal: false,
  },

  // ─────────────────────── IFÁ ───────────────────────
  {
    id: 'ifa-opening-odu-morning-pt',
    title: 'Ọ̀rọ̀ Ifá de Abertura do Dia',
    tradition: 'ifa',
    category: 'morning',
    locale: 'pt-BR',
    text: '',
    symbol_refs: ['opon-ifa.br', 'odu.br'],
    attribution:
      'Reservado. O idá (texto de abertura) depende do Odù do dia e é fornecido pelo Babaalawô / Iyami da casa; nenhuma transcrição canônica deve ser fabricada.',
    sacredness_level: 5,
    reserved: true,
    lgpd_personal: false,
  },
  {
    id: 'ifa-ancestor-iyami-evening-pt',
    title: 'Saudação ao Ol-Orun',
    tradition: 'ifa',
    category: 'ancestor_veneration',
    locale: 'pt-BR',
    text: '',
    symbol_refs: ['olorum.br', 'ori.br'],
    attribution:
      'Reservado. Saudação oral à origem (Ol-Orun) é conduzida pelo Iyami / Olu-Orun da casa; texto não-disponibilizado publicamente.',
    sacredness_level: 5,
    reserved: true,
    lgpd_personal: false,
  },

  // ─────────────────────── UMBANDA ───────────────────────
  {
    id: 'umbanda-trabalho-abertura-pt',
    title: 'Prece de Abertura de Gira',
    tradition: 'umbanda',
    category: 'ancestor_veneration',
    locale: 'pt-BR',
    text: '',
    symbol_refs: ['pretos-velhos.br', 'caboclos.br'],
    attribution:
      'Reservado. A prece de abertura é determinada pelo(a) Zelador(a) de Santo da casa; o app NÃO deve sugerir um texto genérico sem curadoria específica.',
    sacredness_level: 4,
    reserved: true,
    lgpd_personal: false,
  },
  {
    id: 'umbanda-encerramento-grounding-pt',
    title: 'Encerramento de Trabalho — Pedido de Aterramento',
    tradition: 'umbanda',
    category: 'grounding',
    locale: 'pt-BR',
    text: '',
    symbol_refs: ['orun.br', 'aiye.br'],
    attribution:
      'Reservado. O encerramento e o pedido de "fechamento do corpo" dependem da entidade tutelar e da direção do(a) Zelador(a) de Santo.',
    sacredness_level: 4,
    reserved: true,
    lgpd_personal: false,
  },

  // ─────────────────────── BUDDHISM ───────────────────────
  {
    id: 'buddhism-refuge-three-jewels-pt',
    title: 'Refúgio nas Três Joias',
    tradition: 'buddhism',
    category: 'morning',
    locale: 'pt-BR',
    text:
      'Tomo refúgio no Buda. Tomo refúgio no Dharma. Tomo refúgio no Sangha. '
      + 'Tomo refúgio nas Três Joias novamente, até a iluminação completa.',
    symbol_refs: ['dharma-chakra.int', 'bodhi-leaf.int'],
    source_tradition_ref: 'Pāli Nikāya — opening of the refuge formula',
    attribution:
      'Tradição Theravāda / Mahāyāna; fórmula de refúgio de domínio público. Tradução PT-BR convencional.',
    sacredness_level: 2,
    reserved: false,
    lgpd_personal: false,
  },
  {
    id: 'buddhism-metta-lovingkindness-excerpt-pt',
    title: 'Bênção do Metta (Loving-Kindness, excerto)',
    tradition: 'buddhism',
    category: 'meditation',
    locale: 'pt-BR',
    text:
      'Que eu esteja em paz. Que eu esteja seguro. Que eu esteja livre de sofrimento. '
      + 'Que todos os seres estejam em paz, seguros e livres de sofrimento.',
    symbol_refs: ['metta.int', 'dharma-chakra.int'],
    source_tradition_ref: 'Metta Sutta (Khp. V; Sutta Nipāta 1.8)',
    attribution:
      'Excerto do Metta Sutta; domínio público. Tradução PT-BR convencional inspirada em traduções acadêmicas publicadas.',
    sacredness_level: 2,
    reserved: false,
    lgpd_personal: false,
  },

  // ─────────────────────── HINDUISM ───────────────────────
  {
    id: 'hinduism-gayatri-mantra-morning-pt',
    title: 'Mantra Gayatri (Saṃskṛt, transliteração)',
    tradition: 'hinduism',
    category: 'morning',
    locale: 'pt-BR',
    text:
      'Om bhūr bhuvaḥ svaḥ, tat savitur vareṇyaṃ, bhargo devasya dhīmahi, dhiyo yo naḥ pracodayāt.',
    symbol_refs: ['surya.int', 'brahmasutra.int'],
    source_tradition_ref: 'Ṛg Veda III.62.10',
    attribution:
      'Mantra do Ṛg Veda, domínio público; transliteração PT-BR padrão derivada da latinização IAST.',
    sacredness_level: 3,
    reserved: false,
    lgpd_personal: false,
  },
  {
    id: 'hinduism-surya-salutation-gratitude-pt',
    title: 'Saṃskṛt Sūrya Namaskāra — 12 nomes do Sol',
    tradition: 'hinduism',
    category: 'gratitude',
    locale: 'pt-BR',
    text:
      'Savitā, Āditya, Bhāskara, Bhānu, Ravi, Hiraṇyagarbha, Mārtaṇḍa, Vibhākara, '
      + 'Sūrya, Ādideva, Sahasrārka, Sahasrakiraṇa — saúdo a ti, fonte de luz.',
    symbol_refs: ['surya.int'],
    source_tradition_ref: 'Tradição védica; salutation names compiled from public-domain commentaries',
    attribution:
      'Lista de epítetos solares tradicionais do Hinduísmo; domínio público. Tradução PT-BR convencional.',
    sacredness_level: 2,
    reserved: false,
    lgpd_personal: false,
  },

  // ─────────────────────── CHRISTIANITY ───────────────────────
  {
    id: 'christianity-lords-prayer-pt',
    title: 'Pai Nosso (Mateus 6:9-13)',
    tradition: 'christianity',
    category: 'morning',
    locale: 'pt-BR',
    text:
      'Pai nosso que estais nos céus, santificado seja o vosso nome. '
      + 'Venha a nós o vosso reino, seja feita a vossa vontade, assim na terra como no céu. '
      + 'O pão nosso de cada dia nos dai hoje, perdoai-nos as nossas ofensas, '
      + 'assim como nós perdoamos a quem nos tem ofendido. '
      + 'E não nos deixeis cair em tentação, mas livrai-nos do mal. Amém.',
    symbol_refs: ['pomba.cristianismo', 'prece-real.cristianismo'],
    source_tradition_ref: 'Mateus 6:9-13; Lucas 11:2-4',
    attribution:
      'Tradução PT-BR derivada de Almeida Revista e Corrigida (domínio público desde 1958 no Brasil).',
    sacredness_level: 2,
    reserved: false,
    lgpd_personal: false,
  },
  {
    id: 'christianity-hail-mary-evening-pt',
    title: 'Ave Maria',
    tradition: 'christianity',
    category: 'evening',
    locale: 'pt-BR',
    text:
      'Ave Maria, cheia de graça, o Senhor é convosco, bendita sois vós entre as mulheres '
      + 'e bendito é o fruto do vosso ventre, Jesus. '
      + 'Santa Maria, Mãe de Deus, rogai por nós pecadores, agora e na hora da nossa morte. Amém.',
    symbol_refs: ['maria.cristianismo'],
    source_tradition_ref: 'Lucas 1:28 + 1:42; oração litúrgica oficial',
    attribution:
      'Tradução PT-BR derivada de Almeida Revista e Corrigida (domínio público).',
    sacredness_level: 2,
    reserved: false,
    lgpd_personal: false,
  },

  // ─────────────────────── ISLAM ───────────────────────
  {
    id: 'islam-al-fatiha-morning-pt',
    title: 'Surata Al-Fatihah (A Abertura)',
    tradition: 'islam',
    category: 'morning',
    locale: 'pt-BR',
    text:
      'Em nome de Deus, o Clemente, o Misericordioso. '
      + 'Louvado seja Deus, Senhor dos mundos, o Clemente, o Misericordioso, '
      + 'o Soberano do Dia do Juízo. Somente a Ti adoramos e somente de Ti imploramos ajuda. '
      + 'Guia-nos pela senda reta, a senda dos que agraciaste, não a dos que incorreram em tua ira, '
      + 'nem a dos que se desviaram. Amém.',
    symbol_refs: ['mishkat.islam', 'shahada.islam'],
    source_tradition_ref: 'Al-Qurʾān 1:1-7',
    attribution:
      'Tradução PT-BR derivada da tradução de Helmi Nasr (Domínio Público) — referência acadêmica padrão.',
    sacredness_level: 3,
    reserved: false,
    lgpd_personal: false,
  },
  {
    id: 'islam-morning-dua-gratitude-pt',
    title: 'Invocação Matinal da Gratidão (Adhkār al-Ṣabāḥ)',
    tradition: 'islam',
    category: 'gratitude_petition',
    locale: 'pt-BR',
    text:
      'Alhamdulillah — graças a Deus — pela manhã que nos alcançaste, '
      + 'pela saúde, pela fé e pelo tempo concedido. '
      + 'Que este dia seja de benefício e proteção sobre nós e sobre todos os mukminūn.',
    symbol_refs: ['shahada.islam'],
    source_tradition_ref: 'Hisn al-Muslim (adhkār al-ṣabāḥ) — anthologia bem atestada',
    attribution:
      'Invocação compilada a partir do Hisn al-Muslim (Saʽīd Ibn Wahf Al-Qaḥṭānī, edição domínio público).',
    sacredness_level: 2,
    reserved: false,
    lgpd_personal: false,
  },

  // ─────────────────────── JUDAISM ───────────────────────
  {
    id: 'judaism-shema-morning-pt',
    title: 'Shemá Yisrael (Deuteronômio 6:4-9)',
    tradition: 'judaism',
    category: 'morning',
    locale: 'pt-BR',
    text:
      'Shemá Yisrael, Adonai Eloheinu, Adonai Echad. '
      + 'Ouve, ó Israel, o Senhor é nosso Deus, o Senhor é Um. '
      + 'Bendito seja o nome da glória do Seu reino para todo o sempre.',
    symbol_refs: ['tfilin.judaismo', 'mezuzah.judaismo'],
    source_tradition_ref: 'Deuteronômio 6:4-9',
    attribution:
      'Tradução PT-BR convencional domínio público (referência: 1917 Jewish Publication Society translation).',
    sacredness_level: 3,
    reserved: false,
    lgpd_personal: false,
  },
  {
    id: 'judaism-modeh-ani-morning-pt',
    title: 'Modeh Ani (Birkot HaShachar)',
    tradition: 'judaism',
    category: 'gratitude',
    locale: 'pt-BR',
    text:
      "Modeh ani lefanecha, Ruach Chai v'Kayam, she'he'chezarta bi enosh — "
      + 'Eu agradeço diante de Ti, Espírito Vivente e Eterno, que me devolveu a alma com compaixão.',
    symbol_refs: ['tfilin.judaismo'],
    source_tradition_ref: 'Talmud, Berachot 60b',
    attribution:
      'Tradução PT-BR convencional domínio público a partir do hebraico transliterado + JPS.',
    sacredness_level: 2,
    reserved: false,
    lgpd_personal: false,
  },

  // ─────────────────────── TAOISM ───────────────────────
  {
    id: 'taoism-tai-chi-chu-yen-meditation-pt',
    title: 'Tài Jí Chù Yán — Meditação do Grande Extremamente Original',
    tradition: 'taoism',
    category: 'meditation',
    locale: 'pt-BR',
    text:
      'No Grande Extremamente Original, mover-se é a fonte do Céu. '
      + 'A fonte produz o tempo; o tempo produz o espaço; o espaço produz os dez mil seres. '
      + 'Por isso: quietude é a origem dos dez mil seres.',
    symbol_refs: ['yin-yang.tao', 'taijitu.tao'],
    source_tradition_ref: 'Tàijí Tú Shū — Sistema Cosmológico dos Cinco Elementos',
    attribution:
      'Tradução PT-BR derivada do Sistema Cosmológico em Wu Ji You Shou Gong (domínio público, tradição taoísta clássica).',
    sacredness_level: 2,
    reserved: false,
    lgpd_personal: false,
  },
  {
    id: 'taoism-wei-wu-wei-grounding-pt',
    title: 'Wei-Wu-Wei — Não-Agir (Dào Dé Jīng §37)',
    tradition: 'taoism',
    category: 'grounding',
    locale: 'pt-BR',
    text:
      'O Caminho opera sem agir, e nada fica por fazer. '
      + 'Se os reis e príncipes pudessem manter o Caminho, todos os seres seriam transformados. '
      + 'Transformados, o desejo se aquietaria; e então, no não-agir, a harmonia produzir-se-ia.',
    symbol_refs: ['dao.tao'],
    source_tradition_ref: 'Dao De Jing, cap. 37 (versão clássica)',
    attribution:
      'Tradução PT-BR a partir da versão clássica do Dao De Jing, domínio público. Atribuição acadêmica convencional.',
    sacredness_level: 2,
    reserved: false,
    lgpd_personal: false,
  },

  // ─────────────────────── INDIGENOUS BRAZILIAN ───────────────────────
  {
    id: 'indigenous-lua-nova-evening-pt',
    title: 'Rezo da Lua Nova',
    tradition: 'indigenous_brazilian',
    category: 'ancestor_veneration',
    locale: 'pt-BR',
    text: '',
    symbol_refs: ['jacui.br', 'fogo.br'],
    attribution:
      'Reservado. O rezo da lua nova varia por povo (Guarani, Xavante, Kaingang, Huni Kuin, etc.); a integração com app requer autorização da liderança indígena local e tradução supervisionada.',
    sacredness_level: 5,
    reserved: true,
    lgpd_personal: false,
  },
  {
    id: 'indigenous-fumaca-morning-pt',
    title: "Pedido da Fumaça (Petym)",
    tradition: 'indigenous_brazilian',
    category: 'morning',
    locale: 'pt-BR',
    text: '',
    symbol_refs: ['fogo.br', 'petym.br'],
    attribution:
      'Reservado. Oração com tabaco sagrado (Petym/Pety) é conduzida por Pajé ou Nhandesy em contexto ritual. NÃO traduzir ou adaptar sem consentimento da aldeia de origem.',
    sacredness_level: 5,
    reserved: true,
    lgpd_personal: false,
  },

  // ─────────────────────── SYNCRETIC ───────────────────────
  {
    id: 'syncretic-oxala-pai-nosso-pt',
    title: 'Prece de Oxalá (em forma sincrética pública)',
    tradition: 'syncretic',
    category: 'morning',
    locale: 'pt-BR',
    text:
      'Pai Oxalá, senhor da criação, que és pacífico e justo, '
      + 'que o teu axé cubra nosso dia; que nossas palavras sejam retas; '
      + 'que o nosso caminhar seja firme, em paz. Aṣẹ!',
    symbol_refs: ['oxala.br'],
    source_tradition_ref: 'Devocional sincrético popular do século XX (Recôncavo Baiano)',
    attribution:
      'Compilação devocional sincrética de domínio público, corrente pública do Recôncavo Baiano. Versão apresentada como reverência pública, não como texto iniciático.',
    sacredness_level: 3,
    reserved: false,
    lgpd_personal: false,
  },
  {
    id: 'syncretic-iemanja-mar-pt',
    title: 'Oferenda de Iemanjá ao Mar',
    tradition: 'syncretic',
    category: 'evening',
    locale: 'pt-BR',
    text:
      'Iemanjá, mãe das águas, recebe o meu voto entregue ao mar; '
      + 'que a maré leve o que não me serve mais; que me devolva a paz e o bom caminho. '
      + 'Odoyá!',
    symbol_refs: ['iemanjá.br', 'mar.br'],
    source_tradition_ref: 'Tradição popular do Rio Vermelho (Salvador/BA), registrada no Acervo IPHAN',
    attribution:
      'Oração popular sincrética de domínio público conforme registro etnográfico de standard references (IPHAN/Lacerda).',
    sacredness_level: 2,
    reserved: false,
    lgpd_personal: false,
  },

  // ─────────────────────── SECULAR MYSTICAL ───────────────────────
  {
    id: 'secular-heart-coherence-morning-pt',
    title: 'Respiração da Coerência Cardíaca',
    tradition: 'secular_mystical',
    category: 'morning',
    locale: 'pt-BR',
    text:
      'Respirando pela barriga, e exalando sem pressa, sinto o peito aquecer. '
      + 'Permito-me reconhecer: estou aqui, agora. '
      + 'Que este dia tenha a gentileza e a firmeza que escolho oferecer.',
    symbol_refs: ['coracao.sec', 'presenca.sec'],
    attribution:
      'Composição devocional secular (HeartMath Institute, tradição da psicologia da respiração); domínio público.',
    sacredness_level: 1,
    reserved: false,
    lgpd_personal: false,
  },
  {
    id: 'secular-impermanence-evening-pt',
    title: 'Afirmação da Impermanência',
    tradition: 'secular_mystical',
    category: 'evening',
    locale: 'pt-BR',
    text:
      'Tudo muda. Este dia mudou. Minha respiração mudou. '
      + 'O que me doeu há pouco já não me dói agora; o que amei há pouco ainda está comigo de outra forma. '
      + 'Encontrei o presente. Posso descansar.',
    symbol_refs: ['presenca.sec'],
    attribution:
      'Composição devocional secular; inspirada em tradições contemplativas ecumênicas.',
    sacredness_level: 1,
    reserved: false,
    lgpd_personal: false,
  },

  // ─────────────────────── TRANSLATIONS — pt-BR canonical + en + es ─────────
  // All canonical entries above are pt-BR. The following provide English and
  // Spanish equivalents so callers can ask for `en-US` / `es-ES` directly
  // without spinning up a runtime translation. Translations of public-domain
  // texts come from academic conventions; reserved rows stay empty.

  // Christianity en
  {
    id: 'christianity-lords-prayer-en',
    title: "The Lord's Prayer (Matthew 6:9-13)",
    tradition: 'christianity',
    category: 'morning',
    locale: 'en-US',
    text:
      "Our Father who art in heaven, hallowed be thy name. "
      + "Thy kingdom come, thy will be done, on earth as it is in heaven. "
      + "Give us this day our daily bread, and forgive us our trespasses, "
      + "as we forgive those who trespass against us. "
      + "And lead us not into temptation, but deliver us from evil. Amen.",
    translation_of: 'christianity-lords-prayer-pt',
    symbol_refs: ['pomba.cristianismo', 'prece-real.cristianismo'],
    source_tradition_ref: 'Matthew 6:9-13; Luke 11:2-4',
    attribution: 'King James Version-derived public-domain English tradition.',
    sacredness_level: 2,
    reserved: false,
    lgpd_personal: false,
  },
  // Christianity es
  {
    id: 'christianity-lords-prayer-es',
    title: 'Padre Nuestro (Mateo 6:9-13)',
    tradition: 'christianity',
    category: 'morning',
    locale: 'es-ES',
    text:
      'Padre nuestro que estás en los cielos, santificado sea tu nombre. '
      + 'Venga a nosotros tu reino, hágase tu voluntad, así en la tierra como en el cielo. '
      + 'Danos hoy nuestro pan de cada día, perdona nuestras ofensas, '
      + 'como también nosotros perdonamos a los que nos ofenden. '
      + 'Y no nos dejes caer en tentación, mas líbranos del mal. Amén.',
    translation_of: 'christianity-lords-prayer-pt',
    symbol_refs: ['pomba.cristianismo', 'prece-real.cristianismo'],
    source_tradition_ref: 'Mateo 6:9-13; Lucas 11:2-4',
    attribution: 'Traducción ES basada en Reina-Valera 1960 (dominio público).',
    sacredness_level: 2,
    reserved: false,
    lgpd_personal: false,
  },

  // Buddhism en
  {
    id: 'buddhism-refuge-three-jewels-en',
    title: 'Refuge in the Three Jewels',
    tradition: 'buddhism',
    category: 'morning',
    locale: 'en-US',
    text:
      'I take refuge in the Buddha. I take refuge in the Dharma. I take refuge in the Sangha. '
      + 'I take refuge in the Three Jewels again, until full awakening.',
    translation_of: 'buddhism-refuge-three-jewels-pt',
    symbol_refs: ['dharma-chakra.int', 'bodhi-leaf.int'],
    source_tradition_ref: 'Pāli Nikāya — opening of the refuge formula',
    attribution: 'Public-domain translation following Theravāda and Mahāyāna conventions.',
    sacredness_level: 2,
    reserved: false,
    lgpd_personal: false,
  },
  // Buddhism es
  {
    id: 'buddhism-refuge-three-jewels-es',
    title: 'Refugio en las Tres Joyas',
    tradition: 'buddhism',
    category: 'morning',
    locale: 'es-ES',
    text:
      'Tomo refugio en el Buda. Tomo refugio en el Dharma. Tomo refugio en el Sangha. '
      + 'Tomo refugio en las Tres Joyas una y otra vez, hasta el despertar completo.',
    translation_of: 'buddhism-refuge-three-jewels-pt',
    symbol_refs: ['dharma-chakra.int', 'bodhi-leaf.int'],
    source_tradition_ref: 'Pāli Nikāya — opening of the refuge formula',
    attribution: 'Traducción ES de dominio público siguiendo convenciones Theravāda y Mahāyāna.',
    sacredness_level: 2,
    reserved: false,
    lgpd_personal: false,
  },

  // Islam en
  {
    id: 'islam-al-fatiha-en',
    title: 'Surah Al-Fatihah (The Opening)',
    tradition: 'islam',
    category: 'morning',
    locale: 'en-US',
    text:
      'In the name of God, the Most Gracious, the Most Merciful. '
      + 'All praise is due to God, Lord of the worlds, the Most Gracious, the Most Merciful, '
      + 'the Sovereign of the Day of Judgment. You alone we worship, and You alone we ask for help. '
      + 'Guide us on the straight path, the path of those You have blessed, '
      + 'not of those who earned Your anger, nor of those who went astray. Amen.',
    translation_of: 'islam-al-fatiha-morning-pt',
    symbol_refs: ['mishkat.islam', 'shahada.islam'],
    source_tradition_ref: 'Al-Qurʾān 1:1-7',
    attribution: 'English translation following Saheeh International public-domain convention.',
    sacredness_level: 3,
    reserved: false,
    lgpd_personal: false,
  },
  // Islam es
  {
    id: 'islam-al-fatiha-es',
    title: 'Sura Al-Fatihah (La Apertura)',
    tradition: 'islam',
    category: 'morning',
    locale: 'es-ES',
    text:
      'En el nombre de Dios, el Clemente, el Misericordioso. '
      + 'Alabado sea Dios, Señor de los mundos, el Clemente, el Misericordioso, '
      + 'el Soberano del Día del Juicio. Sólo a Ti adoramos y sólo a Ti imploramos ayuda. '
      + 'Guíanos por la senda recta, la senda de los que has agraciado, '
      + 'no la de los que incurrieron en Tu ira, ni la de los que se desviaron. Amén.',
    translation_of: 'islam-al-fatiha-morning-pt',
    symbol_refs: ['mishkat.islam', 'shahada.islam'],
    source_tradition_ref: 'Al-Qurʾān 1:1-7',
    attribution: 'Traducción ES de dominio público basada en Julio Cortés / conferencias académicas.',
    sacredness_level: 3,
    reserved: false,
    lgpd_personal: false,
  },

  // Hinduism en
  {
    id: 'hinduism-gayatri-mantra-en',
    title: 'Gayatri Mantra (Ṛg Veda III.62.10)',
    tradition: 'hinduism',
    category: 'morning',
    locale: 'en-US',
    text:
      'Om bhuh bhuvah svah, tat savitur varenyam, bhargo devasya dhimahi, dhiyo yo nah pracodayat.',
    translation_of: 'hinduism-gayatri-mantra-morning-pt',
    symbol_refs: ['surya.int', 'brahmasutra.int'],
    source_tradition_ref: 'Ṛg Veda III.62.10',
    attribution: 'IAST transliteration convention; public domain.',
    sacredness_level: 3,
    reserved: false,
    lgpd_personal: false,
  },
  // Hinduism es
  {
    id: 'hinduism-gayatri-mantra-es',
    title: 'Mantra Gayatri (Ṛg Veda III.62.10)',
    tradition: 'hinduism',
    category: 'morning',
    locale: 'es-ES',
    text:
      'Om bhuh bhuvah svah, tat savitur varenyam, bhargo devasya dhimahi, dhiyo yo nah pracodayat.',
    translation_of: 'hinduism-gayatri-mantra-morning-pt',
    symbol_refs: ['surya.int', 'brahmasutra.int'],
    source_tradition_ref: 'Ṛg Veda III.62.10',
    attribution: 'Transliteración IAST, dominio público.',
    sacredness_level: 3,
    reserved: false,
    lgpd_personal: false,
  },

  // Judaism en
  {
    id: 'judaism-shema-en',
    title: 'Shema Yisrael (Deuteronomy 6:4-9)',
    tradition: 'judaism',
    category: 'morning',
    locale: 'en-US',
    text:
      'Hear, O Israel: the Lord is our God, the Lord is One. '
      + 'Blessed be the name of the glory of His kingdom forever.',
    translation_of: 'judaism-shema-morning-pt',
    symbol_refs: ['tfilin.judaismo', 'mezuzah.judaismo'],
    source_tradition_ref: 'Deuteronomy 6:4-9',
    attribution: 'Public-domain English following 1917 JPS convention.',
    sacredness_level: 3,
    reserved: false,
    lgpd_personal: false,
  },
  // Judaism es
  {
    id: 'judaism-shema-es',
    title: 'Shemá Israel (Deuteronomio 6:4-9)',
    tradition: 'judaism',
    category: 'morning',
    locale: 'es-ES',
    text:
      'Escucha, Israel: el Señor es nuestro Dios, el Señor es Uno. '
      + 'Bendito sea el nombre de la gloria de Su reino por siempre.',
    translation_of: 'judaism-shema-morning-pt',
    symbol_refs: ['tfilin.judaismo', 'mezuzah.judaismo'],
    source_tradition_ref: 'Deuteronomio 6:4-9',
    attribution: 'Traducción ES de dominio público basada en fuentes académicas judaicas.',
    sacredness_level: 3,
    reserved: false,
    lgpd_personal: false,
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// §7  PrayerCorpus REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A small mutable overlay (used by tests / dev seeds) for adding rows at
 * runtime. Production code should reach for the const `PRAYERS` directly.
 */
const _OVERLAY_PRAYERS: Prayer[] = [];

export const PrayerCorpus = {
  /** Total rows currently registered (read-only snapshot). */
  size(): number {
    return PRAYERS.length + _OVERLAY_PRAYERS.length;
  },

  /**
   * Register a runtime prayer (e.g. from a corpus-curator in dev mode).
   * Production callers should consume the bundled `PRAYERS` directly.
   */
  registerPrayer(p: Prayer): void {
    if (p.lgpd_personal !== false) throw new Error('PRAYERS rows must have lgpd_personal=false');
    if (!(p.text.length > 0 || p.reserved)) throw new Error('non-reserved prayer must have non-empty text');
    if (p.attribution.length === 0) throw new Error('attribution must be present');
    if (_OVERLAY_PRAYERS.some((existing) => existing.id === p.id)) {
      throw new PrayerValidationError('id', `duplicate prayer id "${p.id}"`);
    }
    _OVERLAY_PRAYERS.push(p);
  },

  /** Remove a runtime prayer by id. Throws if id was bundled into PRAYERS. */
  deregisterPrayer(id: string): boolean {
    if (PRAYERS.some((p) => p.id === id)) {
      throw new PrayerValidationError(
        'id',
        `cannot deregister bundled prayer "${id}"; use a curatorial migration`,
      );
    }
    const idx = _OVERLAY_PRAYERS.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    _OVERLAY_PRAYERS.splice(idx, 1);
    return true;
  },

  /** Look up by id, searching overlay first then the bundled register. */
  getPrayerById(id: string): Prayer | undefined {
    return _OVERLAY_PRAYERS.find((p) => p.id === id) ?? PRAYERS.find((p) => p.id === id);
  },

  /** All rows in a tradition (overlay + bundled). */
  listByTradition(tradition: Tradition): readonly Prayer[] {
    return [..._OVERLAY_PRAYERS, ...PRAYERS].filter((p) => p.tradition === tradition);
  },

  /** All rows for a category (overlay + bundled). */
  listByCategory(category: PrayerCategory): readonly Prayer[] {
    return [..._OVERLAY_PRAYERS, ...PRAYERS].filter((p) => p.category === category);
  },

  /** All rows with a given canonical locale. */
  listByLocale(locale: LocaleId): readonly Prayer[] {
    return [..._OVERLAY_PRAYERS, ...PRAYERS].filter((p) => p.locale === locale);
  },

  /**
   * Substring search across title + attribution + text. Reserved rows
   * only match on title/attribution, never on `text` (which is empty).
   */
  searchPrayers(
    query: string,
    filters: {
      tradition?: Tradition;
      category?: PrayerCategory;
      locale?: LocaleId;
      reservedOnly?: boolean;
    } = {},
  ): readonly Prayer[] {
    const needle = query.trim().toLowerCase();
    const all = [..._OVERLAY_PRAYERS, ...PRAYERS];
    return all.filter((p) => {
      if (filters.tradition && p.tradition !== filters.tradition) return false;
      if (filters.category && p.category !== filters.category) return false;
      if (filters.locale && p.locale !== filters.locale) return false;
      if (filters.reservedOnly !== undefined && p.reserved !== filters.reservedOnly) {
        return false;
      }
      if (needle.length === 0) return true;
      const hay = `${p.title} ${p.attribution} ${p.reserved ? '' : p.text}`.toLowerCase();
      return hay.includes(needle);
    });
  },

  /** Snapshot of all prayers (overlay first, then bundled, in registered order). */
  listAll(): readonly Prayer[] {
    return [..._OVERLAY_PRAYERS, ...PRAYERS];
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// §8  i18n — localisePrayer
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a localised view of a Prayer for the requested locale.
 *
 * Behaviour:
 *  - If the Prayer is canonical in the requested locale → returned as-is.
 *  - Else, if a `translation_of` sibling exists in the requested locale →
 *    that sibling's text is returned (with `translation_missing=false`).
 *  - Else if a `translation_of` group has a different canonical but the
 *    requested locale matches the *group*'s original tradition → pick the
 *    closest available translation; if none, returns `MISSING_TRANSLATION`
 *    with `translation_missing=true`.
 *
 * Reserved rows always return the placeholder string and
 * `translation_missing=true` (never auto-fill).
 */
export function localisePrayer(prayer: Prayer, locale: LocaleId): LocalizedPrayer {
  if (prayer === undefined) throw new Error('prayer required (localisePrayer)');
  assertLocaleId(locale);
  if (prayer.reserved) {
    return {
      prayer,
      locale,
      text: MISSING_TRANSLATION,
      text_canonical: prayer.text,
      translation_missing: true,
    };
  }
  if (prayer.locale === locale) {
    return {
      prayer,
      locale,
      text: prayer.text,
      text_canonical: prayer.text,
      translation_missing: false,
    };
  }
  const rootId = prayer.translation_of ?? prayer.id;
  const siblings = PrayerCorpus.listAll().filter(
    (p) => (p.id === rootId || p.translation_of === rootId) && !p.reserved,
  );
  const directSibling = siblings.find((p) => p.locale === locale);
  if (directSibling) {
    return {
      prayer: directSibling,
      locale,
      text: directSibling.text,
      text_canonical: prayer.text,
      translation_missing: false,
    };
  }
  // No exact-locale sibling; surface MISSING_TRANSLATION but keep the
  // canonical prayer context.
  return {
    prayer,
    locale,
    text: MISSING_TRANSLATION,
    text_canonical: prayer.text,
    translation_missing: true,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// §9  SELECTION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Weights by category for `selectDailyPrayer`. Sum is intentionally 100.
 * Designed to surface morning/evening first (since they were the original
 * voice-mode-tts slot), then gratitude/forgiveness widely.
 */
export const WEIGHT_BY_CATEGORY: Readonly<Record<PrayerCategory, number>> = {
  morning: 30,
  evening: 30,
  gratitude: 10,
  gratitude_petition: 5,
  forgiveness: 5,
  grounding: 4,
  healing: 3,
  protection: 3,
  intention: 3,
  meditation: 2,
  ancestor_veneration: 2,
  orixa_invocation: 1,
} as const;

/** Embeddable seedable RNG (mulberry32). */
export const RANDOMNESS_SEED = 0xc0ffee as const;

export interface DailyPrayer {
  readonly prayer: Prayer;
  readonly localised: LocalizedPrayer;
  readonly category: PrayerCategory;
  readonly picked_for: string;
}

/**
 * mulberry32 — small, fast, fully deterministic 32-bit PRNG.
 * Returns a function that produces uniform floats in [0,1).
 */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Pick a daily prayer deterministically from `(userTradition?, locale?, now)`.
 *
 * Selection rules:
 *  1. If userTradition provided: prefer rows in that tradition, else fall
 *     back to cross-tradition resonance (see RESONANCE_TABLE).
 *  2. Category bias uses WEIGHT_BY_CATEGORY.
 *  3. Reserved rows are NEVER auto-selected; they're silently skipped.
 *  4. The same `(day, userId, locale)` triple yields the same prayer across
 *     sessions (predictability for the user's morning reading).
 */
export function selectDailyPrayer(
  now: Date,
  userTradition: Tradition | null = null,
  locale: LocaleId = DEFAULT_LOCALE,
  userId: string | null = null,
): DailyPrayer {
  assertLocaleId(locale);
  if (!(now instanceof Date)) throw new Error('now must be a Date');
  if (userTradition !== null) {
    if (
      !Object.prototype.hasOwnProperty.call(TRADITION_DISPLAY_NAMES, userTradition)
    ) throw new Error('unknown tradition');
  }

  // Seed: combines date + optional userId + locale, so the same triple is deterministic.
  const day = now.toISOString().slice(0, 10);
  const seedRaw = `${day}|${userId ?? 'anon'}|${locale}|RANDOMNESS_SEED=${RANDOMNESS_SEED.toString(16)}`;
  const seed = computeStableSeed(seedRaw);

  const eligible = PrayerCorpus.listAll().filter(
    (p) =>
      !p.reserved &&
      (userTradition === null || matchesUserTradition(p, userTradition)),
  );

  let pool = eligible;
  if (pool.length === 0) {
    // Cross-tradition fallback — at minimum pick a non-reserved morning text.
    pool = PrayerCorpus.listAll().filter((p) => !p.reserved);
  }

  const rng = mulberry32(seed);
  const category = weightedCategory(rng);

  // Filter by category if any rows match; otherwise relax.
  const byCategory = pool.filter((p) => p.category === category);
  const finalPool = byCategory.length > 0 ? byCategory : pool;

  const chosen = finalPool[Math.floor(rng() * finalPool.length)] ?? PRAYERS[0];
  return {
    prayer: chosen,
    localised: localisePrayer(chosen, locale),
    category: chosen.category,
    picked_for: day,
  };
}

/**
 * Pick a 7-day weekly rotation starting at `weekStart`. Each day of the
 * week gets a distinct (and deterministic) category.
 */
export function selectWeeklyRotation(
  weekStart: Date,
  userTradition: Tradition | null = null,
  locale: LocaleId = DEFAULT_LOCALE,
  userId: string | null = null,
): readonly DailyPrayer[] {
  assertLocaleId(locale);
  if (!(weekStart instanceof Date)) throw new Error('weekStart must be a Date');
  const monday = ensureMonday(weekStart);
  const days: DailyPrayer[] = [];
  for (let i = 0; i < 7; i += 1) {
    const day = new Date(monday);
    day.setUTCDate(monday.getUTCDate() + i);
    days.push(selectDailyPrayer(day, userTradition, locale, userId));
  }
  return days;
}

function weightedCategory(rng: () => number): PrayerCategory {
  const categories = Object.keys(WEIGHT_BY_CATEGORY) as PrayerCategory[];
  const total = categories.reduce((acc, c) => acc + WEIGHT_BY_CATEGORY[c], 0);
  const target = rng() * total;
  let cursor = 0;
  for (const c of categories) {
    cursor += WEIGHT_BY_CATEGORY[c];
    if (target <= cursor) return c;
  }
  return categories[categories.length - 1] ?? 'morning';
}

function matchesUserTradition(p: Prayer, userTradition: Tradition): boolean {
  if (p.tradition === userTradition) return true;
  const resonances = (RESONANCE_TABLE[userTradition] ?? []).map((r) => r.to_id);
  return resonances.includes(p.id);
}

/**
 * FNV-1a 32-bit — used as a deterministic seed.
 */
function computeStableSeed(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0) ^ RANDOMNESS_SEED;
}

function ensureMonday(d: Date): Date {
  const out = new Date(d);
  out.setUTCHours(0, 0, 0, 0);
  const dow = out.getUTCDay(); // 0=sun..6=sat
  const offset = (dow + 6) % 7; // monday = 0
  out.setUTCDate(out.getUTCDate() - offset);
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// §10  CROSS-TRADITION RESONANCE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hand-curated resonance table. Each entry is a (from_id, to_id, reason, strength)
 * triple. Selection engine uses `RESONANCE_TABLE[userTradition]` to widen the
 * eligible pool before falling back to the entire corpus.
 *
 * Durability: keep this aligned with w45/tradition-cross-references so
 * downstream insights can resolve ID lookups in both directions.
 */
export const RESONANCE_TABLE: Readonly<
  Record<Tradition, readonly ResonanceLink[]>
> = {
  candomble: [
    {
      from_id: 'syncretic-oxala-pai-nosso-pt',
      to_id: 'christianity-lords-prayer-pt',
      reason: 'syncretic_figure',
      strength: 3,
    },
    {
      from_id: 'syncretic-iemanja-mar-pt',
      to_id: 'maria.cristianismo',
      reason: 'syncretic_figure',
      strength: 3,
    },
  ],
  ifa: [
    {
      from_id: 'hinduism-gayatri-mantra-morning-pt',
      to_id: 'om.brazil',
      reason: 'shared_intent',
      strength: 2,
    },
    {
      from_id: 'buddhism-refuge-three-jewels-pt',
      to_id: 'opon-ifa.br',
      reason: 'thematic_equivalent',
      strength: 2,
    },
  ],
  umbanda: [
    {
      from_id: 'syncretic-oxala-pai-nosso-pt',
      to_id: 'prece-real.cristianismo',
      reason: 'syncretic_figure',
      strength: 3,
    },
    {
      from_id: 'secular-heart-coherence-morning-pt',
      to_id: 'pretos-velhos.br',
      reason: 'thematic_equivalent',
      strength: 1,
    },
  ],
  buddhism: [
    {
      from_id: 'buddhism-metta-lovingkindness-excerpt-pt',
      to_id: 'secular-heart-coherence-morning-pt',
      reason: 'thematic_equivalent',
      strength: 2,
    },
    {
      from_id: 'hinduism-gayatri-mantra-morning-pt',
      to_id: 'buddhism-refuge-three-jewels-pt',
      reason: 'shared_intent',
      strength: 2,
    },
  ],
  hinduism: [
    {
      from_id: 'hinduism-surya-salutation-gratitude-pt',
      to_id: 'hinduism-gayatri-mantra-morning-pt',
      reason: 'shared_intent',
      strength: 3,
    },
    {
      from_id: 'secular-heart-coherence-morning-pt',
      to_id: 'hinduism-gayatri-mantra-morning-pt',
      reason: 'thematic_equivalent',
      strength: 1,
    },
  ],
  christianity: [
    {
      from_id: 'christianity-lords-prayer-pt',
      to_id: 'syncretic-oxala-pai-nosso-pt',
      reason: 'syncretic_figure',
      strength: 3,
    },
    {
      from_id: 'christianity-hail-mary-evening-pt',
      to_id: 'syncretic-iemanja-mar-pt',
      reason: 'syncretic_figure',
      strength: 3,
    },
  ],
  islam: [
    {
      from_id: 'islam-al-fatiha-morning-pt',
      to_id: 'secular-heart-coherence-morning-pt',
      reason: 'thematic_equivalent',
      strength: 1,
    },
    {
      from_id: 'islam-morning-dua-gratitude-pt',
      to_id: 'judaism-modeh-ani-morning-pt',
      reason: 'shared_intent',
      strength: 2,
    },
  ],
  judaism: [
    {
      from_id: 'judaism-shema-morning-pt',
      to_id: 'islam-al-fatiha-morning-pt',
      reason: 'shared_intent',
      strength: 2,
    },
    {
      from_id: 'judaism-modeh-ani-morning-pt',
      to_id: 'islam-morning-dua-gratitude-pt',
      reason: 'shared_intent',
      strength: 2,
    },
  ],
  taoism: [
    {
      from_id: 'taoism-wei-wu-wei-grounding-pt',
      to_id: 'buddhism-refuge-three-jewels-pt',
      reason: 'thematic_equivalent',
      strength: 2,
    },
    {
      from_id: 'taoism-tai-chi-chu-yen-meditation-pt',
      to_id: 'buddhism-metta-lovingkindness-excerpt-pt',
      reason: 'thematic_equivalent',
      strength: 2,
    },
  ],
  indigenous_brazilian: [
    {
      from_id: 'secular-heart-coherence-morning-pt',
      to_id: 'petym.br',
      reason: 'thematic_equivalent',
      strength: 1,
    },
    {
      from_id: 'syncretic-iemanja-mar-pt',
      to_id: 'jacui.br',
      reason: 'shared_intent',
      strength: 2,
    },
  ],
  syncretic: [
    {
      from_id: 'syncretic-oxala-pai-nosso-pt',
      to_id: 'christianity-lords-prayer-pt',
      reason: 'syncretic_figure',
      strength: 3,
    },
    {
      from_id: 'syncretic-iemanja-mar-pt',
      to_id: 'christianity-hail-mary-evening-pt',
      reason: 'syncretic_figure',
      strength: 3,
    },
  ],
  secular_mystical: [
    {
      from_id: 'secular-heart-coherence-morning-pt',
      to_id: 'buddhism-metta-lovingkindness-excerpt-pt',
      reason: 'thematic_equivalent',
      strength: 2,
    },
    {
      from_id: 'secular-impermanence-evening-pt',
      to_id: 'taoism-tai-chi-chu-yen-meditation-pt',
      reason: 'thematic_equivalent',
      strength: 2,
    },
  ],
} as const;

/**
 * Returns resonances for a given prayer (bidirectional match against
 * RESONANCE_TABLE). Limit defaults to 8.
 */
export function findResonantPrayers(
  prayer: Prayer,
  limit: number = 8,
): readonly ResonanceLink[] {
  if (prayer === undefined) throw new Error('prayer required (findResonantPrayers)');
  if (!(Number.isFinite(limit) && limit > 0)) throw new Error('limit must be positive');
  const all: ResonanceLink[] = [];
  const trad = prayer.tradition;
  const table = RESONANCE_TABLE[trad] ?? [];
  for (const row of table) {
    if (row.from_id === prayer.id || row.to_id === prayer.id) {
      all.push(row);
    }
  }
  return all.slice(0, limit);
}

// ─────────────────────────────────────────────────────────────────────────────
// §11  LGPD — submitPrayer + Art. 18 helpers
// ─────────────────────────────────────────────────────────────────────────────

const RETENTION_TO_DAYS: Readonly<Record<PrayerSubmissionConsent['retention'], number | null>> = {
  '30d': 30,
  '1y': 365,
  indefinite: null,
  until_delete: null,
};

/**
 * In-memory submission store. NOT persisted to disk by this module; the
 * production app writes through the `prayerSubmissionRepository` to a
 * database with retention deletion jobs. Here we expose an in-memory
 * store so unit tests can exercise the API.
 */
const _SUBMISSIONS: Map<string, PrayerSubmission> = new Map();

let _SUBMISSION_COUNTER = 0;

function nextSubmissionId(): string {
  _SUBMISSION_COUNTER += 1;
  return `pry-sub-${Date.now().toString(36)}-${_SUBMISSION_COUNTER.toString(36)}`;
}

const RETENTION_DAYS_FOR_SCOPE: Readonly<
  Record<PrayerSubmissionConsent['scope'], number | null>
> = {
  private: 365 * 5,
  community: 365 * 10,
  public: null,
};

/**
 * Submit a user-authored prayer to the in-memory / persistence repository.
 * Caller MUST supply a verified consent payload (LGPD Art. 7 / 8).
 */
export function submitPrayer(
  p: Prayer,
  consent: PrayerSubmissionConsent,
): SubmissionReceipt {
  if (consent.opt_in !== true) {
    throw new SubmissionConsentMissingError(consent.user_id);
  }
  if (consent.scope === 'public') {
    const policyDays = RETENTION_DAYS_FOR_SCOPE.public;
    const requestedDays = RETENTION_TO_DAYS[consent.retention];
    if (policyDays === null && consent.retention !== 'indefinite' && consent.retention !== 'until_delete') {
      throw new RetentionPolicyError(
        consent.user_id,
        consent.retention,
        'public submissions must use indefinite or until_delete retention',
      );
    }
    if (requestedDays !== null && policyDays === null && consent.retention === '30d') {
      throw new RetentionPolicyError(
        consent.user_id,
        consent.retention,
        'public submissions cannot request a hard 30-day window — choose until_delete',
      );
    }
  }

  const submission_id = nextSubmissionId();
  const submission: PrayerSubmission = {
    submission_id,
    submission: { ...p, lgpd_personal: true },
    consent,
    lgpd_personal: true,
  };
  _SUBMISSIONS.set(submission_id, submission);

  const stored_until_iso = retentionUntilIso(consent);

  const warnings: string[] = [];
  if (p.reserved && consent.scope === 'public') {
    warnings.push('reserved slot exposed as public; revisar com a curadoria');
  }
  if (p.sacredness_level >= 4) {
    warnings.push('sacredness>=4; render must apply respectfulUseChecklist');
  }

  return {
    submission_id,
    accepted: true,
    consent_recorded: true,
    stored_until_iso,
    warnings,
  };
}

function retentionUntilIso(consent: PrayerSubmissionConsent): string {
  const days = RETENTION_TO_DAYS[consent.retention];
  const capt = new Date(consent.captured_at_iso);
  if (days === null) {
    capt.setUTCFullYear(capt.getUTCFullYear() + 99);
    return capt.toISOString();
  }
  capt.setUTCDate(capt.getUTCDate() + days);
  return capt.toISOString();
}

/**
 * Returns a redacted copy of a user-submitted Prayer, stripping any
 * metadata fields that could re-identify the submitter.
 *
 * Note: the caller should still call `deleteUserSubmissions` when the
 * user requests full deletion under LGPD Art. 18.
 */
export function redactSubmissionMetadata(p: PrayerSubmission): RedactedPrayer {
  const redaction_notes: string[] = [];
  let title = p.submission.title;
  let attribution = p.submission.attribution;
  if (title.match(/[A-Z][a-z]{2,}\s+[A-Z][a-z]{2,}/)) {
    title = 'Oração submetida (título redigido)';
    redaction_notes.push('title regex match for proper names');
  }
  if (attribution.includes('@') || attribution.includes('http://') || attribution.includes('https://')) {
    attribution = 'Atribuição verificada por curadoria.';
    redaction_notes.push('attribution stripped of contact-like strings');
  }
  return {
    ...p.submission,
    title,
    attribution,
    submission_id: p.submission_id,
    redaction_notes,
    lgpd_personal: false,
  };
}

/**
 * Export all submissions by a given user_id in the requested format.
 * Supported: `json`, `csv`, `markdown`.
 */
export function exportUserSubmissions(
  userId: string,
  format: 'json' | 'csv' | 'markdown' = 'json',
): ExportArtifact {
  const rows = [..._SUBMISSIONS.values()].filter(
    (s) => s.consent.user_id === userId,
  );
  const generatedAt = new Date().toISOString();
  let content: string;
  if (format === 'json') {
    content = JSON.stringify(rows.map((s) => redactSubmissionMetadata(s)), null, 2);
  } else if (format === 'csv') {
    content = renderCsv(rows.map((s) => redactSubmissionMetadata(s)));
  } else {
    content = renderMarkdown(rows.map((s) => redactSubmissionMetadata(s)));
  }
  return {
    user_id: userId,
    format,
    content,
    byte_size: textByteLength(content),
    generated_at_iso: generatedAt,
  };
}

/**
 * Polyfill for `Buffer.byteLength` without dragging in the `node:buffer`
 * module — counts UTF-8 code points accurately enough for export sizes.
 */
function textByteLength(s: string): number {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(s).length;
  }
  let n = 0;
  for (let i = 0; i < s.length; i += 1) {
    const code = s.charCodeAt(i);
    if (code < 0x80) n += 1;
    else if (code < 0x800) n += 2;
    else if (code >= 0xd800 && code <= 0xdbff) { n += 4; i += 1; }
    else n += 3;
  }
  return n;
}

function renderCsv(rows: RedactedPrayer[]): string {
  const header = ['submission_id', 'tradition', 'category', 'locale', 'sacredness_level', 'reserved', 'lgpd_personal'];
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push(
      [
        r.submission_id ?? '',
        r.tradition,
        r.category,
        r.locale,
        r.sacredness_level.toString(),
        r.reserved ? 'true' : 'false',
        'false',
      ]
        .map((c) => `"${c.replace(/"/g, '""')}"`)
        .join(','),
    );
  }
  return lines.join('\n');
}

function renderMarkdown(rows: RedactedPrayer[]): string {
  const lines: string[] = ['# Export — User Prayer Submissions (LGPD Art. 18)', ''];
  for (const r of rows) {
    lines.push(`## ${r.title || r.id} (${r.submission_id})`);
    lines.push('');
    lines.push(`- Tradition: ${r.tradition}`);
    lines.push(`- Category: ${r.category}`);
    lines.push(`- Sacredness: ${r.sacredness_level}`);
    lines.push('');
    lines.push(r.text || '_[reserved]_');
    lines.push('');
    if (r.redaction_notes.length > 0) {
      lines.push(`_Redaction notes: ${r.redaction_notes.join('; ')}_`);
    }
  }
  return lines.join('\n');
}

/**
 * LGPD Art. 18 deletion: hard-delete every submission row that belongs
 * to this user. Returns a deletion receipt suitable for audit.
 */
export function deleteUserSubmissions(userId: string): DeletionReceipt {
  const matched_ids: string[] = [];
  for (const [id, s] of _SUBMISSIONS) {
    if (s.consent.user_id === userId) {
      matched_ids.push(id);
    }
  }
  for (const id of matched_ids) {
    _SUBMISSIONS.delete(id);
  }
  return {
    user_id: userId,
    deleted_count: matched_ids.length,
    deleted_submission_ids: matched_ids,
    receipt_at_iso: new Date().toISOString(),
    verified: true,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// §12  ATTRIBUTION & RESPECTFUL USE
// ─────────────────────────────────────────────────────────────────────────────

export interface RespectfulUseChecklistInput {
  readonly presentation_context:
    | 'chatbot'
    | 'reflection_card'
    | 'audio_synthesis'
    | 'community_share'
    | 'print_material';
  readonly translation_present: boolean;
  readonly attribution_visible: boolean;
  readonly audio_recital_out_of_context: boolean;
  readonly magic_spell_framing: boolean;
  readonly consent_recorded?: boolean;
}

export function respectfulUseChecklist(
  p: Prayer,
  input: RespectfulUseChecklistInput,
): RespectfulUseVerdict {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Sacredness >= 4 must always carry a visible attribution.
  if (p.sacredness_level >= 4 && !input.attribution_visible) {
    issues.push('Sacredness>=4 requires visible attribution in the presentation context.');
  }
  // Sacredness 5 (initiation-gated) requires opt-in consent recorded.
  if (p.sacredness_level === 5 && input.consent_recorded !== true) {
    issues.push('Sacredness=5 requires explicit consent_recorded=true.');
  }
  if (p.reserved && input.translation_present) {
    issues.push('Reserved slots must NOT carry a translation — only metadata is curatable.');
  }
  if (input.magic_spell_framing) {
    issues.push(
      '"magic spell framing" is incompatible with respectful presentation across all traditions.',
    );
    recommendations.push('re-frame as reflection or devotional reading; avoid command-form language.');
  }
  if (input.audio_recital_out_of_context && p.sacredness_level >= 3) {
    issues.push(
      `Sacredness=${p.sacredness_level} audio recital out of context may feel reductive.`,
    );
    recommendations.push('allow auto-recital only for sacredness<=2 OR explicit opt-in per row.');
  }
  if (
    p.sacredness_level >= 4 &&
    input.presentation_context === 'community_share' &&
    !input.attribution_visible
  ) {
    recommendations.push('community_share of sacredness>=4 should default to initials-only preview.');
  }
  if (p.text.length === 0 && !p.reserved) {
    issues.push('non-reserved prayer has empty text body');
  }

  return {
    id: p.id,
    passes: issues.length === 0,
    sacredness_level: p.sacredness_level,
    issues,
    recommendations,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// §13  UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract a short key phrase (default 3 words) from a prayer's text.
 * Reserved rows return the title as the key phrase.
 */
export function extractKeyPhrase(prayer: Prayer, words: number = 3): string {
  if (!(Number.isFinite(words) && words >= 1)) throw new Error('words must be >= 1');
  const source = prayer.reserved ? prayer.title : prayer.text;
  const tokens = source.replace(/\s+/g, ' ').trim().split(' ');
  return tokens.slice(0, words).join(' ');
}

const AVERAGE_WPM: Readonly<Record<LocaleId, number>> = {
  'pt-BR': 165,
  'en-US': 165,
  'es-ES': 175,
};

/**
 * Estimate the spoken duration of a prayer's text, in seconds, assuming
 * the locale's average spoken WPM. Reserved rows return 0.
 */
export function computePrayerDurationSec(
  text: string,
  locale: LocaleId,
): number {
  assertLocaleId(locale);
  if (text.trim().length === 0) return 0;
  const words = text.trim().split(/\s+/).length;
  const wpm = AVERAGE_WPM[locale];
  return Math.round((words / wpm) * 60);
}

/**
 * Given the traditions a user has signalled affinity for, return an
 * ordered list of traditions present in the corpus (matches the user's
 * preferences first, then every distinct tradition listed in PRAYERS
 * that wasn't matched, ordered by corpus presence count descending).
 */
export function matchUserTradition(
  userProfileTraditions: readonly string[],
  corpusTraditions: readonly Tradition[] = (Object.keys(TRADITION_DISPLAY_NAMES) as Tradition[]),
): readonly Tradition[] {
  const matchedSet = new Set<Tradition>();
  for (const candidate of corpusTraditions) {
    if (userProfileTraditions.includes(candidate)) {
      matchedSet.add(candidate);
    }
  }
  const ordered: Tradition[] = [];
  for (const c of corpusTraditions) {
    if (matchedSet.has(c)) ordered.push(c);
  }
  for (const c of corpusTraditions) {
    if (!matchedSet.has(c)) ordered.push(c);
  }
  return ordered;
}

// ─────────────────────────────────────────────────────────────────────────────
// §14  CURATED ROTATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Three slots for a "good morning" themed rotation. Used by
 * w47/daily-reflection-prompt to seed reflection_card_1.
 */
export const MORNING_ROTATION: readonly string[] = [
  'buddhism-refuge-three-jewels-pt',
  'secular-heart-coherence-morning-pt',
  'christianity-lords-prayer-pt',
] as const;

/**
 * Three slots for a "good evening" themed rotation. Used by
 * w47/daily-reflection-prompt to seed reflection_card_2.
 */
export const EVENING_ROTATION: readonly string[] = [
  'secular-impermanence-evening-pt',
  'syncretic-iemanja-mar-pt',
  'taoism-wei-wu-wei-grounding-pt',
] as const;

/**
 * Three slots for a "weekly highlight" set — drawn Monday morning so the
 * week has a curated anchor for the reflection digest.
 */
export const WEEKLY_HIGHLIGHTS: readonly {
  day: 'monday' | 'wednesday' | 'friday';
  prayer_id: string;
  memo: string;
}[] = [
  { day: 'monday', prayer_id: 'judaism-modeh-ani-morning-pt', memo: 'arranque da semana' },
  {
    day: 'wednesday',
    prayer_id: 'buddhism-metta-lovingkindness-excerpt-pt',
    memo: 'meio da semana, bondade amorosa',
  },
  {
    day: 'friday',
    prayer_id: 'islam-morning-dua-gratitude-pt',
    memo: 'gratidão e intenção antes do fim da semana',
  },
] as const;

/**
 * Selected prayers for new moon (ancestral/lunar openings) and full moon
 * (intensified devotional); curated list of ids only. Reserved rows are
 * intentionally referenced as placeholders + comment, NEVER auto-rendered.
 */
export const LUNAR_PHASE_PRAYERS: readonly LunarPhasePrayerPick[] = [
  {
    phase: 'new',
    prayer_ids: ['secular-impermanence-evening-pt', 'taoism-tai-chi-chu-yen-meditation-pt'],
    explanation:
      'Lua nova: meditação de impermanência, leitura silenciosa — só se reservar a "lua nova" indígena via curadoria.',
  },
  {
    phase: 'waxing_crescent',
    prayer_ids: ['secular-heart-coherence-morning-pt', 'hinduism-surya-salutation-gratitude-pt'],
    explanation: 'Crescente: intenção + gratidão, leitura curta.',
  },
  {
    phase: 'full',
    prayer_ids: [
      'buddhism-metta-lovingkindness-excerpt-pt',
      'syncretic-iemanja-mar-pt',
      'islam-morning-dua-gratitude-pt',
    ],
    explanation: 'Cheia: bondade amorosa + oferta do mar + petição de manhã.',
  },
  {
    phase: 'waning_crescent',
    prayer_ids: ['secular-impermanence-evening-pt', 'taoism-wei-wu-wei-grounding-pt'],
    explanation: 'Minguante: aterramento e reconhecimento da impermanência.',
  },
] as const;

/**
 * Selected prayers for solar crossings (equinox + solstice). Symmetry
 * with LUNAR_PHASE_PRAYERS; effect used by w47/daily-reflection-prompt
 * for the digest header text.
 */
export const SOLAR_CROSSING_PRAYERS: readonly SolarCrossingPrayerPick[] = [
  {
    crossing: 'equinox_spring',
    prayer_ids: ['secular-heart-coherence-morning-pt', 'hinduism-surya-salutation-gratitude-pt'],
    explanation: 'Equinócio da primavera: salutations to the sun, heart-centred breath.',
  },
  {
    crossing: 'solstice_summer',
    prayer_ids: ['buddhism-metta-lovingkindness-excerpt-pt', 'taoism-tai-chi-chu-yen-meditation-pt'],
    explanation: 'Solstício de verão: loving-kindness full-open + Taoist meditation on the supreme ultimate.',
  },
  {
    crossing: 'equinox_autumn',
    prayer_ids: ['secular-impermanence-evening-pt', 'judaism-modeh-ani-morning-pt'],
    explanation: 'Equinócio do outono: gratitude + recognition of change.',
  },
  {
    crossing: 'solstice_winter',
    prayer_ids: [
      'syncretic-oxala-pai-nosso-pt',
      'christianity-lords-prayer-pt',
      'judaism-shema-morning-pt',
    ],
    explanation: 'Solstício de inverno: syncretic Oxalá + Lords Prayer + Shemá — round table devotions.',
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// §15  PUBLIC SUMMARY
// ─────────────────────────────────────────────────────────────────────────────

export interface CorpusSummary {
  readonly prayer_count: number;
  readonly reserved_count: number;
  readonly tradition_count: number;
  readonly locale_count: number;
  readonly category_count: number;
  readonly traditions: readonly Tradition[];
  readonly locales: readonly LocaleId[];
  readonly categories: readonly PrayerCategory[];
}

export function summariseCorpus(): CorpusSummary {
  const all = PrayerCorpus.listAll();
  const tradSet = new Set<Tradition>();
  const locSet = new Set<LocaleId>();
  const catSet = new Set<PrayerCategory>();
  let reserved = 0;
  for (const p of all) {
    tradSet.add(p.tradition);
    locSet.add(p.locale);
    catSet.add(p.category);
    if (p.reserved) reserved += 1;
  }
  return {
    prayer_count: all.length,
    reserved_count: reserved,
    tradition_count: tradSet.size,
    locale_count: locSet.size,
    category_count: catSet.size,
    traditions: [...tradSet].sort(),
    locales: [...locSet].sort(),
    categories: [...catSet].sort(),
  };
}
