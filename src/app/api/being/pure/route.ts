import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────

const PurityPracticeSchema = z.object({
  id: z.string(),
  name: z.string(),
  tradition: z.string(),
  description: z.string(),
  steps: z.array(z.string()),
  duration: z.string(),
  contraindications: z.array(z.string()).optional(),
});

const PurityPracticeQuerySchema = z.object({
  tradition: z.string().optional(),
  type: z.enum(['physical', 'energetic', 'mental', 'spiritual']).optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
});

const PURITY_PRACTICES: z.infer<typeof PurityPracticeSchema>[] = [
  {
    id: 'gatha-practice',
    name: 'Prática do Gatha',
    tradition: 'Zen Budismo',
    description: 'Recitação de versos sagrados para purificar a mente e alinhar a intenção.',
    steps: [
      'Sente-se em postura de meditação',
      'Recite o gatha lentamente, com atenção plena',
      'Permita que cada palavra penetre profundamente',
      'Repita até que a mente se acalme completamente',
      'Permaneça em silêncio após a recitação',
    ],
    duration: '15-30 minutos',
    contraindications: ['Não force a recitação se sentir resistência'],
  },
  {
    id: 'ho-oponopono',
    name: 'Ho\'oponopono',
    tradition: 'Havaiano',
    description: 'Antiga prática havaiana de reconciliação e purificação através de quatro frases.',
    steps: [
      'Identifique a situação ou pessoa que deseja purificar',
      'Repita interiormente: "Sinto muito" (pela dor que você causou)',
      'Repita: "Perdoe-me" (por não estar em paz)',
      'Repita: "Obrigado" (pela oportunidade de purificar)',
      'Repita: "Eu te amo" (a si mesmo, à situação, ao universo)',
    ],
    duration: '10-20 minutos',
  },
  {
    id: 'loving-kindness',
    name: 'Metta Bhavana (Benevolência)',
    tradition: 'Budismo Theravada',
    description: 'Cultivo systematic do amor bondoso para purificar o coração de ressentimentos.',
    steps: [
      'Comece com você mesmo: "Que eu seja feliz"',
      'Expanda para um benefactor: "Que [nome] seja feliz"',
      'Estenda a um amigo neutro: "Que [nome] seja feliz"',
      'Inclua alguém difícil: "Que [nome] seja feliz"',
      'Abra para todos os seres: "Que todos os seres sejam felizes"',
    ],
    duration: '20-45 minutos',
  },
  {
    id: 'water-purification',
    name: 'Purificação pela Água Sagrada',
    tradition: 'Universal',
    description: 'Uso de água purificada ritualisticamente para limpeza física e energética.',
    steps: [
      'Prepare água (de fonte, chuva ou purificada)',
      'Adicione sal marinho ou ervas purificadoras',
      'Segure a água com intenção de purificação',
      'Visualize a água absorvendo todas as impurezas',
      'Beba pequenas quantidades ou use para banhar locais',
    ],
    duration: '10-15 minutos',
  },
  {
    id: 'japa-mala',
    name: 'Japa Mala (Mantra)',
    tradition: 'Hindu/Yoga',
    description: 'Repetição de um mantra usando contas para purificar a mente e elevar a consciência.',
    steps: [
      'Escolha um mantra adequado (Om Namah Shivaya, Hare Krishna, etc.)',
      'Use um mala de 108 contas',
      'A cada conta, repita o mantra completo',
      'Mantenha foco na звук (som) e no significado',
      'Complete 1 mala (108 repetições) ou mais',
    ],
    duration: '30-60 minutos',
    contraindications: ['Evite durante menstruação segundo algumas tradições', 'Escolha mantra com orientação'],
  },
  {
    id: 'confession-practice',
    name: 'Prática de Confissão',
    tradition: 'Cristianismo/Judaísmo',
    description: 'Reconhecimento e arrependimento dos erros como forma de purificação da alma.',
    steps: [
      'Examine sua consciência em silêncio',
      'Identifique pensamentos, palavras e ações que causaram dano',
      'Reconheça cada erro com honestidade',
      'Sinta genuíno arrependimento',
      'Proponha-se a não repetir',
      'Busque reconciled com aqueles afetados',
    ],
    duration: '20-30 minutos',
  },
  {
    id: 'smudging',
    name: 'Smudging (Defumação Purificadora)',
    tradition: 'Indigenous Americano',
    description: 'Purificação com fumaça de ervas sagradas para limpar energias densas.',
    steps: [
      'Acenda sálvia branca, cedar, sweetgrass ou palo santo',
      'Sopra suavemente para criar fumaça abundante',
      'Passe a fumaça ao redor do corpo, começando pelos pés',
      'Permita que a fumaça preencha o ambiente',
      'Visualize a fumaça carregando embora todas as energias negativas',
      'Agradeça às ervas e ao Spirits pela ajuda',
    ],
    duration: '15-30 minutos',
    contraindications: ['Não use se tiver problemas respiratórios', 'Ventile bem o ambiente'],
  },
  {
    id: 'salt-bath',
    name: 'Banho de Sal',
    tradition: 'Universal',
    description: 'Purificação física e energética usando sal marinho ou sal rosa do Himalaia.',
    steps: [
      'Adicione 100-200g de sal à água morna do banho',
      'Entre na água e visualize-se sendo purificado',
      'Permaneça por 15-20 minutos',
      'Imagine o sal absorvendo todas as energias densas',
      'Enxágue com água limpa ao sair',
      'Vista roupas limpas após o ritual',
    ],
    duration: '30-45 minutos',
    contraindications: ['Não use em feridas abertas', 'Evite contato com olhos'],
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = PurityPracticeQuerySchema.safeParse({
    tradition: searchParams.get('tradition'),
    type: searchParams.get('type'),
    limit: searchParams.get('limit'),
  });

  if (!parseResult.success) {
    return NextResponse.json({
      success: false,
      error: 'Parâmetros inválidos',
      details: parseResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  const { tradition, type, limit } = parseResult.data;
  let practices = [...PURITY_PRACTICES];

  if (tradition) {
    practices = practices.filter(p => 
      p.tradition.toLowerCase().includes(tradition.toLowerCase())
    );
  }

  if (limit) {
    practices = practices.slice(0, limit);
  }

  return NextResponse.json({
    success: true,
    practices,
    count: practices.length,
    total: PURITY_PRACTICES.length,
  });
}