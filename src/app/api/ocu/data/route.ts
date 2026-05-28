// @ts-nocheck
// SKIP_LINT

import { NextResponse } from "next/server";

/**
 * Ocu Data Module
 * Spiritual data for Ocu (Òcú), the orixá of mystery, secrets, hidden knowledge, and nocturnal wisdom
 */

export interface OcuData {
  id: string;
  name: string;
  namePortuguese: string;
  nameYoruba: string;
  path: string;
  element: string;
  colors: string[];
  dayOfWeek: string;
  numbersSacred: number[];
  greeting: string;
  archetype: string;
  qualities: string[];
  challenges: string[];
  rulingPlanet: string;
  sacredAnimals: string[];
  plants: string[];
  offerings: string[];
  chants: string[];
  symbols: string[];
  mythology: string;
  spiritualLesson: string;
  affirmation: string;
  meditation: string;
  domains: string[];
  sacredObjects: string[];
  invocationPhrases: string[];
  aspects: OcuAspect[];
}

export interface OcuAspect {
  name: string;
  description: string;
  qualities: string[];
}

const OCU_DATA: OcuData = {
  id: "ocu",
  name: "Ocu",
  namePortuguese: "Òcú",
  nameYoruba: "Ocu",
  path: "Path of Hidden Knowledge",
  element: "Night/Secrets",
  colors: ["Black", "Deep Purple", "Silver"],
  dayOfWeek: "Wednesday",
  numbersSacred: [7, 13, 21],
  greeting: "Ocu mi! (My Ocu!)",
  archetype: "The Keeper of Secrets",
  qualities: [
    "Deep intuition",
    "Mystery and revelation",
    "Night wisdom",
    "Hidden truths",
    "Patience in secrecy",
    "Keeper of ancient knowledge"
  ],
  challenges: [
    "Tendency toward isolation",
    "Difficulty revealing truths too quickly",
    "May become secretive to a fault"
  ],
  rulingPlanet: "Moon (night)",
  sacredAnimals: ["Owl", "Bat", "Serpent"],
  plants: ["Night-blooming jasmine", "Moonflower", "Mugwort"],
  offerings: ["Black candles", "Honey wine", "Incense of myrrh", "Dark stones"],
  chants: ["Ocu! Ocu!", "Eewo okan mi!", "Orun ti mo fe!"],
  symbols: ["Owl feather", "Closed book", "Moon crescent", "Hidden key"],
  mythology: "Ocu is the keeper of all that is hidden and secret. Born from the union of light and shadow at the dawn of creation, Ocu walks between worlds, seeing what others cannot. Associated with nocturnal wisdom, divination, and the revealment of truth when the time is right.",
  spiritualLesson: "Not all truths are meant for all times. The keeper of secrets understands that wisdom lies in knowing when to reveal and when to conceal, guiding seekers toward illumination through the darkness.",
  affirmation: "I honor the wisdom of the night and trust in the timing of revelation. Secrets reveal themselves when the seeker is ready.",
  meditation: "I breathe in the darkness of mystery. I breathe out the need to know all now. I am patient as the moon reveals its secrets in its own time.",
  domains: [
    "Hidden knowledge",
    "Night wisdom",
    "Secrets and mystery",
    "Divination",
    "Patience and timing",
    "Ancient mysteries"
  ],
  sacredObjects: [
    "Owl feather staff",
    "Sealed scroll",
    "Moon mirror",
    "Mystery key",
    "Night candle"
  ],
  invocationPhrases: [
    "Ocu! Keeper of secrets, reveal what is hidden!",
    "Guardian of the night, guide my vision!",
    "Eewo okan mi! Open the doors of ancient wisdom!"
  ],
  aspects: [
    {
      name: "Ocu of the Night",
      description: "The guardian of nocturnal wisdom and lunar mysteries",
      qualities: ["Night vision", "Lunar connection", "Dream work", "Shadow navigation"]
    },
    {
      name: "Ocu of Secrets",
      description: "The keeper of sacred knowledge and hidden truths",
      qualities: ["Secret keeping", "Truth revelation", "Ancient wisdom", "Mystery preservation"]
    },
    {
      name: "Ocu of Divination",
      description: "The seer who reads the patterns hidden from ordinary sight",
      qualities: ["Intuition", "Pattern recognition", "Divination arts", "Prophetic insight"]
    }
  ]
};

export function getData(): OcuData {
  return OCU_DATA;
}

export function getDataById(id: string): OcuData | undefined {
  if (id === "ocu" || id === "oku") {
    return OCU_DATA;
  }
  return undefined;
}

export function searchData(query: string): OcuData[] {
  const lowerQuery = query.toLowerCase();
  const matches: OcuData[] = [];
  
  if (
    OCU_DATA.name.toLowerCase().includes(lowerQuery) ||
    OCU_DATA.namePortuguese.toLowerCase().includes(lowerQuery) ||
    OCU_DATA.nameYoruba.toLowerCase().includes(lowerQuery) ||
    OCU_DATA.path.toLowerCase().includes(lowerQuery) ||
    OCU_DATA.element.toLowerCase().includes(lowerQuery) ||
    OCU_DATA.mythology.toLowerCase().includes(lowerQuery) ||
    OCU_DATA.qualities.some((q) => q.toLowerCase().includes(lowerQuery)) ||
    OCU_DATA.domains.some((d) => d.toLowerCase().includes(lowerQuery))
  ) {
    matches.push(OCU_DATA);
  }
  
  return matches;
}

export function getOcuByElement(element: string): OcuData | undefined {
  if (OCU_DATA.element.toLowerCase().includes(element.toLowerCase())) {
    return OCU_DATA;
  }
  return undefined;
}

export function getOcuByDay(day: string): OcuData | undefined {
  if (OCU_DATA.dayOfWeek.toLowerCase().includes(day.toLowerCase())) {
    return OCU_DATA;
  }
  return undefined;
}

export function getDomains(): string[] {
  return OCU_DATA.domains;
}

export function getSacredObjects(): string[] {
  return OCU_DATA.sacredObjects;
}

export function getInvocationPhrases(): string[] {
  return OCU_DATA.invocationPhrases;
}

export function getAspects(): OcuAspect[] {
  return OCU_DATA.aspects;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const query = searchParams.get("q");
  const element = searchParams.get("element");
  const day = searchParams.get("day");
  const domains = searchParams.get("domains");
  const sacredObjects = searchParams.get("sacredObjects");
  const invocations = searchParams.get("invocations");
  const aspects = searchParams.get("aspects");

  if (id) {
    const item = getDataById(id);
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ data: item });
  }

  if (query) {
    return NextResponse.json({ data: searchData(query) });
  }

  if (element) {
    const item = getOcuByElement(element);
    if (!item) {
      return NextResponse.json({ error: "No data found for element" }, { status: 404 });
    }
    return NextResponse.json({ data: item });
  }

  if (day) {
    const item = getOcuByDay(day);
    if (!item) {
      return NextResponse.json({ error: "No data found for day" }, { status: 404 });
    }
    return NextResponse.json({ data: item });
  }

  if (domains) {
    return NextResponse.json({ data: getDomains() });
  }

  if (sacredObjects) {
    return NextResponse.json({ data: getSacredObjects() });
  }

  if (invocations) {
    return NextResponse.json({ data: getInvocationPhrases() });
  }

  if (aspects) {
    return NextResponse.json({ data: getAspects() });
  }

  return NextResponse.json({ data: getData() });
}