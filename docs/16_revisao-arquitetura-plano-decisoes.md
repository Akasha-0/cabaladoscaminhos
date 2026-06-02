# Documento 16 — Revisão de Arquitetura & Plano de Decisões

## Cabala dos Caminhos

> **Tipo:** Auditoria de arquitetura (Visão × Realidade) + Registro de Decisões (ADR) + Plano priorizado
> **Versão:** 1.0 | **Data:** 2026-06-02
> **Escopo:** Confrontar a documentação 00–15 com o código efetivamente implementado e fixar as melhores decisões de arquitetura para **features/funcionalidade** e para **UI/UX/Design**.
> **Relação:** o Doc 10 auditou a *documentação* (prontidão mecânica). Este Doc 16 audita a **implementação** contra essa documentação e decide o caminho.

---

## 1. Método e Veredito

A documentação (00–15) está, após as Ondas 1–3 do Doc 10, **coerente e madura na visão**: a Matriz de Correlação (36 casas), o cálculo determinístico (Doc 11), o motor de Q&A (Doc 12), a identidade Ramiro (Doc 13) e o glossário anti-alucinação (Doc 15) formam um produto B2B bem especificado.

O problema **não está mais na documentação** — está na **distância entre a visão documentada e o código implementado**. Há três classes de divergência:

| Classe | Severidade | Resumo |
|---|---|---|
| **C1 — Conflito de escopo** | 🔴 Crítica | O repositório contém uma **plataforma B2C de bem-estar** (páginas de consumidor, chakras, rituais, recomendações diárias) que o **Doc 09 §5.1 e §9 proíbem explicitamente**. É a maior decisão pendente. |
| **C2 — Fragmentação de fonte da verdade** | 🔴 Crítica | As 36 cartas têm **definições divergentes** em arquivos diferentes; a UI do cockpit (`HouseInputPopover`) usa uma lista **errada e corrompida**, quebrando a cadeia de correlação. |
| **C3 — Drift de documentação** | 🟡 Média | Docs 03 e 09 ainda descrevem **Next 14 + NextAuth + Shadcn** e uma árvore de pastas que não existe mais. A realidade é Next 16 + JWT próprio + Tailwind v4. |

**Veredito:** o motor de IA, os cálculos e o Q&A estão alinhados à visão (Fases 1–4 das Ondas anteriores entregues). O que falta para "prontidão de produto" é **decisão de plataforma** (C1), **consolidação de dados** (C2) e **reconciliação de docs** (C3) — todas registradas como ADRs abaixo.

---

## 2. Mapa: Visão (docs) × Realidade (código)

### 2.1 Stack declarada vs instalada

| Item | Docs 03/09 dizem | Código real | Situação |
|---|---|---|---|
| Framework | Next.js **14** | **Next 16.2.6** | drift |
| React | **18** | **19.2.4** | drift |
| CSS | Tailwind **3.4** + Shadcn | **Tailwind v4** (`@theme`) + Radix/shadcn | drift |
| Auth | **NextAuth.js** + `[...nextauth]` | **JWT próprio** (`jsonwebtoken`+`bcryptjs`), modelo `Operator` | drift |
| ORM | Prisma 5 | **Prisma 7.8** | drift |
| Rota IA | `/api/generate-dossier` | `/api/mesa-real/generate` | drift |
| Cockpit | `(dashboard)/nova-consulta` | `/cockpit` | drift |
| PDF | `@react-pdf` / Puppeteer | **jsPDF** (legado, não-dossiê) | drift |

> A stack **real** (Next 16 / React 19 / Tailwind v4 / Prisma 7 / JWT próprio) é **boa e mais moderna** que a documentada. A decisão (AD-08) é **atualizar os docs para a realidade**, não o contrário.

### 2.2 Os dois produtos coexistentes

```
┌──────────────────────────────────────────────────────────────┐
│  REPOSITÓRIO cabaladoscaminhos                                │
│                                                                │
│  ┌────────────────────────┐    ┌──────────────────────────┐  │
│  │  B2B — Cockpit Oracular │    │  B2C — Plataforma legada  │  │
│  │  (o que os docs querem) │    │  (o que os docs PROÍBEM) │  │
│  ├────────────────────────┤    ├──────────────────────────┤  │
│  │ /cockpit                │    │ /dashboard, /onboarding   │  │
│  │ /api/mesa-real/*        │    │ /mapa, /pricing, /profile │  │
│  │ /api/consult            │    │ chakras, rituais,         │  │
│  │ /api/operator/auth/*    │    │ recomendações diárias,    │  │
│  │ ai/correlation-map      │    │ swarm KB, life-areas,     │  │
│  │ ai/theme-router         │    │ daily-context, agents,    │  │
│  │ ai/dossier, oracle-*    │    │ MapaAlma, afirmações      │  │
│  │ calculators/*           │    │ engines/, correlation/    │  │
│  │ auth/operator-*         │    │ astrologia/ (PT, legada)  │  │
│  │ modelo Operator/Reading │    │ modelo User/JournalEntry  │  │
│  └────────────────────────┘    └──────────────────────────┘  │
│         ▲ documentado                  ▲ fora de escopo (D9§9) │
└──────────────────────────────────────────────────────────────┘
```

**Censo do schema (evidência dura do conflito).** O próprio `prisma/schema.prisma` carrega os dois mundos na mesma base:

- **B2B (produto documentado) — 6 modelos:** `Operator`, `Client`, `Reading`, `Report`, `Consultation`, `ChatMessage`. `Reading` e `Consultation` relacionam-se a **`Operator`** (não `User`).
- **B2C (legado, fora de escopo) — ~23 modelos:** `User`, `BirthChart`, `MapaNatal`, `SynastryResult`, `Chakra`, `Orixa`, `Odú`, `Sefirot`, `Elemento`, `Erva`, `FaseLua`, `DiaSemana`, `Insight`, `Reminder`, `Favorito`, `JournalEntry`, `LeituraHistorico`, `Conversa`, `Mensagem`, `Assinatura`, `Credito`, `TransacaoCredito`, `Empresa`.

> Ou seja: **~4 modelos legados para cada modelo do produto.** A migração inicial e qualquer backup carregam todo o B2C — mais um motivo para a quarentena (AD-01).

**Sintomas concretos do conflito** (todos já observados no código):
- Build quebrava por dependências do B2C (`agent-prompts-v2`, `useToast`, `notifications/templates`, `chakra/v4`) — resolvido com *stubs*, mas é dívida.
- Duas implementações de Mesa Real: `components/mesa-real/MesaRealGrid` (B2C) vs `components/cockpit/*` (B2B).
- Dois modelos de identidade: `User` (B2C) vs `Operator` (B2B).
- Duas paletas: `@theme` legado (índigo/sidebar) vs escopo `.ramiro` (laranja+royal).
- `astrologia/` (engine legada PT, aproximação própria) não está claramente ligada ao `astrologyMap` do consulente B2B.

### 2.3 Estado de implementação por módulo (visão B2B)

| Módulo (visão) | Doc | Estado no código | Lacuna |
|---|---|---|---|
| A — Consulente (cadastro + 4 mapas) | 02§B, 04 | Parcial (`/api/mesa-real/clients`) | Validar wiring map↔cadastro; astro é aproximação |
| B — Mesa Real (grid 9×4 + popover) | 02§C, 05§4 | Presente (`cockpit/*`) | **Lista de cartas do popover corrompida (C2)** |
| C — Motor de IA (dossiê 3 §) | 06, 09 | Presente (`ai/dossier`, `correlation-map`) | Streaming/persistência a confirmar |
| D — Q&A (RAG fechado) | 12 | Presente (`theme-router`, `consult`) | Atrás de flag; UI de chat a confirmar |
| E — Histórico/Dashboard | 02§E, 05§3 | A confirmar | Métricas + leituras |
| PDF do dossiê | 02§D.4, 08 S6 | **Ausente** (só PDF legado) | Fase 3 |

---

## 3. Decisões de Arquitetura — Plataforma & Escopo

> Formato ADR: **Decisão · Justificativa · Ação.** As marcadas com 🧭 dependem de confirmação do operador (Gabriel).

### AD-01 — 🧭 O produto é o Cockpit Oracular (B2B). O B2C legado sai do caminho.
- **Decisão:** declarar o **Cockpit Oracular** como o único produto. O B2C de bem-estar **não** faz parte do escopo (Doc 09 §5.1: *"NUNCA criar páginas de consumidor final… sem módulos de bem-estar genérico"*; §9 reitera).
- **Justificativa:** o conflito de escopo é a raiz da fragilidade de build, da duplicação de dados e da confusão de identidade. Manter dois produtos no mesmo deploy multiplica superfície de bug e contradiz a visão.
- **Ação (3 opções — escolher uma):**
  - **(A) Quarentena** *(recomendada)*: mover todo o B2C para `src/_legacy/` fora do roteamento, atrás de feature flag `LEGACY_B2C=off`. Remove do build de produção sem perder histórico. Reversível.
  - **(B) Remoção:** apagar o B2C. Mais limpo, irreversível sem git.
  - **(C) Fork:** extrair o B2C para outro repositório.
- **Recomendação:** **(A) Quarentena** — desbloqueia o produto, preserva o trabalho, é reversível.

### AD-02 — Fonte única de verdade das 36 cartas = `lenormand-cards.ts` (Doc 15).
- **Decisão:** `src/lib/constants/lenormand-cards.ts` (canônico, Doc 15, com `baseMeaning`/`shadow`) é a **única** definição das 36 cartas. Tudo deriva dela.
- **Justificativa:** hoje há ≥3 listas divergentes. A UI do cockpit (`HouseInputPopover`) usa uma lista **errada** (Casa 24 = "A Borboleta" em vez de "O Coração") e **corrompida** (carta 36 = `"A苹果 / Final"`, com caracteres chineses). Isso quebra a correlação: o operador seleciona uma carta cujo nome não bate com `correlation-map.ts`, e o Q&A (que roteia amor→Casa 24=Coração) fica incoerente.
- **Ação:** `HouseInputPopover` e qualquer combobox de cartas devem **importar** de `lenormand-cards.ts`. Eliminar o array `CARTAS_CIGANAS` hardcoded. `mesa-real-data.ts` (se sobreviver à AD-01) deve derivar dela ou ser quarentenado.

### AD-03 — Identidade do operador = modelo `Operator` (JWT próprio). `User` é legado.
- **Decisão:** o `Operator` (auth JWT, Fases 7–8) é a identidade canônica do B2B. O Doc 04 deve trocar o modelo `User` por `Operator` nas relações de `Reading`/`Consultation`.
- **Justificativa:** o código já implementou `Operator`+JWT; `User` pertence ao B2C. Doc 04 ainda referencia `User` — drift a corrigir.
- **Ação:** atualizar Doc 04 §1 (relações `Reading.operator`, `Consultation.operator`); confirmar `schema.prisma` consistente; documentar que NextAuth foi substituído por JWT próprio.

### AD-04 — 🧭 Astrologia: assumir a aproximação própria como MVP, com caminho para efeméride real.
- **Decisão:** `astrologia/swiss-ephemeris.ts` é uma **aproximação analítica própria** (não a Swiss Ephemeris real). Aceitável para o MVP **se** a precisão for validada; senão, plugar `astronomy-engine`/efeméride real.
- **Justificativa:** Doc 08 já prevê fallback de "precisão menor". O risco é o `astrologyMap` (Ascendente, casas) sair impreciso e contaminar a Matriz. O Ascendente exige hora/local exatos e cálculo de casas confiável.
- **Ação:** validar 3 mapas conhecidos contra uma efeméride de referência; se erro > 1°, adotar lib dedicada. Registrar a decisão de precisão no Doc 03/11.

---

## 4. Decisões de Arquitetura — Features & Funcionalidade

### AD-05 — Pipeline canônico de uma consulta (end-to-end).
Fixar o fluxo único do produto, eliminando ambiguidade entre rotas legadas e novas:

```
Cadastrar consulente → calcular 4 mapas (1x, cacheado)
   → abrir Cockpit → preencher casas (carta+Odu por slot)
   → "Gerar Dossiê" → /api/mesa-real/generate (PromptBuilder por casa, 3 §)
   → persistir Reading + Report → DossierViewer (streaming)
   → [Fase 2] "Consultar o Oráculo" → /api/consult (RAG fechado)
   → [Fase 3] Exportar PDF
```

### AD-06 — Prioridade de fechamento do MVP (o que falta para "uso real").
Ordem recomendada (cada item é uma entrega verificável):
1. **C2 — Consolidar cartas** (AD-02): cockpit usa a lista canônica. *(bug bloqueador, baixo esforço)*
2. **Wiring cadastro↔mapas**: garantir que salvar consulente calcula e persiste os 4 mapas (AD-04).
3. **Persistência da leitura**: `Reading` + `Report` salvos ao gerar dossiê; histórico por consulente.
4. **Dashboard B2B** (métricas + últimas leituras) — substitui o `/dashboard` B2C.
5. **Q&A atrás de flag** (Doc 12) — já há motor; falta UI de chat (Doc 05 §9) e persistência.
6. **PDF do dossiê** (Fase 3, Doc 08 S6) — jsPDF já está no projeto.

### AD-07 — Extensibilidade oracular permanece por contrato (Doc 14).
- **Decisão:** novos sistemas (I-Ching) entram **só** pelos 5 pontos do Doc 14; campos novos em `CorrelationEntry` são opcionais (não quebram as 36 entradas). I-Ching = Fase 2+.
- **Ação:** nenhuma agora; manter o contrato ao mexer no `correlation-map`.

---

## 5. Decisões de Arquitetura — UI/UX & Design

### AD-08 — Paleta v2 (Ramiro) é a paleta do produto; promover de escopo a raiz após AD-01.
- **Decisão:** laranja (ação) + azul royal (profundidade), Doc 13, é canônica. Hoje vive no escopo `.ramiro`; o `@theme` raiz ainda é índigo/sidebar legado.
- **Justificativa:** enquanto o B2C existir, o escopo `.ramiro` é a escolha certa (isola sem quebrar o legado). Após a quarentena (AD-01), a paleta Ramiro deve **subir** para `:root`/`@theme`, eliminando o tema legado.
- **Ação:** (curto prazo) manter `.ramiro`; (pós-AD-01) migrar tokens Ramiro para `@theme` e remover sidebar/chart legados.

### AD-09 — Tipografia: completar com **Lora** (corpo do dossiê) e **JetBrains Mono** (números).
- **Decisão:** Docs 05 §1.2 e 13 §5 especificam **Cinzel / Cormorant Garamond / JetBrains Mono / Lora**. O código carrega Cinzel + Cormorant, mas **Raleway** e **IM Fell English** no lugar de **Lora/JetBrains Mono**.
- **Justificativa:** o corpo do dossiê (Doc 05 §5: `font-family: 'Lora'`) e os números de casa monospace (`JetBrains Mono`) são parte da identidade de leitura. A divergência é puramente de carregamento de fonte.
- **Ação:** adicionar `Lora` e `JetBrains_Mono` em `layout.tsx`; mapear `--font-mono`→JetBrains e criar `--font-dossier`→Lora; aplicar Lora no `DossierViewer` e na bolha do Oráculo (Doc 12 §8).

### AD-10 — Uma só Mesa Real: o grid do cockpit (`HouseCell`), não o `MesaRealGrid` legado.
- **Decisão:** o componente canônico é `components/cockpit/*` (popover de fricção zero, estados vazio/preenchido, paleta v2 — Doc 05 §4). `components/mesa-real/MesaRealGrid` é legado.
- **Ação:** quarentenar `MesaRealGrid` com o B2C (AD-01); garantir que o cockpit cobre 100% do Doc 05 §4.

### AD-11 — Navegação do produto reflete só o B2B.
- **Decisão:** a navegação canônica (Doc 05 §2) é: **Nova Consulta (Cockpit) · Consulentes · Dashboard · Leituras**. Remover do menu qualquer item B2C (mapa pessoal, rituais, onboarding de consumidor).
- **Ação:** após AD-01, o layout do dashboard expõe só as 4 áreas B2B; rotas B2C deixam de ser navegáveis.

### AD-12 — UX do dossiê e do chat seguem Doc 05 §5/§9 (índice sticky, streaming, chips de roteamento).
- **Decisão:** manter o padrão já especificado: dois painéis (índice + conteúdo), streaming token-a-token, chips royal de transparência do roteamento no Q&A.
- **Ação:** verificar que `DossierViewer` e a tela de consulta implementam índice sticky e chips; senão, completar.

---

## 6. Correções de Drift na Documentação

Estas edições alinham os docs à realidade (a stack real é a desejada — atualizar o texto, não o código):

| Doc | Trecho | Correção |
|---|---|---|
| 03 §2 | "Next 14, React 18, Tailwind 3.4, NextAuth, Shadcn" | Next 16, React 19, Tailwind v4, **JWT próprio (Operator)**, Prisma 7 |
| 03 §3 | árvore `(dashboard)/nova-consulta`, `/api/generate-dossier` | árvore real: `/cockpit`, `/api/mesa-real/*`, `/api/consult`, `/api/operator/auth/*` |
| 03 §5 | `NEXTAUTH_SECRET/URL` | `JWT_SECRET` (auth própria); manter `OPENAI/ANTHROPIC_MODEL` |
| 08 | "NextAuth + tela de Login", "NEXTAUTH_SECRET" no go-live | "Auth JWT própria (Operator)"; `JWT_SECRET` |
| 09 §4/§6/§7 | "Next 14, NextAuth, `[...nextauth]`, `generate-dossier`" | stack/rotas reais; manter as Regras Invioláveis §5 |
| 04 §1 | modelo `User` nas relações | `Operator` (AD-03); nota: NextAuth→JWT próprio |
| 00 | índice | acrescentar **Doc 16** |

> **Importante:** as **Regras Invioláveis** (Doc 09 §5) permanecem — só mudam stack/rotas/pastas, não os princípios.

---

## 7. Plano Priorizado (Ondas)

**Onda A — Decisão de plataforma (operador):** confirmar **AD-01** (quarentena/remoção/fork) e **AD-04** (barra de precisão astro). Tudo depende de A.

**Onda B — Consolidação crítica (sem depender de A):**
1. **AD-02 / C2** — cockpit consome `lenormand-cards.ts`; remover lista hardcoded e a carta 36 corrompida.
2. **AD-09** — fontes Lora + JetBrains Mono.
3. **AD-06.2/3** — confirmar wiring cadastro↔mapas e persistência `Reading`/`Report`.

**Onda C — Reconciliação de docs (Seção 6):** atualizar 03, 08, 09, 04, 00 para a realidade.

**Onda D — Pós-decisão de plataforma (após A):**
4. **AD-01** aplicada (quarentena do B2C).
5. **AD-08** — paleta Ramiro promovida a `@theme` raiz.
6. **AD-10/11** — uma só Mesa Real + navegação B2B.

**Onda E — Fechamento de MVP:** Dashboard B2B, histórico, Q&A atrás de flag (UI Doc 05 §9), PDF do dossiê.

---

## 8. Riscos e Decisões Pendentes do Operador

| ID | Pendência | Bloqueia |
|---|---|---|
| **AD-01** | Destino do B2C legado (quarentena/remoção/fork) | Limpeza de build, paleta raiz, navegação |
| **AD-04** | Barra de precisão astrológica (aproximação vs efeméride real) | Confiabilidade do `astrologyMap` |
| **D1–D4** (Doc 10/11) | Tabelas alfanuméricas, tântricas, data→Odu, 16 Odus | Precisão dos números (hoje em defaults provisórios sinalizados) |
| **D5** (Doc 12) | Q&A entra no MVP ou pós-MVP | Escopo da Onda E |

---

*Este documento é o registro de decisões de arquitetura (visão × implementação). Onde divergir de um doc mais antigo sobre stack/rotas/pastas, o Doc 16 prevalece; onde divergir sobre identidade visual, prevalece o Doc 13; sobre cálculo, o Doc 11.*
