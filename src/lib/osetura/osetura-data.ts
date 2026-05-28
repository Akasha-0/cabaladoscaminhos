// Osetura data
// spiritual beings in Kabbalistic tradition

export interface Osetura {
  name: string;
  element: string;
  domain: string;
  description: string;
}

const OSETURA_DATA: Osetura[] = [
  {
    name: "Osetura das Águas",
    element: "água",
    domain: "emoções, purificação, ciclos",
    description: "Guardiã das águas e dos ciclos emocionais."
  },
  {
    name: "Osetura do Fogo",
    element: "fogo",
    domain: "transformação, vitalidade, proteção",
    description: "Protetora da chama vital e da transformação."
  },
  {
    name: "Osetura da Terra",
    element: "terra",
    domain: "ancoragem, prosperidade, harvest",
    description: "Guardiã da terra e das colheitas."
  },
  {
    name: "Osetura do Ar",
    element: "ar",
    domain: "comunicação, clareza mental, liberdade",
    description: "Senhora dos ventos e da mente clara."
  },
  {
    name: "Osetura dos Caminhos",
    element: "ETER",
    domain: "trilhas, decisões, destino",
    description: "Guardiã dos caminhos e das encruzilhadas."
  }
];

export function getData(): Osetura[] {
  return OSETURA_DATA;
}