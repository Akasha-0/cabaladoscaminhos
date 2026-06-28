// ============================================================================
// FEED HELPERS — RSS / Atom / JSON Feed (Onda 14)
// ============================================================================
// Helpers compartilhados pelos route handlers de /feed.xml, /feed.atom,
// /feed.json e /feed/[tradition]. XML é gerado manualmente (sem libs)
// porque a superfície é pequena e o controle de escape é crítico.
//
// Convention de tradição:
//   - slug canônico: cabala, ifa, astrologia, tantra, reiki, meditacao,
//     xamanismo, cristianismo-mistico, sufismo, taoismo, umbanda, candomble
//   - quando inválido, retornamos 404 (não 200 com lista vazia)
// ============================================================================

import { prisma } from '@/lib/prisma';

export const FEED_LIMIT = 20;

export const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? 'https://cabaladoscaminhos.com';

/**
 * Conjunto canônico de tradições expostas em /feed/[tradition].
 * Mantido curto e validado contra os slugs do seed `groups.ts`.
 * Sincronizar com `prisma/seed/groups.ts` quando uma nova tradição entra.
 */
export const KNOWN_TRADITIONS = new Set([
  'cabala',
  'ifa',
  'astrologia',
  'tantra',
  'reiki',
  'meditacao',
  'xamanismo',
  'cristianismo-mistico',
  'sufismo',
  'taoismo',
  'umbanda',
  'candomble',
]);

export function isKnownTradition(value: string): boolean {
  return KNOWN_TRADITIONS.has(value.toLowerCase());
}

// ============================================================================
// Query — posts publicados (não soft-deleted) com nome do autor
// ============================================================================

export interface FeedPost {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  type: string;
  tradition: string | null;
  topic: string | null;
  groupSlug: string | null;
  groupName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function getRecentPosts(input: {
  tradition?: string | null;
  limit?: number;
}): Promise<FeedPost[]> {
  const limit = Math.min(Math.max(input.limit ?? FEED_LIMIT, 1), 50);

  const rows = await prisma.post.findMany({
    where: {
      deletedAt: null,
      ...(input.tradition ? { tradition: input.tradition.toLowerCase() } : {}),
    },
    include: {
      group: { select: { slug: true, name: true } },
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit,
  });

  // Carrega nomes de autores em batch (User não tem relação Post.author no
  // schema atual; Post.authorId é string livre). Best-effort: se não achar
  // no banco, gera handle estável.
  const authorIds = Array.from(new Set(rows.map((p) => p.authorId)));
  const users =
    authorIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: authorIds } },
          select: { id: true, nomeCompleto: true },
        })
      : [];
  const userMap = new Map(users.map((u) => [u.id, u.nomeCompleto]));

  return rows.map((p) => ({
    id: p.id,
    authorId: p.authorId,
    authorName: userMap.get(p.authorId) ?? `Membro ${p.authorId.slice(-4)}`,
    content: p.content,
    type: p.type,
    tradition: p.tradition,
    topic: p.topic,
    groupSlug: p.group?.slug ?? null,
    groupName: p.group?.name ?? null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));
}

// ============================================================================
// XML escape — seguro para RSS/Atom (RFC 1738 + XML 1.0 §2.4)
// ============================================================================

const XML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

export function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => XML_ENTITIES[ch] ?? ch);
}

/**
 * HTML body para <description> / <summary> / <content:encoded>:
 *   - escapa entidades XML
 *   - preserva quebras de linha (\\n → <br>)
 *   - limita tamanho para evitar feeds inflados
 */
export function htmlBody(value: string, maxLen = 600): string {
  const trimmed = value.length > maxLen ? `${value.slice(0, maxLen - 1)}…` : value;
  return escapeXml(trimmed).replace(/\r?\n/g, '<br/>');
}

/**
 * Strip HTML/markdown cru para JSON Feed (que prefere texto plano).
 * Mantém quebras de linha como \n.
 */
export function plainText(value: string, maxLen = 600): string {
  const stripped = value
    .replace(/<[^>]+>/g, '') // remove tags HTML
    .replace(/[*_`~#>]+/g, '') // remove markdown básico
    .replace(/\r?\n+/g, '\n')
    .trim();
  return stripped.length > maxLen ? `${stripped.slice(0, maxLen - 1)}…` : stripped;
}

// ============================================================================
// Date formats
// ============================================================================

/** RFC 822 (RSS 2.0): "Tue, 27 Jun 2026 19:32:27 GMT" */
export function toRfc822(date: Date): string {
  return date.toUTCString();
}

/** ISO 8601 UTC (Atom 1.0 / JSON Feed). */
export function toIso8601(date: Date): string {
  return date.toISOString();
}

// ============================================================================
// URL helpers
// ============================================================================

export function postUrl(id: string): string {
  return `${BASE_URL}/post/${id}`;
}

export function authorUrl(authorId: string): string {
  return `${BASE_URL}/u/${authorId}`;
}

export function traditionLabel(tradition: string | null): string {
  if (!tradition) return 'Comunidade';
  return tradition.charAt(0).toUpperCase() + tradition.slice(1);
}
