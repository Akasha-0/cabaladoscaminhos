// @ts-nocheck
// SKIP_LINT

/**
 * Ori Data Module
 * Spiritual data for Ori, the orixá of the spiritual head, destiny, and consciousness
 */

export interface OriData {
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

const ORI_DATA: OriData[] = [
  {
    id: 'ori',
    name: 'Ori',
    namePortuguese: 'Senhor da Cabeça',
    path: 'Ori',
    element: 'Éter e Ar',
    colors: ['#FFFFFF', '#F5F5DC', '#87CEEB', '#D4AF37'],
    dayOfWeek: 'Segunda-feira',
    numbersSacred: [3, 9, 27],
    greeting: 'Euphe Ori!',
    archetype: 'Guardião do Destino',
    qualities: [
      'Consciência',
      'Discernimento',
      'Alinhamento espiritual',
      'Propósito',
      'Clareza mental',
      'Intuição',
      'Destino',
      'Sabedoria interior'
    ],
    challenges: [
      'Confusão mental',
      'Desalinhamento com o destino',
      'Orgulho intelectual',
      'Rigidez de pensamento',
      'Fuga da realidade'
    ],
    rulingPlanet: 'Mercúrio',
    sacredAnimals: ['Coruja', 'Cavalo branco', 'Pomba'],
    plants: ['Alfazema', 'Alecrim', 'Girassol', 'Arruda'],
    offerings: [
      'Inhame branco',
      'Canjica',
      'Flores brancas',
      'Leite de coco',
      'Água de rosas',
      'Milho branco',
      'Algodão'
    ],
    chants: ['Euphe Ori', 'Ori mi o', 'Ori abre minha mente', 'Cabeça clara e coração puro'],
    symbols: [
      'Cabeça humana',
      'Alabê (cetros)',
      'Ofá (arco)',
      'Vela branca',
      'Espelho',
      'Água clara'
    ],
    mythology:
      'Ori é o orixá que representa a cabeça espiritual de cada ser vivo. É ele quem governa o destino individual, a consciência e a capacidade de fazer escolhas alinhadas com o propósito divino. Cada pessoa tem seu próprio Ori, que é único e infallível quando está bem alimentado e cuidado. Diferente dos outros orixás que são compartilhados pela comunidade, o Ori é exclusivamente pessoal.',
    spiritualLesson:
      'Cuidar do Ori é cuidar da capacidade de distinguir o essencial do ilusório. O destino não é algo que acontece, mas algo que se mantém alinhado através do autoconhecimento e da escuta interior.',
    affirmation: 'Minha mente está clara e meu destino está alinhado com a vontade divina. Eu escolho a sabedoria sobre a ignorância em cada momento.',
    meditation: 'Sente em silêncio com as mãos sobre a cabeça. Visualize uma luz branca que entra pelo topo do crânio, preenchendo todo o espaço mental com clareza e paz. Permita que pensamentos venham e vão como nuvens passageiras.'
  }
];

export function getData(): OriData[] {
  return ORI_DATA;
}

export function getDataById(id: string): OriData | undefined {
  return ORI_DATA.find((o) => o.id === id);
}

export function searchData(query: string): OriData[] {
  const q = query.toLowerCase();
  return ORI_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(q) ||
      o.namePortuguese.toLowerCase().includes(q) ||
      o.path.toLowerCase().includes(q) ||
      o.qualities.some((q) => q.toLowerCase().includes(q)) ||
      o.mythology.toLowerCase().includes(q)
  );
}

export function getOriByElement(element: string): OriData[] {
  return ORI_DATA.filter((o) => o.element.toLowerCase().includes(element.toLowerCase()));
}

export function getOriByDay(day: string): OriData[] {
  return ORI_DATA.filter((o) => o.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}
