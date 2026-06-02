"use client";

import { useState, useEffect } from "react";

export interface JourneyMilestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: Date;
}

export interface JourneyProgress {
  currentStep: number;
  totalSteps: number;
  percentage: number;
}

export interface UseJourneyReturn {
  milestones: JourneyMilestone[];
  progress: JourneyProgress;
  isLoading: boolean;
  completeMilestone: (id: string) => void;
  resetJourney: () => void;
}

const DEFAULT_MILESTONES: JourneyMilestone[] = [
  {
    id: "awakening",
    title: "Despertar",
    description: "Início da jornada espiritual",
    completed: false,
  },
  {
    id: "self-discovery",
    title: "Autodescoberta",
    description: "Exploração interior e autoconhecimento",
    completed: false,
  },
  {
    id: "transformation",
    title: "Transformação",
    description: "Renascimento e elevação pessoal",
    completed: false,
  },
  {
    id: "mastery",
    title: "Domínio",
    description: "Integração e sabedoria alcançada",
    completed: false,
  },
];

export function useJourney(): UseJourneyReturn {
  const [milestones, setMilestones] = useState<JourneyMilestone[]>(DEFAULT_MILESTONES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage if available
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cabala-journey");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setMilestones(parsed);
        } catch {
          // ignore parse errors
        }
      }
      setIsLoading(false);
    }
  }, []);

  const saveMilestones = (updated: JourneyMilestone[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cabala-journey", JSON.stringify(updated));
    }
  };

  const completedCount = milestones.filter((m) => m.completed).length;
  const progress: JourneyProgress = {
    currentStep: completedCount,
    totalSteps: milestones.length,
    percentage: milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0,
  };

  const completeMilestone = (id: string) => {
    setMilestones((prev) => {
      const updated = prev.map((m) =>
        m.id === id && !m.completed
          ? { ...m, completed: true, completedAt: new Date() }
          : m
      );
      saveMilestones(updated);
      return updated;
    });
  };

  const resetJourney = () => {
    setMilestones(DEFAULT_MILESTONES);
    saveMilestones(DEFAULT_MILESTONES);
  };

  return {
    milestones,
    progress,
    isLoading,
    completeMilestone,
    resetJourney,
  };
}