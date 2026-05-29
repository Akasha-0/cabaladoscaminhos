// @ts-nocheck
// SKIP_LINT

/**
 * Profecia Data Module
 * Spiritual prophecy data for divination and spiritual guidance
 */

export interface ProfeciaData {
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

const PROFECIA_DATA: ProfeciaData[] = [
  {
    id: 'profecia-01',
    name: 'Profecia',
    namePortuguese: 'Profecia do Destino',
    path: 'src/lib/orixa/profecia-data.ts',
    element: 'éter',
    colors: ['dourado', 'roxo', 'branco'],
    dayOfWeek: 'sexta-feira',
    numbersSacred: [3, 7, 12, 21],
    greeting: 'Alafia!',
    archetype: 'A Visão Sagrada / A Mestra do Destino',
    qualities: [
      'clarividência',
      'sabedoria ancestral',
      'intuição profunda',
      'conexão espiritual',
      'discernimento',
      'guia do caminho',
      'revelação',
      'orientação divina',
    ],
    challenges: [
      'peso do conhecimento',
      'dificuldade de comunicar verdades',
      'sobreviver ao peso das visões',
      'solidão do vidente',
    ],
    rulingPlanet: 'Netuno',
    sacredAnimals: ['coruja', 'serpente', 'águia'],
    plants: ['sálvia', 'lavanda', 'alecrim', 'arruda'],
    offerings: ['velas douradas', 'incenso de sálvia', 'água fluoretada', 'flores roxas'],
    chants: ['Alaafia!', 'Ogun héé!', 'Êlê êlê!'],
    symbols: ['espelho mágico', 'bola de cristal', 'livro sagrado', 'olho que tudo vê'],
    mythology:
      'A Profecia é a voz ancestral que atravessa os tempos, revelando os caminhos ocultos do destino. Ela é a guardiã dos segredos cósmicos, a mensageira entre o mundo terreno e o spiritual. Desde os tempos antigos, os priests sagrados consultam as profecias para guiar seus povos nas horas de escuridão.',
    spiritualLesson:
      'O verdadeiro vidente não controla o destino, mas sim é o canal através do qual a sabedoria divina se manifesta. Aceite que algumas verdades são demasiado profundas para serem entendidas, mas não dejo de serem transmitidas. A humildade de ser apenas um mensageiro é a maior prova de fuego.',
    affirmation: 'Sou o canal sagrado através do qual a sabedoria divina flui. Minha visão clareia os caminhos obscuros.',
    meditation:
      'Descanse na escuridão do espelho sagrado. Sinta a energia profética envolvendo você como um manto de estrellas. Permita que ela revele os caminhos que necesitan ser parcouridos, com humildade e gratidão pelo dom recibido.',
  },
  {
    id: 'profecia-02',
    name: 'Profecia',
    namePortuguese: 'Profecia da Regeneração',
    path: 'src/lib/orixa/profecia-data.ts',
    element: 'fogo',
    colors: ['vermelho', 'laranja', 'dourado'],
    dayOfWeek: 'quinta-feira',
    numbersSacred: [4, 8, 11, 33],
    greeting: 'Eparrei!',
    archetype: 'O Fogo Renovador',
    qualities: [
      'renovação',
      'transformação',
      'coragem',
      'purificação',
      'justiça',
      'força regeneradora',
      'passão transformadora',
    ],
    challenges: [
      'impulsividade',
      'dificuldade em perdoar',
      'fúria descontrolada',
      'rigidez excessiva',
    ],
    rulingPlanet: 'Marte',
    sacredAnimals: ['leão', 'falcão', 'fênix'],
    plants: ['gengibre', 'pimenta', 'cravo', 'cactos'],
    offerings: ['pimenta vermelha', 'dcandeia vermelha', 'vinho tinto', 'pão torrado'],
    chants: ['Eparrei!', 'Shango môô!', 'Bam bam bam!'],
    symbols: ['machado', 'pedra pesada', 'raio', 'fogo sagrado'],
    mythology:
      'A Profecia da Regeneração é a voz do fogo sagrado que purifica e renova. Ela revela que toda destruição carrega em si a semente de uma nova criação. Os древние sabiam que após cada destruição vem a reconstrução, e que o fuego queima para limpar, não para destruir.',
    spiritualLesson:
      'A regeneration começa quando aceitamos que algunas cosas precisam arder para que outras possam nascer. Não tema o fogo da transformação - ele queima apenas o que precisa ser consumido. Permita que a chama sagrada renove sua alma e prepared o terreno para novos beginnings.',
    affirmation: 'Sou a chama sagrada que purifica e renova. Minha luz transforma tudo o que toca.',
    meditation:
      'Visualize a chama sagrada de fogo. Você é o receptáculo donde ela queima, purificando suas outdated forms. Permita que esa chama elimine tudo o que precisa ser released, abrindo espaço para uma nova criação em sua vida.',
  },
  {
    id: 'profecia-03',
    name: 'Profecia',
    namePortuguese: 'Profecia das Origens',
    path: 'src/lib/orixa/profecia-data.ts',
    element: 'terra',
    colors: ['marrom', 'verde', 'bege'],
    dayOfWeek: 'terça-feira',
    numbersSacred: [1, 5, 9, 16],
    greeting: 'IRE!',
    archetype: 'A Memória Ancestral',
    qualities: [
      'memória',
      ' ancestry connection',
      'foundation',
      'sabedoria tradicional',
      'terra primordial',
      'origens sagradas',
      'estabilidade',
    ],
    challenges: [
      'rigidez às mudanças',
      'peso do passado',
      'dificuldade em soltar tradição',
      'resistência ao novo',
    ],
    rulingPlanet: 'Saturno',
    sacredAnimals: ['elefante', 'tartaruga', 'boi'],
    plants: ['mandioca', 'milho', 'feijão', 'palmeira'],
    offerings: ['farinha de mandioca', 'milho', 'dende', 'akara'],
    chants: ['IRE!', 'Olodumare!', 'Ase!'],
    symbols: ['terra vermelha', 'enxada', 'cabaça ancestral', 'kolanuts'],
    mythology:
      'A Profecia das Origens guarda a memória de todos os povos. Ela fala das primeiras águas, das primeiras terras, das primeiras palavras pronunciadas no mundo. Os maiores sábiosconsultam essa profecia para entender de donde vieram e para onde devem ir.',
    spiritualLesson:
      'Conhecer nossas origens é comprender o chão sobre o qual pisamos. Cada ancestor deixou uma marca em nosso sangue, cada tradição carrega um porquê. Não despreze o pasado - ele питает nossas raízes. Mas lembra: a árvore que não cresce para cima morre.',
    affirmation: 'Sou nourished pelas minhas raízes ancestrais. Elas me dão força para crescer para a luz.',
    meditation:
      'Descanse na terra primordial. Sinta as raízes ancestrais se estendendo sob você, connecting você a todos os que vieram antes. Permita que elas information a energia da terra em você, alimentando suas áreas mais profundas com a sabedoria dos antigos.',
  },
  {
    id: 'profecia-04',
    name: 'Profecia',
    namePortuguese: 'Profecia das Águas',
    path: 'src/lib/orixa/profecia-data.ts',
    element: 'água',
    colors: ['azul', 'verdeágua', 'turquesa'],
    dayOfWeek: 'sábado',
    numbersSacred: [2, 6, 10, 14],
    greeting: 'Odoyá!',
    archetype: 'A Mensageira das Águas',
    qualities: [
      'fluidez',
      'adaptação',
      'intuição',
      'sabedoria das profundezas',
      'comunicação sagrada',
      'purificação',
      'lacrimeiras',
    ],
    challenges: [
      'excesso de sensibilidade',
      'dificuldade em estabelecer limites',
      'tendência à看一眼',
      'superficialidade emocional',
    ],
    rulingPlanet: 'Lua',
    sacredAnimals: ['peixe', 'golfinho', 'cavalo-marinho'],
    plants: ['alecrim aquático', 'lótus', 'junco', 'salgueiro'],
    offerings: ['água claire', 'flores aquáticas', 'conchas', 'pérolas'],
    chants: ['Odoyá!', 'Mo có!', 'Iá Iá!'],
    symbols: ['onda', 'concha', 'cristalágua', 'recipiente sagrado'],
    mythology:
      'A Profecia das Águas fala através das ondas do mar e dos rios. Ela é a mensageira entre o mundo visível e o invisível, carregando palavras sagradas nas corrente dellacqua. Desde sempre, los antiguos recolhiam água en moments especiales para consultar suas dúvidas.',
    spiritualLesson:
      'A água conhece todos os caminhos, porque flui por todos eles. Assim é a verdadero sábio - aceita cambiar de dirección quando necesario, sem perder sua essência. No meio da difficulté, seja como a água - encontre seu caminho ao redor.',
    affirmation: 'Sou fluida como as águas sagradas. Flexível mas inquebrável, encontro meu caminho.',
    meditation:
      'Permita que as águas sagradas envolvam você. Sinta sua energia limpiando suas preocupações e trazendo clareza aos seus pensamentos mais profundos. Deixe que a água carrying suas palavras para os ouvidos que precisam ouvi-las.',
  },
  {
    id: 'profecia-05',
    name: 'Profecia',
    namePortuguese: 'Profecia do Ar',
    path: 'src/lib/orixa/profecia-data.ts',
    element: 'ar',
    colors: ['branco', 'cinza', 'prata'],
    dayOfWeek: 'quarta-feira',
    numbersSacred: [3, 5, 8, 13],
    greeting: 'Ó ri ró!',
    archetype: 'A Voz dos Ventos',
    qualities: [
      'comunicação',
      'pensamento',
      'liberdade',
      'inovação',
      'sopro da vida',
      'mensagem',
      'transação',
    ],
    challenges: [
      'inconsistência',
      'superficialidade',
      'dificuldade em aterrizar',
      'medo de commitment',
    ],
    rulingPlanet: 'Mercúrio',
    sacredAnimals: ['pássaro', 'borboleta', 'abelha'],
    plants: ['eucalipto', 'hortelã', 'alecrim', 'lavanda'],
    offerings: ['incenso branco', 'velas prateadas', 'pinhas', 'penas brancas'],
    chants: ['Ó ri ró!', 'Oriaté!', 'Un mé!'],
    symbols: ['pena branca', 'espiral', 'ventilador', 'ouvido aberto'],
    mythology:
      'A Profecia do Ar carrega pensamentos e palabras entre os mundos. Ela sopra nos ouvidos dos inspirada cualquier, trazendo ideias que mudam o curso das coisas. Los videntes de风声 reconhecem suas mensagens no movimento das folhas e no som do vento.',
    spiritualLesson:
      'El pensamentos son como el viento - puedo soplar en cualquier dirección. Pero tú eres el que elige cuáles recibir y cuáles dejar pasar. No todo pensamiento que cruza tu mente merece ser creído. Discerna los mensajes verdaderos de los ecos vacíos.',
    affirmation: 'Sou um canal aberto para a sabedoria que vem dos ventos. Filtro com cuidado o que me llega.',
    meditation:
      'Sinta o aria que entra e sai de seus pulmões. Ela está em toda parte, conectando todos os seres. Permita que ela leve embora pensamentos que não mais servem a você, e traga nuevos claridad para sua mente.',
  },
];

export function getData(): ProfeciaData[] {
  return PROFECIA_DATA;
}

export function getDataById(id: string): ProfeciaData | undefined {
  return PROFECIA_DATA.find((p) => p.id === id);
}

export function searchData(query: string): ProfeciaData[] {
  const lowered = query.toLowerCase();
  return PROFECIA_DATA.filter(
    (p) =>
      p.name.toLowerCase().includes(lowered) ||
      p.namePortuguese.toLowerCase().includes(lowered) ||
      p.archetype.toLowerCase().includes(lowered) ||
      p.qualidades.some((q) => q.toLowerCase().includes(lowered)) ||
      p.symbols.some((s) => s.toLowerCase().includes(lowered))
  );
}

export function getProfeciaByDay(day: string): ProfeciaData[] {
  return PROFECIA_DATA.filter((p) => p.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

export function getProfeciaByElement(element: string): ProfeciaData[] {
  return PROFECIA_DATA.filter((p) => p.element.toLowerCase().includes(element.toLowerCase()));
}
