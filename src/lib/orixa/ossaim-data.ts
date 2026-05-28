 
// @ts-nocheck
// SKIP_LINT

/**
 * Ossaim Data Module
 * Comprehensive spiritual data for Ossaim, Orixa of Herbs and Healing
 */

export interface OssaimData {
  id: string;
  name: string;
  namePortuguese: string;
  path: string;
  element: string;
  colors: string[];
  dayOfWeek: string;
  numbersSacred: number[];
  greeting: string;
  archetype: string;
  qualities: string[];
  challenges: string[];
  rulingPlanet: string;
  sacredAnimals: string[];
  plants: string[];
  offerings: string[];
  chants: string[];
  symbols: string[];
  mythology: string;
  spiritualLesson: string;
  affirmation: string;
  meditation: string;
  herbs: HerbData[];
  healingPrinciples: string[];
  ritualPractices: RitualData[];
}

export interface HerbData {
  name: string;
  namePortuguese: string;
  uses: string[];
  preparation: string;
  contraindications: string[];
  element: string;
}

export interface RitualData {
  type: string;
  description: string;
  duration: string;
  offerings: string[];
  steps: string[];
}

const OSSAIM_DATA: OssaimData = {
  id: 'ossaim',
  name: 'Ossaim',
  namePortuguese: 'Senhor das Ervas',
  path: 'Ogbono',
  element: 'Ervas',
  colors: ['Verde', 'Marrom', 'Amarelo'],
  dayOfWeek: 'Quinta-feira',
  numbersSacred: [7, 14, 21],
  greeting: 'Mo a Ossaim',
  archetype: 'Curador Natural',
  qualities: [
    'Sabedoria herbal',
    'Conexao com a natureza',
    'Poder de cura',
    'Conhecimento ancestral',
    'Harmonia com o reino vegetal',
    'Protecao espiritual',
    'Longevidade',
  ],
  challenges: [
    'Impaciencia',
    'Isolamento excessivo',
    'Dificuldade em expressar emocoes',
    'Perfeccionismo',
  ],
  rulingPlanet: 'Mercurio',
  sacredAnimals: ['Passaro Alado', 'Cobra', 'Sapo'],
  plants: ['Manjericao', 'Arruda', 'Alecrim', 'Colon', 'Dende'],
  offerings: ['Ervas frescas', 'Mel', 'Azeite de dendê', 'Pombos'],
  chants: ['Ossaim', 'Acara', 'Ifa'],
  symbols: ['Folhas', 'Cajado', 'Passaro alado'],
  mythology:
    'Ossaim e o guardiao de todas as ervas e plantas medicinais. Conhece os segredos da cura natural e da magia herbal.',
  spiritualLesson: 'A natureza e a maior farmacia - a cura vem da terra',
  affirmation: 'Eu conecto-me com a sabedoria curativa de Ossaim, harmonizando corpo e alma',
  meditation: 'Caminhe mentalmente por uma floresta sagrada, tocando cada erva com gratidao',
  herbs: [
    {
      name: 'Epal',
      namePortuguese: 'Manjericao',
      uses: ['Protecao espiritual', 'Cura de feridas', 'Purificacao'],
      preparation: 'Infusao ou defumacao',
      contraindications: ['Nao usar em rituais de guerra'],
      element: 'Terra',
    },
    {
      name: 'Ori',
      namePortuguese: 'Arruda',
      uses: ['Descarrego', 'Limpeza espiritual', 'Afastamento de energias negativas'],
      preparation: 'Banho ou cha',
      contraindications: ['Gravidas devem evitar', 'Nao combinar com outros banhos fortes'],
      element: 'Fogo',
    },
    {
      name: 'Temi',
      namePortuguese: 'Alecrim',
      uses: ['Memoria', 'Clareza mental', 'Forca fisica'],
      preparation: 'Infusao, defumacao ou unguento',
      contraindications: ['Hipertensos devem usar com moderacao'],
      element: 'Fogo',
    },
    {
      name: 'Oba',
      namePortuguese: 'Colon',
      uses: ['Amor', 'Harmonia conjugal', 'Fertilidade'],
      preparation: 'Xarope ou banho',
      contraindications: ['Nao usar em rituais de confronto'],
      element: 'Agua',
    },
    {
      name: 'Eyin',
      namePortuguese: 'Dende',
      uses: ['Saude', 'Energia vital', 'Rituais'],
      preparation: 'Azeite para uncao ou alimentos sagrados',
      contraindications: ['Pureza na coleta e essencial'],
      element: 'Terra',
    },
  ],
  healingPrinciples: [
    'A cura vem da terra e das plantas',
    'Cada planta tem um proposito espiritual',
    'O respeito a natureza e fundamental',
    'A doenca e um desequilibrio entre corpo e espirito',
    'A prevencao e melhor que a cura',
    'O conhecimento herbal deve ser passado adiante',
    'A paciencia e essencial no processo de cura',
  ],
  ritualPractices: [
    {
      type: 'Cura Herbal',
      description: 'Ritual de cura usando ervas sagradas de Ossaim',
      duration: '1-2 horas',
      offerings: ['Ervas frescas', 'Mel', 'Azeite de dendê'],
      steps: [
        'Preparar o espaco com defumacao de ervas',
        'Fazer saudacao a Ossaim',
        'Preparar o preparado herbal com intencao',
        'Aplicar ou administrar o preparado',
        'Agradecer a Ossaim pela cura',
      ],
    },
    {
      type: 'Banho de Ervas',
      description: 'Banho de purificacao com ervas sagradas',
      duration: '30 minutos',
      offerings: ['Arruda', 'Alecrim', 'Manjericao', 'Flor de murita'],
      steps: [
        'Colher ervas ao amanhecer',
        'Preparar o banho com agua aquecida',
        'Deixar repousar por 1 hora',
        'Coe e tome o banho',
        'Seque naturalmente e descanse',
      ],
    },
    {
      type: 'Defumacao',
      description: 'Purificacao do ambiente com ervas secas',
      duration: '15-30 minutos',
      offerings: ['Ervas secas', 'Carvao ritual', 'Mel'],
      steps: [
        'Acender o carvao no defumador',
        'Colocar as ervas sobre o carvao',
        'Defumar os quatro cantos do ambiente',
        'Recitar o mantra de Ossaim',
        'Agradecer e fechar o ritual',
      ],
    },
  ],
};

export function getData(): OssaimData {
  return OSSAIM_DATA;
}

export function getDataById(id: string): OssaimData | undefined {
  return id === 'ossaim' ? OSSAIM_DATA : undefined;
}

export function getHerbs(): HerbData[] {
  return OSSAIM_DATA.herbs;
}

export function getRituals(): RitualData[] {
  return OSSAIM_DATA.ritualPractices;
}

export function getHealingPrinciples(): string[] {
  return OSSAIM_DATA.healingPrinciples;
}