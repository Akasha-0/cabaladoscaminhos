'use client';

/**
 * AuthGuard — Wrapper que protege rotas autenticadas
 * ----------------------------------------------------------------------------
 * - Se `user` carregado e autenticado → renderiza `children`
 * - Se loading → mostra skeleton espiritual (7 estrelas pulsando)
 * - Se não autenticado → redireciona para `loginPath` com `?next=`
 *   preservando o path atual para pós-login redirect
 *
 * Convenções (brief W93-B):
 *   - `next` é o param preferido (vs legacy `redirectTo`)
 *   - Login pós-auth honrará o `next` capturado aqui
 *
 * A11Y:
 *   - Skeleton usa animação suave (não-veleta)
 *   - aria-live="polite" em mudanças de estado
 *   - 44px min tap target em qualquer botão de escape
 *
 * Server-safe: nunca quebra durante SSR (mounted gate).
 *
 * Wave 11 — original. W93-B — adiciona suporte a `next` + `loginPath` custom.
 */

import { useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { buildLoginRedirect, sanitizeNextPath } from '@/lib/w93/auth-integration';

export interface AuthGuardProps {
  children: React.ReactNode;
  /** Path de login (default: '/login'). */
  loginPath?: string;
  /** Path de redirect padrão se `next` ausente (default: '/feed'). */
  defaultRedirect?: string;
  /** Skeleton customizado durante loading. */
  fallback?: React.ReactNode;
}

export function AuthGuard({
  children,
  loginPath = '/login',
  defaultRedirect = '/feed',
  fallback,
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!loading && !user) {
      // Captura o path atual como `next` para redirect pós-login.
      const target = buildLoginRedirect(pathname ?? defaultRedirect, loginPath);
      router.push(target);
    }
  }, [user, loading, router, pathname, mounted, loginPath, defaultRedirect]);

  // Default skeleton — 7 estrelas pulsando
  const skeleton = useMemo(() => {
    if (fallback) return fallback;
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-background gap-4"
        role="status"
        aria-live="polite"
        aria-label="Verificando autenticação"
      >
        <div className="flex justify-center gap-2 text-spiritual-gold">
          {[...Array(7)].map((_, i) => (
            <span
              key={i}
              className="text-2xl animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              ✦
            </span>
          ))}
        </div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-cinzel">
          Conectando ao portal
        </p>
      </div>
    );
  }, [fallback]);

  // SSR/hydration guard — não mostrar nada até mounted
  if (!mounted || loading) {
    return <>{skeleton}</>;
  }

  // Não autenticado → não renderiza children
  if (!user) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Hook auxiliar para consumers que querem só a lógica de redirect.
 * Retorna o path sanitizado de redirect.
 */
export function useAuthNext(
  explicit: string | null | undefined,
  fallback: string = '/feed'
): string {
  return sanitizeNextPath(explicit, fallback);
}