// ============================================================
// PROPHECY DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for prophecy data
// - Retrieve prophecy data
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// In-memory prophecy store (replace with database in production)
const prophecies: Array<{
  id: string;
  title: string;
  description: string;
  source: string;
  interpretation: string;
  createdAt: string;
}> = [
  {
    id: 'prop_001',
    title: 'The Path of Return',
    description: 'A vision of souls ascending through the sefirot toward pure consciousness.',
    source: 'Zohar Vol. 1',
    interpretation: 'This prophecy speaks to the teshuvah (return) journey, where each soul must traverse the ten sefirot to reunite with Ein Sof. The path is not linear but spiral, ascending and returning in cycles of refinement.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prop_002',
    title: 'The Breaking of Vessels',
    description: 'The cosmic shatters that gave birth to Klipot and the struggle for holiness.',
    source: 'Luria\'s Tree of Life',
    interpretation: 'Shevirat haKelim teaches that brokenness can contain hidden light. What appears as klipot (shells) may be vessels awaiting tikkun (repair) through conscious spiritual practice.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prop_003',
    title: 'The Unity of Opposites',
    description: 'The prophecy of convergence where opposites merge in divine balance.',
    source: 'Sefer Yetzirah',
    interpretation: 'The doctrine of yichud teaches that apparent contradictions in creation will ultimately resolve in the unity of divine purpose, revealing that no force exists outside of God.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prop_004',
    title: 'The Coming of Mashiach',
    description: 'The messianic age described as a gradual illumination rather than sudden change.',
    source: 'Talmud Bavli, Sanhedrin',
    interpretation: 'This teaching emphasizes that redemption is achieved through accumulated spiritual effort. Each mitzvah performed contributes to the tikkun of the world (修复世界).',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prop_005',
    title: 'The Voice of the Mountains',
    description: 'Moses heard prophecy from between the two cherubim atop the Ark.',
    source: 'Midrash Tehillim',
    interpretation: 'The mystical path requires internalization of divine wisdom, not mere transmission. The «voice between the cherubim» represents the meditative stillness where prophecy is received.',
    createdAt: new Date().toISOString(),
  },
];

// GET /api/prophecy/data - Get all prophecies
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const prophecy = prophecies.find((p) => p.id === id);
      if (!prophecy) {
        return NextResponse.json(
          { success: false, error: 'Prophecy not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: prophecy });
    }

    return NextResponse.json({ success: true, data: prophecies });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch prophecies',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
