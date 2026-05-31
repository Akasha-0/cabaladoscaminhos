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
});

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
    duration: 'months to years',
    level: 'intermediate',
    element: 'Terra',
    sefirot: ['Malkuth', 'Yesod'],
    chakra: 1,
    orixa: ['Ogum', 'Oxalá'],
    keyPractice: 'Prática diária consistente',
    affirmations: ['Construo uma base sólida para meu crescimento', 'Minha disciplina é inabalável'],
    warnings: ['Evite promessas irreais', 'Respeite seu ritmo'],
  },
  {
    id: 'innerwork',
    name: 'Inner Work',
    namePt: 'Trabalho Interior',
    description: 'Deep exploration of psyche, shadow work and integration',
    descriptionPt: 'Exploração profunda da psique, trabalho das sombras e integração',
    phases: [
      'shadow integration',
      'healing wounds',
      'integrating fragments',
      'becoming whole',
    ],
    duration: 'years',
    level: 'intermediate',
    element: 'Terra',
    sefirot: ['Tipheret', 'Hod'],
    chakra: 4,
    orixa: ['Omolu', 'Oxum'],
    keyPractice: 'Trabalho das sombras',
    affirmations: ['Integro todas as partes de mim', 'A cura acontece em profundidade'],
    warnings: ['Busque apoio terapêutico se necessário', 'Honre seus limites'],
  },
  {
    id: 'illumination',
    name: 'Illumination',
    namePt: 'Iluminação',
    description: 'Receiving wisdom, insight and spiritual understanding',
    descriptionPt: 'Recebendo sabedoria, compreensão e conhecimento espiritual',
    phases: [
      'discernment development',
      'wisdom integration',
      'teaching presence',
      'sharing gifts',
    ],
    duration: 'ongoing',
    level: 'advanced',
    element: 'Fogo',
    sefirot: ['Chokhmah', 'Binah'],
    chakra: 5,
    orixa: ['Orunmilá', 'Oxalá'],
    keyPractice: 'Estudo e contemplação',
    affirmations: ['A sabedoria flui através de mim', 'Compartilho luz com autenticidade'],
    warnings: ['Evite o orgulho espiritual', 'Mantenha a humildade'],
  },
  {
    id: 'union',
    name: 'Union',
    namePt: 'União',
    description: 'Integration with higher self and divine consciousness',
    descriptionPt: 'Integração com o eu superior e consciência divina',
    phases: [
      'self-realization',
      'ego dissolution',
      'consciousness expansion',
      'unity awareness',
    ],
    duration: 'lifelong',
    level: 'advanced',
    element: 'Éter',
    sefirot: ['Kether', 'Tipheret'],
    chakra: 7,
    orixa: ['Oxalá'],
    keyPractice: 'Meditação de unidade',
    affirmations: ['Sou um com o divino', 'A consciência expande-se infinitamente'],
    warnings: ['Integre a experiência com os vivos', 'Não se perca no transcendental'],
  },
 {
    id: 'integration',
    name: 'Integration',
    namePt: 'Integração',
    description: 'Bringing together all learned wisdom into daily life',
    descriptionPt: 'Trazendo toda a sabedoria aprendida para a vida diária',
    phases: [
      'embodying wisdom',
      'living truth',
      'service to others',
      'ongoing evolution',
    ],
    duration: 'lifelong',
    level: 'advanced',
    element: 'Fogo',
    sefirot: ['Chesed', 'Netzach'],
    chakra: 4,
    orixa: ['Oxum', 'Iemanjá'],
    keyPractice: 'Serviço consciente',
    affirmations: [' Vivo minha verdade diariamente', 'O serviço é minha expressão de gratidão'],
    warnings: ['Não negligencie o mundo material', 'Mantenha o equilíbrio'],
  },
  {
    id: 'transmission',
    name: 'Transmission',
    namePt: 'Transmissão',
    description: 'Becoming a channel for spiritual wisdom to flow to others',
    descriptionPt: 'Tornando-se um canal para a sabedoria espiritual fluir para outros',
    phases: [
      'preparing vessel',
      'receiving transmission',
      'purifying channel',
      'sharing light',
    ],
    duration: 'lifelong',
    level: 'advanced',
    element: 'Ar',
    sefirot: ['Chokhmah', 'Netzach'],
    chakra: 6,
    orixa: ['Oxalá', 'Orunmilá'],
    keyPractice: 'Retiros e práticas de silêncio',
    affirmations: ['Sou um canal limpo para a luz', 'A sabedoria flui através de mim'],
    warnings: ['Purifique-se constantemente', 'Honre a responsabilidade'],
  },
];

// ─── Milestones with Spiritual Correlations ──────────────────────────────────────────
const JOURNEY_MILESTONES = [
  {
    id: 'first-meditation',
    name: 'First Meditation',
    namePt: 'Primeira Meditação',
    phase: 'awakening',
    sefirot: ['Kether'],
    chakra: 7,
    description: 'Successfully completing first structured meditation practice',
  },
  {
    id: 'energy-awareness',
    name: 'Energy Awareness',
    namePt: 'Percepção de Energia',
    phase: 'awakening',
    sefirot: ['Yesod'],
    chakra: 6,
    description: 'First conscious perception of subtle energy in the body',
  },
  {
    id: 'shadow-recognition',
    name: 'Shadow Recognition',
    namePt: 'Reconhecimento da Sombra',
    phase: 'innerwork',
    sefirot: ['Hod'],
    chakra: 4,
    description: 'Acknowledging and owning repressed aspects of personality',
  },
  {
    id: 'past-life-awareness',
    name: 'Past Life Awareness',
    namePt: 'Percepção de Vidas Passadas',
    phase: 'innerwork',
    sefirot: ['Binah'],
    chakra: 6,
    description: 'First clear memory or insight from past incarnations',
  },
  {
    id: 'sefirot-connection',
    name: 'Sefirot Connection',
    namePt: 'Conexão com os Sefirot',
    phase: 'illumination',
    sefirot: ['Tipheret'],
    chakra: 5,
    description: 'Direct experiential connection with the Tree of Life',
 },
  {
    id: 'orixa-recognition',
    name: 'Orixá Recognition',
    namePt: 'Reconhecimento do Orixá',
    phase: 'illumination',
    sefirot: ['Chesed'],
    chakra: 4,
    description: 'Clear recognition of personal Orixá and ability to communicate',
 },
  {
    id: 'unity-experience',
    name: 'Unity Experience',
    namePt: 'Experiência de Unidade',
    phase: 'union',
    sefirot: ['Kether'],
    chakra: 7,
    description: 'First conscious experience of unity with divine consciousness',
 },
  {
    id: 'service-activation',
    name: 'Service Activation',
    namePt: 'Ativação do Serviço',
    phase: 'integration',
    sefirot: ['Netzach'],
    chakra: 4,
    description: 'Clear call to serve others through spiritual gifts',
  },
];

// ─── API Route Handlers ──────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams();

    const parseResult = SpiritJourneyQuerySchema.safeParse({
      step: searchParams.get('step'),
      sefirot: searchParams.get('sefirot'),
      chakra: searchParams.get('chakra'),
      element: searchParams.get('element'),
      level: searchParams.get('level'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { step, sefirot, chakra, element, level } = parseResult.data;

    let phases = [...JOURNEY_PHASES];

    // Filter by step
    if (step) {
      phases = phases.filter(p => p.id === step);
    }

    // Filter by spiritual correlations
    if (sefirot) {
      phases = phases.filter(p => p.sefirot.includes(sefirot));
    }
    if (chakra) {
      phases = phases.filter(p => p.chakra === chakra);
    }
    if (element) {
      phases = phases.filter(p => p.element === element);
    }
    if (level) {
      phases = phases.filter(p => p.level === level);
    }

    // Statistics
    const stats = {
      byLevel: JOURNEY_PHASES.reduce((acc, p) => {
        acc[p.level] = (acc[p.level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byElement: JOURNEY_PHASES.reduce((acc, p) => {
        acc[p.element] = (acc[p.element] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byChakra: JOURNEY_PHASES.reduce((acc, p) => {
        acc[p.chakra] = (acc[p.chakra] || 0) + 1;
        return acc;
      }, {} as Record<number, number>),
      bySefirot: JOURNEY_PHASES.reduce((acc, p) => {
        p.sefirot.forEach(sf => {
          acc[sf] = (acc[sf] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      totalPhases: JOURNEY_PHASES.length,
      totalMilestones: JOURNEY_MILESTONES.length,
    };

    return NextResponse.json({
      success: true,
      phases,
      milestones: JOURNEY_MILESTONES,
      total: phases.length,
      stats,
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${err.message}`,
    }, { status: 500 });
  }
}