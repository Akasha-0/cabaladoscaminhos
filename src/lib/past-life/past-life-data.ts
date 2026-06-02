// fallow-ignore-file unused-file
// Stub for @/lib/past-life/past-life-data
// Module does not exist - stub implementation for test compatibility

export interface PastLifeProfile {
  id: string;
  name: string;
  era: string;
  culture: string;
  spiritualAge: number;
  description: string;
  lessons: string[];
  skills: string[];
  themes: string[];
}

export interface PastLifeRelationship {
  id: string;
  type: string;
  profileId: string;
  relatedProfileId: string;
  description: string;
}

export interface PastLifeTheme {
  id: string;
  category: string;
  name: string;
  description: string;
}

export interface PastLifeSkill {
  id: string;
  domain: string;
  name: string;
  description: string;
}

export interface PastLifeData {
  profiles: PastLifeProfile[];
  relationships: PastLifeRelationship[];
  themes: PastLifeTheme[];
  skills: PastLifeSkill[];
}

// Sample data
const sampleData: PastLifeData = {
  profiles: [
    {
      id: 'ancient-healer',
      name: 'Ancient Healer',
      era: 'ancient',
      culture: 'Egyptian',
      spiritualAge: 7,
      description: 'A healer in ancient Egypt',
      lessons: ['compassion', 'patience'],
      skills: ['energy-healing'],
      themes: ['abandonment'],
    },
  ],
  relationships: [],
  themes: [
    { id: 'abandonment', category: 'emotional', name: 'Abandonment', description: 'Fear of being left alone' },
  ],
  skills: [
    { id: 'energy-healing', domain: 'healing', name: 'Energy Healing', description: 'Channeling healing energy' },
  ],
};

export function getData(): PastLifeData {
  return sampleData;
}

export function getProfileById(id: string): PastLifeProfile | undefined {
  return sampleData.profiles.find((p) => p.id === id);
}

export function getProfilesByEra(era: string): PastLifeProfile[] {
  return sampleData.profiles.filter((p) => p.era === era);
}

function getProfilesByCulture(culture: string): PastLifeProfile[] {
  return sampleData.profiles.filter((p) => p.culture === culture);
}

function getProfilesBySpiritualAge(age: number): PastLifeProfile[] {
  return sampleData.profiles.filter((p) => p.spiritualAge === age);
}

function getRelationshipById(id: string): PastLifeRelationship | undefined {
  return sampleData.relationships.find((r) => r.id === id);
}

function getRelationshipsByType(type: string): PastLifeRelationship[] {
  return sampleData.relationships.filter((r) => r.type === type);
}

export function getThemeById(id: string): PastLifeTheme | undefined {
  return sampleData.themes.find((t) => t.id === id);
}

function getThemesByCategory(category: string): PastLifeTheme[] {
  return sampleData.themes.filter((t) => t.category === category);
}

export function getSkillById(id: string): PastLifeSkill | undefined {
  return sampleData.skills.find((s) => s.id === id);
}

function getSkillsByDomain(domain: string): PastLifeSkill[] {
  return sampleData.skills.filter((s) => s.domain === domain);
}