// ============================================================================
// BETA INVITE EMAIL — Wave 32 (2026-06-30)
// ============================================================================// Convite para entrar na beta fechada da Cabala dos Caminhos. Tom:
// acolhedor, respeitoso, com tempero Iyá (Curator) — sem pressão.
//
// Tom:
//   - Saudação pessoal (quando houver displayName)
//   - Benefícios da beta (sem promessas materiais)
//   - CTA único e claro: "Aceitar meu convite"
//   - Janela de expiração visível
//
// Tracking:
//   - Pixel de abertura (1x1 transparente) → /api/beta/track/open/[hash]
//   - Link CTA aponta para /convite/[token] (server-side verifica)
// ============================================================================

import { renderLayout, renderCta, escapeHtml } from '@/lib/email/layout';
import type { RenderOptions, RenderedTemplate } from '@/lib/email/templates/index';

export interface BetaInviteData {
  /** Primeiro nome do destinatário (opcional — fallback saudação genérica). */
  displayName?: string;
  /** Wave do convite (1, 2 ou 3) — ajusta copy. */
  wave: 1 | 2 | 3;
  /** URL de aceite: https://site/convite/[token] */
  acceptUrl: string;
  /** URL do pixel de tracking (opcional, omitido se stub). */
  trackingPixelUrl?: string;
  /** Data de expiração (exibida como "válido até"). */
  expiresAt: Date;
}

const WAVE_COPY: Record<1 | 2 | 3, { headline: string; benefits: string[] }> = {
  1: {
    headline: 'Onda Fundadores',
    benefits: [
      'Acesso vitalício ao espaço, mesmo após o fim da beta',
      'Reconhecimento público como founding member (opt-in)',
      'Influência direta no roadmap (encontros mensais com o time)',
    ],
  },
  2: {
    headline: 'Onda Comunidade',
    benefits: [
      'Acesso completo à comunidade durante toda a beta',
      'Onboarding guiado com a Akasha IA para gerar seu mapa inicial',
      'Participação nos círculos de partilha e mentorias entre pares',
    ],
  },
  3: {
    headline: 'Onda Abertura',
    benefits: [
      'Acesso completo ao portal durante a beta pública',
      'Onboarding simplificado em 1 passo',
      'Comunidade ativa com curadoria humana + IA',
    ],
  },
};

export function renderBetaInvite(
  data: BetaInviteData,
  options: RenderOptions = {}
): RenderedTemplate {
  const waveCopy = WAVE_COPY[data.wave];
  const greeting = data.displayName
    ? `Olá, ${escapeHtml(data.displayName)}`
    : 'Olá, caminhante';
  const expiresFmt = data.expiresAt.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const subject = `✨ Seu convite para a beta — ${waveCopy.headline}`;

  const benefitsHtml = waveCopy.benefits
    .map(
      (b) =>
        `<li style="margin:0 0 8px 0;">${escapeHtml(b)}</li>`
    )
    .join('');

  const pixelHtml = data.trackingPixelUrl
    ? `<img src="${escapeHtml(data.trackingPixelUrl)}" alt="" width="1" height="1" style="display:block;border:0;width:1px;height:1px;" />`
    : '';

  const ctaHtml = renderCta({
    href: data.acceptUrl,
    label: 'Aceitar meu convite',
  });

  const bodyHtml = `
    <h1 class="h1" style="font-family:Georgia,serif;font-size:28px;line-height:36px;color:#222;margin:0 0 16px 0;font-weight:normal;">
      ${greeting}.
    </h1>
    <p class="body-text" style="font-family:Georgia,serif;font-size:16px;line-height:24px;color:#444;margin:0 0 16px 0;">
      Você foi convidado(a) a fazer parte da <strong>${escapeHtml(waveCopy.headline)}</strong> da Cabala dos Caminhos — um espaço de partilha entre praticantes e curiosos das mais diversas linguagens espirituais.
    </p>
    <p class="body-text" style="font-family:Georgia,serif;font-size:16px;line-height:24px;color:#444;margin:0 0 16px 0;">
      Seu convite é pessoal e intransferível. Ele é válido até <strong>${escapeHtml(expiresFmt)}</strong>.
    </p>

    <h2 style="font-family:Georgia,serif;font-size:20px;line-height:28px;color:#5b3a8a;margin:32px 0 12px 0;font-weight:normal;">
      O que você ganha ao aceitar
    </h2>
    <ul style="font-family:Georgia,serif;font-size:16px;line-height:26px;color:#444;margin:0 0 24px 0;padding-left:20px;">
      ${benefitsHtml}
    </ul>

    <div style="text-align:center;margin:32px 0;">
      ${ctaHtml}
    </div>

    <p class="body-text" style="font-family:Georgia,serif;font-size:14px;line-height:22px;color:#666;margin:24px 0 0 0;">
      Se o botão não funcionar, copie e cole este link no seu navegador:<br />
      <span style="word-break:break-all;color:#5b3a8a;">${escapeHtml(data.acceptUrl)}</span>
    </p>

    <p class="body-text" style="font-family:Georgia,serif;font-size:14px;line-height:22px;color:#666;margin:24px 0 0 0;">
      Se você não esperava este convite ou prefere não participar, pode simplesmente ignorar este email — nenhuma conta será criada sem sua ação explícita.
    </p>

    ${pixelHtml}
  `;

  const html = renderLayout({
    bodyHtml,
    preheader: `Convite beta — ${waveCopy.headline}. Válido até ${expiresFmt}.`,
    subject,
    footer: 'transactional',
    unsubscribeToken: options.unsubscribeToken ?? null,
    unsubscribeType: 'beta-invite',
  });

  const text = [
    greeting + '.',
    '',
    `Você foi convidado(a) a fazer parte da ${waveCopy.headline} da Cabala dos Caminhos.`,
    `Seu convite é válido até ${expiresFmt}.`,
    '',
    'Benefícios:',
    ...waveCopy.benefits.map((b) => `  • ${b}`),
    '',
    `Aceitar convite: ${data.acceptUrl}`,
    '',
    'Se preferir não participar, ignore este email.',
  ].join('\n');

  return { subject, html, text };
}