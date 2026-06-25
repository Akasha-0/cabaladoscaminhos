// ============================================================
// SPIRITUAL CORRELATIONS TYPE - CABALA DOS CAMINHOS
// ============================================================
// Shared shape for the {sefirot, chakra, element, orixa,
// affirmation, frequency} block embedded in chart, energy,
// health, and other spiritual API payloads.
//
// Wave 17.3: arquivo restaurado após regressão Wave 11.5
// (commit 9f2200a1 removeu como dead code, mas apps/akasha-portal/
// src/app/api/health/metrics/route.ts importa ativamente o tipo).
// ============================================================

export type SpiritualCorrelations = {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
};