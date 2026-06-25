/** @vitest-environment node */
/**
 * Notification preferences helper tests — D-048 (Wave 18.2).
 *
 * Cobre:
 *   1. getUserPreferences — default all-enabled quando user não tem rows.
 *   2. getUserPreferences — merge correto de rows existentes com defaults.
 *   3. setPreference — upsert cria row nova quando não existe.
 *   4. setPreference — upsert atualiza row existente.
 *   5. isTypeEnabled — default true (opt-out) sem row.
 *   6. isTypeEnabled — false quando row.enabled = false.
 *   7. setPreference — type inválido rejeita.
 *   8. setPreference — userId vazio rejeita.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mocks ───────────────────────────────────────────────────────────
const mockFindMany = vi.fn();
const mockUpsert = vi.fn();
const mockFindUnique = vi.fn();

vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: {
    notificationPreference: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      upsert: (...args: unknown[]) => mockUpsert(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
  },
}));

import {
  getUserPreferences,
  setPreference,
  isTypeEnabled,
  ALL_NOTIFICATION_TYPES,
} from './preferences';
import type { NotificationType } from '@prisma/client';

describe('Notification preferences — D-048', () => {
  beforeEach(() => {
    mockFindMany.mockReset();
    mockUpsert.mockReset();
    mockFindUnique.mockReset();
  });

  // ─── ALL_NOTIFICATION_TYPES ────────────────────────────────────────
  describe('ALL_NOTIFICATION_TYPES', () => {
    it('contains the 5 canonical types', () => {
      expect(ALL_NOTIFICATION_TYPES).toEqual([
        'DIARIO',
        'MENTOR',
        'CONEXOES',
        'CREDITS',
        'SYSTEM',
      ]);
    });
  });

  // ─── getUserPreferences ────────────────────────────────────────────
  describe('getUserPreferences', () => {
    it('rejects empty userId', async () => {
      await expect(getUserPreferences('')).rejects.toThrow(/userId/);
    });

    it('returns all 5 types with enabled:true when user has no rows', async () => {
      mockFindMany.mockResolvedValueOnce([]);
      const prefs = await getUserPreferences('user-1');
      expect(prefs).toHaveLength(5);
      for (const p of prefs) {
        expect(p.type).toBeDefined();
        expect(p.enabled).toBe(true);
      }
    });

    it('merges persisted rows with defaults', async () => {
      mockFindMany.mockResolvedValueOnce([
        {
          type: 'DIARIO' as NotificationType,
          enabled: false,
          updatedAt: new Date('2026-06-20T10:00:00Z'),
        },
        {
          type: 'MENTOR' as NotificationType,
          enabled: true,
          updatedAt: new Date('2026-06-21T10:00:00Z'),
        },
      ]);
      const prefs = await getUserPreferences('user-1');
      const byType = Object.fromEntries(prefs.map((p) => [p.type, p]));
      expect(byType.DIARIO.enabled).toBe(false);
      expect(byType.DIARIO.updatedAt).toBe('2026-06-20T10:00:00.000Z');
      expect(byType.MENTOR.enabled).toBe(true);
      // Tipos sem row → default habilitado
      expect(byType.CONEXOES.enabled).toBe(true);
      expect(byType.CREDITS.enabled).toBe(true);
      expect(byType.SYSTEM.enabled).toBe(true);
    });
  });

  // ─── setPreference ─────────────────────────────────────────────────
  describe('setPreference', () => {
    it('rejects empty userId', async () => {
      await expect(setPreference('', 'DIARIO', true)).rejects.toThrow(/userId/);
    });

    it('rejects invalid type', async () => {
      await expect(
        setPreference('user-1', 'BOGUS' as NotificationType, true)
      ).rejects.toThrow(/type inválido/);
    });

    it('upserts with composite key userId_type', async () => {
      mockUpsert.mockResolvedValueOnce({
        type: 'DIARIO' as NotificationType,
        enabled: false,
        updatedAt: new Date('2026-06-24T10:00:00Z'),
      });
      await setPreference('user-1', 'DIARIO', false);
      expect(mockUpsert).toHaveBeenCalledWith({
        where: { userId_type: { userId: 'user-1', type: 'DIARIO' } },
        create: { userId: 'user-1', type: 'DIARIO', enabled: false },
        update: { enabled: false },
        select: { type: true, enabled: true, updatedAt: true },
      });
    });

    it('returns updated DTO with ISO string updatedAt', async () => {
      mockUpsert.mockResolvedValueOnce({
        type: 'CONEXOES' as NotificationType,
        enabled: true,
        updatedAt: new Date('2026-06-24T15:30:00.000Z'),
      });
      const dto = await setPreference('user-1', 'CONEXOES', true);
      expect(dto.type).toBe('CONEXOES');
      expect(dto.enabled).toBe(true);
      expect(dto.updatedAt).toBe('2026-06-24T15:30:00.000Z');
    });
  });

  // ─── isTypeEnabled ─────────────────────────────────────────────────
  describe('isTypeEnabled', () => {
    it('returns true for empty userId (safety)', async () => {
      const result = await isTypeEnabled('', 'DIARIO');
      expect(result).toBe(true);
      expect(mockFindUnique).not.toHaveBeenCalled();
    });

    it('returns true when no row exists (opt-out default)', async () => {
      mockFindUnique.mockResolvedValueOnce(null);
      const result = await isTypeEnabled('user-1', 'DIARIO');
      expect(result).toBe(true);
    });

    it('returns false when row.enabled = false', async () => {
      mockFindUnique.mockResolvedValueOnce({ enabled: false });
      const result = await isTypeEnabled('user-1', 'MENTOR');
      expect(result).toBe(false);
    });

    it('returns true when row.enabled = true', async () => {
      mockFindUnique.mockResolvedValueOnce({ enabled: true });
      const result = await isTypeEnabled('user-1', 'SYSTEM');
      expect(result).toBe(true);
    });
  });
});
