/**
 * @akasha/portal — diario/types unit tests
 *
 * Tests the exported constants and types from diario/types.ts.
 */
import { describe, it, expect } from 'vitest';
import {
  C,
  PILLAR_LABELS,
  PILLAR_COLORS,
  PILLAR_ORDER,
  ESCALA_LABELS,
} from '@/components/akasha/diario/types';
import type {
  MandatoEsqueleto,
  MentorHook,
  PilaresDoMandato,
  DailyRitualUI,
  CycleModulationAlignment,
} from '@/components/akasha/diario/types';
import type { Pilar } from '@/lib/grimoire/significados-curados';

// ─── Constants ────────────────────────────────────────────────────────────────

describe('diario/types — C (color palette)', () => {
  it('contains all required spiritual anchor colors', () => {
    expect(C.violeta).toBe('#7C5CFF');
    expect(C.aurora).toBe('#2DD4BF');
    expect(C.dourado).toBe('#F0B429');
    expect(C.magenta).toBe('#FB5781');
  });

  it('contains all required background depth colors', () => {
    expect(C.bgVoid).toBe('#06070F');
    expect(C.bgDeep).toBe('#0B0E1C');
    expect(C.bgNeb).toBe('#141A33');
  });

  it('contains all required text color tiers', () => {
    expect(C.txtPri).toBe('#F4F5FF');
    expect(C.txtSec).toBe('#A7AECF');
    expect(C.txtMut).toBe('#5C6691');
  });

  it('each color value is a valid 6-digit hex string', () => {
    const hexValues = [C.violeta, C.aurora, C.dourado, C.magenta, C.bgVoid, C.bgDeep, C.bgNeb, C.txtPri, C.txtSec, C.txtMut];
    for (const hex of hexValues) {
      expect(hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe('diario/types — PILLAR_LABELS', () => {
  it('covers all 5 pillars with correct names', () => {
    expect(PILLAR_LABELS.cabala).toMatchObject({ nome: 'Numerologia Cabalística' });
    expect(PILLAR_LABELS.astrologia).toMatchObject({ nome: 'Astrologia' });
    expect(PILLAR_LABELS.tantrica).toMatchObject({ nome: 'Numerologia Tântrica' });
    expect(PILLAR_LABELS.odu).toMatchObject({ nome: 'Odu de Nascimento' });
    expect(PILLAR_LABELS.iching).toMatchObject({ nome: 'I Ching' });
  });

  it('each pillar has a valid hex color', () => {
    for (const key of Object.keys(PILLAR_LABELS)) {
      const entry = PILLAR_LABELS[key as keyof typeof PILLAR_LABELS];
      expect(entry.cor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe('diario/types — PILLAR_COLORS', () => {
  const pillars: Pilar[] = ['cabala', 'astrologia', 'tantrica', 'odu', 'iching'];

  it('has exactly 5 entries', () => {
    expect(Object.keys(PILLAR_COLORS)).toHaveLength(5);
  });

  it('every PILLAR_ORDER entry has a color entry', () => {
    for (const pilar of pillars) {
      expect(PILLAR_COLORS[pilar]).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  // Edge case: empty key (should not exist)
  it('does not contain an empty-string key', () => {
    expect(PILLAR_COLORS['' as unknown as Pilar]).toBeUndefined();
  });
});

describe('diario/types — PILLAR_ORDER', () => {
  it('contains exactly 5 pillars in the correct sequence', () => {
    expect(PILLAR_ORDER).toEqual(['cabala', 'astrologia', 'tantrica', 'odu', 'iching']);
  });

  it('matches the keys of PILLAR_COLORS', () => {
    expect(PILLAR_ORDER).toEqual(Object.keys(PILLAR_COLORS));
  });
});

describe('diario/types — ESCALA_LABELS', () => {
  it('maps all 4 escala keys', () => {
    expect(ESCALA_LABELS).toHaveProperty('D', 'Mandato do Dia');
    expect(ESCALA_LABELS).toHaveProperty('S', 'Escala Semanal');
    expect(ESCALA_LABELS).toHaveProperty('Z', 'Sazonal');
    expect(ESCALA_LABELS).toHaveProperty('V', 'Vida');
  });

  // Edge case: invalid scale key
  it('returns undefined for an unknown scale key', () => {
    expect(ESCALA_LABELS['X' as keyof typeof ESCALA_LABELS]).toBeUndefined();
  });
});

// ─── Type/Interface shapes ────────────────────────────────────────────────────

describe('diario/types — MandatoEsqueleto', () => {
  it('accepts a valid D-scale mandato skeleton', () => {
    const valid: MandatoEsqueleto = {
      escala: 'D',
      pilares_relevantes: ['cabala', 'astrologia'],
      redacao_bruta: 'Hoy foco en la integración.',
      cita_fontes: ['Gurdjieff', 'Bach'],
    };
    expect(valid.escala).toBe('D');
  });

  it('accepts all scale variants', () => {
    const scales: MandatoEsqueleto['escala'][] = ['D', 'S', 'Z', 'V'];
    for (const escala of scales) {
      const item: MandatoEsqueleto = { escala, pilares_relevantes: [], redacao_bruta: '', cita_fontes: [] };
      expect(item.escala).toBe(escala);
    }
  });
});

describe('diario/types — MentorHook', () => {
  it('constructs with all required fields', () => {
    const hook: MentorHook = {
      intencao: 'Integrar sombra',
      crise_detectada: true,
      recurso: 'Meditación OSHO',
    };
    expect(hook.crise_detectada).toBe(true);
  });

  // Edge case: null recurso
  it('accepts null recurso', () => {
    const hook: MentorHook = { intencao: 'Ser', crise_detectada: false, recurso: null };
    expect(hook.recurso).toBeNull();
  });
});

describe('diario/types — PilaresDoMandato', () => {
  it('constructs a complete PilaresDoMandato', () => {
    const pilares: PilaresDoMandato = {
      cabala: { life_path: 7, birthday: 14, expression: 3, ano_pessoal: 5 },
      astrologia: {
        sol_signo: 'Leo', asc_signo: null, lua_signo: 'Câncer',
        lua_fase: 'cheia', trinity: { sombra: 2, dom: 5, graca: 3 }, trinity_dominante: 'dom',
      },
      odu: { odu_principal: 'Ogbe', odu_secundario: 'Ox', fonte: 'Ifá', aviso: 'No corras.' },
      iching: { hexagrama_natal: 26, hexagrama_dia: 14, level: 'gift' },
    };
    expect(pilares.cabala.life_path).toBe(7);
    expect(pilares.astrologia.lua_fase).toBe('cheia');
    expect(pilares.iching.level).toBe('gift');
  });

  // Edge case: optional astro fields omitted
  it('accepts missing optional astrologia fields', () => {
    const minimal: PilaresDoMandato = {
      cabala: { life_path: 1, birthday: 1, expression: 1, ano_pessoal: 1 },
      astrologia: {
        sol_signo: 'Aries', asc_signo: null, lua_signo: 'Taurus',
        lua_fase: 'nova', trinity: { sombra: 1, dom: 1, graca: 1 }, trinity_dominante: 'sombra',
      },
      odu: { odu_principal: 'Oyeku', odu_secundario: null, fonte: 'Candomblé', aviso: '' },
      iching: { hexagrama_natal: 1, hexagrama_dia: 1, level: 'shadow' },
    };
    expect(minimal.astrologia.lilith_signo).toBeUndefined();
    expect(minimal.astrologia.casa_8_signo).toBeUndefined();
  });
});

describe('diario/types — DailyRitualUI', () => {
  it('accepts a fully populated ritual UI object', () => {
    const ritual: DailyRitualUI = {
      titulo: 'Ritual de Tierra',
      instrucao: 'Camina descalzo sobre grass.',
      elemento: 'Tierra',
      cor: '#F0B429',
    };
    expect(ritual.cor).toBe('#F0B429');
  });

  // Edge case: minimal required fields only
  it('requires only titulo and instrucao', () => {
    const minimal: DailyRitualUI = { titulo: 'Ritual', instrucao: 'Hazlo.' };
    expect(minimal.titulo).toBe('Ritual');
    expect(minimal.elemento).toBeUndefined();
    expect(minimal.cor).toBeUndefined();
  });
});

describe('diario/types — CycleModulationAlignment', () => {
  it('constructs with required fields', () => {
    const entry: CycleModulationAlignment = {
      area: 'finanças',
      alignmentScore: 0.87,
      suggestedBoost: 'Fazer um好祭祀.',
    };
    expect(entry.alignmentScore).toBeCloseTo(0.87);
  });

  // Edge case: optional rationale field
  it('accepts optional rationale', () => {
    const withRationale: CycleModulationAlignment = {
      area: 'saúde',
      alignmentScore: 0.5,
      suggestedBoost: 'Beber água.',
      rationale: 'Lua emPeixes favorece fluidos.',
    };
    expect(withRationale.rationale).toBe('Lua emPeixes favorece fluidos.');
  });

  it('alignmentScore can be zero', () => {
    const zeroScore: CycleModulationAlignment = {
      area: 'amor',
      alignmentScore: 0,
      suggestedBoost: 'Nada.',
    };
    expect(zeroScore.alignmentScore).toBe(0);
  });
});
