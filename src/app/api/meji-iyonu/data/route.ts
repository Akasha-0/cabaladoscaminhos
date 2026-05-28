// Meji-Iyonu API - Cabala Dos Caminhos
// GET endpoints for Meji-Iyonu Odu spiritual data

import { NextResponse } from 'next/server';

// Meji-Iyonu data structure based on Ifá lore
interface MejiIyonuData {
  id: string;
  name: string;
  namePt: string;
  nameEn: string;
  symbol: string;
  yoruba: string;
  meaning: string;
  meaningPt: string;
  meaningEn: string;
  spiritualGuidance: string[];
  keywords: string[];
  elements: string[];
  colors: string[];
  dayOfWeek: string;
  rulingOrishas: string[];
  sacredNumbers: number[];
  greeting: string;
  rituals: string[];
  offerings: string[];
  affirmations: string[];
}

const mejiIyonuData: MejiIyonuData = {
  id: 'meji-iyonu-001',
  name: 'Meji-Iyonu',
  namePt: 'Meji-Iyonu - A Duplicação',
  nameEn: 'Meji-Iyonu - The Duplication',
  symbol: '☰☵',
  yoruba: 'Ìyónú Méjì',
  meaning: 'Meji-Iyonu',
  meaningPt: 'Meji-Iyonu representa a duplicação, riqueza, prosperidade, abundância material e espiritual, e a bênção dos ancestrais.',
  meaningEn: 'Meji-Iyonu symbolizes duplication, wealth, prosperity, material and spiritual abundance, and the blessing of ancestors.',
  spiritualGuidance: [
    'Embrace abundance in all forms',
    'Honor your ancestors for their blessings',
    'Share your prosperity with those in need',
    'Trust in the flow of universal wealth',
    'Practice gratitude for every blessing received',
  ],
  keywords: ['duplicação', 'riqueza', 'prosperidade', 'abundância', 'ancestrais', 'bênção', 'material', 'espiritual'],
  elements: ['Ouro', 'Terra Firme', 'Amêndoas'],
  colors: ['#FFD700', '#228B22', '#8B4513'],
  dayOfWeek: 'Sexta-feira',
  rulingOrishas: ['Olódùmarè', 'Orunmila', 'Olokun', 'Eshu'],
  sacredNumbers: [2, 16, 32, 48],
  greeting: 'Abundance blesses the worthy!',
  rituals: [
    'Ancestral offerings at the family shrine',
    'Abundance meditation practices',
    'Gratitude rituals for prosperity',
    'Cleansing with sacred herbs',
    'Offering of first fruits',
  ],
  offerings: [
    'Honey',
    'Palm wine',
    'Gold-colored cloth',
    'Nuts and seeds',
    'Fresh fruits',
  ],
  affirmations: [
    'I am blessed with abundance',
    'Prosperity flows to me effortlessly',
    'I honor my ancestors with gratitude',
    'I share my blessings with others',
    'Universal wealth supports my journey',
  ],
};

// Combined 16 Meji Odus with Meji-Iyonu as Odu 16
const mejiOdusData: Record<number, MejiIyonuData> = {
  1: {
    id: 'meji-ogbe-001',
    name: 'Meji-Ogbe',
    namePt: 'Meji-Ogbe - A Duplicação',
    nameEn: 'Meji-Ogbe - The Duplication',
    symbol: '☰☰',
    yoruba: 'Ògùndá Méjì',
    meaning: 'Duplicação, reflexo, espelho',
    meaningPt: 'Meji-Ogbe representa a duplicação, reflexo, espelho, dualidade, parceria, harmonia conjugal e unificação.',
    meaningEn: 'Meji-Ogbe symbolizes duplication, reflection, mirror, duality, partnership, marital harmony, and unification.',
    spiritualGuidance: ['Seek harmony in duality', 'Embrace partnership', 'Practice self-reflection'],
    keywords: ['duplicação', 'reflexo', 'espelho', 'dualidade', 'parceria'],
    elements: ['Água Lunar', 'Espelho', 'Prata'],
    colors: ['#C0C0C0', '#E6E6FA', '#B0C4DE'],
    dayOfWeek: 'Segunda-feira',
    rulingOrishas: ['Olódùmarè', 'Orunmila', 'Oxum'],
    sacredNumbers: [2, 6, 11, 22],
    greeting: 'Mirror reveals!',
    rituals: ['Mirror meditation', 'Partnership rituals', 'Water offerings'],
    offerings: ['Salt', 'White cloth', 'Palm wine'],
    affirmations: ['I embrace my reflection', 'I find harmony in duality'],
  },
  2: {
    id: 'meji-odi-001',
    name: 'Meji-Odi',
    namePt: 'Meji-Odi - A Duplicação',
    nameEn: 'Meji-Odi - The Duplication',
    symbol: '☰☷',
    yoruba: 'Òdí Méjì',
    meaning: 'Duplicação, mistério, sabedoria oculta',
    meaningPt: 'Meji-Odi representa a duplicação, mistério, sabedoria oculta, conhecimento profundo e revelação.',
    meaningEn: 'Meji-Odi symbolizes duplication, mystery, hidden wisdom, deep knowledge, and revelation.',
    spiritualGuidance: ['Seek truth within mystery', 'Trust hidden wisdom', 'Embrace the unknown'],
    keywords: ['duplicação', 'mistério', 'sabedoria', 'oculto', 'revelação'],
    elements: ['Terra', 'Água Subterrânea', 'Cristal'],
    colors: ['#8B4513', '#2F4F4F', '#191970'],
    dayOfWeek: 'Terça-feira',
    rulingOrishas: ['Olódùmarè', 'Orunmila', 'Ogbono'],
    sacredNumbers: [2, 7, 14, 28],
    greeting: 'Mystery reveals truth!',
    rituals: ['Deep meditation', 'Sacred texts study', 'Water purification'],
    offerings: ['Palm wine', 'Honey', 'Black cloth'],
    affirmations: ['I embrace mystery with courage', 'Wisdom flows to me'],
  },
  3: {
    id: 'meji-ogunda-001',
    name: 'Meji-Ogunda',
    namePt: 'Meji-Ogunda - A Duplicação',
    nameEn: 'Meji-Ogunda - The Duplication',
    symbol: '☰☱',
    yoruba: 'Ògùndá Méjì',
    meaning: 'Duplicação, destino, criatividade',
    meaningPt: 'Meji-Ogunda representa a duplicação, destino, criatividade e força de vontade.',
    meaningEn: 'Meji-Ogunda symbolizes duplication, destiny, creativity, and willpower.',
    spiritualGuidance: ['Embrace your creative destiny', 'Use willpower wisely', 'Trust your path'],
    keywords: ['duplicação', 'destino', 'criatividade', 'força', 'vontade'],
    elements: ['Ferro', 'Fogo', 'Trovão'],
    colors: ['#CD853F', '#8B0000', '#DAA520'],
    dayOfWeek: 'Quarta-feira',
    rulingOrishas: ['Olódùmarè', 'Ogunda', 'Ogbe'],
    sacredNumbers: [2, 8, 16, 24],
    greeting: 'Destiny unfolds!',
    rituals: ['Iron offerings', 'Destiny rituals', 'Creative practices'],
    offerings: ['Iron tools', 'Red palm oil', 'Yam'],
    affirmations: ['My destiny is fulfilled', 'I create my path'],
  },
  4: {
    id: 'meji-irosun-001',
    name: 'Meji-Irosun',
    namePt: 'Meji-Irosun - A Duplicação',
    nameEn: 'Meji-Irosun - The Duplication',
    symbol: '☰☲',
    yoruba: 'Òdí Méjì',
    meaning: 'Duplicação, cura, renovação',
    meaningPt: 'Meji-Irosun representa a duplicação, cura, renovação e transformação espiritual.',
    meaningEn: 'Meji-Irosun symbolizes duplication, healing, renewal, and spiritual transformation.',
    spiritualGuidance: ['Embrace healing energy', 'Seek renewal', 'Trust transformation'],
    keywords: ['duplicação', 'cura', 'renovação', 'transformação', 'espiritual'],
    elements: ['Fogo Solar', 'Ervas', 'Ouro'],
    colors: ['#FFD700', '#FF6347', '#32CD32'],
    dayOfWeek: 'Domingo',
    rulingOrishas: ['Olódùmarè', 'Osain', 'Irosun'],
    sacredNumbers: [2, 9, 18, 27],
    greeting: 'Healing light shines!',
    rituals: ['Healing ceremonies', 'Herbal baths', 'Solar rituals'],
    offerings: ['Herbs', 'Honey', 'Yellow cloth'],
    affirmations: ['I am healed and whole', 'Renewal flows through me'],
  },
  5: {
    id: 'meji-owonrin-001',
    name: 'Meji-Owonrin',
    namePt: 'Meji-Owonrin - A Duplicação',
    nameEn: 'Meji-Owonrin - The Duplication',
    symbol: '☰☴',
    yoruba: 'Òwónrín Méjì',
    meaning: 'Duplicação, vento, mudança',
    meaningPt: 'Meji-Owonrin representa a duplicação, vento, mudança, adaptação e flexibilidade.',
    meaningEn: 'Meji-Owonrin symbolizes duplication, wind, change, adaptation, and flexibility.',
    spiritualGuidance: ['Embrace change with grace', 'Adapt to circumstances', 'Flow with the wind'],
    keywords: ['duplicação', 'vento', 'mudança', 'adaptação', 'flexibilidade'],
    elements: ['Vento', 'Penas', 'Ar'],
    colors: ['#87CEEB', '#F0E68C', '#ADD8E6'],
    dayOfWeek: 'Quinta-feira',
    rulingOrishas: ['Olódùmarè', 'Owonrin', 'Oba'],
    sacredNumbers: [2, 10, 20, 40],
    greeting: 'Change brings growth!',
    rituals: ['Wind meditation', 'Adaptation rituals', 'Feather offerings'],
    offerings: ['Feathers', 'White cloth', 'Fresh water'],
    affirmations: ['I embrace change', 'I adapt with grace'],
  },
  6: {
    id: 'meji-oba-001',
    name: 'Meji-Oba',
    namePt: 'Meji-Oba - A Duplicação',
    nameEn: 'Meji-Oba - The Duplication',
    symbol: '☰☶',
    yoruba: 'Òbá Méjì',
    meaning: 'Duplicação, realeza, serviço',
    meaningPt: 'Meji-Oba representa a duplicação, realeza, serviço ao próximo e liderança humilde.',
    meaningEn: 'Meji-Oba symbolizes duplication, royalty, service to others, and humble leadership.',
    spiritualGuidance: ['Serve others with humility', 'Lead by example', 'Honor royalty within'],
    keywords: ['duplicação', 'realeza', 'serviço', 'liderança', 'humildade'],
    elements: ['Fogo Real', 'Coroa', 'Mel'],
    colors: ['#8B0000', '#FFD700', '#FF4500'],
    dayOfWeek: 'Sexta-feira',
    rulingOrishas: ['Olódùmarè', 'Oba', 'Yemoja'],
    sacredNumbers: [2, 11, 22, 44],
    greeting: 'Royal service honors!',
    rituals: ['Coronation rituals', 'Service to community', 'Honey offerings'],
    offerings: ['Honey', 'Red cloth', 'Crown accessories'],
    affirmations: ['I serve with royal grace', 'Leadership flows through me'],
  },
  7: {
    id: 'meji-eksi-001',
    name: 'Meji-Eksi',
    namePt: 'Meji-Eksi - A Duplicação',
    nameEn: 'Meji-Eksi - The Duplication',
    symbol: '☰☷',
    yoruba: 'Èsì Méjì',
    meaning: 'Duplicação, oposição, harmonia',
    meaningPt: 'Meji-Eksi representa a duplicação, oposição, harmonia apesar dos conflitos e reconciliação.',
    meaningEn: 'Meji-Eksi symbolizes duplication, opposition, harmony despite conflicts, and reconciliation.',
    spiritualGuidance: ['Harmonize opposing forces', 'Seek reconciliation', 'Find peace in conflict'],
    keywords: ['duplicação', 'oposição', 'harmonia', 'conflito', 'reconciliação'],
    elements: ['Terra', 'Pedra', 'Fogo'],
    colors: ['#8B4513', '#A52A2A', '#D2691E'],
    dayOfWeek: 'Segunda-feira',
    rulingOrishas: ['Olódùmarè', 'Eshu', 'Orunmila'],
    sacredNumbers: [2, 12, 24, 36],
    greeting: 'Peace bridges discord!',
    rituals: ['Reconciliation ceremonies', 'Stone meditation', 'Earth offerings'],
    offerings: ['Stone', 'Earth', 'Palm wine'],
    affirmations: ['I find harmony in opposition', 'Peace flows through me'],
  },
  8: {
    id: 'meji-ikanran-001',
    name: 'Meji-Ikanran',
    namePt: 'Meji-Ikanran - A Duplicação',
    nameEn: 'Meji-Ikanran - The Duplication',
    symbol: '☰☰',
    yoruba: 'Ìkánrán Méjì',
    meaning: 'Duplicação, solidão, introspecção',
    meaningPt: 'Meji-Ikanran representa a duplicação, solidão, introspecção e busca interior.',
    meaningEn: 'Meji-Ikanran symbolizes duplication, solitude, introspection, and inner seeking.',
    spiritualGuidance: ['Embrace solitude for wisdom', 'Seek within yourself', 'Trust inner journey'],
    keywords: ['duplicação', 'solidão', 'introspecção', 'busca', 'interior'],
    elements: ['Noite', 'Lua', 'Escuridão'],
    colors: ['#191970', '#000080', '#483D8B'],
    dayOfWeek: 'Segunda-feira',
    rulingOrishas: ['Olódùmarè', 'Orunmila', 'Yemoja'],
    sacredNumbers: [2, 13, 26, 52],
    greeting: 'Inner silence speaks!',
    rituals: ['Meditation in darkness', 'Moonlight rituals', 'Solitary retreat'],
    offerings: ['Moon water', 'Dark cloth', 'Night-blooming flowers'],
    affirmations: ['Inner wisdom emerges', 'Solitude grants clarity'],
  },
  9: {
    id: 'meji-osa-001',
    name: 'Meji-Osa',
    namePt: 'Meji-Osa - A Duplicação',
    nameEn: 'Meji-Osa - The Duplication',
    symbol: '☱☱',
    yoruba: 'Òsà Méjì',
    meaning: 'Duplicação, florestas, obstáculos',
    meaningPt: 'Meji-Osa representa a duplicação, florestas, obstáculos e superação de desafios.',
    meaningEn: 'Meji-Osa symbolizes duplication, forests, obstacles, and overcoming challenges.',
    spiritualGuidance: ['Overcome obstacles with courage', 'Navigate through difficulties', 'Trust the path'],
    keywords: ['duplicação', 'florestas', 'obstáculos', 'desafios', 'superação'],
    elements: ['Floresta', 'Árvores', 'Folhas'],
    colors: ['#228B22', '#006400', '#32CD32'],
    dayOfWeek: 'Terça-feira',
    rulingOrishas: ['Olódùmarè', 'Osain', 'Ogun'],
    sacredNumbers: [2, 14, 28, 42],
    greeting: 'Forest yields to courage!',
    rituals: ['Forest walks', 'Obstacle rituals', 'Tree ceremonies'],
    offerings: ['Leaves', 'Tree bark', 'Forest herbs'],
    affirmations: ['I overcome all obstacles', 'Strength emerges from challenges'],
  },
  10: {
    id: 'meji-ogi-001',
    name: 'Meji-Ogi',
    namePt: 'Meji-Ogi - A Duplicação',
    nameEn: 'Meji-Ogi - The Duplication',
    symbol: '☲☲',
    yoruba: 'Ògì Méjì',
    meaning: 'Duplicação, firmeza, decisão',
    meaningPt: 'Meji-Ogi representa a duplicação, firmeza, decisão e clareza de propósito.',
    meaningEn: 'Meji-Ogi symbolizes duplication, firmness, decision, and clarity of purpose.',
    spiritualGuidance: ['Decide with clarity', 'Stand firm in truth', 'Follow your conviction'],
    keywords: ['duplicação', 'firmeza', 'decisão', 'propósito', 'clareza'],
    elements: ['Aço', 'Determinação', 'Clareza'],
    colors: ['#708090', '#C0C0C0', '#696969'],
    dayOfWeek: 'Quarta-feira',
    rulingOrishas: ['Olódùmarè', 'Ogun', 'Shango'],
    sacredNumbers: [2, 15, 30, 45],
    greeting: 'Clarity guides the way!',
    rituals: ['Decision rituals', 'Steel offerings', 'Purpose meditation'],
    offerings: ['Steel', 'Iron filings', 'Red cloth'],
    affirmations: ["My decisions are clear", "Purpose guides my path"],
  },
  11: {
    id: 'meji-onsa-001',
    name: 'Meji-Onsa',
    namePt: 'Meji-Onsa - A Duplicação',
    nameEn: 'Meji-Onsa - The Duplication',
    symbol: '☴☴',
    yoruba: 'Ònsà Méjì',
    meaning: 'Duplicação, investigação, análise',
    meaningPt: 'Meji-Onsa representa a duplicação, investigação, análise profunda e pesquisa.',
    meaningEn: 'Meji-Onsa symbolizes duplication, investigation, deep analysis, and research.',
    spiritualGuidance: ['Investigate with open mind', 'Analyze with wisdom', 'Seek deeper truths'],
    keywords: ['duplicação', 'investigação', 'análise', 'pesquisa', 'verdade'],
    elements: ['Conhecimento', 'Água Profunda', 'Pergaminho'],
    colors: ['#00008B', '#4169E1', '#6495ED'],
    dayOfWeek: 'Quinta-feira',
    rulingOrishas: ['Olódùmarè', 'Orunmila', 'Obatala'],
    sacredNumbers: [2, 16, 32, 48],
    greeting: 'Truth emerges from analysis!',
    rituals: ['Study rituals', 'Investigation ceremonies', 'Water libations'],
    offerings: ['Books', 'Ink', 'White cloth'],
    affirmations: ['Wisdom reveals itself', 'Analysis leads to truth'],
  },
  12: {
    id: 'meji-irosi-001',
    name: 'Meji-Irosi',
    namePt: 'Meji-Irosi - A Duplicação',
    nameEn: 'Meji-Irosi - The Duplication',
    symbol: '☲☰',
    yoruba: 'Ìrósì Méjì',
    meaning: 'Duplicação, misericórdia, graça',
    meaningPt: 'Meji-Irosi representa a duplicação, misericórdia, graça divina e compaixão.',
    meaningEn: 'Meji-Irosi symbolizes duplication, mercy, divine grace, and compassion.',
    spiritualGuidance: ['Show compassion to all', 'Receive divine grace', 'Embrace mercy'],
    keywords: ['duplicação', 'misericórdia', 'graça', 'compaixão', 'divino'],
    elements: ['Luz Divina', 'Pombo', 'Abraão'],
    colors: ['#FFFFFF', '#87CEEB', '#F0F8FF'],
    dayOfWeek: 'Domingo',
    rulingOrishas: ['Olódùmarè', 'Obatala', 'Yemoja'],
    sacredNumbers: [2, 17, 34, 51],
    greeting: 'Mercy flows from above!',
    rituals: ['Compassion ceremonies', 'Dove offerings', 'Light rituals'],
    offerings: ['White dove', 'Milk', 'Snow-white cloth'],
    affirmations: ['Grace embraces me', 'Compassion guides my heart'],
  },
  13: {
    id: 'meji-ode-001',
    name: 'Meji-Ode',
    namePt: 'Meji-Ode - A Duplicação',
    nameEn: 'Meji-Ode - The Duplication',
    symbol: '☱☰',
    yoruba: 'Òdé Méjì',
    meaning: 'Duplicação, caça, busca',
    meaningPt: 'Meji-Ode representa a duplicação, caça, busca e perseguição de objetivos.',
    meaningEn: 'Meji-Ode symbolizes duplication, hunting, seeking, and pursuit of goals.',
    spiritualGuidance: ['Pursue your goals with focus', 'Hunt your dreams', 'Trust your aim'],
    keywords: ['duplicação', 'caça', 'busca', 'objetivos', 'perseguição'],
    elements: ['Flecha', 'Arco', 'Floresta'],
    colors: ['#8B4513', '#A0522D', '#D2691E'],
    dayOfWeek: 'Terça-feira',
    rulingOrishas: ['Olódùmarè', 'Ogun', 'Oshosi'],
    sacredNumbers: [2, 18, 36, 54],
    greeting: 'Target achieved!',
    rituals: ['Hunting rituals', 'Arrow ceremonies', 'Goal-setting practices'],
    offerings: ['Arrows', 'Hunting horn', 'Meat'],
    affirmations: ['My goals are achieved', 'Focus guides my aim'],
  },
  14: {
    id: 'meji-iledin-001',
    name: 'Meji-Iledin',
    namePt: 'Meji-Iledin - A Duplicação',
    nameEn: 'Meji-Iledin - The Duplication',
    symbol: '☰☲',
    yoruba: 'Ìlédìn Méjì',
    meaning: 'Duplicação, sabedoria ancestral',
    meaningPt: 'Meji-Iledin representa a duplicação, sabedoria ancestral, tradição e continuidade.',
    meaningEn: 'Meji-Iledin symbolizes duplication, ancestral wisdom, tradition, and continuity.',
    spiritualGuidance: ['Honor ancestral wisdom', 'Embrace tradition', 'Continue the legacy'],
    keywords: ['duplicação', 'ancestral', 'tradição', 'sabedoria', 'legado'],
    elements: ['Raízes', 'Terra Ancestral', 'Memória'],
    colors: ['#8B4513', '#6B8E23', '#556B2F'],
    dayOfWeek: 'Domingo',
    rulingOrishas: ['Olódùmarè', 'Obatala', 'Orunmila'],
    sacredNumbers: [2, 19, 38, 56],
    greeting: 'Traditions guide us!',
    rituals: ['Ancestral ceremonies', 'Tradition rituals', 'Legacy honoring'],
    offerings: ['Root vegetables', 'Earth from homeland', 'Family artifacts'],
    affirmations: ['Ancestral wisdom guides me', 'Tradition honors my path'],
  },
  15: {
    id: 'meji-ozuzu-001',
    name: 'Meji-Ozuzu',
    namePt: 'Meji-Ozuzu - A Duplicação',
    nameEn: 'Meji-Ozuzu - The Duplication',
    symbol: '☵☱',
    yoruba: 'Òzùzù Méjì',
    meaning: 'Duplicação, água, movimento',
    meaningPt: 'Meji-Ozuzu representa a duplicação, água, movimento, fluidez e transformação.',
    meaningEn: 'Meji-Ozuzu symbolizes duplication, water, movement, fluidity, and transformation.',
    spiritualGuidance: ['Flow like water', 'Embrace change', 'Adapt with grace'],
    keywords: ['duplicação', 'água', 'movimento', 'fluidez', 'transformação'],
    elements: ['Água Corrente', 'Rio', 'Maré'],
    colors: ['#00CED1', '#20B2AA', '#40E0D0'],
    dayOfWeek: 'Quinta-feira',
    rulingOrishas: ['Olódùmarè', 'Olokun', 'Yemoja'],
    sacredNumbers: [2, 20, 40, 60],
    greeting: 'Water finds its way!',
    rituals: ['River ceremonies', 'Water offerings', 'Flow meditation'],
    offerings: ['Seashells', 'Ocean water', 'Blue cloth'],
    affirmations: ['I flow like water', 'Adaptation is my strength'],
  },
  16: mejiIyonuData,
};

/**
 * GET /api/meji-iyonu/data
 * Returns Meji-Iyonu-related data including Meji-Iyonu Odu and associated spiritual values
 * Supports query parameters: type, numero, nome
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const numero = url.searchParams.get('numero');
  const nome = url.searchParams.get('nome');

  // Get single Odu by number
  if (numero) {
    const num = parseInt(numero, 10);
    const odu = mejiOdusData[num];

    if (!odu) {
      return NextResponse.json(
        { error: 'Odu not found', numero: num },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: odu });
  }

  // Get single Odu by name
  if (nome) {
    const odu = Object.values(mejiOdusData).find((o) =>
      o.name.toLowerCase() === nome.toLowerCase()
    );

    if (!odu) {
      return NextResponse.json(
        { error: 'Odu not found', nome },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: odu });
  }

  const odus = Object.values(mejiOdusData);

  switch (type) {
    case 'all':
      return NextResponse.json({ data: odus });

    case 'meji-iyonu':
      return NextResponse.json({ data: mejiIyonuData });

    case 'names':
      return NextResponse.json({
        data: odus.map((o) => ({ numero: o.id, name: o.name })),
      });

    case 'elements':
      return NextResponse.json({
        data: odus.map((o) => ({ name: o.name, elements: o.elements })),
      });

    case 'colors':
      return NextResponse.json({
        data: odus.map((o) => ({ name: o.name, colors: o.colors })),
      });

    case 'rituals':
      return NextResponse.json({
        data: odus.map((o) => ({ name: o.name, rituals: o.rituals })),
      });

    case 'offerings':
      return NextResponse.json({
        data: odus.map((o) => ({ name: o.name, offerings: o.offerings })),
      });

    case 'affirmations':
      return NextResponse.json({
        data: odus.map((o) => ({ name: o.name, affirmations: o.affirmations })),
      });

    default:
      return NextResponse.json({ data: mejiIyonuData });
  }
}