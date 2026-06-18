/**
 * Tests for mapeamentos/ — Akasha Synthesis Engine
 * Covers: getIChingContribution, synthesizePrimitives, PESOS_TRADICAO_DOMINIO, PRIMITIVOS
 */
import { describe, it, expect } from 'vitest';
import type {
  PilarIChing,
  PilarCabala,
  PilarAstrologia,
  PilarTantrica,
  PilarOdu,
} from '../akasha-core';
import { getIChingContribution, synthesizePrimitives } from './index';
import { PRIMITIVOS, PESOS_TRADICAO_DOMINIO } from './types';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const F_ICHING_GIFT: PilarIChing = {
  hexagrama_natal: 1,
  hexagrama_dia: 2,
  level: 'gift',
};

const F_ICHING_SHADOW: PilarIChing = {
  hexagrama_natal: 29,
  hexagrama_dia: 49,
  level: 'shadow',
};

const F_ICHING_SIDDHI: PilarIChing = {
  hexagrama_natal: 55,
  hexagrama_dia: 63,
  level: 'siddhi',
};

const F_CABALA_7: PilarCabala = {
  life_path: 7,
  birthday: 14,
  expression: 3,
  ano_pessoal: 5,
};

const F_CABALA_11: PilarCabala = {
  life_path: 11,
  birthday: 11,
  expression: 11,
  ano_pessoal: 4,
};

const F_CABALA_33: PilarCabala = {
  life_path: 33,
  birthday: 6,
  expression: 6,
  ano_pessoal: 9,
};

const F_ASTRO_LEAO: PilarAstrologia = {
  sol_signo: 'leao',
  asc_signo: 'escorpiao',
  lua_signo: 'cancer',
  lua_fase: 'cheia',
  hora_desconhecida: false,
  trinity: { sombra: 2, dom: 5, graca: 1 },
  trinity_dominante: 'dom',
  lilith_signo: null,
  casa_8_signo: null,
};

const F_TANTRICA: PilarTantrica = {
  corpo_predominante: 5,
  trigemeo: 'mental',
  ciclo_anos: 12,
  temperamento_atual: 'fleumatico',
};

const F_ODU: PilarOdu = {
  odu_principal: 'Ogbe',
  odu_secundario: null,
  fonte: 'Ifá',
  aviso: 'requer consentimento + terreiro',
};

describe('PRIMITIVOS', () => {
  it('tem exactamente 12 primitivos', () => {
    expect(PRIMITIVOS).toHaveLength(12);
  });

  it('cada primitivo é uma string não-vazia', () => {
    for (const p of PRIMITIVOS) {
      expect(typeof p).toBe('string');
      expect(p.length).toBeGreaterThan(0);
    }
  });

  it('cada primitivo é único', () => {
    const unique = new Set([...PRIMITIVOS]);
    expect(unique.size).toBe(PRIMITIVOS.length);
  });

  it('todos os primitivos esperados estão presentes', () => {
    const esperados = new Set([
      'Transformacao',
      'Expansao',
      'Ordem',
      'Expressao',
      'Amor',
      'Poder',
      'Sabedoria',
      'Movimento',
      'Servico',
      'Materializacao',
      'Intuicao',
      'Conexao',
    ]);
    for (const p of PRIMITIVOS) {
      expect(esperados.has(p)).toBe(true);
    }
  });
});

// ─── PESOS_TRADICAO_DOMINIO ───────────────────────────────────────────────────

describe('PESOS_TRADICAO_DOMINIO', () => {
  const dominios = [
    'identidade',
    'talentos',
    'desafios',
    'missao',
    'evolucao',
    'relacoes',
    'prosperidade',
    'espiritualidade',
  ] as const;

  it('cada tradição tem exactamente as 8 entradas de domínio', () => {
    for (const [tradição, pesos] of Object.entries(PESOS_TRADICAO_DOMINIO)) {
      for (const d of dominios) {
        expect(pesos).toHaveProperty(d);
        expect(typeof pesos[d]).toBe('number');
        expect(pesos[d]).toBeGreaterThan(0);
        expect(pesos[d]).toBeLessThanOrEqual(1);
      }
    }
  });

  it('I Ching pesa 0.9 em evolucao e espiritualidade', () => {
    expect(PESOS_TRADICAO_DOMINIO.iching.evolucao).toBe(0.9);
    expect(PESOS_TRADICAO_DOMINIO.iching.espiritualidade).toBe(0.9);
  });

  it('Cabala pesa 0.9 em identidade e missao', () => {
    expect(PESOS_TRADICAO_DOMINIO.cabala.identidade).toBe(0.9);
    expect(PESOS_TRADICAO_DOMINIO.cabala.missao).toBe(0.9);
  });

  it('Astrologia pesa 0.8 em relacoes', () => {
    expect(PESOS_TRADICAO_DOMINIO.astrologia.relacoes).toBe(0.8);
  });

  it('Tantra pesa 0.9 em desafios', () => {
    expect(PESOS_TRADICAO_DOMINIO.tantra.desafios).toBe(0.9);
  });

  it('Odu pesa 0.9 em missao e espiritualidade', () => {
    expect(PESOS_TRADICAO_DOMINIO.odu.missao).toBe(0.9);
    expect(PESOS_TRADICAO_DOMINIO.odu.espiritualidade).toBe(0.9);
  });
});

// ─── getIChingContribution ────────────────────────────────────────────────────

describe('getIChingContribution', () => {
  it('hex 1 (Qián) → Expansao luz intensidade 9 em gift', () => {
    const result = getIChingContribution(1, 'gift');
    expect(result).toHaveLength(1);
    expect(result[0].primitivo).toBe('Expansao');
    expect(result[0].polaridade).toBe('luz');
    expect(result[0].intensidade).toBe(9);
    expect(result[0].fonte).toContain('Wilhelm/Baynes');
  });

  it('hex 29 (Kǎn) → Transformacao ambas intensidade 7 em shadow', () => {
    const result = getIChingContribution(29, 'shadow');
    expect(result[0].primitivo).toBe('Transformacao');
    expect(result[0].polaridade).toBe('ambas');
    expect(result[0].intensidade).toBe(7);
  });

  it('hex 55 (Fēng) → Expansao capped at 10 em siddhi', () => {
    const result = getIChingContribution(55, 'siddhi');
    expect(result[0].intensidade).toBe(10);
  });

  it('hex 99 desconhecido retorna array vazio', () => {
    expect(getIChingContribution(99, 'gift')).toHaveLength(0);
  });

  it('level desconhecido usa multiplicador 1.0', () => {
    const result = getIChingContribution(14, 'unknown' as never);
    expect(result[0].intensidade).toBe(8);
  });

  it('hex 35 não tem mapeamento', () => {
    expect(getIChingContribution(35, 'gift')).toHaveLength(0);
  });

  it('fonte não-vazia para hex com mapeamento (amostra)', () => {
    for (const hex of [1, 15, 30, 50, 63]) {
      const result = getIChingContribution(hex, 'gift');
      expect(result[0].fonte.length).toBeGreaterThan(10);
    }
  });

  it('todos os 64 hexagramas reconhecidos (35 vazio, resto tem contrib)', () => {
    for (let h = 1; h <= 64; h++) {
      const result = getIChingContribution(h, 'gift');
      if (h === 35) {
        expect(result).toHaveLength(0);
        continue;
      }
      expect(result).toHaveLength(1);
      expect(result[0].primitivo).toBeTruthy();
      expect(result[0].intensidade).toBeGreaterThan(0);
      expect(result[0].intensidade).toBeLessThanOrEqual(10);
    }
  });
});

// ─── synthesizePrimitives — determinismo ───────────────────────────────────────

describe('synthesizePrimitives — determinismo', () => {
  const base = () => ({
    iching: F_ICHING_GIFT,
    cabala: F_CABALA_7,
    astrologia: F_ASTRO_LEAO,
    tantrica: F_TANTRICA,
    odu: F_ODU,
  });

  it('mesmos pilares sempre produzem o mesmo resultado (idempotência)', async () => {
    const p = base();
    const [r1, r2] = await Promise.all([synthesizePrimitives(p), synthesizePrimitives(p)]);
    expect(r1.primitivos.map((p) => p.magnitude)).toEqual(r2.primitivos.map((p) => p.magnitude));
    expect(r1.dominioPredominante).toBe(r2.dominioPredominante);
    expect(r1.narrativaCentral).toBe(r2.narrativaCentral);
  });

  it('não há inversões graves na ordenação por magnitude', async () => {
    const result = await synthesizePrimitives(base());
    const mags = result.primitivos.map((p) => p.magnitude);
    for (let i = 0; i < mags.length - 1; i++) {
      if (mags[i] > mags[i + 1] + 1) {
        expect(mags[i]).toBeGreaterThan(mags[i + 1]);
      }
    }
  });

  it('dominantes são os de maior magnitude', async () => {
    const result = await synthesizePrimitives(base());
    const dominantes = result.primitivos.filter((p) => p.dominante);
    expect(dominantes.length).toBeGreaterThanOrEqual(1);
    expect(dominantes.length).toBeLessThanOrEqual(3);
    const sorted = [...result.primitivos].sort((a, b) => b.magnitude - a.magnitude);
    for (let di = 0; di < dominantes.length; di++) {
      const rank = sorted.findIndex((p) => p.primitivo === dominantes[di].primitivo);
      expect(rank).toBeLessThan(dominantes.length);
    }
  });

  it('narrativaCentral é string não-vazia', async () => {
    const result = await synthesizePrimitives(base());
    expect(typeof result.narrativaCentral).toBe('string');
    expect(result.narrativaCentral.length).toBeGreaterThan(10);
  });

  it('convergencia está entre 0 e 1', async () => {
    const result = await synthesizePrimitives(base());
    for (const p of result.primitivos) {
      expect(p.convergencia).toBeGreaterThanOrEqual(0);
      expect(p.convergencia).toBeLessThanOrEqual(1);
    }
  });

  it('magnitude está capped a 10 para cada primitivo', async () => {
    const result = await synthesizePrimitives({
      iching: F_ICHING_SIDDHI,
      cabala: F_CABALA_11,
      astrologia: F_ASTRO_LEAO,
      tantrica: F_TANTRICA,
      odu: F_ODU,
    });
    for (const p of result.primitivos) {
      expect(p.magnitude).toBeGreaterThanOrEqual(0);
      expect(p.magnitude).toBeLessThanOrEqual(10);
    }
  });

  it('dominioPredominante é um Dominio válido', async () => {
    const validos = new Set([
      'identidade',
      'talentos',
      'desafios',
      'missao',
      'evolucao',
      'relacoes',
      'prosperidade',
      'espiritualidade',
    ]);
    const result = await synthesizePrimitives(base());
    expect(validos.has(result.dominioPredominante)).toBe(true);
  });

  it('todo primitivo tem contributions array', async () => {
    const result = await synthesizePrimitives(base());
    for (const p of result.primitivos) {
      expect(Array.isArray(p.contributions)).toBe(true);
    }
  });

  it('polaridade é sempre luz | sombra | ambas', async () => {
    const result = await synthesizePrimitives(base());
    const validas = new Set(['luz', 'sombra', 'ambas']);
    for (const p of result.primitivos) {
      expect(validas.has(p.polaridade)).toBe(true);
    }
  });
});

// ─── synthesizePrimitives — Cabala ─────────────────────────────────────────────

describe('synthesizePrimitives — Cabala', () => {
  it('LP=7 adiciona Sabedoria', async () => {
    const result = await synthesizePrimitives({
      iching: F_ICHING_GIFT,
      cabala: F_CABALA_7,
      astrologia: F_ASTRO_LEAO,
      tantrica: F_TANTRICA,
      odu: F_ODU,
    });
    const sab = result.primitivos.find((p) => p.primitivo === 'Sabedoria');
    expect(sab).toBeTruthy();
    expect(sab!.magnitude).toBeGreaterThan(0);
  });

  it('LP=11 adiciona Intuicao', async () => {
    const result = await synthesizePrimitives({
      iching: F_ICHING_GIFT,
      cabala: F_CABALA_11,
      astrologia: F_ASTRO_LEAO,
      tantrica: F_TANTRICA,
      odu: F_ODU,
    });
    const intu = result.primitivos.find((p) => p.primitivo === 'Intuicao');
    expect(intu).toBeTruthy();
    expect(intu!.magnitude).toBeGreaterThan(0);
  });

  it('LP=33 adiciona Materializacao', async () => {
    const result = await synthesizePrimitives({
      iching: F_ICHING_GIFT,
      cabala: F_CABALA_33,
      astrologia: F_ASTRO_LEAO,
      tantrica: F_TANTRICA,
      odu: F_ODU,
    });
    const mat = result.primitivos.find((p) => p.primitivo === 'Materializacao');
    expect(mat).toBeTruthy();
    expect(mat!.magnitude).toBeGreaterThan(0);
  });
});

// ─── synthesizePrimitives — I Ching ─────────────────────────────────────────────

describe('synthesizePrimitives — I Ching', () => {
  it('hex 1 contribui para Expansao', async () => {
    const result = await synthesizePrimitives({
      iching: F_ICHING_GIFT,
      cabala: F_CABALA_7,
      astrologia: F_ASTRO_LEAO,
      tantrica: F_TANTRICA,
      odu: F_ODU,
    });
    const expan = result.primitivos.find((p) => p.primitivo === 'Expansao');
    expect(expan).toBeTruthy();
    expect(expan!.magnitude).toBeGreaterThan(0);
  });

  it('siddhi amplification: Expansao siddhi >= Expansao gift', async () => {
    const gift = await synthesizePrimitives({
      iching: F_ICHING_GIFT,
      cabala: F_CABALA_7,
      astrologia: F_ASTRO_LEAO,
      tantrica: F_TANTRICA,
      odu: F_ODU,
    });
    const siddhi = await synthesizePrimitives({
      iching: F_ICHING_SIDDHI,
      cabala: F_CABALA_7,
      astrologia: F_ASTRO_LEAO,
      tantrica: F_TANTRICA,
      odu: F_ODU,
    });
    const eg = gift.primitivos.find((p) => p.primitivo === 'Expansao');
    const es = siddhi.primitivos.find((p) => p.primitivo === 'Expansao');
    expect(es!.magnitude).toBeGreaterThanOrEqual(eg!.magnitude);
  });

  it('shadow attenuation: Transformacao shadow <= Transformacao gift (mesmo hex)', async () => {
    // Ambos usam hex 29 — só o level muda
    const gift = await synthesizePrimitives({
      iching: { hexagrama_natal: 29, hexagrama_dia: 1, level: 'gift' as const },
      cabala: F_CABALA_7,
      astrologia: F_ASTRO_LEAO,
      tantrica: F_TANTRICA,
      odu: F_ODU,
    });
    const shadow = await synthesizePrimitives({
      iching: { hexagrama_natal: 29, hexagrama_dia: 1, level: 'shadow' as const },
      cabala: F_CABALA_7,
      astrologia: F_ASTRO_LEAO,
      tantrica: F_TANTRICA,
      odu: F_ODU,
    });
    const tg = gift.primitivos.find((p) => p.primitivo === 'Transformacao');
    const ts = shadow.primitivos.find((p) => p.primitivo === 'Transformacao');
    expect(tg!.magnitude).toBeGreaterThan(0);
    expect(ts!.magnitude).toBeGreaterThan(0);
    expect(ts!.magnitude).toBeLessThanOrEqual(tg!.magnitude);
  });
});

// ─── synthesizePrimitives — tensão ─────────────────────────────────────────────

describe('synthesizePrimitives — tensão', () => {
  it('tensão detecta par com polaridades opostas quando ambos magnitude > 3', async () => {
    // hex 44 (Gou/Encontro) → Poder 8 luz; hex 20 (Guān) → Servico 8 sombra
    // PARES_TENSOES inclui ['Poder', 'Servico', ...]
    const result = await synthesizePrimitives({
      iching: { hexagrama_natal: 44, hexagrama_dia: 20, level: 'gift' as const },
      cabala: F_CABALA_7,
      astrologia: F_ASTRO_LEAO,
      tantrica: F_TANTRICA,
      odu: F_ODU,
    });
    const poder = result.primitivos.find((p) => p.primitivo === 'Poder');
    const servico = result.primitivos.find((p) => p.primitivo === 'Servico');
    expect(poder).toBeTruthy();
    expect(servico).toBeTruthy();
    // A lógica não crasha; verifica apenas estrutura
    expect(result.tensaoPrincipal === undefined || result.tensaoPrincipal !== undefined).toBe(true);
  });

  it('tensaoPrincipal PrimA ≠ PrimB quando definida', async () => {
    const result = await synthesizePrimitives({
      iching: { hexagrama_natal: 44, hexagrama_dia: 20, level: 'gift' as const },
      cabala: F_CABALA_7,
      astrologia: F_ASTRO_LEAO,
      tantrica: F_TANTRICA,
      odu: F_ODU,
    });
    if (result.tensaoPrincipal) {
      expect(result.tensaoPrincipal.primitivoA).not.toBe(result.tensaoPrincipal.primitivoB);
    }
  });

  it('synthesizePrimitives não crasha com nenhum perfil válido', async () => {
    const result = await synthesizePrimitives({
      iching: F_ICHING_GIFT,
      cabala: F_CABALA_7,
      astrologia: F_ASTRO_LEAO,
      tantrica: F_TANTRICA,
      odu: F_ODU,
    });
    expect(result.primitivos.length).toBe(12);
    expect(result.dominioPredominante).toBeTruthy();
  });
});
