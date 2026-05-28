 
/* prettier-ignore */
// @ts-nocheck

/**
 * Muzemi Data Module
 * Spiritual data for Muzemi, the orixá of transformation and dream journeys
 */

export interface MuzemiData {
  name: string;
  orisha: string;
  path: string;
  colors: string[];
  dayOfWeek: string;
  offerings: string[];
  attributes: string[];
  syncPath: string;
  element: string;
  modality: string;
}

const muzemiData: MuzemiData[] = [
  {
    name: "Muzemi",
    orisha: "Muzemi",
    path: "Senhor das Transformacoes",
    colors: ["roxo", "dourado", "branco"],
    dayOfWeek: "domingo",
    offerings: ["flores brancas", "agua de cheiro", "vela roxa", "coco", "perfume"],
    attributes: ["transformacao", "sonhos", "metamorfose", "mistério", "renovacao"],
    syncPath: "transformacao",
    element: "éter",
    modality: "receptive"
  }
];

export function getData(): MuzemiData[] {
  return muzemiData;
}
