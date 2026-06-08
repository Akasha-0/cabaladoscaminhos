/**
 * Chakra-Poliedro Sacred Geometry Correlation
 * Maps the 7 main chakras to their corresponding Platonic solids
 * Based on IDEIA.md "Geometria Sagrada" section
 */

export interface ChakraPoliedro {
  chakra: string;
  chakraNumber: number;
  chakraName: string;
  poliedro: string;
  poliedroEn: string;
  faces: number;
  elementos: string[];
  frequencias: string[];
  mantram: string;
  nomeDivino: string;
  direcao: string;
  dinamica: string;
}

/**
 * Mapping of the 7 main chakras to their corresponding Platonic solids
 * Based on sacred geometry principles from IDEIA.md
 */
const CHAKRA_POLIEDRO_MAP: ChakraPoliedro[] = [
  {
    chakra: "Muladhara",
    chakraNumber: 1,
    chakraName: "1º Básico",
    poliedro: "Cubo",
    poliedroEn: "Hexahedron",
    faces: 6,
    elementos: ["Terra"],
    frequencias: ["396 Hz"],
    mantram: "LAM",
    nomeDivino: "ADONAI HA-ARETZ",
    direcao: "Norte",
    dinamica: "Dissolução de medos de sobrevivência, ancoramento e firmeza material.",
  },
  {
    chakra: "Svadhisthana",
    chakraNumber: 2,
    chakraName: "2º Sacro",
    poliedro: "Icosaedro",
    poliedroEn: "Icosahedron",
    faces: 20,
    elementos: ["Água"],
    frequencias: ["417 Hz"],
    mantram: "VAM",
    nomeDivino: "ELOHIM GIBOR",
    direcao: "Oeste",
    dinamica: "Limpeza de traumas do passado, transmutação criativa e fluidez vital.",
  },
  {
    chakra: "Manipura",
    chakraNumber: 3,
    chakraName: "3º Plexo Solar",
    poliedro: "Tetraedro",
    poliedroEn: "Tetrahedron",
    faces: 4,
    elementos: ["Fogo"],
    frequencias: ["528 Hz"],
    mantram: "RAM",
    nomeDivino: "SHADDAI EL CHAI",
    direcao: "Oeste",
    dinamica: "Transformação da força de vontade, quebra de medos e ativação do brilho.",
  },
  {
    chakra: "Anahata",
    chakraNumber: 4,
    chakraName: "4º Cardíaco",
    poliedro: "Octaedro",
    poliedroEn: "Octahedron",
    faces: 8,
    elementos: ["Ar", "Água"],
    frequencias: ["639 Hz"],
    mantram: "YAM",
    nomeDivino: "YHVH ELOAH VA-DAATH",
    direcao: "Sul",
    dinamica: "Expansão do afeto incondicional, harmonização de relacionamentos e cura.",
  },
  {
    chakra: "Vishuddha",
    chakraNumber: 5,
    chakraName: "5º Laríngeo",
    poliedro: "Dodecaedro",
    poliedroEn: "Dodecahedron",
    faces: 12,
    elementos: ["Ar"],
    frequencias: ["741 Hz"],
    mantram: "HAM",
    nomeDivino: "ELOHIM SABAOTH",
    direcao: "Leste",
    dinamica: "Expressão da verdade interna, purificação e poder da palavra falada.",
  },
  {
    chakra: "Ajna",
    chakraNumber: 6,
    chakraName: "6º Frontal",
    poliedro: "Icosaedro",
    poliedroEn: "Icosahedron",
    faces: 20,
    elementos: ["Éter", "Ar"],
    frequencias: ["852 Hz"],
    mantram: "OM",
    nomeDivino: "YAH",
    direcao: "Leste",
    dinamica: "Despertar da intuição profunda, visão clara e dissolução de ilusões.",
  },
  {
    chakra: "Sahasrara",
    chakraNumber: 7,
    chakraName: "7º Coronário",
    poliedro: "Esfera",
    poliedroEn: "Sphere",
    faces: 0,
    elementos: ["Éter"],
    frequencias: ["963 Hz"],
    mantram: "AUM / SILÊNCIO",
    nomeDivino: "EHEIEH",
    direcao: "Centro / Zênite",
    dinamica: "Conexão espiritual direta com a Fonte e iluminação da mente.",
  },
];

/**
 * Platonic solids with their elements and properties
 */
export const POLIEDRO_DATA: Record<string, {
  nome: string;
  faces: number;
  elemento: string;
  natureza: string;
}> = {
  Cubo: {
    nome: "Hexaedro",
    faces: 6,
    elemento: "Terra",
    natureza: "Estabilidade e ancoramento",
  },
  Tetraedro: {
    nome: "Tetrahedron",
    faces: 4,
    elemento: "Fogo",
    natureza: "Força e transformação",
  },
  Octaedro: {
    nome: "Octahedron",
    faces: 8,
    elemento: "Ar",
    natureza: "Harmonia e equilíbrio",
  },
  Icosaedro: {
    nome: "Icosahedron",
    faces: 20,
    elemento: "Água",
    natureza: "Fluidez e emoção",
  },
  Dodecaedro: {
    nome: "Dodecahedron",
    faces: 12,
    elemento: "Éter",
    natureza: "Expansão espiritual",
  },
  Esfera: {
    nome: "Sphere",
    faces: 0,
    elemento: "Quintessência",
    natureza: "Unidade total",
  },
};

/**
 * Get the chakra-poliedro mapping for a given chakra identifier
 * @param chakra - Chakra name (Muladhara, Svadhisthana, etc.) or chakra number (1-7)
 * @returns The ChakraPoliedro mapping or undefined if not found
 */
export function getChakraPoliedro(chakra: string): ChakraPoliedro | undefined {
  const normalized = chakra.toLowerCase().trim();
  // Empty or whitespace-only input returns undefined
  if (!normalized) return undefined;
  // Try exact match on Sanskrit name
  const byName = CHAKRA_POLIEDRO_MAP.find(
    (c) => c.chakra.toLowerCase() === normalized
  );
  if (byName) return byName;
  // Try match on Portuguese name (e.g., "1º Básico")
  const byPortugueseName = CHAKRA_POLIEDRO_MAP.find(
    (c) => c.chakraName.toLowerCase().includes(normalized)
  );
  if (byPortugueseName) return byPortugueseName;
  // Try match by number (e.g., "1", "7")
  const byNumber = CHAKRA_POLIEDRO_MAP.find(
    (c) => c.chakraNumber === parseInt(normalized, 10)
  );
  if (byNumber) return byNumber;
  // Try partial match
  const byPartial = CHAKRA_POLIEDRO_MAP.find(
    (c) =>
      c.chakra.toLowerCase().includes(normalized) ||
      c.chakraName.toLowerCase().includes(normalized)
  );
  return byPartial;
}

/**
 * Get all chakra-poliedro mappings
 */
function getAllChakraPoliedro(): ChakraPoliedro[] {
  return CHAKRA_POLIEDRO_MAP;
}

/**
 * Get the Platonic solid for a given chakra
 */
function getPoliedroForChakra(chakra: string): string | undefined {
  return getChakraPoliedro(chakra)?.poliedro;
}

/**
 * Get the element(s) associated with a chakra's Platonic solid
 */
function getElementosForChakra(chakra: string): string[] | undefined {
  return getChakraPoliedro(chakra)?.elementos;
}

/**
 * Get the frequency(ies) associated with a chakra
 */
function getFrequenciaForChakra(chakra: string): string[] | undefined {
  return getChakraPoliedro(chakra)?.frequencias;
}