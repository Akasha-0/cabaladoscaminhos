/**
 * DimensaoCard — F-223 v2
 *
 * Card expansível para uma dimensão de vida na página "Caixa" Akasha.
 * Mobile-first: accordion vertical.
 * Desktop: grid 3x3 com cards expandidos.
 *
 * v2: renderiza markdown simples (**bold**, \n\n = parágrafos)
 */

'use client';

import { useState } from 'react';
import type { DimensaoSintese } from '@/lib/grimoire/synthesis/synthesizer';
import { DIMENSAO_BG, DIMENSAO_BORDER, DIMENSAO_POR_ID } from '@/lib/grimoire/synthesis/dimensoes';



export interface DimensaoCardProps {
  sintese: DimensaoSintese;
  /** Index para animação de entrada escalonada */
  index: number;
}

// ─── Markdown-like renderer ────────────────────────────────────────────────

/** Converte **bold** → <strong> e \n\n → parágrafos. */
function renderNarrative(text: string): React.ReactNode[] {
  if (!text) return [];
  const paragraphs = text.split('\n\n').filter(Boolean);
  return paragraphs.map((para, i) => {
    // Substitui **termo** por <strong>termo</strong>
    const parts = para.split(/\*\*(.+?)\*\*/g);
    const isBold = parts.length > 1;
    if (!isBold) {
      return (
        <span key={i} style={{ display: 'block', marginBottom: 4 }}>
          {para}
        </span>
      );
    }
    return (
      <span key={i} style={{ display: 'block', marginBottom: 4 }}>
        {parts.map((part, j) =>
          j % 2 === 1 ? (
            <strong key={j} style={{ color: '#E8D0FF' }}>
              {part}
            </strong>
          ) : (
            <span key={j}>{part}</span>
          )
        )}
      </span>
    );
  });
}

// ─── Componente ────────────────────────────────────────────────────────────

export function DimensaoCard({ sintese, index }: DimensaoCardProps) {
  const [aberto, setAberto] = useState(false);

  const dimensao = DIMENSAO_POR_ID[sintese.dimensoesId];

  return (
    <article
      onClick={() => setAberto((v) => !v)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setAberto((v) => !v);
        }
      }}
      role="button"
      tabIndex={0}
      aria-expanded={aberto}
      style={{
        background: DIMENSAO_BG[sintese.dimensoesId] ?? 'rgba(255,255,255,0.04)',
        border: `1px solid ${DIMENSAO_BORDER[sintese.dimensoesId] ?? 'rgba(255,255,255,0.1)'}`,
        borderRadius: 16,
        padding: '16px 20px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        opacity: 0,
        animation: `fadeSlideIn 0.4s ease ${index * 60}ms forwards`,
      } as React.CSSProperties}
    >
      {/* Header — sempre visível */}
      <header style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span
          style={{ fontSize: '1.4rem', color: sintese.chakraCor, lineHeight: 1, flexShrink: 0 }}
          aria-hidden
        >
          {sintese.icone}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontFamily: 'var(--font-cinzel, serif)',
              fontSize: '1rem',
              color: '#E8E0FF',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {sintese.titulo}
          </h3>
          {dimensao?.descricao && (
            <p style={{ fontSize: '0.78rem', color: 'rgba(232,224,255,0.5)', margin: '3px 0 0', lineHeight: 1.3 }}>
              {dimensao.descricao}
            </p>
          )}
        </div>
        <span
          style={{
            color: 'rgba(232,224,255,0.4)',
            fontSize: '1rem',
            transition: 'transform 0.2s ease',
            transform: aberto ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0,
          }}
          aria-hidden
        >
          ▼
        </span>
      </header>

      {/* Síntese narrativa — visível mesmo fechado */}
      {/* Renderiza apenas o primeiro parágrafo quando fechado */}
      <div
        style={{
          marginTop: 10,
          fontSize: '0.88rem',
          color: 'rgba(232,224,255,0.75)',
          lineHeight: 1.5,
          overflow: 'hidden',
          maxHeight: aberto ? 'none' : '3.6em',
          maskImage: aberto ? 'none' : 'linear-gradient(to bottom, black 50%, transparent 100%)',
          WebkitMaskImage: aberto ? 'none' : 'linear-gradient(to bottom, black 50%, transparent 100%)',
        }}
      >
        {renderNarrative(sintese.synthes)}
      </div>

      {/* Conteúdo expandido */}
      {aberto && (
        <div
          style={{
            marginTop: 14,
            paddingTop: 14,
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {/* Narrativa completa */}
          <section>
            <div
              style={{
                fontSize: '0.88rem',
                color: 'rgba(232,224,255,0.8)',
                lineHeight: 1.6,
              }}
            >
              {renderNarrative(sintese.synthes)}
            </div>
          </section>

          {/* Prática */}
          {sintese.praktika && (
            <section>
              <h4 style={{ fontSize: '0.72rem', color: 'rgba(232,224,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 6px' }}>
                ▸ Prática de hoje
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'rgba(232,224,255,0.75)', lineHeight: 1.5, margin: 0 }}>
                {sintese.praktika}
              </p>
            </section>
          )}

          {/* Alerta */}
          {sintese.alerta && (
            <section>
              <h4 style={{ fontSize: '0.72rem', color: 'rgba(255,180,100,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 6px' }}>
                ⚠ Atenção
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,200,150,0.75)', lineHeight: 1.5, margin: 0 }}>
                {sintese.alerta}
              </p>
            </section>
          )}

          {/* Akasha Authority */}
          {sintese.autoridadeAkasha.aplicavel && (
            <section
              style={{
                background: 'rgba(255,200,80,0.06)',
                border: '1px solid rgba(255,200,80,0.15)',
                borderRadius: 10,
                padding: '10px 14px',
              }}
            >
              <h4 style={{ fontSize: '0.72rem', color: 'rgba(255,200,80,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 6px' }}>
                ⚖ Akasha Authority
              </h4>
              <p style={{ fontSize: '0.83rem', color: 'rgba(255,220,150,0.85)', lineHeight: 1.5, margin: 0 }}>
                Antes de decidir nesta área: pergunte — isso vem da sua paz interior ou da sua ansiedade?{' '}
                Se ansiedade, <strong style={{ color: '#FFD080' }}>espere</strong>. Se paz,{' '}
                <strong style={{ color: '#FFD080' }}>aja</strong>.
                {sintese.autoridadeAkasha.timing && (
                  <span style={{ display: 'block', marginTop: 4, opacity: 0.75 }}>
                    ⏰ {sintese.autoridadeAkasha.timing}
                  </span>
                )}
              </p>
            </section>
          )}
        </div>
      )}
    </article>
  );
}
