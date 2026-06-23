import { describe, it, expect } from 'vitest';
import { gerarInsightDoDia, type PilaresCompletos } from './insight-do-dia';

/** Minimal valid PilaresCompletos. */
function minimalPilares(): PilaresCompletos {
  return {
    cabala: { life_path: 11, birthday: 14, expression: 3, ano_pessoal: 5 },
    astrologia: {
      sol_signo: 'Escorpião',
      asc_signo: null,
      lua_signo: 'Câncer',
      lua_fase: 'cheia',
      trinity: { sombra: 2, dom: 7, graca: 11 },
      trinity_dominante: 'dom',
      lilith_signo: null,
      casa_8_signo: null,
    },
    tantrica: {
      corpo_predominante: 7,
      trigemeo: 'astral',
      temperamento_atual: 'melancolico',
    },
    odu: { odu_principal: 'Eji Ogbe', odu_secundario: null, fonte: 'Ifá' },
    iching: { hexagrama_natal: 51, hexagrama_dia: 26, level: 'gift' },
  } as PilaresCompletos;
}

describe('insight-do-dia', () => {
  describe('gerarInsightDoDia', () => {
    it('returns non-null InsightDoDia', () => {
      const result = gerarInsightDoDia(minimalPilares());
      expect(result).toBeTruthy();
    });

    it('result has non-empty titulo_curto', () => {
      const result = gerarInsightDoDia(minimalPilares());
      expect(result.titulo_curto).toBeTruthy();
      expect(typeof result.titulo_curto).toBe('string');
      expect(result.titulo_curto.length).toBeGreaterThan(0);
    });

    it('result has non-empty sintese', () => {
      const result = gerarInsightDoDia(minimalPilares());
      expect(result.sintese).toBeTruthy();
      expect(typeof result.sintese).toBe('string');
      expect(result.sintese.length).toBeGreaterThan(0);
    });

    it('result has non-empty pratica_do_dia', () => {
      const result = gerarInsightDoDia(minimalPilares());
      expect(result.pratica_do_dia).toBeTruthy();
      expect(typeof result.pratica_do_dia).toBe('string');
      expect(result.pratica_do_dia.length).toBeGreaterThan(0);
    });

    it('pilares_destacados is non-empty array of valid pilar strings', () => {
      const result = gerarInsightDoDia(minimalPilares());
      expect(Array.isArray(result.pilares_destacados)).toBe(true);
      expect(result.pilares_destacados.length).toBeGreaterThan(0);
      const valid = ['cabala', 'astrologia', 'tantrica', 'odu', 'iching'] as const;
      for (const p of result.pilares_destacados) {
        expect(valid).toContain(p);
      }
    });

    it('is deterministic: same input returns same output', () => {
      const p = minimalPilares();
      const first = gerarInsightDoDia(p);
      const second = gerarInsightDoDia(p);
      expect(first.titulo_curto).toBe(second.titulo_curto);
      expect(first.sintese).toBe(second.sintese);
      expect(first.pratica_do_dia).toBe(second.pratica_do_dia);
      expect(first.pilares_destacados).toEqual(second.pilares_destacados);
    });
  });

  describe('pilarHash (indirect via gerarInsightDoDia)', () => {
    it('is deterministic: same PilaresCompletos returns same title twice', () => {
      const p = minimalPilares();
      const first = gerarInsightDoDia(p);
      const second = gerarInsightDoDia(p);
      expect(first.titulo_curto).toBe(second.titulo_curto);
    });

    it('different inputs produce valid titles', () => {
      const p1 = minimalPilares();
      const p2: PilaresCompletos = {
        ...minimalPilares(),
        cabala: { life_path: 22, birthday: 1, expression: 1, ano_pessoal: 1 },
      } as PilaresCompletos;
      expect(gerarInsightDoDia(p1).titulo_curto).toBeTruthy();
      expect(gerarInsightDoDia(p2).titulo_curto).toBeTruthy();
    });
  });

  describe('temaDoDia (indirect via pratica_do_dia)', () => {
    // temaDoDia maps lua_fase → tom → pratica_do_dia from PRATICAS.
    // Testing pratica_do_dia per lua_fase exercises temaDoDia transitively.

    it('lua_fase nova → pratica mentions vela', () => {
      const p: PilaresCompletos = {
        ...minimalPilares(),
        astrologia: { ...minimalPilares().astrologia, lua_fase: 'nova' },
      } as PilaresCompletos;
      const result = gerarInsightDoDia(p);
      expect(result.pratica_do_dia).toContain('vela');
    });

    it('lua_fase crescente → pratica mentions ato', () => {
      const p: PilaresCompletos = {
        ...minimalPilares(),
        astrologia: { ...minimalPilares().astrologia, lua_fase: 'crescente' },
      } as PilaresCompletos;
      const result = gerarInsightDoDia(p);
      expect(result.pratica_do_dia).toContain('ato');
    });

    it('lua_fase cheia → pratica mentions Agradeça', () => {
      const p: PilaresCompletos = {
        ...minimalPilares(),
        astrologia: { ...minimalPilares().astrologia, lua_fase: 'cheia' },
      } as PilaresCompletos;
      const result = gerarInsightDoDia(p);
      expect(result.pratica_do_dia).toContain('Agradeça');
    });

    it('lua_fase minguante → pratica mentions espaço', () => {
      const p: PilaresCompletos = {
        ...minimalPilares(),
        astrologia: { ...minimalPilares().astrologia, lua_fase: 'minguante' },
      } as PilaresCompletos;
      const result = gerarInsightDoDia(p);
      expect(result.pratica_do_dia).toContain('espaço');
    });

    it('each lua_fase produces a distinct pratica_do_dia', () => {
      const fases = ['nova', 'crescente', 'cheia', 'minguante'] as const;
      const praticas = fases.map((lua_fase) => {
        const p: PilaresCompletos = {
          ...minimalPilares(),
          astrologia: { ...minimalPilares().astrologia, lua_fase },
        } as PilaresCompletos;
        return gerarInsightDoDia(p).pratica_do_dia;
      });
      const unique = new Set(praticas);
      expect(unique.size).toBe(praticas.length);
    });
  });
});
