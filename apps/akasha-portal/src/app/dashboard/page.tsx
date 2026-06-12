import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Dashboard } from '@/components/akasha/dashboard';
import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from '@/lib/application/auth/akasha-jwt';

export const metadata = {
  title: 'Dashboard | Akasha OS',
  description: 'Sua Mandala Akáshica — os 5 pilares da sua existência.',
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AKASHA_TOKEN_COOKIE)?.value;
  const payload = verifyAkashaToken(token, 'access');

  if (!payload) {
    redirect('/onboarding');
  }

  return <Dashboard userId={payload.sub} />;
}
