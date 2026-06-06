import { describe, it, expect } from 'vitest';
import { buildConsultSystemPrompt, getDominantElement } from '@/app/api/akasha/consult/route';
import type { GrimoireContext } from '@/lib/grimoire/search';

// ----------------------------------------------------------------------------
// Mocks do Grimoire (controlados)
// ----------------------------------------------------------------------------

const MOCK_GRIMOIRE: GrimoireContext = {
  entries: [
    {
      titulo: 'erva-002-arruda',
      conteudo:
        'Arruda: proteção, Marte, signo de Áries, banho de descarrego com sal grosso em dia de lua minguante.',
      categoria: 'Botânica',
      metadata: { elemento: 'Fogo', orixa: 'Ogum' },
    },
    {
      titulo: 'odu-01-ogbe',
      conteudo:
        'Ogbe: princípio da luz, criação, signo de Áries. Rituais com mel e água de cachoeira.',
      categoria: 'Odus',
      metadata: { oduId: 'ogbe', elemento: 'Fogo' },
    },
  ],
  pillarsConsulted: ['Botânica', 'Odus'],
};

const MOCK_CHART = {
  astrologyMap: { elementalChart: { Fogo: 0.6, Agua: 0.3, Ar: 0.1 } },
  kabalisticMap: { lifePath: 5 },
  oduBirth: { oduName: 'ogbe', orixaRegency: ['Ogum'] },
};

// ----------------------------------------------------------------------------
// RAG-fechado (Camada 3 anti-alucinação) — testes diretos do System Prompt
// ----------------------------------------------------------------------------

describe('Oráculo — RAG-fechado (Camada 3 anti-alucinação)', () => {
  describe('buildConsultSystemPrompt', () => {
    it('contém a diretiva "BIBLIOTECA AKASHA" e "use APENAS estas fontes"', () => {
      const prompt = buildConsultSystemPrompt(MOCK_CHART, MOCK_GRIMOIRE);

      expect(prompt).toMatch(/BIBLIOTECA AKASHA/);
      expect(prompt).toMatch(/APENAS estas fontes/);
    });

    it('contém a regra absoluta "NUNCA invente rituais, propriedades de ervas ou correspondências"', () => {
      const prompt = buildConsultSystemPrompt(MOCK_CHART, MOCK_GRIMOIRE);

      expect(prompt).toMatch(/NUNCA invente/);
      expect(prompt).toMatch(/Consulte um Babalorixá ou Babalaô/);
    });

    it('injeta APENAS conteúdo do Grimório (não cita fontes externas)', () => {
      const prompt = buildConsultSystemPrompt(MOCK_CHART, MOCK_GRIMOIRE);

      // Deve conter o conteúdo da arruda
      expect(prompt).toContain('Arruda: proteção');
      // Deve conter o conteúdo de Ogbe
      expect(prompt).toContain('Ogbe: princípio da luz');
      // NUNCA deve conter placeholder de "invencao" como instrução ao LLM
      expect(prompt).not.toMatch(/\[INVENTE|\[IMAGINE|crie uma erva nova|crie um ritual inventado/i);
      // NUNCA deve referenciar Wikipedia, livros ou web
      expect(prompt).not.toMatch(/Wikipedia|wikipedia\.org|Google/);
    });

    it('identifica o consulente pelo Odu de nascimento, Orixá regente e Caminho de Vida', () => {
      const prompt = buildConsultSystemPrompt(MOCK_CHART, MOCK_GRIMOIRE);

      expect(prompt).toContain('Odu de nascimento: ogbe');
      expect(prompt).toContain('Orixá(s) regente(s): Ogum');
      expect(prompt).toContain('Caminho de Vida: 5');
    });

    it('lida com chart nulo sem quebrar (grimoire vazio)', () => {
      const prompt = buildConsultSystemPrompt(null, { entries: [], pillarsConsulted: [] });

      // Não deve quebrar — deve continuar com placeholders
      expect(prompt).toBeTruthy();
      expect(prompt).toMatch(/Odu de nascimento: Desconhecido/);
      expect(prompt).toMatch(/Caminho de Vida: —/);
      // Sem entradas no grimório, não deve injetar a seção BIBLIOTECA AKASHA
      expect(prompt).not.toMatch(/BIBLIOTECA AKASHA/);
    });

    it('lida com chart sem oduBirth definido', () => {
      const prompt = buildConsultSystemPrompt(
        { astrologyMap: {}, kabalisticMap: {}, oduBirth: null },
        MOCK_GRIMOIRE
      );

      expect(prompt).toContain('Odu de nascimento: Desconhecido');
      expect(prompt).toMatch(/BIBLIOTECA AKASHA/); // grimoire tem entradas
    });
  });

  describe('getDominantElement', () => {
    it('retorna o elemento com maior peso do elementalChart', () => {
      const astro = { elementalChart: { Fogo: 0.6, Agua: 0.3, Ar: 0.1 } };
      expect(getDominantElement(astro)).toBe('Fogo');
    });

    it('retorna "Água" como fallback quando elementalChart vazio', () => {
      expect(getDominantElement({})).toBe('Água');
    });

    it('retorna "Água" quando astrologyMap é null/undefined', () => {
      expect(getDominantElement(null)).toBe('Água');
    });
  });
});
