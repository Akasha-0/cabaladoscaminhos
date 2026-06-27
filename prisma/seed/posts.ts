// ============================================================================
// SEED — POSTS DA COMUNIDADE
// ============================================================================
// Cria 20 posts variados de 5 tradições diferentes e 3 grupos. Autores
// fictícios com IDs determinísticos para reproduzibilidade.
//
// Como rodar:
//   pnpm seed:posts
//   ou
//   tsx prisma/seed/posts.ts
//
// Idempotente: limpa posts com authorId LIKE 'seed-%' antes de inserir.
// ============================================================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SEED_AUTHOR_PREFIX = 'seed-author-';

const TRADITIONS = ['cabala', 'ifa', 'xamanismo', 'tantra', 'reiki'] as const;
const GROUPS = ['cabala', 'ifa', 'xamanismo'] as const;

const AUTHORS = Array.from({ length: 8 }).map((_, i) => ({
  id: `${SEED_AUTHOR_PREFIX}${i + 1}`,
  displayName: `Membro Seed ${String(i + 1).padStart(2, '0')}`,
}));

type PostSeed = {
  authorId: string;
  content: string;
  type: 'TEXT' | 'QUESTION' | 'ARTICLE' | 'EXPERIENCE' | 'PRACTICE';
  tradition: (typeof TRADITIONS)[number] | null;
  topic: string | null;
  groupSlug: (typeof GROUPS)[number] | null;
  references?: Array<{ title: string; url?: string; doi?: string; year?: number }>;
  likesCount?: number;
  commentsCount?: number;
};

const POSTS: PostSeed[] = [
  {
    authorId: AUTHORS[0]!.id,
    content:
      'Acabei de terminar uma cerimônia e o que mais me marcou foi a sensação de dissolução do ego. Vocês já passaram por isso? Queria entender melhor o que a neurociência diz sobre esse estado. Li um paper do Robin Carhart-Harris sobre entropia cerebral que faz muito sentido com o que vivi.',
    type: 'EXPERIENCE',
    tradition: 'xamanismo',
    topic: 'psilocibina',
    groupSlug: null,
    references: [
      { title: 'Entropic Brain Hypothesis', url: 'https://doi.org/10.1007/s00213-014-3716-z', doi: '10.1007/s00213-014-3716-z', year: 2014 },
    ],
    likesCount: 47,
    commentsCount: 12,
  },
  {
    authorId: AUTHORS[1]!.id,
    content:
      'Para quem chegou agora: o grupo de Ifá tá crescendo e tem muito conteúdo novo. Esse mês postamos 3 artigos sobre o Odu Iwori e suas correspondências com a cabala. Vale a pena conferir na biblioteca!',
    type: 'TEXT',
    tradition: 'ifa',
    topic: 'comunidade',
    groupSlug: 'ifa',
    likesCount: 23,
    commentsCount: 4,
  },
  {
    authorId: AUTHORS[2]!.id,
    content:
      'Compartilhando: artigo novo na biblioteca sobre os efeitos do Reiki em pacientes com ansiedade. Estudo randomizado controlado com 120 participantes, redução significativa nos níveis de cortisol. Link nos comentários.',
    type: 'ARTICLE',
    tradition: 'reiki',
    topic: 'ansiedade',
    groupSlug: null,
    references: [
      { title: 'Effects of Reiki on Anxiety: RCT', url: 'https://pubmed.ncbi.nlm.nih.gov/example', year: 2023 },
    ],
    likesCount: 89,
    commentsCount: 21,
  },
  {
    authorId: AUTHORS[3]!.id,
    content:
      'Pergunta pra comunidade: como vocês lidam com a dúvida entre seguir uma intuição forte e a razão? Hoje de manhã tive um impulso muito claro de cancelar uma reunião e ir caminhar na natureza. Cancelei. A reunião foi adiada de qualquer jeito. Como vocês cultivam essa escuta?',
    type: 'QUESTION',
    tradition: 'cabala',
    topic: 'intuicao',
    groupSlug: 'cabala',
    likesCount: 34,
    commentsCount: 28,
  },
  {
    authorId: AUTHORS[4]!.id,
    content:
      'Prática da manhã: meditação Vipassana de 20 minutos seguida de 5 minutos de respiração alternate-nostril (Nadi Shodhana). Senti o plexo solar acalmar visivelmente. Alguém mais pratica?',
    type: 'PRACTICE',
    tradition: 'tantra',
    topic: 'meditacao',
    groupSlug: null,
    likesCount: 18,
    commentsCount: 7,
  },
  {
    authorId: AUTHORS[5]!.id,
    content:
      'Estudo profundo sobre Árvore da Vida e as 22 conexões entre as Sefirot. Cada caminho tem um Tarot e uma letra hebraica associada. Comecei a meditar em cada caminho separadamente. Incrível como isso organiza a mente.',
    type: 'TEXT',
    tradition: 'cabala',
    topic: 'arvore-da-vida',
    groupSlug: 'cabala',
    likesCount: 56,
    commentsCount: 19,
  },
  {
    authorId: AUTHORS[6]!.id,
    content:
      'Orixá Ogum me apareceu três vezes essa semana em sonhos diferentes — uma vez com uma espada, duas vezes abrindo um caminho na floresta. Senti a chamada pra trabalho. Vou abrir um ebo de limpeza na próxima lua minguante. Alguém mais tem recebido sinais assim?',
    type: 'EXPERIENCE',
    tradition: 'ifa',
    topic: 'sonhos',
    groupSlug: 'ifa',
    likesCount: 67,
    commentsCount: 33,
  },
  {
    authorId: AUTHORS[7]!.id,
    content:
      'Kundalini subindo pelo Ida e Pingala simultaneamente — sensação de equilíbrio interno profundo. Conexão com Anahata e Vishuddha ao mesmo tempo. Recomendo começar com práticas suaves (mantra OM, pranayama).',
    type: 'EXPERIENCE',
    tradition: 'tantra',
    topic: 'kundalini',
    groupSlug: null,
    likesCount: 41,
    commentsCount: 11,
  },
  {
    authorId: AUTHORS[0]!.id,
    content:
      'Livro novo na biblioteca: "The Body Keeps the Score" — Bessel van der Kolk. Como o trauma fica armazenado no corpo e como práticas somáticas podem liberar. Leitura obrigatória pra quem trabalha com cura.',
    type: 'ARTICLE',
    tradition: null,
    topic: 'trauma',
    groupSlug: null,
    references: [
      { title: 'The Body Keeps the Score', author: 'Bessel van der Kolk', year: 2014 },
    ],
    likesCount: 92,
    commentsCount: 24,
  },
  {
    authorId: AUTHORS[1]!.id,
    content:
      'Aplicação de Reiki em hospital: fiz hoje numa paciente em tratamento oncológico. Ela dormiu pela primeira vez em 4 dias sem sedativo. Cada vez mais convencida do poder dessa prática quando conduzida com intenção pura.',
    type: 'EXPERIENCE',
    tradition: 'reiki',
    topic: 'cura',
    groupSlug: null,
    likesCount: 78,
    commentsCount: 15,
  },
  {
    authorId: AUTHORS[2]!.id,
    content:
      'Qual a relação entre o Odu Iwori e a Sefirá Binah na cabala? Tô estudando as correspondências entre Ifá e Árvore da Vida. Alguém tem material de referência confiável (papers, livros)?',
    type: 'QUESTION',
    tradition: 'ifa',
    topic: 'correspondencias',
    groupSlug: 'ifa',
    likesCount: 29,
    commentsCount: 14,
  },
  {
    authorId: AUTHORS[3]!.id,
    content:
      'Cerimônia de Ayahuasca ontem à noite. Vi meu Orixá de cabeça — Nanã, com seu manto azul-escuro. Ela me mostrou onde eu estava segurando dor ancestral. Hoje acordei com a sensação de que perdoei minha avó por algo que nem sabia que precisava perdoar.',
    type: 'EXPERIENCE',
    tradition: 'xamanismo',
    topic: 'ayahuasca',
    groupSlug: 'xamanismo',
    likesCount: 134,
    commentsCount: 47,
  },
  {
    authorId: AUTHORS[4]!.id,
    content:
      'Sugestão de prática para essa lua cheia: escreva num papel o que você quer soltar, depois queime com segurança (incensário). A Lua cheia em Escorpião vai potencializar a transformação. Boa prática!',
    type: 'PRACTICE',
    tradition: 'tantra',
    topic: 'lua-cheia',
    groupSlug: null,
    likesCount: 51,
    commentsCount: 18,
  },
  {
    authorId: AUTHORS[5]!.id,
    content:
      'Reflexão sobre as 4 fases da Lua e suas correspondências com os 4 elementos. Lua Nova = Terra (plantar). Lua Crescente = Água (nutrir). Lua Cheia = Fogo (colher). Lua Minguante = Ar (soltar). Tô usando esse framework no journaling.',
    type: 'TEXT',
    tradition: 'cabala',
    topic: 'lua',
    groupSlug: null,
    likesCount: 62,
    commentsCount: 22,
  },
  {
    authorId: AUTHORS[6]!.id,
    content:
      'Cabalísticos: o que vocês acham da correspondência entre os 22 Caminhos da Árvore da Vida e os 22 Arcanos Maiores? Eu uso a versão do Paulo Valentim mas queria comparar com outras tradições.',
    type: 'QUESTION',
    tradition: 'cabala',
    topic: 'tarot',
    groupSlug: 'cabala',
    likesCount: 38,
    commentsCount: 26,
  },
  {
    authorId: AUTHORS[7]!.id,
    content:
      'Ayahuasca e neuroplasticidade — revisão sistemática de 47 papers. Resumo das conclusões: aumento de BDNF, mudança na conectividade do default mode network, integração inter-hemisférica. Documento completo na biblioteca.',
    type: 'ARTICLE',
    tradition: 'xamanismo',
    topic: 'neurociencia',
    groupSlug: 'xamanismo',
    references: [
      { title: 'Ayahuasca and Neuroplasticity: Systematic Review', year: 2024 },
    ],
    likesCount: 113,
    commentsCount: 31,
  },
  {
    authorId: AUTHORS[0]!.id,
    content:
      'Passei a última semana estudando Ayurveda e fiquei impressionada com a precisão do diagnóstico pela língua. Cada área da língua corresponde a um órgão. Faz sentido também com o mapa dos chakras. As tradições se conversam.',
    type: 'TEXT',
    tradition: null,
    topic: 'ayurveda',
    groupSlug: null,
    likesCount: 44,
    commentsCount: 12,
  },
  {
    authorId: AUTHORS[1]!.id,
    content:
      'Compartilhando uma técnica que aprendi no retiro: 4-7-8 respiração antes de dormir. Inspira 4, segura 7, expira 8. Em duas semanas minha insônia reduziu drasticamente. Mais simples que meditação formal.',
    type: 'PRACTICE',
    tradition: 'tantra',
    topic: 'respiracao',
    groupSlug: null,
    likesCount: 96,
    commentsCount: 27,
  },
  {
    authorId: AUTHORS[2]!.id,
    content:
      'Alguém mais sente dificuldade em meditar no inverno? Tô achando que minha prática fica mais pesada quando tá frio. Já tentei aquecer o ambiente, usar manta, mas algo ainda trava. Sugestões?',
    type: 'QUESTION',
    tradition: 'cabala',
    topic: 'pratica-inverno',
    groupSlug: null,
    likesCount: 21,
    commentsCount: 19,
  },
  {
    authorId: AUTHORS[3]!.id,
    content:
      'Concluí o curso de Tarot com a Cigana Ramiro (online) e foi transformador. A leitura simbólica das cartas casa com a leitura cabalística e astrológica — vira uma ferramenta de autoconhecimento profunda. Indico demais.',
    type: 'TEXT',
    tradition: 'cabala',
    topic: 'tarot',
    groupSlug: 'cabala',
    likesCount: 87,
    commentsCount: 16,
  },
];

async function main() {
  console.log('🌱 Seeding community posts...');

  // 1) Garante que os grupos existam
  const groupDefs = [
    { slug: 'cabala', name: 'Cabala & Árvore da Vida', tradition: 'cabala' },
    { slug: 'ifa', name: 'Ifá e Orixás', tradition: 'ifa' },
    { slug: 'xamanismo', name: 'Xamanismo & Plantas Sagradas', tradition: 'xamanismo' },
  ];

  for (const g of groupDefs) {
    await prisma.group.upsert({
      where: { slug: g.slug },
      update: { name: g.name, tradition: g.tradition },
      create: {
        slug: g.slug,
        name: g.name,
        description: `Grupo dedicado ao estudo e prática de ${g.tradition}.`,
        tradition: g.tradition,
        isPublic: true,
        requireApproval: false,
      },
    });
  }
  console.log(`✅ ${groupDefs.length} grupos criados/atualizados`);

  // 2) Limpa posts seed anteriores
  const deleted = await prisma.post.deleteMany({
    where: { authorId: { startsWith: SEED_AUTHOR_PREFIX } },
  });
  console.log(`🗑️  ${deleted.count} posts seed antigos removidos`);

  // 3) Resolve groupSlug -> groupId
  const groups = await prisma.group.findMany({
    select: { id: true, slug: true },
  });
  const groupBySlug = new Map(groups.map((g) => [g.slug, g.id]));

  // 4) Insere posts com datas distribuídas nos últimos 7 dias
  const now = Date.now();
  const seeded = await Promise.all(
    POSTS.map(async (p, i) => {
      const minutesAgo = 30 + i * 95; // escalonado
      const createdAt = new Date(now - minutesAgo * 60_000);

      return prisma.post.create({
        data: {
          authorId: p.authorId,
          content: p.content,
          type: p.type,
          tradition: p.tradition,
          topic: p.topic,
          mediaUrls: [],
          references: p.references
            ? (p.references as unknown as object)
            : undefined,
          groupId: p.groupSlug ? (groupBySlug.get(p.groupSlug) ?? null) : null,
          likesCount: p.likesCount ?? 0,
          commentsCount: p.commentsCount ?? 0,
          sharesCount: 0,
          createdAt,
          updatedAt: createdAt,
        },
      });
    })
  );
  console.log(`✅ ${seeded.length} posts criados (5 tradições, 3 grupos)`);

  // 5) Atualiza membersCount dos grupos (heurística simples)
  for (const slug of GROUPS) {
    const count = await prisma.post.count({
      where: { group: { slug }, deletedAt: null },
    });
    await prisma.group.update({
      where: { slug },
      data: { membersCount: 50 + count * 7 },
    });
  }
  console.log('✅ membersCount atualizado');

  console.log('🎉 Seed concluído!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error('❌ Erro no seed:', err);
    await prisma.$disconnect();
    process.exit(1);
  });