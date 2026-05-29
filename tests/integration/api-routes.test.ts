/**
 * API Routes Integration Tests
 * 
 * Testa endpoints da API com validação Zod e error handling.
 */

import { describe, it, expect } from 'vitest';
import { AppError, ErrorCode, errors, handleApiError, withErrorHandler } from '@/lib/error-handling';
import {
  safeParse,
  registroSchema,
  loginSchema,
  numerologiaInputSchema,
  mapaNatalInputSchema,
  chatMensagemSchema,
  creditosInputSchema,
} from '@/lib/validators';

describe('API Validators', () => {
  describe('Registro Schema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        email: 'usuario@exemplo.com',
        password: 'Senha123!',
        nomeCompleto: 'Maria da Luz',
        dataNascimento: '1990-06-15',
      };

      const result = safeParse(registroSchema, validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'email-invalido',
        password: 'Senha123!',
        nomeCompleto: 'Maria da Luz',
        dataNascimento: '1990-06-15',
      };

      const result = safeParse(registroSchema, invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject weak password', () => {
      const invalidData = {
        email: 'usuario@exemplo.com',
        password: '123',
        nomeCompleto: 'Maria da Luz',
        dataNascimento: '1990-06-15',
      };

      const result = safeParse(registroSchema, invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept future dates for calculations', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const validData = {
        email: 'usuario@exemplo.com',
        password: 'Senha123!',
        nomeCompleto: 'Maria da Luz',
        dataNascimento: futureDate.toISOString().split('T')[0],
      };

      const result = safeParse(registroSchema, validData);
      expect(result.success).toBe(true);
    });

    it('should accept optional horaNascimento', () => {
      const validData = {
        email: 'usuario@exemplo.com',
        password: 'Senha123!',
        nomeCompleto: 'Maria da Luz',
        dataNascimento: '1990-06-15',
        horaNascimento: '14:30',
      };

      const result = safeParse(registroSchema, validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Login Schema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'usuario@exemplo.com',
        password: 'minhasenha',
      };

      const result = safeParse(loginSchema, validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'usuario@exemplo.com',
        password: '',
      };

      const result = safeParse(loginSchema, invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Numerologia Schema', () => {
    it('should validate numerology input', () => {
      const validData = {
        nomeCompleto: 'João Carlos Silva',
        dataNascimento: '1985-03-22',
      };

      const result = safeParse(numerologiaInputSchema, validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Chat Mensagem Schema', () => {
    it('should validate correct message', () => {
      const validData = {
        conteudo: 'Olá, como posso calcular meu número cabalístico?',
      };

      const result = safeParse(chatMensagemSchema, validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty message', () => {
      const invalidData = {
        conteudo: '',
      };

      const result = safeParse(chatMensagemSchema, invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Créditos Schema', () => {
    it('should validate positive quantity', () => {
      const validData = {
        quantidade: 100,
        operacao: 'adicionar' as const,
        descricao: 'Compra de créditos',
      };

      const result = safeParse(creditosInputSchema, validData);
      expect(result.success).toBe(true);
    });

    it('should reject negative quantity', () => {
      const invalidData = {
        quantidade: -10,
        operacao: 'adicionar' as const,
      };

      const result = safeParse(creditosInputSchema, invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject quantity exceeding maximum', () => {
      const invalidData = {
        quantidade: 15000,
        operacao: 'adicionar' as const,
      };

      const result = safeParse(creditosInputSchema, invalidData);
      expect(result.success).toBe(false);
    });
  });
});

describe('Error Handling', () => {
  describe('AppError', () => {
    it('should create error with all properties', () => {
      const error = new AppError({
        code: ErrorCode.AUTH_INVALID_CREDENTIALS,
        message: 'Credenciais incorretas',
        statusCode: 401,
        details: { email: 'test@example.com' },
      });

      expect(error.code).toBe(ErrorCode.AUTH_INVALID_CREDENTIALS);
      expect(error.message).toBe('Credenciais incorretas');
      expect(error.statusCode).toBe(401);
      expect(error.isOperational).toBe(true);
    });

    it('should serialize to JSON correctly', () => {
      const error = new AppError({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Campo inválido',
      });

      const json = error.toJSON();
      expect(json.error.code).toBe(ErrorCode.VALIDATION_ERROR);
    });

    it('should handle cause chain', () => {
      const cause = new Error('Original error');
      const error = new AppError({
        code: ErrorCode.DATABASE_ERROR,
        message: 'Database error',
        cause,
      });

      expect(error.cause).toBe(cause);
    });
  });

  describe('Error Factory Functions', () => {
    it('should create auth.invalidCredentials', () => {
      const error = errors.auth.invalidCredentials();
      expect(error.code).toBe(ErrorCode.AUTH_INVALID_CREDENTIALS);
      expect(error.statusCode).toBe(401);
    });

    it('should create validation.missingField with field info', () => {
      const error = errors.validation.missingField('email');
      expect(error.code).toBe(ErrorCode.VALIDATION_MISSING_FIELD);
      expect(error.details?.field).toBe('email');
    });

    it('should create rateLimit.exceeded with retry info', () => {
      const error = errors.rateLimit.exceeded(60);
      expect(error.code).toBe(ErrorCode.RATE_LIMIT_EXCEEDED);
      expect(error.statusCode).toBe(429);
      expect(error.details?.retryAfter).toBe(60);
    });

    it('should create credits.insufficient with amounts', () => {
      const error = errors.credits.insufficient(100, 50);
      expect(error.code).toBe(ErrorCode.INSUFFICIENT_CREDITS);
      expect(error.statusCode).toBe(402);
      expect(error.details?.required).toBe(100);
      expect(error.details?.available).toBe(50);
    });

    it('should create resource.notFound with context', () => {
      const error = errors.resource.notFound('MapaNatal', 'user-123');
      expect(error.code).toBe(ErrorCode.RESOURCE_NOT_FOUND);
      expect(error.statusCode).toBe(404);
      expect(error.details?.resource).toBe('MapaNatal');
      expect(error.details?.id).toBe('user-123');
    });
  });

  describe('handleApiError', () => {
    it('should handle AppError', () => {
      const error = errors.auth.unauthorized();
      const result = handleApiError(error);
      expect(result.status).toBe(401);
      expect(result.body.error.code).toBe(ErrorCode.AUTH_UNAUTHORIZED);
    });
    it('should handle generic Error', () => {
      const genericError = new Error('Something went wrong');
      const result = handleApiError(genericError);
      expect(result.status).toBe(500);
      expect(result.body.error.code).toBe(ErrorCode.INTERNAL_ERROR);
    });
  });
  describe('Error Code Mapping', () => {
    it.each([
      [ErrorCode.AUTH_INVALID_CREDENTIALS, 401],
      [ErrorCode.AUTH_TOKEN_EXPIRED, 401],
      [ErrorCode.AUTH_TOKEN_INVALID, 401],
      [ErrorCode.AUTH_USER_NOT_FOUND, 401],
      [ErrorCode.AUTH_UNAUTHORIZED, 401],
      [ErrorCode.AUTH_FORBIDDEN, 403],
      [ErrorCode.VALIDATION_ERROR, 400],
      [ErrorCode.VALIDATION_MISSING_FIELD, 400],
      [ErrorCode.RESOURCE_NOT_FOUND, 404],
      [ErrorCode.RESOURCE_ALREADY_EXISTS, 409],
      [ErrorCode.RATE_LIMIT_EXCEEDED, 429],
      [ErrorCode.INTERNAL_ERROR, 500],
      [ErrorCode.DATABASE_ERROR, 500],
      [ErrorCode.SERVICE_UNAVAILABLE, 503],
      [ErrorCode.INSUFFICIENT_CREDITS, 402],
      [ErrorCode.PAYMENT_FAILED, 402],
    ])('should map error code %s to status %s', (code, expectedStatus) => {
      const error = new AppError({
        code,
        message: 'Test error',
      });
      expect(error.statusCode).toBe(expectedStatus);
    });
  });
});

describe('withErrorHandler', () => {
  it('should pass through successful response', async () => {
    const handler = async () => {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    const wrapped = withErrorHandler(handler);
    const response = await wrapped();

    expect(response.status).toBe(200);
  });

  it('should catch and format errors', async () => {
    const handler = async () => {
      throw errors.auth.unauthorized();
    };

    const wrapped = withErrorHandler(handler);
    const response = await wrapped() as Response;

    expect(response.status).toBe(401);
  });

  it('should handle async errors', async () => {
    const handler = async () => {
      await Promise.resolve();
      throw errors.validation.missingField('email');
    };

    const wrapped = withErrorHandler(handler);
    const response = await wrapped() as Response;

    expect(response.status).toBe(400);
  });
});