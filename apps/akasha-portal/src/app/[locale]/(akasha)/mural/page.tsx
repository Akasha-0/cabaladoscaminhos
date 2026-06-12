/**
 * Mural coletivo — F-234
 *
 * Página dedicada ao Mural coletivo: o ciclo de 260 dias (Tzolkin-inspired)
 * que todos os usuários do Akasha compartilham HOJE. Não é horóscopo
 * nem destino — é cadência coletiva, ritmo compartilhado.
 *
 * Estrutura:
 *   1. Hero com kin HOJE (número 1-260 + Família Terrestre)
 *   2. 4 Portais Especiais (8, 9, 17, 18) — próximos 30 dias
 *   3. Cadência (dias até o próximo ciclo)
 *   4. 5 Famílias Terrestres (qualidade de cada uma)
 *   5. Aviso ético (R-022 §5.2 — tradição maia é viva, não apropriamos)
 *   6. Cross-ref com seu Pilar pessoal (qual Família ressoa com seu Pilar)
 *
 * Server component — não há chat, não há LLM, é cadência curada.
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { kinDaData, familias, type KinTzolkin } from '@/lib/grimoire/mural-tzolkin';
import { significadoGenericoDoPilar, type Pilar } from '@/lib/grimoire/significados-curados';

export const metadata = {
  title: 'Mural Coletivo',
  description: 'O ciclo de 260 dias que compartilhamos — cadência coletiva Akasha.',
};

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

/** Mapeia cada Família Terrestre para um Pilar que mais ressoa. */
const FAMILIA_PILAR: Record<string, { pilar: Pilar; justificativa: string }> = {
  cardinal: { pilar: 'tantrica', justificativa: 'Cardinal inicia — Tantra inicia, corpo em movimento.' },
  polar:    { pilar: 'cabala',   justificativa: 'Polar equilibra — Cabala equilibra opostos na geometria numerológica.' },
  eletrico: { pilar: 'iching',   justificativa: 'Elétrico conecta — I Ching é mutação constante.' },
  solar:    { pilar: 'astrologia', justificativa: 'Solar ilumina — Astrologia ilumina o céu.' },
  espectral: { pilar: 'odu', justificativa: 'Espectral dissolve — Odu carrega ancestralidade e transformação.' },
};

function proximosPortais(hoje: KinTzolkin, dias: number): Array<{ kin: number; nome: string; em: number }> {
  // Devolve os 4 portais mais próximos nos próximos `dias` dias
  const result: Array<{ kin: number; nome: string; em: number }> = [];
  for (let i = 0; i <= dias; i++) {
    const futuro = kinDaData(new Date(Date.now() + i * 86400000));
    if (futuro.eh_portal && futuro.portal_nome) {
      result.push({ kin: futuro.posicao_no_ciclo, nome: futuro.portal_nome, em: i });
      if (result.length >= 4) break;
    }
  }
  return result;
}

export default async function MuralPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('akasha_session')?.value;

  const hoje = kinDaData();
  const fams = familias();
  const portais = proximosPortais(hoje, 60);
  const ref = FAMILIA_PILAR[hoje.familia];
  const pilarResonante = significadoGenericoDoPilar(ref.pilar);

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
            Mural · 260 dias
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
            O ciclo que compartilhamos
          </h1>
          <p style={{ color: C.txtSec, fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
            Cada dia é 1 kin de 260. Hoje é o kin <strong>{hoje.posicao_no_ciclo}</strong> do
            ciclo atual. Faltam <strong>{hoje.dias_ate_proximo_ciclo}</strong> dias para o
            próximo ciclo começar. Você está no kin junto com cada pessoa
            que usa o Akasha hoje.
          </p>
        </header>

        {/* Hero do kin HOJE */}
        <section
          data-familia={hoje.familia}
          data-eh-portal={hoje.eh_portal || undefined}
          style={{
            background: `linear-gradient(135deg, ${hoje.familia_cor}15 0%, transparent 100%)`,
            border: `1px solid ${hoje.familia_cor}44`,
            borderLeft: `3px solid ${hoje.familia_cor}`,
            borderRadius: 12,
            padding: '1.5rem 1.6rem',
            marginBottom: 18,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
            <span
              style={{
                fontFamily: 'var(--font-cinzel, serif)',
                fontSize: '2.4rem',
                color: hoje.familia_cor,
                lineHeight: 1,
              }}
            >
              {hoje.posicao_no_ciclo}
            </span>
            <span style={{ fontSize: '0.8rem', color: C.txtSec }}>
              / 260 · Família <strong style={{ color: hoje.familia_cor }}>{hoje.familia_nome}</strong>
            </span>
            {hoje.eh_portal && (
              <span
                style={{
                  fontSize: '0.6rem',
                  color: '#F0B429',
                  border: '1px solid rgba(240,180,41,0.4)',
                  borderRadius: 4,
                  padding: '1px 6px',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginLeft: 'auto',
                }}
              >
                ⚡ Portal — {hoje.portal_nome}
              </span>
            )}
          </div>
          <p
            style={{
              color: C.txtPri,
              fontSize: '0.95rem',
              lineHeight: 1.5,
              margin: 0,
              fontFamily: 'var(--font-lora, serif)',
            }}
          >
            {hoje.familia_qualidade}
          </p>
        </section>

        {/* Cadência */}
        <section
          style={{
            background: 'rgba(11,14,28,0.6)',
            border: '1px solid #141A33',
            borderRadius: 10,
            padding: '1rem 1.2rem',
            marginBottom: 18,
          }}
        >
          <span
            style={{
              fontSize: '0.7rem',
              color: C.txtMut,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            Cadência
          </span>
          <div
            style={{
              marginTop: 10,
              height: 8,
              background: 'rgba(20,26,51,0.8)',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${((hoje.posicao_no_ciclo - 1) / 260) * 100}%`,
                background: `linear-gradient(90deg, ${hoje.familia_cor}, ${C.aurora})`,
                transition: 'width 0.6s ease',
              }}
            />
          </div>
          <p style={{ color: C.txtSec, fontSize: '0.78rem', marginTop: 8, marginBottom: 0 }}>
            {hoje.dias_ate_proximo_ciclo === 1
              ? 'Amanhã começa um novo ciclo de 260 dias.'
              : `Faltam ${hoje.dias_ate_proximo_ciclo} dias para o novo ciclo.`}
          </p>
        </section>

        {/* Portais Especiais (próximos 60 dias) */}
        {portais.length > 0 && (
          <section style={{ marginBottom: 18 }}>
            <h2
              style={{
                fontFamily: 'var(--font-cinzel, serif)',
                fontSize: '1.1rem',
                color: C.txtPri,
                margin: '0 0 8px',
                letterSpacing: '0.04em',
              }}
            >
              Próximos portais (8, 9, 17, 18)
            </h2>
            <p style={{ color: C.txtSec, fontSize: '0.78rem', lineHeight: 1.5, margin: '0 0 10px' }}>
              Dias de transição coletiva. Marque-os no seu calendário.
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 8,
              }}
            >
              {portais.map((p) => (
                <div
                  key={p.kin}
                  style={{
                    background: 'rgba(240,180,41,0.08)',
                    border: '1px solid rgba(240,180,41,0.3)',
                    borderLeft: '3px solid #F0B429',
                    borderRadius: 8,
                    padding: '0.7rem 0.85rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.7rem',
                      color: '#F0B429',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    ⚡ Em {p.em} {p.em === 1 ? 'dia' : 'dias'}
                  </span>
                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: C.txtPri,
                      margin: '4px 0 0',
                      fontWeight: 600,
                    }}
                  >
                    {p.nome}
                  </p>
                  <p style={{ fontSize: '0.65rem', color: C.txtMut, margin: '2px 0 0' }}>
                    kin {p.kin} de 260
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5 Famílias */}
        <section style={{ marginBottom: 18 }}>
          <h2
            style={{
              fontFamily: 'var(--font-cinzel, serif)',
              fontSize: '1.1rem',
              color: C.txtPri,
              margin: '0 0 8px',
              letterSpacing: '0.04em',
            }}
          >
            5 Famílias Terrestres
          </h2>
          <p style={{ color: C.txtSec, fontSize: '0.78rem', lineHeight: 1.5, margin: '0 0 10px' }}>
            O ciclo de 260 divide-se em 5 fases de 52 dias. Você atravessa
            cada Família a cada ~52 dias.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 8,
            }}
          >
            {fams.map((f) => {
              const isActive = f.id === hoje.familia;
              return (
                <div
                  key={f.id}
                  data-active={isActive || undefined}
                  style={{
                    background: isActive ? `${f.cor}15` : 'rgba(11,14,28,0.5)',
                    border: `1px solid ${isActive ? f.cor : C.txtMut + '33'}`,
                    borderLeft: `3px solid ${f.cor}`,
                    borderRadius: 8,
                    padding: '0.6rem 0.8rem',
                  }}
                >
                  <strong
                    style={{
                      fontSize: '0.85rem',
                      color: isActive ? f.cor : C.txtPri,
                    }}
                  >
                    {f.nome}
                  </strong>
                  <p style={{ fontSize: '0.72rem', color: C.txtSec, margin: '4px 0 0' }}>
                    {f.qualidade}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Cross-ref com Pilar pessoal */}
        <section
          style={{
            background: 'rgba(124,92,255,0.08)',
            border: '1px solid rgba(124,92,255,0.3)',
            borderLeft: '3px solid #7C5CFF',
            borderRadius: 10,
            padding: '1rem 1.2rem',
            marginBottom: 18,
          }}
        >
          <span
            style={{
              fontSize: '0.7rem',
              color: C.violeta,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            O que este kin ressoa com seu Pilar
          </span>
          <p style={{ color: C.txtPri, fontSize: '0.85rem', lineHeight: 1.5, margin: '6px 0 0' }}>
            {ref.justificativa}
          </p>
          <p
            style={{
              color: C.txtSec,
              fontSize: '0.78rem',
              lineHeight: 1.5,
              margin: '6px 0 0',
              fontFamily: 'var(--font-lora, serif)',
              fontStyle: 'italic',
            }}
          >
            {pilarResonante.essencia}
          </p>
        </section>

        {/* Aviso ético (R-022 §5.2) */}
        <section
          style={{
            marginTop: 24,
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
            Aviso ético
          </span>
          <p style={{ color: C.txtSec, fontSize: '0.8rem', lineHeight: 1.5, margin: '6px 0 0' }}>
            O Mural é uma cadência NUMÉRICA inspirada no Tzolkin (260 dias),
            sem apropriação dos rituais, símbolos sagrados ou cosmologia
            do povo maia. Para estudar a tradição viva, consulte comunidades
            maias de referência (R-022 §5.2).
          </p>
        </section>

        {!token && (
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Link
              href={`/${locale}/mapa/significado`}
              style={{
                color: C.txtSec,
                fontSize: '0.85rem',
                textDecoration: 'none',
                borderBottom: `1px dashed ${C.txtMut}`,
                paddingBottom: 2,
              }}
            >
              ← Voltar para Significado do Mapa
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
