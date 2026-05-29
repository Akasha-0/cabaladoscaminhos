// Ancestral Ritual data - Skip linting and formatting

export interface AncestralRitualStep {
  order: number;
  name: string;
  description: string;
  duration: string;
  offerings: string[];
  intention: string;
}

export interface AncestralRitualElement {
  name: string;
  type: string;
  significance: string;
  placement: string;
}

export interface AncestralRitualTiming {
  lunarPhase: string;
  timeOfDay: string;
  season: string;
  sacredDays: string[];
}

export interface AncestralRitualData {
  id: string;
  name: string;
  orixa: string[];
  category: string;
  purpose: string;
  energy: string;
  origin: string;
  steps: AncestralRitualStep[];
  elements: AncestralRitualElement[];
  timing: AncestralRitualTiming;
  sacredSpace: {
    setup: string[];
    offerings: string[];
    purification: string[];
  };
  contraindications: string[];
  blessings: string[];
}

const ANCESTRAL_RITUAL_DATA: AncestralRitualData[] = [
  {
    id: "ancestral-ebo",
    name: "Ebo Ancestral",
    orixa: ["All Orixás", "Ancestral Spirits"],
    category: "Ancestral",
    purpose: "Honoring and communicating with ancestors",
    energy: "Reverence",
    origin: "Yoruba Tradition",
    steps: [
      {
        order: 1,
        name: "Purification",
        description: "Cleanse the sacred space with prayers and sacred waters",
        duration: "15 minutes",
        offerings: ["Holy water", "Sacred herbs"],
        intention: "Remove negative influences"
      },
      {
        order: 2,
        name: "Invocation of Egun",
        description: "Call upon the ancestral spirits through drumbeats and chants",
        duration: "10 minutes",
        offerings: ["Palm wine", "Kolanuts"],
        intention: "Open communication with ancestors"
      },
      {
        order: 3,
        name: "Offering Presentation",
        description: "Present food, drinks, and symbolic items to the ancestors",
        duration: "20 minutes",
        offerings: ["Roasted foods", "Drinks", "White cloth", "Coins"],
        intention: "Feed and honor the ancestors"
      },
      {
        order: 4,
        name: "Prayer and Petition",
        description: "Speak to the ancestors, share concerns, ask for guidance",
        duration: "15 minutes",
        offerings: [],
        intention: "Seek wisdom and blessing"
      },
      {
        order: 5,
        name: "Response Interpretation",
        description: "Observe signs and omens from the ancestors",
        duration: "10 minutes",
        offerings: [],
        intention: "Receive ancestral guidance"
      },
      {
        order: 6,
        name: "Closing and Thanksgiving",
        description: "Thank the ancestors, close the ritual with blessings",
        duration: "10 minutes",
        offerings: [],
        intention: "Seal the blessing and depart in peace"
      }
    ],
    elements: [
      {
        name: "Ebo Stone",
        type: "Sacred",
        significance: "Resting place for offerings",
        placement: "Center of ritual space"
      },
      {
        name: "White Cloth",
        type: "Symbolic",
        significance: "Purity and respect",
        placement: "Under offerings"
      },
      {
        name: "Drum",
        type: "Communication",
        significance: "Calls the ancestors",
        placement: "Near the one performing ritual"
      },
      {
        name: "Kolanut",
        type: "Offering",
        significance: "Life and communion",
        placement: "On the ebo stone"
      }
    ],
    timing: {
      lunarPhase: "Full Moon",
      timeOfDay: "Night",
      season: "Dry Season",
      sacredDays: ["Friday", "Sunday", "New Moon"]
    },
    sacredSpace: {
      setup: ["Clean the area thoroughly", "Place white cloth on ground", "Set ebo stone in center", "Arrange offerings around stone"],
      offerings: ["Palm wine", "Roasted corn", "Kolanuts", "Coins", "White candles"],
      purification: ["Burn sacred herbs", "Sprinkle with holy water", "Recite protection prayers"]
    },
    contraindications: ["Do not perform during menstrual cycle", "Avoid during mourning period unless specifically for the deceased", "Requires prior preparation with ebo fluids"],
    blessings: ["Ancestral protection", "Wisdom and guidance", "Clarity in decision making", "Healing of family wounds"]
  },
  {
    id: "ancestral-iresi",
    name: "Iresi Oogun",
    orixa: ["Ogun", "Ancestral Warriors"],
    category: "Ancestral",
    purpose: "Seeking ancestral protection and strength",
    energy: "Warrior",
    origin: "Yoruba Tradition",
    steps: [
      {
        order: 1,
        name: "Opening the Gate",
        description: "Invoke Ogun and the ancestors to open the spiritual gate",
        duration: "10 minutes",
        offerings: ["Iron objects", "Palm wine", "Roasted fish"],
        intention: "Establish connection with warrior ancestors"
      },
      {
        order: 2,
        name: "Iron Feeding",
        description: "Offer iron objects and perform iron rituals",
        duration: "15 minutes",
        offerings: ["Iron tools", "Iron nails", "Iron chain"],
        intention: "Feed the warrior spirits"
      },
      {
        order: 3,
        name: "Warrior Invocation",
        description: "Call upon the ancestral warriors for strength and protection",
        duration: "10 minutes",
        offerings: [],
        intention: "Invoke warrior energy"
      },
      {
        order: 4,
        name: "Protection Mantra",
        description: "Recite protective mantras and bind the protection",
        duration: "15 minutes",
        offerings: [],
        intention: "Seal ancestral protection"
      }
    ],
    elements: [
      {
        name: "Iron Tools",
        type: "Sacred",
        significance: "Symbol of Ogun and warrior ancestors",
        placement: "Arranged in four corners"
      },
      {
        name: "Warrior Cloth",
        type: "Symbolic",
        significance: "Battle dress for ancestors",
        placement: "Over the iron offerings"
      }
    ],
    timing: {
      lunarPhase: "Dark Moon",
      timeOfDay: "Before Dawn",
      season: "Any Season",
      sacredDays: ["Tuesday", "Friday"]
    },
    sacredSpace: {
      setup: ["Place iron items in compass formation", "Create iron circle around practitioner"],
      offerings: ["Iron objects", "Roasted fish", "Palm wine", "Black cloth"],
      purification: ["Iron cleansing", "Iron water preparation", "Protective chants"]
    },
    contraindications: ["Not for those with iron allergies", "Requires iron shrine preparation"],
    blessings: ["Iron protection", "Ancestral warrior strength", "Victory over enemies", "Path clearing"]
  },
  {
    id: "ancestral-ipari",
    name: "Ipari Prayer",
    orixa: ["All Orixás", "Obatala", "Ancestors"],
    category: "Ancestral",
    purpose: "General prayer to ancestors and orixás for blessings",
    energy: "Blessing",
    origin: "Yoruba Tradition",
    steps: [
      {
        order: 1,
        name: "Preparation",
        description: "Clean yourself and prepare the prayer space",
        duration: "10 minutes",
        offerings: ["Clean water", "White cloth"],
        intention: "Purify body and space"
      },
      {
        order: 2,
        name: "Saying the Names",
        description: "Recite the names of your personal ancestors",
        duration: "15 minutes",
        offerings: ["Kolanuts", "Palm wine"],
        intention: "Call your ancestors specifically"
      },
      {
        order: 3,
        name: "Ipari Invocation",
        description: "Speak the great ipari prayers",
        duration: "20 minutes",
        offerings: [],
        intention: "Invoke universal blessing"
      },
      {
        order: 4,
        name: "Personal Petition",
        description: "Speak your personal needs and desires",
        duration: "10 minutes",
        offerings: [],
        intention: "Present your request"
      },
      {
        order: 5,
        name: "Sealing",
        description: "Close with thanksgiving and seal the blessing",
        duration: "5 minutes",
        offerings: [],
        intention: "Seal the prayer"
      }
    ],
    elements: [
      {
        name: "Prayer Mat",
        type: "Sacred",
        significance: "Place of prayer and kneeling",
        placement: "Clean floor area"
      },
      {
        name: "Kolanut Bowl",
        type: "Communication",
        significance: "Medium of connection",
        placement: "Before the one praying"
      }
    ],
    timing: {
      lunarPhase: "Any Phase",
      timeOfDay: "Dawn or Dusk",
      season: "Any Season",
      sacredDays: ["Every day", "Sundays", "Holy Days"]
    },
    sacredSpace: {
      setup: ["Clean floor space", "Place mat for kneeling", "Arrange kolanuts"],
      offerings: ["Kolanuts", "Palm wine", "Water", "White candles"],
      purification: ["Bath before prayer", "Clean clothing", "Pure intention"]
    },
    contraindications: ["None - daily practice"],
    blessings: ["Daily blessing", "Ancestral attention", "Divine protection", "Guidance"]
  },
  {
    id: "ancestral-adimu",
    name: "Adimu Sacrifice",
    orixa: ["Eshu", "Ancestors"],
    category: "Ancestral",
    purpose: "Major sacrifice for serious ancestral matters",
    energy: "Sacrifice",
    origin: "Yoruba Tradition",
    steps: [
      {
        order: 1,
        name: "Divination First",
        description: "Consult Ifá oracle to determine necessity and method",
        duration: "30 minutes",
        offerings: ["Opele chain", "Ikin nuts"],
        intention: "Confirm the need for sacrifice"
      },
      {
        order: 2,
        name: "Selection of Victim",
        description: "Based on divination, select the appropriate offering",
        duration: "15 minutes",
        offerings: [],
        intention: "Choose the right sacrifice"
      },
      {
        order: 3,
        name: "Offering Preparation",
        description: "Prepare the sacrifice with sacred rituals and prayers",
        duration: "30 minutes",
        offerings: ["Selected animal", "Food items", "Drinks"],
        intention: "Sanctify the offering"
      },
      {
        order: 4,
        name: "The Sacrifice",
        description: "Perform the offering with proper prayers and cuts",
        duration: "20 minutes",
        offerings: [],
        intention: "Complete the sacrifice"
      },
      {
        order: 5,
        name: "Distribution",
        description: "Distribute portions to ancestors, orixás, and participants",
        duration: "30 minutes",
        offerings: [],
        intention: "Share the blessing"
      },
      {
        order: 6,
        name: "Consumption",
        description: "Eat the sacrificial meat with prayers",
        duration: "30 minutes",
        offerings: [],
        intention: "Internalize the blessing"
      }
    ],
    elements: [
      {
        name: "Axe or Knife",
        type: "Sacred",
        significance: "Tool of sacrifice, must be iron",
        placement: "With the sacrifice"
      },
      {
        name: "Blood Bowl",
        type: "Receptacle",
        significance: "Collects the blood for the ancestors",
        placement: "Below the sacrifice"
      },
      {
        name: "Fire",
        type: "Purification",
        significance: "Burns offerings and purifies",
        placement: "Sacred fire pit"
      }
    ],
    timing: {
      lunarPhase: "Consult Ifá",
      timeOfDay: "Consult Ifá",
      season: "Consult Ifá",
      sacredDays: ["Determined by divination"]
    },
    sacredSpace: {
      setup: ["Slaughter ground prepared", "Fire pit lit", "Blood bowls ready", "Distribution area arranged"],
      offerings: ["Animal sacrifice", "Food", "Palm wine", "Kolanuts"],
      purification: ["Priest purification", "Slaughter ground cleansing", "Prayer preparation"]
    },
    contraindications: ["Only with proper initiation", "Requires divination first", "Not for minor issues", "Expensive and serious"],
    blessings: ["Resolution of major problems", "Ancestral favor", "Removal of severe blockages", "Restoration of balance"]
  }
];

export function getData(): AncestralRitualData[] {
  return ANCESTRAL_RITUAL_DATA;
}

export function getDataById(id: string): AncestralRitualData | undefined {
  return ANCESTRAL_RITUAL_DATA.find((r) => r.id === id);
}

export function searchData(query: string): AncestralRitualData[] {
  const lowerQuery = query.toLowerCase();
  return ANCESTRAL_RITUAL_DATA.filter((r) =>
    r.name.toLowerCase().includes(lowerQuery) ||
    r.purpose.toLowerCase().includes(lowerQuery) ||
    r.category.toLowerCase().includes(lowerQuery) ||
    r.orixa.some(o => o.toLowerCase().includes(lowerQuery)) ||
    r.energy.toLowerCase().includes(lowerQuery)
  );
}

export function getRitualsByCategory(category: string): AncestralRitualData[] {
  return ANCESTRAL_RITUAL_DATA.filter((r) => r.category === category);
}

export function getRitualsByOrixa(orixa: string): AncestralRitualData[] {
  return ANCESTRAL_RITUAL_DATA.filter((r) =>
    r.orixa.some(o => o.toLowerCase().includes(orixa.toLowerCase()))
  );
}

export function getRitualsByEnergy(energy: string): AncestralRitualData[] {
  return ANCESTRAL_RITUAL_DATA.filter((r) => r.energy.toLowerCase() === energy.toLowerCase());
}

export function getRitualsByPurpose(purpose: string): AncestralRitualData[] {
  return ANCESTRAL_RITUAL_DATA.filter((r) =>
    r.purpose.toLowerCase().includes(purpose.toLowerCase())
  );
}

export function getRitualCategories(): string[] {
  const categories = new Set(ANCESTRAL_RITUAL_DATA.map((r) => r.category));
  return Array.from(categories);
}

export function getAllEnergies(): string[] {
  const energies = new Set(ANCESTRAL_RITUAL_DATA.map((r) => r.energy));
  return Array.from(energies);
}