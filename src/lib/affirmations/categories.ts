export type Category = 'cabala' | 'numerologia' | 'orixas' | 'tarot';

export interface Affirmation {
  id: string;
  category: Category;
  text: string;
  createdAt: Date;
}

const categories: Record<Category, Affirmation[]> = {
  cabala: [],
  numerologia: [],
  orixas: [],
  tarot: [],
};

export function getCategories(): Category[] {
  return ['cabala', 'numerologia', 'orixas', 'tarot'];
}

export function getAffirmationsByCategory(category: Category): Affirmation[] {
  return categories[category] ?? [];
}

 
export function _registerAffirmation(affirmation: Affirmation): void {
  categories[affirmation.category].push(affirmation);
}
