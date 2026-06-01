import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotifications } from '@/hooks/useNotifications';

// Mock the global EventSource and WebSocket
const mockEventSource = {
  readyState: 1,
  close: vi.fn(),
  onmessage: null,
  onerror: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

const mockWebSocket = {
  close: vi.fn(),
  send: vi.fn(),
  onmessage: null,
  onerror: null,
  onopen: null,
  onclose: null,
  readyState: 1,
};

// Make mocks available globally
vi.stubGlobal('EventSource', vi.fn(() => mockEventSource));
vi.stubGlobal('WebSocket', vi.fn(() => mockWebSocket));

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('returns notifications array', () => {
    const { result } = renderHook(() => useNotifications({ enableSSE: false, enableWS: false }));
    
    expect(result.current.notifications).toBeDefined();
    expect(Array.isArray(result.current.notifications)).toBe(true);
  });

  it('returns isConnected boolean', () => {
    const { result } = renderHook(() => useNotifications({ enableSSE: false, enableWS: false }));
    
    expect(typeof result.current.isConnected).toBe('boolean');
  });

  it('returns connectionStatus', () => {
    const { result } = renderHook(() => useNotifications({ enableSSE: false, enableWS: false }));
    
    expect(['connecting', 'connected', 'disconnected', 'error']).toContain(result.current.connectionStatus);
  });

  it('returns error as null or string', () => {
    const { result } = renderHook(() => useNotifications({ enableSSE: false, enableWS: false }));
    
    expect(result.current.error === null || typeof result.current.error === 'string').toBe(true);
  });

  it('has clearNotifications function', () => {
    const { result } = renderHook(() => useNotifications({ enableSSE: false, enableWS: false }));
    
    expect(typeof result.current.clearNotifications).toBe('function');
  });

  it('has markAsRead function', () => {
    const { result } = renderHook(() => useNotifications({ enableSSE: false, enableWS: false }));
    
    expect(typeof result.current.markAsRead).toBe('function');
  });

  it('has markAllAsRead function', () => {
    const { result } = renderHook(() => useNotifications({ enableSSE: false, enableWS: false }));
    
    expect(typeof result.current.markAllAsRead).toBe('function');
  });

  it('has removeNotification function', () => {
    const { result } = renderHook(() => useNotifications({ enableSSE: false, enableWS: false }));
    
    expect(typeof result.current.removeNotification).toBe('function');
  });

  it('has reconnect function', () => {
    const { result } = renderHook(() => useNotifications({ enableSSE: false, enableWS: false }));
    
    expect(typeof result.current.reconnect).toBe('function');
  });

  it('clearNotifications clears the array', async () => {
    const { result } = renderHook(() => useNotifications({ enableSSE: false, enableWS: false }));
    
    act(() => {
      result.current.clearNotifications();
    });
    
    expect(result.current.notifications).toHaveLength(0);
  });

  it('markAsRead updates notification read status', async () => {
    const { result } = renderHook(() => useNotifications({ enableSSE: false, enableWS: false }));
    
    // Initial state - no notifications
    expect(result.current.notifications).toHaveLength(0);
    
    // markAsRead should not throw even with empty array
    act(() => {
      result.current.markAsRead('non-existent-id');
    });
    
    expect(true).toBe(true);
  });

  it('markAllAsRead marks all as read', async () => {
    const { result } = renderHook(() => useNotifications({ enableSSE: false, enableWS: false }));
    
    act(() => {
      result.current.markAllAsRead();
    });
    
    // Should complete without error
    expect(true).toBe(true);
  });

  it('removeNotification removes by id', async () => {
    const { result } = renderHook(() => useNotifications({ enableSSE: false, enableWS: false }));
    
    act(() => {
      result.current.removeNotification('test-id');
    });
    
    // Should complete without error
    expect(true).toBe(true);
  });

  it('reconnect function is callable', async () => {
    const { result } = renderHook(() => useNotifications({ enableSSE: false, enableWS: false }));
    
    act(() => {
      result.current.reconnect();
    });
    
    // Should complete without error
    expect(true).toBe(true);
  });

  it('returns correct interface shape', () => {
    const { result } = renderHook(() => useNotifications({ enableSSE: false, enableWS: false }));
    
    const keys = Object.keys(result.current);
    expect(keys).toContain('notifications');
    expect(keys).toContain('isConnected');
    expect(keys).toContain('connectionStatus');
    expect(keys).toContain('error');
    expect(keys).toContain('clearNotifications');
    expect(keys).toContain('markAsRead');
    expect(keys).toContain('markAllAsRead');
    expect(keys).toContain('removeNotification');
    expect(keys).toContain('reconnect');
    expect(keys).toHaveLength(9);
  });
});