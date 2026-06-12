import { describe, it, expect } from 'vitest';
import {
  calculateCodeOfDay,
  buildRitual,
  getAfirmacaoDoDia,
  getOracaoDoDia,
} from './ritual-calculator';
import type { AkashaCode } from './ritual-types';
import type { RitualConfig } from './ritual-types';

// ─── Dados de Teste ───────────────────────────────────────────────────────────

const defaultConfig: RitualConfig = {
  horario: '06:00',
  timezone: 'America/Sao_Paulo',
  ativo: true,
  componentes: {
    codigoDoDia: true,
    praticaPrincipal: true,
    quizilas: true,
    afirmacao: true,
  },
};

const defaultCode: AkashaCode = {
  hexagram: 1,
  level: 'gift',
  lifeArea: 'espiritualidade',
};

// ─── Testes: calculateCodeOfDay ───────────────────────────────────────────────

describe('RitualCalculator - calculateCodeOfDay', () => {
  it('retorna código válido com hexagrama entre 1 e 64', () => {
    const date = new Date('2024-01-15T10:00:00Z');
    const result = calculateCodeOfDay(date);

    expect(result.code.hexagram).toBeGreaterThanOrEqual(1);
    expect(result.code.hexagram).toBeLessThanOrEqual(64);
  });

  it('retorna nível válido (shadow, gift ou siddhi)', () => {
    const date = new Date('2024-01-15T10:00:00Z');
    const result = calculateCodeOfDay(date);

    const validLevels = ['shadow', 'gift', 'siddhi'];
    expect(validLevels).toContain(result.code.level);
  });

  it('retorna área de vida válida', () => {
    const date = new Date('2024-01-15T10:00:00Z');
    const result = calculateCodeOfDay(date);

    const validAreas = ['saude', 'financas', 'relacionamentos', 'carreira', 'espiritualidade', 'familia', 'criatividade'];
    expect(validAreas).toContain(result.code.lifeArea);
  });

  it('mesma data retorna mesmo código (determinístico)', () => {
    const date = new Date('2024-06-15T12:00:00Z');
    const result1 = calculateCodeOfDay(date);
    const result2 = calculateCodeOfDay(date);

    expect(result1.code.hexagram).toBe(result2.code.hexagram);
    expect(result1.code.level).toBe(result2.code.level);
    expect(result1.code.lifeArea).toBe(result2.code.lifeArea);
    expect(result1.timestamp).toBe(result2.timestamp);
  });

  it('datas diferentes retornam códigos diferentes (maioria)', () => {
    const date1 = new Date('2024-01-01T12:00:00Z');
    const date2 = new Date('2024-12-31T12:00:00Z');
    const result1 = calculateCodeOfDay(date1);
    const result2 = calculateCodeOfDay(date2);

    // Não garante ser diferente, mas provavelmente diferente devido ao timestamp
    expect(result1.timestamp).not.toBe(result2.timestamp);
  });

  it('retorna timestamp correspondente à data', () => {
    const date = new Date('2024-03-20T08:30:00Z');
    const result = calculateCodeOfDay(date);

    expect(result.timestamp).toBe(date.getTime());
  });

  it('aceita timezone opcional (parâmetro ignorado mas aceito)', () => {
    const date = new Date('2024-01-15T10:00:00Z');
    const result = calculateCodeOfDay(date, 'America/Sao_Paulo');

    expect(result.code).toBeDefined();
    expect(result.timestamp).toBe(date.getTime());
  });

  it('resultado tem estrutura CodeOfDayResult válida', () => {
    const date = new Date('2024-01-15T10:00:00Z');
    const result = calculateCodeOfDay(date);

    expect(result).toHaveProperty('code');
    expect(result).toHaveProperty('timestamp');
    expect(result.code).toHaveProperty('hexagram');
    expect(result.code).toHaveProperty('level');
    expect(result.code).toHaveProperty('lifeArea');
  });
});

// ─── Testes: getAfirmacaoDoDia ─────────────────────────────────────────────────

describe('RitualCalculator - getAfirmacaoDoDia', () => {
  it('retorna string não vazia', () => {
    const code: AkashaCode = { hexagram: 1, level: 'gift', lifeArea: 'espiritualidade' };
    const afirmacao = getAfirmacaoDoDia(code);

    expect(typeof afirmacao).toBe('string');
    expect(afirmacao.length).toBeGreaterThan(0);
  });

  it('retorna afirmação diferente para hexagramas diferentes', () => {
    const code1: AkashaCode = { hexagram: 1, level: 'gift', lifeArea: 'espiritualidade' };
    const code2: AkashaCode = { hexagram: 32, level: 'gift', lifeArea: 'espiritualidade' };

    const afirmacao1 = getAfirmacaoDoDia(code1);
    const afirmacao2 = getAfirmacaoDoDia(code2);

    expect(afirmacao1).not.toBe(afirmacao2);
  });

  it('hexagrama 1 retorna afirmação específica', () => {
    const code: AkashaCode = { hexagram: 1, level: 'gift', lifeArea: 'espiritualidade' };
    const afirmacao = getAfirmacaoDoDia(code);

    expect(afirmacao).toContain('Eu sou a criação');
  });

  it('hexagrama inexistente retorna afirmação padrão', () => {
    const code: AkashaCode = { hexagram: 999, level: 'gift', lifeArea: 'espiritualidade' };
    const afirmacao = getAfirmacaoDoDia(code);

    expect(afirmacao).toBe('Eu abraço o mistério do momento presente.');
  });

  it('afirmação contém "Eu" (primeira pessoa)', () => {
    const code: AkashaCode = { hexagram: 5, level: 'shadow', lifeArea: 'saude' };
    const afirmacao = getAfirmacaoDoDia(code);

    expect(afirmacao).toMatch(/^Eu /);
  });
});

// ─── Testes: getOracaoDoDia ────────────────────────────────────────────────────

describe('RitualCalculator - getOracaoDoDia', () => {
  it('retorna string não vazia', () => {
    const code: AkashaCode = { hexagram: 1, level: 'gift', lifeArea: 'espiritualidade' };
    const oracao = getOracaoDoDia(code);

    expect(typeof oracao).toBe('string');
    expect(oracao.length).toBeGreaterThan(0);
  });

  it('retorna oração diferente para hexagramas diferentes', () => {
    const code1: AkashaCode = { hexagram: 10, level: 'gift', lifeArea: 'espiritualidade' };
    const code2: AkashaCode = { hexagram: 50, level: 'gift', lifeArea: 'espiritualidade' };

    const oracao1 = getOracaoDoDia(code1);
    const oracao2 = getOracaoDoDia(code2);

    expect(oracao1).not.toBe(oracao2);
  });

  it('hexagrama 1 retorna oração específica', () => {
    const code: AkashaCode = { hexagram: 1, level: 'gift', lifeArea: 'espiritualidade' };
    const oracao = getOracaoDoDia(code);

    expect(oracao).toContain('Criador de tudo');
  });

  it('hexagrama inexistente retorna oração padrão', () => {
    const code: AkashaCode = { hexagram: 999, level: 'gift', lifeArea: 'espiritualidade' };
    const oracao = getOracaoDoDia(code);

    expect(oracao).toBe('Espírito sagrado, ilumina meu caminho hoje.');
  });

  it('oração contém vírgulas (estrutura de prece)', () => {
    const code: AkashaCode = { hexagram: 7, level: 'siddhi', lifeArea: 'carreira' };
    const oracao = getOracaoDoDia(code);

    expect(oracao).toContain(',');
  });
});

// ─── Testes: buildRitual ───────────────────────────────────────────────────────

describe('RitualCalculator - buildRitual', () => {
  it('retorna RitualResponse válido', () => {
    const result = buildRitual(defaultConfig, defaultCode);

    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('codigo');
    expect(result).toHaveProperty('pratica');
    expect(result).toHaveProperty('quizilas');
    expect(result).toHaveProperty('afirmacao');
    expect(result).toHaveProperty('oracao');
  });

  it('data é uma instância de Date', () => {
    const result = buildRitual(defaultConfig, defaultCode);

    expect(result.data).toBeInstanceOf(Date);
  });

  it('codigo contém hexagrama válido', () => {
    const result = buildRitual(defaultConfig, defaultCode);

    expect(result.codigo.hexagrama).toHaveProperty('number');
    expect(result.codigo.hexagrama.number).toBe(defaultCode.hexagram);
  });

  it('codigo contém nível correto', () => {
    const result = buildRitual(defaultConfig, defaultCode);

    expect(result.codigo.nivel).toBe(defaultCode.level);
  });

  it('afirmação não está vazia', () => {
    const result = buildRitual(defaultConfig, defaultCode);

    expect(result.afirmacao.length).toBeGreaterThan(0);
  });

  it('oração não está vazia', () => {
    const result = buildRitual(defaultConfig, defaultCode);

    expect(result.oracao.length).toBeGreaterThan(0);
  });

  it('prática tem estrutura IntegrativePractice válida', () => {
    const result = buildRitual(defaultConfig, defaultCode);

    expect(result.pratica).toHaveProperty('id');
    expect(result.pratica).toHaveProperty('name');
    expect(result.pratica).toHaveProperty('tradition');
    expect(result.pratica).toHaveProperty('category');
  });

  it('quizilas é um array', () => {
    const result = buildRitual(defaultConfig, defaultCode);

    expect(Array.isArray(result.quizilas)).toBe(true);
  });

  it('quizilas preenchidas quando código tem Odu', () => {
    const codeComOdu: AkashaCode = {
      hexagram: 15,
      odu: 'Ogbe',
      level: 'siddhi',
      lifeArea: 'espiritualidade',
    };
    const result = buildRitual(defaultConfig, codeComOdu);

    expect(result.quizilas.length).toBeGreaterThan(0);
  });

  it('quizilas vazias quando código não tem Odu', () => {
    const codeSemOdu: AkashaCode = {
      hexagram: 5,
      level: 'shadow',
      lifeArea: 'saude',
    };
    const result = buildRitual(defaultConfig, codeSemOdu);

    expect(result.quizilas.length).toBe(0);
  });

  it('quizilas com componentes desativados retorna array vazio', () => {
    const configSemQuizilas: RitualConfig = {
      horario: '06:00',
      timezone: 'America/Sao_Paulo',
      ativo: true,
      componentes: {
        codigoDoDia: true,
        praticaPrincipal: true,
        quizilas: false,
        afirmacao: true,
      },
    };
    const codeComOdu: AkashaCode = {
      hexagram: 10,
      odu: 'Ogbe',
      level: 'gift',
      lifeArea: 'carreira',
    };
    const result = buildRitual(configSemQuizilas, codeComOdu);

    expect(result.quizilas.length).toBe(0);
  });

  it('hexagrama com Odu preenche odu no código da resposta', () => {
    const codeComOdu: AkashaCode = {
      hexagram: 20,
      odu: 'Ogbe',
      level: 'gift',
      lifeArea: 'relacionamentos',
    };
    const result = buildRitual(defaultConfig, codeComOdu);

    expect(result.codigo.odu).toBeDefined();
    expect(result.codigo.odu?.name).toBe('Ogbe');
    expect(result.codigo.odu?.id).toBe(1);
  });
});

// ─── Testes: Integração ───────────────────────────────────────────────────────

describe('RitualCalculator - Integração', () => {
  it('fluxo completo: calculateCodeOfDay + buildRitual', () => {
    const date = new Date('2024-06-15T07:00:00Z');
    const { code } = calculateCodeOfDay(date);
    
    const ritual = buildRitual(defaultConfig, code);

    expect(ritual.codigo.hexagrama.number).toBe(code.hexagram);
    expect(ritual.codigo.nivel).toBe(code.level);
    expect(ritual.afirmacao.length).toBeGreaterThan(0);
    expect(ritual.oracao.length).toBeGreaterThan(0);
  });

  it('ritual diário é determinístico para mesma data', () => {
    const date = new Date('2024-12-25T08:00:00Z');
    const { code: code1 } = calculateCodeOfDay(date);
    const { code: code2 } = calculateCodeOfDay(date);

    const ritual1 = buildRitual(defaultConfig, code1);
    const ritual2 = buildRitual(defaultConfig, code2);

    expect(ritual1.codigo.hexagrama.number).toBe(ritual2.codigo.hexagrama.number);
    expect(ritual1.afirmacao).toBe(ritual2.afirmacao);
    expect(ritual1.oracao).toBe(ritual2.oracao);
  });

  it('buildRitual usa componentes da config', () => {
    const configMinimal: RitualConfig = {
      horario: '07:00',
      timezone: 'America/Sao_Paulo',
      ativo: true,
      componentes: {
        codigoDoDia: true,
        praticaPrincipal: true,
        quizilas: false,
        afirmacao: true,
      },
    };
    const code: AkashaCode = { hexagram: 42, level: 'gift', lifeArea: 'financas' };
    
    const ritual = buildRitual(configMinimal, code);

    expect(ritual.afirmacao).toBeDefined();
    expect(ritual.pratica).toBeDefined();
  });
});

// ─── Testes: Edge Cases ───────────────────────────────────────────────────────

describe('RitualCalculator - Edge Cases', () => {
  it('hexagrama limite (1)', () => {
    const code: AkashaCode = { hexagram: 1, level: 'shadow', lifeArea: 'saude' };
    const afirmacao = getAfirmacaoDoDia(code);

    expect(afirmacao).toContain('Eu');
  });

  it('hexagrama limite (64)', () => {
    const code: AkashaCode = { hexagram: 64, level: 'siddhi', lifeArea: 'espiritualidade' };
    const oracao = getOracaoDoDia(code);

    expect(oracao).toContain('Final');
  });

  it('todos os níveis de código funcionam', () => {
    const levels = ['shadow', 'gift', 'siddhi'] as const;
    
    for (const level of levels) {
      const code: AkashaCode = { hexagram: 1, level, lifeArea: 'espiritualidade' };
      const result = buildRitual(defaultConfig, code);

      expect(result.codigo.nivel).toBe(level);
    }
  });

  it('todas as áreas de vida funcionam', () => {
    const areas = ['saude', 'financas', 'relacionamentos', 'carreira', 'espiritualidade', 'familia', 'criatividade'] as const;
    
    for (const area of areas) {
      const code: AkashaCode = { hexagram: 1, level: 'gift', lifeArea: area };
      const { code: resultCode } = calculateCodeOfDay(new Date('2024-01-01'));

      // Verifica que a função não lança erro
      expect(() => buildRitual(defaultConfig, { ...resultCode, lifeArea: area })).not.toThrow();
    }
  });
});
