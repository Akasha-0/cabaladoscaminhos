/**
 * InsightDoDiaPanel — F-230
 *
 * Hero component que renderiza o Insight do Dia em destaque no topo de
 * /mapa/significado. Visual: card grande com glow, 1 título curto,
 * 1 síntese em 2-3 frases, 1 prática do dia.
 *
 * F-232 (Conexões entre Pilares) também é renderizado: matriz 5×5
 * mostrando como cada Pilar fala com os outros 4.
 */
import { type ConexaoPilar } from '@/lib/grimoire/conexoes-pilares';
import { type InsightDoDia } from '@/lib/grimoire/insight-do-dia';
import { type Pilar } from '@/lib/grimoire/significados-curados';

const C = {
  violeta: '#7C5CFF',
  aurora: '#2DD4BF',
  dourado: '#F0B429',
  magenta: '#FB5781',
  ocre: '#A0763A',
  txtPri: '#F4F5FF',
  txtSec: '#A7AECF',
  txtMut: '#5C6691',
} as const;

const CORES_DIMENSAO: Record<Pilar, string> = {
  cabala: C.violeta,
  astrologia: C.aurora,
  tantrica: C.dourado,
  odu: C.magenta,
  iching: C.ocre,
};

const DIMENSAO_NOME: Record<Pilar, string> = {
  cabala: 'Ancestralidade',
  astrologia: 'Movimento Celeste',
  tantrica: 'Corpo & Energia',
  odu: 'Ancestralidade',
  iching: 'Mutação do Caminho',
};

export function InsightDoDiaPanel({ insight }: { insight: InsightDoDia }) {
  return (
    <section
      data-pilares-destacados={insight.pilares_destacados.join(',')}
      style={{
        background: 'linear-gradient(135deg, rgba(124,92,255,0.12) 0%, rgba(45,212,191,0.08) 100%)',
        border: '1px solid rgba(124,92,255,0.3)',
        borderRadius: 16,
        padding: '1.5rem 1.6rem',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at top right, rgba(240,180,41,0.15) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <span
          style={{
            fontSize: '0.7rem',
            color: '#A7AECF',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          ✦ Insight do dia · síntese Akasha
        </span>
        <h2
          style={{
            fontFamily: 'var(--font-cinzel, serif)',
            color: '#F4F5FF',
            fontSize: '1.5rem',
            margin: '8px 0 12px',
            lineHeight: 1.2,
          }}
        >
          {insight.titulo_curto}
        </h2>
        <p
          style={{
            color: '#F4F5FF',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            margin: 0,
            fontFamily: 'var(--font-lora, serif)',
            maxHeight: '4.8rem',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            textOverflow: 'ellipsis',
          }}
        >
          {insight.sintese}
        </p>
        <div
          style={{
            marginTop: 14,
            padding: '10px 14px',
            background: 'rgba(45,212,191,0.08)',
            borderLeft: '3px solid #2DD4BF',
            borderRadius: 6,
          }}
        >
          <span
            style={{
              fontSize: '0.65rem',
              color: '#2DD4BF',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            ▸ Prática do dia · 3-5 min
          </span>
          <p style={{ color: '#F4F5FF', fontSize: '0.85rem', lineHeight: 1.5, margin: '4px 0 0' }}>
            {insight.pratica_do_dia}
          </p>
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {insight.pilares_destacados.map((p) => (
            <span
              key={p}
              style={{
                fontSize: '0.65rem',
                color: CORES_DIMENSAO[p],
                border: `1px solid ${CORES_DIMENSAO[p]}55`,
                borderRadius: 4,
                padding: '2px 8px',
                letterSpacing: '0.05em',
              }}
            >
              {DIMENSAO_NOME[p]}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ConexoesPilaresPanel({ conexoes }: { conexoes: ConexaoPilar[] }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      {conexoes.map((c) => (
        <article
          aria-label={`Conexão ${c.origem} → ${c.destino}: ${c.frase.slice(0, 40)}`}
          key={`${c.origem}-${c.destino}`}
          style={{
            background: `${CORES_DIMENSAO[c.origem]}0a`,
            border: `1px solid ${CORES_DIMENSAO[c.origem]}33`,
            borderLeft: `3px solid ${CORES_DIMENSAO[c.origem]}`,
            borderRadius: 8,
            padding: '0.7rem 0.85rem',
          }}
        >
          <div
            style={{
              fontSize: '0.7rem',
              color: '#A7AECF',
              letterSpacing: '0.08em',
              marginBottom: 4,
            }}
          >
            <span style={{ color: CORES_DIMENSAO[c.origem], fontWeight: 600 }}>
              {DIMENSAO_NOME[c.origem]}
            </span>
            <span style={{ margin: '0 6px' }}>→</span>
            <span style={{ color: CORES_DIMENSAO[c.destino], fontWeight: 600 }}>
              {DIMENSAO_NOME[c.destino]}
            </span>
          </div>
          <p
            style={{
              color: '#F4F5FF',
              fontSize: '0.82rem',
              lineHeight: 1.5,
              margin: 0,
              fontFamily: 'var(--font-lora, serif)',
            }}
          >
            {c.frase}
          </p>
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.6rem', color: '#5C6691', fontStyle: 'italic' }}>
              via {c.fonte}
            </span>
            {c.requer_terreiro && (
              <span
                style={{
                  fontSize: '0.6rem',
                  color: '#FB5781',
                  border: '1px solid rgba(251,87,129,0.4)',
                  borderRadius: 3,
                  padding: '0px 4px',
                }}
                title="Interpretação profunda requer babalaô/yaô (R-022 §4.4)"
              >
                ⚠ terreiro
              </span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
