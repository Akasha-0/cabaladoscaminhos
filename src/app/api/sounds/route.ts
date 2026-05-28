// Sacred Sounds API - Cabala Dos Caminhos
// Sacred frequencies, healing sounds, and spiritual audio for rituals and practices

import { NextRequest, NextResponse } from 'next/server';

const SACRED_SOUNDS = {
  om: {
    id: 'om',
    name: 'Om (Aum)',
    frequency: '432 Hz',
    origin: 'Hindu/Buddhist',
    description: 'O som primordial do universo, símbolo da essência divina',
    chakra: 'Anahata',
    usage: 'Meditação, oração, alinhamento espiritual',
    benefits: ['Expansão de consciência', 'Harmonização celular', 'Paz interior'],
  },
  amen: {
    id: 'amen',
    name: 'Amen',
    frequency: '528 Hz',
    origin: 'Hebrew/Catholic',
    description: 'Som de encerramento sagrado, significa verdade e fidelidade',
    chakra: 'Sahasrara',
    usage: 'Bênçãos, confirmações, proteção',
    benefits: ['Transformaçăo energética', 'Ativaçăo DNA', 'Manifestaçăo'],
  },
  shalom: {
    id: 'shalom',
    name: 'Shalom',
    frequency: '396 Hz',
    origin: 'Hebrew',
    description: 'Saudação de paz e completude divina',
    chakra: 'Ajna',
    usage: 'Harmonizaçăo, reconciliaçăo, cura',
    benefits: ['Libertaçăo de medos', 'Harmonia familiar', 'Perdăo'],
  },
  om_mani_padme: {
    id: 'om_mani_padme',
    name: 'Om Mani Padme Hum',
    frequency: '432 Hz',
    origin: 'Tibetan Buddhist',
    description: 'Mantra da compaixăo infinita de Avalokiteshvara',
    chakra: 'Anahata',
    usage: 'Compassăo, sabedoria, protegeçăo',
    benefits: ['Desperta empatia', 'Purifica mente', 'Abre coraçăo'],
  },
  amen_ra: {
    id: 'amen_ra',
    name: 'Amen-Ra',
    frequency: '417 Hz',
    origin: 'Egyptian',
    description: 'Sons do Deus Sol, frequências dos faraós para renascimento',
    chakra: 'Manipura',
    usage: 'Renascimento espiritual, poder pessoal',
    benefits: ['Desperta poder interior', 'Alinha com propósito', 'Fortalece vontade'],
  },
  karakia: {
    id: 'karakia',
    name: 'Karakia',
    frequency: '528 Hz',
    origin: 'Māori',
    description: 'Orações ancestrais maoris para proteçăo e bênçăo',
    chakra: 'Muladhara',
    usage: 'Proteçăo, bênçăo, conexăo ancestral',
    benefits: ['Ancestralidade', 'Força', 'Protecçăo'],
  },
  orixa: {
    id: 'orixa',
    name: 'Sons dos Orixás',
    frequency: '396-528 Hz',
    origin: 'Yoruba/Afro-Brazilian',
    description: 'Frequências sagradas dos orixás: Oxalá, Iemanjá, Ogum, Xangô',
    chakra: 'Vários conforme orixá',
    usage: 'Rituais de candomblé, ofertas, bênçãos',
    benefits: ['Conexăo orixás', 'Ancestralidade africana', 'Cura collective'],
  },
} as const;

const FREQUENCIES = {
  '174': { hz: 174, name: 'Frequência da Saúde', effect: 'Analgésico natural' },
  '285': { hz: 285, name: 'Frequência da Cicatrização Tecidual', effect: 'Regeneração celular' },
  '396': { hz: 396, name: 'Libertação do Medo e Culpa', effect: 'Desbloqueio emocional' },
  '417': { hz: 417, name: 'Facilitação da Mudança', effect: 'Transições de vida' },
  '432': { hz: 432, name: 'Armonização Universal', effect: 'Paz e sintonia' },
  '528': { hz: 528, name: 'Transformação e Milagres', effect: 'DNA repairs, love frequency' },
  '639': { hz: 639, name: 'Harmonia nas Relações', effect: 'Conexões harmoniosas' },
  '741': { hz: 741, name: 'Despertar da Intuição', effect: 'Expansão espiritual' },
  '852': { hz: 852, name: 'Despertar Spiritual', effect: 'Terceiro olho' },
  '963': { hz: 963, name: 'Frequência Divina', effect: 'Ligação com o Uno' },
} as const;

const HEALING_RITUALS = [
  {
    id: 'auricular-healing',
    name: 'Cura Auricular',
    sounds: ['om', 'shalom'],
    duration: 15,
    description: 'Cura através dos sons aplicada aos chakras',
  },
  {
    id: 'solfeggio-awakening',
    name: 'Despertar Solfeggio',
    sounds: ['om', 'om_mani_padme'],
    duration: 30,
    description: 'Ativação das frequências Solfeggio para despertar',
  },
  {
    id: 'orixa-connection',
    name: 'Conexão com Orixás',
    sounds: ['orixa'],
    duration: 45,
    description: 'Ritual de conexăo com as energias dos orixás',
  },
  {
    id: 'egyptian-resurrection',
    name: 'Ressurreição Egípcia',
    sounds: ['amen_ra', 'amen'],
    duration: 20,
    description: 'Ritual de renascimento espiritual egípcio',
  },
] as const;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  const id = searchParams.get('id');
  const frequency = searchParams.get('frequency');
  const category = searchParams.get('category');

  try {
    // GET /api/sounds - List all sacred sounds
    if (!action) {
      return NextResponse.json({
        success: true,
        data: {
          sounds: Object.values(SACRED_SOUNDS),
          frequencies: Object.values(FREQUENCIES),
          rituals: HEALING_RITUALS,
        },
      });
    }

    // GET /api/sounds?action=list - List all sounds
    if (action === 'list') {
      return NextResponse.json({
        success: true,
        data: {
          sounds: Object.values(SACRED_SOUNDS),
        },
      });
    }

    // GET /api/sounds?action=sound&id=om - Get specific sound
    if (action === 'sound' && id) {
      const sound = SACRED_SOUNDS[id as keyof typeof SACRED_SOUNDS];
      if (!sound) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'NOT_FOUND', message: `Sacred sound '${id}' not found` },
          },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: { sound },
      });
    }

    // GET /api/sounds?action=frequencies - List all frequencies
    if (action === 'frequencies') {
      return NextResponse.json({
        success: true,
        data: {
          frequencies: Object.values(FREQUENCIES),
        },
      });
    }

    // GET /api/sounds?action=frequency&frequency=432 - Get frequency details
    if (action === 'frequency' && frequency) {
      const freq = FREQUENCIES[frequency as keyof typeof FREQUENCIES];
      if (!freq) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'NOT_FOUND', message: `Frequency '${frequency}' not found` },
          },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: { frequency: freq },
      });
    }

    // GET /api/sounds?action=rituals - List healing rituals
    if (action === 'rituals') {
      return NextResponse.json({
        success: true,
        data: {
          rituals: HEALING_RITUALS,
        },
      });
    }

    // GET /api/sounds?action=ritual&id=auricular-healing - Get specific ritual
    if (action === 'ritual' && id) {
      const ritual = HEALING_RITUALS.find((r) => r.id === id);
      if (!ritual) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'NOT_FOUND', message: `Ritual '${id}' not found` },
          },
          { status: 404 }
        );
      }
      const sounds = ritual.sounds.map((soundId) => SACRED_SOUNDS[soundId as keyof typeof SACRED_SOUNDS]);
      return NextResponse.json({
        success: true,
        data: { ritual, sounds },
      });
    }

    // GET /api/sounds?action=by-chakra&category=Anahata - Get sounds by chakra
    if (action === 'by-chakra' && category) {
      const sounds = Object.values(SACRED_SOUNDS).filter(
        (s) => s.chakra.toLowerCase() === category.toLowerCase()
      );
      return NextResponse.json({
        success: true,
        data: { chakra: category, sounds },
      });
    }

    // GET /api/sounds?action=by-origin&category=Egyptian - Get sounds by origin
    if (action === 'by-origin' && category) {
      const sounds = Object.values(SACRED_SOUNDS).filter(
        (s) => s.origin.toLowerCase().includes(category.toLowerCase())
      );
      return NextResponse.json({
        success: true,
        data: { origin: category, sounds },
      });
    }

    // Unknown action
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_ACTION',
          message: `Unknown action '${action}'. Valid actions: list, sound, frequencies, frequency, rituals, ritual, by-chakra, by-origin`,
        },
      },
      { status: 400 }
    );
  } catch (err) {
    console.error('Sacred Sounds API error:', err);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      },
      { status: 500 }
    );
  }
}