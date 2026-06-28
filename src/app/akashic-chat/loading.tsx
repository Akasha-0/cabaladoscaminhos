/**
 * Wave 27 perf — Akashic Chat route loading fallback.
 * Companion ao `/akashic/loading.tsx` mas com tom de chat (não records).
 *
 * Renderiza um esqueleto leve: input + 3 message bubbles fictícias.
 * Suspense boundary mantém o chat composer no SSR initial bundle enquanto
 * MessageBubble + ThinkingBubble carregam sob demanda (já dynamic).
 */

import { Loader2 } from 'lucide-react';

export default function AkashicChatLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
      <div className="flex items-center gap-3 text-violet-300">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-medium">Conectando à Akashic IA…</span>
      </div>

      <div className="w-full max-w-3xl space-y-4">
        {/* Fake user message */}
        <div className="flex justify-end">
          <div className="max-w-[80%] h-10 px-4 rounded-2xl bg-violet-500/20 border border-violet-500/30 animate-pulse" />
        </div>
        {/* Fake assistant message */}
        <div className="flex justify-start">
          <div className="max-w-[80%] space-y-2">
            <div className="h-3 bg-slate-800/40 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-slate-800/40 rounded w-2/3 animate-pulse" />
            <div className="h-3 bg-slate-800/40 rounded w-1/2 animate-pulse" />
          </div>
        </div>
        {/* Fake thinking indicator */}
        <div className="flex justify-start">
          <div className="h-10 px-4 rounded-2xl bg-slate-900/60 border border-slate-800/50 animate-pulse flex items-center gap-2">
            <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" />
            <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        </div>
      </div>
    </div>
  );
}