/**
 * @akasha/core — Interpretation Engine: tipos compartilhados
 *
 * Separado de interpretation-engine.ts para que os módulos de conteúdo
 * (numeros-*.ts, mestres.ts) possam referenciar o tipo sem importar
 * o motor de interpretação (evita ciclos de import).
 *
 * Modelo: 4 camadas (dado → significado → padrão → aplicação)
 * Inspirado em:
 *   - Gene Keys (Shadow → Gift → Siddhi)
 *   - Human Design (Strategy + Authority)
 */

import type { LifeArea } from '@akasha/types';

export type NumeroLevel = 'shadow' | 'gift' | 'siddhi';

export type AcaoPratica = {
  amplificar: string[];
  evitar: string[];
  ritual: string;
};

export type NivelContent = {
  tituloPool: string;
  significado: string;
  padrao: string;
  aplicacao: Partial<Record<LifeArea, string>>;
  acaoPratica?: AcaoPratica;
  afirmacao: string;
};

/**
 * Conteúdo profundo de 1 número de vida, expandido em 3 níveis.
 * Cada entrada alimenta 3 níveis × 9 áreas da vida no motor.
 */
export type NumeroContent = {
  arquetipoAkasha: string;
  mandato: string;
  levels: {
    shadow: NivelContent;
    gift: NivelContent;
    siddhi: NivelContent;
  };
};
