'use client';

// ============================================================================
// ModerationQueueItem — Card de item da fila de moderação
// ============================================================================
// Renderiza um único item da fila com botões de ação (aprovar / rejeitar /
// escalar) e input de nota. Linguagem respeitosa, sem tom punitivo.
//
// Acessibilidade:
//  - role="article" + aria-label
//  - 3 botões com aria-label descritivo
//  - Inputs com label visível
//  - 44px touch targets
// ============================================================================

import React, { useState, useCallback } from 'react';
import { Check, X, ArrowUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  type ModerationQueueItem as ModerationQueueItemType,
  type UserId,
  approveItem,
  rejectItem,
  escalateItem,
} from '@/lib/w90/comments-moderation';
import {
  REASON_LABELS,
  SEVERITY_BADGES,
  STATUS_LABELS,
} from '@/lib/w90/__fixtures__/moderation-fixtures';

// ----------------------------------------------------------------------------
// Props
// ----------------------------------------------------------------------------

export interface ModerationQueueItemProps {
  item: ModerationQueueItemType;
  currentModeratorId: UserId;
  onApprove: (id: string, note: string) => void;
  onReject: (id: string, note: string) => void;
  onEscalate: (id: string, note: string) => void;
  /** Desabilita ações (default: false). */
  readonly?: boolean;
}

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function formatDate(ts: number | null): string {
  if (ts === null) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncate(text: string, max: number = 280): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

// ----------------------------------------------------------------------------
// Componente
// ----------------------------------------------------------------------------

export function ModerationQueueItem({
  item,
  currentModeratorId,
  onApprove,
  onReject,
  onEscalate,
  readonly = false,
}: ModerationQueueItemProps) {
  const [note, setNote] = useState<string>('');

  const handleApprove = useCallback(() => {
    // Aplica o transform no engine pra validar antes de propagar
    const updated = approveItem(item, note);
    onApprove(item.id, updated.resolutionNote ?? '');
    setNote('');
  }, [item, note, onApprove]);

  const handleReject = useCallback(() => {
    const updated = rejectItem(item, note);
    onReject(item.id, updated.resolutionNote ?? '');
    setNote('');
  }, [item, note, onReject]);

  const handleEscalate = useCallback(() => {
    const updated = escalateItem(item, note);
    onEscalate(item.id, updated.resolutionNote ?? '');
    setNote('');
  }, [item, note, onEscalate]);

  const severityClass =
    SEVERITY_BADGES[String(item.flag.severity)] ?? SEVERITY_BADGES['2'];
  const reasonLabel = REASON_LABELS[item.flag.reason] ?? item.flag.reason;
  const statusLabel = STATUS_LABELS[item.status] ?? item.status;
  const isResolved = item.status !== 'pending';

  return (
    <article
      data-testid={`queue-item-${item.id}`}
      aria-label={`Item de moderação: ${reasonLabel}`}
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      {/* Header: badges */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${severityClass}`}
          aria-label={`Severidade ${item.flag.severity}`}
        >
          <AlertCircle className="mr-1 h-3 w-3" aria-hidden="true" />
          Sev. {item.flag.severity}
        </span>
        <span className="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
          {reasonLabel}
        </span>
        <span className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
          {statusLabel}
        </span>
      </div>

      {/* Texto do comentário */}
      <blockquote className="mb-3 rounded-md border-l-4 border-slate-300 bg-slate-50 p-3 text-sm leading-relaxed text-slate-800">
        {truncate(item.flag.text)}
      </blockquote>

      {/* Meta info */}
      <dl className="mb-3 grid grid-cols-1 gap-1 text-xs text-slate-500 sm:grid-cols-2">
        <div>
          <dt className="inline font-semibold">Comentário:</dt>{' '}
          <dd className="inline">{item.flag.commentId}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">Autor:</dt>{' '}
          <dd className="inline">{item.flag.userId}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">Sinalizado em:</dt>{' '}
          <dd className="inline">{formatDate(item.flag.flaggedAt)}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">Moderador:</dt>{' '}
          <dd className="inline">
            {item.assignedModeratorId ?? 'não atribuído'}
          </dd>
        </div>
        {item.resolvedAt !== null && (
          <div className="sm:col-span-2">
            <dt className="inline font-semibold">Resolvido em:</dt>{' '}
            <dd className="inline">{formatDate(item.resolvedAt)}</dd>
          </div>
        )}
        {item.resolutionNote !== null && (
          <div className="sm:col-span-2">
            <dt className="inline font-semibold">Nota:</dt>{' '}
            <dd className="inline italic">"{item.resolutionNote}"</dd>
          </div>
        )}
      </dl>

      {/* Ações — só mostra se ainda pending e readonly=false */}
      {!isResolved && !readonly && (
        <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
          <label
            htmlFor={`note-${item.id}`}
            className="block text-xs font-medium text-slate-700"
          >
            Nota de orientação (opcional, max 500 caracteres)
          </label>
          <Textarea
            id={`note-${item.id}`}
            data-testid={`queue-item-note`}
            placeholder="Ex: Conteúdo orientado para revisão respeitosa…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            className="min-h-[44px] text-sm"
            aria-label="Nota de orientação"
          />

          <div className="flex flex-wrap gap-2">
            <Button
              data-testid={`queue-item-approve`}
              onClick={handleApprove}
              size="sm"
              className="min-h-[44px] min-w-[44px] bg-emerald-600 hover:bg-emerald-700"
              aria-label={`Aprovar item ${item.id}`}
            >
              <Check className="mr-1 h-4 w-4" aria-hidden="true" />
              Aprovar
            </Button>
            <Button
              data-testid={`queue-item-reject`}
              onClick={handleReject}
              size="sm"
              variant="outline"
              className="min-h-[44px] min-w-[44px] border-amber-300 text-amber-700 hover:bg-amber-50"
              aria-label={`Rejeitar item ${item.id}`}
            >
              <X className="mr-1 h-4 w-4" aria-hidden="true" />
              Rejeitar
            </Button>
            <Button
              data-testid={`queue-item-escalate`}
              onClick={handleEscalate}
              size="sm"
              variant="outline"
              className="min-h-[44px] min-w-[44px] border-blue-300 text-blue-700 hover:bg-blue-50"
              aria-label={`Escalar item ${item.id}`}
            >
              <ArrowUp className="mr-1 h-4 w-4" aria-hidden="true" />
              Escalar
            </Button>
          </div>

          <p className="text-xs text-slate-400">
            Ações são registradas como orientação, não punição.
          </p>
        </div>
      )}

      {isResolved && (
        <p className="mt-2 text-xs italic text-slate-500">
          Item já resolvido em {formatDate(item.resolvedAt)}.
        </p>
      )}
    </article>
  );
}

export default ModerationQueueItem;