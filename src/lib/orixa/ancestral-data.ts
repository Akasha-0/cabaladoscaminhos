// Ancestral data - Skip linting and formatting

export interface AncestralData {
  name: string;
  origin: string;
  lineage: string[];
  principles: string[];
  practices: string[];
  sacredTexts: string[];
  wisdomDomains: string[];
  initiatoryDegrees: string[];
  protocols: {
    communication: string[];
    offerings: string[];
   禁忌: string[];
  };
  symbols: string[];
  numbers: number[];
  colors: string[];
  directions: string[];
  seasonalCycles: {
    solstices: string[];
    equinoxes: string[];
    sacredMonths: string[];
  };
  transmission: {
    oral: string[];
    ritual: string[];
    written: string[];
  };
}

export function getData(): AncestralData {
  return {
    name: "Ancestral",
    origin: "Oral Tradition",
    lineage: [
      "Aboriginal Root Systems",
      "Ancient Mystery Schools",
      "Indigenous Lineages",
      "Sacred Blood Lines",
      "Spiritual Ancestors",
    ],
    principles: [
      "Connection to the Divine Source",
      "Honor and reverence for elders",
      "Oral transmission of sacred knowledge",
      "Living relationship with nature",
      "Cyclical understanding of time",
      "Interconnectedness of all life",
      "Respect for the unseen world",
      "Wisdom through experience",
    ],
    practices: [
      "Ancestor veneration and communication",
      "Ritual offerings and sacrifices",
      "Divination and oracle work",
      "Sacred dance and drumming",
      "Chant and invocation",
      "Meditation and trance states",
      "Healing ceremonies",
      "Initiation rites",
      "Seasonal celebrations",
    ],
    sacredTexts: [
      "Book of the Dead",
      "Emerald Tablets",
      "Kybalion",
      "Vedic Scriptures",
      "Mayan Codices",
      "Egyptian Book of Coming Forth by Day",
      "Kemetian Texts",
      "Yoruba Ifá Corpus",
    ],
    wisdomDomains: [
      "Divination and prophecy",
      "Herbal medicine and healing",
      "Astronomy and calendar",
      "Sacred geometry",
      "Alchemy and transmutation",
      "Energy work and mysticism",
      "Death and rebirth mysteries",
      "Initiation and transformation",
    ],
    initiatoryDegrees: [
      "Seeker - Initial inquiry and dedication",
      "Initiate - First mysteries revealed",
      "Adept - Working knowledge of arts",
      "Hierophant - Teacher and guide",
      "Master - Complete mastery of path",
      "Elder - Guardian of tradition",
      "Scribe - Record keeper of wisdom",
      "Oracle - Voice of the ancestors",
    ],
    protocols: {
      communication: [
        "Approach with humility and respect",
        "Use proper titles and forms of address",
        "Offer preliminary gifts before asking",
        "Listen more than speak",
        "Accept guidance without argument",
        "Maintain silence about sacred matters",
      ],
      offerings: [
        "First fruits of harvest",
        "Pure water and salt",
        "Sacred herbs and incense",
        "Candles lit at specific hours",
        "Food offerings shared in ritual",
        "Blood and life force in extreme rites",
        "Songs and prayers of gratitude",
      ],
      禁忌: [
        "Never speak ill of the dead",
        "Do not reveal sacred names publicly",
        "Avoid eating before ritual work",
        "Never approach without proper preparation",
        "Do not mix lineages without permission",
        "Never deny a legitimate seeker",
        "Avoid revealing initiation secrets",
      ],
    },
    symbols: [
      "Ankh - Life and breath",
      "Eye of Horus - Protection and healing",
      "Caduceus - Balance and transformation",
      "Tree of Life - Connection to all",
      "Spiral - Evolution and cycles",
      "Triple Moon - Waxing, full, waning",
      "Pentagram - Elements and spirit",
      "Triple Spiral - Three worlds",
      "Eye of Providence - Divine watch",
      "Ouroboros - Eternal return",
    ],
    numbers: [3, 7, 12, 13, 21, 33, 40, 50, 100, 108, 360],
    colors: ["Gold", "Indigo", "Deep Purple", "Black", "White", "Silver"],
    directions: [
      "East - New dawn and beginnings",
      "South - Growth and expansion",
      "West - Completion and release",
      "North - Wisdom and stillness",
      "Center - Source and balance",
      "Above - Heaven and spirit",
      "Below - Earth and grounding",
    ],
    seasonalCycles: {
      solstices: [
        "Yule/Winter Solstice - Rebirth of the Sun",
        "Litha/Summer Solstice - Peak of light",
      ],
      equinoxes: [
        "Ostara/Spring Equinox - Balance and renewal",
        "Mabon/Autumn Equinox - Harvest and gratitude",
      ],
      sacredMonths: [
        "January - New cycles",
        "April - Rebirth",
        "July - Peak energy",
        "October - Reflection",
      ],
    },
    transmission: {
      oral: [
        "Storytelling and genealogy",
        "Chant and sacred songs",
        "Ritual speech and prayer",
        "Wisdom sayings and proverbs",
        "Teachings through example",
        "Dialogue and questioning",
      ],
      ritual: [
        "Initiation ceremonies",
        "Seasonal celebrations",
        "Healing rituals",
        "Divination sessions",
        "Offerings and sacrifices",
        "Meditation and trance",
        "Dance and possession",
      ],
      written: [
        "Sacred texts and scrolls",
        "Ritual calendars",
        "Symbolic diagrams",
        "Commentaries and interpretations",
        "Grimoires and manuals",
        "Personal journals of practice",
        "Transcriptions of oral teachings",
      ],
    },
  };
}