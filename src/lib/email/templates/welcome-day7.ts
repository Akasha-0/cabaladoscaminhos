// ============================================================================
// WELCOME EMAIL — Day 7 (Wave 20, 2026-06-28)
// ============================================================================
// Convite para a primeira reflexão pública + pergunta sobre tradição favorita.
// Foco: re-engajar quem completou onboarding e gerou mapa espiritual.
// ============================================================================

import { renderLayout, renderCta, escapeHtml } from '@/lib/email/layout';
import type { RenderOptions, RenderedTemplate } from '@/lib/email/templates/index';

export interface WelcomeDay7Data {
  displayName: string;
  /** Tradição principal detectada (a mais forte do mapa do usuário). */
  mainTradition: string | null;
  /** Caminho de vida numerológico (1-33 ou 11/22 mestres). */
  caminhoDeVida: number | null;
  /** URL para criar o primeiro post. */
  composePostUrl: string;
  /** URL do grupo da tradição principal (se houver). */
  groupUrl: string | null;
}

export function renderWelcomeDay7(data: WelcomeDay7Data, options: RenderOptions = {}): RenderedTemplate {
  const subject = `✨ Uma semana de caminho — como foi sua primeira reflexão?`;

  const reflectionPrompt =
    data.mainTradition === 'cabala'
      ? 'Qual sefirá ressoa mais forte com você neste momento da vida?'
      : data.mainTradition === 'ifa'
        ? 'Qual Odu você sente mais presente — no corpo, nos sonhos, nas conversas?'
        : data.mainTradition === 'tantra'
          ? 'Que chakra está pedindo mais atenção sua hoje?'
          : data.mainTradition === 'umbanda'
            ? 'Qual entidade ou guia você sente mais próximo nesta fase?'
            : 'Qual prática ou reflexão te tocou mais nos últimos dias?';

  const mapaText =
    data.mainTradition && data.caminhoDeVida
      ? `Vimos no seu mapa que ${formatTradition(data.mainTradition)} e o caminho de vida <strong>${data.caminhoDeVida}</strong> se destacam.`
      : data.mainTradition
        ? `Vimos no seu mapa que <strong>${escapeHtml(formatTradition(data.mainTradition))}</strong> é a tradição que mais ressoa com você.`
        : 'Seu mapa espiritual ainda está se formando — sem pressa.';

  const groupCta = data.groupUrl
    ? renderCta({ label: `Entrar no grupo de ${escapeHtml(formatTradition(data.mainTradition ?? ''))} →`, href: data.groupUrl, color: '#7c4a2a' })
    : '';

  const bodyHtml = `
    <h1 class="h1" style="font-family:Georgia,serif;font-size:26px;line-height:34px;color:#222;margin:0 0 16px 0;font-weight:normal;">
      Uma semana, ${escapeHtml(data.displayName)}.
    </h1>

    <p class="body-text" style="font-family:Georgia,serif;font-size:16px;line-height:24px;color:#444;margin:0 0 16px 0;">
      ${mapaText}
    </p>

    <p class="body-text" style="font-family:Georgia,serif;font-size:16px;line-height:24px;color:#444;margin:0 0 16px 0;">
      Hoje te convidamos a uma micro-reflexão — daquelas que levam 5 minutos mas costumam render boas semanas:
    </p>

    <blockquote style="border-left:3px solid #5b3a8a;background:#faf8f3;padding:16px 20px;margin:24px 0;font-family:Georgia,serif;font-size:17px;line-height:26px;color:#333;font-style:italic;">
      ${escapeHtml(reflectionPrompt)}
    </blockquote>

    ${renderCta({ label: 'Compartilhar sua reflexão →', href: data.composePostUrl })}

    ${groupCta}

    <p class="body-text" style="font-family:Georgia,serif;font-size:15px;line-height:24px;color:#666;margin:24px 0 0 0;">
      Se preferir apenas ler por enquanto, tudo bem. Sua presença aqui já é caminho.
    </p>

    <p class="body-text" style="font-family:Georgia,serif;font-size:15px;line-height:24px;color:#666;margin:32px 0 0 0;font-style:italic;">
      Axé,<br/>
      Equipe Cabala dos Caminhos
    </p>
  `;

  const html = renderLayout({
    bodyHtml,
    preheader: 'Uma semana de caminho — como foi sua primeira reflexão?',
    subject,
    footer: 'marketing',
    unsubscribeToken: options.unsubscribeToken,
    unsubscribeType: 'welcome',
  });

  const text = `Olá, ${data.displayName}!\n\nUma semana de caminhada.\n\n${mapaText.replace(/<[^>]*>/g, '')}\n\nReflexão sugerida: ${reflectionPrompt}\n\nCompartilhar: ${data.composePostUrl}\n\nEm axé,\nEquipe Cabala dos Caminhos`;

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
