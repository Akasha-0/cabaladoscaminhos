// ============================================================================
// W72 Auth Pages — Types + Zod Schemas
// ----------------------------------------------------------------------------
// Client + server validation schemas for the 5 auth pages:
//   /login, /signup, /forgot-password, /reset-password, /verify-email
//
// The w68 auth-session-engine (src/lib/auth/) is the source of truth for
// the data model (SessionToken, ResetToken, TOTPSecret). The schemas here
// are SHAPES that match what those engines accept and what the API routes
// (src/app/api/auth/*/route.ts) consume/return.
//
// Mirror client + server: same schema, different runner. The smoke test
// in src/lib/auth-pages/smoke.ts exercises each schema in isolation.
// ============================================================================

import { z } from 'zod';

// ============================================================================
// Shared fields
// ============================================================================

export const emailField = z
  .string()
  .trim()
  .min(1, 'Email obrigatório')
  .max(254, 'Email muito longo')
  .email('Email inválido');

export const passwordField = z
  .string()
  .min(8, 'Mínimo de 8 caracteres')
  .max(128, 'Máximo de 128 caracteres');

// 6-digit TOTP code (numbers only, optional — only required if user has 2FA enabled)
export const totpCodeField = z
  .string()
  .regex(/^\d{6}$/, 'Código TOTP deve ter 6 dígitos')
  .optional();

// ============================================================================
// /login
// ============================================================================

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Senha obrigatória'),
  totp: totpCodeField,
});
export type LoginInput = z.infer<typeof loginSchema>;

// ============================================================================
// /signup
// ============================================================================

export const signupSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(2, 'Nome muito curto')
      .max(80, 'Nome muito longo'),
    email: emailField,
    password: passwordField,
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'Você deve aceitar os termos' }),
    }),
    // Sacred birth-data opt-in. When true, birthDate becomes required.
    birthDataOptIn: z.boolean().default(false),
    birthDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve ser AAAA-MM-DD')
      .refine((v) => !Number.isNaN(Date.parse(v)), 'Data inválida')
      .optional()
      .or(z.literal('')),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })
  .refine(
    (d) => {
      // If opted in, birthDate is required and must look valid
      if (!d.birthDataOptIn) return true;
      return typeof d.birthDate === 'string' && d.birthDate.length > 0;
    },
    {
      message: 'Data de nascimento obrigatória quando opt-in ativado',
      path: ['birthDate'],
    },
  );
export type SignupInput = z.infer<typeof signupSchema>;

// ============================================================================
// /forgot-password
// ============================================================================

export const forgotPasswordSchema = z.object({
  email: emailField,
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// ============================================================================
// /reset-password
// ============================================================================

export const resetPasswordSchema = z
  .object({
    token: z.string().min(16, 'Token inválido'),
    newPassword: passwordField,
    confirmPassword: z.string().min(1, 'Confirme a nova senha'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ============================================================================
// /verify-email
// ============================================================================

export const verifyEmailSchema = z.object({
  token: z.string().min(8, 'Token inválido'),
});
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

// ============================================================================
// API Result shape (matches what API routes return)
// ============================================================================

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'RATE_LIMITED'
  | 'SESSION_EXPIRED'
  | 'INVALID_TOKEN'
  | 'WEAK_PASSWORD'
  | 'EMAIL_TAKEN'
  | 'OAUTH_FAILED'
  | 'UNKNOWN';

export interface AuthError {
  code: AuthErrorCode;
  message: string;
}

export type AuthResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: AuthError };

// Per-action response payloads
export interface LoginSuccess {
  sessionToken: string;
  userId: string;
  email: string;
  displayName: string;
  requiresTotp?: boolean;
}

export interface SignupSuccess {
  userId: string;
  email: string;
  displayName: string;
  emailVerificationRequired: boolean;
}

export interface ForgotPasswordSuccess {
  // Always 200 even if email is unknown (avoid enumeration)
  sent: boolean;
  // Rate-limit hint (seconds until next attempt allowed)
  retryAfterSeconds?: number;
}

export interface ResetPasswordSuccess {
  userId: string;
  email: string;
}

export interface VerifyEmailSuccess {
  verified: boolean;
}

// ============================================================================
// Schema audit (smoke test, IDE support)
// ============================================================================

export const __ALL_SCHEMAS = {
  fields: ['emailField', 'passwordField', 'totpCodeField'],
  objects: [
    'loginSchema',
    'signupSchema',
    'forgotPasswordSchema',
    'resetPasswordSchema',
    'verifyEmailSchema',
  ],
} as const;
