// @ts-nocheck
// SKIP_LINT

/**
 * Iwori Data Module
 * Spiritual data for Iwori, the sacred Odu representing wisdom, longevity, and ancestral knowledge
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
}

const IWORI_DATA: IworiData[] = [
  {
    id: 'iwori',
    name: 'Iwori',
    nameYoruba: 'Iwori',
    namePortuguese: 'Senhor da Sabedoria e da Longevidade',
    path: 'Odu',
    element: 'Ar e Sabedoria',
    colors: ['#8B4513', '#FFD700', '#D2691E'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [6, 12, 18],
    greeting: 'Iwori mi!',
    archetype: 'O Ancião da Verdade',
    qualities: ['Sabedoria', 'Longevidade', 'Experiência', 'Memória', 'Conhecimento ancestral', 'Paciência'],
    challenges: ['Orgulho', 'Rigidez mental', 'Imobilismo'],
    rulingPlanet: 'Mercúrio',
    sacredAnimals: ['Búfalo', 'Tartaruga'],
    plants: ['Mogno', 'Bambu', 'Embiriba'],
    offerings: {
      primary: ['Vela âmbar', 'Mel', 'Inhame cozido', 'Vinho de palma'],
      secondary: ['Farinha de inhame', 'Pipoca', 'Amendoim torrado'],
      forbidden: ['Carne de cavalo', 'Fígado', 'Fogo forte']
    },
    chants: ['Iwori! Iwori!', 'Oba oju o ro!', 'A ki o sunwa'],
    symbols: {
      key: 'Odu do ancião e da sabedoria testada',
      ikin: 'Seis Ikins',
      divination: 'Revela o conhecimento dos mais velhos',
      alter: 'Banco do Ancião',
      connection: 'Guarda a memória de todos os Odu'
    },
    mythology: {
      origin: 'Iwori nasceu da boca de Olodumare quando o universo foi pensado',
      story: 'Iwori é o mais velho de todos os Odu, aquele que guarda a memória do cosmos. Este Odu traz a mensagem de que o tempo é o maior professor e que a sabedoria vem com a idade.',
      teaching: 'A verdadeira inteligência está em saber que nada se sabe e em buscar sempre mais.'
    },
    spiritualLesson: 'Honrar os anciãos é honrar a própria jornada de aprendizado',
    affirmation: 'Eu abraço a sabedoria dos meus ancestrais e fluo em paz com o ritmo da vida',
    meditation: 'Sente-se em silêncio e pergunte aos seus ancestrais qual é a mensagem para hoje',
    rituals: [
      {
        name: 'Itutu Iwori',
        description: 'Ritual de bênção para estudos e sabedoria',
        timing: 'Quarta-feira ao anoitecer',
        steps: [
          'Sente-se diante de uma vela âmbar',
          'Coloque inhame cozido como oferenda',
          'Recite o poema de Iwori',
          'Peça clareza mental e memória forte',
          'Ofereça mel aos ancestrais',
          'Agradeça pela oportunidade de aprender'
        ]
      }
    ],
    nature: 'Iwori e o principio da sabedoria. Ele governa o conhecimento guardado e a memoria. Este Odu traz a mensagem de que o tempo e o maior professor e que a humildade de aprender abre todas as portas.',
    meaning: 'Iwori fala sobre estudos, trabalho, longevidade, respeito aos mais velhos. Sua mensagem principal e que a sabedoria verdadeira vem da combinacao de experiencia e humildade.',
    eshemus: ['Iwori', 'Olodumare', 'Orunmila', 'Ori'],
    awose: ['Estudos', 'Trabalho', 'Longevidade', 'Anciao', 'Sabedoria', 'Memoria']
  },
  {
    id: 'iwori-meji',
    name: 'Iwori Meji',
    nameYoruba: 'Iwori Meji',
    namePortuguese: 'A Dupla Sabedoria Anciã',
    path: 'Iwori',
    element: 'Ar e Terra',
    colors: ['#8B4513', '#FFD700', '#2F4F4F'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [12, 24, 36],
    greeting: 'Iwori Meji!',
    archetype: 'O Ancião do Conhecimento Duplo',
    qualities: ['Dupla visão', 'Equilíbrio', 'Memória perfeita', 'Sabedoria testada', 'Claridade mental', 'Longevidade aumentada'],
    challenges: ['Indecisão', 'Sobrecarga de conhecimento', 'Melancolia', 'Isolamento'],
    rulingPlanet: 'Mercúrio e Lua',
    sacredAnimals: ['Tartaruga branca', 'Búfalo negro', 'Coruja'],
    plants: ['Mogno branco', 'Bambu dourado', 'Ervas de memória'],
    offerings: {
      primary: ['Vela âmbar e branca', 'Mel puro', 'Inhame branco', 'Dois tipos de frutas'],
      secondary: ['Pipoca branca', 'Amendoim torrado', 'Vinho de palma branco'],
      forbidden: ['Carne de cavalo', 'Fogo muito forte', 'Cerveja']
    },
    chants: ['Iwori Meji!', 'Oba oju o ro ro!', 'Iwin ti o da'],
    symbols: {
      key: 'Odu da sabedoria dupla e anciã',
      ikin: 'Doze Ikins',
      divination: 'Revela que a sabedoria vem em pares',
      alter: 'Banco duplo do Ancião',
      connection: 'Guarda a memória de dois mundos'
    },
    mythology: {
      origin: 'Iwori Meji nasceu quando os primeiros ancestrais收到了 doubled sabedoria',
      story: 'Iwori Meji é a versão mais poderosa de Iwori, onde a sabedoria não vem sozinha mas em pares. Este Odu indica que o consultas está pronto para receber conhecimento que transcendera o tempo.',
      teaching: 'A verdadeira sabedoria não é singular, mas surge da compreensão de que existe sempre mais uma camada de verdade.'
    },
    spiritualLesson: 'A sabedoria verdadeira se revela em camadas; cada entendimento abre novas portas de conhecimento',
    affirmation: 'Eu abro minha mente para receber a sabedoria em sua forma mais completa e verdadeira',
    meditation: 'Visualize dois fluxos de conhecimento antigo convergindo em seu ser, preenchendo cada espaço com luz',
    rituals: [
      {
        name: 'Itutu Iwori Meji',
        description: 'Ritual para amplificar a memória e o conhecimento',
        timing: 'Quarta-feira à noite de lua cheia',
        steps: [
          'Prepare um espaço sagrado com duas velas âmbar',
          'Coloque inhame branco cozido ao centro',
          'Recite o poema de Iwori Meji',
          'Peça dupla clareza mental',
          'Ofereça mel aos quatro cantos',
          'Agradeça pela sabedoria dos ancestrais'
        ]
      }
    ],
    nature: 'Iwori Meji é o principio da sabedoria em sua forma mais completa. Este Odu traz a mensagem de que o conhecimento verdadeiro vem em pares e que a verdadeira compreensão requer paciência.',
    meaning: 'Iwori Meji fala sobre estudos avançados, conhecimento esotérico, longevidade extrema. Sua mensagem é que o consultant está pronto para conhecer segredos antigos.',
    eshemus: ['Iwori', 'Olodumare', 'Orunmila', 'Ori', 'Oxum'],
    awose: ['Estudos', 'Conhecimento', 'Longevidade', 'Memoria', 'Sabedoria dupla', 'Segredos']
  },
  {
    id: 'iwori-oyeku',
    name: 'Iwori Oyeku',
    nameYoruba: 'Iwori Oyeku',
    namePortuguese: 'Sabedoria e Riqueza Oculta',
    path: 'Iwori',
    element: 'Terra e Escuridão',
    colors: ['#8B4513', '#2F4F4F', '#FFD700'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [6, 8, 14],
    greeting: 'Iwori Oyeku!',
    archetype: 'O Ancião Tesoureiro',
    qualities: ['Sabedoria prática', 'Tesouros ocultos', 'Conhecimento do destino', 'Riqueza silenciosa', 'Segredos guardados'],
    challenges: ['Avidez', 'Segredo excessivo', 'Gananância disfarçada de sabedoria'],
    rulingPlanet: 'Mercúrio e Saturno',
    sacredAnimals: ['Tartaruga negra', 'Coruja noturna', 'Cobra'],
    plants: ['Mogno escuro', 'Raízes antigas', 'Ervas de segredo'],
    offerings: {
      primary: ['Vela preta e âmbar', 'Mel escuro', 'Inhame cozido', 'Kolanut'],
      secondary: ['Vinho de palma escuro', 'Dinheiro', 'Pimentão'],
      forbidden: ['Sal em excesso', 'Carne bovina', 'Oferendas a outros Odus sem permissão']
    },
    chants: ['Iwori Oyeku!', 'Olofin o ni o!', 'Iwin okan'],
    symbols: {
      key: 'Odu da sabedoria oculta e tesouros guardados',
      ikin: 'Seis Ikins',
      divination: 'Revela tesouros escondidos e destinos de riqueza',
      alter: 'Baú do Ancião',
      connection: 'Conecta sabedoria com prosperidade oculta'
    },
    mythology: {
      origin: 'Iwori Oyeku nasceu quando a sabedoria se encontrou com a riqueza guardada',
      story: 'Iwori Oyeku é a união entre o ancião da sabedoria e o guardião da riqueza. Este Odu indica que o consultado tem acesso a conhecimento que revela onde tesouros estão escondidos.',
      teaching: 'A verdadeira riqueza está em saber guardar e usar o conhecimento com sabedoria, não em exibí-lo.'
    },
    spiritualLesson: 'Os maiores tesouros são aqueles guardados com humildade e usados com sabedoria',
    affirmation: 'Eu reconheço que minha verdadeira riqueza está na sabedoria que guardo e compartilho com amor',
    meditation: 'Visualize um baú antigo sendo aberto, revelando não ouro, mas conhecimento sagrado que transforma vidas',
    rituals: [
      {
        name: 'Itutu Iwori Oyeku',
        description: 'Ritual para revelar tesouros ocultos',
        timing: 'Quarta-feira à meia-noite',
        steps: [
          'Prepare local sagrado no escuro',
          'Acenda vela preta e âmbar',
          'Coloque inhame cozido e kolanut',
          'Recite o poema de Iwori Oyeku',
          'Peça que tesouros ocultos sejam revelados',
          'Ofereça mel aos cantos',
          'Agradeça pela sabedoria que revela'
        ]
      }
    ],
    nature: 'Iwori Oyeku é a combinação da sabedoria de Iwori com a riqueza de Oyeku. Este Odu traz a mensagem de que existe prosperidade oculta esperando ser descoberta.',
    meaning: 'Iwori Oyeku fala sobre heranças, tesouros escondidos, destinos de riqueza. Sua mensagem é que o conhecimento correto revela onde a abundancia está escondida.',
    eshemus: ['Iwori', 'Oyeku', 'Olodumare', 'Orunmila'],
    awose: ['Riqueza', 'Tesouro', 'Heranca', 'Destino', 'Sabedoria oculta', 'Prosperidade']
  },
  {
    id: 'iwori-ogbe',
    name: 'Iwori Ogbe',
    nameYoruba: 'Iwori Ogbe',
    namePortuguese: 'Sabedoria e Criação Divina',
    path: 'Iwori',
    element: 'Terra e Água',
    colors: ['#8B4513', '#FFD700', '#FFFFFF'],
    dayOfWeek: 'Segunda-feira',
    numbersSacred: [6, 4, 10],
    greeting: 'Iwori Ogbe!',
    archetype: 'O Ancião Criador',
    qualities: ['Criação sábia', 'Inovação enraizada', 'Novos começos', 'Sabedoria aplicada', 'Experiência criativa'],
    challenges: ['Teimosia criativa', 'Resistência a mudanças', 'Superproteção', 'Melancolia'],
    rulingPlanet: 'Mercúrio e Sol',
    sacredAnimals: ['Tartaruga', 'Cavalo ancião', 'Búfalo'],
    plants: ['Mogno', 'Obí', 'Semente antiga'],
    offerings: {
      primary: ['Vela âmbar e branca', 'Mel', 'Inhame cozido', 'Sementes'],
      secondary: ['Milho', 'Frutas amarelas', 'Kolanut antigo'],
      forbidden: ['Carne de cavalo', 'Vinho tinto', 'Fogo muito forte']
    },
    chants: ['Iwori Ogbe!', 'Ogbe ni o!', 'Baba ti o wa'],
    symbols: {
      key: 'Odu da criação sábia e novos começos ancestrais',
      ikin: 'Seis Ikins',
      divination: 'Revela que é hora de criar algo novo com sabedoria',
      alter: 'Banco e semente do Ancião',
      connection: 'Conecta tradição com inovação'
    },
    mythology: {
      origin: 'Iwori Ogbe nasceu quando o ancião decidiu criar algo novo',
      story: 'Iwori Ogbe é a união da sabedoria anciã com a energia criativa. Este Odu indica que o consultado pode criar algo que durará gerações, pois tem a experiência para fazer escolhas certas.',
      teaching: 'Os melhores criadores são aqueles que aprenderam com os erros dos ancestrais.'
    },
    spiritualLesson: 'A verdadeira criação não é começar do zero, mas honrar o que veio antes enquanto se constrói algo novo',
    affirmation: 'Eu crio algo novo hoje, enraizado na sabedoria dos meus ancestrais e iluminado pela visão do futuro',
    meditation: 'Plante uma semente imaginária em terra fértil, invocando a sabedoria dos anciãos para fazê-la crescer forte',
    rituals: [
      {
        name: 'Itutu Iwori Ogbe',
        description: 'Ritual para iniciar novos projetos com sabedoria',
        timing: 'Segunda-feira ao amanhecer de quarta-feira',
        steps: [
          'Prepare espaço sagrado ao amanhecer',
          'Acenda vela âmbar e branca',
          'Plante semente real ou visualize',
          'Recite o poema de Iwori Ogbe',
          'Peça sabedoria para criar algo duradouro',
          'Ofereça inhame cozido',
          'Agradeça aos ancestrais pela orientação'
        ]
      }
    ],
    nature: 'Iwori Ogbe é a combinação da sabedoria anciã com a energia criativa. Este Odu traz a mensagem de que novos projetos podem ser bem-sucedidos se guiados pela experiência.',
    meaning: 'Iwori Ogbe fala sobre novos começos, projetos importantes, criação de algo significativo. Sua mensagem é que a hora de criar chegou.',
    eshemus: ['Iwori', 'Ogbe', 'Olodumare', 'Orunmila'],
    awose: ['Criacao', 'Novo comeco', 'Projeto', 'Innovacao', 'Tradição', 'Semente']
  },
  {
    id: 'iwori-ossi',
    name: 'Iwori Ossi',
    nameYoruba: 'Iwori Ossi',
    namePortuguese: 'Sabedoria e Movimento Ancião',
    path: 'Iwori',
    element: 'Ar e Fogo',
    colors: ['#8B4513', '#FF4500', '#FFD700'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [6, 9, 15],
    greeting: 'Iwori Ossi!',
    archetype: 'O Viajante Ancião',
    qualities: ['Sabedoria viajante', 'Adaptabilidade anciã', 'Experiência moente', 'Conhecimento múltiplo', 'Flexibilidade'],
    challenges: ['Inquietação excessiva', 'Superficialidade', 'Fuga de responsabilidades', 'Excesso de movimento'],
    rulingPlanet: 'Mercúrio e Urano',
    sacredAnimals: ['Tartaruga veloz', 'Coruja errante', 'Pássaro antigo'],
    plants: ['Mogno voador', 'Ervas de viagem', 'Plantas trepadeiras'],
    offerings: {
      primary: ['Vela âmbar e laranja', 'Mel', 'Inhame cozido', 'Sementes de viagem'],
      secondary: ['Pipoca', 'Amendoim', 'Frutas de viagem'],
      forbidden: ['Carne de cavalo', 'Permanência em um lugar só', 'Fogo muito intenso']
    },
    chants: ['Iwori Ossi!', 'Ossi lo ko!', 'Baba ti n lo'],
    symbols: {
      key: 'Odu do ancião que viaja e guarda conhecimento de muitos lugares',
      ikin: 'Seis Ikins',
      divination: 'Revela que é hora de viajar para aprender',
      alter: 'Banco do Viajante',
      connection: 'Guarda sabedoria de muitas terras'
    },
    mythology: {
      origin: 'Iwori Ossi nasceu quando o ancião decidiu viajar para guardar mais conhecimento',
      story: 'Iwori Ossi é o Odu do ancião viajante, aquele que não fica preso a um lugar. Este Odu indica que o consultado deve buscar conhecimento em outros lugares.',
      teaching: 'A sabedoria verdadeira não conhece fronteiras; ela viaja para encontrar todos os cantos do mundo.'
    },
    spiritualLesson: 'Viajar é uma forma de aprender; cada lugar guarda uma peça do conhecimento universal',
    affirmation: 'Eu abraço a jornada de conhecimento, carregando a sabedoria dos meus ancestrais para onde quer que eu vá',
    meditation: 'Sinta-se como um pássaro ancão, voando sobre terras desconhecidas enquanto guarda a sabedoria de todos os lugares visitados',
    rituals: [
      {
        name: 'Itutu Iwori Ossi',
        description: 'Ritual para abençoar viagens de conhecimento',
        timing: 'Quarta-feira antes de viagens',
        steps: [
          'Prepare espaço sagrado antes de partir',
          'Acenda vela âmbar e laranja',
          'Coloque inhame cozido e sementes',
          'Recite o poema de Iwori Ossi',
          'Peça proteção e aprendizado na viagem',
          'Leve kolanut como companhia',
          'Agradeça aos ancestrais pela bênção'
        ]
      }
    ],
    nature: 'Iwori Ossi é a sabedoria do ancião em movimento constante. Este Odu traz a mensagem de que o conhecimento está em todos os lugares.',
    meaning: 'Iwori Ossi fala sobre viagens, mudanças, conhecimento de outros lugares. Sua mensagem é que o consultant deve sair para aprender.',
    eshemus: ['Iwori', 'Ossi', 'Olodumare', 'Orunmila'],
    awose: ['Viagem', 'Mudanca', 'Conhecimento', 'Estradas', 'Novos lugares', 'Aprendizado']
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