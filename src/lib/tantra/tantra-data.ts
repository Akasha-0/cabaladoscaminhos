// eslint-disable-next-line @typescript-eslint/no-explicit-any
// deno-lint-ignore-file no-explicit-any

/**
 * Tantra data for the sacred path of transformation.
 */

export interface TantraData {
  id: string;
  name: string;
  namePt: string;
  nameEn: string;
  sanskrit: string;
  path: string;
  element: string;
  location: string;
  color: string;
  colorHex: string;
  qualities: string[];
  principles: string[];
  practices: string[];
  description: string;
  descriptionPt: string;
  intention: string;
  intentionPt: string;
  deity: string;
  mudra: string;
  mantra: string;
  breathwork: string;
  sequence: number;
}

const tantraData: TantraData[] = [
  {
    id: "tantra-sacred-union",
    name: "União Sagrada",
    namePt: "União Sagrada",
    nameEn: "Sacred Union",
    sanskrit: "Yuganaddhā",
    path: "union",
    element: "fire-water",
    location: "hrt-sushumna",
    color: "crimson-gold",
    colorHex: "#DC143C",
    qualities: [" reverence", "sacred", "transformative", "integrative"],
    principles: [
      "Body as temple",
      "Energy as sacred",
      "Union of opposites",
      "Sacred polarity",
    ],
    practices: [
      "Sacred breathing",
      "Energy circulation",
      "Partner awareness",
      "Chakra activation",
    ],
    description: "The sacred union of masculine and feminine energies within, creating wholeness and divine integration.",
    descriptionPt: "A união sagrada das energias masculina e feminina em seu interior, criando integridade e integração divina.",
    intention: "I honor the sacred union within my being",
    intentionPt: "Eu honro a união sagrada dentro do meu ser",
    deity: "Shiva-Shakti",
    mudra: "Gyan-Mudra",
    mantra: "Om Shakti Om",
    breathwork: "S阴阳呼吸",
    sequence: 1,
  },
  {
    id: "tantra-energy-flow",
    name: "Fluxo Energético",
    namePt: "Fluxo Energético",
    nameEn: "Energy Flow",
    sanskrit: "Prāṇa-cakra",
    path: "flow",
    element: "prana",
    location: "sushumna",
    color: "white-gold",
    colorHex: "#FFD700",
    qualities: ["dynamic", "expansive", "circulating", "alive"],
    principles: [
      "Energy moves in spirals",
      "Breath activates energy",
      "Intention directs flow",
      "Presence amplifies",
    ],
    practices: [
      "Breath of fire",
      "Energy lock",
      "Spiral visualization",
      "Grounding technique",
    ],
    description: "Channeling pranic energy through the body, awakening dormant power and creating dynamic vitality.",
    descriptionPt: "Canalizando energia prânica através do corpo, despertando poder adormecido e criando vitalidade dinâmica.",
    intention: "I allow energy to flow freely through my being",
    intentionPt: "Eu permito que a energia flua livremente através do meu ser",
    deity: "Kundalini",
    mudra: "Nadi-Shodhana",
    mantra: "Om Prāṇāya",
    breathwork: "Kapalabhati",
    sequence: 2,
  },
  {
    id: "tantra-eros",
    name: "Eros Sagrada",
    namePt: "Eros Sagrada",
    nameEn: "Sacred Eros",
    sanskrit: "Bhakta-vega",
    path: "desire",
    element: "fire-earth",
    location: "muladhara-svadhisthana",
    color: "deep-red",
    colorHex: "#8B0000",
    qualities: ["passionate", "transformative", "creative", "sacred"],
    principles: [
      "Desire is sacred",
      "Pleasure leads to God",
      "Creativity is divine",
      "Body knows truth",
    ],
    practices: [
      "Sensorial awareness",
      "Tantric touch",
      "Energy transmutation",
      "Creative visualization",
    ],
    description: "Transforming sexual energy into spiritual power through sacred intention and mindful awareness.",
    descriptionPt: "Transformando energia sexual em poder espiritual através de intenção sagrada e atenção plena.",
    intention: "I transform my passions into divine purpose",
    intentionPt: "Eu transformo minhas paixões em propósito divino",
    deity: "Rati",
    mudra: "Yoni-Mudra",
    mantra: "Om Kāma",
    breathwork: "S sagrado",
    sequence: 3,
  },
  {
    id: "tantra-presence",
    name: "Presença Plena",
    namePt: "Presença Plena",
    nameEn: "Full Presence",
    sanskrit: "Samāveśa",
    path: "awareness",
    element: "space",
    location: "crown-ajna",
    color: "violet-white",
    colorHex: "#9400D3",
    qualities: ["present", "aware", "still", "expanded"],
    principles: [
      "Now is sacred",
      "Sensation reveals truth",
      "Witnessing transforms",
      "Consciousness liberates",
    ],
    practices: [
      "Body scanning",
      "Sensorial meditation",
      "Witnessing practice",
      "Presence cultivation",
    ],
    description: "Cultivating absolute presence in the body, allowing every sensation to become a gateway to enlightenment.",
    descriptionPt: "Cultivando presença absoluta no corpo, permitindo que cada sensação se torne uma porta para a iluminação.",
    intention: "I am fully present in this sacred moment",
    intentionPt: "Eu estou completamente presente neste momento sagrado",
    deity: "Śiva",
    mudra: "Mahā-mudra",
    mantra: "Om Ātman",
    breathwork: "Observe natural",
    sequence: 4,
  },
  {
    id: "tantra-devotion",
    name: "Devoção Divina",
    namePt: "Devoção Divina",
    nameEn: "Divine Devotion",
    sanskrit: "Bhakti-tantra",
    path: "love",
    element: "water-heart",
    location: "heart-anahata",
    color: "green-pink",
    colorHex: "#FF69B4",
    qualities: ["loving", "surrendering", "devoted", "open"],
    principles: [
      "Love is the ultimate",
      "Surrender is power",
      "Devotion opens doors",
      "Heart is the gateway",
    ],
    practices: [
      "Chanting sacred names",
      "Offering practice",
      "Heart opening",
      "Devotional breathing",
    ],
    description: "The path of heart-centered devotion, where love becomes the transformative force and ultimate teacher.",
    descriptionPt: "O caminho da devoção centrada no coração, onde o amor se torna a força transformadora e professor supremo.",
    intention: "I open my heart to divine love",
    intentionPt: "Eu abro meu coração para o amor divino",
    deity: "Radha-Krishna",
    mudra: "Hridaya-Mudra",
    mantra: "Om Hare",
    breathwork: "Devotional breathing",
    sequence: 5,
  },
  {
    id: "tantra-bindus",
    name: "Dissolução do Bindu",
    namePt: "Dissolução do Bindu",
    nameEn: "Bindu Dissolution",
    sanskrit: "Bindu-sphāra",
    path: "transcendence",
    element: "void",
    location: "crown-sahasrara",
    color: "white",
    colorHex: "#FFFFFF",
    qualities: ["transcendent", "expansive", "non-dual", "infinite"],
    principles: [
      "Pleasure leads to void",
      "Peak becomes space",
      "Form dissolves into formlessness",
      "Microcosm mirrors macrocosm",
    ],
    practices: [
      "Bindu meditation",
      "Energy elevation",
      "Peak practice",
      "Consciousness expansion",
    ],
    description: "The practice of raising energy to the crown and dissolving individual identity into cosmic consciousness.",
    descriptionPt: "A prática de elevar a energia até a coroa e dissolver a identidade individual na consciência cósmica.",
    intention: "I dissolve into infinite consciousness",
    intentionPt: "Eu me dissolvo na consciência infinita",
    deity: "Ṣiva",
    mudra: "Shambhavi",
    mantra: "Om Śivāya",
    breathwork: "Kumbhaka profunda",
    sequence: 6,
  },
  {
    id: "tantra-integration",
    name: "Integração Total",
    namePt: "Integração Total",
    nameEn: "Total Integration",
    sanskrit: "Samprajñāna",
    path: "wholeness",
    element: "all-elements",
    location: "all-chakras",
    color: "rainbow",
    colorHex: "#FFFFFF",
    qualities: ["integrated", "wholed", "balanced", "complete"],
    principles: [
      "All paths lead home",
      "Every aspect is sacred",
      "Integration is liberation",
      " wholeness is the goal",
    ],
    practices: [
      "Multi-chakra activation",
      "Energy weaving",
      "Full-body awareness",
      "Divine marriage",
    ],
    description: "Bringing together all aspects of tantric practice into a unified whole, creating complete spiritual embodiment.",
    descriptionPt: "Juntando todos os aspectos da prática tântrica em um todo unificado, criando encarnação espiritual completa.",
    intention: "I integrate all aspects of my being into wholeness",
    intentionPt: "Eu integro todos os aspectos do meu ser em integridade",
    deity: "Ardhanarishvara",
    mudra: "Mahā-mudra",
    mantra: "Om Santi",
    breathwork: "Unified breathing",
    sequence: 7,
  },
];

export function getData(): TantraData[] {
  return tantraData;
}