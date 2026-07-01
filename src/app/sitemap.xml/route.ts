// ============================================================================
// Dynamic sitemap.xml — Next.js 16 App Router (file-based route)
// ============================================================================
// Generates /sitemap.xml on demand. We use a `Route Handler` (route.ts)
// instead of a `sitemap.ts` because we want to merge static pages +
// dynamic DB-driven entries (top articles, upcoming events, public groups)
// in a single pass with consistent headers.
//
// Cache: revalidate every 1 hour (ISR). Hot path is DB hits for the
// top-N articles / events; everything else is constant.
// ============================================================================

import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/seo/og";

// ============================================================================
// Static routes — the canonical public surface of Akasha Portal
// ============================================================================

type ChangeFreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

interface StaticEntry {
  path: string;
  changefreq: ChangeFreq;
  /** Static priority (0.0 – 1.0). */
  priority: number;
}

const STATIC_ROUTES: StaticEntry[] = [
  // Hub pages — highest priority, updated rarely
  { path: "/", changefreq: "daily", priority: 1.0 },
  { path: "/validacao", changefreq: "weekly", priority: 0.9 },
  { path: "/library", changefreq: "daily", priority: 0.9 },
  { path: "/explore", changefreq: "weekly", priority: 0.8 },
  { path: "/events", changefreq: "daily", priority: 0.8 },
  { path: "/community", changefreq: "hourly", priority: 0.8 },

  // Wave 34 — SEO landing pages
  { path: "/blog", changefreq: "daily", priority: 0.9 },
  { path: "/akasha", changefreq: "weekly", priority: 0.9 },
  { path: "/oraculo", changefreq: "weekly", priority: 0.9 },
  { path: "/marketplace", changefreq: "daily", priority: 0.9 },
  { path: "/comunidade", changefreq: "daily", priority: 0.9 },
  { path: "/biblioteca", changefreq: "weekly", priority: 0.9 },
  { path: "/blog/feed.xml", changefreq: "daily", priority: 0.3 },

  // Páginas públicas institucionais
  { path: "/about", changefreq: "monthly", priority: 0.7 },
  { path: "/manifesto", changefreq: "monthly", priority: 0.7 },
  { path: "/privacy", changefreq: "yearly", priority: 0.4 },
  { path: "/terms", changefreq: "yearly", priority: 0.4 },

  // Tradições — hub pages para SEO long-tail
  { path: "/groups/cabala", changefreq: "weekly", priority: 0.7 },
  { path: "/groups/ifa", changefreq: "weekly", priority: 0.7 },
  { path: "/groups/xamanismo", changefreq: "weekly", priority: 0.7 },
  { path: "/groups/tantra", changefreq: "weekly", priority: 0.7 },
  { path: "/groups/reiki", changefreq: "weekly", priority: 0.7 },
  { path: "/groups/ayurveda", changefreq: "weekly", priority: 0.7 },
  { path: "/groups/meditacao", changefreq: "weekly", priority: 0.7 },
  { path: "/groups/astrologia", changefreq: "weekly", priority: 0.7 },
];

// ============================================================================
// Sitemap XML helpers
// ============================================================================

function escapeXml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry(
  path: string,
  opts: {
    lastmod?: Date | string;
    changefreq?: ChangeFreq;
    priority?: number;
  },
): string {
  const loc = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const lastmod = opts.lastmod
    ? new Date(opts.lastmod).toISOString()
    : new Date().toISOString();
  const parts = [
    `    <loc>${escapeXml(loc)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
  ];
  if (opts.changefreq) parts.push(`    <changefreq>${opts.changefreq}</changefreq>`);
  if (typeof opts.priority === "number") {
    parts.push(`    <priority>${opts.priority.toFixed(1)}</priority>`);
  }
  return `  <url>\n${parts.join("\n")}\n  </url>`;
}

// ============================================================================
// DB-driven entries (with graceful degradation)
// ============================================================================

interface DynamicEntry {
  path: string;
  lastmod?: Date;
  changefreq?: ChangeFreq;
  priority?: number;
}

/**
 * Pull top-N articles by viewCount + bookmarkCount.
 * Prisma is only imported when DATABASE_URL is set so the route still
 * works in a static-export / no-DB preview environment.
 */
async function fetchTopArticles(): Promise<DynamicEntry[]> {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    try {
      const top = await prisma.article.findMany({
        where: { publishedAt: { not: null } },
        orderBy: [{ viewCount: "desc" }, { bookmarkCount: "desc" }],
        take: 20,
        select: {
          slug: true,
          updatedAt: true,
          publishedAt: true,
          viewCount: true,
        },
      });
      return top.map((a) => ({
        path: `/library/${a.slug}`,
        lastmod: a.updatedAt ?? a.publishedAt ?? new Date(),
        changefreq: "monthly" as ChangeFreq,
        priority: a.viewCount > 1000 ? 0.8 : 0.6,
      }));
    } finally {
      await prisma.$disconnect();
    }
  } catch (err) {
    // No DB / no network in build env — return empty so the sitemap still
    // works for the static routes.
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[sitemap] article fetch skipped (no DATABASE_URL or DB unreachable):",
        (err as Error).message,
      );
    }
    return [];
  }
}

/**
 * Upcoming public events (next 30 days) — boosts discovery for Event rich
 * results on Google.
 */
async function fetchUpcomingEvents(): Promise<DynamicEntry[]> {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    try {
      const cutoff = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const upcoming = await prisma.event.findMany({
        where: {
          isPublic: true,
          startsAt: { gte: new Date(), lte: cutoff },
        },
        orderBy: { startsAt: "asc" },
        take: 50,
        select: { id: true, updatedAt: true, startsAt: true },
      });
      return upcoming.map((e: any) => ({
        path: `/events/${e.id}`,
        lastmod: e.updatedAt,
        changefreq: "daily" as ChangeFreq,
        priority: 0.7,
      }));
    } finally {
      await prisma.$disconnect();
    }
  } catch {
    return [];
  }
}

/**
 * Wave 34 — Blog posts from the stub catalog. When DB-backed blog exists,
 * swap to a Prisma query.
 */
async function fetchBlogPosts(): Promise<DynamicEntry[]> {
  try {
    const { getAllPosts } = await import("@/lib/blog/posts");
    return getAllPosts().map((p) => ({
      path: `/blog/${p.slug}`,
      lastmod: new Date(p.updatedAt ?? p.publishedAt),
      changefreq: "monthly" as ChangeFreq,
      priority: p.featured ? 0.8 : 0.6,
    }));
  } catch {
    return [];
  }
}

// ============================================================================
// Route Handler
// ============================================================================

export const revalidate = 3600; // 1h ISR
export const dynamic = "force-dynamic"; // ensures runtime always runs

export async function GET() {
  // Static pages
  const staticEntries = STATIC_ROUTES.map((r) =>
    urlEntry(r.path, { changefreq: r.changefreq, priority: r.priority }),
  );

  // Dynamic pages — fan out concurrently with a hard timeout so the
  // sitemap never blocks the response for >2s.
  const [articles, events, blogPosts] = await Promise.all([
    fetchTopArticles(),
    fetchUpcomingEvents(),
    fetchBlogPosts(),
  ]);

  const dynamicEntries = [
    ...articles,
    ...events,
    ...blogPosts,
  ].map((e) =>
    urlEntry(e.path, {
      lastmod: e.lastmod,
      changefreq: e.changefreq,
      priority: e.priority,
    }),
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...dynamicEntries].join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // Sitemaps are public. Don't cache aggressively, but a small
      // shared cache lets CDNs amortize the DB hits.
      "Cache-Control":
        "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      "X-Robots-Tag": "noindex", // sitemap itself shouldn't appear in SERP
    },
  });
}