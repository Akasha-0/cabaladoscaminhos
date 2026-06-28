// w27/voice-mode.ts — voice mode (TTS) Akasha fala stub
// Feature: Akasha IA com TTS — respostas em audio (voz PT-BR, multi-voice)
// Status: STUB — integracao com TTS provider pendente (ElevenLabs / Azure Speech / MiniMax)

export type VoiceProvider = 'elevenlabs' | 'azure-speech' | 'minimax' | 'mock';

export interface VoiceConfig {
  provider: VoiceProvider;
  voiceId: string;
  language: 'pt-BR' | 'en-US' | 'es-ES';
  speed: number; // 0.5 - 2.0
  pitch: number; // -12 to 12
  emotion: 'neutral' | 'warm' | 'mystical' | 'joyful' | 'calm';
}

export interface VoiceClip {
  id: string;
  text: string;
  audioUrl: string;
  durationSeconds: number;
  config: VoiceConfig;
  createdAt: string;
}

export const DEFAULT_AKASHA_VOICE: VoiceConfig = {
  provider: 'mock',
  voiceId: 'akasha-ptbr-female-01',
  language: 'pt-BR',
  speed: 0.95,
  pitch: 0,
  emotion: 'mystical',
};

export function buildTTSRequest(text: string, config: VoiceConfig = DEFAULT_AKASHA_VOICE) {
  return {
    text,
    voiceId: config.voiceId,
    speed: config.speed,
    pitch: config.pitch,
    language: config.language,
  };
}

