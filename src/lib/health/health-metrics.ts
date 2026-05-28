// Health metrics
export interface Metric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

export interface MetricsData {
  vitals: Metric[];
  summary: Record<string, number>;
}

export function getMetrics(): MetricsData {
  return {
    vitals: [
      { name: 'heartRate', value: 72, unit: 'bpm', timestamp: Date.now() },
      { name: 'bloodPressure', value: 120, unit: 'mmHg', timestamp: Date.now() },
      { name: 'bloodOxygen', value: 98, unit: '%', timestamp: Date.now() },
      { name: 'steps', value: 8500, unit: 'steps', timestamp: Date.now() },
      { name: 'sleepHours', value: 7.5, unit: 'h', timestamp: Date.now() },
    ],
    summary: {
      dailySteps: 8500,
      avgHeartRate: 72,
      sleepQuality: 85,
    },
  };
}