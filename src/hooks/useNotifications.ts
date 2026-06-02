// fallow-ignore-file unused-file
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Types
export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  metadata?: Record<string, unknown>;
}
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
export interface NotificationState {
  notifications: Notification[];
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  error: string | null;
  clearNotifications: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  reconnect: () => void;
}
interface UseNotificationsOptions {
  /** SSE endpoint URL */
  sseUrl?: string;
  wsUrl?: string;
  pollingInterval?: number;
  /** Enable SSE (default true) */
  enableSSE?: boolean;
  /** Enable WebSocket (default true) */
  enableWS?: boolean;
  /** Enable polling fallback (default true) */
  enablePolling?: boolean;
  /** Maximum notifications to keep in state */
  maxNotifications?: number;
  /** Auto-reconnect on disconnect (default true) */
  autoReconnect?: boolean;
  /** Reconnect delay in ms (default 5000) */
  reconnectDelay?: number;
  /** Headers for SSE/WS connections */
  headers?: Record<string, string>;
  /** On new notification callback */
  onNotification?: (notification: Notification) => void;
}
// SSE connection handler

// SSE connection handler
function createSSEConnection(
  url: string,
  headers: Record<string, string>,
  onMessage: (data: Notification) => void,
  onStatusChange: (connected: boolean) => void,
  onError: (error: string) => void
): { eventSource: EventSource | null; close: () => void } {
  if (typeof window === 'undefined') {
    return { eventSource: null, close: () => {} };
  }

  const eventSource = new EventSource(url, { withCredentials: true });

  eventSource.onopen = () => {
    onStatusChange(true);
  };

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as Notification;
      onMessage(data);
    } catch {
      onError('Failed to parse SSE message');
    }
  };

  eventSource.onerror = () => {
    onStatusChange(false);
    onError('SSE connection error');
    eventSource.close();
  };

  return {
    eventSource,
    close: () => eventSource.close(),
  };
}

// WebSocket connection handler
function createWSConnection(
  url: string,
  headers: Record<string, string>,
  onMessage: (data: Notification) => void,
  onStatusChange: (connected: boolean) => void,
  onError: (error: string) => void
): { webSocket: WebSocket | null; close: () => void } {
  if (typeof window === 'undefined') {
    return { webSocket: null, close: () => {} };
  }

  const webSocket = new WebSocket(url);

  webSocket.onopen = () => {
    onStatusChange(true);
    // Send auth headers after connection if needed
    if (Object.keys(headers).length > 0) {
      webSocket.send(JSON.stringify({ type: 'auth', headers }));
    }
  };

  webSocket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as Notification;
      if (data && data.id) {
        onMessage(data);
      }
    } catch {
      onError('Failed to parse WebSocket message');
    }
  };

  webSocket.onerror = () => {
    onStatusChange(false);
    onError('WebSocket connection error');
  };

  webSocket.onclose = () => {
    onStatusChange(false);
  };

  return {
    webSocket,
    close: () => webSocket.close(),
  };
}

export function useNotifications(options: UseNotificationsOptions = {}): NotificationState {
  const {
    sseUrl,
    wsUrl,
    pollingInterval = 30000,
    enableSSE = true,
    enableWS = true,
    enablePolling = true,
    maxNotifications = 100,
    autoReconnect = true,
    reconnectDelay = 5000,
    headers = {},
    onNotification,
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => {
      const updated = [notification, ...prev];
      // Deduplicate by ID and limit max count
      const seen = new Set<string>();
      const deduped = updated.filter((n) => {
        if (seen.has(n.id)) return false;
        seen.add(n.id);
        return true;
      });
      return deduped.slice(0, maxNotifications);
    });
    onNotification?.(notification);
  }, [maxNotifications, onNotification]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Polling fallback
  const startPolling = useCallback(async () => {
    if (!sseUrl || !enablePolling) return;

    const fetchNotifications = async () => {
      try {
        const response = await fetch(sseUrl, { headers });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            data.forEach((n) => addNotification(n as Notification));
          }
          setConnectionStatus('connected');
          setError(null);
        }
      } catch (err) {
        setError('Polling fetch failed');
        setConnectionStatus('error');
      }
    };

    // Initial fetch
    await fetchNotifications();

    // Set up interval
    pollingIntervalRef.current = setInterval(fetchNotifications, pollingInterval);
  }, [sseUrl, enablePolling, headers, pollingInterval, addNotification]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Start connection (SSE or WebSocket)
// fallow-ignore-next-line complexity
  const startConnection = useCallback(() => {
    if (!isMountedRef.current) return;

    setConnectionStatus('connecting');
    setError(null);

    // Try SSE first if enabled
    if (enableSSE && sseUrl) {
      const { eventSource, close } = createSSEConnection(
        sseUrl,
        headers,
        addNotification,
        (connected) => {
          if (isMountedRef.current) {
            setConnectionStatus(connected ? 'connected' : 'disconnected');
          }
        },
        (err) => {
          if (isMountedRef.current) {
            setError(err);
            // Fallback to polling if SSE fails
            if (enablePolling && !webSocketRef.current) {
              startPolling();
            }
          }
        }
      );

      eventSourceRef.current = eventSource;
      return; // SSE is preferred
    }

    // Try WebSocket if SSE not available but WS is
    if (enableWS && wsUrl) {
      const { webSocket, close } = createWSConnection(
        wsUrl,
        headers,
        addNotification,
        (connected) => {
          if (isMountedRef.current) {
            setConnectionStatus(connected ? 'connected' : 'disconnected');
          }
        },
        (err) => {
          if (isMountedRef.current) {
            setError(err);
            // Fallback to polling if WS fails
            if (enablePolling && !eventSourceRef.current) {
              startPolling();
            }
          }
        }
      );

      webSocketRef.current = webSocket;
      return;
    }

    // Fallback to polling if no real-time connection available
    if (enablePolling && sseUrl) {
      startPolling();
    } else {
      setConnectionStatus('disconnected');
      setError('No notification endpoint configured');
    }
  }, [enableSSE, enableWS, enablePolling, sseUrl, wsUrl, headers, addNotification, startPolling]);

  // Stop all connections
  const stopConnection = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (webSocketRef.current) {
      webSocketRef.current.close();
      webSocketRef.current = null;
    }
    stopPolling();
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setConnectionStatus('disconnected');
  }, [stopPolling]);

  // Reconnect logic
  const reconnect = useCallback(() => {
    if (!isMountedRef.current || !autoReconnect) return;

    stopConnection();
    reconnectTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        startConnection();
      }
    }, reconnectDelay);
  }, [autoReconnect, reconnectDelay, startConnection, stopConnection]);

  // Handle connection close - attempt reconnect
  useEffect(() => {
    const handleDisconnect = () => {
      if (isMountedRef.current && autoReconnect && connectionStatus === 'disconnected') {
        reconnect();
      }
    };

    // Monitor connection status
    if (connectionStatus === 'disconnected' || connectionStatus === 'error') {
      handleDisconnect();
    }
  }, [connectionStatus, autoReconnect, reconnect]);

  // Main connection effect
  useEffect(() => {
    isMountedRef.current = true;
    startConnection();

    return () => {
      isMountedRef.current = false;
      stopConnection();
    };
  }, [startConnection, stopConnection]);

  // Manual reconnect function for external use
  const manualReconnect = useCallback(() => {
    reconnect();
  }, [reconnect]);

  return {
    notifications,
    isConnected: connectionStatus === 'connected',
    connectionStatus,
    error,
    clearNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    reconnect: manualReconnect,
  };
}