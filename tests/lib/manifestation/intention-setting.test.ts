import { describe, it, expect } from 'vitest'
// @ts-ignore
import {
  setIntention,
  getIntention,
  getActiveIntentions,
  completeMilestone,
  archiveIntention,
  trackGoal,
  updateGoalProgress,
  getGoalsForIntention,
} from '@/lib/manifestation/intention-setting'

// ============================================================
// Intention Tests
// ============================================================
describe('setIntention', () => {
  it('creates a new intention with required fields', () => {
    const intention = setIntention('Find inner peace', {
      category: 'spiritual',
    })
    expect(intention.id).toBeDefined()
    expect(intention.text).toBe('Find inner peace')
    expect(intention.category).toBe('spiritual')
    expect(intention.status).toBe('active')
    expect(intention.milestones).toEqual([])
    expect(intention.createdAt).toBeDefined()
  })

  it('creates intention with optional category', () => {
    const intention = setIntention('Inner peace', {
      category: 'spiritual',
    })
    expect(intention.category).toBe('spiritual')
    expect(intention.status).toBe('active')
  })

  it('can be retrieved by ID', () => {
    const intention = setIntention('Daily prayer', { category: 'ritual' })
    const found = getIntention(intention.id)
    expect(found).toBeDefined()
    expect(found!.text).toBe('Daily prayer')
  })

  it('appears in active intentions', () => {
    setIntention('Sacred practice', { category: 'spiritual' })
    const active = getActiveIntentions()
    expect(active.length).toBeGreaterThan(0)
  })
})

describe('getActiveIntentions', () => {
  it('returns only active intentions', () => {
    const i1 = setIntention('Active one', { category: 'spiritual' })
    archiveIntention(i1.id)
    const active = getActiveIntentions()
    expect(active.every(i => i.status === 'active')).toBe(true)
  })
})

describe('completeMilestone', () => {
  it('marks a milestone as completed', () => {
    const intention = setIntention('Spiritual journey', {
      category: 'spiritual',
      milestones: ['Step 1', 'Step 2'],
    })
    const milestoneId = intention.milestones[0].id
    const result = completeMilestone(intention.id, milestoneId)
    expect(result).toBe(true)
    const updated = getIntention(intention.id)
    expect(updated!.milestones[0].completed).toBe(true)
    expect(updated!.milestones[1].completed).toBe(false)
  })

  it('returns false for non-existent intention', () => {
    expect(completeMilestone('non-existent-id', 'any-milestone')).toBe(false)
  })

  it('returns false for non-existent milestone', () => {
    const intention = setIntention('Test', { category: 'spiritual' })
    expect(completeMilestone(intention.id, 'non-existent-id')).toBe(false)
  })
})

describe('archiveIntention', () => {
  it('archives an active intention', () => {
    const intention = setIntention('Old practice', { category: 'spiritual' })
    const result = archiveIntention(intention.id)
    expect(result).toBe(true)
    const archived = getIntention(intention.id)
    expect(archived!.status).toBe('archived')
  })

  it('returns false for non-existent intention', () => {
    expect(archiveIntention('non-existent-id')).toBe(false)
  })
})

// ============================================================
// Goal Tracking Tests
// ============================================================
describe('trackGoal', () => {
  it('creates a goal linked to an intention', () => {
    const intention = setIntention('Spiritual growth', { category: 'spiritual' })
    const goal = trackGoal(intention.id, 'Daily meditation')
    expect(goal.id).toBeDefined()
    expect(goal.intentionId).toBe(intention.id)
    expect(goal.title).toBe('Daily meditation')
    expect(goal.progress).toBe(0)
  })
})

describe('getGoalsForIntention', () => {
  it('returns goals for a specific intention', () => {
    const intention = setIntention('Growth path', { category: 'spiritual' })
    trackGoal(intention.id, 'Meditate daily')
    trackGoal(intention.id, 'Read spiritual texts')
    const goals = getGoalsForIntention(intention.id)
    expect(goals.length).toBe(2)
  })
})

describe('updateGoalProgress', () => {
  it('updates goal progress', () => {
    const intention = setIntention('Practice', { category: 'spiritual' })
    const goal = trackGoal(intention.id, 'Practice goal')
    const updated = updateGoalProgress(goal.id, 75)
    expect(updated!.progress).toBe(75)
  })

  it('returns undefined for non-existent goal', () => {
    expect(updateGoalProgress('non-existent-id', 50)).toBeUndefined()
  })
})
