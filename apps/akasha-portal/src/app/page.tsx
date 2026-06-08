import { redirect } from 'next/navigation';
import { defaultLocale } from '@/i18n/config';

/**
 * Root `/` entry — Doc 25 §9 / v0.0.4-T9.8+T9.9
 *
 * The middleware (apps/akasha-portal/middleware.ts) normally intercepts
 * unprefixed paths and 307-redirects them to `/{locale}/...` using the
 * NEXT_LOCALE cookie / Accept-Language header. This file is a server-side
 * fallback for cases where the middleware does not run (e.g. static
 * pre-rendering) — it always lands the user on the default locale.
 */
export default function RootPage(): never {
  redirect(`/${defaultLocale}`);
}
