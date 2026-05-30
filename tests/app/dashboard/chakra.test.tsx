/**
 * Dashboard Chakra Page Tests
 * Tests for the dashboard/chakra page integration
 */

import { describe, it, expect } from 'vitest'

describe('Dashboard Chakra Page', () => {
  it('should export page component', async () => {
    const page = await import('@/app/dashboard/chakra/page')
    expect(page.default).toBeDefined()
    expect(typeof page.default).toBe('function')
  })

  it('should have Chakra-Day correlation imports', async () => {
    const chakraDay = await import('@/lib/correlation/chakra-day')
    expect(chakraDay.getChakraDay).toBeDefined()
    expect(chakraDay.getDayChakra).toBeDefined()
  })

  it('should have Chakra-Planet correlation imports', async () => {
    const chakraPlanet = await import('@/lib/correlation/chakra-planet')
    expect(chakraPlanet.getChakraPlanet).toBeDefined()
    expect(chakraPlanet.getPlanetChakra).toBeDefined()
  })

  it('should have Chakra-Frequency correlation imports', async () => {
    const chakraFreq = await import('@/lib/correlation/chakra-frequency')
    expect(chakraFreq.getChakraFrequency).toBeDefined()
  })
})

describe('Chakra Data Structure', () => {
  it('should have 7 chakras in chakra-day', async () => {
    const { CHAKRA_DAY_MAPPINGS } = await import('@/lib/correlation/chakra-day')
    expect(Object.keys(CHAKRA_DAY_MAPPINGS).length).toBe(7)
  })

  it('should have chakra-planet mappings', async () => {
    const chakraPlanet = await import('@/lib/correlation/chakra-planet')
    expect(chakraPlanet.getChakraPlanet('Muladhara')).toBeDefined()
  })

  it('should have chakra-frequency mappings', async () => {
    const chakraFreq = await import('@/lib/correlation/chakra-frequency')
    expect(chakraFreq.getChakraFrequency('Muladhara')).toBeDefined()
  })
})