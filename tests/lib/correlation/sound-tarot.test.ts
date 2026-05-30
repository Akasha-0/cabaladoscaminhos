import { describe, it, expect } from "vitest";
import {
  getSoundTarot,
  getTarotSound,
  getAllSoundTarots,
  getArcanoBySound,
  getArcanoNomeBySound,
  getElementBySound,
  getHealingProperties,
  getPractice,
  getAllSounds,
  getAllArcanoNumbers,
  getAllArcanoNomes,
  hasSoundTarot,
  getSoundsByElement,
  getSoundsByArcano,
} from "@/lib/correlation/sound-tarot";

describe("sound-tarot correlation", () => {
  describe("getSoundTarot", () => {
    it("returns correct mapping for OM (O Louco)", () => {
      const result = getSoundTarot("OM");
      expect(result).toBeDefined();
      expect(result!.som).toBe("OM");
      expect(result!.arcano.numero).toBe(0);
      expect(result!.arcano.nome).toBe("O Louco");
      expect(result!.elemento).toBe("Ar");
      expect(result!.propriedades_cura).toContain("Libertação de medos e bloqueios emocionais");
      expect(result!.practica).toContain("Medite com OM");
    });

    it("returns correct mapping for EIA (A Sacerdotisa)", () => {
      const result = getSoundTarot("EIA");
      expect(result).toBeDefined();
      expect(result!.som).toBe("EIA");
      expect(result!.arcano.numero).toBe(1);
      expect(result!.arcano.nome).toBe("A Sacerdotisa");
      expect(result!.elemento).toBe("Água");
    });

    it("returns correct mapping for OMEGA (A Imperadora)", () => {
      const result = getSoundTarot("OMEGA");
      expect(result).toBeDefined();
      expect(result!.arcano.numero).toBe(2);
      expect(result!.arcano.nome).toBe("A Imperadora");
      expect(result!.elemento).toBe("Terra");
    });

    it("returns correct mapping for AH (O Imperador)", () => {
      const result = getSoundTarot("AH");
      expect(result).toBeDefined();
      expect(result!.arcano.numero).toBe(3);
      expect(result!.arcano.nome).toBe("O Imperador");
      expect(result!.elemento).toBe("Fogo");
    });

    it("returns correct mapping for AUM (Transcendência)", () => {
      const result = getSoundTarot("AUM");
      expect(result).toBeDefined();
      expect(result!.arcano.numero).toBe(20);
      expect(result!.arcano.nome).toBe("Transcendência");
      expect(result!.elemento).toBe("Éter");
    });

    it("returns correct mapping for OMSHANTI (Completude)", () => {
      const result = getSoundTarot("OMSHANTI");
      expect(result).toBeDefined();
      expect(result!.arcano.numero).toBe(21);
      expect(result!.arcano.nome).toBe("Completude");
      expect(result!.elemento).toBe("Éter");
    });

    it("accepts lowercase sound", () => {
      const result = getSoundTarot("om");
      expect(result).toBeDefined();
      expect(result!.som).toBe("OM");
    });

    it("accepts mixed case sound", () => {
      const result = getSoundTarot("Om");
      expect(result).toBeDefined();
      expect(result!.som).toBe("OM");
    });

    it("returns undefined for unknown sound", () => {
      const result = getSoundTarot("UNKNOWN");
      expect(result).toBeUndefined();
    });

    it("returns undefined for empty string", () => {
      const result = getSoundTarot("");
      expect(result).toBeUndefined();
    });
  });

  describe("getTarotSound", () => {
    it("returns correct sound for arcano 0 (O Louco)", () => {
      const result = getTarotSound(0);
      expect(result).toBe("OM");
    });

    it("returns correct sound for arcano 1 (A Sacerdotisa)", () => {
      const result = getTarotSound(1);
      expect(result).toBe("EIA");
    });

    it("returns correct sound for arcano 6 (O Carro)", () => {
      const result = getTarotSound(6);
      expect(result).toBe("RA");
    });

    it("returns correct sound for arcano 14 (A Lua)", () => {
      const result = getTarotSound(14);
      expect(result).toBe("CHAND");
    });

    it("returns correct sound for arcano 15 (O Sol)", () => {
      const result = getTarotSound(15);
      expect(result).toBe("HARE");
    });

    it("returns correct sound for arcano 21 (Completude)", () => {
      const result = getTarotSound(21);
      expect(result).toBe("OMSHANTI");
    });

    it("returns undefined for unknown arcano", () => {
      const result = getTarotSound(99);
      expect(result).toBeUndefined();
    });

    it("returns undefined for negative arcano", () => {
      const result = getTarotSound(-1);
      expect(result).toBeUndefined();
    });
  });

  describe("getAllSoundTarots", () => {
    it("returns array of all mappings", () => {
      const result = getAllSoundTarots();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("returns mappings sorted by arcano number", () => {
      const result = getAllSoundTarots();
      for (let i = 1; i < result.length; i++) {
        expect(result[i].arcano.numero).toBeGreaterThanOrEqual(result[i - 1].arcano.numero);
      }
    });

    it("each mapping has required properties", () => {
      const result = getAllSoundTarots();
      result.forEach((mapping) => {
        expect(mapping.som).toBeDefined();
        expect(mapping.arcano).toBeDefined();
        expect(mapping.arcano.numero).toBeDefined();
        expect(mapping.arcano.nome).toBeDefined();
        expect(mapping.elemento).toBeDefined();
        expect(Array.isArray(mapping.propriedades_cura)).toBe(true);
        expect(mapping.practica).toBeDefined();
      });
    });
  });

  describe("getArcanoBySound", () => {
    it("returns arcano number for known sound", () => {
      expect(getArcanoBySound("OM")).toBe(0);
      expect(getArcanoBySound("EIA")).toBe(1);
      expect(getArcanoBySound("AH")).toBe(3);
      expect(getArcanoBySound("AUM")).toBe(20);
    });

    it("returns undefined for unknown sound", () => {
      expect(getArcanoBySound("UNKNOWN")).toBeUndefined();
    });
  });

  describe("getArcanoNomeBySound", () => {
    it("returns arcano name for known sound", () => {
      expect(getArcanoNomeBySound("OM")).toBe("O Louco");
      expect(getArcanoNomeBySound("EIA")).toBe("A Sacerdotisa");
      expect(getArcanoNomeBySound("RA")).toBe("O Carro");
      expect(getArcanoNomeBySound("YAH")).toBe("A Estrela");
    });

    it("returns undefined for unknown sound", () => {
      expect(getArcanoNomeBySound("UNKNOWN")).toBeUndefined();
    });
  });

  describe("getElementBySound", () => {
    it("returns element for known sound", () => {
      expect(getElementBySound("OM")).toBe("Ar");
      expect(getElementBySound("EIA")).toBe("Água");
      expect(getElementBySound("OMEGA")).toBe("Terra");
      expect(getElementBySound("AH")).toBe("Fogo");
      expect(getElementBySound("AUM")).toBe("Éter");
    });

    it("returns undefined for unknown sound", () => {
      expect(getElementBySound("UNKNOWN")).toBeUndefined();
    });
  });

  describe("getHealingProperties", () => {
    it("returns healing properties array for known sound", () => {
      const result = getHealingProperties("OM");
      expect(Array.isArray(result)).toBe(true);
      expect(result!.length).toBeGreaterThan(0);
      expect(result).toContain("Libertação de medos e bloqueios emocionais");
    });

    it("returns undefined for unknown sound", () => {
      expect(getHealingProperties("UNKNOWN")).toBeUndefined();
    });
  });

  describe("getPractice", () => {
    it("returns practice guidance for known sound", () => {
      const result = getPractice("OM");
      expect(typeof result).toBe("string");
      expect(result).toContain("OM");
    });

    it("returns undefined for unknown sound", () => {
      expect(getPractice("UNKNOWN")).toBeUndefined();
    });
  });

  describe("getAllSounds", () => {
    it("returns array of all sound names", () => {
      const result = getAllSounds();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("contains OM", () => {
      const result = getAllSounds();
      expect(result).toContain("OM");
    });

    it("contains AUM", () => {
      const result = getAllSounds();
      expect(result).toContain("AUM");
    });
  });

  describe("getAllArcanoNumbers", () => {
    it("returns array of arcano numbers", () => {
      const result = getAllArcanoNumbers();
      expect(Array.isArray(result)).toBe(true);
    });

    it("contains numbers from 0 to 21", () => {
      const result = getAllArcanoNumbers();
      expect(result).toContain(0);
      expect(result).toContain(21);
    });
  });

  describe("getAllArcanoNomes", () => {
    it("returns array of arcano names", () => {
      const result = getAllArcanoNomes();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("contains O Louco", () => {
      const result = getAllArcanoNomes();
      expect(result).toContain("O Louco");
    });

    it("contains A Lua", () => {
      const result = getAllArcanoNomes();
      expect(result).toContain("A Lua");
    });
  });

  describe("hasSoundTarot", () => {
    it("returns true for known sound", () => {
      expect(hasSoundTarot("OM")).toBe(true);
      expect(hasSoundTarot("EIA")).toBe(true);
      expect(hasSoundTarot("AUM")).toBe(true);
    });

    it("returns true for lowercase known sound", () => {
      expect(hasSoundTarot("om")).toBe(true);
      expect(hasSoundTarot("aum")).toBe(true);
    });

    it("returns false for unknown sound", () => {
      expect(hasSoundTarot("UNKNOWN")).toBe(false);
    });

    it("returns false for empty string", () => {
      expect(hasSoundTarot("")).toBe(false);
    });
  });

  describe("getSoundsByElement", () => {
    it("returns sounds for fire element", () => {
      const result = getSoundsByElement("Fogo");
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.elemento).toBe("Fogo");
      });
    });

    it("returns sounds for water element", () => {
      const result = getSoundsByElement("Água");
      expect(Array.isArray(result)).toBe(true);
      result.forEach((mapping) => {
        expect(mapping.elemento).toBe("Água");
      });
    });

    it("returns sounds for earth element", () => {
      const result = getSoundsByElement("Terra");
      expect(Array.isArray(result)).toBe(true);
      result.forEach((mapping) => {
        expect(mapping.elemento).toBe("Terra");
      });
    });

    it("returns sounds for air element", () => {
      const result = getSoundsByElement("Ar");
      expect(Array.isArray(result)).toBe(true);
      result.forEach((mapping) => {
        expect(mapping.elemento).toBe("Ar");
      });
    });

    it("returns sounds for ether element", () => {
      const result = getSoundsByElement("Éter");
      expect(Array.isArray(result)).toBe(true);
      result.forEach((mapping) => {
        expect(mapping.elemento).toBe("Éter");
      });
    });

    it("returns empty array for unknown element", () => {
      const result = getSoundsByElement("Unknown");
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe("getSoundsByArcano", () => {
    it("returns sounds for arcano 0", () => {
      const result = getSoundsByArcano(0);
      expect(Array.isArray(result)).toBe(true);
      result.forEach((mapping) => {
        expect(mapping.arcano.numero).toBe(0);
      });
    });

    it("returns sounds for arcano 15 (O Sol)", () => {
      const result = getSoundsByArcano(15);
      expect(Array.isArray(result)).toBe(true);
      result.forEach((mapping) => {
        expect(mapping.arcano.numero).toBe(15);
        expect(mapping.arcano.nome).toBe("O Sol");
      });
    });

    it("returns empty array for unknown arcano", () => {
      const result = getSoundsByArcano(99);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe("Element distribution", () => {
    it("has sounds for all four classical elements plus ether", () => {
      const allElements = getAllSoundTarots().map((m) => m.elemento);
      const uniqueElements = [...new Set(allElements)];
      expect(uniqueElements).toContain("Fogo");
      expect(uniqueElements).toContain("Água");
      expect(uniqueElements).toContain("Terra");
      expect(uniqueElements).toContain("Ar");
    });
  });

  describe("Healing properties consistency", () => {
    it("all sounds have healing properties", () => {
      const all = getAllSoundTarots();
      all.forEach((mapping) => {
        expect(Array.isArray(mapping.propriedades_cura)).toBe(true);
        expect(mapping.propriedades_cura.length).toBeGreaterThan(0);
      });
    });

    it("all healing properties are non-empty strings", () => {
      const all = getAllSoundTarots();
      all.forEach((mapping) => {
        mapping.propriedades_cura.forEach((prop) => {
          expect(typeof prop).toBe("string");
          expect(prop.trim().length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe("Practice guidance consistency", () => {
    it("all sounds have practice guidance", () => {
      const all = getAllSoundTarots();
      all.forEach((mapping) => {
        expect(typeof mapping.practica).toBe("string");
        expect(mapping.practica.trim().length).toBeGreaterThan(0);
      });
    });

    it("practice guidance contains the sound name", () => {
      const all = getAllSoundTarots();
      all.forEach((mapping) => {
        expect(mapping.practica).toContain(mapping.som);
      });
    });
  });

  describe("Arcano number range", () => {
    it("all arcano numbers are within 0-21 range", () => {
      const all = getAllSoundTarots();
      all.forEach((mapping) => {
        expect(mapping.arcano.numero).toBeGreaterThanOrEqual(0);
        expect(mapping.arcano.numero).toBeLessThanOrEqual(21);
      });
    });
  });
});