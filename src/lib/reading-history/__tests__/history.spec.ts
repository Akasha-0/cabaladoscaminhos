/**
 * ════════════════════════════════════════════════════════════════════════════
 * HISTORY.SPEC.TS — Cabala dos Caminhos (Akasha Wave 69)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Self-running spec harness executed via `node --experimental-strip-types`.
 * The cycle 60-68 pattern: sandbox lacks vitest binary, so each spec file
 * exposes a `runXxxSpec()` function that the smoke runner exercises.
 *
 * Covers: empty user, append, batch, paginate, filter by date/tradition/card,
 * GDPR clear, JSON export, immutable log, audit hooks.
 *
 * Total assertions: 35+ across 14 sections.
 * ════════════════════════════════════════════════════════════════════════════
 */

import {
  _clearAllHistoryForTesting,
  _setHistoryForTesting,
  auditTraditionCoverage as auditTraditionCoverageHistory,
  canonicalExportJSON,
  clearHistory,
  countHistory,
  exportHistory,
  getHistory,
  getHistoryByCard,
  getHistoryByTradition,
  globalHistorySize,
  listUsersWithHistory,
  recordReading,
  recordReadings,
  toCardKey,
  toReadingId,
  toUserId,
  TRADITIONS,
  type Card,
  type Reading,
  type ReadingHistoryEntry,
  type UserId,
  ReadingHistoryError,
} from '../history.ts';

// ─── Self-Running Test Harness ─────────────────────────────────────────────

interface SpecReport {
  passed: number;
  failed: number;
  failures: string[];
  assertions: number;
  its: number;
}

interface SpecRunner {
  passed: number;
  failed: number;
  failures: string[];
  assertions: number;
  its: number;
  assert: (actual: unknown, expected: unknown, label: string) => void;
  it: (name: string, fn: () => void) => void;
  describe: (name: string, fn: () => void) => void;
}

function createSpec(): SpecRunner {
  const r: SpecRunner = {
    passed: 0,
    failed: 0,
    failures: [],
    assertions: 0,
    its: 0,
    assert: () => {},
    it: () => {},
    describe: () => {},
  };

  r.assert = (actual: unknown, expected: unknown, label: string): void => {
    r.assertions += 1;
    let ok = false;
    if (typeof actual === 'object' && actual !== null && typeof expected === 'object' && expected !== null) {
      ok = JSON.stringify(actual) === JSON.stringify(expected);
    } else if (typeof actual === 'number' && typeof expected === 'number') {
      ok = Math.abs(actual - expected) < 1e-9;
    } else {
      ok = actual === expected;
    }
    if (ok) {
      r.passed += 1;
    } else {
      r.failed += 1;
      const msg = `    ✗ ${label} :: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`;
      r.failures.push(msg);
      // eslint-disable-next-line no-console
      console.error(msg);
    }
  };

  r.it = (name: string, fn: () => void): void => {
    r.its += 1;
    const start = r.passed + r.failed;
    try {
      fn();
      const added = r.passed + r.failed - start;
      // eslint-disable-next-line no-console
      console.log(`  ✓ ${name}` + (added > 1 ? ` (${added} assertions)` : ''));
    } catch (e) {
      r.failed += 1;
      const msg = `  ✗ ${name} :: ${(e as Error).message}`;
      r.failures.push(msg);
      // eslint-disable-next-line no-console
      console.error(msg);
    }
  };

  r.describe = (name: string, fn: () => void): void => {
    // eslint-disable-next-line no-console
    console.log(`\n▸ ${name}`);
    fn();
  };

  return r;
}

// ─── Fixture Helpers ──────────────────────────────────────────────────────

function cardFor(name: string, tradition: Card['tradition']): Card {
  return {
    key: toCardKey(`${tradition}:${name.toLowerCase().replace(/\s+/g, '-')}`),
    name,
    tradition,
    isMajorArcana: ['A Morte', 'A Torre', 'O Enforcado', 'O Julgamento'].includes(name),
    mood: name === 'A Torre' || name === 'A Morte' ? -1 : name === 'A Estrela' ? 1 : 0,
  };
}

function readingFor(
  userId: UserId,
  tradition: Card['tradition'],
  names: string[],
  when: Date,
): Reading {
  return {
    id: toReadingId(`r-${when.getTime()}-${Math.random().toString(36).slice(2, 6)}`),
    userId,
    tradition,
    cards: names.map((n) => cardFor(n, tradition)),
    createdAt: when,
  };
}

// ─── Public entry point ──────────────────────────────────────────────────

export function runHistorySpec(): SpecReport {
  _clearAllHistoryForTesting();

  const u1 = toUserId('u-alpha');
  const u2 = toUserId('u-beta');
  const now = new Date('2026-06-30T12:00:00Z');
  const r = createSpec();

  r.describe('TRADITIONS catalog', () => {
    r.it('exports 8 traditions', () => {
      r.assert(TRADITIONS.length, 8, 'TRADITIONS.length');
      r.assert(new Set(TRADITIONS).size, TRADITIONS.length, 'tradition uniqueness');
    });
  });

  r.describe('empty-user baseline', () => {
    r.it('fresh store is empty', () => {
      _setHistoryForTesting(new Map());
      r.assert(globalHistorySize(), 0, 'globalHistorySize=0');
      r.assert(listUsersWithHistory().length, 0, 'empty users list');
    });
    r.it('getHistory for fresh user returns empty paginated result', () => {
      const page = getHistory(u1);
      r.assert(page.entries.length, 0, 'entries=0');
      r.assert(page.total, 0, 'total=0');
      r.assert(page.hasMore, false, 'hasMore=false');
    });
    r.it('countHistory / exportHistory handle empty user', () => {
      r.assert(countHistory(u1), 0, 'count=0');
      r.assert(exportHistory(u1).count, 0, 'export.count=0');
    });
  });

  r.describe('recordReading — single entry', () => {
    r.it('appends a reading, count goes to 1', () => {
      _setHistoryForTesting(new Map());
      const entry = recordReading(u1, readingFor(u1, 'cigano', ['O Cigano', 'A Cigana'], now));
      r.assert(typeof entry.id, 'string', 'entry.id type');
      r.assert(entry.cards.length, 2, 'cards.length');
      r.assert(entry.recordedAt instanceof Date, true, 'recordedAt is Date');
      r.assert(countHistory(u1), 1, 'countHistory=1');
    });
    r.it('appended entry is frozen (immutable log)', () => {
      r.assert(Object.isFrozen(getHistory(u1).entries[0]!), true, 'entry isFrozen');
    });
  });

  r.describe('recordReading — validation', () => {
    r.it('rejects unknown tradition', () => {
      const bad: Reading = { ...readingFor(u1, 'cigano', ['X'], now), tradition: 'fake-tradition' as never };
      let threw = false;
      try {
        recordReading(u1, bad);
      } catch (e) {
        if (e instanceof ReadingHistoryError && e.code === 'INVALID_TRADITION') threw = true;
      }
      r.assert(threw, true, 'unknown tradition throw');
    });
    r.it('rejects empty cards array', () => {
      const bad = readingFor(u1, 'cigano', [], now);
      let code: string | null = null;
      try {
        recordReading(u1, bad);
      } catch (e) {
        if (e instanceof ReadingHistoryError) code = e.code;
      }
      r.assert(code, 'EMPTY_CARDS', 'EMPTY_CARDS throw');
    });
    r.it('rejects invalid Date', () => {
      let code: string | null = null;
      try {
        recordReading(u1, readingFor(u1, 'cigano', ['Moinho'], new Date('invalid')));
      } catch (e) {
        if (e instanceof ReadingHistoryError) code = e.code;
      }
      r.assert(code, 'INVALID_DATE', 'INVALID_DATE throw');
    });
  });

  r.describe('recordReadings — batch ingest', () => {
    r.it('records 3 readings atomically', () => {
      _setHistoryForTesting(new Map());
      const batch = [
        readingFor(u1, 'cigano', ['Moinho'], new Date(now.getTime() - 2000)),
        readingFor(u1, 'cigano', ['Trombeta'], new Date(now.getTime() - 1500)),
        readingFor(u1, 'cigano', ['Jardim'], new Date(now.getTime() - 1000)),
      ];
      const out = recordReadings(u1, batch);
      r.assert(out.length, 3, 'batch length');
      r.assert(countHistory(u1), 3, 'count=3');
      r.assert(out.every((e) => Object.isFrozen(e)), true, 'batch is frozen');
    });
    r.it('rejects entire batch on single invalid entry', () => {
      _setHistoryForTesting(new Map());
      const ok = readingFor(u1, 'cigano', ['Trombeta'], new Date(now.getTime() - 500));
      const bad: Reading = { ...readingFor(u1, 'cigano', ['X'], new Date(now.getTime() - 400)), tradition: '!' as never };
      let threw = false;
      try {
        recordReadings(u1, [ok, bad]);
      } catch (e) {
        if (e instanceof ReadingHistoryError) threw = true;
      }
      r.assert(threw, true, 'batch throws');
      r.assert(countHistory(u1), 0, 'no mutation on failure');
    });
  });

  r.describe('getHistory — pagination', () => {
    r.it('paginates with limit=2, hasMore=true on first page', () => {
      _setHistoryForTesting(new Map());
      for (let i = 0; i < 5; i++) {
        recordReading(u1, readingFor(u1, 'cigano', ['Trombeta'], new Date(now.getTime() - i * 1000)));
      }
      const first = getHistory(u1, { limit: 2, offset: 0 });
      r.assert(first.entries.length, 2, 'first page=2');
      r.assert(first.hasMore, true, 'first.hasMore');
      r.assert(first.total, 5, 'first.total=5');
    });
    r.it('desc order returns newest-first', () => {
      const page = getHistory(u1, { limit: 10 });
      const ts = page.entries.map((e: ReadingHistoryEntry) => e.createdAt.getTime());
      r.assert(ts, [...ts].sort((a, b) => b - a), 'desc order');
    });
    r.it('asc order returns oldest-first', () => {
      const page = getHistory(u1, { limit: 10, order: 'asc' });
      const ts = page.entries.map((e: ReadingHistoryEntry) => e.createdAt.getTime());
      r.assert(ts, [...ts].sort((a, b) => a - b), 'asc order');
    });
  });

  r.describe('getHistory — filters', () => {
    r.it('filters by since/until date range', () => {
      _setHistoryForTesting(new Map());
      const t0 = now.getTime();
      recordReading(u1, readingFor(u1, 'cigano', ['Moinho'], new Date(t0 - 10000)));
      recordReading(u1, readingFor(u1, 'cigano', ['Trombeta'], new Date(t0 - 5000)));
      recordReading(u1, readingFor(u1, 'cigano', ['Jardim'], new Date(t0 - 1000)));
      const filtered = getHistory(u1, {
        since: new Date(t0 - 7000),
        until: new Date(t0 - 2000),
      });
      r.assert(filtered.total, 1, 'filtered total=1');
      r.assert(filtered.entries[0]!.cards[0]!.name, 'Trombeta', 'only Trombeta within window');
    });
    r.it('filters by tradition', () => {
      _setHistoryForTesting(new Map());
      recordReading(u1, readingFor(u1, 'cigano', ['Trombeta'], now));
      recordReading(u1, readingFor(u1, 'tarot', ['O Mago'], new Date(now.getTime() - 100)));
      recordReading(u1, readingFor(u1, 'tarot', ['A Estrela'], new Date(now.getTime() - 200)));
      r.assert(getHistory(u1, { tradition: 'cigano' }).total, 1, 'cigano only');
      r.assert(getHistory(u1, { tradition: 'tarot' }).total, 2, 'tarot only');
    });
    r.it('combines since + tradition filters', () => {
      r.assert(
        getHistory(u1, { tradition: 'tarot', since: new Date(now.getTime() - 1000) }).total,
        2,
        'combined filter',
      );
    });
  });

  r.describe('getHistoryByCard', () => {
    r.it('returns entries containing the card', () => {
      _setHistoryForTesting(new Map());
      recordReading(u1, readingFor(u1, 'tarot', ['O Mago', 'A Sacerdotisa'], now));
      recordReading(u1, readingFor(u1, 'tarot', ['A Sacerdotisa', 'A Estrela'], new Date(now.getTime() - 100)));
      recordReading(u1, readingFor(u1, 'tarot', ['A Torre'], new Date(now.getTime() - 200)));
      const matches = getHistoryByCard(u1, toCardKey('tarot:a-sacerdotisa'));
      r.assert(matches.length, 2, 'matches 2 entries');
    });
    r.it('returns empty for unknown card', () => {
      r.assert(getHistoryByCard(u1, toCardKey('tarot:zzzz')).length, 0, 'unknown card');
    });
  });

  r.describe('getHistoryByTradition', () => {
    r.it('filters scoped to single tradition', () => {
      _setHistoryForTesting(new Map());
      recordReading(u1, readingFor(u1, 'cigano', ['Moinho'], now));
      recordReading(u1, readingFor(u1, 'cigano', ['Trombeta'], new Date(now.getTime() - 100)));
      recordReading(u1, readingFor(u1, 'astrologia', ['Áries', 'Sol'], new Date(now.getTime() - 200)));
      r.assert(getHistoryByTradition(u1, 'cigano').length, 2, 'cigano only');
      r.assert(getHistoryByTradition(u1, 'astrologia').length, 1, 'astrologia only');
    });
  });

  r.describe('clearHistory — GDPR right-to-erasure', () => {
    r.it('removes all entries for a user and returns the count', () => {
      _setHistoryForTesting(new Map());
      recordReading(u1, readingFor(u1, 'cigano', ['Trombeta'], now));
      recordReading(u2, readingFor(u1, 'cigano', ['Moinho'], now));
      r.assert(clearHistory(u1), 1, 'cleared count=1');
      r.assert(countHistory(u1), 0, 'u1 history cleared');
      r.assert(countHistory(u2), 1, 'u2 untouched');
    });
    r.it('is idempotent for unknown user', () => {
      r.assert(clearHistory(toUserId('no-such-user')), 0, 'unknown user=0');
    });
    r.it('listUsersWithHistory reflects removal', () => {
      _setHistoryForTesting(new Map());
      recordReading(u1, readingFor(u1, 'cigano', ['Trombeta'], now));
      recordReading(u2, readingFor(u1, 'cigano', ['Moinho'], now));
      r.assert(listUsersWithHistory().length, 2, 'before remove');
      clearHistory(u1);
      r.assert(listUsersWithHistory().length, 1, 'after remove');
    });
  });

  r.describe('exportHistory', () => {
    r.it('produces JSON-serializable shape with ISO dates', () => {
      _setHistoryForTesting(new Map());
      recordReading(u1, readingFor(u1, 'cigano', ['Trombeta'], now));
      const exp = exportHistory(u1);
      r.assert(exp.userId, u1, 'export.userId');
      r.assert(exp.count, 1, 'export.count');
      r.assert(typeof JSON.stringify(exp), 'string', 'JSON serializable');
    });
    r.it('canonical JSON is deterministic', () => {
      _setHistoryForTesting(new Map());
      recordReading(u1, readingFor(u1, 'cigano', ['Trombeta'], now));
      recordReading(u1, readingFor(u1, 'tarot', ['O Mago'], new Date(now.getTime() - 1000)));
      r.assert(canonicalExportJSON(u1), canonicalExportJSON(u1), 'idempotent export');
    });
  });

  r.describe('multi-user isolation', () => {
    r.it('users do not see each other history', () => {
      _setHistoryForTesting(new Map());
      recordReading(u1, readingFor(u1, 'cigano', ['Trombeta'], now));
      recordReading(u2, readingFor(u2, 'tarot', ['O Mago'], now));
      r.assert(countHistory(u1), 1, 'u1=1');
      r.assert(countHistory(u2), 1, 'u2=1');
      clearHistory(u1);
      r.assert(countHistory(u2), 1, 'u2 untouched after clear');
    });
  });

  r.describe('auditTraditionCoverage — caller inspection', () => {
    r.it('reports tradition counts', () => {
      _setHistoryForTesting(new Map());
      recordReading(u1, readingFor(u1, 'cigano', ['Trombeta'], now));
      recordReading(u1, readingFor(u1, 'tarot', ['O Mago'], new Date(now.getTime() - 1)));
      const cov = auditTraditionCoverageHistory();
      r.assert(cov.cigano, 1, 'cigano audit');
      r.assert(cov.tarot, 1, 'tarot audit');
    });
  });

  // eslint-disable-next-line no-console
  console.log(
    `\n█ runHistorySpec: ${r.passed}/${r.passed + r.failed} assertions passed across ${r.its} it() blocks\n`,
  );

  return {
    passed: r.passed,
    failed: r.failed,
    failures: r.failures,
    assertions: r.passed + r.failed,
    its: r.its,
  };
}

// Run if executed directly.
if (typeof process !== 'undefined' && process.argv?.[1]?.endsWith('history.spec.ts')) {
  runHistorySpec();
}
