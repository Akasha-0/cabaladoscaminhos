// ============================================================================
// W72 Auth Pages — API Business Logic
// ----------------------------------------------------------------------------
// Pure functions (no Next.js imports) that implement each auth action.
// The route.ts files are thin HTTP adapters: parse Request → call here →
// return Response.json(). The smoke runner can call these directly without
// needing the Next runtime.
//
// Each function returns { status, body } so the route can map to HTTP.
// ============================================================================

import {
  createSession,
  SessionEngineError,
} from '../auth/session-engine.ts';
import {
  verifyPassword,
  hashPassword,
  requestPasswordReset,
  consumeResetToken,
  PasswordRateLimitError,
  InvalidResetTokenError,
  ExpiredResetTokenError,
  ResetTokenAlreadyConsumedError,
  InvalidPasswordError,
  UserNotFoundError,
  upsertUserForTest,
} from '../auth/password-recovery.ts';
import { getTwoFactorStatus } from '../auth/two-factor.ts';
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from './types.ts';
import { createUser, findUserByEmail } from './user-store.ts';
import {
  consumeEmailVerificationToken,
  issueEmailVerificationToken,
  rateLimitEmailVerification,
} from './server-bootstrap.ts';
import { bootstrapAuthEngines } from './server-bootstrap.ts';

export interface ApiResult {
  status: number;
  body: Record<string, unknown>;
  headers?: Record<string, string>;
}

bootstrapAuthEngines();

// In-process login rate limit (per-email)
const _loginAttempts = new Map<string, { count: number; firstAt: number }>();
const LOGIN_WINDOW_MS = 60_000;
const LOGIN_MAX_ATTEMPTS = 5;

function recordLoginAttempt(email: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const rec = _loginAttempts.get(email);
  if (!rec) {
    _loginAttempts.set(email, { count: 1, firstAt: now });
    return { allowed: true, retryAfter: 0 };
  }
  if (now - rec.firstAt > LOGIN_WINDOW_MS) {
    _loginAttempts.set(email, { count: 1, firstAt: now });
    return { allowed: true, retryAfter: 0 };
  }
  rec.count += 1;
  if (rec.count > LOGIN_MAX_ATTEMPTS) {
    return { allowed: false, retryAfter: Math.ceil((LOGIN_WINDOW_MS - (now - rec.firstAt)) / 1000) };
  }
  return { allowed: true, retryAfter: 0 };
}

export async function handleLogin(input: unknown): Promise<ApiResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: 400,
      body: { ok: false, code: 'UNKNOWN', error: parsed.error.issues[0]?.message ?? 'Dados inválidos' },
    };
  }
  const { email, password, totp } = parsed.data;

  const limit = recordLoginAttempt(email);
  if (!limit.allowed) {
    return {
      status: 429,
      body: { ok: false, code: 'RATE_LIMITED', error: `Muitas tentativas. Tente em ${limit.retryAfter}s.` },
      headers: { 'Retry-After': String(limit.retryAfter) },
    };
  }

  const user = findUserByEmail(email);
  if (!user) {
    return {
      status: 401,
      body: { ok: false, code: 'INVALID_CREDENTIALS', error: 'Email ou senha incorretos' },
    };
  }

  let passwordOk = false;
  try {
    passwordOk = await verifyPassword(password, user.passwordHash);
  } catch {
    return { status: 500, body: { ok: false, code: 'UNKNOWN', error: 'Falha ao verificar senha' } };
  }
  if (!passwordOk) {
    return {
      status: 401,
      body: { ok: false, code: 'INVALID_CREDENTIALS', error: 'Email ou senha incorretos' },
    };
  }

  const totpStatus = getTwoFactorStatus(user.userId);
  void totpStatus;
  void totp;

  try {
    const session = await createSession(user.userId, {
      metadata: { ip: null, userAgent: null, deviceFingerprint: null },
    });
    return {
      status: 200,
      body: {
        ok: true,
        sessionToken: session.token,
        userId: user.userId,
        email: user.email,
        displayName: user.displayName,
      },
    };
  } catch (err) {
    if (err instanceof SessionEngineError) {
      return { status: 500, body: { ok: false, code: 'UNKNOWN', error: err.message } };
    }
    throw err;
  }
}

export async function handleSignup(input: unknown): Promise<ApiResult> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: 400,
      body: { ok: false, code: 'UNKNOWN', error: parsed.error.issues[0]?.message ?? 'Dados inválidos' },
    };
  }
  const data = parsed.data;

  let passwordHash: string;
  try {
    passwordHash = await hashPassword(data.password);
  } catch (err) {
    if (err instanceof InvalidPasswordError) {
      return { status: 400, body: { ok: false, code: 'WEAK_PASSWORD', error: err.message } };
    }
    throw err;
  }

  const result = createUser({
    email: data.email,
    passwordHash,
    displayName: data.displayName,
    birthDate: data.birthDataOptIn && data.birthDate ? data.birthDate : null,
    birthDataOptIn: data.birthDataOptIn,
  });
  if (!result.ok) {
    return { status: 409, body: { ok: false, code: 'EMAIL_TAKEN', error: 'Email já cadastrado' } };
  }

  // Register the user in the w68 password-recovery engine so requestPasswordReset
  // can find them by email. Production swaps in Prisma.
  upsertUserForTest({
    userId: result.user.userId,
    email: result.user.email,
    passwordHash,
  });

  const verification = issueEmailVerificationToken({
    userId: result.user.userId,
    email: result.user.email,
  });

  return {
    status: 200,
    body: {
      ok: true,
      userId: result.user.userId,
      email: result.user.email,
      displayName: result.user.displayName,
      emailVerificationRequired: true,
      _devVerificationToken: verification.token,
    },
  };
}

export async function handleForgotPassword(input: unknown): Promise<ApiResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: 400,
      body: { ok: false, code: 'UNKNOWN', error: parsed.error.issues[0]?.message ?? 'Dados inválidos' },
    };
  }
  const { email } = parsed.data;

  try {
    const result = await requestPasswordReset(email);
    void findUserByEmail(email);
    void result;
    return { status: 200, body: { ok: true, sent: true } };
  } catch (err) {
    if (err instanceof PasswordRateLimitError) {
      return {
        status: 429,
        body: { ok: false, code: 'RATE_LIMITED', error: 'Muitas tentativas. Tente em alguns minutos.' },
        headers: { 'Retry-After': '60' },
      };
    }
    throw err;
  }
}

export async function handleResetPassword(input: unknown): Promise<ApiResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: 400,
      body: { ok: false, code: 'UNKNOWN', error: parsed.error.issues[0]?.message ?? 'Dados inválidos' },
    };
  }
  const { token, newPassword } = parsed.data;

  try {
    const result = await consumeResetToken({ token, newPassword });
    return {
      status: 200,
      body: { ok: true, userId: result.userId, email: result.email },
    };
  } catch (err) {
    if (err instanceof InvalidResetTokenError) {
      return { status: 400, body: { ok: false, code: 'INVALID_TOKEN', error: 'Token inválido' } };
    }
    if (err instanceof ExpiredResetTokenError) {
      return { status: 400, body: { ok: false, code: 'INVALID_TOKEN', error: 'Token expirado' } };
    }
    if (err instanceof ResetTokenAlreadyConsumedError) {
      return { status: 400, body: { ok: false, code: 'INVALID_TOKEN', error: 'Token já utilizado' } };
    }
    if (err instanceof InvalidPasswordError) {
      return { status: 400, body: { ok: false, code: 'WEAK_PASSWORD', error: err.message } };
    }
    if (err instanceof UserNotFoundError) {
      return { status: 404, body: { ok: false, code: 'UNKNOWN', error: 'Usuário não encontrado' } };
    }
    throw err;
  }
}

export async function handleVerifyEmail(input: unknown): Promise<ApiResult> {
  const parsed = verifyEmailSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: 400,
      body: { ok: false, code: 'UNKNOWN', error: parsed.error.issues[0]?.message ?? 'Dados inválidos' },
    };
  }
  const { token } = parsed.data;
  const result = consumeEmailVerificationToken(token);
  if (!result.ok) {
    const messages: Record<string, string> = {
      format: 'Token inválido',
      not_found: 'Token não encontrado ou expirado',
      consumed: 'Token já utilizado',
    };
    return {
      status: 400,
      body: {
        ok: false,
        code: 'INVALID_TOKEN',
        error: messages[result.reason ?? 'format'] ?? 'Token inválido',
      },
    };
  }
  return { status: 200, body: { ok: true, verified: true } };
}

export async function handleResendVerification(input: unknown): Promise<ApiResult> {
  const email = (input as { email?: string })?.email;
  if (typeof email !== 'string' || !email.includes('@')) {
    return { status: 400, body: { ok: false, code: 'UNKNOWN', error: 'Email obrigatório' } };
  }
  const limit = rateLimitEmailVerification(email, 60_000);
  if (!limit.allowed) {
    return {
      status: 429,
      body: { ok: false, code: 'RATE_LIMITED', error: `Aguarde ${limit.retryAfterSeconds}s para reenviar.` },
      headers: { 'Retry-After': String(limit.retryAfterSeconds) },
    };
  }
  return { status: 200, body: { ok: true, sent: true } };
}

export const __ALL_EXPORTS = {
  functions: [
    'handleLogin',
    'handleSignup',
    'handleForgotPassword',
    'handleResetPassword',
    'handleVerifyEmail',
    'handleResendVerification',
  ],
} as const;
