// src/app/cockpit/dashboard/page.tsx
// Dashboard B2B (Doc 05 §3 / Doc 16 AD-06.4).
// Server Component wrapper: redirect to login if not authenticated.
// Content rendered client-side via DashboardPanel (Onda E).
import { redirect } from 'next/navigation';
import { getOperatorFromServerContext } from '@/lib/auth/operator-session';
import { DashboardPanel } from '@/components/cockpit/dashboard/DashboardPanel';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const operator = await getOperatorFromServerContext();
  if (!operator) redirect('/cockpit/login');

  return <DashboardPanel />;
}
