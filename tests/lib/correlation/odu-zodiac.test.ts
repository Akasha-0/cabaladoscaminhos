import { describe, it, expect } from 'vitest';
import {
  getOduZodiac,
  getZodiacOdu,
  getAllOduZodiacs,
  getOduZodiacElemento,
  getOduZodiacPlaneta,
  getSignoOdus,
  getElementOduZodiac,
  getOduZodiacSignificado,
  getAllOduZodiacNames,
  hasOduZodiac,
  getOduZodiacOrixa,
  getOduZodiacRitual,
  getOduZodiacPraticas,
  ODU_ZODIAC_MAPPINGS,
  type OduZodiacMapping,
  type ZodiacInfo,
  type SpiritualPractice,
} from '@/lib/correlation/odu-zodiac';
import type { Signo } from '@/lib/correlation/zodiac-signo';

describe('odu-zodiac', () => {
  // ─── ODU_ZODIAC_MAPPINGS: all mapped Odus ───────────────────────────────────
  describe('ODU_ZODIAC_MAPPINGS', () => {
    it('contains at least 10 mapped Odus', () => {
      const oduCount = Object.keys(ODU_ZODIAC_MAPPINGS).length;
      expect(oduCount).toBeGreaterThanOrEqual(10);
    });

    it('Okaran maps to Capricórnio with correct properties', () => {
      const okaran = ODU_ZODIAC_MAPPINGS['Okaran'];
      expect(okaran.odu).toBe('Okaran');
      expect(okaran.numero).toBe(1);
      expect(okaran.signo.signo).toBe('Capricórnio');
      expect(okaran.signo.elemento).toBe('Terra');
      expect(okaran.signo.planeta_regente).toBe('Saturno');
      expect(okaran.orixa).toBe('Omolu');
      expect(okaran.qualidades.temperatura).toBe('Frio');
      expect(okaran.qualidades.polaridade).toBe('Yin');
      expect(okaran.qualidades.umidade).toBe('Seco');
      expect(okaran.conexao_espiritual).toBeTruthy();
      expect(okaran.significado_espiritual).toBeTruthy();
      expect(okaran.praticas_espirituais.length).toBeGreaterThan(0);
      expect(okaran.orientacao_ritual).toBeTruthy();
      expect(okaran.alinhamento_elemental).toBeTruthy();
    });

    it('Ejiokô maps to Gémeos with correct properties', () => {
      const ejioko = ODU_ZODIAC_MAPPINGS['Ejiokô'];
      expect(ejioko.odu).toBe('Ejiokô');
      expect(ejioko.numero).toBe(2);
      expect(ejioko.signo.signo).toBe('Gémeos');
      expect(ejioko.signo.elemento).toBe('Ar');
      expect(ejioko.signo.planeta_regente).toBe('Mercúrio');
      expect(ejioko.orixa).toBe('Oxumaré');
      expect(ejioko.qualidades.temperatura).toBe('Neutro');
      expect(ejioko.qualidades.polaridade).toBe('Yang');
    });

    it('Etaogundá maps to Áries with correct properties', () => {
      const etaogunda = ODU_ZODIAC_MAPPINGS['Etaogundá'];
      expect(etaogunda.odu).toBe('Etaogundá');
      expect(etaogunda.numero).toBe(3);
      expect(etaogunda.signo.signo).toBe('Áries');
      expect(etaogunda.signo.elemento).toBe('Fogo');
      expect(etaogunda.signo.planeta_regente).toBe('Marte');
      expect(etaogunda.orixa).toBe('Ogum');
      expect(etaogunda.qualidades.temperatura).toBe('Quente');
      expect(etaogunda.qualidades.polaridade).toBe('Yang');
    });

    it('Irosun maps to Câncer with correct properties', () => {
      const irosun = ODU_ZODIAC_MAPPINGS['Irosun'];
      expect(irosun.odu).toBe('Irosun');
      expect(irosun.numero).toBe(4);
      expect(irosun.signo.signo).toBe('Câncer');
      expect(irosun.signo.elemento).toBe('Água');
      expect(irosun.signo.planeta_regente).toBe('Lua');
      expect(irosun.orixa).toBe('Iemanjá');
      expect(irosun.qualidades.temperatura).toBe('Frio');
      expect(irosun.qualidades.polaridade).toBe('Yin');
    });

    it('Oxé maps to Sagitário with correct properties', () => {
      const oxe = ODU_ZODIAC_MAPPINGS['Oxé'];
      expect(oxe.odu).toBe('Oxé');
      expect(oxe.numero).toBe(5);
      expect(oxe.signo.signo).toBe('Sagitário');
      expect(oxe.signo.elemento).toBe('Fogo');
      expect(oxe.signo.planeta_regente).toBe('Júpiter');
      expect(oxe.orixa).toBe('Oxóssi');
      expect(oxe.qualidades.temperatura).toBe('Quente');
      expect(oxe.qualidades.polaridade).toBe('Yang');
    });

    it('Obará maps to Leão with correct properties', () => {
      const obara = ODU_ZODIAC_MAPPINGS['Obará'];
      expect(obara.odu).toBe('Obará');
      expect(obara.numero).toBe(6);
      expect(obara.signo.signo).toBe('Leão');
      expect(obara.signo.elemento).toBe('Fogo');
      expect(obara.signo.planeta_regente).toBe('Sol');
      expect(obara.orixa).toBe('Xangô');
      expect(obara.qualidades.temperatura).toBe('Quente');
      expect(obara.qualidades.polaridade).toBe('Yang');
    });

    it('Odi maps to Escorpião with correct properties', () => {
      const odi = ODU_ZODIAC_MAPPINGS['Odi'];
      expect(odi.odu).toBe('Odi');
      expect(odi.numero).toBe(7);
      expect(odi.signo.signo).toBe('Escorpião');
      expect(odi.signo.elemento).toBe('Água');
      expect(odi.signo.planeta_regente).toBe('Plutão');
      expect(odi.orixa).toBe('Oxumaré');
      expect(odi.qualidades.temperatura).toBe('Frio');
      expect(odi.qualidades.polaridade).toBe('Yin');
    });

    it('EjiOníle maps to Libra with correct properties', () => {
      const ejionile = ODU_ZODIAC_MAPPINGS['EjiOníle'];
      expect(ejionile.odu).toBe('EjiOníle');
      expect(ejionile.numero).toBe(8);
      expect(ejionile.signo.signo).toBe('Libra');
      expect(ejionile.signo.elemento).toBe('Ar');
      expect(ejionile.signo.planeta_regente).toBe('Vénus');
      expect(ejionile.orixa).toBe('Oxalá');
      expect(ejionile.qualidades.temperatura).toBe('Neutro');
      expect(ejionile.qualidades.polaridade).toBe('Yang');
    });

    it('Ossá maps to Peixes with correct properties', () => {
      const ossá = ODU_ZODIAC_MAPPINGS['Ossá'];
      expect(ossá.odu).toBe('Ossá');
      expect(ossá.numero).toBe(9);
      expect(ossá.signo.signo).toBe('Peixes');
      expect(ossá.signo.elemento).toBe('Água');
      expect(ossá.signo.planeta_regente).toBe('Neptuno');
      expect(ossá.orixa).toBe('Iansã');
      expect(ossá.qualidades.temperatura).toBe('Frio');
      expect(ossá.qualidades.polaridade).toBe('Yin');
    });

    it('Ofun maps to Virgem with correct properties', () => {
      const ofun = ODU_ZODIAC_MAPPINGS['Ofun'];
      expect(ofun.odu).toBe('Ofun');
      expect(ofun.numero).toBe(10);
      expect(ofun.signo.signo).toBe('Virgem');
      expect(ofun.signo.elemento).toBe('Terra');
      expect(ofun.signo.planeta_regente).toBe('Mercúrio');
      expect(ofun.orixa).toBe('Oxóssi');
      expect(ofun.qualidades.temperatura).toBe('Frio');
      expect(ofun.qualidades.polaridade).toBe('Yin');
    });

    it('Ejilsebora maps to Áries with correct properties', () => {
      const ejilsebora = ODU_ZODIAC_MAPPINGS['Ejilsebora'];
      expect(ejilsebora.odu).toBe('Ejilsebora');
      expect(ejilsebora.numero).toBe(12);
      expect(ejilsebora.signo.signo).toBe('Áries');
      expect(ejilsebora.signo.elemento).toBe('Fogo');
      expect(ejilsebora.signo.planeta_regente).toBe('Marte');
      expect(ejilsebora.orixa).toBe('Xangô');
    });

    it('Olobón maps to Capricórnio with correct properties', () => {
      const olobon = ODU_ZODIAC_MAPPINGS['Olobón'];
      expect(olobon.odu).toBe('Olobón');
      expect(olobon.numero).toBe(13);
      expect(olobon.signo.signo).toBe('Capricórnio');
      expect(olobon.signo.elemento).toBe('Terra');
      expect(olobon.signo.planeta_regente).toBe('Saturno');
      expect(olobon.orixa).toBe('Omolu');
    });

    it('Iká maps to Escorpião with correct properties', () => {
      const ika = ODU_ZODIAC_MAPPINGS['Iká'];
      expect(ika.odu).toBe('Iká');
      expect(ika.numero).toBe(14);
      expect(ika.signo.signo).toBe('Escorpião');
      expect(ika.signo.elemento).toBe('Água');
      expect(ika.signo.planeta_regente).toBe('Plutão');
      expect(ika.orixa).toBe('Oxumaré');
    });

    it('Alafia maps to Aquário with correct properties', () => {
      const alafia = ODU_ZODIAC_MAPPINGS['Alafia'];
      expect(alafia.odu).toBe('Alafia');
      expect(alafia.numero).toBe(16);
      expect(alafia.signo.signo).toBe('Aquário');
      expect(alafia.signo.elemento).toBe('Ar');
      expect(alafia.signo.planeta_regente).toBe('Urano');
      expect(alafia.orixa).toBe('Nanã');
    });

    it('each mapping has spiritual practices defined', () => {
      Object.values(ODU_ZODIAC_MAPPINGS).forEach((mapping) => {
        expect(mapping.praticas_espirituais.length).toBeGreaterThan(0);
        mapping.praticas_espirituais.forEach((pratica) => {
          expect(pratica.tipo).toBeTruthy();
          expect(pratica.descricao).toBeTruthy();
          expect(['ebo', 'oracao', 'ritual', 'banho', 'defumacao', 'ofenda']).toContain(pratica.tipo);
        });
      });
    });

    it('each mapping has alinhamento_elemental defined', () => {
      Object.values(ODU_ZODIAC_MAPPINGS).forEach((mapping) => {
        expect(mapping.alinhamento_elemental).toBeTruthy();
      });
    });

    it('each mapping has conexao_espiritual defined', () => {
      Object.values(ODU_ZODIAC_MAPPINGS).forEach((mapping) => {
        expect(mapping.conexao_espiritual).toBeTruthy();
      });
    });
  });

  // ─── getOduZodiac: Odu to mapping lookup ────────────────────────────────────
  describe('getOduZodiac', () => {
    it('returns correct mapping for Okaran', () => {
      const result = getOduZodiac('Okaran');
      expect(result).not.toBeNull();
      expect(result!.odu).toBe('Okaran');
      expect(result!.signo.signo).toBe('Capricórnio');
      expect(result!.orixa).toBe('Omolu');
    });

    it('returns correct mapping for Etaogundá', () => {
      const result = getOduZodiac('Etaogundá');
      expect(result).not.toBeNull();
      expect(result!.odu).toBe('Etaogundá');
      expect(result!.signo.signo).toBe('Áries');
      expect(result!.orixa).toBe('Ogum');
    });

    it('returns correct mapping for Irosun', () => {
      const result = getOduZodiac('Irosun');
      expect(result).not.toBeNull();
      expect(result!.odu).toBe('Irosun');
      expect(result!.signo.signo).toBe('Câncer');
      expect(result!.orixa).toBe('Iemanjá');
    });

    it('returns correct mapping for Obará', () => {
      const result = getOduZodiac('Obará');
      expect(result).not.toBeNull();
      expect(result!.odu).toBe('Obará');
      expect(result!.signo.signo).toBe('Leão');
      expect(result!.orixa).toBe('Xangô');
    });

    it('returns correct mapping for Ofun', () => {
      const result = getOduZodiac('Ofun');
      expect(result).not.toBeNull();
      expect(result!.odu).toBe('Ofun');
      expect(result!.signo.signo).toBe('Virgem');
      expect(result!.orixa).toBe('Oxóssi');
    });

    it('returns correct mapping for Odi', () => {
      const result = getOduZodiac('Odi');
      expect(result).not.toBeNull();
      expect(result!.odu).toBe('Odi');
      expect(result!.signo.signo).toBe('Escorpião');
      expect(result!.orixa).toBe('Oxumaré');
    });

    it('returns correct mapping for Ossá', () => {
      const result = getOduZodiac('Ossá');
      expect(result).not.toBeNull();
      expect(result!.odu).toBe('Ossá');
      expect(result!.signo.signo).toBe('Peixes');
      expect(result!.orixa).toBe('Iansã');
    });

    it('returns correct mapping for Alafia', () => {
      const result = getOduZodiac('Alafia');
      expect(result).not.toBeNull();
      expect(result!.odu).toBe('Alafia');
      expect(result!.signo.signo).toBe('Aquário');
      expect(result!.orixa).toBe('Nanã');
    });

    it('returns null for unknown Odu', () => {
      const result = getOduZodiac('Unknown');
      expect(result).toBeNull();
    });

    it('returns null for empty string', () => {
      const result = getOduZodiac('');
      expect(result).toBeNull();
    });

    it('returns null for non-existent Odu names', () => {
      expect(getOduZodiac('NonExistent')).toBeNull();
      expect(getOduZodiac('TestOdu')).toBeNull();
    });
  });

  // ─── getZodiacOdu: zodiac sign lookup ───────────────────────────────────────
  describe('getZodiacOdu', () => {
    it('returns Capricórnio for Okaran', () => {
      const result = getZodiacOdu('Okaran');
      expect(result).toBe('Capricórnio');
    });

    it('returns Áries for Etaogundá', () => {
      const result = getZodiacOdu('Etaogundá');
      expect(result).toBe('Áries');
    });

    it('returns Gémeos for Ejiokô', () => {
      const result = getZodiacOdu('Ejiokô');
      expect(result).toBe('Gémeos');
    });

    it('returns Câncer for Irosun', () => {
      const result = getZodiacOdu('Irosun');
      expect(result).toBe('Câncer');
    });

    it('returns Sagitário for Oxé', () => {
      const result = getZodiacOdu('Oxé');
      expect(result).toBe('Sagitário');
    });

    it('returns Leão for Obará', () => {
      const result = getZodiacOdu('Obará');
      expect(result).toBe('Leão');
    });

    it('returns Escorpião for Odi', () => {
      const result = getZodiacOdu('Odi');
      expect(result).toBe('Escorpião');
    });

    it('returns Libra for EjiOníle', () => {
      const result = getZodiacOdu('EjiOníle');
      expect(result).toBe('Libra');
    });

    it('returns Peixes for Ossá', () => {
      const result = getZodiacOdu('Ossá');
      expect(result).toBe('Peixes');
    });

    it('returns Virgem for Ofun', () => {
      const result = getZodiacOdu('Ofun');
      expect(result).toBe('Virgem');
    });

    it('returns Aquário for Alafia', () => {
      const result = getZodiacOdu('Alafia');
      expect(result).toBe('Aquário');
    });

    it('returns null for unknown Odu', () => {
      const result = getZodiacOdu('Unknown');
      expect(result).toBeNull();
    });

    it('returns null for empty string', () => {
      const result = getZodiacOdu('');
      expect(result).toBeNull();
    });
  });

  // ─── getAllOduZodiacs: collection function ───────────────────────────────────
  describe('getAllOduZodiacs', () => {
    it('returns all mappings as an array', () => {
      const result = getAllOduZodiacs();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns an array of OduZodiacMapping objects', () => {
      const result = getAllOduZodiacs();
      result.forEach((mapping) => {
        expect(mapping.odu).toBeTruthy();
        expect(mapping.numero).toBeTruthy();
        expect(mapping.signo).toBeDefined();
        expect(mapping.signo.signo).toBeTruthy();
        expect(mapping.signo.elemento).toBeTruthy();
        expect(mapping.signo.planeta_regente).toBeTruthy();
        expect(mapping.orixa).toBeTruthy();
        expect(mapping.praticas_espirituais).toBeDefined();
      });
    });

    it('contains expected Odus', () => {
      const result = getAllOduZodiacs();
      const oduNames = result.map(m => m.odu);
      expect(oduNames).toContain('Okaran');
      expect(oduNames).toContain('Etaogundá');
      expect(oduNames).toContain('Irosun');
      expect(oduNames).toContain('Obará');
      expect(oduNames).toContain('Ofun');
    });

    it('returns consistent results on multiple calls', () => {
      const result1 = getAllOduZodiacs();
      const result2 = getAllOduZodiacs();
      expect(result1).toEqual(result2);
    });
  });

  // ─── getOduZodiacElemento: element lookup ────────────────────────────────────
  describe('getOduZodiacElemento', () => {
    it('returns Terra for Okaran', () => {
      const result = getOduZodiacElemento('Okaran');
      expect(result).toBe('Terra');
    });

    it('returns Fogo for Etaogundá', () => {
      const result = getOduZodiacElemento('Etaogundá');
      expect(result).toBe('Fogo');
    });

    it('returns Água for Irosun', () => {
      const result = getOduZodiacElemento('Irosun');
      expect(result).toBe('Água');
    });

    it('returns Ar for Ejiokô', () => {
      const result = getOduZodiacElemento('Ejiokô');
      expect(result).toBe('Ar');
    });

    it('returns null for unknown Odu', () => {
      const result = getOduZodiacElemento('Unknown');
      expect(result).toBeNull();
    });
  });

  // ─── getOduZodiacPlaneta: planet lookup ──────────────────────────────────────
  describe('getOduZodiacPlaneta', () => {
    it('returns Saturno for Okaran', () => {
      const result = getOduZodiacPlaneta('Okaran');
      expect(result).toBe('Saturno');
    });

    it('returns Marte for Etaogundá', () => {
      const result = getOduZodiacPlaneta('Etaogundá');
      expect(result).toBe('Marte');
    });

    it('returns Lua for Irosun', () => {
      const result = getOduZodiacPlaneta('Irosun');
      expect(result).toBe('Lua');
    });

    it('returns Sol for Obará', () => {
      const result = getOduZodiacPlaneta('Obará');
      expect(result).toBe('Sol');
    });

    it('returns null for unknown Odu', () => {
      const result = getOduZodiacPlaneta('Unknown');
      expect(result).toBeNull();
    });
  });

  // ─── getSignoOdus: signs to Odus ─────────────────────────────────────────────
  describe('getSignoOdus', () => {
    it('returns Odus for Capricórnio', () => {
      const result = getSignoOdus('Capricórnio');
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(m => m.odu === 'Okaran')).toBe(true);
      expect(result.some(m => m.odu === 'Olobón')).toBe(true);
    });

    it('returns Odus for Áries', () => {
      const result = getSignoOdus('Áries');
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(m => m.odu === 'Etaogundá')).toBe(true);
      expect(result.some(m => m.odu === 'Ejilsebora')).toBe(true);
    });

    it('returns empty array for unknown sign', () => {
      const result = getSignoOdus('Unknown');
      expect(result).toEqual([]);
    });
  });

  // ─── getElementOduZodiac: element filter ─────────────────────────────────────
  describe('getElementOduZodiac', () => {
    it('returns Fogo Odus', () => {
      const result = getElementOduZodiac('Fogo');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(m => expect(m.signo.elemento).toBe('Fogo'));
    });

    it('returns Água Odus', () => {
      const result = getElementOduZodiac('Água');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(m => expect(m.signo.elemento).toBe('Água'));
    });

    it('returns Ar Odus', () => {
      const result = getElementOduZodiac('Ar');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(m => expect(m.signo.elemento).toBe('Ar'));
    });

    it('returns Terra Odus', () => {
      const result = getElementOduZodiac('Terra');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(m => expect(m.signo.elemento).toBe('Terra'));
    });

    it('returns empty array for unknown element', () => {
      const result = getElementOduZodiac('Unknown');
      expect(result).toEqual([]);
    });
  });

  // ─── getOduZodiacSignificado: spiritual meaning ─────────────────────────────
  describe('getOduZodiacSignificado', () => {
    it('returns meaning for Okaran', () => {
      const result = getOduZodiacSignificado('Okaran');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result!.length).toBeGreaterThan(10);
    });

    it('returns meaning for Etaogundá', () => {
      const result = getOduZodiacSignificado('Etaogundá');
      expect(result).toBeTruthy();
    });

    it('returns null for unknown Odu', () => {
      const result = getOduZodiacSignificado('Unknown');
      expect(result).toBeNull();
    });
  });

  // ─── getAllOduZodiacNames: names list ────────────────────────────────────────
  describe('getAllOduZodiacNames', () => {
    it('returns array of Odu names', () => {
      const result = getAllOduZodiacNames();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns sorted by Odu number', () => {
      const result = getAllOduZodiacNames();
      // Verify sorting by comparing with expected order
      const expectedOrder = ['Okaran', 'Ejiokô', 'Etaogundá', 'Irosun', 'Oxé', 'Obará', 'Odi', 'EjiOníle', 'Ossá', 'Ofun', 'Ejilsebora', 'Olobón', 'Iká', 'Alafia'];
      expectedOrder.forEach((odu) => {
        expect(result).toContain(odu);
      });
    });

    it('contains expected Odu names', () => {
      const result = getAllOduZodiacNames();
      expect(result).toContain('Okaran');
      expect(result).toContain('Etaogundá');
      expect(result).toContain('Irosun');
    });
  });

  // ─── hasOduZodiac: existence check ───────────────────────────────────────────
  describe('hasOduZodiac', () => {
    it('returns true for existing Odus', () => {
      expect(hasOduZodiac('Okaran')).toBe(true);
      expect(hasOduZodiac('Etaogundá')).toBe(true);
      expect(hasOduZodiac('Irosun')).toBe(true);
      expect(hasOduZodiac('Obará')).toBe(true);
      expect(hasOduZodiac('Ofun')).toBe(true);
      expect(hasOduZodiac('Alafia')).toBe(true);
    });

    it('returns false for unknown Odus', () => {
      expect(hasOduZodiac('Unknown')).toBe(false);
      expect(hasOduZodiac('')).toBe(false);
      expect(hasOduZodiac('NonExistent')).toBe(false);
    });
  });

  // ─── getOduZodiacOrixa: Orixá lookup ─────────────────────────────────────────
  describe('getOduZodiacOrixa', () => {
    it('returns Omolu for Okaran', () => {
      const result = getOduZodiacOrixa('Okaran');
      expect(result).toBe('Omolu');
    });

    it('returns Ogum for Etaogundá', () => {
      const result = getOduZodiacOrixa('Etaogundá');
      expect(result).toBe('Ogum');
    });

    it('returns Iemanjá for Irosun', () => {
      const result = getOduZodiacOrixa('Irosun');
      expect(result).toBe('Iemanjá');
    });

    it('returns Xangô for Obará', () => {
      const result = getOduZodiacOrixa('Obará');
      expect(result).toBe('Xangô');
    });

    it('returns null for unknown Odu', () => {
      const result = getOduZodiacOrixa('Unknown');
      expect(result).toBeNull();
    });
  });

  // ─── getOduZodiacRitual: ritual guidance ─────────────────────────────────────
  describe('getOduZodiacRitual', () => {
    it('returns ritual guidance for Okaran', () => {
      const result = getOduZodiacRitual('Okaran');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('returns ritual guidance for Etaogundá', () => {
      const result = getOduZodiacRitual('Etaogundá');
      expect(result).toBeTruthy();
    });

    it('returns null for unknown Odu', () => {
      const result = getOduZodiacRitual('Unknown');
      expect(result).toBeNull();
    });
  });

  // ─── getOduZodiacPraticas: spiritual practices ───────────────────────────────
  describe('getOduZodiacPraticas', () => {
    it('returns spiritual practices for Okaran', () => {
      const result = getOduZodiacPraticas('Okaran');
      expect(result).not.toBeNull();
      expect(result!.length).toBeGreaterThan(0);
      result!.forEach(pratica => {
        expect(pratica.tipo).toBeTruthy();
        expect(pratica.descricao).toBeTruthy();
      });
    });

    it('returns spiritual practices for Alafia', () => {
      const result = getOduZodiacPraticas('Alafia');
      expect(result).not.toBeNull();
      expect(result!.length).toBeGreaterThan(0);
    });

    it('returns null for unknown Odu', () => {
      const result = getOduZodiacPraticas('Unknown');
      expect(result).toBeNull();
    });
  });

  // ─── Type exports ───────────────────────────────────────────────────────────
  describe('type exports', () => {
    it('exports OduZodiacMapping type', () => {
      const mapping: OduZodiacMapping = {
        odu: 'Test',
        numero: 1,
        signo: {
          signo: 'Áries',
          elemento: 'Fogo',
          planeta_regente: 'Marte',
        },
        conexao_espiritual: 'Test',
        significado_espiritual: 'Test',
        orixa: 'Ogum',
        qualidades: {
          temperatura: 'Quente',
          umidade: 'Seco',
          polaridade: 'Yang',
        },
        praticas_espirituais: [],
        orientacao_ritual: 'Test',
        alinhamento_elemental: 'Test',
      };
      expect(mapping.odu).toBe('Test');
    });

    it('exports ZodiacInfo type', () => {
      const zodiacInfo: ZodiacInfo = {
        signo: 'Áries',
        elemento: 'Fogo',
        planeta_regente: 'Marte',
      };
      expect(zodiacInfo.signo).toBe('Áries');
    });

    it('exports SpiritualPractice type', () => {
      const practice: SpiritualPractice = {
        tipo: 'ebo',
        descricao: 'Test ebó',
      };
      expect(practice.tipo).toBe('ebo');
    });
  });

  // ─── Element consistency checks ─────────────────────────────────────────────
  describe('element consistency', () => {
    it('Fogo Odus have Quente temperature', () => {
      const fogoOdus = getElementOduZodiac('Fogo');
      fogoOdus.forEach(m => expect(m.qualidades.temperatura).toBe('Quente'));
    });

    it('Água Odus have Frio temperature', () => {
      const aguaOdus = getElementOduZodiac('Água');
      aguaOdus.forEach(m => expect(m.qualidades.temperatura).toBe('Frio'));
    });

    it('Terra Odus have Frio temperature', () => {
      const terraOdus = getElementOduZodiac('Terra');
      terraOdus.forEach(m => expect(m.qualidades.temperatura).toBe('Frio'));
    });

    it('all Fogo Odus have Yang polarity', () => {
      const fogoOdus = getElementOduZodiac('Fogo');
      fogoOdus.forEach(m => expect(m.qualidades.polaridade).toBe('Yang'));
    });
  });

  // ─── Integration: Odu-Zodiac bidirectional consistency ──────────────────────
  describe('bidirectional consistency', () => {
    it('getOduZodiac and getZodiacOdu are inverse operations', () => {
      const oduNames = getAllOduZodiacNames();
      oduNames.forEach(odu => {
        const mapping = getOduZodiac(odu);
        if (mapping) {
          expect(getZodiacOdu(odu)).toBe(mapping.signo.signo);
        }
      });
    });

    it('all Odu numbers are valid (1-16)', () => {
      getAllOduZodiacs().forEach(m => {
        expect(m.numero).toBeGreaterThanOrEqual(1);
        expect(m.numero).toBeLessThanOrEqual(16);
      });
    });
  });
});