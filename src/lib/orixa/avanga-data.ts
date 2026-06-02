 
// @ts-nocheck
// SKIP_LINT

/**
 * Avanga Data Module
 * Spiritual data for Avanga, the dual headspirit combining Ori and Ayanmo
 */

export interface AvangaData {
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

const AVANGA_DATA: AvangaData[] = [
  {
    id: 'avanga',
    name: 'Avanga',
    namePortuguese: 'Espírito da Cabeça Dupla',
    path: 'Avanga',
    element: 'Consciência e Destino',
    colors: ['#000000', '#8B0000', '#D4AF37'],
    dayOfWeek: 'Terça-feira',
    numbersSacred: [3, 7, 13],
    greeting: 'Avanga Ori!',
    archetype: 'O Guardião do Duplo Destino',
    qualities: ['Integração', 'Autoconhecimento', 'Equilíbrio', 'Decisão', 'Intuição', 'Direção'],
    challenges: ['Conflito interno', 'Indecisão', 'Dualidade'],
    rulingPlanet: 'Mercúrio',
    sacredAnimals: ['Serpente', 'Coruja', 'Raposa'],
    plants: ['Palmeira', 'Arruda', 'Guiné'],
    offerings: ['Azeite de dendê vermelho', 'Velas pretas', 'Farinha de mandioca', 'Quiabo', 'Gengibre'],
    chants: ['Avanga', 'Ori', 'Ayanmo'],
    symbols: ['Duas cabeças', 'Espelho duplo', 'Fio de Contas', 'Maracá'],
    mythology:
      'Avanga é a fusão do Ori (cabeça espiritual individual) com o Ayanmo (destino cósmico). Este duplo espírito representa a luta permanente entre o que desejamos e o que estamos destinados a ser. Avanga teaches que o autoconhecimento é o caminho para harmonizar这两个 aspects of self.',
    spiritualLesson: 'A integração dos opostos dentro de si mesmo conduz ao destino verdadeiro',
    affirmation: 'Eu integro minha essência com meu destino, tornando-me inteiro e completo em meu caminho',
    meditation: 'Visualize duas correntes de luz convergindo em seu centro Craniano, formando uma única estrela de brilho intenso',
  },
  {
    id: 'avanga-longo',
    name: 'Avanga Longo',
    namePortuguese: 'A Cabeça Ancestral',
    path: 'Avanga',
    element: 'Ancestralidade e Memória',
    colors: ['#4A0404', '#DAA520', '#191970'],
    dayOfWeek: 'Sábado',
    numbersSacred: [6, 9, 12],
    greeting: 'Longo Avanga!',
    archetype: 'O Ancestral desperto',
    qualities: ['Memória genética', 'Sabedoria ancestral', 'Linhagem', 'Proteção', 'Orientação', 'História'],
    challenges: ['Fardos do passado', 'Tradições rígidas', 'Culpa ancestral'],
    rulingPlanet: 'Saturno',
    sacredAnimals: ['Leão', 'Elefante', 'Tartaruga'],
    plants: ['Banana-da-terra', 'Mamona', 'Bromélia'],
    offerings: ['Velas escuras', 'Azeite de palma', 'Farinha de inhame', 'Carne seca', 'Rum'],
    chants: ['Longo', 'Egun',
      'Odito'],
    symbols: ['Caveira', 'Osso maxilar', 'Prancha ritual', 'Cabaça ancestral'],
    mythology:
      'Avanga Longo representa a conexão com os ancestrais que já completaram sua jornada terrestre. Ele guarda a memória de toda a linhagem familiar e transmite sabedoria através das gerações. Os mortos falam através de Longo quando invocamos nossas raízes.',
    spiritualLesson: 'Honrar os ancestrais é também honrar a si mesmo e ao caminho que já foi trilhado',
    affirmation: 'Eu honro meus ancestrais e incorporo sua sabedoria, libertando-me dos padrões que já não me servem',
    meditation: 'Sinta a presença dos seus ancestrais ao seu redor, formando um círculo de proteção e orientação',
  },
  {
    id: 'avanga-oyi',
    name: 'Avanga Oyi',
    namePortuguese: 'A Visão Clarividente',
    path: 'Avanga',
    element: 'Luz e Profecia',
    colors: ['#9400D3', '#00CED1', '#FFD700'],
    dayOfWeek: 'Quinta-feira',
    numbersSacred: [4, 8, 15],
    greeting: 'Oyi Avanga!',
    archetype: 'O Vidente Integrado',
    qualities: ['Clarividência', 'Profecia', 'Iluminação', 'Visão', 'Integração', 'Clareza'],
    challenges: ['Visão perturbada', 'Ilusões', 'Profecia distorcida'],
    rulingPlanet: 'Júpiter',
    sacredAnimals: ['Águia', 'Falcão', 'Pavão'],
    plants: ['Alfazema', 'Sálvia', 'Artemísia'],
    offerings: ['Velas roxas e douradas', 'Incenso de sálvia', 'Cristais de quartzo', 'Azeite de oliva', 'Leite de coco'],
    chants: ['Oyi', 'Ara',
      'Mimo'],
    symbols: ['Terceiro olho', 'Espelho profético', 'Coroa de plumas', 'Cálice'],
    mythology:
      'Avanga Oyi é a manifestação de Avanga quando a visão interior é completamente aberta. Este aspecto revela que a verdadeira clareza vem da integração entre o visível e o invisível. Oyi garante que a visão não seja apenas para o eu, mas para o bem maior de toda a comunidade.',
    spiritualLesson: 'A verdadeira visão espiritual serve ao destino coletivo, não apenas aos anseios pessoais',
    affirmation: 'Minha visão é clara e meu propósitoserve ao bem maior,eu vejo além do véu para a verdade essencial',
    meditation: 'Abra seu terceiro olho e visualize uma luz violeta iluminando o caminho de tutti aqueles que você ama',
  },
];

export function getData(): AvangaData[] {
  return AVANGA_DATA;
}

function getDataById(id: string): AvangaData | undefined {
  return AVANGA_DATA.find((a) => a.id === id);
}

function searchData(query: string): AvangaData[] {
  const q = query.toLowerCase();
  return AVANGA_DATA.filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.namePortuguese.toLowerCase().includes(q) ||
      a.path.toLowerCase().includes(q) ||
      a.element.toLowerCase().includes(q) ||
      a.archetype.toLowerCase().includes(q)
  );
}

function getAvangaByDay(day: string): AvangaData[] {
  return AVANGA_DATA.filter((a) => a.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

function getAvangaByElement(element: string): AvangaData[] {
  return AVANGA_DATA.filter((a) => a.element.toLowerCase().includes(element.toLowerCase()));
}
