// Name analysis module
// @ts-nocheck

const VOWELS = 'AEIOUÁÉÍÓÚÃẼĨÕŨY';
const CONSONANTS = 'BCÇDFGHJKLMNNPQRRSSTTVWXZ';

export interface NameAnalysis {
  original: string;
  normalized: string;
  vowels: string[];
  consonants: string[];
  vowelCount: number;
  consonantCount: number;
}

export function analyzeName(name: string): NameAnalysis {
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();

  const vowels: string[] = [];
  const consonants: string[] = [];

  for (const char of normalized) {
    if (VOWELS.includes(char)) {
      vowels.push(char);
    } else if (/[A-Z]/.test(char)) {
      consonants.push(char);
    }
  }

  return {
    original: name,
    normalized,
    vowels,
    consonants,
    vowelCount: vowels.length,
    consonantCount: consonants.length,
  };
}