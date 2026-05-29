// ============================================================
// ERVAS DATA API - Cabala Dos Caminhos
// ============================================================
// GET endpoints for sacred herbs data access
// - Retrieve all herbs catalog
// - Get specific herb by ID
// - Herbs by category (sacred, medicinal, ritual)
// - Herbs by associated Orixás
// - Herb properties and uses
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// ─── HERB INTERFACES ──────────────────────────────────────────────────────────

interface Herb {
  id: string;
  name: string;
  nameEn: string;
  scientificName: string;
  description: string;
  descriptionEn: string;
  category: 'sacred' | 'medicinal' | 'ritual' | 'protection' | 'purification';
  orixas: string[];
  planets: string[];
  elements: string[];
  properties: {
    spiritual: string[];
    medicinal: string[];
    ritual: string[];
  };
  uses: {
    ritual: string[];
    medicinal: string[];
    bath: string[];
    incense: string[];
  };
  contraindications: string[];
  combinations: { herb: string; purpose: string }[];
  collectionTime: string;
  preparation: string[];
}

interface HerbCategory {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  herbs: string[];
}

interface OrixaHerbAssociation {
  orixa: string;
  herbs: string[];
  purpose: string;
  ritual: string;
}

// ─── HERBS DATA ──────────────────────────────────────────────────────────────

const HERBS: Herb[] = [
  {
    id: 'er-001',
    name: 'Salvia Sagrada',
    nameEn: 'Sacred Sage',
    scientificName: 'Salvia apiana',
    description: 'Erva sagrada de purificação e proteção espiritual. Usada em defumações e rituais de limpeza energética.',
    descriptionEn: 'Sacred herb for purification and spiritual protection. Used in smudgings and energy cleansing rituals.',
    category: 'sacred',
    orixas: ['Oxalá', 'Iemanjá'],
    planets: ['Lua', 'Júpiter'],
    elements: ['Água', 'Ar'],
    properties: {
      spiritual: ['Purificação', 'Proteção', 'Clareza mental', 'Conecção ancestral'],
      medicinal: ['Anti-inflamatório', 'Antisséptico', 'Relaxante'],
      ritual: ['Defumação', 'Banho de ervas', 'Purificação de espaços']
    },
    uses: {
      ritual: ['Limpeza de ambientes', 'Proteção de pessoas', 'Rituais de cura'],
      medicinal: ['Infusão para ansiedade', 'Gargarejos para garganta'],
      bath: ['Banho de descarrego', 'Banho de proteção'],
      incense: ['Defumação em espiral', 'Queima em брикетах']
    },
    contraindications: ['Grávidas', 'Epilépticos'],
    combinations: [
      { herb: 'Alecrim', purpose: 'Amplificar proteção' },
      { herb: 'Sal grosso', purpose: 'Purificação intensa' }
    ],
    collectionTime: 'Lua cheia',
    preparation: ['Secar à sombra', 'Guardar em frasco de vidro', 'Afastar de luz direta']
  },
  {
    id: 'er-002',
    name: 'Arruda',
    nameEn: 'Rue',
    scientificName: 'Ruta graveolens',
    description: 'Erva de proteção poderosa contra energias negativas, mau-olhado e feitiçarias. Muito utilizada em trabalhos de Ogum.',
    descriptionEn: 'Powerful protection herb against negative energies, evil eye, and witchcraft. Widely used in Ogum workings.',
    category: 'protection',
    orixas: ['Ogum', 'Oxum'],
    planets: ['Marte', 'Vênus'],
    elements: ['Fogo', 'Terra'],
    properties: {
      spiritual: ['Proteção contra mau-olhado', 'Quebra de feitiçarias', 'Descarrego', 'Caminhos abertos'],
      medicinal: ['Digestivo', 'Anti-espasmódico', 'Analgésico'],
      ritual: ['Amarração de firmezas', 'Defumação protetora', 'Banho de limpeza']
    },
    uses: {
      ritual: ['Amarração de guias', 'Defumação de proteção', 'Banho de Ogum'],
      medicinal: ['Chá para digestão', 'Tintura para dores'],
      bath: ['Banho de proteção', 'Banho de quebra-feitiço'],
      incense: ['Defumação básica', 'Mistura com Alecrim']
    },
    contraindications: ['Grávidas', 'Não misturar com álcool'],
    combinations: [
      { herb: 'Guiné', purpose: 'Quebra de feitiçaria' },
      { herb: 'Alecrim', purpose: 'Proteção completa' }
    ],
    collectionTime: 'Terça-feira',
    preparation: ['Folhas frescas', 'Amarração em ramos', 'Secar à sombra']
  },
  {
    id: 'er-003',
    name: 'Alecrim',
    nameEn: 'Rosemary',
    scientificName: 'Rosmarinus officinalis',
    description: 'Erva de proteção e fortalecimento. Fortalece a memória e proporciona clareza mental.',
    descriptionEn: 'Protection and strengthening herb. Enhances memory and provides mental clarity.',
    category: 'protection',
    orixas: ['Ogum', 'Oxalá'],
    planets: ['Sol', 'Marte'],
    elements: ['Fogo', 'Ar'],
    properties: {
      spiritual: ['Proteção', 'Fortalecimento', 'Clareza', 'Memória', 'Coragem'],
      medicinal: ['Estimulante', 'Antisséptico', 'Circulação'],
      ritual: ['Purificação', 'Queima de negatividades', 'Energização de ferramentas']
    },
    uses: {
      ritual: ['Defumação de proteção', 'Banho de开门', 'Amarração de firmezas'],
      medicinal: ['Infusão para memória', 'Óleo paramassagens'],
      bath: ['Banho de fortalecimento', 'Banho de proteção'],
      incense: ['Defumação purificadora', 'Mistura com Lavanda']
    },
    contraindications: ['Hipertensos', 'Epilépticos'],
    combinations: [
      { herb: 'Salvia', purpose: 'Purificação completa' },
      { herb: 'Arruda', purpose: 'Proteção dupla' }
    ],
    collectionTime: 'Sexta-feira',
    preparation: ['Ramos frescos ou secos', 'Moer para pós', 'Infusão em água']
  },
  {
    id: 'er-004',
    name: 'Manjericão',
    nameEn: 'Basil',
    scientificName: 'Ocimum basilicum',
    description: 'Erva de prosperidade e amor. Usada em rituais de Oxum e para atrair energias positivas.',
    descriptionEn: 'Prosperity and love herb. Used in Oxum rituals and to attract positive energies.',
    category: 'ritual',
    orixas: ['Oxum', 'Iansã', 'Oxalá'],
    planets: ['Vênus', 'Júpiter'],
    elements: ['Água', 'Ar'],
    properties: {
      spiritual: ['Prosperidade', 'Amor', 'Harmonização', 'Sorte', 'Fertilidade'],
      medicinal: ['Anti-inflamatório', 'Antisséptico', 'Calmante'],
      ritual: ['Banho de amor', 'Amarração de prosperidade', 'Defumação de paz']
    },
    uses: {
      ritual: ['Banho de Oxum', 'Amarração de amor', 'Defumação de prosperidade'],
      medicinal: ['Chá para digestão', 'Suco para gripes'],
      bath: ['Banho de prosperidade', 'Banho de amor'],
      incense: ['Defumação de paz', 'Mistura doce']
    },
    contraindications: ['Gestantes', 'Pacientes com epilepsia'],
    combinations: [
      { herb: 'Canela', purpose: 'Prosperidade amplificada' },
      { herb: 'Rosa', purpose: 'Amor intensificado' }
    ],
    collectionTime: 'Sexta-feira',
    preparation: ['Folhas frescas', 'Infusão em água', 'Pó para defumação']
  },
  {
    id: 'er-005',
    name: 'Guiné',
    nameEn: 'Guinea Weed',
    scientificName: 'Petiveria alliacea',
    description: 'Erva poderosa de quebra de feitiçarias e proteção. Usada em todos os terreiros para descarrego.',
    descriptionEn: 'Powerful herb for breaking spells and protection. Used in all temples for spiritual cleansing.',
    category: 'protection',
    orixas: ['Ogum', 'Exu', 'Iansã'],
    planets: ['Marte', 'Sol'],
    elements: ['Fogo', 'Terra'],
    properties: {
      spiritual: ['Quebra de feitiçarias', 'Descarrego', 'Proteção contra olho ruim', 'Limpeza pesada'],
      medicinal: ['Anti-inflamatório', 'Analgésico', 'Febrífugo'],
      ritual: ['Banho de quebra', 'Defumação de limpeza', 'Amarração de proteção']
    },
    uses: {
      ritual: ['Banho de quebra', 'Defumação pesada', 'Amarração contra feitiçaria'],
      medicinal: ['Decocto para dores', 'Cataplasma para inflamações'],
      bath: ['Banho de quebra-feitiço', 'Banho de limpeza pesada'],
      incense: ['Defumação forte', 'Mistura com Alcatrão']
    },
    contraindications: ['Gestantes', 'Não usar em jejum'],
    combinations: [
      { herb: 'Pinhão Roxo', purpose: 'Quebra completa' },
      { herb: 'Arruda', purpose: 'Proteção após quebra' }
    ],
    collectionTime: 'Terça-feira',
    preparation: ['Folhas e talos', 'Amarração em ramos', 'Queima directa']
  },
  {
    id: 'er-006',
    name: 'Espada de São Jorge',
    nameEn: "Snake Plant",
    scientificName: 'Sansevieria trifasciata',
    description: 'Erva de proteção do lar e afastamento de negatividades. Usada na entrada de casas.',
    descriptionEn: 'Home protection herb and warding off negative energies. Used at entrance of homes.',
    category: 'protection',
    orixas: ['Ogum', 'Oxalá'],
    planets: ['Marte', 'Sol'],
    elements: ['Fogo', 'Terra'],
    properties: {
      spiritual: ['Proteção do lar', 'Afastamento de negatividades', 'Firmeza', 'Defesa'],
      medicinal: ['Antisséptico', 'Anti-inflamatório'],
      ritual: ['Proteção de ambientes', 'Amarração de firmezas', 'Defumação protetora']
    },
    uses: {
      ritual: ['Proteção de portas', 'Defumação de ambientes', 'Banho de firmeza'],
      medicinal: ['Suco para infecções', 'Cataplasma para feridas'],
      bath: ['Banho de proteção do lar', 'Banho de firmeza'],
      incense: ['Defumação de proteção', 'Folhas na porta']
    },
    contraindications: ['Uso medicinal com cautela'],
    combinations: [
      { herb: 'Arruda', purpose: 'Proteção completa' },
      { herb: 'Alho', purpose: 'Proteção contra olho' }
    ],
    collectionTime: 'Qualquer fase lunar',
    preparation: ['Folhas inteiras', 'Talos para infusão', 'Amarração em cruzes']
  },
  {
    id: 'er-007',
    name: 'Pinhão Roxo',
    nameEn: 'Purple Jequitibá',
    scientificName: 'Cariniana legalis',
    description: 'Erva sagrada de transformação e proteção. Usada em rituais de Iansã e limpeza pesada.',
    descriptionEn: 'Sacred transformation and protection herb. Used in Iansã rituals and heavy cleansing.',
    category: 'purification',
    orixas: ['Iansã', 'Oxumaré'],
    planets: ['Marte', 'Urano'],
    elements: ['Fogo', 'Ar'],
    properties: {
      spiritual: ['Transformação', 'Purificação pesada', 'Proteção', 'Quebra de maldições'],
      medicinal: ['Anti-inflamatório', 'Febrífugo', 'Depurativo'],
      ritual: ['Banho de transformação', 'Defumação de Iansã', 'Amarração de firmezas']
    },
    uses: {
      ritual: ['Banho de Iansã', 'Defumação de transformação', 'Rituais de tempestade'],
      medicinal: ['Decocto para febres', 'Banho para inflamações'],
      bath: ['Banho de transformação', 'Banho de quebra'],
      incense: ['Defumação forte', 'Mistura com Fumo']
    },
    contraindications: ['Gestantes', 'Não misturar com álcool'],
    combinations: [
      { herb: 'Guiné', purpose: 'Quebra de feitiçaria' },
      { herb: 'Fumo', purpose: 'Proteção pesada' }
    ],
    collectionTime: 'Quarta-feira',
    preparation: ['Folhas secas', 'Amarração em ramos', 'Queima em brasas']
  },
  {
    id: 'er-008',
    name: 'Boldo',
    nameEn: 'Boldo',
    scientificName: 'Peumus boldus',
    description: 'Erva medicinal e purificadora. Usada em banhos de Oxalá e limpeza do corpo espiritual.',
    descriptionEn: 'Medicinal and purifying herb. Used in Oxalá baths and spiritual body cleansing.',
    category: 'purification',
    orixas: ['Oxalá', 'Nanã'],
    planets: ['Lua', 'Saturno'],
    elements: ['Água', 'Terra'],
    properties: {
      spiritual: ['Purificação suave', 'Calma', 'Sabedoria', 'Limpeza espiritual leve'],
      medicinal: ['Digestivo', 'Hepatoprotetor', 'Diurético'],
      ritual: ['Banho de Oxalá', 'Purificação de casas', 'Chá ritual']
    },
    uses: {
      ritual: ['Banho de Oxalá', 'Chá para meditação', 'Purificação de ambiente'],
      medicinal: ['Chá para fígado', 'Infusão digestiva'],
      bath: ['Banho suave de limpeza', 'Banho de Oxalá'],
      incense: ['Defumação suave', 'Mistura com Camomila']
    },
    contraindications: ['Obstrução biliar', 'Gestantes'],
    combinations: [
      { herb: 'Camomila', purpose: 'Calma e paz' },
      { herb: 'Malva', purpose: 'Hidratação espiritual' }
    ],
    collectionTime: 'Lua nova',
    preparation: ['Folhas frescas ou secas', 'Infusão', 'Decocto']
  },
  {
    id: 'er-009',
    name: 'Colônia',
    nameEn: 'Brazillian Mint',
    scientificName: 'Hyptis crinita',
    description: 'Erva de Oxum associada à prosperidade e amor. Usada em rituais de limpeza e harmonização.',
    descriptionEn: 'Oxum herb associated with prosperity and love. Used in cleansing and harmonizing rituals.',
    category: 'ritual',
    orixas: ['Oxum', 'Iemanjá'],
    planets: ['Vênus', 'Lua'],
    elements: ['Água'],
    properties: {
      spiritual: ['Amor', 'Prosperidade', 'Harmonia', 'Doçura', 'Fertilidade'],
      medicinal: ['Digestivo', 'Anti-inflamatório', 'Calmante'],
      ritual: ['Banho de Oxum', 'Amarração de prosperidade', 'Purificação suave']
    },
    uses: {
      ritual: ['Banho de Oxum', 'Amarração de amor', 'Defumação de paz'],
      medicinal: ['Chá para digestão', 'Infusão calmante'],
      bath: ['Banho de prosperidade', 'Banho de amor'],
      incense: ['Defumação doce', 'Mistura com Rosa']
    },
    contraindications: ['Gestantes no primeiro trimestre'],
    combinations: [
      { herb: 'Manjericão', purpose: 'Amor amplificado' },
      { herb: 'Rosa', purpose: 'Harmonização completa' }
    ],
    collectionTime: 'Sexta-feira',
    preparation: ['Folhas frescas', 'Amarração em ramos', 'Infusão']
  },
  {
    id: 'er-010',
    name: 'Fumo',
    nameEn: 'Tobacco',
    scientificName: 'Nicotiana tabacum',
    description: 'Erva sagrada de comunicação com os Orixás. Usada em rituais de offering e defumação ritualística.',
    descriptionEn: 'Sacred communication herb with Orixás. Used in offering rituals and ritual smudging.',
    category: 'sacred',
    orixas: ['Oxossi', 'Iansã', 'Ogum'],
    planets: ['Marte', 'Sol'],
    elements: ['Fogo'],
    properties: {
      spiritual: ['Comunicação com Orixás', 'Oferecimento', 'Proteção poderosa', 'Descarrego'],
      medicinal: ['Expectorante', 'Sedativo leve'],
      ritual: ['Offering aos Orixás', 'Defumação ritual', 'Purificação pesada']
    },
    uses: {
      ritual: ['Oferecimento a Oxossi', 'Defumação ritual', 'Purificação de ferramentas'],
      medicinal: ['Infusão para tosse', 'Cataplasma para inflamações'],
      bath: ['Banho de proteção forte', 'Banho de limpeza'],
      incense: ['Defumação ritual', 'Queima directa']
    },
    contraindications: ['Não fumar', 'Gestantes', 'Pessoas com problemas respiratórios'],
    combinations: [
      { herb: 'Pinhão Roxo', purpose: 'Proteção completa' },
      { herb: 'Guiné', purpose: 'Quebra de feitiçaria' }
    ],
    collectionTime: 'Quarta-feira',
    preparation: ['Folhas secas', 'Moído para defumação', 'Rolos para offering']
  }
];

// ─── HERB CATEGORIES DATA ─────────────────────────────────────────────────────

const HERB_CATEGORIES: HerbCategory[] = [
  {
    id: 'sacred',
    name: 'Sagradas',
    nameEn: 'Sacred',
    description: 'Ervas usadas em rituals sagrados e ofrecimentos aos Orixás',
    herbs: ['er-001', 'er-010']
  },
  {
    id: 'medicinal',
    name: 'Medicinais',
    nameEn: 'Medicinal',
    description: 'Ervas com propriedades terapêuticas e preventivas',
    herbs: ['er-008', 'er-009']
  },
  {
    id: 'ritual',
    name: 'Rituais',
    nameEn: 'Ritual',
    description: 'Ervas usadas em rituals de prosperidade, amor e harmonização',
    herbs: ['er-004', 'er-009']
  },
  {
    id: 'protection',
    name: 'Proteção',
    nameEn: 'Protection',
    description: 'Ervas de proteção contra energias negativas e mau-olhado',
    herbs: ['er-002', 'er-003', 'er-005', 'er-006']
  },
  {
    id: 'purification',
    name: 'Purificação',
    nameEn: 'Purification',
    description: 'Ervas para limpeza espiritual e purificação de ambientes',
    herbs: ['er-001', 'er-007', 'er-008']
  }
];

// ─── ORIXÁ HERB ASSOCIATIONS DATA ─────────────────────────────────────────────

const ORIXA_HERB_ASSOCIATIONS: OrixaHerbAssociation[] = [
  {
    orixa: 'Ogum',
    herbs: ['er-002', 'er-003', 'er-005', 'er-006', 'er-010'],
    purpose: 'Proteção, caminhos abertos, firmezas',
    ritual: 'Amarração de guias, defumação de proteção, banho de开门'
  },
  {
    orixa: 'Oxum',
    herbs: ['er-002', 'er-004', 'er-009'],
    purpose: 'Amor, prosperidade, doçura',
    ritual: 'Banho de Oxum, amarração de prosperidade, defumação de paz'
  },
  {
    orixa: 'Oxalá',
    herbs: ['er-001', 'er-003', 'er-008', 'er-006'],
    purpose: 'Paz, saúde, sabedoria',
    ritual: 'Banho de Oxalá, chá de meditação, purificação suave'
  },
  {
    orixa: 'Iansã',
    herbs: ['er-004', 'er-005', 'er-007', 'er-010'],
    purpose: 'Transformação, proteção, tempestade',
    ritual: 'Banho de Iansã, defumação de transformação, offering'
  },
  {
    orixa: 'Iemanjá',
    herbs: ['er-001', 'er-008', 'er-009'],
    purpose: 'Proteção das águas, maternidade, cura',
    ritual: 'Banho de Iemanjá, oferendas na água, purificação marinha'
  },
  {
    orixa: 'Oxossi',
    herbs: ['er-010'],
    purpose: 'Caça, proteção das matas, fartura',
    ritual: 'Offering de fumo, proteção das florestas'
  },
  {
    orixa: 'Nanã',
    herbs: ['er-008'],
    purpose: 'Sabedoria ancestral, cura, paciência',
    ritual: 'Banho de Nanã, rezas mansas, purificação do ser'
  },
  {
    orixa: 'Oxumaré',
    herbs: ['er-007'],
    purpose: 'Ciclos, renovação, arco-íris',
    ritual: 'Rituais de transformação, banhos de renovação'
  },
  {
    orixa: 'Exu',
    herbs: ['er-005', 'er-010'],
    purpose: 'Comunicação, caminhos, proteção',
    ritual: 'Offering a Exu, defumação de abertura de caminhos'
  }
];

// ─── GET HANDLER ─────────────────────────────────────────────────────────────

/**
 * GET /api/ervas/data
 * 
 * Query Parameters:
 * - type: 'all' | 'herbs' | 'categories' | 'orixas' | 'single' | 'by-category' | 'by-orixa'
 * - id: herb id (required when type='single')
 * - category: category id (required when type='by-category')
 * - orixa: orixa name (required when type='by-orixa')
 * 
 * Returns:
 * - { data: Herb[] } for type='all' or 'herbs'
 * - { data: HerbCategory[] } for type='categories'
 * - { data: OrixaHerbAssociation[] } for type='orixas'
 * - { data: Herb } for type='single'
 * - { data: Herb[] } for type='by-category'
 * - { data: Herb[] } for type='by-orixa'
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'all';
    const id = url.searchParams.get('id');
    const category = url.searchParams.get('category');
    const orixa = url.searchParams.get('orixa');

    switch (type) {
      case 'all':
        return NextResponse.json({
          success: true,
          data: {
            herbs: HERBS,
            categories: HERB_CATEGORIES,
            orixaAssociations: ORIXA_HERB_ASSOCIATIONS,
            total: HERBS.length,
            categoriesCount: HERB_CATEGORIES.length
          }
        });

      case 'herbs':
        return NextResponse.json({
          success: true,
          data: HERBS,
          total: HERBS.length
        });

      case 'categories':
        return NextResponse.json({
          success: true,
          data: HERB_CATEGORIES,
          total: HERB_CATEGORIES.length
        });

      case 'orixas':
        return NextResponse.json({
          success: true,
          data: ORIXA_HERB_ASSOCIATIONS,
          total: ORIXA_HERB_ASSOCIATIONS.length
        });

      case 'single':
        if (!id) {
          return NextResponse.json(
            { success: false, error: 'Herb ID is required for single type' },
            { status: 400 }
          );
        }
        const herb = HERBS.find(h => h.id === id);
        if (!herb) {
          return NextResponse.json(
            { success: false, error: `Herb with id '${id}' not found` },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: herb });

      case 'by-category':
        if (!category) {
          return NextResponse.json(
            { success: false, error: 'Category is required for by-category type' },
            { status: 400 }
          );
        }
        const herbsByCategory = HERBS.filter(h => h.category === category);
        return NextResponse.json({
          success: true,
          data: herbsByCategory,
          category,
          total: herbsByCategory.length
        });

      case 'by-orixa':
        if (!orixa) {
          return NextResponse.json(
            { success: false, error: 'Orixá name is required for by-orixa type' },
            { status: 400 }
          );
        }
        const herbsByOrixa = HERBS.filter(h =>
          h.orixas.some(o => o.toLowerCase() === orixa.toLowerCase())
        );
        return NextResponse.json({
          success: true,
          data: herbsByOrixa,
          orixa,
          total: herbsByOrixa.length
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid type. Use: all, herbs, categories, orixas, single, by-category, by-orixa' },
          { status: 400 }
        );
    }
} catch (_error) {
    console.error('Ervas API Error:', _error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}