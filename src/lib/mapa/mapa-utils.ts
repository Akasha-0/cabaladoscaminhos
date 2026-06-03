import { z } from 'zod';

/**
 * Shared Zod schema for MapaAlma input validation.
 * Used across all /api/mapa routes.
 */
const mapaSchema = z.object({
  nomeCompleto: z.string().min(2).max(200),
  dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hora: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  pais: z.string().optional(),
});

export type MapaInput = z.infer<typeof mapaSchema>;

/**
 * Shared body parser for mapa routes.
 * Parses and validates the request body against mapaSchema.
 * Returns the parsed data or a NextResponse error tuple.
 */
export async function parseMapaBody(request: Request): Promise<
  | { data: MapaInput; error: null }
  | { data: null; error: { status: number; body: object } }
> {
  const body = await request.json() as unknown;
  const parsed = mapaSchema.safeParse(body);

  if (!parsed.success) {
    return {
      data: null,
      error: {
        status: 400,
        body: { error: 'Dados inválidos', details: parsed.error.flatten() },
      },
    };
  }

  return { data: parsed.data as MapaInput, error: null };
}
