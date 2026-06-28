// ============================================================================
// NEWSLETTER HELPER — Resend integration + digest composer (Wave 14, 2026-06-27)
// ============================================================================
// Funções:
//   - composeDigest(period)   → pega top posts/artigos da semana, monta markdown
//   - sendNewsletter(id)      → dispara via Resend (HTTP API direto, sem SDK)
//   - renderMarkdownToHtml    → conversor mínimo MD → HTML inline (sem deps)
//   - buildUnsubscribeUrl     → link público de unsubscribe (token-based)
//
// Resend é opcional: se RESEND_API_KEY ausente, vira stub (log only).
// Idempotência: sendNewsletter só envia se sentAt=null e atualiza sentAt após.
// ============================================================================

import { prisma } from '@/lib/prisma';

// ============================================================================
// TYPES
// ============================================================================

export type DigestPeriod = 'weekly' | 'monthly';

export interface DigestPost {
  id: string;
  preview: string;        // primeiras ~160 chars do content
  authorName: string;
  tradition: string | null;
  topic: string | null;
  createdAt: Date;
  url: string;
}

export interface DigestArticle {
  id: string;
  title: string;
  excerpt: string;
  authorsLabel: string;   // "Griffiths RR, Johnson MW, …"
  tradition: string | null;
  publishedAt: Date;
  url: string;
}

export interface DigestContent {
  period: DigestPeriod;
  posts: DigestPost[];
  articles: DigestArticle[];
  generatedAt: Date;
}

export interface DigestMarkdown {
  subject: string;
  contentMarkdown: string;
}

// ============================================================================
// CONFIG
// ============================================================================

const RESEND_API_URL = 'https://api.resend.com/emails';
const FROM_ADDRESS =
  process.env.NEWSLETTER_FROM_EMAIL ?? 'Cabala dos Caminhos <contato@cabala.dos.caminhos>';
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cabala-dos-caminhos.vercel.app';

// ============================================================================
// composeDigest — top posts da semana + top artigos publicados
// ============================================================================

export async function composeDigest(period: DigestPeriod): Promise<DigestMarkdown> {
  const now = new Date();
  const since = new Date(now);
  if (period === 'weekly') {
    since.setDate(now.getDate() - 7);
  } else {
    since.setMonth(now.getMonth() - 1);
  }

  const [posts, articles] = await Promise.all([
    prisma.post.findMany({
      where: {
        createdAt: { gte: since },
        status: 'PUBLISHED',
        deletedAt: null,
      },
      orderBy: [{ likesCount: 'desc' }, { createdAt: 'desc' }],
      take: 5,
      select: {
        id: true,
        content: true,
        authorId: true,
        tradition: true,
        topic: true,
        createdAt: true,
      },
    }),
    prisma.article.findMany({
      where: {
        publishedAt: { gte: since, not: null },
      },
      orderBy: { publishedAt: 'desc' },
      take: 3,
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        authors: true,
        contributor: true,
        authorId: true,
        tradition: true,
        publishedAt: true,
      },
    }),
  ]);

  // Resolver nomes de autores dos posts em batch (Post só tem authorId)
  const postAuthorIds = Array.from(new Set(posts.map((p) => p.authorId)));
  const postAuthors = postAuthorIds.length
    ? await prisma.user.findMany({
        where: { id: { in: postAuthorIds } },
        select: { id: true, nomeCompleto: true },
      })
    : [];
  const postAuthorMap = new Map(postAuthors.map((u) => [u.id, u.nomeCompleto]));

  const digestPosts: DigestPost[] = posts.map((p) => ({
    id: p.id,
    preview: truncate(p.content, 200),
    authorName: postAuthorMap.get(p.authorId) ?? 'Caminhante',
    tradition: p.tradition,
    topic: p.topic,
    createdAt: p.createdAt,
    url: `${SITE_URL}/comunidade/post/${p.id}`,
  }));

  // Resolver nome do autor de artigos (Article tem authorId + authors[] + contributor)
  const articleAuthorIds = Array.from(
    new Set(articles.map((a) => a.authorId).filter((x): x is string => Boolean(x)))
  );
  const articleAuthors = articleAuthorIds.length
    ? await prisma.user.findMany({
        where: { id: { in: articleAuthorIds } },
        select: { id: true, nomeCompleto: true },
      })
    : [];
  const articleAuthorMap = new Map(articleAuthors.map((u) => [u.id, u.nomeCompleto]));

  const digestArticles: DigestArticle[] = articles
    .filter((a): a is typeof a & { publishedAt: Date } => a.publishedAt !== null)
    .map((a) => {
      const authorsLabel =
        a.authors.length > 0
          ? a.authors.join(', ')
          : a.authorId
            ? (articleAuthorMap.get(a.authorId) ?? 'Equipe Akasha')
            : (a.contributor ?? 'Equipe Akasha');
      return {
        id: a.id,
        title: a.title,
        excerpt: a.summary,
        authorsLabel,
        tradition: a.tradition,
        publishedAt: a.publishedAt,
        url: `${SITE_URL}/biblioteca/${a.slug}`,
      };
    });

  const subject =
    period === 'weekly'
      ? `🌙 Digest Semanal — ${formatDateBR(now)}`
      : `📜 Digest Mensal — ${formatMonthBR(now)}`;

  const contentMarkdown = renderDigestMarkdown({
    period,
    posts: digestPosts,
    articles: digestArticles,
    generatedAt: now,
  });

  return { subject, contentMarkdown };
}

// ============================================================================
// renderDigestMarkdown — formata digest como markdown
// ============================================================================

function renderDigestMarkdown(d: DigestContent): string {
  const lines: string[] = [];
  lines.push(
    `# ${d.period === 'weekly' ? 'Digest Semanal' : 'Digest Mensal'} — Cabala dos Caminhos`,
    ''
  );
  lines.push(
    `*${formatDateBR(d.generatedAt)}*`,
    '',
    'Olá, caminhante! Aqui estão os destaques da comunidade nesta ' +
      (d.period === 'weekly' ? 'semana' : 'mês') + '.',
    ''
  );

  if (d.posts.length > 0) {
    lines.push('## 💬 Discussões em destaque', '');
    for (const p of d.posts) {
      const tags: string[] = [];
      if (p.tradition) tags.push(p.tradition);
      if (p.topic) tags.push(p.topic);
      const tagStr = tags.length > 0 ? ` _(${tags.join(' · ')})_` : '';
      const previewOneLine = p.preview.replace(/\n+/g, ' ');
      lines.push(`### Post${tagStr}`, '', `> ${previewOneLine}`, '');
      lines.push(`*por ${p.authorName}* — [ler post](${p.url})`, '');
    }
  }

  if (d.articles.length > 0) {
    lines.push('## 📚 Artigos publicados', '');
    for (const a of d.articles) {
      const trad = a.tradition ? ` _(${a.tradition})_` : '';
      lines.push(`### ${a.title}${trad}`, '', `> ${a.excerpt}`, '');
      lines.push(`*por ${a.authorsLabel}* — [ler artigo](${a.url})`, '');
    }
  }

  if (d.posts.length === 0 && d.articles.length === 0) {
    lines.push(
      '_Nenhum conteúdo novo nesta ' +
        (d.period === 'weekly' ? 'semana' : 'mês') +
        '. Volte em breve!_',
      ''
    );
  }

  lines.push('---', '', '_Você recebe este digest porque se inscreveu na newsletter._');
  return lines.join('\n');
}

// ============================================================================
// sendNewsletter — dispara via Resend HTTP API (stub se sem key)
// ============================================================================

export interface SendResult {
  ok: boolean;
  recipientCount: number;
  delivered: number;
  failed: number;
  mode: 'live' | 'stub';
  error?: string;
}

export async function sendNewsletter(newsletterId: string): Promise<SendResult> {
  const newsletter = await prisma.newsletter.findUnique({
    where: { id: newsletterId },
  });

  if (!newsletter) {
    return {
      ok: false,
      recipientCount: 0,
      delivered: 0,
      failed: 0,
      mode: 'stub',
      error: 'not_found',
    };
  }

  if (newsletter.sentAt !== null) {
    return {
      ok: false,
      recipientCount: newsletter.recipientCount,
      delivered: 0,
      failed: 0,
      mode: 'stub',
      error: 'already_sent',
    };
  }

  // Seleciona recipients ativos cuja preferência casa com o filtro da edição.
  // Para assinantes com traditions vazio, recebem qualquer filtro (catch-all).
  const recipients = await prisma.newsletterSubscription.findMany({
    where: {
      unsubscribedAt: null,
      frequency: { not: 'NEVER' },
      ...(newsletter.traditionsFilter.length > 0
        ? {
            OR: [
              { traditions: { isEmpty: true } },
              { traditions: { hasSome: newsletter.traditionsFilter } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      email: true,
      unsubscribeToken: true,
    },
  });

  if (recipients.length === 0) {
    // Nada a enviar — marca como enviado com recipientCount=0
    await prisma.newsletter.update({
      where: { id: newsletterId },
      data: { sentAt: new Date(), recipientCount: 0 },
    });
    return { ok: true, recipientCount: 0, delivered: 0, failed: 0, mode: 'stub' };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const mode: 'live' | 'stub' = apiKey ? 'live' : 'stub';

  let delivered = 0;
  let failed = 0;

  for (const r of recipients) {
    try {
      const html = renderMarkdownToHtml(newsletter.contentMarkdown, r.unsubscribeToken);
      if (mode === 'live' && apiKey) {
        const res = await fetch(RESEND_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            from: FROM_ADDRESS,
            to: r.email,
            subject: newsletter.subject,
            html,
          }),
        });
        if (!res.ok) {
          failed++;
          // eslint-disable-next-line no-console
          console.error('[newsletter] resend failed', r.email, res.status);
          continue;
        }
      } else {
        // Stub: apenas log (não envia)
        // eslint-disable-next-line no-console
        console.log(
          `[newsletter][stub] would send "${newsletter.subject}" to ${r.email} (token ${r.unsubscribeToken.slice(0, 8)}…)`
        );
      }
      delivered++;
    } catch (err) {
      failed++;
      // eslint-disable-next-line no-console
      console.error('[newsletter] send error', r.email, err);
    }
  }

  await prisma.newsletter.update({
    where: { id: newsletterId },
    data: {
      sentAt: new Date(),
      recipientCount: delivered,
    },
  });

  return { ok: failed === 0, recipientCount: recipients.length, delivered, failed, mode };
}

// ============================================================================
// RENDER — markdown → HTML inline (mínimo, sem deps)
// ============================================================================

function renderMarkdownToHtml(md: string, unsubscribeToken: string): string {
  const escape = (s: string): string =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const lines = md.split('\n');
  const html: string[] = [];
  let inList = false;

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith('### ')) {
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
      html.push(`<h3>${escape(line.slice(4))}</h3>`);
    } else if (line.startsWith('## ')) {
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
      html.push(`<h2>${escape(line.slice(3))}</h2>`);
    } else if (line.startsWith('# ')) {
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
      html.push(`<h1>${escape(line.slice(2))}</h1>`);
    } else if (line === '---') {
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
      html.push('<hr/>');
    } else if (line.startsWith('> ')) {
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
      html.push(`<blockquote>${escape(line.slice(2))}</blockquote>`);
    } else if (line.startsWith('- ')) {
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      html.push(`<li>${inlineMd(line.slice(2))}</li>`);
    } else if (line.length === 0) {
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
      html.push('');
    } else {
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
      html.push(`<p>${inlineMd(line)}</p>`);
    }
  }
  if (inList) html.push('</ul>');

  const body = html.join('\n');
  const unsubUrl = buildUnsubscribeUrl(unsubscribeToken);

  // Template inline completo
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escape((md.split('\n')[0] ?? '').replace(/^#\s+/, ''))}</title>
</head>
<body style="margin:0;padding:0;background:#f5f3ee;font-family:Georgia,serif;color:#222;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center" style="padding:24px 16px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:32px 28px;">
        ${body}
        <hr style="border:none;border-top:1px solid #e6e2d8;margin:32px 0 16px;"/>
        <p style="font-size:12px;color:#888;text-align:center;">
          Você recebe este email porque se inscreveu no digest da Cabala dos Caminhos.<br/>
          <a href="${unsubUrl}" style="color:#888;">Cancelar inscrição</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function inlineMd(s: string): string {
  // Escapa primeiro, depois aplica apenas transformações inline
  const escaped = s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  return escaped
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|\W)\*([^*]+)\*(?=\W|$)/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

// ============================================================================
// HELPERS
// ============================================================================

function truncate(s: string, max: number): string {
  const trimmed = s.trim().replace(/\s+/g, ' ');
  if (trimmed.length <= max) return trimmed;
  return trimmed.slice(0, max - 1).trimEnd() + '…';
}

function formatDateBR(d: Date): string {
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatMonthBR(d: Date): string {
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

export function buildUnsubscribeUrl(token: string): string {
  return `${SITE_URL}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
}
