/**
 * Validators Module
 * @module validators
 */
import { z } from 'zod'
import { NextResponse } from 'next/server'

export const dataNascimentoSchema = z.union([
  z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Formato DD/MM/YYYY'),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD'),
])

export const nomeCompletoSchema = z
  .string()
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome não pode conter números')

export const emailSchema = z.string().email('Email inválido')
export const senhaSchema = z
  .string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Deve conter letra maiúscula')
  .regex(/[0-9]/, 'Deve conter número')

export const registroSchema = z.object({
  email: emailSchema,
  password: z.string(),
  nomeCompleto: nomeCompletoSchema,
  dataNascimento: dataNascimentoSchema,
})

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
})

export const numerologiaInputSchema = z.object({
  nomeCompleto: nomeCompletoSchema,
  dataNascimento: dataNascimentoSchema,
})

export const mapaNatalInputSchema = z.object({
  nome: nomeCompletoSchema,
  dataNascimento: dataNascimentoSchema,
  horaNascimento: z.string().optional(),
  localNascimento: z.string().optional(),
})

export function safeParse<T>(schema: z.ZodType<T>, data: unknown) {
  return schema.safeParse(data)
}

export function successResponse(data: unknown) {
  return NextResponse.json({ success: true, ...(typeof data === 'object' && data !== null ? data : { data }) })
}

export function validationErrorResponse(errors: unknown) {
  return NextResponse.json({ success: false, errors }, { status: 400 })
}
