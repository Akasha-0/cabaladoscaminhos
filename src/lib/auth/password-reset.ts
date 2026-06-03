// src/lib/auth/password-reset.ts
// Serviço de recuperação de senha para Operators — Fase 25.
//
// Token: 32 bytes aleatórios (64 hex chars), TTL 1h.
// Hash SHA-256 no DB — nunca o token em plain.
// Fluxo:
//   1. generateResetToken(operatorId) → raw token (64 hex)
//   2. validateResetToken(raw) → { operatorId } | null
//   3. consumeResetToken(raw) → void (marca usedAt)
//   4. resetPassword(raw, newPassword) → void (valida, consome, atualiza senha)
//
// IMPORTANTE: raw token só existe em memória durante o fluxo. Nunca
// persiste no DB. O hash SHA-256 é o que vai para o DB.

import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// ============================================================
// CONSTANTES
// ============================================================

/** 32 bytes = 64 hex chars. Bom para tokens de reset (não é chave de cifração). */
const TOKEN_BYTES = 32;
/** TTL padrão: 1 hora. */
export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;
/** Custo bcrypt para a nova senha — alinhado com registro (+/-). */
const BCRYPT_COST = 12;

// ============================================================
// HASHING
// ============================================================

/**
 * Hash SHA-256 do token. Usado para armazenamento no DB.
 * Não é bcrypt — não precisa ser lento (o token já é random 256-bit).
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// ============================================================
// SERVIÇO
// ============================================================

/**
 * Gera um token de reset para o operator.
 *
 * Se já existir token pendente, Remove o(s) existente(s) antes de
 * criar o novo (um token pendente por vez por operador).
 *
 * @returns raw token — o SÓ lugar onde existe. Deve ser enviado
 *         ao operador por email.
 */
export async function generateResetToken(operatorId: string): Promise<string> {
  // Remove tokens pendentes anteriores deste operator.
  await prisma.passwordResetToken.deleteMany({
    where: {
      operatorId,
      usedAt: null,
    },
  });

  const raw = crypto.randomBytes(TOKEN_BYTES).toString('hex');
  const hashed = hashToken(raw);

  await prisma.passwordResetToken.create({
    data: {
      operatorId,
      tokenHash: hashed,
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
    },
  });

  return raw;
}

/**
 * Valida um token de reset.
 *
 * Retorna { operatorId } se válido (existe, não usado, não expirado).
 * Retorna null em qualquer caso de invalidade.
 *
 * NÃO consome o token — apenas valida. `consumeResetToken` faz o consume.
 */
export async function validateResetToken(
  token: string
): Promise<{ operatorId: string } | null> {
  if (!token || typeof token !== 'string') return null;

  const hashed = hashToken(token);
  const now = new Date();

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashed },
  });

  if (!record) return null;
  if (record.usedAt !== null) return null;
  if (record.expiresAt < now) return null;

  return { operatorId: record.operatorId };
}

/**
 * Consome um token de reset (marca usedAt).
 * Deve ser chamada APÓS a senha ser atualizada com sucesso.
 *
 * Não dá erro se o token já foi consumido ou não existe — idempotente.
 */
export async function consumeResetToken(token: string): Promise<void> {
  const hashed = hashToken(token);

  await prisma.passwordResetToken.updateMany({
    where: {
      tokenHash: hashed,
      usedAt: null, // só marca se ainda não foi usado
    },
    data: {
      usedAt: new Date(),
    },
  });
}

/**
 * Reseta a senha de um operator dado o token raw.
 *
 * Fluxo atômico:
 *   1. Valida token
 *   2. Atualiza passwordHash
 *   3. Consome token
 *
 * @returns { ok: true } em sucesso.
 * @returns { ok: false; reason: 'invalid-token' | 'expired' | 'used' }
 *          em falha.
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<{ ok: true } | { ok: false; reason: 'invalid-token' | 'expired' | 'used' }> {
  // Validação básica da senha
  if (!newPassword || typeof newPassword !== 'string') {
    return { ok: false, reason: 'invalid-token' };
  }
  if (newPassword.length < 8) {
    return { ok: false, reason: 'invalid-token' };
  }

  const hashed = hashToken(token);
  const now = new Date();

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashed },
  });

  if (!record) return { ok: false, reason: 'invalid-token' };
  if (record.usedAt !== null) return { ok: false, reason: 'used' };
  if (record.expiresAt < now) return { ok: false, reason: 'expired' };

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_COST);

  // Transação: atualiza senha E marca token como usado.
  // Se uma das duas falhar, rollback — token não fica órfão.
  await prisma.$transaction([
    prisma.operator.update({
      where: { id: record.operatorId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: now },
    }),
  ]);

  return { ok: true };
}
