// Channel flows

export interface Flow {
  id: string;
  name: string;
  steps: string[];
}

const FLOWS: Flow[] = [
  { id: 'onboarding', name: 'Onboarding', steps: ['welcome', 'profile', 'preferences'] },
  { id: 'discovery', name: 'Discovery', steps: ['search', 'browse', 'recommend'] },
  { id: 'conversion', name: 'Conversion', steps: ['engage', 'convert', 'complete'] },
];

export function getFlows(): Flow[] {
  return FLOWS;
}