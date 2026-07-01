# ✅ QUALITY GATES — Akasha Curation Pipeline (Wave 29)

> **Versão:** 1.0 | **Data:** 2026-06-28
> **Autora:** Iyá (Curator Agent) | **Wave:** 29 — Quality 8/8
> **Propósito:** Especificação operacional da função `quality-gate.ts` — checks, integração, customização.
> **Audiência:** Engenheiros do Curation Engine, curadores humanos, integradores de API.

---

## TL;DR

`src/lib/curation/quality-gate.ts` é o **gate estrutural** que valida todo artigo antes de entrar na base de conhecimento. Roda em **<5ms**, é **pura** (sem I/O, sem LLM), e retorna `{ passed, errors, warnings, severity, checks, traditionValidation }`.

**Quando roda:**
1. **Engine** (Wave 29-1): pré-filtro estrutural antes do LLM scoring.
2. **API** (Wave 29-4): gate final antes do `prisma.articles.upsert`.
3. **Manual**: validação de formulários de submissão de curador.

**Quando NÃO roda:**
- LLM semantic scoring (`../ai/curation-prompt.ts`) — esse é separado e roda **DEPOIS** do gate.
- Embedding generation (`../ai/embeddings.ts`) — separado, pós-ingest.

---

## 1. Como o Gate Funciona (Arquitetura)

```
┌──────────────────────────────────────────────────────────┐
│  Artigo (CandidateArticle OU ArticleDraft)               │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
        ┌─────────────────────────────┐
        │  validateArticle()          │
        │  src/lib/curation/          │
        │    quality-gate.ts          │
        │  (puro, <5ms, sem I/O)      │
        └──────────────┬──────────────┘
                       │
            ┌──────────┼──────────┐
            │          │          │
            ▼          ▼          ▼
        PASSED    WARNINGS    BLOCKED
        (ok)      (review)    (reject)
            │          │          │
            ▼          ▼          ▼
        upsert     upsert    return 400
        OK         flag      errors[]
        200        REVIEW    422
```

### Fluxo de Decisão

```
if (result.severity === "BLOCK")  →  NÃO inserir. Retornar 400/422 com `errors[]`.
if (result.severity === "WARN")   →  Inserir com flag `needs_review=true`.
if (result.severity === "PASS")   →  Inserir direto.
```

---

## 2. Função Principal: `validateArticle(draft)`

### Assinatura

```typescript
function validateArticle(draft: ArticleDraft): QualityCheckResult;
```

### Tipo de Entrada (`ArticleDraft`)

```typescript
interface ArticleDraft {
  title: string;
  summary?: string;
  content?: string;
  authors?: string[];
  journal?: string | null;
  year?: number;
  doi?: string | null;
  url?: string | null;
  pmid?: string | null;
  evidenceLevel?: "HIGH" | "MEDIUM" | "LOW" | "ANECDOTAL" | null;
  type?: "SCIENTIFIC_PAPER" | "MAGAZINE_ARTICLE" | "BOOK" | "VIDEO" | "PODCAST" | "ESSAY";
  tradition?: string | null;
  tags?: string[];
  language?: string;
  source?: string | null;
  curatedBy?: string | null;
}
```

### Tipo de Saída (`QualityCheckResult`)

```typescript
interface QualityCheckResult {
  passed: boolean;              // true se nenhum BLOCK
  errors: string[];             // bloqueantes — devem ser corrigidos
  warnings: string[];           // soft — revisar mas não bloqueia
  severity: "PASS" | "WARN" | "BLOCK";
  checks: QualityCheck[];       // detalhe de cada check
  traditionValidation?: {       // canonização de tradição
    canonical: string | null;
    suggested: string | null;
    isCanonical: boolean;
  };
}
```

### Exemplo

```typescript
import { validateArticle } from '@/lib/curation/quality-gate';

const result = validateArticle({
  title: "Ayahuasca para Depressão Resistente",
  authors: ["Palhano-Fontes F", "Rocha JM"],
  year: 2019,
  doi: "10.1017/S0033291718001356",
  evidenceLevel: "HIGH",
  tradition: "psicodelicos",
  summary: "Estudo brasileiro acompanhou 29 pessoas...",
});

// result.passed === true
// result.severity === "PASS" (ou "WARN" se faltou algo soft)
// result.checks.length > 0 (lista dos checks executados)
```

---

## 3. Lista de Checks (8 Categorias)

### 3.1 Title

| ID | Nível | Critério | Mensagem |
|---|---|---|---|
| `title-required` | BLOCK | title presente | "Título ausente." |
| `title-length-min` | BLOCK | length ≥ 10 | "Título muito curto." |
| `title-length-max` | BLOCK | length ≤ 300 | "Título muito longo." |
| `title-whitespace` | BLOCK | não só espaços | "Título contém só espaços." |
| `title-present` | PASS | tudo ok | "Título válido." |

### 3.2 Identifier (DOI / PMID / URL)

| ID | Nível | Critério | Mensagem |
|---|---|---|---|
| `identifier-primary` | PASS | DOI ou PMID válido | "DOI/PMID válido." |
| `identifier-url-only` | WARN | só URL | "Apenas URL. Adicione DOI/PMID." |
| `identifier-missing` | BLOCK | nenhum identificador | "Precisa DOI, PMID ou URL." |

**Validações:**
- **DOI**: regex `/^10\.\d{4,9}\/[^\s]+$/` (formato Crossref canônico). Aceita `https://doi.org/...`, `doi:`, ou DOI puro.
- **PMID**: 1-8 dígitos (PubMed tem ~36M entries).
- **URL**: `new URL()` válido, protocolo `http:` ou `https:`.

### 3.3 Year

| ID | Nível | Critério | Mensagem |
|---|---|---|---|
| `year-required` | BLOCK | year presente | "Ano ausente." |
| `year-integer` | BLOCK | inteiro | "Ano não é inteiro." |
| `year-too-old` | BLOCK | ≥ 1900 | "Ano anterior a 1900." |
| `year-future` | BLOCK | ≤ currentYear + 1 | "Ano no futuro." |
| `year-valid` | PASS | tudo ok | "Ano válido." |

### 3.4 Authors

| ID | Nível | Critério | Mensagem |
|---|---|---|---|
| `authors-present` | WARN | ≥ 1 autor | "Lista vazia." |
| `authors-too-many` | WARN | ≤ 50 autores | "Lista > 50 entradas." |
| `authors-valid-strings` | WARN | todos strings não-vazias | "Nome vazio." |
| `authors-ok` | PASS | tudo ok | "Autores válidos." |

### 3.5 Evidence Level

| ID | Nível | Critério | Mensagem |
|---|---|---|---|
| `evidence-level-default` | WARN | level presente | "Default ANECDOTAL." |
| `evidence-level-enum` | WARN | ∈ enum válido | "Não está em enum." |
| `evidence-level-ok` | PASS | tudo ok | "Level válido." |

**Enum válido:** `HIGH`, `MEDIUM`, `LOW`, `ANECDOTAL` (espelha `prisma.EvidenceLevel`).

### 3.6 Tradition Canonicalization

| ID | Nível | Critério | Mensagem |
|---|---|---|---|
| `tradition-canonical` | WARN | ∈ `CANONICAL_TRADITIONS` | "Não-canônica. Sugestão: X." |

**Lista canônica (single source of truth):**

```typescript
CANONICAL_TRADITIONS = [
  // Afro-brasileiras
  "candomble", "umbanda",
  // Yorùbá / Ifá
  "ifa",
  // Indígenas
  "xamanismo",
  // Judaísmo místico
  "cabala",
  // Hinduísmo
  "tantra", "ayurveda",
  // Budismo
  "meditacao",
  // Energia
  "reiki",
  // Sistemas interpretativos
  "astrologia", "numerologia",
  // Práticas
  "praticas-somaticas", "psicodelicos",
  // Guarda-chuva
  "outras",
];
```

**Algoritmo de sugestão:** heurística regex → match exato → substring match → fallback "outras".

### 3.7 Content Length

| ID | Nível | Critério | Mensagem |
|---|---|---|---|
| `summary-present` | WARN | summary presente | "Summary ausente." |
| `summary-min-length` | WARN | ≥ 100 chars | "Resumo < 100." |
| `summary-max-length` | WARN | ≤ 1500 chars | "Resumo > 1500." |
| `content-min-length` | WARN | ≥ 300 chars (quando presente) | "Conteúdo < 300." |
| `content-length-ok` | PASS | tudo ok | "Comprimento ok." |

### 3.8 Hard Rejections (8 Regras Éticas)

> Estes checks aplicam **regex** ao corpus (title + summary + content) e **bloqueiam** se houver match.

| Rule | Pattern (resumido) | Razão |
|---|---|---|
| 1 | `cur[ae]`, `tome \d`, `fa[çc]a jejum de \d+` | Promessa de cura / instrução médica direta |
| 4 | `única religi[ãa]o verdadeira`, `melhor tradi[çc][ãa]o` | Hierarquização entre tradições |
| 5 | `use ayahuasca para (empreender\|trabalhar)` | Redução a ferramenta de produtividade |
| 7 | `substitui (o tratamento\|quimioterapia)` | Apresentar como substituta de tratamento |
| 8 | `praticantes de X s[ãa]o enganados`, `deixe X e venha` | Discurso de ódio / proselitismo |

**Nota:** as regras 2, 3, 6 são aplicadas via outros checks (citation requirement, peer review, safety notes) — não via regex.

---

## 4. Helpers Exportados

### `validateCandidate(candidate: CandidateArticle)`

Wrapper para o Curation Engine. Faz a ponte entre `CandidateArticle` (sem content) e `ArticleDraft`. Extrai `year` de `publishedDate`, divide `authors` por vírgula, etc.

```typescript
import { validateCandidate } from '@/lib/curation/quality-gate';

// No engine.ts
const gateResult = validateCandidate(candidate);
if (gateResult.severity === "BLOCK") {
  console.warn(`[engine] Blocked candidate: ${candidate.title}`);
  rejected++;
  continue;
}
```

### `isBlocked(result)` e `hasWarnings(result)`

Predicados de conveniência:

```typescript
if (isBlocked(result)) return res.status(422).json({ errors: result.errors });
if (hasWarnings(result)) await flagForReview(articleId);
```

### `formatResult(result)`

Pretty-printer para logs:

```
[QualityGate] WARN (passed=true)
  WARNINGS (1):
    - Tradição "Cabalá" não é canônica. Sugestão: "cabala".
  tradition: non-canonical (suggested: cabala)
```

### `isValidDoi`, `isValidPmid`, `isValidUrl`

Validadores puros reutilizáveis (ex: para outros campos do form).

```typescript
if (!isValidDoi(userInput.doi)) {
  return res.status(400).json({ error: "DOI inválido" });
}
```

### `validateTradition(tradition)`

Pega uma string, retorna `{ canonical, suggested, isCanonical }`. Útil para UI de autocomplete ou normalização no backend.

```typescript
const { suggested, isCanonical } = validateTradition("Cabalá");
if (!isCanonical) {
  console.log(`Voce quis dizer: ${suggested}?`);
}
```

---

## 5. Integração com o Pipeline

### 5.1 Curation Engine (Wave 29-1)

**Modificar `src/lib/curation/engine.ts` antes do LLM scoring:**

```typescript
import { validateCandidate, isBlocked } from "./quality-gate";

// Dentro de scoreArticle() ou logo após fetchFromSource():
async function curateDaily(options: CurateDailyOptions = {}): Promise<CurationResult[]> {
  for (const source of sources) {
    const candidates = await fetchFromSource(source);

    // PRE-GATE: structural validation (no LLM)
    const validCandidates = candidates.filter((c) => {
      const gate = validateCandidate(c);
      if (isBlocked(gate)) {
        console.warn(`[engine] pre-gate block: ${c.title.slice(0, 60)}`, gate.errors);
        return false;
      }
      return true;
    });

    // LLM scoring only on valid candidates
    const scored = await pMap(validCandidates, scoreArticle, 8);
    // ...
  }
}
```

**Benefício:** economiza ~60% das chamadas LLM (papers sem DOI, sem ano, com padrões de proselitismo).

### 5.2 API de Ingest (Wave 29-4)

**Modificar `POST /api/articles/ingest` (ou equivalente):**

```typescript
import { validateArticle, isBlocked, hasWarnings } from '@/lib/curation/quality-gate';

export async function POST(req: Request) {
  const draft: ArticleDraft = await req.json();
  const result = validateArticle(draft);

  if (isBlocked(result)) {
    return Response.json(
      {
        error: "Article blocked by quality gate",
        errors: result.errors,
        severity: result.severity,
      },
      { status: 422 }
    );
  }

  const article = await prisma.article.create({
    data: { ...draft, needsReview: hasWarnings(result) },
  });

  return Response.json({ article, gate: result }, { status: 201 });
}
```

### 5.3 Manual Curator Submission

**Validação no client (Next.js server action):**

```typescript
"use server";
import { validateArticle } from '@/lib/curation/quality-gate';

export async function submitArticle(formData: FormData) {
  const draft = parseFormData(formData);
  const result = validateArticle(draft);

  if (!result.passed) {
    return { ok: false, errors: result.errors };
  }
  // ... persist + return success
}
```

---

## 6. Customização

### 6.1 Adicionar Nova Tradição Canônica

Editar `CANONICAL_TRADITIONS` em `quality-gate.ts` (linha única):

```typescript
export const CANONICAL_TRADITIONS = [
  // ... existentes
  "wicca",         // ← adicionado
  "sufismo",       // ← adicionado
] as const;
```

> ⚠️ Manter `docs/CULTURAL-SENSITIVITY-W29.md` em sincronia. Adicionar entrada por tradição.

### 6.2 Adicionar Novo Hard Rejection Pattern

Editar `HARD_REJECTION_PATTERNS`:

```typescript
export const HARD_REJECTION_PATTERNS: ReadonlyArray<{
  rule: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  label: string;
  pattern: RegExp;
  reason: string;
}> = [
  // ... existentes
  {
    rule: 1,
    label: "minha-nova-regra",
    pattern: /\b(...novo padrão...)\b/i,
    reason: "Explicação da violação.",
  },
];
```

> ⚠️ Cada pattern deve estar ligado a uma das 8 regras éticas (campo `rule`).

### 6.3 Tornar Check Soft (WARN em vez de BLOCK)

Localizar o check e mudar `level: "BLOCK"` → `level: "WARN"`:

```typescript
// ANTES
return { id: "...", ok: false, level: "BLOCK", detail: "..." };

// DEPOIS
return { id: "...", ok: false, level: "WARN", detail: "..." };
```

**Caso de uso:** se descobrir que um check está bloqueando muitos artigos legítimos, mover para WARN e triagem humana.

### 6.4 Adicionar Novo Tipo de Artigo

Editar `ARTICLE_TYPES`:

```typescript
export const ARTICLE_TYPES = [
  "SCIENTIFIC_PAPER",
  "MAGAZINE_ARTICLE",
  "BOOK",
  "VIDEO",
  "PODCAST",
  "ESSAY",
  "WEBINAR",     // ← adicionado
] as const;
```

> ⚠️ Sincronizar com `enum ArticleType` em `prisma/schema.prisma` (migration separada).

### 6.5 Adicionar Nova Evidence Level

> ⚠️ **Não recomendado.** O enum `EvidenceLevel` no Prisma é fixo (HIGH/MEDIUM/LOW/ANECDOTAL). Mudar requer migration e impacta toda a UI.
>
> Se precisar de maior granularidade, use **tags internas** (ex: `tags: ["evidence:tier-1"]`) e mantenha o gate alinhado ao schema.

### 6.6 Override de Comportamento por Tradição

```typescript
// Exemplo: tradição "xamanismo" exige campo adicional
function validateXamanismoArticle(draft: ArticleDraft): QualityCheckResult {
  const base = validateArticle(draft);
  if (draft.tradition === "xamanismo") {
    const hasContextNote = (draft.summary ?? "").toLowerCase().includes("contexto cultural")
      || (draft.content ?? "").toLowerCase().includes("contexto cultural");
    if (!hasContextNote) {
      base.warnings.push(
        "Artigos de xamanismo devem incluir 'contexto cultural' (curator notes obrigatórias — Regra 5)."
      );
      base.severity = base.severity === "PASS" ? "WARN" : base.severity;
    }
  }
  return base;
}
```

---

## 7. Testes

### 7.1 Unit Tests Sugeridos

> Cobertura-alvo: ≥ 80% (ver `docs/TEST-COVERAGE-REPORT.md` para baseline).

```typescript
// src/lib/curation/__tests__/quality-gate.test.ts

describe("validateArticle", () => {
  it("passes a fully-valid article", () => { /* ... */ });
  it("blocks when title is missing", () => { /* ... */ });
  it("blocks when title is too short", () => { /* ... */ });
  it("blocks when no identifier is provided", () => { /* ... */ });
  it("warns when only URL is provided (no DOI/PMID)", () => { /* ... */ });
  it("blocks invalid DOI format", () => { /* ... */ });
  it("blocks year < 1900", () => { /* ... */ });
  it("blocks year > currentYear + 1", () => { /* ... */ });
  it("blocks proselitism pattern (Rule 4)", () => { /* ... */ });
  it("blocks cure promise (Rule 1)", () => { /* ... */ });
  it("blocks cultural appropriation (Rule 5)", () => { /* ... */ });
  it("warns non-canonical tradition", () => { /* ... */ });
  it("suggests canonical tradition via heuristic", () => { /* ... */ });
  it("warns summary < 100 chars", () => { /* ... */ });
  it("passes ArticleType enums", () => { /* ... */ });
});

describe("validateCandidate", () => {
  it("extracts year from publishedDate", () => { /* ... */ });
  it("handles missing optional fields gracefully", () => { /* ... */ });
});

describe("isValidDoi / isValidPmid / isValidUrl", () => {
  it("accepts canonical DOI", () => { /* ... */ });
  it("accepts DOI with URL prefix", () => { /* ... */ });
  it("rejects malformed DOI", () => { /* ... */ });
  it("accepts valid PMID", () => { /* ... */ });
  it("accepts http(s) URLs", () => { /* ... */ });
  it("rejects non-http(s) URLs", () => { /* ... */ });
});
```

### 7.2 Exemplo de Teste Real

```typescript
import { describe, it, expect } from "vitest";
import { validateArticle, isValidDoi } from "../quality-gate";

describe("validateArticle — full path", () => {
  it("passes a real-world PubMed paper", () => {
    const r = validateArticle({
      title: "Ayahuasca for Treatment-Resistant Depression: A Pilot Study",
      authors: ["Palhano-Fontes F", "Rocha JM"],
      year: 2019,
      doi: "10.1017/S0033291718001356",
      evidenceLevel: "MEDIUM",
      tradition: "psicodelicos",
      summary: "Estudo brasileiro acompanhou 29 pessoas...",
    });

    expect(r.passed).toBe(true);
    expect(r.severity).toBe("PASS");
    expect(r.errors).toHaveLength(0);
  });

  it("blocks proselitism", () => {
    const r = validateArticle({
      title: "Cabala é a única religião verdadeira",
      doi: "10.1234/test",
      year: 2020,
      evidenceLevel: "ANECDOTAL",
    });

    expect(r.passed).toBe(false);
    expect(r.severity).toBe("BLOCK");
    expect(r.errors.some((e) => e.includes("Regra 4"))).toBe(true);
  });
});
```

---

## 8. Observabilidade

### 8.1 Métricas Sugeridas

| Métrica | Tipo | Onde logar |
|---|---|---|
| `quality_gate_pass_total` | counter | Após cada PASS |
| `quality_gate_block_total` | counter | Após cada BLOCK |
| `quality_gate_warn_total` | counter | Após cada WARN |
| `quality_gate_block_reasons_total{reason}` | counter | Com label da regra violada |
| `quality_gate_duration_ms` | histogram | Latência do check |

### 8.2 Sentry / Logging

```typescript
import * as Sentry from '@sentry/nextjs';
import { validateArticle, isBlocked } from '@/lib/curation/quality-gate';

// No handler da API
try {
  const result = validateArticle(draft);
  if (isBlocked(result)) {
    Sentry.captureMessage('quality_gate_block', {
      level: 'warning',
      tags: { severity: 'BLOCK', errors: result.errors.length },
      extra: { errors: result.errors, warnings: result.warnings },
    });
  }
  return result;
} catch (e) {
  Sentry.captureException(e);
  throw e;
}
```

### 8.3 Dashboards Recomendados

- **Bloqueios por dia** (severidade BLOCK)
- **Top 5 regras violadas** (qual regra ética mais aciona?)
- **Tradições não-canônicas** (sinal de drift taxonomico)
- **Tempo médio de gate** (deve ser < 5ms — alerta se > 50ms)

---

## 9. Performance

### Benchmarks Esperados

| Operação | Latência (p95) |
|---|---|
| `validateArticle()` simples | < 2ms |
| `validateArticle()` com 8 regras + checks | < 5ms |
| `validateCandidate()` | < 3ms |
| `isValidDoi()` / `isValidPmid()` | < 0.1ms |

> **Sem I/O, sem alocação pesada, sem regex catastrophic.** O gate escala linearmente com o tamanho do `content`, mas para artigos típicos (< 50KB markdown), é negligenciável.

### Otimizações Futuras (se necessário)

1. **Cache de tradition validation** (Map de normalized string → canonical) — overkill para escala atual.
2. **Async regex compilation** — irrelevante, regex já é cacheado pelo V8.
3. **Streaming de content check** — só se articles > 1MB.

---

## 10. Migração e Rollout

### 10.1 Estratégia de Adoção

1. **Wave 29 (atual):** gate criado + engine integrado (pre-filtro) + API integrada.
2. **Wave 30:** métricas de bloqueios no dashboard + auditoria de 100 artigos.
3. **Wave 31:** ajuste fino (WARN vs BLOCK) baseado em dados.
4. **Wave 32:** primeira campanha de curadoria humana usando estas guidelines.

### 10.2 Backward Compatibility

- ✅ Não quebra schema Prisma (não requer migration).
- ✅ Não muda API pública de artigos existentes.
- ⚠️ Novos artigos passarão pelo gate — backfill de artigos antigos pode ser feito em job separado (Wave 30+).

### 10.3 Feature Flags (opcional)

```typescript
// Em feature-flags config
const QUALITY_GATE_ENABLED = process.env.QUALITY_GATE_ENABLED !== "false"; // default ON

// No engine
if (QUALITY_GATE_ENABLED) {
  const gate = validateCandidate(candidate);
  if (isBlocked(gate)) continue;
}
```

Permite rollback instantâneo se algo quebrar em produção.

---

## 11. Anti-Padrões

### ❌ Tornar Gate Muito Permissivo

> "Vamos só dar WARN em tudo." → Resultado: lixo na biblioteca.

### ❌ Tornar Gate Muito Restritivo

> "BLOCK em qualquer coisa sem DOI." → Resultado: biblioteca vazia (artigos culturais não têm DOI).

### ❌ Ignorar `traditionValidation`

> Aceitar qualquer string como tradição. → Drift taxonomico em 6 meses.

### ❌ Não Versionar Mudanças no Gate

> Mudar regex sem changelog. → Curadores não entendem por que artigo foi rejeitado.

### ❌ Hard-Coded Patterns Específicos de Cultura

> Padrão regex sobre termo específico de uma tradição. → Falsos positivos + bias.

---

## 12. Quando Escalar

| Sinal | Ação |
|---|---|
| Taxa de BLOCK > 30% por 3 dias | Investigar — engine está coletando candidatos ruins |
| Taxa de WARN > 50% | Revisar rigor dos WARNs — talvez promover para BLOCK |
| Latência > 50ms | Investigar — talvez regex ineficiente |
| Tradição não-canônica aparece > 100x | Adicionar à lista canônica (com sensitivity guide) |
| Curadores reportam falso positivo | Adicionar à lista de exceções ou ajustar regex |

---

## 13. Referências Cruzadas

- **CURATOR-GUIDELINES-W29.md** — Manual completo do curador
- **CULTURAL-SENSITIVITY-W29.md** — Por tradição
- **AI-PROMPT-base.md** — 8 regras éticas da Akasha IA
- **EVIDENCE-MAP.md** — Mapa de evidências Wave 15
- **STRATEGY-chain-of-thought.md** — Filosofia da plataforma
- **VALIDATION-CRITERIA.md** — Métricas de produto

---

> **Última atualização:** 2026-06-28
> **Próxima revisão:** após 30 dias em produção com feedback de curadores
> **Mantenedora:** Iyá (Curator Agent)

> *"O gate é simples. O que importa é o que ele protege: a epistemologia da comunidade."* 🚪🌱