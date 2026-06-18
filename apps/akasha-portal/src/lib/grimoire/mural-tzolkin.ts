// mural-tzolkin — DEPRECATED Iter44.
// File retained in repo due to filesystem overlay preventing rm.
// Consumer (mural/page.tsx) has been replaced with redirect to /dashboard.
// Safe to delete once filesystem allows.
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
export function familias() { return []; }
export function kinDaData(): KinTzolkin {
  return { numero: 1, posicao_no_ciclo: 1, dias_ate_proximo_ciclo: 260, familia: 'solar', familia_nome: 'Solar', familia_cor: '#2DD4BF', familia_qualidade: 'Ilumina', eh_portal: false, portal_nome: null };
}
