/**
 * ============================================================================
 * QUALITY GATE — Akasha Portal (Wave 29)
 * ============================================================================
 *
 * Structural pre-validation for any article entering the Akasha knowledge base.
 * Used by:
 *   1. The AI Curation Engine (Wave 29-1) — fast pre-filter BEFORE LLM scoring.
 *   2. The Curation API (Wave 29-4)     — final gate BEFORE Prisma upsert.
 *   3. Manual curator submissions       — UI form validation.
 *
 * This is the **structural** layer of quality control. It does NOT call any LLM.
 * It validates:
 *   - Required fields present
 *   - Schema-aligned enums (EvidenceLevel, ArticleType)
 *   - Canonical tradition list (no orphan tags)
 *   - Verifiable identifiers (DOI / PMID / URL format)
 *   - Plausible year / content length / author list
 *   - The 8 Akasha IA ethical rules applied as hard rejections
 *     (no "cure" promises, no proselitism, no fabrication)
 *
 * The semantic layer (LLM-based relevance / evidence / universalism scoring)
 * lives in `../ai/curation-prompt.ts` and runs AFTER this gate passes.
 *
 * @see docs/CURATOR-GUIDELINES-W29.md     — full curator manual
 * @see docs/CULTURAL-SENSITIVITY-W29.md   — per-tradition care
 * @see docs/QUALITY-GATES-W29.md          — checklist + customization
 * ============================================================================
 */

import type { CandidateArticle } from "./sources";

// ============================================================================
// SCHEMA MIRROR
// ============================================================================
// Mirrors the Prisma enums so we can validate without importing @prisma/client
// (this module is usable from edge functions, scripts, and tests).
// ============================================================================

export const EVIDENCE_LEVELS = ["HIGH", "MEDIUM", "LOW", "ANECDOTAL"] as const;
export type EvidenceLevel = (typeof EVIDENCE_LEVELS)[number];

export const ARTICLE_TYPES = [
  "SCIENTIFIC_PAPER",
  "MAGAZINE_ARTICLE",
  "BOOK",
  "VIDEO",
  "PODCAST",
  "ESSAY",
] as const;
export type ArticleType = (typeof ARTICLE_TYPES)[number];

// ============================================================================
// CANONICAL TRADITIONS
// ============================================================================
// Single source of truth for tradition tags. Mirrored in
// docs/CULTURAL-SENSITIVITY-W29.md. Keep in sync.
// ============================================================================

export const CANONICAL_TRADITIONS = [
  // Afro-brasileiras
  "candomble",
  "umbanda",
  // Yorùbá / Ifá
  "ifa",
  // Indígenas (ameríndias, siberianas)
  "xamanismo",
  // Judaísmo místico
  "cabala",
  // Hinduísmo e tradições derivadas
  "tantra",
  "ayurveda",
  // Budismo e meditação
  "meditacao",
  // Sistema sutil / energia
  "reiki",
  // Sistemas interpretativos
  "astrologia",
  "numerologia",
  // Práticas corporais / respiratórias / enteogénicas
  "praticas-somaticas",
  "psicodelicos",
  // Guarda-chuva para tradições que não cabem nas categorias acima
  "outras",
] as const;
export type CanonicalTradition = (typeof CANONICAL_TRADITIONS)[number];

// ============================================================================
// REJECTION PATTERNS (8 Akasha ethical rules)
// ============================================================================
// Each pattern is matched case-insensitively against title + abstract.
// Hits here are HARD REJECTIONS — the article is not safe to ingest even
// with strong LLM scoring, because they violate the non-negotiable rules.
// ============================================================================

export const HARD_REJECTION_PATTERNS: ReadonlyArray<{
  rule: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  label: string;
  pattern: RegExp;
  reason: string;
}> = [
  // Rule 1 — Nunca prescrever
  {
    rule: 1,
    label: "promessa-de-cura",
    pattern:
      /\b(cur[ae]|cura definitiva|cura cancer|cura depressao|cura tudo|garant[ae] cura|elimina (a dor|a doen[çc]a))\b/i,
    reason: "Promessa de cura absoluta viola a Regra 1 (Nunca Prescrever).",
  },
  {
    rule: 1,
    label: "instrucao-medica-direta",
    pattern:
      /\b(tome \d|use \d mg|fa[çc]a jejum de \d+ dias|consuma \d+ gramas)\b/i,
    reason: "Instrução médica direta viola a Regra 1 (Nunca Prescrever).",
  },

  // Rule 3 — Respeitar autoridade da tradição
  // (caught by tradition field, not regex)

  // Rule 4 — Universalismo, não proselitismo
  {
    rule: 4,
    label: "proselitismo-hierarquico",
    pattern:
      /\b(única religi[ãa]o verdadeira|melhor tradi[çc][ãa]o|superior a (todas|candombl|umbanda|cabala|ifa|tantra)|evolu[íi] para (cabala|tantra|medita[çc][ãa]o))\b/i,
    reason:
      "Hierarquização entre tradições viola a Regra 4 (Universalismo).",
  },

  // Rule 5 — Honrar contexto cultural
  {
    rule: 5,
    label: "apropriacao-cultural",
    pattern:
      /\b(ritual xam[âa]nico para (neg[óo]cios|produtividade|sucesso)|use ayahuasca para (empreender|trabalhar|estudar)|medita[çc][ãa]o para (millon[áa]rios|empreendedores))\b/i,
    reason:
      "Reduzir prática sagrada a ferramenta de produtividade viola a Regra 5 (Contexto Cultural).",
  },

  // Rule 6 — Apontar contraindicações (proxy: detect dangerous practice without disclaimer markers)
  // (caught via required fields downstream, not regex)

  // Rule 7 — Reconhecer limites
  {
    rule: 7,
    label: "substitui-tratamento-medico",
    pattern:
      /\b(substitui (o tratamento|a quimioterapia|a medica[çc][ãa]o)|alternativa (comprovada|cient[íi]fica) ao (tratamento|m[ée]dico)|no lugar de (m[ée]dico|psic[óo]logo|terapeuta))\b/i,
    reason:
      "Apresentar prática como substituta de tratamento viola a Regra 7 (Limites).",
  },

  // Rule 8 — Promover paz (anti-seita, anti-ódio)
  {
    rule: 8,
    label: "discurso-de-odio",
    pattern:
      /\b(praticantes de [\w]+ s[ãa]o (enganados|burros|primitivos)|deixe (candombl|umbanda|cabala|ifa) e venha para|deixe sua religi[ãa]o atrasada)\b/i,
    reason: "Discurso de ódio ou de proselitismo contra-tradicional viola a Regra 8 (Paz).",
  },
];

// ============================================================================
// TYPES
// ============================================================================

/**
 * Shape of an article draft that the Quality Gate can validate.
 * Compatible with `CandidateArticle` (from sources.ts) plus optional fields
 * that the API / manual submission path may supply.
 */
export interface ArticleDraft {
  // Identity (required)
  title: string;
  summary?: string;
  content?: string;

  // Bibliographic (required for AUTO-ACCEPT, optional for REVIEW)
  authors?: string[];
  journal?: string | null;
  year?: number;
  doi?: string | null;
  url?: string | null;
  pmid?: string | null;

  // Curation metadata
  evidenceLevel?: EvidenceLevel | null;
  type?: ArticleType;
  tradition?: string | null;
  tags?: string[];
  language?: string;

  // Provenance
  source?: string | null;
  curatedBy?: string | null;
}

export interface QualityCheckResult {
  /** Whether the article passes the gate. */
  passed: boolean;
  /** Hard errors — must be fixed before upsert. */
  errors: string[];
  /** Soft warnings — should be reviewed but do not block. */
  warnings: string[];
  /** Severity classification (drives UI badge). */
  severity: "PASS" | "WARN" | "BLOCK";
  /** Traceable list of checks that ran (useful for UI/debugging). */
  checks: QualityCheck[];
  /** Optional tradition validation outcome. */
  traditionValidation?: {
    canonical: string | null;
    suggested: string | null;
    isCanonical: boolean;
  };
}

export interface QualityCheck {
  /** Check id — short slug for stable UI keys. */
  id: string;
  /** What the gate checked. */
  description: string;
  /** Did it pass? */
  ok: boolean;
  /** Severity when it fails: BLOCK (hard) or WARN (soft). PASS means it passed. */
  level: "BLOCK" | "WARN" | "PASS";
  /** Optional detail for debugging/UI. */
  detail?: string;
}

// ============================================================================
// MAIN API
// ============================================================================

/**
 * Validate an article draft against the Akasha Quality Gate.
 *
 * Pure function — no I/O, no LLM calls. Runs in <5ms for typical input.
 * Always returns a result object (never throws on bad input).
 *
 * @example
 *   const r = validateArticle({ title: "Ayahuasca para Depressão", doi: "10.x", year: 2022 });
 *   if (!r.passed) return res.status(400).json({ errors: r.errors });
 */
export function validateArticle(draft: ArticleDraft): QualityCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const checks: QualityCheck[] = [];

  // -------------------------------------------------------------------------
  // 1. Required fields
  // -------------------------------------------------------------------------
  const titleCheck = checkTitle(draft.title);
  checks.push(titleCheck);
  if (!titleCheck.ok) errors.push(titleCheck.detail ?? titleCheck.description);

  // -------------------------------------------------------------------------
  // 2. Verifiable identifier (DOI / PMID / URL)
  // -------------------------------------------------------------------------
  const identifierCheck = checkIdentifier(draft);
  checks.push(identifierCheck);
  if (!identifierCheck.ok) errors.push(identifierCheck.detail ?? identifierCheck.description);
  else if (identifierCheck.level === "WARN") {
    warnings.push(identifierCheck.detail ?? identifierCheck.description);
  }

  // -------------------------------------------------------------------------
  // 3. Year plausibility
  // -------------------------------------------------------------------------
  const yearCheck = checkYear(draft.year);
  checks.push(yearCheck);
  if (!yearCheck.ok) errors.push(yearCheck.detail ?? yearCheck.description);

  // -------------------------------------------------------------------------
  // 4. Authors
  // -------------------------------------------------------------------------
  const authorsCheck = checkAuthors(draft.authors);
  checks.push(authorsCheck);
  if (!authorsCheck.ok) warnings.push(authorsCheck.detail ?? authorsCheck.description);

  // -------------------------------------------------------------------------
  // 5. Evidence level
  // -------------------------------------------------------------------------
  const evidenceCheck = checkEvidenceLevel(draft.evidenceLevel);
  checks.push(evidenceCheck);
  if (!evidenceCheck.ok) warnings.push(evidenceCheck.detail ?? evidenceCheck.description);

  // -------------------------------------------------------------------------
  // 6. Tradition canonicalization
  // -------------------------------------------------------------------------
  const traditionValidation = validateTradition(draft.tradition);
  checks.push({
    id: "tradition-canonical",
    description: "Tradição pertence à lista canônica",
    ok: traditionValidation.isCanonical,
    level: traditionValidation.isCanonical ? "PASS" : "WARN",
    detail: traditionValidation.isCanonical
      ? `Tradição canônica: ${traditionValidation.canonical}`
      : `Tradição "${draft.tradition}" não é canônica. Sugestão: ${traditionValidation.suggested ?? "mover para 'outras'"}`,
  });
  if (!traditionValidation.isCanonical) {
    warnings.push(
      `Tradição "${draft.tradition}" não é canônica. Sugestão: "${traditionValidation.suggested ?? "outras"}".`
    );
  }

  // -------------------------------------------------------------------------
  // 7. Content length (sanity)
  // -------------------------------------------------------------------------
  const lengthCheck = checkContentLength(draft);
  checks.push(lengthCheck);
  if (!lengthCheck.ok) warnings.push(lengthCheck.detail ?? lengthCheck.description);

  // -------------------------------------------------------------------------
  // 8. Hard rejection patterns (8 ethical rules)
  // -------------------------------------------------------------------------
  const corpus = `${draft.title ?? ""} ${draft.summary ?? ""} ${draft.content ?? ""}`;
  for (const pattern of HARD_REJECTION_PATTERNS) {
    const match = corpus.match(pattern.pattern);
    if (match) {
      const hit = {
        id: `rule-${pattern.rule}-${pattern.label}`,
        description: `Regra ${pattern.rule}: ${pattern.reason}`,
        ok: false,
        level: "BLOCK" as const,
        detail: `Match em padrão "${match[0]}" — ${pattern.reason}`,
      };
      checks.push(hit);
      errors.push(hit.detail ?? hit.description);
    }
  }

  // -------------------------------------------------------------------------
  // Final classification
  // -------------------------------------------------------------------------
  const hasBlockingError = errors.length > 0;
  const severity: QualityCheckResult["severity"] = hasBlockingError
    ? "BLOCK"
    : warnings.length > 0
      ? "WARN"
      : "PASS";

  return {
    passed: !hasBlockingError,
    errors,
    warnings,
    severity,
    checks,
    traditionValidation,
  };
}

// ============================================================================
// INDIVIDUAL CHECKS
// ============================================================================

function checkTitle(title: string | undefined): QualityCheck {
  if (!title || typeof title !== "string") {
    return {
      id: "title-required",
      description: "Título é obrigatório",
      ok: false,
      level: "BLOCK",
      detail: "Título ausente. Forneça um título não-vazio.",
    };
  }
  const trimmed = title.trim();
  if (trimmed.length < 10) {
    return {
      id: "title-length-min",
      description: "Título ≥ 10 caracteres",
      ok: false,
      level: "BLOCK",
      detail: `Título muito curto (${trimmed.length} caracteres). Mínimo: 10.`,
    };
  }
  if (trimmed.length > 300) {
    return {
      id: "title-length-max",
      description: "Título ≤ 300 caracteres",
      ok: false,
      level: "BLOCK",
      detail: `Título muito longo (${trimmed.length} caracteres). Máximo: 300.`,
    };
  }
  if (/^\s+$/.test(title)) {
    return {
      id: "title-whitespace",
      description: "Título sem espaços em branco",
      ok: false,
      level: "BLOCK",
      detail: "Título contém apenas espaços em branco.",
    };
  }
  return {
    id: "title-present",
    description: "Título válido",
    ok: true,
    level: "PASS",
  };
}

function checkIdentifier(draft: ArticleDraft): QualityCheck {
  const hasDoi = isValidDoi(draft.doi);
  const hasPmid = isValidPmid(draft.pmid);
  const hasUrl = isValidUrl(draft.url);

  if (hasDoi || hasPmid) {
    return {
      id: "identifier-primary",
      description: "Identificador primário (DOI ou PMID)",
      ok: true,
      level: "PASS",
      detail: hasDoi ? `DOI válido: ${draft.doi}` : `PMID válido: ${draft.pmid}`,
    };
  }
  if (hasUrl) {
    // URL is acceptable as fallback (e.g., book, blog), but warning
    return {
      id: "identifier-url-only",
      description: "Sem DOI/PMID — apenas URL",
      ok: true,
      level: "WARN",
      detail: `Apenas URL fornecida (${draft.url}). Adicione DOI ou PMID para fontes acadêmicas.`,
    };
  }
  return {
    id: "identifier-missing",
    description: "DOI, PMID ou URL verificável",
    ok: false,
    level: "BLOCK",
    detail:
      "Artigo precisa de pelo menos um identificador verificável (DOI canônico, PMID ou URL https oficial).",
  };
}

function checkYear(year: number | undefined): QualityCheck {
  if (year === undefined || year === null) {
    return {
      id: "year-required",
      description: "Ano de publicação",
      ok: false,
      level: "BLOCK",
      detail: "Ano ausente. Forneça o ano de publicação.",
    };
  }
  const currentYear = new Date().getFullYear();
  if (!Number.isInteger(year)) {
    return {
      id: "year-integer",
      description: "Ano é inteiro",
      ok: false,
      level: "BLOCK",
      detail: `Ano inválido: ${year}. Deve ser número inteiro.`,
    };
  }
  if (year < 1900) {
    return {
      id: "year-too-old",
      description: "Ano ≥ 1900",
      ok: false,
      level: "BLOCK",
      detail: `Ano ${year} é anterior a 1900. Para artigos históricos, consulte curador senior.`,
    };
  }
  if (year > currentYear + 1) {
    return {
      id: "year-future",
      description: `Ano ≤ ${currentYear + 1}`,
      ok: false,
      level: "BLOCK",
      detail: `Ano ${year} está no futuro (ano atual: ${currentYear}).`,
    };
  }
  return {
    id: "year-valid",
    description: "Ano válido",
    ok: true,
    level: "PASS",
  };
}

function checkAuthors(authors: string[] | undefined): QualityCheck {
  if (!authors || !Array.isArray(authors) || authors.length === 0) {
    return {
      id: "authors-present",
      description: "Lista de autores",
      ok: false,
      level: "WARN",
      detail: "Lista de autores vazia. Recomendado: ≥ 1 autor.",
    };
  }
  if (authors.length > 50) {
    return {
      id: "authors-too-many",
      description: "≤ 50 autores",
      ok: false,
      level: "WARN",
      detail: `Lista de autores tem ${authors.length} entradas. Máximo recomendado: 50.`,
    };
  }
  // Validate each author is a non-empty string
  const invalid = authors.filter((a) => !a || typeof a !== "string" || a.trim().length === 0);
  if (invalid.length > 0) {
    return {
      id: "authors-valid-strings",
      description: "Autores são strings não-vazias",
      ok: false,
      level: "WARN",
      detail: `${invalid.length} autor(es) com nome vazio.`,
    };
  }
  return {
    id: "authors-ok",
    description: "Autores válidos",
    ok: true,
    level: "PASS",
  };
}

function checkEvidenceLevel(level: EvidenceLevel | string | null | undefined): QualityCheck {
  if (!level) {
    return {
      id: "evidence-level-default",
      description: "Nível de evidência definido",
      ok: false,
      level: "WARN",
      detail: "Nível de evidência ausente. Default será ANECDOTAL — revise se aplicável.",
    };
  }
  if (!(EVIDENCE_LEVELS as readonly string[]).includes(level)) {
    return {
      id: "evidence-level-enum",
      description: "Nível de evidência é enum válido",
      ok: false,
      level: "WARN",
      detail: `Nível "${level}" não está em [HIGH, MEDIUM, LOW, ANECDOTAL].`,
    };
  }
  return {
    id: "evidence-level-ok",
    description: "Nível de evidência válido",
    ok: true,
    level: "PASS",
  };
}

function checkContentLength(draft: ArticleDraft): QualityCheck {
  const summaryLen = (draft.summary ?? "").trim().length;
  const contentLen = (draft.content ?? "").trim().length;

  if (summaryLen === 0) {
    return {
      id: "summary-present",
      description: "Resumo (summary) presente",
      ok: false,
      level: "WARN",
      detail: "Summary ausente. Recomendado: 200-500 caracteres em PT-BR leigo.",
    };
  }
  if (summaryLen < 100) {
    return {
      id: "summary-min-length",
      description: "Resumo ≥ 100 caracteres",
      ok: false,
      level: "WARN",
      detail: `Resumo muito curto (${summaryLen} caracteres). Mínimo recomendado: 100.`,
    };
  }
  if (summaryLen > 1500) {
    return {
      id: "summary-max-length",
      description: "Resumo ≤ 1500 caracteres",
      ok: false,
      level: "WARN",
      detail: `Resumo muito longo (${summaryLen} caracteres). Máximo recomendado: 1500.`,
    };
  }
  if (contentLen > 0 && contentLen < 300) {
    return {
      id: "content-min-length",
      description: "Conteúdo ≥ 300 caracteres quando presente",
      ok: false,
      level: "WARN",
      detail: `Conteúdo muito curto (${contentLen} caracteres). Mínimo: 300.`,
    };
  }
  return {
    id: "content-length-ok",
    description: "Comprimento de conteúdo válido",
    ok: true,
    level: "PASS",
  };
}

// ============================================================================
// TRADITION CANONICALIZATION
// ============================================================================

/**
 * Validate a tradition string against the canonical list. Returns whether
 * the tradition is canonical, plus a fuzzy-match suggestion when it isn't.
 *
 * Uses lowercase + strip-accents comparison, with substring fallback for
 * common abbreviations (e.g. "Cabalá" → "cabala").
 */
export function validateTradition(tradition: string | null | undefined): {
  canonical: string | null;
  suggested: string | null;
  isCanonical: boolean;
} {
  if (!tradition || typeof tradition !== "string") {
    return { canonical: null, suggested: null, isCanonical: false };
  }
  const normalized = normalize(tradition);

  // Exact match
  if ((CANONICAL_TRADITIONS as readonly string[]).includes(normalized)) {
    return { canonical: normalized, suggested: null, isCanonical: true };
  }

  // Fuzzy match — find canonical that contains the input or vice-versa
  const exact = CANONICAL_TRADITIONS.find(
    (c) => c === normalized || c.includes(normalized) || normalized.includes(c)
  );
  if (exact) {
    return { canonical: exact, suggested: exact, isCanonical: false };
  }

  // Heuristic fallback
  const heuristics: Array<[RegExp, CanonicalTradition]> = [
    [/candombl|candomblé/i, "candomble"],
    [/umbanda/i, "umbanda"],
    [/if[áa]|iorub[áa]|yorub[áa]|orix[áa]/i, "ifa"],
    [/xam[âa]|ind[ií]gena|amer[ií]nd|paj[ée]|caboclo/i, "xamanismo"],
    [/cabala|c[áa]bala|kabb?q?alah/i, "cabala"],
    [/tantra|t[âa]ntrico/i, "tantra"],
    [/ayurveda|ayurv[ée]dica/i, "ayurveda"],
    [/medita|zen|vipassana|mindfulness|contemplat/i, "meditacao"],
    [/reiki/i, "reiki"],
    [/astrolog|jyotish|hor[óo]scop/i, "astrologia"],
    [/numerolog/i, "numerologia"],
    [/yoga|qigong|tai ?chi|chi kung|pr[âa]nat/i, "praticas-somaticas"],
    [/psicod[ée]lic|psilocibina|ayahuasca|iboga[ií]na|mdma|lsd/i, "psicodelicos"],
  ];

  for (const [regex, canonical] of heuristics) {
    if (regex.test(tradition)) {
      return { canonical: null, suggested: canonical, isCanonical: false };
    }
  }

  return { canonical: null, suggested: "outras", isCanonical: false };
}

// ============================================================================
// IDENTIFIER VALIDATORS
// ============================================================================

/**
 * DOI canonical regex — matches "10.NNNN/..." (Crossref format).
 * Allows optional "doi:" prefix and URL prefix (strips them).
 *
 * Reference: https://www.crossref.org/display-guidelines/
 */
export function isValidDoi(doi: string | null | undefined): boolean {
  if (!doi || typeof doi !== "string") return false;
  const stripped = doi
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")
    .replace(/^doi:\s*/i, "")
    .trim();
  return /^10\.\d{4,9}\/[^\s]+$/.test(stripped);
}

/**
 * PubMed ID — digits only, typically 1-8 digits (PubMed has >36M entries).
 */
export function isValidPmid(pmid: string | number | null | undefined): boolean {
  if (pmid === null || pmid === undefined) return false;
  const str = String(pmid).trim();
  return /^\d{1,8}$/.test(str);
}

/**
 * URL validator — must be http(s) and have a valid host.
 */
export function isValidUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

/**
 * Convenience wrapper for the Curation Engine — validates a CandidateArticle
 * (the engine's normalized output from sources.ts) against the gate.
 *
 * Bridges the gap between candidate-level (no content yet) and full draft.
 */
export function validateCandidate(
  candidate: CandidateArticle
): QualityCheckResult {
  return validateArticle({
    title: candidate.title,
    authors: candidate.authors ? candidate.authors.split(/,\s*/) : undefined,
    year: candidate.publishedDate
      ? parseYear(candidate.publishedDate)
      : undefined,
    doi: candidate.doi,
    pmid: candidate.pmid,
    url: candidate.url,
    summary: candidate.abstract,
    tradition: candidate.tradition,
    source: candidate.source,
    evidenceLevel: null, // engine will score semantically
    type: "SCIENTIFIC_PAPER",
  });
}

function parseYear(dateStr: string): number | undefined {
  // Handles "2024", "2024-01-15", "2024/01/15", "Jan 2024"
  const m = dateStr.match(/(\d{4})/);
  if (!m) return undefined;
  const y = parseInt(m[1], 10);
  return Number.isInteger(y) && y >= 1900 && y <= new Date().getFullYear() + 1
    ? y
    : undefined;
}

/**
 * True when the gate has any BLOCK-level failures.
 */
export function isBlocked(result: QualityCheckResult): boolean {
  return result.severity === "BLOCK";
}

/**
 * True when the gate has only WARN-level issues (no BLOCKs).
 */
export function hasWarnings(result: QualityCheckResult): boolean {
  return result.severity === "WARN";
}

/**
 * Pretty-print a gate result for logs / CLI.
 */
export function formatResult(result: QualityCheckResult): string {
  const lines: string[] = [];
  lines.push(`[QualityGate] ${result.severity} (passed=${result.passed})`);
  if (result.errors.length > 0) {
    lines.push(`  ERRORS (${result.errors.length}):`);
    for (const e of result.errors) lines.push(`    - ${e}`);
  }
  if (result.warnings.length > 0) {
    lines.push(`  WARNINGS (${result.warnings.length}):`);
    for (const w of result.warnings) lines.push(`    - ${w}`);
  }
  if (result.traditionValidation) {
    const tv = result.traditionValidation;
    lines.push(
      `  tradition: ${tv.isCanonical ? "canonical" : "non-canonical"} (suggested: ${tv.suggested ?? tv.canonical ?? "n/a"})`
    );
  }
  return lines.join("\n");
}