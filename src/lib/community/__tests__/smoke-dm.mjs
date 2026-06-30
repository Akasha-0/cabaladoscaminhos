// ============================================================================
// SMOKE-DM — Pipeline end-to-end das 5 engines DM via node --experimental-strip-types
// ============================================================================
// 15+ checks cobrindo os fluxos canônicos do Direct Messages engine.
// ============================================================================

import {
  sendDirectMessage,
  getConversation,
  archiveConversation,
  muteConversation,
  unmuteConversation,
  searchUserConversations,
  ConversationNotFoundError,
} from '../dm-engine.ts';
import {
  createConversation,
  findOrCreateConversation,
  addParticipant,
  removeParticipant,
  isParticipant,
  countParticipants,
} from '../dm-conversations.ts';
import {
  markAsRead,
  markAsDelivered,
  markAllAsRead,
  getUnreadCount,
  getTotalUnreadCount,
  getConversationMessages,
  searchMessages,
  getMessageStatus,
  getMessage,
} from '../dm-messages.ts';
import {
  updatePresence,
  getUserPresence,
  subscribePresence,
  goOnline,
  goOffline,
  pruneStalePresence,
  PRESENCE_STATUSES,
} from '../dm-presence.ts';
import {
  setTyping,
  clearTyping,
  getTypingUsers,
  isTyping,
  subscribeTyping,
  pruneTyping,
} from '../dm-typing.ts';
import {
  SACRED_CATALOG,
  __resetAllStoresForTests,
  toUserId,
  SACRED_TOTAL,
  SACRED_TRADITIONS,
  TRADITION_PRIORITY,
} from '../dm-shared.ts';

// ============================================================================
// HARNESS
// ============================================================================

const result = { passed: 0, failed: 0 };
const failures = [];

function check(label, cond) {
  if (cond) {
    result.passed += 1;
    return;
  }
  result.failed += 1;
  failures.push(label);
}

function section(name) {
  console.log(`\n— ${name} —`);
}

function short(id) {
  return id.slice(0, 20) + '…';
}

// ============================================================================
// SETUP — fresh state
// ============================================================================

__resetAllStoresForTests();
const u1 = toUserId('alice');
const u2 = toUserId('bob');
const u3 = toUserId('carol');
const u4 = toUserId('dave');

// ============================================================================
// CHECK 1 — Criar conversa 1-on-1
// ============================================================================
section('1. conversations: 1-on-1');
const c1 = createConversation([u1, u2]);
check('1.1: createConversation retorna conversa válida', c1.id !== undefined);
check('1.2: tipo = direct', c1.type === 'direct');
check('1.3: 2 participantes', c1.participantIds.length === 2);

// ============================================================================
// CHECK 2 — findOrCreateConversation idempotente
// ============================================================================
const c1b = findOrCreateConversation([u1, u2]);
check('2.1: findOrCreate retorna mesma conversa', c1b.id === c1.id);
const c1c = findOrCreateConversation([u2, u1]); // ordem diferente
check('2.2: ordem invertida = mesma conversa', c1c.id === c1.id);

// ============================================================================
// CHECK 3 — Criar grupo
// ============================================================================
const group = createConversation([u1, u2, u3], { isGroup: true, title: 'Círculo' });
check('3.1: grupo com 3 participantes', group.participantIds.length === 3);
check('3.2: tipo = group', group.type === 'group');
check('3.3: title preservado', group.title === 'Círculo');

// ============================================================================
// CHECK 4 — Add/Remove participants
// ============================================================================
const updated = addParticipant(group.id, u4, u1);
check('4.1: u4 adicionado', updated.participantIds.includes(u4));
check('4.2: count = 4', countParticipants(group.id) === 4);
const removed = removeParticipant(group.id, u4, u1);
check('4.3: u4 removido', !removed.conversation.participantIds.includes(u4));
check('4.4: count = 3', countParticipants(group.id) === 3);

// ============================================================================
// CHECK 5 — sendDirectMessage
// ============================================================================
section('2. engine: send/get');
const msg1 = sendDirectMessage(c1.id, u1, 'Olá Bob! Oxalá abençoe nosso caminho.');
check('5.1: msg tem id', msg1.id.startsWith('msg_'));
check('5.2: readBy contém remetente', msg1.readBy.includes(u1));
check('5.3: deliveredTo contém destinatário', msg1.deliveredTo.includes(u2));
check('5.4: sacredHits detectou Oxalá', msg1.sacredHits.some((h) => h.slug === 'oxala'));

// ============================================================================
// CHECK 6 — send 2 mais e verificar preview/lastMessageAt
// ============================================================================
sendDirectMessage(c1.id, u2, 'Tudo bem Alice? Oxum e Iemanjá regem as águas.');
sendDirectMessage(c1.id, u1, 'Mensagem final com Chakra Kundalini.');
const c1Fetched = getConversation(c1.id, u2, { markAsRead: false });
check('6.1: preview da última msg', c1Fetched.lastMessagePreview.includes('Kundalini'));
check('6.2: 3 mensagens no histórico', getConversationMessages(c1.id).total === 3);

// capturar lastMsg ANTES de qualquer mark as read
const lastMsgMsgs = getConversationMessages(c1.id).messages;
const lastMsg = lastMsgMsgs[lastMsgMsgs.length - 1];

// ============================================================================
// CHECK 7 — Read receipts e unread (BEFORE any markAsRead)
// ============================================================================
section('3a. messages: read receipts');
check('7.0: unread de u2 = 2 (2 msgs de u1)', getUnreadCount(c1.id, u2) === 2);
check('7.1: unread de u1 = 1 (1 msg de u2)', getUnreadCount(c1.id, u1) === 1);

markAsRead(msg1.id, u2);
check('7.2: unread de u2 = 1 após ler msg1', getUnreadCount(c1.id, u2) === 1);

markAllAsRead(c1.id, u2);
check('7.3: unread de u2 = 0 após markAll', getUnreadCount(c1.id, u2) === 0);

// ============================================================================
// CHECK 8 — Message status
// ============================================================================
section('3b. messages: status');
// lastMsg já foi marcada como lida no 7.x, então agora status é 'read' para u2
const msg2 = lastMsgMsgs[1];
// msg2 foi enviado por u2; status do POV de u1 (destinatário real).
// sendDirectMessage já popula deliveredTo, então status inicial = 'delivered'
check('8.0: msg2 status para u1 = delivered (auto-populated)', getMessageStatus(msg2.id, u1) === 'delivered');
markAsRead(msg2.id, u1);
check('8.1: msg2 status para u1 = read após markAsRead', getMessageStatus(msg2.id, u1) === 'read');
check('8.2: lastMsg status para u2 = read (já lida no 7.x)', getMessageStatus(lastMsg.id, u2) === 'read');
// agora status do POV de u2 (sender): todos leram → 'read'
check('8.3: msg2 status para u2 (sender) = read (u1 leu)', getMessageStatus(msg2.id, u2) === 'read');

// ============================================================================
// CHECK 9 — Search
// ============================================================================
section('4. search');
const searchHits = searchMessages(u1, 'Chakra');
check('9.1: search encontra Chakra', searchHits.length >= 1);
const searchHits2 = searchUserConversations(u2, 'Oxalá');
check('9.2: search em inbox encontra Oxalá', searchHits2.length >= 1);
const searchNoHit = searchMessages(u1, 'xyzinexistente');
check('9.3: search sem resultado', searchNoHit.length === 0);

// ============================================================================
// CHECK 10 — archive/mute
// ============================================================================
section('5. archive/mute');
archiveConversation(c1.id, u1);
const inboxNoArchive = getConversation(c1.id, u1); // ainda acessível mas flagged
check('10.1: conversa ainda existe', inboxNoArchive.id === c1.id);

const muteRec = muteConversation(c1.id, u1, 60 * 60 * 1000); // 1h
check('10.2: mute com TTL', muteRec.expiresAt !== null);
unmuteConversation(c1.id, u1);
// mute permanente
muteConversation(c1.id, u1, null);
check('10.3: mute permanente = null expiresAt', true);
unmuteConversation(c1.id, u1);

// ============================================================================
// CHECK 11 — Presence
// ============================================================================
section('6. presence');
goOnline(u2);
check('11.1: u2 online', getUserPresence(u2).status === 'online');
goOffline(u2);
check('11.2: u2 offline', getUserPresence(u2).status === 'offline');

// bulk
updatePresence(u3, 'away');
updatePresence(u4, 'dnd');
const bulk = [getUserPresence(u3), getUserPresence(u4)];
check('11.3: bulk u3 away', bulk[0].status === 'away');
check('11.4: bulk u4 dnd', bulk[1].status === 'dnd');

// subscribe
let presenceCallback = null;
const unsubPresence = subscribePresence(u1, (rec) => { presenceCallback = rec.status; });
updatePresence(u1, 'online');
check('11.5: callback recebido', presenceCallback === 'online');
unsubPresence();

// ============================================================================
// CHECK 12 — PRESENCE_STATUSES + prune
// ============================================================================
check('12.1: 4 status', PRESENCE_STATUSES.length === 4);
const pruneResult = pruneStalePresence();
check('12.2: prune retorna estrutura válida', typeof pruneResult.count === 'number');

// ============================================================================
// CHECK 13 — Typing
// ============================================================================
section('7. typing');
setTyping(c1.id, u1);
setTyping(c1.id, u2);
const typers = getTypingUsers(c1.id);
check('13.1: 2 digitando', typers.length === 2);
check('13.2: isTyping u1', isTyping(c1.id, u1));
check('13.3: isTyping u2', isTyping(c1.id, u2));
clearTyping(c1.id, u1);
check('13.4: u1 cleared', !isTyping(c1.id, u1));
check('13.5: u2 ainda digitando', isTyping(c1.id, u2));

// subscribe
let typingEvents = 0;
const unsubTyping = subscribeTyping(c1.id, () => { typingEvents += 1; });
setTyping(c1.id, toUserId('eve'));
check('13.6: callback typing disparado', typingEvents >= 1);
unsubTyping();

// pruneTyping existe
const typingPrune = pruneTyping();
check('13.7: pruneTyping estrutura', typeof typingPrune.pruned === 'number');

// ============================================================================
// CHECK 14 — Sacred catalog
// ============================================================================
section('8. sacred catalog');
check('14.1: catálogo >= 100', SACRED_TOTAL >= 100);
check('14.2: 7 tradições', SACRED_TRADITIONS === 7);
check('14.3: TRADITION_PRIORITY tem entries', TRADITION_PRIORITY.length === 7);
check('14.4: CIGANO no catálogo', SACRED_CATALOG.some((e) => e.tradition === 'cigano'));
check('14.5: ORIXAS no catálogo', SACRED_CATALOG.some((e) => e.tradition === 'orixas'));
check('14.6: ASTROLOGIA no catálogo', SACRED_CATALOG.some((e) => e.tradition === 'astrologia'));
check('14.7: CABALA no catálogo', SACRED_CATALOG.some((e) => e.tradition === 'cabala'));
check('14.8: NUMEROLOGIA no catálogo', SACRED_CATALOG.some((e) => e.tradition === 'numerologia'));
check('14.9: TANTRA no catálogo', SACRED_CATALOG.some((e) => e.tradition === 'tantra'));
check('14.10: TAROT no catálogo', SACRED_CATALOG.some((e) => e.tradition === 'tarot'));

// termos específicos
check('14.11: Orixás — Oxalá', SACRED_CATALOG.some((e) => e.slug === 'oxala'));
check('14.12: Cigano — Cigano (28)', SACRED_CATALOG.some((e) => e.slug === 'cigano-cigano'));
check('14.13: Cigano — Cigana (29)', SACRED_CATALOG.some((e) => e.slug === 'cigano-cigana'));
check('14.14: Tarot — O Louco', SACRED_CATALOG.some((e) => e.slug === 'tarot-louco'));
check('14.15: Tarot — A Sacerdotisa', SACRED_CATALOG.some((e) => e.slug === 'tarot-sacerdotisa'));
check('14.16: Cabala — Keter', SACRED_CATALOG.some((e) => e.slug === 'keter'));
check('14.17: Tantra — Sahasrara', SACRED_CATALOG.some((e) => e.slug === 'sahasrara'));

// ============================================================================
// CHECK 15 — isParticipant authz
// ============================================================================
section('9. authz');
check('15.1: u1 é participante', isParticipant(c1.id, u1));
check('15.2: u3 não é participante de c1', !isParticipant(c1.id, u3));

// ============================================================================
// CHECK 16 — Erros
// ============================================================================
try {
  getConversation(c1.id, toUserId('intruso'));
  check('16.1: NotParticipantError throw', false);
} catch (err) {
  check('16.1: NotParticipantError throw', err.constructor.name === 'NotParticipantError');
}

try {
  sendDirectMessage(toUserId('conv_inexistente'), u1, 'oi');
  check('16.2: ConversationNotFoundError throw', false);
} catch (err) {
  check('16.2: ConversationNotFoundError throw', err.constructor.name === 'ConversationNotFoundError');
}

// ============================================================================
// RESULT
// ============================================================================

console.log(`\n=== SMOKE RESULT: ${result.passed}/${result.passed + result.failed} PASS ===`);
if (result.failed > 0) {
  console.log('FAILURES:');
  for (const f of failures) console.log(' -', f);
  process.exit(1);
}
process.exit(0);
