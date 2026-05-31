import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const TechniqueSchema = z.enum(['box', '4-7-8', 'diaphragmatic', 'alternate-nostril', 'coherent', 'holotropic']);
const BreathworkQuerySchema = z.object({
  technique: TechniqueSchema.optional(),
  chakra: z.coerce.number().int().min(1).max(7).optional(),
  sefirot: SefirotSchema.optional(),
  element: ElementSchema.optional(),
  solfeggio: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  extended: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  includeFrequencies: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  orixa: z.string().optional(),
});

// ─── Technique Spiritual Correlations ──────────────────────────────────────────
const TECHNIQUE_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  box: { sefirot: ['Kether', 'Tipheret'], chakra: 6, element: 'Ar', orixa: 'Oxalá', affirmation: 'Eu respiro em harmonia e equilibrio', frequency: '432 Hz' },
  '4-7-8': { sefirot: ['Binah', 'Yesod'], chakra: 7, element: 'Água', orixa: 'Iemanjá', affirmation: 'A paz me envolve em cada respiração', frequency: '528 Hz' },
  diaphragmatic: { sefirot: ['Chesed', 'Netzach'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'Minha respiração conecta mente e corpo', frequency: '639 Hz' },
  'alternate-nostril': { sefirot: ['Chokhmah', 'Hod'], chakra: 6, element: 'Ar', orixa: 'Orunmilá', affirmation: 'Equilibrio meus canais de energia', frequency: '741 Hz' },
  coherent: { sefirot: ['Tipheret', 'Gevurah'], chakra: 5, element: 'Fogo', orixa: 'Xangô', affirmation: 'Meu coração pulsa em coerência', frequency: '852 Hz' },
  holotropic: { sefirot: ['Kether', 'Binah'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'Transcendo limites através da respiração', frequency: '963 Hz' },
};

// ─── Solfeggio Frequencies with Spiritual Correlations ──────────────────────────────────────────
const SOLFEGGIO_FREQUENCIES = [
  { hz: 174, name: 'Frequência da Terra', chakra: 1, element: 'Terra', orixa: 'Ogum', sefirot: ['Malkuth'], affirmation: 'Estou fundamentado na terra', mantram: 'Lam', poliedro: 'Cubo' },
  { hz: 285, name: 'Frequência da Estrutura', chakra: 2, element: 'Água', orixa: 'Iemanjá', sefirot: ['Yesod'], affirmation: ' fluo em harmonia', mantram: 'Vam', poliedro: 'Icosaedro' },
  { hz: 396, name: 'Frequência da Libertação', chakra: 3, element: 'Fogo', orixa: 'Xangô', sefirot: ['Gevurah'], affirmation: 'Libero meu medo e culpa', mantram: 'Ram', poliedro: 'Tetraedro' },
  { hz: 417, name: 'Frequência da Mudança', chakra: 4, element: 'Fogo', orixa: 'Oxum', sefirot: ['Chesed'], affirmation: 'Promovo mudanças em minha vida', mantram: 'Yam', poliedro: 'Tetraedro' },
  { hz: 528, name: 'Frequência do Amor', chakra: 5, element: 'Ar', orixa: 'Oxalá', sefirot: ['Tipheret'], affirmation: 'O amor é a minha natureza', mantram: 'Ram', poliedro: 'Dodecaedro' },
  { hz: 639, name: 'Frequência da Harmonia', chakra: 6, element: 'Água', orixa: 'Iemanjá', sefirot: ['Netzach'], affirmation: 'Harmonizo minhas relações', mantram: 'Ham', poliedro: 'Icosaedro' },
  { hz: 741, name: 'Frequência da Intuição', chakra: 6, element: 'Ar', orixa: 'Orunmilá', sefirot: ['Hod'], affirmation: 'Minha intuição me guia', mantram: 'Om', poliedro: 'Octaedro' },
  { hz: 852, name: 'Frequência da Claridade', chakra: 7, element: 'Ar', orixa: 'Oxalá', sefirot: ['Chokhmah'], affirmation: 'Vejo com clareza e discernimento', mantram: 'Om', poliedro: 'Octaedro' },
  { hz: 963, name: 'Frequência da Pureza', chakra: 7, element: 'Éter', orixa: 'Oxalá', sefirot: ['Kether'], affirmation: ' Sou um com a fonte divina', mantram: 'Om', poliedro: 'Esfera' },
];

// Extended frequencies
const EXTENDED_FREQUENCIES = [
  { hz: 396, name: 'Desbloqueio de Culpa', chakra: 1, element: 'Fogo', orixa: 'Ogum' },
  { hz: 417, name: 'Facilitação de Mudança', chakra: 2, element: 'Água', orixa: 'Iemanjá' },
  { hz: 432, name: 'Alinhamento Perfeito', chakra: 3, element: 'Fogo', orixa: 'Xangô' },
  { hz: 528, name: 'Transformação e Milagres', chakra: 4, element: 'Ar', orixa: 'Oxum' },
  { hz: 639, name: 'Conexão com Outros', chakra: 5, element: 'Água', orixa: 'Iemanjá' },
  { hz: 741, name: 'Despertar da Intuição', chakra: 6, element: 'Ar', orixa: 'Orunmilá' },
  { hz: 852, name: 'Restabelecimento da Energia', chakra: 7, element: 'Éter', orixa: 'Oxalá' },
  { hz: 963, name: 'Elevação Espiritual', chakra: 7, element: 'Éter', orixa: 'Oxalá' },
  { hz: 72, name: 'Grounding e Estabilidade', chakra: 1, element: 'Terra', orixa: 'Ogum' },
  { hz: 96, name: 'Renovação Celular', chakra: 2, element: 'Água', orixa: 'Iemanjá' },
  { hz: 108, name: 'Harmonização Sagrada', chakra: 3, element: 'Fogo', orixa: 'Xangô' },
  { hz: 144, name: 'Ascensão Espiritual', chakra: 7, element: 'Éter', orixa: 'Oxalá' },
];

const VALID_TECHNIQUES = ['box', '4-7-8', 'diaphragmatic', 'alternate-nostril', 'coherent', 'holotropic'] as const;
type Technique = z.infer<typeof TechniqueSchema>;

const TECHNIQUE_META: Record<Technique, {
  title: string;
  description: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  spiritualCorrelations: typeof TECHNIQUE_SPIRITUAL_CORRELATIONS.box;
}> = {
  box: { title: 'Box Breathing', description: 'Equal parts inhale, hold, exhale, hold. Calming and centering.', inhale: 4, hold1: 4, exhale: 4, hold2: 4, spiritualCorrelations: TECHNIQUE_SPIRITUAL_CORRELATIONS.box },
  '4-7-8': { title: '4-7-8 Breathing', description: 'Inhale 4, hold 7, exhale 8. Promotes deep relaxation and sleep.', inhale: 4, hold1: 7, exhale: 8, hold2: 0, spiritualCorrelations: TECHNIQUE_SPIRITUAL_CORRELATIONS['4-7-8'] },
  diaphragmatic: { title: 'Diaphragmatic Breathing', description: 'Deep belly breathing to activate the parasympathetic nervous system.', inhale: 4, hold1: 2, exhale: 6, hold2: 2, spiritualCorrelations: TECHNIQUE_SPIRITUAL_CORRELATIONS.diaphragmatic },
  'alternate-nostril': { title: 'Alternate Nostril Breathing', description: 'Nadi Shodhana. Balances hemispheres and calms the mind.', inhale: 4, hold1: 4, exhale: 4, hold2: 0, spiritualCorrelations: TECHNIQUE_SPIRITUAL_CORRELATIONS['alternate-nostril'] },
  coherent: { title: 'Coherent Breathing', description: '5 seconds each. Optimizes heart rate variability.', inhale: 5, hold1: 0, exhale: 5, hold2: 0, spiritualCorrelations: TECHNIQUE_SPIRITUAL_CORRELATIONS.coherent },
  holotropic: { title: 'Holotropic Breathwork', description: 'Rapid breathing for altered states. Use with caution.', inhale: 1, hold1: 0, exhale: 1, hold2: 0, spiritualCorrelations: TECHNIQUE_SPIRITUAL_CORRELATIONS.holotropic },
};

function getFrequenciaPorChakra(chakra: number) {
  return SOLFEGGIO_FREQUENCIES.filter(f => f.chakra === chakra);
}

function getFrequenciaPorSefirot(sefirot: string) {
  return SOLFEGGIO_FREQUENCIES.filter(f => f.sefirot?.includes(sefirot));
}

function getFrequenciaPorOrixa(orixa: string) {
  return SOLFEGGIO_FREQUENCIES.filter(f => f.orixa === orixa);
}

function getFrequenciaPorElement(element: string) {
  return SOLFEGGIO_FREQUENCIES.filter(f => f.element === element);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = BreathworkQuerySchema.safeParse({
      technique: searchParams.get('technique'),
      chakra: searchParams.get('chakra'),
      sefirot: searchParams.get('sefirot'),
      element: searchParams.get('element'),
      solfeggio: searchParams.get('solfeggio'),
      extended: searchParams.get('extended'),
      includeFrequencies: searchParams.get('includeFrequencies'),
      orixa: searchParams.get('orixa'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { technique, chakra, sefirot, element, solfeggio, extended, includeFrequencies, orixa } = parseResult.data;

    // Return all Solfeggio frequencies
    if (solfeggio) {
      const frequencies = extended ? EXTENDED_FREQUENCIES : SOLFEGGIO_FREQUENCIES;
      return NextResponse.json({
        success: true,
        frequencies,
        count: frequencies.length,
      });
    }

    // Filter by chakra
    if (chakra !== undefined) {
      const frequencies = getFrequenciaPorChakra(chakra);
      return NextResponse.json({
        success: true,
        frequencies,
        count: frequencies.length,
        chakra,
      });
    }

    // Filter by sefirot
    if (sefirot) {
      const frequencies = getFrequenciaPorSefirot(sefirot);
      return NextResponse.json({
        success: true,
        frequencies,
        count: frequencies.length,
        sefirot,
      });
    }

    // Filter by element
    if (element) {
      const frequencies = getFrequenciaPorElement(element);
      return NextResponse.json({
        success: true,
        frequencies,
        count: frequencies.length,
        element,
      });
    }

    // Filter by orixa
    if (orixa) {
      const frequencies = getFrequenciaPorOrixa(orixa);
      return NextResponse.json({
        success: true,
        frequencies,
        count: frequencies.length,
        orixa,
      });
    }

    // Return technique details
    if (technique) {
      const meta = TECHNIQUE_META[technique];
      return NextResponse.json({
        success: true,
        technique,
        ...meta,
      });
    }

    // Return all techniques with spiritual correlations
    return NextResponse.json({
      success: true,
      techniques: VALID_TECHNIQUES.map(t => ({
        id: t,
        ...TECHNIQUE_META[t],
      })),
      count: VALID_TECHNIQUES.length,
      stats: {
        byElement: SOLFEGGIO_FREQUENCIES.reduce((acc, f) => {
          acc[f.element] = (acc[f.element] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byChakra: SOLFEGGIO_FREQUENCIES.reduce((acc, f) => {
          acc[f.chakra] = (acc[f.chakra] || 0) + 1;
          return acc;
        }, {} as Record<number, number>),
        byOrixa: SOLFEGGIO_FREQUENCIES.reduce((acc, f) => {
          acc[f.orixa] = (acc[f.orixa] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}