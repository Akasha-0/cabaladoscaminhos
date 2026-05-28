export interface LogunedData {
  name: string;
  description: string;
  attributes: string[];
  symbols: string[];
  days: string[];
  offerings: string[];
  prayers: string[];
}

export function getData(): LogunedData {
  return {
    name: "Loguned",
    description: "Loguned é um Orixá que representa a intelectualidade, a comunicação e a sabedoria. É filho de Oxumambi e Obaluayé, conhecido como o patrono dos iyawós e dos iniciados.",
    attributes: [
      "Inteligência",
      "Sabedoria",
      "Comunicação",
      "Oração",
      "Proteção espiritual",
      "Conhecimento ancestral"
    ],
    symbols: [
      "Lança de ferro",
      "Escudo",
      "Adaga cerimonial",
      "Fio de contas azuis e brancas",
      "Ervas sagradas"
    ],
    days: [
      "Segunda-feira",
      "Dias de orações específicas"
    ],
    offerings: [
      "Milho torrado",
      "Amendoim",
      "Mel",
      "Água de obi",
      "Folhas verdes"
    ],
    prayers: [
      "Orokum Logunedê",
      "Logunedê me dá ouvidos",
      "Prece para proteção intelectual"
    ]
  };
}