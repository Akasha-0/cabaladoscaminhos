export interface ChakraMeaning {
  name: string;
  namePt: string;
  nameEn: string;
  sanskrit: string;
  element: string;
  location: string;
  color: string;
  colorHex: string;
 诗句?: string;
  mantra: string;
  qualities: string[];
 governs: string[];
  description: string;
  descriptionPt: string;
  affirmation: string;
  affirmationPt: string;
  openingStatement: string;
  closingStatement: string;
}

const chakraMeanings: ChakraMeaning[] = [
  {
    name: "Muladhara",
    namePt: "Raiz",
    nameEn: "Root",
    sanskrit: "मूलाधार",
    element: "Terra",
    location: "Base da coluna vertebral, perínio",
    color: "Vermelho",
    colorHex: "#E53935",
    诗句: "Eu sou",
    mantra: "LAM",
    qualities: ["Segurança", "Sobrevivência", "Estabilidade", "Conexão com a Terra", "Fundação"],
    governs: ["Sobrevivência", "Família", "Lar", "Corpo físico", "Instintos básicos"],
    description: "O Muladhara é o centro de energia primordial, representando a conexão com a Terra e os instintos de sobrevivência. É a foundation sobre a qual todos os outros chakras são construídos.",
    descriptionPt: "O Muladhara é o centro de energia primordial, representando a conexão com a Terra e os instintos de sobrevivência. É a base sobre a qual todos os outros chakras são construídos.",
    affirmation: "I am",
    affirmationPt: "Eu sou",
    openingStatement: "I am rooted and grounded in the present moment.",
    closingStatement: "I am safe. I am secure. I am supported by the Earth.",
  },
  {
    name: "Svadhisthana",
    namePt: "Sacro",
    nameEn: "Sacral",
    sanskrit: "स्वाधिष्ठान",
    element: "Água",
    location: "Baixo ventre, abaixo do umbigo",
    color: "Laranja",
    colorHex: "#FB8C00",
    诗句: "Eu sinto",
    mantra: "VAM",
    qualities: ["Emoções", "Criatividade", "Sexualidade", "Prazer", "Fluidez"],
    governs: ["Sexualidade", "Reprodução", "Bexiga", "Rins", "Ciclo menstrual"],
    description: "O Svadhisthana governa nossas emoções, criatividade e conexões emocionais. É o centro do prazer, da sexualidade e da capacidade de flow-state.",
    descriptionPt: "O Svadhisthana governa nossas emoções, criatividade e conexões emocionais. É o centro do prazer, da sexualidade e da capacidade de fluir.",
    affirmation: "I feel",
    affirmationPt: "Eu sinto",
    openingStatement: "I honor my emotions as messengers of truth.",
    closingStatement: "I allow myself to feel deeply and experience joy.",
  },
  {
    name: "Manipura",
    namePt: "Plexo Solar",
    nameEn: "Solar Plexus",
    sanskrit: "मणिपूर",
    element: "Fogo",
    location: "Epigástrio, acima do umbigo",
    color: "Amarelo",
    colorHex: "#FDD835",
    诗句: "Eu posso",
    mantra: "RAM",
    qualities: ["Poder pessoal", "Confiança", "Vontade", "Autodisciplina", "Transformação"],
    governs: ["Digestão", "Metabolismo", "Adrenal", "Músculos abdominais", "Autoconfiança"],
    description: "O Manipura é o centro do poder pessoal e da vontade. Governa nossa capacidade de tomar decisões, nossa autodisciplina e nossa relação com o controle e a transformação.",
    descriptionPt: "O Manipura é o centro do poder pessoal e da vontade. Governa nossa capacidade de tomar decisões, nossa autodisciplina e nossa relação com o controle e a transformação.",
    affirmation: "I can",
    affirmationPt: "Eu posso",
    openingStatement: "I step into my personal power with grace.",
    closingStatement: "I trust my inner wisdom and act with confidence.",
  },
  {
    name: "Anahata",
    namePt: "Coração",
    nameEn: "Heart",
    sanskrit: "अनाहत",
    element: "Ar",
    location: "Centro do peito, coração físico",
    color: "Verde",
    colorHex: "#43A047",
    诗句: "Eu amo",
    mantra: "YAM",
    qualities: ["Amor incondicional", "Compaixão", "Perdão", "Harmonia", "Conexão"],
    governs: ["Coração", "Pulmões", "Timo", "Mãos", "Braços"],
    description: "O Anahata é o centro do amor incondicional e da compaixão. É a ponte entre os chakras inferiores (material) e superiores (espiritual), governando nossas relações e capacidade de amar.",
    descriptionPt: "O Anahata é o centro do amor incondicional e da compaixão. É a ponte entre os chakras inferiores (material) e superiores (espiritual), governando nossas relações e capacidade de amar.",
    affirmation: "I love",
    affirmationPt: "Eu amo",
    openingStatement: "My heart is open and I give love freely.",
    closingStatement: "I am worthy of love and I forgive myself and others.",
  },
  {
    name: "Vishuddha",
    namePt: "Garganta",
    nameEn: "Throat",
    sanskrit: "विशुद्ध",
    element: "Éter",
    location: "Garganta, glândula tireoide",
    color: "Azul",
    colorHex: "#1E88E5",
    诗句: "Eu comunico",
    mantra: "HAM",
    qualities: ["Comunicação", "Verdade", "Expressão autêntica", "Escuta profunda", "Clareza"],
    governs: ["Garganta", "Tireoide", "Pescoço", "Ombros", "Braços"],
    description: "O Vishuddha é o centro da comunicação e da expressão autêntica. Governa nossa capacidade de nos expressar com clareza, defender nossa verdade e ouvir com compaixão.",
    descriptionPt: "O Vishuddha é o centro da comunicação e da expressão autêntica. Governa nossa capacidade de nos expressar com clareza, defender nossa verdade e ouvir com compaixão.",
    affirmation: "I speak",
    affirmationPt: "Eu comunico",
    openingStatement: "My voice carries my truth with kindness.",
    closingStatement: "I listen deeply and speak with integrity.",
  },
  {
    name: "Ajna",
    namePt: "Terceiro Olho",
    nameEn: "Third Eye",
    sanskrit: "आज्ञा",
    element: "Luz",
    location: "Centro da testa, entre as sobrancelhas",
    color: "Índigo",
    colorHex: "#5E35B1",
    诗句: "Eu vejo",
    mantra: "OM / AUM",
    qualities: ["Intuição", "Visão interior", "Discernimento", "Sabedoria", "Percepção"],
    governs: ["Hipófise", "Cérebro", "Olhos", "Ouvidos", "Nariz"],
    description: "O Ajna é o centro da intuição e da visão interior. Governa nossa capacidade de perceber além do mundo físico, acessar guidance interior e distinguir verdade de ilusão.",
    descriptionPt: "O Ajna é o centro da intuição e da visão interior. Governa nossa capacidade de perceber além do mundo físico, acessar orientação interior e distinguir verdade de ilusão.",
    affirmation: "I see",
    affirmationPt: "Eu vejo",
    openingStatement: "I trust my intuition and see clearly.",
    closingStatement: "I am open to divine wisdom flowing through me.",
  },
  {
    name: "Sahasrara",
    namePt: "Coroa",
    nameEn: "Crown",
    sanskrit: "सहस्रार",
    element: "Cosmos",
    location: "Topo da cabeça,fontanela",
    color: "Violeta/Branco",
    colorHex: "#8E24AA",
    诗句: "Eu compreendo",
    mantra: "OM SILENCE",
    qualities: ["Iluminação", "Conexão divina", "Unidade", "Sabedoria absoluta", "Transcendência"],
    governs: ["Pineal", "Córtex cerebral", "Sistema nervoso central", "Espírito"],
    description: "O Sahasrara é o centro da iluminação e da conexão com o divino. É o ponto de integração entre o individual e o universal, onde a consciência individual se funde com a consciência cósmica.",
    descriptionPt: "O Sahasrara é o centro da iluminação e da conexão com o divino. É o ponto de integração entre o individual e o universal, onde a consciência individual se funde com a consciência cósmica.",
    affirmation: "I understand",
    affirmationPt: "Eu compreendo",
    openingStatement: "I am connected to the divine source of all life.",
    closingStatement: "I am one with the infinite. I am complete.",
  },
];

export function getChakraMeanings(): ChakraMeaning[] {
  return chakraMeanings;
}

export function getChakraByIndex(index: number): ChakraMeaning | undefined {
  return chakraMeanings[index];
}

export function getChakraByName(name: string): ChakraMeaning | undefined {
  return chakraMeanings.find(
    (c) => c.name.toLowerCase() === name.toLowerCase() ||
          c.namePt.toLowerCase() === name.toLowerCase() ||
          c.nameEn.toLowerCase() === name.toLowerCase()
  );
}
