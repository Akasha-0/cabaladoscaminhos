// Ancestral Data API - Cabala Dos Caminhos
// GET endpoints for ancestral wisdom and spiritual lineage data

import { NextRequest, NextResponse } from 'next/server';

// ─── ANCESTOR INTERFACES ───────────────────────────────────────────────────────

interface AncestorLineage {
  id: string;
  name: string;
  origin: string;
  era: string;
  wisdom: string[];
  teachings: string[];
  spiritualPractices: string[];
  symbols: string[];
  offerings: string[];
  prayers: string[];
}

interface AncestralWisdom {
  id: string;
  category: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  guidance: string[];
  rituals: string[];
  connections: string[];
  warnings: string[];
}

interface SacredRitual {
  id: string;
  name: string;
  purpose: string;
  frequency: string;
  offerings: string[];
  prayers: string[];
  duration: string;
  preparation: string[];
  completion: string[];
}

// ─── ANCESTOR LINEAGES DATA ────────────────────────────────────────────────────

const ANCESTOR_LINEAGES: AncestorLineage[] = [
  {
    id: 'lineage-elders',
    name: 'Ancestrais Anciãos',
    origin: 'Tradição Oral Africana',
    era: 'Tempos Imemoriais',
    wisdom: [
      'A sabedoria dos anciãos transcende gerações',
      'Os mortos veem o que os vivos não vêem',
      'A memória é o fio que une passado e presente',
      'Honrar os antepassados é abrir portas espirituais',
      'O sangue carrega memória, o nome carrega poder'
    ],
    teachings: [
      'Caminho do respeito aos mais velhos',
      'Arte da escuta ancestral',
      'Preservação da memória coletiva',
      'Lei do retorno espiritual',
      'Ciclo de honra e bênção'
    ],
    spiritualPractices: [
      'Ofensas aos ancestrais',
      'Comunhão com os espíritos',
      'Liturgia dos nomes sagrados',
      'Rituais de conexão temporal',
      'Meditação com mortos'
    ],
    symbols: ['☥', '⬡', '◈', '✧'],
    offerings: ['Água de obi', 'Akara', 'Dende', 'Evum'],
    prayers: ['Oriki dos Ancestrais', 'Saudação aos Mortos', 'Petição Ancestral']
  },
  {
    id: 'lineage-warriors',
    name: 'Guerreiros Espirituais',
    origin: 'Tradição Yoruba',
    era: 'Era dos Grandes Reinos',
    wisdom: [
      'O guerreiro ancestral luta mesmo após a morte',
      'A coragem é herança de sangue',
      'O escudo dos ancestrais protege os vivos',
      'A batalha espiritual continua além do véu'
    ],
    teachings: [
      'Arte da proteção espiritual',
      'Combate às forças ocultas',
      'Uso do axé ancestral',
      'Invocação de forças protetoras'
    ],
    spiritualPractices: [
      'Ebó de proteção',
      'Sasá dos guerreiros',
      'Marcha espiritual',
      'Imploração de vitória'
    ],
    symbols: ['⚔', '🛡', '◈', '✦'],
    offerings: ['Mel', 'Palmeira', 'Ferro', 'Ervas de guerra'],
    prayers: ['Invoque o Guerreiro', 'Peça Proteção', 'Rogo de Vitória']
  },
  {
    id: 'lineage-healers',
    name: 'Curandeiros Ancestrais',
    origin: 'Medicina Tradicional Africana',
    era: 'Tradição Milenar',
    wisdom: [
      'A doença tem origem espiritual',
      'A cura vem através da conexão ancestral',
      'O corpo carrega a história da linhagem',
      'A saúde é harmonia entre passado e presente'
    ],
    teachings: [
      'Diagnóstico espiritual',
      'Preparação de remédios ancestrais',
      'Rituais de cura coletiva',
      'Transmissão de conhecimento medicinal'
    ],
    spiritualPractices: [
      'Ritual de limpeza espiritual',
      'Feitura de ebós curativos',
      'Trabalho com egun',
      'Sessões de cura ritual'
    ],
    symbols: ['✚', '❋', '◇', '⬡'],
    offerings: ['Ervas sagradas', 'Mel', 'Óleo de coco', 'Água de cheiro'],
    prayers: ['Oração de Cura', 'Súplica ao Curandeiro', 'Benção Medicinal']
  }
];

// ─── ANCESTRAL WISDOM DATA ─────────────────────────────────────────────────────

const ANCESTRAL_WISDOM: AncestralWisdom[] = [
  {
    id: 'wisdom-origin',
    category: 'origem',
    title: 'A Sabedoria da Origem',
    titleEn: 'Wisdom of Origin',
    description: 'Conhecimento sobre as raízes ancestrais e a importância de conhecer sua linhagem espiritual.',
    descriptionEn: 'Knowledge about ancestral roots and the importance of knowing your spiritual lineage.',
    guidance: [
      'Conecte-se com sua história familiar',
      'Honre os sacrifícios dos antepassados',
      'Busque conhecer suas raízes',
      'Reconheça que você é parte de uma corrente',
      'A origem molda o destino'
    ],
    rituals: [
      'Ritual de conexão ancestral',
      'Cerimônia de nomes',
      'Ato de honra aos mortos'
    ],
    connections: ['Ancestrais Anciãos', 'Origens Africanas', 'Linhagem Sagrada'],
    warnings: ['Não ignore sua história', 'O esquecimento traz desgraça']
  },
  {
    id: 'wisdom-protection',
    category: 'proteção',
    title: 'Escudo dos Ancestrais',
    titleEn: 'Shield of Ancestors',
    description: 'Práticas de proteção espiritual através da conexão com os espíritos ancestrais.',
    descriptionEn: 'Spiritual protection practices through connection with ancestral spirits.',
    guidance: [
      'Os ancestrais protegem seus descendentes',
      'Peça proteção com humildade',
      'Mantenha a linha de comunicação aberta',
      'O axé dos mortos fortalece os vivos',
      'A proteção requer reciprocidade'
    ],
    rituals: [
      'Ebó de proteção',
      'Sasá protetivo',
      'Ritual de defumação',
      'Oferenda de água'
    ],
    connections: ['Guerreiros Ancestrais', 'Espíritos Protetores', 'Forças Guardiãs'],
    warnings: ['Não abandonne a prática', 'A proteção exige oferendas']
  },
  {
    id: 'wisdom-healing',
    category: 'cura',
    title: 'Cura da Linhagem',
    titleEn: 'Lineage Healing',
    description: 'Trabalho de cura emocional e espiritual através da resolução de questões ancestrais.',
    descriptionEn: 'Emotional and spiritual healing work through resolving ancestral issues.',
    guidance: [
      'Feridas ancestrais afetam gerações',
      'A cura começa com a consciência',
      'Perdoe para ser libertado',
      'Rituais de desbloqueio são essenciais',
      'A cura flui através da linhagem'
    ],
    rituals: [
      'Ritual de perdão ancestral',
      'Cerimônia de libertação',
      'Limpęza de karma familiar',
      'Rituais de cura profunda'
    ],
    connections: ['Curandeiros Ancestrais', 'Espíritos de Cura', 'Forças Renovadoras'],
    warnings: ['Nem tudo pode ser curado rapidamente', 'O processo requer paciência']
  }
];

// ─── SACRED RITUALS DATA ───────────────────────────────────────────────────────

const SACRED_RITUALS: SacredRitual[] = [
  {
    id: 'ritual-tribute',
    name: 'Oferenda aos Ancestrais',
    purpose: 'Honrar e alimentar os espíritos da linhagem',
    frequency: 'Terças, sextas e domingos',
    offerings: [
      'Água de obi (torrada e moída)',
      'Akara (bolinho de feijão)',
      'Dende (óleo de palma)',
      'Fumo (tabaco)',
      'Mel'
    ],
    prayers: [
      'Oriki ancestral',
      'Saudação aos mortos',
      'Pedido de bênção',
      'Súplica de proteção'
    ],
    duration: '30-60 minutos',
    preparation: [
      'Escolher dia adequado',
      'Preparar oferendas com amor',
      'Limpar o espaço ritual',
      'Acender velas',
      'Chamar os ancestrais'
    ],
    completion: [
      'Despejar oferendas',
      'Recitar orações',
      'Agradecer aos espíritos',
      'Despedir os ancestrais',
      'Limpar o espaço'
    ]
  },
  {
    id: 'ritual-connection',
    name: 'Ritual de Conexão Ancestral',
    purpose: 'Estabelecer comunicação direta com os espíritos da linhagem',
    frequency: 'Mensal ou quando necessário',
    offerings: [
      'Comida favorita do falecido',
      'Bebidas preferidas',
      'Flores brancas',
      'Velas brancas e vermelhas'
    ],
    prayers: [
      'Invocação do ancestral',
      'Diálogo espiritual',
      'Pedido de orientação',
      'Entrega de oferendas'
    ],
    duration: '1-2 horas',
    preparation: [
      'Jejum de 12 horas',
      'Banho de ervas',
      'Roupas limpas e brancas',
      'Ambiente tranquilo',
      'Intenção clara'
    ],
    completion: [
      'Silêncio meditativo',
      'Escuta atenta',
      'Registro de mensagens',
      'Agradecimento final',
      'Despedida respeitosa'
    ]
  },
  {
    id: 'ritual-liberation',
    name: 'Ritual de Libertação Ancestral',
    purpose: 'Libertar almas presas e resolver questões inacabadas',
    frequency: 'Anualmente ou em casos específicos',
    offerings: [
      'Velas pretas e brancas',
      'Incenso de alecrim',
      'Água salgada',
      'Pétalas de flores brancas',
      'Alcool'
    ],
    prayers: [
      'Oração de libertação',
      'Palavras de despedida',
      'Permissão para partir',
      'Bênção de passagem'
    ],
    duration: '45-90 minutos',
    preparation: [
      'Identificar a alma em questão',
      'Preparar espaço sagrado',
      'Chamar os guias espirituais',
      'Estabelecer proteção',
      'Preparar coração puro'
    ],
    completion: [
      'Ato de soltar',
      'Queima de objetos simbólicos',
      'Despedida final',
      'Fechamento espiritual',
      'Agradecimento aos guias'
    ]
  }
];

// ─── GET HANDLER ──────────────────────────────────────────────────────────────

/**
 * GET /api/ancestral/data
 * Returns ancestral wisdom, lineages, and ritual data
 * Supports query parameters:
 *   - type: 'lineages' | 'wisdom' | 'rituals' | 'all'
 *   - category: filter wisdom by category
 *   - id: get specific item by ID
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all';
  const category = searchParams.get('category');
  const id = searchParams.get('id');

  // Return specific item by ID
  if (id) {
    const lineages = ANCESTOR_LINEAGES.find(l => l.id === id);
    if (lineages) return NextResponse.json({ lineage: lineages });
    
    const wisdom = ANCESTRAL_WISDOM.find(w => w.id === id);
    if (wisdom) return NextResponse.json({ wisdom });
    
    const ritual = SACRED_RITUALS.find(r => r.id === id);
    if (ritual) return NextResponse.json({ ritual });

    return NextResponse.json(
      { error: 'Item not found', id },
      { status: 404 }
    );
  }

  // Return by type
  switch (type) {
    case 'lineages':
      return NextResponse.json({
        lineages: ANCESTOR_LINEAGES,
        total: ANCESTOR_LINEAGES.length
      });

    case 'wisdom':
      const filteredWisdom = category
        ? ANCESTRAL_WISDOM.filter(w => w.category === category)
        : ANCESTRAL_WISDOM;
      return NextResponse.json({
        wisdom: filteredWisdom,
        total: filteredWisdom.length,
        categories: [...new Set(ANCESTRAL_WISDOM.map(w => w.category))]
      });

    case 'rituals':
      return NextResponse.json({
        rituals: SACRED_RITUALS,
        total: SACRED_RITUALS.length
      });

    case 'all':
    default:
      return NextResponse.json({
        lineages: ANCESTOR_LINEAGES,
        wisdom: ANCESTRAL_WISDOM,
        rituals: SACRED_RITUALS,
        metadata: {
          lineagesCount: ANCESTOR_LINEAGES.length,
          wisdomCount: ANCESTRAL_WISDOM.length,
          ritualsCount: SACRED_RITUALS.length,
          categories: ANCESTRAL_WISDOM.map(w => w.category)
        }
      });
  }
}
