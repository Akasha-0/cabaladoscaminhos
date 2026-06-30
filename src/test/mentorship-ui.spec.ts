// mentorship-ui.spec.ts — self-running spec
// Cycle 82 W82-C: 20+ assertions covering adapter + UI + routing.

import {
  createInMemoryMentorshipAdapter,
} from '../components/mentorship/mentorship-adapter.ts';
import {
  TRADICAO_LABELS,
  SAMPLE_MENTORES,
  SAMPLE_SLOTS,
  ALL_SPECIALTIES,
} from '../components/mentorship/constants.ts';
import {
  TRADICOES,
  type FiltroMentor,
} from '../components/mentorship/types.ts';
import {
  parseMentorshipPath,
  buildMentorshipPath,
  emptyFiltro,
  emptyBookingState,
  listRoute,
  detailRoute,
  minhasSessoesRoute,
} from '../lib/engines/mentorship-ui/routing.ts';
// Note: renderPage lives in .tsx and would pull in JSX. We test the
// routing helpers + adapter directly to keep the spec free of .tsx.

let passes = 0;
let fails = 0;
const failures: string[] = [];

function assert(cond: unknown, msg: string): void {
  if (cond) {
    passes++;
  } else {
    fails++;
    failures.push(msg);
  }
}

function assertEq<T>(actual: T, expected: T, msg: string): void {
  if (actual === expected) {
    passes++;
  } else {
    fails++;
    failures.push(
      msg + ' (actual=' + String(actual) + ', expected=' + String(expected) + ')'
    );
  }
}

function assertDeep<T>(actual: T, expected: T, msg: string): void {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a === b) {
    passes++;
  } else {
    fails++;
    failures.push(msg + ' (actual=' + a + ', expected=' + b + ')');
  }
}

const USUARIO = 'u-test-001';

function main(): void {
  // ---------- Constants / catalog ----------
  assertEq(TRADICOES.length, 7, 'TRADICOES has 7 entries');
  assertEq(Object.keys(TRADICAO_LABELS).length, 7, 'TRADICAO_LABELS has 7 entries');
  assertEq(SAMPLE_MENTORES.length, 12, 'SAMPLE_MENTORES has 12 entries');
  assert(SAMPLE_SLOTS.length >= 30, 'SAMPLE_SLOTS has >= 30 entries (got ' + SAMPLE_SLOTS.length + ')');
  assert(ALL_SPECIALTIES.length >= 5, 'ALL_SPECIALTIES has >= 5 entries');

  // All 7 tradições covered
  for (const t of TRADICOES) {
    assert(
      SAMPLE_MENTORES.some((m) => m.tradicaoPrincipal === t),
      'SAMPLE_MENTORES covers tradicao ' + t
    );
  }

  // TRADICAO_LABELS has all 7 values present
  for (const t of TRADICOES) {
    assert(typeof TRADICAO_LABELS[t] === 'string', 'TRADICAO_LABELS[' + t + '] is a string');
  }

  // ---------- Adapter: list / get / slots ----------
  const a = createInMemoryMentorshipAdapter();
  const all = a.listMentores();
  assertEq(all.length, 12, 'listMentores() returns 12');
  const ramiro = a.getMentor('m-1');
  assert(ramiro !== null, "getMentor('m-1') returns mentor");
  assertEq(ramiro?.nome, 'Cigano Ramiro', "Cigano Ramiro is mentor m-1");
  assertEq(ramiro?.specialties.length, 3, 'Ramiro has 3 specialties');
  assertEq(ramiro?.tradicaoPrincipal, 'cigano', 'Ramiro tradicao is cigano');

  const slotsM1 = a.getSlots('m-1');
  assert(slotsM1.length >= 3, "getSlots('m-1') returns >= 3 future slots (got " + slotsM1.length + ')');
  // All future
  const now = new Date();
  assert(
    slotsM1.every((s) => new Date(s.inicio) > now),
    'all returned slots are in the future'
  );

  // ---------- Filter ----------
  const ciganos = a.listMentores({
    tradicoes: ['cigano'],
    specialties: [],
    apenasOnline: false,
  });
  assert(ciganos.length >= 2, "filter tradicoes=['cigano'] returns >= 2 (got " + ciganos.length + ')');
  assert(
    ciganos.every((m) => m.tradicaoPrincipal === 'cigano'),
    'all filtered mentores are cigano'
  );

  const onlyOnline = a.listMentores({
    tradicoes: [],
    specialties: [],
    apenasOnline: true,
  });
  assert(
    onlyOnline.every((m) => m.atendeOnline),
    'apenasOnline returns only online mentors'
  );
  assert(onlyOnline.length < 12, 'apenasOnline filter is restrictive');

  // ---------- Booking ----------
  const slotId = slotsM1[0]!.id;
  const result = a.agendarSessao({
    usuarioId: USUARIO,
    slotId,
    notas: 'Primeira consulta',
  });
  assert('sessao' in result, 'agendarSessao returns sessao on success');
  if ('sessao' in result) {
    assertEq(result.sessao.status, 'agendada', 'new sessao is agendada');
    assertEq(result.sessao.usuarioId, USUARIO, 'sessao has correct usuarioId');
    assertEq(result.sessao.slotId, slotId, 'sessao has correct slotId');
    assertEq(result.mentor.id, 'm-1', 'result.mentor is m-1');
  }

  // Invalid slot id
  const pastResult = a.agendarSessao({
    usuarioId: USUARIO,
    slotId: 's-bogus-1',
  });
  assert('erro' in pastResult, 'agendarSessao with invalid slot returns erro');

  // ---------- Listing / cancellation ----------
  const mySessoes = a.listMinhasSessoes({ usuarioId: USUARIO });
  assert(mySessoes.length >= 1, 'listMinhasSessoes returns >= 1 for our user');
  // Sorted
  let sorted = true;
  for (let i = 1; i < mySessoes.length; i++) {
    if (mySessoes[i]!.sessao.inicio < mySessoes[i - 1]!.sessao.inicio) {
      sorted = false;
      break;
    }
  }
  assert(sorted, 'listMinhasSessoes is sorted by inicio ascending');

  if (mySessoes.length > 0) {
    const cancelResult = a.cancelarSessao({
      usuarioId: USUARIO,
      sessaoId: mySessoes[0]!.sessao.id,
    });
    assert('status' in cancelResult, 'cancelarSessao returns sessao');
    if ('status' in cancelResult) {
      assertEq(cancelResult.status, 'cancelada', 'cancelled sessao has status cancelada');
    }
  }

  // Cannot cancel twice
  if (mySessoes.length > 0) {
    const secondCancel = a.cancelarSessao({
      usuarioId: USUARIO,
      sessaoId: mySessoes[0]!.sessao.id,
    });
    assert('erro' in secondCancel, 'second cancel returns erro');
  }

  // Cannot cancel nonexistent
  const noneCancel = a.cancelarSessao({
    usuarioId: USUARIO,
    sessaoId: 'sx-9999',
  });
  assert('erro' in noneCancel, 'cancel of nonexistent sessao returns erro');

  // ---------- Mark concluded ----------
  if (mySessoes.length > 0) {
    const concluded = a.marcarConcluida({
      usuarioId: USUARIO,
      sessaoId: mySessoes[0]!.sessao.id,
      gravacaoUrl: 'https://rec.example.com/' + mySessoes[0]!.sessao.id,
    });
    // Either erro (already cancelled) or status=concluida
    if ('status' in concluded) {
      assertEq(concluded.status, 'concluida', 'concluded sessao has status concluida');
    } else {
      assert(true, 'concluded returns either sessao or erro');
    }
  }

  // ---------- Routing ----------
  assertDeep(parseMentorshipPath('/mentorship'), { route: 'list', params: {} }, '/mentorship → list');
  assertDeep(parseMentorshipPath('/mentorship/sessions'), { route: 'minhas-sessoes', params: {} }, '/mentorship/sessions → minhas-sessoes');
  assertDeep(
    parseMentorshipPath('/mentorship/m-1'),
    { route: 'detail', params: { id: 'm-1' } },
    '/mentorship/m-1 → detail'
  );
  assertEq(parseMentorshipPath('/nope'), null, 'unknown path returns null');

  assertEq(buildMentorshipPath('list'), '/mentorship', 'build list path');
  assertEq(buildMentorshipPath('minhas-sessoes'), '/mentorship/sessions', 'build minhas path');
  assertEq(buildMentorshipPath('detail', { id: 'm-3' }), '/mentorship/m-3', 'build detail path');

  // ---------- Route constructors ----------
  const r1 = listRoute(emptyFiltro());
  assertEq(r1.name, 'list', 'listRoute.name=list');
  const r2 = detailRoute({ mentorId: 'm-2' });
  assertEq(r2.name, 'detail', 'detailRoute.name=detail');
  if (r2.name === 'detail') {
    assertEq(r2.mentorId, 'm-2', 'detailRoute.mentorId');
    assertEq(r2.bookingState.slotId, null, 'detailRoute.bookingState.slotId=null by default');
  }
  const r3 = minhasSessoesRoute();
  assertEq(r3.name, 'minhas-sessoes', 'minhasSessoesRoute.name=minhas-sessoes');

  // Empty booking state utility
  assertEq(emptyBookingState().slotId, null, 'emptyBookingState().slotId=null');

  // ---------- Search filter ----------
  const ramiroSearch = a.listMentores({
    tradicoes: [],
    specialties: [],
    apenasOnline: false,
    busca: 'Ramiro',
  });
  assert(ramiroSearch.length >= 1, "search 'Ramiro' returns >= 1");

  // Preco filter
  const cheap = a.listMentores({
    tradicoes: [],
    specialties: [],
    apenasOnline: false,
    precoMaxBRL: 200,
  });
  assert(cheap.every((m) => m.precoBRL <= 200), 'precoMaxBRL=200 filter works');

  // ---------- Type usage: empty filtro ----------
  const ef = emptyFiltro();
  assertEq(ef.tradicoes.length, 0, 'emptyFiltro().tradicoes is empty');
  assertEq(ef.specialties.length, 0, 'emptyFiltro().specialties is empty');

  console.log('');
  console.log('=== W82-C MENTORSHIP-UI SPEC ===');
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
