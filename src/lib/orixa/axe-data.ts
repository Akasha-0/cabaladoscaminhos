// Axe data

export interface AxeData {
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

const axeData: AxeData[] = [
  {
    name: "Axe",
    orisha: "Axe",
    path: "Lâmina Sagrada",
    colors: ["preto", "branco"],
    dayOfWeek: "sexta-feira",
    offerings: ["axe", "lamina", "pedra", "carvao", "animais"],
    attributes: ["poder", "corte", "decisao", "transformacao", "protecao"],
    syncPath: "poder",
    element: "metal",
    modality: "active"
  }
];

export function getData(): AxeData[] {
  return axeData;
}