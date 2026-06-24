import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from '@/lib/application/auth/akasha-jwt';
import ContaClient from './ContaClient';

export default async function ContaPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ checkout?: string; type?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(AKASHA_TOKEN_COOKIE)?.value;
  const authStatus = (await headers()).get('X-Akasha-Auth');
  if (authStatus !== 'refreshed' && (!token || !verifyAkashaToken(token, 'access'))) {
    redirect(`/${locale}/login`);
  }
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  // Pass __Host-akasha_session cookie to internal API (same name login set).
  // Was: `akasha_session=${token}` — wrong because login uses __Host- prefix
  // for security (Secure + Path=/ + no Domain). Without prefix, sub-requests
  // to /api/akasha/auth/me returned 401 even with valid token, causing the
  // auth/me fetch below to fail and triggering the final `redirect(/login)`.
  const requestHeaders = { Cookie: `__Host-akasha_session=${token}` };
  const [meRes, credRes, subRes] = await Promise.all([
    fetch(`${baseUrl}/api/akasha/auth/me`, { headers: requestHeaders, cache: 'no-store' }),
    fetch(`${baseUrl}/api/akasha/credits`, { headers: requestHeaders, cache: 'no-store' }),
    fetch(`${baseUrl}/api/akasha/subscription`, { headers: requestHeaders, cache: 'no-store' }),
  ]);

  if (!meRes.ok) redirect(`/${locale}/login`);

  const user = await meRes.json();
  const { balance = 0 } = credRes.ok ? await credRes.json() : {};
  const subscription = subRes.ok ? await subRes.json() : { plan: 'FREEMIUM', status: 'ACTIVE' };
  const subscriptionError = !subRes.ok;

  const sp = await searchParams;
  const checkoutStatus = sp.checkout;

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
