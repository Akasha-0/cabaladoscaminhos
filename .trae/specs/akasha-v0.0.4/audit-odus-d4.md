---
name: audit-odus-d4
description: Read-only survey (SubTask 3.1) of proveniência across 16 Odus in grimoire/ancestral/. Establishes baseline for SubTasks 3.2-3.6.
metadata:
  node_type: spec-audit
  type: project
  cycle: 349
  source: docs/20_governanca-conteudo-oracular.md §3 AD-20.3 + §5 AD-20.6
  relatedTasks: .trae/specs/akasha-v0.0.4/tasks.md Task 3
---

# Audit D4 — Proveniência dos 16 Odus (SubTask 3.1)

**Data:** 2026-06-07 | **Modo:** read-only survey | **Escopo:** `grimoire/ancestral/odu-*.md` (16 arquivos)

**Contexto regulatório:**
- Doc 20 AD-20.3 — proveniência é **campo estruturado** (machine-readable), não comentário.
- Doc 20 AD-20.6 — Glossário (Odu) ganha `lineage: string` (linhagem/fonte do significado) e `provisional?: boolean`.
- Doc 15 §1 — atualmente carrega `⚠️ PROVISIONAL (D4)` no cabeçalho da tabela dos 16 Odus.
- Regra de ouro `correspondence-source.md` + AGENTS.md §5 — não inventar correspondências.

---

## 1. Schema esperado por Odu (AD-20.3 / AD-20.6)

Cada `grimoire/ancestral/odu-NN-*.md` deve carregar, no frontmatter YAML, **além** dos campos atuais:

```yaml
source:    "<livro, autor, edição, página — Doc 20 AD-20.3>"
lineage:   "<Yorubá | Ifá | Candomblé | Umbanda | Merindilogun | outra tradição>"
provisional: true|false  # AD-20.4 — explícito até validação (D4)
```

O `source` deve ser **rastreável** (livro/autor ou tradição oral verificável), nunca uma vaga do tipo "tradição Yorubá" sem obra de referência.

---

## 2. Tabela de auditoria — estado atual

| # | Arquivo | `source:` | `lineage:` | `provisional:` | Status |
|---|---------|:---:|:---:|:---:|--------|
| 01 | `odu-01-ogbe.md` | ❌ | ❌ | ❌ | SEM proveniência |
| 02 | `odu-02-oyeku.md` | ❌ | ❌ | ❌ | SEM proveniência |
| 03 | `odu-03-iwori.md` | ❌ | ❌ | ❌ | SEM proveniência |
| 04 | `odu-04-odi.md` | ❌ | ❌ | ❌ | SEM proveniência |
| 05 | `odu-05-irosun.md` | ❌ | ❌ | ❌ | SEM proveniência |
| 06 | `odu-06-owonrin.md` | ❌ | ❌ | ❌ | SEM proveniência |
| 07 | `odu-07-obara.md` | ❌ | ❌ | ❌ | SEM proveniência |
| 08 | `odu-08-ejioko.md` | ❌ | ❌ | ❌ | SEM proveniência |
| 09 | `odu-09-osa.md` | ❌ | ❌ | ❌ | SEM proveniência |
| 10 | `odu-10-ofun.md` | ❌ | ❌ | ❌ | SEM proveniência |
| 11 | `odu-11-owarin.md` | ❌ | ❌ | ❌ | SEM proveniência |
| 12 | `odu-12-ejila-xebora.md` | ❌ | ❌ | ❌ | SEM proveniência |
| 13 | `odu-13-eji-ogbe.md` | ❌ | ❌ | ❌ | SEM proveniência |
| 14 | `odu-14-ika.md` | ❌ | ❌ | ❌ | SEM proveniência |
| 15 | `odu-15-oturupon.md` | ❌ | ❌ | ❌ | SEM proveniência |
| 16 | `odu-16-otura.md` | ❌ | ❌ | ❌ | SEM proveniência |

**Resumo:** 16/16 Odus sem `source`, 16/16 sem `lineage`, 16/16 sem `provisional` explícito.

**Frente comum:** todos os 16 partilham a mesma carência estrutural — não há Odu "mais validado" que outro. Decisão D4 do roadmap (Doc 10 §5) **inteira** ainda em aberto.

---

## 3. Campos atuais presentes no frontmatter (referência)

Para cada `odu-NN-*.md` o frontmatter YAML existente já carrega (validado nos 16):

```
id, slug, title, title_en, categoria, biblioteca,
Elementos_Regentes[], Orixas_Associados[],
Numeros_Kabalisticos[], Corpos_Tantricos_Alvo[],
Odus_Associados[], Acao_Principal
```

**Observação:** `title_en` existe nos 16 (PT-BR é o título canônico; EN é derivado literal — ver Doc 25 §9 Tarefa 9 para tradução completa do corpo).

---

## 4. Trabalhos subsequentes (SubTasks 3.2 → 3.6)

Esta auditoria **bloqueia** (no sentido de pré-requisito) as seguintes SubTasks:

- **SubTask 3.2** — Para cada Odu, adicionar `source` + `lineage` (Doc 20 AD-20.3) e `provisional: true` (AD-20.4). **NÃO fazer antes da curadoria do Gabriel** — o `source` exige obra/autor verificável (regra `correspondence-source.md`).
- **SubTask 3.3** — Registrar proveniência dos 16 no `IDEIA.md` (ledger, AD-20.5). Depende da curadoria.
- **SubTask 3.4** — `docs/15_glossario-oracular.md` §1 — remover `⚠️ PROVISIONAL (D4)` do cabeçalho. **Só após 3.2 + 3.3** (regra AD-20.4 — "provisório é explícito até validação").
- **SubTask 3.5** — Bump `Doc 15` 2.1 → 2.2.
- **SubTask 3.6** — Criar `tests/grimoire/odus-validation.test.ts` — auditoria automatizada (frontmatter válido + `source`/`lineage`/`provisional` presentes).

---

## 5. Recomendação ao Gabriel (não-escopo do Claude)

Para destravar SubTask 3.2, é necessário **curadoria humana**: para cada um dos 16 Odus, indicar:

1. **Obra de referência canônica** (livro/autor/edição/página) — fontes sugeridas: *O Livro de Ifá* (Wande Abimbola), *Os Odus* (Alexankan), *Ifá — O Oráculo do Destino* (César Machado), *O Ori de Cada Um* (Ogã Afolabi), ou apontamento de babalaô/ioláxi de confiança.
2. **Linhagem** — qual tradição: Yorubá nigeriana, Candomblé Ketu, Umbanda, Ifá contemporâneo, Merindilogun, outra.
3. **Status** — se o conteúdo atual do `odu-NN-*.md` reflete fielmente a fonte ou precisa de revisão.

**O Claude NÃO vai inventar essas fontes** (instinto `agents-md-derive-not-invent-correspondences` + regra AD-20.8 — "rejeitar sem fonte").

---

## 6. Validações deste audit (verificáveis)

```bash
# Confirmar zero matches 'source:' no grimoire/ancestral/
rg '^source:' grimoire/ancestral/  # → No matches found ✅ (audit cycle 349)

# Confirmar zero matches 'lineage:'
rg '^lineage:' grimoire/ancestral/  # → No matches found ✅

# Listar os 16 arquivos (esperado: 16)
ls grimoire/ancestral/odu-*.md | wc -l  # → 16 ✅
```

---

*Audit 3.1 completo. Próximo passo: curadoria humana do Gabriel (SubTask 3.2 destrava). Esta página é a verdade-base do estado D4 em 2026-06-07.*
