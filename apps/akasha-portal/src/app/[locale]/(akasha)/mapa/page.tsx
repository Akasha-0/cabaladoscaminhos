/**
 * Mapa — entry point
 *
 * Rota raiz `/[locale]/mapa`. O Mapa do Ser tem 3 camadas atualmente:
 *  - Significado: `/mapa/significado` (F-223) — 5 Pilares detalhados + 40 áreas
 *  - Mandala visual: `/mandala` — visualização cymática/circular
 *  - Diário: `/diario` — Mandato do Dia (Pilar do dia em destaque)
 *
 * Este entry point consolida a navegação entre as camadas do Mapa.
 * R-022 §4.4 — Pilar 4 (Odu) tem aviso ético carregado em todas as camadas.
 */
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Mapa do Ser',
  description: 'Seu mapa em 5 tradições — Cabala, Astrologia, Tantra, Ifá, I Ching.',
};
export default async function MapaIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Por ora, a única camada completa do Mapa é Significado. Quando outras
  // camadas (Diário do Mapa, Mapa Comparado) forem entregues, esta rota
  // vira um hub de seleção.
  redirect(`/${locale}/mapa/significado`);
}
