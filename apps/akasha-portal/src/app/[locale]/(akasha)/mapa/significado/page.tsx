/**
 * Mapa · Significado — F-223, F-229, F-230, F-232
 *
 * Página dedicada à camada de SIGNIFICADO dos 5 Pilares do mapa do usuário.
 * Cada Pilar é traduzido de número/símbolo em COMPREENSÃO:
 *   - F-223: 5 Pilares com SignificadoPilar (essência, missão, sombra, prática, conexão)
 *   - F-229: 40 Traduções Pilar → Área (paz, saúde, relações, dinheiro, trabalho,
 *           propósito, criatividade, espiritualidade)
 *   - F-230: 1 Insight do Dia (síntese integrando os 5 Pilares)
 *   - F-232: 20 Conexões entre Pilares (matriz 5×5, sem diagonal)
 *
 * Princípios: VISION §3 axioma 3 (curadoria contínua) + axioma 4 (citação obrigatória).
 * Pilar 4 (Odu) carrega aviso ético R-022 §4.4 (terreiro + consentimento).
 */

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from '@/lib/application/auth/akasha-jwt';
import Link from 'next/link';
import { AkashaSignificadoCard } from '@/components/akasha/AkashaSignificadoCard';
import { SignificadoPilar } from '@/components/akasha/SignificadoPilar';
import { TraducaoAreaPanel } from '@/components/akasha/TraducaoAreaPanel';
import {
  InsightDoDiaPanel,
  ConexoesPilaresPanel,
} from '@/components/akasha/InsightDoDiaPanel';
import { gerarInsightDoDia } from '@/lib/grimoire/insight-do-dia';
import { matrizConexoes } from '@/lib/grimoire/conexoes-pilares';
import {
  significadosEspecificos,
  type Pilar,
  type PilaresDados,
} from '@/lib/grimoire/significados-curados';
import {
  AREAS,
  AREA_LABEL,
  AREA_ICONE,
  traducoesDaArea,
} from '@/lib/grimoire/traducao-areas';

export const metadata = {
  title: 'Significado do Mapa',
  description: 'O que seus 5 Pilares significam — para você, hoje.',
};

const C = {
  violeta: '#7C5CFF',
  aurora: '#2DD4BF',
  dourado: '#F0B429',
  magenta: '#FB5781',
  ocre: '#A0763A',
  bgVoid: '#06070F',
  bgNeb: '#141A33',
  txtPri: '#F4F5FF',
  txtSec: '#A7AECF',
  txtMut: '#5C6691',
} as const;

const ORDEM_PILARES: Pilar[] = ['cabala', 'astrologia', 'tantrica', 'odu', 'iching'];

const PILAR_META: Record<Pilar, { nome: string; subtitulo: string; cor: string; icone: string }> = {
  cabala: { nome: 'Caminho Cabalístico', subtitulo: 'Sua missão numerológica', cor: C.violeta, icone: '✡' },
  astrologia: { nome: 'Mapa Astral', subtitulo: 'O céu do seu nascimento', cor: C.aurora, icone: '☉' },
  tantrica: { nome: 'Corpo Tântrico', subtitulo: 'Sua anatomia sutil', cor: C.dourado, icone: '◈' },
  odu: { nome: 'Odu de Nascimento', subtitulo: 'Sua ancestralidade iorubá', cor: C.magenta, icone: '✺' },
  iching: { nome: 'Hexagrama do Dia', subtitulo: 'A mutação de hoje', cor: C.ocre, icone: '☯' },
};

const CORES_PILAR: Record<Pilar, string> = {
  cabala: C.violeta,
  astrologia: C.aurora,
  tantrica: C.dourado,
  odu: C.magenta,
  iching: C.ocre,
};

type ApiResponse = {
  pilares?: PilaresDados;
  mentor_hook?: { crise_detectada?: boolean };
};

function saudacao(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default async function SignificadoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(AKASHA_TOKEN_COOKIE)?.value;
  const authStatus = (await headers()).get('X-Akasha-Auth');

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/akasha/mandato-do-dia`,
    {
      headers: { Cookie: `akasha_session=${token}` },
      cache: 'no-store',
    }
  );

  if (res.status === 401 || res.status === 404) redirect(`/${locale}/login`);

  let pilares: PilaresDados | null = null;
  if (res.ok) {
    const data: ApiResponse = await res.json();
    if (data.pilares) pilares = data.pilares;
  }

  const insight = pilares ? gerarInsightDoDia(pilares) : null;
  const conexoes = matrizConexoes();

  return (
    <main
      style={{
        background: C.bgVoid,
        minHeight: 'calc(100vh - 56px)',
        padding: '32px 20px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at top, rgba(124,92,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at bottom, rgba(240,180,41,0.05) 0%, transparent 50%)',
        }}
      />

      <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <header style={{ marginBottom: 24 }}>
          <span
            style={{
              fontSize: '0.7rem',
              color: C.txtMut,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            {saudacao()} · Mapa do Ser
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-cinzel, serif)',
              color: C.txtPri,
              fontSize: '1.8rem',
              margin: '8px 0 6px',
              lineHeight: 1.2,
            }}
          >
            O Significado do seu Mapa
          </h1>
          <p style={{ color: C.txtSec, fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
            Cinco tradições convergem em você. Cada Pilar abaixo responde uma pergunta diferente —
            e as cinco, juntas, começam a descrever quem você é.
          </p>
        </header>

        {/* F-230 — Insight do Dia */}
        {insight && <InsightDoDiaPanel insight={insight} />}

        {/* Akasha Unificado — FASE 3 Ciclo 2: interpretação profunda do Número de Vida */}
        {pilares ? (
          <AkashaSignificadoCard lifePath={pilares.cabala.life_path} />
        ) : null}

        {/* 5 Pilares em sequência */}
        {pilares ? (
          <MapaCompleto pilares={pilares} />
        ) : (
          <CardFallback>
            <p style={{ color: C.txtSec, lineHeight: 1.5 }}>
              Não conseguimos carregar seus Pilares agora. Volte ao Mandato do Dia, que recalcula
              seu mapa. Se o problema persistir, verifique seus dados natais.
            </p>
            <Link
              href={`/${locale}/diario`}
              style={{
                display: 'inline-block',
                marginTop: 14,
                padding: '10px 18px',
                background: C.violeta,
                color: '#0B0E1C',
                borderRadius: 8,
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Ir para o Mandato do Dia →
            </Link>
          </CardFallback>
        )}

        {/* F-232 — Como os 5 Pilares se FALAM entre si */}
        {pilares && (
          <section style={{ marginTop: 36 }}>
            <h2
              style={{
                fontFamily: 'var(--font-cinzel, serif)',
                fontSize: '1.15rem',
                color: C.txtPri,
                margin: '0 0 6px',
                letterSpacing: '0.04em',
              }}
            >
              Como os 5 Pilares se falam
            </h2>
            <p style={{ color: C.txtSec, fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 18px' }}>
              A Mandala é UM INTEIRO. Cabala ilumina Astrologia; Astrologia ilumina Tantra;
              Tantra ancora I Ching. São 20 conexões entre os 5 Pilares (a diagonal,
              Pilar consigo mesmo, é vazia). Leia em pares e medite.
            </p>
            <ConexoesPilaresPanel conexoes={conexoes} />
          </section>
        )}

        {/* F-229 — Por área da vida */}
        {pilares && (
          <section style={{ marginTop: 36 }}>
            <h2
              style={{
                fontFamily: 'var(--font-cinzel, serif)',
                fontSize: '1.15rem',
                color: C.txtPri,
                margin: '0 0 6px',
                letterSpacing: '0.04em',
              }}
            >
              Por área da vida
            </h2>
            <p style={{ color: C.txtSec, fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 18px' }}>
              Você vive em áreas — paz, saúde, relações, dinheiro, trabalho, propósito,
              criatividade, espiritualidade. Os 5 Pilares dão 5 leituras para cada área.
              São 40 traduções curadas. Escolha 1 área e medite.
            </p>
            {AREAS.map((area) => (
              <div key={area} style={{ marginBottom: 18 }}>
                <h3
                  style={{
                    fontSize: '0.85rem',
                    color: C.txtPri,
                    margin: '0 0 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span style={{ color: C.ocre, fontSize: '1.1rem' }}>{AREA_ICONE[area]}</span>
                  {AREA_LABEL[area]}
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: 8,
                  }}
                >
                  {traducoesDaArea(area).map((t) => (
                    <TraducaoAreaPanel
                      key={`${t.pilar}-${t.area}`}
                      traducao={t}
                      cor={CORES_PILAR[t.pilar]}
                    />
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Footer ético Pilar 4 */}
        {pilares && (
          <footer
            style={{
              marginTop: 32,
              padding: '14px 18px',
              border: '1px solid rgba(251,87,129,0.3)',
              borderRadius: 10,
              background: 'rgba(251,87,129,0.04)',
            }}
          >
            <span
              style={{
                fontSize: '0.7rem',
                color: C.magenta,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              Aviso ético · Pilar 4 (Odu)
            </span>
            <p style={{ color: C.txtSec, fontSize: '0.85rem', lineHeight: 1.5, margin: '6px 0 0' }}>
              O Odu é uma herança ancestral iorubá, não um produto. As palavras acima são uma
              introdução geral. A leitura profunda do seu Ori pede babalaô ou yaô de sua confiança,
              com consentimento seu e da tradição (R-022 §4.4).
            </p>
          </footer>
        )}

        <div style={{ marginTop: 28, textAlign: 'center' }}>
          <Link
            href={`/${locale}/mandala`}
            style={{
              color: C.txtSec,
              fontSize: '0.85rem',
              textDecoration: 'none',
              borderBottom: `1px dashed ${C.txtMut}`,
              paddingBottom: 2,
            }}
          >
            ← Ver Mandala visual
          </Link>
        </div>
      </div>
    </main>
  );
}

function MapaCompleto({ pilares }: { pilares: PilaresDados }) {
  const sigs = significadosEspecificos(pilares);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {ORDEM_PILARES.map((p) => (
        <section key={p}>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 10,
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: '1.3rem', color: PILAR_META[p].cor }}>
              {PILAR_META[p].icone}
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-cinzel, serif)',
                fontSize: '1.05rem',
                color: C.txtPri,
                margin: 0,
                letterSpacing: '0.04em',
              }}
            >
              {PILAR_META[p].nome}
            </h2>
            <span
              style={{
                fontSize: '0.7rem',
                color: C.txtMut,
                letterSpacing: '0.06em',
              }}
            >
              · {PILAR_META[p].subtitulo}
            </span>
          </div>
          <SignificadoPilar
            significado={sigs[p]}
            cor={PILAR_META[p].cor}
            sexualidade={
              p === 'astrologia'
                ? {
                    lilith_signo: pilares.astrologia.lilith_signo,
                    casa_8_signo: pilares.astrologia.casa_8_signo,
                  }
                : undefined
            }
          />
        </section>
      ))}
    </div>
  );
}

function CardFallback({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'rgba(11,14,28,0.6)',
        border: `1px solid ${C.txtMut}33`,
        borderLeft: `3px solid ${C.txtMut}`,
        borderRadius: 12,
        padding: '1.2rem 1.3rem',
      }}
    >
      {children}
    </div>
  );
}
