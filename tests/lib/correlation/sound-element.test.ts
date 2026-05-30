import { describe, it, expect } from "vitest";
import {
  getSoundElement,
  getElementSound,
  getAllSoundElements,
  getAllElements,
  getSoundsByElement,
  getHealingProperties,
} from "@/lib/correlation/sound-element";

describe("sound-element correlation", () => {
  describe("getSoundElement", () => {
    it("returns correct mapping for LAM (Earth)", () => {
      const result = getSoundElement("LAM");
      expect(result).toBeDefined();
      expect(result?.som).toBe("LAM");
      expect(result?.elemento).toBe("Terra");
      expect(result?.elemento_en).toBe("Earth");
      expect(result?.chakra).toBe("1º Básico");
      expect(result?.chakra_sanskrit).toBe("Muladhara");
      expect(result?.chakra_numero).toBe(1);
      expect(result?.frequencia).toBe(396);
    });

    it("returns correct mapping for VAM (Water)", () => {
      const result = getSoundElement("VAM");
      expect(result).toBeDefined();
      expect(result?.som).toBe("VAM");
      expect(result?.elemento).toBe("Água");
      expect(result?.elemento_en).toBe("Water");
      expect(result?.chakra).toBe("2º Sacro");
      expect(result?.chakra_sanskrit).toBe("Svadhisthana");
      expect(result?.chakra_numero).toBe(2);
      expect(result?.frequencia).toBe(417);
    });

    it("returns correct mapping for RAM (Fire)", () => {
      const result = getSoundElement("RAM");
      expect(result).toBeDefined();
      expect(result?.som).toBe("RAM");
      expect(result?.elemento).toBe("Fogo");
      expect(result?.elemento_en).toBe("Fire");
      expect(result?.chakra).toBe("3º Plexo Solar");
      expect(result?.chakra_sanskrit).toBe("Manipura");
      expect(result?.chakra_numero).toBe(3);
      expect(result?.frequencia).toBe(528);
    });

    it("returns correct mapping for YAM (Air - Heart)", () => {
      const result = getSoundElement("YAM");
      expect(result).toBeDefined();
      expect(result?.som).toBe("YAM");
      expect(result?.elemento).toBe("Ar");
      expect(result?.elemento_en).toBe("Air");
      expect(result?.chakra).toBe("4º Cardíaco");
      expect(result?.chakra_sanskrit).toBe("Anahata");
      expect(result?.chakra_numero).toBe(4);
      expect(result?.frequencia).toBe(639);
    });

    it("returns correct mapping for HAM (Air - Throat)", () => {
      const result = getSoundElement("HAM");
      expect(result).toBeDefined();
      expect(result?.som).toBe("HAM");
      expect(result?.elemento).toBe("Ar");
      expect(result?.elemento_en).toBe("Air");
      expect(result?.chakra).toBe("5º Laríngeo");
      expect(result?.chakra_sanskrit).toBe("Vishuddha");
      expect(result?.chakra_numero).toBe(5);
      expect(result?.frequencia).toBe(741);
    });

    it("returns correct mapping for OM (Ether - Third Eye)", () => {
      const result = getSoundElement("OM");
      expect(result).toBeDefined();
      expect(result?.som).toBe("OM");
      expect(result?.elemento).toBe("Éter");
      expect(result?.elemento_en).toBe("Ether");
      expect(result?.chakra).toBe("6º Frontal");
      expect(result?.chakra_sanskrit).toBe("Ajna");
      expect(result?.chakra_numero).toBe(6);
      expect(result?.frequencia).toBe(852);
    });

    it("returns correct mapping for AUM (Ether - Crown)", () => {
      const result = getSoundElement("AUM");
      expect(result).toBeDefined();
      expect(result?.som).toBe("AUM");
      expect(result?.elemento).toBe("Éter");
      expect(result?.elemento_en).toBe("Ether");
      expect(result?.chakra).toBe("7º Coronário");
      expect(result?.chakra_sanskrit).toBe("Sahasrara");
      expect(result?.chakra_numero).toBe(7);
      expect(result?.frequencia).toBe(963);
    });

    it("accepts lowercase sound identifier", () => {
      const result = getSoundElement("lam");
      expect(result).toBeDefined();
      expect(result?.elemento).toBe("Terra");
    });

    it("accepts mixed case sound identifier", () => {
      const result = getSoundElement("Om");
      expect(result).toBeDefined();
      expect(result?.elemento).toBe("Éter");
    });

    it("accepts sound identifier with whitespace", () => {
      const result = getSoundElement("  LAM  ");
      expect(result).toBeDefined();
      expect(result?.elemento).toBe("Terra");
    });

    it("returns undefined for unknown sound", () => {
      const result = getSoundElement("UNKNOWN");
      expect(result).toBeUndefined();
    });

    it("returns undefined for empty string", () => {
      const result = getSoundElement("");
      expect(result).toBeUndefined();
    });

    it("returns undefined for null/undefined input", () => {
      expect(getSoundElement(undefined as unknown as string)).toBeUndefined();
      expect(getSoundElement(null as unknown as string)).toBeUndefined();
    });
  });

  describe("getElementSound", () => {
    it("returns element for LAM", () => {
      const result = getElementSound("LAM");
      expect(result).toBe("Terra");
    });

    it("returns element for VAM", () => {
      const result = getElementSound("VAM");
      expect(result).toBe("Água");
    });

    it("returns element for RAM", () => {
      const result = getElementSound("RAM");
      expect(result).toBe("Fogo");
    });

    it("returns element for YAM", () => {
      const result = getElementSound("YAM");
      expect(result).toBe("Ar");
    });

    it("returns element for OM", () => {
      const result = getElementSound("OM");
      expect(result).toBe("Éter");
    });

    it("returns undefined for unknown sound", () => {
      const result = getElementSound("UNKNOWN");
      expect(result).toBeUndefined();
    });
  });

  describe("getAllSoundElements", () => {
    it("returns all 7 sound-element mappings", () => {
      const result = getAllSoundElements();
      expect(result).toHaveLength(7);
    });

    it("returns elements sorted by chakra number", () => {
      const result = getAllSoundElements();
      expect(result[0].chakra_numero).toBe(1);
      expect(result[1].chakra_numero).toBe(2);
      expect(result[2].chakra_numero).toBe(3);
      expect(result[3].chakra_numero).toBe(4);
      expect(result[4].chakra_numero).toBe(5);
      expect(result[5].chakra_numero).toBe(6);
      expect(result[6].chakra_numero).toBe(7);
    });

    it("includes all expected elements", () => {
      const result = getAllSoundElements();
      const elements = result.map(r => r.elemento);
      expect(elements).toContain("Terra");
      expect(elements).toContain("Água");
      expect(elements).toContain("Fogo");
      expect(elements).toContain("Ar");
      expect(elements).toContain("Éter");
    });

    it("includes healing properties for each mapping", () => {
      const result = getAllSoundElements();
      result.forEach(sound => {
        expect(sound.propriedades_cura).toBeDefined();
        expect(sound.propriedades_cura.length).toBeGreaterThan(0);
      });
    });

    it("includes pronunciacao for each mapping", () => {
      const result = getAllSoundElements();
      result.forEach(sound => {
        expect(sound.pronunciacao).toBeDefined();
        expect(sound.pronunciacao.length).toBeGreaterThan(0);
      });
    });
  });

  describe("getAllElements", () => {
    it("returns all unique elements", () => {
      const result = getAllElements();
      expect(result).toContain("Ar");
      expect(result).toContain("Água");
      expect(result).toContain("Éter");
      expect(result).toContain("Fogo");
      expect(result).toContain("Terra");
    });

    it("returns array of strings", () => {
      const result = getAllElements();
      expect(Array.isArray(result)).toBe(true);
      result.forEach(el => {
        expect(typeof el).toBe("string");
      });
    });
  });

  describe("getSoundsByElement", () => {
    it("returns LAM for Terra element", () => {
      const result = getSoundsByElement("Terra");
      expect(result).toHaveLength(1);
      expect(result[0].som).toBe("LAM");
    });

    it("returns VAM for Água element", () => {
      const result = getSoundsByElement("Água");
      expect(result).toHaveLength(1);
      expect(result[0].som).toBe("VAM");
    });

    it("returns RAM for Fogo element", () => {
      const result = getSoundsByElement("Fogo");
      expect(result).toHaveLength(1);
      expect(result[0].som).toBe("RAM");
    });

    it("returns YAM and HAM for Ar element", () => {
      const result = getSoundsByElement("Ar");
      expect(result).toHaveLength(2);
      const sounds = result.map(r => r.som).sort();
      expect(sounds).toEqual(["HAM", "YAM"]);
    });

    it("returns OM and AUM for Éter element", () => {
      const result = getSoundsByElement("Éter");
      expect(result).toHaveLength(2);
      const sounds = result.map(r => r.som).sort();
      expect(sounds).toEqual(["AUM", "OM"]);
    });

    it("accepts lowercase element name", () => {
      const result = getSoundsByElement("terra");
      expect(result).toHaveLength(1);
      expect(result[0].som).toBe("LAM");
    });

    it("returns empty array for unknown element", () => {
      const result = getSoundsByElement("Unknown");
      expect(result).toHaveLength(0);
    });

    it("returns empty array for empty string", () => {
      const result = getSoundsByElement("");
      expect(result).toHaveLength(0);
    });
  });

  describe("getHealingProperties", () => {
    it("returns healing properties for LAM", () => {
      const result = getHealingProperties("LAM");
      expect(result).toBeDefined();
      expect(result?.length).toBeGreaterThan(0);
      expect(result?.[0]).toContain("Dissolução de medos");
    });

    it("returns healing properties for OM", () => {
      const result = getHealingProperties("OM");
      expect(result).toBeDefined();
      expect(result?.length).toBeGreaterThan(0);
      expect(result?.[0]).toContain("Despertar da intuição");
    });

    it("returns undefined for unknown sound", () => {
      const result = getHealingProperties("UNKNOWN");
      expect(result).toBeUndefined();
    });
  });

  describe("Element-Sound spiritual correlation completeness", () => {
    it("maps all five elements with their sounds", () => {
      const allSounds = getAllSoundElements();
      const elements = new Set(allSounds.map(s => s.elemento));
      
      expect(elements.has("Terra")).toBe(true);
      expect(elements.has("Água")).toBe(true);
      expect(elements.has("Fogo")).toBe(true);
      expect(elements.has("Ar")).toBe(true);
      expect(elements.has("Éter")).toBe(true);
    });

    it("includes frequency data for all sounds", () => {
      const allSounds = getAllSoundElements();
      allSounds.forEach(sound => {
        expect(sound.frequencia).toBeGreaterThan(0);
      });
    });

    it("includes direction for all sounds", () => {
      const allSounds = getAllSoundElements();
      allSounds.forEach(sound => {
        expect(sound.direcao).toBeDefined();
        expect(sound.direcao.length).toBeGreaterThan(0);
      });
    });

    it("includes season for all sounds", () => {
      const allSounds = getAllSoundElements();
      allSounds.forEach(sound => {
        expect(sound.estacao).toBeDefined();
        expect(sound.estacao.length).toBeGreaterThan(0);
      });
    });

    it("includes dynamic spiritual description for all sounds", () => {
      const allSounds = getAllSoundElements();
      allSounds.forEach(sound => {
        expect(sound.dinamica).toBeDefined();
        expect(sound.dinamica.length).toBeGreaterThan(0);
      });
    });

    it("correlates with chakra system correctly", () => {
      const allSounds = getAllSoundElements();
      
      // Earth (1) -> Root
      expect(getSoundElement("LAM")?.chakra_numero).toBe(1);
      // Water (2) -> Sacral
      expect(getSoundElement("VAM")?.chakra_numero).toBe(2);
      // Fire (3) -> Solar Plexus
      expect(getSoundElement("RAM")?.chakra_numero).toBe(3);
      // Air (4,5) -> Heart, Throat
      expect(getSoundElement("YAM")?.chakra_numero).toBe(4);
      expect(getSoundElement("HAM")?.chakra_numero).toBe(5);
      // Ether (6,7) -> Third Eye, Crown
      expect(getSoundElement("OM")?.chakra_numero).toBe(6);
      expect(getSoundElement("AUM")?.chakra_numero).toBe(7);
    });
  });

  describe("Healing properties consistency", () => {
    it("all sounds have at least 4 healing properties", () => {
      const allSounds = getAllSoundElements();
      allSounds.forEach(sound => {
        expect(sound.propriedades_cura.length).toBeGreaterThanOrEqual(4);
      });
    });

    it("healing properties are unique per element", () => {
      const terra = getSoundElement("LAM");
      const agua = getSoundElement("VAM");
      
      // Terra focuses on grounding, Agua on emotional flow
      expect(terra?.propriedades_cura[0]).toContain("Dissolução de medos");
      expect(agua?.propriedades_cura[0]).toContain("Limpeza de traumas");
    });
  });
});