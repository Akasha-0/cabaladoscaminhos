/**
 * Dashboard Orixá Page Tests
 * Tests for the dashboard/orixa page integration
 */

import { describe, it, expect } from 'vitest'

describe('Dashboard Orixá Page', () => {
  it('should export page component', async () => {
    const page = await import('@/app/dashboard/orixa/page')
    expect(page.default).toBeDefined()
    expect(typeof page.default).toBe('function')
  })

  it('should have Orixá-Herb correlation imports', async () => {
    const orixaHerb = await import('@/lib/correlation/orixa-herb')
    expect(orixaHerb.ORIXÁ_HERB_MAPPINGS).toBeDefined()
    expect(orixaHerb.ORIXÁ_HERB_MAPPINGS.length).toBe(9)
  })

  it('should have Orixá-Chakra correlation imports', async () => {
    const orixaChakra = await import('@/lib/correlation/orixa-chakra')
    expect(orixaChakra.getOrixaChakra).toBeDefined()
  })

  it('should have getAllOrixaChakras correlation imports', async () => {
    const orixaChakra = await import('@/lib/correlation/orixa-chakra')
    expect(orixaChakra.getAllOrixaChakras).toBeDefined()
  })
})

describe('Orixá Data Structure', () => {
  it('should have 9 Orixás with herbs', async () => {
    const { ORIXÁ_HERB_MAPPINGS } = await import('@/lib/correlation/orixa-herb')
    
    expect(ORIXÁ_HERB_MAPPINGS.length).toBe(9)
    
    ORIXÁ_HERB_MAPPINGS.forEach(mapping => {
      expect(mapping.erivas.length).toBeGreaterThan(0)
      expect(mapping.erivas_principais.length).toBe(5)
    })
  })

  it('should have herb categories for each Orixá', async () => {
    const { ORIXÁ_HERB_MAPPINGS } = await import('@/lib/correlation/orixa-herb')
    
    const categories = new Set<string>()
    ORIXÁ_HERB_MAPPINGS.forEach(m => {
      m.erivas.forEach(e => categories.add(e.categoria))
    })
    
    expect(categories.size).toBeGreaterThanOrEqual(5)
  })
})