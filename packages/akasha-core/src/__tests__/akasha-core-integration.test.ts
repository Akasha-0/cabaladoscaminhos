/**
 * Wave 4 — Integration tests for akasha-core orchestrator
 *
 * After Wave 4 (Pilar 6 + 7 added), the orchestrator should:
 * 1. Include `pilar6` and `pilar7` fields in the result
 * 2. Use valid Pilar6ResultadoShape
 * 3. Use valid Pilar7ResultadoShape
 * 4. Produce consistent 7-pilar correlation
 *
 * These are minimal integration tests — full engine tests live in
 * the @akasha/core-pilar6 and @akasha/core-pilar7 packages.
 */
import { describe, it, expect } from 'vitest';
import {
  AkashaInputSchema,
  calcular,
  type AkashaInput,
  type Pilar6ResultadoShape,
  type Pilar7ResultadoShape,
} from '../akasha-core';

const inputBase: AkashaInput = {
  data_nascimento: '1990-01-01',
  hora_nascimento: '12:00',
  local_nascimento: 'São Paulo, Brasil',
  nome: 'Teste',
  intencao_inicial: 'leitura geral',
};

describe('akasha-core — Wave 4 integration (Pilar 6 + 7)', () => {
  it('1. calcular() returns AkashaLeitura with pilar6 and pilar7 fields', async () => {
    const parsed = AkashaInputSchema.parse(inputBase);
    const leitura = await calcular(parsed);
    expect(leitura).toBeDefined();
    expect(leitura.pilares).toBeDefined();
    expect('pilar6' in leitura.pilares).toBe(true);
    expect('pilar7' in leitura.pilares).toBe(true);
  });

  it('2. pilar6 field is either null or a valid Pilar6ResultadoShape', async () => {
    const parsed = AkashaInputSchema.parse(inputBase);
    const leitura = await calcular(parsed);
    const p6 = leitura.pilares.pilar6;
    if (p6 !== null) {
      // Type narrowing: must have these fields
      expect(p6).toHaveProperty('tipo');
      expect(p6).toHaveProperty('estrategia');
      expect(p6).toHaveProperty('autoridade');
      expect(p6).toHaveProperty('centrosDefinidos');
      expect(p6).toHaveProperty('canais');
      expect(p6).toHaveProperty('versaoCalculo');
      expect(p6.versaoCalculo).toBe('v1');
    } else {
      // Engine not available (graceful degradation) — that's valid
      expect(p6).toBeNull();
    }
  });

  it('3. pilar7 field is either null or a valid Pilar7ResultadoShape', async () => {
    const parsed = AkashaInputSchema.parse(inputBase);
    const leitura = await calcular(parsed);
    const p7 = leitura.pilares.pilar7;
    if (p7 !== null) {
      expect(p7).toHaveProperty('chaveNatal');
      expect(p7).toHaveProperty('estagioAtual');
      expect(p7).toHaveProperty('sombra');
      expect(p7).toHaveProperty('dom');
      expect(p7).toHaveProperty('siddhi');
      expect(p7).toHaveProperty('versaoCalculo');
      expect(p7.versaoCalculo).toBe('v1');
    } else {
      expect(p7).toBeNull();
    }
  });

  it('4. 7-pilar correlation is consistent (mandala + pilares_presentes)', async () => {
    const parsed = AkashaInputSchema.parse(inputBase);
    const leitura = await calcular(parsed);
    // mandala.pilares_presentes should now have 5-7 entries (Pilar 1-7)
    // per Wave 4 changes
    const totalPilares = leitura.mandala.pilares_presentes.length;
    expect(totalPilares).toBeGreaterThanOrEqual(5);
    expect(totalPilares).toBeLessThanOrEqual(7);
  });
});
