import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const TechniqueSchema = z.enum(['box', '4-7-8', 'diaphragmatic', 'alternate-nostril', 'coherent', 'holotropic']);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const BreathworkQuerySchema = z.object({
  technique: TechniqueSchema.optional(),
  chakra: z.coerce.number().int().min(1).max(7).optional(),
  sefirot: z.string().optional(),
  solfeggio: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  extended: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  includeFrequencies: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});
const VALID_TECHNIQUES = ['box', '4-7-8', 'diaphragmatic', 'alternate-nostril', 'coherent', 'holotropic'] as const;
type Technique = z.infer<typeof TechniqueSchema>;
const TECHNIQUE_META: Record<Technique, { title: string; description: string; inhale: number; hold1: number; exhale: number; hold2: number }> = {
  box: { title: 'Box Breathing', description: 'Equal parts inhale, hold, exhale, hold. Calming and centering.', inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
  '4-7-8': { title: '4-7-8 Breathing', description: 'Inhale 4, hold 7, exhale 8. Promotes deep relaxation and sleep.', inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
  diaphragmatic: { title: 'Diaphragmatic Breathing', description: 'Deep belly breathing to activate the parasympathetic nervous system.', inhale: 4, hold1: 2, exhale: 6, hold2: 2 },
  'alternate-nostril': { title: 'Alternate Nostril Breathing', description: 'Nadi Shodhana. Balances hemispheres and calms the mind.', inhale: 4, hold1: 4, exhale: 4, hold2: 0 },
  coherent: { title: 'Coherent Breathing', description: '5 seconds each. Optimizes heart rate variability.', inhale: 5, hold1: 0, exhale: 5, hold2: 0 },
  holotropic: { title: 'Holotropic Breathwork', description: 'Rapid breathing for altered states. Use with caution.', inhale: 1, hold1: 0, exhale: 1, hold2: 0 },
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { FREQUENCIAS_SOLFEGGIO, FREQUENCIAS_EXTENDIDAS, getFrequenciaPorChakra, getFrequenciaPorSefirot, getFrequenciaMaisAlta, getFrequenciaMaisBaixa } = require('@/lib/frequencias/dados');
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = BreathworkQuerySchema.safeParse({
      technique: searchParams.get('technique'),
      chakra: searchParams.get('chakra'),
      sefirot: searchParams.get('sefirot'),
      solfeggio: searchParams.get('solfeggio'),
      extended: searchParams.get('extended'),
      includeFrequencies: searchParams.get('includeFrequencies'),
    });
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { technique, chakra, sefirot, solfeggio, extended, includeFrequencies } = parseResult.data;
    // Return all Solfeggio frequencies
    if (solfeggio) {
      const frequencies = extended ? FREQUENCIAS_EXTENDIDAS : FREQUENCIAS_SOLFEGGIO;
      return NextResponse.json({
        frequencies,
        count: frequencies.length,
      });
    }
    // Filter by chakra
    if (chakra !== undefined) {
      const frequencies = getFrequenciaPorChakra(chakra);
      return NextResponse.json({
        frequencies,
        count: frequencies.length,
        chakra,
      });
    }
    // Filter by sefirot
    if (sefirot) {
      const frequencies = getFrequenciaPorSefirot(sefirot);
      return NextResponse.json({
        frequencies,
        count: frequencies.length,
        sefirot,
      });
    }
    // Return technique details
    if (technique) {
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
      includeFrequencies,
    });
  } catch {
    return NextResponse.json({
      error: 'Erro ao processar respiração',
    }, { status: 500 });
  }
}
