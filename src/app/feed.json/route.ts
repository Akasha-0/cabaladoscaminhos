// ============================================================================
// JSON FEED v1 — /feed.json
// ============================================================================
// Formato moderno baseado em JSON para feeds. Especificação:
// https://www.jsonfeed.org/version/1.1/
//
// Vantagens sobre RSS/Atom para consumidores programáticos:
//   - Sem necessidade de parser XML
//   - Conteúdo em texto plano (mais previsível)
//   - Suporte nativo a attachments e extensions
//
// Cada item carrega:
//   - id, url, title (truncado), content_text, content_html
//   - date_published (ISO 8601), date_modified
//   - author { name, url }
//   - tags[] (tradição + topic)
//   - _akasha: { tradition, type } extension (namespace _akasha)
// ============================================================================

import { NextResponse } from 'next/server';
import {
  BASE_URL,
  FEED_LIMIT,
  getRecentPosts,
  htmlBody,
  plainText,
  toIso8601,
  postUrl,
  authorUrl,
} from '@/lib/community/feed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const FEED_TITLE = 'Akasha Portal — Comunidade Viva';
const FEED_DESCRIPTION =
  'Feed público dos posts mais recentes da comunidade de espiritualidade universalista.';

export async function GET() {
  const posts = await getRecentPosts({ limit: FEED_LIMIT });

  const items = posts.map((post) => {
    const tags: string[] = [];
    if (post.tradition) tags.push(post.tradition);
    if (post.topic) tags.push(post.topic);

    return {
      id: postUrl(post.id),
      url: postUrl(post.id),
      title: truncate(post.content, 100),
      content_text: plainText(post.content, 600),
      content_html: htmlBody(post.content, 2000),
      summary: htmlBody(post.content, 300),
      date_published: toIso8601(post.createdAt),
      date_modified: toIso8601(post.updatedAt),
      author: {
        name: post.authorName,
        url: authorUrl(post.authorId),
      },
      tags,
      _akasha: {
        tradition: post.tradition,
        topic: post.topic,
        type: post.type,
        group: post.groupSlug,
      },
    };
  });

  const body = {
    version: 'https://jsonfeed.org/version/1.1',
    title: FEED_TITLE,
    home_page_url: BASE_URL,
    feed_url: `${BASE_URL}/feed.json`,
    description: FEED_DESCRIPTION,
    language: 'pt-BR',
    authors: [
      {
        name: 'Akasha Portal',
        url: BASE_URL,
      },
    ],
    generator: 'Akasha Portal JSON Feed Generator',
    _akasha_alternates: {
      rss: `${BASE_URL}/feed.xml`,
      atom: `${BASE_URL}/feed.atom`,
    },
    items,
  };

  return NextResponse.json(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/feed+json; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}
