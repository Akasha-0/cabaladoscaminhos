/**
 * Validators Unit Tests
 * 
 * Comprehensive tests for Zod schemas and validation utilities.
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  safeParse,
  successResponse,
  validationErrorResponse,
  registroSchema,
  loginSchema,
  numerologiaInputSchema,
  mapaNatalInputSchema,
  chatMensagemSchema,
  creditosInputSchema,
  ciclosInputSchema,
  odusInputSchema,
  insightDiarioInputSchema,
  emailSchema,
  senhaSchema,
  nomeCompletoSchema,
  dataNascimentoSchema,
  horaNascimentoSchema,
  localNascimentoSchema,
} from '@/lib/validators';

describe('safeParse Utility', () => {
  const testSchema = z.object({
    name: z.string().min(2),
    age: z.number().min(0),
  });

  it('should return success result for valid data', () => {
    const result = safeParse(testSchema, { name: 'Maria', age: 30 });
    
    expect(result).toHaveProperty('success', true);
    if ('success' in result && result.success) {
      expect(result.data).toEqual({ name: 'Maria', age: 30 });
    }
  });

  it('should return error result for invalid data', () => {
    const result = safeParse(testSchema, { name: 'A', age: -5 });
    
    expect(result).toHaveProperty('success', false);
    if ('success' in result && !result.success) {
      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });

  it('should return error for completely invalid data', () => {
    const result = safeParse(testSchema, null);
    
    expect(result).toHaveProperty('success', false);
    if ('success' in result && !result.success) {
      expect(result.errors).toBeDefined();
    }
  });
});

describe('Email Schema', () => {
  it('should accept valid email addresses', () => {
    const validEmails = [
      'user@example.com',
      'test.user@domain.org',
      'name+tag@company.co.uk',
    ];
    
    for (const email of validEmails) {
      const result = emailSchema.safeParse(email);
      expect(result.success).toBe(true);
    }
  });

  it('should reject invalid email addresses', () => {
    const invalidEmails = [
      'notanemail',
      'missing@domain',
      '@nodomain.com',
      'spaces in@email.com',
    ];
    
    for (const email of invalidEmails) {
      const result = emailSchema.safeParse(email);
      expect(result.success).toBe(false);
    }
  });
});

describe('Senha Schema', () => {
  it('should accept valid passwords', () => {
    const validPasswords = [
      'SecurePass123',
      'MyStr0ngP4ssword!',
      'C@mplex#Pass$2024',
    ];
    
    for (const senha of validPasswords) {
      const result = senhaSchema.safeParse(senha);
      expect(result.success).toBe(true);
    }
  });

  it('should reject passwords without uppercase letter', () => {
    const result = senhaSchema.safeParse('onlylowercase123');
    expect(result.success).toBe(false);
    if (!result.success) {
      const hasUppercaseError = result.error.errors.some(
        e => e.message.includes('maiúscula')
      );
      expect(hasUppercaseError).toBe(true);
    }
  });

  it('should reject passwords without lowercase letter', () => {
    const result = senhaSchema.safeParse('ONLYUPPERCASE123');
    expect(result.success).toBe(false);
    if (!result.success) {
      const hasLowercaseError = result.error.errors.some(
        e => e.message.includes('minúscula')
      );
      expect(hasLowercaseError).toBe(true);
    }
  });

  it('should reject passwords without number', () => {
    const result = senhaSchema.safeParse('NoNumbersHere');
    expect(result.success).toBe(false);
    if (!result.success) {
      const hasNumberError = result.error.errors.some(
        e => e.message.includes('número')
      );
      expect(hasNumberError).toBe(true);
    }
  });

  it('should reject passwords shorter than 8 characters', () => {
    const result = senhaSchema.safeParse('Sh0rt1');
    expect(result.success).toBe(false);
    if (!result.success) {
      const hasLengthError = result.error.errors.some(
        e => e.message.includes('pelo menos 8')
      );
      expect(hasLengthError).toBe(true);
    }
  });

  it('should reject passwords longer than 100 characters', () => {
    const longPassword = 'A'.repeat(101) + '1' + 'a';
    const result = senhaSchema.safeParse(longPassword);
    expect(result.success).toBe(false);
  });
});

describe('Nome Completo Schema', () => {
  it('should accept valid names', () => {
    const validNames = [
      'Maria Silva',
      'João Carlos',
      "O'Brien",
      'Silva-Neto',
      'José Maria',
    ];
    
    for (const nome of validNames) {
      const result = nomeCompletoSchema.safeParse(nome);
      expect(result.success).toBe(true);
    }
  });

  it('should reject names with numbers', () => {
    const result = nomeCompletoSchema.safeParse('João123');
    expect(result.success).toBe(false);
  });

  it('should reject names shorter than 2 characters', () => {
    const result = nomeCompletoSchema.safeParse('A');
    expect(result.success).toBe(false);
  });

  it('should reject names longer than 200 characters', () => {
    const longName = 'A'.repeat(201);
    const result = nomeCompletoSchema.safeParse(longName);
    expect(result.success).toBe(false);
  });
});

describe('Data Nascimento Schema', () => {
  it('should accept valid dates', () => {
    const validDates = [
      '1990-06-15',
      '2000-01-01',
      '1985-12-31',
    ];
    
    for (const data of validDates) {
      const result = dataNascimentoSchema.safeParse(data);
      expect(result.success).toBe(true);
    }
  });

  it('should accept future dates (for calculations)', () => {
    // Schema allows future dates for numerological calculations
    const futureDate = '2099-01-01';
    const result = dataNascimentoSchema.safeParse(futureDate);
    expect(result.success).toBe(true);
  });

  it('should accept multiple date formats', () => {
    // The schema accepts multiple formats
    const formats = [
      '1990-06-15',  // ISO
      '1990/06/15',  // Slash
    ];
    
    for (const data of formats) {
      const result = dataNascimentoSchema.safeParse(data);
      expect(result.success).toBe(true);
    }
  });

  it('should accept past dates', () => {
    const pastDate = '1950-01-01';
    const result = dataNascimentoSchema.safeParse(pastDate);
    expect(result.success).toBe(true);
  });

  it('should accept today\'s date', () => {
    const today = new Date().toISOString().split('T')[0];
    const result = dataNascimentoSchema.safeParse(today);
    expect(result.success).toBe(true);
  });

  it('should reject truly invalid date strings', () => {
    const invalidDates = [
      'invalid',
      '',
      'not-a-date',
    ];
    
    for (const data of invalidDates) {
      const result = dataNascimentoSchema.safeParse(data);
      expect(result.success).toBe(false);
    }
  });
});

describe('Hora Nascimento Schema', () => {
  it('should accept valid time formats', () => {
    const validTimes = [
      '00:00',
      '12:30',
      '23:59',
      '7:30',
    ];
    
    for (const hora of validTimes) {
      const result = horaNascimentoSchema.safeParse(hora);
      expect(result.success).toBe(true);
    }
  });

  it('should accept undefined/optional values', () => {
    const result = horaNascimentoSchema.safeParse(undefined);
    expect(result.success).toBe(true);
  });

  it('should reject invalid time formats', () => {
    const invalidTimes = [
      '25:00',
      '12:60',
      'midnight',
    ];
    
    for (const hora of invalidTimes) {
      const result = horaNascimentoSchema.safeParse(hora);
      expect(result.success).toBe(false);
    }
  });
});

describe('Local Nascimento Schema', () => {
  it('should accept valid locations', () => {
    const validLocations = [
      'São Paulo, Brasil',
      'Rio de Janeiro',
      'Lisboa, Portugal',
    ];
    
    for (const local of validLocations) {
      const result = localNascimentoSchema.safeParse(local);
      expect(result.success).toBe(true);
    }
  });

  it('should accept undefined/optional values', () => {
    const result = localNascimentoSchema.safeParse(undefined);
    expect(result.success).toBe(true);
  });
});

describe('Registro Schema', () => {
  it('should accept valid registration data', () => {
    const validData = {
      nomeCompleto: 'Maria Silva',
      email: 'maria@example.com',
      password: 'SecurePass123',
      dataNascimento: '1990-06-15',
    };
    
    const result = registroSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject registration with invalid email', () => {
    const invalidData = {
      nomeCompleto: 'Maria Silva',
      email: 'invalid-email',
      password: 'SecurePass123',
      dataNascimento: '1990-06-15',
    };
    
    const result = registroSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject registration with short password', () => {
    const invalidData = {
      nomeCompleto: 'Maria Silva',
      email: 'maria@example.com',
      password: 'short',
      dataNascimento: '1990-06-15',
    };
    
    const result = registroSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should accept optional fields when provided', () => {
    const validData = {
      nomeCompleto: 'Maria Silva',
      email: 'maria@example.com',
      password: 'SecurePass123',
      dataNascimento: '1990-06-15',
      horaNascimento: '14:30',
      localNascimento: 'São Paulo',
    };
    
    const result = registroSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe('Login Schema', () => {
  it('should accept valid login data', () => {
    const validData = {
      email: 'user@example.com',
      password: 'password123',
    };
    
    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject login without email', () => {
    const invalidData = {
      password: 'password123',
    };
    
    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('Numerologia Input Schema', () => {
  it('should accept valid numerologia input', () => {
    const validData = {
      nomeCompleto: 'Maria Silva',
      dataNascimento: '1990-06-15',
    };
    
    const result = numerologiaInputSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject numerologia without nomeCompleto', () => {
    const invalidData = {
      dataNascimento: '1990-06-15',
    };
    
    const result = numerologiaInputSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('Mapa Natal Input Schema', () => {
  it('should accept valid mapa natal input', () => {
    const validData = {
      dataNascimento: '1990-06-15',
      horaNascimento: '14:30',
      localNascimento: 'São Paulo',
    };
    
    const result = mapaNatalInputSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should accept mapa natal with minimal required fields', () => {
    const validData = {
      dataNascimento: '1990-06-15',
    };
    
    const result = mapaNatalInputSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe('Chat Mensagem Schema', () => {
  it('should accept valid chat mensagem input', () => {
    const validData = {
      conteudo: 'Olá, gostaria de saber mais sobre meu mapa astral.',
    };
    
    const result = chatMensagemSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tipo).toBe('usuario'); // Default value
    }
  });

  it('should reject empty conteudo', () => {
    const invalidData = {
      conteudo: '',
    };
    
    const result = chatMensagemSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should accept sistema tipo mensagem', () => {
    const validData = {
      conteudo: 'Mensagem do sistema',
      tipo: 'sistema',
    };
    
    const result = chatMensagemSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe('Créditos Input Schema', () => {
  it('should accept valid créditos input', () => {
    const validData = {
      quantidade: 10,
      operacao: 'adicionar',
    };
    
    const result = creditosInputSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject negative quantidade', () => {
    const invalidData = {
      quantidade: -5,
      operacao: 'adicionar',
    };
    
    const result = creditosInputSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject zero quantidade', () => {
    const invalidData = {
      quantidade: 0,
      operacao: 'adicionar',
    };
    
    const result = creditosInputSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should accept debitar operacao', () => {
    const validData = {
      quantidade: 5,
      operacao: 'debitar',
    };
    
    const result = creditosInputSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe('Ciclos Input Schema', () => {
  it('should accept valid ciclos input', () => {
    const validData = {
      dataNascimento: '1990-06-15',
    };
    
    const result = ciclosInputSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe('Odús Input Schema', () => {
  it('should accept valid odús input', () => {
    const validData = {
      nome: 'Ewuará',
    };
    
    const result = odusInputSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe('Insight Diário Input Schema', () => {
  it('should accept insight with userId', () => {
    const validData = {
      userId: 'cm2abc123',
    };
    
    const result = insightDiarioInputSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should accept insight without userId (optional)', () => {
    const validData = {};
    
    const result = insightDiarioInputSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject invalid userId format', () => {
    const invalidData = {
      userId: 'invalid-id',
    };
    
    const result = insightDiarioInputSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('Response Helpers', () => {
  it('should create success response with default status', async () => {
    const response = successResponse({ message: 'ok' });
    expect(response).toBeInstanceOf(Response);
    
    const body = await response.json();
    expect(body).toMatchObject({
      success: true,
      data: { message: 'ok' },
    });
  });

  it('should create success response with custom status', () => {
    const response = successResponse({ id: '123' }, 201);
    expect(response).toBeInstanceOf(Response);
  });

  it('should create validation error response', async () => {
    const errors = [
      { path: ['email'], message: 'Email inválido', code: 'invalid_format' },
      { path: ['senha'], message: 'Senha muito curta', code: 'too_small' },
    ];
    
    const response = validationErrorResponse(errors);
    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(400);
    
    const body = await response.json();
    expect(body.success).toBe(false);
    // errors are at the top level of the response
    expect(body.errors).toBeDefined();
    expect(Array.isArray(body.errors)).toBe(true);
  });
});