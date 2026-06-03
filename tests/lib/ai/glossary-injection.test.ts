import { describe, it, expect } from 'vitest';
import { buildHousePayload, type ClientMaps } from '@/lib/ai/dossier/oracle-prompt-builder';

const mockClientMaps: ClientMaps = {
  fullName: 'Test User',
  birthDate: '1990-01-01',
  astrologyMap: { ascendente: 1, planeta: {} },
  kabalisticMap: {},
  tantricMap: {},
  oduBirth: null,
};

describe('AD-20.2 glossary injection — tiragem_do_dia fields', () => {
  // House 34 = Carta 34 (Os Peixes) + Odu 5 (Oxê)
  const entry = { casa: 34, carta: 34, odu: 5 } as Parameters<typeof buildHousePayload>[1];

  it('Test 1: carta_base is non-empty (card baseMeaning injected)', () => {
    const payload = buildHousePayload(34, entry, mockClientMaps);
    expect(payload.tiragem_do_dia.carta_base).toBeTruthy();
    expect(payload.tiragem_do_dia.carta_base.length).toBeGreaterThan(0);
  });

  it('Test 2: carta_sombra is non-empty (card shadow injected)', () => {
    const payload = buildHousePayload(34, entry, mockClientMaps);
    expect(payload.tiragem_do_dia.carta_sombra).toBeTruthy();
    expect(payload.tiragem_do_dia.carta_sombra.length).toBeGreaterThan(0);
  });

  it('Test 3: odu_essencia is non-empty (odu essence injected)', () => {
    const payload = buildHousePayload(34, entry, mockClientMaps);
    expect(payload.tiragem_do_dia.odu_essencia).toBeTruthy();
    expect(payload.tiragem_do_dia.odu_essencia.length).toBeGreaterThan(0);
  });

  it('Test 4: odu_quizila is non-empty (odu quizila injected)', () => {
    const payload = buildHousePayload(34, entry, mockClientMaps);
    expect(payload.tiragem_do_dia.odu_quizila).toBeTruthy();
    expect(payload.tiragem_do_dia.odu_quizila.length).toBeGreaterThan(0);
  });

  it('Test 5: odu_conselho is non-empty (odu baseAdvice injected)', () => {
    const payload = buildHousePayload(34, entry, mockClientMaps);
    expect(payload.tiragem_do_dia.odu_conselho).toBeTruthy();
    expect(payload.tiragem_do_dia.odu_conselho.length).toBeGreaterThan(0);
  });
});
