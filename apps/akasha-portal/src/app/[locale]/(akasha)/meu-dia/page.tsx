/**
 * Meu Dia — F-224 (Mobile-first daily synthesis page)
 *
 * Página principal mobile: UMA visão do dia.
 * Não são 9 cards — é UMA narrativa com:
 *  - Perfil do dia (síntese geral)
 *  - Área foco (a mais importante hoje)
 *  - Decisão Akasha (Aja / Espere / Observe)
 *  - Prática do dia
 *  - Navegação rápida às outras áreas
 *
 * Mobile-first:
 *  - Touch targets ≥ 44px
 *  - Font size base 16px, headlines 1.5-2rem
 *  - Single column, sem scroll horizontal
 *  - Bottom nav sticky para ações
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { sintetizarMapa } from '@/lib/grimoire/synthesis/synthesizer';
import type { PilaresDados } from '@/lib/grimoire/significados-curados';

export const metadata = {
  title: 'Meu Dia · Akasha',
  description: 'Sua síntese diária — uma visão, uma decisão, uma prática.',
};

type ApiResponse = { pilares?: PilaresDados };

// ─── Paleta Akasha ───────────────────────────────────────────────────────────

const C = {
  bg: 'linear-gradient(180deg, #0B0E1C 0%, #0F1029 50%, #0B0E1C 100%)',
  cardBg: 'rgba(255,255,255,0.04)',
  cardBorder: 'rgba(124,92,255,0.18)',
  violet: '#7C5CFF',
  gold: '#F0B429',
  rose: '#C43E8E',
  teal: '#2DD4BF',
  txt: '#E8E0FF',
  txtSec: 'rgba(232,224,255,0.6)',
  txtMuted: 'rgba(232,224,255,0.35)',
  actBg: 'rgba(45,212,191,0.1)',
  actBorder: 'rgba(45,212,191,0.3)',
  waitBg: 'rgba(240,180,41,0.1)',
  waitBorder: 'rgba(240,180,41,0.3)',
  observeBg: 'rgba(124,92,255,0.1)',
  observeBorder: 'rgba(124,92,255,0.3)',
} as const;

// ─── Helpers ────────────────────────────────────────────────────────────────

function hoje(): string {
  const d = new Date();
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function horaSaudacao(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Boa madrugada';
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}
const ESTRATEGIA_LABEL: Record<string, string> = {
  act: 'Aja',
  wait: 'Espere',
  observe: 'Observe',
  surrender: 'Entregue',
};

const ESTRATEGIA_COLOR: Record<string, string> = {
  act: C.teal,
  wait: C.gold,
  observe: C.violet,
  surrender: C.rose,
};

const ESTRATEGIA_BG: Record<string, string> = {
  act: C.actBg,
  wait: C.waitBg,
  observe: C.observeBg,
  surrender: 'rgba(196,62,142,0.1)',
};

const ESTRATEGIA_BORDER: Record<string, string> = {
  act: C.actBorder,
  wait: C.waitBorder,
  observe: C.observeBorder,
  surrender: 'rgba(196,62,142,0.3)',
};

const DIMENSAO_ICONE: Record<string, string> = {
  saude: '◈',
  trabalho: '◉',
  amor: '♥',
  criacao: '✦',
  proposito: '☆',
  familia: '⬡',
  espiritualidade: '◎',
  superacao: '◐',
  sexualidade: '◉',
};

// ─── Renderiza markdown simples (bold + parágrafos) ─────────────────────────

function renderNarrative(text: string, fontSize = '0.92rem'): React.ReactNode[] {
  if (!text) return [];
  const paragraphs = text.split('\n\n').filter(Boolean);
  return paragraphs.map((para, i) => {
    const parts = para.split(/\*\*(.+?)\*\*/g);
    return (
      <p
        key={i}
        style={{
          fontSize,
          lineHeight: 1.6,
          color: C.txtSec,
          margin: 0,
          marginBottom: i < paragraphs.length - 1 ? 8 : 0,
        }}
      >
        {parts.map((part, j) =>
          j % 2 === 1
            ? <strong key={j} style={{ color: '#E8D0FF' }}>{part}</strong>
            : <span key={j}>{part}</span>
        )}
      </p>
    );
  });
}

// ─── Página ────────────────────────────────────────────────────────────────

export default async function MeuDiaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('akasha_session')?.value;

  if (!token) redirect(`/${locale}/onboarding`);

  // Fetch pilares do usuário
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

  // Área foco = primeira dimensão (sem sexualidade, que é especial)
  const dimFoco = sintese?.dimensoes.find((d) => d.dimensoesId !== 'sexualidade') ?? null;

  // Decisão akasha = primeira dimensão com autoridade válida
  const dimComAutoridade = sintese?.dimensoes.find(
    (d) => d.dimensoesId !== 'sexualidade' && d.autoridadeAkasha.aplicavel
  ) ?? dimFoco;

  const autoridade = dimComAutoridade?.autoridadeAkasha;

  return (
    <main style={{ background: C.bg, minHeight: '100vh', paddingBottom: 100 }}>
      {/* Background glow effects */}
      <div aria-hidden style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(124,92,255,0.12) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(196,62,142,0.06) 0%, transparent 40%)',
      }} />

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 12px rgba(124,92,255,0.2); }
          50%       { box-shadow: 0 0 24px rgba(124,92,255,0.45); }
        }
        .animate-fade-up { animation: fadeUp 0.5s ease-out both; }
        .animate-fade-up-1 { animation: fadeUp 0.5s ease-out 0.1s both; }
        .animate-fade-up-2 { animation: fadeUp 0.5s ease-out 0.2s both; }
        .animate-fade-up-3 { animation: fadeUp 0.5s ease-out 0.3s both; }
        .authority-card { animation: pulse-glow 3s ease-in-out infinite; }
      `}</style>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>

        {/* ── Header ── */}
        <header style={{ paddingTop: 28, marginBottom: 28 }}>
          <p style={{
            fontSize: '0.72rem', color: C.txtMuted, letterSpacing: '0.16em',
            textTransform: 'uppercase', margin: '0 0 6px',
          }}>
            {hoje()}
          </p>
          <h1 style={{
            fontFamily: 'var(--font-cinzel, serif)',
            color: C.txt, fontSize: '2rem', margin: 0, lineHeight: 1.15,
          }}>
            {horaSaudacao()}
          </h1>
          {sintese?.caminhoDeVida && (
            <p style={{ color: C.txtSec, fontSize: '0.85rem', marginTop: 6 }}>
              Caminho de Vida {sintese.caminhoDeVida}
            </p>
          )}
        </header>

        {/* ── Perfil do Dia (síntese geral) ── */}
        {sintese?.perfilGeral && (
          <section className="animate-fade-up" style={{ marginBottom: 24 }}>
            <div style={{
              background: C.cardBg, border: `1px solid ${C.cardBorder}`,
              borderRadius: 18, padding: '20px 22px',
            }}>
              <p style={{
                fontFamily: 'var(--font-cinzel, serif)',
                color: C.violet, fontSize: '0.65rem', letterSpacing: '0.2em',
                textTransform: 'uppercase', margin: '0 0 12px',
              }}>
                Perfil de Hoje
              </p>
              {renderNarrative(sintese.perfilGeral, '1rem')}
            </div>
          </section>
        )}

        {/* ── Decisão Akasha Authority (hero card) ── */}
        {sintese?.autoridade && (
          <section className="animate-fade-up-1 authority-card" style={{ marginBottom: 24 }}>
            <div style={{
              background: ESTRATEGIA_BG[sintese.autoridade.estrategia] ?? C.observeBg,
              border: `1.5px solid ${ESTRATEGIA_BORDER[sintese.autoridade.estrategia] ?? C.observeBorder}`,
              borderRadius: 18, padding: '20px 22px',
            }}>
              {/* Label */}
              <p style={{
                fontFamily: 'var(--font-cinzel, serif)',
                color: ESTRATEGIA_COLOR[sintese.autoridade.estrategia] ?? C.violet,
                fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase',
                margin: '0 0 12px',
              }}>
                Akasha Authority
              </p>

              {/* Strategy name */}
              <h2 style={{
                fontFamily: 'var(--font-cinzel, serif)',
                color: C.txt, fontSize: '1.75rem', margin: '0 0 10px', lineHeight: 1.1,
              }}>
                {ESTRATEGIA_LABEL[sintese.autoridade.estrategia] ?? sintese.autoridade.estrategia}
              </h2>

              {/* Explicação curta */}
              <p style={{ fontSize: '0.85rem', color: C.txtSec, margin: '0 0 12px', lineHeight: 1.5 }}>
                {sintese.autoridade.decisaoHoje}
              </p>

              {/* Regra prática */}
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 10, padding: '10px 12px', marginBottom: 12,
              }}>
                <p style={{ fontSize: '0.68rem', color: ESTRATEGIA_COLOR[sintese.autoridade.estrategia] ?? C.violet, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 4px' }}>
                  Regra
                </p>
                <p style={{ fontSize: '0.82rem', color: C.txtSec, margin: 0, lineHeight: 1.4 }}>
                  {sintese.autoridade.regra.condicao} → <strong style={{ color: '#E8D0FF' }}>{sintese.autoridade.regra.accao}</strong>
                </p>
              </div>

              {/* Timing */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                <div>
                  <p style={{ fontSize: '0.62rem', color: C.teal, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 2px' }}>
                    Melhor timing
                  </p>
                  <p style={{ fontSize: '0.78rem', color: C.txtSec, margin: 0 }}>
                    {sintese.autoridade.timing.melhor}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.62rem', color: C.rose, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 2px' }}>
                    Pior timing
                  </p>
                  <p style={{ fontSize: '0.78rem', color: C.txtSec, margin: 0 }}>
                    {sintese.autoridade.timing.pior}
                  </p>
                </div>
              </div>

              {/* Autoridade + área de foco */}
              <p style={{ fontSize: '0.78rem', color: C.txtMuted, margin: 0 }}>
                Autoridade: <strong style={{ color: C.txtSec }}>{sintese.autoridade.autoridade}</strong>
                {' · '}
                Área foco: <strong style={{ color: C.txtSec }}>{DIMENSAO_ICONE[sintese.autoridade.areaFoco] ?? ''} {sintese.autoridade.areaFoco}</strong>
              </p>
            </div>
          </section>
        )}
        {/* ── Área Foco do Dia ── */}
        {dimFoco && (
          <section className="animate-fade-up-2" style={{ marginBottom: 24 }}>
            <div style={{
              background: C.cardBg, border: `1px solid ${C.cardBorder}`,
              borderRadius: 18, padding: '20px 22px',
            }}>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: '1.6rem', lineHeight: 1 }} aria-hidden>
                  {DIMENSAO_ICONE[dimFoco.dimensoesId] ?? '◈'}
                </span>
                <div>
                  <p style={{
                    fontFamily: 'var(--font-cinzel, serif)',
                    color: C.gold, fontSize: '0.65rem', letterSpacing: '0.2em',
                    textTransform: 'uppercase', margin: '0 0 2px',
                  }}>
                    Área de Foco
                  </p>
                  <h3 style={{
                    color: C.txt, fontSize: '1.15rem', margin: 0, fontFamily: 'var(--font-cinzel, serif)',
                  }}>
                    {dimFoco.titulo}
                  </h3>
                </div>
              </div>

              {/* Narrative */}
              <div style={{ marginBottom: 16 }}>
                {renderNarrative(dimFoco.synthes, '0.9rem')}
              </div>

              {/* Prática */}
              {dimFoco.praktika && (
                <div style={{
                  background: 'rgba(240,180,41,0.06)',
                  border: '1px solid rgba(240,180,41,0.15)',
                  borderRadius: 10, padding: '12px 14px', marginBottom: 12,
                }}>
                  <p style={{
                    fontSize: '0.68rem', color: C.gold, letterSpacing: '0.12em',
                    textTransform: 'uppercase', margin: '0 0 6px',
                  }}>
                    Prática de Hoje
                  </p>
                  <p style={{ fontSize: '0.85rem', color: C.txtSec, margin: 0, lineHeight: 1.5 }}>
                    {dimFoco.praktika}
                  </p>
                </div>
              )}

              {/* Alerta */}
              {dimFoco.alerta && (
                <div style={{
                  background: 'rgba(196,62,142,0.06)',
                  border: '1px solid rgba(196,62,142,0.15)',
                  borderRadius: 10, padding: '12px 14px',
                }}>
                  <p style={{
                    fontSize: '0.68rem', color: C.rose, letterSpacing: '0.12em',
                    textTransform: 'uppercase', margin: '0 0 4px',
                  }}>
                    Evite
                  </p>
                  <p style={{ fontSize: '0.82rem', color: C.txtSec, margin: 0, lineHeight: 1.4 }}>
                    {dimFoco.alerta}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Navegação rápida às outras áreas ── */}
        {sintese && (
          <section className="animate-fade-up-3" style={{ marginBottom: 28 }}>
            <p style={{
              fontFamily: 'var(--font-cinzel, serif)',
              color: C.txtMuted, fontSize: '0.65rem', letterSpacing: '0.2em',
              textTransform: 'uppercase', margin: '0 0 12px',
            }}>
              Outras Áreas
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 8,
            }}>
              {sintese.dimensoes
                .filter((d) => d.dimensoesId !== dimFoco?.dimensoesId && d.dimensoesId !== 'sexualidade')
                .slice(0, 6)
                .map((dim) => (
                  <Link
                    key={dim.dimensoesId}
                    href={`/${locale}/minha-caixa`}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      justifyContent: 'center', gap: 4,
                      background: C.cardBg, border: `1px solid ${C.cardBorder}`,
                      borderRadius: 12, padding: '12px 8px', textDecoration: 'none',
                      minHeight: 72,
                    }}
                  >
                    <span style={{ fontSize: '1.3rem', lineHeight: 1 }} aria-hidden>
                      {DIMENSAO_ICONE[dim.dimensoesId] ?? '◈'}
                    </span>
                    <span style={{
                      fontSize: '0.65rem', color: C.txtSec, textAlign: 'center',
                      lineHeight: 1.2,
                    }}>
                      {dim.titulo}
                    </span>
                  </Link>
                ))}
            </div>
          </section>
        )}

        {/* ── Ver Caixa Completa ── */}
        <section style={{ marginBottom: 40 }}>
          <Link
            href={`/${locale}/minha-caixa`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: C.cardBg, border: `1px solid ${C.cardBorder}`,
              borderRadius: 14, padding: '14px 20px', textDecoration: 'none',
              color: C.txtSec, fontSize: '0.85rem',
              minHeight: 48,
            }}
          >
            Ver minha caixa completa →
          </Link>
        </section>

      </div>

      {/* ── Bottom Navigation Bar ── (mobile nav) */}
      <nav
        aria-label="Navegação principal"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'rgba(11,14,28,0.95)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(124,92,255,0.12)',
          padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
          zIndex: 100,
        }}
      >
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          maxWidth: 480, margin: '0 auto', gap: 4,
        }}>
          {[
            { href: `/${locale}/meu-dia`, label: 'Hoje', icon: '◈', active: true },
            { href: `/${locale}/diario`, label: 'Mandato', icon: '☽', active: false },
            { href: `/${locale}/minha-caixa`, label: 'Caixa', icon: '⬡', active: false },
            { href: `/${locale}/mapa/significado`, label: 'Mapa', icon: '☆', active: false },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                padding: '6px 8px', textDecoration: 'none',
                color: item.active ? C.violet : C.txtMuted,
                minHeight: 48,
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '1.2rem', lineHeight: 1 }} aria-hidden>{item.icon}</span>
              <span style={{ fontSize: '0.6rem', letterSpacing: '0.06em' }}>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </main>
  );
}
