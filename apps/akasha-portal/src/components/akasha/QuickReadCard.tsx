'use client';

/**
 * QuickReadCard — UX Improvement
 *
 * Para textos longos, mostra primeiro os pontos-chave (bullets)
 * e permite expandir para conteúdo completo.
 *
 * Problema resolvido:
 * - Textos longos cansam o usuário
 * - Usuário quer saber rapidamente o ponto principal
 * - Detalhes disponíveis para quem quiser se aprofundar
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

interface QuickReadCardProps {
  /** Título do card */
  title: string;
  /** Pontos-chave a mostrar primeiro (max 3-5) */
  bullets: string[];
  /** Conteúdo completo para quando expandir */
  fullContent?: string;
  /** Cor de destaque */
  color?: string;
  /** Se começa expandido ou colapsado */
  defaultExpanded?: boolean;
  /** Ícone opcional */
  icon?: React.ReactNode;
}

/**
 * Exemplo de uso:
 *
 * <QuickReadCard
 *   title="Como sua energia está hoje"
 *   bullets={[
 *     "Sua energia está intensa e transformadora",
 *     "Use para transformar, não para competir",
 *     "Evite decisões por impulso"
 *   ]}
 *   fullContent="Parágrafo longo explicando detalhadamente..."
 *   color="#7C5CFF"
 * />
 */
export function QuickReadCard({
  title,
  bullets,
  fullContent,
  color = '#7C5CFF',
  defaultExpanded = false,
  icon,
}: QuickReadCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const hasMoreContent = fullContent && fullContent.length > bullets.join(' ').length;

  return (
    <div
      style={{
        background: 'rgba(124, 92, 255, 0.05)',
        border: `1px solid rgba(124, 92, 255, 0.15)`,
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      {/* Header - sempre visível */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '14px 16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {icon && (
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: `${color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}

        <div style={{ flex: 1 }}>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#F4F5FF',
              letterSpacing: '0.02em',
            }}
          >
            {title}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#7C5CFF',
            fontSize: '0.75rem',
          }}
        >
          {expanded ? (
            <>
              <span>Ocultar</span>
              <ChevronUp size={14} />
            </>
          ) : (
            <>
              <span>Ler mais</span>
              <ChevronDown size={14} />
            </>
          )}
        </div>
      </button>

      {/* Bullets - sempre visíveis quando colapsado */}
      {!expanded && (
        <div
          style={{
            padding: '0 16px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          {bullets.map((bullet, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
              }}
            >
              <span
                style={{
                  color: color,
                  fontSize: '0.7rem',
                  lineHeight: 1.6,
                  flexShrink: 0,
                }}
              >
                •
              </span>
              <span
                style={{
                  fontSize: '0.8rem',
                  color: '#D5D7F0',
                  lineHeight: 1.5,
                }}
              >
                {bullet}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Conteúdo completo - só quando expandido */}
      {expanded && fullContent && (
        <div
          style={{
            padding: '0 16px 16px',
            borderTop: '1px solid rgba(124, 92, 255, 0.1)',
          }}
        >
          <div
            style={{
              paddingTop: '14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}
          >
            <BookOpen size={14} style={{ color: color, flexShrink: 0, marginTop: '2px' }} />
            <p
              style={{
                fontSize: '0.85rem',
                color: '#A7AECF',
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              {fullContent}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Versão compacta inline - sem collapse
 */
export function QuickReadInline({
  label,
  content,
  color = '#7C5CFF',
}: {
  label: string;
  content: string;
  color?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '10px 12px',
        background: `${color}08`,
        borderRadius: '8px',
        border: `1px solid ${color}20`,
      }}
    >
      <span
        style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          color: color,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          minWidth: '60px',
          flexShrink: 0,
          paddingTop: '2px',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: '0.85rem',
          color: '#E8E0FF',
          lineHeight: 1.5,
        }}
      >
        {content}
      </span>
    </div>
  );
}
