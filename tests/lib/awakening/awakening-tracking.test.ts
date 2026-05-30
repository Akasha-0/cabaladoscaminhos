import { describe, it, expect, beforeEach, vi } from "vitest";
import { trackProgress } from "@/lib/awakening/awakening-tracking";

describe("trackProgress", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves date to localStorage", () => {
    const date = "2024-06-15";
    trackProgress({ date });

    const stored = localStorage.getItem("awakening_progress");
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.date).toBe(date);
  });

  it("defaults to today's date when no date provided", () => {
    const today = new Date().toISOString().split("T")[0];
    trackProgress({});

    const stored = localStorage.getItem("awakening_progress");
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.date).toBe(today);
  });

  it("saves level when provided", () => {
    trackProgress({ level: 42 });

    const stored = localStorage.getItem("awakening_progress");
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.level).toBe(42);
  });

  it("does not crash when localStorage is unavailable", () => {
    vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new Error("localStorage unavailable");
    });

    expect(() => trackProgress({ date: "2024-06-15", level: 5 })).not.toThrow();
  });

  it("multiple calls overwrite (only last date/level is stored)", () => {
    trackProgress({ date: "2024-01-01", level: 1 });
    trackProgress({ date: "2024-06-15", level: 5 });

    const stored = localStorage.getItem("awakening_progress");
    const parsed = JSON.parse(stored!);
    expect(parsed.date).toBe("2024-06-15");
    expect(parsed.level).toBe(5);
  });
});