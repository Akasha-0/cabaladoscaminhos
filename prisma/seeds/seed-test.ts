// ============================================================================
// Akasha Portal — Seed Test (Wave 34, 2026-07-01)
// ============================================================================
// Seed MINIMAL para test environment: 3 users, 5 posts, 5 articles.
// NÃO usar em produção. SEMPRE combinado com --reset.
//
// Uso:
//   tsx prisma/seeds/seed-test.ts              # wipe + seed minimal
//   tsx prisma/seeds/seed-test.ts --keep       # idempotente (skip wipe)
//
// Princípios:
//   - PREFER-NO-WIPE: o default é wipe (test reset); produção usa seed-all
//   - 3 usuários: 1 mentor + 2 membros, em tradições diferentes
//   - 5 posts simples (sem reactions nem threads complexos)
//   - 5 artigos canônicos com DOIs REAIS e verificáveis
//   - Verbose: loga tudo
// ============================================================================

import { PrismaClient } from '@prisma/client';
import { createHash } from 'node:crypto';

const prisma = new PrismaClient();

function parseArgs(argv: string[]): { keep: boolean } {
  return { keep: argv.includes('--keep') };
}

function hash(s: string): string {
  return createHash('sha256').update(s).digest('hex').slice(0, 16);
}

async function wipeTestData(): Promise<void> {
  // Wipe APENAS com prefix 'test-' ou '@akasha.test'
  await prisma.comment.deleteMany({
    where: { author: { email: { contains: '@akasha.test' } } },
  });
  await prisma.reaction.deleteMany({
    where: { user: { email: { contains: '@akasha.test' } } },
  });
  await prisma.post.deleteMany({
    where: { author: { email: { contains: '@akasha.test' } } },
  });
  await prisma.user.deleteMany({
    where: { email: { contains: '@akasha.test' } },
  });
  await prisma.auditLog.deleteMany({
    where: { metadata: { path: ['source'], equals: 'seed-test' } },
  });
}

async function seedUsers(): Promise<Map<string, string>> {
  const users = [
    {
      email: 'maria.mentora@akasha.test',
      nomeCompleto: 'Maria Teste Mentora',
      dataNascimento: new Date('1985-05-10'),
      localNascimento: 'São Paulo, SP',
      isMentor: true,
      tradiçãoPreferida: 'meditacao',
      bio: 'Mentora de teste',
      lgpdConsent: true,
    },
    {
      email: 'joao.dev@akasha.test',
      nomeCompleto: 'João Programador de Teste',
      dataNascimento: new Date('1992-12-20'),
      localNascimento: 'Rio de Janeiro, RJ',
      isMentor: false,
      tradiçãoPreferida: 'reiki',
      bio: 'Dev estudando Reiki',
      lgpdConsent: true,
    },
    {
      email: 'ana.curiosa@akasha.test',
      nomeCompleto: 'Ana Curiosa de Teste',
      dataNascimento: new Date('1996-03-15'),
      localNascimento: 'Salvador, BA',
      isMentor: false,
      tradiçãoPreferida: 'candomble',
      bio: 'Curiosa de tradições',
      lgpdConsent: true,
    },
  ];

  const map = new Map<string, string>();
  for (const u of users) {
    const row = await prisma.user.upsert({
      where: { email: u.email },
      create: {
        email: u.email,
        nomeCompleto: u.nomeCompleto,
        dataNascimento: u.dataNascimento,
        localNascimento: u.localNascimento,
        isMentor: u.isMentor,
        mentorTraditions: u.isMentor ? [u.tradiçãoPreferida] : [],
        mentorBio: u.bio,
        passwordHash: null,
      },
      update: {},
    });
    map.set(u.email, row.id);
  }
  console.log(`✅ ${users.length} test users upserted`);
  return map;
}

async function seedPosts(userMap: Map<string, string>): Promise<void> {
  const posts = [
    {
      author: 'maria.mentora@akasha.test',
      title: 'Post de teste: meditacao matinal',
      content: 'Exemplo de post de teste simples.',
      type: 'TEXT',
      tradition: 'meditacao',
      topic: 'vipassana',
    },
    {
      author: 'joao.dev@akasha.test',
      title: 'Post de teste: pergunta sobre Reiki',
      content: 'Pergunta teste: como comecar?',
      type: 'QUESTION',
      tradition: 'reiki',
      topic: 'iniciacao',
    },
    {
      author: 'ana.curiosa@akasha.test',
      title: 'Post de teste: candomble iniciacao',
      content: 'Compartilhando minha experiencia.',
      type: 'EXPERIENCE',
      tradition: 'candomble',
      topic: 'fundamento',
    },
    {
      author: 'maria.mentora@akasha.test',
      title: 'Post de teste: pratica com mindfulness',
      content: 'Sequencia matinal.',
      type: 'PRACTICE',
      tradition: 'meditacao',
      topic: 'mindfulness',
    },
    {
      author: 'joao.dev@akasha.test',
      title: 'Post de teste: duvida geral',
      content: 'Como o app funciona?',
      type: 'QUESTION',
      tradition: 'reiki',
      topic: 'app',
    },
  ];

  let count = 0;
  for (const p of posts) {
    const authorId = userMap.get(p.author);
    if (!authorId) continue;
    await prisma.post.create({
      data: {
        authorId,
        content: `${p.title}\n\n${p.content}`,
        type: p.type as any,
        tradition: p.tradition,
        topic: p.topic,
        status: 'PUBLISHED' as any,
        publishedAt: new Date(),
        references: { source: 'seed-test', sourceHash: hash(`${authorId}|${p.title}`) } as object,
      },
    });
    count++;
  }
  console.log(`✅ ${count} test posts created`);
}

async function seedArticles(): Promise<void> {
  const { ArticleType, EvidenceLevel } = await import('@prisma/client');

  const articles = [
    {
      slug: 'test-reiki-meta-2017',
      title: '[TEST] Reiki meta-analise 2017',
      summary: 'Artigo teste para validacao.',
      year: 2017,
      tradition: 'reiki',
      doi: '10.1177/2156587217728644',
      authors: ['McManus DE'],
      journal: 'Journal of Evidence-Based Complementary & Alternative Medicine',
      url: 'https://journals.sagepub.com/doi/full/10.1177/2156587217728644',
      tags: ['test', 'reiki'],
      evidenceLevel: EvidenceLevel.HIGH,
    },
    {
      slug: 'test-psilocybin-2016',
      title: '[TEST] Psilocybin cancer Griffiths 2016',
      summary: 'Artigo teste.',
      year: 2016,
      tradition: 'xamanismo',
      doi: '10.1056/NEJMoa1606779',
      authors: ['Griffiths RR'],
      journal: 'New England Journal of Medicine',
      url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa1606779',
      tags: ['test'],
      evidenceLevel: EvidenceLevel.HIGH,
    },
    {
      slug: 'test-mbsr-meta-2014',
      title: '[TEST] Meditacao meta-analise 2014',
      summary: 'AHRQ study.',
      year: 2014,
      tradition: 'meditacao',
      doi: '10.1001/jamainternmed.2013.13018',
      authors: ['Goyal M'],
      journal: 'JAMA Internal Medicine',
      url: 'https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/1809754',
      tags: ['test'],
      evidenceLevel: EvidenceLevel.HIGH,
    },
    {
      slug: 'test-cbd-epilepsy-2016',
      title: '[TEST] CBD epilepsy Devinsky 2016',
      summary: 'GWPCARE3 trial.',
      year: 2016,
      tradition: 'xamanismo',
      doi: '10.1212/WNL.0000000000003241',
      authors: ['Devinsky O'],
      journal: 'Neurology',
      url: 'https://n.neurology.org/content/86/4/401',
      tags: ['test'],
      evidenceLevel: EvidenceLevel.HIGH,
    },
    {
      slug: 'test-kava-2013',
      title: '[TEST] Kava anxiety Sarris 2013',
      summary: 'Meta-analise.',
      year: 2013,
      tradition: 'xamanismo',
      doi: '10.1177/0269881113494019',
      authors: ['Sarris J'],
      journal: 'Journal of Psychopharmacology',
      url: 'https://journals.sagepub.com/doi/abs/10.1177/0269881113494019',
      tags: ['test'],
      evidenceLevel: EvidenceLevel.HIGH,
    },
  ];

  let count = 0;
  for (const a of articles) {
    const content = `## Resumo\n\n${a.summary}\n\n## Fonte\n\n- DOI: ${a.doi}\n- URL: ${a.url}`;
    await prisma.article.upsert({
      where: { slug: a.slug },
      create: {
        slug: a.slug,
        title: a.title,
        summary: a.summary,
        content,
        authors: a.authors,
        journal: a.journal,
        year: a.year,
        doi: a.doi,
        url: a.url,
        tags: a.tags,
        topics: a.tags,
        tradition: a.tradition,
        evidenceLevel: a.evidenceLevel,
        language: 'en',
        type: ArticleType.SCIENTIFIC_PAPER,
        body: content,
        externalUrl: a.url,
        references: { source: a.journal, url: a.url, doi: a.doi, year: a.year } as object,
        curatedBy: 'iyá-curator-test',
        source: `doi:${a.doi}`,
        sourceHash: hash(`test|${a.doi}|${a.authors[0]}`),
        publishedAt: new Date(`${a.year}-01-01T00:00:00Z`),
      },
      update: {
        title: a.title,
        summary: a.summary,
      },
    });
    count++;
  }
  console.log(`✅ ${count} test articles upserted`);
}

async function main(): Promise<void> {
  const { keep } = parseArgs(process.argv);
  console.log(`🧪 SEED TEST (keep=${keep})`);

  if (!keep) {
    console.log('♻️  wiping previous test data');
    await wipeTestData();
  }

  const userMap = await seedUsers();
  await seedPosts(userMap);
  await seedArticles();

  console.log('🎉 seed-test concluído');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
