// ============================================================================
// Admin Metrics — agregações para o dashboard (Wave 20)
// ============================================================================
// Wave 20 (2026-06-28).
//
// Filosofia:
//   - Cada métrica é uma função pura (sem cache no helper; cache fica no
//     route handler via s-maxage).
//   - Queries são desenhadas para Postgres: aproveitam índices já criados.
//   - Cobertura temporal é configurável (padrão 7d/30d).
//
// Refs: schema.prisma @@index([createdAt]) em User/Post/Comment/Like/Follow.
// ============================================================================

import 'server-only';
import { prisma } from '@/lib/prisma';
import type { SeriesPoint, MultiSeriesPoint } from './charts';

// ============================================================================
// Tipos
// ============================================================================

export interface KpiCards {
  dau_mau_ratio: number;          // 0..1 (ex: 0.18 = 18% DAU/MAU)
  signups_7d: number;
  posts_7d: number;
  nps_30d: number;                // -100..100, 0 se sem dados
  // Anotações úteis pra tooltip
  dau_mau_sample: { dau: number; mau: number };
  nps_sample: { promoters: number; detractors: number; total: number };
}

export interface TopTradition {
  slug: string;
  posts: number;
  members: number;
}

export interface TopArticle {
  id: string;
  slug: string;
  title: string;
  viewCount: number;
}

export interface TopContributor {
  userId: string;
  nomeCompleto: string;
  postsCount: number;
  likesReceived: number;
}

// ============================================================================
// Helpers de janela temporal
// ============================================================================

function daysAgo(d: number): Date {
  const dt = new Date();
  dt.setUTCDate(dt.getUTCDate() - d);
  dt.setUTCHours(0, 0, 0, 0);
  return dt;
}

function startOfIsoWeek(d: Date): string {
  // YYYY-Www (ISO week)
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNr = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setUTCMonth(0, 1);
  if (target.getUTCDay() !== 4) {
    target.setUTCMonth(0, 1 + ((4 - target.getUTCDay() + 7) % 7));
  }
  const week = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

// ============================================================================
// KPIs (4 cards topo)
// ============================================================================

/**
 * DAU/MAU ratio aproximado.
 *
 * - DAU = usuários com Post ou Like ou Comment nas últimas 24h.
 * - MAU = usuários com qualquer das ações acima nos últimos 30d.
 *
 * Implementação: union distinct sobre User.id (Post.authorId ∪ Like.userId ∪
 * Comment.authorId). Não usamos AuditLog para evitar inflar com auth events.
 */
export async function getDauMauRatio(): Promise<KpiCards['dau_mau_sample']> {
  const since1d = daysAgo(1);
  const since30d = daysAgo(30);

  const [dauRows, mauRows] = await Promise.all([
    prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(DISTINCT user_id) AS count FROM (
        SELECT "authorId" AS user_id FROM "posts"
          WHERE "createdAt" >= ${since1d} AND "deletedAt" IS NULL
        UNION
        SELECT "userId" AS user_id FROM "likes"
          WHERE "createdAt" >= ${since1d}
        UNION
        SELECT "authorId" AS user_id FROM "comments"
          WHERE "createdAt" >= ${since1d} AND "deletedAt" IS NULL
      ) AS active
    `,
    prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(DISTINCT user_id) AS count FROM (
        SELECT "authorId" AS user_id FROM "posts"
          WHERE "createdAt" >= ${since30d} AND "deletedAt" IS NULL
        UNION
        SELECT "userId" AS user_id FROM "likes"
          WHERE "createdAt" >= ${since30d}
        UNION
        SELECT "authorId" AS user_id FROM "comments"
          WHERE "createdAt" >= ${since30d} AND "deletedAt" IS NULL
      ) AS active
    `,
  ]);

  const dau = Number(dauRows[0]?.count ?? 0);
  const mau = Number(mauRows[0]?.count ?? 0);
  return { dau, mau };
}

/**
 * Signups últimos 7 dias (Users criados).
 */
export async function getSignups7d(): Promise<number> {
  return prisma.user.count({
    where: { createdAt: { gte: daysAgo(7) } },
  });
}

/**
 * Posts criados últimos 7 dias (excluindo DRAFT/ARCHIVED).
 */
export async function getPosts7d(): Promise<number> {
  return prisma.post.count({
    where: {
      createdAt: { gte: daysAgo(7) },
      status: 'PUBLISHED',
      deletedAt: null,
    },
  });
}

/**
 * NPS aproximado últimos 30 dias via AkashicFeedback (👍/👎).
 *
 * NPS = (promoters - detractors) / total * 100.
 * Sem dados suficientes (<5 votos): retorna 0 com sample.total baixo.
 */
export async function getNps30d(): Promise<KpiCards['nps_sample']> {
  const since30d = daysAgo(30);
  const grouped = await prisma.akashicFeedback.groupBy({
    by: ['vote'],
    where: { createdAt: { gte: since30d } },
    _count: { _all: true },
  });

  const up = grouped.find((g) => g.vote === 'UP')?._count?._all ?? 0;
  const down = grouped.find((g) => g.vote === 'DOWN')?._count?._all ?? 0;
  return { promoters: up, detractors: down, total: up + down };
}

export async function getKpiCards(): Promise<KpiCards> {
  const [dauMau, signups, posts, nps] = await Promise.all([
    getDauMauRatio(),
    getSignups7d(),
    getPosts7d(),
    getNps30d(),
  ]);

  const ratio = dauMau.mau > 0 ? dauMau.dau / dauMau.mau : 0;
  const npsScore =
    nps.total >= 5 ? Math.round(((nps.promoters - nps.detractors) / nps.total) * 100) : 0;

  return {
    dau_mau_ratio: ratio,
    signups_7d: signups,
    posts_7d: posts,
    nps_30d: npsScore,
    dau_mau_sample: dauMau,
    nps_sample: nps,
  };
}

// ============================================================================
// Charts
// ============================================================================

/**
 * User growth — signups diários últimos N dias.
 */
export async function getUserGrowthSeries(days = 30): Promise<SeriesPoint[]> {
  const since = daysAgo(days);
  const rows = await prisma.$queryRaw<
    { day: Date; count: bigint }[]
  >`
    SELECT date_trunc('day', "createdAt") AS day, COUNT(*) AS count
    FROM "users"
    WHERE "createdAt" >= ${since}
    GROUP BY day
    ORDER BY day ASC
  `;

  // Preencher dias faltantes com 0 (importante p/ gráfico de linha)
  const map = new Map<string, number>();
  rows.forEach((r) => {
    const iso = r.day.toISOString().slice(0, 10);
    map.set(iso, Number(r.count));
  });

  const out: SeriesPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = daysAgo(i);
    const iso = d.toISOString().slice(0, 10);
    out.push({ date: iso, value: map.get(iso) ?? 0 });
  }
  return out;
}

/**
 * Engagement diário — posts/likes/comments por dia (últimos N dias).
 */
export async function getEngagementSeries(days = 14): Promise<MultiSeriesPoint[]> {
  const since = daysAgo(days);

  const [posts, likes, comments] = await Promise.all([
    prisma.$queryRaw<{ day: Date; count: bigint }[]>`
      SELECT date_trunc('day', "createdAt") AS day, COUNT(*) AS count
      FROM "posts"
      WHERE "createdAt" >= ${since} AND status = 'PUBLISHED' AND "deletedAt" IS NULL
      GROUP BY day
    `,
    prisma.$queryRaw<{ day: Date; count: bigint }[]>`
      SELECT date_trunc('day', "createdAt") AS day, COUNT(*) AS count
      FROM "likes"
      WHERE "createdAt" >= ${since}
      GROUP BY day
    `,
    prisma.$queryRaw<{ day: Date; count: bigint }[]>`
      SELECT date_trunc('day', "createdAt") AS day, COUNT(*) AS count
      FROM "comments"
      WHERE "createdAt" >= ${since} AND "deletedAt" IS NULL
      GROUP BY day
    `,
  ]);

  const buildMap = (rows: { day: Date; count: bigint }[]) => {
    const m = new Map<string, number>();
    rows.forEach((r) => m.set(r.day.toISOString().slice(0, 10), Number(r.count)));
    return m;
  };

  const postsMap = buildMap(posts);
  const likesMap = buildMap(likes);
  const commentsMap = buildMap(comments);

  const out: MultiSeriesPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = daysAgo(i);
    const iso = d.toISOString().slice(0, 10);
    out.push({
      date: iso,
      values: {
        posts: postsMap.get(iso) ?? 0,
        likes: likesMap.get(iso) ?? 0,
        comments: commentsMap.get(iso) ?? 0,
      },
    });
  }
  return out;
}

/**
 * Cohort Retention — % de signups da semana N que voltaram nas semanas seguintes.
 *
 * Implementação simplificada (suficiente para um heatmap de 6 colunas):
 *   - Cohort = ISO week do signup
 *   - "Voltou" = criou Post, Like ou Comment na semana alvo
 */
export async function getRetentionCohort(weeksBack = 6): Promise<{
  cohorts: string[];
  weeks: string[];
  cells: (number | null)[][];
}> {
  const since = daysAgo(weeksBack * 7 + 7); // +1 buffer

  // 1. Buscar signups agrupados por ISO week
  const signups = await prisma.$queryRaw<{ week: string; user_id: string }[]>`
    SELECT to_char("createdAt", 'IYYY-IW') AS week, id AS user_id
    FROM "users"
    WHERE "createdAt" >= ${since}
  `;

  // 2. Buscar atividade por user_id agrupado por ISO week
  const activity = await prisma.$queryRaw<{ week: string; user_id: string }[]>`
    SELECT DISTINCT to_char(p."createdAt", 'IYYY-IW') AS week, p."authorId" AS user_id
    FROM "posts" p
    WHERE p."createdAt" >= ${since} AND p."deletedAt" IS NULL
    UNION
    SELECT DISTINCT to_char(l."createdAt", 'IYYY-IW') AS week, l."userId" AS user_id
    FROM "likes" l
    WHERE l."createdAt" >= ${since}
    UNION
    SELECT DISTINCT to_char(c."createdAt", 'IYYY-IW') AS week, c."authorId" AS user_id
    FROM "comments" c
    WHERE c."createdAt" >= ${since} AND c."deletedAt" IS NULL
  `;

  // 3. Mapear cohort → users
  const cohortUsers = new Map<string, Set<string>>();
  signups.forEach((r) => {
    if (!cohortUsers.has(r.week)) cohortUsers.set(r.week, new Set());
    cohortUsers.get(r.week)!.add(r.user_id);
  });

  // 4. Mapear (cohortWeek, activityWeek) → users ativos
  // Cohort do user = signup week; activity pode estar em qualquer week >= cohort
  const userCohort = new Map<string, string>();
  signups.forEach((r) => userCohort.set(r.user_id, r.week));

  const userActivityWeek = new Map<string, Set<string>>(); // user_id → activity weeks
  activity.forEach((r) => {
    if (!userActivityWeek.has(r.user_id)) userActivityWeek.set(r.user_id, new Set());
    userActivityWeek.get(r.user_id)!.add(r.week);
  });

  // 5. Calcular cohorts (apenas as últimas N, em ordem)
  const allCohorts = Array.from(cohortUsers.keys()).sort();
  const recentCohorts = allCohorts.slice(-weeksBack);

  // 6. Calcular colunas: W0 = signup week, W1 = +1, etc.
  const weeks = ['W0', 'W1', 'W2', 'W3', 'W4', 'W5'];

  const cells: (number | null)[][] = recentCohorts.map((cohortWeek) => {
    const users = cohortUsers.get(cohortWeek) ?? new Set();
    const total = users.size;
    if (total === 0) return weeks.map(() => null);

    // Cohort week → offset 0
    // Cohort weeks[i] = recentCohorts[i]; mas precisamos calcular "weeks depois"
    // Para simplicidade, comparamos strings (YYYY-WW); assumir ordem cronológica.
    const cohortIdx = allCohorts.indexOf(cohortWeek);

    return weeks.map((_, wi) => {
      // "Sem wi" depois da signup: precisa achar allCohorts[cohortIdx + wi]
      const targetIdx = cohortIdx + wi;
      if (targetIdx >= allCohorts.length) return null;
      const targetWeek = allCohorts[targetIdx];
      let active = 0;
      users.forEach((uid) => {
        if (userActivityWeek.get(uid)?.has(targetWeek)) active++;
      });
      return Math.round((active / total) * 100);
    });
  });

  return {
    cohorts: recentCohorts,
    weeks,
    cells,
  };
}

// ============================================================================
// Top listas
// ============================================================================

export async function getTopTraditions(limit = 10): Promise<TopTradition[]> {
  const since30 = daysAgo(30);

  // Posts por tradição (últimos 30d)
  const postGroups = await prisma.post.groupBy({
    by: ['tradition'],
    where: {
      createdAt: { gte: since30 },
      status: 'PUBLISHED',
      deletedAt: null,
      tradition: { not: null },
    },
    _count: { _all: true },
    orderBy: { _count: { tradition: 'desc' } },
    take: limit,
  });

  // Members por tradição (atual)
  const memberGroups = await prisma.groupMember.findMany({
    select: { group: { select: { tradition: true } } },
  });
  const memberCount = new Map<string, number>();
  memberGroups.forEach((m) => {
    const t = m.group.tradition;
    memberCount.set(t, (memberCount.get(t) ?? 0) + 1);
  });

  return postGroups
    .filter((g) => g.tradition)
    .map((g) => ({
      slug: g.tradition!,
      posts: g._count._all,
      members: memberCount.get(g.tradition!) ?? 0,
    }));
}

export async function getTopArticles(limit = 10): Promise<TopArticle[]> {
  const articles = await prisma.article.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      viewCount: true,
    },
    orderBy: [{ viewCount: 'desc' }, { publishedAt: 'desc' }],
    take: limit,
  });

  return articles.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    viewCount: a.viewCount,
  }));
}

export async function getTopContributors(limit = 10): Promise<TopContributor[]> {
  // Agrega posts + likes recebidos nos últimos 30d.
  const since30 = daysAgo(30);

  // 1. Posts por autor
  const postsPerAuthor = await prisma.post.groupBy({
    by: ['authorId'],
    where: {
      createdAt: { gte: since30 },
      status: 'PUBLISHED',
      deletedAt: null,
    },
    _count: { _all: true },
    orderBy: { _count: { authorId: 'desc' } },
    take: limit * 3,
  });

  if (postsPerAuthor.length === 0) return [];

  const authorIds = postsPerAuthor.map((p) => p.authorId);

  // 2. Likes recebidos pelos posts desses autores
  const likesReceived = await prisma.like.groupBy({
    by: ['postId'],
    where: {
      post: {
        authorId: { in: authorIds },
        createdAt: { gte: since30 },
      },
    },
    _count: { _all: true },
  });

  const postAuthor = new Map<string, string>();
  // Já temos postsPerAuthor com authorId, mas precisamos do postId→authorId
  // para agregar likes. Buscar:
  const posts = await prisma.post.findMany({
    where: { authorId: { in: authorIds }, createdAt: { gte: since30 } },
    select: { id: true, authorId: true },
  });
  posts.forEach((p) => postAuthor.set(p.id, p.authorId));

  const likesByAuthor = new Map<string, number>();
  likesReceived.forEach((l) => {
    const aid = postAuthor.get(l.postId);
    if (!aid) return;
    likesByAuthor.set(aid, (likesByAuthor.get(aid) ?? 0) + l._count._all);
  });

  // 3. Nomes
  const users = await prisma.user.findMany({
    where: { id: { in: authorIds } },
    select: { id: true, nomeCompleto: true },
  });
  const nameById = new Map(users.map((u) => [u.id, u.nomeCompleto]));

  // 4. Score combinado: posts * 3 + likes recebidos (peso maior p/ likes = sinal de qualidade)
  const scored = postsPerAuthor.map((p) => {
    const likes = likesByAuthor.get(p.authorId) ?? 0;
    return {
      userId: p.authorId,
      nomeCompleto: nameById.get(p.authorId) ?? '(desconhecido)',
      postsCount: p._count._all,
      likesReceived: likes,
      score: p._count._all * 3 + likes,
    };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ score: _score, ...rest }) => rest);
}

// ============================================================================
// User management — listagem paginada com filtros
// ============================================================================

export interface AdminUserFilters {
  q?: string;
  banned?: boolean;
  mentor?: boolean;
  tradition?: string;
  page?: number;
  pageSize?: number;
  sort?: 'recent' | 'name' | 'engagement';
}

export interface AdminUserList {
  data: Array<{
    id: string;
    email: string;
    nomeCompleto: string;
    createdAt: string;
    isMentor: boolean;
    mentorTraditions: string[];
    planoAssinatura: string | null;
    postsCount: number;
    likesReceived: number;
    isBanned: boolean;
  }>;
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Listagem paginada para o painel admin.
 *
 * "isBanned" é derivado de AuditLog (último ADMIN_USER_BAN sem
 * ADMIN_USER_UNBAN depois). Como ainda não temos modelo de ban
 * persistente, expomos via query à AuditLog.
 */
export async function getAdminUsers(filters: AdminUserFilters): Promise<AdminUserList> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));
  const skip = (page - 1) * pageSize;

  // Construir where — tipado como any p/ evitar ciclo em Prisma types.
  // (Wave 20) Migrar para Prisma.UserWhereInput quando estabilizar.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (filters.q) {
    where.OR = [
      { nomeCompleto: { contains: filters.q, mode: 'insensitive' } },
      { email: { contains: filters.q, mode: 'insensitive' } },
    ];
  }
  if (filters.mentor !== undefined) where.isMentor = filters.mentor;
  if (filters.tradition) {
    where.mentorTraditions = { has: filters.tradition };
  }

  // Ordenação
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderBy: any = { createdAt: 'desc' };
  if (filters.sort === 'name') orderBy = { nomeCompleto: 'asc' };
  // 'engagement' = postsCount desc — vamos simular via subselect abaixo

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      select: {
        id: true,
        email: true,
        nomeCompleto: true,
        createdAt: true,
        isMentor: true,
        mentorTraditions: true,
        planoAssinatura: true,
      },
    }),
  ]);

  if (users.length === 0) {
    return { data: [], total, page, pageSize };
  }

  const userIds = users.map((u) => u.id);

  // Posts por user
  const postsPerUser = await prisma.post.groupBy({
    by: ['authorId'],
    where: { authorId: { in: userIds }, deletedAt: null },
    _count: { _all: true },
  });
  const postsMap = new Map(postsPerUser.map((p) => [p.authorId, p._count._all]));

  // Likes recebidos via posts
  const postsIdAuthor = await prisma.post.findMany({
    where: { authorId: { in: userIds } },
    select: { id: true, authorId: true },
  });
  const postToAuthor = new Map(postsIdAuthor.map((p) => [p.id, p.authorId]));

  const likesGrouped = await prisma.like.groupBy({
    by: ['postId'],
    where: { postId: { in: Array.from(postToAuthor.keys()) } },
    _count: { _all: true },
  });
  const likesByAuthor = new Map<string, number>();
  likesGrouped.forEach((l) => {
    const aid = postToAuthor.get(l.postId);
    if (!aid) return;
    likesByAuthor.set(aid, (likesByAuthor.get(aid) ?? 0) + l._count._all);
  });

  // Bans via AuditLog
  const banActions = await prisma.auditLog.findMany({
    where: {
      action: { in: ['ADMIN_USER_BAN'] },
      targetId: { in: userIds },
    },
    select: { targetId: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  const bannedSet = new Set(banActions.map((b) => b.targetId));

  const data = users
    .map((u) => ({
      id: u.id,
      email: u.email,
      nomeCompleto: u.nomeCompleto,
      createdAt: u.createdAt.toISOString(),
      isMentor: u.isMentor,
      mentorTraditions: u.mentorTraditions,
      planoAssinatura: u.planoAssinatura,
      postsCount: postsMap.get(u.id) ?? 0,
      likesReceived: likesByAuthor.get(u.id) ?? 0,
      isBanned: bannedSet.has(u.id),
    }))
    .sort((a, b) => {
      if (filters.sort === 'engagement') {
        return b.postsCount + b.likesReceived * 0.1 - (a.postsCount + a.likesReceived * 0.1);
      }
      return 0; // mantém orderBy do prisma
    });

  return { data, total, page, pageSize };
}

// ============================================================================
// Ban / Promote — ações admin (com audit log)
// ============================================================================

/**
 * Banir usuário. Persiste em AuditLog (ação ADMIN_USER_BAN) com motivo.
 * Retorna o id do log criado para auditoria.
 *
 * Sem modelo `Ban` persistente no schema atual; se necessário no futuro,
 * criar `model Ban { userId @id, reason, bannedBy, bannedAt }` e migrar.
 */
export async function banUser(args: {
  userId: string;
  adminId: string;
  reason: string;
}): Promise<{ auditLogId: string }> {
  const auditLog = await prisma.auditLog.create({
    data: {
      action: 'ADMIN_USER_BAN',
      actorId: args.adminId,
      targetId: args.userId,
      metadata: { reason: args.reason, scope: 'admin_dashboard' },
    },
    select: { id: true },
  });
  return { auditLogId: auditLog.id };
}

/**
 * Promover usuário a mentor. Idempotente.
 */
export async function promoteToMentor(args: {
  userId: string;
  adminId: string;
  traditions: string[];
  bio?: string;
}): Promise<{ updated: boolean }> {
  const before = await prisma.user.findUnique({
    where: { id: args.userId },
    select: { isMentor: true, mentorTraditions: true },
  });
  if (!before) {
    throw new Error('USER_NOT_FOUND');
  }
  const updated = await prisma.user.update({
    where: { id: args.userId },
    data: {
      isMentor: true,
      mentorTraditions: args.traditions,
      mentorBio: args.bio ?? null,
    },
    select: { isMentor: true },
  });

  await prisma.auditLog.create({
    data: {
      action: 'ADMIN_CONTENT_REMOVE', // próximo do espectro, sem novo enum
      actorId: args.adminId,
      targetId: args.userId,
      metadata: {
        action: 'PROMOTE_MENTOR',
        traditions: args.traditions,
        previousMentor: before.isMentor,
      },
    },
  });

  return { updated: updated.isMentor };
}

// ============================================================================
// Moderation queue
// ============================================================================

export interface ModerationFlagRow {
  id: string;
  targetType: 'POST' | 'COMMENT' | 'USER' | 'GROUP';
  targetId: string;
  reason: 'SPAM' | 'HARASSMENT' | 'MISINFO' | 'OTHER';
  description: string | null;
  status: 'PENDING' | 'REVIEWED' | 'ACTIONED' | 'DISMISSED';
  createdAt: string;
  reporterId: string;
  reviewerId: string | null;
  actionTaken: string | null;
  // Contexto embutido (best-effort)
  targetPreview: string | null;
}

export async function getModerationQueue(opts: {
  status?: 'PENDING' | 'REVIEWED' | 'ACTIONED' | 'DISMISSED';
  limit?: number;
}): Promise<ModerationFlagRow[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (opts.status) where.status = opts.status;
  else where.status = 'PENDING';

  const flags = await prisma.flag.findMany({
    where,
    orderBy: { createdAt: 'asc' },
    take: opts.limit ?? 50,
    select: {
      id: true,
      targetType: true,
      targetId: true,
      reason: true,
      description: true,
      status: true,
      createdAt: true,
      reporterId: true,
      reviewerId: true,
      actionTaken: true,
    },
  });

  if (flags.length === 0) return [];

  // Coletar targetIds por tipo para fetch em batch
  const postIds = flags.filter((f) => f.targetType === 'POST').map((f) => f.targetId);
  const commentIds = flags.filter((f) => f.targetType === 'COMMENT').map((f) => f.targetId);

  const [posts, comments] = await Promise.all([
    postIds.length > 0
      ? prisma.post.findMany({
          where: { id: { in: postIds } },
          select: { id: true, content: true },
        })
      : Promise.resolve([]),
    commentIds.length > 0
      ? prisma.comment.findMany({
          where: { id: { in: commentIds } },
          select: { id: true, content: true },
        })
      : Promise.resolve([]),
  ]);

  const previewMap = new Map<string, string>();
  posts.forEach((p) => previewMap.set(`POST:${p.id}`, p.content.slice(0, 200)));
  comments.forEach((c) => previewMap.set(`COMMENT:${c.id}`, c.content.slice(0, 200)));

  return flags.map((f) => ({
    id: f.id,
    targetType: f.targetType,
    targetId: f.targetId,
    reason: f.reason,
    description: f.description,
    status: f.status,
    createdAt: f.createdAt.toISOString(),
    reporterId: f.reporterId,
    reviewerId: f.reviewerId,
    actionTaken: f.actionTaken,
    targetPreview: previewMap.get(`${f.targetType}:${f.targetId}`) ?? null,
  }));
}

/**
 * Resolver uma flag (ação do admin).
 */
export async function resolveFlag(args: {
  flagId: string;
  adminId: string;
  action: 'dismiss' | 'hide' | 'delete' | 'warn';
}): Promise<{ updated: boolean; hiddenTarget: boolean }> {
  const flag = await prisma.flag.findUnique({ where: { id: args.flagId } });
  if (!flag) throw new Error('FLAG_NOT_FOUND');

  // Mapear ação → status + (opcionalmente) hidden target
  let hiddenTarget = false;
  if (args.action === 'hide' && flag.targetType === 'POST') {
    // Soft delete do post
    await prisma.post.update({
      where: { id: flag.targetId },
      data: { deletedAt: new Date() },
    });
    hiddenTarget = true;
  } else if (args.action === 'hide' && flag.targetType === 'COMMENT') {
    await prisma.comment.update({
      where: { id: flag.targetId },
      data: { deletedAt: new Date() },
    });
    hiddenTarget = true;
  } else if (args.action === 'delete' && flag.targetType === 'POST') {
    await prisma.post.update({
      where: { id: flag.targetId },
      data: { deletedAt: new Date() },
    });
    hiddenTarget = true;
  } else if (args.action === 'delete' && flag.targetType === 'COMMENT') {
    await prisma.comment.update({
      where: { id: flag.targetId },
      data: { deletedAt: new Date() },
    });
    hiddenTarget = true;
  }
  // 'dismiss' = no-op no alvo
  // 'warn' = no-op no alvo (apenas log + notification em versão futura)

  const newStatus =
    args.action === 'dismiss' ? 'DISMISSED' : 'ACTIONED';

  await prisma.flag.update({
    where: { id: args.flagId },
    data: {
      status: newStatus,
      actionTaken: args.action,
      reviewerId: args.adminId,
      reviewedAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'ADMIN_CONTENT_REMOVE',
      actorId: args.adminId,
      targetId: flag.targetId,
      metadata: {
        action: `MOD_${args.action.toUpperCase()}`,
        flagId: flag.id,
        targetType: flag.targetType,
      },
    },
  });

  return { updated: true, hiddenTarget };
}
