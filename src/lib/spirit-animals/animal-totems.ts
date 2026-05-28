export interface AnimalTotem {
  name: string;
  meaning: string;
  element: string;
  qualities: string[];
}

const TOTEMS: AnimalTotem[] = [
  {
    name: "Lobo",
    meaning: "Intuição, comunidade, sobrevivência",
    element: "Terra",
    qualities: ["líder nato", "protegedor", "lealdade profunda", "conexão ancestral"]
  },
  {
    name: "Águia",
    meaning: "Visão clara, propósito elevado, coragem",
    element: "Ar",
    qualities: ["sabedoria", "perspectiva", "liberdade", "claridade mental"]
  },
  {
    name: "Cobra",
    meaning: "Transformação, renovação, despertar kundalini",
    element: "Fogo",
    qualities: ["regeneração", "sabedoria antiga", "cura", "sagacidade"]
  },
  {
    name: "Tartaruga",
    meaning: "Paciência, longevidade, sabedoria terrena",
    element: "Água",
    qualities: ["resiliência", "persistência", "conexão com a terra", "memória ancestral"]
  },
  {
    name: "Urso",
    meaning: "Força interior, introspecção, cura",
    element: "Terra",
    qualities: ["poder", "meditação", "solitude restauradora", "proteção"]
  },
  {
    name: "Coruja",
    meaning: "Sabedoria oculta, visão além das aparências",
    element: "Ar",
    qualities: ["discernimento", "misterio", "intuição afiada", "conhecimento esoteric"]
  },
  {
    name: "Cavalo",
    meaning: "Liberdade, força vital, jornada interior",
    element: "Fogo",
    qualities: ["independência", "energia", "nobreza", "velocidade"]
  },
  {
    name: "Raposa",
    meaning: "Astúcia, adaptabilidade, inteligência estratégica",
    element: "Terra",
    qualities: ["enganao sutil", "camuflagem", "oportunismo sagrado", "esperteza"]
  },
  {
    name: "Veado",
    meaning: "Gentileza,grace bajo presión",
    element: "Ar",
    qualities: ["docilidad", "velocidad de pensamiento", "elegancia", "conexión con la naturaleza"]
  },
  {
    name: "SERPENTE",
    meaning: "Energía primordial,sexualidad,renacimiento",
    element: "Fuego",
    qualities: ["fluidez", "poder latente", "renovación", "magia"]
  },
  {
    name: "Gato",
    meaning: "Independencia, misterio, protección psíonica",
    element: "Agua",
    qualities: ["agilidad", "vínculo espiritual", "guardián invisible", "sabiduría nocturna"]
  },
  {
    name: "Búho",
    meaning: "Sabiduría nocturna, percepciones sutiles",
    element: "Aire",
    qualities: ["visión en la oscuridad", "meditación profunda", "magia antigua", "maestría"]
  }
];

export function getTotems(): AnimalTotem[] {
  return TOTEMS;
}

export function getTotemByName(name: string): AnimalTotem | undefined {
  return TOTEMS.find(t => t.name.toLowerCase() === name.toLowerCase());
}

export function searchTotems(query: string): AnimalTotem[] {
  const q = query.toLowerCase();
  return TOTEMS.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.meaning.toLowerCase().includes(q) ||
    t.element.toLowerCase().includes(q) ||
    t.qualities.some(q => q.toLowerCase().includes(q))
  );
}