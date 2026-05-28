// ============================================================
// VIBRATION DATA API v2 - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for vibration data
// - Retrieve all vibration presets
// - Calculate vibration frequency between entities
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// Pre-computed vibration presets for spiritual frequencies
const VIBRATION_PRESETS = [
  {
    id: 'creator',
    name: 'Creator Frequency',
    description: 'Highest spiritual vibration - pure creation',
    interpretation: 'This frequency aligns with the creative source. At this level, you operate as a conscious co-creator, manifesting reality through intention and love.',
    aspects: ['Frequency: 1000+ Hz', 'Element: Light', 'Chakra: Crown'],
    score: 1000,
  },
  {
    id: 'unity',
    name: 'Unity Consciousness',
    description: 'Oneness with all existence',
    interpretation: 'Unity consciousness dissolves the illusion of separation. You perceive the divine essence in all beings and experience profound interconnection.',
    aspects: ['Frequency: 900-1000 Hz', 'Element: Spirit', 'Chakra: Crown-Soul'],
    score: 950,
  },
  {
    id: 'enlightenment',
    name: 'Enlightenment State',
    description: 'Awakening to ultimate truth',
    interpretation: 'Enlightenment brings clarity beyond the mind. This state reveals the underlying unity of all phenomena and liberates from mental constructs.',
    aspects: ['Frequency: 800-900 Hz', 'Element: Wisdom', 'Chakra: Third Eye'],
    score: 850,
  },
  {
    id: 'peace',
    name: 'Inner Peace',
    description: 'Profound tranquility and acceptance',
    interpretation: 'Inner peace radiates from within, unaffected by external circumstances. This frequency creates a sanctuary of stillness that can influence entire environments.',
    aspects: ['Frequency: 700-800 Hz', 'Element: Water', 'Chakra: Third Eye'],
    score: 750,
  },
  {
    id: 'joy',
    name: 'Innermost Joy',
    description: 'Bliss beyond external circumstances',
    interpretation: 'True joy arises from within rather than depending on external conditions. This frequency transforms challenges into opportunities for growth.',
    aspects: ['Frequency: 600-700 Hz', 'Element: Air', 'Chakra: Heart'],
    score: 650,
  },
  {
    id: 'love',
    name: 'Unconditional Love',
    description: 'Love without conditions or boundaries',
    interpretation: 'Unconditional love accepts all beings as they are. This frequency heals wounds, bridges differences, and creates deep connections.',
    aspects: ['Frequency: 500-600 Hz', 'Element: Earth', 'Chakra: Heart'],
    score: 550,
  },
  {
    id: 'compassion',
    name: 'Deep Compassion',
    description: 'Empathy combined with wisdom',
    interpretation: 'Compassion merges emotional awareness with enlightened understanding. This frequency responds to suffering with both heart and wisdom.',
    aspects: ['Frequency: 400-500 Hz', 'Element: Fire', 'Chakra: Heart-Throat'],
    score: 450,
  },
  {
    id: 'acceptance',
    name: 'Acceptance',
    description: 'Embracing life as it unfolds',
    interpretation: 'Acceptance transforms resistance into flow. This frequency allows life to unfold naturally, releasing the need to control outcomes.',
    aspects: ['Frequency: 350-400 Hz', 'Element: Earth', 'Chakra: Solar Plexus'],
    score: 375,
  },
  {
    id: 'neutrality',
    name: 'Neutrality',
    description: 'Observing without judgment',
    interpretation: 'Neutrality creates space between stimulus and response. This frequency enables clear observation and wise decision-making.',
    aspects: ['Frequency: 250-350 Hz', 'Element: Air', 'Chakra: Solar Plexus'],
    score: 300,
  },
  {
    id: 'courage',
    name: 'Courage',
    description: 'Strength to face fears',
    interpretation: 'Courage transforms fear into action. This frequency empowers you to step beyond comfort zones and embrace growth.',
    aspects: ['Frequency: 200-250 Hz', 'Element: Fire', 'Chakra: Root-Solar'],
    score: 225,
  },
  {
    id: 'pride',
    name: 'Pride',
    description: 'False sense of self-importance',
    interpretation: 'Pride arises from ego identification. This frequency seeks external validation and comparison with others.',
    aspects: ['Frequency: 150-200 Hz', 'Element: Fire', 'Chakra: Root'],
    score: 175,
  },
  {
    id: 'anger',
    name: 'Anger',
    description: 'Frustration and resistance',
    interpretation: 'Anger signals unmet needs and boundaries. This frequency can transform into constructive action when channeled wisely.',
    aspects: ['Frequency: 100-150 Hz', 'Element: Fire', 'Chakra: Root'],
    score: 125,
  },
  {
    id: 'fear',
    name: 'Fear',
    description: 'Anxiety and worry',
    interpretation: 'Fear contracts consciousness and narrows perception. This frequency often masks underlying beliefs waiting to be examined.',
    aspects: ['Frequency: 50-100 Hz', 'Element: Earth', 'Chakra: Root'],
    score: 75,
  },
  {
    id: 'grief',
    name: 'Grief',
    description: 'Loss and sorrow',
    interpretation: 'Grief honors what has passed. This frequency, when fully experienced, opens space for new growth and acceptance.',
    aspects: ['Frequency: 30-50 Hz', 'Element: Water', 'Chakra: Heart'],
    score: 40,
  },
];

// GET /api/vibration/v2/data - Get all vibration data
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const frequency = searchParams.get('frequency');
    const id = searchParams.get('id');

    // Return specific preset by ID
    if (id) {
      const preset = VIBRATION_PRESETS.find((p) => p.id === id);
      if (!preset) {
        return NextResponse.json(
          { error: 'Vibration preset not found', id },
          { status: 404 }
        );
      }
      return NextResponse.json({
        data: preset,
        timestamp: new Date().toISOString(),
      });
    }

    // Filter by frequency range
    if (frequency) {
      const freq = parseInt(frequency, 10);
      const filtered = VIBRATION_PRESETS.filter((p) => p.score === freq);
      return NextResponse.json({
        data: filtered,
        count: filtered.length,
        timestamp: new Date().toISOString(),
      });
    }

    // Filter by type
    if (type) {
      const filtered = VIBRATION_PRESETS.filter((p) =>
        p.name.toLowerCase().includes(type.toLowerCase())
      );
      return NextResponse.json({
        data: filtered,
        count: filtered.length,
        timestamp: new Date().toISOString(),
      });
    }

    // Return all presets
    return NextResponse.json({
      data: VIBRATION_PRESETS,
      count: VIBRATION_PRESETS.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Vibration data API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}