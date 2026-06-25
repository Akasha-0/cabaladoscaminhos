'use client';

/**
 * ActionBar — Wave 22.2 Zelador Attendance UI
 *
 * Barra sticky no rodapé de /atendimento. 4 ações principais:
 *
 *   [Salvar] [Citar] [👍] [👎]    Chat: [_______________]
 *
 * - **Salvar sessão** (esquerda, primário): salva tudo que rolou.
 * - **Citar** (esquerda): cita o discovery atual no diário do consulente.
 * - **👍 / 👎** (esquerda): rating agregado da sessão inteira.
 * - **Chat input** (direita): input do Mentor (atalho no mobile).
 *
 * Mobile-first:
 *   - < 480px: input ocupa linha inteira em cima; ações embaixo.
 *   - ≥ 480px: tudo numa linha (esq: ações, dir: input).
 *
 * Sticky bottom:
 *   - `fixed bottom-0` + safe-area-inset-bottom (iOS notch).
 *   - Background com blur para não atrapalhar leitura do scroll.
 *
 * Por que component controlado (inputValue/onInputChange):
 *   - O parent (AttendanceClient) precisa saber se há texto no input
 *     para habilitar/desabilitar o botão de enviar.
 */

import { Save, Quote, Send } from 'lucide-react';
import { type FormEvent } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Labels & types
// ─────────────────────────────────────────────────────────────────────────────

export interface ActionBarLabels {
  saveLabel: string;
  citeLabel: string;
  upvoteLabel: string;
  downvoteLabel: string;
  saveAriaLabel: string;
  citeAriaLabel: string;
  chatPlaceholder: string;
  sendAriaLabel: string;
  cited: string;
  rated: string;
}

export interface ActionBarCounts {
  total: number;
  cited: number;
  rated: number;
}

export interface ActionBarProps {
  /** Valor atual do input (controlado). */
  inputValue: string;
  onInputChange: (value: string) => void;
  /** Disparado ao apertar Enter ou clicar no botão enviar. */
  onSend: () => void;
  /** Salvar sessão inteira (POST /api/attendance/:id/save). */
  onSave?: () => void;
  /** Citar o discovery em destaque. */
  onCite?: () => void;
  /** Counts para micro-feedback visual. */
  counts: ActionBarCounts;
  /** Strings já traduzidas (parent passa via useTranslation). */
  labels: ActionBarLabels;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ActionBar({
  inputValue,
  onInputChange,
  onSend,
  onSave,
  onCite,
  counts,
  labels,
}: ActionBarProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSend();
  };

  const canSend = inputValue.trim().length > 0;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-[#06070F]/95 backdrop-blur-md"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      data-testid="attendance-action-bar"
      role="toolbar"
      aria-label="Ações da sessão"
    >
      <div className="max-w-[var(--ak-container-wide)] mx-auto px-4 py-3 md:py-2.5 flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
        {/* ─── Ações (esquerda) ──────────────────────────────────────── */}
        <div
          className="flex items-center gap-1.5 md:gap-2 order-2 md:order-1"
          data-testid="attendance-actions-left"
        >
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-ak-text-primary bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 transition-colors min-h-[40px]"
              aria-label={labels.saveAriaLabel}
              data-testid="attendance-save-button"
            >
              <Save className="w-3.5 h-3.5" aria-hidden />
              <span>{labels.saveLabel}</span>
            </button>
          )}
          {onCite && (
            <button
              type="button"
              onClick={onCite}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-ak-text-secondary hover:text-ak-text-primary hover:bg-white/5 transition-colors min-h-[40px]"
              aria-label={labels.citeAriaLabel}
              data-testid="attendance-cite-button"
            >
              <Quote className="w-3.5 h-3.5" aria-hidden />
              <span className="hidden md:inline">{labels.citeLabel}</span>
            </button>
          )}

          {/* Micro-feedback visual: "3 citadas · 5 avaliadas" */}
          {(counts.cited > 0 || counts.rated > 0) && (
            <span
              className="hidden lg:inline-flex items-center gap-2 text-[10px] text-ak-text-subtle ml-1"
              data-testid="attendance-counts"
            >
              {counts.cited > 0 && (
                <span data-testid="attendance-counts-cited">
                  {counts.cited}/{counts.total} {labels.cited}
                </span>
              )}
              {counts.rated > 0 && (
                <span data-testid="attendance-counts-rated">
                  {counts.rated} {labels.rated}
                </span>
              )}
            </span>
          )}
        </div>

        {/* ─── Chat input (direita) ─────────────────────────────────── */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 order-1 md:order-2 md:flex-1 md:max-w-[60%] md:ml-auto"
          data-testid="attendance-chat-form"
        >
          <label htmlFor="attendance-chat-input" className="sr-only">
            {labels.chatPlaceholder}
          </label>
          <input
            id="attendance-chat-input"
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={labels.chatPlaceholder}
            aria-label={labels.chatPlaceholder}
            autoComplete="off"
            className="flex-1 min-w-0 px-3 py-2 rounded-lg text-sm bg-white/[0.04] border border-white/10 text-ak-text-primary placeholder:text-ak-text-subtle/70 focus:outline-none focus:border-ak-accent-aurora/50 transition-colors min-h-[40px]"
            data-testid="attendance-chat-input"
          />
          <button
            type="submit"
            disabled={!canSend}
            aria-label={labels.sendAriaLabel}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-ak-accent-aurora/20 hover:bg-ak-accent-aurora/30 text-ak-accent-aurora border border-ak-accent-aurora/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            data-testid="attendance-chat-send"
            data-disabled={!canSend}
          >
            <Send className="w-4 h-4" aria-hidden />
          </button>
        </form>
      </div>
    </div>
  );
}

export default ActionBar;
