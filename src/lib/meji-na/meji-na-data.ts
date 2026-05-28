// Meji-na data

export interface MejiNaData {
  title: string;
  description: string;
  items: MejiNaItem[];
}

export interface MejiNaItem {
  id: number;
  name: string;
  value: string;
  meaning: string;
}

const mejiNaData: MejiNaData = {
  title: "Meji-Na",
  description: "Conjunto de prácticas y rituales del camino na.",
  items: [
    {
      id: 1,
      name: "Respiración Consciente",
      value: "1",
      meaning: "Awareness of breath as the foundation of spiritual practice.",
    },
    {
      id: 2,
      name: "Meditación de Silencio",
      value: "2",
      meaning: "Cultivating inner stillness through silent contemplation.",
    },
    {
      id: 3,
      name: "Unión con la Luz",
      value: "3",
      meaning: "Connecting with divine light within and without.",
    },
    {
      id: 4,
      name: "Armonía Interior",
      value: "4",
      meaning: "Balancing mind, body, and spirit in equilibrium.",
    },
    {
      id: 5,
      name: "Sabiduría Ancestral",
      value: "5",
      meaning: "Accessing wisdom passed down through generations.",
    },
    {
      id: 6,
      name: "Transformación",
      value: "6",
      meaning: "The alchemical process of personal metamorphosis.",
    },
    {
      id: 7,
      name: "Integración",
      value: "7",
      meaning: "Bringing together all aspects of being into wholeness.",
    },
    {
      id: 8,
      name: "Expansión",
      value: "8",
      meaning: "Extending consciousness beyond ordinary boundaries.",
    },
    {
      id: 9,
      name: "Iluminación",
      value: "9",
      meaning: "The culmination of the spiritual journey.",
    },
    {
      id: 10,
      name: "Retorno al Origen",
      value: "10",
      meaning: "Returning to the source from which all emerges.",
    },
  ],
};

export function getData(): MejiNaData {
  return mejiNaData;
}
