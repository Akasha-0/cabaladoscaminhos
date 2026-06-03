// src/lib/auth/account-lockout.ts
// Fase 26 — Account Lockout Service
//
// Protege contra brute-force no login por email (NÃO por IP — isso é
// responsabilidade do rate-limit em rate-limit.ts).
//
// Fluxo:
//   - 5 tentativas falhas consecutivas → 30min de lockout
//   - Login OK → reseta contador E limpa lockout
//   - Unlock administrativo → reseta tudo
//
// all methods: prisma.operator.update({ where: { email } })

import { prisma } from '@/lib/prisma';

/** Máximo de tentativas falhas ANTES de bloquear a conta. */
export const MAX_ATTEMPTS = 5;

/** Duração do bloqueio em minutos após exceder MAX_ATTEMPTS. */
export const LOCKOUT_DURATION_MINUTES = 30;

/**
 * Verifica se a conta está bloqueada.
 *
 * Retorna { locked: true, until } se:
 *   - failedLoginAttempts >= MAX_ATTEMPTS  E
 *   - lockedUntil > now
 *
 * Caso contrário, retorna { locked: false }.
 *
 * IMPORTANTE: nunca revela se o email existe no banco — retorna
 * { locked: false } para emails desconhecidos para evitar enumeração.
 */
export async function isLocked(email: string): Promise<{ locked: boolean; until?: Date }> {
  const operator = await prisma.operator.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { failedLoginAttempts: true, lockedUntil: true },
  });

  if (!operator) {
    // Email não existe — não está bloqueado (não revela existência)
    return { locked: false };
  }

  const now = new Date();
  if (
    operator.failedLoginAttempts >= MAX_ATTEMPTS &&
    operator.lockedUntil !== null &&
    operator.lockedUntil > now
  ) {
    return { locked: true, until: operator.lockedUntil };
  }

  return { locked: false };
}

/**
 * Registra uma tentativa de login FALHA.
 *
 * Incrementa failedLoginAttempts e, se atingir MAX_ATTEMPTS,
 * define lockedUntil = now + LOCKOUT_DURATION_MINUTES.
 *
 * Se a conta já está bloqueada, não faz nada (evita incrementar
 * indefinidamente durante o lockout).
 */
export async function recordFailedAttempt(email: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();

  const operator = await prisma.operator.findUnique({
    where: { email: normalizedEmail },
    select: { failedLoginAttempts: true },
  });

  if (!operator) {
    // Email não existe — ignorar
    return;
  }

  // Não incrementar se já está bloqueado
  const now = new Date();
  if (
    operator.failedLoginAttempts >= MAX_ATTEMPTS &&
    operator.lockedUntil !== null &&
    operator.lockedUntil > now
  ) {
    return;
  }

  const newAttempts = operator.failedLoginAttempts + 1;

  // Só define lockedUntil quando atinge o limite
  const lockedUntil = newAttempts >= MAX_ATTEMPTS
    ? new Date(now.getTime() + LOCKOUT_DURATION_MINUTES * 60 * 1000)
    : undefined;

  await prisma.operator.update({
    where: { email: normalizedEmail },
    data: {
      failedLoginAttempts: newAttempts,
      ...(lockedUntil !== undefined ? { lockedUntil } : {}),
    },
  });
}

/**
 * Registra um login BEM-SUCEDIDO.
 *
 * Sempre reseta failedLoginAttempts para 0 E limpa lockedUntil,
 * mesmo que a conta não estivesse bloqueada (idempotente).
 */
export async function recordSuccessfulLogin(email: string): Promise<void> {
  await prisma.operator.update({
    where: { email: email.toLowerCase().trim() },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  }).catch(() => {
    // Ignora se o operador não existe (idempotente)
  });
}

/**
 * Unlock administrativo — reseta manualmente a conta.
 *
 * Usado por admins no endpoint POST /api/admin/operators/[id]/unlock.
 */
export async function unlockAccount(email: string): Promise<void> {
  await prisma.operator.update({
    where: { email: email.toLowerCase().trim() },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  }).catch(() => {
    // Ignora se o operador não existe
  });
}
