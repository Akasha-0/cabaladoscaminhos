/**
 * dream-journal-engine.spec.ts
 *
 * Cycle 67 — Worker B.
 * Spec suite for the dream journal engine. Designed to run via vitest
 * with vitest.config.local.mjs (NOT the repo's vitest.config.ts) so the
 * engine stays isolated from main app dependencies.
 *
 * Coverage targets:
 *   - Branded type constructors (5 cases)
 *   - PII redaction (6 cases)
 *   - Sacred extraction across all 7 traditions (≥21 cases)
 *   - Dream classification (6 cases)
 *   - Lexicon build + forget (5 cases)
 *   - Recurring pattern analysis (4 cases)
 *   - createDreamEntry end-to-end (8 cases)
 *   - interpretDream (4 cases)
 *   - HMAC chain (6 cases)
 *   - Sacred coverage audit (4 cases)
 *   - Type guards (3 cases)
 *   - Error classes (4 cases)
 *   - Constants + catalogs (5 cases)
 *
 * Total: 80+ it() blocks (well above the ≥40 floor).
 */

import { describe, it, expect } from "vitest";
import {
  createDreamEntry,
  extractSacredSymbols,
  analyzeRecurringPatterns,
  buildPersonalLexicon,
  interpretDream,
  redactPII,
  chainDreamHash,
  verifyDreamHashLink,
  auditDreamCoverage,
  classifyDreamCategory,
  toDreamEntryId,
  toUserId,
  toDreamHash,
  emptyLexicon,
  forgetSymbol,
  DREAM_CATEGORIES,
  SACRED_TRADITIONS,
  CIGANO_SYMBOLS,
  ORIXAS_SYMBOLS,
  SEFIROT_SYMBOLS,
  ASTROLOGIA_SYMBOLS,
  CHAKRAS_SYMBOLS,
  HEBREW_SYMBOLS,
  TAROT_SYMBOLS,
  ALL_SACRED_SYMBOLS,
  REQUIRED_COVERAGE_FLOORS,
  DreamEngineError,
  InvalidDreamTextError,
  InvalidUserIdError,
  HashChainError,
  isSacredTradition,
  isDreamCategory,
  isSacredHit,
  isUserLexicon,
  type DreamEntry,
  type UserLexicon,
  type SacredCoverageReport,
} from "./dream-journal-engine.ts";

// =====================================================================
// Section 1: Branded type constructors
// =====================================================================

describe("branded type constructors", () => {
  it("toDreamEntryId accepts non-empty string", () => {
    const id = toDreamEntryId("dream_abc");
    expect(id).toBe("dream_abc");
  });

  it("toDreamEntryId throws on empty string", () => {
    expect(() => toDreamEntryId("")).toThrow(InvalidDreamTextError);
  });

  it("toUserId accepts non-empty string", () => {
    const id = toUserId("user_xyz");
    expect(id).toBe("user_xyz");
  });

  it("toUserId throws on empty string", () => {
    expect(() => toUserId("")).toThrow(InvalidUserIdError);
  });

  it("toDreamHash accepts 64-char hex", () => {
    const hex = "a".repeat(64);
    const h = toDreamHash(hex);
    expect(h).toBe(hex);
  });

  it("toDreamHash throws on wrong length", () => {
    expect(() => toDreamHash("abc")).toThrow(HashChainError);
  });

  it("toDreamHash throws on non-hex chars", () => {
    expect(() => toDreamHash("z".repeat(64))).toThrow(HashChainError);
  });
});

// =====================================================================
// Section 2: PII redaction
// =====================================================================

describe("redactPII", () => {
  it("redacts email addresses", () => {
    const out = redactPII("meu email é teste@dominio.com e não lembro mais");
    expect(out).toContain("[REDACTED]");
    expect(out).not.toContain("teste@dominio.com");
  });

  it("redacts Brazilian phone numbers", () => {
    const out = redactPII("me liga em (11) 98765-4321 quando acordar");
    expect(out).not.toContain("98765-4321");
    expect(out).toContain("[REDACTED]");
  });

  it("redacts CPF", () => {
    const out = redactPII("meu CPF é 123.456.789-09 e eu sou brasileiro");
    expect(out).not.toContain("123.456.789-09");
    expect(out).toContain("[REDACTED]");
  });

  it("redacts RG", () => {
    const out = redactPII("documento RG 12.345.678-9 apresentado");
    expect(out).not.toContain("12.345.678-9");
  });

  it("redacts URLs", () => {
    const out = redactPII("vi o vídeo em https://youtube.com/watch?v=123");
    expect(out).not.toContain("youtube.com");
  });

  it("returns empty string for non-string", () => {
    // @ts-expect-error testing runtime guard
    expect(redactPII(null)).toBe("");
    // @ts-expect-error testing runtime guard
    expect(redactPII(undefined)).toBe("");
  });

  it("passes through sacred text unchanged", () => {
    const text = "sonhei com uma cobra e uma estrela";
    const out = redactPII(text);
    expect(out).toBe(text);
  });
});

// =====================================================================
// Section 3: Sacred extraction — all 7 traditions
// =====================================================================

describe("extractSacredSymbols — Cigano", () => {
  it("detects cobra → A Serpente (Cigano 7)", () => {
    const hits = extractSacredSymbols("sonhei com uma cobra enorme");
    expect(hits.some((h) => h.tradition === "cigano" && h.symbol === "A Serpente")).toBe(true);
  });

  it("detects mar/ondas → O Navio (Cigano 3)", () => {
    const hits = extractSacredSymbols("o mar estava com ondas gigantes");
    expect(hits.some((h) => h.symbol === "O Navio")).toBe(true);
  });

  it("detects criança → A Criança (Cigano 13)", () => {
    const hits = extractSacredSymbols("uma criança chorava no jardim");
    expect(hits.some((h) => h.symbol === "A Criança")).toBe(true);
  });

  it("detects cruz/igreja → A Cruz (Cigano 36)", () => {
    const hits = extractSacredSymbols("entrei numa igreja cheia de cruzes");
    expect(hits.some((h) => h.symbol === "A Cruz")).toBe(true);
  });

  it("detects lua → A Lua (Cigano 32)", () => {
    const hits = extractSacredSymbols("a lua brilhava prateada na noite");
    expect(hits.some((h) => h.symbol === "A Lua")).toBe(true);
  });
});

describe("extractSacredSymbols — Orixás", () => {
  it("detects Oxalá", () => {
    const hits = extractSacredSymbols("Oxalá me recebeu com luz branca");
    expect(hits.some((h) => h.symbol === "Oxalá")).toBe(true);
  });

  it("detects Iemanjá", () => {
    const hits = extractSacredSymbols("Iemanjá me abraçou nas ondas");
    expect(hits.some((h) => h.symbol === "Iemanjá")).toBe(true);
  });

  it("detects Xangô", () => {
    const hits = extractSacredSymbols("Xangô trovejou forte no céu");
    expect(hits.some((h) => h.symbol === "Xangô")).toBe(true);
  });

  it("detects Ogum", () => {
    const hits = extractSacredSymbols("Ogum vinha montado num cavalo");
    expect(hits.some((h) => h.symbol === "Ogum")).toBe(true);
  });

  it("detects Erê (criança de santo)", () => {
    const hits = extractSacredSymbols("um erê brincava com a menina");
    expect(hits.some((h) => h.symbol === "Erê")).toBe(true);
  });
});

describe("extractSacredSymbols — Sefirot", () => {
  it("detects Kether", () => {
    const hits = extractSacredSymbols("vi uma coroa de luz — Kether brilhando");
    expect(hits.some((h) => h.symbol === "Kether")).toBe(true);
  });

  it("detects Tiphereth", () => {
    const hits = extractSacredSymbols("o equilíbrio de Tiphereth guiou meu caminho");
    expect(hits.some((h) => h.symbol === "Tiphereth")).toBe(true);
  });

  it("detects Malkuth", () => {
    const hits = extractSacredSymbols("desci ao reino de Malkuth");
    expect(hits.some((h) => h.symbol === "Malkuth")).toBe(true);
  });
});

describe("extractSacredSymbols — Astrologia", () => {
  it("detects Áries", () => {
    const hits = extractSacredSymbols("Áries me guiava em batalha");
    expect(hits.some((h) => h.symbol === "Áries")).toBe(true);
  });

  it("detects Escorpião", () => {
    const hits = extractSacredSymbols("um escorpião cruzou meu caminho");
    expect(hits.some((h) => h.symbol === "Escorpião")).toBe(true);
  });

  it("detects Peixes (signo)", () => {
    const hits = extractSacredSymbols("eu era do signo de Peixes e sonhava com água");
    expect(hits.some((h) => h.symbol === "Peixes" && h.tradition === "astrologia")).toBe(true);
  });
});

describe("extractSacredSymbols — Chakras", () => {
  it("detects Anahata", () => {
    const hits = extractSacredSymbols("senti o chakra cardíaco (Anahata) pulsar");
    expect(hits.some((h) => h.symbol === "Anahata")).toBe(true);
  });

  it("detects Sahasrara", () => {
    const hits = extractSacredSymbols("a coroa Sahasrara explodiu em luz");
    expect(hits.some((h) => h.symbol === "Sahasrara")).toBe(true);
  });
});

describe("extractSacredSymbols — Hebrew", () => {
  it("detects Aleph", () => {
    const hits = extractSacredSymbols("a letra Aleph apareceu escrita no ar");
    expect(hits.some((h) => h.symbol === "Aleph")).toBe(true);
  });

  it("detects Shin", () => {
    const hits = extractSacredSymbols("vi a letra Shin gravada em pedra");
    expect(hits.some((h) => h.symbol === "Shin")).toBe(true);
  });

  it("detects Tav", () => {
    const hits = extractSacredSymbols("Tav era o símbolo final");
    expect(hits.some((h) => h.symbol === "Tav")).toBe(true);
  });
});

describe("extractSacredSymbols — Tarot", () => {
  it("detects O Louco", () => {
    const hits = extractSacredSymbols("um louco caminhava sem destino");
    expect(hits.some((h) => h.symbol === "O Louco")).toBe(true);
  });

  it("detects A Morte (tarot)", () => {
    const hits = extractSacredSymbols("a Morte veio como um esqueleto branco");
    expect(hits.some((h) => h.symbol === "A Morte" && h.tradition === "tarot")).toBe(true);
  });

  it("detects A Torre (tarot) via raio", () => {
    const hits = extractSacredSymbols("um raio derrubou a torre");
    expect(hits.some((h) => h.symbol === "A Torre" && h.tradition === "tarot")).toBe(true);
  });

  it("detects O Diabo", () => {
    const hits = extractSacredSymbols("o diabo me ofereceu um contrato");
    expect(hits.some((h) => h.symbol === "O Diabo")).toBe(true);
  });
});

describe("extractSacredSymbols — edge cases", () => {
  it("returns empty array for empty text", () => {
    expect(extractSacredSymbols("")).toEqual([]);
  });

  it("returns empty array for non-sacred text", () => {
    const hits = extractSacredSymbols("fui ao mercado comprar arroz e feijão");
    expect(hits).toEqual([]);
  });

  it("does not false-positive on substring inside word", () => {
    // "estrela" inside "estrelato" — lookaround should still match
    // because "estrelato" is one word; the trigger "estrela" requires word boundary
    const hits = extractSacredSymbols("estrelato festivo não conta como sagrado");
    // Either no hit, or only if a trigger matches; "estrela" requires \W around it
    // "estrelato" is between \W (start) and \W (space) — wait, the regex requires
    // (?:$|\W) AFTER, which is space — that would match "estrela" + "to"? No,
    // because the regex source is exactly `estrela`. With lookaround the trigger
    // text is `estrela`. The match is "estrelato" if "estrelato" sits between \W's.
    // Let me trace: text = "estrelato festivo", regex = (?:\W|^)estrela(?:\W|$)
    //   match.index = 0, match[0] = "estrelato" — but the regex literal is "estrela",
    //   so it would only match "estrela" (6 chars), not "estrelato" (9 chars).
    //   The (?:\W|^) prefix matches the empty string before 'estrela', then 'estrela'
    //   matches 6 chars, then (?:\W|$) tries to match the next char. Next char is 't'
    //   (a word char) — does NOT match \W or $. So no match. 
    expect(hits.some((h) => h.symbol === "A Estrela" || h.symbol === "A Estrela (tarot)")).toBe(false);
  });

  it("hits are sorted by position ascending", () => {
    const hits = extractSacredSymbols("uma estrela e uma cobra");
    for (let i = 1; i < hits.length; i++) {
      expect(hits[i]!.position).toBeGreaterThanOrEqual(hits[i - 1]!.position);
    }
  });

  it("snippet includes surrounding context", () => {
    const hits = extractSacredSymbols("ontem sonhei com uma cobra verde");
    const cobra = hits.find((h) => h.symbol === "A Serpente");
    expect(cobra).toBeDefined();
    expect(cobra!.snippet.length).toBeGreaterThan(5);
    expect(cobra!.snippet.toLowerCase()).toContain("cobra");
  });
});

// =====================================================================
// Section 4: Dream classification
// =====================================================================

describe("classifyDreamCategory", () => {
  it("classifies LUCID when 'lúcido' present", () => {
    expect(classifyDreamCategory("sonho lúcido, eu tinha controle")).toBe("LUCID");
  });

  it("classifies NIGHTMARE when 'pesadelo' present", () => {
    expect(classifyDreamCategory("foi um pesadelo horrível")).toBe("NIGHTMARE");
  });

  it("classifies PROPHETIC when 'profético' present", () => {
    expect(classifyDreamCategory("visão profética do meu futuro")).toBe("PROPHETIC");
  });

  it("classifies ANXIETY when 'ansiedade' present", () => {
    expect(classifyDreamCategory("estava com muita ansiedade e fugindo")).toBe("ANXIETY");
  });

  it("returns NORMAL for non-keyword dream", () => {
    expect(classifyDreamCategory("fui ao parque e comi pipoca")).toBe("NORMAL");
  });

  it("escalates to RECURRING when lexicon has symbol freq >= 3", () => {
    const lex: UserLexicon = {
      userId: toUserId("u1"),
      symbols: [
        {
          symbol: "A Serpente",
          frequency: 3,
          lastSeen: 1,
          sacredTradition: "cigano",
          category: "shadow",
        },
      ],
      generatedAt: 1,
    };
    expect(classifyDreamCategory("sonhei com uma cobra", lex)).toBe("RECURRING");
  });

  it("isDreamCategory type guard accepts valid", () => {
    expect(isDreamCategory("NORMAL")).toBe(true);
    expect(isDreamCategory("INVALID")).toBe(false);
  });

  it("DREAM_CATEGORIES has exactly 6 values", () => {
    expect(DREAM_CATEGORIES.length).toBe(6);
  });
});

// =====================================================================
// Section 5: Lexicon build + forget
// =====================================================================

describe("buildPersonalLexicon", () => {
  it("aggregates symbol frequencies across entries", () => {
    const e1 = createDreamEntry({ userId: "u1", rawText: "cobra e lua", recordedAt: 100 });
    const e2 = createDreamEntry({ userId: "u1", rawText: "outra cobra", recordedAt: 200 });
    const lex = buildPersonalLexicon([e1, e2]);
    const serpente = lex.symbols.find((s) => s.symbol === "A Serpente");
    expect(serpente?.frequency).toBe(2);
  });

  it("sorts symbols by frequency descending", () => {
    const e1 = createDreamEntry({ userId: "u1", rawText: "cobra cobra cobra e lua", recordedAt: 100 });
    const lex = buildPersonalLexicon([e1]);
    expect(lex.symbols[0]!.symbol).toBe("A Serpente");
    expect(lex.symbols[0]!.frequency).toBeGreaterThanOrEqual(3);
  });

  it("throws on empty entries", () => {
    expect(() => buildPersonalLexicon([])).toThrow(InvalidDreamTextError);
  });

  it("emptyLexicon returns empty array factory", () => {
    const lex = emptyLexicon(toUserId("u1"));
    expect(lex.symbols).toEqual([]);
    expect(lex.userId).toBe("u1");
  });

  it("emptyLexicon does not share state across calls", () => {
    const a = emptyLexicon(toUserId("u1"));
    const b = emptyLexicon(toUserId("u2"));
    expect(a.symbols).not.toBe(b.symbols);
  });
});

describe("forgetSymbol (LGPD Art. 18)", () => {
  it("removes symbol from lexicon", () => {
    const lex: UserLexicon = {
      userId: toUserId("u1"),
      symbols: [
        { symbol: "A Serpente", frequency: 5, lastSeen: 1, sacredTradition: "cigano", category: "shadow" },
        { symbol: "A Estrela", frequency: 3, lastSeen: 2, sacredTradition: "cigano", category: "light" },
      ],
      generatedAt: 1,
    };
    const out = forgetSymbol(lex, "A Serpente");
    expect(out.symbols.find((s) => s.symbol === "A Serpente")).toBeUndefined();
    expect(out.symbols.find((s) => s.symbol === "A Estrela")).toBeDefined();
  });

  it("returns a new lexicon (immutability)", () => {
    const lex: UserLexicon = {
      userId: toUserId("u1"),
      symbols: [
        { symbol: "A Serpente", frequency: 1, lastSeen: 1, sacredTradition: "cigano", category: "shadow" },
      ],
      generatedAt: 1,
    };
    const out = forgetSymbol(lex, "A Serpente");
    expect(out).not.toBe(lex);
    expect(lex.symbols.length).toBe(1); // original preserved
  });

  it("throws on invalid input", () => {
    // @ts-expect-error testing runtime guard
    expect(() => forgetSymbol(null, "x")).toThrow(InvalidDreamTextError);
    const lex = emptyLexicon(toUserId("u1"));
    expect(() => forgetSymbol(lex, "")).toThrow(InvalidDreamTextError);
  });
});

// =====================================================================
// Section 6: Recurring pattern analysis
// =====================================================================

describe("analyzeRecurringPatterns", () => {
  it("returns empty for empty entries", () => {
    expect(analyzeRecurringPatterns([])).toEqual([]);
  });

  it("counts symbol occurrences across entries", () => {
    const e1 = createDreamEntry({ userId: "u1", rawText: "cobra", recordedAt: 100 });
    const e2 = createDreamEntry({ userId: "u1", rawText: "cobra de novo", recordedAt: 200 });
    const e3 = createDreamEntry({ userId: "u1", rawText: "cobra outra vez", recordedAt: 300 });
    const patterns = analyzeRecurringPatterns([e1, e2, e3]);
    const serpente = patterns.find((p) => p.symbol === "A Serpente");
    expect(serpente?.count).toBe(3);
  });

  it("flags nightmare symbols correctly", () => {
    const e1 = createDreamEntry({ userId: "u1", rawText: "vi uma caveira — morte e diabo", recordedAt: 100 });
    const patterns = analyzeRecurringPatterns([e1]);
    const morte = patterns.find((p) => p.symbol === "A Morte");
    expect(morte?.isNightmare).toBe(true);
  });

  it("non-nightmare symbols return isNightmare=false", () => {
    const e1 = createDreamEntry({ userId: "u1", rawText: "uma estrela brilhante", recordedAt: 100 });
    const patterns = analyzeRecurringPatterns([e1]);
    const estrela = patterns.find((p) => p.symbol === "A Estrela");
    expect(estrela?.isNightmare).toBe(false);
  });

  it("sorts patterns by count desc", () => {
    const e1 = createDreamEntry({ userId: "u1", rawText: "cobra cobra cobra e estrela", recordedAt: 100 });
    const patterns = analyzeRecurringPatterns([e1]);
    if (patterns.length >= 2) {
      expect(patterns[0]!.count).toBeGreaterThanOrEqual(patterns[1]!.count);
    }
  });

  it("respects custom nightmare set", () => {
    const e1 = createDreamEntry({ userId: "u1", rawText: "uma estrela", recordedAt: 100 });
    const patterns = analyzeRecurringPatterns([e1], new Set(["A Estrela"]));
    expect(patterns.find((p) => p.symbol === "A Estrela")?.isNightmare).toBe(true);
  });
});

// =====================================================================
// Section 7: createDreamEntry end-to-end
// =====================================================================

describe("createDreamEntry", () => {
  it("creates entry with redacted text and sacred hits", () => {
    const entry = createDreamEntry({
      userId: "user123",
      rawText: "meu email é teste@x.com e sonhei com uma cobra",
      recordedAt: 1000,
    });
    expect(entry.userId).toBe("user123");
    expect(entry.sanitizedText).not.toContain("teste@x.com");
    expect(entry.sacredHits.some((h) => h.symbol === "A Serpente")).toBe(true);
  });

  it("generates a stable id per call", () => {
    const a = createDreamEntry({ userId: "u1", rawText: "cobra", recordedAt: 100 });
    const b = createDreamEntry({ userId: "u1", rawText: "cobra", recordedAt: 100 });
    expect(a.id).toMatch(/^dream_/);
    expect(b.id).toMatch(/^dream_/);
    // ids include Math.random so they should differ
    expect(a.id === b.id).toBe(false);
  });

  it("hashChain is 64-char hex", () => {
    const entry = createDreamEntry({ userId: "u1", rawText: "cobra", recordedAt: 100 });
    expect(entry.hashChain).toMatch(/^[0-9a-f]{64}$/);
  });

  it("hashChain is deterministic for same redacted+userId+time", () => {
    const e1 = createDreamEntry({ userId: "u1", rawText: "cobra", recordedAt: 100 });
    const e2 = createDreamEntry({ userId: "u1", rawText: "cobra", recordedAt: 100 });
    expect(e1.hashChain).toBe(e2.hashChain);
  });

  it("hashChain DIFFERS when userId changes", () => {
    const e1 = createDreamEntry({ userId: "u1", rawText: "cobra", recordedAt: 100 });
    const e2 = createDreamEntry({ userId: "u2", rawText: "cobra", recordedAt: 100 });
    expect(e1.hashChain).not.toBe(e2.hashChain);
  });

  it("hashChain DIFFERS when recordedAt changes", () => {
    const e1 = createDreamEntry({ userId: "u1", rawText: "cobra", recordedAt: 100 });
    const e2 = createDreamEntry({ userId: "u1", rawText: "cobra", recordedAt: 200 });
    expect(e1.hashChain).not.toBe(e2.hashChain);
  });

  it("interpretedSymbols contains unique symbol names", () => {
    const entry = createDreamEntry({
      userId: "u1",
      rawText: "cobra cobra cobra e estrela",
      recordedAt: 100,
    });
    const set = new Set(entry.interpretedSymbols);
    expect(set.size).toBe(entry.interpretedSymbols.length);
  });

  it("lexiconDelta has one entry per unique symbol", () => {
    const entry = createDreamEntry({
      userId: "u1",
      rawText: "cobra cobra cobra",
      recordedAt: 100,
    });
    expect(entry.lexiconDelta.length).toBe(entry.interpretedSymbols.length);
  });

  it("category defaults to NORMAL for neutral text", () => {
    const entry = createDreamEntry({ userId: "u1", rawText: "comprei pão na padaria", recordedAt: 100 });
    expect(entry.category).toBe("NORMAL");
  });

  it("category detects NIGHTMARE for scary keywords", () => {
    const entry = createDreamEntry({ userId: "u1", rawText: "um pesadelo com monstros", recordedAt: 100 });
    expect(entry.category).toBe("NIGHTMARE");
  });

  it("throws on missing userId", () => {
    expect(() => createDreamEntry({ userId: "", rawText: "x", recordedAt: 1 })).toThrow(InvalidUserIdError);
  });

  it("throws on missing recordedAt", () => {
    expect(() =>
      createDreamEntry({ userId: "u1", rawText: "x", recordedAt: Number.NaN }),
    ).toThrow(InvalidDreamTextError);
  });
});

// =====================================================================
// Section 8: interpretDream
// =====================================================================

describe("interpretDream", () => {
  it("returns '—' primary when no sacred hits", () => {
    const entry = createDreamEntry({ userId: "u1", rawText: "comprei pão", recordedAt: 100 });
    const lex = emptyLexicon(toUserId("u1"));
    const out = interpretDream(entry, lex);
    expect(out.primarySymbol).toBe("—");
    expect(out.suggestedOracle).toBe("cigano");
  });

  it("suggests 'cigano' when Cigano tradition dominates", () => {
    const entry = createDreamEntry({ userId: "u1", rawText: "cobra lua cruz", recordedAt: 100 });
    const lex = emptyLexicon(toUserId("u1"));
    const out = interpretDream(entry, lex);
    expect(out.suggestedOracle).toBe("cigano");
  });

  it("suggests 'tarot' when Tarot tradition dominates", () => {
    const entry = createDreamEntry({ userId: "u1", rawText: "diabo morte torre e o louco", recordedAt: 100 });
    const lex = emptyLexicon(toUserId("u1"));
    const out = interpretDream(entry, lex);
    expect(out.suggestedOracle).toBe("tarot");
  });

  it("suggests 'astrologia' when Astrologia dominates", () => {
    const entry = createDreamEntry({ userId: "u1", rawText: "Áries Touro Gêmeos Câncer Leão", recordedAt: 100 });
    const lex = emptyLexicon(toUserId("u1"));
    const out = interpretDream(entry, lex);
    expect(out.suggestedOracle).toBe("astrologia");
  });

  it("suggests 'odi' when Orixás dominates", () => {
    const entry = createDreamEntry({
      userId: "u1",
      rawText: "Oxalá Xangô Ogum Oxum Iemanjá Iansã",
      recordedAt: 100,
    });
    const lex = emptyLexicon(toUserId("u1"));
    const out = interpretDream(entry, lex);
    expect(out.suggestedOracle).toBe("odi");
  });

  it("secondarySymbols limited to 3 entries", () => {
    const entry = createDreamEntry({
      userId: "u1",
      rawText: "cobra cobra cobra e estrela e lua e cruz e anel e coração",
      recordedAt: 100,
    });
    const lex = emptyLexicon(toUserId("u1"));
    const out = interpretDream(entry, lex);
    expect(out.secondarySymbols.length).toBeLessThanOrEqual(3);
  });
});

// =====================================================================
// Section 9: HMAC chain
// =====================================================================

describe("chainDreamHash", () => {
  it("produces 64-char hex", () => {
    const h = chainDreamHash({
      redactedText: "cobra",
      userId: toUserId("u1"),
      recordedAt: 100,
    });
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic for same inputs", () => {
    const input = { redactedText: "cobra", userId: toUserId("u1"), recordedAt: 100 };
    const h1 = chainDreamHash(input);
    const h2 = chainDreamHash(input);
    expect(h1).toBe(h2);
  });

  it("differs when redactedText changes", () => {
    const base = { userId: toUserId("u1"), recordedAt: 100 };
    const h1 = chainDreamHash({ ...base, redactedText: "cobra" });
    const h2 = chainDreamHash({ ...base, redactedText: "lua" });
    expect(h1).not.toBe(h2);
  });

  it("differs when secret changes", () => {
    const input = { redactedText: "cobra", userId: toUserId("u1"), recordedAt: 100 };
    const h1 = chainDreamHash(input, "secretA");
    const h2 = chainDreamHash(input, "secretB");
    expect(h1).not.toBe(h2);
  });

  it("throws on non-string redactedText", () => {
    expect(() =>
      chainDreamHash({
        // @ts-expect-error testing runtime guard
        redactedText: null,
        userId: toUserId("u1"),
        recordedAt: 1,
      }),
    ).toThrow(HashChainError);
  });

  it("throws on non-finite recordedAt", () => {
    expect(() =>
      chainDreamHash({
        redactedText: "x",
        userId: toUserId("u1"),
        recordedAt: Number.POSITIVE_INFINITY,
      }),
    ).toThrow(HashChainError);
  });
});

describe("verifyDreamHashLink", () => {
  it("returns true when candidate matches computed", () => {
    const input = { redactedText: "cobra", userId: toUserId("u1"), recordedAt: 100 };
    const h = chainDreamHash(input);
    expect(verifyDreamHashLink(null, input, h)).toBe(true);
  });

  it("returns false when candidate tampered", () => {
    const input = { redactedText: "cobra", userId: toUserId("u1"), recordedAt: 100 };
    const tampered = toDreamHash("a".repeat(64));
    expect(verifyDreamHashLink(null, input, tampered)).toBe(false);
  });
});

// =====================================================================
// Section 10: Sacred coverage audit
// =====================================================================

describe("auditDreamCoverage", () => {
  it("reports all 7 traditions", () => {
    const r = auditDreamCoverage();
    expect(r.cigano).toBeGreaterThanOrEqual(36);
    expect(r.orixas).toBeGreaterThanOrEqual(16);
    expect(r.sefirot).toBeGreaterThanOrEqual(10);
    expect(r.astrologia).toBeGreaterThanOrEqual(12);
    expect(r.chakras).toBeGreaterThanOrEqual(7);
    expect(r.hebrew).toBeGreaterThanOrEqual(22);
    expect(r.tarot).toBeGreaterThanOrEqual(22);
  });

  it("total >= 125 symbols", () => {
    const r = auditDreamCoverage();
    expect(r.total).toBeGreaterThanOrEqual(125);
  });

  it("isFullCoverage=true when all floors met", () => {
    const r = auditDreamCoverage();
    expect(r.isFullCoverage).toBe(true);
  });

  it("missing is empty when isFullCoverage=true", () => {
    const r = auditDreamCoverage();
    expect(r.missing).toEqual([]);
  });
});

// =====================================================================
// Section 11: Type guards
// =====================================================================

describe("type guards", () => {
  it("isSacredTradition accepts valid", () => {
    expect(isSacredTradition("cigano")).toBe(true);
    expect(isSacredTradition("orixas")).toBe(true);
    expect(isSacredTradition("invalid")).toBe(false);
    expect(isSacredTradition(null)).toBe(false);
    expect(isSacredTradition(undefined)).toBe(false);
  });

  it("isSacredHit accepts well-formed", () => {
    expect(
      isSacredHit({
        tradition: "cigano",
        symbol: "A Serpente",
        position: 0,
        snippet: "cobra",
      }),
    ).toBe(true);
    expect(isSacredHit({})).toBe(false);
    expect(isSacredHit(null)).toBe(false);
  });

  it("isUserLexicon accepts well-formed", () => {
    expect(
      isUserLexicon({
        userId: "u1",
        symbols: [],
        generatedAt: 1,
      }),
    ).toBe(true);
    expect(isUserLexicon({})).toBe(false);
  });
});

// =====================================================================
// Section 12: Error classes
// =====================================================================

describe("error classes", () => {
  it("DreamEngineError carries code", () => {
    const e = new DreamEngineError("x", "test_code");
    expect(e.code).toBe("test_code");
    expect(e instanceof Error).toBe(true);
  });

  it("InvalidDreamTextError extends DreamEngineError", () => {
    const e = new InvalidDreamTextError("x");
    expect(e.code).toBe("invalid_dream_text");
    expect(e instanceof DreamEngineError).toBe(true);
  });

  it("InvalidUserIdError extends DreamEngineError", () => {
    const e = new InvalidUserIdError("x");
    expect(e.code).toBe("invalid_user_id");
  });

  it("HashChainError extends DreamEngineError", () => {
    const e = new HashChainError("x");
    expect(e.code).toBe("hash_chain_error");
  });
});

// =====================================================================
// Section 13: Constants + catalogs
// =====================================================================

describe("constants and catalogs", () => {
  it("SACRED_TRADITIONS has exactly 7 values", () => {
    expect(SACRED_TRADITIONS.length).toBe(7);
  });

  it("CIGANO_SYMBOLS has exactly 36", () => {
    expect(CIGANO_SYMBOLS.length).toBe(36);
  });

  it("ORIXAS_SYMBOLS has exactly 16", () => {
    expect(ORIXAS_SYMBOLS.length).toBe(16);
  });

  it("SEFIROT_SYMBOLS has exactly 10", () => {
    expect(SEFIROT_SYMBOLS.length).toBe(10);
  });

  it("ASTROLOGIA_SYMBOLS has exactly 12", () => {
    expect(ASTROLOGIA_SYMBOLS.length).toBe(12);
  });

  it("CHAKRAS_SYMBOLS has exactly 7", () => {
    expect(CHAKRAS_SYMBOLS.length).toBe(7);
  });

  it("HEBREW_SYMBOLS has exactly 22", () => {
    expect(HEBREW_SYMBOLS.length).toBe(22);
  });

  it("TAROT_SYMBOLS has exactly 22", () => {
    expect(TAROT_SYMBOLS.length).toBe(22);
  });

  it("ALL_SACRED_SYMBOLS = sum of 7 catalogs = 125", () => {
    expect(ALL_SACRED_SYMBOLS.length).toBe(125);
  });

  it("REQUIRED_COVERAGE_FLOORS matches brief targets", () => {
    expect(REQUIRED_COVERAGE_FLOORS.cigano).toBe(36);
    expect(REQUIRED_COVERAGE_FLOORS.orixas).toBe(16);
    expect(REQUIRED_COVERAGE_FLOORS.sefirot).toBe(10);
    expect(REQUIRED_COVERAGE_FLOORS.astrologia).toBe(12);
    expect(REQUIRED_COVERAGE_FLOORS.chakras).toBe(7);
    expect(REQUIRED_COVERAGE_FLOORS.hebrew).toBe(22);
    expect(REQUIRED_COVERAGE_FLOORS.tarot).toBe(22);
  });

  it("every catalog entry has at least one trigger", () => {
    for (const sym of ALL_SACRED_SYMBOLS) {
      expect(sym.triggers.length).toBeGreaterThan(0);
    }
  });

  it("every catalog entry has a valid polarity", () => {
    for (const sym of ALL_SACRED_SYMBOLS) {
      expect(["light", "shadow", "neutral"]).toContain(sym.polarity);
    }
  });
});

// =====================================================================
// Section 14: Cross-tradition integration
// =====================================================================

describe("cross-tradition integration", () => {
  it("extracts symbols from 3+ traditions in one dream", () => {
    const hits = extractSacredSymbols(
      "vi uma cobra e Oxalá e Áries e a letra Aleph e o diabo",
    );
    const traditions = new Set(hits.map((h) => h.tradition));
    expect(traditions.size).toBeGreaterThanOrEqual(3);
  });

  it("buildPersonalLexicon preserves tradition metadata", () => {
    const entry = createDreamEntry({
      userId: "u1",
      rawText: "cobra e Oxalá e Áries",
      recordedAt: 100,
    });
    const lex = buildPersonalLexicon([entry]);
    const traditions = new Set(lex.symbols.map((s) => s.sacredTradition));
    expect(traditions.has("cigano")).toBe(true);
    expect(traditions.has("orixas")).toBe(true);
    expect(traditions.has("astrologia")).toBe(true);
  });

  it("report can be used as SacredCoverageReport type", () => {
    const r: SacredCoverageReport = auditDreamCoverage();
    expect(typeof r.total).toBe("number");
    expect(r.isFullCoverage).toBe(true);
  });

  it("dream entry type is well-formed for return chain", () => {
    const entry: DreamEntry = createDreamEntry({
      userId: "u1",
      rawText: "cobra",
      recordedAt: 100,
    });
    expect(entry.id).toMatch(/^dream_/);
    expect(typeof entry.userId).toBe("string");
    expect(Array.isArray(entry.sacredHits)).toBe(true);
    expect(Array.isArray(entry.interpretedSymbols)).toBe(true);
    expect(Array.isArray(entry.lexiconDelta)).toBe(true);
    expect(typeof entry.hashChain).toBe("string");
    expect(typeof entry.createdAt).toBe("number");
  });
});

// =====================================================================
// Section 15: LGPD posture
// =====================================================================

describe("LGPD posture", () => {
  it("hashChain binds to redactedText, not rawText", () => {
    const a = createDreamEntry({ userId: "u1", rawText: "cobra teste@x.com", recordedAt: 100 });
    const b = createDreamEntry({ userId: "u1", rawText: "cobra outro@y.com", recordedAt: 100 });
    // Same redactedText ("cobra [REDACTED]"), same userId, same timestamp → same hash
    expect(a.hashChain).toBe(b.hashChain);
  });

  it("sanitizedText strips email", () => {
    const entry = createDreamEntry({
      userId: "u1",
      rawText: "sonhei com cobra e meu email é x@y.com",
      recordedAt: 100,
    });
    expect(entry.sanitizedText).not.toContain("x@y.com");
    expect(entry.sanitizedText).toContain("cobra");
  });

  it("forgetSymbol preserves other symbols and user identity", () => {
    const entry = createDreamEntry({
      userId: "u99",
      rawText: "cobra e estrela",
      recordedAt: 100,
    });
    const lex = buildPersonalLexicon([entry]);
    const after = forgetSymbol(lex, "A Serpente");
    expect(after.userId).toBe("u99");
    expect(after.symbols.find((s) => s.symbol === "A Estrela")).toBeDefined();
    expect(after.symbols.find((s) => s.symbol === "A Serpente")).toBeUndefined();
  });
});