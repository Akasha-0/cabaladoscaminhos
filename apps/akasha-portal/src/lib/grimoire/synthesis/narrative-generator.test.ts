import { describe, it, expect } from 'vitest';
import { gerarNarrativaDimensao, gerarNarrativaSexualidade, gerarPerfilGeral } from './narrative-generator';
import { PilaresDados } from '../significados-curados';
import type { DimensaoId } from './dimensoes';

// ─── Fixture válida — espelha FIXTURE_COMPLETA de significados-especificos.test.ts
// life_path=1, sol_signo=Escorpião, corpo=7, odu=Ogbe, hexagrama_dia=51 → todos têm hit real
const FIXTURE_COMPLETA: PilaresDados = {
  cabala: { life_path: 1, birthday: 5, expression: 3, ano_pessoal: 7 },
  astrologia: {
    sol_signo: 'Escorpião',
    asc_signo: 'Leão',
    lua_signo: 'Câncer',
    lua_fase: 'cheia',
    trinity: { sombra: 8, dom: 11, graca: 5 },
    trinity_dominante: 'dom',
    lilith_signo: 'Áries',
    casa_8_signo: 'Escorpião',
  },
  tantrica: {
    corpo_predominante: 7,
    trigemeo: 'mental',
    temperamento_atual: 'colerico',
  },
  odu: {
    odu_principal: 'Ogbe',
    odu_secundario: 'Ogunda',
    fonte: 'Ifá',
  },
  iching: {
    hexagrama_natal: 1,
    hexagrama_dia: 51,
    level: 'gift',
  },
};

describe('narrative-generator', () => {
  // ─── gerarNarrativaDimensao ─────────────────────────────────────────────────

  describe('gerarNarrativaDimensao', () => {
    it('retorna texto não-vazio para dimensão válida com fixture completa', () => {
      const result = gerarNarrativaDimensao('amor', FIXTURE_COMPLETA);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('contém marcador de identidade (seção fixa)', () => {
      const result = gerarNarrativaDimensao('trabalho', FIXTURE_COMPLETA);
      expect(result).toContain('Você é');
    });

    it('todas as dimensões do DIM_AREA_MAP retornam string não-vazia', () => {
      const dimensoes: DimensaoId[] = [
        'saude',
        'trabalho',
        'amor',
        'criacao',
        'proposito',
        'familia',
        'espiritualidade',
        'superacao',
      ];
      for (const dim of dimensoes) {
        const result = gerarNarrativaDimensao(dim, FIXTURE_COMPLETA);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      }
    });

    it('dimensão válida com fixture completa retorna string', () => {
      const result = gerarNarrativaDimensao('amor' as DimensaoId, FIXTURE_COMPLETA);
      expect(typeof result).toBe('string');
    });
  });

  // ─── gerarNarrativaSexualidade ──────────────────────────────────────────────

  describe('gerarNarrativaSexualidade', () => {
    it('retorna texto não-vazio com fixture completa', () => {
      const result = gerarNarrativaSexualidade(FIXTURE_COMPLETA);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('contém marcador de sexualidade (seção fixa)', () => {
      const result = gerarNarrativaSexualidade(FIXTURE_COMPLETA);
      expect(result).toContain('Sexualidade');
    });

    it('injeta o corpo energético da fixture (corpo_predominante=7)', () => {
      const result = gerarNarrativaSexualidade(FIXTURE_COMPLETA);
      expect(result).toContain('#7');
    });

    it('injeta Lilith da fixture (lilith_signo=Áries)', () => {
      const result = gerarNarrativaSexualidade(FIXTURE_COMPLETA);
      expect(result).toContain('Lilith');
      expect(result).toContain('Áries');
    });

    it('injeta Casa 8 da fixture (casa_8_signo=Escorpião)', () => {
      const result = gerarNarrativaSexualidade(FIXTURE_COMPLETA);
      expect(result).toContain('Casa 8');
      expect(result).toContain('Escorpião');
    });

    it('injeta Odu da fixture (odu_principal=Ogbe)', () => {
      const result = gerarNarrativaSexualidade(FIXTURE_COMPLETA);
      expect(result).toContain('Ogbe');
    });

    it('contém autoridade Akasha (seção fixa)', () => {
      const result = gerarNarrativaSexualidade(FIXTURE_COMPLETA);
      expect(result).toContain('Akasha Authority');
    });

    it('sem marcadores astrológicos retorna texto sem throw', () => {
      const minimal: PilaresDados = {
        cabala: { life_path: 1, birthday: 5, expression: 3, ano_pessoal: 7 },
        astrologia: {
          sol_signo: 'Escorpião', asc_signo: 'Leão', lua_signo: 'Câncer',
          lua_fase: 'cheia', trinity: { sombra: 8, dom: 11, graca: 5 }, trinity_dominante: 'dom',
          lilith_signo: null, casa_8_signo: null,
        },
        tantrica: { corpo_predominante: 7, trigemeo: 'mental', temperamento_atual: 'colerico' },
        odu: { odu_principal: 'Ogbe', odu_secundario: 'Ogunda', fonte: 'Ifá' },
        iching: { hexagrama_natal: 1, hexagrama_dia: 51, level: 'gift' },
      };
      const result = gerarNarrativaSexualidade(minimal);
      expect(typeof result).toBe('string');
    });
  });

  // ─── gerarPerfilGeral ─────────────────────────────────────────────────────

  describe('gerarPerfilGeral', () => {
    it('retorna texto não-vazio com fixture completa', () => {
      const result = gerarPerfilGeral(FIXTURE_COMPLETA);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('contém Caminho da fixture (life_path=1)', () => {
      const result = gerarPerfilGeral(FIXTURE_COMPLETA);
      expect(result).toContain('Caminho 1');
    });

    it('contém Sol em Escorpião da fixture', () => {
      const result = gerarPerfilGeral(FIXTURE_COMPLETA);
      expect(result).toContain('Sol em Escorpião');
    });

    it('contém Lua em Câncer da fixture', () => {
      const result = gerarPerfilGeral(FIXTURE_COMPLETA);
      expect(result).toContain('Lua em Câncer');
    });

    it('contém Odu Ogbe da fixture', () => {
      const result = gerarPerfilGeral(FIXTURE_COMPLETA);
      expect(result).toContain('Odu Ogbe');
    });

    it('contém Hexagrama natal da fixture (hexagrama_natal=1)', () => {
      const result = gerarPerfilGeral(FIXTURE_COMPLETA);
      expect(result).toContain('Hexagrama natal 1');
    });
  });
});
