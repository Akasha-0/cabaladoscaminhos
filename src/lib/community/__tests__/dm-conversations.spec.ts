// ============================================================================
// DM CONVERSATIONS SPEC — Assertions para create/findOr/participants
// ============================================================================

import {
  createConversation,
  findOrCreateConversation,
  getConversationParticipants,
  addParticipant,
  removeParticipant,
  leaveConversation,
  isParticipant,
  countParticipants,
  listUserConversations,
  EmptyParticipantsError,
  DuplicateParticipantsError,
  TooManyParticipantsError,
  CannotAddToDirectError,
  AlreadyParticipantError,
  NotAParticipantError,
  CannotRemoveLastError,
  TitleTooLongError,
} from '../dm-conversations.ts';
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

function fresh(): {
  u1: UserId;
  u2: UserId;
  u3: UserId;
  u4: UserId;
  conv: ConversationId;
  direct: ConversationId;
} {
  __resetAllStoresForTests();
  const u1 = toUserId('u1');
  const u2 = toUserId('u2');
  const u3 = toUserId('u3');
  const u4 = toUserId('u4');
  const conv = createConversation([u1, u2, u3], { isGroup: true });
  const direct = createConversation([u1, u2]);
  return { u1, u2, u3, u4, conv: conv.id, direct: direct.id };
}

// ============================================================================
// TEST SUITES
// ============================================================================

function testCreateConversation(): void {
  __resetAllStoresForTests();

  // 1-on-1 default
  const direct = createConversation([toUserId('a'), toUserId('b')]);
  assertEqual(direct.type, 'direct', '2 participantes = direct');
  assertEqual(direct.title, null, 'sem title');

  // 3+ = group
  const group = createConversation([toUserId('a'), toUserId('b'), toUserId('c')], { isGroup: true });
  assertEqual(group.type, 'group', '3+ = group');
  assert(group.title !== null && group.title.startsWith('Grupo'), 'título default');

  // group com title custom
  const titled = createConversation([toUserId('a'), toUserId('b'), toUserId('c')], {
    isGroup: true,
    title: 'Círculo de Estudos',
  });
  assertEqual(titled.title, 'Círculo de Estudos', 'título custom');

  // erro: lista vazia
  assertThrows(() => createConversation([]), EmptyParticipantsError, 'lista vazia');

  // erro: duplicados
  assertThrows(
    () => createConversation([toUserId('a'), toUserId('a')]),
    DuplicateParticipantsError,
    'duplicados'
  );

  // erro: direct com 3 participantes
  assertThrows(
    () => createConversation([toUserId('a'), toUserId('b'), toUserId('c')], { isGroup: false }),
    TooManyParticipantsError,
    'direct > 2'
  );

  // erro: título longo
  assertThrows(
    () =>
      createConversation([toUserId('a'), toUserId('b'), toUserId('c')], {
        isGroup: true,
        title: 'a'.repeat(81),
      }),
    TitleTooLongError,
    'título longo'
  );
}

function testFindOrCreateIdempotent(): void {
  __resetAllStoresForTests();
  const a = toUserId('a');
  const b = toUserId('b');
  const c1 = findOrCreateConversation([a, b]);
  const c2 = findOrCreateConversation([b, a]); // ordem diferente
  const c3 = findOrCreateConversation([a, b]); // repetido
  assertEqual(c1.id, c2.id, 'idempotente invertendo ordem');
  assertEqual(c1.id, c3.id, 'idempotente repetindo');
  assertEqual(c1.type, 'direct', '1-on-1 = direct');

  // 3 pessoas vira group
  const c4 = findOrCreateConversation([a, b, toUserId('c')]);
  assertEqual(c4.type, 'group', '3 pessoas = group');
}

function testGetConversationParticipants(): void {
  const { u1, u2, u3, conv } = fresh();
  const info = getConversationParticipants(conv);
  assertEqual(info.type, 'group', 'tipo = group');
  assertEqual(info.participants.length, 3, '3 participantes');
  assert(info.participants.includes(u1), 'u1 incluso');
  assert(info.participants.includes(u2), 'u2 incluso');
  assert(info.participants.includes(u3), 'u3 incluso');
  assertEqual(info.title, 'Grupo (3)', 'titulo default');

  // direct
  const { u1: ua, u2: ub, direct } = fresh();
  void ua; void ub;
  const info2 = getConversationParticipants(direct);
  assertEqual(info2.type, 'direct', 'tipo = direct');
  assertEqual(info2.participants.length, 2, 'direct = 2 participantes');
}

function testAddParticipant(): void {
  const { u1, u4, conv, direct, u1: u1b } = fresh();

  // erro: tentar adicionar a conversa direta
  assertThrows(
    () => addParticipant(direct, u4, u1),
    CannotAddToDirectError,
    'add em direct'
  );

  // sucesso (adicionar u4 ao grupo)
  const after = addParticipant(conv, u4, u1);
  assert(after.participantIds.includes(u4), 'u4 adicionado');
  assertEqual(after.participantIds.length, 4, '4 participantes');

  // título auto-renomeado
  assert(after.title !== null && after.title.includes('4'), 'title renomeado para (4)');

  // erro: add duplicado (u4 já é participante)
  assertThrows(
    () => addParticipant(conv, u4, u1),
    AlreadyParticipantError,
    'add duplicado'
  );

  // erro: addedBy não-participante
  assertThrows(
    () => addParticipant(conv, toUserId('intruso'), toUserId('intruso')),
    Error,
    'add por intruso'
  );

  void u1b;
}

function testRemoveParticipant(): void {
  const { u1, u2, u3, u4, conv, direct } = fresh();
  // adicionar u4 para ter 4
  addParticipant(conv, u4, u1);
  // remover u4
  const r = removeParticipant(conv, u4, u1);
  assert(!r.conversation.participantIds.includes(u4), 'u4 removido');
  assertEqual(r.conversation.participantIds.length, 3, 'volta para 3');
  assert(!r.emptied, 'não esvaziada');

  // remover não-grupo (direct) -> erro
  assertThrows(
    () => removeParticipant(direct, u1, u1),
    CannotRemoveLastError,
    'remover em direct'
  );

  // remover sem ser participante (alvo)
  assertThrows(
    () => removeParticipant(conv, toUserId('intruso'), u1),
    NotAParticipantError,
    'remover não-participante alvo'
  );

  // remover se quem está removendo não faz parte
  assertThrows(
    () => removeParticipant(conv, u3, toUserId('intruso')),
    Error,
    'remover por intruso'
  );

  // grupo esvaziado
  const only = createConversation([u1, u2], { isGroup: true });
  addParticipant(only.id, u3, u1); // 3
  const r3 = removeParticipant(only.id, u3, u1); // 2
  assert(!r3.emptied, 'grupo continua com 2');
  const r4 = removeParticipant(only.id, u2, u1); // 1
  assert(!r4.emptied, 'grupo continua com 1');
  const r5 = removeParticipant(only.id, u1, u1); // 0 → esvaziada
  assert(r5.emptied, 'grupo esvaziada');

  void u2; void u3;
}

function testLeaveConversation(): void {
  const { u1, conv } = fresh();
  // leave em grupo (u1 é participante)
  const result = leaveConversation(conv, u1);
  assert(result !== null && !result.participantIds.includes(u1),
    'leave funciona em grupo');

  // leave em direct
  const { direct, u1: ua, u2: ub } = fresh();
  void ua; void ub;
  void ub;
  const r2 = leaveConversation(direct, ua);
  assert(r2 === null, 'leave em direct remove conversa');

  // leave sem ser participante
  const { conv: c2 } = fresh();
  assertThrows(
    () => leaveConversation(c2, toUserId('intruso')),
    Error,
    'leave sem ser participante'
  );
}

function testIsParticipantAndCount(): void {
  const { u1, u2, conv } = fresh();
  assert(isParticipant(conv, u1), 'u1 é participante');
  assert(isParticipant(conv, u2), 'u2 é participante');
  assert(!isParticipant(conv, toUserId('intruso')), 'intruso não é participante');
  assertEqual(countParticipants(conv), 3, 'count = 3');

  assertEqual(countParticipants('nope' as ConversationId), 0, 'count em conversa inexistente = 0');
  assert(!isParticipant('nope' as ConversationId, u1), 'isParticipant em inexistente = false');
}

function testListUserConversations(): void {
  const { u1, u2, u3 } = fresh();
  const c2 = createConversation([u1, toUserId('extra1')], { isGroup: false });
  const c3 = createConversation([u1, toUserId('extra2')], { isGroup: false });
  const list = listUserConversations(u1);
  // u1 está em: conv (grupo), direct (com u2), c2, c3 = 4 conversas
  assertEqual(list.length, 4, 'u1 tem 4 conversas');

  // u2 está em: conv (grupo), direct (com u1) = 2 conversas
  const list2 = listUserConversations(u2);
  assertEqual(list2.length, 2, 'u2 tem 2 conversas');

  // u3 só no conv (grupo)
  const list3 = listUserConversations(u3);
  assertEqual(list3.length, 1, 'u3 tem 1 conversa (a inicial)');

  // ordering por lastMessageAt desc
  void c2; void c3;
  const sorted = listUserConversations(u1).map((c) => c.id);
  assert(sorted.length === 4, 'sorted tem 4 entries');
}

// ============================================================================
// RUNNER
// ============================================================================

export function runDmConversationsTests(): { passed: number; failed: number; total: number } {
  _passed = 0;
  _failed = 0;
  _failures.length = 0;
  testCreateConversation();
  testFindOrCreateIdempotent();
  testGetConversationParticipants();
  testAddParticipant();
  testRemoveParticipant();
  testLeaveConversation();
  testIsParticipantAndCount();
  testListUserConversations();
  return { passed: _passed, failed: _failed, total: _passed + _failed };
}

export function getDmConversationsFailures(): string[] {
  return _failures.slice();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const r = runDmConversationsTests();
  console.log(`dm-conversations.spec: ${r.passed}/${r.total} PASS`);
  if (r.failed > 0) {
    for (const f of getDmConversationsFailures()) console.log(' -', f);
    process.exit(1);
  }
}
