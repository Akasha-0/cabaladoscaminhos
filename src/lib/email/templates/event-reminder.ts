// ============================================================================
// EVENT REMINDER — evento amanhã (Wave 20, 2026-06-28)
// ============================================================================
// Cron deve disparar 24h antes do evento. Mostra horário local + link da reunião
// se for evento fechado (group).
// ============================================================================

import { renderLayout, renderCta, escapeHtml } from '@/lib/email/layout';
import type { RenderOptions, RenderedTemplate } from '@/lib/email/templates/index';

export interface EventReminderData {
  recipientName: string;
  /** Título do evento. */
  eventTitle: string;
  /** Tradição (categoria). */
  tradition: string;
  /** Nome do host. */
  hostName: string;
  /** Data/hora de início (já em formato PT-BR amigável). */
  startsAtFormatted: string;
  /** Duração em minutos. */
  durationMinutes: number;
  /** URL da página do evento (detalhes + RSVP). */
  eventUrl: string;
  /** URL da reunião (opcional, enviado só após RSVP confirmado). */
  meetingUrl?: string | null;
  /** Descrição curta. */
  description: string;
}

export function renderEventReminder(data: EventReminderData, options: RenderOptions = {}): RenderedTemplate {
  const subject = `🗓️ Amanhã: ${data.eventTitle}`;

  const meetingHtml = data.meetingUrl
    ? `<p class="body-text" style="font-family:Georgia,serif;font-size:16px;line-height:24px;color:#444;margin:16px 0;">
        <strong>Link da reunião:</strong><br/>
        <a href="${escapeHtml(data.meetingUrl)}" style="color:#5b3a8a;word-break:break-all;">${escapeHtml(data.meetingUrl)}</a>
      </p>`
    : '';

  const bodyHtml = `
    <h1 class="h1" style="font-family:Georgia,serif;font-size:26px;line-height:34px;color:#222;margin:0 0 16px 0;font-weight:normal;">
      Lembrete: ${escapeHtml(data.eventTitle)}
    </h1>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#faf8f3;border-radius:6px;padding:16px;margin:24px 0;">
      <tr>
        <td style="font-family:Georgia,serif;font-size:15px;line-height:24px;color:#555;">
          <strong style="color:#5b3a8a;">📅 Quando:</strong> ${escapeHtml(data.startsAtFormatted)}<br/>
          <strong style="color:#5b3a8a;">⏱️ Duração:</strong> ${data.durationMinutes} minutos<br/>
          <strong style="color:#5b3a8a;">🪶 Tradição:</strong> ${escapeHtml(formatTradition(data.tradition))}<br/>
          <strong style="color:#5b3a8a;">🌿 Host:</strong> ${escapeHtml(data.hostName)}
        </td>
      </tr>
    </table>

    <p class="body-text" style="font-family:Georgia,serif;font-size:16px;line-height:24px;color:#444;margin:0 0 16px 0;">
      ${escapeHtml(truncate(data.description, 320))}
    </p>

    ${meetingHtml}

    ${renderCta({ label: 'Ver evento →', href: data.eventUrl })}
  `;

  const html = renderLayout({
    bodyHtml,
    preheader: `Amanhã: ${data.eventTitle} (${data.startsAtFormatted})`,
    subject,
    footer: 'marketing',
    unsubscribeToken: options.unsubscribeToken,
    unsubscribeType: 'event',
  });

  const text = `Lembrete: ${data.eventTitle}\n\nQuando: ${data.startsAtFormatted} (${data.durationMinutes} min)\nTradição: ${formatTradition(data.tradition)}\nHost: ${data.hostName}\n\n${data.description}\n\n${data.meetingUrl ? `Link: ${data.meetingUrl}\n\n` : ''}Ver evento: ${data.eventUrl}\n\nEquipe Cabala dos Caminhos`;

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

function truncate(s: string, max: number): string {
  const t = s.trim().replace(/\s+/g, ' ');
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trimEnd() + '…';
}
