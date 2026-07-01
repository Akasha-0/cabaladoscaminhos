// ============================================================================
// CURATOR SERVICE — Wave 35 (2026-07-01)
// ============================================================================// Camada de domínio para curadores. Centraliza:
//   - Resolução de role (User.role vs ADMIN_EMAIL escape hatch)
//   - Permissões granulares (default conservadora)
//   - Geração/validação de token HMAC para aceite
//   - Auditoria completa (LGPD Art. 37)
//
// Filosofia:
//   - Iyá pode tudo exceto revogar a si mesma
//   - Curador só tem o que está explicitamente em permissions
//   - Guest curator tem permissões timeboxed (guestExpiresAt)
// ============================================================================

import 'server-only';
import { createHmac, randomBytes } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { requireAdmin } from '@/lib/admin/session';
import type { CuratorRole, UserRole, CuratorInvitationStatus } from '@prisma/client';

const TOKEN_SECRET = process.env.CURATOR_INVITE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'curator-invite-secret-dev';
const INVITE_TTL_DAYS = parseInt(process.env.CURATOR_INVITE_TTL_DAYS || '14', 10);

const TRADITION_LABELS: Record<string, string> = {
  cabala: 'Cabala',
  ifa: 'Ifá',
  tantra: 'Tantra',
  astrologia: 'Astrologia',
  xamanismo: 'Xamanismo',
  umbanda: 'Umbanda',
  candomble: 'Candomblé',
  reiki: 'Reiki',
  ayurveda: 'Ayurveda',
};

export function traditionLabel(tradition: string): string {
  return TRADITION_LABELS[tradition] || tradition;
}

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface CuratorPermissionSet {
  canApproveContent?: boolean;
  canCurateLibrary?: boolean;
  canModeratePosts?: boolean;
  canInviteCurators?: boolean;
  canReviewOtherTraditions?: boolean;
}

export interface CuratorResolution {
  ok: boolean;
  reason?: 'no_session' | 'not_curator' | 'inactive' | 'wrong_tradition';
  curator?: {
    userId: string;
    profileId: string;
    tradition: string;
    curatorRole: CuratorRole;
    userRole: UserRole;
    permissions: CuratorPermissionSet;
  };
}

// ---------------------------------------------------------------------------
// Role helpers
// ---------------------------------------------------------------------------

const IYA_EMAIL = process.env.IYA_EMAIL || '';

export function isIyaEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return IYA_EMAIL.length > 0 && normalized === IYA_EMAIL.toLowerCase();
}

/**
 * Resolve o User a partir do supabase user.id e retorna o role efetivo.
 * Hierarquia: ADMIN_EMAILS > planoAssinatura='ADMIN' > User.role=IYA > ADMIN > CURATOR > GUEST_CURATOR > USER.
 */
export async function resolveUserRole(userId: string, email?: string | null): Promise<UserRole> {
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (email && adminEmails.includes(email.toLowerCase())) return 'ADMIN';
  if (email && isIyaEmail(email)) return 'IYA';

  try {
    const u = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, planoAssinatura: true, email: true },
    });
    if (!u) return 'USER';
    if (u.planoAssinatura === 'ADMIN') return 'ADMIN';
    if (isIyaEmail(u.email)) return 'IYA';
    return u.role;
  } catch {
    return 'USER';
  }
}

// ---------------------------------------------------------------------------
// Permission helpers
// ---------------------------------------------------------------------------

export function hasPermission(
  permissions: CuratorPermissionSet | null | undefined,
  key: keyof CuratorPermissionSet
): boolean {
  if (!permissions) return false;
  return Boolean(permissions[key]);
}

export function defaultPermissionsFor(role: CuratorRole): CuratorPermissionSet {
  switch (role) {
    case 'IYA':
      return {
        canApproveContent: true,
        canCurateLibrary: true,
        canModeratePosts: true,
        canInviteCurators: true,
        canReviewOtherTraditions: true,
      };
    case 'CURATOR_CABALA':
    case 'CURATOR_IFA':
    case 'CURATOR_TANTRA':
    case 'CURATOR_ASTROLOGIA':
      return {
        canApproveContent: true,
        canCurateLibrary: true,
        canModeratePosts: true,
        canInviteCurators: false,
        canReviewOtherTraditions: false,
      };
    case 'GUEST_CURATOR':
      return {
        canApproveContent: true,
        canCurateLibrary: false,
        canModeratePosts: false,
        canInviteCurators: false,
        canReviewOtherTraditions: false,
      };
    default:
      return {};
  }
}

// ---------------------------------------------------------------------------
// Curator resolution (used by /api/curators/* routes)
// ---------------------------------------------------------------------------

export async function resolveCurator(
  userId: string,
  email: string,
  tradition?: string
): Promise<CuratorResolution> {
  const role = await resolveUserRole(userId, email);

  if (role !== 'IYA' && role !== 'ADMIN' && role !== 'CURATOR' && role !== 'GUEST_CURATOR') {
    return { ok: false, reason: 'not_curator' };
  }

  // Iyá/Admin têm acesso cross-tradição
  if (role === 'IYA' || role === 'ADMIN') {
    return {
      ok: true,
      curator: {
        userId,
        profileId: '',
        tradition: tradition || '',
        curatorRole: role === 'IYA' ? 'IYA' : 'GUEST_CURATOR',
        userRole: role,
        permissions: defaultPermissionsFor('IYA'),
      },
    };
  }

  // Curador regular: precisa de profile ativo
  const profile = await prisma.curatorProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      tradition: true,
      curatorRole: true,
      active: true,
      permissions: true,
      guestExpiresAt: true,
    },
  });

  if (!profile || !profile.active) {
    return { ok: false, reason: 'inactive' };
  }

  if (profile.guestExpiresAt && profile.guestExpiresAt.getTime() < Date.now()) {
    return { ok: false, reason: 'inactive' };
  }

  if (tradition && profile.tradition !== tradition) {
    // Cross-tradição só para Iyá (já tratada acima) — ou se canReviewOtherTraditions
    const perms = (profile.permissions || {}) as CuratorPermissionSet;
    if (!hasPermission(perms, 'canReviewOtherTraditions')) {
      return { ok: false, reason: 'wrong_tradition' };
    }
  }

  const perms = (profile.permissions || {}) as CuratorPermissionSet;

  return {
    ok: true,
    curator: {
      userId,
      profileId: profile.id,
      tradition: profile.tradition,
      curatorRole: profile.curatorRole,
      userRole: role,
      permissions: perms,
    },
  };
}

// ---------------------------------------------------------------------------
// Invitation token
// ---------------------------------------------------------------------------

export function generateInviteToken(): string {
  const random = randomBytes(24).toString('base64url');
  const sig = createHmac('sha256', TOKEN_SECRET).update(random).digest('base64url').slice(0, 22);
  return `cinv_${random}_${sig}`;
}

export function verifyInviteToken(token: string): { valid: boolean; reason?: string } {
  if (!token || !token.startsWith('cinv_')) return { valid: false, reason: 'malformed' };
  const parts = token.split('_');
  if (parts.length !== 3) return { valid: false, reason: 'malformed' };
  const [, random, sig] = parts;
  const expected = createHmac('sha256', TOKEN_SECRET).update(random).digest('base64url').slice(0, 22);
  if (sig.length !== expected.length) return { valid: false, reason: 'sig_mismatch' };
  let diff = 0;
  for (let i = 0; i < sig.length; i++) {
    diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (diff !== 0) return { valid: false, reason: 'sig_mismatch' };
  return { valid: true };
}

export function inviteExpiresAt(): Date {
  return new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);
}

// ---------------------------------------------------------------------------
// Curator list (admin/Iyá dashboard)
// ---------------------------------------------------------------------------

export interface CuratorListItem {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  tradition: string;
  traditionLabel: string;
  curatorRole: CuratorRole;
  active: boolean;
  approvedAt: Date | null;
  approvedBy: string | null;
  approvedByName: string | null;
  stats: {
    articlesApproved: number;
    postsModerated: number;
    npsReceived: number;
  };
  createdAt: Date;
}

export async function listCurators(filters: {
  active?: boolean;
  tradition?: string;
}): Promise<CuratorListItem[]> {
  const profiles = await prisma.curatorProfile.findMany({
    where: {
      active: filters.active,
      tradition: filters.tradition,
    },
    include: {
      user: { select: { id: true, email: true, nomeCompleto: true } },
    },
    orderBy: [{ active: 'desc' }, { createdAt: 'desc' }],
    take: 200,
  });

  // Stats por curador (últimos 30d, do AuditLog)
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const userIds = profiles.map((p) => p.userId);
  const auditRows = await prisma.auditLog.findMany({
    where: {
      actorId: { in: userIds },
      action: { in: ['ARTICLE_APPROVED', 'ARTICLE_REJECTED', 'POST_MODERATED_BY_CURATOR'] },
      createdAt: { gte: since },
    },
    select: { actorId: true, action: true },
  });
  const npsRows = await prisma.npsResponse.findMany({
    where: { userId: { in: userIds }, createdAt: { gte: since } },
    select: { userId: true },
  });

  const statsByUser = new Map<string, { articlesApproved: number; postsModerated: number; npsReceived: number }>();
  for (const id of userIds) {
    statsByUser.set(id, { articlesApproved: 0, postsModerated: 0, npsReceived: 0 });
  }
  for (const row of auditRows) {
    if (!row.actorId) continue;
    const s = statsByUser.get(row.actorId);
    if (!s) continue;
    if (row.action === 'ARTICLE_APPROVED') s.articlesApproved += 1;
    if (row.action === 'POST_MODERATED_BY_CURATOR') s.postsModerated += 1;
  }
  for (const row of npsRows) {
    const s = statsByUser.get(row.userId);
    if (s) s.npsReceived += 1;
  }

  // resolved-by-name lookup from User table (separate small query)
  const approverIds = Array.from(
    new Set(profiles.map((p) => p.approvedBy).filter((v): v is string => Boolean(v)))
  );
  const approvers = approverIds.length
    ? await prisma.user.findMany({
        where: { id: { in: approverIds } },
        select: { id: true, nomeCompleto: true },
      })
    : [];
  const approverMap = new Map(approvers.map((a) => [a.id, a.nomeCompleto]));

  return profiles.map((p) => ({
    id: p.id,
    userId: p.userId,
    email: p.user.email,
    displayName: p.user.nomeCompleto,
    tradition: p.tradition,
    traditionLabel: traditionLabel(p.tradition),
    curatorRole: p.curatorRole,
    active: p.active,
    approvedAt: p.approvedAt,
    approvedBy: p.approvedBy,
    approvedByName: p.approvedBy ? approverMap.get(p.approvedBy) ?? null : null,
    stats: statsByUser.get(p.userId) || { articlesApproved: 0, postsModerated: 0, npsReceived: 0 },
    createdAt: p.createdAt,
  }));
}

export async function listPendingInvitations(): Promise<{
  id: string;
  email: string;
  displayName: string;
  tradition: string;
  traditionLabel: string;
  curatorRole: CuratorRole;
  invitedByName: string;
  status: CuratorInvitationStatus;
  expiresAt: Date;
  createdAt: Date;
}[]> {
  const rows = await prisma.curatorInvitation.findMany({
    where: { status: { in: ['PENDING', 'ACCEPTED'] } },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    take: 50,
  });
  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    displayName: r.displayName,
    tradition: r.tradition,
    traditionLabel: traditionLabel(r.tradition),
    curatorRole: r.curatorRole,
    invitedByName: r.invitedByName,
    status: r.status,
    expiresAt: r.expiresAt,
    createdAt: r.createdAt,
  }));
}

export { requireAdmin };
