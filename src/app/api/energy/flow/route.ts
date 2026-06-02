// ============================================================
// ENERGY FLOW API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for energy flow visualization and tracking
// ============================================================
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import type { SpiritualCorrelations } from '@/lib/api/spiritual-correlations';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether',
  'Chokhmah',
  'Binah',
  'Chesed',
  'Gevurah',
  'Tipheret',
  'Netzach',
  'Hod',
  'Yesod',
  'Malkuth',
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const EnergyFlowQuerySchema = z.object({
  pattern: z.string().optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

const ENERGY_FLOW_MODES = ['inhale', 'exhale', 'hold'] as const;
type FlowMode = (typeof ENERGY_FLOW_MODES)[number];

// ─── Spiritual Correlations for Energy Flow Patterns ──────────────────────────────────────────
const FLOW_SPIRITUAL_CORRELATIONS: Record<
  string,
  {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  }
> = {
  balanced: {
    sefirot: ['Tipheret', 'Yesod'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'O equilíbrio flui através de mim',
    frequency: '528 Hz',
  },
  energizing: {
    sefirot: ['Gevurah', 'Netzach'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'A energia vital me fortalece',
    frequency: '528 Hz',
  },
  calming: {
    sefirot: ['Binah', 'Kether'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'A paz me envolve completamente',
    frequency: '417 Hz',
  },
  sufi: {
    sefirot: ['Tipheret', 'Chesed'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'O coração se abre para o divino',
    frequency: '528 Hz',
  },
  pranayama: {
    sefirot: ['Binah', 'Hod'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Orunmilá',
    affirmation: 'O prana flui através de mim',
    frequency: '639 Hz',
  },
  kundalini: {
    sefirot: ['Kether', 'Malkuth'],
    chakra: 7,
    element: 'Fogo',
    orixa: 'Oxalá',
    affirmation: 'A serpente de fogo desperta',
    frequency: '963 Hz',
  },
};

interface FlowPattern {
  id: string;
  name: string;
  phases: {
    mode: FlowMode;
    duration: number;
    description: string;
  }[];
  benefits: string[];
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
  spiritualCorrelations: SpiritualCorrelations;
}

const FLOW_PATTERNS: FlowPattern[] = [
  {
    id: 'balanced',
    name: 'Balanced Flow',
    phases: [
      { mode: 'inhale', duration: 4, description: 'Inhale deeply through the nose' },
      { mode: 'hold', duration: 4, description: 'Hold breath gently' },
      { mode: 'exhale', duration: 4, description: 'Exhale slowly through the mouth' },
    ],
    benefits: ['Balances energy centers', 'Calms the nervous system', 'Promotes inner peace'],
    sefirot: FLOW_SPIRITUAL_CORRELATIONS.balanced.sefirot,
    chakra: FLOW_SPIRITUAL_CORRELATIONS.balanced.chakra,
    element: FLOW_SPIRITUAL_CORRELATIONS.balanced.element,
    orixa: FLOW_SPIRITUAL_CORRELATIONS.balanced.orixa,
    affirmation: FLOW_SPIRITUAL_CORRELATIONS.balanced.affirmation,
    frequency: FLOW_SPIRITUAL_CORRELATIONS.balanced.frequency,
    spiritualCorrelations: FLOW_SPIRITUAL_CORRELATIONS.balanced,
  },
  {
    id: 'energizing',
    name: 'Energizing Breath',
    phases: [
      { mode: 'inhale', duration: 6, description: 'Rapid inhale through the nose' },
      { mode: 'exhale', duration: 2, description: 'Sharp exhale through the mouth' },
    ],
    benefits: ['Increases vital energy', 'Activates solar plexus', 'Boosts motivation'],
    sefirot: FLOW_SPIRITUAL_CORRELATIONS.energizing.sefirot,
    chakra: FLOW_SPIRITUAL_CORRELATIONS.energizing.chakra,
    element: FLOW_SPIRITUAL_CORRELATIONS.energizing.element,
    orixa: FLOW_SPIRITUAL_CORRELATIONS.energizing.orixa,
    affirmation: FLOW_SPIRITUAL_CORRELATIONS.energizing.affirmation,
    frequency: FLOW_SPIRITUAL_CORRELATIONS.energizing.frequency,
    spiritualCorrelations: FLOW_SPIRITUAL_CORRELATIONS.energizing,
  },
  {
    id: 'calming',
    name: 'Calming Breath',
    phases: [
      { mode: 'inhale', duration: 4, description: 'Slow inhale through the nose' },
      { mode: 'hold', duration: 7, description: 'Hold breath peacefully' },
      { mode: 'exhale', duration: 8, description: 'Extended exhale through pursed lips' },
    ],
    benefits: ['Activates parasympathetic system', 'Reduces anxiety', 'Deepens relaxation'],
    sefirot: FLOW_SPIRITUAL_CORRELATIONS.calming.sefirot,
    chakra: FLOW_SPIRITUAL_CORRELATIONS.calming.chakra,
    element: FLOW_SPIRITUAL_CORRELATIONS.calming.element,
    orixa: FLOW_SPIRITUAL_CORRELATIONS.calming.orixa,
    affirmation: FLOW_SPIRITUAL_CORRELATIONS.calming.affirmation,
    frequency: FLOW_SPIRITUAL_CORRELATIONS.calming.frequency,
    spiritualCorrelations: FLOW_SPIRITUAL_CORRELATIONS.calming,
  },
  {
    id: 'sufi',
    name: 'Sufi Breathing',
    phases: [
      { mode: 'inhale', duration: 6, description: 'Belly expansion breathing' },
      { mode: 'hold', duration: 0, description: 'No hold' },
      { mode: 'exhale', duration: 6, description: 'Belly contraction breathing' },
    ],
    benefits: ['Opens heart chakra', 'Connects breath with movement', 'Elevates consciousness'],
    sefirot: FLOW_SPIRITUAL_CORRELATIONS.sufi.sefirot,
    chakra: FLOW_SPIRITUAL_CORRELATIONS.sufi.chakra,
    element: FLOW_SPIRITUAL_CORRELATIONS.sufi.element,
    orixa: FLOW_SPIRITUAL_CORRELATIONS.sufi.orixa,
    affirmation: FLOW_SPIRITUAL_CORRELATIONS.sufi.affirmation,
    frequency: FLOW_SPIRITUAL_CORRELATIONS.sufi.frequency,
    spiritualCorrelations: FLOW_SPIRITUAL_CORRELATIONS.sufi,
  },
  {
    id: 'pranayama',
    name: 'Pranayama Breathing',
    phases: [
      { mode: 'inhale', duration: 5, description: 'Kapalabhati-style rapid breathing' },
      { mode: 'exhale', duration: 5, description: 'Passive exhale' },
    ],
    benefits: ['Clears prana channels', 'Energizes nervous system', 'Purifies nadis'],
    sefirot: FLOW_SPIRITUAL_CORRELATIONS.pranayama.sefirot,
    chakra: FLOW_SPIRITUAL_CORRELATIONS.pranayama.chakra,
    element: FLOW_SPIRITUAL_CORRELATIONS.pranayama.element,
    orixa: FLOW_SPIRITUAL_CORRELATIONS.pranayama.orixa,
    affirmation: FLOW_SPIRITUAL_CORRELATIONS.pranayama.affirmation,
    frequency: FLOW_SPIRITUAL_CORRELATIONS.pranayama.frequency,
    spiritualCorrelations: FLOW_SPIRITUAL_CORRELATIONS.pranayama,
  },
  {
    id: 'kundalini',
    name: 'Kundalini Awakening',
    phases: [
      { mode: 'inhale', duration: 4, description: 'Root lock and upward breath' },
      { mode: 'hold', duration: 15, description: 'Energy rises through chakras' },
      { mode: 'exhale', duration: 4, description: 'Release and grounding' },
    ],
    benefits: ['Activates kundalini energy', 'Opens all chakras', 'Spiritual awakening'],
    sefirot: FLOW_SPIRITUAL_CORRELATIONS.kundalini.sefirot,
    chakra: FLOW_SPIRITUAL_CORRELATIONS.kundalini.chakra,
    element: FLOW_SPIRITUAL_CORRELATIONS.kundalini.element,
    orixa: FLOW_SPIRITUAL_CORRELATIONS.kundalini.orixa,
    affirmation: FLOW_SPIRITUAL_CORRELATIONS.kundalini.affirmation,
    frequency: FLOW_SPIRITUAL_CORRELATIONS.kundalini.frequency,
    spiritualCorrelations: FLOW_SPIRITUAL_CORRELATIONS.kundalini,
  },
];

// fallow-ignore-next-line complexity
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = EnergyFlowQuerySchema.safeParse({
    pattern: searchParams.get('pattern'),
    sefirot: searchParams.get('sefirot'),
    chakra: searchParams.get('chakra'),
    element: searchParams.get('element'),
    orixa: searchParams.get('orixa'),
  });

  if (!parseResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { pattern, sefirot, chakra, element, orixa } = parseResult.data;
  let patterns = [...FLOW_PATTERNS];

  if (pattern) {
    patterns = patterns.filter((p) => p.id === pattern);
  }

  if (sefirot) {
    patterns = patterns.filter((p) => p.spiritualCorrelations.sefirot.includes(sefirot));
  }

  if (chakra) {
    patterns = patterns.filter((p) => p.spiritualCorrelations.chakra === chakra);
  }

  if (element) {
    patterns = patterns.filter((p) => p.spiritualCorrelations.element === element);
  }

  if (orixa) {
    patterns = patterns.filter((p) => p.spiritualCorrelations.orixa === orixa);
  }

  // Calculate spiritual stats
  const spiritualStats = {
    bySefirot: patterns.reduce(
      (acc, p) => {
        p.spiritualCorrelations.sefirot.forEach((s) => {
          acc[s] = (acc[s] || 0) + 1;
        });
        return acc;
      },
      {} as Record<string, number>
    ),
    byChakra: patterns.reduce(
      (acc, p) => {
        const c = p.spiritualCorrelations.chakra;
        if (c) acc[c] = (acc[c] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
    byElement: patterns.reduce(
      (acc, p) => {
        const e = p.spiritualCorrelations.element;
        if (e) acc[e] = (acc[e] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
    byOrixa: patterns.reduce(
      (acc, p) => {
        const o = p.spiritualCorrelations.orixa;
        if (o) acc[o] = (acc[o] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
  };

  return NextResponse.json({
    success: true,
    patterns,
    total: patterns.length,
    spiritualCorrelations: FLOW_SPIRITUAL_CORRELATIONS,
    spiritualStats,
    meta: {
      filters: { pattern, sefirot, chakra, element, orixa },
    },
  });
}
