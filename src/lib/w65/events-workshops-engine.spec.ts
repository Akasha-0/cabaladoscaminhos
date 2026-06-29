// ============================================================================
// W65 — EVENTS + WORKSHOPS ENGINE — TEST SUITE
// Self-running harness: registers describe/it/expect on globalThis so the
// file works as both vitest module AND as a standalone `node --experimental-strip-types` script.
// ============================================================================

declare const process: {
  env: Record<string, string | undefined>;
  argv: string[];
  exitCode?: number;
  stdout: { write(s: string): boolean };
  exit(code?: number): never;
};

// ---- self-running harness ----------------------------------------------------
type TestFn = () => void | Promise<void>;
interface Case { name: string; fn: () => void | Promise<void>; }
interface Suite {
  name: string;
  children: Suite[];
  cases: Case[];
}

const suites: Suite[] = [];
let currentSuite: Suite | null = null;
const record: { suite: string; name: string; ok: boolean; err: string | null }[] = [];

const describeFn = (name: string, fn: TestFn): void => {
  const parent = currentSuite;
  const suite: Suite = { name, children: [], cases: [] };
  if (parent) parent.children.push(suite);
  else suites.push(suite);
  currentSuite = suite;
  try { void fn(); } finally { currentSuite = parent; }
};

const itFn = (testName: string, testFn: TestFn, timeoutMs = 5000): void => {
  if (!currentSuite) throw new Error('it() must be called inside describe()');
  const wrapped = async (): Promise<void> => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const t = new Promise<void>((_, rej) => {
      timer = setTimeout(() => rej(new Error(`Timeout: ${testName}`)), timeoutMs);
    });
    try { await Promise.race([Promise.resolve(testFn()), t]); }
    finally { if (timer) clearTimeout(timer); }
  };
  currentSuite.cases.push({ name: testName, fn: wrapped });
};

interface Expect {
  toBe: (v: unknown) => void;
  toEqual: (v: unknown) => void;
  toBeTruthy: () => void;
  toBeFalsy: () => void;
  toContain: (v: string) => void;
  toBeGreaterThan: (v: number) => void;
  toBeGreaterThanOrEqual: (v: number) => void;
  toBeLessThan: (v: number) => void;
  toMatch: (re: RegExp) => void;
  toThrow: (msg?: string | RegExp) => void;
  not: { toBe: (v: unknown) => void; toEqual: (v: unknown) => void; toBeTruthy: () => void; toBeFalsy: () => void; toContain: (v: string) => void };
}

const expectFn = (actual: unknown): Expect => {
  const e: Expect = {
    toBe: (v) => { if (actual !== v) throw new Error(`toBe: actual=${String(actual)} expected=${String(v)}`); },
    toEqual: (v) => { if (JSON.stringify(actual) !== JSON.stringify(v)) throw new Error(`toEqual mismatch`); },
    toBeTruthy: () => { if (!actual) throw new Error(`expected truthy, got ${String(actual)}`); },
    toBeFalsy: () => { if (actual) throw new Error(`expected falsy, got ${String(actual)}`); },
    toContain: (v) => {
      if (typeof actual === 'string') {
        if (!actual.includes(String(v))) throw new Error(`string not contains: ${String(v)}`);
        return;
      }
      if (Array.isArray(actual)) {
        if (!actual.includes(v)) throw new Error(`array not contains: ${String(v)} (have ${JSON.stringify(actual)})`);
        return;
      }
      throw new Error(`toContain not supported on ${typeof actual}`);
    },
    toBeGreaterThan: (v) => { if (typeof actual !== 'number' || actual <= v) throw new Error(`not > ${v}`); },
    toBeGreaterThanOrEqual: (v) => { if (typeof actual !== 'number' || actual < v) throw new Error(`not >= ${v}`); },
    toBeLessThan: (v) => { if (typeof actual !== 'number' || actual >= v) throw new Error(`not < ${v}`); },
    toMatch: (re) => { if (typeof actual !== 'string' || !re.test(actual)) throw new Error(`not match: ${re}`); },
    toThrow: (msg) => {
      if (typeof actual !== 'function') throw new Error('toThrow requires a function');
      let caught: unknown = null;
      try { (actual as () => unknown)(); } catch (e) { caught = e; }
      if (!caught) throw new Error('did not throw');
      if (msg !== undefined) {
        const err = caught as Error;
        const text = (err && err.message) || String(caught);
        if (msg instanceof RegExp) { if (!msg.test(text)) throw new Error(`thrown message '${text}' does not match ${msg}`); }
        else if (!text.includes(msg)) throw new Error(`thrown message '${text}' does not include '${msg}'`);
      }
    },
    not: {
      toBe: (v) => { if (actual === v) throw new Error(`not.toBe: same as ${String(v)}`); },
      toEqual: (v) => { if (JSON.stringify(actual) === JSON.stringify(v)) throw new Error(`not.toEqual`); },
      toBeTruthy: () => { if (actual) throw new Error(`expected falsy, got ${String(actual)}`); },
      toBeFalsy: () => { if (!actual) throw new Error(`expected truthy, got ${String(actual)}`); },
      toContain: (v) => {
        if (typeof actual === 'string' && actual.includes(String(v))) throw new Error(`contains ${String(v)}`);
        if (Array.isArray(actual) && actual.includes(v)) throw new Error(`array contains ${String(v)}`);
      },
    },
  };
  return e;
};

// Global registration for vitest compatibility (declaration only; vitest
// provides its own globals at module load time). At standalone run time we
// re-bind locally.
(globalThis as Record<string, unknown>).describe = describeFn;
(globalThis as Record<string, unknown>).it = itFn;
(globalThis as Record<string, unknown>).expect = expectFn;

const describe = describeFn as unknown as (name: string, fn: () => void) => void;
const it = itFn as unknown as (name: string, fn: () => void | Promise<void>, timeoutMs?: number) => void;
const expect = expectFn as unknown as (actual: unknown) => Expect;

// ============================================================================
// 1) IMPORTS
// ============================================================================
import {
  EVENT_TYPES,
  EVENT_TRADITIONS,
  RSVP_STATES,
  WORKSHOP_TIERS,
  LIVESTREAM_PROVIDERS,
  EVENT_STATUSES,
  FORBIDDEN_RSVP_TRANSITIONS,
  FLOOR_BY_TRADITION,
  SACRED_CIGANO_CARDS,
  SACRED_ORIXAS,
  SACRED_IFA_ODUS,
  SACRED_ASTRO_SIGNS,
  SACRED_SEFIROT,
  SACRED_CHAKRAS,
  SACRED_UMBANDA_LINHAS,
  ALL_SACRED_SYMBOLS,
  createEvent,
  rsvp,
  listByDate,
  attachLivestream,
  tierPricing,
  auditEventCoverage,
  validateEvent,
  isEventType,
  isEventTradition,
  isRsvpState,
  isWorkshopTier,
  isEventStatus,
  isLivestreamProvider,
  isEventRecord,
  sacredSymbolsForTradition,
  sacredFloorForTradition,
  isSacredSymbolForTradition,
  formatEventFull,
  formatEventCalendar,
  formatRsvpSummary,
  formatLivestreamEmbed,
  EventsEngineError,
  InvalidEventInputError,
  InvalidRsvpTransitionError,
  UnknownTraditionError,
  CapacityExceededError,
  EventNotFoundError,
  coverageAtInit,
  __ALL_EXPORTS,
} from './events-workshops-engine.ts';

// ============================================================================
// 2) TEST FIXTURES
// ============================================================================

// ============================================================================
// 2) TEST FIXTURES
// ============================================================================

const makeCtx = (): {
  ctx: Parameters<typeof createEvent>[1];
  store: Map<string, unknown>;
  rsvpStore: Map<string, unknown[]>;
} => {
  const store = new Map<string, unknown>();
  const rsvpStore = new Map<string, unknown[]>();
  return {
    ctx: {
      store: store as unknown as Map<string, never>,
      rsvpStore: rsvpStore as unknown as Map<string, never[]>,
      chainSecret: 'test-secret-w65',
      now: () => '2026-07-01T10:00:00.000Z',
    },
    store: store as unknown as Map<string, unknown>,
    rsvpStore: rsvpStore as unknown as Map<string, unknown[]>,
  };
};

const validEventInput = (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
  title: 'Gira de Ciganos — Abertura do Ano',
  description: 'Cerimônia de abertura do ciclo 2026 com benzimento e pemba.',
  type: 'CEREMONY',
  tradition: 'CIGANO',
  hostId: 'user-host-001',
  startAt: '2026-07-01T19:00:00-03:00',
  endAt: '2026-07-01T22:00:00-03:00',
  tier: 'INTERMEDIATE',
  priceBRLCents: 15000,
  capacity: 50,
  isPublic: true,
  sacredTags: ['Cigano', 'Cigana', 'Cavaleiro', 'Estrela'],
  ...overrides,
});

// ============================================================================
// 3) TESTS — constants coverage
// ============================================================================

describe('constants: enum coverage', () => {
  it('EVENT_TYPES has 5 distinct types', () => {
    expect(EVENT_TYPES.length).toBe(5);
    expect(new Set(EVENT_TYPES).size).toBe(EVENT_TYPES.length);
  });
  it('EVENT_TRADITIONS has 7 traditions', () => {
    expect(EVENT_TRADITIONS.length).toBe(7);
    expect(EVENT_TRADITIONS).toContain('CIGANO');
    expect(EVENT_TRADITIONS).toContain('IFA');
    expect(EVENT_TRADITIONS).toContain('CANDOMBLE');
    expect(EVENT_TRADITIONS).toContain('UMBANDA');
    expect(EVENT_TRADITIONS).toContain('TANTRA');
    expect(EVENT_TRADITIONS).toContain('ASTROLOGIA');
    expect(EVENT_TRADITIONS).toContain('CABALA');
  });
  it('RSVP_STATES has 4 distinct states', () => {
    expect(RSVP_STATES.length).toBe(4);
    expect(new Set(RSVP_STATES).size).toBe(4);
    expect(RSVP_STATES).toContain('pending');
    expect(RSVP_STATES).toContain('confirmed');
    expect(RSVP_STATES).toContain('waitlist');
    expect(RSVP_STATES).toContain('cancelled');
  });
  it('WORKSHOP_TIERS has 4 tiers', () => {
    expect(WORKSHOP_TIERS.length).toBe(4);
  });
  it('LIVESTREAM_PROVIDERS has 4 providers', () => {
    expect(LIVESTREAM_PROVIDERS.length).toBe(4);
  });
  it('EVENT_STATUSES has 5 statuses', () => {
    expect(EVENT_STATUSES.length).toBe(5);
  });
});

describe('constants: sacred-tag coverage (cycle 64 split-catalog rule)', () => {
  it('CIGANO >= 36 cards (Cigano Ramiro deck)', () => {
    expect(SACRED_CIGANO_CARDS.length >= 36).toBe(true);
    expect(FLOOR_BY_TRADITION.CIGANO).toBe(36);
  });
  it('CANDOMBLE = 16 orixás', () => {
    expect(SACRED_ORIXAS.length >= 16).toBe(true);
    expect(FLOOR_BY_TRADITION.CANDOMBLE).toBe(16);
  });
  it('IFA = 16 odus principais', () => {
    expect(SACRED_IFA_ODUS.length >= 16).toBe(true);
    expect(FLOOR_BY_TRADITION.IFA).toBe(16);
  });
  it('ASTROLOGIA = 12 signs', () => {
    expect(SACRED_ASTRO_SIGNS.length >= 12).toBe(true);
  });
  it('CABALA = 10 sefirot', () => {
    expect(SACRED_SEFIROT.length >= 10).toBe(true);
  });
  it('TANTRA = 7 chakras (audit floor)', () => {
    expect(SACRED_CHAKRAS.length >= 7).toBe(true);
    expect(FLOOR_BY_TRADITION.TANTRA).toBe(7);
  });
  it('UMBANDA = 7 linhas', () => {
    expect(SACRED_UMBANDA_LINHAS.length >= 7).toBe(true);
    expect(FLOOR_BY_TRADITION.UMBANDA).toBe(7);
  });
  it('ALL_SACRED_SYMBOLS total >= 104', () => {
    expect(ALL_SACRED_SYMBOLS.length >= 104).toBe(true);
  });
  it('Cigano includes key cards (Cavaleiro, Cigano, Cigana, Estrela)', () => {
    expect(SACRED_CIGANO_CARDS).toContain('Cavaleiro');
    expect(SACRED_CIGANO_CARDS).toContain('Cigano');
    expect(SACRED_CIGANO_CARDS).toContain('Cigana');
    expect(SACRED_CIGANO_CARDS).toContain('Estrela');
  });
});

// ============================================================================
// 4) TESTS — type guards
// ============================================================================

describe('type guards', () => {
  it('isEventType accepts valid types', () => {
    expect(isEventType('CEREMONY')).toBe(true);
    expect(isEventType('WORKSHOP')).toBe(true);
    expect(isEventType('BOGUS')).toBeFalsy();
  });
  it('isEventTradition boundary check (no .includes false-positives)', () => {
    expect(isEventTradition('CIGANO')).toBe(true);
    expect(isEventTradition('CIGANO_RAMIRO')).toBeFalsy(); // substring, not boundary
    expect(isEventTradition('IFA')).toBe(true);
    expect(isEventTradition('Foo')).toBeFalsy();
  });
  it('isRsvpState', () => {
    expect(isRsvpState('confirmed')).toBe(true);
    expect(isRsvpState('pending')).toBe(true);
    expect(isRsvpState('gone')).toBeFalsy();
  });
  it('isWorkshopTier', () => {
    expect(isWorkshopTier('BASIC')).toBe(true);
    expect(isWorkshopTier('MASTER')).toBe(true);
    expect(isWorkshopTier('GURU')).toBeFalsy();
  });
  it('isEventStatus, isLivestreamProvider, isEventRecord', () => {
    expect(isEventStatus('published')).toBe(true);
    expect(isEventStatus('pending')).toBeFalsy();
    expect(isLivestreamProvider('youtube')).toBe(true);
    expect(isLivestreamProvider('zoom')).toBeFalsy();
    expect(isEventRecord({ id: 'x' })).toBe(true);
    expect(isEventRecord(null)).toBeFalsy();
  });
});

// ============================================================================
// 5) TESTS — tierPricing (5)
// ============================================================================

describe('tierPricing', () => {
  it('BASIC = 3000-10000 cents', () => {
    const r = tierPricing('BASIC');
    expect(r.minBRL).toBe(3000);
    expect(r.maxBRL).toBe(10000);
  });
  it('INTERMEDIATE = 10000-30000 cents', () => {
    const r = tierPricing('INTERMEDIATE');
    expect(r.minBRL).toBe(10000);
    expect(r.maxBRL).toBe(30000);
  });
  it('ADVANCED = 30000-100000 cents', () => {
    const r = tierPricing('ADVANCED');
    expect(r.minBRL).toBe(30000);
    expect(r.maxBRL).toBe(100000);
  });
  it('MASTER = 100000+ (open max)', () => {
    const r = tierPricing('MASTER');
    expect(r.minBRL).toBe(100000);
    expect(r.maxBRL >= 100000).toBe(true);
    expect(r.maxBRL <= 1e12).toBe(true);
  });
  it('all tiers carry a label + description', () => {
    for (const t of WORKSHOP_TIERS) {
      const r = tierPricing(t);
      expect(r.label.length > 0).toBe(true);
      expect(r.description.length > 0).toBe(true);
    }
  });
});

// ============================================================================
// 6) TESTS — sacredSymbolForTradition
// ============================================================================

describe('sacredSymbolForTradition lookups', () => {
  it('CIGANO matches Cavaleiro, Cigano, Cigana', () => {
    expect(isSacredSymbolForTradition('Cavaleiro', 'CIGANO')).toBe(true);
    expect(isSacredSymbolForTradition('cigano', 'CIGANO')).toBe(true); // case-insensitive
    expect(isSacredSymbolForTradition('Exu', 'CIGANO')).toBeFalsy(); // wrong tradition
  });
  it('CANDOMBLE (orixás) matches Exu, Ogum, Oxum', () => {
    expect(isSacredSymbolForTradition('Exu', 'CANDOMBLE')).toBe(true);
    expect(isSacredSymbolForTradition('Ogum', 'CANDOMBLE')).toBe(true);
  });
  it('IFA odus match Eji-Ogbe, Oyeku-Meji', () => {
    expect(isSacredSymbolForTradition('Eji-Ogbe', 'IFA')).toBe(true);
    expect(isSacredSymbolForTradition('Oyeku-Meji', 'IFA')).toBe(true);
  });
  it('CABALA sefirot match Keter, Tiferet', () => {
    expect(isSacredSymbolForTradition('Keter', 'CABALA')).toBe(true);
    expect(isSacredSymbolForTradition('Tiferet', 'CABALA')).toBe(true);
  });
  it('TANTRA chakras match Muladhara, Sahasrara', () => {
    expect(isSacredSymbolForTradition('Muladhara', 'TANTRA')).toBe(true);
    expect(isSacredSymbolForTradition('Sahasrara', 'TANTRA')).toBe(true);
  });
  it('ASTROLOGIA signs match Leao, Escorpiao', () => {
    expect(isSacredSymbolForTradition('Leao', 'ASTROLOGIA')).toBe(true);
    expect(isSacredSymbolForTradition('Escorpiao', 'ASTROLOGIA')).toBe(true);
  });
  it('UMBANDA linhas match Caboclos, Exus, Pomba-Gira', () => {
    expect(isSacredSymbolForTradition('Caboclos', 'UMBANDA')).toBe(true);
    expect(isSacredSymbolForTradition('Pomba-Gira', 'UMBANDA')).toBe(true);
  });
  it('sacredFloorForTradition per-tradition floors', () => {
    expect(sacredFloorForTradition('CIGANO')).toBe(36);
    expect(sacredFloorForTradition('TANTRA')).toBe(7);
  });
  it('sacredSymbolsForTradition returns correct catalog', () => {
    expect(sacredSymbolsForTradition('CABALA').length).toBe(10);
    expect(sacredSymbolsForTradition('ASTROLOGIA').length).toBe(12);
  });
});

// ============================================================================
// 7) TESTS — createEvent
// ============================================================================

describe('createEvent', () => {
  it('creates a valid event with all fields populated', async () => {
    const { ctx } = makeCtx();
    const e = await createEvent(validEventInput() as never, ctx as never);
    expect(e.id.length > 0).toBe(true);
    expect(e.chainId.length).toBe(32);
    expect(e.title).toBe('Gira de Ciganos — Abertura do Ano');
    expect(e.tradition).toBe('CIGANO');
    expect(e.durationMin).toBe(180);
    expect(e.status).toBe('published');
    expect(e.sacredTags).toContain('Cigano');
    expect(e.sacredTags).toContain('Cavaleiro');
    expect(e.livestream).toBe(null);
    expect(e.rsvpCounts.pending).toBe(0);
    expect(e.rsvpCounts.confirmed).toBe(0);
    expect(e.createdAt.length).toBe(24);
  });
  it('rejects empty title', async () => {
    const { ctx } = makeCtx();
    let err: unknown = null;
    try { await createEvent(validEventInput({ title: '' }) as never, ctx as never); }
    catch (e) { err = e; }
    expect(err instanceof InvalidEventInputError).toBe(true);
  });
  it('rejects invalid tradition', async () => {
    const { ctx } = makeCtx();
    let err: unknown = null;
    try { await createEvent(validEventInput({ tradition: 'BOGUS' }) as never, ctx as never); }
    catch (e) { err = e; }
    expect(err instanceof InvalidEventInputError).toBe(true);
  });
  it('rejects bad ISO date', async () => {
    const { ctx } = makeCtx();
    let err: unknown = null;
    try { await createEvent(validEventInput({ startAt: 'not-a-date' }) as never, ctx as never); }
    catch (e) { err = e; }
    expect(err instanceof InvalidEventInputError).toBe(true);
  });
  it('rejects end before start', async () => {
    const { ctx } = makeCtx();
    let err: unknown = null;
    try { await createEvent(validEventInput({
      startAt: '2026-07-01T20:00:00-03:00',
      endAt: '2026-07-01T18:00:00-03:00',
    }) as never, ctx as never); }
    catch (e) { err = e; }
    expect(err instanceof InvalidEventInputError).toBe(true);
  });
  it('rejects negative price', async () => {
    const { ctx } = makeCtx();
    let err: unknown = null;
    try { await createEvent(validEventInput({ priceBRLCents: -100 }) as never, ctx as never); }
    catch (e) { err = e; }
    expect(err instanceof InvalidEventInputError).toBe(true);
  });
  it('rejects price out of tier bounds', async () => {
    const { ctx } = makeCtx();
    let err: unknown = null;
    try { await createEvent(validEventInput({
      tier: 'BASIC',
      priceBRLCents: 50000, // > max 10000 for BASIC
    }) as never, ctx as never); }
    catch (e) { err = e; }
    expect(err instanceof InvalidEventInputError).toBe(true);
  });
  it('allows MASTER tier price above 100000', async () => {
    const { ctx } = makeCtx();
    const e = await createEvent(validEventInput({
      tier: 'MASTER',
      priceBRLCents: 500000,
      type: 'MENTORSHIP_SESSION',
    }) as never, ctx as never);
    expect(e.tier).toBe('MASTER');
    expect(e.priceBRLCents).toBe(500000);
  });
  it('normalizes sacred tags (dedupe + trim)', async () => {
    const { ctx } = makeCtx();
    const e = await createEvent(validEventInput({
      sacredTags: ['  Cigano  ', 'Cigano', 'Cigana', 'Cavaleiro'],
    }) as never, ctx as never);
    expect(e.sacredTags.length).toBe(3);
    expect(e.sacredTags).toContain('Cigano');
  });
  it('default timezone is America/Sao_Paulo (BRT)', async () => {
    const { ctx } = makeCtx();
    const e = await createEvent(validEventInput() as never, ctx as never);
    expect(e.timezone).toBe('America/Sao_Paulo');
  });
});

// ============================================================================
// 8) TESTS — rsvp state machine
// ============================================================================

describe('rsvp state machine', () => {
  it('creates a pending RSVP for a new user', async () => {
    const { ctx } = makeCtx();
    const e = await createEvent(validEventInput() as never, ctx as never);
    const r = rsvp(e.id, 'user-a', 'BASIC', 'pending', ctx as never);
    expect(r.ok).toBe(true);
    expect(r.previousState).toBe(null);
    expect(r.newState).toBe('pending');
    expect(r.entry !== null).toBe(true);
  });
  it('pending → confirmed', async () => {
    const { ctx } = makeCtx();
    const e = await createEvent(validEventInput() as never, ctx as never);
    rsvp(e.id, 'user-a', 'BASIC', 'pending', ctx as never);
    const r = rsvp(e.id, 'user-a', 'BASIC', 'confirmed', ctx as never);
    expect(r.ok).toBe(true);
    expect(r.previousState).toBe('pending');
    expect(r.newState).toBe('confirmed');
  });
  it('confirmed → cancelled (allowed)', async () => {
    const { ctx } = makeCtx();
    const e = await createEvent(validEventInput() as never, ctx as never);
    rsvp(e.id, 'user-a', 'BASIC', 'pending', ctx as never);
    rsvp(e.id, 'user-a', 'BASIC', 'confirmed', ctx as never);
    const r = rsvp(e.id, 'user-a', 'BASIC', 'cancelled', ctx as never);
    expect(r.ok).toBe(true);
    expect(r.newState).toBe('cancelled');
  });
  it('cancelled → pending (reopen) is allowed', async () => {
    const { ctx } = makeCtx();
    const e = await createEvent(validEventInput() as never, ctx as never);
    rsvp(e.id, 'user-a', 'BASIC', 'pending', ctx as never);
    rsvp(e.id, 'user-a', 'BASIC', 'cancelled', ctx as never);
    const r = rsvp(e.id, 'user-a', 'BASIC', 'pending', ctx as never);
    expect(r.ok).toBe(true);
    expect(r.newState).toBe('pending');
  });
  it('over capacity auto-waitlists', async () => {
    const { ctx } = makeCtx();
    const e = await createEvent(validEventInput({ capacity: 1 }) as never, ctx as never);
    const r1 = rsvp(e.id, 'user-a', 'BASIC', 'confirmed', ctx as never);
    expect(r1.ok).toBe(true);
    expect(r1.newState).toBe('confirmed');
    const r2 = rsvp(e.id, 'user-b', 'BASIC', 'confirmed', ctx as never);
    expect(r2.ok).toBe(true);
    expect(r2.newState).toBe('waitlist');
  });
  it('rejects unknown eventId', async () => {
    const { ctx } = makeCtx();
    const r = rsvp('evt-DOES-NOT-EXIST', 'user-a', 'BASIC', 'confirmed', ctx as never);
    expect(r.ok).toBeFalsy();
    expect(r.errors[0]).toContain('EVENT_NOT_FOUND');
  });
  it('rejects bad tier', () => {
    const { ctx } = makeCtx();
    const r = rsvp('evt-x', 'user-a', 'GURU' as never, 'confirmed', ctx as never);
    expect(r.ok).toBeFalsy();
    expect(r.errors.length > 0).toBe(true);
  });
  it('rejects bad rsvp state', () => {
    const { ctx } = makeCtx();
    const r = rsvp('evt-x', 'user-a', 'BASIC', 'gone' as never, ctx as never);
    expect(r.ok).toBeFalsy();
  });
  it('updates rsvpCounts.confirmed after confirm', async () => {
    const { ctx } = makeCtx();
    const e = await createEvent(validEventInput() as never, ctx as never);
    rsvp(e.id, 'user-a', 'BASIC', 'confirmed', ctx as never);
    expect(e.rsvpCounts.confirmed).toBe(1);
  });
});

// ============================================================================
// 9) TESTS — listByDate (calendar query)
// ============================================================================

describe('listByDate', () => {
  it('filters by date range', async () => {
    const { ctx } = makeCtx();
    await createEvent(validEventInput({
      startAt: '2026-07-01T19:00:00-03:00',
      endAt: '2026-07-01T22:00:00-03:00',
    }) as never, ctx as never);
    await createEvent(validEventInput({
      startAt: '2026-08-01T19:00:00-03:00',
      endAt: '2026-08-01T22:00:00-03:00',
    }) as never, ctx as never);
    const r = listByDate(
      { from: '2026-07-01T00:00:00-03:00', to: '2026-07-31T23:59:59-03:00' },
      {},
      ctx as never,
    );
    expect(r.length).toBe(1);
    expect(r[0].startAt).toContain('2026-07-01');
  });
  it('filters by tradition + type', async () => {
    const { ctx } = makeCtx();
    await createEvent(validEventInput() as never, ctx as never);
    await createEvent(validEventInput({
      title: 'Workshop de Astrologia',
      type: 'WORKSHOP',
      tradition: 'ASTROLOGIA',
      sacredTags: ['Leao'],
      priceBRLCents: 25000,
    }) as never, ctx as never);
    const r = listByDate(
      { from: '2026-01-01T00:00:00-03:00', to: '2026-12-31T23:59:59-03:00' },
      { type: 'WORKSHOP', tradition: 'ASTROLOGIA' },
      ctx as never,
    );
    expect(r.length).toBe(1);
    expect(r[0].type).toBe('WORKSHOP');
    expect(r[0].tradition).toBe('ASTROLOGIA');
  });
  it('filters by sacredTag (case-insensitive)', async () => {
    const { ctx } = makeCtx();
    await createEvent(validEventInput() as never, ctx as never);
    await createEvent(validEventInput({
      title: 'Gira de Orixas',
      tradition: 'CANDOMBLE',
      type: 'CEREMONY',
      sacredTags: ['Exu', 'Ogum'],
    }) as never, ctx as never);
    const r = listByDate(
      { from: '2026-01-01', to: '2026-12-31' },
      { sacredTag: 'exu' },
      ctx as never,
    );
    expect(r.length).toBe(1);
    expect(r[0].tradition).toBe('CANDOMBLE');
  });
  it('filters by hasLivestream=false excludes attached', async () => {
    const { ctx } = makeCtx();
    const e = await createEvent(validEventInput() as never, ctx as never);
    await createEvent(validEventInput({ title: 'B sem live', sacredTags: ['Cavaleiro'] }) as never, ctx as never);
    attachLivestream(e.id, { provider: 'youtube', url: 'https://youtu.be/live123' }, ctx as never);
    const r = listByDate(
      { from: '2026-01-01', to: '2026-12-31' },
      { hasLivestream: false },
      ctx as never,
    );
    expect(r.length).toBe(1);
    expect(r[0].livestream).toBe(null);
  });
  it('returns empty for bad date range', async () => {
    const { ctx } = makeCtx();
    await createEvent(validEventInput() as never, ctx as never);
    const r = listByDate(
      { from: 'broken', to: 'also broken' },
      {},
      ctx as never,
    );
    expect(r.length).toBe(0);
  });
  it('sorts results by startAt ascending', async () => {
    const { ctx } = makeCtx();
    await createEvent(validEventInput({
      title: 'Mid-month',
      startAt: '2026-07-15T19:00:00-03:00',
      endAt: '2026-07-15T22:00:00-03:00',
    }) as never, ctx as never);
    await createEvent(validEventInput({
      title: 'Start',
      startAt: '2026-07-01T19:00:00-03:00',
      endAt: '2026-07-01T22:00:00-03:00',
    }) as never, ctx as never);
    const r = listByDate(
      { from: '2026-07-01', to: '2026-07-31' },
      {},
      ctx as never,
    );
    expect(r.length).toBe(2);
    expect(r[0].title).toBe('Start');
    expect(r[1].title).toBe('Mid-month');
  });
});

// ============================================================================
// 10) TESTS — attachLivestream
// ============================================================================

describe('attachLivestream', () => {
  it('attaches a youtube livestream', async () => {
    const { ctx } = makeCtx();
    const e = await createEvent(validEventInput() as never, ctx as never);
    const out = attachLivestream(e.id, {
      provider: 'youtube',
      url: 'https://youtu.be/live-xyz',
      embedUrl: 'https://www.youtube.com/embed/live-xyz',
      caption: 'Transmissão principal',
    }, ctx as never);
    expect(out.livestream !== null).toBe(true);
    expect(out.livestream!.provider).toBe('youtube');
    expect(out.livestream!.embedUrl).toBe('https://www.youtube.com/embed/live-xyz');
    expect(out.livestream!.caption).toBe('Transmissão principal');
  });
  it('attaches twilio', async () => {
    const { ctx } = makeCtx();
    const e = await createEvent(validEventInput() as never, ctx as never);
    const out = attachLivestream(e.id, {
      provider: 'twilio',
      url: 'wss://video.twilio.com/room/abc',
    }, ctx as never);
    expect(out.livestream!.provider).toBe('twilio');
    expect(out.livestream!.url).toBe('wss://video.twilio.com/room/abc');
    expect(out.livestream!.embedUrl).toBe(null);
  });
  it('attaches 100ms', async () => {
    const { ctx } = makeCtx();
    const e = await createEvent(validEventInput() as never, ctx as never);
    const out = attachLivestream(e.id, {
      provider: '100ms',
      url: 'https://100ms.example/room/xyz',
      startsAtOffset: -10,
    }, ctx as never);
    expect(out.livestream!.provider).toBe('100ms');
    expect(out.livestream!.startsAtOffset).toBe(-10);
  });
  it('rejects bad provider', async () => {
    const { ctx } = makeCtx();
    const e = await createEvent(validEventInput() as never, ctx as never);
    let err: unknown = null;
    try {
      attachLivestream(e.id, { provider: 'facebook' as never, url: 'x' }, ctx as never);
    } catch (ex) { err = ex; }
    expect(err instanceof InvalidEventInputError).toBe(true);
  });
  it('rejects empty url', async () => {
    const { ctx } = makeCtx();
    const e = await createEvent(validEventInput() as never, ctx as never);
    let err: unknown = null;
    try { attachLivestream(e.id, { provider: 'youtube', url: '' }, ctx as never); }
    catch (ex) { err = ex; }
    expect(err instanceof InvalidEventInputError).toBe(true);
  });
  it('rejects unknown eventId', async () => {
    const { ctx } = makeCtx();
    let err: unknown = null;
    try { attachLivestream('evt-DOES-NOT-EXIST', { provider: 'youtube', url: 'x' }, ctx as never); }
    catch (ex) { err = ex; }
    expect(err instanceof EventNotFoundError).toBe(true);
  });
  it('replaces existing livestream', async () => {
    const { ctx } = makeCtx();
    const e = await createEvent(validEventInput() as never, ctx as never);
    attachLivestream(e.id, { provider: 'youtube', url: 'a' }, ctx as never);
    const out = attachLivestream(e.id, { provider: 'twilio', url: 'b' }, ctx as never);
    expect(out.livestream!.provider).toBe('twilio');
  });
});

// ============================================================================
// 11) TESTS — validateEvent (never-throws)
// ============================================================================

describe('validateEvent (never-throws)', () => {
  it('returns ok=true for valid event', async () => {
    const { ctx } = makeCtx();
    const e = await createEvent(validEventInput() as never, ctx as never);
    const r = validateEvent(e);
    expect(r.ok).toBe(true);
    expect(r.errors.length).toBe(0);
  });
  it('returns ok=false for null', () => {
    const r = validateEvent(null as never);
    expect(r.ok).toBeFalsy();
    expect(r.errors.length > 0).toBe(true);
  });
  it('returns ok=false for missing id', async () => {
    const { ctx } = makeCtx();
    const e = await createEvent(validEventInput() as never, ctx as never);
    const r = validateEvent({ ...e, id: '' });
    expect(r.ok).toBeFalsy();
    expect(r.errors.some((m) => m.includes('id'))).toBe(true);
  });
  it('does not throw on garbage input', () => {
    let didThrow = false;
    try { validateEvent({} as never); } catch { didThrow = true; }
    expect(didThrow).toBeFalsy();
  });
  it('flags invalid status enum', async () => {
    const { ctx } = makeCtx();
    const e = await createEvent(validEventInput() as never, ctx as never);
    const r = validateEvent({ ...e, status: 'on-fire' as never });
    expect(r.ok).toBeFalsy();
    expect(r.errors.some((m) => m.includes('status'))).toBe(true);
  });
  it('flags invalid livestream provider', async () => {
    const { ctx } = makeCtx();
    const e = await createEvent(validEventInput() as never, ctx as never);
    attachLivestream(e.id, { provider: 'youtube', url: 'https://youtu.be/x' }, ctx as never);
    const r = validateEvent({
      ...e,
      livestream: {
        provider: 'tiktok' as never,
        url: 'https://tiktok.com/live/x',
        embedUrl: null,
        caption: null,
        startsAtOffset: 5,
        attachedAt: '2026-07-01T10:00:00.000Z',
      },
    });
    expect(r.ok).toBeFalsy();
  });
});

// ============================================================================
// 12) TESTS — auditEventCoverage
// ============================================================================

describe('auditEventCoverage', () => {
  it('default catalog passes isFullCoverage', () => {
    const a = auditEventCoverage();
    expect(a.isFullCoverage).toBe(true);
    expect(a.total >= 104).toBe(true);
    expect(a.byTradition.CIGANO).toBe(36);
    expect(a.byTradition.TANTRA).toBe(7);
    expect(a.byTradition.UMBANDA).toBe(7);
  });
  it('detects shortage in CIGANO', () => {
    const a = auditEventCoverage({
      CIGANO: ['Cavaleiro', 'Cigano'], // only 2
    });
    expect(a.isFullCoverage).toBeFalsy();
    expect(a.byTradition.CIGANO).toBe(2);
  });
  it('detects shortage in TANTRA', () => {
    const a = auditEventCoverage({
      TANTRA: ['Muladhara'], // only 1
    });
    expect(a.isFullCoverage).toBeFalsy();
  });
  it('coverageAtInit passes', () => {
    expect(coverageAtInit.isFullCoverage).toBe(true);
    expect(coverageAtInit.sacredSymbolCount >= 104).toBe(true);
  });
  it('audit exposes byType + floors', () => {
    const a = auditEventCoverage();
    expect(a.byType.WORKSHOP).toBe(0); // no events created here
    expect(a.floorByTradition.CIGANO).toBe(36);
    expect(a.auditFloor).toBe(7);
  });
});

// ============================================================================
// 13) TESTS — formatters
// ============================================================================

describe('formatters', () => {
  it('formatEventFull includes title, type, tradition, datetime', async () => {
    const { ctx } = makeCtx();
    const e = await createEvent(validEventInput() as never, ctx as never);
    const s = formatEventFull(e);
    expect(s).toContain('Gira de Ciganos');
    expect(s).toContain('CEREMONY');
    expect(s).toContain('CIGANO');
    expect(s).toContain('2026-07-01');
  });
  it('formatEventCalendar produces YYYY-MM-DD HH:MM BRT', async () => {
    const { ctx } = makeCtx();
    const e = await createEvent(validEventInput() as never, ctx as never);
    const s = formatEventCalendar(e);
    expect(s).toMatch(/2026-07-01 \d\d:\d\d BRT/);
  });
  it('formatRsvpSummary shows counts', async () => {
    const { ctx } = makeCtx();
    const e = await createEvent(validEventInput() as never, ctx as never);
    rsvp(e.id, 'user-a', 'BASIC', 'confirmed', ctx as never);
    const s = formatRsvpSummary(e);
    expect(s).toContain('confirmed=1');
  });
  it('formatLivestreamEmbed returns null when not attached', async () => {
    const { ctx } = makeCtx();
    const e = await createEvent(validEventInput() as never, ctx as never);
    expect(formatLivestreamEmbed(e)).toBe(null);
  });
  it('formatLivestreamEmbed returns provider + url when attached', async () => {
    const { ctx } = makeCtx();
    const e = await createEvent(validEventInput() as never, ctx as never);
    attachLivestream(e.id, { provider: 'youtube', url: 'https://youtu.be/x' }, ctx as never);
    const s = formatLivestreamEmbed(e);
    expect(s !== null).toBe(true);
    expect(s!).toContain('youtube');
    expect(s!).toContain('https://youtu.be/x');
  });
});

// ============================================================================
// 14) TESTS — error classes
// ============================================================================

describe('error classes', () => {
  it('EventsEngineError exposes code + formatted message', () => {
    const e = new EventsEngineError('TEST', 'sample');
    expect(e.code).toBe('TEST');
    expect(e.message).toContain('TEST');
    expect(e instanceof Error).toBe(true);
  });
  it('InvalidEventInputError extends EventsEngineError with code INVALID_EVENT_INPUT', () => {
    const e = new InvalidEventInputError('bad');
    expect(e.code).toBe('INVALID_EVENT_INPUT');
    expect(e.name).toBe('InvalidEventInputError');
  });
  it('InvalidRsvpTransitionError', () => {
    const e = new InvalidRsvpTransitionError('bad transition');
    expect(e.code).toBe('INVALID_RSVP_TRANSITION');
  });
  it('UnknownTraditionError', () => {
    const e = new UnknownTraditionError('xyz');
    expect(e.code).toBe('UNKNOWN_TRADITION');
  });
  it('CapacityExceededError', () => {
    const e = new CapacityExceededError('over');
    expect(e.code).toBe('CAPACITY_EXCEEDED');
  });
  it('EventNotFoundError', () => {
    const e = new EventNotFoundError('gone');
    expect(e.code).toBe('EVENT_NOT_FOUND');
  });
});

// ============================================================================
// 15) TESTS — __ALL_EXPORTS audit + smoke
// ============================================================================

describe('__ALL_EXPORTS audit', () => {
  it('exposes expected structure', () => {
    expect(__ALL_EXPORTS.sections).toBe(14);
    expect(__ALL_EXPORTS.functions > 10).toBe(true);
    expect(__ALL_EXPORTS.typeGuards).toBe(7);
    expect(__ALL_EXPORTS.errorClasses).toBe(6);
    expect(__ALL_EXPORTS.constants > 10).toBe(true);
  });
  it('CIGANO floor passes (>= 36)', () => {
    expect(__ALL_EXPORTS.audit.sacredPerTradition.CIGANO >= 36).toBe(true);
  });
});

// ============================================================================
// 16) TESTS — forbidden rsvp transitions + integrity
// ============================================================================

describe('integrity + invariants', () => {
  it('FORBIDDEN_RSVP_TRANSITIONS exposes 3 forbidden reasons', () => {
    expect(FORBIDDEN_RSVP_TRANSITIONS.length).toBe(3);
    expect(FORBIDDEN_RSVP_TRANSITIONS).toContain('paid_at_already_set');
    expect(FORBIDDEN_RSVP_TRANSITIONS).toContain('capacity_overflow');
    expect(FORBIDDEN_RSVP_TRANSITIONS).toContain('unknown_transition');
  });
  it('createEvent is idempotent on same host+title+tradition (different ids due to randomSeed)', async () => {
    const { ctx } = makeCtx();
    const e1 = await createEvent(validEventInput() as never, ctx as never);
    const e2 = await createEvent(validEventInput() as never, ctx as never);
    expect(e1.id === e2.id).toBeFalsy();
    expect(e1.chainId === e2.chainId).toBeFalsy();
  });
  it('all sacred tags in event match tradition catalog', async () => {
    const { ctx } = makeCtx();
    const e = await createEvent(validEventInput({
      tradition: 'CIGANO',
      sacredTags: ['Cavaleiro', 'Cigano', 'Cigana'],
    }) as never, ctx as never);
    for (const t of e.sacredTags) {
      expect(isSacredSymbolForTradition(t, e.tradition)).toBe(true);
    }
  });
  it('combined end-to-end flow: create + rsvp + livestream + calendar', async () => {
    const { ctx } = makeCtx();
    const e = await createEvent(validEventInput({
      title: 'Gira de Fim de Ano',
      startAt: '2026-12-31T22:00:00-03:00',
      endAt: '2026-12-31T23:59:00-03:00',
    }) as never, ctx as never);
    rsvp(e.id, 'user-x', 'BASIC', 'confirmed', ctx as never);
    attachLivestream(e.id, { provider: 'youtube', url: 'https://youtu.be/nye' }, ctx as never);
    const cal = listByDate(
      { from: '2026-12-31T00:00:00-03:00', to: '2027-01-02T23:59:59-03:00' },
      { sacredTag: 'Cigano', hasLivestream: true },
      ctx as never,
    );
    expect(cal.length).toBe(1);
    expect(cal[0].livestream!.provider).toBe('youtube');
    expect(cal[0].rsvpCounts.confirmed).toBe(1);
  });
});

// ============================================================================
// 17) TESTS — engine loads (instantiation smoke) + global coverage
// ============================================================================

describe('instantiation smoke', () => {
  it('module loaded with audit coverage >= 104', () => {
    expect(coverageAtInit.sacredSymbolCount >= 104).toBe(true);
    expect(coverageAtInit.isFullCoverage).toBe(true);
  });
  it('all required named exports are present', () => {
    expect(typeof createEvent).toBe('function');
    expect(typeof rsvp).toBe('function');
    expect(typeof listByDate).toBe('function');
    expect(typeof attachLivestream).toBe('function');
    expect(typeof tierPricing).toBe('function');
    expect(typeof auditEventCoverage).toBe('function');
    expect(typeof validateEvent).toBe('function');
  });
});

// ============================================================================
// 18) STANDALONE RUNNER (only invoked when run via `node --experimental-strip-types`)
// ============================================================================

async function runAll(suitesToRun: Suite[], depth = 0): Promise<{ total: number; passed: number; failed: number; }> {
  const out = { total: 0, passed: 0, failed: 0 };
  const isMain = !!(process.argv[1] && process.argv[1].endsWith('.spec.ts'));
  const runStandalone = isMain && !process.env.VITEST;

  for (const s of suitesToRun) {
    if (runStandalone) process.stdout.write(`${'  '.repeat(depth)}▸ ${s.name}\n`);
    for (const c of s.cases) {
      out.total += 1;
      try {
        await c.fn();
        out.passed += 1;
        record.push({ suite: s.name, name: c.name, ok: true, err: null });
        if (runStandalone) process.stdout.write(`  ${'  '.repeat(depth)}✓ ${c.name}\n`);
      } catch (e) {
        out.failed += 1;
        const msg = e instanceof Error ? e.message : String(e);
        record.push({ suite: s.name, name: c.name, ok: false, err: msg });
        if (runStandalone) process.stdout.write(`  ${'  '.repeat(depth)}✗ ${c.name}: ${msg}\n`);
      }
    }
    if (s.children.length > 0) {
      const childResult = await runAll(s.children, depth + 1);
      out.total += childResult.total;
      out.passed += childResult.passed;
      out.failed += childResult.failed;
    }
  }
  return out;
}

async function main(): Promise<void> {
  const isMain = !!(process.argv[1] && process.argv[1].endsWith('.spec.ts'));
  if (!isMain || process.env.VITEST) return;
  const t0 = Date.now();
  process.stdout.write('▸ W65 events-workshops-engine test harness\n');
  const r = await runAll(suites);
  const dt = Date.now() - t0;
  process.stdout.write(`\nResults: ${r.passed}/${r.total} passed (${r.failed} failed) in ${dt}ms\n`);
  process.exitCode = r.failed > 0 ? 1 : 0;
}

void main();
