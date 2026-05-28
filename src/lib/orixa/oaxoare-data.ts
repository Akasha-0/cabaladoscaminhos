 
// @ts-nocheck

/**
 * Oaxoare Data Module
 * Spiritual data for Oaxoare, the orixá of transformation and renewal
 */

export interface OaxoareData {
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
}

const OAXOARE_DATA: OaxoareData[] = [
  {
    id: 'oaxoare',
    name: 'Oaxoare',
    namePortuguese: 'Senhor da Transformação',
    path: 'Owonrin',
    element: 'Água e Terra',
    colors: ['#4B0082', '#20B2AA'],
    dayOfWeek: 'Quinta-feira',
    numbersSacred: [7, 13, 21],
    greeting: 'Ewole!',
    archetype: 'O Transformador Eterno',
    qualities: ['Adaptabilidade', 'Renovação', 'Sabedoria', 'Paciência', 'Resiliência', 'Intuição'],
    challenges: ['Indecisão', 'Medo das mudanças', 'Rigidez emocional'],
    rulingPlanet: 'Netuno',
    sacredAnimals: ['Cobra', 'Sapo', 'Coruja'],
    plants: ['Alamanda', 'Guiné', 'Arruda'],
    offerings: ['Água de flor', 'Ovo cozido', 'Perfume de jasmine', 'Velas roxas'],
    chants: ['Oaxoare', 'Ewole', 'Alá'],
    symbols: ['Cascavel', 'Espiral', 'Água corrente'],
    mythology:
      'Oaxoare é o orixá que governa as transformações invisíveis. Ele habita os momentos de mudança entre estados, guiando as almas através das metamorfoses necessárias para o crescimento espiritual.',
    spiritualLesson: 'A verdadeira sabedoria está em aceitar que a transformação é a única constante da existência',
    affirmation: 'Eu abraço a mudança como oportunidade de renovação e confio no processo de transformação',
    meditation: 'Visualize-se como água fluindo entre formas, aceitando cada transformação com grace e paz interior',
  },
];

export function getData(): OaxoareData[] {
  return OAXOARE_DATA;
}

export function getDataById(id: string): OaxoareData | undefined {
  return OAXOARE_DATA.find((o) => o.id === id);
}

export function searchData(query: string): OaxoareData[] {
  const lowerQuery = query.toLowerCase();
  return OAXOARE_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(lowerQuery) ||
      o.namePortuguese.toLowerCase().includes(lowerQuery) ||
      o.qualities.some((q) => q.toLowerCase().includes(lowerQuery)) ||
      o.element.toLowerCase().includes(lowerQuery) ||
      o.mythology.toLowerCase().includes(lowerQuery)
  );
}