// ============================================================================
// VERIFY EMAIL — confirmação de signup (Wave 20, 2026-06-28)
// ============================================================================
// Enviado após signup com magic link ou email/senha. CTA único: confirmar.
// Footer transactional (sem unsubscribe porque o usuário precisa dele pra usar
// a conta).
// ============================================================================

import { renderLayout, renderCta, escapeHtml } from '@/lib/email/layout';
import type { RenderOptions, RenderedTemplate } from '@/lib/email/templates/index';

export interface VerifyEmailData {
  displayName: string;
  /** Link único de verificação (com token). */
  verifyUrl: string;
  /** Minutos até o link expirar. */
  expiresInMinutes: number;
}

export function renderVerifyEmail(data: VerifyEmailData, _options: RenderOptions = {}): RenderedTemplate {
  const subject = `✉️ Confirme seu email — Cabala dos Caminhos`;

  const bodyHtml = `
    <h1 class="h1" style="font-family:Georgia,serif;font-size:26px;line-height:34px;color:#222;margin:0 0 16px 0;font-weight:normal;">
      Confirme seu email
    </h1>
    <p class="body-text" style="font-family:Georgia,serif;font-size:16px;line-height:24px;color:#444;margin:0 0 16px 0;">
      Olá, ${escapeHtml(data.displayName)}. Falta um passo para você entrar na Cabala dos Caminhos: confirmar este email.
    </p>
    <p class="body-text" style="font-family:Georgia,serif;font-size:16px;line-height:24px;color:#444;margin:0 0 16px 0;">
      Clique no botão abaixo — o link expira em <strong>${data.expiresInMinutes} minutos</strong>.
    </p>
    ${renderCta({ label: 'Confirmar meu email →', href: data.verifyUrl })}
    <p class="body-text" style="font-family:Georgia,serif;font-size:14px;line-height:22px;color:#888;margin:24px 0 0 0;">
      Se o botão não funcionar, copie e cole este link no navegador:<br/>
      <span style="word-break:break-all;color:#5b3a8a;">${escapeHtml(data.verifyUrl)}</span>
    </p>
    <p class="body-text" style="font-family:Georgia,serif;font-size:14px;line-height:22px;color:#888;margin:24px 0 0 0;">
      Se você não criou uma conta, pode ignorar este email com segurança.
    </p>
  `;

  const html = renderLayout({
    bodyHtml,
    preheader: 'Confirme seu email para começar a caminhar.',
    subject,
    footer: 'transactional',
  });

  const text = `Olá, ${data.displayName}.\n\nConfirme seu email clicando no link (expira em ${data.expiresInMinutes} min):\n${data.verifyUrl}\n\nSe você não criou uma conta, ignore este email.\n\nEquipe Cabala dos Caminhos`;

  return { subject, html, text };
}
