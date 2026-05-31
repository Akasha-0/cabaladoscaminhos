import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);
const OrixaSchema = z.enum([
  'Oxum', 'Iemanjá', 'Ogum', 'Xangô', 'Iansã',
  'Oxumar', 'Nanã', 'Obá', 'Logunede', 'Oxóssi',
  'Eshu', 'Omolu', 'Ibeji', 'Aruanda', 'Oxalá',
]);

const GardenTypeSchema = z.enum(['seeds', 'rituals', 'all']);
const GardenQuerySchema = z.object({
  type: GardenTypeSchema.optional(),
  id: z.string().optional(),
  day: z.string().optional(),
  element: ElementSchema.optional(),
  chakra: ChakraSchema.optional(),
  sefirot: SefirotSchema.optional(),
  orixa: OrixaSchema.optional(),
});

// ─── Spiritual Correlations Data ──────────────────────────────────────────
interface GardenSeed {
  id: string;
  name: string;
  element: string;
  chakra: string;
  orixa: string;
  sefirot: string;
  practice: string;
  spiritualCorrelations?: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}

interface RitualPractice {
  id: string;
  name: string;
  day: string;
  time: string;
  element: string;
  description: string;
  steps: string[];
  spiritualCorrelations?: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
  };
}

// ─── Seed Garden Data ──────────────────────────────────────────────────────────
const SEED_GARDEN: GardenSeed[] = [
  {
    id: 'alegria',
    name: 'Semente da Alegria',
    element: 'Fogo',
    chakra: '4º Cardíaco',
    orixa: 'Oxum',
    sefirot: 'Tipheret',
    practice: 'Cultivar a alegria interna através de cantos, danças e oferendas de mel.',
    spiritualCorrelations: { sefirot: ['Tipheret'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'A alegria floresce em meu coração', frequency: '528 Hz' },
  },
  {
    id: 'sabedoria',
    name: 'Semente da Sabedoria',
    element: 'Ar',
    chakra: '6º Frontal',
    orixa: 'Oxóssi',
    sefirot: 'Chokhmah',
    practice: 'Buscar conhecimento nas matas, estudar e oferecer frutas aos Orixás.',
    spiritualCorrelations: { sefirot: ['Chokhmah', 'Netzach'], chakra: 6, element: 'Ar', orixa: 'Oxóssi', affirmation: 'A sabedoria me guia na trilha', frequency: '741 Hz' },
  },
  {
    id: 'forca',
    name: 'Semente da Força',
    element: 'Fogo',
    chakra: '2º Sacro',
    orixa: 'Iansã',
    sefirot: 'Gevurah',
    practice: 'Realizar movimentos de coragem, quebrar demandas e ativar o sangue.',
    spiritualCorrelations: { sefirot: ['Gevurah', 'Hod'], chakra: 3, element: 'Fogo', orixa: 'Iansã', affirmation: 'A força do fogo protege minha jornada', frequency: '396 Hz' },
  },
  {
    id: 'paz',
    name: 'Semente da Paz',
    element: 'Éter',
    chakra: '7º Coronário',
    orixa: 'Oxalá',
    sefirot: 'Kether',
    practice: 'Vestir-se de branco, manter o silêncio e acender velas brancas.',
    spiritualCorrelations: { sefirot: ['Kether', 'Binah'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'A paz eterna habita em mim', frequency: '963 Hz' },
  },
  {
    id: 'transcendência',
    name: 'Semente da Transcendência',
    element: 'Água',
    chakra: '6º Frontal',
    orixa: 'Iemanjá',
    sefirot: 'Binah',
    practice: 'Mergulhar nas águas sagradas, recitar mantras e buscar a serenidade.',
    spiritualCorrelations: { sefirot: ['Binah', 'Yesod'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'As águas me conduzem à transcendência', frequency: '639 Hz' },
  },
  {
    id: 'protecao',
    name: 'Semente da Proteção',
    element: 'Terra',
    chakra: '1º Raiz',
    orixa: 'Ogum',
    sefirot: 'Malkuth',
    practice: 'Carregar ferramentas de Ogum, limpar o espaço e fazer defumações.',
    spiritualCorrelations: { sefirot: ['Malkuth', 'Yesod'], chakra: 1, element: 'Terra', orixa: 'Ogum', affirmation: 'Ogum protege meu caminho', frequency: '174 Hz' },
  },
  {
    id: 'abundancia',
    name: 'Semente da Abundância',
    element: 'Terra',
    chakra: '2º Sacro',
    orixa: 'Oxum',
    sefirot: 'Chesed',
    practice: 'Ofertar moedas de ouro, banhar-se com folhas de oxum e agradecer.',
    spiritualCorrelations: { sefirot: ['Chesed', 'Malkuth'], chakra: 2, element: 'Terra', orixa: 'Oxum', affirmation: 'A abundância flui em minha vida', frequency: '285 Hz' },
  },
  {
    id: 'conhecimento',
    name: 'Semente do Conhecimento',
    element: 'Ar',
    chakra: '5º Laríngeo',
    orixa: 'Orunmilá',
    sefirot: 'Hod',
    practice: 'Consultar Ifá, ler textos sagrados e memorizar preces.',
    spiritualCorrelations: { sefirot: ['Hod', 'Netzach'], chakra: 5, element: 'Ar', orixa: 'Orunmilá', affirmation: 'O conhecimento illumina minha mente', frequency: '852 Hz' },
  },
  {
    id: 'transformacao',
    name: 'Semente da Transformação',
    element: 'Fogo',
    chakra: '3º Plexo Solar',
    orixa: 'Xangô',
    sefirot: 'Gevurah',
    practice: 'Queimar o passado, realizar rituais de fogo e pedir clareza.',
    spiritualCorrelations: { sefirot: ['Gevurah', 'Tipheret'], chakra: 3, element: 'Fogo', orixa: 'Xangô', affirmation: 'A transformação me fortalece', frequency: '417 Hz' },
  },
  {
    id: 'ancestralidade',
    name: 'Semente da Ancestralidade',
    element: 'Água',
    chakra: '2º Sacro',
    orixa: 'Nanã',
    sefirot: 'Yesod',
    practice: 'Homenagear os ancestrais, Offerir água e flores de oxum.',
    spiritualCorrelations: { sefirot: ['Yesod', 'Malkuth'], chakra: 2, element: 'Água', orixa: 'Nanã', affirmation: 'Meus ancestrais me sustentam', frequency: '285 Hz' },
  },
];

// ─── Ritual Practices Data ──────────────────────────────────────────────────────────
const RITUAL_PRACTICES: RitualPractice[] = [
  {
    id: 'dawn-light',
    name: 'Luz do Amanhecer',
    day: 'domingo',
    time: '05:00',
    element: 'Fogo',
    description: 'Receber a luz solar com gratitude e visualization.',
    steps: ['Abrir as janelas', 'Visualizar a luz dourada', 'Recitar oração de Oxalá'],
    spiritualCorrelations: { sefirot: ['Kether', 'Tipheret'], chakra: 4, element: 'Fogo', orixa: 'Oxalá', affirmation: 'A luz do sol me renova' },
  },
  {
    id: 'water-offering',
    name: 'Oferenda de Água',
    day: 'segunda',
    time: '18:00',
    element: 'Água',
    description: 'Ofertar água pura a Iemanjá com flores e velas azuis.',
    steps: ['Preparar vaso azul', 'Colocar flores brancas', 'Acender vela azul', 'Recitar oração'],
    spiritualCorrelations: { sefirot: ['Binah', 'Yesod'], chakra: 2, element: 'Água', orixa: 'Iemanjá', affirmation: 'As águas purificam minha essência' },
  },
  {
    id: 'iron-ritual',
    name: 'Ritual do Ferro',
    day: 'terca',
    time: '15:00',
    element: 'Terra',
    description: 'Limpar ferramentas de Ogum e energizar com reza.',
    steps: ['Limpar faca/espada', 'Passar pelo fumo', 'Rezar oração de Ogum', 'Guardar em lugar limpo'],
    spiritualCorrelations: { sefirot: ['Malkuth', 'Gevurah'], chakra: 1, element: 'Terra', orixa: 'Ogum', affirmation: 'Ogum fortalece minha proteção' },
  },
  {
    id: 'fire-ceremony',
    name: 'Cerimônia do Fogo',
    day: 'quarta',
    time: '19:00',
    element: 'Fogo',
    description: 'Queimar demandas e ativar a energia de Xangô.',
    steps: ['Escrever demanda', 'Acender fogueira', 'Jogar demanda no fogo', 'Recitar oração de Xangô'],
    spiritualCorrelations: { sefirot: ['Gevurah', 'Tipheret'], chakra: 3, element: 'Fogo', orixa: 'Xangô', affirmation: 'O fogo transforma minha realidade' },
  },
  {
    id: 'oxum-river',
    name: 'Ritual de Oxum',
    day: 'quinta',
    time: '10:00',
    element: 'Água',
    description: 'Banhar-se em rio ou represa com oferendas a Oxum.',
    steps: ['Ir ao rio', 'Oferecer mel e moedas', 'Banhar-se cantando', 'Agradeçar a Oxum'],
    spiritualCorrelations: { sefirot: ['Tipheret', 'Chesed'], chakra: 4, element: 'Água', orixa: 'Oxum', affirmation: 'Oxum adorna meu caminho com beleza' },
  },
  {
    id: 'oxossi-hunt',
    name: 'Caça Espiritual',
    day: 'sexta',
    time: '06:00',
    element: 'Ar',
    description: 'Caminhar na mata buscando conhecimento e caça.',
    steps: ['Ir à mata cedo', 'Recitar oração de Oxóssi', 'Observar sinais', 'Agradeçer por presas'],
    spiritualCorrelations: { sefirot: ['Chokhmah', 'Netzach'], chakra: 6, element: 'Ar', orixa: 'Oxóssi', affirmation: 'Oxóssi me guia na trilha da sabedoria' },
  },
  {
    id: 'iansan-battle',
    name: 'Batalha de Iansã',
    day: 'sabado',
    time: '12:00',
    element: 'Fogo',
    description: 'Enfrentar medos e quebrar demandas com Iansã.',
    steps: ['Identificar medo', 'Escrever em papel', 'Queimar com fogo', 'Recitar oração de Iansã'],
    spiritualCorrelations: { sefirot: ['Gevurah', 'Hod'], chakra: 3, element: 'Fogo', orixa: 'Iansã', affirmation: 'Iansã me dá coragem para vencer' },
  },
  {
    id: 'orunmila-wisdom',
    name: 'Sabedoria de Orunmilá',
    day: 'quinta',
    time: '07:00',
    element: 'Ar',
    description: 'Consultar Ifá e buscar orientação espiritual.',
    steps: ['Preparar ekodidá', 'Jogar opón Ifá', 'Interpretar Signos', 'Seguir orientação'],
    spiritualCorrelations: { sefirot: ['Hod', 'Chokhmah'], chakra: 5, element: 'Ar', orixa: 'Orunmilá', affirmation: 'Orunmilá revela minha verdade' },
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = GardenQuerySchema.safeParse({
      type: searchParams.get('type'),
      id: searchParams.get('id'),
      day: searchParams.get('day'),
      element: searchParams.get('element'),
      chakra: searchParams.get('chakra'),
      sefirot: searchParams.get('sefirot'),
      orixa: searchParams.get('orixa'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { type, id, day, element, chakra, sefirot, orixa } = parseResult.data;

    switch (type) {
      case 'seeds': {
        let seeds = [...SEED_GARDEN];
        
        if (id) {
          seeds = seeds.filter(s => s.id === id);
        }
        if (element) {
          seeds = seeds.filter(s => s.element === element);
        }
        if (chakra) {
          seeds = seeds.filter(s => {
            const ch = parseInt(s.chakra.replace('º ', '').replace('º', '').match(/\d/)?.toString() || '0');
            return ch === chakra;
          });
        }
        if (sefirot) {
          seeds = seeds.filter(s => s.spiritualCorrelations?.sefirot.includes(sefirot));
        }
        if (orixa) {
          seeds = seeds.filter(s => s.spiritualCorrelations?.orixa === orixa);
        }

        return NextResponse.json({
          success: true,
          seeds,
          count: seeds.length,
        });
      }

      case 'rituals': {
        let rituals = [...RITUAL_PRACTICES];
        
        if (id) {
          rituals = rituals.filter(r => r.id === id);
        }
        if (day) {
          rituals = rituals.filter(r => r.day === day);
        }
        if (element) {
          rituals = rituals.filter(r => r.element === element);
        }
        if (sefirot) {
          rituals = rituals.filter(r => r.spiritualCorrelations?.sefirot.includes(sefirot));
        }
        if (orixa) {
          rituals = rituals.filter(r => r.spiritualCorrelations?.orixa === orixa);
        }

        return NextResponse.json({
          success: true,
          rituals,
          count: rituals.length,
        });
      }

      case 'all':
      default: {
        return NextResponse.json({
          success: true,
          seeds: SEED_GARDEN,
          rituals: RITUAL_PRACTICES,
          stats: {
            byElement: {
              Fogo: SEED_GARDEN.filter(s => s.element === 'Fogo').length,
              Água: SEED_GARDEN.filter(s => s.element === 'Água').length,
              Terra: SEED_GARDEN.filter(s => s.element === 'Terra').length,
              Ar: SEED_GARDEN.filter(s => s.element === 'Ar').length,
              Éter: SEED_GARDEN.filter(s => s.element === 'Éter').length,
            },
            byOrixa: SEED_GARDEN.reduce((acc, s) => {
              acc[s.orixa] = (acc[s.orixa] || 0) + 1;
              return acc;
            }, {} as Record<string, number>),
            bySefirot: SEED_GARDEN.reduce((acc, s) => {
              acc[s.sefirot] = (acc[s.sefirot] || 0) + 1;
              return acc;
            }, {} as Record<string, number>),
          },
        });
      }
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}

// POST handler for adding custom seeds
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, element, chakra, orixa, sefirot, practice } = body;

    if (!id || !name) {
      return NextResponse.json({ success: false, error: 'ID e nome requeridos' }, { status: 400 });
    }

    const newSeed: GardenSeed = {
      id,
      name,
      element: element || 'Terra',
      chakra: chakra || '1º Raiz',
      orixa: orixa || 'Ogum',
      sefirot: sefirot || 'Malkuth',
      practice: practice || 'Prática espiritual',
      spiritualCorrelations: {
        sefirot: [sefirot || 'Malkuth'],
        chakra: 1,
        element: element || 'Terra',
        orixa: orixa || 'Ogum',
        affirmation: `Planto a semente de ${name} em meu jardim espiritual`,
        frequency: '432 Hz',
      },
    };

    return NextResponse.json({
      success: true,
      seed: newSeed,
      message: 'Semente plantada com sucesso',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 });
  }
}