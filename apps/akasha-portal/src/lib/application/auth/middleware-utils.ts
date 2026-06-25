import { locales } from '@/i18n/config';

const PROTECTED_PATH_PREFIXES = [
  '/dashboard',
  '/conta',
  '/diario',
  '/diario/foco',
  '/mandala',
  '/oraculo',
  '/conexoes',
  '/mapa',
  '/mapa/significado',
  '/manifesto',
  '/meu-dia',
  '/significado-primeiro',
];

export function shouldRefreshAuth(pathname: string): boolean {
  const normalized = pathname.replace(/\/+/g, '/');
  const segments = normalized.split('/');
  const pathWithoutLocale =
    segments.length >= 2 && (locales as readonly string[]).includes(segments[1])
      ? '/' + segments.slice(2).join('/')
      : normalized;
  return PROTECTED_PATH_PREFIXES.some(
    (prefix) => pathWithoutLocale.startsWith(prefix) || pathWithoutLocale.includes('/akasha')
  );
}
