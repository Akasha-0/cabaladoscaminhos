// ============================================================================
// ONBOARDING WIZARD — Wave 44 (2026-06-29)
// ============================================================================
// State machine first-run: welcome → traditions → intent → suggestions → profile.
// Pure TS, sem JSX, sem deps. Estado serializável (LocalStorage / Supabase draft).
// LGPD (Lei 13.709/2018): passo 'profile' exige consentimento (Art. 7º, I).
// Mobile-first: helpers headless; UI upstream cuida do layout.
// ============================================================================

// SECTION 1 — Tradition enum + labels + family

/** 16 tradições suportadas; ordem reflete demanda típica do público BR.
 * @example
 * const t: Tradition = Tradition.CANDOMBLE;
 * t === Tradition.CANDOMBLE; // true
 */
export enum Tradition {
  CANDOMBLE = 'CANDOMBLE',           UMBANDA = 'UMBANDA',
  IFA = 'IFA',                       CABALA = 'CABALA',
  ASTROLOGIA = 'ASTROLOGIA',         TANTRA = 'TANTRA',
  AYURVEDA = 'AYURVEDA',             DRUIDISMO = 'DRUIDISMO',
  WICCA = 'WICCA',                   TAOISMO = 'TAOISMO',
  BUDISMO = 'BUDISMO',               HINDUISMO = 'HINDUISMO',
  XAMANISMO = 'XAMANISMO',           SUFISMO = 'SUFISMO',
  CRISTIANISMO_MISTICO = 'CRISTIANISMO_MISTICO',
  ESPIRITISMO = 'ESPIRITISMO',
}

/** Ordem canônica de exibição das tradições na UI.
 * @example
 * for (const t of ALL_TRADITIONS) console.log(t, TRADITION_LABELS[t]);
 */
export const ALL_TRADITIONS: ReadonlyArray<Tradition> = Object.freeze([
  Tradition.CANDOMBLE, Tradition.UMBANDA, Tradition.IFA, Tradition.CABALA,
  Tradition.ASTROLOGIA, Tradition.TANTRA, Tradition.AYURVEDA, Tradition.DRUIDISMO,
  Tradition.WICCA, Tradition.TAOISMO, Tradition.BUDISMO, Tradition.HINDUISMO,
  Tradition.XAMANISMO, Tradition.SUFISMO, Tradition.CRISTIANISMO_MISTICO, Tradition.ESPIRITISMO,
]);

/** Labels pt-BR exibidos na UI.
 * @example
 * TRADITION_LABELS[Tradition.CANDOMBLE]; // "Candomblé"
 */
export const TRADITION_LABELS: Readonly<Record<Tradition, string>> = Object.freeze({
  [Tradition.CANDOMBLE]: 'Candomblé',            [Tradition.UMBANDA]: 'Umbanda',
  [Tradition.IFA]: 'Ifá',                        [Tradition.CABALA]: 'Cabala',
  [Tradition.ASTROLOGIA]: 'Astrologia',          [Tradition.TANTRA]: 'Tantra',
  [Tradition.AYURVEDA]: 'Ayurveda',              [Tradition.DRUIDISMO]: 'Druidismo',
  [Tradition.WICCA]: 'Wicca',                    [Tradition.TAOISMO]: 'Taoismo',
  [Tradition.BUDISMO]: 'Budismo',                [Tradition.HINDUISMO]: 'Hinduismo',
  [Tradition.XAMANISMO]: 'Xamanismo',            [Tradition.SUFISMO]: 'Sufismo',
  [Tradition.CRISTIANISMO_MISTICO]: 'Cristianismo Místico',
  [Tradition.ESPIRITISMO]: 'Espiritismo',
});

/** Família agregadora — diversifica sugestões. */
export type TraditionFamily = 'AFRO_BRASILEIRA' | 'ORIENTAL' | 'MISTICA_OCIDENTAL';

export const TRADITION_FAMILY: Readonly<Record<Tradition, TraditionFamily>> = Object.freeze({
  [Tradition.CANDOMBLE]: 'AFRO_BRASILEIRA',  [Tradition.UMBANDA]: 'AFRO_BRASILEIRA',
  [Tradition.IFA]: 'AFRO_BRASILEIRA',
  [Tradition.CABALA]: 'MISTICA_OCIDENTAL',   [Tradition.ASTROLOGIA]: 'MISTICA_OCIDENTAL',
  [Tradition.DRUIDISMO]: 'MISTICA_OCIDENTAL',[Tradition.WICCA]: 'MISTICA_OCIDENTAL',
  [Tradition.XAMANISMO]: 'MISTICA_OCIDENTAL',[Tradition.CRISTIANISMO_MISTICO]: 'MISTICA_OCIDENTAL',
  [Tradition.ESPIRITISMO]: 'MISTICA_OCIDENTAL',
  [Tradition.TANTRA]: 'ORIENTAL',            [Tradition.AYURVEDA]: 'ORIENTAL',
  [Tradition.TAOISMO]: 'ORIENTAL',           [Tradition.BUDISMO]: 'ORIENTAL',
  [Tradition.HINDUISMO]: 'ORIENTAL',         [Tradition.SUFISMO]: 'ORIENTAL',
});

// SECTION 2 — Intent + Step + constants

/** Intenção primária do novo usuário na plataforma.
 * @example
 * const i: Intent = Intent.SEEK_GUIDANCE;
 */
export enum Intent {
  LEARN = 'LEARN', CONNECT = 'CONNECT', SHARE = 'SHARE',
  SEEK_GUIDANCE = 'SEEK_GUIDANCE', MULTIPLE = 'MULTIPLE',
}

export const ALL_INTENTS: ReadonlyArray<Intent> = Object.freeze([
  Intent.LEARN, Intent.CONNECT, Intent.SHARE, Intent.SEEK_GUIDANCE, Intent.MULTIPLE,
]);

export const INTENT_LABELS: Readonly<Record<Intent, string>> = Object.freeze({
  [Intent.LEARN]: 'Aprender',                [Intent.CONNECT]: 'Conectar',
  [Intent.SHARE]: 'Compartilhar',            [Intent.SEEK_GUIDANCE]: 'Buscar orientação',
  [Intent.MULTIPLE]: 'Múltiplas',
});

/** Identificador canônico de cada passo do wizard. */
export type Step = 'welcome' | 'traditions' | 'intent' | 'suggestions' | 'profile';

/** Ordem dos passos — índice = posição no fluxo. */
export const STEP_ORDER: ReadonlyArray<Step> = Object.freeze([
  'welcome', 'traditions', 'intent', 'suggestions', 'profile',
] as const);

/** Labels exibidos no stepper. */
export const STEP_LABELS: Readonly<Record<Step, string>> = Object.freeze({
  welcome: 'Bem-vindo',  traditions: 'Tradições',
  intent: 'Intenção',    suggestions: 'Sugestões',
  profile: 'Perfil',
});

/** Versão do schema do wizard — bump quando quebrar compat. */
export const WIZARD_VERSION = '1.0.0';

/** Versão do termo LGPD exigida pelo estado atual. */
export const LGPD_VERSION = '2026-06-01';

/** Limites de campos textuais por passo. */
export const FIELD_LIMITS = Object.freeze({
  displayNameMin: 2, displayNameMax: 60,
  handleMin: 3, handleMax: 20,
  bioMin: 0, bioMax: 280,
  traditionsMin: 1, traditionsMax: 8,
  suggestionsMin: 5, suggestionsMax: 10,
});

// SECTION 3 — WizardState shape (subestados tipados por passo)

export interface WelcomeData {
  displayName: string;
  handle: string;
  avatarUrl: string | null;
}

export interface TraditionsData {
  selected: ReadonlyArray<Tradition>;
}

export interface IntentData {
  selected: Intent | null;
}

export interface SuggestionsData {
  /** IDs avaliados durante o passo. */
  considered: ReadonlyArray<string>;
  /** IDs que o usuário confirmou seguir. */
  followed: ReadonlyArray<string>;
  /** true quando o usuário optou por pular. */
  skipped: boolean;
}

export interface ProfileData {
  bio: string;
  language: string;     // BCP-47 — ex: 'pt-BR'
  timezone: string;     // IANA   — ex: 'America/Sao_Paulo'
  notificationsOptIn: boolean;
  lgpdConsent: boolean;
  lgpdConsentVersion: string;
}

/** Estado completo do wizard — totalmente serializável. */
export interface WizardState {
  wizardVersion: string;
  currentStep: Step | null;
  completed: boolean;
  startedAt: string | null;
  completedAt: string | null;
  data: {
    welcome: WelcomeData;
    traditions: TraditionsData;
    intent: IntentData;
    suggestions: SuggestionsData;
    profile: ProfileData;
  };
  /** Erros do passo atual — limpos entre transições. */
  errors: Readonly<Record<string, string>>;
}

/** Estado inicial limpo.
 * @example
 * const s = makeInitialState();
 * s.currentStep; // null
 */
export function makeInitialState(): WizardState {
  return {
    wizardVersion: WIZARD_VERSION,
    currentStep: null,
    completed: false,
    startedAt: null,
    completedAt: null,
    data: {
      welcome: { displayName: '', handle: '', avatarUrl: null },
      traditions: { selected: [] },
      intent: { selected: null },
      suggestions: { considered: [], followed: [], skipped: false },
      profile: {
        bio: '',
        language: 'pt-BR',
        timezone: 'America/Sao_Paulo',
        notificationsOptIn: false,
        lgpdConsent: false,
        lgpdConsentVersion: '',
      },
    },
    errors: {},
  };
}

// SECTION 4 — Pure validators

/** Validação RFC-light de e-mail.
 * @example
 * isValidEmail('maria@caminhos.app'); // true
 * isValidEmail('maria@@caminhos');    // false
 */
export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length < 3 || trimmed.length > 254) return false;
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(trimmed);
}

/** Normaliza handle removendo '@', trim, lowercase.
 * @example
 * normalizeHandle('  @Maria.Santos '); // 'maria.santos'
 */
export function normalizeHandle(raw: string): string {
  if (typeof raw !== 'string') return '';
  let h = raw.trim();
  if (h.startsWith('@')) h = h.slice(1);
  return h.toLowerCase();
}

/** Handle = [a-z0-9_.], 3..20 chars, sem '.', '_' nas pontas, sem '..'.
 * @example
 * isValidHandle('maria.santos'); // true
 * isValidHandle('m_');           // false (curto demais)
 */
export function isValidHandle(handle: string): boolean {
  const h = normalizeHandle(handle);
  if (h.length < FIELD_LIMITS.handleMin || h.length > FIELD_LIMITS.handleMax) return false;
  if (!/^[a-z0-9._]+$/.test(h)) return false;
  if (h.startsWith('.') || h.endsWith('.')) return false;
  if (h.startsWith('_') || h.endsWith('_')) return false;
  if (h.includes('..')) return false;
  const reserved = new Set(['admin', 'root', 'system', 'support', 'mod', 'staff', 'bot']);
  return !reserved.has(h);
}

/** Timezone IANA ou 'UTC±HH:MM' simplificado.
 * @example
 * isValidTimezone('America/Sao_Paulo'); // true
 * isValidTimezone('Brazil/SaoPaulo');   // false (não canônico)
 */
export function isValidTimezone(tz: string): boolean {
  if (typeof tz !== 'string' || tz.length === 0) return false;
  if (/^[A-Za-z][A-Za-z0-9_]*\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)?$/.test(tz)) return true;
  if (/^(?:UTC|GMT)$/i.test(tz)) return true;
  return /^UTC[+-]\d{1,2}(?::\d{2})?$/i.test(tz);
}

// SECTION 5 — ValidationResult + per-step validators

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

function ok(): ValidationResult { return { valid: true, errors: {} }; }
function fail(errors: Record<string, string>): ValidationResult { return { valid: false, errors }; }

function validateDisplayName(name: string): void {
  const t = typeof name === 'string' ? name.trim() : '';
  if (t.length < FIELD_LIMITS.displayNameMin || t.length > FIELD_LIMITS.displayNameMax) {
    throw new Error(`displayName`);
  }
}

function validateAvatarUrl(url: string | null): boolean {
  if (url === null) return true;
  return /^https:\/\/[^\s]{8,512}$/.test(url);
}

function validateLanguage(lang: string): boolean {
  return /^[a-z]{2,3}(-[A-Z]{2})?$/.test(lang);
}

/** Valida WelcomeData.
 * @example
 * const r = validateWelcome({ displayName: 'Maria', handle: 'maria', avatarUrl: null });
 * r.valid; // true
 */
export function validateWelcome(data: WelcomeData): ValidationResult {
  const errs: Record<string, string> = {};
  try { validateDisplayName(data.displayName); }
  catch { errs.displayName = `Nome deve ter entre ${FIELD_LIMITS.displayNameMin} e ${FIELD_LIMITS.displayNameMax} caracteres.`; }
  if (!isValidHandle(data.handle)) {
    errs.handle = "Handle inválido (use letras, números, '_' ou '.'; 3-20 caracteres).";
  }
  if (!validateAvatarUrl(data.avatarUrl)) {
    errs.avatarUrl = 'Avatar precisa ser uma URL https válida ou ficar em branco.';
  }
  return Object.keys(errs).length === 0 ? ok() : fail(errs);
}

/** Valida TraditionsData — 1..8, sem duplicatas.
 * @example
 * const r = validateTraditions({ selected: [Tradition.CANDOMBLE] });
 * r.valid; // true
 */
export function validateTraditions(data: TraditionsData): ValidationResult {
  const sel = data.selected;
  if (sel.length < FIELD_LIMITS.traditionsMin) {
    return fail({ selected: `Escolha ao menos ${FIELD_LIMITS.traditionsMin} tradição.` });
  }
  if (sel.length > FIELD_LIMITS.traditionsMax) {
    return fail({ selected: `Escolha no máximo ${FIELD_LIMITS.traditionsMax} tradições.` });
  }
  const seen = new Set<string>();
  for (const t of sel) {
    if (!(t in Tradition)) return fail({ selected: `Tradição desconhecida: ${t}` });
    seen.add(t);
  }
  if (seen.size !== sel.length) return fail({ selected: 'Tradições duplicadas.' });
  return ok();
}

/** Valida IntentData — uma intenção obrigatória.
 * @example
 * const r = validateIntent({ selected: Intent.SHARE });
 * r.valid; // true
 */
export function validateIntent(data: IntentData): ValidationResult {
  if (data.selected === null) return fail({ selected: 'Selecione sua intenção principal.' });
  if (!ALL_INTENTS.includes(data.selected)) {
    return fail({ selected: `Intenção desconhecida: ${data.selected}` });
  }
  return ok();
}

/** Valida SuggestionsData.
 * @example
 * const r = validateSuggestions({ considered: ['sg_1','sg_2','sg_3','sg_4','sg_5'], followed: [], skipped: false });
 * r.valid; // true
 */
export function validateSuggestions(data: SuggestionsData): ValidationResult {
  const consideredLen = data.considered.length;
  if (consideredLen < FIELD_LIMITS.suggestionsMin && !data.skipped) {
    return fail({ considered: 'Aguarde a curadoria sugerir ao menos 5 perfis.' });
  }
  if (consideredLen > FIELD_LIMITS.suggestionsMax) {
    return fail({ considered: `No máximo ${FIELD_LIMITS.suggestionsMax} perfis por passo.` });
  }
  const consideredSet = new Set(data.considered);
  for (const id of data.followed) {
    if (!consideredSet.has(id)) {
      return fail({ followed: `Perfil seguido (${id}) não estava entre as sugestões.` });
    }
  }
  return ok();
}

/** Valida ProfileData — bio, idioma, timezone, LGPD.
 * @example
 * const r = validateProfile({ bio: '', language: 'pt-BR', timezone: 'America/Sao_Paulo', notificationsOptIn: false, lgpdConsent: true, lgpdConsentVersion: '2026-06-01' });
 * r.valid; // true
 */

export function validateProfile(data: ProfileData): ValidationResult {
  const errs: Record<string, string> = {};
  const bio = typeof data.bio === 'string' ? data.bio.trim() : '';
  if (bio.length < FIELD_LIMITS.bioMin || bio.length > FIELD_LIMITS.bioMax) {
    errs.bio = `Bio deve ter até ${FIELD_LIMITS.bioMax} caracteres.`;
  }
  if (!validateLanguage(data.language)) {
    errs.language = 'Idioma precisa estar no formato BCP-47 (ex.: pt-BR).';
  }
  if (!isValidTimezone(data.timezone)) {
    errs.timezone = 'Timezone inválido (use IANA, ex.: America/Sao_Paulo).';
  }
  if (data.lgpdConsent !== true) errs.lgpdConsent = 'É necessário aceitar o termo LGPD para concluir.';
  if (data.lgpdConsentVersion !== LGPD_VERSION) {
    errs.lgpdConsentVersion = `Consentimento precisa estar na versão ${LGPD_VERSION}.`;
  }
  if (data.notificationsOptIn && !data.lgpdConsent) {
    errs.notificationsOptIn = 'Para receber notificações, aceite o termo LGPD.';
  }
  return Object.keys(errs).length === 0 ? ok() : fail(errs);
}

/** Mapa de validators por passo.
 * @example
 * stepValidators['welcome'](state); // ValidationResult
 */
export const stepValidators: Readonly<Record<Step, (s: WizardState) => ValidationResult>> =
  Object.freeze({
    welcome: (s) => validateWelcome(s.data.welcome),
    traditions: (s) => validateTraditions(s.data.traditions),
    intent: (s) => validateIntent(s.data.intent),
    suggestions: (s) => validateSuggestions(s.data.suggestions),
    profile: (s) => validateProfile(s.data.profile),
  });

// SECTION 6 — Skip policy + LGPD consent + Progress

/** Define quais passos podem ser pulados (welcome/traditions/profile: não; intent/suggestions: sim).
 * @example
 * canSkipStep('welcome'); // false
 * canSkipStep('intent');  // true
 */
export function canSkipStep(step: Step): boolean {
  switch (step) {
    case 'intent':
    case 'suggestions':
      return true;
    case 'welcome':
    case 'traditions':
    case 'profile':
      return false;
    default: {
      const _never: never = step;
      void _never;
      return false;
    }
  }
}

/** Decide se o consentimento LGPD precisa ser renovado.
 * @example
 * const s = makeInitialState();
 * lgpdConsentRequired(s); // true (consent=false)
 */
export function lgpdConsentRequired(state: WizardState): boolean {
  const p = state.data.profile;
  if (!p.lgpdConsent) return true;
  if (!p.lgpdConsentVersion) return true;
  return p.lgpdConsentVersion !== LGPD_VERSION;
}

/** Progresso do wizard em 0..1.
 * @example
 * const p = computeProgress({ ...makeInitialState(), currentStep: 'suggestions' });
 * p.ratio; // 0.6 (3/5 passos alcançados)
 */
export interface ProgressInfo {
  completed: number;
  total: number;
  ratio: number;     // 0..1
  percent: number;   // 0..100 inteiro
}

export function computeProgress(state: WizardState): ProgressInfo {
  const total = STEP_ORDER.length;
  if (state.completed) return { completed: total, total, ratio: 1, percent: 100 };
  const idx = state.currentStep ? STEP_ORDER.indexOf(state.currentStep) : 0;
  const done = Math.max(0, idx);
  return {
    completed: done,
    total,
    ratio: done / total,
    percent: Math.round((done / total) * 100),
  };
}

// SECTION 7 — Deterministic suggestion engine

/** FNV-1a 32-bit — deriva uma seed de strings.
 * @example
 * hashSeed('candomble', 'connect'); // uint32
 */
export function hashSeed(...parts: ReadonlyArray<string>): number {
  let h = 2166136261;
  for (const part of parts) {
    for (let i = 0; i < part.length; i++) {
      h ^= part.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    h ^= 0x5f;
  }
  return h >>> 0;
}

/** Mulberry32 PRNG. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next(): number {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Snapshot sintético de um usuário recomendado. */
export interface SuggestedUser {
  id: string;
  handle: string;
  displayName: string;
  primaryTradition: Tradition;
  secondaryTraditions: ReadonlyArray<Tradition>;
  intent: Intent;
  score: number;
  reason: string;
}

/** Catálogo curado — 18 perfis cobrindo as 3 famílias. */
export const SUGGESTED_CATALOG: ReadonlyArray<{
  handle: string;
  displayName: string;
  primaryTradition: Tradition;
  secondaryTraditions: ReadonlyArray<Tradition>;
  intent: Intent;
}> = Object.freeze([
  // Afro-brasileira
  { handle: 'mae-oba',         displayName: 'Mãe Obá',            primaryTradition: Tradition.CANDOMBLE,  secondaryTraditions: [Tradition.UMBANDA, Tradition.IFA],            intent: Intent.SEEK_GUIDANCE },
  { handle: 'peregrino-ifa',   displayName: 'Peregrino de Ifá',    primaryTradition: Tradition.IFA,        secondaryTraditions: [Tradition.CANDOMBLE],                          intent: Intent.LEARN },
  { handle: 'ogum-yara',       displayName: 'Ogum Yara',           primaryTradition: Tradition.UMBANDA,    secondaryTraditions: [Tradition.CANDOMBLE],                          intent: Intent.CONNECT },
  { handle: 'iyalorixa',       displayName: 'Ialorixá Cristina',   primaryTradition: Tradition.CANDOMBLE,  secondaryTraditions: [Tradition.ESPIRITISMO],                        intent: Intent.SHARE },
  // Oriental
  { handle: 'monge-amithaba',  displayName: 'Monge Amitabha',      primaryTradition: Tradition.BUDISMO,    secondaryTraditions: [Tradition.TAOISMO, Tradition.HINDUISMO],       intent: Intent.LEARN },
  { handle: 'taoista-jardim',  displayName: 'Liu Wei',             primaryTradition: Tradition.TAOISMO,    secondaryTraditions: [Tradition.BUDISMO],                            intent: Intent.LEARN },
  { handle: 'pundit-raman',    displayName: 'Pundit Raman',        primaryTradition: Tradition.HINDUISMO,  secondaryTraditions: [Tradition.AYURVEDA, Tradition.TANTRA],        intent: Intent.SEEK_GUIDANCE },
  { handle: 'vaidya-nair',     displayName: 'Vaidya Nair',         primaryTradition: Tradition.AYURVEDA,   secondaryTraditions: [Tradition.HINDUISMO],                          intent: Intent.LEARN },
  { handle: 'tantrika-leve',   displayName: 'Leve Tantrika',       primaryTradition: Tradition.TANTRA,     secondaryTraditions: [Tradition.HINDUISMO],                          intent: Intent.SEEK_GUIDANCE },
  { handle: 'derviche-khorasan', displayName: 'Derviche Khorasan', primaryTradition: Tradition.SUFISMO,    secondaryTraditions: [Tradition.BUDISMO],                            intent: Intent.SEEK_GUIDANCE },
  // Mística ocidental
  { handle: 'cabalista-jardins', displayName: 'Cabalista Jardins', primaryTradition: Tradition.CABALA,    secondaryTraditions: [Tradition.ASTROLOGIA],                         intent: Intent.SEEK_GUIDANCE },
  { handle: 'astrologo-icarus',  displayName: 'Astrólogo Icarus',  primaryTradition: Tradition.ASTROLOGIA, secondaryTraditions: [Tradition.CABALA],                             intent: Intent.LEARN },
  { handle: 'druida-carvalho',   displayName: 'Druida Carvalho',   primaryTradition: Tradition.DRUIDISMO,  secondaryTraditions: [Tradition.WICCA, Tradition.XAMANISMO],         intent: Intent.CONNECT },
  { handle: 'bruxa-sabbat',      displayName: 'Bruxa do Sabbat',   primaryTradition: Tradition.WICCA,      secondaryTraditions: [Tradition.XAMANISMO],                          intent: Intent.SHARE },
  { handle: 'xama-amazonia',     displayName: 'Xamã da Amazônia',  primaryTradition: Tradition.XAMANISMO,  secondaryTraditions: [Tradition.DRUIDISMO, Tradition.CANDOMBLE],     intent: Intent.SEEK_GUIDANCE },
  { handle: 'mestre-tomas',      displayName: 'Mestre Tomás',      primaryTradition: Tradition.CRISTIANISMO_MISTICO, secondaryTraditions: [Tradition.CABALA],                  intent: Intent.SEEK_GUIDANCE },
  { handle: 'medium-beira-rio',  displayName: 'Medium Beira-Rio',  primaryTradition: Tradition.ESPIRITISMO, secondaryTraditions: [Tradition.UMBANDA],                            intent: Intent.SEEK_GUIDANCE },
  { handle: 'estudiosa-lenormand', displayName: 'Estudiosa do Cigano', primaryTradition: Tradition.ESPIRITISMO, secondaryTraditions: [Tradition.WICCA, Tradition.CABALA],         intent: Intent.LEARN },
]);

/** Pesos do scoring — público para testes/diagnóstico. */
export const SUGGESTION_WEIGHTS = Object.freeze({
  primaryTraditionMatch: 5,
  secondaryTraditionMatch: 2,
  intentMatch: 2,
  familyMatch: 1,
  rareFamilyBonus: 0.5,
});

function buildSuggestionReason(
  u: { handle: string; primaryTradition: Tradition },
  traditions: ReadonlyArray<Tradition>,
  intent: Intent | null,
): string {
  const label = TRADITION_LABELS[u.primaryTradition];
  if (traditions.includes(u.primaryTradition)) {
    if (intent === Intent.SEEK_GUIDANCE) return `Praticante de ${label} focado em orientação.`;
    if (intent === Intent.SHARE)       return `Compartilha conteúdo de ${label} há anos.`;
    if (intent === Intent.CONNECT)     return `Facilita conexões dentro de ${label}.`;
    return `Tradição principal: ${label}.`;
  }
  return `Afinidade por ${label} — pode ampliar sua jornada.`;
}

/** Rancking determinístico + diversificado. Pesos: primaryTraditionMatch +5 / secondaryTraditionMatch +2 / intentMatch +2 / familyMatch +1 / rareFamilyBonus +0.5. Empates por mulberry32 semeado por hashSeed (reprodutível).
 * @example
 * const sug = getSuggestions([Tradition.CANDOMBLE], Intent.SHARE, 6); sug.length; // 5..6
 * sug[0].primaryTradition === Tradition.CANDOMBLE;
 */
export function getSuggestions(
  traditions: ReadonlyArray<Tradition>,
  intent: Intent | null,
  limit: number = 7,
): ReadonlyArray<SuggestedUser> {
  if (traditions.length === 0) return [];
  const targetCap = Math.max(
    FIELD_LIMITS.suggestionsMin,
    Math.min(FIELD_LIMITS.suggestionsMax, limit),
  );

  const traditionSet = new Set<string>(traditions);
  const familySet = new Set<TraditionFamily>();
  for (const t of traditions) familySet.add(TRADITION_FAMILY[t]);
  const effectiveIntent = intent ?? Intent.MULTIPLE;
  const wantsGuidance = effectiveIntent === Intent.SEEK_GUIDANCE;

  const seed = hashSeed(
    [...traditionSet].sort().join(','),
    effectiveIntent,
    String(targetCap),
  );
  const rand = mulberry32(seed);

  type Scored = { user: SuggestedUser; score: number; jitter: number };
  const scored: Scored[] = [];
  for (const u of SUGGESTED_CATALOG) {
    let score = 0;
    if (traditionSet.has(u.primaryTradition)) score += SUGGESTION_WEIGHTS.primaryTraditionMatch;
    for (const s of u.secondaryTraditions) {
      if (traditionSet.has(s)) score += SUGGESTION_WEIGHTS.secondaryTraditionMatch;
    }
    if (intent !== null && u.intent === intent) score += SUGGESTION_WEIGHTS.intentMatch;
    if (familySet.has(TRADITION_FAMILY[u.primaryTradition]) && score === 0) {
      score += SUGGESTION_WEIGHTS.familyMatch;
    }
    if (TRADITION_FAMILY[u.primaryTradition] !== 'AFRO_BRASILEIRA') {
      score += SUGGESTION_WEIGHTS.rareFamilyBonus;
    }
    if (wantsGuidance && u.intent === Intent.SEEK_GUIDANCE) score += 0.25;

    const id = `sg_${hashSeed(u.handle, effectiveIntent).toString(36)}`;
    scored.push({
      user: {
        id,
        handle: u.handle,
        displayName: u.displayName,
        primaryTradition: u.primaryTradition,
        secondaryTraditions: u.secondaryTraditions,
        intent: u.intent,
        score,
        reason: buildSuggestionReason(u, traditions, intent),
      },
      score,
      jitter: rand(),
    });
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.jitter - a.jitter;
  });

  // Diversificação: max 2 perfis do mesmo primaryTradition nos top-5
  const seen = new Map<Tradition, number>();
  const picked: SuggestedUser[] = [];
  for (const s of scored) {
    const t = s.user.primaryTradition;
    const seenCount = seen.get(t) ?? 0;
    if (picked.length < 5 && seenCount >= 2) continue;
    picked.push(s.user);
    seen.set(t, seenCount + 1);
    if (picked.length >= targetCap) break;
  }
  // Fallback: se catálogo pequeno, relaxa dedup até atingir suggestionsMin
  if (picked.length < FIELD_LIMITS.suggestionsMin) {
    for (const s of scored) {
      if (picked.find((p) => p.id === s.user.id)) continue;
      picked.push(s.user);
      if (picked.length >= FIELD_LIMITS.suggestionsMin) break;
    }
  }
  return Object.freeze(picked);
}

// SECTION 8 — Wizard class (state machine + serialization)

/** Eventos emitidos pela máquina de estado — útil pra telemetria. */
export type WizardEvent =
  | 'STARTED' | 'NEXT' | 'BACK' | 'JUMP' | 'SKIP'
  | 'RESTORED' | 'COMPLETED' | 'VALIDATION_FAILED';

export interface WizardOptions {
  logger?: { warn: (msg: string) => void; info: (msg: string) => void };
}

/** State machine do wizard. Imutável (use `getState()` para ler). Não chama rede/DB — persistência fica com o caller via `serialize`/`restore`.
 * @example
 * const w = new Wizard(); w.start(); w.setWelcome({ displayName: 'Maria', handle: 'maria', avatarUrl: null }); w.next();
 */
export class Wizard {
  private state: WizardState;
  private readonly logger: WizardOptions['logger'];

  constructor(initial: WizardState | null = null, options: WizardOptions = {}) {
    this.state = initial ? cloneState(initial) : makeInitialState();
    this.logger = options.logger;
  }

  /** Inicia o wizard — define currentStep para o primeiro passo.
   * @example
   * const w = new Wizard();
   * w.start();
   * w.getCurrentStep(); // 'welcome'
   */
  start(): WizardEvent {
    if (this.state.completed) {
      this.warn('start() ignorado: wizard já completado.');
      return 'STARTED';
    }
    if (this.state.currentStep !== null) {
      this.warn('start() chamado duas vezes — currentStep mantido.');
      return 'STARTED';
    }
    this.state = {
      ...this.state,
      currentStep: STEP_ORDER[0],
      startedAt: new Date().toISOString(),
    };
    return 'STARTED';
  }

  /** Avança para o próximo passo (bloqueia se validação falhar).
   * @example
   * w.next(); // WizardEvent
   */
  next(): WizardEvent {
    if (!this.state.currentStep || this.state.completed) {
      this.warn('next() sem start() ou já completado.');
      return 'VALIDATION_FAILED';
    }
    const idx = STEP_ORDER.indexOf(this.state.currentStep);
    const result = stepValidators[this.state.currentStep](this.state);
    if (!result.valid) {
      this.state = { ...this.state, errors: result.errors };
      return 'VALIDATION_FAILED';
    }
    this.state = { ...this.state, errors: {} };
    if (idx === STEP_ORDER.length - 1) return this.complete();
    this.state = { ...this.state, currentStep: STEP_ORDER[idx + 1] };
    return 'NEXT';
  }

  /** Volta um passo — sem exigir validação.
   * @example
   * w.back();
   */
  back(): WizardEvent {
    if (!this.state.currentStep) {
      this.warn('back() sem start() prévio.');
      return 'VALIDATION_FAILED';
    }
    const idx = STEP_ORDER.indexOf(this.state.currentStep);
    if (idx <= 0) {
      this.warn('back() já está no primeiro passo.');
      return 'BACK';
    }
    this.state = { ...this.state, currentStep: STEP_ORDER[idx - 1], errors: {} };
    return 'BACK';
  }

  /** Pula o passo atual — só funciona se canSkipStep(step)===true.
   * Aplica defaults sensatos antes de avançar:
   *   - intent     → Intent.LEARN
   *   - suggestions → skipped=true
   * @example
   * w.skip();
   */
  skip(): WizardEvent {
    if (!this.state.currentStep) {
      this.warn('skip() sem start() prévio.');
      return 'VALIDATION_FAILED';
    }
    const step = this.state.currentStep;
    if (!canSkipStep(step)) {
      this.state = {
        ...this.state,
        errors: { skip: 'Este passo não pode ser pulado.' },
      };
      return 'VALIDATION_FAILED';
    }
    if (step === 'intent') {
      const nextIntent: Intent = this.state.data.intent.selected ?? Intent.LEARN;
      this.state = {
        ...this.state,
        data: { ...this.state.data, intent: { selected: nextIntent } },
      };
    } else if (step === 'suggestions') {
      this.state = {
        ...this.state,
        data: {
          ...this.state.data,
          suggestions: { ...this.state.data.suggestions, skipped: true },
        },
      };
    }
    this.state = { ...this.state, errors: {} };
    return this.next();
  }

  /** Pula para um passo arbitrário. Só permite passos já alcançáveis
   * (anterior ou atual + 1).
   * @example
   * w.jumpTo('intent');
   */
  jumpTo(step: Step): WizardEvent {
    if (!this.state.currentStep) {
      this.warn(`jumpTo(${step}) sem start() prévio.`);
      return 'VALIDATION_FAILED';
    }
    const idx = STEP_ORDER.indexOf(step);
    if (idx === -1) {
      this.warn(`jumpTo() com passo inválido: ${step}`);
      return 'VALIDATION_FAILED';
    }
    const currentIdx = STEP_ORDER.indexOf(this.state.currentStep);
    if (idx > currentIdx + 1) {
      this.warn(`jumpTo(${step}) salta passos não concluídos.`);
      return 'VALIDATION_FAILED';
    }
    this.state = { ...this.state, currentStep: step, errors: {} };
    return 'JUMP';
  }

  /** Conclui o wizard — só permitido a partir de 'profile' válido.
   * @example
   * w.complete();
   */
  complete(): WizardEvent {
    if (this.state.completed) {
      this.warn('complete() já invocado.');
      return 'COMPLETED';
    }
    const check = validateProfile(this.state.data.profile);
    if (!check.valid) {
      this.state = { ...this.state, errors: check.errors };
      return 'VALIDATION_FAILED';
    }
    this.state = {
      ...this.state,
      currentStep: 'profile',
      completed: true,
      completedAt: new Date().toISOString(),
      errors: {},
    };
    this.info('wizard concluído.');
    return 'COMPLETED';
  }

  /** Reinicia o wizard para o estado inicial, perdendo tudo.
   * Se chamado após complete(), emite warning — caller deve confirmar.
   * @example
   * w.restart();
   */
  restart(): WizardEvent {
    if (this.state.completed) {
      this.warn('restart() após complete() — chamadores devem confirmar a intenção.');
    }
    const fresh = makeInitialState();
    this.state = {
      ...fresh,
      currentStep: STEP_ORDER[0],
      startedAt: new Date().toISOString(),
    };
    return 'STARTED';
  }

  // -------- Setters granulares (imutáveis) --------

  /** Atualiza parcial de WelcomeData.
   * @example
   * w.setWelcome({ displayName: 'Maria' });
   */
  setWelcome(partial: Partial<WelcomeData>): boolean {
    if (!partial || typeof partial !== 'object') return false;
    this.state = {
      ...this.state,
      data: { ...this.state.data, welcome: { ...this.state.data.welcome, ...partial } },
    };
    return true;
  }

  /** Substitui lista de tradições.
   * @example
   * w.setTraditions([Tradition.CANDOMBLE, Tradition.IFA]);
   */
  setTraditions(selected: ReadonlyArray<Tradition>): boolean {
    if (!Array.isArray(selected)) return false;
    this.state = {
      ...this.state,
      data: { ...this.state.data, traditions: { selected: [...selected] } },
    };
    return true;
  }

  /** Define intenção atual.
   * @example
   * w.setIntent(Intent.SHARE);
   */
  setIntent(intent: Intent | null): boolean {
    if (intent !== null && !ALL_INTENTS.includes(intent)) return false;
    this.state = {
      ...this.state,
      data: { ...this.state.data, intent: { selected: intent } },
    };
    return true;
  }

  /** Atualiza parcial de SuggestionsData.
   * @example
   * w.setSuggestions({ skipped: true });
   */
  setSuggestions(partial: Partial<SuggestionsData>): boolean {
    if (!partial || typeof partial !== 'object') return false;
    this.state = {
      ...this.state,
      data: { ...this.state.data, suggestions: { ...this.state.data.suggestions, ...partial } },
    };
    return true;
  }

  /** Atualiza parcial de ProfileData.
   * @example
   * w.setProfile({ bio: 'Buscando caminhos da Cabala', lgpdConsent: true });
   */
  setProfile(partial: Partial<ProfileData>): boolean {
    if (!partial || typeof partial !== 'object') return false;
    this.state = {
      ...this.state,
      data: { ...this.state.data, profile: { ...this.state.data.profile, ...partial } },
    };
    return true;
  }

  /** Recalcula sugestões com base em traditions + intent atuais.
   * @example
   * const ranked = w.refreshSuggestions(7);
   * ranked.length; // 5..7
   */
  refreshSuggestions(limit: number = 7): ReadonlyArray<SuggestedUser> {
    const traditions = this.state.data.traditions.selected;
    const intent = this.state.data.intent.selected;
    const ranked = getSuggestions(traditions, intent, limit);
    this.state = {
      ...this.state,
      data: {
        ...this.state.data,
        suggestions: {
          considered: ranked.map((u) => u.id),
          followed: [],
          skipped: false,
        },
      },
    };
    return ranked;
  }

  /** Toggle de follow para um id no passo de sugestões.
   * @example
   * w.toggleSuggestionFollow('sg_abc');
   */
  toggleSuggestionFollow(id: string): boolean {
    const sug = this.state.data.suggestions;
    if (!sug.considered.includes(id)) return false;
    const followed = sug.followed.includes(id)
      ? sug.followed.filter((x) => x !== id)
      : [...sug.followed, id];
    this.state = {
      ...this.state,
      data: { ...this.state.data, suggestions: { ...sug, followed } },
    };
    return true;
  }

  // -------- Read-only accessors --------

  /** Snapshot imutável do estado atual. */
  getState(): WizardState { return this.state; }

  /** Passo atual ou null (não iniciado). */
  getCurrentStep(): Step | null { return this.state.currentStep; }

  /** true após complete(). */
  isCompleted(): boolean { return this.state.completed; }

  /** Erros do passo atual (vazio quando limpo). */
  getErrors(): Readonly<Record<string, string>> { return this.state.errors; }

  /** Validação on-demand do passo atual.
   * @example
   * const r = w.validateCurrent();
   * r.valid; // boolean
   */
  validateCurrent(): ValidationResult {
    if (!this.state.currentStep) return fail({ state: 'Wizard não iniciado.' });
    return stepValidators[this.state.currentStep](this.state);
  }

  // -------- Serialization --------

  /** Retorna JSON pronto para persistir.
   * @example
   * localStorage.setItem('wizard:draft', w.serialize());
   */
  serialize(): string {
    return JSON.stringify(this.state);
  }

  /** Restaura o wizard de um JSON ou objeto.
   * Migra automaticamente para a versão atual; zera consentimento LGPD
   * se a versão estiver desatualizada.
   * @example
   * const w = new Wizard();
   * w.restore(localStorage.getItem('wizard:draft'));
   * w.getCurrentStep();
   */
  restore(input: string | WizardState): WizardEvent {
    let parsed: WizardState | null = null;
    try {
      parsed = typeof input === 'string' ? (JSON.parse(input) as WizardState) : input;
    } catch (e) {
      this.warn(`restore() falhou ao parsear JSON: ${(e as Error).message}`);
      return 'VALIDATION_FAILED';
    }
    if (!parsed || typeof parsed !== 'object') {
      this.warn('restore() recebeu payload inválido.');
      return 'VALIDATION_FAILED';
    }
    this.state = migrateState(parsed);
    this.info('wizard restaurado.');
    return 'RESTORED';
  }

  // -------- Internal --------

  private warn(msg: string): void {
    if (this.logger) this.logger.warn(`[onboarding-wizard] ${msg}`);
  }
  private info(msg: string): void {
    if (this.logger) this.logger.info(`[onboarding-wizard] ${msg}`);
  }
}

// SECTION 9 — Clone + migration helpers

/** Clone profundo via JSON round-trip (state é totalmente JSON-friendly).
 * @example
 * const s2 = cloneState(s);
 * s2 === s; // false (nova referência)
 */
export function cloneState(s: WizardState): WizardState {
  return JSON.parse(JSON.stringify(s)) as WizardState;
}

/** Migra wizard antiga para versão atual. Defaults para campos faltantes; zera lgpdConsent se versão do termo é antiga; downgrade de completed quando profile deixa de ser válido.
 * @example
 * const migrated = migrateState(oldState);
 * migrated.wizardVersion; // WIZARD_VERSION
 */
export function migrateState(s: WizardState): WizardState {
  const base = makeInitialState();
  if (!s || typeof s !== 'object') return base;

  const safeSelectedTraditions = Array.isArray(s.data?.traditions?.selected)
    ? (s.data.traditions.selected as ReadonlyArray<unknown>).filter(
        (t): t is Tradition => typeof t === 'string' && t in Tradition,
      )
    : base.data.traditions.selected;

  const safeIntentSelected =
    s.data?.intent?.selected && ALL_INTENTS.includes(s.data.intent.selected)
      ? s.data.intent.selected
      : base.data.intent.selected;

  const safeConsidered = Array.isArray(s.data?.suggestions?.considered)
    ? (s.data.suggestions.considered as ReadonlyArray<unknown>)
        .filter((x): x is string => typeof x === 'string')
    : base.data.suggestions.considered;

  const safeFollowed = Array.isArray(s.data?.suggestions?.followed)
    ? (s.data.suggestions.followed as ReadonlyArray<unknown>)
        .filter((x): x is string => typeof x === 'string')
    : base.data.suggestions.followed;

  // LGPD: se a versão armazenada é antiga, força re-consent
  const incomingConsentVersion = s.data?.profile?.lgpdConsentVersion;
  const consentIsFresh = incomingConsentVersion === LGPD_VERSION;

  const migrated: WizardState = {
    ...base,
    ...s,
    wizardVersion: WIZARD_VERSION,
    data: {
      welcome: { ...base.data.welcome, ...(s.data?.welcome ?? {}) },
      traditions: { selected: safeSelectedTraditions },
      intent: { selected: safeIntentSelected },
      suggestions: {
        considered: safeConsidered,
        followed: safeFollowed,
        skipped: Boolean(s.data?.suggestions?.skipped),
      },
      profile: {
        ...base.data.profile,
        ...(s.data?.profile ?? {}),
        lgpdConsentVersion: consentIsFresh ? LGPD_VERSION : '',
        lgpdConsent: consentIsFresh ? Boolean(s.data?.profile?.lgpdConsent) : false,
      },
    },
    errors: {},
  };

  // Downgrade de completed se profile não passa
  if (migrated.completed && !validateProfile(migrated.data.profile).valid) {
    migrated.completed = false;
    migrated.completedAt = null;
    migrated.currentStep = 'profile';
  }
  return migrated;
}

// SECTION 10 — Convenience factory

/** Atalho para instanciar um wizard.
 * @example
 * const w = createWizard({ logger: console });
 * w.start();
 */
export function createWizard(options: WizardOptions = {}): Wizard {
  return new Wizard(null, options);
}
