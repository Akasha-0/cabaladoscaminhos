import { describe, it, expect } from "vitest";
import { getChakraSound, getAllChakraSounds } from "@/lib/correlation/chakra-sound";

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
    });

    it("returns correct mapping for 2º Sacro (Sacral)", () => {
      const result = getChakraSound("2º Sacro");
      expect(result).toBeDefined();
      expect(result!.chakra_numero).toBe(2);
      expect(result!.som_semente).toBe("VAM");
      expect(result!.frequencia).toBe(417);
      expect(result!.elemento).toBe("Água");
    });

    it("returns correct mapping for 3º Plexo Solar (Solar Plexus)", () => {
      const result = getChakraSound("3º Plexo Solar");
      expect(result).toBeDefined();
      expect(result!.chakra_numero).toBe(3);
      expect(result!.som_semente).toBe("RAM");
      expect(result!.frequencia).toBe(528);
      expect(result!.elemento).toBe("Fogo");
    });

    it("returns correct mapping for 4º Cardíaco (Heart)", () => {
      const result = getChakraSound("4º Cardíaco");
      expect(result).toBeDefined();
      expect(result!.chakra_numero).toBe(4);
      expect(result!.som_semente).toBe("YAM");
      expect(result!.frequencia).toBe(639);
      expect(result!.elemento).toBe("Ar");
    });

    it("returns correct mapping for 5º Laríngeo (Throat)", () => {
      const result = getChakraSound("5º Laríngeo");
      expect(result).toBeDefined();
      expect(result!.chakra_numero).toBe(5);
      expect(result!.som_semente).toBe("HAM");
      expect(result!.frequencia).toBe(741);
      expect(result!.elemento).toBe("Ar");
    });
    it("returns correct mapping for 6º Frontal (Third Eye)", () => {
      const result = getChakraSound("6º Frontal");
      expect(result).toBeDefined();
      expect(result!.chakra_numero).toBe(6);
      expect(result!.som_semente).toBe("OM");
      expect(result!.frequencia).toBe(852);
      expect(result!.elemento).toBe("Éter");
    });

    it("returns correct mapping for 7º Coronário (Crown)", () => {
      const result = getChakraSound("7º Coronário");
      expect(result).toBeDefined();
      expect(result!.chakra_numero).toBe(7);
      expect(result!.som_semente).toBe("OM");
      expect(result!.frequencia).toBe(963);
      expect(result!.elemento).toBe("Éter");
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
  });
});