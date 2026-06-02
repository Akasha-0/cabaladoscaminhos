// Stub for @/lib/oracle/oracle-data
// Module does not exist - stub implementation for test compatibility

export interface OracleData {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  meaning: string;
  element: string;
  sephirah?: string;
  orixa?: string;
  affirmation: string;
  message: string;
  keywords: string[];
}

const oracleCards: OracleData[] = [
  {
    id: 'oracle-001',
    name: 'Kether',
    nameEn: 'Crown',
    description: 'The crown of divine wisdom',
    meaning: 'Enlightenment and unity with source',
    element: 'Fogo',
    sephirah: 'Kether',
    affirmation: 'I am connected to divine wisdom',
    message: 'Your crown chakra opens to receive cosmic knowledge',
    keywords: ['divine', 'wisdom', 'crown', 'source'],
  },
  {
    id: 'oracle-002',
    name: 'Chokhmah',
    nameEn: 'Wisdom',
    description: 'The wheel of wisdom',
    meaning: 'Transformation through understanding',
    element: 'Fogo',
    sephirah: 'Chokhmah',
    affirmation: 'I embrace transformation',
    message: 'Wisdom flows through your awareness',
    keywords: ['wisdom', 'transformation', 'awareness'],
  },
  {
    id: 'oracle-003',
    name: 'Binah',
    nameEn: 'Understanding',
    description: 'Understanding through structure',
    meaning: 'Discipline leads to mastery',
    element: 'Água',
    sephirah: 'Binah',
    orixa: 'Omolu',
    affirmation: 'I find strength in structure',
    message: 'The patient one receives the gift',
    keywords: ['structure', 'patience', 'understanding'],
  },
];

export function getData(): OracleData[] {
  return oracleCards;
}

export function getOracleDataById(id: string): OracleData | undefined {
  return oracleCards.find((card) => card.id === id);
}

export function getOracleDataByElement(element: string): OracleData[] {
  const normalizedElement = element.toLowerCase();
  return oracleCards.filter((card) => card.element.toLowerCase() === normalizedElement);
}

export function getOracleDataByOrixa(orixa: string): OracleData[] {
  const normalizedOrixa = orixa.toLowerCase();
  return oracleCards.filter((card) => card.orixa?.toLowerCase() === normalizedOrixa);
}

export function getOracleDataBySephirah(sephirah: string): OracleData[] {
  const normalizedSephirah = sephirah.toLowerCase();
  return oracleCards.filter((card) => card.sephirah?.toLowerCase() === normalizedSephirah);
}

export function getRandomOracleData(): OracleData {
  return oracleCards[Math.floor(Math.random() * oracleCards.length)];
}

export function getOracleDataCount(): number {
  return oracleCards.length;
}