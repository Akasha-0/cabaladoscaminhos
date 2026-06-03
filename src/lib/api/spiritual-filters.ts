// ============================================================
// SPIRITUAL FILTERS - CABALA DOS CAMINHOS
// ============================================================
// Shared Zod schemas for spiritual correlation filters used
// across all API routes: Sefirot, Chakra, Element.
// ============================================================
import { z } from 'zod';

// ─── Standard 10 Sefirot (without Daat) ─────────────────────────────
export const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
// ─── Chakra (1–7) ───────────────────────────────────────────────────
export const ChakraSchema = z.coerce.number().int().min(1).max(7);

// ─── Element (Western + Éter) ────────────────────────────────────────
export const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

// ─── Sefirot with Daat (Cabala routes) ───────────────────────────
// Daat is the hidden/knowledge sephirah — used by cabala/sefirot and divination/oracle
export const SefirotWithDaatSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Daat', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
// ─── Element with expanded forms (search route) ────────────────────
// Includes 'Terra' variant alongside 'Fogo/Água/Terra/Ar/Éter'
export const ElementExtendedSchema = z.enum(['Terra', 'Fogo', 'Água', 'Ar', 'Éter']);
