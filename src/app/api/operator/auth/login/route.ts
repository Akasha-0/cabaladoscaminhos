// ============================================================
// API ROUTE — Login do Operator (Fase 8 + 13 + 15 + 18 + 20 + 26)
// ============================================================
// Recebe { email, password }, valida credenciais contra o Operator no
// banco, emite PAR access (15min) + refresh (30d) (Fase 15), cria
// DUAS OperatorSession (Fase 13 — revogação), e seta OS DOIS cookies
// no response: `cockpit_session` (access) + `cockpit_refresh` (refresh).
//
// Fase 18: rate-limit por IP (5 tentativas / 15min) via Redis com
// fallback in-memory. Headers `X-RateLimit-*` em todas as respostas.
//
// Fase 20: se operator tem MFA ativo (OperatorMfa.enabled=true),
// emite `mfaRequired=true` + `mfaToken` (5min, single-use) em vez
// do par access+refresh. Cliente então chama /mfa/verify ou
// /mfa/recovery-code para trocar o mfaToken pelos cookies finais.
//
// Fase 26: lockout de conta por email (NÃO por IP — rate-limit cobre IP).
// 5 tentativas falhas consecutivas → 30min de bloqueio.
// Verificado ANTES de checar senha (economiza CPU vs bcrypt).
// Login OK sempre reseta o contador.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import {
  signOperatorAccessToken,
  signOperatorRefreshToken,
  signMfaChallengeToken,
  setOperatorSessionCookie,
  setOperatorRefreshCookie,
} from '@/lib/auth/operator-jwt';
import { createSession, createRefreshSession } from '@/lib/auth/operator-sessions';
import { isMfaEnabled } from '@/lib/auth/operator-mfa';
import { isLocked, recordFailedAttempt, recordSuccessfulLogin } from '@/lib/auth/account-lockout';
import { logSecurityEvent } from '@/lib/auth/audit-service';
import {
  applyRateLimitHeaders,
  enforceAuthRateLimit,
} from '@/lib/auth/rate-limit';

const loginSchema = z.object({
  // Preprocess normaliza o email (lowercase + trim) ANTES de validar
  // o formato — assim '  Ramiro@Cabala.COM  ' também é aceito.
  email: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
    z.string().email('Email inválido')
  ),
  password: z.string().min(1, 'Senha é obrigatória'),
});

/** Operator serializado (sem passwordHash) p/ a response. */
function publicOperator(operator: { id: string; email: string; name: string; role: 'OPERATOR' | 'ADMIN' }) {
  return { id: operator.id, email: operator.email, name: operator.name, role: operator.role };
}

export async function POST(request: NextRequest) {
  // Fase 18: rate-limit PRIMEIRO (antes de qualquer trabalho caro).
  // Brute-force típico: 1000 requests com senha errada. Bloquear nos
  // primeiros 5 protege bcrypt (que é caro em CPU) e a tabela Operator.
  const rl = await enforceAuthRateLimit(request, 'login');
  if (rl.kind === 'blocked') {
    return rl.response;
  }
  const { result: rlResult } = rl;

  let body: z.infer<typeof loginSchema>;
  try {
    body = loginSchema.parse(await request.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      const res = NextResponse.json(
        { error: 'Dados inválidos', details: err.flatten() },
        { status: 400 }
      );
      applyRateLimitHeaders(res, rlResult);
      return res;
    }
    throw err;
  }

  // 1) Buscar Operator por email
  const operator = await prisma.operator.findUnique({
    where: { email: body.email.toLowerCase().trim() },
  });
  // Fase 26: verificar lockout ANTES de checar senha (economiza bcrypt).
  // Não revela se o email existe — retorna 423 para ambos casos.
  if (operator) {
    const lockStatus = await isLocked(operator.email);
    if (lockStatus.locked) {
      const retryAfter = Math.ceil(
        ((lockStatus.until!.getTime() - Date.now()) / 1000)
      );
      const res = NextResponse.json(
        { error: 'Conta temporariamente bloqueada. Tente novamente mais tarde.' },
        { status: 423 }
      );
      res.headers.set('Retry-After', String(Math.max(1, retryAfter)));
      applyRateLimitHeaders(res, rlResult);
      return res;
    }
  } else {
    // Email não existe — mensagem genérica (anti-enumeração).
    const res = NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    applyRateLimitHeaders(res, rlResult);
    return res;
  }

  // 2) Verificar senha (bcrypt)
  const ipAddress = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined;
  const userAgent = request.headers.get('user-agent') ?? undefined;
  const ok = await bcrypt.compare(body.password, operator.passwordHash);
  if (!ok) {
    // Fase 26: registrar tentativa falha (incrementa contador e possivelmente bloqueia)
    await recordFailedAttempt(operator.email).catch((err) =>
      console.error('[operator/auth/login] recordFailedAttempt failed', err)
    );
    // Fase 21: LOGIN_FAILURE — nunca bloqueia o fluxo
    logSecurityEvent({
      type: 'LOGIN_FAILURE',
      operatorId: operator.id,
      ipAddress,
      userAgent,
      metadata: { emailAttempted: body.email, reason: 'wrong-password' },
    });
    const res = NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    applyRateLimitHeaders(res, rlResult);
    return res;
  }

  // 2.5) Fase 20 — checar se operator tem MFA ativo. Se sim, retornar
  //      mfaRequired + mfaToken em vez do par access+refresh.
  //      O cliente então chama /mfa/verify (com TOTP) ou
  //      /mfa/recovery-code (com recovery code) para concluir.
  let mfaEnabled = false;
  try {
    mfaEnabled = await isMfaEnabled(operator.id);
  } catch (err) {
    // DB error aqui NÃO bloqueia o login — degrada para sem MFA.
    console.error('[operator/auth/login] mfa check failed', err);
  }

  if (mfaEnabled) {
    const mfaToken = signMfaChallengeToken({ operatorId: operator.id });
    const res = NextResponse.json({
      mfaRequired: true,
      mfaToken,
      operator: publicOperator(operator),
    });
    applyRateLimitHeaders(res, rlResult);
    return res;
  }

  // 3) Fase 15 — emitir par access (15min) + refresh (30d)
  const accessToken = signOperatorAccessToken({ id: operator.id, role: operator.role });
  const refreshToken = signOperatorRefreshToken({ id: operator.id, role: operator.role });
  // 4) Criar DUAS OperatorSession (Fase 13 + 15)
  //    Falha aqui é logged mas NÃO bloqueia o login (degradação suave).
  try {
    await createSession({
      operatorId: operator.id,
      token: accessToken,
      type: 'ACCESS',
      ipAddress,
      userAgent,
    });
    await createRefreshSession({
      operatorId: operator.id,
      token: refreshToken,
      ipAddress,
      userAgent,
    });
  } catch (err) {
    console.error('[operator/auth/login] failed to create session(s)', err);
  }
  // Fase 21: LOGIN_SUCCESS — fire-and-forget, nunca bloqueia
  logSecurityEvent({
    type: 'LOGIN_SUCCESS',
    operatorId: operator.id,
    ipAddress,
    userAgent,
  });
  // 5) Fase 26 — resetar contador de tentativas falhas (login completo)
  await recordSuccessfulLogin(operator.email).catch((err) =>
    console.error('[operator/auth/login] recordSuccessfulLogin failed', err)
  );
  // 6) Setar 2 cookies httpOnly e responder
  const response = NextResponse.json({ operator: publicOperator(operator) });
  setOperatorSessionCookie(response, accessToken);
  setOperatorRefreshCookie(response, refreshToken);
  applyRateLimitHeaders(response, rlResult);
  return response;
}