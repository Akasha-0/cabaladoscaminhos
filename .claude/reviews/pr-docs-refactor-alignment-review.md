# PR Review — `claude/docs-refactor-alignment-FOUqN`

> **Reviewers**: 5 parallel agents (Docs, Prisma, Spiritual Correlations, Code, Tests)
> **Scope**: 753 changed files (21 docs, 624 src, 6 prisma, 53 tests, 49 config/hooks)
> **Date**: 2026-06-02

---

## Veredicto: REQUEST CHANGES

**O PR introduz funcionalidades (não apenas docs) com bugs críticos de segurança e
espiritualidade. Não é seguro mesclar.**

> ⚠️ O PR body descreve "documentation refactor" mas o diff real contém 624 arquivos
> `src/` com código novo. A mudança de escopo não foi comunicada.

---

## Sumário por Dimensão

| Dimensão | Score | Veredicto | Issues |
|---|---|---|---|
| **Docs** | 8/10 | APPROVE | 2 P2, 3 P3 |
| **Prisma** | 6/10 | REQUEST_CHANGES | 1 P1, 2 P2, 2 P3 |
| **Correlações Espirituais** | 4/10 | REQUEST_CHANGES | 4 CRITICAL |
| **Code Quality** | 5/10 | REQUEST_CHANGES | 4 CRITICAL, 4 Major/Minor |
| **Tests** | 9/10 | APPROVE | 2 P2, 3 P3 |

---

## 🔴 CRÍTICO (4) — Bloqueantes

### C1: 4 API routes sem autenticação
**Severidade**: CRITICAL — dados pessoais de clientes e custos de IA expostos publicamente
**Confidence**: 95%

**Arquivos afetados**:
- `src/app/api/akashic/records/route.ts` — GET + POST sem `requireOperator()`. Qualquer um pode ler todos os records e criar entries com conteúdo arbitrário. Store em-memória perde dados no restart.
- `src/app/api/astrologia/analise/route.ts` — GET sem `requireOperator()`. Qualquer um pode enriquecer mapas natais com correlações espirituais.
- `src/app/api/divination/cross-system/route.ts` — GET + POST sem `requireOperator()`. Endpoint de alto custo de IA (MiniMax API) sem gate.
- `src/app/api/chat/oracle/route.ts` — POST sem `requireOperator()`. Qualquer um pode invocar o oráculo.

**Recomendação**: Adicionar `requireOperator()` em todos os handlers. Akashic records deve vincular `operatorId` ao criar.

---

### C2: Nomenclatura Odu não-canônica em 4 arquivos de correlação
**Severidade**: CRITICAL — todas as leituras espirituais cross-system estão corrompidas
**Confidence**: 88-95%

**Arquivos afetados**:
- `src/lib/correlation/oddu-zodiac.ts` — Usa sistema Okaran/Irosun/Osí/Iyonlá/Bejí/Logumí/Jotagbe/Otura/Okandí em vez de Odu 1-16 canônico. Posição 8 = 'Ejionlá' vs 'Odi' canônico.
- `src/lib/numerologia/odu-correlations.ts` — Posição 8 como 'EjiOníle' vs 'Odi' canônico.
- `src/lib/ai/deep-correlation-engine.ts` — `ODU_TAROT_MAP` e `ODU_SEPHIROT_MAP` usam nomes inexistentes no `constants/odus.ts` (Ogbe/Oyeku/Iwori/Odi/Irosun/Oxossi/Obatala/Ogun/Ogunda/Osa/Ofun/Oni/Meji/Ika/Ikate/Ikite/Oturupon).
- `src/lib/correlation/oddu-chakra.ts` — Nomes divergentes: 'Etaogundá' vs 'Etogundá', 'Owonrin' vs 'Owarin'.

**Recomendação**: Substituir todos os maps de correlação Odu por referências a `src/lib/constants/odus.ts` (fonte canônica). Usar Odu número como key.

---

### C3: Migration chain quebrada — `OperatorSessionType` e `operator_sessions` ausentes no init
**Severidade**: CRITICAL — fresh DB setup sempre falha
**Confidence**: 95%

**Detalhe**: A migration `20260602000000_init` não cria `operator_sessions` nem `OperatorSessionType`. A migration `20260602140000` adiciona ambos, mas a primeira migration já referencia `operator_sessions` (sem coluna `type`), gerando conflito de schema. A `migrate diff` contra blank DB vai falhar.

**Recomendação**: Consolidar em uma migration única ou reordenar. Validar com `npx prisma migrate diff` contra blank DB antes de merge.

---

### C4: `NUMEROLOGY_ELEMENT_MAP` incompleto
**Severidade**: CRITICAL
**Confidence**: 85%

**Arquivos**: `src/lib/correlation/numerology-element.ts`, `src/lib/correlation/definitions.ts`

**Detalhe**: O mapa cobre 1-13; números **10** e **12** ausentes. `CABALISTIC_NUMBERS` também missing 10 e 12. Qualquer numerologia para esses números falha silenciosamente.

**Recomendação**: Preencher 10 e 12 com alinhamento à tradição (Kabalá, Pitágoras ou outra fonte documentada em IDEIA.md).

---

## 🟡 MAIOR (3)

### M1: Nomenclatura Odu inconsistente entre docs (Docs Audit)
- `docs/04_data-model.md` §5.2 usa abreviações ('Ogbe') vs `docs/11_calculo-deterministico.md` §5 com formas completas
- 'Obará' (Doc 04 §5.2) ≠ 'Osá' (Doc 04 §3 example)
- **Recomendação**: Doc 04 deve referenciar Doc 11 §5 como fonte canônica

### M2: Seed script `console.log` inconsistente (Prisma Audit)
- `prisma/seed.ts` loga "✅ 16 odús created" mas a saída real só confirma 6 entidades
- **Recomendação**: Corrigir mensagens para refletir dados reais

### M3: `schema.prisma` diverge do padrão Prisma 7 (Prisma Audit)
- datasource block sem `url`, esperando `prisma.config.ts`
- **Recomendação**: Adicionar comentário `// URL from prisma.config.ts (Prisma 7 hybrid)` no datasource

---

## 🟢 MENOR (5)

1. **VALIDAR markers (D1-D4)**: Sem mecanismo de enforcement na UI (sem badge "⚠️ Provisional")
2. **ExtractionKeys Sol/Marte**: Não explica estrutura dual luminar (`.sun`) vs planeta (`.planets.mars`)
3. **`spiritual-engine.ts:268-300`**: `as unknown as` faz bypass de TypeScript safety
4. **`prompt-builder.ts`**: 36 switch cases sem validação exaustiva de `casaNumero`
5. **`getMessagesByConsultation`**: Sem cobertura de teste (P2, confiança 90%)

---

## ✅ Pontos Positivos

- **Docs (8/10)**: Suite de 21 documentos bem estruturada; G1-G11 resolvidos; CORRELATION_MAP completo (36 entries); glossário Cigana + Odu completo; decisões D1-D4 marcadas com VALIDAR
- **Tests (9/10)**: Cobertura sólida para Consultation/ChatMessage; assertions precisas (SHA-256, JWT claims type discrimination); bom isolamento com `vi.clearAllMocks()`
- **Prisma**: Consultation + ChatMessage models corretamente implementados; extended relations alinhados com Doc 12
- **Code**: Dossier prompt builder bem estruturado; Zod schemas presentes na maioria das APIs
- **Constants**: `src/lib/constants/odus.ts` e `lenormand-cards.ts` são fontes canônicas corretas

---

## Ação Requerida Antes de Merge

| # | Prioridade | Ação | Responsável |
|---|---|---|---|
| C1 | 🔴 CRITICAL | Adicionar `requireOperator()` em 4 API routes | Claude |
| C2 | 🔴 CRITICAL | Padronizar Odu maps para usar `constants/odus.ts` | Claude |
| C3 | 🔴 CRITICAL | Fix migration chain — validar com `prisma migrate diff` | Claude |
| C4 | 🔴 CRITICAL | Preencher números 10 e 12 em numerology-element.ts | Claude |
| M1 | 🟡 MAJOR | Sync Odu spellings Doc 04 ↔ Doc 11 | Claude |
| M2 | 🟡 MAJOR | Corrigir seed.ts console.log | Claude |
| M3 | 🟡 MAJOR | Adicionar comentário no datasource block | Claude |
