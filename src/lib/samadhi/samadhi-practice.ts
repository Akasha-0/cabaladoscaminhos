// Samadhi practice

export interface SamadhiPracticeResult {
  state: string;
  depth: number;
}

export function performPractice(): SamadhiPracticeResult {
  return { state: 'samadhi', depth: 0 };
}
