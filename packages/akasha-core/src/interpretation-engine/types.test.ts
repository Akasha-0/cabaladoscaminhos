import type { LifeArea } from '@akasha/types';
import { describe, it, expect } from 'vitest';
import type { NumeroLevel, AcaoPratica, NivelContent, NumeroContent } from './types';

// ─── Fixtures de teste ────────────────────────────────────────────────────────

const makeAcaoPratica = (overrides: Partial<AcaoPratica> = {}): AcaoPratica => ({
  amplificar: ['Meditar 10min', 'Respiração consciente'],
  evitar: ['Ficar em telas à noite'],
  ritual: 'Banho de ervas ao pôr do sol',
  ...overrides,
});

const makeNivelContent = (overrides: Partial<NivelContent> = {}): NivelContent => ({
  tituloPool: 'O Visionário',
  significado: 'Você enxerga além do véu',
  padrao: 'Idealizar antes de agir',
  aplicacao: {
    carreira: 'Conecta-se a missões de longo prazo',
    saude: 'Tende a negligenciar o corpo',
  },
  acaoPratica: makeAcaoPratica(),
  afirmacao: 'Eu canalizo visão com presença.',
  ...overrides,
});

const makeNumeroContent = (overrides: Partial<NumeroContent> = {}): NumeroContent => ({
  arquetipoAkasha: 'O Visionário',
  mandato: 'Ver para além e aterrar o que vê.',
  levels: {
    shadow: makeNivelContent({ tituloPool: 'O Iludido' }),
    gift: makeNivelContent({ tituloPool: 'O Visionário' }),
    siddhi: makeNivelContent({ tituloPool: 'O Iluminado' }),
  },
  ...overrides,
});

// ─── Testes: NumeroLevel ──────────────────────────────────────────────────────

describe('NumeroLevel', () => {
  it('aceita os 3 valores canônicos do modelo Akasha', () => {
    const levels: NumeroLevel[] = ['shadow', 'gift', 'siddhi'];
    expect(levels).toHaveLength(3);
    expect(levels).toContain('shadow');
    expect(levels).toContain('gift');
    expect(levels).toContain('siddhi');
  });

  it('rejeita valores fora do modelo (verificado em tempo de compilação)', () => {
    // @ts-expect-error - "awakening" não é um NumeroLevel válido
    const invalid: NumeroLevel = 'awakening';
    expect(invalid).toBe('awakening');
  });
});

// ─── Testes: AcaoPratica ──────────────────────────────────────────────────────

describe('AcaoPratica', () => {
  it('possui os 3 campos obrigatórios: amplificar, evitar, ritual', () => {
    const acao: AcaoPratica = makeAcaoPratica();
    expect(acao).toHaveProperty('amplificar');
    expect(acao).toHaveProperty('evitar');
    expect(acao).toHaveProperty('ritual');
  });

  it('arrays amplificar/evitar podem ser vazios (edge case)', () => {
    const acaoVazia: AcaoPratica = {
      amplificar: [],
      evitar: [],
      ritual: '',
    };
    expect(acaoVazia.amplificar).toHaveLength(0);
    expect(acaoVazia.evitar).toHaveLength(0);
    expect(acaoVazia.ritual).toBe('');
  });
});

// ─── Testes: NivelContent ─────────────────────────────────────────────────────

describe('NivelContent', () => {
  it('possui todos os campos textuais obrigatórios', () => {
    const nivel: NivelContent = makeNivelContent();
    expect(typeof nivel.tituloPool).toBe('string');
    expect(typeof nivel.significado).toBe('string');
    expect(typeof nivel.padrao).toBe('string');
    expect(typeof nivel.afirmacao).toBe('string');
    expect(nivel.tituloPool.length).toBeGreaterThan(0);
    expect(nivel.afirmacao.length).toBeGreaterThan(0);
  });

  it('aplicacao é um Partial<Record<LifeArea, string>> (edge case: sem entradas)', () => {
    const nivelSemAplicacao: NivelContent = makeNivelContent({ aplicacao: {} });
    expect(nivelSemAplicacao.aplicacao).toEqual({});
  });

  it('aplicacao aceita qualquer chave válida de LifeArea', () => {
    const areas: LifeArea[] = [
      'proposito',
      'destino',
      'dons',
      'relacionamentos',
      'sexualidade',
      'carreira',
      'financas',
      'saude',
      'espiritualidade',
    ];
    const aplicacao: Partial<Record<LifeArea, string>> = {};
    areas.forEach((area, idx) => {
      aplicacao[area] = `Interpretação ${idx}`;
    });
    const nivel: NivelContent = makeNivelContent({ aplicacao });
    expect(Object.keys(nivel.aplicacao)).toHaveLength(areas.length);
  });
});

// ─── Testes: NumeroContent ────────────────────────────────────────────────────

describe('NumeroContent', () => {
  it('estrutura levels contém exatamente shadow, gift e siddhi', () => {
    const numero: NumeroContent = makeNumeroContent();
    expect(numero.levels).toHaveProperty('shadow');
    expect(numero.levels).toHaveProperty('gift');
    expect(numero.levels).toHaveProperty('siddhi');
    expect(Object.keys(numero.levels).sort()).toEqual(['gift', 'shadow', 'siddhi']);
  });

  it('arquetipoAkasha e mandato são strings não vazias', () => {
    const numero: NumeroContent = makeNumeroContent();
    expect(typeof numero.arquetipoAkasha).toBe('string');
    expect(typeof numero.mandato).toBe('string');
    expect(numero.arquetipoAkasha.length).toBeGreaterThan(0);
    expect(numero.mandato.length).toBeGreaterThan(0);
  });

  it('campos shadow/gift/siddhi podem divergir entre si (edge case: 3 níveis independentes)', () => {
    const shadow: NivelContent = makeNivelContent({ tituloPool: 'Sombra X' });
    const gift: NivelContent = makeNivelContent({ tituloPool: 'Dom Y' });
    const siddhi: NivelContent = makeNivelContent({ tituloPool: 'Estado Z' });
    const numero: NumeroContent = {
      arquetipoAkasha: 'Arquetipo Teste',
      mandato: 'M',
      levels: { shadow, gift, siddhi },
    };
    expect(numero.levels.shadow.tituloPool).not.toBe(numero.levels.gift.tituloPool);
    expect(numero.levels.gift.tituloPool).not.toBe(numero.levels.siddhi.tituloPool);
    expect(numero.levels.shadow.tituloPool).not.toBe(numero.levels.siddhi.tituloPool);
  });
});
