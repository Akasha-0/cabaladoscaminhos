import { describe, it, expect } from 'vitest';
import {
  getElementOdu,
  getOduElement,
  getAllElementOdus,
  getAllElements,
  hasElementOdu,
  getOdusForElement,
  getOduByNumber,
  ELEMENT_ODU_MAPPINGS,
  type ElementOduMapping,
  type Elemento,
  type OduInfo,
} from '@/lib/correlation/element-odu';

describe('element-odu', () => {
  // ─── ELEMENT_ODU_MAPPINGS: all 4 elements ───────────────────────────────────
  describe('ELEMENT_ODU_MAPPINGS', () => {
    it('contains all 4 elements', () => {
      const elements: Elemento[] = ['Fogo', 'Água', 'Ar', 'Terra'];
      elements.forEach((el) => {
        expect(ELEMENT_ODU_MAPPINGS[el]).toBeDefined();
      });
      expect(Object.keys(ELEMENT_ODU_MAPPINGS)).toHaveLength(4);
    });

    it('Fogo maps to Ejilsebora with correct properties', () => {
      const fogo = ELEMENT_ODU_MAPPINGS['Fogo'];
      expect(fogo.odu_principal.nome).toBe('Ejilsebora');
      expect(fogo.odu_principal.numero).toBe(12);
      expect(fogo.orixa).toBe('Xangô');
      expect(fogo.qualidades.temperatura).toBe('Quente');
      expect(fogo.qualidades.umidade).toBe('Seco');
      expect(fogo.qualidades.polaridade).toBe('Yang');
      expect(fogo.dia_sagrado).toContain('Quarta-feira');
      expect(fogo.cores).toContain('Vermelho');
      expect(fogo.chakra).toBe('3º Plexo Solar');
      expect(fogo.sephirah).toBe('Tiphereth');
    });

    it('Água maps to Ofun with correct properties', () => {
      const agua = ELEMENT_ODU_MAPPINGS['Água'];
      expect(agua.odu_principal.nome).toBe('Ofun');
      expect(agua.odu_principal.numero).toBe(10);
      expect(agua.orixa).toBe('Iemanjá');
      expect(agua.qualidades.temperatura).toBe('Frio');
      expect(agua.qualidades.umidade).toBe('Úmido');
      expect(agua.qualidades.polaridade).toBe('Yin');
      expect(agua.dia_sagrado).toContain('Segunda-feira');
      expect(agua.cores).toContain('Azul Escuro');
      expect(agua.chakra).toBe('6º Frontal');
      expect(agua.sephirah).toBe('Yesod');
    });

    it('Ar maps to Alafia with correct properties', () => {
      const ar = ELEMENT_ODU_MAPPINGS['Ar'];
      expect(ar.odu_principal.nome).toBe('Alafia');
      expect(ar.odu_principal.numero).toBe(16);
      expect(ar.orixa).toBe('Oxumaré');
      expect(ar.qualidades.temperatura).toBe('Neutro');
      expect(ar.qualidades.umidade).toBe('Seco');
      expect(ar.qualidades.polaridade).toBe('Equilibrado');
      expect(ar.dia_sagrado).toContain('Quarta-feira');
      expect(ar.cores).toContain('Amarelo');
      expect(ar.chakra).toBe('5º Laríngeo');
      expect(ar.sephirah).toBe('Hod');
    });

    it('Terra maps to Okaran with correct properties', () => {
      const terra = ELEMENT_ODU_MAPPINGS['Terra'];
      expect(terra.odu_principal.nome).toBe('Okaran');
      expect(terra.odu_principal.numero).toBe(1);
      expect(terra.orixa).toBe('Omolu');
      expect(terra.qualidades.temperatura).toBe('Frio');
      expect(terra.qualidades.umidade).toBe('Seco');
      expect(terra.qualidades.polaridade).toBe('Yin');
      expect(terra.dia_sagrado).toBe('Segunda-feira');
      expect(terra.cores).toContain('Preto');
      expect(terra.chakra).toBe('1º Básico');
      expect(terra.sephirah).toBe('Malkuth');
    });

    it('each element has secondary Odu(s)', () => {
      const elements: Elemento[] = ['Fogo', 'Água', 'Ar', 'Terra'];
      elements.forEach((el) => {
        const mapping = ELEMENT_ODU_MAPPINGS[el];
        expect(mapping.odus_secundarios.length).toBeGreaterThan(0);
        mapping.odus_secundarios.forEach((odu) => {
          expect(odu.nome).toBeTruthy();
          expect(odu.numero).toBeGreaterThan(0);
          expect(odu.numero).toBeLessThanOrEqual(16);
        });
      });
    });

    it('each element has spiritual associations', () => {
      const elements: Elemento[] = ['Fogo', 'Água', 'Ar', 'Terra'];
      elements.forEach((el) => {
        const mapping = ELEMENT_ODU_MAPPINGS[el];
        expect(mapping.associacoes_espirituais.length).toBeGreaterThan(0);
      });
    });

    it('each element has affinities', () => {
      const elements: Elemento[] = ['Fogo', 'Água', 'Ar', 'Terra'];
      elements.forEach((el) => {
        const mapping = ELEMENT_ODU_MAPPINGS[el];
        expect(mapping.afinidades.length).toBeGreaterThan(0);
      });
    });

    it('each element has ritual associations', () => {
      const elements: Elemento[] = ['Fogo', 'Água', 'Ar', 'Terra'];
      elements.forEach((el) => {
        const mapping = ELEMENT_ODU_MAPPINGS[el];
        expect(mapping.associacoes_rituais).toBeDefined();
        expect(mapping.associacoes_rituais.ebos.length).toBeGreaterThan(0);
        expect(mapping.associacoes_rituais.direcoes.length).toBeGreaterThan(0);
      });
    });
  });

  // ─── getElementOdu: lookup function ─────────────────────────────────────────
  describe('getElementOdu', () => {
    it('returns correct mapping for Fogo', () => {
      const result = getElementOdu('Fogo');
      expect(result).not.toBeNull();
      expect(result!.elemento).toBe('Fogo');
      expect(result!.odu_principal.nome).toBe('Ejilsebora');
      expect(result!.orixa).toBe('Xangô');
    });

    it('returns correct mapping for Água', () => {
      const result = getElementOdu('Água');
      expect(result).not.toBeNull();
      expect(result!.elemento).toBe('Água');
      expect(result!.odu_principal.nome).toBe('Ofun');
      expect(result!.orixa).toBe('Iemanjá');
    });

    it('returns correct mapping for Ar', () => {
      const result = getElementOdu('Ar');
      expect(result).not.toBeNull();
      expect(result!.elemento).toBe('Ar');
      expect(result!.odu_principal.nome).toBe('Alafia');
      expect(result!.orixa).toBe('Oxumaré');
    });

    it('returns correct mapping for Terra', () => {
      const result = getElementOdu('Terra');
      expect(result).not.toBeNull();
      expect(result!.elemento).toBe('Terra');
      expect(result!.odu_principal.nome).toBe('Okaran');
      expect(result!.orixa).toBe('Omolu');
    });


    it('returns null for unknown element', () => {
      const result = getElementOdu('Unknown');
      expect(result).toBeNull();
    });

    it('returns null for empty string', () => {
      const result = getElementOdu('');
      expect(result).toBeNull();
    });
  });

  // ─── getOduElement: reverse lookup ───────────────────────────────────────────
  describe('getOduElement', () => {
    it('returns Fogo for Ejilsebora (principal)', () => {
      const result = getOduElement('Ejilsebora');
      expect(result).toBe('Fogo');
    });

    it('returns Fogo for Obará (secondary)', () => {
      const result = getOduElement('Obará');
      expect(result).toBe('Fogo');
    });

    it('returns Água for Ofun (principal)', () => {
      const result = getOduElement('Ofun');
      expect(result).toBe('Água');
    });

    it('returns Água for Oxé (secondary)', () => {
      const result = getOduElement('Oxé');
      expect(result).toBe('Água');
    });

    it('returns Ar for Alafia (principal)', () => {
      const result = getOduElement('Alafia');
      expect(result).toBe('Ar');
    });

    it('returns Ar for Ejiokô (secondary)', () => {
      const result = getOduElement('Ejiokô');
      expect(result).toBe('Ar');
    });

    it('returns Terra for Okaran (principal)', () => {
      const result = getOduElement('Okaran');
      expect(result).toBe('Terra');
    });

    it('returns Terra for Olobón (secondary)', () => {
      const result = getOduElement('Olobón');
      expect(result).toBe('Terra');
    });

    it('returns null for unknown Odu', () => {
      const result = getOduElement('UnknownOdu');
      expect(result).toBeNull();
    });

    it('returns null for empty string', () => {
      const result = getOduElement('');
      expect(result).toBeNull();
    });
  });

  // ─── getAllElementOdus: collection function ─────────────────────────────────
  describe('getAllElementOdus', () => {
    it('returns all 4 element-Odu mappings', () => {
      const result = getAllElementOdus();
      expect(result).toHaveLength(4);
    });

    it('returns array with correct structure', () => {
      const result = getAllElementOdus();
      result.forEach((mapping) => {
        expect(mapping.elemento).toBeTruthy();
        expect(mapping.odu_principal).toBeTruthy();
        expect(mapping.qualidades).toBeTruthy();
        expect(mapping.orixa).toBeTruthy();
      });
    });

    it('contains all 4 elements', () => {
      const result = getAllElementOdus();
      const elementos = result.map((m) => m.elemento);
      expect(elementos).toContain('Fogo');
      expect(elementos).toContain('Água');
      expect(elementos).toContain('Ar');
      expect(elementos).toContain('Terra');
    });

    it('each mapping has complete data', () => {
      const result = getAllElementOdus();
      result.forEach((mapping) => {
        expect(mapping.dia_sagrado).toBeTruthy();
        expect(mapping.cores.length).toBeGreaterThan(0);
        expect(mapping.chakra).toBeTruthy();
        expect(mapping.sephirah).toBeTruthy();
        expect(mapping.alinhamento_energetico).toBeTruthy();
        expect(mapping.significado_espiritual).toBeTruthy();
        expect(mapping.associacoes_espirituais.length).toBeGreaterThan(0);
        expect(mapping.afinidades.length).toBeGreaterThan(0);
        expect(mapping.associacoes_rituais).toBeTruthy();
      });
    });
  });

  // ─── getAllElements: helper function ────────────────────────────────────────
  describe('getAllElements', () => {
    it('returns all 4 element names', () => {
      const result = getAllElements();
      expect(result).toHaveLength(4);
    });

    it('contains all expected elements', () => {
      const result = getAllElements();
      expect(result).toContain('Fogo');
      expect(result).toContain('Água');
      expect(result).toContain('Ar');
      expect(result).toContain('Terra');
    });
  });

  // ─── hasElementOdu: existence check ─────────────────────────────────────────
  describe('hasElementOdu', () => {
    it('returns true for Fogo', () => {
      expect(hasElementOdu('Fogo')).toBe(true);
    });

    it('returns true for Água', () => {
      expect(hasElementOdu('Água')).toBe(true);
    });

    it('returns true for Ar', () => {
      expect(hasElementOdu('Ar')).toBe(true);
    });

    it('returns true for Terra', () => {
      expect(hasElementOdu('Terra')).toBe(true);
    });

    it('returns false for unknown element', () => {
      expect(hasElementOdu('Unknown')).toBe(false);
    });
  });

  // ─── getOdusForElement: Odu list for element ─────────────────────────────────
  describe('getOdusForElement', () => {
    it('returns all Odu names for Fogo', () => {
      const result = getOdusForElement('Fogo');
      expect(result).toContain('Ejilsebora');
      expect(result).toContain('Obará');
      expect(result).toContain('Etaogundá');
      expect(result).toHaveLength(3);
    });

    it('returns all Odu names for Água', () => {
      const result = getOdusForElement('Água');
      expect(result).toContain('Ofun');
      expect(result).toContain('Oxé');
      expect(result).toContain('Odi');
      expect(result).toHaveLength(3);
    });

    it('returns all Odu names for Ar', () => {
      const result = getOdusForElement('Ar');
      expect(result).toContain('Alafia');
      expect(result).toContain('Ejiokô');
      expect(result).toContain('Ossá');
      expect(result).toHaveLength(3);
    });

    it('returns all Odu names for Terra', () => {
      const result = getOdusForElement('Terra');
      expect(result).toContain('Okaran');
      expect(result).toContain('Olobón');
      expect(result).toContain('Iká');
      expect(result).toHaveLength(3);
    });

    it('returns empty array for unknown element', () => {
      const result = getOdusForElement('Unknown');
      expect(result).toHaveLength(0);
    });
  });

  // ─── getOduByNumber: lookup by Odu number ────────────────────────────────────
  describe('getOduByNumber', () => {
    it('returns Fogo mapping for Odu 12 (Ejilsebora)', () => {
      const result = getOduByNumber(12);
      expect(result).not.toBeNull();
      expect(result!.elemento).toBe('Fogo');
    });

    it('returns Água mapping for Odu 10 (Ofun)', () => {
      const result = getOduByNumber(10);
      expect(result).not.toBeNull();
      expect(result!.elemento).toBe('Água');
    });

    it('returns Ar mapping for Odu 16 (Alafia)', () => {
      const result = getOduByNumber(16);
      expect(result).not.toBeNull();
      expect(result!.elemento).toBe('Ar');
    });

    it('returns Terra mapping for Odu 1 (Okaran)', () => {
      const result = getOduByNumber(1);
      expect(result).not.toBeNull();
      expect(result!.elemento).toBe('Terra');
    });

    it('finds Odu in secondary list', () => {
      // Etaogundá is secondary for Fogo (number 3)
      const result = getOduByNumber(3);
      expect(result).not.toBeNull();
      expect(result!.elemento).toBe('Fogo');
    });

    it('returns null for out-of-range number', () => {
      const result = getOduByNumber(99);
      expect(result).toBeNull();
    });
  });

  // ─── Type exports ───────────────────────────────────────────────────────────
  describe('type exports', () => {
    it('exports Elemento type', () => {
      const element: Elemento = 'Fogo';
      expect(element).toBe('Fogo');
    });

    it('exports OduInfo type', () => {
      const odu: OduInfo = { numero: 1, nome: 'Okaran' };
      expect(odu.numero).toBe(1);
      expect(odu.nome).toBe('Okaran');
    });

    it('exports ElementOduMapping type', () => {
      const mapping: ElementOduMapping = ELEMENT_ODU_MAPPINGS['Fogo'];
      expect(mapping.elemento).toBe('Fogo');
      expect(mapping.odu_principal.numero).toBe(12);
    });
  });
});