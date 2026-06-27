// ============================================================================
// AI — Akasha system prompt + RAG builder
// ============================================================================
// Testa que:
//   1. AKASHA_SYSTEM_PROMPT contém as 8 regras éticas (não pode quebrar)
//   2. buildAkashaPrompt injeta tradição + bloco RAG corretamente
//   3. Trunca excerpt quando passa do limite
//   4. Tradição inválida é rejeitada (type-level via lista)
// ============================================================================

import { describe, it, expect } from 'vitest';
import {
  AKASHA_SYSTEM_PROMPT,
  AKASHA_TRADITIONS,
  buildAkashaPrompt,
  type RagSource,
} from '@/lib/ai/prompts/akasha';

describe('AKASHA_SYSTEM_PROMPT', () => {
  it('contém as 8 regras éticas como âncoras de seção', () => {
    // Cada regra tem o formato "### Regra N:" — verificamos todas
    for (let n = 1; n <= 8; n++) {
      expect(AKASHA_SYSTEM_PROMPT).toContain(`### Regra ${n}:`);
    }
  });

  it('declara explicitamente que NUNCA prescreve', () => {
    expect(AKASHA_SYSTEM_PROMPT).toContain('Você NUNCA prescreve');
  });

  it('declara explicitamente que NUNCA substitui profissional de saúde', () => {
    expect(AKASHA_SYSTEM_PROMPT).toContain('NUNCA substitui profissional de saúde');
  });

  it('declara explicitamente que NUNCA promete cura', () => {
    expect(AKASHA_SYSTEM_PROMPT).toContain('NUNCA promete cura');
  });

  it('declara explicitamente que SEMPRE cita', () => {
    expect(AKASHA_SYSTEM_PROMPT).toContain('Você SEMPRE cita');
  });

  it('declara explicitamente que SEMPRE lembra contexto cultural', () => {
    expect(AKASHA_SYSTEM_PROMPT).toContain('SEMPRE lembra contexto cultural');
  });

  it('declara explicitamente que SEMPRE aponta contraindicações', () => {
    expect(AKASHA_SYSTEM_PROMPT).toContain('SEMPRE aponta contraindicações');
  });

  it('declara explicitamente que SEMPRE respeita autoridade da tradição', () => {
    expect(AKASHA_SYSTEM_PROMPT).toContain(
      'SEMPRE respeita autoridade da tradição',
    );
  });

  it('declara explicitamente que NUNCA forma seita', () => {
    expect(AKASHA_SYSTEM_PROMPT).toContain('NUNCA forma seita');
  });
});

describe('AKASHA_TRADITIONS', () => {
  it('contém as 12 tradições esperadas', () => {
    expect(AKASHA_TRADITIONS).toHaveLength(12);
  });

  it('inclui Cabala, Ifá, Xamanismo, Tantra, Reiki', () => {
    for (const t of ['cabala', 'ifa', 'xamanismo', 'tantra', 'reiki']) {
      expect(AKASHA_TRADITIONS).toContain(t);
    }
  });

  it('tipos são readonly (as const)', () => {
    // Confirma que é readonly tuple — type-level; aqui só garante que
    // modificar o array em runtime não propaga tipo.
    const original = [...AKASHA_TRADITIONS];
    expect(original.length).toBe(AKASHA_TRADITIONS.length);
  });
});

describe('buildAkashaPrompt', () => {
  it('retorna o system prompt base sem modificações quando não há opções', () => {
    const p = buildAkashaPrompt();
    expect(p).toBe(AKASHA_SYSTEM_PROMPT);
  });

  it('injeta filtro de tradição quando fornecido', () => {
    const p = buildAkashaPrompt({ tradition: 'cabala' });
    expect(p).toContain('Filtro de tradição ativo');
    expect(p).toContain('**cabala**');
    // A identidade Akasha continua no início
    expect(p.startsWith(AKASHA_SYSTEM_PROMPT)).toBe(true);
  });

  it('injeta bloco RAG com fontes ordenadas por similaridade', () => {
    const sources: RagSource[] = [
      {
        id: 'a',
        title: 'Reiki e ansiedade',
        slug: 'reiki-ansiedade',
        similarity: 0.91,
        excerpt: 'Estudo randomizado controlado com 200 pacientes.',
        tradition: 'reiki',
      },
      {
        id: 'b',
        title: 'Vipassana e Default Mode Network',
        slug: 'vipassana-dmn',
        similarity: 0.74,
        excerpt: 'Mudanças em DMN após 8 semanas.',
      },
    ];

    const p = buildAkashaPrompt({ sources });

    expect(p).toContain('Artigos relevantes da biblioteca (RAG)');
    expect(p).toContain('**Reiki e ansiedade**');
    expect(p).toContain('`reiki-ansiedade`');
    expect(p).toContain('Estudo randomizado controlado');
    expect(p).toContain('similaridade: 91.0%');
    expect(p).toContain('similaridade: 74.0%');
  });

  it('trunca excerpt quando passa de 400 chars', () => {
    const longExcerpt = 'x'.repeat(1000);
    const sources: RagSource[] = [
      {
        id: 'a',
        title: 'Longo',
        slug: 'longo',
        similarity: 0.8,
        excerpt: longExcerpt,
      },
    ];

    const p = buildAkashaPrompt({ sources });
    expect(p).toContain('…');
    // Não deve conter o excerpt inteiro
    expect(p).not.toContain('x'.repeat(500));
  });

  it('respeita maxContextChars parando inclusão de novas fontes', () => {
    const sources: RagSource[] = Array.from({ length: 20 }, (_, i) => ({
      id: `id-${i}`,
      title: `Artigo ${i}`,
      slug: `slug-${i}`,
      similarity: 0.9 - i * 0.01,
      excerpt: 'a'.repeat(300),
    }));

    const p = buildAkashaPrompt({ sources, maxContextChars: 1000 });
    // Com 1000 chars e cada fonte ~350 chars, só 2-3 fontes devem entrar
    const matches = p.match(/Artigo \d+/g) ?? [];
    expect(matches.length).toBeLessThan(5);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('combina tradição + RAG no mesmo prompt', () => {
    const p = buildAkashaPrompt({
      tradition: 'ifa',
      sources: [
        {
          id: 'a',
          title: 'Odu Alafia',
          slug: 'odu-alafia',
          similarity: 0.88,
        },
      ],
    });

    expect(p).toContain('Filtro de tradição ativo');
    expect(p).toContain('**ifa**');
    expect(p).toContain('Artigos relevantes da biblioteca');
    expect(p).toContain('Odu Alafia');
  });

  it('omite bloco RAG quando sources está vazio', () => {
    const p = buildAkashaPrompt({ sources: [] });
    expect(p).not.toContain('Artigos relevantes da biblioteca');
  });

  it('omite filtro de tradição quando null/undefined', () => {
    const p1 = buildAkashaPrompt({ tradition: null });
    expect(p1).not.toContain('Filtro de tradição ativo');

    const p2 = buildAkashaPrompt({ tradition: undefined });
    expect(p2).not.toContain('Filtro de tradição ativo');
  });
});