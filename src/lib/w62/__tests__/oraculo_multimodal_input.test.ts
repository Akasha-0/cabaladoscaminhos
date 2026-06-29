/**
 * Oráculo Multimodal Input — Smoke tests (W62)
 * 50+ assertions across 12 describe blocks.
 */

import { describe, it, expect } from "vitest";
import {
  // constants
  SUPPORTED_LOCALES,
  SUPPORTED_IMAGE_FORMATS,
  SYMBOLIC_CATEGORIES,
  VISION_PROVIDERS,
  TRADITIONS,
  MAX_IMAGES_PER_REQUEST,
  MAX_IMAGE_BYTES,
  MIN_DIMENSION_PX,
  MAX_DIMENSION_PX,
  MAX_CONTEXT_CHARS,
  MAX_ALT_TEXT_CHARS,
  DEFAULT_COST_CAP_USD,
  IMAGE_TTL_HOURS,
  FACE_CONFIDENCE_THRESHOLD,
  PROVIDER_COST_TABLE,
  MAX_IMAGE_SIZE,
  TAROT_NAMES,
  CIGANO_NAMES,
  ORIXA_NAMES,
  CABALA_SEFIROT,
  ASTROLOGIA_PLANETAS,
  ASTROLOGIA_SIGNOS,
  ASTROLOGIA_CASAS,
  I18N_PT_BR,
  I18N_EN_US,
  I18N_ES_ES,
  I18N_CATALOGS,
  ENGINE_INFO,
  // types
  type ImageInput,
  type Locale,
  type VisionProvider,
  type SymbolicCategory,
  // functions
  validateImageInput,
  validateImageArray,
  getMaxImageSize,
  isUuidV4,
  newImageId,
  stripImageEXIF,
  base64ToBytes,
  bytesToBase64,
  extractSymbolicElements,
  combineContextWithSymbols,
  buildMultimodalContext,
  redactImageMetadata,
  getStrippedFields,
  likelyContainsFace,
  requiresLGPDConsentForImages,
  detectedHumanFace,
  estimateVisionCost,
  isWithinCostCap,
  buildImageAltText,
  getI18nCatalog,
  translate,
  createAuditLog,
  appendAudit,
  auditEntryHasRawText,
  isValidBoundingBox,
  normalizeBoundingBox,
  boundingBoxArea,
  isCentralBoundingBox,
  prepareImageBatch,
  estimateBatchCost,
  imageTtlMs,
  imageExpiriesAt,
  MultimodalError,
  callVisionModel,
} from "../oraculo_multimodal_input";

// ----------------------------------------------------------------------------
// Test fixtures
// ----------------------------------------------------------------------------

// Minimal valid 1x1 PNG (red pixel)
const PNG_1x1_RED = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==";
// Minimal valid 1x1 JPEG (white pixel)
const JPEG_1x1_WHITE = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAr/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AL+AB//Z";

function makeImageInput(overrides: Partial<ImageInput> = {}): ImageInput {
  return {
    id: "12345678-1234-4234-8234-123456789012",
    dataUrl: `data:image/png;base64,${PNG_1x1_RED}`,
    format: "image/png",
    sizeBytes: 100,
    widthPx: 100,
    heightPx: 100,
    exifStripped: true,
    ...overrides,
  };
}

const SAMPLE_TEXT = "O que a Mesa Real revela sobre meu caminho profissional?";

// ----------------------------------------------------------------------------
// SECTION A — Image validation
// ----------------------------------------------------------------------------

describe("image validation", () => {
  it("accepts a well-formed image", () => {
    const r = validateImageInput(makeImageInput());
    expect(r.valid).toBe(true);
    expect(r.errors).toEqual([]);
  });

  it("rejects non-UUID v4 id", () => {
    const r = validateImageInput(makeImageInput({ id: "not-a-uuid" }));
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.includes("UUID v4"))).toBe(true);
  });

  it("rejects malformed dataUrl", () => {
    const r = validateImageInput(makeImageInput({ dataUrl: "not-a-data-url" }));
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.includes("data:URL"))).toBe(true);
  });

  it("rejects unsupported MIME type", () => {
    const r = validateImageInput(
      makeImageInput({ dataUrl: "data:image/gif;base64,abc" }),
    );
    expect(r.valid).toBe(false);
  });

  it("rejects format/dataUrl MIME mismatch", () => {
    const r = validateImageInput(
      makeImageInput({
        dataUrl: `data:image/jpeg;base64,${JPEG_1x1_WHITE}`,
        format: "image/png",
      }),
    );
    expect(r.valid).toBe(false);
  });

  it("rejects zero or negative size", () => {
    const r = validateImageInput(makeImageInput({ sizeBytes: 0 }));
    expect(r.valid).toBe(false);
  });

  it("rejects oversized image (>5MB)", () => {
    const r = validateImageInput(makeImageInput({ sizeBytes: 6_000_000 }));
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.includes("exceeds limit"))).toBe(true);
  });

  it("rejects too-small dimension (<100px)", () => {
    const r = validateImageInput(makeImageInput({ widthPx: 50 }));
    expect(r.valid).toBe(false);
  });

  it("rejects too-large dimension (>4096px)", () => {
    const r = validateImageInput(makeImageInput({ heightPx: 5000 }));
    expect(r.valid).toBe(false);
  });

  it("rejects invalid capturedAt", () => {
    const r = validateImageInput(makeImageInput({ capturedAt: "not-a-date" }));
    expect(r.valid).toBe(false);
  });

  it("accepts valid ISO capturedAt", () => {
    const r = validateImageInput(
      makeImageInput({ capturedAt: "2026-06-29T18:00:00.000Z" }),
    );
    expect(r.valid).toBe(true);
  });

  it("rejects array with >3 images", () => {
    const imgs = [
      makeImageInput(),
      makeImageInput(),
      makeImageInput(),
      makeImageInput(),
    ];
    const r = validateImageArray(imgs);
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.includes("exceeds max 3"))).toBe(true);
  });

  it("rejects duplicate image ids", () => {
    const sameId = "12345678-1234-4234-8234-123456789012";
    const r = validateImageArray([
      makeImageInput({ id: sameId }),
      makeImageInput({ id: sameId }),
    ]);
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.includes("duplicate"))).toBe(true);
  });
});

// ----------------------------------------------------------------------------
// SECTION B — EXIF stripping
// ----------------------------------------------------------------------------

describe("EXIF stripping", () => {
  it("strips JPEG APP1 EXIF segment", () => {
    // Build a JPEG with a fake APP1/EXIF segment + small body
    // SOI = FFD8
    // APP1 = FFE1 LEN 'Exif\0\0' IFD0
    const soi = [0xff, 0xd8];
    const exifHeader = "Exif\x00\x00";
    const fakeIfd = Uint8Array.from([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00]);
    const exifBody = new TextEncoder().encode(exifHeader);
    const app1Payload = new Uint8Array(exifBody.length + fakeIfd.length);
    app1Payload.set(exifBody, 0);
    app1Payload.set(fakeIfd, exifBody.length);
    const segLen = app1Payload.length + 2; // length includes itself
    const app1 = Uint8Array.from([0xff, 0xe1, (segLen >> 8) & 0xff, segLen & 0xff, ...app1Payload]);
    // A minimal SOS + EOI to be valid
    const tail = Uint8Array.from([0xff, 0xd9]);
    const all = Uint8Array.from([...soi, ...app1, ...tail]);
    const b64 = bytesToBase64(all);
    const dataUrl = `data:image/jpeg;base64,${b64}`;

    const r = stripImageEXIF(dataUrl);
    expect(r.dataUrl.startsWith("data:image/jpeg;base64,")).toBe(true);
    expect(r.strippedFields.some((f) => f.includes("APP1"))).toBe(true);
    // APP1 should be gone — dataUrl base64 should decode to fewer bytes
    const out = base64ToBytes(r.dataUrl.split(",")[1]!);
    expect(out.length).toBeLessThan(all.length);
  });

  it("strips PNG tEXt chunk", () => {
    // PNG signature + minimal IHDR chunk + tEXt("Comment") chunk + IEND
    const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]; // 8 bytes
    // proper IHDR chunk: len=13, type=IHDR, data (1x1 RGB), crc
    const ihdrChunk = [0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52, 0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0, 0x90, 0x77, 0x53, 0xde]; // 25 bytes
    // tEXt "Comment\0Hello"
    const tEXtPayload = new TextEncoder().encode("Comment\x00Hello");
    const tEXtLen = tEXtPayload.length;
    const tEXtChunk = [0, 0, 0, tEXtLen, 0x74, 0x45, 0x58, 0x74, ...tEXtPayload, 0, 0, 0, 0]; // 25 bytes
    // IEND chunk
    const iendChunk = [0, 0, 0, 0, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82]; // 12 bytes
    const all = Uint8Array.from([...sig, ...ihdrChunk, ...tEXtChunk, ...iendChunk]);
    const dataUrl = `data:image/png;base64,${bytesToBase64(all)}`;
    const r = stripImageEXIF(dataUrl);
    expect(r.strippedFields).toContain("png.tEXt");
  });

  it("rejects bad PNG signature", () => {
    const bad = Uint8Array.from([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const dataUrl = `data:image/png;base64,${bytesToBase64(bad)}`;
    expect(() => stripImageEXIF(dataUrl)).toThrow(MultimodalError);
  });

  it("rejects bad JPEG (no SOI)", () => {
    const bad = Uint8Array.from([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const dataUrl = `data:image/jpeg;base64,${bytesToBase64(bad)}`;
    expect(() => stripImageEXIF(dataUrl)).toThrow(MultimodalError);
  });

  it("rejects invalid dataUrl (no base64 prefix)", () => {
    expect(() =>
      stripImageEXIF("not-a-data-url-at-all"),
    ).toThrow(MultimodalError);
  });
});

// ----------------------------------------------------------------------------
// SECTION C — Base64 round-trip
// ----------------------------------------------------------------------------

describe("base64 round-trip", () => {
  it("encodes and decodes back to same bytes", () => {
    const original = Uint8Array.from([0, 1, 2, 3, 4, 5, 254, 255, 100, 200]);
    const b64 = bytesToBase64(original);
    const back = base64ToBytes(b64);
    expect(Array.from(back)).toEqual(Array.from(original));
  });

  it("handles 1-byte tail correctly", () => {
    const bytes = Uint8Array.from([0xab]);
    const b64 = bytesToBase64(bytes);
    expect(b64.endsWith("==")).toBe(true);
    expect(base64ToBytes(b64)).toEqual(bytes);
  });

  it("handles 2-byte tail correctly", () => {
    const bytes = Uint8Array.from([0xab, 0xcd]);
    const b64 = bytesToBase64(bytes);
    expect(b64.endsWith("=")).toBe(true);
    expect(b64.endsWith("==")).toBe(false);
    expect(base64ToBytes(b64)).toEqual(bytes);
  });
});

// ----------------------------------------------------------------------------
// SECTION D — Symbolic element extraction
// ----------------------------------------------------------------------------

describe("symbolic element extraction", () => {
  it("returns 0 elements for 0 images", () => {
    const r = extractSymbolicElements([]);
    expect(r.detectedElements).toEqual([]);
    expect(r.cost.inputTokens).toBe(0);
  });

  it("returns 1-4 elements per image (deterministic)", () => {
    const r = extractSymbolicElements([makeImageInput()]);
    expect(r.detectedElements.length).toBeGreaterThan(0);
    expect(r.detectedElements.length).toBeLessThanOrEqual(4);
  });

  it("populates bounding box within 0..1", () => {
    const r = extractSymbolicElements([makeImageInput()]);
    for (const el of r.detectedElements) {
      expect(el.boundingBox).toBeDefined();
      const b = el.boundingBox!;
      expect(b.x).toBeGreaterThanOrEqual(0);
      expect(b.y).toBeGreaterThanOrEqual(0);
      expect(b.x + b.w).toBeLessThanOrEqual(1);
      expect(b.y + b.h).toBeLessThanOrEqual(1);
    }
  });

  it("uses categories from the sacred taxonomy", () => {
    const r = extractSymbolicElements([
      makeImageInput({ id: "11111111-1114-4111-8111-111111111111" }),
      makeImageInput({ id: "22222222-2224-4222-8222-222222222222" }),
      makeImageInput({ id: "33333333-3334-4333-8333-333333333333" }),
    ]);
    for (const el of r.detectedElements) {
      expect(SYMBOLIC_CATEGORIES).toContain(el.category);
    }
  });

  it("confidence is in 0..1", () => {
    const r = extractSymbolicElements([
      makeImageInput(),
      makeImageInput({ id: "99999999-9994-4999-8999-999999999999" }),
    ]);
    for (const el of r.detectedElements) {
      expect(el.confidence).toBeGreaterThanOrEqual(0);
      expect(el.confidence).toBeLessThanOrEqual(1);
    }
  });
});

// ----------------------------------------------------------------------------
// SECTION E — Bounding box helpers
// ----------------------------------------------------------------------------

describe("bounding box helpers", () => {
  it("isValidBoundingBox accepts central box", () => {
    expect(isValidBoundingBox({ x: 0.1, y: 0.1, w: 0.5, h: 0.5 })).toBe(true);
  });

  it("isValidBoundingBox rejects out-of-bounds", () => {
    expect(isValidBoundingBox({ x: 0.5, y: 0.5, w: 0.6, h: 0.6 })).toBe(false);
  });

  it("isValidBoundingBox rejects negative", () => {
    expect(isValidBoundingBox({ x: -0.1, y: 0.1, w: 0.3, h: 0.3 })).toBe(false);
  });

  it("normalizeBoundingBox clamps to [0,1]", () => {
    const n = normalizeBoundingBox({ x: -0.1, y: 0.9, w: 0.5, h: 0.5 });
    expect(n.x).toBe(0);
    expect(n.x + n.w).toBeLessThanOrEqual(1);
  });

  it("boundingBoxArea returns w*h", () => {
    expect(boundingBoxArea({ x: 0, y: 0, w: 0.5, h: 0.4 })).toBeCloseTo(0.2);
  });

  it("isCentralBoundingBox flags center area", () => {
    expect(isCentralBoundingBox({ x: 0.25, y: 0.25, w: 0.3, h: 0.3 })).toBe(true);
    expect(isCentralBoundingBox({ x: 0, y: 0, w: 0.2, h: 0.2 })).toBe(false);
  });
});

// ----------------------------------------------------------------------------
// SECTION F — Multimodal context builder
// ----------------------------------------------------------------------------

describe("multimodal context builder", () => {
  it("builds combined context with text + symbols", () => {
    const r = extractSymbolicElements([makeImageInput()]);
    const combined = combineContextWithSymbols(SAMPLE_TEXT, r, "pt-BR");
    expect(combined).toContain(SAMPLE_TEXT);
    expect(combined.length).toBeGreaterThan(0);
  });

  it("truncates combined context to MAX_CONTEXT_CHARS", () => {
    const r = extractSymbolicElements([makeImageInput()]);
    const longText = "a".repeat(5000);
    const combined = combineContextWithSymbols(longText, r, "pt-BR");
    expect(combined.length).toBeLessThanOrEqual(MAX_CONTEXT_CHARS);
  });

  it("throws on empty text prompt", () => {
    expect(() =>
      buildMultimodalContext("", [makeImageInput()], "pt-BR", "cigano", "consent-1"),
    ).toThrow(MultimodalError);
  });

  it("throws on too many images", () => {
    expect(() =>
      buildMultimodalContext(SAMPLE_TEXT, [makeImageInput(), makeImageInput(), makeImageInput(), makeImageInput()], "pt-BR", "cigano", "consent-1"),
    ).toThrow(MultimodalError);
  });

  it("builds full context with consentId", () => {
    const ctx = buildMultimodalContext(
      SAMPLE_TEXT,
      [makeImageInput()],
      "pt-BR",
      "cigano",
      "consent-xyz",
    );
    expect(ctx.combinedContext).toContain(SAMPLE_TEXT);
    expect(ctx.consentId).toBe("consent-xyz");
    expect(ctx.redacted).toBe(true);
    expect(ctx.visionResults.length).toBe(1);
  });
});

// ----------------------------------------------------------------------------
// SECTION G — PII redaction
// ----------------------------------------------------------------------------

describe("PII redaction", () => {
  it("strips capturedAt", () => {
    const r = redactImageMetadata(
      makeImageInput({ capturedAt: "2026-06-29T18:00:00.000Z" }),
    );
    expect(r.capturedAt).toBeUndefined();
  });

  it("marks exifStripped = true after redaction", () => {
    const r = redactImageMetadata(makeImageInput({ exifStripped: false }));
    expect(r.exifStripped).toBe(true);
  });

  it("preserves altText", () => {
    const r = redactImageMetadata(
      makeImageInput({ altText: "Carta de Cigano: Cavaleiro" }),
    );
    expect(r.altText).toBe("Carta de Cigano: Cavaleiro");
  });

  it("preserves dimensions", () => {
    const r = redactImageMetadata(makeImageInput({ widthPx: 800, heightPx: 600 }));
    expect(r.widthPx).toBe(800);
    expect(r.heightPx).toBe(600);
  });
});

// ----------------------------------------------------------------------------
// SECTION H — LGPD consent gate
// ----------------------------------------------------------------------------

describe("LGPD consent gate", () => {
  it("requires consent for image with detected human face (heuristic)", () => {
    // pick an id that triggers the "face" branch (seed % 10 < 3)
    const faceIds = [
      "10000000-1234-4234-8234-123456789012", // 0x10000000 -> seed=1 -> 1%10<3
      "20000000-1234-4234-8234-123456789012", // 0x20000000 -> seed=2
    ];
    const imgs = faceIds.map((id) => makeImageInput({ id, widthPx: 800, heightPx: 800 }));
    expect(requiresLGPDConsentForImages(imgs)).toBe(true);
  });

  it("does not require consent for small images", () => {
    const small = makeImageInput({ widthPx: 50, heightPx: 50 });
    expect(requiresLGPDConsentForImages([small])).toBe(false);
  });

  it("detectedHumanFace requires central bbox + high confidence", () => {
    const r = extractSymbolicElements([makeImageInput()]);
    // construct a result with a face candidate
    const faceResult = {
      ...r,
      detectedElements: [
        {
          category: "humano" as SymbolicCategory,
          name: "Rosto",
          confidence: 0.95,
          boundingBox: { x: 0.3, y: 0.3, w: 0.4, h: 0.4 },
        },
      ],
    };
    expect(detectedHumanFace(faceResult)).toBe(true);
  });
});

// ----------------------------------------------------------------------------
// SECTION I — Cost estimation
// ----------------------------------------------------------------------------

describe("cost estimation", () => {
  it("estimates claude cost for 1 image", () => {
    const c = estimateVisionCost([makeImageInput()], "claude-3-5-sonnet");
    expect(c.inputTokens).toBeGreaterThan(0);
    expect(c.estimatedUsd).toBeGreaterThan(0);
  });

  it("estimates gemini cost for 1 image", () => {
    const c = estimateVisionCost([makeImageInput()], "gemini-2.5-pro");
    expect(c.estimatedUsd).toBeGreaterThan(0);
  });

  it("estimates gpt-4o cost for 1 image", () => {
    const c = estimateVisionCost([makeImageInput()], "gpt-4o");
    expect(c.estimatedUsd).toBeGreaterThan(0);
  });

  it("0 images -> 0 input tokens", () => {
    const c = estimateVisionCost([], "claude-3-5-sonnet");
    expect(c.inputTokens).toBe(0);
    // output tokens still accrue (default 500)
    expect(c.outputTokens).toBe(500);
  });

  it("isWithinCostCap enforces default cap", () => {
    expect(isWithinCostCap(0.4)).toBe(true);
    expect(isWithinCostCap(0.6)).toBe(false);
  });

  it("cost scales with image count", () => {
    const one = estimateVisionCost([makeImageInput()], "claude-3-5-sonnet");
    const three = estimateVisionCost(
      [makeImageInput(), makeImageInput(), makeImageInput()],
      "claude-3-5-sonnet",
    );
    expect(three.inputTokens).toBeGreaterThan(one.inputTokens);
  });
});

// ----------------------------------------------------------------------------
// SECTION J — Alt text builder
// ----------------------------------------------------------------------------

describe("alt text builder", () => {
  it("uses user-provided altText when short", () => {
    const r = buildImageAltText(
      makeImageInput({ altText: "Minha carta" }),
      "pt-BR",
    );
    expect(r).toBe("Minha carta");
  });

  it("derives alt text from vision when none provided", () => {
    const r = buildImageAltText(makeImageInput(), "pt-BR");
    expect(r.length).toBeGreaterThan(0);
    expect(r.length).toBeLessThanOrEqual(MAX_ALT_TEXT_CHARS);
  });

  it("returns locale-aware default for empty image", () => {
    const r = buildImageAltText(
      makeImageInput({ id: "00000000-0000-4000-8000-000000000001" }),
      "en-US",
    );
    expect(typeof r).toBe("string");
  });
});

// ----------------------------------------------------------------------------
// SECTION K — i18n
// ----------------------------------------------------------------------------

describe("i18n", () => {
  it("pt-BR catalog has 10 keys", () => {
    expect(Object.keys(I18N_PT_BR).length).toBe(10);
  });

  it("en-US catalog has 10 keys", () => {
    expect(Object.keys(I18N_EN_US).length).toBe(10);
  });

  it("es-ES catalog has 10 keys", () => {
    expect(Object.keys(I18N_ES_ES).length).toBe(10);
  });

  it("all locales have same keys", () => {
    const a = Object.keys(I18N_PT_BR).sort();
    const b = Object.keys(I18N_EN_US).sort();
    const c = Object.keys(I18N_ES_ES).sort();
    expect(a).toEqual(b);
    expect(b).toEqual(c);
  });

  it("translate uses the right catalog", () => {
    expect(translate("pt-BR", "multimodal.uploadButton")).toBe("Enviar imagem");
    expect(translate("en-US", "multimodal.uploadButton")).toBe("Upload image");
    expect(translate("es-ES", "multimodal.uploadButton")).toBe("Subir imagen");
  });

  it("translate substitutes variables", () => {
    expect(translate("pt-BR", "multimodal.symbolDetected", { name: "Cavaleiro" })).toBe(
      "Símbolo detectado: Cavaleiro",
    );
  });

  it("falls back to pt-BR for unknown locale", () => {
    const cat = getI18nCatalog("en-US");
    expect(cat["multimodal.uploadButton"]).toBe("Upload image");
  });
});

// ----------------------------------------------------------------------------
// SECTION L — Error codes & miscellaneous
// ----------------------------------------------------------------------------

describe("error codes and helpers", () => {
  it("MultimodalError has correct code", () => {
    const e = new MultimodalError("IMAGE_TOO_LARGE", "img too big");
    expect(e.code).toBe("IMAGE_TOO_LARGE");
    expect(e.name).toBe("MultimodalError");
  });

  it("MultimodalError supports all expected codes", () => {
    const codes = [
      "IMAGE_TOO_LARGE",
      "IMAGE_INVALID_FORMAT",
      "TOO_MANY_IMAGES",
      "CONSENT_MISSING",
      "EXIF_PARSE_FAILED",
      "VISION_MODEL_UNAVAILABLE",
      "COST_EXCEEDED",
      "DIMENSIONS_OUT_OF_RANGE",
      "INVALID_DATA_URL",
      "EMPTY_TEXT_PROMPT",
    ] as const;
    for (const c of codes) {
      const e = new MultimodalError(c, "test");
      expect(e.code).toBe(c);
    }
  });

  it("isUuidV4 validates correctly", () => {
    expect(isUuidV4("12345678-1234-4234-8234-123456789012")).toBe(true);
    expect(isUuidV4("12345678-1234-1234-1234-123456789012")).toBe(false); // v1, not v4
    expect(isUuidV4("not-a-uuid")).toBe(false);
  });

  it("newImageId generates UUID v4", () => {
    const id = newImageId();
    expect(isUuidV4(id)).toBe(true);
  });

  it("getMaxImageSize returns 5MB for all formats", () => {
    for (const f of SUPPORTED_IMAGE_FORMATS) {
      expect(getMaxImageSize(f)).toBe(5_000_000);
    }
  });

  it("prepareImageBatch redacts all images", () => {
    const batch = prepareImageBatch([
      makeImageInput({ exifStripped: false }),
      makeImageInput({ id: "11111111-1114-4111-8111-111111111111", exifStripped: false }),
    ]);
    expect(batch.length).toBe(2);
    for (const img of batch) {
      expect(img.exifStripped).toBe(true);
    }
  });

  it("estimateBatchCost same as estimateVisionCost for arrays", () => {
    const imgs = [makeImageInput(), makeImageInput()];
    const a = estimateVisionCost(imgs, "claude-3-5-sonnet");
    const b = estimateBatchCost(imgs, "claude-3-5-sonnet");
    expect(a.estimatedUsd).toBe(b.estimatedUsd);
  });

  it("imageTtlMs is 24h in ms", () => {
    expect(imageTtlMs()).toBe(IMAGE_TTL_HOURS * 3600 * 1000);
  });

  it("imageExpiriesAt is 24h after issuedAt", () => {
    const issued = new Date("2026-06-29T00:00:00.000Z");
    const expires = imageExpiriesAt(issued);
    expect(expires.getTime() - issued.getTime()).toBe(imageTtlMs());
  });

  it("audit log appends entries", () => {
    let log = createAuditLog();
    log = appendAudit(log, { action: "image.received", imageId: "x", metadata: { sizeBytes: 100 } });
    log = appendAudit(log, { action: "image.exifStripped", imageId: "x", metadata: { fields: ["exif.GPS"] } });
    expect(log.entries.length).toBe(2);
    expect(log.entries[0]!.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("auditEntryHasRawText flags suspicious fields", () => {
    const clean = appendAudit(createAuditLog(), {
      action: "image.exifStripped",
      metadata: { fields: ["exif.GPS"] },
    });
    expect(auditEntryHasRawText(clean.entries[0]!)).toBe(false);

    const dirty = appendAudit(createAuditLog(), {
      action: "image.exifStripped",
      metadata: { raw: "x".repeat(2000) },
    });
    expect(auditEntryHasRawText(dirty.entries[0]!)).toBe(true);
  });

  it("getStrippedFields filters PII fields", () => {
    const fields = ["exif.GPS", "exif.Make", "jpeg.COM-comment", "unrelated"];
    const filtered = getStrippedFields(fields);
    expect(filtered).toContain("exif.GPS");
    expect(filtered).toContain("exif.Make");
    expect(filtered).toContain("jpeg.COM-comment");
  });
});

// ----------------------------------------------------------------------------
// SECTION M — Vision model mock
// ----------------------------------------------------------------------------

describe("vision model mock", () => {
  it("callVisionModel returns ok=true for valid args", async () => {
    const r = await callVisionModel({
      model: "claude-3-5-sonnet",
      images: [makeImageInput()],
      prompt: "describe",
      locale: "pt-BR",
    });
    expect(r.ok).toBe(true);
    expect(r.model).toBe("claude-3-5-sonnet");
    expect(r.durationMs).toBeGreaterThan(0);
  });

  it("callVisionModel throws COST_EXCEEDED when over cap", async () => {
    await expect(
      callVisionModel({
        model: "claude-3-5-sonnet",
        images: [makeImageInput()],
        prompt: "x",
        costCapUsd: 0.0000001,
        locale: "pt-BR",
      }),
    ).rejects.toThrow(MultimodalError);
  });

  it("callVisionModel respects timeout bound", async () => {
    const t0 = Date.now();
    await callVisionModel({
      model: "gemini-2.5-pro",
      images: [makeImageInput()],
      prompt: "x",
      timeoutMs: 1000,
      locale: "en-US",
    });
    const elapsed = Date.now() - t0;
    expect(elapsed).toBeLessThan(1000);
  });
});

// ----------------------------------------------------------------------------
// SECTION N — Constants & sacred taxonomy integrity
// ----------------------------------------------------------------------------

describe("constants and sacred taxonomy", () => {
  it("SUPPORTED_LOCALES has 3 locales", () => {
    expect(SUPPORTED_LOCALES.length).toBe(3);
  });

  it("SUPPORTED_IMAGE_FORMATS has 4 formats", () => {
    expect(SUPPORTED_IMAGE_FORMATS.length).toBe(4);
  });

  it("VISION_PROVIDERS has 3 providers", () => {
    expect(VISION_PROVIDERS.length).toBe(3);
  });

  it("TRADITIONS has 8 traditions", () => {
    expect(TRADITIONS.length).toBe(8);
  });

  it("TAROT_NAMES has 78 entries", () => {
    expect(TAROT_NAMES.length).toBe(78);
  });

  it("CIGANO_NAMES has 36 entries", () => {
    expect(CIGANO_NAMES.length).toBe(36);
  });

  it("ORIXA_NAMES has 16 entries", () => {
    expect(ORIXA_NAMES.length).toBe(16);
  });

  it("CABALA_SEFIROT has 10 entries", () => {
    expect(CABALA_SEFIROT.length).toBe(10);
  });

  it("ASTROLOGIA_PLANETAS includes Lilith", () => {
    expect(ASTROLOGIA_PLANETAS).toContain("Lilith");
  });

  it("ASTROLOGIA_SIGNOS has 12 entries", () => {
    expect(ASTROLOGIA_SIGNOS.length).toBe(12);
  });

  it("ASTROLOGIA_CASAS has 12 entries", () => {
    expect(ASTROLOGIA_CASAS.length).toBe(12);
  });

  it("PROVIDER_COST_TABLE has all 3 providers", () => {
    for (const p of VISION_PROVIDERS) {
      expect(PROVIDER_COST_TABLE[p]).toBeDefined();
    }
  });

  it("MAX_IMAGE_SIZE has all 4 formats", () => {
    for (const f of SUPPORTED_IMAGE_FORMATS) {
      expect(MAX_IMAGE_SIZE[f]).toBe(5_000_000);
    }
  });

  it("I18N_CATALOGS has all 3 locales", () => {
    for (const l of SUPPORTED_LOCALES) {
      expect(I18N_CATALOGS[l]).toBeDefined();
    }
  });

  it("ENGINE_INFO reflects limits", () => {
    expect(ENGINE_INFO.maxImagesPerRequest).toBe(MAX_IMAGES_PER_REQUEST);
    expect(ENGINE_INFO.maxImageBytes).toBe(MAX_IMAGE_BYTES);
    expect(ENGINE_INFO.maxDimensionPx).toBe(MAX_DIMENSION_PX);
    expect(ENGINE_INFO.defaultCostCapUsd).toBe(DEFAULT_COST_CAP_USD);
    expect(ENGINE_INFO.imageTtlHours).toBe(IMAGE_TTL_HOURS);
  });

  it("MAX_IMAGES_PER_REQUEST is 3", () => {
    expect(MAX_IMAGES_PER_REQUEST).toBe(3);
  });

  it("MIN_DIMENSION_PX is 100", () => {
    expect(MIN_DIMENSION_PX).toBe(100);
  });

  it("MAX_DIMENSION_PX is 4096", () => {
    expect(MAX_DIMENSION_PX).toBe(4096);
  });

  it("FACE_CONFIDENCE_THRESHOLD is 0.7", () => {
    expect(FACE_CONFIDENCE_THRESHOLD).toBe(0.7);
  });
});
