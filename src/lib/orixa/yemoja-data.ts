export interface YemojaData {
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

const yemojaData: YemojaData[] = [
  {
    name: "Yemoja",
    orisha: "Yemoja",
    path: "Mãe das Águas",
    colors: ["azul", "branco"],
    dayOfWeek: "sábado",
    offerings: ["mariscos", "coco", "mel", "flores brancas"],
    attributes: ["maternidade", "proteção", "intuição", "nascimento"],
    syncPath: "intuicao",
    element: "água",
    modality: "receptive"
  }
];

export function getData(): YemojaData[] {
  return yemojaData;
}