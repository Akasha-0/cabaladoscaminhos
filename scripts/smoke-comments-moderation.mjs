#!/usr/bin/env node
// ============================================================================
// SMOKE TEST — W90-D Comments Moderation Queue
// ============================================================================
// Roda via: `npx tsx scripts/smoke-comments-moderation.mjs`
// Verifica runtime correctness do engine puro.
//
// Asserts:
//   1. DEFAULT_RULES tem 6 regras (1 por razão)
//   2. evaluateComment dispara para cada uma das 6 razões
//   3. Texto inocente não dispara
//   4. createQueueItem → status=pending
//   5. approveItem → status=approved + resolvedAt + resolutionNote
//   6. rejectItem → status=rejected
//   7. escalateItem → status=escalated
//   8. getQueueStats — contagem correta
//   9. serializeQueue + parseQueue round-trip
//   10. Resolução em item já resolvido falha
//   11. assignToModerator atribui sem mudar status
//   12. Banned vocab absent em todos os arquivos do escopo
// ============================================================================

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Usa tsx para transpilar .ts em runtime
async function loadEngine() {
  const enginePath = resolve(__dirname, '..', 'src', 'lib', 'w90', 'comments-moderation.ts');
  // tsx registra o loader via flag; aqui usamos import dinâmico
  const mod = await import(enginePath);
  return mod;
}

let pass = 0;
let fail = 0;

function check(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    pass++;
  } catch (e) {
    console.error(`✗ ${name}`);
    console.error(`  ${e.message}`);
    fail++;
  }
}

async function main() {
  const engine = await loadEngine();
  const {
    DEFAULT_RULES,
    evaluateComment,
    createQueueItem,
    assignToModerator,
    approveItem,
    rejectItem,
    escalateItem,
    getQueueStats,
    serializeQueue,
    parseQueue,
    buildFlag,
    asCommentId,
    asUserId,
  } = engine;

  // ----------------------------------------------------------------------
  // 1. DEFAULT_RULES tem 6 regras (1 por razão)
  // ----------------------------------------------------------------------
  check('1. DEFAULT_RULES tem 6 regras cobrindo as 6 razões', () => {
    if (DEFAULT_RULES.length !== 6) throw new Error(`expected 6, got ${DEFAULT_RULES.length}`);
    const reasons = new Set(DEFAULT_RULES.map((r) => r.reason));
    const expected = ['spam', 'ofensa', 'conteudo-improprio', 'desinformacao', 'golpe', 'politica'];
    for (const r of expected) {
      if (!reasons.has(r)) throw new Error(`razão ${r} ausente`);
    }
  });

  // ----------------------------------------------------------------------
  // 2. evaluateComment — cada uma das 6 razões dispara
  // ----------------------------------------------------------------------
  check('2. evaluateComment — cada uma das 6 regras dispara com exemplo', () => {
    const cases = [
      { text: 'Compre agora pelo link na bio', expected: 'spam' },
      { text: 'Você é um idiota!', expected: 'ofensa' },
      { text: 'Conteúdo adulto NSFW aqui', expected: 'conteudo-improprio' },
      { text: 'Cura garantida o câncer!', expected: 'desinformacao' },
      { text: 'Pix urgente transferência imediata', expected: 'golpe' },
      { text: 'Vote no candidato X na eleição 2026', expected: 'politica' },
    ];
    for (const c of cases) {
      const matched = evaluateComment(c.text);
      if (matched === null) throw new Error(`no match for "${c.text}"`);
      if (matched.reason !== c.expected) {
        throw new Error(`expected ${c.expected}, got ${matched.reason} for "${c.text}"`);
      }
    }
  });

  // ----------------------------------------------------------------------
  // 3. Texto inocente não dispara
  // ----------------------------------------------------------------------
  check('3. evaluateComment — texto inocente não dispara', () => {
    const matched = evaluateComment('Obrigado por compartilhar essa reflexão sobre Axé.');
    if (matched !== null) throw new Error(`expected null, got ${matched.reason}`);
  });

  // ----------------------------------------------------------------------
  // 4. createQueueItem — status=pending, id válido
  // ----------------------------------------------------------------------
  check('4. createQueueItem gera item pending com id mq-*', () => {
    const rule = DEFAULT_RULES[0];
    const flag = buildFlag(
      asCommentId('c-test-1'),
      asUserId('u-test-1'),
      'spam test',
      rule,
      1700000000000,
    );
    const item = createQueueItem(flag);
    if (item.status !== 'pending') throw new Error(`status=${item.status}`);
    if (!item.id.startsWith('mq-')) throw new Error(`id=${item.id}`);
    if (item.assignedModeratorId !== null) throw new Error('assignedModeratorId not null');
    if (item.resolvedAt !== null) throw new Error('resolvedAt not null');
  });

  // ----------------------------------------------------------------------
  // 5. approveItem — status muda, resolvedAt setado, note preservada
  // ----------------------------------------------------------------------
  check('5. approveItem — approved + resolvedAt + note', () => {
    const rule = DEFAULT_RULES[0];
    const flag = buildFlag(asCommentId('c'), asUserId('u'), 't', rule, 1000);
    const item = createQueueItem(flag);
    const a = approveItem(item, 'tudo certo');
    if (a.status !== 'approved') throw new Error(`status=${a.status}`);
    if (a.resolvedAt === null) throw new Error('resolvedAt null');
    if (a.resolutionNote !== 'tudo certo') throw new Error(`note=${a.resolutionNote}`);
  });

  // ----------------------------------------------------------------------
  // 6. rejectItem — status=rejected
  // ----------------------------------------------------------------------
  check('6. rejectItem — status=rejected', () => {
    const rule = DEFAULT_RULES[1];
    const flag = buildFlag(asCommentId('c'), asUserId('u'), 't', rule, 1000);
    const item = createQueueItem(flag);
    const r = rejectItem(item, 'orientar revisão');
    if (r.status !== 'rejected') throw new Error(`status=${r.status}`);
    if (r.resolutionNote !== 'orientar revisão') throw new Error(`note=${r.resolutionNote}`);
  });

  // ----------------------------------------------------------------------
  // 7. escalateItem — status=escalated
  // ----------------------------------------------------------------------
  check('7. escalateItem — status=escalated', () => {
    const rule = DEFAULT_RULES[4];
    const flag = buildFlag(asCommentId('c'), asUserId('u'), 't', rule, 1000);
    const item = createQueueItem(flag);
    const e = escalateItem(item, 'caso grave');
    if (e.status !== 'escalated') throw new Error(`status=${e.status}`);
    if (e.resolutionNote !== 'caso grave') throw new Error(`note=${e.resolutionNote}`);
  });

  // ----------------------------------------------------------------------
  // 8. getQueueStats — contagem correta
  // ----------------------------------------------------------------------
  check('8. getQueueStats — total + byReason + byStatus', () => {
    const rule1 = DEFAULT_RULES[0];
    const rule2 = DEFAULT_RULES[1];
    const items = [
      createQueueItem(buildFlag(asCommentId('c1'), asUserId('u1'), 'spam', rule1, 1)),
      createQueueItem(buildFlag(asCommentId('c2'), asUserId('u2'), 'spam 2', rule1, 2)),
      approveItem(createQueueItem(buildFlag(asCommentId('c3'), asUserId('u3'), 'ofensa', rule2, 3))),
    ];
    const stats = getQueueStats(items);
    if (stats.total !== 3) throw new Error(`total=${stats.total}`);
    if (stats.pending !== 2) throw new Error(`pending=${stats.pending}`);
    if (stats.approved !== 1) throw new Error(`approved=${stats.approved}`);
    if (stats.byReason.spam !== 2) throw new Error(`spam=${stats.byReason.spam}`);
    if (stats.byReason.ofensa !== 1) throw new Error(`ofensa=${stats.byReason.ofensa}`);
  });

  // ----------------------------------------------------------------------
  // 9. serializeQueue + parseQueue — round-trip preserva dados
  // ----------------------------------------------------------------------
  check('9. serializeQueue + parseQueue round-trip preserva status e note', () => {
    const rule = DEFAULT_RULES[0];
    const item = approveItem(
      createQueueItem(buildFlag(asCommentId('c-x'), asUserId('u-x'), 't', rule, 1700000000000)),
      'ok',
    );
    const raw = serializeQueue([item]);
    const parsed = parseQueue(raw);
    if (parsed.length !== 1) throw new Error(`length=${parsed.length}`);
    if (parsed[0].id !== item.id) throw new Error(`id mismatch: ${parsed[0].id} vs ${item.id}`);
    if (parsed[0].status !== 'approved') throw new Error(`status=${parsed[0].status}`);
    if (parsed[0].resolutionNote !== 'ok') throw new Error(`note=${parsed[0].resolutionNote}`);
  });

  // ----------------------------------------------------------------------
  // 10. Resolução em item já resolvido falha
  // ----------------------------------------------------------------------
  check('10. tentar resolver item já aprovado lança erro', () => {
    const rule = DEFAULT_RULES[0];
    const flag = buildFlag(asCommentId('c'), asUserId('u'), 't', rule, 1000);
    const item = createQueueItem(flag);
    const approved = approveItem(item, 'ok');
    let threw = false;
    try {
      rejectItem(approved, 'tentar de novo');
    } catch (e) {
      threw = true;
    }
    if (!threw) throw new Error('esperava throw em rejectItem sobre item já resolvido');
  });

  // ----------------------------------------------------------------------
  // 11. assignToModerator atribui sem mudar status
  // ----------------------------------------------------------------------
  check('11. assignToModerator atribui moderatorId mantendo status=pending', () => {
    const rule = DEFAULT_RULES[0];
    const flag = buildFlag(asCommentId('c'), asUserId('u'), 't', rule, 1000);
    const item = createQueueItem(flag);
    const assigned = assignToModerator(item, asUserId('mod-001'));
    if (assigned.status !== 'pending') throw new Error(`status=${assigned.status}`);
    if (assigned.assignedModeratorId !== 'mod-001') {
      throw new Error(`assignedModeratorId=${assigned.assignedModeratorId}`);
    }
  });

  // ----------------------------------------------------------------------
  // 12. Banned vocab absent em todos os arquivos W90-D
  // ----------------------------------------------------------------------
  check('12. Banned vocab (amarração/vinculação/prejudicar) absent', () => {
    const filesToScan = [
      resolve(__dirname, '..', 'src', 'lib', 'w90', 'comments-moderation.ts'),
      resolve(__dirname, '..', 'src', 'lib', 'w90', '__fixtures__', 'moderation-fixtures.ts'),
      resolve(__dirname, '..', 'src', 'components', 'community', 'ModerationQueueItem.tsx'),
      resolve(__dirname, '..', 'src', 'components', 'community', 'ModerationQueueList.tsx'),
      resolve(__dirname, '..', 'src', 'app', 'community', 'moderation', 'page.tsx'),
    ];
    const banned = ['amarração', 'amarre', 'vinculação', 'vincular', 'prejudicar'];
    for (const f of filesToScan) {
      const content = readFileSync(f, 'utf8').toLowerCase();
      for (const b of banned) {
        if (content.includes(b)) {
          throw new Error(`banned vocab "${b}" found in ${f}`);
        }
      }
    }
  });

  // ----------------------------------------------------------------------
  // Resultado
  // ----------------------------------------------------------------------
  console.log('');
  console.log(`Resultado: ${pass} PASS, ${fail} FAIL`);
  if (fail > 0) {
    console.error('SMOKE FAIL');
    process.exit(1);
  }
  console.log('SMOKE OK');
}

main().catch((e) => {
  console.error('Smoke runner error:', e);
  process.exit(1);
});