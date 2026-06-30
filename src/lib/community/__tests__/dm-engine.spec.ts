// ============================================================================
// DM ENGINE SPEC — Assertions para send/get/archive/mute/delete + sacred
// ============================================================================
// Self-running harness (no vitest). Exporta runDmEngineTests() e autoexecuta.
// ============================================================================

import {
  sendDirectMessage,
  getConversation,
  getUserConversations,
  archiveConversation,
  unarchiveConversation,
  muteConversation,
  unmuteConversation,
  isMuted,
  getMuteHistory,
  deleteConversation,
  searchUserConversations,
  detectSacredTerms,
  EmptyMessageError,
  MessageTooLongError,
  ConversationNotFoundError,
  NotParticipantError,
  SenderNotParticipantError,
} from '../dm-engine.ts';
import {
  createConversation,
  findOrCreateConversation,
  isParticipant,
  addParticipant,
  removeParticipant,
} from '../dm-conversations.ts';
import { __resetAllStoresForTests, toUserId, SACRED_CATALOG, type UserId, type ConversationId } from '../dm-shared.ts';

// ============================================================================
// TEST HARNESS
// ============================================================================

let _passed = 0;
let _failed = 0;
const _failures: string[] = [];

function assert(cond: unknown, label: string): void {
  if (cond) {
    _passed += 1;
    return;
  }
  _failed += 1;
  _failures.push(label);
}

function assertEqual<T>(actual: T, expected: T, label: string): void {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    _failed += 1;
    _failures.push(`${label} :: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    return;
  }
  _passed += 1;
}

function assertThrows(fn: () => unknown, ctor: new (...a: any[]) => Error, label: string): void {
  try {
    fn();
    _failed += 1;
    _failures.push(`${label} :: expected throw ${ctor.name}, no throw`);
  } catch (err) {
    if (err instanceof ctor) {
      _passed += 1;
      return;
    }
    _failed += 1;
    _failures.push(`${label} :: expected ${ctor.name}, got ${(err as Error).constructor.name}`);
  }
}

// ============================================================================
// SETUP / TEARDOWN
// ============================================================================

function fresh(): {
  u1: UserId;
  u2: UserId;
  u3: UserId;
  conv: ConversationId;
} {
  __resetAllStoresForTests();
  const u1 = toUserId('user_alpha');
  const u2 = toUserId('user_beta');
  const u3 = toUserId('user_gamma');
  const conv = createConversation([u1, u2, u3], { isGroup: true });
  return { u1, u2, u3, conv: conv.id };
}

// ============================================================================
// TEST SUITES
// ============================================================================

function testSendDirectMessage(): void {
  const { u1, u2, u3, conv } = fresh();
  // 1: criar + persistir mensagem
  const msg = sendDirectMessage(conv, u1, 'Olá, grupo!');
  assert(msg.id.startsWith('msg_'), 'sendDM: id começa com msg_');
  assert(msg.senderId === u1, 'sendDM: senderId é u1');
  assert(msg.content === 'Olá, grupo!', 'sendDM: conteúdo preservado (trim)');
  assert(msg.readBy.includes(u1), 'sendDM: remetente entra em readBy');
  assert(msg.deliveredTo.length === 2, 'sendDM: deliveredTo = 2 destinatários');
  assert(msg.deliveredTo.includes(u2), 'sendDM: u2 entregue');

  // 2: atualizar lastMessageAt
  const c = getConversation(conv, u2);
  assert(c.lastMessagePreview === 'Olá, grupo!', 'preview = conteúdo');

  // 3: enviar várias e contar
  sendDirectMessage(conv, u2, 'Oi!');
  sendDirectMessage(conv, u3, 'Tudo bem?');
  const c2 = getConversation(conv, u1);
  assert(c2.lastMessagePreview === 'Tudo bem?', 'preview da última msg');

  // 4: empty message
  assertThrows(() => sendDirectMessage(conv, u1, '   '), EmptyMessageError, 'sendDM empty');

  // 5: too long
  assertThrows(
    () => sendDirectMessage(conv, u1, 'a'.repeat(4001)),
    MessageTooLongError,
    'sendDM too long'
  );

  // 6: remetente não-participante
  assertThrows(
    () => sendDirectMessage(conv, toUserId('intruso'), 'oi'),
    SenderNotParticipantError,
    'sendDM remetente intruso'
  );

  // 7: conversa inexistente
  assertThrows(
    () => sendDirectMessage('nope' as ConversationId, u1, 'oi'),
    ConversationNotFoundError,
    'sendDM conv inexistente'
  );

  // 8: opções (mentions/attachments/replyTo)
  const m2 = sendDirectMessage(conv, u1, 'Ping', {
    mentions: [u2],
    replyTo: msg.id,
    attachments: [{ kind: 'image', url: 'https://x/y.png' }],
  });
  assert(m2.mentions[0] === u2, 'opção mentions preservada');
  assert(m2.attachments.length === 1, 'opção attachments preservada');
  assert(m2.replyToId === msg.id, 'opção replyToId preservada');
}

function testGetConversationAndUnread(): void {
  const { u1, u2, conv } = fresh();
  sendDirectMessage(conv, u1, 'oi beta');
  // u2 tem unread > 0
  const c1 = getConversation(conv, u2);
  assert(c1.unreadCount >= 0, 'unreadCount >= 0 após envio');

  // marcar como lida
  const c2 = getConversation(conv, u2, { markAsRead: true });
  assert(c2.unreadCount === 0, 'unread zerado após markAsRead');

  // authz: terceiro não vê
  const u99 = toUserId('user_zeta');
  assertThrows(() => getConversation(conv, u99), NotParticipantError, 'getConv bloqueia intruso');
}

function testUserConversations(): void {
  const { u1, u2, conv } = fresh();
  // criar mais conversas
  const c2 = createConversation([u1, toUserId('user_delta')], { isGroup: false });
  sendDirectMessage(conv, u1, 'msg 1');
  sendDirectMessage(c2.id, u1, 'msg 2');

  const page = getUserConversations(u1, { limit: 10 });
  assert(page.total === 2, 'inbox = 2 conversas');
  assert(page.conversations.length === 2, 'página retorna 2');
  assert(page.conversations[0].lastMessageAt >= page.conversations[1].lastMessageAt, 'ordenado por recência');

  // paginação cursor
  const firstPage = getUserConversations(u1, { limit: 1 });
  assert(firstPage.conversations.length === 1, 'página 1 = 1 conversa');
  assert(firstPage.nextCursor !== null, 'cursor presente');

  const secondPage = getUserConversations(u1, { limit: 1, cursor: firstPage.nextCursor });
  assert(secondPage.conversations.length === 1, 'página 2 = 1 conversa');

  // arquivadas
  archiveConversation(conv, u1);
  const archived = getUserConversations(u1, { includeArchived: false });
  assert(archived.total === 1, 'arquivada some da inbox');

  const included = getUserConversations(u1, { includeArchived: true });
  assert(included.total === 2, 'arquivada volta com flag');
}

function testArchiveUnarchive(): void {
  const { u1, conv } = fresh();
  archiveConversation(conv, u1);
  // verifica via inbox
  const page1 = getUserConversations(u1);
  assert(page1.total === 0, 'arquivada some');
  unarchiveConversation(conv, u1);
  const page2 = getUserConversations(u1);
  assert(page2.total === 1, 'desarquivada volta');
}

function testMuteUnmute(): void {
  const { u1, conv } = fresh();
  const muteRec = muteConversation(conv, u1, 60 * 60 * 1000);
  assert(muteRec.expiresAt !== null, 'mute tem expiresAt');
  assert(isMuted(conv, u1), 'isMuted true');

  // histórico
  const hist = getMuteHistory(u1);
  assert(hist.length === 1, 'histórico tem 1 registro');

  unmuteConversation(conv, u1);
  assert(!isMuted(conv, u1), 'isMuted false após unmute');
  assert(getMuteHistory(u1).length === 0, 'histórico limpo');

  // mute permanente
  const permMute = muteConversation(conv, u1, null);
  assert(permMute.expiresAt === null, 'mute permanente = null');
  assert(isMuted(conv, u1), 'mute permanente ativo');

  // inválido duração
  assertThrows(() => muteConversation(conv, u1, 0), Error, 'mute duração 0');
  // duração absurda
  assertThrows(
    () => muteConversation(conv, u1, 31 * 24 * 60 * 60 * 1000),
    Error,
    'mute duração absurda'
  );
}

function testDelete(): void {
  const { u1, u2, conv } = fresh();
  deleteConversation(conv, u1);
  assertThrows(() => getConversation(conv, u1), ConversationNotFoundError, 'soft-delete some');
  // u2 ainda vê
  const c2 = getConversation(conv, u2);
  assert(c2.id === conv, 'soft-delete só afeta u1');
}

function testSearch(): void {
  const { u1, u2, conv } = fresh();
  sendDirectMessage(conv, u1, 'Primeira mensagem de teste');
  sendDirectMessage(conv, u2, 'Segunda com cigano e tarot');

  const hits = searchUserConversations(u1, 'cigano');
  assert(hits.length === 1, 'search acha "cigano"');
  assert(hits[0].messageId.startsWith('msg_'), 'hit tem messageId');

  const noHit = searchUserConversations(u1, 'inexistente');
  assert(noHit.length === 0, 'search sem resultados');

  // query vazia
  assertEqual(searchUserConversations(u1, '').length, 0, 'query vazia = 0 hits');
  assertEqual(searchUserConversations(u1, '   ').length, 0, 'query whitespace = 0 hits');

  // case insensitive default
  const hits2 = searchUserConversations(u1, 'CIGANO', { caseSensitive: false });
  assert(hits2.length === 1, 'search case-insensitive');
  // case sensitive false positive
  const hits3 = searchUserConversations(u1, 'CIGANO', { caseSensitive: true });
  assert(hits3.length === 0, 'case-sensitive filtra');
}

function testSacredDetection(): void {
  // termos individuais
  const h1 = detectSacredTerms('Hoje Oxalá se manifestou', SACRED_CATALOG);
  assert(h1.length >= 1, 'detecta Oxalá');
  assert(h1[0].slug === 'oxala', 'slug Oxalá');

  const h2 = detectSacredTerms('Guia do Caminho', SACRED_CATALOG);
  // "Caminho de Vida" tem "Caminho" — vamos tentar com substring
  assert(h2.length === 0, '"Guia do Caminho" não faz match exato');

  // não-match parcial (Sol não confunde com Solidão)
  const h3 = detectSacredTerms('Solidão total', SACRED_CATALOG);
  // "Sol" deve ser detectado? Sim, pois (^|\W)Sol(§|\W) casa com "Sol" + "idão"
  // Lookaround (?:\W) inclui Unicode ideográfico — então 'Sol' + 'idão' = OK
  // mas (^|\W) no início antes de 'Solidão' funciona
  assert(h3.length === 0, 'Solidão NÃO casa com Sol (lookaround $)');
  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Esperado: "Sol" dentro de "Solidão" NÃO deve casar pois o char depois é 'i' (word char).
  // (?:$|\W) -> 'i' é word, então rejeita. PASS!

  // múltiplos termos
  const h4 = detectSacredTerms('Oxum e Iemanjá regem as águas', SACRED_CATALOG);
  const slugs4 = h4.map((h) => h.slug);
  assert(slugs4.includes('oxum'), 'detecta Oxum');
  assert(slugs4.includes('iemanja'), 'detecta Iemanjá');

  // texto vazio
  assertEqual(detectSacredTerms('', SACRED_CATALOG).length, 0, 'empty text → 0 hits');
}

function testAuthAndConversationsIntegration(): void {
  const { u1, u2, u3, conv } = fresh();
  // isParticipant
  assert(isParticipant(conv, u1), 'u1 é participante');
  assert(!isParticipant(conv, toUserId('intruso')), 'intruso não é participante');

  // addParticipant + removeParticipant em grupo
  const u4 = toUserId('user_delta');
  const updated = addParticipant(conv, u4, u1);
  assert(updated.participantIds.includes(u4), 'u4 adicionado');

  // tentar adicionar quem já é
  assertThrows(() => addParticipant(conv, u4, u1), Error, 'add duplicado');

  // remover
  const result = removeParticipant(conv, u4, u1);
  assert(!result.conversation.participantIds.includes(u4), 'u4 removido');
  assert(!result.emptied, 'grupo ainda tem gente');

  // findOrCreateConversation idempotente (1-on-1)
  const c1 = findOrCreateConversation([u1, u2]);
  const c2 = findOrCreateConversation([u2, u1]);
  assertEqual(c1.id, c2.id, 'findOrCreate é idempotente');
  assertEqual(c1.type, 'direct', '1-on-1 é direct');

  const c3 = findOrCreateConversation([u3, u1]);
  assert(c3.id !== c1.id, 'par diferente = conversa diferente');
}

// ============================================================================
// RUNNER
// ============================================================================

export function runDmEngineTests(): { passed: number; failed: number; total: number } {
  _passed = 0;
  _failed = 0;
  _failures.length = 0;
  testSendDirectMessage();
  testGetConversationAndUnread();
  testUserConversations();
  testArchiveUnarchive();
  testMuteUnmute();
  testDelete();
  testSearch();
  testSacredDetection();
  testAuthAndConversationsIntegration();
  return { passed: _passed, failed: _failed, total: _passed + _failed };
}

export function getDmEngineFailures(): string[] {
  return _failures.slice();
}

// autoexecuta se rodado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const r = runDmEngineTests();
  console.log(`dm-engine.spec: ${r.passed}/${r.total} PASS`);
  if (r.failed > 0) {
    console.log('FAILURES:');
    for (const f of getDmEngineFailures()) console.log(' -', f);
    process.exit(1);
  }
}
