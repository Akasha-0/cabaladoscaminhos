// ============================================================================
// LocaleAwareImage — Imagem responsiva com alt em 3 idiomas
// ============================================================================
// Renderiza um <img> com `alt` selecionado pelo locale ativo (useT).
// Suporta também `altPrefix` (e.g. "Imagem simbólica") + altContext (e.g. "do Odu Ogbe")
// para construir strings mais ricas sem repetir 3 traduções completas.
//
// COMPORTAMENTO:
//   • Hidrata no client (não quebra SSR) — renderiza com pt-BR fallback.
//   • `aria-label` recebe a mesma string que `alt` (consistência leitor de tela).
//   • `loading="lazy"` por padrão (mobile-first performance).
//   • `decoding="async"` por padrão.
//
// USO:
//   <LocaleAwareImage
//     src="/images/odus/ogbe.webp"
//     width={240}
//     height={240}
//     alt={{
//       'pt-BR': 'Odu Ogbe',
//       en: 'Odu Ogbe',
//       es: 'Odu Ogbe',
//     }}
//     altPrefix={{
//       'pt-BR': 'Imagem simbólica',
//       en: 'Symbolic image',
//       es: 'Imagen simbólica',
//     }}
//   />
// ============================================================================

'use client';

import { useT } from '@/hooks/useT';
import { isSupportedLocaleW93, type SupportedLocaleW93 } from '@/lib/w93/i18n-rollout-engine';
import { cn } from '@/lib/utils';

export interface LocaleAwareImageProps {
  /** URL da imagem. */
  src: string;
  /** Largura em pixels (renderização). */
  width: number;
  /** Altura em pixels (renderização). */
  height: number;
  /** Alt em 3 idiomas — qual usar depende do locale ativo. */
  alt: Readonly<Record<SupportedLocaleW93, string>>;
  /** Prefixo descritivo (opcional) — concatenado antes do alt principal. */
  altPrefix?: Readonly<Record<SupportedLocaleW93, string>>;
  /** Classes extras. */
  className?: string;
  /** Lazy loading (default: true). */
  loading?: 'lazy' | 'eager';
  /** Async decoding (default: true). */
  decoding?: 'async' | 'sync' | 'auto';
  /** Sizes attr para responsive image. */
  sizes?: string;
  /** srcSet para retina (opcional). */
  srcSet?: string;
}

/**
 * Resolve a string de alt baseado no locale ativo.
 * Se locale ainda não hidratado, usa pt-BR (default).
 */
function resolveAlt(
  locale: SupportedLocaleW93 | string,
  alt: LocaleAwareImageProps['alt'],
  altPrefix?: LocaleAwareImageProps['altPrefix'],
): string {
  const loc: SupportedLocaleW93 = isSupportedLocaleW93(locale) ? locale : 'pt-BR';
  const main = alt[loc] ?? alt['pt-BR'];
  if (!altPrefix) return main;
  const prefix = altPrefix[loc] ?? altPrefix['pt-BR'];
  return `${prefix}: ${main}`;
}

export function LocaleAwareImage({
  src,
  width,
  height,
  alt,
  altPrefix,
  className,
  loading = 'lazy',
  decoding = 'async',
  sizes,
  srcSet,
}: LocaleAwareImageProps) {
  const { locale, hydrated } = useT();

  // Antes de hidratar, usa pt-BR (não pisca)
  const activeLocale = hydrated ? locale : 'pt-BR';
  const altText = resolveAlt(activeLocale, alt, altPrefix);

  return (
    <img
      src={src}
      alt={altText}
      aria-label={altText}
      width={width}
      height={height}
      loading={loading}
      decoding={decoding}
      sizes={sizes}
      srcSet={srcSet}
      className={cn('block max-w-full h-auto', className)}
    />
  );
}