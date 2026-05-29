// @ts-nocheck
// Vibration frequency mapping - solfeggio, chakra, and healing frequencies

export interface VibrationMapping {
  frequency: number;
  name: string;
  namePt: string;
  solfeggio?: boolean;
  chakra?: string;
  chakraPt?: string;
  color?: string;
  healing: string[];
  healingPt: string[];
  affirmation: string;
  affirmationPt: string;
  keywords: string[];
  keywordsPt: string[];
}

const vibrationMappings: VibrationMapping[] = [
  {
    frequency: 174,
    name: 'Foundation',
    namePt: 'Fundação',
    healing: ['Pain relief', 'Structural integrity', 'Stability'],
    healingPt: ['Alívio da dor', 'Integridade estrutural', 'Estabilidade'],
    affirmation: 'I am grounded and secure in my physical existence',
    affirmationPt: 'Estou enraizado e seguro em minha existência física',
    keywords: ['pain', 'stability', 'foundation', 'structure'],
    keywordsPt: ['dor', 'estabilidade', 'fundação', 'estrutura'],
  },
  {
    frequency: 285,
    name: 'Tissue Regeneration',
    namePt: 'Regeneração Tecidual',
    healing: ['Tissue healing', 'Wound repair', 'Physical restoration'],
    healingPt: ['Cicatrização tecidual', 'Reparo de feridas', 'Restauração física'],
    affirmation: 'My body heals and restores itself naturally',
    affirmationPt: 'Meu corpo se cura e restaura naturalmente',
    keywords: ['healing', 'restoration', 'repair', 'regeneration'],
    keywordsPt: ['cura', 'restauração', 'reparo', 'regeneração'],
  },
  {
    frequency: 396,
    name: 'Liberation',
    namePt: 'Libertação',
    solfeggio: true,
    healing: ['Fear relief', 'Guilt release', 'Emotional freedom'],
    healingPt: ['Alívio do medo', 'Liberação da culpa', 'Liberdade emocional'],
    affirmation: 'I release fear and embrace inner peace',
    affirmationPt: 'Libero o medo e abraço a paz interior',
    keywords: ['fear', 'guilt', 'liberation', 'freedom', 'release'],
    keywordsPt: ['medo', 'culpa', 'libertação', 'liberdade', 'liberação'],
  },
  {
    frequency: 417,
    name: 'Change',
    namePt: 'Mudança',
    solfeggio: true,
    healing: ['Transformation', 'Situational revision', 'Breaking patterns'],
    healingPt: ['Transformação', 'Revisão situacional', 'Quebrar padrões'],
    affirmation: 'I embrace change and welcome new beginnings',
    affirmationPt: 'Abraço a mudança e welcoming novas beginnings',
    keywords: ['change', 'transformation', 'facilitation', 'new beginnings'],
    keywordsPt: ['mudança', 'transformação', 'facilitação', 'novos começos'],
  },
  {
    frequency: 432,
    name: 'Natural Harmony',
    namePt: 'Harmonia Natural',
    healing: ['Natural resonance', 'Stress reduction', 'Inner peace'],
    healingPt: ['Ressonância natural', 'Redução do estresse', 'Paz interior'],
    affirmation: 'I align with the natural harmony of the universe',
    affirmationPt: 'Alinho-me com a harmonia natural do universo',
    keywords: ['harmony', 'natural', 'peace', 'resonance', 'calm'],
    keywordsPt: ['harmonia', 'natural', 'paz', 'ressonância', 'calma'],
  },
  {
    frequency: 528,
    name: 'DNA Repair',
    namePt: 'Reparo de DNA',
    solfeggio: true,
    healing: ['DNA restoration', 'Miracle working', 'Transformed wonder'],
    healingPt: ['Restauração de DNA', 'Milagres', 'Maravilha transformada'],
    affirmation: 'I am a miracle, my DNA transforms perfectly',
    affirmationPt: 'Sou um milagre, meu DNA se transforma perfeitamente',
    keywords: ['DNA', 'miracle', 'transformation', 'wonder', 'love'],
    keywordsPt: ['DNA', 'milagre', 'transformação', 'maravilha', 'amor'],
  },
  {
    frequency: 639,
    name: 'Connection',
    namePt: 'Conexão',
    solfeggio: true,
    healing: ['Interpersonal harmony', 'Relationships', 'Community'],
    healingPt: ['Harmonia interpessoal', 'Relacionamentos', 'Comunidade'],
    affirmation: 'I am connected to all beings with love and understanding',
    affirmationPt: 'Estou conectado a todos os seres com amor e compreensão',
    keywords: ['connection', 'relationships', 'harmony', 'community', 'reconciliation'],
    keywordsPt: ['conexão', 'relacionamentos', 'harmonia', 'comunidade', 'reconciliação'],
  },
  {
    frequency: 741,
    name: 'Expression',
    namePt: 'Expressão',
    solfeggio: true,
    healing: ['Awakening intuition', 'Problem solving', 'Pure tone'],
    healingPt: ['Despertar da intuição', 'Resolução de problemas', 'Tom puro'],
    affirmation: 'I express my truth with clarity and purity',
    affirmationPt: 'Expresso minha verdade com clareza e pureza',
    keywords: ['expression', 'intuition', 'awakening', 'solutions', 'pure'],
    keywordsPt: ['expressão', 'intuição', 'despertar', 'soluções', 'puro'],
  },
  {
    frequency: 852,
    name: 'Third Eye',
    namePt: 'Terceiro Olho',
    solfeggio: true,
    chakra: 'ajna',
    chakraPt: 'ajna',
    color: 'indigo',
    healing: ['Third eye awakening', 'Intuitive insight', 'Inner vision'],
    healingPt: ['Despertar do terceiro olho', 'Insight intuitivo', 'Visão interior'],
    affirmation: 'I see clearly with my inner wisdom and intuition',
    affirmationPt: 'Vejo claramente com minha sabedoria interior e intuição',
    keywords: ['third eye', 'intuition', 'wisdom', 'vision', 'clarity'],
    keywordsPt: ['terceiro olho', 'intuição', 'sabedoria', 'visão', 'clareza'],
  },
  {
    frequency: 963,
    name: 'Crown Activation',
    namePt: 'Ativação da Coroa',
    solfeggio: true,
    chakra: 'sahasrara',
    chakraPt: 'coroa',
    color: 'violet',
    healing: ['Crown chakra activation', 'Divine connection', 'Pure consciousness'],
    healingPt: ['Ativação do chakra coroa', 'Conexão divina', 'Consciência pura'],
    affirmation: 'I am connected to divine source energy',
    affirmationPt: 'Estou conectado à energia divina source',
    keywords: ['crown', 'divine', 'consciousness', 'enlightenment', 'spirit'],
    keywordsPt: ['coroa', 'divino', 'consciência', 'iluminação', 'espírito'],
  },
  // Chakra-specific frequencies (inverted to match standard esoteric teaching - higher chakras = higher frequencies)
  {
    frequency: 396,
    name: 'Root Liberation',
    namePt: 'Libertação da Raiz',
    chakra: 'muladhara',
    chakraPt: 'raiz',
    color: 'red',
    healing: ['Grounding', 'Survival instincts', 'Primal energy'],
    healingPt: ['Enraizamento', 'Instintos de sobrevivência', 'Energia primal'],
    affirmation: 'I am grounded, safe, and secure in my existence',
    affirmationPt: 'Estou enraizado, seguro e protegido em minha existência',
    keywords: ['root', 'grounding', 'survival', 'primal', 'security'],
    keywordsPt: ['raiz', 'enraizamento', 'sobrevivência', 'primal', 'segurança'],
  },
  {
    frequency: 417,
    name: 'Sacral Flow',
    namePt: 'Fluxo Sacral',
    chakra: 'svadhisthana',
    chakraPt: 'sacro',
    color: 'orange',
    healing: ['Creativity', 'Sexual energy', 'Emotional balance'],
    healingPt: ['Criatividade', 'Energia sexual', 'Equilíbrio emocional'],
    affirmation: 'My creative energy flows freely and my emotions are balanced',
    affirmationPt: 'Minha energia criativa flui livremente e minhas emoções estão equilibradas',
    keywords: ['sacral', 'creativity', 'emotions', 'pleasure', 'water'],
    keywordsPt: ['sacro', 'criatividade', 'emoções', 'prazer', 'água'],
  },
  {
    frequency: 528,
    name: 'Solar Power',
    namePt: 'Poder Solar',
    chakra: 'manipura',
    chakraPt: 'plexo solar',
    color: 'yellow',
    healing: ['Personal power', 'Self-esteem', 'Metabolism'],
    healingPt: ['Poder pessoal', 'Autoestima', 'Metabolismo'],
    affirmation: 'I am powerful, confident, and worthy of success',
    affirmationPt: 'Sou poderoso, confiante e digno de sucesso',
    keywords: ['solar', 'power', 'will', 'confidence', 'fire'],
    keywordsPt: ['solar', 'poder', 'vontade', 'confiança', 'fogo'],
  },
  {
    frequency: 639,
    name: 'Heart Opening',
    namePt: 'Abertura do Coração',
    chakra: 'anahata',
    chakraPt: 'coração',
    color: 'green',
    healing: ['Unconditional love', 'Compassion', 'Heart coherence'],
    healingPt: ['Amor incondicional', 'Compaixão', 'Coerência cardíaca'],
    affirmation: 'I give and receive love freely and unconditionally',
    affirmationPt: 'Dou e recebo amor livremente e incondicionalmente',
    keywords: ['heart', 'love', 'compassion', 'air', 'balance'],
    keywordsPt: ['coração', 'amor', 'compaixão', 'ar', 'equilíbrio'],
  },
  {
    frequency: 741,
    name: 'Throat Expression',
    namePt: 'Expressão da Garganta',
    chakra: 'vishuddha',
    chakraPt: 'garganta',
    color: 'blue',
    healing: ['Communication', 'Truth expression', 'Thyroid health'],
    healingPt: ['Comunicação', 'Expressão da verdade', 'Saúde da tireoide'],
    affirmation: 'I speak my truth with love and clarity',
    affirmationPt: 'Falo minha verdade com amor e clareza',
    keywords: ['throat', 'communication', 'truth', 'expression', 'ether'],
    keywordsPt: ['garganta', 'comunicação', 'verdade', 'expressão', 'éter'],
  },
  {
    frequency: 852,
    name: 'Third Eye Insight',
    namePt: 'Insight do Terceiro Olho',
    chakra: 'ajna',
    chakraPt: 'ajna',
    color: 'indigo',
    healing: ['Intuition', 'Inner vision', 'Pituitary gland'],
    healingPt: ['Intuição', 'Visão interior', 'Glândula pituitária'],
    affirmation: 'I trust my intuition and see clearly with inner wisdom',
    affirmationPt: 'Confio em minha intuição e vejo claramente com sabedoria interior',
    keywords: ['third eye', 'intuition', 'vision', 'wisdom', 'light'],
    keywordsPt: ['terceiro olho', 'intuição', 'visão', 'sabedoria', 'luz'],
  },
  {
    frequency: 963,
    name: 'Crown Enlightenment',
    namePt: 'Iluminação da Coroa',
    chakra: 'sahasrara',
    chakraPt: 'coroa',
    color: 'violet',
    healing: ['Divine connection', 'Spiritual awakening', 'Pure consciousness'],
    healingPt: ['Conexão divina', 'Despertar espiritual', 'Consciência pura'],
    affirmation: 'I am one with the divine and embrace enlightenment',
    affirmationPt: 'Sou um com o divino e abraço a iluminação',
    keywords: ['crown', 'enlightenment', 'spirit', 'divine', 'transcendence'],
    keywordsPt: ['coroa', 'iluminação', 'espírito', 'divino', 'transcendência'],
  },
  {
    frequency: 285,
    name: 'Earth Connection',
    namePt: 'Conexão Terrena',
    healing: ['Gaia frequency', 'Nature connection', 'Planetary harmony'],
    healingPt: ['Frequência Gaia', 'Conexão com a natureza', 'Harmonia planetária'],
    affirmation: 'I am connected to Earth and all living things',
    affirmationPt: 'Estou conectado à Terra e a todos os seres vivos',
    keywords: ['earth', 'Gaia', 'nature', 'planetary', 'grounding'],
    keywordsPt: ['terra', 'Gaia', 'natureza', 'planetário', 'enraizamento'],
  },
  {
    frequency: 110,
    name: 'Schumann Resonance',
    namePt: 'Ressonância de Schumann',
    healing: ['Earth frequency', 'Planetary healing', 'Global coherence'],
    healingPt: ['Frequência terrestre', 'Cura planetária', 'Coerência global'],
    affirmation: 'I am synchronized with Earth heartbeat',
    affirmationPt: 'Estou sincronizado com o batimento cardíaco da Terra',
    keywords: ['Schumann', 'earth', 'planet', 'global', 'coherence'],
    keywordsPt: ['Schumann', 'terra', 'planeta', 'global', 'coerência'],
  },
  {
    frequency: 72,
    name: 'Delta Waves',
    namePt: 'Ondas Delta',
    healing: ['Deep sleep', 'Healing', 'Subconscious'],
    healingPt: ['Sono profundo', 'Cura', 'Subconsciente'],
    affirmation: 'My body heals deeply as I rest in deep sleep',
    affirmationPt: 'Meu corpo se cura profundamente enquanto descanso',
    keywords: ['delta', 'sleep', 'healing', 'subconscious', 'rest'],
    keywordsPt: ['delta', 'sono', 'cura', 'subconsciente', 'descanso'],
  },
  {
    frequency: 40,
    name: 'Theta Waves',
    namePt: 'Ondas Theta',
    healing: ['Meditation', 'Intuition', 'Deep relaxation'],
    healingPt: ['Meditação', 'Intuição', 'Relaxamento profundo'],
    affirmation: 'I access deep wisdom through meditative states',
    affirmationPt: 'Acesso sabedoria profunda através de estados meditativos',
    keywords: ['theta', 'meditation', 'intuition', 'relaxation', 'creativity'],
    keywordsPt: ['theta', 'meditação', 'intuição', 'relaxamento', 'criatividade'],
  },
  {
    frequency: 10,
    name: 'Alpha Waves',
    namePt: 'Ondas Alfa',
    healing: ['Relaxed awareness', 'Calm mind', 'Anti-stress'],
    healingPt: ['Consciência relaxada', 'Mente calma', 'Anti-estresse'],
    affirmation: 'I am calm, centered, and in peaceful awareness',
    affirmationPt: 'Estou calmo, centrado e em consciência pacífica',
    keywords: ['alpha', 'relaxation', 'calm', 'awareness', 'peace'],
    keywordsPt: ['alpha', 'relaxamento', 'calma', 'consciência', 'paz'],
  },
  {
    frequency: 40,
    name: 'Beta Waves',
    namePt: 'Ondas Beta',
    healing: ['Active thinking', 'Focus', 'Alertness'],
    healingPt: ['Pensamento ativo', 'Foco', 'Alerta'],
    affirmation: 'I am focused, alert, and think clearly',
    affirmationPt: 'Estou focado, alerta e penso claramente',
    keywords: ['beta', 'focus', 'alertness', 'thinking', 'active'],
    keywordsPt: ['beta', 'foco', 'alerta', 'pensamento', 'ativo'],
  },
  {
    frequency: 963,
    name: 'Gamma Waves',
    namePt: 'Ondas Gama',
    healing: ['Higher cognition', 'Peak awareness', 'Enlightenment'],
    healingPt: ['Cognição superior', 'Consciência máxima', 'Iluminação'],
    affirmation: 'I experience higher states of consciousness and insight',
    affirmationPt: 'Experiencio estados superiores de consciência e insight',
    keywords: ['gamma', 'cognition', 'enlightenment', 'peak', 'higher'],
    keywordsPt: ['gama', 'cognição', 'iluminação', 'pico', 'superior'],
  },
  {
    frequency: 555,
    name: 'Angelic Frequency',
    namePt: 'Frequência Angelical',
    healing: ['Divine connection', 'Angelic realm', 'Light activation'],
    healingPt: ['Conexão divina', 'Reino angelical', 'Ativação da luz'],
    affirmation: 'I am surrounded by angelic light and protection',
    affirmationPt: 'Estou cercado por luz e proteção angelical',
    keywords: ['angelic', 'divine', 'light', 'protection', 'spiritual'],
    keywordsPt: ['angelical', 'divino', 'luz', 'proteção', 'espiritual'],
  },
  {
    frequency: 888,
    name: 'Infinite Abundance',
    namePt: 'Abundância Infinita',
    healing: ['Abundance', 'Prosperity', 'Infinite supply'],
    healingPt: ['Abundância', 'Prosperidade', 'Suprimento infinito'],
    affirmation: 'Infinite abundance flows to me effortlessly',
    affirmationPt: 'Abundância infinita flui para mim sem esforço',
    keywords: ['abundance', 'prosperity', 'infinite', 'abundance', 'wealth'],
    keywordsPt: ['abundância', 'prosperidade', 'infinito', 'abundância', 'riqueza'],
  },
];

/**
 * Returns all vibration mappings
 */
export function getMapping(): VibrationMapping[] {
  return vibrationMappings;
}

/**
 * Returns vibration mapping by frequency
 */
export function getByFrequency(frequency: number): VibrationMapping | undefined {
  return vibrationMappings.find((m) => m.frequency === frequency);
}

/**
 * Returns all solfeggio frequencies
 */
export function getSolfeggioFrequencies(): VibrationMapping[] {
  return vibrationMappings.filter((m) => m.solfeggio);
}

/**
 * Returns frequencies by chakra
 */
export function getByChakra(chakra: string): VibrationMapping[] {
  return vibrationMappings.filter((m) => m.chakra === chakra);
}

/**
 * Returns frequencies by keyword search
 */
export function getByKeyword(keyword: string): VibrationMapping[] {
  const lowerKeyword = keyword.toLowerCase();
  return vibrationMappings.filter(
    (m) =>
      m.name.toLowerCase().includes(lowerKeyword) ||
      m.namePt.toLowerCase().includes(lowerKeyword) ||
      m.keywords.some((k) => k.toLowerCase().includes(lowerKeyword)) ||
      m.keywordsPt.some((k) => k.toLowerCase().includes(lowerKeyword)) ||
      m.affirmation.toLowerCase().includes(lowerKeyword) ||
      m.affirmationPt.toLowerCase().includes(lowerKeyword)
  );
}

/**
 * Returns all unique frequencies
 */
export function getAllFrequencies(): number[] {
  return [...new Set(vibrationMappings.map((m) => m.frequency))].sort((a, b) => a - b);
}

export default getMapping;