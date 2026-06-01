// ============================================================
// MESA REAL — Adaptador de Odus
// ============================================================

import { oduData } from '@/lib/ifa/odu-data';

export interface OduResumido {
  numero: number;
  nome: string;
  significadoCurto: string;
  elementos: string;
  orixas: string[];
}

export const ODUS_16: OduResumido[] = oduData.slice(0, 16).map((o) => ({
  numero: o.numero,
  nome: o.nome,
  significadoCurto: o.significado.split('.')[0] ?? o.significado,
  elementos: o.elementos,
  orixas: o.orixas,
}));

export function getOduByNumero(numero: number): OduResumido | undefined {
  return ODUS_16.find((o) => o.numero === numero);
}
