 
/* prettier-ignore */

// @ts-nocheck

/**
 * Opor Data Module
 * Spiritual data for Opor, Orixá of abundance and harvest
 */

export interface OporData {
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
  harvestCycle: string[];
  sacredGeometry: string[];
}

const OPOR_DATA: OporData[] = [
  {
    id: 'opor',
    name: 'Opor',
    namePortuguese: 'Senhor da Abundância',
    path: 'Ayo',
    element: 'Terra e Água',
    colors: ['#228B22', '#FFA500', '#8B4513'],
    dayOfWeek: 'Segunda-feira',
    numbersSacred: [6, 8, 12],
    greeting: 'Opor Ora!',
    archetype: 'O Doleiro Generoso',
    qualities: ['Abundância', 'Prosperidade', 'Generosidade', 'Gratidão', 'Colheita', 'Nutrição'],
    challenges: ['Avidez', 'Gulatice', 'Ingratidão'],
    rulingPlanet: 'Vênus',
    sacredAnimals: ['Boi', 'Cavalo', 'Pomba'],
    plants: ['Milho', 'Feijão', 'Mandioca', 'Cana-de-açúcar'],
    offerings: ['Velas verdes', 'Farinha de咽', 'Mel', 'Frutas madurus'],
    chants: ['Opor', 'Ayo', 'Ora Opor', 'Colheita'],
    symbols: ['Espiga de milho', 'Foice', 'Cesto de frutas', 'Sol brilhante'],
    mythology:
      'Opor é o orixá que rege a abundância e a colheita. Ele bendiz as plantações e garante que a terra produza em abundância. É o doleiro generoso que distribui os dons da natureza a todos os Seus filhos.',
    spiritualLesson:
      'A verdadeira abundância não está em acumular, mas em compartilhar. Quando agradecemos pelo que temos, abrimos espaço para que mais bênçãos fluam em nossas vidas.',
    affirmation:
      'Eu sou digno de abundância. Agradecido por todas as bênçãos que recebo, abro meu coração para compartilhar com outros.',
    meditation:
      'Visualize campos dourados se estendendo até o horizonte. Sinta a lightness of being abundant. Permita que Opor Encha seu coração com gratidão e generosidade.',
    harvestCycle: [
      'Plantio - Semear com intenção',
      'Crescimento - Nutrir com paciência',
      'Floração - Celebrar a beleza',
      'Colheita - Receber com gratidão',
    ],
    sacredGeometry: ['Espiga de Milho', 'Círculos Concêntricos', 'Hexagrama Terrestre'],
  },
];

export function getData(): OporData[] {
  return OPOR_DATA;
}

export function getDataById(id: string): OporData | undefined {
  return OPOR_DATA.find((o) => o.id === id);
}

function searchData(query: string): OporData[] {
  const q = query.toLowerCase();
  return OPOR_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(q) ||
      o.namePortuguese.toLowerCase().includes(q) ||
      o.qualities.some((q) => q.toLowerCase().includes(q)) ||
      o.symbols.some((s) => s.toLowerCase().includes(q)),
  );
}

function getOporByDay(day: string): OporData[] {
  return OPOR_DATA.filter((o) => o.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

function getOporByElement(element: string): OporData[] {
  return OPOR_DATA.filter((o) => o.element.toLowerCase().includes(element.toLowerCase()));
}
