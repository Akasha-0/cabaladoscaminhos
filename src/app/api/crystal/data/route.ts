// ============================================================
// CRYSTAL DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for crystal data
// - Retrieve all crystals
// - Retrieve single crystal by ID
// - Retrieve crystal categories
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface CrystalCategory {
  name: string;
  description: string;
  weight: number;
}

// GET /api/crystal/data - Get crystal data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    const crystals = [
      { id: 'quartz', name: 'Quartz', element: 'Light', chakra: 'All', vibration: 7 },
      { id: 'amethyst', name: 'Amethyst', element: 'Water', chakra: 'Crown', vibration: 8 },
      { id: 'rose-quartz', name: 'Rose Quartz', element: 'Water', chakra: 'Heart', vibration: 6 },
      { id: 'citrine', name: 'Citrine', element: 'Fire', chakra: 'Solar', vibration: 5 },
      { id: 'obsidian', name: 'Obsidian', element: 'Earth', chakra: 'Root', vibration: 4 },
      { id: 'turquoise', name: 'Turquoise', element: 'Air', chakra: 'Throat', vibration: 6 },
      { id: 'lapis-lazuli', name: 'Lapis Lazuli', element: 'Water', chakra: 'Third Eye', vibration: 8 },
      { id: 'carnelian', name: 'Carnelian', element: 'Fire', chakra: 'Sacral', vibration: 5 },
      { id: 'jade', name: 'Jade', element: 'Earth', chakra: 'Heart', vibration: 5 },
      { id: 'sapphire', name: 'Sapphire', element: 'Water', chakra: 'Third Eye', vibration: 9 },
      { id: 'ruby', name: 'Ruby', element: 'Fire', chakra: 'Root', vibration: 6 },
      { id: 'emerald', name: 'Emerald', element: 'Earth', chakra: 'Heart', vibration: 7 },
      { id: 'diamond', name: 'Diamond', element: 'Light', chakra: 'Crown', vibration: 10 },
      { id: 'moonstone', name: 'Moonstone', element: 'Water', chakra: 'Third Eye', vibration: 7 },
      { id: 'black-tourmaline', name: 'Black Tourmaline', element: 'Earth', chakra: 'Root', vibration: 4 },
    ];

    // Return single crystal by ID
    if (id) {
      const record = crystals.find((r) => r.id.toLowerCase() === id.toLowerCase());
      if (!record) {
        return NextResponse.json(
          { success: false, error: 'Crystal not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: record });
    }

    // Return crystal categories
    if (type === 'categories') {
      const categories: CrystalCategory[] = [
        { name: 'quartz', description: 'Amplifiers, clarity, energy work', weight: 3 },
        { name: 'amethyst', description: 'Spirituality, protection, calm', weight: 3 },
        { name: 'agate', description: 'Stability, grounding, balance', weight: 2 },
        { name: 'jasper', description: 'Nurturing, protection, endurance', weight: 2 },
        { name: 'opal', description: 'Inspiration, creativity, emotional healing', weight: 2 },
        { name: 'topaz', description: 'Abundance, joy, manifestation', weight: 2 },
        { name: 'garnet', description: 'Vitality, passion, grounding', weight: 2 },
      ];
      return NextResponse.json({ success: true, data: categories });
    }

    // Return crystal records only
    if (type === 'records') {
      return NextResponse.json({ success: true, data: crystals });
    }

    // Default — return all crystal data
    return NextResponse.json({
      success: true,
      data: {
        records: crystals,
        categories: [
          { name: 'quartz', description: 'Amplifiers, clarity, energy work', weight: 3 },
          { name: 'amethyst', description: 'Spirituality, protection, calm', weight: 3 },
          { name: 'agate', description: 'Stability, grounding, balance', weight: 2 },
          { name: 'jasper', description: 'Nurturing, protection, endurance', weight: 2 },
          { name: 'opal', description: 'Inspiration, creativity, emotional healing', weight: 2 },
          { name: 'topaz', description: 'Abundance, joy, manifestation', weight: 2 },
          { name: 'garnet', description: 'Vitality, passion, grounding', weight: 2 },
        ] as CrystalCategory[],
      },
    });
  } catch (_error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch crystal data',
        message: _error instanceof Error ? _error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}