// ============================================================================
// RSS 2.0 — /feed.xml
// ============================================================================
// Feed RSS 2.0 público com os 20 posts mais recentes publicados na
// comunidade (qualquer tradição). Cache edge 5min + SWR 10min.
//
// Especificação: https://www.rssboard.org/rss-specification
//
// Detalhes técnicos:
//   - Content-Type: application/rss+xml; charset=utf-8
//   - Channel metadata: title, link, description, language, lastBuildDate,
//     atom:self (RFC 5005), atom:link alternates (Atom feeds), generator
//   - Cada <item>: title, link, guid (permalink), pubDate, author,
//     category (tradição), description (resumo HTML)
//   - XML 1.0 + entities escapadas (sem libs externas)
// ============================================================================

import { NextResponse } from 'next/server';
import {
  BASE_URL,
  FEED_LIMIT,
  getRecentPosts,
  escapeXml,
  htmlBody,
  toRfc822,
  postUrl,
} from '@/lib/community/feed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CHANNEL = {
  title: 'Akasha Portal — Comunidade Viva',
  description:
    'Feed público dos posts mais recentes da comunidade de espiritualidade universalista: Cabala, Ifá, Astrologia, Tantra, Xamanismo, Reiki e mais.',
  language: 'pt-BR',
} as const;

export async function GET() {
  const posts = await getRecentPosts({ limit: FEED_LIMIT });
  const now = new Date();
  const buildDate = toRfc822(now);
  const mostRecent = posts[0]?.createdAt ?? now;
  const lastBuildDate = toRfc822(mostRecent);

  const items = posts
    .map((post) => {
      const url = postUrl(post.id);
      const author = post.authorName;
      const categories: string[] = [];
      if (post.tradition) categories.push(post.tradition);
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
    `    <title>${escapeXml(CHANNEL.title)}</title>`,
    `    <link>${escapeXml(BASE_URL)}</link>`,
    `    <description>${escapeXml(CHANNEL.description)}</description>`,
    `    <language>${CHANNEL.language}</language>`,
    `    <lastBuildDate>${lastBuildDate}</lastBuildDate>`,
    `    <pubDate>${buildDate}</pubDate>`,
    '    <generator>Akasha Portal RSS Generator</generator>',
    '    <managingEditor>noreply@cabaladoscaminhos.com (Akasha Portal)</managingEditor>',
    '    <webMaster>noreply@cabaladoscaminhos.com (Akasha Portal)</webMaster>',
    `    <atom:link href="${escapeXml(`${BASE_URL}/feed.xml`)}" rel="self" type="application/rss+xml" />`,
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
