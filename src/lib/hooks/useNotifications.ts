'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

// ============================================================
// TYPES
// ============================================================

export type NotificationType = 'ritual' | 'odu' | 'moon' | 'energy';

export interface SpiritualNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  metadata?: {
    ritualId?: string;
    orixa?: string;
    moonPhase?: string;
    energy?: string;
    actionUrl?: string;
  };
}

export interface UseNotificationsOptions {
  userId?: string;
  autoGenerateMorning?: boolean;
  morningHour?: number;
  maxNotifications?: number;
}

export interface UseNotificationsReturn {
  notifications: SpiritualNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  snoozeNotification: (id: string, minutes: number) => void;
  completeRitual: (ritualId: string) => void;
  dismissNotification: (id: string) => void;
  refreshNotifications: () => void;
}

// ============================================================
// CONSTANTS
// ============================================================

const STORAGE_KEY = 'cabala_spiritual_notifications';

// Orixá by day of week (0 = Sunday)
const ORIXA_BY_DAY: Record<number, { name: string; rituals: string[]; color: string }> = {
  0: { name: 'Iemanjá', rituals: ['Oferecer flores brancas', 'Banho de sal'], color: '#4FC3F7' },
  1: { name: 'Iemanjá', rituals: ['Rezar o terço', 'Agradecer pela semana'], color: '#4FC3F7' },
  2: { name: 'Ogum/Xangô', rituals: ['Lutar por seus objetivos', 'Pé de obi'], color: '#F44336' },
  3: { name: 'Xangô', rituals: ['Meditar sobre a justiça', 'Acender vela marrom'], color: '#FF9800' },
  4: { name: 'Oxóssi', rituals: ['Pedir prosperidade', 'Fazer uma oferenda'], color: '#4CAF50' },
  5: { name: 'Oxalá', rituals: ['Paz e reconciliação', 'Rogar graças'], color: '#FFFFFF' },
  6: { name: 'Oxum', rituals: ['Banho de água e mel', 'Amar-se'], color: '#FFD54F' },
};

// Moon phase names and spiritual meanings
const MOON_PHASES: Record<string, { name: string; meaning: string; recommendation: string }> = {
  new: { name: 'Lua Nova', meaning: 'Novos começos e renovações', recommendation: 'Ideal para novos projetos e intenções' },
  waxing: { name: 'Lua Crescente', meaning: 'Crescimento e acumulação', recommendation: 'Período para fortalecer objetivos' },
  firstQuarter: { name: 'Lua Quarto Crescente', meaning: 'Ação e determinação', recommendation: 'Momento para agir com firmeza' },
  waxingGibbous: { name: 'Gibosa Crescente', meaning: 'Refinamento e ajuste', recommendation: 'Aprimore seus planos com cuidado' },
  full: { name: 'Lua Cheia', meaning: 'Culminação e manifestação', recommendation: 'Ritual de manifestação recomendado' },
  waningGibbous: { name: 'Gibosa Minguante', meaning: 'Gratidão e avaliação', recommendation: 'Agradeça e revise o que alcançou' },
  lastQuarter: { name: 'Lua Quarto Minguante', meaning: 'Perdão e liberação', recommendation: 'Libere o que não serve mais' },
  waning: { name: 'Lua Minguante', meaning: 'Desintoxicação e limpeza', recommendation: 'Ebós de limpeza energética recomendados' },
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getMoonPhase(date: Date): string {
  const knownNewMoon = new Date(2000, 0, 6).getTime();
  const lunarCycle = 29.53058867 * 24 * 60 * 60 * 1000;
  const daysSinceKnown = date.getTime() - knownNewMoon;
  const lunarAge = ((daysSinceKnown % lunarCycle) + lunarCycle) % lunarCycle;
  const phaseIndex = (lunarAge / lunarCycle) * 8;
  if (phaseIndex < 0.5) return 'new';
  if (phaseIndex < 1.5) return 'waxing';
  if (phaseIndex < 2.5) return 'firstQuarter';
  if (phaseIndex < 3.5) return 'waxingGibbous';
  if (phaseIndex < 4.5) return 'full';
  if (phaseIndex < 5.5) return 'waningGibbous';
  if (phaseIndex < 6.5) return 'lastQuarter';
  if (phaseIndex < 7.5) return 'waning';
  return 'new';
}

function getDaysUntilNextPhase(currentPhase: string): number {
  const phaseOrder = ['new', 'waxing', 'firstQuarter', 'waxingGibbous', 'full', 'waningGibbous', 'lastQuarter', 'waning'];
  const currentIndex = phaseOrder.indexOf(currentPhase);
  const daysPerPhase = 29.53058867 / 8;
  const phasesUntilFull = (4 - currentIndex + 8) % 8;
  return Math.ceil(phasesUntilFull * daysPerPhase);
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Agora';
  if (minutes < 60) return `${minutes}m atrás`;
  if (hours < 24) return `${hours}h atrás`;
  if (days === 1) return 'Ontem';
  return `${days} dias`;
}

function loadFromStorage(): SpiritualNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveToStorage(notifications: SpiritualNotification[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch (e) {
    console.error('Failed to save notifications:', e);
  }
}

// ============================================================
// NOTIFICATION GENERATORS
// ============================================================

function generateOrixaNotification(today: Date): SpiritualNotification | null {
  const dayOfWeek = today.getDay();
  const orixa = ORIXA_BY_DAY[dayOfWeek];
  if (!orixa) return null;

  const ritual = orixa.rituals[Math.floor(Math.random() * orixa.rituals.length)];
  
  return {
    id: generateId(),
    type: 'ritual',
    title: `Dia de ${orixa.name}`,
    message: ritual,
    timestamp: today.getTime(),
    read: false,
    metadata: {
      orixa: orixa.name,
      ritualId: `ritual-${dayOfWeek}`,
    },
  };
}

function generateMoonPhaseNotification(today: Date): SpiritualNotification | null {
  const phase = getMoonPhase(today);
  const phaseInfo = MOON_PHASES[phase];
  if (!phaseInfo) return null;

  const daysUntil = getDaysUntilNextPhase(phase);
  
  return {
    id: generateId(),
    type: 'moon',
    title: `${phaseInfo.name} ✨`,
    message: daysUntil === 0 
      ? `Hoje é ${phaseInfo.name}. ${phaseInfo.recommendation}`
      : `${phaseInfo.name} em ${daysUntil} dias. ${phaseInfo.meaning}`,
    timestamp: today.getTime(),
    read: false,
    metadata: {
      moonPhase: phase,
    },
  };
}

function generateEnergyAlertNotification(today: Date): SpiritualNotification | null {
  const hour = today.getHours();
  let energyType: string;
  let message: string;

  if (hour >= 5 && hour < 9) {
    energyType = 'purificação';
    message = 'Energia de purificação matinal. Ideal para meditação e orações.';
  } else if (hour >= 9 && hour < 12) {
    energyType = 'ação';
    message = 'Período de alta energia. Momento propício para trabalho espiritual.';
  } else if (hour >= 12 && hour < 15) {
    energyType = 'nutrição';
    message = 'Momento de nutrição espiritual. Cuide de sua energia.';
  } else if (hour >= 15 && hour < 18) {
    energyType = 'reflexão';
    message = 'Período de reflexão. Reveja suas ações do dia.';
  } else if (hour >= 18 && hour < 21) {
    energyType = 'proteção';
    message = 'Energia de proteção. Respire fundo e limpe sua aura.';
  } else {
    energyType = 'descanso';
    message = 'Momento de descanso espiritual. Agradeça pelo dia.';
  }

  return {
    id: generateId(),
    type: 'energy',
    title: `Energia de ${energyType}`,
    message,
    timestamp: today.getTime(),
    read: false,
    metadata: {
      energy: energyType,
    },
  };
}

function generateMorningNotification(today: Date): SpiritualNotification {
  const dayOfWeek = today.getDay();
  const orixa = ORIXA_BY_DAY[dayOfWeek];
  const phase = getMoonPhase(today);
  const phaseInfo = MOON_PHASES[phase];

  const orixaMsg = orixa ? `Hoje é dia de ${orixa.name}.` : '';
  const moonMsg = phaseInfo ? ` ${phaseInfo.name} traz ${phaseInfo.meaning.toLowerCase()}.` : '';

  return {
    id: generateId(),
    type: 'ritual',
    title: '☀️ Bom dia, buscadores da luz!',
    message: `${orixaMsg}${moonMsg} Que este dia seja abençoado!`,
    timestamp: today.getTime(),
    read: false,
    metadata: {
      orixa: orixa?.name,
      moonPhase: phase,
    },
  };
}

function generateOduUpdateNotification(today: Date): SpiritualNotification | null {
  // Simulate Odu update based on day
  const oduMessages = [
    { name: 'Ogbe', message: 'Ogbe traz alegria e sabedoria. Agradeça pelos conhecimentos recebidos.' },
    { name: 'Oyeku', message: 'Oyeku indica transformação. Aceite as mudanças com serenidade.' },
    { name: 'Iwori', message: 'Iwori traz desafios superáveis. Mantenha a fé inabalável.' },
    { name: 'Odi', message: 'Odi representa o destino. Siga seu caminho com coragem.' },
    { name: 'Osheyonle', message: 'Osheyonle traz prosperidade. Aproxime-se do sagrado.' },
  ];

  // Use day as seed for consistent daily message
  const dayIndex = today.getDate() % oduMessages.length;
  const odu = oduMessages[dayIndex];

  return {
    id: generateId(),
    type: 'odu',
    title: `Odu do Dia: ${odu.name}`,
    message: odu.message,
    timestamp: today.getTime(),
    read: false,
    metadata: {
      orixa: odu.name,
    },
  };
}

// ============================================================
// MAIN HOOK
// ============================================================
export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
 const {
   autoGenerateMorning = true,
   morningHour = 6,
   maxNotifications = 50,
 } = options;

  const [notifications, setNotifications] = useState<SpiritualNotification[]>([]);
  const [lastGenerationDate, setLastGenerationDate] = useState<string | null>(null);

  // Load from storage on mount
  useEffect(() => {
    const stored = loadFromStorage();
    setNotifications(stored);
    
    // Track last generation date
    if (stored.length > 0) {
      const dates = stored.map(n => new Date(n.timestamp).toDateString());
      setLastGenerationDate(dates[0]);
    }
  }, []);

  // Generate daily notifications
  const generateDailyNotifications = useCallback(() => {
    const today = new Date();
    const todayStr = today.toDateString();

    // Only generate once per day
    if (lastGenerationDate === todayStr) {
      return;
    }

    const newNotifications: SpiritualNotification[] = [];

    // Morning greeting
    if (autoGenerateMorning && today.getHours() >= morningHour) {
      newNotifications.push(generateMorningNotification(today));
    }

    // Today's Orixá ritual
    const orixaNotif = generateOrixaNotification(today);
    if (orixaNotif) newNotifications.push(orixaNotif);

    // Moon phase
    const moonNotif = generateMoonPhaseNotification(today);
    if (moonNotif) newNotifications.push(moonNotif);

    // Energy alert
    const energyNotif = generateEnergyAlertNotification(today);
    if (energyNotif) newNotifications.push(energyNotif);

    // Odu update
    const oduNotif = generateOduUpdateNotification(today);
    if (oduNotif) newNotifications.push(oduNotif);

    if (newNotifications.length > 0) {
      setNotifications(prev => {
        const updated = [...newNotifications, ...prev];
        const limited = updated.slice(0, maxNotifications);
        saveToStorage(limited);
        return limited;
      });
      setLastGenerationDate(todayStr);
    }
  }, [autoGenerateMorning, morningHour, maxNotifications, lastGenerationDate]);

  // Generate on mount and periodically
  useEffect(() => {
    generateDailyNotifications();
    
    // Check every hour for day change
    const interval = setInterval(() => {
      generateDailyNotifications();
    }, 3600000);

    return () => clearInterval(interval);
  }, [generateDailyNotifications]);

  // Mark as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      saveToStorage(updated);
      return updated;
    });
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveToStorage(updated);
      return updated;
    });
  }, []);

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    saveToStorage([]);
  }, []);

  // Snooze notification
  const snoozeNotification = useCallback((id: string, minutes: number) => {
    const snoozeTime = Date.now() + minutes * 60000;
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === id 
          ? { ...n, timestamp: snoozeTime, read: true }
          : n
      );
      saveToStorage(updated);
      return updated;
    });
  }, []);

  // Complete ritual (mark as done and optionally remove)
  const completeRitual = useCallback((ritualId: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.metadata?.ritualId === ritualId 
          ? { ...n, read: true }
          : n
      );
      saveToStorage(updated);
      return updated;
    });
  }, []);

  // Dismiss notification (same as remove)
  const dismissNotification = useCallback((id: string) => {
    removeNotification(id);
  }, [removeNotification]);

  // Manual refresh
  const refreshNotifications = useCallback(() => {
    generateDailyNotifications();
  }, [generateDailyNotifications]);

  // Computed values
  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length,
    [notifications]
  );

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    snoozeNotification,
    completeRitual,
    dismissNotification,
    refreshNotifications,
  };
}

// Export helpers for external use
export { getMoonPhase, formatRelativeTime, generateId };
