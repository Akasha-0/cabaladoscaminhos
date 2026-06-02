// src/lib/auth/operator-mfa.ts
// Manager de MFA (TOTP) para Operators ADMIN — Fase 20.
//
// Funções de alto nível que orquestram TOTP + encryption + DB.
//
// Fluxos:
//   1. setup(operator)         → gera secret, recovery codes, persiste
//                                OperatorMfa com enabled=false. Retorna
//                                { secret, qrDataUrl, recoveryCodes }
//                                para o cliente renderizar.
//   2. verifySetup(operator, code) → valida primeiro TOTP, marca enabled=true.
//                                Se falhar, mantém enabled=false e o
//                                operator pode tentar de novo.
//   3. consumeChallenge(operator, code) → valida código TOTP durante
//                                o challenge pós-login. Retorna
//                                { ok, delta, stepUsed }.
//   4. consumeRecovery(operator, code) → valida um dos 10 recovery
//                                codes, marca slot como consumido.
//   5. disable(operator, password) → re-autentica com senha, apaga
//                                OperatorMfa.
//
// O "single-use" de códigos TOTP é implementado via `lastUsedStep` no
// OperatorMfa — depois de um código ser usado, salvamos o step Unix / 30
// e rejeitamos códigos no mesmo step na próxima chamada.
//
// O "single-use" de recovery codes é por slot: `recoveryCodesHash` é
// um array de 10 posições; após usar a posição N, gravamos "" nela.

import { prisma } from '@/lib/prisma';
import type { Operator, OperatorMfa } from '@prisma/client';
import {
  RECOVERY_CODE_COUNT,
  buildOtpAuthUrl,
  decryptSecret,
  encryptSecret,
  generateQrCodeDataUrl,
  generateRecoveryCodes,
  generateTotpSecret,
  hashRecoveryCode,
  tryConsumeRecoveryCode,
  verifyTotpCode,
} from './operator-totp';

// ============================================================================
// Tipos públicos
// ============================================================================

/** Resultado de setup() — contém o secret plain (exibido UMA vez). */
export interface MfaSetupResult {
  /** Secret TOTP em base32. Cliente deve mostrar pro operador ESCANEAR. */
  secret: string;
  /** QR code (data URL PNG) pra exibir no front. */
  qrDataUrl: string;
  /** URL otpauth:// crua (alternativa ao QR, para apps que aceitam texto). */
  otpauthUrl: string;
  /** 10 recovery codes plain text. Cliente DEVE mostrar pro operador. */
  recoveryCodes: string[];
}

/** Resultado de consumeChallenge / consumeRecovery. */
export type MfaConsumeResult =
  | { ok: true; method: 'totp' | 'recovery' }
  | { ok: false; reason: 'invalid' | 'not-enabled' | 'no-mfa' };

// ============================================================================
// Helpers internos
// ============================================================================

/**
 * Carrega OperatorMfa do DB. Retorna `null` se não existe.
 */
async function loadMfa(operatorId: string): Promise<OperatorMfa | null> {
  return prisma.operatorMfa.findUnique({ where: { operatorId } });
}

/**
 * Decifra o secret TOTP. Retorna `null` se o registro não existe
 * OU se a descriptografia falha (key errada, tag mismatch).
 *
 * Caller deve checar `mfa == null` separadamente (significa MFA
 * não configurado) vs `secret == null` (MFA existe mas DB/key
 * corrompido — erro operacional).
 */
async function getDecryptedSecret(mfa: OperatorMfa): Promise<string | null> {
  const result = decryptSecret(mfa.secretEncrypted);
  if (!result.ok) return null;
  return result.plaintext;
}

/**
 * Parse do array de recovery codes. O campo é `String` no Prisma
 * (SQLite/Postgres não tem String[] nativo), então serializamos JSON.
 * Em caso de JSON malformado, retornamos array de "" (força re-setup).
 */
function parseRecoveryCodes(json: string): string[] {
  try {
    const arr = JSON.parse(json);
    if (Array.isArray(arr) && arr.length === RECOVERY_CODE_COUNT) {
      return arr.map((s) => (typeof s === 'string' ? s : ''));
    }
  } catch {
    // ignore
  }
  return Array(RECOVERY_CODE_COUNT).fill('');
}

/**
 * Serializa o array de recovery codes para o formato do DB.
 */
function serializeRecoveryCodes(codes: string[]): string {
  return JSON.stringify(codes);
}

// ============================================================================
// API pública
// ============================================================================

/**
 * Indica se o operator tem MFA ativo. Use no /login para decidir
 * se emite par access+refresh direto ou mfaToken.
 */
export async function isMfaEnabled(operatorId: string): Promise<boolean> {
  const mfa = await loadMfa(operatorId);
  return mfa?.enabled === true;
}

/**
 * Setup inicial. Gera secret + recovery codes, persiste OperatorMfa
 * com `enabled=false` (operator ainda precisa validar primeiro TOTP).
 *
 * Idempotência: se já existe OperatorMfa para o operator, SOBRESCREVE
 * (rotação completa). Útil se operator abortou setup ou perdeu recovery
 * codes. Os recovery codes antigos ficam órfãos no DB (não temos
 * `used` flag por código — após rotação, conta de novo é 10).
 *
 * @param operator Operator (com id, email, role)
 * @returns MfaSetupResult para o cliente renderizar QR + recovery codes
 */
export async function setupMfa(operator: Pick<Operator, 'id' | 'email'>): Promise<MfaSetupResult> {
  const secret = generateTotpSecret();
  const recoveryCodes = generateRecoveryCodes();
  const recoveryHashes = await Promise.all(recoveryCodes.map(hashRecoveryCode));
  const otpauthUrl = buildOtpAuthUrl({ secret, accountName: operator.email });
  const qrDataUrl = await generateQrCodeDataUrl(otpauthUrl);

  const secretEncrypted = encryptSecret(secret);
  const recoveryCodesHash = serializeRecoveryCodes(recoveryHashes);

  // Upsert: se já existe, sobrescreve (rotação).
  await prisma.operatorMfa.upsert({
    where: { operatorId: operator.id },
    create: {
      operatorId: operator.id,
      secretEncrypted,
      enabled: false,
      recoveryCodesHash,
    },
    update: {
      secretEncrypted,
      enabled: false,
      recoveryCodesHash,
    },
  });

  return { secret, qrDataUrl, otpauthUrl, recoveryCodes };
}

/**
 * Verifica o primeiro código TOTP enviado pelo operator. Se OK,
 * marca `enabled=true` e o MFA passa a ser exigido no login.
 *
 * Falha de código NÃO apaga o OperatorMfa — operator pode tentar
 * de novo enquanto o setup está em andamento.
 */
export async function verifySetupMfa(params: {
  operatorId: string;
  code: string;
}): Promise<{ ok: true } | { ok: false; reason: 'no-setup' | 'invalid' }> {
  const mfa = await loadMfa(params.operatorId);
  if (!mfa) return { ok: false, reason: 'no-setup' };
  // Se já está enabled, re-verificar não tem efeito (idempotente).
  if (mfa.enabled) return { ok: true };

  const secret = await getDecryptedSecret(mfa);
  if (!secret) return { ok: false, reason: 'invalid' };

  const result = verifyTotpCode({ secretBase32: secret, code: params.code });
  if (!result.ok) return { ok: false, reason: 'invalid' };

  await prisma.operatorMfa.update({
    where: { operatorId: params.operatorId },
    data: { enabled: true },
  });
  return { ok: true };
}

/**
 * Consome um código TOTP durante o challenge pós-login. Após sucesso,
 * persiste `lastUsedStep` para prevenir reuso dentro da janela de drift.
 *
 * @returns { ok: true, method: 'totp' } em sucesso, ou falha.
 */
// fallow-ignore-next-line complexity
export async function consumeMfaChallenge(params: {
  operatorId: string;
  code: string;
}): Promise<MfaConsumeResult> {
  const mfa = await loadMfa(params.operatorId);
  if (!mfa) return { ok: false, reason: 'no-mfa' };
  if (!mfa.enabled) return { ok: false, reason: 'not-enabled' };

  const secret = await getDecryptedSecret(mfa);
  if (!secret) return { ok: false, reason: 'invalid' };

  const result = verifyTotpCode({ secretBase32: secret, code: params.code });
  if (!result.ok) return { ok: false, reason: 'invalid' };

  // Single-use: rejeita códigos no mesmo step.
  if (mfa.lastUsedStep !== null && mfa.lastUsedStep === result.stepUsed) {
    return { ok: false, reason: 'invalid' };
  }

  await prisma.operatorMfa.update({
    where: { operatorId: params.operatorId },
    data: { lastUsedStep: result.stepUsed },
  });

  return { ok: true, method: 'totp' };
}

/**
 * Consome um recovery code. Encontra o slot cujo bcrypt bate, marca
 * como consumido (substitui por "" no array) e retorna ok.
 *
 * @returns { ok: true, method: 'recovery' } em sucesso, ou falha.
 */
export async function consumeRecoveryCode(params: {
  operatorId: string;
  code: string;
}): Promise<MfaConsumeResult> {
  const mfa = await loadMfa(params.operatorId);
  if (!mfa) return { ok: false, reason: 'no-mfa' };
  if (!mfa.enabled) return { ok: false, reason: 'not-enabled' };

  const codes = parseRecoveryCodes(mfa.recoveryCodesHash);
  const index = await tryConsumeRecoveryCode(codes, params.code);
  if (index === null) return { ok: false, reason: 'invalid' };

  // Marca slot como consumido
  const next = [...codes];
  next[index] = '';
  await prisma.operatorMfa.update({
    where: { operatorId: params.operatorId },
    data: { recoveryCodesHash: serializeRecoveryCodes(next) },
  });
  return { ok: true, method: 'recovery' };
}

/**
 * Desativa o MFA. Requer re-autenticação por senha (defense-in-depth:
 * se sessão for roubada E MFA for "esquecido" por engano, atacante
 * não pode desabilitar sem senha).
 *
 * @param operator Operator completo (com passwordHash)
 * @param password Senha em plain (validação via bcrypt)
 * @returns ok=true se desabilitado, ou motivo da falha.
 */
export async function disableMfa(params: {
  operator: Pick<Operator, 'id' | 'passwordHash'>;
  password: string;
}): Promise<{ ok: true } | { ok: false; reason: 'wrong-password' | 'no-mfa' }> {
  const bcrypt = (await import('bcryptjs')).default;
  const ok = await bcrypt.compare(params.password, params.operator.passwordHash);
  if (!ok) return { ok: false, reason: 'wrong-password' };

  // Apaga OperatorMfa (cascade deleta via FK)
  const deleted = await prisma.operatorMfa
    .delete({ where: { operatorId: params.operator.id } })
    .catch(() => null);
  if (!deleted) return { ok: false, reason: 'no-mfa' };

  return { ok: true };
}
