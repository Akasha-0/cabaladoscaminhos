'use client';

// ============================================================================
// Article Actions — Wave 35 (2026-07-01)
// ============================================================================// Botões de approve/reject para o workspace do curador.
// Client island mínimo: usa fetch + router.refresh() após sucesso.
// ============================================================================

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  articleId: string;
  tradition: string;
}

export function ArticleActions({ articleId, tradition }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function submit(decision: 'approve' | 'reject') {
    setError(null);
    if (decision === 'reject' && reason.trim().length < 10) {
      setError('Motivo da rejeição precisa ter pelo menos 10 caracteres.');
      return;
    }
    try {
      const resp = await fetch(
        `/api/curators/${encodeURIComponent(tradition)}/approve-article`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleId, decision, reason: reason.trim() || undefined }),
        }
      );
      const json = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setError(json?.error?.message ?? `HTTP ${resp.status}`);
        return;
      }
      setReason('');
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Motivo (obrigatório para rejeitar)"
        className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-200 placeholder:text-slate-500"
        disabled={isPending}
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => submit('approve')}
          disabled={isPending}
          className="rounded bg-emerald-700 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
        >
          Aprovar
        </button>
        <button
          type="button"
          onClick={() => submit('reject')}
          disabled={isPending}
          className="rounded bg-slate-700 px-3 py-1 text-xs font-medium text-slate-200 hover:bg-slate-600 disabled:opacity-50"
        >
          Rejeitar
        </button>
      </div>
      {error && <p className="text-xs text-rose-300">{error}</p>}
    </div>
  );
}
