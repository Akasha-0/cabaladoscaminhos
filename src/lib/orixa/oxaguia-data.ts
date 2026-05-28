// @ts-nocheck
// SKIP_LINT

/**
 * Oxaguiã Data Module
 * Spiritual data for Oxaguiã, the orixá of dawn, awakening, and spiritual illumination
 */

export interface OxaguiaData {
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
  dawnRituals: DawnRitualData[];
  awakeningPrinciples: string[];
  sacredPaths: SacredPathData[];
}

export interface DawnRitualData {
  type: string;
  description: string;
  duration: string;
  offerings: string[];
  steps: string[];
}

export interface SacredPathData {
  name: string;
  description: string;
  practices: string[];
  blessings: string[];
}

const OXAGUIA_DATA: OxaguiaData = {
  id: 'oxaguia',
  name: 'Oxaguiã',
  namePortuguese: 'O Senhor da Aurora',
  path: 'Awon agba',
  element: 'Luz solar',
  colors: ['Branco', 'Amarelo dourado', 'Laranja'],
  dayOfWeek: 'Segunda-feira',
  numbersSacred: [1, 7, 9],
  greeting: 'Ese Oxaguiã!',
  archetype: 'O Despertabilidade Espiritual',
  qualities: [
    'Iluminação',
    'Despertar',
    'Pureza de intenção',
    'Conexão ancestral',
    'Visão clara',
    'Renovação espiritual',
    'Sabedoria matinal',
    'Guia dos caminhos',
  ],
  challenges: [
    'Impaciência no processo',
    'Dificuldade em aceitar o silêncio',
    'Tendência a julgar prematuramente',
    'Superficialidade espiritual',
  ],
  rulingPlanet: 'Sol',
  sacredAnimals: ['Pavão', 'Galinha', 'Coruja'],
  plants: ['Girassol', 'Calêndula', 'Cravo branco'],
  offerings: ['Ovos', 'Milho', 'Azeite de dendê', 'Mel', 'Velas douradas'],
  chants: ['Oxaguiã', 'Epa', 'Ori'],
  symbols: ['Sol nascente', 'Caminho iluminado', 'Chama eterna'],
  mythology:
    'Oxaguiã é o orixá que abre os caminhos da espiritualidade, trazendo a luz da consciência para os que buscam a verdade. É o mensageiro do amanhecer, despertando as consciências adormecidas e guiando as almas pelos caminhos da sabedoria ancestral.',
  spiritualLesson: 'O despertar verdadeiro vem quando silenciamos o ego e abrimos espaço para a luz divina',
  affirmation: 'Eu desperto para minha verdade mais elevada, permitindo que a luz de Oxaguiã ilumine meu caminho espiritual',
  meditation: 'Visualize o sol nascente em seu peito, irradiando luz dourada que purifica cada célula do seu ser',
  dawnRituals: [
    {
      type: 'Saudação ao Sol',
      description: 'Ritual de boas-vindas ao sol nascente, buscando iluminação para o dia',
      duration: '30 minutos',
      offerings: ['Velas douradas', 'Mel', 'Água limpa'],
      steps: [
        'Despertar antes do sol nascer',
        'Preparar o espaço ritual com elementos dourados',
        'Acender velas direcionadas ao leste',
        'Recitar a saudação de Oxaguiã',
        'Meditar sobre os propósitos do dia',
        'Agradecer pela luz recebida',
      ],
    },
    {
      type: 'Caminho Iluminado',
      description: 'Ritual de apertura de caminhos através da luz spiritual',
      duration: '1 hora',
      offerings: ['Ovos', 'Milho', 'Flores amarelas'],
      steps: [
        'Definir a intenção do caminho a ser aberto',
        'Fazer a defumação com ervas sagradas',
        'Colocar os ovos nos cantos do espaço',
        'Recitar os mantras de Oxaguiã',
        'Caminhar pelo espaço visualizando a luz',
        'Agradecer e selar o ritual',
      ],
    },
    {
      type: 'Despertabilidade',
      description: 'Ritual para despertar consciências adormecidas',
      duration: '45 minutos',
      offerings: ['Azeite de dendê', 'Mel', 'Água de flor'],
      steps: [
        'Preparar o espaço com água de flor',
        'Fazer a unção com azeite de dendê',
        'Recitar os cantos de despertar',
        'Meditar na escuridão inicial',
        'Visualizar a luz penetrando',
        'Sellar o despertar com gratidão',
      ],
    },
  ],
  awakeningPrinciples: [
    'A luz sempre vence a escuridão',
    'O despertar é um processo contínuo',
    'Cada amanhecer traz uma nova oportunidade',
    'A verdade se revela na quietude',
    'O caminho se abre para quem busca com sinceridade',
    'A sabedoria vem do silêncio interior',
    'A conexão ancestral ilumina o presente',
    'O despertar verdadeiro transforma a realidade',
  ],
  sacredPaths: [
    {
      name: 'Awon Agba',
      description: 'O caminho dos ancestrais iluminados',
      practices: ['Meditação ao amanhecer', 'Honra aos antepassados', 'Estudo das tradições'],
      blessings: ['Visão clara', 'Conexão ancestral', 'Sabedoria'],
    },
    {
      name: 'Ori',
      description: 'O caminho da cabeça espiritual',
      practices: ['Saudação à cabeça', 'Purificação mental', 'Jejum ritual'],
      blessings: ['Discernimento', 'Alinhamento espiritual', 'Propósito'],
    },
    {
      name: 'Owu',
      description: 'O caminho da transformação pela luz',
      practices: ['Rituais de purificação', 'Unções sagradas', 'Cânticos de abertura'],
      blessings: ['Renovação', 'Transformação', 'Ascensão'],
    },
  ],
};

export function getData(): OxaguiaData {
  return OXAGUIA_DATA;
}

export function getDataById(id: string): OxaguiaData | undefined {
  return id === 'oxaguia' ? OXAGUIA_DATA : undefined;
}

export function getDawnRituals(): DawnRitualData[] {
  return OXAGUIA_DATA.dawnRituals;
}

export function getSacredPaths(): SacredPathData[] {
  return OXAGUIA_DATA.sacredPaths;
}

export function getAwakeningPrinciples(): string[] {
  return OXAGUIA_DATA.awakeningPrinciples;
}

export function getOxaguiaByElement(element: string): OxaguiaData | undefined {
  return OXAGUIA_DATA.element.toLowerCase().includes(element.toLowerCase())
    ? OXAGUIA_DATA
    : undefined;
}

export function getOxaguiaByDay(day: string): OxaguiaData | undefined {
  return OXAGUIA_DATA.dayOfWeek.toLowerCase().includes(day.toLowerCase())
    ? OXAGUIA_DATA
    : undefined;
}