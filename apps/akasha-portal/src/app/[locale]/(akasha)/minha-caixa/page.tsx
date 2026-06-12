/**
 * Minha Caixa — F-223 v2
 *
 * Página ÚNICA com 9 dimensões de vida.
 * Substitui a navegação por 5 mapas separados.
 *
 * v2: mostra sexualidade deep dive como seção destacada.
 * Mobile-first: accordion vertical.
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { DimensaoCard } from '@/components/akasha/CaixaUnificada';
import { sintetizarMapa } from '@/lib/grimoire/synthesis/synthesizer';
import type { PilaresDados } from '@/lib/grimoire/significados-curados';

export const metadata = {
  title: 'Minha Caixa · Akasha',
  description: 'Sua vida em 9 dimensões — síntese dos 5 pilares.',
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
            Minha Caixa
          </h1>
          <p style={{ color: C.txtSec, fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
            {sintese
              ? `${sintese.caminhoDeVida} · Síntese dos 5 pilares`
              : 'Sua vida em 9 dimensões'}
          </p>
        </header>

        {/* Perfil geral narrativo */}
        {sintese && sintese.perfilGeral && (
          <section
            style={{
              background: 'rgba(124,92,255,0.08)',
              border: '1px solid rgba(124,92,255,0.2)',
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

        {/* ── Sexualidade Deep Dive ── */}
        {sintese && sintese.sexualidadeNarrativa && (
          <section
            style={{
              background: 'rgba(196,62,142,0.08)',
              border: '1px solid rgba(196,62,142,0.25)',
              borderRadius: 16,
              padding: '18px 20px',
              marginBottom: 24,
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: '1.4rem', color: '#C43E8E', lineHeight: 1 }} aria-hidden>◉</span>
              <div>
                <h2
                  style={{
                    fontFamily: 'var(--font-cinzel, serif)',
                    color: '#E8E0FF',
                    fontSize: '1.05rem',
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  Sexualidade & Desejo
                </h2>
                <p style={{ fontSize: '0.78rem', color: 'rgba(232,224,255,0.5)', margin: '3px 0 0', lineHeight: 1.3 }}>
                  Mapa completo — seus 3 marcadores astrológicos + Tantra + Cabala
                </p>
              </div>
            </div>

            {/* Narrativa deep */}
            <NarrativeText text={sintese.sexualidadeNarrativa} />
          </section>
        )}

        {/* 9 Dimensões — accordion mobile-first */}
        {sintese ? (
          <nav aria-label="9 dimensões de vida" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sintese.dimensoes
              .filter((d) => d.dimensoesId !== 'sexualidade') // já shown above
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

// ─── Server component — renderiza markdown simples ─────────────────────────

function renderNarrative(text: string): React.ReactNode[] {
  if (!text) return [];
  const paragraphs = text.split('\n\n').filter(Boolean);
  return paragraphs.map((para, i) => {
    const parts = para.split(/\*\*(.+?)\*\*/g);
    const isBold = parts.length > 1;
    if (!isBold) {
      return (
        <span key={i} style={{ display: 'block', marginBottom: 6, fontSize: '0.88rem', lineHeight: 1.6, color: 'rgba(232,224,255,0.8)' }}>
          {para}
        </span>
      );
    }
    return (
      <span key={i} style={{ display: 'block', marginBottom: 6, fontSize: '0.88rem', lineHeight: 1.6, color: 'rgba(232,224,255,0.8)' }}>
        {parts.map((part, j) =>
          j % 2 === 1 ? (
            <strong key={j} style={{ color: '#E8D0FF' }}>{part}</strong>
          ) : (
            <span key={j}>{part}</span>
          )
        )}
      </span>
    );
  });
}

function NarrativeText({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {renderNarrative(text)}
    </div>
  );
}
