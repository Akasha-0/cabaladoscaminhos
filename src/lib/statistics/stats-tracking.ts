// fallow-ignore-file unused-file
export interface StatsEvent {
  name: string;
  value?: number;
  metadata?: Record<string, unknown>;
  timestamp?: number;
}

export interface StatsTracker {
  track(event: StatsEvent): void;
}

const defaultTracker: StatsTracker = {
  track(event: StatsEvent): void {
     
    console.log('[stats]', {
      ...event,
      timestamp: event.timestamp ?? Date.now(),
    });
  },
};

let currentTracker: StatsTracker = defaultTracker;

export function setTracker(tracker: StatsTracker): void {
  currentTracker = tracker;
}

export function trackStats(event: StatsEvent): void {
  currentTracker.track(event);
}
