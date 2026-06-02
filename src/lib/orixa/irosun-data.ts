/* prettier-ignore */
// @ts-nocheck
// SKIP_LINT

/**
 * Irosun Data Module
 * Spiritual data for Irosun - Odu of Objections, Criticism, and Self-reflection
 */

export interface IrosunData {
  id: string;
  name: string;
  nameYoruba: string;
  namePortuguese: string;
  definition: string;
  archetype: string;
  element: string;
  colors: string[];
  dayOfWeek: string;
  numbersSacred: number[];
  greeting: string;
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
  herbs: HerbData[];
  healingPractices: string[];
  sacredTrees: string[];
  ritualPractices: RitualData[];
}

export interface HerbData {
  name: string;
  namePortuguese: string;
  uses: string[];
  preparation: string;
  contraindications: string[];
  element: string;
}

export interface RitualData {
  type: string;
  description: string;
  duration: string;
  offerings: string[];
  steps: string[];
}

const IROSUN_DATA: IrosunData = {
  id: 'irosun',
  name: 'Irosun',
  nameYoruba: 'Irosun',
  namePortuguese: 'Senhor das Objeções e das Críticas',
  definition: 'Irosun é o Odu que representa a crítica, a objeção, a autocrítica e a correção. Traz a sabedoria da reflexão e do discernimento, permitindo que o consulente identifique erros e corrija seu caminho espiritual. É através de Irosun que aprendemos que a crítica, quando aceita com humildade, torna-se ferramenta de crescimento.',
  archetype: 'O Crítico Sagrado',
  element: 'Crítica e Reflexão',
  colors: ['Preto', 'Vermelho', 'Branco'],
  dayOfWeek: 'Quarta-feira',
  numbersSacred: [12, 24],
  greeting: 'E irosun!',
  qualities: [
    'Crítica sagrada',
    'Objeção construtiva',
    'Reflexão interior',
    'Autoconhecimento',
    'Correção espiritual',
    'Discernimento',
    'Humildade',
    'Capacidade de ouvir',
    'Sabedoria corretiva',
    'Abertura à melhoria'
  ],
  challenges: [
    'Autocrítica excessiva',
    'Juízo severo',
    'Perfeccionismo',
    'Dificuldade em aceitar erros',
    'Tendencia à autocompaixão negativa',
    'Ressentimento'
  ],
  rulingPlanet: 'Saturno',
  sacredAnimals: ['Coruja', 'Raposa', 'Cobra'],
  plants: ['Alfa', 'Ewu', 'Opoto'],
  offerings: [
    'Água de obô',
    'Farinha de roça',
    'Duas galinhas pretas',
    'Akokê',
    'Colher de pau',
    'Velas pretas e vermelhas'
  ],
  chants: [
    'Irosun o!',
    'Ewo l\'o ri!',
    'A ki pa lo',
    'Irosun ki o fi oju pada',
    'A ki n fi oju ko ewu'
  ],
  symbols: [
    'Odu das objeções',
    'Doze Ikins',
    'Pá de madeira',
    'Cobra enrolada',
    'Alfa sagrado'
  ],
  mythology: 'Irosun nasceu quando o primeiro ser olhou para si mesmo e viu suas falhas. Este Odu surgiu para ensinar que a crítica externa é na verdade a oportunidade de autocrítica e crescimento espiritual. Irosun é o guardião do espelho interior, mostrando-nos onde precisamos mudar.',
  spiritualLesson: 'Aceitar críticas é aceitar a oportunidade de melhorar. A humildade de reconhecer nossos erros é o primeiro passo para a transformação espiritual.',
  affirmation: 'Aceito a crítica com humildade e vejo nela uma oportunidade de crescimento. Minha capacidade de ouvir e corrigir meu caminho fortalece minha espiritualidade.',
  meditation: 'Sento em silêncio e peço a Irosun que me mostre onde preciso melhorar. Observo meus pensamentos sem julgamento, aceitando tanto minhas qualidades quanto minhas falhas. Reconheço que a crítica, quando vinda de fontes espirituais, é um presente de correção.',
  herbs: [
    {
      name: 'Alfa',
      namePortuguese: 'Alfa',
      uses: ['Purificação espiritual', 'Proteção contra críticas negativas', 'Limpeza de energies densas'],
      preparation: 'Ferver folhas em água e tomar banho de infusion',
      contraindications: ['Não usar em jejum', 'Não misturar com álcool'],
      element: 'Terra'
    },
    {
      name: 'Ewu',
      namePortuguese: 'Ewu',
      uses: ['Correção de caminhos errados', 'Ritual de autocrítica', 'Fortificação espiritual'],
      preparation: 'Triturar e misturar com farinha de roça para ebó',
      contraindications: ['Gestantes não devem manusear', 'Não usar em locais abertos à noite'],
      element: 'Fogo'
    },
    {
      name: 'Opoto',
      namePortuguese: 'Opoto',
      uses: ['Amaciação de críticas recebidas', 'Harmonização de ambientes tensos', 'Proteção de Ori'],
      preparation: 'Decocção das raízes para banhos e limpeza ritual',
      contraindications: ['Não combinar com alfa na mesma preparação'],
      element: 'Água'
    }
  ],
  healingPractices: [
    'Ritual de autocrítica semanal',
    'Meditação sobre falhas aceitas',
    'Banho de purificação com alfa',
    'Escrita de diário de melhorias',
    'Oração de humildade antes do sono',
    'Jejum de palavras negativas',
    'Prática de escuta ativa'
  ],
  sacredTrees: ['Alfa', 'Ogu', 'Oro'],
  ritualPractices: [
    {
      type: 'Itutu Irosun',
      description: 'Ritual de autocrítica e correção - prática profunda de reflexão sobre erros e falhas',
      duration: 'Quarta-feira à noite, 1-2 horas',
      offerings: ['Água de obô', 'Farinha de roça', 'Colher de pau', 'Velas pretas'],
      steps: [
        'Prepare o espaço com limpeza de alfa',
        'Acenda velas pretas nos cantos do cômodo',
        'Coloque colher de pau como símbolo de Irosun',
        'Recite o poema de Irosun: "Irosun o!"',
        'Identifique três coisas a melhorar em sua vida',
        'Escreva suas falhas sem julgamento ou autocompaixão',
        'Queime o papel e espalhe as cinzas ao vento',
        'Agradeça a Irosun pela correção recebida',
        'Descanse em silêncio aceitando a crítica sagrada'
      ]
    },
    {
      type: 'Ritual de Oposição',
      description: 'Ritual para lidar com críticas externas e transformá-las em crescimento',
      duration: 'Quando receber crítica significativa, 30 minutos',
      offerings: ['Água fresca', 'Vela branca', 'Inhame assado'],
      steps: [
        'Ao receber crítica, respire fundo e não reaja imediatamente',
        'Observe a crítica sem julgamento por três minutos',
        'Identifique se há verdade na crítica',
        'Se houver verdade, aceite-a e comprometa-se a melhorar',
        'Se não houver verdade, agradeça pela oportunidade de examinar-se',
        'Queime uma vela branca como símbolo de aceitação',
        'Recite: "Aceito a correção, rejeito a destruição"'
      ]
    },
    {
      type: 'Ritual do Espelho',
      description: 'Prática de olhar para si mesmo com honestidade e humildade',
      duration: 'Diário, 15 minutos pela manhã',
      offerings: ['Espelho pequeno', 'Vela branca', 'Água de obô'],
      steps: [
        'Acenda uma vela branca diante de um espelho',
        'Olhe para seu reflexo e identifique três качества positives',
        'Identifique três áreas de melhoria sem autocrítica severa',
        'Coloque água de obô nos olhos como simbolo de visão clara',
        'Recite: "Irosun, mostra-me meus erros com olhos de crescimento"',
        'Agradeça e feche a prática'
      ]
    },
    {
      type: 'Ebó de Correção',
      description: 'Oferta para Irosun pedindo orientação na correção de caminhos',
      duration: 'Sábados alternados, 2 horas',
      offerings: ['Duas galinhas pretas', 'Farinha de roça', 'Akokê', 'Dinheiro para os pobres', 'Colher de pau'],
      steps: [
        'Prepare as gallinhas com cantos apropriados',
        'Coloque farinha de roça como base do ebó',
        'Adicione akokê e colher de pau como símbolos de Irosun',
        'Recite as orações de Irosun pedindo correção',
        'Distribua comida aos necessitados como parte da oferenda',
        'Enterre as gallinhas em local sagrado de Irosun',
        'Agradeça a Olodumare pela oportunidade de correção'
      ]
    }
  ]
};

export function getData(): IrosunData {
  return IROSUN_DATA;
}

function getDataById(id: string): IrosunData | undefined {
  return id === 'irosun' ? IROSUN_DATA : undefined;
}

function getHerbs(): HerbData[] {
  return IROSUN_DATA.herbs;
}

function getRituals(): RitualData[] {
  return IROSUN_DATA.ritualPractices;
}

function getHealingPractices(): string[] {
  return IROSUN_DATA.healingPractices;
}

function getSacredTrees(): string[] {
  return IROSUN_DATA.sacredTrees;
}

function getIrosunByElement(element: string): IrosunData | undefined {
  return IROSUN_DATA.element.toLowerCase().includes(element.toLowerCase()) ? IROSUN_DATA : undefined;
}

function getIrosunByPlanet(planet: string): IrosunData | undefined {
  return IROSUN_DATA.rulingPlanet.toLowerCase().includes(planet.toLowerCase()) ? IROSUN_DATA : undefined;
}

export default {
  getData,
  getDataById,
  getHerbs,
  getRituals,
  getHealingPractices,
  getSacredTrees,
  getIrosunByElement,
  getIrosunByPlanet
};