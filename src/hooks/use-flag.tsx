// ============================================================================
// useFlag — Client-side feature flag hook (Wave 20)
// ============================================================================
// Hook React para checar flags no client. Resolve userId a partir da sessão
// (cookie ou localStorage) e faz fetch de /api/flags/[name] para server-side
// evaluation (assim o rollout% é calculado com base no user real, não no
// client).
//
// Por que NÃO avaliar no client?
//   - O client pode ser manipulado (devtools) — bypassaria rollout
//   - UserId consistente só está disponível no server (auth/session)
//   - O servidor é a fonte da verdade
//
// Estratégia:
//   1. fetch('/api/flags') uma vez no mount → cache em React state
//   2. Hook `useFlag(name)` lê desse cache
//   3. Admin pode forçar refetch via `refetch()`
//
// SSR-safe: retorna `defaultValue` no primeiro render (servidor), depois
// hidrata com o valor real.
// ============================================================================

'use client';

import * as React from 'react';

// ============================================================================
// Types
// ============================================================================

export interface FlagResponse {
  key: string;
  enabled: boolean;
  reason: 'forced-off' | 'forced-on' | 'whitelist' | 'percentage' | 'default';
}

interface FlagsListResponse {
  data: Record<string, FlagResponse>;
  meta: { timestamp: string };
}

export interface UseFlagResult {
  enabled: boolean;
  loading: boolean;
  reason?: FlagResponse['reason'];
  refetch: () => Promise<void>;
}

// ============================================================================
// Context + Provider (opcional — para apps que querem cache compartilhado)
// ============================================================================

interface FlagsContextValue {
  flags: Record<string, FlagResponse>;
  loading: boolean;
  refetch: () => Promise<void>;
}

const FlagsContext = React.createContext<FlagsContextValue | null>(null);

export function FlagsProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlags] = React.useState<Record<string, FlagResponse>>({});
  const [loading, setLoading] = React.useState(true);

  const refetch = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/flags', { credentials: 'include' });
      if (!res.ok) throw new Error(`flags fetch failed: ${res.status}`);
      const json = (await res.json()) as FlagsListResponse;
      setFlags(json.data);
    } catch (err) {
      console.error('[use-flag] refetch falhou:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refetch();
  }, [refetch]);

  return (
    <FlagsContext.Provider value={{ flags, loading, refetch }}>
      {children}
    </FlagsContext.Provider>
  );
}

function useFlagsContext(): FlagsContextValue | null {
  return React.useContext(FlagsContext);
}

// ============================================================================
// useFlag — main hook
// ============================================================================

/**
 * Hook para checar uma feature flag no client.
 *
 * @param name  chave da flag (deve estar no registry)
 * @returns     { enabled, loading, reason, refetch }
 *
 * @example
 *   const { enabled, loading } = useFlag('onboarding-redesign-v2');
 *   if (loading) return <Skeleton />;
 *   return enabled ? <OnboardingV2 /> : <OnboardingLegacy />;
 */
export function useFlag(name: string): UseFlagResult {
  const ctx = useFlagsContext();
  const [standalone, setStandalone] = React.useState<FlagResponse | null>(null);
  const [standaloneLoading, setStandaloneLoading] = React.useState(true);

  // Modo 1: usando Context (preferido)
  if (ctx) {
    const flag = ctx.flags[name];
    return {
      enabled: flag?.enabled ?? false,
      loading: ctx.loading,
      reason: flag?.reason,
      refetch: ctx.refetch,
    };
  }

  // Modo 2: standalone (sem provider) — fetch individual
  const refetch = React.useCallback(async () => {
    setStandaloneLoading(true);
    try {
      const res = await fetch(`/api/flags/${encodeURIComponent(name)}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`flag fetch failed: ${res.status}`);
      const json = (await res.json()) as { data: FlagResponse };
      setStandalone(json.data);
    } catch (err) {
      console.error(`[use-flag] fetch ${name} falhou:`, err);
      setStandalone({ key: name, enabled: false, reason: 'default' });
    } finally {
      setStandaloneLoading(false);
    }
  }, [name]);

  React.useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    enabled: standalone?.enabled ?? false,
    loading: standaloneLoading,
    reason: standalone?.reason,
    refetch,
  };
}
