'use client';

/**
 * DailyInsightCard — UX Improvement
 *
 * Componente simplificado para mostrar o insight principal do dia no Dashboard.
 * Substitui a análise paralysis por um card claro e acionável.
 *
 * Este é um componente separado do InsightDoDiaPanel original (F-230)
 * porque este é para uso no Dashboard, não na página de Significado.
 */

import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface DailyInsightCardProps {
  /** Mensagem central do dia */
  insight: string;
  /** Ação sugerida (CTA) */
  action?: string;
  /** Por que isso é importante (opcional) */
  why?: string;
  /** Categoria para cor/título */
  category?: 'transformacao' | 'acao' | 'reflexao' | 'alerta';
  /** Se é o insight PRINCIPAL (destaque maior) */
  isPrimary?: boolean;
}

/** Configuração visual por categoria */
const CATEGORY_CONFIG = {
  transformacao: {
    color: '#7C5CFF',
    bgColor: 'rgba(124, 92, 255, 0.08)',
    borderColor: 'rgba(124, 92, 255, 0.25)',
    icon: Sparkles,
    label: 'Transformação',
  },
  acao: {
    color: '#F0B429',
    bgColor: 'rgba(240, 180, 41, 0.08)',
    borderColor: 'rgba(240, 180, 41, 0.25)',
    icon: Zap,
    label: 'Ação',
  },
  reflexao: {
    color: '#2DD4BF',
    bgColor: 'rgba(45, 212, 191, 0.08)',
    borderColor: 'rgba(45, 212, 191, 0.25)',
    icon: CheckCircle2,
    label: 'Reflexão',
  },
  alerta: {
    color: '#FB5781',
    bgColor: 'rgba(251, 87, 129, 0.08)',
    borderColor: 'rgba(251, 87, 129, 0.25)',
    icon: AlertTriangle,
    label: 'Alerta',
  },
};

export function DailyInsightCard({
  insight,
  action,
  why,
  category = 'transformacao',
  isPrimary = true,
}: DailyInsightCardProps) {
  const [showWhy, setShowWhy] = useState(false);
  const config = CATEGORY_CONFIG[category];
  const Icon = config.icon;

  return (
    <div
      className={`rounded-2xl border p-5 ${isPrimary ? '' : ''}`}
      style={{
        background: config.bgColor,
        borderColor: config.borderColor,
        borderRadius: isPrimary ? '16px' : '12px',
        padding: isPrimary ? '20px' : '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow effect para insight primário */}
      {isPrimary && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: `radial-gradient(circle at center, ${config.color}15 0%, transparent 50%)`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: `${config.color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={16} style={{ color: config.color }} />
        </div>
        <span
          style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            color: config.color,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          {config.label} do Dia
        </span>
      </div>

      {/* Insight Principal */}
      <p
        style={{
          fontSize: isPrimary ? '1.05rem' : '0.95rem',
          color: '#F4F5FF',
          lineHeight: 1.55,
          margin: 0,
          fontFamily: 'var(--font-lora, serif)',
          fontStyle: 'italic',
        }}
      >
        "{insight}"
      </p>

      {/* CTA - Ação */}
      {action && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 14px',
            background: `${config.color}15`,
            border: `1px solid ${config.color}30`,
            borderRadius: '10px',
          }}
        >
          <span
            style={{
              fontSize: '0.7rem',
              color: config.color,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            ⚡ Hoje:
          </span>
          <span
            style={{
              fontSize: '0.875rem',
              color: '#E8E0FF',
              lineHeight: 1.4,
            }}
          >
            {action}
          </span>
        </div>
      )}

      {/* Por que - Expandível */}
      {why && (
        <div>
          <button
            onClick={() => setShowWhy(!showWhy)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 0',
              color: '#7C5CFF',
              fontSize: '0.75rem',
              fontWeight: 500,
            }}
          >
            {showWhy ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showWhy ? 'Ocultar' : 'Ver por que'}
          </button>

          {showWhy && (
            <p
              style={{
                fontSize: '0.8rem',
                color: '#A7AECF',
                lineHeight: 1.6,
                margin: '8px 0 0',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '6px',
              }}
            >
              {why}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
