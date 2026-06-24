'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useTranslation } from '@/i18n';
import type { CamadaResultado, FonteRef } from './useTratamento';

interface CamadaCardProps {
  camada: CamadaResultado;
  index: number;
  showFontes?: boolean;
}

/** Wave 7.4 A.2 — derive metadados psicanalíticos das fontes da camada.
 * Retorna o primeiro arquetipo_jung + estilo_terapeutico não-vazios
 * encontrado nas fontes (camada 6 é a principal consumidora). */
function deriveCamada6Meta(fontes: FonteRef[]): {
  arquetipo_jung?: string;
  estilo_terapeutico?: string;
} {
  const out: { arquetipo_jung?: string; estilo_terapeutico?: string } = {};
  for (const f of fontes) {
    if (!out.arquetipo_jung && f.arquetipo_jung) out.arquetipo_jung = f.arquetipo_jung;
    if (!out.estilo_terapeutico && f.estilo_terapeutico)
      out.estilo_terapeutico = f.estilo_terapeutico;
    if (out.arquetipo_jung && out.estilo_terapeutico) break;
  }
  return out;
}

export function CamadaCard({ camada, index, showFontes = true }: CamadaCardProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const meta = deriveCamada6Meta(camada.fontes ?? []);

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

        {/* Wave 7.4 A.2 — Badges psicanalíticos opcionais (Camada 6) */}
        {(meta.arquetipo_jung || meta.estilo_terapeutico) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {meta.arquetipo_jung && (
              <span
                data-testid="camada-meta-arquetipo"
                className="text-[10px] uppercase tracking-wide bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100 px-2 py-0.5 rounded-full"
                title={t('camadaArquetipoJung')}
              >
                {meta.arquetipo_jung}
              </span>
            )}
            {meta.estilo_terapeutico && (
              <span
                data-testid="camada-meta-estilo"
                className="text-[10px] uppercase tracking-wide bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 px-2 py-0.5 rounded-full"
                title={t('camadaEstiloTerapeutico')}
              >
                {meta.estilo_terapeutico}
              </span>
            )}
          </div>
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
