// Osa practice

import { getData } from './osa-data';
export interface PracticeResult {
  odu: string;
  practice: string;
  completed: boolean;
  timestamp: Date;
}

/**
 * Perform Osa practice ritual
 */
export async function performPractice(): Promise<PracticeResult> {
  const data = getData();
  const selectedOdu = data[Math.floor(Math.random() * data.length)];

  return {
    odu: selectedOdu.odu,
    practice: `Invoke ${selectedOdu.odu} with meaning: ${selectedOdu.meaning}`,
    completed: true,
    timestamp: new Date(),
  };
}