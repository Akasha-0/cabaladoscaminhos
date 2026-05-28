// Meji-Odi API - Cabala Dos Caminhos
// GET endpoints for Meji-Odi Odu spiritual data

import { NextResponse } from 'next/server';

// Meji-Odi data structure based on Ifá lore
interface MejiOdiData {
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

const mejiOdiData: MejiOdiData = {
  id: 'meji-odi-001',
  name: 'Meji-Odi',
  namePt: 'Meji-Odi - A Duplicação',
  nameEn: 'Meji-Odi - The Duplication',
  symbol: '☰☷',
  yoruba: 'Òdí Méjì',
  meaning: 'Meji-Odi',
  meaningPt: 'Meji-Odi representa a duplicação, mistério, sabedoria oculta, conhecimento profundo e revelação. É o Odu das revelações e do destino.',
  meaningEn: 'Meji-Odi symbolizes duplication, mystery, hidden wisdom, deep knowledge, and revelation. It is the Odu of revelations and destiny.',
  spiritualGuidance: [
    'Seek truth within the depths of mystery',
    'Trust in the wisdom that emerges from silence',
    'Embrace the unknown as a path to understanding',
    'Practice deep meditation to unlock hidden knowledge',
    'Honor the mysteries of life with reverence',
  ],
  keywords: ['duplicação', 'mistério', 'sabedoria', 'oculto', 'revelação', 'destino', 'conhecimento', 'profundeza'],
  elements: ['Terra', 'Água Subterrânea', 'Cristal'],
  colors: ['#8B4513', '#2F4F4F', '#191970'],
  dayOfWeek: 'Terça-feira',
  rulingOrishas: ['Olódùmarè', 'Orunmila', 'Ogbono'],
  sacredNumbers: [2, 7, 14, 28],
  greeting: 'Mystery reveals truth!',
  rituals: [
    'Deep meditation at midnight',
    'Consultation of sacred texts',
    'Ritual of water purification',
    'Offerings to the earth',
    'Divination practices',
  ],
  offerings: [
    'Palm wine',
    'Honey',
    'Earth from sacred grounds',
    'Black cloth',
    'Seeds',
  ],
  affirmations: [
    'I embrace the mystery with courage',
    'Wisdom flows to me from the depths',
    'I am open to hidden truths',
    'My destiny unfolds in divine timing',
    'I trust the process of revelation',
  ],
};

// Combined 16 Meji Odus with Meji-Odi as Odu 2
const mejiOdusData: Record<number, MejiOdiData> = {
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
  2: mejiOdiData,
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
  7: mejiOdiData,
  8: {
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
  9: {
    id: 'meji-ogbe-002',
    name: 'Meji-Ogbe',
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
    name: 'Meji-Odi',
    namePt: 'Meji-Odi II - A Duplicação',
    nameEn: 'Meji-Odi II - The Duplication',
    symbol: '☰☷',
    yoruba: 'Òdí Méjì',
    meaning: 'Duplicação, sabedoria oculta, destino',
    meaningPt: 'Meji-Odi II representa a duplicação, sabedoria oculta e destino revelado.',
    meaningEn: 'Meji-Odi II symbolizes duplication, hidden wisdom, and revealed destiny.',
    spiritualGuidance: ['Unlock hidden wisdom', 'Reveal your destiny', 'Trust the mystery'],
    keywords: ['duplicação', 'sabedoria', 'oculto', 'destino', 'revelação'],
    elements: ['Caverna', 'Shadow', 'Mistério'],
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
    id: 'meji-ogunda-002',
    name: 'Meji-Ogunda II',
    namePt: 'Meji-Ogunda II - A Duplicação',
    nameEn: 'Meji-Ogunda II - The Duplication',
    symbol: '☰☱',
    yoruba: 'Ògùndá Méjì',
    meaning: 'Duplicação, conquista, vitória',
    meaningPt: 'Meji-Ogunda II representa a duplicação, conquista, vitória e superação de obstáculos.',
    meaningEn: 'Meji-Ogunda II symbolizes duplication, conquest, victory, and overcoming obstacles.',
    spiritualGuidance: ['Conquer your challenges', 'Claim victory', 'Overcome obstacles'],
    keywords: ['duplicação', 'conquista', 'vitória', 'força', 'superação'],
    elements: ['Montanha', 'Pedra', 'Força'],
    colors: ['#8B4513', '#A0522D', '#D2691E'],
    dayOfWeek: 'Quarta-feira',
    rulingOrishas: ['Olódùmarè', 'Ogun', 'Shango'],
    sacredNumbers: [2, 4, 12, 20],
    greeting: 'Victory is ours!',
    rituals: ['Victory ceremonies', 'Strength rituals', 'Mountain meditations'],
    offerings: ['Iron', 'Hot pepper', 'Brown cloth'],
    affirmations: ['I overcome all obstacles', 'Victory is my portion'],
  },
  12: {
    id: 'meji-irosun-002',
    name: 'Meji-Irosun II',
    namePt: 'Meji-Irosun II - A Duplicação',
    nameEn: 'Meji-Irosun II - The Duplication',
    symbol: '☰☲',
    yoruba: 'Òdí Méjì',
    meaning: 'Duplicação, contemplação, visão',
    meaningPt: 'Meji-Irosun II representa a duplicação, contemplação, visão interior e discernimento.',
    meaningEn: 'Meji-Irosun II symbolizes duplication, contemplation, inner vision, and discernment.',
    spiritualGuidance: ['See beyond the surface', 'Contemplate deeply', 'Trust your vision'],
    keywords: ['duplicação', 'visão', 'contemplação', 'discernimento', 'sabedoria'],
    elements: ['Olho', 'Luz Interior', 'Insight'],
    colors: ['#4B0082', '#9400D3', '#8A2BE2'],
    dayOfWeek: 'Domingo',
    rulingOrishas: ['Olódùmarè', 'Orunmila', 'Osain'],
    sacredNumbers: [2, 3, 11, 21],
    greeting: 'Vision clears!',
    rituals: ['Vision quests', 'Third eye meditations', 'Inner light rituals'],
    offerings: ['Purple cloth', 'Herbs', 'Mirror'],
    affirmations: ['I see clearly', 'My vision is true'],
  },
  13: {
    id: 'meji-owonrin-002',
    name: 'Meji-Owonrin II',
    namePt: 'Meji-Owonrin II - A Duplicação',
    nameEn: 'Meji-Owonrin II - The Duplication',
    symbol: '☰☴',
    yoruba: 'Òwónrín Méjì',
    meaning: 'Duplicação, navegação, travessia',
    meaningPt: 'Meji-Owonrin II representa a duplicação, navegação, travessia e jornada espiritual.',
    meaningEn: 'Meji-Owonrin II symbolizes duplication, navigation, crossing, and spiritual journey.',
    spiritualGuidance: ['Navigate your path', 'Cross barriers', 'Journey forward'],
    keywords: ['duplicação', 'navegação', 'travessia', 'jornada', 'viagem'],
    elements: ['Mar', 'Vela', 'Bússola'],
    colors: ['#00008B', '#0000CD', '#4169E1'],
    dayOfWeek: 'Sexta-feira',
    rulingOrishas: ['Olódùmarè', 'Olokun', 'Owonrin'],
    sacredNumbers: [2, 9, 18, 27],
    greeting: 'Set sail!',
    rituals: ['Sea rituals', 'Navigation ceremonies', 'Journey prayers'],
    offerings: ['Shell', 'Blue cloth', 'Salt water'],
    affirmations: ['I navigate with confidence', 'My journey is blessed'],
  },
  14: {
    id: 'meji-obara-002',
    name: 'Meji-Obara II',
    namePt: 'Meji-Obara II - A Duplicação',
    nameEn: 'Meji-Obara II - The Duplication',
    symbol: '☰☳',
    yoruba: 'Òbàrà Méjì',
    meaning: 'Duplicação, retidão, equilíbrio',
    meaningPt: 'Meji-Obara II representa a duplicação, retidão, equilíbrio e harmonia social.',
    meaningEn: 'Meji-Obara II symbolizes duplication, righteousness, balance, and social harmony.',
    spiritualGuidance: ['Live righteously', 'Seek balance', 'Harmonize relationships'],
    keywords: ['duplicação', 'retidão', 'equilíbrio', 'harmonia', 'justiça'],
    elements: ['Balança', 'Lei', 'Ordem'],
    colors: ['#FF8C00', '#FFD700', '#F0E68C'],
    dayOfWeek: 'Quinta-feira',
    rulingOrishas: ['Olódùmarè', 'Shango', 'Obatala'],
    sacredNumbers: [2, 5, 13, 21],
    greeting: 'Balance reigns!',
    rituals: ['Balance rituals', 'Justice ceremonies', 'Harmony prayers'],
    offerings: ['Scale', 'Yellow cloth', 'Honey'],
    affirmations: ['I live in balance', 'Harmony surrounds me'],
  },
  15: {
    id: 'meji-okan-002',
    name: 'Meji-Okan II',
    namePt: 'Meji-Okan II - A Duplicação',
    nameEn: 'Meji-Okan II - The Duplication',
    symbol: '☰☵',
    yoruba: 'Òkàn Méjì',
    meaning: 'Duplicação, compaixão, vínculo',
    meaningPt: 'Meji-Okan II representa a duplicação, compaixão, vínculo sagrado e amor incondicional.',
    meaningEn: 'Meji-Okan II symbolizes duplication, compassion, sacred bond, and unconditional love.',
    spiritualGuidance: ['Love unconditionally', 'Compassion flows', 'Sacred bonds form'],
    keywords: ['duplicação', 'compaixão', 'amor', 'vínculo', 'união'],
    elements: ['Abraço', 'Coração', 'Amor'],
    colors: ['#FF1493', '#FF69B4', '#FFB6C1'],
    dayOfWeek: 'Terça-feira',
    rulingOrishas: ['Olódùmarè', 'Yemoja', 'Oxum'],
    sacredNumbers: [2, 6, 14, 22],
    greeting: 'Love heals!',
    rituals: ['Love rituals', 'Compassion ceremonies', 'Bonding prayers'],
    offerings: ['Rose', 'Pink cloth', 'Honey'],
    affirmations: ['I love unconditionally', 'Compassion is my nature'],
  },
  16: {
    id: 'meji-odudua-001',
    name: 'Meji-Odudua',
    namePt: 'Meji-Odudua - A Duplicação',
    nameEn: 'Meji-Odudua - The Duplication',
    symbol: '☰☶',
    yoruba: 'Òdùduà Méjì',
    meaning: 'Duplicação, terra, fertilidade',
    meaningPt: 'Meji-Odudua representa a duplicação, terra, fertilidade, casamento e criação.',
    meaningEn: 'Meji-Odudua symbolizes duplication, earth, fertility, marriage, and creation.',
    spiritualGuidance: ['Honor the earth', 'Embrace fertility', 'Create life'],
    keywords: ['duplicação', 'terra', 'fertilidade', 'casamento', 'criação'],
    elements: ['Terra', 'Ciclo', 'Nutrição'],
    colors: ['#8B4513', '#D2691E', '#A0522D'],
    dayOfWeek: 'Segunda-feira',
    rulingOrishas: ['Olódùmarè', 'Odudua', 'Obatala'],
    sacredNumbers: [2, 4, 8, 16],
    greeting: 'Earth mother blesses!',
    rituals: ['Earth ceremonies', 'Fertility rituals', 'Creation prayers'],
    offerings: ['Soil', 'Seed', 'Brown cloth'],
    affirmations: ['I honor the earth', 'Fertility flows through me'],
  },
};

/**
 * GET /api/meji-odi/data
 * Returns Meji-Odi-related data including Meji-Odi Odu and associated spiritual values
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

    case 'meji-odi':
      return NextResponse.json({ data: mejiOdiData });

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
      return NextResponse.json({ data: mejiOdiData });
  }
}
