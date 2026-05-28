/**
 * Sacred Water data module
 * Provides sacred water properties and healing data for the Cabala dos Caminhos system
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface SacredWater {
  id: string;
  name: string;
  namePt: string;
  type: string;
  element: string;
  planets: string[];
  chakras: string[];
  properties: string[];
  healingProperties: string[];
  spiritualUses: string[];
  emotionalUses: string[];
  physicalUses: string[];
  purification: string[];
  blessing: string[];
  zodiac: string[];
  description: string;
}

export interface WaterRitual {
  id: string;
  name: string;
  namePt: string;
  purpose: string;
  duration: string;
  steps: string[];
  waterTypes: string[];
}

export function getData(): {
  sacredWaters: SacredWater[];
  waterRituals: WaterRitual[];
} {
  return {
    sacredWaters: [
      {
        id: "agua-sagrada-igrega",
        name: "Holy Water",
        namePt: "Água Sagrada de Igreja",
        type: "blessed",
        element: "water",
        planets: ["moon", "neptune"],
        chakras: ["sacral", "third-eye", "crown"],
        properties: ["purification", "protection", "blessing", "clarity"],
        healingProperties: [
          "Purificação de ambientes e pessoas",
          "Proteção contra energias negativas",
          "Limpeza de blokios astrais",
          "Renovação energética"
        ],
        spiritualUses: [
          "Abençoar espaços",
          "Proteção de altares",
          "Rituais de purificação",
          "Consagração de objetos"
        ],
        emotionalUses: [
          "Liberação de traumas",
          "Purificação emocional",
          "Renovação da esperança",
          "Perdão"
        ],
        physicalUses: [
          "Asperção para proteção",
          "Purificação do campo áurico",
          "Limpza de resíduos negativos",
          "Harmonização do ambiente"
        ],
        purification: ["bênção", "intenção", "sagrada"],
        blessing: ["paz", "luz", "proteção"],
        zodiac: ["cancer", "pisces", "scorpio"],
        description: "Água benta por ritual religioso, usada para proteção e purificação em rituais sagrados."
      },
      {
        id: "agua-mar",
        name: "Sea Water",
        namePt: "Água do Mar",
        type: "natural",
        element: "water",
        planets: ["moon", "neptune", "jupiter"],
        chakras: ["sacral", "solar-plexus"],
        properties: ["purification", "emotional", "cleansing", "abundance"],
        healingProperties: [
          "Limpeza emocional profunda",
          "Harmonização com o mar",
          "Liberação de padrões",
          "Abundância"
        ],
        spiritualUses: [
          "Rituais de limpeza",
          "Conexão com a Lua",
          "Abundância e prosperidade",
          "Liberação de debts kármicas"
        ],
        emotionalUses: [
          "Dissolução de mágoas",
          "Liberação emocional",
          "Aceitação",
          "Fluidez nos sentimentos"
        ],
        physicalUses: [
          "Banhos purificadores",
          "Limpza de ambientes",
          "Harmonização solar",
          "Desintoxicação"
        ],
        purification: ["sol", "lua", "maré"],
        blessing: ["abundância", "liberação", "fluidez"],
        zodiac: ["cancer", "pisces", "scorpio"],
        description: "Água coletada do mar, carregada com a energia dos oceanos e a força purificadora da Lua."
      },
      {
        id: "agua-chuva",
        name: "Rain Water",
        namePt: "Água de Chuva",
        type: "natural",
        element: "water",
        planets: ["moon", "mercury"],
        chakras: ["sacral", "heart"],
        properties: ["purification", "renewal", "growth", "transformation"],
        healingProperties: [
          "Renovação celular",
          "Purificação interna",
          "Liberação de toxinas",
          "Crescimento espiritual"
        ],
        spiritualUses: [
          "Rituais de transformação",
          "Novos começos",
          "Purificação do EU Superior",
          "Renovação de votos"
        ],
        emotionalUses: [
          "Renovação da esperança",
          "Liberação do passado",
          "Recomeço emocional",
          "Purificação de mágoas"
        ],
        physicalUses: [
          "Banhos de renovação",
          "Limpza de campo físico",
          "Purificação interna",
          "Hidratação energética"
        ],
        purification: ["tempestade", "relâmpago", "terra"],
        blessing: ["renovação", "transformação", "crescimento"],
        zodiac: ["cancer", "aquarius"],
        description: "Água de chuva, captada durante tempestades, carregada com a energia transformadora do relâmpago."
      },
      {
        id: "agua-floral-rosa",
        name: "Rose Water",
        namePt: "Água Floral de Rosa",
        type: "floral",
        element: "water",
        planets: ["venus", "moon"],
        chakras: ["heart", "sacral"],
        properties: ["love", "beauty", "healing", "harmony"],
        healingProperties: [
          "Harmonização emocional",
          "Cura do coração ferido",
          "Autoamor",
          "Beleza interior"
        ],
        spiritualUses: [
          "Abençoar o coração",
          "Atrair amor",
          "Harmonizar relacionamentos",
          "Cura de feridas da alma"
        ],
        emotionalUses: [
          "Perdão",
          "Compaixão",
          "Aceitação",
          "Amor próprio"
        ],
        physicalUses: [
          "Hidratação da aura",
          "Harmonização energética",
          "Beleza e cuidados",
          "Suavização de emociones"
        ],
        purification: ["pétalas", "vapor", "luz lunar"],
        blessing: ["amor", "beleza", "harmonia"],
        zodiac: ["taurus", "libra"],
        description: "Água floral de rosa damascena, carregada com a energia do amor divino de Vênus."
      },
      {
        id: "agua-floral-lavanda",
        name: "Lavender Water",
        namePt: "Água Floral de Lavanda",
        type: "floral",
        element: "water",
        planets: ["mercury", "moon"],
        chakras: ["third-eye", "crown"],
        properties: ["calm", "clarity", "intuition", "peace"],
        healingProperties: [
          "Calma mental",
          "Clareza de pensamento",
          "Intuição aguçada",
          "Paz interior"
        ],
        spiritualUses: [
          "Meditação profunda",
          "Desenvolvimento da intuição",
          "Conexão espiritual",
          "Rituais de paz"
        ],
        emotionalUses: [
          "Redução da ansiedade",
          "Serenidade",
          "Equilíbrio emocional",
          "Liberação do estresse"
        ],
        physicalUses: [
          "Relaxamento profundo",
          "Harmonização do sono",
          "Alívio de tensões",
          "Purificação sutil"
        ],
        purification: ["pétalas", "vapor", "estrela"],
        blessing: ["paz", "calma", "clareza"],
        zodiac: ["virgo", "gemini"],
        description: "Água floral de lavanda, conhecida por suas propriedades calmantes e clareza mental."
      },
      {
        id: "agua-aurora",
        name: "Dawn Water",
        namePt: "Água da Aurora",
        type: "charged",
        element: "water",
        planets: ["sun", "venus"],
        chakras: ["heart", "solar-plexus", "crown"],
        properties: ["vitality", "hope", "renewal", "light"],
        healingProperties: [
          "Vitalidade",
          "Renovação matinal",
          "Esperança",
          "Energia solar"
        ],
        spiritualUses: [
          "Iniciação de projetos",
          "Rituais de luz",
          "Conexão com o Sol",
          "Novo ciclo"
        ],
        emotionalUses: [
          "Esperança renovada",
          "Motivação",
          "Confiança",
          "Alegria de viver"
        ],
        physicalUses: [
          "Energização matinal",
          "Ativação do corpo",
          "Harmonização solar",
          "Vitalidade"
        ],
        purification: ["luz solar", "orvalho", "aurora"],
        blessing: ["luz", "esperança", "vitalidade"],
        zodiac: ["leo", "aries", "sagittarius"],
        description: "Água coletada ao amanhecer, carregada com a energia revitalizante do primeiro Sol."
      },
      {
        id: "agua-lua",
        name: "Moon Water",
        namePt: "Água Lunar",
        type: "charged",
        element: "water",
        planets: ["moon", "neptune"],
        chakras: ["third-eye", "crown", "sacral"],
        properties: ["intuition", "feminine", "mystery", "wisdom"],
        healingProperties: [
          "Intuição aguçada",
          "Conexão lunar",
          "Sabedoria oculta",
          "Proteção noturna"
        ],
        spiritualUses: [
          "Rituais femininos",
          "Desenvolvimento psychic",
          "Meditação lunar",
          "Mistérios ocultos"
        ],
        emotionalUses: [
          "Sabedoria emocional",
          "Intuição",
          "Aceitação cíclica",
          "Sensibilidade"
        ],
        physicalUses: [
          "Hidratção noturna",
          "Harmonização lunar",
          "Proteção do sono",
          "Equilíbrio hormonal"
        ],
        purification: ["luz lunar", "noite", "estrela"],
        blessing: ["intuição", "sabedoria", "proteção"],
        zodiac: ["cancer", "pisces", "scorpio"],
        description: "Água carregada sob a luz da Lua cheia, absorvendo suas energias femininas e intuitivas."
      },
      {
        id: "agua-cristal",
        name: "Crystal Charged Water",
        namePt: "Água de Cristal",
        type: "charged",
        element: "water",
        planets: ["moon", "sun", "venus"],
        chakras: ["all"],
        properties: ["amplification", "clarity", "balance", "harmony"],
        healingProperties: [
          "Amplificação de intenções",
          "Clareza total",
          "Equilíbrio universal",
          "Harmonia multidimensional"
        ],
        spiritualUses: [
          "Programação de intenções",
          "Ativação de cristais",
          "Rituais de cura",
          "Conexão cósmica"
        ],
        emotionalUses: [
          "Clareza emocional",
          "Equilíbrio",
          "Harmonização",
          "Liberação de blokios"
        ],
        physicalUses: [
          "Hidratação energética",
          "Cura sutil",
          "Amplificação de tratamentos",
          "Harmonização celular"
        ],
        purification: ["cristal", "som", "luz"],
        blessing: ["amplificação", "clareza", "harmonia"],
        zodiac: ["all"],
        description: "Água programada com cristais, amplificando qualquer intenção阳性 com clareza e harmonia."
      },
      {
        id: "agua-sagrada-cabala",
        name: "Kabbalah Sacred Water",
        namePt: "Água Sagrada da Cabala",
        type: "ritual",
        element: "water",
        planets: ["moon", "jupiter", "mercury"],
        chakras: ["all", "tree-of-life"],
        properties: ["sacred", "divine", "transformation", "ascension"],
        healingProperties: [
          "Transformação espiritual",
          "Ascensão",
          "Iluminação",
          "Conexão divina"
        ],
        spiritualUses: [
          "Rituais cabalísticos",
          "Caminho da Árvore",
          "Ascensão",
          "Liberação kármica"
        ],
        emotionalUses: [
          "Transformação profunda",
          "Liberação de padrões",
          "Purificação emocional",
          "Renovação da alma"
        ],
        physicalUses: [
          "Purificação completa",
          "Rituais de iniciação",
          "Proteção divina",
          "Harmonização sagrada"
        ],
        purification: ["sagrado", "divino", "luz"],
        blessing: ["transformação", "ascensão", "divino"],
        zodiac: ["all"],
        description: "Água sagrada preparada segundo tradições cabalísticas, usada para rituais de transformação e ascensão."
      },
      {
        id: "agua-fonte",
        name: "Spring Water",
        namePt: "Água de Fonte",
        type: "natural",
        element: "water",
        planets: ["moon", "earth"],
        chakras: ["root", "sacral"],
        properties: ["grounding", "life", "purity", "rebirth"],
        healingProperties: [
          "Enraizamento",
          "Vida nova",
          "Pureza original",
          "Renascimento"
        ],
        spiritualUses: [
          "Rituais de novos começos",
          "Conexão com a Terra",
          "Purificação original",
          "Vida e morte"
        ],
        emotionalUses: [
          "Novos começos",
          "Enraizamento",
          "Pureza emocional",
          "Renascimento"
        ],
        physicalUses: [
          "Purificação física",
          "Enraizamento",
          "Limpza profunda",
          "Vitalidade da Terra"
        ],
        purification: ["terra", "rocha", "natureza"],
        blessing: ["vida", "pureza", "novos começos"],
        zodiac: ["taurus", "capricorn", "virgo"],
        description: "Água de fonte natural, carregada com a energia pura e vivificadora da Terra Mãe."
      }
    ],
    waterRituals: [
      {
        id: "banho-lua",
        name: "Moon Bath Ritual",
        namePt: "Ritual do Banho de Lua",
        purpose: "Purificação lunar e recarga feminina",
        duration: "45 minutos",
        steps: [
          "Prepare a água em temperatura morna",
          "Adicione água lunar carregada",
          "Procure 7 gotas de água floral de rosa",
          "Ligue incenso de sândalo",
          "Entre no banho visualizando a Lua",
          "Repita: 'Eu sou pura como a luz da Lua'",
          "Permaneça por 20 minutos em silêncio",
          "Enxágue com água corrente"
        ],
        waterTypes: ["agua-lua", "agua-floral-rosa"]
      },
      {
        id: "ritual-saude",
        name: "Health Ritual",
        namePt: "Ritual de Saúde",
        purpose: "Fortalecimento do sistema imunológico",
        duration: "30 minutos",
        steps: [
          "Esquente água da fonte",
          "Adicione sal marinho",
          "Procure 3 gotas de água de lavanda",
          "Visualize luz dourada na água",
          "Beba lentamente",
          "Repita: 'Minha saúde é divina'",
          "Descanse por 15 minutos"
        ],
        waterTypes: ["agua-fonte", "agua-floral-lavanda"]
      },
      {
        id: "ritual-amor",
        name: "Love Ritual",
        namePt: "Ritual de Amor",
        purpose: "Atração e harmonização do amor",
        duration: "40 minutos",
        steps: [
          "Prepare água de aurora",
          "Adicione pétalas de rosa",
          "Escreva intenções de amor em papel",
          "Coloque o papel na água",
          "Procure 5 gotas de água floral de rosa",
          "Visualize seu coração abrindo",
          "Repita mantras de amor",
          "Beba a água abençoada"
        ],
        waterTypes: ["agua-aurora", "agua-floral-rosa"]
      },
      {
        id: "ritual-protecao",
        name: "Protection Ritual",
        namePt: "Ritual de Proteção",
        purpose: "Proteção contra energias negativas",
        duration: "25 minutos",
        steps: [
          "Misture água sagrada com sal marinho",
          "Adicione água de cristal",
          "Purifique o ambiente com o preparado",
          "Procure a porta, janelas e cantos",
          "Visualize uma luz protetora",
          "Repita: 'Estou protegido pela luz divina'",
          "Descarte a água na terra"
        ],
        waterTypes: ["agua-sagrada-cabala", "agua-cristal", "agua-mar"]
      }
    ]
  };
}