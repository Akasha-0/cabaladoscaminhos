'use client';

/**
 * NextStepNavigator — UX Improvement
 *
 * Mostra ao usuário QUAL é o próximo passo de forma clara.
 * Substitui a análise paralysis por ação clara.
 *
 * Problema resolvido:
 * - Usuário vê muitas informações e não sabe o que fazer
 * - Falta de CTAs claros após ver dados
 * - Dashboard sobrecarregado
 */
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';

interface Step {
  /** O que fazer */
  action: string;
  /** Por que fazer (opcional) */
  reason?: string;
  /** Se já foi concluído */
  completed?: boolean;
}

interface NextStepNavigatorProps {
  /** Título do bloco */
  title?: string;
  /** Passos a mostrar */
  steps: Step[];
  /** Passo atualmente destacado */
  currentIndex?: number;
  /** Cor de destaque */
  color?: string;
  /** Callback quando step é clicado */
  onStepClick?: (index: number) => void;
}

/**
 * Exemplo de uso:
 *
 * <NextStepNavigator
 *   title="3 passos para hoje"
 *   steps={[
 *     { action: "Respire fundo 3x", reason: "Para centralizar" },
 *     { action: "Escreva uma intenção", reason: "Para direcionar" },
 *     { action: "Faça o micro-ritual", reason: "Para integrar" },
 *   ]}
 *   currentIndex={0}
 * />
 */
export function NextStepNavigator({
  title = 'Próximo Passo',
  steps,
  currentIndex = 0,
  color = '#7C5CFF',
  onStepClick,
}: NextStepNavigatorProps) {
  if (!steps || steps.length === 0) return null;

  return (
    <div
      style={{
        background: 'rgba(11, 14, 28, 0.8)',
        border: `1px solid ${color}25`,
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: color,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontSize: '0.7rem',
            color: '#A7AECF',
          }}
        >
          {currentIndex + 1}/{steps.length}
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: '3px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${((currentIndex + 1) / steps.length) * 100}%`,
            background: `linear-gradient(90deg, ${color} 0%, ${color}99 100%)`,
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* Steps */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = step.completed || index < currentIndex;
          const isClickable = onStepClick !== undefined;

          return (
            <button
              key={index}
              onClick={() => isClickable && onStepClick(index)}
              disabled={!isClickable}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: isActive ? '12px' : '8px 12px',
                background: isActive ? `${color}12` : 'transparent',
                border: isActive ? `1px solid ${color}30` : '1px solid transparent',
                borderRadius: '8px',
                cursor: isClickable ? 'pointer' : 'default',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s ease',
                opacity: isCompleted ? 0.5 : 1,
              }}
            >
              {/* Status icon */}
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '1px',
                }}
              >
                {isCompleted ? (
                  <CheckCircle2 size={18} style={{ color }} />
                ) : isActive ? (
                  <Circle size={18} style={{ color, fill: `${color}30` }} />
                ) : (
                  <Circle size={18} style={{ color: '#6B7AA0' }} />
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    fontSize: isActive ? '0.9rem' : '0.8rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#F4F5FF' : '#A7AECF',
                    lineHeight: 1.4,
                    display: 'block',
                  }}
                >
                  {step.action}
                </span>

                {step.reason && isActive && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: '#7C5CFF',
                      lineHeight: 1.4,
                      marginTop: '4px',
                      display: 'block',
                    }}
                  >
                    {step.reason}
                  </span>
                )}
              </div>

              {/* Arrow for active */}
              {isActive && isClickable && (
                <ChevronRight size={16} style={{ color, flexShrink: 0 }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Versão minimalista inline - para usar em cards
 */
export function NextStepInline({
  action,
  reason,
  color = '#7C5CFF',
}: {
  action: string;
  reason?: string;
  color?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 12px',
        background: `${color}08`,
        borderRadius: '8px',
        border: `1px solid ${color}20`,
      }}
    >
      <span
        style={{
          fontSize: '0.7rem',
          color: color,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          flexShrink: 0,
        }}
      >
        →
      </span>
      <div>
        <span
          style={{
            fontSize: '0.85rem',
            color: '#E8E0FF',
            fontWeight: 500,
            display: 'block',
          }}
        >
          {action}
        </span>
        {reason && (
          <span
            style={{
              fontSize: '0.75rem',
              color: '#A7AECF',
              display: 'block',
              marginTop: '2px',
            }}
          >
            {reason}
          </span>
        )}
      </div>
    </div>
  );
}
