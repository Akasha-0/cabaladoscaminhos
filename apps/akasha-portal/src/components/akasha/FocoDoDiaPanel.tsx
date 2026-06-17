/**
 * FocoDoDiaPanel — F-239
 *
 * Painel que mostra o Foco do Dia para 1 Área escolhida:
 *   - Acolhimento (1 linha)
 *   - Mensagem do Pilar principal PARA esta Área
 *   - Ecos dos outros 4 Pilares (1 linha cada)
 *   - Conexões que tocam esta Área
 *   - Sombra + Prática (3-5 min)
 *
 * Visual: card grande com glow, mesma paleta dos Pilares.
 */

import { type FocoDoDia } from '@/lib/grimoire/foco-area';
import { AREA_LABEL, AREA_ICONE } from '@/lib/grimoire/traducao-areas';

const DIMENSAO_NOME = {
  cabala: 'Ancestralidade',
  astrologia: 'Movimento Celeste',
  tantrica: 'Corpo & Energia',
  odu: 'Ancestralidade',
  iching: 'Mutação do Caminho',
} as const;

const CORES_DIMENSAO = {
  cabala: '#7C5CFF',
  astrologia: '#2DD4BF',
  tantrica: '#F0B429',
  odu: '#FB5781',
  iching: '#A0763A',
} as const;

export function FocoDoDiaPanel({ foco }: { foco: FocoDoDia }) {
  const cor = CORES_DIMENSAO[foco.pilar];
  return (
    <article
      data-pilar={foco.pilar}
      data-area={foco.area}
      style={{
        background: `linear-gradient(135deg, ${cor}12 0%, transparent 60%)`,
        border: `1px solid ${cor}55`,
        borderRadius: 14,
        padding: '1.4rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* Acolhimento */}
      <p
        style={{
          fontSize: '0.85rem',
          color: '#A7AECF',
          fontStyle: 'italic',
          margin: 0,
          lineHeight: 1.5,
          fontFamily: 'var(--font-lora, serif)',
        }}
      >
        {foco.acolhimento}
      </p>

      {/* Header: Pilar + Área */}
      <header>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
          <span aria-hidden style={{ fontSize: '1.4rem', color: cor, lineHeight: 1 }}>
            {AREA_ICONE[foco.area]}
          </span>
          <h3
            style={{
              fontFamily: 'var(--font-cinzel, serif)',
              fontSize: '1.05rem',
              color: '#F4F5FF',
              margin: 0,
              letterSpacing: '0.04em',
            }}
          >
            HOJE · {AREA_LABEL[foco.area]}
          </h3>
          <span style={{ fontSize: '0.65rem', color: cor, letterSpacing: '0.08em' }}>
            · {DIMENSAO_NOME[foco.pilar]}
          </span>
          {foco.requer_terreiro && (
            <span
              style={{
                fontSize: '0.6rem',
                color: '#FB5781',
                border: '1px solid rgba(251,87,129,0.4)',
                borderRadius: 3,
                padding: '0px 4px',
                marginLeft: 'auto',
              }}
              title="Interpretação profunda requer babalaô/yaô (R-022 §4.4)"
            >
              ⚠ terreiro
            </span>
          )}
        </div>
      </header>

      {/* Mensagem do Pilar principal */}
      <section
        style={{
          background: `${cor}10`,
          borderLeft: `3px solid ${cor}`,
          borderRadius: 8,
          padding: '10px 14px',
        }}
      >
        <span
          style={{
            fontSize: '0.65rem',
            color: cor,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          O que {DIMENSAO_NOME[foco.pilar]} diz para você HOJE
        </span>
        <p
          style={{
            color: '#F4F5FF',
            fontSize: '0.95rem',
            lineHeight: 1.55,
            margin: '4px 0 0',
            fontFamily: 'var(--font-lora, serif)',
          }}
        >
          {foco.mensagem_pilar}
        </p>
      </section>

      {/* Ecos dos outros 4 Pilares */}
      {foco.ecos_dos_pilares.length > 0 && (
        <section>
          <span
            style={{
              fontSize: '0.65rem',
              color: '#A7AECF',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            Ecos das outras Dimensões
          </span>
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {foco.ecos_dos_pilares.map((eco, i) => (
              <p
                key={i}
                style={{
                  color: '#D5D7F0',
                  fontSize: '0.78rem',
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {eco}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Conexões que tocam esta Área */}
      {foco.conexoes.length > 0 && (
        <section>
          <span
            style={{
              fontSize: '0.65rem',
              color: '#A7AECF',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            Como as Dimensões se FALAM sobre {AREA_LABEL[foco.area]}
          </span>
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {foco.conexoes.map((c) => (
              <p
                key={`${c.origem}-${c.destino}`}
                style={{
                  color: '#A7AECF',
                  fontSize: '0.78rem',
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                <span style={{ color: CORES_DIMENSAO[c.origem] }}>{DIMENSAO_NOME[c.origem]}</span>
                <span style={{ margin: '0 6px' }}>→</span>
                <span style={{ color: CORES_DIMENSAO[c.destino] }}>{DIMENSAO_NOME[c.destino]}</span>
                : {c.frase}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Sombra */}
      <section>
        <span
          style={{
            fontSize: '0.65rem',
            color: '#A7AECF',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          ⚠ Sombra para observar
        </span>
        <p
          style={{
            color: '#A7AECF',
            fontSize: '0.82rem',
            lineHeight: 1.5,
            margin: '4px 0 0',
            fontStyle: 'italic',
          }}
        >
          {foco.sombra}
        </p>
      </section>

      {/* Prática */}
      <section
        style={{
          background: 'rgba(45,212,191,0.08)',
          borderLeft: '3px solid #2DD4BF',
          borderRadius: 6,
          padding: '10px 14px',
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
          ▸ Prática · 3-5 min
        </span>
        <p
          style={{
            color: '#F4F5FF',
            fontSize: '0.85rem',
            lineHeight: 1.5,
            margin: '4px 0 0',
          }}
        >
          {foco.pratica}
        </p>
      </section>
    </article>
  );
}
