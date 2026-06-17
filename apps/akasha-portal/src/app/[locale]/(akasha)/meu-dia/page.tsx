import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { MyDayScreen } from '@/components/akasha/MyDayScreen';
import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from '@/lib/application/auth/akasha-jwt';
import { prisma } from '@/lib/infrastructure/prisma';

export const metadata = {
  title: 'Meu Dia | Akasha OS',
  description: 'ONE SCREEN mobile — sua síntese diária, autoridade, prática e janela de clareza.',
};

interface MeuDiaPageProps {
  params: Promise<{ locale: string }>;
}

export default async function MeuDiaPage({ params }: MeuDiaPageProps) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(AKASHA_TOKEN_COOKIE)?.value;
  const payload = verifyAkashaToken(token, 'access');

  if (!payload) {
    redirect(`/${locale}/onboarding`);
  }

  // Buscar dados do usuário para saudação
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { name: true },
  });

  const displayName = user?.name?.split(' ')[0] ?? 'Viajante';

  return <MyDayScreen userName={displayName} locale={locale} />;
}
