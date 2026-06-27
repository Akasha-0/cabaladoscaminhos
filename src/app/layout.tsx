import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Cinzel, Cormorant_Garamond, Raleway, IM_Fell_English } from "next/font/google";
import { InstallPrompt } from "@/components/dashboard/InstallPrompt";
import { OfflineIndicator } from "@/components/dashboard/OfflineIndicator";
import { UpdatePrompt } from "@/components/pwa/UpdatePrompt";
import { SkipToContent } from "@/components/a11y/SkipToContent";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const imFell = IM_Fell_English({
  variable: "--font-imfell",
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
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
  other: {
    // Schema.org SearchAction — SiteLinks Search Box (Google)
    'google-site-verification': 'your-google-verification-code',
  },
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
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="canonical" href={BASE_URL} />
        <link rel="sitemap" href="/sitemap.xml" type="application/xml" />
        <link rel="robots" href="/robots.txt" />
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
        <SupabaseProvider>
          {children}
        </SupabaseProvider>
        <InstallPrompt />
        <UpdatePrompt />
        <OfflineIndicator />
      </body>
    </html>
  );
}