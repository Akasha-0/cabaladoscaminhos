'use client';

// ============================================================================
// AkashicEmptyState — Landing state for /akashic (lazy-loaded)
// ============================================================================
// Shown only when the message list is empty (first visit or after clear).
// Loading this lazily avoids shipping the suggestion copy + UI chrome until
// the user actually needs it (post-mount or after Clear).
//
// Wave 11 (perf deep) — 2026-06-27.
// ============================================================================

import React from 'react';
import { Sparkles, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const SUGGESTIONS = [
  'Como a Cabala explica a intuição?',
  'O que Ifá e Astrologia têm em comum sobre propósito?',
  'Quais práticas de Tantra têm evidência científica?',
  'Como diferenciar meditação Vipassana de mindfulness?',
  'Por que o Reiki funciona em algumas pessoas e em outras não?',
];

interface AkashicEmptyStateProps {
  onPickSuggestion: (s: string) => void;
}

export function AkashicEmptyState({ onPickSuggestion }: AkashicEmptyStateProps) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 via-amber-400/10 to-amber-300/20 ring-1 ring-amber-400/30">
        <Sparkles className="h-8 w-8 text-amber-300" aria-hidden />
      </div>
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold text-slate-100">
          Olá, eu sou a Akasha
        </h2>
        <p className="mx-auto max-w-md text-sm text-slate-400">
          Posso ajudar a conectar tradições, citar papers e traduzir conceitos. Sempre com humildade epistêmica — quando não sei, admito.
        </p>
      </div>
      <Card className="w-full max-w-md border-slate-800 bg-slate-900/60">
        <CardContent className="space-y-2 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Comece com uma pergunta:
          </p>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onPickSuggestion(s)}
              className="block w-full rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-left text-sm text-slate-200 transition-colors hover:border-amber-400/40 hover:bg-slate-800/40"
            >
              <MessageSquare className="mr-2 inline h-3.5 w-3.5 text-amber-300" />
              {s}
            </button>
          ))}
        </CardContent>
      </Card>
      <p className="text-[10px] text-slate-500">
        Lembrete: Akasha não substitui profissionais, não promete cura, e sempre recomenda consultar praticantes da tradição.
      </p>
    </div>
  );
}