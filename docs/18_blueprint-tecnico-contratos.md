<!-- NOTE: This document may be outdated. Review needed before relying on it. -->
# Documento 18 — Blueprint Técnico da Interface Única & Contratos

## Cabala dos Caminhos — LEGADO B2B

> ⚠️ **LEGADO B2B — referência histórica (não-canônico).** Este documento pertence ao produto **Cockpit Oracular / Mesa Real (B2B)**, descontinuado com o pivô para o **Sistema Akasha (B2C)**. Permanece apenas como registro do `apps/legacy-cockpit` (mantido durante a migração, depois desligado). **Visão vigente: Doc 25 (Visão Akasha) + Doc 26 (Identidade Akasha).** Não usar como fonte para o produto Akasha. Os contratos técnicos da Mesa Real (`MatrixData`, rotas `mesa-real/*`, store Zustand do cockpit) especificados aqui pertencem ao `apps/legacy-cockpit` e não regem o Akasha.

> **Tipo:** Especificação técnica **acionável** — contratos de dados, estado, API e sequência.
> **Versão:** 1.0 | **Data:** 2026-06-02
> **Relação:** operacionaliza o **Doc 17** (a visão "uma só página") com o **"como construir"**. Onde o Doc 17 decide *o quê*, este decide *os contratos*.
> **Resolve:** (a) a fragmentação do `matrixData`; (b) o carregamento dos mapas natais; (c) a orquestração da geração do dossiê.

---

## 1. Mapa do Sistema — uma página, contratos nas bordas

A página única (`/cockpit`) é uma UI fina sobre um estado local (Zustand) que conversa com **5 rotas** B2B. Toda a inteligência e a verdade vivem no servidor.

```
┌─ UI (React, /cockpit) ───────────────────────────────────────────────┐
│  CockpitOracular → CockpitSidebar (Zona A) · HouseCell×36 (Zona B)    │
│                   · HouseInputPopover · CockpitHeader · Dossiê (Zona C)│
└───────────────┬───────────────────────────────────────────────────────┘
                │  useCockpitStore (Zustand) — estado da tiragem
                ▼
┌─ API B2B (requireOperator em todas) ─────────────────────────────────┐
│  operator/auth/* · mesa-real/clients · mesa-real/save                 │
│  · mesa-real/generate · consult (SSE)                                 │
└───────────────┬───────────────────────────────────────────────────────┘
                ▼
┌─ Persistência + Inteligência ────────────────────────────────────────┐
│  Prisma (Operator, Client, Reading, Report, Consultation, ChatMessage)│
│  + camadas de inteligência (Doc 17 §5): correlation-map, glossário,   │
│    prompt-builder, theme-router, LLM (modelo por env)                 │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 2. Contrato de Dados Canônico — a Tiragem (`MatrixData`)

### 2.1 O problema (fragmentação atual)
Hoje o mesmo conceito tem **4 formas divergentes** no código:

| Origem | Forma de uma casa | Observação |
|---|---|---|
| `stores/cockpit-store.ts` (`FilledHouse`) | `{ casaNumero, carta: {numero,nome,significado}\|null, odu: OduInfo\|null }` | objeto aninhado rico |
| `api/mesa-real/save` (`CasaData`) | `{ carta: {numero,nome,significado}\|null, odu: {numero,nome,significado}\|null }` | aninhado, sem casaNumero |
| **Doc 04 §3 (`MatrixData`)** | `{ carta: number, cartaName: string, odu: number, oduName: string }` | **achatado, normalizado** |
| `api/consult` (leitura) | `{ carta: number, odu: number, cartaName?, oduName? }` | quase o do Doc 04 |

Isso gera bugs de serialização e impede contratos estáveis.

### 2.2 Decisão
> **AD-18.1 — `MatrixData` canônico = a forma achatada do Doc 04 §3.** Todas as bordas (store→save, save→DB, DB→consult, DB→report) usam **exatamente**:
> ```typescript
> type MatrixData = Record<string /* "1".."36" */, MatrixEntry | null>;
> interface MatrixEntry {
>   carta: number;      // 1..36 — número da carta cigana tirada na casa
>   cartaName: string;  // nome canônico (lenormand-cards.ts)
>   odu: number;        // 1..16 — Odu do búzio na casa
>   oduName: string;    // nome canônico (odus.ts)
> }
> ```
> O `FilledHouse` rico do store é **projetado** para `MatrixEntry` no momento do `save` (mapeando `carta.numero→carta`, `carta.nome→cartaName` etc.). `significado` **não** trafega — é derivado do glossário no servidor (anti-alucinação, Doc 15).

### 2.3 Invariante do jogo (a permutação — Doc 17 AD-17.2)
> **AD-18.2 — Invariante de unicidade das cartas.** Numa tiragem completa, as 36 cartas formam uma **permutação**: cada `carta` (1..36) aparece **no máximo uma vez** entre as casas. Os `odu` (1..16) podem repetir.
> - **Validação no `save`** (a adicionar): rejeitar `matrixData` com carta repetida → `400` com a lista de cartas duplicadas.
> - **Prevenção na UI**: o combobox de cartas do popover **oculta as já colocadas**; a Zona A exibe **"cartas restantes" (36 − colocadas)**.
> - **Tiragem completa** ⇔ 36 casas preenchidas com 36 cartas distintas + 1 Odu cada.

---

## 3. Contrato de Estado — `useCockpitStore` (Zustand)

### 3.1 Forma atual (real)
`cliente: ClienteInfo|null` · `houses: Map<number, FilledHouse>` · `activePopover: number|null` · `isSidebarCollapsed` + ações (`setCliente`, `fillHouse`, `clearHouse`, `clearAllHouses`, `setActivePopover`, `resetCockpit`) + computados (`getFilledCount`, `canGenerateDossie`).

### 3.2 Extensões necessárias (decisão)
> **AD-18.3 — O store é a fonte do estado da tiragem e deve expor:**
> - `clientId: string | null` e `readingId: string | null` — vínculo com o `Client` persistido e a `Reading` salva (hoje o store só guarda um `cliente` local com mapa *stub*).
> - `cartasUsadas(): Set<number>` e `cartasRestantes(): number[]` — derivados de `houses`, para a regra AD-18.2.
> - `status: 'draft' | 'saved' | 'generating' | 'completed' | 'error'` — espelha o ciclo da `Reading` (§7).
> - `fillHouse` deve **recusar** uma carta já usada (defesa em profundidade além da UI).
>
> O `mapa` *stub* do `ClienteInfo` (hoje preenchido com valores fixos no `handleSaveCliente`) é **proibido em produção**: os 4 mapas vêm do servidor (cálculo único, Doc 09 §5.3). O store guarda apenas o `clientId` + um resumo para badges.

---

## 4. Máquina de Estados do Card (uma casa)

```
        clique                 escolhe carta            escolhe Odu
 ┌─────────┐  ───────────▶ ┌───────────┐  ───────▶ ┌──────────────┐
 │ VAZIA   │               │ EM FOCO   │           │ COM CARTA    │
 │ (+)     │ ◀───────────  │ (popover) │ ◀───────  │ (laranja)    │
 └─────────┘   Esc/fora    └───────────┘   editar  └──────┬───────┘
      ▲                                                   │ + Odu
      │ limpar (clearHouse)                               ▼
      │                                          ┌──────────────────┐
      └──────────────────────────────────────────│ COMPLETA         │
                                                  │ carta + Odu      │
                                                  │ (laranja+royal)  │
                                                  └──────────────────┘
```
- **Visual (Doc 13):** carta = laranja (ação); badge do Odu = royal (profundidade); número em JetBrains Mono (Doc 16 AD-09).
- **Acessibilidade:** cada card é um `button` com `aria-label="Casa N — Nome"`; popover navegável por teclado (Tab entre campos, Enter confirma, Esc fecha); `fillHouse` auto-avança para a casa seguinte (UX de fricção zero).

---

## 5. Árvore de Componentes (cockpit/*) — responsabilidades

| Componente | Zona | Responsabilidade | Estado |
|---|---|---|---|
| `CockpitOracular` | — | Composição das 3 zonas; orquestra popover | lê store |
| `CockpitSidebar` | A | 4 entradas natais + badges dos mapas + "cartas restantes" | `cliente`, ações |
| `HouseCell` ×36 | B | Render do card + máquina de estados (§4) | `houses.get(n)` |
| `HouseInputPopover` | B | Entrada carta+Odu (combobox, **filtra usadas**) | `activePopover` |
| `CockpitHeader` | B | Progresso X/36, limpar mesa, logout | `getFilledCount` |
| `DossierViewer` *(a criar)* | C | Streaming do dossiê (Lora) + índice sticky | consome SSE |
| `OracleChat` *(a criar)* | C | Q&A drawer (chips de roteamento) | consome SSE |

> **AD-18.4 — Sem componentes fora desta árvore.** Qualquer card/modal/painel que não esteja aqui é cruft (Doc 17 §4.2). Em especial: **nenhum modal** (AD-17.3).

---

## 6. Contratos de API (B2B) — as 5 rotas

### 6.1 `operator/auth/{login,logout,me,register}`
- `POST login { email, password }` → set-cookie `cockpit_session` (HS256, 7d) + `{ operator }`. 401 genérico (anti-enumeração).
- `POST logout` → limpa cookie. `GET me` → `{ operator }` ou 401. Guard: `requireOperator`.

### 6.2 `GET/POST/PATCH/DELETE mesa-real/clients` — `requireOperator` ✅ (Doc 16 AD-03)
- `POST { fullName, birthDate, birthTime?, birthCity?, birthState?, birthCountry? }` → `201 { client }`.
- `PATCH { action:'updateMaps'|'update', clientId, ... }`.
> **AD-18.5 — O cálculo dos 4 mapas é server-side, único e cacheado.** Ao criar/editar um Client com data/hora/local, uma **Server Action** calcula `astrologyMap`/`kabalisticMap`/`tantricMap`/`oduBirth` (Docs 06/11) e persiste. Os mapas **nunca** vêm do frontend nem são recalculados numa leitura (exceção: ciclos pessoais, Doc 04 §1).

### 6.3 `POST mesa-real/save` — `requireOperator` ✅
- Hoje: `{ clientId, matrixData }` → cria `Reading` (status `PENDING`).
> **AD-18.6 — `save` adota o `MatrixData` canônico (AD-18.1) e valida a permutação (AD-18.2).** Resposta: `201 { reading: { id, status }, filledHouses }`. O `readingId` retornado alimenta o store (AD-18.3).

### 6.4 `POST mesa-real/generate` — `requireOperator` ✅ — **precisa de refatoração arquitetural**
- Hoje: gera **uma casa por chamada** e recebe um **`mapaFixo` achatado do corpo** (compat legada).
> **AD-18.7 — `generate` carrega os mapas do servidor por `readingId`, não do corpo.** O corpo passa a ser apenas `{ readingId }` (e opcionalmente `casaNumero` para regenerar uma casa). A rota carrega `Reading → Client (4 mapas cacheados) + matrixData` e monta o payload determinístico por casa (Doc 06). Isso elimina o vetor de adulteração de mapas pelo cliente e cumpre a fonte única (Doc 09 §5.3). Espelha o que o `consult` **já faz certo** (`getConsultContext(readingId)`).
>
> **AD-18.8 — Orquestração do dossiê completo via SSE (padrão do `consult`).** Em vez de N chamadas por casa, `generate` **transmite** (SSE) o dossiê inteiro: para cada casa preenchida emite `event: house` (3 parágrafos — Terreno/Evento/Direção, Doc 06) e ao fim `event: synthesis` (4 capítulos + veredito) e `event: done`. A `Reading` transita `PENDING → GENERATING → COMPLETED` (§7). O `Report.content` segue o shape do Doc 04 §4 (`houses` + `synthesis`).

### 6.5 `POST consult` (SSE) — `requireOperator` ✅ — **referência de boa arquitetura**
- `{ readingId, consultationId?, question }` → stream `routing` → `token*` → `done`. RAG **fechado** (Doc 12): carrega contexto do banco, roteia tema→casas, ancora no dossiê + mapas + casas tiradas. Persiste `USER`/`ORACLE` com `routedThemes`/`routedHouses`.
> É o **molde** para AD-18.8 (mesmo padrão SSE, mesma resolução de contexto por `readingId`).

---

## 7. Ciclo de Vida da Leitura (máquina de estados — `ReadingStatus`)

```
   save              generate (início)        stream done            erro LLM
 ┌────────┐  ─────▶ ┌────────────┐  ─────────▶ ┌────────────┐       ┌────────┐
 │PENDING │         │ GENERATING │             │ COMPLETED  │       │ ERROR  │
 └────────┘         └─────┬──────┘  ──────────────────────────────▶ └────────┘
   mesa salva        IA processando            dossiê pronto          retry → GENERATING
```
> **AD-18.9 — `generate` é responsável por transicionar o `status`.** Hoje a `Reading` nasce `PENDING` no `save` e nunca avança. `generate` deve marcar `GENERATING` ao iniciar e `COMPLETED`/`ERROR` ao terminar — dando à UI (e ao histórico) um estado fiel.

---

## 8. Diagramas de Sequência (fluxos canônicos)

**A — Cadastro do consulente → 4 mapas (1×, cacheados)**
```
Operador → Sidebar(ZonaA): nome/data/hora/local → POST clients
  → Server Action calcula 4 mapas (Doc 06/11) → Prisma.Client(maps) → badges
```
**B — Tiragem → save**
```
Operador preenche 36 casas (carta única + Odu) → "Salvar"
  → POST save { clientId, matrixData(canônico) } → Reading(PENDING) → readingId no store
```
**C — Gerar dossiê (streaming)**
```
"Gerar Dossiê" → POST generate { readingId } (SSE)
  → carrega mapas+matrix do banco → Reading=GENERATING
  → event:house×N (3§) → event:synthesis → Report.content → Reading=COMPLETED → event:done
```
**D — Consulta Q&A (RAG fechado)**
```
Pergunta → POST consult { readingId, question } (SSE)
  → routing(tema→casas) → contexto fechado → token* → ChatMessage(USER/ORACLE) → done
```

---

## 9. Decisões Abertas & Pendências (rastreáveis)

| ID | Pendência | Onda (Doc 17 §7) |
|---|---|---|
| AD-18.1/.6 | Unificar `MatrixData` (store/save/consult/report) | 1 |
| AD-18.2 | Invariante de permutação (UI + validação no save) | 2 |
| AD-18.3 | Store guarda `clientId`/`readingId`/`status`; remover mapa *stub* | 1 |
| AD-18.5 | Server Action de cálculo dos 4 mapas no cadastro | 4 |
| AD-18.7 | `generate` carrega mapas por `readingId` (não `mapaFixo`) | 4 |
| AD-18.8 | `generate` em SSE (dossiê completo + síntese) | 4 |
| AD-18.9 | `generate` transiciona `ReadingStatus` | 4 |

---

*Doc 18 é o contrato técnico da interface única. Onde divergir de um doc mais antigo sobre formato de `matrixData`, payload de rota ou orquestração de geração, este prevalece — subordinado ao Doc 17 (visão) e ao Doc 06 (correlação).*
