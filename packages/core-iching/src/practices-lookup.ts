/**
 * @akasha/core-iching — Camada de lookup das práticas integrativas.
 *
 * Extraída de `practices.ts` para reduzir o arquivo de dados
 * (993 linhas) a apenas a constante `PRACTICES`. Esta camada
 * expõe as funções de busca (id/elemento/tradição/categoria)
 * usadas pelo portal.
 *
 * Os índices são construídos lazy na primeira chamada para
 * quebrar a dependência circular com `practices.ts` (que
 * re-exporta estas funções).
 */

import type { IntegrativePractice, Element, PracticeCategory } from './types';
import { PRACTICES } from './practices';

interface PracticeIndex {
  byId: Record<string, IntegrativePractice>;
  byElement: Partial<Record<Element, IntegrativePractice[]>>;
  byTradition: Record<string, IntegrativePractice[]>;
  byCategory: Partial<Record<PracticeCategory, IntegrativePractice[]>>;
}

let index: PracticeIndex | undefined;

function getIndex(): PracticeIndex {
  if (index) return index;

  const byId = Object.fromEntries(PRACTICES.map((p) => [p.id, p]));
  const byElement: Partial<Record<Element, IntegrativePractice[]>> = {};
  for (const p of PRACTICES) {
    const el = p.associations.element;
    if (el) {
      if (!byElement[el]) byElement[el] = [];
      byElement[el]!.push(p);
    }
  }
  const byTradition: Record<string, IntegrativePractice[]> = {};
  for (const p of PRACTICES) {
    if (!byTradition[p.tradition]) byTradition[p.tradition] = [];
    byTradition[p.tradition].push(p);
  }
  const byCategory: Partial<Record<PracticeCategory, IntegrativePractice[]>> = {};
  for (const p of PRACTICES) {
    if (!byCategory[p.category]) byCategory[p.category] = [];
    byCategory[p.category]!.push(p);
  }

  index = { byId, byElement, byTradition, byCategory };
  return index;
}

/** Retorna uma prática pelo ID. */
export function getPractice(id: string): IntegrativePractice | undefined {
  return getIndex().byId[id];
}

/** Retorna todas as práticas de um elemento. */
export function getPracticesByElement(element: Element): IntegrativePractice[] {
  return getIndex().byElement[element] ?? [];
}

/** Retorna todas as práticas de uma tradição. */
export function getPracticesByTradition(tradition: string): IntegrativePractice[] {
  return getIndex().byTradition[tradition] ?? [];
}

/** Retorna todas as práticas de uma categoria. */
export function getPracticesByCategory(category: PracticeCategory): IntegrativePractice[] {
  return getIndex().byCategory[category] ?? [];
}

/** Retorna todas as práticas que afetam uma área da vida. */
export function getPracticesByLifeArea(lifeArea: string): IntegrativePractice[] {
  const normalized = lifeArea.toLowerCase().trim();
  return PRACTICES.filter((p) =>
    p.lifeAreas.some((area) => area.toLowerCase().includes(normalized))
  );
}

/** Retorna todas as práticas integrativas. */
export function getAllPractices(): IntegrativePractice[] {
  return [...PRACTICES];
}
