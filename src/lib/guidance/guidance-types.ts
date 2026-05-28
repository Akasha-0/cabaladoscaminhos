export interface GuidanceType {
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

const guidanceTypes: GuidanceType[] = [
  {
    id: "spiritual",
    name: "Espiritual",
    namePt: "Espiritual",
    nameEn: "Spiritual",
    description: "Guidance for spiritual growth, soul purpose, and connection to higher self and divine wisdom.",
    descriptionPt: "Orientação para crescimento espiritual, propósito da alma e conexão com o eu superior e sabedoria divina.",
    characteristics: ["Intuitive", "Transcendent", "Soul-centered", "Divine", "Enlightening"],
    associatedPractices: ["Meditation", "Prayer", "Spiritual contemplation", "Energy work"],
    color: "Violet",
    colorHex: "#8B5CF6",
    element: "Ether",
  },
  {
    id: "emotional",
    name: "Emocional",
    namePt: "Emocional",
    nameEn: "Emotional",
    description: "Guidance for emotional healing, processing feelings, and developing emotional intelligence.",
    descriptionPt: "Orientação para cura emocional, processamento de sentimentos e desenvolvimento de inteligência emocional.",
    characteristics: ["Compassionate", "Nurturing", "Healing", "Supportive", "Empathetic"],
    associatedPractices: ["Journaling", "Inner child work", "Breathwork", "Therapeutic practices"],
    color: "Pink",
    colorHex: "#EC4899",
    element: "Water",
  },
  {
    id: "mental",
    name: "Mental",
    namePt: "Mental",
    nameEn: "Mental",
    description: "Guidance for mental clarity, decision making, and cognitive expansion.",
    descriptionPt: "Orientação para clareza mental, tomada de decisões e expansão cognitiva.",
    characteristics: ["Clear", "Logical", "Discerning", "Wise", "Centered"],
    associatedPractices: ["Affirmations", "Visualization", "Study", "Reflection"],
    color: "Blue",
    colorHex: "#3B82F6",
    element: "Air",
  },
  {
    id: "physical",
    name: "Físico",
    namePt: "Físico",
    nameEn: "Physical",
    description: "Guidance for physical wellbeing, body awareness, and embodied spirituality.",
    descriptionPt: "Orientação para bem-estar físico, consciência corporal e espiritualidade encarnada.",
    characteristics: ["Grounded", "Vital", "Energetic", "Balanced", "Embodied"],
    associatedPractices: ["Yoga", "Exercise", "Body scans", "Grounding exercises"],
    color: "Green",
    colorHex: "#10B981",
    element: "Earth",
  },
  {
    id: "relational",
    name: "Relacional",
    namePt: "Relacional",
    nameEn: "Relational",
    description: "Guidance for relationships, connection, communication, and interpersonal growth.",
    descriptionPt: "Orientação para relacionamentos, conexão, comunicação e crescimento interpessoal.",
    characteristics: ["Harmonious", "Communicative", "Connected", "Loving", "Authentic"],
    associatedPractices: ["Communication exercises", "Partner work", "Family dynamics", "Boundaries"],
    color: "Rose",
    colorHex: "#F59E0B",
    element: "Fire",
  },
  {
    id: "transformational",
    name: "Transformacional",
    namePt: "Transformacional",
    nameEn: "Transformational",
    description: "Guidance for major life changes, transitions, and personal transformation.",
    descriptionPt: "Orientação para grandes mudanças de vida, transições e transformação pessoal.",
    characteristics: ["Revolutionary", "Catalytic", "Powerful", "Evolving", "Transcendent"],
    associatedPractices: ["Shadow work", "Rituals", "Initiation practices", "Death and rebirth work"],
    color: "Orange",
    colorHex: "#F97316",
    element: "Fire",
  },
  {
    id: "manifestational",
    name: "Manifestacional",
    namePt: "Manifestacional",
    nameEn: "Manifestational",
    description: "Guidance for intentions, goals, abundance, and co-creation with the universe.",
    descriptionPt: "Orientação para intenções, metas, abundância e co-criação com o universo.",
    characteristics: ["Abundant", "Creative", "Purposeful", "Attracting", "Co-creative"],
    associatedPractices: ["Visualization", "Affirmations", "Gratitude practice", "Scripting"],
    color: "Gold",
    colorHex: "#EAB308",
    element: "Fire",
  },
  {
    id: "ancestral",
    name: "Ancestral",
    namePt: "Ancestral",
    nameEn: "Ancestral",
    description: "Guidance for lineage healing, ancestral connections, and cultural wisdom.",
    descriptionPt: "Orientação para cura de linhagem, conexões ancestrais e sabedoria cultural.",
    characteristics: ["Deep-rooted", "Honoring", "Connected", "Inherited", "Sacred"],
    associatedPractices: ["Ancestor veneration", "Genealogy work", "Ritual honoring", "Family healing"],
    color: "Brown",
    colorHex: "#92400E",
    element: "Earth",
  },
];

export function getTypes(): GuidanceType[] {
  return guidanceTypes;
}

export function getTypeById(id: string): GuidanceType | undefined {
  return guidanceTypes.find((g) => g.id === id);
}

export function getTypeByName(name: string): GuidanceType | undefined {
  return guidanceTypes.find(
    (g) =>
      g.name.toLowerCase() === name.toLowerCase() ||
      g.namePt.toLowerCase() === name.toLowerCase() ||
      g.nameEn.toLowerCase() === name.toLowerCase()
  );
}

export function getTypesByElement(element: string): GuidanceType[] {
  return guidanceTypes.filter((g) => g.element.toLowerCase() === element.toLowerCase());
}