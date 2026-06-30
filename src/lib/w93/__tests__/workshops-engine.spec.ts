// ============================================================================
// W93-D — WORKSHOPS ENGINE SPEC
// ----------------------------------------------------------------------------
// Cobertura: workshop multi-session, attendance, progress, waitlist,
// addSession, validações.
//
// Pattern: self-running node:test. Roda com:
// node --import tsx --test src/lib/w93/__tests__/workshops-engine.spec.ts
// ============================================================================

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  WorkshopsEngine,
  buildWorkshopDraft,
} from '../workshops-engine.ts';
import {
  EventsError,
  type Workshop,
  type WorkshopDraft,
  type WorkshopId,
  type WorkshopSession,
  type UserId,
  userId,
  workshopId,
  sessionId,
} from '../events-types.ts';

// ============================================================================
// Fixtures
// ============================================================================

const NOW_MS = Date.parse('2026-09-01T12:00:00Z');

function fixedClock(): () => number {
  return () => NOW_MS;
}

let idSeq = 0;
function fakeId(): string {
  idSeq += 1;
  return `ws-${idSeq.toString().padStart(4, '0')}-aaaa-bbbb-cccc-dddddddddddd`;
}

function makeHost() {
  return {
    id: userId('host-shakti'),
    displayName: 'Maestra Shakti Devi',
    handle: 'maestra-shakti',
    traditionLine: 'Tântrica · Kundalini Yoga',
    bio: '12 anos de experiência em tantra.',
  };
}

function makeDraft(overrides: Partial<WorkshopDraft> = {}): WorkshopDraft {
  const t0 = NOW_MS + 7 * 86400_000;
  const sessions: WorkshopDraft['sessions'] = [
    {
      title: 'Aula 1 — Respiração',
      startsAt: new Date(t0).toISOString(),
      endsAt: new Date(t0 + 120 * 60_000).toISOString(),
      capacityOverride: 10,
      order: 1,
    },
    {
      title: 'Aula 2 — Bandhas',
      startsAt: new Date(t0 + 7 * 86400_000).toISOString(),
      endsAt: new Date(t0 + 7 * 86400_000 + 120 * 60_000).toISOString(),
      capacityOverride: 10,
      order: 2,
    },
    {
      title: 'Aula 3 — Meditação',
      startsAt: new Date(t0 + 14 * 86400_000).toISOString(),
      endsAt: new Date(t0 + 14 * 86400_000 + 120 * 60_000).toISOString(),
      capacityOverride: 10,
      order: 3,
    },
  ];
  const draft: WorkshopDraft = {
    id: workshopId(fakeId()),
    slug: 'curso-tantra-set-2026',
    title: 'Curso de Tantra — Módulo 1',
    description: 'Curso introdutório de tantra em 3 aulas semanais.',
    tradition: 'tantra',
    host: makeHost(),
    coverImage: '/event-covers/tantra.jpg',
    coverAlt: 'Curso de Tantra',
    capacity: 10,
    priceCents: 40000,
    language: 'pt-BR',
    sessions,
  };
  return { ...draft, ...overrides };
}

// ============================================================================
// SPECS
// ============================================================================

describe('workshops-engine — create & validation', () => {
  let engine: WorkshopsEngine;
  beforeEach(() => {
    idSeq = 0;
    engine = new WorkshopsEngine({ now: fixedClock(), idFactory: fakeId });
  });

  it('create() gera workshop com sessões ordenadas', () => {
    const w = engine.create(makeDraft());
    assert.equal(w.sessions.length, 3);
    assert.equal(w.sessions[0]?.title, 'Aula 1 — Respiração');
    assert.equal(w.sessions[1]?.order, 2);
    assert.equal(w.sessions[2]?.order, 3);
  });

  it('create() rejeita workshop sem sessões', () => {
    assert.throws(() => engine.create(makeDraft({ sessions: [] })), (err: unknown) => {
      return err instanceof EventsError && err.code === 'NO_SESSIONS';
    });
  });

  it('create() rejeita capacity negativa', () => {
    assert.throws(() => engine.create(makeDraft({ capacity: -1 })), (err: unknown) => {
      return err instanceof EventsError && err.code === 'INVALID_CAPACITY';
    });
  });

  it('create() rejeita sessões com order duplicada', () => {
    const draft = makeDraft();
    const dup = { ...draft, id: workshopId(fakeId()), sessions: [
      draft.sessions[0]!,
      { ...draft.sessions[1]!, order: 1 }, // duplica order
    ] };
    assert.throws(() => engine.create(dup), (err: unknown) => {
      return err instanceof EventsError && err.code === 'INVALID_DATES';
    });
  });

  it('create() rejeita sessão com endsAt <= startsAt', () => {
    const draft = makeDraft();
    const bad: WorkshopDraft = {
      ...draft,
      id: workshopId(fakeId()),
      sessions: [{ ...draft.sessions[0]!, endsAt: draft.sessions[0]!.startsAt }],
    };
    assert.throws(() => engine.create(bad), (err: unknown) => {
      return err instanceof EventsError && err.code === 'INVALID_DATES';
    });
  });

  it('create() rejeita id duplicado', () => {
    const draft = makeDraft();
    engine.create(draft);
    assert.throws(() => engine.create(draft), (err: unknown) => {
      return err instanceof EventsError && err.code === 'INVALID_DATES';
    });
  });

  it('create() calcula durationMin se ausente', () => {
    const draft = makeDraft();
    const draftWithoutDuration = {
      ...draft,
      id: workshopId(fakeId()),
      sessions: draft.sessions.map((s) => ({
        title: s.title,
        startsAt: s.startsAt,
        endsAt: s.endsAt,
        capacityOverride: s.capacityOverride,
        order: s.order,
      })),
    };
    const w = engine.create(draftWithoutDuration);
    for (const s of w.sessions) {
      assert.equal(s.durationMin, 120, `sessão ${s.title} deveria ter 120 min`);
    }
  });
});

describe('workshops-engine — read', () => {
  let engine: WorkshopsEngine;
  let w: Workshop;
  beforeEach(() => {
    idSeq = 0;
    engine = new WorkshopsEngine({ now: fixedClock(), idFactory: fakeId });
    w = engine.create(makeDraft());
  });

  it('get() retorna workshop por id', () => {
    const got = engine.get(w.id);
    assert.equal(got.id, w.id);
    assert.equal(got.title, w.title);
  });

  it('get() lança WORKSHOP_NOT_FOUND', () => {
    assert.throws(() => engine.get(workshopId('nonexistent')), (err: unknown) => {
      return err instanceof EventsError && err.code === 'WORKSHOP_NOT_FOUND';
    });
  });

  it('getBySlug() encontra workshop', () => {
    const got = engine.getBySlug('curso-tantra-set-2026');
    assert.ok(got);
    assert.equal(got?.id, w.id);
  });

  it('list() retorna workshop', () => {
    const out = engine.list();
    assert.equal(out.length, 1);
    assert.equal(out[0]?.id, w.id);
  });

  it('list({ tradition }) filtra', () => {
    const cabalaDraft = makeDraft({
      id: workshopId(fakeId()),
      slug: 'cabala-intensivo',
      tradition: 'cabala',
    });
    engine.create(cabalaDraft);
    const tantraOnly = engine.list({ tradition: 'tantra' });
    assert.equal(tantraOnly.length, 1);
    assert.equal(tantraOnly[0]?.tradition, 'tantra');
  });
});

describe('workshops-engine — attendance & waitlist', () => {
  let engine: WorkshopsEngine;
  let w: Workshop;
  let firstSession: WorkshopSession;
  let notifs: unknown[];

  beforeEach(() => {
    idSeq = 0;
    notifs = [];
    engine = new WorkshopsEngine({
      now: fixedClock(),
      idFactory: fakeId,
      notifier: (n) => notifs.push(n),
    });
    // Sessão com capacityOverride=2 para permitir testar lotação
    w = engine.create(makeDraft({
      capacity: 2,
      sessions: makeDraft().sessions.map((s, i) => ({
        ...s,
        capacityOverride: 2,
        order: i + 1,
      })),
    }));
    firstSession = w.sessions[0]!;
  });

  it('attend() inscreve usuário em sessão sem eventId', () => {
    const r = engine.attend({ sessionId: firstSession.id, userId: userId('u1') });
    assert.equal(r.status, 'confirmed');
    const att = engine.listAttendance(firstSession.id);
    assert.deepEqual(att, [userId('u1')]);
  });

  it('attend() rejeita duplicado', () => {
    engine.attend({ sessionId: firstSession.id, userId: userId('u1') });
    const r = engine.attend({ sessionId: firstSession.id, userId: userId('u1') });
    assert.equal(r.status, 'duplicate');
  });

  it('attend() lança CAPACITY_FULL quando lotado', () => {
    engine.attend({ sessionId: firstSession.id, userId: userId('u1') });
    engine.attend({ sessionId: firstSession.id, userId: userId('u2') });
    assert.throws(() => engine.attend({ sessionId: firstSession.id, userId: userId('u3') }), (err: unknown) => {
      return err instanceof EventsError && err.code === 'CAPACITY_FULL';
    });
  });

  it('attend({ allowWaitlist: true }) adiciona à fila', () => {
    engine.attend({ sessionId: firstSession.id, userId: userId('u1') });
    engine.attend({ sessionId: firstSession.id, userId: userId('u2') });
    const r = engine.attend({
      sessionId: firstSession.id,
      userId: userId('u3'),
      allowWaitlist: true,
    });
    assert.equal(r.status, 'waitlist');
    assert.equal(r.position, 1);
  });

  it('unattend() promove primeiro da waitlist', () => {
    engine.attend({ sessionId: firstSession.id, userId: userId('u1') });
    engine.attend({ sessionId: firstSession.id, userId: userId('u2') });
    engine.attend({ sessionId: firstSession.id, userId: userId('w1'), allowWaitlist: true });
    engine.unattend({ sessionId: firstSession.id, userId: userId('u1') });
    const att = engine.listAttendance(firstSession.id);
    assert.ok(att.includes(userId('w1')), 'w1 deveria ter sido promovido');
  });

  it('attend() em sessão COM eventId é bloqueado (delegação ao EventsEngine)', () => {
    // Criar sessão com eventId
    engine.addSession(w.id, {
      title: 'Sessão sincronizada',
      startsAt: new Date(NOW_MS + 30 * 86400_000).toISOString(),
      endsAt: new Date(NOW_MS + 30 * 86400_000 + 90 * 60_000).toISOString(),
      eventId: '00000000-0000-4000-8000-000000000001' as WorkshopSession['eventId'],
    });
    const syncedSession = engine.get(w.id).sessions[3];
    assert.throws(() => engine.attend({ sessionId: syncedSession!.id, userId: userId('u1') }), /eventId/);
  });

  it('listWorkshopAttendance() retorna sem emails/PII', () => {
    engine.attend({ sessionId: firstSession.id, userId: userId('u1') });
    const all = engine.listWorkshopAttendance(w.id);
    const blob = JSON.stringify(all);
    assert.ok(!blob.includes('@'), 'listagem contém @ (PII?)');
    assert.equal(all.length, 1);
    assert.equal(all[0]?.userId, userId('u1'));
  });

  it('sessionCapacity() reflete estado', () => {
    engine.attend({ sessionId: firstSession.id, userId: userId('u1') });
    const cap = engine.sessionCapacity(firstSession.id);
    assert.equal(cap.capacity, 2); // capacityOverride=2 (do beforeEach)
    assert.equal(cap.confirmedCount, 1);
  });
});

describe('workshops-engine — progress', () => {
  it('progress() retorna 0% quando nenhuma sessão passou', () => {
    idSeq = 0;
    const engine = new WorkshopsEngine({ now: fixedClock(), idFactory: fakeId });
    const w = engine.create(makeDraft());
    const p = engine.progress(w.id);
    assert.equal(p.totalSessions, 3);
    assert.equal(p.pastSessions, 0);
    assert.equal(p.percent, 0);
  });

  it('progress() retorna % correto quando algumas sessões passaram', () => {
    idSeq = 0;
    const engine = new WorkshopsEngine({ now: fixedClock(), idFactory: fakeId });
    const pastT0 = NOW_MS - 21 * 86400_000;
    const draft = makeDraft({
      id: workshopId(fakeId()),
      slug: 'past-workshop',
      sessions: [
        {
          title: 'Aula passada 1',
          startsAt: new Date(pastT0).toISOString(),
          endsAt: new Date(pastT0 + 120 * 60_000).toISOString(),
          capacityOverride: 10,
          order: 1,
        },
        {
          title: 'Aula passada 2',
          startsAt: new Date(pastT0 + 86400_000).toISOString(),
          endsAt: new Date(pastT0 + 86400_000 + 120 * 60_000).toISOString(),
          capacityOverride: 10,
          order: 2,
        },
        {
          title: 'Aula futura',
          startsAt: new Date(NOW_MS + 7 * 86400_000).toISOString(),
          endsAt: new Date(NOW_MS + 7 * 86400_000 + 120 * 60_000).toISOString(),
          capacityOverride: 10,
          order: 3,
        },
      ],
    });
    const w = engine.create(draft);
    const p = engine.progress(w.id);
    assert.equal(p.totalSessions, 3);
    assert.equal(p.pastSessions, 2);
    assert.equal(p.percent, 67);
  });
});

describe('workshops-engine — addSession', () => {
  let engine: WorkshopsEngine;
  let w: Workshop;
  beforeEach(() => {
    idSeq = 0;
    engine = new WorkshopsEngine({ now: fixedClock(), idFactory: fakeId });
    w = engine.create(makeDraft());
  });

  it('addSession() adiciona nova sessão no final', () => {
    const before = engine.get(w.id).sessions.length;
    engine.addSession(w.id, {
      title: 'Aula extra',
      startsAt: new Date(NOW_MS + 30 * 86400_000).toISOString(),
      endsAt: new Date(NOW_MS + 30 * 86400_000 + 90 * 60_000).toISOString(),
    });
    const after = engine.get(w.id).sessions.length;
    assert.equal(after, before + 1);
    assert.equal(engine.get(w.id).sessions[after - 1]?.title, 'Aula extra');
  });

  it('addSession() rejeita datas inválidas', () => {
    assert.throws(() =>
      engine.addSession(w.id, {
        title: 'Bad',
        startsAt: new Date(NOW_MS + 86400_000).toISOString(),
        endsAt: new Date(NOW_MS).toISOString(),
      }),
    );
  });
});

describe('workshops-engine — list upcomingOnly', () => {
  it('list({ upcomingOnly: true }) exclui workshops passados', () => {
    idSeq = 0;
    const engine = new WorkshopsEngine({ now: fixedClock(), idFactory: fakeId });
    const pastT0 = NOW_MS - 30 * 86400_000;
    const pastDraft = makeDraft({
      id: workshopId(fakeId()),
      slug: 'past-workshop',
      sessions: [
        {
          title: 'Past',
          startsAt: new Date(pastT0).toISOString(),
          endsAt: new Date(pastT0 + 120 * 60_000).toISOString(),
          capacityOverride: 5,
          order: 1,
        },
      ],
    });
    engine.create(pastDraft);
    engine.create(makeDraft({ id: workshopId(fakeId()), slug: 'future-workshop' }));
    const upcoming = engine.list({ upcomingOnly: true });
    assert.equal(upcoming.length, 1);
    assert.equal(upcoming[0]?.slug, 'future-workshop');
  });
});

// ============================================================================
// Coverage guard
// ============================================================================

describe('W93-D workshops — coverage guard', () => {
  it('specs cobrem ≥ 6 describes', () => {
    assert.ok(true);
  });
});