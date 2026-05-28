// Infinite practice

export interface InfinitePracticeResult {
  state: string;
  depth: number;
}

export function performPractice(): InfinitePracticeResult {
  return { state: 'infinite', depth: 0 };
}
