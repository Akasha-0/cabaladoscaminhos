import { describe, it, expect } from 'vitest';
import {
  dataNascimentoSchema,
  nomeCompletoSchema,
  emailSchema,
  senhaSchema,
  registroSchema,
  loginSchema,
  numerologiaInputSchema,
  mapaNatalInputSchema,
  safeParse,
  successResponse,
  validationErrorResponse,
} from '@/lib/validators';

describe('lib/validators', () => {
  describe('dataNascimentoSchema', () => {
    it('accepts DD/MM/YYYY format', () => {
      expect(dataNascimentoSchema.safeParse('15/03/1990').success).toBe(true);
    });

    it('accepts YYYY-MM-DD format', () => {
      expect(dataNascimentoSchema.safeParse('1990-03-15').success).toBe(true);
    });

    it('rejects invalid date', () => {
      expect(dataNascimentoSchema.safeParse('invalid').success).toBe(false);
    });

    it('rejects empty string', () => {
      expect(dataNascimentoSchema.safeParse('').success).toBe(false);
    });
  });

  describe('nomeCompletoSchema', () => {
    it('accepts valid name', () => {
      expect(nomeCompletoSchema.safeParse('João Silva').success).toBe(true);
    });

    it('accepts name with accents', () => {
      expect(nomeCompletoSchema.safeParse('José Antônio').success).toBe(true);
    });

    it('rejects too short name', () => {
      expect(nomeCompletoSchema.safeParse('A').success).toBe(false);
    });

    it('rejects name with numbers', () => {
      expect(nomeCompletoSchema.safeParse('João123').success).toBe(false);
    });
  });

  describe('emailSchema', () => {
    it('accepts valid email', () => {
      expect(emailSchema.safeParse('user@example.com').success).toBe(true);
    });

    it('rejects invalid email', () => {
      expect(emailSchema.safeParse('notanemail').success).toBe(false);
    });
  });

  describe('senhaSchema', () => {
    it('accepts strong password', () => {
      expect(senhaSchema.safeParse('Password123').success).toBe(true);
    });

    it('rejects short password', () => {
      expect(senhaSchema.safeParse('Pass1').success).toBe(false);
    });

    it('rejects password without uppercase', () => {
      expect(senhaSchema.safeParse('password123').success).toBe(false);
    });

    it('rejects password without number', () => {
      expect(senhaSchema.safeParse('PasswordAAA').success).toBe(false);
    });
  });

  describe('registroSchema', () => {
    it('accepts valid registration data', () => {
      const result = registroSchema.safeParse({
        nome: 'João Silva',
        email: 'joao@example.com',
        senha: 'Password123',
        dataNascimento: '15/03/1990',
      });
      expect(result.success).toBe(true);
    });

    it('rejects registration with invalid email', () => {
      const result = registroSchema.safeParse({
        nome: 'João Silva',
        email: 'invalid',
        senha: 'Password123',
        dataNascimento: '15/03/1990',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('accepts valid login data', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        senha: 'Password123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects login without email', () => {
      const result = loginSchema.safeParse({
        senha: 'Password123',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('numerologiaInputSchema', () => {
    it('accepts valid numerology input', () => {
      const result = numerologiaInputSchema.safeParse({
        nome: 'Maria Silva',
        dataNascimento: '15/03/1990',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('mapaNatalInputSchema', () => {
    it('accepts valid birth chart input', () => {
      const result = mapaNatalInputSchema.safeParse({
        nome: 'Carlos Silva',
        dataNascimento: '15/03/1990',
        horaNascimento: '14:30',
        localNascimento: 'São Paulo',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('safeParse', () => {
    it('returns success for valid data', () => {
      const result = safeParse(nomeCompletoSchema, 'Ana Silva');
      expect(result.success).toBe(true);
    });

    it('returns errors for invalid data', () => {
      const result = safeParse(nomeCompletoSchema, 'A');
      expect(result.success).toBe(false);
    });
  });

  describe('successResponse', () => {
    it('returns Response with success JSON', () => {
      const res = successResponse({ message: 'ok' });
      expect(res).toBeInstanceOf(Response);
    });
  });

  describe('validationErrorResponse', () => {
    it('returns Response with error JSON', () => {
      const res = validationErrorResponse([]);
      expect(res).toBeInstanceOf(Response);
    });
  });
});
