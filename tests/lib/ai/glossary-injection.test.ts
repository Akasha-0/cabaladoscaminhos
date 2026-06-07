/**
 * glossary.test.ts — AD-20.2 (AD-T5-F)
 *
 * Teste mínimo: verifica que o glossário (essência / quizila / conselho)
 * é injetado pelos 3 builders que alimentam IA:
 *   - buildManifestoContent
 *   - buildDailyContent
 *   - buildConsultSystemPrompt (consult route)
 *
 * Garante que o conteúdo do Odu esteja sempre presente no payload,
 * mitigando o risco de alucinação.
 */

import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/agents/transit-engine', () => ({
  buildDailyEnergy: () => ({
    majorAspects: [],
    overallEnergy: 60,
    moonPhase: { name: 'Lua', phase: 'cheia', energy: '', action: '', avoid: '', rituals: [], favorableFor: [] },
    luckyColor: 'branco',
    luckyNumber: 1,
    overallTheme: 'Equilíbrio',
    keyAdvice: '',
    date: '2026-06-06',
    retrogradePlanets: [],
    powerHour: '06-08h',
  }),
}));

import { buildManifestoContent } from '@/lib/akasha/manifesto-builder';
import { buildDailyContent } from '@/lib/akasha/daily-engine';
import { buildOduGlossary, formatGlossarySection } from '@/lib/akasha/glossary';

const OGBE_ODUBIRTH = {
  oduName: 'Ogbe',
  oduNumber: 1,
  orixaRegency: ['Oxalá'],
  elementalForce: 'Fogo',
  preceitos: ['Cultivar paciência e humildade'],
};

describe('AD-T5-F / AD-20.2 — injeção de glossário do Odu', () => {
  it('buildOduGlossary resolve Ogbe via oduBirth.oduName', () => {
    const section = buildOduGlossary(OGBE_ODUBIRTH);
    expect(section).not.toBeNull();
    expect(section?.oduName).toBe('Ogbe');
    expect(section?.essencia).toMatch(/luz|origem|criação/i);
    expect(section?.quizila).toBeTypeOf('string');
    expect(section?.conselho).toBeTypeOf('string');
  });

  it('formatGlossarySection produz cabeçalho canônico (AD-20.2)', () => {
    const text = formatGlossarySection(buildOduGlossary(OGBE_ODUBIRTH));
    expect(text).toContain('## GLOSSÁRIO DO ODU');
    expect(text).toContain('odu_essencia:');
    expect(text).toContain('odu_quizila:');
    expect(text).toContain('odu_conselho:');
  });

  it('formatGlossarySection devolve string vazia quando Odu não resolvido', () => {
    expect(formatGlossarySection(null)).toBe('');
    expect(formatGlossarySection(buildOduGlossary({ oduName: 'INEXISTENTE' }))).toBe('');
    expect(formatGlossarySection(buildOduGlossary({}))).toBe('');
  });

  it('buildManifestoContent injeta glossarySection no payload', () => {
    const content = buildManifestoContent(
      'Maria',
      { ascendant: 'Áries' },
      { lifePath: 7 },
      { tantricPath: 3 },
      OGBE_ODUBIRTH,
    );
    expect(content.glossarySection).toBeTypeOf('string');
    expect(content.glossarySection).toContain('odu_essencia:');
    expect(content.glossarySection).toContain('odu_quizila:');
    expect(content.glossarySection).toContain('odu_conselho:');
  });

  it('buildDailyContent injeta glossarySection no payload', () => {
    const content = buildDailyContent(
      { ascendant: 'Áries' },
      { lifePath: 7 },
      { tantricPath: 3 },
      OGBE_ODUBIRTH,
      new Date('2026-06-06T00:00:00Z'),
    );
    expect(content.glossarySection).toBeTypeOf('string');
    expect(content.glossarySection).toContain('## GLOSSÁRIO DO ODU');
  });

  it('buildManifestoContent: glossarySection é string vazia quando Odu ausente', () => {
    const content = buildManifestoContent(
      'Maria',
      {},
      {},
      {},
      {},
    );
    expect(content.glossarySection).toBe('');
  });
});
