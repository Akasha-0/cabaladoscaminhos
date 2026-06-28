// ============================================================================
// /validacao — Landing page de validação de demanda (Wave 20 — Variante A)
// ============================================================================
// Foco: 1 CTA único ("Entrar na lista de espera") para medir conversão
// ANTES de gastar 8 semanas construindo a plataforma completa.
//
// A partir de Wave 20, esta rota é a **Variante A (baseline)** do A/B/C/D
// test. Outras variantes vivem em:
//   /validacao/b  → Variante B (hero com vídeo)
//   /validacao/c  → Variante C (social proof primeiro)
//   /validacao/d  → Variante D (interactive quiz)
//
// A página raiz `/validacao` resolve a variante via hash(userId) e faz
// redirect server-side (preservando query string + referrer).
//
// Métricas: ver docs/CONVERSION-FUNNEL-W20.md
// ============================================================================

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { resolveLandingVariant } from '@/lib/landing/variant';
import { cookies, headers } from 'next/headers';
import { trackVariantView } from '@/lib/landing/variant';
import { VariantAPage } from './variants/VariantA';

export const dynamic = 'force-static';
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Lista de espera — Akasha Portal',
  description:
    'A maior comunidade de espiritualidade universalista do Brasil está chegando. Cabala, Ifá, Xamanismo, Tantra, Reiki — e a ciência por trás de tudo. Junte-se ao beta privado.',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Akasha Portal — Beta privado (50 vagas)',
    description:
      'Cabala, Ifá, Xamanismo, Tantra, Reiki — e a ciência por trás de tudo. Entre na lista de espera do beta privado.',
    type: 'website',
    images: [{ url: '/og/validacao.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Akasha Portal — Beta privado',
    description: 'Cabala, Ifá, Xamanismo, Tantra, Reiki — e a ciência por trás.',
    images: ['/og/validacao.png'],
  },
};

interface PageProps {
  searchParams?: Promise<{ variant?: string; ref?: string; utm_source?: string }>;
}

export default async function ValidacaoPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const { variant, ref, utm_source } = params;

  // Se ?variant=A|B|C|D explícito (admin/tester), respeita.
  // Senão, resolve por hash.
  let resolved: 'A' | 'B' | 'C' | 'D';
  if (variant === 'A' || variant === 'B' || variant === 'C' || variant === 'D') {
    resolved = variant;
  } else {
    const meta = await resolveLandingVariant();
    resolved = meta.variant;
  }

  // Incrementa contador de views (in-memory).
  trackVariantView(resolved);

  // Se variante != A, redireciona para a rota dedicada.
  // A não-redireciona (preserva URL canônica para SEO).
  if (resolved !== 'A') {
    const qs = new URLSearchParams();
    qs.set('variant', resolved);
    if (ref) qs.set('ref', ref);
    if (utm_source) qs.set('utm_source', utm_source);
    redirect(`/validacao/${resolved.toLowerCase()}?${qs.toString()}`);
  }

  // Variant A: renderiza diretamente.
  const cookieStore = await cookies();
  const headersList = await headers();
  const referrer = headersList.get('referer') ?? undefined;
  const userId =
    cookieStore.get('userId')?.value ?? cookieStore.get('anonymousId')?.value ?? undefined;

  return (
    <VariantAPage
      userId={userId}
      referrer={referrer}
      source={utm_source}
      referralCode={ref}
    />
  );
}
