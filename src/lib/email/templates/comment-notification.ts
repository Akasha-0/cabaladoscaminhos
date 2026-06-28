// ============================================================================
// COMMENT NOTIFICATION — alguém comentou no seu post (Wave 20, 2026-06-28)
// ============================================================================
// Mostra preview do comentário + CTA para responder. Batchable via
// `count` (ex: "5 pessoas comentaram" → 1 email com count=5).
// ============================================================================

import { renderLayout, renderCta, escapeHtml } from '@/lib/email/layout';
import type { RenderOptions, RenderedTemplate } from '@/lib/email/templates/index';

export interface CommentNotificationData {
  recipientName: string;
  /** Nome do autor do comentário (já desambiguado se vários). */
  actorName: string;
  /** Quantos comentários (default 1). Para batching futuro. */
  count: number;
  /** Preview do comentário (até ~280 chars). */
  commentPreview: string;
  /** URL do post (âncora direta no comentário). */
  postUrl: string;
  /** Tradição do post (opcional, para flavor). */
  tradition?: string | null;
}

export function renderCommentNotification(data: CommentNotificationData, options: RenderOptions = {}): RenderedTemplate {
  const verb = data.count > 1 ? `${data.count} pessoas comentaram` : `${data.actorName} comentou`;
  const subject = `💬 ${verb} no seu post`;

  const bodyHtml = `
    <h1 class="h1" style="font-family:Georgia,serif;font-size:24px;line-height:32px;color:#222;margin:0 0 16px 0;font-weight:normal;">
      ${data.count > 1 ? `${data.count} novos comentários` : `${escapeHtml(data.actorName)} comentou`}
    </h1>
    <p class="body-text" style="font-family:Georgia,serif;font-size:16px;line-height:24px;color:#444;margin:0 0 16px 0;">
      Olá, ${escapeHtml(data.recipientName)}. ${data.count > 1 ? `Vários caminhantes estão engajando com seu post.` : `${escapeHtml(data.actorName)} deixou um comentário no seu post${data.tradition ? ` em <em>${escapeHtml(data.tradition)}</em>` : ''}.`}
    </p>

    <blockquote style="border-left:3px solid #5b3a8a;background:#faf8f3;padding:14px 18px;margin:24px 0;font-family:Georgia,serif;font-size:15px;line-height:24px;color:#333;font-style:italic;border-radius:0 4px 4px 0;">
      "${escapeHtml(truncate(data.commentPreview, 280))}"
    </blockquote>

    ${renderCta({ label: 'Ver e responder →', href: data.postUrl })}
  `;

  const html = renderLayout({
    bodyHtml,
    preheader: `${data.actorName} comentou: "${truncate(data.commentPreview, 80)}"`,
    subject,
    footer: 'marketing',
    unsubscribeToken: options.unsubscribeToken,
    unsubscribeType: 'comment',
  });

  const text = `${data.actorName} comentou no seu post:\n\n"${data.commentPreview}"\n\nVer: ${data.postUrl}\n\nEquipe Cabala dos Caminhos`;

  return { subject, html, text };
}

function truncate(s: string, max: number): string {
  const t = s.trim().replace(/\s+/g, ' ');
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trimEnd() + '…';
}
