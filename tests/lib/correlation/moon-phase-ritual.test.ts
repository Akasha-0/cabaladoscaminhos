import { describe, it, expect } from 'vitest';
import {
  getMoonPhaseRitual,
  getAllMoonPhaseRituals,
  isValidMoonPhase,
  getOrixasByMoonPhase,
  MOON_PHASE_RITUALS,
  type MoonPhaseRitual,
} from '@/lib/correlation/moon-phase-ritual';

describe('moon-phase-ritual', () => {
  // ─── MoonPhaseRitual Interface ──────────────────────────────────────────────
  describe('MoonPhaseRitual interface completeness', () => {
    it('has all required fields for Nova phase', () => {
      const ritual = getMoonPhaseRitual('Nova')!;
      expect(ritual).toHaveProperty('fase');
      expect(ritual).toHaveProperty('energia_tipica');
      expect(ritual).toHaveProperty('janela_operacao');
      expect(ritual).toHaveProperty('praticas_recomendadas');
      expect(ritual).toHaveProperty('orixas_em_evidencia');
      expect(ritual).toHaveProperty('tipo_de_ebó_recomendado');
      expect(ritual).toHaveProperty('casas_divinas');
    });

    it('praticas_recomendadas is an array of strings', () => {
      const ritual = getMoonPhaseRitual('Nova')!;
      expect(Array.isArray(ritual.praticas_recomendadas)).toBe(true);
      expect(ritual.praticas_recomendadas.every(p => typeof p === 'string')).toBe(true);
    });

    it('orixas_em_evidencia is an array', () => {
      const ritual = getMoonPhaseRitual('Nova')!;
      expect(Array.isArray(ritual.orixas_em_evidencia)).toBe(true);
      expect(ritual.orixas_em_evidencia.length).toBeGreaterThan(0);
    });
  });

  // ─── getMoonPhaseRitual ─────────────────────────────────────────────────────
  describe('getMoonPhaseRitual', () => {
    it('returns Nova phase with correct orixás (Exu, Omolu, Ogum)', () => {
      const ritual = getMoonPhaseRitual('Nova')!;
      expect(ritual.fase).toBe('Nova');
      expect(ritual.energia_tipica).toContain('Introspecção');
      expect(ritual.orixas_em_evidencia).toContain('Exu');
      expect(ritual.orixas_em_evidencia).toContain('Omolu');
      expect(ritual.orixas_em_evidencia).toContain('Ogum');
      expect(ritual.tipo_de_ebó_recomendado).toContain('Proteção');
    });

    it('returns Crescente phase with correct orixás (Oxóssi, Ogum, Xangô)', () => {
      const ritual = getMoonPhaseRitual('Crescente')!;
      expect(ritual.fase).toBe('Crescente');
      expect(ritual.energia_tipica).toContain('Foco');
      expect(ritual.orixas_em_evidencia).toContain('Oxóssi');
      expect(ritual.orixas_em_evidencia).toContain('Ogum');
      expect(ritual.orixas_em_evidencia).toContain('Xangô');
      expect(ritual.tipo_de_ebó_recomendado).toContain('Prosperidade');
    });

    it('returns Cheia phase with correct orixás (Oxalá, Oxum, Iemanjá)', () => {
      const ritual = getMoonPhaseRitual('Cheia')!;
      expect(ritual.fase).toBe('Cheia');
      expect(ritual.energia_tipica).toContain('Expansão');
      expect(ritual.orixas_em_evidencia).toContain('Oxalá');
      expect(ritual.orixas_em_evidencia).toContain('Oxum');
      expect(ritual.orixas_em_evidencia).toContain('Iemanjá');
      expect(ritual.tipo_de_ebó_recomendado).toContain('Amor');
    });

    it('returns Minguante phase with correct orixás (Omolu, Nanã, Iansã)', () => {
      const ritual = getMoonPhaseRitual('Minguante')!;
      expect(ritual.fase).toBe('Minguante');
      expect(ritual.energia_tipica).toContain('Desapego');
      expect(ritual.orixas_em_evidencia).toContain('Omolu');
      expect(ritual.orixas_em_evidencia).toContain('Nanã');
      expect(ritual.orixas_em_evidencia).toContain('Iansã');
      expect(ritual.tipo_de_ebó_recomendado).toContain('Descarrego');
    });

    it('returns undefined for invalid phase name', () => {
      expect(getMoonPhaseRitual('InvalidPhase')).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
      expect(getMoonPhaseRitual('')).toBeUndefined();
    });
  });

  // ─── getAllMoonPhaseRituals ─────────────────────────────────────────────────
  describe('getAllMoonPhaseRituals', () => {
    it('returns all 4 moon phases', () => {
      const rituals = getAllMoonPhaseRituals();
      expect(rituals).toHaveLength(4);
    });

    it('contains Nova, Crescente, Cheia, and Minguante', () => {
      const rituals = getAllMoonPhaseRituals();
      const phases = rituals.map(r => r.fase);
      expect(phases).toContain('Nova');
      expect(phases).toContain('Crescente');
      expect(phases).toContain('Cheia');
      expect(phases).toContain('Minguante');
    });

    it('each ritual has practica recommendada', () => {
      const rituals = getAllMoonPhaseRituals();
      rituals.forEach(ritual => {
        expect(ritual.praticas_recomendadas.length).toBeGreaterThan(0);
      });
    });

    it('each ritual has orixá in evidencia', () => {
      const rituals = getAllMoonPhaseRituals();
      rituals.forEach(ritual => {
        expect(ritual.orixas_em_evidencia.length).toBeGreaterThan(0);
      });
    });

    it('each ritual has tipo de ebó', () => {
      const rituals = getAllMoonPhaseRituals();
      rituals.forEach(ritual => {
        expect(ritual.tipo_de_ebó_recomendado).toBeDefined();
        expect(ritual.tipo_de_ebó_recomendado.length).toBeGreaterThan(0);
      });
    });

    it('each ritual has janela de operação', () => {
      const rituals = getAllMoonPhaseRituals();
      rituals.forEach(ritual => {
        expect(ritual.janela_operacao).toBeDefined();
        expect(ritual.janela_operacao.length).toBeGreaterThan(0);
      });
    });
  });

  // ─── isValidMoonPhase ───────────────────────────────────────────────────────
  describe('isValidMoonPhase', () => {
    it('returns true for Nova', () => {
      expect(isValidMoonPhase('Nova')).toBe(true);
    });

    it('returns true for Crescente', () => {
      expect(isValidMoonPhase('Crescente')).toBe(true);
    });

    it('returns true for Cheia', () => {
      expect(isValidMoonPhase('Cheia')).toBe(true);
    });

    it('returns true for Minguante', () => {
      expect(isValidMoonPhase('Minguante')).toBe(true);
    });

    it('returns false for invalid phase', () => {
      expect(isValidMoonPhase('FullMoon')).toBe(false);
      expect(isValidMoonPhase('Gibbous')).toBe(false);
      expect(isValidMoonPhase('new')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isValidMoonPhase('')).toBe(false);
    });
  });

  // ─── getOrixasByMoonPhase ───────────────────────────────────────────────────
  describe('getOrixasByMoonPhase', () => {
    it('returns orixás for Nova (Exu, Omolu, Ogum)', () => {
      const orixas = getOrixasByMoonPhase('Nova');
      expect(orixas).toEqual(['Exu', 'Omolu', 'Ogum']);
    });

    it('returns orixás for Crescente (Oxóssi, Ogum, Xangô)', () => {
      const orixas = getOrixasByMoonPhase('Crescente');
      expect(orixas).toEqual(['Oxóssi', 'Ogum', 'Xangô']);
    });

    it('returns orixás for Cheia (Oxalá, Oxum, Iemanjá)', () => {
      const orixas = getOrixasByMoonPhase('Cheia');
      expect(orixas).toEqual(['Oxalá', 'Oxum', 'Iemanjá']);
    });

    it('returns orixás for Minguante (Omolu, Nanã, Iansã)', () => {
      const orixas = getOrixasByMoonPhase('Minguante');
      expect(orixas).toEqual(['Omolu', 'Nanã', 'Iansã']);
    });

    it('returns empty array for invalid phase', () => {
      const orixas = getOrixasByMoonPhase('InvalidPhase');
      expect(orixas).toEqual([]);
    });

    it('returns empty array for empty string', () => {
      const orixas = getOrixasByMoonPhase('');
      expect(orixas).toEqual([]);
    });
  });

  // ─── Energy types by phase ──────────────────────────────────────────────────
  describe('energia_tipica by phase', () => {
    it('Nova has introspecção energy', () => {
      const ritual = getMoonPhaseRitual('Nova')!;
      expect(ritual.energia_tipica.toLowerCase()).toContain('introspec');
    });

    it('Crescente has ação energy', () => {
      const ritual = getMoonPhaseRitual('Crescente')!;
      expect(ritual.energia_tipica.toLowerCase()).toContain('foco');
    });

    it('Cheia has expansão energy', () => {
      const ritual = getMoonPhaseRitual('Cheia')!;
      expect(ritual.energia_tipica.toLowerCase()).toContain('expansão');
    });

    it('Minguante has desapego energy', () => {
      const ritual = getMoonPhaseRitual('Minguante')!;
      expect(ritual.energia_tipica.toLowerCase()).toContain('desapego');
    });
  });

  // ─── Window times by phase ──────────────────────────────────────────────────
  describe('janela_operacao by phase', () => {
    it('Nova window is 00:00-03:00', () => {
      const ritual = getMoonPhaseRitual('Nova')!;
      expect(ritual.janela_operacao).toContain('00:00');
      expect(ritual.janela_operacao).toContain('03:00');
    });

    it('Crescente window is 06:00-12:00', () => {
      const ritual = getMoonPhaseRitual('Crescente')!;
      expect(ritual.janela_operacao).toContain('06:00');
      expect(ritual.janela_operacao).toContain('12:00');
    });

    it('Cheia window is 18:00-00:00', () => {
      const ritual = getMoonPhaseRitual('Cheia')!;
      expect(ritual.janela_operacao).toContain('18:00');
      expect(ritual.janela_operacao).toContain('00:00');
    });

    it('Minguante window is 12:00-18:00', () => {
      const ritual = getMoonPhaseRitual('Minguante')!;
      expect(ritual.janela_operacao).toContain('12:00');
      expect(ritual.janela_operacao).toContain('18:00');
    });
  });

  // ─── casas_divinas ──────────────────────────────────────────────────────────
  describe('casas_divinas by phase', () => {
    it('Nova has Casa 1 and Casa 26', () => {
      const ritual = getMoonPhaseRitual('Nova')!;
      expect(ritual.casas_divinas).toContain('Casa 1 (O Cavaleiro)');
      expect(ritual.casas_divinas).toContain('Casa 26 (O Livro)');
    });

    it('Crescente has Casa 13 and Casa 34', () => {
      const ritual = getMoonPhaseRitual('Crescente')!;
      expect(ritual.casas_divinas).toContain('Casa 13 (A Criança)');
      expect(ritual.casas_divinas).toContain('Casa 34 (Os Peixes)');
    });

    it('Cheia has Casa 16 and Casa 31', () => {
      const ritual = getMoonPhaseRitual('Cheia')!;
      expect(ritual.casas_divinas).toContain('Casa 16 (A Estrela)');
      expect(ritual.casas_divinas).toContain('Casa 31 (O Sol)');
    });

    it('Minguante has Casa 8 and Casa 10', () => {
      const ritual = getMoonPhaseRitual('Minguante')!;
      expect(ritual.casas_divinas).toContain('Casa 8 (O Caixão)');
      expect(ritual.casas_divinas).toContain('Casa 10 (A Foice)');
    });
  });

  // ─── MOON_PHASE_RITUALS constant ─────────────────────────────────────────────
  describe('MOON_PHASE_RITUALS constant', () => {
    it('is a non-empty object', () => {
      expect(Object.keys(MOON_PHASE_RITUALS).length).toBeGreaterThan(0);
    });

    it('has Nova key', () => {
      expect(MOON_PHASE_RITUALS).toHaveProperty('Nova');
    });

    it('has Crescente key', () => {
      expect(MOON_PHASE_RITUALS).toHaveProperty('Crescente');
    });

    it('has Cheia key', () => {
      expect(MOON_PHASE_RITUALS).toHaveProperty('Cheia');
    });

    it('has Minguante key', () => {
      expect(MOON_PHASE_RITUALS).toHaveProperty('Minguante');
    });
  });

  // ─── praktische Anwendungen / specific practices ───────────────────────────
  describe('praticas_recomendadas by phase', () => {
    it('Nova includes proteção practices', () => {
      const ritual = getMoonPhaseRitual('Nova')!;
      expect(ritual.praticas_recomendadas.some(p => p.toLowerCase().includes('proteção'))).toBe(true);
    });

    it('Crescente includes prosperidade practices', () => {
      const ritual = getMoonPhaseRitual('Crescente')!;
      expect(ritual.praticas_recomendadas.some(p => p.toLowerCase().includes('prosperidade'))).toBe(true);
    });

    it('Cheia includes amor practices', () => {
      const ritual = getMoonPhaseRitual('Cheia')!;
      expect(ritual.praticas_recomendadas.some(p => p.toLowerCase().includes('amor'))).toBe(true);
    });

    it('Minguante includes cura practices', () => {
      const ritual = getMoonPhaseRitual('Minguante')!;
      expect(ritual.praticas_recomendadas.some(p => p.toLowerCase().includes('cura'))).toBe(true);
    });
  });
});