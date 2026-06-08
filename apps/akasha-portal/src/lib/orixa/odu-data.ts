// @ts-nocheck
// SKIP_LINT

/**
 * Odu Data Module
 * Spiritual data and configurations for the 16 Principal Odu of Ifá
 */

export interface OduOfferings {
  primary: string[];
  secondary: string[];
  forbidden: string[];
}

export interface OduSymbols {
  key: string;
  ikin: string;
  divination: string;
  alter: string;
  connection: string;
}

export interface OduMythology {
  origin: string;
  story: string;
  teaching: string;
}

export interface OduRitual {
  name: string;
  description: string;
  timing: string;
  steps: string[];
}

export interface OduData {
  id: string;
  name: string;
  nameYoruba: string;
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
  offerings: OduOfferings;
  chants: string[];
  symbols: OduSymbols;
  mythology: OduMythology;
  spiritualLesson: string;
  affirmation: string;
  meditation: string;
  rituals: OduRitual[];
  nature: string;
  meaning: string;
  eshemus: string[];
  awose: string[];
}

const ODU_DATA: OduData[] = [
  {
    id: 'ogbe',
    name: 'Ogbe',
    nameYoruba: 'Ogbe',
    namePortuguese: 'Senhor do Início e da Criação',
    path: 'Odu',
    element: 'Criação e Oportunidade',
    colors: ['#FF0000', '#8B0000', '#FFD700'],
    dayOfWeek: 'Segunda-feira',
    numbersSacred: [4, 8, 16],
    greeting: 'Eko ni o!',
    archetype: 'O Criador e Iniciador',
    qualities: ['Iniciação', 'Criação', 'Oportunidade', 'Novos caminhos', 'Propósito', 'Destino'],
    challenges: ['Impaciência', 'Início precipitado', 'Abandono'],
    rulingPlanet: 'Sol',
    sacredAnimals: ['Galo', 'Cão'],
    plants: [' Palmeira', 'Manga', 'Cajá'],
    offerings: {
      primary: ['Mel', 'Fumo', 'Azeite de dendê', 'Galo branco'],
      secondary: ['Farinha de mandioca', 'Obi', 'Eru'],
      forbidden: ['Carne de porco', 'Pepino', 'Pimenta']
    },
    chants: ['Ogbe la da o!', 'Ori fi oluwa', 'Ara n re'],
    symbols: {
      key: 'Primeiro Odu - Representa o início de tudo',
      ikin: 'Quatro Ikins (castanhas/kieler)',
      divination: 'A Ifá corpus inicia com Ogbe',
      alter: 'Sagrário de Ori',
      connection: 'Conecta todos os Odu'
    },
    mythology: {
      origin: 'Ogbe nasceu quando Olorun olhou para a Terra pela primeira vez',
      story: 'Ogbe é o Odu que abre todos os caminhos. Quando ele aparece, significa que Olorun está preparando algo novo para o consulente. Ogbe traz a mensagem de que todo começo carrega em si o poder da criação.',
      teaching: 'Ogbe ensina que cada novo início é uma oportunidade sagrada de criar o destino.'
    },
    spiritualLesson: 'O verdadeiro poder está em começar com intenção pura e coração aberto',
    affirmation: 'Eu inicio esta jornada com sabedoria e clareza, confiando no poder sagrado de Olorun',
    meditation: 'Visualize uma luz dourada emanando do centro do seu ser, iluminando novos caminhos',
    rituals: [
      {
        name: 'Itutu Ogbe',
        description: 'Ritual de abertura de caminho usando mel e fumo',
        timing: 'Segunda-feira ao amanhecer',
        steps: [
          'Prepare espaço sagrado com limpeza de Erun',
          'Coloque mel no centro do tabuleiro de Ifá',
          'Desenhe Ogbe com ikin ou opala',
          'Recite o poema de Ogbe',
          'Ofereça o mel ao sagrado',
          'Acenda vela dourada',
          'Peça a Ori que abra novos caminhos'
        ]
      },
      {
        name: 'Ipetu Ogbe',
        description: 'Sacrifício de abertura para novos projetos',
        timing: 'Antes de iniciar qualquer empreendimento',
        steps: [
          'Jejum de um dia antes',
          'Preparar galo branco vivo',
          'Fazer ebo com mel e farofa',
          'Recitar ewó de Ogbe',
          'Libertar o galo em local sagrado',
          'Oferecer e prayer for new beginnings'
        ]
      }
    ],
    nature: 'Ogbe é o principio de todo inicio. Ele governa a criacao e o proposito. Este Odu traz a mensagem de que Olorun esta preparando um caminho novo. Ogbe abre portas e cria oportunidades onde antes nao existiam. Ele fala da forca vital que anima todas as coisas. Ogbe representa a energia pura de quando Olorun decidiu criar o universo. Este Odu pede que voce conforte em sua propria capacidade de comecar novamente.',
    meaning: 'Ogbe fala sobre inicio, oportunidade, criacao, destino. Sua mensagem principal e que o universo esta conspirando a seu favor para que voce de o primeiro passo.',
    eshemus: ['Ogbe', 'Ara', 'Ori', 'Olodumare', 'Eshu'],
    awose: ['Inicio', 'Criacao', 'Destino', 'Proposito', 'Oportunidade', 'Propriedade', 'Riqueza']
  },
  {
    id: 'oyeku',
    name: 'Oyeku',
    nameYoruba: 'Oyeku',
    namePortuguese: 'Senhor da Riqueza e do Destino',
    path: 'Odu',
    element: 'Água e Escuridão',
    colors: ['#000000', '#FFD700', '#4B0082'],
    dayOfWeek: 'Terça-feira',
    numbersSacred: [8, 12, 16],
    greeting: 'Oyeku!',
    archetype: 'O Guardião dos Tesouros Ocultos',
    qualities: ['Riqueza', 'Tesouros ocultos', 'Destino fixo', 'Mistério', 'Poder terrestre', 'Abundância'],
    challenges: ['Ganância', 'Avidez', 'Inveja'],
    rulingPlanet: 'Lua',
    sacredAnimals: ['Cobra', 'Sapo'],
    plants: ['Oiti', 'Mungunzá', 'Acal'],
    offerings: {
      primary: ['Pepita de ouro', 'Moedas antigas', 'Vela preta', 'Água de angico'],
      secondary: ['Milho torrado', 'Farinha de夸奖', 'Coco'],
      forbidden: ['Feijão', 'Sal', 'Água corrente']
    },
    chants: ['Oyeku me fa!', 'Olofin o ni o!', 'A bora okan'],
    symbols: {
      key: 'Odu da riqueza e dos destinos ocultos',
      ikin: 'Oito Ikins',
      divination: 'Revela tesouros escondidos e的命运',
      alter: 'Caixa deTesouros',
      connection: 'Relacionado aos Orunmila e aos ancestrais'
    },
    mythology: {
      origin: 'Oyeku emergiu quando os mundos foram criados e os destinos distribuidos',
      story: 'Oyeku é o orixá que guarda todos os tesouros da terra. Quando este Odu aparece, os ancestrais estão revelando caminhos de prosperidade. Oyeku governa o destino que não pode ser alterado - apenas aceito e trabalhado.',
      teaching: 'A verdadeira riqueza não está no que se possui, mas no que se sabe fazer com o destino.'
    },
    spiritualLesson: 'A abundância verdadeira vem do trabalho sagrado e da compreensão dos ciclos de provisão',
    affirmation: 'Eu abro-me para a prosperidade divina que flui através dos canais sagrados da vida',
    meditation: 'Visualize um fluxo de luz dourada entrando no seu espaço, carregando bênçãos de todos os seus ancestrais',
    rituals: [
      {
        name: 'Itutu Oyeku',
        description: 'Ritual para abrir caminhos de prosperidade',
        timing: 'Terça-feira à noite',
        steps: [
          'Prepare um prato branco com moedas antigas',
          'Coloque pepitas de ouro ou dourados',
          'Acenda velas pretas nos quatro cantos',
          'Recite o poema de Oyeku',
          'Ofereça milho torrado ao centro',
          'Peça a Oyeku que revele caminhos de abundancia'
        ]
      }
    ],
    nature: 'Oyeku e o principio da riqueza e do destino. Ele governa os tesouros escondidos e os caminhos ja traçados. Este Odu traz a mensagem de que a prosperidade esta disponivel para quem trabalha com paciencia e respeito.',
    meaning: 'Oyeku fala sobre dinheiro, heranca, destino, prosperidade. Sua mensagem principal e que existe um fluxo de abundancia esperando ser descoberto.',
    eshemus: ['Oyeku', 'Olofin', 'Olodumare', 'Eshu'],
    awose: ['Dinheiro', 'Heranca', 'Destino', 'Tesouro', 'Prosperidade', 'Riqueza']
  },
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
    id: 'odi',
    name: 'Odi',
    nameYoruba: 'Odi',
    namePortuguese: 'Senhor do Conhecimento Secreto',
    path: 'Odu',
    element: 'Água Estagnada e Mistério',
    colors: ['#4B0082', '#000000', '#9370DB'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [7, 14, 21],
    greeting: 'E ko lo!',
    archetype: 'O Revelador de Segredos',
    qualities: ['Segredos', 'Conhecimento oculto', 'Intuição', 'Misticismo', 'Investigação', 'Mistérios'],
    challenges: ['Paranoia', 'Segredos guarding', 'Medo do escuro'],
    rulingPlanet: 'Netuno',
    sacredAnimals: ['Coruja', 'Salamandra'],
    plants: ['Jurema', 'Caioba', 'Pitiá'],
    offerings: {
      primary: ['Vela roxa', 'Cabaça', 'Vinho escuro', 'Pimenta'],
      secondary: ['Fumo', 'Mel escuro', 'Coco ralado'],
      forbidden: ['Luz do sol', 'Espelho', 'Água corrente']
    },
    chants: ['Odi lo fun!', 'Ase omo oji!', 'Okan mi o lo'],
    symbols: {
      key: 'Odu dos segredos e da verdade oculta',
      ikin: 'Sete Ikins',
      divination: 'Abre os olhos para verdades escondidas',
      alter: 'Caverna do conhecimento',
      connection: 'Conecta com o mundo espiritual'
    },
    mythology: {
      origin: 'Odi nasceu quando o primeiro segredo foi guardado',
      story: 'Odi é o Odu que revela o que está oculto. Este Odu traz a mensagem de que toda verdade será descoberta e que o consulente precisa estar preparado para saber.',
      teaching: 'A verdade é uma semente que, uma vez plantada, não pode deixar de germinar.'
    },
    spiritualLesson: 'O conhecimento verdadeiro não vem apenas de fora, mas da escuta do coração',
    affirmation: 'Eu abro minha mente para os segredos sagrados que me libertarão',
    meditation: 'Visualize uma caverna escura onde você deposita todas as suas perguntas - as respostas virão quando você estiver pronto',
    rituals: [
      {
        name: 'Itutu Odi',
        description: 'Ritual para abrir caminhos de conhecimento secreto',
        timing: 'Quarta-feira à meia-noite',
        steps: [
          'Acenda velas roxas no escuro',
          'Coloque cabaça com vinho escuro',
          'Recite o poema de Odi',
          'Peça que os segredos sejam revelados',
          'Enterre perguntas na terra',
          'Aguarde a resposta em sonhos'
        ]
      }
    ],
    nature: 'Odi e o principio do conhecimento secreto. Ele governa os segredos e as verdades ocultas. Este Odu traz a mensagem de que a realidade tem camadas que nem todos podem ver.',
    meaning: 'Odi fala sobre segredos, feiticaria, conhecimento oculto, verdade. Sua mensagem principal e que a verdade sera revelada no tempo certo.',
    eshemus: ['Odi', 'Olodumare', 'Aja', 'Eshu'],
    awose: ['Feiticaria', 'Segredo', 'Conhecimento', 'Ocultismo', 'Verdade oculta']
  },
  {
    id: 'oshe',
    name: 'Oshe',
    nameYoruba: 'Oshe',
    namePortuguese: 'Senhor da Beleza e da Arte',
    path: 'Odu',
    element: 'Beleza e Criatividade',
    colors: ['#FFD700', '#FF69B4', '#FFA500'],
    dayOfWeek: 'Quinta-feira',
    numbersSacred: [5, 10, 15],
    greeting: 'Oshe o!',
    archetype: 'O Artista do Destino',
    qualities: ['Criatividade', 'Beleza', 'Ornamento', 'Expressão artística', 'Carisma', 'Elegância'],
    challenges: ['Vaidade', 'Superficialidade', 'Excesso de ornamento'],
    rulingPlanet: 'Vênus',
    sacredAnimals: ['Pavão', 'Beiçuda'],
    plants: ['Alamanda', 'Heliconia', 'Algeroba'],
    offerings: {
      primary: ['Flores coloridas', 'Perfume', 'Colares', 'Vela dourada'],
      secondary: ['Farinha de milho', 'Mel', 'Óleo de coco'],
      forbidden: ['Objeto quebrado', 'Sujeira', 'Inveja']
    },
    chants: ['Oshe na!', 'Oba ta!', 'E yin o!'],
    symbols: {
      key: 'Odu da arte e da beleza',
      ikin: 'Cinco Ikins',
      divination: 'Revela a necessidade de expressão artística',
      alter: 'Santuário da Beleza',
      connection: 'Relacionado à Iansã e à fertilidade'
    },
    mythology: {
      origin: 'Oshe nasceu quando Olodumare decidiu embelezar o mundo',
      story: 'Oshe é o Odu que traz o dom da criatividade. Este Odu aparece para indicar que a pessoa precisa expressar sua beleza interior através da arte.',
      teaching: 'A beleza é uma linguagem sagrada que conecta a alma humana ao divino.'
    },
    spiritualLesson: 'Expressar a própria criatividade é um ato de adoração a Olodumare',
    affirmation: 'Eu abraço minha criatividade e deixo a beleza fluir através de mim',
    meditation: 'Pinte ou desenhe mentalmente um lugar sagrado de paz absoluta',
    rituals: [
      {
        name: 'Itutu Oshe',
        description: 'Ritual para despertar a criatividade',
        timing: 'Quinta-feira ao entardecer',
        steps: [
          'Coloque flores coloridas no altar',
          'Acenda velas douradas',
          'Recite o poema de Oshe',
          'Dançue ou cante com todo o coração',
          'Crie algo - qualquer coisa - como oferenda',
          'Agradeça pelo dom da expressão'
        ]
      }
    ],
    nature: 'Oshe e o principio da beleza e da arte. Ele governa a criatividade e a expressao. Este Odu traz a mensagem de que cada pessoa carrega dentro de si um artista esperando para despertar.',
    meaning: 'Oshe fala sobre arte, trabalho com pessoas, beleza, feiticaria, jogo, destino. Sua mensagem principal e que a expressao criativa e uma forma de oracao.',
    eshemus: ['Oshe', 'Osun', 'Olodumare', 'Eshu'],
    awose: ['Arte', 'Beleza', 'Feiticaria', 'Trabalho com pessoas', 'Jogo', 'Destino']
  },
  {
    id: 'obara',
    name: 'Obara',
    nameYoruba: 'Obara',
    namePortuguese: 'Senhor da Disciplina e da Lei',
    path: 'Odu',
    element: 'Lei e Ordem',
    colors: ['#8B0000', '#FFFFFF', '#000000'],
    dayOfWeek: 'Sexta-feira',
    numbersSacred: [7, 14, 21],
    greeting: 'E obara!',
    archetype: 'O Guardião das Leis',
    qualities: ['Disciplina', 'Lei', 'Ordem', 'Justiça', 'Regras', 'Estrutura'],
    challenges: ['Rigidez', 'Intolerância', 'Fanatismo'],
    rulingPlanet: 'Saturno',
    sacredAnimals: ['Touro', 'Bode'],
    plants: ['Arroz', 'Quiabo', 'Nimba'],
    offerings: {
      primary: ['Arroz branco', 'Quiabo', 'Fumo', 'Vela branca'],
      secondary: ['Milho', 'Feijão branco', 'Sal'],
      forbidden: ['Pimenta', 'Alcool', 'Luto']
    },
    chants: ['Obara la ma!', 'Elefu o ma je!', 'A o foya'],
    symbols: {
      key: 'Odu da disciplina e da justiça',
      ikin: 'Sete Ikins',
      divination: 'Estabelece regras e limites',
      alter: 'Tribunal de Ifá',
      connection: 'Guarda as leis do universo'
    },
    mythology: {
      origin: 'Obara nasceu quando Olodumare estabeleceu as primeiras leis',
      story: 'Obara é o Odu que governa a disciplina e a ordem. Este Odu traz a mensagem de que sem limites não há liberdade.',
      teaching: 'A verdadeira liberdade está na compreensão e no respeito às leis sagradas.'
    },
    spiritualLesson: 'A disciplina pessoal é o caminho para a maestria espiritual',
    affirmation: 'Eu honro as leis sagradas e vivo em harmonia com a ordem do universo',
    meditation: 'Visualize uma balança em perfeito equilíbrio - cada pensamento, cada ação medida com precisão',
    rituals: [
      {
        name: 'Itutu Obara',
        description: 'Ritual para estabelecer disciplina e ordem',
        timing: 'Sexta-feira ao amanhecer',
        steps: [
          'Prepare espaço com limpeza de Erun',
          'Coloque arroz branco no centro',
          'Acenda velas brancas',
          'Recite o poema de Obara',
          'Estabeleça suas intenções de disciplina',
          'Agradeça pela capacidade de manter a ordem'
        ]
      }
    ],
    nature: 'Obara e o principio da lei e da ordem. Ele governa a disciplina e a justicia. Este Odu traz a mensagem de que sem limites nao ha estrutura e sem estrutura nao ha possibilidade.',
    meaning: 'Obara fala sobre lei, disciplina, trabalho com ferramentas, justica, medicina. Sua mensagem principal e que a ordem e necessaria para a liberdade.',
    eshemus: ['Obara', 'Olodumare', 'Ogun', 'Osain'],
    awose: ['Lei', 'Disciplina', 'Trabalho com ferramentas', 'Justica', 'Medicina']
  },
  {
    id: 'owanrin',
    name: 'Owanrin',
    nameYoruba: 'Owanrin',
    namePortuguese: 'Senhor dos Ventos e das Tempestades',
    path: 'Odu',
    element: 'Ar e Tempestade',
    colors: ['#4169E1', '#808080', '#00CED1'],
    dayOfWeek: 'Domingo',
    numbersSacred: [4, 8, 12],
    greeting: 'E owanrin!',
    archetype: 'O senhor das Mudanças',
    qualities: ['Mudança', 'Transformação', 'Vento', 'Tempestade', 'Mobilidade', 'Adaptação'],
    challenges: ['Instabilidade', 'Inconstância', 'Ansiedade'],
    rulingPlanet: 'Urano',
    sacredAnimals: ['Pássaro', 'Papagaio'],
    plants: ['Capim', 'Bambú', 'Mambai'],
    offerings: {
      primary: ['Pena de galo', 'Fumo', 'Vela azul', 'Água de cheiro'],
      secondary: ['Milho', 'Farinha', 'Flores brancas'],
      forbidden: ['Carne assada', 'Vento parado', 'Manto pesado']
    },
    chants: ['Owanrin lo gbo!', 'Oluwa o ma je!', 'Ara re o'],
    symbols: {
      key: 'Odu das mudanças e transformações',
      ikin: 'Quatro Ikins',
      divination: 'Indica tempos de mudança',
      alter: 'Campo aberto ao vento',
      connection: 'Relacionado a Iansã e a Ogun'
    },
    mythology: {
      origin: 'Owanrin nasceu quando o primeiro vento soprou sobre a terra',
      story: 'Owanrin é o Odu das mudanças. Este Odu traz a mensagem de que nada é permanente e que a transformação é a única constante.',
      teaching: 'A resistência à mudança é a raiz de todo sofrimento.'
    },
    spiritualLesson: 'Aceitar a mudança é aceitar o fluxo natural da vida',
    affirmation: 'Eu abraço as mudanças como oportunidades de crescimento e evolução',
    meditation: 'Sinta o vento passando por você, levando embora o que não serve mais',
    rituals: [
      {
        name: 'Itutu Owanrin',
        description: 'Ritual para navegar transições',
        timing: 'Domingo ao entardecer',
        steps: [
          'Vá para local aberto ou janela aberta',
          'Coloque penas no altar',
          'Acenda velas azuis',
          'Recite o poema de Owanrin',
          'Peça força para a transição',
          'Solte o que precisa ser libertado ao vento'
        ]
      }
    ],
    nature: 'Owanrin e o principio da mudanca. Ele governa os ventos e as tempestades. Este Odu traz a mensagem de que nada e permanente e que a transformacao e a unica constante.',
    meaning: 'Owanrin fala sobre catarro, corrimento, mudanças, tempo, tempestade, olho. Sua mensagem principal e que aceitar a mudanca e aceitar a vida.',
    eshemus: ['Owanrin', 'Iansa', 'Olodumare', 'Ogun'],
    awose: ['Catarro', 'Corrimento', 'Mudanca', 'Tempestade', 'Tempo']
  },
  {
    id: 'obara-meji',
    name: 'Obara Meji',
    nameYoruba: 'Obarameji',
    namePortuguese: 'Senhor da Justiça Dupla',
    path: 'Odu',
    element: 'Dualidade e Equilíbrio',
    colors: ['#8B0000', '#FFD700', '#000000', '#FFFFFF'],
    dayOfWeek: 'Sexta-feira',
    numbersSacred: [14, 28],
    greeting: 'Obara Meji!',
    archetype: 'O Equilibrador das Duas Faces',
    qualities: ['Justiça', 'Equilíbrio', 'Dualidade', 'Mesa-redonda', 'Reconciliação', 'Fortalecimento'],
    challenges: ['Indecisão', 'Polarização', 'Maniqueísmo'],
    rulingPlanet: 'Saturno e Júpiter',
    sacredAnimals: ['Dois bodes', 'Balanca'],
    plants: ['Dois pés de arroz', 'Lombrigueira dupla'],
    offerings: {
      primary: ['Dois pratos', 'Dois galos', 'Velas branco e vermelho', 'Arroz duplo'],
      secondary: ['Feijão branco', 'Fumo duplo', 'Mel em dois copos'],
      forbidden: ['Ofertas incompletas', 'Metade de qualquer coisa']
    },
    chants: ['Obara Meji!', 'Ojo l\'a o ra!', 'A se t\'o re'],
    symbols: {
      key: 'Odu da duplicidade e da justiça completa',
      ikin: 'Catorze Ikins',
      divination: 'Revela dois caminhos equally válidos',
      alter: 'Mesa-redonda de Camelot',
      connection: 'Une todos os Odu em equilíbrio'
    },
    mythology: {
      origin: 'Obara Meji nasceu quando Osun se casou com Olokun e a duplicidade do mundo foi criada',
      story: 'Obara Meji é o Odu que representa o equilíbrio entre opostos. Este Odu traz a mensagem de que toda situação tem dois lados e que a sabedoria está em ver ambos.',
      teaching: 'A verdadeira justiça vê além da aparência e compreende a necessidade de ambos os lados.'
    },
    spiritualLesson: 'O equilíbrio vem de honrar ambas as forças opostas que habitam em nós',
    affirmation: 'Eu encontro harmonia no contraste, sabedoria na dualidade, paz na completude',
    meditation: 'Visualize duas forças - uma clara e uma escura - dançando em perfeita harmonia dentro de você',
    rituals: [
      {
        name: 'Itutu Obara Meji',
        description: 'Ritual de reconciliação e equilíbrio',
        timing: 'Sexta-feira ao anoitecer',
        steps: [
          'Prepare dois pratos com igual quantidade de alimento',
          'Coloque duas velas - uma branca, uma vermelha',
          'Recite o poema de Obara Meji',
          'Peça equilíbrio entre forças opostas',
          'Coma dos dois pratos equally',
          'Agradeça pela capacidade de ver ambos os lados'
        ]
      }
    ],
    nature: 'Obara Meji e o principio da dualidade. Ele governa o equilibrio entre luz e escuridao. Este Odu traz a mensagem de que todo yin tem seu yang e que a sabedoria esta em aceitar ambos.',
    meaning: 'Obara Meji fala sobre justiça, conselho, reconciliação, mesa-redonda, fortalecimento. Sua mensagem principal e que o equilibrio e a meta, nao a eliminacao de um lado.',
    eshemus: ['Obara', 'Osun', 'Olokun', 'Olodumare'],
    awose: ['Justica', 'Conselho', 'Mesa-redonda', 'Reconciliacao', 'Fortalecimento']
  },
  {
    id: 'ogunda',
    name: 'Ogunda',
    nameYoruba: 'Ogunda',
    namePortuguese: 'Senhor da Guerra e do Conhecimento Técnico',
    path: 'Odu',
    element: 'Ferro e Fogo',
    colors: ['#696969', '#2F4F4F', '#FF0000'],
    dayOfWeek: 'Terça-feira',
    numbersSacred: [8, 16],
    greeting: 'Ogunda!',
    archetype: 'O Estrategista',
    qualities: ['Guerra', 'Estratégia', 'Conhecimento técnico', 'Metal', 'Determinação', 'Inovação'],
    challenges: ['Agressividade', 'Destruição', 'Impaciência'],
    rulingPlanet: 'Marte',
    sacredAnimals: ['Cavalo', 'Carneiro'],
    plants: ['Ferro-velho', 'Espada', 'Palmeira'],
    offerings: {
      primary: ['Faca', 'Alfinete', 'Vela vermelha', 'Fumo'],
      secondary: ['Pimenta', 'Mel', 'Galo'],
      forbidden: ['Algodão', 'Fio de embroideria', 'Objeto delicado']
    },
    chants: ['Ogunda kete!', 'Ogun lo da!', 'Aja o ma je'],
    symbols: {
      key: 'Odu do ferro e da estratégia',
      ikin: 'Oito Ikins',
      divination: 'Revela conflitos e soluções técnicas',
      alter: 'Forja de Ogun',
      connection: 'Abre caminhos de invenção'
    },
    mythology: {
      origin: 'Ogunda nasceu quando Ogun criou a primeira ferramenta de ferro',
      story: 'Ogunda é o Odu que traz a mensagem de que todo conflito tem uma solução técnica. Este Odu governa o conhecimento das artes mecânicas e da guerra.',
      teaching: 'A verdadeira força está na estratégia, não na violência.'
    },
    spiritualLesson: 'Conhecer as ferramentas certas é metade da batalha',
    affirmation: 'Eu possuo a sabedoria técnica para resolver todos os desafios',
    meditation: 'Visualize uma forja onde suas ideias são transformadas em ferramentas concretas',
    rituals: [
      {
        name: 'Itutu Ogunda',
        description: 'Ritual para abrir caminhos de solução técnica',
        timing: 'Terça-feira ao amanhecer',
        steps: [
          'Limpe uma faca ou objeto de ferro',
          'Coloque no centro do tabuleiro de Ifá',
          'Acenda velas vermelhas',
          'Recite o poema de Ogunda',
          'Peça sabedoria técnica e estratégica',
          'Enterre a faca na terra para proteção'
        ]
      }
    ],
    nature: 'Ogunda e o principio do ferro e da estrategia. Ele governa a guerra e a tecnologia. Este Odu traz a mensagem de que todo problema tem uma solucao tecnica esperando para ser descoberta.',
    meaning: 'Ogunda fala sobre guerra, discussão, ferimento, corte, conhecimento técnico, metal, ferramentas. Sua mensagem principal e que a estrategia e mais importante que a forca bruta.',
    eshemus: ['Ogunda', 'Ogun', 'Osain', 'Olodumare'],
    awose: ['Guerra', 'Discussao', 'Ferimento', 'Metal', 'Ferramentas']
  },
  {
    id: 'osa',
    name: 'Osa',
    nameYoruba: 'Osa',
    namePortuguese: 'Senhor das Bosas e do Entendimento',
    path: 'Odu',
    element: 'Fogo e Fumaça',
    colors: ['#FF4500', '#8B0000', '#FFD700'],
    dayOfWeek: 'Domingo',
    numbersSacred: [9, 18],
    greeting: 'E ose!',
    archetype: 'O Fumador de Segredos',
    qualities: ['Caminho', 'Fumaça', 'Feitiçaria', 'Entendimento profundo', 'Engano', 'Sorte'],
    challenges: ['Manipulação', 'Ilusão', 'Adição'],
    rulingPlanet: 'Plutão',
    sacredAnimals: ['Cobra', 'Fumaça'],
    plants: ['Fumo', 'Cannabis', 'Maconha'],
    offerings: {
      primary: ['Fumo', 'Vela vermelha', 'Garrafa', 'Pimenta'],
      secondary: ['Vinho', 'Mel', 'Cenoura'],
      forbidden: ['Luz do dia forte', 'Água corrente', 'Espelho']
    },
    chants: ['Osa ni o!', 'Eshu ti nso!', 'A ko le ri'],
    symbols: {
      key: 'Odu das bosas e da fumaça',
      ikin: 'Nove Ikins',
      divination: 'Revela feitiçaria e caminhos ocultos',
      alter: 'Casar da fumaça',
      connection: 'Guarda os segredos dos Odu'
    },
    mythology: {
      origin: 'Osa nasceu quando a primeira fumaça subiu ao céu carregando pedidos aos deuses',
      story: 'Osa é o Odu que governa a feitiçaria e os caminhos ocultos. Este Odu traz a mensagem de que nem tudo é o que parece.',
      teaching: 'A fumaça carrega preces, mas também pode carregar enganos.'
    },
    spiritualLesson: 'Buscar a verdade é mais importante que buscar a solução rápida',
    affirmation: 'Eu filtro as ilusões e encontro a verdade por trás das aparências',
    meditation: 'Visualize a fumaça revelando mensagens que antes estavam ocultas',
    rituals: [
      {
        name: 'Itutu Osa',
        description: 'Ritual para proteção contra feitiçaria',
        timing: 'Domingo à noite',
        steps: [
          'Acenda velas vermelhas no escuro',
          'Queime fumo em um pires',
          'Recite o poema de Osa',
          'Peça proteção contra enganos',
          'Camine na fumaça em circulo',
          'Agradeça pela capacidade de ver atraves da ilusao'
        ]
      }
    ],
    nature: 'Osa e o principio da fumaça e da feiticaria. Ele governa os caminhos ocultos e o entendimento profundo. Este Odu traz a mensagem de que a verdade nem sempre e visivel a primeira vista.',
    meaning: 'Osa fala sobre feitiçaria, discussão, engano, bosas, compreensão, casa, fumaça. Sua mensagem principal e que nem tudo e o que parece e que buscar a verdade e fundamental.',
    eshemus: ['Osa', 'Eshu', 'Olodumare', 'Olofin'],
    awose: ['Feiticaria', 'Discussao', 'Engano', 'Bosas', 'Compreensao']
  },
  {
    id: 'ika',
    name: 'Ika',
    nameYoruba: 'Ika',
    namePortuguese: 'Senhor da Terra e das Raízes',
    path: 'Odu',
    element: 'Terra e Podridão',
    colors: ['#8B4513', '#556B2F', '#4B0082'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [10, 20],
    greeting: 'E ika!',
    archetype: 'O Transformador da Matéria',
    qualities: ['Terra', 'Transformação', 'Decadência', 'Cura', 'Mofo', 'Decomposição'],
    challenges: ['Decomposição', 'Medo da morte', 'Rigidez'],
    rulingPlanet: 'Plutão',
    sacredAnimals: ['Tatu', 'Minhoca'],
    plants: ['Raizes', 'Terra', 'Cogumelos'],
    offerings: {
      primary: ['Terra', 'Raiz de mandacaru', 'Vela marrom', 'Cogumelo'],
      secondary: ['Folhas secas', 'Cinzas', 'Sangue'],
      forbidden: ['Flor fresca', 'Água clara', 'Luz forte']
    },
    chants: ['Ika lo bo!', 'Oke o ma je!', 'Ara n ru'],
    symbols: {
      key: 'Odu da terra e da decomposição',
      ikin: 'Dez Ikins',
      divination: 'Revela doenças e sua cura',
      alter: 'Caverna subterrânea',
      connection: 'Guarda o poder de transformação da matéria'
    },
    mythology: {
      origin: 'Ika nasceu quando a primeira coisa morreu e se transformou em terra fértil',
      story: 'Ika é o Odu que governa a transformação da matéria. Este Odu traz a mensagem de que da morte nasce vida.',
      teaching: 'A decomposição é apenas transformação em outra forma de existência.'
    },
    spiritualLesson: 'Aceitar a mortalidade é aceitar o ciclo completo da vida',
    affirmation: 'Eu abraço a transformação em todas as suas formas, confiando no ciclo sagrado da vida',
    meditation: 'Visualize uma semente se decompondo na terra para dar vida a uma nova árvore',
    rituals: [
      {
        name: 'Itutu Ika',
        description: 'Ritual de transformação e cura',
        timing: 'Quarta-feira à meia-noite',
        steps: [
          'Coloque terra no centro do altar',
          'Acenda velas marrons',
          'Recite o poema de Ika',
          'Plante algo que represente renascimento',
          'Peça transformação do que precisa mudar',
          'Cubra com mais terra e aguarde'
        ]
      }
    ],
    nature: 'Ika e o principio da terra e da decomposicao. Ele governa a transformacao da materia. Este Odu traz a mensagem de que da morte nasce vida e que a decomposicao e apenas transformacao.',
    meaning: 'Ika fala sobre doença, fermentação, decomposição, eczemas, feridas abertas. Sua mensagem principal e que da morte nasce vida e que a transformacao e inevitavel.',
    eshemus: ['Ika', 'Olodumare', 'Omolu', 'Oba'],
    awose: ['Doenca', 'Fermentacao', 'Decomposicao', 'Eczema', 'Ferida']
  },
  {
    id: 'ikate',
    name: 'Ikate',
    nameYoruba: 'Ikate',
    namePortuguese: 'Senhor da Caça e do Mato',
    path: 'Odu',
    element: 'Terra e Floresta',
    colors: ['#006400', '#228B22', '#8B4513'],
    dayOfWeek: 'Terça-feira',
    numbersSacred: [8, 16],
    greeting: 'Ek Ikate!',
    archetype: 'O Caçador do Reino',
    qualities: ['Caça', 'Mato', 'Sabedoria selvagem', 'Força física', 'Persistência', 'Determinação'],
    challenges: ['Crueldade', 'Impaciência', 'Dependência'],
    rulingPlanet: 'Terra',
    sacredAnimals: ['Cachorro', 'Veado', 'Porco-do-mato'],
    plants: ['Frutas do mato', 'Raízes comestíveis', 'Mandioca'],
    offerings: {
      primary: ['Cachorro', 'Pé de galho', 'Vela verde', 'Mel'],
      secondary: ['Milho', 'Amendoim', 'Frutas silvestres'],
      forbidden: ['Água corrente', 'Sal', 'Fumo forte']
    },
    chants: ['Ikate ni o!', 'Ose ti nko!', 'Ara o ri'],
    symbols: {
      key: 'Odu da caça e da mata',
      ikin: 'Oito Ikins',
      divination: 'Revela perseguição e fuga',
      alter: 'Choupana do caçador',
      connection: 'Guarda a sabedoria da floresta'
    },
    mythology: {
      origin: 'Ikate nasceu quando Osunmo se tornou o primeiro caçador',
      story: 'Ikate é o Odu que governa a caça e a mata. Este Odu traz a mensagem de que a sabedoria está no mato, não apenas na cidade.',
      teaching: 'O caçador que conhece a presa também conhece a si mesmo.'
    },
    spiritualLesson: 'Buscar a sobrevivência é buscar a verdade mais básica da existência',
    affirmation: 'Eu possuo a sabedoria selvagem para caçar meus objetivos e alcançar minha presa',
    meditation: 'Sinta os passos do caçador atravessando a floresta em busca de seu destino',
    rituals: [
      {
        name: 'Itutu Ikate',
        description: 'Ritual para abrir caminhos de sucesso na caça',
        timing: 'Terça-feira ao amanhecer',
        steps: [
          'Vá para local com mato ou área verde',
          'Coloque mel como isca',
          'Acenda velas verdes',
          'Recite o poema de Ikate',
          'Peça sabedoria para caçar seus objetivos',
          'Agradeça pela conexão com a natureza'
        ]
      }
    ],
    nature: 'Ikate e o principio da caca e da mata. Ele governa o mato e a floresta. Este Odu traz a mensagem de que a sabedoria selvagem e tao valida quanto a sabedoria urbana.',
    meaning: 'Ikate fala sobre caça, mato, perseguição, fuga, discussão, trabalho duro. Sua mensagem principal e que a persistencia e a chave para o sucesso.',
    eshemus: ['Ikate', 'Ogun', 'Olodumare', 'Osunmo'],
    awose: ['Caca', 'Mato', 'Perseguicao', 'Fuga', 'Discussao']
  },
  {
    id: 'irosun',
    name: 'Irosun',
    nameYoruba: 'Irosun',
    namePortuguese: 'Senhor das Objeções e das Críticas',
    path: 'Odu',
    element: 'Crítica e Reflexão',
    colors: ['#9400D3', '#FFD700', '#4B0082'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [12, 24],
    greeting: 'E irosun!',
    archetype: 'O Crítico Sagrado',
    qualities: ['Crítica', 'Objeção', 'Reflexão', 'Autoconhecimento', 'Correção', 'Discernimento'],
    challenges: ['Autocrítica excessiva', 'Juízo', 'Perfeccionismo'],
    rulingPlanet: 'Netuno',
    sacredAnimals: ['Papagaio', 'Coruja'],
    plants: ['Colher', 'Pau de araruta', 'Gengibre'],
    offerings: {
      primary: ['Pimenta', 'Colher de pau', 'Vela roxa', 'Mel'],
      secondary: ['Gengibre', 'Amendoim torrado', 'Farinha'],
      forbidden: ['Críticas feitas em voz alta', 'Conflito direto']
    },
    chants: ['Irosun o!', 'Ewo l\'o ri!', 'A ki pa lo'],
    symbols: {
      key: 'Odu das objeções e da autocrítica',
      ikin: 'Doze Ikins',
      divination: 'Revela o que precisa ser corrigido',
      alter: 'Sala de julgamento interior',
      connection: 'Guarda o poder de transformação através da crítica'
    },
    mythology: {
      origin: 'Irosun nasceu quando o primeiro ser olhou para si mesmo e viu suas falhas',
      story: 'Irosun é o Odu que traz críticas e objeções. Este Odu aparece para corrigir o caminho antes que o erro seja cometido.',
      teaching: 'A crítica externa é a oportunidade de autocrítica e crescimento.'
    },
    spiritualLesson: 'Aceitar críticas é aceitar a oportunidade de melhorar',
    affirmation: 'Eu aceito a crítica sagrada como ferramenta de crescimento e evolução',
    meditation: 'Visualize um espelho mostrando suas qualidades e falhas com igual clareza',
    rituals: [
      {
        name: 'Itutu Irosun',
        description: 'Ritual de autocrítica e correção',
        timing: 'Quarta-feira à noite',
        steps: [
          'Sente-se diante de uma vela roxa',
          'Coloque colher de pau como símbolo',
          'Recite o poema de Irosun',
          'Identifique três coisas a melhorar',
          'Escreva suas falhas sem julgamento',
          'Queime o papel e espalhe as cinzas'
        ]
      }
    ],
    nature: 'Irosun e o principio da critica e da reflexao. Ele governa as objecoes e a autocrítica. Este Odu traz a mensagem de que a critica e uma ferramenta de crescimento, nao de destruicao.',
    meaning: 'Irosun fala sobre objeções, crítica, correção, discussão. Sua mensagem principal e que aceitar a critica e o primeiro passo para a melhoria.',
    eshemus: ['Irosun', 'Olodumare', 'Orunmila', 'Eshu'],
    awose: ['Objecao', 'Critica', 'Correcao', 'Discussao']
  },
  {
    id: 'owonrin-meji',
    name: 'Owonrin Meji',
    nameYoruba: 'Owonrin Meji',
    namePortuguese: 'Senhor das Tempestades Duplas',
    path: 'Odu',
    element: 'Vento e Fogo Duplos',
    colors: ['#4169E1', '#FF0000', '#000000', '#FFD700'],
    dayOfWeek: 'Domingo',
    numbersSacred: [8, 16, 24],
    greeting: 'E owonrin-o!',
    archetype: 'O senhor das Conflagrações',
    qualities: ['Tempestade dupla', 'Fogo', 'Destruição e regeneração', 'Ciclone', 'Mutação', 'Revolução'],
    challenges: ['Destruição sem propósito', 'Caos', 'Perda de controle'],
    rulingPlanet: 'Marte e Urano',
    sacredAnimals: ['Trovão', 'Fogo'],
    plants: ['Palmeira queimada', 'Cipó torrado'],
    offerings: {
      primary: ['Dois galos', 'Fumo', 'Velas azul e vermelha', 'Pimenta dupla'],
      secondary: ['Café forte', 'Alcool', 'Raiz de mandacaru'],
      forbidden: ['Água', 'Pedra', 'Frio']
    },
    chants: ['Owonrin Meji!', 'Ojo ti nko!', 'Aja o ma je'],
    symbols: {
      key: 'Odu das tempestades e destruições',
      ikin: 'Oito Ikins',
      divination: 'Revela forças destruidoras e regeneradoras',
      alter: 'Templo da fúria',
      connection: 'Abre caminho para renovação completa'
    },
    mythology: {
      origin: 'Owonrin Meji nasceu quando dois raios caíram ao mesmo tempo criando o primeiro incêndio',
      story: 'Owonrin Meji é o Odu das tempestades duplas. Este Odu traz a mensagem de que algumas mudanças exigem destruição completa antes da regeneração.',
      teaching: 'O fogo que destrói também purifica e prepara para nova criação.'
    },
    spiritualLesson: 'Às vezes, destruir para reconstruir é o caminho mais sagrado',
    affirmation: 'Eu permito que a tempestade passe, sabendo que ela abre espaço para nova vida',
    meditation: 'Visualize uma floresta após um incêndio - cinzas que preparam para novo florescimento',
    rituals: [
      {
        name: 'Itutu Owonrin Meji',
        description: 'Ritual de renovação através da destruição',
        timing: 'Domingo à noite durante tempestade',
        steps: [
          'Observe a tempestade com respeito',
          'Coloque duas velas - azul e vermelha',
          'Recite o poema de Owonrin Meji',
          'Identifique o que precisa ser destruído',
          'Libere mentalmente o que não serve',
          'Agradeça pela tempestade que purifica'
        ]
      }
    ],
    nature: 'Owonrin Meji e o principio da tempestade. Ele governa o fogo e a destruicao. Este Odu traz a mensagem de que algumas transformacoes exigem destruicao completa antes da regeneracao.',
    meaning: 'Owonrin Meji fala sobre tempestade, fogo, olho, corrimento, conflagração, revolução. Sua mensagem principal e que a destruicao e por vezes necessaria para a renovacao.',
    eshemus: ['Owonrin', 'Iansa', 'Olodumare', 'Shango'],
    awose: ['Tempestade', 'Fogo', 'Olho', 'Corrimento', 'Conflagração']
  },
  {
    id: 'merin',
    name: 'Merin',
    nameYoruba: 'Merin',
    namePortuguese: 'Senhor das Coisas Estranhas',
    path: 'Odu',
    element: 'Mistério e Estranhhez',
    colors: ['#9400D3', '#8B0000', '#FFD700'],
    dayOfWeek: 'Quinta-feira',
    numbersSacred: [14, 28],
    greeting: 'E merin!',
    archetype: 'O senhor do Estranho',
    qualities: ['Estranhhez', 'Mistério', 'Peculiaridade', 'Força incomum', 'Ocultismo', 'Transformação'],
    challenges: ['Isolamento', 'Excentricidade', 'Incompreensão'],
    rulingPlanet: 'Netuno e Plutão',
    sacredAnimals: ['Coisa estranha', 'Ninguém sabe'],
    plants: ['Planta que ninguém conhece', 'Cogumelo desconhecido'],
    offerings: {
      primary: ['Fumo', 'Mel', 'Vela roxa', 'Cogumelo'],
      secondary: ['Coisas estranhas', 'O que não pode ser definido'],
      forbidden: ['Explicações claras', 'Razão comum']
    },
    chants: ['Merin o!', 'Aja o ma je!', 'Ewo l\'o ri'],
    symbols: {
      key: 'Odu das coisas estranhas e inexplicáveis',
      ikin: 'Quatorze Ikins',
      divination: 'Revela fenômenos inexplicáveis',
      alter: 'Santuário do Mistério',
      connection: 'Guarda os segredos que não podem ser ditos'
    },
    mythology: {
      origin: 'Merin nasceu quando Olodumare criou algo que nem ele compreendeu completamente',
      story: 'Merin é o Odu das coisas estranhas. Este Odu traz mensagens que não podem ser explicadas pela lógica comum.',
      teaching: 'Há coisas além da compreensão humana que são sagradas por sua inexplicabilidade.'
    },
    spiritualLesson: 'O mistério é a porta para o conhecimento que transcende a mente',
    affirmation: 'Eu abraço o mistério e confio no que não posso explicar',
    meditation: 'Sente-se em silêncio sem tentar entender nada - apenas exista no mistério',
    rituals: [
      {
        name: 'Itutu Merin',
        description: 'Ritual para navegar o inexplicável',
        timing: 'Quinta-feira à meia-noite',
        steps: [
          'Vá para lugar onde ninguém vai',
          'Coloque coisas que não entende',
          'Acenda velas roxas',
          'Recite o poema de Merin',
          'Peça compreensão para o inexplicável',
          'Não tente explicar nada depois'
        ]
      }
    ],
    nature: 'Merin e o principio do misterio. Ele governa as coisas estranhas e inexplicaveis. Este Odu traz a mensagem de que ha coisas alem da compreensao que sao sagradas.',
    meaning: 'Merin fala sobre coisas estranhas, explicação impossível, mistério, força incomum. Sua mensagem principal e que nem tudo pode ser explicado e que isso esta bem.',
    eshemus: ['Merin', 'Olodumare', 'Aja', 'Eshu'],
    awose: ['Coisa estranha', 'Explicacao impossivel', 'Mistério', 'Forca']
  },
  {
    id: 'kunle',
    name: 'Kunle',
    nameYoruba: 'Kunle',
    namePortuguese: 'Senhor dos Nomes e da Mensagem',
    path: 'Odu',
    element: 'Palavra e Mensagem',
    colors: ['#FFD700', '#FFFFFF', '#87CEEB'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [15, 30],
    greeting: 'E kunle!',
    archetype: 'O Portador da Palavra',
    qualities: ['Nome', 'Mensagem', 'Palavra sagrada', 'Comunicação', 'Profecia', 'Designação'],
    challenges: ['Fofoca', 'Mentira', 'Abuso de palavras'],
    rulingPlanet: 'Mercúrio',
    sacredAnimals: ['Papagaio', 'Arara'],
    plants: ['Papoula', 'Pluma', 'Palha'],
    offerings: {
      primary: ['Fumo', 'Mel', 'Vela dourada', 'Papagaio'],
      secondary: ['Flores brancas', 'Frutas', 'Farinha'],
      forbidden: ['Palavras cruzadas', 'Mentira']
    },
    chants: ['Kunle ni o!', 'Oro ti nko!', 'A ki fa'],
    symbols: {
      key: 'Odu dos nomes e das mensagens sagradas',
      ikin: 'Quinze Ikins',
      divination: 'Revela mensagens e nomes divinos',
      alter: 'Púlpito de Ifá',
      connection: 'Guarda o poder das palavras'
    },
    mythology: {
      origin: 'Kunle nasceu quando Olodumare decidiu dar nomes a todas as coisas',
      story: 'Kunle é o Odu dos nomes e das mensagens. Este Odu traz a palavra sagrada que nomeia e designa.',
      teaching: 'A palavra dada cria a realidade - por isso, escolha bem suas palavras.'
    },
    spiritualLesson: 'Suas palavras têm poder criativo - use-as com sabedoria e intenção',
    affirmation: 'Eu escolho minhas palavras com cuidado, sabendo que elas têm o poder de criar realidade',
    meditation: 'Visualize cada palavra que você pronuncia como uma semente que germina no universo',
    rituals: [
      {
        name: 'Itutu Kunle',
        description: 'Ritual para nomear e designar',
        timing: 'Quarta-feira ao amanhecer',
        steps: [
          'Sente-se em silêncio antes de falar',
          'Coloque mel no centro',
          'Acenda velas douradas',
          'Recite o poema de Kunle',
          'Nomeie suas intenções claramente',
          'Sele suas palavras com mel'
        ]
      }
    ],
    nature: 'Kunle e o principio da palavra e da mensagem. Ele governa os nomes e a comunicacao. Este Odu traz a mensagem de que a palavra tem poder de criar realidade.',
    meaning: 'Kunle fala sobre nome, palavra, mensagem, discussão, fofoca, papagaio, arara. Sua mensagem principal e que suas palavras tem poder criativo.',
    eshemus: ['Kunle', 'Olodumare', 'Orunmila', 'Eshu'],
    awose: ['Nome', 'Palavra', 'Mensagem', 'Discussao', 'Fofoca']
  }
];

export function getData(): OduData[] {
  return ODU_DATA;
}

function getDataById(id: string): OduData | undefined {
  return ODU_DATA.find((o) => o.id === id);
}

function searchData(query: string): OduData[] {
  const lowerQuery = query.toLowerCase();
  return ODU_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(lowerQuery) ||
      o.nameYoruba.toLowerCase().includes(lowerQuery) ||
      o.namePortuguese.toLowerCase().includes(lowerQuery) ||
      o.element.toLowerCase().includes(lowerQuery) ||
      o.archetype.toLowerCase().includes(lowerQuery) ||
      o.qualities.some((q) => q.toLowerCase().includes(lowerQuery)) ||
      o.awose.some((a) => a.toLowerCase().includes(lowerQuery)) ||
      o.nature.toLowerCase().includes(lowerQuery)
  );
}

function getOduByDay(day: string): OduData[] {
  return ODU_DATA.filter((o) => o.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

function getOduByElement(element: string): OduData[] {
  return ODU_DATA.filter((o) => o.element.toLowerCase().includes(element.toLowerCase()));
}

function getOduByPlanet(planet: string): OduData[] {
  return ODU_DATA.filter((o) => o.rulingPlanet.toLowerCase().includes(planet.toLowerCase()));
}

function getOduByNumber(num: number): OduData[] {
  return ODU_DATA.filter((o) => o.numbersSacred.includes(num));
}

function getEshemu(oduId: string): string[] {
  const odu = getDataById(oduId);
  return odu ? odu.eshemus : [];
}

function getAwose(oduId: string): string[] {
  const odu = getDataById(oduId);
  return odu ? odu.awose : [];
}

function getRituals(oduId: string): OduRitual[] {
  const odu = getDataById(oduId);
  return odu ? odu.rituals : [];
}

function getOfferings(oduId: string): OduOfferings | undefined {
  const odu = getDataById(oduId);
  return odu ? odu.offerings : undefined;
}