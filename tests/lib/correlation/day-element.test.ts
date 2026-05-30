/**
 * Day-Element Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getDayElement,
  getElementByDay,
  getAllDays,
  getElementDays,
  getDaysByElemento,
  getAllDayElements,
  getDayPractices,
  getElementProperties,
} from '@/lib/correlation/day-element';

describe('Day-Element Correlation', () => {
  describe('getDayElement', () => {
    it('should return Sunday (Domingo) mapping with fire element', () => {
      const result = getDayElement('Domingo');
      expect(result).toBeDefined();
      expect(result!.elemento).toBe('fogo');
      expect(result!.planeta).toBe('Sol');
      expect(result!.signo).toBe('Leão');
      expect(result!.qualidade).toBe('fixed');
      expect(result!.cor).toBe('Dourado / Amarelo');
      expect(result!.direcao).toBe('Leste');
      expect(result!.estacao).toBe('Verão');
      expect(result!.chakra).toBe('3º Plexo Solar');
      expect(result!.praticas_espirituais.length).toBeGreaterThan(0);
    });

    it('should return Monday (Segunda-feira) mapping with water element', () => {
      const result = getDayElement('Segunda-feira');
      expect(result).toBeDefined();
      expect(result!.elemento).toBe('água');
      expect(result!.planeta).toBe('Lua');
      expect(result!.signo).toBe('Câncer');
      expect(result!.qualidade).toBe('cardinal');
      expect(result!.cor).toBe('Prata / Branco');
      expect(result!.direcao).toBe('Oeste');
      expect(result!.estacao).toBe('Outono');
    });

    it('should return Tuesday (Terça-feira) mapping with fire element', () => {
      const result = getDayElement('Terça-feira');
      expect(result).toBeDefined();
      expect(result!.elemento).toBe('fogo');
      expect(result!.planeta).toBe('Marte');
      expect(result!.signo).toBe('Áries');
      expect(result!.qualidade).toBe('cardinal');
      expect(result!.cor).toBe('Vermelho / Laranja');
      expect(result!.direcao).toBe('Sul');
      expect(result!.estacao).toBe('Primavera');
    });

    it('should return Wednesday (Quarta-feira) mapping with air element', () => {
      const result = getDayElement('Quarta-feira');
      expect(result).toBeDefined();
      expect(result!.elemento).toBe('ar');
      expect(result!.planeta).toBe('Mercúrio');
      expect(result!.signo).toBe('Gêmeos');
      expect(result!.qualidade).toBe('mutable');
      expect(result!.cor).toBe('Amarelo / Cinzento');
      expect(result!.direcao).toBe('Norte');
      expect(result!.estacao).toBe('Inverno');
    });

    it('should return Thursday (Quinta-feira) mapping with fire element', () => {
      const result = getDayElement('Quinta-feira');
      expect(result).toBeDefined();
      expect(result!.elemento).toBe('fogo');
      expect(result!.planeta).toBe('Júpiter');
      expect(result!.signo).toBe('Sagitário');
      expect(result!.qualidade).toBe('mutable');
      expect(result!.cor).toBe('Azul / Roxo');
      expect(result!.direcao).toBe('Nordeste');
      expect(result!.estacao).toBe('Primavera');
    });

    it('should return Friday (Sexta-feira) mapping with earth element', () => {
      const result = getDayElement('Sexta-feira');
      expect(result).toBeDefined();
      expect(result!.elemento).toBe('terra');
      expect(result!.planeta).toBe('Vênus');
      expect(result!.signo).toBe('Touro');
      expect(result!.qualidade).toBe('fixed');
      expect(result!.cor).toBe('Verde / Rosa');
      expect(result!.direcao).toBe('Sudoeste');
      expect(result!.estacao).toBe('Outono');
    });

    it('should return Saturday (Sábado) mapping with earth element', () => {
      const result = getDayElement('Sábado');
      expect(result).toBeDefined();
      expect(result!.elemento).toBe('terra');
      expect(result!.planeta).toBe('Saturno');
      expect(result!.signo).toBe('Capricórnio');
      expect(result!.qualidade).toBe('cardinal');
      expect(result!.cor).toBe('Preto / Azul Escuro');
      expect(result!.direcao).toBe('Norte');
      expect(result!.estacao).toBe('Inverno');
    });

    it('should return undefined for invalid day', () => {
      const result = getDayElement('InvalidDay');
      expect(result).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      const result = getDayElement('');
      expect(result).toBeUndefined();
    });

    it('should include all required interface properties', () => {
      const result = getDayElement('Domingo');
      expect(result).toBeDefined();
      expect(result!.dia).toBe('Domingo');
      expect(result!.indice).toBe(0);
      expect(result!.elemento).toBeDefined();
      expect(result!.qualidade).toBeDefined();
      expect(result!.cor).toBeDefined();
      expect(result!.direcao).toBeDefined();
      expect(result!.estacao).toBeDefined();
      expect(result!.chakra).toBeDefined();
      expect(result!.planeta).toBeDefined();
      expect(result!.signo).toBeDefined();
      expect(result!.propriedades).toBeDefined();
      expect(result!.mystere).toBeDefined();
      expect(result!.praticas_espirituais).toBeDefined();
    });

    it('should have valid element values (fogo, água, ar, terra)', () => {
      const elements = ['fogo', 'água', 'ar', 'terra'];
      getAllDayElements().forEach((dayElement) => {
        expect(elements).toContain(dayElement.elemento);
      });
    });

    it('should have valid quality values (cardinal, fixed, mutable)', () => {
      const qualities = ['cardinal', 'fixed', 'mutable'];
      getAllDayElements().forEach((dayElement) => {
        expect(qualities).toContain(dayElement.qualidade);
      });
    });

    it('should have properties with forta, palavras_chave, and desafios', () => {
      getAllDayElements().forEach((dayElement) => {
        expect(dayElement.propriedades.forta).toBeDefined();
        expect(dayElement.propriedades.palavras_chave.length).toBeGreaterThan(0);
        expect(dayElement.propriedades.desafios.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getElementByDay / getElementDays', () => {
    it('should return fire element for Domingo', () => {
      expect(getElementByDay('Domingo')).toBe('fogo');
      expect(getElementDays('Domingo')).toBe('fogo');
    });

    it('should return water element for Segunda-feira', () => {
      expect(getElementByDay('Segunda-feira')).toBe('água');
      expect(getElementDays('Segunda-feira')).toBe('água');
    });

    it('should return fire element for Terça-feira', () => {
      expect(getElementByDay('Terça-feira')).toBe('fogo');
      expect(getElementDays('Terça-feira')).toBe('fogo');
    });

    it('should return air element for Quarta-feira', () => {
      expect(getElementByDay('Quarta-feira')).toBe('ar');
      expect(getElementDays('Quarta-feira')).toBe('ar');
    });

    it('should return fire element for Quinta-feira', () => {
      expect(getElementByDay('Quinta-feira')).toBe('fogo');
      expect(getElementDays('Quinta-feira')).toBe('fogo');
    });

    it('should return earth element for Sexta-feira', () => {
      expect(getElementByDay('Sexta-feira')).toBe('terra');
      expect(getElementDays('Sexta-feira')).toBe('terra');
    });

    it('should return earth element for Sábado', () => {
      expect(getElementByDay('Sábado')).toBe('terra');
      expect(getElementDays('Sábado')).toBe('terra');
    });

    it('should return undefined for invalid day', () => {
      expect(getElementByDay('InvalidDay')).toBeUndefined();
      expect(getElementDays('InvalidDay')).toBeUndefined();
    });
  });

  describe('getAllDays', () => {
    it('should return all 7 days of the week', () => {
      const days = getAllDays();
      expect(days.length).toBe(7);
      expect(days).toContain('Domingo');
      expect(days).toContain('Segunda-feira');
      expect(days).toContain('Terça-feira');
      expect(days).toContain('Quarta-feira');
      expect(days).toContain('Quinta-feira');
      expect(days).toContain('Sexta-feira');
      expect(days).toContain('Sábado');
    });

    it('should return days in correct order', () => {
      const days = getAllDays();
      expect(days[0]).toBe('Domingo');
      expect(days[1]).toBe('Segunda-feira');
      expect(days[2]).toBe('Terça-feira');
      expect(days[3]).toBe('Quarta-feira');
      expect(days[4]).toBe('Quinta-feira');
      expect(days[5]).toBe('Sexta-feira');
      expect(days[6]).toBe('Sábado');
    });
  });

  describe('getDaysByElemento', () => {
    it('should return fire days: Domingo, Terça-feira, Quinta-feira', () => {
      const fireDays = getDaysByElemento('fogo');
      expect(fireDays).toHaveLength(3);
      expect(fireDays).toContain('Domingo');
      expect(fireDays).toContain('Terça-feira');
      expect(fireDays).toContain('Quinta-feira');
    });

    it('should return water day: Segunda-feira', () => {
      const waterDays = getDaysByElemento('água');
      expect(waterDays).toHaveLength(1);
      expect(waterDays).toContain('Segunda-feira');
    });

    it('should return air day: Quarta-feira', () => {
      const airDays = getDaysByElemento('ar');
      expect(airDays).toHaveLength(1);
      expect(airDays).toContain('Quarta-feira');
    });

    it('should return earth days: Sexta-feira, Sábado', () => {
      const earthDays = getDaysByElemento('terra');
      expect(earthDays).toHaveLength(2);
      expect(earthDays).toContain('Sexta-feira');
      expect(earthDays).toContain('Sábado');
    });

    it('should return empty array for unknown element', () => {
      const unknownDays = getDaysByElemento('éter');
      expect(unknownDays).toHaveLength(0);
    });
  });

  describe('getAllDayElements', () => {
    it('should return all 7 day-element correlations', () => {
      const allElements = getAllDayElements();
      expect(allElements.length).toBe(7);
    });

    it('should return DayElement objects with all properties', () => {
      const allElements = getAllDayElements();
      allElements.forEach((element) => {
        expect(element.dia).toBeDefined();
        expect(element.indice).toBeDefined();
        expect(element.elemento).toBeDefined();
        expect(element.qualidade).toBeDefined();
        expect(element.cor).toBeDefined();
        expect(element.direcao).toBeDefined();
        expect(element.estacao).toBeDefined();
        expect(element.chakra).toBeDefined();
        expect(element.planeta).toBeDefined();
        expect(element.signo).toBeDefined();
        expect(element.propriedades).toBeDefined();
        expect(element.mystere).toBeDefined();
        expect(element.praticas_espirituais).toBeDefined();
      });
    });
  });

  describe('getDayPractices', () => {
    it('should return spiritual practices for each day', () => {
      getAllDays().forEach((dia) => {
        const practices = getDayPractices(dia);
        expect(practices).toBeDefined();
        expect(practices!.length).toBeGreaterThan(0);
      });
    });

    it('should return specific practices for Domingo', () => {
      const practices = getDayPractices('Domingo');
      expect(practices).toContain('Exposição solar consciente (tomar sol com intenção)');
      expect(practices).toContain('Meditação com visualização dourada no plexo solar');
    });

    it('should return undefined for invalid day', () => {
      expect(getDayPractices('InvalidDay')).toBeUndefined();
    });
  });

  describe('getElementProperties', () => {
    it('should return properties for each day', () => {
      getAllDays().forEach((dia) => {
        const props = getElementProperties(dia);
        expect(props).toBeDefined();
        expect(props!.forta).toBeDefined();
        expect(props!.palavras_chave.length).toBeGreaterThan(0);
        expect(props!.desafios.length).toBeGreaterThan(0);
      });
    });

    it('should return specific properties for Segunda-feira', () => {
      const props = getElementProperties('Segunda-feira');
      expect(props!.palavras_chave).toContain('acolher');
      expect(props!.palavras_chave).toContain('intuir');
    });

    it('should return undefined for invalid day', () => {
      expect(getElementProperties('InvalidDay')).toBeUndefined();
    });
  });
});