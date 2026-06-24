'use client';

import { useTranslation } from '@/i18n';
import { CamadaCard } from './CamadaCard';
import { CadeiaPensamentoCard } from './CadeiaPensamentoCard';
import {
  useTratamento,
  type SynthesisOutput,
  type TratamentoInput,
} from './useTratamento';

const CAMADA_ORDER = [
  'camada-1-diagnostico',
  'camada-2-praticas-imediatas',
  'camada-3-tratamento-por-area',
  'camada-4-quisilas',
  'camada-5-alinhamento-energetico',
  'camada-6-psicanalise',
  'camada-7-coaching',
] as const;

export interface TratamentoDashboardProps {
  input: TratamentoInput;
  initialData?: SynthesisOutput;
}

export function TratamentoDashboard({ input, initialData }: TratamentoDashboardProps) {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = useTratamento(
    initialData ? null : input
  );

  const output = initialData ?? data;

  if (isLoading) {
    return (
      <div className="p-8 text-center" data-testid="tratamento-loading">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center" data-testid="tratamento-error">
        <p className="text-amber-700 dark:text-amber-300 font-medium mb-2">
          {t('errorTitle')}
        </p>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
        >
          {t('errorRetry')}
        </button>
      </div>
    );
  }

  if (!output) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        {t('noAuth')}
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="tratamento-dashboard">
      {output.disclaimer && (
        <div className="rounded border border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 p-3 text-xs text-amber-900 dark:text-amber-200">
          ⚠️ {output.disclaimer}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CAMADA_ORDER.map((id, index) => {
          const camada = output.camadas[id];
          if (!camada) return null;
          return <CamadaCard key={id} camada={camada} index={index} />;
        })}
      </div>

      <CadeiaPensamentoCard passos={output.cadeia_pensamento} />
    </div>
  );
}
