// ============================================================
// ONBOARDING SCHEMAS — Cabala dos Caminhos
// ============================================================
// Zod schemas para o Onboarding Espiritual de 5 passos.
//
// Estes schemas validam:
//   1. Nome completo (mín. 3 chars, obrigatório)
//   2. Data de nascimento (ISO yyyy-mm-dd, não futuro)
//   3. Hora de nascimento (HH:MM, opcional)
//   4. Local (cidade + estado + país, obrigatório)
//   5. Tradições de interesse (mín. 1, máx. 5)
//
// O `SpiritualProfileSchema` agrega os 5 passos num único payload
// usado pelo POST /api/onboarding e pelo mapa-generator.
// ============================================================

import { z } from 'zod';

// ============================================================
// CONSTANTES — Tradições suportadas
// ============================================================
export const TRADITIONS = [
  'Cabala',
  'Ifá',
  'Astrologia',
  'Tantra',
  'Reiki',
  'Meditação',
  'Xamanismo',
  'Cristianismo Místico',
  'Sufismo',
  'Taoismo',
  'Umbanda',
  'Candomblé',
  'Budismo',
  'Hinduismo',
] as const;

export const TraditionEnum = z.enum(TRADITIONS);
export type Tradition = z.infer<typeof TraditionEnum>;

export const MIN_TRADITIONS = 1;
export const MAX_TRADITIONS = 5;

// ============================================================
// SCHEMAS POR PASSO
// ============================================================

// Passo 1 — Nome completo
export const StepNomeSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, 'Nome precisa ter pelo menos 3 caracteres')
    .max(120, 'Nome muito longo (máx. 120 caracteres)')
    .regex(/^[\p{L}\s'.-]+$/u, 'Nome contém caracteres inválidos'),
});

// Passo 2 — Data de nascimento (ISO yyyy-mm-dd)
export const StepDataNascimentoSchema = z.object({
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato yyyy-mm-dd')
    .refine((value) => {
      const d = new Date(`${value}T00:00:00`);
      return !Number.isNaN(d.getTime());
    }, 'Data inválida')
    .refine((value) => {
      const d = new Date(`${value}T00:00:00`);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return d.getTime() <= today.getTime();
    }, 'Data de nascimento não pode estar no futuro'),
});

// Passo 3 — Hora de nascimento (opcional, HH:MM)
export const StepHoraNascimentoSchema = z.object({
  birthTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Hora deve estar no formato HH:MM')
    .optional()
    .or(z.literal('')),
});

// Passo 4 — Local (cidade + estado + país)
export const StepLocalSchema = z.object({
  birthCity: z
    .string()
    .trim()
    .min(2, 'Cidade deve ter pelo menos 2 caracteres')
    .max(120, 'Cidade muito longa'),
  birthState: z
    .string()
    .trim()
    .min(2, 'Estado deve ter pelo menos 2 caracteres')
    .max(60, 'Estado muito longo'),
  birthCountry: z
    .string()
    .trim()
    .min(2, 'País deve ter pelo menos 2 caracteres')
    .max(60, 'País muito longo')
    .default('Brasil'),
});

// Passo 5 — Tradições (mín. 1, máx. 5)
export const StepTradicoesSchema = z.object({
  traditions: z
    .array(TraditionEnum)
    .min(MIN_TRADITIONS, `Escolha pelo menos ${MIN_TRADITIONS} tradição`)
    .max(MAX_TRADITIONS, `Escolha no máximo ${MAX_TRADITIONS} tradições`)
    .refine(
      (arr) => new Set(arr).size === arr.length,
      'Tradições duplicadas não são permitidas'
    ),
});

// ============================================================
// SCHEMA AGREGADO — SpiritualProfile completo
// ============================================================
export const SpiritualProfileSchema = StepNomeSchema
  .merge(StepDataNascimentoSchema)
  .merge(StepHoraNascimentoSchema)
  .merge(StepLocalSchema)
  .merge(StepTradicoesSchema);

export type SpiritualProfileInput = z.infer<typeof SpiritualProfileSchema>;

// ============================================================
// HELPERS DE VALIDAÇÃO POR PASSO
// ============================================================
export type StepKey = 'fullName' | 'birthDate' | 'birthTime' | 'local' | 'traditions';

export const STEP_SCHEMAS: Record<
  Exclude<StepKey, 'birthTime'>,
  z.ZodTypeAny
> = {
  fullName: StepNomeSchema,
  birthDate: StepDataNascimentoSchema,
  local: StepLocalSchema,
  traditions: StepTradicoesSchema,
};

/**
 * Valida um passo individual. Retorna `{ ok, errors }`.
 */
export function validateStep(
  step: StepKey,
  values: Record<string, unknown>
): { ok: boolean; errors: Record<string, string> } {
  if (step === 'birthTime') {
    const parsed = StepHoraNascimentoSchema.safeParse(values);
    return parsed.success
      ? { ok: true, errors: {} }
      : { ok: false, errors: flattenFieldErrors(parsed.error) };
  }

  const schema = STEP_SCHEMAS[step];
  const parsed = schema.safeParse(values);
  return parsed.success
    ? { ok: true, errors: {} }
    : { ok: false, errors: flattenFieldErrors(parsed.error) };
}

function flattenFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.') || '_root';
    if (!(path in out)) out[path] = issue.message;
  }
  return out;
}

// ============================================================
// FORM-STATE TYPE — usado pelo componente React
// ============================================================
export type OnboardingFormState = {
  fullName: string;
  birthDate: string;
  birthTime: string;
  birthCity: string;
  birthState: string;
  birthCountry: string;
  traditions: Tradition[];
};

export const INITIAL_FORM_STATE: OnboardingFormState = {
  fullName: '',
  birthDate: '',
  birthTime: '',
  birthCity: '',
  birthState: '',
  birthCountry: 'Brasil',
  traditions: [],
};
