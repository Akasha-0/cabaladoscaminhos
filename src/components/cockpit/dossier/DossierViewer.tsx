// src/components/cockpit/dossier/DossierViewer.tsx
// Orquestra o stream SSE do Dossiê (Doc 05 §5 + Doc 16 AD-12 §5).
// 2 painéis: índice sticky à esquerda + conteúdo Lora à direita (react-markdown).

'use client';

import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { DossierIndex } from './DossierIndex';
import { LoadingOrbital } from './LoadingOrbital';

interface CasaData {
  houseName: string;
  dossie: string;
  generatedAt: string;
  cached?: boolean;
}

function DossierViewerInner({ readingId }: { readingId: string }) {
  const [houses, setHouses] = useState<Record<number, CasaData>>({});
  const [progress, setProgress] = useState({ current: 0, total: 36 });
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<number[]>([]);
  const [activeCasa, setActiveCasa] = useState<number | null>(null);

  useEffect(() => {
    const es = new EventSource(`/api/mesa-real/dossier/${readingId}`);

    es.addEventListener('progress', (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data);
        setProgress({ current: data.casa, total: data.total });
      } catch {
        /* ignore */
      }
    });
    es.addEventListener('house', (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data);
        setHouses((h) => ({ ...h, [data.casa]: data }));
        setProgress((p) => ({ current: Math.max(p.current, data.casa), total: p.total }));
      } catch {
        /* ignore */
      }
    });
    es.addEventListener('error', (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data);
        if (data?.casa) setErrors((arr) => [...arr, data.casa]);
      } catch {
        /* heartbeat ou erro de transporte */
      }
    });
    es.addEventListener('done', () => {
      setDone(true);
      es.close();
    });

    es.onerror = () => {
      setDone(true);
      es.close();
    };

    return () => es.close();
  }, [readingId]);

  const casaNumbers = Object.keys(houses)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="flex flex-1 min-h-0">
      <DossierIndex
        casas={casaNumbers}
        activeCasa={activeCasa}
        onSelect={(c) => {
          setActiveCasa(c);
          document
            .getElementById(`casa-${c}`)
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
        progress={progress}
        errors={errors}
      />

      <div className="flex-1 overflow-y-auto p-8">
        {!done && <LoadingOrbital progress={progress} errors={errors} />}

        {done && casaNumbers.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            Nenhuma casa foi gerada. Verifique se a mesa tem cartas e Odus preenchidos.
          </div>
        )}

        <article className="dossier font-dossier max-w-[720px] mx-auto text-foreground/90 leading-[1.8] text-[15px]">
          {casaNumbers.map((casa) => {
            const h = houses[casa];
            return (
              <section
                key={casa}
                id={`casa-${casa}`}
                className={cn(
                  'mt-9 pb-4 border-b border-border scroll-mt-20',
                  activeCasa === casa && 'border-primary/50'
                )}
              >
                <h2 className="font-cinzel text-ramiro-orange text-lg">
                  Casa {casa} — {h.houseName}
                </h2>
                <p className="text-xs text-muted-foreground/60 font-mono mb-3">
                  {new Date(h.generatedAt).toLocaleString('pt-BR')}
                  {h.cached && ' · (cache)'}
                </p>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{h.dossie}</ReactMarkdown>
              </section>
            );
          })}
        </article>
      </div>
    </div>
  );
}

// T7.3: memoize — prevents re-render when cockpit parent re-renders
export const DossierViewer = React.memo(DossierViewerInner);
