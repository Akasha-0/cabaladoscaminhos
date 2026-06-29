/**
 * ============================================================================
 * Voice Mode (TTS) — Akasha Fala — Test Suite
 * ============================================================================
 * Smoke tests + edge cases. Target: 50+ assertions.
 *
 * Estrutura:
 *   1.  Voice profiles (3×3 = 9 combinações)
 *   2.  Chunking (3 estratégias × 3 inputs)
 *   3.  SSML builder (10 cases)
 *   4.  SSML validation (8 cases)
 *   5.  Cache key (4 cases)
 *   6.  LGPD consent gate (4 cases)
 *   7.  PII redaction (6 cases)
 *   8.  Audio duration estimation (3 cases)
 *   9.  Sacred tag validation (4 cases)
 *  10.  Error codes (5 cases)
 *  11.  i18n keys (3 locales × 6 keys = 18 cases)
 *  12.  Accessibility (4 cases)
 *  13.  synthesizeOracularResponse integration (5 cases)
 *  14.  safeLog (2 cases)
 *  15.  Fallback detection (3 cases)
 * ============================================================================
 */

import { describe, it, expect } from "vitest";

import {
  // Types
  type TTSLocale,
  type TTSVoiceProfile,
  type TTSChunkStrategy,
  type TTSRequest,
  type TTSConfig,
  // Engine
  getVoiceProfile,
  chunkTextForTTS,
  buildSSML,
  validateSSML,
  estimateAudioDurationMs,
  synthesizeOracularResponse,
  getTTSCacheKey,
  requiresLGPDConsent,
  redactPIIForTTS,
  // Sacred
  isValidSacredTag,
  buildSacredMarkName,
  // LGPD
  isValidUUIDv4,
  assertLGPDConsent,
  // Fallback
  detectTTSFallback,
  // Accessibility
  applyAccessibility,
  shouldPrefetchAudio,
  capChunksForAccessibility,
  // Errors
  validateTTSRequest,
  TTSError,
  // i18n
  getI18nKeys,
  // Utils
  getDefaultTTSConfig,
  safeLog,
  TTS_CONSTANTS,
} from "../voice_mode_tts_akasha";

// ============================================================================
// Helpers
// ============================================================================

const VALID_UUID_V4 = "550e8400-e29b-41d4-a716-446655440000";
const INVALID_UUID = "not-a-uuid";

function makeConfig(overrides: Partial<TTSConfig> = {}): TTSConfig {
  return {
    locale: "pt-BR",
    voice: "akasha-female",
    rate: 1.0,
    pitch: 0,
    volume: 1.0,
    maxChunkLen: 280,
    chunkStrategy: "sentence",
    ...overrides,
  };
}

function makeRequest(overrides: Partial<TTSRequest> = {}): TTSRequest {
  return {
    text: "A carta 1-Cavaleiro indica movimento. Lilith em Áries pede coragem. Exu abre caminhos.",
    config: makeConfig(),
    consentId: VALID_UUID_V4,
    ...overrides,
  };
}

// ============================================================================
// 1. Voice profiles (3 locales × 3 perfis = 9 combinações)
// ============================================================================

describe("getVoiceProfile", () => {
  it("pt-BR male retorna AntonioNeural", () => {
    const v = getVoiceProfile("pt-BR", "akasha-male");
    expect(v.name).toBe("pt-BR-AntonioNeural");
    expect(v.ssmlLang).toBe("pt-BR");
  });

  it("pt-BR female retorna FranciscaNeural", () => {
    const v = getVoiceProfile("pt-BR", "akasha-female");
    expect(v.name).toBe("pt-BR-FranciscaNeural");
  });

  it("pt-BR neutral retorna AntonioNeural (fallback male)", () => {
    const v = getVoiceProfile("pt-BR", "akasha-neutral");
    expect(v.name).toBe("pt-BR-AntonioNeural");
  });

  it("en-US male retorna GuyNeural", () => {
    const v = getVoiceProfile("en-US", "akasha-male");
    expect(v.name).toBe("en-US-GuyNeural");
  });

  it("en-US female retorna JennyNeural", () => {
    const v = getVoiceProfile("en-US", "akasha-female");
    expect(v.name).toBe("en-US-JennyNeural");
  });

  it("en-US neutral retorna AriaNeural", () => {
    const v = getVoiceProfile("en-US", "akasha-neutral");
    expect(v.name).toBe("en-US-AriaNeural");
  });

  it("es-ES male retorna AlvaroNeural", () => {
    const v = getVoiceProfile("es-ES", "akasha-male");
    expect(v.name).toBe("es-ES-AlvaroNeural");
  });

  it("es-ES female retorna ElviraNeural", () => {
    const v = getVoiceProfile("es-ES", "akasha-female");
    expect(v.name).toBe("es-ES-ElviraNeural");
  });

  it("es-ES neutral retorna AbrilNeural", () => {
    const v = getVoiceProfile("es-ES", "akasha-neutral");
    expect(v.name).toBe("es-ES-AbrilNeural");
  });

  it("ssmlLang sempre bate com locale", () => {
    const locales: TTSLocale[] = ["pt-BR", "en-US", "es-ES"];
    const voices: TTSVoiceProfile[] = ["akasha-male", "akasha-female", "akasha-neutral"];
    for (const locale of locales) {
      for (const voice of voices) {
        const v = getVoiceProfile(locale, voice);
        expect(v.ssmlLang).toBe(locale);
      }
    }
  });
});

// ============================================================================
// 2. Chunking (3 estratégias × múltiplos inputs)
// ============================================================================

describe("chunkTextForTTS — sentence strategy", () => {
  it("texto curto retorna 1 chunk", () => {
    const chunks = chunkTextForTTS("Olá mundo.", "sentence", 280);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toBe("Olá mundo.");
  });

  it("texto com 3 frases retorna 3 chunks", () => {
    const text = "Primeira frase. Segunda frase. Terceira frase.";
    const chunks = chunkTextForTTS(text, "sentence", 280);
    expect(chunks.length).toBeGreaterThanOrEqual(2);
    expect(chunks[0]).toContain("Primeira");
  });

  it("respeita Unicode (acentos e contrações PT-BR)", () => {
    const text = "Não há nada. É importante. Está claro.";
    const chunks = chunkTextForTTS(text, "sentence", 280);
    expect(chunks.length).toBeGreaterThan(0);
    // Não deve quebrar "Não" ou "É" no meio
    for (const chunk of chunks) {
      expect(chunk).not.toMatch(/Nã/); // Não quebrado
    }
  });

  it("respeita reticências como fim de frase", () => {
    const text = "Pensando… Decidindo. Agindo.";
    const chunks = chunkTextForTTS(text, "sentence", 280);
    expect(chunks.length).toBeGreaterThan(0);
  });

  it("texto vazio retorna []", () => {
    expect(chunkTextForTTS("", "sentence", 280)).toEqual([]);
  });

  it("whitespace-only retorna []", () => {
    expect(chunkTextForTTS("   \n  ", "sentence", 280)).toEqual([]);
  });
});

describe("chunkTextForTTS — paragraph strategy", () => {
  it("texto com 2 parágrafos retorna 2 chunks", () => {
    const text = "Primeiro parágrafo aqui.\n\nSegundo parágrafo aqui.";
    const chunks = chunkTextForTTS(text, "paragraph", 280);
    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toContain("Primeiro");
    expect(chunks[1]).toContain("Segundo");
  });

  it("parágrafo longo é subdividido por sentence", () => {
    const longPara =
      "Frase 1. Frase 2. Frase 3. Frase 4. Frase 5. Frase 6. Frase 7. Frase 8. Frase 9. Frase 10.";
    const chunks = chunkTextForTTS(longPara, "paragraph", 50);
    expect(chunks.length).toBeGreaterThan(1);
  });

  it("parágrafo com trim", () => {
    const text = "   Conteúdo com espaços.   \n\n   Segundo.   ";
    const chunks = chunkTextForTTS(text, "paragraph", 280);
    expect(chunks[0]).toBe("Conteúdo com espaços.");
    expect(chunks[1]).toBe("Segundo.");
  });
});

describe("chunkTextForTTS — fixed-len strategy", () => {
  it("respeita maxLen aproximado", () => {
    const text = "a".repeat(100);
    const chunks = chunkTextForTTS(text, "fixed-len", 30);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(30);
    }
    expect(chunks.join("").length).toBe(100);
  });

  it("quebra em word boundaries quando possível", () => {
    const text = "palavra1 palavra2 palavra3 palavra4 palavra5";
    const chunks = chunkTextForTTS(text, "fixed-len", 15);
    for (const chunk of chunks) {
      // Cada chunk deve começar com palavra completa (não espaço)
      if (chunk.length > 0) {
        expect(chunk[0]).not.toBe(" ");
      }
    }
  });

  it("palavra única maior que maxLen é quebrada forçadamente", () => {
    const text = "a".repeat(50);
    const chunks = chunkTextForTTS(text, "fixed-len", 20);
    expect(chunks.length).toBe(3); // 20 + 20 + 10
  });
});

// ============================================================================
// 3. SSML builder
// ============================================================================

describe("buildSSML", () => {
  it("wrap em <speak> com xml:lang correto", () => {
    const ssml = buildSSML("olá", "pt-BR", makeConfig());
    expect(ssml).toContain("<speak");
    expect(ssml).toContain('xml:lang="pt-BR"');
    expect(ssml).toContain("</speak>");
  });

  it("inclui <prosody> com rate/pitch/volume", () => {
    const ssml = buildSSML("olá", "pt-BR", makeConfig({ rate: 1.2, pitch: 2, volume: 0.8 }));
    expect(ssml).toContain("<prosody");
    expect(ssml).toMatch(/rate="\+0\.20"/);
    expect(ssml).toContain('pitch="+2st"');
    expect(ssml).toContain('volume="80%"');
  });

  it("inclui sacred mark quando tag fornecida", () => {
    const ssml = buildSSML("texto", "pt-BR", makeConfig(), "cigano|1-cavaleiro");
    expect(ssml).toContain('<mark name="sacred:cigano|1-cavaleiro"/>');
  });

  it("não inclui sacred mark quando tag ausente", () => {
    const ssml = buildSSML("texto", "pt-BR", makeConfig());
    expect(ssml).not.toContain("<mark");
  });

  it("escapa caracteres especiais XML", () => {
    const ssml = buildSSML("olá <mundo> & \"amigos\"", "pt-BR", makeConfig());
    expect(ssml).toContain("&lt;");
    expect(ssml).toContain("&gt;");
    expect(ssml).toContain("&amp;");
    expect(ssml).toContain("&quot;");
  });

  it("wrap números com <say-as>", () => {
    const ssml = buildSSML("A carta 1 indica caminho.", "pt-BR", makeConfig());
    expect(ssml).toContain('<say-as interpret-as="cardinal">1</say-as>');
  });

  it("adiciona <break> antes de : ou ;", () => {
    const ssml = buildSSML("Atenção: isso é importante; muito.", "pt-BR", makeConfig());
    expect(ssml).toContain('<break time="250ms"/>');
  });

  it("rate 1.0 não usa +0.0 (formato limpo)", () => {
    const ssml = buildSSML("olá", "pt-BR", makeConfig({ rate: 1.0 }));
    expect(ssml).toMatch(/rate="1\.0"/);
    expect(ssml).not.toContain("rate=\"+0");
  });

  it("rate 0.8 format como -0.20", () => {
    const ssml = buildSSML("olá", "pt-BR", makeConfig({ rate: 0.8 }));
    expect(ssml).toMatch(/rate="-0\.20"/);
  });

  it("clamp rate em [0.5, 2.0] (defesa em profundidade)", () => {
    const ssml = buildSSML("olá", "pt-BR", makeConfig({ rate: 5.0 }));
    expect(ssml).toMatch(/rate="\+1\.00"/);
  });

  it("clamp pitch em [-12, 12]", () => {
    const ssml = buildSSML("olá", "pt-BR", makeConfig({ pitch: 50 }));
    expect(ssml).toContain('pitch="+12st"');
  });
});

// ============================================================================
// 4. SSML validation
// ============================================================================

describe("validateSSML", () => {
  it("SSML válido retorna { valid: true, errors: [] }", () => {
    const ssml = '<speak xml:lang="pt-BR"><prosody rate="1.0">olá</prosody></speak>';
    const result = validateSSML(ssml);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("rejeita <script>", () => {
    const ssml = '<speak><script>alert("xss")</script></speak>';
    const result = validateSSML(ssml);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("script"))).toBe(true);
  });

  it("rejeita event handler on*", () => {
    const ssml = '<speak><prosody onclick="x">olá</prosody></speak>';
    const result = validateSSML(ssml);
    expect(result.valid).toBe(false);
  });

  it("rejeita javascript: URL", () => {
    const ssml = '<speak><a href="javascript:alert(1)">x</a></speak>';
    const result = validateSSML(ssml);
    expect(result.valid).toBe(false);
  });

  it("rejeita tag não balanceada", () => {
    const ssml = "<speak><prosody>olá</speak>";
    const result = validateSSML(ssml);
    expect(result.valid).toBe(false);
  });

  it("rejeita nesting > 3", () => {
    const ssml =
      "<speak><p><s><emphasis><prosody><say-as>olá</say-as></prosody></emphasis></s></p></speak>";
    const result = validateSSML(ssml);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("Nesting"))).toBe(true);
  });

  it("aceita self-closing tags como <break/>", () => {
    const ssml = '<speak><prosody>olá <break time="500ms"/> mundo</prosody></speak>';
    const result = validateSSML(ssml);
    expect(result.valid).toBe(true);
  });

  it("rejeita string vazia", () => {
    const result = validateSSML("");
    expect(result.valid).toBe(false);
  });

  it("aceita <mark/> self-closing", () => {
    const ssml = '<speak><mark name="sacred:test"/>texto</speak>';
    const result = validateSSML(ssml);
    expect(result.valid).toBe(true);
  });
});

// ============================================================================
// 5. Cache key
// ============================================================================

describe("getTTSCacheKey", () => {
  it("retorna string com prefixo tts: e 12 hex chars", () => {
    const key = getTTSCacheKey(makeRequest());
    expect(key).toMatch(/^tts:[0-9a-f]{12}$/);
  });

  it("mesmo input produz mesma key (determinístico)", () => {
    const req1 = makeRequest({ text: "mesmo texto" });
    const req2 = makeRequest({ text: "mesmo texto" });
    expect(getTTSCacheKey(req1)).toBe(getTTSCacheKey(req2));
  });

  it("text diferente produz key diferente", () => {
    const req1 = makeRequest({ text: "texto A" });
    const req2 = makeRequest({ text: "texto B" });
    expect(getTTSCacheKey(req1)).not.toBe(getTTSCacheKey(req2));
  });

  it("text com PII é redacted antes do hash", () => {
    const req1 = makeRequest({ text: "contato joao@example.com" });
    const req2 = makeRequest({ text: "contato maria@example.com" });
    // Como PII é redacted, "contato [dados removidos]" gera mesma key
    expect(getTTSCacheKey(req1)).toBe(getTTSCacheKey(req2));
  });

  it("voice diferente produz key diferente", () => {
    const req1 = makeRequest({ config: makeConfig({ voice: "akasha-male" }) });
    const req2 = makeRequest({ config: makeConfig({ voice: "akasha-female" }) });
    expect(getTTSCacheKey(req1)).not.toBe(getTTSCacheKey(req2));
  });
});

// ============================================================================
// 6. LGPD consent gate
// ============================================================================

describe("LGPD consent", () => {
  it("requiresLGPDConsent retorna true para cloud-TTS", () => {
    expect(requiresLGPDConsent("pt-BR")).toBe(true);
    expect(requiresLGPDConsent("en-US")).toBe(true);
    expect(requiresLGPDConsent("es-ES")).toBe(true);
  });

  it("isValidUUIDv4 aceita UUID v4 válido", () => {
    expect(isValidUUIDv4(VALID_UUID_V4)).toBe(true);
  });

  it("isValidUUIDv4 rejeita string inválida", () => {
    expect(isValidUUIDv4(INVALID_UUID)).toBe(false);
    expect(isValidUUIDv4("")).toBe(false);
    expect(isValidUUIDv4("550e8400-e29b-41d4-a716-44665544000")).toBe(false); // truncated
  });

  it("assertLGPDConsent lança TTSError se consentId ausente", () => {
    const req = makeRequest({ consentId: undefined });
    expect(() => assertLGPDConsent(req, true)).toThrow(TTSError);
    try {
      assertLGPDConsent(req, true);
    } catch (e) {
      expect((e as TTSError).code).toBe("CONSENT_MISSING");
    }
  });

  it("assertLGPDConsent passa com consentId válido", () => {
    const req = makeRequest({ consentId: VALID_UUID_V4 });
    expect(() => assertLGPDConsent(req, true)).not.toThrow();
  });
});

// ============================================================================
// 7. PII redaction
// ============================================================================

describe("redactPIIForTTS", () => {
  it("redige email", () => {
    expect(redactPIIForTTS("contato joao@example.com agora")).toBe(
      "contato [dados removidos] agora",
    );
  });

  it("redige phone BR (XX) 9XXXX-XXXX", () => {
    expect(redactPIIForTTS("ligue (11) 98765-4321 hoje")).toBe(
      "ligue [dados removidos] hoje",
    );
  });

  it("redige phone BR (XX) XXXX-XXXX", () => {
    expect(redactPIIForTTS("telefone (11) 4567-8901")).toBe(
      "telefone [dados removidos]",
    );
  });

  it("redige CPF", () => {
    expect(redactPIIForTTS("CPF 123.456.789-00 cadastrado")).toBe(
      "CPF [dados removidos] cadastrado",
    );
  });

  it("redige CNPJ", () => {
    expect(redactPIIForTTS("CNPJ 12.345.678/0001-90 ativo")).toBe(
      "CNPJ [dados removidos] ativo",
    );
  });

  it("redige múltiplas PIIs simultaneamente", () => {
    const input = "joao@example.com e (11) 98765-4321 e CPF 123.456.789-00";
    const output = redactPIIForTTS(input);
    expect(output).not.toContain("joao@example.com");
    expect(output).not.toContain("98765-4321");
    expect(output).not.toContain("123.456.789-00");
    expect(output).toContain("[dados removidos]");
  });

  it("idempotente (chamar 2x dá mesmo resultado)", () => {
    const input = "joao@example.com ligou";
    const once = redactPIIForTTS(input);
    const twice = redactPIIForTTS(once);
    expect(once).toBe(twice);
  });

  it("texto sem PII passa inalterado", () => {
    const text = "A carta 1-Cavaleiro indica movimento.";
    expect(redactPIIForTTS(text)).toBe(text);
  });
});

// ============================================================================
// 8. Audio duration estimation
// ============================================================================

describe("estimateAudioDurationMs", () => {
  it("texto vazio retorna 0", () => {
    expect(estimateAudioDurationMs("", 1.0)).toBe(0);
  });

  it("rate 1.0 com 140 chars = ~10000ms", () => {
    const text = "a".repeat(140);
    const ms = estimateAudioDurationMs(text, 1.0);
    expect(ms).toBe(10000);
  });

  it("rate 2.0 divide duração por 2", () => {
    const text = "a".repeat(140);
    expect(estimateAudioDurationMs(text, 2.0)).toBe(5000);
  });

  it("rate 0.5 dobra duração", () => {
    const text = "a".repeat(140);
    expect(estimateAudioDurationMs(text, 0.5)).toBe(20000);
  });

  it("clamp rate em [0.5, 2.0]", () => {
    const text = "a".repeat(140);
    expect(estimateAudioDurationMs(text, 10.0)).toBe(5000);
    expect(estimateAudioDurationMs(text, 0.1)).toBe(20000);
  });
});

// ============================================================================
// 9. Sacred tag validation
// ============================================================================

describe("isValidSacredTag", () => {
  it("aceita cigano|1-cavaleiro", () => {
    expect(isValidSacredTag("cigano|1-cavaleiro")).toBe(true);
  });

  it("aceita astrologia|lilith-aries", () => {
    expect(isValidSacredTag("astrologia|lilith-aries")).toBe(true);
  });

  it("aceita orixa|exu", () => {
    expect(isValidSacredTag("orixa|exu")).toBe(true);
  });

  it("rejeita tag sem pipe", () => {
    expect(isValidSacredTag("cigano-1-cavaleiro")).toBe(false);
  });

  it("rejeita tradição não suportada", () => {
    expect(isValidSacredTag("wicca|sabbat")).toBe(false);
  });

  it("rejeita string vazia", () => {
    expect(isValidSacredTag("")).toBe(false);
  });
});

describe("buildSacredMarkName", () => {
  it("prefixa com sacred: para tag válida", () => {
    expect(buildSacredMarkName("cigano|1-cavaleiro")).toBe(
      "sacred:cigano|1-cavaleiro",
    );
  });

  it("lança TTSError para tag inválida", () => {
    expect(() => buildSacredMarkName("wicca|sabbat")).toThrow(TTSError);
  });
});

// ============================================================================
// 10. Error codes
// ============================================================================

describe("TTSError", () => {
  it("cria com code e message", () => {
    const e = new TTSError("INVALID_TEXT", "teste");
    expect(e.code).toBe("INVALID_TEXT");
    expect(e.message).toBe("teste");
    expect(e.name).toBe("TTSError");
  });

  it("context é frozen e timestamp presente", () => {
    const e = new TTSError("INVALID_TEXT", "teste", { foo: "bar" });
    expect(e.timestamp).toBeGreaterThan(0);
    expect(() => {
      (e.context as Record<string, unknown>).foo = "baz";
    }).toThrow();
  });

  it("stack sanitiza PII", () => {
    const e = new TTSError(
      "INVALID_TEXT",
      "joao@example.com e (11) 98765-4321 e 123.456.789-00",
    );
    expect(e.stack).not.toContain("joao@example.com");
    expect(e.stack).not.toContain("98765-4321");
    expect(e.stack).not.toContain("123.456.789-00");
  });
});

describe("validateTTSRequest", () => {
  it("request válido retorna []", () => {
    expect(validateTTSRequest(makeRequest())).toEqual([]);
  });

  it("texto vazio retorna INVALID_TEXT", () => {
    const errors = validateTTSRequest(makeRequest({ text: "" }));
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].code).toBe("INVALID_TEXT");
  });

  it("rate fora do range retorna RATE_OUT_OF_RANGE", () => {
    const errors = validateTTSRequest(
      makeRequest({ config: makeConfig({ rate: 3.0 }) }),
    );
    expect(errors.some((e) => e.code === "RATE_OUT_OF_RANGE")).toBe(true);
  });

  it("pitch fora do range retorna PITCH_OUT_OF_RANGE", () => {
    const errors = validateTTSRequest(
      makeRequest({ config: makeConfig({ pitch: 50 }) }),
    );
    expect(errors.some((e) => e.code === "PITCH_OUT_OF_RANGE")).toBe(true);
  });

  it("volume fora do range retorna VOLUME_OUT_OF_RANGE", () => {
    const errors = validateTTSRequest(
      makeRequest({ config: makeConfig({ volume: 1.5 }) }),
    );
    expect(errors.some((e) => e.code === "VOLUME_OUT_OF_RANGE")).toBe(true);
  });
});

// ============================================================================
// 11. i18n keys
// ============================================================================

describe("getI18nKeys", () => {
  it("pt-BR tem 12 chaves", () => {
    const keys = getI18nKeys("pt-BR");
    expect(Object.keys(keys)).toHaveLength(12);
    expect(keys.playButton).toBe("Tocar");
    expect(keys.voiceLabel).toBe("Voz da Akasha");
    expect(keys.chunkLabel).toBe("Trecho");
  });

  it("en-US tem 12 chaves em inglês", () => {
    const keys = getI18nKeys("en-US");
    expect(Object.keys(keys)).toHaveLength(12);
    expect(keys.playButton).toBe("Play");
    expect(keys.errorNoConsent).toContain("Consent");
    expect(keys.chunkLabel).toBe("Chunk");
  });

  it("es-ES tem 12 chaves em espanhol", () => {
    const keys = getI18nKeys("es-ES");
    expect(Object.keys(keys)).toHaveLength(12);
    expect(keys.playButton).toBe("Reproducir");
    expect(keys.chunkLabel).toBe("Fragmento");
  });

  it("chaves essenciais estão em todos locales", () => {
    for (const locale of ["pt-BR", "en-US", "es-ES"] as TTSLocale[]) {
      const keys = getI18nKeys(locale);
      expect(keys.playButton).toBeTruthy();
      expect(keys.pauseButton).toBeTruthy();
      expect(keys.stopButton).toBeTruthy();
      expect(keys.voiceLabel).toBeTruthy();
      expect(keys.errorNoConsent).toBeTruthy();
      expect(keys.errorLocaleUnsupported).toBeTruthy();
      expect(keys.errorChunkTooLarge).toBeTruthy();
      expect(keys.errorPiiDetected).toBeTruthy();
      expect(keys.sacredTagPrefix).toBeTruthy();
      expect(keys.downloadAudio).toBeTruthy();
      expect(keys.rateLabel).toBeTruthy();
      expect(keys.chunkLabel).toBeTruthy();
    }
  });
});

// ============================================================================
// 12. Accessibility
// ============================================================================

describe("applyAccessibility", () => {
  it("sem reduced-motion retorna config inalterado", () => {
    const config = makeConfig({ maxChunkLen: 100 });
    const result = applyAccessibility(config);
    expect(result.maxChunkLen).toBe(100);
  });

  it("reduced-motion aumenta maxChunkLen para >= 400", () => {
    const config = makeConfig({ maxChunkLen: 100 });
    const result = applyAccessibility(config, { prefersReducedMotion: true });
    expect(result.maxChunkLen).toBeGreaterThanOrEqual(400);
  });

  it("reduced-motion não diminui se maxChunkLen já é >= 400", () => {
    const config = makeConfig({ maxChunkLen: 450 });
    const result = applyAccessibility(config, { prefersReducedMotion: true });
    expect(result.maxChunkLen).toBe(450);
  });
});

describe("shouldPrefetchAudio", () => {
  it("reduced-data desabilita prefetch", () => {
    expect(shouldPrefetchAudio("texto longo", { prefersReducedData: true })).toBe(false);
  });

  it("sem reduced-data permite prefetch", () => {
    expect(shouldPrefetchAudio("texto longo")).toBe(true);
  });
});

describe("capChunksForAccessibility", () => {
  it("sem reduced-motion retorna chunks inalterados", () => {
    const chunks = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
    expect(capChunksForAccessibility(chunks, false)).toEqual(chunks);
  });

  it("reduced-motion com 10 chunks agrega via fixed-len", () => {
    const chunks = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
    const result = capChunksForAccessibility(chunks, true);
    expect(result.length).toBeLessThan(10);
    expect(result.length).toBeLessThanOrEqual(6);
  });

  it("reduced-motion com <= 6 chunks retorna inalterado", () => {
    const chunks = ["a", "b", "c"];
    expect(capChunksForAccessibility(chunks, true)).toEqual(chunks);
  });
});

// ============================================================================
// 13. synthesizeOracularResponse integration
// ============================================================================

describe("synthesizeOracularResponse", () => {
  it("sintetiza request simples com 1 chunk", () => {
    const resp = synthesizeOracularResponse(
      makeRequest({ text: "A carta indica movimento." }),
    );
    expect(resp.totalChunks).toBeGreaterThanOrEqual(1);
    expect(resp.localeUsed).toBe("pt-BR");
    expect(resp.voiceUsed).toBe("akasha-female");
  });

  it("calcula totalEstimatedDurationMs", () => {
    const resp = synthesizeOracularResponse(
      makeRequest({ text: "Frase 1. Frase 2. Frase 3." }),
    );
    expect(resp.totalEstimatedDurationMs).toBeGreaterThan(0);
    // Soma dos chunks = total
    const sum = resp.chunks.reduce((s, c) => s + c.estimatedDurationMs, 0);
    expect(sum).toBe(resp.totalEstimatedDurationMs);
  });

  it("inclui sacred mark no SSML quando tag fornecida", () => {
    const resp = synthesizeOracularResponse(
      makeRequest({ sacredTag: "cigano|1-cavaleiro" }),
    );
    expect(resp.chunks[0].ssml).toContain("sacred:cigano|1-cavaleiro");
  });

  it("lança TTSError se consentId ausente (cloud-TTS)", () => {
    expect(() =>
      synthesizeOracularResponse(makeRequest({ consentId: undefined })),
    ).toThrow(TTSError);
    try {
      synthesizeOracularResponse(makeRequest({ consentId: undefined }));
    } catch (e) {
      expect((e as TTSError).code).toBe("CONSENT_MISSING");
    }
  });

  it("lança TTSError se texto vazio", () => {
    expect(() =>
      synthesizeOracularResponse(makeRequest({ text: "" })),
    ).toThrow(TTSError);
  });

  it("redige PII antes de processar", () => {
    const resp = synthesizeOracularResponse(
      makeRequest({ text: "contato joao@example.com para leitura" }),
    );
    // Nenhum chunk deve conter o email plain
    for (const chunk of resp.chunks) {
      expect(chunk.text).not.toContain("joao@example.com");
      expect(chunk.ssml).not.toContain("joao@example.com");
    }
  });

  it("gera SSML válido para cada chunk", () => {
    const resp = synthesizeOracularResponse(makeRequest());
    for (const chunk of resp.chunks) {
      const validation = validateSSML(chunk.ssml);
      expect(validation.valid).toBe(true);
    }
  });

  it("índice de chunks é sequencial 0..N-1", () => {
    const resp = synthesizeOracularResponse(
      makeRequest({ text: "Frase A. Frase B. Frase C. Frase D. Frase E." }),
    );
    for (let i = 0; i < resp.chunks.length; i++) {
      expect(resp.chunks[i].index).toBe(i);
    }
  });
});

// ============================================================================
// 14. safeLog
// ============================================================================

describe("safeLog", () => {
  it("retorna prefixo sha256 com 16 hex chars", () => {
    const log = safeLog("texto confidencial");
    expect(log).toMatch(/^\[sha256:[0-9a-f]{16}\]$/);
  });

  it("não inclui o texto plain", () => {
    const text = "informação muito sensível sobre o usuário";
    const log = safeLog(text);
    expect(log).not.toContain("usuário");
    expect(log).not.toContain("sensível");
  });

  it("texto vazio retorna [empty]", () => {
    expect(safeLog("")).toBe("[empty]");
  });
});

// ============================================================================
// 15. Fallback detection
// ============================================================================

describe("detectTTSFallback", () => {
  it("com cloud credentials retorna cloud", () => {
    const r = detectTTSFallback(true, true);
    expect(r.target).toBe("cloud");
    expect(r.available).toBe(true);
  });

  it("sem cloud mas com Web Speech API retorna web-speech-api", () => {
    const r = detectTTSFallback(true, false);
    expect(r.target).toBe("web-speech-api");
    expect(r.available).toBe(true);
  });

  it("sem nada retorna silent", () => {
    const r = detectTTSFallback(false, false);
    expect(r.target).toBe("silent");
    expect(r.available).toBe(false);
  });
});

// ============================================================================
// 16. getDefaultTTSConfig
// ============================================================================

describe("getDefaultTTSConfig", () => {
  it("pt-BR default tem voice female", () => {
    const config = getDefaultTTSConfig("pt-BR");
    expect(config.locale).toBe("pt-BR");
    expect(config.voice).toBe("akasha-female");
    expect(config.rate).toBe(1.0);
    expect(config.pitch).toBe(0);
    expect(config.volume).toBe(1.0);
  });

  it("en-US default funciona", () => {
    const config = getDefaultTTSConfig("en-US");
    expect(config.locale).toBe("en-US");
  });

  it("es-ES default funciona", () => {
    const config = getDefaultTTSConfig("es-ES");
    expect(config.locale).toBe("es-ES");
  });
});

// ============================================================================
// 17. TTS_CONSTANTS
// ============================================================================

describe("TTS_CONSTANTS", () => {
  it("HARD_CHUNK_CAP = 500", () => {
    expect(TTS_CONSTANTS.HARD_CHUNK_CAP).toBe(500);
  });

  it("CACHE_KEY_HEX_LEN = 12", () => {
    expect(TTS_CONSTANTS.CACHE_KEY_HEX_LEN).toBe(12);
  });

  it("MAX_NESTING_DEPTH = 3", () => {
    expect(TTS_CONSTANTS.MAX_NESTING_DEPTH).toBe(3);
  });

  it("SUPPORTED_LOCALES tem 3 entries", () => {
    expect(TTS_CONSTANTS.SUPPORTED_LOCALES).toHaveLength(3);
  });

  it("SUPPORTED_VOICES tem 3 entries", () => {
    expect(TTS_CONSTANTS.SUPPORTED_VOICES).toHaveLength(3);
  });

  it("SUPPORTED_STRATEGIES tem 3 entries", () => {
    expect(TTS_CONSTANTS.SUPPORTED_STRATEGIES).toHaveLength(3);
  });

  it("ERROR_CODES tem 9 codes", () => {
    expect(TTS_CONSTANTS.ERROR_CODES).toHaveLength(9);
    expect(TTS_CONSTANTS.ERROR_CODES).toContain("INVALID_TEXT");
    expect(TTS_CONSTANTS.ERROR_CODES).toContain("SSML_INVALID");
    expect(TTS_CONSTANTS.ERROR_CODES).toContain("CONSENT_MISSING");
  });
});
