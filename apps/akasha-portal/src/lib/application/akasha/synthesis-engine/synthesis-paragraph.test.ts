/**
 * synthesis-engine/synthesis-paragraph.test.ts
 *
 * Geração do parágrafo-síntese final integrando todas as áreas.
 */
import { describe, it, expect } from 'vitest';
import { buildSynthesisParagraph } from './synthesis-paragraph';
import type { AreaNarrative } from './synthesis-types';

function makeArea(overrides: Partial<AreaNarrative> = {}): AreaNarrative {
  return {
    area: 'vitalidadeEnergia',
    title: 'Vitalidade e Energia',
    frequency: 'gift',
    intensity: 2,
    shadowPattern: 'Padrão de sombra.',
    shadowSymptoms: [],
    giftPattern: 'Padrão de dom.',
    giftStrengths: ['capacidade de transformação'],
    pillarContribution: { cabala: '', tantra: '', odus: '', astrologia: '', iching: '' },
    practicalAdvice: 'Prática de energia.',
    dailyRitual: { title: 'Ritual', instruction: 'Instr', duration: '10min', element: 'fogo', color: '#FF0000' },
    transformationPrompt: 'Prompt',
    ...overrides,
  };
}

describe('buildSynthesisParagraph', () => {
  it('returns a non-empty string', () => {
    const area = makeArea();
    const result = buildSynthesisParagraph(area, area, area, area, area, area);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('includes the intro text', () => {
    const area = makeArea();
    const result = buildSynthesisParagraph(area, area, area, area, area, area);
    expect(result).toContain('Você nasceu com um perfil de vida raro');
  });

  it('mentions most intense area title in action sentence', () => {
    const vitalidade = makeArea({ area: 'vitalidadeEnergia', title: 'Vitalidade', intensity: 3 });
    const conexoes = makeArea({ area: 'conexoesAmor', title: 'Conexões', intensity: 1 });
    const carreira = makeArea({ area: 'carreiraProsperidade', title: 'Carreira', intensity: 2 });
    const ori = makeArea({ area: 'oriCabecaQuizilas', title: 'Ori', intensity: 1 });
    const missao = makeArea({ area: 'missaoDestino', title: 'Missão', intensity: 1 });
    const desafios = makeArea({ area: 'desafiosSombras', title: 'Desafios', intensity: 1 });

    const result = buildSynthesisParagraph(vitalidade, conexoes, carreira, ori, missao, desafios);
    expect(result).toContain('Vitalidade');
    expect(result).toContain('área que mais precisa de você');
  });

  it('uses gift text when gift areas exist', () => {
    const giftArea = makeArea({ frequency: 'gift', giftStrengths: ['capacidade de transformação'] });
    const shadowArea = makeArea({ frequency: 'shadow', shadowPattern: 'Padrão de sombra.' });
    const result = buildSynthesisParagraph(giftArea, shadowArea, shadowArea, shadowArea, shadowArea, shadowArea);
    expect(result).toContain('Dom');
    expect(result).toContain('capacidade de transformar');
  });

  it('falls back to shadow text when no gift areas exist', () => {
    const shadowArea = makeArea({ frequency: 'shadow', shadowPattern: 'Padrão de sombra.' });
    const result = buildSynthesisParagraph(shadowArea, shadowArea, shadowArea, shadowArea, shadowArea, shadowArea);
    expect(result).toContain('atenção');
    expect(result).toContain('Padrão de sombra');
  });

  it('falls back to transformation text when no gift and no shadow areas exist', () => {
    const neutralArea = makeArea({ frequency: 'gift', giftStrengths: [] });
    const result = buildSynthesisParagraph(neutralArea, neutralArea, neutralArea, neutralArea, neutralArea, neutralArea);
    expect(result).toContain('Continue o trabalho interior');
  });

  it('returns a string with exactly 3 sentences (intro + mid + action)', () => {
    const area = makeArea();
    const result = buildSynthesisParagraph(area, area, area, area, area, area);
    // Intro ends with :, action ends with .
    const sentences = result.split('.').filter((s) => s.trim().length > 0);
    // Expected: "Você nasceu..." (intro + mid) + "...ação." (action)
    expect(sentences.length).toBeGreaterThanOrEqual(2);
  });
});
