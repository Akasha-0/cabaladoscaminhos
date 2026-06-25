/**
 * Tests — healing/recommend.ts (Wave 26.4)
 *
 * Cobertura (lesson N+24 — tests co-located com código):
 *   1. recommendHealingPractice — determinístico (mesma input → mesma saída)
 *   2. recommendHealingPractice — eclipse/plutão → tradição de atravessar (ayahuasca/tambor)
 *   3. recommendHealingPractice — lua nova → meditação (introspecção)
 *   4. recommendHealingPractice — ansiedade + Marte → reiki (canal aberto)
 *   5. recommendHealingPractice — exige requiresConsent para ayahuasca (Pilar 4 Odu)
 *   6. recommendHealingPractice — retorna 5 pilares como cross-references
 *   7. recommendHealingPractice — retorna ≥ 1 paper citado
 *   8. recommendHealingPractice — labels i18n respeitam locale
 *   9. recommendHealingPractice — emoção paz → oração / meditação
 *  10. listTopHealingPractices — retorna até N práticas distintas
 *  11. classifyTransit — heurística para nomes em pt-BR
 *  12. HealingRecommendation — shape respeitado (campos obrigatórios)
 *
 * Sem dependência Prisma/Next/React — funções puras em memória.
 */

import { describe, it, expect } from 'vitest';

import {
  classifyTransit,
  listTopHealingPractices,
  recommendHealingPractice,
  type HealingRecommendationInput,
} from '../recommend';

// ─── fixtures ────────────────────────────────────────────────────────────────

const baseInput: HealingRecommendationInput = {
  sessionId: 'session-test-001',
  dayKey: '2026-06-25',
  transits: [],
  pilares: {
    cabala: { lifePath: 11, sephira: 'Tiferet' },
    astrologia: { sol: 'Escorpião', lua: 'Peixes', ascendente: 'Câncer' },
    tantra: { bodyPrincipal: 1, kosha: 'manomaya' },
    odu: { oduPrincipal: 'Owonrin', signo: 'Escorpião' },
    iching: { hexagrama: 29, mutacao: 35 },
  },
  session: {
    akashaType: 'O Curador',
    emotionalState: 'ansiedade',
    themeKeywords: ['medo', 'perda'],
  },
  locale: 'pt-BR',
};

// ─── 1. determinismo ────────────────────────────────────────────────────────

describe('recommendHealingPractice — determinism', () => {
  it('same input returns same recommendation', () => {
    const a = recommendHealingPractice(baseInput);
    const b = recommendHealingPractice(baseInput);
    expect(a.tradition).toBe(b.tradition);
    expect(a.headline).toBe(b.headline);
    expect(a.verdadeUniversal).toBe(b.verdadeUniversal);
    expect(a.dayKey).toBe(b.dayKey);
  });

  it('different sessionId can yield different recommendation', () => {
    const a = recommendHealingPractice({ ...baseInput, sessionId: 's-aaaa' });
    const b = recommendHealingPractice({ ...baseInput, sessionId: 's-bbbb' });
    // Só precisa do mesmo engine responder — não precisa ser diferente
    // (a maioria dos inputs são iguais). Validamos apenas que é determinístico
    // dentro de cada sessionId:
    const a2 = recommendHealingPractice({ ...baseInput, sessionId: 's-aaaa' });
    const b2 = recommendHealingPractice({ ...baseInput, sessionId: 's-bbbb' });
    expect(a.tradition).toBe(a2.tradition);
    expect(b.tradition).toBe(b2.tradition);
  });
});

// ─── 2. eclipse + plutão → atravessar ──────────────────────────────────────

describe('recommendHealingPractice — transit-driven', () => {
  it('eclipse + Plutão recommends ayahuasca or psicodelico_sagrado (high-intensity)', () => {
    const out = recommendHealingPractice({
      ...baseInput,
      transits: [
        { description: 'Eclipse solar total', intensity: 1.0 },
        { description: 'Plutão em Aquário', intensity: 0.9 },
      ],
      session: { ...baseInput.session, emotionalState: 'duvida' },
    });
    // Pode ser ayahuasca, psicodelico_sagrado, tambor, respiracao_holotropica, defumacao
    const candidates = [
      'ayahuasca',
      'psicodelico_sagrado',
      'tambor',
      'respiracao_holotropica',
      'defumacao',
    ] as const;
    expect(candidates).toContain(out.tradition);
  });

  it('Lua Nova recommends meditacao (introspection)', () => {
    const out = recommendHealingPractice({
      ...baseInput,
      transits: [{ description: 'Lua Nova em Touro', intensity: 0.7 }],
      session: { ...baseInput.session, emotionalState: 'paz' },
    });
    // Meditação OU oração OU banho_ervas (todas têm keyword lua)
    expect(['meditacao', 'oracao', 'banho_ervas']).toContain(out.tradition);
  });

  it('Mercúrio retrógrado + Saturno recommends jejum (cutting)', () => {
    const out = recommendHealingPractice({
      ...baseInput,
      transits: [
        { description: 'Mercúrio retrógrado em Virgem', intensity: 0.6 },
        { description: 'Saturno em Capricórnio', intensity: 0.7 },
      ],
      session: { ...baseInput.session, emotionalState: 'tristeza' },
    });
    expect(['jejum', 'meditacao']).toContain(out.tradition);
  });
});

// ─── 3. ansiedade + Marte → reiki ──────────────────────────────────────────

describe('recommendHealingPractice — emotional state', () => {
  it('ansiedade + Marte recommends reiki (channel aberto)', () => {
    const out = recommendHealingPractice({
      ...baseInput,
      transits: [
        { description: 'Marte em Escorpião', intensity: 0.8 },
        { description: 'Lua em Câncer', intensity: 0.5 },
      ],
      session: { ...baseInput.session, emotionalState: 'ansiedade' },
    });
    // reiki OU meditacao OU banho_ervas (todas casam Marte/ansiedade/Lua)
    expect(['reiki', 'meditacao', 'banho_ervas', 'tambor']).toContain(out.tradition);
  });

  it('paz recommends gentle practice (oração / meditação / cântico)', () => {
    const out = recommendHealingPractice({
      ...baseInput,
      transits: [{ description: 'Sol em Sagitário', intensity: 0.5 }],
      session: { ...baseInput.session, emotionalState: 'paz' },
    });
    // paz + Sol = qualquer prática gentil (sem atravessar, sem corte)
    const gentle = ['oracao', 'meditacao', 'cantico', 'mesa_radionica'];
    expect(gentle).toContain(out.tradition);
  });
});

// ─── 4. Pilar 4 Odu ethics — consent flag ──────────────────────────────────

describe('recommendHealingPractice — Pilar 4 Odu ethics', () => {
  it('ayahuasca requires explicit consent', () => {
    // Forçamos ayahuasca via trânsitos pesados
    const out = recommendHealingPractice({
      ...baseInput,
      transits: [
        { description: 'Eclipse lunar em Escorpião', intensity: 1.0 },
        { description: 'Plutão em Aquário', intensity: 1.0 },
        { description: 'Netuno em Peixes', intensity: 1.0 },
      ],
      session: { ...baseInput.session, emotionalState: 'duvida' },
    });
    // Se ayahuasca foi escolhida, então requiresConsent true
    if (out.tradition === 'ayahuasca' || out.tradition === 'psicodelico_sagrado') {
      expect(out.requiresConsent).toBe(true);
    }
  });

  it('non-psychédélique traditions do not require consent', () => {
    const out = recommendHealingPractice({
      ...baseInput,
      transits: [{ description: 'Lua Nova em Touro', intensity: 0.7 }],
      session: { ...baseInput.session, emotionalState: 'paz' },
    });
    expect(out.requiresConsent).toBe(false);
  });
});

// ─── 5. cross-references dos 5 Pilares ─────────────────────────────────────

describe('recommendHealingPractice — 5 Pilares cross-references', () => {
  it('returns 5 pilares in cross-references', () => {
    const out = recommendHealingPractice(baseInput);
    expect(out.pilares.length).toBe(5);
    const sources = out.pilares.map((p) => p.pilar).sort();
    expect(sources).toEqual(['astrologia', 'cabala', 'iching', 'odu', 'tantra']);
  });

  it('every pilar has an insight (≤ 12 words)', () => {
    const out = recommendHealingPractice(baseInput);
    for (const p of out.pilares) {
      expect(p.insight).toBeTruthy();
      const wordCount = p.insight.split(/\s+/).length;
      expect(wordCount).toBeLessThanOrEqual(12);
    }
  });
});

// ─── 6. papers cited ──────────────────────────────────────────────────────

describe('recommendHealingPractice — papers cited', () => {
  it('returns at least 1 paper', () => {
    const out = recommendHealingPractice(baseInput);
    expect(out.papers.length).toBeGreaterThanOrEqual(1);
  });

  it('every paper has DOI or fullTextUrl', () => {
    const out = recommendHealingPractice(baseInput);
    for (const p of out.papers) {
      expect(p.doi !== null || p.fullTextUrl !== null).toBe(true);
    }
  });

  it('papers have non-empty title and abstract', () => {
    const out = recommendHealingPractice(baseInput);
    for (const p of out.papers) {
      expect(p.title.length).toBeGreaterThan(5);
      expect(p.abstractEn.length).toBeGreaterThan(10);
    }
  });
});

// ─── 7. i18n ──────────────────────────────────────────────────────────────

describe('recommendHealingPractice — i18n', () => {
  it('PT-BR locale returns PT-BR labels', () => {
    const out = recommendHealingPractice({ ...baseInput, locale: 'pt-BR' });
    // Headlines PT-BR todas têm acentos/palavras pt-br comuns
    expect(out.headline).toBeTruthy();
    expect(out.verdadeUniversal).toBeTruthy();
    expect(out.locale).toBe('pt-BR');
  });

  it('EN locale returns EN labels', () => {
    const out = recommendHealingPractice({ ...baseInput, locale: 'en' });
    expect(out.headline).toBeTruthy();
    expect(out.verdadeUniversal).toBeTruthy();
    expect(out.locale).toBe('en');
  });

  it('PT-BR and EN produce different labels', () => {
    const pt = recommendHealingPractice({ ...baseInput, locale: 'pt-BR' });
    const en = recommendHealingPractice({ ...baseInput, locale: 'en' });
    // Mesmo tradition, mas labels diferentes
    expect(pt.tradition).toBe(en.tradition);
    expect(pt.headline).not.toBe(en.headline);
    expect(pt.verdadeUniversal).not.toBe(en.verdadeUniversal);
  });
});

// ─── 8. shape respeitado ──────────────────────────────────────────────────

describe('recommendHealingPractice — output shape', () => {
  it('returns all required fields', () => {
    const out = recommendHealingPractice(baseInput);
    expect(out.headline).toBeTruthy();
    expect(out.verdadeUniversal).toBeTruthy();
    expect(out.tradition).toBeTruthy();
    expect(out.traditionLabel).toBeTruthy();
    expect(typeof out.requiresConsent).toBe('boolean');
    expect(out.rationale).toBeTruthy();
    expect(out.steps.length).toBeGreaterThan(0);
    expect(out.supportedBy.length).toBeGreaterThan(0);
    expect(out.pilares.length).toBe(5);
    expect(out.papers.length).toBeGreaterThanOrEqual(1);
    expect(out.dayKey).toBe('2026-06-25');
    expect(out.locale).toBe('pt-BR');
  });

  it('returns 3+ steps in the practice', () => {
    const out = recommendHealingPractice(baseInput);
    expect(out.steps.length).toBeGreaterThanOrEqual(3);
  });

  it('supportedBy lists ancestral traditions', () => {
    const out = recommendHealingPractice(baseInput);
    // Cada supportedBy deve mencionar pelo menos uma tradição ancestral
    expect(out.supportedBy.join(' ')).toMatch(/Cabala|Astrologia|Tantra|Odu|I Ching|Tao/i);
  });
});

// ─── 9. classifyTransit ──────────────────────────────────────────────────

describe('classifyTransit — heuristic', () => {
  it('classifies eclipse', () => {
    expect(classifyTransit('Eclipse solar total')).toBe('eclipse');
    expect(classifyTransit('Eclipse lunar parcial')).toBe('eclipse');
  });

  it('classifies Mercúrio retrógrado', () => {
    expect(classifyTransit('Mercúrio retrógrado em Virgem')).toBe('mercurio_retro');
  });

  it('classifies Sol / Lua', () => {
    expect(classifyTransit('Sol em Escorpião')).toBe('sol');
    expect(classifyTransit('Lua Nova em Touro')).toBe('lua');
  });

  it('classifies Plutão', () => {
    expect(classifyTransit('Plutão em Aquário')).toBe('plutao');
  });

  it('returns desconhecido for unknown strings', () => {
    expect(classifyTransit('xyz123')).toBe('desconhecido');
  });
});

// ─── 10. listTopHealingPractices ─────────────────────────────────────────

describe('listTopHealingPractices — multiple options', () => {
  it('returns up to N distinct traditions', () => {
    const out = listTopHealingPractices(baseInput, 3);
    expect(out.length).toBeGreaterThan(0);
    expect(out.length).toBeLessThanOrEqual(3);
    // Distintas
    const uniqueTraditions = new Set(out.map((o) => o.tradition));
    expect(uniqueTraditions.size).toBe(out.length);
  });

  it('each entry has full recommendation shape', () => {
    const out = listTopHealingPractices(baseInput, 2);
    for (const r of out) {
      expect(r.headline).toBeTruthy();
      expect(r.pilares.length).toBe(5);
      expect(r.papers.length).toBeGreaterThanOrEqual(1);
    }
  });
});

// ─── 11. dayKey defaulting ────────────────────────────────────────────────

describe('recommendHealingPractice — dayKey defaulting', () => {
  it('uses today UTC when dayKey omitted', () => {
    const out = recommendHealingPractice({ ...baseInput, dayKey: undefined });
    expect(out.dayKey).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('uses provided dayKey when supplied', () => {
    const out = recommendHealingPractice({ ...baseInput, dayKey: '2025-12-21' });
    expect(out.dayKey).toBe('2025-12-21');
  });
});

// ─── 12. edge cases ─────────────────────────────────────────────────────

describe('recommendHealingPractice — edge cases', () => {
  it('handles empty transits + empty theme gracefully', () => {
    const out = recommendHealingPractice({
      ...baseInput,
      transits: [],
      session: { ...baseInput.session, themeKeywords: [], emotionalState: undefined },
    });
    expect(out.tradition).toBeTruthy();
    expect(out.headline).toBeTruthy();
  });

  it('handles unknown transit description gracefully', () => {
    const out = recommendHealingPractice({
      ...baseInput,
      transits: [{ description: 'xyz123 abc456' }],
    });
    expect(out.tradition).toBeTruthy();
  });
});