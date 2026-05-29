// Stub mesa-real module
export interface MesaRealSpread {
  format: '8x4+4' | '9x4';
  totalCards: number;
  rows: number;
  cols: number;
  destinyCards: number;
  casaLabels: string[];
}

export const MESA_REAL_SPREADS: Record<string, MesaRealSpread> = {};

export function shuffle<T>(_array: T[]): T[] {
  return [];
}

export function realizarLeitura(
  _positions: number[],
  _spreadType: '8x4+4' | '9x4',
  _pergunta?: string
): { cards: unknown[]; summary: string } {
  return { cards: [], summary: '' };
}