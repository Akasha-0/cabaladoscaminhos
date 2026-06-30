/**
 * ════════════════════════════════════════════════════════════════════════════
 * W87-B — MENTORSHIP PAIRING · SPEC
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Self-running test harness — no vitest. Imports the engine directly and
 * registers assertions. The spec runner at the bottom executes them and
 * prints pass/fail counts. Exits with code 0 on full PASS.
 *
 * Cycle 87 lesson: nunca use `await` em `it()` body sem ser explicitamente
 * `async () => {}` — OXC quebra (cycle 86 W86-A lesson).
 *
 * Coverage:
 *   - computePairingScore correctness (soma de pesos + cap)
 *   - applyMentorFilter (compose tradição + study + lang + level)
 *   - listAvailableMentors (onlyAccepting default true)
 *   - findPairings (ordenação, topN, exclusão de acceptMentees=false)
 *   - createPairingRequest (LGPD gate, message validation, dedupe, mentor_not_accepting)
 *   - State machine (pending → accepted → completed, pending → declined, decline→? invalid)
 *   - time-zone diff math (Math.abs < 3h vs > 3h)
 *   - level overflow penalty (-10)
 */

// @ts-ignore — node-stubs.d.ts provides the global type definitions.
declare const process: { exit(code: number): never };
import {
  createMentorshipEngine,
  computePairingScore,
  applyMentorFilter,
  InMemoryMentorshipAdapter,
  LGPD_VERSION,
  MESSAGE_MAX_LEN,
  MESSAGE_MIN_LEN,
  PLAUSIBLE_THRESHOLD,
  SCORE_WEIGHTS,
  STUDY_AREA_MATCH_CAP,
  TRADIÇÃO_LABEL,
  TRADIÇÃO_SYMBOL,
  TRADIÇÕES,
  STUDY_AREAS,
  LEVEL_LABEL,
  LEVEL_ORDER,
  menteeId,
  mentorId,
  pairingId,
  type MentorProfile,
  type MenteeProfile,
} from './index';

// ════════════════════════════════════════════════════════════════════════════
// Tiny harness (espelha cycle 73 pattern)
// ════════════════════════════════════════════════════════════════════════════

interface SpecEntry {
  name: string;
  run: () => void | Promise<void>;
}

const specs: SpecEntry[] = [];

function it(name: string, run: () => void | Promise<void>): void {
  specs.push({ name, run });
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) {
    throw new Error('ASSERT FAIL: ' + msg);
  }
}

function assertEq<T>(actual: T, expected: T, msg: string): void {
  if (actual !== expected) {
    throw new Error(
      `ASSERT FAIL: ${msg}\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`,
    );
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Spec — Constants & types
// ════════════════════════════════════════════════════════════════════════════

it('LGPD_VERSION is "2026-01"', () => {
  assertEq(LGPD_VERSION, '2026-01', 'LGPD_VERSION mismatch');
});

it('PLAUSIBLE_THRESHOLD is 50', () => {
  assertEq(PLAUSIBLE_THRESHOLD, 50, 'PLAUSIBLE_THRESHOLD mismatch');
});

it('SCORE_WEIGHTS has the expected keys', () => {
  assertEq(SCORE_WEIGHTS.tradiçãoMatch, 30, 'tradiçãoMatch should be 30');
  assertEq(SCORE_WEIGHTS.studyAreaPerMatch, 10, 'studyAreaPerMatch should be 10');
  assertEq(SCORE_WEIGHTS.languageMatch, 15, 'languageMatch should be 15');
  assertEq(SCORE_WEIGHTS.timezoneClose, 10, 'timezoneClose should be 10');
  assertEq(SCORE_WEIGHTS.levelGuard, 5, 'levelGuard should be 5');
  assertEq(SCORE_WEIGHTS.levelOverflow, -10, 'levelOverflow should be -10');
  assertEq(SCORE_WEIGHTS.timezoneOverflowPerHour, -3, 'timezoneOverflowPerHour should be -3');
});

it('STUDY_AREA_MATCH_CAP is 5', () => {
  assertEq(STUDY_AREA_MATCH_CAP, 5, 'STUDY_AREA_MATCH_CAP should be 5');
});

it('MESSAGE bounds are sane', () => {
  assertEq(MESSAGE_MIN_LEN, 10, 'MESSAGE_MIN_LEN should be 10');
  assertEq(MESSAGE_MAX_LEN, 1000, 'MESSAGE_MAX_LEN should be 1000');
});

it('TRADIÇÕES has 7 entries (cigano, candomblé, umbanda, ifá, cabala, astrologia, tantra)', () => {
  assertEq(TRADIÇÕES.length, 7, 'TRADIÇÕES must have 7 entries');
  const expected = [
    'cigano',
    'candomble',
    'umbanda',
    'ifa',
    'cabala',
    'astrologia',
    'tantra',
  ];
  for (const t of expected) {
    assert(TRADIÇÕES.includes(t as (typeof TRADIÇÕES)[number]), `missing tradição: ${t}`);
  }
});

it('STUDY_AREAS has 10 entries', () => {
  assertEq(STUDY_AREAS.length, 10, 'STUDY_AREAS must have 10 entries');
});

it('TRADIÇÃO_SYMBOL has all 7 symbols (✦🪶☩◈☸☉☬)', () => {
  assertEq(TRADIÇÃO_SYMBOL.cigano, '✦', 'cigano symbol');
  assertEq(TRADIÇÃO_SYMBOL.candomble, '🪶', 'candomblé symbol');
  assertEq(TRADIÇÃO_SYMBOL.umbanda, '☩', 'umbanda symbol');
  assertEq(TRADIÇÃO_SYMBOL.ifa, '◈', 'ifá symbol');
  assertEq(TRADIÇÃO_SYMBOL.cabala, '☸', 'cabala symbol');
  assertEq(TRADIÇÃO_SYMBOL.astrologia, '☉', 'astrologia symbol');
  assertEq(TRADIÇÃO_SYMBOL.tantra, '☬', 'tantra symbol');
});

it('TRADIÇÃO_SYMBOL is frozen (Object.isFrozen)', () => {
  assert(
    Object.isFrozen(TRADIÇÃO_SYMBOL),
    'TRADIÇÃO_SYMBOL must be Object.frozen',
  );
  assert(
    Object.isFrozen(TRADIÇÃO_LABEL),
    'TRADIÇÃO_LABEL must be Object.frozen',
  );
});

it('LEVEL_ORDER maps corretamente', () => {
  assertEq(LEVEL_ORDER.iniciante, 1, 'iniciante → 1');
  assertEq(LEVEL_ORDER.intermediario, 2, 'intermediario → 2');
  assertEq(LEVEL_ORDER.avancado, 3, 'avancado → 3');
  assertEq(LEVEL_ORDER.mestre, 4, 'mestre → 4');
});

// ════════════════════════════════════════════════════════════════════════════
// Spec — computePairingScore
// ════════════════════════════════════════════════════════════════════════════

it('computePairingScore: perfect match → high score', () => {
  const mentor: MentorProfile = {
    id: mentorId('m1'),
    displayName: 'M',
    handle: 'm',
    tradição: 'cabala',
    studyAreas: ['cabala-mistica', 'meditacao', 'rituais', 'pranayama', 'cura-energetica'],
    languages: ['pt-BR', 'en'],
    level: 'mestre',
    bio: 'b',
    availability: [],
    timezone: 'America/Sao_Paulo',
    acceptMentees: true,
  };
  const mentee: MenteeProfile = {
    id: menteeId('s1'),
    displayName: 'S',
    handle: 's',
    tradiçãoEscolhida: 'cabala',
    interests: ['cabala-mistica', 'meditacao', 'rituais', 'pranayama', 'cura-energetica'],
    level: 'iniciante',
    languages: ['pt-BR'],
    timezone: 'America/Sao_Paulo',
  };
  const ps = computePairingScore(mentor, mentee);
  // tradição(+30) + 5 study(+50) + lang pt-BR(+15) + tz <3h(+10) + level guard(+5) = 110 → saturado 100
  assertEq(ps.score, 100, 'perfect match must saturate to 100');
  assertEq(ps.isPlausible, true, 'perfect match is plausible');
  assert(ps.reason.length >= 5, 'reason array must have at least 5 entries');
});

it('computePairingScore: no match → score baixo', () => {
  const mentor: MentorProfile = {
    id: mentorId('m1'),
    displayName: 'M',
    handle: 'm',
    tradição: 'tantra',
    studyAreas: ['tantra', 'pranayama'],
    languages: ['en'],
    level: 'intermediario',
    bio: 'b',
    availability: [],
    timezone: 'Europe/London',
    acceptMentees: true,
  };
  const mentee: MenteeProfile = {
    id: menteeId('s1'),
    displayName: 'S',
    handle: 's',
    tradiçãoEscolhida: 'cigano',
    interests: ['taro-cigano'],
    level: 'avancado', // > mentor.level → level overflow
    languages: ['pt-BR'],
    timezone: 'America/Sao_Paulo',
  };
  const ps = computePairingScore(mentor, mentee);
  // 0 tradição + 0 study + 0 lang + tz diff 4h → -3 + level overflow → -10 = -13 → 0
  assertEq(ps.score, 0, 'no match must clamp to 0');
  assertEq(ps.isPlausible, false, 'no match is not plausible');
});

it('computePairingScore: tradição match + 2 study + lang overlap + tz close → score > 50', () => {
  const mentor: MentorProfile = {
    id: mentorId('m1'),
    displayName: 'M',
    handle: 'm',
    tradição: 'cigano',
    studyAreas: ['taro-cigano', 'rituais', 'meditacao'],
    languages: ['pt-BR'],
    level: 'mestre',
    bio: 'b',
    availability: [],
    timezone: 'America/Sao_Paulo',
    acceptMentees: true,
  };
  const mentee: MenteeProfile = {
    id: menteeId('s1'),
    displayName: 'S',
    handle: 's',
    tradiçãoEscolhida: 'cigano',
    interests: ['taro-cigano', 'rituais'],
    level: 'iniciante',
    languages: ['pt-BR'],
    timezone: 'America/Sao_Paulo',
  };
  const ps = computePairingScore(mentor, mentee);
  // +30 tradição + +20 study(2×10) + +15 lang + +10 tz + +5 level = 80
  assertEq(ps.score, 80, 'cigano pt-BR tz same with 2 study overlap = 80');
  assertEq(ps.isPlausible, true, 'is plausible');
});

it('computePairingScore: level overflow penalty = -10', () => {
  const mentor: MentorProfile = {
    id: mentorId('m1'),
    displayName: 'M',
    handle: 'm',
    tradição: 'cigano',
    studyAreas: ['taro-cigano'],
    languages: ['pt-BR'],
    level: 'iniciante', // NÃO pode mentorar avançado
    bio: 'b',
    availability: [],
    timezone: 'America/Sao_Paulo',
    acceptMentees: true,
  };
  const mentee: MenteeProfile = {
    id: menteeId('s1'),
    displayName: 'S',
    handle: 's',
    tradiçãoEscolhida: 'cigano',
    interests: ['taro-cigano'],
    level: 'mestre',
    languages: ['pt-BR'],
    timezone: 'America/Sao_Paulo',
  };
  const ps = computePairingScore(mentor, mentee);
  // +30 tradição + +10 study + +15 lang + +10 tz + (-10) level overflow = 55
  assertEq(ps.score, 55, 'cigano match com level overflow → 55');
});

it('computePairingScore: timezone diff > 3h penaliza por hora', () => {
  const mentor: MentorProfile = {
    id: mentorId('m1'),
    displayName: 'M',
    handle: 'm',
    tradição: 'cabala',
    studyAreas: [],
    languages: ['pt-BR'],
    level: 'mestre',
    bio: 'b',
    availability: [],
    timezone: 'Asia/Tokyo', // UTC+9 — diff vs SP = 12h
    acceptMentees: true,
  };
  const mentee: MenteeProfile = {
    id: menteeId('s1'),
    displayName: 'S',
    handle: 's',
    tradiçãoEscolhida: 'cabala',
    interests: [],
    level: 'iniciante',
    languages: ['pt-BR'],
    timezone: 'America/Sao_Paulo', // UTC-3
  };
  const ps = computePairingScore(mentor, mentee);
  // +30 tradição + 0 study + +15 lang + +5 level + tz diff 12h → over=9h → -27 = 23
  assertEq(ps.score, 23, 'Tokyo/SP = 12h diff → -27 over penalty → 23');
});

it('computePairingScore: study area overlap cap em 5', () => {
  const mentor: MentorProfile = {
    id: mentorId('m1'),
    displayName: 'M',
    handle: 'm',
    tradição: 'cigano',
    studyAreas: [
      'taro-cigano',
      'rituais',
      'meditacao',
      'cura-energetica',
      'cabala-mistica',
      'leitura-de-orixas', // 6 — cap=5
    ],
    languages: ['pt-BR'],
    level: 'mestre',
    bio: 'b',
    availability: [],
    timezone: 'America/Sao_Paulo',
    acceptMentees: true,
  };
  const mentee: MenteeProfile = {
    id: menteeId('s1'),
    displayName: 'S',
    handle: 's',
    tradiçãoEscolhida: 'cigano',
    interests: [
      'taro-cigano',
      'rituais',
      'meditacao',
      'cura-energetica',
      'cabala-mistica',
      'leitura-de-orixas',
    ],
    level: 'iniciante',
    languages: ['pt-BR'],
    timezone: 'America/Sao_Paulo',
  };
  const ps = computePairingScore(mentor, mentee);
  // +30 tradição + 5*10 study(cap) + +15 lang + +10 tz + +5 level = 110 → saturado 100
  assertEq(ps.score, 100, 'study overlap capped at 5 → saturado 100');
});

// ════════════════════════════════════════════════════════════════════════════
// Spec — applyMentorFilter
// ════════════════════════════════════════════════════════════════════════════

it('applyMentorFilter: empty filter → todos (8)', () => {
  const adapter = new InMemoryMentorshipAdapter();
  // sincrono — adapter é classe com state em memória
  const all = adapter['mentors'];
  const result = applyMentorFilter(Array.from(all.values()), undefined);
  assertEq(result.length, 8, 'no filter deve retornar 8 mentores');
});

it('applyMentorFilter: tradição=cigano + onlyAccepting=false → 2', () => {
  const adapter = new InMemoryMentorshipAdapter();
  const all = Array.from(adapter['mentors'].values());
  const result = applyMentorFilter(all, { tradição: 'cigano', onlyAccepting: false });
  assertEq(result.length, 2, 'tradição cigano + onlyAccepting=false deve retornar 2 mentores');
});

it('applyMentorFilter: tradição=cigano default (onlyAccepting=true) → 1 (Ramiro pausado)', () => {
  const adapter = new InMemoryMentorshipAdapter();
  const all = Array.from(adapter['mentors'].values());
  const result = applyMentorFilter(all, { tradição: 'cigano' });
  assertEq(result.length, 1, 'tradição cigano default exclui Ramiro (pausado)');
});

it('applyMentorFilter: studyArea=cabala-mistica → >=1', () => {
  const adapter = new InMemoryMentorshipAdapter();
  const all = Array.from(adapter['mentors'].values());
  const result = applyMentorFilter(all, { studyArea: 'cabala-mistica' });
  assert(result.length >= 1, 'cabala-mistica deve ter ao menos 1 mentor');
});

it('applyMentorFilter: onlyAccepting=true (default) exclui Ramiro (acceptMentees=false)', () => {
  const adapter = new InMemoryMentorshipAdapter();
  const all = Array.from(adapter['mentors'].values());
  const result = applyMentorFilter(all, { onlyAccepting: true });
  assertEq(result.length, 7, 'onlyAccepting deve excluir Ramiro (pausado)');
  assert(
    !result.some((m) => m.id === mentorId('mentor-cigano-ramiro')),
    'Ramiro (pausado) NÃO deve aparecer com onlyAccepting=true',
  );
});

it('applyMentorFilter: onlyAccepting=false inclui Ramiro', () => {
  const adapter = new InMemoryMentorshipAdapter();
  const all = Array.from(adapter['mentors'].values());
  const result = applyMentorFilter(all, { onlyAccepting: false });
  assertEq(result.length, 8, 'onlyAccepting=false deve incluir todos');
});

it('applyMentorFilter: compose tradição + language', () => {
  const adapter = new InMemoryMentorshipAdapter();
  const all = Array.from(adapter['mentors'].values());
  const result = applyMentorFilter(all, {
    tradição: 'cabala',
    language: 'en',
    onlyAccepting: false,
  });
  assertEq(result.length, 1, 'cabala + en deve dar 1 (Rabino Shlomo)');
});

// ════════════════════════════════════════════════════════════════════════════
// Spec — Engine.listAvailableMentors + findPairings
// ════════════════════════════════════════════════════════════════════════════

it('listAvailableMentors: default exclui mentores que não aceitam', async () => {
  const adapter = new InMemoryMentorshipAdapter();
  const engine = createMentorshipEngine(adapter);
  const mentors = await engine.listAvailableMentors();
  assertEq(mentors.length, 7, 'listAvailableMentors default deve dar 7');
  assert(
    !mentors.some((m) => m.id === mentorId('mentor-cigano-ramiro')),
    'Ramiro (pausado) NÃO deve aparecer',
  );
});

it('findPairings: ordenado desc por score e respeita topN', async () => {
  const adapter = new InMemoryMentorshipAdapter();
  const engine = createMentorshipEngine(adapter);
  const mentee = (await adapter.getMentee(menteeId('mentee-br-iniciante')))!;
  assert(mentee, 'mentee must exist');
  const top3 = await engine.findPairings(mentee, 3);
  assertEq(top3.length, 3, 'top3 deve dar 3');
  for (let i = 0; i < top3.length - 1; i++) {
    const cur = top3[i];
    const nxt = top3[i + 1];
    if (cur && nxt) {
      assert(cur.score >= nxt.score, 'pairings devem estar em ordem desc');
    }
  }
});

it('findPairings: exclui mentores com acceptMentees=false', async () => {
  const adapter = new InMemoryMentorshipAdapter();
  const engine = createMentorshipEngine(adapter);
  const mentee = (await adapter.getMentee(menteeId('mentee-br-iniciante')))!;
  const all = await engine.findPairings(mentee, 10);
  assert(
    !all.some((p) => p.mentorId === mentorId('mentor-cigano-ramiro')),
    'Ramiro (pausado) NÃO deve aparecer em pairings',
  );
});

it('findPairings: score plausível para mentee brasileira iniciante em cigano', async () => {
  const adapter = new InMemoryMentorshipAdapter();
  const engine = createMentorshipEngine(adapter);
  const mentee = (await adapter.getMentee(menteeId('mentee-br-iniciante')))!;
  const top = await engine.findPairings(mentee, 5);
  const ciganaMira = top.find((p) => p.mentorId === mentorId('mentor-cigana-mira'));
  assert(ciganaMira, 'Cigana Mira deve aparecer nos top 5');
  assert(ciganaMira!.score >= 50, `score deve ser plausible >=50, foi ${ciganaMira!.score}`);
});

// ════════════════════════════════════════════════════════════════════════════
// Spec — createPairingRequest
// ════════════════════════════════════════════════════════════════════════════

it('createPairingRequest: LGPD consent ausente → lgpd_missing', async () => {
  const adapter = new InMemoryMentorshipAdapter();
  const engine = createMentorshipEngine(adapter);
  const result = await engine.createPairingRequest({
    menteeId: menteeId('mentee-br-iniciante'),
    mentorId: mentorId('mentor-cigana-mira'),
    message: 'Olá Cigana Mira, gostaria de aprender o baralho cigano.',
    lgpdConsent: false,
  });
  assertEq(result.kind, 'lgpd_missing', 'sem LGPD deve retornar lgpd_missing');
  assert(
    result.message.includes(LGPD_VERSION),
    'mensagem deve mencionar a versão LGPD',
  );
});

it('createPairingRequest: mensagem curta → message_required', async () => {
  const adapter = new InMemoryMentorshipAdapter();
  const engine = createMentorshipEngine(adapter);
  const result = await engine.createPairingRequest({
    menteeId: menteeId('mentee-br-iniciante'),
    mentorId: mentorId('mentor-cigana-mira'),
    message: 'oi',
    lgpdConsent: true,
  });
  assertEq(result.kind, 'message_required', 'mensagem curta deve falhar');
});

it('createPairingRequest: mentor inexistente → mentor_not_found', async () => {
  const adapter = new InMemoryMentorshipAdapter();
  const engine = createMentorshipEngine(adapter);
  const result = await engine.createPairingRequest({
    menteeId: menteeId('mentee-br-iniciante'),
    mentorId: mentorId('mentor-inexistente'),
    message: 'Olá, gostaria muito de aprender contigo.',
    lgpdConsent: true,
  });
  assertEq(result.kind, 'mentor_not_found', 'mentor inexistente deve falhar');
});

it('createPairingRequest: mentor com acceptMentees=false → mentor_not_accepting', async () => {
  const adapter = new InMemoryMentorshipAdapter();
  const engine = createMentorshipEngine(adapter);
  const result = await engine.createPairingRequest({
    menteeId: menteeId('mentee-br-iniciante'),
    mentorId: mentorId('mentor-cigano-ramiro'), // pausado
    message: 'Olá Cigano Ramiro, gostaria de aprender o método Ramiro.',
    lgpdConsent: true,
  });
  assertEq(result.kind, 'mentor_not_accepting', 'mentor pausado deve falhar');
});

it('createPairingRequest: fluxo happy path → success', async () => {
  const adapter = new InMemoryMentorshipAdapter();
  const engine = createMentorshipEngine(adapter);
  const result = await engine.createPairingRequest({
    menteeId: menteeId('mentee-br-iniciante'),
    mentorId: mentorId('mentor-cigana-mira'),
    message: 'Olá Cigana Mira, sou iniciante e gostaria de aprender o baralho cigano.',
    lgpdConsent: true,
  });
  assertEq(result.kind, 'success', 'happy path deve dar success');
  assert(result.pairing, 'pairing deve ser retornado');
  assertEq(result.pairing!.status, 'pending', 'novo pairing deve estar pending');
  assertEq(result.pairing!.lgpdConsent, true, 'lgpdConsent deve ser true');
});

it('createPairingRequest: duplicate detection (segundo pairing bloqueia)', async () => {
  const adapter = new InMemoryMentorshipAdapter();
  const engine = createMentorshipEngine(adapter);
  const args = {
    menteeId: menteeId('mentee-br-iniciante'),
    mentorId: mentorId('mentor-cigana-mira'),
    message: 'Olá Cigana Mira, sou iniciante e gostaria de aprender o baralho cigano.',
    lgpdConsent: true,
  };
  const first = await engine.createPairingRequest(args);
  assertEq(first.kind, 'success', 'primeiro deve passar');
  const second = await engine.createPairingRequest(args);
  assertEq(second.kind, 'duplicate', 'segundo com mesmo par deve falhar');
});

// ════════════════════════════════════════════════════════════════════════════
// Spec — State machine (accept / decline / complete)
// ════════════════════════════════════════════════════════════════════════════

it('state machine: pending → accepted → completed', async () => {
  const adapter = new InMemoryMentorshipAdapter();
  const engine = createMentorshipEngine(adapter);
  const created = await engine.createPairingRequest({
    menteeId: menteeId('mentee-br-iniciante'),
    mentorId: mentorId('mentor-cigana-mira'),
    message: 'Olá Cigana Mira, gostaria de iniciar no baralho cigano.',
    lgpdConsent: true,
  });
  assert(created.pairing, 'pairing deve existir');
  const acc = await engine.acceptPairing(created.pairing!.id);
  assertEq(acc.ok, true, 'accept deve dar ok');
  assertEq(acc.pairing!.status, 'accepted', 'status deve ser accepted');

  const comp = await engine.completePairing(created.pairing!.id);
  assertEq(comp.ok, true, 'complete deve dar ok');
  assertEq(comp.pairing!.status, 'completed', 'status deve ser completed');
});

it('state machine: pending → declined', async () => {
  const adapter = new InMemoryMentorshipAdapter();
  const engine = createMentorshipEngine(adapter);
  const created = await engine.createPairingRequest({
    menteeId: menteeId('mentee-br-iniciante'),
    mentorId: mentorId('mentor-cigana-mira'),
    message: 'Olá Cigana Mira, gostaria de iniciar no baralho cigano.',
    lgpdConsent: true,
  });
  const decl = await engine.declinePairing(created.pairing!.id);
  assertEq(decl.ok, true, 'decline deve dar ok');
  assertEq(decl.pairing!.status, 'declined', 'status deve ser declined');
});

it('state machine: decline → complete é INVÁLIDO', async () => {
  const adapter = new InMemoryMentorshipAdapter();
  const engine = createMentorshipEngine(adapter);
  const created = await engine.createPairingRequest({
    menteeId: menteeId('mentee-br-iniciante'),
    mentorId: mentorId('mentor-cigana-mira'),
    message: 'Olá Cigana Mira, gostaria de iniciar no baralho cigano.',
    lgpdConsent: true,
  });
  await engine.declinePairing(created.pairing!.id);
  const comp = await engine.completePairing(created.pairing!.id);
  assertEq(comp.ok, false, 'complete após decline deve falhar');
});

it('state machine: pairingId inexistente → ok=false', async () => {
  const adapter = new InMemoryMentorshipAdapter();
  const engine = createMentorshipEngine(adapter);
  const r = await engine.acceptPairing(pairingId('pair-inexistente'));
  assertEq(r.ok, false, 'pairing inexistente deve dar ok=false');
});

it('listPairingRequests: filtra por menteeId', async () => {
  const adapter = new InMemoryMentorshipAdapter();
  const engine = createMentorshipEngine(adapter);
  await engine.createPairingRequest({
    menteeId: menteeId('mentee-br-iniciante'),
    mentorId: mentorId('mentor-cigana-mira'),
    message: 'Olá Cigana Mira, gostaria de iniciar no baralho cigano.',
    lgpdConsent: true,
  });
  await engine.createPairingRequest({
    menteeId: menteeId('mentee-br-iniciante'),
    mentorId: mentorId('mentor-rabino-shlomo'),
    message: 'Olá Rabino, gostaria de estudar Cabala mística contigo.',
    lgpdConsent: true,
  });
  const luciaPairings = await engine.listPairingRequests({
    menteeId: menteeId('mentee-br-iniciante'),
  });
  assertEq(luciaPairings.length, 2, 'Lúcia deve ter 2 pairings');
  const rafaelPairings = await engine.listPairingRequests({
    menteeId: menteeId('mentee-br-intermediaria'),
  });
  assertEq(rafaelPairings.length, 0, 'Rafael deve ter 0 pairings');
});

// ════════════════════════════════════════════════════════════════════════════
// Spec — sanity check final
// ════════════════════════════════════════════════════════════════════════════

it('sanity: 7 tradições × símbolos + labels alinhados', () => {
  for (const t of TRADIÇÕES) {
    const sym = TRADIÇÃO_SYMBOL[t];
    const lbl = TRADIÇÃO_LABEL[t];
    assert(sym.length > 0, `${t} deve ter símbolo`);
    assert(lbl.length > 0, `${t} deve ter label`);
    assert(LEVEL_LABEL.iniciante.length > 0, 'LEVEL_LABEL.iniciante existe');
  }
});

// ════════════════════════════════════════════════════════════════════════════
// Runner
// ════════════════════════════════════════════════════════════════════════════

async function runAll(): Promise<void> {
  let pass = 0;
  let fail = 0;
  const failures: { name: string; err: Error }[] = [];
  for (const s of specs) {
    try {
      await s.run();
      pass++;
      console.log(`  ✓ ${s.name}`);
    } catch (err) {
      fail++;
      const e = err instanceof Error ? err : new Error(String(err));
      failures.push({ name: s.name, err: e });
      console.log(`  ✗ ${s.name}`);
      console.log(`    ${e.message}`);
    }
  }
  console.log('');
  console.log(`═ ${pass} PASS · ${fail} FAIL · ${pass + fail} total ═`);
  if (fail > 0) {
    console.log('');
    console.log('Failures:');
    for (const f of failures) {
      console.log(`  - ${f.name}: ${f.err.message}`);
    }
    process.exit(1);
  }
  process.exit(0);
}

void runAll();
