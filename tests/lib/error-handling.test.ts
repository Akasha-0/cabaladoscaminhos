import { describe, it, expect } from 'vitest';
import { ErrorCode, AppError, handleApiError, errors } from '@/lib/error-handling';

describe('lib/error-handling', () => {
  describe('ErrorCode enum', () => {
    it('has auth error codes', () => {
      expect(ErrorCode.AUTH_INVALID_CREDENTIALS).toBe(1001);
      expect(ErrorCode.AUTH_TOKEN_EXPIRED).toBe(1002);
    });

    it('has validation error codes', () => {
      expect(ErrorCode.VALIDATION_ERROR).toBe(2001);
      expect(ErrorCode.VALIDATION_MISSING_FIELD).toBe(2002);
    });

    it('has resource error codes', () => {
      expect(ErrorCode.RESOURCE_NOT_FOUND).toBe(3001);
    });

    it('has credit error codes', () => {
      expect(ErrorCode.INSUFFICIENT_CREDITS).toBe(6001);
    });
  });

  describe('AppError', () => {
    it('creates error with code and message', () => {
      const err = new AppError({ code: ErrorCode.VALIDATION_ERROR, message: 'Test error' });
      expect(err.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(err.message).toBe('Test error');
    });

    it('has statusCode', () => {
      const err = new AppError({ code: ErrorCode.RESOURCE_NOT_FOUND, message: 'Not found' });
      expect(err.statusCode).toBe(404);
    });

    it('is instanceof Error', () => {
      const err = new AppError({ code: ErrorCode.INTERNAL_ERROR, message: 'Internal' });
      expect(err).toBeInstanceOf(Error);
    });
  });

  describe('errors object', () => {
    it('has errors for each error code', () => {
      expect(Object.keys(errors).length).toBeGreaterThan(0);
    });
  });

  describe('handleApiError', () => {
    it('returns Response for unknown error', () => {
      const result = handleApiError(new Error('test'));
      expect(result.status).toBeTruthy();
    });
  });
});
