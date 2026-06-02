// @ts-nocheck
// SKIP_LINT

/**
 * Oxaquece Data Module
 * Spiritual data for Oxaquece (Oxaké), the orixá of sea waters and oceanic mysteries
 */

export interface OxaqueceData {
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

const OXAUECE_DATA: OxaqueceData[] = [
  {
    id: 'oxaquece',
    name: 'Oxaquéce',
    namePortuguese: 'Senhor das Águas do Mar',
    path: 'Oxaquéce',
    element: 'Água salgada e mistério',
    colors: ['#1E3A5F', '#006994', '#40E0D0'],
    dayOfWeek: 'Sábado',
    numbersSacred: [3, 7, 12, 21],
    greeting: 'Ê Oxaquece!',
    archetype: 'O Guardião das Profundezas',
    qualities: ['Mistério', 'Transformação', 'Ancestralidade', 'Proteção', 'Sabedoria oculta', 'Fluidez'],
    challenges: ['Segredos guardados', 'Transformação difícil', 'Profundidade emocional', 'Comunicação oculta'],
    rulingPlanet: 'Netuno',
    sacredAnimals: ['Boto cor de rosa', 'Tartaruga marinha', 'Peixe-boi', 'Golfinho'],
    plants: ['Samambaia aquatic', 'Alga marinha', 'Lirio aquatic', 'Musgo do mar'],
    offerings: ['Agua do mar', 'Farinha de tapioca', 'Camarão', 'Milho branco', 'Velas azuis', 'Coco'],
    chants: ['Ê', 'Oxaquéce', 'Água', 'Mar'],
    symbols: ['Cálice de agua salgada', 'Conchas', 'Pérola', 'Onda do mar'],
    mythology:
      'Oxaquéce é o orixá das águas do mar, guardião dos segredos aquaticos e protetor dos navegadores. É considerado a essência das águas profundas e misteriosas que conectam o mundo visível ao invisível. Os filhos de Oxaquece carregam a missão de explorar os mistérios ocultos e transformar-se através das águas da vida. Sua energia representa a profundidade do inconsciente e a sabedoria que vem das profundezas do ser.',
    spiritualLesson: 'A verdadeira sabedoria emerge das profundezas do ser, onde os segredos da vida se revelam',
    affirmation: 'Eu mergulho nas profundezas do meu ser, descobrindo a sabedoria oculta que transforma e liberta',
    meditation: 'Visualize-se flutuando em águas cristalinas, deixando que a correnteza do mar carregue suas preocupações e revele insights profundos',
  },
  {
    id: 'oxaquece-oxum',
    name: 'Oxaquéce Oxum',
    namePortuguese: 'A União das Águas',
    path: 'Oxaquéce',
    element: 'Água doce e salgada unidas',
    colors: ['#4682B4', '#87CEEB', '#00CED1'],
    dayOfWeek: 'Sábado',
    numbersSacred: [5, 9, 14, 27],
    greeting: 'Ê logun Oxaquece!',
    archetype: 'O Revelador de Mistérios',
    qualities: ['Intuição', 'Misticismo', 'Proteção aquatic', 'Comunicação com ancestrais', 'Transformação'],
    challenges: ['Vulnerabilidade emocional', 'Segredos revelados', 'Confusão entre realidade e sonho'],
    rulingPlanet: 'Lua',
    sacredAnimals: ['Boto', 'Arraia', 'Cavalo-marinho', 'Polvo'],
    plants: ['Lirio azul', 'Violeta aquática', 'Flor de lotus', 'Rosa do mar'],
    offerings: ['Agua de cheiro', 'Flores azuis', 'Milho branco', 'Pipoca', 'Velas douradas', 'Maçã'],
    chants: ['Ê', 'Oxaquéce', 'Oxum', 'Mar'],
    symbols: ['Concha dupla', 'Pérola azul', 'Cálice oceanic', 'Ondas entrelaçadas'],
    mythology:
      'Oxaquéce Oxum representa a união das águas do mar com as águas doces, simbolizando a integração entre o mundo material e espiritual. Esta manifestação demonstra que a sabedoria de Oxaquece e o amor de Oxum juntos revelam os mistérios ocultos da vida. Os filhos desta energia são capazes de perceber as conexões invisíveis entre todas as coisas e acessar a sabedoria das profundezas.',
    spiritualLesson: 'A verdadeira revelação ocorre quando unite our hearts to the flow of the cosmic waters',
    affirmation: 'Eu permito que as águas do conhecimento me guiem, revelando os mistérios que transformam minha alma',
    meditation: 'Imagine as águas do mar e do rio encontrando-se em seu coração, criando uma corrente de sabedoria pura que flui através de você',
  },
];

export function getData(): OxaqueceData[] {
  return OXAUECE_DATA;
}

function getDataById(id: string): OxaqueceData | undefined {
  return OXAUECE_DATA.find((o) => o.id === id);
}

function searchData(query: string): OxaqueceData[] {
  const lowerQuery = query.toLowerCase();
  return OXAUECE_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(lowerQuery) ||
      o.namePortuguese.toLowerCase().includes(lowerQuery) ||
      o.element.toLowerCase().includes(lowerQuery) ||
      o.qualities.some((q) => q.toLowerCase().includes(lowerQuery)) ||
      o.archetype.toLowerCase().includes(lowerQuery)
  );
}

function getOxaueceByDay(day: string): OxaqueceData[] {
  return OXAUECE_DATA.filter((o) => o.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

function getOxaueceByElement(element: string): OxaqueceData[] {
  return OXAUECE_DATA.filter((o) => o.element.toLowerCase().includes(element.toLowerCase()));
}