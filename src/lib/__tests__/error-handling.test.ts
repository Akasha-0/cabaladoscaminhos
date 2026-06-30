/**
 * Testes do error-handling.ts — AppError + ErrorCode + handleApiError
 *
 * Cobertura mínima:
 * - ErrorCode enum (amostra representativa, todas as categorias)
 * - AppError constructor + toJSON + default statusCode por code range
 * - Factory `errors.*` retorna AppError com code + status corretos
 * - handleApiError: AppError vs unknown error (dev vs prod)
 * - withErrorHandler: wrap handler, converte erro em JSON Response
 *
 * Foco em regressão: mudanças em `getDefaultStatusCode` ou nos códigos
 * devem quebrar estes testes.
 */
import { describe, it, expect } from "vitest";
import {
  AppError,
  ErrorCode,
  errors,
  handleApiError,
  withErrorHandler,
} from "../error-handling";

describe("ErrorCode enum", () => {
  it("cobre as 7 categorias principais", () => {
    // Amostra: auth, validation, resource, rate-limit, system, credits, payment
    expect(ErrorCode.AUTH_INVALID_CREDENTIALS).toBe(1001);
    expect(ErrorCode.VALIDATION_ERROR).toBe(2001);
    expect(ErrorCode.RESOURCE_NOT_FOUND).toBe(3001);
    expect(ErrorCode.RATE_LIMIT_EXCEEDED).toBe(4001);
    expect(ErrorCode.INTERNAL_ERROR).toBe(5001);
    expect(ErrorCode.INSUFFICIENT_CREDITS).toBe(6001);
    expect(ErrorCode.PAYMENT_FAILED).toBe(7001);
  });

  it("codes são únicos (sem colisão entre categorias)", () => {
    const values = Object.values(ErrorCode).filter((v) => typeof v === "number");
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });
});

describe("AppError constructor", () => {
  it("preserva code, message, statusCode explícito e details", () => {
    const e = new AppError({
      code: ErrorCode.AUTH_FORBIDDEN,
      message: "Acesso proibido",
      statusCode: 403,
      details: { role: "viewer" },
    });
    expect(e.code).toBe(ErrorCode.AUTH_FORBIDDEN);
    expect(e.message).toBe("Acesso proibido");
    expect(e.statusCode).toBe(403);
    expect(e.details).toEqual({ role: "viewer" });
    expect(e.isOperational).toBe(true);
    expect(e).toBeInstanceOf(Error);
    expect(e).toBeInstanceOf(AppError);
  });

  it("atribui statusCode default baseado no range do code", () => {
    const cases: Array<[ErrorCode, number]> = [
      [ErrorCode.AUTH_INVALID_CREDENTIALS, 401],
      [ErrorCode.AUTH_FORBIDDEN, 403],
      [ErrorCode.VALIDATION_ERROR, 400],
      [ErrorCode.RESOURCE_NOT_FOUND, 404],
      [ErrorCode.RESOURCE_ALREADY_EXISTS, 409],
      [ErrorCode.RATE_LIMIT_EXCEEDED, 429],
      [ErrorCode.SERVICE_UNAVAILABLE, 503],
      [ErrorCode.INTERNAL_ERROR, 500],
      [ErrorCode.INSUFFICIENT_CREDITS, 402],
      [ErrorCode.PAYMENT_FAILED, 402],
    ];
    for (const [code, expected] of cases) {
      const e = new AppError({ code, message: "x" });
      expect(e.statusCode, `code ${code} → statusCode`).toBe(expected);
    }
  });

  it("preserva cause (Error chaining)", () => {
    const cause = new Error("DB connection lost");
    const e = new AppError({
      code: ErrorCode.DATABASE_ERROR,
      message: "DB down",
      cause,
    });
    expect(e.cause).toBe(cause);
  });
});

describe("AppError.toJSON()", () => {
  it("inclui code e message em qualquer ambiente", () => {
    const e = new AppError({ code: ErrorCode.AUTH_FORBIDDEN, message: "x" });
    const json = e.toJSON() as { error: { code: number; message: string; details?: unknown; stack?: string } };
    expect(json.error.code).toBe(ErrorCode.AUTH_FORBIDDEN);
    expect(json.error.message).toBe("x");
  });

  it("omite details e stack em produção", () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    try {
      const e = new AppError({
        code: ErrorCode.VALIDATION_ERROR,
        message: "x",
        details: { field: "email" },
      });
      const json = e.toJSON() as { error: Record<string, unknown> };
      expect(json.error).not.toHaveProperty("details");
      expect(json.error).not.toHaveProperty("stack");
    } finally {
      process.env.NODE_ENV = prev;
    }
  });

  it("inclui details e stack em development", () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    try {
      const e = new AppError({
        code: ErrorCode.VALIDATION_ERROR,
        message: "x",
        details: { field: "email" },
      });
      const json = e.toJSON() as { error: Record<string, unknown> };
      expect(json.error.details).toEqual({ field: "email" });
      expect(json.error.stack).toBeDefined();
    } finally {
      process.env.NODE_ENV = prev;
    }
  });
});

describe("errors factory", () => {
  it("errors.auth.* retorna codes da categoria 1xxx", () => {
    expect(errors.auth.invalidCredentials().code).toBe(ErrorCode.AUTH_INVALID_CREDENTIALS);
    expect(errors.auth.tokenExpired().code).toBe(ErrorCode.AUTH_TOKEN_EXPIRED);
    expect(errors.auth.unauthorized().statusCode).toBe(401);
    expect(errors.auth.forbidden().statusCode).toBe(403);
  });

  it("errors.validation.* inclui field no details", () => {
    const e = errors.validation.missingField("email");
    expect(e.code).toBe(ErrorCode.VALIDATION_MISSING_FIELD);
    expect(e.statusCode).toBe(400);
    expect(e.details).toMatchObject({ field: "email" });
  });

  it("errors.resource.notFound inclui resource e id no details", () => {
    const e = errors.resource.notFound("Group", "grp_123");
    expect(e.code).toBe(ErrorCode.RESOURCE_NOT_FOUND);
    expect(e.statusCode).toBe(404);
    expect(e.details).toMatchObject({ resource: "Group", id: "grp_123" });
  });

  it("errors.credits.insufficient inclui required/available", () => {
    const e = errors.credits.insufficient(10, 3);
    expect(e.code).toBe(ErrorCode.INSUFFICIENT_CREDITS);
    expect(e.statusCode).toBe(402);
    expect(e.details).toMatchObject({ required: 10, available: 3 });
  });

  it("errors.rateLimit.exceeded inclui retryAfter", () => {
    const e = errors.rateLimit.exceeded(60);
    expect(e.code).toBe(ErrorCode.RATE_LIMIT_EXCEEDED);
    expect(e.statusCode).toBe(429);
    expect(e.details).toMatchObject({ retryAfter: 60 });
  });
});

describe("handleApiError", () => {
  it("AppError → status + body do próprio erro", () => {
    const e = errors.resource.notFound("Post", "p1");
    const result = handleApiError(e);
    expect(result.status).toBe(404);
    const body = result.body as { error: { code: number; message: string } };
    expect(body.error.code).toBe(ErrorCode.RESOURCE_NOT_FOUND);
    expect(body.error.message).toContain("Post");
  });

  it("unknown error em prod → 500 com INTERNAL_ERROR genérico", () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    try {
      const result = handleApiError(new Error("boom"));
      expect(result.status).toBe(500);
      const body = result.body as { error: { code: number; message: string; stack?: string } };
      expect(body.error.code).toBe(ErrorCode.INTERNAL_ERROR);
      expect(body.error.message).toBe("Erro interno do servidor");
      expect(body.error).not.toHaveProperty("stack");
    } finally {
      process.env.NODE_ENV = prev;
    }
  });

  it("unknown error em dev → inclui stack no body", () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    try {
      const result = handleApiError(new Error("boom"));
      const body = result.body as { error: { stack?: string } };
      expect(body.error.stack).toBeDefined();
      expect(body.error.stack).toContain("boom");
    } finally {
      process.env.NODE_ENV = prev;
    }
  });
});

describe("withErrorHandler", () => {
  it("passa o response adiante quando handler resolve", async () => {
    const handler = async () =>
      new Response(JSON.stringify({ ok: true }), { status: 200 });
    const wrapped = withErrorHandler(handler);
    const res = await wrapped();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("converte AppError lançado em JSON Response com status correto", async () => {
    const handler = async () => {
      throw errors.validation.missingField("email");
    };
    const wrapped = withErrorHandler(handler);
    const res = await wrapped();
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: { code: number; message: string } };
    expect(body.error.code).toBe(ErrorCode.VALIDATION_MISSING_FIELD);
  });

  it("converte unknown error em 500 + INTERNAL_ERROR", async () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    try {
      const handler = async () => {
        throw new Error("kaboom");
      };
      const wrapped = withErrorHandler(handler);
      const res = await wrapped();
      expect(res.status).toBe(500);
      const body = (await res.json()) as { error: { code: number } };
      expect(body.error.code).toBe(ErrorCode.INTERNAL_ERROR);
    } finally {
      process.env.NODE_ENV = prev;
    }
  });
});
