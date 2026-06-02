/**
 * Ika Data Module
 * Spiritual data for Ika, the Odu of earth, roots, decomposition, and transformation
 */

 

export interface IkaData {
  id: string;
  name: string;
  namePortuguese: string;
  nameYoruba: string;
  path: string;
  element: string;
  colors: string[];
  dayOfWeek: string;
  numbersSacred: number[];
  greeting: string;
  archetype: string;
  qualities: string[];
  challenges: string[];
  rulingPlanet?: string;
  sacredAnimals: string[];
  plants: string[];
  offerings: string[];
  chants: string[];
  symbols: {
    key: string;
    ikin?: string;
  };
  mythology: {
    origin: string;
    story: string;
    teaching: string;
  };
  spiritualLesson: string;
  affirmation: string;
  meditation: string;
  ritualPractices: Array<{
    name: string;
    description: string;
    timing: string;
    steps: string[];
  }>;
  nature: string;
  meaning: string;
  eshemus: string[];
  awose: string[];
}

const IKA_DATA: IkaData[] = [
  {
    id: 'ika',
    name: 'Ika',
    nameYoruba: 'Ika',
    namePortuguese: 'Senhor da Terra e das Raízes',
    path: 'Odu',
    element: 'Terra e Podridão',
    colors: ['marrom', 'verde', 'preto'],
    dayOfWeek: 'quarta-feira',
    numbersSacred: [10, 20],
    greeting: 'E ika!',
    archetype: 'O Transformador da Matéria',
    qualities: [
      'Terra',
      'Transformação',
      'Decadência',
      'Cura',
      'Mofo',
      'Decomposição',
      'Raízes',
      'Fertilidade'
    ],
    challenges: [
      'Decomposição',
      'Medo da morte',
      'Rigidez',
      'Estagnação'
    ],
    sacredAnimals: ['cobra', 'lagarto', 'toupeira'],
    plants: ['mandioca', 'inhame', 'batata', 'plantas de raiz'],
    offerings: [
      'farinha de mandioca',
      ' água de obí',
      ' fumo',
      ' aguardente',
      'coco ralado',
      'alecrim'
    ],
    chants: [
      'Ika lo bo!',
      'Oke o ma je!',
      'Ara n ru'
    ],
    symbols: {
      key: 'Odu da terra e da decomposição',
      ikin: 'Dez Ikins'
    },
    mythology: {
      origin: 'Ika nasceu quando a primeira coisa morreu e se transformou em terra fértil',
      story: 'Ika é o Odu que governa a transformação da matéria. Este Odu traz a mensagem de que da morte nasce vida.',
      teaching: 'A decomposição é apenas transformação em outra forma de existência.'
    },
    spiritualLesson: 'Aceitar a mortalidade é aceitar o ciclo completo da vida',
    affirmation: 'Permito que o antigo se decomponha para que o novo possa nascer',
    meditation: 'Sinto-me enraizado na terra, aceita e transforma-me',
    ritualPractices: [
      {
        name: 'Itutu Ika',
        description: 'Ritual de transformação e cura',
        timing: 'Quarta-feira à meia-noite',
        steps: [
          'Prepare um vaso com terra',
          'Acenda velas marrons',
          'Recite o poema de Ika',
          'Plante algo que represente renascimento',
          'Peça transformação do que precisa mudar',
          'Cubra com mais terra e aguarde'
        ]
      }
    ],
    nature: 'Ika é o princípio da terra e da decomposição. Ele governa a transformação da matéria. Este Odu traz a mensagem de que da morte nasce vida e que a decomposição é apenas transformação.',
    meaning: 'Ika fala sobre doença, fermentação, decomposição, eczemas, feridas abertas. Sua mensagem principal é que da morte nasce vida e que a transformação é inevitável.',
    eshemus: ['Ika', 'Olodumare', 'Omolu', 'Oba'],
    awose: ['Doença', 'Fermentação', 'Decomposição', 'Eczema', 'Ferida']
  }
];

export function getData(): IkaData[] {
  return IKA_DATA;
}

function getDataById(id: string): IkaData | undefined {
  return IKA_DATA.find((i) => i.id === id);
}

function searchIka(query: string): IkaData[] {
  const q = query.toLowerCase();
  return IKA_DATA.filter(
    (i) =>
      i.name.toLowerCase().includes(q) ||
      i.namePortuguese.toLowerCase().includes(q) ||
      i.qualities.some((q2) => q2.toLowerCase().includes(q)) ||
      i.element.toLowerCase().includes(q)
  );
}

function getIkaByElement(element: string): IkaData[] {
  return IKA_DATA.filter((i) =>
    i.element.toLowerCase().includes(element.toLowerCase())
  );
}

function getIkaByRitual(ritualName: string): IkaData | undefined {
  return IKA_DATA.find((i) =>
    i.ritualPractices.some((r) =>
      r.name.toLowerCase().includes(ritualName.toLowerCase())
    )
  );
}