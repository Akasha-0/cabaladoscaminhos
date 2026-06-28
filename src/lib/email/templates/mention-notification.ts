// ============================================================================
// MENTION NOTIFICATION — alguém te mencionou (Wave 20, 2026-06-28)
// ============================================================================
// Email prioritário (não agrupa) — menção direta é alta relevância.
// ============================================================================

import { renderLayout, renderCta, escapeHtml } from '@/lib/email/layout';
import type { RenderOptions, RenderedTemplate } from '@/lib/email/templates/index';

export interface MentionNotificationData {
  recipientName: string;
  actorName: string;
  /** Contexto onde a menção apareceu: 'post' | 'comment'. */
  context: 'post' | 'comment';
  /** Preview do texto onde a menção aparece. */
  mentionPreview: string;
  /** URL do post/comentário. */
  url: string;
}

export function renderMentionNotification(data: MentionNotificationData, options: RenderOptions = {}): RenderedTemplate {
  const subject = `📣 ${data.actorName} te mencionou em ${data.context === 'comment' ? 'um comentário' : 'um post'}`;

  const bodyHtml = `
    <h1 class="h1" style="font-family:Georgia,serif;font-size:24px;line-height:32px;color:#222;margin:0 0 16px 0;font-weight:normal;">
      ${escapeHtml(data.actorName)} te mencionou
    </h1>
    <p class="body-text" style="font-family:Georgia,serif;font-size:16px;line-height:24px;color:#444;margin:0 0 16px 0;">
      Olá, ${escapeHtml(data.recipientName)}. ${escapeHtml(data.actorName)} citou você ${data.context === 'comment' ? 'em um comentário' : 'em um post'} — você talvez queira responder.
    </p>
    <blockquote style="border-left:3px solid #5b3a8a;background:#faf8f3;padding:14px 18px;margin:24px 0;font-family:Georgia,serif;font-size:15px;line-height:24px;color:#333;border-radius:0 4px 4px 0;">
      ${escapeHtml(truncate(data.mentionPreview, 320))}
    </blockquote>
    ${renderCta({ label: 'Responder →', href: data.url })}
  `;

  const html = renderLayout({
    bodyHtml,
    preheader: `${data.actorName} te mencionou: "${truncate(data.mentionPreview, 80)}"`,
    subject,
    footer: 'marketing',
    unsubscribeToken: options.unsubscribeToken,
    unsubscribeType: 'mention',
  });

  const text = `${data.actorName} te mencionou em ${data.context}:\n\n"${data.mentionPreview}"\n\nResponder: ${data.url}\n\nEquipe Cabala dos Caminhos`;

  return { subject, html, text };
}

function truncate(s: string, max: number): string {
  const t = s.trim().replace(/\s+/g, ' ');
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trimEnd() + '…';
}
