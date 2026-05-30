import { describe, it, expect } from "vitest";
import {
  getTypes,
  getTypeById,
  getTypeByName,
  getTypesByElement,
} from "@/lib/guidance/guidance-types";

describe("guidance-types", () => {
  describe("getTypes", () => {
    it("should return all 8 guidance types", () => {
      const types = getTypes();
      expect(types).toHaveLength(8);
    });

    it("should return array of GuidanceType objects", () => {
      const types = getTypes();
      types.forEach((type) => {
        expect(type).toHaveProperty("id");
        expect(type).toHaveProperty("name");
        expect(type).toHaveProperty("namePt");
        expect(type).toHaveProperty("nameEn");
        expect(type).toHaveProperty("description");
        expect(type).toHaveProperty("descriptionPt");
        expect(type).toHaveProperty("characteristics");
        expect(type).toHaveProperty("associatedPractices");
        expect(type).toHaveProperty("color");
        expect(type).toHaveProperty("colorHex");
        expect(type).toHaveProperty("element");
      });
    });

    it("should include expected guidance types", () => {
      const types = getTypes();
      const ids = types.map((t) => t.id);
      expect(ids).toContain("spiritual");
      expect(ids).toContain("emotional");
      expect(ids).toContain("mental");
      expect(ids).toContain("physical");
      expect(ids).toContain("relational");
      expect(ids).toContain("transformational");
      expect(ids).toContain("manifestational");
      expect(ids).toContain("ancestral");
    });
  });

  describe("getTypeById", () => {
    it("should return spiritual type for id 'spiritual'", () => {
      const type = getTypeById("spiritual");
      expect(type).toBeDefined();
      expect(type!.id).toBe("spiritual");
      expect(type!.name).toBe("Espiritual");
      expect(type!.element).toBe("Ether");
    });

    it("should return emotional type for id 'emotional'", () => {
      const type = getTypeById("emotional");
      expect(type).toBeDefined();
      expect(type!.id).toBe("emotional");
      expect(type!.element).toBe("Water");
    });

    it("should return mental type for id 'mental'", () => {
      const type = getTypeById("mental");
      expect(type).toBeDefined();
      expect(type!.id).toBe("mental");
      expect(type!.element).toBe("Air");
    });

    it("should return physical type for id 'physical'", () => {
      const type = getTypeById("physical");
      expect(type).toBeDefined();
      expect(type!.id).toBe("physical");
      expect(type!.element).toBe("Earth");
    });

    it("should return relational type for id 'relational'", () => {
      const type = getTypeById("relational");
      expect(type).toBeDefined();
      expect(type!.id).toBe("relational");
      expect(type!.element).toBe("Fire");
    });

    it("should return transformational type for id 'transformational'", () => {
      const type = getTypeById("transformational");
      expect(type).toBeDefined();
      expect(type!.id).toBe("transformational");
      expect(type!.element).toBe("Fire");
    });

    it("should return manifestational type for id 'manifestational'", () => {
      const type = getTypeById("manifestational");
      expect(type).toBeDefined();
      expect(type!.id).toBe("manifestational");
      expect(type!.element).toBe("Fire");
    });

    it("should return ancestral type for id 'ancestral'", () => {
      const type = getTypeById("ancestral");
      expect(type).toBeDefined();
      expect(type!.id).toBe("ancestral");
      expect(type!.element).toBe("Earth");
    });

    it("should return undefined for non-existent id", () => {
      const type = getTypeById("nonexistent");
      expect(type).toBeUndefined();
    });

    it("should return undefined for empty string id", () => {
      const type = getTypeById("");
      expect(type).toBeUndefined();
    });
  });

  describe("getTypeByName", () => {
    it("should find type by Portuguese name", () => {
      const type = getTypeByName("Espiritual");
      expect(type).toBeDefined();
      expect(type!.id).toBe("spiritual");
    });

    it("should find type by English name", () => {
      const type = getTypeByName("Spiritual");
      expect(type).toBeDefined();
      expect(type!.id).toBe("spiritual");
    });

    it("should be case insensitive", () => {
      expect(getTypeByName("ESPIRITUAL")!.id).toBe("spiritual");
      expect(getTypeByName("espiritual")!.id).toBe("spiritual");
      expect(getTypeByName("EsPiRiTuAl")!.id).toBe("spiritual");
    });

    it("should find emotional type by name", () => {
      const type = getTypeByName("Emocional");
      expect(type).toBeDefined();
      expect(type!.id).toBe("emotional");
    });

    it("should find mental type by name", () => {
      const type = getTypeByName("Mental");
      expect(type).toBeDefined();
      expect(type!.id).toBe("mental");
    });

    it("should find physical type by name", () => {
      const type = getTypeByName("Físico");
      expect(type).toBeDefined();
      expect(type!.id).toBe("physical");
    });

    it("should find relational type by name", () => {
      const type = getTypeByName("Relacional");
      expect(type).toBeDefined();
      expect(type!.id).toBe("relational");
    });

    it("should find transformational type by name", () => {
      const type = getTypeByName("Transformacional");
      expect(type).toBeDefined();
      expect(type!.id).toBe("transformational");
    });

    it("should find manifestational type by name", () => {
      const type = getTypeByName("Manifestacional");
      expect(type).toBeDefined();
      expect(type!.id).toBe("manifestational");
    });

    it("should find ancestral type by name", () => {
      const type = getTypeByName("Ancestral");
      expect(type).toBeDefined();
      expect(type!.id).toBe("ancestral");
    });

    it("should return undefined for non-existent name", () => {
      const type = getTypeByName("nonexistent");
      expect(type).toBeUndefined();
    });

    it("should return undefined for empty string", () => {
      const type = getTypeByName("");
      expect(type).toBeUndefined();
    });
  });

  describe("getTypesByElement", () => {
    it("should return spiritual type for Ether element", () => {
      const types = getTypesByElement("Ether");
      expect(types).toHaveLength(1);
      expect(types[0].id).toBe("spiritual");
    });

    it("should return emotional type for Water element", () => {
      const types = getTypesByElement("Water");
      expect(types).toHaveLength(1);
      expect(types[0].id).toBe("emotional");
    });

    it("should return mental type for Air element", () => {
      const types = getTypesByElement("Air");
      expect(types).toHaveLength(1);
      expect(types[0].id).toBe("mental");
    });

    it("should return physical and ancestral types for Earth element", () => {
      const types = getTypesByElement("Earth");
      expect(types).toHaveLength(2);
      const ids = types.map((t) => t.id);
      expect(ids).toContain("physical");
      expect(ids).toContain("ancestral");
    });

    it("should return relational, transformational, and manifestational types for Fire element", () => {
      const types = getTypesByElement("Fire");
      expect(types).toHaveLength(3);
      const ids = types.map((t) => t.id);
      expect(ids).toContain("relational");
      expect(ids).toContain("transformational");
      expect(ids).toContain("manifestational");
    });

    it("should be case insensitive", () => {
      expect(getTypesByElement("ether")).toHaveLength(1);
      expect(getTypesByElement("ETHER")).toHaveLength(1);
      expect(getTypesByElement("Fire")).toHaveLength(3);
      expect(getTypesByElement("fire")).toHaveLength(3);
    });

    it("should return empty array for non-existent element", () => {
      const types = getTypesByElement("nonexistent");
      expect(types).toHaveLength(0);
    });

    it("should return empty array for empty string", () => {
      const types = getTypesByElement("");
      expect(types).toHaveLength(0);
    });
  });
});