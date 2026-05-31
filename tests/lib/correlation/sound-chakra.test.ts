import { describe, it, expect } from "vitest";
import {
  getSoundChakra,
  getChakraSound,
  getAllSoundChakras,
  type SoundChakra,
  type SoundChakraHealing,
} from "@/lib/correlation/sound-chakra";

describe("sound-chakra correlation", () => {
  describe("getSoundChakra", () => {
    it("returns correct mapping for LAM (396 Hz - Root Chakra)", () => {
      const result = getSoundChakra("LAM");
      expect(result).toBeDefined();
      expect(result?.som).toBe("LAM");
      expect(result?.frequencia).toBe(396);
      expect(result?.chakra).toBe("1º Básico");
      expect(result?.chakra_sanskrit).toBe("Muladhara");
      expect(result?.chakra_numero).toBe(1);
    });

    it("returns correct mapping for VAM (417 Hz - Sacral Chakra)", () => {
      const result = getSoundChakra("VAM");
      expect(result).toBeDefined();
      expect(result?.som).toBe("VAM");
      expect(result?.frequencia).toBe(417);
      expect(result?.chakra).toBe("2º Sacro");
      expect(result?.chakra_sanskrit).toBe("Svadhisthana");
      expect(result?.chakra_numero).toBe(2);
    });

    it("returns correct mapping for RAM (528 Hz - Solar Plexus Chakra)", () => {
      const result = getSoundChakra("RAM");
      expect(result).toBeDefined();
      expect(result?.som).toBe("RAM");
      expect(result?.frequencia).toBe(528);
      expect(result?.chakra).toBe("3º Plexo Solar");
      expect(result?.chakra_sanskrit).toBe("Manipura");
      expect(result?.chakra_numero).toBe(3);
    });

    it("returns correct mapping for YAM (639 Hz - Heart Chakra)", () => {
      const result = getSoundChakra("YAM");
      expect(result).toBeDefined();
      expect(result?.som).toBe("YAM");
      expect(result?.frequencia).toBe(639);
      expect(result?.chakra).toBe("4º Cardíaco");
      expect(result?.chakra_sanskrit).toBe("Anahata");
      expect(result?.chakra_numero).toBe(4);
    });

    it("returns correct mapping for HAM (741 Hz - Throat Chakra)", () => {
      const result = getSoundChakra("HAM");
      expect(result).toBeDefined();
      expect(result?.som).toBe("HAM");
      expect(result?.frequencia).toBe(741);
      expect(result?.chakra).toBe("5º Laríngeo");
      expect(result?.chakra_sanskrit).toBe("Vishuddha");
      expect(result?.chakra_numero).toBe(5);
    });

    it("returns correct mapping for OM (852 Hz - Third Eye Chakra)", () => {
      const result = getSoundChakra("OM");
      expect(result).toBeDefined();
      expect(result?.som).toBe("OM");
      expect(result?.frequencia).toBe(852);
      expect(result?.chakra).toBe("6º Frontal");
      expect(result?.chakra_sanskrit).toBe("Ajna");
      expect(result?.chakra_numero).toBe(6);
    });

    it("returns correct mapping for AUM (963 Hz - Crown Chakra)", () => {
      const result = getSoundChakra("AUM");
      expect(result).toBeDefined();
      expect(result?.som).toBe("AUM");
      expect(result?.frequencia).toBe(963);
      expect(result?.chakra).toBe("7º Coronário");
      expect(result?.chakra_sanskrit).toBe("Sahasrara");
      expect(result?.chakra_numero).toBe(7);
    });

    it("accepts lowercase sound identifier", () => {
      const result = getSoundChakra("lam");
      expect(result).toBeDefined();
      expect(result?.som).toBe("LAM");
      expect(result?.frequencia).toBe(396);
    });

    it("accepts mixed case sound identifier", () => {
      const result = getSoundChakra("vAm");
      expect(result).toBeDefined();
      expect(result?.som).toBe("VAM");
    });

    it("accepts sound identifier with whitespace", () => {
      const result = getSoundChakra("  RAM  ");
      expect(result).toBeDefined();
      expect(result?.som).toBe("RAM");
    });

    it("returns null for unknown sound", () => {
      const result = getSoundChakra("UNKNOWN");
      expect(result).toBeNull();
    });

    it("returns null for empty string", () => {
      const result = getSoundChakra("");
      expect(result).toBeNull();
    });

    it("returns null for whitespace-only string", () => {
      const result = getSoundChakra("   ");
      expect(result).toBeNull();
    });
  });

  describe("getChakraSound", () => {
    describe("by chakra number", () => {
      it("returns correct mapping for chakra 1", () => {
        const result = getChakraSound("1");
        expect(result).toBeDefined();
        expect(result?.som).toBe("LAM");
        expect(result?.chakra_numero).toBe(1);
      });

      it("returns correct mapping for chakra 2", () => {
        const result = getChakraSound("2");
        expect(result).toBeDefined();
        expect(result?.som).toBe("VAM");
        expect(result?.chakra_numero).toBe(2);
      });

      it("returns correct mapping for chakra 3", () => {
        const result = getChakraSound("3");
        expect(result).toBeDefined();
        expect(result?.som).toBe("RAM");
        expect(result?.chakra_numero).toBe(3);
      });

      it("returns correct mapping for chakra 4", () => {
        const result = getChakraSound("4");
        expect(result).toBeDefined();
        expect(result?.som).toBe("YAM");
        expect(result?.chakra_numero).toBe(4);
      });

      it("returns correct mapping for chakra 5", () => {
        const result = getChakraSound("5");
        expect(result).toBeDefined();
        expect(result?.som).toBe("HAM");
        expect(result?.chakra_numero).toBe(5);
      });

      it("returns correct mapping for chakra 6", () => {
        const result = getChakraSound("6");
        expect(result).toBeDefined();
        expect(result?.som).toBe("OM");
        expect(result?.chakra_numero).toBe(6);
      });

      it("returns correct mapping for chakra 7", () => {
        const result = getChakraSound("7");
        expect(result).toBeDefined();
        expect(result?.som).toBe("AUM");
        expect(result?.chakra_numero).toBe(7);
      });
    });

    describe("by Portuguese chakra name", () => {
      it("returns correct mapping for '1º Básico'", () => {
        const result = getChakraSound("1º Básico");
        expect(result?.som).toBe("LAM");
      });

      it("returns correct mapping for '2º Sacro'", () => {
        const result = getChakraSound("2º Sacro");
        expect(result?.som).toBe("VAM");
      });

      it("returns correct mapping for '3º Plexo Solar'", () => {
        const result = getChakraSound("3º Plexo Solar");
        expect(result?.som).toBe("RAM");
      });

      it("returns correct mapping for '4º Cardíaco'", () => {
        const result = getChakraSound("4º Cardíaco");
        expect(result?.som).toBe("YAM");
      });

      it("returns correct mapping for '5º Laríngeo'", () => {
        const result = getChakraSound("5º Laríngeo");
        expect(result?.som).toBe("HAM");
      });

      it("returns correct mapping for '6º Frontal'", () => {
        const result = getChakraSound("6º Frontal");
        expect(result?.som).toBe("OM");
      });

      it("returns correct mapping for '7º Coronário'", () => {
        const result = getChakraSound("7º Coronário");
        expect(result?.som).toBe("AUM");
      });

      it("accepts lowercase Portuguese name", () => {
        const result = getChakraSound("1º básico");
        expect(result?.som).toBe("LAM");
      });
    });

    describe("by Sanskrit chakra name", () => {
      it("returns correct mapping for Muladhara", () => {
        const result = getChakraSound("Muladhara");
        expect(result?.som).toBe("LAM");
      });

      it("returns correct mapping for Svadhisthana", () => {
        const result = getChakraSound("Svadhisthana");
        expect(result?.som).toBe("VAM");
      });

      it("returns correct mapping for Manipura", () => {
        const result = getChakraSound("Manipura");
        expect(result?.som).toBe("RAM");
      });

      it("returns correct mapping for Anahata", () => {
        const result = getChakraSound("Anahata");
        expect(result?.som).toBe("YAM");
      });

      it("returns correct mapping for Vishuddha", () => {
        const result = getChakraSound("Vishuddha");
        expect(result?.som).toBe("HAM");
      });

      it("returns correct mapping for Ajna", () => {
        const result = getChakraSound("Ajna");
        expect(result?.som).toBe("OM");
      });

      it("returns correct mapping for Sahasrara", () => {
        const result = getChakraSound("Sahasrara");
        expect(result?.som).toBe("AUM");
      });

      it("accepts lowercase Sanskrit name", () => {
        const result = getChakraSound("muladhara");
        expect(result?.som).toBe("LAM");
      });
    });

    it("returns null for unknown chakra identifier", () => {
      const result = getChakraSound("unknown");
      expect(result).toBeNull();
    });

    it("returns null for empty string", () => {
      const result = getChakraSound("");
      expect(result).toBeNull();
    });
  });

  describe("getAllSoundChakras", () => {
    it("returns all 7 sound-chakra mappings", () => {
      const result = getAllSoundChakras();
      expect(result).toHaveLength(7);
    });

    it("returns mappings sorted by chakra number ascending", () => {
      const result = getAllSoundChakras();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].chakra_numero).toBeLessThan(result[i + 1].chakra_numero);
      }
    });

    it("contains all 7 standard Solfeggio frequencies", () => {
      const result = getAllSoundChakras();
      const frequencies = result.map(r => r.frequencia).sort();
      expect(frequencies).toEqual([396, 417, 528, 639, 741, 852, 963]);
    });

    it("contains all expected sounds", () => {
      const result = getAllSoundChakras();
      const sounds = result.map(r => r.som).sort();
      expect(sounds).toEqual(["AUM", "HAM", "LAM", "OM", "RAM", "VAM", "YAM"]);
    });

    it("contains all chakra names", () => {
      const result = getAllSoundChakras();
      const chakras = result.map(r => r.chakra);
      expect(chakras).toContain("1º Básico");
      expect(chakras).toContain("2º Sacro");
      expect(chakras).toContain("3º Plexo Solar");
      expect(chakras).toContain("4º Cardíaco");
      expect(chakras).toContain("5º Laríngeo");
      expect(chakras).toContain("6º Frontal");
      expect(chakras).toContain("7º Coronário");
    });

    it("contains all Sanskrit chakra names", () => {
      const result = getAllSoundChakras();
      const sanskrit = result.map(r => r.chakra_sanskrit);
      expect(sanskrit).toContain("Muladhara");
      expect(sanskrit).toContain("Svadhisthana");
      expect(sanskrit).toContain("Manipura");
      expect(sanskrit).toContain("Anahata");
      expect(sanskrit).toContain("Vishuddha");
      expect(sanskrit).toContain("Ajna");
      expect(sanskrit).toContain("Sahasrara");
    });

    it("includes healing properties for each mapping", () => {
      const result = getAllSoundChakras();
      result.forEach(mapping => {
        expect(mapping.healing).toBeDefined();
        expect(mapping.healing.fisico).toBeTruthy();
        expect(mapping.healing.emocional).toBeTruthy();
        expect(mapping.healing.mental_espiritual).toBeTruthy();
        expect(mapping.healing.pratica_recomendada).toBeTruthy();
      });
    });

    it("healing properties are non-empty strings", () => {
      const result = getAllSoundChakras();
      result.forEach(mapping => {
        expect(typeof mapping.healing.fisico).toBe("string");
        expect(typeof mapping.healing.emocional).toBe("string");
        expect(typeof mapping.healing.mental_espiritual).toBe("string");
        expect(typeof mapping.healing.pratica_recomendada).toBe("string");
        expect(mapping.healing.fisico.length).toBeGreaterThan(0);
        expect(mapping.healing.emocional.length).toBeGreaterThan(0);
        expect(mapping.healing.mental_espiritual.length).toBeGreaterThan(0);
        expect(mapping.healing.pratica_recomendada.length).toBeGreaterThan(0);
      });
    });
  });

  describe("healing properties", () => {
    it("LAM healing includes physical, emotional, mental, and practice fields", () => {
      const result = getSoundChakra("LAM");
      expect(result?.healing.fisico).toContain("Fortalece");
      expect(result?.healing.emocional).toContain("Dissolve medos");
      expect(result?.healing.mental_espiritual).toContain("clareza mental");
      expect(result?.healing.pratica_recomendada).toContain("Meditação");
    });

    it("RAM healing (528 Hz) includes transformation and manifestation", () => {
      const result = getSoundChakra("RAM");
      expect(result?.healing.fisico).toContain("metabolismo");
      expect(result?.healing.emocional).toContain("compaixão");
      expect(result?.healing.mental_espiritual).toContain("manifestação");
    });

    it("YAM healing (639 Hz) includes compassion and forgiveness", () => {
      const result = getSoundChakra("YAM");
      expect(result?.healing.emocional).toContain("perdão");
      expect(result?.healing.emocional).toContain("compaixão");
    });

    it("OM healing (852 Hz) includes third eye and intuition", () => {
      const result = getSoundChakra("OM");
      expect(result?.healing.fisico).toContain("pineal");
      expect(result?.healing.emocional).toContain("visão clara");
      expect(result?.healing.mental_espiritual).toContain("capacidades psíquicas");
    });

    it("AUM healing (963 Hz) includes DNA restoration and transcendence", () => {
      const result = getSoundChakra("AUM");
      expect(result?.healing.fisico).toContain("DNA");
      expect(result?.healing.emocional).toContain("unidade");
      expect(result?.healing.mental_espiritual).toContain("Fonte");
    });
  });

  describe("Solfeggio frequency range consistency", () => {
    it("all frequencies are within Solfeggio range", () => {
      const result = getAllSoundChakras();
      result.forEach(mapping => {
        expect(mapping.frequencia).toBeGreaterThanOrEqual(396);
        expect(mapping.frequencia).toBeLessThanOrEqual(963);
      });
    });

    it("frequencies increase with chakra number", () => {
      const result = getAllSoundChakras();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].frequencia).toBeLessThan(result[i + 1].frequencia);
      }
    });
  });

  describe("cross-function consistency", () => {
    it("getSoundChakra and getChakraSound are inverses for all sounds", () => {
      const all = getAllSoundChakras();
      all.forEach(mapping => {
        const bySound = getSoundChakra(mapping.som);
        const byChakra = getChakraSound(mapping.chakra);
        const byNumber = getChakraSound(String(mapping.chakra_numero));
        const bySanskrit = getChakraSound(mapping.chakra_sanskrit);

        expect(bySound?.chakra).toBe(mapping.chakra);
        expect(byChakra?.som).toBe(mapping.som);
        expect(byNumber?.som).toBe(mapping.som);
        expect(bySanskrit?.som).toBe(mapping.som);
      });
    });

    it("getAllSoundChakras returns same count as individual lookups", () => {
      const all = getAllSoundChakras();
      const sounds = ["LAM", "VAM", "RAM", "YAM", "HAM", "OM", "AUM"];
      sounds.forEach(sound => {
        const found = getSoundChakra(sound);
        expect(found).not.toBeNull();
      });
      expect(all).toHaveLength(sounds.length);
    });
  });

  describe("type exports", () => {
    it("SoundChakra interface is exported", () => {
      // Verify the type is usable by constructing a valid object
      const mapping: SoundChakra = {
        som: "LAM",
        frequencia: 396,
        chakra_numero: 1,
        chakra: "1º Básico",
        chakra_sanskrit: "Muladhara",
        healing: {
          fisico: "Test",
          emocional: "Test",
          mental_espiritual: "Test",
          pratica_recomendada: "Test",
        },
      };
      expect(mapping.som).toBe("LAM");
    });

    it("SoundChakraHealing interface is exported", () => {
      const healing: SoundChakraHealing = {
        fisico: "Physical test",
        emocional: "Emotional test",
        mental_espiritual: "Mental test",
        pratica_recomendada: "Practice test",
      };
      expect(healing.fisico).toBe("Physical test");
    });
  });
});
