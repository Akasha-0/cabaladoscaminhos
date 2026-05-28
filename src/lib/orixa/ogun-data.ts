// Ogun data

export interface OgunData {
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

const ogunData: OgunData[] = [
  {
    name: "Ogun",
    orisha: "Ogun",
    path: "Ferreiro dos Campos",
    colors: ["verde", "preto"],
    dayOfWeek: "sexta-feira",
    offerings: ["ferro", "facas", "dinheiro", "rapadura", "dende"],
    attributes: ["força", "coragem", "proteção", "justiça", "trabalho"],
    syncPath: "força",
    element: "metal",
    modality: "active"
  }
];

export function getData(): OgunData[] {
  return ogunData;
}
