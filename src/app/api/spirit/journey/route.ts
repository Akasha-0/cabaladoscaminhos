// ============================================================
// SPIRIT JOURNEY API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for spiritual journey
// - Journey stages and phases
// - Path guidance and milestones
// ============================================================
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const step = url.searchParams.get('step');

  const journeyPhases = [
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
    },
    {
      id: 'service',
      name: 'Service',
      namePt: 'Serviço',
      description: 'Using spiritual gifts in service to others and the world',
      descriptionPt: 'Usando dons espirituais em serviço aos outros e ao mundo',
      phases: [
        'discovering purpose',
        'developing mission',
        'full expression',
        'legacy creation',
      ],
      duration: 'lifelong',
      level: 'master',
    },
  ];

  // Return all phases if no specific step requested
  if (!step) {
    return NextResponse.json({
      data: journeyPhases.map((p) => ({
        id: p.id,
        name: p.name,
        namePt: p.namePt,
        description: p.description,
        level: p.level,
      })),
      total: journeyPhases.length,
      endpoints: {
        awakening: '/api/spirit/journey?step=awakening',
        purification: '/api/spirit/journey?step=purification',
        preparation: '/api/spirit/journey?step=preparation',
        innerwork: '/api/spirit/journey?step=innerwork',
        illumination: '/api/spirit/journey?step=illumination',
        union: '/api/spirit/journey?step=union',
        service: '/api/spirit/journey?step=service',
      },
    });
  }

  // Return specific journey step
  const phase = journeyPhases.find(
    (p) => p.id.toLowerCase() === step.toLowerCase()
  );

  if (!phase) {
    return NextResponse.json(
      {
        error: 'Invalid step. Available steps: awakening, purification, preparation, innerwork, illumination, union, service',
        availableSteps: journeyPhases.map((p) => p.id),
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    data: phase,
    step: phase.id,
  });
}
