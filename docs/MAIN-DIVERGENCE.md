# Main vs feat/community-platform - Analise

> **Snapshot:** 2026-06-27 01:39 UTC
> **Repo:** Akasha-0/cabaladoscaminhos
> **Working tree HEAD:** `feat/community-platform`
> **Metodo:** investigacao read-only via `.git/` (bash indisponivel no sandbox)

---

## Estado atual

### Refs locais

| Ref | SHA | Subject (top commit) |
|---|---|---|
| `refs/heads/main` | `645f1014b3665f96dee599ec2c8293986986cd2c` | docs(vision): pivot from Zelador tool to community platform |
| `refs/heads/feat/community-platform` | `2f2851fb4b5875316ed75074330e9e45f3b3d984` | docs(ops): auto-trigger pipeline entre waves documentado |

### Refs remotos (ultimo fetch conhecido)

| Ref | SHA | Status |
|---|---|---|
| `refs/remotes/origin/main` | `8d120439a146f8d103499c6013bf16bab68f07ad` | **DIVERGE do local** |
| `refs/remotes/origin/feat/community-platform` | `2f2851fb4b5875316ed75074330e9e45f3b3d984` | **EM SINCRONIA** com local |

> Origin/main esta **diferente do local main** — divergencia paralela nao relacionada a este report, mas merece atencao separada (ver Secao "Notas adicionais").

### Commits principais de cada branch

**`main` (ancestry linear, do mais novo ao mais antigo):**
- `645f1014` docs(vision): pivot from Zelador tool to community platform
- `e3d7bb02` feat(dashboard): redesign sub-pages with consistent styling system
- `330ebfe7` merge refactor/foice-2-align-docs: Merge made by the 'ort' strategy
- `af9833cf` pull origin main --rebase: Fast-forward
- `02ffd1fb` merge refactor/foice-v2: Merge made by the 'ort' strategy
- `62bd20d` reset: moving to origin/main
- `9331cc71` feat(consulta): implement 36-house delegation system with anti-mix safeguards

**`feat/community-platform` (ancestry linear, do mais novo ao mais antigo):**
- `2f2851fb` docs(ops): auto-trigger pipeline entre waves documentado
- `a62d102b` docs(operations): sistema 24/7 intensificado com 5 ondas pre-fabricadas
- `83c011ad` docs(operations): sistema 24/7 documentado + cadernos de bordo
- `1431dc9e` feat(landing): integrar landing de validacao /validacao + waitlist API
- `2e09955b` docs(strategy): validacao de mercado + pesquisa de UX completas
- `e241154b` docs(vision): Akasha IA como consciencia tradutora universalista + cura
- `800d2e97` docs(strategy): cadeia de pensamento estrategica completa
- `6db37ac0` refactor(routes): reorganize app/ into (community)/(personal)/(info) groups
- `7be13428` refactor(cleanup): Fase 1 — remove cockpit morto, add architecture doc
- `88b6a558` feat(community): group page with hero, tabs, sidebar
- `7ddd5d64` feat(community): public profile + explore pages
- `11464cee` feat(community): MVP feed + landing page + prisma schema
- `b9deafb0` **cherry-pick:** docs(vision): pivot from Zelador tool to community platform
- `e3d7bb02` feat(dashboard): redesign sub-pages with consistent styling system (merge-base)

---

## Divergencia

### Merge-base

**`e3d7bb02b9be512aac4c7f4da498a49694f2d4c3`** — "feat(dashboard): redesign sub-pages with consistent styling system"

Ambas branches descendem deste commit. Ele foi o ultimo estado comum antes de:
1. Local `main` adicionar `645f1014` (pivot vision)
2. Feat/community-platform ser **criada a partir de um cherry-pick** (`b9deafb0` = `645f1014` aplicado sobre `e3d7bb02`) e depois receber 11 commits adicionais.

### Numeros

| Direcao | Quantidade |
|---|---|
| **Commits em `feat/community-platform` NAO estao em `main`** | **13** |
| **Commits em `main` NAO estao em `feat/community-platform`** | **1** |

### Detalhamento: 13 commits exclusivos de feat/community-platform

| # | SHA | Subject |
|---|---|---|
| 1 | `2f2851fb` | docs(ops): auto-trigger pipeline entre waves documentado |
| 2 | `a62d102b` | docs(operations): sistema 24/7 intensificado com 5 ondas pre-fabricadas |
| 3 | `83c011ad` | docs(operations): sistema 24/7 documentado + cadernos de bordo |
| 4 | `1431dc9e` | feat(landing): integrar landing de validacao /validacao + waitlist API |
| 5 | `2e09955b` | docs(strategy): validacao de mercado + pesquisa de UX completas |
| 6 | `e241154b` | docs(vision): Akasha IA como consciencia tradutora universalista + cura |
| 7 | `800d2e97` | docs(strategy): cadeia de pensamento estrategica completa |
| 8 | `6db37ac0` | refactor(routes): reorganize app/ into (community)/(personal)/(info) groups |
| 9 | `7be13428` | refactor(cleanup): Fase 1 — remove cockpit morto, add architecture doc |
| 10 | `88b6a558` | feat(community): group page with hero, tabs, sidebar |
| 11 | `7ddd5d64` | feat(community): public profile + explore pages |
| 12 | `11464cee` | feat(community): MVP feed + landing page + prisma schema |
| 13 | `b9deafb0` | **cherry-pick:** docs(vision): pivot from Zelador tool to community platform |

### Detalhamento: 1 commit exclusivo de main

| # | SHA | Subject |
|---|---|---|
| 1 | `645f1014` | docs(vision): pivot from Zelador tool to community platform |

### Observacao critica: cherry-pick duplica o conteudo

O commit `b9deafb0` em feat/community-platform e um **cherry-pick exato** de `645f1014` em main. Confirmado pelo reflog:

```
e3d7bb02 645f1014 ... 1782479774 commit: docs(vision): pivot from Zelador tool to community platform
645f1014 e3d7bb02 ... 1782479786 checkout: moving from main to feat/dashboard-redesign-2026-06-26
e3d7bb02 b9deafb0 ... 1782479786 cherry-pick: docs(vision): pivot from Zelador tool to community platform
```

- Conteudo textual do pivot esta em **ambas** as branches.
- SHA difere porque cherry-pick gera um novo commit object.
- Para merge 3-way tradicional, git **vai reconhecer** que o conteudo ja foi aplicado e normalmente nao gera conflito (mas pode pedir "already applied").

### Caracterizacao da divergencia

- **Tipo:** divergencia assimetrica (13 vs 1).
- **Severidade:** BAIXA — feat esta claramente a frente, contem o trabalho real (codigo + docs estrategicos).
- **Risco:** o cherry-pick duplicado exige atencao no merge (pode causar empty commit ou "already applied" warning).

---

## Recomendacao

### Decisao: **MERGE (fast-forward de fato, ou merge regular)**

`feat/community-platform` e claramente a branch de **trabalho ativo**. Nela estao:
- Codigo real da plataforma comunitaria (MVP feed, profile, explore, group, prisma schema, route groups)
- Documentacao estrategica completa (cadeia de pensamento, validacao de mercado, pesquisa UX, visao Akasha IA, sistema 24/7)
- Landing page de validacao + waitlist API

`main` local tem apenas 1 commit adicional (o pivot) — e o conteudo desse commit **ja esta dentro de feat via cherry-pick**. Ou seja: nao ha trabalho novo em main que feat ainda nao tenha.

**Sequencia recomendada (3 opcoes, da melhor pra pior):**

#### Opcao A — Fast-forward real (a mais limpa)

Resetar `main` para o merge-base e fazer fast-forward para o tip de feat:

```bash
git checkout main
git reset --hard e3d7bb02b9be512aac4c7f4da498a49694f2d4c3
git merge --ff-only feat/community-platform
# main agora = 2f2851fb
git push origin main
```

**Pros:** linear, sem merge commit, cherry-pick vira no-op silencioso.
**Contras:** `git reset --hard` no main local — CUIDADO se alguem ja clonou e tem commits baseados no `645f1014`.

#### Opcao B — Merge normal (preserva historico)

```bash
git checkout main
git merge --no-ff feat/community-platform
# produz merge commit; cherry-pick b9deafb0 pode virar empty commit
git push origin main
```

**Pros:** preserva a historia dos dois caminhos.
**Contras:** cria merge commit; cherry-pick b9deafb0 pode dar warning "already applied" e gerar empty commit que precisa ser ignorado.

#### Opcao C — Rebase main em feat (intermediaria)

```bash
git checkout main
git rebase feat/community-platform
# main agora = 2f2851fb + cherry-pick do 645f1014 vira no-op
git push origin main
```

**Pros:** linear como Opcao A, sem `reset --hard`.
**Contras:** rewrite de historia local do main (mas como o 645f1014 e' cherry-pick do b9deafb0, o resultado final provavelmente nao difere da Opcao A).

### Recomendacao final: **Opcao A** (fast-forward real)

Justificativa:
1. O unico commit de main (`645f1014`) ja existe semanticamente em feat (`b9deafb0` cherry-pick).
2. Nenhum trabalho perdido no reset para `e3d7bb02` (o conteudo do `645f1014` ja foi preservado como `b9deafb0`).
3. Historia final fica linear e limpa.
4. Ja' que feat/community-platform esta' em sincronia com origin/feat/community-platform (mesmo SHA `2f2851fb`), o push do main local para origin/main nao vai criar conflito de remote tracking (a menos que origin/main tenha commits proprios — ver "Notas adicionais").

---

## Quando tudo estiver estavel

### Pre-requisitos antes de executar

- [ ] Confirmar que nenhuma branch de trabalho depende do SHA `645f1014` em main (buscar PRs ou refs)
- [ ] Confirmar que nao ha commits uncommitted no working tree
- [ ] Verificar se origin/main tem commits proprios que nao estao no local (ver "Notas adicionais")
- [ ] Coordenar com qualquer outro agente que esteja trabalhando em feat/* (para evitar novos commits mid-merge)

### Comando exato para merge feat/community-platform em main

```bash
# 1. Garantir working tree limpo
git status

# 2. Ir para main
git checkout main

# 3. Reset para o merge-base (descarta 645f1014, mas o conteudo ja esta' em feat via cherry-pick)
git reset --hard e3d7bb02b9be512aac4c7f4da498a49694f2d4c3

# 4. Fast-forward main para o tip de feat
git merge --ff-only feat/community-platform

# 5. Verificar o resultado
git log --oneline -5
# esperado: HEAD = 2f2851fb docs(ops): auto-trigger pipeline entre waves documentado
```

### Comando para fazer push

```bash
# Push do main atualizado
git push origin main

# (Opcional, se quiser limpar a branch feat depois)
# git push origin --delete feat/community-platform
# git branch -d feat/community-platform
```

### Se o push for rejeitado (origin/main tem commits proprios)

```bash
# Opcao 1: force push (cuidado, reescreve historia publica)
git push --force-with-lease origin main

# Opcao 2: merge com origin/main primeiro
git fetch origin main
git merge origin/main    # produz merge commit
# depois repetir push
git push origin main
```

---

## Notas adicionais

### Divergencia paralela entre local main e origin/main (NAO relacionada a esta task)

| Local | SHA | Subject |
|---|---|---|
| `refs/heads/main` | `645f1014` | docs(vision): pivot from Zelador tool to community platform |
| `refs/remotes/origin/main` | `8d120439` | (subject nao extraido nesta analise) |

O remote `origin/main` esta em um SHA diferente do local `main`. Isso pode significar:
- Alguem (humano ou outro agente) fez push direto no origin/main enquanto o clone local trabalhava off-line.
- O fetch foi feito em um momento onde origin/main ja' tinha divergido.

**Isto NAO foi analizado em detalhe nesta task** (foco era local main vs local feat). Antes de qualquer push para origin/main (Opcao A acima), verificar:

```bash
git fetch origin main
git log --oneline origin/main ^main | head -10    # commits em origin nao no local
git log --oneline main ^origin/main | head -10    # commits em local nao no origin
```

Se origin/main tem commits unicos, eles precisam ser preservados (merge, nao force push).

### Metodologia

Bash/Git indisponivel no sandbox cloud durante esta task. Toda a investigacao foi feita via:
- `Read` tool em `.git/HEAD`, `.git/refs/heads/*`, `.git/refs/remotes/origin/*`, `.git/logs/HEAD`, `.git/logs/refs/heads/main`, `.git/logs/refs/heads/feat/community-platform`, `.git/FETCH_HEAD`, `.git/packed-refs`, `.git/COMMIT_EDITMSG`, `.git/ORIG_HEAD`
- Pattern matching no reflog para identificar cherry-picks (`cherry-pick:`), merges (`merge ...`), resets (`reset:`) e commits (`commit:`)

### Limitacoes

- Nao foi possivel extrair o subject de `origin/main` (`8d120439`) — so temos o SHA. Para saber o que ha la', seria necessario `git fetch` + `git log` ou acesso direto ao pack file `.git/objects/pack/`.
- Nao foi possivel rodar `git diff --stat` entre as branches para listar arquivos modificados (sandbox bash dead).
- A analise assume que o merge-base e' `e3d7bb02` com base na inspecao do reflog (ancestry de ambas as branches passa por este commit).