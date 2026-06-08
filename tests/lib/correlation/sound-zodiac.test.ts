import { describe, it, expect } from "vitest";
import { getSoundZodiac, getZodiacSound, getAllSoundZodiacs } from "@/lib/correlation/sound-zodiac";

describe("sound-zodiac correlation", () => {
  describe("getSoundZodiac", () => {
    it("returns correct mapping for RAM (Áries)", () => {
      const result = getSoundZodiac("RAM");
      expect(result).toBeDefined();
      expect(result!.som).toBe("RAM");
      expect(result!.signo).toBe("Áries");
      expect(result!.signo_numero).toBe(1);
      expect(result!.elemento).toBe("Fogo");
      expect(result!.frequencia_healing).toBe(432);
      expect(result!.chakra).toContain("Raiz");
      expect(result!.intencao_primaria).toContain("Coragem");
    });

    it("returns correct mapping for VAM (Touro)", () => {
      const result = getSoundZodiac("VAM");
      expect(result).toBeDefined();
      expect(result!.som).toBe("VAM");
      expect(result!.signo).toBe("Touro");
      expect(result!.signo_numero).toBe(2);
      expect(result!.elemento).toBe("Terra");
      expect(result!.frequencia_healing).toBe(396);
      expect(result!.chakra).toContain("Sacro");
    });

    it("returns correct mapping for KAM (Gémeos)", () => {
      const result = getSoundZodiac("KAM");
      expect(result).toBeDefined();
      expect(result!.som).toBe("KAM");
      expect(result!.signo).toBe("Gémeos");
      expect(result!.signo_numero).toBe(3);
      expect(result!.elemento).toBe("Ar");
      expect(result!.frequencia_healing).toBe(417);
    });

    it("returns correct mapping for DAM (Câncer)", () => {
      const result = getSoundZodiac("DAM");
      expect(result).toBeDefined();
      expect(result!.som).toBe("DAM");
      expect(result!.signo).toBe("Câncer");
      expect(result!.signo_numero).toBe(4);
      expect(result!.elemento).toBe("Água");
      expect(result!.frequencia_healing).toBe(528);
    });

    it("returns correct mapping for MAM (Leão)", () => {
      const result = getSoundZodiac("MAM");
      expect(result).toBeDefined();
      expect(result!.som).toBe("MAM");
      expect(result!.signo).toBe("Leão");
      expect(result!.signo_numero).toBe(5);
      expect(result!.elemento).toBe("Fogo");
      expect(result!.frequencia_healing).toBe(639);
    });

    it("returns correct mapping for PAM (Virgem)", () => {
      const result = getSoundZodiac("PAM");
      expect(result).toBeDefined();
      expect(result!.som).toBe("PAM");
      expect(result!.signo).toBe("Virgem");
      expect(result!.signo_numero).toBe(6);
      expect(result!.elemento).toBe("Terra");
      expect(result!.frequencia_healing).toBe(741);
    });

    it("returns correct mapping for TAM (Libra)", () => {
      const result = getSoundZodiac("TAM");
      expect(result).toBeDefined();
      expect(result!.som).toBe("TAM");
      expect(result!.signo).toBe("Libra");
      expect(result!.signo_numero).toBe(7);
      expect(result!.elemento).toBe("Ar");
      expect(result!.frequencia_healing).toBe(852);
    });

    it("returns correct mapping for SAM (Escorpião)", () => {
      const result = getSoundZodiac("SAM");
      expect(result).toBeDefined();
      expect(result!.som).toBe("SAM");
      expect(result!.signo).toBe("Escorpião");
      expect(result!.signo_numero).toBe(8);
      expect(result!.elemento).toBe("Água");
      expect(result!.frequencia_healing).toBe(963);
    });

    it("returns correct mapping for NAM (Sagitário)", () => {
      const result = getSoundZodiac("NAM");
      expect(result).toBeDefined();
      expect(result!.som).toBe("NAM");
      expect(result!.signo).toBe("Sagitário");
      expect(result!.signo_numero).toBe(9);
      expect(result!.elemento).toBe("Fogo");
      expect(result!.frequencia_healing).toBe(174);
    });

    it("returns correct mapping for SHAM (Capricórnio)", () => {
      const result = getSoundZodiac("SHAM");
      expect(result).toBeDefined();
      expect(result!.som).toBe("SHAM");
      expect(result!.signo).toBe("Capricórnio");
      expect(result!.signo_numero).toBe(10);
      expect(result!.elemento).toBe("Terra");
      expect(result!.frequencia_healing).toBe(285);
    });

    it("returns correct mapping for HUM (Aquário)", () => {
      const result = getSoundZodiac("HUM");
      expect(result).toBeDefined();
      expect(result!.som).toBe("HUM");
      expect(result!.signo).toBe("Aquário");
      expect(result!.signo_numero).toBe(11);
      expect(result!.elemento).toBe("Ar");
      expect(result!.frequencia_healing).toBe(396);
    });

    it("returns correct mapping for OM (Peixes)", () => {
      const result = getSoundZodiac("OM");
      expect(result).toBeDefined();
      expect(result!.som).toBe("OM");
      expect(result!.signo).toBe("Peixes");
      expect(result!.signo_numero).toBe(12);
      expect(result!.elemento).toBe("Água");
      expect(result!.frequencia_healing).toBe(432);
    });

    it("accepts lowercase sacred sound", () => {
      const result = getSoundZodiac("ram");
      expect(result).toBeDefined();
      expect(result!.signo).toBe("Áries");
    });

    it("accepts frequency as number", () => {
      const result = getSoundZodiac(528);
      expect(result).toBeDefined();
      expect(result!.signo).toBe("Câncer");
      expect(result!.som).toBe("DAM");
    });

    it("accepts frequency as string", () => {
      const result = getSoundZodiac("963");
      expect(result).toBeDefined();
      expect(result!.signo).toBe("Escorpião");
    });

    it("accepts OM as AUM", () => {
      const result = getSoundZodiac("AUM");
      expect(result).toBeDefined();
      expect(result!.signo).toBe("Peixes");
    });

    it("accepts OM as OHM", () => {
      const result = getSoundZodiac("OHM");
      expect(result).toBeDefined();
      expect(result!.signo).toBe("Peixes");
    });

    it("returns undefined for unknown sound", () => {
      const result = getSoundZodiac("XYZ");
      expect(result).toBeUndefined();
    });

    it("returns undefined for invalid frequency", () => {
      const result = getSoundZodiac("999");
      expect(result).toBeUndefined();
    });

    it("returns undefined for empty input", () => {
      const result = getSoundZodiac("");
      expect(result).toBeUndefined();
    });
  });

  describe("getZodiacSound", () => {
    it("returns correct sound for Áries", () => {
      const result = getZodiacSound("Áries");
      expect(result).toBeDefined();
      expect(result!.signo).toBe("Áries");
      expect(result!.som).toBe("RAM");
      expect(result!.signo_numero).toBe(1);
      expect(result!.elemento).toBe("Fogo");
    });

    it("returns correct sound for Touro", () => {
      const result = getZodiacSound("Touro");
      expect(result).toBeDefined();
      expect(result!.signo).toBe("Touro");
      expect(result!.som).toBe("VAM");
      expect(result!.frequencia_healing).toBe(396);
    });

    it("returns correct sound for Gémeos", () => {
      const result = getZodiacSound("Gémeos");
      expect(result).toBeDefined();
      expect(result!.signo).toBe("Gémeos");
      expect(result!.som).toBe("KAM");
    });

    it("returns correct sound for Câncer", () => {
      const result = getZodiacSound("Câncer");
      expect(result).toBeDefined();
      expect(result!.signo).toBe("Câncer");
      expect(result!.som).toBe("DAM");
    });

    it("returns correct sound for Leão", () => {
      const result = getZodiacSound("Leão");
      expect(result).toBeDefined();
      expect(result!.signo).toBe("Leão");
      expect(result!.som).toBe("MAM");
    });

    it("returns correct sound for Virgem", () => {
      const result = getZodiacSound("Virgem");
      expect(result).toBeDefined();
      expect(result!.signo).toBe("Virgem");
      expect(result!.som).toBe("PAM");
    });

    it("returns correct sound for Libra", () => {
      const result = getZodiacSound("Libra");
      expect(result).toBeDefined();
      expect(result!.signo).toBe("Libra");
      expect(result!.som).toBe("TAM");
    });

    it("returns correct sound for Escorpião", () => {
      const result = getZodiacSound("Escorpião");
      expect(result).toBeDefined();
      expect(result!.signo).toBe("Escorpião");
      expect(result!.som).toBe("SAM");
    });

    it("returns correct sound for Sagitário", () => {
      const result = getZodiacSound("Sagitário");
      expect(result).toBeDefined();
      expect(result!.signo).toBe("Sagitário");
      expect(result!.som).toBe("NAM");
    });

    it("returns correct sound for Capricórnio", () => {
      const result = getZodiacSound("Capricórnio");
      expect(result).toBeDefined();
      expect(result!.signo).toBe("Capricórnio");
      expect(result!.som).toBe("SHAM");
    });

    it("returns correct sound for Aquário", () => {
      const result = getZodiacSound("Aquário");
      expect(result).toBeDefined();
      expect(result!.signo).toBe("Aquário");
      expect(result!.som).toBe("HUM");
    });

    it("returns correct sound for Peixes", () => {
      const result = getZodiacSound("Peixes");
      expect(result).toBeDefined();
      expect(result!.signo).toBe("Peixes");
      expect(result!.som).toBe("OM");
    });

    it("accepts sign number as string", () => {
      const result = getZodiacSound("5");
      expect(result).toBeDefined();
      expect(result!.signo).toBe("Leão");
      expect(result!.som).toBe("MAM");
    });

    it("accepts lowercase sign name", () => {
      const result = getZodiacSound("aries");
      expect(result).toBeDefined();
      expect(result!.signo).toBe("Áries");
    });

    it("accepts sign name without accent", () => {
      const result = getZodiacSound("gemeos");
      expect(result).toBeDefined();
      expect(result!.signo).toBe("Gémeos");
    });

    it("accepts partial sign name", () => {
      const result = getZodiacSound("Ari");
      expect(result).toBeDefined();
      expect(result!.signo).toBe("Áries");
    });

    it("returns undefined for unknown sign", () => {
      const result = getZodiacSound("Zodíaco");
      expect(result).toBeUndefined();
    });

    it("returns undefined for empty input", () => {
      const result = getZodiacSound("");
      expect(result).toBeUndefined();
    });
  });

  describe("getAllSoundZodiacs", () => {
    it("returns all 12 zodiac signs", () => {
      const result = getAllSoundZodiacs();
      expect(result).toHaveLength(12);
    });

    it("returns signs ordered by sign number", () => {
      const result = getAllSoundZodiacs();
      expect(result[0].signo_numero).toBe(1);
      expect(result[11].signo_numero).toBe(12);
    });

    it("contains all expected fields for each sound", () => {
      const result = getAllSoundZodiacs();
      result.forEach((sound) => {
        expect(sound.som).toBeDefined();
        expect(sound.pronunciacao).toBeDefined();
        expect(sound.signo).toBeDefined();
        expect(sound.signo_numero).toBeDefined();
        expect(sound.elemento).toBeDefined();
        expect(sound.frequencia_healing).toBeDefined();
        expect(sound.chakra).toBeDefined();
        expect(sound.propriedades_cura).toBeDefined();
        expect(sound.intencao_primaria).toBeDefined();
        expect(sound.descricao).toBeDefined();
      });
    });

    it("includes signs from all four elements", () => {
      const result = getAllSoundZodiacs();
      const elementos = result.map((s) => s.elemento);
      expect(elementos).toContain("Fogo");
      expect(elementos).toContain("Terra");
      expect(elementos).toContain("Ar");
      expect(elementos).toContain("Água");
    });

    it("each element appears exactly 3 times", () => {
      const result = getAllSoundZodiacs();
      const elementos = result.map((s) => s.elemento);
      const count = (el: string) => elementos.filter((e) => e === el).length;
      expect(count("Fogo")).toBe(3);
      expect(count("Terra")).toBe(3);
      expect(count("Ar")).toBe(3);
      expect(count("Água")).toBe(3);
    });

    it("has unique sounds for each sign", () => {
      const result = getAllSoundZodiacs();
      const sounds = result.map((s) => s.som);
      const uniqueSounds = new Set(sounds);
      expect(uniqueSounds.size).toBe(12);
    });

    it("has healing properties for each sound", () => {
      const result = getAllSoundZodiacs();
      result.forEach((sound) => {
        expect(sound.propriedades_cura.length).toBeGreaterThan(0);
      });
    });
  });
});
