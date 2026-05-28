// @ts-nocheck
// SKIP_LINT

/**
 * Ossa Data Module
 * Spiritual data for Ossa/Ossaim, the orixá associated with iron, protection, and oxê (cutting power)
 */

export interface OssaData {
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

const OSSA_DATA: OssaData[] = [
  {
    id: 'ossa-01',
    name: 'Ossaim',
    namePortuguese: 'Oxum / Ossaim',
    path: 'src/lib/orixa/ossa-data.ts',
    element: 'ferro',
    colors: ['azul', 'branco', 'amarelo'],
    dayOfWeek: 'sábado',
    numbersSacred: [3, 7, 15],
    greeting: 'Laroyê Ossaim!',
    archetype: 'O Senhor do Ferro / O Corte Sagrado',
    qualities: [
      'proteção',
      'força',
      'poder de corte',
      'separação do bem e mal',
      'justiça',
      'coragem',
      'determinação',
      '杀气',
    ],
    challenges: [
      'excesso de agressividade',
      'rigidez',
      'dificuldade em perdoar',
      'tendencia à violência',
    ],
    rulingPlanet: 'Marte',
    sacredAnimals: ['cavalo', 'avestruz', 'falcão'],
    plants: ['arruda', 'espada-de-são-jorge', 'alecrim', 'guiné'],
    offerings: ['palha de ferro', 'fio de contas azuis', 'fumação', 'vinho', 'pamonha'],
    chants: ['Laroyê Ossaim!', 'Ossaimô!', 'Eparrei!'],
    symbols: ['espada', 'facão', 'ferradura', 'oxê', 'lança'],
    mythology:
      'Ossaim é o orixá do ferro e do poder cortante. Ele representa a capacidade de separar o que deve ser cortado - tanto no plano espiritual quanto físico. É o guardião dos portais e o senhor das armas sagradas. Sua energia é essencial para a proteção contra energias negativas e para a abertura de caminhos.',
    spiritualLesson:
      'O corte sagrado de Ossaim ensina que nem tudo deve ser preservado. Há momentos em que é necessário separar-se de pessoas, situações e padrões que já não servem ao seu crescimento. O ferro representa a força de tomar decisões difíciles e seguir em frente sem olhar para trás.',
    affirmation: 'Tenho o poder de cortar o que não me serve. Minha espada interior abre caminhos e protege minha jornada.',
    meditation:
      'Visualize uma espada de luz azul/branca na sua mão direita. Permita que ela corte todas as energias negativas ao seu redor, separando o que deve permanecer do que deve ser liberado. Sinta o poder cortante de Ossaim purificando seu espaço energetico.',
  },
  {
    id: 'ossa-02',
    name: 'Ossaim',
    namePortuguese: 'Ossain',
    path: 'src/lib/orixa/ossa-data.ts',
    element: 'ferro',
    colors: ['azul', 'branco', 'cinza'],
    dayOfWeek: 'sábado',
    numbersSacred: [7, 9, 15],
    greeting: 'Ossaimô!',
    archetype: 'O Médico das Ervas / O Senhor das Folhas',
    qualities: [
      'conhecimento das plantas',
      'cura',
      'proteção espiritual',
      'magia',
      'sabedoria herbal',
      'feitiçaria',
    ],
    challenges: [
      'uso do poder para o mal',
      'manipulação',
      'segredos perigosos',
      'conhecimento proibido',
    ],
    rulingPlanet: 'Saturno',
    sacredAnimals: ['avestruz', 'avó', 'bode'],
    plants: ['todas as folhas', 'ervas', 'raízes', 'casca'],
    offerings: ['ervas frescas', 'vinho', 'fumo', 'galinha negra', 'farinha'],
    chants: ['Ossaimô!', 'Eparrei!', 'Ossain!'],
    symbols: ['moringa', 'folhas', 'raízes', 'cabaça'],
    mythology:
      'Ossain é o grande médico do panteão iorubá. Ele conhece todas as propriedades das plantas, folhas, raízes e cascas. Foi ele quem ensinou os humanos a preparar medicamentos e defenses. É o dono do axé das folhas e o senhor dos segredos mágicos.',
    spiritualLesson:
      'O conhecimento de Ossain nos lembra que a cura vem da natureza e dos segredos antigos. Cada folha tem um propósito, cada raiz guarda um poder. Aprenda a observar a natureza como mestre e a buscar nos ervanários a sabedoria que necesitas.',
    affirmation: 'Recebo a sabedoria das plantas e das folhas. Minha cura vem da natureza e do conhecimento ancestral.',
    meditation:
      'Esteja em unãocom a natureza. Visualize Ossain ensinando-lhe sobre as propriedades de cada folha. Permita que o conhecimento herbal flua através de você, trazendo cura para todos os que precisam.',
  },
];

export function getData(): OssaData[] {
  return OSSA_DATA;
}

export function getDataById(id: string): OssaData | undefined {
  return OSSA_DATA.find((o) => o.id === id);
}

export function searchData(query: string): OssaData[] {
  const q = query.toLowerCase();
  return OSSA_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(q) ||
      o.namePortuguese.toLowerCase().includes(q) ||
      o.element.toLowerCase().includes(q) ||
      o.archetype.toLowerCase().includes(q) ||
      o.qualities.some((q) => q.toLowerCase().includes(q))
  );
}

export function getOssaByDay(day: string): OssaData[] {
  return OSSA_DATA.filter((o) => o.dayOfWeek.toLowerCase() === day.toLowerCase());
}

export function getOssaByElement(element: string): OssaData[] {
  return OSSA_DATA.filter((o) => o.element.toLowerCase() === element.toLowerCase());
}