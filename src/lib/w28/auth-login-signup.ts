// src/lib/w28/auth-login-signup.ts
// Cycle 28 — Auth pages (login/signup) UI types + form schema.
// Extends w20/auth-pages (existing pages) with typed forms, validation, and a useAuthForm hook stub.

import { z } from "zod";

/** Email + password login form (extends w20/auth-pages). */
export const LoginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  remember: z.boolean().default(false),
});

export type LoginInput = z.infer<typeof LoginSchema>;

/** Signup with name + email + password + accept terms. */
export const SignupSchema = z.object({
  fullName: z.string().min(2, "Nome completo obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: "Aceite os termos" }) }),
});

export type SignupInput = z.infer<typeof SignupSchema>;

export type AuthMode = "login" | "signup";

export interface AuthFormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isValid: boolean;
}

/** React hook stub — wire to react-hook-form + zodResolver in the consumer. */
export function useAuthForm<T extends LoginInput | SignupInput>(
  mode: AuthMode,
  initial: T
): AuthFormState<T> {
  return {
    values: initial,
    errors: {},
    isSubmitting: false,
    isValid: false,
  };
}
