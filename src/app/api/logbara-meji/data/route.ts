// Logbara-Meji API - Cabala Dos Caminhos
// GET endpoints for Logbara-Meji Odu spiritual data

import { NextResponse } from 'next/server';

// Logbara-Meji data structure based on Ifá lore
interface LogbaraMejiData {
  id: string;
  name: string;
  namePt: string;
  nameEn: string;
  symbol: string;
  yoruba: string;
  meaning: string;
  meaningPt: string;
  meaningEn: string;
  spiritualGuidance: string[];
  keywords: string[];
  elements: string[];
  colors: string[];
  dayOfWeek: string;
  rulingOrishas: string[];
  sacredNumbers: number[];
  greeting: string;
  rituals: string[];
  offerings: string[];
  affirmations: string[];
}

const logbaraMejiData: LogbaraMejiData = {
  id: 'logbara-meji-001',
  name: 'Logbara-Meji',
  namePt: 'Logbara-Meji - A Duplicação da Grande Luz',
  nameEn: 'Logbara-Meji - The Duplication of Great Light',
  symbol: '☱☱',
  yoruba: 'Logbárá Méjì',
  meaning: 'Duplicação da luz ancestral, ancestralidade aumentada',
  meaningPt: 'Logbara-Meji representa a duplicação da luz ancestral, sabedoria herdada em doses triplicadas, purificação profunda e conexão intensificada com os ancestrais. Este Odu traz a bênção de limpar fardos familiares de múltiplas gerações e estabelecer um legado de luz para as gerações futuras.',
  meaningEn: 'Logbara-Meji symbolizes the duplication of ancestral light, wisdom inherited in tripled doses, deep purification, and intensified connection with ancestors. This Odu brings the blessing of cleansing family burdens across multiple generations and establishing a legacy of light for future generations.',
  spiritualGuidance: [
    'Seek deep ancestral connection through meditation and rituals',
    'Purify family karmic patterns through dedicated spiritual practice',
    'Honor your ancestors with unwavering devotion',
    'Establish a legacy of light for future generations',
    'Trust in the light that flows through your bloodline',
  ],
  keywords: ['ancestral light', 'purification', 'duplication', 'legacy', 'karmic cleansing', 'wisdom', 'connection', 'generations'],
  elements: ['Luz Solar', 'Fogo Purificador', 'Ouro Ancestral'],
  colors: ['#FFFAF0', '#FFA500', '#FFD700', '#8B0000'],
  dayOfWeek: 'Terça-feira',
  rulingOrishas: ['Olodumare', 'Egungun', 'Ogun', 'Osanyin'],
  sacredNumbers: [10, 20, 40, 100],
  greeting: 'The light of ancestors illuminates your path!',
  rituals: [
    'Ancestral honoring rituals at the family shrine',
    'Karmic purification ceremonies',
    'Fire offerings for generational cleansing',
    'Light meditation with sacred incense',
    'Blood lineage offerings',
  ],
  offerings: [
    'White rooster',
    'Akara (fried bean cakes)',
    'Logbara sacred bottle',
    'Rosemary and orange flower water',
    'Fresh coconut',
    'Roasted corn',
    'Palm oil',
  ],
  affirmations: [
    'My ancestral light guides me',
    'I release family burdens with grace',
    'Wisdom flows through my bloodline',
    'I honor those who came before me',
    'A legacy of light flows through me to future generations',
  ],
};

// Combined Meji Logbara variations
const mejiLogbaraData: Record<number, LogbaraMejiData> = {
  1: logbaraMejiData,
};

export async function GET() {
  return NextResponse.json({ data: logbaraMejiData });
}
