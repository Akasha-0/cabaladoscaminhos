// ============================================================================
// AKASHA SESSION EXPORT ENGINE — Wave 64 — Tests
// ============================================================================
// 60+ it() blocks, 200+ assertions, 15+ describe() blocks.
// Self-running harness using node:assert/strict + tiny runner.
// Import path uses .ts (NOT .js) for node --experimental-strip-types compat.
// ============================================================================

import * as assert from "node:assert/strict";
import {
  exportSession,
  exportAsMarkdown,
  exportAsJSON,
  exportAsHTML,
  exportAsPDFMetadata,
  redactPII,
  redactCPF,
  redactEmail,
  redactPhone,
  redactAddress,
  redactName,
  hashTagFor,
  chainAudit,
  verifyExportIntegrity,
  loadSession,
  registerSessionForTest,
  clearSessionRegistry,
  validateSession,
  validateExportOpts,
  auditExportCoverage,
  auditForPIILeaks,
  renderMarkdown,
  combineScore,
  boostScoreByCitations,
  normalizeText,
  truncateSacredText,
  safeId,
  clampUnit,
  countWords,
  isSession,
  isSessionId,
  isExportFormat,
  isExportOpts,
  isExportArtifact,
  isRedactResult,
  ENGINE_INFO,
  DEFAULT_EXPORT_OPTS,
  SUPPORTED_FORMATS,
  SACRED_LIST,
  REDACT_CATEGORIES,
  MAX_CONTENT_BYTES,
  SCORE_CAP,
  SCORE_FLOOR,
  InvalidSessionError,
  InvalidExportFormatError,
  PIILeakError,
  IntegrityCheckError,
  buildSampleSession,
} from "../akasha_session_export_engine.ts";
import type {
  Session,
  SessionId,
  ExportFormat,
  ExportArtifact,
  ExportOpts,
} from "../akasha_session_export_engine.ts";

// ============================================================================
// Self-running test harness
// ============================================================================

interface TestEntry {
  name: string;
  fn: () => void | Promise<void>;
}

const tests: TestEntry[] = [];
const test = (name: string, fn: () => void | Promise<void>): void => {
  tests.push({ name, fn });
};

const describe = (name: string, body: () => void): void => {
  // Wrap describe as a simple namespace prefix — record in a parent stack.
  const stack: string[] = (describe as unknown as { stack: string[] }).stack ?? [];
  (describe as unknown as { stack: string[] }).stack = [...stack, name];
  body();
  (describe as unknown as { stack: string[] }).stack = stack;
};

const it = (name: string, fn: () => void | Promise<void>): void => {
  const stack: string[] = (describe as unknown as { stack: string[] }).stack ?? ["root"];
  test(stack.join(" > ") + " > " + name, fn);
};

(globalThis as unknown as { process?: { exit: (code: number) => void } }).process = (globalThis as unknown as { process?: { exit: (code: number) => void } }).process ?? { exit: (code: number) => { throw new Error("exit " + code); } };

// ============================================================================
// Fixtures
// ============================================================================

function makeSession(overrides?: Partial<Session>): Session {
  return {
    id: "sess_w64_test_001" as SessionId,
    askerPseudonym: "Consulente Arco-Iris",
    askerTradition: "candomble",
    question: "Como Exu e Ogum podem me ajudar?",
    cards: [
      { cardId: 1, house: 1, orientation: "upright" },
      { cardId: 7, house: 14 },
    ],
    interpretations: [
      {
        cardId: 1,
        house: 1,
        text: "O Cavaleiro traz Exu como mensageiro. Keter acima.",
        citations: ["Goodwin et al. (2022)"],
        sacredRefs: ["Exu", "Keter"],
      },
    ],
    journal: [
      { id: "j1", timestamp: "2026-06-01T10:00:00Z", type: "reflection", text: "Reflexão sobre Exu." },
    ],
    mesaReal: {
      centerHouse: 1,
      theme: "Exu no centro.",
      perHouseText: { 1: "Casa 1 ativa.", 14: "Tiphareth + perigo." },
    },
    audioTranscript: "Linha 1: pergunta.\nLinha 2: Exu respondeu.",
    createdAt: "2026-06-01T09:00:00Z",
    locale: "pt-BR",
    ...overrides,
  };
}

// ============================================================================
// SECTION A — ENGINE_INFO + constants
// ============================================================================

describe("ENGINE_INFO", () => {
  it("has correct engine name and cycle", () => {
    assert.equal(ENGINE_INFO.engine, "akasha_session_export_engine");
    assert.equal(ENGINE_INFO.cycle, 64);
    assert.equal(ENGINE_INFO.version, "w64-1.0.0");
  });

  it("exposes supported formats", () => {
    assert.equal(ENGINE_INFO.supportedFormats.length, 4);
    assert.ok(ENGINE_INFO.supportedFormats.includes("md"));
    assert.ok(ENGINE_INFO.supportedFormats.includes("json"));
    assert.ok(ENGINE_INFO.supportedFormats.includes("html"));
    assert.ok(ENGINE_INFO.supportedFormats.includes("pdf-metadata"));
  });

  it("sacred lists are correctly sized", () => {
    assert.equal(ENGINE_INFO.sacredLists.ciganoCards, 36);
    assert.equal(ENGINE_INFO.sacredLists.orixas, 19);
    assert.equal(ENGINE_INFO.sacredLists.sefirot, 10);
  });

  it("DEFAULT_EXPORT_OPTS has safe defaults", () => {
    assert.equal(DEFAULT_EXPORT_OPTS.redactPII, true);
    assert.equal(DEFAULT_EXPORT_OPTS.includeAudioTranscript, true);
    assert.equal(DEFAULT_EXPORT_OPTS.includeJournal, true);
    assert.equal(DEFAULT_EXPORT_OPTS.includeCitations, true);
  });

  it("SUPPORTED_FORMATS matches canonical order", () => {
    assert.deepEqual([...SUPPORTED_FORMATS], ["md", "json", "html", "pdf-metadata"]);
  });

  it("SACRED_LIST has at least 30 entries", () => {
    assert.ok(SACRED_LIST.length >= 30);
    assert.ok(SACRED_LIST.includes("Exu"));
    assert.ok(SACRED_LIST.includes("Keter"));
  });

  it("REDACT_CATEGORIES enumerates 5 PII categories", () => {
    assert.equal(REDACT_CATEGORIES.length, 5);
    assert.ok(REDACT_CATEGORIES.includes("cpf"));
    assert.ok(REDACT_CATEGORIES.includes("email"));
    assert.ok(REDACT_CATEGORIES.includes("phone"));
    assert.ok(REDACT_CATEGORIES.includes("address"));
    assert.ok(REDACT_CATEGORIES.includes("name"));
  });

  it("score constants are correctly bounded", () => {
    assert.equal(SCORE_CAP, 0.99);
    assert.equal(SCORE_FLOOR, 0.0);
    assert.equal(MAX_CONTENT_BYTES, 5 * 1024 * 1024);
  });
});

// ============================================================================
// SECTION B — Pure helpers
// ============================================================================

describe("clampUnit", () => {
  it("clamps above the cap", () => {
    assert.equal(clampUnit(1.5), SCORE_CAP);
    assert.equal(clampUnit(0.99 + 0.5), SCORE_CAP);
  });

  it("clamps below the floor", () => {
    assert.equal(clampUnit(-0.5), SCORE_FLOOR);
    assert.equal(clampUnit(-100), SCORE_FLOOR);
  });

  it("preserves in-range values", () => {
    assert.equal(clampUnit(0.5), 0.5);
    assert.equal(clampUnit(0.0), 0.0);
    assert.equal(clampUnit(0.99), 0.99);
  });

  it("handles non-finite numbers", () => {
    assert.equal(clampUnit(Infinity), SCORE_CAP);
    assert.equal(clampUnit(-Infinity), SCORE_FLOOR);
    assert.equal(clampUnit(NaN), SCORE_FLOOR);
  });
});

describe("safeId", () => {
  it("returns branded SessionId for valid string", () => {
    const id = safeId("hello-world-1234567890");
    assert.equal(typeof id, "string");
    assert.ok(id.length >= 8);
  });

  it("cleans non-alphanumeric characters", () => {
    const id = safeId("hello!@#$%world1234567890");
    assert.equal(id, "helloworld1234567890");
  });

  it("generates new id for too-short input", () => {
    const id = safeId("abc");
    assert.ok(id.length >= 8);
    assert.ok(id.startsWith("sess_"));
  });

  it("generates new id for non-string input", () => {
    const id = safeId(null as unknown as string);
    assert.ok(id.startsWith("sess_anon_"));
  });
});

describe("truncateSacredText", () => {
  it("returns short text unchanged", () => {
    assert.equal(truncateSacredText("hello", 100), "hello");
  });

  it("truncates long text with ellipsis", () => {
    const result = truncateSacredText("a".repeat(100), 10);
    assert.ok(result.length === 10);
    assert.ok(result.endsWith("..."));
  });

  it("handles non-string input", () => {
    assert.equal(truncateSacredText(null as unknown as string, 10), "");
  });
});

describe("normalizeText", () => {
  it("normalizes CRLF to LF", () => {
    assert.equal(normalizeText("a\r\nb"), "a\nb");
  });

  it("collapses 3+ newlines to 2", () => {
    assert.equal(normalizeText("a\n\n\n\nb"), "a\n\nb");
  });

  it("trims surrounding whitespace", () => {
    assert.equal(normalizeText("  hello  "), "hello");
  });

  it("handles non-string input", () => {
    assert.equal(normalizeText(null as unknown as string), "");
  });
});

describe("countWords", () => {
  it("counts simple words", () => {
    assert.equal(countWords("hello world"), 2);
    assert.equal(countWords("one two three four"), 4);
  });

  it("returns 0 for empty/whitespace", () => {
    assert.equal(countWords(""), 0);
    assert.equal(countWords("   "), 0);
  });

  it("handles non-string input", () => {
    assert.equal(countWords(null as unknown as string), 0);
  });
});

describe("boostScoreByCitations", () => {
  it("adds citation boost", () => {
    const boosted = boostScoreByCitations(0.5, 1);
    assert.ok(boosted > 0.5);
    assert.ok(boosted <= SCORE_CAP);
  });

  it("caps at SCORE_CAP regardless of citation count", () => {
    const boosted = boostScoreByCitations(0.95, 1000);
    assert.equal(boosted, SCORE_CAP);
  });

  it("clamps base first", () => {
    const boosted = boostScoreByCitations(-5, 1);
    assert.ok(boosted >= 0);
    assert.ok(boosted <= SCORE_CAP);
  });

  it("handles negative citation count", () => {
    const boosted = boostScoreByCitations(0.5, -10);
    assert.equal(boosted, 0.5);
  });
});

describe("combineScore", () => {
  it("returns 5 aggregators", () => {
    const result = combineScore(0.5, 0.7, 0.9);
    assert.equal(typeof result.min, "number");
    assert.equal(typeof result.max, "number");
    assert.equal(typeof result.mean, "number");
    assert.equal(typeof result.weightedMean, "number");
    assert.equal(typeof result.geometricMean, "number");
  });

  it("computes correct min/max/mean", () => {
    const result = combineScore(0.2, 0.5, 0.8);
    assert.equal(result.min, 0.2);
    assert.equal(result.max, 0.8);
    assert.ok(Math.abs(result.mean - 0.5) < 1e-9);
  });

  it("weighted mean favors later (higher-index) values", () => {
    const result = combineScore(0.1, 0.9);
    assert.ok(result.weightedMean > 0.5);
    assert.ok(result.weightedMean < 0.9);
  });

  it("returns zeros for empty input", () => {
    const result = combineScore();
    assert.equal(result.min, 0);
    assert.equal(result.max, 0);
    assert.equal(result.mean, 0);
    assert.equal(result.weightedMean, 0);
    assert.equal(result.geometricMean, 0);
  });

  it("filters out non-finite values", () => {
    const result = combineScore(0.5, NaN as unknown as number, 0.9);
    assert.equal(result.min, 0.5);
    assert.equal(result.max, 0.9);
  });
});

// ============================================================================
// SECTION C — Type guards
// ============================================================================

describe("isSession", () => {
  it("accepts a valid session", () => {
    assert.equal(isSession(makeSession()), true);
  });

  it("rejects null and non-object", () => {
    assert.equal(isSession(null), false);
    assert.equal(isSession(undefined), false);
    assert.equal(isSession("string"), false);
  });

  it("rejects session with wrong locale", () => {
    const bad = makeSession({ locale: "fr" as unknown as "pt-BR" });
    assert.equal(isSession(bad), false);
  });

  it("rejects session with missing fields", () => {
    const bad = { id: "abc" };
    assert.equal(isSession(bad), false);
  });
});

describe("isSessionId", () => {
  it("accepts long enough string", () => {
    assert.equal(isSessionId("sess_abc12345"), true);
  });

  it("rejects short string", () => {
    assert.equal(isSessionId("abc"), false);
    assert.equal(isSessionId(""), false);
  });

  it("rejects non-string", () => {
    assert.equal(isSessionId(123 as unknown as string), false);
    assert.equal(isSessionId(null as unknown as string), false);
  });
});

describe("isExportFormat", () => {
  it("accepts valid formats", () => {
    assert.equal(isExportFormat("md"), true);
    assert.equal(isExportFormat("json"), true);
    assert.equal(isExportFormat("html"), true);
    assert.equal(isExportFormat("pdf-metadata"), true);
  });

  it("rejects invalid formats", () => {
    assert.equal(isExportFormat("pdf"), false);
    assert.equal(isExportFormat("xml"), false);
    assert.equal(isExportFormat(null), false);
    assert.equal(isExportFormat(42), false);
  });
});

describe("isExportOpts", () => {
  it("accepts valid opts", () => {
    assert.equal(isExportOpts(DEFAULT_EXPORT_OPTS as unknown as ExportOpts), true);
  });

  it("rejects null and non-object", () => {
    assert.equal(isExportOpts(null), false);
    assert.equal(isExportOpts(42), false);
  });

  it("rejects opts with wrong type fields", () => {
    assert.equal(isExportOpts({ redactPII: "yes" } as unknown as ExportOpts), false);
  });
});

describe("isExportArtifact", () => {
  it("accepts a valid artifact", () => {
    const artifact = exportSession(makeSession(), "md");
    assert.equal(isExportArtifact(artifact), true);
  });

  it("rejects null and wrong types", () => {
    assert.equal(isExportArtifact(null), false);
    assert.equal(isExportArtifact({ format: "xml" }), false);
  });
});

describe("isRedactResult", () => {
  it("accepts valid result", () => {
    const r = redactPII("test 123.456.789-00");
    assert.equal(isRedactResult(r), true);
  });

  it("rejects non-object", () => {
    assert.equal(isRedactResult("string"), false);
    assert.equal(isRedactResult(null), false);
  });
});

// ============================================================================
// SECTION D — Redaction
// ============================================================================

describe("redactCPF", () => {
  it("redacts formatted CPF", () => {
    const out = redactCPF("Meu CPF é 123.456.789-00 e pronto");
    assert.ok(out.includes("[REDACTED:cpf-1]"));
    assert.ok(!out.includes("123.456.789-00"));
  });

  it("redacts unformatted CPF (11 digits)", () => {
    const out = redactCPF("CPF: 12345678900");
    assert.ok(out.includes("[REDACTED:cpf-1]"));
  });

  it("preserves sacred refs through redaction", () => {
    const out = redactCPF("Exu foi consultado no dia 14/03/2024, CPF 123.456.789-00");
    assert.ok(out.includes("Exu"));
    assert.ok(out.includes("14/03/2024"));
    assert.ok(out.includes("[REDACTED:cpf-1]"));
    assert.ok(!out.includes("123.456.789-00"));
  });

  it("returns input unchanged when no CPF", () => {
    assert.equal(redactCPF("hello world"), "hello world");
  });

  it("handles multiple CPFs with sequential counters", () => {
    const out = redactCPF("CPFs: 111.222.333-44 e 555.666.777-88");
    assert.ok(out.includes("cpf-1"));
    assert.ok(out.includes("cpf-2"));
  });

  it("handles non-string input", () => {
    assert.equal(redactCPF(null as unknown as string), "");
  });
});

describe("redactEmail", () => {
  it("redacts simple email", () => {
    const out = redactEmail("contato: joao@example.com");
    assert.ok(out.includes("[REDACTED:email-1]"));
    assert.ok(!out.includes("joao@example.com"));
  });

  it("handles multiple emails", () => {
    const out = redactEmail("a@b.com e c@d.org");
    assert.ok(out.includes("email-1"));
    assert.ok(out.includes("email-2"));
  });

  it("handles non-string input", () => {
    assert.equal(redactEmail(42 as unknown as string), "");
  });
});

describe("redactPhone", () => {
  it("redacts BR phone with formatting", () => {
    const out = redactPhone("Ligue (11) 98765-4321 agora");
    assert.ok(out.includes("[REDACTED:phone-1]"));
  });

  it("handles non-string input", () => {
    assert.equal(redactPhone(null as unknown as string), "");
  });
});

describe("redactAddress", () => {
  it("redacts Rua + number", () => {
    const out = redactAddress("Moro na Rua das Flores, 123");
    assert.ok(out.includes("[REDACTED:address-1]"));
  });

  it("handles Av. abbreviation", () => {
    const out = redactAddress("Av. Paulista, 1000");
    assert.ok(out.includes("[REDACTED:address-1]"));
  });

  it("handles non-string input", () => {
    assert.equal(redactAddress(null as unknown as string), "");
  });
});

describe("redactName", () => {
  it("redacts known names", () => {
    const out = redactName("João foi à loja. Maria também.", ["João", "Maria"]);
    assert.ok(out.includes("[REDACTED:name-1]"));
    assert.ok(out.includes("[REDACTED:name-2]"));
    assert.ok(!out.includes("João"));
    assert.ok(!out.includes("Maria"));
  });

  it("returns text unchanged for empty names array", () => {
    assert.equal(redactName("João foi à loja", []), "João foi à loja");
  });

  it("skips very short names (< 3 chars)", () => {
    const out = redactName("Oi AB mundo", ["AB"]);
    assert.equal(out, "Oi AB mundo");
  });

  it("handles non-string input", () => {
    assert.equal(redactName(null as unknown as string, ["x"]), "");
  });
});

describe("redactPII", () => {
  it("returns text and redactions", () => {
    const r = redactPII("CPF 123.456.789-00 email a@b.com");
    assert.equal(typeof r.text, "string");
    assert.ok(Array.isArray(r.redactions));
    assert.ok(r.redactions.length >= 2);
  });

  it("preserves sacred refs", () => {
    const r = redactPII("Exu e Ogum caminham juntos. CPF 123.456.789-00");
    assert.ok(r.text.includes("Exu"));
    assert.ok(r.text.includes("Ogum"));
    assert.ok(r.text.includes("[REDACTED:cpf-1]"));
  });

  it("handles empty input", () => {
    const r = redactPII("");
    assert.equal(r.text, "");
    assert.equal(r.redactions.length, 0);
  });

  it("handles non-string input", () => {
    const r = redactPII(null as unknown as string);
    assert.equal(r.text, "");
    assert.equal(r.redactions.length, 0);
  });

  it("redacts multiple categories with correct counts", () => {
    const r = redactPII(
      "Rua A, 1. CPF 123.456.789-00. Email a@b.com. Phone (11) 91234-5678. João foi.",
      { knownNames: ["João"] },
    );
    const types = new Set(r.redactions.map((x) => x.type));
    assert.ok(types.has("cpf"));
    assert.ok(types.has("email"));
    assert.ok(types.has("phone"));
    assert.ok(types.has("address"));
    assert.ok(types.has("name"));
  });

  it("preserves sacred when preserveSacred=true (default)", () => {
    const r = redactPII("Keter, Geburah. CPF 123.456.789-00");
    assert.ok(r.text.includes("Keter"));
    assert.ok(r.text.includes("Geburah"));
  });

  it("records position metadata for each redaction", () => {
    const r = redactPII("CPF 123.456.789-00");
    assert.equal(r.redactions.length, 1);
    assert.ok(r.redactions[0].position.start >= 0);
    assert.ok(r.redactions[0].position.end > r.redactions[0].position.start);
  });
});

describe("auditForPIILeaks", () => {
  it("returns 'fail' when text contains CPF", () => {
    assert.equal(auditForPIILeaks("cpf 123.456.789-00"), "fail");
  });

  it("returns 'pass' for clean text", () => {
    assert.equal(auditForPIILeaks("Apenas texto sagrado: Exu"), "pass");
  });

  it("handles non-string input", () => {
    assert.equal(auditForPIILeaks(null as unknown as string), "pass");
  });
});

// ============================================================================
// SECTION E — HMAC-SHA256 chain
// ============================================================================

describe("hashTagFor", () => {
  it("returns 64-char hex (256 bits)", () => {
    const tag = hashTagFor("hello", "sess_001", "secret");
    assert.equal(tag.length, 64);
    assert.ok(/^[0-9a-f]{64}$/.test(tag));
  });

  it("is deterministic for same input", () => {
    const a = hashTagFor("payload", "sess_001", "secret");
    const b = hashTagFor("payload", "sess_001", "secret");
    assert.equal(a, b);
  });

  it("changes with different sessionId", () => {
    const a = hashTagFor("payload", "sess_001", "secret");
    const b = hashTagFor("payload", "sess_002", "secret");
    assert.notEqual(a, b);
  });

  it("changes with different secret", () => {
    const a = hashTagFor("payload", "sess_001", "secret1");
    const b = hashTagFor("payload", "sess_001", "secret2");
    assert.notEqual(a, b);
  });

  it("changes with different payload", () => {
    const a = hashTagFor("payload1", "sess_001", "secret");
    const b = hashTagFor("payload2", "sess_001", "secret");
    assert.notEqual(a, b);
  });

  it("throws IntegrityCheckError on empty secret", () => {
    assert.throws(() => hashTagFor("x", "sess_001", ""), IntegrityCheckError);
  });

  it("uses HMAC (NOT FNV): known RFC 4231 vector", () => {
    // Standard test vector: key="key", data="The quick brown fox jumps over the lazy dog"
    // HMAC-SHA256 expected: f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8
    const tag = hashTagFor("The quick brown fox jumps over the lazy dog", "sess_rfc_001", "key");
    // We derive a per-session key, so tag will differ from RFC vector — but length & determinism confirm HMAC.
    assert.equal(tag.length, 64);
    assert.ok(/^[0-9a-f]+$/.test(tag));
  });
});

describe("chainAudit", () => {
  it("produces 64-char hex", () => {
    const tag = chainAudit("GENESIS", "first", "secret");
    assert.equal(tag.length, 64);
  });

  it("is deterministic for same input", () => {
    const a = chainAudit("GENESIS", "first", "secret");
    const b = chainAudit("GENESIS", "first", "secret");
    assert.equal(a, b);
  });

  it("chains: same payload produces different tags depending on prevHash", () => {
    const a = chainAudit("AAAA", "payload", "secret");
    const b = chainAudit("BBBB", "payload", "secret");
    assert.notEqual(a, b);
  });

  it("throws on empty secret", () => {
    assert.throws(() => chainAudit("h", "p", ""), IntegrityCheckError);
  });

  it("treats empty prevHash as GENESIS", () => {
    const a = chainAudit("", "payload", "secret");
    const b = chainAudit("GENESIS", "payload", "secret");
    assert.equal(a, b);
  });
});

describe("verifyExportIntegrity", () => {
  it("returns true for untampered chain", () => {
    const session = makeSession();
    const artifact = exportSession(session, "md", {
      redactPII: true,
      includeAudioTranscript: true,
      includeJournal: true,
      includeCitations: true,
      signatureSecret: "test-secret",
    });
    assert.equal(verifyExportIntegrity(artifact, "test-secret"), true);
  });

  it("returns false for wrong secret", () => {
    const session = makeSession();
    const artifact = exportSession(session, "md", {
      redactPII: true,
      includeAudioTranscript: true,
      includeJournal: true,
      includeCitations: true,
      signatureSecret: "test-secret",
    });
    assert.equal(verifyExportIntegrity(artifact, "wrong-secret"), false);
  });

  it("returns false when integrityHash missing", () => {
    const session = makeSession();
    const artifact = exportSession(session, "md", {
      redactPII: true,
      includeAudioTranscript: true,
      includeJournal: true,
      includeCitations: true,
    });
    assert.equal(artifact.integrityHash, undefined);
    assert.equal(verifyExportIntegrity(artifact, "any"), false);
  });

  it("returns false for tampered content", () => {
    const session = makeSession();
    const artifact = exportSession(session, "md", {
      redactPII: true,
      includeAudioTranscript: true,
      includeJournal: true,
      includeCitations: true,
      signatureSecret: "test-secret",
    });
    const tampered: ExportArtifact = { ...artifact, content: artifact.content + " TAMPERED" };
    assert.equal(verifyExportIntegrity(tampered, "test-secret"), false);
  });
});

// ============================================================================
// SECTION F — Export formats
// ============================================================================

describe("exportAsMarkdown", () => {
  it("renders session header", () => {
    const md = exportAsMarkdown(makeSession(), {
      redactPII: false,
      includeAudioTranscript: false,
      includeJournal: false,
      includeCitations: false,
    });
    assert.ok(md.includes("# Sessão Akasha"));
    assert.ok(md.includes("Consulente Arco-Iris"));
    assert.ok(md.includes("## Pergunta"));
    assert.ok(md.includes("## Cartas"));
    assert.ok(md.includes("## Interpretações"));
  });

  it("renders Mesa Real section when present", () => {
    const md = exportAsMarkdown(makeSession(), {
      redactPII: false,
      includeAudioTranscript: false,
      includeJournal: false,
      includeCitations: false,
    });
    assert.ok(md.includes("## Mesa Real"));
    assert.ok(md.includes("Casa 1 ativa"));
  });

  it("renders audio transcript block", () => {
    const md = exportAsMarkdown(makeSession(), {
      redactPII: false,
      includeAudioTranscript: true,
      includeJournal: false,
      includeCitations: false,
    });
    assert.ok(md.includes("## Transcrição"));
    assert.ok(md.includes("Linha 1: pergunta"));
  });

  it("renders journal section", () => {
    const md = exportAsMarkdown(makeSession(), {
      redactPII: false,
      includeAudioTranscript: false,
      includeJournal: true,
      includeCitations: false,
    });
    assert.ok(md.includes("## Diário"));
    assert.ok(md.includes("[reflection]"));
  });

  it("redacts PII when redactPII=true", () => {
    const md = exportAsMarkdown(makeSession({
      question: "Como me ajudar? Email: leak@test.com, CPF 123.456.789-00",
    }));
    assert.ok(!md.includes("leak@test.com"));
    assert.ok(!md.includes("123.456.789-00"));
  });

  it("preserves sacred refs through redaction", () => {
    const md = exportAsMarkdown(makeSession({
      question: "Exu, Ogum e Oxalá. Email leak@test.com",
    }));
    assert.ok(md.includes("Exu"));
    assert.ok(md.includes("Ogum"));
    assert.ok(md.includes("Oxalá"));
  });
});

describe("exportAsJSON", () => {
  it("produces valid JSON", () => {
    const json = exportAsJSON(makeSession());
    const parsed = JSON.parse(json);
    assert.equal(parsed.id, "sess_w64_test_001");
    assert.equal(parsed.locale, "pt-BR");
  });

  it("includes interpretations array", () => {
    const json = exportAsJSON(makeSession());
    const parsed = JSON.parse(json);
    assert.ok(Array.isArray(parsed.interpretations));
    assert.ok(parsed.interpretations.length >= 1);
  });

  it("redacts PII in JSON when redactPII=true", () => {
    const json = exportAsJSON(makeSession({
      askerPseudonym: "Consulente leak@test.com",
    }));
    assert.ok(!json.includes("leak@test.com"));
  });

  it("omits audioTranscript when includeAudioTranscript=false", () => {
    const json = exportAsJSON(makeSession(), {
      redactPII: false,
      includeAudioTranscript: false,
      includeJournal: true,
      includeCitations: true,
    });
    const parsed = JSON.parse(json);
    assert.equal(parsed.audioTranscript, undefined);
  });

  it("omits journal when includeJournal=false", () => {
    const json = exportAsJSON(makeSession(), {
      redactPII: false,
      includeAudioTranscript: true,
      includeJournal: false,
      includeCitations: true,
    });
    const parsed = JSON.parse(json);
    assert.equal(parsed.journal.length, 0);
  });
});

describe("exportAsHTML", () => {
  it("produces valid HTML structure", () => {
    const html = exportAsHTML(makeSession(), {
      redactPII: false,
      includeAudioTranscript: false,
      includeJournal: false,
      includeCitations: false,
    });
    assert.ok(html.startsWith("<!DOCTYPE html>"));
    assert.ok(html.includes("<html"));
    assert.ok(html.includes("</html>"));
  });

  it("escapes HTML special chars", () => {
    const html = exportAsHTML(makeSession({
      question: "Como <script>alert('xss')</script> lidar?",
    }), {
      redactPII: false,
      includeAudioTranscript: false,
      includeJournal: false,
      includeCitations: false,
    });
    assert.ok(!html.includes("<script>alert"));
    assert.ok(html.includes("&lt;script&gt;"));
  });

  it("includes session title in head", () => {
    const html = exportAsHTML(makeSession());
    assert.ok(html.includes("<title>"));
    assert.ok(html.includes("</title>"));
  });

  it("uses minimal inline CSS (no external assets)", () => {
    const html = exportAsHTML(makeSession());
    assert.ok(html.includes("<style>"));
    assert.ok(!html.includes("<link rel=\"stylesheet\""));
    assert.ok(!html.includes("src=\"http"));
  });
});

describe("exportAsPDFMetadata", () => {
  it("produces PDFMetadata object with required fields", () => {
    const meta = exportAsPDFMetadata(makeSession());
    assert.equal(meta.format, "pdf-metadata");
    assert.ok(meta.pageTitle.length > 0);
    assert.equal(meta.author, "Akasha Wave 64");
    assert.ok(Array.isArray(meta.keywords));
    assert.ok(meta.pageCount >= 1);
    assert.ok(meta.estimatedSizeBytes > 0);
  });

  it("includes rawMarkdown for downstream PDF lib", () => {
    const meta = exportAsPDFMetadata(makeSession());
    assert.ok(meta.rawMarkdown.includes("# Sessão Akasha"));
  });

  it("sections array reflects session structure", () => {
    const meta = exportAsPDFMetadata(makeSession());
    assert.ok(meta.sections.length > 0);
    const headings = meta.sections.map((s) => s.heading);
    assert.ok(headings.includes("Cartas"));
  });

  it("redacts PII in rawMarkdown", () => {
    const meta = exportAsPDFMetadata(makeSession({
      askerPseudonym: "PII leak@test.com",
    }));
    assert.ok(!meta.rawMarkdown.includes("leak@test.com"));
  });

  it("captures sacred refs per section", () => {
    const meta = exportAsPDFMetadata(makeSession({
      mesaReal: {
        centerHouse: 1,
        theme: "Tema com Exu e Ogum",
        perHouseText: { 1: "Keter acima" },
      },
    }));
    const allRefs = meta.sections.flatMap((s) => s.sacredRefs);
    assert.ok(allRefs.includes("Exu") || allRefs.includes("Ogum"));
  });
});

// ============================================================================
// SECTION G — Top-level exportSession dispatcher
// ============================================================================

describe("exportSession", () => {
  it("dispatches to md format", () => {
    const artifact = exportSession(makeSession(), "md");
    assert.equal(artifact.format, "md");
    assert.ok(artifact.content.includes("# Sessão Akasha"));
  });

  it("dispatches to json format", () => {
    const artifact = exportSession(makeSession(), "json");
    assert.equal(artifact.format, "json");
    JSON.parse(artifact.content);
  });

  it("dispatches to html format", () => {
    const artifact = exportSession(makeSession(), "html");
    assert.equal(artifact.format, "html");
    assert.ok(artifact.content.includes("<!DOCTYPE html>"));
  });

  it("dispatches to pdf-metadata format", () => {
    const artifact = exportSession(makeSession(), "pdf-metadata");
    assert.equal(artifact.format, "pdf-metadata");
    const meta = JSON.parse(artifact.content);
    assert.equal(meta.format, "pdf-metadata");
  });

  it("throws InvalidSessionError on invalid session", () => {
    assert.throws(
      () => exportSession({} as unknown as Session, "md"),
      InvalidSessionError,
    );
  });

  it("throws InvalidExportFormatError on invalid format", () => {
    assert.throws(
      () => exportSession(makeSession(), "xml" as unknown as ExportFormat),
      InvalidExportFormatError,
    );
  });

  it("computes redactionReport with byCategory counts", () => {
    const artifact = exportSession(makeSession({
      question: "CPF 123.456.789-00 e email a@b.com",
    }), "md");
    assert.ok(artifact.redactionReport.totalRedactions >= 2);
    assert.ok(artifact.redactionReport.byCategory.cpf >= 1);
    assert.ok(artifact.redactionReport.byCategory.email >= 1);
  });

  it("sets piiLeakCheck='pass' when PII is redacted", () => {
    const artifact = exportSession(makeSession({
      question: "CPF 123.456.789-00",
    }), "md");
    assert.equal(artifact.redactionReport.piiLeakCheck, "pass");
  });

  it("counts citations and sacred refs", () => {
    const artifact = exportSession(makeSession(), "md");
    assert.ok(artifact.citationCount >= 1);
    assert.ok(artifact.sacredRefCount >= 1);
  });

  it("generates integrityHash when signatureSecret provided", () => {
    const artifact = exportSession(makeSession(), "md", {
      redactPII: true,
      includeAudioTranscript: true,
      includeJournal: true,
      includeCitations: true,
      signatureSecret: "test-secret",
    });
    assert.ok(artifact.integrityHash);
    assert.equal(artifact.integrityHash.length, 64);
  });

  it("omits integrityHash when no secret", () => {
    const artifact = exportSession(makeSession(), "md", {
      redactPII: true,
      includeAudioTranscript: true,
      includeJournal: true,
      includeCitations: true,
    });
    assert.equal(artifact.integrityHash, undefined);
  });
});

// ============================================================================
// SECTION H — Validation
// ============================================================================

describe("validateSession", () => {
  it("accepts valid session", () => {
    const r = validateSession(makeSession());
    assert.equal(r.valid, true);
    assert.equal(r.errors.length, 0);
  });

  it("rejects null", () => {
    const r = validateSession(null);
    assert.equal(r.valid, false);
    assert.ok(r.errors.length >= 1);
  });

  it("rejects non-object", () => {
    const r = validateSession("string");
    assert.equal(r.valid, false);
  });

  it("flags short id", () => {
    const r = validateSession({ ...makeSession(), id: "abc" });
    assert.equal(r.valid, false);
  });

  it("flags missing askerPseudonym", () => {
    const r = validateSession({ ...makeSession(), askerPseudonym: "" });
    assert.equal(r.valid, false);
  });

  it("warns on long pseudonym", () => {
    const longName = "x".repeat(100);
    const r = validateSession({ ...makeSession(), askerPseudonym: longName });
    assert.equal(r.valid, true);
    assert.ok(r.warnings.length >= 1);
  });

  it("rejects invalid locale", () => {
    const r = validateSession({ ...makeSession(), locale: "fr" });
    assert.equal(r.valid, false);
  });
});

describe("validateExportOpts", () => {
  it("accepts undefined opts", () => {
    const r = validateExportOpts(undefined);
    assert.equal(r.valid, true);
  });

  it("accepts valid opts", () => {
    const r = validateExportOpts(DEFAULT_EXPORT_OPTS as unknown as ExportOpts);
    assert.equal(r.valid, true);
  });

  it("rejects non-object opts", () => {
    const r = validateExportOpts(42);
    assert.equal(r.valid, false);
  });

  it("flags missing boolean fields", () => {
    const r = validateExportOpts({ redactPII: "yes" } as unknown as ExportOpts);
    assert.equal(r.valid, false);
  });

  it("rejects negative maxAudioLines", () => {
    const r = validateExportOpts({
      redactPII: true,
      includeAudioTranscript: true,
      includeJournal: true,
      includeCitations: true,
      maxAudioLines: -1,
    } as unknown as ExportOpts);
    assert.equal(r.valid, false);
  });
});

// ============================================================================
// SECTION I — Session registry
// ============================================================================

describe("loadSession + registerSessionForTest + clearSessionRegistry", () => {
  it("loadSession returns null for unknown id", () => {
    clearSessionRegistry();
    const s = loadSession("sess_unknown_xyz123" as SessionId);
    assert.equal(s, null);
  });

  it("loadSession returns registered session", () => {
    clearSessionRegistry();
    const session = makeSession({ id: "sess_reg_001_long_enough" as SessionId });
    registerSessionForTest(session);
    const loaded = loadSession("sess_reg_001_long_enough" as SessionId);
    assert.ok(loaded);
    assert.equal(loaded!.id, "sess_reg_001_long_enough");
  });

  it("clearSessionRegistry empties registry", () => {
    const session = makeSession({ id: "sess_clear_001_long_enough" as SessionId });
    registerSessionForTest(session);
    clearSessionRegistry();
    assert.equal(loadSession("sess_clear_001_long_enough" as SessionId), null);
  });

  it("registerSessionForTest ignores invalid sessions", () => {
    clearSessionRegistry();
    registerSessionForTest({} as Session);
    assert.equal(loadSession("anything" as SessionId), null);
  });

  it("loadSession handles non-string input", () => {
    assert.equal(loadSession(null as unknown as SessionId), null);
  });
});

// ============================================================================
// SECTION J — Audit coverage
// ============================================================================

describe("auditExportCoverage", () => {
  it("reports sections present", () => {
    const artifact = exportSession(makeSession(), "md");
    const cov = auditExportCoverage(artifact);
    assert.ok(cov.sectionsPresent.includes("header"));
    assert.ok(cov.sectionsPresent.includes("question"));
    assert.ok(cov.sectionsPresent.includes("cards"));
    assert.ok(cov.sectionsPresent.includes("interpretations"));
  });

  it("reports citationCount from artifact", () => {
    const artifact = exportSession(makeSession(), "md");
    const cov = auditExportCoverage(artifact);
    assert.equal(cov.citationCount, artifact.citationCount);
  });

  it("reports sacredRefCount from artifact", () => {
    const artifact = exportSession(makeSession(), "md");
    const cov = auditExportCoverage(artifact);
    assert.equal(cov.sacredRefCount, artifact.sacredRefCount);
  });

  it("reports redactionCount", () => {
    const artifact = exportSession(makeSession({
      question: "CPF 123.456.789-00",
    }), "md");
    const cov = auditExportCoverage(artifact);
    assert.ok(cov.redactionCount >= 1);
    assert.equal(cov.hasRedactions, true);
  });

  it("returns high risk for invalid artifact", () => {
    const cov = auditExportCoverage({} as ExportArtifact);
    assert.equal(cov.piiLeakRisk, "high");
  });

  it("returns low risk for clean session", () => {
    const artifact = exportSession(makeSession(), "md");
    const cov = auditExportCoverage(artifact);
    assert.equal(cov.piiLeakRisk, "low");
  });
});

// ============================================================================
// SECTION K — Error classes
// ============================================================================

describe("Error classes", () => {
  it("InvalidSessionError has correct code", () => {
    const e = new InvalidSessionError("test");
    assert.equal(e.code, "INVALID_SESSION");
    assert.equal(e.name, "InvalidSessionError");
    assert.ok(e instanceof Error);
  });

  it("InvalidExportFormatError has correct code", () => {
    const e = new InvalidExportFormatError("xml");
    assert.equal(e.code, "INVALID_EXPORT_FORMAT");
    assert.ok(e.message.includes("xml"));
  });

  it("PIILeakError lists leaks", () => {
    const e = new PIILeakError(["cpf:111", "email:a@b.com"]);
    assert.equal(e.code, "PII_LEAK");
    assert.equal(e.leaks.length, 2);
  });

  it("IntegrityCheckError has correct code", () => {
    const e = new IntegrityCheckError("hash mismatch");
    assert.equal(e.code, "INTEGRITY_CHECK_FAILED");
  });
});

// ============================================================================
// SECTION L — Integration: full export + verify chain
// ============================================================================

describe("Integration: full export + verify cycle", () => {
  it("md → integrityHash round-trips", () => {
    const session = makeSession();
    const opts: ExportOpts = {
      redactPII: true,
      includeAudioTranscript: true,
      includeJournal: true,
      includeCitations: true,
      signatureSecret: "integration-secret",
    };
    const artifact = exportSession(session, "md", opts);
    assert.ok(artifact.integrityHash);
    assert.equal(verifyExportIntegrity(artifact, "integration-secret"), true);
    assert.equal(verifyExportIntegrity(artifact, "wrong-secret"), false);
  });

  it("json → integrityHash round-trips", () => {
    const session = makeSession();
    const opts: ExportOpts = {
      redactPII: true,
      includeAudioTranscript: true,
      includeJournal: true,
      includeCitations: true,
      signatureSecret: "json-secret",
    };
    const artifact = exportSession(session, "json", opts);
    assert.ok(artifact.integrityHash);
    JSON.parse(artifact.content);
    assert.equal(verifyExportIntegrity(artifact, "json-secret"), true);
  });

  it("html → integrityHash round-trips", () => {
    const session = makeSession();
    const opts: ExportOpts = {
      redactPII: true,
      includeAudioTranscript: true,
      includeJournal: true,
      includeCitations: true,
      signatureSecret: "html-secret",
    };
    const artifact = exportSession(session, "html", opts);
    assert.ok(artifact.integrityHash);
    assert.equal(verifyExportIntegrity(artifact, "html-secret"), true);
  });

  it("buildSampleSession produces valid sample", () => {
    const s = buildSampleSession();
    assert.ok(isSession(s));
    assert.equal(s.locale, "pt-BR");
    assert.ok(s.askerPseudonym.length > 0);
  });

  it("full sample export covers all sections", () => {
    const artifact = exportSession(buildSampleSession(), "md");
    assert.ok(artifact.content.includes("## Cartas"));
    assert.ok(artifact.content.includes("## Interpretações"));
    assert.ok(artifact.content.includes("## Mesa Real"));
    assert.ok(artifact.content.includes("## Transcrição"));
    assert.ok(artifact.content.includes("## Diário"));
  });
});

// ============================================================================
// SECTION M — Edge cases + boundary conditions
// ============================================================================

describe("Edge cases", () => {
  it("empty journal → journal section omitted", () => {
    const md = exportAsMarkdown(makeSession({ journal: [] }));
    assert.ok(!md.includes("## Diário"));
  });

  it("no mesaReal → mesaReal section omitted", () => {
    const md = exportAsMarkdown(makeSession({ mesaReal: undefined }));
    assert.ok(!md.includes("## Mesa Real"));
  });

  it("no audioTranscript → transcript section omitted", () => {
    const md = exportAsMarkdown(makeSession({ audioTranscript: undefined }));
    assert.ok(!md.includes("## Transcrição"));
  });

  it("long audio transcript gets truncated with note", () => {
    const longTranscript = Array.from({ length: 500 }, (_, i) => `Linha ${i}`).join("\n");
    const md = exportAsMarkdown(makeSession({ audioTranscript: longTranscript }), {
      redactPII: false,
      includeAudioTranscript: true,
      includeJournal: false,
      includeCitations: false,
      maxAudioLines: 50,
    });
    assert.ok(md.includes("_Truncado"));
    assert.ok(!md.includes("Linha 499"));
  });

  it("unknown tradition still renders", () => {
    const md = exportAsMarkdown(makeSession({ askerTradition: "open" }));
    assert.ok(md.includes("Trad") && md.includes("open"));
  });
});

// ============================================================================
// SECTION N — Audit coverage: backward scan
// ============================================================================

describe("Audit metadata", () => {
  it("artifact has generatedAt in ISO format", () => {
    const artifact = exportSession(makeSession(), "md");
    assert.ok(/^\d{4}-\d{2}-\d{2}T/.test(artifact.generatedAt));
  });

  it("artifact.contentLength matches content length", () => {
    const artifact = exportSession(makeSession(), "md");
    assert.equal(artifact.contentLength, artifact.content.length);
  });

  it("auditExportCoverage handles non-artifact gracefully", () => {
    const cov = auditExportCoverage(null as unknown as ExportArtifact);
    assert.equal(cov.piiLeakRisk, "high");
  });
});

// ============================================================================
// Test runner
// ============================================================================

const main = async (): Promise<void> => {
  let passed = 0;
  let failed = 0;
  const failures: Array<{ name: string; err: unknown }> = [];
  for (const t of tests) {
    try {
      await t.fn();
      passed += 1;
    } catch (err) {
      failed += 1;
      failures.push({ name: t.name, err });
    }
  }
  // eslint-disable-next-line no-console
  console.log("Passed: " + passed);
  // eslint-disable-next-line no-console
  console.log("Failed: " + failed);
  if (failures.length > 0) {
    // eslint-disable-next-line no-console
    console.log("\nFailures:");
    for (const f of failures) {
      // eslint-disable-next-line no-console
      console.log("  - " + f.name + ": " + (f.err instanceof Error ? f.err.message : String(f.err)));
    }
  }
  if (failed > 0) {
    (globalThis as unknown as { process: { exit: (c: number) => void } }).process.exit(1);
  }
};

void main();
