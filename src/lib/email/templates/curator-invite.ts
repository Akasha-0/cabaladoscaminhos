// ============================================================================
// CURATOR INVITE EMAIL — Wave 35 (2026-07-01)
// ============================================================================// Convite formal para um(a) curador(a) convidado(a) ingressar como
// revisor(a) especializado(a) de uma tradição na Biblioteca Akasha.
// Tom: respeitoso, cerimonioso-sem-rigidez, com responsabilidade clara.
//
// Decisões de design:
//   - Saudação pessoal (displayName)
//   - Bloco de responsabilidade (papel + escopo + LGPD)
//   - CTA único: "Aceitar convite e conhecer o contrato"
//   - Janela de expiração visível (14d)
//   - Tradição foco destacada (universalismo: linguagens neutras)
//   - Menção honrosa a Iyá (curadora-chefe) quando aplicável
//
// Tracking:
//   - Pixel de abertura → /api/curators/track/open/[hash]
//   - Link CTA aponta para /curator/convite/[token] (server-side verifica)
// ============================================================================

import { renderLayout, renderCta, escapeHtml } from '@/lib/email/layout';
import type { RenderOptions, RenderedTemplate } from '@/lib/email/templates/index';

export interface CuratorInviteData {
  displayName: string;
  inviterName: string;     // "Iyá Akasha" ou nome do admin
  inviterRole: string;     // "Curadora-chefe" | "Admin"
  tradition: string;       // slug canônico: cabala, ifa, tantra, astrologia, ...
  traditionLabel: string;  // "Cabala" | "Ifá" | "Tantra/Astrologia" (humano)
  curatorRole: string;     // "Curador(a) convidado(a)" | "Curador(a) temporário(a)"
  acceptUrl: string;
  trackingPixelUrl?: string;
  expiresAt: Date;
  personalMessage?: string;
}

const TRADITION_VALUES: Record<string, string> = {
  cabala: 'Cabala',
  ifa: 'Ifá',
  tantra: 'Tantra',
  astrologia: 'Astrologia',
  xamanismo: 'Xamanismo',
  umbanda: 'Umbanda',
  candomble: 'Candomblé',
  reiki: 'Reiki',
  ayurveda: 'Ayurveda',
};

export function renderCuratorInvite(
  data: CuratorInviteData,
  options: RenderOptions = {}
): RenderedTemplate {
  const tradLabel = data.traditionLabel || TRADITION_VALUES[data.tradition] || data.tradition;
  const greeting = `Olá, ${escapeHtml(data.displayName)}`;
  const expiresFmt = data.expiresAt.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const subject = `✶ Convite formal: curador(a) de ${tradLabel} · Biblioteca Akasha`;

  const responsibilityItems = [
    `Revisar e aprovar artigos da tradição <strong>${escapeHtml(tradLabel)}</strong> submetidos à Biblioteca`,
    `Moderar posts sinalizados que tocam conteúdo sensível da sua tradição`,
    `Zelar pelo tom respeitoso e universalista do acervo (sem proselitismo)`,
    `Cumprir a LGPD (Art. 7, 18, 37) ao tratar dados pessoais de autores`,
  ];

  const responsibilitiesHtml = responsibilityItems
    .map((r) => `<li style="margin:0 0 8px 0;">${r}</li>`)
    .join('');

  const personalBlock = data.personalMessage
    ? `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;background:#1e293b;border-left:3px solid #a78bfa;border-radius:4px;">
        <tr>
          <td style="padding:16px 20px;">
            <p style="margin:0 0 6px 0;font-size:12px;color:#a78bfa;text-transform:uppercase;letter-spacing:1px;">Mensagem pessoal</p>
            <p style="margin:0;font-style:italic;color:#e2e8f0;line-height:1.55;">"${escapeHtml(data.personalMessage)}"</p>
            <p style="margin:8px 0 0 0;font-size:13px;color:#cbd5e1;">— ${escapeHtml(data.inviterName)}</p>
          </td>
        </tr>
      </table>
    `
    : '';

  const bodyHtml = `
    <p style="margin:0 0 16px 0;font-size:16px;color:#e2e8f0;">${greeting},</p>

    <p style="margin:0 0 16px 0;line-height:1.55;color:#cbd5e1;">
      É um prazer estender-lhe, em nome de ${escapeHtml(data.inviterName)} (${escapeHtml(data.inviterRole)}),
      um convite formal para integrar a curadoria da Biblioteca Akasha como
      <strong style="color:#fef3c7;">${escapeHtml(data.curatorRole)}</strong> com foco em
      <strong style="color:#fef3c7;">${escapeHtml(tradLabel)}</strong>.
    </p>

    <p style="margin:0 0 8px 0;color:#e2e8f0;">Sua responsabilidade contemplará:</p>
    <ul style="margin:0 0 16px 0;padding-left:20px;color:#cbd5e1;">
      ${responsibilitiesHtml}
    </ul>

    ${personalBlock}

    <p style="margin:0 0 8px 0;color:#e2e8f0;">O que você recebe ao aceitar:</p>
    <ul style="margin:0 0 16px 0;padding-left:20px;color:#cbd5e1;">
      <li style="margin:0 0 8px 0;">Workspace dedicado em <code style="background:#1e293b;padding:2px 6px;border-radius:3px;color:#a78bfa;">/curator/${escapeHtml(data.tradition)}</code> com fila de artigos pendentes</li>
      <li style="margin:0 0 8px 0;">Poder de aprovação e sinalização para conteúdo da sua tradição</li>
      <li style="margin:0 0 8px 0;">Visibilidade como curador(a) na página da tradição (opt-in)</li>
      <li style="margin:0 0 8px 0;">Acesso a encontros mensais entre curadores e a Iyá</li>
    </ul>

    <p style="margin:0 0 16px 0;line-height:1.55;color:#cbd5e1;">
      O convite é válido até <strong style="color:#fef3c7;">${expiresFmt}</strong>.
      Caso não seja possível aceitar dentro dessa janela, basta responder este e-mail —
      podemos renovar o convite em outro momento.
    </p>

    ${renderCta({
      label: 'Aceitar convite e conhecer o contrato',
      href: data.acceptUrl,
      color: '#a78bfa',
    })}

    <p style="margin:24px 0 0 0;font-size:13px;color:#94a3b8;line-height:1.5;">
      Em respeito à LGPD (Art. 7º, I), seu aceite será registrado explicitamente
      em nosso log de auditoria. Você pode revogar o consentimento a qualquer momento
      respondendo este e-mail.
    </p>
  `;

  const html = renderLayout({
    title: subject,
    preheader: `${data.inviterName} convida você para a curadoria de ${tradLabel}`,
    bodyHtml,
    trackingPixelUrl: data.trackingPixelUrl,
  });

  const text = [
    greeting + ',',
    '',
    `É um prazer estender-lhe, em nome de ${data.inviterName} (${data.inviterRole}),`,
    `um convite formal para integrar a curadoria da Biblioteca Akasha como`,
    `${data.curatorRole} com foco em ${tradLabel}.`,
    '',
    'Sua responsabilidade contemplará:',
    ...responsibilityItems.map((r) => `  - ${r.replace(/<[^>]+>/g, '')}`),
    '',
    data.personalMessage ? `Mensagem pessoal: "${data.personalMessage}"\n  — ${data.inviterName}\n` : '',
    'O convite é válido até ' + expiresFmt + '.',
    '',
    'Aceitar: ' + data.acceptUrl,
    '',
    '(LGPD Art. 7º, I — seu aceite será registrado em log de auditoria.)',
  ]
    .filter(Boolean)
    .join('\n');

  return { subject, html, text };
}
