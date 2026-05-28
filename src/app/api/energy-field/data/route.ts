// ============================================================
// ENERGY FIELD API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for energy field data
// - List all energy field information
// - Get specific energy field type by ID
// - Get energy field characteristics
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface EnergyFieldLayer {
  id: string;
  name: string;
  namePt: string;
  description: string;
  descriptionPt: string;
  color: string;
  frequency: string;
  distance: string;
  properties: string[];
  functions: string[];
  healingPractices: string[];
}

interface EnergyFieldType {
  id: string;
  name: string;
  namePt: string;
  description: string;
  descriptionPt: string;
  category: string;
  intensity: string;
  characteristics: string[];
  balancingPractices: string[];
}

interface EnergyFieldData {
  id: string;
  name: string;
  namePt: string;
  description: string;
  descriptionPt: string;
  coreConcept: string;
  colors: string[];
  frequencies: string[];
  locations: string[];
  qualities: string[];
  associatedChakras: string[];
  cleansingMethods: string[];
  strengtheningPractices: string[];
}

const energyFieldLayers: EnergyFieldLayer[] = [
  {
    id: 'etheric',
    name: 'Etheric Field',
    namePt: 'Campo Etérico',
    description: 'The etheric body is the life force energy that sustains physical existence. It is the closest layer to the physical body and appears as a luminous grid connecting all living things.',
    descriptionPt: 'O corpo etérico é a energia vital que sustenta a existência física. É a camada mais próxima do corpo físico e aparece como uma grade luminosa conectando todos os seres vivos.',
    color: 'Blue-violet',
    frequency: 'High',
    distance: 'Within 1-2 inches of body',
    properties: ['Life force', 'Vitality', 'Physical sustenance', 'Health aura'],
    functions: ['Sustains physical body', 'Connects to Earth energy', 'Regulates health'],
    healingPractices: ['Reiki', 'Etheric healing', 'Vital energy work', 'Breath work'],
  },
  {
    id: 'emotional',
    name: 'Emotional Field',
    namePt: 'Campo Emocional',
    description: 'The emotional body radiates feelings and sensations. It is often perceived as colorful, fluid energy that changes rapidly based on emotional state.',
    descriptionPt: 'O corpo emocional irradia sentimentos e sensações. É frequentemente percebido como energia colorida e fluida que muda rapidamente baseado no estado emocional.',
    color: 'Pink, green, yellow (emotion-dependent)',
    frequency: 'Medium-high',
    distance: '2-4 inches from body',
    properties: ['Feeling body', 'Emotional center', 'Heart connection', 'Fluid motion'],
    functions: ['Processes emotions', 'Creates emotional boundaries', 'Connects heart to others'],
    healingPractices: ['Emotional release', 'Heart-centered work', 'Color therapy', 'Journaling'],
  },
  {
    id: 'mental',
    name: 'Mental Field',
    namePt: 'Campo Mental',
    description: 'The mental body contains thoughts, beliefs, and mental patterns. It appears as geometric and crystalline structures that reflect the mind at work.',
    descriptionPt: 'O corpo mental contém pensamentos, crenças e padrões mentais. Aparece como estruturas geométricas e cristalinas que refletem a mente em trabalho.',
    color: 'Yellow, gold',
    frequency: 'High',
    distance: '4-8 inches from body',
    properties: ['Thought forms', 'Belief structures', 'Intellectual clarity', 'Mental boundaries'],
    functions: ['Creates thought patterns', 'Holds beliefs', 'Processes information'],
    healingPractices: ['Meditation', 'Affirmations', 'Cognitive restructuring', 'Visualization'],
  },
  {
    id: 'astral',
    name: 'Astral Field',
    namePt: 'Campo Astral',
    description: 'The astral body connects the physical self to higher realms. It resonates with love, compassion, and spiritual insights during out-of-body experiences.',
    descriptionPt: 'O corpo astral conecta o eu físico aos reinos superiores. Ressoa com amor, compaixão e insights espirituais durante experiências fora do corpo.',
    color: 'Violet, magenta, silver',
    frequency: 'Very high',
    distance: '8-12 inches from body',
    properties: ['Spiritual connection', 'Love and wisdom', 'Travel consciousness', 'Dream body'],
    functions: ['Enables astral travel', 'Connects to higher self', 'Processes spiritual insights'],
    healingPractices: ['Astral projection', 'Dream work', 'Spiritual meditation', 'Remote viewing'],
  },
  {
    id: 'etheric-template',
    name: 'Etheric Template Field',
    namePt: 'Campo Modelo Etérico',
    description: 'The etheric template is the blueprint for the physical body. It holds the perfect form that the physical body should express, serving as a template for healing.',
    descriptionPt: 'O modelo etérico é a planta original para o corpo físico. Contém a forma perfeita que o corpo físico deve expressar, servindo como modelo para a cura.',
    color: 'Blue, white',
    frequency: 'Ultra high',
    distance: '12-18 inches from body',
    properties: ['Blueprint body', 'Divine template', 'Healing reference', 'Form structure'],
    functions: ['Holds body blueprint', 'Enables physical healing', 'Creates form patterns'],
    healingPractices: ['Shape shifting', 'Etheric template healing', 'Reconstruction work', 'Sacred geometry'],
  },
  {
    id: 'celestial',
    name: 'Celestial Field',
    namePt: 'Campo Celestial',
    description: 'The celestial body is associated with spiritual enlightenment and cosmic consciousness. It connects to higher truths and universal wisdom.',
    descriptionPt: 'O corpo celestial está associado ao despertar espiritual e consciência cósmica. Conecta-se às verdades superiores e sabedoria universal.',
    color: 'Golden, pure white',
    frequency: 'Divine',
    distance: '18-24 inches from body',
    properties: ['Cosmic consciousness', 'Divine connection', 'Universal truths', 'Enlightenment'],
    functions: ['Accesses cosmic wisdom', 'Connects to divine', 'Achieves enlightenment'],
    healingPractices: ['Sacred worship', 'Cosmic meditations', 'Divine healing', 'Light integration'],
  },
  {
    id: 'causal',
    name: 'Causal Field',
    namePt: 'Campo Causal',
    description: 'The causal body is the soul body that holds the Akashic records and karmic imprints. It contains the accumulated wisdom from past lives.',
    descriptionPt: 'O corpo causal é o corpo da alma que mantém os registros akáshicos e imagens cármicas. Contém a sabedoria acumulada de vidas passadas.',
    color: 'Violet, gold, opalescent',
    frequency: 'Transcendent',
    distance: '24+ inches from body',
    properties: ['Soul memory', 'Akashic records', 'Karmic imprints', 'Wisdom body'],
    functions: ['Stores soul records', 'Holds karma', 'Contains past life memories'],
    healingPractices: ['Past life regression', 'Akashic record reading', 'Karmic clearing', 'Soul retrieval'],
  },
];

const energyFieldTypes: EnergyFieldType[] = [
  {
    id: 'personal',
    name: 'Personal Energy Field',
    namePt: 'Campo Energético Pessoal',
    description: 'Your unique energetic signature that radiates from your body. It includes your aura, chi, and personal power presence.',
    descriptionPt: 'Sua assinatura energética única que irradia do seu corpo. Inclui sua aura, chi e presença de poder pessoal.',
    category: 'Individual',
    intensity: 'Unique to individual',
    characteristics: ['Biometric energy', 'Personal power', 'Unique signature', 'Self-defined boundaries'],
    balancingPractices: ['Personal meditation', 'Power animals', 'Personal rituals', 'Energy hygiene'],
  },
  {
    id: 'collective',
    name: 'Collective Energy Field',
    namePt: 'Campo Energético Coletivo',
    description: 'Shared energy that connects groups of people, communities, and humanity as a whole. It includes group auras and shared consciousness.',
    descriptionPt: 'Energia compartilhada que conecta grupos de pessoas, comunidades e a humanidade como um todo. Inclui auras grupais e consciência compartilhada.',
    category: 'Group',
    intensity: 'Variable by group size',
    characteristics: ['Shared consciousness', 'Group coherence', 'Collective intention', 'Social bonding'],
    balancingPractices: ['Group meditation', 'Circle work', 'Collective rituals', 'Community healing'],
  },
  {
    id: 'earth',
    name: 'Earth Energy Field',
    namePt: 'Campo Energético da Terra',
    description: 'The planetary field including ley lines, Schumann resonance, and Earth electromagnetic fields. Vital for grounding and planetary healing.',
    descriptionPt: 'O campo planetário incluindo linhas ley, ressonância de Schumann e campos eletromagnéticos da Terra. Vital para aterramento e cura planetária.',
    category: 'Planetary',
    intensity: 'Global',
    characteristics: ['Ley lines', 'Schumann resonance', 'Geopathic zones', 'Earth magnetism'],
    balancingPractices: ['Grounding meditation', 'Earth healing rituals', 'Nature walks', 'Planetary prayers'],
  },
  {
    id: 'cosmic',
    name: 'Cosmic Energy Field',
    namePt: 'Campo Energético Cósmico',
    description: 'The infinite field connecting all consciousness across the universe. Accesses stargate portals, cosmic mind, and divine downloads.',
    descriptionPt: 'O campo infinito conectando toda consciência através do universo. Acessa portais estelares, mente cósmica e downloads divinos.',
    category: 'Universal',
    intensity: 'Infinite',
    characteristics: ['Universal consciousness', 'Cosmic mind', 'Divine downloads', 'Stargate portals'],
    balancingPractices: ['Cosmic meditation', 'Universal attunement', 'Stargate work', 'Divine connection'],
  },
  {
    id: 'sacred-space',
    name: 'Sacred Space Field',
    namePt: 'Campo de Espaço Sagrado',
    description: 'Human-created sacred energy fields in temples, churches, sacred sites, and ritual spaces. They amplify spiritual work.',
    descriptionPt: 'Campos energéticos sagrados criados pelo homem em templos, igrejas, locais sagrados e espaços rituais. Amplificam o trabalho espiritual.',
    category: 'Created',
    intensity: 'Location-dependent',
    characteristics: ['Sacred geometry', 'Amplified energy', 'Divine presence', 'Portal activation'],
    balancingPractices: ['Ritual work', 'Sacred ceremony', 'Space clearing', 'Altar creation'],
  },
  {
    id: 'protective',
    name: 'Protective Energy Field',
    namePt: 'Campo Energético Protetor',
    description: 'Shield-like energies that protect against negative influences, psychic attacks, and EMF radiation. Can be consciously created or innate.',
    descriptionPt: 'Energias em forma de escudo que protegem contra influências negativas, ataques psíquicos e radiação EMF. Podem ser criadas conscientemente ou serem inatas.',
    category: 'Defensive',
    intensity: 'Variable by skill',
    characteristics: ['Shield formation', 'Boundary setting', 'Psychic protection', 'Energy filtering'],
    balancingPractices: ['Shielding meditation', 'Warding rituals', ' EMF protection', 'Boundary restoration'],
  },
];

const energyFieldData: EnergyFieldData = {
  id: 'energy-field',
  name: 'Energy Field',
  namePt: 'Campo Energético',
  description: 'The multidimensional energy field that surrounds and interpenetrates all living beings, connecting physical, emotional, mental, and spiritual bodies.',
  descriptionPt: 'O campo energético multidimensional que envolve e interpenetra todos os seres vivos, conectando os corpos físico, emocional, mental e espiritual.',
  coreConcept: 'The human energy field is a complex system of luminous layers that support physical health, emotional balance, mental clarity, and spiritual growth.',
  colors: ['Rainbow spectrum', 'Individual-dependent', 'Layer-specific'],
  frequencies: ['7.83 Hz base (Schumann)', 'Variable by layer and state'],
  locations: ['Surrounds entire body', 'Extends beyond physical form', 'Connected to all chakra systems'],
  qualities: ['Interdimensional', 'Fluid and responsive', 'Consciousness-encoding', 'Healing-responsive'],
  associatedChakras: ['All seven major chakras', 'Transpersonal points', 'Meridian system'],
  cleansingMethods: ['Smudging', 'Salt baths', 'Sound healing', 'Moon light', 'Running water', 'Breath work'],
  strengtheningPractices: ['Reiki', 'Qigong', 'Yoga', 'Meditation', 'Tai Chi', 'Breathwork', 'Earth connection'],
};

// GET /api/energy-field/data - Get energy field data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const layer = searchParams.get('layer');
    const type = searchParams.get('type');

    // Return specific energy field layer by number
    if (layer) {
      const num = parseInt(layer, 10);
      if (isNaN(num)) {
        return NextResponse.json(
          { success: false, error: 'Invalid layer number' },
          { status: 400 }
        );
      }
      const layerData = energyFieldLayers.find((l) => l.id === String(num) || l.name.toLowerCase().replace(/\s+/g, '-') === String(num));
      if (!layerData) {
        return NextResponse.json(
          { success: false, error: 'Energy field layer not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: layerData });
    }

    // Return energy field layer or type by ID
    if (id) {
      if (id === 'layers') {
        return NextResponse.json({ success: true, data: energyFieldLayers });
      }
      if (id === 'types') {
        return NextResponse.json({ success: true, data: energyFieldTypes });
      }
      const layerData = energyFieldLayers.find((l) => l.id === id);
      if (layerData) {
        return NextResponse.json({ success: true, data: layerData });
      }
      // Check types
      const typeData = energyFieldTypes.find((t) => t.id === id);
      if (typeData) {
        return NextResponse.json({ success: true, data: typeData });
      }
      return NextResponse.json(
        { success: false, error: 'Energy field data not found' },
        { status: 404 }
      );
    }

    // Return by type
    if (type) {
      switch (type) {
        case 'layers':
          return NextResponse.json({ success: true, data: energyFieldLayers });
        case 'types':
          return NextResponse.json({ success: true, data: energyFieldTypes });
        case 'overview':
          return NextResponse.json({
            success: true,
            data: {
              overview: energyFieldData,
              layers: energyFieldLayers,
              types: energyFieldTypes,
            },
          });
        default:
          return NextResponse.json(
            { success: false, error: 'Invalid type parameter' },
            { status: 400 }
          );
      }
    }

    // Default — return all energy field data
    return NextResponse.json({
      success: true,
      data: {
        overview: energyFieldData,
        layers: energyFieldLayers,
        types: energyFieldTypes,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch energy field data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
