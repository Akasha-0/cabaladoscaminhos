import { describe, it, expect } from 'vitest';
import {
  getZodiacOdu,
  getOduZodiac,
  getAllZodiacOdus,
  getSignoOduPrincipal,
  getSignoOdusSecundarios,
  getSignoOrixa,
  getSignosByElement,
  getZodiacOduSignificado,
  hasSignoOdu,
  ZODIAC_ODU_MAPPINGS,
  type ZodiacOduMapping,
  type OduInfo,
} from '@/lib/correlation/zodiac-odu';
import type { Signo } from '@/lib/correlation/zodiac-signo';

describe('zodiac-odu', () => {
  // ─── ZODIAC_ODU_MAPPINGS: all 12 signs ─────────────────────────────────────
  describe('ZODIAC_ODU_MAPPINGS', () => {
    it('contains all 12 zodiac signs', () => {
      const signs: Signo[] = [
        'Áries', 'Touro', 'Gémeos', 'Câncer', 'Leão', 'Virgem',
        'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes',
      ];
      signs.forEach((signo) => {
        expect(ZODIAC_ODU_MAPPINGS[signo]).toBeDefined();
      });
      expect(Object.keys(ZODIAC_ODU_MAPPINGS)).toHaveLength(12);
    });

    it('Áries maps to Etaogundá with correct properties', () => {
      const aries = ZODIAC_ODU_MAPPINGS['Áries'];
      expect(aries.odu_principal.nome).toBe('Etaogundá');
      expect(aries.odu_principal.numero).toBe(3);
      expect(aries.elemento).toBe('Fogo');
      expect(aries.orixa).toBe('Ogum');
      expect(aries.planeta_regente).toBe('Marte');
      expect(aries.qualidades.temperatura).toBe('Quente');
      expect(aries.qualidades.polaridade).toBe('Yang');
      expect(aries.qualidades.umidade).toBe('Seco');
      expect(aries.dia_sagrado).toBe('Terça-feira');
      expect(aries.associacoes_espirituais.length).toBeGreaterThan(0);
      expect(aries.orientacao_ritual).toBeTruthy();
    });

    it('Touro maps to Obará with correct properties', () => {
      const touro = ZODIAC_ODU_MAPPINGS['Touro'];
      expect(touro.odu_principal.nome).toBe('Obará');
      expect(touro.odu_principal.numero).toBe(6);
      expect(touro.elemento).toBe('Terra');
      expect(touro.orixa).toBe('Oxum');
      expect(touro.planeta_regente).toBe('Vénus');
      expect(touro.qualidades.temperatura).toBe('Frio');
      expect(touro.qualidades.polaridade).toBe('Yin');
      expect(touro.dia_sagrado).toBe('Sábado');
    });

    it('Gémeos maps to Ejiokô with correct properties', () => {
      const gemos = ZODIAC_ODU_MAPPINGS['Gémeos'];
      expect(gemos.odu_principal.nome).toBe('Ejiokô');
      expect(gemos.odu_principal.numero).toBe(2);
      expect(gemos.elemento).toBe('Ar');
      expect(gemos.orixa).toBe('Oxumaré');
      expect(gemos.planeta_regente).toBe('Mercúrio');
      expect(gemos.qualidades.temperatura).toBe('Neutro');
      expect(gemos.qualidades.polaridade).toBe('Yang');
      expect(gemos.dia_sagrado).toBe('Quarta-feira');
    });

    it('Câncer maps to Irosun with correct properties', () => {
      const cancer = ZODIAC_ODU_MAPPINGS['Câncer'];
      expect(cancer.odu_principal.nome).toBe('Irosun');
      expect(cancer.odu_principal.numero).toBe(4);
      expect(cancer.elemento).toBe('Água');
      expect(cancer.orixa).toBe('Iemanjá');
      expect(cancer.planeta_regente).toBe('Lua');
      expect(cancer.qualidades.temperatura).toBe('Frio');
      expect(cancer.qualidades.polaridade).toBe('Yin');
      expect(cancer.dia_sagrado).toBe('Sábado');
    });

    it('Leão maps to Obará with correct properties', () => {
      const leao = ZODIAC_ODU_MAPPINGS['Leão'];
      expect(leao.odu_principal.nome).toBe('Obará');
      expect(leao.odu_principal.numero).toBe(6);
      expect(leao.elemento).toBe('Fogo');
      expect(leao.orixa).toBe('Xangô');
      expect(leao.planeta_regente).toBe('Sol');
      expect(leao.qualidades.temperatura).toBe('Quente');
      expect(leao.qualidades.polaridade).toBe('Yang');
      expect(leao.dia_sagrado).toBe('Domingo');
    });

    it('Virgem maps to Ofun with correct properties', () => {
      const virgem = ZODIAC_ODU_MAPPINGS['Virgem'];
      expect(virgem.odu_principal.nome).toBe('Ofun');
      expect(virgem.odu_principal.numero).toBe(10);
      expect(virgem.elemento).toBe('Terra');
      expect(virgem.orixa).toBe('Oxóssi');
      expect(virgem.planeta_regente).toBe('Mercúrio');
      expect(virgem.qualidades.temperatura).toBe('Frio');
      expect(virgem.qualidades.polaridade).toBe('Yin');
      expect(virgem.dia_sagrado).toBe('Quinta-feira');
    });

    it('Libra maps to EjiOníle with correct properties', () => {
      const libra = ZODIAC_ODU_MAPPINGS['Libra'];
      expect(libra.odu_principal.nome).toBe('EjiOníle');
      expect(libra.odu_principal.numero).toBe(8);
      expect(libra.elemento).toBe('Ar');
      expect(libra.orixa).toBe('Oxalá');
      expect(libra.planeta_regente).toBe('Vénus');
      expect(libra.qualidades.temperatura).toBe('Neutro');
      expect(libra.qualidades.polaridade).toBe('Yang');
      expect(libra.dia_sagrado).toBe('Sexta-feira');
    });

    it('Escorpião maps to Odi with correct properties', () => {
      const escorpiao = ZODIAC_ODU_MAPPINGS['Escorpião'];
      expect(escorpião.odu_principal.nome).toBe('Odi');
      expect(escorpião.odu_principal.numero).toBe(7);
      expect(escorpião.elemento).toBe('Água');
      expect(escorpião.orixa).toBe('Oxumaré');
      expect(escorpião.planeta_regente).toBe('Plutão');
      expect(escorpião.qualidades.temperatura).toBe('Frio');
      expect(escorpião.qualidades.polaridade).toBe('Yin');
      expect(escorpião.dia_sagrado).toBe('Terça-feira');
    });

    it('Sagitário maps to Oxé with correct properties', () => {
      const sagitario = ZODIAC_ODU_MAPPINGS['Sagitário'];
      expect(sagitario.odu_principal.nome).toBe('Oxé');
      expect(sagitario.odu_principal.numero).toBe(5);
      expect(sagitario.elemento).toBe('Fogo');
      expect(sagitario.orixa).toBe('Oxóssi');
      expect(sagitario.planeta_regente).toBe('Júpiter');
      expect(sagitario.qualidades.temperatura).toBe('Quente');
      expect(sagitario.qualidades.polaridade).toBe('Yang');
      expect(sagitario.dia_sagrado).toBe('Quinta-feira');
    });

    it('Capricórnio maps to Okaran with correct properties', () => {
      const capricornio = ZODIAC_ODU_MAPPINGS['Capricórnio'];
      expect(capricornio.odu_principal.nome).toBe('Okaran');
      expect(capricornio.odu_principal.numero).toBe(1);
      expect(capricornio.elemento).toBe('Terra');
      expect(capricornio.orixa).toBe('Omolu');
      expect(capricornio.planeta_regente).toBe('Saturno');
      expect(capricornio.qualidades.temperatura).toBe('Frio');
      expect(capricornio.qualidades.polaridade).toBe('Yin');
      expect(capricornio.dia_sagrado).toBe('Segunda-feira');
    });

    it('Aquário maps to Ofun with correct properties', () => {
      const aquario = ZODIAC_ODU_MAPPINGS['Aquário'];
      expect(aquario.odu_principal.nome).toBe('Ofun');
      expect(aquario.odu_principal.numero).toBe(10);
      expect(aquario.elemento).toBe('Ar');
      expect(aquario.orixa).toBe('Nanã');
      expect(aquario.planeta_regente).toBe('Urano');
      expect(aquario.qualidades.temperatura).toBe('Neutro');
      expect(aquario.qualidades.polaridade).toBe('Yang');
      expect(aquario.dia_sagrado).toBe('Sábado');
    });

    it('Peixes maps to Ossá with correct properties', () => {
      const peixes = ZODIAC_ODU_MAPPINGS['Peixes'];
      expect(peixes.odu_principal.nome).toBe('Ossá');
      expect(peixes.odu_principal.numero).toBe(9);
      expect(peixes.elemento).toBe('Água');
      expect(peixes.orixa).toBe('Iemanjá');
      expect(peixes.planeta_regente).toBe('Neptuno');
      expect(peixes.qualidades.temperatura).toBe('Frio');
      expect(peixes.qualidades.polaridade).toBe('Yin');
      expect(peixes.dia_sagrado).toBe('Sábado');
    });

    it('each sign has secondary Odu(s)', () => {
      const signs: Signo[] = [
        'Áries', 'Touro', 'Gémeos', 'Câncer', 'Leão', 'Virgem',
        'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes',
      ];
      signs.forEach((signo) => {
        const mapping = ZODIAC_ODU_MAPPINGS[signo];
        expect(mapping.odus_secundarios.length).toBeGreaterThan(0);
        mapping.odus_secundarios.forEach((odu) => {
          expect(odu.nome).toBeTruthy();
          expect(odu.numero).toBeGreaterThan(0);
          expect(odu.numero).toBeLessThanOrEqual(16);
        });
      });
    });

    it('each sign has spiritual associations', () => {
      const signs: Signo[] = [
        'Áries', 'Touro', 'Gémeos', 'Câncer', 'Leão', 'Virgem',
        'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes',
      ];
      signs.forEach((signo) => {
        const mapping = ZODIAC_ODU_MAPPINGS[signo];
        expect(mapping.associacoes_espirituais.length).toBeGreaterThan(0);
      });
    });

    it('each sign has conexao_elemental', () => {
      const signs: Signo[] = [
        'Áries', 'Touro', 'Gémeos', 'Câncer', 'Leão', 'Virgem',
        'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes',
      ];
      signs.forEach((signo) => {
        const mapping = ZODIAC_ODU_MAPPINGS[signo];
        expect(mapping.conexao_elemental).toBeTruthy();
        expect(mapping.conexao_elemental.length).toBeGreaterThan(10);
      });
    });

    it('each sign has significado_espiritual', () => {
      const signs: Signo[] = [
        'Áries', 'Touro', 'Gémeos', 'Câncer', 'Leão', 'Virgem',
        'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes',
      ];
      signs.forEach((signo) => {
        const mapping = ZODIAC_ODU_MAPPINGS[signo];
        expect(mapping.significado_espiritual).toBeTruthy();
        expect(mapping.significado_espiritual.length).toBeGreaterThan(20);
      });
    });
  });

  // ─── getZodiacOdu: lookup function ─────────────────────────────────────────
  describe('getZodiacOdu', () => {
    it('returns correct mapping for Áries', () => {
      const result = getZodiacOdu('Áries');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Áries');
      expect(result!.odu_principal.nome).toBe('Etaogundá');
      expect(result!.orixa).toBe('Ogum');
    });

    it('returns correct mapping for Touro', () => {
      const result = getZodiacOdu('Touro');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Touro');
      expect(result!.odu_principal.nome).toBe('Obará');
      expect(result!.orixa).toBe('Oxum');
    });

    it('returns correct mapping for Gémeos', () => {
      const result = getZodiacOdu('Gémeos');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Gémeos');
      expect(result!.odu_principal.nome).toBe('Ejiokô');
      expect(result!.orixa).toBe('Oxumaré');
    });

    it('returns correct mapping for Câncer', () => {
      const result = getZodiacOdu('Câncer');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Câncer');
      expect(result!.odu_principal.nome).toBe('Irosun');
      expect(result!.orixa).toBe('Iemanjá');
    });

    it('returns correct mapping for Leão', () => {
      const result = getZodiacOdu('Leão');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Leão');
      expect(result!.odu_principal.nome).toBe('Obará');
      expect(result!.orixa).toBe('Xangô');
    });

    it('returns correct mapping for Virgem', () => {
      const result = getZodiacOdu('Virgem');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Virgem');
      expect(result!.odu_principal.nome).toBe('Ofun');
      expect(result!.orixa).toBe('Oxóssi');
    });

    it('returns correct mapping for Libra', () => {
      const result = getZodiacOdu('Libra');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Libra');
      expect(result!.odu_principal.nome).toBe('EjiOníle');
      expect(result!.orixa).toBe('Oxalá');
    });

    it('returns correct mapping for Escorpião', () => {
      const result = getZodiacOdu('Escorpião');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Escorpião');
      expect(result!.odu_principal.nome).toBe('Odi');
      expect(result!.orixa).toBe('Oxumaré');
    });

    it('returns correct mapping for Sagitário', () => {
      const result = getZodiacOdu('Sagitário');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Sagitário');
      expect(result!.odu_principal.nome).toBe('Oxé');
      expect(result!.orixa).toBe('Oxóssi');
    });

    it('returns correct mapping for Capricórnio', () => {
      const result = getZodiacOdu('Capricórnio');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Capricórnio');
      expect(result!.odu_principal.nome).toBe('Okaran');
      expect(result!.orixa).toBe('Omolu');
    });

    it('returns correct mapping for Aquário', () => {
      const result = getZodiacOdu('Aquário');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Aquário');
      expect(result!.odu_principal.nome).toBe('Ofun');
      expect(result!.orixa).toBe('Nanã');
    });

    it('returns correct mapping for Peixes', () => {
      const result = getZodiacOdu('Peixes');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Peixes');
      expect(result!.odu_principal.nome).toBe('Ossá');
      expect(result!.orixa).toBe('Iemanjá');
    });

    it('returns null for unknown sign', () => {
      const result = getZodiacOdu('Unknown');
      expect(result).toBeNull();
    });

    it('returns null for empty string', () => {
      const result = getZodiacOdu('');
      expect(result).toBeNull();
    });
  });

  // ─── getOduZodiac: reverse lookup ───────────────────────────────────────────
  describe('getOduZodiac', () => {
    it('returns Áries for Etaogundá', () => {
      const result = getOduZodiac('Etaogundá');
      expect(result).toBe('Áries');
    });

    it('returns Touro for Obará', () => {
      const result = getOduZodiac('Obará');
      expect(result).toBe('Touro');
    });

    it('returns Gémeos for Ejiokô', () => {
      const result = getOduZodiac('Ejiokô');
      expect(result).toBe('Gémeos');
    });

    it('returns Câncer for Irosun', () => {
      const result = getOduZodiac('Irosun');
      expect(result).toBe('Câncer');
    });

    it('returns null for unknown Odu', () => {
      const result = getOduZodiac('Unknown');
      expect(result).toBeNull();
    });

    it('returns null for empty string', () => {
      const result = getOduZodiac('');
      expect(result).toBeNull();
    });

    it('finds sign from secondary Odu', () => {
      // Okaran is a secondary Odu for both Áries and Touro
      // The function returns the first match
      const result = getOduZodiac('Okaran');
      expect(result).toBeTruthy();
      expect(['Áries', 'Touro']).toContain(result);
    });
  });

  // ─── getAllZodiacOdus: collection function ─────────────────────────────────
  describe('getAllZodiacOdus', () => {
    it('returns all 12 mappings', () => {
      const result = getAllZodiacOdus();
      expect(result).toHaveLength(12);
    });

    it('returns an array of ZodiacOduMapping objects', () => {
      const result = getAllZodiacOdus();
      result.forEach((mapping) => {
        expect(mapping.signo).toBeTruthy();
        expect(mapping.odu_principal).toBeDefined();
        expect(mapping.elemento).toBeTruthy();
        expect(mapping.orixa).toBeTruthy();
      });
    });

    it('contains expected signs', () => {
      const result = getAllZodiacOdus();
      const signNames = result.map(m => m.signo);
      expect(signNames).toContain('Áries');
      expect(signNames).toContain('Leão');
      expect(signNames).toContain('Escorpião');
      expect(signNames).toContain('Peixes');
    });
  });

  // ─── getSignoOduPrincipal: get primary Odu ──────────────────────────────────
  describe('getSignoOduPrincipal', () => {
    it('returns OduInfo for Áries', () => {
      const result = getSignoOduPrincipal('Áries');
      expect(result).not.toBeNull();
      expect(result!.nome).toBe('Etaogundá');
      expect(result!.numero).toBe(3);
      expect(result!.significado).toBeTruthy();
    });

    it('returns null for unknown sign', () => {
      const result = getSignoOduPrincipal('Unknown');
      expect(result).toBeNull();
    });
  });

  // ─── getSignoOdusSecundarios: get secondary Odus ───────────────────────────
  describe('getSignoOdusSecundarios', () => {
    it('returns array of secondary Odus for Áries', () => {
      const result = getSignoOdusSecundarios('Áries');
      expect(result).not.toBeNull();
      expect(result!.length).toBeGreaterThan(0);
      expect(result![0].nome).toBe('Okaran');
    });

    it('returns null for unknown sign', () => {
      const result = getSignoOdusSecundarios('Unknown');
      expect(result).toBeNull();
    });
  });

  // ─── getSignoOrixa: get Orixá for sign ──────────────────────────────────────
  describe('getSignoOrixa', () => {
    it('returns Ogum for Áries', () => {
      expect(getSignoOrixa('Áries')).toBe('Ogum');
    });

    it('returns Oxum for Touro', () => {
      expect(getSignoOrixa('Touro')).toBe('Oxum');
    });

    it('returns Iemanjá for Câncer', () => {
      expect(getSignoOrixa('Câncer')).toBe('Iemanjá');
    });

    it('returns Xangô for Leão', () => {
      expect(getSignoOrixa('Leão')).toBe('Xangô');
    });

    it('returns null for unknown sign', () => {
      expect(getSignoOrixa('Unknown')).toBeNull();
    });
  });

  // ─── getSignosByElement: get signs by element ───────────────────────────────
  describe('getSignosByElement', () => {
    it('returns 4 fire signs', () => {
      const fireSigns = getSignosByElement('Fogo');
      expect(fireSigns).toHaveLength(4);
      expect(fireSigns).toContain('Áries');
      expect(fireSigns).toContain('Leão');
      expect(fireSigns).toContain('Sagitário');
    });

    it('returns 3 water signs', () => {
      const waterSigns = getSignosByElement('Água');
      expect(waterSigns).toHaveLength(4);
      expect(waterSigns).toContain('Câncer');
      expect(waterSigns).toContain('Escorpião');
      expect(waterSigns).toContain('Peixes');
    });

    it('returns 3 air signs', () => {
      const airSigns = getSignosByElement('Ar');
      expect(airSigns).toHaveLength(3);
      expect(airSigns).toContain('Gémeos');
      expect(airSigns).toContain('Libra');
      expect(airSigns).toContain('Aquário');
    });

    it('returns 3 earth signs', () => {
      const earthSigns = getSignosByElement('Terra');
      expect(earthSigns).toHaveLength(3);
      expect(earthSigns).toContain('Touro');
      expect(earthSigns).toContain('Virgem');
      expect(earthSigns).toContain('Capricórnio');
    });

    it('returns empty array for unknown element', () => {
      const result = getSignosByElement('Unknown');
      expect(result).toHaveLength(0);
    });
  });

  // ─── getZodiacOduSignificado: get spiritual meaning ───────────────────────
  describe('getZodiacOduSignificado', () => {
    it('returns spiritual meaning for Áries', () => {
      const result = getZodiacOduSignificado('Áries');
      expect(result).not.toBeNull();
      expect(result!.length).toBeGreaterThan(20);
      expect(result!.toLowerCase()).toContain('guerreiro');
    });

    it('returns null for unknown sign', () => {
      const result = getZodiacOduSignificado('Unknown');
      expect(result).toBeNull();
    });
  });

  // ─── hasSignoOdu: check if sign has Odu ─────────────────────────────────────
  describe('hasSignoOdu', () => {
    it('returns true when sign has principal Odu', () => {
      expect(hasSignoOdu('Áries', 'Etaogundá')).toBe(true);
    });

    it('returns true when sign has secondary Odu', () => {
      expect(hasSignoOdu('Áries', 'Okaran')).toBe(true);
    });

    it('returns false when sign does not have Odu', () => {
      expect(hasSignoOdu('Áries', 'Irosun')).toBe(false);
    });

    it('returns false for unknown sign', () => {
      expect(hasSignoOdu('Unknown', 'Etaogundá')).toBe(false);
    });
  });

  // ─── Type exports ───────────────────────────────────────────────────────────
  describe('type exports', () => {
    it('ZodiacOduMapping is exported', () => {
      // Type test - will fail to compile if type is not exported
      const mapping: ZodiacOduMapping = ZODIAC_ODU_MAPPINGS['Áries'];
      expect(mapping.signo).toBeTruthy();
    });

    it('OduInfo is exported', () => {
      // Type test - will fail to compile if type is not exported
      const odu: OduInfo = {
        numero: 1,
        nome: 'Okaran',
        significado: 'Test',
      };
      expect(odu.numero).toBe(1);
    });
  });

  // ─── Element consistency checks ───────────────────────────────────────────
  describe('element consistency', () => {
    it('Fogo signs have quente temperature', () => {
      const fireSigns = getSignosByElement('Fogo');
      fireSigns.forEach((signo) => {
        const mapping = getZodiacOdu(signo);
        expect(mapping!.qualidades.temperatura).toBe('Quente');
      });
    });

    it('Água signs have frio temperature', () => {
      const waterSigns = getSignosByElement('Água');
      waterSigns.forEach((signo) => {
        const mapping = getZodiacOdu(signo);
        expect(mapping!.qualidades.temperatura).toBe('Frio');
      });
    });

    it('Yang signs are fire/air elements', () => {
      const allMappings = getAllZodiacOdus();
      allMappings.filter(m => m.qualidades.polaridade === 'Yang').forEach((mapping) => {
        expect(['Fogo', 'Ar']).toContain(mapping.elemento);
      });
    });

    it('Yin signs are earth/water elements', () => {
      const allMappings = getAllZodiacOdus();
      allMappings.filter(m => m.qualidades.polaridade === 'Yin').forEach((mapping) => {
        expect(['Terra', 'Água']).toContain(mapping.elemento);
      });
    });
  });
});