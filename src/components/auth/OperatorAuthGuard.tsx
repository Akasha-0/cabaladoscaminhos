// fallow-ignore-file unused-file
'use client'
// src/components/auth/OperatorAuthGuard.tsx
// Guard para rotas protegidas do Operator (B2B).
// Coexiste com AuthGuard.tsx (B2C) — usa OperatorAuthProvider.
//
// Fluxo:
//   1. Aguarda hidratação + fetch inicial de /me
//   2. Se não autenticado, redirect para /operator/login
//   3. Renderiza children quando autenticado

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useOperatorAuth } from '@/components/providers/OperatorAuthProvider';

interface OperatorAuthGuardProps {
  children: ReactNode;
  /** Para onde redirecionar se não autenticado. Default: /operator/login */
  fallbackPath?: string;
  /** Se true, mostra loading state durante verificação. Default: true */
  showLoading?: boolean;
}

export function OperatorAuthGuard({
  children,
  fallbackPath = '/operator/login',
  showLoading = true,
}: OperatorAuthGuardProps) {
  const { operator, isLoading, isHydrated, isAuthenticated } = useOperatorAuth();
  const router = useRouter();

  useEffect(() => {
    // Só age após hidratação (evita mismatch SSR) E após o fetch inicial
    if (!isHydrated || isLoading) return;
    if (!operator) {
      router.replace(fallbackPath);
    }
  }, [operator, isLoading, isHydrated, router, fallbackPath]);

  if (!isHydrated || isLoading) {
    if (!showLoading) return null;
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex justify-center gap-2 text-orange-500">
          {[...Array(7)].map((_, i) => (
            <span key={i} className="text-2xl animate-pulse">✦</span>
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
