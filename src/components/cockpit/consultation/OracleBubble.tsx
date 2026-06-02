// src/components/cockpit/consultation/OracleBubble.tsx
// Bolha da resposta do Oráculo (Doc 05 §9 — royal/secondary, à esquerda, Lora, streaming).
import { Sparkles } from 'lucide-react';

export function OracleBubble({ content, pending }: { content: string; pending?: boolean }) {
  return (
    <div className="flex justify-start gap-2">
      <div className="flex-shrink-0 w-7 h-7 rounded-full border border-[var(--color-ramiro-royal)]/30 flex items-center justify-center mt-1"
        style={{ backgroundColor: 'rgba(37, 71, 208, 0.20)' }}
      >
        <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--color-ramiro-royal)' }} />
      </div>
      <div
        className="max-w-[80%] border border-[var(--color-ramiro-royal)]/30 rounded-2xl rounded-tl-sm px-4 py-2.5"
        style={{ backgroundColor: 'rgba(37, 71, 208, 0.12)' }}
      >
        {pending && !content ? (
          <p className="text-sm text-muted-foreground italic animate-pulse">
            Consultando os oráculos…
          </p>
        ) : (
          <div className="font-dossier text-sm leading-relaxed whitespace-pre-wrap"
            style={{ color: 'var(--color-ramiro-text, #f8fafc)' }}
          >
            {content}
            {pending && (
              <span className="inline-block w-1.5 h-3.5 ml-1 animate-pulse align-middle" style={{ backgroundColor: 'var(--color-ramiro-royal)' }} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
