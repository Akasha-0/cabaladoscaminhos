// ============================================================
// SPIRITUAL FILTER PARSER - CABALA DOS CAMINHOS
// ============================================================
// Shared searchParams parser for the "spiritual filter" clone
// group used by:
//
//   - dashboard/ai-models   (fieldName: "tipo")
//   - dashboard/data-sources (fieldName: "tipo")
//   - guidance/types        (fieldName: "type")
//   - healing/types         (fieldName: "type")
//   - materials             (fieldName: "type")
//
// All five endpoints share the same 5 searchParams filter fields
// (the type/tipo discriminator + sefirot/chakra/element/orixa).
// The discriminator enum values are unified into a single Zod
// schema covering every known type across the five routes.
// ============================================================
import { z } from 'zod';
import { NextResponse } from 'next/server';

// ------------------------------------------------------------
// Common spiritual filter field schemas (shared by all callers)
// ------------------------------------------------------------

const SefirotSchema = z.enum([
  'Kether',
  'Chokhmah',
  'Binah',
  'Chesed',
  'Gevurah',
  'Tipheret',
  'Netzach',
  'Hod',
  'Yesod',
  'Malkuth',
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

/**
 * Union of every `tipo`/`type` enum value used by the five
 * spiritual-filter endpoints. Each endpoint narrows this further
 * at the call site, but a value from any endpoint is accepted
 * by the parser so it can act as a shared, permissive gate.
 */
const SpiritualTypeSchema = z.enum([
  // ai-models
  'chat',
  'completion',
  'embedding',
  'vision',
  'speech',
  'oracle',
  'divination',
  // data-sources
  'api',
  'database',
  'file',
  'stream',
  'cache',
  'orixa',
  'astrology',
  'numerology',
  // guidance/types
  'tarot',
  'cabala',
  'ifa',
  'chakras',
  'meditation',
  'ritual',
  // healing/types
  'mental',
  'physical',
  'spiritual',
  'karmic',
  'emotional',
  'ancestral',
  // materials
  'elemental',
  'essence',
  'crystal',
  'herb',
  'symbolic',
  'offering',
]);

// Re-exported for callers that want to keep using these named
// schemas in body validation / other route sections.
export { SefirotSchema, ChakraSchema, ElementSchema, SpiritualTypeSchema };

// ------------------------------------------------------------
// Public API
// ------------------------------------------------------------

/** Discriminator field name used by the five cloned endpoints. */
export type SpiritualFilterFieldName = 'tipo' | 'type';

/** Parsed data shape returned on success. */
export interface SpiritualFilterData {
  /** Value of the discriminator (key is "tipo" or "type" in the
   *  parsed object — we expose the original key too). */
  tipo?: string;
  type?: string;
  sefirot?: string;
  chakra?: number;
  element?: string;
  orixa?: string;
}

/** Tagged result returned by parseSpiritualFilters. */
export type ParseSpiritualFiltersResult =
  | { ok: true; data: SpiritualFilterData }
  | { ok: false; response: NextResponse };

/**
 * Builds a Zod object schema for a given discriminator field.
 * Keeps the keys aligned with `searchParams.get(...)` lookups.
 */
function buildSpiritualFilterSchema(fieldName: SpiritualFilterFieldName) {
  return z.object({
    [fieldName]: SpiritualTypeSchema.optional(),
    sefirot: SefirotSchema.optional(),
    chakra: ChakraSchema.optional(),
    element: ElementSchema.optional(),
    orixa: z.string().optional(),
  });
}

/**
 * Parses the spiritual-filter searchParams shared by the five
 * dashboard/guidance/healing/materials endpoints.
 *
 * Usage:
 *   const parsed = parseSpiritualFilters(searchParams, "tipo");
 *   if (!parsed.ok) return parsed.response;
 *   const { tipo, sefirot, chakra, element, orixa } = parsed.data;
 *
 * On failure the returned `response` is a ready-to-return 400
 * NextResponse with the standard { success, error, details } shape.
 */
export function parseSpiritualFilters(
  searchParams: URLSearchParams,
  fieldName: SpiritualFilterFieldName
): ParseSpiritualFiltersResult {
  const schema = buildSpiritualFilterSchema(fieldName);

  const result = schema.safeParse({
    [fieldName]: searchParams.get(fieldName),
    sefirot: searchParams.get('sefirot'),
    chakra: searchParams.get('chakra'),
    element: searchParams.get('element'),
    orixa: searchParams.get('orixa'),
  });

  if (!result.success) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          success: false,
          error: 'Parâmetros inválidos',
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      ),
    };
  }

  return { ok: true, data: result.data as SpiritualFilterData };
}
