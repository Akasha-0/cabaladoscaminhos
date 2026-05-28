// Mystical texts data

export interface MysticalText {
  id: string;
  title: string;
  content: string;
  origin: string;
  category: string;
}

const texts: MysticalText[] = [
  {
    id: "sefer-yetzirah",
    title: "Sefer Yetzirah",
    content: "In thirty-two secret paths of wisdom, by His spirit, He gave them form and shape.",
    origin: "Kabbalistic tradition",
    category: "creation"
  },
  {
    id: "the-pillar-of-fire",
    title: "The Pillar of Fire",
    content: "I am that I am. The light that illuminates the darkness of matter.",
    origin: "Ancient wisdom",
    category: "illumination"
  },
  {
    id: "the-tree-of-life",
    title: "Tree of Life",
    content: "Ten sefirot of nothingness, like the reflection of stars in clear water.",
    origin: "Kabbalistic tradition",
    category: "structure"
  },
  {
    id: "the-trail-of-light",
    title: "The Trail of Light",
    content: "The soul descends through the pathways, carrying the flame of divine purpose.",
    origin: "Mystical tradition",
    category: "journey"
  },
  {
    id: "sacred-geometry",
    title: "Sacred Geometry",
    content: "The world was created by measure, number, and weight, set in sacred proportion.",
    origin: "Hermetic tradition",
    category: "cosmic"
  }
];

export function getTexts(): MysticalText[] {
  return texts;
}

export function getTextById(id: string): MysticalText | undefined {
  return texts.find(t => t.id === id);
}

export function getTextsByCategory(category: string): MysticalText[] {
  return texts.filter(t => t.category === category);
}