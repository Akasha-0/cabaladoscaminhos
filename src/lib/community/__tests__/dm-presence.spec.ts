// ============================================================================
// DM PRESENCE SPEC — Assertions para updatePresence/subscribe/staleness
// ============================================================================

import {
  updatePresence,
  getUserPresence,
  getBulkPresence,
  subscribePresence,
  goOnline,
  goAway,
  goDnd,
  goOffline,
  pruneStalePresence,
  hasSubscribers,
  subscriberCount,
  InvalidStatusError,
  PRESENCE_STATUSES,
  __resetPresenceStoreForTests,
} from '../dm-presence.ts';
import { __resetAllStoresForTests, toUserId, type UserId } from '../dm-shared.ts';

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

function assertThrows(fn: () => unknown, ctor: new (...a: any[]) => Error, label: string): void {
  try {
    fn();
    _failed += 1;
    _failures.push(`${label} :: expected throw ${ctor.name}`);
  } catch (err) {
    if (err instanceof ctor) _passed += 1;
    else { _failed += 1; _failures.push(`${label} :: got ${(err as Error).constructor.name}`); }
  }
}

function freshUser(idx = 1): UserId {
  __resetPresenceStoreForTests();
  __resetAllStoresForTests();
  return toUserId(`presence_user_${idx}`);
}

// ============================================================================
// TEST SUITES
// ============================================================================

function testUpdatePresence(): void {
  __resetAllStoresForTests();
  const u1 = freshUser(1);

  // status inválido
  assertThrows(
    () => updatePresence(u1, 'unknown' as any),
    InvalidStatusError,
    'status inválido'
  );

  // online
  const r1 = updatePresence(u1, 'online');
  assertEqual(r1.status, 'online', 'online preservado');
  assertEqual(r1.userId, u1, 'userId preservado');

  // away
  const r2 = updatePresence(u1, 'away');
  assertEqual(r2.status, 'away', 'away substitui online');

  // dnd
  updatePresence(u1, 'dnd');
  assertEqual(getUserPresence(u1).status, 'dnd', 'dnd ativo');

  // offline
  goOffline(u1);
  assertEqual(getUserPresence(u1).status, 'offline', 'offline');

  // goOnline
  goOnline(u1);
  assertEqual(getUserPresence(u1).status, 'online', 'goOnline');
  goAway(u1);
  assertEqual(getUserPresence(u1).status, 'away', 'goAway');
  goDnd(u1);
  assertEqual(getUserPresence(u1).status, 'dnd', 'goDnd');

  // PRESENCE_STATUSES enum
  assertEqual(PRESENCE_STATUSES.length, 4, '4 status');
  assert(PRESENCE_STATUSES.includes('online'), 'online no enum');
  assert(PRESENCE_STATUSES.includes('away'), 'away no enum');
  assert(PRESENCE_STATUSES.includes('offline'), 'offline no enum');
  assert(PRESENCE_STATUSES.includes('dnd'), 'dnd no enum');
}

function testGetUserPresence(): void {
  __resetAllStoresForTests();
  const u1 = freshUser(1);

  // sem presença
  const v = getUserPresence(u1);
  assertEqual(v.status, 'offline', 'sem presença = offline');
  assertEqual(v.expired, true, 'sem presença = expired');

  // com presença
  updatePresence(u1, 'online');
  const v2 = getUserPresence(u1);
  assertEqual(v2.status, 'online', 'preservado');
  assertEqual(v2.expired, false, 'não expired');
  assertEqual(v2.away, false, 'away = false');

  // presença com status away
  goAway(u1);
  assertEqual(getUserPresence(u1).away, true, 'away = true para status away');
}

function testGetBulkPresence(): void {
  __resetAllStoresForTests();
  const u1 = freshUser(1);
  const u2 = freshUser(2);
  const u3 = freshUser(3);
  goOnline(u1);
  goAway(u2);
  // u3 sem presença

  const arr = getBulkPresence([u1, u2, u3]);
  assertEqual(arr.length, 3, '3 entradas');
  assertEqual(arr[0].status, 'online', 'u1 online');
  assertEqual(arr[1].status, 'away', 'u2 away');
  assertEqual(arr[2].status, 'offline', 'u3 offline');

  // bulk vazio
  assertEqual(getBulkPresence([]).length, 0, 'bulk vazio');
}

function testSubscribePresence(): void {
  __resetAllStoresForTests();
  const u1 = freshUser(1);

  // sem subscritores
  assertEqual(hasSubscribers(u1), false, 'sem subs');
  assertEqual(subscriberCount(u1), 0, 'count = 0');

  let received: string | null = null;
  const unsub = subscribePresence(u1, (rec) => { received = rec.status; });
  assertEqual(hasSubscribers(u1), true, 'com subs');
  assertEqual(subscriberCount(u1), 1, 'count = 1');

  // updatePresence dispara
  updatePresence(u1, 'online');
  assertEqual(received, 'online', 'callback recebeu online');

  updatePresence(u1, 'dnd');
  assertEqual(received, 'dnd', 'callback recebeu dnd');

  // cancelar subscrição
  unsub();
  assertEqual(hasSubscribers(u1), false, 'sem subs após unsub');

  received = null;
  updatePresence(u1, 'away');
  assertEqual(received, null, 'callback não recebe após unsub');

  // subscribePresence emite estado atual
  updatePresence(u1, 'online');
  let immediate: string | null = null;
  subscribePresence(u1, (rec) => { immediate = rec.status; });
  assertEqual(immediate, 'online', 'callback imediato');
}

function testSubscribeMultipleCallbacks(): void {
  __resetAllStoresForTests();
  const u1 = freshUser(1);

  const seen: string[] = [];
  const u1sub = subscribePresence(u1, (rec) => seen.push(`A:${rec.status}`));
  const u2sub = subscribePresence(u1, (rec) => seen.push(`B:${rec.status}`));

  updatePresence(u1, 'online');
  assertEqual(seen.length, 2, '2 callbacks chamados');
  assert(seen.includes('A:online'), 'A recebeu');
  assert(seen.includes('B:online'), 'B recebeu');

  // cancelar um
  u1sub();
  updatePresence(u1, 'dnd');
  assertEqual(seen.length, 3, 'só B foi chamado de novo (1 notificação, +1)');
  assertEqual(seen.filter((s) => s.startsWith('A:')).length, 1, 'A não mais chamado');
  assertEqual(seen.filter((s) => s.startsWith('B:')).length, 2, 'B chamado 2x');

  u2sub();
}

function testPruneStale(): void {
  __resetAllStoresForTests();
  const u1 = freshUser(1);
  const u2 = freshUser(2);

  updatePresence(u1, 'online');
  updatePresence(u2, 'away');

  // sem expiração (criados agora): nada deve ser podado
  const r1 = pruneStalePresence();
  assertEqual(r1.count, 0, 'nenhum stale recém-criado');

  // simular expiração manipulando expiresAt via rec
  // (sem API pública, forçamos via updatePresence em outro usuário e checamos
  //  que ambos permanecem; o staleness real é TTL=6min e testamos via lógica)
  assertEqual(getUserPresence(u1).status, 'online', 'u1 ainda online');
  assertEqual(getUserPresence(u2).status, 'away', 'u2 ainda away');
}

// ============================================================================
// RUNNER
// ============================================================================

export function runDmPresenceTests(): { passed: number; failed: number; total: number } {
  _passed = 0;
  _failed = 0;
  _failures.length = 0;
  testUpdatePresence();
  testGetUserPresence();
  testGetBulkPresence();
  testSubscribePresence();
  testSubscribeMultipleCallbacks();
  testPruneStale();
  return { passed: _passed, failed: _failed, total: _passed + _failed };
}

export function getDmPresenceFailures(): string[] {
  return _failures.slice();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const r = runDmPresenceTests();
  console.log(`dm-presence.spec: ${r.passed}/${r.total} PASS`);
  if (r.failed > 0) {
    for (const f of getDmPresenceFailures()) console.log(' -', f);
    process.exit(1);
  }
}
