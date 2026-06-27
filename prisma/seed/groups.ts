// ============================================================================
// SEED — GRUPOS DA COMUNIDADE (12 grupos)
// ============================================================================
// Cria 12 grupos (1 por tradição) com nome, descrição, regras, ícone,
// capa, e tradição relacionada. Idempotente: upsert por slug.
//
// Como rodar:
//   tsx prisma/seed/groups.ts
//   (ou integrando ao seed.ts principal)
//
// Tradições cobertas (12):
//   cabala, ifa, astrologia, tantra, reiki, meditacao,
//   xamanismo, cristianismo-mistico, sufismo, taoismo,
//   umbanda, candomble
// ============================================================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type GroupSeed = {
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  rules: string[];
  iconEmoji: string;
  tradition: string;
  isPublic: boolean;
  requireApproval: boolean;
};

const GROUPS: GroupSeed[] = [
  {
    slug: 'cabala',
    name: 'Cabala & Árvore da Vida',
    tradition: 'cabala',
    description:
      'Tradição mística judaica — Árvore da Vida, 10 Sefirot, 22 caminhos, meditações cabalísticas.',
    longDescription:
      'Grupo dedicado ao estudo e prática da Cabala. Aqui discutimos a Árvore da Vida, as 10 Sefirot, os 22 caminhos entre elas, as meditações cabalísticas e como a sabedoria mística judaica pode ser vivida no cotidiano moderno. Universalista, respeitoso, aberto a todas as formas de estudo (Luria, Cordovero, Golden Dawn, corrente hermética).',
    iconEmoji: '✡️',
    isPublic: true,
    requireApproval: false,
    rules: [
      'Respeito às diferentes correntes dentro da Cabala (Luria, Cordovero, Golden Dawn, hermetismo).',
      'Compartilhe fontes — não invente correspondências sem base bibliográfica.',
      'Cuidado com promessas absolutas — Cabala é estudo, não magia instantânea.',
      'Discussões são bem-vindas; ataques pessoais não.',
    ],
  },
  {
    slug: 'ifa',
    name: 'Ifá & Orixás',
    tradition: 'ifa',
    description:
      'Sistema iorubá — 16 Odu, orixás, preceitos cerimoniais, ebós, oferendas.',
    longDescription:
      'Comunidade de estudo do Ifá e dos Orixás. Compartilhamos o conhecimento dos 16 Odu, dos orixás regentes, dos preceitos e ebós. Respeitamos profundamente a tradição iorubá, seus babalorixás e yalorixás. Este NÃO é espaço para charlatanismo, promessas de cura instantânea ou mercantilização da fé.',
    iconEmoji: '🪶',
    isPublic: true,
    requireApproval: false,
    rules: [
      'Respeito aos babalorixás e yalorixás — não substitua o terreiro por este espaço.',
      'Não compartilhe ebós de forma superficial — consulte a tradição e os mais velhos.',
      'Honre os orixás — não use a tradição para lucro fácil.',
      'Conteúdos sobre Ifá devem ter base em fontes confiáveis (Prandi, Beniste, Santos).',
    ],
  },
  {
    slug: 'astrologia',
    name: 'Astrologia — Mapa & Trânsitos',
    tradition: 'astrologia',
    description:
      'Astrologia ocidental e suas correntes — mapa natal, trânsitos, sinastria, previsão.',
    longDescription:
      'Espaço para estudo e prática da Astrologia. Compartilhamos mapas natais, análises de trânsitos, técnicas de sinastria e integração com outras práticas (Tarot, Cabala, Astrologia Védica). Encorajamos a abordagem psicológica e humanista, mas todas as correntes são bem-vindas com respeito.',
    iconEmoji: '♈',
    isPublic: true,
    requireApproval: false,
    rules: [
      'Respeite as diferentes correntes (humanista, tradicional, helenística, védica).',
      'Não faça previsões catastróficas absolutas — Astrologia indica tendências, não destino.',
      'Compartilhe técnicas e ferramentas com suas fontes.',
      'Se for postar mapa de terceiro, peça permissão explícita.',
    ],
  },
  {
    slug: 'tantra',
    name: 'Tantra & Yoga',
    tradition: 'tantra',
    description:
      'Tradição tântrica — kundalini, chakras, kundalini yoga, tantra sexual consciente.',
    longDescription:
      'Comunidade dedicada ao estudo e prática do Tantra e do Yoga. Compartilhamos práticas de meditação, pranayama, kriyas, e os caminhos do kundalini. Respeitamos a profundidade da tradição tântrica, indo além da redução "sexual new age" — abraçamos tantra como filosofia, prática energética e caminho de despertar.',
    iconEmoji: '🕉️',
    isPublic: true,
    requireApproval: false,
    rules: [
      'Respeito à tradição — não reduza tantra a marketing de "sexo sagrado".',
      'Práticas avançadas (kundalini forte, neotantra) devem ser orientadas por facilitador experiente.',
      'Conteúdos sobre chakras devem ter base nos textos clássicos e não em versões ocidentais simplificadas.',
      'Vulnerabilidade e respeito: o corpo é templo, não produto.',
    ],
  },
  {
    slug: 'reiki',
    name: 'Reiki & Cura Energética',
    tradition: 'reiki',
    description:
      'Sistema Usui — canais de cura, níveis 1/2/3, prática clínica e integração terapêutica.',
    longDescription:
      'Comunidade de praticantes de Reiki e outras técnicas de cura energética. Compartilhamos protocolos, dúvidas de sintonização, casos clínicos (anonimizados) e integração com práticas complementares (cristais, cromoterapia, aromaterapia). Defendemos o Reiki como prática complementar e nunca como substituto de tratamento médico.',
    iconEmoji: '🔆',
    isPublic: true,
    requireApproval: false,
    rules: [
      'Reiki é prática complementar, não substituto de tratamento médico ou psicológico.',
      'Não prometa curas absolutas — pratique com humildade.',
      'Respeite as diferentes linhagens (Usui, Karuna, Tummo, Shamballa etc).',
      'Compartilhe casos clínicos SEM identificar pacientes (LGPD).',
    ],
  },
  {
    slug: 'meditacao',
    name: 'Meditação & Mindfulness',
    tradition: 'meditacao',
    description:
      'Práticas meditativas de várias tradições — Vipassana, Zazen, Yoga Nidra, atenção plena.',
    longDescription:
      'Espaço acolhedor para praticantes de meditação de todos os níveis e linhagens. Discutimos técnicas, enfrentamos dificuldades da prática (dor no sentar, dispersão, sono), compartilhamos retiros e科学研究. Encorajamos prática diária consistente e respeito a todas as tradições contemplativas.',
    iconEmoji: '🧘',
    isPublic: true,
    requireApproval: false,
    rules: [
      'Respeite todas as linhagens (Vipassana, Zazen, Dzogchen, Advaita, Cristã contemplativa, Sufi).',
      'Discuta pesquisas científicas com bom senso e fontes citadas.',
      'Não "venda" técnicas como solução mágica para ansiedade/depressão.',
      'Compartilhe sua prática com honestidade — vulnerabilidade é bem-vinda.',
    ],
  },
  {
    slug: 'xamanismo',
    name: 'Xamanismo & Plantas Sagradas',
    tradition: 'xamanismo',
    description:
      'Tradições xamânicas — ayahuasca, peyote, cactos, rituais indígenas, integração.',
    longDescription:
      'Comunidade de estudos xamânicos e práticas com plantas sagradas. Respeitamos profundamente os povos indígenas originários detentores desses saberes. Discutimos cerimônias, dietas, integração pós-experiência e responsabilidade individual e coletiva. NÃO promovemos uso recreativo ou charlatanismo.',
    iconEmoji: '🌿',
    isPublic: true,
    requireApproval: false,
    rules: [
      'Respeito absoluto aos povos indígenas e seus protocolos sagrados.',
      'Plantas sagradas devem ser usadas em contexto cerimonial, não recreativo.',
      'NÃO promova "chá de ayahuasca caseiro" ou uso sem orientação.',
      'Compartilhe conteúdo de integração com responsabilidade e ética.',
    ],
  },
  {
    slug: 'cristianismo-mistico',
    name: 'Cristianismo Místico',
    tradition: 'cristianismo-mistico',
    description:
      'Mística cristã — Meister Eckhart, Teresa de Ávila, João da Cruz, apofatismo.',
    longDescription:
      'Espaço para o estudo e a prática da mística cristã. Aprofundamos a leitura dos místicos medievais e renascentistas, a tradição contemplativa cristã (Lectio Divina, Centering Prayer), e o diálogo com outras religiões. Respeitamos a tradição católica, ortodoxa e protestante contemplativa.',
    iconEmoji: '✝️',
    isPublic: true,
    requireApproval: false,
    rules: [
      'Respeite todas as confissões cristãs e tradições místicas.',
      'Discussões teológicas com profundidade, sem proselitismo agressivo.',
      'Conteúdo sobre prática contemplativa deve ter base em fontes reconhecidas.',
      'Diálogo inter-religioso é bem-vindo; ataques a outras fés não são.',
    ],
  },
  {
    slug: 'sufismo',
    name: 'Sufismo — Caminho do Coração',
    tradition: 'sufismo',
    description:
      'Mística islâmica — Rumi, Hafiz, dança dos dervixes, dhikr, tariqas.',
    longDescription:
      'Comunidade dedicada ao estudo e prática do Sufismo, a dimensão mística do Islã. Compartilhamos poesia, ensinamentos dos grandes mestres (Rumi, Hafiz, Ibn Arabi), práticas de dhikr e a riqueza das tariqas. Respeitamos a tradição islâmica e promovemos o diálogo inter-religioso.',
    iconEmoji: '☪️',
    isPublic: true,
    requireApproval: false,
    rules: [
      'Respeito à tradição islâmica e suas fontes (Corão, Hadith).',
      'Não confunda Sufismo com sincretismo superficial — tem profundidade própria.',
      'Conteúdo sobre tariqas deve respeitar a transmissão mestre-discípulo.',
      'Poesia sufi é bem-vinda, mas com contexto e tradução responsável.',
    ],
  },
  {
    slug: 'taoismo',
    name: 'Taoísmo & Filosofia Oriental',
    tradition: 'taoismo',
    description:
      'Tao Te King, I Ching, Wu Wei, alquimia interna, práticas taoístas de longa vida.',
    longDescription:
      'Estudo da filosofia e práticas taoístas. Compartilhamos leituras do Tao Te King, I Ching, práticas de Tai Chi Chuan, Chi Kung (Qigong), meditação taoísta e alquimia interna (Neidan). Encorajamos a integração da visão taoísta no cotidiano contemporâneo.',
    iconEmoji: '☯️',
    isPublic: true,
    requireApproval: false,
    rules: [
      'Respeite a profundidade da tradição — Taoísmo não é "ir com o flow".',
      'Práticas de Tai Chi/Qi Gong devem ter instrutor qualificado para iniciantes.',
      'I Ching: compartilhe suas leituras com método (moedas, hastes, ou sincrônico).',
      'Discuta alquimia interna com seriedade e responsabilidade.',
    ],
  },
  {
    slug: 'umbanda',
    name: 'Umbanda & Linha de Caboclo',
    tradition: 'umbanda',
    description:
      'Religião afro-brasileira — entidades, giras, troncos, passes, espiritualidade cabocla.',
    longDescription:
      'Comunidade de praticantes e estudiosos da Umbanda. Compartilhamos o conhecimento dos sete troncos, das linhas (Caboclos, Pretos-Velhos, Crianças, Exus, Pombagiras), dos passes e da organização das giras. Respeitamos profundamente a Umbanda como religião legítima e seus médiuns.',
    iconEmoji: '🪘',
    isPublic: true,
    requireApproval: false,
    rules: [
      'Respeito aos médiuns, pais e mães-de-santo — não substitua o terreiro.',
      'Não confunda Umbanda com Candomblé — são tradições distintas.',
      'Não use Umbanda para mercantilização de passes ou "trabalhos".',
      'Conteúdo sobre entidades deve ter respeito absoluto — não trate como "espíritos de luz".',
    ],
  },
  {
    slug: 'candomble',
    name: 'Candomblé & Nações',
    tradition: 'candomble',
    description:
      'Tradição iorubá no Brasil — Ketu, Jeje, Nagô, orixás, iniciação, axé.',
    longDescription:
      'Comunidade dedicada ao Candomblé em suas diferentes nações (Ketu, Jeje, Nagô, Angola, Efon). Compartilhamos o conhecimento dos orixás, ritos de iniciação (feitura de santo), fundamentos das casas, liturgia e respeito absoluto à hierarquia religiosa. NÃO permitimos superficialidade ou apropriação cultural.',
    iconEmoji: '🌍',
    isPublic: true,
    requireApproval: false,
    rules: [
      'Respeito absoluto à hierarquia: Zelador-de-Santo, Baba/Mãe Pequena, Alabê.',
      'Não revele fundamentos iniciáticos em público — mantenha o axé da casa.',
      'Não confunda com Umbanda, Quimbanda ou religiões afro-derivadas.',
      'Conteúdo deve ter base em fontes sérias (Prandi, Beniste, Querino, Santos).',
    ],
  },
];

async function main() {
  console.log('🌱 Seeding community groups (12 tradições)...');

  let created = 0;
  let updated = 0;

  for (const g of GROUPS) {
    const result = await prisma.group.upsert({
      where: { slug: g.slug },
      update: {
        name: g.name,
        description: g.description,
        longDescription: g.longDescription,
        rules: g.rules,
        // iconEmoji é apenas para UI; persistimos como iconUrl placeholder
        iconUrl: g.iconUrl ?? null,
        tradition: g.tradition,
        isPublic: g.isPublic,
        requireApproval: g.requireApproval,
      },
      create: {
        slug: g.slug,
        name: g.name,
        description: g.description,
        longDescription: g.longDescription,
        rules: g.rules,
        iconUrl: g.iconUrl ?? null,
        tradition: g.tradition,
        isPublic: g.isPublic,
        requireApproval: g.requireApproval,
      },
    });

    // Detecta criação vs update (createdAt == updatedAt == mesmo segundo indica criação)
    const isNew = result.createdAt.getTime() === result.updatedAt.getTime();
    if (isNew) created++;
    else updated++;
  }

  console.log(`✅ Grupos: ${created} criados, ${updated} atualizados, ${GROUPS.length} totais`);
  console.log('   Tradições:', GROUPS.map((g) => g.tradition).join(', '));

  console.log('🎉 Seed de grupos concluído!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error('❌ Erro no seed de grupos:', err);
    await prisma.$disconnect();
    process.exit(1);
  });
