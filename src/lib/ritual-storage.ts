/**
 * Ritual Storage Module
 * @module ritual-storage
 *
 * In-memory ritual completion tracking for tests and lightweight deployments.
 * Replace with Prisma/supabase for production use.
 */

export interface RitualCompletion {
  id: string
  userId: string
  ritualId: string
  completedAt: Date
  duration: number
  notes?: string
}

export interface RitualStats {
  totalCompletions: number
  totalDuration: number
}

const completions: RitualCompletion[] = []

export function addRitualCompletion(
  userId: string,
  ritualId: string,
  completedAt: Date,
  duration: number,
  notes?: string,
): RitualCompletion {
  const record: RitualCompletion = {
    id: crypto.randomUUID(),
    userId,
    ritualId,
    completedAt,
    duration,
    notes,
  }
  completions.push(record)
  return record
}

export function getRitualHistory(userId: string): RitualCompletion[] {
  return completions.filter((c) => c.userId === userId)
}

export function getRitualStats(userId: string): RitualStats {
  const userCompletions = getRitualHistory(userId)
  return {
    totalCompletions: userCompletions.length,
    totalDuration: userCompletions.reduce((sum, c) => sum + c.duration, 0),
  }
}

export function resetRitualStore() {
  completions.length = 0
}
