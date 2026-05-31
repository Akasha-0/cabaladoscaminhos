import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────

const ShadowWorkCategorySchema = z.enum(['integration', 'inner-child', 'triggers', 'patterns', 'projections']);

const ShadowWorkPracticeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: ShadowWorkCategorySchema,
  duration: z.string(),
  steps: z.array(z.string()),
  warnings: z.array(z.string()).optional(),
});

const ShadowWorkResponseSchema = z.object({
  success: z.boolean(),
  practices: z.array(ShadowWorkPracticeSchema),
  categories: z.array(z.object({
    name: ShadowWorkCategorySchema,
    description: z.string(),
    weight: z.number(),
  })),
});

// Shadow work practices data
const SHADOW_WORK_PRACTICES: z.infer<typeof ShadowWorkPracticeSchema>[] = [
  {
    id: 'shadow-dialogue',
    name: 'Diálogo com a Sombra',
    description: 'Internal conversation with rejected aspects of self',
    category: 'integration',
    duration: '20-30 minutos',
    steps: [
      'Find a quiet space and center yourself',
      'Identify a rejected trait you want to explore',
      'Write a dialogue between yourself and that aspect',
      'Allow the shadow part to express itself freely',
      'Thank the aspect and integrate insights',
    ],
    warnings: ['May bring up intense emotions', 'Best done with professional support if trauma is present'],
  },
  {
    id: 'inner-child-healing',
    name: 'Cura da Criança Interior',
    description: 'Healing wounds from childhood by reconnecting with younger self',
    category: 'inner-child',
    duration: '30-45 minutos',
    steps: [
      'Visualize yourself at age 5-7',
      'Notice any wounds or unmet needs',
      'Speak to your inner child with compassion',
      'Offer the love and protection they needed',
      'Create a ritual of reparenting',
    ],
  },
  {
    id: 'trigger-identification',
    name: 'Identificação de Gatilhos',
    description: 'Mapping emotional triggers to uncover shadow patterns',
    category: 'triggers',
    duration: '15-20 minutos',
    steps: [
      'Notice when you feel strongly reactive',
      'Name the emotion without judgment',
      'Trace the reaction back to its origin',
      'Ask: what belief or wound does this trigger?',
      'Document patterns over time',
    ],
  },
  {
    id: 'pattern-interruption',
    name: 'Interrupção de Padrões',
    description: 'Breaking unconscious behavioral patterns tied to shadow material',
    category: 'patterns',
    duration: ' ongoing practice',
    steps: [
      'Identify a recurring pattern that no longer serves',
      'Notice the trigger that initiates the pattern',
      'Choose an alternative response in advance',
      'Practice the new response when triggered',
      'Celebrate small wins and stay patient',
    ],
  },
  {
    id: 'projection- reclamation',
    name: 'Reivindicação de Projeções',
    description: 'Taking back aspects of self projected onto others',
    category: 'projections',
    duration: '20-30 minutos',
    steps: [
      'Notice when you judge others harshly',
      'Ask: what part of myself am I denying?',
      'Acknowledge the trait exists within you',
      'Integrate it with compassion',
      'Practice seeing others as mirrors',
    ],
  },
];

const CATEGORIES: { name: z.infer<typeof ShadowWorkCategorySchema>; description: string; weight: number }[] = [
  { name: 'integration', description: 'Integrating rejected aspects of self', weight: 3 },
  { name: 'inner-child', description: 'Healing childhood wounds and reparenting', weight: 3 },
  { name: 'triggers', description: 'Mapping emotional triggers to shadow patterns', weight: 2 },
  { name: 'patterns', description: 'Breaking unconscious behavioral patterns', weight: 2 },
  { name: 'projections', description: 'Reclaiming aspects projected onto others', weight: 2 },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category') as ShadowWorkCategorySchema | null;

  let practices = SHADOW_WORK_PRACTICES;
  if (category && ShadowWorkCategorySchema.safeParse(category).success) {
    practices = SHADOW_WORK_PRACTICES.filter(p => p.category === category);
  }

  const response = {
    success: true,
    practices,
    categories: CATEGORIES,
  };

  const parsed = ShadowWorkResponseSchema.safeParse(response);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Erro de validação' }, { status: 500 });
  }

  return NextResponse.json(parsed.data);
}