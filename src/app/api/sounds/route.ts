import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const SoundActionSchema = z.enum(['list', 'sound', 'frequency', 'ritual', 'rituals', 'all']);
const SoundsQuerySchema = z.object({
  action: SoundActionSchema.optional(),
  id: z.string().optional(),
  frequency: z.coerce.number().int().min(1).max(9999).optional(),
  category: z.string().optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

// ─── Sacred Sounds Spiritual Data ──────────────────────────────────────────
const SACRED_SOUNDS = {
  om: {
    id: 'om',
    name: 'Om (Aum)',
    frequency: '432 Hz',
    origin: 'Hindu/Buddhist',
    description: 'O som primordial do universo, símbolo da essência divina',
    chakra: 'Anahata',
    usage: 'Meditação, oração, alinhamento espiritual',
    benefits: ['Expansão de consciência', 'Harmonização celular', 'Paz interior'],
    spiritualCorrelations: {
      sefirot: ['Kether', 'Chokhmah'],
      chakra: 4,
      element: 'Ar',
      orixa: 'Oxalá',
      affirmation: 'Eu sou um com o som primordial do universo',
    },
  },
  amen: {
    id: 'amen',
    name: 'Amen',
    frequency: '528 Hz',
    origin: 'Hebrew/Catholic',
    description: 'Som de encerramento sagrado, significa verdade e fidelidade',
    chakra: 'Sahasrara',
    usage: 'Bênçãos, confirmações, proteção',
    benefits: ['Transformação energética', 'Ativação DNA', 'Manifestação'],
    spiritualCorrelations: {
      sefirot: ['Kether', 'Tipheret'],
      chakra: 7,
      element: 'Éter',
      orixa: 'Oxalá',
      affirmation: 'A verdade divina habita em mim',
    },
  },
  shalom: {
    id: 'shalom',
    name: 'Shalom',
    frequency: '396 Hz',
    origin: 'Hebrew',
    description: 'Saudação de paz e completude divina',
    chakra: 'Ajna',
    usage: 'Harmonização, reconciliação, cura',
    benefits: ['Liberação de medos', 'Harmonia familiar', 'Perdão'],
    spiritualCorrelations: {
      sefirot: ['Netzach', 'Hod'],
      chakra: 6,
      element: 'Água',
      orixa: 'Iemanjá',
      affirmation: 'A paz divina flui através de mim',
    },
  },
  om_mani_padme: {
    id: 'om_mani_padme',
    name: 'Om Mani Padme Hum',
    frequency: '432 Hz',
    origin: 'Tibetan Buddhist',
    description: 'Mantra da compaixão infinita de Avalokiteshvara',
    chakra: 'Anahata',
    usage: 'Compaixão, sabedoria, proteção',
    benefits: ['Desperta empatia', 'Purifica mente', 'Abre coração'],
    spiritualCorrelations: {
      sefirot: ['Chesed', 'Tipheret'],
      chakra: 4,
      element: 'Fogo',
      orixa: 'Oxum',
      affirmation: 'A compaixão infinita me transforma',
    },
  },
  amen_ra: {
    id: 'amen_ra',
    name: 'Amen-Ra',
    frequency: '417 Hz',
    origin: 'Egyptian',
    description: 'Sons do Deus Sol, frequências dos faraós para renascimento',
    chakra: 'Manipura',
    usage: 'Renascimento espiritual, poder pessoal',
    benefits: ['Desperta poder interior', 'Alinha com propósito', 'Fortalece vontade'],
    spiritualCorrelations: {
      sefirot: ['Gevurah', 'Hod'],
      chakra: 3,
      element: 'Fogo',
      orixa: 'Xangô',
      affirmation: 'O poder do sol ilumina minha jornada',
    },
  },
  karakia: {
    id: 'karakia',
    name: 'Karakia',
    frequency: '528 Hz',
    origin: 'Māori',
    description: 'Orações ancestrais maoris para proteção e bênção',
    chakra: 'Muladhara',
    usage: 'Proteção, bênção, conexão ancestral',
    benefits: ['Ancestralidade', 'Força', 'Proteção'],
    spiritualCorrelations: {
      sefirot: ['Gevurah', 'Malkuth'],
      chakra: 1,
      element: 'Terra',
      orixa: 'Ogum',
      affirmation: 'Meus ancestrais me protegem e guiam',
    },
  },
  orixa: {
    id: 'orixa',
    name: 'Sons dos Orixás',
    frequency: '396-528 Hz',
    origin: 'Yoruba/Afro-Brazilian',
    description: 'Frequências sagradas dos orixás: Oxalá, Iemanjá, Ogum, Xangô',
    chakra: 'Vários conforme orixá',
    usage: 'Rituais de candomblé, ofertas, bênçãos',
    benefits: ['Conexão orixás', 'Ancestralidade africana', 'Cura coletiva'],
    spiritualCorrelations: {
      sefirot: ['Tipheret', 'Chesed', 'Gevurah'],
      chakra: 4,
      element: 'Fogo',
      orixa: 'Ogum',
      affirmation: 'Os Orixás ecoam em minha alma',
    },
  },
} as const;

// ─── Rituals Data ──────────────────────────────────────────────────────────
const RITUALS = [
  {
    id: 'morning-sound',
    name: 'Morning Invocation',
    sounds: ['om', 'shalom'],
    duration: '5 min',
    purpose: 'Start the day with sacred frequencies',
    spiritualCorrelations: {
      sefirot: ['Chokhmah'],
      chakra: 6,
      element: 'Ar',
      orixa: 'Oxalá',
      affirmation: 'Recebo a luz do novo dia com gratidão',
    },
  },
  {
    id: 'balance-ritual',
    name: 'Chakra Balance',
    sounds: ['om_mani_padme', 'amen'],
    duration: '15 min',
    purpose: 'Align all chakras with sacred sounds',
    spiritualCorrelations: {
      sefirot: ['Kether', 'Malkuth'],
      chakra: 7,
      element: 'Éter',
      orixa: 'Oxalá',
      affirmation: 'Meus chakras ressoam em harmonia perfeita',
    },
  },
  {
    id: 'protection-ritual',
    name: 'Ancestral Protection',
    sounds: ['karakia', 'orixa'],
    duration: '10 min',
    purpose: 'Invoke ancestral protection and wisdom',
    spiritualCorrelations: {
      sefirot: ['Gevurah', 'Malkuth'],
      chakra: 1,
      element: 'Terra',
      orixa: 'Ogum',
      affirmation: 'Meus ancestrais me cercam de proteção divina',
    },
  },
  {
    id: 'transformation-ritual',
    name: 'Light Activation',
    sounds: ['amen_ra', 'amen'],
    duration: '12 min',
    purpose: 'Activate light frequencies for transformation',
    spiritualCorrelations: {
      sefirot: ['Gevurah', 'Tipheret'],
      chakra: 3,
      element: 'Fogo',
      orixa: 'Xangô',
      affirmation: 'A luz transforma minha essência',
    },
  },
  {
    id: 'healing-ritual',
    name: 'Collective Healing',
    sounds: ['shalom', 'om_mani_padme'],
    duration: '20 min',
    purpose: 'Healing through collective sound frequencies',
    spiritualCorrelations: {
      sefirot: ['Netzach', 'Chesed'],
      chakra: 4,
      element: 'Água',
      orixa: 'Iemanjá',
      affirmation: 'A cura flui através de mim para todos',
    },
  },
  {
    id: 'african-roots',
    name: 'Ancestral Roots',
    sounds: ['orixa', 'karakia'],
    duration: '15 min',
    purpose: 'Connect with African ancestral wisdom',
    spiritualCorrelations: {
      sefirot: ['Yesod', 'Malkuth'],
      chakra: 2,
      element: 'Água',
      orixa: 'Iemanjá',
      affirmation: 'Honro minhas raízes africanas com respeito',
    },
  },
  {
    id: 'solar-activation',
    name: 'Solar Activation',
    sounds: ['amen_ra', 'om'],
    duration: '10 min',
    purpose: 'Activate solar frequencies for empowerment',
    spiritualCorrelations: {
      sefirot: ['Hod', 'Gevurah'],
      chakra: 3,
      element: 'Fogo',
      orixa: 'Xangô',
      affirmation: 'O sol fortalece minha vontade e propósito',
    },
  },
  {
    id: 'meditation-sound',
    name: 'Deep Meditation',
    sounds: ['om', 'om_mani_padme', 'amen'],
    duration: '30 min',
    purpose: 'Deep meditation with layered sacred sounds',
    spiritualCorrelations: {
      sefirot: ['Kether', 'Chokhmah', 'Binah'],
      chakra: 7,
      element: 'Éter',
      orixa: 'Oxalá',
      affirmation: 'Mergulho na paz infinita do ser',
    },
  },
];

// ─── Frequency Mapping ──────────────────────────────────────────────────────────
const FREQUENCY_MAPPINGS = [
  { hz: 174, name: 'Frequência da Terra', chakra: 1, element: 'Terra', orixa: 'Ogum', sefirot: ['Malkuth'], sound: 'karakia' },
  { hz: 285, name: 'Frequência da Estrutura', chakra: 2, element: 'Água', orixa: 'Iemanjá', sefirot: ['Yesod'], sound: 'shalom' },
  { hz: 396, name: 'Frequência da Libertação', chakra: 3, element: 'Fogo', orixa: 'Xangô', sefirot: ['Gevurah'], sound: 'shalom' },
  { hz: 417, name: 'Frequência da Mudança', chakra: 4, element: 'Fogo', orixa: 'Oxum', sefirot: ['Chesed'], sound: 'amen_ra' },
  { hz: 528, name: 'Frequência do Amor', chakra: 5, element: 'Ar', orixa: 'Oxalá', sefirot: ['Tipheret'], sound: 'amen' },
  { hz: 639, name: 'Frequência da Harmonia', chakra: 6, element: 'Água', orixa: 'Iemanjá', sefirot: ['Netzach'], sound: 'om_mani_padme' },
  { hz: 741, name: 'Frequência da Intuição', chakra: 6, element: 'Ar', orixa: 'Orunmilá', sefirot: ['Hod'], sound: 'om' },
  { hz: 852, name: 'Frequência da Claridade', chakra: 7, element: 'Ar', orixa: 'Oxalá', sefirot: ['Chokhmah'], sound: 'om' },
  { hz: 963, name: 'Frequência da Pureza', chakra: 7, element: 'Éter', orixa: 'Oxalá', sefirot: ['Kether'], sound: 'amen' },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = SoundsQuerySchema.safeParse({
      action: searchParams.get('action'),
      id: searchParams.get('id'),
      frequency: searchParams.get('frequency'),
      category: searchParams.get('category'),
      sefirot: searchParams.get('sefirot'),
      chakra: searchParams.get('chakra'),
      element: searchParams.get('element'),
      orixa: searchParams.get('orixa'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { action, id, frequency, sefirot, chakra, element, orixa } = parseResult.data;

    switch (action) {
      case 'list': {
        let sounds = Object.values(SACRED_SOUNDS);
        if (sefirot) {
          sounds = sounds.filter(s => s.spiritualCorrelations.sefirot.includes(sefirot));
        }
        if (chakra) {
          sounds = sounds.filter(s => s.spiritualCorrelations.chakra === chakra);
        }
        if (element) {
          sounds = sounds.filter(s => s.spiritualCorrelations.element === element);
        }
        if (orixa) {
          sounds = sounds.filter(s => s.spiritualCorrelations.orixa === orixa);
        }
        return NextResponse.json({ success: true, sounds, count: sounds.length });
      }

      case 'sound': {
        if (!id) {
          return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 });
        }
        const sound = SACRED_SOUNDS[id as keyof typeof SACRED_SOUNDS];
        if (!sound) {
          return NextResponse.json({ success: false, error: 'Som não encontrado' }, { status: 404 });
        }
        return NextResponse.json({ success: true, sound });
      }

      case 'frequency': {
        if (!frequency) {
          return NextResponse.json({ success: false, error: 'Frequência requerida' }, { status: 400 });
        }
        const mapping = FREQUENCY_MAPPINGS.find(m => m.hz === frequency);
        if (!mapping) {
          return NextResponse.json({ success: false, error: 'Frequência não encontrada' }, { status: 404 });
        }
        return NextResponse.json({ success: true, frequency: mapping });
      }

      case 'rituals': {
        let rituals = [...RITUALS];
        if (sefirot) {
          rituals = rituals.filter(r => r.spiritualCorrelations.sefirot.includes(sefirot));
        }
        if (chakra) {
          rituals = rituals.filter(r => r.spiritualCorrelations.chakra === chakra);
        }
        if (element) {
          rituals = rituals.filter(r => r.spiritualCorrelations.element === element);
        }
        if (orixa) {
          rituals = rituals.filter(r => r.spiritualCorrelations.orixa === orixa);
        }
        return NextResponse.json({ success: true, rituals, count: rituals.length });
      }

      case 'ritual': {
        if (!id) {
          return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 });
        }
        const ritual = RITUALS.find(r => r.id === id);
        if (!ritual) {
          return NextResponse.json({ success: false, error: 'Ritual não encontrado' }, { status: 404 });
        }
        return NextResponse.json({ success: true, ritual });
      }

      case 'all':
      default: {
        return NextResponse.json({
          success: true,
          sounds: Object.values(SACRED_SOUNDS),
          rituals: RITUALS,
          frequencies: FREQUENCY_MAPPINGS,
          stats: {
            byElement: FREQUENCY_MAPPINGS.reduce((acc, f) => {
              acc[f.element] = (acc[f.element] || 0) + 1;
              return acc;
            }, {} as Record<string, number>),
            byChakra: FREQUENCY_MAPPINGS.reduce((acc, f) => {
              acc[f.chakra] = (acc[f.chakra] || 0) + 1;
              return acc;
            }, {} as Record<number, number>),
            byOrixa: FREQUENCY_MAPPINGS.reduce((acc, f) => {
              acc[f.orixa] = (acc[f.orixa] || 0) + 1;
              return acc;
            }, {} as Record<string, number>),
            bySefirot: FREQUENCY_MAPPINGS.reduce((acc, f) => {
              f.sefirot.forEach(sf => {
                acc[sf] = (acc[sf] || 0) + 1;
              });
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