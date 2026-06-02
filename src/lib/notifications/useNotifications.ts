// Notifications hook for dashboard
import { useState, useEffect } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: number;
  type?: 'info' | 'warning' | 'success' | 'error';
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const clearAll = () => setNotifications([]);

  return { notifications, markAsRead, clearAll };
}