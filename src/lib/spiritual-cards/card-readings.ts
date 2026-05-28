/**
 * Card readings — spiritual guidance through various divination systems
 */

export interface CardReading {
  id: string;
  name: string;
  type: ReadingType;
  description: string;
  cards: number;
  positions: ReadingPosition[];
  guidance: ReadingGuidance;
  themes: string[];
}

export type ReadingType =
  | "single"
  | "three-card"
  | "celtic-cross"
  | "horseshoe"
  | "pathfinding"
  | "full-deck"
  | "seasonal"
  | "moon"
  | " affirmation"
  | "compatibility";

export interface ReadingPosition {
  name: string;
  position: number;
  description: string;
  reversed?: boolean;
}

export interface ReadingGuidance {
  focus: string;
  duration: string;
  bestFor: string[];
  tips: string[];
}

/**
 * Card reading spreads for spiritual guidance
 */
const CARD_READINGS: CardReading[] = [
  {
    id: "single-draw",
    name: "Single Card Draw",
    type: "single",
    description: "A focused moment of guidance for an immediate question or daily insight",
    cards: 1,
    positions: [
      {
        name: "The Card",
        position: 1,
        description: "Your answer, insight, or guidance for this moment",
      },
    ],
    guidance: {
      focus: "Quick clarity and immediate guidance",
      duration: "5-10 minutes",
      bestFor: ["Daily check-ins", "Quick questions", "Affirmation of the day"],
      tips: [
        "Center yourself before drawing",
        "Focus on your question while shuffling",
        "Trust your first instinct",
      ],
    },
    themes: ["clarity", "guidance", "daily", "quick"],
  },
  {
    id: "past-present-future",
    name: "Past, Present & Future",
    type: "three-card",
    description: "A three-card spread revealing the flow of time and how events connect",
    cards: 3,
    positions: [
      {
        name: "Past",
        position: 1,
        description: "The foundation — past influences and lessons shaping the situation",
      },
      {
        name: "Present",
        position: 2,
        description: "Current energies and what is actively unfolding now",
      },
      {
        name: "Future",
        position: 3,
        description: "Potential outcomes and the direction things are heading",
      },
    ],
    guidance: {
      focus: "Temporal flow and understanding",
      duration: "10-15 minutes",
      bestFor: ["Understanding situations", "Relationship insights", "Decision clarity"],
      tips: [
        "Consider how past events create present circumstances",
        "Notice connections between the cards",
        "The future card shows potential, not destiny",
      ],
    },
    themes: ["time", "understanding", "flow", "relationships"],
  },
  {
    id: "mind-body-soul",
    name: "Mind, Body & Soul",
    type: "three-card",
    description: "A holistic three-card spread addressing all aspects of being",
    cards: 3,
    positions: [
      {
        name: "Mind",
        position: 1,
        description: "Mental state, thoughts, and intellectual considerations",
      },
      {
        name: "Body",
        position: 2,
        description: "Physical sensations, material reality, and practical matters",
      },
      {
        name: "Soul",
        position: 3,
        description: "Spiritual needs, inner wisdom, and higher guidance",
      },
    ],
    guidance: {
      focus: "Holistic balance and integration",
      duration: "10-15 minutes",
      bestFor: ["Wellness check-ins", "Balance assessment", "Inner work"],
      tips: [
        "All three aspects need attention for wholeness",
        "Notice where energy is heavy or light",
        "Integration happens when all three are aligned",
      ],
    },
    themes: ["wellness", "holistic", "balance", "integration"],
  },
  {
    id: "celtic-cross",
    name: "Celtic Cross",
    type: "celtic-cross",
    description: "The traditional ten-card spread for deep, comprehensive analysis",
    cards: 10,
    positions: [
      {
        name: "The Present",
        position: 1,
        description: "The current central issue or situation",
      },
      {
        name: "The Challenge",
        position: 2,
        description: "Obstacles or opposing forces at play",
      },
      {
        name: "The Foundation",
        position: 3,
        description: "Past influences and underlying motivations",
      },
      {
        name: "The Past",
        position: 4,
        description: "Recent events or what is being left behind",
      },
      {
        name: "The Crown",
        position: 5,
        description: "Conscious hopes, wishes, and aspirations",
      },
      {
        name: "The Future",
        position: 6,
        description: "Near-term outcome or what is approaching",
      },
      {
        name: "The Self",
        position: 7,
        description: "Your inner truth and how you see the situation",
      },
      {
        name: "The Environment",
        position: 8,
        description: "External factors and others' influence",
      },
      {
        name: "Hopes & Fears",
        position: 9,
        description: "What you desire and what you secretly fear",
      },
      {
        name: "The Outcome",
        position: 10,
        description: "The final resolution or spiritual lesson",
      },
    ],
    guidance: {
      focus: "Comprehensive situational analysis",
      duration: "20-30 minutes",
      bestFor: ["Major decisions", "Complex situations", "Deep self-reflection"],
      tips: [
        "Read positions 1-6 as the core story",
        "Positions 7-10 add layers of meaning",
        "Look for patterns and contrasts between cards",
      ],
    },
    themes: ["comprehensive", "deep", "traditional", "analysis"],
  },
  {
    id: "horseshoe",
    name: "Horseshoe Spread",
    type: "horseshoe",
    description: "A flowing seven-card spread showing how situations develop",
    cards: 7,
    positions: [
      {
        name: "Past",
        position: 1,
        description: "The situation's origins and how it began",
      },
      {
        name: "Present",
        position: 2,
        description: "Current state of affairs",
      },
      {
        name: "Hidden Influences",
        position: 3,
        description: "Unknown factors affecting the situation",
      },
      {
        name: "Obstacles",
        position: 4,
        description: "What stands in the way or blocks progress",
      },
      {
        name: "Foundation",
        position: 5,
        description: "The underlying values and beliefs at stake",
      },
      {
        name: "Past Influences",
        position: 6,
        description: "What is being carried forward from before",
      },
      {
        name: "Possible Future",
        position: 7,
        description: "Where things may lead if nothing changes",
      },
    ],
    guidance: {
      focus: "Situational flow and development",
      duration: "15-20 minutes",
      bestFor: ["Relationship dynamics", "Project analysis", "Cause and effect"],
      tips: [
        "Follow the horseshoe shape in interpretation",
        "Card 3 (hidden) often reveals the key",
        "The future card assumes current trajectory",
      ],
    },
    themes: ["development", "flow", "relationships", "dynamics"],
  },
  {
    id: "pathfinding",
    name: "Pathfinding Spread",
    type: "pathfinding",
    description: "A guidance spread for finding direction and making choices",
    cards: 5,
    positions: [
      {
        name: "Your Question",
        position: 1,
        description: "The core issue or decision you face",
      },
      {
        name: "Path A",
        position: 2,
        description: "The first possible direction or choice",
      },
      {
        name: "Path B",
        position: 3,
        description: "The second possible direction or choice",
      },
      {
        name: "Hidden Factor",
        position: 4,
        description: "Something you may not be considering",
      },
      {
        name: "Guidance",
        position: 5,
        description: "Spiritual advice for moving forward",
      },
    ],
    guidance: {
      focus: "Decision-making and direction",
      duration: "10-15 minutes",
      bestFor: ["Choices", "Career decisions", "Life transitions"],
      tips: [
        "Compare paths A and B objectively",
        "The hidden factor often reframes the question",
        "Let the guidance card inform your final choice",
      ],
    },
    themes: ["decision", "direction", "choice", "guidance"],
  },
  {
    id: "seasonal-reading",
    name: "Seasonal Reading",
    type: "seasonal",
    description: "A quarterly spread aligned with the wheel of the year",
    cards: 4,
    positions: [
      {
        name: "Season Theme",
        position: 1,
        description: "The spiritual lesson or focus for this season",
      },
      {
        name: "Challenge",
        position: 2,
        description: "What to work through during this period",
      },
      {
        name: "Opportunity",
        position: 3,
        description: "What doors may open or blessings may come",
      },
      {
        name: "Integration",
        position: 4,
        description: "How to embody the season's wisdom",
      },
    ],
    guidance: {
      focus: "Seasonal spiritual alignment",
      duration: "10-15 minutes",
      bestFor: ["New seasons", "Quarterly planning", "Ritual work"],
      tips: [
        "Best performed at solstices and equinoxes",
        "Consider the current seasonal energy",
        "Return to this reading throughout the season",
      ],
    },
    themes: ["seasonal", "cycles", "planning", "integration"],
  },
  {
    id: "moon-reading",
    name: "Moon Phase Reading",
    type: "moon",
    description: "A lunar-aligned reading for intuitive guidance",
    cards: 3,
    positions: [
      {
        name: "Moon Energy",
        position: 1,
        description: "The current lunar phase's influence on you",
      },
      {
        name: "Hidden Truth",
        position: 2,
        description: "What the subconscious wants you to know",
      },
      {
        name: "Intention",
        position: 3,
        description: "What to set as your lunar intention",
      },
    ],
    guidance: {
      focus: "Lunar cycles and intuition",
      duration: "10-15 minutes",
      bestFor: ["New moons", "Full moons", "Intuitive work"],
      tips: [
        "Best done during significant moon phases",
        "Work in a space with moonlight if possible",
        "Record your intentions for the lunar cycle",
      ],
    },
    themes: ["moon", "intuition", "lunar", "cycles"],
  },
  {
    id: "affirmation-spread",
    name: "Affirmation Spread",
    type: " affirmation",
    description: "A positive spread for manifesting and affirmations",
    cards: 4,
    positions: [
      {
        name: "Current State",
        position: 1,
        description: "Where you are now in this area of life",
      },
      {
        name: "Desired Reality",
        position: 2,
        description: "What you are calling in and manifesting",
      },
      {
        name: "Hidden Block",
        position: 3,
        description: "Old patterns or beliefs to release",
      },
      {
        name: "Your Affirmation",
        position: 4,
        description: "The affirmation that will support your journey",
      },
    ],
    guidance: {
      focus: "Manifestation and positive affirmation",
      duration: "10-15 minutes",
      bestFor: ["Manifestation work", "New intentions", "Releasing blocks"],
      tips: [
        "Create a daily affirmation from position 4",
        "Return the blocking card to the deck with gratitude",
        "Use present tense when stating your affirmation",
      ],
    },
    themes: ["manifestation", "affirmation", "positive", "intention"],
  },
  {
    id: "compatibility-spread",
    name: "Compatibility Reading",
    type: "compatibility",
    description: "A two-person spread for relationship insights",
    cards: 6,
    positions: [
      {
        name: "Your Energy",
        position: 1,
        description: "Your approach and what you bring to the relationship",
      },
      {
        name: "Their Energy",
        position: 2,
        description: "Their approach and what they bring",
      },
      {
        name: "Shared Ground",
        position: 3,
        description: "Where your energies naturally harmonize",
      },
      {
        name: "Growing Edge",
        position: 4,
        description: "Where growth and challenge exist",
      },
      {
        name: "This Connection",
        position: 5,
        description: "The unique energy created between you",
      },
      {
        name: "Guidance",
        position: 6,
        description: "Advice for nurturing this relationship",
      },
    ],
    guidance: {
      focus: "Relationship dynamics and harmony",
      duration: "15-20 minutes",
      bestFor: ["Romantic partnerships", "Friendships", "Professional relationships"],
      tips: [
        "Can be done for one person reading about another",
        "Focus on understanding, not judgment",
        "All relationships have areas for growth",
      ],
    },
    themes: ["relationship", "compatibility", "connection", "harmony"],
  },
  {
    id: "full-deck-reading",
    name: "Full Deck Journey",
    type: "full-deck",
    description: "A journey through all cards for profound self-discovery",
    cards: 78,
    positions: [
      {
        name: "Beginning",
        position: 1,
        description: "Where your journey starts — your current state",
      },
      {
        name: "The Fool's Step",
        position: 2,
        description: "The leap of faith or new beginning",
      },
      {
        name: "Challenge",
        position: 3,
        description: "The obstacle or test on your path",
      },
      {
        name: "Inner Work",
        position: 4,
        description: "The shadow or inner landscape to explore",
      },
      {
        name: "Gifts",
        position: 5,
        description: "Your strengths and what you bring",
      },
      {
        name: "Surrender",
        position: 6,
        description: "What needs to be released or let go",
      },
      {
        name: "Integration",
        position: 7,
        description: "What you are becoming through this process",
      },
    ],
    guidance: {
      focus: "Deep transformation and self-discovery",
      duration: "45-60 minutes",
      bestFor: ["Major life transitions", "Yearly review", "Spiritual milestones"],
      tips: [
        "Create a calm, sacred space",
        "Journal about each card that speaks to you",
        "Look for the story that emerges",
      ],
    },
    themes: ["transformation", "journey", "deep", "milestone"],
  },
];

/**
 * Get all card readings
 */
export function getReadings(): CardReading[] {
  return CARD_READINGS;
}

/**
 * Get a reading by ID
 */
export function getReadingById(id: string): CardReading | undefined {
  return CARD_READINGS.find((reading) => reading.id === id);
}

/**
 * Get readings by type
 */
export function getReadingsByType(type: ReadingType): CardReading[] {
  return CARD_READINGS.filter((reading) => reading.type === type);
}

/**
 * Get readings by theme
 */
export function getReadingsByTheme(theme: string): CardReading[] {
  return CARD_READINGS.filter((reading) =>
    reading.themes.some((t) => t.toLowerCase().includes(theme.toLowerCase()))
  );
}

/**
 * Get reading types summary
 */
export function getReadingTypes(): { type: ReadingType; count: number }[] {
  const typeMap = new Map<ReadingType, number>();
  CARD_READINGS.forEach((reading) => {
    typeMap.set(reading.type, (typeMap.get(reading.type) || 0) + 1);
  });
  return Array.from(typeMap.entries()).map(([type, count]) => ({ type, count }));
}