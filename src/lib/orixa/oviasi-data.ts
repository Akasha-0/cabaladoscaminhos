/* prettier-ignore */
// @ts-nocheck
// SKIP_LINT

/**
 * Oviasi Data Module
 * Spiritual data for Oviasi, the orixá of transformation, rebirth, and sacred cycles
 */

export interface OviasiData {
  id: string;
  name: string;
  namePortuguese: string;
  nameYoruba: string;
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
  transformationStages: string[];
  sacredCycles: string[];
  rebirthPractices: string[];
}

const OVIASI_DATA: OviasiData = {
  id: 'oviasi',
  name: 'Oviasi',
  namePortuguese: 'Senhor da Transformacao e dos Ciclos Sagrados',
  nameYoruba: 'Oviasi',
  path: 'Mestre da Metamorfose Espiritual',
  element: 'Agua e Terra',
  colors: ['Verde', 'Azul', 'Branco', 'Dourado'],
  dayOfWeek: 'Terca-feira',
  numbersSacred: [3, 7, 12, 21],
  greeting: 'Ewa! Oviasi Arrobe!',
  archetype: 'O Transformador dos Ciclos',
  qualities: [
    'Transformacao',
    'Renovacao',
    'Ciclicidade',
    'Adaptabilidade',
    'Transcendencia',
    'Sabedoria regenerativa',
    'Paciencia',
    'Aceitacao',
    'Flexibilidade espiritual',
    'Resiliencia'
  ],
  challenges: [
    'Resistencia a mudanca',
    'Medo do desconhecido',
    'Luto excessivo',
    'Transformacao incompleta',
    'Estagnacao emocional',
    'Dificuldade de soltar o passado'
  ],
  rulingPlanet: 'Netuno',
  sacredAnimals: ['Cobra', 'Sapo', 'Borboleta', 'Tartaruga'],
  plants: ['Alcachofra', 'Salsinha', 'Cebolinha', 'Babosa', 'Hera'],
  offerings: [
    'Galinha',
    'Pombo',
    'Ovo',
    'Farinha de mandioca',
    'Agua de flor',
    'Leite',
    'Mel',
    'Velas verdes e azuis',
    'Alfazema',
    'Ervas de transformacao'
  ],
  chants: [
    'Ewa, Oviasi!',
    'Oviasi Arrobe!',
    'Lalailaiô, Oviasi!',
    'Oviasi transforma!',
    'Oviasi renova!',
    'Ciclos sagrados!'
  ],
  symbols: [
    'Cobra enrollada',
    'Borboleta',
    'Lua crescente',
    'Onda do mar',
    'Espiral',
    'ovo cosmico',
    'Cristal de transformacao'
  ],
  mythology: `Oviasi e o orixá da transformacao, da rebirth e dos ciclos sagrados da vida.
Conhecido como o mestre da metamorfose espiritual, Oviasi governa todos os processos
de mudanca e renovacao na existencia. Ele esta presente em cada transicao: do nascimento
a morte, da escuridao a luz, do velho ao novo.

Oviasi ensina que a transformacao e o unico constante no universo. Cada fim carrega
em si o seed de um novo comienzo, e cada muerte e apenas uma passagem para outra
forma de existencia. Sua energia e suave mas profunda, trabalhando lentamente
como a agua que esculpe a pedra.

Como senhor dos ciclos sagrados, Oviasi conhece os ritmos eternos da natureza
e guia as almas atraves das mutacoes necessarias para sua evolucao. Ele ajuda
os seres a soltar o que ja nao serve, a aceitar as mudancas inevitaveis e
a abracar a renovacao como parte natural da jornada espiritual.`,
  transformationStages: [
    'Dissolucao: soltar o que ja nao serve',
    'Quietude: espaco para a nova forma emergir',
    'Transformacao: metamorfose interior',
    'Renascimento: emergencia da nova consciencia',
    'Integracao: incorporar a nova forma de ser',
    'Expressao: manifestar a transformacao no mundo'
  ],
  sacredCycles: [
    'Ciclo da Lua',
    'Ciclo das Estacoes',
    'Ciclo de Vida e Morte',
    'Ciclo de Aprendizado e Mestria',
    'Ciclo de Integracao e Transcendencia',
    'Ciclo da Alma'
  ],
  rebirthPractices: [
    'Banho de folhas de transformacao ao amanhecer',
    'Meditacao em espiral para soltar o passado',
    'Ritual de released de antigas forms de ser',
    'Oferenda de ovo para renovacao da vitalidade',
    'Canto dos ciclos sagrados de Oviasi',
    'Ritual de passagem em momentos de transicao',
    'Banho de lua crescente para renovacao espiritual'
  ],
  spiritualLesson: 'A verdadeira forca esta na capacidade de se transformar, de soltar o que ja morreu para dar espaco ao que precisa nascer',
  affirmation: 'Eu me transformo com gracia e coragem, acolhendo cada mudanca como parte sagrada da minha jornada espiritual',
  meditation: 'Visualize uma borboleta emergindo suavemente de seu casulo, cada batida de asas trazendo mais luz e liberdade para sua alma',
};

export function getData(): OviasiData {
  return OVIASI_DATA;
}

function getDataById(id: string): OviasiData | undefined {
  return id === 'oviasi' ? OVIASI_DATA : undefined;
}

function getTransformationStages(): string[] {
  return OVIASI_DATA.transformationStages;
}

function getSacredCycles(): string[] {
  return OVIASI_DATA.sacredCycles;
}

function getRebirthPractices(): string[] {
  return OVIASI_DATA.rebirthPractices;
}

function getOviasiByElement(element: string): OviasiData | undefined {
  return OVIASI_DATA.element.toLowerCase().includes(element.toLowerCase()) ? OVIASI_DATA : undefined;
}

function getOviasiByPlanet(planet: string): OviasiData | undefined {
  return OVIASI_DATA.rulingPlanet.toLowerCase().includes(planet.toLowerCase()) ? OVIASI_DATA : undefined;
}

export default {
  getData,
  getDataById,
  getTransformationStages,
  getSacredCycles,
  getRebirthPractices,
  getOviasiByElement,
  getOviasiByPlanet,
};
