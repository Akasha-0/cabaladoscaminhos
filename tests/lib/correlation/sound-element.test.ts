import { describe, it, expect } from "vitest";
import {
  getSoundElement,
  getElementSound,
  getAllSoundElements,
  getAllElements,
  getSoundsByElement,
  getHealingProperties,
  SOUND_ELEMENTS,
  type SoundElement,
} from "@/lib/correlation/sound-element";

describe("sound-element correlation", () => {
  describe("getSoundElement", () => {
    it("returns correct mapping for LAM (Earth/Terra)", () => {
      const mapping = getSoundElement("LAM");
      expect(mapping).toBeDefined();
      expect(mapping!.som).toBe("LAM");
      expect(mapping!.elemento).toBe("Terra");
      expect(mapping!.elemento_en).toBe("Earth");
      expect(mapping!.chakra).toBe("1º Básico");
      expect(mapping!.chakra_sanskrit).toBe("Muladhara");
      expect(mapping!.chakra_numero).toBe(1);
      expect(mapping!.frequencia).toBe(396);
      expect(mapping!.direcao).toBe("Norte");
      expect(mapping!.estacao).toBe("Inverno");
    });

    it("returns correct mapping for VAM (Water/Água)", () => {
      const mapping = getSoundElement("VAM");
      expect(mapping).toBeDefined();
      expect(mapping!.som).toBe("VAM");
      expect(mapping!.elemento).toBe("Água");
      expect(mapping!.elemento_en).toBe("Water");
      expect(mapping!.chakra).toBe("2º Sacro");
      expect(mapping!.chakra_sanskrit).toBe("Svadhisthana");
      expect(mapping!.chakra_numero).toBe(2);
      expect(mapping!.frequencia).toBe(417);
      expect(mapping!.direcao).toBe("Oeste");
      expect(mapping!.estacao).toBe("Primavera");
    });

    it("returns correct mapping for RAM (Fire/Fogo)", () => {
      const mapping = getSoundElement("RAM");
      expect(mapping).toBeDefined();
      expect(mapping!.som).toBe("RAM");
      expect(mapping!.elemento).toBe("Fogo");
      expect(mapping!.elemento_en).toBe("Fire");
      expect(mapping!.chakra).toBe("3º Plexo Solar");
      expect(mapping!.chakra_sanskrit).toBe("Manipura");
      expect(mapping!.chakra_numero).toBe(3);
      expect(mapping!.frequencia).toBe(528);
      expect(mapping!.direcao).toBe("Sul");
      expect(mapping!.estacao).toBe("Verão");
    });

    it("returns correct mapping for YAM (Air/Ar)", () => {
      const mapping = getSoundElement("YAM");
      expect(mapping).toBeDefined();
      expect(mapping!.som).toBe("YAM");
      expect(mapping!.elemento).toBe("Ar");
      expect(mapping!.elemento_en).toBe("Air");
      expect(mapping!.chakra).toBe("4º Cardíaco");
      expect(mapping!.chakra_sanskrit).toBe("Anahata");
      expect(mapping!.chakra_numero).toBe(4);
      expect(mapping!.frequencia).toBe(639);
      expect(mapping!.direcao).toBe("Leste");
      expect(mapping!.estacao).toBe("Outono");
    });

    it("returns correct mapping for HAM (Air/Ar)", () => {
      const mapping = getSoundElement("HAM");
      expect(mapping).toBeDefined();
      expect(mapping!.som).toBe("HAM");
      expect(mapping!.elemento).toBe("Ar");
      expect(mapping!.elemento_en).toBe("Air");
      expect(mapping!.chakra).toBe("5º Laríngeo");
      expect(mapping!.chakra_sanskrit).toBe("Vishuddha");
      expect(mapping!.chakra_numero).toBe(5);
      expect(mapping!.frequencia).toBe(741);
      expect(mapping!.direcao).toBe("Leste");
      expect(mapping!.estacao).toBe("Primavera");
    });

    it("returns correct mapping for OM (Ether/Éter)", () => {
      const mapping = getSoundElement("OM");
      expect(mapping).toBeDefined();
      expect(mapping!.som).toBe("OM");
      expect(mapping!.elemento).toBe("Éter");
      expect(mapping!.elemento_en).toBe("Ether");
      expect(mapping!.chakra).toBe("6º Frontal");
      expect(mapping!.chakra_sanskrit).toBe("Ajna");
      expect(mapping!.chakra_numero).toBe(6);
      expect(mapping!.frequencia).toBe(852);
      expect(mapping!.direcao).toBe("Centro");
      expect(mapping!.estacao).toBe("Todas");
    });

    it("returns correct mapping for AUM (Ether/Éter)", () => {
      const mapping = getSoundElement("AUM");
      expect(mapping).toBeDefined();
      expect(mapping!.som).toBe("AUM");
      expect(mapping!.elemento).toBe("Éter");
      expect(mapping!.elemento_en).toBe("Ether");
      expect(mapping!.chakra).toBe("7º Coronário");
      expect(mapping!.chakra_sanskrit).toBe("Sahasrara");
      expect(mapping!.chakra_numero).toBe(7);
      expect(mapping!.frequencia).toBe(963);
      expect(mapping!.direcao).toBe("Zênite");
      expect(mapping!.estacao).toBe("Todas");
    });

    it("returns undefined for non-existent sound", () => {
      expect(getSoundElement("XYZ")).toBeUndefined();
    });

    it("returns undefined for empty string", () => {
      expect(getSoundElement("")).toBeUndefined();
    });

    it("handles case insensitivity", () => {
      expect(getSoundElement("lam")).toBeDefined();
      expect(getSoundElement("Lam")).toBeDefined();
      expect(getSoundElement("LAM")).toBeDefined();
    });

    it("handles whitespace in input", () => {
      expect(getSoundElement(" LAM ")).toBeDefined();
      expect(getSoundElement("  VAM  ")).toBeDefined();
    });

    it("includes pronunciacao in mapping", () => {
      const mapping = getSoundElement("LAM");
      expect(mapping!.pronunciacao).toContain("lahm");
    });

    it("includes propriedades_cura in mapping", () => {
      const mapping = getSoundElement("LAM");
      expect(mapping!.propriedades_cura).toBeDefined();
      expect(Array.isArray(mapping!.propriedades_cura)).toBe(true);
      expect(mapping!.propriedades_cura.length).toBeGreaterThan(0);
    });

    it("includes dinamica in mapping", () => {
      const mapping = getSoundElement("OM");
      expect(mapping!.dinamica).toBeDefined();
      expect(typeof mapping!.dinamica).toBe("string");
    });
  });

  describe("getElementSound", () => {
    it("returns Terra for LAM sound", () => {
      expect(getElementSound("LAM")).toBe("Terra");
    });

    it("returns Água for VAM sound", () => {
      expect(getElementSound("VAM")).toBe("Água");
    });

    it("returns Fogo for RAM sound", () => {
      expect(getElementSound("RAM")).toBe("Fogo");
    });

    it("returns Ar for YAM sound", () => {
      expect(getElementSound("YAM")).toBe("Ar");
    });

    it("returns Éter for OM sound", () => {
      expect(getElementSound("OM")).toBe("Éter");
    });

    it("returns undefined for non-existent sound", () => {
      expect(getElementSound("XYZ")).toBeUndefined();
    });
  });

  describe("getAllSoundElements", () => {
    it("returns all 7 sound-element mappings", () => {
      const all = getAllSoundElements();
      expect(all).toHaveLength(7);
    });

    it("returns mappings sorted by chakra_numero", () => {
      const all = getAllSoundElements();
      for (let i = 1; i < all.length; i++) {
        expect(all[i].chakra_numero).toBeGreaterThanOrEqual(all[i - 1].chakra_numero);
      }
    });

    it("contains correct element distribution", () => {
      const all = getAllSoundElements();
      const elements = all.map(s => s.elemento);
      expect(elements).toContain("Terra");
      expect(elements).toContain("Água");
      expect(elements).toContain("Fogo");
      expect(elements).toContain("Ar");
      expect(elements).toContain("Éter");
    });

    it("contains all expected sounds", () => {
      const all = getAllSoundElements();
      const sounds = all.map(s => s.som);
      expect(sounds).toContain("LAM");
      expect(sounds).toContain("VAM");
      expect(sounds).toContain("RAM");
      expect(sounds).toContain("YAM");
      expect(sounds).toContain("HAM");
      expect(sounds).toContain("OM");
      expect(sounds).toContain("AUM");
    });

    it("each mapping has valid properties", () => {
      const all = getAllSoundElements();
      all.forEach(mapping => {
        expect(mapping.som).toBeDefined();
        expect(mapping.pronunciacao).toBeDefined();
        expect(mapping.elemento).toBeDefined();
        expect(mapping.elemento_en).toBeDefined();
        expect(mapping.propriedades_cura).toBeDefined();
        expect(mapping.chakra).toBeDefined();
        expect(mapping.chakra_sanskrit).toBeDefined();
        expect(mapping.chakra_numero).toBeGreaterThan(0);
        expect(mapping.frequencia).toBeGreaterThan(0);
        expect(mapping.direcao).toBeDefined();
        expect(mapping.estacao).toBeDefined();
        expect(mapping.dinamica).toBeDefined();
      });
    });
  });

  describe("getAllElements", () => {
    it("returns all 5 elements", () => {
      const elements = getAllElements();
      expect(elements).toHaveLength(5);
    });

    it("returns sorted elements", () => {
      const elements = getAllElements();
      for (let i = 1; i < elements.length; i++) {
        expect(elements[i] >= elements[i - 1]).toBe(true);
      }
    });

    it("contains expected elements", () => {
      const elements = getAllElements();
      expect(elements).toContain("Ar");
      expect(elements).toContain("Água");
      expect(elements).toContain("Éter");
      expect(elements).toContain("Fogo");
      expect(elements).toContain("Terra");
    });
  });

  describe("getSoundsByElement", () => {
    it("returns 1 sound for Terra", () => {
      const sounds = getSoundsByElement("Terra");
      expect(sounds).toHaveLength(1);
      expect(sounds[0].som).toBe("LAM");
    });

    it("returns 1 sound for Água", () => {
      const sounds = getSoundsByElement("Água");
      expect(sounds).toHaveLength(1);
      expect(sounds[0].som).toBe("VAM");
    });

    it("returns 1 sound for Fogo", () => {
      const sounds = getSoundsByElement("Fogo");
      expect(sounds).toHaveLength(1);
      expect(sounds[0].som).toBe("RAM");
    });

    it("returns 2 sounds for Ar (YAM and HAM)", () => {
      const sounds = getSoundsByElement("Ar");
      expect(sounds).toHaveLength(2);
      const soundNames = sounds.map(s => s.som).sort();
      expect(soundNames).toEqual(["HAM", "YAM"]);
    });

    it("returns 2 sounds for Éter (OM and AUM)", () => {
      const sounds = getSoundsByElement("Éter");
      expect(sounds).toHaveLength(2);
      const soundNames = sounds.map(s => s.som).sort();
      expect(soundNames).toEqual(["AUM", "OM"]);
    });

    it("returns empty array for non-existent element", () => {
      expect(getSoundsByElement("Fogo Místico")).toEqual([]);
    });

    it("returns empty array for empty string", () => {
      expect(getSoundsByElement("")).toEqual([]);
    });

    it("handles case insensitivity for element", () => {
      const sounds = getSoundsByElement("terra");
      expect(sounds).toHaveLength(1);
      expect(sounds[0].som).toBe("LAM");
    });
  });

  describe("getHealingProperties", () => {
    it("returns healing properties for LAM", () => {
      const props = getHealingProperties("LAM");
      expect(props).toBeDefined();
      expect(Array.isArray(props)).toBe(true);
      expect(props!.length).toBeGreaterThan(0);
    });

    it("returns healing properties for OM", () => {
      const props = getHealingProperties("OM");
      expect(props).toBeDefined();
      expect(Array.isArray(props)).toBe(true);
      expect(props!.length).toBeGreaterThan(0);
    });

    it("returns undefined for non-existent sound", () => {
      expect(getHealingProperties("XYZ")).toBeUndefined();
    });
  });

  describe("Sound-Element spiritual correlation completeness", () => {
    it("covers all five elements", () => {
      const elements = getAllElements();
      expect(elements).toContain("Terra");
      expect(elements).toContain("Água");
      expect(elements).toContain("Fogo");
      expect(elements).toContain("Ar");
      expect(elements).toContain("Éter");
    });

    it("covers all seven primary chakras", () => {
      const all = getAllSoundElements();
      const chakraNumbers = all.map(s => s.chakra_numero).sort((a, b) => a - b);
      expect(chakraNumbers).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it("has frequencies matching Solfeggio scale", () => {
      const all = getAllSoundElements();
      const frequencies = all.map(s => s.frequencia);
      expect(frequencies).toContain(396);
      expect(frequencies).toContain(417);
      expect(frequencies).toContain(528);
      expect(frequencies).toContain(639);
      expect(frequencies).toContain(741);
      expect(frequencies).toContain(852);
      expect(frequencies).toContain(963);
    });

    it("each element has correct direction", () => {
      const terra = getSoundElement("LAM");
      expect(terra!.direcao).toBe("Norte");

      const agua = getSoundElement("VAM");
      expect(agua!.direcao).toBe("Oeste");

      const fogo = getSoundElement("RAM");
      expect(fogo!.direcao).toBe("Sul");
    });

    it("elements have seasonal associations", () => {
      const terra = getSoundElement("LAM");
      expect(terra!.estacao).toBe("Inverno");

      const agua = getSoundElement("VAM");
      expect(agua!.estacao).toBe("Primavera");

      const fogo = getSoundElement("RAM");
      expect(fogo!.estacao).toBe("Verão");
    });

    it("ether element spans all seasons", () => {
      const om = getSoundElement("OM");
      expect(om!.estacao).toBe("Todas");

      const aum = getSoundElement("AUM");
      expect(aum!.estacao).toBe("Todas");
    });
  });

  describe("Healing properties consistency", () => {
    it("all sounds have healing properties", () => {
      const all = getAllSoundElements();
      all.forEach(mapping => {
        expect(mapping.propriedades_cura).toBeDefined();
        expect(mapping.propriedades_cura.length).toBeGreaterThan(0);
      });
    });

    it("all healing properties are strings", () => {
      const all = getAllSoundElements();
      all.forEach(mapping => {
        mapping.propriedades_cura.forEach(prop => {
          expect(typeof prop).toBe("string");
        });
      });
    });

    it("healing properties relate to their element", () => {
      const terra = getSoundElement("LAM");
      const props = terra!.propriedades_cura.join(" ").toLowerCase();
      expect(props).toMatch(/terra|ancor|estabil|material|escassez/);

      const agua = getSoundElement("VAM");
      const aguaProps = agua!.propriedades_cura.join(" ").toLowerCase();
      expect(aguaProps).toMatch(/flu|emo|criat|limpeza|transmut/);

      const fogo = getSoundElement("RAM");
      const fogoProps = fogo!.propriedades_cura.join(" ").toLowerCase();
      expect(fogoProps).toMatch(/força|transform|poder|combust|manifest/);

      const ether = getSoundElement("OM");
      const etherProps = ether!.propriedades_cura.join(" ").toLowerCase();
      expect(etherProps).toMatch(/intui|sabed|consciência|cósmic|percep/);
    });
  });

  describe("SOUND_ELEMENTS constant", () => {
    it("SOUND_ELEMENTS contains all expected sounds", () => {
      expect(SOUND_ELEMENTS["LAM"]).toBeDefined();
      expect(SOUND_ELEMENTS["VAM"]).toBeDefined();
      expect(SOUND_ELEMENTS["RAM"]).toBeDefined();
      expect(SOUND_ELEMENTS["YAM"]).toBeDefined();
      expect(SOUND_ELEMENTS["HAM"]).toBeDefined();
      expect(SOUND_ELEMENTS["OM"]).toBeDefined();
      expect(SOUND_ELEMENTS["AUM"]).toBeDefined();
    });

    it("SOUND_ELEMENTS keys are uppercase", () => {
      Object.keys(SOUND_ELEMENTS).forEach(key => {
        expect(key).toBe(key.toUpperCase());
      });
    });

    it("SOUND_ELEMENTS has exactly 7 entries", () => {
      expect(Object.keys(SOUND_ELEMENTS)).toHaveLength(7);
    });
  });

  describe("Type exports", () => {
    it("SoundElement type is exported", () => {
      const mapping: SoundElement = {
        som: "TEST",
        pronunciacao: "test pronunciation",
        elemento: "Terra",
        elemento_en: "Earth",
        propriedades_cura: ["healing"],
        chakra: "1º Básico",
        chakra_sanskrit: "Muladhara",
        chakra_numero: 1,
        frequencia: 396,
        direcao: "Norte",
        estacao: "Inverno",
        dinamica: "Test dynamics",
      };
      expect(mapping.som).toBe("TEST");
    });
  });
});