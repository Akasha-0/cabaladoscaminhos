import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import MandalaChart from '@/components/akasha/MandalaChart';

export const metadata = {
  title: 'Minha Mandala',
  description: 'Sua Mandala Akáshica — os 4 pilares da sua existência.',
};

function getSaudacao(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom despertar —';
  if (h < 18) return 'Boa tarde —';
  return 'Boa noite —';
}

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

  const saudacao = getSaudacao();

  return (
    <main
      style={{ background: '#06070F', minHeight: 'calc(100vh - 56px)', position: 'relative' }}
      className="flex flex-col items-center py-8 px-4"
    >
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at top, rgba(240,180,41,0.08) 0%, transparent 60%), radial-gradient(ellipse at bottom, rgba(124,92,255,0.05) 0%, transparent 50%)',
          animation: 'akasha-pulse 8s ease-in-out infinite',
        }}
      />
      <style>{`@keyframes akasha-pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }`}</style>

      <h1
        style={{
          fontFamily: 'var(--font-cinzel, serif)',
          color: '#F4F5FF',
          fontSize: '1.25rem',
          marginBottom: '0.35rem',
          letterSpacing: '0.1em',
        }}
      >
        MANDALA AKÁSHICA
      </h1>

      {/* Dynamic greeting */}
      <p
        style={{
          fontFamily: 'var(--font-cinzel, serif)',
          color: '#A7AECF',
          fontSize: '0.75rem',
          marginBottom: '1.25rem',
          letterSpacing: '0.05em',
        }}
      >
        {saudacao} sua Mandala Akáshica aguarda
      </p>

      {/* Incomplete data badge */}
      {data.incomplete && (
        <a
          href="/conta"
          style={{
            display: 'inline-block',
            marginBottom: '1rem',
            padding: '5px 14px',
            borderRadius: '100px',
            border: '1px solid rgba(251,87,129,0.4)',
            background: 'rgba(251,87,129,0.08)',
            color: '#FB5781',
            fontSize: '0.75rem',
            textDecoration: 'none',
            letterSpacing: '0.03em',
          }}
        >
          ⚠ Dados incompletos — complete seu perfil para uma leitura plena
        </a>
      )}

      <MandalaChart data={data} />

      {/* Quick link to diary */}
      <a
        href="/diario"
        style={{
          marginTop: '1.25rem',
          color: '#5C6691',
          fontSize: '0.75rem',
          textDecoration: 'none',
          letterSpacing: '0.03em',
          transition: 'color 0.2s',
        }}
      >
        → Ver Diário Energético de hoje
      </a>
    </main>
  );
}
