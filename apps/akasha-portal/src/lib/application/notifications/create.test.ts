/** @vitest-environment node */
/**
 * createNotification helper tests — D-046 (Wave 13.3).
 *
 * Cobre:
 *   1. Validação de campos (title/body obrigatórios, limites, href sanity).
 *   2. Criação bem-sucedida com prisma mockado.
 *   3. Serialização correta para DTO (Date → ISO string).
 *   4. Sanity do href (bloqueia javascript:/data:, aceita / e https://).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock prisma ANTES de importar o módulo sob teste.
const mockCreate = vi.fn();
const mockPrefFindUnique = vi.fn();
vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: {
    notification: {
      create: (...args: unknown[]) => mockCreate(...args),
    },
    notificationPreference: {
      // Opt-out check (Wave 18.2 / D-048). Default: row não existe → habilitado.
      findUnique: (...args: unknown[]) => mockPrefFindUnique(...args),
    },
  },
}));

import {
  createNotification,
  NotificationValidationError,
  toDTO,
} from './create';
import { NotificationType } from '@prisma/client';

describe('createNotification', () => {
  beforeEach(() => {
    mockCreate.mockReset();
    mockPrefFindUnique.mockReset();
    // Default: user tem preference habilitada (null = opt-out default).
    mockPrefFindUnique.mockResolvedValue(null);
  });

  // ─── Validação ─────────────────────────────────────────────────────
  describe('validation', () => {
    it('rejects empty userId', async () => {
      await expect(
        createNotification('', {
          type: NotificationType.DIARIO,
          title: 'X',
          body: 'Y',
        })
      ).rejects.toThrow(NotificationValidationError);
    });

    it('rejects empty title', async () => {
      await expect(
        createNotification('user-1', {
          type: NotificationType.DIARIO,
          title: '   ',
          body: 'Y',
        })
      ).rejects.toThrow(/title é obrigatório/);
    });

    it('rejects empty body', async () => {
      await expect(
        createNotification('user-1', {
          type: NotificationType.DIARIO,
          title: 'X',
          body: '',
        })
      ).rejects.toThrow(/body é obrigatório/);
    });

    it('rejects title > 120 chars', async () => {
      const longTitle = 'a'.repeat(121);
      await expect(
        createNotification('user-1', {
          type: NotificationType.DIARIO,
          title: longTitle,
          body: 'Y',
        })
      ).rejects.toThrow(/title excede 120/);
    });

    it('accepts title = 120 chars exactly', async () => {
      const title = 'a'.repeat(120);
      mockCreate.mockResolvedValueOnce({
        id: 'n1',
        type: NotificationType.DIARIO,
        title,
        body: 'Y',
        href: null,
        readAt: null,
        createdAt: new Date('2026-06-24T10:00:00Z'),
      });
      const dto = await createNotification('user-1', {
        type: NotificationType.DIARIO,
        title,
        body: 'Y',
      });
      expect(dto).not.toBeNull();
      expect(dto!.title).toBe(title);
    });

    it('rejects body > 500 chars', async () => {
      await expect(
        createNotification('user-1', {
          type: NotificationType.DIARIO,
          title: 'X',
          body: 'b'.repeat(501),
        })
      ).rejects.toThrow(/body excede 500/);
    });

    it('rejects href starting with javascript:', async () => {
      await expect(
        createNotification('user-1', {
          type: NotificationType.SYSTEM,
          title: 'X',
          body: 'Y',
          href: 'javascript:alert(1)',
        })
      ).rejects.toThrow(/href deve começar/);
    });

    it('rejects href starting with data:', async () => {
      await expect(
        createNotification('user-1', {
          type: NotificationType.SYSTEM,
          title: 'X',
          body: 'Y',
          href: 'data:text/html,<script>alert(1)</script>',
        })
      ).rejects.toThrow(/href deve começar/);
    });

    it('accepts internal href starting with /', async () => {
      mockCreate.mockResolvedValueOnce({
        id: 'n1',
        type: NotificationType.DIARIO,
        title: 'X',
        body: 'Y',
        href: '/pt-BR/diario/123',
        readAt: null,
        createdAt: new Date(),
      });
      const dto = await createNotification('user-1', {
        type: NotificationType.DIARIO,
        title: 'X',
        body: 'Y',
        href: '/pt-BR/diario/123',
      });
      expect(dto).not.toBeNull();
      expect(dto!.href).toBe('/pt-BR/diario/123');
    });

    it('accepts external href starting with https://', async () => {
      mockCreate.mockResolvedValueOnce({
        id: 'n1',
        type: NotificationType.SYSTEM,
        title: 'X',
        body: 'Y',
        href: 'https://akasha.app/changelog',
        readAt: null,
        createdAt: new Date(),
      });
      const dto = await createNotification('user-1', {
        type: NotificationType.SYSTEM,
        title: 'X',
        body: 'Y',
        href: 'https://akasha.app/changelog',
      });
      expect(dto).not.toBeNull();
      expect(dto!.href).toBe('https://akasha.app/changelog');
    });
  });

  // ─── Criação bem-sucedida ──────────────────────────────────────────
  describe('happy path', () => {
    it('passes userId + validated fields to prisma.notification.create', async () => {
      mockCreate.mockResolvedValueOnce({
        id: 'n1',
        type: NotificationType.MENTOR,
        title: 'Resposta do Mentor',
        body: 'O Mentor respondeu sua pergunta sobre Cabala.',
        href: '/pt-BR/oraculo',
        readAt: null,
        createdAt: new Date('2026-06-24T10:00:00Z'),
      });

      await createNotification('user-abc', {
        type: NotificationType.MENTOR,
        title: '  Resposta do Mentor  ', // tem whitespace nas pontas
        body: 'O Mentor respondeu sua pergunta sobre Cabala.',
        href: '/pt-BR/oraculo',
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          userId: 'user-abc',
          type: NotificationType.MENTOR,
          title: 'Resposta do Mentor', // trimmed
          body: 'O Mentor respondeu sua pergunta sobre Cabala.',
          href: '/pt-BR/oraculo',
        },
        select: {
          id: true,
          type: true,
          title: true,
          body: true,
          href: true,
          readAt: true,
          createdAt: true,
        },
      });
    });

    it('serializes createdAt and readAt as ISO strings in the DTO', async () => {
      const created = new Date('2026-06-24T10:00:00.000Z');
      const read = new Date('2026-06-24T11:30:00.000Z');
      mockCreate.mockResolvedValueOnce({
        id: 'n1',
        type: NotificationType.CREDITS,
        title: 'Saldo baixo',
        body: 'Você tem menos de 5 créditos.',
        href: '/pt-BR/conta/creditos',
        readAt: read,
        createdAt: created,
      });

      const dto = await createNotification('user-1', {
        type: NotificationType.CREDITS,
        title: 'Saldo baixo',
        body: 'Você tem menos de 5 créditos.',
        href: '/pt-BR/conta/creditos',
      });

      expect(dto).not.toBeNull();
      expect(dto!.createdAt).toBe('2026-06-24T10:00:00.000Z');
      expect(dto!.readAt).toBe('2026-06-24T11:30:00.000Z');
    });

    it('returns readAt: null when unread', async () => {
      mockCreate.mockResolvedValueOnce({
        id: 'n1',
        type: NotificationType.DIARIO,
        title: 'X',
        body: 'Y',
        href: null,
        readAt: null,
        createdAt: new Date(),
      });
      const dto = await createNotification('user-1', {
        type: NotificationType.DIARIO,
        title: 'X',
        body: 'Y',
      });
      expect(dto).not.toBeNull();
      expect(dto!.readAt).toBeNull();
    });
  });

  // ─── toDTO standalone (reusado pela API GET) ──────────────────────
  describe('toDTO', () => {
    it('converts null readAt to null ISO string', () => {
      const dto = toDTO({
        id: 'n1',
        type: NotificationType.SYSTEM,
        title: 'T',
        body: 'B',
        href: null,
        readAt: null,
        createdAt: new Date('2026-06-24T10:00:00Z'),
      });
      expect(dto.readAt).toBeNull();
      expect(dto.createdAt).toBe('2026-06-24T10:00:00.000Z');
    });

    it('preserves href value', () => {
      const dto = toDTO({
        id: 'n1',
        type: NotificationType.CONEXOES,
        title: 'T',
        body: 'B',
        href: '/pt-BR/conexoes',
        readAt: null,
        createdAt: new Date(),
      });
      expect(dto.href).toBe('/pt-BR/conexoes');
    });
  });

  // ─── Opt-out check (Wave 18.2 / D-048) ─────────────────────────────
  describe('opt-out preference check', () => {
    it('creates notification when preference is enabled (no row)', async () => {
      // Default beforeEach: mockPrefFindUnique.mockResolvedValue(null) → enabled.
      mockCreate.mockResolvedValueOnce({
        id: 'n1',
        type: NotificationType.DIARIO,
        title: 'X',
        body: 'Y',
        href: null,
        readAt: null,
        createdAt: new Date('2026-06-24T10:00:00Z'),
      });
      const dto = await createNotification('user-1', {
        type: NotificationType.DIARIO,
        title: 'X',
        body: 'Y',
      });
      expect(dto).not.toBeNull();
      expect(dto!.id).toBe('n1');
      expect(mockCreate).toHaveBeenCalledOnce();
    });

    it('creates notification when preference row.enabled = true', async () => {
      mockPrefFindUnique.mockResolvedValueOnce({ enabled: true });
      mockCreate.mockResolvedValueOnce({
        id: 'n1',
        type: NotificationType.MENTOR,
        title: 'X',
        body: 'Y',
        href: null,
        readAt: null,
        createdAt: new Date(),
      });
      const dto = await createNotification('user-1', {
        type: NotificationType.MENTOR,
        title: 'X',
        body: 'Y',
      });
      expect(dto).not.toBeNull();
      expect(mockCreate).toHaveBeenCalledOnce();
    });

    it('SKIPS creation and returns null when preference is disabled', async () => {
      mockPrefFindUnique.mockResolvedValueOnce({ enabled: false });
      const dto = await createNotification('user-1', {
        type: NotificationType.DIARIO,
        title: 'X',
        body: 'Y',
      });
      expect(dto).toBeNull();
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('opt-out check happens AFTER validation (invalid input still throws)', async () => {
      mockPrefFindUnique.mockResolvedValueOnce({ enabled: false });
      await expect(
        createNotification('user-1', {
          type: NotificationType.DIARIO,
          title: '',
          body: 'Y',
        })
      ).rejects.toThrow(NotificationValidationError);
      // Preference mock nunca deve ser chamado se validação falhar antes.
      // (validação vem antes do opt-out check por design — falha rápido.)
    });
  });
});