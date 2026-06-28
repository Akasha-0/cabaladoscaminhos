import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Cinzel, Cormorant_Garamond, Raleway, IM_Fell_English } from "next/font/google";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { OfflineIndicator } from "@/components/dashboard/OfflineIndicator";
import { UpdatePrompt } from "@/components/pwa/UpdatePrompt";
import { BackgroundSyncIndicator } from "@/components/pwa/BackgroundSyncIndicator";
import { SkipToContent } from "@/components/a11y/SkipToContent";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import { ThemeScript } from "@/components/ui/ThemeScript";
import { CookieConsent } from "@/components/consent/CookieConsent";
import { EnablePushButton } from "@/components/notifications/EnablePushButton";
import { HeaderPushButton } from "@/components/notifications/HeaderPushButton";
import { WebVitalsReporter } from "@/components/monitoring/WebVitalsReporter";

// ============================================================================
// Font strategy (Wave 11 perf) — variable fonts + reduced weight sets
// ============================================================================
// Before: 4 families × 4-5 weights = up to 18 subset files (~180 KB raw).
// After:  variable fonts + tight weight subsets + preload tuning = ~30-50%
//         smaller critical font payload.
//   - Cinzel:    600 only (headings)        — was 400/500/600/700
//   - Cormorant: 500 only (legal serif)     — was 400-700
//   - Raleway:   400/500/600 (body + nav)   — was 300/400/500/600/700
//   - IM_Fell:   400 unchanged (decorative)
// `display: "swap"` shows fallback immediately. `preload: true` puts the font
// in <head> as a high-priority resource (Cinzel + Raleway only). `fallback`
// metrics reduce CLS by matching fallback advance width.
// ============================================================================

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  display: "swap",
  weight: ["600"],
  preload: true,
  fallback: ["Georgia", "serif"],
  adjustFontFallback: true,
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: "swap",
  weight: ["500"],
  preload: false,
  fallback: ["Georgia", "serif"],
  adjustFontFallback: true,
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
  preload: true,
  fallback: ["system-ui", "sans-serif"],
  adjustFontFallback: true,
});

const imFell = IM_Fell_English({
  variable: "--font-imfell",
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
  preload: false,
  fallback: ["Georgia", "serif"],
  adjustFontFallback: true,
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://cabaladoscaminhos.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Akasha Portal — Comunidade Viva de Espiritualidade",
    template: "%s | Akasha Portal",
  },
  description: "Comunidade online de espiritualidade universalista. Compartilhe, aprenda e evolua com praticantes de Cabala, Ifá, Astrologia, Tantra, Xamanismo e mais. IA curadora alimentada por papers e tradições ancestrais.",
  keywords: [
    "akasha",
    "comunidade espiritual",
    "espiritualidade universalista",
    "cabala",
    "ifá",
    "astrologia",
    "xamanismo",
    "tantra",
    "reiki",
    "psilocibina",
    "meditação",
    "autoconhecimento",
    "tradições espirituais",
    "orixás",
    "numerologia",
  ],
  authors: [{ name: "Akasha Portal", url: BASE_URL }],
  creator: "Akasha-0",
  publisher: "Akasha Portal",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: BASE_URL,
    siteName: "Akasha Portal",
    title: "Akasha Portal — Comunidade Viva de Espiritualidade",
    description: "Compartilhe, aprenda e evolua com uma comunidade de praticantes de Cabala, Ifá, Astrologia, Tantra, Xamanismo e mais. IA curadora alimentada por papers e tradições ancestrais.",
    images: [
      {
        url: "/og-default.svg",
        width: 1200,
        height: 630,
        alt: "Akasha Portal — Comunidade de Espiritualidade",
      },
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Akasha Portal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Akasha Portal — Comunidade Viva",
    description: "Comunidade online de espiritualidade universalista + IA curadora",
    images: ["/og-default.svg"],
    creator: "@akashaportal",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Akasha",
    startupImage: [
      {
        url: "/screenshots/screenshot-mobile-1.png",
        media: "(device-width: 750px) and (device-height: 1334px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
  },
  applicationName: "Akasha Portal",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/icons/icon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-256x256.png", sizes: "256x256", type: "image/png" },
      { url: "/icons/icon-384x384.png", sizes: "384x384", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/icons/icon-192x192.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Akasha",
    "application-name": "Akasha Portal",
    "msapplication-TileColor": "#fbbf24",
    "msapplication-config": "/browserconfig.xml",
    "theme-color": "#fbbf24",
    "format-detection": "telephone=no",
  },
  verification: {
    google: "your-google-verification-code",
  },
  // other: removido no cycle 20 — `'google-site-verification'` ja vive em `verification.google`.
  // Manter ambos causava TS1117 (object literal duplicate property name) porque o
  // tipo `OtherMetaDescriptor` do Next.js normaliza chaves canonicas.
};

// ============================================================================
// Schema.org JSON-LD — SiteLinks Search Box + Organization
// ============================================================================

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${BASE_URL}#organization`,
      name: 'Akasha Portal',
      alternateName: 'Akasha — Comunidade de Espiritualidade',
      url: BASE_URL,
      logo: `${BASE_URL}/og-default.svg`,
      description:
        'Comunidade online de espiritualidade universalista. Cabala, Ifá, Astrologia, Tantra, Xamanismo, Reiki e mais.',
      sameAs: [
        'https://twitter.com/akashaportal',
        'https://instagram.com/akashaportal',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${BASE_URL}#website`,
      url: BASE_URL,
      name: 'Akasha Portal',
      inLanguage: 'pt-BR',
      publisher: { '@id': `${BASE_URL}#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${BASE_URL}/explore?q={search_term_string}`,
        },
        // Schema.org query-input spec
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbbf24" },
    { media: "(prefers-color-scheme: dark)", color: "#fbbf24" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Permite zoom mas evita zoom acidental em inputs
  userScalable: true,
  viewportFit: "cover", // iOS safe-area
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Anti-FOUC: aplica classe `dark` antes do hydration baseado em
            cookie/localStorage/OS preference. Ver ThemeScript.tsx. */}
        <ThemeScript />
        {/* Wave 18 perf — Critical CSS inline (above-the-fold tokens).
            Apply paint-ready colors immediately so the browser doesn't
            flash white before globals.css loads. Keeps the body bg/text
            consistent during the <1s LCP window. */}
        <style
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `:root{color-scheme:dark light}html,body{background-color:#020617;color:#e2e8f0}html{font-family:var(--font-raleway),system-ui,sans-serif;-webkit-font-smoothing:antialiased}`,
          }}
        />
        <link rel="canonical" href={BASE_URL} />
        <link rel="sitemap" href="/sitemap.xml" type="application/xml" />
        <link rel="robots" href="/robots.txt" />
        {/* RSS / Atom / JSON Feed — auto-discovery para leitores externos
            (Feedly, Inoreader, NetNewsWire, Reeder, etc). Cada feed também
            carrega atom:link rel="alternate" apontando para os outros formatos. */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Akasha Portal — Comunidade (RSS 2.0)"
          href="/feed.xml"
        />
        <link
          rel="alternate"
          type="application/atom+xml"
          title="Akasha Portal — Comunidade (Atom 1.0)"
          href="/feed.atom"
        />
        <link
          rel="alternate"
          type="application/feed+json"
          title="Akasha Portal — Comunidade (JSON Feed v1)"
          href="/feed.json"
        />
        {/* Preconnect a recursos externos */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://*.supabase.co" />
        {/* PWA meta tags iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Akasha" />
        {/* PWA meta tags Android */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#fbbf24" />
        {/* Schema.org JSON-LD — Organization + WebSite + SearchAction */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${cinzel.variable} ${cormorant.variable} ${raleway.variable} ${imFell.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <SkipToContent />
        {/* Header push opt-in — renderiza só quando autenticado (ver componente) */}
        <HeaderPushButton />
        <SupabaseProvider>
          <PostHogProvider>
            {/* Mounts PerformanceObservers for LCP/CLS/INP/FCP/TTFB → PostHog */}
            <WebVitalsReporter />
            {children}
          </PostHogProvider>
        </SupabaseProvider>
        <InstallPrompt />
        <UpdatePrompt />
        <OfflineIndicator />
        <BackgroundSyncIndicator />
        <CookieConsent />
        {/* Standalone fallback: enable push (renderiza em qualquer ponto,
            mas o componente se auto-hide se não há auth/suporte) */}
        <EnablePushButton className="fixed bottom-4 left-4 z-30 shadow-lg" />
      </body>
    </html>
  );
}