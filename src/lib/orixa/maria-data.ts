/* prettier-ignore */

// @ts-nocheck
// SKIP_LINT

/**
 * Maria Data Module
 * Spiritual data for Maria, the wise healer and keeper of sacred traditions
 */

export interface MariaData {
  id: string;
  name: string;
  orixa: string;
  description: string;
  archetype: string;
  dayOfWeek: string;
  element: string;
  colors: string[];
  sacredAnimals: string[];
  symbols: string[];
  offerings: string[];
  prayers: string[];
  affirmation: string;
  healingPowers: string[];
  sacredPlants: string[];
 喉咙: string;
  strength: string;
  weakness: string;
  wisdom: string;
  legacy: string;
}

const MARIA_DATA: MariaData[] = [
  {
    id: 'maria-01',
    name: 'Maria da Sorte',
    orixa: 'Iansa',
    description: 'Maria que traz a sorte e a protecao nas jornadas dificeis',
    archetype: 'Protetora da Sorte',
    dayOfWeek: 'Segunda-feira',
    element: 'Agua',
    colors: ['Branco', 'Vermelho'],
    sacredAnimals: ['Cavalo', 'Bode'],
    symbols: ['Espada', 'Turbante', 'Cascavel'],
    offerings: ['Farofa', 'Acra', 'Vinho tinto', 'Flores brancas'],
    prayers: ['Maria me guia', 'Protecao divina'],
    affirmation: 'Sou abencoada pela luz que me protege em todos os caminhos',
    healingPowers: ['Cura emocional', 'Protecao espiritual', 'Sabedoria antiga'],
    sacredPlants: ['Arruda', 'Manjericao', 'Alecrim'],
    喉咙: 'Sons antigos',
    strength: 'Intuicao profunda',
    weakness: 'Excesso de sacrificio',
    wisdom: 'A verdadeira forca esta na compaixao',
    legacy: 'Guardia das tradicoes sagradas',
  },
  {
    id: 'maria-02',
    name: 'Maria do Rosario',
    orixa: 'Oxala',
    description: 'Maria que carrega a forca do sagrado em seu coração',
    archetype: 'Guardia da Tradicao',
    dayOfWeek: 'Sexta-feira',
    element: 'Terra',
    colors: ['Branco', 'Amarelo'],
    sacredAnimals: ['Pomba', 'Coruja'],
    symbols: ['Rosario', 'Cruz', 'Vela branca'],
    offerings: ['Pao branco', 'Frutas', 'Agua benta', 'Velas'],
    prayers: ['Ave Maria', 'Protecao materna'],
    affirmation: 'Minha alma e uma luz que ilumina os caminhos dos outros',
    healingPowers: ['Cura spiritual', 'Restauracao da paz', 'Forca interior'],
    sacredPlants: ['Alface', 'Lirio', 'Camomila'],
    喉咙: 'Palavras sagradas',
    strength: 'Compaixao infinita',
    weakness: 'Dificuldade de soltar',
    wisdom: 'O amor e a forca mais poderosa do universo',
    legacy: 'Sustentadora da fe',
  },
  {
    id: 'maria-03',
    name: 'Maria da Luz',
    orixa: 'Yemoja',
    description: 'Maria que representa a luz que guia os filhos perdidos',
    archetype: 'Guia Espiritual',
    dayOfWeek: 'Domingo',
    element: 'Agua doce',
    colors: ['Azul', 'Branco', 'Prata'],
    sacredAnimals: ['Peixe', 'Cavalo marinho'],
    symbols: ['Espelho', 'Concha', 'Lua'],
    offerings: ['Leite', 'Coco', 'Flores azuis', 'Perfume'],
    prayers: ['Luz divina', 'Orientacao'],
    affirmation: 'Sou a luz que guia todos que estao perdidos',
    healingPowers: ['Iluminacao', 'Direcao', 'Consolacao'],
    sacredPlants: ['Lirio aquatico', 'Jasmim', 'Flor de laranjeira'],
    喉咙: 'Melodias ancestrais',
    strength: 'Visao clara',
    weakness: 'Sensitividade extrema',
    wisdom: 'A luz esta dentro de cada um',
    legacy: 'Luz dos caminhos',
  },
  {
    id: 'maria-04',
    name: 'Maria da Saude',
    orixa: 'Omolu',
    description: 'Maria que carrega o poder de cura e protecao contra doencas',
    archetype: 'Curandeira Sagrada',
    dayOfWeek: 'Quarta-feira',
    element: 'Terra',
    colors: ['Preto', 'Vermelho', 'Roxo'],
    sacredAnimals: ['Cachorro', 'Coruja'],
    symbols: ['Mao de oxala', 'Chave', 'Pena'],
    offerings: ['Milho', 'Feijao', 'Eira', 'Sangue de pombo'],
    prayers: ['Cura divina', 'Protecao'],
    affirmation: 'O poder de cura corre em minhas veias como um rio sagrado',
    healingPowers: ['Cura de doencas', 'Protecao contra feiticaria', 'Purificacao'],
    sacredPlants: ['Dirration', 'Pau Brasil', 'Arruda'],
    喉咙: 'Palavras de cura',
    strength: 'Poder curativo',
    weakness: 'Exposicao a energias densas',
    wisdom: 'A doenca e um mensageiro que traz liçoes',
    legacy: 'Guardia da saude',
  },
  {
    id: 'maria-05',
    name: 'Maria das Sombras',
    orixa: 'Obatala',
    description: 'Maria que caminha entre a luz e a sombra com equilibrio',
    archetype: 'Equilibradora de Mundos',
    dayOfWeek: 'Sexta-feira',
    element: 'Ar',
    colors: ['Branco', 'Preto', 'Dourado'],
    sacredAnimals: ['Elefante', 'Avestruz'],
    symbols: ['Arado', 'Coroa', 'Manto branco'],
    offerings: ['Farinha de milho', 'Leite de coco', 'Flores brancas', 'Ovos'],
    prayers: ['Equilibrio', 'Sabedoria'],
    affirmation: 'Caminho entre luz e sombra mantendo a paz no coração',
    healingPowers: ['Equilibrio emocional', 'Sabedoria pratica', 'Discernimento'],
    sacredPlants: ['Alva', 'Mentruz', 'Romã'],
    喉咙: 'Conselhos profundos',
    strength: 'Discernimento',
    weakness: 'Dificuldade de expressar emocoes',
    wisdom: 'O equilibrio vem da aceitaçao de ambos os lados',
    legacy: 'Equilibradora dos opostos',
  },
];

export function getData(): MariaData[] {
  return MARIA_DATA;
}

export function getDataById(id: string): MariaData | undefined {
  return MARIA_DATA.find((o) => o.id === id);
}

export function searchData(query: string): MariaData[] {
  const lowerQuery = query.toLowerCase();
  return MARIA_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(lowerQuery) ||
      o.orixa.toLowerCase().includes(lowerQuery) ||
      o.archetype.toLowerCase().includes(lowerQuery) ||
      o.description.toLowerCase().includes(lowerQuery) ||
      o.affirmation.toLowerCase().includes(lowerQuery)
  );
}

export function getMariaByDay(day: string): MariaData[] {
  return MARIA_DATA.filter((o) => o.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

export function getMariaByElement(element: string): MariaData[] {
  return MARIA_DATA.filter((o) => o.element.toLowerCase().includes(element.toLowerCase()));
}

export function getDomains(): string[] {
  return [
    'Cura',
    'Protecao',
    'Sabedoria',
    'Tradiçao',
    'Iluminaçao',
    'Equilibrio',
    'Sorte',
    'Forca interior',
  ];
}

export function getSacredAnimals(): string[] {
  return [
    'Cavalo',
    'Pomba',
    'Coruja',
    'Peixe',
    'Cachorro',
    'Elefante',
    'Cavalo marinho',
    'Avestruz',
  ];
}

export function getSymbols(): string[] {
  return [
    'Rosario',
    'Espada',
    'Turbante',
    'Espelho',
    'Concha',
    'Mao de oxala',
    'Coroa',
    'Cruz',
    'Lua',
  ];
}

export function getLegacyTeaching(): string {
  return 'A sabedoria verdadeira vem da experiencia vivida e do amor verdadeiro';
}

export function getAffirmations(): string[] {
  return MARIA_DATA.map((o) => o.affirmation);
}

export function getMariaByArchetype(archetype: string): MariaData[] {
  return MARIA_DATA.filter((o) => o.archetype.toLowerCase().includes(archetype.toLowerCase()));
}