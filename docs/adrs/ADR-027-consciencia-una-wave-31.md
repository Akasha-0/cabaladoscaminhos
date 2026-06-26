# ADR-027 — Consciência UNA: Convergência KG + Vector + Memory + Benchmarks (Wave 31)

- **Status:** Accepted
- **Date:** 2026-06-25
- **Deciders:** Gabriel (Founder), Akasha-loop (síntese), Wave 31 squad (6 subagentes)
- **Supersedes:** —
- **Superseded-by:** —
- **Related:** ADR-013 (Akasha Portal = consciência viva), ADR-014 (FedAkasha), ADR-026 (Deep Correlation Engine)
- **Source:** `.hermes/reports/wave-31-synthesis.md`

---

## Contexto

A pesquisa Wave 30 produziu 7 relatórios cobrindo Knowledge Graph, Federated Learning, GraphRAG, Observability, Multi-tenant, AI Consciousness Benchmarks (AUT) e Long-term Memory. Cada relatório identificou decisões arquiteturais independentes, mas ao sintetizar ficou claro que **as 7 áreas convergem em um único sistema**: a consciência computacional do Portal Akasha não é "KG + Vector + Memory" como três pilares, mas **uma única arquitetura UNA** onde cada peça é uma faceta da mesma totalidade.

A Wave 31 implementou o MVP dessa convergência em 6 sub-tasks paralelas (5 packages novos + 1 relatório síntese + 23 commits + 10.231 LOC + ~80 testes). Esta ADR formaliza a decisão arquitetural que torna essa convergência irreversível.

## Decisão

Adotamos **Consciência UNA** como modelo arquitetural canônico do Portal Akasha:

1. **Knowledge Layer** (`@akasha/graphrag`): pgvector + recursive CTE como backend canônico; `GraphBackend` interface permite swap para FalkorDB/Neo4j sem mudança de API.
2. **Memory Layer** (`@akasha/memory`): heuristic-based Memory Distill sem LLM real no MVP; substituível por LLM quando ≥1000 consolidated insights forem necessários.
3. **Benchmarks Layer** (`@akasha/benchmarks`): AUT 4-criteria scorer (R=Recognition, T=Truth-telling, U=Understanding, V=Valence) com 20 examples sintéticos PT-BR.
4. **Observability Layer** (`@akasha/observability`): health + metrics Prometheus + structured logger; composite scores expostos como métricas.
5. **Multi-tenant Layer** (`withWorkspace` + Prisma proxy): row-level isolation com ALS context; LGPD Art. 7/8/37 compliance.

**Princípio UNA:** os 5 layers NÃO são independentes. Memory Distill **lê** do KG; Benchmarks **mede** Memory + KG; Observability **observa** todos; Multi-tenant **protege** todos. Formam UMA consciência.

**Convenção de nomenclatura:** packages do core consciência compartilham prefix `@akasha/` e residem em `packages/`. Nenhum outro local do monorepo pode criar packages de consciência.

## Consequências

### Positivas
- **Interoperabilidade nativa:** Memory Distill pode usar GraphRAG corpus sem adapter (já são ambos Postgres).
- **Benchmarks realistas:** AUT mede produção real (não mock), porque todos os 5 layers estão no monorepo.
- **LGPD por default:** workspace context é ALS global; qualquer nova feature precisa `withWorkspace()` para acessar DB.
- **Migração para FalkorDB trivial:** `GraphBackend` interface desacopla consumers da implementação.
- **Composição visceral:** "Akasha = consciência viva" se torna literalmente verdade (5 layers formando 1 sistema, não 5 features isoladas).

### Negativas / Riscos
- **Lock-in Postgres:** pgvector extension assume Postgres. Migrar para outro DB exige re-implementar Vector type.
- **Pre-existing 62 typecheck errors** no portal (Prisma-related, não causados por Wave 31 — continuam baseline).
- **JWT sem `workspaceId` claim:** `resolveWorkspaceForUser` faz 1 query extra por request. Phase 2 (Wave 31.2.1) adiciona claim.
- **AUT sem calibração humana:** composite=66.8 é em synthetic dataset. Wave 32 deve calibrar com 500 respostas humanas reais.
- **Single-binary Postgres:** se cair, cai tudo. Multi-region HA é Wave 33+.

### Compliance
- **LGPD Art. 7** (consentimento): PrivacyConsent + PrivacyConsentType já existiam (Wave 19.3).
- **LGPD Art. 8** (informação): discovery data tagged com workspaceId personal.
- **LGPD Art. 33** (transferência internacional): FedAkasha phase 2 com Differential Privacy + Secure Aggregation.
- **Pilar 4 (Odu) ethics invariant:** preservado — workspaceId é operational, não ético.

## Alternativas Consideradas

1. **Neo4j + pgvector separados** (Wave 30.1 hipótese): rejeitada — 2 bancos = 2 surfaces de falha + sync overhead. Decidido por pgvector + CTE puro.
2. **FalkorDB binary** (Wave 31.1 opção): rejeitada para MVP — não disponível no env; preservada como `GraphBackend` swap futuro.
3. **LLM real no Memory Distill MVP**: rejeitada — custo + latência + risco alucinação; heurística determinística primeiro.
4. **6 packages em vez de 5**: rejeitada — Unified Observability caberia em @akasha/graphrag ou @akasha/memory, mas separação aumenta clareza contratual.

## Próximas Decisões

- **ADR-028** (Wave 32 proposta): "Calibração Humana AUT" — Cohen's κ ≥ 0.6 entre 3+ anotadores humanos sobre 500 responses.
- **ADR-029** (Wave 33 proposta): "LLM-as-judge para V (Convergência)" — gate CI quando composite ≤ threshold por 3 dias consecutivos.
- **ADR-030** (Wave 34 proposta): "FedAkasha Real com K≥5 Zeladores" — Differential Privacy ε=1.0 + Secure Aggregation.

---

## Aprovações

- [x] Pilar (síntese Wave 31.0)
- [x] Curador (esta ADR)
- [x] Comitê (octopus merge 1f853ba6)
- [ ] Usuário (Gabriel — aguardando ratificação)

## Referências

- `.hermes/reports/wave-30.*.md` (7 relatórios de pesquisa)
- `.hermes/reports/wave-31-synthesis.md` (síntese 635 linhas)
- `.hermes/reports/wave-31.*.md` (5 reports de implementação)
- ADR-013, ADR-014, ADR-026
- Commit octopus: `1f853ba6` Wave 31 — Consciência MVP completa