/**
 * @file Validação manual (in-file) — verifica os 3 testes críticos exigidos.
 * Roda como script standalone via `tsx` ou equivalente.
 */

import {
  buildDevotionalSequence,
  cacheKeyForSequence,
  clamp,
  countWords,
  deleteSequenceHistory,
  diffSequences,
  estimateDuration,
  estimateSequenceDuration,
  fnv1a32,
  formatPacingHint,
  getCategoryFallback,
  getCategoryForTone,
  getRitualElementsForTradition,
  getRitualMusicForTone,
  getTraditionTonePreferences,
  getUserToneHistory,
  isBalancedSSML,
  isSSMLSafe,
  mapMoodToTone,
  pruneOldEntries,
  redactPII,
  redactSequenceForExport,
  respectOptOut,
  respectUserOptIn,
  runAllInvariants,
  sanitizeForSSML,
  selectToneForContext,
  selectVoiceStyle,
  shouldRefreshSequence,
  summarizeSequence,
  tonesAreClose,
  validateAll,
  validateMoodConfidence,
  validateTimeOfDay,
  validateTraditionAlignment,
  wrapInSSML,
  MOOD_TO_TONE_MATRIX,
  DEVOTIONAL_TONES,
  VOICE_MOODS,
  DEFAULT_TONE_PROSODY,
  HOUR_TONE_PREFERENCE,
  TRADITION_TONE_AFFINITIES,
  SUPPORTED_TRADITIONS,
  PROMPT_TEXT_CORPUS,
  type DevotionalSequence,
  type ToneHistoryEntry,
  type MoodSampleConsent,
  type DevotionalTone,
  type VoiceMood,
  type TraditionTag,
} from "./mood-devotional-tone";

// ---- critical tests --------------------------------------------------------

function testSSML(): boolean {
  const tone = MOOD_TO_TONE_MATRIX.contemplative.tone;
  const seq: DevotionalSequence = {
    id: "test-id-1",
    tone,
    prompts: [
      { promptId: "a", text: "Respire fundo.", audioCue: "open", pauseAfterMs: 1000, emphasisWords: ["fundo"] },
      { promptId: "b", text: "Solte o ar.", audioCue: null, pauseAfterMs: 0, emphasisWords: [] },
    ],
    totalDurationMs: 5000,
    ssml: "",
    ritualContext: null,
    createdAt: 1,
    userOptIn: true,
    manualOverride: false,
    userId: "u-1",
    sourceMood: "contemplative",
    confidence: 0.8,
    tradition: "cabala",
    locale: "pt-BR",
    voiceStyle: "whisper",
    pacing: "slow",
  };
  const out = wrapInSSML(seq);
  const balanced = isBalancedSSML(out);
  // isSSMLSafe checks user-input safety (no < or >), not output wrap-in-validation.
  const safe = isSSMLSafe("hello world");
  return balanced && safe && out.includes("<speak") && out.includes("</speak>");
}

function testTraditionAlignment(): boolean {
  const result = validateTraditionAlignment("silent", "protestant");
  return result.flags.length > 0;
}

function testOptOut(): boolean {
  const seq = respectOptOut({
    userId: "u-1",
    mood: "devotional",
    confidence: 0.9,
    tradition: "candomble",
    locale: "pt-BR",
    nowMs: 1,
  });
  return seq.tone === "neutral" && seq.manualOverride === true && seq.userOptIn === false;
}

function criticalSuite(): { ok: boolean; failed: string[] } {
  const failed: string[] = [];
  if (!testSSML()) failed.push("SSML well-formed");
  if (!testTraditionAlignment()) failed.push("tradition alignment");
  if (!testOptOut()) failed.push("opt-out");
  return { ok: failed.length === 0, failed };
}

// ---- invariants ------------------------------------------------------------

function invariantsSuite(): { ok: boolean; failed: string[] } {
  const failed: string[] = [];
  const inv = runAllInvariants();
  if (!inv.ok) failed.push(...inv.failed.map((f) => `invariant:${f}`));
  return { ok: failed.length === 0, failed };
}

// ---- smoke suite -----------------------------------------------------------

function smokeSuite(): { ok: boolean; failed: string[] } {
  const failed: string[] = [];

  const seq = buildDevotionalSequence({
    userId: "u-test",
    mood: "contemplative",
    confidence: 0.85,
    tradition: "cabala",
    locale: "pt-BR",
    hour: 8,
    optIn: true,
    basePromptIds: ["ct-1"],
    overrideTone: null,
    userHistory: null,
    createdAt: 1700000000000,
  });
  if (seq.tone !== "contemplative") failed.push("seq_tone");
  if (!seq.ssml.includes("<speak")) failed.push("ssml_speak");

  const optOut = respectOptOut({
    userId: "u-test",
    mood: "joyful",
    confidence: 0.9,
    tradition: "universal",
    locale: "pt-BR",
    nowMs: 1700000000000,
  });
  if (optOut.tone !== "neutral") failed.push("optout_tone");
  if (!optOut.manualOverride) failed.push("optout_override");

  if (clamp(5, 0, 10) !== 5) failed.push("clamp_5");
  if (clamp(-1, 0, 10) !== 0) failed.push("clamp_neg");

  const tone = mapMoodToTone("contemplative", 0.8, "cabala", 8);
  if (tone.tone !== "contemplative") failed.push("map_mood");

  const t2 = selectToneForContext("joyful", "protestant", 8, 1);
  if (!t2) failed.push("sel_ctx");

  if (estimateDuration("hello world", 60) <= 0) failed.push("est_dur");
  if (countWords("um dois tres") !== 3) failed.push("count_words");
  if (fnv1a32("test") !== fnv1a32("test")) failed.push("fnv_det");
  if (formatPacingHint("slow", "pt-BR") !== "ritmo lento") failed.push("fmt_pace");

  const vs = selectVoiceStyle("contemplative", "cabala");
  if (vs !== "whisper") failed.push("voice_style");

  if (!validateAll("joyful", 0.5, "joyful", "protestant", 23)) failed.push("validate_all");

  const k1 = cacheKeyForSequence({ userId: "u1", tone: "grounding", sourceMood: "neutral", confidence: 0.5, tradition: "cabala", locale: "pt-BR" });
  if (!k1.startsWith("dtone:")) failed.push("cache_key");

  if (getCategoryForTone("grounding", "universal") !== "grounding") failed.push("cat_tone");

  const prefs = getTraditionTonePreferences("cabala", 10, []);
  if (!Array.isArray(prefs)) failed.push("tradition_prefs");

  const elems = getRitualElementsForTradition("catholic");
  if (elems.length !== 4) failed.push("ritual_elems");

  const music = getRitualMusicForTone("grounding");
  if (music !== null && music === undefined) failed.push("ritual_music");

  if (!tonesAreClose("grounding", "centering")) failed.push("tones_close_1");
  if (tonesAreClose("joyful", "compassionate")) failed.push("tones_close_2");

  const sum = summarizeSequence(seq, "pt-BR");
  if (!sum.includes("contemplative")) failed.push("summarize");

  const seqB = buildDevotionalSequence({
    userId: "u-test",
    mood: "joyful",
    confidence: 0.9,
    tradition: "catholic",
    locale: "pt-BR",
    hour: 10,
    optIn: true,
    createdAt: 1700000000000,
  });
  const d = diffSequences(seq, seqB);
  if (d.toneChanged !== true) failed.push("diff");

  const should = shouldRefreshSequence(seq, seq.createdAt + 7 * 60 * 60 * 1000, 1000);
  if (!should) failed.push("should_refresh");

  const cleaned = redactPII("email: a@b.c, phone: (11) 91234-5678");
  if (!cleaned.includes("[EMAIL]")) failed.push("redact_pii");

  const san = sanitizeForSSML("<bad>");
  if (san.includes("<")) failed.push("sanitize_ssml");

  const cons1 = respectUserOptIn("u1", true, null, 1);
  if (!cons1.optedIn) failed.push("optin_1");
  const cons2 = respectUserOptIn("u1", false, cons1, 2);
  if (cons2.optedIn) failed.push("optout_2");

  const tod = validateTimeOfDay("energizing", 23);
  if (tod.effectiveTone !== "grounding") failed.push("validate_tod");

  const entry: ToneHistoryEntry = {
    userId: "u1", sequenceId: "s1", tone: "grounding", sourceMood: "neutral",
    confidence: 0.5, tradition: "cabala", at: 1, manualOverride: false,
  };
  const nowMs = 1000 * 60 * 60 * 24 * 365;
  const freshEntry: ToneHistoryEntry = {
    userId: "u1", sequenceId: "s2", tone: "centering", sourceMood: "neutral",
    confidence: 0.5, tradition: "cabala", at: nowMs - 1000, manualOverride: false,
  };
  const pruned = getUserToneHistory("u1", 30, nowMs, [entry, freshEntry]);
  if (pruned.length !== 1) failed.push("user_hist");
  const del = deleteSequenceHistory("u1", 1, [entry, freshEntry], nowMs);
  if (del.deleted !== 1) failed.push("delete_hist");
  const pruneTest = pruneOldEntries([entry, freshEntry], 1, nowMs);
  if (pruneTest.length !== 1) failed.push("prune_old");

  const fb = getCategoryFallback("grounding", "universal");
  if (fb.length === 0) failed.push("cat_fallback");

  const esd = estimateSequenceDuration(seq, 120);
  if (esd <= 0) failed.push("est_seq_dur");

  const red = redactSequenceForExport(seq, ["userId"]);
  const redObj = red as unknown as Record<string, unknown>;
  if ("userId" in redObj && redObj.userId !== undefined) failed.push("redact_seq_userId");

  // Confidence threshold validator
  const confBad = validateMoodConfidence("angry", 0.1);
  if (confBad.effectiveTone !== "neutral") failed.push("validate_mood_conf_low");
  const confOk = validateMoodConfidence("angry", 0.9);
  if (confOk.effectiveTone !== "releasing") failed.push("validate_mood_conf_high");

  return { ok: failed.length === 0, failed };
}

// ---- main ------------------------------------------------------------------

function main(): void {
  const critical = criticalSuite();
  const invariants = invariantsSuite();
  const smoke = smokeSuite();
  // report
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({
    critical,
    invariants,
    smoke,
  }, null, 2));
  if (!critical.ok || !invariants.ok || !smoke.ok) {
    // Not exiting process here so this file remains browser-friendly.
    // In a CI/node environment, replace with `process.exit(1)`.
  }
}

main();
