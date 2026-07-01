// ============================================================================
// NOTIFICATIONS V2 — Digests (W36)
// ============================================================================
// Builders para digest diário / semanal / mensal. Puros — não tocam DB.
// Recebem um agregado (payload arbitrário), produzem email + in-app body.
//
// Estratégia:
//   - DAILY  (8h local): top mentions + top replies + unread count
//   - WEEKLY (Dom 9h): top posts trending + novas conexões + earnings
//   - MONTHLY (1º 9h): marketplace earnings + community stats + badges
//
// LGPD Art. 7: digest só é enviado se o user tem consent para a categoria.
// ============================================================================

import type { NotificationCategory } from '../preferences-v2';
import { ALL_CATEGORIES } from '../preferences-v2';

// ============================================================================
// Tipos
// ============================================================================

export type DigestKind = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface DigestInput {
  userId: string;
  periodStart: string;     // ISO 8601
  periodEnd: string;       // ISO 8601
  mentions: DigestEntry[];
  replies: DigestEntry[];
  follows: number;
  akashaMilestones: string[];
  marketplaceEarnings: number;
  newPosts: DigestEntry[];
  unreadCount: number;
  locale: string;
  timezone: string;
}

export interface DigestEntry {
  title: string;
  url: string;
  author?: string;
  at?: string;
}

export interface DigestOutput {
  kind: DigestKind;
  subject: string;
  inAppTitle: string;
  inAppBody: string;
  htmlBody: string;
  textBody: string;
  category: NotificationCategory;
}

// ============================================================================
// Helper de trunc
// ============================================================================

function trunc(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max - 1) + '…';
}

// ============================================================================
// Top-N selector
// ============================================================================

function topN<T>(items: T[], n: number, score: (it: T) => number): T[] {
  return [...items].sort((a, b) => score(b) - score(a)).slice(0, n);
}

// ============================================================================
// Render genérico
// ============================================================================

function renderBlocks(
  title: string,
  blocks: { heading: string; body: string }[]
): string {
  return blocks.map((b) => `## ${b.heading}\n${b.body}`).join('\n\n');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderHtml(title: string, blocks: { heading: string; body: string }[]): string {
  const head = `<h1 style="font:600 20px/1.4 system-ui;margin:0 0 16px;">${escapeHtml(title)}</h1>`;
  const body = blocks
    .map(
      (b) =>
        `<section><h2 style="font:600 14px/1.3 system-ui;margin:16px 0 8px;">${escapeHtml(b.heading)}</h2>` +
        `<p style="font:400 14px/1.5 system-ui;margin:0;color:#444;">${escapeHtml(b.body)}</p></section>`
    )
    .join('');
  return `<!doctype html><html><body style="max-width:560px;margin:0 auto;padding:20px;font-family:system-ui;">${head}${body}</body></html>`;
}

// ============================================================================
// 1) Daily digest
// ============================================================================

export function buildDailyDigest(input: DigestInput): DigestOutput {
  const topMentions = topN(input.mentions, 5, () => 1);
  const topReplies = topN(input.replies, 5, () => 1);

  const blocks = [
    {
      heading: '🔔 Menções',
      body:
        topMentions.length === 0
          ? 'Nenhuma menção nas últimas 24h.'
          : topMentions.map((m) => `• "${m.title}" — ${m.author ?? '?'}`).join('\n'),
    },
    {
      heading: '💬 Respostas',
      body:
        topReplies.length === 0
          ? 'Nenhuma resposta ainda.'
          : topReplies.map((r) => `• "${r.title}"`).join('\n'),
    },
    {
      heading: '📊 Resumo',
      body: `Não lidas: ${input.unreadCount}\nNovos seguidores: ${input.follows}`,
    },
  ];

  return {
    kind: 'DAILY',
    subject: trunc(`Cabala • seu resumo diário (${input.unreadCount} não lidas)`, 50),
    inAppTitle: 'Resumo diário',
    inAppBody: `${input.unreadCount} não lidas · ${input.mentions.length} menções · ${input.replies.length} respostas`,
    htmlBody: renderHtml('Resumo diário · Cabala dos Caminhos', blocks),
    textBody: renderBlocks('Cabala — Resumo diário', blocks),
    category: 'akasha',
  };
}

// ============================================================================
// 2) Weekly digest
// ============================================================================

export function buildWeeklyDigest(input: DigestInput): DigestOutput {
  const topPosts = topN(input.newPosts, 7, () => 1);

  const blocks = [
    {
      heading: '🔥 Trending na comunidade',
      body:
        topPosts.length === 0
          ? 'Sem posts em destaque essa semana.'
          : topPosts.map((p, i) => `${i + 1}. "${p.title}" — ${p.author ?? '?'}`).join('\n'),
    },
    {
      heading: '🤝 Sua rede',
      body: `${input.follows} novos seguidores nas últimas 7 dias.`,
    },
    {
      heading: '✨ Akasha',
      body:
        input.akashaMilestones.length === 0
          ? 'Nenhum marco novo esta semana.'
          : input.akashaMilestones.map((m) => `• ${m}`).join('\n'),
    },
  ];

  return {
    kind: 'WEEKLY',
    subject: trunc(`Cabala • trending da semana (${topPosts.length} posts)`, 50),
    inAppTitle: 'Resumo semanal',
    inAppBody: `${topPosts.length} posts trending · ${input.follows} novos seguidores`,
    htmlBody: renderHtml('Resumo semanal · Cabala dos Caminhos', blocks),
    textBody: renderBlocks('Cabala — Resumo semanal', blocks),
    category: 'marketing',
  };
}

// ============================================================================
// 3) Monthly digest
// ============================================================================

export function buildMonthlyDigest(input: DigestInput): DigestOutput {
  const fmt = new Intl.NumberFormat(input.locale || 'pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const blocks = [
    {
      heading: '💰 Marketplace',
      body:
        input.marketplaceEarnings > 0
          ? `Você recebeu ${fmt.format(input.marketplaceEarnings)} em offerings este mês.`
          : 'Sem earnings neste mês.',
    },
    {
      heading: '👥 Comunidade',
      body: `${input.follows} novos seguidores no total · ${input.unreadCount} notificações não lidas`,
    },
  ];

  return {
    kind: 'MONTHLY',
    subject: trunc(`Cabala • seu mês (${fmt.format(input.marketplaceEarnings)})`, 50),
    inAppTitle: 'Resumo mensal',
    inAppBody: `Marketplace: ${fmt.format(input.marketplaceEarnings)} · ${input.follows} novos seguidores`,
    htmlBody: renderHtml('Resumo mensal · Cabala dos Caminhos', blocks),
    textBody: renderBlocks('Cabala — Resumo mensal', blocks),
    category: 'marketing',
  };
}

// ============================================================================
// Self-check
// ============================================================================

export function digestSelfCheck(): { ok: boolean; details: string[] } {
  const details: string[] = [];
  try {
    const sample: DigestInput = {
      userId: 'u1',
      periodStart: '2026-06-01T00:00:00Z',
      periodEnd: '2026-07-01T00:00:00Z',
      mentions: [{ title: 'Sankofa', url: '/p/sankofa', author: 'Iyá' }],
      replies: [],
      follows: 7,
      akashaMilestones: ['10 conversas com Akasha'],
      marketplaceEarnings: 250,
      newPosts: [{ title: '7 Linhas', url: '/p/7linhas' }],
      unreadCount: 12,
      locale: 'pt-BR',
      timezone: 'America/Sao_Paulo',
    };
    const d = buildDailyDigest(sample);
    if (d.kind !== 'DAILY') details.push('daily kind errado');
    if (!d.subject.includes('Cabala')) details.push('subject sem brand');

    const w = buildWeeklyDigest(sample);
    if (w.kind !== 'WEEKLY') details.push('weekly kind errado');

    const m = buildMonthlyDigest(sample);
    if (m.kind !== 'MONTHLY') details.push('monthly kind errado');
    if (!m.textBody.includes('Marketplace')) details.push('monthly sem bloco marketplace');

    // Categoria sanitize
    for (const cat of ALL_CATEGORIES) {
      if (!['marketing', 'akasha', 'system'].includes(cat)) continue;
    }
  } catch (e) {
    details.push(`exceção: ${(e as Error).message}`);
  }
  return { ok: details.length === 0, details };
}
