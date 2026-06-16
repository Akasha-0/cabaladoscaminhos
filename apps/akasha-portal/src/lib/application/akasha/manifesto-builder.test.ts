/**
 * Manifesto Builder — F-245 test coverage
 *
 * buildManifestoContent gera o conteúdo do Manifesto Akáshico do usuário
 * (PDF + share text). Combina 5 Pilares + glossário.
 *
 * Cobertura: 0% → ~40% (com este test file).
 */

import { describe, it, expect, vi } from 'vitest';

// Mock glossary
vi.mock('./glossary', () => ({
  buildOduGlossary: vi.fn(() => [{ term: 'Ori', essence: 'Cabeça divina', quizila: 'Não cortar cabelo sem bênção' }]),
  formatGlossarySection: vi.fn(() => '## Glossário\n\nOri = Cabeça divina'),
}));

import { buildManifestoContent } from './manifesto-builder';

describe('buildManifestoContent (F-245)', () => {
  it('retorna ManifestoContent com userName + generatedAt + 5 seções', () => {
    const manifesto = buildManifestoContent(
      'João Silva',
      { ascendant: 'Leão', dominantPlanet: 'Sol' },
      { lifePath: 11, expression: 5, personalCycles: { personalYear: 4 } },
      { tantricPath: 7 },
      { oduName: 'Ogbe', oduNumber: 1, orixaRegency: ['Ogum'] }
    );
    expect(manifesto.userName).toBe('João Silva');
    expect(manifesto.generatedAt).toBeTruthy();
    expect(manifesto.odus).toBeDefined();
    expect(manifesto.kabala).toBeDefined();
    expect(manifesto.tantra).toBeDefined();
    expect(manifesto.astrology).toBeDefined();
    expect(manifesto.synthesis).toBeTruthy();
  });

  it('Odu: extrai oduName, oduNumber, orixas', () => {
    const manifesto = buildManifestoContent(
      'Maria',
      {},
      {},
      {},
      { oduName: 'Oyeku', oduNumber: 2, orixaRegency: ['Iemanjá'] }
    );
    expect(manifesto.odus.oduName).toBe('Oyeku');
    expect(manifesto.odus.oduNumber).toBe(2);
    expect(manifesto.odus.orixas).toContain('Iemanjá');
  });

  it('Odu: fallback para "Ori" quando oduName ausente', () => {
    const manifesto = buildManifestoContent(
      'Anon',
      {}, {}, {}, {}
    );
    expect(manifesto.odus.oduName).toBe('Ori');
    expect(manifesto.odus.oduNumber).toBeNull();
  });

  it('Cabala: extrai lifePath, expression, personalYear', () => {
    const manifesto = buildManifestoContent(
      'Maria',
      {},
      { lifePath: 22, expression: 4, personalCycles: { personalYear: 7 } },
      {}, {}
    );
    expect(manifesto.kabala.lifePath).toBe(22);
    expect(manifesto.kabala.expression).toBe(4);
    expect(manifesto.kabala.personalYear).toBe(7);
  });

  it('Astrologia: extrai ascendant, dominantPlanet', () => {
    const manifesto = buildManifestoContent(
      'Maria',
      { ascendant: 'Escorpião', dominantPlanet: 'Plutão' },
      {}, {}, {}
    );
    expect(manifesto.astrology.ascendant).toBe('Escorpião');
    expect(manifesto.astrology.dominantPlanet).toBe('Plutão');
  });

  it('Tantra: extrai tantricPath', () => {
    const manifesto = buildManifestoContent(
      'Maria',
      {}, {}, { tantricPath: 9 }, {}
    );
    expect(manifesto.tantra.tantricPath).toBe(9);
  });

  it('glossarySection: injetado a partir de buildOduGlossary', () => {
    const manifesto = buildManifestoContent(
      'Maria',
      {}, {}, {},
      { oduName: 'Ogbe' }
    );
    expect(manifesto.glossarySection).toBe('## Glossário\n\nOri = Cabeça divina');
  });

  it('synthesis: presente e não-vazio', () => {
    const manifesto = buildManifestoContent(
      'Maria',
      {}, { lifePath: 11 }, {}, { oduName: 'Ogbe' }
    );
    expect(manifesto.synthesis).toBeTruthy();
    expect(manifesto.synthesis.length).toBeGreaterThan(20);
  });
});

describe('buildManifestoContent — graceful fallback', () => {
  it('nunca throws com todos os inputs null', () => {
    expect(() =>
      buildManifestoContent('Test', null, null, null, null)
    ).not.toThrow();
  });

  it('nunca throws com todos os inputs undefined', () => {
    expect(() =>
      buildManifestoContent('Test', undefined, undefined, undefined, undefined)
    ).not.toThrow();
  });

  it('sempre retorna ManifestoContent estruturalmente válido', () => {
    const manifesto = buildManifestoContent('Test', null, null, null, null);
    expect(manifesto.userName).toBe('Test');
    expect(manifesto.generatedAt).toBeTruthy();
    expect(manifesto.odus).toBeDefined();
    expect(manifesto.kabala).toBeDefined();
    expect(manifesto.tantra).toBeDefined();
    expect(manifesto.astrology).toBeDefined();
  });
});
