export interface HealingType {
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

const healingTypes: HealingType[] = [
  {
    id: "emotional",
    name: "cura-emocional",
    namePt: "Cura Emocional",
    nameEn: "Emotional Healing",
    description: "Healing focused on processing and releasing emotional wounds, trauma, and negative patterns.",
    descriptionPt: "Cura focada em processar e liberar feridas emocionais, traumas e padrões negativos.",
    characteristics: ["Compassionate", "Gentle", "Nurturing", "Transformative", "Releasing"],
    associatedPractices: ["Inner child work", "EMDR", "Journaling", "Breathwork", "Body awareness"],
    color: "Rose",
    colorHex: "#FF6B9D",
    element: "Water",
  },
  {
    id: "physical",
    name: "cura-fisica",
    namePt: "Cura Física",
    nameEn: "Physical Healing",
    description: "Healing modalities that work with the physical body to promote wellness and recovery.",
    descriptionPt: "Modalidades de cura que trabalham com o corpo físico para promover bem-estar e recuperação.",
    characteristics: ["Grounding", "Restorative", "Strengthening", "Balancing", "Rejuvenating"],
    associatedPractices: ["Reiki", "Massage therapy", "Acupuncture", "Herbal medicine", "Energy work"],
    color: "Green",
    colorHex: "#4CAF50",
    element: "Earth",
  },
  {
    id: "spiritual",
    name: "cura-espiritual",
    namePt: "Cura Espiritual",
    nameEn: "Spiritual Healing",
    description: "Healing practices that address the spiritual dimension, connecting to higher purpose and divine energy.",
    descriptionPt: "Práticas de cura que abordam a dimensão espiritual, conectando-se a propósito superior e energia divina.",
    characteristics: ["Enlightening", "Connecting", "Purifying", "Awakening", "Transcendent"],
    associatedPractices: ["Meditation", "Prayer", "Chakra work", "Energy clearing", "Sacred rituals"],
    color: "Violet",
    colorHex: "#9C27B0",
    element: "Ether",
  },
  {
    id: "mental",
    name: "cura-mental",
    namePt: "Cura Mental",
    nameEn: "Mental Healing",
    description: "Healing focused on the mind, addressing thought patterns, beliefs, and mental clarity.",
    descriptionPt: "Cura focada na mente, abordando padrões de pensamento, crenças e clareza mental.",
    characteristics: ["Clarifying", "Centering", "Focusing", "Awareness", "Mindful"],
    associatedPractices: ["Meditation", "CBT", "Affirmations", "Visualization", "Mindfulness"],
    color: "Blue",
    colorHex: "#2196F3",
    element: "Air",
  },
  {
    id: "auric",
    name: "cura-aurica",
    namePt: "Cura Aurica",
    nameEn: "Auric Healing",
    description: "Healing that works with the energy field surrounding the body, cleaning and balancing the aura.",
    descriptionPt: "Cura que trabalha com o campo energético ao redor do corpo, limpando e equilibrando a aura.",
    characteristics: ["Protective", "Purifying", "Balancing", "Strengthening", "Harmonizing"],
    associatedPractices: ["Aura cleansing", "Energy shielding", "Chakra balancing", "Light work", "Psychic protection"],
    color: "White",
    colorHex: "#E0E0E0",
    element: "Light",
  },
  {
    id: "ancestral",
    name: "cura-ancestral",
    namePt: "Cura Ancestral",
    nameEn: "Ancestral Healing",
    description: "Healing work that addresses generational patterns, ancestral wounds, and lineage healing.",
    descriptionPt: "Trabalho de cura que aborda padrões generationais, feridas ancestrais e cura de linhagem.",
    characteristics: ["Deep", "Transformative", "Liberating", "Honoring", "Connecting"],
    associatedPractices: ["Genealogy healing", "Ritual work", "Shadow work", "Inner child healing", "Ancestor veneration"],
    color: "Brown",
    colorHex: "#8D6E63",
    element: "Earth",
  },
  {
    id: "chakra",
    name: "cura-dos-chacras",
    namePt: "Cura dos Chacras",
    nameEn: "Chakra Healing",
    description: "Healing focused on the energy centers of the body, balancing and activating the chakra system.",
    descriptionPt: "Cura focada nos centros energéticos do corpo, equilibrando e ativando o sistema de chakras.",
    characteristics: ["Balancing", "Activating", "Harmonizing", "Energizing", "Centering"],
    associatedPractices: ["Chakra meditation", "Crystal therapy", "Sound healing", "Yoga", "Pranayama"],
    color: "Rainbow",
    colorHex: "#FF9800",
    element: "Multiple",
  },
  {
    id: "karma",
    name: "cura-karmica",
    namePt: "Cura Kármica",
    nameEn: "Karmic Healing",
    description: "Healing that addresses karmic patterns, past life issues, and soul-level healing.",
    descriptionPt: "Cura que aborda padrões cármicos, questões de vidas passadas e cura a nível da alma.",
    characteristics: ["Deep", "Releasing", "Transmuting", "Liberating", "Transformative"],
    associatedPractices: ["Past life regression", "Karmic clearing", "Soul retrieval", "Energy transmutation", "Spiritual surrender"],
    color: "Gold",
    colorHex: "#FFC107",
    element: "Fire",
  },
  {
    id: "sound",
    name: "cura-sonora",
    namePt: "Cura Sonora",
    nameEn: "Sound Healing",
    description: "Healing through vibrations and frequencies that promote healing and balance.",
    descriptionPt: "Cura através de vibrações e frequências que promovem cura e equilíbrio.",
    characteristics: ["Vibrational", "Resonant", "Harmonizing", "Calming", "Restorative"],
    associatedPractices: ["Tibetan bowls", "Binaural beats", "Tuning forks", "Chanting", "Music therapy"],
    color: "Silver",
    colorHex: "#C0C0C0",
    element: "Sound",
  },
  {
    id: "energy",
    name: "cura-energetica",
    namePt: "Cura Energética",
    nameEn: "Energy Healing",
    description: "Healing work with the body's energy system, clearing blockages and restoring flow.",
    descriptionPt: "Trabalho de cura com o sistema energético do corpo, limpando bloqueios e restaurando o fluxo.",
    characteristics: ["Flowing", "Clearing", "Balancing", "Realigning", "Revitalizing"],
    associatedPractices: ["Reiki", "Pranic healing", "Qigong", "Acupressure", "Energy manipulation"],
    color: "Turquoise",
    colorHex: "#00BCD4",
    element: "Energy",
  },
  {
    id: "shadow",
    name: "cura-da-sombra",
    namePt: "Cura da Sombra",
    nameEn: "Shadow Healing",
    description: "Healing that works with the shadow self, integrating disowned parts of the psyche.",
    descriptionPt: "Cura que trabalha com a sombra, integrando partes desmembradas da psique.",
    characteristics: ["Integrating", "Confronting", "Accepting", "Transforming", "Deep"],
    associatedPractices: ["Shadow work", "Dream analysis", "Inner dialogue", "Meditation", "Inner child work"],
    color: "Deep Purple",
    colorHex: "#673AB7",
    element: "Shadow",
  },
  {
    id: "manifestation",
    name: "cura-manifestacao",
    namePt: "Cura da Manifestação",
    nameEn: "Manifestation Healing",
    description: "Healing focused on aligning intention with action to manifest desired outcomes.",
    descriptionPt: "Cura focada em alinhar intenção com ação para manifestar resultados desejados.",
    characteristics: ["Empowering", "Aligning", "Focusing", "Attracting", "Co-creating"],
    associatedPractices: ["Visualization", "Affirmations", "Gratitude practice", "Intention setting", "Law of attraction work"],
    color: "Yellow",
    colorHex: "#FFEB3B",
    element: "Light",
  },
];

export function getTypes(): HealingType[] {
  return healingTypes;
}

export function getTypeById(id: string): HealingType | undefined {
  return healingTypes.find((h) => h.id === id);
}

export function getTypeByName(name: string): HealingType | undefined {
  return healingTypes.find(
    (h) =>
      h.name.toLowerCase() === name.toLowerCase() ||
      h.namePt.toLowerCase() === name.toLowerCase() ||
      h.nameEn.toLowerCase() === name.toLowerCase()
  );
}

export function getTypesByElement(element: string): HealingType[] {
  return healingTypes.filter((h) => h.element.toLowerCase() === element.toLowerCase());
}