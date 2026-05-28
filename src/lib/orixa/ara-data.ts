/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
// SKIP_LINT

/**
 * Ara Data Module
 * Spiritual data for Ara, the orixá of identity, transformation, and the body
 */

export interface AraData {
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
  transformationStages: string[];
  bodyCorrespondences: string[];
  sacredGeometry: string[];
}

const ARA_DATA: AraData[] = [
  {
    id: 'ara',
    name: 'Ara',
    namePortuguese: 'Senhor da Transformação',
    path: 'Ara',
    element: 'Fogo e Ar',
    colors: ['#FF6B35', '#FFD700'],
    dayOfWeek: 'Domingo',
    numbersSacred: [1, 7, 13],
    greeting: 'Ara Ni!',
    archetype: 'O Transformador',
    qualities: ['Renovação', 'Identidade', 'Flexibilidade', 'Adaptabilidade', 'Destino', 'Ascensão'],
    challenges: ['Insegurança', 'Medo da mudança', 'Rigidez identitária'],
    rulingPlanet: 'Sol',
    sacredAnimals: ['Serpente', 'Fênix', 'Papagaio'],
    plants: ['Guiné', 'Manjericão', 'Alecrim'],
    offerings: ['Azeite de dendê', 'Fumo', 'Mel', 'Velas douradas', 'Frutas amarelas'],
    chants: ['Ara', 'Yeye', 'Oba'],
    symbols: ['Espelho', 'Serpentina', 'Chama', 'Espiral'],
    mythology:
      'Ara é o orixá que governa a transformação do corpo e da identidade. Ele representa a capacidade do ser humano de transcender sua forma atual e renascer em uma versão mais elevada. Ara habita o espaço entre o que éramos e o que seremos.',
    spiritualLesson: 'A verdadeira identidade é fluida e mutável,次的每一次改变都是灵魂的进化',
    affirmation: 'Eu Transformo minha identidade com propósito, abraçando a mudança como caminho de evolução',
    meditation: 'Visualize uma espiral de luz dourada envolvendo seu corpo, dissolvendo as camadas do antigo eu',
    transformationStages: [
      'Desconstrução - Soltar o que não serve',
      'Purificação - Limpeza das velhas crenças',
      'Integração - Unificação do novo ser',
      'Manifestação - Expressão da nova identidade',
    ],
    bodyCorrespondences: [
      'Pele - Primeira camada de identidade',
      'Sangue -流动 de transformação',
      'Ossos - Estrutura que permanece após mudança',
      'Espírito - A essência que transcende',
    ],
    sacredGeometry: ['Espiral', 'Círculo', 'Hexagrama', 'Flor da Vida'],
  },
  {
    id: 'ara-ona',
    name: 'Ara Ona',
    namePortuguese: 'Ara dos Caminhos',
    path: 'Ara',
    element: 'Terra e Fogo',
    colors: ['#8B4513', '#DAA520'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [3, 6, 9],
    greeting: 'Ara Ona!',
    archetype: 'O Desbravador',
    qualities: ['Pioneirismo', 'Determinação', 'Caminho', 'Direção', 'Propósito', 'Clareza'],
    challenges: ['Impaciência', 'Excesso de movimento', 'Perder-se'],
    rulingPlanet: 'Mercúrio',
    sacredAnimals: ['Cavalo', 'Veado', 'Beija-flor'],
    plants: ['Arruda', 'Guiné', 'Alecrim'],
    offerings: ['Azeite de dendê', 'Moedas', 'Pimenta', 'Fumo', 'Velas amarelas'],
    chants: ['Ona', 'Ara', 'Oba'],
    symbols: ['Caminho', 'Bussola', 'Seta', 'Mapa'],
    mythology:
      'Ara Ona é a manifestação de Ara que governa todos os caminhos da vida. Ele determina a direção do destino e abre trilhas onde antes havia escuridão.',
    spiritualLesson: 'O caminho se revela a cada passo dado com intenção',
    affirmation: 'Eu caminho com firmeza hacia meu destino, confiando na sabedoria do meu Ori',
    meditation: 'Sinta seus pés na terra enquanto imagina uma estrada iluminada estendendo-se diante de você',
    transformationStages: [
      'Escolha - Decidir o caminho',
      'Passos - Ação consistente',
      'Persistência - Não desistir',
      'Chegada - Acolhimento do novo',
    ],
    bodyCorrespondences: [
      'Pés - Que carregam o corpo pelo caminho',
      'Pernas - Fuerza para continuar',
      'Coluna - Estrutura que sustenta a jornada',
      'Mente - Bússola interna',
    ],
    sacredGeometry: ['Linha', 'Triângulo', 'Flecha', 'Estrada'],
  },
];

export function getData(): AraData[] {
  return ARA_DATA;
}

export function getDataById(id: string): AraData | undefined {
  return ARA_DATA.find((a) => a.id === id);
}

export function searchData(query: string): AraData[] {
  const lowerQuery = query.toLowerCase();
  return ARA_DATA.filter(
    (a) =>
      a.name.toLowerCase().includes(lowerQuery) ||
      a.namePortuguese.toLowerCase().includes(lowerQuery) ||
      a.archetype.toLowerCase().includes(lowerQuery) ||
      a.path.toLowerCase().includes(lowerQuery)
  );
}

export function getAraByDay(day: string): AraData[] {
  return ARA_DATA.filter((a) => a.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

export function getAraByElement(element: string): AraData[] {
  return ARA_DATA.filter((a) => a.element.toLowerCase().includes(element.toLowerCase()));
}