// Osha data

export interface OshaData {
  name: string;
  description: string;
  characteristics: string[];
  keywords: string[];
}

const oshaDataset: OshaData[] = [
  {
    name: "Osha Primário",
    description: "Osha carregando dados fundamentais de Orixá.",
    characteristics: ["fundamento", "raiz", "iniciação"],
    keywords: ["osha", "orixá", "base"]
  },
  {
    name: "Osha Secundário",
    description: "Osha com propriedades secundárias de Orixá.",
    characteristics: ["complemento", "expansão", "evolução"],
    keywords: ["osha", "complemento", "caminho"]
  }
];

export function getData(): OshaData[] {
  return oshaDataset;
}