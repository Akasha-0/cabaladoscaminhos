// ============================================================
// REIKI DATA API - Cabala Dos Caminhos
// ============================================================
// GET endpoints for Reiki data access
// - Retrieve all reiki information
// - Get specific reiki by ID
// - Filter by category
// - Filter by level
// - Symbols and healing practices
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// ─── INTERFACES ────────────────────────────────────────────────────────────────

interface ReikiSymbol {
  id: number;
  name: string;
  japaneseName: string;
  meaning: string;
  level: number;
  power: string;
  color: string;
  healingFocus: string[];
  activation: string;
  description: string;
}

interface ReikiPractice {
  id: string;
  name: string;
  category: string;
  level: number;
  description: string;
  duration: string;
  benefits: string[];
  steps: string[];
  warnings: string[];
}

interface ReikiCategory {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  level: number;
  practices: number;
}

// ─── REIKI SYMBOLS DATA ────────────────────────────────────────────────────────

const REIKI_SYMBOLS: ReikiSymbol[] = [
  {
    id: 1,
    name: 'Cho Ku Rei',
    japaneseName: 'パワースymbol',
    meaning: 'Power symbol',
    level: 1,
    power: 'energy-amplification',
    color: 'golden',
    healingFocus: ['physical-healing', 'energy-boost', 'protection'],
    activation: 'Draw from center outward in clockwise motion',
    description: 'The power symbol amplifies energy and is used for increasing power, protection, and attracting positive energy.',
  },
  {
    id: 2,
    name: 'Sei He Ki',
    japaneseName: '調和のsymbol',
    meaning: 'Harmony symbol',
    level: 1,
    power: 'mental-emotional',
    color: 'silver-blue',
    healingFocus: ['mental-healing', 'emotional-balance', 'addictions'],
    activation: 'Draw horizontally from left to right three times',
    description: 'The harmony symbol brings mental and emotional balance, useful for clearing negative patterns and healing心理 wounds.',
  },
  {
    id: 3,
    name: 'Hon Sha Ze Sho Nen',
    japaneseName: 'つながりのsymbol',
    meaning: 'Distance symbol',
    level: 2,
    power: 'distance-healing',
    color: 'translucent-white',
    healingFocus: ['distance-healing', 'past-healing', 'future-healing'],
    activation: 'Draw symbol followed by intention and distance symbols',
    description: 'Enables Reiki to be sent across any distance, connecting past, present, and future healing intentions.',
  },
  {
    id: 4,
    name: ' Dai Ko Myo',
    japaneseName: '大光明のsymbol',
    meaning: 'Master symbol',
    level: 3,
    power: 'master-energy',
    color: 'pure-white-gold',
    healingFocus: ['spiritual-awakening', 'master-healing', 'enlightenment'],
    activation: 'Visualize brilliant white light flowing from crown to heart',
    description: 'The master symbol awakens spiritual power and is used for master-level healing attunements and enlightenment practices.',
  },
  {
    id: 5,
    name: 'Raku',
    japaneseName: '落下symbol',
    meaning: 'Fire symbol',
    level: 3,
    power: 'kundalini-activation',
    color: 'fiery-orange',
    healingFocus: ['kundalini-awakening', 'spinal-clearing', 'grounding'],
    activation: 'Draw downward from crown to root in quick motion',
    description: 'The fire symbol activates kundalini energy and helps clear the central channel for spiritual energy flow.',
  },
  {
    id: 6,
    name: 'Shui',
    japaneseName: '水のsymbol',
    meaning: 'Water symbol',
    level: 2,
    power: 'emotional-flow',
    color: 'crystal-blue',
    healingFocus: ['emotional-healing', 'flow-state', 'creativity'],
    activation: 'Draw in flowing water-like motion',
    description: 'Promotes emotional flow and creativity, helping to release stagnant emotional能量.',
  },
  {
    id: 7,
    name: 'Kokai',
    japaneseName: '心を開くsymbol',
    meaning: 'Heart opener symbol',
    level: 1,
    power: 'heart-connection',
    color: 'rose-pink',
    healingFocus: ['heart-healing', 'unconditional-love', 'relationships'],
    activation: 'Draw from heart center outward',
    description: 'Opens the heart chakra and promotes unconditional love in healing practices.',
  },
];

// ─── REIKI PRACTICES DATA ──────────────────────────────────────────────────────

const REIKI_PRACTICES: ReikiPractice[] = [
  {
    id: 'initiation-1',
    name: 'Reiki Nivel 1 - Cura',
    category: ' initiation',
    level: 1,
    description: 'Primeiro nível de Reiki para cura pessoal e 手当て.',
    duration: '2-3 horas por sessão',
    benefits: ['Auto-cura', 'Cura de outros', 'Canalização básica'],
    steps: [
      'Receber iniciação do mestre',
      'Aprender posição das mãos',
      'Praticar auto-cura',
      'Cura em outros (mãos leves)',
    ],
    warnings: ['Evitar durante gravidez', 'Não substituir tratamento médico'],
  },
  {
    id: 'initiation-2',
    name: 'Reiki Nivel 2 - Avançado',
    category: 'initiation',
    level: 2,
    description: 'Segundo nível com símbolos de poder e cura à distância.',
    duration: '1-2 dias de treinamento',
    benefits: ['Cura à distância', 'Maior poder', 'Símbolos sagrados'],
    steps: [
      'Receber símbolos',
      'Aprender cura à distância',
      'Praticar com clientes',
      'Desenvolver intuição',
    ],
    warnings: ['Requer nivel 1', 'Padrão de ética necessário'],
  },
  {
    id: 'master-3',
    name: 'Reiki Mestre/Professor - Nivel 3',
    category: 'master',
    level: 3,
    description: 'Nível master para ensinar e dar iniciações em Reiki.',
    duration: '3-6 meses de treinamento',
    benefits: ['Ensinar Reiki', 'Dar iniciações', 'Mestria espiritual'],
    steps: [
      'Receber símbolos mestres',
      'Aprender técnicas de ensino',
      'Praticar iniciações',
      'Desenvolver linhagem',
    ],
    warnings: ['Requer nivel 2 completo', 'Compromisso com código ético'],
  },
  {
    id: 'chyrio',
    name: 'Cura Chyrio - Iniciação',
    category: 'advanced',
    level: 3,
    description: 'Sistema avançado de cura energética integrado.',
    duration: 'Varia por estudante',
    benefits: ['Integração energética', 'Expansão consciencia', 'Canalização avançada'],
    steps: [
      'Preparação espiritual',
      'Iniciação Chyrio',
      'Práticas avançadas',
      'Integração de sistemas',
    ],
    warnings: ['Sistema completo', 'Requer dedicação'],
  },
];

// ─── REIKI CATEGORIES ─────────────────────────────────────────────────────────

const REIKI_CATEGORIES: ReikiCategory[] = [
  { id: ' initiation', name: 'Iniciação', nameEn: 'Attunement', description: 'Processos de iniciação nos diferentes níveis', level: 1, practices: 2 },
  { id: 'master', name: 'Mestre', nameEn: 'Master', description: 'Nível mestres e professores de Reiki', level: 3, practices: 1 },
  { id: 'advanced', name: 'Avançado', nameEn: 'Advanced', description: 'Sistemas avançados e técnicas especializadas', level: 3, practices: 1 },
];

// ─── CATEGORY METADATA ─────────────────────────────────────────────────────────

const CATEGORY_META = {
  initiation: { title: 'Iniciação Reiki', description: 'Processos de iniciação e primeiro contato com a energia', count: 2 },
  master: { title: 'Mestre Reiki', description: 'Nível de mestres e professores', count: 1 },
  advanced: { title: 'Técnicas Avançadas', description: 'Sistemas avançados e práticas especializadas', count: 1 },
  symbols: { title: 'Símbolos Reiki', description: 'Símbolos sagrados e sua aplicação', count: 7 },
} as const;

type Category = keyof typeof CATEGORY_META;
type SymbolCategory = 'energy-amplification' | 'mental-emotional' | 'distance-healing' | 'master-energy' | 'kundalini-activation' | 'emotional-flow' | 'heart-connection';

// ─── GET HANDLER ──────────────────────────────────────────────────────────────

/**
 * GET /api/reiki/data
 * 
 * Query parameters:
 * - id: Get specific reiki item (symbols or practices)
 * - category: Filter by category (initiation, master, advanced, symbols)
 * - level: Filter symbols by reiki level (1, 2, 3)
 * - power: Filter symbols by power type
 * 
 * Examples:
 * - GET /api/reiki/data - Returns all reiki data
 * - GET /api/reiki/data?id=1 - Returns symbol with id 1
 * - GET /api/reiki/data?category=symbols - Returns all symbols
 * - GET /api/reiki/data?level=1 - Returns symbols for level 1
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const category = searchParams.get('category') as Category | null;
  const level = searchParams.get('level');
  const power = searchParams.get('power');

  // Get single symbol by ID
  if (id) {
    const symbol = REIKI_SYMBOLS.find((s) => s.id === parseInt(id, 10));
    if (symbol) {
      return NextResponse.json({
        data: symbol,
        meta: { source: 'reiki-symbols', type: 'symbol' },
      });
    }

    const practice = REIKI_PRACTICES.find((p) => p.id === id);
    if (practice) {
      return NextResponse.json({
        data: practice,
        meta: { source: 'reiki-practices', type: 'practice' },
      });
    }

    return NextResponse.json(
      { error: 'Reiki item not found', id },
      { status: 404 }
    );
  }

  // Get symbols by level
  if (level) {
    const levelNum = parseInt(level, 10);
    if (isNaN(levelNum) || levelNum < 1 || levelNum > 3) {
      return NextResponse.json(
        { error: 'Nível inválido. Use 1, 2 ou 3.', validLevels: [1, 2, 3] },
        { status: 400 }
      );
    }

    const symbolsByLevel = REIKI_SYMBOLS.filter((s) => s.level === levelNum);
    return NextResponse.json({
      data: symbolsByLevel,
      meta: { level: levelNum, total: symbolsByLevel.length, source: 'reiki-symbols' },
    });
  }

  // Get symbols by power type
  if (power) {
    const symbolsByPower = REIKI_SYMBOLS.filter(
      (s) => s.power.toLowerCase() === power.toLowerCase()
    );

    if (symbolsByPower.length === 0) {
      return NextResponse.json(
        { error: 'Tipo de poder não encontrado', power, validPowers: REIKI_SYMBOLS.map((s) => s.power) },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: symbolsByPower,
      meta: { power, total: symbolsByPower.length, source: 'reiki-symbols' },
    });
  }

  // Get by category
  if (category) {
    if (!Object.keys(CATEGORY_META).includes(category)) {
      return NextResponse.json(
        { error: 'Categoria inválida', validCategories: Object.keys(CATEGORY_META) },
        { status: 400 }
      );
    }

    if (category === 'symbols') {
      return NextResponse.json({
        data: REIKI_SYMBOLS,
        meta: {
          category: 'symbols',
          ...CATEGORY_META.symbols,
          total: REIKI_SYMBOLS.length,
        },
      });
    }

    const categoryPractices = REIKI_PRACTICES.filter((p) => p.category === category);
    return NextResponse.json({
      data: categoryPractices,
      meta: {
        category,
        ...CATEGORY_META[category as keyof typeof CATEGORY_META],
        total: categoryPractices.length,
      },
    });
  }

  // Return all reiki data
  return NextResponse.json({
    data: {
      symbols: REIKI_SYMBOLS,
      practices: REIKI_PRACTICES,
      categories: REIKI_CATEGORIES,
    },
    meta: {
      total: {
        symbols: REIKI_SYMBOLS.length,
        practices: REIKI_PRACTICES.length,
        categories: REIKI_CATEGORIES.length,
      },
      categories: CATEGORY_META,
      levels: [1, 2, 3],
      source: 'reiki-data',
    },
  });
}