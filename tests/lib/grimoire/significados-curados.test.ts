/**
 * Testes para a Camada de Significado (F-225)
 *
 * Garante a integridade da base curada PT-BR:
 *   - Todas as chaves de busca funcionam
 *   - Significados ESPECÍFICOS existem para símbolos canônicos
 *   - Fallback para visão genérica funciona
 *   - Cobertura mínima por Pilar
 *   - Campos obrigatórios sempre preenchidos
 *   - Aviso ético Pilar 4 (R-022 §4.4)
 */

import { describe, it, expect } from 'vitest';
import {
  significadoPorPilar,
  significadosDoPilar,
  significadoGenericoDoPilar,
  significadosEspecificos,
  coberturaSignificados,
  type Pilar,
  type SignificadoCurado,
} from '@/lib/grimoire/significados-curados';

const CAMPOS_OBRIGATORIOS: (keyof SignificadoCurado)[] = [
  'id',
  'pilar',
  'titulo',
  'essencia',
  'missao',
  'sombra',
  'pratica',
  'conexao',
  'fonte',
];

describe('significados-curados: helpers básicos', () => {
  it('significadoPorPilar resolve chaves canônicas', () => {
    expect(significadoPorPilar('cabala', 11)?.titulo).toBe('Iluminador · Mestre');
    expect(significadoPorPilar('astrologia', 'Escorpião')?.titulo).toBe('Sol em Escorpião');
    expect(significadoPorPilar('tantrica', 7)?.titulo).toBe('Aura');
    expect(significadoPorPilar('odu', 'Ogbe')?.titulo).toMatch(/Ogbe/i);
    expect(significadoPorPilar('iching', 51)?.titulo).toMatch(/Trovão/);
  });

  it('significadoPorPilar retorna undefined para chave ausente (não quebra)', () => {
    expect(significadoPorPilar('cabala', 999)).toBeUndefined();
    expect(significadoPorPilar('iching', 0)).toBeUndefined();
    expect(significadoPorPilar('astrologia', 'NãoExiste')).toBeUndefined();
  });

  it('significadosDoPilar lista por Pilar', () => {
    const cabala = significadosDoPilar('cabala');
    expect(cabala.length).toBeGreaterThanOrEqual(13); // 13 Life Paths (1-9, 11, 22, 33)
    cabala.forEach((s) => expect(s.pilar).toBe('cabala'));
  });

  it('coberturaSignificados reporta volume por Pilar', () => {
    const cob = coberturaSignificados();
    expect(cob.cabala).toBeGreaterThanOrEqual(13);
    expect(cob.astrologia).toBeGreaterThanOrEqual(12); // signos solar…
    expect(cob.tantrica).toBeGreaterThanOrEqual(11); // 11 corpos
    expect(cob.odu).toBe(16); // 16 Odu canônicos (F-235 — alinhado com ODUS_IFA, Odu 1-16 Ifá)
    expect(cob.iching).toBe(64); // 64 hexagramas King Wen
  });
});

describe('significados-curados: campos obrigatórios', () => {
  const PILARES: Pilar[] = ['cabala', 'astrologia', 'tantrica', 'odu', 'iching'];

  for (const pilar of PILARES) {
    it(`Pilar ${pilar}: nenhuma entrada tem campo vazio`, () => {
      const entries = significadosDoPilar(pilar);
      expect(entries.length).toBeGreaterThan(0);
      entries.forEach((e) => {
        // Demais campos são string obrigatórios (id é number|string)
        const camposString: (keyof SignificadoCurado)[] = [
          'titulo', 'essencia', 'missao', 'sombra', 'pratica', 'conexao', 'fonte',
        ];
        camposString.forEach((c) => {
          const v = e[c];
          expect(
            typeof v === 'string' && v.trim().length > 0,
            `Pilar ${pilar} id ${String(e.id)} campo ${c} vazio`,
          ).toBe(true);
        });
      });
    });
  }
});

describe('significados-curados: ética Pilar 4 (R-022 §4.4)', () => {
  it('todos os Odu carregam requer_terreiro: true', () => {
    const odus = significadosDoPilar('odu');
    expect(odus.length).toBe(16);
    odus.forEach((o) => {
      expect(o.requer_terreiro, `Odu ${o.id} sem requer_terreiro`).toBe(true);
    });
  });

  it('Odu com nome canônico inclui aviso no título/fonte', () => {
    const ogbe = significadoPorPilar('odu', 'Ogbe');
    expect(ogbe).toBeDefined();
    expect(ogbe?.fonte).toMatch(/Verger|Mbiti/);
  });
});
describe('significadosGenericoDoPilar', () => {
  const PILARES: Pilar[] = ['cabala', 'astrologia', 'tantrica', 'odu', 'iching'];

  for (const pilar of PILARES) {
    it(`Pilar ${pilar}: visão genérica tem todos os campos`, () => {
      const v = significadoGenericoDoPilar(pilar);
      CAMPOS_OBRIGATORIOS.forEach((c) => {
        expect(v[c], `genérico ${pilar} sem ${c}`).toBeTruthy();
      });
      expect(v.pilar).toBe(pilar);
    });
  }

  it('Pilar 4 (Odu) visão genérica também marca requer_terreiro', () => {
    const oduGen = significadoGenericoDoPilar('odu');
    expect(oduGen.requer_terreiro).toBe(true);
  });
});

describe('significadosEspecificos: resolve 5 Pilares com fallback', () => {
  it('mapa canônico resolve todos os 5 com Significado ESPECÍFICO', () => {
    const pilares = {
      cabala: { life_path: 11, birthday: 15, expression: 33, ano_pessoal: 5 },
      astrologia: {
        sol_signo: 'Escorpião',
        asc_signo: 'Leão',
        lua_signo: 'Peixes',
        lua_fase: 'minguante' as const,
        trinity: { sombra: 0, dom: 0, graca: 0 },
        trinity_dominante: 'sombra' as const,
      },
      tantrica: {
        corpo_predominante: 7,
        trigemeo: 'mental' as const,
        ciclo_anos: 0,
        temperamento_atual: 'melancolico' as const,
      },
      odu: { odu_principal: 'Ogbe', odu_secundario: null, fonte: 'Ifá' as const, aviso: '' },
      iching: { hexagrama_natal: 1, hexagrama_dia: 51, level: 'gift' as const },
    };

    const sigs = significadosEspecificos(pilares);
    expect(sigs.cabala.titulo).toBe('Iluminador · Mestre');
    expect(sigs.astrologia.titulo).toBe('Sol em Escorpião');
    expect(sigs.tantrica.titulo).toBe('Aura');
    expect(sigs.odu.titulo).toMatch(/Ogbe/);
    expect(sigs.iching.titulo).toMatch(/Trovão/);
  });

  it('mapa com símbolo desconhecido cai na visão genérica do Pilar', () => {
    const pilares = {
      cabala: { life_path: 999, birthday: 0, expression: 0, ano_pessoal: 0 },
      astrologia: {
        sol_signo: 'Invalido',
        asc_signo: null,
        lua_signo: '',
        lua_fase: 'nova' as const,
        trinity: { sombra: 0, dom: 0, graca: 0 },
        trinity_dominante: 'sombra' as const,
      },
      tantrica: {
        corpo_predominante: 99,
        trigemeo: 'fisico' as const,
        ciclo_anos: 0,
        temperamento_atual: 'sanguineo' as const,
      },
      odu: { odu_principal: 'NaoExiste', odu_secundario: null, fonte: 'Ifá' as const, aviso: '' },
      iching: { hexagrama_natal: 0, hexagrama_dia: 999, level: 'shadow' as const },
    };
    const sigs = significadosEspecificos(pilares);
    // Fallback: visão genérica tem id === pilar
    expect(sigs.cabala.id).toBe('cabala');
    expect(sigs.astrologia.id).toBe('astrologia');
    expect(sigs.tantrica.id).toBe('tantrica');
    expect(sigs.odu.id).toBe('odu');
    expect(sigs.iching.id).toBe('iching');
  });
});

describe('significados-curados: cobertura por sistema canônico', () => {
  it('16 Odu canônicos (Odu 1-16 em ordem Ifá)', () => {
    // F-235: IDs alinhados com ODUS_IFA em @akasha/core-odus/odus-ifa-data.ts.
    const esperam = [
      'Ogbe', 'Ejiokô', 'Etogundá', 'Irosun', 'Oxê', 'Obará', 'Odi',
      'Ejionile', 'Ossá', 'Ofun', 'Owonrin', 'Ejilaxebô', 'Oturupon',
      'Oturá', 'Iká', 'Ofurufu',
    ];
    const odus = significadosDoPilar('odu');
    esperam.forEach((nome) => {
      expect(odus.some((o) => String(o.id) === nome), `Odu ${nome} ausente`).toBe(true);
    });
  });

  it('64 hexagramas (1-64 King Wen) presentes', () => {
    const ich = significadosDoPilar('iching');
    for (let n = 1; n <= 64; n++) {
      expect(ich.some((h) => h.id === n), `Hexagrama ${n} ausente`).toBe(true);
    }
  });

  it('13 Life Paths (1-9, 11, 22, 33) presentes', () => {
    const lp = significadosDoPilar('cabala').filter((c) => !c.titulo.startsWith('Talento') &&
      !c.titulo.startsWith('Expressão') && !c.titulo.startsWith('Ano'));
    const esperam = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];
    esperam.forEach((n) => {
      expect(lp.some((c) => c.id === n), `Life Path ${n} ausente`).toBe(true);
    });
  });
});
