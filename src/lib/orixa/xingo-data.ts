// Xingo data

export interface XingoData {
  name: string;
  description: string;
  characteristics: string[];
  keywords: string[];
}

const xingoDataset: XingoData[] = [
  {
    name: "Xingo Primário",
    description: "Xingo carregando dados fundamentais de Orixá.",
    characteristics: ["fundamento", "raiz", "iniciação"],
    keywords: ["xingo", "orixá", "base"]
  },
  {
    name: "Xingo Secundário",
    description: "Xingo com propriedades secundárias de Orixá.",
    characteristics: ["complemento", "expansão", "evolução"],
    keywords: ["xingo", "complemento", "caminho"]
  }
];

export function getData(): XingoData[] {
  return xingoDataset;
}