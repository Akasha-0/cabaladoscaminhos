 
// @ts-nocheck
// SKIP_LINT

/**
 * Obatala Data Module
 * Spiritual data for Obatalá, the orixá of clarity, peace, and the head
 */

export interface ObatalaData {
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

const OBATALA_DATA: ObatalaData[] = [
  {
    id: 'obatala',
    name: 'Obatalá',
    namePortuguese: 'Senhor da Cabeça',
    path: 'Obatalá',
    element: 'Luz e Clareza',
    colors: ['#FFFFFF', '#F5F5DC', '#C0C0C0'],
    dayOfWeek: 'Segunda-feira',
    numbersSacred: [2, 8, 15],
    greeting: 'Oba Ori!',
    archetype: 'O Purificador da Mente',
    qualities: ['Sabedoria', 'Clareza', 'Paz', 'Discernimento', 'Pureza', 'Equilíbrio'],
    challenges: ['Perfeccionismo', 'Rigor excessivo', 'Rigidez mental'],
    rulingPlanet: 'Lua',
    sacredAnimals: ['Cegonha', 'Pomba', 'Cavalo branco'],
    plants: ['Alfarroba', 'Girassol', 'Lótus branco'],
    offerings: ['Azeite de oliva', 'Leite', 'Farinha de milheto', 'Velas brancas', 'Água de flor'],
    chants: ['Oba', 'Ori', 'Ewa'],
    symbols: ['Coroa', 'Manto branco', 'CABEÇA de argila', 'Cruz'],
    mythology:
      'Obatalá é o orixá que governa a cabeça e a mente. Foi ele quem moldou os seres humanos com argila do planeta Terra, dando forma e consciência. Obatalá é considerado o pai de todos os orixás e habita no alto, na região mais elevada do céu.',
    spiritualLesson: 'A verdadeira clareza vem do silêncio interior e da purificação da mente',
    affirmation: 'Eu cultivoclaridade mental e paz interior, deixando minha mente ser um espelho límpido da verdade',
    meditation: 'Visualize uma luz branca e pura descendo sobre sua cabeça, purificando cada pensamento',
  },
  {
    id: 'obatala-oxala',
    name: 'Oxalá',
    namePortuguese: 'O Grande Pai',
    path: 'Obatalá',
    element: 'Luz absoluta',
    colors: ['#FFFFFF', '#FFD700'],
    dayOfWeek: 'Domingo',
    numbersSacred: [1, 7, 9],
    greeting: 'Oxalá!',
    archetype: 'O Criador Originário',
    qualities: ['Criação', 'Ascensão', 'Transcendência', 'Compaixão', 'Ancestralidade', 'Pureza'],
    challenges: ['Distância emocional', 'rigor', 'Sentir-se acima dos outros'],
    rulingPlanet: 'Sol',
    sacredAnimals: ['Cisne', 'Fênix', 'Serpente branca'],
    plants: ['Lótus', 'Jasmim branco', 'Sândalo'],
    offerings: ['Azeite de dendê branco', 'Velas douradas', 'Farinha de cuscuz', 'Frutas brancas', 'Perfume'],
    chants: ['Oxalá', 'Olofi', 'Epa'],
    symbols: ['Cruz ansata', 'Serpente enrollada', 'Espelho convexo', 'Pomo de上风'],
    mythology:
      'Oxalá é a forma mais elevada de Obatalá, o Pai Criador que formou a primeira humanidade. Ele habita nos céus mais altos e delega seus poderes aos outros orixás. Oxalá é a essência da pureza e da luz primordial.',
    spiritualLesson: 'A verdadeira criação começa com a intenção pura e a visão clara do coração',
    affirmation: 'Eu crio com intenção pura e alinhado com minha essência divina, manifests minha verdade mais elevada',
    meditation: 'Imagine-se sentado no topo de uma montanha luminosa, cercado por uma aura de luz branca e dourada',
  },
];

export function getData(): ObatalaData[] {
  return OBATALA_DATA;
}

export function getDataById(id: string): ObatalaData | undefined {
  return OBATALA_DATA.find((o) => o.id === id);
}

export function searchData(query: string): ObatalaData[] {
  const lower = query.toLowerCase();
  return OBATALA_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(lower) ||
      o.namePortuguese.toLowerCase().includes(lower) ||
      o.archetype.toLowerCase().includes(lower) ||
      o.qualities.some((q) => q.toLowerCase().includes(lower))
  );
}

export function getObatalaByDay(day: string): ObatalaData[] {
  return OBATALA_DATA.filter((o) => o.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

export function getObatalaByElement(element: string): ObatalaData[] {
  return OBATALA_DATA.filter((o) => o.element.toLowerCase().includes(element.toLowerCase()));
}