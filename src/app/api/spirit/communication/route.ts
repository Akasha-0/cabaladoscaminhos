// ============================================================
// SPIRIT COMMUNICATION API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for spirit communication
// - Communication methods and channels
// - Mediumship guidance and practices
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const SpiritCommunicationQuerySchema = z.object({
  type: z.enum(['mediumship', 'channeling', 'psychography', 'psychometry', 'divination', 'all']).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

// ─── Spiritual Correlations for Spirit Communication Methods ──────────────────────────────────────────
const METHOD_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  mediumship: {
    sefirot: ['Yesod', 'Malkuth'],
    chakra: 6,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'A ponte entre mundos se abre em mim',
    frequency: '417 Hz',
  },
  channeling: {
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Sou um canal limpo para a luz divina',
    frequency: '963 Hz',
  },
  psychography: {
    sefirot: ['Binah', 'Yesod'],
    chakra: 6,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'A escrita automática flui através de mim',
    frequency: '417 Hz',
  },
  psychometry: {
    sefirot: ['Chokhmah', 'Netzach'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Orunmilá',
    affirmation: 'Lendo a energia dos objetos e lugares',
    frequency: '639 Hz',
  },
  divination: {
    sefirot: ['Chokhmah', 'Binah'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Orunmilá',
    affirmation: 'A sabedoria divina me guia',
    frequency: '741 Hz',
  },
  trance: {
    sefirot: ['Kether', 'Yesod'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Entrego-me ao estado de trance sagrado',
    frequency: '963 Hz',
  },
};

interface CommunicationMethod {
  id: string;
  name: string;
  namePt: string;
  description: string;
  descriptionPt: string;
  practices: string[];
  level: string;
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
  spiritualCorrelations: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}

const communicationMethods: CommunicationMethod[] = [
  {
    id: 'mediumship',
    name: 'Mediumship',
    namePt: 'Mediunidade',
    description: 'Communication with spirits through various techniques',
    descriptionPt: 'Comunicação com espíritos através de várias técnicas',
    practices: [
      'channeling',
      'trance',
      'psychography',
      'psychometry',
      'clairsentience',
      'clairvoyance',
      'clairaudience',
      'automatic writing',
    ],
    level: 'advanced',
    sefirot: METHOD_SPIRITUAL_CORRELATIONS.mediumship.sefirot,
    chakra: METHOD_SPIRITUAL_CORRELATIONS.mediumship.chakra,
    element: METHOD_SPIRITUAL_CORRELATIONS.mediumship.element,
    orixa: METHOD_SPIRITUAL_CORRELATIONS.mediumship.orixa,
    affirmation: METHOD_SPIRITUAL_CORRELATIONS.mediumship.affirmation,
    frequency: METHOD_SPIRITUAL_CORRELATIONS.mediumship.frequency,
    spiritualCorrelations: METHOD_SPIRITUAL_CORRELATIONS.mediumship,
  },
  {
    id: 'channeling',
    name: 'Channeling',
    namePt: 'Canalização',
    description: 'Receiving messages from spirit guides and entities',
    descriptionPt: 'Receber mensagens de guias espirituais e entidades',
    practices: [
      'light channeling',
      'verbal channeling',
      'healing channeling',
      'teaching channeling',
    ],
    level: 'intermediate',
    sefirot: METHOD_SPIRITUAL_CORRELATIONS.channeling.sefirot,
    chakra: METHOD_SPIRITUAL_CORRELATIONS.channeling.chakra,
    element: METHOD_SPIRITUAL_CORRELATIONS.channeling.element,
    orixa: METHOD_SPIRITUAL_CORRELATIONS.channeling.orixa,
    affirmation: METHOD_SPIRITUAL_CORRELATIONS.channeling.affirmation,
    frequency: METHOD_SPIRITUAL_CORRELATIONS.channeling.frequency,
    spiritualCorrelations: METHOD_SPIRITUAL_CORRELATIONS.channeling,
  },
  {
    id: 'psychography',
    name: 'Psychography',
    namePt: 'Psicografia',
    description: 'Automatic writing for spirit communication',
    descriptionPt: 'Escrita automática para comunicação espiritual',
    practices: [
      'spirit writing',
      'mediumistic writing',
      'inspirational writing',
    ],
    level: 'intermediate',
    sefirot: METHOD_SPIRITUAL_CORRELATIONS.psychography.sefirot,
    chakra: METHOD_SPIRITUAL_CORRELATIONS.psychography.chakra,
    element: METHOD_SPIRITUAL_CORRELATIONS.psychography.element,
    orixa: METHOD_SPIRITUAL_CORRELATIONS.psychography.orixa,
    affirmation: METHOD_SPIRITUAL_CORRELATIONS.psychography.affirmation,
    frequency: METHOD_SPIRITUAL_CORRELATIONS.psychography.frequency,
    spiritualCorrelations: METHOD_SPIRITUAL_CORRELATIONS.psychography,
  },
  {
    id: 'psychometry',
    name: 'Psychometry',
    namePt: 'Psicometria',
    description: 'Reading energy from objects and places',
    descriptionPt: 'Leitura de energia de objetos e locais',
    practices: [
      'object reading',
      'place reading',
      'photoreading',
      'artifact reading',
    ],
    level: 'intermediate',
    sefirot: METHOD_SPIRITUAL_CORRELATIONS.psychometry.sefirot,
    chakra: METHOD_SPIRITUAL_CORRELATIONS.psychometry.chakra,
    element: METHOD_SPIRITUAL_CORRELATIONS.psychometry.element,
    orixa: METHOD_SPIRITUAL_CORRELATIONS.psychometry.orixa,
    affirmation: METHOD_SPIRITUAL_CORRELATIONS.psychometry.affirmation,
    frequency: METHOD_SPIRITUAL_CORRELATIONS.psychometry.frequency,
    spiritualCorrelations: METHOD_SPIRITUAL_CORRELATIONS.psychometry,
  },
  {
    id: 'divination',
    name: 'Spirit Divination',
    namePt: 'Divinação Espiritual',
    description: 'Spirit-guided divination practices',
    descriptionPt: 'Práticas de adivinhação guiada por espíritos',
    practices: [
      'spirit-guided tarot',
      'automatic divination',
      'guidance sessions',
    ],
    level: 'beginner',
    sefirot: METHOD_SPIRITUAL_CORRELATIONS.divination.sefirot,
    chakra: METHOD_SPIRITUAL_CORRELATIONS.divination.chakra,
    element: METHOD_SPIRITUAL_CORRELATIONS.divination.element,
    orixa: METHOD_SPIRITUAL_CORRELATIONS.divination.orixa,
    affirmation: METHOD_SPIRITUAL_CORRELATIONS.divination.affirmation,
    frequency: METHOD_SPIRITUAL_CORRELATIONS.divination.frequency,
    spiritualCorrelations: METHOD_SPIRITUAL_CORRELATIONS.divination,
  },
  {
    id: 'trance',
    name: 'Trance States',
    namePt: 'Estados de Transe',
    description: 'Altered states of consciousness for spirit contact',
    descriptionPt: 'Estados alterados de consciência para contato espiritual',
    practices: [
      'drumming trance',
      'chanting trance',
      'dance trance',
      'breath trance',
    ],
    level: 'advanced',
    sefirot: METHOD_SPIRITUAL_CORRELATIONS.trance.sefirot,
    chakra: METHOD_SPIRITUAL_CORRELATIONS.trance.chakra,
    element: METHOD_SPIRITUAL_CORRELATIONS.trance.element,
    orixa: METHOD_SPIRITUAL_CORRELATIONS.trance.orixa,
    affirmation: METHOD_SPIRITUAL_CORRELATIONS.trance.affirmation,
    frequency: METHOD_SPIRITUAL_CORRELATIONS.trance.frequency,
    spiritualCorrelations: METHOD_SPIRITUAL_CORRELATIONS.trance,
  },
];

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const parseResult = SpiritCommunicationQuerySchema.safeParse({
    type: url.searchParams.get('type'),
    level: url.searchParams.get('level'),
    sefirot: url.searchParams.get('sefirot'),
    chakra: url.searchParams.get('chakra'),
    element: url.searchParams.get('element'),
    orixa: url.searchParams.get('orixa'),
  });

  if (!parseResult.success) {
    return NextResponse.json({
      success: false,
      error: 'Parâmetros inválidos',
      details: parseResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  const { type, level, sefirot, chakra, element, orixa } = parseResult.data;
  let methods = [...communicationMethods];

  if (type && type !== 'all') {
    methods = methods.filter(m => m.id === type);
  }

  if (level) {
    methods = methods.filter(m => m.level === level);
  }

  if (sefirot) {
    methods = methods.filter(m => m.spiritualCorrelations.sefirot.includes(sefirot));
  }

  if (chakra) {
    methods = methods.filter(m => m.spiritualCorrelations.chakra === chakra);
  }

  if (element) {
    methods = methods.filter(m => m.spiritualCorrelations.element === element);
  }

  if (orixa) {
    methods = methods.filter(m => m.spiritualCorrelations.orixa === orixa);
  }

  // Calculate spiritual stats
  const spiritualStats = {
    byLevel: methods.reduce((acc, m) => {
      acc[m.level] = (acc[m.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    bySefirot: methods.reduce((acc, m) => {
      m.spiritualCorrelations.sefirot.forEach(s => {
        acc[s] = (acc[s] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>),
    byChakra: methods.reduce((acc, m) => {
      const c = m.spiritualCorrelations.chakra;
      if (c) acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byElement: methods.reduce((acc, m) => {
      const e = m.spiritualCorrelations.element;
      if (e) acc[e] = (acc[e] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byOrixa: methods.reduce((acc, m) => {
      const o = m.spiritualCorrelations.orixa;
      if (o) acc[o] = (acc[o] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return NextResponse.json({
    success: true,
    methods,
    count: methods.length,
    spiritualCorrelations: METHOD_SPIRITUAL_CORRELATIONS,
    spiritualStats,
    meta: {
      filters: { type, level, sefirot, chakra, element, orixa },
    },
  });
}