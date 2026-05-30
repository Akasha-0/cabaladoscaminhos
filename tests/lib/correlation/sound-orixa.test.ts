import { describe, it, expect } from "vitest";
import {
  getSoundOrixa,
  getOrixaSound,
  getAllSoundOrixas,
  getSoundsByOrixa,
  getSoundsByElement,
  getAllOrixas,
  getHealingBySound,
  getFrequencyBySound,
  getChakraBySound,
  getOrayoBySound,
  getElementBySound,
} from "@/lib/correlation/sound-orixa";

describe("sound-orixa correlation", () => {
  describe("getSoundOrixa", () => {
    it("returns correct mapping for OM", () => {
      const result = getSoundOrixa("OM");
      expect(result).toBeDefined();
      expect(result?.orixa).toBe("Ori");
      expect(result?.orixa_secundario).toBe("Oxumaré");
      expect(result?.elemento).toBe("Éter");
      expect(result?.frequencia).toBe(963);
      expect(result?.chakra).toBe("7º Coronário (Sahasrara)");
    });

    it("returns correct mapping for LARÉ", () => {
      const result = getSoundOrixa("LARÉ");
      expect(result).toBeDefined();
      expect(result?.orixa).toBe("Oxalufã");
      expect(result?.orixa_secundario).toBe("Omulu");
      expect(result?.elemento).toBe("Terra");
      expect(result?.frequencia).toBe(396);
      expect(result?.chakra).toBe("1º Básico (Muladhara)");
    });

    it("returns correct mapping for XANGÔ", () => {
      const result = getSoundOrixa("XANGÔ");
      expect(result).toBeDefined();
      expect(result?.orixa).toBe("Xangô");
      expect(result?.elemento).toBe("Fogo");
      expect(result?.frequencia).toBe(528);
      expect(result?.cor).toBe("Vermelho");
    });

    it("returns correct mapping for OXUM", () => {
      const result = getSoundOrixa("OXUM");
      expect(result).toBeDefined();
      expect(result?.orixa).toBe("Oxum");
      expect(result?.elemento).toBe("Água");
      expect(result?.frequencia).toBe(417);
    });

    it("returns correct mapping for IANSÃ", () => {
      const result = getSoundOrixa("IANSÃ");
      expect(result).toBeDefined();
      expect(result?.orixa).toBe("Iansã");
      expect(result?.elemento).toBe("Fogo");
      expect(result?.frequencia).toBe(741);
    });

    it("returns correct mapping for OGUM", () => {
      const result = getSoundOrixa("OGUM");
      expect(result).toBeDefined();
      expect(result?.orixa).toBe("Ogum");
      expect(result?.elemento).toBe("Fogo");
      expect(result?.frequencia).toBe(741);
    });

    it("returns correct mapping for OXÓSSI", () => {
      const result = getSoundOrixa("OXÓSSI");
      expect(result).toBeDefined();
      expect(result?.orixa).toBe("Oxóssi");
      expect(result?.elemento).toBe("Ar");
      expect(result?.frequencia).toBe(639);
    });

    it("returns correct mapping for IEMANJÁ", () => {
      const result = getSoundOrixa("IEMANJÁ");
      expect(result).toBeDefined();
      expect(result?.orixa).toBe("Iemanjá");
      expect(result?.elemento).toBe("Água");
      expect(result?.frequencia).toBe(417);
    });

    it("returns correct mapping for OXUMARÉ", () => {
      const result = getSoundOrixa("OXUMARÉ");
      expect(result).toBeDefined();
      expect(result?.orixa).toBe("Oxumaré");
      expect(result?.elemento).toBe("Éter");
      expect(result?.frequencia).toBe(852);
    });

    it("returns correct mapping for Oxumaré lowercase", () => {
      const result = getSoundOrixa("Oxumaré");
      expect(result).toBeDefined();
      expect(result?.orixa).toBe("Oxumaré");
      expect(result?.elemento).toBe("Éter");
    });

    it("returns correct mapping for OSSAIM", () => {
      const result = getSoundOrixa("OSSAIM");
      expect(result).toBeDefined();
      expect(result?.orixa).toBe("Ossaim");
      expect(result?.elemento).toBe("Terra");
    });

    it("returns correct mapping for NANÃ", () => {
      const result = getSoundOrixa("NANÃ");
      expect(result).toBeDefined();
      expect(result?.orixa).toBe("Nanã Buruquá");
      expect(result?.elemento).toBe("Terra");
      expect(result?.frequencia).toBe(396);
    });

    it("accepts lowercase sound names", () => {
      const result = getSoundOrixa("om");
      expect(result).toBeDefined();
      expect(result?.orixa).toBe("Ori");
    });

    it("accepts mixed case sound names", () => {
      const result = getSoundOrixa("Xangô");
      expect(result).toBeDefined();
      expect(result?.orixa).toBe("Xangô");
    });

    it("returns undefined for unknown sound", () => {
      const result = getSoundOrixa("UNKNOWN");
      expect(result).toBeUndefined();
    });

    it("returns undefined for empty string", () => {
      const result = getSoundOrixa("");
      expect(result).toBeUndefined();
    });
  });

  describe("getOrixaSound", () => {
    it("returns correct reverse mapping for Ori", () => {
      const result = getOrixaSound();
      expect(result["Ori"]).toContain("OM");
    });

    it("returns correct reverse mapping for Oxalufã", () => {
      const result = getOrixaSound();
      expect(result["Oxalufã"]).toContain("LARÉ");
    });

    it("returns correct reverse mapping for Xangô", () => {
      const result = getOrixaSound();
      expect(result["Xangô"]).toContain("XANGÔ");
    });

    it("includes secondary Orixás in mapping", () => {
      const result = getOrixaSound();
      expect(result["Oxumaré"]).toContain("OM");
      expect(result["Oxumaré"]).toContain("OXumaré");
    });

    it("returns all Orixás with associated sounds", () => {
      const result = getOrixaSound();
      expect(Object.keys(result).length).toBeGreaterThan(10);
    });

    it("maps each Orixá to at least one sound", () => {
      const result = getOrixaSound();
      Object.entries(result).forEach(([orixa, sounds]) => {
        expect(sounds.length).toBeGreaterThan(0);
      });
    });
  });

  describe("getAllSoundOrixas", () => {
    it("returns all sound mappings", () => {
      const result = getAllSoundOrixas();
      expect(result.length).toBeGreaterThan(10);
    });

    it("each item has required properties", () => {
      const result = getAllSoundOrixas();
      result.forEach((item) => {
        expect(item.som).toBeDefined();
        expect(item.orixa).toBeDefined();
        expect(item.elemento).toBeDefined();
        expect(item.frequencia).toBeDefined();
        expect(item.propriedades_healing).toBeDefined();
      });
    });

    it("contains OM with correct properties", () => {
      const result = getAllSoundOrixas();
      const om = result.find((r) => r.som === "OM");
      expect(om).toBeDefined();
      expect(om?.frequencia).toBe(963);
      expect(om?.elemento).toBe("Éter");
      expect(om?.propriedades_healing.fisico).toBeDefined();
      expect(om?.propriedades_healing.emocional).toBeDefined();
      expect(om?.propriedades_healing.mental_espiritual).toBeDefined();
    });

    it("contains XANGÔ with correct properties", () => {
      const result = getAllSoundOrixas();
      const xango = result.find((r) => r.som === "XANGÔ");
      expect(xango).toBeDefined();
      expect(xango?.frequencia).toBe(528);
      expect(xango?.oracao_yoruba).toContain("Xangô");
    });

    it("contains all elements (Fogo, Água, Ar, Terra, Éter)", () => {
      const result = getAllSoundOrixas();
      const elementos = result.map((r) => r.elemento);
      expect(elementos).toContain("Fogo");
      expect(elementos).toContain("Água");
      expect(elementos).toContain("Ar");
      expect(elementos).toContain("Terra");
      expect(elementos).toContain("Éter");
    });
  });

  describe("getSoundsByOrixa", () => {
    it("returns sounds for Ori", () => {
      const result = getSoundsByOrixa("Ori");
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((r) => r.som === "OM")).toBe(true);
    });

    it("returns sounds for Xangô", () => {
      const result = getSoundsByOrixa("Xangô");
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((r) => r.som === "XANGÔ")).toBe(true);
    });

    it("accepts lowercase Orixá name", () => {
      const result = getSoundsByOrixa("oxum");
      expect(result.length).toBeGreaterThan(0);
    });

    it("returns sounds for secondary Orixá", () => {
      const result = getSoundsByOrixa("Oxumaré");
      expect(result.length).toBeGreaterThan(0);
    });

    it("returns empty array for unknown Orixá", () => {
      const result = getSoundsByOrixa("UnknownOrixa");
      expect(result).toEqual([]);
    });
  });

  describe("getSoundsByElement", () => {
    it("returns sounds for Fogo element", () => {
      const result = getSoundsByElement("Fogo");
      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => {
        expect(r.elemento).toBe("Fogo");
      });
    });

    it("returns sounds for Água element", () => {
      const result = getSoundsByElement("Água");
      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => {
        expect(r.elemento).toBe("Água");
      });
    });

    it("returns sounds for Terra element", () => {
      const result = getSoundsByElement("Terra");
      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => {
        expect(r.elemento).toBe("Terra");
      });
    });

    it("returns sounds for Éter element", () => {
      const result = getSoundsByElement("Éter");
      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => {
        expect(r.elemento).toBe("Éter");
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

  describe("getAllOrixas", () => {
    it("returns array of Orixá names", () => {
      const result = getAllOrixas();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(10);
    });

    it("includes major Orixás", () => {
      const result = getAllOrixas();
      expect(result).toContain("Ori");
      expect(result).toContain("Oxalufã");
      expect(result).toContain("Xangô");
      expect(result).toContain("Iemanjá");
      expect(result).toContain("Oxum");
      expect(result).toContain("Oxóssi");
      expect(result).toContain("Iansã");
    });

    it("returns sorted array", () => {
      const result = getAllOrixas();
      const sorted = [...result].sort();
      expect(result).toEqual(sorted);
    });
  });

  describe("getHealingBySound", () => {
    it("returns healing properties for OM", () => {
      const result = getHealingBySound("OM");
      expect(result).toBeDefined();
      expect(result?.fisico).toBeDefined();
      expect(result?.emocional).toBeDefined();
      expect(result?.mental_espiritual).toBeDefined();
      expect(result?.pratica).toBeDefined();
    });

    it("returns healing properties for XANGÔ", () => {
      const result = getHealingBySound("XANGÔ");
      expect(result).toBeDefined();
      expect(result?.fisico).toContain("metabolismo");
    });

    it("returns null for unknown sound", () => {
      const result = getHealingBySound("UNKNOWN");
      expect(result).toBeNull();
    });
  });

  describe("getFrequencyBySound", () => {
    it("returns frequency for OM", () => {
      const result = getFrequencyBySound("OM");
      expect(result).toBe(963);
    });

    it("returns frequency for LARÉ", () => {
      const result = getFrequencyBySound("LARÉ");
      expect(result).toBe(396);
    });

    it("returns frequency for XANGÔ", () => {
      const result = getFrequencyBySound("XANGÔ");
      expect(result).toBe(528);
    });

    it("returns null for unknown sound", () => {
      const result = getFrequencyBySound("UNKNOWN");
      expect(result).toBeNull();
    });
  });

  describe("getChakraBySound", () => {
    it("returns chakra for OM", () => {
      const result = getChakraBySound("OM");
      expect(result).toBe("7º Coronário (Sahasrara)");
    });

    it("returns chakra for LARÉ", () => {
      const result = getChakraBySound("LARÉ");
      expect(result).toBe("1º Básico (Muladhara)");
    });

    it("returns chakra for XANGÔ", () => {
      const result = getChakraBySound("XANGÔ");
      expect(result).toBe("3º Plexo Solar (Manipura)");
    });

    it("returns null for unknown sound", () => {
      const result = getChakraBySound("UNKNOWN");
      expect(result).toBeNull();
    });
  });

  describe("getOrayoBySound", () => {
    it("returns Yoruba prayer for OM", () => {
      const result = getOrayoBySound("OM");
      expect(result).toBeDefined();
      expect(result).toContain("Ori");
    });

    it("returns Yoruba prayer for XANGÔ", () => {
      const result = getOrayoBySound("XANGÔ");
      expect(result).toContain("Xangô");
    });

    it("returns null for unknown sound", () => {
      const result = getOrayoBySound("UNKNOWN");
      expect(result).toBeNull();
    });
  });

  describe("getElementBySound", () => {
    it("returns element for OM", () => {
      const result = getElementBySound("OM");
      expect(result).toBe("Éter");
    });

    it("returns element for XANGÔ", () => {
      const result = getElementBySound("XANGÔ");
      expect(result).toBe("Fogo");
    });

    it("returns element for OXUM", () => {
      const result = getElementBySound("OXUM");
      expect(result).toBe("Água");
    });

    it("returns element for LARÉ", () => {
      const result = getElementBySound("LARÉ");
      expect(result).toBe("Terra");
    });

    it("returns null for unknown sound", () => {
      const result = getElementBySound("UNKNOWN");
      expect(result).toBeNull();
    });
  });

  describe("Complete sound-orixá correlation", () => {
    it("all sounds have valid frequencies within Solfeggio range", () => {
      const allSounds = getAllSoundOrixas();
      const validFrequencies = [396, 417, 528, 639, 741, 852, 963];
      allSounds.forEach((sound) => {
        expect(validFrequencies).toContain(sound.frequencia);
      });
    });

    it("all sounds have unique orayções", () => {
      const allSounds = getAllSoundOrixas();
      const prayers = allSounds.map((s) => s.oracao_yoruba);
      const unique = new Set(prayers);
      expect(prayers.length).toBe(unique.size);
    });

    it("all sounds have healing properties defined", () => {
      const allSounds = getAllSoundOrixas();
      allSounds.forEach((sound) => {
        expect(sound.propriedades_healing.fisico).toBeTruthy();
        expect(sound.propriedades_healing.emocional).toBeTruthy();
        expect(sound.propriedades_healing.mental_espiritual).toBeTruthy();
        expect(sound.propriedades_healing.pratica).toBeTruthy();
      });
    });

    it("all sounds have ritual tools defined", () => {
      const allSounds = getAllSoundOrixas();
      allSounds.forEach((sound) => {
        expect(sound.ferramenta_ritual).toBeTruthy();
      });
    });

    it("all sounds have pronunciations defined", () => {
      const allSounds = getAllSoundOrixas();
      allSounds.forEach((sound) => {
        expect(sound.pronunciacao).toBeTruthy();
      });
    });

    it("all sounds have significado defined", () => {
      const allSounds = getAllSoundOrixas();
      allSounds.forEach((sound) => {
        expect(sound.significado).toBeTruthy();
      });
    });

    it("all sounds have day of week defined", () => {
      const allSounds = getAllSoundOrixas();
      allSounds.forEach((sound) => {
        expect(sound.dia_semana).toBeTruthy();
      });
    });

    it("all sounds have color defined", () => {
      const allSounds = getAllSoundOrixas();
      allSounds.forEach((sound) => {
        expect(sound.cor).toBeTruthy();
      });
    });

    it("frequency-to-element consistency matches frequency-orixa module", () => {
      const lare = getSoundOrixa("LARÉ");
      expect(lare?.elemento).toBe("Terra");
      const oxum = getSoundOrixa("OXUM");
      expect(oxum?.elemento).toBe("Água");
      const xango = getSoundOrixa("XANGÔ");
      expect(xango?.elemento).toBe("Fogo");
      const oxossi = getSoundOrixa("OXÓSSI");
      expect(oxossi?.elemento).toBe("Ar");
      const iansa = getSoundOrixa("IANSÃ");
      expect(iansa?.elemento).toBe("Fogo");
      const oxumare = getSoundOrixa("OXUMARÉ");
      expect(oxumare?.elemento).toBe("Éter");
      const om = getSoundOrixa("OM");
      expect(om?.elemento).toBe("Éter");
    });
  });

  describe("Sound-element correlation consistency", () => {
    it("Fogo element sounds have appropriate healing properties", () => {
      const fogoSounds = getSoundsByElement("Fogo");
      expect(fogoSounds.length).toBeGreaterThan(0);
      fogoSounds.forEach((sound) => {
        expect(sound.propriedades_healing.fisico.length).toBeGreaterThan(0);
      });
    });

    it("Água element sounds have appropriate healing properties", () => {
      const aguaSounds = getSoundsByElement("Água");
      expect(aguaSounds.length).toBeGreaterThan(0);
      aguaSounds.forEach((sound) => {
        expect(sound.propriedades_healing.fisico.length).toBeGreaterThan(0);
      });
    });

    it("Terra element sounds have appropriate healing properties", () => {
      const terraSounds = getSoundsByElement("Terra");
      expect(terraSounds.length).toBeGreaterThan(0);
      terraSounds.forEach((sound) => {
        expect(sound.propriedades_healing.fisico.length).toBeGreaterThan(0);
      });
    });

    it("Éter element sounds have appropriate healing properties", () => {
      const eterSounds = getSoundsByElement("Éter");
      expect(eterSounds.length).toBeGreaterThan(0);
      eterSounds.forEach((sound) => {
        expect(sound.propriedades_healing.fisico.length).toBeGreaterThan(0);
      });
    });

    it("Ar element sounds have appropriate healing properties", () => {
      const arSounds = getSoundsByElement("Ar");
      expect(arSounds.length).toBeGreaterThan(0);
      arSounds.forEach((sound) => {
        expect(sound.propriedades_healing.fisico.length).toBeGreaterThan(0);
      });
    });
  });
});