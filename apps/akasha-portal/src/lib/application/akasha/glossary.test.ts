/**
 * Glossary — Test coverage for the STUB implementation
 *
 * NOTE (lesson N+27 — spec chain staleness):
 *   glossary.ts is currently a STUB. The header comment says
 *   "STUB: Implementação real do Grimório" but the actual code returns
 *   placeholder strings like `(essência do Odu X)`.
 *
 *   These tests document the CURRENT behavior, not the desired behavior.
 *   When the real implementation lands (R-022 ethics-driven, 15 Odus
 *   canônicos D-044), these tests will need to be updated to assert
 *   the real glossary content.
 *
 *   DO NOT mark this file as "complete" — it's a behavior lock for the stub.
 */
import { describe, it, expect } from 'vitest';
import { buildOduGlossary, formatGlossarySection } from './glossary';

describe('buildOduGlossary (STUB — documents current behavior)', () => {
  it('retorna null para input null', () => {
    expect(buildOduGlossary(null)).toBeNull();
  });

  it('retorna null para input undefined', () => {
    expect(buildOduGlossary(undefined)).toBeNull();
  });

  it('retorna null para string vazia', () => {
    expect(buildOduGlossary('')).toBeNull();
  });

  it('extrai oduName de array de strings', () => {
    const result = buildOduGlossary(['Ogbe']);
    expect(result?.oduName).toBe('Ogbe');
  });

  it('extrai oduName de objeto {oduName}', () => {
    const result = buildOduGlossary({ oduName: 'Oyeku' });
    expect(result?.oduName).toBe('Oyeku');
  });

  it('extrai oduName de objeto {name}', () => {
    const result = buildOduGlossary({ name: 'Iwori' });
    expect(result?.oduName).toBe('Iwori');
  });

  it('extrai oduName de objeto {id}', () => {
    const result = buildOduGlossary({ id: 'Odi' });
    expect(result?.oduName).toBe('Odi');
  });

  it('retorna null para array vazio', () => {
    expect(buildOduGlossary([])).toBeNull();
  });

  it('retorna null para objeto sem name/id/oduName', () => {
    expect(buildOduGlossary({})).toBeNull();
  });

  it('STUB: essencia/quizila/conselho são placeholders com nome do Odu', () => {
    const result = buildOduGlossary({ oduName: 'Ogbe' });
    expect(result?.essencia).toBe('(essência do Odu Ogbe)');
    expect(result?.quizila).toBe('(quizila do Odu Ogbe)');
    expect(result?.conselho).toBe('(conselho do Odu Ogbe)');
  });
});

describe('formatGlossarySection', () => {
  it('retorna string vazia para section null', () => {
    expect(formatGlossarySection(null)).toBe('');
  });

  it('formata com header ## GLOSSÁRIO DO ODU + 3 bullet points', () => {
    const section = {
      oduName: 'Ogbe',
      essencia: 'Clareza',
      quizila: 'Não mentir',
      conselho: 'Buscar luz',
    };
    const result = formatGlossarySection(section);
    expect(result).toContain('## GLOSSÁRIO DO ODU');
    expect(result).toContain('- odu_essencia: Clareza');
    expect(result).toContain('- odu_quizila: Não mentir');
    expect(result).toContain('- odu_conselho: Buscar luz');
  });

  it('formata mesmo com stub placeholders', () => {
    const section = buildOduGlossary({ oduName: 'Oyeku' });
    const result = formatGlossarySection(section);
    expect(result).toContain('## GLOSSÁRIO DO ODU');
    expect(result).toContain('Oyeku');
  });
});
