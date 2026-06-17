import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ConexoesClient from '@/components/akasha/ConexoesClient';
import { prisma } from '@/lib/infrastructure/prisma';
import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from '@/lib/application/auth/akasha-jwt';

export default async function ConexoesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(AKASHA_TOKEN_COOKIE)?.value;
  if (!token) redirect(`/${locale}/onboarding`);

  const payload = verifyAkashaToken(token, 'access');
  if (!payload) redirect(`/${locale}/onboarding`);

  const userId = payload.sub;

  let userProfile: {
    name: string;
    birthDate: string | null;
    birthTime: string | null;
    birthCity: string | null;
    birthLatitude: number | null;
    birthLongitude: number | null;
    birthTimezone: string | null;
  } | null = null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        birthDate: true,
        birthTime: true,
        birthCity: true,
        birthLatitude: true,
        birthLongitude: true,
        birthTimezone: true,
      },
    });
    if (!user) redirect(`/${locale}/onboarding`);
    userProfile = {
      name: user.name ?? '',
      birthDate: user.birthDate ? user.birthDate.toISOString().split('T')[0] : null,
      birthTime: user.birthTime ?? null,
      birthCity: user.birthCity ?? null,
      birthLatitude: user.birthLatitude ?? null,
      birthLongitude: user.birthLongitude ?? null,
      birthTimezone: user.birthTimezone ?? null,
    };
  } catch {
    redirect(`/${locale}/onboarding`);
  }

  return <ConexoesClient userProfile={userProfile} />;
}
