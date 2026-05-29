// Biorritmo data

export interface BiorritmoData {
  title: string;
  description: string;
  items: BiorritmoItem[];
}

export interface BiorritmoItem {
  id: number;
  name: string;
  value: string;
  meaning: string;
}

const biorritmoData: BiorritmoData = {
  title: "Biorritmo",
  description: " Ciclos biol\u00f3gicos fundamentales de ritmo y conexi\u00f3n.",
  items: [
    {
      id: 1,
      name: "Ritmo F\u00edsico",
      value: "23",
      meaning: "Ciclo de vitalidad y resistencia f\u00edsica, renew every 23 days.",
    },
    {
      id: 2,
      name: "Ritmo Emocional",
      value: "28",
      meaning: "Ciclo de sensibilidad y estado an\u00edmico, renew every 28 days.",
    },
    {
      id: 3,
      name: "Ritmo Intelectual",
      value: "33",
      meaning: "Ciclo de claridad mental y creatividad, renew every 33 days.",
    },
    {
      id: 4,
      name: "Armon\u00eda de Ciclos",
      value: " sincron\u00eda",
      meaning: "Aligning physical, emotional and intellectual rhythms for balance.",
    },
    {
      id: 5,
      name: "Punto Cr\u00edtico",
      value: "d\u00eda 0",
      meaning: "Day when all rhythms intersect, requiring extra care.",
    },
    {
      id: 6,
      name: "Altibajos",
      value: "fase",
      meaning: "Natural high and low periods within each cycle.",
    },
    {
      id: 7,
      name: "Recuperaci\u00f3n",
      value: "reinicio",
      meaning: "Starting point of a new cycle, fresh energy and potential.",
    },
    {
      id: 8,
      name: "Estabilidad",
      value: "equilibrio",
      meaning: "Mid-cycle peak for optimal performance and clarity.",
    },
    {
      id: 9,
      name: "Sintonia",
      value: "conexi\u00f3n",
      meaning: "Aligning personal cycles with natural and cosmic rhythms.",
    },
    {
      id: 10,
      name: "Transformaci\u00f3n",
      value: "evoluci\u00f3n",
      meaning: "Growth and metamorphosis through understanding cycle patterns.",
    },
  ],
};

export function getData(): BiorritmoData {
  return biorritmoData;
}