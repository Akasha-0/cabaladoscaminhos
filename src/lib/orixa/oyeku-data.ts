// @ts-nocheck
// SKIP_LINT

/**
 * Oyeku Data Module
 * Spiritual data for Oyeku, the Odu of wealth, destiny, and hidden treasures
 */

export interface OyekuOfferings {
  primary: string[];
  secondary: string[];
  forbidden: string[];
}

export interface OyekuSymbols {
  key: string;
  ikin: string;
  divination: string;
  alter: string;
  connection: string;
}

export interface OyekuMythology {
  origin: string;
  story: string;
  teaching: string;
}

export interface OyekuRitual {
  name: string;
  description: string;
  timing: string;
  steps: string[];
}

export interface OyekuData {
  id: string;
  name: string;
  nameYoruba: string;
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
  offerings: OyekuOfferings;
  chants: string[];
  symbols: OyekuSymbols;
  mythology: OyekuMythology;
  spiritualLesson: string;
  affirmation: string;
  meditation: string;
  rituals: OyekuRitual[];
  nature: string;
  meaning: string;
  eshemus: string[];
  awose: string[];
}

const OYEKU_DATA: OyekuData[] = [
  {
    id: 'oyeku',
    name: 'Oyeku',
    nameYoruba: 'Oyeku',
    namePortuguese: 'Senhor da Riqueza e do Destino',
    path: 'Odu',
    element: 'Água e Escuridão',
    colors: ['Preto', 'Azul escuro', 'Dourado'],
    dayOfWeek: 'Terça-feira',
    numbersSacred: [8, 12, 16],
    greeting: 'Oyeku!',
    archetype: 'O Guardião dos Tesouros Ocultos',
    qualities: ['Riqueza', 'Tesouros ocultos', 'Destino fixo', 'Mistério', 'Poder terrestre', 'Abundância'],
    challenges: ['Ganância', 'Avidez', 'Inveja'],
    rulingPlanet: 'Saturno',
    sacredAnimals: ['Cobra', 'Coruja', 'Lebre'],
    plants: ['Pau-brasil', 'Mangueira', 'Palmeira'],
    offerings: {
      primary: ['Milho torrado', 'Dinheiro', 'Velas pretas', 'Azeite de dendê'],
      secondary: ['Farinha de mandioca', 'Mel', 'Fumo de rolo', 'Obi'],
      forbidden: ['Carne bovina', 'Sal', 'Pimenta em excesso']
    },
    chants: ['Oyeku me fa!', 'Olofin o ni o!', 'A bora okan'],
    symbols: {
      key: 'Odu da riqueza e dos destinos ocultos',
      ikin: 'Oito Ikins (castanhas/kieler)',
      divination: 'Oyeku revela destinos fixos e oportunidades de prosperidade',
      alter: 'Sagrário de Efun',
      connection: 'Conecta com Olodumare e os orixás de riqueza'
    },
    mythology: {
      origin: 'Oyeku emergiu quando os mundos foram criados e os destinos distribuidos',
      story: 'Oyeku é o orixá que guarda todos os tesouros da terra. Quando este Odu aparece, os ancestrais estão revelando caminhos de prosperidade. Oyeku governa o destino que não pode ser alterado - apenas aceito e trabalhado.',
      teaching: 'A verdadeira riqueza não está no que se possui, mas no que se sabe fazer com o destino.'
    },
    spiritualLesson: 'A abundância verdadeira vem do trabalho sagrado e da compreensão dos ciclos de provisão',
    affirmation: 'Eu abraço a prosperidade que flui para minha vida. Meu destino está alinhado com a abundância divina.',
    meditation: 'Sinto a energia da terra conectando-me com as raízes da prosperidade. Visualize tesouros ocultos sendo revelados.',
    rituals: [
      {
        name: 'Itutu Oyeku',
        description: 'Ritual para abrir caminhos de prosperidade',
        timing: 'Terça-feira à noite',
        steps: [
          'Prepare um local sagrado com toalha preta',
          'Coloque azeite de dendê nos quatro cantos',
          'Acenda velas pretas nos quatro cantos',
          'Recite o poema de Oyeku',
          'Ofereça milho torrado ao centro',
          'Peça a Oyeku que revele caminhos de abundancia'
        ]
      },
      {
        name: 'Oração da Riqueza',
        description: 'Oração para atraír prosperidade e abrir caminhos financeiros',
        timing: 'Qualquer dia de terça-feira',
        steps: [
          'Em silencio, peça permissão a Oyeku',
          'Recite os cantos sagrados',
          'Visualize a abundância fluindo',
          'Agradeça pelos bens recebidos',
          'Faça promessas de oferecer primeiro a Deus'
        ]
      }
    ],
    nature: 'Oyeku e o principio da riqueza e do destino. Ele governa os tesouros escondidos e os caminhos ja traçados. Este Odu traz a mensagem de que a prosperidade esta disponivel para quem trabalha com paciencia e respeito.',
    meaning: 'Oyeku fala sobre dinheiro, heranca, destino, prosperidade. Sua mensagem principal e que existe um fluxo de abundancia esperando ser descoberto.',
    eshemus: ['Oyeku', 'Olofin', 'Olodumare', 'Eshu'],
    awose: ['Dinheiro', 'Heranca', 'Destino', 'Tesouro', 'Prosperidade', 'Riqueza']
  }
];

export function getData(): OyekuData[] {
  return OYEKU_DATA;
}

export function getDataById(id: string): OyekuData | undefined {
  return OYEKU_DATA.find((o) => o.id === id);
}

export function searchData(query: string): OyekuData[] {
  const lowerQuery = query.toLowerCase();
  return OYEKU_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(lowerQuery) ||
      o.path.toLowerCase().includes(lowerQuery) ||
      o.archetype.toLowerCase().includes(lowerQuery) ||
      o.awose.some((a) => a.toLowerCase().includes(lowerQuery))
  );
}

export function getOyekuByElement(element: string): OyekuData[] {
  return OYEKU_DATA.filter((o) => o.element.toLowerCase().includes(element.toLowerCase()));
}

export function getOyekuByPlanet(planet: string): OyekuData[] {
  return OYEKU_DATA.filter((o) => o.rulingPlanet.toLowerCase().includes(planet.toLowerCase()));
}
