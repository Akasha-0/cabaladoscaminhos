// src/components/cockpit/dossier/LoadingOrbital.tsx
// Loader laranja com progresso X/36 + indicador de erros (Doc 05 §5 "Loader orbital animado em laranja").

'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface LoadingOrbitalProps {
  progress: { current: number; total: number };
  errors: number[];
}

function LoadingOrbitalInner({ progress, errors }: LoadingOrbitalProps) {
  const pct = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="sticky top-0 z-10 mb-6 p-4 rounded-lg bg-card/80 border border-border/50 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="relative w-8 h-8 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-primary animate-pulse" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground/90">Cruzando os mapas das 36 casas…</p>
          <p className="text-xs text-muted-foreground">
            {progress.current} de {progress.total} casas processadas
            {errors.length > 0 && (
              <span className="text-destructive ml-2">· {errors.length} com erro</span>
            )}
          </p>
        </div>
        <div className="font-mono text-sm text-primary">{pct}%</div>
      </div>
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// T7.3: memoize — prevents re-render when cockpit parent re-renders
export const LoadingOrbital = React.memo(LoadingOrbitalInner);
