// ============================================================
// HERB DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for herb data
// - Retrieve all herbs
// - Retrieve single herb by ID
// - Retrieve herb categories
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface HerbCategory {
  name: string;
  description: string;
  weight: number;
}

// GET /api/herb/data - Get herb data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    const herbs = [
      {
        id: 'lavender',
        name: 'Lavender',
        namePt: 'Lavanda',
        element: 'Water',
        chakra: 'Third Eye',
        vibration: 6,
        properties: ['calming', 'purifying', 'protective'],
        uses: ['meditation', 'sleep', 'anxiety relief'],
      },
      {
        id: 'sage',
        name: 'Sage',
        namePt: 'Sálvia',
        element: 'Fire',
        chakra: 'Crown',
        vibration: 7,
        properties: ['purifying', 'cleansing', 'protective'],
        uses: ['smudging', 'energy clearing', 'spiritual rituals'],
      },
      {
        id: 'rosemary',
        name: 'Rosemary',
        namePt: 'Alecrim',
        element: 'Fire',
        chakra: 'Solar',
        vibration: 5,
        properties: ['energizing', 'protective', 'memory enhancing'],
        uses: ['clarity', 'protection', 'candle rituals'],
      },
      {
        id: 'mint',
        name: 'Mint',
        namePt: 'Hortelã',
        element: 'Air',
        chakra: 'Throat',
        vibration: 5,
        properties: ['refreshing', 'clarifying', 'healing'],
        uses: ['energy refresh', 'communication', 'prosperity'],
      },
      {
        id: 'chamomile',
        name: 'Chamomile',
        namePt: 'Camomila',
        element: 'Water',
        chakra: 'Heart',
        vibration: 6,
        properties: ['soothing', 'peaceful', 'harmonizing'],
        uses: ['peace rituals', 'sleep', 'emotional balance'],
      },
      {
        id: 'basil',
        name: 'Basil',
        namePt: 'Manjericão',
        element: 'Fire',
        chakra: 'Heart',
        vibration: 6,
        properties: ['protective', 'prosperity', 'love attracting'],
        uses: ['protection rituals', 'love spells', 'financial abundance'],
      },
      {
        id: 'mugwort',
        name: 'Mugwort',
        namePt: 'Artemísia',
        element: 'Water',
        chakra: 'Third Eye',
        vibration: 8,
        properties: ['intuitive', 'dream enhancing', 'psychic opening'],
        uses: ['divination', 'lucidity', 'spiritual journeys'],
      },
      {
        id: 'valerian',
        name: 'Valerian',
        namePt: 'Valeriana',
        element: 'Earth',
        chakra: 'Root',
        vibration: 4,
        properties: ['grounding', 'sedative', 'strengthening'],
        uses: ['deep meditation', 'root chakra work', 'stress relief'],
      },
      {
        id: 'eucalyptus',
        name: 'Eucalyptus',
        namePt: 'Eucalipto',
        element: 'Air',
        chakra: 'Throat',
        vibration: 5,
        properties: ['cleansing', 'healing', 'clarifying'],
        uses: ['energy cleansing', 'respiratory rituals', 'purification'],
      },
      {
        id: 'incense-cedar',
        name: 'Cedar',
        namePt: 'Cedro',
        element: 'Earth',
        chakra: 'Root',
        vibration: 5,
        properties: ['grounding', 'protective', 'spiritual cleansing'],
        uses: ['smudging', 'meditation', 'space clearing'],
      },
      {
        id: 'frankincense',
        name: 'Frankincense',
        namePt: 'Olibano',
        element: 'Fire',
        chakra: 'Crown',
        vibration: 9,
        properties: ['elevating', 'transcendent', 'sacred'],
        uses: ['sacred rituals', 'spiritual elevation', 'divine connection'],
      },
      {
        id: 'myrrh',
        name: 'Myrrh',
        namePt: 'Mirra',
        element: 'Earth',
        chakra: 'Heart',
        vibration: 8,
        properties: ['protective', 'healing', 'transformative'],
        uses: ['transformation rituals', 'protection', 'ancient ceremonies'],
      },
    ];

    // Return single herb by ID
    if (id) {
      const record = herbs.find((r) => r.id.toLowerCase() === id.toLowerCase());
      if (!record) {
        return NextResponse.json(
          { success: false, error: 'Herb not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: record });
    }

    // Return herb categories
    if (type === 'categories') {
      const categories: HerbCategory[] = [
        { name: 'calming', description: 'Herbs for relaxation, peace, and emotional balance', weight: 3 },
        { name: 'purifying', description: 'Herbs for cleansing energy and spaces', weight: 3 },
        { name: 'protective', description: 'Herbs for spiritual protection and warding', weight: 3 },
        { name: 'healing', description: 'Herbs for physical and energetic healing', weight: 2 },
        { name: 'psychic', description: 'Herbs for intuition, divination, and dream work', weight: 2 },
        { name: 'prosperity', description: 'Herbs for abundance and manifestation', weight: 2 },
        { name: 'love', description: 'Herbs for attraction and emotional work', weight: 2 },
        { name: 'sacred', description: 'Herbs for sacred ceremonies and rituals', weight: 2 },
      ];
      return NextResponse.json({ success: true, data: categories });
    }

    // Return herb records only
    if (type === 'records') {
      return NextResponse.json({ success: true, data: herbs });
    }

    // Default — return all herb data
    return NextResponse.json({
      success: true,
      data: {
        records: herbs,
        categories: [
          { name: 'calming', description: 'Herbs for relaxation, peace, and emotional balance', weight: 3 },
          { name: 'purifying', description: 'Herbs for cleansing energy and spaces', weight: 3 },
          { name: 'protective', description: 'Herbs for spiritual protection and warding', weight: 3 },
          { name: 'healing', description: 'Herbs for physical and energetic healing', weight: 2 },
          { name: 'psychic', description: 'Herbs for intuition, divination, and dream work', weight: 2 },
          { name: 'prosperity', description: 'Herbs for abundance and manifestation', weight: 2 },
          { name: 'love', description: 'Herbs for attraction and emotional work', weight: 2 },
          { name: 'sacred', description: 'Herbs for sacred ceremonies and rituals', weight: 2 },
        ] as HerbCategory[],
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch herb data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}