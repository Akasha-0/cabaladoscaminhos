import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import MandalaChart from '@/components/akasha/MandalaChart';

export default async function MandalaPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('akasha_session')?.value;

  if (!token) redirect('/onboarding');

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/akasha/mandala`,
    {
      headers: { Cookie: `akasha_session=${token}` },
      cache: 'no-store',
    }
  );

  if (res.status === 401 || res.status === 404) redirect('/onboarding');

  const data = await res.json();

  return (
    <main
      style={{ background: '#06070F', minHeight: 'calc(100vh - 56px)' }}
      className="flex flex-col items-center py-8 px-4"
    >
      <h1
        style={{
          fontFamily: 'var(--font-cinzel, serif)',
          color: '#F4F5FF',
          fontSize: '1.25rem',
          marginBottom: '1.5rem',
          letterSpacing: '0.1em',
        }}
      >
        MANDALA AKÁSHICA
      </h1>
      <MandalaChart data={data} />
    </main>
  );
}
