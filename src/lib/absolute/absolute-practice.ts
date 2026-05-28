// Absolute practice

export interface AbsolutePracticeResult {
  state: string;
  depth: number;
}

export function performPractice(): AbsolutePracticeResult {
  return { state: 'absolute', depth: 0 };
}
