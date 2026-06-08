/**
 * prompt-builder-iching.test.ts — T10.5 (v0.0.4)
 *
 * Verifica a injeção condicional da seção "## Hexagrama Natal (I-Ching)"
 * no System Prompt do oráculo (/api/akasha/consult) quando o `ichingMap`
 * do usuário está presente.
 *
 * Cobertura:
 *  1. Com ichingMap presente → seção aparece com nº, nome PT/ZH, trigramas, aspectos
 *  2. Com ichingMap null/undefined → seção NÃO aparece
 *  3. Com ichingMap inválido (hexagramNumber=null) → seção NÃO aparece
 *  4. Sem ichingMap (parâmetro omitido — retrocompat) → seção NÃO aparece
 *  5. Conservador: NÃO inclui conteúdo do ritual (apenas metadados)
 */
import { describe, it, expect } from 'vitest';
import { buildConsultSystemPrompt } from '@/app/api/akasha/consult/route';
import type { GrimoireContext } from '@/lib/grimoire/search';
import type { IChingMap } from '@akasha/core-iching';

const EMPTY_GRIMOIRE: GrimoireContext = { entries: [], pillarsConsulted: [] };

const MOCK_CHART = {
  astrologyMap: {},
  kabalisticMap: { lifePath: 5 },
  oduBirth: { oduName: 'Ogbe' },
};

const VALID_ICHING_MAP: IChingMap = {
  hexagramNumber: 1,
  hexagramName: 'O Criativo',
  hexagramChineseName: 'Qián',
  upperTrigram: 1,
  lowerTrigram: 1,
  upperTrigramName: 'Qián — Céu',
  lowerTrigramName: 'Qián — Céu',
  lines: [true, true, true, true, true, true],
  aspects: ['liderança', 'criatividade', 'força primordial', 'yang puro'],
  birthDate: '1990-06-15',
  birthTime: '12:00',
  algorithm: 'akasha.v0.0.4.trigramas-mod8',
  provisional: false,
};

describe('T10.5 — PromptBuilder injeta seção I-Ching condicionalmente', () => {
  it('com ichingMap válido, injeta seção "## Hexagrama Natal (I-Ching)"', () => {
    const prompt = buildConsultSystemPrompt(MOCK_CHART, EMPTY_GRIMOIRE, VALID_ICHING_MAP);

    expect(prompt).toContain('## Hexagrama Natal (I-Ching)');
    expect(prompt).toContain('Hexagrama: 1 — O Criativo (Qián)');
    expect(prompt).toContain('Trigrama superior: Qián — Céu');
    expect(prompt).toContain('Trigrama inferior: Qián — Céu');
    expect(prompt).toContain('liderança, criatividade, força primordial, yang puro');
    // Comentário interpretativo presente (sem corpo de ritual)
    expect(prompt).toMatch(/camada de sabedoria chinesa complementar aos 4 Pilares/);
  });

  it('com ichingMap null, NÃO injeta seção I-Ching', () => {
    const prompt = buildConsultSystemPrompt(MOCK_CHART, EMPTY_GRIMOIRE, null);

    expect(prompt).not.toContain('## Hexagrama Natal (I-Ching)');
    expect(prompt).not.toMatch(/Hexagrama: \d+ — /);
  });

  it('com ichingMap undefined, NÃO injeta seção I-Ching', () => {
    const prompt = buildConsultSystemPrompt(MOCK_CHART, EMPTY_GRIMOIRE, undefined);

    expect(prompt).not.toContain('## Hexagrama Natal (I-Ching)');
  });

  it('com ichingMap inválido (hexagramNumber=null), NÃO injeta seção', () => {
    const invalid: IChingMap = {
      ...VALID_ICHING_MAP,
      hexagramNumber: null,
      hexagramName: null,
      hexagramChineseName: null,
      upperTrigram: null,
      lowerTrigram: null,
      upperTrigramName: null,
      lowerTrigramName: null,
      lines: [],
      aspects: [],
      provisional: true,
      error: 'birthDate inválida',
    };
    const prompt = buildConsultSystemPrompt(MOCK_CHART, EMPTY_GRIMOIRE, invalid);

    expect(prompt).not.toContain('## Hexagrama Natal (I-Ching)');
  });

  it('retrocompat: parâmetro ichingMap omitido (chamada legada) NÃO injeta seção', () => {
    // Simula a chamada usada pelo teste de integração existente
    // (oraculo-rag-fechado.test.ts) — 2 argumentos.
    const prompt = buildConsultSystemPrompt(MOCK_CHART, EMPTY_GRIMOIRE);

    expect(prompt).not.toContain('## Hexagrama Natal (I-Ching)');
    // Comportamento padrão preservado
    expect(prompt).toContain('Odu de nascimento: Ogbe');
  });

  it('conservador: NÃO inclui corpo de ritual ou interpretação profunda', () => {
    const prompt = buildConsultSystemPrompt(MOCK_CHART, EMPTY_GRIMOIRE, VALID_ICHING_MAP);

    // Só metadados estruturados (header canônico + 5 bullets). Nenhum
    // parágrafo livre, nenhum "Julgamento" (esse fica no Grimório/RAG).
    expect(prompt).not.toMatch(/Julgamento/);
    expect(prompt).not.toMatch(/Imagem:/);
    // Hexagrama 1 do Grimório (Wilhelm/Baynes) NÃO vaza para o prompt.
    expect(prompt).not.toMatch(/O Criativo trabalha em perseverança suprema/);
  });

  it('a seção I-Ching aparece no bloco IDENTIDADE DO CONSULTANTE', () => {
    const prompt = buildConsultSystemPrompt(MOCK_CHART, EMPTY_GRIMOIRE, VALID_ICHING_MAP);

    // A seção "## Hexagrama Natal (I-Ching)" deve vir logo após o bullet
    // "Elemento dominante:" da IDENTIDADE.
    const identidadeIdx = prompt.indexOf('IDENTIDADE DO CONSULTANTE');
    const ichingIdx = prompt.indexOf('## Hexagrama Natal (I-Ching)');
    const grimoireIdx = prompt.indexOf('## BIBLIOTECA AKASHA');

    expect(identidadeIdx).toBeGreaterThan(-1);
    expect(ichingIdx).toBeGreaterThan(identidadeIdx);
    // Não tem BIBLIOTECA neste teste, então só checa a ordem identidade → iching.
    void grimoireIdx;
  });
});
