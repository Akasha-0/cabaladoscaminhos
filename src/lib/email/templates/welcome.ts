// ============================================================================
// WELCOME EMAIL — Day 0 (Wave 20, 2026-06-28)
// ============================================================================
// Primeira impressão. Tom: acolhedor, respeitoso, com tempero Iyá (Curator) —
// reconhecendo a espiritualidade do usuário sem ser prescritivo.
//
// Tradições (Cabala, Ifá, Tantra, Umbanda, Xamanismo, etc) são abordadas
// como "linguagens" diferentes da mesma busca — não como cards de comparação.
// ============================================================================

import { renderLayout, renderCta, escapeHtml } from '@/lib/email/layout';
import type { RenderOptions, RenderedTemplate } from '@/lib/email/templates/index';

export interface WelcomeData {
  /** Nome do novo membro (primeiro nome preferido). */
  displayName: string;
  /** Tradições escolhidas no onboarding (slugs canônicos). */
  traditions: string[];
  /** URL para o onboarding (caso ainda não tenha completado). */
  onboardingUrl: string;
  /** URL da home da comunidade. */
  communityUrl: string;
}

export function renderWelcome(data: WelcomeData, options: RenderOptions = {}): RenderedTemplate {
  const traditionsLabel = formatTraditions(data.traditions);
  const subject = `🌅 Bem-vindo(a) à Cabala dos Caminhos, ${data.displayName}`;

  const bodyHtml = `
    <h1 class="h1" style="font-family:Georgia,serif;font-size:28px;line-height:36px;color:#222;margin:0 0 16px 0;font-weight:normal;">
      Acolhida, ${escapeHtml(data.displayName)}.
    </h1>
    <p class="body-text" style="font-family:Georgia,serif;font-size:16px;line-height:24px;color:#444;margin:0 0 16px 0;">
      Que bom te ter por aqui. A Cabala dos Caminhos é um espaço de partilha entre praticantes e curiosos das mais diversas linguagens espirituais — e você acaba de entrar como um(a) caminhante respeitado(a).
    </p>
    <p class="body-text" style="font-family:Georgia,serif;font-size:16px;line-height:24px;color:#444;margin:0 0 16px 0;">
      ${traditionsLabel
        ? `Vimos que você trouxe consigo o interesse por <strong>${escapeHtml(traditionsLabel)}</strong>. Honraremos essa escolha sem fechá-la — toda tradição aqui convive com as outras.`
        : `Você ainda não escolheu suas tradições de interesse. Quando quiser, é só nos contar.`}
    </p>

    <h2 style="font-family:Georgia,serif;font-size:20px;line-height:28px;color:#5b3a8a;margin:32px 0 12px 0;font-weight:normal;">
      O que você pode fazer agora
    </h2>
    <ul style="font-family:Georgia,serif;font-size:16px;line-height:26px;color:#444;margin:0 0 24px 0;padding-left:20px;">
      <li><strong>Terminar seu onboarding</strong> — gerar seu mapa espiritual inicial (caminho de vida, signo, orixá regente).</li>
      <li><strong>Explorar a comunidade</strong> — posts, grupos por tradição e biblioteca curada.</li>
      <li><strong>Conversar com a Akasha IA</strong> — perguntas sobre qualquer tradição, com fontes acadêmicas quando aplicável.</li>
    </ul>

    ${renderCta({ label: 'Continuar onboarding →', href: data.onboardingUrl })}

    <p class="body-text" style="font-family:Georgia,serif;font-size:16px;line-height:24px;color:#444;margin:24px 0 0 0;">
      Nos próximos dias, enviaremos dois emails para você aproveitar melhor a jornada — um sobre como a Akasha funciona, e outro sobre suas primeiras reflexões.
    </p>

    <p class="body-text" style="font-family:Georgia,serif;font-size:15px;line-height:24px;color:#666;margin:32px 0 0 0;font-style:italic;">
      Axé. Que seu caminhar seja leve e atento.<br/>
      — Equipe Cabala dos Caminhos
    </p>
  `;

  const html = renderLayout({
    bodyHtml,
    preheader: `Olá, ${data.displayName} — sua jornada começa aqui.`,
    subject,
    footer: 'marketing',
    unsubscribeToken: options.unsubscribeToken,
    unsubscribeType: 'welcome',
  });

  const text = textVersion(data);

  return { subject, html, text };
}

function formatTraditions(traditions: string[]): string {
  if (traditions.length === 0) return '';
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
  const names = traditions.map((t) => labels[t] ?? t);
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} e ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`;
}

function textVersion(d: WelcomeData): string {
  const traditions = formatTraditions(d.traditions);
  return [
    `Bem-vindo(a), ${d.displayName}!`,
    '',
    traditions
      ? `Reconhecemos seu interesse por ${traditions}. Honraremos essa escolha sem fechá-la.`
      : '',
    'O que você pode fazer agora:',
    `1. Terminar seu onboarding: ${d.onboardingUrl}`,
    `2. Explorar a comunidade: ${d.communityUrl}`,
    '',
    'Axé. Que seu caminhar seja leve e atento.',
    '— Equipe Cabala dos Caminhos',
  ]
    .filter(Boolean)
    .join('\n');
}
