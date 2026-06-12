/**
 * Testes para F-233 — RAG do Grimório
 *
 * O RAG injeta Significados + Insight + Áreas + Conexões no system prompt
 * do Mentor IA. Verifica:
 *   - Estrutura: 5 seções presentes (Insight, Significados, Áreas, Conexões, Ética)
 *   - Pilar 4 (Odu) marcado como ⚠ em todas as 8 Áreas + 8 Conexões
 *   - Versão defensiva (UserMapsLike) tolera campos ausentes
 *   - RAG inclui INSTRUÇÕES ÉTICAS (CVV 188, R-022)
 */

import { describe, it, expect } from 'vitest';
import {
  ragForPilares,
  ragForUserMaps,
  type UserMapsLike,
} from '@/lib/grimoire/rag-mapa';
import type { PilaresDados } from '@/lib/grimoire/significados-curados';

function stubPilares(overrides?: Partial<PilaresDados>): PilaresDados {
  return {
    cabala: {
      life_path: 11,
      birthday: 15,
      expression: 33,
      ano_pessoal: 5,
    },
    astrologia: {
      sol_signo: 'Escorpião',
      asc_signo: 'Leão',
      lua_signo: 'Peixes',
      lua_fase: 'minguante',
      trinity: { sombra: 0, dom: 0, graca: 0 },
      trinity_dominante: 'sombra',
    },
    tantrica: {
      corpo_predominante: 7,
      trigemeo: 'mental',
      temperamento_atual: 'melancolico',
    },
    odu: {
      odu_principal: 'Ogbe',
      odu_secundario: null,
      fonte: 'Ifá',
    },
    iching: {
      hexagrama_natal: 1,
      hexagrama_dia: 51,
      level: 'gift',
    },
    ...overrides,
  };
}

describe('F-233 RAG: estrutura do RAG', () => {
  it('RAG contém 5 seções principais', () => {
    const rag = ragForPilares(stubPilares());
    expect(rag).toContain('INSIGHT DO DIA');
    expect(rag).toContain('SIGNIFICADO ESPECÍFICO DOS 5 PILARES');
    expect(rag).toContain('ÁREA DA VIDA');
    expect(rag).toContain('COMO OS 5 PILARES SE FALAM ENTRE SI');
    expect(rag).toContain('DIRETRIZES ÉTICAS');
  });

  it('RAG inclui os 5 Pilares com seus Significados', () => {
    const rag = ragForPilares(stubPilares());
    expect(rag).toContain('Cabala');
    expect(rag).toContain('Astrologia');
    expect(rag).toContain('Tântrica');
    expect(rag).toContain('Odu');
    expect(rag).toContain('I Ching');
    expect(rag).toContain('Iluminador'); // Life Path 11
    expect(rag).toContain('Escorpião'); // Sol em Escorpião
    expect(rag).toContain('Aura'); // Corpo 7
    expect(rag).toContain('Ogbe'); // Odu
    expect(rag).toContain('Trovão'); // Hex 51
  });

  it('RAG inclui 8 Áreas da Vida', () => {
    const rag = ragForPilares(stubPilares());
    // AREAS array não tem acentos; o .toUpperCase() mantém o shape
    ['PAZ', 'SAUDE', 'RELACOES', 'DINHEIRO', 'TRABALHO', 'PROPOSITO', 'CRIATIVIDADE', 'ESPIRITUALIDADE'].forEach((a) => {
      expect(rag, `Área ${a} ausente`).toContain(a);
    });
  });

  it('RAG inclui Instruções Éticas (CVV 188 + R-022)', () => {
    const rag = ragForPilares(stubPilares());
    expect(rag).toContain('CVV-188');
    expect(rag).toContain('R-022');
    expect(rag).toContain('babalaô/yaô');
    expect(rag).toContain('crise');
  });

  it('RAG é determinístico (mesmo mapa → mesmo RAG)', () => {
    const r1 = ragForPilares(stubPilares());
    const r2 = ragForPilares(stubPilares());
    expect(r1).toBe(r2);
  });
});

describe('F-233 RAG: ética Pilar 4 (Odu) preservada', () => {
  it('todas as 8 Áreas da vida marcam ⚠ em traduções de Odu', () => {
    const rag = ragForPilares(stubPilares());
    // Esperamos ≥8 menções a "**Odu** ⚠" (uma por área; pode ter extras
    // no SignificadoEmbed ou nas Conexões que falam de Odu)
    const matches = rag.match(/\*\*Odu\*\* ⚠/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(8);
  });

  it('todas as 4 Conexões saindo de Odu marcam ⚠', () => {
    const rag = ragForPilares(stubPilares());
    // 4 conexões saindo de Odu → outras 4 Pilares
    const matches = rag.match(/Odu → [^\n]+⚠/g) ?? [];
    expect(matches.length).toBe(4);
  });

  it('Significado do Pilar 4 marca "requer terreiro"', () => {
    const rag = ragForPilares(stubPilares());
    expect(rag).toContain('requer terreiro');
  });
});

describe('F-233 RAG: versão defensiva (UserMapsLike)', () => {
  it('tolera mapa vazio (null)', () => {
    const rag = ragForUserMaps(null);
    expect(rag).toContain('mapa do usuário ainda não carregado');
  });

  it('tolera mapa undefined', () => {
    const rag = ragForUserMaps(undefined);
    expect(rag).toContain('mapa do usuário ainda não carregado');
  });

  it('extrai campos do UserMaps (defensivo)', () => {
    const maps: UserMapsLike = {
      cabala: { lifePath: 22, yearNumber: 3 },
      astrology: { sunSign: 'Aquário', ascendant: 'Sagitário', moonPhase: 'cheia' },
      tantra: { soul: 11 },
      odus: { oduName: 'Owonrin' },
      iching: { hexagramNumber: 2, hexagramName: 'Kun' },
    };
    const rag = ragForUserMaps(maps);
    expect(rag).toContain('Construtor'); // LP 22 = Mestre Construtor de Mundos
    expect(rag).toContain('Aquário');
    expect(rag).toContain('Owonrin');
  });

  it('campos opcionais ausentes viram vazios (sem crash)', () => {
    const maps: UserMapsLike = {
      cabala: { lifePath: 1 },
    };
    const rag = ragForUserMaps(maps);
    expect(rag.length).toBeGreaterThan(100);
    // Estrutura mantida
    expect(rag).toContain('INSIGHT DO DIA');
  });
});
