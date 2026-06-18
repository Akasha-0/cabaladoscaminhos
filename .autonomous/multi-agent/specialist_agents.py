#!/usr/bin/env python3
from __future__ import annotations

"""
specialist_agents.py — 5 Specialist Agents for Akasha Continuous Evolution

Each agent specializes in one domain and can be triggered by the loop
to perform deep, focused audits + improvements.

SPECIALIST AGENTS:
  1. TextFormattingAgent    — text readability, writing quality, prose length
  2. CalculationAuditAgent  — algorithm verification, cross-tradition math
  3. UXAuditAgent          — UI/UX review, component consolidation, navigation
  4. TranslationUnifyAgent — cross-tradition symbol correlation + unification
  5. SynthesisAgent        — akashic layer coherence, insight quality

Each agent has:
  .audit() -> list[Finding]
  .generate_improvements(findings) -> list[Improvement]

The daemon's PLANNING phase generates specialist tasks from these agents,
and the IMPLEMENTATION phase spawns them as additional omp tasks alongside
regular code-improvement agents.
"""

import json
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

ROOT = Path(__file__).resolve().parent.parent.parent
MA = ROOT / ".autonomous" / "multi-agent"


# ---------------------------------------------------------------------------
# Shared types
# ---------------------------------------------------------------------------

@dataclass
class Finding:
    severity: str          # "critical" | "high" | "medium" | "low"
    area: str              # e.g. "UI", "API", "core-odus", "synthesis"
    type: str              # e.g. "naming_bug", "long_text", "orphan_page"
    title: str             # Short description
    detail: str            # Detailed explanation + evidence
    file: Optional[str] = None
    line: Optional[int] = None
    fix_hint: str = ""     # How to fix it


@dataclass
class Improvement:
    agent: str             # Which specialist generated this
    type: str              # Improvement type
    area: str              # Project area
    title: str             # Short title
    description: str        # Full description
    files: list[str] = field(default_factory=list)
    priority: str = "high" # "critical" | "high" | "medium"
    effort: str = "medium" # "low" | "medium" | "high"
    quality_impact: int = 70  # 0-100 expected quality delta


# ---------------------------------------------------------------------------
# 1. TEXT FORMATTING AGENT
# ---------------------------------------------------------------------------

class TextFormattingAgent:
    """
    Audits: component text length, prose density, readability.
    Fixes: walls of text, overly long paragraphs, missing expand/collapse,
           inconsistent labels, poor information hierarchy.
    """
    name = "TextFormatting"
    agent_id = "agent-text-formatting"
    MAX_PARAGRAPH_CHARS = 400
    MAX_VISIBLE_LINES = 12

    def audit(self) -> list[Finding]:
        findings = []
        portal = ROOT / "apps/akasha-portal/src"

        for tsx in portal.rglob("*.tsx"):
            rel = str(tsx.relative_to(ROOT))
            try:
                content = tsx.read_text(encoding="utf-8")
            except Exception:
                continue

            long_text_blocks = re.findall(
                r'>\s*["\']((?:[^"\']{' + str(self.MAX_PARAGRAPH_CHARS) + r',}))["\']',
                content,
                re.DOTALL,
            )
            for block in long_text_blocks[:3]:
                findings.append(Finding(
                    severity="medium",
                    area="UI",
                    type="long_text_block",
                    title=f"Long text block ({len(block)} chars) in {tsx.name}",
                    detail=f"Text block exceeds {self.MAX_PARAGRAPH_CHARS} chars. "
                           "Break into smaller paragraphs or add expand/collapse.",
                    file=rel,
                    fix_hint="Use <details>/<summary> or an expand-toggle component. "
                             "Break into bullets or short paragraphs.",
                ))

        components = list((portal / "components").rglob("*.tsx"))
        for comp in components:
            rel = str(comp.relative_to(ROOT))
            try:
                content = comp.read_text(encoding="utf-8")
            except Exception:
                continue

            hardcoded_pt = re.findall(
                r'["\'](?:[A-Z][a-zà-ÿ]{30,})["\']',
                content,
            )
            if len(hardcoded_pt) > 2:
                findings.append(Finding(
                    severity="low",
                    area="UI",
                    type="hardcoded_strings",
                    title=f"{len(hardcoded_pt)} hardcoded strings in {comp.name}",
                    detail="Long hardcoded Portuguese strings found. "
                           "Use i18n keys for maintainability.",
                    file=rel,
                    fix_hint="Replace with useTranslation() hook or i18n key.",
                ))

        return findings

    def generate_improvements(self, findings: list[Finding]) -> list[Improvement]:
        improvements = []
        for f in findings:
            if f.type == "long_text_block":
                improvements.append(Improvement(
                    agent=self.agent_id, type="text_formatting", area=f.area,
                    title=f"Break long text in {Path(f.file or 'unknown').name}",
                    description=f"{f.title}\n\n{f.detail}\n\nFix: {f.fix_hint}",
                    files=[f.file] if f.file else [],
                    priority="medium", effort="low", quality_impact=65,
                ))
            elif f.type == "hardcoded_strings":
                improvements.append(Improvement(
                    agent=self.agent_id, type="text_formatting", area=f.area,
                    title=f"Externalize strings in {Path(f.file or 'unknown').name}",
                    description=f"{f.title}\n\n{f.detail}",
                    files=[f.file] if f.file else [],
                    priority="low", effort="low", quality_impact=40,
                ))
        return improvements


# ---------------------------------------------------------------------------
# 2. CALCULATION AUDIT AGENT
# ---------------------------------------------------------------------------

class CalculationAuditAgent:
    """
    Audits: Odu/numerology/astrology calculations for correctness.
    Verifies: algorithm consistency across packages, data source alignment,
              master-number preservation, Odu numbering.
    """
    name = "CalculationAudit"
    agent_id = "agent-calculation-audit"

    def audit(self) -> list[Finding]:
        findings = []
        core_odus = ROOT / "packages/core-odus/src"

        # 1. Check for duplicate Odu calculation algorithms
        calc_files = list(core_odus.glob("*.ts"))
        algorithms: dict[str, str] = {}
        for f in calc_files:
            try:
                content = f.read_text(encoding="utf-8")
            except Exception:
                continue
            if "reduceOduNumber" in content or "calcularOduNascimento" in content:
                sig = "odu_reduce"
                if sig in algorithms:
                    findings.append(Finding(
                        severity="critical",
                        area="core-odus",
                        type="duplicate_algorithm",
                        title="Duplicate Odu reduction algorithms",
                        detail=f"Found Odu reduction logic in both:\n"
                               f"  - {algorithms[sig]} (odu-birth.ts)\n"
                               f"  - {f.name} (extra)\n\n"
                               f"These use DIFFERENT algorithms:\n"
                               f"  odu-birth.ts: DDMMYYYY digit sum → reduce\n"
                               f"  calculos.ts: DDMMYYYY digit sum (same algorithm, different source)\n\n"
                               f"ISSUE FIXED in this iteration: odu-birth.ts now uses DDMMYYYY.\n"
                               f"calcularOduNascimento should be updated to call calculateBirthOdu.",
                        file=str(f.relative_to(ROOT)),
                        fix_hint="Deprecate calcularOduNascimento. Have it call calculateBirthOdu. "
                                 "Or remove calcularOduNascimento entirely if not used.",
                    ))
                else:
                    algorithms[sig] = str(f.relative_to(ROOT))

        # 2. Check ODUS_IFA naming consistency
        odus_ifa = core_odus / "odus-ifa-data.ts"
        if odus_ifa.exists():
            ifa_content = odus_ifa.read_text(encoding="utf-8")
            if "Ogbe (Oxé)" in ifa_content:
                findings.append(Finding(
                    severity="critical",
                    area="core-odus",
                    type="naming_conflict",
                    title='Ogbe entry contained "(Oxé)" — FIXED: now "Ogbe"',
                    detail='FIXED in this iteration: ODUS_IFA[0].nome changed from '
                           '"Ogbe (Oxé)" to "Ogbe". '
                           'The parenthetical alias caused Odu 1 to display as "Oxé" '
                           '(Odu 5) in the UI.',
                    file="packages/core-odus/src/odus-ifa-data.ts",
                    fix_hint="Verify the fix is applied. Check that ogbe-ifa-data.ts line 15 says nome: 'Ogbe'.",
                ))

            if "Etogundá" in ifa_content:
                calc_ts = core_odus / "calculos.ts"
                if calc_ts.exists():
                    calc_content = calc_ts.read_text(encoding="utf-8")
                    if "Etaogundá" in calc_content:
                        findings.append(Finding(
                            severity="high",
                            area="core-odus",
                            type="spelling_inconsistency",
                            title="Etogundá vs Etaogundá — same Odu, different spelling",
                            detail="ODUS_IFA uses 'Etogundá' (numero 3) while odusData uses "
                                   "'Etaogundá'. These are the same Odu. Standardize.",
                            file="packages/core-odus/src/calculos.ts",
                            fix_hint='Standardize to "Etogundá" (ODUS_IFA spelling) across both files.',
                        ))

        # 3. Verify numerology master-number preservation
        cabala = ROOT / "packages/core-cabala/src/numerology-kabalah.ts"
        if cabala.exists():
            content = cabala.read_text(encoding="utf-8")
            if ("11" in content and "22" in content and "33" in content
                    and "keepMaster" not in content and "master" not in content.lower()):
                findings.append(Finding(
                    severity="medium",
                    area="core-cabala",
                    type="master_number_handling",
                    title="Master number (11/22/33) handling needs verification",
                    detail="The reduceToSingleDigit should preserve 11, 22, 33 as master "
                           "numbers. Verify this is tested.",
                    file="packages/core-cabala/src/numerology-kabalah.ts",
                    fix_hint="Ensure calculateLifePath tests cover master number cases. "
                             "Add test: calculateLifePath('1990-01-01') → 11 (master).",
                ))

        return findings

    def generate_improvements(self, findings: list[Finding]) -> list[Improvement]:
        improvements = []
        for f in findings:
            improvements.append(Improvement(
                agent=self.agent_id,
                type="calculation_fix",
                area=f.area,
                title=f"{'FIXED' if 'FIXED' in f.detail else 'Review'}: {f.title}",
                description=f"{f.detail}\n\nFix: {f.fix_hint}",
                files=[f.file] if f.file else [],
                priority={"duplicate_algorithm": "critical", "naming_conflict": "high",
                          "spelling_inconsistency": "high"}.get(f.type, "medium"),
                effort="low",
                quality_impact=95,
            ))
        return improvements


# ---------------------------------------------------------------------------
# 3. UX AUDIT AGENT
# ---------------------------------------------------------------------------

class UXAuditAgent:
    """
    Audits: page necessity, navigation structure, component functionality,
            card/container features (expand/collapse/tabs), information density.
    """
    name = "UXAudit"
    agent_id = "agent-ux-audit"

    def audit(self) -> list[Finding]:
        findings = []
        portal = ROOT / "apps/akasha-portal/src"

        # 1. Identify large component files
        components = portal / "components"
        if components.exists():
            for comp in components.rglob("*.tsx"):
                try:
                    content = comp.read_text(encoding="utf-8")
                except Exception:
                    continue
                lines = content.count("\n")
                if lines > 500:
                    findings.append(Finding(
                        severity="medium",
                        area="UI",
                        type="large_component",
                        title=f"Large component ({lines} lines): {comp.name}",
                        detail=f"{comp.name} has {lines} lines. "
                               "Large components often indicate missing abstraction.",
                        file=str(comp.relative_to(ROOT)),
                        fix_hint="Extract logical sections into smaller components. "
                                 "Use children props or compound component pattern.",
                    ))

                if "descriptionStyle" in content or "longText" in content.lower():
                    if "expand" not in content.lower() and "toggle" not in content.lower():
                        findings.append(Finding(
                            severity="medium",
                            area="UI",
                            type="missing_expand_toggle",
                            title=f"Long text section without expand toggle in {comp.name}",
                            detail="Component has long text but no expand/collapse mechanism.",
                            file=str(comp.relative_to(ROOT)),
                            fix_hint="Add an expand-toggle button (like ExpandToggle in manifesto/page.tsx) "
                                     "to allow users to reveal full content.",
                        ))

        # 2. Check for orphan pages
        app_pages = list((portal / "app").rglob("page.tsx"))
        for p in app_pages:
            rel = str(p.relative_to(portal))
            depth = rel.count("/")
            if depth >= 3:
                parent = p.parent
                if not (parent / "page.tsx").exists():
                    findings.append(Finding(
                        severity="low",
                        area="UI",
                        type="orphan_route",
                        title=f"Deeply nested route without parent page: {rel}",
                        detail=f"Route is nested {depth} levels deep with no parent page.tsx.",
                        file=rel,
                        fix_hint="Consider adding a parent page or moving this page up in the hierarchy.",
                    ))

        return findings

    def generate_improvements(self, findings: list[Finding]) -> list[Improvement]:
        improvements = []
        for f in findings:
            improvements.append(Improvement(
                agent=self.agent_id,
                type="ux_improvement",
                area=f.area,
                title=f"UX: {f.title}",
                description=f"{f.detail}\n\nFix: {f.fix_hint}",
                files=[f.file] if f.file else [],
                priority={"missing_expand_toggle": "high", "large_component": "medium",
                          "orphan_route": "low"}.get(f.type, "medium"),
                effort={"missing_expand_toggle": "low", "large_component": "high",
                        "orphan_route": "medium"}.get(f.type, "medium"),
                quality_impact=70,
            ))
        return improvements


# ---------------------------------------------------------------------------
# 4. TRANSLATION UNIFICATION AGENT
# ---------------------------------------------------------------------------

class TranslationUnifyAgent:
    """
    Audits: cross-tradition symbol correlation, terminology consistency,
            the 3-systems-display problem (astrology + numerology + Odu shown
            as 3 separate things instead of one unified insight).
    """
    name = "TranslationUnify"
    agent_id = "agent-translation-unify"

    def audit(self) -> list[Finding]:
        findings = []
        mapeamentos = ROOT / "mapeamentos"

        if not mapeamentos.exists():
            findings.append(Finding(
                severity="high",
                area="synthesis",
                type="missing_mapeamentos",
                title="mapeamentos/ directory missing or empty",
                detail="The mapeamentos/ directory is the translation layer between "
                       "raw symbols and universal primitives. It must be complete.",
                file="mapeamentos/",
                fix_hint="Ensure mapeamentos/ has complete JSON files for all 5 traditions: "
                         "astrologia.json, cabala.json, iching.json, odu.json, tantra.json.",
            ))
            return findings

        required = ["astrologia.json", "cabala.json", "iching.json", "odu.json", "tantra.json"]
        for fname in required:
            fpath = mapeamentos / fname
            if not fpath.exists():
                findings.append(Finding(
                    severity="high",
                    area="synthesis",
                    type="missing_mapeamento_file",
                    title=f"Missing mapeamento file: {fname}",
                    detail=f"{fname} is required for the primitive translation system.",
                    file=f"mapeamentos/{fname}",
                    fix_hint=f"Create mapeamentos/{fname} with complete symbol-to-primitive mappings.",
                ))
                continue
            try:
                data = json.loads(fpath.read_text(encoding="utf-8"))
                if not data or len(data) < 3:
                    findings.append(Finding(
                        severity="high",
                        area="synthesis",
                        type="empty_mapeamento",
                        title=f"{fname} is empty or too small ({len(data)} entries)",
                        detail="The primitive translation system requires comprehensive coverage.",
                        file=f"mapeamentos/{fname}",
                        fix_hint=f"Populate mapeamentos/{fname} with all symbols from the "
                                 "corresponding tradition package.",
                    ))
            except json.JSONDecodeError:
                findings.append(Finding(
                    severity="critical",
                    area="synthesis",
                    type="invalid_json",
                    title=f"{fname} is not valid JSON",
                    detail="mapeamentos/{fname} contains invalid JSON.",
                    file=f"mapeamentos/{fname}",
                    fix_hint=f"Fix JSON syntax in mapeamentos/{fname}.",
                ))

        # Check for GeneKeys / Human Design integration
        grimoire = ROOT / "grimoire"
        if grimoire.exists():
            grimoire_files = list(grimoire.rglob("*.md"))
            has_genekeys = any("genekeys" in str(f).lower() for f in grimoire_files)
            has_hd = any("human" in str(f).lower() and "design" in str(f).lower()
                         for f in grimoire_files)
            if not has_genekeys:
                findings.append(Finding(
                    severity="low", area="synthesis",
                    type="missing_tradition_research",
                    title="GeneKeys research not found in grimoire",
                    detail="GeneKeys is mentioned in SPEC.md as a modern system to integrate.",
                    file="grimoire/",
                    fix_hint="Research GeneKeys 24-56 gene key system and document "
                             "how it maps to Akasha primitives in grimoire/genekeys/",
                ))
            if not has_hd:
                findings.append(Finding(
                    severity="low", area="synthesis",
                    type="missing_tradition_research",
                    title="Human Design research not found in grimoire",
                    detail="Human Design is mentioned in SPEC.md as a modern system to integrate.",
                    file="grimoire/",
                    fix_hint="Research Human Design Type and channels, document mappings "
                             "to Akasha primitives in grimoire/human-design/",
                ))

        return findings

    def generate_improvements(self, findings: list[Finding]) -> list[Improvement]:
        improvements = []
        for f in findings:
            improvements.append(Improvement(
                agent=self.agent_id,
                type="synthesis_unification",
                area=f.area,
                title=f"Unification: {f.title}",
                description=f"{f.detail}\n\nFix: {f.fix_hint}",
                files=[f.file] if f.file else [],
                priority={"missing_mapeamento_file": "high", "empty_mapeamento": "high",
                          "invalid_json": "critical", "missing_tradition_research": "low"
                          }.get(f.type, "medium"),
                effort={"missing_mapeamento_file": "medium", "empty_mapeamento": "high",
                        "invalid_json": "low", "missing_tradition_research": "high"
                        }.get(f.type, "medium"),
                quality_impact=85,
            ))
        return improvements


# ---------------------------------------------------------------------------
# 5. SYNTHESIS AGENT
# ---------------------------------------------------------------------------

class SynthesisAgent:
    """
    Audits: akashic layer coherence, AkashaTypeProfile completeness,
            AreaNarrative quality, tension/sync detection.
    """
    name = "SynthesisAudit"
    agent_id = "agent-synthesis"

    def audit(self) -> list[Finding]:
        findings = []

        # 1. AkashaTypeProfile completeness
        types_catalog = (ROOT / "apps/akasha-portal/src/lib/application/akasha"
                        / "akasha-types-catalog.ts")
        if types_catalog.exists():
            content = types_catalog.read_text(encoding="utf-8")
            stub_count = content.count("stub") + content.count("Stub")
            if stub_count > 3:
                findings.append(Finding(
                    severity="high", area="synthesis",
                    type="incomplete_types",
                    title=f"{stub_count} stub types remaining in AkashaTypeProfile",
                    detail="SPEC.md requires all 9 types fully defined. "
                           "Catalisador, Receptor are done. "
                           "Remaining: Construtor, Transformador, Guardião, Curador, "
                           "Canal, Alquimista, Arquiteto.",
                    file="apps/akasha-portal/src/lib/application/akasha/akasha-types-catalog.ts",
                    fix_hint="Implement remaining stub types. See SPEC.md §7 for field definitions.",
                ))

        # 2. life-areas parallel system gap
        life_areas_dir = (ROOT / "apps/akasha-portal/src/lib/application/life-areas")
        if life_areas_dir.exists():
            spec = ROOT / "SPEC.md"
            if spec.exists():
                spec_content = spec.read_text(encoding="utf-8")
                if "parallel" in spec_content.lower():
                    findings.append(Finding(
                        severity="medium", area="synthesis",
                        type="parallel_life_system",
                        title="Two life-area systems coexist (12-area and 6-area)",
                        detail="SPEC.md notes a parallel 12-area system in life-areas-engine/ "
                               "and a 6-area system in the synthesis layer. Unify.",
                        file="apps/akasha-portal/src/lib/application/life-areas/",
                        fix_hint="Deprecate the 12-area system. Keep the 6-area model "
                                 "(vitalidadeEnergia, conexoesAmor, carreiraProsperidade, "
                                 "oriCabecaQuizilas, missaoDestino, desafiosSombras) as SSOT.",
                    ))

        return findings

    def generate_improvements(self, findings: list[Finding]) -> list[Improvement]:
        improvements = []
        for f in findings:
            improvements.append(Improvement(
                agent=self.agent_id,
                type="synthesis_improvement",
                area=f.area,
                title=f"Synthesis: {f.title}",
                description=f"{f.detail}\n\nFix: {f.fix_hint}",
                files=[f.file] if f.file else [],
                priority={"incomplete_types": "high", "parallel_life_system": "medium"
                          }.get(f.type, "medium"),
                effort="high",
                quality_impact=80,
            ))
        return improvements


# ---------------------------------------------------------------------------
# Specialist task registry
# ---------------------------------------------------------------------------

SPECIALIST_REGISTRY = {
    "text_formatting": TextFormattingAgent(),
    "calculation_audit": CalculationAuditAgent(),
    "ux_audit": UXAuditAgent(),
    "translation_unify": TranslationUnifyAgent(),
    "synthesis": SynthesisAgent(),
}


def run_all_audits() -> dict[str, list[Finding]]:
    """Run all specialist audits and return findings by agent name."""
    results: dict[str, list[Finding]] = {}
    for name, agent in SPECIALIST_REGISTRY.items():
        try:
            findings = agent.audit()
            results[name] = findings
        except Exception as e:
            results[name] = [Finding(
                severity="critical", area="system", type="audit_error",
                title=f"{agent.name} audit crashed",
                detail=str(e),
                fix_hint="Fix the audit logic in the specialist agent.",
            )]
    return results


def generate_all_improvements(findings_by_agent: dict[str, list[Finding]]) -> list[Improvement]:
    """Convert all findings from all agents into Improvement objects."""
    all_improvements: list[Improvement] = []
    for agent_name, findings in findings_by_agent.items():
        agent = SPECIALIST_REGISTRY.get(agent_name)
        if agent:
            all_improvements.extend(agent.generate_improvements(findings))
    return all_improvements


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Run specialist agent audits")
    parser.add_argument("--agent", choices=list(SPECIALIST_REGISTRY.keys()),
                        help="Run specific agent")
    parser.add_argument("--output", type=str, help="Write results to JSON file")
    args = parser.parse_args()

    if args.agent:
        agent = SPECIALIST_REGISTRY[args.agent]
        findings = agent.audit()
        improvements = agent.generate_improvements(findings)
        output = {"findings": [vars(f) for f in findings],
                  "improvements": [vars(i) for i in improvements]}
    else:
        all_findings = run_all_audits()
        all_improvements = generate_all_improvements(all_findings)
        output = {
            "findings_by_agent": {k: [vars(f) for f in v] for k, v in all_findings.items()},
            "improvements": [vars(i) for i in all_improvements],
        }

    if args.output:
        Path(args.output).write_text(json.dumps(output, indent=2, ensure_ascii=False))
        print(f"Results written to {args.output}")
    else:
        print(json.dumps(output, indent=2, ensure_ascii=False))
