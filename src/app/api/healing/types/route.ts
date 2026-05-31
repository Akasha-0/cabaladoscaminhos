import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────

const HealingTypeSchema = z.enum(['mental', 'physical', 'spiritual', 'karmic', 'emotional', 'ancestral']);
const HealingStageSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  duration: z.string(),
});

const HealingTypeDetailSchema = z.object({
  id: z.string(),
  type: HealingTypeSchema,
  name: z.string(),
  nameEn: z.string(),
  description: z.string(),
  methods: z.array(z.string()),
  sefirot: z.array(z.string()).optional(),
  chakras: z.array(z.string()).optional(),
  stages: z.array(HealingStageSchema),
  duration: z.string(),
  contraindications: z.array(z.string()).optional(),
});

const HealingTypesQuerySchema = z.object({
  type: HealingTypeSchema.optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
});

const HEALING_TYPES: z.infer<typeof HealingTypeDetailSchema>[] = [
  {
    id: 'mental-healing',
    type: 'mental',
    name: 'Cura Mental',
    nameEn: 'Mental Healing',
    description: 'Libertação de padrões mentais limitantes e reprogramação do inconsciente para uma nova perspectiva de vida.',
    methods: ['Meditação Vipassana', 'PNL (Programação Neurolinguística)', 'Terapia Cognitivo-Comportamental', 'Autosugestão'],
    sefirot: ['Gevurah', 'Hod'],
    chakras: ['Ajna (6º)', 'Sahasrara (7º)'],
    stages: [
      { id: 'awareness', name: 'Tomada de Consciência', description: 'Identificar os padrões mentais limitantes', duration: '1-2 semanas' },
      { id: 'resistance', name: 'Resistência', description: 'Surgimento de resistências e antigas memórias', duration: '2-4 semanas' },
      { id: 'integration', name: 'Integração', description: 'Incorporar novas perspectivas', duration: '4-8 semanas' },
      { id: 'stabilization', name: 'Estabilização', description: 'Consolidar novas crenças', duration: ' ongoing' },
    ],
    duration: '2-6 meses',
  },
  {
    id: 'emotional-healing',
    type: 'emotional',
    name: 'Cura Emocional',
    nameEn: 'Emotional Healing',
    description: 'Processamento e libertação de emoções reprimidas, traumas e feridas emocionais não resolvidas.',
    methods: ['Terapia Holotrópica', 'Psicologia Transpessoal', 'Terapia de Breathwork', 'Terapia Floral'],
    sefirot: ['Tipheret', 'Netzach'],
    chakras: ['Anahata (4º)', 'Svadhisthana (2º)'],
    stages: [
      { id: 'release', name: 'Libertação', description: 'Permitir que emoções surjam e sejam processadas', duration: '1-3 meses' },
      { id: 'expression', name: 'Expressão', description: 'Aprender a expressar emoções de forma saudável', duration: '2-4 meses' },
      { id: 'integration', name: 'Integração', description: 'Integrar experiências passadas com sabedoria', duration: ' ongoing' },
    ],
    duration: '3-12 meses',
  },
  {
    id: 'physical-healing',
    type: 'physical',
    name: 'Cura Física',
    nameEn: 'Physical Healing',
    description: 'Trabalho energético e físico para harmonizar o corpo, eliminar bloqueios e restaurar a saúde.',
    methods: ['Reiki', 'Acupuntura', 'Aromaterapia', 'Fitoterapia', 'Terapia Vibracional'],
    sefirot: ['Malkuth', 'Yesod'],
    chakras: ['Muladhara (1º)', 'Svadhisthana (2º)', 'Manipura (3º)'],
    stages: [
      { id: 'diagnosis', name: 'Diagnóstico Energético', description: 'Identificar bloqueios e desequilíbrios', duration: '1-2 sessões' },
      { id: 'cleansing', name: 'Limpeza Energética', description: 'Remover energias densas e bloqueios', duration: '3-6 sessões' },
      { id: 'rebalancing', name: 'Reequilíbrio', description: 'Harmonizar os chakras e centros de força', duration: '6-10 sessões' },
      { id: 'strengthening', name: 'Fortalecimento', description: 'Fortalece o campo energético', duration: ' ongoing' },
    ],
    duration: '1-6 meses',
    contraindications: ['Não substitui tratamento médico', 'Consulte profissionais qualificados'],
  },
  {
    id: 'spiritual-healing',
    type: 'spiritual',
    name: 'Cura Espiritual',
    nameEn: 'Spiritual Healing',
    description: 'Expansão da consciência e alinhamento com a dimensão espiritual para despertar e libertação.',
    methods: ['Meditação Espiritual', 'Oração', 'Rituais de Purificação', 'Trabalho com mestres ascensionados'],
    sefirot: ['Kether', 'Chokhmah', 'Binah'],
    chakras: ['Sahasrara (7º)', 'Ajna (6º)'],
    stages: [
      { id: 'purification', name: 'Purificação', description: 'Limpar corpo causal e centros superiores', duration: '3-6 meses' },
      { id: 'expansion', name: 'Expansão', description: 'Expandir consciência para dimensões superiores', duration: '6-12 meses' },
      { id: 'integration', name: 'Integração', description: 'Integrar experiência espiritual na vida cotidiana', duration: ' ongoing' },
    ],
    duration: '1-3 anos',
    contraindications: ['Requer acompanhamento espiritual adequado', 'Pode despertar forças dormentes'],
  },
  {
    id: 'karmic-healing',
    type: 'karmic',
    name: 'Cura Cármica',
    nameEn: 'Karmic Healing',
    description: 'Resolução de marcas cármicas eパターン (padrões) de vidas passadas que afetam a vida presente.',
    methods: ['Regressão a Vidas Passadas', 'Terapia de Vidas Passadas', 'Yoga Tântrico', 'Trabalho com Orixás'],
    sefirot: ['Daat', 'Tipheret'],
    chakras: ['Todos os chakras', 'Corpo Cármico'],
    stages: [
      { id: 'regression', name: 'Regressão', description: 'Access memories of past lives', duration: '2-5 sessões' },
      { id: 'understanding', name: 'Compreensão', description: 'Entender como padrões passados afetam o presente', duration: '3-6 sessões' },
      { id: 'forgiveness', name: 'Perdão', description: 'Perdoar a si mesmo e aos outros envolvidos', duration: '2-4 sessões' },
      { id: 'release', name: 'Libertação', description: 'Liberar cordões cármicos e padrões', duration: '4-8 sessões' },
      { id: 'renewal', name: 'Renovação', description: 'Criar novos padrões cármicos positivos', duration: ' ongoing' },
    ],
    duration: '1-2 anos',
    contraindications: ['Deve ser feito com profissional experiente', 'Pode trazer memórias dolorosas'],
  },
  {
    id: 'ancestral-healing',
    type: 'ancestral',
    name: 'Cura Ancestral',
    nameEn: 'Ancestral Healing',
    description: 'Libertação de padrões e energias herdadas da linhagem ancestral, purificação da herança familiar.',
    methods: ['Terapia Sistêmica', 'Constelação Familiar', 'Rituais Ancestrais', 'Oração aos Ancestrais'],
    sefirot: ['Yesod', 'Malkuth'],
    chakras: ['Muladhara (1º)', 'Coração Ancestral'],
    stages: [
      { id: 'mapping', name: 'Mapeamento', description: 'Identificar padrões ancestrais repetitivos', duration: '1-2 sessões' },
      { id: 'honoring', name: 'Honra', description: 'Honrar os ancestrais sem carregar seus fardos', duration: '2-4 sessões' },
      { id: 'releasing', name: 'Libertação', description: 'Soltar padrões que não pertencem a você', duration: '3-6 sessões' },
      { id: 'claiming', name: 'Reivindicação', description: 'Claim your own life and destiny', duration: ' ongoing' },
    ],
    duration: '6-18 meses',
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = HealingTypesQuerySchema.safeParse({
    type: searchParams.get('type'),
    limit: searchParams.get('limit'),
  });

  if (!parseResult.success) {
    return NextResponse.json({
      success: false,
      error: 'Parâmetros inválidos',
      details: parseResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  const { type, limit } = parseResult.data;
  let healingTypes = [...HEALING_TYPES];

  if (type) {
    healingTypes = healingTypes.filter(h => h.type === type);
  }

  if (limit) {
    healingTypes = healingTypes.slice(0, limit);
  }

  return NextResponse.json({
    success: true,
    healingTypes,
    count: healingTypes.length,
    total: HEALING_TYPES.length,
  });
}