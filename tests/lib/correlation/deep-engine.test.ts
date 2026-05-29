import { describe, test, expect } from 'vitest';
import {
  correlate, getDayCorrelations, getOrixaCorrelations, getOduCorrelations,
  getSolfeggioChakra, getNumerologyOdu, calculateScore, calculateConvergence,
  buildCorrelationMatrix, getMesaRealHouse
} from '../../../src/lib/correlation/deep-engine';

describe('Deep Correlation Engine', () => {
  describe('Day Correlations', () => {
    test('Segunda-feira returns Omolu/Exu', () => {
      expect(getDayCorrelations('segunda-feira')?.orixas).toContain('Omolu');
    });
    test('Sexta-feira returns Oxalá', () => {
      expect(getDayCorrelations('sexta-feira')?.orixas).toContain('Oxalá');
    });
    test('Terça-feira returns Iansã/Ogum', () => {
      expect(getDayCorrelations('terça-feira')?.orixas).toContain('Iansã');
    });
    test('Quarta-feira returns Xangô', () => {
      expect(getDayCorrelations('quarta-feira')?.orixas).toContain('Xangô');
    });
    test('Quinta-feira returns Oxóssi', () => {
      expect(getDayCorrelations('quinta-feira')?.orixas).toContain('Oxóssi');
    });
    test('Sábado returns Oxum and Iemanjá', () => {
      const r = getDayCorrelations('sábado');
      expect(r?.orixas).toContain('Oxum');
      expect(r?.orixas).toContain('Iemanjá');
    });
    test('Domingo returns Xangô', () => {
      expect(getDayCorrelations('domingo')?.orixas).toContain('Xangô');
    });
  });

  describe('Orixá Correlations', () => {
    test('Oxalá has Friday', () => {
      expect(getOrixaCorrelations('Oxalá')?.dia).toBe('Sexta-feira');
    });
    test('Ogum has Tuesday', () => {
      expect(getOrixaCorrelations('Ogum')?.dia).toBe('Terça-feira');
    });
    test('Iemanjá has Saturday', () => {
      expect(getOrixaCorrelations('Iemanjá')?.dia).toBe('Sábado');
    });
    test('All Orixás have greetings', () => {
      ['Oxalá', 'Iemanjá', 'Oxum', 'Ogum', 'Oxóssi', 'Xangô', 'Iansã', 'Omolu', 'Nanã', 'Oxumaré', 'Exu'].forEach(o => {
        expect(getOrixaCorrelations(o)?.saudacao?.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Odú Correlations', () => {
    test('Okaran has Exu', () => {
      expect(getOduCorrelations('Okaran')?.orixas).toContain('Exu');
    });
    test('Alafia leads to Orunmilá', () => {
      expect(getOduCorrelations('Alafia')?.orixas).toContain('Orunmilá');
    });
    test('All 16 Odús available', () => {
      for (let i = 1; i <= 16; i++) expect(getOduCorrelations(i)).not.toBeNull();
    });
    test('All 16 Odús have quizilas', () => {
      for (let i = 1; i <= 16; i++) {
        expect(getOduCorrelations(i)?.quizilas?.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Solfeggio Chakra', () => {
    test('963Hz = 7º Coronário', () => {
      expect(getSolfeggioChakra('963Hz')?.chakra).toBe('7º Coronário');
    });
    test('528Hz = 3º Plexo Solar', () => {
      expect(getSolfeggioChakra('528Hz')?.chakra).toBe('3º Plexo Solar');
    });
    test('396Hz = 1º Básico', () => {
      expect(getSolfeggioChakra('396Hz')?.chakra).toBe('1º Básico');
    });
  });

  describe('Numerology Odú', () => {
    test('1 = Okaran', () => {
      expect(getNumerologyOdu(1)?.odu).toBe('Okaran');
    });
    test('5 = Oxé', () => {
      expect(getNumerologyOdu(5)?.odu).toBe('Oxé');
    });
    test('11 = Alafia', () => {
      expect(getNumerologyOdu(11)?.odu).toBe('Alafia');
    });
  });

  describe('Scoring', () => {
    test('Same element = 100', () => expect(calculateScore('fogo','fogo')).toBe(100));
    test('Fire+Water = 40', () => expect(calculateScore('fogo','água')).toBe(40));
    test('Same element case insensitive = 100', () => expect(calculateScore('FOGO','fogo')).toBe(100));
  });

  describe('Convergence', () => {
    test('Empty = weak', () => {
      expect(calculateConvergence({}).strength).toBe('weak');
      expect(calculateConvergence({}).overallScore).toBe(0);
    });
    test('Matching Life Path and Odú = strong', () => {
      expect(calculateConvergence({lifePathNumber: 1, oduBirth: 1}).overallScore).toBeGreaterThan(0);
    });
  });

  describe('Matrix', () => {
    test('Square matrix', () => {
      const m = buildCorrelationMatrix();
      expect(m.matrix.length).toBe(m.labels.length);
    });
    test('Diagonal = 100', () => {
      const m = buildCorrelationMatrix();
      for (let i = 0; i < m.matrix.length; i++) {
        expect(m.matrix[i][i]).toBe(100);
      }
    });
  });

  describe('Mesa Real', () => {
    test('House 24 = Amor', () => expect(getMesaRealHouse(24)?.area).toBe('Amor'));
    test('House 34 = Dinheiro', () => expect(getMesaRealHouse(34)?.area).toBe('Dinheiro'));
    test('House 14 = Trabalho', () => expect(getMesaRealHouse(14)?.area).toBe('Trabalho'));
    test('House 99 = null', () => expect(getMesaRealHouse(99)).toBeNull());
  });

  describe('Correlate', () => {
    test('Okaran-Exu = odu-orixa perfect', () => {
      const r = correlate('Okaran','Exu').find(x => x.type === 'odu-orixa');
      expect(r?.score).toBe(100);
      expect(r?.strength).toBe('perfect');
    });
  });

  describe('Edge Cases', () => {
    test('Unknown day = null', () => expect(getDayCorrelations('xyz')).toBeNull());
    test('Unknown orixa = null', () => expect(getOrixaCorrelations('XYZ')).toBeNull());
    test('Invalid Odú number = null', () => expect(getOduCorrelations(99)).toBeNull());
    test('Invalid frequency = null', () => expect(getSolfeggioChakra('999Hz')).toBeNull());
  });
});
