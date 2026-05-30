import { describe, it, expect } from "vitest";
import { getChakraSound, getSoundChakra, getAllChakraSounds } from "@/lib/correlation/chakra-sound";

describe("chakra-sound correlation", () => {
  describe("getChakraSound", () => {
    it("returns correct mapping for 1º Básico (Root)", () => {
      const result = getChakraSound("1º Básico");
      expect(result).toBeDefined();
      expect(result!.chakra).toBe("1º Básico");
      expect(result!.chakra_numero).toBe(1);
      expect(result!.som_semente).toBe("LAM");
      expect(result!.mantram).toBe("Lam");
      expect(result!.frequencia).toBe(396);
      expect(result!.elemento).toBe("Terra");
      expect(result!.pronunciacao).toContain("lahm");
    });

    it("returns correct mapping for 2º Sacro (Sacral)", () => {
      const result = getChakraSound("2º Sacro");
      expect(result).toBeDefined();
      expect(result!.chakra_numero).toBe(2);
      expect(result!.som_semente).toBe("VAM");
      expect(result!.frequencia).toBe(417);
      expect(result!.elemento).toBe("Água");
      expect(result!.pronunciacao).toContain("vahm");
    });

    it("returns correct mapping for 3º Plexo Solar (Solar Plexus)", () => {
      const result = getChakraSound("3º Plexo Solar");
      expect(result).toBeDefined();
      expect(result!.chakra_numero).toBe(3);
      expect(result!.som_semente).toBe("RAM");
      expect(result!.frequencia).toBe(528);
      expect(result!.elemento).toBe("Fogo");
      expect(result!.pronunciacao).toContain("rahm");
    });

    it("returns correct mapping for 4º Cardíaco (Heart)", () => {
      const result = getChakraSound("4º Cardíaco");
      expect(result).toBeDefined();
      expect(result!.chakra_numero).toBe(4);
      expect(result!.som_semente).toBe("YAM");
      expect(result!.frequencia).toBe(639);
      expect(result!.elemento).toBe("Ar");
      expect(result!.pronunciacao).toContain("yyahm");
    });

    it("returns correct mapping for 5º Laríngeo (Throat)", () => {
      const result = getChakraSound("5º Laríngeo");
      expect(result).toBeDefined();
      expect(result!.chakra_numero).toBe(5);
      expect(result!.som_semente).toBe("HAM");
      expect(result!.frequencia).toBe(741);
      expect(result!.elemento).toBe("Ar");
      expect(result!.pronunciacao).toContain("hahm");
    });

    it("returns correct mapping for 6º Frontal (Third Eye)", () => {
      const result = getChakraSound("6º Frontal");
      expect(result).toBeDefined();
      expect(result!.chakra_numero).toBe(6);
      expect(result!.som_semente).toBe("OM");
      expect(result!.frequencia).toBe(852);
      expect(result!.elemento).toBe("Éter");
      expect(result!.pronunciacao).toContain("oh-umm");
    });

    it("returns correct mapping for 7º Coronário (Crown)", () => {
      const result = getChakraSound("7º Coronário");
      expect(result).toBeDefined();
      expect(result!.chakra_numero).toBe(7);
      expect(result!.som_semente).toBe("OM");
      expect(result!.frequencia).toBe(963);
      expect(result!.elemento).toBe("Éter");
      expect(result!.pronunciacao).toContain("a-u-umm");
    });

    it("accepts chakra number as string", () => {
      const result = getChakraSound("3");
      expect(result).toBeDefined();
      expect(result!.chakra_numero).toBe(3);
      expect(result!.som_semente).toBe("RAM");
    });

    it("returns undefined for unknown chakra", () => {
      const result = getChakraSound("8º Inválido");
      expect(result).toBeUndefined();
    });
  });

  describe("getSoundChakra", () => {
    it("returns correct chakra for seed syllable LAM", () => {
      const result = getSoundChakra("LAM");
      expect(result).toBeDefined();
      expect(result!.chakra).toBe("1º Básico");
      expect(result!.frequencia).toBe(396);
    });

    it("returns correct chakra for seed syllable VAM", () => {
      const result = getSoundChakra("VAM");
      expect(result).toBeDefined();
      expect(result!.chakra).toBe("2º Sacro");
      expect(result!.frequencia).toBe(417);
    });

    it("returns correct chakra for seed syllable RAM", () => {
      const result = getSoundChakra("RAM");
      expect(result).toBeDefined();
      expect(result!.chakra).toBe("3º Plexo Solar");
      expect(result!.frequencia).toBe(528);
    });

    it("returns correct chakra for seed syllable YAM", () => {
      const result = getSoundChakra("YAM");
      expect(result).toBeDefined();
      expect(result!.chakra).toBe("4º Cardíaco");
      expect(result!.frequencia).toBe(639);
    });

    it("returns correct chakra for seed syllable HAM", () => {
      const result = getSoundChakra("HAM");
      expect(result).toBeDefined();
      expect(result!.chakra).toBe("5º Laríngeo");
      expect(result!.frequencia).toBe(741);
    });

    it("returns correct chakra for seed syllable OM (6º Frontal)", () => {
      const result = getSoundChakra("OM");
      expect(result).toBeDefined();
      expect(result!.chakra).toBe("6º Frontal");
      expect(result!.frequencia).toBe(852);
    });

    it("returns correct chakra for mantram Aum (7º Coronário)", () => {
      const result = getSoundChakra("Aum");
      expect(result).toBeDefined();
      expect(result!.chakra).toBe("7º Coronário");
      expect(result!.frequencia).toBe(963);
    });

    it("accepts lowercase seed syllable", () => {
      const result = getSoundChakra("lam");
      expect(result).toBeDefined();
      expect(result!.chakra).toBe("1º Básico");
    });

    it("accepts lowercase mantram", () => {
      const result = getSoundChakra("om");
      expect(result).toBeDefined();
      expect(result!.chakra).toBe("6º Frontal");
    });

    it("returns undefined for unknown sound", () => {
      const result = getSoundChakra("XYZ");
      expect(result).toBeUndefined();
    });
  });

  describe("getAllChakraSounds", () => {
    it("returns all 7 chakras", () => {
      const result = getAllChakraSounds();
      expect(result).toHaveLength(7);
    });

    it("returns chakras in ascending order by number", () => {
      const result = getAllChakraSounds();
      expect(result[0].chakra_numero).toBe(1);
      expect(result[6].chakra_numero).toBe(7);
    });

    it("contains all expected seed syllables", () => {
      const result = getAllChakraSounds();
      const syllables = result.map((r) => r.som_semente);
      expect(syllables).toContain("LAM");
      expect(syllables).toContain("VAM");
      expect(syllables).toContain("RAM");
      expect(syllables).toContain("YAM");
      expect(syllables).toContain("HAM");
      expect(syllables).toContain("OM");
    });

    it("contains all expected frequencies", () => {
      const result = getAllChakraSounds();
      const frequencies = result.map((r) => r.frequencia);
      expect(frequencies).toContain(396);
      expect(frequencies).toContain(417);
      expect(frequencies).toContain(528);
      expect(frequencies).toContain(639);
      expect(frequencies).toContain(741);
      expect(frequencies).toContain(852);
      expect(frequencies).toContain(963);
    });

    it("contains all five elements", () => {
      const result = getAllChakraSounds();
      const elements = result.map((r) => r.elemento);
      const uniqueElements = [...new Set(elements)];
      expect(uniqueElements).toContain("Terra");
      expect(uniqueElements).toContain("Água");
      expect(uniqueElements).toContain("Fogo");
      expect(uniqueElements).toContain("Ar");
      expect(uniqueElements).toContain("Éter");
    });

    it("contains pronunciacao for all chakras", () => {
      const result = getAllChakraSounds();
      result.forEach((r) => {
        expect(r.pronunciacao).toBeDefined();
        expect(r.pronunciacao.length).toBeGreaterThan(0);
      });
    });
  });
});
