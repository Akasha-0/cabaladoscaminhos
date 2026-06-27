'use client';

// ============================================================================
// FeedEmpty — Estado vazio do feed
// ============================================================================

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface FeedEmptyProps {
  title?: string;
  message?: string;
  showCreateCta?: boolean;
}

export function FeedEmpty({
  title = 'Nenhum post ainda',
  message = 'Seja o primeiro a compartilhar algo com a comunidade.',
  showCreateCta = true,
}: FeedEmptyProps) {
  return (
    <Card
      data-testid="feed-empty"
      className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 border-slate-800/50"
    >
      <CardContent className="pt-8 pb-8 text-center space-y-3">
        <Sparkles className="w-10 h-10 mx-auto text-amber-400/70" />
        <p className="text-base font-semibold text-slate-200">{title}</p>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">{message}</p>
        {showCreateCta && (
          <Link
            href="/explore"
            className="inline-block mt-2 text-xs text-amber-400 hover:text-amber-300 underline-offset-4 hover:underline"
          >
            Explorar a comunidade →
          </Link>
        )}
      </CardContent>
    </Card>
  );
}