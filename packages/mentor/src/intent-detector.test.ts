/**
 * @akasha/mentor — Testes para Intent Detector
 */
import { describe, it, expect } from 'vitest';
import { detectIntent, intentLabel } from './intent-detector';
import type { ChatIntent } from './types';

describe('detectIntent', () => {
  describe('detecta prática espiritual', () => {
    it('reconhece "prática" em português', () => {
      expect(detectIntent('preciso de uma prática')).toBe('practice');
    });

    it('reconhece "banho" como prática', () => {
      expect(detectIntent('quero fazer um banho de limpeza')).toBe('practice');
    });

    it('reconhece "oração" como prática', () => {
      expect(detectIntent('qual oração devo fazer?')).toBe('practice');
    });

    it('reconhece "meditação" como prática', () => {
      expect(detectIntent('gostaria de meditar hoje')).toBe('practice');
    });

    it('é case-insensitive', () => {
      expect(detectIntent('PRÁTICA DIÁRIA')).toBe('practice');
    });
  });

  describe('detecta ritual/cerimônia', () => {
    it('reconhece "ritual" como intenção específica', () => {
      expect(detectIntent('como fazer um ritual de abertura?')).toBe('ritual');
    });

    it('reconhece "cerimônia" como ritual', () => {
      expect(detectIntent('tenho uma cerimônia amanhã')).toBe('ritual');
    });

    it('reconhece oferenda/oferecer', () => {
      expect(detectIntent('o que oferecer ao orixá?')).toBe('ritual');
    });

    it('ritual tem prioridade sobre prática', () => {
      expect(detectIntent('tenho um ritual de prática hoje')).toBe('ritual');
    });
  });

  describe('detecta orientação/conselho', () => {
    it('reconhece "orientação" como guidance', () => {
      expect(detectIntent('preciso de orientação')).toBe('guidance');
    });

    it('reconhece "conselho" como guidance', () => {
      expect(detectIntent('me dê um conselho')).toBe('guidance');
    });

    it('reconhece "ajuda" como guidance', () => {
      expect(detectIntent('preciso de ajuda com uma decisão')).toBe('guidance');
    });

    it('reconhece "não sei" como guidance', () => {
      expect(detectIntent('não sei o que fazer')).toBe('guidance');
    });

    it('reconhece confusão como guidance', () => {
      expect(detectIntent('estou confuso sobre meu caminho')).toBe('guidance');
    });
  });

  describe('fallback para general', () => {
    it('retorna general para mensagens sem padrão', () => {
      expect(detectIntent('olá, tudo bem?')).toBe('general');
    });

    it('retorna general para saudação simples', () => {
      expect(detectIntent('bom dia')).toBe('general');
    });

    it('retorna general para mensagem vazia', () => {
      expect(detectIntent('')).toBe('general');
    });

    it('retorna general para espaços em branco', () => {
      expect(detectIntent('   ')).toBe('general');
    });
  });

  describe('acentos e normalização', () => {
    it('detecta padrão com acento', () => {
      expect(detectIntent('orientação')).toBe('guidance');
    });

    it('detecta padrão sem acento', () => {
      expect(detectIntent('orientacao')).toBe('guidance');
    });

    it('detecta prática com Ç', () => {
      expect(detectIntent('prática')).toBe('practice');
    });
  });
});

describe('intentLabel', () => {
  it('retorna label correto para cada intent', () => {
    expect(intentLabel('practice')).toBe('Prática Espiritual');
    expect(intentLabel('ritual')).toBe('Ritual/Cerimônia');
    expect(intentLabel('guidance')).toBe('Orientação/Conselho');
    expect(intentLabel('general')).toBe('Conversa Geral');
  });
});

describe('integração com tipos', () => {
  it('todas as intents são válidas', () => {
    const intents: ChatIntent[] = ['practice', 'guidance', 'ritual', 'general'];
    intents.forEach((intent) => {
      expect(typeof intent).toBe('string');
      const label = intentLabel(intent);
      expect(label.length).toBeGreaterThan(0);
    });
  });
});
