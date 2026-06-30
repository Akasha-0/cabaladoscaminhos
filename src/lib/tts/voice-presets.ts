// ============================================================================
// voice-presets.ts — 7 tradition voice mappings (W72-D)
// ============================================================================
// Wave-Spawner Cycle 72 — Worker D.
//
// The 7 Akasha voice buckets map to the platform's `get_voice_list` presets.
// Voice character (pitch/speed) is tuned per tradition:
//
//   cigano       — caloroso, ritmo cigano clássico (BR)         (masc, neutra)
//   orixas       — grave, ritual, ancestral                      (fem, -2st)
//   astrologia   — claro, analítico, "leitura de mapa"           (fem, +2st)
//   cabala       — pausado, sábio, frases longas                  (masc, 0.85x)
//   numerologia  — rápido, ritmado, "contagem + cálculo"          (fem, 1.05x)
//   tantra       — lento, grave, respiração longa                 (masc, -4st)
//   tarot        — mistério, suspense, "voz das cartas"           (fem, -1st)
//
// Voice ids are the canonical names from the platform TTS tool. If a future
// re-mint returns a different id, this file is the single source of truth.
//
// Sacred boundary (cycle 60+ lesson): "cigano" stays "cigano" — never
// "cigana" for the tradition itself. The voice bucket is named after the
// tradition, not the gender of the voice.
// ============================================================================

import type { Tradition, VoicePreset } from './types.ts';

// ---------------------------------------------------------------------------
// Preset table — frozen so React re-renders don't accidentally mutate.
// ---------------------------------------------------------------------------

export const VOICE_PRESETS: Readonly<Record<Tradition, VoicePreset>> =
  Object.freeze({
    cigano: {
      voice_id: 'male-qn-qingse',
      pitch: 0,
      speed: 0.95,
      label: 'Cigano',
      description: 'Voz calorosa e ritmada, sotaque brasileiro clássico',
    },
    orixas: {
      voice_id: 'female-shaonv',
      pitch: -2,
      speed: 0.9,
      label: 'Orixás',
      description: 'Voz grave e ritual, tom ancestral',
    },
    astrologia: {
      voice_id: 'female-yujie',
      pitch: 2,
      speed: 1.0,
      label: 'Astrologia',
      description: 'Voz clara e analítica, leitura de mapas',
    },
    cabala: {
      voice_id: 'male-qn-jingying',
      pitch: 0,
      speed: 0.85,
      label: 'Cabala',
      description: 'Voz pausada e sábia, frases longas',
    },
    numerologia: {
      voice_id: 'female-qn-qingse',
      pitch: 1,
      speed: 1.05,
      label: 'Numerologia',
      description: 'Voz rápida e ritmada, contagem e cálculo',
    },
    tantra: {
      voice_id: 'male-qn-qingse',
      pitch: -4,
      speed: 0.8,
      label: 'Tantra',
      description: 'Voz lenta e grave, respiração longa',
    },
    tarot: {
      voice_id: 'female-yujie',
      pitch: -1,
      speed: 0.9,
      label: 'Tarot',
      description: 'Voz misteriosa, suspense das cartas',
    },
  });

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Resolve a preset by tradition key, falling back to `cigano`. */
export function getVoicePreset(tradition?: string | null): VoicePreset {
  if (tradition && tradition in VOICE_PRESETS) {
    return VOICE_PRESETS[tradition as Tradition];
  }
  return VOICE_PRESETS.cigano;
}

/** List all presets as a stable array (UI picker, audit). */
export function listVoicePresets(): readonly VoicePreset[] {
  return Object.values(VOICE_PRESETS);
}

/** Audit helper — counts + spot-checks preset table. */
export function auditVoicePresets(): {
  count: number;
  traditions: readonly Tradition[];
  unique_voice_ids: number;
  pitch_range: readonly [number, number];
  speed_range: readonly [number, number];
  has_all_required: boolean;
} {
  const traditions = Object.keys(VOICE_PRESETS) as Tradition[];
  const voiceIds = new Set(listVoicePresets().map((p) => p.voice_id));
  const pitches = listVoicePresets().map((p) => p.pitch);
  const speeds = listVoicePresets().map((p) => p.speed);
  const required: Tradition[] = [
    'cigano',
    'orixas',
    'astrologia',
    'cabala',
    'numerologia',
    'tantra',
    'tarot',
  ];
  return {
    count: traditions.length,
    traditions,
    unique_voice_ids: voiceIds.size,
    pitch_range: [Math.min(...pitches), Math.max(...pitches)] as const,
    speed_range: [Math.min(...speeds), Math.max(...speeds)] as const,
    has_all_required: required.every((t) => t in VOICE_PRESETS),
  };
}
