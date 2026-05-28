// @ts-nocheck
// SKIP_LINT

// Logbara Meji Data — Odu of Abundance and Divine Flow (16 Principal Odu of Obeche/Ifa)
// Logbara represents Oxum Logbará, the orixá of rivers, beauty, love, and golden waters

export interface LogbaraMejiOdu {
  id: string;
  name: string;
  portugueseName: string;
  order: number;
  polarity: 'masculine' | 'feminine';
  element: string;
  planets: string[];
  sephirot: string[];
  sign: string;
  dayOfWeek: string;
  direction: string;
  colors: string[];
  offerings: string[];
  ebos: string[];
  taboos: string[];
  strengths: string[];
  weaknesses: string[];
  health: string[];
  meanings: string[];
  ifaMessage: string;
}

const LOGBARA_MEJI_DATA: LogbaraMejiOdu[] = [
  {
    id: 'logbara',
    name: 'Logbara',
    portugueseName: 'Logbara',
    order: 1,
    polarity: 'feminine',
    element: 'Água e Ouro',
    planets: ['Vênus', 'Lua'],
    sephirot: ['Binah', 'Hod', 'Malkuth'],
    sign: 'Touro',
    dayOfWeek: 'Sábado',
    direction: 'Leste',
    colors: ['Amarelo', 'Dourado', 'Azul claro'],
    offerings: ['Água de colônia', 'Mel', 'Flores amarelas', 'Ovos', 'Banana', 'Vinho doce'],
    ebos: ['Ebó de prosperidade', 'Ebó de abertura de caminhos'],
    taboos: ['Não desperdiçar recursos', 'Não guardar por medo'],
    strengths: ['Abundância', 'Amor próprio', 'Fertilidade'],
    weaknesses: ['Vaidade', 'Ciúmes', 'Manipulação'],
    health: ['Útero', 'Ovários', 'Rins'],
    meanings: ['Riqueza', 'Beleza', 'Amor', 'Fertilidade', 'Águas douradas'],
    ifaMessage: 'Logbara revela que a abundância flui através da feminilidade sagrada, e que a beleza exterior reflete o brilho interior da alma.',
  },
  {
    id: 'logun',
    name: 'Logun',
    portugueseName: 'Logun',
    order: 2,
    polarity: 'masculine',
    element: 'Água e Fogo',
    planets: ['Marte', 'Netuno'],
    sephirot: ['Geburah', 'Tiphareth'],
    sign: 'Escorpião',
    dayOfWeek: 'Quinta-feira',
    direction: 'Oeste',
    colors: ['Azul escuro', 'Vermelho', 'Prata'],
    offerings: ['Mel', 'Farinha de mandioca', 'Ervas aquaticas', 'Kolanut'],
    ebos: ['Ebó de transformação', 'Ebó de equilíbrio'],
    taboos: ['Não resistir às mudanças', 'Não acumular por escassez'],
    strengths: ['Equilíbrio', 'Sabedoria', 'Dualidade'],
    weaknesses: ['Confusão', 'Indecisão'],
    health: ['Sangue', 'Sistema nervoso'],
    meanings: ['União dos opostos', 'Logbara e Logunedê', 'Fluxo e refluxo'],
    ifaMessage: 'Logun ensina que a água e o fogo podem dançar juntos quando há sabedoria, e que a dualidade é a natureza da existência.',
  },
];

export function getData(): LogbaraMejiOdu[] {
  return LOGBARA_MEJI_DATA;
}