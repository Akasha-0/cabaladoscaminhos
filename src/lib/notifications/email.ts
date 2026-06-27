// ============================================================================
// NOTIFICATIONS — Email layer (Resend + console fallback)
// ============================================================================
// Provider: Resend (REST). Em dev, console.log ao invés de enviar.
//
// Futura evolução: trocar o `render` para React Email quando a dep for
// adicionada — basta substituir o conteúdo de `renderNotificationEmail`
// mantendo a mesma interface (subject, html, text).
// ============================================================================

import type { NotificationDto, NotificationType } from './types';

// ============================================================================
// Tipos
// ============================================================================

export interface EmailRenderResult {
  subject: string;
  html: string;
  text: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  /** Quando em dev (console), marca como 'logged'. */
  channel: 'resend' | 'logged' | 'error';
}

export interface EmailSendOptions {
  to: string;
  notification: NotificationDto;
  unsubscribeUrl: string;
  preferencesUrl: string;
  deleteAccountUrl: string;
}

// ============================================================================
// Templates — Render por tipo
// ============================================================================

/**
 * Renderiza o email para uma notificação. Retorna subject + HTML + texto
 * puro (fallback). A interface é estável — quando trocarmos para
 * React Email no futuro, basta trocar a implementação interna.
 */
export function renderNotificationEmail(
  notification: NotificationDto
): EmailRenderResult {
  const { type, actorSnapshot, payload } = notification;

  const actorName = actorSnapshot?.displayName ?? 'Alguém';
  const link = payload?.link ?? 'https://akasha.app';
  const excerpt = payload?.excerpt ?? '';

  const { subject, title, body } = renderByType(type, actorName, excerpt);

  const html = renderHtml({
    title,
    body,
    ctaUrl: link.startsWith('http') ? link : `https://akasha.app${link}`,
    ctaLabel: 'Ver no Akasha',
    notificationId: notification.id,
  });

  const text = `${title}\n\n${stripHtml(body)}\n\nAbra: ${
    link.startsWith('http') ? link : `https://akasha.app${link}`
  }`;

  return { subject, html, text };
}

function renderByType(
  type: NotificationType,
  actorName: string,
  excerpt: string
): { subject: string; title: string; body: string } {
  switch (type) {
    case 'LIKE':
      return {
        subject: `${actorName} curtiu seu post`,
        title: '❤️ Nova curtida',
        body: `<strong>${escapeHtml(actorName)}</strong> curtiu seu post${
          excerpt ? `: <em>"${escapeHtml(excerpt.slice(0, 200))}"</em>` : '.'
        }`,
      };
    case 'COMMENT':
      return {
        subject: `${actorName} comentou no seu post`,
        title: '💬 Novo comentário',
        body: `<strong>${escapeHtml(actorName)}</strong> comentou${
          excerpt ? `: <em>"${escapeHtml(excerpt.slice(0, 200))}"</em>` : ' no seu post.'
        }`,
      };
    case 'POST_REPLY':
      return {
        subject: `${actorName} respondeu seu comentário`,
        title: '↩️ Nova resposta',
        body: `<strong>${escapeHtml(actorName)}</strong> respondeu seu comentário${
          excerpt ? `: <em>"${escapeHtml(excerpt.slice(0, 200))}"</em>` : '.'
        }`,
      };
    case 'FOLLOW':
      return {
        subject: `${actorName} começou a seguir você`,
        title: '✨ Novo seguidor',
        body: `<strong>${escapeHtml(actorName)}</strong> começou a seguir você no Akasha.`,
      };
    case 'MENTION':
      return {
        subject: `${actorName} mencionou você`,
        title: '📢 Você foi mencionado',
        body: `<strong>${escapeHtml(actorName)}</strong> mencionou você${
          excerpt ? ` em: <em>"${escapeHtml(excerpt.slice(0, 200))}"</em>` : '.'
        }`,
      };
    case 'GROUP_INVITE':
      return {
        subject: `Convite para um grupo`,
        title: '🌱 Novo convite',
        body: `<strong>${escapeHtml(actorName)}</strong> convidou você para participar de um grupo.`,
      };
    case 'GROUP_POST':
      return {
        subject: `Novo post em um grupo que você participa`,
        title: '👥 Novo post no grupo',
        body: `<strong>${escapeHtml(actorName)}</strong> postou em um grupo que você participa${
          excerpt ? `: <em>"${escapeHtml(excerpt.slice(0, 200))}"</em>` : '.'
        }`,
      };
    case 'GROUP_ROLE_CHANGE':
      return {
        subject: `Mudança de papel no grupo`,
        title: '🛡️ Você mudou de papel',
        body: `<strong>${escapeHtml(actorName)}</strong> alterou seu papel no grupo.`,
      };
    case 'ARTICLE_RECOMMENDATION':
      return {
        subject: `Akasha IA: artigo recomendado para você`,
        title: '📚 Recomendação da Akasha',
        body: `Descobrimos um artigo que pode ressoar com sua jornada${
          excerpt ? `: <em>"${escapeHtml(excerpt.slice(0, 200))}"</em>` : '.'
        }`,
      };
    case 'ARTICLE_PUBLISHED':
      return {
        subject: `${actorName} publicou um artigo`,
        title: '📖 Novo artigo',
        body: `<strong>${escapeHtml(actorName)}</strong> publicou um novo artigo${
          excerpt ? `: <em>"${escapeHtml(excerpt.slice(0, 200))}"</em>` : '.'
        }`,
      };
    case 'SYSTEM_ALERT':
      return {
        subject: `Akasha — Alerta do sistema`,
        title: '⚠️ Alerta',
        body: escapeHtml(excerpt || 'Há um alerta do sistema.'),
      };
    case 'MODERATION_ACTION':
      return {
        subject: `Akasha — Ação de moderação`,
        title: '🛡️ Moderação',
        body: escapeHtml(excerpt || 'Houve uma ação de moderação em sua conta.'),
      };
    case 'DIGEST_WEEKLY':
      return {
        subject: `Seu resumo semanal Akasha`,
        title: '✨ Resumo da semana',
        body: excerpt
          ? escapeHtml(excerpt.slice(0, 1000))
          : 'Veja o que rolou na comunidade essa semana.',
      };
    default:
      return {
        subject: 'Akasha — Nova atividade',
        title: '🔔 Notificação',
        body: 'Há nova atividade para você no Akasha.',
      };
  }
}

// ============================================================================
// HTML wrapper — email-safe (table-based, inline styles, sem JS)
// ============================================================================

function renderHtml(args: {
  title: string;
  body: string;
  ctaUrl: string;
  ctaLabel: string;
  notificationId: string;
}): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(args.title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e2e8f0;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#0a0a1a;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background-color:#1e1b3a;border-radius:12px;overflow:hidden;border:1px solid #312e81;">
          <tr>
            <td style="background:linear-gradient(135deg,#f59e0b,#a855f7,#ec4899);padding:24px;text-align:center;">
              <h1 style="margin:0;font-size:24px;color:#fff;font-weight:600;">✨ Akasha Portal</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 24px;">
              <h2 style="margin:0 0 16px 0;font-size:20px;color:#fbbf24;">${escapeHtml(args.title)}</h2>
              <p style="margin:0 0 24px 0;font-size:16px;line-height:24px;color:#cbd5e1;">${args.body}</p>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding:8px 0 24px 0;">
                    <a href="${escapeAttr(args.ctaUrl)}" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#f59e0b,#a855f7);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">${escapeHtml(args.ctaLabel)}</a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0 0;font-size:12px;color:#64748b;line-height:18px;">
                Notificação ID: <code style="background:#0f172a;padding:2px 6px;border-radius:4px;">${escapeHtml(args.notificationId)}</code>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#0f172a;padding:20px 24px;border-top:1px solid #1e293b;">
              <p style="margin:0 0 8px 0;font-size:12px;color:#94a3b8;line-height:18px;text-align:center;">
                Você está recebendo isso porque tem conta no Akasha Portal.
              </p>
              <p style="margin:0;font-size:11px;color:#64748b;text-align:center;line-height:18px;">
                <a href="{{preferencesUrl}}" style="color:#a78bfa;text-decoration:underline;">Preferências</a>
                ·
                <a href="{{unsubscribeUrl}}" style="color:#a78bfa;text-decoration:underline;">Cancelar inscrição deste tipo</a>
                ·
                <a href="{{deleteAccountUrl}}" style="color:#f87171;text-decoration:underline;">Excluir minha conta (LGPD)</a>
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0 0;font-size:11px;color:#475569;text-align:center;">
          Akasha Portal · Cabala dos Caminhos · 2026
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ============================================================================
// Send — Resend (com fallback console)
// ============================================================================

export async function sendNotificationEmail(
  opts: EmailSendOptions
): Promise<EmailSendResult> {
  const { to, notification } = opts;

  const rendered = renderNotificationEmail(notification);

  // Substituir placeholders pelos URLs reais (mantém o template reutilizável)
  const html = rendered.html
    .replace(/\{\{unsubscribeUrl\}\}/g, escapeAttr(opts.unsubscribeUrl))
    .replace(/\{\{preferencesUrl\}\}/g, escapeAttr(opts.preferencesUrl))
    .replace(/\{\{deleteAccountUrl\}\}/g, escapeAttr(opts.deleteAccountUrl));

  // 1) Dev mode — console.log ao invés de enviar (regra do task)
  if (
    process.env.NODE_ENV !== 'production' ||
    !process.env.RESEND_API_KEY
  ) {
    // eslint-disable-next-line no-console
    console.log('[notifications/email] (dev) would send:', {
      to,
      subject: rendered.subject,
      notificationId: notification.id,
      type: notification.type,
    });
    return { success: true, channel: 'logged' };
  }

  // 2) Prod — chamar Resend
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: process.env.NOTIFICATION_EMAIL_FROM || 'Akasha <no-reply@akasha.app>',
        to: [to],
        subject: rendered.subject,
        html,
        text: rendered.text,
        tags: [
          { name: 'notification_id', value: notification.id },
          { name: 'notification_type', value: notification.type },
        ],
        headers: {
          'List-Unsubscribe': `<${opts.unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      return {
        success: false,
        error: `Resend ${res.status}: ${errBody.slice(0, 200)}`,
        channel: 'error',
      };
    }

    const data = (await res.json()) as { id?: string };
    return { success: true, messageId: data.id, channel: 'resend' };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'unknown',
      channel: 'error',
    };
  }
}

// ============================================================================
// Helpers de escape (email-safe)
// ============================================================================

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(s: string): string {
  return escapeHtml(s);
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}
