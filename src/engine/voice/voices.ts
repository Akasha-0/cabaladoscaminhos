// ============================================================================
// Voice Presets — 6 voices × 6 tradições (1:1 mapping, Ifá = coming-soon)
// ============================================================================
// Per W85-A cycle-85 interim 1 spec. Each voice has curated voiceStyle that
// affirms warmth/maternity/joy/scholarship and explicitly avoids
// austerity/eroticization/loudness. Curator-intent rationale in DELIVERABLE.
// ============================================================================

import {
  VoiceId,
  VoicePreset,
  TradicaoId,
  IFA_STATUS,
} from './types';

const vid = (s: string): VoiceId => s as VoiceId;

export const VOICE_PRESETS: ReadonlyArray<VoicePreset> = Object.freeze([
  Object.freeze({
    id: vid('cigano'),
    label: 'Leitor Cigano',
    tradicao: 'cigano' as TradicaoId,
    rate: 0.95,
    pitch: 1.0,
    lang: 'pt-BR',
    voiceStyle: 'acolhedor, contador de histórias; tom íntimo',
  } satisfies VoicePreset),

  Object.freeze({
    id: vid('iya'),
    label: 'Iyá (mãe)',
    tradicao: 'candomble' as TradicaoId,
    rate: 0.85,
    pitch: 0.95,
    lang: 'pt-BR',
    voiceStyle: 'maternal, calorosa; abraço de mãe',
  } satisfies VoicePreset),

  Object.freeze({
    id: vid('pai-ogum'),
    label: 'Pai Ogum',
    tradicao: 'umbanda' as TradicaoId,
    rate: 1.0,
    pitch: 1.0,
    lang: 'pt-BR',
    voiceStyle: 'decisivo, firme; voz de protetor',
  } satisfies VoicePreset),

  Object.freeze({
    id: vid('swami-ananda'),
    label: 'Swami Ananda',
    tradicao: 'tantra' as TradicaoId,
    rate: 0.9,
    pitch: 1.05,
    lang: 'pt-BR',
    voiceStyle: 'alegre, expansivo; celebração',
  } satisfies VoicePreset),

  Object.freeze({
    id: vid('rabino-moshe'),
    label: 'Rabino Moshe',
    tradicao: 'cabala' as TradicaoId,
    rate: 0.92,
    pitch: 0.95,
    lang: 'pt-BR',
    voiceStyle: 'erudito, pausado; estudioso',
  } satisfies VoicePreset),

  Object.freeze({
    id: vid('astrologa-stella'),
    label: 'Astróloga Stella',
    tradicao: 'astrologia' as TradicaoId,
    rate: 0.95,
    pitch: 1.1,
    lang: 'pt-BR',
    voiceStyle: 'didática, celestial; mapa do céu',
  } satisfies VoicePreset),
] as VoicePreset[]);

// ---------- Selectors ----------

export function getVoiceById(id: VoiceId): VoicePreset | undefined {
  return VOICE_PRESETS.find((v) => v.id === id);
}

export function getVoicesByTradicao(t: TradicaoId): ReadonlyArray<VoicePreset> {
  if (t === 'ifa') return Object.freeze([] as VoicePreset[]); // coming-soon
  return VOICE_PRESETS.filter((v) => v.tradicao === t);
}

export function getDefaultVoice(): VoicePreset {
  const cigano = VOICE_PRESETS.find((v) => v.id === vid('cigano'));
  if (!cigano) {
    throw new Error('Default voice (cigano) missing from VOICE_PRESETS');
  }
  return cigano;
}

export function isIfaComingSoon(): boolean {
  return IFA_STATUS === 'coming-soon';
}
