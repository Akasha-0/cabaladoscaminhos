"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Flame,
  TrendingUp,
  Calendar,
  Award,
  Target,
  Zap,
} from "lucide-react";

/**
 * ProgressTracker Component
 * Shows spiritual practice streaks, weekly/monthly progress, and completed practices
 */

interface ProgressStats {
  currentStreak: number;
  longestStreak: number;
  weeklyCompleted: number;
  weeklyTotal: number;
  monthlyCompleted: number;
  monthlyTotal: number;
  totalPractices: number;
}

interface PracticeDay {
  date: string;
  completed: boolean;
  practicesCount: number;
}

export interface ProgressTrackerProps {
  className?: string;
  userId?: string;
}

type LoadingState = "idle" | "loading" | "loaded" | "error";

const STORAGE_KEY = "cabala_progress_tracker";
const MAX_DAYS = 90;

const WEEKLY_GOAL = 21;
const MONTHLY_GOAL = 90;

const STREAK_MESSAGES: Record<number, string> = {
  0: "Comece sua jornada hoje!",
  1: "Primeiro passo dado!",
  7: "Uma semana de prática!",
  14: "Duas semanas de dedicação!",
  21: "Três semanas de luz!",
  30: "Um mês de transformação!",
  60: "Dois meses de evolução!",
  90: "Três meses de mestria!",
};

function getDateString(date: Date = new Date()): string {
  return date.toISOString().split("T")[0];
}

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function loadProgressData(userId: string): PracticeDay[] {
  if (typeof window === "undefined") return [];
  try {
    const storageKey = `${STORAGE_KEY}-${userId}`;
    const stored = localStorage.getItem(storageKey);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveProgressData(userId: string, data: PracticeDay[]): void {
  if (typeof window === "undefined") return;
  try {
    const storageKey = `${STORAGE_KEY}-${userId}`;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - MAX_DAYS);
    const cutoffStr = getDateString(cutoffDate);
    const pruned = data.filter((d) => d.date >= cutoffStr);
    localStorage.setItem(storageKey, JSON.stringify(pruned));
  } catch {
    // Storage unavailable
  }
}

function calculateStats(practices: PracticeDay[]): ProgressStats {
  const sorted = [...practices].sort((a, b) => b.date.localeCompare(a.date));
  const today = getDateString();
  const todayDate = new Date();

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const practice of sorted) {
    if (!practice.completed) {
      if (tempStreak > longestStreak) longestStreak = tempStreak;
      tempStreak = 0;
      prevDate = null;
      continue;
    }

    const currDate = new Date(practice.date);
    if (!prevDate) {
      if (practice.date === today) {
        currentStreak = 1;
        tempStreak = 1;
      }
    } else {
      const diffDays = Math.round(
        (prevDate.getTime() - currDate.getTime()) / 86400000
      );
      if (diffDays === 1) {
        tempStreak++;
        if (currentStreak > 0) currentStreak++;
      } else {
        if (tempStreak > longestStreak) longestStreak = tempStreak;
        tempStreak = 1;
      }
    }
    prevDate = currDate;
  }

  if (tempStreak > longestStreak) longestStreak = tempStreak;

  const weekStart = new Date(todayDate);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStartStr = getDateString(weekStart);
  const weeklyCompleted = practices.filter(
    (p) => p.date >= weekStartStr && p.completed
  ).length;

  const monthStart = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
  const monthStartStr = getDateString(monthStart);
  const monthlyCompleted = practices.filter(
    (p) => p.date >= monthStartStr && p.completed
  ).length;

  const totalPractices = practices.filter((p) => p.completed).length;

  return {
    currentStreak,
    longestStreak,
    weeklyCompleted,
    weeklyTotal: WEEKLY_GOAL,
    monthlyCompleted,
    monthlyTotal: MONTHLY_GOAL,
    totalPractices,
  };
}

function getStreakMessage(streak: number): string {
  if (streak >= 90) return STREAK_MESSAGES[90];
  if (streak >= 60) return STREAK_MESSAGES[60];
  if (streak >= 30) return STREAK_MESSAGES[30];
  if (streak >= 21) return STREAK_MESSAGES[21];
  if (streak >= 14) return STREAK_MESSAGES[14];
  if (streak >= 7) return STREAK_MESSAGES[7];
  if (streak >= 1) return STREAK_MESSAGES[1];
  return STREAK_MESSAGES[0];
}

// Sub-components

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  bgColor?: string;
  children?: React.ReactNode;
}

function CircularProgress({
  progress,
  size = 100,
  strokeWidth = 8,
  color,
  bgColor = "rgba(30, 41, 59, 0.5)",
  children,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  subtext?: string;
  color: string;
}

function StatCard({ icon, label, value, subtext, color }: StatCardProps) {
  return (
    <div className="flex flex-col items-center p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/60 hover:border-slate-600/50 transition-all duration-300">
      <div className="mb-2" style={{ color }}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-slate-100">{value}</div>
      <div className="text-sm text-slate-400 text-center">{label}</div>
      {subtext && (
        <div className="text-xs text-slate-500 mt-1">{subtext}</div>
      )}
    </div>
  );
}

interface ProgressBarProps {
  current: number;
  total: number;
  color: string;
  label: string;
}

function ProgressBar({ current, total, color, label }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300">
          {current}/{total}
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-700/50 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

interface WeeklyGridProps {
  practices: PracticeDay[];
}

function WeeklyGrid({ practices }: WeeklyGridProps) {
  const today = new Date();
  const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

  return (
    <div className="flex justify-between gap-1">
      {weekDays.map((day, index) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - index));
        const dateStr = getDateString(date);
        const practice = practices.find((p) => p.date === dateStr);
        const isToday = dateStr === getDateString();
        const isCompleted = practice?.completed ?? false;

        return (
          <div key={index} className="flex flex-col items-center gap-1">
            <span className="text-xs text-slate-500">{day}</span>
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                isCompleted
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-slate-800/50 text-slate-500 border border-slate-700/30",
                isToday && "ring-2 ring-amber-500/50"
              )}
            >
              {date.getDate()}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface LoadingSkeletonProps {}

function LoadingSkeleton({}: LoadingSkeletonProps) {
  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-center">
        <div className="w-24 h-24 rounded-full bg-slate-700 animate-pulse" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-slate-700 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

// Main Component

export function ProgressTracker({
  className = "",
  userId = "default",
}: ProgressTrackerProps) {
  const [loading, setLoading] = React.useState<LoadingState>("loading");
  const [stats, setStats] = React.useState<ProgressStats>({
    currentStreak: 0,
    longestStreak: 0,
    weeklyCompleted: 0,
    weeklyTotal: WEEKLY_GOAL,
    monthlyCompleted: 0,
    monthlyTotal: MONTHLY_GOAL,
    totalPractices: 0,
  });
  const [practices, setPractices] = React.useState<PracticeDay[]>([]);

  React.useEffect(() => {
    const loadData = () => {
      setLoading("loading");
      const stored = loadProgressData(userId);
      const calculatedStats = calculateStats(stored);
      setStats(calculatedStats);
      setPractices(stored);
      setLoading("loaded");
    };
    loadData();
  }, [userId]);

  const markTodayComplete = React.useCallback(() => {
    const today = getDateString();
    setPractices((prev) => {
      const existing = prev.find((p) => p.date === today);
      let updated: PracticeDay[];
      if (existing) {
        updated = prev.map((p) =>
          p.date === today ? { ...p, completed: true, practicesCount: p.practicesCount + 1 } : p
        );
      } else {
        updated = [...prev, { date: today, completed: true, practicesCount: 1 }];
      }
      saveProgressData(userId, updated);
      setStats(calculateStats(updated));
      return updated;
    });
  }, [userId]);

  const weeklyProgress = Math.round((stats.weeklyCompleted / stats.weeklyTotal) * 100);
  const monthlyProgress = Math.round((stats.monthlyCompleted / stats.monthlyTotal) * 100);
  const streakProgress = Math.min((stats.currentStreak / 30) * 100, 100);

  const getStreakColor = (streak: number): string => {
    if (streak >= 30) return "#fbbf24";
    if (streak >= 14) return "#f97316";
    if (streak >= 7) return "#fb923c";
    return "#a855f7";
  };

  return (
    <Card
      className={cn(
        "overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300",
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-purple-300">
          <Award className="w-5 h-5" />
          Acompanhamento Espiritual
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading === "loading" ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* Streak Section */}
            <div className="flex flex-col items-center">
              <CircularProgress
                progress={streakProgress}
                size={120}
                strokeWidth={10}
                color={getStreakColor(stats.currentStreak)}
              >
                <div className="flex flex-col items-center">
                  <Flame
                    className="w-8 h-8 mb-1"
                    style={{ color: getStreakColor(stats.currentStreak) }}
                  />
                  <span className="text-2xl font-bold text-slate-100">
                    {stats.currentStreak}
                  </span>
                  <span className="text-xs text-slate-400">dias</span>
                </div>
              </CircularProgress>
              <p className="mt-3 text-sm text-slate-400 italic text-center">
                "{getStreakMessage(stats.currentStreak)}"
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard
                icon={<TrendingUp className="w-5 h-5" />}
                label="Melhor Sequência"
                value={stats.longestStreak}
                subtext="dias"
                color="#f59e0b"
              />
              <StatCard
                icon={<Calendar className="w-5 h-5" />}
                label="Total"
                value={stats.totalPractices}
                subtext="práticas"
                color="#06b6d4"
              />
              <StatCard
                icon={<Target className="w-5 h-5" />}
                label="Mês"
                value={stats.monthlyCompleted}
                subtext="práticas"
                color="#10b981"
              />
            </div>

            {/* Progress Bars */}
            <div className="space-y-3">
              <ProgressBar
                current={stats.weeklyCompleted}
                total={stats.weeklyTotal}
                color="#a855f7"
                label="Meta Semanal"
              />
              <ProgressBar
                current={stats.monthlyCompleted}
                total={stats.monthlyTotal}
                color="#06b6d4"
                label="Meta Mensal"
              />
            </div>

            {/* Weekly Grid */}
            <div className="pt-2 border-t border-slate-700/50">
              <p className="text-xs text-slate-500 mb-3">Esta semana</p>
              <WeeklyGrid practices={practices} />
            </div>

            {/* Quick Action */}
            <button
              onClick={markTodayComplete}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Marcar Prática de Hoje
            </button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default ProgressTracker;
