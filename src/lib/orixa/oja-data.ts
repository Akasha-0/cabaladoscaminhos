// @ts-nocheck
// SKIP_LINT

/**
 * Oja Data Module
 * Spiritual data for Oja, the orixá of sacred medicine, healing fire, and transformative wisdom
 */

export interface OjaData {
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
  sacredObjects: string[];
  invocationPhrases: string[];
  domains: string[];
}

export interface HealingAspect {
  name: string;
  description: string;
  energy: string;
}

export interface MedicineGift {
  name: string;
  description: string;
  application: string;
}

export interface PathOfOja {
  name: string;
  description: string;
  attributes: string[];
}

const OJA_DATA: OjaData = {
  name: "Oja",
  orisha: "Oja",
  path: "Fogo Sagrado da Cura",
  colors: ["dourado", "amarelo-ouro"],
  dayOfWeek: "terça-feira",
  offerings: ["mel", "canela", "gengibre", "óleo de coco", "velas douradas", "flores amarelas"],
  attributes: [
    "cura",
    "medicina",
    "sabedoria ancestral",
    "transformação",
    "rejuvenescimento",
    "conhecimento herbal",
    "energia vital",
    "purificação"
  ],
  syncPath: "cura",
  element: "fogo",
  modality: "transformative",
  sacredObjects: [
    "pá",
    "pilão",
    "almofariz",
    "velas douradas",
    "incenso de canela",
    "pó de curcuma",
    "flor de maracujá"
  ],
  invocationPhrases: [
    "Oja, purifica meu sangue",
    "Oja, transforma minha dor em sabedoria",
    "Oja, acende a cura em mim"
  ],
  domains: [
    "cura física",
    "cura emocional",
    "medicina herbal",
    "rejuvenescimento",
    "desintoxicação",
    "sabedoria curativa",
    "proteção sanitária",
    "enfermaria sagrada"
  ]
};

const healingAspects: HealingAspect[] = [
  {
    name: "Oja Oxí",
    description: "O aspecto da cura que dissipa todas as enfermidades",
    energy: "purificação"
  },
  {
    name: "Oja Ewé",
    description: "O mestre das folhas e ervas medicinais",
    energy: "natureza"
  },
  {
    name: "Oja Ikù",
    description: "O guardião que afasta a morte e a doença",
    energy: "proteção"
  },
  {
    name: "Oja Tuntun",
    description: "O restaurador que renova corpo e espírito",
    energy: "rejuvenescimento"
  },
  {
    name: "Oja Aró",
    description: "O unguento sagrado que cura feridas profundas",
    energy: "restituição"
  },
  {
    name: "Oja Púpò",
    description: "O purificador do sangue e das águas do corpo",
    energy: "sangue"
  }
];

const medicineGifts: MedicineGift[] = [
  {
    name: "Fogo Curativo",
    description: "A capacidade de aquecer e transformar a doença em saúde",
    application: "invocar Oja para processos de cura física"
  },
  {
    name: "Sabedoria Herbal",
    description: "O conhecimento das plantas que curam",
    application: "estudar ervas com a bênção de Oja"
  },
  {
    name: "Restauração Vital",
    description: "A força de rejuvenescer tecidos e energia",
    application: "pedir a Oja para renovação do corpo"
  },
  {
    name: "Purificação Sagrada",
    description: "O dom de limpar o sangue e o espírito",
    application: "ritual de desintoxicação com mel e canela"
  },
  {
    name: "Proteção Sanitária",
    description: "A guarda contra enfermidades e pragas",
    application: "proteger espaços de doença"
  }
];

const pathsOfOja: PathOfOja[] = [
  {
    name: "Curandeiro",
    description: "Oja como aquele que cura enfermidades do corpo",
    attributes: ["medicina", "ervas", "ritual"]
  },
  {
    name: "Purificador",
    description: "Oja como o fogo que queima a doença",
    attributes: ["purificação", "fogo", "limpeza"]
  },
  {
    name: "Restaurador",
    description: "Oja como aquele que renova a vida",
    attributes: ["rejuvenescimento", "restauração", "força"]
  },
  {
    name: "Guardião da Saúde",
    description: "Oja como protetor contra todo mal",
    attributes: ["proteção", "vigilância", "barreira"]
  },
  {
    name: "Mestre das Ervas",
    description: "Oja como conhecedor de todos os remédios",
    attributes: ["sabedoria herbal", "plantas", "conhecimento"]
  }
];

export function getData(): OjaData {
  return OJA_DATA;
}

function getDataById(id: string): OjaData | undefined {
  return id === 'oja' ? OJA_DATA : undefined;
}

function getHealingAspects(): HealingAspect[] {
  return healingAspects;
}

function getMedicineGifts(): MedicineGift[] {
  return medicineGifts;
}

function getPaths(): PathOfOja[] {
  return pathsOfOja;
}

function getSacredObjects(): string[] {
  return OJA_DATA.sacredObjects;
}

function getInvocationPhrases(): string[] {
  return OJA_DATA.invocationPhrases;
}

function getDomains(): string[] {
  return OJA_DATA.domains;
}

function getOjaByElement(element: string): OjaData | undefined {
  return OJA_DATA.element.toLowerCase().includes(element.toLowerCase()) ? OJA_DATA : undefined;
}

function getOjaByDay(day: string): OjaData | undefined {
  return OJA_DATA.dayOfWeek.toLowerCase().includes(day.toLowerCase()) ? OJA_DATA : undefined;
}