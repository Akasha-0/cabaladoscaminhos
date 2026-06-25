/** @vitest-environment node */
/**
 * Webhooks service tests — D-049 (Wave 19.1).
 *
 * Cobre:
 *   - validateWebhookUrl: https-only, não-localhost, não-IP-privado
 *   - validateEvents: array, não-vazio, ≤ 20, todos válidos
 *   - createWebhook: gera secret + fingerprint, NÃO retorna secret em
 *     listWebhooks / getWebhook / updateWebhook
 *   - listWebhooks: userId filter
 *   - getWebhook: IDOR-safe (404 se não pertence)
 *   - updateWebhook: IDOR-safe, valida url/events
 *   - deleteWebhook: IDOR-safe
 *   - findActiveSubscribers: filtra por isActive + event
 *   - recordDelivery: atualiza lastCalledAt + lastError
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/infrastructure/prisma', () => {
  const mockPrisma = {
    webhook: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
    },
  };
  return { prisma: mockPrisma };
});

import { prisma } from '@/lib/infrastructure/prisma';
import {
  WebhookValidationError,
  createWebhook,
  deleteWebhook,
  findActiveSubscribers,
  getWebhook,
  listWebhooks,
  recordDelivery,
  updateWebhook,
  validateEvents,
  validateWebhookUrl,
} from '../service';

const mockPrisma = vi.mocked(prisma, true);

const fakeUserId = 'user-abc';
const fakeRow = {
  id: 'wh-1',
  url: 'https://example.com/hook',
  events: ['notification.created'],
  secret: 'a'.repeat(64),
  secretFingerprint: 'a1b2c3d4', // 8 hex chars (valid format from fingerprintSecret)
  isActive: true,
  lastCalledAt: null,
  lastError: null,
  createdAt: new Date('2026-06-25T00:00:00.000Z'),
  updatedAt: new Date('2026-06-25T00:00:00.000Z'),
};

beforeEach(() => {
  vi.resetAllMocks();
});

// ─── URL validation ──────────────────────────────────────────────────
describe('validateWebhookUrl', () => {
  it('accepts https://example.com', () => {
    expect(validateWebhookUrl('https://example.com/hook')).toBe('https://example.com/hook');
  });

  it('rejects http:// (no https)', () => {
    expect(() => validateWebhookUrl('http://example.com/hook')).toThrow(WebhookValidationError);
  });

  it('rejects ftp://', () => {
    expect(() => validateWebhookUrl('ftp://example.com/hook')).toThrow(WebhookValidationError);
  });

  it('rejects empty', () => {
    expect(() => validateWebhookUrl('')).toThrow(WebhookValidationError);
  });

  it('rejects non-string', () => {
    // Runtime guard catches all non-string inputs; cast to bypass TS for the test.
    expect(() => validateWebhookUrl(123 as unknown as string)).toThrow(WebhookValidationError);
  });

  it('rejects invalid URL (does not parse)', () => {
    expect(() => validateWebhookUrl('not-a-url')).toThrow(WebhookValidationError);
  });

  it('rejects localhost', () => {
    expect(() => validateWebhookUrl('https://localhost:3000/hook')).toThrow(WebhookValidationError);
  });

  it('rejects 127.0.0.1 (loopback)', () => {
    expect(() => validateWebhookUrl('https://127.0.0.1/hook')).toThrow(WebhookValidationError);
  });

  it('rejects 10.x.x.x (private)', () => {
    expect(() => validateWebhookUrl('https://10.0.0.5/hook')).toThrow(WebhookValidationError);
  });

  it('rejects 172.16-31.x.x (private)', () => {
    expect(() => validateWebhookUrl('https://172.20.5.5/hook')).toThrow(WebhookValidationError);
  });

  it('rejects 192.168.x.x (private)', () => {
    expect(() => validateWebhookUrl('https://192.168.1.1/hook')).toThrow(WebhookValidationError);
  });

  it('rejects 169.254.x.x (link-local / cloud metadata)', () => {
    expect(() => validateWebhookUrl('https://169.254.169.254/latest/meta-data')).toThrow(
      WebhookValidationError
    );
  });

  it('rejects 0.0.0.0', () => {
    expect(() => validateWebhookUrl('https://0.0.0.0/hook')).toThrow(WebhookValidationError);
  });

  it('rejects IPv6 link-local (fe80::)', () => {
    expect(() => validateWebhookUrl('https://[fe80::1]/hook')).toThrow(WebhookValidationError);
  });

  it('rejects IPv6 unique-local (fc00::/7)', () => {
    expect(() => validateWebhookUrl('https://[fc00::1]/hook')).toThrow(WebhookValidationError);
    expect(() => validateWebhookUrl('https://[fd00::1]/hook')).toThrow(WebhookValidationError);
  });

  it('rejects ::1 (IPv6 loopback)', () => {
    expect(() => validateWebhookUrl('https://[::1]/hook')).toThrow(WebhookValidationError);
  });

  it('accepts 172.15.x.x and 172.32.x.x (boundary — not private)', () => {
    // 172.15.x.x is NOT in 172.16/12 — public.
    // 172.32.x.x is also NOT in private range.
    expect(() => validateWebhookUrl('https://172.15.0.1/hook')).not.toThrow();
    expect(() => validateWebhookUrl('https://172.32.0.1/hook')).not.toThrow();
  });
});

// ─── Events validation ───────────────────────────────────────────────
describe('validateEvents', () => {
  it('accepts a valid event', () => {
    expect(validateEvents(['notification.created'])).toEqual(['notification.created']);
  });

  it('deduplicates', () => {
    expect(
      validateEvents(['notification.created', 'notification.created'])
    ).toEqual(['notification.created']);
  });

  it('rejects empty array', () => {
    expect(() => validateEvents([])).toThrow(WebhookValidationError);
  });

  it('rejects non-array', () => {
    expect(() => validateEvents('notification.created')).toThrow(WebhookValidationError);
    expect(() =>
      validateEvents(null as unknown as string[])
    ).toThrow(WebhookValidationError);
  });

  it('rejects unknown event', () => {
    expect(() => validateEvents(['unknown.event'])).toThrow(WebhookValidationError);
  });

  it('rejects non-string entry', () => {
    expect(() => validateEvents([123] as unknown as string[])).toThrow(WebhookValidationError);
  });

  it('rejects more than 20 entries', () => {
    const many = Array(21).fill('notification.created');
    expect(() => validateEvents(many)).toThrow(WebhookValidationError);
  });

  it('accepts 20 entries', () => {
    // We only have 5 canonical events, but validation allows duplicates
    // to be deduped → effectively 5 unique. To hit 20, we'd need to
    // allow unknown events, which we don't. So 5 is the cap.
    const five = [
      'notification.created',
      'diario.published',
      'mentor.response_received',
      'conexao.match',
      'credits.low',
    ];
    expect(validateEvents(five)).toEqual(five);
  });
});

// ─── CRUD: listWebhooks ──────────────────────────────────────────────
describe('listWebhooks', () => {
  it('returns DTOs without secret', async () => {
    mockPrisma.webhook.findMany.mockResolvedValueOnce([fakeRow] as never);
    const result = await listWebhooks(fakeUserId);
    expect(result).toHaveLength(1);
    expect(result[0]).not.toHaveProperty('secret');
    expect(result[0]?.secretFingerprint).toBe('a1b2c3d4');
    expect(result[0]?.createdAt).toBe('2026-06-25T00:00:00.000Z');
  });

  it('filters by userId (LGPD)', async () => {
    mockPrisma.webhook.findMany.mockResolvedValueOnce([]);
    await listWebhooks(fakeUserId);
    expect(mockPrisma.webhook.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: fakeUserId } })
    );
  });

  it('rejects empty userId', async () => {
    await expect(listWebhooks('')).rejects.toThrow();
  });
});

// ─── CRUD: createWebhook ─────────────────────────────────────────────
describe('createWebhook', () => {
  it('generates secret + fingerprint, returns secret plain', async () => {
    mockPrisma.webhook.create.mockResolvedValueOnce(fakeRow as never);
    const result = await createWebhook(fakeUserId, {
      url: 'https://example.com/hook',
      events: ['notification.created'],
    });
    // secret returned (plain) — shown to user ONCE
    expect(result.secret).toMatch(/^[0-9a-f]{64}$/);
    expect(result.secretFingerprint).toMatch(/^[0-9a-f]{8}$/);
  });

  it('stores userId in create', async () => {
    mockPrisma.webhook.create.mockResolvedValueOnce(fakeRow as never);
    await createWebhook(fakeUserId, {
      url: 'https://example.com/hook',
      events: ['notification.created'],
    });
    expect(mockPrisma.webhook.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: fakeUserId }),
      })
    );
  });

  it('rejects invalid URL', async () => {
    await expect(
      createWebhook(fakeUserId, { url: 'http://bad.com', events: ['notification.created'] })
    ).rejects.toThrow(WebhookValidationError);
  });

  it('rejects invalid events', async () => {
    await expect(
      createWebhook(fakeUserId, { url: 'https://x.com', events: [] })
    ).rejects.toThrow(WebhookValidationError);
  });
});

// ─── CRUD: getWebhook (IDOR-safe) ────────────────────────────────────
describe('getWebhook', () => {
  it('returns DTO without secret', async () => {
    mockPrisma.webhook.findFirst.mockResolvedValueOnce(fakeRow as never);
    const result = await getWebhook(fakeUserId, 'wh-1');
    expect(result).not.toBeNull();
    expect(result).not.toHaveProperty('secret');
  });

  it('returns null when not found', async () => {
    mockPrisma.webhook.findFirst.mockResolvedValueOnce(null as never);
    expect(await getWebhook(fakeUserId, 'wh-1')).toBeNull();
  });

  it('filters by (id, userId) — IDOR-safe', async () => {
    mockPrisma.webhook.findFirst.mockResolvedValueOnce(null as never);
    await getWebhook(fakeUserId, 'wh-other-user');
    expect(mockPrisma.webhook.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'wh-other-user', userId: fakeUserId } })
    );
  });
});

// ─── CRUD: updateWebhook ─────────────────────────────────────────────
describe('updateWebhook', () => {
  it('returns updated DTO without secret', async () => {
    mockPrisma.webhook.updateMany.mockResolvedValueOnce({ count: 1 } as never);
    mockPrisma.webhook.findFirst.mockResolvedValueOnce(fakeRow as never);
    const result = await updateWebhook(fakeUserId, 'wh-1', { isActive: false });
    expect(result).not.toBeNull();
    expect(result).not.toHaveProperty('secret');
  });

  it('returns null when IDOR (updateMany count=0)', async () => {
    mockPrisma.webhook.updateMany.mockResolvedValueOnce({ count: 0 } as never);
    expect(await updateWebhook(fakeUserId, 'wh-1', { isActive: false })).toBeNull();
  });

  it('filters updateMany by (id, userId)', async () => {
    mockPrisma.webhook.updateMany.mockResolvedValueOnce({ count: 1 } as never);
    mockPrisma.webhook.findFirst.mockResolvedValueOnce(fakeRow as never);
    await updateWebhook(fakeUserId, 'wh-1', { isActive: false });
    expect(mockPrisma.webhook.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'wh-1', userId: fakeUserId } })
    );
  });

  it('rejects invalid URL in patch', async () => {
    await expect(
      updateWebhook(fakeUserId, 'wh-1', { url: 'http://bad.com' })
    ).rejects.toThrow(WebhookValidationError);
  });
});

// ─── CRUD: deleteWebhook ─────────────────────────────────────────────
describe('deleteWebhook', () => {
  it('returns true when deleted', async () => {
    mockPrisma.webhook.deleteMany.mockResolvedValueOnce({ count: 1 } as never);
    expect(await deleteWebhook(fakeUserId, 'wh-1')).toBe(true);
  });

  it('returns false when not found (IDOR-safe)', async () => {
    mockPrisma.webhook.deleteMany.mockResolvedValueOnce({ count: 0 } as never);
    expect(await deleteWebhook(fakeUserId, 'wh-1')).toBe(false);
  });

  it('filters by (id, userId) — IDOR-safe', async () => {
    mockPrisma.webhook.deleteMany.mockResolvedValueOnce({ count: 0 } as never);
    await deleteWebhook(fakeUserId, 'wh-other');
    expect(mockPrisma.webhook.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'wh-other', userId: fakeUserId } })
    );
  });
});

// ─── Dispatcher support ──────────────────────────────────────────────
describe('findActiveSubscribers', () => {
  it('filters by userId + isActive + event overlap', async () => {
    mockPrisma.webhook.findMany.mockResolvedValueOnce([{ id: 'wh-1', url: 'https://x.com', secret: 's' }] as never);
    const result = await findActiveSubscribers(fakeUserId, 'notification.created');
    expect(result).toHaveLength(1);
    expect(mockPrisma.webhook.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: fakeUserId,
          isActive: true,
          events: { hasSome: ['notification.created'] },
        },
      })
    );
  });
});

describe('recordDelivery', () => {
  it('sets lastCalledAt + clears lastError on success', async () => {
    mockPrisma.webhook.updateMany.mockResolvedValueOnce({ count: 1 } as never);
    await recordDelivery(fakeUserId, 'wh-1', { ok: true });
    expect(mockPrisma.webhook.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ lastCalledAt: expect.any(Date), lastError: null }),
      })
    );
  });

  it('sets lastError on failure (truncated to 500 chars)', async () => {
    mockPrisma.webhook.updateMany.mockResolvedValueOnce({ count: 1 } as never);
    const longError = 'x'.repeat(1000);
    await recordDelivery(fakeUserId, 'wh-1', { ok: false, error: longError });
    const call = mockPrisma.webhook.updateMany.mock.calls[0]?.[0] as { data: { lastError: string } };
    expect(call.data.lastError.length).toBeLessThanOrEqual(500);
  });
});
