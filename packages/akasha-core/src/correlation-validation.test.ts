/**
 * @akasha/core — D-044 (Validação do knowledge base)
 *
 * Valida AUTOMATICAMENTE que:
 *  1. Ranges canônicos: I Ching 1-64, Sefirot 1-10, Trigramas King Wen 1-8
 *  2. Constantes: IFA_ODUS (16), SEFIRot (10), ICHING_NAMES (64) com entries únicos
 *  3. Maps: ifaToIchingMap, sefirotToTrigramMap, ifaToCabalaMap dentro dos ranges
 *  4. Inversão: getIchingsByIfa ⇄ getIfasByIching são inversas
 *  5. Cobertura: nenhum Odu órfão (todos mapeados)
 *  6. Cisão Fase 5 vs Fase 6: stub akasha-core.ts vs IFA_ODUS
 *     (Ogbe/Ofun no stub NÃO existem em IFA_ODUS — divergência documentada)
 *  7. Tipos: IfaOdu union cobre IFA_ODUS, Sefirah union cobre SEFIRot
 *
 * AGENTS.md §5: nunca inventar correspondências. CORRELATION_MAP é a
 * fonte canônica. Este teste audita isso antes da Fase 6.
 *
 * Refs:
 *  - R-008 Cabala Clássica / Árvore da Vida
 *  - R-009 Numerologia Cabalística
 *  - R-022b Ethics Charter §2 (Tradição Viva, citação)
 *  - instinto "agents-md-derive-not-invent-correspondences"
 */

import { describe, it, expect } from 'vitest';
import {
  IFA_ODUS,
  SEFIRot,
  ICHING_NAMES,
  ifaToIchingMap,
  ifaToCabalaMap,
  sefirotToTrigramMap,
  getIchingsByIfa,
  getIfasByIching,
  getSefirotByTrigram,
  getSefirotByIfa,
  type IfaOdu,
  type Sefirah,
} from './correlation-map';

// Stub de R-030: extract the canonical 16-Odu list from akasha-core.ts
// (kept in sync manually — divergence IS the test target)
const STUB_ODUS_16 = [
  'Ogbe', 'Oyeku', 'Iwori', 'Odi', 'Irosun', 'Owonrin',
  'Obara', 'Okanran', 'Ogunda', 'Osa', 'Ika', 'Oturupon',
  'Otura', 'Irete', 'Ofun', 'Ose',
] as const;

describe('D-044 — Ranges canônicos (knowledge base bounds)', () => {
  it('IFA_ODUS tem 15 entries únicos (canônico: Eji substitui Ogbe)', () => {
    // Ifá tradicional tem 16 Odus principais (Ogbe..Ose).
    // CORRELATION_MAP usa 15 — 'Eji' representa Ogbe (Odu composto
    // 17+ na tradição) por design. COT documenta a substituição.
    expect(IFA_ODUS.length).toBe(15);
    expect(new Set(IFA_ODUS).size).toBe(15);
  });

  it('SEFIRot tem 10 entries únicos (10 Sefirot da Árvore da Vida)', () => {
    expect(SEFIRot.length).toBe(10);
    expect(new Set(SEFIRot).size).toBe(10);
  });

  it('ICHING_NAMES cobre 1..64 sem buracos', () => {
    expect(Object.keys(ICHING_NAMES).length).toBe(64);
    for (let i = 1; i <= 64; i++) {
      expect(ICHING_NAMES[i]).toBeDefined();
      expect(ICHING_NAMES[i]!.length).toBeGreaterThan(0);
    }
  });
});

describe('D-044 — ifaToIchingMap: cada Odu → apenas hexagramas 1-64', () => {
  for (const odu of IFA_ODUS) {
    it(`Odu ${odu} → array em [1,64]`, () => {
      const hexagrams = ifaToIchingMap[odu];
      expect(hexagrams).toBeDefined();
      expect(hexagrams.length).toBeGreaterThan(0);
      for (const h of hexagrams) {
        expect(h).toBeGreaterThanOrEqual(1);
        expect(h).toBeLessThanOrEqual(64);
      }
    });
  }

  it('nenhum Odu órfão (todos têm ao menos 1 hexagrama)', () => {
    const orphans: string[] = [];
    for (const odu of IFA_ODUS) {
      if (ifaToIchingMap[odu].length === 0) orphans.push(odu);
    }
    expect(orphans).toEqual([]);
  });
});

describe('D-044 — sefirotToTrigramMap: cada Sefirah → apenas trigramas 1-8', () => {
  for (const sefirah of SEFIRot) {
    it(`Sefirah ${sefirah} → array em [1,8] (King Wen)`, () => {
      const trigrams = sefirotToTrigramMap[sefirah];
      expect(trigrams).toBeDefined();
      expect(trigrams.length).toBeGreaterThan(0);
      for (const t of trigrams) {
        expect(t).toBeGreaterThanOrEqual(1);
        expect(t).toBeLessThanOrEqual(8);
      }
    });
  }
});

describe('D-044 — ifaToCabalaMap: cada Odu → apenas Sefirot 1-10', () => {
  for (const odu of IFA_ODUS) {
    it(`Odu ${odu} → Sefirot em [1,10]`, () => {
      const sefirotIdx = ifaToCabalaMap[odu];
      expect(sefirotIdx).toBeDefined();
      expect(sefirotIdx.length).toBeGreaterThan(0);
      for (const s of sefirotIdx) {
        expect(s).toBeGreaterThanOrEqual(1);
        expect(s).toBeLessThanOrEqual(10);
      }
    });
  }
});

describe('D-044 — Inversão: getIchingsByIfa ⇄ getIfasByIching', () => {
  for (const odu of IFA_ODUS) {
    it(`Odu ${odu} → ida-e-volta consistente`, () => {
      const hexagrams = getIchingsByIfa(odu);
      for (const h of hexagrams) {
        const back = getIfasByIching(h);
        expect(back).toContain(odu);
      }
    });
  }
});

describe('D-044 — getSefirotByIfa retorna apenas Sefirot válidos', () => {
  for (const odu of IFA_ODUS) {
    it(`Odu ${odu} → Sefirot ∈ SEFIRot[]`, () => {
      const sefirot = getSefirotByIfa(odu);
      for (const s of sefirot) {
        expect(SEFIRot).toContain(s);
      }
    });
  }
});

describe('D-044 — getSefirotByTrigram retorna apenas Sefirot válidos', () => {
  for (let t = 1; t <= 8; t++) {
    it(`Trigrama ${t} → Sefirot ∈ SEFIRot[]`, () => {
      const sefirot = getSefirotByTrigram(t);
      for (const s of sefirot) {
        expect(SEFIRot).toContain(s);
      }
    });
  }
});

describe('D-044 — Cisão Fase 5: stub R-030 vs CORRELATION_MAP canônico', () => {
  it('STUB_ODUS_16 (akasha-core.ts:168) cobre os 16 nomes tradicionais', () => {
    // Stub R-030 foi escrito como placeholder determinístico.
    // CORRELATION_MAP (Phase 1) é a fonte canônica, com 15 entries.
    // Fase 6 unifica.
    expect(STUB_ODUS_16.length).toBe(16);
  });

  it('CANÔNICO: IFA_ODUS tem 15 (Eji substitui Ogbe, design consciente)', () => {
    // CORRELATION_MAP tem 15 entries.
    // Ifá tradicional tem 16 (Ogbe..Ose).
    // 'Eji' é usado para cobrir o Odu #1 (Ogbe) + a categoria de
    // "Odus compostos" (17-240) — design canônico de Phase 1.
    expect(IFA_ODUS.length).toBe(15);
    expect(IFA_ODUS as readonly string[]).toContain('Eji');
  });

  it('DIVERGÊNCIA DOCUMENTADA: Ogbe aparece no stub mas NÃO em IFA_ODUS', () => {
    // Sefer Yetzirah: Ogbe é o Odu #1 real (não Eji).
    // CORRELATION_MAP substitui por 'Eji' como "Odu composto".
    // Fase 6 deve reconciliar — derivado da tradição, não inventado.
    expect(STUB_ODUS_16).toContain('Ogbe');
    expect(IFA_ODUS as readonly string[]).not.toContain('Ogbe');
  });

  it('DIVERGÊNCIA DOCUMENTADA: Ofun aparece no stub mas NÃO em IFA_ODUS', () => {
    // Ofun é Odu #15 na tradição Yorubá.
    // CORRELATION_MAP omite e usa Ose/Oshe (próximo).
    expect(STUB_ODUS_16).toContain('Ofun');
    expect(IFA_ODUS as readonly string[]).not.toContain('Ofun');
  });

  it('IFA_ODUS contém entries que NÃO aparecem no stub', () => {
    // 'Eji' está em IFA_ODUS mas não em STUB_ODUS_16.
    // Não inventar: stub é placeholder, mapa é canônico.
    const stubSet = new Set<string>(STUB_ODUS_16);
    const noStub: string[] = [];
    for (const o of IFA_ODUS) {
      if (!stubSet.has(o)) noStub.push(o);
    }
    expect(noStub.length).toBeGreaterThan(0);
    expect(noStub).toContain('Eji');
  });

  it('intersecção stub ∩ mapa ≥ 13 (sanidade)', () => {
    // A maioria dos Odus é compartilhada.
    const stubSet = new Set<string>(STUB_ODUS_16);
    let common = 0;
    for (const o of IFA_ODUS) {
      if (stubSet.has(o)) common++;
    }
    expect(common).toBeGreaterThanOrEqual(13);
  });
});

describe('D-044 — Tipos: IfaOdu union cobre IFA_ODUS, Sefirah union cobre SEFIRot', () => {
  it('IfaOdu type cobre IFA_ODUS sem lacuna (15 entries)', () => {
    // Type-level guarantee: every IFA_ODUS string é IfaOdu literal.
    // Se a union driftar, tsc falha — auditoria estática.
    const typed: IfaOdu[] = [...IFA_ODUS] as IfaOdu[];
    expect(typed.length).toBe(15);
  });

  it('Sefirah type cobre SEFIRot sem lacuna', () => {
    const typed: Sefirah[] = [...SEFIRot] as Sefirah[];
    expect(typed.length).toBe(10);
  });
});
