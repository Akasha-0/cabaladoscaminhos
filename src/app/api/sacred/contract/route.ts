// ============================================================
// SACRED CONTRACT API - CABALA DOS CAMINHOS
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

const SacredContractQuerySchema = z.object({
  id: z.string().optional(),
  type: z.enum(['union', 'service', 'healing', 'elemental', 'ascension', 'all']).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

// ─── Spiritual Correlations for Sacred Contracts ──────────────────────────────────────────
const CONTRACT_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  union: {
    sefirot: ['Tipheret', 'Yesod', 'Malkuth'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Estou unido ao meu parceiro sagrado no amor e propósito divino',
    frequency: '528 Hz',
  },
  service: {
    sefirot: ['Chesed', 'Gevurah', 'Tipheret'],
    chakra: 5,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'Sou um vaso de luz divina servindo o maior bem de todos',
    frequency: '528 Hz',
  },
  healing: {
    sefirot: ['Netzach', 'Hod', 'Yesod'],
    chakra: 3,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'Todas as partes fragmentadas da minha alma retornam à integridade agora',
    frequency: '417 Hz',
  },
  elemental: {
    sefirot: ['Malkuth', 'Yesod'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Nanã',
    affirmation: 'Estou em relação sagrada com todas as forças elementais',
    frequency: '396 Hz',
  },
  ascension: {
    sefirot: ['Kether', 'Chokhmah', 'Binah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Ascendo com graça e facilidade para dimensões mais altas do ser',
    frequency: '963 Hz',
  },
};

interface Contract {
  id: string;
  name: string;
  description: string;
  type: string;
  sefirot: string[];
  chakra: number[];
  element: string;
  elementPt: string;
  intention: string;
  practice: string;
  frequency: string;
  affirmation: string;
  sefirotCorr: string[];
  elementCorr: string;
  orixa: string;
  spiritualCorrelations: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}

const CONTRACTS: Contract[] = [
  {
    id: 'sacred-union',
    name: 'Sacred Union Contract',
    description: 'A covenant of divine partnership and soul fusion between two beings committed to mutual spiritual evolution.',
    type: 'union',
    sefirot: ['Tipheret', 'Yesod', 'Malkuth'],
    chakra: [4, 5, 6],
    element: 'Air',
    elementPt: 'Ar',
    intention: 'Deep connection, unconditional love, shared spiritual path',
    practice: 'Joint meditation, heart-centered prayer, covenant ceremonies',
    frequency: 'Daily practice, weekly communion',
    affirmation: 'I am united with my sacred partner in divine love and purpose',
    sefirotCorr: CONTRACT_SPIRITUAL_CORRELATIONS.union.sefirot,
    elementCorr: CONTRACT_SPIRITUAL_CORRELATIONS.union.element,
    orixa: CONTRACT_SPIRITUAL_CORRELATIONS.union.orixa,
    spiritualCorrelations: CONTRACT_SPIRITUAL_CORRELATIONS.union,
  },
  {
    id: 'light-worker',
    name: 'Light Worker Contract',
    description: 'An agreement with the divine to embody light and serve humanity through healing, teaching, and transformation.',
    type: 'service',
    sefirot: ['Chesed', 'Gevurah', 'Tipheret'],
    chakra: [3, 4, 5, 6, 7],
    element: 'Fire',
    elementPt: 'Fogo',
    intention: 'Divine service, healing ministry, light embodiment',
    practice: 'Light meditation, healing sessions, prayer warriors practice',
    frequency: 'Continuous awareness, dedicated service hours',
    affirmation: 'I am a vessel of divine light serving the highest good of all',
    sefirotCorr: CONTRACT_SPIRITUAL_CORRELATIONS.service.sefirot,
    elementCorr: CONTRACT_SPIRITUAL_CORRELATIONS.service.element,
    orixa: CONTRACT_SPIRITUAL_CORRELATIONS.service.orixa,
    spiritualCorrelations: CONTRACT_SPIRITUAL_CORRELATIONS.service,
  },
  {
    id: 'soul-retrieval',
    name: 'Soul Retrieval Contract',
    description: 'A sacred pact for recovering fragmented soul aspects lost through trauma or life experiences.',
    type: 'healing',
    sefirot: ['Netzach', 'Hod', 'Yesod'],
    chakra: [1, 2, 3],
    element: 'Water',
    elementPt: 'Água',
    intention: 'Soul integration, wholeness restoration, trauma healing',
    practice: 'Shamanic journeying, inner child work, energy healing',
    frequency: 'As needed, intensive healing periods',
    affirmation: 'All fragmented parts of my soul return to wholeness now',
    sefirotCorr: CONTRACT_SPIRITUAL_CORRELATIONS.healing.sefirot,
    elementCorr: CONTRACT_SPIRITUAL_CORRELATIONS.healing.element,
    orixa: CONTRACT_SPIRITUAL_CORRELATIONS.healing.orixa,
    spiritualCorrelations: CONTRACT_SPIRITUAL_CORRELATIONS.healing,
  },
  {
    id: 'elemental-pact',
    name: 'Elemental Pact',
    description: 'A covenant with the elemental forces of nature for magical workings and spiritual protection.',
    type: 'elemental',
    sefirot: ['Malkuth', 'Yesod'],
    chakra: [1, 2],
    element: 'Earth',
    elementPt: 'Terra',
    intention: 'Nature connection, elemental mastery, magical protection',
    practice: 'Ritual offerings, nature meditation, elemental invocations',
    frequency: 'Seasonal celebrations, daily elemental attunement',
    affirmation: 'I am in sacred relationship with all elemental forces',
    sefirotCorr: CONTRACT_SPIRITUAL_CORRELATIONS.elemental.sefirot,
    elementCorr: CONTRACT_SPIRITUAL_CORRELATIONS.elemental.element,
    orixa: CONTRACT_SPIRITUAL_CORRELATIONS.elemental.orixa,
    spiritualCorrelations: CONTRACT_SPIRITUAL_CORRELATIONS.elemental,
  },
  {
    id: 'ascension-covenant',
    name: 'Ascension Covenant',
    description: 'A commitment to raise vibrational frequency and ascend through the dimensions of consciousness.',
    type: 'ascension',
    sefirot: ['Kether', 'Chokhmah', 'Binah'],
    chakra: [6, 7],
    element: 'Ether',
    elementPt: 'Éter',
    intention: 'Energetic ascension, consciousness expansion, dimension hopping',
    practice: 'High vibration meditation, light language, energy attunements',
    frequency: 'Continuous practice, ascension initiations',
    affirmation: 'I ascend with grace and ease into higher dimensions of being',
    sefirotCorr: CONTRACT_SPIRITUAL_CORRELATIONS.ascension.sefirot,
    elementCorr: CONTRACT_SPIRITUAL_CORRELATIONS.ascension.element,
    orixa: CONTRACT_SPIRITUAL_CORRELATIONS.ascension.orixa,
    spiritualCorrelations: CONTRACT_SPIRITUAL_CORRELATIONS.ascension,
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = SacredContractQuerySchema.safeParse({
    id: searchParams.get('id'),
    type: searchParams.get('type'),
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

  const { id, type, sefirot, chakra, element, orixa } = parseResult.data;
  let contracts = [...CONTRACTS];

  if (id) {
    contracts = contracts.filter(c => c.id === id);
  }

  if (type && type !== 'all') {
    contracts = contracts.filter(c => c.type === type);
  }

  if (sefirot) {
    contracts = contracts.filter(c => c.spiritualCorrelations.sefirot.includes(sefirot));
  }

  if (chakra) {
    contracts = contracts.filter(c => c.spiritualCorrelations.chakra === chakra);
  }

  if (element) {
    contracts = contracts.filter(c => c.spiritualCorrelations.element === element);
  }

  if (orixa) {
    contracts = contracts.filter(c => c.spiritualCorrelations.orixa === orixa);
  }

  // Calculate spiritual stats
  const spiritualStats = {
    byType: contracts.reduce((acc, c) => {
      acc[c.type] = (acc[c.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    bySefirot: contracts.reduce((acc, c) => {
      c.spiritualCorrelations.sefirot.forEach(s => {
        acc[s] = (acc[s] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>),
    byChakra: contracts.reduce((acc, c) => {
      const ch = c.spiritualCorrelations.chakra;
      if (ch) acc[ch] = (acc[ch] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byElement: contracts.reduce((acc, c) => {
      const e = c.spiritualCorrelations.element;
      if (e) acc[e] = (acc[e] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byOrixa: contracts.reduce((acc, c) => {
      const o = c.spiritualCorrelations.orixa;
      if (o) acc[o] = (acc[o] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return NextResponse.json({
    success: true,
    contracts,
    count: contracts.length,
    spiritualCorrelations: CONTRACT_SPIRITUAL_CORRELATIONS,
    spiritualStats,
    meta: {
      filters: { id, type, sefirot, chakra, element, orixa },
    },
  });
}