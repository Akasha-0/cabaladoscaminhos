/**
 * Schemas Zod compartilhados para Auth + Onboarding
 * ----------------------------------------------------------------------------
 * Use estes schemas em:
 *   - Formulários client (`react-hook-form`, controlled inputs, ou onSubmit)
 *   - Server Actions (`src/app/actions/auth.ts`)
 *   - Route Handlers (`src/app/api/*`)
 *
 * Manter validação espelhada client/server garante que o que o usuário vê
 * bater com o que o backend aceita.
 */

import { z } from 'zod';

// ============================================================================
// AUTH — login / signup
// ============================================================================

export const emailField = z
  .string()
  .trim()
  .min(1, 'Email obrigatório')
  .email('Email inválido');

export const passwordField = z
  .string()
  .min(8, 'Mínimo de 8 caracteres')
  .max(128, 'Máximo de 128 caracteres');

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Senha obrigatória'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Nome muito curto')
      .max(80, 'Nome muito longo'),
    email: emailField,
    password: passwordField,
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'Você deve aceitar os termos' }),
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });
export type SignupInput = z.infer<typeof signupSchema>;

// ============================================================================
// ONBOARDING — 5 passos do mapa espiritual
// ============================================================================

export const TRADITIONS = [
  'cabala',
  'ifa',
  'astrologia',
  'tantra',
  'xamanismo',
  'cristianismo-mistico',
  'umbanda',
  'budismo',
  'hinduismo',
  'sufismo',
] as const;

export type Tradition = (typeof TRADITIONS)[number];

export const onboardingStep1Schema = z.object({
  fullName: z.string().trim().min(2, 'Nome muito curto').max(80),
});
export type OnboardingStep1Input = z.infer<typeof onboardingStep1Schema>;

export const onboardingStep2Schema = z.object({
  traditions: z
    .array(z.enum(TRADITIONS))
    .min(1, 'Escolha pelo menos uma tradição')
    .max(6, 'Máximo 6 tradições'),
});
export type OnboardingStep2Input = z.infer<typeof onboardingStep2Schema>;

export const onboardingStep3Schema = z.object({
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
    .refine((v) => !Number.isNaN(Date.parse(v)), 'Data inválida'),
});
export type OnboardingStep3Input = z.infer<typeof onboardingStep3Schema>;

export const onboardingStep4Schema = z.object({
  birthTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Horário inválido (HH:MM)')
    .optional()
    .or(z.literal('')),
});
export type OnboardingStep4Input = z.infer<typeof onboardingStep4Schema>;

export const onboardingStep5Schema = z.object({
  birthPlace: z
    .string()
    .trim()
    .min(2, 'Local muito curto')
    .max(120, 'Local muito longo'),
  birthCountry: z.string().trim().min(2).max(60),
});
export type OnboardingStep5Input = z.infer<typeof onboardingStep5Schema>;

// Schema completo — usado na action que finaliza o onboarding
export const onboardingCompleteSchema = z.object({
  fullName: onboardingStep1Schema.shape.fullName,
  traditions: onboardingStep2Schema.shape.traditions,
  birthDate: onboardingStep3Schema.shape.birthDate,
  birthTime: onboardingStep4Schema.shape.birthTime,
  birthPlace: onboardingStep5Schema.shape.birthPlace,
  birthCountry: onboardingStep5Schema.shape.birthCountry,
});
export type OnboardingCompleteInput = z.infer<typeof onboardingCompleteSchema>;