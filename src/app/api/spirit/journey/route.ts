// ============================================================
// SPIRIT JOURNEY API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for spiritual journey
// - Journey stages and phases
// - Path guidance and milestones
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

const SpiritJourneyQuerySchema = z.object({
  step: z.string().optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  orixa: z.string().optional(),
});

// ─── Spiritual Correlations for Journey Phases ──────────────────────────────────────────
const JOURNEY_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  awakening: {
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Oxalá',
    affirmation: 'Desperto para minha verdade interior',
    frequency: '741 Hz',
  },
  purification: {
    sefirot: ['Gevurah', 'Chesed'],
    chakra: 3,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'Libero tudo o que não me serve',
    frequency: '417 Hz',
  },
  preparation: {
    sefirot: ['Tipheret', 'Netzach'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'Construo uma base sólida para minha prática',
    frequency: '528 Hz',
  },
  illumination: {
    sefirot: ['Chokhmah', 'Binah'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Orunmilá',
    affirmation: 'A luz da sabedoria me ilumina',
    frequency: '741 Hz',
  },
  integration: {
    sefirot: ['Tipheret', 'Yesod'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Integro todas as partes de meu ser',
    frequency: '528 Hz',
  },
  service: {
    sefirot: ['Chesed', 'Netzach'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Sirvo como canal da luz divina',
    frequency: '528 Hz',
  },
  mastery: {
    sefirot: ['Kether', 'Malkuth'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Sou um com a consciência divina',
    frequency: '963 Hz',
  },
};

// ─── Journey Phases with Spiritual Correlations ──────────────────────────────────────────
const JOURNEY_PHASES = [
  {
    id: 'awakening',
    name: 'Awakening',
    namePt: 'Despertar',
    description: 'The beginning of spiritual awareness and recognition of the soul path',
    descriptionPt: 'O início da consciência espiritual e reconhecimento do caminho da alma',
    phases: [
      'initial awakening',
      'consciousness expansion',
      'first spiritual experiences',
    ],
    duration: 'varies',
    level: 'beginner',
    element: 'Fogo',
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 6,
    orixa: ['Oxalá', 'Orunmilá'],
    keyPractice: 'Meditação de despertar',
    affirmations: ['Desperto para minha verdade interior', 'Minhas percepções se expandem'],
    warnings: ['Cuidado com experiências egoicas', 'Mantenha o discernimento'],
    spiritualCorrelations: JOURNEY_SPIRITUAL_CORRELATIONS['awakening'],
  },
  {
    id: 'purification',
    name: 'Purification',
    namePt: 'Purificação',
    description: 'Cleansing of mind, body and spirit to prepare for deeper work',
    descriptionPt: 'Purificação de mente, corpo e espírito para preparar para trabalhos mais profundos',
    phases: [
      'physical purification',
      'emotional cleansing',
      'mental clarity',
      'spiritual detox',
    ],
    duration: 'ongoing',
    level: 'beginner',
    element: 'Água',
    sefirot: ['Gevurah', 'Chesed'],
    chakra: 3,
    orixa: ['Iemanjá', 'Omolu'],
    keyPractice: 'Banho de purificação',
    affirmations: ['Libero tudo o que não me serve', 'Minha energia é limpa e clara'],
    warnings: ['Não adie a limpeza emocional', 'Busque apoio se necessário'],
    spiritualCorrelations: JOURNEY_SPIRITUAL_CORRELATIONS['purification'],
  },
  {
    id: 'preparation',
    name: 'Preparation',
    namePt: 'Preparação',
    description: 'Building the foundation for spiritual practice and development',
    descriptionPt: 'Construindo a base para prática e desenvolvimento espiritual',
    phases: [
      'establishing practice',
      'learning techniques',
      'building discipline',
      'developing sensitivity',
    ],
    duration: '1-3 years',
    level: 'beginner',
    element: 'Fogo',
    sefirot: ['Tipheret', 'Netzach'],
    chakra: 4,
    orixa: ['Ogum'],
    keyPractice: 'Prática diária consistente',
    affirmations: ['Construo uma base sólida para minha prática', 'A disciplina me fortalece'],
    warnings: ['Não pule a preparação', 'Respeite o tempo de maturação'],
    spiritualCorrelations: JOURNEY_SPIRITUAL_CORRELATIONS['preparation'],
  },
  {
    id: 'illumination',
    name: 'Illumination',
    namePt: 'Iluminação',
    description: 'Deepening spiritual insight and wisdom through direct experience',
    descriptionPt: 'Aprofundando insight espiritual e sabedoria através da experiência direta',
    phases: [
      'third eye opening',
      'intuitive development',
      'mystical experiences',
      'wisdom integration',
    ],
    duration: 'ongoing',
    level: 'intermediate',
    element: 'Fogo',
    sefirot: ['Chokhmah', 'Binah'],
    chakra: 6,
    orixa: ['Orunmilá'],
    keyPractice: 'Meditação de terceiro olho',
    affirmations: ['A luz da sabedoria me ilumina', 'Vejo além das ilusões'],
    warnings: ['Mantenha os pés no chão', 'Integre antes de expandir'],
    spiritualCorrelations: JOURNEY_SPIRITUAL_CORRELATIONS['illumination'],
  },
  {
    id: 'integration',
    name: 'Integration',
    namePt: 'Integração',
    description: 'Unifying spiritual experiences with daily life and identity',
    descriptionPt: 'Unificando experiências espirituais com a vida diária e identidade',
    phases: [
      'identity merging',
      'lifestyle integration',
      'relationship transformation',
      'purpose clarification',
    ],
    duration: 'ongoing',
    level: 'intermediate',
    element: 'Fogo',
    sefirot: ['Tipheret', 'Yesod'],
    chakra: 4,
    orixa: ['Oxum'],
    keyPractice: 'Journaling e reflexão',
    affirmations: ['Integro todas as partes de meu ser', 'Sou wholeness'],
    warnings: ['Resista à fragmentação', 'Honre todas as dimensões'],
    spiritualCorrelations: JOURNEY_SPIRITUAL_CORRELATIONS['integration'],
  },
  {
    id: 'service',
    name: 'Service',
    namePt: 'Serviço',
    description: 'Using spiritual gifts in service to others and the collective',
    descriptionPt: 'Usando dons espirituais em serviço aos outros e ao coletivo',
    phases: [
      'gift identification',
      'service practice',
      'community building',
      'collective healing',
    ],
    duration: 'ongoing',
    level: 'advanced',
    element: 'Fogo',
    sefirot: ['Chesed', 'Netzach'],
    chakra: 4,
    orixa: ['Oxum'],
    keyPractice: 'Trabalho de cura ou ensino',
    affirmations: ['Sirvo como canal da luz divina', 'O serviço me realiz'],
    warnings: ['Evite o desgaste', 'Mantenha limites saudáveis'],
    spiritualCorrelations: JOURNEY_SPIRITUAL_CORRELATIONS['service'],
  },
  {
    id: 'mastery',
    name: 'Mastery',
    namePt: 'Mestria',
    description: 'Achieving spiritual mastery and becoming a teacher/guide',
    descriptionPt: 'Alcançando mestria espiritual e tornando-se um professor/guia',
    phases: [
      'deep embodiment',
      'teaching development',
      'lineage building',
      'consciousness expansion',
    ],
    duration: 'lifetime',
    level: 'advanced',
    element: 'Éter',
    sefirot: ['Kether', 'Malkuth'],
    chakra: 7,
    orixa: ['Oxalá'],
    keyPractice: 'Transmissão direta',
    affirmations: ['Sou um com a consciência divina', 'A mestria é meu caminho'],
    warnings: ['A humildade é essencial', 'O ego pode se disfarçar'],
    spiritualCorrelations: JOURNEY_SPIRITUAL_CORRELATIONS['mastery'],
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams();
    const parseResult = SpiritJourneyQuerySchema.safeParse({
      step: searchParams.get('step'),
      sefirot: searchParams.get('sefirot'),
      chakra: searchParams.get('chakra'),
      element: searchParams.get('element'),
      level: searchParams.get('level'),
      orixa: searchParams.get('orixa'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { step, sefirot, chakra, element, level, orixa } = parseResult.data;
    let phases = [...JOURNEY_PHASES];

    if (step) {
      phases = phases.filter(p => p.id === step);
    }

    if (level) {
      phases = phases.filter(p => p.level === level);
    }

    if (sefirot) {
      phases = phases.filter(p => p.spiritualCorrelations?.sefirot.includes(sefirot));
    }

    if (chakra) {
      phases = phases.filter(p => p.spiritualCorrelations?.chakra === chakra);
    }

    if (element) {
      phases = phases.filter(p => p.spiritualCorrelations?.element === element);
    }

    if (orixa) {
      phases = phases.filter(p => p.spiritualCorrelations?.orixa === orixa);
    }

    // Calculate spiritual stats
    const spiritualStats = {
      byLevel: phases.reduce((acc, p) => {
        acc[p.level] = (acc[p.level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySefirot: phases.reduce((acc, p) => {
        p.spiritualCorrelations?.sefirot.forEach(s => {
          acc[s] = (acc[s] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      byChakra: phases.reduce((acc, p) => {
        const c = p.spiritualCorrelations?.chakra;
        if (c) acc[c] = (acc[c] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byElement: phases.reduce((acc, p) => {
        const e = p.spiritualCorrelations?.element;
        if (e) acc[e] = (acc[e] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byOrixa: phases.reduce((acc, p) => {
        const o = p.spiritualCorrelations?.orixa;
        if (o) acc[o] = (acc[o] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      phases,
      count: phases.length,
      spiritualCorrelations: JOURNEY_SPIRITUAL_CORRELATIONS,
      spiritualStats,
      meta: {
        filters: { step, sefirot, chakra, element, level, orixa },
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}