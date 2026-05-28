export interface EnergyFieldData {
  name: string;
  description: string;
  vibrationLevel: number;
  frequency: number;
  elements: string[];
  associations: {
    chakra?: string;
    planet?: string;
    element?: string;
    color?: string;
  };
}

const energyFields: EnergyFieldData[] = [
  {
    name: "Cristal",
    description: "Campo energético de alta vibración, associado à clareza mental e purificação.",
    vibrationLevel: 7,
    frequency: 768,
    elements: ["luz", "clareza", "purificação"],
    associations: {
      chakra: "coroa",
      planet: "quartz",
      element: "luz",
      color: "branco",
    },
  },
  {
    name: "Amor",
    description: "Campo energético de vibração condicional, associado ao amor e compaixão.",
    vibrationLevel: 6,
    frequency: 528,
    elements: ["amor", "compaixão", "harmonia"],
    associations: {
      chakra: "coração",
      planet: "vênus",
      element: "água",
      color: "verde-rosa",
    },
  },
  {
    name: "Força",
    description: "Campo energético de vibração condicional, associado à coragem e superação.",
    vibrationLevel: 5,
    frequency: 396,
    elements: ["coragem", "força", "resiliência"],
    associations: {
      chakra: "raiz",
      planet: "marte",
      element: "fogo",
      color: "vermelho",
    },
  },
  {
    name: "Paz",
    description: "Campo energético de vibração condicional, associado à serenidade e equilíbrio.",
    vibrationLevel: 4,
    frequency: 432,
    elements: ["paz", "serenidade", "equilíbrio"],
    associations: {
      chakra: "sacro",
      planet: "netuno",
      element: "água",
      color: "azul",
    },
  },
  {
    name: "Transcendência",
    description: "Campo energético de alta vibração, associado à elevação espiritual.",
    vibrationLevel: 8,
    frequency: 963,
    elements: ["espírito", "elevação", "união"],
    associations: {
      chakra: "coroa",
      planet: "urano",
      element: "éter",
      color: "dourado",
    },
  },
  {
    name: "Proteção",
    description: "Campo energético de vibração condicional, associado à segurança e defesa.",
    vibrationLevel: 3,
    frequency: 285,
    elements: ["proteção", "segurança", "defesa"],
    associations: {
      chakra: "raiz",
      planet: "saturno",
      element: "terra",
      color: "preto",
    },
  },
  {
    name: "Manifestação",
    description: "Campo energético de vibração condicional, associado à intenção e criação.",
    vibrationLevel: 5,
    frequency: 639,
    elements: ["manifestação", "criação", "intenção"],
    associations: {
      chakra: "sacro",
      planet: "júpiter",
      element: "fogo",
      color: "laranja",
    },
  },
  {
    name: "Intuição",
    description: "Campo energético de alta vibração, associado à sabedoria interior e revelação.",
    vibrationLevel: 6,
    frequency: 741,
    elements: ["intuição", "sabedoria", "revelação"],
    associations: {
      chakra: "terceiro olho",
      planet: "mercury",
      element: "ar",
      color: "anil",
    },
  },
];

export function getData(): EnergyFieldData[] {
  return energyFields;
}
