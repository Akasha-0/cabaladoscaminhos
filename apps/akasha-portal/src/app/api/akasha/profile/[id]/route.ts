/**
 * DELETE /api/akasha/profile/[id] — Wave 8.3 (LGPD Art. 18 — direito ao esquecimento)
 *
 * Apaga um User e TODOS os dados relacionados em cascata (BirthChart,
 * Subscription, Manifesto, Caminhante, Caminhada, Sessao, SessaoChunk,
 * GrimorioPessoal, NotasConsulente, MapaCalculo, Pilar6Calculo,
 * Pilar7Calculo, Pilar7Estagio, Connection, Consultation, etc.).
 *
 * Schema Prisma já define `onDelete: Cascade` em todas as relations do User
 * (e em cascata User->Caminhante->Caminhada->Sessao->SessaoChunk via
 * `zeladorId`), então `prisma.user.delete` propaga automaticamente.
 *
 * Modos:
 *   - ?dryRun=true  → retorna counts de tudo que SERIA deletado. NÃO deleta.
 *   - default       → deleta + retorna counts do que foi removido.
 *
 * Auth:
 *   - Requer Bearer token (akasha-jwt via cookie).
 *   - Apenas o próprio user OU role=ADMIN pode deletar.
 *   - Qualquer outro retorna 403.
 *
 * Auditoria:
 *   - Loga "profile_delete_requested" antes (com dryRun flag).
 *   - Loga "profile_delete_completed" depois (com cascaded counts).
 *   - Loga "profile_delete_failed" em caso de erro (com reason).
 *
 * Erros:
 *   - 401 unauthorized (sem token válido)
 *   - 403 forbidden (user não é dono e não é admin)
 *   - 404 not found (userId inexistente)
 *   - 500 internal error (falha no delete)
 *
 * Imports: `requireAkashaApi` aceita cookies+Bearer; `auditLog` é stub
 * stdout-only (ver lib/infrastructure/audit-log.ts).
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { prisma } from '@/lib/infrastructure/prisma';
import { auditLog, hashIpForAudit, extractClientIp } from '@/lib/infrastructure/audit-log';
import {
  hardDeleteAccount,
  countCascadedData,
} from '@/lib/application/lgpd/delete-account';

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * Conta quantos registros seriam deletados em cascata para o userId.
 *
 * DEPRECATED (Wave 19.2): mantido como shim para Wave 8.3 callers que
 * usavam o route handler Wave 8.3 para dry-run. Lógica foi movida para
 * `countCascadedData` em `lib/application/lgpd/delete-account.ts`.
 */
async function countCascaded(userId: string) {
  return countCascadedData(userId);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  // 1. Auth
  const auth = await requireAkashaApi(request);
  if (auth instanceof NextResponse) return auth;

  const { id: targetUserId } = await params;

  if (!targetUserId || typeof targetUserId !== 'string') {
    return NextResponse.json(
      { error: 'id do perfil é obrigatório' },
      { status: 400 },
    );
  }

  // requireAkashaApi retorna {id,email,name} (sem role). Precisamos do
  // role para checar permissão admin. 1 query extra, só em DELETE profile.
  const authWithRole = await prisma.user.findUnique({
    where: { id: auth.id },
    select: { role: true },
  });
  const actorRole = authWithRole?.role ?? 'MEMBER';

  // 2. Verifica existência do alvo ANTES de checar permissão — assim
  // inexistentes retornam 404, não 403 (importante para audit/sanidade).
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, email: true },
  });

  if (!targetUser) {
    return NextResponse.json(
      { error: 'Perfil não encontrado' },
      { status: 404 },
    );
  }

  // 3. Permissão: só o próprio user OU admin
  const isOwner = auth.id === targetUserId;
  const isAdmin = actorRole === 'ADMIN';
  if (!isOwner && !isAdmin) {
    auditLog({
      action: 'profile_delete_failed',
      userId: auth.id,
      metadata: {
        targetUserId,
        reason: 'forbidden',
        actorRole,
      },
    });
    return NextResponse.json(
      { error: 'Acesso negado: você só pode deletar seu próprio perfil' },
      { status: 403 },
    );
  }

  const dryRun = new URL(request.url).searchParams.get("dryRun") === "true";

  // 5. DRY RUN: conta sem deletar (LGPD Art. 18 §2 — confirmação)
  if (dryRun) {
    const cascaded = await countCascaded(targetUserId);
    return NextResponse.json({
      deleted: false,
      dryRun: true,
      cascaded,
      warning:
        'Nenhum dado foi deletado. Refaça a chamada sem ?dryRun=true para confirmar.',
    });
  }

  // 6. DELETE real: delega para helper unificado (Wave 19.2).
  // O helper cuida de snapshot ANTES do delete, audit log requested/completed,
  // e cascade via onDelete: Cascade no schema Prisma.
  const ipHash = hashIpForAudit(extractClientIp(request.headers));
  const requestId = request.headers.get('x-request-id') ?? undefined;

  try {
    const result = await hardDeleteAccount({
      auth,
      actorRole,
      targetUserId,
      ipHash,
      requestId,
    });
    return NextResponse.json({
      deleted: true,
      cascaded: result.cascaded,
      message:
        'Perfil e todos os dados associados foram removidos em conformidade com a LGPD Art. 18.',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Permissão negada → 403; perfil inexistente → 404; resto → 500.
    if (message.includes('Acesso negado')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    if (message.includes('não encontrado')) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Falha ao deletar perfil. Tente novamente.' },
      { status: 500 },
    );
  }
}