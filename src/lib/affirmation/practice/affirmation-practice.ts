import { getData } from './affirmation-data';

export interface PracticeResult {
  completed: boolean;
  timestamp: number;
  affirmation: string;
  category: string;
}

export async function performPractice(): Promise<PracticeResult> {
  const { affirmations, categories } = getData();

  const categoryIndex = Math.floor(Math.random() * categories.length);
  const category = categories[categoryIndex];

  const categoryAffirmations = affirmations.filter(a => a.category === category);
  const selectedAffirmation = categoryAffirmations.length > 0
    ? categoryAffirmations[Math.floor(Math.random() * categoryAffirmations.length)]
    : affirmations[Math.floor(Math.random() * affirmations.length)];

  return {
    completed: true,
    timestamp: Date.now(),
    affirmation: selectedAffirmation.text,
    category: selectedAffirmation.category,
  };
}
