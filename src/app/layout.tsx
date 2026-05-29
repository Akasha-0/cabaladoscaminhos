import type { Metadata, Viewport } from "next";
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

export const metadata: Metadata = {
  title: "Cabala dos Caminhos",
  description: "Plataforma de autoconhecimento espiritual unificado",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Cabala',
  },
  applicationName: 'Cabala dos Caminhos',
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
      <body
        className={`${cinzel.variable} ${cormorant.variable} ${raleway.variable} ${imFell.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <OfflineIndicator />
        <SupabaseProvider>
          {children}
        </SupabaseProvider>
        <InstallPrompt />
      </body>
    </html>
  );
}
