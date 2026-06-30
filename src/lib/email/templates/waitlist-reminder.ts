// ============================================================================
// WAITLIST REMINDER — Day 7 (Wave 32, 2026-06-30)
// ============================================================================
// Disparado 7 dias após signup se o lead AINDA não confirmou email.
//
// Estratégia: tom leve, sem culpa. Objetivo único: levar à ação
// (confirmar ou ajustar expectativa). Não menciona churn — estamos
// no beta, a fila é pequena, não há pressão de revenue.
//
// Personalização: menciona tradição escolhida + posição relativa
// (ex: "existem X pessoas na sua frente") para criar urgência sem
// manipular.
// ============================================================================

import { renderLayout, renderCta, escapeHtml } from '@/lib/email/layout';
import type { RenderOptions, RenderedTemplate } from '@/lib/email/templates/index';

export interface WaitlistReminderData {
  displayName?: string;
  /** Email do lead (para o link de confirmação). */
  email: string;
  /** Posição na fila (inclui não-confirmados). */
  position: number;
  /** Total na fila. */
  total: number;
  /** Tradição escolhida no signup. */
  tradition: string;
  /** URL para confirmar email (re-gera token se necessário). */
  confirmUrl: string;
  /** URL pública do projeto. */
  exploreUrl: string;
  /** Dias até a próxima onda. */
  daysUntilNextWave: number;
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

export function renderWaitlistReminder(
  data: WaitlistReminderData,
  options: RenderOptions = {},
): RenderedTemplate {
  const greeting = data.displayName ? `, ${escapeHtml(data.displayName)}` : '';
  const subject = `Sua vaga na fila do beta ainda está esperando — confirme o email`;

  const peopleAhead = Math.max(0, data.position - 1);
  const traditionLabel = formatTradition(data.tradition);

  const bodyHtml = `
    <h1 class="h1" style="font-family:Georgia,serif;font-size:28px;line-height:36px;color:#222;margin:0 0 16px 0;font-weight:normal;">
      Oi${greeting} — tudo bem?
    </h1>
    <p class="body-text" style="font-family:Georgia,serif;font-size:16px;line-height:24px;color:#444;margin:0 0 16px 0;">
      Você entrou na fila do beta há alguns dias, mas seu email ainda não foi
      confirmado. Sem essa confirmação, não conseguimos te chamar quando a
      próxima onda abrir — então estamos só passando para avisar.
    </p>

    ${
      peopleAhead > 0
        ? `<p class="body-text" style="font-family:Georgia,serif;font-size:16px;line-height:24px;color:#444;margin:0 0 16px 0;">
            Atualmente existem <strong>${peopleAhead} pessoas na sua frente</strong>
            na fila geral. Os confirmados passam na frente — então confirmar é
            a forma mais rápida de subir.
          </p>`
        : `<p class="body-text" style="font-family:Georgia,serif;font-size:16px;line-height:24px;color:#444;margin:0 0 16px 0;">
            Você está no topo da fila. Faltam <strong>${data.daysUntilNextWave} dias</strong>
            para a próxima onda. Confirme seu email para garantir o invite.
          </p>`
    }

    <p class="body-text" style="font-family:Georgia,serif;font-size:16px;line-height:24px;color:#444;margin:0 0 16px 0;">
      Sobre <strong>${escapeHtml(traditionLabel)}</strong> — vamos abrir espaço
      no beta com curadoria inicial nessa tradição. Seus interesses ajudam a
      calibrar o que priorizamos nos primeiros 50 praticantes.
    </p>

    ${renderCta({ label: 'Confirmar email →', href: data.confirmUrl })}

    <p class="body-text" style="font-family:Georgia,serif;font-size:14px;line-height:22px;color:#666;margin:16px 0 0 0;">
      Se o email não chegar na caixa de entrada, confira o spam ou a aba Promoções
      do Gmail. O remetente é <em>contato@cabala.dos.caminhos.com.br</em>.
    </p>

    <h2 style="font-family:Georgia,serif;font-size:20px;line-height:28px;color:#5b3a8a;margin:32px 0 12px 0;font-weight:normal;">
      Não é mais o momento?
    </h2>
    <p class="body-text" style="font-family:Georgia,serif;font-size:14px;line-height:22px;color:#666;margin:0 0 16px 0;">
      Sem problema. Você pode sair da fila a qualquer momento —
      <a href="${escapeHtml(data.exploreUrl)}" style="color:#5b3a8a;">remover da lista</a>.
      Não vamos incomodar de novo.
    </p>

    <p class="body-text" style="font-family:Georgia,serif;font-size:15px;line-height:24px;color:#666;margin:32px 0 0 0;font-style:italic;">
      Axé,<br/>
      — Equipe Cabala dos Caminhos
    </p>
  `;

  const html = renderLayout({
    bodyHtml,
    preheader: `Confirme seu email para garantir o invite do beta. Leva 10 segundos.`,
    subject,
    footer: 'marketing',
    unsubscribeToken: options.unsubscribeToken,
    unsubscribeType: 'waitlist',
  });

  const text = textVersion(data);
  return { subject, html, text };
}

function textVersion(d: WaitlistReminderData): string {
  const greeting = d.displayName ? `, ${d.displayName}` : '';
  const peopleAhead = Math.max(0, d.position - 1);
  return [
    `Oi${greeting}!`,
    '',
    `Você entrou na fila do beta há alguns dias mas ainda não confirmou o email.`,
    peopleAhead > 0
      ? `${peopleAhead} pessoas estão na sua frente. Confirmar te coloca na frente dos não-confirmados.`
      : `Você está no topo. Faltam ${d.daysUntilNextWave} dias para a próxima onda.`,
    '',
    `Confirmar email: ${d.confirmUrl}`,
    `Remover da lista: ${d.exploreUrl}/waitlist/unsubscribe?email=${encodeURIComponent(d.email)}`,
    '',
    '— Equipe Cabala dos Caminhos',
  ].join('\n');
}