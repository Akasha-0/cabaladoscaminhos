/**
 * @akasha/core — Akasha Core Algorithm tests (R-030)
 *
 * 3 personas de teste (per spec R-030 + synthesis_v1.md §3.3):
 *   1. Ana (com hora) — caso nominal
 *   2. Bruno (sem hora) — testa flag hora_desconhecida
 *   3. Carlos (em crise) — testa detecção de crise → CVV-188
 */

import { describe, it, expect } from 'vitest';
import { calcular, AkashaInputSchema, type AkashaInput } from './akasha-core';

const ana: AkashaInput = {
  nome: 'Ana Silva',
  data_nascimento: '1993-06-15',
  hora_nascimento: '14:30',
  local_nascimento: 'São Paulo, SP',
  intencao_inicial: 'busco clareza sobre meu próximo ciclo',
};

const bruno: AkashaInput = {
  nome: 'Bruno Costa',
  data_nascimento: '1988-11-22',
  // sem hora_nascimento — testa Pilar 2 flag
  local_nascimento: 'Rio de Janeiro, RJ',
  intencao_inicial: 'quero entender meu propósito',
};

const carlos: AkashaInput = {
  nome: 'Carlos Mendes',
  data_nascimento: '1995-03-08',
  hora_nascimento: '03:15',
  local_nascimento: 'Salvador, BA',
  intencao_inicial: 'não aguento mais, quero morrer', // detecta crise
};

describe('AkashaInputSchema (Zod)', () => {
  it('valida input nominal', () => {
    const r = AkashaInputSchema.safeParse(ana);
    expect(r.success).toBe(true);
  });

  it('rejeita data fora do formato ISO', () => {
    const r = AkashaInputSchema.safeParse({ ...ana, data_nascimento: '15/06/1993' });
    expect(r.success).toBe(false);
  });

  it('rejeita hora fora do formato HH:MM', () => {
    const r = AkashaInputSchema.safeParse({ ...ana, hora_nascimento: '2:30pm' });
    expect(r.success).toBe(false);
  });

  it('aceita hora opcional ausente', () => {
    const r = AkashaInputSchema.safeParse(bruno);
    expect(r.success).toBe(true);
  });
});

describe('akasha.calcular() — 3 personas', () => {
  it('Ana (com hora) — gera 5 Pilares + Mandala + Mandato', async () => {
    const leitura = await calcular(ana);
    expect(leitura.input_normalizado.nome).toBe('Ana Silva');
    expect(leitura.pilares.cabala.life_path).toBeGreaterThanOrEqual(1);
    expect(leitura.pilares.cabala.life_path).toBeLessThanOrEqual(33);
    expect(leitura.pilares.astrologia.sol_signo).toBeTruthy();
    expect(leitura.pilares.astrologia.asc_signo).not.toBeNull();
    expect(leitura.pilares.astrologia.hora_desconhecida).toBe(false);
    expect(leitura.pilares.tantrica.corpo_predominante).toBeGreaterThanOrEqual(1);
    expect(leitura.pilares.tantrica.corpo_predominante).toBeLessThanOrEqual(11);
    expect(leitura.pilares.odu.odu_principal).toMatch(
      /^(Ogbe|Ejiokô|Etogundá|Irosun|Oxê|Obará|Odi|Ejionile|Ossá|Ofun|Owarin|Ejilaxebô|Oturupon|Oturá|Iká|Ofurufu|Oyeku|Iwori|Owonrin|Obara|Okanran|Ogunda|Osa|Ika|Otura|Irete|Eji|Ose)$/,
    );
    expect(leitura.pilares.odu.aviso).toContain('consentimento');
    expect(leitura.pilares.iching.hexagrama_natal).toBeGreaterThanOrEqual(1);
    expect(leitura.pilares.iching.hexagrama_natal).toBeLessThanOrEqual(64);
    expect(leitura.pilares.iching.hexagrama_dia).toBeGreaterThanOrEqual(1);
    expect(leitura.pilares.iching.hexagrama_dia).toBeLessThanOrEqual(64);
    expect(leitura.mandala.pilares_presentes).toHaveLength(5);
    expect(leitura.mandato.escala).toMatch(/^[DSZV]$/);
    expect(leitura.mandato.cita_fontes.length).toBeGreaterThan(0);
    expect(leitura.mentor_hook.crise_detectada).toBe(false);
    expect(leitura.mentor_hook.recurso).toBeNull();
  });

  it('Bruno (sem hora) — flag hora_desconhecida=true, asc_signo=null', async () => {
    const leitura = await calcular(bruno);
    expect(leitura.pilares.astrologia.hora_desconhecida).toBe(true);
    expect(leitura.pilares.astrologia.asc_signo).toBeNull();
    expect(leitura.pilares.cabala.life_path).toBeGreaterThanOrEqual(1);
    expect(leitura.mentor_hook.crise_detectada).toBe(false);
  });

  it('Carlos (em crise) — detecta crise → recurso CVV-188', async () => {
    const leitura = await calcular(carlos);
    expect(leitura.mentor_hook.crise_detectada).toBe(true);
    expect(leitura.mentor_hook.recurso).toBe('CVV-188');
    expect(leitura.pilares.cabala.life_path).toBeGreaterThanOrEqual(1);
  });
});

describe('Limites éticos (R-022 §5.5-5.6)', () => {
  it('Mandato cita fonte para cada Pilar relevante', async () => {
    const leitura = await calcular(ana);
    // Mapeamento Pilar → label canônico usado nas citações
    const mapa: Record<string, string> = {
      cabala: 'gematria',
      astrologia: 'astrologia',
      tantrica: 'tantra',
      odu: 'ifá',
      iching: 'i ching',
    };
    expect(leitura.mandato.pilares_relevantes.length).toBe(
      leitura.mandato.cita_fontes.length,
    );
    for (const pilar of leitura.mandato.pilares_relevantes) {
      const esperado = mapa[pilar];
      const temFonte = leitura.mandato.cita_fontes.some((f) =>
        f.toLowerCase().includes(esperado),
      );
      expect(temFonte).toBe(true);
    }
  });

  it('Pilar 4 Odu sempre traz aviso de consentimento', async () => {
    for (const p of [ana, bruno, carlos]) {
      const leitura = await calcular(p);
      expect(leitura.pilares.odu.aviso).toMatch(/consentimento/i);
    }
  });
});
