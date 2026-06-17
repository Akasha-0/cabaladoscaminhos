/**
 * Server component wrapper for the onboarding flow.
 *
 * Guards against the "localStorage cleared → onboarding re-shows" bug:
 * if the user already has a birthDate (onboarding was completed server-side),
 * redirect to /conta immediately — localStorage cannot override server state.
 *
 * Only renders the onboarding form for users who are either:
 * - Not logged in (new user registration), or
 * - Logged in but missing birthDate (incomplete onboarding)
 */
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from '@/lib/application/auth/akasha-jwt';
import { prisma } from '@/lib/infrastructure/prisma';
import { OnboardingClient } from './OnboardingClient';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ return?: string }>;
};

export default async function OnboardingPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { return: returnTo } = await searchParams;

  const cookieStore = await cookies();
  const token = cookieStore.get(AKASHA_TOKEN_COOKIE)?.value;
  const payload = verifyAkashaToken(token, 'access');

  // If user is logged in AND has a birthDate, onboarding is already complete.
  // Redirect to /conta (or return param) — don't show the form again.
  if (payload?.sub) {
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { birthDate: true },
    });

    if (user?.birthDate) {
      const destination = returnTo ?? `/${locale}/conta`;
      redirect(destination.startsWith('/') ? destination : `/${locale}/conta`);
    }
  }

  // Not logged in, or logged in but no birthDate yet — show the onboarding form.
  return <OnboardingClient locale={locale} returnTo={returnTo} />;
}
