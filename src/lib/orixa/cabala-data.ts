// @ts-nocheck
// SKIP_LINT

/**
 * Cabala Data Module
 * Spiritual data for Kabbalah/Cabala mystical system
 */

export interface CabalaData {
  id: string;
  name: string;
  namePortuguese: string;
  path: string;
  sephirah: string;
  sephirahHebrew: string;
  numericValue: number;
  element: string;
  planet: string;
  zodiacSign: string;
  colors: string[];
  dayOfWeek: string;
  qualities: string[];
  divineName: string;
  angelicChoir: string;
  meanings: string[];
  meditation: string;
  affirmation: string;
}

const CABALA_DATA: CabalaData[] = [
  {
    id: 'keter',
    name: 'Keter',
    namePortuguese: 'Coroa',
    path: '1',
    sephirah: 'Keter',
    sephirahHebrew: 'כתר',
    numericValue: 620,
    element: 'Ether',
    planet: 'Não tem',
    zodiacSign: 'Além do Zodíaco',
    colors: ['Branco brilhante', 'Transparente'],
    dayOfWeek: 'Domingo',
    qualities: ['无穷', '先于创造', '极致的纯粹'],
    divineName: 'Ehyeh',
    angelicChoir: 'Haqadushim',
    meanings: ['Coroa', 'Infinitude', 'Vontade Divina', 'Primordial'],
    meditation: 'Contempla o ponto antes da existência, onde a vontade divina inicia toda criação.',
    affirmation: 'Eu sou além de forma, além de limitação. Minha essência é luz pura e infinita.',
  },
  {
    id: 'chokhmah',
    name: 'Chokhmah',
    namePortuguese: 'Sabedoria',
    path: '2',
    sephirah: 'Chokhmah',
    sephirahHebrew: 'חכמה',
    numericValue: 73,
    element: 'Fire',
    planet: 'Sol',
    zodiacSign: 'Áries',
    colors: ['Cinza', 'Vermelho escuro'],
    dayOfWeek: 'Domingo',
    qualities: ['Dinâmica', 'Ativa', 'Expansiva'],
    divineName: 'Yah',
    angelicChoir: 'Auphanim',
    meanings: ['Sabedoria primordial', 'Força masculina', 'Impulso criativo'],
    meditation: 'Sinta a chama da sabedoria ardendo no centro do ser, alimentando toda compreensão.',
    affirmation: 'Minha sabedoria é ilimitada. A compreensão infinita flui através de mim.',
  },
  {
    id: 'binah',
    name: 'Binah',
    namePortuguese: 'Compreensão',
    path: '3',
    sephirah: 'Binah',
    sephirahHebrew: 'בינה',
    numericValue: 67,
    element: 'Water',
    planet: 'Saturno',
    zodiacSign: 'Leão',
    colors: ['Preto', 'Branco'],
    dayOfWeek: 'Sábado',
    qualities: ['Receptiva', 'Estável', 'Feminina'],
    divineName: 'Yahweh',
    angelicChoir: 'Aralim',
    meanings: ['Compreensão profunda', 'Inteligência maternal', 'Estrutura'],
    meditation: 'Desça às profundezas da compreensão, onde a matéria recebe forma e significado.',
    affirmation: 'Eu compreendo os mistérios da vida. Minha sabedoria é perfeita e pura.',
  },
  {
    id: 'chesed',
    name: 'Chesed',
    namePortuguese: 'Misericórdia',
    path: '4',
    sephirah: 'Chesed',
    sephirahHebrew: 'חסד',
    numericValue: 72,
    element: 'Water',
    planet: 'Júpiter',
    zodiacSign: 'Escorpião',
    colors: ['Branco', 'Rosa'],
    dayOfWeek: 'Quinta-feira',
    qualities: ['Generosa', 'Expansiva', 'Abundante'],
    divineName: 'El',
    angelicChoir: 'Chashmalim',
    meanings: ['Misericórdia', 'Bondade', 'Generosidade divina'],
    meditation: 'Permita que a graça infinite flua através de você, abençoando todos os seres.',
    affirmation: 'A abundância flui através de mim. Eu sou canal de graça e misericórdia.',
  },
  {
    id: 'geburah',
    name: 'Geburah',
    namePortuguese: 'Severidade',
    path: '5',
    sephirah: 'Geburah',
    sephirahHebrew: 'גבורה',
    numericValue: 216,
    element: 'Fire',
    planet: 'Marte',
    zodiacSign: 'Escorpião',
    colors: ['Vermelho', 'Laranja'],
    dayOfWeek: 'Terça-feira',
    qualities: ['Poderosa', 'Justa', 'Disciplinadora'],
    divineName: 'Elohim',
    angelicChoir: 'Seraphim',
    meanings: ['Força', 'Juízo', 'Severidade divina'],
    meditation: 'Sinta a força que corta o impossível, abrindo caminho através de todo obstáculo.',
    affirmation: 'Eu tenho força para superar qualquer desafio. Meu poder interno é inabalável.',
  },
  {
    id: 'tiferet',
    name: 'Tiferet',
    namePortuguese: 'Beleza',
    path: '6',
    sephirah: 'Tiferet',
    sephirahHebrew: 'תפארת',
    numericValue: 1081,
    element: 'Air',
    planet: 'Sol',
    zodiacSign: 'Leão',
    colors: ['Amarelo', 'Ouro'],
    dayOfWeek: 'Domingo',
    qualities: ['Harmoniosa', 'Equilibrada', 'Bela'],
    divineName: 'Yahweh',
    angelicChoir: 'Malakim',
    meanings: ['Beleza', 'Harmonia', 'Centro do ser'],
    meditation: 'No centro da alma, a luz dourada da beleza primordial brilha em perfeita harmonia.',
    affirmation: 'Eu sou a harmonia incarnada. Beleza e luz emanam de meu ser central.',
  },
  {
    id: 'netzach',
    name: 'Netzach',
    namePortuguese: 'Vitória',
    path: '7',
    sephirah: 'Netzach',
    sephirahHebrew: 'נצח',
    numericValue: 148,
    element: 'Fire',
    planet: 'Vênus',
    zodiacSign: 'Libra',
    colors: ['Verde', 'Amarelo'],
    dayOfWeek: 'Sexta-feira',
    qualities: ['Triunfante', 'Persistente', 'Amorosa'],
    divineName: 'Yahweh',
    angelicChoir: 'Tarshishim',
    meanings: ['Vitória perpétua', 'Paixão', 'Persistência'],
    meditation: 'A vitória reside na persistência amorosa, na busca incansável da verdade.',
    affirmation: 'Eu sempre prevalecerei. O amor e a verdade são minhas armas eternas.',
  },
  {
    id: 'hod',
    name: 'Hod',
    namePortuguese: 'Glória',
    path: '8',
    sephirah: 'Hod',
    sephirahHebrew: 'הוד',
    numericValue: 15,
    element: 'Water',
    planet: 'Mercúrio',
    zodiacSign: 'Virgem',
    colors: ['Laranja', 'Amarelo'],
    dayOfWeek: 'Quarta-feira',
    qualities: ['Humilde', 'Revenerante', 'Organizada'],
    divineName: 'Elohim',
    angelicChoir: 'Isim',
    meanings: ['Glória', 'Humildade', 'Splendor'],
    meditation: 'A glória verdadeira emerge da humildade, onde o ego dissolve na luz divina.',
    affirmation: 'Minha glória é reflexo do divino. Eu reconheço a luz em todos.',
  },
  {
    id: 'yesod',
    name: 'Yesod',
    namePortuguese: 'Fundação',
    path: '9',
    sephirah: 'Yesod',
    sephirahHebrew: 'יסוד',
    numericValue: 80,
    element: 'Earth',
    planet: 'Lua',
    zodiacSign: 'Carciniano',
    colors: ['Roxo', 'Azul'],
    dayOfWeek: 'Segunda-feira',
    qualities: ['Estável', 'Conectiva', 'Fundamental'],
    divineName: 'Shaddai',
    angelicChoir: 'Cherubim',
    meanings: ['Fundação', 'Imaginação', 'Conector'],
    meditation: 'Sobre a firme fundação, construa seu templo interior, pedra sobre pedra sagrada.',
    affirmation: 'Minhas fundações são sólidas como a rocha. Eu sou ancorado na verdade.',
  },
  {
    id: 'malkut',
    name: 'Malkut',
    namePortuguese: 'Reino',
    path: '10',
    sephirah: 'Malkut',
    sephirahHebrew: 'מלכות',
    numericValue: 496,
    element: 'Earth',
    planet: 'Terra',
    zodiacSign: 'Touro',
    colors: ['Verde', 'Amarelo', 'Marrom'],
    dayOfWeek: 'Segunda-feira',
    qualities: ['Manifesta', 'Presente', 'Practical'],
    divineName: 'Adonai',
    angelicChoir: 'Ishim',
    meanings: ['Reino', 'Santuário Divino', 'Presença'],
    meditation: 'O divino se manifesta no mundo através de você. Cada momento é sagrado.',
    affirmation: 'Eu sou o templo do divino. Minha vida é expressão da luz sagrada.',
  },
];

export function getData(): CabalaData[] {
  return CABALA_DATA;
}

export function getDataById(id: string): CabalaData | undefined {
  return CABALA_DATA.find((c) => c.id === id);
}

export function searchData(query: string): CabalaData[] {
  const lowerQuery = query.toLowerCase();
  return CABALA_DATA.filter(
    (c) =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.namePortuguese.toLowerCase().includes(lowerQuery) ||
      c.meanings.some((m) => m.toLowerCase().includes(lowerQuery)) ||
      c.sephirah.toLowerCase().includes(lowerQuery)
  );
}

export function getCabalaByPlanet(planet: string): CabalaData[] {
  return CABALA_DATA.filter((c) => c.planet.toLowerCase() === planet.toLowerCase());
}

export function getCabalaByElement(element: string): CabalaData[] {
  return CABALA_DATA.filter((c) => c.element.toLowerCase().includes(element.toLowerCase()));
}

export function getCabalaByDay(day: string): CabalaData[] {
  return CABALA_DATA.filter((c) => c.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

export function getCabalaByNumericValue(value: number): CabalaData | undefined {
  return CABALA_DATA.find((c) => c.numericValue === value);
}