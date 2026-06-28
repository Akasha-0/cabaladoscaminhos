// ============================================================================
// ScheduleDialog — date/time picker nativo (2026-06-27, Onda 14b)
// ============================================================================
// Modal que agenda publicação para o futuro.
// Usa <input type="datetime-local"> (zero dependências).
//
// Contrato com a API:
//   POST /api/posts/[id]/schedule { scheduledFor: ISO-8601 datetime }
//
// Por que datetime-local?
//   - Nativo, mobile-friendly, sem libs extras
//   - Devolve string "YYYY-MM-DDTHH:mm" sem timezone
//   - Convertemos para ISO-8601 antes de enviar
// ============================================================================

'use client';

import { useEffect, useState } from 'react';

export interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  onScheduled: (scheduledForIso: string) => void;
}

function toDatetimeLocalDefault(): string {
  // Default: agora + 1h (mínimo do servidor é 1 min no futuro)
  const d = new Date(Date.now() + 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function datetimeLocalToIso(local: string): string {
  // 'YYYY-MM-DDTHH:mm' → 'YYYY-MM-DDTHH:mm:00.000Z'
  // Interpretamos o horário como local do usuário; enviamos como ISO local
  // (com offset) para o servidor.
  if (!local) throw new Error('Data/hora inválida');
  const date = new Date(local);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Data/hora inválida');
  }
  return date.toISOString();
}

export function ScheduleDialog({
  open,
  onOpenChange,
  postId,
  onScheduled,
}: ScheduleDialogProps) {
  const [value, setValue] = useState<string>(toDatetimeLocalDefault);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValue(toDatetimeLocalDefault());
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const iso = datetimeLocalToIso(value);
      const res = await fetch(`/api/posts/${postId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledFor: iso }),
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => null);
        const msg = detail?.error?.message ?? `HTTP ${res.status}`;
        throw new Error(msg);
      }
      onScheduled(iso);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falha ao agendar';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-dialog-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-md rounded-t-xl bg-white p-4 shadow-xl sm:rounded-xl sm:p-6 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="schedule-dialog-title"
          className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100"
        >
          Agendar publicação
        </h2>
        <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
          Escolha data e hora. O post será publicado automaticamente quando o
          horário chegar.
        </p>

        <div className="mt-4">
          <label
            htmlFor="schedule-datetime"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Data e hora
          </label>
          <input
            id="schedule-datetime"
            type="datetime-local"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            min={toDatetimeLocalDefault()}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </div>

        {error && (
          <p
            className="mt-2 text-sm text-red-500"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </p>
        )}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting || !value}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {submitting ? 'Agendando…' : 'Agendar'}
          </button>
        </div>
      </div>
    </div>
  );
}
