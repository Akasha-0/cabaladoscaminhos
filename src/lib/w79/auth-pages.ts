// ============================================================================
// W79-B · Auth Pages Helpers — validation + form contracts for /login + /signup
// ----------------------------------------------------------------------------
// Pure functions. NO React. NO Node imports. NO W68 imports.
// Companion to the page components in src/app/(auth)/login + /signup.
//
// Responsibilities:
//   1. Field-level validators (email regex, password strength, name length)
//   2. Form-level validators (login, signup) returning a normalized errors map
//   3. Adapter contract (AuthAdapter) for the actual signIn/signUp call —
//      injected so the React pages don't hard-wire to Supabase / W68.
//   4. Result discriminated union (AuthResult<T>) so callers branch on
//      'success' | 'validation' | 'auth_error' | 'network_error' without
//      re-checking error shapes.
//
// Why a separate module:
//   - Pages are 'use client'; validation must run both client (UX) and server
//     (trust boundary). Pure TS lets spec test it without DOM or Next runtime.
//   - Inversion of control via AuthAdapter keeps the pages thin and lets the
//     W79 spec stub the adapter (no real Supabase / W68 calls during tests).
//
// Cycle 78 lesson #6 applied: Object.freeze at every exported boundary.
// Cycle 75 lesson #6 applied: every result + every record is frozen.
// Branded types per cycle 77: UserId, SessionToken to block ID forgery.
// ============================================================================

/* ───────────────────────── 1. Branded types ───────────────────────── */

export type UserId = string & { readonly __brand: 'UserId' };
export type SessionToken = string & { readonly __brand: 'SessionToken' };
export type Email = string & { readonly __brand: 'Email' };

export function toUserId(raw: string): UserId {
  if (!/^u_[a-z0-9_]{3,40}$/.test(raw)) {
    throw new Error(`Invalid UserId: ${raw}`);
  }
  return raw as UserId;
}

export function toSessionToken(raw: string): SessionToken {
  if (raw.length < 8 || raw.length > 1024) {
    throw new Error(`Invalid SessionToken length: ${raw.length}`);
  }
  return raw as SessionToken;
}

/* ───────────────────────── 2. Constants ───────────────────────── */

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 80;
export const EMAIL_MAX_LENGTH = 254; // RFC 5321

// Conservative email regex: local-part + '@' + domain + '.' + 2+ TLD.
// Intentionally not perfect (RFC 5322 is huge) — matches what production
// forms actually use. Lowercase only; case-insensitive flag applied.
export const EMAIL_REGEX = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/i;

// LGPD consent: required checkbox boolean
export const LGPD_VERSION = 'lgpd-v1-2026-01';

// Password strength: at least 1 digit, 1 special character.
// 'special' = anything that is not letter/digit/space.
export const SPECIAL_CHAR_REGEX = /[^A-Za-z0-9\s]/;
export const DIGIT_REGEX = /\d/;
export const LETTER_REGEX = /[A-Za-z]/;

/* ───────────────────────── 3. Field-level validators ───────────────────────── */

export interface ValidationIssue {
  readonly field: string;
  readonly code: 'required' | 'format' | 'length' | 'strength' | 'mismatch' | 'consent';
  readonly message: string;
}

export type ValidationErrors = Readonly<Record<string, string>>;

function freezeIssues(issues: ReadonlyArray<ValidationIssue>): ReadonlyArray<ValidationIssue> {
  return Object.freeze(issues.slice());
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
    return { field: 'email', code: 'length', message: `Email deve ter no máximo ${EMAIL_MAX_LENGTH} caracteres` };
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return { field: 'email', code: 'format', message: 'Email inválido' };
  }
  return null;
}

export function validatePasswordField(raw: unknown, opts: { required?: boolean } = {}): ValidationIssue | null {
  if (typeof raw !== 'string') {
    return { field: 'password', code: 'required', message: 'Senha é obrigatória' };
  }
  if (opts.required !== false && raw.length === 0) {
    return { field: 'password', code: 'required', message: 'Senha é obrigatória' };
  }
  if (raw.length > PASSWORD_MAX_LENGTH) {
    return { field: 'password', code: 'length', message: `Senha deve ter no máximo ${PASSWORD_MAX_LENGTH} caracteres` };
  }
  return null;
}

export function passwordStrength(raw: string): { ok: boolean; issues: ReadonlyArray<ValidationIssue> } {
  const issues: ValidationIssue[] = [];
  if (raw.length < PASSWORD_MIN_LENGTH) {
    issues.push({ field: 'password', code: 'length', message: `Mínimo de ${PASSWORD_MIN_LENGTH} caracteres` });
  }
  if (!LETTER_REGEX.test(raw)) {
    issues.push({ field: 'password', code: 'strength', message: 'Precisa ter pelo menos uma letra' });
  }
  if (!DIGIT_REGEX.test(raw)) {
    issues.push({ field: 'password', code: 'strength', message: 'Precisa ter pelo menos um número' });
  }
  if (!SPECIAL_CHAR_REGEX.test(raw)) {
    issues.push({ field: 'password', code: 'strength', message: 'Precisa ter pelo menos um caractere especial' });
  }
  return Object.freeze({ ok: issues.length === 0, issues: freezeIssues(issues) });
}

export function validatePasswordConfirm(password: string, confirm: string): ValidationIssue | null {
  if (confirm.length === 0) {
    return { field: 'confirmPassword', code: 'required', message: 'Confirmação de senha é obrigatória' };
  }
  if (password !== confirm) {
    return { field: 'confirmPassword', code: 'mismatch', message: 'As senhas não coincidem' };
  }
  return null;
}

export function validateName(raw: unknown): ValidationIssue | null {
  if (typeof raw !== 'string') {
    return { field: 'name', code: 'required', message: 'Nome é obrigatório' };
  }
  const trimmed = raw.trim();
  if (trimmed.length < NAME_MIN_LENGTH) {
    return { field: 'name', code: 'length', message: `Nome deve ter no mínimo ${NAME_MIN_LENGTH} caracteres` };
  }
  if (trimmed.length > NAME_MAX_LENGTH) {
    return { field: 'name', code: 'length', message: `Nome deve ter no máximo ${NAME_MAX_LENGTH} caracteres` };
  }
  return null;
}

export function validateConsent(raw: unknown): ValidationIssue | null {
  if (raw !== true) {
    return { field: 'lgpdConsent', code: 'consent', message: 'Você precisa aceitar a política de privacidade (LGPD)' };
  }
  return null;
}

/* ───────────────────────── 4. Form-level contracts ───────────────────────── */

export interface LoginFormInput {
  readonly email: string;
  readonly password: string;
}

export interface SignupFormInput {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly confirmPassword: string;
  readonly lgpdConsent: boolean;
}

export interface LoginFormErrors {
  readonly issues: ReadonlyArray<ValidationIssue>;
  readonly byField: Readonly<Record<string, string>>;
}

export interface SignupFormErrors {
  readonly issues: ReadonlyArray<ValidationIssue>;
  readonly byField: Readonly<Record<string, string>>;
}

export function issuesToMap(issues: ReadonlyArray<ValidationIssue>): Readonly<Record<string, string>> {
  const map: Record<string, string> = {};
  for (const issue of issues) {
    if (!(issue.field in map)) {
      map[issue.field] = issue.message;
    }
  }
  return Object.freeze(map);
}

export function validateLoginForm(input: Partial<LoginFormInput>): LoginFormErrors {
  const issues: ValidationIssue[] = [];
  const emailIssue = validateEmail(input.email);
  if (emailIssue) issues.push(emailIssue);
  const pwIssue = validatePasswordField(input.password, { required: true });
  if (pwIssue) issues.push(pwIssue);
  return Object.freeze({
    issues: freezeIssues(issues),
    byField: issuesToMap(issues),
  });
}

export function validateSignupForm(input: Partial<SignupFormInput>): SignupFormErrors {
  const issues: ValidationIssue[] = [];
  const nameIssue = validateName(input.name);
  if (nameIssue) issues.push(nameIssue);
  const emailIssue = validateEmail(input.email);
  if (emailIssue) issues.push(emailIssue);
  const pwIssue = validatePasswordField(input.password);
  if (pwIssue) issues.push(pwIssue);
  // strength only when password is present and non-empty
  if (typeof input.password === 'string' && input.password.length > 0) {
    const strength = passwordStrength(input.password);
    for (const issue of strength.issues) {
      issues.push(issue);
    }
  }
  const confirmIssue = validatePasswordConfirm(
    typeof input.password === 'string' ? input.password : '',
    typeof input.confirmPassword === 'string' ? input.confirmPassword : ''
  );
  if (confirmIssue) issues.push(confirmIssue);
  const consentIssue = validateConsent(input.lgpdConsent);
  if (consentIssue) issues.push(consentIssue);
  return Object.freeze({
    issues: freezeIssues(issues),
    byField: issuesToMap(issues),
  });
}

export function isLoginValid(errs: LoginFormErrors): boolean {
  return errs.issues.length === 0;
}

export function isSignupValid(errs: SignupFormErrors): boolean {
  return errs.issues.length === 0;
}

/* ───────────────────────── 5. Adapter contract (signIn / signUp) ───────────────────────── */

export interface AuthSuccess {
  readonly kind: 'success';
  readonly userId: UserId;
  readonly email: string;
  readonly token: SessionToken;
  readonly redirectTo: string;
}

export interface AuthFailure {
  readonly kind: 'auth_error';
  readonly code: 'invalid_credentials' | 'email_taken' | 'weak_password' | 'rate_limited' | 'unknown';
  readonly message: string;
}

export interface AuthNetworkFailure {
  readonly kind: 'network_error';
  readonly message: string;
}

export type AuthResult = AuthSuccess | AuthFailure | AuthNetworkFailure;

export interface AuthAdapter {
  readonly signIn: (input: LoginFormInput) => Promise<AuthResult>;
  readonly signUp: (input: SignupFormInput) => Promise<AuthResult>;
}

/* ───────────────────────── 6. submit wrappers (sync logic) ───────────────────────── */

export interface SubmitResult {
  readonly result: AuthResult | null;
  readonly errors: Readonly<Record<string, string>>;
  readonly issues: ReadonlyArray<ValidationIssue>;
}

/**
 * submitLogin — orchestrates validation + adapter call. Pure-async, no React.
 * Returns a frozen record. If validation fails, adapter is NOT called.
 */
export async function submitLogin(
  input: LoginFormInput,
  adapter: AuthAdapter
): Promise<SubmitResult> {
  const errors = validateLoginForm(input);
  if (!isLoginValid(errors)) {
    return Object.freeze({
      result: null,
      errors: errors.byField,
      issues: errors.issues,
    });
  }
  const result = await adapter.signIn({ email: input.email.trim(), password: input.password });
  return Object.freeze({
    result,
    errors: Object.freeze({}),
    issues: Object.freeze([]),
  });
}

/**
 * submitSignup — orchestrates validation + adapter call. Pure-async, no React.
 * Returns a frozen record. If validation fails, adapter is NOT called.
 */
export async function submitSignup(
  input: SignupFormInput,
  adapter: AuthAdapter
): Promise<SubmitResult> {
  const errors = validateSignupForm(input);
  if (!isSignupValid(errors)) {
    return Object.freeze({
      result: null,
      errors: errors.byField,
      issues: errors.issues,
    });
  }
  const result = await adapter.signUp({
    name: input.name.trim(),
    email: input.email.trim(),
    password: input.password,
    confirmPassword: input.confirmPassword,
    lgpdConsent: input.lgpdConsent,
  });
  return Object.freeze({
    result,
    errors: Object.freeze({}),
    issues: Object.freeze([]),
  });
}

/* ───────────────────────── 7. Redirection + error helpers ───────────────────────── */

export const DEFAULT_LOGIN_REDIRECT = '/dashboard';
export const DEFAULT_SIGNUP_REDIRECT = '/onboarding';

export function redirectFor(result: AuthResult): string {
  if (result.kind !== 'success') return '/login';
  return result.redirectTo;
}

export function isSuccess(result: AuthResult | null): result is AuthSuccess {
  return result !== null && result.kind === 'success';
}

export function errorMessage(result: AuthResult | null): string {
  if (result === null) return '';
  if (result.kind === 'success') return '';
  return result.message;
}

/* ───────────────────────── 8. Password visibility (UX hint) ───────────────────────── */

export function passwordVisibilityHint(visible: boolean): string {
  return visible ? 'Ocultar senha' : 'Mostrar senha';
}

/* ───────────────────────── 9. Default export — single namespace ───────────────────────── */

const AuthPages = Object.freeze({
  validateEmail,
  validatePasswordField,
  passwordStrength,
  validatePasswordConfirm,
  validateName,
  validateConsent,
  validateLoginForm,
  validateSignupForm,
  isLoginValid,
  isSignupValid,
  submitLogin,
  submitSignup,
  isSuccess,
  errorMessage,
  redirectFor,
  passwordVisibilityHint,
  issuesToMap,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  EMAIL_REGEX,
  LGPD_VERSION,
  DEFAULT_LOGIN_REDIRECT,
  DEFAULT_SIGNUP_REDIRECT,
});

export default AuthPages;
