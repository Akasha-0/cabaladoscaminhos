// ============================================================
// FOOD SACRED API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for sacred food data
// - Retrieve all sacred foods
// - Retrieve single food by ID
// - Retrieve food categories
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
interface FoodCategory {
  name: string;
  description: string;
  weight: number;
}
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const FoodSacredQuerySchema = z.object({
  type: z.enum(['records', 'categories']).optional(),
  id: z.string().optional(),
});
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams();
    const parseResult = FoodSacredQuerySchema.safeParse({
      type: searchParams.get('type'),
      id: searchParams.get('id'),
    });
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { type, id } = parseResult.data;
    const sacredFoods = [
      {
        id: 'honey',
        name: 'Honey',
        namePt: 'Mel',
        element: 'Fire',
        chakra: 'Heart',
        vibration: 9,
        properties: ['sweetening', 'healing', 'preservative', 'sacred offering'],
        uses: ['ritual offering', 'medicine preparation', 'candle making', 'blessing ceremonies'],
        spiritualSignificance: 'Symbol of divine sweetness and the nectar of life. Ancient bees were believed to be messengers between worlds.',
      },
      {
        id: 'olive-oil',
        name: 'Olive Oil',
        namePt: 'Azeite',
        element: 'Earth',
        chakra: 'Heart',
        vibration: 8,
        properties: ['purifying', 'nourishing', 'sacred', 'illuminating'],
        uses: ['anointing', 'lamp rituals', 'healing salves', 'communion ceremonies'],
        spiritualSignificance: 'Sacred anointment oil used in initiations and blessing rituals across traditions. Represents wisdom and peace.',
      },
      {
        id: 'bread',
        name: 'Unleavened Bread',
        namePt: 'Pão Sem Levedura',
        element: 'Earth',
        chakra: 'Root',
        vibration: 6,
        properties: ['sustaining', 'wholesome', 'ceremonial', 'grounding'],
        uses: [' communion', 'Passover rituals', 'sacramental meals', 'altar offerings'],
        spiritualSignificance: 'Symbol of humility, simplicity, and the staff of life. Unleavened represents truth without pretense.',
      },
      {
        id: 'water',
        name: 'Sacred Water',
        namePt: 'Água Sagrada',
        element: 'Water',
        chakra: 'Third Eye',
        vibration: 9,
        properties: ['purifying', 'cleansing', 'life-giving', 'spiritual conduit'],
        uses: ['baptism', 'sprinkling rituals', 'altar cleansing', 'purification baths'],
        spiritualSignificance: 'The primordial element of purification. Carries blessings and is used to cleanse spaces, objects, and souls.',
      },
      {
        id: 'wine',
        name: 'Wine',
        namePt: 'Vinho',
        element: 'Fire',
        chakra: 'Heart',
        vibration: 8,
        properties: ['transformation', 'joy', 'communion', 'celebration'],
        uses: ['communion rituals', 'blessing ceremonies', 'offerings to deity', 'ritual toasting'],
        spiritualSignificance: 'Symbol of transformation and the blood of the vine. Represents joy, fellowship, and divine presence.',
      },
      {
        id: 'salt',
        name: 'Salt',
        namePt: 'Sal',
        element: 'Earth',
        chakra: 'Root',
        vibration: 7,
        properties: ['preserving', 'purifying', 'protective', 'grounding'],
        uses: ['space cleansing', 'altar protection', 'ritual circles', 'offering ceremonies'],
        spiritualSignificance: 'The great purifier and protector. Used to create sacred barriers and preserve spiritual sanctity.',
      },
      {
        id: 'incense',
        name: 'Sacred Incense',
        namePt: 'Incenso Sagrado',
        element: 'Fire',
        chakra: 'Crown',
        vibration: 9,
        properties: ['purifying', 'elevating', 'offering', 'transcendent'],
        uses: ['smudging', 'meditation', 'altar offerings', 'divine communication'],
        spiritualSignificance: 'The vehicle for prayers rising to heaven. Smoke carries intentions to the divine realm.',
      },
      {
        id: 'manna',
        name: 'Manna',
        namePt: 'Maná',
        element: 'Light',
        chakra: 'Crown',
        vibration: 10,
        properties: ['divine nourishment', 'miraculous', 'sustaining', 'transcendent'],
        uses: ['spiritual sustenance', 'miracle rituals', 'divine provision ceremonies'],
        spiritualSignificance: 'Divine food from heaven representing perfect sustenance and trust in universal provision.',
      },
    ];

    // Return single food by ID
    if (id) {
      const record = sacredFoods.find((r) => r.id.toLowerCase() === id.toLowerCase());
      if (!record) {
        return NextResponse.json(
          { success: false, error: 'Sacred food not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: record });
    }

    // Return food categories
    if (type === 'categories') {
      const categories: FoodCategory[] = [
        { name: 'offerings', description: 'Foods used as sacred offerings to deity or ancestors', weight: 3 },
        { name: 'purifying', description: 'Foods for spiritual cleansing and purification', weight: 3 },
        { name: 'sustaining', description: 'Foods for spiritual nourishment and grounding', weight: 3 },
        { name: 'transformative', description: 'Foods that aid in spiritual transformation', weight: 2 },
        { name: 'communal', description: 'Foods for shared ritual meals and communion', weight: 2 },
        { name: 'protective', description: 'Foods for spiritual protection and warding', weight: 2 },
      ];
      return NextResponse.json({ success: true, data: categories });
    }

    // Return food records only
    if (type === 'records') {
      return NextResponse.json({ success: true, data: sacredFoods });
    }

    // Default — return all sacred food data
    return NextResponse.json({
      success: true,
      data: {
        records: sacredFoods,
        categories: [
          { name: 'offerings', description: 'Foods used as sacred offerings to deity or ancestors', weight: 3 },
          { name: 'purifying', description: 'Foods for spiritual cleansing and purification', weight: 3 },
          { name: 'sustaining', description: 'Foods for spiritual nourishment and grounding', weight: 3 },
          { name: 'transformative', description: 'Foods that aid in spiritual transformation', weight: 2 },
          { name: 'communal', description: 'Foods for shared ritual meals and communion', weight: 2 },
          { name: 'protective', description: 'Foods for spiritual protection and warding', weight: 2 },
       ] as FoodCategory[],
      },
    });
} catch (_error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch sacred food data',
        message: _error instanceof Error ? _error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
