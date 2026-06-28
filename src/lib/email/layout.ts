// ============================================================================
// EMAIL LAYOUT — shared inline-HTML wrapper (Wave 20, 2026-06-28)
// ============================================================================
// Wrapper padrão para todos os emails transacionais e welcome series.
// Mobile-first, 600px max-width em desktop, full-width em mobile.
//
// Por que inline-HTML e não React Email?
//   - Zero novas deps (Wave 14 já usa inline)
//   - Compat com todos os clients (Gmail, Outlook, Apple Mail)
//   - Controle total sobre atributos table-based (necessários em Outlook)
//
// Estrutura:
//   <table 600px> wrapper
//     <tr> <td> header (logo + tagline)
//     <tr> <td> body slot (template-specific)
//     <tr> <td> footer (LGPD unsubscribe + endereço)
//
// Cores alinhadas com o tema `mystical` (default do projeto).
// ============================================================================

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cabala-dos-caminhos.com.br';
const FROM_NAME =
  process.env.NEWSLETTER_FROM_NAME ?? 'Cabala dos Caminhos';
const FROM_ADDRESS =
  process.env.NEWSLETTER_FROM_EMAIL ?? 'contato@cabala.dos.caminhos.com.br';

export interface LayoutOptions {
  /** Conteúdo HTML interno (já escapado) — vai no slot body. */
  bodyHtml: string;
  /** Pré-header (texto curto exibido na inbox antes do "ver email"). */
  preheader?: string;
  /** Assunto do email (vai no <title>). */
  subject: string;
  /** URL do logo (opcional). Default: badge textual. */
  logoUrl?: string;
  /** Texto alternativo do logo. */
  logoAlt?: string;
  /** Tipo de email — ajusta footer. */
  footer?: 'transactional' | 'marketing';
  /** Token de unsubscribe (obrigatório em marketing, opcional em transactional). */
  unsubscribeToken?: string | null;
  /** Tipo de notificação do unsubscribe (ex: 'welcome', 'comment'). */
  unsubscribeType?: string;
}

export function renderLayout(opts: LayoutOptions): string {
  const {
    bodyHtml,
    preheader = '',
    subject,
    footer = 'marketing',
    unsubscribeToken,
    unsubscribeType,
  } = opts;

  const logoUrl = opts.logoUrl ?? `${SITE_URL}/logo-email.png`;
  const logoAlt = opts.logoAlt ?? `${FROM_NAME} — Portal Akasha`;

  const escape = (s: string): string =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const unsubUrl = unsubscribeToken
    ? `${SITE_URL}/api/email/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}&type=${encodeURIComponent(unsubscribeType ?? 'all')}`
    : null;

  const footerHtml = renderFooter({ footer, unsubUrl });

  // Pré-header é uma técnica antiga de email marketing: texto invisível
  // (font-size:1px, opacity:0) que aparece como preview na inbox.
  const preheaderHtml = preheader
    ? `<div style="display:none;font-size:1px;color:#f5f3ee;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escape(preheader)}</div>`
    : '';

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="x-apple-disable-message-reformatting"/>
<meta name="format-detection" content="telephone=no,date=no,address=no,email=no,url=no"/>
<title>${escape(subject)}</title>
${preheaderHtml}
<style>
  /* Reset mínimo in-line — clients variam, então tabelas > divs */
  body { margin:0; padding:0; background:#f5f3ee; }
  table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
  img { border:0; -ms-interpolation-mode:bicubic; display:block; }
  a { color:#5b3a8a; text-decoration:underline; }
  /* Mobile-first: a table wrapper vai para 100% em viewport pequeno */
  @media only screen and (max-width:620px) {
    .container { width:100% !important; max-width:100% !important; }
    .pad { padding-left:20px !important; padding-right:20px !important; }
    .h1 { font-size:22px !important; line-height:28px !important; }
    .body-text { font-size:16px !important; line-height:24px !important; }
    .cta { padding:14px 24px !important; font-size:16px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#f5f3ee;font-family:Georgia,serif;color:#222;">
${preheaderHtml}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f3ee;">
  <tr>
    <td align="center" style="padding:24px 16px;">
      <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(91,58,138,0.08);">
        <!-- HEADER -->
        <tr>
          <td class="pad" style="padding:32px 28px 16px 28px;text-align:center;border-bottom:1px solid #e6e2d8;">
            <img src="${escape(logoUrl)}" alt="${escape(logoAlt)}" width="48" height="48" style="margin:0 auto 8px auto;display:block;"/>
            <div style="font-size:18px;font-weight:bold;color:#5b3a8a;letter-spacing:0.5px;">${escape(FROM_NAME)}</div>
            <div style="font-size:12px;color:#888;margin-top:4px;font-style:italic;">Portal Akasha — sabedoria viva em comunidade</div>
          </td>
        </tr>
        <!-- BODY -->
        <tr>
          <td class="pad" style="padding:32px 28px;">
            ${bodyHtml}
          </td>
        </tr>
        <!-- FOOTER -->
        <tr>
          <td class="pad" style="padding:24px 28px;border-top:1px solid #e6e2d8;background:#faf8f3;">
            ${footerHtml}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

function renderFooter(opts: {
  footer: 'transactional' | 'marketing';
  unsubUrl: string | null;
}): string {
  const escape = (s: string): string =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const year = new Date().getFullYear();
  const address = escape(FROM_ADDRESS);

  if (opts.footer === 'transactional') {
    // Footer minimalista para emails transacionais (password reset, verify)
    // — não tem unsubscribe porque o usuário precisa receber pra usar a conta.
    return `
      <p style="font-size:12px;color:#888;text-align:center;margin:0 0 8px 0;">
        Você recebeu este email porque tem uma conta ativa em ${escape(FROM_NAME)}.
      </p>
      <p style="font-size:12px;color:#888;text-align:center;margin:0;">
        © ${year} ${escape(FROM_NAME)} · <a href="${escape(SITE_URL)}" style="color:#888;">${escape(SITE_URL.replace(/^https?:\/\//, ''))}</a>
      </p>
    `;
  }

  // Marketing footer (welcome series, notifications, digest)
  return `
    <p style="font-size:13px;color:#555;text-align:center;margin:0 0 12px 0;">
      Você faz parte da nossa comunidade de caminhantes espirituais.
    </p>
    ${
      opts.unsubUrl
        ? `<p style="font-size:12px;color:#888;text-align:center;margin:0 0 8px 0;">
             <a href="${escape(opts.unsubUrl)}" style="color:#888;">Cancelar inscrição</a>
             &nbsp;·&nbsp;
             <a href="${escape(SITE_URL)}/perfil/notificacoes" style="color:#888;">Preferências de email</a>
           </p>`
        : `<p style="font-size:12px;color:#888;text-align:center;margin:0 0 8px 0;">
             <a href="${escape(SITE_URL)}/perfil/notificacoes" style="color:#888;">Preferências de email</a>
           </p>`
    }
    <p style="font-size:11px;color:#aaa;text-align:center;margin:0;line-height:16px;">
      ${address} · © ${year} ${escape(FROM_NAME)}<br/>
      Enviado com respeito e em conformidade com a LGPD.
    </p>
  `;
}

// ============================================================================
// Helpers para os templates renderizarem conteúdo
// ============================================================================

/** Renderiza um botão CTA (table-based para compat Outlook). */
export function renderCta(opts: { label: string; href: string; color?: string }): string {
  const escape = (s: string): string =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  const bg = opts.color ?? '#5b3a8a';
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:24px auto;">
      <tr>
        <td align="center" style="border-radius:6px;background:${bg};">
          <a href="${escape(opts.href)}" class="cta" target="_blank" rel="noopener" style="display:inline-block;padding:14px 32px;font-family:Georgia,serif;font-size:16px;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;">
            ${escape(opts.label)}
          </a>
        </td>
      </tr>
    </table>
  `;
}

/** Escapa HTML para uso seguro em templates. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
