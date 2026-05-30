import { describe, it, expect } from 'vitest'
import { getDailyMessage } from '@/lib/guidance/daily-message'

// ============================================================
// Daily Message Tests
// ============================================================
describe('getDailyMessage', () => {
  it('returns complete DailyMessage structure', () => {
    const msg = getDailyMessage(new Date('2026-06-15T12:00:00Z'))
    expect(msg).toHaveProperty('dia')
    expect(msg).toHaveProperty('faseLua')
    expect(msg).toHaveProperty('faseLuaSimbolo')
    expect(msg).toHaveProperty('planetaRegente')
    expect(msg).toHaveProperty('afirmacao')
    expect(msg).toHaveProperty('dica')
    expect(msg).toHaveProperty('reflexao')
  })

  it('afirmacao has texto and fonte fields', () => {
    const msg = getDailyMessage(new Date('2026-06-15T12:00:00Z'))
    expect(msg.afirmacao).toHaveProperty('texto')
    expect(msg.afirmacao).toHaveProperty('fonte')
    expect(typeof msg.afirmacao.texto).toBe('string')
    expect(typeof msg.afirmacao.fonte).toBe('string')
  })

  it('faseLua is one of the known phases', () => {
    const knownPhases = [
      'Lua Nova', 'Lua Crescente', 'Lua Gibosa Crescente',
      'Quarto Crescente', 'Lua Cheia', 'Lua Gibosa Minguante',
      'Quarto Minguante', 'Lua Minguante',
    ]
    const msg = getDailyMessage(new Date('2026-06-15T12:00:00Z'))
    expect(knownPhases).toContain(msg.faseLua)
  })

  it('faseLuaSimbolo is an emoji', () => {
    const msg = getDailyMessage(new Date('2026-06-15T12:00:00Z'))
    expect(msg.faseLuaSimbolo.length).toBeGreaterThan(0)
    expect([...'🌑🌓🌒⛈️🌕🌖🌗🌘'].some(e => msg.faseLuaSimbolo.includes(e) || msg.faseLuaSimbolo === e)).toBe(true)
  })

  it('planetaRegente is one of the known planets', () => {
    const knownPlanets = ['Sol', 'Lua', 'Marte', 'Mercúrio', 'Júpiter', 'Vênus', 'Saturno']
    const msg = getDailyMessage(new Date('2026-06-15T12:00:00Z'))
    expect(knownPlanets).toContain(msg.planetaRegente)
  })

  it('dica is a non-empty string', () => {
    const msg = getDailyMessage(new Date('2026-06-15T12:00:00Z'))
    expect(msg.dica.length).toBeGreaterThan(0)
  })

  it('reflexao is a non-empty string', () => {
    const msg = getDailyMessage(new Date('2026-06-15T12:00:00Z'))
    expect(msg.reflexao.length).toBeGreaterThan(0)
  })

  it('returns deterministic results for same UTC day', () => {
    const msg1 = getDailyMessage(new Date('2026-07-15T12:00:00Z'))
    const msg2 = getDailyMessage(new Date('2026-07-15T14:00:00Z'))
    expect(msg1.dia).toBe(msg2.dia)
    expect(msg1.afirmacao.texto).toBe(msg2.afirmacao.texto)
  })

  it('returns valid day number between 1-366', () => {
    const msg = getDailyMessage(new Date('2026-06-15T12:00:00Z'))
    expect(msg.dia).toBeGreaterThanOrEqual(1)
    expect(msg.dia).toBeLessThanOrEqual(366)
  })

  it('returns valid data for mid-year', () => {
    const msg = getDailyMessage(new Date('2026-07-15T12:00:00Z'))
    expect(msg.dia).toBeGreaterThan(180)
    expect(msg.dia).toBeLessThan(200)
  })
})
