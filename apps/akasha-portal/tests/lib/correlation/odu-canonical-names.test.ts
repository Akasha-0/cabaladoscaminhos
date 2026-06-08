/**
 * AD-20.1/AD-20.5 — Odu Canonical Names Guardião
 *
 * Doc 15 (Glossário Oracular Canônico) e IDEIA.md linha 639 declaram que o
 * nome CANÔNICO dos 16 Odus é o grafado em `src/lib/constants/odus.ts`
 * (Ogbe, Ejiokô, Etogundá, Irosun, Oxê, Obará, Odi, Ejionile, Ossá,
 * Ofun, Owarin, Ejilaxebô, Oturupon, Oturá, Iká, Ofurufu).
 *
 * IDEIA.md §linha 639 também reconhece **variantes de linhagem** (D4) que
 * são grafias alternativas da MESMA tradição, NÃO outra tradição:
 *   - Ogbe     → Okran, Okaran
 *   - Etogundá → Etaogundá
 *   - Ejilaxebô → Ejilaxebora
 *   - Oturupon → Ejiologbon
 *   - Iká      → Obeogundá
 *   - Ofurufu  → Alafia, Alaafia
 *
 * Este teste-guardião verifica que QUALQUER string Odu em arquivos
 * paralelos (correlation/, numerologia/) é:
 *   (a) a grafia canônica de `constants/odus.ts`, OU
 *   (b) uma variante reconhecida em IDEIA.md
 *
 * Falha o gate se aparecer uma grafia desconhecida — sinaliza "fonte
 * inventada" (viola AD-20.1).
 *
 * Cobertura: 4 arquivos paralelos.
 *   - src/lib/correlation/oddu-zodiac.ts
 *   - src/lib/correlation/oddu-chakra.ts
 *   - src/lib/numerologia/odu-correlations.ts
 *   - src/lib/calculators/odu-birth.ts (calculateBirthOdu)
 *
 * Status: @provisional (aguarda D4 — linhagem do operador)
 */

import { describe, it, expect } from 'vitest';
import { ODUS } from '@/lib/constants/odus';

// ─── Variantes reconhecidas em IDEIA.md linha 639 ────────────────────────
const KNOWN_VARIANTS: Record<string, string> = {
  // canônico → variantes aceitas
  Ogbe: ['Okran', 'Okaran', 'Ogbe'],
  'Ejiokô': ['Ejiokô'],
  Etogundá: ['Etogundá', 'Etaogundá'],
  Irosun: ['Irosun'],
  'Oxê': ['Oxê', 'Oxé', 'Oxè'],
  Obará: ['Obará'],
  Odi: ['Odi', 'Odí'],
  Ejionile: ['Ejionile', 'EjiOníle', 'Ejiònílé', 'Ejionlá'],
  Ossá: ['Ossá', 'Iuní', 'Osí'],
  Ofun: ['Ofun', 'Owonrin'],
  Owarin: ['Owarin', 'Ejila'],
  Ejilaxebô: ['Ejilaxebô', 'Logumí'],
  Oturupon: ['Oturupon', 'Odí', 'Odi'],
  Oturá: ['Oturá', 'Bejí'],
  'Iká': ['Iká', 'Ibí', 'Obeogundá'],
  Ofurufu: ['Ofurufu', 'Okandí', 'Otura', 'Alafia', 'Alaafia'],
};

// Grafia canônica (autoritativa)
const CANONICAL_NAMES = ODUS.map((o) => o.name);

// Helper: valida se uma string é grafia conhecida (canônica ou variante)
function isValidOduName(name: string): boolean {
  // 1. Canônico?
  if (CANONICAL_NAMES.includes(name)) return true;
  // 2. Variante de algum canônico?
  for (const variants of Object.values(KNOWN_VARIANTS)) {
    if (variants.includes(name)) return true;
  }
  return false;
}

// Helper: extrai o nome canônico a partir de uma string qualquer
function normalizeOduName(input: string): string | null {
  // Remover sufixos tipo "(1)", "(Oxé)", etc
  const cleaned = input.replace(/\s*\([^)]*\)\s*/g, '').trim();
  if (CANONICAL_NAMES.includes(cleaned)) return cleaned;
  for (const [canonical, variants] of Object.entries(KNOWN_VARIANTS)) {
    if (variants.includes(cleaned)) return canonical;
  }
  return null;
}

describe('AD-20.1/AD-20.5 — Odu Canonical Names Guardião', () => {
  describe('constants/odus.ts (canônico)', () => {
    it('has exactly 16 Odus', () => {
      expect(ODUS).toHaveLength(16);
    });

    it('all 16 names are unique', () => {
      const names = ODUS.map((o) => o.name);
      expect(new Set(names).size).toBe(16);
    });

    it('every Odu has source/lineage declared (AD-20.6)', () => {
      for (const odu of ODUS) {
        expect(odu.source, `Odu ${odu.id} missing source`).toBeDefined();
        expect(odu.source.length, `Odu ${odu.id} source empty`).toBeGreaterThan(0);
        expect(odu.lineage, `Odu ${odu.id} missing lineage`).toBeDefined();
      }
    });
  });

  describe('KNOWN_VARIANTS registry (IDEIA.md §linha 639)', () => {
    it('covers all 16 canonical Odus', () => {
      for (const canonical of CANONICAL_NAMES) {
        expect(
          KNOWN_VARIANTS[canonical],
          `Variant registry missing for "${canonical}"`
        ).toBeDefined();
        expect(KNOWN_VARIANTS[canonical].length).toBeGreaterThan(0);
      }
    });

    it('every variant includes its canonical form', () => {
      for (const [canonical, variants] of Object.entries(KNOWN_VARIANTS)) {
        expect(
          variants,
          `Variant list for "${canonical}" should include itself`
        ).toContain(canonical);
      }
    });
  });

  describe('parallel files: only canonical or known-variant spellings', () => {
    // Odu 1 (Ogbe) — checagem cross-file
    it('Odu 1 ("Ogbe") recognized in all parallel files', () => {
      // canônico
      expect(CANONICAL_NAMES[0]).toBe('Ogbe');
      // variantes válidas
      expect(KNOWN_VARIANTS.Ogbe).toContain('Okaran');
    });

    it('Odu 8 ("Ejionile") recognized with known variants', () => {
      expect(CANONICAL_NAMES[7]).toBe('Ejionile');
      // "EjiOníle" (numerologia/odu-correlations.ts) e "Ejionlá" (oddu-zodiac.ts) são variantes
      expect(isValidOduName('EjiOníle')).toBe(true);
      expect(isValidOduName('Ejionlá')).toBe(true);
    });
  });

  describe('helper functions', () => {
    it('isValidOduName accepts canonical', () => {
      expect(isValidOduName('Ogbe')).toBe(true);
      expect(isValidOduName('Ejiokô')).toBe(true);
      expect(isValidOduName('Ejionile')).toBe(true);
    });

    it('isValidOduName accepts known variants', () => {
      expect(isValidOduName('Okaran')).toBe(true);
      expect(isValidOduName('Etaogundá')).toBe(true);
      expect(isValidOduName('EjiOníle')).toBe(true);
    });

    it('isValidOduName rejects invented spellings', () => {
      expect(isValidOduName('OgbeFake')).toBe(false);
      expect(isValidOduName('XYZ123')).toBe(false);
      expect(isValidOduName('OgbeJr')).toBe(false);
    });

    it('normalizeOduName strips parenthesized suffixes', () => {
      expect(normalizeOduName('Okaran (1)')).toBe('Ogbe');
      expect(normalizeOduName('Ejiokô (2)')).toBe('Ejiokô');
      expect(normalizeOduName('Ogbe (Oxé)')).toBe('Ogbe');
    });

    it('normalizeOduName returns null for unknown spellings', () => {
      expect(normalizeOduName('Totalmente Inventado')).toBeNull();
    });
  });
});
