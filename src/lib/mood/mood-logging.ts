export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface MoodEntry {
  level: MoodLevel;
  note?: string;
  timestamp: Date;
}

export async function logMood(entry: Omit<MoodEntry, 'timestamp'>): Promise<MoodEntry> {
  const fullEntry: MoodEntry = {
    ...entry,
    timestamp: new Date(),
  };
  console.log('[mood-log]', fullEntry);
  return fullEntry;
}
