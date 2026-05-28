/**
 * Crystal data module
 * Provides crystal properties and healing data for the Cabala dos Caminhos system
 */

export interface Crystal {
  id: string;
  name: string;
  namePt: string;
  formula: string;
  hardness: string;
  chakra: string;
  element: string;
  planets: string[];
  colors: string[];
  properties: string[];
  healingProperties: string[];
  spiritualUses: string[];
  emotionalUses: string[];
  physicalUses: string[];
  cleansing: string[];
  charging: string[];
  zodiac: string[];
  description: string;
}

export interface CrystalSystem {
  id: string;
  name: string;
  namePt: string;
  description: string;
}

export function getData(): {
  crystals: Crystal[];
  crystalSystems: CrystalSystem[];
} {
  return {
    crystals: [
      {
        id: "quartzo-claro",
        name: "Clear Quartz",
        namePt: "Quartzo Claro",
        formula: "SiO2",
        hardness: "7",
        chakra: "crown",
        element: "light",
        planets: ["sun", "moon"],
        colors: ["white", "clear", "translucent"],
        properties: ["amplification", "clarity", "energy", "balance"],
        healingProperties: [
          "Amplifica energia",
          "Promove clareza mental",
          "Harmoniza corpos sutis",
          "Equilibra físico e espiritual"
        ],
        spiritualUses: [
          "Meditação profunda",
          "Programação cristalina",
          "Canalização de luz",
          "Abertura de portais"
        ],
        emotionalUses: [
          "Clareza emocional",
          "Liberação de bloqueios",
          "Transmutação de negativos",
          "Fortalecimento da intenção"
        ],
        physicalUses: [
          "Fortalecimento do sistema imunológico",
          "Alívio de dores de cabeça",
          "Harmonização celular",
          "Rejuvenescimento"
        ],
        cleansing: ["água corrente", "smudging", "som", "luz solar fraca"],
        charging: ["luz solar", "luz lunar", "terra", "outros cristais"],
        zodiac: ["leao", "sagitario", "aquario"],
        description: "O mestre dos cristais, amplifica intenção e energia. Use para qualquer propósito."
      },
      {
        id: "ametista",
        name: "Amethyst",
        namePt: "Ametista",
        formula: "SiO2",
        hardness: "7",
        chakra: "third-eye",
        element: "water",
        planets: ["neptune", "jupiter"],
        colors: ["purple", "lavender", "deep violet"],
        properties: ["protection", "transformation", "spiritual", "calming"],
        healingProperties: [
          "Proteção espiritual",
          "Calma mental",
          "Promove sono reparador",
          "Transforma energia negativa"
        ],
        spiritualUses: [
          "Desenvolvimento psychic",
          "Conexão dimensional",
          "Proteção aura",
          "Meditação ascensional"
        ],
        emotionalUses: [
          "Alívio da ansiedade",
          "Liberação de padrões viciantes",
          "Promove paz interior",
          "Sustento em transições"
        ],
        physicalUses: [
          "Alívio de dores de cabeça",
          "Regulação do sono",
          "Fortalecimento imunológico",
          "Alívio do estresse"
        ],
        cleansing: ["terra", "smudging", "cristais maiores"],
        charging: ["luz lunar", "amendoeira"],
        zodiac: ["peixes", "sagitario", "aquario"],
        description: "Cristal da transcendência, conecta com planos superiores e protege energeticamente."
      },
      {
        id: "quartzo-rosa",
        name: "Rose Quartz",
        namePt: "Quartzo Rosa",
        formula: "SiO2",
        hardness: "7",
        chakra: "heart",
        element: "water",
        planets: ["venus", "moon"],
        colors: ["pink", "pale rose", "soft pink"],
        properties: ["love", "compassion", "healing", "emotional"],
        healingProperties: [
          "Abre o coração",
          "Promove amor próprio",
          "Cura feridas emocionais",
          "Harmoniza relacionamentos"
        ],
        spiritualUses: [
          "Expansão do amor incondicional",
          "Conexão com energia divina feminina",
          "Autorização do perdão",
          "Resonância com chakra cardíaco"
        ],
        emotionalUses: [
          "Cura de traumas cardíacos",
          "Dissolução de mágoas",
          "Promove autoaceitação",
          "Fortalece conexões amorosas"
        ],
        physicalUses: [
          "Saúde cardíaca",
          "Fertilidade",
          "Sistema circulatório",
          "Beleza da pele"
        ],
        cleansing: ["água salgada suave", "smudging", "terra"],
        charging: ["luz lunar cheia", "quartzo claro"],
        zodiac: ["touro", "libra"],
        description: "Cristal do amor incondicional, cura corações e fortalece laços afetivos."
      },
      {
        id: "citrino",
        name: "Citrine",
        namePt: "Citrino",
        formula: "SiO2",
        hardness: "7",
        chakra: "solar-plexus",
        element: "fire",
        planets: ["sun", "jupiter"],
        colors: ["yellow", "golden", "amber"],
        properties: ["abundance", "manifestation", "confidence", "energy"],
        healingProperties: [
          "Promove abundância",
          "Fortalecimento pessoal",
          "Estimula criatividade",
          "Dissipa negatividade"
        ],
        spiritualUses: [
          "Manifestação de intenções",
          "Ativação do poder pessoal",
          "Conexão com fogo interior",
          "Expansão da luz solar"
        ],
        emotionalUses: [
          "Aumenta autoconfiança",
          "Dissipa medos",
          "Promove alegria",
          "Fortalece vontade"
        ],
        physicalUses: [
          "Sistema digestível",
          "Glândula tireoide",
          "Metabolismo",
          "Energia vital"
        ],
        cleansing: ["água corrente", "smudging"],
        charging: ["luz solar direta", "quartzo claro"],
        zodiac: ["aries", "leao", "gemeos"],
        description: "Cristal do sol, atrai prosperidade e fortalece o poder pessoal."
      },
      {
        id: "turmalina-negra",
        name: "Black Tourmaline",
        namePt: "Turmalina Negra",
        formula: "(Na,Ca)(Mg,Fe)3Al6B3Si6O27(OH)4",
        hardness: "7-7.5",
        chakra: "root",
        element: "earth",
        planets: ["saturn", "earth"],
        colors: ["black", "dark green-black"],
        properties: ["protection", "grounding", "purification", "shielding"],
        healingProperties: [
          "Proteção contra energias negativas",
          "Ancoramento à terra",
          "Purificação de campos",
          "Escudo energético"
        ],
        spiritualUses: [
          "Proteção de espaços",
          "Ancoramento em meditação",
          "Bloqueio de influências negativas",
          "Limpeza de entidades"
        ],
        emotionalUses: [
          "Dissolução de medos",
          "Proteção contra ansiedade",
          "Estabilização emocional",
          "Liberação de padrões densos"
        ],
        physicalUses: [
          "Ancoramento físico",
          "Alívio de estresse",
          "Proteção contra radiação",
          "Fortalecimento dos ossos"
        ],
        cleansing: ["terra", "smudging forte", "sal grosso"],
        charging: ["terra", "quartzo claro"],
        zodiac: ["capricornio", "escorpiao"],
        description: "Escudo protetor supremo, purifica e ancorra energia."
      },
      {
        id: "obsidiana",
        name: "Obsidian",
        namePt: "Obsidiana",
        formula: "SiO2",
        hardness: "5-5.5",
        chakra: "root",
        element: "fire",
        planets: ["pluto", "saturn"],
        colors: ["black", "sheen", "mahogany", "snowflake"],
        properties: ["protection", "insight", "transformation", "grounding"],
        healingProperties: [
          "Proteção intensa",
          "Revelação de verdades ocultas",
          "Transmutação de sombras",
          "Ancoramento profundo"
        ],
        spiritualUses: [
          "Trabalho com sombra",
          "Descoberta de verdades internas",
          "Proteção em jornada xamânica",
          "Corte de laços energeticos"
        ],
        emotionalUses: [
          "Enfrentamento de verdades difíceis",
          "Dissolução de defesas",
          "Processamento de traumas",
          "Liberação de mágoas profundas"
        ],
        physicalUses: [
          "Alívio de dores musculares",
          "Circulação",
          "Proteção contra frio",
          "Desintoxicação"
        ],
        cleansing: ["smudging forte", "terra", "cristais maiores"],
        charging: ["luz lunar", "terra"],
        zodiac: ["escorpiao", "sagitario"],
        description: "Espelho da alma, revela verdades e transforma sombras em luz."
      },
      {
        id: "selenita",
        name: "Selenite",
        namePt: "Selenita",
        formula: "CaSO4·2H2O",
        hardness: "2",
        chakra: "crown",
        element: "light",
        planets: ["moon"],
        colors: ["white", "pearl", "transparent"],
        properties: ["light", "clarity", "connection", "cleansing"],
        healingProperties: [
          "Conexão com luz superior",
          "Limpeza de campos sutis",
          "Clareza mental",
          "Expansão de consciência"
        ],
        spiritualUses: [
          "Abertura de canais superiores",
          "Limpeza de outros cristais",
          "Meditação ascensionista",
          "Conexão com mestres"
        ],
        emotionalUses: [
          "Paz profunda",
          "Clareza emocional",
          "Liberação de pensamentos densos",
          "Promoção de serenidade"
        ],
        physicalUses: [
          "Harmonização do ambiente",
          "Limpeza de campos eletromagnéticos",
          "Promoção de bem-estar",
          "Alívio de insônia"
        ],
        cleansing: ["não requer", "auto-limpa"],
        charging: ["luz lunar", "cristais claros"],
        zodiac: ["cancer", "touro"],
        description: "Cristal de luz lunar, purifica e conecta com realms superiores."
      },
      {
        id: "labradorita",
        name: "Labradorite",
        namePt: "Labradorita",
        formula: "(Ca,Na)(Si,Al)4O8",
        hardness: "6-6.5",
        chakra: "third-eye",
        element: "water",
        planets: ["moon", "neptune"],
        colors: ["gray", "black", "iridescent flashes"],
        properties: ["magic", "protection", "intuition", "transformation"],
        healingProperties: [
          "Proteção durante transformação",
          "Despertar de habilidades psychic",
          "Intuição amplificada",
          "Desenvolvimento espiritual"
        ],
        spiritualUses: [
          "Trabalho mágico",
          "Viagem astral",
          "Despertar de dons ocultos",
          "Proteção interdimensional"
        ],
        emotionalUses: [
          "Proteção durante mudanças",
          "Fortalecimento de intuição",
          "Suporte em transições",
          "Promoção de autenticidade"
        ],
        physicalUses: [
          "Metabolismo",
          "Sistema nervoso",
          "Clareza mental",
          "Resistência ao estresse"
        ],
        cleansing: ["smudging", "terral", "luz lunar"],
        charging: ["luz lunar cheia", "quartzo claro"],
        zodiac: ["leao", "escorpiao", "sagitario"],
        description: "A pedra dos mágicos, desperta dons ocultos e protege durante transformação."
      },
      {
        id: "fluorita",
        name: "Fluorite",
        namePt: "Fluorita",
        formula: "CaF2",
        hardness: "4",
        chakra: "third-eye",
        element: "water",
        planets: ["mercury", "jupiter"],
        colors: ["purple", "green", "blue", "rainbow"],
        properties: ["clarity", "organization", "protection", "focus"],
        healingProperties: [
          "Harmonização mental",
          "Aumento de concentração",
          "Proteção contra ondas",
          "Equilíbrio de campos"
        ],
        spiritualUses: [
          "Clareza de propósito",
          "Organização de pensamentos",
          "Proteção de spaces negativos",
          "Desenvolvimento psychic"
        ],
        emotionalUses: [
          "Redução de ansiedade",
          "Organização emocional",
          "Clareza em decisões",
          "Liberação de confusão"
        ],
        physicalUses: [
          "Saúde dental",
          "Sistema imunológico",
          "Articulações",
          "Equilíbrio celular"
        ],
        cleansing: ["água corrente", "smudging"],
        charging: ["quartzo claro", "amethyst"],
        zodiac: ["peixes", "aquario", "gemeos"],
        description: "Cristal da clareza, organiza energia mental e proteção."
      },
      {
        id: "cornalina",
        name: "Carnelian",
        namePt: "Cornalina",
        formula: "SiO2",
        hardness: "7",
        chakra: "sacral",
        element: "fire",
        planets: ["mars", "sun"],
        colors: ["orange", "red-orange", "brownish"],
        properties: ["creativity", "motivation", "courage", "abundance"],
        healingProperties: [
          "Estimulação da criatividade",
          "Aumento de motivação",
          "Fortalecimento de coragem",
          "Atração de abundância"
        ],
        spiritualUses: [
          "Ativação do chakra sagrado",
          "Manifestação de desejos",
          "Queima de bloqueios criativos",
          "Energização de intenções"
        ],
        emotionalUses: [
          "Superação de procrastinação",
          "Fortalecimento de confiança",
          "Estímulo de ação",
          "Dissolução de inércia"
        ],
        physicalUses: [
          "Saúde reprodutiva",
          "Circulação",
          "Fertilidade",
          "Metabolismo"
        ],
        cleansing: ["água corrente", "smudging", "sol"],
        charging: ["luz solar direta", "quartzo claro"],
        zodiac: ["aries", "touro", "leao"],
        description: "Cristal da ação, ativa criatividade e movimento em direção aos objetivos."
      },
      {
        id: "lapislazuli",
        name: "Lapis Lazuli",
        namePt: "Lápis Lazúli",
        formula: "(Na,Ca)8(SiS4)2(Al6Si6O24)",
        hardness: "5-6",
        chakra: "third-eye",
        element: "water",
        planets: ["jupiter", "venus"],
        colors: ["blue", "deep blue", "with gold pyrite"],
        properties: ["wisdom", "truth", "communication", "spiritual"],
        healingProperties: [
          "Abertura de canais de comunicação",
          "Promoção de sabedoria interior",
          "Aumento de percepção",
          "Expressão de verdades"
        ],
        spiritualUses: [
          "Desenvolvimento de intuição",
          "Conexão com conhecimento antigo",
          "Abertura do terceiro olho",
          "Comunicação com mestres"
        ],
        emotionalUses: [
          "Expressão autêntica",
          "Liberdade de represamento",
          "Promoção de honestidade",
          "Cura de mágoas de comunicação"
        ],
        physicalUses: [
          "Garganta e garganta",
          "Sistema nervoso",
          "Clareza mental",
          "Alívio de dores"
        ],
        cleansing: ["smudging", "canto"],
        charging: ["luz lunar cheia", "quartzo claro"],
        zodiac: ["sagitario", "touro"],
        description: "Pedra dos reis e gurus, desperta sabedoria e comunicação verdadeira."
      },
      {
        id: "turquesa",
        name: "Turquoise",
        namePt: "Turquesa",
        formula: "CuAl6(PO4)4(OH)8·4H2O",
        hardness: "5-6",
        chakra: "throat",
        element: "earth",
        planets: ["venus", "jupiter"],
        colors: ["blue", "green-blue", "matrix patterns"],
        properties: ["protection", "communication", "healing", "balance"],
        healingProperties: [
          "Proteção contra energias negativas",
          "Promoção de comunicação verdadeira",
          "Harmonização de chakras",
          "Equilíbrio emocional"
        ],
        spiritualUses: [
          "Proteção em viagens",
          "Conexão com espíritos da terra",
          "Harmonização de planos",
          "Equilíbrio entre céu e terra"
        ],
        emotionalUses: [
          "Comunicação autêntica",
          "Alívio de depressões",
          "Fortalecimento de amizades",
          "Proteção de corações"
        ],
        physicalUses: [
          "Sistema respiratório",
          "Imunológico",
          "Articulações",
          "Clareza de pulmões"
        ],
        cleansing: ["terra seca", "smudging suave"],
        charging: ["luz solar fraca", "quartzo claro"],
        zodiac: ["sagitario", "touro", "peixes"],
        description: "Pedra sagrada de muitos povos, proteção, comunicação e equilíbrio."
      },
      {
        id: "sodalita",
        name: "Sodalite",
        namePt: "Sodalita",
        formula: "Na8Al6Si6O24Cl2",
        hardness: "5.5-6",
        chakra: "third-eye",
        element: "water",
        planets: ["moon", "neptune"],
        colors: ["blue", "white veins", "gray"],
        properties: ["intuition", "logic", "calming", "insight"],
        healingProperties: [
          "Harmonização de mente e emoção",
          "Promoção de intuição",
          "Calma mental",
          "Clareza de pensamento"
        ],
        spiritualUses: [
          "Despertar psychic",
          "Conexão com sabedoria interior",
          "Comunicação com guides",
          "Meditação profunda"
        ],
        emotionalUses: [
          "Liberação de medos",
          "Promoção de calma",
          "Alívio de ansiedades",
          "Clareza emocional"
        ],
        physicalUses: [
          "Sistema metabólico",
          "Glândula pineal",
          "Clareza mental",
          "Harmonização de fluidos"
        ],
        cleansing: ["água corrente", "smudging"],
        charging: ["luz lunar", "quartzo claro"],
        zodiac: ["peixes", "sagitario"],
        description: "Cristal do conhecimento profundo, harmoniza lógica e intuição."
      },
      {
        id: "onix",
        name: "Onyx",
        namePt: "Ônix",
        formula: "SiO2",
        hardness: "7",
        chakra: "root",
        element: "earth",
        planets: ["saturn", "mars"],
        colors: ["black", "banded", "green", "red"],
        properties: ["protection", "strength", "grounding", "focus"],
        healingProperties: [
          "Fortalecimento de ancoramento",
          "Proteção contra negativity",
          "Aumento de resistência",
          "Clareza mental"
        ],
        spiritualUses: [
          "Proteção durante trabalho espiritual",
          "Ancoramento de energia",
          "Fortalecimento de will",
          " Corte de energias negativas"
        ],
        emotionalUses: [
          "Força em tempos difíceis",
          "Autodisciplina",
          "Liberação de vícios",
          "Estabilidade emocional"
        ],
        physicalUses: [
          "Sistema nervoso",
          "Ossos e dentes",
          "Energia física",
          "Recuperação de doenças"
        ],
        cleansing: ["terra", "smudging forte"],
        charging: ["luz solar fraca", "quartzo claro"],
        zodiac: ["leao", "capricornio"],
        description: "Pedra da autoafirmação, fortalece e protege com energia terrestre."
      },
      {
        id: "agata-coracão",
        name: "Heart Agate",
        namePt: "Ágata do Coração",
        formula: "SiO2",
        hardness: "7",
        chakra: "heart",
        element: "earth",
        planets: ["venus", "earth"],
        colors: ["pink", "white", "banded pink"],
        properties: ["love", "comfort", "healing", "harmony"],
        healingProperties: [
          "Cura do coração emocional",
          "Promoção de amor próprio",
          "Harmonização de relacionamentos",
          "Conforto em tempos de dor"
        ],
        spiritualUses: [
          "Harmonização do chakra cardíaco",
          "Conexão com amor universal",
          "Promoção de compaixão",
          "Equilíbrio emocional"
        ],
        emotionalUses: [
          "Cura de feridas amorosas",
          "Fortalecimento de laços",
          "Autoamor",
          "Perdão"
        ],
        physicalUses: [
          "Saúde cardíaca",
          "Sistema circulatório",
          "Fertilidade",
          "Clareza de pele"
        ],
        cleansing: ["água corrente suave", "smudging"],
        charging: ["luz lunar", "quartzo rosa"],
        zodiac: ["touro", "cancer"],
        description: "Cristal de cura cardíaca, comforta e fortalece o coração emocional."
      },
      {
        id: "cianito-azul",
        name: "Blue Kyanite",
        namePt: "Cianito Azul",
        formula: "Al2SiO5",
        hardness: "4.5-7",
        chakra: "throat",
        element: "water",
        planets: ["neptune", "mercury"],
        colors: ["blue", "indigo", "white"],
        properties: ["alignment", "channeling", "protection", "energy"],
        healingProperties: [
          "Alinhamento de corpos sutis",
          "Canalização de energia",
          "Proteção de campos",
          "Comunicação espiritual"
        ],
        spiritualUses: [
          "Alinhamento de chakras",
          "Canalização de mensagens",
          "Proteção durante meditação",
          "Conexão com realms superiores"
        ],
        emotionalUses: [
          "Clareza de pensamento",
          "Liberação de bloqueios",
          "Comunicação autêntica",
          "Harmonização emocional"
        ],
        physicalUses: [
          "Sistema nervoso",
          "Garganta",
          "Articulações",
          "Equilíbrio de fluidos"
        ],
        cleansing: ["não requer", "auto-limpa"],
        charging: ["luz lunar", "sem necessidade"],
        zodiac: ["peixes", "aquario"],
        description: "Cristal de alinhamento, não retém energia negativa e alinha campos sutis."
      },
      {
        id: "garneta",
        name: "Garnet",
        namePt: "Granada",
        formula: "Fe3Al2(SiO4)3",
        hardness: "6.5-7.5",
        chakra: "root",
        element: "fire",
        planets: ["mars", "sun"],
        colors: ["red", "brownish-red", "green"],
        properties: ["passion", "energy", "creativity", "commitment"],
        healingProperties: [
          "Estimulação de energia vital",
          "Promoção de paixão",
          "Aumento de criatividade",
          "Fortalecimento de compromissos"
        ],
        spiritualUses: [
          "Ativação da energia kundalini",
          "Fortalecimento de intentions",
          "Queima de bloqueios",
          "Conexão com energia terrena"
        ],
        emotionalUses: [
          "Estímulo de vitalidade",
          "Promoção de paixão de viver",
          "Fortalecimento de devoção",
          "Dissolução de inércia"
        ],
        physicalUses: [
          "Sistema circulatório",
          "Energia vital",
          "Articulações",
          "Coluna vertebral"
        ],
        cleansing: ["água corrente", "smudging"],
        charging: ["luz solar fraca", "quartzo claro"],
        zodiac: ["aries", "leao", "virgem"],
        description: "Cristal da paixão e propósito, desperta energia e compromisso."
      },
      {
        id: "azuurita",
        name: "Azurite",
        namePt: "Azurita",
        formula: "Cu3(CO3)2(OH)2",
        hardness: "3.5-4",
        chakra: "third-eye",
        element: "water",
        planets: ["jupiter"],
        colors: ["deep blue", "navy"],
        properties: ["insight", "wisdom", "intuition", "truth"],
        healingProperties: [
          "Despertar de insight profundo",
          "Promoção de sabedoria",
          "Clareza de percepção",
          "Comunhão com verdades superiores"
        ],
        spiritualUses: [
          "Desenvolvimento psychic avançado",
          "Conexão com sabedoria antiga",
          "Abertura de terceiro olho",
          "Canalização de conhecimento"
        ],
        emotionalUses: [
          "Revelação de verdades ocultas",
          "Liberação de crenças limitantes",
          "Clareza emocional",
          "Descoberta de padrões inconscientes"
        ],
        physicalUses: [
          "Sistema nervoso",
          "Clareza mental",
          "Articulações",
          "Alívio de enxaquecas"
        ],
        cleansing: ["smudging", "canto"],
        charging: ["luz lunar cheia", "quartzo claro"],
        zodiac: ["sagitario"],
        description: "Cristal da sabedoria superior, abre portais para conhecimento profundo."
      },
      {
        id: "malaquita",
        name: "Malachite",
        namePt: "Malaquita",
        formula: "Cu2CO3(OH)2",
        hardness: "3.5-4",
        chakra: "heart",
        element: "earth",
        planets: ["venus", "earth"],
        colors: ["green", "banded green", "light to dark"],
        properties: ["transformation", "protection", "heart-healing", "abundance"],
        healingProperties: [
          "Transformação de energias negativas",
          "Cura profunda do coração",
          "Proteção energetica",
          "Atração de abundância"
        ],
        spiritualUses: [
          "Transformação espiritual",
          "Proteção durante mudança",
          "Conexão com natureza",
          "Desenvolvimento de habilidades psychic"
        ],
        emotionalUses: [
          "Cura de traumas profundos",
          "Liberação de padrões viciantes",
          "Transformação de medo em coragem",
          "Restauração de confiança"
        ],
        physicalUses: [
          "Sistema imunológico",
          "Clareza de pulmões",
          "Articulações",
          "Desintoxicação"
        ],
        cleansing: ["terra", "smudging suave"],
        charging: ["quartzo claro", "quartzo rosa"],
        zodiac: ["touro", "escorpiao"],
        description: "Pedra de transformação, absorve negatividade e cura feridas profundas."
      },
      {
        id: "pedra-lua",
        name: "Moonstone",
        namePt: "Pedra da Lua",
        formula: "NaAlSi3O8 - KAlSi3O8",
        hardness: "6-6.5",
        chakra: "crown",
        element: "water",
        planets: ["moon"],
        colors: ["white", "gray", "rainbow sheen"],
        properties: ["intuition", "femininity", "emotional", "cyclic"],
        healingProperties: [
          "Harmonização de ciclos femininos",
          "Promoção de intuição",
          "Calma emocional",
          "Conexão com energia lunar"
        ],
        spiritualUses: [
          "Trabalho com energia lunar",
          "Desenvolvimento psychic",
          "Conexão com deusa",
          "Meditação sob a lua"
        ],
        emotionalUses: [
          "Cura emocional lunar",
          "Promoção de sensibilidade",
          "Harmonização de emoções",
          "Liberação de água emocional"
        ],
        physicalUses: [
          "Sistema hormonal",
          "Fertilidade",
          "Clareza de pele",
          "Harmonização de fluidos"
        ],
        cleansing: ["água corrente", "luz lunar"],
        charging: ["luz lunar cheia", "quartzo rosa"],
        zodiac: ["cancer", "libra", "peixes"],
        description: "Pedra da deusa, conecta com ciclos lunares e energia feminina."
      }
    ],
    crystalSystems: [
      {
        id: "cubic",
        name: "Cubic",
        namePt: "Cúbico",
        description: "Sistema de cristalização com três eixos iguais e perpendiculares"
      },
      {
        id: "hexagonal",
        name: "Hexagonal",
        namePt: "Hexagonal",
        description: "Sistema com quatro eixos, três iguais no mesmo plano"
      },
      {
        id: "monoclinic",
        name: "Monoclinic",
        namePt: "Monoclínico",
        description: "Sistema com três eixos desiguais, dois ângulos oblíquos"
      },
      {
        id: "orthorhombic",
        name: "Orthorhombic",
        namePt: "Ortorrombico",
        description: "Sistema com três eixos desiguais perpendiculares"
      },
      {
        id: "tetragonal",
        name: "Tetragonal",
        namePt: "Tetragonal",
        description: "Sistema com dois eixos iguais, um diferente"
      },
      {
        id: "trigonal",
        name: "Trigonal",
        namePt: "Trigonal",
        description: "Sistema com três eixos iguais em ângulos não retos"
      },
      {
        id: "triclinic",
        name: "Triclinic",
        namePt: "Triclínico",
        description: "Sistema com três eixos desiguais e oblíquos"
      }
    ]
  };
}