/**
 * Real-time Updates Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  subscribeToUpdates,
  unsubscribe,
  broadcastUpdate,
  createSSEUpdateHandler,
  createPollingUpdates,
  type UpdateEventType,
  type UpdateEvent,
} from '@/lib/realtime/updates';

describe('Real-time Updates', () => {
  beforeEach(() => {
    unsubscribe(); // Clean up any existing subscriptions
  });

  afterEach(() => {
    unsubscribe();
  });

  describe('subscribeToUpdates', () => {
    it('should return a subscription object', () => {
      const subscription = subscribeToUpdates('dashboard');
      
      expect(subscription).toHaveProperty('unsubscribe');
      expect(subscription).toHaveProperty('eventType');
      expect(typeof subscription.unsubscribe).toBe('function');
    });

    it('should work with specific event types', () => {
      const types: UpdateEventType[] = ['dashboard', 'credits', 'notifications', 'sync', 'calendar'];
      
      types.forEach(type => {
        const subscription = subscribeToUpdates(type);
        expect(subscription.eventType).toBe(type);
      });
    });

    it('should work with wildcard subscription', () => {
      const subscription = subscribeToUpdates('*');
      expect(subscription.eventType).toBe('*');
    });

    it('should work without specifying event type', () => {
      const subscription = subscribeToUpdates();
      expect(subscription.eventType).toBeUndefined();
    });

    it('should allow multiple subscriptions', () => {
      const sub1 = subscribeToUpdates('dashboard');
      const sub2 = subscribeToUpdates('credits');
      const sub3 = subscribeToUpdates();
      
      expect(sub1).toBeDefined();
      expect(sub2).toBeDefined();
      expect(sub3).toBeDefined();
    });
  });

  describe('broadcastUpdate', () => {
    it('should broadcast an event without throwing', () => {
      expect(() => {
        broadcastUpdate('dashboard', { message: 'test' });
      }).not.toThrow();
    });

    it('should broadcast with different event types', () => {
      const types: UpdateEventType[] = ['dashboard', 'credits', 'notifications', 'sync', 'calendar'];
      
      types.forEach(type => {
        expect(() => {
          broadcastUpdate(type, { data: 'test' });
        }).not.toThrow();
      });
    });

    it('should accept any data payload', () => {
      expect(() => {
        broadcastUpdate('dashboard', { id: 1, name: 'test', nested: { value: true } });
      }).not.toThrow();
      
      expect(() => {
        broadcastUpdate('dashboard', [1, 2, 3]);
      }).not.toThrow();
      
      expect(() => {
        broadcastUpdate('dashboard', 'simple string');
      }).not.toThrow();
      
      expect(() => {
        broadcastUpdate('dashboard', null);
      }).not.toThrow();
    });

    it('should handle broadcasts to wildcard subscribers', () => {
      subscribeToUpdates('*');
      expect(() => {
        broadcastUpdate('dashboard', { test: true });
      }).not.toThrow();
    });
  });

  describe('createSSEUpdateHandler', () => {
    it('should return send and close functions', () => {
      const mockController = {
        enqueue: vi.fn(),
        close: vi.fn(),
      } as unknown as ReadableStreamDefaultController;
      
      const handler = createSSEUpdateHandler(mockController);
      
      expect(handler).toHaveProperty('send');
      expect(handler).toHaveProperty('close');
      expect(typeof handler.send).toBe('function');
      expect(typeof handler.close).toBe('function');
    });

    it('should close the controller when close is called', () => {
      const mockController = {
        enqueue: vi.fn(),
        close: vi.fn(),
      } as unknown as ReadableStreamDefaultController;
      
      const handler = createSSEUpdateHandler(mockController);
      handler.close();
      
      expect(mockController.close).toHaveBeenCalled();
    });

    it('should send events to the controller', () => {
      const mockController = {
        enqueue: vi.fn(),
        close: vi.fn(),
      } as unknown as ReadableStreamDefaultController;
      
      const handler = createSSEUpdateHandler(mockController);
      const event: UpdateEvent = {
        id: 'test-event',
        type: 'dashboard',
        data: { message: 'hello' },
        timestamp: Date.now(),
      };
      
      handler.send(event);
      
      expect(mockController.enqueue).toHaveBeenCalled();
    });

    it('should work with custom encoder', () => {
      const mockController = {
        enqueue: vi.fn(),
        close: vi.fn(),
      } as unknown as ReadableStreamDefaultController;
      const customEncoder = new TextEncoder();
      
      const handler = createSSEUpdateHandler(mockController, customEncoder);
      
      expect(handler).toBeDefined();
    });
  });

  describe('createPollingUpdates', () => {
    it('should return start and stop functions', () => {
      const polling = createPollingUpdates(1000);
      
      expect(polling).toHaveProperty('start');
      expect(polling).toHaveProperty('stop');
      expect(typeof polling.start).toBe('function');
      expect(typeof polling.stop).toBe('function');
    });

    it('should stop without throwing', () => {
      const polling = createPollingUpdates(60000);
      expect(() => polling.stop()).not.toThrow();
    });

    it('should start without throwing', () => {
      const polling = createPollingUpdates(60000);
      expect(() => polling.start()).not.toThrow();
      polling.stop();
    });

    it('should accept custom fetch function', async () => {
      const mockFetch = vi.fn().mockResolvedValue([]);
      const polling = createPollingUpdates(100, mockFetch);
      
      polling.start();
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(mockFetch).toHaveBeenCalled();
      polling.stop();
    });

    it('should use default interval', () => {
      const polling = createPollingUpdates();
      
      expect(polling).toBeDefined();
      polling.stop();
    });

    it('should allow restarting after stopping', () => {
      const polling = createPollingUpdates(100);
      
      polling.start();
      polling.stop();
      expect(() => polling.start()).not.toThrow();
      polling.stop();
    });
  });

  describe('unsubscribe', () => {
    it('should clean up subscriptions', () => {
      subscribeToUpdates('dashboard');
      subscribeToUpdates('credits');
      
      expect(() => unsubscribe()).not.toThrow();
    });

    it('should allow new subscriptions after unsubscribe', () => {
      subscribeToUpdates('dashboard');
      unsubscribe();
      
      expect(() => subscribeToUpdates('dashboard')).not.toThrow();
    });
  });
});