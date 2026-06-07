/**
 * Dashboard Ritual Page Tests
 * Tests for the dashboard/ritual page integration
 */

import { describe, it, expect } from 'vitest'

describe('Dashboard Ritual Page', () => {
  it('should export page component', async () => {
    const page = await import('@/app/dashboard/ritual/page')
    expect(page.default).toBeDefined()
    expect(typeof page.default).toBe('function')
  })

  it('should have Ritual planner imports', async () => {
    const ritualPlanner = await import('@/lib/correlation/ritual-planner')
    expect(ritualPlanner.generateRitualPlan).toBeDefined()
    expect(ritualPlanner.getWeeklyRitualSchedule).toBeDefined()
  })

  it('should have Orixá-Herb correlation imports', async () => {
    const orixaHerb = await import('@/lib/correlation/orixa-herb')
    expect(orixaHerb.ORIXÁ_HERB_MAPPINGS).toBeDefined()
  })

  it('should have Planet-Herb correlation imports', async () => {
    const planetHerb = await import('@/lib/correlation/planet-herb')
    expect(planetHerb.PLANET_HERB_MAPPINGS).toBeDefined()
  })
})

describe('Ritual Data Structure', () => {
  it('should have generateRitualPlan function', async () => {
    const { generateRitualPlan } = await import('@/lib/correlation/ritual-planner')
    expect(typeof generateRitualPlan).toBe('function')
    const plan = generateRitualPlan(new Date().toISOString())
    expect(plan).toBeDefined()
    expect(plan.name).toBeDefined()
  })
  it('should have getWeeklyRitualSchedule function', async () => {
    const { getWeeklyRitualSchedule } = await import('@/lib/correlation/ritual-planner')
    expect(typeof getWeeklyRitualSchedule).toBe('function')
    const schedule = getWeeklyRitualSchedule()
    expect(schedule).toBeDefined()
  })
})