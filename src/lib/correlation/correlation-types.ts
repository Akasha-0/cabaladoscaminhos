// Correlation Types
export interface OduCorrelation {
  tarot: string;
  arcanoNumber: number;
  orixas: string[];
  elementos: string[];
  affirmation: string;
}

export const ODU_TAROT_CORRELATIONS: Record<number, string> = {
  1: 'O Mago', 2: 'A Sacerdotisa', 3: 'A Imperatriz', 4: 'O Imperador', 5: 'O Hierofante',
  6: 'Os Enamorados', 7: 'O Carro', 8: 'A Força', 9: 'O Eremita', 10: 'A Roda da Fortuna',
  11: 'A Justiça', 12: 'O Louco', 13: 'A Morte', 14: 'A Temperança', 15: 'O Diabo',
  16: 'A Torre', 17: 'A Estrela', 18: 'A Lua', 19: 'O Sol', 20: 'O Julgamento', 21: 'O Mundo',
};

export function getOduCorrelations(oduNumber: number): OduCorrelation {
  return { tarot: ODU_TAROT_CORRELATIONS[oduNumber] || 'Desconhecido', arcanoNumber: oduNumber, orixas: ['Oxalá'], elementos: ['Ar'], affirmation: 'Luz' };
}
