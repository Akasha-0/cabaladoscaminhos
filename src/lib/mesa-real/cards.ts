// ============================================================
// MESA REAL — Adaptador de Cartas
// ============================================================

import { HOUSES_36 } from '@/lib/divination/house-delegation';
import { LENORMAND_CARDS } from '@/lib/lenormand/data';

export interface CartaCigana {
  numero: number;
  nome: string;
  categoria: 'figura' | 'animal' | 'objeto' | 'natureza' | 'abstrato';
}

const CATEGORIAS: Record<number, CartaCigana['categoria']> = {
  1: 'figura', 2: 'natureza', 3: 'objeto', 4: 'objeto', 5: 'natureza',
  6: 'natureza', 7: 'animal', 8: 'objeto', 9: 'natureza', 10: 'objeto',
  11: 'objeto', 12: 'animal', 13: 'figura', 14: 'animal', 15: 'animal',
  16: 'natureza', 17: 'animal', 18: 'animal', 19: 'objeto', 20: 'natureza',
  21: 'natureza', 22: 'abstrato', 23: 'animal', 24: 'objeto', 25: 'objeto',
  26: 'objeto', 27: 'objeto', 28: 'figura', 29: 'figura', 30: 'natureza',
  31: 'natureza', 32: 'natureza', 33: 'objeto', 34: 'animal', 35: 'objeto',
  36: 'abstrato',
};

export const CARTAS_CIGANAS: CartaCigana[] = HOUSES_36.map((house) => ({
  numero: house.number,
  nome: LENORMAND_CARDS[house.number - 1] ?? house.cartaCigana,
  categoria: CATEGORIAS[house.number] ?? 'objeto',
}));

export function getCartaByNumero(numero: number): CartaCigana | undefined {
  return CARTAS_CIGANAS.find((c) => c.numero === numero);
}
