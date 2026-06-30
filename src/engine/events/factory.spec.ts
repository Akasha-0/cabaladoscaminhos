// ============================================================================
// W86-D — Events/Workshops Engine · spec
// ----------------------------------------------------------------------------
// 30+ assertions cobrindo:
//   - factory cria engine com adapter
//   - LGPD consent é obrigatório
//   - guests bounds (0..5)
//   - evento encerrado/cancelado bloqueia novo RSVP
//   - duplicidade bloqueia
//   - capacity enforcement → waitlist
//   - cancel preserva histórico
//   - filtros: tradição, type, from/to, free
//   - 7 tradições seed (cigano, candomble, umbanda, ifa, cabala, astrologia, tantra)
//   - 4 tipos seed (workshop, ceremony, circle, lecture)
// ============================================================================

import { describe, expect, it, beforeEach } from 'vitest';
import { createEventsEngine, InMemoryEventsAdapter } from './factory';
import { toEventId, toRSVPId, toUserId } from './adapter-memory';
import { TRADIÇÃO_LABEL } from './types';
import type { RSVP } from './types';

function makeEngineWithRSVPs(seed: ReadonlyArray<RSVP>) {
  const adapter = new InMemoryEventsAdapter();
  adapter.seedRSVPs(seed);
  const engine = createEventsEngine(adapter);
  return { adapter, engine };
}

describe('Events engine · constants & types', () => {
  it('7 tradições suportadas', () => {
    expect(Object.keys(TRADIÇÃO_LABEL)).toHaveLength(7);
    expect(TRADIÇÃO_LABEL.cigano).toBe('Cigano');
    expect(TRADIÇÃO_LABEL.candomble).toBe('Candomblé');
    expect(TRADIÇÃO_LABEL.umbanda).toBe('Umbanda');
    expect(TRADIÇÃO_LABEL.ifa).toBe('Ifá');
    expect(TRADIÇÃO_LABEL.cabala).toBe('Cabala');
    expect(TRADIÇÃO_LABEL.astrologia).toBe('Astrologia');
    expect(TRADIÇÃO_LABEL.tantra).toBe('Tantra');
  });

  it('type guards rejeitam valores inválidos', async () => {
    const { isTradição, isEventType, isEventStatus, isRSVPStatus } = await import('./types');
    expect(isTradição('cigano')).toBe(true);
    expect(isTradição('vodu')).toBe(false);
    expect(isEventType('workshop')).toBe(true);
    expect(isEventType('ritual')).toBe(false);
    expect(isEventStatus('scheduled')).toBe(true);
    expect(isEventStatus('unknown')).toBe(false);
    expect(isRSVPStatus('confirmed')).toBe(true);
    expect(isRSVPStatus('attended')).toBe(false);
  });
});

describe('Events engine · listEvents', () => {
  let adapter: InMemoryEventsAdapter;
  let engine: ReturnType<typeof createEventsEngine>;

  beforeEach(() => {
    adapter = new InMemoryEventsAdapter();
    engine = createEventsEngine(adapter);
  });

  it('retorna 12 eventos seed cobrindo as 7 tradições', async () => {
    const events = await engine.listEvents();
    expect(events.length).toBeGreaterThanOrEqual(12);
    const tradições = new Set(events.map((e) => e.tradição));
    expect(tradições.size).toBe(7);
    for (const t of ['cigano', 'candomble', 'umbanda', 'ifa', 'cabala', 'astrologia', 'tantra']) {
      expect(tradições.has(t as never)).toBe(true);
    }
  });

  it('filtra por tradição', async () => {
    const events = await engine.listEvents({ tradição: 'cigano' });
    expect(events.length).toBeGreaterThan(0);
    expect(events.every((e) => e.tradição === 'cigano')).toBe(true);
  });

  it('filtra por tipo', async () => {
    const events = await engine.listEvents({ type: 'ceremony' });
    expect(events.length).toBeGreaterThan(0);
    expect(events.every((e) => e.type === 'ceremony')).toBe(true);
  });

  it('filtra por free/paid', async () => {
    const free = await engine.listEvents({ free: true });
    const paid = await engine.listEvents({ free: false });
    expect(free.length).toBeGreaterThan(0);
    expect(paid.length).toBeGreaterThan(0);
    expect(free.every((e) => e.free === true)).toBe(true);
    expect(paid.every((e) => e.free === false)).toBe(true);
  });

  it('filtra por range de datas', async () => {
    const all = await engine.listEvents();
    const cutoff = all[5].startsAt;
    const fromCutoff = await engine.listEvents({ from: cutoff });
    expect(
      fromCutoff.every((e) => new Date(e.startsAt).getTime() >= new Date(cutoff).getTime())
    ).toBe(true);
  });

  it('combina múltiplos filtros (AND lógico)', async () => {
    const events = await engine.listEvents({
      tradição: 'cabala',
      type: 'workshop',
      free: false,
    });
    expect(events.every((e) => e.tradição === 'cabala' && e.type === 'workshop' && !e.free)).toBe(true);
  });

  it('retorna lista vazia quando nenhum match', async () => {
    const events = await engine.listEvents({ tradição: 'cabala', type: 'ceremony' });
    expect(events).toEqual([]);
  });
});

describe('Events engine · getEvent', () => {
  it('retorna evento por ID', async () => {
    const engine = createEventsEngine(new InMemoryEventsAdapter());
    const evt = await engine.getEvent(toEventId('evt-cigano-001'));
    expect(evt).not.toBeNull();
    expect(evt?.tradição).toBe('cigano');
  });

  it('retorna null para ID inexistente', async () => {
    const engine = createEventsEngine(new InMemoryEventsAdapter());
    const evt = await engine.getEvent(toEventId('evt-nao-existe'));
    expect(evt).toBeNull();
  });
});

describe('Events engine · createRSVP', () => {
  it('LGPD consent é obrigatório', async () => {
    const engine = createEventsEngine(new InMemoryEventsAdapter());
    const result = await engine.createRSVP(
      toEventId('evt-cigano-001'),
      toUserId('user-1'),
      'Maria',
      0,
      false
    );
    expect(result.kind).toBe('lgpd_missing');
  });

  it('guests > max retorna erro', async () => {
    const engine = createEventsEngine(new InMemoryEventsAdapter());
    const result = await engine.createRSVP(
      toEventId('evt-cigano-001'),
      toUserId('user-1'),
      'Maria',
      10,
      true
    );
    expect(result.kind).toBe('lgpd_missing');
    if (result.kind === 'lgpd_missing') {
      expect(result.message).toContain('5');
    }
  });

  it('guests < min retorna erro', async () => {
    const engine = createEventsEngine(new InMemoryEventsAdapter());
    const result = await engine.createRSVP(
      toEventId('evt-cigano-001'),
      toUserId('user-1'),
      'Maria',
      -1,
      true
    );
    expect(result.kind).toBe('lgpd_missing');
  });

  it('evento inexistente retorna event_not_found', async () => {
    const engine = createEventsEngine(new InMemoryEventsAdapter());
    const result = await engine.createRSVP(
      toEventId('evt-nao-existe'),
      toUserId('user-1'),
      'Maria',
      0,
      true
    );
    expect(result.kind).toBe('event_not_found');
  });

  it('RSVP válido cria confirmed quando há vaga', async () => {
    const engine = createEventsEngine(new InMemoryEventsAdapter());
    const result = await engine.createRSVP(
      toEventId('evt-cigano-001'),
      toUserId('user-1'),
      'Maria',
      2,
      true
    );
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.rsvp.status).toBe('confirmed');
      expect(result.rsvp.guests).toBe(2);
      expect(result.rsvp.lgpdConsent).toBe(true);
      expect(result.stats.confirmed).toBeGreaterThanOrEqual(1);
    }
  });

  it('capacity cheia → RSVP cai em waitlist', async () => {
    // Enche o evento evt-candomble-002 (capacity 50) com 50 RSVPs pré-existentes
    const seedRSVPs: RSVP[] = [];
    for (let i = 0; i < 50; i++) {
      seedRSVPs.push({
        id: toRSVPId(`rsvp-pre-${i}`),
        eventId: toEventId('evt-candomble-002'),
        userId: toUserId(`user-pre-${i}`),
        userName: `User ${i}`,
        guests: 0,
        status: 'confirmed',
        lgpdConsent: true,
        createdAt: new Date().toISOString(),
      });
    }
    const { engine } = makeEngineWithRSVPs(seedRSVPs);
    const result = await engine.createRSVP(
      toEventId('evt-candomble-002'),
      toUserId('user-new'),
      'Novo',
      0,
      true
    );
    expect(result.kind).toBe('waitlist');
    if (result.kind === 'waitlist') {
      expect(result.rsvp.status).toBe('waitlist');
      expect(result.stats.isFull).toBe(true);
    }
  });

  it('duplicidade bloqueia segundo RSVP', async () => {
    const engine = createEventsEngine(new InMemoryEventsAdapter());
    await engine.createRSVP(
      toEventId('evt-cigano-001'),
      toUserId('user-1'),
      'Maria',
      0,
      true
    );
    const dup = await engine.createRSVP(
      toEventId('evt-cigano-001'),
      toUserId('user-1'),
      'Maria',
      0,
      true
    );
    expect(dup.kind).toBe('duplicate');
  });

  it('evento ended retorna event_ended', async () => {
    const adapter = new InMemoryEventsAdapter();
    const engine = createEventsEngine(adapter);
    const evt = await adapter.getEvent(toEventId('evt-cigano-001'));
    await adapter.saveEvent({ ...evt!, status: 'ended' });
    const result = await engine.createRSVP(
      toEventId('evt-cigano-001'),
      toUserId('user-1'),
      'Maria',
      0,
      true
    );
    expect(result.kind).toBe('event_ended');
  });

  it('evento cancelled retorna event_cancelled', async () => {
    const adapter = new InMemoryEventsAdapter();
    const engine = createEventsEngine(adapter);
    const evt = await adapter.getEvent(toEventId('evt-cigano-001'));
    await adapter.saveEvent({ ...evt!, status: 'cancelled' });
    const result = await engine.createRSVP(
      toEventId('evt-cigano-001'),
      toUserId('user-1'),
      'Maria',
      0,
      true
    );
    expect(result.kind).toBe('event_cancelled');
  });
});

describe('Events engine · cancelRSVP', () => {
  it('cancel preserva histórico (status → cancelled)', async () => {
    const { engine, adapter } = makeEngineWithRSVPs([
      {
        id: toRSVPId('rsvp-cancel-test'),
        eventId: toEventId('evt-cigano-001'),
        userId: toUserId('user-1'),
        userName: 'Maria',
        guests: 0,
        status: 'confirmed',
        lgpdConsent: true,
        createdAt: new Date().toISOString(),
      },
    ]);
    const result = await engine.cancelRSVP(toRSVPId('rsvp-cancel-test'));
    expect(result.ok).toBe(true);
    const rsvps = adapter.debugRSVPs();
    const cancelled = rsvps.find((r) => r.id === toRSVPId('rsvp-cancel-test'));
    expect(cancelled?.status).toBe('cancelled');
  });

  it('cancel de RSVP inexistente retorna ok=false', async () => {
    const engine = createEventsEngine(new InMemoryEventsAdapter());
    const result = await engine.cancelRSVP(toRSVPId('rsvp-inexistente'));
    expect(result.ok).toBe(false);
  });
});

describe('Events engine · listUserRSVPs', () => {
  it('retorna RSVPs do usuário', async () => {
    const { engine } = makeEngineWithRSVPs([
      {
        id: toRSVPId('rsvp-u1-a'),
        eventId: toEventId('evt-cigano-001'),
        userId: toUserId('user-1'),
        userName: 'Maria',
        guests: 0,
        status: 'confirmed',
        lgpdConsent: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: toRSVPId('rsvp-u1-b'),
        eventId: toEventId('evt-cabala-002'),
        userId: toUserId('user-1'),
        userName: 'Maria',
        guests: 0,
        status: 'waitlist',
        lgpdConsent: true,
        createdAt: new Date().toISOString(),
      },
    ]);
    const rsvps = await engine.listUserRSVPs(toUserId('user-1'));
    expect(rsvps).toHaveLength(2);
  });

  it('retorna lista vazia para usuário sem RSVP', async () => {
    const engine = createEventsEngine(new InMemoryEventsAdapter());
    const rsvps = await engine.listUserRSVPs(toUserId('user-vazio'));
    expect(rsvps).toEqual([]);
  });
});

describe('Events engine · getEventStats', () => {
  it('retorna stats zeradas para evento vazio', async () => {
    const engine = createEventsEngine(new InMemoryEventsAdapter());
    const stats = await engine.getEventStats(toEventId('evt-cigano-001'));
    expect(stats).not.toBeNull();
    expect(stats?.confirmed).toBe(0);
    expect(stats?.waitlist).toBe(0);
    expect(stats?.isFull).toBe(false);
    expect(stats?.capacity).toBe(20);
  });

  it('isFull=true quando confirmed >= capacity', async () => {
    const seedRSVPs: RSVP[] = [];
    for (let i = 0; i < 20; i++) {
      seedRSVPs.push({
        id: toRSVPId(`rsvp-stat-${i}`),
        eventId: toEventId('evt-cigano-001'),
        userId: toUserId(`user-stat-${i}`),
        userName: `U${i}`,
        guests: 0,
        status: 'confirmed',
        lgpdConsent: true,
        createdAt: new Date().toISOString(),
      });
    }
    const { engine } = makeEngineWithRSVPs(seedRSVPs);
    const stats = await engine.getEventStats(toEventId('evt-cigano-001'));
    expect(stats?.isFull).toBe(true);
    expect(stats?.spotsLeft).toBe(0);
  });

  it('spotsLeft=Infinity quando capacity=0', async () => {
    const adapter = new InMemoryEventsAdapter();
    await adapter.saveEvent({
      id: toEventId('evt-ilimitado'),
      title: 'Ilimitado',
      descrição: 'Sem teto de vagas',
      type: 'circle',
      tradição: 'cabala',
      host: {
        id: 'h',
        displayName: 'H',
        handle: 'h',
        tradição: 'cabala',
        bio: 'b',
      },
      startsAt: new Date().toISOString(),
      endsAt: new Date().toISOString(),
      capacity: 0,
      free: true,
      location: 'Online',
      modality: 'online',
      status: 'scheduled',
      tags: [],
    });
    const engine = createEventsEngine(adapter);
    const stats = await engine.getEventStats(toEventId('evt-ilimitado'));
    expect(stats?.spotsLeft).toBe(Infinity);
    expect(stats?.isFull).toBe(false);
  });

  it('retorna null para evento inexistente', async () => {
    const engine = createEventsEngine(new InMemoryEventsAdapter());
    const stats = await engine.getEventStats(toEventId('evt-fantasma'));
    expect(stats).toBeNull();
  });
});

describe('Events engine · Tradição-symbol mapping', () => {
  it('símbolos são caracteres announcement-friendly (não emoji decorativos)', async () => {
    const { TRADIÇÃO_SYMBOL } = await import('./types');
    expect(TRADIÇÃO_SYMBOL.cigano).toBe('✦');
    expect(TRADIÇÃO_SYMBOL.candomble).toBe('🪶');
    expect(TRADIÇÃO_SYMBOL.umbanda).toBe('☩');
    expect(TRADIÇÃO_SYMBOL.ifa).toBe('◈');
    expect(TRADIÇÃO_SYMBOL.cabala).toBe('☸');
    expect(TRADIÇÃO_SYMBOL.astrologia).toBe('☉');
    expect(TRADIÇÃO_SYMBOL.tantra).toBe('☬');
  });
});

describe('Events engine · sacred-cultural sensitivity', () => {
  it('seed NÃO contém eventos de amarração/vinculação', async () => {
    const engine = createEventsEngine(new InMemoryEventsAdapter());
    const events = await engine.listEvents();
    for (const evt of events) {
      const text = `${evt.title} ${evt.descrição} ${evt.tags.join(' ')}`.toLowerCase();
      expect(text).not.toContain('amarração');
      expect(text).not.toContain('amarre');
      expect(text).not.toContain('vinculação');
      expect(text).not.toContain('vincular');
    }
  });

  it('seed contém terminologia sagrada preservada', async () => {
    const engine = createEventsEngine(new InMemoryEventsAdapter());
    const events = await engine.listEvents();
    const allText = events
      .map((e) => `${e.title} ${e.descrição} ${e.host.bio}`)
      .join(' ')
      .toLowerCase();
    // Pelo menos algumas referências a termos sagrados (sem exigir todos)
    const sacredHits = [
      'orixá', 'orixas', 'caboclo', 'babalawô', 'babalaô', 'odu',
      'candomblé', 'umbanda', 'axé', 'jurema',
    ].filter((term) => allText.includes(term));
    expect(sacredHits.length).toBeGreaterThanOrEqual(3);
  });
});

describe('Events engine · variety coverage', () => {
  it('seed cobre os 4 tipos de evento', async () => {
    const engine = createEventsEngine(new InMemoryEventsAdapter());
    const events = await engine.listEvents();
    const types = new Set(events.map((e) => e.type));
    expect(types.size).toBe(4);
    expect(types.has('workshop')).toBe(true);
    expect(types.has('ceremony')).toBe(true);
    expect(types.has('circle')).toBe(true);
    expect(types.has('lecture')).toBe(true);
  });

  it('seed mistura free e paid', async () => {
    const engine = createEventsEngine(new InMemoryEventsAdapter());
    const events = await engine.listEvents();
    expect(events.some((e) => e.free)).toBe(true);
    expect(events.some((e) => !e.free)).toBe(true);
  });

  it('seed inclui modalidades presencial, online, hibrido', async () => {
    const engine = createEventsEngine(new InMemoryEventsAdapter());
    const events = await engine.listEvents();
    const mods = new Set(events.map((e) => e.modality));
    expect(mods.size).toBe(3);
    expect(mods.has('presencial')).toBe(true);
    expect(mods.has('online')).toBe(true);
    expect(mods.has('hibrido')).toBe(true);
  });
});
