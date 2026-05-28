// Prana data

export type PranaData = {
  id: string;
  name: string;
  description: string;
  attributes: {
    element: string;
    direction: string;
    chakra: string;
  };
  qualities: string[];
  practices: string[];
};

export const pranaData: PranaData[] = [
  {
    id: "prana",
    name: "Prana",
    description: "The vital life force that pervades all existence, the primary breath of consciousness.",
    attributes: {
      element: "Ether",
      direction: "Inward",
      chakra: "Heart/Anahata",
    },
    qualities: ["expansion", "vitality", "clarity", "presence"],
    practices: ["pranayama", "meditation", "breath awareness"],
  },
  {
    id: "apana",
    name: "Apana",
    description: "The downward flowing vital force, responsible for elimination and grounding.",
    attributes: {
      element: "Earth",
      direction: "Downward",
      chakra: "Root/Muladhara",
    },
    qualities: ["grounding", "stability", "release", "elimination"],
    practices: ["mula bandha", "root lock", "grounding meditation"],
  },
  {
    id: "samana",
    name: "Samana",
    description: "The balancing vital force that harmonizes opposing energies in the body.",
    attributes: {
      element: "Fire",
      direction: "Inward/Center",
      chakra: "Navel/Manipura",
    },
    qualities: ["balance", "harmony", "digestion", "transformation"],
    practices: ["naval breathing", "agni sara", "balance practices"],
  },
  {
    id: "prana-sushumna",
    name: "Prana in Sushumna",
    description: "The upward moving vital force that travels through the central channel.",
    attributes: {
      element: "Fire/Air",
      direction: "Upward",
      chakra: "All chakras along Sushumna",
    },
    qualities: ["ascension", "awakening", "spiritual ascent", "liberation"],
    practices: ["sushumna breathing", " Kundalini practices", "channel clearing"],
  },
  {
    id: "udana",
    name: "Udana",
    description: "The upward moving vital force that governs speech and spiritual development.",
    attributes: {
      element: "Air/Ether",
      direction: "Upward",
      chakra: "Throat/Vishuddha",
    },
    qualities: ["expression", "growth", "evolution", "throat resonance"],
    practices: ["throat breathing", "chanting", "soundwork"],
  },
  {
    id: "vyana",
    name: "Vyana",
    description: "The pervasive vital force that circulates throughout the entire body.",
    attributes: {
      element: "Air",
      direction: "Outward/Circulating",
      chakra: "All chakras",
    },
    qualities: ["circulation", "distribution", "unity", "wholeness"],
    practices: ["full body breathing", "expansion visualization", "energy circulation"],
  },
];

export function getData(): PranaData[] {
  return pranaData;
}
