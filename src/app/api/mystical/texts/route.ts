import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const MysticalTextsQuerySchema = z.object({
  type: z.enum(['hermetic', 'thelemic', 'kabbalistic', 'vedic', 'sufi', 'zen']).optional(),
  id: z.string().optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

// ─── Spiritual Correlations for Mystical Texts ──────────────────────────────────────────
const TEXT_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  hermetic: {
    sefirot: ['Chokhmah', 'Binah'],
    chakra: 6,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Como acima, assim abaixo; como abaixo, assim acima',
    frequency: '639 Hz',
  },
  thelemic: {
    sefirot: ['Tipheret', 'Kether'],
    chakra: 7,
    element: 'Fogo',
    orixa: 'Oxalá',
    affirmation: 'Faz o que tu queres há de ser tudo',
    frequency: '528 Hz',
  },
  kabbalistic: {
    sefirot: ['Kether', 'Chokhmah', 'Binah'],
    chakra: 6,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Eu sou um canal de luz divina',
    frequency: '963 Hz',
  },
  vedic: {
    sefirot: ['Chokhmah', 'Netzach'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Orunmilá',
    affirmation: 'Tat tvam asi — Tu és Isso',
    frequency: '741 Hz',
  },
  sufi: {
    sefirot: ['Binah', 'Chesed'],
    chakra: 4,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'Aquele que conhece a si mesmo, conhece seu Senhor',
    frequency: '417 Hz',
  },
  zen: {
    sefirot: ['Kether', 'Yesod'],
    chakra: 6,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'O vazio é cheio de potencial infinito',
    frequency: '639 Hz',
  },
};

interface MysticalText {
  id: string;
  title: string;
  type: string;
  description: string;
  author?: string;
  period?: string;
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

const mysticalTexts: MysticalText[] = [
  {
    id: '1',
    title: 'Emerald Tablet',
    type: 'hermetic',
    description: 'Ancient text of Hermetic philosophy attributed to Hermes Trismegistus',
    author: 'Hermes Trismegistus',
    period: '8th-9th century CE (attributed to ancient Egypt)',
    sefirot: TEXT_SPIRITUAL_CORRELATIONS.hermetic.sefirot,
    chakra: TEXT_SPIRITUAL_CORRELATIONS.hermetic.chakra,
    element: TEXT_SPIRITUAL_CORRELATIONS.hermetic.element,
    orixa: TEXT_SPIRITUAL_CORRELATIONS.hermetic.orixa,
    affirmation: TEXT_SPIRITUAL_CORRELATIONS.hermetic.affirmation,
    frequency: TEXT_SPIRITUAL_CORRELATIONS.hermetic.frequency,
    spiritualCorrelations: TEXT_SPIRITUAL_CORRELATIONS.hermetic,
  },
  {
    id: '2',
    title: 'Book of the Law',
    type: 'thelemic',
    description: 'Sacred text of Thelema received by Aleister Crowley',
    author: 'Aleister Crowley',
    period: '1904 CE',
    sefirot: TEXT_SPIRITUAL_CORRELATIONS.thelemic.sefirot,
    chakra: TEXT_SPIRITUAL_CORRELATIONS.thelemic.chakra,
    element: TEXT_SPIRITUAL_CORRELATIONS.thelemic.element,
    orixa: TEXT_SPIRITUAL_CORRELATIONS.thelemic.orixa,
    affirmation: TEXT_SPIRITUAL_CORRELATIONS.thelemic.affirmation,
    frequency: TEXT_SPIRITUAL_CORRELATIONS.thelemic.frequency,
    spiritualCorrelations: TEXT_SPIRITUAL_CORRELATIONS.thelemic,
  },
  {
    id: '3',
    title: 'Kybalion',
    type: 'hermetic',
    description: 'Principles of Hermetic Philosophy',
    author: 'Three Initiates',
    period: '1908 CE',
    sefirot: TEXT_SPIRITUAL_CORRELATIONS.hermetic.sefirot,
    chakra: TEXT_SPIRITUAL_CORRELATIONS.hermetic.chakra,
    element: TEXT_SPIRITUAL_CORRELATIONS.hermetic.element,
    orixa: TEXT_SPIRITUAL_CORRELATIONS.hermetic.orixa,
    affirmation: TEXT_SPIRITUAL_CORRELATIONS.hermetic.affirmation,
    frequency: TEXT_SPIRITUAL_CORRELATIONS.hermetic.frequency,
    spiritualCorrelations: TEXT_SPIRITUAL_CORRELATIONS.hermetic,
  },
  {
    id: '4',
    title: 'Sepher Yetzirah',
    type: 'kabbalistic',
    description: 'Book of Formation - foundational text of Kabbalah',
    author: 'Abraham',
    period: '2nd-6th century CE',
    sefirot: TEXT_SPIRITUAL_CORRELATIONS.kabbalistic.sefirot,
    chakra: TEXT_SPIRITUAL_CORRELATIONS.kabbalistic.chakra,
    element: TEXT_SPIRITUAL_CORRELATIONS.kabbalistic.element,
    orixa: TEXT_SPIRITUAL_CORRELATIONS.kabbalistic.orixa,
    affirmation: TEXT_SPIRITUAL_CORRELATIONS.kabbalistic.affirmation,
    frequency: TEXT_SPIRITUAL_CORRELATIONS.kabbalistic.frequency,
    spiritualCorrelations: TEXT_SPIRITUAL_CORRELATIONS.kabbalistic,
  },
  {
    id: '5',
    title: 'Zohar',
    type: 'kabbalistic',
    description: 'Splendor of mystical wisdom - core text of Kabbalistic mysticism',
    author: 'Shimon bar Yochai',
    period: '2nd century CE (compiled 13th century)',
    sefirot: TEXT_SPIRITUAL_CORRELATIONS.kabbalistic.sefirot,
    chakra: TEXT_SPIRITUAL_CORRELATIONS.kabbalistic.chakra,
    element: TEXT_SPIRITUAL_CORRELATIONS.kabbalistic.element,
    orixa: TEXT_SPIRITUAL_CORRELATIONS.kabbalistic.orixa,
    affirmation: TEXT_SPIRITUAL_CORRELATIONS.kabbalistic.affirmation,
    frequency: TEXT_SPIRITUAL_CORRELATIONS.kabbalistic.frequency,
    spiritualCorrelations: TEXT_SPIRITUAL_CORRELATIONS.kabbalistic,
  },
  {
    id: '6',
    title: 'Bhagavad Gita',
    type: 'vedic',
    description: 'Sacred text of Hinduism teaching duty and devotion',
    author: 'Vyasa',
    period: '5th-2nd century BCE',
    sefirot: TEXT_SPIRITUAL_CORRELATIONS.vedic.sefirot,
    chakra: TEXT_SPIRITUAL_CORRELATIONS.vedic.chakra,
    element: TEXT_SPIRITUAL_CORRELATIONS.vedic.element,
    orixa: TEXT_SPIRITUAL_CORRELATIONS.vedic.orixa,
    affirmation: TEXT_SPIRITUAL_CORRELATIONS.vedic.affirmation,
    frequency: TEXT_SPIRITUAL_CORRELATIONS.vedic.frequency,
    spiritualCorrelations: TEXT_SPIRITUAL_CORRELATIONS.vedic,
  },
  {
    id: '7',
    title: 'Mathnawi',
    type: 'sufi',
    description: 'Spiritual couplets of Rumi - heart of Sufi mysticism',
    author: 'Rumi',
    period: '13th century CE',
    sefirot: TEXT_SPIRITUAL_CORRELATIONS.sufi.sefirot,
    chakra: TEXT_SPIRITUAL_CORRELATIONS.sufi.chakra,
    element: TEXT_SPIRITUAL_CORRELATIONS.sufi.element,
    orixa: TEXT_SPIRITUAL_CORRELATIONS.sufi.orixa,
    affirmation: TEXT_SPIRITUAL_CORRELATIONS.sufi.affirmation,
    frequency: TEXT_SPIRITUAL_CORRELATIONS.sufi.frequency,
    spiritualCorrelations: TEXT_SPIRITUAL_CORRELATIONS.sufi,
  },
  {
    id: '8',
    title: 'Heart Sutra',
    type: 'zen',
    description: 'Prajnaparamita sutra - essence of Buddhist wisdom',
    author: 'Avalokiteshvara',
    period: '1st-2nd century CE',
    sefirot: TEXT_SPIRITUAL_CORRELATIONS.zen.sefirot,
    chakra: TEXT_SPIRITUAL_CORRELATIONS.zen.chakra,
    element: TEXT_SPIRITUAL_CORRELATIONS.zen.element,
    orixa: TEXT_SPIRITUAL_CORRELATIONS.zen.orixa,
    affirmation: TEXT_SPIRITUAL_CORRELATIONS.zen.affirmation,
    frequency: TEXT_SPIRITUAL_CORRELATIONS.zen.frequency,
    spiritualCorrelations: TEXT_SPIRITUAL_CORRELATIONS.zen,
  },
];

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const parseResult = MysticalTextsQuerySchema.safeParse({
      type: url.searchParams.get('type'),
      id: url.searchParams.get('id'),
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

    const { type, id, sefirot, chakra, element, orixa } = parseResult.data;
    let filteredTexts = [...mysticalTexts];

    if (id) {
      filteredTexts = filteredTexts.filter(t => t.id === id);
    }

    if (type) {
      filteredTexts = filteredTexts.filter(t => t.type === type);
    }

    if (sefirot) {
      filteredTexts = filteredTexts.filter(t => t.spiritualCorrelations.sefirot.includes(sefirot));
    }

    if (chakra) {
      filteredTexts = filteredTexts.filter(t => t.spiritualCorrelations.chakra === chakra);
    }

    if (element) {
      filteredTexts = filteredTexts.filter(t => t.spiritualCorrelations.element === element);
    }

    if (orixa) {
      filteredTexts = filteredTexts.filter(t => t.spiritualCorrelations.orixa === orixa);
    }

    // Calculate spiritual stats
    const spiritualStats = {
      byType: filteredTexts.reduce((acc, t) => {
        acc[t.type] = (acc[t.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySefirot: filteredTexts.reduce((acc, t) => {
        t.spiritualCorrelations.sefirot.forEach(s => {
          acc[s] = (acc[s] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      byChakra: filteredTexts.reduce((acc, t) => {
        const c = t.spiritualCorrelations.chakra;
        if (c) acc[c] = (acc[c] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byElement: filteredTexts.reduce((acc, t) => {
        const e = t.spiritualCorrelations.element;
        if (e) acc[e] = (acc[e] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byOrixa: filteredTexts.reduce((acc, t) => {
        const o = t.spiritualCorrelations.orixa;
        if (o) acc[o] = (acc[o] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      texts: filteredTexts,
      count: filteredTexts.length,
      spiritualCorrelations: TEXT_SPIRITUAL_CORRELATIONS,
      spiritualStats,
      meta: {
        filters: { type, id, sefirot, chakra, element, orixa },
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve mystical texts',
    }, { status: 500 });
  }
}