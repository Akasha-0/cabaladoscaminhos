'use client';

/**
 * AkashaSignificadoCard — FASE 3 Ciclo 2
 *
 * Mostra a interpretação profunda do Número de Vida Akasha usando o modelo de 4 camadas:
 *   dado → significado → padrão → aplicação
 *
 * Segue a estrutura shadow/gift/siddhi (DEC-004) e cobre as 9 áreas da vida (DEC-005).
 *
 * Inspiração visual: benchmark Astrolink + Mirofox — cartões com profundidade prática,
 * não descrições rasas.
 *
 * DEC-004:shadow/gift/siddhi inspirado em Gene Keys (Richard Rudd).
 */

import { useState } from 'react';
import { interpretarVida } from '@akasha/core';
import type { AreaInterpretation, LifeArea, VidaInterpretation } from '@akasha/types';
type Nivel = 'shadow' | 'gift' | 'siddhi';

/** Áreas com aplicacao preenchida no motor de interpretação (7 de 9 áreas DEC-005).
 * familia e criatividade existem no tipo LifeArea mas não têm aplicacao em VIDA_CONTENT. */
const AREAS_WITH_DATA: LifeArea[] = ['proposito', 'carreira', 'financas', 'saude', 'relacionamentos', 'sexualidade', 'espiritualidade'];

const NIVEL_LABEL: Record<Nivel, { titulo: string; cor: string; emoji: string }> = {
  shadow: {
    titulo: 'Sombra',
    cor: '#c084fc',
    emoji: '◐',
  },
  gift: {
    titulo: 'Dom',
    cor: '#fbbf24',
    emoji: '◈',
  },
  siddhi: {
    titulo: 'Siddhi',
    cor: '#34d399',
    emoji: '◉',
  },
};

const NIVEL_DESCRICAO: Record<Nivel, string> = {
  shadow: 'O desafio — o padrão que se repete inconscientemente',
  gift: 'O presente — a qualidade que você irradia quando em plenitude',
  siddhi: 'A frequência — o estado onde o número e o ser são um',
};

interface Props {
  lifePath: number;
  /** Frequência dominante do perfil Akasha — usado como default for the nível */
  defaultNivel?: 'shadow' | 'gift' | 'siddhi';
}

export function AkashaSignificadoCard({ lifePath, defaultNivel = 'gift' }: Props) {
  const [nivel, setNivel] = useState<Nivel>(defaultNivel);
  const [area, setArea] = useState<LifeArea>('proposito');

  const vida: VidaInterpretation = interpretarVida(lifePath);
  const interp: AreaInterpretation = vida.levels[nivel] ?? vida.levels.gift;
  return (
    <section
      style={{
        background: 'rgba(124,92,255,0.07)',
        border: '1px solid rgba(124,92,255,0.25)',
        borderLeft: '3px solid #7c5cff',
        borderRadius: 16,
        padding: 'clamp(1rem, 4vw, 1.5rem) clamp(0.875rem, 3vw, 1.4rem)',
        marginBottom: 24,
        maxWidth: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: '1rem' }}>✦</span>
          <span
            style={{
              fontFamily: 'var(--font-cinzel, serif)',
              fontSize: '0.7rem',
              color: '#7c5cff',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
            }}
          >
            Akasha
          </span>
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-cinzel, serif)',
            fontSize: '1.2rem',
            color: '#e2e0f0',
            margin: '0 0 4px',
            lineHeight: 1.2,
          }}
        >
          {vida.arquetipoAkasha}
        </h2>

        <p
          style={{
            fontSize: '0.85rem',
            color: '#a09cb8',
            margin: 0,
            lineHeight: 1.5,
            fontStyle: 'italic',
          }}
        >
          {vida.mandato}
        </p>
      </div>


      {/* Attribution — DEC-004 */}
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: '0.68rem', color: '#6b6480', letterSpacing: '0.04em' }}>
          Inspirado em Gene Keys (Richard Rudd)
        </span>
      </div>

      {/* Seletor de Nível */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          marginBottom: 16,
          background: 'rgba(0,0,0,0.25)',
          borderRadius: 10,
          padding: 4,
        }}
      >
        {(['shadow', 'gift', 'siddhi'] as Nivel[]).map((n) => (
          <button
            key={n}
            onClick={() => setNivel(n)}
            style={{
              flex: 1,
              padding: '6px 8px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-cinzel, serif)',
              letterSpacing: '0.06em',
              background: nivel === n ? `rgba(${n === 'shadow' ? '124,92,255' : n === 'gift' ? '251,191,36' : '52,211,153'},0.2)` : 'transparent',
              color: nivel === n ? NIVEL_LABEL[n].cor : '#706686',
              borderBottom: nivel === n ? `2px solid ${NIVEL_LABEL[n].cor}` : '2px solid transparent',
              transition: 'all 0.2s ease',
            }}
          >
            {NIVEL_LABEL[n].emoji} {NIVEL_LABEL[n].titulo}
          </button>
        ))}
      </div>

      {/* Nível label + descrição */}
      <p
        style={{
          fontSize: '0.72rem',
          color: NIVEL_LABEL[nivel].cor,
          margin: '0 0 10px',
          letterSpacing: '0.04em',
        }}
      >
        {NIVEL_DESCRICAO[nivel]}
      </p>

      {/* Seletor de Área — P3: aplicacao por área da vida */}
      {interp.aplicacao && Object.keys(interp.aplicacao).length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
            {AREAS_WITH_DATA.map((a) => {
              if (!interp.aplicacao[a]) return null;
              return (
                <button
                  key={a}
                  onClick={() => setArea(a)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 20,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.68rem',
                    fontFamily: 'var(--font-cinzel, serif)',
                    letterSpacing: '0.04em',
                    background: area === a ? `${NIVEL_LABEL[nivel].cor}22` : 'rgba(255,255,255,0.06)',
                    color: area === a ? NIVEL_LABEL[nivel].cor : '#706686',
                    borderBottom: area === a ? `1.5px solid ${NIVEL_LABEL[nivel].cor}` : '1.5px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {a === 'proposito' ? '✦ Propósito' :
                   a === 'carreira' ? '◈ Carreira' :
                   a === 'financas' ? '◉ Finanças' :
                   a === 'saude' ? '◐ Saúde' :
                   a === 'relacionamentos' ? '◑ Relacionamentos' :
                   a === 'sexualidade' ? '✧ Sexualidade' :
                   a === 'espiritualidade' ? '✦ Espiritualidade' :
                   a}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Significado */}
      <div style={{ marginBottom: 14 }}>
        <p
          style={{
            fontSize: '0.88rem',
            color: '#c8c3dc',
            lineHeight: 1.65,
            margin: 0,
          }}
        >
          {interp.significado}
        </p>
      </div>

      {/* Aplicacao por Área — P3: como este número se manifesta na área selecionada */}
      {interp.aplicacao && interp.aplicacao[area] && (
        <div
          style={{
            background: `linear-gradient(135deg, ${NIVEL_LABEL[nivel].cor}10, ${NIVEL_LABEL[nivel].cor}05)`,
            border: `1px solid ${NIVEL_LABEL[nivel].cor}30`,
            borderRadius: 10,
            padding: '0.9rem 1rem',
            marginBottom: 14,
          }}
        >
          <p
            style={{
              fontSize: '0.68rem',
              color: NIVEL_LABEL[nivel].cor,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              margin: '0 0 8px',
              fontWeight: 600,
            }}
          >
            {area === 'proposito' ? '✦ No seu Propósito' :
             area === 'carreira' ? '◈ Na Carreira e Vocação' :
             area === 'financas' ? '◉ Nas Finanças e Prosperidade' :
             area === 'saude' ? '◐ Na Saúde e Corpo' :
             area === 'relacionamentos' ? '◑ Nos Relacionamentos' :
             area === 'sexualidade' ? '✧ Na Sexualidade' :
             area === 'espiritualidade' ? '✦ Na Espiritualidade' :
             '◑ Nos Relacionamentos'}
          </p>
          <p
            style={{
              fontSize: '0.82rem',
              color: '#c8c3dc',
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            {interp.aplicacao[area]}
          </p>
        </div>
      )}

      {/* Padrão */}
      <div
        style={{
          background: 'rgba(0,0,0,0.2)',
          borderRadius: 10,
          padding: '0.9rem 1rem',
          marginBottom: 14,
          borderLeft: `2px solid ${NIVEL_LABEL[nivel].cor}44`,
        }}
      >
        <p
          style={{
            fontSize: '0.72rem',
            color: NIVEL_LABEL[nivel].cor,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            margin: '0 0 6px',
            fontWeight: 600,
          }}
        >
          O seu padrão
        </p>
        <p
          style={{
            fontSize: '0.85rem',
            color: '#b8b3cc',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {interp.padrao}
        </p>
      </div>

      {/* Ações Práticas */}
      {interp.acaoPratica && (
        <div style={{ marginBottom: 14 }}>
          <p
            style={{
              fontSize: '0.72rem',
              color: '#9b93b8',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              margin: '0 0 8px',
              fontWeight: 600,
            }}
          >
            Prática esta semana
          </p>

          {interp.acaoPratica.amplificar.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  color: '#4ade80',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: 4,
                }}
              >
                Amplifique
              </span>
              {interp.acaoPratica.amplificar.map((item, i) => (
                <p
                  key={i}
                  style={{
                    fontSize: '0.82rem',
                    color: '#a8a3bc',
                    lineHeight: 1.5,
                    margin: '2px 0',
                    paddingLeft: 12,
                  }}
                >
                  → {item}
                </p>
              ))}
            </div>
          )}

          {interp.acaoPratica.evitar.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  color: '#f87171',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: 4,
                }}
              >
                Evite
              </span>
              {interp.acaoPratica.evitar.map((item, i) => (
                <p
                  key={i}
                  style={{
                    fontSize: '0.82rem',
                    color: '#a8a3bc',
                    lineHeight: 1.5,
                    margin: '2px 0',
                    paddingLeft: 12,
                  }}
                >
                  ✕ {item}
                </p>
              ))}
            </div>
          )}

          {interp.acaoPratica.ritual && (
            <div
              style={{
                background: 'rgba(124,92,255,0.08)',
                borderRadius: 8,
                padding: '0.7rem 0.9rem',
                marginTop: 6,
              }}
            >
              <span
                style={{
                  fontSize: '0.72rem',
                  color: '#7c5cff',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: 4,
                }}
              >
                Ritual mínimo
              </span>
              <p
                style={{
                  fontSize: '0.82rem',
                  color: '#b8b3cc',
                  lineHeight: 1.5,
                  margin: 0,
                  fontStyle: 'italic',
                }}
              >
                {interp.acaoPratica.ritual}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Afirmação */}
      {interp.afirmacao && (
        <div
          style={{
            background: `linear-gradient(135deg, ${NIVEL_LABEL[nivel].cor}12, ${NIVEL_LABEL[nivel].cor}06)`,
            borderRadius: 10,
            padding: '0.9rem 1rem',
            borderLeft: `3px solid ${NIVEL_LABEL[nivel].cor}`,
          }}
        >
          <p
            style={{
              fontSize: '0.72rem',
              color: NIVEL_LABEL[nivel].cor,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              margin: '0 0 6px',
              fontWeight: 600,
            }}
          >
            Afirmação
          </p>
          <p
            style={{
              fontSize: '0.88rem',
              color: '#d4d0e8',
              lineHeight: 1.55,
              margin: 0,
              fontStyle: 'italic',
            }}
          >
            &ldquo;{interp.afirmacao}&rdquo;
          </p>
        </div>
      )}
    </section>
  );
}
