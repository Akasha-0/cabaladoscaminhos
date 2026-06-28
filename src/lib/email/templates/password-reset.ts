// ============================================================================
// PASSWORD RESET — link de redefinição (Wave 20, 2026-06-28)
// ============================================================================
// Tom sóbrio. Footer transactional (sem unsubscribe). Inclui nota de segurança
// caso o request não tenha sido feito pelo próprio usuário.
// ============================================================================

import { renderLayout, renderCta, escapeHtml } from '@/lib/email/layout';
import type { RenderOptions, RenderedTemplate } from '@/lib/email/templates/index';

export interface PasswordResetData {
  displayName: string;
  /** URL do link de reset (com token único). */
  resetUrl: string;
  /** Minutos até o link expirar. */
  expiresInMinutes: number;
  /** IP aproximado do request (para a nota de segurança). */
  requestIp?: string;
}

export function renderPasswordReset(data: PasswordResetData, _options: RenderOptions = {}): RenderedTemplate {
  const subject = `🔑 Redefinição de senha — Cabala dos Caminhos`;

  const ipLine = data.requestIp
    ? `Esta solicitação foi feita do IP <strong>${escapeHtml(data.requestIp)}</strong>.`
    : '';

  const bodyHtml = `
    <h1 class="h1" style="font-family:Georgia,serif;font-size:26px;line-height:34px;color:#222;margin:0 0 16px 0;font-weight:normal;">
      Redefinição de senha
    </h1>
    <p class="body-text" style="font-family:Georgia,serif;font-size:16px;line-height:24px;color:#444;margin:0 0 16px 0;">
      Olá, ${escapeHtml(data.displayName)}. Recebemos um pedido para redefinir a senha da sua conta na Cabala dos Caminhos.
    </p>
    <p class="body-text" style="font-family:Georgia,serif;font-size:16px;line-height:24px;color:#444;margin:0 0 16px 0;">
      ${ipLine ? ipLine + ' ' : ''}Se foi você, clique no botão abaixo. O link expira em <strong>${data.expiresInMinutes} minutos</strong>.
    </p>
    ${renderCta({ label: 'Redefinir minha senha →', href: data.resetUrl })}
    <p class="body-text" style="font-family:Georgia,serif;font-size:14px;line-height:22px;color:#888;margin:24px 0 0 0;">
      Se o botão não funcionar, copie e cole este link no navegador:<br/>
      <span style="word-break:break-all;color:#5b3a8a;">${escapeHtml(data.resetUrl)}</span>
    </p>
    <p class="body-text" style="font-family:Georgia,serif;font-size:14px;line-height:22px;color:#888;margin:24px 0 0 0;border-top:1px solid #e6e2d8;padding-top:16px;">
      <strong>Não foi você?</strong> Ignore este email — sua senha permanecerá a mesma. Se você acredita que alguém está tentando acessar sua conta, responda este email para que possamos investigar.
    </p>
  `;

  const html = renderLayout({
    bodyHtml,
    preheader: 'Recebemos seu pedido de redefinição de senha.',
    subject,
    footer: 'transactional',
  });

  const text = `Olá, ${data.displayName}.\n\nRecebemos um pedido para redefinir sua senha.\n${data.requestIp ? `IP do pedido: ${data.requestIp}\n` : ''}\nClique no link (expira em ${data.expiresInMinutes} min):\n${data.resetUrl}\n\nSe não foi você, ignore este email.\n\nEquipe Cabala dos Caminhos`;

  return { subject, html, text };
}
