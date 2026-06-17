/**
 * Foco do Dia — F-239
 *
 * Página dedicada: o usuário ESCOLHE 1 Área da vida em que precisa de luz
 * HOJE (paz, saúde, relações, dinheiro, trabalho, propósito, criatividade,
 * espiritualidade, sexualidade). A página devolve 1 priorização:
 *
 *   - Acolhimento (1 linha)
 *   - O que o Pilar principal do dia diz PARA esta Área
 *   - Ecos dos outros 4 Pilares (1 linha cada)
 *   - Conexões que tocam esta Área
 *   - Sombra para observar
 *   - 1 Prática concreta de 3-5 min
 *
 * Server component. Reaproveita o módulo de Foco (`foco-area.ts`).
 * Cores por Pilar (mesma paleta da Mandala). Aviso ético Pilar 4.
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from '@/lib/application/auth/akasha-jwt';
import Link from 'next/link';
import { FocoDoDiaPanel } from '@/components/akasha/FocoDoDiaPanel';
import { gerarFocoDoDia } from '@/lib/grimoire/foco-area';
import { AREAS, AREA_LABEL, AREA_ICONE, type Area } from '@/lib/grimoire/traducao-areas';
import type { Pilar } from '@/lib/grimoire/significados-curados';

const C = {
  violeta: '#7C5CFF',
  aurora: '#2DD4BF',
  dourado: '#F0B429',
  magenta: '#FB5781',
  ocre: '#A0763A',
  bgVoid: '#06070F',
  txtPri: '#F4F5FF',
  txtSec: '#A7AECF',
  txtMut: '#5C6691',
} as const;

const PILARES_VALIDOS: Pilar[] = ['cabala', 'astrologia', 'tantrica', 'odu', 'iching'];
const PILAR_CORES: Record<Pilar, string> = {
  cabala: C.violeta, astrologia: C.aurora, tantrica: C.dourado, odu: C.magenta, iching: C.ocre,
};

const PILAR_LABEL: Record<Pilar, string> = {
  cabala: 'Cabala', astrologia: 'Astrologia', tantrica: 'Tântrica', odu: 'Odu', iching: 'I Ching',
};

type MandatoEsqueleto = {
  escala: 'D' | 'S' | 'Z' | 'V';
  pilares_relevantes: string[];
  redacao_bruta: string;
  cita_fontes: string[];
};
type MentorHook = {
  intencao: string | null;
  crise_detectada: boolean;
  recurso: string | null;
};
type MandatoDoDiaResponse = {
  date: string;
  mandato: MandatoEsqueleto;
  pilares: { cabala: { life_path: number }; astrologia: { sol_signo: string }; tantrica: { corpo_predominante: number }; odu: { odu_principal: string }; iching: { hexagrama_dia: number } };
  mentor_hook: MentorHook;
};

function areaFromParam(s: string | undefined): Area | null {
  if (!s) return null;
  return (AREAS as readonly string[]).includes(s) ? (s as Area) : null;
}

export default async function FocoPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ area?: string }>;
}) {
  const { locale } = await params;
  const { area: areaParam } = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get(AKASHA_TOKEN_COOKIE)?.value;
  if (!verifyAkashaToken(token, 'access')) redirect(`/${locale}/login`);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/akasha/mandato-do-dia`,
    { headers: { Cookie: `akasha_session=${token}` }, cache: 'no-store' }
  );
  if (res.status === 401 || res.status === 404) redirect(`/${locale}/login`);
  if (!res.ok) {
    return <FocoFallback />;
  }

  const data: MandatoDoDiaResponse = await res.json();
  const pilarPrincipalStr = data.mandato.pilares_relevantes[0] ?? 'cabala';
  const pilar: Pilar = (PILARES_VALIDOS as readonly string[]).includes(pilarPrincipalStr)
    ? (pilarPrincipalStr as Pilar)
    : 'cabala';
  const cor = PILAR_CORES[pilar];
  const area: Area = areaFromParam(areaParam) ?? 'paz';

  const foco = gerarFocoDoDia(pilar, area);

  return (
    <main
      style={{
        background: C.bgVoid,
        minHeight: 'calc(100vh - 56px)',
        padding: '32px 20px 80px',
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <header style={{ marginBottom: 24 }}>
          <span
            style={{
              fontSize: '0.7rem',
              color: C.txtMut,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            Diário · foco
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-cinzel, serif)',
              color: C.txtPri,
              fontSize: '1.7rem',
              margin: '8px 0 6px',
              lineHeight: 1.2,
            }}
          >
            Onde precisa de luz HOJE?
          </h1>
          <p style={{ color: C.txtSec, fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
            Você vive em áreas — paz, saúde, relações, dinheiro, trabalho, propósito,
            criatividade, espiritualidade, sexualidade. Escolha 1 e medite o que seu
            mapa diz para ela hoje.
          </p>
          <p
            style={{
              color: C.txtMut,
              fontSize: '0.75rem',
              margin: '6px 0 0',
            }}
          >
            Pilar principal HOJE:{' '}
            <span style={{ color: cor, fontWeight: 600 }}>{PILAR_LABEL[pilar]}</span>
          </p>
        </header>

        {/* Seletor de Área (9 chips clicáveis) */}
        <section style={{ marginBottom: 24 }}>
          <h2
            style={{
              fontSize: '0.7rem',
              color: C.txtMut,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              margin: '0 0 8px',
            }}
          >
            Escolha sua área
          </h2>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
            }}
          >
            {AREAS.map((a) => {
              const isActive = a === area;
              return (
                <Link
                  key={a}
                  href={`/${locale}/diario/foco?area=${a}`}
                  style={{
                    fontSize: '0.78rem',
                    color: isActive ? '#0B0E1C' : C.txtSec,
                    background: isActive ? cor : `${cor}10`,
                    border: `1px solid ${isActive ? cor : cor + '33'}`,
                    borderRadius: 100,
                    padding: '6px 14px',
                    textDecoration: 'none',
                    letterSpacing: '0.04em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span aria-hidden>{AREA_ICONE[a]}</span>
                  {AREA_LABEL[a]}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Foco do Dia */}
        <FocoDoDiaPanel foco={foco} />

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Link
            href={`/${locale}/diario`}
            style={{
              color: C.txtSec,
              fontSize: '0.85rem',
              textDecoration: 'none',
              borderBottom: `1px dashed ${C.txtMut}`,
              paddingBottom: 2,
            }}
          >
            ← Voltar para o Mandato do Dia
          </Link>
        </div>
      </div>
    </main>
  );
}

function FocoFallback() {
  return (
    <main style={{ background: C.bgVoid, minHeight: 'calc(100vh - 56px)', padding: '32px 20px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <p style={{ color: C.txtSec, lineHeight: 1.5 }}>
          Não conseguimos carregar seu mapa agora. Volte ao Mandato do Dia, que recalcula
          seu mapa. Se o problema persistir, verifique seus dados natais.
        </p>
      </div>
    </main>
  );
}
