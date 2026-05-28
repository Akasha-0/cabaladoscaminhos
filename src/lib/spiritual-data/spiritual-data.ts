// Spiritual data collection

export interface SpiritualData {
  id: string;
  category: string;
  name: string;
  description: string;
  origin: string;
  keywords: string[];
}

const spiritualData: SpiritualData[] = [
  {
    id: "chakra-root",
    category: "chakra",
    name: "Muladhara",
    description: "O centro de sobrevivência e conexão terrena.",
    origin: "Tradição Hindu",
    keywords: ["terra", "estabilidade", "segurança", "sobrevivência"],
  },
  {
    id: "chakra-sacral",
    category: "chakra",
    name: "Svadhisthana",
    description: "O centro da criatividade e emoções.",
    origin: "Tradição Hindu",
    keywords: ["água", "criatividade", "sexualidade", "emoções"],
  },
  {
    id: "chakra-solar",
    category: "chakra",
    name: "Manipura",
    description: "O centro do poder pessoal e vontade.",
    origin: "Tradição Hindu",
    keywords: ["fogo", "poder", "vontade", "digestão"],
  },
  {
    id: "chakra-heart",
    category: "chakra",
    name: "Anahata",
    description: "O centro do amor incondicional.",
    origin: "Tradição Hindu",
    keywords: ["ar", "amor", "compaixão", "perdão"],
  },
  {
    id: "chakra-throat",
    category: "chakra",
    name: "Vishuddha",
    description: "O centro da expressão e verdade.",
    origin: "Tradição Hindu",
    keywords: ["éter", "comunicação", "verdade", "expressão"],
  },
  {
    id: "chakra-third-eye",
    category: "chakra",
    name: "Ajna",
    description: "O centro da intuição e visão interior.",
    origin: "Tradição Hindu",
    keywords: ["luz", "intuição", "percepção", "sabedoria"],
  },
  {
    id: "chakra-crown",
    category: "chakra",
    name: "Sahasrara",
    description: "O centro da consciência divina.",
    origin: "Tradição Hindu",
    keywords: ["divino", "iluminação", "transcendência", "unidade"],
  },
  {
    id: "tarot-fool",
    category: "tarot",
    name: "O Louco",
    description: "Início de uma jornada, pureza e espontaneidade.",
    origin: "Tradição Ocidental",
    keywords: ["início", "liberdade", "espontaneidade", "transformação"],
  },
  {
    id: "tarot-magician",
    category: "tarot",
    name: "O Mago",
    description: "Manifestação, habilidade e poder pessoal.",
    origin: "Tradição Ocidental",
    keywords: ["manifestação", "habilidade", "comunicação", "arte"],
  },
  {
    id: "tarot-high-priestess",
    category: "tarot",
    name: "A Alta Sacerdotisa",
    description: "Intuição, mistério e sabedoria interior.",
    origin: "Tradição Ocidental",
    keywords: ["intuição", "mistério", "sabedoria", "feminino sagrado"],
  },
  {
    id: "tarot-empress",
    category: "tarot",
    name: "A Imperatriz",
    description: "Fertilidade, abundância e natureza.",
    origin: "Tradição Ocidental",
    keywords: ["abundância", "fertilidade", "natureza", "criatividade"],
  },
  {
    id: "tarot-emperor",
    category: "tarot",
    name: "O Imperador",
    description: "Autoridade, estrutura e disciplina.",
    origin: "Tradição Ocidental",
    keywords: ["autoridade", "estrutura", "liderança", "pai"],
  },
  {
    id: "element-fire",
    category: "element",
    name: "Fogo",
    description: "Energia transformadora, paixão e destruição criativa.",
    origin: "Tradição Elemental",
    keywords: ["paixão", "transformação", "energia", "força"],
  },
  {
    id: "element-water",
    category: "element",
    name: "Água",
    description: "Fluidez emocional, purificação e intuição.",
    origin: "Tradição Elemental",
    keywords: ["emoção", "intuição", "purificação", "fluidez"],
  },
  {
    id: "element-earth",
    category: "element",
    name: "Terra",
    description: "Estabilidade, abundancia material e conexão física.",
    origin: "Tradição Elemental",
    keywords: ["estabilidade", "abundância", "corpo", "manifestação"],
  },
  {
    id: "element-air",
    category: "element",
    name: "Ar",
    description: "Liberdade mental, comunicação e expansão.",
    origin: "Tradição Elemental",
    keywords: ["mente", "comunicação", "liberdade", "expansão"],
  },
  {
    id: "spirit-wolf",
    category: "spirit-animal",
    name: "Lobo",
    description: "Intuição, lealdade e conexão com o caminho interior.",
    origin: "Tradição Native Americana",
    keywords: ["intuição", "lealdade", "guia", "liberdade"],
  },
  {
    id: "spirit-eagle",
    category: "spirit-animal",
    name: "Águia",
    description: "Visão elevada, coragem e sabedoria espiritual.",
    origin: "Tradição Native Americana",
    keywords: ["visão", "coragem", "sabedoria", "elevação"],
  },
  {
    id: "spirit-bear",
    category: "spirit-animal",
    name: "Urso",
    description: "Força interior, solitude restauradora e proteção.",
    origin: "Tradição Native Americana",
    keywords: ["força", "proteção", "introspecção", "cura"],
  },
  {
    id: "spirit-serpent",
    category: "spirit-animal",
    name: "Serpente",
    description: "Renovação, transformação e energia kundalini.",
    origin: "Tradição Celta",
    keywords: ["transformação", "renovação", "kundalini", "sabedoria"],
  },
  {
    id: "mercury-retrograde",
    category: "astrological",
    name: "Mercúrio Retrógrado",
    description: "Período de revisão, comunicação e reflexão.",
    origin: "Tradição Astral",
    keywords: ["comunicação", "revisão", "reflexão", "tecnologia"],
  },
  {
    id: "new-moon",
    category: "astrological",
    name: "Lua Nova",
    description: "Momento de intenção, novos começos e plantação de sementes.",
    origin: "Tradição Astral",
    keywords: ["intenção", "novos começos", "manifestação", "início"],
  },
  {
    id: "full-moon",
    category: "astrological",
    name: "Lua Cheia",
    description: "Culminação, iluminação e libertação.",
    origin: "Tradição Astral",
    keywords: ["culminação", "iluminação", "libertação", "culminância"],
  },
  {
    id: "tree-of-life",
    category: "cabala",
    name: "Árvore da Vida",
    description: "Mapa da consciência e caminho para a divindade.",
    origin: "Tradição Cabalística",
    keywords: ["consciência", "caminho", "sefirot", "divindade"],
  },
  {
    id: "life-path",
    category: "numerology",
    name: "Caminho de Vida",
    description: "Missão de vida determinada pela data de nascimento.",
    origin: "Tradição Pitagórica",
    keywords: ["missão", "destino", "propósito", "vida"],
  },
  {
    id: "sacred-geometry-flower",
    category: "geometry",
    name: "Flor da Vida",
    description: "Padrão fundamental da criação e vida.",
    origin: "Tradição Sagrada",
    keywords: ["criação", "vida", "padrão", "frequência"],
  },
  {
    id: "sacred-geometry-merkaba",
    category: "geometry",
    name: "Merkaba",
    description: "Veículo de luz para dimensões superiores.",
    origin: "Tradição Sagrada",
    keywords: ["luz", "ascensão", "dimensional", "veículo"],
  },
  {
    id: "reiki-symbol-healing",
    category: "healing",
    name: "Cho Ku Rei",
    description: "Símbolo de poder e amplificação energética.",
    origin: "Tradição Reiki",
    keywords: ["poder", "amplificação", "energia", "cura"],
  },
  {
    id: "reiki-symbol-emotional",
    category: "healing",
    name: "Sei He Ki",
    description: "Símbolo de harmonização emocional e proteção.",
    origin: "Tradição Reiki",
    keywords: ["emoção", "harmonia", "proteção", "mental"],
  },
  {
    id: "reiki-symbol-spiritual",
    category: "healing",
    name: "Hon Sha Ze Sho Nen",
    description: "Símbolo de cura à distância e conexão espiritual.",
    origin: "Tradição Reiki",
    keywords: ["distância", "tempo", "conexão", "espiritual"],
  },
  {
    id: "breathwork-4-7-8",
    category: "breathwork",
    name: "Técnica 4-7-8",
    description: "Padrão respiratório para relaxamento profundo e sono.",
    origin: "Tradição Pranayama",
    keywords: ["relaxamento", "sono", "ansiedade", "calma"],
  },
  {
    id: "breathwork-box",
    category: "breathwork",
    name: "Respiração Quadrada",
    description: "Padrão equilibrado para foco e meditação.",
    origin: "Tradição Pranayama",
    keywords: ["foco", "meditação", "equilíbrio", "clareza"],
  },
  {
    id: "meditation-vipassana",
    category: "meditation",
    name: "Vipassana",
    description: "Meditação de insight para ver as coisas como são.",
    origin: "Tradição Budista",
    keywords: ["insight", "realidade", "presença", "clareza"],
  },
  {
    id: "meditation-loving-kindness",
    category: "meditation",
    name: "Metta Bhavana",
    description: "Meditação de bondade amorosa para todos os seres.",
    origin: "Tradição Budista",
    keywords: ["amor", "compaixão", "bondade", "todos os seres"],
  },
];

export function getData(): SpiritualData[] {
  return spiritualData;
}

export function getDataByCategory(category: string): SpiritualData[] {
  return spiritualData.filter((d) => d.category === category);
}

export function getDataById(id: string): SpiritualData | undefined {
  return spiritualData.find((d) => d.id === id);
}

export function searchData(query: string): SpiritualData[] {
  const lowerQuery = query.toLowerCase();
  return spiritualData.filter(
    (d) =>
      d.name.toLowerCase().includes(lowerQuery) ||
      d.description.toLowerCase().includes(lowerQuery) ||
      d.keywords.some((k) => k.toLowerCase().includes(lowerQuery))
  );
}

export function getCategories(): string[] {
  const categories = new Set(spiritualData.map((d) => d.category));
  return Array.from(categories).sort();
}