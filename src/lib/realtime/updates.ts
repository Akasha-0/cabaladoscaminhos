/**
 * Real-time updates manager using Server-Sent Events (SSE).
 * Provides subscription-based updates for dashboard and application state changes.
 */

export type UpdateEventType =
  | 'dashboard'
  | 'credits'
  | 'notifications'
  | 'sync'
  | 'calendar';

export interface UpdateEvent<T = unknown> {
  type: UpdateEventType;
  data: T;
  timestamp: number;
  id: string;
}

export interface UpdateSubscription {
  unsubscribe: () => void;
  events: AsyncIterable<UpdateEvent>;
}

interface ListenerEntry {
  resolve: (event: UpdateEvent) => void;
  reject: (err: Error) => void;
  eventType?: UpdateEventType;
}

// Global event bus for cross-tab and cross-component updates
type EventListener = (event: UpdateEvent) => void;
const listeners = new Map<string, Set<EventListener>>();
const pendingEvents: UpdateEvent[] = [];
let eventCounter = 0;

function generateEventId(): string {
  return `evt_${Date.now()}_${++eventCounter}`;
}

function emitEvent(event: UpdateEvent): void {
  // Notify all listeners for this event type
  const typeListeners = listeners.get(event.type);
  if (typeListeners) {
    typeListeners.forEach((listener) => listener(event));
  }

  // Notify wildcard listeners
  const wildcardListeners = listeners.get('*');
  if (wildcardListeners) {
    wildcardListeners.forEach((listener) => listener(event));
  }

  pendingEvents.push(event);

  // Keep only last 100 events in memory
  if (pendingEvents.length > 100) {
    pendingEvents.shift();
  }
}

/**
 * Subscribe to real-time updates of a specific type or all types.
 *
 * @param eventType - Specific event type to subscribe to, or '*' for all events
 * @returns Subscription object with unsubscribe function and events async iterable
 */
export function subscribeToUpdates(eventType?: UpdateEventType | '*'): UpdateSubscription {
  const type = eventType ?? '*';
  const eventListeners = new Set<EventListener>();
  const queuedEvents: UpdateEvent[] = [...pendingEvents];
  let closed = false;

  const listener: EventListener = (event) => {
    if (type !== '*' && event.type !== type) {
      return;
    }
    queuedEvents.push(event);
  };

  eventListeners.add(listener);
  listeners.set(type, (listeners.get(type) ?? new Set()).add(listener));

  const eventQueue = {
    [Symbol.asyncIterator]: () => {
      let index = 0;
      return {
        next: async (): Promise<IteratorResult<UpdateEvent>> => {
          if (closed) {
            return { done: true, value: undefined as unknown as UpdateEvent };
          }

          // Wait for new events
          while (index >= queuedEvents.length) {
            await new Promise<void>((resolve) => {
              const check = () => {
                if (index < queuedEvents.length || closed) {
                  resolve();
                } else {
                  setTimeout(check, 50);
                }
              };
              check();
            });

            if (closed) {
              return { done: true, value: undefined as unknown as UpdateEvent };
            }
          }

          return { done: false, value: queuedEvents[index++] };
        },
      };
    },
  };

  const unsubscribe = (): void => {
    closed = true;
    eventListeners.forEach((l) => {
      const typeListeners = listeners.get(type);
      if (typeListeners) {
        typeListeners.delete(l);
      }
    });
  };

  return {
    unsubscribe,
    events: eventQueue as AsyncIterable<UpdateEvent>,
  };
}

/**
 * Unsubscribe from all real-time updates.
 */
export function unsubscribe(): void {
  listeners.clear();
  pendingEvents.length = 0;
}

/**
 * Broadcast an update event to all subscribers.
 * Use this to push updates from the server or other components.
 *
 * @param type - Event type
 * @param data - Event payload
 */
export function broadcastUpdate<T = unknown>(type: UpdateEventType, data: T): void {
  const event: UpdateEvent<T> = {
    type,
    data,
    timestamp: Date.now(),
    id: generateEventId(),
  };
  emitEvent(event);
}

/**
 * Create an SSE handler for client connections.
 * Returns a controller that can be used to send updates to connected clients.
 */
export function createSSEUpdateHandler(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder = new TextEncoder()
): { send: (event: UpdateEvent) => void; close: () => void } {
  const send = (event: UpdateEvent): void => {
    try {
      const payload = JSON.stringify(event);
      controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
    } catch {
      // Controller already closed
    }
  };

  const close = (): void => {
    try {
      controller.close();
    } catch {
      // Already closed
    }
  };

  return { send, close };
}

/**
 * Poll for updates at a specified interval.
 * Useful for clients that don't support SSE.
 *
 * @param interval - Polling interval in milliseconds
 * @param fetchFn - Function to fetch new updates
 * @returns Polling controller with stop function
 */
export function createPollingUpdates(
  interval: number = 30_000,
  fetchFn?: () => Promise<UpdateEvent[]>
): { stop: () => void; start: () => void } {
  let timer: ReturnType<typeof setInterval> | null = null;
  let stopped = false;

  const start = (): void => {
    if (timer !== null) return;

    stopped = false;
    timer = setInterval(async () => {
      if (stopped) return;

      try {
        if (fetchFn) {
          const events = await fetchFn();
          events.forEach((event) => emitEvent(event));
        }
      } catch {
        // Silently handle polling errors
      }
    }, interval);
  };

  const stop = (): void => {
    stopped = true;
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };

  start();

  return { start, stop };
}