// ============================================================================
// ModerationQueue — fila client-side com quick actions (Wave 20)
// ============================================================================
// Cada flag tem 4 ações: dismiss, hide, delete, warn.
// Hide/delete aplicam soft-delete no alvo.
// ============================================================================

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, EyeOff, Trash2, AlertTriangle, ExternalLink } from 'lucide-react';

interface FlagRow {
  id: string;
  targetType: 'POST' | 'COMMENT' | 'USER' | 'GROUP';
  targetId: string;
  reason: 'SPAM' | 'HARASSMENT' | 'MISINFO' | 'OTHER';
  description: string | null;
  status: 'PENDING' | 'REVIEWED' | 'ACTIONED' | 'DISMISSED';
  createdAt: string;
  reporterId: string;
  reviewerId: string | null;
  actionTaken: string | null;
  targetPreview: string | null;
}

const REASON_LABEL: Record<string, string> = {
  SPAM: 'Spam',
  HARASSMENT: 'Assédio',
  MISINFO: 'Desinformação',
  OTHER: 'Outro',
};

const REASON_TONE: Record<string, string> = {
  SPAM: 'bg-amber-500/15 text-amber-300 border-amber-700/40',
  HARASSMENT: 'bg-rose-500/15 text-rose-300 border-rose-700/40',
  MISINFO: 'bg-orange-500/15 text-orange-300 border-orange-700/40',
  OTHER: 'bg-slate-500/15 text-slate-300 border-slate-700/40',
};

const TARGET_HREF = (f: FlagRow): string | null => {
  if (f.targetType === 'POST')
    return `/comunidade/post/${f.targetId}`;
  if (f.targetType === 'COMMENT')
    // Não temos rota direta; aponta para o post via hash se possível.
    return null;
  if (f.targetType === 'USER') return `/comunidade/perfil/${f.targetId}`;
  if (f.targetType === 'GROUP') return `/comunidade/grupos/${f.targetId}`;
  return null;
};

export function ModerationQueue({ initial }: { initial: FlagRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState(initial);

  async function act(flagId: string, action: 'dismiss' | 'hide' | 'delete' | 'warn') {
    setBusyId(flagId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/moderation/flags/${flagId}/resolve`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
      }
      // Remove da fila local
      setItems((cur) => cur.filter((f) => f.id !== flagId));
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro');
    } finally {
      setBusyId(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-emerald-800/40 bg-emerald-950/20 p-8 text-center">
        <Check className="mx-auto mb-2 text-emerald-400" size={32} aria-hidden />
        <div className="text-sm font-medium text-emerald-200">
          Fila limpa
        </div>
        <p className="mt-1 text-xs text-emerald-400/70">
          Não há flags pendentes no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="rounded-md border border-rose-700 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
          {error}
        </div>
      )}

      <ul className="space-y-2">
        {items.map((f) => {
          const isBusy = busyId === f.id || pending;
          const href = TARGET_HREF(f);
          return (
            <li
              key={f.id}
              className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 transition-colors hover:border-slate-700"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {/* Header: badges + meta */}
                  <div className="mb-1.5 flex flex-wrap items-center gap-1.5 text-xs">
                    <span
                      className={`rounded-full border px-2 py-0.5 font-semibold ${
                        REASON_TONE[f.reason] ?? REASON_TONE.OTHER
                      }`}
                    >
                      {REASON_LABEL[f.reason] ?? f.reason}
                    </span>
                    <span className="rounded-full border border-slate-700 px-2 py-0.5 text-slate-300">
                      {f.targetType}
                    </span>
                    <span className="text-slate-500">
                      {new Date(f.createdAt).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Preview do alvo */}
                  {f.targetPreview ? (
                    <blockquote className="mb-1.5 line-clamp-3 border-l-2 border-slate-700 pl-2 text-sm italic text-slate-300">
                      {f.targetPreview}
                    </blockquote>
                  ) : (
                    <div className="mb-1.5 text-xs text-slate-500">
                      (sem preview — alvo removido?)
                    </div>
                  )}

                  {/* Contexto do reporter */}
                  {f.description && (
                    <div className="mb-1 text-xs text-slate-400">
                      <span className="font-semibold text-slate-300">Reporter:</span>{' '}
                      {f.description}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                    <span>flag: <code>{f.id.slice(0, 10)}…</code></span>
                    <span>target: <code>{f.targetId.slice(0, 10)}…</code></span>
                    <span>reporter: <code>{f.reporterId.slice(0, 10)}…</code></span>
                    {href && (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-0.5 text-sky-400 hover:text-sky-300"
                      >
                        abrir <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                <ActionButton
                  icon={<X size={14} />}
                  label="Dispensar"
                  variant="ghost"
                  disabled={isBusy}
                  onClick={() => act(f.id, 'dismiss')}
                />
                <ActionButton
                  icon={<EyeOff size={14} />}
                  label="Ocultar"
                  variant="warn"
                  disabled={isBusy || f.targetType === 'USER' || f.targetType === 'GROUP'}
                  onClick={() => act(f.id, 'hide')}
                  hint={
                    f.targetType === 'USER' || f.targetType === 'GROUP'
                      ? 'hide só p/ POST/COMMENT'
                      : undefined
                  }
                />
                <ActionButton
                  icon={<Trash2 size={14} />}
                  label="Deletar"
                  variant="danger"
                  disabled={isBusy || f.targetType === 'USER' || f.targetType === 'GROUP'}
                  onClick={() => act(f.id, 'delete')}
                  hint={
                    f.targetType === 'USER' || f.targetType === 'GROUP'
                      ? 'delete só p/ POST/COMMENT'
                      : undefined
                  }
                />
                <ActionButton
                  icon={<AlertTriangle size={14} />}
                  label="Avisar user"
                  variant="amber"
                  disabled={isBusy}
                  onClick={() => act(f.id, 'warn')}
                  hint="Apenas registra; notif em Wave 21"
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  variant,
  disabled,
  onClick,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  variant: 'ghost' | 'warn' | 'danger' | 'amber';
  disabled?: boolean;
  onClick: () => void;
  hint?: string;
}) {
  const cls = {
    ghost: 'border-slate-700 text-slate-300 hover:bg-slate-800',
    warn: 'border-amber-700 text-amber-300 hover:bg-amber-950/40',
    danger: 'border-rose-700 text-rose-300 hover:bg-rose-950/40',
    amber: 'border-amber-700 text-amber-200 hover:bg-amber-950/40',
  }[variant];

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={hint ?? label}
        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors disabled:opacity-40 ${cls}`}
      >
        {icon}
        {label}
      </button>
      {hint && (
        <div className="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-200 shadow-lg group-hover:block">
          {hint}
        </div>
      )}
    </div>
  );
}
