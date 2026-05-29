// Mesa Real - Lenormand card spreads
export interface CardPosition {
  position: number;
  house: string;
  card: string;
}

export const MESA_REAL_SPREADS = {
  '9x4': 'Mesa Real de 36 cartas',
  '8x4+4': 'Mesa com 4 laterais',
};

export function realizarLeitura(format: '8x4+4' | '9x4', seed?: number): CardPosition[] {
  return [];
}
