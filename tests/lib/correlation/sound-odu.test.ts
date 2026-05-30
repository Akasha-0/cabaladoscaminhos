import { describe, it, expect } from "vitest";
import {
  getSoundOdu,
  getOduSound,
  getAllSoundOdus,
  getAllOdus,
  getSoundsByOdu,
  getHealingProperties,
  getElementSoundOdu,
  getOrixaBySound,
} from "@/lib/correlation/sound-odu";

describe("sound-odu correlation", () => {
  describe("getSoundOdu", () => {
    it("returns correct mapping for LAM (Ogundá - Terra)", () => {
      const result = getSoundOdu("LAM");
      expect(result).toBeDefined();
      expect(result?.odu).toBe("Ogundá");
      expect(result?.odu_numero).toBe(4);
      expect(result?.elemento).toBe("Terra");
      expect(result?.orixa).toBe("Ogum");
      expect(result?.frequencia).toBe(396);
      expect(result?.chakra).toBe("1º Básico");
      expect(result?.chakra_numero).toBe(1);
    });

    it("returns correct mapping for VAM (Irossun - Água)", () => {
      const result = getSoundOdu("VAM");
      expect(result).toBeDefined();
      expect(result?.odu).toBe("Irossun");
      expect(result?.odu_numero).toBe(11);
      expect(result?.elemento).toBe("Água");
      expect(result?.orixa).toBe("Oxum");
      expect(result?.frequencia).toBe(417);
      expect(result?.chakra).toBe("2º Sacro");
      expect(result?.chakra_numero).toBe(2);
    });

    it("returns correct mapping for RAM (Ejilsebora - Fogo)", () => {
      const result = getSoundOdu("RAM");
      expect(result).toBeDefined();
      expect(result?.odu).toBe("Ejilsebora");
      expect(result?.odu_numero).toBe(12);
      expect(result?.elemento).toBe("Fogo");
      expect(result?.orixa).toBe("Xangô");
      expect(result?.frequencia).toBe(528);
      expect(result?.chakra).toBe("3º Plexo Solar");
      expect(result?.chakra_numero).toBe(3);
    });

    it("returns correct mapping for YAM (Oxum - Ar)", () => {
      const result = getSoundOdu("YAM");
      expect(result).toBeDefined();
      expect(result?.odu).toBe("Oxum");
      expect(result?.odu_numero).toBe(10);
      expect(result?.elemento).toBe("Ar");
      expect(result?.orixa).toBe("Oxum");
      expect(result?.frequencia).toBe(639);
      expect(result?.chakra).toBe("4º Cardíaco");
      expect(result?.chakra_numero).toBe(4);
    });

    it("returns correct mapping for HAM (Obará - Ar)", () => {
      const result = getSoundOdu("HAM");
      expect(result).toBeDefined();
      expect(result?.odu).toBe("Obará");
      expect(result?.odu_numero).toBe(6);
      expect(result?.elemento).toBe("Ar");
      expect(result?.orixa).toBe("Oxalá");
      expect(result?.frequencia).toBe(741);
      expect(result?.chakra).toBe("5º Laríngeo");
      expect(result?.chakra_numero).toBe(5);
    });

    it("returns correct mapping for KSHAM (Etaogundá - Terra)", () => {
      const result = getSoundOdu("KSHAM");
      expect(result).toBeDefined();
      expect(result?.odu).toBe("Etaogundá");
      expect(result?.odu_numero).toBe(3);
      expect(result?.elemento).toBe("Terra");
      expect(result?.orixa).toBe("Obaluayê");
      expect(result?.frequencia).toBe(852);
      expect(result?.chakra).toBe("6º Terceiro Olho");
      expect(result?.chakra_numero).toBe(6);
    });

    it("returns correct mapping for OM (Ofun - Éter)", () => {
      const result = getSoundOdu("OM");
      expect(result).toBeDefined();
      expect(result?.odu).toBe("Ofun");
      expect(result?.odu_numero).toBe(16);
      expect(result?.elemento).toBe("Éter");
      expect(result?.orixa).toBe("Oxalá");
      expect(result?.frequencia).toBe(963);
      expect(result?.chakra).toBe("7º Coronário");
      expect(result?.chakra_numero).toBe(7);
    });

    it("returns correct mapping for AUM (Alafia - Éter)", () => {
      const result = getSoundOdu("AUM");
      expect(result).toBeDefined();
      expect(result?.odu).toBe("Alafia");
      expect(result?.odu_numero).toBe(1);
      expect(result?.elemento).toBe("Éter");
      expect(result?.orixa).toBe("Oxalá");
      expect(result?.frequencia).toBe(963);
      expect(result?.chakra).toBe("7º Coronário");
      expect(result?.chakra_numero).toBe(7);
    });

    it("accepts lowercase sound identifier", () => {
      const result = getSoundOdu("lam");
      expect(result).toBeDefined();
      expect(result?.odu).toBe("Ogundá");
    });

    it("accepts mixed case sound identifier", () => {
      const result = getSoundOdu("Lam");
      expect(result).toBeDefined();
      expect(result?.odu).toBe("Ogundá");
    });

    it("accepts sound identifier with whitespace", () => {
      const result = getSoundOdu("  LAM  ");
      expect(result).toBeDefined();
      expect(result?.odu).toBe("Ogundá");
    });

    it("returns undefined for unknown sound", () => {
      const result = getSoundOdu("XYZ");
      expect(result).toBeUndefined();
    });

    it("returns undefined for empty string", () => {
      const result = getSoundOdu("");
      expect(result).toBeUndefined();
    });

    it("returns undefined for null/undefined input", () => {
      expect(getSoundOdu(null as unknown as string)).toBeUndefined();
      expect(getSoundOdu(undefined as unknown as string)).toBeUndefined();
    });
  });

  describe("getOduSound", () => {
    it("returns correct Odu name for LAM", () => {
      expect(getOduSound("LAM")).toBe("Ogundá");
    });

    it("returns correct Odu name for VAM", () => {
      expect(getOduSound("VAM")).toBe("Irossun");
    });

    it("returns correct Odu name for RAM", () => {
      expect(getOduSound("RAM")).toBe("Ejilsebora");
    });

    it("returns correct Odu name for OM", () => {
      expect(getOduSound("OM")).toBe("Ofun");
    });

    it("returns undefined for unknown sound", () => {
      expect(getOduSound("UNKNOWN")).toBeUndefined();
    });

    it("handles case insensitivity", () => {
      expect(getOduSound("om")).toBe("Ofun");
      expect(getOduSound("Om")).toBe("Ofun");
    });
  });

  describe("getAllSoundOdus", () => {
    it("returns an array of SoundOdu objects", () => {
      const result = getAllSoundOdus();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("returns objects with required properties", () => {
      const result = getAllSoundOdus();
      const first = result[0];
      expect(first).toHaveProperty("som");
      expect(first).toHaveProperty("odu");
      expect(first).toHaveProperty("elemento");
      expect(first).toHaveProperty("propriedades_cura");
      expect(first).toHaveProperty("chakra_numero");
    });

    it("returns array sorted by odu_numero", () => {
      const result = getAllSoundOdus();
      for (let i = 1; i < result.length; i++) {
        expect(result[i].odu_numero).toBeGreaterThanOrEqual(result[i - 1].odu_numero);
      }
    });
  });

  describe("getAllOdus", () => {
    it("returns an array of unique Odu names", () => {
      const result = getAllOdus();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("returns sorted array", () => {
      const result = getAllOdus();
      const sorted = [...result].sort();
      expect(result).toEqual(sorted);
    });

    it("contains expected Odu names", () => {
      const result = getAllOdus();
      expect(result).toContain("Ogundá");
      expect(result).toContain("Irossun");
      expect(result).toContain("Ejilsebora");
      expect(result).toContain("Oxum");
      expect(result).toContain("Obará");
      expect(result).toContain("Etaogundá");
      expect(result).toContain("Ofun");
      expect(result).toContain("Alafia");
    });
  });

  describe("getSoundsByOdu", () => {
    it("returns sounds for Ogundá", () => {
      const result = getSoundsByOdu("Ogundá");
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(s => s.odu === "Ogundá")).toBe(true);
    });

    it("returns sounds for Ejilsebora", () => {
      const result = getSoundsByOdu("Ejilsebora");
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(s => s.odu === "Ejilsebora")).toBe(true);
    });

    it("returns empty array for unknown Odu", () => {
      const result = getSoundsByOdu("UnknownOdu");
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it("handles empty/null input", () => {
      expect(getSoundsByOdu("")).toEqual([]);
      expect(getSoundsByOdu(null as unknown as string)).toEqual([]);
    });
  });

  describe("getHealingProperties", () => {
    it("returns healing properties for LAM", () => {
      const result = getHealingProperties("LAM");
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result!.length).toBeGreaterThan(0);
      expect(result).toContain("Dissolução de medos de sobrevivência e escassez");
    });

    it("returns healing properties for VAM", () => {
      const result = getHealingProperties("VAM");
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toContain("Limpeza de traumas emocionais do passado");
    });

    it("returns healing properties for OM", () => {
      const result = getHealingProperties("OM");
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toContain("Conexão com a consciência cósmica e universal");
    });

    it("returns undefined for unknown sound", () => {
      expect(getHealingProperties("UNKNOWN")).toBeUndefined();
    });
  });

  describe("getElementSoundOdu", () => {
    it("returns Terra for LAM", () => {
      expect(getElementSoundOdu("LAM")).toBe("Terra");
    });

    it("returns Água for VAM", () => {
      expect(getElementSoundOdu("VAM")).toBe("Água");
    });

    it("returns Fogo for RAM", () => {
      expect(getElementSoundOdu("RAM")).toBe("Fogo");
    });

    it("returns Ar for YAM", () => {
      expect(getElementSoundOdu("YAM")).toBe("Ar");
    });

    it("returns Éter for OM", () => {
      expect(getElementSoundOdu("OM")).toBe("Éter");
    });

    it("returns undefined for unknown sound", () => {
      expect(getElementSoundOdu("UNKNOWN")).toBeUndefined();
    });
  });

  describe("getOrixaBySound", () => {
    it("returns Ogum for LAM", () => {
      expect(getOrixaBySound("LAM")).toBe("Ogum");
    });

    it("returns Oxum for VAM", () => {
      expect(getOrixaBySound("VAM")).toBe("Oxum");
    });

    it("returns Xangô for RAM", () => {
      expect(getOrixaBySound("RAM")).toBe("Xangô");
    });

    it("returns Oxalá for OM", () => {
      expect(getOrixaBySound("OM")).toBe("Oxalá");
    });

    it("returns undefined for unknown sound", () => {
      expect(getOrixaBySound("UNKNOWN")).toBeUndefined();
    });
  });

  describe("Sound-Odu spiritual correlation completeness", () => {
    it("has sounds for all four elements plus Éter", () => {
      const sounds = getAllSoundOdus();
      const elements = new Set(sounds.map(s => s.elemento));
      expect(elements.has("Terra")).toBe(true);
      expect(elements.has("Água")).toBe(true);
      expect(elements.has("Fogo")).toBe(true);
      expect(elements.has("Ar")).toBe(true);
      expect(elements.has("Éter")).toBe(true);
    });

    it("has sounds covering all seven chakras", () => {
      const sounds = getAllSoundOdus();
      const chakras = new Set(sounds.map(s => s.chakra_numero));
      expect(chakras.has(1)).toBe(true);
      expect(chakras.has(2)).toBe(true);
      expect(chakras.has(3)).toBe(true);
      expect(chakras.has(4)).toBe(true);
      expect(chakras.has(5)).toBe(true);
      expect(chakras.has(6)).toBe(true);
      expect(chakras.has(7)).toBe(true);
    });

    it("has sounds with healing properties defined", () => {
      const sounds = getAllSoundOdus();
      sounds.forEach(sound => {
        expect(sound.propriedades_cura).toBeDefined();
        expect(sound.propriedades_cura.length).toBeGreaterThan(0);
      });
    });

    it("has sounds with pronunciation guide", () => {
      const sounds = getAllSoundOdus();
      sounds.forEach(sound => {
        expect(sound.pronunciacao).toBeDefined();
        expect(sound.pronunciacao.length).toBeGreaterThan(0);
      });
    });

    it("has sounds with spiritual dynamics defined", () => {
      const sounds = getAllSoundOdus();
      sounds.forEach(sound => {
        expect(sound.dinamica).toBeDefined();
        expect(sound.dinamica.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Frequency consistency", () => {
    it("has correct Solfeggio frequencies for each element", () => {
      // Terra - 396 Hz
      const lam = getSoundOdu("LAM");
      expect(lam?.frequencia).toBe(396);

      // Água - 417 Hz
      const vam = getSoundOdu("VAM");
      expect(vam?.frequencia).toBe(417);

      // Fogo - 528 Hz
      const ram = getSoundOdu("RAM");
      expect(ram?.frequencia).toBe(528);

      // Éter - 963 Hz
      const om = getSoundOdu("OM");
      expect(om?.frequencia).toBe(963);
    });
  });
});