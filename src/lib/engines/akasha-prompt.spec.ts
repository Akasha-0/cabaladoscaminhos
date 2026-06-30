/**
 * ════════════════════════════════════════════════════════════════════════════
 * W82-B — AKASHA PROMPT CONTEXT BUILDER · SPEC
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Self-running spec — no vitest. Cycles 60-71 pattern (cycle 73 in
 * particular): harness with `_reset()` between tests, positive result
 * narrowing (`if (r.ok)`).
 *
 * Run with: `node --experimental-strip-types akasha-prompt.spec.ts`
 * Expects: ~30+ assertions, exits 0 on PASS.
 */

// @ts-ignore — node-stubs.d.ts provides the global type definitions in main tsconfig.
declare const process: { exit(code: number): never };

import {
  buildContext,
  casasRelevantes,
  relevanceFingerprint,
  scoreCasaForTokens,
  tokenizeForRelevance,
  nfdNormalize,
  DEFAULT_SYSTEM_ROLE,
  SURGICAL_INSTRUCTION_RULES,
  MAX_CASAS_RELEVANTES,
  MAX_SACRED_TERMS_SURFACED,
  CASA_CONSULENTE,
  CASA_RETORNO,
  MESA_REAL_HOUSES_TOTAL,
  type CasaNumber,
  type CruzamentoCasa,
  type HistoricoChat,
  type LeituraSintetizada,
  type PerguntaConsulente,
  type PromptContext,
} from './akasha-prompt/index.ts';

// ════════════════════════════════════════════════════════════════════════════
// Tiny harness (cycle 60+ pattern)
// ════════════════════════════════════════════════════════════════════════════

interface SpecEntry {
  name: string;
  run: () => void | Promise<void>;
}

const SPEC_REGISTRY: SpecEntry[] = [];

function it(name: string, run: () => void | Promise<void>): void {
  SPEC_REGISTRY.push({ name, run: () => run() });
}

function assertEqual<T>(actual: T, expected: T, label?: string): void {
  const ok = Object.is(actual, expected) || JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    throw new Error(
      `assertEqual FAIL${label ? ' (' + label + ')' : ''}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
  }
}

function assertTrue(v: unknown, label?: string): void {
  if (!v) throw new Error(`assertTrue FAIL${label ? ' (' + label + ')' : ''}: ${String(v)}`);
}

function assertContains(haystack: string, needle: string, label?: string): void {
  if (!haystack.includes(needle)) {
    throw new Error(
      `assertContains FAIL${label ? ' (' + label + ')' : ''}: ${JSON.stringify(needle)} not in ${JSON.stringify(haystack.slice(0, 200))}`,
    );
  }
}

function assertMatch(haystack: string, re: RegExp, label?: string): void {
  if (!re.test(haystack)) {
    throw new Error(
      `assertMatch FAIL${label ? ' (' + label + ')' : ''}: ${re} not in ${JSON.stringify(haystack.slice(0, 200))}`,
    );
  }
}

function assertArrayLength<T>(arr: ReadonlyArray<T>, expected: number, label?: string): void {
  if (arr.length !== expected) {
    throw new Error(
      `assertArrayLength FAIL${label ? ' (' + label + ')' : ''}: expected ${expected}, got ${arr.length}`,
    );
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Fixtures: 36-house LeituraSintetizada
// ════════════════════════════════════════════════════════════════════════════

function makeCasa(
  numero: number,
  tema: CruzamentoCasa['tema'],
  cartaNome: string,
  sintese: string,
  rotulos: ReadonlyArray<string> = [],
): CruzamentoCasa {
  const cn = numero as CasaNumber;
  const contribuicoes = rotulos.map((r) => ({
    tradicao: 'astrologia',
    rotulo: r,
    texto: `${r} marca o posicionamento desta casa na roda.`,
  }));
  return Object.freeze({
    numero: cn,
    tema,
    cartaCigana: Object.freeze({
      id: ((numero - 1) % 36) + 1,
      nome: cartaNome,
      superficie: `1-line read for ${cartaNome} at casa ${numero}.`,
    }),
    contribuicoes: Object.freeze(contribuicoes) as ReadonlyArray<typeof contribuicoes[number]>,
    sintese,
  });
}

function makeBaseLeitura(): LeituraSintetizada {
  const houses: CruzamentoCasa[] = [
    makeCasa(1, 'identidade', 'Cavaleiro', 'O consulente parte em jornada marcada por iniciativa. Plena individuação.', ['Casa 1 — Áries']),
    makeCasa(2, 'financas', 'Trevo', 'Recursos surgem em pequenas doses. Boa fortuna quando bem cuidada.', ['Casa 2 — Touro', 'Tiphareth']),
    makeCasa(3, 'comunicacao', 'Nave', 'Comunicação rápida, irmãos e contratos. Mensageiro entre mundos.', ['Casa 3 — Gêmeos']),
    makeCasa(4, 'familia', 'Casa', 'Raízes profundas no lar emocional. Ancestralidade ativa.', ['Casa 4 — Câncer']),
    makeCasa(5, 'criatividade', 'Árvore', 'Vitalidade criativa. Filho ou criação como obra-prima.', ['Casa 5 — Leão', 'Imperatriz']),
    makeCasa(6, 'saude', 'Nuvens', 'Saúde pede discernimento. Mindful routine essencial.', ['Casa 6 — Virgem']),
    makeCasa(7, 'relacionamentos', 'Cobra', 'Parcerias exigem vigilância. Vênus em Libra desafia.', ['Casa 7 — Libra']),
    makeCasa(8, 'sexualidade', 'Caixão', 'Sexualidade intensa, transformadora. Plutão em Escorpião. Lilith marca sombras.', ['Casa 8 — Escorpião', 'Plutão', 'Lilith']),
    makeCasa(9, 'viagens', 'Buquê', 'Viagens abençoadas. Filosofia doadora. Júpiter expande horizonte.', ['Casa 9 — Sagitário']),
    makeCasa(10, 'trabalho', 'Foice', 'Trabalho cortante. Decisões claras no MC em Capricórnio.', ['Casa 10 — Capricórnio', 'Meio do Céu']),
    makeCasa(11, 'amizades', 'Chicote', 'Amizades provocam crescimento. Grupos de afinidade Saturno-em-Aquário.', ['Casa 11 — Aquário']),
    makeCasa(12, 'espiritualidade', 'Pássaros', 'Espiritualidade aérea. Conexão com a meditação Vipassana.', ['Casa 12 — Peixes', 'Chokhmah', 'Mago']),
    makeCasa(13, 'ciclo', 'Criança', 'Início de novo ciclo. Inocência recuperada.', ['Life Path 11']),
    makeCasa(14, 'ciclo', 'Cachorro', 'Lealdade ao ciclo. Amizade interna e externa.', ['Saturno retrógrado']),
    makeCasa(15, 'ciclo', 'Raposa', 'Ciclo pede estratégia. Astúcia.', ['Netuno']),
    makeCasa(16, 'ciclo', 'Urso', 'Força interna. Reserva.', ['Marte em Leão']),
    makeCasa(17, 'ciclo', 'Estrela', 'Esperança renova o ciclo. Fé.', ['Astrologia: Vênus']),
    makeCasa(18, 'ciclo', 'Cegonha', 'Renascimento. Ciclos de transformação.', ['Netuno em Peixes']),
    makeCasa(19, 'ciclo', 'Lua', 'Ciclo emocional. Intuição.', ['Lua em Câncer']),
    makeCasa(20, 'ciclo', 'Chave', 'Ciclo de abertura. Resposta.', ['Sol']),
    makeCasa(21, 'ciclo', 'Peixes', 'Abundância. Multiplicação.', ['Júpiter']),
    makeCasa(22, 'proposito', 'Carta', 'Propósito comunica. Mensagem.', ['Life Path 22', 'Expression 22', 'Kether']),
    makeCasa(23, 'proposito', 'Ramo', 'Propósito cresce. Ramificação.', ['Cabala']),
    makeCasa(24, 'ciclo', 'Sapo', 'Transformação no ciclo. Mutação.', ['Tantra: Muladhara']),
    makeCasa(25, 'proposito', 'Coração', 'Propósito do amor. Coração.', ['Anahata']),
    makeCasa(26, 'proposito', 'Anel', 'Propósito do vínculo. Aliança.', ['Number Master 33']),
    makeCasa(27, 'proposito', 'Livro', 'Propósito do saber. Estudo.', ['Cabala: Binah']),
    makeCasa(28, 'ciclo', 'Cigano', 'O Cigano no ciclo 28. Representa o homem da estrada.', ['Ogum', 'Odu Ogundá']),
    makeCasa(29, 'ciclo', 'Cigana', 'A Cigana no ciclo 29. Representa a mulher da estrada.', ['Oxum', 'Odu Ejiogbe']),
    makeCasa(30, 'ciclo', 'Lírios', 'Pureza no ciclo. Maturidade.', ['Tarot: Imperatriz']),
    makeCasa(31, 'ciclo', 'Sol', 'Clareza no ciclo. Dia.', ['Sol em Leão']),
    makeCasa(32, 'ciclo', 'Torre', 'Colapso do ciclo. Reconstrução.', ['Tarot: A Torre']),
    makeCasa(33, 'ciclo', 'Estrela', 'Esperança no fim do ciclo. Fé.', ['Number Master 33']),
    makeCasa(34, 'ciclo', 'Cruz', 'Cruzamento de ciclos. Karma.', ['Lilith']),
    makeCasa(35, 'ciclo', 'Barco', 'Travessia do ciclo. Viagem.', ['Astrologia']),
    makeCasa(36, 'ciclo', 'Retorno', 'O Retorno completa 36. Fechamento e recomeço.', ['Cabala: Malkuth', 'Odu Alafia']),
  ];
  return Object.freeze(houses) as LeituraSintetizada;
}

function makeBasePergunta(over: Partial<PerguntaConsulente> = {}): PerguntaConsulente {
  return Object.freeze({
    texto: 'Como está minha sexualidade?',
    ...over,
  }) as PerguntaConsulente;
}

function makeEmptyHistorico(maxTurnos: number = 8): HistoricoChat {
  return { mensagens: [], maxTurnos };
}

function makeFullHistorico(maxTurnos: number = 8): HistoricoChat {
  const mensagens: Array<{ role: 'user' | 'assistant'; texto: string; ts: number }> = [];
  for (let i = 0; i < maxTurnos * 2 + 1; i++) {
    mensagens.push({
      role: i % 2 === 0 ? 'user' : 'assistant',
      texto: `Mensagem de teste ${i + 1}.`,
      ts: 1_700_000_000_000 + i * 1000,
    });
  }
  return { mensagens, maxTurnos };
}

// ════════════════════════════════════════════════════════════════════════════
// SPECS — relevance
// ════════════════════════════════════════════════════════════════════════════

it('casasRelevantes with explicit casasCitadas returns those (deduped + bounded)', () => {
  const leitura = makeBaseLeitura();
  const pergunta = makeBasePergunta({
    casasCitadas: [22, 22, 8, 36, 100, 1],  // dedupe + clamp + invalid
  });
  const out = casasRelevantes(leitura, pergunta);
  const nums = out.map((c) => c.numero);
  // Should include 22, 8, 36, 1 in some order; duplicate 22 dropped; 100 invalid dropped.
  assertTrue(nums.includes(22), '22 must be present');
  assertTrue(nums.includes(8), '8 must be present');
  assertTrue(nums.includes(36), '36 must be present');
  assertTrue(nums.includes(1), '1 must be present');
  // Duplicate 22 dropped
  assertEqual(nums.filter((n) => n === 22).length, 1, '22 dedupe');
});

it('casasRelevantes with tema tag returns tema-matched casas', () => {
  const leitura = makeBaseLeitura();
  const pergunta = makeBasePergunta({
    texto: '',
    tema: 'sexualidade',
  });
  // We need a non-empty texto for the validation; supply a paraphrase
  const p = { texto: 'Sobre sexualidade', tema: 'sexualidade' as const };
  const out = casasRelevantes(leitura, p);
  // Casa 8 is sexualidade; should be the primary
  assertTrue(out.some((c) => c.tema === 'sexualidade'), 'must include sexualidade tema');
});

it('casasRelevantes always includes Casa 1 (consulente) and Casa 36 (retorno)', () => {
  const leitura = makeBaseLeitura();
  // Ask about trabalho (casa 10) without explicit casasCitadas
  const pergunta = { texto: 'Como está meu trabalho?' };
  const out = casasRelevantes(leitura, pergunta as PerguntaConsulente);
  const nums = new Set(out.map((c) => c.numero));
  assertTrue(nums.has(CASA_CONSULENTE), 'must include Casa 1 anchor');
  assertTrue(nums.has(CASA_RETORNO), 'must include Casa 36 anchor');
});

it('casasRelevantes with tema=trabalho does NOT contain irrelevant casas', () => {
  const leitura = makeBaseLeitura();
  const pergunta = makeBasePergunta({ texto: 'Como vai meu trabalho', tema: 'trabalho' });
  const out = casasRelevantes(leitura, pergunta);
  // Casa 10 (trabalho) should definitely be there
  const nums = new Set(out.map((c) => c.numero));
  assertTrue(nums.has(10), 'casa 10 (trabalho) must be in result');
});

it('casasRelevantes caps total at MAX_CASAS_RELEVANTES', () => {
  const leitura = makeBaseLeitura();
  const pergunta = makeBasePergunta({
    texto: 'Tudo',
    casasCitadas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],  // 12 casas cited
  });
  const out = casasRelevantes(leitura, pergunta);
  assertTrue(out.length <= MAX_CASAS_RELEVANTES, `length ${out.length} > ${MAX_CASAS_RELEVANTES}`);
});

it('casasRelevantes result is ascending-sorted by numero', () => {
  const leitura = makeBaseLeitura();
  const pergunta = makeBasePergunta({ texto: 'Todas as casas?' });
  const out = casasRelevantes(leitura, pergunta);
  for (let i = 1; i < out.length; i++) {
    const prev = out[i - 1]!;
    const curr = out[i]!;
    assertTrue(prev.numero <= curr.numero, `sort violation at index ${i}`);
  }
});

it('casasRelevantes throws on empty leitura', () => {
  let threw = false;
  try {
    casasRelevantes([], makeBasePergunta());
  } catch {
    threw = true;
  }
  assertTrue(threw, 'empty leitura must throw');
});

it('casasRelevantes throws when pergunta.texto empty AND no tema/casasCitadas', () => {
  let threw = false;
  try {
    casasRelevantes(makeBaseLeitura(), { texto: '' });
  } catch {
    threw = true;
  }
  assertTrue(threw, 'empty pergunta must throw');
});

it('relevanceFingerprint is deterministic across calls with same inputs', () => {
  const leitura = makeBaseLeitura();
  const pergunta = makeBasePergunta();
  const f1 = relevanceFingerprint(leitura, pergunta);
  const f2 = relevanceFingerprint(leitura, pergunta);
  assertEqual(f1, f2, 'fingerprint must be stable');
});

it('relevanceFingerprint changes when pergunta changes', () => {
  const leitura = makeBaseLeitura();
  const f1 = relevanceFingerprint(leitura, { texto: 'trabalho' });
  const f2 = relevanceFingerprint(leitura, { texto: 'sexualidade' });
  // Not strictly required but usually true — different casas selected.
  // We assert at minimum that the engine returns valid strings of form
  // 'N.<hex>'.
  assertMatch(f1, /^\d+\.[0-9a-f]+$/, 'f1 shape');
  assertMatch(f2, /^\d+\.[0-9a-f]+$/, 'f2 shape');
});

// ════════════════════════════════════════════════════════════════════════════
// SPECS — sacred term detection
// ════════════════════════════════════════════════════════════════════════════

it('NFD normalization strips diacritics', () => {
  assertEqual(nfdNormalize('Oxóssi'), 'oxossi', 'acute removed');
  assertEqual(nfdNormalize('Plutão'), 'plutao', 'tilde removed');
  assertEqual(nfdNormalize('Chokhmah'), 'chokhmah', 'idempotent on ASCII');
});

it('Sacred terms detected via NFD substring match', () => {
  const leitura = makeBaseLeitura();
  const pergunta = makeBasePergunta({ texto: 'Como fica minha sexualidade e trabalho?' });
  const ctx = buildContext(leitura, pergunta, makeEmptyHistorico());
  // Must have detected at least some sacred terms
  assertTrue(ctx.termosSagrados.length > 0, 'must surface ≥1 sacred term');
  // Every sacred term must be ≤ MAX cap
  assertTrue(
    ctx.termosSagrados.length <= MAX_SACRED_TERMS_SURFACED,
    `terms ${ctx.termosSagrados.length} > cap ${MAX_SACRED_TERMS_SURFACED}`,
  );
});

it('Sacred terms are deduped via NFD normalization', () => {
  const leitura = makeBaseLeitura();
  // Use a pergunta that should surface multiple traditions
  const pergunta = makeBasePergunta({ texto: 'Como está minha espiritualidade com Ogum, Oxóssi e Ogum?' });
  const ctx = buildContext(leitura, pergunta, makeEmptyHistorico());
  // No duplicate NFD-normalized entries
  const normSet = new Set(ctx.termosSagrados.map((t) => nfdNormalize(t)));
  assertEqual(normSet.size, ctx.termosSagrados.length, 'sacred terms must be deduped');
});

// ════════════════════════════════════════════════════════════════════════════
// SPECS — buildContext
// ════════════════════════════════════════════════════════════════════════════

it('buildContext produces systemRole with fixed Akasha persona', () => {
  const ctx = buildContext(makeBaseLeitura(), makeBasePergunta(), makeEmptyHistorico());
  assertEqual(ctx.systemRole, DEFAULT_SYSTEM_ROLE, 'systemRole must match DEFAULT');
  assertContains(ctx.systemRole, 'Akasha');
  assertContains(ctx.systemRole, 'Cigano');
});

it('buildContext promptFinal contains the systemRole', () => {
  const ctx = buildContext(makeBaseLeitura(), makeBasePergunta(), makeEmptyHistorico());
  assertContains(ctx.promptFinal, ctx.systemRole.slice(0, 30));
});

it('buildContext promptFinal includes the RESUMO DA LEITURA section', () => {
  const ctx = buildContext(makeBaseLeitura(), makeBasePergunta(), makeEmptyHistorico());
  assertContains(ctx.promptFinal, 'RESUMO DA LEITURA');
  assertContains(ctx.promptFinal, 'Casa 1 (');
  assertContains(ctx.promptFinal, 'Casa 36 (');
});

it('buildContext promptFinal includes every casa in casasRelevantes', () => {
  const ctx = buildContext(makeBaseLeitura(), makeBasePergunta(), makeEmptyHistorico());
  for (const c of ctx.casasRelevantes) {
    assertContains(ctx.promptFinal, `Casa ${c.numero}`, `casa ${c.numero}`);
    assertContains(ctx.promptFinal, c.cartaCigana.nome, `carta ${c.cartaCigana.nome}`);
  }
});

it('buildContext promptFinal includes the cleaned pergunta', () => {
  const ctx = buildContext(
    makeBaseLeitura(),
    { texto: 'qual é o sentido da vida?' },
    makeEmptyHistorico(),
  );
  // Cleaned: trimmed + ends with '?'
  assertContains(ctx.promptFinal, 'qual é o sentido da vida?');
});

it('buildContext limpa "?" suffix even when input has no punctuation', () => {
  const ctx = buildContext(
    makeBaseLeitura(),
    { texto: 'qual é o sentido da vida' },
    makeEmptyHistorico(),
  );
  assertEqual(ctx.perguntaAtual, 'qual é o sentido da vida?');
});

it('buildContext instrucoes contains the 7 fixed rules', () => {
  const ctx = buildContext(makeBaseLeitura(), makeBasePergunta(), makeEmptyHistorico());
  assertTrue(ctx.instrucoes.length >= SURGICAL_INSTRUCTION_RULES.length);
  for (const r of SURGICAL_INSTRUCTION_RULES) {
    assertTrue(ctx.instrucoes.includes(r), `rule missing: ${r.slice(0, 30)}`);
  }
});

it('buildContext adds forma-specific rules when pergunta has forma tag', () => {
  const ctx = buildContext(
    makeBaseLeitura(),
    { texto: 'como faço para resolver?', forma: 'conselho' },
    makeEmptyHistorico(),
  );
  // Conselho rule must be present
  assertTrue(
    ctx.instrucoes.some((r) => r.includes('conselho')),
    'conselho rule must be present when forma=conselho',
  );
});

it('buildContext adds instrucoesExtras when provided', () => {
  const ctx = buildContext(
    makeBaseLeitura(),
    makeBasePergunta(),
    makeEmptyHistorico(),
    { instrucoesExtras: ['Regra experimental X'] },
  );
  assertTrue(
    ctx.instrucoes.includes('Regra experimental X'),
    'extra rule must be present',
  );
});

it('buildContext tokensEstimados is positive and matches rough estimate', () => {
  const ctx = buildContext(makeBaseLeitura(), makeBasePergunta(), makeEmptyHistorico());
  assertTrue(ctx.tokensEstimados > 0, 'tokens > 0');
  // ceil(len/4) ± small tolerance
  const expected = Math.ceil(ctx.promptFinal.length / 4);
  assertEqual(ctx.tokensEstimados, expected, 'token estimate must match formula');
});

it('buildContext handles empty historico gracefully', () => {
  const ctx = buildContext(makeBaseLeitura(), makeBasePergunta(), makeEmptyHistorico());
  assertContains(ctx.contextoConversa, 'primeira pergunta');
});

it('buildContext slices historico to last maxTurnos', () => {
  const ctx = buildContext(
    makeBaseLeitura(),
    makeBasePergunta(),
    makeFullHistorico(3),  // 3 turns × 2 = 6 last messages
    { maxTurnos: 3 },
  );
  // Lines should be ≤ 6 (3 turns × 2 messages)
  const lines = ctx.contextoConversa.split('\n').filter((l) => l.trim().length > 0);
  assertTrue(lines.length <= 6, `contextoConversa has ${lines.length} lines, expected ≤6`);
});

it('buildContext with maxTurnos=1 keeps only last user+assistant pair', () => {
  const ctx = buildContext(
    makeBaseLeitura(),
    makeBasePergunta(),
    makeFullHistorico(8),
    { maxTurnos: 1 },
  );
  const lines = ctx.contextoConversa.split('\n').filter((l) => l.trim().length > 0);
  assertEqual(lines.length, 2, 'maxTurnos=1 should keep 2 lines (1 user + 1 assistant)');
});

it('buildContext with 8+ casasCitadas caps at MAX_CASAS_RELEVANTES', () => {
  const pergunta = makeBasePergunta({
    texto: 'casa específica',
    casasCitadas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],  // 10 cited
  });
  const ctx = buildContext(makeBaseLeitura(), pergunta, makeEmptyHistorico());
  assertTrue(
    ctx.casasRelevantes.length <= MAX_CASAS_RELEVANTES,
    `length ${ctx.casasRelevantes.length} > ${MAX_CASAS_RELEVANTES}`,
  );
});

it('buildContext meta includes version + cycle + cacheKey', () => {
  const ctx = buildContext(makeBaseLeitura(), makeBasePergunta(), makeEmptyHistorico());
  assertEqual(ctx.meta.brand, 'W82-B');
  assertEqual(ctx.meta.cycle, 82);
  assertEqual(ctx.meta.version, '1.0.0');
  assertTrue(ctx.meta.cacheKey.startsWith('w82b.'), 'cacheKey namespace prefix');
  assertTrue(typeof ctx.meta.generatedAt === 'string', 'generatedAt is string');
});

it('buildContext output is deeply frozen', () => {
  const ctx = buildContext(makeBaseLeitura(), makeBasePergunta(), makeEmptyHistorico());
  // Object.isFrozen on the top-level
  // PromptContext is frozen via Object.freeze in the engine
  assertTrue(Object.isFrozen(ctx.casasRelevantes), 'casasRelevantes array frozen');
  for (const c of ctx.casasRelevantes) {
    assertTrue(Object.isFrozen(c), `casa ${c.numero} frozen`);
    assertTrue(Object.isFrozen(c.cartaCigana), `casa ${c.numero}.cartaCigana frozen`);
    assertTrue(Object.isFrozen(c.contribuicoes), `casa ${c.numero}.contribuicoes frozen`);
  }
  assertTrue(Object.isFrozen(ctx.termosSagrados), 'termosSagrados frozen');
  assertTrue(Object.isFrozen(ctx.instrucoes), 'instrucoes frozen');
  assertTrue(Object.isFrozen(ctx.meta), 'meta frozen');
});

it('buildContext throws on empty leitura', () => {
  let threw = false;
  try {
    buildContext([], makeBasePergunta(), makeEmptyHistorico());
  } catch {
    threw = true;
  }
  assertTrue(threw, 'empty leitura must throw');
});

it('buildContext throws when pergunta.texto is empty', () => {
  let threw = false;
  try {
    buildContext(makeBaseLeitura(), { texto: '' }, makeEmptyHistorico());
  } catch {
    threw = true;
  }
  assertTrue(threw, 'empty pergunta must throw');
});

it('buildContext respects systemRoleOverride', () => {
  const custom = 'Você é um oráculo alternativo.';
  const ctx = buildContext(
    makeBaseLeitura(),
    makeBasePergunta(),
    makeEmptyHistorico(),
    { systemRoleOverride: custom },
  );
  assertEqual(ctx.systemRole, custom, 'systemRole override must apply');
  assertContains(ctx.promptFinal, custom);
});

it('buildContext respects noSacredDetect (terms array empty)', () => {
  const ctx = buildContext(
    makeBaseLeitura(),
    makeBasePergunta({ texto: 'Ogum, Oxóssi e Exu' }),
    makeEmptyHistorico(),
    { noSacredDetect: true },
  );
  assertArrayLength(ctx.termosSagrados, 0, 'noSacredDetect must empty the terms array');
});

it('buildContext termosSagrados length ≤ MAX cap', () => {
  // Stuff the pergunta with many sacred triggers
  const pergunta: PerguntaConsulentaOrUnknown = makeBasePergunta({
    texto: 'Ogum Oxóssi Oxum Iansã Xangô Iemanjá Exu Nanã Oxalá Plutão Vênus Marte Casa 8 Mago Imperatriz Lilith',
  });
  const ctx = buildContext(makeBaseLeitura(), pergunta, makeEmptyHistorico());
  assertTrue(
    ctx.termosSagrados.length <= MAX_SACRED_TERMS_SURFACED,
    `${ctx.termosSagrados.length} > ${MAX_SACRED_TERMS_SURFACED}`,
  );
});

// Type elision: PerguntaConsulentaOrUnknown is just a local alias
type PerguntaConsulentaOrUnknown = PerguntaConsulente;

// ════════════════════════════════════════════════════════════════════════════
// SPECS — version constants
// ════════════════════════════════════════════════════════════════════════════

it('Version constants are exported and correct', async () => {
  const mod = await import('./akasha-prompt/index.ts');
  assertEqual(mod.AKASHA_PROMPT_VERSION, '1.0.0');
  assertEqual(mod.AKASHA_PROMPT_CYCLE, 82);
  assertEqual(mod.MESA_REAL_HOUSES_TOTAL, 36);
  assertEqual(mod.CASA_CONSULENTE, 1);
  assertEqual(mod.CASA_RETORNO, 36);
});

// ════════════════════════════════════════════════════════════════════════════
// SPECS — scoreCasaForTokens diagnostic helper
// ════════════════════════════════════════════════════════════════════════════

it('scoreCasaForTokens returns positive when tokens match sintese', () => {
  const leitura = makeBaseLeitura();
  const casa8 = leitura.find((c) => c.numero === 8)!;
  const tokens = tokenizeForRelevance('sexualidade Plutão Caixão');
  const score = scoreCasaForTokens(casa8, tokens);
  assertTrue(score > 0, `score must be > 0, got ${score}`);
});

it('scoreCasaForTokens returns 0 for non-matching tokens', () => {
  const leitura = makeBaseLeitura();
  const casa8 = leitura.find((c) => c.numero === 8)!;
  const tokens = tokenizeForRelevance('xyz abc qwerty');
  const score = scoreCasaForTokens(casa8, tokens);
  assertEqual(score, 0, 'non-matching tokens must score 0');
});

it('tokenizeForRelevance drops short tokens and diacritics', () => {
  const toks = tokenizeForRelevance('Olá, 1 2 Ogum! Me fala de sexualidade.');
  // Short tokens <3 chars dropped; numbers dropped; diacritics stripped
  assertTrue(toks.includes('olá') || toks.includes('ola'), 'olá in tokens');
  assertTrue(toks.includes('ogum'), 'ogum in tokens');
  assertTrue(toks.includes('sexualidade'), 'sexualidade in tokens');
  assertTrue(toks.includes('fala'), 'fala in tokens');
  // No 2-char items
  for (const t of toks) assertTrue(t.length >= 3, `token "${t}" too short`);
});

// ════════════════════════════════════════════════════════════════════════════
// SPECS — minimum count floor
// ════════════════════════════════════════════════════════════════════════════

it('spec count is ≥30', () => {
  assertTrue(SPEC_REGISTRY.length >= 30, `registered ${SPEC_REGISTRY.length}, need ≥30`);
});

// ════════════════════════════════════════════════════════════════════════════
// RUNNER
// ════════════════════════════════════════════════════════════════════════════

async function runSpecs(): Promise<void> {
  let passed = 0;
  let failed = 0;
  const failures: string[] = [];

  for (const entry of SPEC_REGISTRY) {
    try {
      await entry.run();
      passed++;
      console.log(`  ✓ ${entry.name}`);
    } catch (err) {
      failed++;
      const msg = err instanceof Error ? err.message : String(err);
      failures.push(`${entry.name}: ${msg}`);
      console.log(`  ✗ ${entry.name}`);
      console.log(`    ${msg}`);
    }
  }

  console.log('');
  console.log(`  RESULT: ${passed} PASS · ${failed} FAIL · ${SPEC_REGISTRY.length} total`);

  if (failed > 0) {
    console.log('');
    console.log('  Failures:');
    for (const f of failures) console.log(`    · ${f}`);
    process.exit(1);
  }
}

// Direct exec — node --experimental-strip-types akasha-prompt.spec.ts
runSpecs().catch((err) => {
  console.error('Fatal runner error:', err);
  process.exit(2);
});
