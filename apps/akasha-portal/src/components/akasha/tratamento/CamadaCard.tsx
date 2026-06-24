'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useTranslation } from '@/i18n';
import type { CamadaResultado, FonteRef } from './useTratamento';

interface CamadaCardProps {
  camada: CamadaResultado;
  index: number;
  showFontes?: boolean;
}

export function CamadaCard({ camada, index, showFontes = true }: CamadaCardProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      data-testid={`camada-card-${camada.id}`}
      className="border-l-4 border-l-primary-500"
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {t('camadaNumber', { n: index + 1 })}
            </p>
            <h3 className="text-lg font-semibold leading-tight">{camada.titulo}</h3>
          </div>
          {camada.requires_professional_review && (
            <span
              className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100 px-2 py-1 rounded"
              title={t('requires_professional_review')}
            >
              ⚠️
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {camada.conteudo ? (
          <p className="text-sm leading-relaxed">{camada.conteudo}</p>
        ) : (
          <p className="text-sm italic text-muted-foreground">
            {t('noContent')}
          </p>
        )}

        {showFontes && camada.fontes && camada.fontes.length > 0 && (
          <details
            open={expanded}
            onClick={(e) => {
              e.preventDefault();
              setExpanded(!expanded);
            }}
            className="mt-3 text-xs"
          >
            <summary className="cursor-pointer text-primary-600 dark:text-primary-400">
              {expanded ? t('collapse_fonte') : t('expand_fonte')} ({camada.fontes.length})
            </summary>
            <ul className="mt-2 space-y-1 list-disc list-inside text-muted-foreground">
              {camada.fontes.map((fonte, i) => (
                <li key={i}>
                  <span className="font-mono">{fonte.id ?? `fonte-${i}`}</span>
                  {fonte.path && <span className="text-xs"> — {fonte.path}</span>}
                </li>
              ))}
            </ul>
          </details>
        )}

        {camada.requires_professional_review && (
          <p className="mt-3 text-xs text-amber-700 dark:text-amber-300 italic">
            {t('requires_professional_review')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

import { useState } from 'react';
