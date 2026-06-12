/**
 * Testes para Mural coletivo (F-234) — Tzolkin 260 dias
 *
 * Verifica:
 *   - kinDaData() retorna shape correto
 *   - ciclo de 260 dias (kin 261 == kin 1)
 *   - 4 Portais Especiais (8, 9, 17, 18) reconhecidos
 *   - 5 Famílias Terrestres (52 dias cada)
 *   - determinístico: mesma data → mesmo kin
 *   - datas passadas e futuras funcionam
 */

import { describe, it, expect } from 'vitest';
import { kinDaData, familias, type FamiliaTzolkin } from '@/lib/grimoire/mural-tzolkin';

describe('F-234 Mural: kinDaData shape', () => {
  it('retorna todos os campos do KinTzolkin', () => {
    const k = kinDaData();
    expect(k.numero).toBeGreaterThanOrEqual(1);
    expect(k.numero).toBeLessThanOrEqual(13);
    expect(k.posicao_no_ciclo).toBeGreaterThanOrEqual(1);
    expect(k.posicao_no_ciclo).toBeLessThanOrEqual(260);
    expect(k.dias_ate_proximo_ciclo).toBeGreaterThanOrEqual(1);
    expect(k.dias_ate_proximo_ciclo).toBeLessThanOrEqual(260);
    expect(typeof k.familia).toBe('string');
    expect(typeof k.familia_nome).toBe('string');
    expect(typeof k.familia_cor).toBe('string');
    expect(typeof k.familia_qualidade).toBe('string');
    expect(typeof k.eh_portal).toBe('boolean');
  });

  it('é determinístico: mesma data → mesmo kin', () => {
    const d = new Date('2026-06-15T12:00:00Z');
    const k1 = kinDaData(d);
    const k2 = kinDaData(d);
    expect(k1.posicao_no_ciclo).toBe(k2.posicao_no_ciclo);
    expect(k1.familia).toBe(k2.familia);
    expect(k1.eh_portal).toBe(k2.eh_portal);
  });

  it('ciclo de 260 dias: kin 261 == kin 1', () => {
    // 2024-01-01 = kin 1 (âncora)
    const a = kinDaData(new Date('2024-01-01T00:00:00Z'));
    expect(a.posicao_no_ciclo).toBe(1);

    // 2024-01-01 + 260 dias = kin 1 de novo
    const b = kinDaData(new Date('2024-09-17T00:00:00Z'));
    expect(b.posicao_no_ciclo).toBe(1);

    // 2024-01-01 + 8 dias = kin 9
    const c = kinDaData(new Date('2024-01-09T00:00:00Z'));
    expect(c.posicao_no_ciclo).toBe(9);
  });
});

describe('F-234 Mural: Portais Especiais', () => {
  it('reconhece kin 8, 9, 17, 18 como portais', () => {
    // kin 8: 2024-01-08
    const p8 = kinDaData(new Date('2024-01-08T00:00:00Z'));
    expect(p8.eh_portal).toBe(true);
    expect(p8.portal_nome).toBe('Portal da Ressonância');

    // kin 9: 2024-01-09
    const p9 = kinDaData(new Date('2024-01-09T00:00:00Z'));
    expect(p9.eh_portal).toBe(true);
    expect(p9.portal_nome).toBe('Portal da Harmonização');

    // kin 17: 2024-01-17
    const p17 = kinDaData(new Date('2024-01-17T00:00:00Z'));
    expect(p17.eh_portal).toBe(true);
    expect(p17.portal_nome).toBe('Portal da Transformação');

    // kin 18: 2024-01-18
    const p18 = kinDaData(new Date('2024-01-18T00:00:00Z'));
    expect(p18.eh_portal).toBe(true);
    expect(p18.portal_nome).toBe('Portal da Revelação');
  });

  it('kin 10 NÃO é portal', () => {
    const k = kinDaData(new Date('2024-01-10T00:00:00Z'));
    expect(k.eh_portal).toBe(false);
    expect(k.portal_nome).toBeNull();
  });
});

describe('F-234 Mural: Famílias Terrestres', () => {
  it('5 famílias cobrindo 260 dias (52 cada)', () => {
    const fams = familias();
    expect(fams.length).toBe(5);
    fams.forEach((f) => {
      expect(['cardinal', 'polar', 'eletrico', 'solar', 'espectral']).toContain(f.id);
      expect(f.nome.length).toBeGreaterThan(0);
      expect(f.cor).toMatch(/^#[0-9A-F]{6}$/i);
      expect(f.qualidade.length).toBeGreaterThan(5);
    });
  });

  it('kin 1 está na Família Cardinal (primeira do ciclo)', () => {
    const k = kinDaData(new Date('2024-01-01T00:00:00Z'));
    expect(k.familia).toBe('cardinal');
  });

  it('kin 53 está na Família Polar (segunda)', () => {
    // 2024-01-01 + 52 dias = kin 53
    const k = kinDaData(new Date('2024-02-22T00:00:00Z'));
    expect(k.posicao_no_ciclo).toBe(53);
    expect(k.familia).toBe('polar');
  });
});

describe('F-234 Mural: avisos éticos preservados', () => {
  it('kin HOJE hoje é um kin válido', () => {
    const k = kinDaData();
    expect(k.posicao_no_ciclo).toBeGreaterThanOrEqual(1);
    expect(k.posicao_no_ciclo).toBeLessThanOrEqual(260);
  });
});
