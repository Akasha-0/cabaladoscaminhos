/**
 * Zod schemas for /api/akasha/tratamento/* endpoints.
 */
import { z } from 'zod';

export const tratamentoRequestSchema = z.object({
  zeladorId: z.string().cuid(),
  caminhadaId: z.string().cuid(),
  consulenteNome: z.string().min(1),
  dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  horaNascimento: z.string().regex(/^\d{2}:\d{2}$/),
  localNascimento: z.string().min(1),
  respostasPerguntas: z
    .array(
      z.object({
        pergunta_id: z.string(),
        resposta: z.string(),
      })
    )
    .optional(),
  opcoes: z
    .object({
      maxFrases: z.number().min(1).max(10).default(5),
    })
    .optional(),
});

export type TratamentoRequest = z.infer<typeof tratamentoRequestSchema>;
