// =============================================================================
// w66/translation-tooling.spec.ts — self-running harness
// -----------------------------------------------------------------------------
// No vitest/jest. Runs under: `node --experimental-strip-types <file>`
// Pattern from cycle 60+ spec files: console.log PASS/FAIL counts + exit 0/1.
//
// 14 describe blocks, 70+ it() blocks, surgical coverage:
//   states (5) | types (5) | locales (4) | glossary (8) | errors (4) |
//   create (5) | claim (4) | submit (6) | approve (4) | reject (4) |
//   validate (4) | bleu (4) | HMAC (4) | sacred (8) | a11y (4) | total ≈ 71
// =============================================================================

import {
  LOCALE_BUNDLES,
  SACRED_GLOSSARY,
  TRANSLATION_STATES,
  TRANSLATION_SACRED_TAGS,
  TRANSLATION_TRADITION_FLOORS,
  TRANSLATION_TRADITION_IDS,
  createTranslationJob,
  claimTranslation,
  submitTranslation,
  approveTranslation,
  rejectTranslation,
  validateLocaleBundle,
  computeBleuLiteScore,
  chainTranslationHash,
  auditTranslationCoverage,
  isFullCoverage,
  isValidTransition,
  checkA11yPreservation,
  sacredTermOverlap,
  clampBleuScore,
  emptyLocaleProgress,
  isApprovedJob,
  isPendingJob,
  isSacredGlossaryEntry,
  exportTranslationJobs,
  eraseUserTranslationJobs,
  resetLedgerForTests,
  InvalidLocaleError,
  TranslationStateError,
  GlossaryMismatchError,
  A11yViolationError,
  __internalLedgerSize,
  __internalLedgerHead,
  __getJob,
  __ALL_EXPORTS,
  type JobId,
  type TranslatorId,
  type ReviewerId,
  type UserId,
  type LocaleCode,
  type GlossaryTerm,
  type NewTranslationJob,
  type TranslationJob,
  type CoverageReport,
} from "./translation-tooling.ts";

// -----------------------------------------------------------------------------
// Self-running harness (no vitest)
// -----------------------------------------------------------------------------

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assertEq(actual: unknown, expected: unknown, label: string): void {
  if (Object.is(actual, expected)) {
    passed++;
  } else {
    failed++;
    failures.push(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertTrue(cond: boolean, label: string): void {
  if (cond) {
    passed++;
  } else {
    failed++;
    failures.push(label);
  }
}

type ErrorClass = abstract new (...args: never) => Error;

function assertThrows(fn: () => unknown, ctor: ErrorClass, label: string): void {
  try {
    fn();
    failed++;
    failures.push(`${label}: expected throw of ${ctor.name}`);
  } catch (e) {
    // Custom check: ctor.name must match the thrown error's constructor name
    if (e instanceof Error && e.constructor.name === ctor.name) {
      passed++;
    } else {
      failed++;
      failures.push(`${label}: expected ${ctor.name}, got ${(e as Error).name} — ${(e as Error).message}`);
    }
  }
}

function assertNotThrow(fn: () => unknown, label: string): void {
  try {
    fn();
    passed++;
  } catch (e) {
    failed++;
    failures.push(`${label}: function unexpectedly threw — ${(e as Error).message}`);
  }
}

const test = (label: string, fn: () => void): void => {
  fn();
};

const describe = (label: string, fn: () => void): void => {
  console.log(`\n--- ${label} ---`);
  fn();
};

// =============================================================================
// SECTION A — STATES (5 assertions)
// =============================================================================

describe("states (5)", () => {
  test("has 5 states", () => {
    assertEq(TRANSLATION_STATES.length, 5, "states.length");
  });
  test("contains pending", () => {
    assertTrue(TRANSLATION_STATES.includes("pending"), "has pending");
  });
  test("contains claimed", () => {
    assertTrue(TRANSLATION_STATES.includes("claimed"), "has claimed");
  });
  test("contains in_review", () => {
    assertTrue(TRANSLATION_STATES.includes("in_review"), "has in_review");
  });
  test("terminal states are approved and rejected", () => {
    assertTrue(TRANSLATION_STATES.includes("approved"), "has approved");
    assertTrue(TRANSLATION_STATES.includes("rejected"), "has rejected");
  });
});

// =============================================================================
// SECTION B — TYPES (5 assertions)
// =============================================================================

describe("types (5)", () => {
  test("isValidTransition: pending → claimed", () => {
    assertTrue(isValidTransition("pending", "claimed"), "pending→claimed");
  });
  test("isValidTransition: claimed → in_review", () => {
    assertTrue(isValidTransition("claimed", "in_review"), "claimed→in_review");
  });
  test("isValidTransition: in_review → approved", () => {
    assertTrue(isValidTransition("in_review", "approved"), "in_review→approved");
  });
  test("isValidTransition: in_review → rejected", () => {
    assertTrue(isValidTransition("in_review", "rejected"), "in_review→rejected");
  });
  test("isValidTransition: backward forbidden (approved → pending)", () => {
    assertTrue(!isValidTransition("approved", "pending"), "approved→pending blocked");
  });
});

// =============================================================================
// SECTION C — LOCALES (4 assertions)
// =============================================================================

describe("locales (4)", () => {
  test("3 bundles", () => {
    assertEq(LOCALE_BUNDLES.length, 3, "bundles.length");
  });
  test("PT-BR is 100% complete", () => {
    const pt = LOCALE_BUNDLES.find((b) => b.code === "pt-BR");
    assertEq(pt?.completion, 100, "pt-BR completion");
  });
  test("EN is 64% complete", () => {
    const en = LOCALE_BUNDLES.find((b) => b.code === "en");
    assertEq(en?.completion, 64, "en completion");
  });
  test("ES is 38% complete", () => {
    const es = LOCALE_BUNDLES.find((b) => b.code === "es");
    assertEq(es?.completion, 38, "es completion");
  });
});

// =============================================================================
// SECTION D — GLOSSARY (8 assertions)
// =============================================================================

describe("glossary (8)", () => {
  test("CIGANO has 84 entries (28 cards × 3 locales)", () => {
    assertEq(SACRED_GLOSSARY.CIGANO.length, 84, "cigano entries");
  });
  test("CIGANO has all 3 locales represented", () => {
    const locales = new Set(SACRED_GLOSSARY.CIGANO.map((e) => e.locale));
    assertEq(locales.size, 3, "cigano locales");
  });
  test("CIGANO term format is correct", () => {
    const first = SACRED_GLOSSARY.CIGANO[0]!;
    assertTrue(first.term.startsWith("cigano."), "cigano term prefix");
    assertTrue(typeof first.translation === "string", "cigano translation is string");
  });
  test("PT-BR CIGANO translation is 'O Cavaleiro' (card 1)", () => {
    const e = SACRED_GLOSSARY.CIGANO.find((g) => g.term === "cigano.1.pt");
    assertEq(e?.translation, "O Cavaleiro", "card 1 PT-BR");
  });
  test("EN CIGANO translation is 'The Rider' (card 1)", () => {
    const e = SACRED_GLOSSARY.CIGANO.find((g) => g.term === "cigano.1.en");
    assertEq(e?.translation, "The Rider", "card 1 EN");
  });
  test("ES CIGANO translation is 'El Caballero' (card 1)", () => {
    const e = SACRED_GLOSSARY.CIGANO.find((g) => g.term === "cigano.1.es");
    assertEq(e?.translation, "El Caballero", "card 1 ES");
  });
  test("isSacredGlossaryEntry accepts valid entry", () => {
    const e = SACRED_GLOSSARY.CIGANO[0]!;
    assertTrue(isSacredGlossaryEntry(e), "valid entry accepted");
  });
  test("isSacredGlossaryEntry rejects garbage", () => {
    assertTrue(!isSacredGlossaryEntry({ term: "x", locale: "y", translation: "z", tradition: "INVALID" }), "garbage rejected");
    assertTrue(!isSacredGlossaryEntry(null), "null rejected");
    assertTrue(!isSacredGlossaryEntry("string"), "string rejected");
  });
});

// =============================================================================
// SECTION E — ERRORS (4 assertions)
// =============================================================================

describe("errors (4)", () => {
  test("InvalidLocaleError thrown on bad locale", () => {
    assertThrows(
      () =>
        createTranslationJob({
          sourceText: "hello",
          sourceLocale: "xx" as LocaleCode,
          targetLocale: "en" as LocaleCode,
          sacredTerms: [],
          section: "home",
          authorId: "u1" as UserId,
        }),
      InvalidLocaleError as unknown as ErrorClass,
      "bad source locale",
    );
  });
  test("TranslationStateError thrown on invalid transition", () => {
    const job = createTranslationJob({
      sourceText: "hello",
      sourceLocale: "pt-BR" as LocaleCode,
      targetLocale: "en" as LocaleCode,
      sacredTerms: [],
      section: "home",
      authorId: "u1" as UserId,
    });
    assertThrows(
      () => approveTranslation(job.jobId, "r1" as ReviewerId),
      TranslationStateError as unknown as ErrorClass,
      "approve from pending",
    );
  });
  test("GlossaryMismatchError thrown on submit without glossary", () => {
    const job = createTranslationJob({
      sourceText: "hello",
      sourceLocale: "pt-BR" as LocaleCode,
      targetLocale: "en" as LocaleCode,
      sacredTerms: ["cigano.1.pt" as GlossaryTerm],
      section: "home",
      authorId: "u1" as UserId,
    });
    const claimed = claimTranslation(job.jobId, "t1" as TranslatorId);
    assertThrows(
      () =>
        submitTranslation(claimed.jobId, {
          candidateText: "world",
          usedGlossary: [],
          a11yPreserved: true,
        }),
      GlossaryMismatchError as unknown as ErrorClass,
      "no glossary",
    );
  });
  test("A11yViolationError thrown when A11y markers lost", () => {
    const job = createTranslationJob({
      sourceText: 'hello <mark>word</mark> <span aria-label="x">y</span>',
      sourceLocale: "pt-BR" as LocaleCode,
      targetLocale: "en" as LocaleCode,
      sacredTerms: [],
      section: "home",
      authorId: "u1" as UserId,
    });
    const claimed = claimTranslation(job.jobId, "t1" as TranslatorId);
    assertThrows(
      () =>
        submitTranslation(claimed.jobId, {
          candidateText: "world without markers",
          usedGlossary: [],
          a11yPreserved: false,
        }),
      A11yViolationError as unknown as ErrorClass,
      "A11y lost",
    );
  });
});

// =============================================================================
// SECTION F — CREATE (5 assertions)
// =============================================================================

describe("create (5)", () => {
  resetLedgerForTests();

  test("creates pending job", () => {
    const job = createTranslationJob({
      sourceText: "hello",
      sourceLocale: "pt-BR" as LocaleCode,
      targetLocale: "en" as LocaleCode,
      sacredTerms: [],
      section: "home",
      authorId: "u1" as UserId,
    });
    assertEq(job.state, "pending", "state is pending");
  });

  test("job has unique jobId", () => {
    const a = createTranslationJob({
      sourceText: "a",
      sourceLocale: "pt-BR" as LocaleCode,
      targetLocale: "en" as LocaleCode,
      sacredTerms: [],
      section: "home",
      authorId: "u1" as UserId,
    });
    const b = createTranslationJob({
      sourceText: "b",
      sourceLocale: "pt-BR" as LocaleCode,
      targetLocale: "en" as LocaleCode,
      sacredTerms: [],
      section: "home",
      authorId: "u1" as UserId,
    });
    assertTrue(a.jobId !== b.jobId, "jobIds differ");
  });

  test("same-locale throws", () => {
    assertThrows(
      () =>
        createTranslationJob({
          sourceText: "a",
          sourceLocale: "pt-BR" as LocaleCode,
          targetLocale: "pt-BR" as LocaleCode,
          sacredTerms: [],
          section: "home",
          authorId: "u1" as UserId,
        }),
      InvalidLocaleError as unknown as ErrorClass,
      "same locale",
    );
  });

  test("empty source text throws", () => {
    assertThrows(
      () =>
        createTranslationJob({
          sourceText: "   ",
          sourceLocale: "pt-BR" as LocaleCode,
          targetLocale: "en" as LocaleCode,
          sacredTerms: [],
          section: "home",
          authorId: "u1" as UserId,
        }),
      Error as unknown as ErrorClass,
      "empty source",
    );
  });

  test("ledger stores job", () => {
    const job = createTranslationJob({
      sourceText: "stored",
      sourceLocale: "pt-BR" as LocaleCode,
      targetLocale: "en" as LocaleCode,
      sacredTerms: [],
      section: "home",
      authorId: "u1" as UserId,
    });
    assertTrue(__internalLedgerSize() >= 1, "ledger size >= 1");
    const fetched = __getJob(job.jobId);
    assertEq(fetched?.state, "pending", "fetched is pending");
  });
});

// =============================================================================
// SECTION G — CLAIM (4 assertions)
// =============================================================================

describe("claim (4)", () => {
  resetLedgerForTests();
  test("claim transitions pending → claimed", () => {
    const job = createTranslationJob({
      sourceText: "claimable",
      sourceLocale: "pt-BR" as LocaleCode,
      targetLocale: "en" as LocaleCode,
      sacredTerms: [],
      section: "home",
      authorId: "u1" as UserId,
    });
    const claimed = claimTranslation(job.jobId, "t1" as TranslatorId);
    assertEq(claimed.state, "claimed", "state is claimed");
  });
  test("claimed job has translatorId", () => {
    const job = createTranslationJob({
      sourceText: "x",
      sourceLocale: "pt-BR" as LocaleCode,
      targetLocale: "en" as LocaleCode,
      sacredTerms: [],
      section: "home",
      authorId: "u1" as UserId,
    });
    const claimed = claimTranslation(job.jobId, "t42" as TranslatorId);
    assertEq((claimed as { translatorId: TranslatorId }).translatorId, "t42" as TranslatorId, "translatorId set");
  });
  test("double-claim throws", () => {
    const job = createTranslationJob({
      sourceText: "x",
      sourceLocale: "pt-BR" as LocaleCode,
      targetLocale: "en" as LocaleCode,
      sacredTerms: [],
      section: "home",
      authorId: "u1" as UserId,
    });
    claimTranslation(job.jobId, "t1" as TranslatorId);
    assertThrows(
      () => claimTranslation(job.jobId, "t2" as TranslatorId),
      TranslationStateError as unknown as ErrorClass,
      "double claim",
    );
  });
  test("claim unknown job throws", () => {
    assertThrows(
      () => claimTranslation("job_nonexistent" as JobId, "t1" as TranslatorId),
      Error as unknown as ErrorClass,
      "unknown job",
    );
  });
});

// =============================================================================
// SECTION H — SUBMIT (6 assertions)
// =============================================================================

describe("submit (6)", () => {
  resetLedgerForTests();
  test("submit transitions claimed → in_review", () => {
    const job = createTranslationJob({
      sourceText: "hello",
      sourceLocale: "pt-BR" as LocaleCode,
      targetLocale: "en" as LocaleCode,
      sacredTerms: [],
      section: "home",
      authorId: "u1" as UserId,
    });
    const claimed = claimTranslation(job.jobId, "t1" as TranslatorId);
    const submitted = submitTranslation(claimed.jobId, {
      candidateText: "world",
      usedGlossary: [],
      a11yPreserved: true,
    });
    assertEq(submitted.state, "in_review", "state is in_review");
  });
  test("submit sets bleuScore", () => {
    const job = createTranslationJob({
      sourceText: "hello world",
      sourceLocale: "pt-BR" as LocaleCode,
      targetLocale: "en" as LocaleCode,
      sacredTerms: [],
      section: "home",
      authorId: "u1" as UserId,
    });
    const claimed = claimTranslation(job.jobId, "t1" as TranslatorId);
    const submitted = submitTranslation(claimed.jobId, {
      candidateText: "hello world",
      usedGlossary: [],
      a11yPreserved: true,
    });
    const review = submitted as { bleuScore: number };
    assertTrue(review.bleuScore > 0.9, "bleuScore high for identical text");
  });
  test("submit from pending throws", () => {
    const job = createTranslationJob({
      sourceText: "x",
      sourceLocale: "pt-BR" as LocaleCode,
      targetLocale: "en" as LocaleCode,
      sacredTerms: [],
      section: "home",
      authorId: "u1" as UserId,
    });
    assertThrows(
      () =>
        submitTranslation(job.jobId, {
          candidateText: "y",
          usedGlossary: [],
          a11yPreserved: true,
        }),
      TranslationStateError as unknown as ErrorClass,
      "submit from pending",
    );
  });
  test("submit preserves <mark>", () => {
    const job = createTranslationJob({
      sourceText: 'hello <mark>marked</mark>',
      sourceLocale: "pt-BR" as LocaleCode,
      targetLocale: "en" as LocaleCode,
      sacredTerms: [],
      section: "home",
      authorId: "u1" as UserId,
    });
    const claimed = claimTranslation(job.jobId, "t1" as TranslatorId);
    const submitted = submitTranslation(claimed.jobId, {
      candidateText: 'world <mark>marked</mark>',
      usedGlossary: [],
      a11yPreserved: true,
    });
    assertEq(submitted.state, "in_review", "submitted OK with mark");
  });
  test("submit preserves ARIA", () => {
    const job = createTranslationJob({
      sourceText: '<button aria-label="open menu">x</button>',
      sourceLocale: "pt-BR" as LocaleCode,
      targetLocale: "en" as LocaleCode,
      sacredTerms: [],
      section: "home",
      authorId: "u1" as UserId,
    });
    const claimed = claimTranslation(job.jobId, "t1" as TranslatorId);
    const submitted = submitTranslation(claimed.jobId, {
      candidateText: '<button aria-label="open menu">y</button>',
      usedGlossary: [],
      a11yPreserved: true,
    });
    assertEq(submitted.state, "in_review", "submitted OK with aria");
  });
  test("submit preserves SSML mark", () => {
    const job = createTranslationJob({
      sourceText: 'hello <mark name="c1"/>world',
      sourceLocale: "pt-BR" as LocaleCode,
      targetLocale: "en" as LocaleCode,
      sacredTerms: [],
      section: "home",
      authorId: "u1" as UserId,
    });
    const claimed = claimTranslation(job.jobId, "t1" as TranslatorId);
    const submitted = submitTranslation(claimed.jobId, {
      candidateText: 'world <mark name="c1"/>hello',
      usedGlossary: [],
      a11yPreserved: true,
    });
    assertEq(submitted.state, "in_review", "submitted OK with ssml");
  });
});

// =============================================================================
// SECTION I — APPROVE (4 assertions)
// =============================================================================

describe("approve (4)", () => {
  resetLedgerForTests();
  test("approve transitions in_review → approved", () => {
    const job = createTranslationJob({
      sourceText: "hello",
      sourceLocale: "pt-BR" as LocaleCode,
      targetLocale: "en" as LocaleCode,
      sacredTerms: [],
      section: "home",
      authorId: "u1" as UserId,
    });
    const claimed = claimTranslation(job.jobId, "t1" as TranslatorId);
    const submitted = submitTranslation(claimed.jobId, {
      candidateText: "world",
      usedGlossary: [],
      a11yPreserved: true,
    });
    const approved = approveTranslation(submitted.jobId, "r1" as ReviewerId);
    assertEq(approved.state, "approved", "state is approved");
  });
  test("approved job has reviewerId", () => {
    const job = createTranslationJob({
      sourceText: "x",
      sourceLocale: "pt-BR" as LocaleCode,
      targetLocale: "en" as LocaleCode,
      sacredTerms: [],
      section: "home",
      authorId: "u1" as UserId,
    });
    const claimed = claimTranslation(job.jobId, "t1" as TranslatorId);
    const submitted = submitTranslation(claimed.jobId, {
      candidateText: "y",
      usedGlossary: [],
      a11yPreserved: true,
    });
    const approved = approveTranslation(submitted.jobId, "r99" as ReviewerId);
    const a = approved as { reviewerId: ReviewerId };
    assertEq(a.reviewerId, "r99" as ReviewerId, "reviewerId set");
  });
  test("mtFlagged = true when mtSource set", () => {
    const job = createTranslationJob({
      sourceText: "x",
      sourceLocale: "pt-BR" as LocaleCode,
      targetLocale: "en" as LocaleCode,
      sacredTerms: [],
      section: "home",
      mtSource: "google",
      authorId: "u1" as UserId,
    });
    const claimed = claimTranslation(job.jobId, "t1" as TranslatorId);
    const submitted = submitTranslation(claimed.jobId, {
      candidateText: "y",
      usedGlossary: [],
      a11yPreserved: true,
    });
    const approved = approveTranslation(submitted.jobId, "r1" as ReviewerId);
    const a = approved as { mtFlagged: boolean };
    assertEq(a.mtFlagged, true, "mtFlagged true");
  });
  test("mtFlagged = false when mtSource null", () => {
    const job = createTranslationJob({
      sourceText: "x",
      sourceLocale: "pt-BR" as LocaleCode,
      targetLocale: "en" as LocaleCode,
      sacredTerms: [],
      section: "home",
      authorId: "u1" as UserId,
    });
    const claimed = claimTranslation(job.jobId, "t1" as TranslatorId);
    const submitted = submitTranslation(claimed.jobId, {
      candidateText: "y",
      usedGlossary: [],
      a11yPreserved: true,
    });
    const approved = approveTranslation(submitted.jobId, "r1" as ReviewerId);
    const a = approved as { mtFlagged: boolean };
    assertEq(a.mtFlagged, false, "mtFlagged false");
  });
});

// =============================================================================
// SECTION J — REJECT (4 assertions)
// =============================================================================

describe("reject (4)", () => {
  resetLedgerForTests();
  test("reject transitions in_review → rejected", () => {
    const job = createTranslationJob({
      sourceText: "x",
      sourceLocale: "pt-BR" as LocaleCode,
      targetLocale: "en" as LocaleCode,
      sacredTerms: [],
      section: "home",
      authorId: "u1" as UserId,
    });
    const claimed = claimTranslation(job.jobId, "t1" as TranslatorId);
    const submitted = submitTranslation(claimed.jobId, {
      candidateText: "y",
      usedGlossary: [],
      a11yPreserved: true,
    });
    const rejected = rejectTranslation(submitted.jobId, "r1" as ReviewerId, "low quality");
    assertEq(rejected.state, "rejected", "state is rejected");
  });
  test("rejected job has reason", () => {
    const job = createTranslationJob({
      sourceText: "x",
      sourceLocale: "pt-BR" as LocaleCode,
      targetLocale: "en" as LocaleCode,
      sacredTerms: [],
      section: "home",
      authorId: "u1" as UserId,
    });
    const claimed = claimTranslation(job.jobId, "t1" as TranslatorId);
    const submitted = submitTranslation(claimed.jobId, {
      candidateText: "y",
      usedGlossary: [],
      a11yPreserved: true,
    });
    const rejected = rejectTranslation(submitted.jobId, "r1" as ReviewerId, "low quality");
    const r = rejected as { reason: string };
    assertEq(r.reason, "low quality", "reason set");
  });
  test("reject requires non-empty reason", () => {
    const job = createTranslationJob({
      sourceText: "x",
      sourceLocale: "pt-BR" as LocaleCode,
      targetLocale: "en" as LocaleCode,
      sacredTerms: [],
      section: "home",
      authorId: "u1" as UserId,
    });
    const claimed = claimTranslation(job.jobId, "t1" as TranslatorId);
    const submitted = submitTranslation(claimed.jobId, {
      candidateText: "y",
      usedGlossary: [],
      a11yPreserved: true,
    });
    assertThrows(
      () => rejectTranslation(submitted.jobId, "r1" as ReviewerId, "   "),
      Error as unknown as ErrorClass,
      "empty reason",
    );
  });
  test("type guard isApprovedJob", () => {
    const job = createTranslationJob({
      sourceText: "x",
      sourceLocale: "pt-BR" as LocaleCode,
      targetLocale: "en" as LocaleCode,
      sacredTerms: [],
      section: "home",
      authorId: "u1" as UserId,
    });
    assertTrue(isPendingJob(job), "isPendingJob true on pending");
    const claimed = claimTranslation(job.jobId, "t1" as TranslatorId);
    const submitted = submitTranslation(claimed.jobId, {
      candidateText: "y",
      usedGlossary: [],
      a11yPreserved: true,
    });
    const approved = approveTranslation(submitted.jobId, "r1" as ReviewerId);
    assertTrue(isApprovedJob(approved), "isApprovedJob true on approved");
  });
});

// =============================================================================
// SECTION K — VALIDATE LOCALE BUNDLE (4 assertions)
// =============================================================================

describe("validate (4)", () => {
  test("valid bundle passes", () => {
    const pt = LOCALE_BUNDLES[0]!;
    const result = validateLocaleBundle(pt);
    assertEq(result.ok, true, "pt-BR bundle ok");
  });
  test("invalid completion fails", () => {
    const bad = {
      code: "pt-BR" as LocaleCode,
      label: "X",
      sections: ["a"],
      completion: 150,
    };
    const result = validateLocaleBundle(bad);
    assertEq(result.ok, false, "invalid completion rejected");
  });
  test("invalid locale code fails", () => {
    const bad = {
      code: "xx" as LocaleCode,
      label: "X",
      sections: ["a"],
      completion: 50,
    };
    const result = validateLocaleBundle(bad);
    assertEq(result.ok, false, "invalid locale code rejected");
  });
  test("empty sections fails", () => {
    const bad = {
      code: "pt-BR" as LocaleCode,
      label: "X",
      sections: [],
      completion: 50,
    };
    const result = validateLocaleBundle(bad);
    assertEq(result.ok, false, "empty sections rejected");
  });
});

// =============================================================================
// SECTION L — BLEU-LITE (4 assertions)
// =============================================================================

describe("bleu (4)", () => {
  test("identical texts score 1.0", () => {
    const score = computeBleuLiteScore("hello world foo bar", "hello world foo bar");
    assertTrue(Math.abs(score - 1.0) < 1e-9, `identical score = ${score}`);
  });
  test("completely different texts score near 0", () => {
    const score = computeBleuLiteScore("alpha beta gamma", "xyz qrs tuv");
    assertTrue(score < 0.1, `different score = ${score}`);
  });
  test("partial overlap scores between 0 and 1", () => {
    const score = computeBleuLiteScore("hello world", "hello there");
    assertTrue(score > 0 && score < 1, `partial score = ${score}`);
  });
  test("clampBleuScore defensive bounds", () => {
    assertEq(clampBleuScore(-0.5), 0, "negative clamped");
    assertEq(clampBleuScore(1.5), 1, "above 1 clamped");
    assertEq(clampBleuScore(NaN), 0, "NaN → 0");
    assertEq(clampBleuScore(Infinity), 1, "Infinity → 1");
  });
});

// =============================================================================
// SECTION M — HMAC (4 assertions)
// =============================================================================

describe("HMAC (4)", () => {
  test("chainTranslationHash returns 64-char hex", () => {
    const job = createTranslationJob({
      sourceText: "hmac test",
      sourceLocale: "pt-BR" as LocaleCode,
      targetLocale: "en" as LocaleCode,
      sacredTerms: [],
      section: "home",
      authorId: "u1" as UserId,
    });
    const hash = chainTranslationHash("GENESIS", job, "secret1");
    assertEq(hash.length, 64, "hash is 64 hex chars");
    assertTrue(/^[0-9a-f]{64}$/.test(hash), "hash matches hex pattern");
  });
  test("same input → same output (deterministic)", () => {
    const job = createTranslationJob({
      sourceText: "deterministic",
      sourceLocale: "pt-BR" as LocaleCode,
      targetLocale: "en" as LocaleCode,
      sacredTerms: [],
      section: "home",
      authorId: "u1" as UserId,
    });
    const h1 = chainTranslationHash("PREV", job, "secret");
    const h2 = chainTranslationHash("PREV", job, "secret");
    assertEq(h1, h2, "deterministic");
  });
  test("different secret → different hash", () => {
    const job = createTranslationJob({
      sourceText: "secret-test",
      sourceLocale: "pt-BR" as LocaleCode,
      targetLocale: "en" as LocaleCode,
      sacredTerms: [],
      section: "home",
      authorId: "u1" as UserId,
    });
    const h1 = chainTranslationHash("PREV", job, "secret1");
    const h2 = chainTranslationHash("PREV", job, "secret2");
    assertTrue(h1 !== h2, "different secrets differ");
  });
  test("ledger head advances after each operation", () => {
    resetLedgerForTests();
    const before = __internalLedgerHead();
    createTranslationJob({
      sourceText: "advance",
      sourceLocale: "pt-BR" as LocaleCode,
      targetLocale: "en" as LocaleCode,
      sacredTerms: [],
      section: "home",
      authorId: "u1" as UserId,
    });
    const after = __internalLedgerHead();
    assertTrue(after !== before, "ledger head advanced");
  });
});

// =============================================================================
// SECTION N — SACRED COVERAGE (8 assertions)
// =============================================================================

describe("sacred (8)", () => {
  test("auditTranslationCoverage returns CoverageReport", () => {
    const r = auditTranslationCoverage();
    assertTrue(typeof r.total === "number", "total is number");
    assertTrue(typeof r.isFullCoverage === "boolean", "isFullCoverage is boolean");
  });
  test("total = 130", () => {
    const r = auditTranslationCoverage();
    assertEq(r.total, 130, `total = ${r.total}`);
  });
  test("CIGANO count = 36", () => {
    const r = auditTranslationCoverage();
    assertEq(r.perTradition.CIGANO, 36, "CIGANO count");
  });
  test("ORIXAS count = 16", () => {
    const r = auditTranslationCoverage();
    assertEq(r.perTradition.ORIXAS, 16, "ORIXAS count");
  });
  test("TAROT count = 22", () => {
    const r = auditTranslationCoverage();
    assertEq(r.perTradition.TAROT, 22, "TAROT count");
  });
  test("ASTROLOGIA count = 12", () => {
    const r = auditTranslationCoverage();
    assertEq(r.perTradition.ASTROLOGIA, 12, "ASTROLOGIA count");
  });
  test("SEFIROT count = 10", () => {
    const r = auditTranslationCoverage();
    assertEq(r.perTradition.SEFIROT, 10, "SEFIROT count");
  });
  test("isFullCoverage = true at module init", () => {
    assertEq(isFullCoverage, true, "isFullCoverage");
  });
  test("HEBREW count = 27 (22 + 5 sofit)", () => {
    const r = auditTranslationCoverage();
    assertEq(r.perTradition.HEBREW, 27, `HEBREW count = ${r.perTradition.HEBREW}`);
  });
  test("CHAKRAS count = 7", () => {
    const r = auditTranslationCoverage();
    assertEq(r.perTradition.CHAKRAS, 7, "CHAKRAS count");
  });
});

// =============================================================================
// SECTION O — A11Y (4 assertions)
// =============================================================================

describe("a11y (4)", () => {
  test("<mark> preserved", () => {
    const r = checkA11yPreservation("a <mark>b</mark> c", "x <mark>b</mark> y");
    assertEq(r.ok, true, "mark preserved");
    assertEq(r.preserved.length, 1, "1 preserved");
  });
  test("<mark> missing detected", () => {
    const r = checkA11yPreservation("a <mark>b</mark> c", "x y z");
    assertEq(r.ok, false, "mark missing");
    assertEq(r.missing.length, 1, "1 missing");
  });
  test("aria-* preserved", () => {
    const r = checkA11yPreservation(
      '<button aria-label="open">x</button>',
      '<button aria-label="open">y</button>',
    );
    assertEq(r.ok, true, "aria preserved");
  });
  test("SSML <mark name=.../> preserved", () => {
    const r = checkA11yPreservation(
      'hello <mark name="c1"/>world',
      'world <mark name="c1"/>hello',
    );
    assertEq(r.ok, true, "ssml preserved");
  });
});

// =============================================================================
// SECTION P — LGPD EXPORT/ERASURE (3 assertions)
// =============================================================================

describe("lgpd (3)", () => {
  resetLedgerForTests();
  test("exportTranslationJobs returns user's jobs", () => {
    const userId = "u_lgpd_test" as UserId;
    createTranslationJob({
      sourceText: "export me",
      sourceLocale: "pt-BR" as LocaleCode,
      targetLocale: "en" as LocaleCode,
      sacredTerms: [],
      section: "home",
      authorId: userId,
    });
    const exported = exportTranslationJobs(userId);
    assertTrue(exported.length >= 1, "1+ jobs exported");
  });
  test("eraseUserTranslationJobs pseudonymizes", () => {
    const userId = "u_erase_test" as UserId;
    createTranslationJob({
      sourceText: "erase me",
      sourceLocale: "pt-BR" as LocaleCode,
      targetLocale: "en" as LocaleCode,
      sacredTerms: [],
      section: "home",
      authorId: userId,
    });
    const count = eraseUserTranslationJobs(userId);
    assertTrue(count >= 1, "1+ jobs erased");
  });
  test("emptyLocaleProgress factory returns zeros", () => {
    const p = emptyLocaleProgress();
    assertEq(p.completed, 0, "completed = 0");
    assertEq(p.pending, 0, "pending = 0");
    assertEq(p.inReview, 0, "inReview = 0");
  });
});

// =============================================================================
// SECTION Q — SACRED TERM OVERLAP (2 assertions)
// =============================================================================

describe("sacredOverlap (2)", () => {
  test("all terms present → 1.0", () => {
    const terms = ["cigano.1.pt" as GlossaryTerm, "cigano.2.pt" as GlossaryTerm];
    const score = sacredTermOverlap("", "cavaleiro trevo", terms);
    assertEq(score, 1, "all overlap");
  });
  test("no terms present → 0.0", () => {
    const terms = ["cigano.1.pt" as GlossaryTerm];
    const score = sacredTermOverlap("", "banana", terms);
    assertEq(score, 0, "no overlap");
  });
});

// =============================================================================
// SECTION R — EXPORTS SURFACE (3 assertions)
// =============================================================================

describe("exports (3)", () => {
  test("__ALL_EXPORTS has 32 keys", () => {
    assertEq(Object.keys(__ALL_EXPORTS).length, 32, `exports = ${Object.keys(__ALL_EXPORTS).length}`);
  });
  test("Locales sanity", () => {
    assertEq(LOCALE_BUNDLES.length, 3, "3 bundles");
  });
  test("Tradition IDs are 7", () => {
    assertEq(TRANSLATION_TRADITION_IDS.length, 7, "7 tradition ids");
  });
});

// =============================================================================
// SUMMARY
// =============================================================================

console.log(`\n========================================`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
if (failures.length > 0) {
  console.log(`\nFailures:`);
  for (const f of failures) {
    console.log(`  - ${f}`);
  }
}
console.log(`========================================\n`);

const processExit = ((globalThis as unknown) as { process: { exit(code?: number): never } }).process.exit;
if (failed > 0) {
  processExit(1);
} else {
  processExit(0);
}