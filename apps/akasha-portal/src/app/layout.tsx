import type { Metadata, Viewport } from 'next';
import { Cinzel, Cormorant_Garamond, Inter, Lora, JetBrains_Mono } from 'next/font/google';
import { LocaleSwitcher } from '@/components/akasha/LocaleSwitcher';
import { ServiceWorkerRegistrar } from '@/components/akasha/ServiceWorkerRegistrar';
import { ThemeProvider } from '@/components/akasha/ThemeProvider';
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

// UI mobile-first — Doc 26 §5
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

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
//
// Wave 12.5: PAGE_CSP alinhada com a versão do middleware.ts.
//   - Removido `'unsafe-eval'` (não necessário em prod).
//   - `connect-src` reduzido a providers reais: MiniMax + Stripe.
//   - `Permissions-Policy` ampliado (mais APIs sensíveis bloqueadas).
// O middleware.ts seta o MESMO CSP em runtime; este export é fallback
// para build-time/RSC streaming.
// ============================================================
const PAGE_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.minimaxi.chat https://api.minimax.io https://api.stripe.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

export const headers = [
  {
    source: '/:path*',
    headers: [
      { key: 'Content-Security-Policy', value: PAGE_CSP },
      // Permissions-Policy ampliado (Wave 12.5): bloqueia também accelerometer,
      // gyroscope, magnetometer, payment e usb.
      {
        key: 'Permissions-Policy',
        value:
          'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
      },
    ],
  },
];
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://akasha.cabaladoscaminhos.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Sistema Akasha',
    template: '%s | Sistema Akasha',
  },
  description:
    'Tecnologia espiritual viva. O Sistema Akasha cruza Astrologia, Numerologia Cabalística, Numerologia Tântrica e Odus para revelar seu diagnóstico e ritual personalizados.',
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
    title: 'Akasha',
  },
  applicationName: 'Sistema Akasha',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: {
      url: '/icons/apple-touch-icon-180.png',
      sizes: '180x180',
      type: 'image/png',
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export const viewport: Viewport = {
  themeColor: '#06070F',
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
        {/* iOS splash screens — Doc 26 §5 / F-228 */}
        <link
          key="splash-14promax"
          rel="apple-touch-startup-image"
          href="/splash/splash-iphone-14-pro-max-portrait.png"
          media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          key="splash-14pro"
          rel="apple-touch-startup-image"
          href="/splash/splash-iphone-14-pro-portrait.png"
          media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          key="splash-se"
          rel="apple-touch-startup-image"
          href="/splash/splash-iphone-se-portrait.png"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          key="splash-11pro-max"
          rel="apple-touch-startup-image"
          href="/splash/splash-iphone-11-pro-max-portrait.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          key="splash-ipad-11"
          rel="apple-touch-startup-image"
          href="/splash/splash-ipad-pro-11-portrait.png"
          media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          key="splash-ipad-129"
          rel="apple-touch-startup-image"
          href="/splash/splash-ipad-pro-129-portrait.png"
          media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
      </head>
      <body
        className={`${cinzel.variable} ${cormorant.variable} ${inter.variable} ${lora.variable} ${jetbrainsMono.variable} min-h-screen antialiased`}
        style={{ background: '#06070F', color: '#F4F5FF' }}
      >
        <ThemeProvider>{children}</ThemeProvider>
        <ServiceWorkerRegistrar />
        <div className="fixed top-4 right-4 z-50">
          <LocaleSwitcher />
        </div>
      </body>
    </html>
  );
}
