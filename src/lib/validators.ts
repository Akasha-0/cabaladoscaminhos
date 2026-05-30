// ============================================================
// API VALIDATORS - CABALA DOS CAMINHOS
// ============================================================
// Type-safe API validators using Zod
// ============================================================

import { z } from "zod";

// ============================================================
// USER VALIDATORS
// ============================================================

// Data schema that allows future dates (for calculations) and accepts multiple formats
export const dataNascimentoSchema = z.string().refine(
  (val) => {
    const formats = [
      { regex: /^(\d{4})-(\d{2})-(\d{2})$/, parse: (m) => new Date(+m[1], +m[2] - 1, +m[3]) },
      { regex: /^(\d{2})\/(\d{2})\/(\d{4})$/, parse: (m) => new Date(+m[3], +m[2] - 1, +m[1]) },
      { regex: /^(\d{2})-(\d{2})-(\d{4})$/, parse: (m) => new Date(+m[3], +m[2] - 1, +m[1]) },
      { regex: /^(\d{4})\/(\d{2})\/(\d{2})$/, parse: (m) => new Date(+m[1], +m[2] - 1, +m[3]) },
    ];
    for (const fmt of formats) {
      const m = val.match(fmt.regex);
      if (m) {
        const date = fmt.parse(m);
        return !isNaN(date.getTime());
      }
    }
    const date = new Date(val);
    return !isNaN(date.getTime());
  },
  { message: "Data de nascimento inválida" }
);

export const nomeCompletoSchema = z
  .string()
  .min(2, "Nome deve ter pelo menos 2 caracteres")
  .max(200, "Nome deve ter no máximo 200 caracteres")
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Nome contém caracteres inválidos");

export const emailSchema = z.string().email("Email inválido");

export const senhaSchema = z
  .string()
  .min(8, "Senha deve ter pelo menos 8 caracteres")
  .max(100, "Senha deve ter no máximo 100 caracteres")
  .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
  .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
  .regex(/[0-9]/, "Senha deve conter pelo menos um número");

export const horaNascimentoSchema = z
  .string()
  .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Hora deve estar no formato HH:MM")
  .optional();

export const localNascimentoSchema = z
  .string()
  .min(2, "Local deve ter pelo menos 2 caracteres")
  .max(200, "Local deve ter no máximo 200 caracteres")
  .optional();

// Registration
export const registroSchema = z.object({
  email: emailSchema,
  password: senhaSchema,
  nomeCompleto: nomeCompletoSchema,
  dataNascimento: dataNascimentoSchema,
  horaNascimento: horaNascimentoSchema,
  localNascimento: localNascimentoSchema,
});

export type RegistroInput = z.infer<typeof registroSchema>;

// Login
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Senha é obrigatória"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ============================================================
// NUMEROLOGY VALIDATORS
// ============================================================

export const numerologiaInputSchema = z.object({
  nomeCompleto: nomeCompletoSchema,
  dataNascimento: dataNascimentoSchema,
});

export type NumerologiaInput = z.infer<typeof numerologiaInputSchema>;

// ============================================================
// ASTROLOGY VALIDATORS
// ============================================================

export const mapaNatalInputSchema = z.object({
  dataNascimento: dataNascimentoSchema,
  horaNascimento: horaNascimentoSchema,
  localNascimento: localNascimentoSchema,
});

export type MapaNatalInput = z.infer<typeof mapaNatalInputSchema>;

export const transitosInputSchema = z.object({
  dataAtual: dataNascimentoSchema.optional(),
});

export type TransitosInput = z.infer<typeof transitosInputSchema>;

// ============================================================
// CHAT VALIDATORS
// ============================================================

export const chatMensagemSchema = z.object({
  conteudo: z
    .string()
    .min(1, "Mensagem não pode estar vazia")
    .max(4000, "Mensagem deve ter no máximo 4000 caracteres"),
  tipo: z.enum(["usuario", "sistema"]).default("usuario"),
});

export type ChatMensagemInput = z.infer<typeof chatMensagemSchema>;

// ============================================================
// CYCLES VALIDATORS
// ============================================================

export const ciclosInputSchema = z.object({
  dataNascimento: dataNascimentoSchema,
});

export type CiclosInput = z.infer<typeof ciclosInputSchema>;

// ============================================================
// CREDITS VALIDATORS
// ============================================================

export const creditosInputSchema = z.object({
  quantidade: z.number().int().positive("Quantidade deve ser positiva").max(10000, "Máximo de 10000"),
  operacao: z.enum(["adicionar", "debitar"]),
  descricao: z.string().max(500).optional(),
});

export type CreditosInput = z.infer<typeof creditosInputSchema>;

// ============================================================
// ODÚS VALIDATORS
// ============================================================

export const odusInputSchema = z.object({
  dataNascimento: dataNascimentoSchema.optional(),
  nomeCompleto: nomeCompletoSchema.optional(),
});

export type OdusInput = z.infer<typeof odusInputSchema>;

// ============================================================
// INSIGHTS VALIDATORS
// ============================================================

export const insightDiarioInputSchema = z.object({
  userId: z.string().cuid("ID de usuário inválido").optional(),
});

export type InsightDiarioInput = z.infer<typeof insightDiarioInputSchema>;

// ============================================================
// UTILITY TYPES
// ============================================================

export interface ValidationResult<T> {
  success: true;
  data: T;
}

export interface ValidationError {
  success: false;
  errors: Array<{
    path: string[];
    message: string;
    code: string;
  }>;
}

export type SafeParseResult<T> = ValidationResult<T> | ValidationError;

export function safeParse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): SafeParseResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: result.error.errors.map((err) => ({
      path: err.path.map(String),
      message: err.message,
      code: err.code,
    })),
  };
}

// ============================================================
// API RESPONSE HELPERS
// ============================================================

export function successResponse<T>(data: T, status = 200) {
  return Response.json({ success: true, data }, { status });
}

export function validationErrorResponse(errors: ValidationError["errors"]) {
  return Response.json(
    { success: false, error: { code: "VALIDATION_ERROR" }, errors },
    { status: 400 }
  );
}
