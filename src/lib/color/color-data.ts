/**
 * Color data module
 * Provides color energy and chromatic healing data for the Cabala dos Caminhos system
 */

export interface ColorData {
  id: string;
  name: string;
  namePt: string;
  hex: string;
  frequency: string;
  wavelength: number;
  description: string;
  characteristics: string[];
  associatedChakras: string[];
  healingProperties: string[];
  spiritualMeanings: string[];
  emotionalEffects: string[];
  imbalances: string[];
  complementary: string;
  analogous: string[];
}

export interface ColorFamily {
  family: string;
  colors: string[];
  vibration: string;
}

export function getData(): {
  colors: ColorData[];
  colorFamilies: ColorFamily[];
} {
  return {
    colors: [
      {
        id: "color-vermelho",
        name: "Red",
        namePt: "Vermelho",
        hex: "#DC143C",
        frequency: "high",
        wavelength: 700,
        description: "Cor da força vital, coragem e determinação",
        characteristics: [
          "Energia",
          "Força",
          "Paixão",
          "Vitalidade",
          "Determinação"
        ],
        associatedChakras: ["chakra-root"],
        healingProperties: [
          "Estimula a circulação",
          "Fortalece o sistema imunológico",
          "Combate a fadiga",
          "Promove coragem"
        ],
        spiritualMeanings: [
          "Terra e sobrevivência",
          "Primordial life force",
          "Manifestação física",
          "Ancoring energy"
        ],
        emotionalEffects: [
          "Estimula",
          "Energiza",
          "Motiva",
          "Inspira ação"
        ],
        imbalances: [
          "Agressividade",
          "Impaciência",
          "Medo excessivo"
        ],
        complementary: "color-verde",
        analogous: ["color-laranja", "color-rosa"]
      },
      {
        id: "color-laranja",
        name: "Orange",
        namePt: "Laranja",
        hex: "#FF8C00",
        frequency: "medium-high",
        wavelength: 620,
        description: "Cor da criatividade, alegria e vitalidade social",
        characteristics: [
          "Criatividade",
          "Entusiasmo",
          "Vitalidade",
          "Optimismo",
          "Sociabilidade"
        ],
        associatedChakras: ["chakra-sacral"],
        healingProperties: [
          "Estimula a criatividade",
          "Promove alegria",
          "Equilibra emoções",
          "Fortalece relacionamentos"
        ],
        spiritualMeanings: [
          "Sexualidade e reprodução",
          "Creative expression",
          "Pleasure and joy",
          "Social connection"
        ],
        emotionalEffects: [
          "Estimula",
          "Animates",
          "Inspira criatividade",
          "Promove bem-estar"
        ],
        imbalances: [
          "Excesso de euforia",
          "Superficialidade",
          "Dependência externa"
        ],
        complementary: "color-azul",
        analogous: ["color-vermelho", "color-amarelo"]
      },
      {
        id: "color-amarelo",
        name: "Yellow",
        namePt: "Amarelo",
        hex: "#FFD700",
        frequency: "medium-high",
        wavelength: 580,
        description: "Cor da mente, intelecto e esperança",
        characteristics: [
          "Intelecto",
          "Comunicação",
          "Esperança",
          "Clareza mental",
          "Espiritualidade elevada"
        ],
        associatedChakras: ["chakra-solar"],
        healingProperties: [
          "Estimula o sistema nervoso",
          "Melhora a digestão",
          "Promove clareza mental",
          "Alivia depression"
        ],
        spiritualMeanings: [
          "Solar plexus wisdom",
          "Mental clarity",
          "Hope and optimism",
          "Higher learning"
        ],
        emotionalEffects: [
          "Ilumina",
          "Clarifies pensamento",
          "Promove esperança",
          "Inspira felicidade"
        ],
        imbalances: [
          "Ansiedade",
          "Perfeccionismo",
          "Crítica excessiva"
        ],
        complementary: "color-roxo",
        analogous: ["color-laranja", "color-verde"]
      },
      {
        id: "color-verde",
        name: "Green",
        namePt: "Verde",
        hex: "#228B22",
        frequency: "medium",
        wavelength: 520,
        description: "Cor da cura, equilíbrio e natureza",
        characteristics: [
          "Equilíbrio",
          "Harmonia",
          "Crescimento",
          "Renovação",
          "Abundância"
        ],
        associatedChakras: ["chakra-heart"],
        healingProperties: [
          "Promove healing físico",
          "Equilibra o coração",
          "Reduz stress",
          "Fortalece o sistema imunológico"
        ],
        spiritualMeanings: [
          "Nature and earth",
          "Heart-centered love",
          "Growth and renewal",
          "Abundance and prosperity"
        ],
        emotionalEffects: [
          "Calms",
          "Refreshes",
          "Renova esperança",
          "Promove Paz"
        ],
        imbalances: [
          "Inveja",
          "Cobiça",
          "Passividade excessiva"
        ],
        complementary: "color-vermelho",
        analogous: ["color-azul", "color-amarelo"]
      },
      {
        id: "color-azul",
        name: "Blue",
        namePt: "Azul",
        hex: "#4169E1",
        frequency: "medium-low",
        wavelength: 470,
        description: "Cor da paz, verdade e comunicação",
        characteristics: [
          "Paz interior",
          "Verdade",
          "Comunicação clara",
          "Intuição",
          "Serenidade"
        ],
        associatedChakras: ["chakra-throat"],
        healingProperties: [
          "Alivia dor",
          "Reduz inflammation",
          "Calms the mind",
          "Promotes healing oral"
        ],
        spiritualMeanings: [
          "Truth and honesty",
          "Inner peace",
          "Communication",
          "Devotion and faith"
        ],
        emotionalEffects: [
          "Calms",
          "Soothes",
          "Promotes tranquility",
          "Facilitates expression"
        ],
        imbalances: [
          "Melancholy",
          "Rigid thinking",
          "Difficulty expressing"
        ],
        complementary: "color-laranja",
        analogous: ["color-verde", "color-roxo"]
      },
      {
        id: "color-indigo",
        name: "Indigo",
        namePt: "Índigo",
        hex: "#4B0082",
        frequency: "low-medium",
        wavelength: 450,
        description: "Cor da intuição, sabedoria interior e espiritualidade profunda",
        characteristics: [
          "Intuição",
          "Sabedoria",
          "Percepção profunda",
          "Imaginação",
          "Inspiritual connection"
        ],
        associatedChakras: ["chakra-third-eye"],
        healingProperties: [
          "Develops intuition",
          "Calms mental anxiety",
          "Promotes spiritual awareness",
          "Supports meditation"
        ],
        spiritualMeanings: [
          "Third eye activation",
          "Deep intuition",
          "Inner vision",
          "Psychic abilities"
        ],
        emotionalEffects: [
          "Deepens insight",
          "Enhances perception",
          "Promotes introspection",
          "Opens inner wisdom"
        ],
        imbalances: [
          "Nightmares",
          "Depression",
          "Isolation"
        ],
        complementary: "color-amarelo",
        analogous: ["color-azul", "color-roxo"]
      },
      {
        id: "color-roxo",
        name: "Violet",
        namePt: "Roxo",
        hex: "#9400D3",
        frequency: "low",
        wavelength: 380,
        description: "Cor da transcendência, transformação e iluminação espiritual",
        characteristics: [
          "Transcendência",
          "Transformação",
          "Iluminação",
          "Inspiração divina",
          "Perfeição espiritual"
        ],
        associatedChakras: ["chakra-crown"],
        healingProperties: [
          "Elevates consciousness",
          "Purifies aura",
          "Supports spiritual healing",
          "Connects to higher realms"
        ],
        spiritualMeanings: [
          "Crown chakra alignment",
          "Divine connection",
          "Spiritual mastery",
          "Enlightenment"
        ],
        emotionalEffects: [
          "Elevates",
          "Transforms",
          "Inspires devotion",
          "Opens to divine love"
        ],
        imbalances: [
          "Spiritual arrogance",
          "Detachment from reality",
          "Overwhelm"
        ],
        complementary: "color-amarelo",
        analogous: ["color-indigo", "color-azul"]
      },
      {
        id: "color-branco",
        name: "White",
        namePt: "Branco",
        hex: "#FFFFFF",
        frequency: "full spectrum",
        wavelength: 0,
        description: "Cor da pureza, verdade absoluta e luz divina",
        characteristics: [
          "Pureza",
          "Verdade",
          "Inocência",
          "Completude",
          "Luz divina"
        ],
        associatedChakras: ["chakra-crown", "chakra-heart"],
        healingProperties: [
          "Purifies energy",
          "Heals trauma",
          "Restores innocence",
          "Connects to source"
        ],
        spiritualMeanings: [
          "Divine light",
          "Absolute truth",
          "Purity of spirit",
          "Complete wholeness"
        ],
        emotionalEffects: [
          "Cleanses",
          "Purifies",
          "Protects",
          "Brings peace"
        ],
        imbalances: [
          "Emotional numbness",
          "Avoidance of shadow",
          "False purity"
        ],
        complementary: "color-preto",
        analogous: ["color-roxo", "color-cristal"]
      },
      {
        id: "color-preto",
        name: "Black",
        namePt: "Preto",
        hex: "#000000",
        frequency: "absorption",
        wavelength: 0,
        description: "Cor do potencial infinito, mistério e absorção de luz",
        characteristics: [
          "Mistério",
          "Potencial",
          "Proteção",
          "Absorção",
          "Transformação"
        ],
        associatedChakras: ["chakra-root"],
        healingProperties: [
          "Provides grounding",
          "Offers protection",
          "Absorbs negativity",
          "Supports transformation"
        ],
        spiritualMeanings: [
          "Infinite potential",
          "The void before creation",
          "Mystery and depth",
          "Shadow work"
        ],
        emotionalEffects: [
          "Protects",
          "Anchors",
          "Transforms",
          "Integrates shadow"
        ],
        imbalances: [
          "Depression",
          "Isolation",
          "Resistance to change"
        ],
        complementary: "color-branco",
        analogous: ["color-vermelho", "color-azul"]
      },
      {
        id: "color-dourado",
        name: "Gold",
        namePt: "Dourado",
        hex: "#FFD700",
        frequency: "high",
        wavelength: 590,
        description: "Cor da abundância divina, iluminação e realizzazione",
        characteristics: [
          "Abundância",
          "Iluminação",
          "Realizzazione",
          "Sabedoria divina",
          "Sucesso"
        ],
        associatedChakras: ["chakra-solar", "chakra-crown"],
        healingProperties: [
          "Activates solar plexus",
          "Attracts abundance",
          "Supports manifestation",
          "Balances energy"
        ],
        spiritualMeanings: [
          "Divine abundance",
          "Success and achievement",
          "Enlightenment",
          "Christ consciousness"
        ],
        emotionalEffects: [
          "Empowers",
          "Motivates",
          "Builds confidence",
          "Attracts prosperity"
        ],
        imbalances: [
          "Materialism",
          "Arrogance",
          "Entitlement"
        ],
        complementary: "color-prata",
        analogous: ["color-amarelo", "color-laranja"]
      },
      {
        id: "color-prata",
        name: "Silver",
        namePt: "Prata",
        hex: "#C0C0C0",
        frequency: "reflective",
        wavelength: 450,
        description: "Cor da intuizione femminile, chiaroveggenza e luna",
        characteristics: [
          "Intuizione",
          "Sensibilità",
          "Chiarezza lunare",
          "Femminilità sacra",
          "Psicologia"
        ],
        associatedChakras: ["chakra-third-eye", "chakra-crown"],
        healingProperties: [
          "Supports psychic development",
          "Balances emotions",
          "Enhances intuition",
          "Connects to moon energy"
        ],
        spiritualMeanings: [
          "Divine feminine",
          "Intuition and insight",
          "Moon energy",
          "Psychic abilities"
        ],
        emotionalEffects: [
          "Calms emotions",
          "Enhances perception",
          "Supports sensitivity",
          "Promotes inner wisdom"
        ],
        imbalances: [
          "Over-sensitivity",
          "Mood swings",
          "Escapism"
        ],
        complementary: "color-dourado",
        analogous: ["color-branco", "color-azul"]
      },
      {
        id: "color-rosa",
        name: "Pink",
        namePt: "Rosa",
        hex: "#FF69B4",
        frequency: "medium",
        wavelength: 650,
        description: "Cor dell'amore incondizionato, compassione e guarigione emotiva",
        characteristics: [
          "Amore",
          "Compassione",
          "Tenerezza",
          "Armonia",
          "Gentilezza"
        ],
        associatedChakras: ["chakra-heart"],
        healingProperties: [
          "Heals emotional wounds",
          "Opens heart to love",
          "Promotes self-acceptance",
          "Supports emotional balance"
        ],
        spiritualMeanings: [
          "Unconditional love",
          "Divine compassion",
          "Innocence and purity",
          "Heart-centered connection"
        ],
        emotionalEffects: [
          "Soothes",
          "Comforts",
          "Opens heart",
          "Promotes forgiveness"
        ],
        imbalances: [
          "Need for approval",
          "Codependency",
          "Self-rejection"
        ],
        complementary: "color-verde",
        analogous: ["color-vermelho", "color-branco"]
      },
      {
        id: "color-cristal",
        name: "Crystal",
        namePt: "Cristal",
        hex: "#E6E6FA",
        frequency: "transcendent",
        wavelength: 0,
        description: "Cor della purezza cristallina, chiarezza spirituale e energia vibratoria",
        characteristics: [
          "Purezza",
          "Chiarezza",
          "Vibrazione elevata",
          "Luce",
          "Trasformazione"
        ],
        associatedChakras: ["chakra-crown", "chakra-third-eye"],
        healingProperties: [
          "Purifies energy field",
          "Activates all chakras",
          "Amplifies intention",
          "Connects to higher self"
        ],
        spiritualMeanings: [
          "Divine light",
          "Higher consciousness",
          "Spiritual clarity",
          "Ascension energy"
        ],
        emotionalEffects: [
          "Purifies",
          "Clarifies",
          "Elevates",
          "Transmutes"
        ],
        imbalances: [
          "Disconnection from body",
          "Unrealistic expectations",
          "Avoidance of shadow"
        ],
        complementary: "color-preto",
        analogous: ["color-branco", "color-roxo"]
      },
      {
        id: "color-turquesa",
        name: "Turquoise",
        namePt: "Turquesa",
        hex: "#40E0D0",
        frequency: "medium-low",
        wavelength: 490,
        description: "Cor della comunicazione autentica, freschezza e guarigione",
        characteristics: [
          "Comunicazione",
          "Autenticità",
          "Freschezza",
          "Guarigione",
          "Equilibrio"
        ],
        associatedChakras: ["chakra-throat", "chakra-heart"],
        healingProperties: [
          "Supports communication",
          "Heals emotional trauma",
          "Balances nervous system",
          "Protects energy field"
        ],
        spiritualMeanings: [
          "Authentic expression",
          "Emotional healing",
          "Protection and purification",
          "Cross-cultural wisdom"
        ],
        emotionalEffects: [
          "Refreshes mind",
          "Opens communication",
          "Calms emotions",
          "Promotes honesty"
        ],
        imbalances: [
          "Over-sharing",
          "People-pleasing",
          "Avoiding conflict"
        ],
        complementary: "color-salmão",
        analogous: ["color-azul", "color-verde"]
      },
      {
        id: "color-salmão",
        name: "Salmon",
        namePt: "Salmão",
        hex: "#FA8072",
        frequency: "medium",
        wavelength: 610,
        description: "Cor dell'armonia emotiva, guarigione del cuore e vulnerabilità sana",
        characteristics: [
          "Guarigione",
          "Vulnerabilità",
          "Compassione",
          "Connettività",
          "Intimità"
        ],
        associatedChakras: ["chakra-heart"],
        healingProperties: [
          "Heals heart wounds",
          "Supports emotional expression",
          "Promotes healthy boundaries",
          "Encourages vulnerability"
        ],
        spiritualMeanings: [
          "Emotional healing",
          "Heart-centered vulnerability",
          "Healthy intimacy",
          "Compassionate connection"
        ],
        emotionalEffects: [
          "Comforts",
          "Heals",
          "Connects deeply",
          "Promotes vulnerability"
        ],
        imbalances: [
          "Co-dependency",
          "Fear of rejection",
          "Over-giving"
        ],
        complementary: "color-turquesa",
        analogous: ["color-rosa", "color-laranja"]
      },
      {
        id: "color-magenta",
        name: "Magenta",
        namePt: "Magenta",
        hex: "#FF00FF",
        frequency: "high",
        wavelength: 400,
        description: "Cor della trasformazione spirituale, passione divina e cosmic awareness",
        characteristics: [
          "Trasformazione",
          "Passione divina",
          "Cosmic awareness",
          "Elevazione",
          "Amore incondizionato"
        ],
        associatedChakras: ["chakra-heart", "chakra-crown"],
        healingProperties: [
          "Activates heart and crown",
          "Supports spiritual awakening",
          "Transforms consciousness",
          "Connects to divine love"
        ],
        spiritualMeanings: [
          "Divine passion",
          "Spiritual transformation",
          "Cosmic consciousness",
          "Unconditional love"
        ],
        emotionalEffects: [
          "Transforms",
          "Elevates",
          "Ignites passion",
          "Opens to divine"
        ],
        imbalances: [
          "Mania",
          "Overwhelming intensity",
          "Disconnection from earth"
        ],
        complementary: "color-verde",
        analogous: ["color-roxo", "color-rosa"]
      },
      {
        id: "color-Âmbar",
        name: "Amber",
        namePt: "Âmbar",
        hex: "#FFBF00",
        frequency: "medium-high",
        wavelength: 590,
        description: "Cor della vitalità solare, coraggio e manifestazione",
        characteristics: [
          "Vitalità",
          "Coraggio",
          "Manifestazione",
          "Sicurezza",
          "Potere personale"
        ],
        associatedChakras: ["chakra-solar"],
        healingProperties: [
          "Strengthens personal power",
          "Supports manifestation",
          "Boosts confidence",
          "Activates solar energy"
        ],
        spiritualMeanings: [
          "Solar energy",
          "Personal power",
          "Manifestation",
          "Courage and confidence"
        ],
        emotionalEffects: [
          "Empowers",
          "Motivates",
          "Builds confidence",
          "Encourages action"
        ],
        imbalances: [
          "Dominação",
          "Ego inflation",
          "Control issues"
        ],
        complementary: "color-azul",
        analogous: ["color-dourado", "color-laranja"]
      },
      {
        id: "color-lavanda",
        name: "Lavender",
        namePt: "Lavanda",
        hex: "#E6E6FA",
        frequency: "low-medium",
        wavelength: 420,
        description: "Cor della pace interiore, trascendenza leggera e connessione angelica",
        characteristics: [
          "Pace",
          "Tranquillità",
          "Connessione angelica",
          "Sottigliezza",
          "Devozione"
        ],
        associatedChakras: ["chakra-crown", "chakra-third-eye"],
        healingProperties: [
          "Calms the mind",
          "Supports meditation",
          "Connects to angelic realm",
          "Promotes spiritual peace"
        ],
        spiritualMeanings: [
          "Angelic connection",
          "Inner peace",
          "Divine surrender",
          "Light transcendance"
        ],
        emotionalEffects: [
          "Soothes",
          "Calms",
          "Elevates",
          "Connects to divine"
        ],
        imbalances: [
          "Fantasy escape",
          "Disconnection from reality",
          "Avoidance"
        ],
        complementary: "color-dourado",
        analogous: ["color-roxo", "color-branco"]
      }
    ],
    colorFamilies: [
      {
        family: "warms",
        colors: ["color-vermelho", "color-laranja", "color-amarelo", "color-dourado", "color-Âmbar"],
        vibration: "energizing"
      },
      {
        family: "cools",
        colors: ["color-verde", "color-azul", "color-indigo", "color-turquesa"],
        vibration: "calming"
      },
      {
        family: "ultraviolets",
        colors: ["color-roxo", "color-indigo", "color-magenta", "color-lavanda"],
        vibration: "transcendent"
      },
      {
        family: "neutrals",
        colors: ["color-branco", "color-preto", "color-cristal", "color-prata"],
        vibration: "balancing"
      },
      {
        family: "heart",
        colors: ["color-verde", "color-rosa", "color-salmão", "color-turquesa"],
        vibration: "healing"
      }
    ]
  };
}