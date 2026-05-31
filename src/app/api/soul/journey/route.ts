import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const JourneyStageSchema = z.enum(['awakening', 'purification', 'illumination', 'integration', 'transcendence']);
const SoulQuerySchema = z.object({
  stage: JourneyStageSchema.optional(),
  includeLessons: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  limit: z.coerce.number().int().positive().max(20).optional(),
});

export const dynamic = 'force-dynamic';

// ─── Soul Journey Data ───────────────────────────────────────────────────────
interface SoulStage {
  id: string;
  stage: string;
  name: string;
  nameEn: string;
  description: string;
  duration: string;
  lessons?: string[];
  symbols: string[];
  orixas: string[];
  sefirot: string[];
  chakra: string;
  signs: string[];
}

const SOUL_JOURNEY_STAGES: SoulStage[] = [
  {
    id: 'birth-awareness',
    stage: 'awakening',
    name: 'Despertar da Alma',
    nameEn: 'Soul Awakening',
    description: 'O momento em que a alma reconhece sua verdadeira natureza e busca conexão espiritual.',
    duration: '7 anos',
    lessons: [
      'Reconhecer a existência de algo maior',
      'Despertar para questões espirituais',
      'Primeira intuição do propósito de vida',
    ],
    symbols: ['Aurora', 'Ovo cósmico', 'Semente'],
    orixas: ['Oxalá', 'Iemanjá'],
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 'Sahasrara (7º)',
    signs: ['LuaNova', 'Eclipse'],
  },
  {
    id: 'first-tests',
    stage: 'awakening',
    name: 'Primeiros Testes',
    nameEn: 'First Tests',
    description: 'A alma enfrenta seus primeiros desafios para testar sua determinação no caminho.',
    duration: '5 anos',
    lessons: [
      'Fortalecer a fé',
      'Desenvolver resiliência',
      'Aprender a confiar no divino',
    ],
    symbols: ['Espada', 'Fogo', 'Tempestade'],
    orixas: ['Ogum', 'Xangô'],
    sefirot: ['Gevurah', 'Chesed'],
    chakra: 'Manipura (3º)',
    signs: ['Marte', 'Conjuntções tensas'],
  },
  {
    id: 'shadow-work',
    stage: 'purification',
    name: 'Trabalho com a Sombra',
    nameEn: 'Shadow Work',
    description: 'Enfrentar e integrar os aspectos ocultos da psyche para purificação interior.',
    duration: '10 anos',
    lessons: [
      'Confrontar medos e traumas',
      'Integrar aspectos negados do self',
      'Desenvolver auto-compassão',
    ],
    symbols: ['Espelho', 'Noite', 'Caverna'],
    orixas: ['Omolu', 'Nanã'],
    sefirot: ['Yesod', 'Tipheret'],
    chakra: 'Svadhisthana (2º)',
    signs: ['Saturno transito', 'Plutão aspecto'],
  },
  {
    id: 'ancestral-healing',
    stage: 'purification',
    name: 'Curação Ancestral',
    nameEn: 'Ancestral Healing',
    description: 'Limpeza de padrões familiares e heranças kármicas através do trabalho ancestral.',
    duration: '7 anos',
    lessons: [
      'Identificar padrões repetitivos',
      'Perdoar ancestralmente',
      'Romper correntes do passado',
    ],
    symbols: ['Raízes', 'Árvore genealógica', 'Coroa de espinhos'],
    orixas: ['Omolu', 'Iemanjá'],
    sefirot: ['Malkuth', 'Yesod'],
    chakra: 'Muladhara (1º)',
    signs: ['Quarto Lua', 'Netuno transito'],
  },
  {
    id: 'chakra-activation',
    stage: 'illumination',
    name: 'Ativação dos Chakras',
    nameEn: 'Chakra Activation',
    description: 'Despertar progressivo dos centros de energia para expansão da consciência.',
    duration: '12 anos',
    lessons: [
      'Ativar o Muladhara (segurança)',
      'Desenvolver o Svadhisthana (criatividade)',
      'Equilibrar o Manipura (poder pessoal)',
      'Abrir o Anahata (amor incondicional)',
      'Expressar o Vishuddha (comunicação)',
      'Desenvolver o Ajna (intuição)',
      'Iluminar o Sahasrara (união divina)',
    ],
    symbols: ['Flor de lótus', 'Arco-íris', 'Luz branca'],
    orixas: ['Oxum', 'Iansã', 'Oxóssi'],
    sefirot: ['Netzach', 'Hod', 'Tipheret'],
    chakra: 'Sete chakras',
    signs: ['Trânsitos harmoniosos', 'Júpiter aspekto'],
  },
  {
    id: 'sefirot-integration',
    stage: 'illumination',
    name: 'Integração dos Sefirot',
    nameEn: 'Sephirot Integration',
    description: 'Incorporar as 10 emanações divinas na consciência para iluminação completa.',
    duration: '15 anos',
    lessons: [
      'Caminhar entre as Três Colunas',
      'Equilibrar Misericórdia e Severidade',
      'Unificar os 10 atributos divinos',
    ],
    symbols: ['Árvore da Vida', 'Três Colunas', 'Estrela de David'],
    orixas: ['Oxalá', 'Todos'],
    sefirot: ['Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah', 'Tiferet', 'Netzach', 'Hod', 'Yesod', 'Malkuth'],
    chakra: 'Sahasrara (7º)',
    signs: ['Árvore da Vida ativada', 'Caminhos iluminados'],
  },
  {
    id: 'orixa-awakening',
    stage: 'integration',
    name: 'Despertar do Orixá',
    nameEn: 'Orixá Awakening',
    description: 'Conexão consciente com a energia do Orixá de cabeça para alinhamento espiritual.',
    duration: '10 anos',
    lessons: [
      'Identificar o Orixá de cabeça',
      'Estabelecer prática devocional',
      'Receber e integrar energias orixais',
    ],
    symbols: ['Sino', 'Bênção', 'Água sagrada'],
    orixas: ['Todos (personalizado)'],
    sefirot: ['Tipheret', 'Malkuth'],
    chakra: 'Anahata (4º)',
    signs: ['Orixá protector revelado', 'Sonhos com Orixá'],
  },
  {
    id: 'duality-transcendence',
    stage: 'integration',
    name: 'Transcendência da Dualidade',
    nameEn: 'Duality Transcendence',
    description: 'Superar as polaridades da existência para alcançar equilíbrio interno.',
    duration: '8 anos',
    lessons: [
      'Integrar luz e sombra',
      'Equilibrar masculino e feminino',
      'Transcender juío e apego',
    ],
    symbols: ['Taijitu', 'Yin-Yang', 'Equilíbrio'],
    orixas: ['Oxumaré'],
    sefirot: ['Tipheret', 'Daat'],
    chakra: 'Ajna (6º)',
    signs: ['Libra', 'Equinócio'],
  },
  {
    id: 'wisdom-sharing',
    stage: 'transcendence',
    name: 'Compartilhamento da Sabedoria',
    nameEn: 'Wisdom Sharing',
    description: 'Tornar-se canal de sabedoria para otros, servindo como guia espiritual.',
    duration: 'Vida toda',
    lessons: [
      'Ensinar sem impor',
      'Servir com humildade',
      'Ser instrumento do divino',
    ],
    symbols: ['Professor', 'Lâmpada', 'Tocha'],
    orixas: ['Oxóssi', 'Oxum'],
    sefirot: ['Chokhmah', 'Binah'],
    chakra: 'Vishuddha (5º)',
    signs: ['Mentor encontrado', 'Chamdo para ensinar'],
  },
  {
    id: 'unity-consciousness',
    stage: 'transcendence',
    name: 'Consciência de Unidade',
    nameEn: 'Unity Consciousness',
    description: 'Realização da единой природы de toda existência, dissolução do ego.',
    duration: 'Infinite',
    lessons: [
      'Perceber a единую энергию em tudo',
      'Dissolver identificação com o corpo/mente',
      'Viver na consciência do uno',
    ],
    symbols: ['Onda', 'Oceano', 'Céu infinito'],
    orixas: ['Oxalá', 'Iemanjá'],
    sefirot: ['Kether', 'Ein Sof'],
    chakra: 'Sahasrara (7º)',
    signs: ['Iluminação', 'Satori', 'Unidade com tudo'],
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = SoulQuerySchema.safeParse({
    stage: searchParams.get('stage'),
    includeLessons: searchParams.get('includeLessons'),
    limit: searchParams.get('limit'),
  });

  if (!parseResult.success) {
    return NextResponse.json({
      success: false,
      error: 'Parâmetros inválidos',
      details: parseResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  const { stage, includeLessons, limit } = parseResult.data;
  let journey = [...SOUL_JOURNEY_STAGES];

  if (stage) {
    journey = journey.filter(j => j.stage === stage);
  }

  if (limit) {
    journey = journey.slice(0, limit);
  }

  // Filter out lessons if not requested
  const response = journey.map(j => {
    if (!includeLessons) {
      const { lessons, ...rest } = j;
      return rest;
    }
    return j;
  });

  return NextResponse.json({
    success: true,
    journey: response,
    count: response.length,
    total: SOUL_JOURNEY_STAGES.length,
    stages: {
      awakening: SOUL_JOURNEY_STAGES.filter(j => j.stage === 'awakening').length,
      purification: SOUL_JOURNEY_STAGES.filter(j => j.stage === 'purification').length,
      illumination: SOUL_JOURNEY_STAGES.filter(j => j.stage === 'illumination').length,
      integration: SOUL_JOURNEY_STAGES.filter(j => j.stage === 'integration').length,
      transcendence: SOUL_JOURNEY_STAGES.filter(j => j.stage === 'transcendence').length,
    },
  });
}