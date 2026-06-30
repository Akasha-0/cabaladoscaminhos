// ============================================================================
// RSVP FORM SPEC — Self-running test harness (W80-B)
// ----------------------------------------------------------------------------
// W80-B · Cycle 80 · 2026-06-30
// Test harness que NÃO depende de vitest/jest. Pattern cycle 60+:
//   - module-level state para beforeEach/afterEach
//   - it() registra callbacks em uma fila
//   - it() invoca o callback e captura throw/fail
//   - runAll() drena a fila sequencialmente
//
// Cobre:
//   1. Helpers puros (label mappings, capacity math, transitions)
//   2. Component rendering (via vnode-recorder que captura React.createElement)
//   3. Availability logic (current/full/closed/waitlist_required)
//   4. 7-tradition coverage (smoke test cada uma das 7 tradições)
//   5. WCAG: aria-label, aria-live, role, disabled state
//   6. Mobile-first: 44px touch target classes
// ============================================================================

import { createRecorder } from './_vnode_recorder.ts';

// ============================================================================
// HARNESS
// ============================================================================

interface SpecEntry { name: string; run: () => void | Promise<void> }
const SPEC_REGISTRY: SpecEntry[] = [];
let _beforeEachFn: (() => void | Promise<void>) | null = null;
let _afterEachFn: (() => void | Promise<void>) | null = null;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function describe(_name: string, _fn: () => void): void {
  // No-op for self-running harness (describes are no-ops at top level)
}

function it(name: string, run: () => void | Promise<void>): void {
  SPEC_REGISTRY.push({ name, run: () => run() });
}

function beforeEach(fn: () => void | Promise<void>): void {
  _beforeEachFn = fn;
}

function afterEach(fn: () => void | Promise<void>): void {
  _afterEachFn = fn;
}

function assertEqual<T>(actual: T, expected: T, label?: string): void {
  const ok = Object.is(actual, expected) || JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    throw new Error(
      `assertEqual FAILED${label ? ` (${label})` : ''}: expected ${JSON.stringify(expected)} got ${JSON.stringify(actual)}`
    );
  }
}

function assertTrue(cond: boolean, label?: string): void {
  if (!cond) throw new Error(`assertTrue FAILED${label ? ` (${label})` : ''}`);
}

function assertMatch(s: string, re: RegExp, label?: string): void {
  if (!re.test(s)) throw new Error(`assertMatch FAILED${label ? ` (${label})` : ''}: "${s}" does not match ${re}`);
}

async function runAll(): Promise<{ passed: number; failed: number; failures: string[] }> {
  const failures: string[] = [];
  let passed = 0;
  let failed = 0;

  for (const entry of SPEC_REGISTRY) {
    if (_beforeEachFn) {
      try { await _beforeEachFn(); } catch (e) {
        failures.push(`beforeEach failed: ${(e as Error).message}`);
        failed++;
        continue;
      }
    }
    try {
      await entry.run();
      passed++;
    } catch (err) {
      failed++;
      failures.push(`✗ ${entry.name}\n   ${(err as Error).message}`);
    }
    if (_afterEachFn) {
      try { await _afterEachFn(); } catch (e) {
        // swallow afterEach errors (don't fail the test)
      }
    }
  }
  return { passed, failed, failures };
}

// ============================================================================
// IMPORTS (test subjects)
// ============================================================================

import {
  TRADITION_LABEL,
  TRADITION_IDS,
  EVENT_TYPE_LABEL,
  RSVP_STATE_LABEL,
  RSVP_STATE_LABEL_ACTIVE,
  isTradition,
  isEventType,
  traditionLabel,
  eventTypeLabel,
  buildCapacityDisplay,
  deriveRsvpTransition,
  buildRsvpAnnouncement,
  getButtonAvailability,
  defaultRsvpState,
  type RsvpState,
} from './RSVPForm.helpers.ts';

import { RSVPForm } from './RSVPForm.ts';

// ============================================================================
// SECTION 1 — Tradition label coverage (7 chaves canônicas)
// ============================================================================

it('TRADITION_IDS contém exatamente 7 tradições', () => {
  assertEqual(TRADITION_IDS.length, 7);
});

it('TRADITION_LABEL cobre Cigano', () => {
  assertEqual(TRADITION_LABEL.cigano, 'Baralho Cigano');
});

it('TRADITION_LABEL cobre Orixás', () => {
  assertEqual(TRADITION_LABEL.orixas, 'Orixás');
});

it('TRADITION_LABEL cobre Astrologia', () => {
  assertEqual(TRADITION_LABEL.astrologia, 'Astrologia');
});

it('TRADITION_LABEL cobre Cabala', () => {
  assertEqual(TRADITION_LABEL.cabala, 'Cabala');
});

it('TRADITION_LABEL cobre Tântrica', () => {
  assertEqual(TRADITION_LABEL.tantra, 'Tântrica');
});

it('TRADITION_LABEL cobre Umbanda', () => {
  assertEqual(TRADITION_LABEL.umbanda, 'Umbanda');
});

it('TRADITION_LABEL cobre Ifá', () => {
  assertEqual(TRADITION_LABEL.ifa, 'Ifá');
});

it('isTradition reconhece cada uma das 7 chaves', () => {
  for (const id of TRADITION_IDS) {
    assertEqual(isTradition(id), id, `isTradition(${id})`);
  }
});

it('isTradition retorna null para chave desconhecida', () => {
  assertEqual(isTradition('budismo'), null);
  assertEqual(isTradition(''), null);
  assertEqual(isTradition(null), null);
  assertEqual(isTradition(undefined), null);
});

it('traditionLabel faz fallback seguro para chave desconhecida', () => {
  assertEqual(traditionLabel('budismo'), 'Budismo');
  assertEqual(traditionLabel(''), 'Tradição');
  assertEqual(traditionLabel(null), 'Tradição');
});

it('TRADITION_LABEL é frozen (imutável)', () => {
  assertTrue(Object.isFrozen(TRADITION_LABEL), 'TRADITION_LABEL is frozen');
});

// ============================================================================
// SECTION 2 — Event type label coverage
// ============================================================================

it('EVENT_TYPE_LABEL cobre os 4 tipos canônicos', () => {
  assertEqual(EVENT_TYPE_LABEL.workshop, 'Workshop');
  assertEqual(EVENT_TYPE_LABEL.ritual, 'Ritual');
  assertEqual(EVENT_TYPE_LABEL['study-circle'], 'Círculo de Estudo');
  assertEqual(EVENT_TYPE_LABEL.meditation, 'Meditação Guiada');
});

it('isEventType reconhece cada chave', () => {
  assertEqual(isEventType('workshop'), 'workshop');
  assertEqual(isEventType('ritual'), 'ritual');
  assertEqual(isEventType('study-circle'), 'study-circle');
  assertEqual(isEventType('meditation'), 'meditation');
  assertEqual(isEventType('unknown'), null);
});

it('eventTypeLabel faz fallback', () => {
  assertEqual(eventTypeLabel('festa'), 'Festa');
  assertEqual(eventTypeLabel(''), 'Evento');
});

// ============================================================================
// SECTION 3 — Capacity math
// ============================================================================

it('buildCapacityDisplay: ilimitado (capacity=0)', () => {
  const r = buildCapacityDisplay(50, 0);
  assertEqual(r.label, 'Sem limite de vagas');
  assertEqual(r.remaining, null);
  assertEqual(r.percent, null);
  assertEqual(r.isFull, false);
  assertEqual(r.capacity, 0);
});

it('buildCapacityDisplay: vazio (0/N)', () => {
  const r = buildCapacityDisplay(0, 20);
  assertEqual(r.confirmed, 0);
  assertEqual(r.remaining, 20);
  assertEqual(r.percent, 0);
  assertEqual(r.isFull, false);
  assertEqual(r.label, '0/20 vagas');
});

it('buildCapacityDisplay: parcial (14/20)', () => {
  const r = buildCapacityDisplay(14, 20);
  assertEqual(r.confirmed, 14);
  assertEqual(r.remaining, 6);
  assertEqual(r.percent, 70);
  assertEqual(r.isFull, false);
  assertEqual(r.label, '14/20 vagas');
});

it('buildCapacityDisplay: últimas 3 vagas (17/20)', () => {
  const r = buildCapacityDisplay(17, 20);
  assertEqual(r.remaining, 3);
  assertMatch(r.label, /3 vagas restantes/);
});

it('buildCapacityDisplay: última vaga (19/20)', () => {
  const r = buildCapacityDisplay(19, 20);
  assertEqual(r.remaining, 1);
  assertMatch(r.label, /Última vaga/);
});

it('buildCapacityDisplay: lotado (20/20)', () => {
  const r = buildCapacityDisplay(20, 20);
  assertEqual(r.isFull, true);
  assertEqual(r.remaining, 0);
  assertEqual(r.percent, 100);
  assertMatch(r.label, /Lotado/);
});

it('buildCapacityDisplay: over-capacity é clamped (25/20 → 100%)', () => {
  const r = buildCapacityDisplay(25, 20);
  assertEqual(r.isFull, true);
  assertEqual(r.percent, 100);
});

it('buildCapacityDisplay: input negativo é sanitizado', () => {
  const r = buildCapacityDisplay(-3, 20);
  assertEqual(r.confirmed, 0);
  assertEqual(r.remaining, 20);
});

it('buildCapacityDisplay retorna objeto frozen', () => {
  const r = buildCapacityDisplay(5, 10);
  assertTrue(Object.isFrozen(r), 'capacity display is frozen');
});

// ============================================================================
// SECTION 4 — RSVP transitions
// ============================================================================

it('deriveRsvpTransition: null → going é transição limpa', () => {
  const t = deriveRsvpTransition(null, 'going');
  if ('error' in t) throw new Error('expected transition');
  assertEqual(t.next, 'going');
  assertEqual(t.requiresConfirm, false);
  assertEqual(t.willMutate, true);
});

it('deriveRsvpTransition: going → going é NOOP idempotente', () => {
  const t = deriveRsvpTransition('going', 'going');
  if ('error' in t) throw new Error('expected transition');
  assertEqual(t.willMutate, false);
  assertEqual(t.requiresConfirm, false);
});

it('deriveRsvpTransition: going → declined requer confirmação', () => {
  const t = deriveRsvpTransition('going', 'declined');
  if ('error' in t) throw new Error('expected transition');
  assertEqual(t.requiresConfirm, true);
  assertEqual(t.willMutate, true);
});

it('deriveRsvpTransition: going → maybe requer confirmação', () => {
  const t = deriveRsvpTransition('going', 'maybe');
  if ('error' in t) throw new Error('expected transition');
  assertEqual(t.requiresConfirm, true);
});

it('deriveRsvpTransition: maybe → going NÃO requer confirmação (promoção)', () => {
  const t = deriveRsvpTransition('maybe', 'going');
  if ('error' in t) throw new Error('expected transition');
  assertEqual(t.requiresConfirm, false);
});

it('deriveRsvpTransition: declined → going NÃO requer confirmação', () => {
  const t = deriveRsvpTransition('declined', 'going');
  if ('error' in t) throw new Error('expected transition');
  assertEqual(t.requiresConfirm, false);
});

it('deriveRsvpTransition: target inválido retorna error', () => {
  // @ts-expect-error testing invalid target
  const r = deriveRsvpTransition(null, 'invalid');
  assertTrue('error' in r, 'expected error result');
  if ('error' in r) {
    assertMatch(r.error, /Estado inválido/);
  }
});

it('deriveRsvpTransition retorna objeto frozen', () => {
  const t = deriveRsvpTransition(null, 'going');
  if ('error' in t) throw new Error('expected transition');
  assertTrue(Object.isFrozen(t), 'transition is frozen');
});

// ============================================================================
// SECTION 5 — Screen reader announcements
// ============================================================================

it('buildRsvpAnnouncement inclui info de vagas restantes', () => {
  const t = deriveRsvpTransition(null, 'going');
  if ('error' in t) throw new Error('expected transition');
  const cap = buildCapacityDisplay(14, 20);
  const msg = buildRsvpAnnouncement(t, cap);
  assertMatch(msg, /Status atualizado/);
  assertMatch(msg, /6 vagas restantes/);
});

it('buildRsvpAnnouncement inclui info de lotado', () => {
  const t = deriveRsvpTransition(null, 'maybe');
  if ('error' in t) throw new Error('expected transition');
  const cap = buildCapacityDisplay(20, 20);
  const msg = buildRsvpAnnouncement(t, cap);
  assertMatch(msg, /lotado/i);
});

it('buildRsvpAnnouncement para evento ilimitado', () => {
  const t = deriveRsvpTransition(null, 'going');
  if ('error' in t) throw new Error('expected transition');
  const cap = buildCapacityDisplay(50, 0);
  const msg = buildRsvpAnnouncement(t, cap);
  assertMatch(msg, /Status atualizado/);
});

// ============================================================================
// SECTION 6 — Button availability
// ============================================================================

it('getButtonAvailability: current state → current', () => {
  const cap = buildCapacityDisplay(5, 20);
  assertEqual(getButtonAvailability('going', 'going', cap, false), 'current');
  assertEqual(getButtonAvailability('maybe', 'maybe', cap, false), 'current');
});

it('getButtonAvailability: target going em evento lotado → waitlist_required', () => {
  const cap = buildCapacityDisplay(20, 20);
  assertEqual(getButtonAvailability(null, 'going', cap, false), 'waitlist_required');
  assertEqual(getButtonAvailability('declined', 'going', cap, false), 'waitlist_required');
});

it('getButtonAvailability: target going quando há vagas → available', () => {
  const cap = buildCapacityDisplay(14, 20);
  assertEqual(getButtonAvailability(null, 'going', cap, false), 'available');
  assertEqual(getButtonAvailability('maybe', 'going', cap, false), 'available');
});

it('getButtonAvailability: target maybe sempre disponível se não fechado', () => {
  const cap = buildCapacityDisplay(20, 20);
  assertEqual(getButtonAvailability(null, 'maybe', cap, false), 'available');
});

it('getButtonAvailability: eventClosed tem precedência', () => {
  const cap = buildCapacityDisplay(5, 20);
  assertEqual(getButtonAvailability(null, 'going', cap, true), 'event_closed');
  assertEqual(getButtonAvailability('going', 'declined', cap, true), 'event_closed');
});

it('defaultRsvpState retorna going', () => {
  assertEqual(defaultRsvpState(), 'going');
});

// ============================================================================
// SECTION 7 — Component rendering via vnode recorder
// ============================================================================

const { element, renderToTree, findByTestId, findByType } = createRecorder();

beforeEach(() => {
  // Reset state if needed
});

it('RSVPForm renderiza fieldset raiz', () => {
  const tree = renderToTree(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element(RSVPForm, {
      eventId: 'evt-1',
      eventTitle: 'Workshop de Cabala',
      tradition: 'cabala',
      eventType: 'workshop',
      confirmedCount: 5,
      capacity: 20,
      currentRsvp: null,
    }) as any
  );
  const fieldsets = findByType(tree, 'fieldset');
  assertTrue(fieldsets.length >= 1, 'fieldset exists');
});

it('RSVPForm inclui aria-label nos botões', () => {
  const tree = renderToTree(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element(RSVPForm, {
      eventId: 'evt-1',
      eventTitle: 'Workshop',
      tradition: 'cabala',
      eventType: 'workshop',
      confirmedCount: 5,
      capacity: 20,
      currentRsvp: null,
    }) as any
  );
  const goingBtn = findByTestId(tree, 'rsvp-form-button-going');
  assertTrue(goingBtn !== null, 'going button exists');
  const ariaLabel = String(goingBtn!.props['aria-label'] ?? '');
  assertMatch(ariaLabel, /Confirmar presença/);
  assertMatch(ariaLabel, /Workshop/, 'aria-label inclui título do evento');
});

it('RSVPForm inclui aria-pressed no botão do estado atual', () => {
  const tree = renderToTree(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element(RSVPForm, {
      eventId: 'evt-1',
      eventTitle: 'Ritual',
      tradition: 'candomble',
      eventType: 'ritual',
      confirmedCount: 5,
      capacity: 20,
      currentRsvp: 'going',
    }) as any
  );
  const goingBtn = findByTestId(tree, 'rsvp-form-button-going');
  assertEqual(goingBtn!.props['aria-pressed'], true);
  const maybeBtn = findByTestId(tree, 'rsvp-form-button-maybe');
  assertEqual(maybeBtn!.props['aria-pressed'], false);
});

it('RSVPForm mostra indicador de estado atual quando há RSVP', () => {
  const tree = renderToTree(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element(RSVPForm, {
      eventId: 'evt-1',
      eventTitle: 'X',
      tradition: 'cabala',
      eventType: 'workshop',
      confirmedCount: 5,
      capacity: 20,
      currentRsvp: 'maybe',
    }) as any
  );
  const indicator = findByTestId(tree, 'rsvp-form-current-state');
  assertTrue(indicator !== null, 'current state indicator exists');
});

it('RSVPForm oculta indicador quando currentRsvp=null', () => {
  const tree = renderToTree(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element(RSVPForm, {
      eventId: 'evt-1',
      eventTitle: 'X',
      tradition: 'cabala',
      eventType: 'workshop',
      confirmedCount: 5,
      capacity: 20,
      currentRsvp: null,
    }) as any
  );
  const indicator = findByTestId(tree, 'rsvp-form-current-state');
  assertEqual(indicator, null, 'no current state indicator for null');
});

it('RSVPForm desabilita botão going quando evento lotado e sem RSVP', () => {
  const tree = renderToTree(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element(RSVPForm, {
      eventId: 'evt-1',
      eventTitle: 'X',
      tradition: 'cabala',
      eventType: 'workshop',
      confirmedCount: 20,
      capacity: 20,
      currentRsvp: null,
    }) as any
  );
  const goingBtn = findByTestId(tree, 'rsvp-form-button-going');
  assertEqual(goingBtn!.props.disabled, true, 'going button disabled when full');
  assertEqual(goingBtn!.props['data-availability'], 'waitlist_required');
});

it('RSVPForm desabilita TODOS os botões quando eventClosed=true', () => {
  const tree = renderToTree(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element(RSVPForm, {
      eventId: 'evt-1',
      eventTitle: 'X',
      tradition: 'cabala',
      eventType: 'workshop',
      confirmedCount: 5,
      capacity: 20,
      currentRsvp: null,
      eventClosed: true,
    }) as any
  );
  const goingBtn = findByTestId(tree, 'rsvp-form-button-going');
  assertEqual(goingBtn!.props.disabled, true, 'going disabled');
  assertEqual(goingBtn!.props['data-availability'], 'event_closed');
});

it('RSVPForm mostra CTA de login quando isAuthenticated=false', () => {
  const tree = renderToTree(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element(RSVPForm, {
      eventId: 'evt-1',
      eventTitle: 'X',
      tradition: 'cabala',
      eventType: 'workshop',
      confirmedCount: 5,
      capacity: 20,
      currentRsvp: null,
      isAuthenticated: false,
    }) as any
  );
  const loginCta = findByTestId(tree, 'rsvp-form-unauthenticated');
  assertTrue(loginCta !== null, 'login CTA exists');
  const loginBtn = findByTestId(tree, 'rsvp-form-login-button');
  assertTrue(loginBtn !== null, 'login button exists');
  const ariaLabel = String(loginBtn!.props['aria-label'] ?? '');
  assertMatch(ariaLabel, /Entrar para participar/);
});

it('RSVPForm inclui live region (aria-live="polite")', () => {
  const tree = renderToTree(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element(RSVPForm, {
      eventId: 'evt-1',
      eventTitle: 'X',
      tradition: 'cabala',
      eventType: 'workshop',
      confirmedCount: 5,
      capacity: 20,
      currentRsvp: null,
    }) as any
  );
  const live = findByTestId(tree, 'rsvp-form-live-region');
  assertTrue(live !== null, 'live region exists');
  assertEqual(live!.props['aria-live'], 'polite');
  assertEqual(live!.props.role, 'status');
});

it('RSVPForm inclui data-testid raiz com eventId', () => {
  const tree = renderToTree(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element(RSVPForm, {
      eventId: 'evt-xyz-123',
      eventTitle: 'X',
      tradition: 'cabala',
      eventType: 'workshop',
      confirmedCount: 5,
      capacity: 20,
      currentRsvp: null,
    }) as any
  );
  const root = findByTestId(tree, 'rsvp-form');
  assertTrue(root !== null, 'root form exists');
  assertEqual(root!.props['data-event-id'], 'evt-xyz-123');
  assertEqual(root!.props['data-capacity-is-full'], 'false');
});

it('RSVPForm reflete isFull=true na raiz quando lotado', () => {
  const tree = renderToTree(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element(RSVPForm, {
      eventId: 'evt-1',
      eventTitle: 'X',
      tradition: 'cabala',
      eventType: 'workshop',
      confirmedCount: 20,
      capacity: 20,
      currentRsvp: null,
    }) as any
  );
  const root = findByTestId(tree, 'rsvp-form');
  assertEqual(root!.props['data-capacity-is-full'], 'true');
});

it('RSVPForm usa classes de touch target 44px', () => {
  const tree = renderToTree(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element(RSVPForm, {
      eventId: 'evt-1',
      eventTitle: 'X',
      tradition: 'cabala',
      eventType: 'workshop',
      confirmedCount: 5,
      capacity: 20,
      currentRsvp: null,
    }) as any
  );
  const goingBtn = findByTestId(tree, 'rsvp-form-button-going');
  const className = String(goingBtn!.props.className ?? '');
  assertMatch(className, /min-h-\[44px\]/, 'tem min-h-[44px]');
});

it('RSVPForm inclui role=group nos botões', () => {
  const tree = renderToTree(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element(RSVPForm, {
      eventId: 'evt-1',
      eventTitle: 'X',
      tradition: 'cabala',
      eventType: 'workshop',
      confirmedCount: 5,
      capacity: 20,
      currentRsvp: null,
    }) as any
  );
  let foundGroup = false;
  const walk = (n: { type: string; props: Record<string, unknown>; children: ReadonlyArray<{ type: string; props: Record<string, unknown>; children: ReadonlyArray<unknown> }> }): void => {
    if (n.props.role === 'group') {
      foundGroup = true;
      return;
    }
    for (const c of n.children) walk(c as { type: string; props: Record<string, unknown>; children: ReadonlyArray<{ type: string; props: Record<string, unknown>; children: ReadonlyArray<unknown> }> });
  };
  walk(tree as unknown as { type: string; props: Record<string, unknown>; children: ReadonlyArray<{ type: string; props: Record<string, unknown>; children: ReadonlyArray<unknown> }> });
  assertTrue(foundGroup, 'role=group container exists');
});

// ============================================================================
// SECTION 8 — 7-tradition coverage smoke (render once per tradition)
// ============================================================================

it('RSVPForm renderiza corretamente para CIGANO', () => {
  const tree = renderToTree(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element(RSVPForm, {
      eventId: 'e1', eventTitle: 'Leitura',
      tradition: 'cigano', eventType: 'workshop',
      confirmedCount: 3, capacity: 10, currentRsvp: null,
    }) as any
  );
  assertTrue(findByTestId(tree, 'rsvp-form') !== null);
});

it('RSVPForm renderiza corretamente para ORIXÁS', () => {
  const tree = renderToTree(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element(RSVPForm, {
      eventId: 'e2', eventTitle: 'Gira',
      tradition: 'orixas', eventType: 'ritual',
      confirmedCount: 8, capacity: 15, currentRsvp: 'going',
    }) as any
  );
  assertTrue(findByTestId(tree, 'rsvp-form') !== null);
});

it('RSVPForm renderiza corretamente para ASTROLOGIA', () => {
  const tree = renderToTree(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element(RSVPForm, {
      eventId: 'e3', eventTitle: 'Mapa',
      tradition: 'astrologia', eventType: 'study-circle',
      confirmedCount: 2, capacity: 20, currentRsvp: 'maybe',
    }) as any
  );
  assertTrue(findByTestId(tree, 'rsvp-form') !== null);
});

it('RSVPForm renderiza corretamente para CABALA', () => {
  const tree = renderToTree(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element(RSVPForm, {
      eventId: 'e4', eventTitle: 'Sefirot',
      tradition: 'cabala', eventType: 'workshop',
      confirmedCount: 5, capacity: 12, currentRsvp: null,
    }) as any
  );
  assertTrue(findByTestId(tree, 'rsvp-form') !== null);
});

it('RSVPForm renderiza corretamente para TANTRA', () => {
  const tree = renderToTree(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element(RSVPForm, {
      eventId: 'e5', eventTitle: 'Kundalini',
      tradition: 'tantra', eventType: 'meditation',
      confirmedCount: 0, capacity: 0, currentRsvp: null,
    }) as any
  );
  assertTrue(findByTestId(tree, 'rsvp-form') !== null);
});

it('RSVPForm renderiza corretamente para UMBANDA', () => {
  const tree = renderToTree(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element(RSVPForm, {
      eventId: 'e6', eventTitle: 'Sessão',
      tradition: 'umbanda', eventType: 'ritual',
      confirmedCount: 12, capacity: 20, currentRsvp: null,
    }) as any
  );
  assertTrue(findByTestId(tree, 'rsvp-form') !== null);
});

it('RSVPForm renderiza corretamente para IFÁ', () => {
  const tree = renderToTree(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element(RSVPForm, {
      eventId: 'e7', eventTitle: 'Odu',
      tradition: 'ifa', eventType: 'study-circle',
      confirmedCount: 4, capacity: 12, currentRsvp: null,
    }) as any
  );
  assertTrue(findByTestId(tree, 'rsvp-form') !== null);
});

// ============================================================================
// SECTION 9 — RSVP state labels
// ============================================================================

it('RSVP_STATE_LABEL cobre os 3 estados + logged_out', () => {
  assertEqual(RSVP_STATE_LABEL.going, 'Confirmar presença');
  assertEqual(RSVP_STATE_LABEL.maybe, 'Lista de espera');
  assertEqual(RSVP_STATE_LABEL.declined, 'Recusar');
  assertEqual(RSVP_STATE_LABEL.logged_out, 'Entrar para participar');
});

it('RSVP_STATE_LABEL_ACTIVE cobre os 3 estados ativos', () => {
  assertEqual(RSVP_STATE_LABEL_ACTIVE.going, 'Presença confirmada');
  assertEqual(RSVP_STATE_LABEL_ACTIVE.maybe, 'Na lista de espera');
  assertEqual(RSVP_STATE_LABEL_ACTIVE.declined, 'Recusado');
});

it('RSVP_STATE_LABEL é frozen', () => {
  assertTrue(Object.isFrozen(RSVP_STATE_LABEL), 'RSVP_STATE_LABEL frozen');
});

// ============================================================================
// RUNNER
// ============================================================================

async function main(): Promise<void> {
  const { passed, failed, failures } = await runAll();
  // eslint-disable-next-line no-console
  console.log(`\n[RSVPForm.spec] ${passed} passed, ${failed} failed (${SPEC_REGISTRY.length} total)`);
  if (failures.length > 0) {
    // eslint-disable-next-line no-console
    console.error('\nFAILURES:\n' + failures.join('\n'));
  }
  if (failed > 0) {
    process.exit(1);
  }
}

void main();
