// ============================================================
// LIFE AREAS ORDER - Ordem de Exibição das Áreas da Vida
// ============================================================
// Define a ordem recomendada para exibir as 12 áreas da vida
// ============================================================
import type { LifeAreaId } from './types';

/**
 * Ordem de exibição recomendada para as 12 áreas da vida.
 * Segue uma lógica iniciática de desenvolvimento espiritual:
 * 1. Propósito (vocação)
 * 2. Carreira (expressão externa)
 * 3. Finanças (recursos materiais)
 * 4. Saúde (corpo físico)
 * 5. Relacionamentos (conexões afetivas)
 * 6. Sexualidade (energia vital/criativa)
 * 7. Família (ancestrais e raízes)
 * 8. Espiritualidade (trancendência)
 * 9. Criatividade (expressão artística)
 * 10. Amizades (coletivo)
 * 11. Conhecimento (sabedoria)
 * 12. Autoconhecimento (integração)
 */
export const LIFE_AREA_ORDER: LifeAreaId[] = [
  'proposito',
  'carreira',
  'financas',
  'saude',
  'relacionamentos',
  'sexualidade',
  'familia',
  'espiritualidade',
  'criatividade',
  'amizades',
  'conhecimento',
  'autoconhecimento',
];

/**
 * Retorna a posição (índice) de uma LifeAreaId na ordem de exibição.
 * Útil para ordenar resultados ou definir prioridades de layout.
 */
export function getLifeAreaOrderIndex(id: LifeAreaId): number {
  return LIFE_AREA_ORDER.indexOf(id);
}

/**
 * Ordena um array de LifeAreaId conforme a ordem de exibição recomendada.
 */
export function sortLifeAreasByOrder(ids: LifeAreaId[]): LifeAreaId[] {
  return [...ids].sort((a, b) => getLifeAreaOrderIndex(a) - getLifeAreaOrderIndex(b));
}
