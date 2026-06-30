// W70 Synastry Engine — barrel (public API).
// Mirror cycle 60-69 pattern (single entry-point that re-exports every sub-engine).

export * from './types.ts';
export * from './aspects.ts';
export * from './synastry-types.ts';
export * from './houses-overlay.ts';
export * from './composite.ts';
export {
  computeSynastry,
  scoreCompatibility,
  summarizeReport,
  validateProfiles,
  assertCatalogCoverageForProfiles,
  getPlanetInPartnerHouse as planetInPartnerHouse,
  computeAllOverlays,
  calculateCompositeChart,
  calculateAllAspects,
  interpretOverlay,
  computeHouseOverlay,
  getCompositePlanetPositions,
  getCompositeHouses,
  interpretComposite,
  getMajorAspects,
  getMinorAspects,
  isHarmonious,
  isChallenging,
  getAspectStrength,
  calculateAspect,
  auditAspectCatalog,
  auditHouseOverlay,
  auditComposite,
  assertCatalogCoverage,
  asUserId,
  asNatalChartId,
  asCardKey,
  TRADITIONS,
} from './synastry.ts';
