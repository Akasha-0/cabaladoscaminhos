'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useTranslations } from '@/i18n';
import type { PassoRaciocinio } from './useTratamento';

interface CadeiaPensamentoCardProps {
  passos: PassoRaciocinio[];
}

export function CadeiaPensamentoCard({ passos }: CadeiaPensamentoCardProps) {
  const t = useTranslations('tratamento');
  if (!passos || passos.length === 0) {
    return null;
  }
  return (
    <Card
      data-testid="cadeia-pensamento-card"
      className="border-l-4 border-l-blue-500"
    >
      <CardHeader className="pb-2">
        <h3 className="text-lg font-semibold leading-tight">
          🧠 {t('cadeia_pensamento')}
        </h3>
        <p className="text-xs text-muted-foreground">{t('cadeiaDescription')}</p>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3 list-decimal list-inside text-sm">
          {passos.map((passo, i) => (
            <li key={i} className="leading-relaxed">
              <span className="font-medium">{passo.descricao}</span>
              {passo.fontes_usadas && passo.fontes_usadas.length > 0 && (
                <span className="text-xs text-muted-foreground block ml-5 mt-1">
                  → {passo.fontes_usadas.join(', ')}
                </span>
              )}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
