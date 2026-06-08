import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ContaClient from './ContaClient';

export default async function ContaPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string; type?: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('akasha_session')?.value;
  if (!token) redirect('/onboarding');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const headers = { Cookie: `akasha_session=${token}` };

  const [meRes, credRes, subRes] = await Promise.all([
    fetch(`${baseUrl}/api/akasha/auth/me`, { headers, cache: 'no-store' }),
    fetch(`${baseUrl}/api/akasha/credits`, { headers, cache: 'no-store' }),
    fetch(`${baseUrl}/api/akasha/subscription`, { headers, cache: 'no-store' }),
  ]);

  // AD-T5-D: redirecionar em qualquer falha de /me (não só 401)
  if (!meRes.ok) redirect('/onboarding');

  const user = await meRes.json();
  const { balance = 0 } = credRes.ok ? await credRes.json() : {};
  const subscription = subRes.ok
    ? await subRes.json()
    : { plan: 'FREEMIUM', status: 'ACTIVE' };
  const subscriptionError = !subRes.ok;

  const params = await searchParams;
  const checkoutStatus = params.checkout;

  return (
    <ContaClient
      user={user}
      balance={balance}
      subscription={subscription}
      subscriptionError={subscriptionError}
      checkoutStatus={checkoutStatus}
      pushEnabled={Boolean(user.pushEnabled)}
    />
  );
}
