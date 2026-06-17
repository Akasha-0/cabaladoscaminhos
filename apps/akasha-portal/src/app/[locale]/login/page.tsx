import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LoginClient from './LoginClient';
import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from '@/lib/application/auth/akasha-jwt';

type Props = { params: Promise<{ locale: string }> };

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const session = cookieStore.get(AKASHA_TOKEN_COOKIE)?.value;
  // Redirect if user already has a valid access token (any authStatus — fresh, refreshed, or invalid).
  // Previously: authStatus !== 'refreshed' && payload → skipped redirect when middleware refreshed token.
  // Result: logged-in user saw login form, ?return=/onboarding possible after form submission.
  const authStatus = (await headers()).get('X-Akasha-Auth');
  const payload = verifyAkashaToken(session, 'access');
  if (payload) redirect(`/${locale}/conta`);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#06070F',
        color: '#F4F5FF',
        fontFamily: 'var(--font-inter), sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          borderBottom: '1px solid rgba(124, 92, 255, 0.15)',
          background: 'rgba(6, 7, 15, 0.88)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href={`/${locale}`}
            style={{
              fontFamily: 'var(--font-cinzel), serif',
              color: '#7C5CFF',
              letterSpacing: '0.18em',
              fontWeight: 600,
              fontSize: '1.1rem',
              textDecoration: 'none',
            }}
          >
            ✦ AKASHA
          </Link>
          <Link
            href={`/${locale}/onboarding`}
            style={{
              color: '#9D86FF',
              fontSize: '0.875rem',
              textDecoration: 'none',
            }}
          >
            Criar conta
          </Link>
        </nav>
      </header>

      <main
        className="flex-1 flex items-center justify-center px-4 py-12"
        style={{ background: 'radial-gradient(ellipse at top, rgba(124,92,255,0.08), transparent 60%)' }}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div className="text-center mb-8">
            <h1
              style={{
                fontFamily: 'var(--font-cinzel), serif',
                fontSize: '1.875rem',
                fontWeight: 700,
                marginBottom: '0.5rem',
                background: 'linear-gradient(135deg, #F4F5FF 0%, #9D86FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Bem-vindo de volta
            </h1>
            <p style={{ color: '#A7AECF', fontSize: '0.9375rem' }}>
              Entre para acessar sua Mandala Akáshica.
            </p>
          </div>

          <LoginClient locale={locale} />
        </div>
      </main>

      <footer className="py-6 text-center text-xs" style={{ color: '#5C6691' }}>
        Sistema Akasha · Cabala dos Caminhos
      </footer>
    </div>
  );
}
