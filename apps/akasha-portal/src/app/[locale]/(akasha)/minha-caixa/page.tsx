/**
 * /minha-caixa — redirected to /mapa/significado (v0.85.0)
 *
 * This page overlapped with /mapa/significado (both show 5 pillars × life areas).
 * /mapa/significado is the canonical surface for meaning exploration.
 * Sexualidade deep dive is available within /mapa/significado.
 * Kept as redirect so existing links continue working.
 */
import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function MinhaCaixaPage({ params }: Props) {
  const { locale } = await params;
  redirect(`/${locale}/mapa/significado`);
}
