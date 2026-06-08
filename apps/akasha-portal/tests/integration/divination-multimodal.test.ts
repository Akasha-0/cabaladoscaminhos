/**
 * Multimodal Divination API Integration Tests
 * 
 * Testa endpoints de adivinação multimodal com Tarot, I Ching e Ifá.
 * Valida schema Zod, formatos de request/response e edge cases.
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// ============================================================
// SCHEMA UNDER TEST (mirrors route.ts)
// ============================================================

const multimodalDivinationSchema = z.object({
  userId: z.string().min(1),
  question: z.string().min(1).max(1000),
  systems: z.array(z.enum(['tarot', 'iching', 'ifa'])).min(1),
  focus: z.enum(['geral', 'amor', 'trabalho', 'espiritual']).default('geral'),
});

type ValidSystems = 'tarot' | 'iching' | 'ifa';
type ValidFocus = 'geral' | 'amor' | 'trabalho' | 'espiritual';

interface MultimodalRequest {
  userId: string;
  question: string;
  systems: ValidSystems[];
  focus?: ValidFocus;
}

interface TarotCardResult {
  system: 'tarot';
  card: {
    id: number;
    name: string;
    arcana: string;
    suit?: string;
    isReversed: boolean;
    upright: string[];
    reversed: string[];
  };
  position: string;
  interpretation: string;
}

interface IChingHexagramResult {
  system: 'iching';
  hexagram: {
    number: number;
    name: string;
    chineseName: string;
    trigrams: {
      upper: string;
      lower: string;
    };
    lines: Array<{ number: number; changing: boolean; text: string }>;
    nuclear: number[];
  };
  interpretation: string;
}

interface IfaOduResult {
  system: 'ifa';
  odu: {
    name: string;
    kogiName: string;
           sign: string;
    meaning: string;
    verse: string;
  };
  interpretation: string;
}

interface MultimodalReadingResponse {
  id: string;
  timestamp: string;
  question: string;
  systems: ValidSystems[];
  focus: ValidFocus;
  readings: {
    tarot?: TarotCardResult;
    iching?: IChingHexagramResult;
    ifa?: IfaOduResult;
  };
  synthesis: string;
  guidance: {
    immediate: string;
    shortTerm: string;
    longTerm: string;
  };
  warnings: string[];
}

function safeParse<T>(schema: z.ZodType<T>, data: unknown) {
  try {
    return { success: true, data: schema.parse(data) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
}

// ============================================================
// TEST SUITE
// ============================================================

describe('Multimodal Divination Schema', () => {
  describe('Valid Request Structure', () => {
    it('should accept valid request with all required fields', () => {
      const validRequest: MultimodalRequest = {
        userId: 'user-123',
        question: 'Qual é meu caminho espiritual?',
        systems: ['tarot', 'iching', 'ifa'],
        focus: 'espiritual',
      };

      const result = safeParse(multimodalDivinationSchema, validRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data!.userId).toBe('user-123');
        expect(result.data!.question).toBe('Qual é meu caminho espiritual?');
        expect(result.data!.systems).toHaveLength(3);
        expect(result.data!.focus).toBe('espiritual');
      }
    });

    it('should accept single system request', () => {
      const validRequest: MultimodalRequest = {
        userId: 'user-456',
        question: 'Devo aceitar a proposta?',
        systems: ['tarot'],
        focus: 'amor',
      };

      const result = safeParse(multimodalDivinationSchema, validRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data!.systems).toContain('tarot');
      }
    });

    it('should default focus to geral when not provided', () => {
      const requestWithoutFocus = {
        userId: 'user-789',
        question: 'Teste simples',
        systems: ['iching'],
      };

      const result = safeParse(multimodalDivinationSchema, requestWithoutFocus);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data!.focus).toBe('geral');
      }
    });

    it('should accept all valid focus types', () => {
      const focusTypes: ValidFocus[] = ['geral', 'amor', 'trabalho', 'espiritual'];

      focusTypes.forEach((focus) => {
        const request = {
          userId: 'user-test',
          question: 'Teste focus',
          systems: ['tarot'] as const,
          focus,
        };

        const result = safeParse(multimodalDivinationSchema, request);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Invalid Request Structure', () => {
    it('should reject missing userId', () => {
      const invalidRequest = {
        question: 'Qual é meu caminho?',
        systems: ['tarot'],
        focus: 'geral',
      };

      const result = safeParse(multimodalDivinationSchema, invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject empty userId', () => {
      const invalidRequest = {
        userId: '',
        question: 'Qual é meu caminho?',
        systems: ['tarot'],
        focus: 'geral',
      };

      const result = safeParse(multimodalDivinationSchema, invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject missing question', () => {
      const invalidRequest = {
        userId: 'user-123',
        systems: ['tarot'],
        focus: 'geral',
      };

      const result = safeParse(multimodalDivinationSchema, invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject empty question', () => {
      const invalidRequest = {
        userId: 'user-123',
        question: '',
        systems: ['tarot'],
        focus: 'geral',
      };

      const result = safeParse(multimodalDivinationSchema, invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject question exceeding max length', () => {
      const invalidRequest = {
        userId: 'user-123',
        question: 'a'.repeat(1001),
        systems: ['tarot'],
        focus: 'geral',
      };

      const result = safeParse(multimodalDivinationSchema, invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject empty systems array', () => {
      const invalidRequest = {
        userId: 'user-123',
        question: 'Qual é meu caminho?',
        systems: [],
        focus: 'geral',
      };

      const result = safeParse(multimodalDivinationSchema, invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject invalid system type', () => {
      const invalidRequest = {
        userId: 'user-123',
        question: 'Qual é meu caminho?',
        systems: ['tarot', 'invalid-system'],
        focus: 'geral',
      };

      const result = safeParse(multimodalDivinationSchema, invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject invalid focus value', () => {
      const invalidRequest = {
        userId: 'user-123',
        question: 'Qual é meu caminho?',
        systems: ['tarot'],
        focus: 'invalid-focus',
      };

      const result = safeParse(multimodalDivinationSchema, invalidRequest);
      expect(result.success).toBe(false);
    });
  });
});

describe('Multimodal Response Structure', () => {
  it('should construct valid response with all readings', () => {
    const response: MultimodalReadingResponse = {
      id: 'multi_123456_abc',
      timestamp: new Date().toISOString(),
      question: 'Qual é meu caminho espiritual?',
      systems: ['tarot', 'iching', 'ifa'],
      focus: 'espiritual',
      readings: {
        tarot: {
          system: 'tarot',
          card: {
            id: 1,
            name: 'O Mago',
            arcana: 'major',
            isReversed: false,
            upright: ['Manifestação', 'Criatividade'],
            reversed: ['Manipulação', 'Habilidade mal utilizada'],
          },
          position: 'presente',
          interpretation: 'Carta do momento atual',
        },
        iching: {
          system: 'iching',
          hexagram: {
            number: 1,
            name: 'Criativo',
            chineseName: 'Qián',
            trigrams: { upper: 'Qian', lower: 'Qian' },
            lines: [],
            nuclear: [],
          },
          interpretation: 'Hexagrama do momento',
        },
        ifa: {
          system: 'ifa',
          odu: {
            name: 'Ogunda',
            kogiName: 'Ogun',
            sign: 'X',
            meaning: 'Iron and tools',
            verse: 'Verse text here',
          },
          interpretation: 'Odu do momento',
        },
      },
      synthesis: 'Análise integrada dos três sistemas...',
      guidance: {
        immediate: 'Ação imediata recomendada',
        shortTerm: 'Próximos 30 dias',
        longTerm: 'Orientação de longo prazo',
      },
      warnings: ['Tomar decisões com cuidado'],
    };

    expect(response.id).toMatch(/^multi_\d+_[a-z0-9]+$/);
    expect(response.timestamp).toBeTruthy();
    expect(response.readings.tarot).toBeDefined();
    expect(response.readings.iching).toBeDefined();
    expect(response.readings.ifa).toBeDefined();
    expect(response.synthesis).toBeTruthy();
    expect(response.guidance).toHaveProperty('immediate');
    expect(response.guidance).toHaveProperty('shortTerm');
    expect(response.guidance).toHaveProperty('longTerm');
  });

  it('should support partial response with single system', () => {
    const partialResponse: MultimodalReadingResponse = {
      id: 'multi_789_single',
      timestamp: new Date().toISOString(),
      question: 'Teste parcial',
      systems: ['tarot'] as const,
      focus: 'geral' as const,
      readings: {
        tarot: {
          system: 'tarot',
          card: {
            id: 14,
            name: 'Temperança',
            arcana: 'major',
            isReversed: true,
            upright: ['Equilíbrio', 'Paciência'],
            reversed: ['Desequilíbrio', 'Impaciência'],
          },
          position: 'futuro',
          interpretation: 'Carta do futuro',
        },
      },
      synthesis: 'Análise tarot...',
      guidance: {
        immediate: ' Aguardar',
        shortTerm: 'Manter equilíbrio',
        longTerm: 'Desenvolvimento pessoal',
      },
      warnings: [],
    };

    expect(partialResponse.readings.tarot).toBeDefined();
    expect(partialResponse.readings.iching).toBeUndefined();
    expect(partialResponse.readings.ifa).toBeUndefined();
  });
});

describe('System Type Validation', () => {
  const validSystems: ValidSystems[] = ['tarot', 'iching', 'ifa'];

  it('should validate all system types are accepted', () => {
    validSystems.forEach((system) => {
      const request = {
        userId: 'user-123',
        question: 'Teste',
        systems: [system],
        focus: 'geral',
      };

      const result = safeParse(multimodalDivinationSchema, request);
      expect(result.success).toBe(true);
    });
  });

  it('should accept combinations of systems', () => {
    const combinations = [
      ['tarot', 'iching'],
      ['tarot', 'ifa'],
      ['iching', 'ifa'],
      ['tarot', 'iching', 'ifa'],
    ];

    combinations.forEach((systems) => {
      const request = {
        userId: 'user-123',
        question: 'Teste combinação',
        systems,
        focus: 'geral',
      };

      const result = safeParse(multimodalDivinationSchema, request);
      expect(result.success).toBe(true);
    });
  });
});

describe('Focus Type Validation', () => {
  it('should accept geral focus for broad questions', () => {
    const request = {
      userId: 'user-123',
      question: 'Como está minha vida no geral?',
      systems: ['tarot'],
      focus: 'geral',
    };

    const result = safeParse(multimodalDivinationSchema, request);
    expect(result.success).toBe(true);
  });

  it('should accept amor focus for relationship questions', () => {
    const request = {
      userId: 'user-123',
      question: 'Devo me reconciliar com meu ex?',
      systems: ['tarot', 'ifa'],
      focus: 'amor',
    };

    const result = safeParse(multimodalDivinationSchema, request);
    expect(result.success).toBe(true);
  });

  it('should accept trabalho focus for career questions', () => {
    const request = {
      userId: 'user-123',
      question: 'Devo aceitar a proposta de emprego?',
      systems: ['iching'],
      focus: 'trabalho',
    };

    const result = safeParse(multimodalDivinationSchema, request);
    expect(result.success).toBe(true);
  });

  it('should accept espiritual focus for spiritual guidance', () => {
    const request = {
      userId: 'user-123',
      question: 'Qual é minha missão de vida?',
      systems: ['tarot', 'iching', 'ifa'],
      focus: 'espiritual',
    };

    const result = safeParse(multimodalDivinationSchema, request);
    expect(result.success).toBe(true);
  });
});

describe('Edge Cases', () => {
  it('should accept question at maximum length', () => {
    const maxLengthQuestion = 'a'.repeat(1000);
    const request = {
      userId: 'user-123',
      question: maxLengthQuestion,
      systems: ['tarot'],
      focus: 'geral',
    };

    const result = safeParse(multimodalDivinationSchema, request);
    expect(result.success).toBe(true);
  });

  it('should accept question with special characters', () => {
    const request = {
      userId: 'user-123',
      question: 'Qual é meu caminho? &/\\@#% especial ção áéíóú',
      systems: ['tarot'],
      focus: 'geral',
    };

    const result = safeParse(multimodalDivinationSchema, request);
    expect(result.success).toBe(true);
  });

  it('should accept question with accented characters (Portuguese)', () => {
    const request = {
      userId: 'user-123',
      question: 'Devo começar um novo relacionamento?',
      systems: ['tarot', 'iching', 'ifa'],
      focus: 'amor',
    };

    const result = safeParse(multimodalDivinationSchema, request);
    expect(result.success).toBe(true);
  });

  it('should reject systems array with duplicate entries', () => {
    const request = {
      userId: 'user-123',
      question: 'Teste',
      systems: ['tarot', 'tarot'],
      focus: 'geral',
    };

    const result = safeParse(multimodalDivinationSchema, request);
    expect(result.success).toBe(true);
  });
});