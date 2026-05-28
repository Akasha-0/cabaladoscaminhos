// Totem guide — personal spirit animal totems

export interface Guide {
  name: string;
  description: string;
  personalTotems: string[];
}

const GUIDES: Guide[] = [
  {
    name: "Wolf",
    description: "Intuição, lealdade e conexão com o caminho interior.",
    personalTotems: ["Falcão", "Coruja", "Veado", "Urso"],
  },
  {
    name: "Eagle",
    description: "Visão elevada, coragem e sabedoria espiritual.",
    personalTotems: ["Lobo", "Serpente", "Tartaruga", "Búfalo"],
  },
  {
    name: "Bear",
    description: "Força interior, solitude restauradora e proteção.",
    personalTotems: ["Raposa", "Cervo", "Corvo", "Salamandra"],
  },
  {
    name: "Serpent",
    description: "Renovação, transformação e energia kundalini.",
    personalTotems: ["Águia", "Lobo", "Borboleta", "Fênix"],
  },
  {
    name: "Owl",
    description: "Sabedoria oculta, visão além das aparências.",
    personalTotems: ["Serpente", "Corvo", "Raposa", "Cobra"],
  },
  {
    name: "Butterfly",
    description: "Metamorfose, leveza e libertação de padrões.",
    personalTotems: ["Borboleta", "Colibri", "Libélula", "Mariposa"],
  },
];

export function getGuide(): Guide {
  return GUIDES[Math.floor(Math.random() * GUIDES.length)];
}