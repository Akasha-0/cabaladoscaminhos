/**
 * @akasha/mentor — Testes para Intent Detector + Emotion Detector
 */
import { describe, it, expect } from 'vitest';
import { detectIntent, detectEmotion, intentLabel } from './intent-detector';
import type { ChatIntent } from './types';
import type { EmotionalState } from './emotional-state';

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

describe('detectEmotion (Wave 9.3)', () => {
  describe('detecta ansiedade', () => {
    it('reconhece "ansioso" como estado emocional', () => {
      expect(detectEmotion('estou me sentindo ansioso')).toBe('ansioso');
    });

    it('reconhece "ansiedade" (forma substantivada)', () => {
      expect(detectEmotion('a ansiedade está me dominando')).toBe('ansioso');
    });

    it('reconhece "medo" como variação', () => {
      expect(detectEmotion('estou com muito medo')).toBe('ansioso');
    });

    it('reconhece "preocupado" como variação', () => {
      expect(detectEmotion('estou preocupado com o futuro')).toBe('ansioso');
    });

    it('é case-insensitive', () => {
      expect(detectEmotion('ANSIOSO E NERVOSO')).toBe('ansioso');
    });
  });

  describe('detecta perda de direção', () => {
    it('reconhece "perdido" como estado emocional', () => {
      expect(detectEmotion('estou me sentindo perdido')).toBe('perdido');
    });

    it('reconhece "confuso" como variação', () => {
      expect(detectEmotion('estou confuso sobre meu caminho')).toBe('perdido');
    });

    it('reconhece "sem direção" como variação', () => {
      expect(detectEmotion('não sei, estou sem direção')).toBe('perdido');
    });
  });

  describe('detecta curiosidade', () => {
    it('reconhece "curioso" como estado emocional', () => {
      expect(detectEmotion('estou curioso sobre o sistema')).toBe('curioso');
    });

    it('reconhece "explorar" como variação', () => {
      expect(detectEmotion('quero explorar mais tradições')).toBe('curioso');
    });

    it('reconhece "aprender" como variação', () => {
      expect(detectEmotion('quero aprender sobre Cabala')).toBe('curioso');
    });
  });

  describe('detecta centrado/calmo', () => {
    it('reconhece "centrado" como estado emocional', () => {
      expect(detectEmotion('estou me sentindo centrado hoje')).toBe('centrado');
    });

    it('reconhece "em paz" como variação', () => {
      expect(detectEmotion('estou em paz comigo')).toBe('centrado');
    });

    it('reconhece "calmo" como variação', () => {
      expect(detectEmotion('estou calmo e tranquilo')).toBe('centrado');
    });
  });

  describe('fallback e priorização', () => {
    it('retorna null para mensagens sem padrão emocional', () => {
      expect(detectEmotion('olá, tudo bem?')).toBeNull();
    });

    it('retorna null para texto vazio', () => {
      expect(detectEmotion('')).toBeNull();
    });

    it('retorna null para whitespace', () => {
      expect(detectEmotion('   ')).toBeNull();
    });

    it('ansioso tem prioridade sobre perdido quando ambos aparecem', () => {
      // Texto híbrido — ansioso deve ganhar (Wave 9.3 ordering)
      expect(detectEmotion('estou ansioso e perdido')).toBe('ansioso');
    });

    it('detecta emoción mesmo com acentos removidos (sem acento)', () => {
      expect(detectEmotion('estou ansioso')).toBe('ansioso');
      // Sem acento também funciona pois regex é case-insensitive e usa radicais
    });
  });

  describe('cobertura de tipos', () => {
    it('detecta todos os 4 EmotionalStates', () => {
      const states: EmotionalState[] = [
        'centrado',
        'ansioso',
        'perdido',
        'curioso',
      ];
      states.forEach((state) => {
        // Cada estado tem pelo menos uma frase gatilho
        const triggers: Record<EmotionalState, string> = {
          ansioso: 'estou ansioso',
          perdido: 'estou perdido',
          curioso: 'estou curioso',
          centrado: 'estou centrado',
        };
        expect(detectEmotion(triggers[state])).toBe(state);
      });
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
