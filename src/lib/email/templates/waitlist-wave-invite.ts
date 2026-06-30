// ============================================================================
// WAITLIST WAVE INVITE — Day N (Wave 32, 2026-06-30)
// ============================================================================
// Disparado quando o usuário é SELECIONADO para entrar no beta (wave invite).
// Esse é o email mais importante do funil: tem o token de acesso que abre
// as portas.
//
// Tom: solene mas caloroso. Reconhecemos a jornada (espera, confirmações)
// e damos as boas-vindas ao beta.
//
// Token: magic-link de 7 dias (HMAC + email hash). Após clicar, usuário
// cai direto em /onboarding com sessão pré-criada.
// ============================================================================

import { renderLayout, renderCta, escapeHtml } from '@/lib/email/layout';
import type { RenderOptions, RenderedTemplate } from '@/lib/email/templates/index';

export interface WaitlistWaveInviteData {
  displayName: string;
  /** Número da onda que o usuário entrou (1, 2 ou 3). */
  waveNumber: 1 | 2 | 3;
  /** Tamanho da onda atual. */
  waveSize: number;
  /** Tradição principal. */
  tradition: string;
  /** Magic link de acesso ao beta (7 dias de validade). */
  accessUrl: string;
  /** URL da home (caso queira só explorar antes). */
  communityUrl: string;
  /** URL do canal de feedback durante o beta. */
  feedbackUrl: string;
}

export function renderWaitlistWaveInvite(
  data: WaitlistWaveInviteData,
  options: RenderOptions = {},
): RenderedTemplate {
  const subject = `🌀 Você está dentro — bem-vindo(a) à onda ${data.waveNumber} do beta`;
  const greeting = escapeHtml(data.displayName);

  const bodyHtml = `
    <h1 class="h1" style="font-family:Georgia,serif;font-size:28px;line-height:36px;color:#222;margin:0 0 16px 0;font-weight:normal;">
      Sua vez chegou, ${greeting}.
    </h1>
    <p class="body-text" style="font-family:Georgia,serif;font-size:16px;line-height:24px;color:#444;margin:0 0 16px 0;">
      Você foi selecionado(a) para a <strong>Onda ${data.waveNumber}</strong>
      do beta privado da Cabala dos Caminhos — entre os ${data.waveSize}
      primeiros praticantes a entrar. A porta está aberta.
    </p>

    <div style="background:#f9f6f0;border-left:3px solid #c084fc;padding:14px 18px;margin:24px 0;border-radius:4px;">
      <p style="font-family:Georgia,serif;font-size:15px;line-height:22px;color:#444;margin:0;">
        <strong>Por que você:</strong> priorizamos leads com tradição declarada
        ${data.tradition ? `(${escapeHtml(data.tradition)}) ` : ''}e confirmação
        de email — você completou o caminho. Bem-vindo(a).
      </p>
    </div>

    <h2 style="font-family:Georgia,serif;font-size:20px;line-height:28px;color:#5b3a8a;margin:32px 0 12px 0;font-weight:normal;">
      O que vem agora
    </h2>
    <ol style="font-family:Georgia,serif;font-size:16px;line-height:26px;color:#444;margin:0 0 24px 0;padding-left:20px;">
      <li><strong>Clique abaixo</strong> para aceitar o convite — vamos criar sua conta automaticamente.</li>
      <li><strong>Complete o onboarding</strong> (mapa espiritual, tradições, primeiro post).</li>
      <li><strong>Explore</strong> — sua opinião vai moldar o que vira feature.</li>
    </ol>

    ${renderCta({ label: 'Aceitar convite e entrar no beta →', href: data.accessUrl })}

    <p class="body-text" style="font-family:Georgia,serif;font-size:14px;line-height:22px;color:#666;margin:16px 0 0 0;">
      Esse link expira em <strong>7 dias</strong>. Se não usar até lá, sua vaga
      volta para o fim da fila da próxima onda.
    </p>

    <h2 style="font-family:Georgia,serif;font-size:20px;line-height:28px;color:#5b3a8a;margin:32px 0 12px 0;font-weight:normal;">
      Sua voz importa
    </h2>
    <p class="body-text" style="font-family:Georgia,serif;font-size:16px;line-height:24px;color:#444;margin:0 0 16px 0;">
      Durante o beta, sua opinião literalmente molda o produto. Tem um canal
      só para feedback — leio tudo pessoalmente.
    </p>
    ${renderCta({ label: 'Canal de feedback', href: data.feedbackUrl, secondary: true })}

    <p class="body-text" style="font-family:Georgia,serif;font-size:15px;line-height:24px;color:#666;margin:32px 0 0 0;font-style:italic;">
      Obrigado por esperar. Esse projeto existe porque vocês acreditaram.<br/>
      — Equipe Cabala dos Caminhos
    </p>
  `;

  const html = renderLayout({
    bodyHtml,
    preheader: `Você está dentro! Clique para aceitar o convite da Onda ${data.waveNumber} (7 dias de validade).`,
    subject,
    footer: 'transactional',
    unsubscribeToken: options.unsubscribeToken,
    unsubscribeType: 'waitlist',
  });

  const text = textVersion(data);
  return { subject, html, text };
}

function textVersion(d: WaitlistWaveInviteData): string {
  return [
    `Sua vez chegou, ${d.displayName}!`,
    '',
    `Você foi selecionado para a Onda ${d.waveNumber} do beta (${d.waveSize} vagas).`,
    d.tradition ? `Tradição priorizada: ${d.tradition}.` : '',
    '',
    'O que vem agora:',
    `1. Aceitar convite (7 dias de validade): ${d.accessUrl}`,
    '2. Completar onboarding',
    '3. Explorar e dar feedback',
    '',
    `Feedback direto: ${d.feedbackUrl}`,
    '',
    '— Equipe Cabala dos Caminhos',
  ]
    .filter(Boolean)
    .join('\n');
}