import { describe, it, expect } from 'vitest';
import {
  estrategiaI18n,
  autoridadeI18n,
  regraCondicaoI18n,
  regraAccaoI18n,
  timingI18n,
  decisaoHojeI18n,
  praticaDiariaI18n,
} from './synthesizer-i18n';

describe('synthesizer-i18n', () => {
  describe('estrategiaI18n', () => {
    it('returns estrategiaPadrao when lp is undefined', () => {
      const result = estrategiaI18n('act', undefined);
      expect(result).toEqual({ key: 'diario.authority.estrategiaPadrao', params: {} });
    });

    it('returns estrategiaAct key for act strategy', () => {
      const result = estrategiaI18n('act', 1);
      expect(result).toEqual({ key: 'diario.authority.estrategiaAct', params: { lp: 1 } });
    });

    it('returns estrategiaObserve key for observe strategy', () => {
      const result = estrategiaI18n('observe', 2);
      expect(result).toEqual({ key: 'diario.authority.estrategiaObserve', params: { lp: 2 } });
    });

    it('returns estrategiaSurrender key for surrender strategy', () => {
      const result = estrategiaI18n('surrender', 3);
      expect(result).toEqual({ key: 'diario.authority.estrategiaSurrender', params: { lp: 3 } });
    });

    it('returns estrategiaWait key for wait strategy (default)', () => {
      const result = estrategiaI18n('wait', 4);
      expect(result).toEqual({ key: 'diario.authority.estrategiaWait', params: { lp: 4 } });
    });
  });

  describe('autoridadeI18n', () => {
    it('returns key for emocional autoridade', () => {
      const result = autoridadeI18n('emocional');
      expect(result).toEqual({ key: 'diario.authority.autoridade.emocional', params: {} });
    });

    it('returns key for sagrada autoridade', () => {
      const result = autoridadeI18n('sagrada');
      expect(result).toEqual({ key: 'diario.authority.autoridade.sagrada', params: {} });
    });

    it('returns key for esplénica autoridade', () => {
      const result = autoridadeI18n('esplénica');
      expect(result).toEqual({ key: 'diario.authority.autoridade.esplénica', params: {} });
    });

    it('returns key for mental autoridade', () => {
      const result = autoridadeI18n('mental');
      expect(result).toEqual({ key: 'diario.authority.autoridade.mental', params: {} });
    });
  });

  describe('regraCondicaoI18n', () => {
    it('returns condicao key for each autoridade type', () => {
      const autoridades = ['emocional', 'sagrada', 'esplénica', 'mental'] as const;
      autoridades.forEach((aut) => {
        const result = regraCondicaoI18n(aut);
        expect(result).toEqual({
          key: `diario.authority.regra.condicao.${aut}`,
          params: {},
        });
      });
    });
  });

  describe('regraAccaoI18n', () => {
    it('returns accao key for each estrategia type', () => {
      const estrategias = ['act', 'wait', 'observe', 'surrender'] as const;
      estrategias.forEach((estr) => {
        const result = regraAccaoI18n(estr);
        expect(result).toEqual({
          key: `diario.authority.regra.accao.${estr}`,
          params: {},
        });
      });
    });
  });

  describe('timingI18n', () => {
    it('returns agua prefix when luaDeAgua is true', () => {
      const result = timingI18n(true);
      expect(result.melhor.key).toBe('diario.authority.timing.melhor.agua');
      expect(result.pior.key).toBe('diario.authority.timing.pior.agua');
    });

    it('returns padrao prefix when luaDeAgua is false', () => {
      const result = timingI18n(false);
      expect(result.melhor.key).toBe('diario.authority.timing.melhor.padrao');
      expect(result.pior.key).toBe('diario.authority.timing.pior.padrao');
    });
  });

  describe('decisaoHojeI18n', () => {
    it('returns decisaoPadrao when lp is undefined', () => {
      const result = decisaoHojeI18n('dinheiro', undefined);
      expect(result).toEqual({ key: 'diario.authority.decisaoPadrao', params: { area: 'dinheiro' } });
    });

    it('returns decisaoAct for life-path 1, 3, 5', () => {
      [1, 3, 5].forEach((lp) => {
        const result = decisaoHojeI18n('dinheiro', lp);
        expect(result).toEqual({ key: 'diario.authority.decisaoAct', params: { area: 'dinheiro' } });
      });
    });

    it('returns decisaoRelacoes for life-path 2, 6, 7', () => {
      [2, 6, 7].forEach((lp) => {
        const result = decisaoHojeI18n('relacoes', lp);
        expect(result).toEqual({ key: 'diario.authority.decisaoRelacoes', params: { area: 'relacoes' } });
      });
    });

    it('returns decisaoProposito for life-path 4, 8, 9, 11', () => {
      [4, 8, 9, 11].forEach((lp) => {
        const result = decisaoHojeI18n('proposito', lp);
        expect(result).toEqual({ key: 'diario.authority.decisaoProposito', params: { area: 'proposito' } });
      });
    });

    it('returns decisaoSpiritual for life-path 22 and 33', () => {
      [22, 33].forEach((lp) => {
        const result = decisaoHojeI18n('espiritualidade', lp);
        expect(result).toEqual({ key: 'diario.authority.decisaoSpiritual', params: { area: 'espiritualidade' } });
      });
    });

    it('returns decisaoPadrao for unlisted life-path (e.g. 10)', () => {
      const result = decisaoHojeI18n('dinheiro', 10);
      expect(result).toEqual({ key: 'diario.authority.decisaoPadrao', params: { area: 'dinheiro' } });
    });
  });

  describe('praticaDiariaI18n', () => {
    it('returns template key with area and autoridade params', () => {
      const result = praticaDiariaI18n('dinheiro', 'emocional');
      expect(result).toEqual({
        key: 'diario.authority.praticaDiariaTemplate',
        params: { area: 'dinheiro', autoridade: 'emocional' },
      });
    });

    it('returns template key for all autoridade types', () => {
      const autoridades = ['emocional', 'sagrada', 'esplénica', 'mental'] as const;
      autoridades.forEach((aut) => {
        const result = praticaDiariaI18n('relacoes', aut);
        expect(result.key).toBe('diario.authority.praticaDiariaTemplate');
        expect(result.params.autoridade).toBe(aut);
        expect(result.params.area).toBe('relacoes');
      });
    });
  });
});
