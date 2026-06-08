import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n/config';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * [locale] segment — Doc 25 §9 / v0.0.4-T9.8
 *
 * Validates the dynamic [locale] segment against the supported locales.
 * Anything else → 404 (which will be handled by the root not-found.tsx).
 *
 * Passes the validated locale down through the React tree as `params.locale`
 * (the route segment contract) — no global context is needed in this scope.
 */
export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!(locales as readonly string[]).includes(locale)) {
    notFound();
  }
  // Typed assertion after the runtime check above.
  const _typed: Locale = locale as Locale;
  void _typed;
  return <>{children}</>;
}
