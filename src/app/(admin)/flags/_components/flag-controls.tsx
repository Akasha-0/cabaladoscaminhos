// ============================================================================
// FlagControls — Interactive controls for one flag (Wave 20)
// ============================================================================
// Client component. Permite:
//   - Toggle ON / OFF / Default
//   - Ajustar rollout % (para type='percentage')
//   - Adicionar/remover userId da whitelist
//
// Faz PATCH para /api/flags/[name]. Em caso de sucesso, mostra feedback.
// ============================================================================

'use client';

import * as React from 'react';
import { Loader2 as LoaderIcon, Plus as PlusIcon, X as XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface FlagControlsProps {
  flagKey: string;
  type: 'boolean' | 'percentage' | 'whitelist';
  currentEnabled: boolean | null;
  currentRollout: number;
  currentWhitelist: string[];
}

interface Feedback {
  type: 'success' | 'error';
  message: string;
}

export function FlagControls({
  flagKey,
  type,
  currentEnabled,
  currentRollout,
  currentWhitelist,
}: FlagControlsProps) {
  const [enabled, setEnabled] = React.useState<boolean | null>(currentEnabled);
  const [rollout, setRollout] = React.useState<number>(currentRollout);
  const [whitelist, setWhitelist] = React.useState<string[]>(currentWhitelist);
  const [newUser, setNewUser] = React.useState('');
  const [pending, setPending] = React.useState(false);
  const [feedback, setFeedback] = React.useState<Feedback | null>(null);

  const patch = React.useCallback(
    async (body: Record<string, unknown>) => {
      setPending(true);
      setFeedback(null);
      try {
        const res = await fetch(`/api/flags/${encodeURIComponent(flagKey)}`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error?.message ?? `HTTP ${res.status}`);
        }
        setFeedback({ type: 'success', message: 'Atualizado' });
      } catch (err) {
        setFeedback({
          type: 'error',
          message: err instanceof Error ? err.message : 'Erro ao atualizar',
        });
      } finally {
        setPending(false);
      }
    },
    [flagKey]
  );

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <div className="mt-3 space-y-3">
      {/* ON / OFF / Default */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Estado da flag">
        <ToggleButton
          active={enabled === true}
          disabled={pending}
          onClick={() => {
            setEnabled(true);
            void patch({ enabled: true });
          }}
          variant="success"
        >
          ON
        </ToggleButton>
        <ToggleButton
          active={enabled === false}
          disabled={pending}
          onClick={() => {
            setEnabled(false);
            void patch({ enabled: false });
          }}
          variant="danger"
        >
          OFF
        </ToggleButton>
        <ToggleButton
          active={enabled === null}
          disabled={pending}
          onClick={() => {
            setEnabled(null);
            void patch({ enabled: null });
          }}
          variant="default"
        >
          Default
        </ToggleButton>
      </div>

      {/* Rollout slider (apenas percentage) */}
      {type === 'percentage' && (
        <div className="rounded-md bg-muted/50 p-3">
          <label
            htmlFor={`rollout-${flagKey}`}
            className="flex items-center justify-between text-sm font-medium"
          >
            <span>Rollout %</span>
            <span className="font-mono">{rollout}%</span>
          </label>
          <input
            id={`rollout-${flagKey}`}
            type="range"
            min={0}
            max={100}
            step={1}
            value={rollout}
            disabled={pending}
            onChange={(e) => setRollout(Number(e.target.value))}
            onMouseUp={() => void patch({ rolloutPercent: rollout })}
            onTouchEnd={() => void patch({ rolloutPercent: rollout })}
            className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
            aria-label={`Rollout percentual para ${flagKey}`}
          />
        </div>
      )}

      {/* Whitelist */}
      <div className="rounded-md bg-muted/50 p-3">
        <p className="text-sm font-medium">Whitelist ({whitelist.length})</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {whitelist.length === 0 && (
            <span className="text-xs text-muted-foreground">vazia</span>
          )}
          {whitelist.map((uid) => (
            <span
              key={uid}
              className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs"
            >
              {uid}
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  const next = whitelist.filter((u) => u !== uid);
                  setWhitelist(next);
                  void patch({ removeFromWhitelist: uid });
                }}
                className="ml-0.5 rounded-full p-0.5 hover:bg-destructive/20"
                aria-label={`Remover ${uid} da whitelist`}
              >
                <XIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <form
          className="mt-2 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = newUser.trim();
            if (!trimmed || whitelist.includes(trimmed)) return;
            setWhitelist([...whitelist, trimmed]);
            setNewUser('');
            void patch({ addToWhitelist: trimmed });
          }}
        >
          <Input
            type="text"
            inputMode="text"
            placeholder="userId"
            value={newUser}
            onChange={(e) => setNewUser(e.target.value)}
            disabled={pending}
            className="h-9 flex-1 text-sm"
            aria-label="Adicionar userId à whitelist"
          />
          <Button
            type="submit"
            size="sm"
            disabled={pending || !newUser.trim()}
            className="h-9"
          >
            {pending ? (
              <LoaderIcon className="h-4 w-4 animate-spin" />
            ) : (
              <PlusIcon className="h-4 w-4" />
            )}
            <span className="ml-1">Add</span>
          </Button>
        </form>
      </div>

      {/* Feedback */}
      {feedback && (
        <p
          role="status"
          className={cn(
            'rounded-md px-3 py-2 text-xs',
            feedback.type === 'success'
              ? 'bg-green-100 text-green-900'
              : 'bg-red-100 text-red-900'
          )}
        >
          {feedback.message}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// ToggleButton — botão de estado (ON/OFF/Default)
// ============================================================================

interface ToggleButtonProps {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  variant: 'success' | 'danger' | 'default';
  children: React.ReactNode;
}

function ToggleButton({ active, disabled, onClick, variant, children }: ToggleButtonProps) {
  const activeClass = {
    success: 'bg-green-600 text-white hover:bg-green-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    default: 'bg-gray-700 text-white hover:bg-gray-800',
  }[variant];

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'min-h-[44px] min-w-[44px] rounded-md px-3 text-sm font-medium transition-colors',
        'border border-transparent',
        active
          ? activeClass
          : 'border-border bg-background hover:bg-accent'
      )}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
