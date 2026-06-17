/**
 * @akasha/core-iching — Practice Lookup Helpers
 *
 * Índices e funções de busca para o banco de práticas integrativas.
 * Suporta lookup por ID, elemento, tradição, categoria e área da vida.
 */

import type {
  IntegrativePractice,
  Element,
  PracticeCategory,
} from './types';
import { PRACTICES } from './practices';

/** Mapa de práticas por ID para busca rápida. */
export const PRACTICES_BY_ID: Record<string, IntegrativePractice> = Object.fromEntries(
  PRACTICES.map((p) => [p.id, p]),
);

/** Agrupa práticas por elemento. */
export const PRACTICES_BY_ELEMENT: Partial<Record<Element, IntegrativePractice[]>> = {};
for (const p of PRACTICES) {
  const el = p.associations.element;
  if (el) {
    if (!PRACTICES_BY_ELEMENT[el]) PRACTICES_BY_ELEMENT[el] = [];
    PRACTICES_BY_ELEMENT[el]!.push(p);
  }
}

/** Agrupa práticas por tradição. */
export const PRACTICES_BY_TRADITION: Record<string, IntegrativePractice[]> = {};
for (const p of PRACTICES) {
  if (!PRACTICES_BY_TRADITION[p.tradition]) PRACTICES_BY_TRADITION[p.tradition] = [];
  PRACTICES_BY_TRADITION[p.tradition].push(p);
}

/** Agrupa práticas por categoria. */
export const PRACTICES_BY_CATEGORY: Partial<Record<PracticeCategory, IntegrativePractice[]>> = {};
for (const p of PRACTICES) {
  if (!PRACTICES_BY_CATEGORY[p.category]) PRACTICES_BY_CATEGORY[p.category] = [];
  PRACTICES_BY_CATEGORY[p.category]!.push(p);
}

/** Retorna uma prática pelo ID. */
export function getPractice(id: string): IntegrativePractice | undefined {
  return PRACTICES_BY_ID[id];
}

/** Retorna todas as práticas de um elemento. */
export function getPracticesByElement(element: Element): IntegrativePractice[] {
  return PRACTICES_BY_ELEMENT[element] ?? [];
}

/** Retorna todas as práticas de uma tradição. */
export function getPracticesByTradition(tradition: string): IntegrativePractice[] {
  return PRACTICES_BY_TRADITION[tradition] ?? [];
}

/** Retorna todas as práticas de uma categoria. */
export function getPracticesByCategory(category: PracticeCategory): IntegrativePractice[] {
  return PRACTICES_BY_CATEGORY[category] ?? [];
}

/** Retorna todas as práticas que afetam uma área da vida. */
export function getPracticesByLifeArea(lifeArea: string): IntegrativePractice[] {
  const normalized = lifeArea.toLowerCase().trim();
  return PRACTICES.filter((p) =>
    p.lifeAreas.some((area) => area.toLowerCase().includes(normalized)),
  );
}

/** Retorna todas as práticas integrativas (cópia superficial). */
export function getAllPractices(): IntegrativePractice[] {
  return [...PRACTICES];
}
