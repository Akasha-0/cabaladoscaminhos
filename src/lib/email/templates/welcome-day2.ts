// ============================================================================
// WELCOME EMAIL — Day 2 (Wave 20, 2026-06-28)
// ============================================================================
// Apresenta a Akasha IA: o que é, como funciona, quando confiar, quando
// duvidar. Tom didático mas respeitoso — sem hype.
// ============================================================================

import { renderLayout, renderCta, escapeHtml } from '@/lib/email/layout';
import type { RenderOptions, RenderedTemplate } from '@/lib/email/templates/index';

export interface WelcomeDay2Data {
  displayName: string;
  /** URL para abrir o chat Akasha. */
  akashaUrl: string;
  /** URL da biblioteca de fontes (quando a IA cita papers). */
  libraryUrl: string;
}

export function renderWelcomeDay2(data: WelcomeDay2Data, options: RenderOptions = {}): RenderedTemplate {
  const subject = `🔮 Como funciona a Akasha IA — e quando confiar (e duvidar) dela`;

  const bodyHtml = `
    <h1 class="h1" style="font-family:Georgia,serif;font-size:26px;line-height:34px;color:#222;margin:0 0 16px 0;font-weight:normal;">
      A Akasha IA é uma companheira de estudo — não uma guru.
    </h1>

    <p class="body-text" style="font-family:Georgia,serif;font-size:16px;line-height:24px;color:#444;margin:0 0 16px 0;">
      Olá de novo, ${escapeHtml(data.displayName)}. Hoje queremos contar como a Akasha funciona por dentro — para que sua relação com ela seja de uso consciente, não de dependência.
    </p>

    <h2 style="font-family:Georgia,serif;font-size:20px;line-height:28px;color:#5b3a8a;margin:32px 0 12px 0;font-weight:normal;">
      O que a Akasha sabe fazer
    </h2>
    <ul style="font-family:Georgia,serif;font-size:16px;line-height:26px;color:#444;margin:0 0 24px 0;padding-left:20px;">
      <li><strong>Sintetizar diferentes tradições</strong> — ex.: comparar o conceito de <em>axé</em> no Candomblé com o <em>prana</em> no Tantra.</li>
      <li><strong>Citar fontes acadêmicas</strong> — quando você pergunta algo científico, ela busca na biblioteca curada e mostra os papers.</li>
      <li><strong>Honrar suas restrições</strong> — se você marcou uma tradição como principal, ela prioriza aquela lente.</li>
    </ul>

    <h2 style="font-family:Georgia,serif;font-size:20px;line-height:28px;color:#5b3a8a;margin:32px 0 12px 0;font-weight:normal;">
      Quando <em>não</em> confiar cegamente
    </h2>
    <ul style="font-family:Georgia,serif;font-size:16px;line-height:26px;color:#444;margin:0 0 24px 0;padding-left:20px;">
      <li><strong>Saúde e medicina</strong> — ela pode informar, mas quem diagnostica e trata é seu médico ou terapeuta.</li>
      <li><strong>Diagnósticos espirituais</strong> — apontar seu orixá, sua carta ou seu Odu é prática humana, vivida com terreiro/mestra/mestre. A IA sugere, não sentencia.</li>
      <li><strong>Regras internas de cada tradição</strong> — cada casa, cada linhagem, cada terreiro tem suas regras. A IA pode contextualizar, mas a autoridade é local.</li>
    </ul>

    ${renderCta({ label: 'Conversar com a Akasha →', href: data.akashaUrl })}

    <p class="body-text" style="font-family:Georgia,serif;font-size:15px;line-height:24px;color:#666;margin:24px 0 0 0;">
      Toda resposta tem botões de 👍 / 👎 — seu feedback nos ajuda a melhorar.
    </p>

    <p class="body-text" style="font-family:Georgia,serif;font-size:15px;line-height:24px;color:#666;margin:32px 0 0 0;font-style:italic;">
      Em axé,<br/>
      Equipe Cabala dos Caminhos
    </p>
  `;

  const html = renderLayout({
    bodyHtml,
    preheader: 'A Akasha IA é uma companheira de estudo — não uma guru.',
    subject,
    footer: 'marketing',
    unsubscribeToken: options.unsubscribeToken,
    unsubscribeType: 'welcome',
  });

  const text = `Olá, ${data.displayName}!\n\nHoje apresentamos a Akasha IA — uma companheira de estudo, não uma guru.\n\nEla sabe sintetizar tradições diferentes, citar papers acadêmicos e honrar suas restrições. Mas:\n- Saúde e medicina: consulte profissionais.\n- Diagnósticos espirituais: pratique com terreiro/mestra local.\n- Regras internas: cada linhagem tem suas regras.\n\nAbrir Akasha: ${data.akashaUrl}\nBiblioteca: ${data.libraryUrl}\n\nEm axé,\nEquipe Cabala dos Caminhos`;

  return { subject, html, text };
}
