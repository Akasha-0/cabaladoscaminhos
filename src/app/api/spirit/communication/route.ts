// ============================================================
// SPIRIT COMMUNICATION API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for spirit communication
// - Communication methods and channels
// - Mediumship guidance and practices
// ============================================================
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');

  const communicationMethods = [
    {
      id: 'mediumship',
      name: 'Mediumship',
      namePt: 'Mediunidade',
      description: 'Communication with spirits through various techniques',
      descriptionPt: 'Comunicação com espíritos através de várias técnicas',
      practices: [
        'channeling',
        'trance',
        'psychography',
        'psychometry',
        'clairsentience',
        'clairvoyance',
        'clairaudience',
        'automatic writing',
      ],
      level: 'advanced',
    },
    {
      id: 'channeling',
      name: 'Channeling',
      namePt: 'Canalização',
      description: 'Receiving messages from spirit guides and entities',
      descriptionPt: 'Receber mensagens de guias espirituais e entidades',
      practices: [
        'light channeling',
        'verbal channeling',
        'healing channeling',
        'teaching channeling',
      ],
      level: 'intermediate',
    },
    {
      id: 'psychography',
      name: 'Psychography',
      namePt: 'Psicografia',
      description: 'Automatic writing for spirit communication',
      descriptionPt: 'Escrita automática para comunicação espiritual',
      practices: [
        'spirit writing',
        'mediumistic writing',
        'inspirational writing',
      ],
      level: 'intermediate',
    },
    {
      id: 'psychometry',
      name: 'Psychometry',
      namePt: 'Psicometria',
      description: 'Reading energy from objects and places',
      descriptionPt: 'Leitura de energia de objetos e locais',
      practices: [
        'object reading',
        'place reading',
        'photoreading',
        'artifact reading',
      ],
      level: 'intermediate',
    },
    {
      id: 'divination',
      name: 'Spirit Divination',
      namePt: 'Divinação Espiritual',
      description: 'Spirit-guided divination practices',
      descriptionPt: 'Práticas de adivinhação guiada por espíritos',
      practices: [
        'spirit-guided tarot',
        'automatic divination',
        'guidance sessions',
        'prophetic readings',
      ],
      level: 'beginner',
    },
    {
      id: 'ancestral',
      name: 'Ancestral Communication',
      namePt: 'Comunicação Ancestral',
      description: 'Connecting with ancestors and lineage spirits',
      descriptionPt: 'Conectando-se com ancestrais e espíritos de linhagem',
      practices: [
        'altar work',
        'offering rituals',
        'ancestral invocations',
        'lineage healing',
      ],
      level: 'beginner',
    },
    {
      id: 'guidance',
      name: 'Spirit Guidance',
      namePt: 'Orientação Espiritual',
      description: 'Receiving guidance from spiritual entities',
      descriptionPt: 'Recebendo orientação de entidades espirituais',
      practices: [
        'guidance meditation',
        'prayer requests',
        'affirmation guidance',
        'decision support',
      ],
      level: 'beginner',
    },
  ];

  // Return available types if no specific type requested
  if (!type) {
    return NextResponse.json({
      data: communicationMethods.map((m) => ({
        id: m.id,
        name: m.name,
        namePt: m.namePt,
        description: m.description,
        level: m.level,
      })),
      total: communicationMethods.length,
      endpoints: {
        mediumship: '/api/spirit/communication?type=mediumship',
        channeling: '/api/spirit/communication?type=channeling',
        psychography: '/api/spirit/communication?type=psychography',
        psychometry: '/api/spirit/communication?type=psychometry',
        divination: '/api/spirit/communication?type=divination',
        ancestral: '/api/spirit/communication?type=ancestral',
        guidance: '/api/spirit/communication?type=guidance',
      },
    });
  }

  // Return specific communication type
  const method = communicationMethods.find(
    (m) => m.id.toLowerCase() === type.toLowerCase()
  );

  if (!method) {
    return NextResponse.json(
      {
        error: 'Invalid type. Available types: mediumship, channeling, psychography, psychometry, divination, ancestral, guidance',
        availableTypes: communicationMethods.map((m) => m.id),
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    data: method,
    type: method.id,
  });
}
