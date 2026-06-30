// dm-messages-ui.spec.ts — self-running spec
// W83-A: ≥50 assertions covering adapter + chatReducer + routing + sacred detection.

import {
  createInMemoryDmAdapter,
  SAMPLE_USUARIOS,
  SAMPLE_CONVERSAS,
  SAMPLE_MENSAGENS,
  SACRED_CATALOG_DM,
  DEFAULT_CURRENT_USER_ID,
  detectSacredTermsInMessage,
  extractMentions,
} from '../lib/engines/dm-ui/InMemoryDmAdapter.ts';
import {
  TRADICOES,
  toUsuarioId,
  toConversaId,
  toMensagemId,
} from '../lib/engines/dm-ui/types.ts';
import {
  initialChatState,
  chatReducer,
  canSendMessage,
  hasUnsavedDraft,
  isComposingState,
} from '../lib/engines/dm-ui/chatReducer.ts';
import {
  listRoute,
  threadRoute,
  parseDmPath,
  buildDmPath,
  pathToRoute,
  EMPTY_LIST_ROUTE,
} from '../lib/engines/dm-ui/routing.ts';

let passes = 0;
let fails = 0;
const failures: string[] = [];

function assert(cond: unknown, msg: string): void {
  if (cond) {
    passes += 1;
  } else {
    fails += 1;
    failures.push(msg);
  }
}

function assertEq<T>(actual: T, expected: T, msg: string): void {
  if (actual === expected) {
    passes += 1;
  } else {
    fails += 1;
    failures.push(msg + ' (actual=' + String(actual) + ', expected=' + String(expected) + ')');
  }
}

function assertDeep<T>(actual: T, expected: T, msg: string): void {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a === b) {
    passes += 1;
  } else {
    fails += 1;
    failures.push(msg + ' (actual=' + a + ', expected=' + b + ')');
  }
}

function main(): void {
  const ME = DEFAULT_CURRENT_USER_ID;

  // ========== Constants / catalog ==========
  assertEq(TRADICOES.length, 7, 'TRADICOES has 7 entries');
  assertEq(SAMPLE_USUARIOS.length, 12, 'SAMPLE_USUARIOS has 12 entries');
  assertEq(SAMPLE_CONVERSAS.length, 8, 'SAMPLE_CONVERSAS has 8 entries');
  assert(SAMPLE_MENSAGENS.length >= 20, 'SAMPLE_MENSAGENS has >= 20 entries (got ' + SAMPLE_MENSAGENS.length + ')');
  assert(SACRED_CATALOG_DM.length >= 28, 'SACRED_CATALOG_DM has >= 28 entries (got ' + SACRED_CATALOG_DM.length + ')');

  // 7 tradicoes covered across conversas
  const tradsInConversas = new Set<string>();
  for (const c of SAMPLE_CONVERSAS) {
    for (const t of c.topicosTradicao) tradsInConversas.add(t);
  }
  assert(tradsInConversas.size >= 3, 'at least 3/7 tradicoes appear in conversations (got ' + tradsInConversas.size + ')');

  // Sacred catalog covers all 7 tradicoes
  const tradsInCatalog = new Set<string>();
  for (const entry of SACRED_CATALOG_DM) tradsInCatalog.add(entry.tradicao);
  assertEq(tradsInCatalog.size, 7, 'sacred catalog covers all 7 tradicoes');

  // Joana is in all 8 conversas
  assert(
    SAMPLE_CONVERSAS.every((c) => c.participanteIds.includes(ME)),
    'all 8 conversas include the current user Joana'
  );

  // ========== Adapter: list / get / mensagens ==========
  const a = createInMemoryDmAdapter();
  const convList = a.listConversas(ME);
  // c-8 is archived by default, so default list excludes it
  assertEq(convList.length, 7, 'listConversas(ME) returns 7 (c-8 archived)');
  const convListAll = a.listConversas(ME, { incluirArquivadas: true });
  assertEq(convListAll.length, 8, 'listConversas(ME, incluirArquivadas=true) returns 8');

  const onlyUnread = a.listConversas(ME, { apenasComUnread: true });
  assert(onlyUnread.length >= 3, 'listConversas(ME, apenasComUnread=true) returns >= 3 (got ' + onlyUnread.length + ')');
  assert(
    onlyUnread.every((c) => c.unreadCount > 0),
    'all unread-filtered conversas have unreadCount > 0'
  );

  const c1 = a.getConversa(toConversaId('c-1'));
  assert(c1 !== null, "getConversa('c-1') returns conversa");
  if (c1) {
    assertEq(c1.tipo, 'direct', "c-1 is 'direct'");
    assertEq(c1.topicosTradicao[0], 'candomble', 'c-1 topico is candomble');
  }

  const c6 = a.getConversa(toConversaId('c-6'));
  if (c6) assertEq(c6.tipo, 'group', 'c-6 is group');

  const msgsC1 = a.getMensagens(toConversaId('c-1'));
  assert(msgsC1.length >= 3, 'c-1 has >= 3 mensagens (got ' + msgsC1.length + ')');

  // ========== Sacred detection (NFD substring) ==========
  const hitsLua = detectSacredTermsInMessage('A Lua nova em Cancer mexe com seu mapa astral');
  assert(hitsLua.length >= 3, 'detects >= 3 sacred hits in astrology msg (got ' + hitsLua.length + ')');
  assert(
    hitsLua.some((h) => h.tradicao === 'astrologia'),
    'astrology msg contains astrologia-tradicao hit'
  );

  const hitsOdu = detectSacredTermsInMessage('Odu 7 - Okana pediu firmeza');
  assert(
    hitsOdu.some((h) => h.tradicao === 'ifa'),
    'Odu+Okana msg contains ifa hit'
  );

  // NFD normalization: diacritics still match
  const hitsDiacriticos = detectSacredTermsInMessage('Hoje tem giras no terreiro de Iemanja');
  assert(
    hitsDiacriticos.some((h) => h.term === 'Iemanja' || h.term === 'terreiro'),
    'diacritics stripped matching works (Iemanja/terreiro)'
  );

  // Empty / null safe
  assertEq(detectSacredTermsInMessage('').length, 0, 'detect on empty returns []');

  // ========== @mention extraction ==========
  const allUsers = SAMPLE_USUARIOS;
  const mentionsStella = extractMentions('Ola @stella, tudo bem?', allUsers);
  assertEq(mentionsStella.length, 1, 'extracts @stella');
  assertEq(mentionsStella[0], toUsuarioId('u-4'), '@stella resolves to u-4');

  const mentionsRamiro = extractMentions('Vamos marcar com Cigano Ramiro', allUsers);
  assert(mentionsRamiro.some((id) => id === toUsuarioId('u-1')), 'mentions by name (Cigano Ramiro)');

  const noMentions = extractMentions('Nenhuma mencao aqui', allUsers);
  assertEq(noMentions.length, 0, 'extract returns [] when no mentions');

  // ========== Send + markAsRead ==========
  const a2 = createInMemoryDmAdapter();

  // Search BEFORE sendMensagem to keep preview unchanged
  const searchHit = a2.searchConversas({ usuarioId: ME, query: 'Mesa Real' });
  assert(searchHit.length >= 1, 'search "Mesa Real" returns >= 1 conversa');

  const newMsg = a2.sendMensagem({
    conversaId: toConversaId('c-1'),
    remetenteId: ME,
    conteudo: 'Vou levar a Carta Natal',
  });
  assertEq(newMsg.remetenteId, ME, 'new msg remetente is ME');
  assert(newMsg.sacredHits.some((h) => h.term === 'Carta Natal'), 'sacred hit detected on send');
  const updated = a2.getConversa(toConversaId('c-1'));
  if (updated) {
    assert(updated.ultimaMensagemPreview.includes('Carta Natal'), 'preview updated');
  }

  // Mark as read — should zero out unread
  const readResult = a2.markAsRead({ conversaId: toConversaId('c-1'), usuarioId: ME });
  assertEq(readResult.unreadCount, 0, 'unreadCount = 0 after markAsRead');

  // Mute + archive
  const muted = a2.markConversaMutada({ conversaId: toConversaId('c-1'), usuarioId: ME, mutada: true });
  assertEq(muted.isMuted, true, 'mute works');
  const archived = a2.archiveConversa({ conversaId: toConversaId('c-1'), usuarioId: ME });
  assertEq(archived.isArchived, true, 'archive works');
  const unarchived = a2.unarchiveConversa({ conversaId: toConversaId('c-1'), usuarioId: ME });
  assertEq(unarchived.isArchived, false, 'unarchive works');

  // Empty search query returns []
  const emptySearch = a2.searchConversas({ usuarioId: ME, query: '' });
  assertEq(emptySearch.length, 0, 'search empty query returns []');

  // Other participants
  const outros = a2.getOutrosParticipantes(toConversaId('c-1'), ME);
  assertEq(outros.length, 1, 'c-1 has 1 other participant');
  assertEq(outros[0]!.id, toUsuarioId('u-1'), "c-1's other participant is u-1");

  // Group participants
  const outrosGroup = a2.getOutrosParticipantes(toConversaId('c-6'), ME);
  assertEq(outrosGroup.length, 2, 'c-6 (group) has 2 other participants');

  // getUsuario
  const u = a2.getUsuario(toUsuarioId('u-1'));
  assert(u !== null, 'getUsuario returns user');
  assertEq(u!.online, true, 'u-1 is online');

  // ========== LGPD Consent ==========
  const a3 = createInMemoryDmAdapter();
  const initialStatus = a3.getConsentStatus(ME);
  assertEq(initialStatus, 'unknown', 'consent starts unknown');
  assert(!a3.hasConsent(ME, 'message_send'), 'no message_send consent initially');
  const rec = a3.acceptConsent(ME, ['message_send', 'message_read']);
  assertEq(rec.scopes.length, 2, 'consent record has 2 scopes');
  assertEq(rec.versao, 'lgpd-2026-v1', 'consent version is set');
  assert(a3.hasConsent(ME, 'message_send'), 'has message_send consent after accept');
  assert(a3.hasConsent(ME, 'message_read'), 'has message_read consent after accept');
  assert(!a3.hasConsent(ME, 'presence'), 'no presence consent (not in scopes)');
  assertEq(a3.getConsentStatus(ME), 'accepted', 'consent status is accepted');
  a3.declineConsent(ME);
  assertEq(a3.getConsentStatus(ME), 'declined', 'consent status is declined after decline');
  assert(!a3.hasConsent(ME, 'message_send'), 'no consent after decline');

  // ========== chatReducer: state transitions ==========
  const s0 = initialChatState();
  assertEq(s0.name, 'idle', 'initial state is idle');
  assertEq(canSendMessage(s0), false, 'cannot send from idle (empty draft)');

  const s1 = chatReducer(s0, { type: 'START_COMPOSING' });
  assertEq(s1.name, 'composing', 'START_COMPOSING -> composing');
  assertEq(canSendMessage(s1), false, 'cannot send empty composing');

  const s2 = chatReducer(s1, {
    type: 'UPDATE_DRAFT',
    texto: 'Ola @ramiro',
    mentions: [toUsuarioId('u-1')],
    sacredHits: [],
  });
  if (s2.name === 'composing') {
    assertEq(s2.draft.texto, 'Ola @ramiro', 'draft texto updated');
    assertEq(s2.draft.mentions.length, 1, 'mentions updated');
    assertEq(s2.cursorPos, 11, 'cursor at end of text');
    assertEq(s2.isDirty, true, 'isDirty true after update');
  } else {
    assert(false, 'expected composing after UPDATE_DRAFT');
  }
  assertEq(canSendMessage(s2), true, 'can send with text');

  const s3 = chatReducer(s2, { type: 'SEND_MESSAGE', conversaId: toConversaId('c-1'), remetenteId: ME });
  assertEq(s3.name, 'sending', 'SEND_MESSAGE -> sending');
  if (s3.name === 'sending') {
    assertEq(s3.pendenteConteudo, 'Ola @ramiro', 'pending content saved');
  }

  const s4 = chatReducer(s3, { type: 'SEND_SUCCESS', mensagem: newMsg });
  assertEq(s4.name, 'idle', 'SEND_SUCCESS -> idle');
  assertEq(s4.draft.texto, '', 'draft cleared on success');
  assertEq(canSendMessage(s4), false, 'cannot send from fresh idle');

  // Consent flow
  const s5 = chatReducer(s2, { type: 'SEND_MESSAGE', conversaId: toConversaId('c-1'), remetenteId: ME });
  const s6 = chatReducer(s5, { type: 'REQUEST_CONSENT' });
  assertEq(s6.name, 'awaiting-consent', 'REQUEST_CONSENT -> awaiting-consent');
  if (s6.name === 'awaiting-consent') {
    assertEq(s6.consentScope, 'message_send', 'consent scope is message_send');
  }
  const s7 = chatReducer(s6, { type: 'CONSENT_GRANTED', scopes: ['message_send'] });
  assertEq(s7.name, 'sending', 'CONSENT_GRANTED -> sending');

  // Consent declined -> error
  const s8 = chatReducer(s6, { type: 'CONSENT_DECLINED' });
  assertEq(s8.name, 'error', 'CONSENT_DECLINED -> error');
  if (s8.name === 'error') {
    assertEq(s8.recoverable, false, 'consent declined is non-recoverable');
  }

  // SEND_FAILURE
  const s9 = chatReducer(s3, { type: 'SEND_FAILURE', errorMessage: 'rede caiu' });
  assertEq(s9.name, 'error', 'SEND_FAILURE -> error');
  if (s9.name === 'error') {
    assertEq(s9.errorMessage, 'rede caiu', 'error message preserved');
    assertEq(s9.recoverable, true, 'send failure is recoverable');
  }

  // Empty message -> error
  const s10 = chatReducer(s1, { type: 'SEND_MESSAGE', conversaId: toConversaId('c-1'), remetenteId: ME });
  assertEq(s10.name, 'error', 'send with empty -> error');

  // Set reply-to
  const s11 = chatReducer(s1, {
    type: 'SET_REPLY_TO',
    replyTo: { mensagemId: toMensagemId('m-1-1'), autorNome: 'Cigano Ramiro', preview: 'Odu 7' },
  });
  if (s11.name === 'composing') {
    assert(s11.draft.replyTo !== null, 'reply-to is set');
    assertEq(s11.draft.replyTo!.autorNome, 'Cigano Ramiro', 'reply autorNome');
  }
  const s12 = chatReducer(s11, { type: 'CLEAR_REPLY' });
  if (s12.name === 'composing') {
    assertEq(s12.draft.replyTo, null, 'reply cleared');
  }

  // RESET
  const s13 = chatReducer(s2, { type: 'RESET' });
  assertEq(s13.name, 'idle', 'RESET -> idle');
  assertEq(s13.draft.texto, '', 'RESET clears draft');

  // isComposingState / hasUnsavedDraft helpers
  assert(isComposingState(s2), 'isComposingState true for composing');
  assert(!isComposingState(s0), 'isComposingState false for idle');
  assert(hasUnsavedDraft(s2), 'hasUnsavedDraft true for dirty composing');
  assert(!hasUnsavedDraft(s0), 'hasUnsavedDraft false for fresh idle');

  // ========== Routing ==========
  assertEq(parseDmPath('/dm')!.route, 'list', 'parseDmPath(/dm) is list');
  assertEq(parseDmPath('/dm/')!.route, 'list', 'parseDmPath(/dm/) is list');
  assertEq(parseDmPath('/dm/c-1')!.route, 'thread', 'parseDmPath(/dm/c-1) is thread');
  assertEq(parseDmPath('/dm/c-1/')!.route, 'thread', 'parseDmPath(/dm/c-1/) is thread');
  assertEq(parseDmPath('/dm/c-1')!.params.conversaId, 'c-1', 'conversaId param');
  assertEq(parseDmPath('/nope'), null, 'invalid path returns null');
  assertEq(parseDmPath('/dm/../etc'), null, 'path with bad chars returns null');

  assertEq(buildDmPath('list'), '/dm', 'build list path');
  assertEq(buildDmPath('thread', { conversaId: 'c-3' }), '/dm/c-3', 'build thread path');
  assertEq(buildDmPath('thread'), '/dm', 'thread with no params falls back to /dm');
  assertEq(buildDmPath('thread', { conversaId: 'bad/id' }), '/dm', 'invalid id falls back');

  assertEq(pathToRoute('/dm')!.name, 'list', 'pathToRoute(/dm) = list');
  const threadRota = pathToRoute('/dm/c-1');
  assert(threadRota !== null, 'pathToRoute(/dm/c-1) returns route');
  if (threadRota !== null && threadRota.name === 'thread') {
    assertEq(threadRota.conversaId, toConversaId('c-1'), 'thread rota conversaId');
  }

  assertEq(listRoute().name, 'list', 'listRoute() = list');
  const listR = listRoute({ searchQuery: 'foo' });
  if (listR.name === 'list') {
    assertEq(listR.searchQuery, 'foo', 'listRoute searchQuery');
  }
  assertEq(EMPTY_LIST_ROUTE.incluirArquivadas, false, 'EMPTY_LIST_ROUTE default');
  assertEq(threadRoute(toConversaId('c-2')).conversaId, toConversaId('c-2'), 'threadRoute conversaId');

  console.log('');
  console.log('=== W83-A DM-MESSAGES-UI SPEC ===');
  console.log('PASS: ' + passes);
  console.log('FAIL: ' + fails);
  if (fails > 0) {
    console.log('--- failures ---');
    for (const f of failures) console.log('  - ' + f);
    process.exit(1);
  }
  console.log('All assertions passed.');
}

main();