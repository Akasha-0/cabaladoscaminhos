// Irosun API - Cabala Dos Caminhos
// GET endpoints for Irosun Odu spiritual data

import { NextResponse } from 'next/server';

interface IrosunData {
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
  warnings: string[];
  blessings: string[];
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
  quizilas: string[];
  preceptos: string[];
  tipoEbo: string;
  chakra: string[];
  planeta: string[];
  tarot: string;
  sephirah: string;
}

const irosunData: IrosunData = {
  id: 'irosun-004',
  name: 'Irosun',
  namePt: 'Irosun - O Aviso',
  nameEn: 'Irosun - The Warning',
  symbol: '☳',
  yoruba: 'Ìrosùn',
  meaning: 'O aviso, o sangue que corre nas veias, a visão espiritual. Olhar para o futuro.',
  meaningPt: 'Irosun é o Odu do Aviso — o mensageiro que chega antes da tempestade. Trazintuição aguda, visão espiritual e a capacidade de perceber o que está por vir. Este Odu fala do sangue que corre nas veias como canal de conhecimento ancestral, dos olhos que enxergam além do véu, e dos sonhos que advertem antes que o perigo se materialize.',
  meaningEn: 'Irosun is the Odu of Warning — the messenger that arrives before the storm. It brings sharp intuition, spiritual vision, and the ability to perceive what lies ahead. This Odu speaks of blood running through veins as a channel of ancestral knowledge, eyes that see beyond the veil, and dreams that warn before danger materializes.',
  spiritualGuidance: [
    'Trust your intuition when it whispers warnings; dismiss nothing as mere imagination.',
    'Pay attention to recurring dreams and signs — they carry messages from beyond.',
    'Develop your spiritual vision through meditation and connection with your ancestors.',
    'The blood carries memory; honor your lineage and its accumulated wisdom.',
    'Listen to the whispers before they become screams.',
  ],
  warnings: [
    'Ignoring clear warning signs leads to preventable suffering and loss.',
    'Dismissing intuition as paranoia blinds the seeker to real danger.',
    'Lying, especially about spiritual matters, compounds consequences severely.',
    'Looking into voids and empty spaces invites negative attention.',
    'Wearing excessive red during crisis periods can attract imbalance.',
  ],
  blessings: [
    'Enhanced spiritual vision and prophetic intuition',
    'Protection through advance warning and premonition',
    'Deep connection with Iemanjá for emotional and spiritual clarity',
    'Guidance from Oshosi for seeing what is hidden',
    'The wisdom to heed messages before they become crises',
  ],
  keywords: ['aviso', 'visão', 'intuição', 'sangue', 'profecia', 'proteção espiritual'],
  elements: ['Fogo', 'Terra'],
  colors: ['#8B0000', '#DC143C', '#B22222'],
  dayOfWeek: 'Terça-feira',
  rulingOrishas: ['Iemanjá', 'Oxóssi', 'Egum'],
  sacredNumbers: [4, 8, 12, 16],
  greeting: 'Warnings reveal!',
  rituals: [
    'Offer white foods to Iemanjá at the seashore under moonlight',
    'Light crimson candles while meditating on ancestral guidance',
    'Perform cleansing rituals with cold leaf baths (colônia, saião)',
    'Place canjica at the water\'s edge for Iemanjá',
    'Practice dream journaling to receive and interpret warnings',
  ],
  offerings: [
    'White foods (akara, white yam, canjica)',
    'Crimson candles',
    'Sea water',
    'Palm oil',
    'Fresh flowers in white and red',
  ],
  affirmations: [
    'I trust my intuition to guide me away from harm',
    'My spiritual vision grows stronger with each day',
    'I honor my ancestors by heeding their warnings',
    'The blood in my veins carries ancient wisdom',
    'I see clearly what others may miss',
  ],
  quizilas: [
    'Olhar para buracos vazios',
    'Usar roupas muito vermelhas em momentos de crise',
    'Mentira',
  ],
  preceptos: [
    'Desenvolver a intuição',
    'Não ignorar avisos e sonhos',
    'Cuidar da saúde do sangue e dos olhos',
  ],
  tipoEbo: 'Ebó de Proteção',
  chakra: ['3º Plexo Solar'],
  planeta: ['Sol', 'Mercúrio'],
  tarot: 'O Imperador',
  sephirah: 'Chesed para Geburah (Equilíbrio da Lei)',
};

const irosunVariations: Record<string, IrosunData> = {
  'irosun-meji': { ...irosunData, id: 'irosun-004-meji', name: 'Irosun Meji', namePt: 'Irosun Meji - Duplo Aviso' },
  'irosun-yeku': { ...irosunData, id: 'irosun-004-yeku', name: 'Irosun Yeku', namePt: 'Irosun Yeku - Aviso Invertido' },
  'irosun-iwori': { ...irosunData, id: 'irosun-004-iwori', name: 'Irosun Iwori', namePt: 'Irosun Iwori - Aviso com Iwori' },
  'irosun-odi': { ...irosunData, id: 'irosun-004-odi', name: 'Irosun Odi', namePt: 'Irosun Odi - Aviso com Odi' },
  'irosun-ogbe': { ...irosunData, id: 'irosun-004-ogbe', name: 'Irosun Ogbe', namePt: 'Irosun Ogbe - Aviso com Ogbe' },
  'irosun-owonrin': { ...irosunData, id: 'irosun-004-owonrin', name: 'Irosun Owonrin', namePt: 'Irosun Owonrin - Aviso com Owonrin' },
  'irosun-obara': { ...irosunData, id: 'irosun-004-obara', name: 'Irosun Obara', namePt: 'Irosun Obara - Aviso com Obara' },
  'irosun-okanran': { ...irosunData, id: 'irosun-004-okanran', name: 'Irosun Okanran', namePt: 'Irosun Okanran - Aviso com Okanran' },
  'irosun-ogunda': { ...irosunData, id: 'irosun-004-ogunda', name: 'Irosun Ogunda', namePt: 'Irosun Ogunda - Aviso com Ogunda' },
  'irosun-osa': { ...irosunData, id: 'irosun-004-osa', name: 'Irosun Osa', namePt: 'Irosun Osa - Aviso com Osa' },
  'irosun-ika': { ...irosunData, id: 'irosun-004-ika', name: 'Irosun Ika', namePt: 'Irosun Ika - Aviso com Ika' },
};

const guidanceMessages = [
  'Luz interior revelando caminhos',
  'Mistérios do passado se manifestam',
  'Verdade emerge das sombras',
  'Proteção espiritual fortalece',
  'Caminho de redenção abre-se',
  'Sabedoria oculta revelada',
  'Ciclos de transformação ativa',
  'Conexão com ancestrais profunda',
];

const eboTypes = [
  'Ebo de purificação',
  'Ebo de proteção',
  'Ebo de revelação',
  'Ebo de transformação',
  'Ebo de conexão ancestral',
];

function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * GET /api/irosun/data
 * Returns Irosun-related data including Irosun Odu and associated spiritual values
 * Supports query parameters: type, variacao, guidance, ebo
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const variacao = searchParams.get('variacao');
  const numero = searchParams.get('numero');

  if (type === 'all') {
    return NextResponse.json({
      success: true,
      data: irosunData,
      meta: {
        total: 1,
        filter: 'irosun_main',
      },
    });
  }

  if (type === 'guidance') {
    const count = parseInt(searchParams.get('count') || '3', 10);
    return NextResponse.json({
      success: true,
      data: getRandomItems(guidanceMessages, Math.min(count, guidanceMessages.length)),
      meta: {
        filter: 'spiritual_guidance',
        odu: 'Irosun',
      },
    });
  }

  if (type === 'ebo') {
    const eboCount = parseInt(searchParams.get('count') || '2', 10);
    return NextResponse.json({
      success: true,
      data: {
        tipo: irosunData.tipoEbo,
        ebos: getRandomItems(eboTypes, Math.min(eboCount, eboTypes.length)),
      },
      meta: {
        filter: 'ebo_recommendations',
        odu: 'Irosun',
      },
    });
  }

  if (variacao && irosunVariations[variacao]) {
    return NextResponse.json({
      success: true,
      data: irosunVariations[variacao],
      meta: {
        filter: 'by_variacao',
        variacao,
      },
    });
  }

  if (variacao === 'all') {
    return NextResponse.json({
      success: true,
      data: irosunVariations,
      meta: {
        total: Object.keys(irosunVariations).length,
        filter: 'all_variations',
      },
    });
  }

  if (numero === '4') {
    return NextResponse.json({
      success: true,
      data: irosunData,
      meta: {
        filter: 'by_numero',
        numero: 4,
        odu: 'Irosun',
      },
    });
  }

  return NextResponse.json({
    success: true,
    data: irosunData,
    meta: {
      filter: 'default',
      odu: 'Irosun',
      significado: 'O Aviso / The Warning',
      numero: 4,
    },
  });
}