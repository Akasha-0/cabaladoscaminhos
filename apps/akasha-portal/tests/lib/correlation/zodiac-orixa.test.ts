import { describe, it, expect } from 'vitest';
import {
  getZodiacOrixa,
  getOrixaZodiac,
  getAllZodiacOrixas,
  getSignoOrixaPrincipal,
  getSignoOrixasSecundarios,
  getZodiacOrixaSignificado,
  getSignosByElement,
  hasSignoOrixa,
  getSignoDiaSagrado,
  getSignosByPlaneta,
  ZODIAC_ORIXA_MAPPINGS,
  type ZodiacOrixaMapping,
  type OrixaInfo,
} from '@/lib/correlation/zodiac-orixa';
import type { Signo } from '@/lib/correlation/zodiac-signo';

describe('zodiac-orixa', () => {
  // ─── ZODIAC_ORIXA_MAPPINGS: all 12 signs ─────────────────────────────────────
  describe('ZODIAC_ORIXA_MAPPINGS', () => {
    it('contains all 12 zodiac signs', () => {
      const signs: Signo[] = [
        'Áries', 'Touro', 'Gémeos', 'Câncer', 'Leão', 'Virgem',
        'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes',
      ];
      signs.forEach((signo) => {
        expect(ZODIAC_ORIXA_MAPPINGS[signo]).toBeDefined();
      });
      expect(Object.keys(ZODIAC_ORIXA_MAPPINGS)).toHaveLength(12);
    });

    it('Áries maps to Ogum with correct properties', () => {
      const aries = ZODIAC_ORIXA_MAPPINGS['Áries'];
      expect(aries.orixa_principal.nome).toBe('Ogum');
      expect(aries.elemento).toBe('Fogo');
      expect(aries.planeta_regente).toBe('Marte');
      expect(aries.qualidades.temperatura).toBe('Quente');
      expect(aries.qualidades.polaridade).toBe('Yang');
      expect(aries.qualidades.umidade).toBe('Seco');
      expect(aries.dia_sagrado).toBe('Terça-feira');
      expect(aries.associacoes_espirituais.length).toBeGreaterThan(0);
      expect(aries.orientacao_ritual).toBeTruthy();
    });

    it('Touro maps to Oxum with correct properties', () => {
      const touro = ZODIAC_ORIXA_MAPPINGS['Touro'];
      expect(touro.orixa_principal.nome).toBe('Oxum');
      expect(touro.elemento).toBe('Terra');
      expect(touro.planeta_regente).toBe('Vénus');
      expect(touro.qualidades.temperatura).toBe('Frio');
      expect(touro.qualidades.polaridade).toBe('Yin');
      expect(touro.dia_sagrado).toBe('Sábado');
    });

    it('Gémeos maps to Oxumaré with correct properties', () => {
      const gemos = ZODIAC_ORIXA_MAPPINGS['Gémeos'];
      expect(gemos.orixa_principal.nome).toBe('Oxumaré');
      expect(gemos.elemento).toBe('Ar');
      expect(gemos.planeta_regente).toBe('Mercúrio');
      expect(gemos.qualidades.temperatura).toBe('Neutro');
      expect(gemos.qualidades.polaridade).toBe('Yang');
      expect(gemos.dia_sagrado).toBe('Quarta-feira');
    });

    it('Câncer maps to Iemanjá with correct properties', () => {
      const cancer = ZODIAC_ORIXA_MAPPINGS['Câncer'];
      expect(cancer.orixa_principal.nome).toBe('Iemanjá');
      expect(cancer.elemento).toBe('Água');
      expect(cancer.planeta_regente).toBe('Lua');
      expect(cancer.qualidades.temperatura).toBe('Frio');
      expect(cancer.qualidades.polaridade).toBe('Yin');
      expect(cancer.dia_sagrado).toBe('Sábado');
    });

    it('Leão maps to Xangô with correct properties', () => {
      const leao = ZODIAC_ORIXA_MAPPINGS['Leão'];
      expect(leao.orixa_principal.nome).toBe('Xangô');
      expect(leao.elemento).toBe('Fogo');
      expect(leao.planeta_regente).toBe('Sol');
      expect(leao.qualidades.temperatura).toBe('Quente');
      expect(leao.qualidades.polaridade).toBe('Yang');
      expect(leao.dia_sagrado).toBe('Quarta-feira');
    });

    it('Virgem maps to Oxóssi with correct properties', () => {
      const virgem = ZODIAC_ORIXA_MAPPINGS['Virgem'];
      expect(virgem.orixa_principal.nome).toBe('Oxóssi');
      expect(virgem.elemento).toBe('Terra');
      expect(virgem.planeta_regente).toBe('Mercúrio');
      expect(virgem.qualidades.temperatura).toBe('Frio');
      expect(virgem.qualidades.polaridade).toBe('Yin');
      expect(virgem.dia_sagrado).toBe('Quinta-feira');
    });

    it('Libra maps to Oxalá with correct properties', () => {
      const libra = ZODIAC_ORIXA_MAPPINGS['Libra'];
      expect(libra.orixa_principal.nome).toBe('Oxalá');
      expect(libra.elemento).toBe('Ar');
      expect(libra.planeta_regente).toBe('Vénus');
      expect(libra.qualidades.temperatura).toBe('Neutro');
      expect(libra.qualidades.polaridade).toBe('Yang');
      expect(libra.dia_sagrado).toBe('Sexta-feira');
    });

    it('Escorpião maps to Oxumaré with correct properties', () => {
      const escorpiao = ZODIAC_ORIXA_MAPPINGS['Escorpião'];
      expect(escorpiao.orixa_principal.nome).toBe('Oxumaré');
      expect(escorpiao.elemento).toBe('Água');
      expect(escorpiao.planeta_regente).toBe('Plutão');
      expect(escorpiao.qualidades.temperatura).toBe('Frio');
      expect(escorpiao.qualidades.polaridade).toBe('Yin');
      expect(escorpiao.dia_sagrado).toBe('Quarta-feira');
    });

    it('Sagitário maps to Oxóssi with correct properties', () => {
      const sagitario = ZODIAC_ORIXA_MAPPINGS['Sagitário'];
      expect(sagitario.orixa_principal.nome).toBe('Oxóssi');
      expect(sagitario.elemento).toBe('Fogo');
      expect(sagitario.planeta_regente).toBe('Júpiter');
      expect(sagitario.qualidades.temperatura).toBe('Quente');
      expect(sagitario.qualidades.polaridade).toBe('Yang');
      expect(sagitario.dia_sagrado).toBe('Quinta-feira');
    });

    it('Capricórnio maps to Omolu with correct properties', () => {
      const capricornio = ZODIAC_ORIXA_MAPPINGS['Capricórnio'];
      expect(capricornio.orixa_principal.nome).toBe('Omolu');
      expect(capricornio.elemento).toBe('Terra');
      expect(capricornio.planeta_regente).toBe('Saturno');
      expect(capricornio.qualidades.temperatura).toBe('Frio');
      expect(capricornio.qualidades.polaridade).toBe('Yin');
      expect(capricornio.dia_sagrado).toBe('Segunda-feira');
    });

    it('Aquário maps to Nanã with correct properties', () => {
      const aquario = ZODIAC_ORIXA_MAPPINGS['Aquário'];
      expect(aquario.orixa_principal.nome).toBe('Nanã');
      expect(aquario.elemento).toBe('Ar');
      expect(aquario.planeta_regente).toBe('Urano');
      expect(aquario.qualidades.temperatura).toBe('Neutro');
      expect(aquario.qualidades.polaridade).toBe('Yang');
      expect(aquario.dia_sagrado).toBe('Terça-feira');
    });

    it('Peixes maps to Iemanjá with correct properties', () => {
      const peixes = ZODIAC_ORIXA_MAPPINGS['Peixes'];
      expect(peixes.orixa_principal.nome).toBe('Iemanjá');
      expect(peixes.elemento).toBe('Água');
      expect(peixes.planeta_regente).toBe('Neptuno');
      expect(peixes.qualidades.temperatura).toBe('Frio');
      expect(peixes.qualidades.polaridade).toBe('Yin');
      expect(peixes.dia_sagrado).toBe('Sábado');
    });

    it('each sign has secondary Orixá(s)', () => {
      const signs: Signo[] = [
        'Áries', 'Touro', 'Gémeos', 'Câncer', 'Leão', 'Virgem',
        'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes',
      ];
      signs.forEach((signo) => {
        const mapping = ZODIAC_ORIXA_MAPPINGS[signo];
        expect(mapping.orixas_secundarios.length).toBeGreaterThan(0);
        mapping.orixas_secundarios.forEach((orixa) => {
          expect(orixa.nome).toBeTruthy();
          expect(orixa.dia_sagrado).toBeTruthy();
          expect(orixa.elemento).toBeTruthy();
          expect(orixa.cores.length).toBeGreaterThan(0);
        });
      });
    });

    it('each sign has spiritual associations', () => {
      const signs: Signo[] = [
        'Áries', 'Touro', 'Gémeos', 'Câncer', 'Leão', 'Virgem',
        'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes',
      ];
      signs.forEach((signo) => {
        const mapping = ZODIAC_ORIXA_MAPPINGS[signo];
        expect(mapping.associacoes_espirituais.length).toBeGreaterThan(0);
      });
    });

    it('each sign has conexao_espiritual', () => {
      const signs: Signo[] = [
        'Áries', 'Touro', 'Gémeos', 'Câncer', 'Leão', 'Virgem',
        'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes',
      ];
      signs.forEach((signo) => {
        const mapping = ZODIAC_ORIXA_MAPPINGS[signo];
        expect(mapping.conexao_espiritual).toBeTruthy();
        expect(mapping.conexao_espiritual.length).toBeGreaterThan(10);
      });
    });

    it('each sign has significado_espiritual', () => {
      const signs: Signo[] = [
        'Áries', 'Touro', 'Gémeos', 'Câncer', 'Leão', 'Virgem',
        'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes',
      ];
      signs.forEach((signo) => {
        const mapping = ZODIAC_ORIXA_MAPPINGS[signo];
        expect(mapping.significado_espiritual).toBeTruthy();
        expect(mapping.significado_espiritual.length).toBeGreaterThan(20);
      });
    });

    it('each sign has qualities (temperatura, umidade, polaridade)', () => {
      const signs: Signo[] = [
        'Áries', 'Touro', 'Gémeos', 'Câncer', 'Leão', 'Virgem',
        'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes',
      ];
      signs.forEach((signo) => {
        const mapping = ZODIAC_ORIXA_MAPPINGS[signo];
        expect(['Quente', 'Frio', 'Neutro']).toContain(mapping.qualidades.temperatura);
        expect(['Seco', 'Úmido']).toContain(mapping.qualidades.umidade);
        expect(['Yang', 'Yin']).toContain(mapping.qualidades.polaridade);
      });
    });

    it('Fogo signs have Quente temperature', () => {
      const fogoSigns: Signo[] = ['Áries', 'Leão', 'Sagitário'];
      fogoSigns.forEach((signo) => {
        const mapping = ZODIAC_ORIXA_MAPPINGS[signo];
        expect(mapping.elemento).toBe('Fogo');
        expect(mapping.qualidades.temperatura).toBe('Quente');
      });
    });

    it('Terra signs have Frio temperature', () => {
      const terraSigns: Signo[] = ['Touro', 'Virgem', 'Capricórnio'];
      terraSigns.forEach((signo) => {
        const mapping = ZODIAC_ORIXA_MAPPINGS[signo];
        expect(mapping.elemento).toBe('Terra');
        expect(mapping.qualidades.temperatura).toBe('Frio');
      });
    });

    it('Água signs have Frio temperature', () => {
      const aguaSigns: Signo[] = ['Câncer', 'Escorpião', 'Peixes'];
      aguaSigns.forEach((signo) => {
        const mapping = ZODIAC_ORIXA_MAPPINGS[signo];
        expect(mapping.elemento).toBe('Água');
        expect(mapping.qualidades.temperatura).toBe('Frio');
      });
    });

    it('Ar signs have Neutro temperature', () => {
      const arSigns: Signo[] = ['Gémeos', 'Libra', 'Aquário'];
      arSigns.forEach((signo) => {
        const mapping = ZODIAC_ORIXA_MAPPINGS[signo];
        expect(mapping.elemento).toBe('Ar');
        expect(mapping.qualidades.temperatura).toBe('Neutro');
      });
    });
  });

  // ─── getZodiacOrixa: lookup function ─────────────────────────────────────────
  describe('getZodiacOrixa', () => {
    it('returns correct mapping for Áries', () => {
      const result = getZodiacOrixa('Áries');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Áries');
      expect(result!.orixa_principal.nome).toBe('Ogum');
    });

    it('returns correct mapping for Touro', () => {
      const result = getZodiacOrixa('Touro');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Touro');
      expect(result!.orixa_principal.nome).toBe('Oxum');
    });

    it('returns correct mapping for Gémeos', () => {
      const result = getZodiacOrixa('Gémeos');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Gémeos');
      expect(result!.orixa_principal.nome).toBe('Oxumaré');
    });

    it('returns correct mapping for Câncer', () => {
      const result = getZodiacOrixa('Câncer');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Câncer');
      expect(result!.orixa_principal.nome).toBe('Iemanjá');
    });

    it('returns correct mapping for Leão', () => {
      const result = getZodiacOrixa('Leão');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Leão');
      expect(result!.orixa_principal.nome).toBe('Xangô');
    });

    it('returns correct mapping for Virgem', () => {
      const result = getZodiacOrixa('Virgem');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Virgem');
      expect(result!.orixa_principal.nome).toBe('Oxóssi');
    });

    it('returns correct mapping for Libra', () => {
      const result = getZodiacOrixa('Libra');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Libra');
      expect(result!.orixa_principal.nome).toBe('Oxalá');
    });

    it('returns correct mapping for Escorpião', () => {
      const result = getZodiacOrixa('Escorpião');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Escorpião');
      expect(result!.orixa_principal.nome).toBe('Oxumaré');
    });

    it('returns correct mapping for Sagitário', () => {
      const result = getZodiacOrixa('Sagitário');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Sagitário');
      expect(result!.orixa_principal.nome).toBe('Oxóssi');
    });

    it('returns correct mapping for Capricórnio', () => {
      const result = getZodiacOrixa('Capricórnio');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Capricórnio');
      expect(result!.orixa_principal.nome).toBe('Omolu');
    });

    it('returns correct mapping for Aquário', () => {
      const result = getZodiacOrixa('Aquário');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Aquário');
      expect(result!.orixa_principal.nome).toBe('Nanã');
    });

    it('returns correct mapping for Peixes', () => {
      const result = getZodiacOrixa('Peixes');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Peixes');
      expect(result!.orixa_principal.nome).toBe('Iemanjá');
    });

    it('returns null for invalid sign', () => {
      const result = getZodiacOrixa('InvalidSign');
      expect(result).toBeNull();
    });

    it('returns null for empty string', () => {
      const result = getZodiacOrixa('');
      expect(result).toBeNull();
    });
  });

  // ─── getOrixaZodiac: reverse lookup ───────────────────────────────────────────
  describe('getOrixaZodiac', () => {
    it('returns Áries for Ogum (primary)', () => {
      const result = getOrixaZodiac('Ogum');
      expect(result).toBe('Áries');
    });

    it('returns Touro for Oxum (primary)', () => {
      const result = getOrixaZodiac('Oxum');
      expect(result).toBe('Touro');
    });

    it('returns Gémeos for Oxumaré (primary)', () => {
      const result = getOrixaZodiac('Oxumaré');
      expect(result).toBe('Gémeos');
    });

    it('returns Câncer for Iemanjá (primary)', () => {
      const result = getOrixaZodiac('Iemanjá');
      expect(result).toBe('Câncer');
    });

    it('returns Leão for Xangô', () => {
      const result = getOrixaZodiac('Xangô');
      expect(result).toBe('Leão');
    });

    it('returns Virgem for Oxóssi (primary)', () => {
      const result = getOrixaZodiac('Oxóssi');
      expect(result).toBe('Virgem');
    });

    it('returns Libra for Oxalá', () => {
      const result = getOrixaZodiac('Oxalá');
      expect(result).toBe('Libra');
    });

    it('returns Capricórnio for Omolu (primary)', () => {
      const result = getOrixaZodiac('Omolu');
      expect(result).toBe('Capricórnio');
    });

    it('returns Aquário for Nanã (primary)', () => {
      const result = getOrixaZodiac('Nanã');
      expect(result).toBe('Aquário');
    });

    it('returns null for invalid Orixá', () => {
      const result = getOrixaZodiac('InvalidOrixa');
      expect(result).toBeNull();
    });

    it('finds Orixá in secondary list (Iansã -> Áries)', () => {
      const result = getOrixaZodiac('Iansã');
      expect(result).toBe('Áries');
    });

    it('finds Oxalá in Aquário secondary list', () => {
      const result = getOrixaZodiac('Oxalá');
      // Oxalá is primary in Libra, secondary in Aquário
      expect(['Libra', 'Aquário']).toContain(result);
    });
  });

  // ─── getAllZodiacOrixas: collection function ─────────────────────────────────
  describe('getAllZodiacOrixas', () => {
    it('returns all 12 mappings', () => {
      const result = getAllZodiacOrixas();
      expect(result).toHaveLength(12);
    });

    it('returns array with all signs', () => {
      const result = getAllZodiacOrixas();
      const signNames = result.map(r => r.signo);
      expect(signNames).toContain('Áries');
      expect(signNames).toContain('Touro');
      expect(signNames).toContain('Gémeos');
      expect(signNames).toContain('Câncer');
      expect(signNames).toContain('Leão');
      expect(signNames).toContain('Virgem');
      expect(signNames).toContain('Libra');
      expect(signNames).toContain('Escorpião');
      expect(signNames).toContain('Sagitário');
      expect(signNames).toContain('Capricórnio');
      expect(signNames).toContain('Aquário');
      expect(signNames).toContain('Peixes');
    });

    it('each item has required properties', () => {
      const result = getAllZodiacOrixas();
      result.forEach((mapping) => {
        expect(mapping.signo).toBeTruthy();
        expect(mapping.elemento).toBeTruthy();
        expect(mapping.orixa_principal).toBeTruthy();
        expect(mapping.planeta_regente).toBeTruthy();
      });
    });
  });

  // ─── getSignoOrixaPrincipal: get primary Orixá ──────────────────────────────────
  describe('getSignoOrixaPrincipal', () => {
    it('returns correct primary Orixá for Áries', () => {
      const result = getSignoOrixaPrincipal('Áries');
      expect(result).not.toBeNull();
      expect(result!.nome).toBe('Ogum');
    });

    it('returns correct primary Orixá for Leão', () => {
      const result = getSignoOrixaPrincipal('Leão');
      expect(result).not.toBeNull();
      expect(result!.nome).toBe('Xangô');
    });

    it('returns null for invalid sign', () => {
      const result = getSignoOrixaPrincipal('Invalid');
      expect(result).toBeNull();
    });

    it('primary Orixá has required properties', () => {
      const result = getSignoOrixaPrincipal('Áries');
      expect(result!.nome).toBeTruthy();
      expect(result!.dia_sagrado).toBeTruthy();
      expect(result!.elemento).toBeTruthy();
      expect(result!.cores.length).toBeGreaterThan(0);
    });
  });

  // ─── getSignoOrixasSecundarios: get secondary Orixás ───────────────────────────
  describe('getSignoOrixasSecundarios', () => {
    it('returns secondary Orixás for Áries', () => {
      const result = getSignoOrixasSecundarios('Áries');
      expect(result).not.toBeNull();
      expect(result!.length).toBeGreaterThan(0);
      expect(result![0].nome).toBe('Iansã');
    });

    it('returns secondary Orixás for Escorpião', () => {
      const result = getSignoOrixasSecundarios('Escorpião');
      expect(result).not.toBeNull();
      expect(result!.length).toBe(2);
    });

    it('returns null for invalid sign', () => {
      const result = getSignoOrixasSecundarios('Invalid');
      expect(result).toBeNull();
    });
  });

  // ─── getZodiacOrixaSignificado: get spiritual meaning ───────────────────────
  describe('getZodiacOrixaSignificado', () => {
    it('returns spiritual meaning for Áries', () => {
      const result = getZodiacOrixaSignificado('Áries');
      expect(result).not.toBeNull();
      expect(result!.length).toBeGreaterThan(20);
      expect(result).toContain('guerreiro');
    });

    it('returns spiritual meaning for Câncer', () => {
      const result = getZodiacOrixaSignificado('Câncer');
      expect(result).not.toBeNull();
      expect(result).toContain('mãe');
    });

    it('returns null for invalid sign', () => {
      const result = getZodiacOrixaSignificado('Invalid');
      expect(result).toBeNull();
    });
  });

  // ─── getSignosByElement: get signs by element ───────────────────────────────
  describe('getSignosByElement', () => {
    it('returns 3 signs for Fogo', () => {
      const result = getSignosByElement('Fogo');
      expect(result).toHaveLength(3);
      expect(result).toContain('Áries');
      expect(result).toContain('Leão');
      expect(result).toContain('Sagitário');
    });

    it('returns 3 signs for Terra', () => {
      const result = getSignosByElement('Terra');
      expect(result).toHaveLength(3);
      expect(result).toContain('Touro');
      expect(result).toContain('Virgem');
      expect(result).toContain('Capricórnio');
    });

    it('returns 3 signs for Água', () => {
      const result = getSignosByElement('Água');
      expect(result).toHaveLength(3);
      expect(result).toContain('Câncer');
      expect(result).toContain('Escorpião');
      expect(result).toContain('Peixes');
    });

    it('returns 3 signs for Ar', () => {
      const result = getSignosByElement('Ar');
      expect(result).toHaveLength(3);
      expect(result).toContain('Gémeos');
      expect(result).toContain('Libra');
      expect(result).toContain('Aquário');
    });

    it('returns empty array for invalid element', () => {
      const result = getSignosByElement('Invalid');
      expect(result).toHaveLength(0);
    });
  });

  // ─── hasSignoOrixa: check if sign has Orixá ─────────────────────────────────────
  describe('hasSignoOrixa', () => {
    it('returns true for Áries with Ogum', () => {
      expect(hasSignoOrixa('Áries', 'Ogum')).toBe(true);
    });

    it('returns true for Áries with Iansã (secondary)', () => {
      expect(hasSignoOrixa('Áries', 'Iansã')).toBe(true);
    });

    it('returns false for Áries with Oxum', () => {
      expect(hasSignoOrixa('Áries', 'Oxum')).toBe(false);
    });

    it('returns false for invalid sign', () => {
      expect(hasSignoOrixa('Invalid', 'Ogum')).toBe(false);
    });

    it('returns false for invalid Orixá', () => {
      expect(hasSignoOrixa('Áries', 'Invalid')).toBe(false);
    });
  });

  // ─── getSignoDiaSagrado: get sacred day ─────────────────────────────────────
  describe('getSignoDiaSagrado', () => {
    it('returns Terça-feira for Áries', () => {
      expect(getSignoDiaSagrado('Áries')).toBe('Terça-feira');
    });

    it('returns Sábado for Touro', () => {
      expect(getSignoDiaSagrado('Touro')).toBe('Sábado');
    });

    it('returns Quarta-feira for Gémeos', () => {
      expect(getSignoDiaSagrado('Gémeos')).toBe('Quarta-feira');
    });

    it('returns null for invalid sign', () => {
      expect(getSignoDiaSagrado('Invalid')).toBeNull();
    });
  });

  // ─── getSignosByPlaneta: get signs by planet ───────────────────────────────
  describe('getSignosByPlaneta', () => {
    it('returns Áries for Marte', () => {
      const result = getSignosByPlaneta('Marte');
      expect(result).toContain('Áries');
    });

    it('returns Leão for Sol', () => {
      const result = getSignosByPlaneta('Sol');
      expect(result).toContain('Leão');
    });

    it('returns empty array for invalid planet', () => {
      const result = getSignosByPlaneta('Invalid');
      expect(result).toHaveLength(0);
    });
  });

  // ─── Type exports ───────────────────────────────────────────────────────────
  describe('type exports', () => {
    it('exports ZodiacOrixaMapping type', () => {
      const mapping: ZodiacOrixaMapping = ZODIAC_ORIXA_MAPPINGS['Áries'];
      expect(mapping.signo).toBeTruthy();
      expect(mapping.elemento).toBeTruthy();
    });

    it('exports OrixaInfo type', () => {
      const orixa: OrixaInfo = ZODIAC_ORIXA_MAPPINGS['Áries'].orixa_principal;
      expect(orixa.nome).toBeTruthy();
      expect(orixa.dia_sagrado).toBeTruthy();
      expect(orixa.elemento).toBeTruthy();
    });
  });

  // ─── Object immutability checks ─────────────────────────────────────────────
  describe('object immutability', () => {
    it('ZODIAC_ORIXA_MAPPINGS is frozen', () => {
      expect(Object.isFrozen(ZODIAC_ORIXA_MAPPINGS)).toBe(true);
    });

    it('each mapping is frozen', () => {
      const mappings = Object.values(ZODIAC_ORIXA_MAPPINGS);
      mappings.forEach((mapping) => {
        expect(Object.isFrozen(mapping)).toBe(true);
      });
    });
  });
});
