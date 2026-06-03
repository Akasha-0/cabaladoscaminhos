import { describe, it, expect } from 'vitest';
import { routeQuestion, THEME_TAXONOMY } from '@/lib/ai/theme-router';
import {
  buildConsultContext,
  buildConsultSystemPrompt,
  buildConsultUserPayload,
} from '@/lib/ai/dossier/consult-context';
import type { ClientMaps } from '@/lib/ai/dossier/oracle-prompt-builder';
import type { MatrixData } from '@/types';

describe('THEME_TAXONOMY', () => {
  it('todo tema tem casas primárias, aspectos e keywords', () => {
    for (const entry of Object.values(THEME_TAXONOMY)) {
      expect(entry.primaryHouses.length).toBeGreaterThan(0);
      expect(entry.natalAspects.length).toBeGreaterThan(0);
      expect(entry.keywords.length).toBeGreaterThan(0);
    }
  });
});

describe('routeQuestion — roteamento determinístico (Doc 12 §4)', () => {
  it('pergunta sobre amor roteia para a Casa 24 (+ Vênus/Lua)', () => {
    const r = routeQuestion('E quanto à minha vida amorosa?');
    expect(r.themes).toContain('amor');
    expect(r.houses).toContain(24);
    expect(r.natalAspects).toContain('Vênus');
  });

  it('pergunta sobre dinheiro roteia para a Casa 34 (+ 2ª Casa)', () => {
    const r = routeQuestion('Esse dinheiro vem este ano? Minhas finanças vão melhorar?');
    expect(r.themes).toContain('dinheiro');
    expect(r.houses).toContain(34);
    expect(r.natalAspects).toContain('2ª Casa');
  });

  it('é determinístico: mesma pergunta → mesmas casas', () => {
    const q = 'Devo aceitar a proposta de trabalho?';
    expect(routeQuestion(q).houses).toEqual(routeQuestion(q).houses);
    expect(routeQuestion(q).themes).toContain('trabalho');
  });

  it('ignora acentos e pontuação na classificação', () => {
    const r = routeQuestion('FAMÍLIA!!! como anda meu lar?');
    expect(r.themes).toContain('familia');
    expect(r.houses).toContain(4);
  });

  it('sem correspondência → tema geral usa as casas tiradas', () => {
    const r = routeQuestion('xyzzy plugh', [1, 4, 34]);
    expect(r.themes).toEqual(['geral']);
    expect(r.houses).toEqual([1, 4, 34]);
  });

  it('classifica no máximo 3 temas', () => {
    const r = routeQuestion('amor dinheiro trabalho familia saude espiritual');
    expect(r.themes.length).toBeLessThanOrEqual(3);
  });
});

describe('buildConsultContext — RAG fechado (Doc 12 §5)', () => {
  const client: ClientMaps = {
    fullName: 'Maria Silva',
    birthDate: '1990-05-10',
    astrologyMap: {
      ascendant: 'Libra',
      planets: [
        { planet: 'venus', sign: 'Touro', degree: 12, house: 7 },
        { planet: 'moon', sign: 'Peixes', degree: 18, house: 4 },
      ],
      houses: [
        { house: 2, sign: 'Áries', degree: 5 },
        { house: 5, sign: 'Câncer', degree: 22 },
      ],
    },
    kabalisticMap: { motivation: 6, expression: 3 },
    tantricMap: { soul: 1, soulDescription: 'Corpo da Alma', karma: 5, karmaDescription: 'Corpo Físico' },
    oduBirth: { oduNumber: 5, oduName: 'Oxê' },
  };
  const matrix: MatrixData = {
    '24': { carta: 24, cartaName: 'O Coração', odu: 5, oduName: 'Oxê' },
    '34': { carta: 34, cartaName: 'Os Peixes', odu: 6, oduName: 'Obará' },
  };

  it('para pergunta de amor, inclui a Casa 24 tirada com seus aspectos delegados', () => {
    const ctx = buildConsultContext('falar sobre amor e romance', client, matrix);
    expect(ctx.routing.houses).toContain(24);
    const casa24 = ctx.drawnHouses.find((h) => h.casa_numero === 24);
    expect(casa24).toBeDefined();
    expect(casa24!.tiragem_do_dia.carta).toBe('O Coração');
    // delegação: Casa 24 puxa Vênus/Lua/Motivação/Alma — e não vaza outras
    expect(casa24!.dados_natais_consulente.numerologia_cabalistica.valores).toHaveProperty('motivation', 6);
  });

  it('casas roteadas não tiradas entram apenas como contexto natal', () => {
    // 'amor' roteia 24 (tirada), 25 e 29 (não tiradas)
    const ctx = buildConsultContext('amor', client, matrix);
    expect(ctx.natalOnlyHouses).toContain(25);
    expect(ctx.drawnHouses.every((h) => h.casa_numero !== 25)).toBe(true);
  });

  it('extrai do dossiê apenas as casas roteadas', () => {
    const reportHouses = {
      '24': { interpretation: 'Texto da casa 24.', houseName: 'O Coração' },
      '7': { interpretation: 'Texto da casa 7 (não roteada).', houseName: 'A Serpente' },
    };
    const ctx = buildConsultContext('amor', client, matrix, reportHouses);
    expect(ctx.dossierExcerpt).toContain('Casa 24');
    expect(ctx.dossierExcerpt).not.toContain('casa 7 (não roteada)');
  });

  it('o payload do usuário carrega os temas, casas e a instrução de não inventar', () => {
    const ctx = buildConsultContext('amor', client, matrix);
    const payload = buildConsultUserPayload('amor', ctx) as Record<string, unknown>;
    expect(payload.casas_consultadas).toContain(24);
    expect(String(payload.instrucao)).toContain('SOMENTE');
  });
});

describe('buildConsultSystemPrompt — guarda-corpos', () => {
  it('proíbe conhecimento aberto e determinações categóricas', () => {
    const p = buildConsultSystemPrompt();
    expect(p).toContain('EXCLUSIVAMENTE');
    expect(p).toContain('nunca invente');
    expect(p).toContain('médicas, jurídicas ou financeiras');
    expect(p).toContain('Cigano Ramiro');
  });
});
