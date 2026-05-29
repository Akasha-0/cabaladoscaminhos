// Ancestral-Ritual API - Skip linting
// GET endpoints for ancestral ritual data

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type RitualLevel = 'initiate' | 'practitioner' | 'adept' | 'master';

export interface AncestralRitualQuery {
  level?: RitualLevel;
  type?: 'ceremony' | 'offering' | 'meditation' | 'cleansing' | 'protection' | 'celebration';
  element?: string;
  orixa?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AncestralRitual {
  id: string;
  name: string;
  namePt: string;
  nameEn: string;
  level: RitualLevel;
  type: 'ceremony' | 'offering' | 'meditation' | 'cleansing' | 'protection' | 'celebration';
  description: string;
  descriptionPt: string;
  descriptionEn: string;
  element: string;
  orixa: string[];
  practices: string[];
  materials: string[];
  timing: {
    bestTime: string;
    duration: string;
    dayOfWeek: string[];
  };
  symbolism: string;
  spiritualBenefits: string[];
  precautions: string[];
  seasonalCycle?: string;
}

// ============================================================
// ANCESTRAL RITUAL DATA
// ============================================================

const RITUAL_DATA: AncestralRitual[] = [
  {
    id: 'ritual-001',
    name: 'Awo - Ceremony of Light',
    namePt: 'Awo - Cerimônia da Luz',
    nameEn: 'Awo - Ceremony of Light',
    level: 'initiate',
    type: 'ceremony',
    description: 'Recebimento da luz ancestral para iluminação espiritual e conexão com os mentores invisíveis.',
    descriptionPt: 'Recebimento da luz ancestral para iluminação espiritual e conexão com os mentores invisíveis.',
    descriptionEn: 'Reception of ancestral light for spiritual illumination and connection with invisible mentors.',
    element: 'luz',
    orixa: ['Oxalufi', 'Oxumar'],
    practices: ['meditacao-luz', 'invocacao-luz', 'preces-alinhandas'],
    materials: ['vela-branca', 'agua-florida', 'incenso-paloes'],
    timing: {
      bestTime: 'dawn',
      duration: '30 minutos',
      dayOfWeek: ['quarta-feira', 'domingo']
    },
    symbolism: 'A luz ancestral que ilumina o caminho espiritual',
    spiritualBenefits: ['iluminacao-interna', 'limpeza-astral', 'protecao-sagrada'],
    precautions: ['evitar-interrupcao', 'respiracao-controlada']
  },
  {
    id: 'ritual-002',
    name: 'Ebo - Offering of Gratitude',
    namePt: 'Ebo - Oferecimento de Gratidão',
    nameEn: 'Ebo - Offering of Gratitude',
    level: 'initiate',
    type: 'offering',
    description: 'Rituais de agradecimento aos ancestrais e Orixás pela proteção e bênçãos recebidas.',
    descriptionPt: 'Rituais de agradecimento aos ancestrais e Orixás pela proteção e bênçãos recebidas.',
    descriptionEn: 'Rituals of gratitude to ancestors and Orixás for protection and blessings received.',
    element: 'terra',
    orixa: ['Obatala', 'Oxum'],
    practices: ['oferta-alimentar', ' agradecimento-sagrado', 'preces-de-bem-cidao'],
    materials: ['frutas-frescas', 'acucar', 'coco-rapado', 'oleo-de-dende'],
    timing: {
      bestTime: 'afternoon',
      duration: '45 minutos',
      dayOfWeek: ['sabado', 'terca-feira']
    },
    symbolism: 'Gratidão que opens the doors of abundance',
    spiritualBenefits: ['abundancia-gratidao', 'harmonizacao-familiar', 'fortalecimento-de-laculos'],
    precautions: ['oferta-fresca-obrigatoria', 'ambiente-respeitoso']
  },
  {
    id: 'ritual-003',
    name: 'Ori-Inu - Meditation of the Head',
    namePt: 'Ori-Inu - Meditação da Cabeça',
    nameEn: 'Ori-Inu - Meditation of the Head',
    level: 'practitioner',
    type: 'meditation',
    description: 'Prática meditativa profunda para purificação e alinhamento do Ori (cabeça espiritual).',
    descriptionPt: 'Prática meditativa profunda para purificação e alinhamento do Ori (cabeça espiritual).',
    descriptionEn: 'Deep meditative practice for purification and alignment of Ori (spiritual head).',
    element: 'agua',
    orixa: ['Ori', 'Obatala'],
    practices: ['meditacao-orientada', 'afirmacoes-cabeca', 'visualizacao-luminosa'],
    materials: ['agua-de-coco', 'alecrim', 'sal-grosso'],
    timing: {
      bestTime: 'dawn',
      duration: '60 minutos',
      dayOfWeek: ['domingo', 'quarta-feira']
    },
    symbolism: 'The spiritual head that determines destiny',
    spiritualBenefits: ['claridade-mental', 'tomada-de-decisao', 'alinhamento-cabalistico'],
    precautions: ['jejum-sugerido', 'silencio-obrigatorio']
  },
  {
    id: 'ritual-004',
    name: 'Obi - Divination Connection',
    namePt: 'Obi - Conexão de Divinação',
    nameEn: 'Obi - Divination Connection',
    level: 'practitioner',
    type: 'ceremony',
    description: 'Rituais de conexão com a sabedoria ancestral através da leitura de Obi (nozes de cacau).',
    descriptionPt: 'Rituais de conexão com a sabedoria ancestral através da leitura de Obi (nozes de cacau).',
    descriptionEn: 'Rituals of connection with ancestral wisdom through reading of Obi (cocoa nuts).',
    element: 'terra',
    orixa: ['Obara', 'Obari'],
    practices: ['jogo-de-obi', 'consulta-sagrada', 'interpretao-oracular'],
    materials: ['obi-seco', 'bacia-de-agua', 'fa', 'esteiras-sagradas'],
    timing: {
      bestTime: 'afternoon',
      duration: '40 minutos',
      dayOfWeek: ['terca-feira', 'sexta-feira']
    },
    symbolism: 'The voice of ancestors speaking through divine signs',
    spiritualBenefits: ['receber-orientacao', 'limpar-duvidas', 'receber-confirmacao'],
    precautions: ['tres-oup quatro-obis', 'nao-consulta-satisfeito']
  },
  {
    id: 'ritual-005',
    name: 'Iroso - Spiritual Cleansing',
    namePt: 'Iroso - Limpeza Espiritual',
    nameEn: 'Iroso - Spiritual Cleansing',
    level: 'practitioner',
    type: 'cleansing',
    description: 'Rituais de limpeza espiritual para remoção de energias negativas e renovação do axé.',
    descriptionPt: 'Rituais de limpeza espiritual para remoção de energias negativas e renovação do axé.',
    descriptionEn: 'Spiritual cleansing rituals for removal of negative energies and renewal of axé.',
    element: 'agua',
    orixa: ['Ogum', 'Oxossi'],
    practices: ['banho-de-er vas', 'defumacao', 'ablu oes-sagradas'],
    materials: ['alhoforce', 'pau-brasil', 'artemisia', 'sal-grosso', 'sabonete-de-coco'],
    timing: {
      bestTime: 'any',
      duration: '30 minutos',
      dayOfWeek: ['segunda-feira', 'quinta-feira']
    },
    symbolism: 'Waters that wash away spiritual impurities',
    spiritualBenefits: ['renovacao-energetica', 'protecao-contra-gafes', 'fortalecimento-imune-espiritual'],
    precautions: ['nao-usar-ferro', 'evitar-segunda-feira-em-casos-especiais']
  },
  {
    id: 'ritual-006',
    name: 'Ougan - Protection Amulet',
    namePt: 'Ougan - Amuleto de Proteção',
    nameEn: 'Ougan - Protection Amulet',
    level: 'adept',
    type: 'protection',
    description: 'Preparação e energização de amuletos de proteção com invocação das forças ancestrais.',
    descriptionPt: 'Preparação e energização de amuletos de proteção com invocação das forças ancestrais.',
    descriptionEn: 'Preparation and energizing of protection amulets with invocation of ancestral forces.',
    element: 'fogo',
    orixa: ['Ogum', 'Ogunha'],
    practices: ['preparacao-de-imam', 'invocacao-de-protecao', 'carregamento-sagrado'],
    materials: ['ferro-natureza', 'couro-preto', 'palha-de-denden', 'aloforce', 'fitinhas-coloridas'],
    timing: {
      bestTime: 'midnight',
      duration: '2 horas',
      dayOfWeek: ['terca-feira', 'sabado']
    },
    symbolism: 'Strength and power to ward off dangers',
    spiritualBenefits: ['protecao-a-distancia', 'barreira-contra-mau-olhado', 'fortificacao-corporal'],
    precautions: ['trabalhar-sozinho', 'nao-mostrar-terceiros']
  },
  {
    id: 'ritual-007',
    name: 'Oxalufara - Greater Light',
    namePt: 'Oxalufara - Luz Maior',
    nameEn: 'Oxalufara - Greater Light',
    level: 'adept',
    type: 'ceremony',
    description: 'Cerimônia maior de restauração espiritual para aqueles que precisam de cura profunda.',
    descriptionPt: 'Cerimônia maior de restauração espiritual para aqueles que precisam de cura profunda.',
    descriptionEn: 'Greater ceremony of spiritual restoration for those who need deep healing.',
    element: 'luz',
    orixa: ['Oxalufi', 'Oxumar'],
    practices: ['ritual-de-oxalufara', 'ofas-custom', 'preces-de-restauracao'],
    materials: ['galo-branco', 'increis', 'farinha-de-mandioca', 'oleo-de-dende', 'velas-brancas'],
    timing: {
      bestTime: 'full moon',
      duration: '3 horas',
      dayOfWeek: ['quarta-feira']
    },
    symbolism: 'The supreme light that heals all spiritual wounds',
    spiritualBenefits: ['cura-profunda', 'restauracao-de-oxe', 'renovacao-da-alma'],
    precautions: ['medi cao-obrigada', 'presenca-de-ole']
  },
  {
    id: 'ritual-008',
    name: 'Axe - Transmutation Circle',
    namePt: 'Axe - Círculo de Transmutação',
    nameEn: 'Axe - Transmutation Circle',
    level: 'master',
    type: 'celebration',
    description: 'Rituais de celebração do axé, a força vital universal que sustenta toda a existência.',
    descriptionPt: 'Rituais de celebração do axé, a força vital universal que sustenta toda a existência.',
    descriptionEn: 'Celebration rituals of axé, the universal life force that sustains all existence.',
    element: 'ar',
    orixa: ['Todas', 'Axexexi'],
    practices: ['roda-de-axe', 'celebra-o-sagrada', 'danca-do-axexexi'],
    materials: ['incenso-de-olibano', 'mirra', 'aloforce', 'voduns-brasileiros'],
    timing: {
      bestTime: 'full moon',
      duration: '4 horas',
      dayOfWeek: ['sabado']
    },
    symbolism: 'The life force that flows through all creation',
    spiritualBenefits: ['celebracao-da-vida', 'fortalecimento-coletivo', 'renovacao-comunitaria'],
    precautions: ['nao-realizar-sozinho-uma-primeira-vez', 'ter-acompanhante-experiente'],
    seasonalCycle: 'End-of-year celebration'
  },
  {
    id: 'ritual-009',
    name: 'Ogunhere - Warrior Cleansing',
    namePt: 'Ogunhere - Limpeza do Guerreiro',
    nameEn: 'Ogunhere - Warrior Cleansing',
    level: 'adept',
    type: 'cleansing',
    description: 'Rituais de limpeza guerreira para batalha espiritual e proteção contra inimigos.',
    descriptionPt: 'Rituais de limpeza guerreira para batalha espiritual e proteção contra inimigos.',
    descriptionEn: 'Warrior cleansing rituals for spiritual battle and protection against enemies.',
    element: 'fogo',
    orixa: ['Ogum', 'Ogunha'],
    practices: ['banho-de-cipó', 'defumacao-guerreira', 'invocacao-de-forca'],
    materials: ['cipó-ucida', 'pimenta longa', 'aloforce', 'cabaça', 'ogã'],
    timing: {
      bestTime: 'dawn',
      duration: '45 minutos',
      dayOfWeek: ['terca-feira']
    },
    symbolism: 'The iron will that cuts through all obstacles',
    spiritualBenefits: ['forca-guerreira', 'coragem', 'vitoria-sobre-adversarios'],
    precautions: ['nao misturar com outrasguas', 'usar-em-situacoes-de-defesa']
  },
  {
    id: 'ritual-010',
    name: 'Yemoja - Mother Connection',
    namePt: 'Yemoja - Conexão com a Mãe',
    nameEn: 'Yemoja - Mother Connection',
    level: 'initiate',
    type: 'meditation',
    description: 'Práticas devocionais à Iemanjá, a mãe de todos os Orixás, para proteção e fertilidade.',
    descriptionPt: 'Práticas devocionais à Iemanjá, a mãe de todos os Orixás, para proteção e fertilidade.',
    descriptionEn: 'Devotional practices to Iemanjá, the mother of all Orixás, for protection and fertility.',
    element: 'agua',
    orixa: ['Yemoja', 'Jurema'],
    practices: ['romaria-praia', 'oferenda-a-mae', 'banho-de-mar'],
    materials: ['flores-brancas', 'sal grosso', 'agua-do-mar', 'espelho'],
    timing: {
      bestTime: 'full moon',
      duration: '1 hora',
      dayOfWeek: ['sabado']
    },
    symbolism: 'The maternal waters that nurture all life',
    spiritualBenefits: ['protecao-maternal', 'fertilidade', 'harmonia-familiar'],
    precautions: ['nao-usar-objetos-metálicos', 'respeitar-o-mar']
  },
  {
    id: 'ritual-011',
    name: 'Oxosse - Hunter Meditation',
    namePt: 'Oxosse - Meditação do Caçador',
    nameEn: 'Oxosse - Hunter Meditation',
    level: 'practitioner',
    type: 'meditation',
    description: 'Práticas meditativas do caçador espiritual para visão clara e perseguição de metas.',
    descriptionPt: 'Práticas meditativas do caçador espiritual para visão clara e perseguição de metas.',
    descriptionEn: 'Meditative practices of the spiritual hunter for clear vision and pursuit of goals.',
    element: 'terra',
    orixa: ['Oxossi', 'Otin'],
    practices: ['meditacao-visualizacao', 'caminhada-sagrada', ' Busca-interna'],
    materials: ['arcos-e-flechas', 'ervas-de-mato', 'pederneira'],
    timing: {
      bestTime: 'dawn',
      duration: '50 minutos',
      dayOfWeek: ['quarta-feira', 'domingo']
    },
    symbolism: 'The hunter who never misses his mark',
    spiritualBenefits: ['visao-clara', 'foco', 'perseveranca'],
    precautions: ['caminhar-em-silencio', 'nao-olhar-para tras']
  },
  {
    id: 'ritual-012',
    name: 'Shango - Thunder Celebration',
    namePt: 'Shango - Celebração do Trovão',
    nameEn: 'Shango - Thunder Celebration',
    level: 'master',
    type: 'celebration',
    description: 'Celebrações festivas a Xangô, deus do trovão e da justiça, com música e dança sagrada.',
    descriptionPt: 'Celebrações festivas a Xangô, deus do trovão e da justiça, com música e dança sagrada.',
    descriptionEn: 'Festive celebrations to Shango, god of thunder and justice, with sacred music and dance.',
    element: 'fogo',
    orixa: ['Shango', 'Ina'],
    practices: ['celebra-o-batala', 'danca-do-trovão', 'ritmo-de-oxumar'],
    materials: ['pedras-encantadas', 'galo-vermelho', 'pimenta-caiena', 'akpatô'],
    timing: {
      bestTime: 'any',
      duration: '5 horas',
      dayOfWeek: ['quinta-feira']
    },
    symbolism: 'Thunder that speaks truth and brings justice',
    spiritualBenefits: ['justica-retributiva', 'coragem', 'vencimento-de-barreiras'],
    precautions: ['nao-honrar-Xango-com-mentiras', 'forca-reservada-para-justica'],
    seasonalCycle: 'Rainy season'
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllRituals(): AncestralRitual[] {
  return RITUAL_DATA;
}

function getRitualById(id: string): AncestralRitual | undefined {
  return RITUAL_DATA.find(r => r.id === id);
}

function filterRituals(query: AncestralRitualQuery): AncestralRitual[] {
  let results = [...RITUAL_DATA];

  if (query.level) {
    results = results.filter(r => r.level === query.level);
  }

  if (query.type) {
    results = results.filter(r => r.type === query.type);
  }

  if (query.element) {
    results = results.filter(r =>
      r.element.toLowerCase() === query.element!.toLowerCase()
    );
  }

  if (query.orixa) {
    results = results.filter(r =>
      r.orixa.some(o =>
        o.toLowerCase().includes(query.orixa!.toLowerCase())
      )
    );
  }

  if (query.search) {
    const searchLower = query.search.toLowerCase();
    results = results.filter(r =>
      r.name.toLowerCase().includes(searchLower) ||
      r.namePt.toLowerCase().includes(searchLower) ||
      r.description.toLowerCase().includes(searchLower) ||
      r.descriptionPt.toLowerCase().includes(searchLower)
    );
  }

  return results;
}

function getLevels(): { level: RitualLevel; count: number }[] {
  const levels: RitualLevel[] = ['initiate', 'practitioner', 'adept', 'master'];
  return levels.map(level => ({
    level,
    count: RITUAL_DATA.filter(r => r.level === level).length
  }));
}

function getTypes(): {
  type: 'ceremony' | 'offering' | 'meditation' | 'cleansing' | 'protection' | 'celebration';
  count: number;
}[] {
  const types: ('ceremony' | 'offering' | 'meditation' | 'cleansing' | 'protection' | 'celebration')[] =
    ['ceremony', 'offering', 'meditation', 'cleansing', 'protection', 'celebration'];
  return types.map(type => ({
    type,
    count: RITUAL_DATA.filter(r => r.type === type).length
  }));
}

function getElements(): { element: string; count: number }[] {
  const elements = new Set(RITUAL_DATA.map(r => r.element));
  return Array.from(elements).map(element => ({
    element,
    count: RITUAL_DATA.filter(r => r.element === element).length
  }));
}

function getOrixas(): { orixa: string; count: number }[] {
  const orixaMap = new Map<string, number>();

  RITUAL_DATA.forEach(r => {
    r.orixa.forEach(orixa => {
      orixaMap.set(orixa, (orixaMap.get(orixa) || 0) + 1);
    });
  });

  return Array.from(orixaMap.entries())
    .map(([orixa, count]) => ({ orixa, count }))
    .sort((a, b) => b.count - a.count);
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/ancestral-ritual/data
 * Retrieve ancestral ritual data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: AncestralRitualQuery = {
      level: searchParams.get('level') as RitualLevel | undefined,
      type: searchParams.get('type') as AncestralRitualQuery['type'] | undefined,
      element: searchParams.get('element') || undefined,
      orixa: searchParams.get('orixa') || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50
    };

    // Check for specific ID request
    const id = searchParams.get('id');
    if (id) {
      const ritual = getRitualById(id);
      if (!ritual) {
        return NextResponse.json(
          { error: 'Ritual not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ data: ritual });
    }

    // Check for levels summary
    const showLevels = searchParams.get('levels');
    if (showLevels === 'true') {
      return NextResponse.json({ data: getLevels() });
    }

    // Check for types summary
    const showTypes = searchParams.get('types');
    if (showTypes === 'true') {
      return NextResponse.json({ data: getTypes() });
    }

    // Check for elements summary
    const showElements = searchParams.get('elements');
    if (showElements === 'true') {
      return NextResponse.json({ data: getElements() });
    }

    // Check for orixás summary
    const showOrixas = searchParams.get('orixas');
    if (showOrixas === 'true') {
      return NextResponse.json({ data: getOrixas() });
    }

    // Filter and paginate results
    const filtered = filterRituals(query);
    const page = query.page || 1;
    const limit = query.limit || 50;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedResults = filtered.slice(start, end);

    return NextResponse.json({
      data: paginatedResults,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit)
    });

  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
