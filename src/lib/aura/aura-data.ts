/**
 * Aura data module
 * Provides energy field and aura color data for the Cabala dos Caminhos system
 */

export interface AuraColor {
  id: string;
  name: string;
  namePt: string;
  frequency: string;
  description: string;
  characteristics: string[];
  associatedChakras: string[];
  healingProperties: string[];
  imbalances: string[];
}

export interface AuraLayer {
  layer: number;
  name: string;
  namePt: string;
  colorRange: string[];
  function: string;
  duration: string;
}

export function getData(): {
  auraColors: AuraColor[];
  auraLayers: AuraLayer[];
} {
  return {
    auraColors: [
      {
        id: "aura-vermelha",
        name: "Red Aura",
        namePt: "Aura Vermelha",
        frequency: "low",
        description: "Energia de sobrevivência, força vital e determinação",
        characteristics: [
          "Vitalidade física",
          "Coragem",
          "Determinação",
          "Instinto de sobrevivência"
        ],
        associatedChakras: ["chakra-root"],
        healingProperties: [
          "Fortalece a energia vital",
          "Promove coragem",
          "Estabiliza emoções"
        ],
        imbalances: [
          "Agressividade",
          "Medo excessivo",
          "Rigidez"
        ]
      },
      {
        id: "aura-laranja",
        name: "Orange Aura",
        namePt: "Aura Laranja",
        frequency: "medium-low",
        description: "Energia criativa, prazer e dinamismo social",
        characteristics: [
          "Criatividade",
          "Entusiasmo",
          "Sociabilidade",
          "Sensação de prazer"
        ],
        associatedChakras: ["chakra-sacral"],
        healingProperties: [
          "Estimula a criatividade",
          "Promove alegria",
          "Fortalece relacionamentos"
        ],
        imbalances: [
          "Dependência emocional",
          "Excesso de prazer",
          "Superficialidade"
        ]
      },
      {
        id: "aura-amarela",
        name: "Yellow Aura",
        namePt: "Aura Amarela",
        frequency: "medium",
        description: "Energia intelectual, comunicação e expressão pessoal",
        characteristics: [
          "Intelecto",
          "Comunicação",
          "Autoexpressão",
          "Confiança"
        ],
        associatedChakras: ["chakra-solar"],
        healingProperties: [
          "Estimula o pensamento",
          "Promove clareza mental",
          "Fortalece a autoexpressão"
        ],
        imbalances: [
          "Crítica excessiva",
          "Arrogância intelectual",
          "Nervosismo"
        ]
      },
      {
        id: "aura-verde",
        name: "Green Aura",
        namePt: "Aura Verde",
        frequency: "medium-high",
        description: "Energia de crescimento, cura e harmonia com a natureza",
        characteristics: [
          "Crescimento pessoal",
          "Curación",
          "Harmonia",
          "Conexão com a natureza"
        ],
        associatedChakras: ["chakra-heart"],
        healingProperties: [
          "Promove Healing físico e emocional",
          "Estimula o crescimento",
          "Harmoniza relacionamentos"
        ],
        imbalances: [
          "Ciúmes",
          "Manipulação emocional",
          "Indecisão"
        ]
      },
      {
        id: "aura-rosa",
        name: "Pink Aura",
        namePt: "Aura Rosa",
        frequency: "high",
        description: "Energia de amor incondicional e compaixão universal",
        characteristics: [
          "Amor incondicional",
          "Compaixão",
          "Doçura",
          "Aceitação"
        ],
        associatedChakras: ["chakra-heart"],
        healingProperties: [
          "Promove Healing do coração",
          "Abre para o amor",
          "Dissolve mágoas"
        ],
        imbalances: [
          "Autocompaixão excessiva",
          "Necessidade de aprovação",
          "Ganso emocional"
        ]
      },
      {
        id: "aura-azul",
        name: "Blue Aura",
        namePt: "Aura Azul",
        frequency: "high",
        description: "Energia de comunicação espiritual e verdade interior",
        characteristics: [
          "Comunicação espiritual",
          "Verdade",
          "Serenidade",
          "Intuição"
        ],
        associatedChakras: ["chakra-throat"],
        healingProperties: [
          "Promove clareza na comunicação",
          "Calma a mente",
          "Abre canais intuitivos"
        ],
        imbalances: [
          "Fuga da realidade",
          "Perfeccionismo",
          "Frieza emocional"
        ]
      },
      {
        id: "aura-indigo",
        name: "Indigo Aura",
        namePt: "Aura Índigo",
        frequency: "very-high",
        description: "Energia de percepção profunda e visão espiritual",
        characteristics: [
          "Intuição profunda",
          "Visão interior",
          "Discernimento",
          "Sabedoria"
        ],
        associatedChakras: ["chakra-third-eye"],
        healingProperties: [
          "Desperta a intuição",
          "Promove visão clara",
          "Aprofunda a meditação"
        ],
        imbalances: [
          "Isolamento",
          "Melancolia",
          "Desconexão terrena"
        ]
      },
      {
        id: "aura-violeta",
        name: "Violet Aura",
        namePt: "Aura Violeta",
        frequency: "transcendental",
        description: "Energia de transformação espiritual e conexão cósmica",
        characteristics: [
          "Transformação",
          "Conexão cósmica",
          "Misticismo",
          "Iluminação"
        ],
        associatedChakras: ["chakra-crown"],
        healingProperties: [
          "Promove evolução espiritual",
          "Conecta com o divino",
          "Transforma padrões"
        ],
        imbalances: [
          "Fanatismo",
          "Despersonalização",
          "Fuga do mundo"
        ]
      },
      {
        id: "aura-branca",
        name: "White Aura",
        namePt: "Aura Branca",
        frequency: "pure",
        description: "Energia de pureza, verdade absoluta e proteção divina",
        characteristics: [
          "Pureza",
          "Verdade absoluta",
          "Proteção divina",
          "Iluminação total"
        ],
        associatedChakras: ["chakra-crown", "chakra-third-eye"],
        healingProperties: [
          "Purifica a energia",
          "Protege de influências negativas",
          "Acelera a evolução"
        ],
        imbalances: [
          "Rigidez moral",
          "Intolerância",
          " dogmatismo"
        ]
      },
      {
        id: "aura-dourada",
        name: "Golden Aura",
        namePt: "Aura Dourada",
        frequency: "divine",
        description: "Energia de abundância, sabedoria divina e propósito",
        characteristics: [
          "Abundância",
          "Sabedoria divina",
          "Propósito claro",
          "Prosperidade"
        ],
        associatedChakras: ["chakra-solar", "chakra-crown"],
        healingProperties: [
          "Manifesta abundância",
          "Ilumina o caminho",
          "Fortalece o propósito"
        ],
        imbalances: [
          "Materialismo",
          "Orgulho",
          "Expectativas irreais"
        ]
      }
    ],
    auraLayers: [
      {
        layer: 1,
        name: "Etheric Body",
        namePt: "Corpo Etérico",
        colorRange: ["blue", "gray"],
        function: "Vital energy and physical health",
        duration: "Immediate - current state"
      },
      {
        layer: 2,
        name: "Emotional Body",
        namePt: "Corpo Emocional",
        colorRange: ["orange", "pink", "red"],
        function: "Feelings and emotional processing",
        duration: "Recent emotions - days to weeks"
      },
      {
        layer: 3,
        name: "Mental Body",
        namePt: "Corpo Mental",
        colorRange: ["yellow", "gold"],
        function: "Thoughts and mental patterns",
        duration: "Weekly to monthly patterns"
      },
      {
        layer: 4,
        name: "Astral Body",
        namePt: "Corpo Astral",
        colorRange: ["green", "pink"],
        function: "Love and connection",
        duration: "Monthly to yearly patterns"
      },
      {
        layer: 5,
        name: "Etheric Template",
        namePt: "Modelo Etérico",
        colorRange: ["light blue", "turquoise"],
        function: "Life blueprint and destiny",
        duration: "Yearly patterns"
      },
      {
        layer: 6,
        name: "Celestial Body",
        namePt: "Corpo Celestial",
        colorRange: ["gold", "silver"],
        function: "Divine love and spiritual purpose",
        duration: "Multi-year cycles"
      },
      {
        layer: 7,
        name: "Causal Body",
        namePt: "Corpo Causal",
        colorRange: ["white", "violet"],
        function: "Soul purpose and karmic lessons",
        duration: "Lifetime and beyond"
      }
    ]
  };
}