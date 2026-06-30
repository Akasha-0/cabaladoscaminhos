// ============================================================================
// W85-C · Auth Integration Helpers — pure TS, no React, no Node imports
// ----------------------------------------------------------------------------
// Cycle 85 · 2026-06-30
// Companion to src/app/(auth)/{login,signup}/page.tsx.
//
// Responsibilities (kept narrow on purpose — pages do their own rendering):
//   1. EMAIL_REGEX + password rules (cycle 78/W79-B pattern, hardened for W85)
//   2. validateMagicLinkInput() — used by /login
//   3. validateSignupStep1/2/3() — used by /signup wizard (per-step)
//   4. TRADICOES (7) + labels + descriptions — sacred-cultural curation
//   5. LGPD_VERSION + LGPD consent gate
//   6. Wizard step machine (advance/back, allowed transitions, gating)
//
// Why pure functions: pages are 'use client'; validation must be exercisable
// in `node --experimental-strip-types` without a DOM. This file also doubles
// as the source of truth for the spec harness.
// ============================================================================

// ───────────────────────── 1. Branded types ─────────────────────────

export type UserId = string & { readonly __brand: 'UserId' };
export type Email = string & { readonly __brand: 'Email' };
export type AuthToken = string & { readonly __brand: 'AuthToken' };

export function toEmail(raw: string): Email {
  if (!EMAIL_REGEX.test(raw)) {
    throw new Error('Invalid email format');
  }
  return raw.toLowerCase().trim() as Email;
}

// ───────────────────────── 2. Constants ─────────────────────────

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 60;
export const BIO_MIN_LENGTH = 0;
export const BIO_MAX_LENGTH = 280;
export const EMAIL_MAX_LENGTH = 254;

export const LGPD_VERSION = 'lgpd-v1-2026-01';

export const EMAIL_REGEX =
  /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/i;

// Conservative password strength (cycle 78/W79-B)
export const SPECIAL_CHAR_REGEX = /[^A-Za-z0-9\s]/;
export const DIGIT_REGEX = /\d/;
export const LETTER_REGEX = /[A-Za-z]/;

// ───────────────────────── 3. 7-Tradição taxonomy ─────────────────────────

export const TRADICOES = Object.freeze([
  'cigano',
  'candomble',
  'umbanda',
  'ifa',
  'cabala',
  'astrologia',
  'tantra',
] as const);

export type Tradicao = (typeof TRADICOES)[number];

export interface TradicaoCard {
  readonly id: Tradicao;
  readonly label: string; // PT display name (e.g., "Candomblé")
  readonly symbol: string; // Text-based glyph (a11y-friendly)
  readonly description: string; // 1-sentence respectful summary
  readonly accent: string; // CSS hex for card highlight
}

// Sacred-cultural curation notes (see DELIVERABLE.md):
//   - Descriptions are intentionally NOT exoticized
//   - Each one frames the tradition on its own terms, not as "magic"
//   - Symbols are TEXT (not images) so screen readers can announce them
//   - Accent colors chosen for AA contrast on dark/light backgrounds
export const TRADICAO_CARDS: ReadonlyArray<TradicaoCard> = Object.freeze([
  {
    id: 'cigano',
    label: 'Cigano',
    symbol: '✦',
    description:
      'Tradição nômade ibérica que combina leitura de cartas, linhas da mão e ligação com o clã.',
    accent: '#d97706',
  },
  {
    id: 'candomble',
    label: 'Candomblé',
    symbol: '🪶',
    description:
      'Religião de matriz africana que honra os orixás através do axé, do canto e da ancestralidade.',
    accent: '#16a34a',
  },
  {
    id: 'umbanda',
    label: 'Umbanda',
    symbol: '☩',
    description:
      'Religião brasileira que reúne caboclos, pretos-velhos e entidades da natureza em torno da caridade.',
    accent: '#0891b2',
  },
  {
    id: 'ifa',
    label: 'Ifá',
    symbol: '◈',
    description:
      'Sistema yorubá de consulta regido por Orunmilá, lido através dos 16 odus principais.',
    accent: '#7c3aed',
  },
  {
    id: 'cabala',
    label: 'Cabala',
    symbol: '☸',
    description:
      'Tradição mística judaica que estuda as 10 sefirot e as 22 letras do alfabeto hebraico.',
    accent: '#2563eb',
  },
  {
    id: 'astrologia',
    label: 'Astrologia',
    symbol: '☉',
    description:
      'Leitura simbólica do céu no momento do nascimento: signos, planetas, casas e aspectos.',
    accent: '#ea580c',
  },
  {
    id: 'tantra',
    label: 'Tantra',
    symbol: '☬',
    description:
      'Caminho indiano de práticas corporais, energéticas e ritualísticas para a consciência.',
    accent: '#db2777',
  },
]);

export const TRADICAO_LABELS: Readonly<Record<Tradicao, string>> = Object.freeze(
  TRADICAO_CARDS.reduce(
    (acc, c) => {
      acc[c.id] = c.label;
      return acc;
    },
    {} as Record<Tradicao, string>,
  ),
);

export function isTradicao(value: unknown): value is Tradicao {
  return typeof value === 'string' && (TRADICOES as ReadonlyArray<string>).includes(value);
}

export function findTradicaoCard(id: Tradicao): TradicaoCard {
  const card = TRADICAO_CARDS.find((c) => c.id === id);
  if (!card) {
    throw new Error(`Unknown tradição: ${id}`);
  }
  return card;
}

// ───────────────────────── 4. Validation primitives ─────────────────────────

export interface ValidationIssue {
  readonly field: string;
  readonly code:
    | 'required'
    | 'format'
    | 'length'
    | 'strength'
    | 'mismatch'
    | 'consent'
    | 'range';
  readonly message: string;
}

export type ValidationErrors = Readonly<Record<string, string>>;

export function issuesToErrors(
  issues: ReadonlyArray<ValidationIssue>,
): ValidationErrors {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    if (!(issue.field in out)) {
      out[issue.field] = issue.message;
    }
  }
  return Object.freeze(out);
}

export function validateEmail(raw: unknown): ValidationIssue | null {
  if (typeof raw !== 'string') {
    return { field: 'email', code: 'required', message: 'Email é obrigatório' };
  }
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return { field: 'email', code: 'required', message: 'Email é obrigatório' };
  }
  if (trimmed.length > EMAIL_MAX_LENGTH) {
    return {
      field: 'email',
      code: 'length',
      message: `Email deve ter no máximo ${EMAIL_MAX_LENGTH} caracteres`,
    };
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return { field: 'email', code: 'format', message: 'Email inválido' };
  }
  return null;
}

export function validatePasswordField(
  raw: unknown,
  opts: { required?: boolean } = {},
): ValidationIssue | null {
  if (typeof raw !== 'string') {
    return {
      field: 'password',
      code: 'required',
      message: 'Senha é obrigatória',
    };
  }
  if (opts.required !== false && raw.length === 0) {
    return {
      field: 'password',
      code: 'required',
      message: 'Senha é obrigatória',
    };
  }
  if (raw.length > PASSWORD_MAX_LENGTH) {
    return {
      field: 'password',
      code: 'length',
      message: `Senha deve ter no máximo ${PASSWORD_MAX_LENGTH} caracteres`,
    };
  }
  return null;
}

export function passwordStrength(
  raw: string,
): { ok: boolean; issues: ReadonlyArray<ValidationIssue> } {
  const issues: ValidationIssue[] = [];
  if (raw.length < PASSWORD_MIN_LENGTH) {
    issues.push({
      field: 'password',
      code: 'length',
      message: `Mínimo de ${PASSWORD_MIN_LENGTH} caracteres`,
    });
  }
  if (!LETTER_REGEX.test(raw)) {
    issues.push({
      field: 'password',
      code: 'strength',
      message: 'Precisa ter pelo menos uma letra',
    });
  }
  if (!DIGIT_REGEX.test(raw)) {
    issues.push({
      field: 'password',
      code: 'strength',
      message: 'Precisa ter pelo menos um número',
    });
  }
  if (!SPECIAL_CHAR_REGEX.test(raw)) {
    issues.push({
      field: 'password',
      code: 'strength',
      message: 'Precisa ter pelo menos um caractere especial',
    });
  }
  return { ok: issues.length === 0, issues: Object.freeze(issues.slice()) };
}

export function validateDisplayName(raw: unknown): ValidationIssue | null {
  if (typeof raw !== 'string') {
    return { field: 'displayName', code: 'required', message: 'Nome é obrigatório' };
  }
  const trimmed = raw.trim();
  if (trimmed.length < NAME_MIN_LENGTH) {
    return {
      field: 'displayName',
      code: 'length',
      message: `Nome deve ter pelo menos ${NAME_MIN_LENGTH} caracteres`,
    };
  }
  if (trimmed.length > NAME_MAX_LENGTH) {
    return {
      field: 'displayName',
      code: 'length',
      message: `Nome deve ter no máximo ${NAME_MAX_LENGTH} caracteres`,
    };
  }
  return null;
}

export function validateBio(raw: unknown): ValidationIssue | null {
  if (typeof raw !== 'string') {
    return null; // bio is optional
  }
  if (raw.length > BIO_MAX_LENGTH) {
    return {
      field: 'bio',
      code: 'length',
      message: `Bio deve ter no máximo ${BIO_MAX_LENGTH} caracteres`,
    };
  }
  return null;
}

export function validateTradicao(raw: unknown): ValidationIssue | null {
  if (!isTradicao(raw)) {
    return {
      field: 'tradicao',
      code: 'required',
      message: 'Selecione uma tradição para continuar',
    };
  }
  return null;
}

export function validateLgpdConsent(raw: unknown): ValidationIssue | null {
  if (raw !== true) {
    return {
      field: 'lgpd',
      code: 'consent',
      message: 'É necessário aceitar a Política de Privacidade (LGPD)',
    };
  }
  return null;
}

// ───────────────────────── 5. Magic-link login (cycle 85) ─────────────────────────

export function validateMagicLinkInput(input: {
  email: unknown;
}): ReadonlyArray<ValidationIssue> {
  const issues: ValidationIssue[] = [];
  const emailIssue = validateEmail(input.email);
  if (emailIssue) issues.push(emailIssue);
  return Object.freeze(issues.slice());
}

// Magic link token generation (deterministic-ish; for dev preview only)
export function deriveMagicLinkToken(email: Email): AuthToken {
  // NOT cryptographically secure — for client-side preview only.
  // Real production uses server-issued JWT (cycle 78 W68 pattern).
  const seed = `${email}|${LGPD_VERSION}|magic-link`;
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  const hex = (h >>> 0).toString(16).padStart(8, '0');
  return `ml_${hex}_${Date.now().toString(36)}` as AuthToken;
}

// ───────────────────────── 6. Signup wizard per-step ─────────────────────────

export interface SignupStep1 {
  email: string;
  password: string;
}

export interface SignupStep2 {
  tradicao: Tradicao | null;
}

export interface SignupStep3 {
  displayName: string;
  bio: string;
  lgpdConsent: boolean;
}

export interface SignupForm {
  step1: SignupStep1;
  step2: SignupStep2;
  step3: SignupStep3;
}

export function validateSignupStep1(
  input: Partial<SignupStep1>,
): ReadonlyArray<ValidationIssue> {
  const issues: ValidationIssue[] = [];
  const e = validateEmail(input.email);
  if (e) issues.push(e);
  const p = validatePasswordField(input.password);
  if (p) issues.push(p);
  if (typeof input.password === 'string') {
    const strength = passwordStrength(input.password);
    // Strength issues are warnings; only fail if no min length met
    if (input.password.length < PASSWORD_MIN_LENGTH) {
      // Already covered by length validator; skip duplicates
    } else if (!strength.ok) {
      // Treat as soft error but keep ONLY first to avoid noise
      const first = strength.issues[0];
      if (first) issues.push(first);
    }
  }
  return Object.freeze(issues.slice());
}

export function validateSignupStep2(
  input: Partial<SignupStep2>,
): ReadonlyArray<ValidationIssue> {
  const issues: ValidationIssue[] = [];
  const t = validateTradicao(input.tradicao);
  if (t) issues.push(t);
  return Object.freeze(issues.slice());
}

export function validateSignupStep3(
  input: Partial<SignupStep3>,
): ReadonlyArray<ValidationIssue> {
  const issues: ValidationIssue[] = [];
  const n = validateDisplayName(input.displayName);
  if (n) issues.push(n);
  const b = validateBio(input.bio);
  if (b) issues.push(b);
  const c = validateLgpdConsent(input.lgpdConsent);
  if (c) issues.push(c);
  return Object.freeze(issues.slice());
}

export function validateFullSignup(
  form: Partial<SignupForm>,
): ReadonlyArray<ValidationIssue> {
  return Object.freeze([
    ...validateSignupStep1(form.step1 ?? {}),
    ...validateSignupStep2(form.step2 ?? {}),
    ...validateSignupStep3(form.step3 ?? {}),
  ]);
}

// ───────────────────────── 7. Wizard state machine ─────────────────────────

export type WizardStep = 1 | 2 | 3;

export interface WizardState {
  step: WizardStep;
  step1Valid: boolean;
  step2Valid: boolean;
  step3Valid: boolean;
}

export const WIZARD_STEP_ORDER: ReadonlyArray<WizardStep> = Object.freeze([
  1,
  2,
  3,
]);

export function canAdvance(from: WizardStep, state: WizardState): boolean {
  if (from === 1) return state.step1Valid;
  if (from === 2) return state.step2Valid;
  if (from === 3) return state.step3Valid;
  return false;
}

export function nextStep(from: WizardStep): WizardStep | null {
  if (from === 1) return 2;
  if (from === 2) return 3;
  if (from === 3) return null;
  return null;
}

export function prevStep(from: WizardStep): WizardStep | null {
  if (from === 3) return 2;
  if (from === 2) return 1;
  if (from === 1) return null;
  return null;
}

export function isWizardStep(value: unknown): value is WizardStep {
  return value === 1 || value === 2 || value === 3;
}

export function initialWizardState(): WizardState {
  return Object.freeze({
    step: 1,
    step1Valid: false,
    step2Valid: false,
    step3Valid: false,
  });
}

// ───────────────────────── 8. OAuth provider catalog (visual only) ─────────────────────────

export type OAuthProvider = 'google' | 'apple';

export interface OAuthProviderInfo {
  readonly id: OAuthProvider;
  readonly label: string; // Display text
  readonly symbol: string; // Text-based, accessibility friendly
  readonly hint: string; // aria-label
}

export const OAUTH_PROVIDERS: ReadonlyArray<OAuthProviderInfo> = Object.freeze([
  {
    id: 'google',
    label: 'Continuar com Google',
    symbol: 'G',
    hint: 'Continuar com Google (em breve)',
  },
  {
    id: 'apple',
    label: 'Continuar com Apple',
    symbol: '',
    hint: 'Continuar com Apple (em breve)',
  },
]);

export function isOAuthProvider(value: unknown): value is OAuthProvider {
  return value === 'google' || value === 'apple';
}

// ───────────────────────── 9. Result discriminated union ─────────────────────────

export type AuthOutcome =
  | { readonly kind: 'success'; readonly email: Email }
  | { readonly kind: 'sent'; readonly email: Email; readonly token: AuthToken }
  | {
      readonly kind: 'validation';
      readonly errors: ValidationErrors;
    }
  | { readonly kind: 'auth_error'; readonly message: string }
  | { readonly kind: 'network_error'; readonly message: string };

export function isAuthOutcome(value: unknown): value is AuthOutcome {
  if (!value || typeof value !== 'object') return false;
  const k = (value as { kind?: unknown }).kind;
  return (
    k === 'success' ||
    k === 'sent' ||
    k === 'validation' ||
    k === 'auth_error' ||
    k === 'network_error'
  );
}

// ───────────────────────── 10. Stubbed AuthAdapter ─────────────────────────

export interface AuthAdapter {
  sendMagicLink(email: Email): Promise<AuthOutcome>;
  signUp(
    form: SignupForm,
    tradicao: Tradicao,
  ): Promise<AuthOutcome>;
}

// Default no-op adapter — pages swap in real one in production.
// This makes the spec harness independent of network/Supabase.
export function createStubAdapter(): AuthAdapter {
  return Object.freeze({
    async sendMagicLink(email: Email): Promise<AuthOutcome> {
      return Object.freeze({ kind: 'sent', email, token: deriveMagicLinkToken(email) });
    },
    async signUp(form: SignupForm, tradicao: Tradicao): Promise<AuthOutcome> {
      const email = toEmail(form.step1.email);
      return Object.freeze({ kind: 'success', email });
    },
  }) as AuthAdapter;
}