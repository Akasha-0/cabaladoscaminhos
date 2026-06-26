/**
 * redact.test.ts — Wave 32.2
 *
 * Coverage targets (per Wave 32.2 spec: 5+ tests for redaction):
 *   1. redactMessagesForAnnotation removes user.name + user.email from output
 *   2. hashAnonymousOrigin is deterministic + same-origin correlate
 *   3. scrubContentPII removes email, CPF, phone, CNPJ from content
 *   4. ageDays computed correctly
 *   5. routedPillars preserved (not PII)
 *   6. meta flags correctly indicate which fields were redacted
 */
import { describe, it, expect } from 'vitest';
import {
  redactMessagesForAnnotation,
  redactSingle,
  hashAnonymousOrigin,
  scrubContentPII,
} from '../redact';

const NOW = new Date('2026-06-25T12:00:00Z');

describe('redactSingle', () => {
  it('removes user PII from meta (name, email, title) and exposes flags', () => {
    const input = {
      id: 'm1',
      content: 'Mentor response text...',
      createdAt: new Date('2026-06-20T12:00:00Z'),
      consultationTitle: 'Sessão particular — João Silva',
      consultationUser: { name: 'João Silva', email: 'joao@example.com' },
      routedPillars: ['astrologia', 'tarot'],
    };
    const out = redactSingle(input, NOW);
    expect(out.id).toBe('m1');
    expect(out.content).toBe('Mentor response text...');
    expect(out.meta.userNameRedacted).toBe(true);
    expect(out.meta.userEmailRedacted).toBe(true);
    expect(out.meta.consultationTitleRedacted).toBe(true);
    expect(out.meta.routedPillars).toEqual(['astrologia', 'tarot']);
    // Important: PII NÃO vaza no objeto de saída.
    expect(JSON.stringify(out)).not.toContain('João Silva');
    expect(JSON.stringify(out)).not.toContain('joao@example.com');
    expect(JSON.stringify(out)).not.toContain('Sessão particular');
  });

  it('handles missing user/title gracefully (orphan messages)', () => {
    const input = {
      id: 'm2',
      content: 'orphan message',
      createdAt: new Date('2026-06-24T12:00:00Z'),
      consultationTitle: null,
      consultationUser: null,
      routedPillars: [],
    };
    const out = redactSingle(input, NOW);
    expect(out.meta.userNameRedacted).toBe(false);
    expect(out.meta.userEmailRedacted).toBe(false);
    expect(out.meta.consultationTitleRedacted).toBe(false);
    expect(out.anonymousOriginHash).toMatch(/^[0-9a-f]{8}$/);
  });

  it('computes ageDays as floor((now - createdAt) / 86400000)', () => {
    const input = {
      id: 'm3',
      content: 'fresh',
      createdAt: new Date('2026-06-22T00:00:00Z'), // 3.5 days before NOW
      consultationTitle: null,
      consultationUser: null,
    };
    const out = redactSingle(input, NOW);
    expect(out.ageDays).toBe(3);
  });
});

describe('hashAnonymousOrigin', () => {
  it('is deterministic: same inputs → same hash', () => {
    const a = hashAnonymousOrigin('Sessão X', 'a@b.com');
    const b = hashAnonymousOrigin('Sessão X', 'a@b.com');
    expect(a).toBe(b);
  });

  it('correlates same-origin responses (same title + email)', () => {
    const a = hashAnonymousOrigin('Sessão 7', 'maria@akasha.app');
    const b = hashAnonymousOrigin('Sessão 7', 'maria@akasha.app');
    expect(a).toBe(b);
  });

  it('distinguishes different-origin (same title, different email)', () => {
    const a = hashAnonymousOrigin('Sessão 7', 'maria@akasha.app');
    const b = hashAnonymousOrigin('Sessão 7', 'joao@akasha.app');
    expect(a).not.toBe(b);
  });

  it('returns 8-char hex string', () => {
    const h = hashAnonymousOrigin('X', 'Y');
    expect(h).toMatch(/^[0-9a-f]{8}$/);
  });
});

describe('scrubContentPII', () => {
  it('redacts email patterns', () => {
    expect(scrubContentPII('Contact me at gabriel@akasha.app please'))
      .toBe('Contact me at ***@*** please');
  });

  it('redacts CPF and CNPJ', () => {
    expect(scrubContentPII('CPF 123.456.789-00 e CNPJ 12.345.678/0001-90'))
      .toBe('CPF *** e CNPJ ***');
  });

  it('redacts Brazilian phone numbers (varied formats)', () => {
    expect(scrubContentPII('Tel: (11) 91234-5678')).toBe('Tel: ***');
    expect(scrubContentPII('Tel: 11912345678')).toBe('Tel: ***');
    expect(scrubContentPII('Tel: +55 11 91234-5678')).toBe('Tel: ***');
  });

  it('preserves text without PII', () => {
    const text = 'A consciência UNA emerge no silêncio contemplativo.';
    expect(scrubContentPII(text)).toBe(text);
  });
});

describe('redactMessagesForAnnotation (batch)', () => {
  it('redacts an array preserving order', () => {
    const inputs = [
      { id: 'a', content: 'A', createdAt: new Date('2026-06-20'), consultationTitle: 't1', consultationUser: { name: 'u1', email: 'e1@x' } },
      { id: 'b', content: 'B', createdAt: new Date('2026-06-21'), consultationTitle: null, consultationUser: null },
    ];
    const out = redactMessagesForAnnotation(inputs, NOW);
    expect(out).toHaveLength(2);
    expect(out[0].id).toBe('a');
    expect(out[1].id).toBe('b');
    expect(out[0].meta.userNameRedacted).toBe(true);
    expect(out[1].meta.userNameRedacted).toBe(false);
  });

  it('empty input returns empty array', () => {
    expect(redactMessagesForAnnotation([])).toEqual([]);
  });
});
