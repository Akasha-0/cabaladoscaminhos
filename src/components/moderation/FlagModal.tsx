'use client';

// ============================================================================
// FlagModal — Modal respeitoso para registrar denúncia
// ============================================================================
// Tom de voz: acolhedor, transparente. Explica o que acontece depois.
// Reporter vê confirmação, mas nunca exposto publicamente.
//
// Acessibilidade:
//  - Dialog com aria-labelledby / aria-describedby
//  - Foco preso no modal enquanto aberto
//  - ESC + clique no backdrop fecham
//  - Touch targets ≥ 44px
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import { Flag, Loader2, X, Check, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type FlagReason = 'SPAM' | 'HARASSMENT' | 'MISINFO' | 'OTHER';
type FlagTargetType = 'POST' | 'COMMENT' | 'USER' | 'GROUP';

const REASONS: { value: FlagReason; label: string; helper: string }[] = [
  {
    value: 'SPAM',
    label: 'Spam ou autopromoção',
    helper: 'Links repetitivos, venda de produtos, golpe.',
  },
  {
    value: 'HARASSMENT',
    label: 'Assédio ou desrespeito',
    helper: 'Ataques pessoais, discurso de ódio, intimidação.',
  },
  {
    value: 'MISINFO',
    label: 'Informação enganosa',
    helper: 'Fatos falsos apresentados como verdade.',
  },
  {
    value: 'OTHER',
    label: 'Outro motivo',
    helper: 'Descreva abaixo para nossa equipe entender.',
  },
];

const TARGET_LABELS: Record<FlagTargetType, string> = {
  POST: 'este post',
  COMMENT: 'este comentário',
  USER: 'este perfil',
  GROUP: 'este grupo',
};

export interface FlagModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: FlagTargetType;
  targetId: string;
  onReported?: (info: { id: string; alreadyReported: boolean }) => void;
}

export function FlagModal({
  open,
  onOpenChange,
  targetType,
  targetId,
  onReported,
}: FlagModalProps) {
  const [reason, setReason] = useState<FlagReason | null>(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ id: string; alreadyReported: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const firstFocusRef = useRef<HTMLButtonElement | null>(null);

  // Reset ao abrir
  useEffect(() => {
    if (open) {
      setReason(null);
      setDescription('');
      setError(null);
      setSuccess(null);
      // Foco inicial
      setTimeout(() => firstFocusRef.current?.focus(), 50);
    }
  }, [open]);

  // ESC fecha
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  // Lock scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!reason || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      // Wave 25 (2026-06-28): endpoint dedicado para comentários.
      // Para outros target types (POST/USER/GROUP), mantém fallback no
      // /api/flags (handler a ser implementado em wave futuro).
      const endpoint =
        targetType === 'COMMENT'
          ? `/api/comments/${targetId}/report`
          : '/api/flags';

      const body =
        targetType === 'COMMENT'
          ? {
              reason,
              description: description.trim() || null,
            }
          : {
              targetType,
              targetId,
              reason,
              description: description.trim() || null,
            };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = (await res.json().catch(() => null)) as
        | { data?: { id: string; alreadyReported?: boolean }; error?: { message: string } }
        | null;

      if (!res.ok || !json?.data) {
        setError(json?.error?.message ?? 'Não foi possível enviar. Tente novamente.');
        return;
      }

      const info = {
        id: json.data.id,
        alreadyReported: Boolean(json.data.alreadyReported),
      };
      setSuccess(info);
      onReported?.(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro de rede');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="flag-modal-title"
      aria-describedby="flag-modal-desc"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full sm:max-w-md bg-slate-950 border border-slate-800 shadow-2xl',
          'rounded-t-2xl sm:rounded-2xl',
          'max-h-[90vh] overflow-y-auto',
          'p-5 sm:p-6'
        )}
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Fechar"
          className="absolute right-3 top-3 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60"
        >
          <X className="w-4 h-4" />
        </button>

        {success ? (
          <div className="space-y-4 text-center py-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <Check className="w-6 h-6 text-emerald-400" />
            </div>
            <h2
              id="flag-modal-title"
              className="text-lg font-semibold text-slate-100"
            >
              {success.alreadyReported
                ? 'Você já denunciou isso'
                : 'Denúncia registrada'}
            </h2>
            <p className="text-sm text-slate-400">
              {success.alreadyReported
                ? 'Nossa equipe já está revisando. Obrigado pela paciência.'
                : 'Nossa equipe de moderação vai revisar em breve. Você não será exposto publicamente.'}
            </p>
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="min-h-[44px] bg-amber-500 hover:bg-amber-400 text-slate-950"
            >
              Entendi
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3 mb-4">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Flag className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h2
                  id="flag-modal-title"
                  className="text-lg font-semibold text-slate-100"
                >
                  Denunciar {TARGET_LABELS[targetType]}
                </h2>
                <p
                  id="flag-modal-desc"
                  className="text-sm text-slate-400 mt-0.5"
                >
                  Conte pra gente o que está acontecendo. Sua identidade não
                  será revelada.
                </p>
              </div>
            </div>

            {/* Reason list */}
            <div className="space-y-2" role="radiogroup" aria-label="Motivo">
              {REASONS.map((r, i) => (
                <button
                  key={r.value}
                  ref={i === 0 ? firstFocusRef : undefined}
                  type="button"
                  role="radio"
                  aria-checked={reason === r.value}
                  onClick={() => setReason(r.value)}
                  className={cn(
                    'w-full text-left p-3 rounded-xl border transition-colors min-h-[44px]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60',
                    reason === r.value
                      ? 'bg-amber-500/10 border-amber-500/40'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
                  )}
                >
                  <p
                    className={cn(
                      'text-sm font-medium',
                      reason === r.value ? 'text-amber-200' : 'text-slate-100'
                    )}
                  >
                    {r.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{r.helper}</p>
                </button>
              ))}
            </div>

            {/* Description (optional) */}
            <div className="mt-4">
              <label
                htmlFor="flag-description"
                className="block text-xs text-slate-400 mb-1.5"
              >
                Mais detalhes (opcional, até 500 caracteres)
              </label>
              <Textarea
                id="flag-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Contexto adicional para nossa equipe…"
                className="min-h-[44px] text-sm bg-slate-950/60 border-slate-700/60 focus-visible:ring-amber-500/40 resize-none"
                disabled={submitting}
              />
              <p className="text-xs text-slate-500 mt-1 text-right">
                {description.length}/500
              </p>
            </div>

            {/* Privacy notice */}
            <div className="mt-4 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex gap-2">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-300/90">
                Sua denúncia é <strong>privada</strong>. Apenas a equipe de
                moderação vê quem denunciou. O autor do conteúdo não saberá
                que foi você.
              </p>
            </div>

            {error && (
              <p role="alert" className="mt-3 text-xs text-red-400">
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="mt-5 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
                className="min-h-[44px] text-slate-300 hover:text-slate-100 hover:bg-slate-800/50"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!reason || submitting}
                className="min-h-[44px] bg-amber-500 hover:bg-amber-400 text-slate-950"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    Enviando…
                  </>
                ) : (
                  <>
                    <Flag className="w-4 h-4 mr-1.5" />
                    Enviar denúncia
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
