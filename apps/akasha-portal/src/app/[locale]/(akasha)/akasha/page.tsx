/**
 * Akasha — F-223 v3
 *
 * Página ÚNICA com 9 dimensões de vida.
 * Substitui a navegação por 5 mapas separados.
 *
 * v3: 9→8 dimensões corrigido; perfilGeral cor neutra; caminhoDeVida com subtítulo.
 * Mobile-first: accordion vertical.
 */

import { significadoPorPilar } from '@/lib/grimoire/significados-curados';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { DimensaoCard } from '@/components/akasha/CaixaUnificada';
import { sintetizarMapa } from '@/lib/grimoire/synthesis/synthesizer';
import type { PilaresDados } from '@/lib/grimoire/significados-curados';

export const metadata = {
  title: 'Sua Vida em 8 Dimensões · Akasha',
  description: 'Sua vida em 8 dimensões — síntese dos 5 pilares.',
};

const C = {
  bgVoid: 'linear-gradient(180deg, #0B0E1C 0%, #131225 100%)',
  txtPri: '#E8E0FF',
  txtSec: 'rgba(232,224,255,0.6)',
  txtMut: 'rgba(232,224,255,0.35)',
  violeta: '#7C5CFF',
  dourado: '#F0B429',
  rosa: '#C43E8E',
} as const;

function saudacao(): string {
  const hora = new Date().getHours();
  if (hora < 5) return 'Boa madrugada';
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

type ApiResponse = { pilares?: PilaresDados };

export default async function MinhaCaixaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('akasha_session')?.value;

  if (!token) redirect(`/${locale}/onboarding`);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/akasha/mandato-do-dia`,
    {
      headers: { Cookie: `akasha_session=${token}` },
      cache: 'no-store',
    }
  );

  if (res.status === 401 || res.status === 404) redirect(`/${locale}/onboarding`);

  let pilares: PilaresDados | null = null;
  if (res.ok) {
    const data: ApiResponse = await res.json();
    if (data.pilares) pilares = data.pilares;
  }

  const sintese = pilares ? sintetizarMapa(pilares) : null;

  return (
    <main
      style={{
        background: C.bgVoid,
        minHeight: 'calc(100vh - 56px)',
        padding: '28px 16px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background gradient */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at top, rgba(124,92,255,0.1) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(240,180,41,0.05) 0%, transparent 40%)',
        }}
      />

      {/* Keyframe animation */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <header style={{ marginBottom: 28 }}>
          <span style={{ fontSize: '0.7rem', color: C.txtMut, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            {saudacao()} · Akasha
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-cinzel, serif)',
              color: C.txtPri,
              fontSize: '1.75rem',
              margin: '8px 0 6px',
              lineHeight: 1.2,
            }}
          >
            Sua Vida em 8 Dimensões
          </h1>
          <p style={{ color: C.txtSec, fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
            {sintese
              ? (() => {
                  const lp = pilares?.cabala?.life_path;
                  const titulo = lp ? significadoPorPilar('cabala', lp)?.titulo : undefined;
                  const lpStr = titulo
                    ? `${sintese.caminhoDeVida} · ${titulo}`
                    : `${sintese.caminhoDeVida}`;
                  return lpStr;
                })()
              : 'Sua vida em 8 dimensões'}
          </p>
        </header>

        {/* Header do perfil */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ color: C.violeta, fontSize: '1rem' }}>✦</span>
          <h2 style={{ fontFamily: 'var(--font-cinzel, serif)', color: C.txtPri, fontSize: '0.95rem', margin: 0, fontWeight: 600 }}>
            Seu Perfil Akasha
          </h2>
        </div>
        {/* Perfil geral narrativo */}
        {sintese && sintese.perfilGeral && (
          <section
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14,
              padding: '14px 18px',
              marginBottom: 20,
            }}
          >
            <p
              style={{
                color: C.txtPri,
                fontSize: '0.92rem',
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              {sintese.perfilGeral}
            </p>
          </section>
        )}

        {/* 9 Dimensões — accordion mobile-first */}
        {sintese ? (
          <nav aria-label="9 dimensões de vida" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sintese.dimensoes
              .map((dim, i) => (
                <DimensaoCard key={dim.dimensoesId} sintese={dim} index={i} />
              ))}
          </nav>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '48px 20px',
              color: C.txtSec,
              fontSize: '0.9rem',
            }}
          >
            <p style={{ marginBottom: 16 }}>Não foi possível carregar seus dados.</p>
            <Link
              href={`/${locale}/diario`}
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                background: C.violeta,
                color: '#0B0E1C',
                borderRadius: 8,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.88rem',
              }}
            >
              Ir para o Mandato do Dia →
            </Link>
          </div>
        )}

        {/* Footer link */}
        <footer style={{ marginTop: 32, textAlign: 'center' }}>
          <Link
            href={`/${locale}/mapa/significado`}
            style={{
              fontSize: '0.78rem',
              color: C.txtMut,
              textDecoration: 'none',
              letterSpacing: '0.05em',
            }}
          >
            Ver mapas individuais →
          </Link>
        </footer>
      </div>
    </main>
  );
}
