# Wave 29 — Evidence Seed 3/8 — Deliverable

## Status

✅ **DELIVERED** — Arquivos criados. ⚠️ Commit pendente (sandbox git hang — ver §4).

---

## 1. Arquivos criados

| Arquivo                                      | Tamanho  | Conteúdo                          |
| -------------------------------------------- | -------- | --------------------------------- |
| `prisma/seeds/articles-seed.json`            | 44665 B  | 34 artigos, 10 tradições          |
| `prisma/seeds/seed-articles.ts`              | 8327 B   | Script idempotente com mapping    |
| `docs/EVIDENCE-SEED-W29.md`                  | 12915 B  | Curadoria + workflow + disclaimer |
| `docs/WAVE29-DELIVERABLE.md`                 | este     | Status + comandos para commitar   |

---

## 2. Inventário (34 artigos em 10 tradições)

| Tradição                    | Qtd | HIGH | MEDIUM | LOW | ANECDOTAL |
| --------------------------- | --- | ---- | ------ | --- | --------- |
| Reiki / PNPIC               | 4   | 2    | 2      | 0   | 0         |
| Ayahuasca                   | 3   | 1    | 2      | 0   | 0         |
| Psilocybina                 | 5   | 3    | 2      | 0   | 0         |
| Ibogaína                    | 3   | 1    | 2      | 0   | 0         |
| Meditação / MBSR            | 4   | 2    | 2      | 0   | 0         |
| Cannabis / CBD              | 3   | 3    | 0      | 0   | 0         |
| Breathwork (Wim Hof, etc.)  | 3   | 1    | 1      | 1   | 0         |
| Kambo / Sananga             | 4   | 0    | 3      | 1   | 0         |
| Astrologia / Numerologia    | 4   | 0    | 2      | 0   | 2         |
| Kava                        | 1   | 1    | 0      | 0   | 0         |
| **TOTAL**                   | **34** | **14** | **16** | **2** | **2**  |

---

## 3. Critérios Honrados

- ✅ Cada artigo tem **DOI/PMID/URL real verificável**
- ✅ Resumo em **PT-BR leigo** (~200 palavras)
- ✅ **Nível de evidência GRADE-aligned** (enum Prisma `EvidenceLevel`)
- ✅ **Notas de segurança** em todos os artigos de tradição ativa
- ✅ **CuratorNotes** com limitações metodológicas e conflitos de interesse
- ✅ **Numerologia e Astrologia** marcadas como ANECDOTAL — honestidade epistêmica
- ✅ **Disclaimer ético** em `docs/EVIDENCE-SEED-W29.md`
- ✅ Script **idempotente** (upsert por slug, hash de proveniência)
- ✅ Sem prosselitismo, sem proselitismo invertido (negação a priori)

---

## 4. ⚠️ Commit Pendente — Sandbox Git Hang

Conforme documentado em memória (Wave W28, 2026-06-27):

> "When working in `/workspace/cabaladoscaminhos`, `git add -A` and
> `git rev-parse HEAD` and similar commands can hang indefinitely.
> Workaround: skip the commit in-task, document the exact
> `git add <files> + git commit -m "..."` command in the deliverable,
> and let the user run it locally."

`git status --short` timed out at 60s e 120s nesta sessão. **Não bloqueei
a tarefa em git**. Para commitar localmente:

```bash
cd /workspace/cabaladoscaminhos

# 1. Scope-check (verifique que não pegou arquivos de sessões paralelas)
git status --short

# 2. Adicionar APENAS meus 3 arquivos (mais o WAVE29-DELIVERABLE.md)
git add prisma/seeds/articles-seed.json
git add prisma/seeds/seed-articles.ts
git add docs/EVIDENCE-SEED-W29.md
git add docs/WAVE29-DELIVERABLE.md

# 3. Confirmar staged
git status --short

# 4. Commitar com mensagem Conventional Commits
git commit -m "feat(content): 34 evidence-based articles seed W29

- prisma/seeds/articles-seed.json: 34 artigos (10 tradições) com DOI/PMID real
- prisma/seeds/seed-articles.ts: idempotente, mapeia JSON para EvidenceLevel Prisma
- docs/EVIDENCE-SEED-W29.md: curadoria, pirâmide de evidência, disclaimer ético
- Princípios: GRADE-aligned, sem inventar dados, sem proselitismo

Curator: Iyá · Wave 29 · 2026-06-28"

# 5. Push (branch protection no main, então usar branch dedicado)
# Sugestão: branch w29/evidence-seed-3
git checkout -b w29/evidence-seed-3
git push origin w29/evidence-seed-3
# (ou abrir PR de w29 → main, conforme governança)
```

---

## 5. Verificações Recomendadas

Após rodar o seed, validar:

```bash
# Contagem
pnpm tsx prisma/seeds/seed-articles.ts
# Esperado: "Criados: 34" (ou "Atualizados: 34" se já rodou antes)

# Sanity-check no DB
pnpm prisma studio
# Tabela articles → filtrar por tags contendo 'W29' ou
# search por tradição (reiki, xamanismo, meditacao, ayurveda)
```

---

## 6. Próximos Passos (W30+)

- **W30** — Tradições afro-brasileiras (Candomblé, Umbanda, Ifá)
- **W31** — Cabala, Tantra, Taoísmo — fontes primárias
- **W32** — Mesa Real Cigano Ramiro — método pessoal
- **W33** — IA prompts — curadoria com fontes citadas
- **W34** — Auditoria cruzada por praticantes reconhecidos

---

**Iyá (Curator) · Wave 29 · 2026-06-28 · Akasha Portal**
*Ver: `docs/EVIDENCE-SEED-W29.md` para curadoria completa.*