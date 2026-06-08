import { describe, it, expect } from "vitest";
import {
  getChakraSound,
  getSoundChakra,
  getAllChakraSounds,
  getChakraFrequencies,
  getChakraForPlanet,
  getFrequencyForChakra,
} from "@/lib/correlation/chakra-sound";

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

    it("accepts Sanskrit chakra name", () => {
      const result = getChakraSound("Muladhara");
      expect(result).toBeDefined();
      expect(result!.chakra).toBe("1º Básico");
      expect(result!.chakra_numero).toBe(1);
    });

    it("accepts lowercase Sanskrit name", () => {
      const result = getChakraSound("sahasrara");
      expect(result).toBeDefined();
      expect(result!.chakra).toBe("7º Coronário");
      expect(result!.chakra_numero).toBe(7);
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

    it("contains chakra_sanskrit for all chakras", () => {
      const result = getAllChakraSounds();
      const sanskritNames = result.map((r) => r.chakra_sanskrit);
      expect(sanskritNames).toContain("Muladhara");
      expect(sanskritNames).toContain("Svadhisthana");
      expect(sanskritNames).toContain("Manipura");
      expect(sanskritNames).toContain("Anahata");
      expect(sanskritNames).toContain("Vishuddha");
      expect(sanskritNames).toContain("Ajna");
      expect(sanskritNames).toContain("Sahasrara");
    });

    it("contains poliedro (Platonic solid) for all chakras", () => {
      const result = getAllChakraSounds();
      const poliedros = result.map((r) => r.poliedro);
      expect(poliedros).toContain("Cubo");
      expect(poliedros).toContain("Icosaedro");
      expect(poliedros).toContain("Tetraedro");
      expect(poliedros).toContain("Octaedro");
      expect(poliedros).toContain("Dodecaedro");
      expect(poliedros).toContain("Esfera");
    });

    it("contains planetas for all chakras", () => {
      const result = getAllChakraSounds();
      result.forEach((r) => {
        expect(r.planetas).toBeDefined();
        expect(r.planetas.length).toBeGreaterThan(0);
      });
    });

    it("contains nome_divino for all chakras", () => {
      const result = getAllChakraSounds();
      result.forEach((r) => {
        expect(r.nome_divino).toBeDefined();
        expect(r.nome_divino.length).toBeGreaterThan(0);
      });
    });

    it("contains direcao for all chakras", () => {
      const result = getAllChakraSounds();
      result.forEach((r) => {
        expect(r.direcao).toBeDefined();
        expect(r.direcao.length).toBeGreaterThan(0);
      });
    });
  });

  describe("getChakraFrequencies", () => {
    it("returns an array of ChakraFrequency objects", () => {
      const result = getChakraFrequencies();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(7);
    });

    it("returns objects in ascending order by chakra_numero", () => {
      const result = getChakraFrequencies();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].chakra_numero).toBeLessThan(result[i + 1].chakra_numero);
      }
    });

    it("contains all Solfeggio frequencies from 396Hz to 963Hz", () => {
      const result = getChakraFrequencies();
      const frequencies = result.map((r) => r.frequencia);
      expect(frequencies).toEqual([396, 417, 528, 639, 741, 852, 963]);
    });

    it("contains chakra and chakra_sanskrit for each entry", () => {
      const result = getChakraFrequencies();
      result.forEach((r) => {
        expect(r.chakra).toBeDefined();
        expect(r.chakra_sanskrit).toBeDefined();
        expect(r.chakra_numero).toBeDefined();
      });
    });

    it("contains som_semente and mantram for each entry", () => {
      const result = getChakraFrequencies();
      result.forEach((r) => {
        expect(r.som_semente).toBeDefined();
        expect(r.mantram).toBeDefined();
      });
    });

    it("contains poliedro geometry data for each entry", () => {
      const result = getChakraFrequencies();
      result.forEach((r) => {
        expect(r.poliedro).toBeDefined();
        expect(r.poliedro_en).toBeDefined();
        expect(typeof r.poliedro_faces).toBe("number");
      });
    });

    it("contains elemento and planetas for each entry", () => {
      const result = getChakraFrequencies();
      result.forEach((r) => {
        expect(r.elemento).toBeDefined();
        expect(Array.isArray(r.planetas)).toBe(true);
      });
    });

    it("contains nome_divino and direcao for each entry", () => {
      const result = getChakraFrequencies();
      result.forEach((r) => {
        expect(r.nome_divino).toBeDefined();
        expect(r.direcao).toBeDefined();
      });
    });

    it("maps each frequency to its correct Solfeggio value", () => {
      const result = getChakraFrequencies();
      const root = result.find((r) => r.chakra_numero === 1);
      expect(root!.frequencia).toBe(396);
      expect(root!.som_semente).toBe("LAM");
      expect(root!.poliedro).toBe("Cubo");

      const crown = result.find((r) => r.chakra_numero === 7);
      expect(crown!.frequencia).toBe(963);
      expect(crown!.som_semente).toBe("OM");
      expect(crown!.poliedro).toBe("Esfera");
    });
  });

  describe("getChakraForPlanet", () => {
    it("returns Muladhara for Lua", () => {
      const result = getChakraForPlanet("Lua");
      expect(result).toHaveLength(2);
      expect(result.some((c) => c.chakra_sanskrit === "Muladhara")).toBe(true);
      expect(result.some((c) => c.chakra_sanskrit === "Ajna")).toBe(true);
    });

    it("returns Muladhara for Saturno", () => {
      const result = getChakraForPlanet("Saturno");
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((c) => c.chakra_sanskrit === "Muladhara")).toBe(true);
    });

    it("returns Svadhisthana for Marte", () => {
      const result = getChakraForPlanet("Marte");
      expect(result).toHaveLength(2);
      expect(result.some((c) => c.chakra_sanskrit === "Svadhisthana")).toBe(true);
      expect(result.some((c) => c.chakra_sanskrit === "Manipura")).toBe(true);
    });

    it("returns Manipura for Sol", () => {
      const result = getChakraForPlanet("Sol");
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((c) => c.chakra_sanskrit === "Manipura")).toBe(true);
    });

    it("returns Manipura for Mercurio", () => {
      const result = getChakraForPlanet("Mercurio");
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((c) => c.chakra_sanskrit === "Manipura")).toBe(true);
    });

    it("returns Anahata for Jupiter", () => {
      const result = getChakraForPlanet("Jupiter");
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((c) => c.chakra_sanskrit === "Anahata")).toBe(true);
    });

    it("returns Anahata for Venus", () => {
      const result = getChakraForPlanet("Venus");
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((c) => c.chakra_sanskrit === "Anahata")).toBe(true);
    });

    it("returns Vishuddha for Mercurio", () => {
      const result = getChakraForPlanet("Mercurio");
      expect(result.some((c) => c.chakra_sanskrit === "Vishuddha")).toBe(true);
    });

    it("returns Ajna for Lua", () => {
      const result = getChakraForPlanet("Lua");
      expect(result.some((c) => c.chakra_sanskrit === "Ajna")).toBe(true);
    });

    it("returns Sahasrara for Sol", () => {
      const result = getChakraForPlanet("Sol");
      expect(result.some((c) => c.chakra_sanskrit === "Sahasrara")).toBe(true);
    });

    it("returns Sahasrara for Jupiter", () => {
      const result = getChakraForPlanet("Jupiter");
      expect(result.some((c) => c.chakra_sanskrit === "Sahasrara")).toBe(true);
    });

    it("is case-insensitive", () => {
      expect(getChakraForPlanet("sol")[0].chakra_sanskrit).toBe("Manipura");
      expect(getChakraForPlanet("SOL")[0].chakra_sanskrit).toBe("Manipura");
      expect(getChakraForPlanet("lua")[0].chakra_sanskrit).toBe("Muladhara");
      expect(getChakraForPlanet("JÚPITER")[0].chakra_sanskrit).toBe("Anahata");
    });

    it("handles accented planet names", () => {
      const result1 = getChakraForPlanet("Mercúrio");
      expect(result1.length).toBeGreaterThan(0);
      const result2 = getChakraForPlanet("Júpiter");
      expect(result2.length).toBeGreaterThan(0);
      const result3 = getChakraForPlanet("Vênus");
      expect(result3.length).toBeGreaterThan(0);
    });

    it("returns empty array for unknown planet", () => {
      expect(getChakraForPlanet("Netuno")).toEqual([]);
      expect(getChakraForPlanet("Plutão")).toEqual([]);
      expect(getChakraForPlanet("")).toEqual([]);
    });

    it("returns complete ChakraSound objects with all fields", () => {
      const result = getChakraForPlanet("Sol");
      result.forEach((c) => {
        expect(c.chakra).toBeDefined();
        expect(c.chakra_sanskrit).toBeDefined();
        expect(c.frequencia).toBeDefined();
        expect(c.som_semente).toBeDefined();
        expect(c.poliedro).toBeDefined();
        expect(c.elemento).toBeDefined();
        expect(c.planetas).toBeDefined();
      });
    });
  });

  describe("getFrequencyForChakra", () => {
    it("returns 396 Hz for 1º Básico", () => {
      expect(getFrequencyForChakra("1º Básico")).toBe(396);
    });

    it("returns 417 Hz for 2º Sacro", () => {
      expect(getFrequencyForChakra("2º Sacro")).toBe(417);
    });

    it("returns 528 Hz for 3º Plexo Solar", () => {
      expect(getFrequencyForChakra("3º Plexo Solar")).toBe(528);
    });

    it("returns 639 Hz for 4º Cardíaco", () => {
      expect(getFrequencyForChakra("4º Cardíaco")).toBe(639);
    });

    it("returns 741 Hz for 5º Laríngeo", () => {
      expect(getFrequencyForChakra("5º Laríngeo")).toBe(741);
    });

    it("returns 852 Hz for 6º Frontal", () => {
      expect(getFrequencyForChakra("6º Frontal")).toBe(852);
    });

    it("returns 963 Hz for 7º Coronário", () => {
      expect(getFrequencyForChakra("7º Coronário")).toBe(963);
    });

    it("accepts chakra number as string", () => {
      expect(getFrequencyForChakra("1")).toBe(396);
      expect(getFrequencyForChakra("7")).toBe(963);
    });

    it("accepts Sanskrit chakra name", () => {
      expect(getFrequencyForChakra("Muladhara")).toBe(396);
      expect(getFrequencyForChakra("Sahasrara")).toBe(963);
      expect(getFrequencyForChakra("Ajna")).toBe(852);
    });

    it("accepts lowercase Sanskrit name", () => {
      expect(getFrequencyForChakra("manipura")).toBe(528);
      expect(getFrequencyForChakra("anahata")).toBe(639);
    });

    it("returns undefined for unknown chakra", () => {
      expect(getFrequencyForChakra("8º Inválido")).toBeUndefined();
      expect(getFrequencyForChakra("")).toBeUndefined();
    });
  });

  describe("Complete Solfeggio frequency to chakra correlation", () => {
    const frequencies = [
      { freq: 396, chakra: "1º Básico", sanskrit: "Muladhara", elemento: "Terra", poliedro: "Cubo" },
      { freq: 417, chakra: "2º Sacro", sanskrit: "Svadhisthana", elemento: "Água", poliedro: "Icosaedro" },
      { freq: 528, chakra: "3º Plexo Solar", sanskrit: "Manipura", elemento: "Fogo", poliedro: "Tetraedro" },
      { freq: 639, chakra: "4º Cardíaco", sanskrit: "Anahata", elemento: "Ar", poliedro: "Octaedro" },
      { freq: 741, chakra: "5º Laríngeo", sanskrit: "Vishuddha", elemento: "Ar", poliedro: "Dodecaedro" },
      { freq: 852, chakra: "6º Frontal", sanskrit: "Ajna", elemento: "Éter", poliedro: "Icosaedro" },
      { freq: 963, chakra: "7º Coronário", sanskrit: "Sahasrara", elemento: "Éter", poliedro: "Esfera" },
    ];

    frequencies.forEach(({ freq, chakra, sanskrit, elemento, poliedro }) => {
      it(`maps ${freq}Hz to ${sanskrit} (${chakra}) with ${elemento} and ${poliedro}`, () => {
        const result = getChakraSound(chakra);
        expect(result).toBeDefined();
        expect(result!.frequencia).toBe(freq);
        expect(result!.chakra_sanskrit).toBe(sanskrit);
        expect(result!.elemento).toBe(elemento);
        expect(result!.poliedro).toBe(poliedro);
      });
    });
  });

  describe("Sacred geometry consistency", () => {
    it("maps Muladhara to Cubo (Hexahedron) with 6 faces", () => {
      const result = getChakraSound("Muladhara")!;
      expect(result.poliedro).toBe("Cubo");
      expect(result.poliedro_en).toBe("Hexahedron");
      expect(result.poliedro_faces).toBe(6);
    });

    it("maps Svadhisthana to Icosaedro with 20 faces", () => {
      const result = getChakraSound("Svadhisthana")!;
      expect(result.poliedro).toBe("Icosaedro");
      expect(result.poliedro_en).toBe("Icosahedron");
      expect(result.poliedro_faces).toBe(20);
    });

    it("maps Manipura to Tetraedro with 4 faces", () => {
      const result = getChakraSound("Manipura")!;
      expect(result.poliedro).toBe("Tetraedro");
      expect(result.poliedro_en).toBe("Tetrahedron");
      expect(result.poliedro_faces).toBe(4);
    });

    it("maps Anahata to Octaedro with 8 faces", () => {
      const result = getChakraSound("Anahata")!;
      expect(result.poliedro).toBe("Octaedro");
      expect(result.poliedro_en).toBe("Octahedron");
      expect(result.poliedro_faces).toBe(8);
    });

    it("maps Vishuddha to Dodecaedro with 12 faces", () => {
      const result = getChakraSound("Vishuddha")!;
      expect(result.poliedro).toBe("Dodecaedro");
      expect(result.poliedro_en).toBe("Dodecahedron");
      expect(result.poliedro_faces).toBe(12);
    });

    it("maps Ajna to Icosaedro with 20 faces", () => {
      const result = getChakraSound("Ajna")!;
      expect(result.poliedro).toBe("Icosaedro");
      expect(result.poliedro_en).toBe("Icosahedron");
      expect(result.poliedro_faces).toBe(20);
    });

    it("maps Sahasrara to Esfera (Sphere) with 0 faces", () => {
      const result = getChakraSound("Sahasrara")!;
      expect(result.poliedro).toBe("Esfera");
      expect(result.poliedro_en).toBe("Sphere");
      expect(result.poliedro_faces).toBe(0);
    });
  });

  describe("Planet-chakra correlation consistency", () => {
    it("Sol activates Manipura (3º) and Sahasrara (7º)", () => {
      const result = getChakraForPlanet("Sol");
      const chakras = result.map((c) => c.chakra_sanskrit);
      expect(chakras).toContain("Manipura");
      expect(chakras).toContain("Sahasrara");
    });

    it("Lua activates Muladhara (1º) and Ajna (6º)", () => {
      const result = getChakraForPlanet("Lua");
      const chakras = result.map((c) => c.chakra_sanskrit);
      expect(chakras).toContain("Muladhara");
      expect(chakras).toContain("Ajna");
    });

    it("Marte activates Svadhisthana (2º) and Manipura (3º)", () => {
      const result = getChakraForPlanet("Marte");
      const chakras = result.map((c) => c.chakra_sanskrit);
      expect(chakras).toContain("Svadhisthana");
      expect(chakras).toContain("Manipura");
    });

    it("Mercurio activates Manipura (3º) and Vishuddha (5º)", () => {
      const result = getChakraForPlanet("Mercurio");
      const chakras = result.map((c) => c.chakra_sanskrit);
      expect(chakras).toContain("Manipura");
      expect(chakras).toContain("Vishuddha");
    });

    it("Jupiter activates Anahata (4º) and Sahasrara (7º)", () => {
      const result = getChakraForPlanet("Jupiter");
      const chakras = result.map((c) => c.chakra_sanskrit);
      expect(chakras).toContain("Anahata");
      expect(chakras).toContain("Sahasrara");
    });

    it("Venus activates Anahata (4º)", () => {
      const result = getChakraForPlanet("Venus");
      const chakras = result.map((c) => c.chakra_sanskrit);
      expect(chakras).toContain("Anahata");
    });

    it("Saturno activates Muladhara (1º) and Anahata (4º)", () => {
      const result = getChakraForPlanet("Saturno");
      const chakras = result.map((c) => c.chakra_sanskrit);
      expect(chakras).toContain("Muladhara");
      expect(chakras).toContain("Anahata");
    });
  });

  describe("Kabbalah divine names consistency", () => {
    it("Muladhara has ADONAI HA-ARETZ", () => {
      expect(getChakraSound("Muladhara")!.nome_divino).toBe("ADONAI HA-ARETZ");
    });

    it("Svadhisthana has ELOHIM GIBOR", () => {
      expect(getChakraSound("Svadhisthana")!.nome_divino).toBe("ELOHIM GIBOR");
    });

    it("Manipura has SHADDAI EL CHAI", () => {
      expect(getChakraSound("Manipura")!.nome_divino).toBe("SHADDAI EL CHAI");
    });

    it("Anahata has YHVH ELOAH VA-DAATH", () => {
      expect(getChakraSound("Anahata")!.nome_divino).toBe("YHVH ELOAH VA-DAATH");
    });

    it("Vishuddha has ELOHIM SABAOTH", () => {
      expect(getChakraSound("Vishuddha")!.nome_divino).toBe("ELOHIM SABAOTH");
    });

    it("Ajna has YAH", () => {
      expect(getChakraSound("Ajna")!.nome_divino).toBe("YAH");
    });

    it("Sahasrara has EHEIEH", () => {
      expect(getChakraSound("Sahasrara")!.nome_divino).toBe("EHEIEH");
    });
  });
});
