// ============================================================================
// PUSH SERVER — Tests (smoke + key behavior)
// ============================================================================
// Cobertura enxuta mas cirúrgica:
//   1. isVapidConfigured() / getVapidPublicKey() — gating logic
//   2. subscribeUser() — dedup + reactivação
//   3. unsubscribeUser() — idempotente
//   4. sendPush() — 'no-subscriptions' quando vazio
//   5. sendPush() — 'logged' quando dev sem VAPID
//
// Refs: docs/PUSH-W13.md
// ============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock prisma — vamos interceptar antes de importar o módulo sob teste
const mockFindUnique = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockUpdateMany = vi.fn();
const mockDelete = vi.fn();
const mockFindMany = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    pushSubscription: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      create: (...args: unknown[]) => mockCreate(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
      updateMany: (...args: unknown[]) => mockUpdateMany(...args),
      delete: (...args: unknown[]) => mockDelete(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
  },
}));

// Import depois do mock
import {
  isVapidConfigured,
  getVapidPublicKey,
  subscribeUser,
  unsubscribeUser,
  sendPush,
} from '../push-server';

describe('push-server — VAPID config', () => {
  beforeEach(() => {
    delete process.env.VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;
  });

  it('isVapidConfigured() returns false when keys are missing', () => {
    expect(isVapidConfigured()).toBe(false);
  });

  it('isVapidConfigured() returns true when both keys are set', () => {
    process.env.VAPID_PUBLIC_KEY = 'BPublic_test_key';
    process.env.VAPID_PRIVATE_KEY = 'BPrivate_test_key';
    expect(isVapidConfigured()).toBe(true);
  });

  it('isVapidConfigured() returns false when only one key is set', () => {
    process.env.VAPID_PUBLIC_KEY = 'BPublic_test_key';
    expect(isVapidConfigured()).toBe(false);
  });

  it('getVapidPublicKey() returns empty string when not set', () => {
    expect(getVapidPublicKey()).toBe('');
  });
});

describe('push-server — subscribeUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates new subscription when endpoint is unknown', async () => {
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ id: 'sub_123' });

    const result = await subscribeUser('user_1', {
      endpoint: 'https://push.example.com/endpoint/abc',
      keys: { p256dh: 'pk1', auth: 'ak1' },
    });

    expect(result).toEqual({ id: 'sub_123', created: true });
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('updates existing subscription instead of creating duplicate', async () => {
    mockFindUnique.mockResolvedValue({ id: 'sub_existing', userId: 'user_1' });
    mockUpdate.mockResolvedValue({});

    const result = await subscribeUser('user_2', {
      endpoint: 'https://push.example.com/endpoint/existing',
      keys: { p256dh: 'pk2', auth: 'ak2' },
    });

    expect(result).toEqual({ id: 'sub_existing', created: false });
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockCreate).not.toHaveBeenCalled();
  });
});

describe('push-server — unsubscribeUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true when subscription exists and is deleted', async () => {
    mockDelete.mockResolvedValue({});
    const result = await unsubscribeUser('https://push.example.com/end');
    expect(result).toBe(true);
  });

  it('returns false when subscription does not exist (idempotent)', async () => {
    mockDelete.mockRejectedValue(new Error('not found'));
    const result = await unsubscribeUser('https://push.example.com/missing');
    expect(result).toBe(false);
  });
});

describe('push-server — sendPush', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;
    process.env.NODE_ENV = 'test';
  });

  it("returns 'no-subscriptions' when user has none", async () => {
    mockFindMany.mockResolvedValue([]);
    const result = await sendPush('user_x', {
      title: 'Test',
      body: 'No subs',
    });
    expect(result.channel).toBe('no-subscriptions');
    expect(result.sent).toBe(0);
  });

  it("returns 'logged' in dev without VAPID keys", async () => {
    mockFindMany.mockResolvedValue([
      { id: 's1', endpoint: 'https://e.com/1', p256dh: 'pk', auth: 'ak' },
    ]);
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const result = await sendPush('user_x', {
      title: 'Test',
      body: 'Dev mode',
    });

    expect(result.channel).toBe('logged');
    expect(result.sent).toBe(0);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("returns 'error' in production without VAPID keys", async () => {
    process.env.NODE_ENV = 'production';
    mockFindMany.mockResolvedValue([
      { id: 's1', endpoint: 'https://e.com/1', p256dh: 'pk', auth: 'ak' },
    ]);

    const result = await sendPush('user_x', {
      title: 'Test',
      body: 'Prod mode no vapid',
    });

    expect(result.channel).toBe('error');
    expect(result.success).toBe(false);
  });
});
