/**
 * smoke.mjs — runtime smoke test (6+ scenarios) for w66/audio-video-posts
 *
 * Runs via: node --experimental-strip-types src/lib/w66/smoke.mjs
 * (after tsc strip-types compile).
 *
 * Validates the 6 critical paths end-to-end against real engine code.
 */
import {
  MEDIA_FORMATS,
  MEDIA_LIMITS,
  AUDIO_FORMATS,
  VIDEO_FORMATS,
  validateMediaPost,
  createAudioPost,
  createVideoPost,
  extractDurationMp3,
  extractDurationMp4,
  extractDurationWebm,
  generateWaveformDataUri,
  generateVideoContactSheetDataUri,
  auditMediaCoverage,
  chainMediaHash,
  verifyMediaHashLink,
  GENESIS_MEDIA_HASH,
  isAudioPost,
  isVideoPost,
  isSacredMediaRef,
  getMediaKind,
  clampMediaSize,
  sacredMediaRefs,
  CIGANO_CARDS,
  ORIXAS,
  CHAKRAS,
  SEFIROT,
  ASTROLOGIA,
  IS_FULL_COVERAGE,
  InvalidMediaFormatError,
  MediaSizeExceededError,
  MediaConsentMissingError,
  DurationParseError,
} from "./audio-video-posts.ts";

let passed = 0;
let failed = 0;
const errors = [];

function check(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ✗ ${name}: ${e instanceof Error ? e.message : String(e)}`);
    failed++;
    errors.push(name + ": " + (e instanceof Error ? e.message : String(e)));
  }
}

function makeMp3Buffer() {
  const header = new Uint8Array(4);
  header[0] = 0xff; header[1] = 0xfb; header[2] = 0x90; header[3] = 0x00;
  const frameSize = Math.floor((144 * 128000) / 44100);
  const buf = new Uint8Array(frameSize + 4096);
  buf.set(header, 0);
  for (let i = 4; i < buf.length; i++) buf[i] = (i * 7 + 13) & 0xff;
  return buf;
}

function makeMp4Buffer(durationSec) {
  const ftyp = new Uint8Array(32);
  ftyp[3] = 32; ftyp[4] = 0x66; ftyp[5] = 0x74; ftyp[6] = 0x79; ftyp[7] = 0x70;

  const mvhdPayload = new Uint8Array(100);
  mvhdPayload[12] = 0; mvhdPayload[13] = 0; mvhdPayload[14] = 0x03; mvhdPayload[15] = 0xe8;
  const dur = durationSec * 1000;
  mvhdPayload[16] = (dur >> 24) & 0xff;
  mvhdPayload[17] = (dur >> 16) & 0xff;
  mvhdPayload[18] = (dur >> 8) & 0xff;
  mvhdPayload[19] = dur & 0xff;

  const mvhdBoxSize = 8 + mvhdPayload.length;
  const mvhd = new Uint8Array(mvhdBoxSize);
  mvhd[3] = mvhdBoxSize; mvhd[4] = 0x6d; mvhd[5] = 0x76; mvhd[6] = 0x68; mvhd[7] = 0x64;
  mvhd.set(mvhdPayload, 8);

  const moovBoxSize = 8 + mvhd.length;
  const moov = new Uint8Array(moovBoxSize);
  moov[3] = moovBoxSize; moov[4] = 0x6d; moov[5] = 0x6f; moov[6] = 0x6f; moov[7] = 0x76;
  moov.set(mvhd, 8);

  const result = new Uint8Array(ftyp.length + moov.length);
  result.set(ftyp, 0); result.set(moov, ftyp.length);
  return result;
}

function makeWebmBuffer() {
  const ebml = new Uint8Array(4);
  ebml[0] = 0x1a; ebml[1] = 0x45; ebml[2] = 0xdf; ebml[3] = 0xa3;

  const durBytes = new Uint8Array(8);
  const dv = new DataView(durBytes.buffer);
  dv.setFloat64(0, 12000.0, false);  // 12000 timecode units = 12 seconds at 1ms/unit

  const durEl = new Uint8Array([0x44, 0x89, 0x88, ...durBytes]);
  const tsEl = new Uint8Array([0x2a, 0xd7, 0xb1, 0x83, 0x0f, 0x42, 0x40]);

  const segPayload = new Uint8Array(durEl.length + tsEl.length);
  segPayload.set(durEl, 0); segPayload.set(tsEl, durEl.length);

  const segId = new Uint8Array([0x18, 0x53, 0x80, 0x67]);
  const segSizeByte = 0x80 | (segPayload.length & 0x7f);
  const segment = new Uint8Array(segId.length + 1 + segPayload.length);
  segment.set(segId, 0);
  segment[segId.length] = segSizeByte;
  segment.set(segPayload, segId.length + 1);

  const result = new Uint8Array(ebml.length + segment.length);
  result.set(ebml, 0); result.set(segment, ebml.length);
  return result;
}

function makeConsent(opts) {
  const voice = opts?.voice ?? true;
  const face = opts?.face ?? true;
  return {
    faceConsent: face,
    voiceConsent: voice,
    grantedAt: new Date(Date.now() - 60000).toISOString(),
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
  };
}

console.log("\n=== W66 audio-video-posts smoke ===");

// Smoke 1: format whitelist + limits + media kind dispatch
check("smoke-1: MEDIA_FORMATS + MEDIA_LIMITS + getMediaKind dispatch", () => {
  if (AUDIO_FORMATS.length !== 3) throw new Error(`AUDIO_FORMATS=${AUDIO_FORMATS.length}`);
  if (VIDEO_FORMATS.length !== 2) throw new Error(`VIDEO_FORMATS=${VIDEO_FORMATS.length}`);
  if (MEDIA_FORMATS.audio.length !== 3) throw new Error("MEDIA_FORMATS.audio");
  if (MEDIA_FORMATS.video.length !== 2) throw new Error("MEDIA_FORMATS.video");
  if (MEDIA_LIMITS.audio.maxBytes !== 15 * 1024 * 1024) throw new Error("audio.maxBytes");
  if (MEDIA_LIMITS.video.maxBytes !== 50 * 1024 * 1024) throw new Error("video.maxBytes");
  if (getMediaKind("mp3") !== "audio") throw new Error("mp3→audio");
  if (getMediaKind("mp4") !== "video") throw new Error("mp4→video");
  let threw = false;
  try { getMediaKind("wma"); } catch (e) { if (e instanceof InvalidMediaFormatError) threw = true; }
  if (!threw) throw new Error("expected InvalidMediaFormatError on wma");
});

// Smoke 2: validateMediaPost 4-layer defense (format, size, consent, duration)
check("smoke-2: validateMediaPost 4-layer defense", () => {
  // ok path
  const okAudio = validateMediaPost({
    kind: "audio", format: "mp3", buffer: makeMp3Buffer(),
    caption: "Cigano", consent: makeConsent(),
  });
  if (!okAudio.ok) throw new Error("ok audio validation failed");
  // format layer
  const badFmt = validateMediaPost({
    kind: "audio", format: "aac", buffer: makeMp3Buffer(),
    caption: "x", consent: makeConsent(),
  });
  if (badFmt.ok || !badFmt.errors.includes("invalid_format")) throw new Error("format layer not caught");
  // size layer
  const big = new Uint8Array(16 * 1024 * 1024);
  const badSize = validateMediaPost({
    kind: "audio", format: "mp3", buffer: big,
    caption: "x", consent: makeConsent(),
  });
  if (badSize.ok || !badSize.errors.includes("size_exceeded")) throw new Error("size layer not caught");
  // consent layer
  const badConsent = validateMediaPost({
    kind: "video", format: "mp4", buffer: makeMp4Buffer(30),
    caption: "x", consent: makeConsent({ face: false }),
  });
  if (badConsent.ok || !badConsent.errors.includes("video_face_consent_required")) throw new Error("consent layer not caught");
});

// Smoke 3: extractDurationMp3 + extractDurationMp4 + extractDurationWebm all return > 0
check("smoke-3: 3 hand-rolled duration extractors all return > 0", () => {
  const d1 = extractDurationMp3(makeMp3Buffer());
  if (!(d1 > 0)) throw new Error(`mp3 duration=${d1}`);
  const d2 = extractDurationMp4(makeMp4Buffer(45));
  if (d2 !== 45) throw new Error(`mp4 duration=${d2}, expected 45`);
  const d3 = extractDurationWebm(makeWebmBuffer());
  if (d3 !== 12) throw new Error(`webm duration=${d3}, expected 12`);
});

// Smoke 4: waveform + contact-sheet SVG data URIs (no canvas)
check("smoke-4: generateWaveformDataUri + generateVideoContactSheetDataUri", () => {
  const wf = generateWaveformDataUri(makeMp3Buffer(), 256);
  if (!wf.startsWith("data:image/svg+xml;base64,")) throw new Error("waveform URI prefix");
  const wfDecoded = Buffer.from(wf.slice("data:image/svg+xml;base64,".length), "base64").toString("utf8");
  const rectCount = (wfDecoded.match(/<rect /g) ?? []).length;
  if (rectCount !== 256) throw new Error(`waveform rects=${rectCount}, expected 256`);
  const cs = generateVideoContactSheetDataUri(makeMp4Buffer(30), 9);
  if (!cs.startsWith("data:image/svg+xml;base64,")) throw new Error("contact-sheet URI prefix");
  const csDecoded = Buffer.from(cs.slice("data:image/svg+xml;base64,".length), "base64").toString("utf8");
  const csRects = (csDecoded.match(/<rect /g) ?? []).length;
  if (csRects !== 9) throw new Error(`contact-sheet rects=${csRects}, expected 9`);
});

// Smoke 5: HMAC chain genesis → audio → video → cross-link verify
check("smoke-5: HMAC chain genesis → audio → video → cross-link verify", () => {
  const audio = createAudioPost({
    authorId: "user_smoke_001", pseudonymSalt: "smoke-salt",
    caption: "Cigano Cavaleiro Oxum Keter Áries Muladhara",
    format: "mp3", buffer: makeMp3Buffer(),
    consent: makeConsent(),
    secret: "smoke-secret-w66",
  });
  if (!isAudioPost(audio)) throw new Error("audio type guard");
  if (!/^[0-9a-f]{64}$/.test(audio.auditHash)) throw new Error(`audio.auditHash=${audio.auditHash}`);
  if (audio.authorPseudonym === "user_smoke_001") throw new Error("authorId NOT pseudonymized");
  if (audio.sacredRefs.length < 5) throw new Error(`sacredRefs=${audio.sacredRefs.length}`);

  const video = createVideoPost({
    authorId: "user_smoke_001", pseudonymSalt: "smoke-salt",
    caption: "Mesa Real video — 5 tradições",
    format: "mp4", buffer: makeMp4Buffer(60),
    consent: makeConsent(),
    includeContactSheet: true,
    secret: "smoke-secret-w66",
  });
  if (!isVideoPost(video)) throw new Error("video type guard");
  if (video.contactSheetDataUri === null) throw new Error("contactSheet null");

  // chain: genesis → audio → video
  const audioLink = chainMediaHash(GENESIS_MEDIA_HASH, audio.auditHash, "smoke-secret-w66");
  const videoLink = chainMediaHash(audioLink, video.auditHash, "smoke-secret-w66");
  if (!/^[0-9a-f]{64}$/.test(audioLink)) throw new Error("audio link not hex");
  if (!/^[0-9a-f]{64}$/.test(videoLink)) throw new Error("video link not hex");
  if (!verifyMediaHashLink(GENESIS_MEDIA_HASH, audio.auditHash, audioLink, "smoke-secret-w66")) throw new Error("audio verify failed");
  if (!verifyMediaHashLink(audioLink, video.auditHash, videoLink, "smoke-secret-w66")) throw new Error("video verify failed");
  // tamper detection
  if (verifyMediaHashLink("tampered", audio.auditHash, audioLink, "smoke-secret-w66")) throw new Error("tamper not detected");
});

// Smoke 6: LGPD consent gates (audio voice=false → throw; video face=false → throw; expired → throw)
check("smoke-6: LGPD consent gates enforced (audio voice, video face, expired)", () => {
  // audio: voice=false
  let threw = false;
  try {
    createAudioPost({
      authorId: "u", pseudonymSalt: "s",
      caption: "Cigano",
      format: "mp3", buffer: makeMp3Buffer(),
      consent: makeConsent({ voice: false }),
      secret: "s",
    });
  } catch (e) { if (e instanceof MediaConsentMissingError) threw = true; }
  if (!threw) throw new Error("audio: expected MediaConsentMissingError on voice=false");

  // video: face=false
  threw = false;
  try {
    createVideoPost({
      authorId: "u", pseudonymSalt: "s",
      caption: "Mesa Real",
      format: "mp4", buffer: makeMp4Buffer(30),
      consent: makeConsent({ face: false }),
      secret: "s",
    });
  } catch (e) { if (e instanceof MediaConsentMissingError) threw = true; }
  if (!threw) throw new Error("video: expected MediaConsentMissingError on face=false");

  // expired consent (validate returns ok=false with consent_expired)
  const expired = {
    faceConsent: true, voiceConsent: true,
    grantedAt: new Date(Date.now() - 7200000).toISOString(),
    expiresAt: new Date(Date.now() - 3600000).toISOString(),
  };
  const v = validateMediaPost({
    kind: "audio", format: "mp3", buffer: makeMp3Buffer(),
    caption: "Cigano",
    consent: expired,
  });
  if (v.ok || !v.errors.includes("consent_expired")) throw new Error("expired consent not caught");

  // 16MB audio → MediaSizeExceededError
  threw = false;
  const tooBig = new Uint8Array(16 * 1024 * 1024);
  try {
    createAudioPost({
      authorId: "u", pseudonymSalt: "s",
      caption: "Cigano",
      format: "mp3", buffer: tooBig,
      consent: makeConsent(),
      secret: "s",
    });
  } catch (e) { if (e instanceof MediaSizeExceededError) threw = true; }
  if (!threw) throw new Error("16MB audio: expected MediaSizeExceededError");
});

// Smoke 7 (bonus): isFullCoverage audit gate + sacred coverage
check("smoke-7: auditMediaCoverage isFullCoverage=true with 87 symbols", () => {
  const a = auditMediaCoverage();
  if (!a.isFullCoverage) throw new Error("isFullCoverage=false; gaps=" + a.gaps.join(","));
  if (a.total !== 87) throw new Error(`total=${a.total}, expected 87`);
  if (!IS_FULL_COVERAGE) throw new Error("IS_FULL_COVERAGE module-init flag=false");
  const sum = CIGANO_CARDS.length + ORIXAS.length + CHAKRAS.length + SEFIROT.length + ASTROLOGIA.length;
  if (sum !== 87) throw new Error(`sum of catalogs=${sum}`);
  // floor checks
  if (!a.floorMet.CIGANO) throw new Error("CIGANO floor");
  if (!a.floorMet.ORIXAS) throw new Error("ORIXAS floor");
  if (!a.floorMet.CHAKRAS) throw new Error("CHAKRAS floor");
  if (!a.floorMet.SEFIROT) throw new Error("SEFIROT floor");
  if (!a.floorMet.ASTROLOGIA) throw new Error("ASTROLOGIA floor");
});

console.log(`\n=== smoke result: ${passed}/${passed + failed} passed ===`);
if (failed > 0) {
  for (const e of errors) console.log("  - " + e);
  process.exit(1);
}
console.log("✅ all smoke scenarios PASS");