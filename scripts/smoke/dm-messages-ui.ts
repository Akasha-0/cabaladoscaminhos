// scripts/smoke/dm-messages-ui.ts — parent-brief smoke checks
// W83-A: 20+ parent-brief assertions.

import {
  createInMemoryDmAdapter,
  SAMPLE_USUARIOS,
  SAMPLE_CONVERSAS,
  SAMPLE_MENSAGENS,
  SACRED_CATALOG_DM,
  DEFAULT_CURRENT_USER_ID,
  detectSacredTermsInMessage,
} from '../../src/lib/engines/dm-ui/InMemoryDmAdapter.ts';
import {
  TRADICOES,
} from '../../src/lib/engines/dm-ui/types.ts';
import {
  initialChatState,
  chatReducer,
  canSendMessage,
} from '../../src/lib/engines/dm-ui/chatReducer.ts';

let passes = 0;
let fails = 0;
const failures: string[] = [];

function check(cond: unknown, msg: string): void {
  if (cond) {
    passes += 1;
  } else {
    fails += 1;
    failures.push(msg);
  }
}

function main(): void {
  const ME = DEFAULT_CURRENT_USER_ID;

  // Smoke #1-3: catalog sizes
  check(SAMPLE_USUARIOS.length === 12, 'SAMPLE_USUARIOS has 12');
  check(SAMPLE_CONVERSAS.length === 8, 'SAMPLE_CONVERSAS has 8');
  check(SAMPLE_MENSAGENS.length >= 20, 'SAMPLE_MENSAGENS has >= 20');

  // Smoke #4: 7 tradicoes
  check(TRADICOES.length === 7, 'TRADICOES has 7');

  // Smoke #5: sacred catalog >= 28 entries
  check(SACRED_CATALOG_DM.length >= 28, 'SACRED_CATALOG_DM has >= 28 entries (got ' + SACRED_CATALOG_DM.length + ')');

  // Smoke #6: at least 3 conversas mention a tradicao symbol
  const tradsInConversas = new Set<string>();
  for (const c of SAMPLE_CONVERSAS) {
    for (const t of c.topicosTradicao) tradsInConversas.add(t);
  }
  check(tradsInConversas.size >= 3, 'at least 3/7 tradicoes appear in conversations (got ' + tradsInConversas.size + ')');

  // Smoke #7: Joana is current user
  check(ME === 'u-12', 'current user is Joana (u-12)');

  // Smoke #8: all conversas include Joana
  check(
    SAMPLE_CONVERSAS.every((c) => c.participanteIds.includes(ME)),
    'all conversas include Joana'
  );

  // Smoke #9: listConversas returns 7 (c-8 archived by default)
  const a = createInMemoryDmAdapter();
  check(a.listConversas(ME).length === 7, 'listConversas returns 7 (c-8 archived)');
  check(a.listConversas(ME, { incluirArquivadas: true }).length === 8, 'list with archive returns 8');

  // Smoke #10: unread filter
  const unreadList = a.listConversas(ME, { apenasComUnread: true });
  check(unreadList.length >= 3, 'unread filter returns >= 3 (got ' + unreadList.length + ')');

  // Smoke #11: sendMensagem
  const a2 = createInMemoryDmAdapter();
  const newMsg = a2.sendMensagem({
    conversaId: 'c-1' as any,
    remetenteId: ME,
    conteudo: 'Hoje vou no terreiro de Iemanja',
  });
  check(newMsg.remetenteId === ME, 'sendMensagem returns msg with remetenteId');
  check(newMsg.sacredHits.some((h) => h.tradicao === 'candomble'), 'send detects candomble sacred hit');

  // Smoke #12: sacred detection
  const hits = detectSacredTermsInMessage('Mesa Real de Odu 7 - Okana com Cigano Ramiro');
  check(hits.some((h) => h.tradicao === 'candomble'), 'Mesa Real+Odu detected as candomble');
  check(hits.some((h) => h.tradicao === 'ifa'), 'Okana detected as ifa');

  // Smoke #13: chatReducer start_composing
  const s1 = chatReducer(initialChatState(), { type: 'START_COMPOSING' });
  check(s1.name === 'composing', 'START_COMPOSING -> composing');

  // Smoke #14: chatReducer update draft
  const s2 = chatReducer(s1, { type: 'UPDATE_DRAFT', texto: 'Ola', mentions: [], sacredHits: [] });
  check(s2.name === 'composing', 'UPDATE_DRAFT keeps composing');

  // Smoke #15: chatReducer send_message
  const s3 = chatReducer(s2, { type: 'SEND_MESSAGE', conversaId: 'c-1' as any, remetenteId: ME });
  check(s3.name === 'sending', 'SEND_MESSAGE -> sending');

  // Smoke #16: chatReducer send success -> idle
  const s4 = chatReducer(s3, { type: 'SEND_SUCCESS', mensagem: newMsg });
  check(s4.name === 'idle', 'SEND_SUCCESS -> idle');

  // Smoke #17: chatReducer consent flow
  const s5 = chatReducer(s3, { type: 'REQUEST_CONSENT' });
  check(s5.name === 'awaiting-consent', 'REQUEST_CONSENT -> awaiting-consent');

  const s6 = chatReducer(s5, { type: 'CONSENT_DECLINED' });
  check(s6.name === 'error', 'CONSENT_DECLINED -> error');
  if (s6.name === 'error') {
    check(!s6.recoverable, 'consent decline is non-recoverable');
  }

  // Smoke #18: routing /dm -> list
  // (covered in spec; here just sanity)

  // Smoke #19: LGPD consent gate
  const a3 = createInMemoryDmAdapter();
  check(a3.getConsentStatus(ME) === 'unknown', 'initial consent unknown');
  a3.acceptConsent(ME, ['message_send']);
  check(a3.hasConsent(ME, 'message_send'), 'consent accepted');
  a3.declineConsent(ME);
  check(!a3.hasConsent(ME, 'message_send'), 'consent declined clears');

  // Smoke #20: canSendMessage
  const idleState = initialChatState();
  check(!canSendMessage(idleState), 'cannot send from idle');
  const compState = chatReducer(idleState, {
    type: 'UPDATE_DRAFT',
    texto: 'hello',
    mentions: [],
    sacredHits: [],
  });
  check(canSendMessage(compState), 'can send from composing with text');

  // Smoke #21: messaging with quote-reply
  const a4 = createInMemoryDmAdapter();
  const msgWithReply = a4.sendMensagem({
    conversaId: 'c-1' as any,
    remetenteId: ME,
    conteudo: 'Respondendo: ok',
    replyToId: 'm-1-3' as any,
  });
  check(msgWithReply.replyToId !== null, 'replyToId preserved on send');

  // Smoke #22: archive + unarchive
  const a5 = createInMemoryDmAdapter();
  const archived = a5.archiveConversa({ conversaId: 'c-1' as any, usuarioId: ME });
  check(archived.isArchived, 'archive works');
  // c-1 + c-8 both archived -> 6 visible by default
  const afterArchive = a5.listConversas(ME);
  check(afterArchive.length === 6, 'list excludes archived by default (got ' + afterArchive.length + ')');
  const inclArchive = a5.listConversas(ME, { incluirArquivadas: true });
  check(inclArchive.length === 8, 'list with archive includes all');

  console.log('');
  console.log('=== W83-A DM-MESSAGES-UI SMOKE ===');
  console.log('PASS: ' + passes);
  console.log('FAIL: ' + fails);
  if (fails > 0) {
    console.log('--- failures ---');
    for (const f of failures) console.log('  - ' + f);
    process.exit(1);
  }
  console.log('All smoke checks passed.');
}

main();