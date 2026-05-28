 
// @ts-nocheck
// SKIP_LINT

/**
 * Oxosse Data Module
 * Spiritual data for Oxosse (Oxóssi), the orixá of the hunt, forests, and abundance
 */

export interface OxosseData {
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

const OXOSSE_DATA: OxosseData[] = [
  {
    id: 'oxosse',
    name: 'Oxosse',
    namePortuguese: 'Senhor das Matas e da Caça',
    path: 'Oxosse',
    element: 'Mata e Ar',
    colors: ['#006400', '#0000CD', '#F0F8FF'],
    dayOfWeek: 'Quinta-feira',
    numbersSacred: [3, 7, 9, 15],
    greeting: 'Eê Oxosse!',
    archetype: 'O Caçador Cósmico',
    qualities: ['Paciência', 'Sabedoria', 'Determinação', 'Abundância', 'Observação', ' Estratégia'],
    challenges: ['Impaciência', 'Isolamento', 'Perfeccionismo', 'Competitividade Excessiva'],
    rulingPlanet: 'Júpiter',
    sacredAnimals: ['Boi', 'Veado', 'Cão de caça', 'Falcão'],
    plants: ['Palmeira', 'Angico', ' jatobá', 'Caraíba'],
    offerings: ['Azeite de dendê verde', 'Velas verdes', 'Fumo', 'Cobra seca', 'Frutas silvestres', 'Farinha'],
    chants: ['Eê', 'Oxosse', 'Lô', 'Ogum'],
    symbols: ['Arco e flecha', 'Besta', 'Mata', 'Chapéu de palha', 'Foice'],
    mythology:
      'Oxosse é o orixá da caça, das matas e da abundância. Foi criado por Oludumare para alimentar o mundo. Sua história está ligada à caça cósmica onde capturou o mal que ameaçava a humanidade. É o pai de todos os caçadores e o guardião das florestas. Seu oxé (tool) é o arco e flecha, com o qual abençoa seus filhos com fartura e proteção.',
    spiritualLesson: 'A verdadeira abundância vem da paciência estratégica e da observação atenta do mundo ao redor',
    affirmation: 'Eu caço meus objetivos com sabedoria e paciência, permitindo que a abundância flua naturalmente para mim',
    meditation: 'Visualize-se em uma floresta densa e luminosa, onde cada passo revela sabedoria ancestral e fartura',
  },
  {
    id: 'oxosse-ossaim',
    name: 'Ossaim',
    namePortuguese: 'O Senhor das Ervas',
    path: 'Oxosse',
    element: 'Ervas e Cipós',
    colors: ['#228B22', '#32CD32', '#90EE90'],
    dayOfWeek: 'Domingo',
    numbersSacred: [4, 7, 14],
    greeting: 'Ossaimê!',
    archetype: 'O Mestre das Ervas',
    qualities: ['Conhecimento', 'Cura', 'Sabedoria herbal', 'Discrição', 'Segredos', 'Misticismo'],
    challenges: ['Segredos demais', 'Manipulação do conhecimento', 'Isolamento'],
    rulingPlanet: 'Netuno',
    sacredAnimals: ['Pássaro', 'Serpente', 'Lagarto'],
    plants: ['Mastruz', 'Arruda', 'Pajeú', 'Cipó de São João', 'Malva'],
    offerings: ['Folhas frescas', 'Velas verdes', 'Mel', 'Quiabo', 'Ervas variadas'],
    chants: ['Ossaim', 'Ervas', 'Cura', 'Segredos'],
    symbols: ['Folhas', 'Cipó', 'Livro de ervas', 'Pássaro de sete cores'],
    mythology:
      'Ossaim é o guardião de todos os segredos das plantas e ervas. Foi dado o conhecimento das folhas pelo próprio Oxosse. É ele quem conhece o poder de cada planta e pode curar ou causar doenças. Os filhos de Ossaim recebem o dom de curar e conhecer os segredos medicinais da natureza.',
    spiritualLesson: 'O conhecimento das ervas é um dom sagrado que deve ser usado com responsabilidade e sabedoria',
    affirmation: 'Eu uso meu conhecimento com discernimento, trazendo cura e harmonia para todos ao meu redor',
    meditation: 'Imagine-se cercado por ervas luminosas, cada uma brilhando com sua energia curativa específica',
  },
];

export function getData(): OxosseData[] {
  return OXOSSE_DATA;
}

export function getDataById(id: string): OxosseData | undefined {
  return OXOSSE_DATA.find((o) => o.id === id);
}

export function searchData(query: string): OxosseData[] {
  const q = query.toLowerCase();
  return OXOSSE_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(q) ||
      o.namePortuguese.toLowerCase().includes(q) ||
      o.element.toLowerCase().includes(q) ||
      o.qualities.some((q_) => q_.toLowerCase().includes(q)) ||
      o.mythology.toLowerCase().includes(q)
  );
}

export function getOxosseByDay(day: string): OxosseData[] {
  return OXOSSE_DATA.filter((o) => o.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

export function getOxosseByElement(element: string): OxosseData[] {
  return OXOSSE_DATA.filter((o) => o.element.toLowerCase().includes(element.toLowerCase()));
}