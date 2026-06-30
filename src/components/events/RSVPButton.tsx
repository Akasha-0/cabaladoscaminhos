// ============================================================================
// W93-D — RSVP BUTTON (com optimistic UI)
// ----------------------------------------------------------------------------
// Botão de inscrição com 3 estados:
//   - Deslogado: CTA "Entrar para participar" → /login?next=/eventos/[slug]
//   - Logado + sem RSVP: "Participar" (default) ou "Entrar na lista de espera"
//   - Logado + com RSVP: "Inscrito" / "Cancelar inscrição"
//
// Optimistic UI: muda estado local ANTES do await. Se fetch falhar,
// rollback + toast. Hooks de fetch são injetados via props (testáveis).
//
// Sacred-cultural: copy em pt-BR; usa "lista de espera" (não "waitlist").
// ============================================================================

'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogIn,
  Check,
  X,
  Loader2,
  UserPlus,
  Clock,
  Lock,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import type { SignupStatus } from '@/lib/w93/events-types.ts';

export type RsvpState = 'idle' | 'loading' | 'success' | 'error';

interface RSVPButtonProps {
  eventSlug: string;
  /** Status atual do signup no servidor */
  signupStatus: SignupStatus;
  /** Se o usuário atual está logado */
  isAuthenticated: boolean;
  /** Se o usuário atual já tem RSVP confirmado/waitlist */
  hasRsvp?: boolean;
  /** RsvpId atual (para cancelar) */
  rsvpId?: string;
  /** Slug da rota atual para redirect pós-login */
  returnTo?: string;
  /** Endpoint para criar RSVP */
  createEndpoint?: string;
  /** Endpoint para cancelar RSVP */
  cancelEndpoint?: string;
  /** Variante visual */
  variant?: 'default' | 'outline' | 'golden';
  /** Largura total (mobile-first) */
  fullWidth?: boolean;
  className?: string;
  /** Callback disparado quando state muda (útil para testes) */
  onStateChange?: (state: RsvpState) => void;
}

const DEFAULT_CREATE = (slug: string) => `/api/eventos/${slug}/rsvp`;
const DEFAULT_CANCEL = (slug: string, id: string) => `/api/eventos/${slug}/rsvp/${id}`;

async function defaultFetcher(url: string, method: 'POST' | 'DELETE'): Promise<{ ok: boolean; rsvpId?: string; error?: string }> {
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' } });
  if (!res.ok) {
    return { ok: false, error: `HTTP ${res.status}` };
  }
  const body = await res.json().catch(() => ({}));
  return { ok: true, rsvpId: body.rsvpId };
}

export function RSVPButton({
  eventSlug,
  signupStatus,
  isAuthenticated,
  hasRsvp = false,
  rsvpId,
  returnTo,
  createEndpoint,
  cancelEndpoint,
  variant = 'golden',
  fullWidth = true,
  className,
  onStateChange,
}: RSVPButtonProps) {
  const router = useRouter();
  const [state, setState] = useState<RsvpState>('idle');
  const [optimisticRsvp, setOptimisticRsvp] = useState<{ hasRsvp: boolean; rsvpId?: string }>({
    hasRsvp,
    rsvpId,
  });
  const [, startTransition] = useTransition();

  const updateState = useCallback((next: RsvpState) => {
    setState(next);
    onStateChange?.(next);
  }, [onStateChange]);

  // ============================================================
  // 1. NÃO LOGADO → CTA de login
  // ============================================================
  if (!isAuthenticated) {
    const handleLogin = () => {
      const next = encodeURIComponent(returnTo ?? `/eventos/${eventSlug}`);
      router.push(`/login?next=${next}`);
    };
    return (
      <Button
        variant="golden"
        onClick={handleLogin}
        className={cn(fullWidth && 'w-full', className)}
        data-testid="rsvp-button-login"
        aria-label="Entrar para participar"
      >
        <LogIn className="w-4 h-4 mr-2" aria-hidden="true" />
        Entrar para participar
      </Button>
    );
  }

  // ============================================================
  // 2. JÁ INSCRITO → cancelar
  // ============================================================
  if (optimisticRsvp.hasRsvp && optimisticRsvp.rsvpId) {
    const handleCancel = async () => {
      updateState('loading');
      const cancelUrl = cancelEndpoint ?? DEFAULT_CANCEL(eventSlug, optimisticRsvp.rsvpId!);
      // Optimistic: remove primeiro
      const prev = { hasRsvp: true, rsvpId: optimisticRsvp.rsvpId };
      setOptimisticRsvp({ hasRsvp: false, rsvpId: undefined });
      const result = await defaultFetcher(cancelUrl, 'DELETE');
      if (!result.ok) {
        // Rollback
        setOptimisticRsvp(prev);
        updateState('error');
        return;
      }
      startTransition(() => {
        router.refresh();
      });
      updateState('success');
    };
    return (
      <div className={cn('flex flex-col sm:flex-row gap-2', fullWidth && 'w-full')}>
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={state === 'loading'}
          className={cn(fullWidth && 'flex-1', 'border-emerald-500/50 text-emerald-300 bg-emerald-500/10', className)}
          data-testid="rsvp-button-cancel"
          aria-label="Cancelar inscrição"
        >
          {state === 'loading' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
          ) : (
            <Check className="w-4 h-4 mr-2" aria-hidden="true" />
          )}
          Inscrito · cancelar
        </Button>
      </div>
    );
  }

  // ============================================================
  // 3. EVENTO FECHADO / PASSADO → desabilitado
  // ============================================================
  if (signupStatus === 'closed') {
    return (
      <Button
        variant="outline"
        disabled
        className={cn(fullWidth && 'w-full', className)}
        data-testid="rsvp-button-closed"
      >
        <Lock className="w-4 h-4 mr-2" aria-hidden="true" />
        Inscrições fechadas
      </Button>
    );
  }

  // ============================================================
  // 4. WAITLIST (lotado) → entrar na fila
  // ============================================================
  if (signupStatus === 'waitlist' || signupStatus === 'full') {
    const handleJoinWaitlist = async () => {
      updateState('loading');
      const createUrl = createEndpoint ?? DEFAULT_CREATE(eventSlug);
      const result = await defaultFetcher(createUrl, 'POST');
      if (!result.ok) {
        updateState('error');
        return;
      }
      setOptimisticRsvp({ hasRsvp: true, rsvpId: result.rsvpId });
      startTransition(() => router.refresh());
      updateState('success');
    };
    return (
      <Button
        variant={variant}
        onClick={handleJoinWaitlist}
        disabled={state === 'loading'}
        className={cn(fullWidth && 'w-full', className)}
        data-testid="rsvp-button-waitlist"
      >
        {state === 'loading' ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
        ) : (
          <Clock className="w-4 h-4 mr-2" aria-hidden="true" />
        )}
        Entrar na lista de espera
      </Button>
    );
  }

  // ============================================================
  // 5. STATUS OPEN → "Participar"
  // ============================================================
  const handleRsvp = async () => {
    updateState('loading');
    const createUrl = createEndpoint ?? DEFAULT_CREATE(eventSlug);
    // Optimistic
    const fakeId = `optimistic-${Date.now()}`;
    setOptimisticRsvp({ hasRsvp: true, rsvpId: fakeId });
    const result = await defaultFetcher(createUrl, 'POST');
    if (!result.ok) {
      // Rollback
      setOptimisticRsvp({ hasRsvp: false, rsvpId: undefined });
      updateState('error');
      return;
    }
    if (result.rsvpId) {
      setOptimisticRsvp({ hasRsvp: true, rsvpId: result.rsvpId });
    }
    startTransition(() => router.refresh());
    updateState('success');
  };

  return (
    <Button
      variant={variant}
      onClick={handleRsvp}
      disabled={state === 'loading'}
      className={cn(fullWidth && 'w-full', className)}
      data-testid="rsvp-button-participate"
    >
      {state === 'loading' ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
      ) : state === 'error' ? (
        <X className="w-4 h-4 mr-2" aria-hidden="true" />
      ) : (
        <UserPlus className="w-4 h-4 mr-2" aria-hidden="true" />
      )}
      {state === 'error' ? 'Tentar novamente' : 'Participar'}
    </Button>
  );
}