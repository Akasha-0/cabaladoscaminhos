export interface EnergyType {
  id: string;
  name: string;
  namePt: string;
  nameEn: string;
  description: string;
  descriptionPt: string;
  characteristics: string[];
  associatedPractices: string[];
  color: string;
  colorHex: string;
  element: string;
}

const energyTypes: EnergyType[] = [
  {
    id: "yang",
    name: "Yang",
    namePt: "Yang",
    nameEn: "Yang",
    description: "Active, expansive, and masculine energy associated with light, heat, and outward movement.",
    descriptionPt: "Energia ativa, expansiva e masculina associada à luz, calor e movimento outward.",
    characteristics: ["Expansive", "Active", "Light", "Warm", "Outward", "Assertive"],
    associatedPractices: ["Sun salutation", "Active meditation", "Breath of fire"],
    color: "Golden",
    colorHex: "#FFD700",
    element: "Fire",
  },
  {
    id: "yin",
    name: "Yin",
    namePt: "Yin",
    nameEn: "Yin",
    description: "Passive, receptive, and feminine energy associated with darkness, coolness, and inward movement.",
    descriptionPt: "Energia passiva, receptiva e feminina associada à escuridão, frescor e movimento inward.",
    characteristics: ["Receptive", "Passive", "Dark", "Cool", "Inward", "Nurturing"],
    associatedPractices: ["Yin yoga", "Restorative meditation", "Moon meditation"],
    color: "Silver",
    colorHex: "#C0C0C0",
    element: "Water",
  },
  {
    id: "prana",
    name: "Prana",
    namePt: "Prana",
    nameEn: "Prana",
    description: "Universal life force energy that flows through all living things.",
    descriptionPt: "Força vital universal que flui através de todos os seres vivos.",
    characteristics: ["Vital", "Dynamic", "Flowing", "Universal", "Transformative"],
    associatedPractices: ["Pranayama", "Breathwork", "Yoga"],
    color: "Green",
    colorHex: "#00FF00",
    element: "Air",
  },
  {
    id: "qi",
    name: "Qi",
    namePt: "Qi",
    nameEn: "Qi",
    description: "Chinese concept of vital energy that circulates through meridian pathways.",
    descriptionPt: "Conceito chinês de energia vital que circula através de caminhos meridianos.",
    characteristics: ["Circulating", "Balancing", "Rooted", "Ancient", "Healing"],
    associatedPractices: ["Qigong", "Acupuncture", "Tai Chi"],
    color: "Red",
    colorHex: "#FF0000",
    element: "Wood",
  },
  {
    id: "chakra",
    name: "Chakra",
    namePt: "Chakra",
    nameEn: "Chakra",
    description: "Energy centers aligned along the spine, each governing different aspects of physical and spiritual health.",
    descriptionPt: "Centros de energia alinhados ao longo da coluna vertebral, cada um governando diferentes aspectos de saúde física e spiritual.",
    characteristics: ["Centered", "Balanced", "Aligned", "Spiritual", "Integrated"],
    associatedPractices: ["Chakra meditation", "Crystal healing", "Reiki"],
    color: "Rainbow",
    colorHex: "#FFFFFF",
    element: "Multiple",
  },
  {
    id: "stellar",
    name: "Stellar",
    namePt: "Energia Estelar",
    nameEn: "Stellar",
    description: "Cosmic energy channeled from celestial bodies and starlight.",
    descriptionPt: "Energia cósmica canalizada de corpos celestres e luz das estrelas.",
    characteristics: ["Celestial", "Transcendent", "Illuminating", "Cosmic", "Mystical"],
    associatedPractices: ["Stellar channeling", "Sun meditation", "Cosmic visualization"],
    color: "Blue",
    colorHex: "#0000FF",
    element: "Ether",
  },
  {
    id: "earth",
    name: "Terra",
    namePt: "Terra",
    nameEn: "Earth",
    description: "Grounding energy connected to the Earth and its natural healing properties.",
    descriptionPt: "Energia de ancoragem conectada à Terra e suas propriedades curativas naturais.",
    characteristics: ["Grounding", "Stable", "Nurturing", "Natural", "Abundant"],
    associatedPractices: ["Earthing", "Tree meditation", "Nature immersion"],
    color: "Brown",
    colorHex: "#8B4513",
    element: "Earth",
  },
  {
    id: "sacred",
    name: "Sagrado",
    namePt: "Energia Sagrada",
    nameEn: "Sacred",
    description: "Divine energy associated with spiritual awakening and higher consciousness.",
    descriptionPt: "Energia divina associada ao despertar espiritual e consciência superior.",
    characteristics: ["Transcendent", "Pure Divine", "Holy", "Liberating", "Enlightening"],
    associatedPractices: ["Sacred rituals", "Divine communion", "Consecrated prayer"],
    color: "White",
    colorHex: "#FFFFFF",
    element: "Spirit",
  },
];

export function getTypes(): EnergyType[] {
  return energyTypes;
}

export function getTypeById(id: string): EnergyType | undefined {
  return energyTypes.find((e) => e.id === id);
}

export function getTypeByName(name: string): EnergyType | undefined {
  return energyTypes.find(
    (e) =>
      e.name.toLowerCase() === name.toLowerCase() ||
      e.namePt.toLowerCase() === name.toLowerCase() ||
      e.nameEn.toLowerCase() === name.toLowerCase()
  );
}
