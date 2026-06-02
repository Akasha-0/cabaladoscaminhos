// ============================================================
// SPIRITUAL CORRELATIONS TYPE - CABALA DOS CAMINHOS
// ============================================================
// Shared shape for the {sefirot, chakra, element, orixa,
// affirmation, frequency} block embedded in chart, energy,
// health, and other spiritual API payloads.
// Extracted from src/app/api/chart/generate/route.ts (lines ~213-228).
// ============================================================

export type SpiritualCorrelations = {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
};
