// ============================================================================
// PER-TRADITION FEED — /feed/[tradition]
// ============================================================================
// Retorna RSS 2.0 filtrado por tradição. Usado por leitores que querem
// acompanhar só uma linha espiritual (ex: usuário segue Cabala no Feedly).
//
// Tradições válidas (canônicas, sincronizadas com prisma/seed/groups.ts):
//   cabala, ifa, astrologia, tantra, reiki, meditacao, xamanismo,
//   cristianismo-mistico, sufismo, taoismo, umbanda, candomble
//
// Resposta:
//   - 200 application/rss+xml  → feed RSS 2.0 da tradição
//   - 400 application/json     → tradição inválida (não-canônica)
//
// Cache: mesmo padrão do feed global (s-maxage=300, SWR=600).
// ============================================================================

import { NextResponse } from 'next/server';
import {
  BASE_URL,
  FEED_LIMIT,
  getRecentPosts,
  isKnownTradition,
  escapeXml,
  htmlBody,
  toRfc822,
  postUrl,
  traditionLabel,
} from '@/lib/community/feed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{ tradition: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { tradition: raw } = await context.params;
  const tradition = raw.toLowerCase();

  if (!isKnownTradition(tradition)) {
    return NextResponse.json(
      {
        error: {
          code: 4000,
          message: `Tradição desconhecida: "${raw}". Use um slug canônico (cabala, ifa, astrologia, ...).`,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      {
        status: 400,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }

  const posts = await getRecentPosts({ tradition, limit: FEED_LIMIT });
  const label = traditionLabel(tradition);
  const now = new Date();
  const mostRecent = posts[0]?.createdAt ?? now;

  const items = posts
    .map((post) => {
      const url = postUrl(post.id);
      const author = post.authorName;
      const categories: string[] = post.tradition ? [post.tradition] : [];
      if (post.topic) categories.push(post.topic);

      const catXml = categories
        .map((c) => `      <category>${escapeXml(c)}</category>`)
        .join('\n');

      return [
        '    <item>',
        `      <title>${escapeXml(truncate(post.content, 100))}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `      <pubDate>${toRfc822(post.createdAt)}</pubDate>`,
        `      <author>noreply@cabaladoscaminhos.com (${escapeXml(author)})</author>`,
        catXml,
        `      <description><![CDATA[${htmlBody(post.content, 600)}]]></description>`,
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">',
    '  <channel>',
    `    <title>Akasha Portal — ${escapeXml(label)}</title>`,
    `    <link>${escapeXml(BASE_URL)}</link>`,
    `    <description>Feed da tradição ${escapeXml(label)} no Akasha Portal. Os 20 posts mais recentes dessa linha espiritual.</description>`,
    '    <language>pt-BR</language>',
    `    <lastBuildDate>${toRfc822(mostRecent)}</lastBuildDate>`,
    `    <pubDate>${toRfc822(now)}</pubDate>`,
    '    <generator>Akasha Portal RSS Generator</generator>',
    `    <atom:link href="${escapeXml(`${BASE_URL}/feed/${tradition}`)}" rel="self" type="application/rss+xml" />`,
    `    <atom:link href="${escapeXml(`${BASE_URL}/feed.xml`)}" rel="alternate" type="application/rss+xml" />`,
    `    <atom:link href="${escapeXml(`${BASE_URL}/feed.atom`)}" rel="alternate" type="application/atom+xml" />`,
    `    <atom:link href="${escapeXml(`${BASE_URL}/feed.json`)}" rel="alternate" type="application/feed+json" />`,
    items,
    '  </channel>',
    '</rss>',
  ].join('\n');

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}
