import { describe, it, expect } from 'vitest';
import type {
  MandatoEsqueleto,
  PilaresDoMandato,
  DailyResponse,
  MandatoDoDiaResponse,
  MentorHook,
  DailyRitualUI,
} from '@/components/akasha/diario/types';

describe('diario/types — MandatoEsqueleto', () => {
  it('constructs with all required fields', () => {
    const mandato: MandatoEsqueleto = {
      escala: 'D',
      pilares_relevantes: ['cabala', 'astrologia'],
      redacao_bruta: 'Some raw text',
      cita_fontes: ['Source A'],
    };
    expect(mandato.escala).toBe('D');
    expect(mandato.pilares_relevantes).toHaveLength(2);
    expect(mandato.redacao_bruta).toBe('Some raw text');
    expect(mandato.cita_fontes).toEqual(['Source A']);
  });

  it('escala accepts only D|S|Z|V', () => {
    const escalaValues: Array<MandatoEsqueleto['escala']> = ['D', 'S', 'Z', 'V'];
    escalaValues.forEach((v) => {
      const mandato: MandatoEsqueleto = {
        escala: v,
        pilares_relevantes: [],
        redacao_bruta: '',
        cita_fontes: [],
      };
      expect(mandato.escala).toBe(v);
    });
  });
});

describe('diario/types — PilaresDoMandato', () => {
  it('constructs with all required pillar data', () => {
    const pilares: PilaresDoMandato = {
      cabala: { life_path: 7, birthday: 15, expression: 3, ano_pessoal: 5 },
      astrologia: {
        sol_signo: 'Aries',
        asc_signo: 'Leo',
        lua_signo: 'Sagittarius',
        lua_fase: 'cheia',
        trinity: { sombra: 2, dom: 5, graca: 8 },
        trinity_dominante: 'dom',
      },
      odu: { odu_principal: 'Ogbe', odu_secundario: 'Iwori', fonte: 'Ifá', aviso: 'Move with caution' },
      iching: { hexagrama_natal: 26, hexagrama_dia: 5, level: 'shadow' },
    };
    expect(pilares.cabala.life_path).toBe(7);
    expect(pilares.astrologia.lua_fase).toBe('cheia');
    expect(pilares.odu.fonte).toBe('Ifá');
    expect(pilares.iching.level).toBe('shadow');
  });

  it('optional fields lilith_signo and casa_8_signo can be omitted', () => {
    const pilares: PilaresDoMandato = {
      cabala: { life_path: 7, birthday: 15, expression: 3, ano_pessoal: 5 },
      astrologia: {
        sol_signo: 'Aries',
        asc_signo: null,
        lua_signo: 'Sagittarius',
        lua_fase: 'nova',
        trinity: { sombra: 1, dom: 4, graca: 9 },
        trinity_dominante: 'graca',
      },
      odu: { odu_principal: 'Ogbe', odu_secundario: null, fonte: 'Candomblé', aviso: 'No warning' },
      iching: { hexagrama_natal: 26, hexagrama_dia: 5, level: 'gift' },
    };
    // lilith_signo and casa_8_signo are absent — this must not cause a type error
    expect(pilares.astrologia.asc_signo).toBeNull();
  });
});

describe('diario/types — DailyResponse', () => {
  it('constructs with required fields', () => {
    const daily: DailyResponse = {
      date: '2026-06-19',
      climate: 'Aurora',
      ritual: { title: 'Morning ritual' },
      alert: 'High tension',
      tensionPoint: { point: 'cardinal' },
      hexagram: 'Hexagram 5',
      hexagramLines: { lines: [] },
      synthesis: { text: 'Integration' },
      cycle: {
        snapshot: {
          birthDate: '1990-01-01',
          currentDate: '2026-06-19',
          age: 36,
          lifePath: 7,
          personalDay: {},
          personalMonth: {},
          personalYear: {},
          universalYear: {},
          currentPinnacle: {},
          karmicLessons: [],
          maturity: {},
          synthesis: 'Synthesis text',
          overallEnergy: 72,
        },
        exercises: {},
        modulation: [],
      },
    };
    expect(daily.date).toBe('2026-06-19');
    expect(daily.climate).toBe('Aurora');
    expect(daily.ritual).toEqual({ title: 'Morning ritual' });
    expect(daily.cycle.snapshot.lifePath).toBe(7);
  });

  it('synthesis may be null', () => {
    const daily: DailyResponse = {
      date: '2026-06-19',
      climate: 'Storm',
      ritual: null,
      alert: '',
      tensionPoint: {},
      hexagram: '',
      hexagramLines: {},
      synthesis: null,
      cycle: {
        snapshot: {
          birthDate: '1990-01-01',
          currentDate: '2026-06-19',
          age: 36,
          lifePath: 7,
          personalDay: {},
          personalMonth: {},
          personalYear: {},
          universalYear: {},
          currentPinnacle: {},
          karmicLessons: [],
          maturity: {},
          synthesis: '',
          overallEnergy: 0,
        },
        exercises: {},
        modulation: [],
      },
    };
    expect(daily.synthesis).toBeNull();
  });
});

describe('diario/types — MandatoDoDiaResponse', () => {
  it('constructs with all nested structures', () => {
    const response: MandatoDoDiaResponse = {
      date: '2026-06-19',
      mandato: {
        escala: 'D',
        pilares_relevantes: ['cabala', 'iching'],
        redacao_bruta: 'Raw mandate text',
        cita_fontes: ['Source 1'],
      },
      pilares: {
        cabala: { life_path: 7, birthday: 15, expression: 3, ano_pessoal: 5 },
        astrologia: {
          sol_signo: 'Aries',
          asc_signo: 'Leo',
          lua_signo: 'Sagittarius',
          lua_fase: 'cheia',
          trinity: { sombra: 2, dom: 5, graca: 8 },
          trinity_dominante: 'dom',
        },
        odu: { odu_principal: 'Ogbe', odu_secundario: null, fonte: 'Ifá', aviso: 'Caution' },
        iching: { hexagrama_natal: 26, hexagrama_dia: 5, level: 'siddhi' },
      },
      mentor_hook: {
        intencao: 'Cultivate patience',
        crise_detectada: true,
        recurso: 'Breathing exercise',
      },
    };
    expect(response.date).toBe('2026-06-19');
    expect(response.mandato.escala).toBe('D');
    expect(response.pilares.iching.level).toBe('siddhi');
    expect(response.mentor_hook.crise_detectada).toBe(true);
  });

  it('pilares_relevantes may be empty', () => {
    const response: MandatoDoDiaResponse = {
      date: '2026-06-19',
      mandato: {
        escala: 'V',
        pilares_relevantes: [],
        redacao_bruta: '',
        cita_fontes: [],
      },
      pilares: {
        cabala: { life_path: 1, birthday: 1, expression: 1, ano_pessoal: 1 },
        astrologia: {
          sol_signo: '',
          asc_signo: null,
          lua_signo: '',
          lua_fase: 'nova',
          trinity: { sombra: 0, dom: 0, graca: 0 },
          trinity_dominante: 'sombra',
        },
        odu: { odu_principal: '', odu_secundario: null, fonte: 'Ifá', aviso: '' },
        iching: { hexagrama_natal: 0, hexagrama_dia: 0, level: 'shadow' },
      },
      mentor_hook: {
        intencao: '',
        crise_detectada: false,
        recurso: null,
      },
    };
    expect(response.mandato.pilares_relevantes).toHaveLength(0);
  });
});
