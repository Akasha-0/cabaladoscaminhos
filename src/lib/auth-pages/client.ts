// ============================================================================
// W72 Auth Pages — Client-side API wrapper
// ----------------------------------------------------------------------------
// Thin client that wraps /api/auth/* routes. The w68 auth-session-engine
// runs server-side; the browser never sees HMAC secrets or session stores.
//
// Usage in 'use client' components:
//   const result = await authClient.login({ email, password });
//   if (!result.ok) { setError(result.error.message); return; }
//   router.push('/feed');
//
// All functions return AuthResult<T> for uniform error handling.
// ============================================================================

import {
  type AuthError,
  type AuthResult,
  type ForgotPasswordInput,
  type ForgotPasswordSuccess,
  type LoginInput,
  type LoginSuccess,
  type ResetPasswordInput,
  type ResetPasswordSuccess,
  type SignupInput,
  type SignupSuccess,
  type VerifyEmailInput,
  type VerifyEmailSuccess,
} from './types.ts';

const ROUTES = {
  login: '/api/auth/login',
  signup: '/api/auth/signup',
  forgotPassword: '/api/auth/forgot-password',
  resetPassword: '/api/auth/reset-password',
  verifyEmail: '/api/auth/verify-email',
} as const;

async function postJson<T>(url: string, body: unknown): Promise<AuthResult<T>> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    // 429 → rate-limited
    if (res.status === 429) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      return {
        ok: false,
        error: {
          code: 'RATE_LIMITED',
          message: data.error ?? 'Muitas tentativas. Tente em alguns minutos.',
        },
      };
    }
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      code?: AuthError['code'];
    };
    if (!res.ok || data.ok === false) {
      return {
        ok: false,
        error: {
          code: data.code ?? 'UNKNOWN',
          message: data.error ?? `Erro ${res.status}`,
        },
      };
    }
    return { ok: true, data: data as T };
  } catch (err) {
    return {
      ok: false,
      error: {
        code: 'UNKNOWN',
        message: err instanceof Error ? err.message : 'Erro de rede',
      },
    };
  }
}

export const authClient = {
  login: (input: LoginInput) => postJson<LoginSuccess>(ROUTES.login, input),
  signup: (input: SignupInput) => postJson<SignupSuccess>(ROUTES.signup, input),
  forgotPassword: (input: ForgotPasswordInput) =>
    postJson<ForgotPasswordSuccess>(ROUTES.forgotPassword, input),
  resetPassword: (input: ResetPasswordInput) =>
    postJson<ResetPasswordSuccess>(ROUTES.resetPassword, input),
  verifyEmail: (input: VerifyEmailInput) =>
    postJson<VerifyEmailSuccess>(ROUTES.verifyEmail, input),
};

// Re-export types for convenience
export type {
  AuthError,
  AuthResult,
  ForgotPasswordInput,
  ForgotPasswordSuccess,
  LoginInput,
  LoginSuccess,
  ResetPasswordInput,
  ResetPasswordSuccess,
  SignupInput,
  SignupSuccess,
  VerifyEmailInput,
  VerifyEmailSuccess,
};

export const __ALL_EXPORTS = {
  routes: ROUTES,
  functions: ['login', 'signup', 'forgotPassword', 'resetPassword', 'verifyEmail'],
} as const;
