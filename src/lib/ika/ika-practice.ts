/**
 * Ika Practice Module
 * Handles the practice logic for the Ika system.
 */
import { getData } from './ika-data';

export interface PracticeResult {
  success: boolean;
  message: string;
  timestamp: Date;
}

/**
 * Performs the Ika practice — derives its message from the canonical
 * `ikaData` (source of truth) so the practice stays in lockstep with the
 * rest of the Ika domain. No invented correspondences (AGENTS.md §5).
 *
 * @returns The result of the practice operation
 */
export function performPractice(): PracticeResult {
  const data = getData();
  return {
    success: true,
    message: `${data.name} practice completed — ${data.description}`,
    timestamp: new Date(),
  };
}
