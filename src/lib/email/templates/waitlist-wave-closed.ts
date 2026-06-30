// ============================================================================
// WAITLIST WAVE CLOSED — Day N (Wave 32, 2026-06-30)
// ============================================================================
// Disparado quando uma onda ENCHE e o usuário ficou de fora.
// Tom: transparente sobre o que aconteceu + ancoragem para a próxima onda.
//
// Função: evitar churn. O lead acabou de ver todo mundo entrar e ele não.
// Se a mensagem não for honesta, ele sai. Se for honesta + oferecer caminho,
// 60-70% ficam.
//
// Decisão de copy: nunca dizer "sentimos muito" sem oferecer alternativa.
// ============================================================================

import { renderLayout, renderCta, escapeHtml } from '@/lib/email/layout';
import type { RenderOptions, RenderedTemplate } from '@/lib/email/templates/index';

export interface WaitlistWaveClosedData {
  displayName?: string;
  /** Número da onda que fechou (acabou de lotar). */
  waveNumber: number;
  /** Tamanho da onda. */
  waveSize: number;
  /** Posição do usuário após o fechamento (atualizada). */
  position: number;
  /** ISO date da próxima onda (ex: '2026-08-15'). */
  nextWaveDate: string;
  /** Dias até a próxima onda (ex: 14). */
  daysUntilNextWave: number;
  /** Tamanho previsto da próxima onda. */
  nextWaveSize: number;
  /** Tradição principal. */
  tradition: string;
  /** URL para indicar amigos e subir na fila. */
  shareUrl: string;
  /** URL pública. */
  exploreUrl: string;
}

export function renderWaitlistWaveClosed(
  data: WaitlistWaveClosedData,
  options: RenderOptions = {},
): RenderedTemplate {
  const greeting = data.displayName ? `, ${escapeHtml(data.displayName)}` : '';
  const subject = `A Onda ${data.waveNumber} lotou — sua próxima chance em ${data.daysUntilNextWave} dias`;

  const bodyHtml = `
    <h1 class="h1" style="font-family:Georgia,serif;font-size:28px;line-height:36px;color:#222;margin:0 0 16px 0;font-weight:normal;">
      Transparência primeiro${greeting}.
    </h1>
    <p class="body-text" style="font-family:Georgia,serif;font-size:16px;line-height:24px;color:#444;margin:0 0 16px 0;">
      A <strong>Onda ${data.waveNumber}</strong> do beta acabou de lotar
      (${data.waveSize} vagas). Você ficou de fora dessa vez — sua posição
      atual é <strong>#${data.position}</strong>.
    </p>

    <p class="body-text" style="font-family:Georgia,serif;font-size:16px;line-height:24px;color:#444;margin:0 0 16px 0;">
      Eu poderia te prometer que a próxima onda é garantida, mas prefiro
      ser honesta: as ondas têm tamanho limitado para preservar a qualidade
      da curadoria inicial. O que posso garantir é:
    </p>

    <ul style="font-family:Georgia,serif;font-size:16px;line-height:26px;color:#444;margin:0 0 24px 0;padding-left:20px;">
      <li><strong>Próxima onda em ${escapeHtml(data.daysUntilNextWave.toString())} dias</strong> (${escapeHtml(data.nextWaveDate)}), com ${escapeHtml(data.nextWaveSize.toString())} vagas.</li>
      <li><strong>Sua posição sobe</strong> a cada amigo confirmado que você indicar.</li>
      <li><strong>Se sua tradição</strong> (${escapeHtml(data.tradition)}) ainda não tem curadoria, isso pode te colocar na frente — priorizamos tradição sub-representada.</li>
    </ul>

    ${renderCta({ label: 'Indicar amigos e subir na fila', href: data.shareUrl })}

    <p class="body-text" style="font-family:Georgia,serif;font-size:14px;line-height:22px;color:#666;margin:16px 0 0 0;">
      Cada indicação confirmada te dá <strong>+3 posições</strong>. Sem limite.
    </p>

    <h2 style="font-family:Georgia,serif;font-size:20px;line-height:28px;color:#5b3a8a;margin:32px 0 12px 0;font-weight:normal;">
      Enquanto espera
    </h2>
    <p class="body-text" style="font-family:Georgia,serif;font-size:16px;line-height:24px;color:#444;margin:0 0 16px 0;">
      O projeto está em construção ativa. Pode acompanhar o que está sendo
      construído em:
    </p>
    ${renderCta({ label: 'Acompanhar o projeto', href: data.exploreUrl, secondary: true })}

    <p class="body-text" style="font-family:Georgia,serif;font-size:15px;line-height:24px;color:#666;margin:32px 0 0 0;font-style:italic;">
      A fila é pequena. A espera é real. Obrigada por ficar.<br/>
      — Equipe Cabala dos Caminhos
    </p>
  `;

  const html = renderLayout({
    bodyHtml,
    preheader: `Onda ${data.waveNumber} lotou. Próxima em ${data.daysUntilNextWave} dias. Indique amigos para subir.`,
    subject,
    footer: 'marketing',
    unsubscribeToken: options.unsubscribeToken,
    unsubscribeType: 'waitlist',
  });

  const text = textVersion(data);
  return { subject, html, text };
}

function textVersion(d: WaitlistWaveClosedData): string {
  const greeting = d.displayName ? `, ${d.displayName}` : '';
  return [
    `Transparência primeiro${greeting}.`,
    '',
    `A Onda ${d.waveNumber} (${d.waveSize} vagas) acabou de lotar. Você ficou de fora.`,
    `Sua posição: #${d.position}.`,
    '',
    `Próxima onda: ${d.nextWaveDate} (em ${d.daysUntilNextWave} dias, ${d.nextWaveSize} vagas).`,
    `Cada indicação confirmada: +3 posições.`,
    '',
    `Indicar: ${d.shareUrl}`,
    `Acompanhar projeto: ${d.exploreUrl}`,
    '',
    '— Equipe Cabala dos Caminhos',
  ].join('\n');
}