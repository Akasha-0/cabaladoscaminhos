/**
 * Testes para `botanica/ayahuasca-protocols.ts` (Pilar 6).
 *
 * 3 stages: PreAnamnesis, PostCeremony, ActiveIntegration.
 * Valida: estrutura, eweBaths referenciam IDs válidos do EWE_DATABASE,
 * campos obrigatórios por stage, e non-empty arrays.
 */
import { describe, it, expect } from 'vitest';
import { AYAHUASCA_PROTOCOLS } from './ayahuasca-protocols';
import { EWE_DATABASE } from './ewe-database';
import type { AyahuascaProtocol } from './types';

const VALID_STAGES: AyahuascaProtocol['stage'][] = [
 'PreAnamnesis',
 'PostCeremony',
 'ActiveIntegration',
];

const VALID_EWE_IDS = new Set(EWE_DATABASE.map((e) => e.id));

describe('AYAHUASCA_PROTOCOLS', () => {
 describe('estrutura básica', () => {
  it('tem exatamente 3 stages', () => {
   expect(Object.keys(AYAHUASCA_PROTOCOLS)).toHaveLength(3);
  });

  it('stage values são PreAnamnesis, PostCeremony, ActiveIntegration', () => {
   const stages = Object.values(AYAHUASCA_PROTOCOLS).map((p) => p.stage);
   expect(new Set(stages)).toEqual(new Set(VALID_STAGES));
  });

  it('stage key matches internal stage field', () => {
   (Object.entries(AYAHUASCA_PROTOCOLS) as [keyof typeof AYAHUASCA_PROTOCOLS, AyahuascaProtocol][]).forEach(
    ([key, protocol]) => {
     expect(protocol.stage).toBe(key);
    },
   );
  });
 });

 describe('campos obrigatórios por stage', () => {
  (Object.entries(AYAHUASCA_PROTOCOLS) as [keyof typeof AYAHUASCA_PROTOCOLS, AyahuascaProtocol][]).forEach(
   ([key, protocol]) => {
    it(`${key}: tem recommendations`, () => {
     expect(protocol.recommendations).toBeDefined();
     expect(typeof protocol.recommendations).toBe('object');
    });
    it(`${key}: sombraAreas é array ou undefined`, () => {
     if (protocol.sombraAreas !== undefined) {
      expect(Array.isArray(protocol.sombraAreas)).toBe(true);
     }
    });
   },
  );
 });

 describe('somaticRoutines: non-empty arrays quando presentes', () => {
  (Object.entries(AYAHUASCA_PROTOCOLS) as [keyof typeof AYAHUASCA_PROTOCOLS, AyahuascaProtocol][]).forEach(
   ([key, protocol]) => {
    const routines = protocol.recommendations.somaticRoutines;
    if (routines) {
     it(`${key}: somaticRoutines é array`, () => {
      expect(Array.isArray(routines)).toBe(true);
     });
     it(`${key}: somaticRoutines não-vazio`, () => {
      expect(routines.length).toBeGreaterThan(0);
     });
     routines.forEach((r, i) => {
      it(`${key} routine[${i}]: string não-vazia`, () => {
       expect(typeof r).toBe('string');
       expect(r.trim().length).toBeGreaterThan(0);
      });
     });
    }
   },
  );
 });

 describe('dietaryNotes: non-empty arrays quando presentes', () => {
  (Object.entries(AYAHUASCA_PROTOCOLS) as [keyof typeof AYAHUASCA_PROTOCOLS, AyahuascaProtocol][]).forEach(
   ([key, protocol]) => {
    const notes = protocol.recommendations.dietaryNotes;
    if (notes) {
     it(`${key}: dietaryNotes é array`, () => {
      expect(Array.isArray(notes)).toBe(true);
     });
     it(`${key}: dietaryNotes não-vazio`, () => {
      expect(notes.length).toBeGreaterThan(0);
     });
     notes.forEach((n, i) => {
      it(`${key} note[${i}]: string não-vazia`, () => {
       expect(typeof n).toBe('string');
       expect(n.trim().length).toBeGreaterThan(0);
      });
     });
    }
   },
  );
 });

 describe('integrationNotes: non-empty arrays quando presentes', () => {
  (Object.entries(AYAHUASCA_PROTOCOLS) as [keyof typeof AYAHUASCA_PROTOCOLS, AyahuascaProtocol][]).forEach(
   ([key, protocol]) => {
    const notes = protocol.recommendations.integrationNotes;
    if (notes) {
     it(`${key}: integrationNotes é array`, () => {
      expect(Array.isArray(notes)).toBe(true);
     });
     it(`${key}: integrationNotes não-vazio`, () => {
      expect(notes.length).toBeGreaterThan(0);
     });
     notes.forEach((n, i) => {
      it(`${key} note[${i}]: string não-vazia`, () => {
       expect(typeof n).toBe('string');
       expect(n.trim().length).toBeGreaterThan(0);
      });
     });
    }
   },
  );
 });

 describe('eweBaths referenciam IDs válidos do EWE_DATABASE', () => {
  (Object.entries(AYAHUASCA_PROTOCOLS) as [keyof typeof AYAHUASCA_PROTOCOLS, AyahuascaProtocol][]).forEach(
   ([key, protocol]) => {
    const baths = protocol.recommendations.eweBaths;
    if (baths) {
     baths.forEach((bathId, i) => {
      it(`${key} bath[${i}]: "${bathId}" existe no EWE_DATABASE`, () => {
       expect(VALID_EWE_IDS.has(bathId)).toBe(true);
      });
     });
    }
   },
  );
 });

 describe('reikiPlacements: arrays quando presentes', () => {
  (Object.entries(AYAHUASCA_PROTOCOLS) as [keyof typeof AYAHUASCA_PROTOCOLS, AyahuascaProtocol][]).forEach(
   ([key, protocol]) => {
    const placements = protocol.recommendations.reikiPlacements;
    if (placements) {
     it(`${key}: reikiPlacements é array`, () => {
      expect(Array.isArray(placements)).toBe(true);
     });
     placements.forEach((p, i) => {
      it(`${key} placement[${i}]: string não-vazia`, () => {
       expect(typeof p).toBe('string');
       expect(p.trim().length).toBeGreaterThan(0);
      });
     });
    }
   },
  );
 });

 describe('sombraAreas: contém Casa 8 ou Lilith quando presente', () => {
  (Object.entries(AYAHUASCA_PROTOCOLS) as [keyof typeof AYAHUASCA_PROTOCOLS, AyahuascaProtocol][]).forEach(
   ([key, protocol]) => {
    const areas = protocol.sombraAreas;
    if (areas && areas.length > 0) {
     it(`${key}: sombraAreas inclui Casa 8 ou Lilith`, () => {
      const hasRelevant = areas.some((s) => /Casa ?8|Lilith/i.test(s));
      expect(hasRelevant).toBe(true);
     });
    }
   },
  );
 });

 describe('PreAnamnesis specifics', () => {
  it('PreAnamnesis NÃO tem eweBaths (descarrrego pré-cerimônia)', () => {
   expect(AYAHUASCA_PROTOCOLS.PreAnamnesis.recommendations.eweBaths).toBeUndefined();
  });

  it('PreAnamnesis tem dietaryNotes (jejum, dieta)', () => {
   expect(AYAHUASCA_PROTOCOLS.PreAnamnesis.recommendations.dietaryNotes).toBeDefined();
   expect(AYAHUASCA_PROTOCOLS.PreAnamnesis.recommendations.dietaryNotes!.length).toBeGreaterThan(0);
  });

  it('PreAnamnesis menciona jejum de 12h', () => {
   const dietary = AYAHUASCA_PROTOCOLS.PreAnamnesis.recommendations.dietaryNotes!.join(' ');
   expect(dietary).toMatch(/12h|12 horas|jejum/i);
  });
 });

 describe('PostCeremony specifics', () => {
  it('PostCeremony tem eweBaths (descarrrego pós-cerimônia)', () => {
   expect(AYAHUASCA_PROTOCOLS.PostCeremony.recommendations.eweBaths).toBeDefined();
   expect(AYAHUASCA_PROTOCOLS.PostCeremony.recommendations.eweBaths!.length).toBeGreaterThan(0);
  });

  it('PostCeremony menciona repouso de 24h', () => {
   const somatic = AYAHUASCA_PROTOCOLS.PostCeremony.recommendations.somaticRoutines!.join(' ');
   expect(somatic).toMatch(/24h|24 horas|descanso/i);
  });
 });

 describe('ActiveIntegration specifics', () => {
  it('ActiveIntegration tem eweBaths (manutenção)', () => {
   expect(AYAHUASCA_PROTOCOLS.ActiveIntegration.recommendations.eweBaths).toBeDefined();
   expect(AYAHUASCA_PROTOCOLS.ActiveIntegration.recommendations.eweBaths!.length).toBeGreaterThan(0);
  });

  it('ActiveIntegration recomenda acompanhamento terapêutico', () => {
   const notes = AYAHUASCA_PROTOCOLS.ActiveIntegration.recommendations.integrationNotes!.join(' ');
   expect(notes).toMatch(/acompanhamento|terapêutico|terapia/i);
  });
 });
});
