// ============================================================================
// FOLLOW NOTIFICATION — novo seguidor (Wave 20, 2026-06-28)
// ============================================================================
// Tom acolhedor. Agrupa quando >= 3 seguidores no mesmo digest.
// ============================================================================

import { renderLayout, renderCta, escapeHtml } from '@/lib/email/layout';
import type { RenderOptions, RenderedTemplate } from '@/lib/email/templates/index';

export interface FollowNotificationData {
  recipientName: string;
  actorName: string;
  /** Quantos novos seguidores (default 1). */
  count: number;
  /** URL do perfil do destinatário (para ver seguidores). */
  profileUrl: string;
  /** Bio curta do actor (opcional). */
  actorBio?: string | null;
}

export function renderFollowNotification(data: FollowNotificationData, options: RenderOptions = {}): RenderedTemplate {
  const subject =
    data.count === 1
      ? `🚶 ${data.actorName} começou a te seguir`
      : `🚶 ${data.count} novos caminhantes te seguiram`;

  const bioHtml = data.count === 1 && data.actorBio
    ? `<p class="body-text" style="font-family:Georgia,serif;font-size:15px;line-height:22px;color:#666;margin:16px 0 0 0;font-style:italic;">${escapeHtml(data.actorBio)}</p>`
    : '';

  const bodyHtml = `
    <h1 class="h1" style="font-family:Georgia,serif;font-size:24px;line-height:32px;color:#222;margin:0 0 16px 0;font-weight:normal;">
      ${data.count === 1 ? `${escapeHtml(data.actorName)} te segue agora` : `${data.count} novos seguidores`}
    </h1>
    <p class="body-text" style="font-family:Georgia,serif;font-size:16px;line-height:24px;color:#444;margin:0 0 16px 0;">
      Olá, ${escapeHtml(data.recipientName)}. ${data.count === 1 ? `${escapeHtml(data.actorName)} quer acompanhar suas partilhas.` : `${data.count} pessoas começaram a acompanhar suas partilhas.`}
    </p>
    ${bioHtml}
    ${renderCta({ label: 'Ver perfil →', href: data.profileUrl })}
  `;

  const html = renderLayout({
    bodyHtml,
    preheader: data.count === 1 ? `${data.actorName} começou a te seguir` : `${data.count} novos seguidores`,
    subject,
    footer: 'marketing',
    unsubscribeToken: options.unsubscribeToken,
    unsubscribeType: 'follow',
  });

  const text = data.count === 1
    ? `${data.actorName} começou a te seguir.\n\nVer perfil: ${data.profileUrl}\n\nEquipe Cabala dos Caminhos`
    : `${data.count} novos seguidores.\n\nVer perfil: ${data.profileUrl}\n\nEquipe Cabala dos Caminhos`;

  return { subject, html, text };
}
