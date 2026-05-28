// ============================================================
// RESONANCE DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for resonance data
// - Retrieve all resonance presets
// - Calculate resonance between two entities
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { calculate, type HarmonyInput, type HarmonyResult } from '@/lib/harmony/harmony-calculation';

// Pre-computed resonance presets for common spiritual pairings
const RESONANCE_PRESETS = [
  {
    id: 'soulmate',
    name: 'Soulmate Resonance',
    description: 'Deep spiritual connection between twin souls',
    interpretation: 'Perfect resonance between soulmate energies. These vibrations align at the highest frequency, creating an unbreakable bond of understanding and unconditional acceptance.',
    aspects: ['Vibration Match: 100%', 'Rhythmic Harmony: Perfect', 'Elemental Synergy: Complete'],
    score: 100,
  },
  {
    id: 'twin-flame',
    name: 'Twin Flame Resonance',
    description: 'Mirror soul energetics — intense transformation',
    interpretation: 'Twin flame resonance creates powerful magnetic attraction and mirror-like reflection. This connection triggers profound spiritual growth through intense emotional experiences.',
    aspects: ['Vibration Match: 98%', 'Rhythmic Harmony: Synchronized', 'Elemental Synergy: Mirrored'],
    score: 98,
  },
  {
    id: 'cosmic-partner',
    name: 'Cosmic Partner Resonance',
    description: 'Universal frequency alignment',
    interpretation: 'Cosmic partner resonance indicates alignment with universal frequencies. This connection draws upon celestial energies for mutual enlightenment and spiritual evolution.',
    aspects: ['Vibration Match: 95%', 'Rhythmic Harmony: Universal', 'Elemental Synergy: Celestial'],
    score: 95,
  },
  {
    id: 'mentor',
    name: 'Mentor Resonance',
    description: 'Guiding frequency — wisdom transmission',
    interpretation: 'Mentor resonance establishes a channel for sacred knowledge transfer. The higher frequency guide illuminates the path for the receptive student.',
    aspects: ['Vibration Match: 88%', 'Rhythmic Harmony: Flowing', 'Elemental Synergy: Transmissive'],
    score: 88,
  },
  {
    id: 'karmic',
    name: 'Karmic Resonance',
    description: 'Past life connection — lessons to be learned',
    interpretation: 'Karmic resonance suggests unfinished business from past incarnations. This bond carries lessons requiring completion before spiritual advancement.',
    aspects: ['Vibration Match: 72%', 'Rhythmic Harmony: Challenging', 'Elemental Synergy: Formative'],
    score: 72,
  },
  {
    id: 'friendly',
    name: 'Friendly Resonance',
    description: 'Harmonious social connection',
    interpretation: 'Friendly resonance indicates natural compatibility and mutual appreciation. This connection supports collaborative endeavors and shared joy.',
    aspects: ['Vibration Match: 78%', 'Rhythmic Harmony: Pleasant', 'Elemental Synergy: Cooperative'],
    score: 78,
  },
  {
    id: 'growth',
    name: 'Growth Resonance',
    description: 'Expansion through contrast',
    interpretation: 'Growth resonance emerges from opposing frequencies that catalyze evolution. Tension here serves as fuel for spiritual expansion.',
    aspects: ['Vibration Match: 55%', 'Rhythmic Harmony: Dynamic', 'Elemental Synergy: Transformative'],
    score: 55,
  },
  {
    id: 'challenging',
    name: 'Challenging Resonance',
    description: 'Dissonant frequencies — growth through friction',
    interpretation: 'Challenging resonance creates necessary friction for soul evolution. These vibrations resist yet thereby strengthen the spirit.',
    aspects: ['Vibration Match: 35%', 'Rhythmic Harmony: Asynchronous', 'Elemental Synergy: Testing'],
    score: 35,
  },
];

// GET /api/resonance/data - Get all resonance data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityA = searchParams.get('entityA');
    const entityB = searchParams.get('entityB');
    const presetId = searchParams.get('preset');

    // Specific entity pair query
    if (entityA && entityB) {
      const input: HarmonyInput = { entityA, entityB };
      const result: HarmonyResult = calculate(input);
      return NextResponse.json({ success: true, data: result });
    }

    // Single entity with preset lookup
    if (entityA && presetId) {
      const preset = RESONANCE_PRESETS.find((p) => p.id === presetId);
      if (!preset) {
        return NextResponse.json(
          { success: false, error: 'Invalid preset ID provided' },
          { status: 400 }
        );
      }

      const input: HarmonyInput = { entityA, entityB: preset.name };
      const result: HarmonyResult = calculate(input);

      return NextResponse.json({
        success: true,
        data: {
          ...result,
          preset,
        },
      });
    }

    // Preset query only — return all or specific preset
    if (presetId) {
      const preset = RESONANCE_PRESETS.find((p) => p.id === presetId);
      if (!preset) {
        return NextResponse.json(
          { success: false, error: 'Invalid preset ID provided' },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: true, data: preset });
    }

    // Default — return all presets
    return NextResponse.json({ success: true, data: RESONANCE_PRESETS });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch resonance data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}