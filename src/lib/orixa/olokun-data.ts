/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
// SKIP_LINT

/**
 * Olokun Data Module
 * Spiritual data for Olokun, the Orixá of the seas, wealth and deep mysteries
 */

export interface OlokunData {
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
  depths: DepthData;
  wealth: WealthData;
  mysteries: MysteryData;
  ritualPractices: RitualData[];
}

export interface DepthData {
  meaning: string;
  aspects: string[];
  practices: string[];
  guidance: string;
}

export interface WealthData {
  definition: string;
  types: string[];
  principles: string[];
  guidance: string;
}

export interface MysteryData {
  definition: string;
  revelations: string[];
  forbiddenKnowledge: string[];
  guidance: string;
}

export interface RitualData {
  name: string;
  description: string;
  frequency: string;
  purpose: string;
}

const OLOKUN_DATA: OlokunData = {
  id: 'olokun',
  name: 'Olokun',
  namePortuguese: 'Senhor das Profundezas',
  path: 'Ori',
  element: 'Água',
  colors: ['#000080', '#4169E1', '#008B8B', '#1E90FF', '#000033'],
  dayOfWeek: 'Sábado',
  numbersSacred: [7, 14, 21, 49],
  greeting: 'Eshu Olokun!',
  archetype: 'O Guardião dos Abismos',
  qualities: [
    'Profundidade',
    'Mistério',
    'Abundância',
    'Sabedoria oculta',
    'Transformação',
    'Intuição',
    'Conhecimento proibido',
    'Poder ancestral'
  ],
  challenges: ['Segredos pesados', 'Temptação do poder', 'Medo do desconhecido', 'Solidão nas profundezas'],
  rulingPlanet: 'Netuno',
  sacredAnimals: ['Peixe abissal', 'Polvo', 'Baleia', 'Cavalo-marinho', 'Tubarão'],
  plants: ['Algodão-marinho', 'Cabelo-de-mar', 'Sargaço', 'Plantas abissais'],
  offerings: [
    'Água do mar',
    'Pepitas de ouro',
    'Joias',
    'Pérolas',
    'Pão fresco',
    'Vinho',
    'Ovo cozido',
    'Fumo',
    'Perfume de alfazema'
  ],
  chants: [
    'Olokun Orô',
    'Senhor das profundezas',
    'Guia-me no abismo',
    'Riqueza do fundo do mar',
    'Mistério revelado'
  ],
  symbols: [
    'Ondas',
    'Âncora',
    'Concha',
    'Pérola',
    'Espiral',
    'Cofre do tesouro',
    'Olho que tudo vê'
  ],
  mythology:
    'Olokun é o orixá que habita as profundezas do oceano, guardando os tesouros ocultos e os segredos mais antigos do mundo. É considerado o source de toda riqueza e conhecimento oculto. Olokun vê o que está submerso, conhece o que foi esquecido e revela o que foi escondido. Rei do mundo subaquático, sua essência representa tanto a abundância infinita quanto os perigos do abyssal.',
  spiritualLesson:
    'A verdadeira sabedoria vem das profundezas. Assim como o oceano guarda seus tesouros nas células mais obscuras, a verdadeira riqueza espiritual está nos recessos mais profundos da alma. A busca pelo conhecimento verdadeiro exige coragem para descer ao abismo.',
  affirmation:
    'Eu mergulho nas profundezas do meu ser com coragem e descubro os tesouros ocultos da minha alma',
  meditation:
    'Visualize-se descendo suavemente pelas águas cristalinas do oceano interior. A cada profundidade, descubra uma nova camada de sabedoria. Permita que Olokun ilumine os cantos mais escuros da sua psique, revelando tesouros de autoconhecimento.',
  depths: {
    meaning:
      'Olokun ensina que as profundezas são o source de toda verdadeira compreensão. Os mares interiores — nossos sentimentos mais profundos, nossas memórias enterradas, nossos medos ocultos — são os territórios onde a verdadeira transformação acontece.',
    aspects: [
      'O inconsciente como oceano interior',
      'As águas primordiais da criação',
      'O abismo onde a alma se renova',
      'A profundidade do olhar interior',
      'O silêncio das grandes profundidades',
      'A pressão que transforma carbono em diamante'
    ],
    practices: [
      'Meditar sobre a imensidão do próprio ser',
      'Explorar sonhos e visões como janelas do abismo',
      'Mergulhar emocionalmente nas experiências significativas',
      'Estudar simbolismo e mitologia antiga',
      'Praticar silêncio e recolhimento profundo',
      'Explorar os limites do conhecimento'
    ],
    guidance:
      'Não tema as profundezas do seu próprio ser. Cada camada de escuridão que você enfrentar traz consigo um tesouro de sabedoria. Olokun aguarda pacientemente nos recessos mais profundos para revelar os segredos que transformarão sua compreensão de si mesmo e do universo.'
  },
  wealth: {
    definition:
      'Para Olokun, a verdadeira riqueza transcende o dinheiro e abarca todo tipo de abundância: sabedoria, saúde, conexões, experiências, e a capacidade de manifestar o que a alma deseja. É o fluxo natural do universo que se acumula nos espaços mais profundos.',
    types: [
      'Riqueza material — ouro, joias, tesouros escondidos',
      'Riqueza espiritual — conhecimento oculto e sabedoria antiga',
      'Riqueza emocional — profundidade de sentimentos e conexões',
      'Riqueza intelectual — compreensão dos mistérios do universo',
      'Riqueza relacional — alinhamento com ancestrais e orixás',
      'Riqueza criativa — capacidade de manifestar realidades'
    ],
    principles: [
      'A riqueza flui para quem sabe recebê-la com gratidão',
      'Tesouros verdadeiros estão além das superfícies visíveis',
      'O overflow vem da conexão com as profundezas',
      'Generosidade atrai riqueza; avareza a afasta',
      'A riqueza verdadeira não pode ser roubada ou perdida',
      'O fluxo constante é mais saudável que a acumulação',
      'Riqueza sem sabedoria é perigo'
    ],
    guidance:
      'Olokun não oferece riqueza fácil — oferece a compreensão profunda de como a abundância funciona. Quando você se alinha com as correntes profundas do universo, a riqueza flui naturalmente. Mas lembre-se: os tesouros mais valiosos não estão nas prateleiras expostas, mas nos cantos mais escuros do oceano.'
  },
  mysteries: {
    definition:
      'Olokun guarda os mistérios que não podem ser ensinados, apenas descobertos. É o keeper do conhecimento proibido — verdades que perturbam, revelações que transformam, segredos que expandem a consciência além dos limites comuns.',
    revelations: [
      'A natureza do tempo e da eternidade',
      'Os códigos que governam a realidade',
      'O funcionamento da alma e sua jornada',
      'As conexões entre todos os seres vivos',
      'Os segredos da vida e da morte',
      'A estrutura oculta por trás da manifestação'
    ],
    forbiddenKnowledge: [
      'O nome verdadeiro dos seres primordiais',
      'Os caminhos para além da morte',
      'As forças que movem o universo',
      'Os segredos dos ancestrais',
      'Os pactos antigos entre dimensões',
      'O conhecimento que pode destruir ou libertar'
    ],
    guidance:
      'Os mistérios de Olokun não são para os fracos de coração ou os curiosos superficiais. Eles exigem preparação, intenção pura e responsabilidade. Antes de buscar o conhecimento oculto, pergunte-se: você está pronto para ser transformado pelo que descobrir? Porque uma vez que Olokun revela um segredo, não há como voltar ao estado anterior.'
  },
  ritualPractices: [
    {
      name: 'Mergulho no Oceano Interior',
      description:
        'Ritual de imersão emocional usando água do mar ou água abençoada para realizar uma jornada interior de autoconhecimento, descendo às profundezas do inconsciente para descobrir tesouros ocultos.',
      frequency: 'Mensalmente, preferencialmente na lua cheia',
      purpose: 'Explorar o inconsciente, revelar conteúdos ocultos, purificar camadas profundas da alma'
    },
    {
      name: 'Oferecimento aos Abismos',
      description:
        'Cerimônia de ofereceção de riquezas (mesmo que simbólicas) ao mar ou a um corpo de água, pedindo a Olokun que guarde nossas oferendas e abençoe nossa busca por abundância.',
      frequency: 'Anualmente no equinócio ou em datas significativas',
      purpose: 'Honrar Olokun, abrir canais de prosperidade, submeter ego aos poderes do abismo'
    },
    {
      name: 'Vigília do Tesouro Oculto',
      description:
        'Prática de meditação profunda na beira da água (mar, rio, lago) onde o praticante busca através de rituais e mantras específicos revelar os tesouros ocultos da sua própria alma.',
      frequency: 'Semanalmente ou em momentos de necessidade de insight',
      purpose: 'Receber revelações, acessar sabedoria oculta, encontrar respostas escondidas no abismo interior'
    },
    {
      name: 'Ritual das Pérolas',
      description:
        'Cerimônia que usa pérolas ou objetos esféricos representando a sabedoria cultivada nas profundezas. Inclui orações, cânticos e ofertas de perfume, symbolizando a transformação da areia em tesouro.',
      frequency: 'Anualmente ou em celebrações de Olokun',
      purpose: 'Cultivar gratidão pela sabedoria recebida, honrar o processo de transformação, fortalecer a conexão com Olokun'
    }
  ]
};

export function getData(): OlokunData {
  return OLOKUN_DATA;
}

export function getDataById(id: string): OlokunData | undefined {
  return id === 'olokun' ? OLOKUN_DATA : undefined;
}

export function getDepths(): DepthData {
  return OLOKUN_DATA.depths;
}

export function getWealth(): WealthData {
  return OLOKUN_DATA.wealth;
}

export function getMysteries(): MysteryData {
  return OLOKUN_DATA.mysteries;
}

export function getRituals(): RitualData[] {
  return OLOKUN_DATA.ritualPractices;
}