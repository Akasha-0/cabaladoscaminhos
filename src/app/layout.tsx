// REMOVIDO: AD-17.6 — B2B não usa SupabaseProvider
// B2B Authentication usa /login com JWT próprio (Operator JWT)
// import { SupabaseProvider } from '@/components/providers/SupabaseProvider';
import type { Metadata, Viewport } from 'next';
import {
  Cinzel,
  Cormorant_Garamond,
  Raleway,
  IM_Fell_English,
  Lora,
  JetBrains_Mono,
} from 'next/font/google';
import './globals.css';

const cinzel = Cinzel({
  variable: '--font-cinzel',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const raleway = Raleway({
  variable: '--font-raleway',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

const imFell = IM_Fell_English({
  variable: '--font-imfell',
  subsets: ['latin'],
  weight: ['400'],
});

// Corpo do dossiê e bolhas do chat de consulta (Doc 05 §5 / Doc 13 §5).
const lora = Lora({
  variable: '--font-lora',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

// Números das casas, IDs e dados técnicos (Doc 05 §1.2 / Doc 13 §5).
const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
  weight: ['400', '500'],
});

// ============================================================
// Security Headers — CSP para rotas de página (não /api/*)
// Middleware.ts já endurece /api/* com default-src 'none'.
// Aqui adicionamos CSP funcional para páginas (Doc 18 §4).
// ============================================================
const PAGE_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.openai.com https://api.minimax.io https://api.stripe.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

export const headers = [
  {
    source: '/:path*',
    headers: [{ key: 'Content-Security-Policy', value: PAGE_CSP }],
  },
];
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://cabaladoscaminhos.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Cabala dos Caminhos',
    template: '%s | Cabala dos Caminhos',
  },
  description:
    'Plataforma de autoconhecimento espiritual unificado. Correlacionando Cabala, Ifá, Astrologia, Numerologia, Tarot e Chakras para seu despertar.',
  keywords: [
    'cabala',
    'espiritualidade',
    'mapa da alma',
    'astrologia',
    'numerologia',
    'ifá',
    'odús',
    'tarot',
    'chakras',
    ' autoconhecimento',
    'desenvolvimento pessoal',
    'tradição espiritual',
    'orixás',
  ],
  authors: [{ name: 'Cabala dos Caminhos', url: BASE_URL }],
  creator: 'Akasha-0',
  publisher: 'Cabala dos Caminhos',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: BASE_URL,
    siteName: 'Cabala dos Caminhos',
    title: 'Cabala dos Caminhos - Tecnologia Sagrada de Alinhamento Espiritual',
    description:
      'Descubra seu mapa da alma através da correlação de sistemas místicos ancestrais: Cabala, Ifá, Astrologia, Numerologia, Tarot e Chakras.',
    images: [
      {
        url: '/og-default.svg',
        width: 1200,
        height: 630,
        alt: 'Cabala dos Caminhos - Tecnologia Sagrada',
      },
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'Cabala dos Caminhos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cabala dos Caminhos',
    description: 'Tecnologia Sagrada de Alinhamento Espiritual',
    images: ['/og-default.svg'],
    creator: '@cabaladoscaminhos',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Cabala',
  },
  applicationName: 'Cabala dos Caminhos',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export const viewport: Viewport = {
  themeColor: '#fbbf24',
  width: 'device-width',
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
        <link key="canonical" rel="canonical" href={BASE_URL} />
        <link key="sitemap" rel="sitemap" href="/sitemap.xml" type="application/xml" />
        <link key="robots" rel="robots" href="/robots.txt" />
      </head>
      <body
        className={`${cinzel.variable} ${cormorant.variable} ${raleway.variable} ${imFell.variable} ${lora.variable} ${jetbrainsMono.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        {/* AD-17.6: Root layout é enxuto — sem SupabaseProvider (B2B usa Operator JWT) */}
        {children}
      </body>
    </html>
  );
}
