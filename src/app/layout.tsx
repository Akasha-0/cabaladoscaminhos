import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Cinzel, Cormorant_Garamond, Raleway, IM_Fell_English } from "next/font/google";
import { InstallPrompt } from "@/components/dashboard/InstallPrompt";
import { OfflineIndicator } from "@/components/dashboard/OfflineIndicator";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const imFell = IM_Fell_English({
  variable: "--font-imfell",
  subsets: ["latin"],
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
  },
  applicationName: "Akasha Portal",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbbf24",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
      </head>
      <body
        className={`${cinzel.variable} ${cormorant.variable} ${raleway.variable} ${imFell.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <SupabaseProvider>
          {children}
        </SupabaseProvider>
        <InstallPrompt />
      </body>
    </html>
  );
}