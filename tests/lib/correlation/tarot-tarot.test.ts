import { describe, it, expect } from "vitest";
import { getTarotTarot, getAllTarotPaths, getAllPathTypes } from "@/lib/correlation/tarot-tarot";

describe("tarot-tarot", () => {
  it("getTarotTarot returns mappings for O Sol", () => {
    const result = getTarotTarot("O Sol");
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it("getAllTarotPaths returns all mappings", () => {
    const result = getAllTarotPaths();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(60);
  });

  it("getAllPathTypes returns 7 types", () => {
    const result = getAllPathTypes();
    expect(result.length).toBe(7);
  });
});
