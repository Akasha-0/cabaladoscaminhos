export interface OnboardingProgress {
  step: number;
  completed: boolean;
  timestamp: number;
}

const STORAGE_KEY = 'onboarding_progress';

export function saveProgress(data: OnboardingProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage unavailable
  }
}

export function loadProgress(): OnboardingProgress | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OnboardingProgress;
  } catch {
    return null;
  }
}