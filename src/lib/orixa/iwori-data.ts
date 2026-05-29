// @ts-nocheck
// SKIP_LINT

/**
 * Iwori Data Module
 * Spiritual data for Iwori (Etaogundá), Odu number 3 representing revolt, physical strength, tool creation, and separation
 */

export interface IworiData {
  id: string;
  name: string;
  nameYoruba?: string;
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
  offerings: {
    primary: string[];
    secondary: string[];
    forbidden: string[];
  };
  chants: string[];
  symbols: {
    key: string;
    ikin: string;
    divination: string;
    alter: string;
    connection: string;
  };
  mythology: {
    origin: string;
    story: string;
    teaching: string;
  };
  spiritualLesson: string;
  affirmation: string;
  meditation: string;
  rituals?: {
    name: string;
    description: string;
    timing: string;
    steps: string[];
  }[];
  nature: string;
  meaning: string;
  eshemus: string[];
  awose: string[];
  quizilas: string[];
  preceptos: string[];
  ebos: string[];
  numeroOdu: number;
}

const IWORI_DATA: IworiData[] = [
  {
    id: 'iwori',
    name: 'Etaogundá',
    nameYoruba: 'Iwori',
    namePortuguese: 'Etaogundá',
    path: 'Odu',
    element: 'Fogo / Terra',
    colors: ['#FF4500', '#8B0000', '#DAA520'],
    dayOfWeek: 'Terça-feira',
    numbersSacred: [3, 8, 15],
    greeting: 'Etaogundá!',
    archetype: 'A Revolta e a Força Criadora',
    qualities: ['Força física', 'Determinação', 'Capacidade de criação', 'Instinto de proteção', 'Coragem', 'Assertividade'],
    challenges: ['Impulsividade', 'Violência', 'Teimosia', 'Intolerância'],
    rulingPlanet: 'Marte',
    sacredAnimals: ['Cavalo', 'Boi', 'Touro'],
    plants: ['Mamona', 'Barra de São João', 'Espada de Ogum'],
    offerings: {
      primary: ['Inhames assados', 'Paliteiros de Ogum', 'Folhas de mariô', 'Ferro'],
      secondary: ['Carne de boi', 'Velas vermelhas', 'Fumo'],
      forbidden: ['Carne de galo', 'Facas sem necessidade', 'Violência verbal']
    },
    chants: ['Etaogundá!', 'Ogum Eshu!', 'Obaluaê!', 'E falú'],
    symbols: {
      key: 'Odu da revolta, do corte e da criação de ferramentas',
      ikin: 'Tres Ikins',
      divination: 'Revela a necessidade de agir com força e justiça',
      alter: 'Ferramental de Ogum',
      connection: 'Guarda a força de Ogum e Obaluaê'
    },
    mythology: {
      origin: 'Etaogundá nasceu quando os orixás precisaram criar ferramentas para trabalhar a terra e se proteger',
      story: 'Etaogundá é o Odu da revolta e da força física. Este Odu indica que o consultado precisa criar suas próprias ferramentas para superar obstáculos e que o corte (separação) é necessário para a evolução.',
      teaching: 'A verdadeira força está em saber quando cortar o que não serve e criar o que é necessário.'
    },
    spiritualLesson: 'A revolta é necessária quando o caminho está bloqueado; a criação de ferramentas é o caminho da superação',
    affirmation: 'Eu uso minha força física e intelectual para criar soluções e superar obstáculos com justiça',
    meditation: 'Sinta-se como Ogum forjando ferramentas, criando o que é necessário para avançar no caminho',
    rituals: [
      {
        name: 'Itutu Etaogundá',
        description: 'Ritual de defesa e criação de barreiras protetoras',
        timing: 'Terça-feira ao entardecer',
        steps: [
          'Limpe o espaço sagrado com folhas de mariô',
          'Acenda velas vermelhas',
          'Coloque inhames assados como oferenda principal',
          'Faça paliteiros para Ogum',
          'Recite os cantos de Etaogundá',
          'Limpe o ambiente com ferro',
          'Agradeça a Ogum e Obaluaê pela proteção',
          'Pedir trabalho e justiça nos caminhos'
        ]
      }
    ],
    nature: 'Etaogundá é força de Ogum e a terra de Obaluaê. Este Odu traz a mensagem de que é hora de cortar o que não serve e criar novas ferramentas para avançar.',
    meaning: 'Etaogundá fala sobre revolta legítima, força física, criação de ferramentas e a necessidade de separar o que atrapalha. Sua mensagem é que o trabalho e a justiça são os caminhos para a vitória.',
    eshemus: ['Ogum', 'Obaluaê', 'Eshu', 'Olodumare'],
    awose: ['Revolta', 'Força', 'Ferramentas', 'Corte', 'Trabalho', 'Justiça', 'Defesa'],
    quizilas: [
      'Usar facas ou objetos cortantes sem necessidade',
      'carne de galo',
      'violência verbal'
    ],
    preceptos: [
      'Evitar brigas e discussões',
      'manter o foco no trabalho e na justiça',
      'não demandar contra os outros'
    ],
    ebos: [
      'Inhames assados',
      'paliteiros de Ogum',
      'limpeza com folhas de mariô',
      'limpeza com ferro'
    ],
    numeroOdu: 3
  }
];

export function getData(): IworiData[] {
  return IWORI_DATA;
}

export function getDataById(id: string): IworiData | undefined {
  return IWORI_DATA.find((o) => o.id === id);
}

export function searchData(query: string): IworiData[] {
  const lowerQuery = query.toLowerCase();
  return IWORI_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(lowerQuery) ||
      o.namePortuguese.toLowerCase().includes(lowerQuery) ||
      o.archetype.toLowerCase().includes(lowerQuery) ||
      o.qualities.some((q) => q.toLowerCase().includes(lowerQuery)) ||
      o.awose.some((a) => a.toLowerCase().includes(lowerQuery))
  );
}

export function getIworiByElement(element: string): IworiData[] {
  return IWORI_DATA.filter((o) => o.element.toLowerCase().includes(element.toLowerCase()));
}

export function getIworiByPlanet(planet: string): IworiData[] {
  return IWORI_DATA.filter((o) => o.rulingPlanet.toLowerCase().includes(planet.toLowerCase()));
}