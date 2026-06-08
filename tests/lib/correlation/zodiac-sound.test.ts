import { describe, it, expect } from "vitest";
import { getZodiacSound, getSoundZodiac, getAllZodiacSounds } from "@/lib/correlation/zodiac-sound";

describe("zodiac-sound correlation", () => {
  describe("getZodiacSound", () => {
    it("returns correct mapping for Áries (1)", () => {
      const result = getZodiacSound("Áries");
      expect(result).toBeDefined();
      expect(result!.signo).toBe("Áries");
      expect(result!.signo_numero).toBe(1);
      expect(result!.som_sagrado).toBe("RAM");
      expect(result!.frequencia_cura).toBe(432);
      expect(result!.nota_musical).toBe("C#");
      expect(result!.elemento).toBe("Fogo");
      expect(result!.descricao).toContain("coragem");
    });

    it("returns correct mapping for Touro (2)", () => {
      const result = getZodiacSound("Touro");
      expect(result).toBeDefined();
      expect(result!.signo_numero).toBe(2);
      expect(result!.som_sagrado).toBe("VAM");
      expect(result!.frequencia_cura).toBe(396);
      expect(result!.nota_musical).toBe("D");
      expect(result!.elemento).toBe("Terra");
      expect(result!.descricao).toContain("estabilidade");
    });

    it("returns correct mapping for Gémeos (3)", () => {
      const result = getZodiacSound("Gémeos");
      expect(result).toBeDefined();
      expect(result!.signo_numero).toBe(3);
      expect(result!.som_sagrado).toBe("KAM");
      expect(result!.frequencia_cura).toBe(417);
      expect(result!.nota_musical).toBe("D#");
      expect(result!.elemento).toBe("Ar");
      expect(result!.descricao).toContain("comunicação");
    });

    it("returns correct mapping for Câncer (4)", () => {
      const result = getZodiacSound("Câncer");
      expect(result).toBeDefined();
      expect(result!.signo_numero).toBe(4);
      expect(result!.som_sagrado).toBe("DAM");
      expect(result!.frequencia_cura).toBe(528);
      expect(result!.nota_musical).toBe("E");
      expect(result!.elemento).toBe("Água");
      expect(result!.descricao).toContain("proteção");
    });

    it("returns correct mapping for Leão (5)", () => {
      const result = getZodiacSound("Leão");
      expect(result).toBeDefined();
      expect(result!.signo_numero).toBe(5);
      expect(result!.som_sagrado).toBe("MAM");
      expect(result!.frequencia_cura).toBe(639);
      expect(result!.nota_musical).toBe("F");
      expect(result!.elemento).toBe("Fogo");
      expect(result!.descricao).toContain("criatividade");
    });

    it("returns correct mapping for Virgem (6)", () => {
      const result = getZodiacSound("Virgem");
      expect(result).toBeDefined();
      expect(result!.signo_numero).toBe(6);
      expect(result!.som_sagrado).toBe("PAM");
      expect(result!.frequencia_cura).toBe(741);
      expect(result!.nota_musical).toBe("F#");
      expect(result!.elemento).toBe("Terra");
      expect(result!.descricao).toContain("organização");
    });

    it("returns correct mapping for Libra (7)", () => {
      const result = getZodiacSound("Libra");
      expect(result).toBeDefined();
      expect(result!.signo_numero).toBe(7);
      expect(result!.som_sagrado).toBe("TAM");
      expect(result!.frequencia_cura).toBe(852);
      expect(result!.nota_musical).toBe("G");
      expect(result!.elemento).toBe("Ar");
      expect(result!.descricao).toContain("harmonia");
    });

    it("returns correct mapping for Escorpião (8)", () => {
      const result = getZodiacSound("Escorpião");
      expect(result).toBeDefined();
      expect(result!.signo_numero).toBe(8);
      expect(result!.som_sagrado).toBe("SAM");
      expect(result!.frequencia_cura).toBe(963);
      expect(result!.nota_musical).toBe("G#");
      expect(result!.elemento).toBe("Água");
      expect(result!.descricao).toContain("transformação");
    });

    it("returns correct mapping for Sagitário (9)", () => {
      const result = getZodiacSound("Sagitário");
      expect(result).toBeDefined();
      expect(result!.signo_numero).toBe(9);
      expect(result!.som_sagrado).toBe("NAM");
      expect(result!.frequencia_cura).toBe(174);
      expect(result!.nota_musical).toBe("A");
      expect(result!.elemento).toBe("Fogo");
      expect(result!.descricao).toContain("aventura");
    });

    it("returns correct mapping for Capricórnio (10)", () => {
      const result = getZodiacSound("Capricórnio");
      expect(result).toBeDefined();
      expect(result!.signo_numero).toBe(10);
      expect(result!.som_sagrado).toBe("SHAM");
      expect(result!.frequencia_cura).toBe(285);
      expect(result!.nota_musical).toBe("A#");
      expect(result!.elemento).toBe("Terra");
      expect(result!.descricao).toContain("disciplina");
    });

    it("returns correct mapping for Aquário (11)", () => {
      const result = getZodiacSound("Aquário");
      expect(result).toBeDefined();
      expect(result!.signo_numero).toBe(11);
      expect(result!.som_sagrado).toBe("HUM");
      expect(result!.frequencia_cura).toBe(396);
      expect(result!.nota_musical).toBe("B");
      expect(result!.elemento).toBe("Ar");
      expect(result!.descricao).toContain("inovação");
    });

    it("returns correct mapping for Peixes (12)", () => {
      const result = getZodiacSound("Peixes");
      expect(result).toBeDefined();
      expect(result!.signo_numero).toBe(12);
      expect(result!.som_sagrado).toBe("OM");
      expect(result!.frequencia_cura).toBe(432);
      expect(result!.nota_musical).toBe("C");
      expect(result!.elemento).toBe("Água");
      expect(result!.descricao).toContain("transcendência");
    });

    it("accepts sign number as string", () => {
      const result = getZodiacSound("5");
      expect(result).toBeDefined();
      expect(result!.signo).toBe("Leão");
      expect(result!.som_sagrado).toBe("MAM");
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

  describe("getSoundZodiac", () => {
    it("returns correct zodiac for sacred sound RAM", () => {
      const result = getSoundZodiac("RAM");
      expect(result).toBeDefined();
      expect(result!.signo).toBe("Áries");
      expect(result!.frequencia_cura).toBe(432);
    });

    it("returns correct zodiac for sacred sound VAM", () => {
      const result = getSoundZodiac("VAM");
      expect(result).toBeDefined();
      expect(result!.signo).toBe("Touro");
      expect(result!.frequencia_cura).toBe(396);
    });

    it("returns correct zodiac for sacred sound OM", () => {
      const result = getSoundZodiac("OM");
      expect(result).toBeDefined();
      expect(result!.signo).toBe("Peixes");
      expect(result!.frequencia_cura).toBe(432);
    });

    it("returns correct zodiac for frequency 528", () => {
      const result = getSoundZodiac("528");
      expect(result).toBeDefined();
      expect(result!.signo).toBe("Câncer");
      expect(result!.som_sagrado).toBe("DAM");
    });

    it("returns correct zodiac for frequency 963", () => {
      const result = getSoundZodiac("963");
      expect(result).toBeDefined();
      expect(result!.signo).toBe("Escorpião");
      expect(result!.som_sagrado).toBe("SAM");
    });

    it("returns correct zodiac for musical note F", () => {
      const result = getSoundZodiac("F");
      expect(result).toBeDefined();
      expect(result!.signo).toBe("Leão");
      expect(result!.frequencia_cura).toBe(639);
    });

    it("returns correct zodiac for musical note C#", () => {
      const result = getSoundZodiac("C#");
      expect(result).toBeDefined();
      expect(result!.signo).toBe("Áries");
    });

    it("accepts lowercase sacred sound", () => {
      const result = getSoundZodiac("ram");
      expect(result).toBeDefined();
      expect(result!.signo).toBe("Áries");
    });

    it("accepts frequency as number", () => {
      const result = getSoundZodiac(741);
      expect(result).toBeDefined();
      expect(result!.signo).toBe("Virgem");
    });

    it("returns undefined for unknown sound", () => {
      const result = getSoundZodiac("XYZ");
      expect(result).toBeUndefined();
    });

    it("returns undefined for invalid frequency", () => {
      const result = getSoundZodiac("999");
      expect(result).toBeUndefined();
    });
  });

  describe("getAllZodiacSounds", () => {
    it("returns all 12 zodiac signs", () => {
      const result = getAllZodiacSounds();
      expect(result).toHaveLength(12);
    });

    it("returns signs ordered by sign number", () => {
      const result = getAllZodiacSounds();
      expect(result[0].signo_numero).toBe(1);
      expect(result[11].signo_numero).toBe(12);
    });

    it("contains all expected fields for each sign", () => {
      const result = getAllZodiacSounds();
      result.forEach((zodiac) => {
        expect(zodiac.signo).toBeDefined();
        expect(zodiac.signo_numero).toBeDefined();
        expect(zodiac.som_sagrado).toBeDefined();
        expect(zodiac.frequencia_cura).toBeDefined();
        expect(zodiac.nota_musical).toBeDefined();
        expect(zodiac.elemento).toBeDefined();
        expect(zodiac.descricao).toBeDefined();
      });
    });

    it("includes signs from all four elements", () => {
      const result = getAllZodiacSounds();
      const elementos = result.map((z) => z.elemento);
      expect(elementos).toContain("Fogo");
      expect(elementos).toContain("Terra");
      expect(elementos).toContain("Ar");
      expect(elementos).toContain("Água");
    });

    it("each element appears exactly 3 times", () => {
      const result = getAllZodiacSounds();
      const elementos = result.map((z) => z.elemento);
      const count = (el: string) => elementos.filter((e) => e === el).length;
      expect(count("Fogo")).toBe(3);
      expect(count("Terra")).toBe(3);
      expect(count("Ar")).toBe(3);
      expect(count("Água")).toBe(3);
    });
  });
});
