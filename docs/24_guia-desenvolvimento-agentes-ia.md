# Documento 24 — Guia de Desenvolvimento para Agentes de IA

## Cabala dos Caminhos · **LEIA ISTO PRIMEIRO**

> **Para quem:** todo agente de IA que **codifica** este projeto.
> **Função:** dizer, de forma clara e concisa, **como desenvolver alinhado às documentações** da pasta `/docs`.
> **Regra zero:** na dúvida, a documentação vence o código. Mudança que contraria um doc canônico **não entra**.

---

## 1. O que você está construindo (em 5 linhas)

Um **único produto, uma única página** (`/cockpit`): a **Mesa Real** com **36 casas** em cards, preenchidas com as **36 cartas do baralho cigano** (uma por casa — permutação) **+ 1 Odu por casa**. Mais os **4 dados natais** (nome de certidão, data, hora, local **geolocalizado**). Com isso, uma **IA estruturada gera o diagnóstico de cada casa** cruzando 4 mapas natais (Numerologia Cabalística, Numerologia Tântrica, Astrologia, Odu de Nascimento). É **B2B**, operador único. **Todo o resto do repositório é legado B2C quarentenado** — não desenvolva nele.

---

## 2. Mapa de leitura — qual doc responde sua pergunta

| Sua pergunta | Doc |
|---|---|
| O que é o produto / escopo? | 01, 02, **17** |
| Como é a interface (uma página, zonas, cards)? | **17**, 05 |
| Qual o contrato de dados/estado/API? (`MatrixData`, store, rotas) | **18**, 04 |
| Como a IA cruza cada casa (correlação)? | **06**, 09 §3 |
| Como calcular os números/Odu (fórmulas)? | **11** |
| Os mapas estão completos? Geolocalização? | **23**, 04 §2 |
| Significados-base das cartas/Odus (anti-alucinação)? | **15**, 20 |
| Q&A pós-dossiê (RAG fechado)? | **12** |
| Cores, tipografia, identidade? | **13** |
| Stack, auth, estrutura real, decisões? | **16** |
| Testes / qualidade / CI? | **19** |
| Governança de conteúdo (fonte das correspondências)? | **20** |
| Observabilidade, logs, custo de IA, segurança? | **22** |
| **Qual o status de cada decisão e a ordem de execução?** | **21** (painel) |
| Adicionar um sistema oracular novo (I-Ching)? | **14** |

---

## 3. Hierarquia de precedência (quem vence em conflito)

```
17 (visão/interface) ▸ 18 (contratos) ▸ 23 (mapas) ▸ 16 (arquitetura/stack)
   ▸ 13 (visual) ▸ 11 (cálculo) ▸ 06 (correlação) ▸ 20 (conteúdo)
                         ▸ 21 = painel de STATUS (não cria decisão; rastreia)
```
Docs antigos (03, 05, 09) que descrevem múltiplas telas/stack antiga são **superseded** pelos acima (já marcados).

---

## 4. A Constituição — regras invioláveis (consolidadas de todos os docs)

1. **Uma página.** Nada de novas rotas/telas. Painéis e drawers vivem dentro de `/cockpit`. (17)
2. **Sem modais.** O popover de fricção zero é a única entrada na mesa. (17 AD-17.3)
3. **Fonte única por conceito.** Cartas = `lenormand-cards.ts`; Odus = `odus.ts`; casas/correlação = `correlation-map.ts`; mapas = tipos em `src/types`. **Nunca** crie listas paralelas. (16 AD-02, 23 AD-23.3)
4. **Permutação.** As 36 cartas são distintas nas 36 casas; Odu repete. Valide no `save`. (17 AD-17.2, 18 AD-18.2)
5. **`MatrixData` canônico** (achatado, Doc 04 §3) em todas as bordas. (18 AD-18.1)
6. **Mapas natais: cálculo único, server-side, cacheado** no `Client`. Nunca recalcular numa leitura (exceto ciclos pessoais), nunca aceitar mapa do frontend. (09 §5.3, 18 AD-18.5/.7)
7. **Determinismo da correlação.** Cada casa injeta **apenas** os aspectos que a Matriz delega — zero genérico. (06)
8. **Verdade injetada, nunca inventada.** Significado vem do glossário (15); o LLM redige, não decide conteúdo oracular. Correspondência sem fonte **não entra** (ledger `IDEIA.md`). (20 AD-20.1/.2)
9. **Auth em toda rota B2B.** `requireOperator` em `mesa-real/*`, `consult`, `operator/*`. (16 AD-03)
10. **Privacidade.** Sem PII nem segredos em log; logs por ID. (22 AD-22.2)
11. **Paleta Ramiro** (laranja+royal) + tipografia (Cinzel/Cormorant/Lora/JetBrains). Nada de gold/violet/esmeralda. (13, 16 AD-09)
12. **Cirúrgico.** Não "melhore" código adjacente fora do escopo da tarefa. Não toque no legado quarentenado.

---

## 5. Como pegar e executar uma tarefa (workflow)

```
1. ABRA o painel (Doc 21) → escolha uma decisão 🟡 da onda atual (caminho crítico: 1→2→3→4).
2. LEIA o doc-fonte da AD (coluna do painel) + os docs referenciados.
3. IMPLEMENTE o mínimo cirúrgico que cumpre a AD (regra 12).
4. SE tocar conteúdo oracular → registre a fonte em IDEIA.md e passe pelo validador (20).
5. GATE antes de commitar:  build  ·  lint  ·  test:core (+ teste-guardião se aplicável, 19).
6. ATUALIZE o status no painel (Doc 21): 🟡 → ✅, com 1 linha do que foi feito.
7. COMMIT conventional (.claude/rules/commit-style.md): docs(scope)/feat(scope)/fix(scope).
```

---

## 6. Definição de "pronto" por mudança

- [ ] Cumpre a AD e **respeita a Constituição** (§4).
- [ ] Não cria fonte de verdade paralela nem nova tela/modal.
- [ ] `build` + `lint` + `test:core` verdes; teste-guardião quando a mudança toca determinismo/conteúdo/mapas (19 §4.1, 23 AD-23.6).
- [ ] Painel (Doc 21) atualizado.

---

## 7. Anti-padrões — NÃO faça

- ❌ Inventar correspondência esotérica sem fonte (20). ❌ Significado oracular "da cabeça do LLM" (15).
- ❌ Criar página/rota nova, modal, ou dashboard separado (17).
- ❌ Duplicar a lista de cartas/Odus/casas (16 AD-02).
- ❌ Recalcular mapas numa leitura ou aceitar `mapaFixo` do frontend (18 AD-18.7).
- ❌ Logar nome/data/local/dossiê ou segredos (22).
- ❌ Desenvolver no legado B2C (quarentenado por `LEGACY_B2C`).
- ❌ Mapa astral "estimado" silencioso sem geolocalização — marque `incomplete` (23 AD-23.2/.5).

---

## 8. Onde mora cada verdade (artefatos canônicos)

| Conceito | Fonte única |
|---|---|
| 36 cartas (nome, baseMeaning, shadow) | `src/lib/constants/lenormand-cards.ts` |
| 16 Odus (essence, quizila, baseAdvice) | `src/lib/constants/odus.ts` |
| 36 casas → aspectos delegados | `src/lib/ai/correlation-map.ts` |
| Roteador de temas (Q&A) | `src/lib/ai/theme-router.ts` |
| Tipos dos 4 mapas | `src/types/index.ts` |
| Calculadoras (números/Odu) | `src/lib/calculators/*` |
| Mapa astral | `src/lib/astrologia/*` (precisão: 23) |
| Estado da mesa | `src/stores/cockpit-store.ts` |
| Auth do Operator | `src/lib/auth/operator-*` |
| Ledger de correspondências | `IDEIA.md` (a criar — 20 AD-20.5) |
| **Status das decisões** | `docs/21_*` |

---

*Doc 24 é o ponto de entrada operacional para agentes de IA. Não substitui os docs canônicos — orienta como navegá-los e desenvolver alinhado. Em conflito, vale a hierarquia do §3.*
