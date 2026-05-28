// @ts-nocheck
// SKIP_LINT

/**
 * Oxalufi Data Module
 * Spiritual data for Oxalufi, the orixá of creation, purity, and ancestral wisdom
 */

export interface OxalufiData {
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

const OXALUFI_DATA: OxalufiData[] = [
  {
    id: 'oxalufi',
    name: 'Oxalufi',
    namePortuguese: 'Senhor da Paz e da Criação',
    path: 'Oxalufi',
    element: 'Luz e Paz',
    colors: ['#FFFFFF', '#F5F5F5', '#FFD700'],
    dayOfWeek: 'Sexta-feira',
    numbersSacred: [7, 9, 15, 21],
    greeting: 'Ê Oxalufi!',
    archetype: 'O Ancião Criador',
    qualities: ['Paz', 'Sabedoria', 'Pureza', 'Ancestralidade', 'Criação', 'Humildade'],
    challenges: ['Indecisão', 'Passividade Excessiva', 'Medo de mudança', 'Ressentimento'],
    rulingPlanet: 'Netuno',
    sacredAnimals: ['Pomba', 'Galinha branca', 'Cavalo branco'],
    plants: ['Alface', 'Cravo branco', 'Lírio', 'Alecrim'],
    offerings: ['Farinha branca', 'Acarajé', 'Velas brancas', 'Água de flor', 'Coco ralado', 'Melancia'],
    chants: ['Ê', 'Oxalufi', 'Ori', 'Paz'],
    symbols: ['Pá (cruz)', 'Contas brancas', 'Bengala', 'Roupa branca', 'Coroa'],
    mythology:
      'Oxalufi é a forma mais antiga e venerada de Oxalá, considerado o primeiro orixá criado por Oludumare. É o pai da criação e senhor de todos os orixás. Sua energia representa a paz primordial e a sabedoria dos ancestrais. Os filhos de Oxalufi carregam a missão de restaurar a harmonia e conectar-se com a sabedoria dos antigos. Em algumas tradições, Oxalufi é visto como a essência original de Oxalá antes de sua Forma Grande (Oxalá Oxum).</bot_name> OXALUFI',
    spiritualLesson: 'A verdadeira criação vem da paz interior e da conexão com nossos ancestrais',
    affirmation: 'Eu embody the peace of my ancestors, creating with wisdom and purity',
    meditation: 'Visualize a pure white light surrounding you, connecting you to the wisdom of your ancestors',
  },
  {
    id: 'oxalufi-oxum',
    name: 'Oxalá Oxum',
    namePortuguese: 'O Grande Criador',
    path: 'Oxalufi',
    element: 'Água doce e luz solar',
    colors: ['#E8E8E8', '#87CEEB', '#F0E68C'],
    dayOfWeek: 'Sexta-feira',
    numbersSacred: [8, 15, 24],
    greeting: 'Ê logun!',
    archetype: 'O Creator through unity',
    qualities: ['Harmonia', 'União', 'Fertilidade', 'Bênção', 'Proteção', 'Compaixão'],
    challenges: ['Confusão de identidade', 'Dificuldade de limites', 'Superproteção'],
    rulingPlanet: 'Lua',
    sacredAnimals: ['Pavão', 'Cisne', 'Gaivota'],
    plants: ['Flor de laranjeira', 'Jasmim', 'Gardênia', 'Copo de leite'],
    offerings: ['Velas douradas e brancas', 'Alfarroba', 'Manga', 'Côco', 'Pão doce'],
    chants: ['Ê', 'Oxalá', 'Oxum', 'Lô'],
    symbols: ['Pá duplo', 'Coroa com raios', 'Sol dourado', 'Lua prateada'],
    mythology:
      'Oxalá Oxum é a união das energias de Oxalá e Oxum, representando a fertilidade e a criação plena. Esta manifestação demonstra que a sabedoria masculina de Oxalá e o amor feminino de Oxum juntos criam a vida completa. Os filhos desta energia são capazes de manifestar abundance através da harmonia entre o céu e a terra.',
    spiritualLesson: 'A verdadeira criação flourishs when masculine wisdom and feminine love unite in harmony',
    affirmation: 'Eu permito que a sabedoria e o amor se unam em mim, criando com harmonia e bênção',
    meditation: 'Imagine a luz dourada do sol e a luz prateada da lua se encontrando em seu coração, criando uma nova vida',
  },
];

export function getData(): OxalufiData[] {
  return OXALUFI_DATA;
}

export function getDataById(id: string): OxalufiData | undefined {
  return OXALUFI_DATA.find((o) => o.id === id);
}

export function searchData(query: string): OxalufiData[] {
  const q = query.toLowerCase();
  return OXALUFI_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(q) ||
      o.namePortuguese.toLowerCase().includes(q) ||
      o.archetype.toLowerCase().includes(q) ||
      o.qualities.some((qlt) => qlt.toLowerCase().includes(q)) ||
      o.path.toLowerCase().includes(q)
  );
}

export function getOxalufiByDay(day: string): OxalufiData[] {
  return OXALUFI_DATA.filter((o) => o.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

export function getOxalufiByElement(element: string): OxalufiData[] {
  return OXALUFI_DATA.filter((o) => o.element.toLowerCase().includes(element.toLowerCase()));
}