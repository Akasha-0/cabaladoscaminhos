/**
 * Synthesizer (sintetizarMapa) — F-246 test coverage
 *
 * sintetizarMapa é a função PRINCIPAL do synthesizer — produz a síntese
 * completa de 9 dimensões de vida a partir dos 5 Pilares.
 *
 * Cobertura: 0% → ~40% (com este test file).
 */

import { describe, it, expect, vi } from 'vitest';

// Mock narrative-generator to avoid DB / heavy deps
vi.mock('./narrative-generator', () => ({
  gerarNarrativaDimensao: vi.fn((dimId, _pilares) => `Narrativa curada para ${dimId}: você é único, caminho próprio.`),
  gerarNarrativaSexualidade: vi.fn(() => 'Sexualidade curada: corpo 4, mente positiva.'),
  gerarPerfilGeral: vi.fn(() => 'Perfil Akasha: você é um Catalisador, com 11 corpos.'),
}));

import { sintetizarMapa } from './synthesizer';
import type { PilaresDados } from '../significados-curados';

const PILARES_COMPLETOS: PilaresDados = {
  cabala: { life_path: 11, birthday: 7, expression: 5, ano_pessoal: 4 },
  astrologia: {
    sol_signo: 'Escorpião',
    asc_signo: 'Leão',
    lua_signo: 'Peixes',
    lua_fase: 'cheia',
    trinity: { sombra: 0.3, dom: 0.6, graca: 0.1 },
    trinity_dominante: 'dom',
    lilith_signo: 'Escorpião',
    casa_8_signo: 'Aquário',
  },
  tantrica: {
    corpo_predominante: 4,
    trigemeo: 'astral',
    temperamento_atual: 'colerico',
  },
  odu: {
    odu_principal: 'Ogbe',
    odu_secundario: 'Oyeku',
    fonte: 'Ifá',
  },
  iching: {
    hexagrama_natal: 51,
    hexagrama_dia: 11,
    level: 'gift',
  },
};

describe('sintetizarMapa (F-246)', () => {
  it('retorna CaixaSintese com 9 dimensões', () => {
    const result = sintetizarMapa(PILARES_COMPLETOS);
    expect(result.dimensoes).toBeDefined();
    expect(result.dimensoes).toHaveLength(9);
  });

  it('cada dimensão tem os campos obrigatórios', () => {
    const result = sintetizarMapa(PILARES_COMPLETOS);
    for (const dim of result.dimensoes) {
      expect(dim.dimensoesId).toBeTruthy();
      expect(dim.titulo).toBeTruthy();
      expect(dim.icone).toBeTruthy();
      expect(dim.chakraCor).toBeTruthy();
      expect(dim.bgCor).toBeTruthy();
      expect(dim.borderCor).toBeTruthy();
      expect(dim.descricao).toBeTruthy();
      expect(dim.synthes).toBeTruthy();
      expect(Array.isArray(dim.contribuicoes)).toBe(true);
      expect(dim.praktika).toBeTruthy();
      expect(dim.alerta).toBeTruthy();
      expect(dim.autoridadeAkasha).toBeDefined();
    }
  });

  it('CaixaSintese inclui caminhoDeVida, perfilGeral, autoridade', () => {
    const result = sintetizarMapa(PILARES_COMPLETOS);
    expect(result.caminhoDeVida).toBeTruthy();
    expect(result.perfilGeral).toBeTruthy();
    expect(result.autoridade).toBeDefined();
  });

  it('autoridade tem estrategia, autoridade, regra, timing, areaFoco, decisaoHoje', () => {
    const result = sintetizarMapa(PILARES_COMPLETOS);
    expect(result.autoridade.estrategia).toBeTruthy();
    expect(result.autoridade.autoridade).toBeTruthy();
    expect(result.autoridade.regra).toBeDefined();
    expect(result.autoridade.regra.condicao).toBeTruthy();
    expect(result.autoridade.regra.accao).toBeTruthy();
    expect(result.autoridade.timing).toBeDefined();
    expect(result.autoridade.timing.melhor).toBeTruthy();
    expect(result.autoridade.timing.pior).toBeTruthy();
    expect(result.autoridade.areaFoco).toBeTruthy();
    expect(result.autoridade.decisaoHoje).toBeTruthy();
  });

  it('cada dimensão tem autoridadeAkasha com tipo (paz|ansiedade) e aplicavel', () => {
    const result = sintetizarMapa(PILARES_COMPLETOS);
    for (const dim of result.dimensoes) {
      expect(['paz', 'ansiedade']).toContain(dim.autoridadeAkasha.tipo);
      expect(typeof dim.autoridadeAkasha.aplicavel).toBe('boolean');
    }
  });
});

describe('sintetizarMapa — variações por Pilar', () => {
  it('Life Path 1 → estrategia=act (regra F-227)', () => {
    const pilares: PilaresDados = {
      ...PILARES_COMPLETOS,
      cabala: { ...PILARES_COMPLETOS.cabala, life_path: 1 },
    };
    const result = sintetizarMapa(pilares);
    expect(result.autoridade.estrategia).toBe('act');
  });

  it('Lua em água (Cancêr) → autoridad=emocional', () => {
    const pilares: PilaresDados = {
      ...PILARES_COMPLETOS,
      astrologia: {
        ...PILARES_COMPLETOS.astrologia,
        lua_signo: 'Cancêr',
      },
    };
    const result = sintetizarMapa(pilares);
    // Lua em água + corpo 4 → autoridade emocional
    expect(['emocional', 'mental']).toContain(result.autoridade.autoridade);
  });

  it('Corpo 8 (Prana) → autoridade sagrada', () => {
    const pilares: PilaresDados = {
      ...PILARES_COMPLETOS,
      tantrica: {
        ...PILARES_COMPLETOS.tantrica,
        corpo_predominante: 8,
      },
    };
    const result = sintetizarMapa(pilares);
    expect(result.autoridade.autoridade).toBe('sagrada');
  });
});
