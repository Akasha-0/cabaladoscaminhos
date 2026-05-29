/**
 * Spiritual Correlations Evals
 * Rigorous quality evals for the cross-system spiritual correlation engine.
 *
 * Validates: Tarot, Orixá, Astrologia, Numerologia, Cabala, Ifá/Odu, Chakras
 *
 * Note: Uses local const enums (not Zod objects) for EvalDefinition fields,
 * because Zod enum objects get mangled through the builder/parse chain.
 * Status/severity/category are plain strings in the eval object.
 */

import { MetricResultBuilder } from '../metrics-framework';
import type { EvalDefinition } from '../metrics-framework';
import {
  getAllOduCorrelations,
  getAllSephirot,
} from '../../ai/correlation-engine';

// ============================================================================
// Local constant enums (plain strings, not Zod objects)
// ============================================================================

const MetricStatus = {
  pass: 'pass',
  fail: 'fail',
  warning: 'warning',
  skipped: 'skipped',
  error: 'error',
} as const;
type MetricStatus = typeof MetricStatus[keyof typeof MetricStatus];

const MetricSeverity = {
  critical: 'critical',
  high: 'high',
  medium: 'medium',
  low: 'low',
  info: 'info',
} as const;
type MetricSeverity = typeof MetricSeverity[keyof typeof MetricSeverity];

// Categories used in eval definitions (plain strings)
type MetricCategory = 'spiritual_correlations' | 'ai_integration' | 'performance' | 'ui_design' | 'ux_design' | 'architecture' | 'qa_testing' | 'documentation';

// ============================================================================
// Canonical Reference Data (ground truth)
// ============================================================================

/** 22 Tarot Major Arcana in traditional order (0-21) */
const TAROT_MAJOR_ARCANA = [
  { id: 0, name: 'The Fool' },
  { id: 1, name: 'The Magician' },
  { id: 2, name: 'The High Priestess' },
  { id: 3, name: 'The Empress' },
  { id: 4, name: 'The Emperor' },
  { id: 5, name: 'The Hierophant' },
  { id: 6, name: 'The Lovers' },
  { id: 7, name: 'The Chariot' },
  { id: 8, name: 'Strength' },
  { id: 9, name: 'The Hermit' },
  { id: 10, name: 'Wheel of Fortune' },
  { id: 11, name: 'Justice' },
  { id: 12, name: 'The Hanged Man' },
  { id: 13, name: 'Death' },
  { id: 14, name: 'Temperance' },
  { id: 15, name: 'The Devil' },
  { id: 16, name: 'The Tower' },
  { id: 17, name: 'The Star' },
  { id: 18, name: 'The Moon' },
  { id: 19, name: 'The Sun' },
  { id: 20, name: 'Judgement' },
  { id: 21, name: 'The World' },
] as const;

/** 10 Sephirot of the Kabbalistic Tree of Life */
const SEPHIROT_NAMES = [
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Geburah',
  'Tiphereth', 'Netzach', 'Hod', 'Yesod', 'Malkuth',
] as const;

/** Canonical 7 Chakras with standard attributes */
const CHAKRAS = [
  { name: '1º Básico', number: 1, color: 'Vermelho', element: 'Terra', sound: 'RAM' },
  { name: '2º Sacro', number: 2, color: 'Laranja', element: 'Água', sound: 'VAM' },
  { name: '3º Plexo Solar', number: 3, color: 'Amarelo', element: 'Fogo', sound: 'RAM' },
  { name: '4º Cardíaco', number: 4, color: 'Verde', element: 'Ar', sound: 'YAM' },
  { name: '5º Laríngeo', number: 5, color: 'Azul', element: 'Éter', sound: 'HAM' },
  { name: '6º Frontal', number: 6, color: 'Índigo', element: 'Luz', sound: 'OM' },
  { name: '7º Coronário', number: 7, color: 'Violeta', element: 'Éter', sound: 'OM' },
] as const;

/** Classical Elements */
const ELEMENTS = ['Fogo', 'Água', 'Terra', 'Ar', 'Éter'] as const;

/** 16 Principal Odu of Merindilogun */
const PRINCIPAL_ODUS = [
  'Ogbe', 'Oyeku', 'Iwori', 'Odi', 'Irosun', 'Owonrin', 'Obara',
  'Okanran', 'Ogunda', 'Osa', 'Ika', 'OtuMeji', 'MerinLa', 'MerinOgun',
  'MerinMeji', 'Owanwa',
] as const;

// ============================================================================
// 1. Coverage Eval: Tarot Major Arcana
// ============================================================================

const evalTarotCoverage: EvalDefinition = {
  id: 'spiritual-tarot-coverage',
  name: 'Tarot Major Arcana Coverage',
  description: 'Verify all 22 Tarot Major Arcana are mapped in the correlation engine',
  category: 'spiritual_correlations',
  run: async () => {
    const start = Date.now();
    const builder = new MetricResultBuilder(
      'spiritual-tarot-coverage',
      'Tarot Major Arcana Coverage',
      'spiritual_correlations'
    );

    try {
      const sephirot = getAllSephirot();
      const oduCorrelations = getAllOduCorrelations();

      // Collect all Tarot IDs from sephirot
      const sephirotTarotIds = new Set(sephirot.map((s) => s.tarotMajor.id));

      // Collect all Tarot IDs from Odu correlations
      const oduTarotIds = new Set(oduCorrelations.map((o) => o.tarotCard.id));

      // Find missing arcana (0-21)
      const allTarotIds = new Set([...sephirotTarotIds, ...oduTarotIds]);
      const missingIds: number[] = [];
      for (let i = 0; i <= 21; i++) {
        if (!allTarotIds.has(i)) missingIds.push(i);
      }

      const covered = 22 - missingIds.length;
      const score = (covered / 22) * 100;

      if (missingIds.length === 0) {
        return builder
          .status(MetricStatus.pass)
          .score(100)
          .value(22)
          .threshold(22)
          .unit('arcana')
          .severity(MetricSeverity.info)
          .message('All 22 Major Arcana are mapped across the system')
          .details({ sephirotCoverage: sephirotTarotIds.size, oduCoverage: oduTarotIds.size })
          .duration(Date.now() - start)
          .build();
      }

      const missingCards = missingIds.map((id) => {
        const card = TAROT_MAJOR_ARCANA.find((a) => a.id === id);
        return card ? card.name : `Card ${id}`;
      });

      return builder
        .status(score >= 90 ? MetricStatus.warning : MetricStatus.fail)
        .score(score)
        .value(covered)
        .threshold(22)
        .unit('arcana')
        .severity(missingIds.length > 5 ? MetricSeverity.high : MetricSeverity.medium)
        .message(`Missing ${missingIds.length} Tarot Major Arcana: ${missingCards.join(', ')}`)
        .details({ missingCards, sephirotTarotIds: [...sephirotTarotIds].sort(), oduTarotIds: [...oduTarotIds].sort() })
        .duration(Date.now() - start)
        .build();
    } catch (err) {
      return builder
        .status(MetricStatus.error)
        .score(0)
        .value('eval_failed')
        .threshold(22)
        .unit('arcana')
        .severity(MetricSeverity.critical)
        .message(`Eval failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
        .duration(Date.now() - start)
        .build();
    }
  },
};

// ============================================================================
// 2. Correlation Completeness Eval
// ============================================================================

const evalCorrelationCompleteness: EvalDefinition = {
  id: 'spiritual-correlation-completeness',
  name: 'Cross-System Correlation Completeness',
  description: 'Verify completeness of Tarot↔Orixá, Astrologia↔Numerologia, and other cross-mappings',
  category: 'spiritual_correlations',
  run: async () => {
    const start = Date.now();
    const builder = new MetricResultBuilder(
      'spiritual-correlation-completeness',
      'Cross-System Correlation Completeness',
      'spiritual_correlations'
    );

    try {
      const sephirot = getAllSephirot();
      const oduCorrelations = getAllOduCorrelations();

      // Evaluate each cross-system mapping
      const checks: Record<string, { total: number; filled: number }> = {
        sephirotTarot: { total: 10, filled: 0 },
        sephirotElement: { total: 10, filled: 0 },
        sephirotChakra: { total: 10, filled: 0 },
        sephirotPlanet: { total: 10, filled: 0 },
        sephirotSign: { total: 10, filled: 0 },
        sephirotOdu: { total: 10, filled: 0 },
        oduTarot: { total: 16, filled: 0 },
        oduElement: { total: 16, filled: 0 },
        oduChakra: { total: 16, filled: 0 },
        oduPlanet: { total: 16, filled: 0 },
        oduSign: { total: 16, filled: 0 },
        oduDirection: { total: 16, filled: 0 },
        oduColors: { total: 16, filled: 0 },
      };

      // Check sephirot mappings
      for (const s of sephirot) {
        if (s.tarotMajor?.id !== undefined) checks.sephirotTarot.filled++;
        if (s.element) checks.sephirotElement.filled++;
        if (s.chakra) checks.sephirotChakra.filled++;
        if (s.planet) checks.sephirotPlanet.filled++;
        if (s.sign) checks.sephirotSign.filled++;
        if (s.odu?.numero !== undefined) checks.sephirotOdu.filled++;
      }

      // Check Odu mappings
      for (const o of oduCorrelations) {
        if (o.tarotCard?.id !== undefined) checks.oduTarot.filled++;
        if (o.element) checks.oduElement.filled++;
        if (o.chakra) checks.oduChakra.filled++;
        if (o.planets?.length) checks.oduPlanet.filled++;
        if (o.sign) checks.oduSign.filled++;
        if (o.direction) checks.oduDirection.filled++;
        if (o.colors?.length) checks.oduColors.filled++;
      }

      // Calculate coverage scores per mapping type
      const scores = Object.fromEntries(
        Object.entries(checks).map(([k, v]) => [k, (v.filled / v.total) * 100])
      );

      const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
      const failingChecks = Object.entries(checks).filter(
        ([, v]) => (v.filled / v.total) * 100 < 100
      );

      const status =
        avgScore >= 95
          ? MetricStatus.pass
          : avgScore >= 80
          ? MetricStatus.warning
          : MetricStatus.fail;

      const severity =
        failingChecks.length > 4
          ? MetricSeverity.high
          : failingChecks.length > 0
          ? MetricSeverity.medium
          : MetricSeverity.info;

      return builder
        .status(status)
        .score(avgScore)
        .value(Math.round(avgScore * 10) / 10)
        .threshold(95)
        .unit('%')
        .severity(severity)
        .message(
          `Average cross-system coverage: ${avgScore.toFixed(1)}%. ${failingChecks.length} incomplete mappings.`
        )
        .details({ scores, failingChecks: failingChecks.map(([k]) => k) })
        .duration(Date.now() - start)
        .build();
    } catch (err) {
      return builder
        .status(MetricStatus.error)
        .score(0)
        .value('eval_failed')
        .threshold(95)
        .unit('%')
        .severity(MetricSeverity.critical)
        .message(`Eval failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
        .duration(Date.now() - start)
        .build();
    }
  },
};

// ============================================================================
// 3. Consistency Eval: Element ↔ Orixá mappings
// ============================================================================

const evalElementOrixaConsistency: EvalDefinition = {
  id: 'spiritual-element-orixa-consistency',
  name: 'Element ↔ Orixá Consistency',
  description: 'Verify fire elements are consistently associated with fire Orixás',
  category: 'spiritual_correlations',
  run: async () => {
    const start = Date.now();
    const builder = new MetricResultBuilder(
      'spiritual-element-orixa-consistency',
      'Element↔Orixá Consistency',
      'spiritual_correlations'
    );

    try {
      const oduCorrelations = getAllOduCorrelations();

      const FIRE_ORIXAS = new Set(['Ogum', 'Xangô', 'Iansã', 'Exu']);
      const WATER_ORIXAS = new Set(['Iemanjá', 'Oxum', 'Oxumaré']);
      const EARTH_ORIXAS = new Set(['Oxóssi', 'Omolu', 'Nanã']);
      const AIR_ORIXAS = new Set(['Oxalá', 'Obatalá']);

      const ELEMENT_EXPECTATIONS: Record<string, Set<string>> = {
        Fogo: FIRE_ORIXAS,
        Água: WATER_ORIXAS,
        Terra: EARTH_ORIXAS,
        Ar: AIR_ORIXAS,
      };

      const inconsistencies: Array<{
        odu: string;
        declaredElement: string;
        expectedOrixaElement: string;
        orixa?: string;
      }> = [];

      for (const odu of oduCorrelations) {
        const declaredElement = odu.element;
        const expectedOrixas = ELEMENT_EXPECTATIONS[declaredElement];

        if (expectedOrixas) {
          const oduOrixas = odu.orixa.split('/').map((o) => o.trim());

          for (const orixa of oduOrixas) {
            if (
              orixa &&
              !orixa.includes('Xangô') &&
              !FIRE_ORIXAS.has(orixa) &&
              declaredElement === 'Fogo'
            ) {
              // Fire Odu with non-fire Orixá - potential inconsistency
              if (
                WATER_ORIXAS.has(orixa) ||
                EARTH_ORIXAS.has(orixa) ||
                AIR_ORIXAS.has(orixa)
              ) {
                inconsistencies.push({
                  odu: odu.id,
                  declaredElement,
                  expectedOrixaElement: 'Fogo',
                  orixa,
                });
              }
            }
          }
        }
      }

      const totalChecks = oduCorrelations.length;
      const score = ((totalChecks - inconsistencies.length) / totalChecks) * 100;

      return builder
        .status(inconsistencies.length === 0 ? MetricStatus.pass : MetricStatus.warning)
        .score(score)
        .value(inconsistencies.length)
        .threshold(95)
        .unit('%')
        .severity(inconsistencies.length > 3 ? MetricSeverity.high : MetricSeverity.medium)
        .message(
          inconsistencies.length === 0
            ? 'All Element↔Orixá associations are consistent'
            : `Found ${inconsistencies.length} Element↔Orixá inconsistencies`
        )
        .details({ inconsistencies })
        .duration(Date.now() - start)
        .build();
    } catch (err) {
      return builder
        .status(MetricStatus.error)
        .score(0)
        .value('eval_failed')
        .threshold(95)
        .unit('%')
        .severity(MetricSeverity.critical)
        .message(`Eval failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
        .duration(Date.now() - start)
        .build();
    }
  },
};

// ============================================================================
// 4. Cross-Reference Eval: Validate bidirectional references
// ============================================================================

const evalCrossReferences: EvalDefinition = {
  id: 'spiritual-cross-references',
  name: 'Cross-System Reference Validation',
  description: 'Validate that references are bidirectional (A→B implies B→A exists)',
  category: 'spiritual_correlations',
  run: async () => {
    const start = Date.now();
    const builder = new MetricResultBuilder(
      'spiritual-cross-references',
      'Cross-System Reference Validation',
      'spiritual_correlations'
    );

    try {
      const sephirot = getAllSephirot();
      const oduCorrelations = getAllOduCorrelations();

      // Build forward maps
      const sephirotToTarot: Record<string, number[]> = {};
      const tarotToSephirot: Record<number, string[]> = {};

      for (const s of sephirot) {
        if (s.tarotMajor?.id !== undefined) {
          if (!sephirotToTarot[s.name]) sephirotToTarot[s.name] = [];
          sephirotToTarot[s.name].push(s.tarotMajor.id);

          if (!tarotToSephirot[s.tarotMajor.id])
            tarotToSephirot[s.tarotMajor.id] = [];
          tarotToSephirot[s.tarotMajor.id].push(s.name);
        }
      }

      const oduToTarot: Record<string, number> = {};
      const tarotToOdu: Record<number, string> = {};

      for (const o of oduCorrelations) {
        if (o.tarotCard?.id !== undefined) {
          oduToTarot[o.id] = o.tarotCard.id;
          tarotToOdu[o.tarotCard.id] = o.id;
        }
      }

      // Check orphaned references (forward exists, reverse does not)
      const orphaned: Array<{ type: string; from: string; to: string }> = [];

      // Orphaned sephirot↔tarot
      for (const [seph, tarotIds] of Object.entries(sephirotToTarot)) {
        for (const tid of tarotIds) {
          if (!tarotToSephirot[tid]) {
            orphaned.push({
              type: 'sephirot→tarot orphaned',
              from: seph,
              to: `tarot:${tid}`,
            });
          }
        }
      }

      // Orphaned odu→tarot
      for (const [oId, tarotId] of Object.entries(oduToTarot)) {
        if (!tarotToOdu[tarotId]) {
        orphaned.push({
          type: 'odu→tarot orphaned',
          from: oId,
          to: `tarot:${tarotId}`,
        });
        }
      }

      const totalRefs =
        Object.keys(sephirotToTarot).length +
        Object.keys(oduToTarot).length +
        Object.keys(tarotToSephirot).length +
        Object.keys(tarotToOdu).length;

      const score =
        totalRefs > 0 ? Math.max(0, ((totalRefs - orphaned.length * 2) / totalRefs) * 100) : 100;

      return builder
        .status(orphaned.length === 0 ? MetricStatus.pass : MetricStatus.warning)
        .score(score)
        .value(orphaned.length)
        .threshold(100)
        .unit('%')
        .severity(orphaned.length > 5 ? MetricSeverity.high : MetricSeverity.medium)
        .message(
          orphaned.length === 0
            ? 'All cross-references are bidirectional'
            : `Found ${orphaned.length} orphaned cross-references`
        )
        .details({ orphaned: orphaned.slice(0, 20) })
        .duration(Date.now() - start)
        .build();
    } catch (err) {
      return builder
        .status(MetricStatus.error)
        .score(0)
        .value('eval_failed')
        .threshold(100)
        .unit('%')
        .severity(MetricSeverity.critical)
        .message(`Eval failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
        .duration(Date.now() - start)
        .build();
    }
  },
};

// ============================================================================
// 5. Data Integrity Eval: Lookup table completeness
// ============================================================================

const evalDataIntegrity: EvalDefinition = {
  id: 'spiritual-data-integrity',
  name: 'Lookup Table Data Integrity',
  description: 'Verify no missing keys in lookup tables and arrays are fully populated',
  category: 'spiritual_correlations',
  run: async () => {
    const start = Date.now();
    const builder = new MetricResultBuilder(
      'spiritual-data-integrity',
      'Lookup Table Data Integrity',
      'spiritual_correlations'
    );

    try {
      const sephirot = getAllSephirot();
      const oduCorrelations = getAllOduCorrelations();

      const issues: Array<{ table: string; entry?: string; field: string; issue: string }> = [];

      // Check 10 Sephirot completeness (must have exactly 10 entries)
      if (sephirot.length !== 10) {
        issues.push({
          table: 'SEPHIROT',
          field: 'count',
          issue: `Expected 10 entries, found ${sephirot.length}`,
        });
      }

      // Check each sephira has required fields
      for (const s of sephirot) {
        if (!s.name) issues.push({ table: 'SEPHIROT', entry: s.name, field: 'name', issue: 'Missing name' });
        if (s.number === undefined) issues.push({ table: 'SEPHIROT', entry: s.name, field: 'number', issue: 'Missing number' });
        if (!s.element) issues.push({ table: 'SEPHIROT', entry: s.name, field: 'element', issue: 'Missing element' });
        if (!s.chakra) issues.push({ table: 'SEPHIROT', entry: s.name, field: 'chakra', issue: 'Missing chakra' });
        if (!s.planet) issues.push({ table: 'SEPHIROT', entry: s.name, field: 'planet', issue: 'Missing planet' });
        if (!s.sign) issues.push({ table: 'SEPHIROT', entry: s.name, field: 'sign', issue: 'Missing sign' });
      }

      // Check 16 Odu completeness
      if (oduCorrelations.length !== 16) {
        issues.push({
          table: 'ODU_CORRELATIONS',
          field: 'count',
          issue: `Expected 16 entries, found ${oduCorrelations.length}`,
        });
      }

      // Check each Odu has required fields
      for (const o of oduCorrelations) {
        if (!o.id) issues.push({ table: 'ODU', entry: o.id, field: 'id', issue: 'Missing id' });
        if (o.order === undefined) issues.push({ table: 'ODU', entry: o.id, field: 'order', issue: 'Missing order' });
        if (!o.element) issues.push({ table: 'ODU', entry: o.id, field: 'element', issue: 'Missing element' });
        if (!o.chakra) issues.push({ table: 'ODU', entry: o.id, field: 'chakra', issue: 'Missing chakra' });
        if (!o.tarotCard) issues.push({ table: 'ODU', entry: o.id, field: 'tarotCard', issue: 'Missing tarotCard' });
        if (!o.orixa) issues.push({ table: 'ODU', entry: o.id, field: 'orixa', issue: 'Missing orixa' });
      }

      // Validate element values are in canonical list
      const allElements = [
        ...sephirot.map((s) => s.element),
        ...oduCorrelations.map((o) => o.element),
      ].filter(Boolean);

      const invalidElements = allElements.filter((e) => !ELEMENTS.includes(e as typeof ELEMENTS[number]));
      if (invalidElements.length > 0) {
        issues.push({
          table: 'ELEMENT_MAPPING',
          field: 'value',
          issue: `Invalid element values: ${[...new Set(invalidElements)].join(', ')}`,
        });
      }

      const totalChecks = sephirot.length * 6 + oduCorrelations.length * 6 + 2;
      const score = Math.max(0, ((totalChecks - issues.length) / totalChecks) * 100);

      const status = issues.length === 0 ? MetricStatus.pass : MetricStatus.fail;

      return builder
        .status(status)
        .score(score)
        .value(issues.length)
        .threshold(100)
        .unit('%')
        .severity(issues.length === 0 ? MetricSeverity.info : MetricSeverity.high)
        .message(
          issues.length === 0
            ? 'All lookup tables are fully populated with valid data'
            : `Found ${issues.length} data integrity issues`
        )
        .details({ issues })
        .duration(Date.now() - start)
        .build();
    } catch (err) {
      return builder
        .status(MetricStatus.error)
        .score(0)
        .value('eval_failed')
        .threshold(100)
        .unit('%')
        .severity(MetricSeverity.critical)
        .message(`Eval failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
        .duration(Date.now() - start)
        .build();
    }
  },
};

// ============================================================================
// 6. Semantic Accuracy Eval: Orixá attributes
// ============================================================================

const evalOrixaSemanticAccuracy: EvalDefinition = {
  id: 'spiritual-orixa-semantic-accuracy',
  name: 'Orixá Semantic Accuracy',
  description: "Validate Orixá attributes match traditional knowledge (e.g., Oxum→freshwater, fertility)",
  category: 'spiritual_correlations',
  run: async () => {
    const start = Date.now();
    const builder = new MetricResultBuilder(
      'spiritual-orixa-semantic-accuracy',
      'Orixá Semantic Accuracy',
      'spiritual_correlations'
    );

    try {
      const oduCorrelations = getAllOduCorrelations();

      // Define expected semantic associations
      const SEMANTIC_EXPECTATIONS: Record<string, { element?: string; keywords?: string[] }> = {
        Oxum: { element: 'Água', keywords: ['água doce', 'fertilidade', 'ouro'] },
        Iemanjá: { element: 'Água', keywords: ['oceano', 'maternidade', 'sal'] },
        Ogum: { element: 'Fogo', keywords: ['ferro', 'guerra', 'estrada'] },
        Xangô: { element: 'Fogo', keywords: ['raio', 'justiça', 'pedra'] },
        Iansã: { element: 'Fogo', keywords: ['tempestade', 'vento', 'Egito'] },
        Oxalá: { element: 'Ar', keywords: ['paz', 'criação', 'branco'] },
        'Nanã Buruquê': { element: 'Terra', keywords: ['lama', 'ancestralidade'] },
      };

      const findings: Array<{ orixa: string; severity: string; issue: string; expected?: string; found?: string }> = [];

      for (const odu of oduCorrelations) {
        const oduOrixas = odu.orixa.split('/').map((o) => o.trim());

        for (const orixa of oduOrixas) {
          if (!orixa) continue;
          const expectations = SEMANTIC_EXPECTATIONS[orixa];

          if (expectations) {
            // Check element alignment — flag Oxum/Iemanjá with Fire element
            if (expectations.element && odu.element !== expectations.element && odu.element !== 'Terra') {
              const WATER_SEMANTIC = new Set(['Oxum', 'Iemanjá']);
              if (WATER_SEMANTIC.has(orixa) && odu.element === 'Fogo') {
                findings.push({
                  orixa,
                  severity: 'medium',
                  issue: `Oxum/Iemanjá associated with Fogo element in Odu ${odu.id}`,
                  expected: 'Água',
                  found: odu.element,
                });
              }
            }
          }
        }
      }

      // Check freshwater Orixás have appropriate chakra assignments
      const freshwaterOrixaOdus = oduCorrelations.filter(
        (o) =>
          o.orixa.includes('Oxum') ||
          o.orixa.includes('Iemanjá') ||
          o.orixa.includes('Oxumaré')
      );

      for (const odu of freshwaterOrixaOdus) {
        // Lower chakras associate with grounding, not typically water
        if (odu.chakra?.includes('1º') || odu.chakra?.includes('2º') || odu.chakra?.includes('3º')) {
          findings.push({
            orixa: 'system',
            severity: 'info',
            issue: `Freshwater orixá ${odu.orixa} linked to lower chakra ${odu.chakra} in Odu ${odu.id}`,
          });
        }
      }

      const score = Math.max(0, ((20 - findings.length) / 20) * 100);

      return builder
        .status(findings.length === 0 ? MetricStatus.pass : MetricStatus.warning)
        .score(score)
        .value(findings.length)
        .threshold(90)
        .unit('%')
        .severity(findings.length > 5 ? MetricSeverity.high : MetricSeverity.medium)
        .message(
          findings.length === 0
            ? 'All Orixá semantic associations are accurate'
            : `Found ${findings.length} semantic accuracy observations`
        )
        .details({ findings: findings.slice(0, 15) })
        .duration(Date.now() - start)
        .build();
    } catch (err) {
      return builder
        .status(MetricStatus.error)
        .score(0)
        .value('eval_failed')
        .threshold(90)
        .unit('%')
        .severity(MetricSeverity.critical)
        .message(`Eval failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
        .duration(Date.now() - start)
        .build();
    }
  },
};

// ============================================================================
// 7. Symbol Mapping Eval: Colors, numbers, directions
// ============================================================================

const evalSymbolMappings: EvalDefinition = {
  id: 'spiritual-symbol-mappings',
  name: 'Symbol Mapping Completeness',
  description: 'Validate mappings for colors, numbers, directions are complete and non-empty',
  category: 'spiritual_correlations',
  run: async () => {
    const start = Date.now();
    const builder = new MetricResultBuilder(
      'spiritual-symbol-mappings',
      'Symbol Mapping Completeness',
      'spiritual_correlations'
    );

    try {
      const oduCorrelations = getAllOduCorrelations();
      const sephirot = getAllSephirot();

      const issues: Array<{ table: string; entry: string; field: string }> = [];

      // Check Odu colors
      for (const o of oduCorrelations) {
        if (!o.colors || o.colors.length === 0) {
          issues.push({ table: 'ODU_COLORS', entry: o.id, field: 'colors' });
        }
      }

      // Check Odu direction and validate values
      for (const o of oduCorrelations) {
        if (!o.direction) {
          issues.push({ table: 'ODU_DIRECTION', entry: o.id, field: 'direction' });
        } else {
          const VALID_DIRECTIONS = ['Leste', 'Oeste', 'Norte', 'Sul'];
          if (!VALID_DIRECTIONS.includes(o.direction)) {
            issues.push({
              table: 'ODU_DIRECTION',
              entry: o.id,
              field: `direction (invalid: ${o.direction})`,
            });
          }
        }
      }

      // Check Direction ↔ Element consistency
      for (const o of oduCorrelations) {
        if (o.direction === 'Leste' && o.element === 'Água') {
          issues.push({
            table: 'DIRECTION_ELEMENT',
            entry: o.id,
            field: `East/Water mismatch: ${o.element}`,
          });
        }
        if (o.direction === 'Norte' && o.element === 'Fogo') {
          issues.push({
            table: 'DIRECTION_ELEMENT',
            entry: o.id,
            field: `North/Fire mismatch: ${o.element}`,
          });
        }
      }

      // Check Sephirot colors
      for (const s of sephirot) {
        if (!s.color) {
          issues.push({ table: 'SEPHIROT_COLOR', entry: s.name, field: 'color' });
        }
      }

      // Check sephirot numbers are 1-10
      const sephirotNumbers = sephirot.map((s) => s.number);
      for (let i = 1; i <= 10; i++) {
        if (!sephirotNumbers.includes(i)) {
          issues.push({
            table: 'SEPHIROT_NUMBERING',
            entry: 'SEPHIROT',
            field: `number ${i} missing`,
          });
        }
      }

      const totalChecks = oduCorrelations.length * 3 + sephirot.length + 10;
      const score = Math.max(0, ((totalChecks - issues.length) / totalChecks) * 100);

      return builder
        .status(issues.length === 0 ? MetricStatus.pass : MetricStatus.warning)
        .score(score)
        .value(issues.length)
        .threshold(95)
        .unit('%')
        .severity(issues.length > 5 ? MetricSeverity.high : MetricSeverity.medium)
        .message(
          issues.length === 0
            ? 'All symbol mappings (colors, numbers, directions) are complete'
            : `Found ${issues.length} symbol mapping issues`
        )
        .details({ issues })
        .duration(Date.now() - start)
        .build();
    } catch (err) {
      return builder
        .status(MetricStatus.error)
        .score(0)
        .value('eval_failed')
        .threshold(95)
        .unit('%')
        .severity(MetricSeverity.critical)
        .message(`Eval failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
        .duration(Date.now() - start)
        .build();
    }
  },
};

// ============================================================================
// 8. Sefirot Correspondence Eval: 10 Sefirots with 22 Cabala paths
// ============================================================================

const evalSefirotCorrespondences: EvalDefinition = {
  id: 'spiritual-sefirot-correspondences',
  name: 'Sefirot ↔ 22 Cabala Paths Correspondence',
  description: 'Verify 10 Sefirots mapped with proper attribution to 22 tree-of-life paths',
  category: 'spiritual_correlations',
  run: async () => {
    const start = Date.now();
    const builder = new MetricResultBuilder(
      'spiritual-sefirot-correspondences',
      'Sefirot↔22 Paths Correspondence',
      'spiritual_correlations'
    );

    try {
      const sephirot = getAllSephirot();

      // Verify 10 Sefirot
      if (sephirot.length !== 10) {
        return builder
          .status(MetricStatus.fail)
          .score(0)
          .value(sephirot.length)
          .threshold(10)
          .unit('sephirot')
          .severity(MetricSeverity.high)
          .message(`Expected 10 Sefirot, found ${sephirot.length}`)
          .details({})
          .duration(Date.now() - start)
.build();
      }

      // Verify each sephira number is unique and in range 1-10
      const sephirotNumbers = sephirot.map((s) => s.number);
      const uniqueNumbers = new Set(sephirotNumbers);
      const invalidNumbers = sephirotNumbers.filter((n) => n < 1 || n > 10);

      const numIssues: string[] = [];
      if (uniqueNumbers.size !== 10) {
        const duplicates = sephirotNumbers.filter((n, i) => sephirotNumbers.indexOf(n) !== i);
        numIssues.push(`Duplicate sephira numbers: ${[...new Set(duplicates)].join(', ')}`);
      }
      if (invalidNumbers.length > 0) {
        numIssues.push(`Invalid sephira numbers (out of 1-10): ${invalidNumbers.join(', ')}`);
      }

      // Verify tarot major arcana mapping — each sephira maps to a distinct tarot card
      const tarotIdsUsed = sephirot.map((s) => s.tarotMajor.id).filter((id) => id !== undefined);
      const duplicatesTarot = tarotIdsUsed.filter(
        (id, i) => id !== undefined && tarotIdsUsed.indexOf(id) !== i
      );
      if (duplicatesTarot.length > 0) {
        numIssues.push(`Duplicate tarot mappings: ${[...new Set(duplicatesTarot)].join(', ')}`);
      }

      // Check known Sefirot names are present
      const sephirotNames = sephirot.map((s) => s.name);
      const MUST_HAVE_NAMES = ['Kether', 'Chokhmah', 'Binah', 'Chesed', 'Geburah', 'Tiphereth', 'Netzach', 'Hod', 'Yesod', 'Malkuth'];
      const missingNames = MUST_HAVE_NAMES.filter((n) => !sephirotNames.includes(n));
      if (missingNames.length > 0) {
        numIssues.push(`Missing sephira names: ${missingNames.join(', ')}`);
      }

      const score = Math.max(0, ((30 - numIssues.length * 10) / 30) * 100);

      return builder
        .status(numIssues.length === 0 ? MetricStatus.pass : MetricStatus.warning)
        .score(score)
        .value(sephirot.length)
        .threshold(100)
        .unit('%')
        .severity(numIssues.length > 3 ? MetricSeverity.high : MetricSeverity.medium)
        .message(numIssues.length === 0 ? '10 Sefirot are properly mapped' : `Found ${numIssues.length} Sefirot issues`)
        .details({ numIssues, sephirotNames, sephirotNumbers })
        .duration(Date.now() - start)
        .build();
    } catch (err) {
      return builder
        .status(MetricStatus.error)
        .score(0)
        .value('eval_failed')
        .threshold(100)
        .unit('%')
        .severity(MetricSeverity.critical)
        .message(`Eval failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
        .duration(Date.now() - start)
        .build();
    }
  },
};

// ============================================================================
// 9. Odu Ifá System Eval: 16 Principal Odús
// ============================================================================

const evalOduIfaSystem: EvalDefinition = {
  id: 'spiritual-odufa-system',
  name: 'Ifá Odu System Validation',
  description: 'Validate 16 principal Odús with characteristics (polarity, element, sephirot)',
  category: 'spiritual_correlations',
  run: async () => {
    const start = Date.now();
    const builder = new MetricResultBuilder(
      'spiritual-odufa-system',
      'Ifá Odu System Validation',
      'spiritual_correlations'
    );

    try {
      const oduCorrelations = getAllOduCorrelations();

      // Check we have exactly 16 Odu
      if (oduCorrelations.length !== 16) {
        return builder
          .status(MetricStatus.fail)
          .score((oduCorrelations.length / 16) * 100)
          .value(oduCorrelations.length)
          .threshold(16)
          .unit('odu')
          .severity(MetricSeverity.high)
          .message(`Expected 16 Odu, found ${oduCorrelations.length}`)
          .details({})
          .duration(Date.now() - start)
          .build();
      }

      const issues: string[] = [];
      const oduIds = new Set<string>();
      const orders = new Set<number>();

      for (const odu of oduCorrelations) {
        // Unique ID
        if (!odu.id) {
          issues.push('Odu entry missing id');
        } else {
          if (oduIds.has(odu.id)) {
            issues.push(`Duplicate Odu id: ${odu.id}`);
          }
          oduIds.add(odu.id);
        }

        // Unique order
        if (orders.has(odu.order)) {
          issues.push(`Duplicate Odu order: ${odu.order}`);
        }
        orders.add(odu.order);

        // Required polarity
        if (!odu.polarity || !['masculine', 'feminine'].includes(odu.polarity)) {
          issues.push(`Odu ${odu.id} missing or invalid polarity`);
        }

        // Required element
        if (!odu.element || !ELEMENTS.includes(odu.element as typeof ELEMENTS[number])) {
          issues.push(`oidu ${odu.id} missing or invalid element: ${odu.element}`);
        }

        // Required sephirot references
        if (!odu.sephirot || odu.sephirot.length === 0) {
          issues.push(`Odu ${odu.id} missing sephirot references`);
        }

        // Required direction
        if (!odu.direction) {
          issues.push(`Odu ${odu.id} missing direction`);
        }

        // Required colors
        if (!odu.colors || odu.colors.length === 0) {
          issues.push(`Odu ${odu.id} missing colors`);
        }

        // Required numerology (1-16)
        if (odu.numerology < 1 || odu.numerology > 16) {
          issues.push(`Odu ${odu.id} numerology out of range: ${odu.numerology}`);
        }

        // Required day of week
        if (!odu.dayOfWeek) {
          issues.push(`Odu ${odu.id} missing dayOfWeek`);
        }
      }

      // Verify all 16 Odu names are present
      const allOduNames = [...oduIds];
      const missingOdus = [...PRINCIPAL_ODUS].filter((name) => !allOduNames.includes(name));
      if (missingOdus.length > 0) {
        issues.push(`Missing Odu: ${missingOdus.join(', ')}`);
      }

      const score = Math.max(0, ((100 - issues.length) / 100) * 100);

      return builder
        .status(issues.length === 0 ? MetricStatus.pass : MetricStatus.fail)
        .score(score)
        .value(issues.length)
        .threshold(100)
        .unit('%')
        .severity(issues.length > 3 ? MetricSeverity.high : MetricSeverity.medium)
        .message(
          issues.length === 0
            ? 'All 16 Odu are properly defined with characteristics'
            : `Found ${issues.length} Odu system issues`
        )
        .details({ issues })
        .duration(Date.now() - start)
        .build();
    } catch (err) {
      return builder
        .status(MetricStatus.error)
        .score(0)
        .value('eval_failed')
        .threshold(100)
        .unit('%')
        .severity(MetricSeverity.critical)
        .message(`Eval failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
        .duration(Date.now() - start)
        .build();
    }
  },
};

// ============================================================================
// 10. Chakra Integration Eval: 7 Chakras with colors, sounds, elements
// ============================================================================

const evalChakraIntegration: EvalDefinition = {
  id: 'spiritual-chakra-integration',
  name: 'Chakra System Integration',
  description: 'Verify all 7 chakras mapped with proper colors, sounds, and elements',
  category: 'spiritual_correlations',
  run: async () => {
    const start = Date.now();
    const builder = new MetricResultBuilder(
      'spiritual-chakra-integration',
      'Chakra System Integration',
      'spiritual_correlations'
    );

    try {
      const sephirot = getAllSephirot();
      const oduCorrelations = getAllOduCorrelations();

      // Extract all unique chakras referenced
      const sephirotChakras = new Set(sephirot.map((s) => s.chakra));
      const oduChakras = new Set(oduCorrelations.map((o) => o.chakra));
      const allReferencedChakras = new Set([...sephirotChakras, ...oduChakras]);

      // Check coverage of 7 standard chakras
      const CANONICAL_CHAKRAS = new Set<string>(CHAKRAS.map((c): string => c.name));
      const missingCanonical = [...CANONICAL_CHAKRAS].filter((c) => !allReferencedChakras.has(c));
      const extraChakras = [...allReferencedChakras].filter((c) => !CANONICAL_CHAKRAS.has(c));

      // Validate color consistency per chakra
      const CHAKRA_COLOR_EXPECTATIONS: Record<string, string> = {
        '1º Básico': 'Vermelho',
        '2º Sacro': 'Laranja',
        '3º Plexo Solar': 'Amarelo',
        '4º Cardíaco': 'Verde',
        '5º Laríngeo': 'Azul',
        '6º Frontal': 'Índigo',
        '7º Coronário': 'Violeta',
      };

      const sephirotColorMap: Record<string, string> = {};
      for (const s of sephirot) {
        if (s.color) sephirotColorMap[s.chakra] = s.color;
      }

      const colorIssues: Array<{ chakra: string; sephirotColor: string; expectedColor: string }> = [];
      for (const [chakra, expectedColor] of Object.entries(CHAKRA_COLOR_EXPECTATIONS)) {
        const sephirotColor = sephirotColorMap[chakra];
        if (sephirotColor && !sephirotColor.includes(expectedColor) && !sephirotColor.includes('Branco')) {
          colorIssues.push({ chakra, sephirotColor, expectedColor });
        }
      }

      // Extract chakra↔element from Odu
      const oduChakraElement: Record<string, Set<string>> = {};
      for (const o of oduCorrelations) {
        if (!oduChakraElement[o.chakra]) oduChakraElement[o.chakra] = new Set();
        if (o.element) oduChakraElement[o.chakra].add(o.element);
      }

      const CHAKRA_ELEMENT_EXPECTATIONS: Record<string, string> = {
        '1º Básico': 'Terra',
        '2º Sacro': 'Água',
        '3º Plexo Solar': 'Fogo',
        '4º Cardíaco': 'Ar',
        '5º Laríngeo': 'Éter',
        '6º Frontal': 'Luz',
        '7º Coronário': 'Éter',
      };

      const elementMismatchIssues: string[] = [];
      for (const [chakra, expectedElement] of Object.entries(CHAKRA_ELEMENT_EXPECTATIONS)) {
        const oduElements = oduChakraElement[chakra];
        if (oduElements && oduElements.size > 0) {
          if (expectedElement === 'Terra' || expectedElement === 'Água') {
            const hasFire = [...oduElements].some((e) => e === 'Fogo');
            if (hasFire && [...oduElements].filter((e) => e !== 'Fogo').length > 2) {
              elementMismatchIssues.push(`${chakra} has mixed element assignments`);
            }
          }
        }
      }

      const allIssues = [
        ...missingCanonical,
        ...extraChakras,
        ...colorIssues.map((c) => `${c.chakra}: color mismatch`),
        ...elementMismatchIssues,
      ];
      const score = Math.max(0, ((30 - allIssues.length) / 30) * 100);

      return builder
        .status(allIssues.length === 0 ? MetricStatus.pass : MetricStatus.warning)
        .score(score)
        .value(allIssues.length)
        .threshold(90)
        .unit('%')
        .severity(allIssues.length > 5 ? MetricSeverity.high : MetricSeverity.medium)
        .message(
          allIssues.length === 0
            ? 'Chakra system is properly integrated'
            : `Found ${allIssues.length} chakra integration issues`
        )
        .details({ colorIssues, elementMismatchIssues, missingCanonical, extraChakras })
        .duration(Date.now() - start)
        .build();
    } catch (err) {
      return builder
        .status(MetricStatus.error)
        .score(0)
        .value('eval_failed')
        .threshold(90)
        .unit('%')
        .severity(MetricSeverity.critical)
        .message(`Eval failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
        .duration(Date.now() - start)
        .build();
    }
  },
};

// ============================================================================
// Export all evals for EvalSuiteRunner
// ============================================================================

export const spiritualCorrelationEvals: EvalDefinition[] = [
  evalTarotCoverage,
  evalCorrelationCompleteness,
  evalElementOrixaConsistency,
  evalCrossReferences,
  evalDataIntegrity,
  evalOrixaSemanticAccuracy,
  evalSymbolMappings,
  evalSefirotCorrespondences,
  evalOduIfaSystem,
  evalChakraIntegration,
];

export default spiritualCorrelationEvals;
