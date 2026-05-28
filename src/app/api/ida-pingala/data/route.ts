// ============================================================
// IDA-PINGALA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Ida-Pingala energy channel data
// - Ida Nadi (left lunar channel) - cooling, feminine
// - Pingala Nadi (right solar channel) - warming, masculine
// - Energy flow and balance information
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface Nadichannel {
  id: string;
  name: string;
  namePt: string;
  element: string;
  elementPt: string;
  quality: string;
  qualityPt: string;
  color: string;
  colorPt: string;
  location: string;
  locationPt: string;
  breath: string;
  breathPt: string;
  characteristics: string[];
  characteristicsPt: string[];
  balance: string;
  balancePt: string;
  practices: string[];
  practicesPt: string[];
  effects: string[];
  effectsPt: string[];
}

interface EnergyFlow {
  id: string;
  name: string;
  namePt: string;
  description: string;
  descriptionPt: string;
  breathRatio: string;
  effect: string;
  effectPt: string;
}

interface BreathingState {
  id: string;
  dominant: string;
  dominantPt: string;
  ratio: string;
  effects: string[];
  effectsPt: string[];
  practices: string[];
  practicesPt: string[];
}

const NADI_DATA: Nadichannel[] = [
  {
    id: 'ida',
    name: 'Ida Nadi',
    namePt: 'Nadi Ida',
    element: 'Moon / Lunar',
    elementPt: 'Lua / Lunar',
    quality: 'Cooling, Calming, Feminine',
    qualityPt: 'Refrescante, Calmante, Feminino',
    color: 'Silver / White',
    colorPt: 'Prata / Branco',
    location: 'Left side of the spine',
    locationPt: 'Lado esquerdo da coluna',
    breath: 'Left Nostril',
    breathPt: 'Narina Esquerda',
    characteristics: [
      'Mental clarity and calm',
      'Intuitive understanding',
      'Emotional balance',
      'Rest and digest state',
      'Creative energy',
      'Cooling effect on body',
    ],
    characteristicsPt: [
      'Clareza mental e calma',
      'Compreensão intuitiva',
      'Equilíbrio emocional',
      'Estado de repouso e digestão',
      'Energia criativa',
      'Efeito refrescante no corpo',
    ],
    balance: 'Balanced lunar energy brings peace and insight',
    balancePt: 'Energia lunar equilibrada traz paz e discernimento',
    practices: [
      'Chandra Bhedana pranayama',
      'Left nostril breathing',
      'Cool visualization',
      'Moon meditation',
    ],
    practicesPt: [
      'Pranayama Chandra Bhedana',
      'Respiração pela narina esquerda',
      'Visualização refrescante',
      'Meditação lunar',
    ],
    effects: [
      'Activates parasympathetic nervous system',
      'Reduces stress and anxiety',
      'Enhances creativity',
      'Improves digestive function',
      'Promotes restful sleep',
    ],
    effectsPt: [
      'Ativa o sistema nervoso parassimpático',
      'Reduz estresse e ansiedade',
      'Melhora a criatividade',
      'Melhora a função digestiva',
      'Promove sono tranquilo',
    ],
  },
  {
    id: 'pingala',
    name: 'Pingala Nadi',
    namePt: 'Nadi Pingala',
    element: 'Sun / Solar',
    elementPt: 'Sol / Solar',
    quality: 'Warming, Energizing, Masculine',
    qualityPt: 'Aquecedor, Energizante, Masculino',
    color: 'Orange / Red',
    colorPt: 'Laranja / Vermelho',
    location: 'Right side of the spine',
    locationPt: 'Lado direito da coluna',
    breath: 'Right Nostril',
    breathPt: 'Narina Direita',
    characteristics: [
      'Physical energy and vitality',
      'Logical thinking',
      'Active state',
      'Fight or flight response',
      'Dynamic energy',
      'Warming effect on body',
    ],
    characteristicsPt: [
      'Energia física e vitalidade',
      'Pensamento lógico',
      'Estado ativo',
      'Resposta de luta ou fuga',
      'Energia dinâmica',
      'Efeito aquecedor no corpo',
    ],
    balance: 'Balanced solar energy brings strength and clarity',
    balancePt: 'Energia solar equilibrada traz força e clareza',
    practices: [
      'Surya Bhedana pranayama',
      'Right nostril breathing',
      'Sun salutation',
      'Fire visualization',
    ],
    practicesPt: [
      'Pranayama Surya Bhedana',
      'Respiração pela narina direita',
      'Saudações ao sol',
      'Visualização de fogo',
    ],
    effects: [
      'Activates sympathetic nervous system',
      'Increases energy and alertness',
      'Enhances metabolic function',
      'Improves circulation',
      'Promotes alertness and focus',
    ],
    effectsPt: [
      'Ativa o sistema nervoso simpático',
      'Aumenta energia e vigilância',
      'Melhora a função metabólica',
      'Melhora a circulação',
      'Promove vigilância e foco',
    ],
  },
  {
    id: 'sushumna',
    name: 'Sushumna Nadi',
    namePt: 'Nadi Sushumna',
    element: 'Balance / Neutral',
    elementPt: 'Equilíbrio / Neutro',
    quality: 'Central channel - enlightenment',
    qualityPt: 'Canal central - iluminação',
    color: 'Gold / White',
    colorPt: 'Dourado / Branco',
    location: 'Center of the spine',
    locationPt: 'Centro da coluna',
    breath: 'Both Nostrils (balanced)',
    breathPt: 'Ambas as Narinas (equilibrado)',
    characteristics: [
      'Spiritual awakening channel',
      'Kundalini pathway',
      'Balance of ida and pingala',
      'Meditative state',
      'Higher consciousness',
      'Neutral temperature',
    ],
    characteristicsPt: [
      'Canal de despertar espiritual',
      'Caminho da Kundalini',
      'Equilíbrio entre ida e pingala',
      'Estado meditativo',
      'Consciência superior',
      'Temperatura neutra',
    ],
    balance: 'Balanced sushumna enables spiritual liberation',
    balancePt: 'Sushumna equilibrado permite libertação espiritual',
    practices: [
      'Nadi Shodhana pranayama',
      'Alternate nostril breathing',
      'Spinal breath awareness',
      'Central channel meditation',
    ],
    practicesPt: [
      'Pranayama Nadi Shodhana',
      'Respiração alternada pelas narinas',
      'Consciência da respiração na coluna',
      'Meditação no canal central',
    ],
    effects: [
      'Activates all chakras',
      'Balances hemispheres',
      'Opens kundalini pathway',
      'Promotes spiritual growth',
      'Harmonizes all energies',
    ],
    effectsPt: [
      'Ativa todos os chakras',
      'Equilibra hemisférios',
      'Abre o caminho da Kundalini',
      'Promove crescimento espiritual',
      'Harmoniza todas as energias',
    ],
  },
];

const FLOW_DATA: EnergyFlow[] = [
  {
    id: 'cobra',
    name: 'Cobra Breathing',
    namePt: 'Respiração da Cobra',
    description: 'Ida dominant - cooling, calming lunar energy',
    descriptionPt: 'Dominância Ida - energia lunar refrescante e calmante',
    breathRatio: '6:0:0',
    effect: 'Activates ida nadi for rest and rejuvenation',
    effectPt: 'Ativa nadi ida para repouso e rejuvenescimento',
  },
  {
    id: 'lion',
    name: 'Lion Breathing',
    namePt: 'Respiração do Leão',
    description: 'Pingala dominant - warming, energizing solar energy',
    descriptionPt: 'Dominância Pingala - energia solar aquecedora e energizante',
    breathRatio: '0:0:6',
    effect: 'Activates pingala nadi for vitality and action',
    effectPt: 'Ativa nadi pingala para vitalidade e ação',
  },
  {
    id: 'eagle',
    name: 'Eagle Breathing',
    namePt: 'Respiração da Águia',
    description: 'Balanced flow - equal ida and pingala',
    descriptionPt: 'Fluxo equilibrado - ida e pingala iguais',
    breathRatio: '4:4:4',
    effect: 'Balances both nadis for harmony',
    effectPt: 'Equilibra ambos os nadis para harmonia',
  },
  {
    id: 'dragon',
    name: 'Dragon Breathing',
    namePt: 'Respiração do Dragão',
    description: 'Cyclic pattern - alternating ida and pingala',
    descriptionPt: 'Padrão cíclico - alternando ida e pingala',
    breathRatio: '5:5:5 (cyclic)',
    effect: 'Activates kundalini through nadi cycling',
    effectPt: 'Ativa kundalini através do ciclo dos nadis',
  },
];

const BREATHING_STATES: BreathingState[] = [
  {
    id: 'left-dominant',
    dominant: 'Ida (Left Nostril)',
    dominantPt: 'Ida (Narina Esquerda)',
    ratio: '60-70% left breath',
    effects: [
      'Rest and digest state',
      'Reduced heart rate',
      'Calm mind',
      'Enhanced creativity',
      'Better digestion',
    ],
    effectsPt: [
      'Estado de repouso e digestão',
      'Frequência cardíaca reduzida',
      'Mente calma',
      'Criatividade aumentada',
      'Melhor digestão',
    ],
    practices: [
      'Chandra Bhedana',
      'Left nostril meditation',
      'Cool visualization',
      'Chanting with left nasal resonance',
    ],
    practicesPt: [
      'Chandra Bhedana',
      'Meditação pela narina esquerda',
      'Visualização refrescante',
      'Canto com ressonância nasal esquerda',
    ],
  },
  {
    id: 'right-dominant',
    dominant: 'Pingala (Right Nostril)',
    dominantPt: 'Pingala (Narina Direita)',
    ratio: '60-70% right breath',
    effects: [
      'Active state',
      'Increased heart rate',
      'Alertness',
      'Physical performance',
      'Metabolic boost',
    ],
    effectsPt: [
      'Estado ativo',
      'Frequência cardíaca aumentada',
      'Vigilância',
      'Desempenho físico',
      'Impulso metabólico',
    ],
    practices: [
      'Surya Bhedana',
      'Right nostril exercise',
      'Fire visualization',
      'Vigorous physical activity',
    ],
    practicesPt: [
      'Surya Bhedana',
      'Exercício pela narina direita',
      'Visualização de fogo',
      'Atividade física vigorosa',
    ],
  },
  {
    id: 'balanced',
    dominant: 'Balanced (Both Nostrils)',
    dominantPt: 'Equilibrado (Ambas as Narinas)',
    ratio: '50-50% equal breath',
    effects: [
      'Meditative state',
      'Balanced energy',
      'Mental clarity',
      'Spiritual readiness',
      'Optimal health',
    ],
    effectsPt: [
      'Estado meditativo',
      'Energia equilibrada',
      'Clareza mental',
      'Prontidão espiritual',
      'Saúde ótima',
    ],
    practices: [
      'Nadi Shodhana',
      'Alternate nostril breathing',
      'Sushumna awareness',
      'Central channel meditation',
    ],
    practicesPt: [
      'Nadi Shodhana',
      'Respiração alternada pelas narinas',
      'Consciência do Sushumna',
      'Meditação no canal central',
    ],
  },
];

// GET /api/ida-pingala/data - Main data endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const id = searchParams.get('id');

    // Return specific data based on type parameter
    if (id) {
      // Return specific nadi, flow, or breathing state
      const nadi = NADI_DATA.find((n) => n.id === id);
      if (nadi) {
        return NextResponse.json({ data: nadi });
      }

      const flow = FLOW_DATA.find((f) => f.id === id);
      if (flow) {
        return NextResponse.json({ data: flow });
      }

      const state = BREATHING_STATES.find((s) => s.id === id);
      if (state) {
        return NextResponse.json({ data: state });
      }

      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    // Return data based on type
    switch (type) {
      case 'nadis':
        return NextResponse.json({ data: NADI_DATA });

      case 'flows':
        return NextResponse.json({ data: FLOW_DATA });

      case 'breathing':
        return NextResponse.json({ data: BREATHING_STATES });

      case 'all':
      default:
        return NextResponse.json({
          nadis: NADI_DATA,
          flows: FLOW_DATA,
          breathingStates: BREATHING_STATES,
        });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve Ida-Pingala data' },
      { status: 500 }
    );
  }
}