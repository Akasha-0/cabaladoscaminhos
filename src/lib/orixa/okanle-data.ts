// @ts-nocheck
// SKIP_LINT

/**
 * Okanle Data Module
 * Spiritual data for Okanle, the Orixá of commerce, wealth, and prosperity
 */

export interface OkanleOfferings {
  primary: string[];
  secondary: string[];
  forbidden: string[];
}

export interface OkanleSymbols {
  key: string;
  ikin: string;
  divination: string;
  alter: string;
  connection: string;
}

export interface OkanleMythology {
  origin: string;
  story: string;
  teaching: string;
}

export interface OkanleRitual {
  name: string;
  description: string;
  timing: string;
  steps: string[];
}

export interface OkanleData {
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
  offerings: OkanleOfferings;
  chants: string[];
  symbols: OkanleSymbols;
  mythology: OkanleMythology;
  spiritualLesson: string;
  affirmation: string;
  meditation: string;
  rituals: OkanleRitual[];
  nature: string;
  meaning: string;
  eshemus: string[];
  awose: string[];
}

const OKANLE_DATA: OkanleData[] = [
  {
    id: 'okanle',
    name: 'Okanle',
    nameYoruba: 'Okanle',
    namePortuguese: 'Senhor do Dinheiro e dos Bens',
    path: 'Odu',
    element: 'Terra e Fogo',
    colors: ['Verde', 'Azul', 'Branco'],
    dayOfWeek: 'Terça-feira',
    numbersSacred: [4, 7, 14],
    greeting: 'Okanle!',
    archetype: 'O Guardião da Prosperidade e do Comércio',
    qualities: ['Prosperidade', 'Comércio', 'Bens materiais', 'Generosidade', 'Abundância', 'Negócios'],
    challenges: ['Avareza', 'Mesquinhez', 'Gás三人zia'],
    rulingPlanet: 'Mercúrio',
    sacredAnimals: ['Galinha', 'Cavalo', 'Bode'],
    plants: ['Alface', 'Coentro', 'Pimentão'],
    offerings: {
      primary: ['Dinheiro', 'Mel', 'Azeite de dendê', 'Velas douradas'],
      secondary: ['Farinha branca', 'Cachaça', 'Acúcar', 'Frango'],
      forbidden: ['Carne bovina', 'Sal em excesso', 'Fogo de manera']
    },
    chants: ['Okanle na owo!', 'Okanle okan mi o!', 'A baraka'],
    symbols: {
      key: 'Orixá das finanças e do bem-estar material',
      ikin: 'Quatro Ikins (castanhas/kieler)',
      divination: 'Okanle revela caminhos de prosperidade e oportunidades comerciais',
      alter: 'Sagrário de Efun',
      connection: 'Conecta com Oxum e os orixás de abundancia'
    },
    mythology: {
      origin: 'Okanle emergiu quando os mercados foram criados e a troca foi establecida',
      story: 'Okanle é o orixá que guarda todo o dinheiro e todos os bens da terra. Quando este Odu aparece, os ancestres estão revelando caminhos de prosperidade material. Okanle governa as oportunidades de negócio e a abundancia que vem pelo trabalho.',
      teaching: 'A verdadera prosperidade não está em guardar, mas em circul ar a abundancia com sabedoria e generosidade.'
    },
    spiritualLesson: 'A riqueza verdadeira vem do trabalho honesto e da capacidad de compartir con los demás',
    affirmation: 'Eu abraço a prosperidade que flui para minha vida. Meu trabalho é abençoado e minha mesa está sempre cheia.',
    meditation: 'Sinto a energia da abundância circulando em minha vida. Visualize richesse e prosperidade fluindo como um río incessante.',
    rituals: [
      {
        name: 'Ojukwu Okanle',
        description: 'Ritual para atraer prosperidade e abrir caminhos financiers',
        timing: 'Terça-feira pela manhã',
        steps: [
          'Prepare um local sagrado com toalha verde',
          'Coloque velas douradas nos quatro cantos',
          'Acenda incenso de alecrim',
          'Recite os cantos sagrados de Okanle',
          'Ofereça dinheiro e mel ao centro',
          'Peça a Okanle que abençoe seus trabalhos'
        ]
      },
      {
        name: 'Oração da Prosperidade',
        description: 'Oração para abrir caminhos de prosperidade nos negócios',
        timing: 'Qualquer dia de terça-feira',
        steps: [
          'Em silêncio, peça permissão a Okanle',
          'Recite os cantos sagrados',
          'Visualize a prosperidade circulando',
          'Agradeça pelo dinheiro recebido',
          'Faça promessas de oferecer primero a Deus'
        ]
      }
    ],
    nature: 'Okanle é o princípio da prosperidade e do comércio. Ele governa o dinheiro e todos os bens materiais. Este Odu traz a mensagem de que a abundancia está disponível para quem trabalha com honestidade e comparte com os demais.',
    meaning: 'Okanle fala sobre dinheiro, bens, comércio, prosperidade. Sua mensagem principal é que existe um fluxo de abundancia esperando ser ativado attravez do trabalho e da generosidade.',
    eshemus: ['Okanle', 'Oxum', 'Olofin', 'Olodumare', 'Eshu'],
    awose: ['Dinheiro', 'Bens', 'Comércio', 'Prosperidade', 'Riqueza', 'Abundância']
  }
];

export function getData(): OkanleData[] {
  return OKANLE_DATA;
}

export function getDataById(id: string): OkanleData | undefined {
  return OKANLE_DATA.find((o) => o.id === id);
}

export function searchData(query: string): OkanleData[] {
  const lowerQuery = query.toLowerCase();
  return OKANLE_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(lowerQuery) ||
      o.path.toLowerCase().includes(lowerQuery) ||
      o.archetype.toLowerCase().includes(lowerQuery) ||
      o.awose.some((a) => a.toLowerCase().includes(lowerQuery))
  );
}

export function getOkanleByElement(element: string): OkanleData[] {
  return OKANLE_DATA.filter((o) => o.element.toLowerCase().includes(element.toLowerCase()));
}

export function getOkanleByPlanet(planet: string): OkanleData[] {
  return OKANLE_DATA.filter((o) => o.rulingPlanet.toLowerCase().includes(planet.toLowerCase()));
}
