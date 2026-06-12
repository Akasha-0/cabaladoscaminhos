import Link from 'next/link';

/**
 * (akasha) group layout inside the [locale] segment.
 * Doc 25 §9 / v0.0.4-T9.8 — the previous `apps/akasha-portal/src/app/(akasha)/layout.tsx`
 * lived at the route root; now it sits one level deeper so all nav links are
 * locale-prefixed.
 */
export default async function AkashaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div
      className="min-h-screen flex flex-col antialiased"
      style={{ background: '#06070F', color: '#F4F5FF' }}
    >
      <header
        style={{
          background: 'rgba(6, 7, 15, 0.88)',
          borderBottom: '1px solid rgba(124, 92, 255, 0.2)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href={`/${locale}/mandala`}
            className="text-lg font-semibold"
            style={{
              fontFamily: 'var(--font-cinzel), serif',
              color: '#7C5CFF',
              letterSpacing: '0.18em',
            }}
          >
            ✦ AKASHA
          </Link>

          <ul
            className="flex items-center gap-5 text-sm"
            style={{ fontFamily: 'var(--font-inter), sans-serif' }}
          >
            <li>
              <Link
                href={`/${locale}/mandala`}
                className="transition-colors"
                style={{ color: '#A7AECF' }}
              >
                Mandala
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/diario`}
                className="transition-colors"
                style={{ color: '#A7AECF' }}
              >
                Diário
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/oraculo`}
                className="transition-colors"
                style={{ color: '#A7AECF' }}
              >
                Oráculo
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/mural`}
                className="transition-colors"
                style={{ color: '#A7AECF' }}
              >
                Mural
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/sobre`}
                className="transition-colors"
                style={{ color: '#A7AECF' }}
              >
                Sobre
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/conta`}
                className="transition-colors"
                style={{ color: '#A7AECF' }}
              >
                Conta
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <main className="flex-1 w-full">{children}</main>

      <footer className="py-6 text-center text-xs" style={{ color: '#5C6691' }}>
        Sistema Akasha · Cabala dos Caminhos · Tecnologia Espiritual Viva
      </footer>
    </div>
  );
}
