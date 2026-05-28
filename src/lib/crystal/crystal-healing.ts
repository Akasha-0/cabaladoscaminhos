export interface CrystalHealingSession {
  id: string;
  userId: string;
  crystal: string;
  chakra: string;
  intention: string;
  duration: number;
  timestamp: Date;
  completed: boolean;
}

export interface CrystalProperties {
  id: string;
  name: string;
  namePt: string;
  nameEn: string;
  chakra: string;
  element: string;
  color: string;
  colorHex: string;
  properties: string[];
  healingBenefits: string[];
}

export interface HealingIntention {
  type: string;
  affirmation: string;
  visualization: string;
  duration: number;
}

const CRYSTAL_HEALING_PROPERTIES: CrystalProperties[] = [
  {
    id: 'quartzo',
    name: 'Quartzo Roso',
    namePt: 'Quartzo Roso',
    nameEn: 'Rose Quartz',
    chakra: 'coracao',
    element: 'agua',
    color: 'rosa',
    colorHex: '#FFB6C1',
    properties: ['amor', 'paz', 'harmonia', 'compaixao'],
    healingBenefits: ['cura emocional', 'abertura do coracao', 'autoaceitaçao'],
  },
  {
    id: 'ametista',
    name: 'Ametista',
    namePt: 'Ametista',
    nameEn: 'Amethyst',
    chakra: 'coroa',
    element: 'agua',
    color: 'roxo',
    colorHex: '#9966CC',
    properties: ['protecão', 'spiritualidade', 'transcendência'],
    healingBenefits: ['limpeza energética', 'conexão espiritual', 'calma mental'],
  },
  {
    id: 'turmalina',
    name: 'Turmalina Negra',
    namePt: 'Turmalina Negra',
    nameEn: 'Black Tourmaline',
    chakra: 'base',
    element: 'terra',
    color: 'preto',
    colorHex: '#1a1a1a',
    properties: ['protecão', 'ancoragem', 'escudo'],
    healingBenefits: ['protecão auricular', 'limpeza de negativas', 'estabilizaçao'],
  },
  {
    id: 'citrino',
    name: 'Citrino',
    namePt: 'Citrino',
    nameEn: 'Citrine',
    chakra: 'solar',
    element: 'fogo',
    color: 'amarelo',
    colorHex: '#FFD700',
    properties: ['abundancia', 'alegria', 'confianca'],
    healingBenefits: ['ativaçao do plexo solar', 'abundancia energetica', 'autoestima'],
  },
  {
    id: 'lapis',
    name: 'Lazuli',
    namePt: 'Lápis-Lazuli',
    nameEn: 'Lapis Lazuli',
    chakra: 'terceiro-olho',
    element: 'agua',
    color: 'azul',
    colorHex: '#4169E1',
    properties: ['sabedoria', 'comunicacao', 'verdade'],
    healingBenefits: ['ativaçao da intuiçao', 'comunicaçao espiritual', 'clareza mental'],
  },
  {
    id: 'esmeralda',
    name: 'Esmeralda',
    namePt: 'Esmeralda',
    nameEn: 'Emerald',
    chakra: 'coracao',
    element: 'terra',
    color: 'verde',
    colorHex: '#50C878',
    properties: ['amor', 'fertilidade', 'prosperidade'],
    healingBenefits: ['harmonizaçao cardiaca', 'abundancia', 'renovaçao'],
  },
  {
    id: 'sugar',
    name: 'Sugilita',
    namePt: 'Sugilita',
    nameEn: 'Sugilite',
    chakra: 'coroa',
    element: 'luz',
    color: 'roxo',
    colorHex: '#9B59B6',
    properties: ['protecão', 'cura', 'espiritualidade'],
    healingBenefits: ['cura de traumas', 'protecão espiritual', 'autoestima'],
  },
  {
    id: 'selenita',
    name: 'Selenita',
    namePt: 'Selenita',
    nameEn: 'Selenite',
    chakra: 'coroa',
    element: 'luz',
    color: 'branco',
    colorHex: '#F5F5F5',
    properties: ['limpeza', 'clareza', 'conexao'],
    healingBenefits: ['limpeza energetica profunda', 'clareza mental', 'conexao angelical'],
  },
];

const HEALING_INTENTIONS: Record<string, HealingIntention> = {
  emocional: {
    type: 'emocional',
    affirmation: 'Eu me aceito completamente e libero todas as dores do passado',
    visualization: 'Imagine uma luz rosa envolvendo seu corpo, dissolvendo todos os bloqueios emocionais',
    duration: 15,
  },
  fisico: {
    type: 'fisico',
    affirmation: 'Meu corpo está em perfeita saúde e harmonía',
    visualization: 'Visualize seu corpo radiando luz dourada, cada célula vibrando em frequencia de saude',
    duration: 20,
  },
  espiritual: {
    type: 'espiritual',
    affirmation: 'Eu me conecto com minha essencia divina e aceito minha missao de vida',
    visualization: 'Permita que uma luz prateada desça atraves da sua coroa, preenchendo todo o seu ser',
    duration: 25,
  },
  mental: {
    type: 'mental',
    affirmation: 'Minha mente esta clara, focada e em paz',
    visualization: 'Imagine uma mente cristalina, sem nuvens, com perfeita clareza de pensamento',
    duration: 15,
  },
  protecao: {
    type: 'protecao',
    affirmation: 'Estou protegido(a) por um escudo de luz que nada pode atravessar',
    visualization: 'Visualize um escudo de luz dourada ao redor do seu corpo, formando uma barreira inviolavel',
    duration: 10,
  },
  abundancia: {
    type: 'abundancia',
    affirmation: 'A abundancia flui para mim em todas as areas da minha vida',
    visualization: 'Imagine prosperity energy flowing into your life from all directions',
    duration: 20,
  },
};

export function getCrystalProperties(crystalId: string): CrystalProperties | undefined {
  return CRYSTAL_HEALING_PROPERTIES.find((c) => c.id === crystalId);
}

export function getAllCrystals(): CrystalProperties[] {
  return CRYSTAL_HEALING_PROPERTIES;
}

export function getIntention(type: string): HealingIntention | undefined {
  return HEALING_INTENTIONS[type];
}

export interface PerformHealingOptions {
  crystalId: string;
  intentionType: string;
  duration?: number;
  userId: string;
}

export interface HealingResponse {
  session: CrystalHealingSession;
  affirmation: string;
  visualization: string;
  recommendations: string[];
  crystalEnergized: boolean;
}

export function performHealing(options: PerformHealingOptions): HealingResponse {
  const crystal = getCrystalProperties(options.crystalId);
  if (!crystal) {
    throw new Error(`Crystal ${options.crystalId} not found`);
  }

  const intention = getIntention(options.intentionType);
  if (!intention) {
    throw new Error(`Intention type ${options.intentionType} not found`);
  }

  const session: CrystalHealingSession = {
    id: `heal-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    userId: options.userId,
    crystal: crystal.name,
    chakra: crystal.chakra,
    intention: intention.type,
    duration: options.duration || intention.duration,
    timestamp: new Date(),
    completed: false,
  };

  const recommendations = generateRecommendations(crystal, intention);

  return {
    session,
    affirmation: intention.affirmation,
    visualization: intention.visualization,
    recommendations,
    crystalEnergized: true,
  };
}

function generateRecommendations(
  crystal: CrystalProperties,
  intention: HealingIntention
): string[] {
  const recommendations: string[] = [];

  recommendations.push(
    `Segure o ${crystal.name} na mão esquerda durante ${intention.duration} minutos`
  );

  if (crystal.chakra === 'coracao') {
    recommendations.push('Coloque o cristal sobre o chakra do coração');
  } else if (crystal.chakra === 'coroa') {
    recommendations.push('Posicione o cristal sobre o topo da cabeça');
  } else if (crystal.chakra === 'base') {
    recommendations.push('Sente-se e coloque o cristal entre os pés');
  } else if (crystal.chakra === 'solar') {
    recommendations.push('Coloque o cristal sobre o plexo solar');
  } else if (crystal.chakra === 'terceiro-olho') {
    recommendations.push('Deite-se e posicione o cristal na testa, entre as sobrancelhas');
  }

  crystal.properties.forEach((prop) => {
    recommendations.push(`Foque na energia de ${prop} enquanto segura o cristal`);
  });

  recommendations.push(
    'Após a sessão, limpe o cristal com água corrente e recarregue sob luz lunar'
  );

  return recommendations;
}

export function completeSession(sessionId: string): boolean {
  return sessionId.startsWith('heal-');
}