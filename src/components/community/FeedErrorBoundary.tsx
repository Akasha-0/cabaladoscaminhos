'use client';

// ============================================================================
// FeedError — Mensagem de erro + retry do feed
// ============================================================================

import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface FeedErrorProps {
  error?: string;
  onRetry?: () => void;
}

export function FeedError({ error, onRetry }: FeedErrorProps) {
  return (
    <Card
      data-testid="feed-error"
      role="alert"
      className="card-spiritual bg-gradient-to-br from-red-950/30 to-slate-950 border-red-500/30"
    >
      <CardContent className="pt-6 pb-6 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 mx-auto text-red-400" />
        <p className="text-sm font-medium text-slate-200">
          Não conseguimos carregar o feed agora
        </p>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          {error ?? 'Tente novamente em alguns instantes.'}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 text-slate-200 hover:bg-slate-800 transition-all text-xs"
          >
            <RefreshCw className="w-3 h-3" />
            Tentar novamente
          </button>
        )}
      </CardContent>
    </Card>
  );
}