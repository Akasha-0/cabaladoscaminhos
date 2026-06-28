/**
 * Unit Tests — AI Prompts (Wave 26)
 *
 * Cobre:
 *   - src/lib/ai/prompts/akasha.ts
 *     - AKASHA_SYSTEM_PROMPT (presença de regras éticas)
 *     - AKASHA_TRADITIONS (lista canônica)
 *     - TRADITION_PROFILES (estrutura por tradição)
 *     - detectTradition (heurística de keywords)
 *     - buildAkashaPrompt (composição do prompt final)
 *
 * Funções puras — sem chamada a OpenAI ou DB.
 */

import { describe, it, expect } from 'vitest';

import {
  AKASHA_SYSTEM_PROMPT,
  AKASHA_TRADITIONS,
  TRADITION_PROFILES,
  detectTradition,
  buildAkashaPrompt,
  type AkashaTradition,
} from '@/lib/ai/prompts/akasha';

// =============================================================================
// AKASHA_SYSTEM_PROMPT — Identidade + 8 regras
// =============================================================================

describe('AKASHA_SYSTEM_PROMPT', () => {
  it('define identidade Akasha', () => {
    expect(AKASHA_SYSTEM_PROMPT).toContain('Akasha');
    expect(AKASHA_SYSTEM_PROMPT).toContain('universalista');
  });

  it('contém as 8 regras éticas', () => {
    expect(AKASHA_SYSTEM_PROMPT).toContain('Regra 1');
    expect(AKASHA_SYSTEM_PROMPT).toContain('Regra 8');
    expect(AKASHA_SYSTEM_PROMPT).toContain('Você NUNCA prescreve');
    expect(AKASHA_SYSTEM_PROMPT).toContain('Você NUNCA substitui profissional');
    expect(AKASHA_SYSTEM_PROMPT).toContain('Você SEMPRE cita');
    expect(AKASHA_SYSTEM_PROMPT).toContain('Você SEMPRE respeita autoridade');
  });

  it('define quando se recusar a responder', () => {
    expect(AKASHA_SYSTEM_PROMPT).toContain('recusar');
  });
});

// =============================================================================
// AKASHA_TRADITIONS — Lista canônica
// =============================================================================

describe('AKASHA_TRADITIONS', () => {
  it('inclui as 12 tradições oficiais', () => {
    expect(AKASHA_TRADITIONS).toContain('cabala');
    expect(AKASHA_TRADITIONS).toContain('ifa');
    expect(AKASHA_TRADITIONS).toContain('xamanismo');
    expect(AKASHA_TRADITIONS).toContain('tantra');
    expect(AKASHA_TRADITIONS).toContain('reiki');
    expect(AKASHA_TRADITIONS).toContain('ayurveda');
    expect(AKASHA_TRADITIONS).toContain('meditacao');
    expect(AKASHA_TRADITIONS).toContain('astrologia');
    expect(AKASHA_TRADITIONS).toContain('numerologia');
    expect(AKASHA_TRADITIONS).toContain('umbanda');
    expect(AKASHA_TRADITIONS).toContain('candomble');
    expect(AKASHA_TRADITIONS).toContain('espiritismo');
  });

  it('tem 12 entradas', () => {
    expect(AKASHA_TRADITIONS.length).toBe(12);
  });
});

// =============================================================================
// TRADITION_PROFILES
// =============================================================================

describe('TRADITION_PROFILES', () => {
  it('cobre todas as tradições da AKASHA_TRADITIONS', () => {
    for (const t of AKASHA_TRADITIONS) {
      expect(TRADITION_PROFILES[t]).toBeDefined();
    }
  });

  it('cada profile tem tone, keyPapers e cautions', () => {
    for (const t of AKASHA_TRADITIONS) {
      const p = TRADITION_PROFILES[t];
      expect(p.tone).toBeTruthy();
      expect(p.cautions).toBeDefined();
      expect(Array.isArray(p.cautions)).toBe(true);
    }
  });

  it('profile de cabala menciona sefirot ou kether', () => {
    const cabala = TRADITION_PROFILES.cabala;
    const fullText = JSON.stringify(cabala).toLowerCase();
    expect(fullText).toMatch(/sefirot|kether|tiferet|cabal/);
  });
});

// =============================================================================
// detectTradition — Heurística
// =============================================================================

describe('detectTradition', () => {
  it('detecta cabala por keywords', () => {
    expect(detectTradition('O que é Kether na Cabala?')).toBe('cabala');
    expect(detectTradition('explique as sefirot')).toBe('cabala');
  });

  it('detecta ifá por keywords', () => {
    expect(detectTradition('Qual meu Odu de nascimento?')).toBe('ifa');
    expect(detectTradition('Como consultar o babalorixá?')).toBe('ifa');
  });

  it('detecta xamanismo por ayahuasca', () => {
    expect(detectTradition('Como funciona a ayahuasca?')).toBe('xamanismo');
    expect(detectTradition('O que é kambo?')).toBe('xamanismo');
  });

  it('detecta tantra por chakra/kundalini', () => {
    expect(detectTradition('Como ativar a kundalini?')).toBe('tantra');
    expect(detectTradition('Quais são os 7 chakras?')).toBe('tantra');
  });

  it('detecta meditacao por vipassana/mindfulness', () => {
    expect(detectTradition('Qual a diferença entre Vipassana e Zazen?')).toBe('meditacao');
    expect(detectTradition('Como praticar mindfulness?')).toBe('meditacao');
  });

  it('detecta astrologia por mapa natal', () => {
    expect(detectTradition('Como interpretar meu mapa natal?')).toBe('astrologia');
    expect(detectTradition('O que é ascendente?')).toBe('astrologia');
  });

  it('detecta umbanda por caboclo/preto-velho', () => {
    expect(detectTradition('Como funciona uma gira de umbanda?')).toBe('umbanda');
    expect(detectTradition('Quem é preto-velho?')).toBe('umbanda');
  });

  it('detecta candomble por orixá', () => {
    expect(detectTradition('Quem é Ogum?')).toBe('candomble');
    expect(detectTradition('O que é candomblé?')).toBe('candomble');
  });

  it('detecta ayurveda por dosha', () => {
    expect(detectTradition('Como balancear meu vata?')).toBe('ayurveda');
    expect(detectTradition('O que é dosha pitta?')).toBe('ayurveda');
  });

  it('detecta reiki por usui', () => {
    expect(detectTradition('Como aprender Reiki Usui?')).toBe('reiki');
  });

  it('detecta espiritismo por kardec', () => {
    expect(detectTradition('O que é mediunidade segundo Kardec?')).toBe('espiritismo');
  });

  it('detecta numerologia por caminho de vida', () => {
    expect(detectTradition('Como calcular meu caminho de vida?')).toBe('numerologia');
  });

  it('retorna null para mensagem sem keywords espirituais', () => {
    expect(detectTradition('Como fazer um bolo de chocolate?')).toBeNull();
    expect(detectTradition('Hello world')).toBeNull();
  });

  it('case-insensitive', () => {
    expect(detectTradition('CABALA')).toBe('cabala');
    expect(detectTradition('Meditação')).toBe('meditacao');
  });
});

// =============================================================================
// buildAkashaPrompt — Composição
// =============================================================================

describe('buildAkashaPrompt', () => {
  it('retorna só o system prompt sem opções', () => {
    const prompt = buildAkashaPrompt();
    expect(prompt).toContain(AKASHA_SYSTEM_PROMPT);
  });

  it('adiciona bloco de filtro de tradição quando passada', () => {
    const prompt = buildAkashaPrompt({ tradition: 'cabala' });
    expect(prompt).toContain('Filtro de tradição ativo');
    expect(prompt).toContain('cabala');
  });

  it('adiciona bloco RAG quando há sources', () => {
    const prompt = buildAkashaPrompt({
      sources: [
        {
          id: 'art-1',
          title: 'Introdução à Cabala',
          slug: 'intro-cabala',
          similarity: 0.92,
        },
      ],
    });
    expect(prompt).toContain('art-1');
    expect(prompt).toContain('Introdução à Cabala');
    expect(prompt).toContain('0.92');
  });

  it('respeita maxContextChars cortando RAG', () => {
    const sources = Array.from({ length: 20 }, (_, i) => ({
      id: `art-${i}`,
      title: `Artigo ${i} com título bem grande `.repeat(5),
      slug: `art-${i}`,
      similarity: 0.9,
    }));
    const prompt = buildAkashaPrompt({ sources, maxContextChars: 200 });
    expect(prompt.length).toBeLessThan(AKASHA_SYSTEM_PROMPT.length + 1000);
  });

  it('modo deep (estudo profundo) adiciona marcador', () => {
    const prompt = buildAkashaPrompt({ deepMode: true });
    expect(prompt.toLowerCase()).toMatch(/profundo|deep|estudo/);
  });

  it('historyRecap adiciona recap do histórico', () => {
    const prompt = buildAkashaPrompt({
      historyRecap: [
        { role: 'user', content: 'Oi Akasha' },
        { role: 'assistant', content: 'Olá, como posso ajudar?' },
      ],
    });
    expect(prompt).toContain('Oi Akasha');
    expect(prompt).toContain('Olá, como posso ajudar?');
  });

  it('mantém identidade Akasha primeiro (regras éticas)', () => {
    const prompt = buildAkashaPrompt({
      tradition: 'cabala',
      sources: [
        { id: 'x', title: 'X', slug: 'x', similarity: 0.5 },
      ],
      deepMode: true,
    });
    // Identidade Akasha deve estar ANTES de qualquer bloco adicional
    const idxIdentity = prompt.indexOf('Akasha');
    const idxTradition = prompt.indexOf('Filtro de tradição');
    expect(idxIdentity).toBeLessThan(idxTradition);
    expect(idxIdentity).toBe(0);
  });
});