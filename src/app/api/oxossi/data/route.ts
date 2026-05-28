// @ts-nocheck
// SKIP_LINT

import { NextResponse } from "next/server";

/**
 * Oxossi Data Module
 * Spiritual data for Oxossi (Oxóssi, Ogbe), the orixá of the hunt, forests, wisdom, and earthly knowledge
 */

export interface OxossiData {
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
  aspects: OxossiAspect[];
}

export interface OxossiAspect {
  name: string;
  description: string;
  qualities: string[];
}

const OXOSSI_DATA: OxossiData = {
  id: "oxossi",
  name: "Oxossi",
  namePortuguese: "Oxóssi",
  nameYoruba: "Ogun",
  path: "Hunter's Path",
  element: "Earth/Forest",
  colors: ["Green", "Blue", "Yellow"],
  dayOfWeek: "Thursday",
  numbersSacred: [5, 9, 13],
  greeting: "Egun ara! (Body of light)",
  archetype: "The Wise Hunter",
  qualities: [
    "Strategic thinking",
    "Connection to nature",
    "Patience in pursuit",
    "Sharp perception",
    "Earth wisdom",
    "Tracker of truths"
  ],
  challenges: [
    "Perfectionism",
    "Impatience when blocked",
    "Tendency toward isolation"
  ],
  rulingPlanet: "Earth (not celestial)",
  sacredAnimals: ["Wild boar", "Bird of prey", "Ox"],
  plants: ["Eucalyptus", "Mango leaves", "Forest herbs"],
  offerings: ["Red palm oil", "Roasted corn", "Honey", "Ginger"],
  chants: ["Ogun! Ogun! Ogun!", "E pari Ora!", "Oso meta re!"],
  symbols: [" bow and arrow", "Ox head", "Hunting horn", "Feathers"],
  mythology: "Oxossi is the great hunter and guardian of the forests. He represents the aspect of pursuing one's goals with patience, strategy, and determination. Son of Odudua and Olokun, he learned hunting from his divine father Ogun and became the most skilled tracker in all the worlds.",
  spiritualLesson: "True wisdom comes from understanding the rhythms of nature and the patterns of life. The hunter who rushes blindly fails; the one who observes, plans, and acts with precision succeeds.",
  affirmation: "I move through this world with clear perception and patient purpose, tracking my destiny with steady resolve.",
  meditation: "I breathe in the wisdom of the forest. I breathe out unclear vision. I am the patient hunter of my own truth.",
  domains: [
    "Hunting and foraging",
    "Forest wisdom",
    "Earthly knowledge",
    "Strategic pursuit",
    "True sight",
    "Patience and observation"
  ],
  sacredObjects: [
    "Hunter's bow",
    "Arrow quiver",
    "Feathered crown",
    "Wooden drum",
    "Ox horn"
  ],
  invocationPhrases: [
    "Ogbe! Hear the hunter's voice!",
    "Oxossi, great tracker, show me the path!",
    "Egun ara! Body of light, guide my aim!"
  ],
  aspects: [
    {
      name: "Oxossi of the Forest",
      description: "The guardian of wild spaces and teacher of survival wisdom",
      qualities: ["Nature connection", "Survival skills", "Forest medicine"]
    },
    {
      name: "Oxossi of the Hunt",
      description: "The strategic pursuer who never loses his quarry",
      qualities: ["Patience", "Focus", "Precision", "Determination"]
    },
    {
      name: "Oxossi of True Sight",
      description: "The one who sees what others miss, the revealer of hidden truths",
      qualities: ["Perception", "Discernment", "Wisdom", "Clairvoyance"]
    }
  ]
};

export function getData(): OxossiData {
  return OXOSSI_DATA;
}

export function getDataById(id: string): OxossiData | undefined {
  if (id === "oxossi" || id === "oxosse" || id === "ogbe") {
    return OXOSSI_DATA;
  }
  return undefined;
}

export function searchData(query: string): OxossiData[] {
  const lowerQuery = query.toLowerCase();
  const matches: OxossiData[] = [];
  
  if (
    OXOSSI_DATA.name.toLowerCase().includes(lowerQuery) ||
    OXOSSI_DATA.namePortuguese.toLowerCase().includes(lowerQuery) ||
    OXOSSI_DATA.nameYoruba.toLowerCase().includes(lowerQuery) ||
    OXOSSI_DATA.path.toLowerCase().includes(lowerQuery) ||
    OXOSSI_DATA.element.toLowerCase().includes(lowerQuery) ||
    OXOSSI_DATA.mythology.toLowerCase().includes(lowerQuery) ||
    OXOSSI_DATA.qualities.some((q) => q.toLowerCase().includes(lowerQuery)) ||
    OXOSSI_DATA.domains.some((d) => d.toLowerCase().includes(lowerQuery))
  ) {
    matches.push(OXOSSI_DATA);
  }
  
  return matches;
}

export function getOxossiByElement(element: string): OxossiData | undefined {
  if (OXOSSI_DATA.element.toLowerCase().includes(element.toLowerCase())) {
    return OXOSSI_DATA;
  }
  return undefined;
}

export function getOxossiByDay(day: string): OxossiData | undefined {
  if (OXOSSI_DATA.dayOfWeek.toLowerCase().includes(day.toLowerCase())) {
    return OXOSSI_DATA;
  }
  return undefined;
}

export function getDomains(): string[] {
  return OXOSSI_DATA.domains;
}

export function getSacredObjects(): string[] {
  return OXOSSI_DATA.sacredObjects;
}

export function getInvocationPhrases(): string[] {
  return OXOSSI_DATA.invocationPhrases;
}

export function getAspects(): OxossiAspect[] {
  return OXOSSI_DATA.aspects;
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
    const item = getOxossiByElement(element);
    if (!item) {
      return NextResponse.json({ error: "No data found for element" }, { status: 404 });
    }
    return NextResponse.json({ data: item });
  }

  if (day) {
    const item = getOxossiByDay(day);
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
