import Link from 'next/link';

export default function AkashaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col antialiased"
      style={{ background: '#030711', color: '#E2E8F0' }}
    >
      <header
        style={{
          background: 'rgba(3, 7, 17, 0.85)',
          borderBottom: '1px solid rgba(124, 58, 237, 0.2)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/mandala"
            className="text-lg font-semibold tracking-widest"
            style={{
              fontFamily: 'var(--font-cinzel), serif',
              color: '#7C3AED',
              letterSpacing: '0.15em',
            }}
          >
            ✦ AKASHA
          </Link>

          <ul className="flex items-center gap-6 text-sm">
            <li>
              <Link
                href="/mandala"
                className="transition-colors hover:text-[#7C3AED]"
                style={{ color: '#E2E8F0' }}
              >
                Mandala
              </Link>
            </li>
            <li>
              <Link
                href="/diario"
                className="transition-colors hover:text-[#7C3AED]"
                style={{ color: '#E2E8F0' }}
              >
                Diário
              </Link>
            </li>
            <li>
              <Link
                href="/oraculo"
                className="transition-colors hover:text-[#06B6D4]"
                style={{ color: '#E2E8F0' }}
              >
                Oráculo
              </Link>
            </li>
            <li>
              <Link
                href="/conta"
                className="transition-colors hover:text-[#F59E0B]"
                style={{ color: '#E2E8F0' }}
              >
                Conta
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <main className="flex-1 w-full">{children}</main>

      <footer className="py-6 text-center text-xs" style={{ color: 'rgba(226,232,240,0.3)' }}>
        Cabala dos Caminhos · Tecnologia Sagrada
      </footer>
    </div>
  );
}
