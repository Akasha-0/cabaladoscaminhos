// @ts-nocheck
// SKIP_LINT

/**
 * Dashboard Data Module
 * Spiritual dashboard data for Ifá practice tracking and insights
 */

export interface DashboardStats {
  totalRituals: number;
  totalPractices: number;
  currentStreak: number;
  longestStreak: number;
  lastActivity: string;
}

export interface DailyInsight {
  day: string;
  orixa: string;
  energia: string;
  affirmation: string;
  ritual: string;
  caution: string;
}

export interface OrixaProgress {
  orixa: string;
  name: string;
  level: number;
  rituals: number;
  lastRitual: string;
}

export interface MoonPhase {
  name: string;
  date: string;
  energy: string;
  recommended: string[];
  avoided: string[];
}

export interface DashboardData {
  stats: DashboardStats;
  dailyInsight: DailyInsight;
  orixaProgress: OrixaProgress[];
  moonPhase: MoonPhase;
  recentActivity: ActivityItem[];
  upcomingPractices: PracticeItem[];
}

export interface ActivityItem {
  id: string;
  type: string;
  name: string;
  orixa: string;
  date: string;
  duration?: string;
}

export interface PracticeItem {
  id: string;
  name: string;
  orixa: string;
  scheduledDate: string;
  category: string;
}

const DASHBOARD_DATA: DashboardData = {
  stats: {
    totalRituals: 47,
    totalPractices: 128,
    currentStreak: 12,
    longestStreak: 28,
    lastActivity: "2026-05-28"
  },
  dailyInsight: {
    day: "Sexta-feira",
    orixa: "Oxum",
    energia: "Amor e Abundância",
    affirmation: "Eu fluo com a graça de Oxum, atraindo prosperidade e harmonia em minha vida",
    ritual: "Oferecimento de mel e água doce",
    caution: "Evite conflitos emocionais neste dia"
  },
  orixaProgress: [
    { orixa: "ogum", name: "Ogum", level: 5, rituals: 15, lastRitual: "2026-05-25" },
    { orixa: "oxossi", name: "Oxossi", level: 4, rituals: 12, lastRitual: "2026-05-22" },
    { orixa: "oxum", name: "Oxum", level: 3, rituals: 8, lastRitual: "2026-05-28" },
    { orixa: "obatala", name: "Obatalá", level: 3, rituals: 7, lastRitual: "2026-05-20" },
    { orixa: "shango", name: "Xangô", level: 2, rituals: 5, lastRitual: "2026-05-18" },
    { orixa: "loguned", name: "Logunedé", level: 1, rituals: 2, lastRitual: "2026-05-15" }
  ],
  moonPhase: {
    name: "Lua Crescente",
    date: "2026-05-29",
    energy: "Expansão e Manifestação",
    recommended: [
      "Rituais de prosperidade",
      "Práticas de cura emocional",
      "Trabalho com Oxum e Oshun"
    ],
    avoided: [
      "Confrontos diretos",
      "Decisões financeiras importantes",
      "Trabalho com Ogun sem proteção"
    ]
  },
  recentActivity: [
    { id: "act-1", type: "ritual", name: "Itutura - Purificação Sagrada", orixa: "Olodumare", date: "2026-05-28", duration: "45 min" },
    { id: "act-2", type: "practice", name: "Meditação de Oxum", orixa: "Oxum", date: "2026-05-28", duration: "20 min" },
    { id: "act-3", type: "ritual", name: "Ogun Fe", orixa: "Ogum", date: "2026-05-27", duration: "60 min" },
    { id: "act-5", type: "practice", name: "Reiki Ancestral", orixa: "Omolu", date: "2026-05-26", duration: "30 min" }
  ],
  upcomingPractices: [
    { id: "up-1", name: "Ritual de Oxum - Dia de Abundância", orixa: "Oxum", scheduledDate: "2026-05-30", category: "ritual" },
    { id: "up-2", name: "Xangô - Justiça e Força", orixa: "Xangô", scheduledDate: "2026-06-01", category: "ritual" },
    { id: "up-3", name: "Obi - Lançamento de Opele", orixa: "Orunmila", scheduledDate: "2026-06-02", category: "divination" },
    { id: "up-4", name: "Omolu - Cura e Saúde", orixa: "Omolu", scheduledDate: "2026-06-03", category: "healing" },
    { id: "up-5", name: "Oxossi - Caça Espiritual", orixa: "Oxossi", scheduledDate: "2026-06-04", category: "ritual" }
  ]
};

export function getData(): DashboardData {
  return DASHBOARD_DATA;
}

function getStats(): DashboardStats {
  return DASHBOARD_DATA.stats;
}

function getDailyInsight(): DailyInsight {
  return DASHBOARD_DATA.dailyInsight;
}

function getOrixaProgress(): OrixaProgress[] {
  return DASHBOARD_DATA.orixaProgress;
}

function getMoonPhase(): MoonPhase {
  return DASHBOARD_DATA.moonPhase;
}

function getRecentActivity(): ActivityItem[] {
  return DASHBOARD_DATA.recentActivity;
}

function getUpcomingPractices(): PracticeItem[] {
  return DASHBOARD_DATA.upcomingPractices;
}
