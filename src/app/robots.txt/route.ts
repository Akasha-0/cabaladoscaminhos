// ============================================================================
// robots.txt — Next.js 16 App Router (file-based route)
// ============================================================================
// Public crawl policy for Akasha Portal. Keep this file lean: rules are
// matched top-to-bottom, and the most-specific `Disallow` wins per bot.
//
// Strategy:
//   - Allow everything by default (community-first, queremos ser descobertos)
//   - Block API routes (admin tooling, internal endpoints)
//   - Block private areas: /admin, /onboarding, /me, /u/[handle], /community
//   - Point bots to /sitemap.xml so they discover the canonical URL set
//   - Block well-known scrapers that ignore crawl-delay (AhrefsBot, Semrush,
//     MJ12, DotBot) — they're a tax on infra and not relevant to PT-BR SERP
//
// SEO rationale:
//   - /community é protegido por auth (community-feed gated). Sem canonical
//     URLs públicos, qualquer hit seria 404/redirect → bad SERP hygiene.
//   - /me e /u/[handle] são perfis privados (visibilidade COMMUNITY+).
//   - /onboarding é fluxo de 1ª vez (não indexável).
//   - /api/* tem centenas de endpoints internos; deixar bots descobri-los
//     causa ruído no GSC + footprint de superfície.
// ============================================================================

import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/seo/og";

export const dynamic = "force-static"; // robots.txt rarely changes
export const revalidate = 86400; // 24h

const SITEMAP_URL = `${BASE_URL}/sitemap.xml`;

const body = `# Akasha Portal — robots.txt
# Generated ${new Date().toISOString().slice(0, 10)}.
# Sitemap: ${SITEMAP_URL}

# ─── Default policy: allow everything ───────────────────────────────────
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /onboarding
Disallow: /me
Disallow: /me/*
Disallow: /u/
Disallow: /u/*/        # perfis privados por handle
Disallow: /community/
Disallow: /community/*
Disallow: /settings
Disallow: /settings/*
Disallow: /notifications
Disallow: /search      # resultados de busca não canônicos
Disallow: /drafts      # auto-save workspace
Disallow: /checkout
Disallow: /billing

# Permite explicitamente assets públicos importantes
Allow: /og/
Allow: /icons/
Allow: /manifest.json
Allow: /feed.xml
Allow: /feed.atom
Allow: /feed.json

# ─── Specific bots ───────────────────────────────────────────────────────
# GPTBot — OpenAI crawler (não treinamos LLMs externos com nosso conteúdo)
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Claude-Web
Disallow: /

User-agent: PerplexityBot
Disallow: /

# SEO link explorers (Ahrefs, Semrush, Majestic, Moz) — tax-on-infra,
# não contribuem para SERP PT-BR.
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: SemrushBot-SA
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /

User-agent: BLEXBot
Disallow: /

# ─── Sitemap ────────────────────────────────────────────────────────────
Sitemap: ${SITEMAP_URL}
`;

export function GET() {
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control":
        "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}