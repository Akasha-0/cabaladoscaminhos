// ============================================================================
// MENTORSHIP REQUEST — solicitação de mentoria (Wave 20, 2026-06-28)
// ============================================================================
// Enviado ao mentor quando alguém solicita mentoria. Tom respeitoso, foco em
// destacar a mensagem do mentee e dar 1-click para aceitar/recusar.
// ============================================================================

import { renderLayout, renderCta, escapeHtml } from '@/lib/email/layout';
import type { RenderOptions, RenderedTemplate } from '@/lib/email/templates/index';

export interface MentorshipRequestData {
  /** Nome do mentor (destinatário). */
  mentorName: string;
  /** Nome do mentee (solicitante). */
  menteeName: string;
  /** Tradição foco da mentoria. */
  tradition: string;
  /** Mensagem do mentee (até ~500 chars). */
  message: string;
  /** URL para aceitar a mentoria. */
  acceptUrl: string;
  /** URL para recusar. */
  declineUrl: string;
}

export function renderMentorshipRequest(data: MentorshipRequestData, options: RenderOptions = {}): RenderedTemplate {
  const subject = `🙏 ${data.menteeName} pediu mentoria em ${formatTradition(data.tradition)}`;

  const bodyHtml = `
    <h1 class="h1" style="font-family:Georgia,serif;font-size:24px;line-height:32px;color:#222;margin:0 0 16px 0;font-weight:normal;">
      Pedido de mentoria
    </h1>
    <p class="body-text" style="font-family:Georgia,serif;font-size:16px;line-height:24px;color:#444;margin:0 0 16px 0;">
      Olá, ${escapeHtml(data.mentorName)}. <strong>${escapeHtml(data.menteeName)}</strong> está pedindo mentoria em <strong>${escapeHtml(formatTradition(data.tradition))}</strong>.
    </p>
    <p class="body-text" style="font-family:Georgia,serif;font-size:14px;line-height:20px;color:#888;margin:0 0 8px 0;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;">
      Mensagem do solicitante
    </p>
    <blockquote style="border-left:3px solid #5b3a8a;background:#faf8f3;padding:14px 18px;margin:8px 0 24px;font-family:Georgia,serif;font-size:15px;line-height:24px;color:#333;border-radius:0 4px 4px 0;">
      "${escapeHtml(data.message)}"
    </blockquote>

    <p class="body-text" style="font-family:Georgia,serif;font-size:14px;line-height:20px;color:#888;margin:0 0 12px 0;">
      Você pode aceitar (e iniciar a conversa) ou recusar com 1 clique. Não há obrigação — cada mentor cuida do seu próprio ritmo.
    </p>

    ${renderCta({ label: 'Aceitar mentoria →', href: data.acceptUrl })}
    <p style="text-align:center;margin:16px 0 0 0;">
      <a href="${escapeHtml(data.declineUrl)}" style="font-family:Georgia,serif;font-size:14px;color:#888;text-decoration:underline;">Recusar educadamente</a>
    </p>
  `;

  const html = renderLayout({
    bodyHtml,
    preheader: `${data.menteeName} pediu mentoria em ${formatTradition(data.tradition)}`,
    subject,
    footer: 'marketing',
    unsubscribeToken: options.unsubscribeToken,
    unsubscribeType: 'mentorship',
  });

  const text = `${data.menteeName} pediu mentoria em ${formatTradition(data.tradition)}.\n\nMensagem:\n"${data.message}"\n\nAceitar: ${data.acceptUrl}\nRecusar: ${data.declineUrl}\n\nEquipe Cabala dos Caminhos`;

  return { subject, html, text };
}

function formatTradition(slug: string): string {
  const labels: Record<string, string> = {
    cabala: 'Cabala',
    ifa: 'Ifá',
    tantra: 'Tantra',
    xamanismo: 'Xamanismo',
    reiki: 'Reiki',
    ayurveda: 'Ayurveda',
    umbanda: 'Umbanda',
    'cristianismo-mistico': 'Cristianismo Místico',
    sufismo: 'Sufismo',
    meditacao: 'Meditação',
  };
  return labels[slug] ?? slug;
}
