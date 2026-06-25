/** @vitest-environment node */
/**
 * Webhook signature helper tests — D-049 (Wave 19.1).
 *
 * Cobre:
 *   - generateSecret produz 64 hex chars e valores únicos
 *   - fingerprintSecret é determinístico e não-reversível (8 chars)
 *   - signBody produz header no formato `sha256=<hex>`
 *   - verifySignature aceita formato `sha256=<hex>` e `<hex>` puro
 *   - verifySignature rejeita signature vazia / secret vazio
 *   - verifySignature rejeita signature adulterada (timing-safe)
 *   - verifySignature rejeita body adulterado
 *   - isWebhookEventType valida corretamente os 5 eventos canônicos
 */

import { describe, it, expect } from 'vitest';
import {
  WEBHOOK_EVENT_TYPES,
  fingerprintSecret,
  generateSecret,
  isWebhookEventType,
  signBody,
  verifySignature,
} from '../signature';

describe('generateSecret', () => {
  it('produces 64 hex characters', () => {
    const secret = generateSecret();
    expect(secret).toMatch(/^[0-9a-f]{64}$/);
  });

  it('produces unique values on each call', () => {
    const a = generateSecret();
    const b = generateSecret();
    expect(a).not.toBe(b);
  });
});

describe('fingerprintSecret', () => {
  it('returns 8 hex characters', () => {
    const fp = fingerprintSecret('any-secret');
    expect(fp).toMatch(/^[0-9a-f]{8}$/);
  });

  it('is deterministic for the same input', () => {
    expect(fingerprintSecret('abc')).toBe(fingerprintSecret('abc'));
  });

  it('differs for different inputs', () => {
    expect(fingerprintSecret('abc')).not.toBe(fingerprintSecret('def'));
  });

  it('does not leak the original secret', () => {
    const secret = generateSecret();
    const fp = fingerprintSecret(secret);
    // fp is only 8 chars, original is 64 — cannot reverse.
    expect(secret).not.toContain(fp);
    expect(fp).not.toContain(secret);
  });
});

describe('signBody + verifySignature', () => {
  const secret = 'test-secret-123';
  const body = JSON.stringify({ event: 'notification.created', userId: 'u1' });

  it('signBody produces sha256=<hex> format', () => {
    const sig = signBody(secret, body);
    expect(sig).toMatch(/^sha256=[0-9a-f]{64}$/);
  });

  it('verifySignature accepts the sha256= format', () => {
    const sig = signBody(secret, body);
    expect(verifySignature(secret, body, sig)).toBe(true);
  });

  it('verifySignature accepts the bare hex format (defensive)', () => {
    const sig = signBody(secret, body).replace(/^sha256=/, '');
    expect(verifySignature(secret, body, sig)).toBe(true);
  });

  it('verifySignature rejects empty signature', () => {
    expect(verifySignature(secret, body, '')).toBe(false);
    expect(verifySignature(secret, body, null)).toBe(false);
    expect(verifySignature(secret, body, undefined)).toBe(false);
  });

  it('verifySignature rejects empty secret', () => {
    expect(verifySignature('', body, signBody(secret, body))).toBe(false);
  });

  it('verifySignature rejects tampered signature', () => {
    const sig = signBody(secret, body);
    // Flip last char
    const tampered = sig.slice(0, -1) + (sig.endsWith('a') ? 'b' : 'a');
    expect(verifySignature(secret, body, tampered)).toBe(false);
  });

  it('verifySignature rejects tampered body', () => {
    const sig = signBody(secret, body);
    expect(verifySignature(secret, body + ' ', sig)).toBe(false);
  });

  it('verifySignature rejects when length differs', () => {
    const sig = signBody(secret, body);
    // Truncate the signature — length mismatch must NOT throw, must return false.
    expect(() => verifySignature(secret, body, sig.slice(0, -1))).not.toThrow();
    expect(verifySignature(secret, body, sig.slice(0, -1))).toBe(false);
  });

  it('verifySignature rejects signature from different secret', () => {
    const sig = signBody('other-secret', body);
    expect(verifySignature(secret, body, sig)).toBe(false);
  });
});

describe('WEBHOOK_EVENT_TYPES', () => {
  it('contains the 5 canonical event types', () => {
    expect(WEBHOOK_EVENT_TYPES).toEqual([
      'notification.created',
      'diario.published',
      'mentor.response_received',
      'conexao.match',
      'credits.low',
    ]);
  });

  it('isWebhookEventType accepts canonical types', () => {
    for (const t of WEBHOOK_EVENT_TYPES) {
      expect(isWebhookEventType(t)).toBe(true);
    }
  });

  it('isWebhookEventType rejects unknown types', () => {
    expect(isWebhookEventType('unknown.event')).toBe(false);
    expect(isWebhookEventType('')).toBe(false);
    expect(isWebhookEventType('NOTIFICATION.CREATED')).toBe(false); // case-sensitive
  });
});
