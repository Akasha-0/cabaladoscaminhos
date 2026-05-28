// @ts-nocheck
// SKIP_LINT

/**
 * Ogunhle Data Module
 * Spiritual data for Ogunhle, the orixá of iron, strength, and determination
 */

export interface OgunhleData {
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

const OGUNHLE_DATA: OgunhleData[] = [
  {
    id: 'ogunhle',
    name: 'Ogunhlê',
    namePortuguese: 'Senhor do Ferro e do Trabalho',
    path: 'Ogum',
    element: 'Metal e Ferro',
    colors: ['#2E8B57', '#000000', '#4A4A4A'],
    dayOfWeek: 'Sexta-feira',
    numbersSacred: [4, 7, 12],
    greeting: 'Ogunhê!',
    archetype: 'O Ferreiro Determinado',
    qualities: ['Força', 'Determinação', 'Coragem', 'Proteção', 'Trabalho', 'Justiça'],
    challenges: ['Teimosia', 'Impaciência', 'Rigidez'],
    rulingPlanet: 'Marte',
    sacredAnimals: ['Cavalo', 'Búfalo', 'Coruja'],
    plants: ['Quiabo', 'Pimenta', 'Arruda'],
    offerings: ['Ferro', 'Facões', 'Rapadura', 'Azeite de dendê', 'Gengibre'],
    chants: ['Ogunhê', 'Ogum', 'Elemujê'],
    symbols: ['Espada', 'Facão', 'Chave', 'Ferro em forma'],
    mythology:
      'Ogunhlê é o orixá que guarda o ferro e comanda o trabalho dos artesãos. companions Ogun em suas jornadas e protege aqueles que trabalham com metal. Ogunhlê ensina que a verdadeira força vem da persistência e do trabalho honesto.',
    spiritualLesson: 'A verdadeira força se manifesta na persistência e na coragem de trabalhar pelo que é certo',
    affirmation: 'Eu tenho força e determinação para superar todos os obstáculos, trabalhando com coragem e honestidade',
    meditation: 'Visualize uma espada de ferro brilhante em suas mãos, protegendo seu caminho e iluminando sua jornada',
  },
  {
    id: 'ogunhle-alabê',
    name: 'Ogunhlê Alabê',
    namePortuguese: 'O Mestre Ferreiro',
    path: 'Ogum',
    element: 'Metal forjado',
    colors: ['#2E8B57', '#8B4513', '#000000'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [3, 9, 15],
    greeting: 'Alabê!',
    archetype: 'O Mestre dos Metais',
    qualities: ['Mestria', 'Criação', 'Disciplina', 'Força', 'Sabedoria prática', 'Proteção'],
    challenges: ['Autocriticismo excessivo', 'Perfeccionismo', 'Dificuldade em relaxar'],
    rulingPlanet: 'Saturno',
    sacredAnimals: ['Cavalo preto', 'Mula', 'Bode'],
    plants: ['Erythrina', 'Palmeira', 'Mangue'],
    offerings: ['Ferramentas', 'Velas verdes', 'Farinha', 'Vinho de palma', 'Colher de ferro'],
    chants: ['Alabê', 'Ogunhê', 'Ibinu'],
    symbols: ['Martelo', 'Bigorna', 'Ferro em brasa', 'Marcação de ferro'],
    mythology:
      'Ogunhlê Alabê é a expressão mais elevada de Ogunhlê, o mestre ferreiro que forja ferramentas para a comunidade. Ele é chamado para abençoar todas as ferramentas de trabalho e proteger os artesãos em seu ofício.',
    spiritualLesson: 'A verdadeira mestria vem da prática dedicada e do respeito pelo trabalho manual',
    affirmation: 'Eu forjo minha vida com propósito e disciplina, criando obras que refletem minha alma',
    meditation: 'Imagine-se diante de uma bigorna, forjando uma versão melhor de si mesmo com cada golpe de martelo',
  },
];

export function getData(): OgunhleData[] {
  return OGUNHLE_DATA;
}

export function getDataById(id: string): OgunhleData | undefined {
  return OGUNHLE_DATA.find((o) => o.id === id);
}

export function searchData(query: string): OgunhleData[] {
  const q = query.toLowerCase();
  return OGUNHLE_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(q) ||
      o.path.toLowerCase().includes(q) ||
      o.element.toLowerCase().includes(q) ||
      o.qualities.some((qual) => qual.toLowerCase().includes(q))
  );
}

export function getOgunhleByDay(day: string): OgunhleData[] {
  return OGUNHLE_DATA.filter((o) => o.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

export function getOgunhleByElement(element: string): OgunhleData[] {
  return OGUNHLE_DATA.filter((o) => o.element.toLowerCase().includes(element.toLowerCase()));
}