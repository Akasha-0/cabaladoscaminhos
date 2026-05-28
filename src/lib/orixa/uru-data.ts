// Uru - Orixá associated with fire, smoke, and transformation

export interface UruData {
  name: string;
  origin: string;
  dayOfWeek: string;
  sacredNumber: string;
  elements: string[];
  colors: string[];
  offerings: string[];
  qualities: string[];
  symbols: string[];
  domain: string[];
}

export function getData(): UruData {
  return {
    name: "Uru",
    origin: "Yorubá",
    dayOfWeek: "Quinta-feira",
    sacredNumber: "11",
    elements: ["Fogo", "Fumaça", "Transformação"],
    colors: ["Vermelho", "Laranja", "Preto"],
    offerings: ["Pimenta", "Fumo", "Azeite de dendê", "Carvão"],
    qualities: ["Purificação", "Libertação", "Quebra de maldições", "Renovação"],
    symbols: ["Fogo", "Pimenta", "Panela de barro", "Moinho de uru"],
    domain: ["Fogo", "Fumaça", "Transformação", "Purificação", "Quebra de feitiços"],
  };
}