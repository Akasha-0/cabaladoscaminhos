/**
 * @akasha/mentor — Testes para MentorEngine
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MentorEngine } from './mentor';
import type { ChatRequest, ChatIntent } from './types';

// Mock das funções do @akasha/core
const mockGenerateHybrid = vi.fn();
const mockBuildRitual = vi.fn();

vi.mock('@akasha/core', () => ({
  generateHybrid: (...args: unknown[]) => mockGenerateHybrid(...args),
  calculateCodeOfDay: vi.fn().mockReturnValue({
    code: {
      hexagram: 1,
      level: 'gift',
      lifeArea: 'espiritualidade',
    },
    timestamp: Date.now(),
  }),
  buildRitual: (...args: unknown[]) => mockBuildRitual(...args),
}));

// Mock da função detectIntent
vi.mock('./intent-detector', () => ({
  detectIntent: vi.fn((message: string) => {
    if (message.includes('prática')) return 'practice';
    if (message.includes('ritual')) return 'ritual';
    if (message.includes('orientação')) return 'guidance';
    return 'general';
  }),
}));

// Configurar mocks padrão
beforeEach(() => {
  vi.clearAllMocks();
  
  mockGenerateHybrid.mockReturnValue([
    {
      practice: {
        id: 'pratica-1',
        name: 'Meditação do Hexagrama',
        category: 'meditacao',
      },
      confidence: 0.85,
      source: 'hybrid',
      personalizedReason: 'Recomendação para o hexagrama 1',
    },
    {
      practice: {
        id: 'pratica-2',
        name: 'Banho de Ervas',
        category: 'banho_de_ervas',
      },
      confidence: 0.72,
      source: 'hybrid',
      personalizedReason: 'Prática tradicional correlacionada',
    },
  ]);

  mockBuildRitual.mockReturnValue({
    data: new Date(),
    codigo: {
      hexagrama: {
        id: 1,
        name: 'Hexagrama 1',
        number: 1,
      },
      nivel: 'gift',
    },
    pratica: {
      id: 'pratica-ritual',
      name: 'Prática Ritual',
      category: 'ritual',
    },
    quizilas: [
      {
        id: 'quizila-1',
        texto: 'Não faça isto',
        tipo: 'proibicao',
      },
    ],
    afirmacao: 'Eu sou a criação em movimento',
    oracao: 'Criador de tudo',
  });
});

describe('MentorEngine', () => {
  let mentor: MentorEngine;

  beforeEach(() => {
    mentor = new MentorEngine();
  });

  describe('chat()', () => {
    describe('detecção automática de intent', () => {
      it('detecta intent=practice automaticamente pela mensagem', async () => {
        const request: ChatRequest = {
          message: 'gostaria de fazer uma prática espiritual',
          userCode: '1',
        };

        const response = await mentor.chat(request);

        expect(response.message).toBeDefined();
        expect(response.suggestedPractices).toBeDefined();
        expect(response.suggestedPractices).toHaveLength(2);
      });

      it('detecta intent=ritual automaticamente pela mensagem', async () => {
        const request: ChatRequest = {
          message: 'como fazer um ritual de abertura?',
          userCode: '5',
        };

        const response = await mentor.chat(request);

        expect(response.message).toBeDefined();
        expect(response.ritual).toBeDefined();
        expect(response.ritual?.level).toBe('gift');
      });

      it('detecta intent=guidance automaticamente', async () => {
        const request: ChatRequest = {
          message: 'preciso de orientação para decisão importante',
        };

        const response = await mentor.chat(request);

        expect(response.message).toBeDefined();
        expect(response.suggestedPractices).toBeUndefined();
        expect(response.ritual).toBeUndefined();
      });
    });

    describe('intent fornecida explicitamente', () => {
      it('usa intent=practice quando fornecida', async () => {
        const request: ChatRequest = {
          message: 'olá mentor',
          intent: 'practice',
          userCode: '15',
        };

        const response = await mentor.chat(request);

        expect(response.message).toBeDefined();
        expect(response.suggestedPractices).toBeDefined();
      });

      it('usa intent=ritual quando fornecida', async () => {
        const request: ChatRequest = {
          message: 'bom dia',
          intent: 'ritual',
          userCode: '25',
        };

        const response = await mentor.chat(request);

        expect(response.message).toBeDefined();
        expect(response.ritual).toBeDefined();
      });
    });

    describe('sugestão de práticas (intent=practice)', () => {
      it('retorna práticas recomendadas quando userCode é número', async () => {
        const request: ChatRequest = {
          message: 'qual prática devo fazer hoje?',
          intent: 'practice',
          userCode: '1',
        };

        const response = await mentor.chat(request);

        expect(response.suggestedPractices).toBeDefined();
        expect(response.suggestedPractices).toHaveLength(2);
        expect(response.suggestedPractices?.[0].id).toBe('pratica-1');
        expect(response.suggestedPractices?.[0].name).toBe('Meditação do Hexagrama');
      });

      it('retorna práticas quando userCode é formato "hex-lev-area"', async () => {
        const request: ChatRequest = {
          message: 'prática para hoje',
          intent: 'practice',
          userCode: '10-shadow-relacionamentos',
        };

        const response = await mentor.chat(request);

        expect(response.suggestedPractices).toBeDefined();
      });

      it('não retorna práticas quando userCode ausente', async () => {
        const request: ChatRequest = {
          message: 'gostaria de uma prática',
          intent: 'practice',
        };

        const response = await mentor.chat(request);

        expect(response.suggestedPractices).toBeUndefined();
      });
    });

    describe('sugestão de ritual (intent=ritual)', () => {
      it('retorna ritual com nível correto', async () => {
        const request: ChatRequest = {
          message: 'monte um ritual para mim',
          intent: 'ritual',
          userCode: '32',
        };

        const response = await mentor.chat(request);

        expect(response.ritual).toBeDefined();
        expect(response.ritual?.id).toBeDefined();
        expect(response.ritual?.name).toBe('Ritual do Dia');
        expect(response.ritual?.level).toBe('gift');
      });

      it('retorna quizilas do ritual', async () => {
        const request: ChatRequest = {
          message: 'preciso de um ritual completo',
          intent: 'ritual',
          userCode: '8',
        };

        const response = await mentor.chat(request);

        expect(response.relevantQuizilas).toBeDefined();
        expect(response.relevantQuizilas).toHaveLength(1);
        expect(response.relevantQuizilas?.[0].texto).toBe('Não faça isto');
      });

      it('não retorna ritual quando userCode ausente', async () => {
        const request: ChatRequest = {
          message: 'como fazer um ritual?',
          intent: 'ritual',
        };

        const response = await mentor.chat(request);

        expect(response.ritual).toBeUndefined();
      });
    });

    describe('resposta base do mentor', () => {
      it('retorna mensagem do mentor', async () => {
        const request: ChatRequest = {
          message: 'olá, como você está?',
        };

        const response = await mentor.chat(request);

        expect(response.message).toBeDefined();
        expect(typeof response.message).toBe('string');
      });

      it('resposta contém contexto da pergunta', async () => {
        const request: ChatRequest = {
          message: 'minha pergunta especial',
        };

        const response = await mentor.chat(request);

        expect(response.message).toContain('minha pergunta especial');
      });
    });

    describe('casos edge', () => {
      it('mensagem vazia retorna general intent', async () => {
        const request: ChatRequest = {
          message: '',
        };

        const response = await mentor.chat(request);

        expect(response.message).toBeDefined();
      });

      it('userCode inválido não causa erro', async () => {
        const request: ChatRequest = {
          message: 'prática',
          intent: 'practice',
          userCode: 'codigo-invalido',
        };

        const response = await mentor.chat(request);

        expect(response.message).toBeDefined();
        expect(response.suggestedPractices).toBeUndefined();
      });

      it('hexagrama fora do range não causa erro', async () => {
        const request: ChatRequest = {
          message: 'prática',
          intent: 'practice',
          userCode: '100',
        };

        const response = await mentor.chat(request);

        expect(response.message).toBeDefined();
        expect(response.suggestedPractices).toBeUndefined();
      });
    });
  });

  describe('ask()', () => {
    it('retorna resposta com confidence', async () => {
      const response = await mentor.ask('qual a resposta?', {});

      expect(response.answer).toBeDefined();
      expect(response.confidence).toBeDefined();
    });
  });

  describe('createMentor()', () => {
    it('cria instância com config customizada', () => {
      const customMentor = new MentorEngine({
        model: 'gpt-3.5',
        temperature: 0.5,
        maxTokens: 500,
      });

      expect(customMentor).toBeInstanceOf(MentorEngine);
    });
  });
});
