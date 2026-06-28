// ============================================================================
// SEO / Open Graph / Twitter Cards helper
// ============================================================================
// Centraliza geração de `Metadata` + `generateMetadata` para todas as páginas
// públicas do Akasha Portal. Garante que:
//
//   - og:title / og:description / og:image / og:type preenchidos
//   - twitter:card = summary_large_image com mesmo título e descrição
//   - canonical absoluto (via metadataBase do root layout)
//   - robots index, follow (páginas públicas)
//   - locale pt_BR consistente
//   - JSON-LD (Schema.org) injetável via `<SeoJsonLd />`
//
// Os 5 OG images por categoria ficam em /public/og/ (1200x630 SVG/PNG):
//
//   cover-home      → home /
//   cover-library   → /library (artigos)
//   cover-akashic   → /akashic (jogo oracular)
//   cover-events    → /events (círculos)
//   cover-community → /community (feed)
//
// Por que helper central? Evita drift entre páginas (cada dev criando
// metadata diferente) e mantém uma única fonte da verdade para:
//
//   - título padrão + template "%s | Akasha Portal"
//   - descrição curta (≤160 chars) por categoria
//   - twitter:handle canônico
//   - imagem OG com width/height/alt corretos
//
// Não-instalação de libs: usa apenas APIs nativas do Next.js 16 (Metadata,
// ResolvedMetadata, generateMetadata) — nada de next-seo, next-og, etc.
// ============================================================================

import type { Metadata } from "next";

// ============================================================================
// Constants
// ============================================================================

export const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://cabaladoscaminhos.com";

export const SITE_NAME = "Akasha Portal";
export const SITE_TWITTER = "@akashaportal";
export const SITE_LOCALE = "pt_BR";

// 1200x630 é o tamanho canônico do OG (validado por validator.schema.org e
// Facebook Sharing Debugger). Alt textual sempre presente para a11y e SEO.
const OG_DIMENSIONS = { width: 1200, height: 630 } as const;

// ============================================================================
// OG image catalog (5 categorias)
// ============================================================================

export type OgCategory =
  | "home"
  | "library"
  | "akashic"
  | "events"
  | "community";

const OG_CATALOG: Record<
  OgCategory,
  { url: string; alt: string }
> = {
  home: {
    url: "/og/cover-home.svg",
    alt: "Akasha Portal — Comunidade Viva de Espiritualidade",
  },
  library: {
    url: "/og/cover-library.svg",
    alt: "Biblioteca Akasha — Artigos, papers e práticas curadas",
  },
  akashic: {
    url: "/og/cover-akashic.svg",
    alt: "Mesa Akáshica — Jogo oracular de 36 casas",
  },
  events: {
    url: "/og/cover-events.svg",
    alt: "Círculos Akasha — Workshops, meditações e rodas de conversa",
  },
  community: {
    url: "/og/cover-community.svg",
    alt: "Comunidade Akasha — Feed, grupos e conexões por tradição",
  },
};

/**
 * Resolve the absolute OG image URL for a category.
 * Always returns the canonical BASE_URL + relative path so that
 * crawlers (Facebook, Twitter, LinkedIn) can fetch it directly.
 */
export function getOgImage(category: OgCategory): string {
  return `${BASE_URL}${OG_CATALOG[category].url}`;
}

// ============================================================================
// Build helpers
// ============================================================================

export interface PageSeoInput {
  /** Title shown in browser tab + OG title. Should be ≤60 chars. */
  title: string;
  /** Meta description. Should be ≤160 chars for full SERP snippet. */
  description: string;
  /**
   * Path-only URL (e.g. "/validacao"). Will be joined with BASE_URL.
   * Used for og:url + canonical link.
   */
  path: string;
  /** OG category — picks the right image from OG_CATALOG. */
  category?: OgCategory;
  /** Override OG image URL (absolute or relative). Wins over category. */
  ogImageOverride?: string;
  /** "website" for hub pages, "article" for posts/artigos. */
  type?: "website" | "article" | "profile";
  /** Allow indexing by default. Flip to false for noindex pages. */
  indexable?: boolean;
  /** Article publish time (ISO string). Used when type="article". */
  publishedTime?: string;
  /** Article modified time (ISO string). Used when type="article". */
  modifiedTime?: string;
  /** Article authors (free-form strings). Used when type="article". */
  authors?: string[];
  /** Article tags. Used when type="article". */
  tags?: string[];
  /** Override OG image alt (defaults to category alt). */
  imageAlt?: string;
}

/**
 * Build a Next.js `Metadata` object for a public page.
 * Use from any server component via:
 *
 *   export const metadata = buildPageMetadata({...});
 *
 * or via a dynamic `generateMetadata` function.
 */
export function buildPageMetadata(input: PageSeoInput): Metadata {
  const {
    title,
    description,
    path,
    category = "home",
    ogImageOverride,
    type = "website",
    indexable = true,
    publishedTime,
    modifiedTime,
    authors,
    tags,
    imageAlt,
  } = input;

  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const ogImage = ogImageOverride || getOgImage(category);
  const ogAlt = imageAlt || OG_CATALOG[category].alt;

  const ogImages: NonNullable<Metadata["openGraph"]>["images"] = ogImageOverride
    ? [{ url: ogImageOverride, ...OG_DIMENSIONS, alt: ogAlt }]
    : [
        // Absolute URL is the canonical form; relative works as fallback.
        { url: ogImage, ...OG_DIMENSIONS, alt: ogAlt },
      ];

  const openGraph: NonNullable<Metadata["openGraph"]> = {
    type,
    locale: SITE_LOCALE,
    url,
    siteName: SITE_NAME,
    title,
    description,
    images: ogImages,
  };

  if (type === "article") {
    // openGraph.type already set to "article" via `type` param above (line 167).
    // Next.js Metadata typing for article-specific fields. Cast to allow
    // optional fields without type narrowing fights.
    const articleOg = openGraph as unknown as {
      publishedTime?: string;
      modifiedTime?: string;
      authors?: string[];
      tags?: string[];
    };
    if (publishedTime) articleOg.publishedTime = publishedTime;
    if (modifiedTime) articleOg.modifiedTime = modifiedTime;
    if (authors?.length) articleOg.authors = authors;
    if (tags?.length) articleOg.tags = tags;
  }

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph,
    twitter: {
      card: "summary_large_image",
      site: SITE_TWITTER,
      creator: SITE_TWITTER,
      title,
      description,
      images: [ogImage],
    },
    robots: indexable
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        }
      : {
          index: false,
          follow: false,
        },
  };
}

// ============================================================================
// JSON-LD helpers (Schema.org)
// ============================================================================

/**
 * Wrap any JSON-LD object for safe injection via `dangerouslySetInnerHTML`.
 * The runtime string is escaped to prevent injection of `</script>` from
 * user-supplied fields.
 */
export function jsonLdScript(jsonLd: unknown): string {
  return JSON.stringify(jsonLd).replace(/</g, "\\u003c");
}

/** Build an Organization JSON-LD payload. */
export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}#organization`,
    name: SITE_NAME,
    alternateName: "Akasha — Comunidade de Espiritualidade",
    url: BASE_URL,
    logo: `${BASE_URL}/og/cover-home.svg`,
    description:
      "Comunidade online de espiritualidade universalista. Cabala, Ifá, Astrologia, Tantra, Xamanismo, Reiki e mais.",
    sameAs: [
      "https://twitter.com/akashaportal",
      "https://instagram.com/akashaportal",
    ],
  } as const;
}

/** Build a WebSite JSON-LD payload (used on home for SiteLinks search box). */
export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}#website`,
    url: BASE_URL,
    name: SITE_NAME,
    inLanguage: "pt-BR",
    publisher: { "@id": `${BASE_URL}#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/explore?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  } as const;
}

/** Build an Article JSON-LD payload for a library article page. */
export function articleLd(input: {
  title: string;
  description: string;
  path: string;
  authors: string[];
  publishedTime?: string;
  modifiedTime?: string;
  image?: string;
  /** DOI canonical (e.g. "10.1000/xyz123"). */
  doi?: string;
}) {
  const url = `${BASE_URL}${input.path.startsWith("/") ? input.path : `/${input.path}`}`;
  return {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    "@id": `${url}#article`,
    headline: input.title,
    description: input.description,
    url,
    inLanguage: "pt-BR",
    image: input.image || getOgImage("library"),
    datePublished: input.publishedTime,
    dateModified: input.modifiedTime || input.publishedTime,
    author: input.authors.map((name) => ({ "@type": "Person", name })),
    publisher: { "@id": `${BASE_URL}#organization` },
    isPartOf: { "@id": `${BASE_URL}#website` },
    ...(input.doi ? { sameAs: `https://doi.org/${input.doi}` } : {}),
  } as const;
}

/** Build an Event JSON-LD payload for a community event page. */
export function eventLd(input: {
  title: string;
  description: string;
  path: string;
  startsAt: string; // ISO datetime
  durationMin?: number;
  hostName: string;
  isOnline?: boolean;
  meetingUrl?: string;
  image?: string;
}) {
  const url = `${BASE_URL}${input.path.startsWith("/") ? input.path : `/${input.path}`}`;
  const startsAt = input.startsAt;
  const durationISO = input.durationMin
    ? `PT${input.durationMin}M`
    : "PT60M";
  const endDate = new Date(
    new Date(startsAt).getTime() + (input.durationMin ?? 60) * 60_000,
  ).toISOString();

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": `${url}#event`,
    name: input.title,
    description: input.description,
    url,
    inLanguage: "pt-BR",
    image: input.image || getOgImage("events"),
    startDate: startsAt,
    endDate,
    duration: durationISO,
    eventAttendanceMode: input.isOnline
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    organizer: {
      "@type": "Person",
      name: input.hostName,
    },
    ...(input.meetingUrl
      ? { location: { "@type": "VirtualLocation", url: input.meetingUrl } }
      : {}),
  } as const;
}

/** Build a BreadcrumbList JSON-LD payload. */
export function breadcrumbLd(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${BASE_URL}${item.path.startsWith("/") ? item.path : `/${item.path}`}`,
    })),
  } as const;
}

// ============================================================================
// SeoJsonLd — Server component for safe JSON-LD injection
// ============================================================================

import { Fragment } from "react";

/**
 * Inject one or many JSON-LD `<script>` blocks.
 * Use from a server component's JSX:
 *
 *   <SeoJsonLd data={[websiteLd(), breadcrumbLd([...])]} />
 */
export function SeoJsonLd({
  data,
}: {
  data: unknown | unknown[];
}) {
  const list = Array.isArray(data) ? data : [data];
  return (
    <Fragment>
      {list.map((payload, i) => (
        <script
          key={i}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: jsonLdScript(payload) }}
        />
      ))}
    </Fragment>
  );
}

// ============================================================================
// Re-exports for backwards compat with root layout
// ============================================================================

export const seoConstants = {
  BASE_URL,
  SITE_NAME,
  SITE_TWITTER,
  SITE_LOCALE,
  OG_DIMENSIONS,
} as const;