// ============================================================================
// Library Detail — Loading + Error states (Wave 29)
// ============================================================================

'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// ============================================================================
// Skeleton
// ============================================================================

export function ArticleDetailSkeleton() {
  return (
    <div
      className="min-h-screen"
      role="status"
      aria-live="polite"
      aria-busy={true}
      aria-label="Carregando artigo"
    >
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-6">
        <div className="h-4 w-32 bg-slate-800/40 rounded animate-pulse" />

        <Card className="bg-slate-900/40 border-slate-800/40">
          <CardContent className="pt-6 md:pt-8 space-y-4">
            <div className="flex gap-2">
              <div className="h-5 w-16 bg-slate-800/40 rounded animate-pulse" />
              <div className="h-5 w-20 bg-slate-800/40 rounded animate-pulse" />
            </div>
            <div className="h-8 md:h-10 bg-slate-800/40 rounded animate-pulse" />
            <div className="h-4 bg-slate-800/40 rounded animate-pulse w-full" />
            <div className="h-4 bg-slate-800/40 rounded animate-pulse w-4/5" />
            <div className="h-4 bg-slate-800/40 rounded animate-pulse w-3/5" />
            <div className="flex gap-2 pt-4">
              <div className="h-10 w-24 bg-slate-800/40 rounded animate-pulse" />
              <div className="h-10 w-32 bg-slate-800/40 rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-slate-800/40">
          <CardContent className="pt-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-4 bg-slate-800/30 rounded animate-pulse"
                style={{ width: `${90 - (i % 3) * 10}%` }}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// Error
// ============================================================================

export interface ArticleDetailErrorProps {
  message: string;
  slug?: string;
}

export function ArticleDetailError({ message, slug }: ArticleDetailErrorProps) {
  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-3xl mx-auto py-10 space-y-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30">
          <AlertTriangle
            className="w-8 h-8 text-rose-400"
            aria-hidden={true}
          />
        </div>
        <div className="space-y-2">
          <h1 className="font-cinzel text-2xl text-amber-100">
            Não foi possível carregar o artigo
          </h1>
          <p className="text-sm text-slate-400">{message}</p>
          {slug && (
            <p className="text-xs text-slate-600 font-mono">slug: {slug}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            asChild
            variant="outline"
            className="min-h-[44px] border-slate-700 text-slate-300 hover:border-amber-500/40 hover:text-amber-200"
          >
            <Link href="/library">
              <ArrowLeft className="w-4 h-4 mr-2" aria-hidden={true} />
              Voltar para biblioteca
            </Link>
          </Button>
        </div>
        <div className="pt-6">
          <BookOpen
            className="w-12 h-12 mx-auto text-slate-700"
            aria-hidden={true}
          />
        </div>
      </div>
    </div>
  );
}