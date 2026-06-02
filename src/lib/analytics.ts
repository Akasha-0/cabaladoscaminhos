// fallow-ignore-file unused-file
// Analytics service - in-memory storage, replaceable with external service

interface EventData {
  [key: string]: unknown;
}

interface StoredEvent {
  event: string;
  properties: EventData;
  timestamp: number;
}

interface FunnelStep {
  step: string;
  timestamp: number;
}

interface User {
  id: string;
  traits: EventData;
}

// Funnel step definitions
export type FunnelStepName = 'views' | 'signups' | 'first_calculation' | 'subscription' | 'churn';

// In-memory storage (replaceable via external integration)
const _events: StoredEvent[] = [];
const _users: Map<string, User> = new Map();
const _funnelData: Map<string, FunnelStep[]> = new Map();
let _currentUserId: string | null = null;

/**
 * Track a custom event
 * @param event - Event name (e.g., 'button_click', 'conversion')
 * @param properties - Optional event properties
 */
export function track(event: string, properties: EventData = {}): void {
  const storedEvent: StoredEvent = {
    event,
    properties,
    timestamp: Date.now(),
  };
  _events.push(storedEvent);

  // Integration point: send to external analytics service
  // e.g., mixpanel.track(event, properties);
}

/**
 * Track a conversion funnel step
 * @param step - Funnel step name: 'views', 'signups', 'first_calculation', 'subscription', 'churn'
 * @param userId - Optional user identifier (uses current user if not provided)
 */
function trackFunnelStep(step: FunnelStepName, userId?: string): void {
  const targetUserId = userId || _currentUserId;
  if (!targetUserId) {
    console.warn('trackFunnelStep: No user ID available');
    return;
  }

  const funnelStep: FunnelStep = {
    step,
    timestamp: Date.now(),
  };

  const userFunnel = _funnelData.get(targetUserId) || [];
  userFunnel.push(funnelStep);
  _funnelData.set(targetUserId, userFunnel);

  track('funnel_step', { step, userId: targetUserId });
}

/**
 * Get funnel data for a user
 * @param userId - User identifier
 * @returns Array of funnel steps with timestamps
 */
function getFunnelData(userId: string): FunnelStep[] {
  return _funnelData.get(userId) || [];
}

/**
 * Track a page view
 * @param page - Page name or path
 * @param properties - Optional page properties
 */
export function page(page: string, properties: EventData = {}): void {
  const pageProperties = {
    ...properties,
    url: page,
    referrer: typeof document !== 'undefined' ? document.referrer : undefined,
  };
  track('page_view', pageProperties);
}

/**
 * Identify a user
 * @param userId - Unique user identifier
 * @param traits - Optional user traits
 */
export function identify(userId: string, traits: EventData = {}): void {
  _currentUserId = userId;
  const user: User = { id: userId, traits };
  _users.set(userId, user);
  track('user_identify', { userId, ...traits });
}

// Exported analytics object
export const analytics = {
  track,
  trackFunnelStep,
  getFunnelData,
  page,
  identify,

  // Debug/internal access
  _getEvents(): StoredEvent[] {
    return _events;
  },
  _getUsers(): Map<string, User> {
    return _users;
  },
  _getFunnelData(): Map<string, FunnelStep[]> {
    return _funnelData;
  },
  _getCurrentUserId(): string | null {
    return _currentUserId;
  },
  _clear(): void {
    _events.length = 0;
    _users.clear();
    _funnelData.clear();
    _currentUserId = null;
  },
};