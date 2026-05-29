// Name analysis module
// @ts-nocheck


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
   .toUpperCase()
   .normalize('NFD')
   .replace(/[\u0300-\u036f]/g, '')
   .replace(/[^A-Z\s]/g, '')
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