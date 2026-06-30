/**
 * ════════════════════════════════════════════════════════════════════════════
 * W82-B — AKASHA PROMPT CONTEXT BUILDER · SMOKE HARNESS
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Inline runtime smoke checks. ≥15 assertions covering: relevance ranking,
 * sacred term normalization, prompt assembly, edge cases (empty historico,
 * max-turnos boundary, 8+ casasCitadas cap).
 *
 * Run with: `node --experimental-strip-types akasha-prompt.smoke.ts`
 */

// @ts-ignore — node-stubs.d.ts provides globals.
declare const process: { exit(code: number): never };

import {
  buildContext,
  casasRelevantes,
  nfdNormalize,
  relevanceFingerprint,
  MAX_CASAS_RELEVANTES,
  MAX_SACRED_TERMS_SURFACED,
  DEFAULT_MAX_TURNOS,
  CASA_CONSULENTE,
  CASA_RETORNO,
  type CasaNumber,
  type CruzamentoCasa,
  type HistoricoChat,
  type LeituraSintetizada,
  type PerguntaConsulente,
} from './akasha-prompt/index.ts';

// ════════════════════════════════════════════════════════════════════════════
// Smoke harness
// ════════════════════════════════════════════════════════════════════════════

interface SmokeEntry {
  name: string;
  ok: boolean;
  msg: string;
}
const RESULTS: SmokeEntry[] = [];

function smoke(label: string, cond: boolean, extra?: string): void {
  RESULTS.push({
    name: label,
    ok: cond,
    msg: cond ? '' : (extra ?? 'condition false'),
  });
}

// ════════════════════════════════════════════════════════════════════════════
// Fixtures (minimal — spec has the full set)
// ════════════════════════════════════════════════════════════════════════════

function mkCasa(n: number, tema: string, carta: string, sintese: string, rotulos: string[] = []): CruzamentoCasa {
  const cn = n as CasaNumber;
  const contribuicoes = rotulos.map((r) => ({
    tradicao: 'astrologia',
    rotulo: r,
    texto: `${r} ativo nesta casa.`,
  }));
  return Object.freeze({
    numero: cn,
    tema: tema as CruzamentoCasa['tema'],
    cartaCigana: Object.freeze({
      id: ((n - 1) % 36) + 1,
      nome: carta,
      superficie: `read for ${carta} casa ${n}`,
    }),
    contribuicoes: Object.freeze(contribuicoes) as ReadonlyArray<typeof contribuicoes[number]>,
    sintese,
  });
}

function mkLeitura(): LeituraSintetizada {
  const houses: CruzamentoCasa[] = [];
  for (let i = 1; i <= 36; i++) {
    const temas: CruzamentoCasa['tema'][] = ['identidade','financas','comunicacao','familia','criatividade','saude','relacionamentos','sexualidade','viagens','trabalho','amizades','espiritualidade'];
    const cartas = ['Cavaleiro','Trevo','Nave','Casa','Árvore','Nuvens','Cobra','Caixão','Buquê','Foice','Chicote','Pássaros','Criança','Cachorro','Raposa','Urso','Estrela','Cegonha','Lua','Chave','Peixes','Carta','Ramo','Sapo','Coração','Anel','Livro','Cigano','Cigana','Lírios','Sol','Torre','Estrela','Cruz','Barco','Retorno'];
    const rotulos: Record<number, string[]> = {
      8: ['Casa 8 — Escorpião', 'Plutão', 'Lilith'],
      10: ['Casa 10 — Capricórnio', 'Meio do Céu'],
      12: ['Casa 12 — Peixes', 'Chokhmah', 'Mago'],
      22: ['LifePath 22', 'Kether'],
      28: ['Ogum', 'Odu Ogundá'],
      29: ['Oxum', 'Odu Ejiogbe'],
      33: ['Number Master 33'],
      36: ['Malkuth', 'Odu Alafia'],
    };
    houses.push(mkCasa(i, temas[(i - 1) % temas.length]!, cartas[(i - 1) % cartas.length]!, `Síntese ${i}: ${cartas[(i - 1) % cartas.length]} marca a casa ${i}.`, rotulos[i] ?? []));
  }
  return Object.freeze(houses) as LeituraSintetizada;
}

function mkHistorico(n: number): HistoricoChat {
  const mensagens: Array<{ role: 'user' | 'assistant'; texto: string; ts: number }> = [];
  for (let i = 0; i < n; i++) {
    mensagens.push({
      role: i % 2 === 0 ? 'user' : 'assistant',
      texto: `linha ${i + 1}`,
      ts: 1_700_000_000_000 + i * 1000,
    });
  }
  return { mensagens, maxTurnos: DEFAULT_MAX_TURNOS };
}

// ════════════════════════════════════════════════════════════════════════════
// SMOKES — relevance
// ════════════════════════════════════════════════════════════════════════════

const LEITURA = mkLeitura();
const PERGUNTA: PerguntaConsulente = { texto: 'Como está minha sexualidade?' };

{
  const out = casasRelevantes(LEITURA, PERGUNTA);
  smoke('casasRelevantes returns ≥1 casa', out.length >= 1, `len=${out.length}`);
  smoke(
    'casasRelevantes always anchors Casa 1',
    out.some((c) => c.numero === CASA_CONSULENTE),
    'casa 1 missing',
  );
  smoke(
    'casasRelevantes always anchors Casa 36',
    out.some((c) => c.numero === CASA_RETORNO),
    'casa 36 missing',
  );
  smoke(
    'casasRelevantes respects MAX cap',
    out.length <= MAX_CASAS_RELEVANTES,
    `len=${out.length} > ${MAX_CASAS_RELEVANTES}`,
  );
}

{
  const f1 = relevanceFingerprint(LEITURA, PERGUNTA);
  const f2 = relevanceFingerprint(LEITURA, PERGUNTA);
  smoke('fingerprint is deterministic', f1 === f2, `${f1} vs ${f2}`);
  smoke(
    'fingerprint shape: digits.hex',
    /^\d+\.[0-9a-f]+$/.test(f1),
    `bad shape: ${f1}`,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SMOKES — NFD normalization
// ════════════════════════════════════════════════════════════════════════════

smoke('NFD on Oxóssi', nfdNormalize('Oxóssi') === 'oxossi', 'expected oxossi');
smoke('NFD on Plutão', nfdNormalize('Plutão') === 'plutao', 'expected plutao');
smoke('NFD idempotent on ASCII', nfdNormalize('Ogum') === 'ogum', 'expected ogum');

// ════════════════════════════════════════════════════════════════════════════
// SMOKES — buildContext
// ════════════════════════════════════════════════════════════════════════════

{
  const ctx = buildContext(LEITURA, PERGUNTA, mkHistorico(0));
  smoke('promptFinal non-empty', ctx.promptFinal.length > 100, `len=${ctx.promptFinal.length}`);
  smoke(
    'promptFinal mentions Akasha',
    ctx.promptFinal.includes('Akasha'),
    'Akasha missing from prompt',
  );
  smoke(
    'promptFinal mentions system role',
    ctx.promptFinal.includes('Cigano'),
    'Cigano key term missing',
  );
  smoke(
    'promptFinal contains RESUMO DA LEITURA',
    ctx.promptFinal.includes('RESUMO DA LEITURA'),
    'section missing',
  );
  smoke(
    'promptFinal contains CASAS RELEVANTES PARA A PERGUNTA',
    ctx.promptFinal.includes('CASAS RELEVANTES PARA A PERGUNTA'),
    'section missing',
  );
  smoke(
    'promptFinal contains PERGUNTA ATUAL',
    ctx.promptFinal.includes('PERGUNTA ATUAL'),
    'section missing',
  );
  smoke(
    'promptFinal contains REGRAS',
    ctx.promptFinal.includes('REGRAS'),
    'section missing',
  );
  smoke(
    'tokensEstimados positive',
    ctx.tokensEstimados > 0,
    `tokens=${ctx.tokensEstimados}`,
  );
  smoke(
    'tokensEstimados matches ceil(len/4)',
    ctx.tokensEstimados === Math.ceil(ctx.promptFinal.length / 4),
    `${ctx.tokensEstimados} vs ${Math.ceil(ctx.promptFinal.length / 4)}`,
  );
  smoke('meta.brand = W82-B', ctx.meta.brand === 'W82-B', ctx.meta.brand);
  smoke('cacheKey starts with w82b.', ctx.meta.cacheKey.startsWith('w82b.'), ctx.meta.cacheKey);
}

{
  const ctx = buildContext(LEITURA, PERGUNTA, mkHistorico(0), { noSacredDetect: true });
  smoke(
    'noSacredDetect empties termosSagrados',
    ctx.termosSagrados.length === 0,
    `len=${ctx.termosSagrados.length}`,
  );
}

{
  const ctx = buildContext(LEITURA, { texto: 'Ogum e Oxóssi', forma: 'conselho' }, mkHistorico(0));
  smoke(
    'forma=conselho rule added',
    ctx.instrucoes.some((r) => r.toLowerCase().includes('conselho')),
    'conselho rule missing',
  );
  smoke(
    'termosSagrados detected (Ogum, Oxóssi) when present',
    ctx.termosSagrados.some((t) => /Og[úu]m/i.test(t)),
    'Ogum not surfaced',
  );
  smoke(
    'termosSagrados respects MAX cap',
    ctx.termosSagrados.length <= MAX_SACRED_TERMS_SURFACED,
    `len=${ctx.termosSagrados.length}`,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SMOKES — edge cases
// ════════════════════════════════════════════════════════════════════════════

{
  // 8+ casasCitadas → capped
  const ctx = buildContext(
    LEITURA,
    { texto: 'tudo', casasCitadas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    mkHistorico(0),
  );
  smoke(
    '8+ casasCitadas cap honored',
    ctx.casasRelevantes.length <= MAX_CASAS_RELEVANTES,
    `len=${ctx.casasRelevantes.length}`,
  );
}

{
  // max-turnos=1 with full historico
  const hist = mkHistorico(20);
  const ctx = buildContext(LEITURA, PERGUNTA, hist, { maxTurnos: 1 });
  const lines = ctx.contextoConversa.split('\n').filter((l) => l.trim().length > 0);
  smoke(
    'maxTurnos=1 keeps 2 lines',
    lines.length === 2,
    `len=${lines.length}`,
  );
}

{
  // Empty historico placeholder message
  const ctx = buildContext(LEITURA, PERGUNTA, mkHistorico(0));
  smoke(
    'empty historico placeholder present',
    ctx.contextoConversa.includes('primeira pergunta'),
    'placeholder missing',
  );
}

{
  // Determinism: same input → same fingerprint
  const ctx1 = buildContext(LEITURA, PERGUNTA, mkHistorico(4));
  const ctx2 = buildContext(LEITURA, PERGUNTA, mkHistorico(4));
  smoke(
    'buildContext cacheKey stable across runs',
    ctx1.meta.cacheKey === ctx2.meta.cacheKey,
    `${ctx1.meta.cacheKey} vs ${ctx2.meta.cacheKey}`,
  );
}

{
  // Throws on empty leitura
  let threw = false;
  try { buildContext([], PERGUNTA, mkHistorico(0)); }
  catch { threw = true; }
  smoke('buildContext throws on empty leitura', threw, 'no throw');
}

{
  // Throws on empty pergunta
  let threw = false;
  try { buildContext(LEITURA, { texto: '' }, mkHistorico(0)); }
  catch { threw = true; }
  smoke('buildContext throws on empty pergunta', threw, 'no throw');
}

// ════════════════════════════════════════════════════════════════════════════
// Report
// ════════════════════════════════════════════════════════════════════════════

const passed = RESULTS.filter((r) => r.ok).length;
const failed = RESULTS.filter((r) => !r.ok).length;

console.log('');
console.log(`  SMOKE: ${passed} PASS · ${failed} FAIL · ${RESULTS.length} total`);
for (const r of RESULTS) {
  const mark = r.ok ? '✓' : '✗';
  console.log(`  ${mark} ${r.name}${r.ok ? '' : ` — ${r.msg}`}`);
}

if (failed > 0) {
  process.exit(1);
}
