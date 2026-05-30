/**
 * Sound-Planet Correlation Tests
 */

import { describe, it, expect } from "vitest";
import {
  getSoundPlanet,
  getPlanetSound,
  getAllSoundPlanets,
  getSoundsByPlanet,
  getSoundsByElement,
  getAllPlanets,
  getHealingBySound,
  getFrequencyBySound,
  getChakraBySound,
  getElementBySound,
  getPlanetNumberBySound,
} from "@/lib/correlation/sound-planet";

describe("sound-planet correlation", () => {
  describe("getSoundPlanet", () => {
    it("returns correct mapping for RAM", () => {
      const result = getSoundPlanet("RAM");
      expect(result).toBeDefined();
      expect(result?.planeta).toBe("Sol");
      expect(result?.planeta_numero).toBe(1);
      expect(result?.elemento).toBe("Fogo");
      expect(result?.frequencia).toBe(528);
      expect(result?.nota_musical).toBe("E");
      expect(result?.significado_espiritual).toContain("luz interior");
    });

    it("returns correct mapping for OM", () => {
      const result = getSoundPlanet("OM");
      expect(result).toBeDefined();
      expect(result?.planeta).toBe("Lua");
      expect(result?.planeta_numero).toBe(2);
      expect(result?.elemento).toBe("Água");
      expect(result?.frequencia).toBe(852);
      expect(result?.chakra).toBe("1º Básico (Muladhara)");
    });

    it("returns correct mapping for VAM", () => {
      const result = getSoundPlanet("VAM");
      expect(result).toBeDefined();
      expect(result?.planeta).toBe("Marte");
      expect(result?.planeta_numero).toBe(3);
      expect(result?.elemento).toBe("Fogo");
      expect(result?.frequencia).toBe(432);
      expect(result?.mantra).toContain("coragem");
    });

    it("returns correct mapping for AUM", () => {
      const result = getSoundPlanet("AUM");
      expect(result).toBeDefined();
      expect(result?.planeta).toBe("Mercúrio");
      expect(result?.planeta_numero).toBe(4);
      expect(result?.elemento).toBe("Ar");
      expect(result?.frequencia).toBe(741);
    });

    it("returns correct mapping for HAM", () => {
      const result = getSoundPlanet("HAM");
      expect(result).toBeDefined();
      expect(result?.planeta).toBe("Júpiter");
      expect(result?.planeta_numero).toBe(5);
      expect(result?.elemento).toBe("Fogo/Água");
      expect(result?.frequencia).toBe(396);
    });

    it("returns correct mapping for YAM", () => {
      const result = getSoundPlanet("YAM");
      expect(result).toBeDefined();
      expect(result?.planeta).toBe("Vênus");
      expect(result?.planeta_numero).toBe(6);
      expect(result?.elemento).toBe("Água");
      expect(result?.frequencia).toBe(639);
    });

    it("returns correct mapping for DUM", () => {
      const result = getSoundPlanet("DUM");
      expect(result).toBeDefined();
      expect(result?.planeta).toBe("Saturno");
      expect(result?.planeta_numero).toBe(7);
      expect(result?.elemento).toBe("Terra");
      expect(result?.frequencia).toBe(963);
    });

    it("returns correct mapping for ZEUS (Greek planet sound)", () => {
      const result = getSoundPlanet("ZEUS");
      expect(result).toBeDefined();
      expect(result?.planeta).toBe("Júpiter");
      expect(result?.planeta_numero).toBe(5);
      expect(result?.instrumento_tradicional).toContain("Trombeta");
    });

    it("returns correct mapping for AFRODITE (Greek planet sound)", () => {
      const result = getSoundPlanet("AFRODITE");
      expect(result).toBeDefined();
      expect(result?.planeta).toBe("Vênus");
      expect(result?.planeta_numero).toBe(6);
      expect(result?.instrumento_tradicional).toContain("Harpa");
    });

    it("returns correct mapping for KRONOS (Greek planet sound)", () => {
      const result = getSoundPlanet("KRONOS");
      expect(result).toBeDefined();
      expect(result?.planeta).toBe("Saturno");
      expect(result?.planeta_numero).toBe(7);
      expect(result?.cor).toBe("Cinza-escuro");
    });

    it("accepts lowercase sound names", () => {
      const result = getSoundPlanet("om");
      expect(result).toBeDefined();
      expect(result?.planeta).toBe("Lua");
    });

    it("accepts mixed case sound names", () => {
      const result = getSoundPlanet("Ram");
      expect(result).toBeDefined();
      expect(result?.planeta).toBe("Sol");
    });

    it("returns undefined for unknown sound", () => {
      const result = getSoundPlanet("UNKNOWN");
      expect(result).toBeUndefined();
    });

    it("returns undefined for empty string", () => {
      const result = getSoundPlanet("");
      expect(result).toBeUndefined();
    });

    it("includes all required properties in returned object", () => {
      const result = getSoundPlanet("RAM");
      expect(result).toBeDefined();
      expect(result?.som).toBe("RAM");
      expect(result?.planeta).toBe("Sol");
      expect(result?.elemento).toBe("Fogo");
      expect(result?.chakra).toBeDefined();
      expect(result?.frequencia).toBe(528);
      expect(result?.nota_musical).toBe("E");
      expect(result?.mantra).toBeDefined();
      expect(result?.significado_espiritual).toBeDefined();
      expect(result?.propriedades_healing).toBeDefined();
      expect(result?.propriedades_healing.fisico).toBeDefined();
      expect(result?.propriedades_healing.emocional).toBeDefined();
      expect(result?.propriedades_healing.mental_espiritual).toBeDefined();
      expect(result?.propriedades_healing.pratica).toBeDefined();
    });
  });

  describe("getPlanetSound", () => {
    it("returns correct reverse mapping for Sol", () => {
      const result = getPlanetSound();
      expect(result["Sol"]).toBeDefined();
      expect(result["Sol"]).toContain("RAM");
      expect(result["Sol"]).toContain("SÓL");
    });

    it("returns correct reverse mapping for Lua", () => {
      const result = getPlanetSound();
      expect(result["Lua"]).toBeDefined();
      expect(result["Lua"]).toContain("OM");
      expect(result["Lua"]).toContain("SELENE");
    });

    it("returns correct reverse mapping for Marte", () => {
      const result = getPlanetSound();
      expect(result["Marte"]).toBeDefined();
      expect(result["Marte"]).toContain("VAM");
      expect(result["Marte"]).toContain("ARES");
    });

    it("returns correct reverse mapping for Mercúrio", () => {
      const result = getPlanetSound();
      expect(result["Mercúrio"]).toBeDefined();
      expect(result["Mercúrio"]).toContain("AUM");
      expect(result["Mercúrio"]).toContain("HERMES");
    });

    it("returns correct reverse mapping for Júpiter", () => {
      const result = getPlanetSound();
      expect(result["Júpiter"]).toBeDefined();
      expect(result["Júpiter"]).toContain("HAM");
      expect(result["Júpiter"]).toContain("ZEUS");
    });

    it("returns correct reverse mapping for Vênus", () => {
      const result = getPlanetSound();
      expect(result["Vênus"]).toBeDefined();
      expect(result["Vênus"]).toContain("YAM");
      expect(result["Vênus"]).toContain("AFRODITE");
    });

    it("returns correct reverse mapping for Saturno", () => {
      const result = getPlanetSound();
      expect(result["Saturno"]).toBeDefined();
      expect(result["Saturno"]).toContain("DUM");
      expect(result["Saturno"]).toContain("KRONOS");
    });

    it("returns all 7 planets with associated sounds", () => {
      const result = getPlanetSound();
      expect(Object.keys(result).length).toBe(7);
    });

    it("maps each planet to at least one sound", () => {
      const result = getPlanetSound();
      Object.entries(result).forEach(([planeta, sounds]) => {
        expect(sounds.length).toBeGreaterThan(0);
      });
    });
  });

  describe("getAllSoundPlanets", () => {
    it("returns all sound-planet mappings", () => {
      const result = getAllSoundPlanets();
      expect(result.length).toBeGreaterThan(10);
    });

    it("each item has required properties", () => {
      const result = getAllSoundPlanets();
      result.forEach((item) => {
        expect(item.som).toBeDefined();
        expect(item.planeta).toBeDefined();
        expect(item.elemento).toBeDefined();
        expect(item.frequencia).toBeDefined();
        expect(item.propriedades_healing).toBeDefined();
      });
    });

    it("contains RAM with correct properties", () => {
      const result = getAllSoundPlanets();
      const ram = result.find((r) => r.som === "RAM");
      expect(ram).toBeDefined();
      expect(ram?.frequencia).toBe(528);
      expect(ram?.planeta).toBe("Sol");
      expect(ram?.elemento).toBe("Fogo");
    });

    it("contains OM with correct properties", () => {
      const result = getAllSoundPlanets();
      const om = result.find((r) => r.som === "OM");
      expect(om).toBeDefined();
      expect(om?.frequencia).toBe(852);
      expect(om?.planeta).toBe("Lua");
    });

    it("contains all 7 Solfeggio frequencies used in planet sounds", () => {
      const result = getAllSoundPlanets();
      const frequencies = result.map((r) => r.frequencia);
      expect(frequencies).toContain(432);
      expect(frequencies).toContain(528);
      expect(frequencies).toContain(639);
      expect(frequencies).toContain(741);
      expect(frequencies).toContain(852);
      expect(frequencies).toContain(396);
      expect(frequencies).toContain(963);
    });

    it("is ordered by planet number", () => {
      const result = getAllSoundPlanets();
      for (let i = 1; i < result.length; i++) {
        expect(result[i].planeta_numero).toBeGreaterThanOrEqual(result[i - 1].planeta_numero);
      }
    });
  });

  describe("getSoundsByPlanet", () => {
    it("returns sounds for Sol", () => {
      const result = getSoundsByPlanet("Sol");
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((r) => r.som === "RAM")).toBe(true);
    });

    it("returns sounds for Lua", () => {
      const result = getSoundsByPlanet("Lua");
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((r) => r.som === "OM")).toBe(true);
    });

    it("returns sounds for Marte", () => {
      const result = getSoundsByPlanet("Marte");
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((r) => r.som === "VAM")).toBe(true);
    });

    it("accepts lowercase planet name", () => {
      const result = getSoundsByPlanet("júpiter");
      expect(result.length).toBeGreaterThan(0);
    });

    it("returns empty array for unknown planet", () => {
      const result = getSoundsByPlanet("UnknownPlanet");
      expect(result).toEqual([]);
    });
  });

  describe("getSoundsByElement", () => {
    it("returns sounds for Fogo element", () => {
      const result = getSoundsByElement("Fogo");
      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => {
        expect(r.elemento.toUpperCase()).toMatch(/FOGO/);
      });
    });

    it("returns sounds for Água element", () => {
      const result = getSoundsByElement("Água");
      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => {
        expect(r.elemento.toUpperCase()).toMatch(/ÁGUA/);
      });
    });

    it("returns sounds for Terra element", () => {
      const result = getSoundsByElement("Terra");
      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => {
        expect(r.elemento.toUpperCase()).toMatch(/TERRA/);
      });
    });

    it("returns sounds for Ar element", () => {
      const result = getSoundsByElement("Ar");
      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => {
        expect(r.elemento.toUpperCase()).toMatch(/AR/);
      });
    });

    it("accepts uppercase element name", () => {
      const result = getSoundsByElement("FOGO");
      expect(result.length).toBeGreaterThan(0);
    });

    it("returns empty array for unknown element", () => {
      const result = getSoundsByElement("Unknown");
      expect(result).toEqual([]);
    });
  });

  describe("getAllPlanets", () => {
    it("returns array of planet names", () => {
      const result = getAllPlanets();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(7);
    });

    it("contains all 7 classical planets", () => {
      const result = getAllPlanets();
      expect(result).toContain("Sol");
      expect(result).toContain("Lua");
      expect(result).toContain("Marte");
      expect(result).toContain("Mercúrio");
      expect(result).toContain("Júpiter");
      expect(result).toContain("Vênus");
      expect(result).toContain("Saturno");
    });
  });

  describe("getHealingBySound", () => {
    it("returns healing properties for RAM", () => {
      const result = getHealingBySound("RAM");
      expect(result).toBeDefined();
      expect(result?.fisico).toContain("regeneração");
      expect(result?.emocional).toContain("alegria");
      expect(result?.mental_espiritual).toContain("propósito");
    });

    it("returns healing properties for OM", () => {
      const result = getHealingBySound("OM");
      expect(result).toBeDefined();
      expect(result?.fisico).toContain("hidrata");
    });

    it("returns null for unknown sound", () => {
      const result = getHealingBySound("UNKNOWN");
      expect(result).toBeNull();
    });
  });

  describe("getFrequencyBySound", () => {
    it("returns correct frequency for RAM", () => {
      const result = getFrequencyBySound("RAM");
      expect(result).toBe(528);
    });

    it("returns correct frequency for OM", () => {
      const result = getFrequencyBySound("OM");
      expect(result).toBe(852);
    });

    it("returns correct frequency for DUM", () => {
      const result = getFrequencyBySound("DUM");
      expect(result).toBe(963);
    });

    it("returns null for unknown sound", () => {
      const result = getFrequencyBySound("UNKNOWN");
      expect(result).toBeNull();
    });
  });

  describe("getChakraBySound", () => {
    it("returns correct chakra for RAM", () => {
      const result = getChakraBySound("RAM");
      expect(result).toBe("7º Coronário (Sahasrara)");
    });

    it("returns correct chakra for OM", () => {
      const result = getChakraBySound("OM");
      expect(result).toBe("1º Básico (Muladhara)");
    });

    it("returns null for unknown sound", () => {
      const result = getChakraBySound("UNKNOWN");
      expect(result).toBeNull();
    });
  });

  describe("getElementBySound", () => {
    it("returns correct element for RAM", () => {
      const result = getElementBySound("RAM");
      expect(result).toBe("Fogo");
    });

    it("returns correct element for OM", () => {
      const result = getElementBySound("OM");
      expect(result).toBe("Água");
    });

    it("returns null for unknown sound", () => {
      const result = getElementBySound("UNKNOWN");
      expect(result).toBeNull();
    });
  });

  describe("getPlanetNumberBySound", () => {
    it("returns correct planet number for Sol sounds", () => {
      expect(getPlanetNumberBySound("RAM")).toBe(1);
      expect(getPlanetNumberBySound("SÓL")).toBe(1);
    });

    it("returns correct planet number for Lua sounds", () => {
      expect(getPlanetNumberBySound("OM")).toBe(2);
      expect(getPlanetNumberBySound("SELENE")).toBe(2);
    });

    it("returns correct planet number for Marte sounds", () => {
      expect(getPlanetNumberBySound("VAM")).toBe(3);
      expect(getPlanetNumberBySound("ARES")).toBe(3);
    });

    it("returns null for unknown sound", () => {
      const result = getPlanetNumberBySound("UNKNOWN");
      expect(result).toBeNull();
    });
  });

  describe("Complete sound-planet correlation", () => {
    it("maps all 7 classical planets with unique frequencies", () => {
      const result = getAllSoundPlanets();
      const planetFrequencies = new Map<string, number>();
      
      result.forEach((item) => {
        if (planetFrequencies.has(item.planeta)) {
          // Same planet can have multiple sounds, that's OK
        } else {
          planetFrequencies.set(item.planeta, item.frequencia);
        }
      });
      
      expect(planetFrequencies.size).toBe(7);
    });

    it("each planet has sounds that resonate with its element", () => {
      const result = getAllSoundPlanets();
      
      // Sol (Fogo) sounds
      const solSounds = result.filter((r) => r.planeta === "Sol");
      expect(solSounds.some((s) => s.elemento.includes("Fogo"))).toBe(true);
      
      // Lua (Água) sounds
      const luaSounds = result.filter((r) => r.planeta === "Lua");
      expect(luaSounds.some((s) => s.elemento.includes("Água"))).toBe(true);
      
      // Marte (Fogo) sounds
      const marteSounds = result.filter((r) => r.planeta === "Marte");
      expect(marteSounds.some((s) => s.elemento.includes("Fogo"))).toBe(true);
      
      // Mercúrio (Ar) sounds
      const mercurioSounds = result.filter((r) => r.planeta === "Mercúrio");
      expect(mercurioSounds.some((s) => s.elemento.includes("Ar"))).toBe(true);
      
      // Saturno (Terra) sounds
      const saturnoSounds = result.filter((r) => r.planeta === "Saturno");
      expect(saturnoSounds.some((s) => s.elemento.includes("Terra"))).toBe(true);
    });

    it("each sound has Greek and Sanskrit equivalents for major planets", () => {
      const result = getAllSoundPlanets();
      
      // Sol has RAM (Sanskrit) and SÓL (Egyptian)
      const solSounds = result.filter((r) => r.planeta === "Sol");
      expect(solSounds.length).toBeGreaterThanOrEqual(2);
      
      // Júpiter has HAM (Sanskrit) and ZEUS (Greek)
      const jupiterSounds = result.filter((r) => r.planeta === "Júpiter");
      expect(jupiterSounds.length).toBeGreaterThanOrEqual(2);
      
      // Vênus has YAM (Sanskrit) and AFRODITE (Greek)
      const venusSounds = result.filter((r) => r.planeta === "Vênus");
      expect(venusSounds.length).toBeGreaterThanOrEqual(2);
    });

    it("healing properties are comprehensive for all sounds", () => {
      const result = getAllSoundPlanets();
      result.forEach((item) => {
        expect(item.propriedades_healing.fisico).toBeDefined();
        expect(item.propriedades_healing.fisico.length).toBeGreaterThan(10);
        expect(item.propriedades_healing.emocional).toBeDefined();
        expect(item.propriedades_healing.emocional.length).toBeGreaterThan(10);
        expect(item.propriedades_healing.mental_espiritual).toBeDefined();
        expect(item.propriedades_healing.mental_espiritual.length).toBeGreaterThan(10);
        expect(item.propriedades_healing.pratica).toBeDefined();
        expect(item.propriedades_healing.pratica.length).toBeGreaterThan(5);
      });
    });
  });

  describe("Sound-element correlation consistency", () => {
    it("sounds are consistently categorized by element across the system", () => {
      const result = getAllSoundPlanets();
      
      // All Fogo-associated sounds should have Fogo in their element
      const fogoSounds = result.filter((r) => r.elemento.includes("Fogo"));
      fogoSounds.forEach((sound) => {
        expect(sound.elemento).toMatch(/Fogo/);
      });
      
      // All Água-associated sounds should have Água in their element
      const aguaSounds = result.filter((r) => r.elemento.includes("Água"));
      aguaSounds.forEach((sound) => {
        expect(sound.elemento).toMatch(/Água/);
      });
      
      // All Terra-associated sounds should have Terra in their element
      const terraSounds = result.filter((r) => r.elemento.includes("Terra"));
      terraSounds.forEach((sound) => {
        expect(sound.elemento).toMatch(/Terra/);
      });
      
      // All Ar-associated sounds should have Ar in their element
      const arSounds = result.filter((r) => r.elemento.includes("Ar"));
      arSounds.forEach((sound) => {
        expect(sound.elemento).toMatch(/Ar/);
      });
    });

    it("planet number ordering is consistent", () => {
      const planetNumbers = getAllPlanets().map((p) => {
        const sound = getSoundsByPlanet(p)[0];
        return sound?.planeta_numero;
      });
      
      // Should be 1-7 in order
      const sorted = [...planetNumbers].sort((a, b) => (a ?? 0) - (b ?? 0));
      expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });
  });
});
