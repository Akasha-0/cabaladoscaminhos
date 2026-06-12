/**
 * Mural coletivo — F-234
 *
 * O Mural é 1 ciclo de 260 dias inspirado no Tzolkin maia. Cada dia
 * recebe 1 "kin" (1-260), calculado a partir de uma data-âncora fixa.
 * Cadência coletiva — não horóscopo, não destino, não dogma.
 *
 * Fonte: r-010 mayan-reverse-engineering (F-228 herança de F-234).
 * Nota ética: R-022 §5.2 — tradição maia é viva, sem apropriação.
 */

export type FamiliaTzolkin = 'cardinal' | 'polar' | 'eletrico' | 'solar' | 'espectral';

export interface KinTzolkin {
  numero: number;
  posicao_no_ciclo: number;
  dias_ate_proximo_ciclo: number;
  familia: FamiliaTzolkin;
  familia_nome: string;
  familia_cor: string;
  familia_qualidade: string;
  eh_portal: boolean;
  portal_nome: string | null;
}

const FAMILIAS: ReadonlyArray<{
  id: FamiliaTzolkin;
  nome: string;
  cor: string;
  qualidade: string;
}> = [
  { id: 'cardinal',  nome: 'Cardinal',  cor: '#FB5781', qualidade: 'Inicia, polariza, polaridade-base' },
  { id: 'polar',     nome: 'Polar',     cor: '#7C5CFF', qualidade: 'Equilibra opostos, harmoniza' },
  { id: 'eletrico',  nome: 'Elétrico',  cor: '#F0B429', qualidade: 'Conecta, ativa, energiza' },
  { id: 'solar',     nome: 'Solar',     cor: '#2DD4BF', qualidade: 'Ilumina, expande, brilha' },
  { id: 'espectral', nome: 'Espectral', cor: '#A0763A', qualidade: 'Dissolve, transmuta, libera' },
];

const PORTAIS: Record<number, string> = {
  8: 'Portal da Ressonância',
  9: 'Portal da Harmonização',
  17: 'Portal da Transformação',
  18: 'Portal da Revelação',
};

const ANCHOR_MS = Date.UTC(2024, 0, 1); // 2024-01-01 = kin 1

function diffDays(utc: number, anchor: number): number {
  return Math.floor((utc - anchor) / (1000 * 60 * 60 * 24));
}

/** Calcula o kin Tzolkin de uma data (default = hoje UTC). */
export function kinDaData(data: Date = new Date()): KinTzolkin {
  const dias = diffDays(data.getTime(), ANCHOR_MS);
  // ((dias % 260) + 260) % 260 + 1 — sempre 1-260, mesmo para dias negativos
  const posicao_no_ciclo = (((dias % 260) + 260) % 260) + 1;
  const numero = ((posicao_no_ciclo - 1) % 13) + 1; // 1-13
  const familiaIdx = Math.floor((posicao_no_ciclo - 1) / 52); // 0-4
  const familia = FAMILIAS[Math.min(familiaIdx, 4)];
  const dias_ate_proximo_ciclo = 260 - ((posicao_no_ciclo - 1) % 260) || 260;

  const eh_portal = posicao_no_ciclo in PORTAIS;
  const portal_nome = eh_portal ? PORTAIS[posicao_no_ciclo] : null;

  return {
    numero,
    posicao_no_ciclo,
    dias_ate_proximo_ciclo,
    familia: familia.id,
    familia_nome: familia.nome,
    familia_cor: familia.cor,
    familia_qualidade: familia.qualidade,
    eh_portal,
    portal_nome,
  };
}

/** Devolve as 5 Famílias Terrestres (para listagem em /sobre). */
export function familias() {
  return FAMILIAS;
}
