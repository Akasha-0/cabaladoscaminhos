// @ts-nocheck
// Odi data — The Ifá Divination System

export interface OdiEntity {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  category: string;
  practice: string;
}

export interface OdiData {
  entities: OdiEntity[];
  aspects: string[];
}

const entities: OdiEntity[] = [
  {
    id: "odi-001",
    name: "Eji-Ogbè",
    description: "The sign of the Supreme Creator, representing perfect beginning and divine intention.",
    characteristics: ["Perfection", "Divine Will", "Creation", "Wholeness"],
    category: "primary-sign",
    practice: "Invocation of divine purpose"
  },
  {
    id: "odi-002",
    name: "Owonrin Meji",
    description: "The sign of cosmic cycles, symbolizing the eternal rotation of destiny and time.",
    characteristics: ["Cycles", "Transformation", "Rhythm", "Eternity"],
    category: "primary-sign",
    practice: "Meditation on cyclical time"
  },
  {
    id: "odi-003",
    name: "Ogbe-Béyọnu",
    description: "The sign of expanding fortune, indicating growth and the opening of new paths.",
    characteristics: ["Expansion", "Abundance", "Opportunity", "Growth"],
    category: "fortune-sign",
    practice: "Opening the paths of prosperity"
  },
  {
    id: "odi-004",
    name: "Ọyọnukàn",
    description: "The sign of the middle path, representing balance between opposing forces.",
    characteristics: ["Balance", "Equilibrium", "Justice", "Harmony"],
    category: "balance-sign",
    practice: "Walking the path of equilibrium"
  },
  {
    id: "odi-005",
    name: "Irosun Meji",
    description: "The sign of inner wisdom, indicating deep spiritual insight and knowledge from within.",
    characteristics: ["Intuition", "Inner Knowledge", "Spiritual Insight", "Wisdom"],
    category: "wisdom-sign",
    practice: "Cultivating inner knowing"
  },
  {
    id: "odi-006",
    name: "Ọsá Gbeyọnu",
    description: "The sign of unexpected changes, representing the transformative power of obstacles.",
    characteristics: ["Transformation", "Challenge", "Renewal", "Breakthrough"],
    category: "transformation-sign",
    practice: "Embracing necessary change"
  },
  {
    id: "odi-007",
    name: "Iwori Méyi",
    description: "The sign of wisdom beyond age, indicating spiritual maturity regardless of years.",
    characteristics: ["Maturity", "Wisdom", "Experience", "Truth"],
    category: "wisdom-sign",
    practice: "Honoring ancient wisdom"
  },
  {
    id: "odi-008",
    name: "Odí Méyi",
    description: "The sign of completion, representing cycles fulfilled and new beginnings on the horizon.",
    characteristics: ["Completion", "Fulfillment", "New Beginnings", "Integration"],
    category: "completion-sign",
    practice: "Completing unfinished cycles"
  },
  {
    id: "odi-009",
    name: "Ogonda Gbeyọnu",
    description: "The sign of gifts from the divine, indicating grace and unearned blessings.",
    characteristics: ["Grace", "Blessings", "Divine Favor", "Gift"],
    category: "grace-sign",
    practice: "Receiving divine gifts"
  },
  {
    id: "odi-010",
    name: "Ọsá Réyọnu",
    description: "The sign of spiritual warfare and necessary purification through challenge.",
    characteristics: ["Purification", "Strength", "Courage", "Victory"],
    category: "purification-sign",
    practice: "Purification through trial"
  },
  {
    id: "odi-011",
    name: "Ogbe Yónu",
    description: "The sign of secret wisdom, indicating hidden knowledge waiting to be revealed.",
    characteristics: ["Secrets", "Hidden Knowledge", "Discovery", "Revelation"],
    category: "mystery-sign",
    practice: "Uncovering hidden truths"
  },
  {
    id: "odi-012",
    name: "Ọ̀pẹ̀lá",
    description: "The sign of the sacred chain, representing the interconnection of all spiritual forces.",
    characteristics: ["Connection", "Chain of Life", "Interlinking", "Unity"],
    category: "connection-sign",
    practice: "Weaving the sacred chain"
  }
];

const aspects: string[] = [
  "Divination Guidance",
  "Ancestral Connection",
  "Destiny Reading",
  "Spiritual Wisdom",
  "Sacred Communication",
  "Oracle Interpretation",
  "Life Path Consulting",
  "Mystical Insight"
];

function buildData(): OdiData {
  return {
    entities,
    aspects
  };
}

// Singleton cache
let cachedData: OdiData | null = null;

export function getData(): OdiData {
  if (!cachedData) {
    cachedData = buildData();
  }
  return cachedData;
}

export function getEntityById(id: string): OdiEntity | undefined {
  return entities.find((e) => e.id === id);
}

export function getEntitiesByCategory(category: string): OdiEntity[] {
  return entities.filter((e) => e.category === category);
}

export function getEntitiesByCharacteristic(char: string): OdiEntity[] {
  return entities.filter((e) => e.characteristics.includes(char));
}

export function getCategories(): string[] {
  const categories = new Set(entities.map((e) => e.category));
  return Array.from(categories);
}

export function getAspects(): string[] {
  return [...aspects];
}
