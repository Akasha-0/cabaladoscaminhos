import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { parseSpiritualFilters } from '@/lib/api/parse-spiritual-filters';

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
  spiritualCorrelations: z.object({
    sefirot: z.array(z.string()),
    chakra: z.number(),
    element: z.string(),
    orixa: z.string(),
    affirmation: z.string(),
    frequency: z.string(),
  }).optional(),
});

const HealingTypesQuerySchema = z.object({
  type: HealingTypeSchema.optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
});

// ─── Spiritual Correlations for Healing Types ──────────────────────────────────────────
const HEALING_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  'mental-healing': {
    sefirot: ['Gevurah', 'Hod'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Oxalá',
    affirmation: 'Minha mente está clara e em paz',
    frequency: '741 Hz',
  },
  'emotional-healing': {
    sefirot: ['Tipheret', 'Netzach'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Minhas emoções fluem em harmonia',
    frequency: '528 Hz',
  },
  'physical-healing': {
    sefirot: ['Malkuth', 'Yesod'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Ogum',
    affirmation: 'Meu corpo é templo de saúde e vitalidade',
    frequency: '174 Hz',
  },
  'spiritual-healing': {
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Minha essência espiritual está em paz',
    frequency: '963 Hz',
  },
  'karmic-healing': {
    sefirot: ['Binah', 'Gevurah'],
    chakra: 6,
    element: 'Água',
    orixa: 'Nanã',
    affirmation: 'Libero os pesos do karma ancestral',
    frequency: '639 Hz',
  },
  'ancestral-healing': {
    sefirot: ['Yesod', 'Malkuth'],
    chakra: 2,
    element: 'Água',
    orixa: 'Nanã',
    affirmation: 'A cura ancestral flui através de mim',
    frequency: '285 Hz',
  },
};

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
    spiritualCorrelations: HEALING_SPIRITUAL_CORRELATIONS['mental-healing'],
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
    spiritualCorrelations: HEALING_SPIRITUAL_CORRELATIONS['emotional-healing'],
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
    spiritualCorrelations: HEALING_SPIRITUAL_CORRELATIONS['physical-healing'],
  },
  {
    id: 'spiritual-healing',
    type: 'spiritual',
    name: 'Cura Espiritual',
    nameEn: 'Spiritual Healing',
    description: 'Conexão com a essência divina e purificação da alma para restauração da paz interior.',
    methods: ['Oração', 'Meditação profunda', 'Ritual sagrado', 'Desprendimento do ego'],
    sefirot: ['Kether', 'Chokhmah'],
    chakras: ['Sahasrara (7º)', 'Ajna (6º)'],
    stages: [
      { id: 'connection', name: 'Conexão', description: 'Estabelecer conexão com a fonte divina', duration: '1-4 semanas' },
      { id: 'purification', name: 'Purificação', description: 'Limpar energética e emotional clutter', duration: '2-8 semanas' },
      { id: 'illumination', name: 'Iluminação', description: 'Despertar para verdades superiores', duration: ' ongoing' },
    ],
    duration: '3-12 meses',
    spiritualCorrelations: HEALING_SPIRITUAL_CORRELATIONS['spiritual-healing'],
  },
  {
    id: 'karmic-healing',
    type: 'karmic',
    name: 'Cura Cármica',
    nameEn: 'Karmic Healing',
    description: 'Trabalho de libertação de padrões cármicos herdados de vidas passadas e resolução de dívida espiritual.',
    methods: ['Regression Therapy', 'Karmic Astrology', 'Ritual de desvinculação', 'Tarot Cármico'],
    sefirot: ['Binah', 'Gevurah'],
    chakras: ['Ajna (6º)', 'Anahata (4º)'],
    stages: [
      { id: 'identification', name: 'Identificação', description: 'Identificar padrões cármicos recorrentes', duration: '2-4 semanas' },
      { id: 'understanding', name: 'Compreensão', description: 'Compreender a origem e propósito do karma', duration: '4-8 semanas' },
      { id: 'resolution', name: 'Resolução', description: 'Realizar rituais de libertação cármica', duration: '8-16 semanas' },
      { id: 'integration', name: 'Integração', description: 'Integrar a liberdade conquistada', duration: ' ongoing' },
    ],
    duration: '6-18 meses',
    contraindications: ['Não recomendado para pessoas com histórico de transtornos dissociativos'],
    spiritualCorrelations: HEALING_SPIRITUAL_CORRELATIONS['karmic-healing'],
  },
  {
    id: 'ancestral-healing',
    type: 'ancestral',
    name: 'Cura Ancestral',
    nameEn: 'Ancestral Healing',
    description: 'Trabalho de cura com a linhagem familiar, resolvendo padrões transgeracionais e honrando os ancestrais.',
    methods: ['Constelações Familiares', 'Genealogia Espiritual', 'Ritual Ancestral', 'Terapia Sistêmica'],
    sefirot: ['Yesod', 'Malkuth'],
    chakras: ['Muladhara (1º)', 'Svadhisthana (2º)'],
    stages: [
      { id: 'mapping', name: 'Mapeamento', description: 'Mapear a árvore familiar e padrões', duration: '2-4 semanas' },
      { id: 'honoring', name: 'Honrar', description: 'Honrar os ancestrais e reconhecer dívidas', duration: '4-8 semanas' },
      { id: 'liberation', name: 'Libertação', description: 'Libertar padrões que não servem mais', duration: '8-16 semanas' },
      { id: 'integration', name: 'Integração', description: 'Assumir seu lugar na linhagem', duration: ' ongoing' },
    ],
    duration: '6-12 meses',
    spiritualCorrelations: HEALING_SPIRITUAL_CORRELATIONS['ancestral-healing'],
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parsed = parseSpiritualFilters(searchParams, 'type');
    if (!parsed.ok) return parsed.response;
    const { sefirot, chakra, element, orixa } = parsed.data;

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

    if (sefirot) {
      healingTypes = healingTypes.filter(h => h.spiritualCorrelations?.sefirot.includes(sefirot));
    }

    if (chakra) {
      healingTypes = healingTypes.filter(h => h.spiritualCorrelations?.chakra === chakra);
    }

    if (element) {
      healingTypes = healingTypes.filter(h => h.spiritualCorrelations?.element === element);
    }

    if (orixa) {
      healingTypes = healingTypes.filter(h => h.spiritualCorrelations?.orixa === orixa);
    }

    if (limit && healingTypes.length > limit) {
      healingTypes = healingTypes.slice(0, limit);
    }

    // Calculate spiritual stats
    const spiritualStats = {
      byType: healingTypes.reduce((acc, h) => {
        acc[h.type] = (acc[h.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySefirot: healingTypes.reduce((acc, h) => {
        h.spiritualCorrelations?.sefirot.forEach(s => {
          acc[s] = (acc[s] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      byChakra: healingTypes.reduce((acc, h) => {
        const c = h.spiritualCorrelations?.chakra;
        if (c) acc[c] = (acc[c] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byElement: healingTypes.reduce((acc, h) => {
        const e = h.spiritualCorrelations?.element;
        if (e) acc[e] = (acc[e] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byOrixa: healingTypes.reduce((acc, h) => {
        const o = h.spiritualCorrelations?.orixa;
        if (o) acc[o] = (acc[o] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      healingTypes,
      count: healingTypes.length,
      spiritualCorrelations: HEALING_SPIRITUAL_CORRELATIONS,
      spiritualStats,
      meta: {
        filters: { type, limit, sefirot, chakra, element, orixa },
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}