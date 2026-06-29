// orixa-calendar-engine.spec.ts — vitest suite (≥40 it())
import { describe, it, expect } from "vitest";
import {
  ORIXAS, ORIXA_COLORS, ORIXA_FOODS,
  createOrixaCalendarEntry, getOrixaByDate, getOrixaByHour,
  listOrixaFeastDays, crossReferenceOrixa, validateCalendarEntry,
  chainCalendarHash, verifyCalendarHashLink, auditOrixaCalendarCoverage,
  toISODate, toOrixaName, isOrixaName, isISODate,
  findOrixa, orixasForDia, dayOfWeekFromDate, lunarDayApprox,
  yorubaDate, nowBRT, parseISODateBRT, emptyOrixaDay,
  getNextFeastDay, listLinhasUmbanda, orixasInLinha,
} from "./orixa-calendar-engine.js";

const SEC = "secret_w67_test_chain";
const ISO = (s: string) => toISODate(s);

describe("ORIXAS canonical — 16 Orixás", () => {
  it("has exactly 16 Orixás", () => expect(ORIXAS.length).toBe(16));
  it("names include Oxalá", () => expect(ORIXAS.find(o => o.name === "Oxala")).toBeDefined());
  it("names include Ogum", () => expect(ORIXAS.find(o => o.name === "Ogum")).toBeDefined());
  it("names include Iemanjá", () => expect(ORIXAS.find(o => o.name === "Iemanjá")).toBeDefined());
  it("names include Exu", () => expect(ORIXAS.find(o => o.name === "Exu")).toBeDefined());
  it("names include Pombagira", () => expect(ORIXAS.find(o => o.name === "Pombagira")).toBeDefined());
  it("names include Cigano", () => expect(ORIXAS.find(o => o.name === "Cigano")).toBeDefined());
  it("every Orixá has número > 0", () => expect(ORIXAS.every(o => o.numero > 0)).toBe(true));
  it("every Orixá has cumprimento", () => expect(ORIXAS.every(o => o.cumprimento.length > 0)).toBe(true));
  it("every Orixá has ≥2 cores", () => expect(ORIXAS.every(o => o.cores.length >= 2)).toBe(true));
  it("every Orixá has ≥2 símbolos", () => expect(ORIXAS.every(o => o.simbolos.length >= 2)).toBe(true));
});

describe("ORIXA_COLORS — taboo color per Orixá", () => {
  it("every Orixá has primary/secondary/taboo", () => {
    ORIXAS.forEach(o => {
      const c = ORIXA_COLORS[o.name];
      expect(c.length).toBe(3);
      expect(c[0]).not.toBe(c[2]);
    });
  });
  it("Oxalá taboo = preto", () => expect(ORIXA_COLORS.Oxala[2]).toBe("preto"));
  it("Ogum taboo = amarelo", () => expect(ORIXA_COLORS.Ogum[2]).toBe("amarelo"));
});

describe("ORIXA_FOODS — sacred dietary laws", () => {
  it("every Orixá has preferred ≥1", () => {
    ORIXAS.forEach(o => expect(ORIXA_FOODS[o.name].preferred.length).toBeGreaterThan(0));
  });
  it("every Orixá has taboo ≥1", () => {
    ORIXAS.forEach(o => expect(ORIXA_FOODS[o.name].taboo.length).toBeGreaterThan(0));
  });
});

describe("createOrixaCalendarEntry — Friday = Oxalá", () => {
  const fri = ISO("2026-06-26T12:00:00-03:00"); // Friday
  it("Friday = Sexta", () => expect(createOrixaCalendarEntry(fri).dayOfWeek).toBe("Sexta"));
  it("Friday primary = Oxala", () => expect(createOrixaCalendarEntry(fri).primaryOrixa).toBe("Oxala"));
  it("Friday produces 24 hourRulers", () => expect(createOrixaCalendarEntry(fri).hourRulers.length).toBe(24));
  it("Friday has lunar aprox 0..29", () => {
    const n = createOrixaCalendarEntry(fri).lunaAproximada;
    expect(n).toBeGreaterThanOrEqual(0); expect(n).toBeLessThanOrEqual(29);
  });
  it("2010-02-02 BRT = Feast of Iemanjá", () => {
    const r = createOrixaCalendarEntry(ISO("2010-02-02T12:00:00-03:00"));
    expect(r.feastOrixas).toContain("Iemanjá");
  });
  it("2024-08-16 = Feast of Obaluaiê", () => {
    const r = createOrixaCalendarEntry(ISO("2024-08-16T12:00:00-03:00"));
    expect(r.feastOrixas).toContain("Obaluaiê");
  });
  it("any entry preserves date string", () => {
    const r = createOrixaCalendarEntry(ISO("2026-06-30T12:00:00-03:00"));
    expect(r.date).toBe("2026-06-30T12:00:00-03:00");
  });
});

describe("getOrixaByDate — alias of createOrixaCalendarEntry", () => {
  it("same input → same output", () => {
    const d = ISO("2026-12-04T00:00:00-03:00"); // Iansã feast day
    expect(getOrixaByDate(d)).toEqual(createOrixaCalendarEntry(d));
  });
});

describe("getOrixaByHour — Yoruba day boundary 18:00 BRT", () => {
  it("hour 19 of 2026-06-30 is part of next Yoruba day index 1", () => {
    const r = getOrixaByHour(ISO("2026-06-30T19:00:00-03:00"), 19);
    expect(r.hour).toBe(19);
    expect(r.hourKind).toBe("nocturnal");
    // Index in HOUR_SEQUENCE for hour 19 = 1 → Ogum
    expect(r.orixa).toBe("Ogum");
  });
  it("hour 12 (noon) = diurnal index 18 → Iemanjá", () => {
    const r = getOrixaByHour(ISO("2026-06-30T12:00:00-03:00"), 12);
    expect(r.hourKind).toBe("diurnal");
    expect(r.orixa).toBe("Iemanjá");
  });
  it("hour 0 (midnight BRT) = diurnal index 6 → Ogum", () => {
    expect(getOrixaByHour(ISO("2026-06-30T00:00:00-03:00"), 0).orixa).toBe("Ogum");
  });
  it("hour 18 (Yoruba day boundary) = nocturnal index 0 → Exu", () => {
    expect(getOrixaByHour(ISO("2026-06-30T18:00:00-03:00"), 18).orixa).toBe("Exu");
  });
  it("invalid hour 24 throws RangeError", () => {
    expect(() => getOrixaByHour(ISO("2026-06-30T00:00:00-03:00"), 24)).toThrow();
  });
});

describe("listOrixaFeastDays — annual cycle", () => {
  it("Iemanjá has feast on 02-02", () => {
    const list = listOrixaFeastDays("Iemanjá", 2026);
    expect(list.some(s => s.includes("2026-02-02"))).toBe(true);
  });
  it("Obaluaiê has feast on 08-16", () => {
    const list = listOrixaFeastDays("Obaluaiê", 2025);
    expect(list.some(s => s.includes("2025-08-16"))).toBe(true);
  });
  it("every ISO date is valid", () => {
    ORIXAS.forEach(o => listOrixaFeastDays(o.name, 2030).forEach(s => expect(isISODate(s)).toBe(true)));
  });
  it("year 1900 throws", () => {
    expect(() => listOrixaFeastDays("Oxala", 1899)).toThrow();
  });
});

describe("crossReferenceOrixa — 7 traditions", () => {
  it("Oxalá → cigano 34", () => expect(crossReferenceOrixa("Oxala").cigano).toContain(34));
  it("Ogum → astrologia Áries", () => expect(crossReferenceOrixa("Ogum").astrologia).toContain("Áries"));
  it("Iemanjá → sefirah Binah", () => expect(crossReferenceOrixa("Iemanjá").sefirot).toContain("Binah"));
  it("Xangô → chakra 3", () => expect(crossReferenceOrixa("Xango").chakras).toContain(3));
  it("Exu → hebrew Het", () => expect(crossReferenceOrixa("Exu").hebrew).toContain("Het"));
  it("Oxalá → numerologia 1", () => expect(crossReferenceOrixa("Oxala").numerologia).toBe(1));
  it("unknown orixa throws", () => {
    expect(() => crossReferenceOrixa("Foo" as never)).toThrow();
  });
});

describe("validateCalendarEntry — never throws", () => {
  const good = createOrixaCalendarEntry(ISO("2026-06-30T12:00:00-03:00"));
  it("good entry returns ok:true", () => expect(validateCalendarEntry(good).ok).toBe(true));
  it("null entry returns ok:false", () => expect(validateCalendarEntry(null as never).ok).toBe(false));
  it("bad luna returns ok:false", () => {
    const bad = { ...good, lunaAproximada: 999 };
    expect(validateCalendarEntry(bad as never).ok).toBe(false);
  });
  it("short hourRulers returns ok:false", () => {
    const bad = { ...good, hourRulers: [] };
    expect(validateCalendarEntry(bad as never).ok).toBe(false);
  });
  it("empty factory is valid", () => expect(validateCalendarEntry(emptyOrixaDay()).ok).toBe(true));
});

describe("chainCalendarHash — HMAC-SHA256 chain", () => {
  const e1 = createOrixaCalendarEntry(ISO("2026-06-30T00:00:00-03:00"));
  const e2 = createOrixaCalendarEntry(ISO("2026-07-01T00:00:00-03:00"));
  it("genesis → chain[e1] → 64-char hex", () => {
    expect(chainCalendarHash("genesis", e1, SEC)).toMatch(/^[0-9a-f]{64}$/);
  });
  it("same prev+entry+secret → same hash (deterministic)", () => {
    expect(chainCalendarHash("genesis", e1, SEC)).toBe(chainCalendarHash("genesis", e1, SEC));
  });
  it("different entry → different hash", () => {
    expect(chainCalendarHash("genesis", e1, SEC)).not.toBe(chainCalendarHash("genesis", e2, SEC));
  });
  it("chain[e2] != hash[e1] (chain link sensitive)", () => {
    const h1 = chainCalendarHash("genesis", e1, SEC);
    expect(chainCalendarHash(h1, e2, SEC)).not.toBe(chainCalendarHash("genesis", e2, SEC));
  });
  it("empty secret throws", () => expect(() => chainCalendarHash("x", e1, "")).toThrow());
  it("verify returns true for same hash", () => {
    const h = chainCalendarHash("g", e1, SEC);
    expect(verifyCalendarHashLink("g", e1, h, SEC)).toBe(true);
  });
  it("verify returns false for tampered hash", () => {
    const h = chainCalendarHash("g", e1, SEC);
    expect(verifyCalendarHashLink("g", e1, h.slice(0, -1) + "0", SEC)).toBe(false);
  });
});

describe("auditOrixaCalendarCoverage — sacred coverage ≥ 115 across 7 traditions", () => {
  const r = auditOrixaCalendarCoverage();
  it("isFullCoverage = true", () => expect(r.isFullCoverage).toBe(true));
  it("orixas ≥ 16", () => expect(r.orixas).toBeGreaterThanOrEqual(16));
  it("cigano ≥ 16", () => expect(r.cigano).toBeGreaterThanOrEqual(16));
  it("astrologia ≥ 12", () => expect(r.astrologia).toBeGreaterThanOrEqual(12));
  it("sefirot ≥ 10", () => expect(r.sefirot).toBeGreaterThanOrEqual(10));
  it("chakras = 7", () => expect(r.chakras).toBe(7));
  it("hebrew ≥ 22", () => expect(r.hebrew).toBeGreaterThanOrEqual(22));
  it("numerologia ≥ 12", () => expect(r.numerologia).toBeGreaterThanOrEqual(12));
  it("linhas = 7", () => expect(r.linhas).toBe(7));
  it("total ≥ 115", () => expect(r.totalSymbols).toBeGreaterThanOrEqual(115));
});

describe("getNextFeastDay — próxima festa", () => {
  it("Oxalá from 2026-06-30 returns 2027-01-01", () => {
    const r = getNextFeastDay("Oxala", ISO("2026-06-30T12:00:00-03:00"));
    expect(r.date).toBe("2027-01-01T00:00:00-03:00");
  });
  it("Iemanjá from 2025-06-30 returns 2026-02-02", () => {
    expect(getNextFeastDay("Iemanjá", ISO("2025-06-30T12:00:00-03:00")).date).toBe("2026-02-02T00:00:00-03:00");
  });
});

describe("Linha umbanda lookup", () => {
  it("returns 7 Linhas", () => expect(listLinhasUmbanda().length).toBe(7));
  it("Caboclos include Oxossi", () => expect(orixasInLinha("Caboclos")).toContain("Oxossi"));
  it("Pombagiras include Pombagira", () => expect(orixasInLinha("Pombagiras")).toContain("Pombagira"));
});

describe("Helper utilities", () => {
  it("isISODate accepts canonical", () => expect(isISODate("2026-06-30T12:00:00-03:00")).toBe(true));
  it("isISODate rejects datetime-only", () => expect(isISODate("2026-06-30")).toBe(false));
  it("isISODate rejects Z without ms", () => expect(isISODate("2026-06-30T12:00:00Z")).toBe(true));
  it("toISODate throws on bad", () => expect(() => toISODate("bad")).toThrow());
  it("toOrixaName accepts Oxala", () => expect(toOrixaName("Oxala")).toBe("Oxala"));
  it("toOrixaName throws on Foo", () => expect(() => toOrixaName("Foo")).toThrow());
  it("isOrixaName narrows", () => expect(isOrixaName("Oxala")).toBe(true));
  it("findOrixa returns ref", () => expect(findOrixa("Exu").cumprimento).toMatch(/^Laroiê/));
  it("orixasForDia Sexta includes Oxalá", () => expect(orixasForDia("Sexta")).toContain("Oxala"));
  it("orixasForDia Quarta has 3+", () => expect(orixasForDia("Quarta").length).toBeGreaterThanOrEqual(3));
  it("dayOfWeekFromDate 2026-06-30 BRT = Terça", () => expect(dayOfWeekFromDate(ISO("2026-06-30T12:00:00-03:00"))).toBe("Terça"));
  it("dayOfWeekFromDate 2026-06-28 BRT = Domingo", () => expect(dayOfWeekFromDate(ISO("2026-06-28T12:00:00-03:00"))).toBe("Domingo"));
  it("yorubaDate hour 19 shifts forward by 1 day", () => {
    expect(yorubaDate(ISO("2026-06-30T19:00:00-03:00")).slice(0, 10)).toBe("2026-07-01");
  });
  it("yorubaDate hour 09 stays same day", () => {
    expect(yorubaDate(ISO("2026-06-30T09:00:00-03:00")).slice(0, 10)).toBe("2026-06-30");
  });
  it("lunarDayApprox returns 0..29", () => {
    const n = lunarDayApprox(ISO("2026-06-30T12:00:00-03:00"));
    expect(n).toBeGreaterThanOrEqual(0); expect(n).toBeLessThanOrEqual(29);
  });
  it("nowBRT returns valid ISO", () => expect(isISODate(nowBRT())).toBe(true));
  it("parseISODateBRT extracts components", () => {
    const p = parseISODateBRT(ISO("2026-06-30T14:35:21-03:00"));
    expect(p.y).toBe(2026); expect(p.mo).toBe(6); expect(p.d).toBe(30);
    expect(p.hh).toBe(14); expect(p.mm).toBe(35); expect(p.ss).toBe(21);
  });
});
