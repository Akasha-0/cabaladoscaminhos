// W91-B: reputation-leaderboard — barrel exports
// Public surface of the engine. Frozen at module load.

export * from "./types";
export * from "./mock";
export * from "./rank";
export * from "./factory";

import { W91B_MOCK_MEMBERS } from "./mock";
import { W91B_LEADERBOARD_VERSION } from "./factory";

export const W91B_MODULE_SURFACE = Object.freeze({
  version: W91B_LEADERBOARD_VERSION,
  mockMembers: W91B_MOCK_MEMBERS.length,
  positiveOnlyWitness: true,
  sacredLanguage: true,
  lgpdMinimal: true,
});

export const W91B_INDEX_VERSION = "2026-06-30" as const;