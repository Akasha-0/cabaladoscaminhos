// Awareness data — consciousness levels, states, and expansion pathways

export interface AwarenessLevel {
  id: string;
  name: string;
  portugueseName: string;
  frequency: number;
  color: string;
  chakra: string;
  description: string;
  characteristics: string[];
  practices: string[];
  transitions: string[];
}

const levels: AwarenessLevel[] = [
  {
    id: 'ordinary',
    name: 'Ordinary Consciousness',
    portugueseName: 'Consciência Ordinária',
    frequency: 100,
    color: '#808080',
    chakra: 'Muladhara',
    description: 'Estado comum de vigília, identificado com o corpo e a mente condicionada.',
    characteristics: ['identificação com o ego', 'reação automática', 'pensamento linear', 'separação percebida'],
    practices: ['atenção plena básica', 'observação de pensamentos', 'respiração consciente'],
    transitions: ['ordinary-to-awakened'],
  },
  {
    id: 'awakened',
    name: 'Awakened Awareness',
    portugueseName: 'Consciência Desperta',
    frequency: 500,
    color: '#00FF00',
    chakra: 'Anahata',
    description: 'Primeira ruptura com a identificação ordinária, percepção da consciência como separata.',
    characteristics: ['witnessing', 'equanimidade', 'claridade perceptual', 'compaixão natural'],
    practices: ['meditação de witness', 'não-dual awareness', 'presença contínua'],
    transitions: ['awakened-to-expanded'],
  },
  {
    id: 'expanded',
    name: 'Expanded Consciousness',
    portugueseName: 'Consciência Expandida',
    frequency: 540,
    color: '#00BFFF',
    chakra: 'Vishuddha',
    description: 'Percepção dos múltiplos planos da realidade e capacidade de navegação entre estados.',
    characteristics: ['percepção multidimensional', 'comunicação sutil', 'intuição desenvolvida', 'sincronicidades'],
    practices: ['visualização avançada', 'trabalho com campos', 'expansão de consciência'],
    transitions: ['expanded-to-unified'],
  },
  {
    id: 'unified',
    name: 'Unified Awareness',
    portugueseName: 'Consciência Unificada',
    frequency: 600,
    color: '#9400D3',
    chakra: 'Ajna',
    description: 'Integração da consciência individual com a consciência universal,samadhi transitório.',
    characteristics: ['experiência da unidade', 'percepção holográfica', 'conhecimento direto', 'liberação do karma'],
    practices: ['meditação profunda', 'contemplação não-dual', 'serviço espiritual'],
    transitions: ['unified-to-transcendent'],
  },
  {
    id: 'transcendent',
    name: 'Transcendent Consciousness',
    portugueseName: 'Consciência Transcendente',
    frequency: 700,
    color: '#FFD700',
    chakra: 'Sahasrara',
    description: 'Estabilização na consciência pura, além da identificação com qualquer forma.',
    characteristics: ['consciência pura', 'liberação completa', 'wisdom não-conceptual', 'compassão universal'],
    practices: ['imersão em samadhi', 'integração do não-dual', 'transmissão de teachings'],
    transitions: ['transcendent-to-non-local'],
  },
  {
    id: 'non-local',
    name: 'Non-Local Awareness',
    portugueseName: 'Consciência Não-Local',
    frequency: 800,
    color: '#FFFFFF',
    chakra: '超越',
    description: 'Consciência ilimitada que opera fora das restrições espaço-temporais.',
    characteristics: ['onipotência духовная', 'onipresença', 'capacidade de cura completa', 'comunicação com o absoluto'],
    practices: ['comunhão com o source', 'transformação da matéria', 'manifestação intencional'],
    transitions: ['non-local-to-cosmic'],
  },
  {
    id: 'cosmic',
    name: 'Cosmic Consciousness',
    portugueseName: 'Consciência Cósmica',
    frequency: 1000,
    color: '#FF00FF',
    chakra: '无限',
    description: 'União completa com o campo unificado do cosmos, consciência como tudo.',
    characteristics: ['identificação com o cosmos', 'transformação da realidade', 'criação consciente', 'liberação final'],
    practices: ['co-criação com o cosmos', 'evolução de sistemas', 'expansão infinita'],
    transitions: [],
  },
];

export interface AwarenessState {
  id: string;
  name: string;
  portugueseName: string;
  description: string;
  duration: string;
  effects: string[];
  integration: string[];
}

const states: AwarenessState[] = [
  {
    id: 'presence',
    name: 'Presence',
    portugueseName: 'Presença',
    description: 'Estado de consciência expandida onde há awareness sem julgamento.',
    duration: 'variável',
    effects: ['calma interior', 'claridade mental', 'conexão com o momento presente'],
    integration: ['prática diária', 'witnessing contínuo'],
  },
  {
    id: 'flow',
    name: 'Flow State',
    portugueseName: 'Estado de Fluxo',
    description: 'Harmonização entre consciência e ação, tempo dissolve-se.',
    duration: 'minutos a horas',
    effects: ['performance aumentada', 'criatividade fluindo', 'ação sem esforço'],
    integration: ['encontrar paix zone', 'alinhamento com propósito'],
  },
  {
    id: 'samadhi',
    name: 'Samadhi',
    portugueseName: 'Samadhi',
    description: 'Absorção completa da consciência no objeto de concentração.',
    duration: 'momentos a eternidade',
    effects: ['união com o objeto', 'dissolução do senso de self', 'percepção direta da verdade'],
    integration: ['prática consistente', 'purificação dos campos'],
  },
  {
    id: 'non-dual',
    name: 'Non-Dual Awareness',
    portugueseName: 'Consciência Não-Dual',
    description: 'Consciência que não se identifica com nenhum objeto ou estado.',
    duration: 'estável ou transitório',
    effects: ['liberdade absoluta', 'percepção sem separação', 'aceitação completa'],
    integration: ['desidentificação progressiva', 'integração da sombra'],
  },
  {
    id: 'enlightenment',
    name: 'Enlightenment',
    portugueseName: 'Iluminação',
    description: 'Estado de despertar completo, consciência estabilizada na verdade última.',
    duration: 'permanente',
    effects: ['compaixão infinita', 'wisdom espontâneo', 'liberdade definitiva'],
    integration: ['manifestação do dharma', 'serviço à humanidade'],
  },
];

export interface AwarenessData {
  levels: AwarenessLevel[];
  states: AwarenessState[];
  totalLevels: number;
  totalStates: number;
  frequencyRange: { min: number; max: number };
  highestLevel: string;
}

function buildData(): AwarenessData {
  return {
    levels,
    states,
    totalLevels: levels.length,
    totalStates: states.length,
    frequencyRange: {
      min: Math.min(...levels.map((l) => l.frequency)),
      max: Math.max(...levels.map((l) => l.frequency)),
    },
    highestLevel: levels[levels.length - 1].id,
  };
}

// Singleton cache
let cachedData: AwarenessData | null = null;

export function getData(): AwarenessData {
  if (!cachedData) {
    cachedData = buildData();
  }
  return cachedData;
}

export function getLevelById(id: string): AwarenessLevel | undefined {
  return levels.find((l) => l.id === id);
}

export function getLevelsByChakra(chakra: string): AwarenessLevel[] {
  return levels.filter((l) => l.chakra === chakra);
}

export function getStateById(id: string): AwarenessState | undefined {
  return states.find((s) => s.id === id);
}

export function getNextLevel(currentId: string): AwarenessLevel | undefined {
  const index = levels.findIndex((l) => l.id === currentId);
  if (index >= 0 && index < levels.length - 1) {
    return levels[index + 1];
  }
  return undefined;
}

export function getLevelByFrequency(frequency: number): AwarenessLevel | undefined {
  return levels.find((l) => l.frequency === frequency);
}

export function getStateByFrequency(frequency: number): AwarenessState | undefined {
  // Map frequency to state based on ranges
  if (frequency < 300) return states[0]; // presence
  if (frequency < 500) return states[1]; // flow
  if (frequency < 700) return states[2]; // samadhi
  if (frequency < 900) return states[3]; // non-dual
  return states[4]; // enlightenment
}