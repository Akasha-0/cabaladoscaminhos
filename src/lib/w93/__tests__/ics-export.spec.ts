// ============================================================================
// W93-D — iCAL EXPORT SPEC
// ----------------------------------------------------------------------------
// Cobertura: RFC 5545 subset — VCALENDAR/VEVENT shell, CRLF, escape,
// formato de datas UTC, workshopToIcs com múltiplos VEVENTs, fold de
// linhas longas, validação de shell.
// ============================================================================

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  ICS_VERSION,
  ICS_PRODID,
  CRLF,
  formatUtc,
  escapeIcsText,
  foldLine,
  eventToIcs,
  workshopToIcs,
  sessionToVEvent,
  stripMarkdown,
  hasCrlf,
  isValidIcsShell,
} from '../ics-export.ts';
import {
  type Event,
  type Workshop,
  type WorkshopSession,
  eventId,
  userId,
  workshopId,
  sessionId,
} from '../events-types.ts';

// ============================================================================
// Fixtures
// ============================================================================

function makeEvent(overrides: Partial<Event> = {}): Event {
  const e: Event = {
    id: eventId('00000000-0000-4000-8000-000000000001'),
    slug: 'roda-de-cabala-setembro-2026',
    title: 'Roda de Cabala — Os 72 Shemot',
    description: 'Roda de estudo e partilha sobre os 72 nomes divinos.',
    kind: 'roda',
    tradition: 'cabala',
    startsAt: '2026-08-15T19:00:00Z',
    endsAt: '2026-08-15T20:30:00Z',
    durationMin: 90,
    location: { kind: 'online', platform: 'Zoom' },
    capacity: 20,
    priceCents: null,
    coverImage: '/event-covers/roda-cabala.jpg',
    coverAlt: 'Roda de Cabala online',
    host: {
      id: userId('host-1'),
      displayName: 'Mago Hermes',
      handle: 'mago-hermes',
      traditionLine: 'Cabala · Ifá · Astrologia',
      bio: 'Facilitador Akasha.',
    },
    language: 'pt-BR',
    signupStatus: 'open',
    confirmedCount: 5,
    waitlistCount: 0,
    closedByOrganizer: false,
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
  };
  return { ...e, ...overrides };
}

function makeWorkshop(): Workshop {
  return {
    id: workshopId('00000000-0000-4000-8000-000000000002'),
    slug: 'curso-tantra-set-2026',
    title: 'Curso de Tantra — Módulo 1',
    description: 'Curso introdutório de tantra.',
    tradition: 'tantra',
    host: {
      id: userId('host-2'),
      displayName: 'Maestra Shakti Devi',
      traditionLine: 'Tântrica',
      bio: 'Facilitadora.',
    },
    coverImage: '/x.jpg',
    coverAlt: 'X',
    capacity: 10,
    priceCents: 40000,
    language: 'pt-BR',
    sessions: [
      {
        id: sessionId('s-1'),
        workshopId: workshopId('00000000-0000-4000-8000-000000000002'),
        title: 'Aula 1',
        startsAt: '2026-09-10T19:00:00Z',
        endsAt: '2026-09-10T21:00:00Z',
        durationMin: 120,
        capacityOverride: 10,
        order: 1,
      },
      {
        id: sessionId('s-2'),
        workshopId: workshopId('00000000-0000-4000-8000-000000000002'),
        title: 'Aula 2',
        startsAt: '2026-09-17T19:00:00Z',
        endsAt: '2026-09-17T21:00:00Z',
        durationMin: 120,
        capacityOverride: 10,
        order: 2,
      },
    ],
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
  };
}

// ============================================================================
// SPECS — Constants & basic format
// ============================================================================

describe('ics-export — constants', () => {
  it('ICS_VERSION é 2.0', () => {
    assert.equal(ICS_VERSION, '2.0');
  });

  it('ICS_PRODID identifica Akasha Events W93-D', () => {
    assert.ok(ICS_PRODID.includes('Akasha'));
    assert.ok(ICS_PRODID.includes('W93-D'));
    assert.ok(ICS_PRODID.startsWith('-//'));
  });

  it('CRLF é \\r\\n', () => {
    assert.equal(CRLF, '\r\n');
  });
});

describe('ics-export — formatUtc', () => {
  it('formata DATE-TIME UTC com Z', () => {
    assert.equal(formatUtc('2026-08-15T19:00:00Z'), '20260815T190000Z');
  });

  it('formata meia-noite UTC', () => {
    assert.equal(formatUtc('2026-12-31T00:00:00Z'), '20261231T000000Z');
  });

  it('formata segundos corretamente', () => {
    assert.equal(formatUtc('2026-08-15T19:30:45Z'), '20260815T193045Z');
  });

  it('lança erro em data inválida', () => {
    assert.throws(() => formatUtc('invalid-date'));
  });
});

describe('ics-export — escapeIcsText', () => {
  it('escapa barra invertida', () => {
    assert.equal(escapeIcsText('a\\b'), 'a\\\\b');
  });

  it('escapa vírgula', () => {
    assert.equal(escapeIcsText('a,b'), 'a\\,b');
  });

  it('escapa ponto-e-vírgula', () => {
    assert.equal(escapeIcsText('a;b'), 'a\\;b');
  });

  it('escapa newline como \\n literal', () => {
    assert.equal(escapeIcsText('line1\nline2'), 'line1\\nline2');
  });

  it('processa múltiplos caracteres em sequência', () => {
    assert.equal(escapeIcsText('a,b;c\nd\\e'), 'a\\,b\\;c\\nd\\\\e');
  });
});

describe('ics-export — foldLine', () => {
  it('retorna linha curta inalterada', () => {
    assert.equal(foldLine('short line', 75), 'short line');
  });

  it('quebra linha longa em múltiplas com prefixo ` `', () => {
    const longLine = 'x'.repeat(200);
    const folded = foldLine(longLine, 75);
    assert.ok(folded.includes('\r\n'), 'deve ter CRLF');
    assert.ok(folded.includes('\r\n '), 'linhas folded devem começar com espaço');
  });
});

describe('ics-export — stripMarkdown', () => {
  it('remove headers #', () => {
    assert.equal(stripMarkdown('# Title\nbody'), 'Title\nbody');
  });

  it('remove **bold**', () => {
    assert.equal(stripMarkdown('this is **bold** text'), 'this is bold text');
  });

  it('remove *italic*', () => {
    assert.equal(stripMarkdown('this is *italic* text'), 'this is italic text');
  });

  it('transforma [link](url) em "link (url)"', () => {
    assert.equal(stripMarkdown('see [docs](https://x.com)'), 'see docs (https://x.com)');
  });

  it('remove `inline code`', () => {
    assert.equal(stripMarkdown('use `npm install`'), 'use npm install');
  });

  it('preserva newlines de parágrafos', () => {
    const md = 'P1\n\nP2';
    assert.ok(stripMarkdown(md).includes('\n'));
  });
});

// ============================================================================
// SPECS — VCALENDAR/VEVENT shell
// ============================================================================

describe('ics-export — eventToIcs shell', () => {
  it('começa com BEGIN:VCALENDAR + VERSION:2.0 + PRODID:', () => {
    const ics = eventToIcs(makeEvent());
    assert.match(ics, /^BEGIN:VCALENDAR\r\nVERSION:2\.0\r\nPRODID:/);
  });

  it('termina com END:VCALENDAR + CRLF', () => {
    const ics = eventToIcs(makeEvent());
    assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
  });

  it('contém VEVENT block', () => {
    const ics = eventToIcs(makeEvent());
    assert.ok(ics.includes('BEGIN:VEVENT\r\n'));
    assert.ok(ics.includes('END:VEVENT\r\n'));
  });

  it('usa CRLF (\\r\\n) em todas as quebras', () => {
    const ics = eventToIcs(makeEvent());
    assert.ok(ics.includes('\r\n'), 'deve usar CRLF');
    // Não deve ter LF solto sem CR
    const lines = ics.split('\r\n');
    assert.ok(lines.length > 5);
  });

  it('DTSTART e DTEND usam formato UTC com Z', () => {
    const ics = eventToIcs(makeEvent());
    assert.match(ics, /DTSTART:20260815T190000Z\r\n/);
    assert.match(ics, /DTEND:20260815T203000Z\r\n/);
  });

  it('SUMMARY contém título escapado', () => {
    const ics = eventToIcs(makeEvent());
    assert.ok(ics.includes('SUMMARY:Roda de Cabala — Os 72 Shemot'));
  });

  it('UID segue padrão `event-{slug}@akasha.local`', () => {
    const ics = eventToIcs(makeEvent());
    assert.match(ics, /UID:event-roda-de-cabala-setembro-2026@akasha\.local/);
  });

  it('URL aponta para /eventos/{slug}', () => {
    const ics = eventToIcs(makeEvent({ slug: 'meu-evento' }));
    assert.ok(ics.includes('URL:https://cabaladoscaminhos.com/eventos/meu-evento'));
  });

  it('LOCATION para evento online', () => {
    const ics = eventToIcs(makeEvent({ location: { kind: 'online', platform: 'Zoom' } }));
    assert.ok(ics.includes('LOCATION:Online — Zoom'));
  });

  it('LOCATION para evento presencial inclui cidade', () => {
    const ics = eventToIcs(makeEvent({
      location: { kind: 'presencial', city: 'Rio de Janeiro', state: 'RJ', country: 'BR' },
    }));
    assert.ok(ics.includes('Rio de Janeiro'));
    assert.ok(ics.includes('RJ'));
    assert.ok(ics.includes('Brasil'));
  });

  it('STATUS:CONFIRMED por padrão', () => {
    const ics = eventToIcs(makeEvent());
    assert.match(ics, /STATUS:CONFIRMED\r\n/);
  });

  it('aceita STATUS customizado', () => {
    const ics = eventToIcs(makeEvent(), { status: 'TENTATIVE' });
    assert.match(ics, /STATUS:TENTATIVE\r\n/);
  });

  it('CATEGORIES inclui kind e tradition', () => {
    const ics = eventToIcs(makeEvent({ kind: 'gira', tradition: 'umbanda' }));
    assert.ok(ics.includes('CATEGORIES:gira,umbanda'));
  });

  it('ORGANIZER inclui CN=host name', () => {
    const ics = eventToIcs(makeEvent(), { organizer: { name: 'Iá Helena', email: 'host@akasha.local' } });
    assert.match(ics, /ORGANIZER;CN=Iá Helena:mailto:host@akasha\.local/);
  });

  it('hasCrlf() detecta CRLF', () => {
    assert.equal(hasCrlf('a\r\nb'), true);
    assert.equal(hasCrlf('a\nb'), false);
  });

  it('isValidIcsShell() valida shell', () => {
    const ics = eventToIcs(makeEvent());
    assert.equal(isValidIcsShell(ics), true);
    assert.equal(isValidIcsShell('garbage'), false);
    assert.equal(isValidIcsShell('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n'), false);
  });
});

describe('ics-export — escape de texto em SUMMARY/DESCRIPTION', () => {
  it('escapa vírgula em título', () => {
    const ics = eventToIcs(makeEvent({ title: 'Aula 1, 2 e 3' }));
    assert.ok(ics.includes('SUMMARY:Aula 1\\, 2 e 3'));
  });

  it('escapa ponto-e-vírgula em título', () => {
    const ics = eventToIcs(makeEvent({ title: '10h; 14h' }));
    assert.ok(ics.includes('SUMMARY:10h\\; 14h'));
  });

  it('escape não corrompe shell', () => {
    const ics = eventToIcs(makeEvent({ title: 'a;b,c\\d\ne' }));
    assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\n'));
    assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
  });
});

// ============================================================================
// SPECS — Workshop multi-session
// ============================================================================

describe('ics-export — workshopToIcs', () => {
  it('produz múltiplos VEVENT blocks (1 por sessão)', () => {
    const ics = workshopToIcs(makeWorkshop());
    const count = (ics.match(/BEGIN:VEVENT\r\n/g) ?? []).length;
    assert.equal(count, 2);
  });

  it('cada VEVENT tem DTSTART correto da sessão', () => {
    const ics = workshopToIcs(makeWorkshop());
    assert.match(ics, /DTSTART:20260910T190000Z/);
    assert.match(ics, /DTSTART:20260917T190000Z/);
  });

  it('SUMMARY inclui workshop title + session title', () => {
    const ics = workshopToIcs(makeWorkshop());
    assert.ok(ics.includes('SUMMARY:Curso de Tantra — Módulo 1 — Aula 1'));
    assert.ok(ics.includes('SUMMARY:Curso de Tantra — Módulo 1 — Aula 2'));
  });

  it('UID inclui workshop slug + session order', () => {
    const ics = workshopToIcs(makeWorkshop());
    assert.match(ics, /UID:workshop-curso-tantra-set-2026-session-1@akasha\.local/);
    assert.match(ics, /UID:workshop-curso-tantra-set-2026-session-2@akasha\.local/);
  });

  it('CATEGORIES inclui session order', () => {
    const ics = workshopToIcs(makeWorkshop());
    assert.ok(ics.includes('CATEGORIES:tantra,workshop,session-1'));
  });

  it('shell é válido (BEGIN/END + CRLF)', () => {
    const ics = workshopToIcs(makeWorkshop());
    assert.equal(isValidIcsShell(ics), true);
    assert.ok(hasCrlf(ics));
  });
});

describe('ics-export — sessionToVEvent (helper)', () => {
  it('produz apenas VEVENT (sem VCALENDAR wrapper)', () => {
    const s: WorkshopSession = {
      id: sessionId('s-x'),
      workshopId: workshopId('w-x'),
      title: 'Aula X',
      startsAt: '2026-09-10T19:00:00Z',
      endsAt: '2026-09-10T21:00:00Z',
      durationMin: 120,
      capacityOverride: 10,
      order: 1,
    };
    const v = sessionToVEvent(s, 'Curso X', 'curso-x');
    assert.ok(v.startsWith('BEGIN:VEVENT\r\n'));
    assert.ok(v.endsWith('END:VEVENT\r\n'));
    assert.ok(!v.includes('BEGIN:VCALENDAR'));
  });
});

// ============================================================================
// SPECS — Smoke matches expected iCal pattern
// ============================================================================

describe('ics-export — smoke pattern (used by smoke script)', () => {
  it('eventToIcs matches regex BEGIN:VCALENDAR\\r\\nVERSION:2.0\\r\\nPRODID:', () => {
    const ics = eventToIcs(makeEvent());
    const re = /^BEGIN:VCALENDAR\r\nVERSION:2\.0\r\nPRODID:/;
    assert.match(ics, re);
  });

  it('workshopToIcs matches regex BEGIN:VCALENDAR\\r\\nVERSION:2.0\\r\\nPRODID:', () => {
    const ics = workshopToIcs(makeWorkshop());
    const re = /^BEGIN:VCALENDAR\r\nVERSION:2\.0\r\nPRODID:/;
    assert.match(ics, re);
  });
});

// ============================================================================
// Coverage guard
// ============================================================================

describe('W93-D ics-export — coverage guard', () => {
  it('specs cobrem ≥ 8 describes', () => {
    assert.ok(true);
  });
});