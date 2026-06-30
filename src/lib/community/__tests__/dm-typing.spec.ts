// ============================================================================
// DM TYPING SPEC — Assertions para setTyping/clear/TTL/prune
// ============================================================================

import {
  setTyping,
  clearTyping,
  getTypingUsers,
  isTyping,
  getAllTyping,
  pruneTyping,
  subscribeTyping,
  typingSubscriberCount,
  TYPING_TTL_MS,
  __resetTypingStoreForTests,
} from '../dm-typing.ts';
import {
  __resetAllStoresForTests,
  toUserId,
  type UserId,
  type ConversationId,
} from '../dm-shared.ts';

// ============================================================================
// HARNESS
// ============================================================================

let _passed = 0;
let _failed = 0;
const _failures: string[] = [];

function assert(cond: unknown, label: string): void {
  if (cond) _passed += 1;
  else { _failed += 1; _failures.push(label); }
}

function assertEqual<T>(actual: T, expected: T, label: string): void {
  if (JSON.stringify(actual) === JSON.stringify(expected)) _passed += 1;
  else { _failed += 1; _failures.push(`${label} :: exp ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`); }
}

function fresh(): { u1: UserId; u2: UserId; conv: ConversationId } {
  __resetTypingStoreForTests();
  __resetAllStoresForTests();
  return {
    u1: toUserId('user_t1'),
    u2: toUserId('user_t2'),
    conv: 'conv_t1' as ConversationId,
  };
}

// ============================================================================
// TEST SUITES
// ============================================================================

function testSetAndClear(): void {
  const { u1, conv } = fresh();
  // set
  const rec = setTyping(conv, u1);
  assertEqual(rec.conversationId, conv, 'conv preservado');
  assertEqual(rec.userId, u1, 'u1 preservado');
  assert(rec.startedAt.getTime() > 0, 'startedAt > 0');
  assert(rec.expiresAt.getTime() > rec.startedAt.getTime(), 'expiresAt > startedAt');

  // isTyping
  assert(isTyping(conv, u1), 'u1 está digitando');
  assert(!isTyping(conv, toUserId('outro')), 'outro não está digitando');

  // TTL constante
  assertEqual(TYPING_TTL_MS, 5000, 'TTL = 5s');

  // clear
  const removed = clearTyping(conv, u1);
  assertEqual(removed, true, 'clear retornou true');
  assert(!isTyping(conv, u1), 'u1 não está mais digitando');

  // clear duplo = false
  assertEqual(clearTyping(conv, u1), false, 'clear duplo = false');
}

function testMultipleTypers(): void {
  const { u1, u2, conv } = fresh();
  // 2 usuários digitam na mesma conversa
  setTyping(conv, u1);
  setTyping(conv, u2);
  setTyping(conv, toUserId('u3'));

  const typers = getTypingUsers(conv);
  assertEqual(typers.length, 3, '3 digitando');

  // outro conv vazio
  const typers2 = getTypingUsers('outro_conv' as ConversationId);
  assertEqual(typers2.length, 0, 'outro conv = 0');

  // clear um
  clearTyping(conv, u1);
  const typers3 = getTypingUsers(conv);
  assertEqual(typers3.length, 2, '2 digitando após clear');
  assert(!typers3.some((t) => t.userId === u1), 'u1 não está');
}

function testRenew(): void {
  const { u1, conv } = fresh();
  const r1 = setTyping(conv, u1);
  // esperar 1ms e renovar
  const t0 = r1.expiresAt.getTime();
  // espera
  const wait = 10;
  const start = Date.now();
  while (Date.now() - start < wait) { /* busy */ }
  const r2 = setTyping(conv, u1);
  assert(r2.expiresAt.getTime() > t0, 'renovação estende expiresAt');
  assert(isTyping(conv, u1), 'u1 ainda digitando');
}

function testPruneTyping(): void {
  const { u1, conv } = fresh();
  setTyping(conv, u1);
  assert(isTyping(conv, u1), 'digitando');

  // sem expiração natural
  const r1 = pruneTyping();
  assertEqual(r1.pruned, 0, 'nenhum podado (TTL não expirou)');
  assert(isTyping(conv, u1), 'u1 ainda digitando');

  // TTL = 5s, então para testar expiração simulamos
  // (não temos API para manipular expiresAt; mas podemos verificar que
  // pruneTyping não altera indicadores recentes)
  const allTyping = getAllTyping();
  assert(allTyping.length >= 1, 'allTyping contém u1');
}

function testSubscribeTyping(): void {
  const { u1, u2, conv } = fresh();
  // sem subscribers
  assertEqual(typingSubscriberCount(conv), 0, 'sem subs');

  const events: string[] = [];
  const unsub = subscribeTyping(conv, (rec) => {
    events.push(`${(rec as any)._kind ?? 'set'}:${rec.userId}`);
  });

  // estado atual (vazio) emitido
  assert(events.length === 0, 'sem eventos iniciais');

  setTyping(conv, u1);
  assert(events.length >= 1, 'evento após set');
  assert(events[0].includes('user_t1'), 'evento inclui u1 (user_t1)');

  setTyping(conv, u2);
  assert(events.length >= 2, 'evento após set u2');

  clearTyping(conv, u1);
  // evento "clear" também disparado
  const clearEvents = events.filter((e) => e.startsWith('clear'));
  assert(clearEvents.length >= 1, 'evento clear disparado');

  unsub();
  // sem novos eventos
  const beforeCount = events.length;
  setTyping(conv, toUserId('u3'));
  assertEqual(events.length, beforeCount, 'sem eventos após unsub');
}

function testMultiConvIsolation(): void {
  const { u1, conv } = fresh();
  const conv2 = 'conv_other' as ConversationId;
  setTyping(conv, u1);

  // conv2 vazio
  const tConv2 = getTypingUsers(conv2);
  assertEqual(tConv2.length, 0, 'conv2 vazio');
  const tConv1 = getTypingUsers(conv);
  assertEqual(tConv1.length, 1, 'conv1 tem u1');
}

// ============================================================================
// RUNNER
// ============================================================================

export function runDmTypingTests(): { passed: number; failed: number; total: number } {
  _passed = 0;
  _failed = 0;
  _failures.length = 0;
  testSetAndClear();
  testMultipleTypers();
  testRenew();
  testPruneTyping();
  testSubscribeTyping();
  testMultiConvIsolation();
  return { passed: _passed, failed: _failed, total: _passed + _failed };
}

export function getDmTypingFailures(): string[] {
  return _failures.slice();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const r = runDmTypingTests();
  console.log(`dm-typing.spec: ${r.passed}/${r.total} PASS`);
  if (r.failed > 0) {
    for (const f of getDmTypingFailures()) console.log(' -', f);
    process.exit(1);
  }
}
