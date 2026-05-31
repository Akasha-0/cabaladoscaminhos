import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const DifficultySchema = z.enum(['beginner', 'intermediate', 'advanced']);
const RitualCategorySchema = z.enum([
  'protection', 'prosperity', 'healing', 'love', 'purification',
  'ancestral', 'transformation', 'manifestation', 'chakra', 'candomble'
]);

const RitualGuideSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: RitualCategorySchema,
  duration: z.string(),
  difficulty: DifficultySchema,
  materials: z.array(z.string()),
  steps: z.array(z.string()),
  intention: z.string().optional(),
  bestTime: z.string().optional(),
  benefits: z.array(z.string()).optional(),
  precautions: z.array(z.string()).optional(),
  // Spiritual correlations
  sefirot: z.array(z.string()).optional(),
  orixa: z.string().optional(),
  chakra: z.array(z.number()).optional(),
  tradicao: z.string().optional(),
  numeroSagrado: z.number().optional(),
  luaFase: z.enum(['nova', 'crescente', 'cheia', 'minguante']).optional(),
});

const RitualGuidesQuerySchema = z.object({
  category: RitualCategorySchema.optional(),
  id: z.string().optional(),
  difficulty: DifficultySchema.optional(),
  orixa: z.string().optional(),
  sefirot: z.string().optional(),
  chakra: z.coerce.number().int().min(1).max(7).optional(),
});

export type RitualGuide = z.infer<typeof RitualGuideSchema>;
export const dynamic = 'force-dynamic';

// ─── Ritual Guides Data ──────────────────────────────────────────────────────────
const guides: RitualGuide[] = [
  {
    id: 'guide-001',
    title: 'Ritual de Proteção Divina',
    description: 'Ritual sagrado para criar um escudo energético e proteger seu espaço de influências negativas.',
    category: 'protection',
    duration: '30 minutos',
    difficulty: 'beginner',
    materials: [
      'Vela branca',
      'Sal grosso',
      'Alho',
      'Água benta',
      'Imagem de São Jorge'
    ],
    steps: [
      'Purifique o ambiente com sal grosso nos cantos',
      'Acenda a vela branca com intenção de proteção',
      'Faça a invocação de proteção',
      'Passe o alho nos quatro cantos da casa',
      'Beba a água benta purificada',
      'Agradeça e finalize o ritual'
    ],
    intention: 'Proteção e segurança energética',
    bestTime: 'Quarta-feira à noite',
    benefits: [
      'Escudo energético contra negatividade',
      'Proteção durante jornadas difíceis',
      'Harmonização do espaço habitado',
      'Fortalecimento da aura'
    ],
    precautions: [
      'Não realize durante fases lunares descrescentes',
      'Evite interrupções durante o ritual',
      'Não utilize se estiver em luto recente'
    ],
    sefirot: ['Gevurah', 'Chesed'],
    orixa: 'Ogum',
    chakra: [1, 3],
    tradicao: 'Cristianismo/Tradições Afro',
    numeroSagrado: 7,
    luaFase: 'cheia',
  },
  {
    id: 'guide-002',
    title: 'Ritual de Abundância e Prosperidade',
    description: 'Prática sagrada para atrair prosperidade e abrir caminhos para a abundância.',
    category: 'prosperity',
    duration: '45 minutos',
    difficulty: 'intermediate',
    materials: [
      'Vela verde',
      'Vela dourada',
      'Moedas de cobre',
      'Canela em pau',
      'Mel',
      'Arruda'
    ],
    steps: [
      'Organize o altar com as velas verde e dourada',
      'Coloque as moedas no centro do altar',
      'Acenda a canela em pau como incenso',
      'Faça a oração de prosperidade três vezes',
      'Misture o mel com água e abençoe nos cantos',
      'Enterre as moedas no jardim ou vaso de planta',
      'Agradeça pela abundância que virá'
    ],
    intention: 'Abundância em todas as áreas da vida',
    bestTime: 'Quinta-feira ao amanhecer',
    benefits: [
      'Atrair oportunidades de prosperidade',
      'Abrir caminhos bloqueados',
      'Aumentar a vibração de abundância',
      'Fortalecer a mediunidade financeira'
    ],
    precautions: [
      'Evite pensamentos de carência durante o ritual',
      'Não conte sobre o ritual para terceiros',
      'Mantenha disciplina espiritual após o ritual'
    ],
    sefirot: ['Chesed', 'Netzach'],
    orixa: 'Oxum',
    chakra: [4],
    tradicao: 'Tradições Afro-Brasileiras',
    numeroSagrado: 10,
    luaFase: 'crescente',
  },
  {
    id: 'guide-003',
    title: 'Ritual de Cura Emocional',
    description: 'Ritual profundo para liberação de bloqueios emocionais e cura da alma.',
    category: 'healing',
    duration: '40 minutos',
    difficulty: 'intermediate',
    materials: [
      'Vela azul',
      'Vela branca',
      'Incenso de lavanda',
      'Água de flor de bach',
      'Cristal de quartzo rosa',
      'Papel e caneta'
    ],
    steps: [
      'Desenhe um círculo sagrado no chão',
      'Coloque as velas nos pontos cardeais',
      'Acenda o incenso de lavanda',
      'Segure o quartzo rosa sobre o chakra do coração',
      'Escreva no papel o que deseja curar',
      'Queime o papel sobre a chama da vela azul',
      'Permaneça em silêncio meditativo por 10 minutos',
      'Agradeça aos guias espirituais'
    ],
    intention: 'Liberação de bloqueios emocionais',
    bestTime: 'Segunda-feira durante a lua cheia',
    benefits: [
      'Liberação de traumas emocionais',
      'Harmonização dos chakras emocionais',
      'Aumento da autocompaixão',
      'Renovação da energia vital'
    ],
    precautions: [
      'Este ritual pode trazer memórias dolorosas à tona',
      'Recomenda-se acompanhamento terapêutico',
      'Não realize em momentos de grande vulnerabilidade'
    ],
    sefirot: ['Tipheret', 'Netzach'],
    orixa: 'Oxum',
    chakra: [4, 5],
    tradicao: 'Terapia Espiritual',
    numeroSagrado: 11,
    luaFase: 'cheia',
  },
  {
    id: 'guide-004',
    title: 'Ritual de Purificação Ancestral',
    description: 'Cerimônia para purificação espiritual e limpeza de energias densas.',
    category: 'purification',
    duration: '35 minutos',
    difficulty: 'beginner',
    materials: [
      'Vela branca',
      'Vela dourada',
      'Defumador de palo santo',
      'Sal grosso',
      'Alcachofra',
      'Água de cheiro'
    ],
    steps: [
      'Acenda a vela branca pedindo purificação',
      'Faça o defumador de palo santo em toda a casa',
      'Misture água com sal e Alcachofra',
      'Passe a água de purificação nas portas e janelas',
      'Acenda a vela dourada para proteção',
      'Faça uma oração de agradecimento aos ancestrais',
      'Mantenha a vela acesa até que se apague naturalmente'
    ],
    intention: 'Purificação e proteção espiritual',
    bestTime: 'Sábado durante a lua nova',
    benefits: [
      'Eliminação de energias negativas',
      'Proteção espiritual',
      'Renovação do ambiente',
      'Conexão com ancestrais'
    ],
    precautions: [
      'Não use durante períodos menstruais (tradição)',
      'Evite contato com animais durante o ritual',
      'Mantenha janelas fechadas durante a defumação'
    ],
    sefirot: ['Malkuth', 'Yesod'],
    orixa: 'Iemanjá',
    chakra: [2, 6],
    tradicao: 'Umbanda/Candomblé',
    numeroSagrado: 8,
    luaFase: 'nova',
  },
  {
    id: 'guide-005',
    title: 'Ritual de Purificação com Ervas',
    description: 'Defumação com ervas sagradas para cleansing espiritual.',
    category: 'purification',
    duration: '25 minutos',
    difficulty: 'beginner',
    materials: [
      'Arruda',
      'Alecrim',
      'Pau-brasil',
      'Quebra-panela',
      'Vela branca',
      'Prato com sal'
    ],
    steps: [
      'Faça um maço com as ervas secas',
      'Acenda o maço de ervas em brasa',
      'Carry the smoking herbs through your space',
      'Fique em cada cômodo por alguns minutos',
      'Repita orações de proteção',
      'Coloque as ervas consumidas no prato com sal',
      'Descarte longe de casa'
    ],
    intention: 'Limpeza energética e proteção',
    bestTime: 'Quarta-feira ao anoitecer',
    benefits: [
      'Eliminação de miasmas negativos',
      'Abertura para boas energias',
      'Proteção contra olho gordo',
      'Renovação da energia ambiente'
    ],
    precautions: [
      'Pessoas sensível devem evitar respirar a fumaça diretamente',
      'Não realize durante gestação',
      'Proteja animais de estimação da fumaça'
    ],
    sefirot: ['Gevurah'],
    orixa: 'Ogum',
    chakra: [1, 3],
    tradicao: 'Candomblé',
    numeroSagrado: 7,
    luaFase: 'nova',
  },
  {
    id: 'guide-006',
    title: 'Ritual de Iniciação no Candomblé',
    description: 'Cerimônia sagrada para iniciação espiritual no candomblé.',
    category: 'candomble',
    duration: '90 minutos',
    difficulty: 'advanced',
    materials: [
      'Eru (advinho)',
      'Velas coloridas para cada Orixá',
      'Akará (bolo de feijão)',
      'Obi (noz de cola)',
      'Ewo ( sacrifice animal)',
      'Otá (pedras)',
      'Pyr (fogo sagrado)'
    ],
    steps: [
      'Preparação espiritual de 21 dias',
      'Banho de ervas específico para o Orixá',
      'Recebimento do Ori (cabeça) pelo Babalawo',
      'Feitura do Opa (cabeça) com sacrifícios',
      'Feitura de Eru para o Novo Iyawo',
      'Ritual de sacrifice segundo o Orixá',
      'Sepultamento das pedras de Orixá',
      'Sete dias de reclusão',
      'Saudação aos Oduns e Orixás'
    ],
    intention: 'Iniciação espiritual e identificação com o Orixá',
    bestTime: 'Durante Odus específicos determinadas pelo Babalawo',
    benefits: [
      'Fortalecimento da mediunidade ancestral',
      'Proteção espiritual dos Orixás',
      'Alinhamento com o caminho espiritual',
      'Abertura para orientações espirituais'
    ],
    precautions: [
      'Somente para pessoas já iniciadas no candomblé',
      'Evite realizar sem o acompanhamento de um Babalawo ou Yalorixá',
      'Respeite tabus e pravas específicas de cada Orixá'
    ],
    sefirot: ['Kether', 'Chokhmah', 'Binah'],
    orixa: 'Oxalá',
    chakra: [6, 7],
    tradicao: 'Candomblé',
    numeroSagrado: 33,
    luaFase: 'nova',
  },
  {
    id: 'guide-007',
    title: 'Ritual de Amaração do Destino',
    description: 'Ritual poderoso para fortalecer laços afetivos e unir duas almas.',
    category: 'love',
    duration: '50 minutos',
    difficulty: 'advanced',
    materials: [
      'Vela vermelha',
      'Vela rosa',
      'Defumador com patchouli',
      'Duas fitas vermelhas',
      'Perfume de musk',
      'Flores vermelhas e rosas',
      'Mel'
    ],
    steps: [
      'Escreva os dois nomes em um papel',
      'Acenda as velas vermelha e rosa lado a lado',
      'Faça o defumador de patchouli',
      'Una as duas fitas vermelhas enquanto rezam juntos',
      'Aplique o perfume de musk nos pulsos',
      'Coloque as flores ao redor das velas',
      'Faça a ligação dos nomes com fitas enquanto lê a oração',
      'Una as pessoas envolvidas ao redor do altar',
      'Dê um ao outro mel simbolizando a doçura do amor',
      'Enterrem as fitas unidas num vaso de flores'
    ],
    intention: 'Fortalecimento de laços afetivos e amor duradouro',
    bestTime: 'Sexta-feira à noite em lua crescente',
    benefits: [
      'Fortalecimento de laços emocionais',
      'Aprofundamento da conexão afetiva',
      'Proteção do relacionamento contra energias negativas',
      'Renovação do compromisso e dedicação'
    ],
    precautions: [
      'Jamais use para forçar o amor de outra pessoa',
      'Realize apenas com consentimento de ambas as pessoas',
      'Evite usar em casos de violência doméstica'
    ],
    sefirot: ['Netzach', 'Tipheret'],
    orixa: 'Oxum',
    chakra: [4],
    tradicao: 'Tradições Afro-Brasileiras',
    numeroSagrado: 6,
    luaFase: 'crescente',
  },
  {
    id: 'guide-008',
    title: 'Ritual de Transformação Interior',
    description: 'Prática profunda para renovação interior, mudar velhos padrões e evoluir consciência.',
    category: 'transformation',
    duration: '60 minutos',
    difficulty: 'intermediate',
    materials: [
      'Vela laranja',
      'Vela dourada',
      'Incenso de olibano',
      'Espelho pequeno',
      'Flor de lótus',
      'Água de flor de laranjeira',
      'Mantra para a transformação'
    ],
    steps: [
      'Acenda o incenso de olibano para abrir espaço sagrado',
      'Coloque o espelho à sua frente',
      'Acenda as velas laranja e dourada refletidas no espelho',
      'Observe-se no espelho e reconheça seus padrões velhos',
      'Fale em voz alta o que deseja transformar',
      'Coloque a flor de lótus sobre o peito',
      'Aplique a água de flor de laranjeira na testa e pulsos',
      'Repita o mantra de transformação',
      'Visualize-se já transformado(a) emanando a nova energia',
      'Agradeça pela transformação em curso'
    ],
    intention: 'Renovação interior e libertação de velhos padrões',
    bestTime: 'Domingo ao amanhecer ou durante eclipse',
    benefits: [
      'Libertação de padrões limitantes',
      'Acleração do processo evolutivo',
      'Abertura para nova versão de você mesmo',
      'Fortalecimento da auto estima e propósito'
    ],
    precautions: [
      'Escolha uma área específica para trabalhar',
      'Evite abordar múltiplos pontos ao mesmo tempo',
      'Mantenha prática regular para consolidar mudanças'
    ],
    sefirot: ['Chokhmah', 'Tipheret'],
    orixa: 'Oxalá',
    chakra: [6, 7],
    tradicao: 'Neo-Espiritualidade',
    numeroSagrado: 22,
    luaFase: 'cheia',
  },
];

// ─── API Route ─────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const parseResult = RitualGuidesQuerySchema.safeParse({
      category: searchParams.get('category'),
      id: searchParams.get('id'),
      difficulty: searchParams.get('difficulty'),
      orixa: searchParams.get('orixa'),
      sefirot: searchParams.get('sefirot'),
      chakra: searchParams.get('chakra'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { category, id, difficulty, orixa, sefirot, chakra } = parseResult.data;

    // Get single guide
    if (id) {
      const guide = guides.find((g) => g.id === id);
      if (!guide) {
        return NextResponse.json({
          success: false,
          error: 'Guide not found',
          availableIds: guides.map(g => g.id),
        }, { status: 404 });
      }
      return NextResponse.json({ success: true, guide });
    }

    let filteredGuides = [...guides];

    // Apply filters
    if (category) {
      filteredGuides = filteredGuides.filter((g) => g.category === category);
    }

    if (difficulty) {
      filteredGuides = filteredGuides.filter((g) => g.difficulty === difficulty);
    }

    // Spiritual filters
    if (orixa) {
      filteredGuides = filteredGuides.filter((g) =>
        g.orixa?.toLowerCase().includes(orixa.toLowerCase())
      );
    }

    if (sefirot) {
      filteredGuides = filteredGuides.filter((g) =>
        g.sefirot?.some(sf => sf.toLowerCase().includes(sefirot.toLowerCase()))
      );
    }

    if (chakra) {
      filteredGuides = filteredGuides.filter((g) =>
        g.chakra?.includes(chakra)
      );
    }

    // Statistics
    const categories = Array.from(new Set(guides.map((g) => g.category)));
    const difficulties = ['beginner', 'intermediate', 'advanced'];
    
    const stats = {
      byCategory: guides.reduce((acc, g) => {
        acc[g.category] = (acc[g.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byDifficulty: guides.reduce((acc, g) => {
        acc[g.difficulty] = (acc[g.difficulty] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byTradicao: guides.reduce((acc, g) => {
        if (g.tradicao) acc[g.tradicao] = (acc[g.tradicao] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byOrixa: guides.reduce((acc, g) => {
        if (g.orixa) acc[g.orixa] = (acc[g.orixa] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byLuaFase: guides.reduce((acc, g) => {
        if (g.luaFase) acc[g.luaFase] = (acc[g.luaFase] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      guides: filteredGuides,
      total: guides.length,
      count: filteredGuides.length,
      categories,
      difficulties,
      filters: { category, difficulty, orixa, sefirot, chakra },
      stats,
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${err.message}`,
    }, { status: 500 });
  }
}