import { NextRequest, NextResponse } from 'next/server';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { FREQUENCIAS_SOLFEGGIO, FREQUENCIAS_EXTENDIDAS, getFrequenciaPorChakra, getFrequenciaPorSefirot, getFrequenciaMaisAlta, getFrequenciaMaisBaixa } = require('@/lib/frequencias/dados');

const VALID_TECHNIQUES = ['box', '4-7-8', 'diaphragmatic', 'alternate-nostril', 'coherent', 'holotropic'] as const;
type Technique = typeof VALID_TECHNIQUES[number];

const TECHNIQUE_META: Record<Technique, { title: string; description: string; inhale: number; hold1: number; exhale: number; hold2: number }> = {
  box: { title: 'Box Breathing', description: 'Equal parts inhale, hold, exhale, hold. Calming and centering.', inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
  '4-7-8': { title: '4-7-8 Breathing', description: 'Inhale 4, hold 7, exhale 8. Promotes deep relaxation and sleep.', inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
  diaphragmatic: { title: 'Diaphragmatic Breathing', description: 'Deep belly breathing to activate the parasympathetic nervous system.', inhale: 4, hold1: 2, exhale: 6, hold2: 2 },
  'alternate-nostril': { title: 'Alternate Nostril Breathing', description: 'Nadi Shodhana. Balances hemispheres and calms the mind.', inhale: 4, hold1: 4, exhale: 4, hold2: 0 },
  coherent: { title: 'Coherent Breathing', description: '5 seconds each. Optimizes heart rate variability.', inhale: 5, hold1: 0, exhale: 5, hold2: 0 },
  holotropic: { title: 'Holotropic Breathwork', description: 'Rapid breathing for altered states. Use with caution.', inhale: 1, hold1: 0, exhale: 1, hold2: 0 },
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const technique = searchParams.get('technique') as Technique | null;
  const chakra = searchParams.get('chakra');
  const sefirot = searchParams.get('sefirot');
  const solfeggio = searchParams.get('solfeggio');
  const extended = searchParams.get('extended');

  // Return all Solfeggio frequencies
  if (solfeggio === 'true') {
    const frequencies = extended === 'true' ? FREQUENCIAS_EXTENDIDAS : FREQUENCIAS_SOLFEGGIO;
    return NextResponse.json({
      frequencies,
      count: frequencies.length,
    });
  }

  // Filter by chakra
  if (chakra) {
    const chakraNum = parseInt(chakra, 10);
    if (isNaN(chakraNum) || chakraNum < 1 || chakraNum > 7) {
      return NextResponse.json({ error: 'Chakra must be between 1 and 7' }, { status: 400 });
    }
    const frequencies = getFrequenciaPorChakra(chakraNum);
    return NextResponse.json({
      frequencies,
      count: frequencies.length,
    });
  }

  // Filter by sefirot
  if (sefirot) {
    const frequencies = getFrequenciaPorSefirot(sefirot);
    return NextResponse.json({
      frequencies,
      count: frequencies.length,
    });
  }

  // Return technique details
  if (technique) {
    if (!VALID_TECHNIQUES.includes(technique)) {
      return NextResponse.json({
        error: 'Invalid technique',
        valid: VALID_TECHNIQUES,
      }, { status: 400 });
    }
    const meta = TECHNIQUE_META[technique];
    return NextResponse.json({
      technique,
      ...meta,
    });
  }

  // Return all techniques
  return NextResponse.json({
    techniques: VALID_TECHNIQUES.map(t => ({
      id: t,
      ...TECHNIQUE_META[t],
    })),
    solfeggio: {
      count: FREQUENCIAS_SOLFEGGIO.length,
      extendedCount: FREQUENCIAS_EXTENDIDAS.length,
      highest: getFrequenciaMaisAlta(),
      lowest: getFrequenciaMaisBaixa(),
    },
  });
}
