// ============================================================================
// W94 barrel export — voice-mode + future cycle modules
// ============================================================================
// Cycle 94 deliverables live under @/lib/w94. This barrel keeps the
// API surface explicit and discoverable. Use:
//   import { createVoiceMode, VOICE_PRESETS } from '@/lib/w94';
// or
//   import { createVoiceMode } from '@/lib/w94/voice-mode';
// ============================================================================

export {
  // Types
  type VoicePreset,
  type TTSOptions,
  type TTSEngine,
  type VoiceModeState,
  type VoiceModeEvent,
  type VoiceConsentRecord,
  type VoicePresetConfig,
  type VoiceMode,
  type VoiceModeDeps,
  // Constants
  SACRED_SENTENCE_PAUSE_MS,
  CONSENT_TTL_DAYS,
  SACRED_PACING_FACTOR,
  MIN_PLAYABLE_LENGTH,
  VOICE_PRESETS,
  PRONUNCIATION_HINTS,
  BANNED_VOCAB,
  VOICE_MODE_METADATA,
  VOICE_MODE_FILE_METADATA,
  // Engines
  WebSpeechTTSEngine,
  FallbackTTSEngine,
  // Math
  fnv1a32,
  hashRedirect,
  hashConsent,
  // Sentence splitting
  splitForTTS,
  applyPronunciationHints,
  // Factory
  createVoiceMode,
  // Schema
  ConsentSchemaLike,
} from './voice-mode.ts';
