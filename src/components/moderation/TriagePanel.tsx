'use client';

// ============================================================================
// TriagePanel — Painel lateral de cuidado (triagem humana)
// ============================================================================
// Abre como sheet (bottom em mobile, side em desktop). Mostra:
//   - Texto completo do comentário + autor (público)
//   - Sinalizações: contagem por reason (NUNCA identidades)
//   - Ações: Ocultar / Restaurar / Não agir
//   - Mensagem privada opcional ao autor (≤500 chars, sem template)
//
// Tom de voz: acolhedor. SEM linguagem que afasta ("você está banido").
// ============================================================================

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, MessageSquare, ShieldAlert, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  type CommentId,
  type User,
  type TriageAction,
  REASON_LABELS,
  ACTION_LABELS,
} from '@/lib/w92/comments-moderation';
import type { ServerFlagItem } from './ModerationQueue';

// ----------------------------------------------------------------------------

const PT_COPY = {
  close: 'Fechar',
  title: 'Cuidado do comentário',
  subtitle: 'Respirar antes de agir. Este painel é só seu.',
  reportsHeading: 'Sinalizações recebidas',
  reportsHelp: 'Apenas cuidadores veem quem reportou. Você vê contagem por motivo.',
  messageHeading: 'Mensagem privada ao autor',
  messageHelp:
    'Opcional, humana, sem template. Limite 500 caracteres. Vai como DM in-app — sem e-mail.',
  messagePlaceholder:
    'Olá — vi seu comentário e queria conversar com você. …',
  messageLabel: (n: number) => `${n}/500`,
  confirmHeading: 'Confirmar cuidado',
  confirmHelp:
    'A ação fica registrada no histórico do cuidador. O autor não vê nada automático.',
  cancel: 'Cancelar',
  actions: {
    hide: 'Ocultar',
    restore: 'Restaurar',
    'no-action': 'Acolhimento sem mudança',
  },
  submitting: 'Aplicando cuidado…',
  errorPrefix: 'Não foi possível aplicar: ',
  success:
    'Cuidado aplicado. Obrigado por manter este espaço presente e humano.',
};

// ----------------------------------------------------------------------------

export interface TriagePanelProps {
  commentId: CommentId;
  steward: User;
  initialItem: {
    commentId: CommentId;
    excerpt: string;
    authorDisplayName: string;
    status: ServerFlagItem['status'];
    reportReasons: ReadonlyArray<{ reason: ServerFlagItem['reportReasons'][number]['reason']; count: number }>;
    ageMs: number;
  };
  onClose: () => void;
  onDone: (commentId: CommentId, action: TriageAction) => void;
}

export function TriagePanel({
  commentId,
  steward,
  initialItem,
  onClose,
  onDone,
}: TriagePanelProps) {
  const [action, setAction] = useState<TriageAction | null>(null);
  const [body, setBody] = useState('');
  const [confirmStep, setConfirmStep] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confirmRef = useRef<HTMLButtonElement | null>(null);

  // ESC fecha
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, submitting]);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Foco inicial no confirmar quando entra na 2ª etapa
  useEffect(() => {
    if (confirmStep) {
      setTimeout(() => confirmRef.current?.focus(), 50);
    }
  }, [confirmStep]);

  const handleConfirm = useCallback(async () => {
    if (!action) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/moderation/comments/${encodeURIComponent(commentId)}/triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          privateMessage: body.trim() ? body.trim() : undefined,
        }),
      });
      const json = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: { message: string } }
        | null;
      if (!res.ok || !json?.ok) {
        setError(json?.error?.message ?? 'Erro desconhecido');
        return;
      }
      onDone(commentId, action);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro de rede');
    } finally {
      setSubmitting(false);
    }
  }, [action, body, commentId, onDone]);

  const charCount = body.length;
  const overLimit = charCount > 500;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="triage-title"
      className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end bg-black/70 backdrop-blur-sm"
    >
      <div
        aria-hidden
        className="absolute inset-0"
        onClick={() => !submitting && onClose()}
      />

      <aside className="relative w-full sm:max-w-lg bg-slate-950 border-t sm:border-l sm:border-t-0 border-slate-800 max-h-[95vh] sm:max-h-screen overflow-y-auto rounded-t-2xl sm:rounded-none shadow-2xl">
        <header className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur p-5 border-b border-slate-800 flex items-start justify-between gap-3">
          <div>
            <h2
              id="triage-title"
              className="text-lg font-semibold text-slate-100 flex items-center gap-2"
            >
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              {PT_COPY.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{PT_COPY.subtitle}</p>
          </div>
          <button
            type="button"
            aria-label={PT_COPY.close}
            onClick={() => !submitting && onClose()}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800/60 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="p-5 space-y-6">
          {/* Comment excerpt */}
          <section aria-label="Comentário">
            <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
              {initialItem.excerpt}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              por {initialItem.authorDisplayName}
            </p>
          </section>

          {/* Reports summary (contagem por reason, sem identidades) */}
          <section
            aria-labelledby="triage-reports"
            className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3"
          >
            <div>
              <h3
                id="triage-reports"
                className="text-sm font-medium text-slate-100"
              >
                {PT_COPY.reportsHeading}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {PT_COPY.reportsHelp}
              </p>
            </div>
            <ul className="flex flex-wrap gap-1.5" role="list">
              {initialItem.reportReasons.map((r) => (
                <li
                  key={r.reason}
                  className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-200"
                >
                  {REASON_LABELS[r.reason]} · {r.count}
                </li>
              ))}
            </ul>
          </section>

          {/* Action picker */}
          {!confirmStep && (
            <section
              aria-labelledby="triage-actions"
              className="space-y-3"
            >
              <h3 id="triage-actions" className="text-sm font-medium text-slate-100">
                Ação humana
              </h3>
              <div role="radiogroup" aria-label="Ações" className="grid gap-2">
                {(
                  [
                    { value: 'hide' as const, intent: 'destructive' as const },
                    { value: 'restore' as const, intent: 'primary' as const },
                    { value: 'no-action' as const, intent: 'gentle' as const },
                  ]
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={action === opt.value}
                    onClick={() => setAction(opt.value)}
                    className={cn(
                      'min-h-[44px] px-3.5 py-2.5 rounded-xl border text-sm text-left',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60',
                      action === opt.value
                        ? opt.intent === 'destructive'
                          ? 'bg-red-500/10 border-red-500/50 text-red-200'
                          : opt.intent === 'primary'
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-200'
                          : 'bg-slate-800/80 border-slate-700 text-slate-100'
                        : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
                    )}
                  >
                    {ACTION_LABELS[opt.value]}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Private message (optional) */}
          {!confirmStep && (
            <section
              aria-labelledby="triage-message"
              className="space-y-2"
            >
              <h3
                id="triage-message"
                className="text-sm font-medium text-slate-100 flex items-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4 text-slate-400" />
                {PT_COPY.messageHeading}
              </h3>
              <p className="text-xs text-slate-500">{PT_COPY.messageHelp}</p>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                maxLength={600}
                placeholder={PT_COPY.messagePlaceholder}
                disabled={submitting}
                className="min-h-[44px] text-sm bg-slate-950/60 border-slate-700/60 focus-visible:ring-amber-500/40 resize-none"
              />
              <p
                className={cn(
                  'text-xs text-right',
                  overLimit ? 'text-red-400' : 'text-slate-500'
                )}
              >
                {PT_COPY.messageLabel(charCount)}
              </p>
            </section>
          )}

          {/* Confirm step */}
          {confirmStep && action && (
            <section
              role="alertdialog"
              aria-labelledby="triage-confirm"
              className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/30 space-y-3"
            >
              <div>
                <h3 id="triage-confirm" className="text-sm font-medium text-amber-100">
                  {PT_COPY.confirmHeading}
                </h3>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  {PT_COPY.confirmHelp}
                </p>
              </div>
              <p className="text-sm text-slate-200">
                Ação escolhida: <strong>{ACTION_LABELS[action]}</strong>
                {body.trim() ? ' + mensagem privada ao autor' : ''}.
              </p>
              {body.trim() && (
                <blockquote className="text-sm text-slate-300 border-l-2 border-amber-500/50 pl-3 italic">
                  {body.trim()}
                </blockquote>
              )}
              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={submitting}
                  onClick={() => setConfirmStep(false)}
                  className="min-h-[44px] text-slate-300 hover:bg-slate-800/50"
                >
                  {PT_COPY.cancel}
                </Button>
                <Button
                  ref={confirmRef}
                  type="button"
                  onClick={handleConfirm}
                  disabled={submitting || overLimit}
                  className="min-h-[44px] bg-amber-500 hover:bg-amber-400 text-slate-950"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                      {PT_COPY.submitting}
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1.5" />
                      {PT_COPY.actions[action]}
                    </>
                  )}
                </Button>
              </div>
            </section>
          )}

          {error && (
            <p role="alert" className="text-xs text-red-400">
              {PT_COPY.errorPrefix}
              {error}
            </p>
          )}

          {/* Footer actions (só no passo 1) */}
          {!confirmStep && (
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-2 border-t border-slate-800">
              <Button
                type="button"
                variant="ghost"
                disabled={submitting}
                onClick={onClose}
                className="min-h-[44px] text-slate-300 hover:bg-slate-800/50"
              >
                {PT_COPY.cancel}
              </Button>
              <Button
                type="button"
                disabled={!action || overLimit || submitting}
                onClick={() => setConfirmStep(true)}
                className="min-h-[44px] bg-amber-500 hover:bg-amber-400 text-slate-950"
              >
                Revisar e confirmar
              </Button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

// Re-export pra server page tipar fetch options.
export type { TriageAction };
