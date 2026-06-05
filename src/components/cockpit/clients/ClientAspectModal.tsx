'use client';

import { useEffect, useState, useRef } from 'react';
import { X, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClientAspectModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  aspectType: string;
  aspectKey: string;
  aspectName: string;
  aspectValue: any;
}

export function ClientAspectModal({
  isOpen,
  onClose,
  clientId,
  aspectType,
  aspectKey,
  aspectName,
  aspectValue,
}: ClientAspectModalProps) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    setContent('');
    setIsLoading(true);
    setError(null);

    let isCancelled = false;
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;

    async function startStream() {
      try {
        const response = await fetch('/api/operator/interpret-aspect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clientId,
            aspectType,
            aspectKey,
            aspectName,
            aspectValue,
          }),
        });

        if (!response.ok) {
          throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error('Corpo da resposta vazio');
        }

        setIsLoading(false);
        reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          if (isCancelled) break;
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;

            const jsonStr = trimmed.slice(6).trim();
            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.error) {
                setError(parsed.error);
                break;
              }
              if (parsed.content) {
                setContent((prev) => prev + parsed.content);
              }
            } catch {
              // Ignore malformed JSON chunks
            }
          }
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Erro de rede ao buscar interpretação');
          setIsLoading(false);
        }
      }
    }

    startStream();

    return () => {
      isCancelled = true;
      if (reader) {
        reader.cancel().catch(() => {});
      }
    };
  }, [isOpen, clientId, aspectType, aspectKey, aspectName, aspectValue]);

  // Scroll to bottom during streaming
  useEffect(() => {
    textEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [content]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border/80 bg-card/95 p-6 shadow-2xl animate-scale-in max-h-[90vh] flex flex-col justify-between">
        {/* Header */}
        <header className="flex justify-between items-start border-b border-border/30 pb-4 mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest font-bold font-cinzel">Oráculo Akasha</span>
            </div>
            <h3 className="font-cinzel text-lg font-bold text-foreground">
              {aspectName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-border/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto min-h-[250px] max-h-[50vh] pr-2 space-y-4 text-sm leading-relaxed text-foreground/90 font-sans">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-48 space-y-3">
              <Loader2 className="w-8 h-8 text-secondary animate-spin" />
              <p className="text-xs text-muted-foreground font-cinzel tracking-wider animate-pulse">Sintonizando canais do Oráculo…</p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2.5 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold">Falha na sintonização</span>
                <p>{error}</p>
              </div>
            </div>
          )}

          {content && (
            <div className="space-y-4 whitespace-pre-line animate-fade-in text-justify">
              {content}
            </div>
          )}

          <div ref={textEndRef} />
        </div>

        {/* Footer */}
        <footer className="border-t border-border/30 pt-4 mt-4 flex justify-end">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-border/60 hover:bg-muted/60"
          >
            Fechar Portal
          </Button>
        </footer>
      </div>
    </div>
  );
}
