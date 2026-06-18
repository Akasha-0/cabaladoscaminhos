import { cookies, headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { DimensaoCard, renderNarrative } from '@/components/akasha/CaixaUnificada';
import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from '@/lib/application/auth/akasha-jwt';
/**
 * Akasha — F-223 v3
 *
 * Página ÚNICA com 8 dimensões de vida.
 * Substitui a navegação por 5 mapas separados.
 *
 * v3: 9→8 dimensões corrigido; perfilGeral cor neutra; caminhoDeVida com subtítulo.
 * Mobile-first: accordion vertical.
 */

import { significadoPorPilar } from '@/lib/grimoire/significados-curados';
import type { PilaresDados } from '@/lib/grimoire/significados-curados';
import { sintetizarMapa } from '@/lib/grimoire/synthesis/synthesizer';

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

type ApiResponse = { pilares?: PilaresDados };

export default async function MinhaCaixaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const authStatus = (await headers()).get('X-Akasha-Auth');
  const token = cookieStore.get(AKASHA_TOKEN_COOKIE)?.value;
  // Option C: trust X-Akasha-Auth header set by middleware instead of re-verifying.
  if (authStatus !== 'refreshed' && !verifyAkashaToken(token, 'access')) {
    redirect(`/${locale}/login`);
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/akasha/mandato-do-dia`,
    {
      headers: { Cookie: `${AKASHA_TOKEN_COOKIE}=${token}` },
      cache: 'no-store',
    }
  );

  if (res.status === 401 || res.status === 404) redirect(`/${locale}/login`);

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
          {sintese &&
            (() => {
              const lp = pilares?.cabala?.life_path;
              const titulo = lp ? significadoPorPilar('cabala', lp)?.titulo : undefined;
              if (!titulo) return null;

              // Mapeamento de títulos canônicos → frase de enquadramento
              // Os títulos reais são: Pioneiro, Diplomata, Criador, Construtor,
              // Libertador, Guardião, Buscador, Realizador, Humanista,
              // Iluminador · Mestre, Construtor de Mundos · Mestre, Mestre Cósmico · Mestre
              const ENQUADRAMENTO: Record<string, string> = {
                Pioneiro: 'Isso se manifesta quando você busca criar algo onde não existe trilha.',
                Diplomata: 'Isso se manifesta quando você busca unir o que está dividido.',
                Criador: 'Isso se manifesta quando você expressa algo verdadeiro no mundo.',
                Construtor: 'Isso se manifesta quando você ergue estruturas que duram.',
                Libertador:
                  'Isso se manifesta quando você liberta a si mesmo ou a outros de algo preso.',
                Guardião: 'Isso se manifesta quando você cuida com amor sem esperar nada em troca.',
                Buscador:
                  'Isso se manifesta quando você busca conhecimento e compreensão profunda.',
                Realizador: 'Isso se manifesta quando você manifesta no mundo o que visionou.',
                Humanista: 'Isso se manifesta quando você age pelo bem de todos, sem distinção.',
                'Iluminador · Mestre':
                  'Isso se manifesta quando você age como canal entre o que vê e o que o mundo precisa.',
                'Construtor de Mundos · Mestre':
                  'Isso se manifesta quando você transforma uma visão grandiosa em realidade concreta.',
                'Mestre Cósmico · Mestre':
                  'Isso se manifesta quando você serve sem esperar reconhecimento.',
              };
              const framing =
                ENQUADRAMENTO[titulo] ??
                `Isso se manifesta quando você age como ${titulo.toLowerCase()}.`;

              return (
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'rgba(255,255,255,0.7)',
                    margin: '4px 0 0',
                    lineHeight: 1.4,
                  }}
                >
                  {framing}
                </p>
              );
            })()}
        </header>
        {/* ── Sua Autoridade Akasha ── */}
        {sintese && sintese.autoridade && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ color: C.dourado, fontSize: '1rem' }}>✦</span>
              <h2
                id="autoridade-heading"
                style={{
                  fontFamily: 'var(--font-cinzel, serif)',
                  color: C.txtPri,
                  fontSize: '0.95rem',
                  margin: 0,
                  fontWeight: 600,
                }}
              >
                Sua Autoridade Akasha
              </h2>
            </div>
            <section
              aria-labelledby="autoridade-heading"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(240,180,41,0.3)',
                borderRadius: 14,
                padding: '14px 18px',
                marginBottom: 20,
              }}
            >
              {/* Strategy badge + authority type */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '3px 10px',
                    borderRadius: 20,
                    background:
                      sintese.autoridade.estrategia === 'act'
                        ? 'rgba(240,180,41,0.2)'
                        : sintese.autoridade.estrategia === 'wait'
                          ? 'rgba(56,189,248,0.2)'
                          : sintese.autoridade.estrategia === 'observe'
                            ? 'rgba(124,92,255,0.2)'
                            : 'rgba(196,62,142,0.2)',
                    color:
                      sintese.autoridade.estrategia === 'act'
                        ? C.dourado
                        : sintese.autoridade.estrategia === 'wait'
                          ? '#38BDF8'
                          : sintese.autoridade.estrategia === 'observe'
                            ? C.violeta
                            : C.rosa,
                  }}
                >
                  {sintese.autoridade.estrategia === 'act'
                    ? 'Agir'
                    : sintese.autoridade.estrategia === 'wait'
                      ? 'Esperar'
                      : sintese.autoridade.estrategia === 'observe'
                        ? 'Observar'
                        : 'Entregar'}
                </span>
                <span style={{ color: C.txtSec, fontSize: '0.8rem' }}>
                  Autoridade {sintese.autoridade.autoridade}
                </span>
              </div>

              {/* Explanation */}
              <p
                style={{
                  color: C.txtPri,
                  fontSize: '0.88rem',
                  lineHeight: 1.5,
                  margin: '0 0 12px',
                }}
              >
                {sintese.autoridade.explicacao}
              </p>

              {/* Decision rule */}
              <div
                style={{
                  background: 'rgba(240,180,41,0.08)',
                  border: '1px solid rgba(240,180,41,0.2)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  marginBottom: 12,
                }}
              >
                <p
                  style={{
                    color: C.dourado,
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    margin: '0 0 2px',
                  }}
                >
                  Regra de decisão
                </p>
                <p style={{ color: C.txtPri, fontSize: '0.85rem', margin: 0 }}>
                  Quando {sintese.autoridade.regra.condicao} → {sintese.autoridade.regra.accao}
                </p>
              </div>

              {/* Timing + Area + Decisão */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <p style={{ color: C.txtSec, fontSize: '0.75rem', margin: '0 0 3px' }}>
                    Melhor momento
                  </p>
                  <p style={{ color: C.dourado, fontSize: '0.82rem', fontWeight: 600, margin: 0 }}>
                    {sintese.autoridade.timing.melhor}
                  </p>
                </div>
                <div>
                  <p style={{ color: C.txtSec, fontSize: '0.75rem', margin: '0 0 3px' }}>Evitar</p>
                  <p style={{ color: '#f87171', fontSize: '0.82rem', fontWeight: 600, margin: 0 }}>
                    {sintese.autoridade.timing.pior}
                  </p>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={{ color: C.txtSec, fontSize: '0.75rem', margin: '0 0 3px' }}>
                    Área de foco
                  </p>
                  <p style={{ color: C.txtPri, fontSize: '0.82rem', margin: 0 }}>
                    {sintese.autoridade.areaFoco}
                  </p>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={{ color: C.txtSec, fontSize: '0.75rem', margin: '0 0 3px' }}>
                    Decisão de hoje
                  </p>
                  <p style={{ color: C.violeta, fontSize: '0.82rem', fontWeight: 600, margin: 0 }}>
                    {sintese.autoridade.decisaoHoje}
                  </p>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Header do perfil */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ color: C.violeta, fontSize: '1rem' }}>✦</span>
          <h2
            id="perfil-heading"
            style={{
              fontFamily: 'var(--font-cinzel, serif)',
              color: C.txtPri,
              fontSize: '0.95rem',
              margin: 0,
              fontWeight: 600,
            }}
          >
            Seu Perfil Akasha
          </h2>
        </div>
        {/* Perfil geral narrativo */}
        {sintese && sintese.perfilGeral && (
          <div
            role="region"
            aria-labelledby="perfil-heading"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14,
              padding: '14px 18px',
              marginBottom: 20,
            }}
          >
            {renderNarrative(sintese.perfilGeral).map((node, i) => (
              <p
                key={i}
                style={{
                  color: C.txtPri,
                  fontSize: '0.92rem',
                  lineHeight: 1.55,
                  margin: '0 0 6px 0',
                }}
              >
                {node}
              </p>
            ))}
          </div>
        )}

        {/* 8 Dimensões — accordion mobile-first */}
        {sintese ? (
          <nav
            aria-label="8 dimensões de vida"
            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            {sintese.dimensoes.map((dim, i) => (
              <DimensaoCard key={dim.dimensoesId} sintese={dim} index={i} locale={locale} />
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

        {/* Footer CTA */}
        <footer
          style={{
            marginTop: 32,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <p
            style={{
              fontSize: '0.72rem',
              color: 'rgba(232,224,255,0.65)',
              margin: '0 0 4px',
              letterSpacing: '0.04em',
            }}
          >
            Como vai aplicar isto hoje?
          </p>
          <Link
            href={`/${locale}/diario`}
            style={{
              fontSize: '0.78rem',
              color: '#9D86FF',
              textDecoration: 'none',
              letterSpacing: '0.05em',
              fontWeight: 600,
            }}
          >
            Volte amanhã para seu Mandato do Dia →
          </Link>
          <Link
            href={`/${locale}/mapa/significado`}
            style={{
              fontSize: '0.72rem',
              color: C.txtMut,
              textDecoration: 'none',
              letterSpacing: '0.05em',
            }}
          >
            Ver seus 5 mapas (Cabala, Astrologia, Tântrica, Ôdu, I Ching) →
          </Link>
        </footer>
      </div>
    </main>
  );
}
