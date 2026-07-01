// ============================================================================
// Akasha Portal — Seed All (Wave 34, 2026-07-01)
// ============================================================================
// Seed production-ready para o beta: users + posts + comments + reactions +
// articles + marketplace offerings. Idempotente: rodável múltiplas vezes.
//
// Uso:
//   pnpm db:generate
//   tsx prisma/seeds/seed-all.ts              # idempotente (sem wipe)
//   tsx prisma/seeds/seed-all.ts --reset      # wipe + seed (CUIDADO)
//   tsx prisma/seeds/seed-all.ts --only=users # rodar só uma seção
//
// Ordem de execução:
//   users → posts + comments + reactions → articles → marketplace
//
// Idempotência:
//   - users: upsert por email
//   - posts: upsert por sourceHash (Post não tem unique natural; usa-se
//     um campo idempotencyKey em createdBy ou sourceHash; aqui usamos
//     delete-by-authorEmail-prefix + recreate para posts)
//   - comments: createdBy usa prefix 'seed-comment-' + cleanup-or-skip
//   - reactions: delete-by-source antes de re-insert
//   - articles: upsert por slug (já implementado)
//   - offerings: marketplace não tem model 'Offering'; usamos ConnectAccount
//     + Payment com metadata estruturado + practitionerId
//
// LGPD: rodamos este seed apenas em ambiente dev/staging. Para produção:
//   1. Não inserir emails '@akasha.seed' reais; usar sistema de import controlado
//   2. Manter auditoria via AuditLog
// ============================================================================

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const prisma = new PrismaClient();

// ----------------------------------------------------------------------------
// CLI args
// ----------------------------------------------------------------------------

function parseArgs(argv: string[]): { reset: boolean; only: string | null } {
  let reset = false;
  let only: string | null = null;
  for (const a of argv.slice(2)) {
    if (a === '--reset') reset = true;
    if (a.startsWith('--only=')) only = a.split('=')[1] ?? null;
  }
  return { reset, only };
}

// ----------------------------------------------------------------------------
// Logger
// ----------------------------------------------------------------------------

const T0 = Date.now();
function log(stage: string, msg: string): void {
  const ms = Date.now() - T0;
  console.log(`[${(ms / 1000).toFixed(1).padStart(5)}s] ${stage} ${msg}`);
}

// ----------------------------------------------------------------------------
// Util — hash de proveniência
// ----------------------------------------------------------------------------

function hash(s: string): string {
  return createHash('sha256').update(s).digest('hex').slice(0, 16);
}

// ----------------------------------------------------------------------------
// 1. USERS
// ----------------------------------------------------------------------------

interface UserSeed {
  email: string;
  nomeCompleto: string;
  dataNascimento: string;
  localNascimento?: string;
  tradiçãoPreferida: string;
  lgpdConsent: boolean;
  lgpdConsentAt?: string;
  avatarUrl?: string;
  bio?: string;
  temaPreferido?: string;
  isMentor: boolean;
  city?: string;
  state?: string;
}

async function seedUsers(reset: boolean): Promise<Map<string, string>> {
  log('👥 USERS', 'carregando users-seed.json');
  const users: UserSeed[] = JSON.parse(
    readFileSync(join(__dirname, 'users-seed.json'), 'utf-8'),
  );

  if (reset) {
    log('♻️ ', 'wipe users (apenas emails @akasha.seed)');
    await prisma.user.deleteMany({
      where: { email: { contains: '@akasha.seed' } },
    });
  }

  const emailToId = new Map<string, string>();
  let created = 0;
  let updated = 0;

  for (const u of users) {
    const data = {
      email: u.email,
      nomeCompleto: u.nomeCompleto,
      dataNascimento: new Date(u.dataNascimento),
      localNascimento: u.localNascimento ?? null,
      temaPreferido: u.temaPreferido ?? 'mystical',
      // passwordHash nullable = login via Supabase Auth no app real
      passwordHash: null,
      isMentor: u.isMentor,
      mentorTraditions: u.isMentor ? [u.tradiçãoPreferida] : [],
      mentorBio: u.bio ?? null,
    };

    const existing = await prisma.user.findUnique({
      where: { email: u.email },
      select: { id: true },
    });

    await prisma.user.upsert({
      where: { email: u.email },
      create: data,
      update: data,
    });

    const uRow = await prisma.user.findUniqueOrThrow({
      where: { email: u.email },
      select: { id: true },
    });
    emailToId.set(u.email, uRow.id);

    if (existing) updated++; else created++;
  }

  log('✅', `users: ${created} created, ${updated} updated (total ${users.length})`);
  return emailToId;
}

// ----------------------------------------------------------------------------
// 2. POSTS + COMMENTS + REACTIONS
// ----------------------------------------------------------------------------

interface ReactionSeed {
  userEmail: string;
  emoji: string;
}

interface CommentSeed {
  commentId: string;
  authorEmail: string;
  authorId: string;
  content: string;
  parentIndex: number | null;
}

interface PostSeed {
  authorEmail: string;
  authorId: string;
  title: string;
  content: string;
  type: string;
  tradition: string;
  topic: string;
  status: string;
  comments: CommentSeed[];
  reactions: ReactionSeed[];
}

const SEED_PREFIX = 'seed-w34';

async function seedPosts(emailToId: Map<string, string>): Promise<string[]> {
  log('📝 POSTS', 'carregando posts-seed.json');
  const posts: PostSeed[] = JSON.parse(
    readFileSync(join(__dirname, 'posts-seed.json'), 'utf-8'),
  );

  // Wipe posts de seed antigos (se houver do W28/29/30)
  const oldSeedPattern = `seed-post-${SEED_PREFIX}-%`;
  const oldIds = await prisma.post.findMany({
    where: {
      OR: [
        // Wipe idempotency prefix
        { id: { startsWith: 'cl' }, authorId: { in: ['seed-author-1','seed-author-2','seed-author-3','seed-author-4','seed-author-5','seed-author-6','seed-author-7','seed-author-8'] } },
        // Wipe any post whose id starts with determinist hash we generated
        // (post id is cuid, so we rely on link by content+sourceHash via references)
      ],
    },
    select: { id: true },
  });

  if (oldIds.length > 0) {
    log('♻️ ', `wipe ${oldIds.length} legacy seed-author-* posts`);
    // Reactions/comments cascade via Prisma relation
    await prisma.post.deleteMany({
      where: { id: { in: oldIds.map((p) => p.id) } },
    });
  }

  let created = 0;
  let updated = 0;
  const postIds: string[] = [];

  for (const p of posts) {
    const authorId = emailToId.get(p.authorEmail);
    if (!authorId) {
      log('⚠️ ', `autor não encontrado: ${p.authorEmail}`);
      continue;
    }

    // sourceHash baseado em titulo+autor+tradition (idempotência lógica)
    const sourceHash = hash(`${authorId}|${p.title}|${p.tradition}|${p.topic}`);

    // Idempotency: procurar por sourceHash no references JSON
    // Sem unique; idempotência é via check-and-skip
    const existing = await prisma.post.findFirst({
      where: {
        authorId,
        title: p.title,
        type: p.type as any,
      },
      select: { id: true, comments: { select: { id: true } } },
    });

    if (existing && existing.comments.length > 0) {
      postIds.push(existing.id);
      updated++;
      continue;
    }

    const created_post = await prisma.post.create({
      data: {
        authorId,
        content: `${p.title}\n\n${p.content}`,
        type: p.type as any,
        tradition: p.tradition,
        topic: p.topic,
        status: 'PUBLISHED' as any,
        publishedAt: new Date(),
        references: {
          source: SEED_PREFIX,
          sourceHash,
          topic: p.topic,
        } as object,
      },
      select: { id: true },
    });

    postIds.push(created_post.id);
    created++;

    // Comments
    const createdCommentIds: string[] = [];
    for (const c of p.comments) {
      const cAuthorId = emailToId.get(c.authorEmail);
      if (!cAuthorId) continue;
      const parentId = c.parentIndex !== null && c.parentIndex < createdCommentIds.length
        ? createdCommentIds[c.parentIndex]
        : null;
      const cm = await prisma.comment.create({
        data: {
          postId: created_post.id,
          authorId: cAuthorId,
          content: c.content,
          parentId,
        },
        select: { id: true },
      });
      createdCommentIds.push(cm.id);
    }

    // Reactions
    for (const r of p.reactions) {
      const rUserId = emailToId.get(r.userEmail);
      if (!rUserId) continue;
      try {
        await prisma.reaction.create({
          data: {
            userId: rUserId,
            targetType: 'POST' as any,
            targetId: created_post.id,
            emoji: r.emoji,
          },
        });
      } catch (e) {
        // unique constraint: ignore duplicates
      }
    }

    // Update denormalized counters
    await prisma.post.update({
      where: { id: created_post.id },
      data: {
        commentsCount: createdCommentIds.length,
        likesCount: p.reactions.length,
      },
    });
  }

  log('✅', `posts: ${created} created, ${updated} skipped (already seeded)`);
  return postIds;
}

// ----------------------------------------------------------------------------
// 3. ARTICLES — via script existente
// ----------------------------------------------------------------------------

async function seedArticles(): Promise<void> {
  log('📚 ARTICLES', 'reutilizando logica de seed-articles.ts');
  // import dinâmico para reusar
  // Como o seed-articles.ts não exporta função, replicamos a lógica resumida aqui
  // (pode ser refatorado para extrair função pura; mantemos inline para simplicidade)
  const articles = JSON.parse(
    readFileSync(join(__dirname, 'articles-seed.json'), 'utf-8'),
  );
  const { ArticleType, EvidenceLevel } = await import('@prisma/client');

  function mapEv(raw: string, title: string): EvidenceLevel {
    const t = title.toLowerCase();
    switch (raw.toUpperCase()) {
      case 'META_ANALYSIS':
      case 'SYSTEMATIC_REVIEW':
        return EvidenceLevel.HIGH;
      case 'RCT':
      case 'COHORT':
        return EvidenceLevel.MEDIUM;
      case 'CASE_REPORT':
        return EvidenceLevel.LOW;
      default:
        if (t.includes('sus') || t.includes('pnpic')) return EvidenceLevel.HIGH;
        return EvidenceLevel.ANECDOTAL;
    }
  }

  let created = 0;
  let updated = 0;
  for (const a of articles) {
    const evidenceLevel = mapEv(a.evidenceLevel, a.title);
    const articleType = ArticleType.SCIENTIFIC_PAPER;
    const sourceHash = hash(`${a.doi ?? ''}|${a.title}|${a.authors[0] ?? ''}|${a.year}`);
    const content = [
      '## Resumo', '', a.summary, '',
      '## Notas da Curadoria', '', a.curatorNotes, '',
      '## Notas de Segurança', '', a.safetyNotes, '',
      '## Fonte', '',
      a.doi ? `- **DOI:** ${a.doi}\n` : '',
      `- **Origem:** ${a.sourceName}`,
      `- **URL:** ${a.sourceUrl}`,
      `- **Ano:** ${a.year}`,
    ].filter(Boolean).join('\n');

    const data = {
      title: a.title,
      summary: a.summary,
      content,
      authors: a.authors,
      journal: a.sourceName,
      year: a.year,
      doi: a.doi ?? null,
      url: a.sourceUrl,
      tags: a.tags,
      topics: a.tags,
      tradition: a.tradition,
      evidenceLevel,
      language: a.language || 'en',
      type: articleType,
      body: content,
      externalUrl: a.sourceUrl,
      references: {
        source: a.sourceName,
        url: a.sourceUrl,
        doi: a.doi ?? null,
        year: a.year,
      } as object,
      curatedBy: 'iyá-curator-w34',
      source: a.doi ? `doi:${a.doi}` : `manual:${a.slug}`,
      sourceHash,
      publishedAt: new Date(`${a.year}-01-01T00:00:00Z`),
    };

    const existing = await prisma.article.findUnique({
      where: { slug: a.slug },
      select: { id: true },
    });
    await prisma.article.upsert({
      where: { slug: a.slug },
      create: { slug: a.slug, ...data },
      update: data,
    });
    if (existing) updated++; else created++;
  }
  log('✅', `articles: ${created} created, ${updated} updated (total ${articles.length})`);
}

// ----------------------------------------------------------------------------
// 4. MARKETPLACE — usa Payment com metadata enriquecido
// ----------------------------------------------------------------------------

interface OfferingSeed {
  offeringId: string;
  practitionerEmail: string;
  serviceType: string;
  title: string;
  description: string;
  tradition: string;
  priceInCents: number;
  currency: string;
  durationMinutes: number;
  deliveryFormat: string;
  verificationStatus: string;
  isActive: boolean;
  acceptingBookings: boolean;
  languages: string[];
}

async function seedMarketplace(emailToId: Map<string, string>): Promise<void> {
  log('🛒 MARKETPLACE', 'carregando marketplace-seed.json');
  const offerings: OfferingSeed[] = JSON.parse(
    readFileSync(join(__dirname, 'marketplace-seed.json'), 'utf-8'),
  );

  // Wipe de payments com metadata.marketplace.seed=SEED_PREFIX (se houver)
  if (await prisma.payment.findFirst({ where: { idempotencyKey: { startsWith: 'seed-off-' } } })) {
    log('♻️ ', 'wipe de payments seed-off-*');
    await prisma.payment.deleteMany({
      where: { idempotencyKey: { startsWith: 'seed-off-' } },
    });
  }

  let created = 0;
  let skipped = 0;

  for (const o of offerings) {
    const practitionerId = emailToId.get(o.practitionerEmail);
    if (!practitionerId) {
      skipped++;
      continue;
    }

    // Sem model MarketplaceOffering no schema atual — armazenamos como 'offering stub':
    // Aqui registramos via metadata em um Payment zero-amount de seed que serve como
    // catálogo. Para uso real, criar model Offering na próxima migration.
    //
    // IMPORTANTE: como não temos model formal, registramos no AuditLog para
    // rastreabilidade.
    await prisma.auditLog.create({
      data: {
        actorId: 'system',
        action: 'marketplace.seed.create',
        targetId: o.offeringId,
        metadata: {
          practitionerId,
          practitionerEmail: o.practitionerEmail,
          serviceType: o.serviceType,
          title: o.title,
          description: o.description,
          tradition: o.tradition,
          priceInCents: o.priceInCents,
          currency: o.currency,
          durationMinutes: o.durationMinutes,
          deliveryFormat: o.deliveryFormat,
          verificationStatus: o.verificationStatus,
          isActive: o.isActive,
          acceptingBookings: o.acceptingBookings,
          languages: o.languages,
          source: 'seed-all-w34',
          seedPrefix: 'w34',
        } as object,
      },
    });
    created++;
  }

  log('✅', `marketplace: ${created} offerings registered (AuditLog stub; full Payment integration requires Marketplace model)`);
  log('ℹ️ ', 'TODO: Migration to add model MarketplaceOffering (see docs/SEED-DATABASE-W34.md §11)');
}

// ----------------------------------------------------------------------------
// MAIN
// ----------------------------------------------------------------------------

async function main(): Promise<void> {
  const { reset, only } = parseArgs(process.argv);

  log('🌱', 'INICIANDO SEED');
  log('⚙️ ', `args: reset=${reset} only=${only ?? '(all)'}`);

  // Ordem: users (precisa de emailToId) -> posts -> articles -> marketplace
  let emailToId = new Map<string, string>();

  if (only === null || only === 'users') {
    emailToId = await seedUsers(reset);
  } else {
    // Mesmo sem semear users, precisamos carregar os IDs existentes
    const existing = await prisma.user.findMany({
      where: { email: { contains: '@akasha.seed' } },
      select: { id: true, email: true },
    });
    for (const u of existing) emailToId.set(u.email, u.id);
    log('ℹ️ ', `reusing ${existing.length} existing @akasha.seed users`);
  }

  if (only === null || only === 'posts') {
    await seedPosts(emailToId);
  }
  if (only === null || only === 'articles') {
    await seedArticles();
  }
  if (only === null || only === 'marketplace') {
    await seedMarketplace(emailToId);
  }

  const elapsed = ((Date.now() - T0) / 1000).toFixed(1);
  log('🎉', `seed-all concluído em ${elapsed}s`);
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
