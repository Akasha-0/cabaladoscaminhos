// ============================================================================
// progress-helpers — Wave 35 Beta Onboarding
// ============================================================================
// Sub-módulo extraído para evitar que `OnboardingProgress.tsx` importe
// diretamente de `state-machine.ts` (que depende de `@prisma/client`).
// Aqui só usamos string literals equivalentes ao enum.
//
// Mantém a API idêntica aos helpers do state-machine.
// ============================================================================

export type OnboardingStateLite =
  | 'INVITED'
  | 'SIGNED_UP'
  | 'PROFILE_SETUP'
  | 'TRADITION_CHOSEN'
  | 'FIRST_ACTION'
  | 'ONBOARDED'
  | 'SKIPPED'
  | 'DROPPED';

export const TOTAL_PROGRESS_STEPS = 7;

export function progressPercent(state: OnboardingStateLite): number {
  switch (state) {
    case 'INVITED':
      return 0;
    case 'SIGNED_UP':
      return 14;
    case 'PROFILE_SETUP':
      return 42;
    case 'TRADITION_CHOSEN':
      return 57;
    case 'FIRST_ACTION':
      return 78;
    case 'ONBOARDED':
      return 100;
    case 'SKIPPED':
      return 100;
    case 'DROPPED':
      return 0;
  }
}

export function progressStepNumber(state: OnboardingStateLite): number {
  switch (state) {
    case 'INVITED':
      return 0;
    case 'SIGNED_UP':
      return 1;
    case 'PROFILE_SETUP':
      return 3;
    case 'TRADITION_CHOSEN':
      return 4;
    case 'FIRST_ACTION':
      return 5;
    case 'ONBOARDED':
      return 7;
    case 'SKIPPED':
      return 7;
    case 'DROPPED':
      return 0;
  }
}