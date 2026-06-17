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
import { ChevronDown, AlertTriangle, Scale, Clock } from 'lucide-react';



export interface DimensaoCardProps {
  sintese: DimensaoSintese;
  /** Index para animação de entrada escalonada */
  index: number;
  /** Locale para strings internacionalizadas (pt | en | es) */
  locale?: string;
}

// ─── Markdown-like renderer ────────────────────────────────────────────────

/** Converte **bold** → <strong> e \n\n → parágrafos. */
export function renderNarrative(text: string, skipFirst = false): React.ReactNode[] {
  if (!text) return [];
  const paragraphs = text.split('\n\n').filter(Boolean);
  const start = skipFirst && paragraphs.length > 1 ? 1 : 0;
  return paragraphs.slice(start).map((para, i) => {
    // Substitui **termo** por <strong>termo</strong>
    const parts = para.split(/\*\*(.+?)\*\*/g);
    const isBold = parts.length > 1;
    if (!isBold) {
      return (
        <p key={i} style={{ margin: '0 0 6px 0', lineHeight: 1.55 }}>
          {para}
        </p>
      );
    }
    return (
      <p key={i} style={{ margin: '0 0 6px 0', lineHeight: 1.55 }}>
        {parts.map((part, j) =>
          j % 2 === 1 ? (
            <strong key={j} style={{ color: '#E8D0FF' }}>
              {part}
            </strong>
          ) : (
            <span key={j}>{part}</span>
          )
        )}
      </p>
    );
  });
}

// ─── Componente ────────────────────────────────────────────────────────────

export function DimensaoCard({ sintese, index, locale = 'pt' }: DimensaoCardProps) {
  const [aberto, setAberto] = useState(false);

  const dimensao = DIMENSAO_POR_ID[sintese.dimensoesId];
  const HINT: Record<string, string> = {
    pt: 'Toque para ver mais',
    en: 'Tap to see more',
    es: 'Toca para ver más',
  };
  const hintTexto = locale in HINT ? HINT[locale] : HINT.pt;
  return (
    <article

      style={{
        background: DIMENSAO_BG[sintese.dimensoesId] ?? 'rgba(255,255,255,0.04)',
        border: `1px solid ${DIMENSAO_BORDER[sintese.dimensoesId] ?? 'rgba(255,255,255,0.1)'}`,
        borderRadius: 16,
        padding: '16px 20px',
        transition: 'all 0.2s ease',
        opacity: 0,
        animation: `fadeSlideIn 0.4s ease ${index * 60}ms forwards`,
      } as React.CSSProperties}
    >
      {/* Header — sempre visível */}
      <button
        id={`dim-btn-${index}`}
        onClick={() => setAberto((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setAberto((v) => !v);
          }
        }}
        aria-expanded={aberto}
        aria-controls={`dim-panel-${index}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          width: '100%',
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
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
          {sintese.descricao && (
            <p style={{ fontSize: '0.78rem', color: 'rgba(232,224,255,0.58)', margin: '3px 0 0', lineHeight: 1.3 }}>
              {sintese.descricao}{!aberto && <span style={{ color: 'rgba(124,92,255,0.5)' }}> · {hintTexto}</span>}
            </p>
          )}
        </div>
        <span
          style={{
            color: 'rgba(232,224,255,0.4)',
            fontSize: '1rem',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
          }}
          aria-hidden
        >
          <ChevronDown
            size={16}
            style={{
              color: 'rgba(232,224,255,0.4)',
              transform: aberto ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
              flexShrink: 0,
            }}
          />
        </span>
      </button>
      <div id={`dim-panel-${index}`} role="region" aria-labelledby={`dim-btn-${index}`}>

      {/* Síntese narrativa — visível mesmo fechado */}
      {/* Renderiza apenas o primeiro parágrafo quando fechado */}
            <div style={{ marginTop: 10, fontSize: '0.88rem', color: 'rgba(232,224,255,0.75)', lineHeight: 1.5 }}>
        {(() => {
          const paras = sintese.synthes ? sintese.synthes.split('\n\n').filter(Boolean) : [];
          if (paras.length === 0) return null;
          // Collapsed: show paragraph 1 (truncated at 120 chars)
          // Expanded: show paragraphs 2+ (Akasha Authority + Prática provide behavioral framing)
          const content = aberto ? paras.slice(1).join('\n\n') : paras[0];
          const truncated = !aberto && content.length > 120 ? content.slice(0, 117) + '\u2026' : content;
          return <p style={{ margin: 0, lineHeight: 1.55 }}>{truncated}</p>;
        })()}
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
          {/* Prática */}
          {sintese.praktika && (
            <section>
              <h4 style={{ fontSize: '0.75rem', color: 'rgba(232,224,255,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 6px' }}>
                ▸ Como aplicar
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'rgba(232,224,255,0.75)', lineHeight: 1.5, margin: 0 }}>
                {sintese.praktika}
              </p>
            </section>
          )}

          {sintese.alerta && (
            <section>
              <h4 style={{ fontSize: '0.75rem', color: 'rgba(255,180,100,0.65)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 6px' }}>
                <AlertTriangle size={12} className="inline mr-1" style={{ color: 'rgba(255,180,100,0.6)' }} /> Armadilha a evitar
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
              <h4 style={{ fontSize: '0.75rem', color: 'rgba(255,200,80,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 6px' }}>
                <Scale size={12} className="inline mr-1" style={{ color: 'rgba(255,200,80,0.7)' }} /> Akasha Authority
              </h4>
              <p style={{ fontSize: '0.83rem', color: 'rgba(255,220,150,0.85)', lineHeight: 1.5, margin: 0 }}>
                {(() => {
                  const id = sintese.dimensoesId;
                  const map: Record<string, string> = {
                    saude: 'Na Saúde & Vitalidade: sua energia hoje vem de donde? Cuide do corpo com presença — não como tarefa.',
                    trabalho: 'No Trabalho & Prosperidade: esta decisão reflete sua vocação ou apenas sua necessidade de aprovação? Aja desde o propósito.',
                    amor: 'No Amor & Relacionamentos: este vínculo nutre sua alma ou alimenta sua carência? Escolha profundidade.',
                    criacao: 'Na Criação & Expressão: sua arte vem de uma fome interior ou do medo de não ser visto? Crie desde o silêncio.',
                    proposito: 'No Propósito & Destino: esta escolha aproxima você de quem veio ser? Confie no caminho — não na validação.',
                    familia: 'Na Família & Ancestralidade: esta dinâmica repete um padrão antigo ou já é sua escolha adulta? Liberdade inclui dizer não.',
                    espiritualidade: 'Na Espiritualidade & Transcendência: esta prática ancora você no presente ou foge dele? O divino habita na simplicidade.',
                    superacao: 'Na Superação & Desafios: o que te desafia hoje é um mestre ou um espelho? Ambos pedem a mesma coisa: presença.',
                  };
                  return map[id] ?? 'Antes de decidir nesta área: pergunte — isso vem da sua paz interior ou da sua ansiedade? Se ansiedade, espere. Se paz, aja.';
                })()}
                {sintese.autoridadeAkasha.timing && (
                  <span style={{ display: 'block', marginTop: 4, opacity: 0.75 }}>
                    <Clock size={12} className="inline mr-1" /> {sintese.autoridadeAkasha.timing}
                  </span>
                )}
              </p>
            </section>
          )}
          {/* Pilares desta dimensão */}
          {sintese.contribuicoes.length > 0 && (
            <section>
              <h4 style={{ fontSize: '0.75rem', color: 'rgba(232,224,255,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 8px' }}>
                ▸ Pilares desta dimensão
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {sintese.contribuicoes.map((c) => {
                  const nomePilar = { cabala: 'Cabala', astrologia: 'Astrologia', tantrica: 'Tântrica', odu: 'Ôdu', iching: 'I Ching' }[c.pilar] ?? c.pilar;
                  const cor = c.nivel === 'primario' ? '#F0C060' : 'rgba(200,180,255,0.6)';
                  return (
                    <div key={c.pilar} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: cor, minWidth: 72 }}>
                        {nomePilar}
                      </span>
                      <span style={{ fontSize: '0.83rem', color: 'rgba(232,224,255,0.7)', lineHeight: 1.4 }}>
                        {c.frase}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
      </div>
    </article>
  );
}
