import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Cinzel, Cormorant_Garamond, Raleway, IM_Fell_English } from "next/font/google";
import { InstallPrompt } from "@/components/dashboard/InstallPrompt";
import { OfflineIndicator } from "@/components/dashboard/OfflineIndicator";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";
import { ThemeProvider } from "@/components/design-system/ThemeProvider";

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
    default: "Cabala dos Caminhos",
    template: "%s | Cabala dos Caminhos",
  },
  description: "Plataforma de autoconhecimento espiritual unificado. Correlacionando Cabala, Ifá, Astrologia, Numerologia, Tarot e Chakras para seu despertar.",
  keywords: [
    "cabala",
    "espiritualidade",
    "mapa da alma",
    "astrologia",
    "numerologia",
    "ifá",
    "odús",
    "tarot",
    "chakras",
    " autoconhecimento",
    "desenvolvimento pessoal",
    "tradição espiritual",
    "orixás",
  ],
  authors: [{ name: "Cabala dos Caminhos", url: BASE_URL }],
  creator: "Akasha-0",
  publisher: "Cabala dos Caminhos",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: BASE_URL,
    siteName: "Cabala dos Caminhos",
    title: "Cabala dos Caminhos - Tecnologia Sagrada de Alinhamento Espiritual",
    description: "Descubra seu mapa da alma através da correlação de sistemas místicos ancestrais: Cabala, Ifá, Astrologia, Numerologia, Tarot e Chakras.",
    images: [
      {
        url: "/og-default.svg",
        width: 1200,
        height: 630,
        alt: "Cabala dos Caminhos - Tecnologia Sagrada",
      },
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Cabala dos Caminhos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cabala dos Caminhos",
    description: "Tecnologia Sagrada de Alinhamento Espiritual",
    images: ["/og-default.svg"],
    creator: "@cabaladoscaminhos",
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
    title: "Cabala",
  },
  applicationName: "Cabala dos Caminhos",
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
        <OfflineIndicator />
        <SupabaseProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </SupabaseProvider>
        <InstallPrompt />
      </body>
    </html>
  );
}