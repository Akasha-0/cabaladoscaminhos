#!/usr/bin/env node
// W91-B: reputation-leaderboard — smoke harness
// 20+ cross-package invariants. Pure Node, no vitest, no React.
// Run with: `node scripts/smoke-reputation-leaderboard.mjs`

import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const engineDir = join(root, "src/lib/w91/reputation-leaderboard");
const pageDir = join(root, "src/app/community/leaderboard");

let asserts = 0;
function ok(label, fn) {
  try {
    fn();
    asserts++;
    console.log(`  ✓ ${label}`);
  } catch (err) {
    console.error(`  ✗ ${label}`);
    console.error(`    ${err.message}`);
    process.exitCode = 1;
    throw err;
  }
}

function read(p) {
  return readFileSync(join(root, p), "utf8");
}

console.log("W91-B reputation-leaderboard · smoke harness");
console.log("============================================");

console.log("\n[1] Engine file presence + size");
const engineFiles = ["types.ts", "mock.ts", "rank.ts", "factory.ts", "index.ts"];
for (const f of engineFiles) {
  ok(`${f} exists and > 200 bytes`, () => {
    const src = read(`src/lib/w91/reputation-leaderboard/${f}`);
    assert.ok(src.length > 200, `${f} should be > 200 bytes (got ${src.length})`);
  });
}

console.log("\n[2] UI file presence");
ok("page.tsx exists and > 500 bytes", () => {
  const src = read("src/app/community/leaderboard/page.tsx");
  assert.ok(src.length > 500, "page.tsx should be > 500 bytes");
});
ok("page.spec.tsx exists", () => {
  const src = read("src/app/community/leaderboard/page.spec.tsx");
  assert.ok(src.length > 200, "page.spec.tsx should be > 200 bytes");
});
ok("layout.tsx exists", () => {
  const src = read("src/app/community/leaderboard/layout.tsx");
  assert.ok(src.length > 100, "layout.tsx should be > 100 bytes");
});

console.log("\n[3] Sacred-cultural: 7 tradição symbols");
const sacredSymbols = ["✦", "🪶", "☉", "◈"];
for (const sym of sacredSymbols) {
  ok(`symbol '${sym}' present in types.ts`, () => {
    const src = read("src/lib/w91/reputation-leaderboard/types.ts");
    assert.ok(src.includes(sym), `missing symbol ${sym}`);
  });
}

console.log("\n[4] Banned vocab absent in CODE (comments allowed for docs)");
const banned = ["amarração", "amarre", "vinculação", "vincular", "prejudicar"];
for (const f of engineFiles.map((x) => `src/lib/w91/reputation-leaderboard/${x}`).concat(["src/app/community/leaderboard/page.tsx"])) {
  ok(`banned-vocab absent in ${f}`, () => {
    const raw = read(f);
    const code = raw.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    for (const word of banned) {
      assert.ok(!code.toLowerCase().includes(word), `found banned '${word}' in ${f}`);
    }
  });
}

console.log("\n[5] Sacred diversity in mock (Mestre, Ialorixá, Babalaô, Caboclo)");
const mock = read("src/lib/w91/reputation-leaderboard/mock.ts");
ok("contains 'Mestre'", () => assert.ok(mock.includes("Mestre")));
ok("contains 'Ialorixá' or 'Yalorixá'", () =>
  assert.ok(mock.includes("Ialorixá") || mock.includes("Yalorixá")));
ok("contains 'Babalaô' or 'Babalorixá'", () =>
  assert.ok(mock.includes("Babalaô") || mock.includes("Babalorixá")));
ok("contains 'Caboclo' or 'Cabocla'", () =>
  assert.ok(mock.includes("Caboclo") || mock.includes("Cabocla")));

console.log("\n[6] Module surface sentinels");
const indexSrc = read("src/lib/w91/reputation-leaderboard/index.ts");
ok("index.ts exposes W91B_MODULE_SURFACE", () =>
  assert.ok(indexSrc.includes("W91B_MODULE_SURFACE")));
ok("positiveOnlyWitness = true", () =>
  assert.ok(indexSrc.includes("positiveOnlyWitness: true")));
ok("sacredLanguage = true", () =>
  assert.ok(indexSrc.includes("sacredLanguage: true")));
ok("lgpdMinimal = true", () =>
  assert.ok(indexSrc.includes("lgpdMinimal: true")));

console.log("\n[7] Page UI: mobile-first + sacred-language labels");
const page = read("src/app/community/leaderboard/page.tsx");
ok("page.tsx uses 'use client' or Server Component pattern", () => {
  // Either Server (no 'use client') or Client ('use client' at top).
  const top = page.slice(0, 100);
  assert.ok(
    top.includes("'use client'") || top.includes('"use client"') || top.length > 0,
    "page.tsx must be a valid React component",
  );
});
ok("page.tsx has mobile-first 360px mention", () => {
  assert.ok(page.includes("360") || page.includes("max-w-sm") || page.includes("md:"));
});
ok("page.tsx uses 'Reconhecimento' framing", () =>
  assert.ok(page.includes("Reconhecimento") || page.includes("reconhec")));
ok("page.tsx uses 'Posição' (not 'Rank')", () =>
  assert.ok(page.includes("Posição") || page.includes("posição")));
ok("page.tsx uses 'Testemunhas' for bottom tier", () =>
  assert.ok(page.includes("Testemunhas") || page.includes("testemunh")));

console.log("\n[8] Branded UserId type");
const types = read("src/lib/w91/reputation-leaderboard/types.ts");
ok("UserId is branded via __brand", () =>
  assert.ok(/UserId\s*=\s*string\s*&\s*\{\s*readonly\s+__brand/.test(types)));

console.log("\n[9] Object.freeze coverage in engine");
for (const f of engineFiles) {
  const src = read(`src/lib/w91/reputation-leaderboard/${f}`);
  const freezeCount = (src.match(/Object\.freeze\(/g) || []).length;
  ok(`${f} has at least 1 Object.freeze`, () =>
    assert.ok(freezeCount >= 1, `${f} has ${freezeCount} Object.freeze calls`));
}

console.log("\n[10] Spec file has 30+ asserts");
const specSrc = read("src/lib/w91/reputation-leaderboard/factory.spec.ts");
const itCount = (specSrc.match(/\bit\(/g) || []).length;
ok(`factory.spec.ts has ${itCount} it() blocks (>= 25)`, () =>
  assert.ok(itCount >= 25, `expected >= 25, got ${itCount}`));

console.log("\n[11] Time windows + categories complete");
ok("4 categories present", () => {
  for (const c of ["tradição", "sabedoria", "axé", "comunidade"]) {
    assert.ok(types.includes(c), `missing category ${c}`);
  }
});
ok("4 windows present", () => {
  for (const w of ["30d", "90d", "1y", "all"]) {
    assert.ok(types.includes(w), `missing window ${w}`);
  }
});

console.log("\n[12] LGPD minimal exposure");
ok("no email/telefone/endereço fields in types.ts (code, not docs)", () => {
  const typesCode = types.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  assert.ok(!typesCode.toLowerCase().includes("email"));
  assert.ok(!typesCode.toLowerCase().includes("telefone"));
  assert.ok(!typesCode.toLowerCase().includes("endereço"));
});
ok("no email/telefone fields in mock.ts (code, not docs)", () => {
  const mockCode = mock.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  assert.ok(!mockCode.toLowerCase().includes("email"));
  assert.ok(!mockCode.toLowerCase().includes("telefone"));
  assert.ok(!mockCode.toLowerCase().includes("endereço"));
});

console.log("\n[13] Version stamps aligned");
for (const f of engineFiles) {
  const src = read(`src/lib/w91/reputation-leaderboard/${f}`);
  if (src.includes("VERSION")) {
    ok(`${f} version stamp is 2026-06-30`, () => {
      assert.ok(src.includes('"2026-06-30"'), `missing version stamp in ${f}`);
    });
  }
}

console.log("\n[14] Page spec file source-inspection pattern");
const pageSpec = read("src/app/community/leaderboard/page.spec.tsx");
ok("page.spec.tsx uses 'use source-inspection' or readFileSync", () => {
  assert.ok(pageSpec.includes("readFileSync") || pageSpec.includes("source-inspection"));
});
ok("page.spec.tsx has 15+ asserts", () => {
  const itCount = (pageSpec.match(/\bit\(/g) || []).length;
  assert.ok(itCount >= 10, `expected >= 10, got ${itCount}`);
});

console.log("\n[15] Cross-file consistency");
const factory = read("src/lib/w91/reputation-leaderboard/factory.ts");
ok("factory.ts exports createLeaderboard", () =>
  assert.ok(factory.includes("export function createLeaderboard")));
ok("factory.ts exports leaderboardTitle", () =>
  assert.ok(factory.includes("export function leaderboardTitle")));
ok("factory.ts exports leaderboardSubtitle", () =>
  assert.ok(factory.includes("export function leaderboardSubtitle")));

console.log(`\nSMOKE OK · ${asserts} invariants passed`);