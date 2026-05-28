// Meji-Osetura API - Cabala Dos Caminhos
// GET endpoints for Meji-Osetura Odu spiritual data

import { NextResponse } from 'next/server';

// Meji-Osetura data structure based on Ifá lore
interface MejiOseturaData {
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

const mejiOseturaData: MejiOseturaData = {
  id: 'meji-osetura-001',
  name: 'Meji-Osetura',
  namePt: 'Meji-Osetura - A Duplicação',
  nameEn: 'Meji-Osetura - The Duplication',
  symbol: '☰☰',
  yoruba: 'Òsétùrá Méjì',
  meaning: 'Meji-Osetura',
  meaningPt: 'Meji-Osetura representa a duplicação, proteção, refúgio, escuridão sagrada e sabedoria oculta. É o Odu da proteção espiritual e do conhecimento dos mistérios.',
  meaningEn: 'Meji-Osetura symbolizes duplication, protection, refuge, sacred darkness, and hidden wisdom. It is the Odu of spiritual protection and knowledge of mysteries.',
  spiritualGuidance: [
    'Seek sanctuary in sacred darkness',
    'Trust in protective forces that guard you',
    'Embrace the wisdom found in shadows',
    'Find strength in solitude and reflection',
    'Understand that darkness holds divine secrets',
  ],
  keywords: ['duplicação', 'proteção', 'refúgio', 'escuridão', 'sagrado', 'mistério', 'oculto'],
  elements: ['Escuridão', 'Noite', 'Santuário', 'Sombra'],
  colors: ['#1a1a2e', '#16213e', '#0f3460', '#1a1a1a'],
  dayOfWeek: 'Segunda-feira',
  rulingOrishas: ['Olódùmarè', 'Osetura', 'Osain', 'Ogbono'],
  sacredNumbers: [2, 7, 14, 28],
  greeting: 'Darkness protects the seeker!',
  rituals: [
    'Night meditation rituals',
    'Protection ceremonies under starlight',
    'Shadow journey practices',
    'Sanctuary building rituals',
    'Mystery revelation ceremonies',
  ],
  offerings: [
    'Black candle',
    'Charcoal',
    'Dark cloth',
    'Sacred earth',
    'Palm wine',
  ],
  affirmations: [
    'I am protected by sacred darkness',
    'My sanctuary is unbreakable',
    'Wisdom flows from shadows to me',
    'I embrace the protective night',
    'Mystery reveals its secrets to me',
  ],
};

// Combined 16 Meji Odus with Meji-Osetura as Odu 3 and 11
const mejiOseturasData: Record<number, MejiOseturaData> = {
  1: {
    id: 'meji-ogbe-001',
    name: 'Meji-Ogbe',
    namePt: 'Meji-Ogbe - A Duplicação',
    nameEn: 'Meji-Ogbe - The Duplication',
    symbol: '☰☰',
    yoruba: 'Ògùndá Méjì',
    meaning: 'Duplicação, reflexão, espelho',
    meaningPt: 'Meji-Ogbe representa a duplicação, reflexão, espelho, dualidade, parceria e harmonia conjugal.',
    meaningEn: 'Meji-Ogbe symbolizes duplication, reflection, mirror, duality, partnership, and marital harmony.',
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
    spiritualGuidance: ['Seek truth within the depths', 'Trust in hidden wisdom', 'Embrace the unknown'],
    keywords: ['duplicação', 'mistério', 'sabedoria', 'oculto', 'revelação'],
    elements: ['Terra', 'Água Subterrânea', 'Cristal'],
    colors: ['#8B4513', '#2F4F4F', '#191970'],
    dayOfWeek: 'Terça-feira',
    rulingOrishas: ['Olódùmarè', 'Orunmila', 'Ogbono'],
    sacredNumbers: [2, 7, 14, 28],
    greeting: 'Mystery reveals truth!',
    rituals: ['Deep meditation', 'Sacred text consultation', 'Water purification'],
    offerings: ['Palm wine', 'Honey', 'Earth from sacred grounds'],
    affirmations: ['I embrace the mystery with courage', 'Wisdom flows to me from the depths'],
  },
  3: mejiOseturaData,
  4: {
    id: 'meji-irosun-001',
    name: 'Meji-Irosun',
    namePt: 'Meji-Irosun - A Duplicação',
    nameEn: 'Meji-Irosun - The Duplication',
    symbol: '☰☲',
    yoruba: 'Ìrosùn Méjì',
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
    meaningPt: 'Meji-Owonrin representa a duplicação, vento, mudança e movimento constante.',
    meaningEn: 'Meji-Owonrin symbolizes duplication, wind, change, and constant movement.',
    spiritualGuidance: ['Embrace change', 'Go with the flow', 'Trust the wind'],
    keywords: ['duplicação', 'vento', 'mudança', 'movimento', 'adaptação'],
    elements: ['Vento', 'Ar', 'Pena'],
    colors: ['#87CEEB', '#E0FFFF', '#ADD8E6'],
    dayOfWeek: 'Sexta-feira',
    rulingOrishas: ['Olódùmarè', 'Owonrin', 'Olokun'],
    sacredNumbers: [2, 10, 20, 30],
    greeting: 'Wind carries change!',
    rituals: ['Wind rituals', 'Breathing exercises', 'Movement practices'],
    offerings: ['Feathers', 'Incense', 'Blue cloth'],
    affirmations: ['I embrace change with grace', 'I flow with the wind'],
  },
  6: {
    id: 'meji-obara-001',
    name: 'Meji-Obara',
    namePt: 'Meji-Obara - A Duplicação',
    nameEn: 'Meji-Obara - The Duplication',
    symbol: '☰☳',
    yoruba: 'Òbàrà Méjì',
    meaning: 'Duplicação, justiça, verdade',
    meaningPt: 'Meji-Obara representa a duplicação, justiça, verdade e integridade moral.',
    meaningEn: 'Meji-Obara symbolizes duplication, justice, truth, and moral integrity.',
    spiritualGuidance: ['Seek truth', 'Practice justice', 'Live with integrity'],
    keywords: ['duplicação', 'justiça', 'verdade', 'integridade', 'moral'],
    elements: ['Raio', 'Força', 'Tempestade'],
    colors: ['#FFD700', '#FF8C00', '#DAA520'],
    dayOfWeek: 'Quinta-feira',
    rulingOrishas: ['Olódùmarè', 'Shango', 'Obara'],
    sacredNumbers: [2, 5, 13, 21],
    greeting: 'Truth prevails!',
    rituals: ['Justice rituals', 'Truth ceremonies', 'Oath-taking'],
    offerings: ['Coconut', 'Honey', 'Yellow cloth'],
    affirmations: ['I speak truth', 'I live with integrity'],
  },
  7: {
    id: 'meji-okan-001',
    name: 'Meji-Okan',
    namePt: 'Meji-Okan - A Duplicação',
    nameEn: 'Meji-Okan - The Duplication',
    symbol: '☰☵',
    yoruba: 'Òkàn Méjì',
    meaning: 'Duplicação, coração, emoção',
    meaningPt: 'Meji-Okan representa a duplicação, coração, emoção e conexões emocionais profundas.',
    meaningEn: 'Meji-Okan symbolizes duplication, heart, emotion, and deep emotional connections.',
    spiritualGuidance: ['Follow your heart', 'Embrace emotions', 'Connect deeply'],
    keywords: ['duplicação', 'coração', 'emoção', 'amor', 'conexão'],
    elements: ['Coração', 'Sangue', 'Fogo Interior'],
    colors: ['#DC143C', '#FF69B4', '#FFB6C1'],
    dayOfWeek: 'Terça-feira',
    rulingOrishas: ['Olódùmarè', 'Obatala', 'Yemoja'],
    sacredNumbers: [2, 6, 14, 22],
    greeting: 'Heart speaks!',
    rituals: ['Heart ceremonies', 'Love rituals', 'Emotional healing'],
    offerings: ['Rose', 'Red wine', 'Heart-shaped items'],
    affirmations: ['I follow my heart', 'I embrace all emotions'],
  },
  8: {
    id: 'meji-ose-001',
    name: 'Meji-Ose',
    namePt: 'Meji-Ose - A Duplicação',
    nameEn: 'Meji-Ose - The Duplication',
    symbol: '☰☶',
    yoruba: 'Òsè Méjì',
    meaning: 'Duplicação, governança, liderança',
    meaningPt: 'Meji-Ose representa a duplicação, governança, liderança e autoridade espiritual.',
    meaningEn: 'Meji-Ose symbolizes duplication, governance, leadership, and spiritual authority.',
    spiritualGuidance: ['Lead with wisdom', 'Govern with compassion', 'Embrace authority responsibly'],
    keywords: ['duplicação', 'governança', 'liderança', 'autoridade', 'sabedoria'],
    elements: ['Trono', 'Coroa', 'Cetro'],
    colors: ['#FFD700', '#800000', '#4B0082'],
    dayOfWeek: 'Domingo',
    rulingOrishas: ['Olódùmarè', 'Ose', 'Obatala'],
    sacredNumbers: [2, 4, 10, 20],
    greeting: 'Leadership prevails!',
    rituals: ['Coronation rituals', 'Authority ceremonies', 'Leadership meditations'],
    offerings: ['Golden crown', 'Royal cloth', 'Sacred oil'],
    affirmations: ['I lead with wisdom', 'My authority serves all'],
  },
  9: {
    id: 'meji-ogbe-002',
    name: 'Meji-Ogbe II',
    namePt: 'Meji-Ogbe II - A Duplicação',
    nameEn: 'Meji-Ogbe II - The Duplication',
    symbol: '☰☰',
    yoruba: 'Ògùndá Méjì',
    meaning: 'Duplicação, expansão, abundância',
    meaningPt: 'Meji-Ogbe II representa a duplicação, expansão, abundância e prosperidade.',
    meaningEn: 'Meji-Ogbe II symbolizes duplication, expansion, abundance, and prosperity.',
    spiritualGuidance: ['Embrace abundance', 'Expand your horizons', 'Trust prosperity'],
    keywords: ['duplicação', 'expansão', 'abundância', 'prosperidade', 'crescimento'],
    elements: ['Terra Fértil', 'Chuva', 'Semente'],
    colors: ['#228B22', '#90EE90', '#32CD32'],
    dayOfWeek: 'Segunda-feira',
    rulingOrishas: ['Olódùmarè', 'Ogun', 'Oshe'],
    sacredNumbers: [2, 8, 16, 24],
    greeting: 'Abundance flows!',
    rituals: ['Harvest rituals', 'Planting ceremonies', 'Prosperity prayers'],
    offerings: ['Seeds', 'Fertile soil', 'Green cloth'],
    affirmations: ['I am abundant', 'Prosperity is my birthright'],
  },
  10: {
    id: 'meji-odi-002',
    name: 'Meji-Odi II',
    namePt: 'Meji-Odi II - A Duplicação',
    nameEn: 'Meji-Odi II - The Duplication',
    symbol: '☰☷',
    yoruba: 'Òdí Méjì',
    meaning: 'Duplicação, sabedoria oculta, destino',
    meaningPt: 'Meji-Odi II representa a duplicação, sabedoria oculta e destino revelado.',
    meaningEn: 'Meji-Odi II symbolizes duplication, hidden wisdom, and revealed destiny.',
    spiritualGuidance: ['Unlock hidden wisdom', 'Reveal your destiny', 'Trust the mystery'],
    keywords: ['duplicação', 'sabedoria', 'oculto', 'destino', 'revelação'],
    elements: ['Caverna', 'Sombra', 'Mistério'],
    colors: ['#2F4F4F', '#000080', '#191970'],
    dayOfWeek: 'Terça-feira',
    rulingOrishas: ['Olódùmarè', 'Orunmila', 'Egungun'],
    sacredNumbers: [2, 7, 15, 23],
    greeting: 'Destiny reveals!',
    rituals: ['Ancestor rituals', 'Shadow work', 'Mystery ceremonies'],
    offerings: ['Black candle', 'Earth', 'Obsidian'],
    affirmations: ['My destiny is clear', 'Wisdom emerges from shadow'],
  },
  11: {
    id: 'meji-osetura-002',
    name: 'Meji-Osetura II',
    namePt: 'Meji-Osetura II - A Duplicação',
    nameEn: 'Meji-Osetura II - The Duplication',
    symbol: '☰☰',
    yoruba: 'Òsétùrá Méjì',
    meaning: 'Duplicação, proteção sagrada, refúgio divino',
    meaningPt: 'Meji-Osetura II representa a duplicação, proteção sagrada, refúgio divino e sabedoria das sombras.',
    meaningEn: 'Meji-Osetura II symbolizes duplication, sacred protection, divine refuge, and shadow wisdom.',
    spiritualGuidance: ['Seek divine protection', 'Find refuge in darkness', 'Embrace hidden wisdom'],
    keywords: ['duplicação', 'proteção', 'sagrado', 'refúgio', 'escuridão', 'sabedoria'],
    elements: ['Noite Estrelada', 'Santuário', 'Manto de Proteção'],
    colors: ['#0d1b2a', '#1b263b', '#415a77', '#778da9'],
    dayOfWeek: 'Segunda-feira',
    rulingOrishas: ['Olódùmarè', 'Osetura', 'Egungun', 'Osain'],
    sacredNumbers: [2, 11, 22, 33],
    greeting: 'Protection surrounds you!',
    rituals: ['Night vigil rituals', 'Protection ceremonies', 'Shadow work'],
    offerings: ['Starlight water', 'Dark crystals', 'Night-blooming flowers'],
    affirmations: ['I am divinely protected', 'My sanctuary is in sacred darkness'],
  },
  12: {
    id: 'meji-irosun-002',
    name: 'Meji-Irosun II',
    namePt: 'Meji-Irosun II - A Duplicação',
    nameEn: 'Meji-Irosun II - The Duplication',
    symbol: '☰☲',
    yoruba: 'Ìrosùn Méjì',
    meaning: 'Duplicação, cura profunda, transformação radical',
    meaningPt: 'Meji-Irosun II representa a duplicação, cura profunda e transformação radical da alma.',
    meaningEn: 'Meji-Irosun II symbolizes duplication, deep healing, and radical soul transformation.',
    spiritualGuidance: ['Embrace profound healing', 'Transform completely', 'Trust the rebirth'],
    keywords: ['duplicação', 'cura', 'profunda', 'transformação', 'renascimento'],
    elements: ['Fogo Renovador', 'Água Purificadora', 'Ar Transformador'],
    colors: ['#FF4500', '#FF6347', '#FFA07A'],
    dayOfWeek: 'Domingo',
    rulingOrishas: ['Olódùmarè', 'Irosun', 'Osain', 'Obatala'],
    sacredNumbers: [2, 9, 18, 27],
    greeting: 'Transformation awaits!',
    rituals: ['Rebirth ceremonies', 'Deep healing rituals', 'Purification practices'],
    offerings: ['Sacred herbs', 'Purified water', 'Light candles'],
    affirmations: ['I am reborn', 'Deep healing flows through me'],
  },
  13: {
    id: 'meji-owonrin-002',
    name: 'Meji-Owonrin II',
    namePt: 'Meji-Owonrin II - A Duplicação',
    nameEn: 'Meji-Owonrin II - The Duplication',
    symbol: '☰☴',
    yoruba: 'Òwónrín Méjì',
    meaning: 'Duplicação, mudança rápida, transformação do vento',
    meaningPt: 'Meji-Owonrin II representa a duplicação, mudança rápida e transformação acelerada.',
    meaningEn: 'Meji-Owonrin II symbolizes duplication, rapid change, and accelerated transformation.',
    spiritualGuidance: ['Embrace rapid change', 'Flow with the storm', 'Transform swiftly'],
    keywords: ['duplicação', 'mudança', 'rápida', 'vento', 'tempestade', 'transformação'],
    elements: ['Tempestade', 'Relâmpago', 'Vento Forte'],
    colors: ['#B0C4DE', '#708090', '#2F4F4F'],
    dayOfWeek: 'Sexta-feira',
    rulingOrishas: ['Olódùmarè', 'Owonrin', 'Olokun', 'Oya'],
    sacredNumbers: [2, 10, 20, 30],
    greeting: 'Storm brings transformation!',
    rituals: ['Storm rituals', 'Lightning ceremonies', 'Wind prayers'],
    offerings: ['Feathers', 'Storm water', 'Lightning stone'],
    affirmations: ['I embrace rapid change', 'Transformation flows swiftly through me'],
  },
  14: {
    id: 'meji-obara-002',
    name: 'Meji-Obara II',
    namePt: 'Meji-Obara II - A Duplicação',
    nameEn: 'Meji-Obara II - The Duplication',
    symbol: '☰☳',
    yoruba: 'Òbàrà Méjì',
    meaning: 'Duplicação, justiça divina, verdade revelada',
    meaningPt: 'Meji-Obara II representa a duplicação, justiça divina e verdade revelada aos justos.',
    meaningEn: 'Meji-Obara II symbolizes duplication, divine justice, and truth revealed to the righteous.',
    spiritualGuidance: ['Seek divine justice', 'Stand in truth', 'Trust divine law'],
    keywords: ['duplicação', 'justiça', 'divina', 'verdade', 'lei', 'retidão'],
    elements: ['Raio Divino', 'Escala da Justiça', 'Luz da Verdade'],
    colors: ['#FFD700', '#FFA500', '#DAA520'],
    dayOfWeek: 'Quinta-feira',
    rulingOrishas: ['Olódùmarè', 'Shango', 'Obara', 'Ogun'],
    sacredNumbers: [2, 5, 13, 21],
    greeting: 'Divine justice prevails!',
    rituals: ['Justice ceremonies', 'Truth revelation rituals', 'Divine law prayers'],
    offerings: ['Coconut', 'Honey', 'Gold cloth'],
    affirmations: ['Divine justice is my shield', 'Truth illuminates my path'],
  },
  15: {
    id: 'meji-okan-002',
    name: 'Meji-Okan II',
    namePt: 'Meji-Okan II - A Duplicação',
    nameEn: 'Meji-Okan II - The Duplication',
    symbol: '☰☵',
    yoruba: 'Òkàn Méjì',
    meaning: 'Duplicação, amor profundo, conexão espiritual',
    meaningPt: 'Meji-Okan II representa a duplicação, amor profundo e conexão espiritual entre almas.',
    meaningEn: 'Meji-Okan II symbolizes duplication, deep love, and spiritual connection between souls.',
    spiritualGuidance: ['Love deeply', 'Connect spiritually', 'Honor soul bonds'],
    keywords: ['duplicação', 'amor', 'profundo', 'conexão', 'espiritual', 'alma'],
    elements: ['Amor Divino', 'Fogo do Coração', 'União de Almas'],
    colors: ['#FF1493', '#FF69B4', '#DB7093'],
    dayOfWeek: 'Terça-feira',
    rulingOrishas: ['Olódùmarè', 'Yemoja', 'Obatala', 'Oxum'],
    sacredNumbers: [2, 6, 14, 22],
    greeting: 'Souls unite in love!',
    rituals: ['Love ceremonies', 'Soul connection rituals', 'Heart union practices'],
    offerings: ['Rose petals', 'Rose water', 'Pink candles'],
    affirmations: ['Deep love flows through me', 'My soul connects with others'],
  },
  16: {
    id: 'meji-ose-002',
    name: 'Meji-Ose II',
    namePt: 'Meji-Ose II - A Duplicação',
    nameEn: 'Meji-Ose II - The Duplication',
    symbol: '☰☶',
    yoruba: 'Òsè Méjì',
    meaning: 'Duplicação, maestria, domínio espiritual',
    meaningPt: 'Meji-Ose II representa a duplicação, maestria, domínio espiritual e governança iluminada.',
    meaningEn: 'Meji-Ose II symbolizes duplication, mastery, spiritual dominion, and enlightened governance.',
    spiritualGuidance: ['Master your path', 'Lead with enlightenment', 'Embrace spiritual dominion'],
    keywords: ['duplicação', 'maestria', 'domínio', 'espiritual', 'governança', 'iluminação'],
    elements: ['Trono Iluminado', 'Coroa de Luz', 'Cetro da Sabedoria'],
    colors: ['#FFD700', '#FF8C00', '#FFA500'],
    dayOfWeek: 'Domingo',
    rulingOrishas: ['Olódùmarè', 'Ose', 'Obatala', 'Orunmila'],
    sacredNumbers: [2, 4, 10, 20],
    greeting: 'Mastery is achieved!',
    rituals: ['Mastery ceremonies', 'Enlightenment practices', 'Spiritual dominion rituals'],
    offerings: ['Golden crown', 'Enlightened oil', 'Sacred light'],
    affirmations: ['I master my spiritual path', 'My governance serves all beings'],
  },
};

/**
 * GET /api/osetura-meji/data
 * Returns Meji-Osetura-related data including Meji-Osetura Odu and associated spiritual values
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
    const odu = mejiOseturasData[num];

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
    const odu = Object.values(mejiOseturasData).find((o) =>
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

  const odus = Object.values(mejiOseturasData);

  switch (type) {
    case 'all':
      return NextResponse.json({ data: odus });

    case 'meji-osetura':
      return NextResponse.json({ data: mejiOseturaData });

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
      return NextResponse.json({ data: mejiOseturaData });
  }
}