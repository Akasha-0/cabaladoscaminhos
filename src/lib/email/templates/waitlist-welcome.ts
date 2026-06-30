// ============================================================================
// WAITLIST WELCOME — Day 0 (Wave 32, 2026-06-30)
// ============================================================================
// Disparado imediatamente após o usuário entrar na lista de espera do beta.
//
// Tom: acolhedor, mas já com tempero beta — queremos que o usuário entenda
// o que vem depois (confirmação → lembrete → invite) sem criar ansiedade.
//
// Diferença vs. welcome.ts:
//   - welcome.ts é para usuários que JÁ se cadastraram na plataforma
//   - waitlist-welcome.ts é para leads da landing /validacao que ainda
//     não confirmaram email nem aceitaram LGPD
//
// LGPD:
//   - Link de confirmação com token HMAC (expira em 7 dias)
//   - Unsubscribe footer (opt-out de marketing)
// ============================================================================

import { renderLayout, renderCta, escapeHtml } from '@/lib/email/layout';
import type { RenderOptions, RenderedTemplate } from '@/lib/email/templates/index';

export interface WaitlistWelcomeData {
  /** Primeiro nome do lead (opcional — se coletado). */
  displayName?: string;
  /** Tradição principal escolhida no form (slug canônico). */
  tradition: string;
  /** Posição na fila (#1..N). */
  position: number;
  /** Total de pessoas na fila. */
  total: number;
  /** URL para confirmar email (com token HMAC). */
  confirmUrl: string;
  /** URL da home pública (para o CTA "explorar enquanto espera"). */
  exploreUrl: string;
  /** Prazo estimado até a próxima onda (ISO date ou string livre). */
  nextWaveEta: string;
}

const TRADITION_LABELS: Record<string, string> = {
  cigano: 'Baralho Cigano',
  candomble: 'Candomblé',
  umbanda: 'Umbanda',
  ifa: 'Ifá',
  cabala: 'Cabala',
  astrologia: 'Astrologia',
  tantra: 'Tantra',
};

function formatTradition(slug: string): string {
  return TRADITION_LABELS[slug] ?? slug;
}

export function renderWaitlistWelcome(
  data: WaitlistWelcomeData,
  options: RenderOptions = {},
): RenderedTemplate {
  const greeting = data.displayName ? `, ${escapeHtml(data.displayName)}` : '';
  const subject = `✦ Você está dentro — posição #${data.position} na fila do beta`;

  const bodyHtml = `
    <h1 class="h1" style="font-family:Georgia,serif;font-size:28px;line-height:36px;color:#222;margin:0 0 16px 0;font-weight:normal;">
      Bem-vindo(a)${greeting}.
    </h1>
    <p class="body-text" style="font-family:Georgia,serif;font-size:16px;line-height:24px;color:#444;margin:0 0 16px 0;">
      Você entrou na fila do beta privado da Cabala dos Caminhos — um espaço
      de espiritualidade universalista com curadoria por IA e respeito
      multi-tradição. Sua posição: <strong>#${data.position}</strong> de
      ${data.total} pessoas inscritas.
    </p>

    ${
      data.tradition
        ? `<p class="body-text" style="font-family:Georgia,serif;font-size:16px;line-height:24px;color:#444;margin:0 0 16px 0;">
            Notamos seu interesse por <strong>${escapeHtml(formatTradition(data.tradition))}</strong>.
            Quando o beta abrir, você verá conteúdo curado dessa tradição junto
            com as demais — sem isolamento, sem proselitismo.
          </p>`
        : ''
    }

    <h2 style="font-family:Georgia,serif;font-size:20px;line-height:28px;color:#5b3a8a;margin:32px 0 12px 0;font-weight:normal;">
      Próximos passos
    </h2>
    <ol style="font-family:Georgia,serif;font-size:16px;line-height:26px;color:#444;margin:0 0 24px 0;padding-left:20px;">
      <li><strong>Confirme seu email</strong> (clique no botão abaixo) — sem isso seu convite não chega.</li>
      <li><strong>Aguarde o invite</strong> — quando sua posição virar acesso (beta é em 3 ondas de 10/20/20), você recebe um token.</li>
      <li><strong>Entre e explore</strong> — durante a espera, pode acompanhar a evolução do projeto.</li>
    </ol>

    ${renderCta({ label: 'Confirmar meu email →', href: data.confirmUrl })}

    <h2 style="font-family:Georgia,serif;font-size:20px;line-height:28px;color:#5b3a8a;margin:32px 0 12px 0;font-weight:normal;">
      Enquanto espera
    </h2>
    <p class="body-text" style="font-family:Georgia,serif;font-size:16px;line-height:24px;color:#444;margin:0 0 16px 0;">
      Próxima onda prevista: <strong>${escapeHtml(data.nextWaveEta)}</strong>.
      Se quiser entender melhor o projeto antes do beta abrir:
    </p>
    ${renderCta({ label: 'Explorar o projeto', href: data.exploreUrl, secondary: true })}

    <p class="body-text" style="font-family:Georgia,serif;font-size:15px;line-height:24px;color:#666;margin:32px 0 0 0;font-style:italic;">
      Axé. Que seu caminhar seja leve e atento.<br/>
      — Equipe Cabala dos Caminhos
    </p>
  `;

  const html = renderLayout({
    bodyHtml,
    preheader: `Posição #${data.position} garantida. Confirme seu email para receber o invite.`,
    subject,
    footer: 'marketing',
    unsubscribeToken: options.unsubscribeToken,
    unsubscribeType: 'waitlist',
  });

  const text = textVersion(data);
  return { subject, html, text };
}

function textVersion(d: WaitlistWelcomeData): string {
  const greeting = d.displayName ? `, ${d.displayName}` : '';
  return [
    `Bem-vindo(a)${greeting}!`,
    '',
    `Você entrou na fila do beta privado. Posição #${d.position} de ${d.total}.`,
    d.tradition ? `Interesse declarado: ${formatTradition(d.tradition)}.` : '',
    '',
    'Próximos passos:',
    `1. Confirmar email: ${d.confirmUrl}`,
    `2. Aguardar invite (próxima onda: ${d.nextWaveEta})`,
    `3. Explorar o projeto: ${d.exploreUrl}`,
    '',
    'Axé.',
    '— Equipe Cabala dos Caminhos',
  ]
    .filter(Boolean)
    .join('\n');
}