// ============================================================================
// WAITLIST CONFIRMATION — Day 0+ (Wave 32, 2026-06-30)
// ============================================================================
// Disparado quando o usuário clica no link de confirmação do email.
//
// Estado: lead passa de "pending" (inscrito mas não verificado) para
// "confirmed" (email verificado, aguardando wave). Esse estado muda:
//   - Score de prioridade na fila (+5)
//   - Habilita receber invites
//   - Dispara reminder 7 dias depois se não converter em wave
//
// Tom: breve, validador, com CTA para explorar e compartilhar.
// ============================================================================

import { renderLayout, renderCta, escapeHtml } from '@/lib/email/layout';
import type { RenderOptions, RenderedTemplate } from '@/lib/email/templates/index';

export interface WaitlistConfirmationData {
  displayName?: string;
  /** Posição atualizada após confirmação (geralmente sobe alguns slots). */
  position: number;
  /** Total de confirmados. */
  totalConfirmed: number;
  /** URL pública para compartilhar (com referral code do usuário). */
  shareUrl: string;
  /** Slug do referral code (curto). */
  referralCode: string;
  /** URL do projeto. */
  exploreUrl: string;
}

export function renderWaitlistConfirmation(
  data: WaitlistConfirmationData,
  options: RenderOptions = {},
): RenderedTemplate {
  const greeting = data.displayName ? `, ${escapeHtml(data.displayName)}` : '';
  const subject = `✓ Email confirmado — sua posição subiu para #${data.position}`;

  const bodyHtml = `
    <h1 class="h1" style="font-family:Georgia,serif;font-size:28px;line-height:36px;color:#222;margin:0 0 16px 0;font-weight:normal;">
      Email confirmado${greeting}!
    </h1>
    <p class="body-text" style="font-family:Georgia,serif;font-size:16px;line-height:24px;color:#444;margin:0 0 16px 0;">
      Pronto. Seu email foi verificado e sua posição na fila subiu para
      <strong>#${data.position}</strong>. Agora você está entre os
      ${data.totalConfirmed} confirmados — e sua vaga está garantida para
      a próxima onda.
    </p>

    <h2 style="font-family:Georgia,serif;font-size:20px;line-height:28px;color:#5b3a8a;margin:32px 0 12px 0;font-weight:normal;">
      Suba ainda mais na fila
    </h2>
    <p class="body-text" style="font-family:Georgia,serif;font-size:16px;line-height:24px;color:#444;margin:0 0 16px 0;">
      Cada pessoa que entrar pelo seu link de indicação pula 3 posições
      — e você também. Sem limite. Compartilhe com praticantes das suas
      comunidades que respeitam o diálogo multi-tradição.
    </p>

    ${renderCta({ label: `Compartilhar ${data.referralCode}`, href: data.shareUrl })}

    <p class="body-text" style="font-family:Georgia,serif;font-size:14px;line-height:22px;color:#666;margin:16px 0 0 0;">
      Seu link: <code style="background:#f5f3ee;padding:2px 6px;border-radius:3px;">${escapeHtml(data.shareUrl)}</code>
    </p>

    <h2 style="font-family:Georgia,serif;font-size:20px;line-height:28px;color:#5b3a8a;margin:32px 0 12px 0;font-weight:normal;">
      Enquanto espera o invite
    </h2>
    ${renderCta({ label: 'Conhecer o projeto', href: data.exploreUrl, secondary: true })}

    <p class="body-text" style="font-family:Georgia,serif;font-size:15px;line-height:24px;color:#666;margin:32px 0 0 0;font-style:italic;">
      Obrigado por confiar.<br/>
      — Equipe Cabala dos Caminhos
    </p>
  `;

  const html = renderLayout({
    bodyHtml,
    preheader: `Posição atualizada: #${data.position}. Compartilhe para subir mais rápido.`,
    subject,
    footer: 'marketing',
    unsubscribeToken: options.unsubscribeToken,
    unsubscribeType: 'waitlist',
  });

  const text = textVersion(data);
  return { subject, html, text };
}

function textVersion(d: WaitlistConfirmationData): string {
  const greeting = d.displayName ? `, ${d.displayName}` : '';
  return [
    `Email confirmado${greeting}!`,
    '',
    `Posição atual: #${d.position} de ${d.totalConfirmed} confirmados.`,
    '',
    `Suba na fila indicando amigos. Seu link: ${d.shareUrl}`,
    `Código: ${d.referralCode} (cada amigo confirmado = +3 posições)`,
    '',
    `Conhecer o projeto: ${d.exploreUrl}`,
    '',
    '— Equipe Cabala dos Caminhos',
  ].join('\n');
}