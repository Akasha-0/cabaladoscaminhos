// ============================================================================
// LIKE NOTIFICATION — alguém curtiu seu post (Wave 20, 2026-06-28)
// ============================================================================
// Email curto. Quando count >= 3, agrupa ("12 caminhantes curtiram").
// ============================================================================

import { renderLayout, renderCta, escapeHtml } from '@/lib/email/layout';
import type { RenderOptions, RenderedTemplate } from '@/lib/email/templates/index';

export interface LikeNotificationData {
  recipientName: string;
  actorName: string;
  count: number;
  postUrl: string;
  /** Preview opcional do post. */
  postPreview?: string;
}

export function renderLikeNotification(data: LikeNotificationData, options: RenderOptions = {}): RenderedTemplate {
  const verb =
    data.count === 1
      ? `${data.actorName} curtiu`
      : data.count <= 5
        ? `${data.count} caminhantes curtiram`
        : `${data.count} pessoas curtiram`;

  const subject = `❤️ ${verb} seu post`;

  const previewHtml = data.postPreview
    ? `<blockquote style="border-left:3px solid #d4a373;background:#faf8f3;padding:14px 18px;margin:24px 0;font-family:Georgia,serif;font-size:15px;line-height:24px;color:#333;font-style:italic;border-radius:0 4px 4px 0;">
        "${escapeHtml(truncate(data.postPreview, 200))}"
      </blockquote>`
    : '';

  const bodyHtml = `
    <h1 class="h1" style="font-family:Georgia,serif;font-size:24px;line-height:32px;color:#222;margin:0 0 16px 0;font-weight:normal;">
      ${data.count === 1 ? `${escapeHtml(data.actorName)} curtiu seu post` : `${data.count} curtidas no seu post`}
    </h1>
    <p class="body-text" style="font-family:Georgia,serif;font-size:16px;line-height:24px;color:#444;margin:0 0 16px 0;">
      Olá, ${escapeHtml(data.recipientName)}. ${data.count === 1 ? `${escapeHtml(data.actorName)} curtiu sua partilha.` : `Sua partilha está ressoando — ${data.count} pessoas demonstraram apreço.`}
    </p>
    ${previewHtml}
    ${renderCta({ label: 'Ver post →', href: data.postUrl })}
  `;

  const html = renderLayout({
    bodyHtml,
    preheader: `${verb} seu post`,
    subject,
    footer: 'marketing',
    unsubscribeToken: options.unsubscribeToken,
    unsubscribeType: 'like',
  });

  const text = `${verb} seu post.\n\nVer: ${data.postUrl}\n\nEquipe Cabala dos Caminhos`;

  return { subject, html, text };
}

function truncate(s: string, max: number): string {
  const t = s.trim().replace(/\s+/g, ' ');
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trimEnd() + '…';
}
