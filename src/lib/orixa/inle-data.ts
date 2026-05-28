// Inle - Orixá associated with the moon, medicine, and fishermen

export interface InleData {
  name: string;
  origin: string;
  dayOfWeek: string;
  sacredNumber: string;
  elements: string[];
  colors: string[];
  offerings: string[];
  qualities: string[];
  symbols: string[];
}

export function getData(): InleData {
  return {
    name: "Inle",
    origin: "Yorubá",
    dayOfWeek: "Segunda-feira",
    sacredNumber: "7",
    elements: ["Lua", "Água", "Mercúrio"],
    colors: ["Azul claro", "Branco", "Prata"],
    offerings: ["Peixe fresco", "Farinha branca", "Mel", "Água cristalina"],
    qualities: ["Sabedoria", "Beleza", "Equilíbrio", "Medicina", "Comunicação"],
    symbols: ["Espelho", "Fio de contas branco e azul", "Canoa"],
  };
}
