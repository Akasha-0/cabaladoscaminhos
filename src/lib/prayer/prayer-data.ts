// Prayer data
export interface Prayer {
  id: string;
  name: string;
  description: string;
  type: string;
  duration: number;
  intention: string;
}

export const prayerData: Prayer[] = [
  {
    id: "gratitude",
    name: "Gratitude Prayer",
    description: "Expressing thankfulness for blessings received",
    type: "gratitude",
    duration: 5,
    intention: "appreciation",
  },
  {
    id: "protection",
    name: "Protection Prayer",
    description: "Seeking divine shield and guidance",
    type: "protection",
    duration: 10,
    intention: "safety",
  },
  {
    id: "healing",
    name: "Healing Prayer",
    description: "Sending healing energy to self and others",
    type: "healing",
    duration: 15,
    intention: "restoration",
  },
  {
    id: "guidance",
    name: "Guidance Prayer",
    description: "Asking for clarity and direction in life",
    type: "guidance",
    duration: 10,
    intention: "wisdom",
  },
  {
    id: "peace",
    name: "Peace Prayer",
    description: "Cultivating inner peace and serenity",
    type: "peace",
    duration: 8,
    intention: "tranquility",
  },
];

export function getData(): Prayer[] {
  return prayerData;
}