import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const ElementSchema = z.enum(['agua', 'terra', 'fogo', 'ar', 'eter']);
const ChakraSchema = z.enum([
  'coroa', 'terceiro-olho', 'garanta', 'cardíaco',
  'plexo-solar', 'sacral', 'raiz',
]);
const OrixaSchema = z.enum([
  'Oxum', 'Iemanjá', 'Ogum', 'Xangô', 'Iansã',
  'Oxumar', 'Nanã', 'Obá', 'Logunede', 'Oxóssi',
  'Eshu', 'Omolu', 'Ibeji', 'Aruanda',
]);
const SefirahSchema = z.enum([
  'Keter', 'Chokhmah', 'Binah', 'Daat',
  'Chesed', 'Gevurah', 'Tiferet', 'Netzach',
  'Hod', 'Yesod', 'Malkut',
]);
const DaySchema = z.enum([
  'domingo', 'segunda', 'terca', 'quarta',
  'quinta', 'sexta', 'sabado',
]);
const GardenTypeSchema = z.enum(['seeds', 'rituals']);
const GardenQuerySchema = z.object({
  type: GardenTypeSchema.optional(),
  id: z.string().optional(),
  day: DaySchema.optional(),
  element: ElementSchema.optional(),
  chakra: ChakraSchema.optional(),
});
interface GardenSeed {
  id: string;
  name: string;
  element: string;
  chakra: string;
  orixa: string;
  sefirah: string;
  practice: string;
}
interface RitualPractice {
  id: string;
  name: string;
  day: string;
  time: string;
  element: string;
  description: string;
  steps: string[];
}
    name: 'Semente da Alegria',
    element: 'Fogo',
    chakra: '4º Cardíaco',
    orixa: 'Oxum',
    sefirah: 'Tiferet',
    practice: 'Cultivar a alegria interna através de cantos, danças e oferendas de mel.',
  },
  {
    id: 'sabedoria',
    name: 'Semente da Sabedoria',
    element: 'Ar',
    chakra: '6º Frontal',
    orixa: 'Oxóssi',
    sefirah: 'Chesed',
    practice: 'Buscar conhecimento nas matas, estudar e oferecer frutas aos Orixás.',
  },
  {
    id: 'forca',
    name: 'Semente da Força',
    element: 'Fogo',
    chakra: '2º Sacro',
    orixa: 'Iansã',
    sefirah: 'Geburah',
    practice: 'Realizar movimentos de coragem, quebrar demandas e ativar o sangue.',
  },
  {
    id: 'paz',
    name: 'Semente da Paz',
    element: 'Éter',
    chakra: '7º Coronário',
    orixa: 'Oxalá',
    sefirah: 'Kether',
    practice: 'Vestir-se de branco, manter o silêncio e acender velas brancas.',
  },
  {
    id: 'justica',
    name: 'Semente da Justiça',
    element: 'Fogo',
    chakra: '3º Plexo Solar',
    orixa: 'Xangô',
    sefirah: 'Hod',
    practice: 'Estudar a verdade, acender velas douradas e oferecer amalá.',
  },
  {
    id: 'aterramento',
    name: 'Semente do Aterramento',
    element: 'Terra',
    chakra: '1º Básico',
    orixa: 'Omolu',
    sefirah: 'Malkuth',
    practice: 'Andar descalço na terra, oferecer pipoca e realizar limpezas.',
  },
  {
    id: 'transformacao',
    name: 'Semente da Transformação',
    element: 'Água',
    chakra: '2º Sacro',
    orixa: 'Oxumaré',
    sefirah: 'Yesod',
    practice: 'Aceitar as mudanças, amarrar fitas coloridas e banhar-se com folhas de fortuna.',
  },
  {
    id: 'protecao',
    name: 'Semente da Proteção',
    element: 'Terra',
    chakra: '5º Laríngeo',
    orixa: 'Ogum',
    sefirah: 'Geburah',
    practice: 'Colocar espada-de-são-jorge nas portas, usar guiné em defumações.',
  },
];

const RITUAL_PRACTICES: RitualPractice[] = [
  {
    id: 'segunda',
    name: 'Ritual de Aterramento e Limpeza',
    day: 'Segunda-feira',
    time: 'Ao amanhecer',
    element: 'Terra',
    description: 'Dia de Omolu para limpeza espiritual, transmutação e respeito aos ancestrais.',
    steps: [
      'Desperte ao amanhecer em silêncio',
      'Banho de canela-de-velho nos pés',
      'Ofereça pipoca (Deburu) para Omolu',
      'Ande descalço na terra por alguns minutos',
      'Acenda vela vermelha e branca',
    ],
  },
  {
    id: 'terca',
    name: 'Ritual de Força e Movimento',
    day: 'Terça-feira',
    time: ' Meio-dia',
    element: 'Fogo',
    description: 'Dia de Iansã para quebra de demandas e ativação da coragem.',
    steps: [
      'Defume com guiné e pinhão roxo',
      'Banho de inhame assado',
      'Realize movimentos físicos intensos',
      'Quebre um galho seco simbolizando demandas',
      'Acenda vela laranja',
    ],
  },
  {
    id: 'quarta',
    name: 'Ritual de Justiça e Clareza',
    day: 'Quarta-feira',
    time: 'Manhã',
    element: 'Ar',
    description: 'Dia de Xangô para estudos, verdade e equilíbrio mental.',
    steps: [
      'Estude um texto sagrado',
      'Beba chá de quebra-pedra',
      'Acenda vela dourada para Xangô',
      'Recite orações de justiça',
      'Ofereça amalá com folhas de fumo',
    ],
  },
  {
    id: 'quinta',
    name: 'Ritual de Fartura e Expansão',
    day: 'Quinta-feira',
    time: 'Tarde',
    element: 'Água',
    description: 'Dia de Oxóssi para fartura, conhecimento e cura.',
    steps: [
      'Visitee a natureza ou um jardim',
      'Banho de samambaia e eucalipto',
      'Ofereça seis tipos de frutas',
      'Recite mantras de prosperidade',
      'Acenda vela verde',
    ],
  },
  {
    id: 'sexta',
    name: 'Ritual de Paz e Purificação',
    day: 'Sexta-feira',
    time: 'Entardecer',
    element: 'Éter',
    description: 'Dia de Oxalá para paz absoluta e conexão com o Divino.',
    steps: [
      'Vista roupas brancas',
      'Banho de boldo no Ori (cabeça)',
      'Acenda múltiplas velas brancas',
      'Pratique o silêncio interior',
      'Ofereça canjica branca e algodão',
    ],
  },
  {
    id: 'sabado',
    name: 'Ritual de Amor e Magnetismo',
    day: 'Sábado',
    time: 'Noite',
    element: 'Água',
    description: 'Dia de Oxum/Iemanjá para amor incondicional e fertilidade.',
    steps: [
      'Banho de mel e rosas',
      'Unte-se com perfumes de Oxum',
      'Ofereça doces e frutas na água',
      'Dança sagrada de Oxum',
      'Acenda vela rosa',
    ],
  },
  {
    id: 'domingo',
    name: 'Ritual de Vitalidade e Propósito',
    day: 'Domingo',
    time: 'Meio-dia',
    element: 'Fogo',
    description: 'Dia de Xangô (vibração solar) para brilho pessoal e vitalidade.',
    steps: [
      'Exponha-se ao sol com intenção',
      'Coma alimentos amarelos',
      'Acenda lamparina de azeite',
      'Visualize seu propósito claro',
      'Agradeça pela vida',
    ],
  },
];

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname;
  const query = url.searchParams.get('type');

  // Root endpoint - return API info
  if (path === '/api/garden') {
    if (query === 'seeds') {
      return NextResponse.json({
        seeds: GARDEN_SEEDS,
        total: GARDEN_SEEDS.length,
      });
    }

    if (query === 'rituals') {
      return NextResponse.json({
        rituals: RITUAL_PRACTICES,
        total: RITUAL_PRACTICES.length,
      });
    }

    return NextResponse.json({
      name: 'Jardim Espiritual',
      description: 'API para cultivo da consciência através de práticas espirituais',
      endpoints: [
        'GET /api/garden - Informações da API',
        'GET /api/garden?type=seeds - Sementes espirituais para plantar',
        'GET /api/garden?type=rituals - Práticas rituais por dia da semana',
        'GET /api/garden/seeds - Lista completa de sementes',
        'GET /api/garden/rituals - Lista completa de rituais',
        'GET /api/garden/seeds/:id - Detalhes de uma semente específica',
        'GET /api/garden/rituals/:day - Ritual do dia atual',
      ],
      seedsCount: GARDEN_SEEDS.length,
      ritualsCount: RITUAL_PRACTICES.length,
    });
  }

  // Seeds endpoint
  if (path === '/api/garden/seeds') {
    const seedId = url.searchParams.get('id');
    if (seedId) {
      const seed = GARDEN_SEEDS.find((s) => s.id === seedId);
      if (!seed) {
        return NextResponse.json(
          { error: 'Seed not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ seed });
    }
    return NextResponse.json({
      seeds: GARDEN_SEEDS,
      total: GARDEN_SEEDS.length,
    });
  }

  // Rituals endpoint
  if (path === '/api/garden/rituals') {
    const day = url.searchParams.get('day');
    if (day) {
      const ritual = RITUAL_PRACTICES.find(
        (r) => r.day.toLowerCase() === day.toLowerCase()
      );
      if (!ritual) {
        return NextResponse.json(
          { error: 'Ritual not found for this day' },
          { status: 404 }
        );
      }
      return NextResponse.json({ ritual });
    }
    return NextResponse.json({
      rituals: RITUAL_PRACTICES,
      total: RITUAL_PRACTICES.length,
    });
  }

  return NextResponse.json(
    { error: 'Endpoint not found' },
    { status: 404 }
  );
}