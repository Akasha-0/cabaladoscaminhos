/**
 * Chakra activation utilities.
 */

import type { ChakraEnergy } from '../energy-balance';

/**
 * Chakra activation state tracking individual awakening levels.
 */
export interface ActivationState {
  root: number;
  sacral: number;
  solarPlexus: number;
  heart: number;
  throat: number;
  thirdEye: number;
  crown: number;
}

/**
 * Result of a chakra activation session.
 */
export interface ActivationResult {
  success: boolean;
  activatedChakra: keyof ChakraActivationOrder;
  newLevel: number;
  energyShift: ChakraEnergy;
  message: string;
}

export type ChakraActivationOrder = 'root' | 'sacral' | 'solarPlexus' | 'heart' | 'throat' | 'thirdEye' | 'crown';

const ACTIVATION_SEQUENCE: ChakraActivationOrder[] = [
  'root',
  'sacral',
  'solarPlexus',
  'heart',
  'throat',
  'thirdEye',
  'crown',
];

const ACTIVATION_MESSAGES: Record<ChakraActivationOrder, string> = {
  root: 'Muladhara activated. Connection to earth established.',
  sacral: 'Svadhisthana activated. Creative flow awakened.',
  solarPlexus: 'Manipura activated. Personal power ignited.',
  heart: 'Anahata activated. Love frequency unlocked.',
  throat: 'Vishuddha activated. Truth expression liberated.',
  thirdEye: 'Ajna activated. Intuition channel opened.',
  crown: 'Sahasrara activated. Divine connection established.',
};

/**
 * Returns the default activation state (all at level 0).
 */
export function getDefaultActivationState(): ActivationState {
  return {
    root: 0,
    sacral: 0,
    solarPlexus: 0,
    heart: 0,
    throat: 0,
    thirdEye: 0,
    crown: 0,
  };
}

/**
 * Activates a specific chakra to the target level.
 * Returns the updated activation state.
 */
// @ts-ignore
export function activate(
  currentState: Partial<ActivationState>,
  chakra: ChakraActivationOrder,
  targetLevel = 100,
): ActivationState {
  const state: ActivationState = {
    root: currentState.root ?? 0,
    sacral: currentState.sacral ?? 0,
    solarPlexus: currentState.solarPlexus ?? 0,
    heart: currentState.heart ?? 0,
    throat: currentState.throat ?? 0,
    thirdEye: currentState.thirdEye ?? 0,
    crown: currentState.crown ?? 0,
  };

  state[chakra] = Math.min(Math.max(targetLevel, 0), 100);

  return state;
}

export const _ACTIVATION_SEQUENCE = ACTIVATION_SEQUENCE;
export const _ACTIVATION_MESSAGES = ACTIVATION_MESSAGES;
