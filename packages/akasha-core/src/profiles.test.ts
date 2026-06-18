/**
 * @akasha/core — D-043 (10 perfis representativos)
 *
 * Para cada perfil em profiles-fixtures.ts:
 *  1. Zod aceita input
 *  2. calcular() retorna shape válido (5 Pilares + Mandala + Mandato + mentor_hook)
 *  3. Determinismo: 2 chamadas com mesmo input → mesmo life_path etc
 *  4. Cada Pilar cita fonte (R-022 §5.5)
 *  5. Pilar 4 Odu sempre traz aviso de consentimento (ethics_charter §3)
 *  6. Cisão explícita: nenhum perfil normal dispara CVV
 *  7. PERFIL_CRISIS dispara CVV-188 (separado dos 10)
 *
 * Estes testes validam o **contrato** do R-030 antes da Fase 6
 * integrar engines reais.
 */
import { describe, it, expect } from 'vitest';
import { calcular, AkashaInputSchema } from './akasha-core';
import { PERFIS, PERFIL_BY_ID, PERFIL_CRISIS } from './profiles-fixtures';

const FONTES_VALIDAS = [
  'Pilar 1, Gematria (Sefer Yetzirah)',
  'Pilar 2, Astrologia (Whole Sign, Brennan 2017)',
  'Pilar 3, Tantra (tradição hindu, 11 corpos)',
  'Pilar 4, Ifá (axé/terreiro, 16 Odu)',
  'Pilar 5, I Ching (Wilhelm/Baynes 1950)',
];

describe('D-043 — AkashaInputSchema aceita os 10 perfis', () => {
  for (const perfil of PERFIS) {
    it(`PERFIL[${perfil.id}] — Zod safeParse = success`, () => {
      const r = AkashaInputSchema.safeParse(perfil.input);
      expect(r.success).toBe(true);
    });
  }
});

describe('D-043 — calcular() retorna shape completo para 10 perfis', () => {
  for (const perfil of PERFIS) {
    it(`PERFIL[${perfil.id}] — vetor: ${perfil.vetor_validado}`, async () => {
      const leitura = await calcular(perfil.input);

      // 5 Pilares presentes
      expect(leitura.pilares.cabala).toBeDefined();
      expect(leitura.pilares.astrologia).toBeDefined();
      expect(leitura.pilares.tantrica).toBeDefined();
      expect(leitura.pilares.odu).toBeDefined();
      expect(leitura.pilares.iching).toBeDefined();

      // Mandala: 5 pilares presentes
      expect(leitura.mandala.pilares_presentes).toHaveLength(5);
      expect(leitura.mandala.pilares_ausentes).toHaveLength(0);

      // Mandato: estrutura
      expect(['D', 'S', 'Z', 'V']).toContain(leitura.mandato.escala);
      expect(leitura.mandato.pilares_relevantes.length).toBeGreaterThan(0);
      expect(leitura.mandato.cita_fontes.length).toBeGreaterThan(0);
      expect(leitura.mandato.redacao_bruta).toMatch(/\[(D|S|Z|V)\]/);

      // mentor_hook: NÃO-crise (10 perfis normais)
      expect(leitura.mentor_hook.crise_detectada).toBe(false);
      expect(leitura.mentor_hook.recurso).toBeNull();
    });
  }
});

describe('D-043 — Determinismo (mesmo input → mesmo output)', () => {
  for (const perfil of PERFIS) {
    it(`PERFIL[${perfil.id}] — calcular() × 2 é idempotente em Pilares fixos`, async () => {
      const a = await calcular(perfil.input);
      const b = await calcular(perfil.input);

      // Pilares determinísticos (não dependem de "hoje")
      expect(a.pilares.cabala).toEqual(b.pilares.cabala);
      expect(a.pilares.tantrica).toEqual(b.pilares.tantrica);
      expect(a.pilares.odu).toEqual(b.pilares.odu);
      expect(a.pilares.astrologia.sol_signo).toBe(b.pilares.astrologia.sol_signo);
      expect(a.pilares.astrologia.lua_signo).toBe(b.pilares.astrologia.lua_signo);
    });
  }
});

describe('D-043 — Vetores específicos por perfil', () => {
  it('Bruno (sem hora) — flag hora_desconhecida=true, asc_signo=null', async () => {
    const l = await calcular(PERFIL_BY_ID.bruno.input);
    expect(l.pilares.astrologia.hora_desconhecida).toBe(true);
    expect(l.pilares.astrologia.asc_signo).toBeNull();
  });

  it('Ana (com hora) — flag hora_desconhecida=false, asc_signo presente', async () => {
    const l = await calcular(PERFIL_BY_ID.ana.input);
    expect(l.pilares.astrologia.hora_desconhecida).toBe(false);
    expect(l.pilares.astrologia.asc_signo).not.toBeNull();
  });

  it('Júlia (identidade trans) — "trans" NÃO dispara CVV', async () => {
    const l = await calcular(PERFIL_BY_ID.julia.input);
    expect(l.mentor_hook.crise_detectada).toBe(false);
    expect(l.mentor_hook.recurso).toBeNull();
  });

  it('Eduardo ("perdido e confuso") — NÃO dispara CVV (palavra "perdido")', async () => {
    const l = await calcular(PERFIL_BY_ID.eduardo.input);
    expect(l.mentor_hook.crise_detectada).toBe(false);
  });

  it('Helena (multi-tradição) — cita fonte para CADA Pilar no Mandato', async () => {
    const l = await calcular(PERFIL_BY_ID.helena.input);
    for (const fonte of l.mandato.cita_fontes) {
      expect(FONTES_VALIDAS).toContain(fonte);
    }
  });

  it('Igor (datas alinhadas) — life_path e ano_pessoal em range [1-9, 11, 22, 33]', async () => {
    const l = await calcular(PERFIL_BY_ID.igor.input);
    const valido = (n: number) => (n >= 1 && n <= 9) || n === 11 || n === 22 || n === 33;
    expect(valido(l.pilares.cabala.life_path)).toBe(true);
    expect(valido(l.pilares.cabala.birthday)).toBe(true);
    expect(valido(l.pilares.cabala.expression)).toBe(true);
    expect(valido(l.pilares.cabala.ano_pessoal)).toBe(true);
  });

  it('Gabriel (first-toucher, "só meu signo") — retorna sol_signo', async () => {
    const l = await calcular(PERFIL_BY_ID.gabriel.input);
    // signos são nomes PT-BR simples
    expect(typeof l.pilares.astrologia.sol_signo).toBe('string');
    expect(l.pilares.astrologia.sol_signo.length).toBeGreaterThan(3);
  });
});

describe('D-043 — Pilar 4 (Odu) sempre traz aviso ético (ethics_charter §3)', () => {
  for (const perfil of PERFIS) {
    it(`PERFIL[${perfil.id}] — Odu.aviso contém "consentimento"`, async () => {
      const l = await calcular(perfil.input);
      expect(l.pilares.odu.aviso).toMatch(/consentimento/);
      expect(['Ifá', 'Candomblé']).toContain(l.pilares.odu.fonte);
    });
  }
});

describe('D-043 — Cisão explícita: 10 perfis normais ≠ perfil de crise', () => {
  it('todos os 10 perfis têm mentor_hook.crise_detectada=false', async () => {
    for (const perfil of PERFIS) {
      const l = await calcular(perfil.input);
      expect(l.mentor_hook.crise_detectada).toBe(false);
    }
  });

  it('PERFIL_CRISIS tem mentor_hook.crise_detectada=true, recurso=CVV-188', async () => {
    const l = await calcular(PERFIL_CRISIS.input);
    expect(l.mentor_hook.crise_detectada).toBe(true);
    expect(l.mentor_hook.recurso).toBe('CVV-188');
  });
});

describe('D-043 — Contrato da interface PilarIChing (1-64)', () => {
  for (const perfil of PERFIS) {
    it(`PERFIL[${perfil.id}] — hexagrama em [1, 64]`, async () => {
      const l = await calcular(perfil.input);
      expect(l.pilares.iching.hexagrama_natal).toBeGreaterThanOrEqual(1);
      expect(l.pilares.iching.hexagrama_natal).toBeLessThanOrEqual(64);
      expect(l.pilares.iching.hexagrama_dia).toBeGreaterThanOrEqual(1);
      expect(l.pilares.iching.hexagrama_dia).toBeLessThanOrEqual(64);
      expect(['shadow', 'gift', 'siddhi']).toContain(l.pilares.iching.level);
    });
  }
});

describe('D-043 — Contrato da interface PilarTantrica (1-11)', () => {
  for (const perfil of PERFIS) {
    it(`PERFIL[${perfil.id}] — corpo_predominante em [1, 11], trigemeo válido`, async () => {
      const l = await calcular(perfil.input);
      expect(l.pilares.tantrica.corpo_predominante).toBeGreaterThanOrEqual(1);
      expect(l.pilares.tantrica.corpo_predominante).toBeLessThanOrEqual(11);
      expect(['fisico', 'astral', 'mental']).toContain(l.pilares.tantrica.trigemeo);
    });
  }
});
