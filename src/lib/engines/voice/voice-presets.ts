/**
 * ════════════════════════════════════════════════════════════════════════════
 * W85-A — VOICE PRESETS · 7-TRADIÇÃO COVERAGE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 85 · 2026-06-30
 * Author: W85-A Coder (Mavis orchestrator session 414764491727032)
 *
 * Six voice presets — one per tradisião (Cigano, Candomblé, Umbanda, Cabala,
 * Astrologia, Tantra). Ifá is the 7th tradição and is documented as
 * "coming soon" — the engine returns an empty array for `getVoicesByTradicao('ifa')`
 * and a clear VOICE_NOT_CONFIGURED error if a caller tries to play with an
 * ifá-only voiceId (none currently exist).
 *
 * Sacred-cultural sensitivity (curator-reviewed intent — see DELIVERABLE.md):
 *   - cigano       → warm, conversational, with road/moon metaphors
 *   - iya          → measured, warm, MATERNAL — never stern or austere
 *   - pai-ogum     → decisive, protective, firm-not-gruff (Umbanda Caboclo Ogum)
 *   - swami-ananda → joyful, breath-aware, ecstatic — not eroticized
 *   - rabino-moshe → scholarly, contemplative, low-key passionate about Zohar
 *   - astrologa-stella → didactic, warm, celestial — points up at the sky
 *
 * Voice personalities (rate, pitch, voiceStyle, sampleText) are deterministic
 * sample data consumed by the engine. Voice engines in production would map
 * voiceStyle → an underlying TTS voice (ElevenLabs, Azure, OpenAI TTS).
 *
 * Rate is in [0.5, 1.5] (1.0 = natural speed).
 * Pitch is in [0.5, 1.5] (1.0 = natural pitch, 1.1 = slightly higher).
 * Both are validated in the engine on each play() call.
 */

// ════════════════════════════════════════════════════════════════════════════
// TYPE RE-EXPORTS — single source of truth is voice-engine.ts, but we
// re-export here so spec/smoke can import the presets independently.
// ════════════════════════════════════════════════════════════════════════════

export type VoiceId =
  | 'cigano'
  | 'iya'
  | 'pai-ogum'
  | 'swami-ananda'
  | 'rabino-moshe'
  | 'astrologa-stella';

export type Tradicao =
  | 'cigano'
  | 'candomble'
  | 'umbanda'
  | 'ifa'
  | 'cabala'
  | 'astrologia'
  | 'tantra';

export interface VoicePreset {
  readonly id: VoiceId;
  readonly name: string;
  readonly tradicao: Tradicao;
  readonly rate: number; // [0.5, 1.5]
  readonly pitch: number; // [0.5, 1.5]
  readonly voiceStyle: string; // human-readable description of the voice personality
  readonly sampleText: string; // short sacred greeting in pt-BR
  readonly locale: 'pt-BR';
}

// ════════════════════════════════════════════════════════════════════════════
// PRESET REGISTRY
// ════════════════════════════════════════════════════════════════════════════

const PRESET_CIGANO: VoicePreset = Object.freeze({
  id: 'cigano',
  name: 'Cigano (Cavaleiro do Baralho)',
  tradicao: 'cigano',
  rate: 0.95,
  pitch: 1.0,
  voiceStyle:
    'Sabedoria cigana — fala pausada e calorosa; usa metáforas de estrada, lua e baralho; nunca apressada.',
  sampleText: 'Que as cartas revelem o que precisa ser visto, e o caminho se abra sob seus pés.',
  locale: 'pt-BR',
});

const PRESET_IYA: VoicePreset = Object.freeze({
  id: 'iya',
  name: 'Iyá (Mãe-de-Santo)',
  tradicao: 'candomble',
  rate: 0.85,
  pitch: 0.95,
  voiceStyle:
    'Iyá de Candomblé — voz medida, quente e acolhedora; tom maternal de fundamento; nunca austera ou julgadora.',
  sampleText: 'Orixá te chama. Escute o fundamento que sua alma já conhece.',
  locale: 'pt-BR',
});

const PRESET_PAI_OGUM: VoicePreset = Object.freeze({
  id: 'pai-ogum',
  name: 'Pai Ogum (Caboclo)',
  tradicao: 'umbanda',
  rate: 1.0,
  pitch: 1.0,
  voiceStyle:
    'Ogum guerreiro — decidido, protetor e firme sem ser ríspido; voz de quem abre caminhos com a espada.',
  sampleText: 'Eu venho abrir os caminhos. Onde havia pedra, agora há estrada.',
  locale: 'pt-BR',
});

const PRESET_SWAMI_ANANDA: VoicePreset = Object.freeze({
  id: 'swami-ananda',
  name: 'Swami Ananda',
  tradicao: 'tantra',
  rate: 0.9,
  pitch: 1.05,
  voiceStyle:
    'Swami Ananda — alegre, consciente da respiração, jubiloso; fala como quem reconhece o divino em tudo.',
  sampleText: 'Que seu prana encontre o prana do mundo, e o mundo floresça dentro de você.',
  locale: 'pt-BR',
});

const PRESET_RABINO_MOSHE: VoicePreset = Object.freeze({
  id: 'rabino-moshe',
  name: 'Rabi Moshe',
  tradicao: 'cabala',
  rate: 0.92,
  pitch: 0.95,
  voiceStyle:
    'Rabi Moshe — erudito, estudioso, contemplativo; apaixonado pelo Zohar mas contido no volume.',
  sampleText: 'O Zohar nos ensina: a luz mais alta desce para acender a vela mais baixa.',
  locale: 'pt-BR',
});

const PRESET_ASTROLOGA_STELLA: VoicePreset = Object.freeze({
  id: 'astrologa-stella',
  name: 'Stella (Astróloga)',
  tradicao: 'astrologia',
  rate: 0.95,
  pitch: 1.1,
  voiceStyle:
    'Stella — didática, calorosa, sideral; fala como quem aponta pro céu e traduz o mapa em palavras simples.',
  sampleText: 'Mercúrio entra em Gêmeos. Sua mente pede movimento, sua alma pede escuta.',
  locale: 'pt-BR',
});

/** All presets — frozen in definition order. */
export const ALL_VOICE_PRESETS: ReadonlyArray<VoicePreset> = Object.freeze([
  PRESET_CIGANO,
  PRESET_IYA,
  PRESET_PAI_OGUM,
  PRESET_SWAMI_ANANDA,
  PRESET_RABINO_MOSHE,
  PRESET_ASTROLOGA_STELLA,
]);

/** Fast lookup by VoiceId. */
export const VOICE_PRESETS_BY_ID: ReadonlyMap<VoiceId, VoicePreset> = (() => {
  const m = new Map<VoiceId, VoicePreset>();
  for (const p of ALL_VOICE_PRESETS) m.set(p.id, p);
  return Object.freeze(m);
})();

/** Lookup by tradição. Ifá has no preset yet — returns empty array. */
export function getVoicesByTradicao(t: Tradicao): ReadonlyArray<VoicePreset> {
  return ALL_VOICE_PRESETS.filter((p) => p.tradicao === t);
}

/** Guard for callers who want to check if a tradição has at least one voice. */
export function hasVoiceForTradicao(t: Tradicao): boolean {
  return getVoicesByTradicao(t).length > 0;
}

/** The set of VoiceIds for cheap membership checks. */
export const ALL_VOICE_IDS: ReadonlySet<VoiceId> = new Set(ALL_VOICE_PRESETS.map((p) => p.id));

/** The set of supported tradições (those with at least one preset). */
export const SUPPORTED_TRADICOES: ReadonlySet<Tradicao> = new Set(
  ALL_VOICE_PRESETS.map((p) => p.tradicao),
);

/** All seven tradições — used for surface completeness even when ifá returns []. */
export const ALL_TRADICOES: ReadonlyArray<Tradicao> = Object.freeze([
  'cigano',
  'candomble',
  'umbanda',
  'ifa',
  'cabala',
  'astrologia',
  'tantra',
]);

/** Convenience: is this string a valid VoiceId? */
export function isVoiceId(s: string): s is VoiceId {
  return ALL_VOICE_IDS.has(s as VoiceId);
}

/** Convenience: is this string a valid Tradicao? */
export function isTradicao(s: string): s is Tradicao {
  return (ALL_TRADICOES as ReadonlyArray<string>).includes(s);
}

/**
 * Ifá is the 7th tradição and currently has no voice preset.
 * Documented as "coming soon" — caller can detect this via
 * `getVoicesByTradicao('ifa').length === 0` or `hasVoiceForTradicao('ifa') === false`.
 */
export const IFA_STATUS: 'coming-soon' = 'coming-soon';