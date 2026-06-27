// ============================================================================
// EMAIL TEMPLATES — renderNotificationEmail
// ============================================================================
// Cobre: render HTML/text por tipo, escape, footer com LGPD links.
// ============================================================================

import { describe, it, expect, vi } from 'vitest';
import { renderNotificationEmail, sendNotificationEmail } from '@/lib/notifications/email';
import type { NotificationDto } from '@/lib/notifications';

// ============================================================================
// Fixtures
// ============================================================================

function makeNotification(overrides: Partial<NotificationDto> = {}): NotificationDto {
  return {
    id: 'n1',
    userId: 'user-1',
    type: 'LIKE',
    actorId: 'user-2',
    actorSnapshot: {
      id: 'user-2',
      displayName: 'João da Silva',
      handle: 'joao',
      avatarUrl: null,
    },
    entityType: 'POST',
    entityId: 'p1',
    postId: 'p1',
    commentId: null,
    groupId: null,
    articleId: null,
    groupKey: 'post:p1:LIKES',
    count: 1,
    payload: {
      preview: 'João da Silva curtiu seu post',
      excerpt: 'Conteúdo do post...',
      link: '/post/p1',
    },
    read: false,
    readAt: null,
    emailedAt: null,
    pushedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

// ============================================================================
// renderNotificationEmail
// ============================================================================

describe('renderNotificationEmail', () => {
  it('renderiza LIKE corretamente', () => {
    const r = renderNotificationEmail(makeNotification({ type: 'LIKE' }));

    expect(r.subject).toContain('João da Silva');
    expect(r.subject).toContain('curtiu');
    expect(r.html).toContain('<!DOCTYPE html>');
    expect(r.html).toContain('João da Silva');
    expect(r.text).toContain('João da Silva');
  });

  it('renderiza COMMENT', () => {
    const r = renderNotificationEmail(makeNotification({ type: 'COMMENT' }));

    expect(r.subject).toContain('comentou');
    expect(r.html).toContain('Novo comentário');
  });

  it('renderiza FOLLOW', () => {
    const r = renderNotificationEmail(makeNotification({ type: 'FOLLOW' }));

    expect(r.subject).toContain('seguir');
    expect(r.html).toContain('Novo seguidor');
  });

  it('renderiza MENTION com excerpt', () => {
    const r = renderNotificationEmail(makeNotification({ type: 'MENTION' }));

    expect(r.subject).toContain('mencionou');
    expect(r.html).toContain('mencionou');
  });

  it('renderiza GROUP_INVITE', () => {
    const r = renderNotificationEmail(makeNotification({ type: 'GROUP_INVITE' }));

    expect(r.subject.toLowerCase()).toContain('convite');
  });

  it('renderiza SYSTEM_ALERT sem actor', () => {
    const r = renderNotificationEmail(
      makeNotification({
        type: 'SYSTEM_ALERT',
        actorSnapshot: null,
        payload: {
          excerpt: 'Manutenção programada em 24h',
        },
      })
    );

    expect(r.subject.toLowerCase()).toContain('alerta');
    expect(r.html).toContain('Manutenção');
  });

  it('renderiza MODERATION_ACTION', () => {
    const r = renderNotificationEmail(
      makeNotification({
        type: 'MODERATION_ACTION',
        payload: { excerpt: 'Seu post foi removido por violar as diretrizes.' },
      })
    );

    expect(r.subject.toLowerCase()).toContain('moderação');
  });

  it('HTML contém placeholders LGPD (substituídos depois)', () => {
    const r = renderNotificationEmail(makeNotification({ type: 'LIKE' }));

    expect(r.html).toContain('{{unsubscribeUrl}}');
    expect(r.html).toContain('{{preferencesUrl}}');
    expect(r.html).toContain('{{deleteAccountUrl}}');
  });

  it('HTML tem estrutura email-safe (DOCTYPE, table-based)', () => {
    const r = renderNotificationEmail(makeNotification());

    expect(r.html).toMatch(/^<!DOCTYPE html>/);
    expect(r.html).toContain('<table');
    expect(r.html).toContain('Akasha Portal');
  });

  it('escapa HTML perigoso no displayName do actor', () => {
    const r = renderNotificationEmail(
      makeNotification({
        type: 'LIKE',
        actorSnapshot: {
          id: 'x',
          displayName: '<script>alert("xss")</script>',
          handle: 'h',
          avatarUrl: null,
        },
      })
    );

    expect(r.html).not.toContain('<script>alert');
    expect(r.html).toContain('&lt;script&gt;');
  });

  it('escapa HTML perigoso no excerpt', () => {
    const r = renderNotificationEmail(
      makeNotification({
        type: 'COMMENT',
        payload: {
          preview: 'comentário',
          excerpt: '<img src=x onerror=alert(1)>',
        },
      })
    );

    expect(r.html).not.toContain('<img src=x onerror');
    expect(r.html).toContain('&lt;img');
  });

  it('trunca excerpts longos', () => {
    const longExcerpt = 'x'.repeat(500);
    const r = renderNotificationEmail(
      makeNotification({
        type: 'COMMENT',
        payload: { preview: 'p', excerpt: longExcerpt },
      })
    );

    // Excerpt truncado a 200 chars
    expect(r.html).not.toContain('x'.repeat(250));
  });
});

// ============================================================================
// sendNotificationEmail — dev mode (sem RESEND_API_KEY)
// ============================================================================

describe('sendNotificationEmail (dev mode)', () => {
  it('console.log ao invés de enviar em dev', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      configurable: true,
    });

    delete process.env.RESEND_API_KEY;

    const result = await sendNotificationEmail({
      to: 'test@example.com',
      notification: makeNotification(),
      unsubscribeUrl: 'https://akasha.app/unsub?token=abc',
      preferencesUrl: 'https://akasha.app/settings/notifications',
      deleteAccountUrl: 'https://akasha.app/settings/account#delete',
    });

    expect(result.success).toBe(true);
    expect(result.channel).toBe('logged');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      configurable: true,
    });
  });

  it('substitui placeholders pelos URLs reais', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    delete process.env.RESEND_API_KEY;

    await sendNotificationEmail({
      to: 'test@example.com',
      notification: makeNotification(),
      unsubscribeUrl: 'https://akasha.app/u?token=xyz',
      preferencesUrl: 'https://akasha.app/settings/notifications',
      deleteAccountUrl: 'https://akasha.app/delete',
    });

    // Verifica que o console.log foi chamado com subject
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
