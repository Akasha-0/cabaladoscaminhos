import { describe, it, expect } from "vitest";
import {
  getSoundNumerology,
  getNumerologySound,
  getAllSoundNumerologies,
  getAllNumbers,
  getSoundsByNumber,
  getSoundsByElement,
  getHealingProperties,
  getSpiritualDynamics,
  SOUND_NUMEROLOGY,
  type SoundNumerology,
} from "@/lib/correlation/sound-numerology";

describe("sound-numerology correlation", () => {
  describe("getSoundNumerology", () => {
    it("returns correct mapping for LAM (number 1)", () => {
      const mapping = getSoundNumerology("LAM");
      expect(mapping).toBeDefined();
      expect(mapping!.som).toBe("LAM");
      expect(mapping!.numero).toBe(1);
      expect(mapping!.elemento).toBe("Terra");
      expect(mapping!.chakra).toBe("1º Básico");
      expect(mapping!.frequencia).toBe(396);
      expect(mapping!.orixa).toBe("Iemanjá / Omolu");
      expect(mapping!.sephirah).toBe("Malkuth");
    });

    it("returns correct mapping for VAM (number 2)", () => {
      const mapping = getSoundNumerology("VAM");
      expect(mapping).toBeDefined();
      expect(mapping!.som).toBe("VAM");
      expect(mapping!.numero).toBe(2);
      expect(mapping!.elemento).toBe("Água");
      expect(mapping!.chakra).toBe("2º Sacro");
      expect(mapping!.frequencia).toBe(417);
      expect(mapping!.orixa).toBe("Oxum / Ibeji");
      expect(mapping!.sephirah).toBe("Yesod");
    });

    it("returns correct mapping for RAM (number 3)", () => {
      const mapping = getSoundNumerology("RAM");
      expect(mapping).toBeDefined();
      expect(mapping!.som).toBe("RAM");
      expect(mapping!.numero).toBe(3);
      expect(mapping!.elemento).toBe("Fogo");
      expect(mapping!.chakra).toBe("3º Plexo Solar");
      expect(mapping!.frequencia).toBe(528);
      expect(mapping!.orixa).toBe("Ogum / Xangô");
      expect(mapping!.sephirah).toBe("Binah");
    });

    it("returns correct mapping for YAM (number 4)", () => {
      const mapping = getSoundNumerology("YAM");
      expect(mapping).toBeDefined();
      expect(mapping!.som).toBe("YAM");
      expect(mapping!.numero).toBe(4);
      expect(mapping!.elemento).toBe("Ar");
      expect(mapping!.chakra).toBe("4º Cardíaco");
      expect(mapping!.frequencia).toBe(639);
      expect(mapping!.orixa).toBe("Oxalá / Iansã");
      expect(mapping!.sephirah).toBe("Tiphereth");
    });

    it("returns correct mapping for HAM (number 5)", () => {
      const mapping = getSoundNumerology("HAM");
      expect(mapping).toBeDefined();
      expect(mapping!.som).toBe("HAM");
      expect(mapping!.numero).toBe(5);
      expect(mapping!.elemento).toBe("Ar");
      expect(mapping!.chakra).toBe("5º Laríngeo");
      expect(mapping!.frequencia).toBe(741);
      expect(mapping!.orixa).toBe("Iansã / Nana");
      expect(mapping!.sephirah).toBe("Netzach");
    });

    it("returns correct mapping for OM (number 6)", () => {
      const mapping = getSoundNumerology("OM");
      expect(mapping).toBeDefined();
      expect(mapping!.som).toBe("OM");
      expect(mapping!.numero).toBe(6);
      expect(mapping!.elemento).toBe("Éter");
      expect(mapping!.chakra).toBe("6º Frontal");
      expect(mapping!.frequencia).toBe(852);
      expect(mapping!.orixa).toBe("Orunmilá / Oxalá");
      expect(mapping!.sephirah).toBe("Daath");
    });

    it("returns correct mapping for AUM (number 7)", () => {
      const mapping = getSoundNumerology("AUM");
      expect(mapping).toBeDefined();
      expect(mapping!.som).toBe("AUM");
      expect(mapping!.numero).toBe(7);
      expect(mapping!.elemento).toBe("Éter");
      expect(mapping!.chakra).toBe("7º Coronário");
      expect(mapping!.frequencia).toBe(963);
      expect(mapping!.orixa).toBe("Oxalá / Obaluaiê");
      expect(mapping!.sephirah).toBe("Kether");
    });

    it("returns correct mapping for EIM (number 8)", () => {
      const mapping = getSoundNumerology("EIM");
      expect(mapping).toBeDefined();
      expect(mapping!.som).toBe("EIM");
      expect(mapping!.numero).toBe(8);
      expect(mapping!.elemento).toBe("Fogo");
      expect(mapping!.orixa).toBe("Xangô / Ogum");
      expect(mapping!.sephirah).toBe("Hod");
    });

    it("returns correct mapping for HRIM (number 9)", () => {
      const mapping = getSoundNumerology("HRIM");
      expect(mapping).toBeDefined();
      expect(mapping!.som).toBe("HRIM");
      expect(mapping!.numero).toBe(9);
      expect(mapping!.elemento).toBe("Água");
      expect(mapping!.orixa).toBe("Ossá / Nanã");
      expect(mapping!.sephirah).toBe("Yesod");
    });

    it("returns correct mapping for KLIM (number 10)", () => {
      const mapping = getSoundNumerology("KLIM");
      expect(mapping).toBeDefined();
      expect(mapping!.som).toBe("KLIM");
      expect(mapping!.numero).toBe(10);
      expect(mapping!.elemento).toBe("Terra");
      expect(mapping!.orixa).toBe("Oxalá / Iemanjá");
      expect(mapping!.sephirah).toBe("Malkuth");
    });

    it("returns correct mapping for HUM (number 11)", () => {
      const mapping = getSoundNumerology("HUM");
      expect(mapping).toBeDefined();
      expect(mapping!.som).toBe("HUM");
      expect(mapping!.numero).toBe(11);
      expect(mapping!.elemento).toBe("Fogo");
      expect(mapping!.orixa).toBe("Exu / Ogum");
      expect(mapping!.sephirah).toBe("Kether / Tiphereth");
    });

    it("returns correct mapping for PHAT (number 12)", () => {
      const mapping = getSoundNumerology("PHAT");
      expect(mapping).toBeDefined();
      expect(mapping!.som).toBe("PHAT");
      expect(mapping!.numero).toBe(12);
      expect(mapping!.elemento).toBe("Fogo");
      expect(mapping!.orixa).toBe("Xangô / Exu");
      expect(mapping!.sephirah).toBe("Geburah");
    });

    it("returns correct mapping for NAMAH (number 13)", () => {
      const mapping = getSoundNumerology("NAMAH");
      expect(mapping).toBeDefined();
      expect(mapping!.som).toBe("NAMAH");
      expect(mapping!.numero).toBe(13);
      expect(mapping!.elemento).toBe("Terra");
      expect(mapping!.orixa).toBe("Nanã / Omolu");
      expect(mapping!.sephirah).toBe("Malkuth");
    });

    it("accepts lowercase sound identifier", () => {
      const mapping = getSoundNumerology("lam");
      expect(mapping).toBeDefined();
      expect(mapping!.numero).toBe(1);
    });

    it("accepts mixed case sound identifier", () => {
      const mapping = getSoundNumerology("Om");
      expect(mapping).toBeDefined();
      expect(mapping!.numero).toBe(6);
    });

    it("accepts sound identifier with whitespace", () => {
      const mapping = getSoundNumerology(" AUM ");
      expect(mapping).toBeDefined();
      expect(mapping!.numero).toBe(7);
    });

    it("returns undefined for unknown sound", () => {
      const mapping = getSoundNumerology("XYZ");
      expect(mapping).toBeUndefined();
    });

    it("returns undefined for empty string", () => {
      const mapping = getSoundNumerology("");
      expect(mapping).toBeUndefined();
    });

    it("returns undefined for null/undefined input", () => {
      expect(getSoundNumerology(null as unknown as string)).toBeUndefined();
      expect(getSoundNumerology(undefined as unknown as string)).toBeUndefined();
    });
  });

  describe("getNumerologySound", () => {
    it("returns number for LAM", () => {
      expect(getNumerologySound("LAM")).toBe(1);
    });

    it("returns number for VAM", () => {
      expect(getNumerologySound("VAM")).toBe(2);
    });

    it("returns number for RAM", () => {
      expect(getNumerologySound("RAM")).toBe(3);
    });

    it("returns number for YAM", () => {
      expect(getNumerologySound("YAM")).toBe(4);
    });

    it("returns number for HAM", () => {
      expect(getNumerologySound("HAM")).toBe(5);
    });

    it("returns number for OM", () => {
      expect(getNumerologySound("OM")).toBe(6);
    });

    it("returns number for AUM", () => {
      expect(getNumerologySound("AUM")).toBe(7);
    });

    it("returns undefined for unknown sound", () => {
      expect(getNumerologySound("UNKNOWN")).toBeUndefined();
    });

    it("returns undefined for empty input", () => {
      expect(getNumerologySound("")).toBeUndefined();
    });
  });

  describe("getAllSoundNumerologies", () => {
    it("returns all mappings sorted by number", () => {
      const all = getAllSoundNumerologies();
      expect(all.length).toBeGreaterThan(0);
      // Check sorting
      for (let i = 1; i < all.length; i++) {
        expect(all[i].numero).toBeGreaterThanOrEqual(all[i - 1].numero);
      }
    });
    it("contains all 13 numbers (1-13)", () => {
      const all = getAllSoundNumerologies();
      const numbers = all.map(m => m.numero);
      for (let i = 1; i <= 13; i++) {
        expect(numbers).toContain(i);
      }
    });
    it("each mapping has complete structure", () => {
      const all = getAllSoundNumerologies();
      all.forEach(mapping => {
        expect(mapping.som).toBeDefined();
        expect(mapping.pronunciacao).toBeDefined();
        expect(typeof mapping.numero).toBe("number");
        expect(mapping.elemento).toBeDefined();
        expect(mapping.chakra).toBeDefined();
        expect(mapping.chakra_sanskrit).toBeDefined();
        expect(typeof mapping.chakra_numero).toBe("number");
        expect(typeof mapping.frequencia).toBe("number");
        expect(Array.isArray(mapping.propriedades_cura)).toBe(true);
        expect(mapping.orixa).toBeDefined();
        expect(mapping.sephirah).toBeDefined();
        expect(mapping.dinamica).toBeDefined();
        expect(mapping.significado_numero).toBeDefined();
      });
    });
    it("frequencies follow solfeggio pattern", () => {
      const all = getAllSoundNumerologies();
      const frequencies = [396, 417, 528, 639, 741, 852, 963];
      all.slice(0, 7).forEach((mapping, index) => {
        expect(mapping.frequencia).toBe(frequencies[index]);
      });
    });
  });

  describe("getAllNumbers", () => {
    it("returns unique numbers sorted", () => {
      const numbers = getAllNumbers();
      expect(numbers.length).toBeGreaterThan(0);
      
      const sorted = [...numbers].sort((a, b) => a - b);
      expect(numbers).toEqual(sorted);
      
      // Check uniqueness
      const unique = new Set(numbers);
      expect(unique.size).toBe(numbers.length);
    });

    it("contains numbers 1-13", () => {
      const numbers = getAllNumbers();
      
      for (let i = 1; i <= 13; i++) {
        expect(numbers).toContain(i);
      }
    });
  });

  describe("getSoundsByNumber", () => {
    it("returns sounds for number 1 (LAM)", () => {
      const sounds = getSoundsByNumber(1);
      expect(sounds.length).toBeGreaterThan(0);
      expect(sounds.every(s => s.numero === 1)).toBe(true);
      expect(sounds.some(s => s.som === "LAM")).toBe(true);
    });

    it("returns sounds for number 2 (VAM)", () => {
      const sounds = getSoundsByNumber(2);
      expect(sounds.some(s => s.som === "VAM")).toBe(true);
    });

    it("returns sounds for number 6 (OM)", () => {
      const sounds = getSoundsByNumber(6);
      expect(sounds.some(s => s.som === "OM")).toBe(true);
    });

    it("returns sounds for number 7 (AUM)", () => {
      const sounds = getSoundsByNumber(7);
      expect(sounds.some(s => s.som === "AUM")).toBe(true);
    });

    it("returns empty array for number without sounds", () => {
      const sounds = getSoundsByNumber(14);
      expect(sounds).toEqual([]);
    });

    it("returns all sounds for number with multiple mappings", () => {
      const sounds = getSoundsByNumber(3);
      expect(sounds.length).toBeGreaterThan(0);
      expect(sounds.every(s => s.numero === 3)).toBe(true);
    });
  });

  describe("getSoundsByElement", () => {
    it("returns sounds for Terra", () => {
      const sounds = getSoundsByElement("Terra");
      expect(sounds.length).toBeGreaterThan(0);
      expect(sounds.every(s => s.elemento === "Terra")).toBe(true);
    });

    it("returns sounds for Água", () => {
      const sounds = getSoundsByElement("Água");
      expect(sounds.length).toBeGreaterThan(0);
      expect(sounds.every(s => s.elemento === "Água")).toBe(true);
    });

    it("returns sounds for Fogo", () => {
      const sounds = getSoundsByElement("Fogo");
      expect(sounds.length).toBeGreaterThan(0);
      expect(sounds.every(s => s.elemento === "Fogo")).toBe(true);
    });

    it("returns sounds for Ar", () => {
      const sounds = getSoundsByElement("Ar");
      expect(sounds.length).toBeGreaterThan(0);
      expect(sounds.every(s => s.elemento === "Ar")).toBe(true);
    });

    it("returns sounds for Éter", () => {
      const sounds = getSoundsByElement("Éter");
      expect(sounds.length).toBeGreaterThan(0);
      expect(sounds.every(s => s.elemento === "Éter")).toBe(true);
    });

    it("accepts lowercase element", () => {
      const sounds = getSoundsByElement("terra");
      expect(sounds.length).toBeGreaterThan(0);
    });

    it("returns empty array for unknown element", () => {
      const sounds = getSoundsByElement("Unknown");
      expect(sounds).toEqual([]);
    });

    it("returns empty array for empty string", () => {
      const sounds = getSoundsByElement("");
      expect(sounds).toEqual([]);
    });
  });

  describe("getHealingProperties", () => {
    it("returns healing properties for LAM", () => {
      const props = getHealingProperties("LAM");
      expect(props).toBeDefined();
      expect(Array.isArray(props)).toBe(true);
      expect(props!.length).toBeGreaterThan(0);
      expect(props).toContain("Dissolução de medos de sobrevivência e escassez");
    });

    it("returns healing properties for OM", () => {
      const props = getHealingProperties("OM");
      expect(props).toBeDefined();
      expect(props).toContain("Despertar da intuição profunda e sabedoria interior");
    });

    it("returns healing properties for AUM", () => {
      const props = getHealingProperties("AUM");
      expect(props).toBeDefined();
      expect(props).toContain("Conexão espiritual direta com a Fonte");
    });

    it("returns undefined for unknown sound", () => {
      const props = getHealingProperties("UNKNOWN");
      expect(props).toBeUndefined();
    });

    it("returns undefined for empty input", () => {
      expect(getHealingProperties("")).toBeUndefined();
    });
  });

  describe("getSpiritualDynamics", () => {
    it("returns spiritual dynamics for LAM", () => {
      const dynamics = getSpiritualDynamics("LAM");
      expect(dynamics).toBeDefined();
      expect(typeof dynamics).toBe("string");
      expect(dynamics).toContain("Enraizamento profundo");
      expect(dynamics).toContain("número 1");
    });

    it("returns spiritual dynamics for OM", () => {
      const dynamics = getSpiritualDynamics("OM");
      expect(dynamics).toBeDefined();
      expect(dynamics).toContain("Abertura do terceiro olho");
      expect(dynamics).toContain("número 6");
    });

    it("returns spiritual dynamics for AUM", () => {
      const dynamics = getSpiritualDynamics("AUM");
      expect(dynamics).toBeDefined();
      expect(dynamics).toContain("Unificação da tríade sonora");
      expect(dynamics).toContain("número 7");
    });

    it("returns undefined for unknown sound", () => {
      const dynamics = getSpiritualDynamics("UNKNOWN");
      expect(dynamics).toBeUndefined();
    });
  });

  describe("Sound-Numerology spiritual correlation completeness", () => {
    it("all seven primary seed syllables are mapped (LAM to AUM)", () => {
      const primarySounds = ["LAM", "VAM", "RAM", "YAM", "HAM", "OM", "AUM"];
      primarySounds.forEach(sound => {
        const mapping = getSoundNumerology(sound);
        expect(mapping).toBeDefined();
        expect(mapping!.numero).toBeGreaterThan(0);
        expect(mapping!.numero).toBeLessThanOrEqual(13);
      });
    });

    it("all 13 numbers have spiritual meaning", () => {
      const all = getAllSoundNumerology();
      all.forEach(mapping => {
        expect(mapping.significado_numero.length).toBeGreaterThan(10);
      });
    });

    it("all sounds have pronunciations", () => {
      const all = getAllSoundNumerology();
      all.forEach(mapping => {
        expect(mapping.pronunciacao.length).toBeGreaterThan(0);
        expect(mapping.pronunciacao).toContain("vibração");
      });
    });

    it("all sounds have orixá associations", () => {
      const all = getAllSoundNumerology();
      all.forEach(mapping => {
        expect(mapping.orixa.length).toBeGreaterThan(0);
        expect(mapping.orixa).toMatch(/\//); // Should contain "/" for dual orixá
      });
    });

    it("all sounds have sephirah correspondences", () => {
      const all = getAllSoundNumerology();
      all.forEach(mapping => {
        expect(mapping.sephirah.length).toBeGreaterThan(0);
      });
    });

    it("chakra numbers align with sound mappings", () => {
      const all = getAllSoundNumerology();
      all.forEach(mapping => {
        // Chakra 1 = Muladhara, Chakra 2 = Svadhisthana, etc.
        if (mapping.numero <= 7) {
          expect(mapping.chakra_numero).toBeLessThanOrEqual(7);
        }
      });
    });
  });

  describe("Healing properties consistency", () => {
    it("each sound has at least 5 healing properties", () => {
      const all = getAllSoundNumerology();
      all.forEach(mapping => {
        expect(mapping.propriedades_cura.length).toBeGreaterThanOrEqual(5);
      });
    });

    it("healing properties are descriptive strings", () => {
      const all = getAllSoundNumerology();
      all.forEach(mapping => {
        mapping.propriedades_cura.forEach(prop => {
          expect(typeof prop).toBe("string");
          expect(prop.length).toBeGreaterThan(5);
        });
      });
    });

    it("healing properties relate to element and number", () => {
      const lam = getSoundNumerology("LAM");
      expect(lam).toBeDefined();
      
      // LAM is Terra (Earth) and number 1, properties should relate to grounding
      const groundRelated = lam!.propriedades_cura.some(p => 
        p.toLowerCase().includes("ancoramento") || 
        p.toLowerCase().includes("estabilidade") ||
        p.toLowerCase().includes("terra")
      );
      expect(groundRelated).toBe(true);
    });
  });

  describe("SOUND_NUMEROLOGY constant", () => {
    it("is exported and contains all mappings", () => {
      expect(SOUND_NUMEROLOGY).toBeDefined();
      expect(typeof SOUND_NUMEROLOGY).toBe("object");
      expect(Object.keys(SOUND_NUMEROLOGY).length).toBeGreaterThan(10);
    });

    it("can be used for direct lookups", () => {
      expect(SOUND_NUMEROLOGY["LAM"]).toBeDefined();
      expect(SOUND_NUMEROLOGY["LAM"].numero).toBe(1);
      expect(SOUND_NUMEROLOGY["OM"]).toBeDefined();
      expect(SOUND_NUMEROLOGY["OM"].numero).toBe(6);
    });
  });

  describe("Type exports", () => {
    it("SoundNumerology type is exported", () => {
      // Verify the type exists by using it
      const mapping: SoundNumerology = {
        som: "TEST",
        pronunciacao: "test pronunciation",
        numero: 1,
        significado_numero: "test meaning",
        elemento: "Terra",
        elemento_en: "Earth",
        chakra: "1º Básico",
        chakra_sanskrit: "Muladhara",
        chakra_numero: 1,
        frequencia: 396,
        propriedades_cura: ["test"],
        orixa: "Test",
        sephirah: "Test",
        dinamica: "test dynamics",
      };
      expect(mapping.som).toBe("TEST");
    });
  });
});