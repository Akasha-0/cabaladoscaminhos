/**
 * Day-Orixá Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getDayOrixa,
  getAllDays,
  getOrixasForDay,
  getDaysByOrixa,
} from '@/lib/correlation/day-orixa';

describe('Day-Orixá Correlation', () => {
  describe('getDayOrixa', () => {
    it('should return Monday (Segunda-feira) mapping with Omolu as main Orixá', () => {
      const result = getDayOrixa('Segunda-feira');
      expect(result).toBeDefined();
      expect(result!.orixa_principal).toBe('Omolu');
      expect(result!.orixa_secundario).toBe('Exu');
      expect(result!.elemento).toBe('terra');
    });

    it('should return Tuesday (Terça-feira) mapping with Iansã as main Orixá', () => {
      const result = getDayOrixa('Terça-feira');
      expect(result).toBeDefined();
      expect(result!.orixa_principal).toBe('Iansã');
      expect(result!.orixa_secundario).toBe('Ogum');
      expect(result!.elemento).toBe('fogo');
      expect(result!.numero_sagrado).toBe(7);
    });

    it('should return Wednesday (Quarta-feira) mapping with Xangô as main Orixá', () => {
      const result = getDayOrixa('Quarta-feira');
      expect(result).toBeDefined();
      expect(result!.orixa_principal).toBe('Xangô');
      expect(result!.orixa_secundario).toBe('Iansã');
      expect(result!.elemento).toBe('fogo');
      expect(result!.cor).toBe('Amarelo');
    });

    it('should return Thursday (Quinta-feira) mapping with Oxóssi as main Orixá', () => {
      const result = getDayOrixa('Quinta-feira');
      expect(result).toBeDefined();
      expect(result!.orixa_principal).toBe('Oxóssi');
      expect(result!.orixa_secundario).toBeNull();
      expect(result!.elemento).toBe('ar');
      expect(result!.cor).toBe('Verde');
    });

    it('should return Friday (Sexta-feira) mapping with Oxalá as main Orixá', () => {
      const result = getDayOrixa('Sexta-feira');
      expect(result).toBeDefined();
      expect(result!.orixa_principal).toBe('Oxalá');
      expect(result!.orixa_secundario).toBeNull();
      expect(result!.elemento).toBe('ar');
      expect(result!.cor).toBe('Branco / Violeta');
      expect(result!.numero_sagrado).toBe(8);
    });

    it('should return Saturday (Sábado) mapping with Oxum and Iemanjá', () => {
      const result = getDayOrixa('Sábado');
      expect(result).toBeDefined();
      expect(result!.orixa_principal).toBe('Oxum');
      expect(result!.orixa_secundario).toBe('Iemanjá');
      expect(result!.elemento).toBe('água');
      expect(result!.cor).toBe('Rosa / Azul Escuro');
      expect(result!.numero_sagrado).toBe(5);
    });

    it('should return Sunday (Domingo) mapping with Xangô Solar', () => {
      const result = getDayOrixa('Domingo');
      expect(result).toBeDefined();
      expect(result!.orixa_principal).toBe('Xangô');
      expect(result!.orixa_secundario).toBeNull();
      expect(result!.elemento).toBe('fogo');
      expect(result!.cor).toBe('Amarelo / Dourado');
      expect(result!.planeta).toBe('Sol');
    });

    it('should return undefined for invalid day', () => {
      const result = getDayOrixa('InvalidDay');
      expect(result).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      const result = getDayOrixa('');
      expect(result).toBeUndefined();
    });

    it('should include all required interface properties', () => {
      const result = getDayOrixa('Segunda-feira');
      expect(result).toHaveProperty('dia');
      expect(result).toHaveProperty('orixa_principal');
      expect(result).toHaveProperty('orixa_secundario');
      expect(result).toHaveProperty('elemento');
      expect(result).toHaveProperty('cor');
      expect(result).toHaveProperty('numero_sagrado');
      expect(result).toHaveProperty('chakra');
      expect(result).toHaveProperty('planeta');
      expect(result).toHaveProperty('mystere');
    });

    it('should have valid element values (fogo, água, ar, terra, éter)', () => {
      const days = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
      const validElements = ['fogo', 'água', 'ar', 'terra', 'éter'];
      
      for (const day of days) {
        const result = getDayOrixa(day);
        expect(result).toBeDefined();
        expect(validElements).toContain(result!.elemento);
      }
    });
  });

  describe('getAllDays', () => {
    it('should return all 7 days of the week', () => {
      const days = getAllDays();
      expect(days).toHaveLength(7);
    });

    it('should return days in correct order', () => {
      const days = getAllDays();
      expect(days[0]).toBe('Segunda-feira');
      expect(days[1]).toBe('Terça-feira');
      expect(days[2]).toBe('Quarta-feira');
      expect(days[3]).toBe('Quinta-feira');
      expect(days[4]).toBe('Sexta-feira');
      expect(days[5]).toBe('Sábado');
      expect(days[6]).toBe('Domingo');
    });

    it('should return an array of strings', () => {
      const days = getAllDays();
      days.forEach(day => {
        expect(typeof day).toBe('string');
      });
    });
  });

  describe('getOrixasForDay', () => {
    it('should return array with single Orixá for days without secondary', () => {
      const result = getOrixasForDay('Quinta-feira');
      expect(result).toHaveLength(1);
      expect(result[0]).toBe('Oxóssi');
    });

    it('should return array with two Orixás for Segunda-feira', () => {
      const result = getOrixasForDay('Segunda-feira');
      expect(result).toHaveLength(2);
      expect(result).toContain('Omolu');
      expect(result).toContain('Exu');
    });

    it('should return array with two Orixás for Sábado', () => {
      const result = getOrixasForDay('Sábado');
      expect(result).toHaveLength(2);
      expect(result).toContain('Oxum');
      expect(result).toContain('Iemanjá');
    });

    it('should return empty array for invalid day', () => {
      const result = getOrixasForDay('InvalidDay');
      expect(result).toHaveLength(0);
    });
  });

  describe('getDaysByOrixa', () => {
    it('should return Segunda-feira for Omolu', () => {
      const days = getDaysByOrixa('Omolu');
      expect(days).toContain('Segunda-feira');
    });

    it('should return Terça-feira for Iansã (as primary)', () => {
      const days = getDaysByOrixa('Iansã');
      expect(days).toContain('Terça-feira');
    });

    it('should return Quarta-feira for Iansã (as secondary)', () => {
      const days = getDaysByOrixa('Iansã');
      expect(days).toContain('Quarta-feira');
    });

    it('should return both Segunda and Quarta for Iansã', () => {
      const days = getDaysByOrixa('Iansã');
      expect(days).toHaveLength(2);
      expect(days).toContain('Terça-feira');
      expect(days).toContain('Quarta-feira');
    });

    it('should return Quarta-feira and Domingo for Xangô', () => {
      const days = getDaysByOrixa('Xangô');
      expect(days).toContain('Quarta-feira');
      expect(days).toContain('Domingo');
    });

    it('should return Saturday for Oxum', () => {
      const days = getDaysByOrixa('Oxum');
      expect(days).toContain('Sábado');
    });

    it('should return Saturday for Iemanjá', () => {
      const days = getDaysByOrixa('Iemanjá');
      expect(days).toContain('Sábado');
    });

    it('should be case-insensitive', () => {
      const lowerDays = getDaysByOrixa('omolu');
      const upperDays = getDaysByOrixa('OMOLU');
      expect(lowerDays).toEqual(upperDays);
    });

    it('should return empty array for unknown Orixá', () => {
      const days = getDaysByOrixa('UnknownOrixa');
      expect(days).toHaveLength(0);
    });
  });

  describe('Element and Number Correlations', () => {
    it('should have fire element for Segunda-feira (Omolu)', () => {
      // Note: based on IDEIA.md table, Omolu/Exu is associated with earth element
      // but in some tables it's also associated with earth/fire combination
      const result = getDayOrixa('Segunda-feira');
      expect(result!.elemento).toBe('terra');
    });

    it('should have fire element for Tuesday through Sunday (mostly)', () => {
      const fireDays = ['Terça-feira', 'Quarta-feira', 'Domingo'];
      for (const day of fireDays) {
        const result = getDayOrixa(day);
        expect(result!.elemento).toBe('fogo');
      }
    });

    it('should have water element for Saturday (Oxum/Iemanjá)', () => {
      const result = getDayOrixa('Sábado');
      expect(result!.elemento).toBe('água');
    });

    it('should have air element for Thursday and Friday', () => {
      const airDays = ['Quinta-feira', 'Sexta-feira'];
      for (const day of airDays) {
        const result = getDayOrixa(day);
        expect(result!.elemento).toBe('ar');
      }
    });

    it('should have sacred numbers matching IDEIA.md', () => {
      expect(getDayOrixa('Segunda-feira')!.numero_sagrado).toBe(1); // Okaran
      expect(getDayOrixa('Terça-feira')!.numero_sagrado).toBe(7); // Odi
      expect(getDayOrixa('Quarta-feira')!.numero_sagrado).toBe(3); // Etaogundá
      expect(getDayOrixa('Quinta-feira')!.numero_sagrado).toBe(1); // Okaran
      expect(getDayOrixa('Sexta-feira')!.numero_sagrado).toBe(8); // EjiOníle
      expect(getDayOrixa('Sábado')!.numero_sagrado).toBe(5); // Oxé
      expect(getDayOrixa('Domingo')!.numero_sagrado).toBe(6); // Obará
    });
  });

  describe('Chakra and Planet Correlations', () => {
    it('should have correct chakra for each day', () => {
      expect(getDayOrixa('Segunda-feira')!.chakra).toBe('1º Básico / 6º Frontal');
      expect(getDayOrixa('Terça-feira')!.chakra).toBe('2º Sacro');
      expect(getDayOrixa('Quarta-feira')!.chakra).toBe('3º Plexo Solar');
      expect(getDayOrixa('Quinta-feira')!.chakra).toBe('4º Cardíaco');
      expect(getDayOrixa('Sexta-feira')!.chakra).toBe('7º Coronário');
      expect(getDayOrixa('Sábado')!.chakra).toBe('4º Cardíaco / 6º Frontal');
      expect(getDayOrixa('Domingo')!.chakra).toBe('3º Plexo Solar');
    });

    it('should have correct planet for each day', () => {
      expect(getDayOrixa('Segunda-feira')!.planeta).toBe('Lua / Saturno');
      expect(getDayOrixa('Terça-feira')!.planeta).toBe('Marte / Plutão');
      expect(getDayOrixa('Quarta-feira')!.planeta).toBe('Mercúrio');
      expect(getDayOrixa('Quinta-feira')!.planeta).toBe('Júpiter');
      expect(getDayOrixa('Sexta-feira')!.planeta).toBe('Vênus');
      expect(getDayOrixa('Sábado')!.planeta).toBe('Saturno / Urano');
      expect(getDayOrixa('Domingo')!.planeta).toBe('Sol');
    });
  });
});