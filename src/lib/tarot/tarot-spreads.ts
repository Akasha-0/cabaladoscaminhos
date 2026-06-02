// fallow-ignore-file unused-file
export interface SpreadPosition {
  index: number;
  name: string;
  meaning: string;
  question?: string;
}

export interface TarotSpread {
  id: string;
  name: string;
  namePt: string;
  description: string;
  descriptionPt: string;
  positions: SpreadPosition[];
  totalCards: number;
  category: 'quick' | 'general' | 'detailed';
}

const SINGLE_CARD: TarotSpread = {
  id: 'single-card',
  name: 'Single Card',
  namePt: 'Carta Única',
  description: 'A quick insight from one card for immediate guidance.',
  descriptionPt: 'Uma visão rápida de uma carta para orientação imediata.',
  totalCards: 1,
  category: 'quick',
  positions: [
    { index: 0, name: 'Daily Card', meaning: 'Your guidance for the day or moment.', question: 'What do I need to know right now?' },
  ],
};

const THREE_CARD: TarotSpread = {
  id: 'three-card',
  name: 'Three Card',
  namePt: 'Três Cartas',
  description: 'Past, present, and future — a fundamental reading.',
  descriptionPt: 'Passado, presente e futuro — uma leitura fundamental.',
  totalCards: 3,
  category: 'general',
  positions: [
    { index: 0, name: 'Past', meaning: 'What has led to this moment.', question: 'What from my past influences this situation?' },
    { index: 1, name: 'Present', meaning: 'Current energies at play.', question: 'What is happening now?' },
    { index: 2, name: 'Future', meaning: 'What is developing ahead.', question: 'What is unfolding for me?' },
  ],
};

const MINORITY_REMEDY: TarotSpread = {
  id: 'minority-remedy',
  name: 'Minority Remedy',
  namePt: 'Remédio do Minoritário',
  description: 'A five-card spread from Orixá tradition for guidance and resolution.',
  descriptionPt: 'Uma distribuição de cinco cartas da tradição dos Orixás para orientação e resolução.',
  totalCards: 5,
  category: 'general',
  positions: [
    { index: 0, name: 'Current Situation', meaning: 'The present state of affairs.' },
    { index: 1, name: 'Root Cause', meaning: 'The underlying issue requiring attention.' },
    { index: 2, name: 'Guidance', meaning: 'The spiritual guidance and path forward.' },
    { index: 3, name: 'Action', meaning: 'What should be taken or avoided.' },
    { index: 4, name: 'Outcome', meaning: 'The expected result if guidance is followed.' },
  ],
};

const CROSS_CHOICE: TarotSpread = {
  id: 'cross-choice',
  name: 'Cross of Choice',
  namePt: 'Cruz de Escolha',
  description: 'Four cards forming a cross to compare options or make decisions.',
  descriptionPt: 'Quatro cartas formando uma cruz para comparar opções ou tomar decisões.',
  totalCards: 4,
  category: 'general',
  positions: [
    { index: 0, name: 'Option A', meaning: 'Characteristics and energy of choice A.' },
    { index: 1, name: 'Option B', meaning: 'Characteristics and energy of choice B.' },
    { index: 2, name: 'Foundation', meaning: 'The underlying context affecting both choices.' },
    { index: 3, name: 'Advice', meaning: 'Guidance on which path to take.' },
  ],
};

const HOROSCOPE: TarotSpread = {
  id: 'horoscope',
  name: 'Tarot Horoscope',
  namePt: 'Horóscopo Tarot',
  description: 'Seven cards offering detailed guidance for all life areas.',
  descriptionPt: 'Sete cartas oferecendo orientação detalhada para todas as áreas da vida.',
  totalCards: 7,
  category: 'detailed',
  positions: [
    { index: 0, name: 'Love', meaning: 'Love and relationships.' },
    { index: 1, name: 'Career', meaning: 'Career and purpose.' },
    { index: 2, name: 'Finance', meaning: 'Financial situation and abundance.' },
    { index: 3, name: 'Health', meaning: 'Physical and mental well-being.' },
    { index: 4, name: 'Spirituality', meaning: 'Spiritual growth and connection.' },
    { index: 5, name: 'Home', meaning: 'Home, family, and environment.' },
    { index: 6, name: 'Outlook', meaning: 'Overall energy and trajectory.' },
  ],
};

const PATH_CARD: TarotSpread = {
  id: 'path-card',
  name: 'Path Card',
  namePt: 'Carta do Caminho',
  description: 'Five cards mapping a journey from origin to destination.',
  descriptionPt: 'Cinco cartas mapeando uma jornada do início ao destino.',
  totalCards: 5,
  category: 'general',
  positions: [
    { index: 0, name: 'Origin', meaning: 'Where you are now.' },
    { index: 1, name: 'Challenge', meaning: 'Obstacle or lesson on the path.' },
    { index: 2, name: 'Guide', meaning: 'Support or ally available to you.' },
    { index: 3, name: 'Destination', meaning: 'Where you are heading or the goal.' },
    { index: 4, name: 'Lesson', meaning: 'The spiritual lesson to carry forward.' },
  ],
};

const YEAR_SPREAD: TarotSpread = {
  id: 'year-spread',
  name: 'Year Spread',
  namePt: 'Distribuição do Ano',
  description: 'Twelve cards representing each month of the year for annual guidance.',
  descriptionPt: 'Doze cartas representando cada mês do ano para orientação anual.',
  totalCards: 12,
  category: 'detailed',
  positions: [
    { index: 0, name: 'January', meaning: 'Energy and theme for January.' },
    { index: 1, name: 'February', meaning: 'Energy and theme for February.' },
    { index: 2, name: 'March', meaning: 'Energy and theme for March.' },
    { index: 3, name: 'April', meaning: 'Energy and theme for April.' },
    { index: 4, name: 'May', meaning: 'Energy and theme for May.' },
    { index: 5, name: 'June', meaning: 'Energy and theme for June.' },
    { index: 6, name: 'July', meaning: 'Energy and theme for July.' },
    { index: 7, name: 'August', meaning: 'Energy and theme for August.' },
    { index: 8, name: 'September', meaning: 'Energy and theme for September.' },
    { index: 9, name: 'October', meaning: 'Energy and theme for October.' },
    { index: 10, name: 'November', meaning: 'Energy and theme for November.' },
    { index: 11, name: 'December', meaning: 'Energy and theme for December.' },
  ],
};

const ELEMENTAL_SPREAD: TarotSpread = {
  id: 'elemental-spread',
  name: 'Elemental Spread',
  namePt: 'Distribuição Elemental',
  description: 'Five cards aligned with the elements for spiritual harmony.',
  descriptionPt: 'Cinco cartas alinhadas aos elementos para harmonia espiritual.',
  totalCards: 5,
  category: 'general',
  positions: [
    { index: 0, name: 'Fire', meaning: 'Passion, courage, and transformative energy.' },
    { index: 1, name: 'Water', meaning: 'Emotion, intuition, and flow.' },
    { index: 2, name: 'Air', meaning: 'Thought, communication, and clarity.' },
    { index: 3, name: 'Earth', meaning: 'Stability, abundance, and manifestation.' },
    { index: 4, name: 'Spirit', meaning: 'Connection to the divine and higher purpose.' },
  ],
};

const MANIFESTATION_SPREAD: TarotSpread = {
  id: 'manifestation-spread',
  name: 'Manifestation Spread',
  namePt: 'Distribuição de Manifestação',
  description: 'Seven cards to clarify and manifest your deepest intentions.',
  descriptionPt: 'Sete cartas para esclarecer e manifestar suas intenções mais profundas.',
  totalCards: 7,
  category: 'detailed',
  positions: [
    { index: 0, name: 'Intention', meaning: 'What you truly desire to manifest.' },
    { index: 1, name: 'Desire', meaning: 'The emotional driving force behind the intention.' },
    { index: 2, name: 'Belief', meaning: 'Current belief that supports or blocks the manifestation.' },
    { index: 3, name: 'Action', meaning: 'Steps required to move toward manifestation.' },
    { index: 4, name: 'Obstacle', meaning: 'What may stand in the way.' },
    { index: 5, name: 'Resource', meaning: 'What you have to support this journey.' },
    { index: 6, name: 'Fulfillment', meaning: 'The outcome when alignment is achieved.' },
  ],
};

const spreads: TarotSpread[] = [
  SINGLE_CARD,
  THREE_CARD,
  MINORITY_REMEDY,
  CROSS_CHOICE,
  HOROSCOPE,
  PATH_CARD,
  YEAR_SPREAD,
  ELEMENTAL_SPREAD,
  MANIFESTATION_SPREAD,
];

export function getSpreads(): TarotSpread[] {
  return spreads;
}

export function getSpreadById(id: string): TarotSpread | undefined {
  return spreads.find((s) => s.id === id);
}

export function getSpreadsByCategory(category: TarotSpread['category']): TarotSpread[] {
  return spreads.filter((s) => s.category === category);
}
