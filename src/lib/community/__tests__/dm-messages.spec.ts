// ============================================================================
// DM MESSAGES SPEC — Assertions para read receipts/unread/search/status
// ============================================================================

import {
  markAsRead,
  markAsDelivered,
  markAllAsRead,
  getUnreadCount,
  getTotalUnreadCount,
  getMessage,
  getConversationMessages,
  searchMessages,
  getMessageStatus,
  MessageNotFoundError,
  InvalidQueryError,
} from '../dm-messages.ts';
import {
  sendDirectMessage,
  getConversation,
  ConversationNotFoundError,
  NotParticipantError,
} from '../dm-engine.ts';
import { createConversation } from '../dm-conversations.ts';
import {
  __resetAllStoresForTests,
  toUserId,
  type UserId,
  type ConversationId,
  type MessageId,
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

function fresh(): { u1: UserId; u2: UserId; conv: ConversationId } {
  __resetAllStoresForTests();
  const u1 = toUserId('u1');
  const u2 = toUserId('u2');
  const conv = createConversation([u1, u2]).id;
  // enviar uma mensagem inicial para ter algo
  sendDirectMessage(conv, u1, 'Olá!');
  return { u1, u2, conv };
}

// ============================================================================
// TEST SUITES
// ============================================================================

function testMarkAsRead(): void {
  const { u1, u2, conv } = fresh();
  const msg = sendDirectMessage(conv, u1, 'segunda');
  // destinatário lê
  const updated = markAsRead(msg.id, u2);
  assert(updated.readBy.includes(u2), 'u2 adicionado a readBy');
  assert(updated.readBy.includes(u1), 'u1 ainda em readBy');

  // duplicado: idempotente
  markAsRead(msg.id, u2);
  assertEqual(updated.readBy.length, 2, 'readBy não duplica u2');

  // inexistente
  assertThrows(
    () => markAsRead('msg_nope' as MessageId, u2),
    MessageNotFoundError,
    'msg inexistente'
  );

  // intruso
  assertThrows(
    () => markAsRead(msg.id, toUserId('intruso')),
    NotParticipantError,
    'intruso não pode marcar'
  );

  // conversa inexistente (unread zerado na verificação)
  void conv;
  const u3 = toUserId('u3');
  // criar conversa só com u3+nope, mandar msg via u3 (u3 é participante)
  // mas cenário real: tentar ler algo em conversa que não existe
  // na verdade: a mensagem existe mas a check de isParticipant falha antes do lookup completo
}

function testMarkAsDelivered(): void {
  const { u1, u2, conv } = fresh();
  const msg = sendDirectMessage(conv, u1, 'ping');
  // deliveredTo já contém u2 após sendDirectMessage
  assert(msg.deliveredTo.includes(u2), 'u2 entregue após send');

  // re-adicionar é idempotente
  const updated = markAsDelivered(msg.id, u2);
  assertEqual(updated.deliveredTo.filter((u) => u === u2).length, 1, 'u2 não duplica');

  // não-participante
  assertThrows(
    () => markAsDelivered(msg.id, toUserId('intruso')),
    NotParticipantError,
    'entregar a intruso falha'
  );
}

function testMarkAllAsRead(): void {
  const { u1, u2, conv } = fresh();
  // fresh() já enviou 'Olá!' de u1; somar mais 2 de u1 + 1 de u2
  sendDirectMessage(conv, u1, 'm1');
  sendDirectMessage(conv, u1, 'm2');
  sendDirectMessage(conv, u2, 'm3');

  const r = markAllAsRead(conv, u2);
  // u2 marcou 3: Olá!, m1, m2 (todos de u1). m3 é de u2 mesmo, então já estava em readBy.
  assertEqual(r.marked.length, 3, 'u2 marcou 3 (3 msgs de u1, incluindo inicial)');
  assertEqual(r.unreadAfter, 0, 'unread zerado');
  // unreadBefore > 0 (campo agregador da conversa, pode divergir do recount por user)
  assert(r.unreadBefore > 0, 'unreadBefore > 0');

  // conversa inexistente
  assertThrows(
    () => markAllAsRead('nope' as ConversationId, u2),
    ConversationNotFoundError,
    'markAll em conv inexistente'
  );
}

function testUnreadCount(): void {
  __resetAllStoresForTests();
  const u1 = toUserId('u1');
  const u2 = toUserId('u2');
  const u3 = toUserId('u3');
  const conv1 = createConversation([u1, u2]).id;
  const conv2 = createConversation([u1, u3]).id;

  sendDirectMessage(conv1, u1, 'a'); // unread de u2 += 1
  sendDirectMessage(conv1, u1, 'b'); // unread de u2 += 1
  sendDirectMessage(conv2, u1, 'c'); // unread de u3 += 1

  assertEqual(getUnreadCount(conv1, u2), 2, 'unread u2 em conv1 = 2');
  assertEqual(getUnreadCount(conv2, u2), 0, 'u2 não participa de conv2');
  assertEqual(getUnreadCount(conv2, u3), 1, 'unread u3 em conv2 = 1');

  // total
  const total = getTotalUnreadCount(u2);
  assertEqual(total.total, 2, 'total unread u2 = 2');
  assertEqual(total.byConversation.length, 1, 'u2 tem unread em 1 conversa');

  const totalU3 = getTotalUnreadCount(u3);
  assertEqual(totalU3.total, 1, 'total unread u3 = 1');
}

function testGetMessage(): void {
  const { u1, conv } = fresh();
  const msg = sendDirectMessage(conv, u1, 'hello');
  const fetched = getMessage(msg.id);
  assertEqual(fetched.id, msg.id, 'id bate');
  assertEqual(fetched.content, 'hello', 'content bate');

  assertThrows(() => getMessage('msg_nope' as MessageId), MessageNotFoundError, 'msg inexistente');
}

function testConversationMessagesPagination(): void {
  const { u1, conv } = fresh();
  for (let i = 0; i < 5; i++) sendDirectMessage(conv, u1, `msg ${i}`);
  const page = getConversationMessages(conv, { limit: 3, ascending: true });
  assertEqual(page.messages.length, 3, 'página asc = 3');
  assertEqual(page.total, 6, 'total = 6 (1 inicial + 5)');
  assert(page.nextCursor !== null, 'nextCursor presente');

  const page2 = getConversationMessages(conv, { limit: 3, ascending: false });
  assertEqual(page2.messages.length, 3, 'desc = 3 mais recentes');
  // desc sem cursor: últimos 3 elementos da lista asc = indices [3,4,5] = [msg 2, msg 3, msg 4]
  assertEqual(page2.messages[0].content, 'msg 2', 'desc[0] = msg 2 (mais antigo da página desc)');
  assertEqual(page2.messages[2].content, 'msg 4', 'desc[2] = msg 4 (mais recente da página desc)');
}

function testSearchMessages(): void {
  const { u1, u2, conv } = fresh();
  sendDirectMessage(conv, u1, 'cigano e tarot na Mesa Real');
  sendDirectMessage(conv, u2, 'me conta sobre isso');

  const hits = searchMessages(u1, 'Mesa');
  assertEqual(hits.length, 1, 'encontra "Mesa"');
  assertEqual(hits[0].senderId, u1, 'autor = u1');

  const hits2 = searchMessages(u2, 'Mesa');
  assertEqual(hits2.length, 1, 'u2 também vê nas conversas');

  // filtrar por conv
  const hits3 = searchMessages(u1, 'Mesa', { conversationId: conv });
  assertEqual(hits3.length, 1, 'filtro conv funciona');

  // query vazia
  assertThrows(() => searchMessages(u1, ''), InvalidQueryError, 'query vazia');

  // fromDate
  const cutoff = new Date(Date.now() + 1000);
  const hits4 = searchMessages(u1, 'Mesa', { fromDate: cutoff });
  assertEqual(hits4.length, 0, 'fromDate futuro filtra tudo');

  // limite
  const hits5 = searchMessages(u1, 'a', { limit: 1 });
  assert(hits5.length <= 1, 'limite respeitado');
}

function testGetMessageStatus(): void {
  const { u1, u2, conv } = fresh();
  // sendDirectMessage → deliveredTo já populado
  const msg = sendDirectMessage(conv, u1, 'oi');
  // viewer = sender: status vem dos outros (delivered: u2 recebeu mas não leu)
  assertEqual(getMessageStatus(msg.id, u1), 'delivered', 'sender vê delivered (u2 recebeu mas não leu)');
  // viewer = receiver: delivered (sender enviou, deliveredTo preenchido)
  assertEqual(getMessageStatus(msg.id, u2), 'delivered', 'receiver vê delivered inicialmente');
  // agora marcar como lido pelo receiver
  markAsRead(msg.id, u2);
  // viewer = sender agora vê 'read' (u2 leu)
  assertEqual(getMessageStatus(msg.id, u1), 'read', 'sender vê read após leitura do receiver');
  // viewer = receiver também
  assertEqual(getMessageStatus(msg.id, u2), 'read', 'receiver vê read após marcar');

  // message inexistente
  assertThrows(
    () => getMessageStatus('msg_nope' as MessageId, u1),
    MessageNotFoundError,
    'status em msg inexistente'
  );
}

function testIntegrationSendAndUnread(): void {
  __resetAllStoresForTests();
  const u1 = toUserId('u1');
  const u2 = toUserId('u2');
  const conv = createConversation([u1, u2]).id;
  const m1 = sendDirectMessage(conv, u1, 'oi beta');
  const m2 = sendDirectMessage(conv, u1, 'tudo bem?');
  // m3 enviado por u1 (não u2) para que markAllAsRead de u2 marque como lida
  const m3 = sendDirectMessage(conv, u1, 'mais uma');

  // u2 tem 3 unread (m1, m2, m3) — todos de u1
  assertEqual(getUnreadCount(conv, u2), 3, 'u2 tem 3 unread');
  // u1 tem 0 unread (não recebeu nada)
  assertEqual(getUnreadCount(conv, u1), 0, 'u1 tem 0 unread');

  // u2 lê m1
  markAsRead(m1.id, u2);
  assertEqual(getUnreadCount(conv, u2), 2, 'u2 → 2 unread');

  // u2 marca todas como lidas
  markAllAsRead(conv, u2);
  assertEqual(getUnreadCount(conv, u2), 0, 'u2 → 0 unread');

  // status de m3 do POV de u1 (sender): u2 leu → 'read'
  assertEqual(getMessageStatus(m3.id, u1), 'read', 'm3 do POV do sender = read (u2 leu no markAll)');

  // u1 recebe uma mensagem de u2 e verifica delivered
  const m4 = sendDirectMessage(conv, u2, 'oi de volta');
  assertEqual(getMessageStatus(m4.id, u1), 'delivered', 'm4 do POV u1 = delivered');
  markAsRead(m4.id, u1);
  assertEqual(getMessageStatus(m4.id, u1), 'read', 'm4 do POV u1 = read após markAsRead');

  // re-fetch via getConversation (já marca como lida para u1)
  const c = getConversation(conv, u1);
  assertEqual(c.unreadCount, 0, 'unread do u1 zerado');

  void m2;
}

// ============================================================================
// RUNNER
// ============================================================================

export function runDmMessagesTests(): { passed: number; failed: number; total: number } {
  _passed = 0;
  _failed = 0;
  _failures.length = 0;
  testMarkAsRead();
  testMarkAsDelivered();
  testMarkAllAsRead();
  testUnreadCount();
  testGetMessage();
  testConversationMessagesPagination();
  testSearchMessages();
  testGetMessageStatus();
  testIntegrationSendAndUnread();
  return { passed: _passed, failed: _failed, total: _passed + _failed };
}

export function getDmMessagesFailures(): string[] {
  return _failures.slice();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const r = runDmMessagesTests();
  console.log(`dm-messages.spec: ${r.passed}/${r.total} PASS`);
  if (r.failed > 0) {
    for (const f of getDmMessagesFailures()) console.log(' -', f);
    process.exit(1);
  }
}
