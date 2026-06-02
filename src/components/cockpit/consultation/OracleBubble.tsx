// src/components/cockpit/consultation/OracleBubble.tsx
// Bolha da resposta do Oráculo (Doc 05 §9 — royal/secondary, à esquerda, Lora, streaming).
import { Sparkles } from 'lucide-react';

export function OracleBubble({ content, pending }: { content: string; pending?: boolean }) {
  return (
    <div className="flex justify-start gap-2">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-secondary/15 border border-secondary/30 flex items-center justify-center mt-1">
        <Sparkles className="w-3.5 h-3.5 text-secondary" />
      </div>
      <div className="max-w-[80%] bg-secondary/12 border border-secondary/30 rounded-2xl rounded-tl-sm px-4 py-2.5">
        {pending && !content ? (
          <p className="text-sm text-muted-foreground italic animate-pulse">
            Consultando os oráculos…
          </p>
        ) : (
          <div className="font-dossier text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {content}
            {pending && (
              <span className="inline-block w-1.5 h-3.5 ml-1 bg-secondary animate-pulse align-middle" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
