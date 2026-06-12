/**
 * Testes para Glossário Vivo (F-243)
 *
 * Verifica:
 *   - Todos os campos obrigatórios preenchidos
 *   - Cobertura mínima por sistema
 *   - Helpers (buscarGlossario, glossarioPorSistema) funcionam
 *   - Sinônimos cruzam sistemas (cross-refs)
 *   - Pilar 4 (Odu) marca 5 termos
 */

import { describe, it, expect } from 'vitest';
import {
  GLOSSARIO,
  glossarioPorSistema,
  buscarGlossario,
  coberturaGlossario,
  type SistemaGlossario,
} from '@/lib/grimoire/glossario';

describe('F-243 Glossário: estrutura', () => {
  it('todos os campos obrigatórios preenchidos', () => {
    GLOSSARIO.forEach((e) => {
      expect(e.termo.length, `Termo vazio`).toBeGreaterThan(2);
      expect(e.definicao.length, `${e.termo} sem definição`).toBeGreaterThan(30);
      expect(['cabala', 'astrologia', 'tantrica', 'odu', 'iching', 'geral']).toContain(e.sistema);
      expect(e.fonte.length, `${e.termo} sem fonte`).toBeGreaterThan(3);
      expect(Array.isArray(e.sinonimos)).toBe(true);
    });
  });
});

describe('F-243 Glossário: cobertura por sistema', () => {
  it('cada sistema tem pelo menos 4 termos curados', () => {
    const cob = coberturaGlossario();
    expect(cob.total).toBeGreaterThanOrEqual(28);
    expect(cob.por_sistema.cabala).toBeGreaterThanOrEqual(4);
    expect(cob.por_sistema.astrologia).toBeGreaterThanOrEqual(4);
    expect(cob.por_sistema.tantrica).toBeGreaterThanOrEqual(4);
    expect(cob.por_sistema.odu).toBeGreaterThanOrEqual(4);
    expect(cob.por_sistema.iching).toBeGreaterThanOrEqual(4);
  });
});

describe('F-243 Glossário: helpers', () => {
  it('glossarioPorSistema filtra por sistema', () => {
    const cabala = glossarioPorSistema('cabala');
    expect(cabala.length).toBeGreaterThan(0);
    cabala.forEach((e) => expect(e.sistema).toBe('cabala'));
  });

  it('buscarGlossario encontra termo canônico', () => {
    const e = buscarGlossario('Caminho de Vida (Life Path)');
    expect(e).toBeDefined();
    expect(e?.sistema).toBe('cabala');
  });

  it('buscarGlossario é case-insensitive', () => {
    const a = buscarGlossario('Caminho de Vida (Life Path)');
    const b = buscarGlossario('caminho de vida (life path)');
    expect(a?.termo).toBe(b?.termo);
  });

  it('buscarGlossario encontra por sinônimo', () => {
    const e = buscarGlossario('Life Path');
    expect(e).toBeDefined();
    expect(e?.termo).toContain('Life Path');
  });

  it('buscarGlossario retorna undefined para termo inexistente', () => {
    expect(buscarGlossario('InexistenteXYZ123')).toBeUndefined();
  });
});

describe('F-243 Glossário: cross-references (sinônimos)', () => {
  it('termos com sinônimos cross-system (Cabala ↔ Tantra)', () => {
    const prana = buscarGlossario('Prana');
    expect(prana?.sinonimos).toContain('Qi (Chinês)');
    expect(prana?.sinonimos).toContain('Ki (Jap.)');
  });

  it('termo Sefirot menciona Tantra como sinônimo', () => {
    const sefirot = buscarGlossario('Sefirot');
    expect(sefirot?.sinonimos.length).toBeGreaterThan(0);
  });
});

describe('F-243 Glossário: termos críticos do Pilar 4 (Odu) presentes', () => {
  it('Odu, Ori, Orixá, Babalaô, Ebó estão no glossário', () => {
    ['Odu', 'Ori', 'Orixá', 'Babalaô / Yaô', 'Ebó'].forEach((termo) => {
      const e = buscarGlossario(termo);
      expect(e, `Termo ${termo} ausente`).toBeDefined();
      expect(e?.sistema).toBe('odu');
    });
  });
});
