// ============================================================================
// ATOM 1.0 — /feed.atom
// ============================================================================
// Alternativa moderna ao RSS 2.0. RFC 4287. Suporta rel="self", rel="alternate"
// e metadados mais ricos por entrada.
//
// Diferenças em relação ao RSS:
//   - <id> é um IRI único por entry (usamos permalink do post)
//   - <updated> obrigatório (usamos updatedAt do post)
//   - <published> separado de <updated>
//   - <author><name>...</name></author> em vez de <author>texto</author>
//   - <content type="html"> com escape XML inline
//
// Mesmas regras de cache do RSS: s-maxage=300, SWR=600.
// ============================================================================

import { NextResponse } from 'next/server';
import {
  BASE_URL,
  FEED_LIMIT,
  getRecentPosts,
  escapeXml,
  htmlBody,
  toIso8601,
  postUrl,
  authorUrl,
} from '@/lib/community/feed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const FEED_TITLE = 'Akasha Portal — Comunidade Viva';
const FEED_SUBTITLE =
  'Feed público dos posts mais recentes da comunidade de espiritualidade universalista.';

export async function GET() {
  const posts = await getRecentPosts({ limit: FEED_LIMIT });
  const now = new Date();
  const updated = posts[0]?.updatedAt ?? now;

  const entries = posts
    .map((post) => {
      const url = postUrl(post.id);
      const author = post.authorName;
      const categoryXml = [post.tradition, post.topic]
        .filter(Boolean)
        .map(
          (term) =>
            `    <category term="${escapeXml(String(term))}" label="${escapeXml(String(term))}" />`
        )
        .join('\n');

      return [
        '  <entry>',
        `    <title>${escapeXml(truncate(post.content, 100))}</title>`,
        `    <id>${escapeXml(url)}</id>`,
        `    <link href="${escapeXml(url)}" rel="alternate" type="text/html" />`,
        `    <updated>${toIso8601(post.updatedAt)}</updated>`,
        `    <published>${toIso8601(post.createdAt)}</published>`,
        '    <author>',
        `      <name>${escapeXml(author)}</name>`,
        `      <uri>${escapeXml(authorUrl(post.authorId))}</uri>`,
        '    </author>',
        categoryXml,
        `    <summary type="html">${htmlBody(post.content, 300)}</summary>`,
        `    <content type="html">${htmlBody(post.content, 2000)}</content>`,
        '  </entry>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    `  <title>${escapeXml(FEED_TITLE)}</title>`,
    `  <subtitle>${escapeXml(FEED_SUBTITLE)}</subtitle>`,
    `  <id>${escapeXml(`${BASE_URL}/feed.atom`)}</id>`,
    `  <link href="${escapeXml(BASE_URL)}" rel="alternate" type="text/html" />`,
    `  <link href="${escapeXml(`${BASE_URL}/feed.atom`)}" rel="self" type="application/atom+xml" />`,
    `  <link href="${escapeXml(`${BASE_URL}/feed.xml`)}" rel="alternate" type="application/rss+xml" />`,
    `  <link href="${escapeXml(`${BASE_URL}/feed.json`)}" rel="alternate" type="application/feed+json" />`,
    `  <updated>${toIso8601(updated)}</updated>`,
    '  <generator uri="https://cabaladoscaminhos.com" version="1.0">Akasha Portal Atom Generator</generator>',
    '  <rights>© Akasha Portal</rights>',
    entries,
    '</feed>',
  ].join('\n');

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}
