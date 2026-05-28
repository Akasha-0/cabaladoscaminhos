// ============================================================
// DIVINO API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Divino data
// - Retrieve Divino configurations
// - Retrieve pathways and roads
// - Retrieve offerings and rituals
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface DivinoConfig {
  name: string;
  description: string;
  enabled: boolean;
}

interface PathwayRoad {
  tipo: string;
  descricao: string;
  energia: string;
}

interface OfferingRitual {
  tipo: string;
  descricao: string;
  freq: number;
}

// GET /api/divino/data - Get Divino data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Return single config by type
    if (type === 'config') {
      const config: DivinoConfig = {
        name: 'Divino',
        description: 'Divine connection and spiritual guidance',
        enabled: true
      };
      return NextResponse.json(config);
    }

    // Return pathways and roads
    if (type === 'pathways') {
      const pathways: PathwayRoad[] = [
        { tipo: 'divine-light', descricao: 'Path of divine light and illumination', energia: 'celestial' },
        { tipo: 'sacred-union', descricao: 'Path of sacred union with the divine', energia: 'transcendent' },
        { tipo: 'divine-grace', descricao: 'Path of divine grace and mercy', energia: 'graceful' },
        { tipo: 'holy-wisdom', descricao: 'Path of holy wisdom and discernment', energia: 'wise' },
        { tipo: 'divine-love', descricao: 'Path of divine love and compassion', energia: 'loving' },
        { tipo: 'sacred-flame', descricao: 'Path of sacred flame and transformation', energia: 'transformative' }
      ];
      return NextResponse.json(pathways);
    }

    // Return offerings and rituals
    if (type === 'offerings') {
      const offerings: OfferingRitual[] = [
        { tipo: 'prayer', descricao: 'Sacred prayer and devotion', freq: 108 },
        { tipo: 'chanting', descricao: 'Divine chanting and mantra', freq: 54 },
        { tipo: 'meditation', descricao: 'Divine meditation and contemplation', freq: 27 },
        { tipo: 'offering', descricao: 'Divine offering and sacrifice', freq: 9 },
        { tipo: 'ritual', descricao: 'Sacred ritual and ceremony', freq: 3 },
        { tipo: 'service', descricao: 'Divine service and worship', freq: 1 }
      ];
      return NextResponse.json(offerings);
    }

    // Default — return all Divino data
    return NextResponse.json({
      config: {
        name: 'Divino',
        description: 'Divine connection and spiritual guidance',
        enabled: true
      },
      pathways: [
        { tipo: 'divine-light', descricao: 'Path of divine light and illumination', energia: 'celestial' },
        { tipo: 'sacred-union', descricao: 'Path of sacred union with the divine', energia: 'transcendent' },
        { tipo: 'divine-grace', descricao: 'Path of divine grace and mercy', energia: 'graceful' },
        { tipo: 'holy-wisdom', descricao: 'Path of holy wisdom and discernment', energia: 'wise' },
        { tipo: 'divine-love', descricao: 'Path of divine love and compassion', energia: 'loving' },
        { tipo: 'sacred-flame', descricao: 'Path of sacred flame and transformation', energia: 'transformative' }
      ],
      offerings: [
        { tipo: 'prayer', descricao: 'Sacred prayer and devotion', freq: 108 },
        { tipo: 'chanting', descricao: 'Divine chanting and mantra', freq: 54 },
        { tipo: 'meditation', descricao: 'Divine meditation and contemplation', freq: 27 },
        { tipo: 'offering', descricao: 'Divine offering and sacrifice', freq: 9 },
        { tipo: 'ritual', descricao: 'Sacred ritual and ceremony', freq: 3 },
        { tipo: 'service', descricao: 'Divine service and worship', freq: 1 }
      ]
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve divino data' },
      { status: 500 }
    );
  }
}