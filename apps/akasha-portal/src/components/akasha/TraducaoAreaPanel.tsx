/**
 * TraducaoAreaPanel — F-229
 *
 * Painel COMPACTO para mostrar 1 tradução Pilar → Área. Visual diferente
 * do SignificadoPilar porque este card é menor e vai em grid (8 áreas
 * por página, 5 Pilares por área). Foco: clareza de 1 frase.
 *
 * Layout:
 *   ┌─────────────────────────────────┐
 *   │ ☮ Paz · Ancestralidade                  │
 *   │                                 │
 *   │ Frase direta de COMO o Pilar    │
 *   │ fala dessa área (1-2 frases)    │
 *   │                                 │
 *   │ via Mispar Hechrachi            │
 *   └─────────────────────────────────┘
 */
import { AREA_LABEL, AREA_ICONE, type TraducaoArea } from '@/lib/grimoire/traducao-areas';

const DIMENSAO_NOME: Record<TraducaoArea['pilar'], string> = {
  cabala: 'Ancestralidade',
  astrologia: 'Movimento Celeste',
  tantrica: 'Corpo & Energia',
  odu: 'Ancestralidade',
  iching: 'Mutação do Caminho',
};

export interface TraducaoAreaPanelProps {
  traducao: TraducaoArea;
  /** Cor do Pilar (mesma paleta do MandalaChart). */
  cor: string;
  /** Compacto (para grids) ou expandido. */
  variant?: 'compact' | 'expanded';
}

export function TraducaoAreaPanel({ traducao, cor, variant = 'compact' }: TraducaoAreaPanelProps) {
  const { pilar, area, frase, fonte, requer_terreiro } = traducao;
  return (
    <article
      data-pilar={pilar}
      data-area={area}
      style={{
        background: `${cor}0a`,
        border: `1px solid ${cor}33`,
        borderLeft: `3px solid ${cor}`,
        borderRadius: 8,
        padding: variant === 'compact' ? '0.7rem 0.85rem' : '1rem 1.1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: variant === 'compact' ? '0.4rem' : '0.6rem',
      }}
    >
      {/* Header: ícone da área + Pilar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span aria-hidden style={{ fontSize: '1.05rem', color: cor, lineHeight: 1 }}>
          {AREA_ICONE[area]}
        </span>
        <strong
          style={{
            fontSize: '0.78rem',
            color: '#F4F5FF',
            letterSpacing: '0.03em',
          }}
        >
          {AREA_LABEL[area]}
        </strong>
        <span
          style={{
            fontSize: '0.65rem',
            color: cor,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          · {DIMENSAO_NOME[pilar]}
        </span>
      </div>

      {/* Frase direta */}
      <p
        style={{
          fontSize: variant === 'compact' ? '0.8rem' : '0.9rem',
          color: '#F4F5FF',
          lineHeight: 1.45,
          margin: 0,
          fontFamily: 'var(--font-lora, serif)',
        }}
      >
        {frase}
      </p>

      {/* Footer: fonte + ética Pilar 4 */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.4rem',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '0.6rem', color: '#5C6691', fontStyle: 'italic' }}>
          via {fonte}
        </span>
        {requer_terreiro && (
          <span
            style={{
              fontSize: '0.6rem',
              color: '#FB5781',
              border: '1px solid rgba(251,87,129,0.4)',
              borderRadius: 3,
              padding: '0px 4px',
              letterSpacing: '0.04em',
            }}
            title="Interpretação profunda requer babalaô/yaô (R-022 §4.4)"
          >
            ⚠ terreiro
          </span>
        )}
      </div>
    </article>
  );
}
