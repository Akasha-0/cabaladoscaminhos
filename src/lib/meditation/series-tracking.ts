const STORAGE_KEY = "meditation_series";

export interface SeriesEntry {
  date: string; // ISO date string
  meditationId: string;
  completed: boolean;
}

export interface SeriesData {
  [meditationId: string]: SeriesEntry[];
}

export interface TrackSeriesOptions {
  meditationId: string;
  completed?: boolean;
}

export function trackSeries(options: TrackSeriesOptions): void {
  const { meditationId, completed = true } = options;

  const stored = localStorage.getItem(STORAGE_KEY);
  const data: SeriesData = stored ? JSON.parse(stored) : {};

  if (!data[meditationId]) {
    data[meditationId] = [];
  }

  data[meditationId].push({
    date: new Date().toISOString(),
    meditationId,
    completed,
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getSeries(meditationId: string): SeriesEntry[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  const data: SeriesData = JSON.parse(stored);
  return data[meditationId] || [];
}

export function getAllSeries(): SeriesData {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
}

export function clearSeries(meditationId?: string): void {
  if (meditationId) {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data: SeriesData = JSON.parse(stored);
      delete data[meditationId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}
