// Ejiokô Odu data

export interface EjiokoData {
  nome: string;
  numero: number;
  significado: string;
  elemento: string;
  planeta: string;
  orixaRegente: string;
  quizilas: string[];
  preceptos: string[];
  ebos: string[];
}

export function getData(): EjiokoData {
  return {
    nome: "Ejiokô",
    numero: 2,
    significado: "A dualidade, os caminhos duplos, união e disputa. Vitória após grandes lutas.",
    elemento: "Ar / Terra",
    planeta: "Mercúrio",
    orixaRegente: "Ibeji, Ogum",
    quizilas: ["Comer ovos", "rã", "mentir ou trair a confiança dos outros"],
    preceptos: ["Manter a alegria interna", "cuidar da criança interior", "buscar sociedades justas"],
    ebos: ["Doces, frutas para Ibeji", "comidas leves em praças ou jardins"],
  };
}
